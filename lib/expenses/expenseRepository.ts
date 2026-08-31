import { prisma } from "@/lib/database/prisma";

export interface CreateExpenseInput {
  businessId: string;
  branchId?: string;

  reference?: string;
  category: string;
  description: string;

  amount: number;
  currency: string;
  exchangeRate?: number;

  expenseDate: Date;
  paymentStatus?:
    | "UNPAID"
    | "PARTIAL"
    | "PAID";

  notes?: string;

  createdBy: string;
}

function serializeExpense<
  T extends {
    amount: { toNumber(): number };
    exchangeRate:
      | { toNumber(): number }
      | null;
  },
>(expense: T) {
  return {
    ...expense,

    amount:
      expense.amount.toNumber(),

    exchangeRate:
      expense.exchangeRate?.toNumber() ??
      null,
  };
}

export const expenseRepository = {
  async create(input: CreateExpenseInput & {
  reference: string;
  },
  ){
    const expense =
      await prisma.expense.create({
        data: {
          businessId:
            input.businessId,

          branchId:
            input.branchId,

          reference:
            input.reference,

          category:
            input.category,

          description:
            input.description,

          amount:
            input.amount,

          currency:
            input.currency,

          exchangeRate:
            input.exchangeRate,

          expenseDate:
            input.expenseDate,

          paymentStatus:
            input.paymentStatus ??
            "UNPAID",

          notes:
            input.notes,

          createdBy:
            input.createdBy,
        },
      });

    return serializeExpense(
      expense,
    );
  },

  async list(
    businessId: string,
  ) {
    const expenses =
      await prisma.expense.findMany({
        where: {
          businessId,
        },

        orderBy: {
          expenseDate: "desc",
        },
      });

    return expenses.map(
      serializeExpense,
    );
  },

  async findByReference(
    businessId: string,
    reference: string,
  ) {
    const expense =
      await prisma.expense.findUnique({
        where: {
          businessId_reference: {
            businessId,
            reference,
          },
        },
      });

    return expense
      ? serializeExpense(expense)
      : null;
  },

  async findById(
    businessId: string,
    expenseId: string,
  ) {
    const expense =
      await prisma.expense.findFirst({
        where: {
          id: expenseId,
          businessId,
        },
      });

    return expense
      ? serializeExpense(expense)
      : null;
  },

  async updatePaymentStatus(
    businessId: string,
    expenseId: string,
    paymentStatus:
      | "UNPAID"
      | "PARTIAL"
      | "PAID",
  ) {
    const expense =
      await prisma.expense.update({
        where: {
          id: expenseId,
          businessId,
        },

        data: {
          paymentStatus,
        },
      });

    return serializeExpense(
      expense,
    );
  },
};