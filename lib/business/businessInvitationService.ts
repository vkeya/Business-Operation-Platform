import { prisma } from "@/lib/database/prisma";

interface AcceptInvitationInput {
  token: string;
  userId: string;
  email: string;
}

export const businessInvitationService = {
  async getInvitation(token: string) {
    const invitationToken = token.trim();

    if (!invitationToken) {
      throw new Error(
        "Invitation token is required.",
      );
    }

    const invitation =
      await prisma.businessUserInvitation.findUnique({
        where: {
          token: invitationToken,
        },
        include: {
          business: {
            select: {
              id: true,
              name: true,
              status: true,
            },
          },
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
        "This invitation is invalid.",
      );
    }

    if (invitation.acceptedAt) {
      throw new Error(
        "This invitation has already been accepted.",
      );
    }

    if (invitation.expiresAt <= new Date()) {
      throw new Error(
        "This invitation has expired.",
      );
    }

    if (invitation.business.status !== "ACTIVE") {
      throw new Error(
        "This business is not currently active.",
      );
    }

    return invitation;
  },

  async acceptInvitation(
  input: AcceptInvitationInput,
) {
  const token =
    input.token.trim();

  const email =
    input.email
      .trim()
      .toLowerCase();

  if (!token) {
    throw new Error(
      "Invitation token is required.",
    );
  }

  if (!email) {
    throw new Error(
      "Invitation email is required.",
    );
  }

  return prisma.$transaction(
    async (transaction) => {
      /*
       * Lock the invitation by updating it only when it is
       * still pending. This makes invitation consumption
       * atomic: only one concurrent request can claim it.
       */
      const claimResult =
        await transaction.businessUserInvitation.updateMany({
          where: {
            token,
            acceptedAt: null,
            expiresAt: {
              gt: new Date(),
            },
          },
          data: {
            acceptedAt: new Date(),
          },
        });

      if (claimResult.count !== 1) {
        const invitation =
          await transaction.businessUserInvitation.findUnique({
            where: {
              token,
            },
            include: {
              business: {
                select: {
                  id: true,
                  name: true,
                  status: true,
                },
              },
            },
          });

        if (!invitation) {
          throw new Error(
            "This invitation is invalid.",
          );
        }

        if (invitation.acceptedAt) {
          throw new Error(
            "This invitation has already been accepted.",
          );
        }

        if (invitation.expiresAt <= new Date()) {
          throw new Error(
            "This invitation has expired.",
          );
        }

        if (
          invitation.business.status !==
          "ACTIVE"
        ) {
          throw new Error(
            "This business is not currently active.",
          );
        }

        throw new Error(
          "This invitation could not be accepted.",
        );
      }

      const invitation =
        await transaction.businessUserInvitation.findUnique({
          where: {
            token,
          },
          include: {
            business: {
              select: {
                id: true,
                name: true,
                status: true,
              },
            },
            role: {
              select: {
                id: true,
                name: true,
                businessId: true,
                isSystemRole: true,
              },
            },
          },
        });

      if (!invitation) {
        throw new Error(
          "This invitation is invalid.",
        );
      }

      if (
        invitation.business.status !==
        "ACTIVE"
      ) {
        throw new Error(
          "This business is not currently active.",
        );
      }

      if (
        invitation.email
          .trim()
          .toLowerCase() !== email
      ) {
        throw new Error(
          "This invitation belongs to a different email address.",
        );
      }

      /*
       * Revalidate the role inside the same transaction.
       */
      if (
        invitation.role.businessId !==
        invitation.businessId
      ) {
        throw new Error(
          "The invitation role is no longer valid for this business.",
        );
      }

      if (
        invitation.role.name ===
        "Business Owner"
      ) {
        throw new Error(
          "The Business Owner role cannot be assigned through an invitation.",
        );
      }

      const existingUser =
        await transaction.user.findUnique({
          where: {
            id: input.userId,
          },
          select: {
            id: true,
            email: true,
            isActive: true,
          },
        });

      if (!existingUser) {
        throw new Error(
          "Your user account could not be found.",
        );
      }

      if (!existingUser.isActive) {
        throw new Error(
          "Your user account is inactive.",
        );
      }

      if (
        existingUser.email
          .trim()
          .toLowerCase() !== email
      ) {
        throw new Error(
          "Your authenticated account does not match this invitation.",
        );
      }

      const membership =
        await transaction.businessMembership.upsert({
          where: {
            businessId_userId: {
              businessId:
                invitation.businessId,
              userId:
                existingUser.id,
            },
          },
          update: {
            isActive: true,
          },
          create: {
            businessId:
              invitation.businessId,
            userId:
              existingUser.id,
            isActive: true,
            isOwner: false,
          },
        });

      await transaction.userRole.upsert({
        where: {
          userId_roleId: {
            userId:
              existingUser.id,
            roleId:
              invitation.roleId,
          },
        },
        update: {},
        create: {
          userId:
            existingUser.id,
          roleId:
            invitation.roleId,
        },
      });

      return {
        businessId:
          invitation.businessId,
        membershipId:
          membership.id,
        roleId:
          invitation.roleId,
      };
    },
  );
},
};