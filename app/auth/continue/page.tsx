import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/auth/auth";
import { prisma } from "@/lib/database/prisma";
import {
businessInvitationService,
} from "@/lib/business/businessInvitationService";

interface AuthContinuePageProps {
searchParams: Promise<{
invitation?: string;
}>;
}

export default async function AuthContinuePage() {
  let user;

  try {
    user =
      await getAuthenticatedUser();
  } catch {
    redirect("/login");
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