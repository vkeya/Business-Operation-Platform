import {
  getPesapalConfig,
} from "./pesapalConfig";

interface PesapalAuthResponse {
  token?: string;
  expiryDate?: string;
  message?: string;
  error?: string;
}

export interface PesapalAuthToken {
  token: string;
  expiryDate?: string;
}

export async function authenticatePesapal(): Promise<PesapalAuthToken> {  const config =
    getPesapalConfig();

  const response =
    await fetch(
      `${config.baseUrl}/api/Auth/RequestToken`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          consumer_key:
            config.consumerKey,
          consumer_secret:
            config.consumerSecret,
        }),
      },
    );

  const data =
    (await response.json()) as PesapalAuthResponse;

  if (!response.ok) {
    throw new Error(
      data.message ||
        data.error ||
        `Pesapal authentication failed with status ${response.status}.`,
    );
  }

  if (!data.token?.trim()) {
    throw new Error(
      "Pesapal authentication returned no token.",
    );
  }

  return {
  token: data.token,
  expiryDate: data.expiryDate,
};
}