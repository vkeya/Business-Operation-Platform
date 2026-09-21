import { prisma } from "@/lib/database/prisma";

import { saleRepository } from "./saleRepository";
import { postSaleToAccounting } from "@/lib/accounting/posting/salesPosting";
import { inventoryRepository } from "@/lib/inventory/inventoryRepository";
import { productService } from "@/lib/inventory/productService";
import { recipeService } from "@/lib/restaurant/recipeService";

type PrismaTransactionClient =
  Parameters<typeof prisma.$transaction>[0] extends (
    client: infer T,
  ) => unknown
    ? T
    : never;

export const saleCompletionService = {
  async completeDraftSale(
    businessId: string,
    saleId: string,
  ) {
    if (!businessId) {
      throw new Error("Business context is required.");
    }

    if (!saleId) {
      throw new Error("Sale is required.");
    }

    const operationId = `SALE_COMPLETE:${saleId}`;

const maxAttempts = 3;

for (let attempt = 1; attempt <= maxAttempts; attempt++) {
  try {
    return await prisma.$transaction(
      async (tx) => {
        return this.completeDraftSaleWithTx(
          tx,
          businessId,
          saleId,
          operationId,
        );
      },
      {
        isolationLevel: "Serializable",
      },
    );
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error as { code?: string }).code === "P2034" &&
      attempt < maxAttempts
    ) {
      continue;
    }

    throw error;
  }
}
  },

  async completeDraftSaleWithTx(
  tx: PrismaTransactionClient,
  businessId: string,
  saleId: string,
  operationId?: string,
) {
    if (!businessId) {
      throw new Error("Business context is required.");
    }

    if (!saleId) {
      throw new Error("Sale is required.");
    }

	const resolvedOperationId =
  operationId ?? `SALE_COMPLETE:${saleId}`;

    const sale = await saleRepository.findById(
      businessId,
      saleId,
      tx,
    );

    if (!sale) {
      throw new Error("Sale not found.");
    }

	 if (sale.status === "COMPLETED") {
      return sale;
    }

    if (sale.status !== "DRAFT") {
      throw new Error(
        `Only draft sales can be completed. Current status: ${sale.status}.`,
      );
    }

const existingOperation =
  await tx.operationRequest.findUnique({
    where: {
      businessId_operationId: {
        businessId,
        operationId: resolvedOperationId,
      },
    },
  });

if (existingOperation) {
  if (
    existingOperation.status === "COMPLETED" &&
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
    existingOperation.status === "PROCESSING"
  ) {
	    /*
     * The operation already belongs to an active
     * completion transaction.
     *
     * The current transaction must not continue because
     * doing so could consume inventory or post accounting
     * twice.
     */

    throw new Error(
      "This sale completion is already being processed.",
    );
  }
}else {

await tx.operationRequest.create({
  data: {
    businessId,
    operationId: resolvedOperationId,
    operation: "SALE_COMPLETE",
    status: "PROCESSING",
    entityType: "SALE",
    entityId: saleId,
    createdBy: sale.createdBy,
  },
});

}

    /*
     * Payment safety:
     *
     * Asynchronous payment attempts must never allow a
     * sale to be completed while money is still outstanding.
     *
     * A FAILED attempt does not permanently block the sale
     * because the customer may subsequently pay by another
     * method (cash, card, etc.).
     *
     * Therefore:
     * - PENDING attempt + outstanding balance → block
     * - FAILED attempt + outstanding balance → block
     * - Any payment attempts + fully paid sale → allow
     *
     * Sales with no payment attempts retain the existing
     * manual-completion behavior.
     */
    const paymentAttemptCount =
      await tx.paymentAttempt.count({
        where: {
          businessId,
          saleId,
        },
      });

    if (paymentAttemptCount > 0) {
      const pendingPaymentAttempt =
        await tx.paymentAttempt.findFirst({
          where: {
            businessId,
            saleId,
            status: "PENDING",
          },
          select: {
            id: true,
          },
        });

      if (pendingPaymentAttempt) {
        throw new Error(
          "This sale has a pending payment. Complete the payment before completing the sale.",
        );
      }

      const payments =
        await tx.payment.findMany({
          where: {
            businessId,
            saleId,
            status: "PAID",
          },
          select: {
            amount: true,
          },
        });

      const paidAmount =
        payments.reduce(
          (total, payment) =>
            total + payment.amount.toNumber(),
          0,
        );

      const outstandingAmount =
  Number(sale.totalAmount) -
  paidAmount;

      if (outstandingAmount > 0) {
        throw new Error(
          `This sale has an outstanding balance of ${outstandingAmount.toFixed(2)} ${sale.currency}. Record the remaining payment before completing the sale.`,
        );
      }
    }

    if (sale.items.length === 0) {
      throw new Error(
        "A sale must contain at least one item.",
      );
    }

    if (!sale.warehouseId) {
      throw new Error(
        "A warehouse is required to complete a sale.",
      );
    }

    const restaurantItems = sale.items
      .filter((item) => item.menuItemId)
      .map((item) => ({
        menuItemId: item.menuItemId!,
        quantity: Number(item.quantity),
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
  tx,
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
        productId: item.productId,
        quantity: inventoryQuantity,
      });
    }

    if (restaurantItems.length > 0) {
      await recipeService.consumeSaleRecipes({
        businessId,
        warehouseId: sale.warehouseId,
        currency: sale.currency,
        createdBy: sale.createdBy,
        referenceId: sale.id,
        client: tx,
        items: restaurantItems,
      });
    }

    if (inventoryItems.length > 0) {
      await inventoryRepository.consumeStockBatchWithTx(
        tx,
        {
          businessId,
          warehouseId: sale.warehouseId,
          currency: sale.currency,
          createdBy: sale.createdBy,
          referenceType: "SALE",
          referenceId: sale.id,
          notes:
            `Inventory consumption for sale ${sale.referenceNumber}.`,
          items: inventoryItems,
        },
      );
    }

    await postSaleToAccounting({
      businessId,
      saleId: sale.id,
      referenceNumber: sale.referenceNumber,
      totalAmount: Number(sale.totalAmount),
      taxAmount: Number(sale.taxAmount),
      currency: sale.currency,
      customerId: sale.customerId,
      createdBy: sale.createdBy,
      client: tx,
    });

    const completedSale =
  await saleRepository.updateStatus(
    businessId,
    saleId,
    "COMPLETED",
    tx,
  );

await tx.operationRequest.update({
  where: {
    businessId_operationId: {
      businessId,
      operationId: resolvedOperationId,
    },
  },
  data: {
    status: "COMPLETED",
    entityType: "SALE",
    entityId: saleId,
    response: {
      saleId,
      status: "COMPLETED",
    },
  },
});

return completedSale;
  },
};