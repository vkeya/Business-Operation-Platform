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
) {
    const movements =
  await prisma.inventoryMovement.findMany({
    where: {
  businessId,
  ...(productId ? { productId } : {}),
  ...(warehouseId ? { warehouseId } : {}),
  ...(movementType ? { type: movementType } : {}),
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
};