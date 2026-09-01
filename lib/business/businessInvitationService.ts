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

    const invitation =
      await this.getInvitation(token);

    if (
      invitation.email
        .trim()
        .toLowerCase() !== email
    ) {
      throw new Error(
        "This invitation belongs to a different email address.",
      );
    }

    return prisma.$transaction(
      async (transaction) => {
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
                userId: existingUser.id,
              },
            },
            update: {
              isActive: true,
            },
            create: {
              businessId:
                invitation.businessId,
              userId: existingUser.id,
              isActive: true,
              isOwner: false,
            },
          });

        await transaction.userRole.upsert({
          where: {
            userId_roleId: {
              userId: existingUser.id,
              roleId: invitation.roleId,
            },
          },
          update: {},
          create: {
            userId: existingUser.id,
            roleId: invitation.roleId,
          },
        });

        await transaction.businessUserInvitation.update({
          where: {
            id: invitation.id,
          },
          data: {
            acceptedAt: new Date(),
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