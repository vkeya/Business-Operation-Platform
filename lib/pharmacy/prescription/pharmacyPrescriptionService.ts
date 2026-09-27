import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/database/prisma";
import {
  generateBusinessReference,
} from "@/lib/business/reference/referenceGenerator";

type PrismaTransactionClient = Parameters<
  typeof prisma.$transaction
>[0] extends (client: infer T) => unknown
  ? T
  : never;

export interface PharmacyPrescriptionItemInput {
  productId: string;
  quantityPrescribed: Prisma.Decimal;
  dosageInstructions?: string;
  duration?: string;
  notes?: string;
}

export interface PharmacyPrescriptionInput {
  businessId: string;
  customerId?: string;
  prescriptionDate: Date;
  expiryDate?: Date;
  prescriberName: string;
  prescriberLicense?: string;
  diagnosis?: string;
  notes?: string;
  createdBy: string;
  items: PharmacyPrescriptionItemInput[];
  operationId: string;
}

export const pharmacyPrescriptionService = {
  async create(
    input: PharmacyPrescriptionInput,
    client: PrismaTransactionClient = prisma,
  ) {
    if (!input.businessId) {
      throw new Error("Business context is required.");
    }

    if (!input.operationId?.trim()) {
      throw new Error("Operation ID is required.");
    }

    if (!input.createdBy) {
      throw new Error("User context is required.");
    }

    if (!input.prescriberName?.trim()) {
      throw new Error("Prescriber name is required.");
    }

    if (!(input.prescriptionDate instanceof Date)) {
      throw new Error("Prescription date is required.");
    }

    if (Number.isNaN(input.prescriptionDate.getTime())) {
      throw new Error("Prescription date is invalid.");
    }

    if (
      input.expiryDate &&
      Number.isNaN(input.expiryDate.getTime())
    ) {
      throw new Error("Prescription expiry date is invalid.");
    }

    if (
      input.expiryDate &&
      input.expiryDate <= input.prescriptionDate
    ) {
      throw new Error(
        "Prescription expiry date must be after the prescription date.",
      );
    }

    if (input.items.length === 0) {
      throw new Error(
        "A prescription must contain at least one medicine.",
      );
    }

    for (const item of input.items) {
      if (!item.productId) {
        throw new Error(
          "Prescription product is required.",
        );
      }

      if (
        item.quantityPrescribed.lessThanOrEqualTo(0)
      ) {
        throw new Error(
          "Prescribed quantity must be greater than zero.",
        );
      }
    }

    const existingOperation =
      await client.operationRequest.findUnique({
        where: {
          businessId_operationId: {
            businessId: input.businessId,
            operationId: input.operationId,
          },
        },
      });

    if (existingOperation) {
      if (
        existingOperation.status === "COMPLETED" &&
        existingOperation.response
      ) {
        return existingOperation.response;
      }

      if (existingOperation.status === "PROCESSING") {
        throw new Error(
          "This prescription operation is already being processed.",
        );
      }

      throw new Error(
        "This prescription operation has already been recorded.",
      );
    }

    /*
     * Validate customer.
     */
    if (input.customerId) {
      const customer =
        await client.customer.findFirst({
          where: {
            id: input.customerId,
            businessId: input.businessId,
            isActive: true,
          },
          select: {
            id: true,
          },
        });

      if (!customer) {
        throw new Error(
          "Customer does not belong to the current business or is inactive.",
        );
      }
    }

    /*
     * Validate all prescribed products before
     * creating anything.
     */
    const productIds = [
      ...new Set(
        input.items.map(
          (item) => item.productId,
        ),
      ),
    ];

    const pharmacyProducts =
      await client.pharmacyProduct.findMany({
        where: {
          productId: {
            in: productIds,
          },
        },
        select: {
          id: true,
          productId: true,
          status: true,
          prescriptionType: true,
          medicineType: true,
        },
      });

    if (
      pharmacyProducts.length !== productIds.length
    ) {
      throw new Error(
        "Every prescribed product must be configured as a pharmacy product.",
      );
    }

    const pharmacyProductMap = new Map(
      pharmacyProducts.map(
        (product) => [
          product.productId,
          product,
        ],
      ),
    );

    for (const item of input.items) {
      const pharmacyProduct =
        pharmacyProductMap.get(
          item.productId,
        );

      if (!pharmacyProduct) {
        throw new Error(
          `Product ${item.productId} is not configured as a pharmacy product.`,
        );
      }

      if (
        pharmacyProduct.status !== "ACTIVE"
      ) {
        throw new Error(
          `Pharmacy product ${item.productId} is not active.`,
        );
      }

      if (
        pharmacyProduct.prescriptionType ===
        "OTC"
      ) {
        throw new Error(
          `Product ${item.productId} is classified as OTC and cannot be placed on a prescription.`,
        );
      }
    }

    /*
     * Create idempotency record.
     */
    const operation =
      await client.operationRequest.create({
        data: {
          businessId:
            input.businessId,

          operationId:
            input.operationId,

          operation:
            "PHARMACY_PRESCRIPTION_CREATE",

          status:
            "PROCESSING",

          entityType:
            "PHARMACY_PRESCRIPTION",

          createdBy:
            input.createdBy,
        },
      });

    /*
     * Generate the SmatPic business reference.
     */
    const prescriptionNumber =
      await generateBusinessReference({
        businessId:
          input.businessId,

        referenceType:
          "PHARMACY_PRESCRIPTION",

        prefix:
          "RX",

        client,
      });

    /*
     * Create prescription and items
     * atomically.
     */
    const prescription =
      await client.pharmacyPrescription.create({
        data: {
          businessId:
            input.businessId,

          customerId:
            input.customerId,

          prescriptionNumber,

          prescriptionDate:
            input.prescriptionDate,

          expiryDate:
            input.expiryDate,

          prescriberName:
            input.prescriberName.trim(),

          prescriberLicense:
            input.prescriberLicense?.trim(),

          diagnosis:
            input.diagnosis?.trim(),

          notes:
            input.notes?.trim(),

          createdBy:
            input.createdBy,

          items: {
            create:
              input.items.map(
                (item) => ({
                  productId:
                    item.productId,

                  quantityPrescribed:
                    item.quantityPrescribed,

                  quantityDispensed:
                    new Prisma.Decimal(0),

                  dosageInstructions:
                    item.dosageInstructions?.trim(),

                  duration:
                    item.duration?.trim(),

                  notes:
                    item.notes?.trim(),
                }),
              ),
          },
        },

        include: {
          items: true,
        },
      });

    const response = {
      prescriptionId:
        prescription.id,

      prescriptionNumber:
        prescription.prescriptionNumber,

      status:
        prescription.status,

      customerId:
        prescription.customerId,

      prescriptionDate:
        prescription.prescriptionDate.toISOString(),

      expiryDate:
        prescription.expiryDate?.toISOString() ??
        null,

      items:
        prescription.items.map(
          (item) => ({
            id: item.id,

            productId:
              item.productId,

            quantityPrescribed:
              item.quantityPrescribed.toString(),

            quantityDispensed:
              item.quantityDispensed.toString(),
          }),
        ),
    };

    await client.operationRequest.update({
      where: {
        id: operation.id,
      },

      data: {
        status: "COMPLETED",

        entityType:
          "PHARMACY_PRESCRIPTION",

        entityId:
          prescription.id,

        response,
      },
    });

    return response;
  },
};