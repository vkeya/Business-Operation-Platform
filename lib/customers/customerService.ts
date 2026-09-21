import {
  customerRepository,
  type CreateCustomerInput,
} from "./customerRepository";
import { prisma } from "@/lib/database/prisma";

type PrismaTransactionClient =
  Parameters<typeof prisma.$transaction>[0] extends (
    client: infer T,
  ) => unknown
    ? T
    : never;

export const customerService = {
  async createCustomer(
  input: CreateCustomerInput & {
    operationId: string;
    createdBy: string;
  },
) {
  const name = input.name.trim();

  if (!input.businessId) {
    throw new Error("Business context is required.");
  }

  if (!input.operationId?.trim()) {
    throw new Error("Operation ID is required.");
  }

  if (!input.createdBy) {
    throw new Error("User context is required.");
  }

  if (!name) {
    throw new Error("Customer name is required.");
  }

  const phone = input.phone?.trim() || undefined;
  const email = input.email?.trim() || undefined;
  const address = input.address?.trim() || undefined;
  const taxNumber = input.taxNumber?.trim() || undefined;

  if (
    input.creditLimit !== undefined &&
    input.creditLimit < 0
  ) {
    throw new Error(
      "Credit limit cannot be negative.",
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
          const operation =
            await tx.operationRequest.create({
              data: {
                businessId:
                  input.businessId,

                operationId:
                  input.operationId,

                operation:
                  "CUSTOMER_CREATE",

                status:
                  "PROCESSING",

                entityType:
                  "CUSTOMER",

                createdBy:
                  input.createdBy,
              },
            });

          const customer =
            await customerRepository.create(
              {
                businessId:
                  input.businessId,
                name,
                phone,
                email,
                address,
                taxNumber,
                creditLimit:
                  input.creditLimit,
                currency:
                  input.currency,
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
                "CUSTOMER",

              entityId:
                customer.id,

              response: {
                customerId:
                  customer.id,
              },
            },
          });

          return customer;
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
          const customer =
            await customerRepository.findById(
              input.businessId,
              existing.entityId,
            );

          if (customer) {
            return customer;
          }
        }
      }

      throw error;
    }
  }

  throw new Error(
    "Unable to complete customer creation after multiple concurrent attempts.",
  );
},

  async listCustomers(businessId: string) {
    if (!businessId) {
      throw new Error(
        "Business context is required.",
      );
    }

    return customerRepository.list(
      businessId,
    );
  },

  async searchCustomers(
    businessId: string,
    query: string,
  ) {
    if (!businessId) {
      throw new Error(
        "Business context is required.",
      );
    }

    return customerRepository.search(
      businessId,
      query,
    );
  },

  async findCustomer(
    businessId: string,
    customerId: string,
  ) {
    if (!businessId) {
      throw new Error(
        "Business context is required.",
      );
    }

    if (!customerId) {
      throw new Error(
        "Customer is required.",
      );
    }

    return customerRepository.findById(
      businessId,
      customerId,
    );
  },

  async updateCustomer(
    businessId: string,
    customerId: string,
    input: Omit<
  CreateCustomerInput,
  "businessId"
> & {
  isActive: boolean;
},
  ) {
    if (!businessId) {
      throw new Error(
        "Business context is required.",
      );
    }

    if (!customerId) {
      throw new Error(
        "Customer is required.",
      );
    }

    const name = input.name.trim();

    if (!name) {
      throw new Error(
        "Customer name is required.",
      );
    }

    if (
      input.creditLimit !== undefined &&
      input.creditLimit < 0
    ) {
      throw new Error(
        "Credit limit cannot be negative.",
      );
    }

    return customerRepository.update(
      businessId,
      customerId,
      {
        ...input,
        name,
        phone:
          input.phone?.trim() || undefined,
        email:
          input.email?.trim() || undefined,
        address:
          input.address?.trim() || undefined,
        taxNumber:
          input.taxNumber?.trim() || undefined,
      },
    );
  },

  async updateCustomerStatus(
    businessId: string,
    customerId: string,
    isActive: boolean,
  ) {
    if (!businessId) {
      throw new Error(
        "Business context is required.",
      );
    }

    if (!customerId) {
      throw new Error(
        "Customer is required.",
      );
    }

    return customerRepository.updateStatus(
      businessId,
      customerId,
      isActive,
    );
  },
};