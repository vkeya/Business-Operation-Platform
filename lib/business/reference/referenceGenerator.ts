import { prisma } from "@/lib/database/prisma";

export type BusinessReferenceType =
  | "PRODUCT_SKU"
  | "SALE"
  | "PURCHASE"
  | "PAYMENT"
  | "EXPENSE"
  | "JOURNAL_ENTRY"
  | "INVENTORY_MOVEMENT";

export interface GenerateReferenceInput {
  businessId: string;
  referenceType: BusinessReferenceType;
  prefix: string;
  padLength?: number;
}

export async function generateBusinessReference(
  input: GenerateReferenceInput,
): Promise<string> {
  const {
    businessId,
    referenceType,
    prefix,
    padLength = 6,
  } = input;

  const counter =
    await prisma.businessReferenceCounter.upsert({
      where: {
        businessId_referenceType: {
          businessId,
          referenceType,
        },
      },
      create: {
        businessId,
        referenceType,
        currentValue: 1,
      },
      update: {
        currentValue: {
          increment: 1,
        },
      },
    });

  const sequence = String(
    counter.currentValue,
  ).padStart(padLength, "0");

  return `${prefix}-${sequence}`;
}