import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/database/prisma";

export interface PharmacyPrescriptionLookupInput {
  businessId: string;
  prescriptionNumber?: string;
  customerId?: string;
}

export const pharmacyPrescriptionLookupService = {
  async search(
    input: PharmacyPrescriptionLookupInput,
  ) {
    if (!input.businessId) {
      throw new Error(
        "Business context is required.",
      );
    }

    if (
      !input.prescriptionNumber?.trim() &&
      !input.customerId
    ) {
      throw new Error(
        "Prescription number or customer is required.",
      );
    }

    const prescriptions =
      await prisma.pharmacyPrescription.findMany({
        where: {
          businessId: input.businessId,

          ...(input.prescriptionNumber?.trim()
            ? {
                prescriptionNumber: {
                  contains:
                    input.prescriptionNumber.trim(),
                  mode: "insensitive",
                },
              }
            : {}),

          ...(input.customerId
            ? {
                customerId:
                  input.customerId,
              }
            : {}),

          status: {
            in: [
              "ACTIVE",
              "PARTIALLY_DISPENSED",
            ],
          },

          OR: [
            {
              expiryDate: null,
            },
            {
              expiryDate: {
                gt: new Date(),
              },
            },
          ],
        },

        orderBy: {
          prescriptionDate: "desc",
        },

        take: 20,

        include: {
          items: {
            where: {},
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  sku: true,
                  pharmacyProduct: {
                    select: {
                      prescriptionType: true,
                      medicineType: true,
                      activeIngredient: true,
                      strength: true,
                      dosageForm: true,
                      packSize: true,
                      status: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

    return prescriptions.map(
      (prescription) => ({
        id: prescription.id,
        prescriptionNumber:
          prescription.prescriptionNumber,
        customerId:
          prescription.customerId,
        prescriptionDate:
          prescription.prescriptionDate,
        expiryDate:
          prescription.expiryDate,
        prescriberName:
          prescription.prescriberName,
        prescriberLicense:
          prescription.prescriberLicense,
        status:
          prescription.status,

        items: prescription.items
          .map((item) => {
            const remaining =
              item.quantityPrescribed.sub(
                item.quantityDispensed,
              );

            return {
              id: item.id,
              productId:
                item.productId,
              productName:
                item.product.name,
              sku:
                item.product.sku,
              quantityPrescribed:
                item.quantityPrescribed,
              quantityDispensed:
                item.quantityDispensed,
              remaining,
              dosageInstructions:
                item.dosageInstructions,
              duration:
                item.duration,
              notes:
                item.notes,
              pharmacyProduct:
                item.product.pharmacyProduct,
            };
          })
          .filter((item) =>
            item.remaining.greaterThan(
              new Prisma.Decimal(0),
            ),
          ),
      }),
    );
  },
};