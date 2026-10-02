import type { BusinessType } from "@/types";

export class SupermarketAccessError extends Error {
  readonly statusCode = 403;

  constructor(
    message = "This workspace is only available to supermarket businesses.",
  ) {
    super(message);
    this.name = "SupermarketAccessError";
  }
}

export function requireSupermarketBusiness(
  businessType: BusinessType,
): void {
  if (businessType !== "supermarket") {
    throw new SupermarketAccessError();
  }
}