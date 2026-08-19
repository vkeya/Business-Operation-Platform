import { prisma } from "@/lib/database/prisma";

export interface CreatePurchaseInput {
  businessId: string;
  supplierId: string;
  branchId?: string;
  warehouseId?: string;

  referenceNumber: string;
  supplierInvoiceNumber?: string;

  currency: string;
  exchangeRate?: number;

  notes?: string;

  createdBy: string;

  items: Array<{
    productId: string;
    productName: string;
    sku?: string;

    quantity: number;
    unitCost: number;

    discountAmount: number;
    taxAmount: number;
    totalAmount: number;
  }>;

  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
}

function serializePurchaseItem<
  T extends {
    quantity: { toNumber(): number };
    unitCost: { toNumber(): number };
    discountAmount: { toNumber(): number };
    taxAmount: { toNumber(): number };
    totalAmount: { toNumber(): number };
  },
>(item: T) {
  return {
    ...item,
    quantity: item.quantity.toNumber(),
    unitCost: item.unitCost.toNumber(),
    discountAmount:
      item.discountAmount.toNumber(),
    taxAmount: item.taxAmount.toNumber(),
    totalAmount:
      item.totalAmount.toNumber(),
  };
}

function serializePurchase<
  T extends {
    exchangeRate:
      | { toNumber(): number }
      | null;
    subtotal: { toNumber(): number };
    discountAmount: { toNumber(): number };
    taxAmount: { toNumber(): number };
    totalAmount: { toNumber(): number };
    items?: Array<{
      quantity: { toNumber(): number };
      unitCost: { toNumber(): number };
      discountAmount: { toNumber(): number };
      taxAmount: { toNumber(): number };
      totalAmount: { toNumber(): number };
    }>;
  },
>(purchase: T) {
  return {
    ...purchase,

    exchangeRate:
      purchase.exchangeRate?.toNumber() ??
      null,

    subtotal:
      purchase.subtotal.toNumber(),

    discountAmount:
      purchase.discountAmount.toNumber(),

    taxAmount:
      purchase.taxAmount.toNumber(),

    totalAmount:
      purchase.totalAmount.toNumber(),

    ...(purchase.items
      ? {
          items: purchase.items.map(
            serializePurchaseItem,
          ),
        }
      : {}),
  };
}

export const purchaseRepository = {
  async create(input: CreatePurchaseInput) {
    const purchase =
      await prisma.purchase.create({
        data: {
          businessId: input.businessId,
          supplierId: input.supplierId,
          branchId: input.branchId,
          warehouseId: input.warehouseId,

          referenceNumber:
            input.referenceNumber,
          supplierInvoiceNumber:
            input.supplierInvoiceNumber,

          status: "DRAFT",
          paymentStatus: "PENDING",

          currency: input.currency,
          exchangeRate:
            input.exchangeRate,

          subtotal: input.subtotal,
          discountAmount:
            input.discountAmount,
          taxAmount: input.taxAmount,
          totalAmount:
            input.totalAmount,

          notes: input.notes,
          createdBy: input.createdBy,

          items: {
            create: input.items.map(
              (item) => ({
                productId:
                  item.productId,
                productName:
                  item.productName,
                sku: item.sku,

                quantity: item.quantity,
                unitCost: item.unitCost,

                discountAmount:
                  item.discountAmount,
                taxAmount:
                  item.taxAmount,
                totalAmount:
                  item.totalAmount,
              }),
            ),
          },
        },

        include: {
          items: true,
          supplier: true,
        },
      });

    return serializePurchase(purchase);
  },

  async list(businessId: string) {
    const purchases =
      await prisma.purchase.findMany({
        where: {
          businessId,
        },
        include: {
          supplier: true,
          items: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    return purchases.map(
      serializePurchase,
    );
  },

  async findByReference(
    businessId: string,
    referenceNumber: string,
  ) {
    const purchase =
      await prisma.purchase.findUnique({
        where: {
          businessId_referenceNumber: {
            businessId,
            referenceNumber,
          },
        },
        include: {
          supplier: true,
          items: true,
        },
      });

    return purchase
      ? serializePurchase(purchase)
      : null;
  },
  
    async findById(
    businessId: string,
    purchaseId: string,
  ) {
    const purchase =
      await prisma.purchase.findFirst({
        where: {
          id: purchaseId,
          businessId,
        },
        include: {
  supplier: true,
  warehouse: true,
  items: true,
},
      });

    return purchase
      ? serializePurchase(purchase)
      : null;
  },
  
    async updateStatus(
    businessId: string,
    purchaseId: string,
    status:
      | "DRAFT"
      | "ORDERED"
      | "RECEIVED"
      | "CANCELLED",
  ) {
    const purchase =
      await prisma.purchase.update({
        where: {
          id: purchaseId,
          businessId,
        },
        data: {
          status,
        },
        include: {
          supplier: true,
          items: true,
        },
      });

    return serializePurchase(purchase);
  },
    async receivePurchase(
    businessId: string,
    purchaseId: string,
  ) {
    return prisma.$transaction(async (tx) => {
      const purchase =
        await tx.purchase.findFirst({
          where: {
            id: purchaseId,
            businessId,
          },
          include: {
            supplier: true,
            items: true,
          },
        });

      if (!purchase) {
        throw new Error(
          "Purchase not found.",
        );
      }

      if (purchase.status !== "ORDERED") {
        throw new Error(
          "Only ordered purchases can be received.",
        );
      }

      if (!purchase.warehouseId) {
        throw new Error(
          "A receiving warehouse is required.",
        );
      }

      for (const item of purchase.items) {
        const existingBalance =
          await tx.inventoryBalance.findUnique({
            where: {
              productId_warehouseId: {
                productId: item.productId,
                warehouseId: purchase.warehouseId,
              },
            },
          });

        const previousQuantity =
          existingBalance?.quantity.toNumber() ?? 0;

        const previousAverageCost =
          existingBalance?.averageCost.toNumber() ?? 0;

        const quantity =
          item.quantity.toNumber();

        const unitCost =
          item.unitCost.toNumber();

        const newQuantity =
          previousQuantity + quantity;

        const newAverageCost =
          newQuantity === 0
            ? unitCost
            : (
                previousQuantity *
                  previousAverageCost +
                quantity * unitCost
              ) / newQuantity;

        await tx.inventoryMovement.create({
          data: {
            businessId,
            productId: item.productId,
            warehouseId: purchase.warehouseId,
            type: "RECEIPT",
            quantity,
            unitCost,
            totalCost:
              quantity * unitCost,
            referenceType: "PURCHASE",
            referenceId: purchase.id,
            createdBy: purchase.createdBy,
            notes: `Received from purchase ${purchase.referenceNumber}`,
          },
        });

        await tx.inventoryBalance.upsert({
          where: {
            productId_warehouseId: {
              productId: item.productId,
              warehouseId: purchase.warehouseId,
            },
          },
          create: {
            businessId,
            productId: item.productId,
            warehouseId: purchase.warehouseId,
            quantity: newQuantity,
            reservedQuantity: 0,
            averageCost: newAverageCost,
            currency: purchase.currency,
          },
          update: {
            quantity: newQuantity,
            averageCost: newAverageCost,
            currency: purchase.currency,
          },
        });
      }

      const receivedPurchase =
        await tx.purchase.update({
          where: {
            id: purchase.id,
          },
          data: {
            status: "RECEIVED",
          },
          include: {
            supplier: true,
            items: true,
          },
        });

      return serializePurchase(
        receivedPurchase,
      );
    });
  },
  
    async cancelPurchase(
    businessId: string,
    purchaseId: string,
  ) {
    const purchase =
      await prisma.purchase.update({
        where: {
          id: purchaseId,
          businessId,
        },
        data: {
          status: "CANCELLED",
        },
        include: {
  supplier: true,
  items: true,
},
      });

    return serializePurchase(purchase);
  },
  
};