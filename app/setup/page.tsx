import { redirect } from "next/navigation";
import { getLocale } from "@/lib/i18n/locale";
import { getTranslations } from "@/lib/i18n";
import { getAuthenticatedUser } from "@/lib/auth/auth";
import { prisma } from "@/lib/database/prisma";
import SetupForm from "./SetupForm";

export const dynamic = "force-dynamic";

export default async function SetupPage() {
  const user =
    await getAuthenticatedUser();

  const membership =
    await prisma.businessMembership.findFirst({
      where: {
        userId: user.id,
        isActive: true,
        business: {
          status: "ACTIVE",
        },
      },
      select: {
        id: true,
      },
    });

  if (membership) {
    redirect("/dashboard");
  }

  const locale = await getLocale();
  const t = getTranslations(locale);

  return <SetupForm translations={t} />;
}