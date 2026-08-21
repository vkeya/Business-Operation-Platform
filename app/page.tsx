import { redirect } from "next/navigation";
import { prisma } from "@/lib/database/prisma";

export default async function HomePage() {
  const business = await prisma.business.findFirst({
    where: {
      status: "ACTIVE",
    },
    orderBy: {
      createdAt: "asc",
    },
    select: {
      id: true,
    },
  });

  if (!business) {
    redirect("/setup");
  }

  redirect("/dashboard");
}