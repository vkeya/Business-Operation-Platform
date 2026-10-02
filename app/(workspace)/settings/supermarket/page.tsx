import { getCurrentBusinessContext } from "@/lib/business/currentBusiness";
import { requireSupermarketBusiness } from "@/lib/supermarket/supermarketAccessService";
import { ensureSupermarketProfile } from "@/lib/supermarket/supermarketProfileService";
import SupermarketSettingsForm from "./SupermarketSettingsForm";
import type { BusinessType } from "@/types";

export const dynamic = "force-dynamic";

export default async function SupermarketSettingsPage() {
  const context = await getCurrentBusinessContext();

  requireSupermarketBusiness(
    context.business.type as BusinessType,
  );

  const profile =
    await ensureSupermarketProfile();

  return (
    <SupermarketSettingsForm
      profile={profile}
    />
  );
}