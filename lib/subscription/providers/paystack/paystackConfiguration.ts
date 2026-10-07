import "server-only";

function requirePaystackEnvironmentVariable(
  name: string,
): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(
      `${name} must be configured for Paystack subscription billing.`,
    );
  }

  return value;
}

export function getPaystackSecretKey(): string {
  return requirePaystackEnvironmentVariable(
    "SMATPIC_PAYSTACK_SECRET_KEY",
  );
}