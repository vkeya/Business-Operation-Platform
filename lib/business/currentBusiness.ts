import { prisma } from "@/lib/database/prisma";

export async function getCurrentBusiness() {
  const business = await prisma.business.findFirst({
    where: {
      status: "ACTIVE",
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  if (!business) {
    throw new Error(
      "No active business is available.",
    );
  }

  return business;
}

export async function getCurrentBusinessWarehouses(
  businessId: string,
) {
  return prisma.warehouse.findMany({
    where: {
      businessId,
      isActive: true,
    },
    orderBy: {
      name: "asc",
    },
  });
}