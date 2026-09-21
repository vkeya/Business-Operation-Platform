import {
  supplierRepository,
  type CreateSupplierInput,
} from "./supplierRepository";
import { prisma } from "@/lib/database/prisma";

export const supplierService = {
  async createSupplier(
  input: CreateSupplierInput & {
    operationId: string;
    createdBy: string;
  },
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

  if (!input.createdBy) {
    throw new Error(
      "User context is required.",
    );
  }

  if (!input.name.trim()) {
    throw new Error(
      "Supplier name is required.",
    );
  }

  const name = input.name.trim();

  const maxAttempts = 3;

  for (
    let attempt = 1;
    attempt <= maxAttempts;
    attempt++
  ) {
    try {
      return await prisma.$transaction(
        async (tx) => {
          const operation =
            await tx.operationRequest.create({
              data: {
                businessId:
                  input.businessId,

                operationId:
                  input.operationId,

                operation:
                  "SUPPLIER_CREATE",

                status:
                  "PROCESSING",

                entityType:
                  "SUPPLIER",

                createdBy:
                  input.createdBy,
              },
            });

          const supplier =
            await supplierRepository.create(
              {
                businessId:
                  input.businessId,
                name,
                phone:
                  input.phone?.trim() ||
                  undefined,
                email:
                  input.email?.trim() ||
                  undefined,
                address:
                  input.address?.trim() ||
                  undefined,
                taxNumber:
                  input.taxNumber?.trim() ||
                  undefined,
                paymentTermsDays:
                  input.paymentTermsDays,
                currency:
                  input.currency?.trim() ||
                  undefined,
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
                "SUPPLIER",

              entityId:
                supplier.id,

              response: {
                supplierId:
                  supplier.id,
              },
            },
          });

          return supplier;
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
          const supplier =
            await prisma.supplier.findFirst({
              where: {
                id:
                  existing.entityId,

                businessId:
                  input.businessId,
              },
            });

          if (supplier) {
            return supplier;
          }
        }
      }

      throw error;
    }
  }

  throw new Error(
    "Unable to complete supplier creation after multiple concurrent attempts.",
  );
},

  async listSuppliers(businessId: string) {
    if (!businessId) {
      throw new Error("Business context is required.");
    }

    return supplierRepository.list(businessId);
  },

  async searchSuppliers(
    businessId: string,
    query: string,
  ) {
    if (!businessId) {
      throw new Error("Business context is required.");
    }

    return supplierRepository.search(
      businessId,
      query,
    );
  },

  async findSupplierByName(
    businessId: string,
    name: string,
  ) {
    if (!businessId) {
      throw new Error("Business context is required.");
    }

    return supplierRepository.findByName(
      businessId,
      name,
    );
  },
};