"use server";

import { getCurrentBusiness } from "@/lib/business/currentBusiness";
import {
  journalService,
  } from "./journalService";

export async function getJournalEntriesAction() {
  const business =
    await getCurrentBusiness();

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

  return journalService.create({
    ...input,
    businessId:
      business.id,
  });
}