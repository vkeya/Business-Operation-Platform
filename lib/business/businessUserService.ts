import { prisma } from "@/lib/database/prisma";
import {
  getCurrentBusinessContext,
} from "./currentBusiness";
import { randomBytes } from "crypto";
import {
  createDefaultBusinessRoles,
} from "./businessRoleService";
import {
  requireBusinessPermission,
} from "./businessPermissionService";


interface CreateBusinessUserInvitationInput {
  name?: string;
  email: string;
  roleId: string;
}

async function requireUserManagementAccess(
  permission: string,
) {
  const context =
    await getCurrentBusinessContext();

  await requireBusinessPermission(
    context.user.id,
    context.business.id,
    permission,
  );

  return context;
}

export const businessUserService = {
  async listUsers() {
  const context =
    await requireUserManagementAccess(
      "users.read",
    );

    const memberships =
      await prisma.businessMembership.findMany({
        where: {
          businessId: context.business.id,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              isActive: true,
              roles: {
                where: {
                  role: {
                    businessId:
                      context.business.id,
                  },
                },
                include: {
                  role: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      });

    return memberships.map(
      (membership) => ({
        membershipId: membership.id,
        userId: membership.user.id,
        name: membership.user.name,
        email: membership.user.email,
        isActive:
          membership.isActive &&
          membership.user.isActive,
        isOwner: membership.isOwner,
        roles: membership.user.roles.map(
          ({ role }) => ({
            id: role.id,
            name: role.name,
          }),
        ),
        createdAt: membership.createdAt,
      }),
    );
  },

  async listRoles() {
  const context =
    await requireUserManagementAccess(
      "roles.read",
    );

  await createDefaultBusinessRoles(
    context.business.id,
  );

  return prisma.role.findMany({
    where: {
      businessId: context.business.id,
    },
    select: {
      id: true,
      name: true,
      description: true,
      permissions: true,
      isSystemRole: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
},

    async listInvitations() {
  const context =
    await requireUserManagementAccess(
      "users.read",
    );

    return prisma.businessUserInvitation.findMany({
      where: {
        businessId: context.business.id,
      },
      select: {
  id: true,
  name: true,
  email: true,
  expiresAt: true,
        acceptedAt: true,
        createdAt: true,
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },

    async revokeInvitation(
  invitationId: string,
) {
  const context =
    await requireUserManagementAccess(
      "users.update",
    );

    const invitation =
      await prisma.businessUserInvitation.findFirst({
        where: {
          id: invitationId,
          businessId:
            context.business.id,
        },
        select: {
          id: true,
          acceptedAt: true,
        },
      });

    if (!invitation) {
      throw new Error(
        "This invitation does not belong to the current business.",
      );
    }

    if (invitation.acceptedAt) {
      throw new Error(
        "An accepted invitation cannot be revoked.",
      );
    }

    await prisma.businessUserInvitation.delete({
      where: {
        id: invitation.id,
      },
    });

    return {
      id: invitation.id,
    };
  },

    async resendInvitation(
  invitationId: string,
) {
  const context =
    await requireUserManagementAccess(
      "users.update",
    );

    const invitation =
      await prisma.businessUserInvitation.findFirst({
        where: {
          id: invitationId,
          businessId:
            context.business.id,
        },
        select: {
  id: true,
  acceptedAt: true,
  email: true,
  name: true,
  roleId: true,
  role: {
    select: {
      id: true,
      name: true,
    },
  },
},
      });

    if (!invitation) {
      throw new Error(
        "This invitation does not belong to the current business.",
      );
    }

    if (invitation.acceptedAt) {
      throw new Error(
        "An accepted invitation cannot be resent.",
      );
    }

    const token =
      randomBytes(32).toString("hex");

    const expiresAt =
      new Date(
        Date.now() +
          7 * 24 * 60 * 60 * 1000,
      );

    await prisma.businessUserInvitation.update({
  where: {
    id: invitation.id,
  },
  data: {
    token,
    expiresAt,
  },
});

return {
  email: invitation.email,
  expiresAt,
  role: {
    id: invitation.role.id,
    name: invitation.role.name,
  },
};
  },

  async createInvitation(
  input: CreateBusinessUserInvitationInput,
) {
  const context =
    await requireUserManagementAccess(
      "users.create",
    );

	await requireBusinessPermission(
  context.user.id,
  context.business.id,
  "roles.manage",
);

  const name =
    input.name?.trim() || undefined;

  const email =
    input.email
      .trim()
      .toLowerCase();

  if (!email) {
    throw new Error(
      "User email is required.",
    );
  }

  const role =
  await prisma.role.findFirst({
    where: {
      id: input.roleId,
      businessId:
        context.business.id,
    },
    select: {
      id: true,
      name: true,
      isSystemRole: true,
    },
  });

  if (!role) {
    throw new Error(
      "The selected role does not belong to this business.",
    );
  }

  if (role.name === "Business Owner") {
  throw new Error(
    "The Business Owner role cannot be assigned through an invitation.",
  );
}

  const token =
    randomBytes(32).toString("hex");

  const expiresAt =
    new Date(
      Date.now() +
        7 * 24 * 60 * 60 * 1000,
    );

  const existingInvitation =
    await prisma.businessUserInvitation.findFirst({
      where: {
        businessId:
          context.business.id,
        email,
        acceptedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

  if (existingInvitation) {
    await prisma.businessUserInvitation.delete({
      where: {
        id: existingInvitation.id,
      },
    });
  }

  const invitation =
    await prisma.businessUserInvitation.create({
      data: {
        businessId:
          context.business.id,
        email,
        name,
        roleId: role.id,
        token,
        expiresAt,
      },
      select: {
        id: true,
        email: true,
        name: true,
        token: true,
        expiresAt: true,
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

  return {
    ...invitation,
    businessId:
      context.business.id,
  };
},

  async setUserActive(
  userId: string,
  isActive: boolean,
) {
  const context =
    await requireUserManagementAccess(
      "users.update",
    );

    const membership =
      await prisma.businessMembership.findFirst({
        where: {
          businessId:
            context.business.id,
          userId,
        },
      });

    if (!membership) {
      throw new Error(
        "This user does not belong to the current business.",
      );
    }

    if (membership.isOwner) {
      throw new Error(
        "The Business Owner membership cannot be deactivated here.",
      );
    }

    return prisma.businessMembership.update({
      where: {
        id: membership.id,
      },
      data: {
        isActive,
      },
    });
  },
};