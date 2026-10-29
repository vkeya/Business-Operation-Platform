import { getCurrentBusinessContext } from "@/lib/business/currentBusiness";
import { requireBusinessOperationAccess } from "@/lib/subscription/businessOperationAccessService";
import { requireHospitalBusiness } from "@/lib/hospital/hospitalAccessService";
import type { BusinessType } from "@/types";

import HospitalFinancialSummaryWorkspace from "./HospitalFinancialSummaryWorkspace";

export const dynamic = "force-dynamic";

export default async function HospitalFinancialSummaryPage() {
  const context = await getCurrentBusinessContext();

  await requireBusinessOperationAccess(
    context.user.id,
    context.business.id,
    "hospital.invoices.read",
  );

  requireHospitalBusiness(context.business.type as BusinessType);

  return <HospitalFinancialSummaryWorkspace />;
}
