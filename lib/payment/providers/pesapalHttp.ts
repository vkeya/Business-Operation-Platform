import {
  getPesapalConfig,
} from "./pesapalConfig";
import {
  getPesapalToken,
} from "./pesapalTokenService";

export async function pesapalRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const config =
    getPesapalConfig();

  const token =
    await getPesapalToken();

  const response =
    await fetch(
      `${config.baseUrl}${path}`,
      {
        ...options,
        headers: {
          "Content-Type":
            "application/json",
          Authorization:
            `Bearer ${token}`,
          ...(options.headers || {}),
        },
      },
    );

  const data =
    (await response.json()) as T;

  if (!response.ok) {
    throw new Error(
      `Pesapal request failed with status ${response.status}.`,
    );
  }

  return data;
}