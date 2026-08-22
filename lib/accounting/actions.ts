"use server";

import { getCurrentBusiness } from "@/lib/business/currentBusiness";
import {
  accountService,
} from "./accountService";


export async function getAccountsAction() {
  const business =
    await getCurrentBusiness();

  return accountService.listAccounts(
    business.id,
  );
}


export async function initializeAccountsAction() {
  const business =
    await getCurrentBusiness();

  await accountService.createDefaultAccounts(
    business.id,
  );
}