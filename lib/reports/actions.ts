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

export async function getPharmacyControlledDispensingRegisterAction() {
  const business =
    await getCurrentBusiness();

  return reportService.getPharmacyControlledDispensingRegister(
    business.id,
  );
}

export async function getPharmacyPrescriptionDispensingReportAction() {
  const business = await getCurrentBusiness();

  return reportService.getPharmacyPrescriptionDispensingReport(
    business.id,
  );
}

export async function getPharmacyExpiryReportAction() {
  const business = await getCurrentBusiness();

  return reportService.getPharmacyExpiryReport(
    business.id,
  );
}

export async function getPharmacyBatchMovementReportAction() {
  const business = await getCurrentBusiness();

  return reportService.getPharmacyBatchMovementReport(
    business.id,
  );
}

export async function getPharmacyBatchStockValuationAction() {
  const business = await getCurrentBusiness();

  return reportService.getPharmacyBatchStockValuation(
    business.id,
  );
}

export async function getPharmacyRecallReportAction() {
  const business = await getCurrentBusiness();

  return reportService.getPharmacyRecallReport(
    business.id,
  );
}