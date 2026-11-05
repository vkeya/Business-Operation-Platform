
import { getCurrentBusinessContext } from "@/lib/business/currentBusiness";
import { requireBusinessPermission } from "@/lib/business/businessPermissionService";
import { businessProfileService } from "@/lib/business/businessProfileService";
import BusinessProfileForm from "./BusinessProfileForm";

export const dynamic = "force-dynamic";

export default async function BusinessProfilePage() {
  const context = await getCurrentBusinessContext();

  await requireBusinessPermission(
    context.user.id,
    context.business.id,
    "settings.read",
  );

  const profile = await businessProfileService.getProfile(
    context.business.id,
  );

  if (!profile) {
    throw new Error("Business profile could not be found.");
  }

  return <BusinessProfileForm profile={profile} />;
}
