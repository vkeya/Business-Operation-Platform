import type { BusinessType } from "@/types";

export class PharmacyAccessError extends Error {
  readonly statusCode = 403;

  constructor(
    message = "This workspace is only available to pharmacy businesses.",
  ) {
    super(message);
    this.name = "PharmacyAccessError";
  }
}

export function requirePharmacyBusiness(
  businessType: BusinessType,
): void {
  if (businessType !== "pharmacy") {
    throw new PharmacyAccessError();
  }
}