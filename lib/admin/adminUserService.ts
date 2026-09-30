import { prisma } from "@/lib/database/prisma";

export interface AdminUserListItem {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  emailVerifiedAt: Date | null;
  createdAt: Date;
  businesses: Array<{
    id: string;
    name: string;
    isActive: boolean;
    isOwner: boolean;
    roles: Array<{
      id: string;
      name: string;
    }>;
  }>;
}

export interface AdminUserSummary {
  total: number;
  active: number;
  inactive: number;
  verified: number;
  unverified: number;
}

export async function getAdminUserSummary(): Promise<AdminUserSummary> {
  const [
    total,
    active,
    inactive,
    verified,
    unverified,
  ] = await Promise.all([
    prisma.user.count(),

    prisma.user.count({
      where: {
        isActive: true,
      },
    }),

    prisma.user.count({
      where: {
        isActive: false,
      },
    }),

    prisma.user.count({
      where: {
        emailVerifiedAt: {
          not: null,
        },
      },
    }),

    prisma.user.count({
      where: {
        emailVerifiedAt: null,
      },
    }),
  ]);

  return {
    total,
    active,
    inactive,
    verified,
    unverified,
  };
}

export async function listAdminUsers(): Promise<
  AdminUserListItem[]
> {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      isActive: true,
      emailVerifiedAt: true,
      createdAt: true,

      memberships: {
        select: {
          isActive: true,
          isOwner: true,

          business: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },

      roles: {
        select: {
          role: {
            select: {
              id: true,
              name: true,
              businessId: true,
            },
          },
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    isActive: user.isActive,
    emailVerifiedAt: user.emailVerifiedAt,
    createdAt: user.createdAt,

    businesses: user.memberships.map(
      (membership) => ({
        id: membership.business.id,
        name: membership.business.name,
        isActive: membership.isActive,
        isOwner: membership.isOwner,

        roles: user.roles
          .filter(
            ({ role }) =>
              role.businessId ===
              membership.business.id,
          )
          .map(({ role }) => ({
            id: role.id,
            name: role.name,
          })),
      }),
    ),
  }));
}