import {
  expenseRepository,
  type CreateExpenseInput,
} from "./expenseRepository";

export const expenseService = {
  async createExpense(
    input: CreateExpenseInput,
  ) {
    if (!input.businessId) {
      throw new Error(
        "Business context is required.",
      );
    }

    if (!input.reference.trim()) {
      throw new Error(
        "Expense reference is required.",
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

    if (!(input.expenseDate instanceof Date) ||
        Number.isNaN(
          input.expenseDate.getTime(),
        )) {
      throw new Error(
        "A valid expense date is required.",
      );
    }

    return expenseRepository.create({
      ...input,
      reference:
        input.reference.trim(),
      category:
        input.category.trim(),
      description:
        input.description.trim(),
      currency:
        input.currency.trim(),
    });
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