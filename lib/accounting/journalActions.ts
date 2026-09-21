"use server";

import { getCurrentBusiness } from "@/lib/business/currentBusiness";
import {
  journalService,
  } from "./journalService";
  import {
  getAuthenticatedUserId,
} from "@/lib/auth/auth";
import {
  requireBusinessPermission,
} from "@/lib/business/businessPermissionService";

export async function getJournalEntriesAction() {
  const business =
    await getCurrentBusiness();

	 const userId =
    await getAuthenticatedUserId();

  await requireBusinessPermission(
    userId,
    business.id,
    "accounting.read",
  );

  return journalService.list(
    business.id,
  );
}


export async function createJournalEntryAction(
  input: Parameters<
    typeof journalService.create
  >[0],
) {
  const business =
    await getCurrentBusiness();

	const userId =
    await getAuthenticatedUserId();

  await requireBusinessPermission(
    userId,
    business.id,
    "accounting.manage",
  );

  return journalService.create({
    ...input,
    businessId:
      business.id,
  });
}