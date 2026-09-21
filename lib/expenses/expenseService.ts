import {
  expenseRepository,
  type CreateExpenseInput,
} from "./expenseRepository";
import { postExpenseToAccounting } from "@/lib/accounting/posting/expensePosting";
import {
  generateBusinessReference,
} from "@/lib/business/reference/referenceGenerator";
import { prisma } from "@/lib/database/prisma";

export const expenseService = {
  async createExpense(
  input: CreateExpenseInput,
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

  if (!input.category.trim()) {
    throw new Error(
      "Expense category is required.",
    );
  }

  if (!input.description.trim()) {
    throw new Error(
      "Expense description is required.",
    );
  }

  if (input.amount <= 0) {
    throw new Error(
      "Expense amount must be greater than zero.",
    );
  }

  if (!input.currency.trim()) {
    throw new Error(
      "Expense currency is required.",
    );
  }

  if (
    !(input.expenseDate instanceof Date) ||
    Number.isNaN(
      input.expenseDate.getTime(),
    )
  ) {
    throw new Error(
      "A valid expense date is required.",
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

			if (input.branchId) {
  const branch = await tx.branch.findFirst({
    where: {
      id: input.branchId,
      businessId: input.businessId,
      isActive: true,
    },
    select: {
      id: true,
    },
  });

  if (!branch) {
    throw new Error(
      "Branch does not belong to the current business or is inactive.",
    );
  }
}
          const operation =
            await tx.operationRequest.create({
              data: {
                businessId:
                  input.businessId,

                operationId:
                  input.operationId,

                operation:
                  "EXPENSE_CREATE",

                status:
                  "PROCESSING",

                entityType:
                  "EXPENSE",

                createdBy:
                  input.createdBy,
              },
            });

          const reference =
            input.reference?.trim() ||
            await generateBusinessReference({
              businessId:
                input.businessId,

              referenceType:
                "EXPENSE",

              prefix: "EXP",

              client: tx,
            });

          const expense =
            await expenseRepository.create(
              {
                ...input,

                reference,

                category:
                  input.category.trim(),

                description:
                  input.description.trim(),

                currency:
                  input.currency.trim(),
              },
              tx,
            );

          await postExpenseToAccounting(
            {
              businessId:
                expense.businessId,

              expenseId:
                expense.id,

              reference:
                expense.reference,

              category:
                expense.category,

              description:
                expense.description,

              amount:
                expense.amount,

              currency:
                expense.currency,

              createdBy:
                expense.createdBy,
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
                "EXPENSE",

              entityId:
                expense.id,

              response: {
                expenseId:
                  expense.id,

                reference:
                  expense.reference,
              },
            },
          });

          return expense;
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

        if (
          existing?.entityId
        ) {
          const expense =
            await expenseRepository.findById(
              input.businessId,
              existing.entityId,
            );

          if (expense) {
            return expense;
          }
        }
      }

      throw error;
    }
  }

  throw new Error(
    "Unable to complete expense after multiple concurrent attempts.",
  );
},

  async listExpenses(
    businessId: string,
  ) {
    if (!businessId) {
      throw new Error(
        "Business context is required.",
      );
    }

    return expenseRepository.list(
      businessId,
    );
  },

  async findExpenseByReference(
    businessId: string,
    reference: string,
  ) {
    if (!businessId) {
      throw new Error(
        "Business context is required.",
      );
    }

    if (!reference.trim()) {
      throw new Error(
        "Expense reference is required.",
      );
    }

    return expenseRepository.findByReference(
      businessId,
      reference.trim(),
    );
  },

  async findExpenseById(
    businessId: string,
    expenseId: string,
  ) {
    if (!businessId) {
      throw new Error(
        "Business context is required.",
      );
    }

    if (!expenseId) {
      throw new Error(
        "Expense is required.",
      );
    }

    return expenseRepository.findById(
      businessId,
      expenseId,
    );
  },

  async updateExpensePaymentStatus(
    businessId: string,
    expenseId: string,
    paymentStatus:
      | "UNPAID"
      | "PARTIAL"
      | "PAID",
  ) {
    if (!businessId) {
      throw new Error(
        "Business context is required.",
      );
    }

    if (!expenseId) {
      throw new Error(
        "Expense is required.",
      );
    }

    return expenseRepository.updatePaymentStatus(
      businessId,
      expenseId,
      paymentStatus,
    );
  },
};