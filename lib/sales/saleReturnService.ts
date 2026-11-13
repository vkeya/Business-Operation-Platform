import { prisma } from "@/lib/database/prisma";
import { accountRepository } from "@/lib/accounting/accountRepository";
import { journalService } from "@/lib/accounting/journalService";
import { taxConfigurationService } from "@/lib/tax/taxConfigurationService";
import { calculateTax } from "@/lib/tax/taxCalculationService";
import { generateBusinessReference } from "@/lib/business/reference/referenceGenerator";
import { paymentRepository } from "@/lib/payment/paymentRepository";
import { reversePaymentAccounting } from "@/lib/accounting/posting/paymentReversalPosting";
import { getCurrencyDecimalPlaces } from "@/lib/localization/options";

interface SaleReturnItemInput {
  saleItemId: string;
  quantity: number;
}

interface CreateSaleReturnInput {
  operationId: string;
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
  if (!input.operationId.trim()) {
    throw new Error("Operation ID is required.");
  }

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

  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await prisma.$transaction(
        async (tx) => {
          const existingOperation =
            await tx.operationRequest.findUnique({
              where: {
                businessId_operationId: {
                  businessId: input.businessId,
                  operationId: input.operationId,
                },
              },
            });

          if (existingOperation) {
            if (
              existingOperation.status === "COMPLETED" &&
              existingOperation.entityId
            ) {
              const existingReturn =
                await tx.saleReturn.findFirst({
                  where: {
                    id: existingOperation.entityId,
                    businessId: input.businessId,
                  },
                  include: {
                    items: true,
                  },
                });

              if (existingReturn) {
                return existingReturn;
              }
            }

            if (
              existingOperation.status === "PROCESSING"
            ) {
              throw new Error(
                "This sale return is already being processed.",
              );
            }
          }

          await tx.operationRequest.create({
            data: {
              businessId: input.businessId,
              operationId: input.operationId,
              operation: "SALE_RETURN_CREATE",
              status: "PROCESSING",
              entityType: "SaleReturn",
              createdBy: input.createdBy,
            },
          });

          /*
           * Everything below this point must use tx.
           */

          const sale = await tx.sale.findFirst({
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

            if (
              !Number.isFinite(item.quantity) ||
              item.quantity <= 0
            ) {
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
            await tx.saleReturnItem.findMany({
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

          const returnedQuantities =
            new Map<string, number>();

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

            const originalQuantity =
              Number(saleItem.quantity);

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

          const originalTaxAmount =
            returnItems.reduce(
              (total, item) =>
                total + item.taxAmount,
              0,
            );

          const taxConfiguration =
            await taxConfigurationService.get(
              input.businessId,
            );

          const taxCalculation =
            calculateTax({
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
              client: tx,
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
  input.businessId,
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

         const payments =
           await paymentRepository.listSalePayments(
             input.businessId,
             input.saleId,
             tx,
           );

         // Only confirmed payments represent money received.
         const paidPayments = payments.filter(
           (payment) => payment.status === "PAID",
         );

         const paidAmount = paidPayments.reduce(
           (total, payment) =>
             total + Number(payment.amount),
           0,
         );
          const saleReturn =
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
                          item.saleItem.productName,
                        sku:
                          item.saleItem.sku ??
                          null,
                        quantity:
                          item.quantity,
                        unitPrice:
                          Number(
                            item.saleItem.unitPrice,
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

		 // Calculate all completed returns, including this return.
         // This query runs inside the current transaction.
         const cumulativeReturns =
           await tx.saleReturn.aggregate({
             where: {
               businessId: input.businessId,
               saleId: input.saleId,
               status: "COMPLETED",
             },
             _sum: {
               totalAmount: true,
             },
           });

         const cumulativeReturnAmount = Number(
           cumulativeReturns._sum.totalAmount ?? 0,
         );

         const remainingSaleValue = Math.max(
           0,
           Number(sale.totalAmount) - cumulativeReturnAmount,
         );

         const decimalPlaces = getCurrencyDecimalPlaces(input.currency);

         const monetaryTolerance =
           0.5 * 10 ** -decimalPlaces;
		 // Retrieve previous accounting reversals for confirmed payments.
          const reversalEntries =
            paidPayments.length > 0
              ? await tx.journalEntry.findMany({
                  where: {
                    businessId: input.businessId,
                    OR: paidPayments.map((payment) => ({
                      reference: {
                        startsWith:
                          `PAY-${payment.reference}-REVERSAL`,
                      },
                    })),
                  },
                  include: {
                    lines: {
                      select: {
                        debit: true,
                        credit: true,
                        currency: true,
                      },
                    },
                  },
                })
              : [];

          // Count the debit side only to avoid double-counting
          // the debit and credit of each balanced reversal.
          const previouslyReversedByPayment =
            new Map<string, number>();

          for (const payment of paidPayments) {
            const reversalPrefix =
              `PAY-${payment.reference}-REVERSAL`;

            const previouslyReversed =
              reversalEntries
                .filter((entry) =>
                  entry.reference.startsWith(reversalPrefix),
                )
                .reduce(
                  (total, entry) =>
                    total +
                    entry.lines
                      .filter(
                        (line) =>
                          line.currency === payment.currency,
                      )
                      .reduce(
                        (lineTotal, line) =>
                          lineTotal + Number(line.debit),
                        0,
                      ),
                  0,
                );

            previouslyReversedByPayment.set(
              payment.id,
              previouslyReversed,
            );
          }

          const previouslyReversedAmount =
            Array.from(previouslyReversedByPayment.values())
              .reduce((total, amount) => total + amount, 0);

          const refundEntitlement = Math.max(
            0,
            paidAmount - remainingSaleValue,
          );

          const additionalRefund = Math.max(
            0,
            refundEntitlement - previouslyReversedAmount,
          );
          /*
           * Inventory restoration happens BEFORE the
           * transaction commits.
           */
          if (inventoryItems.length > 0) {
            const {
              inventoryRepository,
            } = await import(
              "@/lib/inventory/inventoryRepository"
            );

            await inventoryRepository.returnStockBatch(
              {
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
              },
              tx,
            );
          }

          /*
           * Return accounting.
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

                    /*
           * Payment reversals.
           *
           * Only reverse the amount that exceeds the remaining
           * sale value, accounting for previous return reversals.
           */
          let remainingRefund = additionalRefund;

          for (const payment of paidPayments) {
            if (remainingRefund <= monetaryTolerance) {
              break;
            }

            const paymentAmount = Number(payment.amount);

            if (paymentAmount <= 0) {
              continue;
            }

            const previouslyReversed =
              previouslyReversedByPayment.get(payment.id) ?? 0;

            const availableToReverse = Math.max(
              0,
              paymentAmount - previouslyReversed,
            );

            if (availableToReverse <= monetaryTolerance) {
              continue;
            }

            const refundAmount = Math.min(
              remainingRefund,
              availableToReverse,
            );

            const amountRatio = refundAmount / paymentAmount;

            await reversePaymentAccounting({
              businessId: input.businessId,
              paymentReference: payment.reference,
              currency: payment.currency,
              createdBy: input.createdBy,
              amountRatio,
              reversalSuffix:
                `-RETURN-${saleReturn.referenceNumber}`,
              client: tx,
            });

            remainingRefund -= refundAmount;
          }

          if (remainingRefund > monetaryTolerance) {
            throw new Error(
              "Unable to allocate the return refund across sale payments.",
            );
          }

          const netPaidAmount = Math.max(
            0,
            paidAmount -
              previouslyReversedAmount -
              additionalRefund,
          );

          let paymentStatus:
            | "PENDING"
            | "PARTIAL"
            | "PAID"
            | "REFUNDED";

          if (
            remainingSaleValue <= monetaryTolerance &&
            paidAmount > monetaryTolerance &&
            netPaidAmount <= monetaryTolerance
          ) {
            paymentStatus = "REFUNDED";
          } else if (netPaidAmount <= monetaryTolerance) {
            paymentStatus = "PENDING";
          } else if (
            netPaidAmount + monetaryTolerance >= remainingSaleValue
          ) {
            paymentStatus = "PAID";
          } else {
            paymentStatus = "PARTIAL";
          }

          await paymentRepository.updateSalePaymentStatus(
            input.businessId,
            input.saleId,
            paymentStatus,
            tx,
          );

          await tx.operationRequest.update({
            where: {
              businessId_operationId: {
                businessId:
                  input.businessId,
                operationId:
                  input.operationId,
              },
            },
            data: {
              status: "COMPLETED",
              entityType: "SaleReturn",
              entityId: saleReturn.id,
              response: {
                referenceNumber:
                  saleReturn.referenceNumber,
              },
            },
          });

          return saleReturn;
        },
        {
          isolationLevel: "Serializable",
        },
      );
    } catch (error) {
      if (
        error instanceof Error &&
        "code" in error &&
        (error as { code?: string }).code ===
          "P2034" &&
        attempt < maxAttempts
      ) {
        continue;
      }

      if (
        error instanceof Error &&
        "code" in error &&
        (error as { code?: string }).code ===
          "P2002"
      ) {
        const existingOperation =
          await prisma.operationRequest.findUnique({
            where: {
              businessId_operationId: {
                businessId:
                  input.businessId,
                operationId:
                  input.operationId,
              },
            },
          });

        if (
          existingOperation?.entityId
        ) {
          const existingReturn =
            await prisma.saleReturn.findFirst({
              where: {
                id:
                  existingOperation.entityId,
                businessId:
                  input.businessId,
              },
              include: {
                items: true,
              },
            });

          if (existingReturn) {
            return existingReturn;
          }
        }
      }

      throw error;
    }
  }
}
};
