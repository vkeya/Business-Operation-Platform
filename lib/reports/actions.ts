"use server";

import { getCurrentBusiness } from "@/lib/business/currentBusiness";
import {
  reportService,
} from "./reportService";

export async function getBusinessReportAction() {
  const business =
    await getCurrentBusiness();

  return reportService.getBusinessReport(
    business.id,
  );
}