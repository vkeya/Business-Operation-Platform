"use server";

import { getCurrentBusiness } from "@/lib/business/currentBusiness";
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
  const business =
    await getCurrentBusiness();

  return expenseService.createExpense({
    ...input,
    businessId: business.id,
    createdBy: business.id,
  });
}

export async function getExpensesAction() {
  const business =
    await getCurrentBusiness();

  return expenseService.listExpenses(
    business.id,
  );
}

export async function getExpenseByReferenceAction(
  reference: string,
) {
  const business =
    await getCurrentBusiness();

  return expenseService.findExpenseByReference(
    business.id,
    reference,
  );
}

export async function getExpenseByIdAction(
  expenseId: string,
) {
  const business =
    await getCurrentBusiness();

  return expenseService.findExpenseById(
    business.id,
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
  const business =
    await getCurrentBusiness();

  return expenseService.updateExpensePaymentStatus(
    business.id,
    expenseId,
    paymentStatus,
  );
}