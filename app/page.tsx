import { redirect } from "next/navigation";
import { prisma } from "@/lib/database/prisma";
import {
  getAuthenticatedUser,
} from "@/lib/auth/auth";

export default async function HomePage() {
  let user;

  try {
    user = await getAuthenticatedUser();
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
      orderBy: {
        createdAt: "asc",
      },
    });

  if (!membership) {
    redirect("/setup");
  }

  redirect("/dashboard");
}