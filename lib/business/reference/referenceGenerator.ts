import { prisma } from "@/lib/database/prisma";

type PrismaTransactionClient =
  Parameters<typeof prisma.$transaction>[0] extends (
    client: infer T,
  ) => unknown
    ? T
    : never;

export type BusinessReferenceType =
  | "PRODUCT_SKU"
  | "PRODUCT_BARCODE"
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
  client?: PrismaTransactionClient;
}

export async function generateBusinessReference(
  input: GenerateReferenceInput,
): Promise<string> {
  const {
    businessId,
    referenceType,
    prefix,
    padLength = 6,
    client = prisma,
  } = input;

  const existingCounter =
    await client.businessReferenceCounter.findUnique({
      where: {
        businessId_referenceType: {
          businessId,
          referenceType,
        },
      },
      select: {
        prefix: true,
        padLength: true,
      },
    });

  const effectivePrefix =
    existingCounter?.prefix ??
    prefix;

  const effectivePadLength =
    existingCounter?.padLength ??
    padLength;

  const counter =
    await client.businessReferenceCounter.upsert({
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
        prefix: effectivePrefix,
        padLength: effectivePadLength,
      },
      update: {
        currentValue: {
          increment: 1,
        },
        prefix:
          existingCounter?.prefix ??
          undefined,
        padLength:
          existingCounter?.padLength ??
          undefined,
      },
    });

  const sequence = String(
    counter.currentValue,
  ).padStart(
    counter.padLength ??
      effectivePadLength,
    "0",
  );

  const finalPrefix =
  counter.prefix ??
  effectivePrefix;

return finalPrefix
  ? `${finalPrefix}-${sequence}`
  : sequence;
}