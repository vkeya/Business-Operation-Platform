import crypto from "crypto";
import { prisma } from "@/lib/database/prisma";

const VERIFICATION_TOKEN_EXPIRY_HOURS = 24;

function hashToken(token: string): string {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}

export async function createEmailVerificationToken(userId: string) {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);

  const expiresAt = new Date(
    Date.now() +
      VERIFICATION_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000
  );

  await prisma.emailVerificationToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
    },
  });

  return rawToken;
}