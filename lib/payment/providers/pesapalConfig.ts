export interface PesapalConfig {
  consumerKey: string;
  consumerSecret: string;
  baseUrl: string;
  apiKey?: string;
}

export function getPesapalConfig(): PesapalConfig {
  const consumerKey =
    process.env.PESAPAL_CONSUMER_KEY?.trim();

  const consumerSecret =
    process.env.PESAPAL_CONSUMER_SECRET?.trim();

  const baseUrl =
    process.env.PESAPAL_BASE_URL?.trim();

  const apiKey =
    process.env.PESAPAL_API_KEY?.trim();

  if (!consumerKey) {
    throw new Error(
      "Pesapal consumer key is not configured.",
    );
  }

  if (!consumerSecret) {
    throw new Error(
      "Pesapal consumer secret is not configured.",
    );
  }

  if (!baseUrl) {
    throw new Error(
      "Pesapal base URL is not configured.",
    );
  }

  return {
    consumerKey,
    consumerSecret,
    baseUrl,
    apiKey,
  };
}