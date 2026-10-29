
import type { BusinessType } from "@/types";

export class HospitalAccessError extends Error {
  readonly statusCode = 403;

  constructor(
    message = "This workspace is only available to hospital businesses.",
  ) {
    super(message);
    this.name = "HospitalAccessError";
  }
}

export function requireHospitalBusiness(
  businessType: BusinessType,
): void {
  if (businessType !== "hospital") {
    throw new HospitalAccessError();
  }
}
