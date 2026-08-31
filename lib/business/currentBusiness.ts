import { cookies } from "next/headers";
import { prisma } from "@/lib/database/prisma";
import {
  getAuthenticatedUser,
} from "@/lib/auth/auth";

const CURRENT_BUSINESS_COOKIE =
  "teketeke_current_business";

export interface CurrentBusinessContext {
  user: {
    id: string;
    email: string;
    name?: string;
  };

  business: {
    id: string;
    name: string;
    type: string;
    country: string;
    baseCurrency: string;
    language: string;
    timezone: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  };
}



export async function getCurrentBusinessContext(): Promise<
  CurrentBusinessContext
> {
  const user =
  await getAuthenticatedUser();

  const cookieStore = await cookies();

  const businessId = cookieStore.get(
    CURRENT_BUSINESS_COOKIE,
  )?.value;

  if (businessId) {
    const membership =
      await prisma.businessMembership.findFirst({
        where: {
          userId: user.id,
          businessId,
          isActive: true,
          business: {
            status: "ACTIVE",
          },
        },
        include: {
          business: true,
        },
      });

    if (membership) {
      return {
        user,
        business: membership.business,
      };
    }
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
      include: {
        business: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

  if (!membership) {
    throw new Error(
      "You do not have access to any active business.",
    );
  }

  return {
    user,
    business: membership.business,
  };
}

export async function getCurrentBusiness() {
  const context =
    await getCurrentBusinessContext();

  return context.business;
}

export async function getCurrentBusinessWarehouses(
  businessId: string,
) {
  const context =
    await getCurrentBusinessContext();

  if (context.business.id !== businessId) {
    const membership =
      await prisma.businessMembership.findFirst({
        where: {
          userId: context.user.id,
          businessId,
          isActive: true,
          business: {
            status: "ACTIVE",
          },
        },
        select: {
          id: true,
        },
      });

    if (!membership) {
      throw new Error(
        "You do not have access to this business.",
      );
    }
  }

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