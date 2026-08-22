"use server";

import { getCurrentBusiness } from "@/lib/business/currentBusiness";
import {
  moneyService,
} from "./moneyService";

export async function getMoneySummaryAction() {
  const business =
    await getCurrentBusiness();

  return moneyService.getBusinessSummary(
    business.id,
  );
}


export async function getMoneyActivityAction() {
  const business =
    await getCurrentBusiness();

  return moneyService.getRecentActivity(
    business.id,
  );
}