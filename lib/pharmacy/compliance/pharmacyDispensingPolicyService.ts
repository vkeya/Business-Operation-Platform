import { PharmacyPrescriptionType } from "@/generated/prisma/client";

export interface PharmacyDispensingPolicyInput {
  prescriptionType: PharmacyPrescriptionType;
  hasPrescription?: boolean;
}

export const pharmacyDispensingPolicyService = {
  validate(
    input: PharmacyDispensingPolicyInput,
  ) {
    if (!input.prescriptionType) {
      throw new Error(
        "Pharmacy prescription classification is required.",
      );
    }

    switch (input.prescriptionType) {
      case "OTC":
        return {
          allowed: true,
          requiresPrescription: false,
          requiresControlledRecord: false,
        };

      case "PRESCRIPTION":
        if (!input.hasPrescription) {
          throw new Error(
            "A prescription is required before dispensing this medicine.",
          );
        }

        return {
          allowed: true,
          requiresPrescription: true,
          requiresControlledRecord: false,
        };

      case "CONTROLLED":
        if (!input.hasPrescription) {
          throw new Error(
            "A prescription is required before dispensing this controlled medicine.",
          );
        }

        return {
          allowed: true,
          requiresPrescription: true,
          requiresControlledRecord: true,
        };

      default:
        throw new Error(
          "Unsupported pharmacy prescription classification.",
        );
    }
  },
};