import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/database/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { getServerSession } from "next-auth";


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

        const passwordMatches =
          await verifyPassword(
            password,
            user.passwordHash,
          );

        if (!passwordMatches) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],
  
  callbacks: {
  async jwt({ token, user }) {
    if (user) {
      token.id = user.id;
    }

    return token;
  },

  async session({ session, token }) {
    if (session.user && token.id) {
      session.user.id = token.id as string;
    }

    return session;
  },
},

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

export async function getAuthenticatedUser() {
  const session = await getServerSession(
    authOptions,
  );

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

  return {
    id: userId,
    email,
    name:
      typeof session.user.name === "string"
        ? session.user.name
        : undefined,
  };
}

export async function getAuthenticatedUserId() {
  const user =
    await getAuthenticatedUser();

  return user.id;
}

