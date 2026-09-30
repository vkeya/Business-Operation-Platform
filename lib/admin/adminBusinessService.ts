import { prisma } from "@/lib/database/prisma";

export interface AdminBusinessListItem {
  id: string;
  name: string;
  type: string;
  country: string;
  baseCurrency: string;
  status: string;
  createdAt: Date;
  memberCount: number;
  activeMemberCount: number;
  pendingInvitationCount: number;
}

export interface AdminBusinessSummary {
  total: number;
  active: number;
  inactive: number;
  pendingInvitations: number;
}

export async function getAdminBusinessSummary(): Promise<
  AdminBusinessSummary
> {
  const [
    total,
    active,
    inactive,
    pendingInvitations,
  ] = await Promise.all([
    prisma.business.count(),

    prisma.business.count({
      where: {
        status: "ACTIVE",
      },
    }),

    prisma.business.count({
      where: {
        status: {
          not: "ACTIVE",
        },
      },
    }),

    prisma.businessUserInvitation.count({
      where: {
        acceptedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
    }),
  ]);

  return {
    total,
    active,
    inactive,
    pendingInvitations,
  };
}

export async function listAdminBusinesses(): Promise<
  AdminBusinessListItem[]
> {
  const businesses =
    await prisma.business.findMany({
      select: {
        id: true,
        name: true,
        type: true,
        country: true,
        baseCurrency: true,
        status: true,
        createdAt: true,

        memberships: {
          select: {
            isActive: true,
          },
        },

        invitations: {
          where: {
            acceptedAt: null,
            expiresAt: {
              gt: new Date(),
            },
          },
          select: {
            id: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

  return businesses.map((business) => ({
    id: business.id,
    name: business.name,
    type: business.type,
    country: business.country,
    baseCurrency: business.baseCurrency,
    status: business.status,
    createdAt: business.createdAt,

    memberCount:
      business.memberships.length,

    activeMemberCount:
      business.memberships.filter(
        (membership) =>
          membership.isActive,
      ).length,

    pendingInvitationCount:
      business.invitations.length,
  }));
}