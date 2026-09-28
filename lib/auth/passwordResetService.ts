import crypto from "crypto";

import { prisma } from "@/lib/database/prisma";

const PASSWORD_RESET_TOKEN_EXPIRY_HOURS = 1;

function hashToken(token: string): string {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}

export async function createPasswordResetToken(
  userId: string,
) {
  const rawToken =
    crypto.randomBytes(32).toString("hex");

  const tokenHash =
    hashToken(rawToken);

  const expiresAt = new Date(
    Date.now() +
      PASSWORD_RESET_TOKEN_EXPIRY_HOURS *
        60 *
        60 *
        1000,
  );

  await prisma.passwordResetToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
    },
  });

  return rawToken;
}