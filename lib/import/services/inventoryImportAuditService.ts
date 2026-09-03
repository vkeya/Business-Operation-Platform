import { prisma } from "@/lib/database/prisma";

type PrismaTransactionClient = Parameters<
  typeof prisma.$transaction
>[0] extends (
  client: infer T,
) => unknown
  ? T
  : never;

export interface InventoryImportAuditInput {
  businessId: string;
  createdBy: string;
  productIds: string[];
  importedCount: number;
}

export async function recordInventoryImportAudit(
  tx: PrismaTransactionClient,
  input: InventoryImportAuditInput,
) {
  const businessId = input.businessId.trim();
  const createdBy = input.createdBy.trim();

  if (!businessId) {
    throw new Error("Business ID is required.");
  }

  if (!createdBy) {
    throw new Error("Created by user ID is required.");
  }

  if (input.importedCount <= 0) {
    return null;
  }

  return tx.auditEvent.create({
    data: {
      businessId,
      actorId: createdBy,
      action: "IMPORT",
      entityType: "PRODUCT_IMPORT",
      afterData: {
        importedCount: input.importedCount,
        productIds: input.productIds,
      },
    },
  });
}