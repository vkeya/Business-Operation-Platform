import {
  authenticatePesapal,
  type PesapalAuthToken,
} from "./pesapalClient";

let cachedToken: PesapalAuthToken | null = null;

export async function getPesapalToken(): Promise<string> {
  const now = Date.now();

  if (
    cachedToken?.token &&
    cachedToken.expiryDate &&
    new Date(
      cachedToken.expiryDate,
    ).getTime() >
      now + 30_000
  ) {
    return cachedToken.token;
  }

  const token =
    await authenticatePesapal();

  cachedToken = token;

  return token.token;
}