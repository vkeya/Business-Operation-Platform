import { prisma } from "@/lib/database/prisma";

export interface CreatePurchasePaymentInput {
  businessId: string;
  purchaseId: string;
  reference: string;
  method: string;
  amount: number;
  currency: string;
  exchangeRate?: number;
  notes?: string;
  createdBy: string;
}

export interface CreateSalePaymentInput {
  businessId: string;
  saleId: string;
  reference: string;
  method: string;
  amount: number;
  currency: string;
  exchangeRate?: number;
  notes?: string;
  createdBy: string;
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
    input: CreatePurchasePaymentInput,
  ) {
    const payment =
      await prisma.payment.create({
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
  ) {
    return prisma.purchase.findFirst({
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
  ) {
    return prisma.purchase.update({
      where: {
        id: purchaseId,
        businessId,
      },
      data: {
        paymentStatus,
      },
    });
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
    input: CreateSalePaymentInput,
  ) {
    const payment =
      await prisma.payment.create({
        data: {
          businessId: input.businessId,
          saleId: input.saleId,

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
  ) {
    return prisma.sale.findFirst({
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
  ) {
    return prisma.sale.update({
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
  ) {
    const payments =
      await prisma.payment.findMany({
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