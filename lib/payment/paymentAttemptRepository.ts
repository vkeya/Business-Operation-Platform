import { prisma } from "@/lib/database/prisma";

type PrismaTransactionClient =
  Parameters<typeof prisma.$transaction>[0] extends (
    client: infer T,
  ) => unknown
    ? T
    : never;

export interface CreatePaymentAttemptInput {
  businessId: string;
  saleId: string;
  provider: string;
  method: string;
  amount: number;
  currency: string;
  providerReference?: string;
  terminalReference?: string;
  providerResponse?: object;
  createdBy: string;
}

export const paymentAttemptRepository = {
  async create(
    input: CreatePaymentAttemptInput,
    client: PrismaTransactionClient = prisma,
  ) {
    return client.paymentAttempt.create({
      data: {
        businessId: input.businessId,
        saleId: input.saleId,
        provider: input.provider,
        method: input.method,
        status: "PENDING",
        amount: input.amount,
        currency: input.currency,
        providerReference:
          input.providerReference,
        terminalReference:
          input.terminalReference,
        providerResponse:
          input.providerResponse,
        createdBy: input.createdBy,
      },
    });
  },

    async findById(
    businessId: string,
    id: string,
    client: PrismaTransactionClient = prisma,
  ) {
    return client.paymentAttempt.findFirst({
      where: {
        id,
        businessId,
      },
    });
  },

  async findByProviderReference(
    provider: string,
    providerReference: string,
    client: PrismaTransactionClient = prisma,
  ) {
    return client.paymentAttempt.findFirst({
      where: {
        provider,
        providerReference,
      },
    });
  },

    async updateStatus(
    businessId: string,
    id: string,
    status:
      | "PENDING"
      | "PAID"
      | "FAILED",
    client: PrismaTransactionClient = prisma,
  ) {
    return client.paymentAttempt.updateMany({
      where: {
        id,
        businessId,
      },
      data: {
        status,
      },
    });
  },

  async updateProviderDetails(
  businessId: string,
  id: string,
  input: {
    providerReference?: string;
    terminalReference?: string;
    providerResponse?: object;
  },
  client: PrismaTransactionClient = prisma,
) {
  return client.paymentAttempt.updateMany({
    where: {
      id,
      businessId,
    },
    data: {
      providerReference:
        input.providerReference,
      terminalReference:
        input.terminalReference,
      providerResponse:
        input.providerResponse,
    },
  });
},

};