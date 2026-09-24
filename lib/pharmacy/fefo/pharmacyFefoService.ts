import { Prisma } from "@/generated/prisma/client";

export interface FefoBatch {
  id: string;
  batchNumber: string;
  expiryDate: Date;
  quantityRemaining: Prisma.Decimal;
  isRecalled: boolean;
}

export interface FefoAllocation {
  batchId: string;
  batchNumber: string;
  quantity: Prisma.Decimal;
  expiryDate: Date;
}

export class PharmacyFefoService {
  static allocate(
    batches: FefoBatch[],
    requestedQuantity: Prisma.Decimal,
    now = new Date(),
  ): FefoAllocation[] {
    if (requestedQuantity.lessThanOrEqualTo(0)) {
      throw new Error("Requested quantity must be greater than zero.");
    }

    const eligibleBatches = batches
      .filter((batch) => !batch.isRecalled)
      .filter((batch) => batch.expiryDate > now)
      .filter((batch) => batch.quantityRemaining.greaterThan(0))
      .sort(
        (a, b) =>
          a.expiryDate.getTime() - b.expiryDate.getTime(),
      );

    const totalAvailable = eligibleBatches.reduce(
      (total, batch) => total.plus(batch.quantityRemaining),
      new Prisma.Decimal(0),
    );

    if (totalAvailable.lessThan(requestedQuantity)) {
      throw new Error(
        `Insufficient non-expired pharmacy stock. Requested ${requestedQuantity.toString()}, available ${totalAvailable.toString()}.`,
      );
    }

    let remaining = requestedQuantity;

    const allocations: FefoAllocation[] = [];

    for (const batch of eligibleBatches) {
      if (remaining.lessThanOrEqualTo(0)) {
        break;
      }

      const allocation = Prisma.Decimal.min(
        remaining,
        batch.quantityRemaining,
      );

      allocations.push({
        batchId: batch.id,
        batchNumber: batch.batchNumber,
        quantity: allocation,
        expiryDate: batch.expiryDate,
      });

      remaining = remaining.minus(allocation);
    }

    return allocations;
  }
}