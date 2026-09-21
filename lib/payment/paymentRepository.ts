import { prisma } from "@/lib/database/prisma";

type PrismaTransactionClient =
  Parameters<typeof prisma.$transaction>[0] extends (
    client: infer T,
  ) => unknown
    ? T
    : never;

export interface CreatePurchasePaymentInput {
  businessId: string;
  purchaseId: string;
  operationId: string;

  reference?: string;

  method: "CASH" | "MPESA" | "CARD" | "BANK" | "CREDIT";
  amount: number;
  currency: string;
  exchangeRate?: number;
  notes?: string;
  createdBy: string;
}

export interface CreateSalePaymentInput {
  businessId: string;
  saleId: string;
  operationId: string;

  reference?: string;

  method: "CASH" | "MPESA" | "CARD" | "BANK" | "CREDIT";
  amount: number;
  currency: string;
  exchangeRate?: number;
  notes?: string;
  createdBy: string;

   paymentAttemptId?: string;
}

function serializePayment<
  T extends {
    amount: { toNumber(): number };
    exchangeRate:
      | { toNumber(): number }
      | null;
  },
>(payment: T) {
  return {
    ...payment,
    amount: payment.amount.toNumber(),
    exchangeRate:
      payment.exchangeRate?.toNumber() ?? null,
  };
}

export const paymentRepository = {
  async createPurchasePayment(
  input: CreatePurchasePaymentInput & {
    reference: string;
  },
  client: PrismaTransactionClient = prisma,
) {
  const payment =
    await client.payment.create({
      data: {

        businessId: input.businessId,
        purchaseId: input.purchaseId,

        reference: input.reference,
        method: input.method,

        amount: input.amount,
        currency: input.currency,
        exchangeRate:
          input.exchangeRate,

        status: "PAID",

        notes: input.notes,
        createdBy: input.createdBy,
      },
    });

  return serializePayment(payment);
},

async findPurchaseWithPayments(
  businessId: string,
  purchaseId: string,
  client: PrismaTransactionClient = prisma,
) {
  return client.purchase.findFirst({
    where: {
      id: purchaseId,
      businessId,
    },
    include: {
      payments: true,
    },
  });
},

async updatePurchasePaymentStatus(
  businessId: string,
  purchaseId: string,
  paymentStatus:
    | "PENDING"
    | "PARTIAL"
    | "PAID",
  client: PrismaTransactionClient = prisma,
) {
  return client.purchase.update({
    where: {
      id: purchaseId,
      businessId,
    },
    data: {
      paymentStatus,
    },
  });
},

async findById(
  businessId: string,
  paymentId: string,
  client: PrismaTransactionClient = prisma,
) {
  const payment =
    await client.payment.findFirst({
      where: {
        id: paymentId,
        businessId,
      },
    });

  return payment
    ? serializePayment(payment)
    : null;
},

  async listPurchasePayments(
    businessId: string,
    purchaseId: string,
  ) {
    const payments =
      await prisma.payment.findMany({
        where: {
          businessId,
          purchaseId,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    return payments.map(serializePayment);
  },

  async createSalePayment(
    input: CreateSalePaymentInput & {
      reference: string;
    },
    client: PrismaTransactionClient = prisma,
  ) {
    const payment =
      await client.payment.create({
        data: {
          businessId: input.businessId,
          saleId: input.saleId,

		  paymentAttemptId:
        input.paymentAttemptId,

          reference: input.reference,
          method: input.method,

          amount: input.amount,
          currency: input.currency,
          exchangeRate:
            input.exchangeRate,

          status: "PAID",

          notes: input.notes,
          createdBy: input.createdBy,
        },
      });

    return serializePayment(payment);
  },

  async findSaleWithPayments(
    businessId: string,
    saleId: string,
    client: PrismaTransactionClient = prisma,
  ) {
    return client.sale.findFirst({
      where: {
        id: saleId,
        businessId,
      },
      include: {
        payments: true,
      },
    });
  },

  async updateSalePaymentStatus(
    businessId: string,
    saleId: string,
    paymentStatus:
      | "PENDING"
      | "PARTIAL"
      | "PAID"
      | "FAILED"
      | "REFUNDED",
    client: PrismaTransactionClient = prisma,
  ) {
    return client.sale.update({
      where: {
        id: saleId,
        businessId,
      },
      data: {
        paymentStatus,
      },
    });
  },

   async listSalePayments(
    businessId: string,
    saleId: string,
    client: PrismaTransactionClient = prisma,
  ) {
    const payments =
      await client.payment.findMany({
        where: {
          businessId,
          saleId,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    return payments.map(serializePayment);
  },
};