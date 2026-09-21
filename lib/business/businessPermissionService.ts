import { prisma } from "@/lib/database/prisma";


export class BusinessPermissionError extends Error {
  readonly statusCode = 403;

  constructor(message: string) {
    super(message);
    this.name = "BusinessPermissionError";
  }
}

export async function requireBusinessPermission(
  userId: string,
  businessId: string,
  permission: string,
) {
  if (!userId) {
    throw new Error("User context is required.");
  }

  if (!businessId) {
    throw new Error("Business context is required.");
  }

  if (!permission) {
    throw new Error("Permission is required.");
  }

  const membership =
    await prisma.businessMembership.findFirst({
      where: {
        businessId,
        userId,
        isActive: true,
        business: {
          status: "ACTIVE",
        },
      },
      select: {
        isOwner: true,
      },
    });

  if (!membership) {
  throw new BusinessPermissionError(
    "You do not have access to this business.",
  );
}

  if (membership.isOwner) {
    return true;
  }

  const userRoles =
    await prisma.userRole.findMany({
      where: {
        userId,
        role: {
          businessId,
        },
      },
      select: {
        role: {
          select: {
            permissions: true,
          },
        },
      },
    });

  const hasPermission =
    userRoles.some(({ role }) =>
      role.permissions.includes("*") ||
      role.permissions.includes(permission),
    );

  if (!hasPermission) {
  throw new BusinessPermissionError(
    `You do not have permission to perform this action: ${permission}.`,
  );
}

  return true;
}