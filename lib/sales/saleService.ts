import {
  saleRepository,
  type CreateSaleInput,
} from "./saleRepository";
import { postSaleToAccounting } from "@/lib/accounting/posting/salesPosting";
import { inventoryService } from "@/lib/inventory/inventoryService";
import { productService } from "@/lib/inventory/productService";
import {
  generateBusinessReference,
} from "@/lib/business/reference/referenceGenerator";
import { reverseSaleAccounting } from "@/lib/accounting/posting/salesReversalPosting";
import { reversePaymentAccounting } from "@/lib/accounting/posting/paymentReversalPosting";
import { paymentRepository } from "@/lib/payment/paymentRepository";
import { calculateTax } from "@/lib/tax/taxCalculationService";
import { taxConfigurationService } from "@/lib/tax/taxConfigurationService";
import { saleCompletionService } from "./saleCompletionService";
import { prisma } from "@/lib/database/prisma";

type PrismaTransactionClient =
  Parameters<typeof prisma.$transaction>[0] extends (
    client: infer T,
  ) => unknown
    ? T
    : never;

export type CreateSaleServiceInput =
  Omit<CreateSaleInput, "referenceNumber"> & {
    operationId: string;
  };

export const saleService = {
  async create(
    input: CreateSaleServiceInput,
  ) {
    if (!input.businessId) {
      throw new Error(
        "Business context is required.",
      );
    }

    if (!input.operationId?.trim()) {
      throw new Error(
        "Operation ID is required.",
      );
    }

    if (!input.currency) {
      throw new Error(
        "Currency is required.",
      );
    }

    if (!input.createdBy) {
      throw new Error(
        "User context is required.",
      );
    }

    if (input.items.length === 0) {
      throw new Error(
        "A sale must contain at least one item.",
      );
    }

    if (input.subtotal < 0) {
      throw new Error(
        "Subtotal cannot be negative.",
      );
    }

    if (input.discountAmount < 0) {
      throw new Error(
        "Discount amount cannot be negative.",
      );
    }

    if (input.taxAmount < 0) {
      throw new Error(
        "Tax amount cannot be negative.",
      );
    }

    if (input.totalAmount < 0) {
      throw new Error(
        "Total amount cannot be negative.",
      );
    }

    for (const item of input.items) {
      if (!item.productId) {
        throw new Error(
          "Sale item product is required.",
        );
      }

      if (item.quantity <= 0) {
        throw new Error(
          "Sale item quantity must be greater than zero.",
        );
      }

      if (item.unitPrice < 0) {
        throw new Error(
          "Sale item price cannot be negative.",
        );
      }
    }

    const taxConfiguration =
      await taxConfigurationService.get(
        input.businessId,
      );

    const taxCalculation =
      calculateTax({
        subtotal: input.subtotal,
        discountAmount:
          input.discountAmount,
        taxEnabled:
          taxConfiguration.enabled,
        taxRate:
          taxConfiguration.rate,
        pricingMode:
          taxConfiguration.pricingMode,
      });

    const calculatedTaxAmount =
      taxCalculation.taxAmount;

    const calculatedTotalAmount =
      taxCalculation.totalAmount;

    const taxName =
      taxConfiguration.enabled
        ? taxConfiguration.name
        : null;

    const taxRate =
      taxConfiguration.enabled
        ? taxConfiguration.rate
        : null;

    const taxPricingMode =
      taxConfiguration.enabled
        ? taxConfiguration.pricingMode
        : null;

    const maxAttempts = 3;

    for (
      let attempt = 1;
      attempt <= maxAttempts;
      attempt++
    ) {
      try {
        return await prisma.$transaction(
          async (tx) => {
			  if (input.customerId) {
  const customer = await tx.customer.findFirst({
    where: {
      id: input.customerId,
      businessId: input.businessId,
      isActive: true,
    },
    select: {
      id: true,
    },
  });

  if (!customer) {
    throw new Error(
      "Customer does not belong to the current business or is inactive.",
    );
  }
}

if (input.branchId) {
  const branch = await tx.branch.findFirst({
    where: {
      id: input.branchId,
      businessId: input.businessId,
      isActive: true,
    },
    select: {
      id: true,
    },
  });

  if (!branch) {
    throw new Error(
      "Branch does not belong to the current business or is inactive.",
    );
  }
}

            const operation =
              await tx.operationRequest.create({
                data: {
                  businessId:
                    input.businessId,

                  operationId:
                    input.operationId,

                  operation:
                    "SALE_CREATE",

                  status:
                    "PROCESSING",

                  entityType:
                    "SALE",

                  createdBy:
                    input.createdBy,
                },
              });

            const referenceNumber =
              await generateBusinessReference({
                businessId:
                  input.businessId,

                referenceType:
                  "SALE",

                prefix:
                  "SALE",

                client: tx,
              });

            const sale =
              await saleRepository.create(
                {
                  ...input,

                  taxAmount:
                    calculatedTaxAmount,

                  taxName,

                  taxRate,

                  taxPricingMode,

                  totalAmount:
                    calculatedTotalAmount,

                  referenceNumber,
                },
                tx,
              );

            await tx.operationRequest.update({
              where: {
                id: operation.id,
              },

              data: {
                status:
                  "COMPLETED",

                entityType:
                  "SALE",

                entityId:
                  sale.id,

                response: {
                  saleId:
                    sale.id,

                  referenceNumber:
                    sale.referenceNumber,
                },
              },
            });

            return sale;
          },
          {
            isolationLevel:
              "Serializable",
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
          const existing =
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

          if (existing?.entityId) {
            const sale =
              await saleRepository.findById(
                input.businessId,
                existing.entityId,
              );

            if (sale) {
              return sale;
            }
          }
        }

        throw error;
      }
    }

    throw new Error(
      "Unable to create sale after multiple concurrent attempts.",
    );
  },



  async list(businessId: string) {
    if (!businessId) {
      throw new Error(
        "Business context is required.",
      );
    }

    return saleRepository.list(
      businessId,
    );
  },

  async findByReference(
    businessId: string,
    referenceNumber: string,
  ) {
    if (!businessId) {
      throw new Error(
        "Business context is required.",
      );
    }

    if (!referenceNumber.trim()) {
      throw new Error(
        "Sale reference number is required.",
      );
    }

    return saleRepository.findByReference(
      businessId,
      referenceNumber.trim(),
    );
  },

  async findById(
    businessId: string,
    saleId: string,
  ) {
    if (!businessId) {
      throw new Error(
        "Business context is required.",
      );
    }

    if (!saleId) {
      throw new Error(
        "Sale is required.",
      );
    }

    return saleRepository.findById(
      businessId,
      saleId,
    );
  },

    async updateStatus(
  businessId: string,
  saleId: string,
  status:
    | "DRAFT"
    | "COMPLETED"
    | "CANCELLED"
    | "REVERSED",
) {
  if (!businessId) {
    throw new Error(
      "Business context is required.",
    );
  }

  if (!saleId) {
    throw new Error(
      "Sale is required.",
    );
  }

  const sale =
    await saleRepository.findById(
      businessId,
      saleId,
    );

  if (!sale) {
    throw new Error(
      "Sale not found.",
    );
  }

  if (sale.status === "CANCELLED") {
    throw new Error(
      "Cancelled sales cannot be changed.",
    );
  }

  if (
    sale.status === "COMPLETED" &&
    status !== "COMPLETED"
  ) {
    throw new Error(
      "Completed sales cannot be changed.",
    );
  }

  if (
    status === "COMPLETED" &&
    sale.items.length === 0
  ) {
    throw new Error(
      "A sale must contain at least one item.",
    );
  }

  if (
    status === "COMPLETED" &&
    !sale.warehouseId
  ) {
    throw new Error(
      "A warehouse is required to complete a sale.",
    );
  }

  if (
    sale.status === "DRAFT" &&
    status === "COMPLETED"
  ) {
    return saleCompletionService.completeDraftSale(
      businessId,
      saleId,
    );
  }

  if (
    sale.status === "DRAFT" &&
    status === "CANCELLED"
  ) {
    return saleRepository.updateStatus(
      businessId,
      saleId,
      status,
    );
  }

  throw new Error(
    "Draft sales can only be completed or cancelled.",
  );
},

        async reverse(
    businessId: string,
    saleId: string,
  ) {
    if (!businessId) {
      throw new Error(
        "Business context is required.",
      );
    }

    if (!saleId) {
      throw new Error(
        "Sale is required.",
      );
    }

    const operationId =
      `SALE_REVERSAL:${saleId}`;

    const maxAttempts = 3;

    for (
      let attempt = 1;
      attempt <= maxAttempts;
      attempt++
    ) {
      try {
        return await prisma.$transaction(
          async (tx) => {
            const existingOperation =
              await tx.operationRequest.findUnique({
                where: {
                  businessId_operationId: {
                    businessId,
                    operationId,
                  },
                },
              });

            if (
              existingOperation?.status ===
                "COMPLETED" &&
              existingOperation.entityId
            ) {
              const existingSale =
                await saleRepository.findById(
                  businessId,
                  existingOperation.entityId,
                  tx,
                );

              if (existingSale) {
                return existingSale;
              }
            }

            if (
              existingOperation?.status ===
              "PROCESSING"
            ) {
              throw new Error(
                "Sale reversal is already being processed.",
              );
            }

            const sale =
              await saleRepository.findById(
                businessId,
                saleId,
                tx,
              );

            if (!sale) {
              throw new Error(
                "Sale not found.",
              );
            }

            if (
              sale.status === "REVERSED"
            ) {
              await tx.operationRequest.upsert({
                where: {
                  businessId_operationId: {
                    businessId,
                    operationId,
                  },
                },
                create: {
                  businessId,
                  operationId,
                  operation:
                    "SALE_REVERSAL",
                  status: "COMPLETED",
                  entityType: "SALE",
                  entityId: sale.id,
                  createdBy:
                    sale.createdBy,
                  response: {
                    saleId: sale.id,
                    status: "REVERSED",
                  },
                },
                update: {
                  status: "COMPLETED",
                  entityType: "SALE",
                  entityId: sale.id,
                  response: {
                    saleId: sale.id,
                    status: "REVERSED",
                  },
                },
              });

              return sale;
            }

            if (sale.status !== "COMPLETED") {
              throw new Error(
                "Only completed sales can be reversed.",
              );
            }

            if (!sale.warehouseId) {
              throw new Error(
                "Completed sale has no warehouse for stock reversal.",
              );
            }

            await tx.operationRequest.create({
              data: {
                businessId,
                operationId,
                operation:
                  "SALE_REVERSAL",
                status: "PROCESSING",
                entityType: "SALE",
                entityId: sale.id,
                createdBy:
                  sale.createdBy,
              },
            });

            const restaurantItems =
              sale.items
                .filter(
                  (item) => item.menuItemId,
                )
                .map((item) => ({
                  menuItemId:
                    item.menuItemId!,
                  quantity:
                    Number(item.quantity),
                }));

            const inventoryItems: Array<{
              productId: string;
              quantity: number;
            }> = [];

            for (const item of sale.items) {
              if (item.menuItemId) {
                continue;
              }

              let inventoryQuantity =
                Number(item.quantity);

              if (item.sellingUnitId) {
                const sellingUnit =
                  await productService.findSellingUnitById(
  businessId,
  item.productId,
  item.sellingUnitId,
);

                if (!sellingUnit) {
                  throw new Error(
                    `Selling unit not found for product "${item.productName}".`,
                  );
                }

                inventoryQuantity =
                  Number(item.quantity) *
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
              restaurantItems.length > 0
            ) {
              const { recipeService } =
                await import(
                  "@/lib/restaurant/recipeService"
                );

              await recipeService.restoreSaleRecipes({
                businessId,
                warehouseId:
                  sale.warehouseId,
                currency:
                  sale.currency,
                createdBy:
                  sale.createdBy,
                referenceId:
                  sale.id,
                items:
                  restaurantItems,
                client: tx,
              });
            }

            if (
              inventoryItems.length > 0
            ) {
              await inventoryService.returnStockBatch(
                {
                  businessId,
                  warehouseId:
                    sale.warehouseId,
                  currency:
                    sale.currency,
                  createdBy:
                    sale.createdBy,
                  referenceType:
                    "SALE_REVERSAL",
                  referenceId:
                    sale.id,
                  notes:
                    `Stock restored from reversed sale ${sale.referenceNumber}.`,
                  items:
                    inventoryItems,
                },
                tx,
              );
            }

            await reverseSaleAccounting({
              businessId,
              saleId: sale.id,
              referenceNumber:
                sale.referenceNumber,
              totalAmount:
                Number(sale.totalAmount),
              currency:
                sale.currency,
              customerId:
                sale.customerId,
              createdBy:
                sale.createdBy,
              client: tx,
            });

            const payments =
              await paymentRepository.listSalePayments(
                businessId,
                sale.id,
                tx,
              );

            for (const payment of payments) {
              await reversePaymentAccounting({
                businessId,
                paymentReference:
                  payment.reference,
                currency:
                  payment.currency,
                createdBy:
                  payment.createdBy,
                client: tx,
              });
            }

            const reversedSale =
              await saleRepository.updateStatus(
                businessId,
                saleId,
                "REVERSED",
                tx,
              );

            await tx.operationRequest.update({
              where: {
                businessId_operationId: {
                  businessId,
                  operationId,
                },
              },
              data: {
                status: "COMPLETED",
                entityType: "SALE",
                entityId: reversedSale.id,
                response: {
                  saleId:
                    reversedSale.id,
                  status:
                    reversedSale.status,
                },
              },
            });

            return reversedSale;
          },
          {
            isolationLevel:
              "Serializable",
          },
        );
      } catch (error) {
        if (
          error instanceof Error &&
          "code" in error &&
          error.code === "P2034" &&
          attempt < maxAttempts
        ) {
          continue;
        }

        if (
          error instanceof Error &&
          "code" in error &&
          error.code === "P2002"
        ) {
          const existingOperation =
            await prisma.operationRequest.findUnique({
              where: {
                businessId_operationId: {
                  businessId,
                  operationId,
                },
              },
            });

          if (
            existingOperation?.status ===
              "COMPLETED" &&
            existingOperation.entityId
          ) {
            const existingSale =
              await saleRepository.findById(
                businessId,
                existingOperation.entityId,
              );

            if (existingSale) {
              return existingSale;
            }
          }
        }

        throw error;
      }
    }

    throw new Error(
      "Sale reversal could not be completed after multiple concurrent attempts.",
    );
  },

    async cancel(
    businessId: string,
    saleId: string,
  ) {
    if (!businessId) {
      throw new Error(
        "Business context is required.",
      );
    }

    if (!saleId) {
      throw new Error(
        "Sale is required.",
      );
    }

    const sale =
      await saleRepository.findById(
        businessId,
        saleId,
      );

    if (!sale) {
      throw new Error(
        "Sale not found.",
      );
    }

    if (sale.status === "COMPLETED") {
      throw new Error(
        "Completed sales must be reversed instead of cancelled.",
      );
    }

    if (sale.status === "CANCELLED") {
      throw new Error(
        "Sale is already cancelled.",
      );
    }

    return saleRepository.cancel(
      businessId,
      saleId,
    );
  },
};