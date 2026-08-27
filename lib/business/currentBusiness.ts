import { cookies } from "next/headers";
import { prisma } from "@/lib/database/prisma";

const CURRENT_BUSINESS_COOKIE =
  "teketeke_current_business";

export async function getCurrentBusiness() {
  const cookieStore = await cookies();

  const businessId = cookieStore.get(
    CURRENT_BUSINESS_COOKIE,
  )?.value;

  if (businessId) {
    const selectedBusiness =
      await prisma.business.findFirst({
        where: {
          id: businessId,
          status: "ACTIVE",
        },
      });

    if (selectedBusiness) {
      return selectedBusiness;
    }
  }

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