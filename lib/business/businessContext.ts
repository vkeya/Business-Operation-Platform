import { prisma } from "@/lib/database/prisma";

export interface BusinessContext {
  businessId: string;
  userId: string;
  branchId?: string;
}

export function createBusinessContext(
  businessId: string,
  userId: string,
  branchId?: string,
): BusinessContext {
  return {
    businessId,
    userId,
    branchId,
  };
}

export async function requireBusinessContext(
  context: BusinessContext | null | undefined,
): Promise<BusinessContext> {
  if (!context?.businessId) {
    throw new Error("Business context is required.");
  }

  if (!context.userId) {
    throw new Error("User context is required.");
  }

  const membership =
    await prisma.businessMembership.findFirst({
      where: {
        businessId: context.businessId,
        userId: context.userId,
        isActive: true,
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

  return context;
}