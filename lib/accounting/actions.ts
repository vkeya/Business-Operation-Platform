"use server";

import { getCurrentBusiness } from "@/lib/business/currentBusiness";
import {
  accountService,
} from "./accountService";
import {
  getAuthenticatedUserId,
} from "@/lib/auth/auth";
import {
  requireBusinessPermission,
} from "@/lib/business/businessPermissionService";

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

	await requireBusinessPermission(
    userId,
    business.id,
    "accounting.manage",
  );

  await accountService.createDefaultAccounts(
    business.id,
  );
}