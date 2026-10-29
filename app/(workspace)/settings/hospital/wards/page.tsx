import { getCurrentBusinessContext } from "@/lib/business/currentBusiness";
import { requireBusinessOperationAccess } from "@/lib/subscription/businessOperationAccessService";
import { requireHospitalBusiness } from "@/lib/hospital/hospitalAccessService";
import type { BusinessType } from "@/types";
import HospitalWardsWorkspace from "./HospitalWardsWorkspace";

export const dynamic = "force-dynamic";

export default async function HospitalWardsPage() {
  const context = await getCurrentBusinessContext();

  await requireBusinessOperationAccess(
    context.user.id,
    context.business.id,
    "hospital.wards.read",
  );

  requireHospitalBusiness(context.business.type as BusinessType);

  return <HospitalWardsWorkspace />;
}
