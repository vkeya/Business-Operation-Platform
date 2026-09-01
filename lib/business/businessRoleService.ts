import { prisma } from "@/lib/database/prisma";

export const DEFAULT_BUSINESS_ROLES = [
  {
    name: "Business Owner",
    description:
      "Full control of the business and all business settings.",
    permissions: ["*"],
  },
  {
    name: "Administrator",
    description:
      "Administrative access to manage business operations and users.",
    permissions: [
      "business.read",
      "business.update",
      "users.read",
      "users.create",
      "users.update",
      "roles.read",
      "roles.manage",
      "inventory.read",
      "inventory.manage",
      "purchases.read",
      "purchases.manage",
      "sales.read",
      "sales.manage",
      "payments.read",
      "payments.manage",
    ],
  },
  {
    name: "Manager",
    description:
      "Operational management access for the business.",
    permissions: [
      "business.read",
      "inventory.read",
      "inventory.manage",
      "purchases.read",
      "purchases.manage",
      "sales.read",
      "sales.manage",
      "payments.read",
      "payments.manage",
    ],
  },
  {
    name: "Staff",
    description:
      "Standard operational access.",
    permissions: [
      "business.read",
      "inventory.read",
      "sales.read",
      "sales.manage",
    ],
  },
] as const;

export async function createDefaultBusinessRoles(
  businessId: string,
) {
  await prisma.role.createMany({
    data: DEFAULT_BUSINESS_ROLES.map(
      (role) => ({
        businessId,
        name: role.name,
        description: role.description,
        permissions: [...role.permissions],
        isSystemRole: true,
      }),
    ),
    skipDuplicates: true,
  });

  const ownerRole =
    await prisma.role.findUnique({
      where: {
        businessId_name: {
          businessId,
          name: "Business Owner",
        },
      },
    });

  if (!ownerRole) {
    throw new Error(
      "Unable to create the Business Owner role.",
    );
  }

  return ownerRole;
}

export async function assignBusinessOwnerRole(
  userId: string,
  businessId: string,
) {
  const ownerRole =
    await createDefaultBusinessRoles(
      businessId,
    );

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId,
        roleId: ownerRole.id,
      },
    },
    update: {},
    create: {
      userId,
      roleId: ownerRole.id,
    },
  });

  return ownerRole;
}