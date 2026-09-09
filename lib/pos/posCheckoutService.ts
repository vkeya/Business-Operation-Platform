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
    method: string;
    amount: number;
    currency?: string;
    reference?: string;
  };
}

export interface PosCheckoutResult {
  sale: Awaited<ReturnType<typeof saleRepository.create>>;
  payment: Awaited<
    ReturnType<typeof paymentService.createSalePayment>
  >;
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

export async function checkoutPosSale(
  input: PosCheckoutInput,
): Promise<PosCheckoutResult> {
  validateCheckoutInput(input);

  return prisma.$transaction(
    async (tx) => {
      const referenceNumber =
        await generateBusinessReference({
          businessId: input.businessId,
          referenceType: "SALE",
          prefix: "SALE",
          client: tx,
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
              input.taxAmount,

            totalAmount:
              input.totalAmount,
          },
          tx,
        );

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

          client: tx,
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
                `Inventory consumption for sale ${referenceNumber}.`,

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

        referenceNumber,

        totalAmount:
          input.totalAmount,

        currency:
          input.currency,

        customerId:
          input.customerId,

        createdBy:
          input.createdBy,

        client: tx,
      });

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