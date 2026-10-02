import { pharmacyBatchReceivingService } from "@/lib/pharmacy/receiving/pharmacyBatchReceivingService";
import { prisma } from "@/lib/database/prisma";
import { Prisma } from "../../generated/prisma/client";

type PrismaTransactionClient =
  Parameters<typeof prisma.$transaction>[0] extends (
    client: infer T,
  ) => unknown
    ? T
    : never;

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

async function consumeLiquidContainersWithTx(
  tx: Prisma.TransactionClient,
  input: {
    businessId: string;
    productId: string;
    warehouseId: string;
    quantity: number;
  },
) {
  let remainingToConsume = input.quantity;

  const openContainers =
    await tx.inventoryContainer.findMany({
      where: {
        businessId: input.businessId,
        productId: input.productId,
        warehouseId: input.warehouseId,
        status: "OPEN",
        remainingQuantity: { gt: 0 },
      },
      orderBy: {
        receivedAt: "asc",
      },
    });

  const sealedContainers =
    await tx.inventoryContainer.findMany({
      where: {
        businessId: input.businessId,
        productId: input.productId,
        warehouseId: input.warehouseId,
        status: "SEALED",
        remainingQuantity: { gt: 0 },
      },
      orderBy: {
        receivedAt: "asc",
      },
    });

  const containers = [
    ...openContainers,
    ...sealedContainers,
  ];

  for (const container of containers) {
    if (remainingToConsume <= 0) {
      break;
    }

    const available =
      container.remainingQuantity.toNumber();

    const consumed = Math.min(
      available,
      remainingToConsume,
    );

    const nextRemaining = available - consumed;

    const updated =
      await tx.inventoryContainer.updateMany({
        where: {
          id: container.id,
          remainingQuantity:
            container.remainingQuantity,
        },
        data: {
          remainingQuantity: nextRemaining,
          status:
            nextRemaining === 0
              ? "EMPTY"
              : "OPEN",
        },
      });

    if (updated.count !== 1) {
      throw new Error(
        "Liquid container changed while stock was being consumed. Please retry the sale.",
      );
    }

    remainingToConsume -= consumed;
  }

  if (remainingToConsume > 0) {
    throw new Error(
      `Insufficient liquid stock for product "${input.productId}".`,
    );
  }
}

export const inventoryRepository = {

	  async findMovementsByReference(
    businessId: string,
    referenceType: string,
    referenceId: string,
  ) {
    return prisma.inventoryMovement.findMany({
      where: {
        businessId,
        referenceType,
        referenceId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  },

	async adjustStock(input: {
  businessId: string;
  operationId: string;
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
              const existingMovement =
                await tx.inventoryMovement.findFirst({
                  where: {
                    id: existingOperation.entityId,
                    businessId: input.businessId,
                  },
                });

              if (existingMovement) {
                const existingBalance =
                  await tx.inventoryBalance.findUnique({
                    where: {
                      productId_warehouseId: {
                        productId: existingMovement.productId,
                        warehouseId: existingMovement.warehouseId,
                      },
                    },
                  });

                if (existingBalance) {
                  return {
                    movement:
                      serializeMovement(existingMovement),
                    balance:
                      serializeBalance(existingBalance),
                  };
                }
              }
            }

            if (
              existingOperation.status === "PROCESSING"
            ) {
              throw new Error(
                "This inventory adjustment operation is already being processed.",
              );
            }
          }

          const operation =
            await tx.operationRequest.create({
              data: {
                businessId: input.businessId,
                operationId: input.operationId,
                operation: "INVENTORY_ADJUSTMENT",
                status: "PROCESSING",
                entityType: "INVENTORY_MOVEMENT",
                createdBy: input.createdBy,
              },
            });

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

		  await tx.operationRequest.update({
            where: {
              id: operation.id,
            },
            data: {
              status: "COMPLETED",
              entityId: movement.id,
              response: {
                movementId: movement.id,
                productId: input.productId,
                warehouseId: input.warehouseId,
                quantity: input.quantity,
              },
            },
          });

          return {
            movement: serializeMovement(movement),
            balance: serializeBalance(balance),
          };
        },
        {
          isolationLevel: "Serializable",
        },
      );
    } catch (error: unknown) {
      const prismaError = error as {
        code?: string;
      };

      if (
        prismaError.code === "P2034" &&
        attempt < maxAttempts
      ) {
        continue;
      }

      if (prismaError.code === "P2002") {
        const existingOperation =
          await prisma.operationRequest.findUnique({
            where: {
              businessId_operationId: {
                businessId: input.businessId,
                operationId: input.operationId,
              },
            },
          });

        if (
          existingOperation?.status === "COMPLETED" &&
          existingOperation.entityId
        ) {
          const existingMovement =
            await prisma.inventoryMovement.findFirst({
              where: {
                id: existingOperation.entityId,
                businessId: input.businessId,
              },
            });

          if (existingMovement) {
            const existingBalance =
              await prisma.inventoryBalance.findUnique({
                where: {
                  productId_warehouseId: {
                    productId:
                      existingMovement.productId,
                    warehouseId:
                      existingMovement.warehouseId,
                  },
                },
              });

            if (existingBalance) {
              return {
                movement:
                  serializeMovement(existingMovement),
                balance:
                  serializeBalance(existingBalance),
              };
            }
          }
        }
      }

      throw error;
    }
  }

  throw new Error(
    "Inventory adjustment failed after maximum retry attempts.",
  );
},

	  async receiveStock(input: {
  operationId: string;
  businessId: string;
  productId: string;
  warehouseId: string;
  quantity: number;
  unitCost: number;
  currency: string;
  createdBy: string;
   containerType?:
    | "BOTTLE"
    | "KEG"
    | "CAN"
    | "JAR"
    | "OTHER";

  containerCapacityQuantity?: number;
  containerUnit?: string;
  notes?: string;
  batchNumber?: string;
  manufacturingDate?: string;
  expiryDate?: string;
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

    const maxAttempts = 3;

    for (
      let attempt = 1;
      attempt <= maxAttempts;
      attempt++
    ) {
      try {
        return await prisma.$transaction(
          async (tx) => {

			const product = await tx.product.findFirst({
               where: {
                 id: input.productId,
                 businessId: input.businessId,
               },
               select: {
                 id: true,
                 inventoryMode: true,
               },
             });

             if (!product) {
               throw new Error("Product not found.");
             }

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
                existingOperation.status ===
                  "COMPLETED" &&
                existingOperation.entityId
              ) {
                const existingMovement =
                  await tx.inventoryMovement.findFirst({
                    where: {
                      id: existingOperation.entityId,
                      businessId: input.businessId,
                    },
                  });

                if (existingMovement) {
                  const existingBalance =
                    await tx.inventoryBalance.findUnique({
                      where: {
                        productId_warehouseId: {
                          productId:
                            existingMovement.productId,
                          warehouseId:
                            existingMovement.warehouseId,
                        },
                      },
                    });

                  if (existingBalance) {
                    return {
                      movement:
                        serializeMovement(
                          existingMovement,
                        ),
                      balance:
                        serializeBalance(
                          existingBalance,
                        ),
                    };
                  }
                }
              }

              if (
                existingOperation.status ===
                "PROCESSING"
              ) {
                throw new Error(
                  "This stock receipt operation is already being processed.",
                );
              }
            }

            const operationRequest =
              await tx.operationRequest.create({
                data: {
                  businessId: input.businessId,
                  operationId: input.operationId,
                  operation: "INVENTORY_RECEIPT",
                  status: "PROCESSING",
                  entityType: "INVENTORY_MOVEMENT",
                  createdBy: input.createdBy,
                },
              });

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
              existingBalance?.averageCost.toNumber() ??
              0;

            const inventoryQuantity =
              product.inventoryMode === "LIQUID"
                ? input.quantity *
                  (input.containerCapacityQuantity ?? 0)
                : input.quantity;

            const newQuantity =
              previousQuantity + inventoryQuantity;

            const newAverageCost =
              newQuantity === 0
                ? input.unitCost
                : (
                    previousQuantity *
                      previousAverageCost +
                    input.quantity *
                      input.unitCost
                  ) / newQuantity;

            const movement =
  await tx.inventoryMovement.create({
    data: {
      businessId: input.businessId,
      productId: input.productId,
      warehouseId: input.warehouseId,
      type: "RECEIPT",
      quantity: inventoryQuantity,
      unitCost: input.unitCost,
      totalCost:
        input.quantity *
        input.unitCost,

      referenceType: "MANUAL_RECEIPT",
      referenceId: operationRequest.id,

      createdBy: input.createdBy,
      notes: input.notes,
    },
  });

            const balance =
              await tx.inventoryBalance.upsert({
                where: {
                  productId_warehouseId: {
                    productId: input.productId,
                    warehouseId:
                      input.warehouseId,
                  },
                },
                create: {
                  businessId: input.businessId,
                  productId: input.productId,
                  warehouseId:
                    input.warehouseId,
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


			// Pharmacy batch tracking
const pharmacyProduct =
  await tx.pharmacyProduct.findUnique({
    where: {
      productId: input.productId,
    },
    select: {
      id: true,
      status: true,
    },
  });

if (pharmacyProduct) {
  if (pharmacyProduct.status !== "ACTIVE") {
    throw new Error(
      "This pharmacy product is not active and cannot receive inventory.",
    );
  }

  if (
    !input.batchNumber?.trim() ||
    !input.expiryDate
  ) {
    throw new Error(
      "Batch number and expiry date are required when receiving a pharmacy product.",
    );
  }

  const expiryDate = new Date(input.expiryDate);

  if (Number.isNaN(expiryDate.getTime())) {
    throw new Error(
      "Invalid batch expiry date.",
    );
  }

  if (expiryDate <= new Date()) {
    throw new Error(
      "Pharmacy batch expiry date must be in the future.",
    );
  }

  let manufacturingDate:
    | Date
    | undefined;

  if (input.manufacturingDate) {
    manufacturingDate =
      new Date(input.manufacturingDate);

    if (
      Number.isNaN(
        manufacturingDate.getTime(),
      )
    ) {
      throw new Error(
        "Invalid manufacturing date.",
      );
    }

    if (manufacturingDate > new Date()) {
      throw new Error(
        "Manufacturing date cannot be in the future.",
      );
    }

    if (manufacturingDate >= expiryDate) {
      throw new Error(
        "Manufacturing date must be before the expiry date.",
      );
    }
  }

  const batchNumber =
    input.batchNumber.trim();

  const existingBatch =
    await tx.pharmacyBatch.findUnique({
      where: {
        pharmacyProductId_batchNumber: {
          pharmacyProductId:
            pharmacyProduct.id,
          batchNumber,
        },
      },
      select: {
        id: true,
      },
    });

  if (existingBatch) {
    throw new Error(
      `Batch ${batchNumber} already exists for this pharmacy product.`,
    );
  }

  await tx.pharmacyBatch.create({
    data: {
      pharmacyProductId:
        pharmacyProduct.id,

      warehouseId:
        input.warehouseId,

      batchNumber,

      manufacturingDate,

      expiryDate,

      quantityReceived:
        input.quantity,

      quantityRemaining:
        input.quantity,

      unitCost:
        input.unitCost,

      isRecalled: false,
    },
  });
}

            await tx.operationRequest.update({
              where: {
                id: operationRequest.id,
              },
              data: {
                status: "COMPLETED",
                entityId: movement.id,
                response: {
                  movementId: movement.id,
                  productId: input.productId,
                  warehouseId:
                    input.warehouseId,
                  quantity: input.quantity,
                },
              },
            });

            return {
              movement:
                serializeMovement(movement),
              balance:
                serializeBalance(balance),
            };
          },
          {
            isolationLevel: "Serializable",
          },
        );
      } catch (error: unknown) {
        const prismaError = error as {
          code?: string;
        };

        if (
          prismaError.code === "P2034" &&
          attempt < maxAttempts
        ) {
          continue;
        }

        if (prismaError.code === "P2002") {
          const existingOperation =
            await prisma.operationRequest.findUnique({
              where: {
                businessId_operationId: {
                  businessId: input.businessId,
                  operationId:
                    input.operationId,
                },
              },
            });

          if (
            existingOperation?.status ===
              "COMPLETED" &&
            existingOperation.entityId
          ) {
            const existingMovement =
              await prisma.inventoryMovement.findFirst({
                where: {
                  id: existingOperation.entityId,
                  businessId: input.businessId,
                },
              });

            if (existingMovement) {
              const existingBalance =
                await prisma.inventoryBalance.findUnique({
                  where: {
                    productId_warehouseId: {
                      productId:
                        existingMovement.productId,
                      warehouseId:
                        existingMovement.warehouseId,
                    },
                  },
                });

              if (existingBalance) {
                return {
                  movement:
                    serializeMovement(
                      existingMovement,
                    ),
                  balance:
                    serializeBalance(
                      existingBalance,
                    ),
                };
              }
            }
          }
        }

        throw error;
      }
    }

    throw new Error(
      "Inventory receipt failed after maximum retry attempts.",
    );
  },

  async transferStock(input: {
    businessId: string;
    operationId: string;
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
      input.fromWarehouseId === input.toWarehouseId
    ) {
      throw new Error(
        "Source and destination warehouses must be different.",
      );
    }

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
                const response =
                  existingOperation.response as {
                    transferOutId?: string;
                    transferInId?: string;
                  } | null;

                if (
                  !response?.transferOutId ||
                  !response?.transferInId
                ) {
                  throw new Error(
                    "Completed inventory transfer operation has an invalid response.",
                  );
                }

                const [
                  transferOut,
                  transferIn,
                ] = await Promise.all([
                  tx.inventoryMovement.findUnique({
                    where: {
                      id: response.transferOutId,
                    },
                  }),
                  tx.inventoryMovement.findUnique({
                    where: {
                      id: response.transferInId,
                    },
                  }),
                ]);

                if (!transferOut || !transferIn) {
                  throw new Error(
                    "Completed inventory transfer operation references missing movements.",
                  );
                }

                const [
                  sourceBalance,
                  destinationBalance,
                ] = await Promise.all([
                  tx.inventoryBalance.findUnique({
                    where: {
                      productId_warehouseId: {
                        productId: input.productId,
                        warehouseId:
                          input.fromWarehouseId,
                      },
                    },
                  }),
                  tx.inventoryBalance.findUnique({
                    where: {
                      productId_warehouseId: {
                        productId: input.productId,
                        warehouseId:
                          input.toWarehouseId,
                      },
                    },
                  }),
                ]);

                return {
                  transferOut:
                    serializeMovement(transferOut),
                  transferIn:
                    serializeMovement(transferIn),
                  sourceBalance: sourceBalance
                    ? serializeBalance(sourceBalance)
                    : null,
                  destinationBalance:
                    destinationBalance
                      ? serializeBalance(
                          destinationBalance,
                        )
                      : null,
                };
              }

              if (
                existingOperation.status ===
                "PROCESSING"
              ) {
                throw new Error(
                  "This inventory transfer is already being processed.",
                );
              }
            }

            const operationRequest =
              await tx.operationRequest.create({
                data: {
                  businessId: input.businessId,
                  operationId: input.operationId,
                  operation: "INVENTORY_TRANSFER",
                  status: "PROCESSING",
                  entityType: "INVENTORY_TRANSFER",
                  createdBy: input.createdBy,
                },
              });

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

            const result = {
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

            await tx.operationRequest.update({
              where: {
                id: operationRequest.id,
              },
              data: {
                status: "COMPLETED",
                entityId: transferOut.id,
                response: {
                  transferOutId: transferOut.id,
                  transferInId: transferIn.id,
                },
              },
            });

            return result;
          },
          {
            isolationLevel: "Serializable",
          },
        );
      } catch (error: unknown) {
        const prismaError = error as {
          code?: string;
        };

        if (
          prismaError.code === "P2034" &&
          attempt < maxAttempts
        ) {
          continue;
        }

        if (prismaError.code === "P2002") {
          const existingOperation =
            await prisma.operationRequest.findUnique({
              where: {
                businessId_operationId: {
                  businessId: input.businessId,
                  operationId: input.operationId,
                },
              },
            });

          if (
            existingOperation?.status ===
              "COMPLETED" &&
            existingOperation.entityId
          ) {
            const response =
              existingOperation.response as {
                transferOutId?: string;
                transferInId?: string;
              } | null;

            if (
              response?.transferOutId &&
              response?.transferInId
            ) {
              const [
                transferOut,
                transferIn,
              ] = await Promise.all([
                prisma.inventoryMovement.findUnique({
                  where: {
                    id: response.transferOutId,
                  },
                }),
                prisma.inventoryMovement.findUnique({
                  where: {
                    id: response.transferInId,
                  },
                }),
              ]);

              if (transferOut && transferIn) {
                const [
                  sourceBalance,
                  destinationBalance,
                ] = await Promise.all([
                  prisma.inventoryBalance.findUnique({
                    where: {
                      productId_warehouseId: {
                        productId: input.productId,
                        warehouseId:
                          input.fromWarehouseId,
                      },
                    },
                  }),
                  prisma.inventoryBalance.findUnique({
                    where: {
                      productId_warehouseId: {
                        productId: input.productId,
                        warehouseId:
                          input.toWarehouseId,
                      },
                    },
                  }),
                ]);

                return {
                  transferOut:
                    serializeMovement(transferOut),
                  transferIn:
                    serializeMovement(transferIn),
                  sourceBalance: sourceBalance
                    ? serializeBalance(sourceBalance)
                    : null,
                  destinationBalance:
                    destinationBalance
                      ? serializeBalance(
                          destinationBalance,
                        )
                      : null,
                };
              }
            }
          }
        }

        throw error;
      }
    }

    throw new Error(
      "Inventory transfer failed after maximum retry attempts.",
    );
  },


  async getBalance(
    businessId: string,
    productId: string,
    warehouseId: string,
  ) {
    const balance =
  await prisma.inventoryBalance.findFirst({
    where: {
      businessId,
      productId,
      warehouseId,
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
  operationId: string;
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
                  businessId: input.businessId,
                  operationId: input.operationId,
                },
              },
            });

          if (existingOperation) {
            if (
              existingOperation.status ===
                "COMPLETED" &&
              existingOperation.entityId
            ) {
              const existingMovement =
                await tx.inventoryMovement.findFirst({
                  where: {
                    id: existingOperation.entityId,
                    businessId: input.businessId,
                  },
                });

              if (existingMovement) {
                const existingBalance =
                  await tx.inventoryBalance.findUnique({
                    where: {
                      productId_warehouseId: {
                        productId:
                          existingMovement.productId,
                        warehouseId:
                          existingMovement.warehouseId,
                      },
                    },
                  });

                if (existingBalance) {
                  return {
                    movement:
                      serializeMovement(
                        existingMovement,
                      ),
                    balance:
                      serializeBalance(
                        existingBalance,
                      ),
                  };
                }
              }
            }

            if (
              existingOperation.status ===
              "PROCESSING"
            ) {
              throw new Error(
                "This inventory consumption operation is already being processed.",
              );
            }
          }

          const operation =
            await tx.operationRequest.create({
              data: {
                businessId: input.businessId,
                operationId: input.operationId,
                operation:
                  "INVENTORY_CONSUMPTION",
                status: "PROCESSING",
                entityType:
                  "INVENTORY_MOVEMENT",
                createdBy: input.createdBy,
              },
            });

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
            existingBalance?.quantity.toNumber() ??
            0;

          const reservedQuantity =
            existingBalance?.reservedQuantity.toNumber() ??
            0;

          const availableQuantity =
            currentQuantity -
            reservedQuantity;

          if (
            availableQuantity <
            input.quantity
          ) {
            throw new Error(
              `Insufficient available stock. Available: ${availableQuantity}, requested: ${input.quantity}.`,
            );
          }

          const averageCost =
            existingBalance?.averageCost.toNumber() ??
            0;

          const newQuantity =
            currentQuantity -
            input.quantity;

          const totalCost =
            input.quantity * averageCost;

          const product =
            await tx.product.findFirst({
              where: {
                id: input.productId,
                businessId: input.businessId,
              },
              select: {
                inventoryMode: true,
              },
            });

          if (!product) {
            throw new Error(
              "Product not found.",
            );
          }

          if (
            product.inventoryMode ===
            "LIQUID"
          ) {
            await consumeLiquidContainersWithTx(
              tx,
              {
                businessId:
                  input.businessId,
                productId:
                  input.productId,
                warehouseId:
                  input.warehouseId,
                quantity:
                  input.quantity,
              },
            );
          }

          const movement =
            await tx.inventoryMovement.create({
              data: {
                businessId:
                  input.businessId,
                productId:
                  input.productId,
                warehouseId:
                  input.warehouseId,
                type: "SALE",
                quantity:
                  input.quantity,
                unitCost:
                  averageCost,
                totalCost,
                referenceType:
                  input.referenceType,
                referenceId:
                  input.referenceId,
                createdBy:
                  input.createdBy,
                notes: input.notes,
              },
            });

          const balance =
            await tx.inventoryBalance.update({
              where: {
                productId_warehouseId: {
                  productId:
                    input.productId,
                  warehouseId:
                    input.warehouseId,
                },
              },
              data: {
                quantity:
                  newQuantity,
                currency:
                  input.currency,
              },
            });

          const response = {
            movement:
              serializeMovement(
                movement,
              ),
            balance:
              serializeBalance(
                balance,
              ),
          };

          await tx.operationRequest.update({
            where: {
              id: operation.id,
            },
            data: {
              status: "COMPLETED",
              entityId: movement.id,
              response,
            },
          });

          return response;
        },
        {
          isolationLevel:
            "Serializable",
        },
      );
    } catch (error: unknown) {
      const prismaError =
        error as {
          code?: string;
        };

      if (
        prismaError.code === "P2034" &&
        attempt < maxAttempts
      ) {
        continue;
      }

      if (
        prismaError.code === "P2002"
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
          existingOperation?.status ===
            "COMPLETED" &&
          existingOperation.entityId
        ) {
          const existingMovement =
            await prisma.inventoryMovement.findFirst({
              where: {
                id:
                  existingOperation.entityId,
                businessId:
                  input.businessId,
              },
            });

          if (existingMovement) {
            const existingBalance =
              await prisma.inventoryBalance.findUnique({
                where: {
                  productId_warehouseId: {
                    productId:
                      existingMovement.productId,
                    warehouseId:
                      existingMovement.warehouseId,
                  },
                },
              });

            if (existingBalance) {
              return {
                movement:
                  serializeMovement(
                    existingMovement,
                  ),
                balance:
                  serializeBalance(
                    existingBalance,
                  ),
              };
            }
          }
        }
      }

      throw error;
    }
  }

  throw new Error(
    "Inventory consumption failed after maximum retry attempts.",
  );
},

      async consumeStockBatch(input: {
    businessId: string;
	operationId: string;
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

    return prisma.$transaction(
  (tx) =>
    this.consumeStockBatchWithTx(
      tx,
      input,
    ),
  {
    isolationLevel:
      "Serializable",
  },
);
  },

  async consumeStockBatchWithTx(
  tx: Prisma.TransactionClient,
  input: {
    businessId: string;
	operationId: string;
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
  },
) {

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
    existingOperation.status ===
      "COMPLETED" &&
    existingOperation.response
  ) {
    return existingOperation.response;
  }

  if (
    existingOperation.status ===
    "PROCESSING"
  ) {
    throw new Error(
      "This inventory consumption batch is already being processed.",
    );
  }
}

const operation =
  await tx.operationRequest.create({
    data: {
      businessId: input.businessId,
      operationId: input.operationId,
      operation:
        "INVENTORY_CONSUMPTION_BATCH",
      status: "PROCESSING",
      entityType:
        "INVENTORY_MOVEMENT_BATCH",
      createdBy: input.createdBy,
    },
  });

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
         existingBalance?.quantity.toNumber() ??
         0;

       const reservedQuantity =
         existingBalance?.reservedQuantity.toNumber() ??
         0;

       const availableQuantity =
         currentQuantity -
         reservedQuantity;

       if (
        availableQuantity < item.quantity
      ) {
        throw new Error(
          `Insufficient available stock for product "${item.productId}". Available: ${availableQuantity}, requested: ${item.quantity}.`,
        );
      }

    const averageCost =
      existingBalance?.averageCost.toNumber() ?? 0;

    const product =
      await tx.product.findFirst({
        where: {
          id: item.productId,
          businessId: input.businessId,
        },
        select: {
          inventoryMode: true,
        },
      });

    if (!product) {
      throw new Error(
        `Product "${item.productId}" not found.`,
      );
    }

    if (product.inventoryMode === "LIQUID") {
      await consumeLiquidContainersWithTx(tx, {
        businessId: input.businessId,
        productId: item.productId,
        warehouseId: input.warehouseId,
        quantity: item.quantity,
      });
    }

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
  await tx.operationRequest.update({
  where: {
    id: operation.id,
  },
  data: {
    status: "COMPLETED",
    entityType:
      "INVENTORY_MOVEMENT_BATCH",
    response: results,
  },
});

return results;
},

    async returnStock(
      input: {
        businessId: string;
        productId: string;
        warehouseId: string;
        quantity: number;
        unitCost: number;
        currency: string;
        createdBy: string;
        referenceType?: string;
        referenceId?: string;
        notes?: string;
      },
      client: PrismaTransactionClient = prisma,
    ) {
      return this.returnStockBatch(
        {
          businessId: input.businessId,
          warehouseId: input.warehouseId,
          currency: input.currency,
          createdBy: input.createdBy,
          referenceType: input.referenceType,
          referenceId: input.referenceId,
          notes: input.notes,
          items: [
            {
              productId: input.productId,
              quantity: input.quantity,
            },
          ],
        },
        client,
      );
    },

    async returnStockBatch(
  input: {
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
  },
  client: PrismaTransactionClient = prisma,
) {
    if (input.items.length === 0) {
      throw new Error(
        "At least one stock return item is required.",
      );
    }

    for (const item of input.items) {
      if (item.quantity <= 0) {
        throw new Error(
          "Return quantity must be greater than zero.",
        );
      }
    }


      const results = [];

      for (const item of input.items) {
        const existingBalance =
          await client.inventoryBalance.findUnique({
            where: {
              productId_warehouseId: {
                productId: item.productId,
                warehouseId: input.warehouseId,
              },
            },
          });

        const currentQuantity =
          existingBalance?.quantity.toNumber() ?? 0;

        const averageCost =
          existingBalance?.averageCost.toNumber() ?? 0;

        const newQuantity =
          currentQuantity + item.quantity;

        const totalCost =
          item.quantity * averageCost;

        const movement =
          await client.inventoryMovement.create({
            data: {
              businessId: input.businessId,
              productId: item.productId,
              warehouseId: input.warehouseId,
              type: "RETURN",
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
          await client.inventoryBalance.upsert({
            where: {
              productId_warehouseId: {
                productId: item.productId,
                warehouseId: input.warehouseId,
              },
            },
            create: {
              businessId: input.businessId,
              productId: item.productId,
              warehouseId: input.warehouseId,
              quantity: newQuantity,
              reservedQuantity: 0,
              averageCost,
              currency: input.currency,
            },
            update: {
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

  },

};