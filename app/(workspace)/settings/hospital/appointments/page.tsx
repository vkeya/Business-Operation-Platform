import { getCurrentBusinessContext } from "@/lib/business/currentBusiness";
import { requireBusinessOperationAccess } from "@/lib/subscription/businessOperationAccessService";
import { requireHospitalBusiness } from "@/lib/hospital/hospitalAccessService";
import type { BusinessType } from "@/types";
import HospitalAppointmentsWorkspace from "./HospitalAppointmentsWorkspace";

export const dynamic = "force-dynamic";

export default async function HospitalAppointmentsPage() {
  const context = await getCurrentBusinessContext();

  await requireBusinessOperationAccess(
    context.user.id,
    context.business.id,
    "hospital.appointments.read",
  );

  requireHospitalBusiness(context.business.type as BusinessType);

  return <HospitalAppointmentsWorkspace />;
}
