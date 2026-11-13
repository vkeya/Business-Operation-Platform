"use server";

import { getCurrentBusinessContext } from "@/lib/business/currentBusiness";
import { requireBusinessPermission } from "@/lib/business/businessPermissionService";
import { requireBusinessOperationAccess } from "@/lib/subscription/businessOperationAccessService";
import { requireHospitalBusiness } from "@/lib/hospital/hospitalAccessService";
import type { BusinessType } from "@/types";
import { reportService } from "./reportService";
import type { ReportPeriodInput } from "./period/reportPeriodTypes";
import { resolveReportPeriod } from "./period/reportPeriodService";

async function requireBusinessReportAccess() {
  const context = await getCurrentBusinessContext();

  await requireBusinessPermission(
    context.user.id,
    context.business.id,
    "reports.read",
  );

  return context.business;
}

async function requirePharmacyReportAccess() {
  const context = await getCurrentBusinessContext();

  await requireBusinessPermission(
    context.user.id,
    context.business.id,
    "pharmacy.reports.read",
  );

  if (context.business.type !== "pharmacy") {
    throw new Error(
      "Pharmacy reports are only available to pharmacy businesses.",
    );
  }

  return context.business;
}

export async function getBusinessReportAction() {
  const business = await requireBusinessReportAccess();

  return reportService.getBusinessReport(business.id);
}

export async function getCoreBusinessReportAction(
  input?: ReportPeriodInput,
) {
  const business = await requireBusinessReportAccess();

  const period = input
    ? resolveReportPeriod(input, business.timezone)
    : undefined;

  return reportService.getCoreBusinessReport(
    business.id,
    period,
  );
}

export async function getPharmacyControlledDispensingRegisterAction() {
  const business = await requirePharmacyReportAccess();

  return reportService.getPharmacyControlledDispensingRegister(
    business.id,
  );
}

export async function getPharmacyPrescriptionDispensingReportAction() {
  const business = await requirePharmacyReportAccess();

  return reportService.getPharmacyPrescriptionDispensingReport(
    business.id,
  );
}

export async function getPharmacyExpiryReportAction() {
  const business = await requirePharmacyReportAccess();

  return reportService.getPharmacyExpiryReport(
    business.id,
  );
}

export async function getPharmacyBatchMovementReportAction() {
  const business = await requirePharmacyReportAccess();

  return reportService.getPharmacyBatchMovementReport(
    business.id,
  );
}

export async function getPharmacyBatchStockValuationAction() {
  const business = await requirePharmacyReportAccess();

  return reportService.getPharmacyBatchStockValuation(
    business.id,
  );
}

export async function getPharmacyRecallReportAction() {
  const business = await requirePharmacyReportAccess();

  return reportService.getPharmacyRecallReport(
    business.id,
  );
}

export async function getHospitalFinancialSummaryAction(
  startDate: string,
  endDate: string,
) {
  const context = await getCurrentBusinessContext();

  await requireBusinessOperationAccess(
    context.user.id,
    context.business.id,
    "hospital.invoices.read",
  );

  requireHospitalBusiness(context.business.type as BusinessType);

  const period = resolveReportPeriod(
    {
      preset: "custom",
      startDate,
      endDate,
    },
    context.business.timezone,
  );

  return reportService.getHospitalFinancialSummary(
    context.business.id,
    period,
  );
}
