
import { getCurrentBusinessContext } from "@/lib/business/currentBusiness";
import { requireHospitalBusiness } from "@/lib/hospital/hospitalAccessService";
import { ensureHospitalProfile } from "@/lib/hospital/hospitalProfileService";
import HospitalSettingsForm from "./HospitalSettingsForm";
import type { BusinessType } from "@/types";

export const dynamic = "force-dynamic";

export default async function HospitalSettingsPage() {
  const context = await getCurrentBusinessContext();

  requireHospitalBusiness(
    context.business.type as BusinessType,
  );

  const profile = await ensureHospitalProfile();

  return <HospitalSettingsForm profile={profile} />;
}
