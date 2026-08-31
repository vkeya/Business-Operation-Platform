"use server";

import {
  getCurrentBusinessContext,
} from "@/lib/business/currentBusiness";
import {
  expenseService,
} from "@/lib/expenses/expenseService";
import type {
  CreateExpenseInput,
} from "@/lib/expenses/expenseRepository";

export async function createExpenseAction(
  input: Omit<
    CreateExpenseInput,
    "businessId" | "createdBy"
  >,
) {
  const context =
    await getCurrentBusinessContext();

  return expenseService.createExpense({
    ...input,
    businessId:
      context.business.id,
    createdBy:
      context.user.id,
  });
}

export async function getExpensesAction() {
  const context =
    await getCurrentBusinessContext();

  return expenseService.listExpenses(
    context.business.id,
  );
}

export async function getExpenseByReferenceAction(
  reference: string,
) {
  const context =
    await getCurrentBusinessContext();

  return expenseService.findExpenseByReference(
    context.business.id,
    reference,
  );
}

export async function getExpenseByIdAction(
  expenseId: string,
) {
  const context =
    await getCurrentBusinessContext();

  return expenseService.findExpenseById(
    context.business.id,
    expenseId,
  );
}

export async function updateExpensePaymentStatusAction(
  expenseId: string,
  paymentStatus:
    | "UNPAID"
    | "PARTIAL"
    | "PAID",
) {
  const context =
    await getCurrentBusinessContext();

  return expenseService.updateExpensePaymentStatus(
    context.business.id,
    expenseId,
    paymentStatus,
  );
}