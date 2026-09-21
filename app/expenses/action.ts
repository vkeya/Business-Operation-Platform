"use server";

import {
  getCurrentBusinessContext,
} from "@/lib/business/currentBusiness";
import {
  expenseService,
} from "@/lib/expenses/expenseService";

import {
  requireBusinessPermission,
} from "@/lib/business/businessPermissionService";
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

	await requireBusinessPermission(
  context.user.id,
  context.business.id,
  "expenses.manage",
);

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

	await requireBusinessPermission(
  context.user.id,
  context.business.id,
  "expenses.read",
);

  return expenseService.listExpenses(
    context.business.id,
  );
}

export async function getExpenseByReferenceAction(
  reference: string,
) {
  const context =
    await getCurrentBusinessContext();

	await requireBusinessPermission(
  context.user.id,
  context.business.id,
  "expenses.read",
);

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

	await requireBusinessPermission(
  context.user.id,
  context.business.id,
  "expenses.read",
);

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

	await requireBusinessPermission(
  context.user.id,
  context.business.id,
  "expenses.manage",
);

  return expenseService.updateExpensePaymentStatus(
    context.business.id,
    expenseId,
    paymentStatus,
  );
}