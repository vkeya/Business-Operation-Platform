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
}

interface SyncBusinessReferenceInput {
  businessId: string;
  referenceType: BusinessReferenceType;
  values: Array<string | null | undefined>;
}

function detectNumericSequence(
  value: string,
): number | null {
  const normalized = value.trim();

  if (!normalized) {
    return null;
  }

  const match =
    normalized.match(/(\d+)$/);

  if (!match) {
    return null;
  }

  const numericPart = match[1];

  const parsed = Number(numericPart);

  if (
    !Number.isSafeInteger(parsed) ||
    parsed < 0
  ) {
    return null;
  }

  return parsed;
}

function detectPattern(
  value: string,
): string | null {
  const normalized = value.trim();

  if (!normalized) {
    return null;
  }

  const match =
    normalized.match(/^(.*?)(\d+)$/);

  if (!match) {
    return null;
  }

  return `${match[1]}{n}`;
}

export async function inspectBusinessReferenceSequence(
  input: SyncBusinessReferenceInput,
): Promise<ReferenceSyncResult> {
  const counter =
    await prisma.businessReferenceCounter.findUnique({
		
      where: {
        businessId_referenceType: {
          businessId:
            input.businessId,
          referenceType:
            input.referenceType,
        },
      },
      select: {
        currentValue: true,
      },
    });

  let detectedHighest:
    number | null = null;

  let detectedPattern:
    string | null = null;

  for (const rawValue of input.values) {
    if (!rawValue) {
      continue;
    }

    const value = rawValue.trim();

    const numericSequence =
      detectNumericSequence(value);

    if (numericSequence === null) {
      continue;
    }

    if (
      detectedHighest === null ||
      numericSequence >
        detectedHighest
    ) {
      detectedHighest =
        numericSequence;
      detectedPattern =
        detectPattern(value);
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
    referenceType:
      input.referenceType,
    currentCounter,
    detectedHighest,
    recommendedCounter,
    pattern: detectedPattern,
  };
}