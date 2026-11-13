"use server";

import { getCurrentBusiness } from "@/lib/business/currentBusiness";
import {
  accountService,
} from "./accountService";
import {
  getProfitLossByCurrency,
} from "./reporting/profitLoss";

import type {
  ReportPeriodInput,
} from "@/lib/reports/period/reportPeriodTypes";

import {
  resolveReportPeriod,
} from "@/lib/reports/period/reportPeriodService";
import {
  getAuthenticatedUserId,
} from "@/lib/auth/auth";
import {
  requireBusinessPermission,
} from "@/lib/business/businessPermissionService";
import { requireBusinessOperationAccess } from "@/lib/subscription/businessOperationAccessService";

export async function getAccountsAction() {
  const business =
    await getCurrentBusiness();

	const userId =
    await getAuthenticatedUserId();

  await requireBusinessPermission(
    userId,
    business.id,
    "accounting.read",
  );

  return accountService.listAccounts(
    business.id,
  );
}


export async function initializeAccountsAction() {
  const business =
    await getCurrentBusiness();

	const userId =
    await getAuthenticatedUserId();

	await requireBusinessOperationAccess(
  userId,
  business.id,
  "accounting.manage",
);

  await accountService.createDefaultAccounts(
    business.id,
  );
}

export async function getProfitLossReportAction(
  input: ReportPeriodInput,
) {
  const business = await getCurrentBusiness();
  const userId = await getAuthenticatedUserId();

  await requireBusinessPermission(
    userId,
    business.id,
    "accounting.read",
  );

  const period = resolveReportPeriod(
    input,
    business.timezone,
  );

  return getProfitLossByCurrency(
    business.id,
    period,
  );
}