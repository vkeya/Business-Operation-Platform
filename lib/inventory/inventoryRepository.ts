import { prisma } from "@/lib/database/prisma";


function serializeMovement<
  T extends {
    quantity: { toNumber(): number };
    unitCost: { toNumber(): number } | null;
    totalCost: { toNumber(): number } | null;
  },
>(movement: T) {
  return {
    ...movement,
    quantity: movement.quantity.toNumber(),
    unitCost: movement.unitCost?.toNumber() ?? null,
    totalCost: movement.totalCost?.toNumber() ?? null,
  };
}

function serializeBalance<
  T extends {
    quantity: { toNumber(): number };
    reservedQuantity: { toNumber(): number };
    averageCost: { toNumber(): number };
  },
>(balance: T) {
  return {
    ...balance,
    quantity: balance.quantity.toNumber(),
    reservedQuantity:
      balance.reservedQuantity.toNumber(),
    averageCost: balance.averageCost.toNumber(),
  };
}

export const inventoryRepository = {

	async adjustStock(input: {
  businessId: string;
  productId: string;
  warehouseId: string;
  quantity: number;
  unitCost?: number;
  currency: string;
  createdBy: string;
  notes?: string;
}) {
  if (input.quantity === 0) {
    throw new Error(
      "Adjustment quantity cannot be zero.",
    );
  }

  if (
    input.unitCost !== undefined &&
    input.unitCost < 0
  ) {
    throw new Error(
      "Unit cost cannot be negative.",
    );
  }

  return prisma.$transaction(async (tx) => {
    const existingBalance =
      await tx.inventoryBalance.findUnique({
        where: {
          productId_warehouseId: {
            productId: input.productId,
            warehouseId: input.warehouseId,
          },
        },
      });

    const previousQuantity =
      existingBalance?.quantity.toNumber() ?? 0;

    const newQuantity =
      previousQuantity + input.quantity;

    if (newQuantity < 0) {
      throw new Error(
        "Adjustment would result in negative stock.",
      );
    }

    const currentAverageCost =
      existingBalance?.averageCost.toNumber() ??
      input.unitCost ??
      0;

    const movement =
      await tx.inventoryMovement.create({
        data: {
          businessId: input.businessId,
          productId: input.productId,
          warehouseId: input.warehouseId,
          type: "ADJUSTMENT",
          quantity: input.quantity,
          unitCost:
            input.unitCost ?? currentAverageCost,
          totalCost:
            input.quantity *
            (input.unitCost ??
              currentAverageCost),
          createdBy: input.createdBy,
          notes: input.notes,
        },
      });

    const balance =
      await tx.inventoryBalance.upsert({
        where: {
          productId_warehouseId: {
            productId: input.productId,
            warehouseId: input.warehouseId,
          },
        },
        create: {
          businessId: input.businessId,
          productId: input.productId,
          warehouseId: input.warehouseId,
          quantity: newQuantity,
          reservedQuantity: 0,
          averageCost:
            input.unitCost ??
            currentAverageCost,
          currency: input.currency,
        },
        update: {
          quantity: newQuantity,
          currency: input.currency,
        },
      });

    return {
      movement: serializeMovement(movement),
      balance: serializeBalance(balance),
    };
  });
},

	async receiveStock(input: {
  businessId: string;
  productId: string;
  warehouseId: string;
  quantity: number;
  unitCost: number;
  currency: string;
  createdBy: string;
  notes?: string;
}) {
  if (input.quantity <= 0) {
    throw new Error(
      "Receipt quantity must be greater than zero.",
    );
  }

  if (input.unitCost < 0) {
    throw new Error(
      "Unit cost cannot be negative.",
    );
  }

  return prisma.$transaction(async (tx) => {
    const existingBalance =
      await tx.inventoryBalance.findUnique({
        where: {
          productId_warehouseId: {
            productId: input.productId,
            warehouseId: input.warehouseId,
          },
        },
      });

    const previousQuantity =
      existingBalance?.quantity.toNumber() ?? 0;

    const previousAverageCost =
      existingBalance?.averageCost.toNumber() ?? 0;

    const newQuantity =
      previousQuantity + input.quantity;

    const newAverageCost =
      newQuantity === 0
        ? input.unitCost
        : (
            previousQuantity *
              previousAverageCost +
            input.quantity * input.unitCost
          ) / newQuantity;

    const movement =
      await tx.inventoryMovement.create({
        data: {
          businessId: input.businessId,
          productId: input.productId,
          warehouseId: input.warehouseId,
          type: "RECEIPT",
          quantity: input.quantity,
          unitCost: input.unitCost,
          totalCost:
            input.quantity * input.unitCost,

          createdBy: input.createdBy,
          notes: input.notes,
        },
      });

    const balance =
      await tx.inventoryBalance.upsert({
        where: {
          productId_warehouseId: {
            productId: input.productId,
            warehouseId: input.warehouseId,
          },
        },
        create: {
          businessId: input.businessId,
          productId: input.productId,
          warehouseId: input.warehouseId,
          quantity: newQuantity,
          reservedQuantity: 0,
          averageCost: newAverageCost,
          currency: input.currency,
        },
        update: {
          quantity: newQuantity,
          averageCost: newAverageCost,
          currency: input.currency,
        },
      });

    return {
  movement: serializeMovement(movement),
  balance: serializeBalance(balance),
};
  });
},

async transferStock(input: {
  businessId: string;
  productId: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  quantity: number;
  currency: string;
  createdBy: string;
  notes?: string;
}) {
  if (input.quantity <= 0) {
    throw new Error(
      "Transfer quantity must be greater than zero.",
    );
  }

  if (
    input.fromWarehouseId ===
    input.toWarehouseId
  ) {
    throw new Error(
      "Source and destination warehouses must be different.",
    );
  }

  return prisma.$transaction(async (tx) => {
    const sourceBalance =
      await tx.inventoryBalance.findUnique({
        where: {
          productId_warehouseId: {
            productId: input.productId,
            warehouseId:
              input.fromWarehouseId,
          },
        },
      });

    const sourceQuantity =
      sourceBalance?.quantity.toNumber() ?? 0;

    if (
      sourceQuantity < input.quantity
    ) {
      throw new Error(
        "Transfer would result in negative stock.",
      );
    }

    const sourceAverageCost =
      sourceBalance?.averageCost.toNumber() ??
      0;

    const destinationBalance =
      await tx.inventoryBalance.findUnique({
        where: {
          productId_warehouseId: {
            productId: input.productId,
            warehouseId:
              input.toWarehouseId,
          },
        },
      });

    const destinationQuantity =
      destinationBalance?.quantity.toNumber() ??
      0;

    const destinationAverageCost =
      destinationBalance?.averageCost.toNumber() ??
      sourceAverageCost;

    const newSourceQuantity =
      sourceQuantity - input.quantity;

    const newDestinationQuantity =
      destinationQuantity + input.quantity;

    const transferCost =
      input.quantity * sourceAverageCost;

    const transferOut =
      await tx.inventoryMovement.create({
        data: {
          businessId: input.businessId,
          productId: input.productId,
          warehouseId:
            input.fromWarehouseId,
          type: "TRANSFER_OUT",
          quantity: input.quantity,
          unitCost: sourceAverageCost,
          totalCost: transferCost,
          createdBy: input.createdBy,
          notes: input.notes,
        },
      });

    const transferIn =
      await tx.inventoryMovement.create({
        data: {
          businessId: input.businessId,
          productId: input.productId,
          warehouseId:
            input.toWarehouseId,
          type: "TRANSFER_IN",
          quantity: input.quantity,
          unitCost: sourceAverageCost,
          totalCost: transferCost,
          createdBy: input.createdBy,
          notes: input.notes,
        },
      });

    const sourceBalanceUpdated =
      await tx.inventoryBalance.upsert({
        where: {
          productId_warehouseId: {
            productId: input.productId,
            warehouseId:
              input.fromWarehouseId,
          },
        },
        create: {
          businessId: input.businessId,
          productId: input.productId,
          warehouseId:
            input.fromWarehouseId,
          quantity: newSourceQuantity,
          reservedQuantity: 0,
          averageCost: sourceAverageCost,
          currency: input.currency,
        },
        update: {
          quantity: newSourceQuantity,
        },
      });

    const destinationBalanceUpdated =
      await tx.inventoryBalance.upsert({
        where: {
          productId_warehouseId: {
            productId: input.productId,
            warehouseId:
              input.toWarehouseId,
          },
        },
        create: {
          businessId: input.businessId,
          productId: input.productId,
          warehouseId:
            input.toWarehouseId,
          quantity: newDestinationQuantity,
          reservedQuantity: 0,
          averageCost: sourceAverageCost,
          currency: input.currency,
        },
        update: {
          quantity: newDestinationQuantity,
          averageCost:
            destinationQuantity === 0
              ? sourceAverageCost
              : (
                  destinationQuantity *
                    destinationAverageCost +
                  input.quantity *
                    sourceAverageCost
                ) /
                  newDestinationQuantity,
        },
      });

    return {
      transferOut:
        serializeMovement(transferOut),
      transferIn:
        serializeMovement(transferIn),
      sourceBalance:
        serializeBalance(
          sourceBalanceUpdated,
        ),
      destinationBalance:
        serializeBalance(
          destinationBalanceUpdated,
        ),
    };
  });
},

  async getBalance(
    businessId: string,
    productId: string,
    warehouseId: string,
  ) {
    const balance =
  await prisma.inventoryBalance.findUnique({
    where: {
      productId_warehouseId: {
        productId,
        warehouseId,
      },
    },
  });

return balance
  ? serializeBalance(balance)
  : null;
  },

  async listBalances(
    businessId: string,
    productId?: string,
    warehouseId?: string,
  ) {
    const balances =
  await prisma.inventoryBalance.findMany({
    where: {
      businessId,
      ...(productId ? { productId } : {}),
      ...(warehouseId ? { warehouseId } : {}),
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

return balances.map(serializeBalance);
  },

  async listMovements(
  businessId: string,
  productId?: string,
  warehouseId?: string,
  movementType?:
    | "RECEIPT"
    | "SALE"
    | "RETURN"
    | "ADJUSTMENT"
    | "TRANSFER_IN"
    | "TRANSFER_OUT"
    | "DAMAGE"
    | "EXPIRY",
  fromDate?: Date,
  toDate?: Date,
) {
    const movements =
  await prisma.inventoryMovement.findMany({
    where: {
  businessId,
  ...(productId ? { productId } : {}),
  ...(warehouseId ? { warehouseId } : {}),
  ...(movementType ? { type: movementType } : {}),
  ...(fromDate || toDate
    ? {
        createdAt: {
          ...(fromDate
            ? { gte: fromDate }
            : {}),
          ...(toDate
            ? { lte: toDate }
            : {}),
        },
      }
    : {}),
},
    include: {
      product: {
        select: {
          name: true,
          sku: true,
        },
      },
      warehouse: {
        select: {
          name: true,
          code: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

return movements.map(serializeMovement);
  },



  async consumeStock(input: {
    businessId: string;
    productId: string;
    warehouseId: string;
    quantity: number;
    currency: string;
    createdBy: string;
    referenceType?: string;
    referenceId?: string;
    notes?: string;
  }) {
    if (input.quantity <= 0) {
      throw new Error(
        "Consumption quantity must be greater than zero.",
      );
    }

    return prisma.$transaction(async (tx) => {
      const existingBalance =
        await tx.inventoryBalance.findUnique({
          where: {
            productId_warehouseId: {
              productId: input.productId,
              warehouseId: input.warehouseId,
            },
          },
        });

      const currentQuantity =
        existingBalance?.quantity.toNumber() ?? 0;

      if (currentQuantity < input.quantity) {
        throw new Error(
          "Insufficient stock for consumption.",
        );
      }

      const averageCost =
        existingBalance?.averageCost.toNumber() ?? 0;

      const newQuantity =
        currentQuantity - input.quantity;

      const totalCost =
        input.quantity * averageCost;

      const movement =
        await tx.inventoryMovement.create({
          data: {
            businessId: input.businessId,
            productId: input.productId,
            warehouseId: input.warehouseId,
            type: "SALE",
            quantity: input.quantity,
            unitCost: averageCost,
            totalCost,
            referenceType:
              input.referenceType,
            referenceId:
              input.referenceId,
            createdBy: input.createdBy,
            notes: input.notes,
          },
        });

      const balance =
        await tx.inventoryBalance.update({
          where: {
            productId_warehouseId: {
              productId: input.productId,
              warehouseId: input.warehouseId,
            },
          },
          data: {
            quantity: newQuantity,
            currency: input.currency,
          },
        });

      return {
        movement:
          serializeMovement(movement),
        balance:
          serializeBalance(balance),
      };
    });
  },

    async consumeStockBatch(input: {
    businessId: string;
    warehouseId: string;
    currency: string;
    createdBy: string;
    referenceType?: string;
    referenceId?: string;
    notes?: string;
    items: Array<{
      productId: string;
      quantity: number;
    }>;
  }) {
    if (input.items.length === 0) {
      throw new Error(
        "At least one stock consumption item is required.",
      );
    }

    for (const item of input.items) {
      if (item.quantity <= 0) {
        throw new Error(
          "Consumption quantity must be greater than zero.",
        );
      }
    }

    return prisma.$transaction(async (tx) => {
      const results = [];

      for (const item of input.items) {
        const existingBalance =
          await tx.inventoryBalance.findUnique({
            where: {
              productId_warehouseId: {
                productId: item.productId,
                warehouseId: input.warehouseId,
              },
            },
          });

        const currentQuantity =
          existingBalance?.quantity.toNumber() ?? 0;

        if (currentQuantity < item.quantity) {
          throw new Error(
            `Insufficient stock for product "${item.productId}".`,
          );
        }

        const averageCost =
          existingBalance?.averageCost.toNumber() ?? 0;

        const newQuantity =
          currentQuantity - item.quantity;

        const totalCost =
          item.quantity * averageCost;

        const movement =
          await tx.inventoryMovement.create({
            data: {
              businessId: input.businessId,
              productId: item.productId,
              warehouseId: input.warehouseId,
              type: "SALE",
              quantity: item.quantity,
              unitCost: averageCost,
              totalCost,
              referenceType:
                input.referenceType,
              referenceId:
                input.referenceId,
              createdBy: input.createdBy,
              notes: input.notes,
            },
          });

        const balance =
          await tx.inventoryBalance.update({
            where: {
              productId_warehouseId: {
                productId: item.productId,
                warehouseId: input.warehouseId,
              },
            },
            data: {
              quantity: newQuantity,
              currency: input.currency,
            },
          });

        results.push({
          movement:
            serializeMovement(movement),
          balance:
            serializeBalance(balance),
        });
      }

      return results;
    });
  },

};