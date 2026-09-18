import { prisma } from "@/lib/database/prisma";

import {
  generateBusinessReference,
} from "@/lib/business/reference/referenceGenerator";

import {
  saleRepository,
  type CreateSaleInput,
} from "@/lib/sales/saleRepository";

import {
  paymentService,
} from "@/lib/payment/paymentService";

import {
  calculateTax,
} from "@/lib/tax/taxCalculationService";

import {
  inventoryRepository,
} from "@/lib/inventory/inventoryRepository";

import {
  postSaleToAccounting,
} from "@/lib/accounting/posting/salesPosting";

import {
  recipeService,
} from "@/lib/restaurant/recipeService";

import {
  productService,
} from "@/lib/inventory/productService";

import {
  mpesaPaymentService,
} from "@/lib/payment/providers/mpesa/mpesaPaymentService";

type PrismaTransactionClient =
  Parameters<typeof prisma.$transaction>[0] extends (
    client: infer T,
  ) => unknown
    ? T
    : never;

export interface PosCheckoutInput {
  businessId: string;
  branchId?: string;
  warehouseId?: string;
  customerId?: string;

  currency: string;
  exchangeRate?: number;

  createdBy: string;

  notes?: string;

  items: CreateSaleInput["items"];

  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;

  payment: {
    method: "CASH" | "MPESA" | "CARD" | "BANK" | "CREDIT";
    amount: number;
    currency?: string;
    reference?: string;
    customerPhone?: string;
  };
}

export interface PosCheckoutResult {
  sale: Awaited<
    ReturnType<typeof saleRepository.create>
  >;

  payment?: Awaited<
    ReturnType<typeof paymentService.createSalePayment>
  >;

  paymentAttempt?: {
    attemptId: string;
    status: "PENDING";
    providerReference: string | null;
    message: string;
  };
}

function validateCheckoutInput(
  input: PosCheckoutInput,
) {
  if (!input.businessId) {
    throw new Error(
      "Business context is required.",
    );
  }

  if (!input.createdBy) {
    throw new Error(
      "User context is required.",
    );
  }

  if (!input.currency.trim()) {
    throw new Error(
      "Sale currency is required.",
    );
  }

  if (!input.warehouseId) {
    throw new Error(
      "Warehouse is required for POS checkout.",
    );
  }

  if (input.items.length === 0) {
    throw new Error(
      "At least one item is required for checkout.",
    );
  }

  if (input.totalAmount <= 0) {
    throw new Error(
      "Sale total must be greater than zero.",
    );
  }

  if (input.payment.amount <= 0) {
    throw new Error(
      "Payment amount must be greater than zero.",
    );
  }

  if (
    input.payment.amount >
    input.totalAmount
  ) {
    throw new Error(
      "Payment amount cannot exceed the sale total.",
    );
  }

  if (
    input.payment.method === "MPESA" &&
    !input.payment.customerPhone?.trim()
  ) {
    throw new Error(
      "Customer phone number is required for M-Pesa payments.",
    );
  }

  for (const item of input.items) {
    if (!item.productId) {
      throw new Error(
        "Every POS item must have a product.",
      );
    }

    if (!item.productName.trim()) {
      throw new Error(
        "Every POS item must have a product name.",
      );
    }

    if (item.quantity <= 0) {
      throw new Error(
        "Item quantity must be greater than zero.",
      );
    }

    if (item.unitPrice < 0) {
      throw new Error(
        "Item unit price cannot be negative.",
      );
    }
  }
}

async function calculateCheckoutTax(
  input: PosCheckoutInput,
) {
  const taxConfiguration =
    await prisma.taxConfiguration.findUnique({
      where: {
        businessId:
          input.businessId,
      },
    });

  const taxCalculation =
    calculateTax({
      subtotal:
        input.subtotal,

      discountAmount:
        input.discountAmount,

      taxEnabled:
        taxConfiguration?.enabled ??
        false,

      taxRate:
        taxConfiguration
          ? Number(taxConfiguration.rate)
          : 0,

      pricingMode:
        taxConfiguration?.pricingMode ??
        "EXCLUSIVE",
    });

  return {
    taxConfiguration,

    calculatedTaxAmount:
      taxCalculation.taxAmount,

    calculatedTotalAmount:
      taxCalculation.totalAmount,
  };
}

async function createPosSale(
  input: PosCheckoutInput,
  tx: PrismaTransactionClient,
  calculatedTaxAmount: number,
  calculatedTotalAmount: number,
  taxConfiguration: Awaited<
    ReturnType<
      typeof prisma.taxConfiguration.findUnique
    >
  >,
) {
  const referenceNumber =
    await generateBusinessReference({
      businessId:
        input.businessId,

      referenceType:
        "SALE",

      prefix:
        "SALE",

      client:
        tx,
    });

  const sale =
    await saleRepository.create(
      {
        businessId:
          input.businessId,

        branchId:
          input.branchId,

        warehouseId:
          input.warehouseId,

        customerId:
          input.customerId,

        referenceNumber,

        currency:
          input.currency.trim(),

        exchangeRate:
          input.exchangeRate,

        notes:
          input.notes,

        createdBy:
          input.createdBy,

        items:
          input.items,

        subtotal:
          input.subtotal,

        discountAmount:
          input.discountAmount,

        taxAmount:
          calculatedTaxAmount,

        taxName:
          taxConfiguration?.enabled
            ? taxConfiguration.name
            : null,

        taxRate:
          taxConfiguration?.enabled
            ? Number(
                taxConfiguration.rate,
              )
            : null,

        taxPricingMode:
          taxConfiguration?.enabled
            ? taxConfiguration.pricingMode
            : null,

        totalAmount:
          calculatedTotalAmount,


      },
      tx,
    );

  return sale;
}

async function completeSaleOperations(
  input: PosCheckoutInput,
  sale: Awaited<
    ReturnType<typeof saleRepository.create>
  >,
  tx: PrismaTransactionClient,
  calculatedTaxAmount: number,
  calculatedTotalAmount: number,
) {
  const restaurantItems =
    input.items
      .filter(
        (item) =>
          Boolean(item.menuItemId),
      )
      .map((item) => ({
        menuItemId:
          item.menuItemId!,
        quantity:
          item.quantity,
      }));

  const inventoryItems: Array<{
    productId: string;
    quantity: number;
  }> = [];

  for (const item of input.items) {
    if (item.menuItemId) {
      continue;
    }

    let inventoryQuantity =
      item.quantity;

    if (item.sellingUnitId) {
      const sellingUnit =
        await productService.findSellingUnitById(
          item.productId,
          item.sellingUnitId,
          tx,
        );

      if (!sellingUnit) {
        throw new Error(
          `Selling unit not found for product "${item.productName}".`,
        );
      }

      inventoryQuantity =
        item.quantity *
        sellingUnit.quantity;
    }

    inventoryItems.push({
      productId:
        item.productId,

      quantity:
        inventoryQuantity,
    });
  }

  if (
    restaurantItems.length > 0 &&
    input.warehouseId
  ) {
    await recipeService.consumeSaleRecipes({
      businessId:
        input.businessId,

      warehouseId:
        input.warehouseId,

      currency:
        input.currency,

      createdBy:
        input.createdBy,

      referenceId:
        sale.id,

      items:
        restaurantItems,

      client:
        tx,
    });
  }

  if (
    inventoryItems.length > 0 &&
    input.warehouseId
  ) {
    await inventoryRepository
      .consumeStockBatchWithTx(
        tx,
        {
          businessId:
            input.businessId,

          warehouseId:
            input.warehouseId,

          currency:
            input.currency,

          createdBy:
            input.createdBy,

          referenceType:
            "SALE",

          referenceId:
            sale.id,

          notes:
            `Inventory consumption for sale ${sale.referenceNumber}.`,

          items:
            inventoryItems,
        },
      );
  }

  await postSaleToAccounting({
    businessId:
      input.businessId,

    saleId:
      sale.id,

    referenceNumber:
      sale.referenceNumber,

    totalAmount:
      calculatedTotalAmount,

    taxAmount:
      calculatedTaxAmount,

    currency:
      input.currency,

    customerId:
      input.customerId,

    createdBy:
      input.createdBy,

    client:
      tx,
  });
}

export async function checkoutPosSale(
  input: PosCheckoutInput,
): Promise<PosCheckoutResult> {
  validateCheckoutInput(input);

  const {
    taxConfiguration,
    calculatedTaxAmount,
    calculatedTotalAmount,
  } = await calculateCheckoutTax(input);

  /*
   * M-Pesa is asynchronous.
   *
   * We create the sale as DRAFT and the
   * PaymentAttempt as PENDING. Inventory,
   * sale accounting and the final Payment
   * are completed only after Safaricom
   * confirms the STK transaction.
   */
  if (
    input.payment.method === "MPESA"
  ) {
    const sale =
      await prisma.$transaction(
        async (tx) => {
          return createPosSale(
            input,
            tx,
            calculatedTaxAmount,
            calculatedTotalAmount,
            taxConfiguration,
          );
        },
      );

    try {
      const paymentAttempt =
        await mpesaPaymentService.initiatePosPayment({
          businessId:
            input.businessId,

          saleId:
            sale.id,

          amount:
            calculatedTotalAmount,

          customerPhone:
            input.payment.customerPhone!,

          createdBy:
            input.createdBy,
        });

      return {
        sale,
        paymentAttempt: {
          attemptId:
            paymentAttempt.attemptId,

          status:
            "PENDING",

          providerReference:
  paymentAttempt.providerReference ??
  null,

          message:
            paymentAttempt.message,
        },
      };
    } catch (error) {
      /*
       * STK initiation failed. Keep the sale
       * as DRAFT so it can be retried or
       * cancelled rather than pretending that
       * the sale was completed.
       */
      throw error;
    }
  }

  /*
   * Existing synchronous POS payment flow.
   */
  return prisma.$transaction(
    async (tx) => {
      const sale =
        await createPosSale(
          input,

          tx,
          calculatedTaxAmount,
          calculatedTotalAmount,
          taxConfiguration,
        );

      await completeSaleOperations(
        input,
        sale,
        tx,
        calculatedTaxAmount,
        calculatedTotalAmount,
      );

      const payment =
        await paymentService.createSalePayment(
          {
            businessId:
              input.businessId,

            saleId:
              sale.id,

            reference:
              input.payment.reference,

            method:
  input.payment.method,

            amount:
              input.payment.amount,

            currency:
              (
                input.payment.currency ||
                input.currency
              ).trim(),

            createdBy:
              input.createdBy,
          },
          tx,
        );

      const completedSale =
        await saleRepository.updateStatus(
          input.businessId,
          sale.id,
          "COMPLETED",
          tx,
        );

      return {
        sale:
          completedSale,

        payment,
      };
    },
  );
}
