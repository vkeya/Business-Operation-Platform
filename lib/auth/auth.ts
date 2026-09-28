import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { getServerSession } from "next-auth";

import { authIdentityService } from "@/lib/auth/authIdentityService";
import { prisma } from "@/lib/database/prisma";
import { verifyPassword } from "@/lib/auth/password";

export const authOptions: NextAuthOptions = {
session: {
strategy: "jwt",
},

providers: [
CredentialsProvider({
name: "Credentials",


  credentials: {
    email: {
      label: "Email",
      type: "email",
    },

    password: {
      label: "Password",
      type: "password",
    },
  },

  async authorize(credentials) {
    const email =
      typeof credentials?.email === "string"
        ? credentials.email
            .trim()
            .toLowerCase()
        : "";

    const password =
      typeof credentials?.password === "string"
        ? credentials.password
        : "";

    if (!email || !password) {
      return null;
    }

    const user =
      await prisma.user.findUnique({
        where: {
          email,
        },
      });

   if (!user || !user.isActive) {
  return null;
}

if (!user.passwordHash) {
  return null;
}

const passwordMatches =
  await verifyPassword(
    password,
    user.passwordHash,
  );

if (!passwordMatches) {
  return null;
}

if (!user.emailVerifiedAt) {
  throw new Error("EMAIL_NOT_VERIFIED");
}

    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  },
}),

GoogleProvider({
  clientId:
    process.env.GOOGLE_CLIENT_ID ?? "",
  clientSecret:
    process.env.GOOGLE_CLIENT_SECRET ?? "",
}),


],

callbacks: {
async signIn({ user, account }) {
if (
account?.provider !== "google" ||
!account.providerAccountId ||
!user.email
) {
return true;
}


  const resolvedUser =
    await authIdentityService.resolveOAuthUser({
      provider: account.provider,
      providerAccountId:
        account.providerAccountId,
      email: user.email,
      name: user.name,
    });

  user.id = resolvedUser.id;

  return true;
},

async jwt({ token, user }) {
  if (user?.id) {
    token.id = user.id;
    token.sub = user.id;

    const authenticatedUser =
      await prisma.user.findUnique({
        where: {
          id: user.id,
        },
        select: {
          passwordChangedAt: true,
        },
      });

    token.passwordChangedAt =
      authenticatedUser?.passwordChangedAt
        ? authenticatedUser.passwordChangedAt.toISOString()
        : null;
  }

  return token;
},

async session({ session, token }) {
  const userId =
    typeof token.id === "string"
      ? token.id
      : typeof token.sub === "string"
        ? token.sub
        : undefined;

  if (session.user && userId) {
    session.user.id = userId;
    session.user.passwordChangedAt =
      typeof token.passwordChangedAt === "string"
        ? token.passwordChangedAt
        : null;
  }

  return session;
},

async redirect({ baseUrl }) {
  return `${baseUrl}/auth/continue`;
},


},

pages: {
signIn: "/login",
},

secret: process.env.NEXTAUTH_SECRET,
};

export async function getAuthenticatedUser() {
  const session =
    await getServerSession(authOptions);

  if (!session?.user) {
    throw new Error(
      "Authentication is required.",
    );
  }

  const userId =
    typeof session.user.id === "string"
      ? session.user.id
      : null;

  const email =
    typeof session.user.email === "string"
      ? session.user.email
      : "";

  if (!userId || !email) {
    throw new Error(
      "Authentication is required.",
    );
  }

  const authenticatedUser =
    await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
        passwordChangedAt: true,
      },
    });

  if (
    !authenticatedUser ||
    !authenticatedUser.isActive
  ) {
    throw new Error(
      "Authentication is required.",
    );
  }

  /*
   * A password change invalidates an older
   * authentication state.
   */
  if (authenticatedUser.passwordChangedAt) {
    const sessionPasswordChangedAt =
      session.user.passwordChangedAt
        ? new Date(
            session.user.passwordChangedAt,
          ).getTime()
        : null;

    const currentPasswordChangedAt =
      authenticatedUser.passwordChangedAt.getTime();

    if (
      sessionPasswordChangedAt === null ||
      currentPasswordChangedAt >
        sessionPasswordChangedAt
    ) {
      throw new Error(
        "Authentication is required.",
      );
    }
  }

  return {
    id: authenticatedUser.id,
    email: authenticatedUser.email,
    name:
      authenticatedUser.name ?? undefined,
  };
}

export async function getAuthenticatedUserId() {
const user =
await getAuthenticatedUser();

return user.id;
}
