import { getCurrentBusinessContext } from "@/lib/business/currentBusiness";
import { requireBusinessOperationAccess } from "@/lib/subscription/businessOperationAccessService";
import { requireHospitalBusiness } from "@/lib/hospital/hospitalAccessService";
import type { BusinessType } from "@/types";
import HospitalLaboratoryWorkspace from "./HospitalLaboratoryWorkspace";

export const dynamic = "force-dynamic";

export default async function HospitalLaboratoryPage() {
  const context = await getCurrentBusinessContext();

  await requireBusinessOperationAccess(
    context.user.id,
    context.business.id,
    "hospital.labs.read",
  );

  requireHospitalBusiness(context.business.type as BusinessType);

  return <HospitalLaboratoryWorkspace />;
}
