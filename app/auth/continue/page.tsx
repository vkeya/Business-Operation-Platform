import { redirect } from "next/navigation";

import { getAuthenticatedUser } from "@/lib/auth/auth";
import { prisma } from "@/lib/database/prisma";
import {
  getRequiredLegalAcceptanceStatus,
} from "@/lib/legal/legalAcceptanceService";

export default async function AuthContinuePage() {
  let user;

  try {
    user = await getAuthenticatedUser();
  } catch {
    redirect("/login");
  }

  const legalStatus =
    await getRequiredLegalAcceptanceStatus(user.id);

  if (legalStatus.requiresReacceptance) {
    redirect("/legal/review");
  }

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
        businessId: true,
      },
    });

  if (!membership) {
    redirect("/setup");
  }

  redirect("/dashboard");
}