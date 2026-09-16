import { prisma } from "@/lib/database/prisma";
import { accountRepository } from "@/lib/accounting/accountRepository";
import { journalService } from "@/lib/accounting/journalService";
import { taxConfigurationService } from "@/lib/tax/taxConfigurationService";
import { calculateTax } from "@/lib/tax/taxCalculationService";
import { generateBusinessReference } from "@/lib/business/reference/referenceGenerator";
import { paymentRepository } from "@/lib/payment/paymentRepository";
import { reversePaymentAccounting } from "@/lib/accounting/posting/paymentReversalPosting";

interface SaleReturnItemInput {
  saleItemId: string;
  quantity: number;
}

interface CreateSaleReturnInput {
  businessId: string;
  saleId: string;
  warehouseId?: string | null;
  currency: string;
  exchangeRate?: number | null;
  items: SaleReturnItemInput[];
  reason?: string;
  notes?: string;
  createdBy: string;
}

export const saleReturnService = {
  async create(input: CreateSaleReturnInput) {
    if (!input.businessId.trim()) {
      throw new Error("Business context is required.");
    }

    if (!input.saleId.trim()) {
      throw new Error("Sale is required.");
    }

    if (!input.currency.trim()) {
      throw new Error("Currency is required.");
    }

    if (!input.createdBy.trim()) {
      throw new Error("Creator is required.");
    }

    if (input.items.length === 0) {
      throw new Error("At least one sale item is required.");
    }

    const sale = await prisma.sale.findFirst({
      where: {
        id: input.saleId,
        businessId: input.businessId,
      },
      include: {
        items: true,
      },
    });

    if (!sale) {
      throw new Error("Sale not found.");
    }

    if (sale.status !== "COMPLETED") {
      throw new Error(
        "Only completed sales can be returned.",
      );
    }

    if (sale.currency !== input.currency) {
      throw new Error(
        `Return currency must match sale currency ${sale.currency}.`,
      );
    }

    const requestedItems = new Map<string, number>();

    for (const item of input.items) {
      if (!item.saleItemId.trim()) {
        throw new Error("Sale item is required.");
      }

      if (!Number.isFinite(item.quantity) || item.quantity <= 0) {
        throw new Error(
          "Return quantities must be greater than zero.",
        );
      }

      if (requestedItems.has(item.saleItemId)) {
        throw new Error(
          `Sale item ${item.saleItemId} was requested more than once.`,
        );
      }

      requestedItems.set(
        item.saleItemId,
        item.quantity,
      );
    }

    const existingReturns =
      await prisma.saleReturnItem.findMany({
        where: {
          saleReturn: {
            businessId: input.businessId,
            saleId: input.saleId,
            status: "COMPLETED",
          },
        },
        select: {
          saleItemId: true,
          quantity: true,
        },
      });

    const returnedQuantities = new Map<
      string,
      number
    >();

    for (const item of existingReturns) {
      returnedQuantities.set(
        item.saleItemId,
        (returnedQuantities.get(item.saleItemId) ?? 0) +
          Number(item.quantity),
      );
    }

    type ReturnItem = {
      saleItem: (typeof sale.items)[number];
      quantity: number;
      subtotal: number;
      discountAmount: number;
      taxAmount: number;
      totalAmount: number;
    };

    const returnItems: ReturnItem[] = [];

    for (const [saleItemId, quantity] of requestedItems) {
      const saleItem = sale.items.find(
        (item) => item.id === saleItemId,
      );

      if (!saleItem) {
        throw new Error(
          `Sale item ${saleItemId} was not found.`,
        );
      }

      const originalQuantity = Number(
        saleItem.quantity,
      );

      const alreadyReturned =
        returnedQuantities.get(saleItemId) ?? 0;

      if (
        alreadyReturned + quantity >
        originalQuantity
      ) {
        throw new Error(
          `Return quantity for ${saleItem.productName} exceeds the remaining quantity available to return.`,
        );
      }

      const ratio =
        quantity / originalQuantity;

      returnItems.push({
        saleItem,
        quantity,
        subtotal:
          Number(saleItem.unitPrice) *
          quantity,
        discountAmount:
          Number(saleItem.discountAmount) *
          ratio,
        taxAmount:
          Number(saleItem.taxAmount) *
          ratio,
        totalAmount:
          Number(saleItem.totalAmount) *
          ratio,
      });
    }

    const subtotal = returnItems.reduce(
      (total, item) =>
        total + item.subtotal,
      0,
    );

    const discountAmount = returnItems.reduce(
      (total, item) =>
        total + item.discountAmount,
      0,
    );

    const originalTaxAmount = returnItems.reduce(
      (total, item) =>
        total + item.taxAmount,
      0,
    );

    const taxConfiguration =
      await taxConfigurationService.get(
        input.businessId,
      );

    const taxCalculation = calculateTax({
      subtotal,
      discountAmount,
      taxEnabled:
        sale.taxAmount.toString() !== "0",
      taxRate:
        sale.taxRate !== null
          ? Number(sale.taxRate)
          : 0,
      pricingMode:
        sale.taxPricingMode ??
        taxConfiguration.pricingMode,
    });

    const taxAmount =
      originalTaxAmount > 0
        ? taxCalculation.taxAmount
        : 0;

    const totalAmount =
      taxAmount > 0
        ? taxCalculation.totalAmount
        : subtotal - discountAmount;

    const referenceNumber =
      await generateBusinessReference({
        businessId: input.businessId,
        referenceType: "SALE_RETURN",
        prefix: "RET",
      });

    if (!sale.warehouseId) {
      throw new Error(
        "Completed sale has no warehouse for stock return.",
      );
    }

    const {
      productService,
    } = await import(
      "@/lib/inventory/productService"
    );

    const {
      inventoryService,
    } = await import(
      "@/lib/inventory/inventoryService"
    );

    const inventoryItems: Array<{
      productId: string;
      quantity: number;
    }> = [];

    for (const item of returnItems) {
      if (item.saleItem.menuItemId) {
        continue;
      }

      let inventoryQuantity =
        item.quantity;

      if (item.saleItem.sellingUnitId) {
        const sellingUnit =
          await productService.findSellingUnitById(
            item.saleItem.productId,
            item.saleItem.sellingUnitId,
          );

        if (!sellingUnit) {
          throw new Error(
            `Selling unit not found for product "${item.saleItem.productName}".`,
          );
        }

        inventoryQuantity =
          item.quantity *
          Number(sellingUnit.quantity);
      }

      inventoryItems.push({
        productId:
          item.saleItem.productId,
        quantity:
          inventoryQuantity,
      });
    }

    /*
     * Restore stock before completing the return.
     * Inventory movement references the return ID, so
     * the completed return can be audited against stock.
     */

    const payments =
      await paymentRepository.listSalePayments(
        input.businessId,
        input.saleId,
      );

    const paidAmount = payments.reduce(
      (total, payment) =>
        total + Number(payment.amount),
      0,
    );

    if (
      payments.length > 0 &&
      totalAmount > paidAmount + 0.01
    ) {
      throw new Error(
        "Return amount cannot exceed the amount already paid on the sale.",
      );
    }

    const saleReturn =
      await prisma.$transaction(
        async (tx) => {
          const createdReturn =
            await tx.saleReturn.create({
              data: {
                businessId:
                  input.businessId,
                saleId:
                  input.saleId,
                warehouseId:
                  input.warehouseId ??
                  sale.warehouseId,
                referenceNumber,
                status: "COMPLETED",
                currency:
                  input.currency,
                exchangeRate:
                  input.exchangeRate ??
                  sale.exchangeRate ??
                  null,
                subtotal,
                discountAmount,
                taxAmount,
                totalAmount,
                reason:
                  input.reason?.trim() ||
                  null,
                notes:
                  input.notes?.trim() ||
                  null,
                createdBy:
                  input.createdBy,
                items: {
                  create:
                    returnItems.map(
                      (item) => ({
                        saleItemId:
                          item.saleItem.id,
                        productId:
                          item.saleItem.productId,
                        productName:
                          item.saleItem
                            .productName,
                        sku:
                          item.saleItem.sku ??
                          null,
                        quantity:
                          item.quantity,
                        unitPrice:
                          Number(
                            item.saleItem
                              .unitPrice,
                          ),
                        discountAmount:
                          item.discountAmount,
                        taxAmount:
                          item.taxAmount,
                        totalAmount:
                          item.totalAmount,
                        sellingUnitId:
                          item.saleItem
                            .sellingUnitId ??
                          null,
                      }),
                    ),
                },
              },
              include: {
                items: true,
              },
            });

          /*
           * Return accounting:
           *
           * DR Sales Revenue
           * DR Tax Payable
           * CR Accounts Receivable
           *
           * This reverses only the returned portion,
           * not the entire original sale.
           */
          const revenueAccount =
            await accountRepository.findByCode(
              input.businessId,
              "4000",
              tx,
            );

          const receivableAccount =
            await accountRepository.findByCode(
              input.businessId,
              "1200",
              tx,
            );

          if (!revenueAccount) {
            throw new Error(
              "Sales Revenue account (4000) was not found.",
            );
          }

          if (!receivableAccount) {
            throw new Error(
              "Accounts Receivable account (1200) was not found.",
            );
          }

          const lines = [
            {
              accountId:
                revenueAccount.id,
              description:
                `Returned sales revenue for ${referenceNumber}`,
              debit:
                totalAmount - taxAmount,
              credit: 0,
            },
          ];

          if (taxAmount > 0) {
            const taxPayableAccount =
              await accountRepository.findByCode(
                input.businessId,
                "2100",
                tx,
              );

            if (!taxPayableAccount) {
              throw new Error(
                "Tax Payable account (2100) was not found.",
              );
            }

            lines.push({
              accountId:
                taxPayableAccount.id,
              description:
                `Returned tax for ${referenceNumber}`,
              debit: taxAmount,
              credit: 0,
            });
          }

          lines.push({
            accountId:
              receivableAccount.id,
            description:
              `Customer receivable reduction for ${referenceNumber}`,
            debit: 0,
            credit: totalAmount,
          });

          await journalService.create(
            {
              businessId:
                input.businessId,
              reference:
                `RETURN-${referenceNumber}`,
              description:
                `Accounting for sale return ${referenceNumber}`,
              entryDate:
                new Date(),
              createdBy:
                input.createdBy,
              currency:
                input.currency,
              lines,
            },
            tx,
          );

          return createdReturn;
        },
      );

    if (inventoryItems.length > 0) {
      await inventoryService.returnStockBatch({
        businessId:
          input.businessId,
        warehouseId:
          sale.warehouseId,
        currency:
          input.currency,
        createdBy:
          input.createdBy,
        referenceType:
          "SALE_RETURN",
        referenceId:
          saleReturn.id,
        notes:
          `Stock returned from sale ${sale.referenceNumber}.`,
        items:
          inventoryItems,
      });
    }

	let remainingRefund =
  Math.min(totalAmount, paidAmount);

for (const payment of payments) {
  if (remainingRefund <= 0.01) {
    break;
  }
  const paymentAmount =
    Number(payment.amount);

  if (paymentAmount <= 0) {
    continue;
  }

  const refundAmount =
    Math.min(
      remainingRefund,
      paymentAmount,
    );

  const amountRatio =
    refundAmount / paymentAmount;

  await reversePaymentAccounting({
    businessId:
      input.businessId,
    paymentReference:
      payment.reference,
    currency:
      payment.currency,
    createdBy:
      input.createdBy,
    amountRatio,
    reversalSuffix:
      `-RETURN-${saleReturn.referenceNumber}`,
  });

  remainingRefund -=
    refundAmount;
}

if (remainingRefund > 0.01) {
  throw new Error(
    "Unable to allocate the return refund across sale payments.",
  );
}

const remainingPaidAmount =
  Math.max(
    0,
    paidAmount - totalAmount,
  );

const paymentStatus =
  remainingPaidAmount <= 0.01
    ? "REFUNDED"
    : "PARTIAL";

await paymentRepository.updateSalePaymentStatus(
  input.businessId,
  input.saleId,
  paymentStatus,
);

    return saleReturn;
  },
};
