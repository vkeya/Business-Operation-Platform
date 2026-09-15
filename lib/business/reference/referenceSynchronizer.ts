import { prisma } from "@/lib/database/prisma";

import {
  type BusinessReferenceType,
} from "./referenceGenerator";

interface ReferenceSyncResult {
  referenceType: BusinessReferenceType;
  currentCounter: number | null;
  detectedHighest: number | null;
  recommendedCounter: number | null;
  pattern: string | null;
  prefix: string | null;
  padLength: number | null;
  synchronized: boolean;
}

interface SyncBusinessReferenceInput {
  businessId: string;
  referenceType: BusinessReferenceType;
  values: Array<string | null | undefined>;
}

function detectNumericSequence(value: string): number | null {
  const normalized = value.trim();

  if (!normalized) {
    return null;
  }

  const match = normalized.match(/(\d+)$/);

  if (!match) {
    return null;
  }

  const numericPart = match[1];
  const parsed = Number(numericPart);

  if (!Number.isSafeInteger(parsed) || parsed < 0) {
    return null;
  }

  return parsed;
}

function detectFormat(value: string): {
  pattern: string;
  prefix: string;
  padLength: number;
} | null {
  const normalized = value.trim();

  if (!normalized) {
    return null;
  }

  const match = normalized.match(/^(.*?)(\d+)$/);

  if (!match) {
    return null;
  }

  const prefix = match[1];
  const numericPart = match[2];

  return {
    pattern: `${prefix}{n}`,
    prefix: prefix.endsWith("-")
      ? prefix.slice(0, -1)
      : prefix,
    padLength: numericPart.length,
  };
}

export async function inspectBusinessReferenceSequence(
  input: SyncBusinessReferenceInput,
): Promise<ReferenceSyncResult> {
  const counter =
    await prisma.businessReferenceCounter.findUnique({
      where: {
        businessId_referenceType: {
          businessId: input.businessId,
          referenceType: input.referenceType,
        },
      },
      select: {
        currentValue: true,
        prefix: true,
        padLength: true,
      },
    });

  let detectedHighest: number | null = null;
  let detectedFormat: {
    pattern: string;
    prefix: string;
    padLength: number;
  } | null = null;

  for (const rawValue of input.values) {
    if (!rawValue) {
      continue;
    }

    const value = rawValue.trim();
    const numericSequence = detectNumericSequence(value);

    if (numericSequence === null) {
      continue;
    }

    if (
      detectedHighest === null ||
      numericSequence > detectedHighest
    ) {
      detectedHighest = numericSequence;
      detectedFormat = detectFormat(value);
    }
  }

  const currentCounter =
    counter?.currentValue ?? null;

  const recommendedCounter =
    detectedHighest === null
      ? currentCounter
      : Math.max(
          currentCounter ?? 0,
          detectedHighest,
        );

  return {
    referenceType: input.referenceType,
    currentCounter,
    detectedHighest,
    recommendedCounter,
    pattern:
      detectedFormat?.pattern ??
      null,
    prefix:
      counter?.prefix ??
      detectedFormat?.prefix ??
      null,
    padLength:
      counter?.padLength ??
      detectedFormat?.padLength ??
      null,
    synchronized: false,
  };
}

export async function synchronizeBusinessReferenceSequence(
  input: SyncBusinessReferenceInput,
): Promise<ReferenceSyncResult> {
  const inspection =
    await inspectBusinessReferenceSequence(input);

  if (inspection.recommendedCounter === null) {
    return inspection;
  }

  const existingCounter =
    await prisma.businessReferenceCounter.findUnique({
      where: {
        businessId_referenceType: {
          businessId: input.businessId,
          referenceType: input.referenceType,
        },
      },
      select: {
        currentValue: true,
        prefix: true,
        padLength: true,
      },
    });

  const currentValue =
    existingCounter?.currentValue ?? 0;

  const nextCounterValue =
    Math.max(
      currentValue,
      inspection.recommendedCounter,
    );

  await prisma.businessReferenceCounter.upsert({
    where: {
      businessId_referenceType: {
        businessId: input.businessId,
        referenceType: input.referenceType,
      },
    },
    create: {
      businessId: input.businessId,
      referenceType: input.referenceType,
      currentValue: nextCounterValue,
      prefix: inspection.prefix,
      padLength: inspection.padLength,
    },
    update: {
      currentValue: nextCounterValue,
      prefix:
        existingCounter?.prefix ??
        inspection.prefix ??
        undefined,
      padLength:
        existingCounter?.padLength ??
        inspection.padLength ??
        undefined,
    },
  });

  return {
    ...inspection,
    currentCounter: nextCounterValue,
    synchronized: true,
  };
}

