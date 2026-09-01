import { prisma } from "@/lib/database/prisma";

interface ResolveOAuthUserInput {
  provider: string;
  providerAccountId: string;
  email: string;
  name?: string | null;
}

export const authIdentityService = {
  async resolveOAuthUser(
    input: ResolveOAuthUserInput,
  ) {
    const provider =
      input.provider.trim().toLowerCase();

    const providerAccountId =
      input.providerAccountId.trim();

    const email =
      input.email.trim().toLowerCase();

    if (!provider) {
      throw new Error(
        "Authentication provider is required.",
      );
    }

    if (!providerAccountId) {
      throw new Error(
        "Provider account ID is required.",
      );
    }

    if (!email) {
      throw new Error(
        "Email address is required.",
      );
    }

    const existingIdentity =
      await prisma.authIdentity.findUnique({
        where: {
          provider_providerAccountId: {
            provider,
            providerAccountId,
          },
        },
        include: {
          user: true,
        },
      });

    if (existingIdentity) {
      if (!existingIdentity.user.isActive) {
        throw new Error(
          "This user account is inactive.",
        );
      }

      return existingIdentity.user;
    }

    const existingUser =
      await prisma.user.findUnique({
        where: {
          email,
        },
      });

    if (existingUser) {
  if (!existingUser.isActive) {
    throw new Error(
      "This user account is inactive.",
    );
  }

  throw new Error(
    "An account with this email already exists. " +
    "Sign in using your existing authentication method " +
    "before linking Google.",
  );
}

    const user =
      await prisma.user.create({
        data: {
          name:
            input.name?.trim() ||
            email.split("@")[0],
          email,
          
          authIdentities: {
            create: {
              provider,
              providerAccountId,
            },
          },
        },
      });

    return user;
  },
};