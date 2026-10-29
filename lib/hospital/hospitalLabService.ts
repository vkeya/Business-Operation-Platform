import { prisma } from "@/lib/database/prisma";
import { recordAuditEvent } from "@/lib/audit/auditService";
import { AUDIT_ACTIONS } from "@/lib/audit/auditActions";
import { getCurrentBusinessContext } from "@/lib/business/currentBusiness";
import { generateBusinessReference } from "@/lib/business/reference/referenceGenerator";
import { requireHospitalBusiness } from "@/lib/hospital/hospitalAccessService";
import type { BusinessType } from "@/types";

export class HospitalLabError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "HospitalLabError";
    this.statusCode = statusCode;
  }
}

type HospitalLabOrderItemInput = {
  testCode?: string | null;
  testName: string;
  specimenType: string;
  instructions?: string | null;
};

type CreateHospitalLabOrderInput = {
  patientId: string;
  encounterId: string;
  priority?: "ROUTINE" | "URGENT" | "STAT";
  clinicalIndication?: string | null;
  notes?: string | null;
  items: HospitalLabOrderItemInput[];
};

type ListHospitalLabOrdersOptions = {
  patientId?: string;
  encounterId?: string;
  status?: "ORDERED" | "COLLECTED" | "IN_PROGRESS" | "PARTIALLY_RESULTED" | "COMPLETED" | "CANCELLED";
  skip?: number;
  take?: number;
};

async function getHospitalLabContext() {
  const context = await getCurrentBusinessContext();
  requireHospitalBusiness(context.business.type as BusinessType);

  return {
    businessId: context.business.id,
    userId: context.user.id,
  };
}

function validatePagination(skip: number, take: number) {
  if (!Number.isInteger(skip) || skip < 0) {
    throw new HospitalLabError("Invalid pagination offset.");
  }

  if (!Number.isInteger(take) || take < 1 || take > 100) {
    throw new HospitalLabError("Page size must be between 1 and 100.");
  }
}

function optionalText(
  value: string | null | undefined,
  field: string,
  maxLength: number,
) {
  const text = value?.trim() || null;

  if (text && text.length > maxLength) {
    throw new HospitalLabError(`${field} cannot exceed ${maxLength} characters.`);
  }

  return text;
}

export async function listHospitalLabOrders(
  options: ListHospitalLabOrdersOptions = {},
) {
  const { businessId, userId } = await getHospitalLabContext();
  const skip = options.skip ?? 0;
  const take = options.take ?? 25;

  validatePagination(skip, take);

  const patientId = options.patientId?.trim();
  const encounterId = options.encounterId?.trim();

  if (!patientId && !encounterId) {
    throw new HospitalLabError(
      "Filter laboratory orders by patientId or encounterId.",
    );
  }

  const orders = await prisma.hospitalLabOrder.findMany({
    where: {
      businessId,
      ...(patientId ? { patientId } : {}),
      ...(encounterId ? { encounterId } : {}),
      ...(options.status ? { status: options.status } : {}),
    },
    include: {
      items: {
        include: {
          specimens: true,
          results: true,
        },
      },
    },
    orderBy: { orderedAt: "desc" },
    skip,
    take,
  });

  for (const order of orders) {
    await recordAuditEvent({
      businessId,
      actorId: userId,
      action: AUDIT_ACTIONS.HOSPITAL_LAB_ORDER_VIEWED,
      category: "HOSPITAL",
      entityType: "HospitalLabOrder",
      entityId: order.id,
      metadata: {
        orderNumber: order.orderNumber,
        patientId: order.patientId,
        encounterId: order.encounterId,
        accessMode: "list",
      },
    });
  }

  return orders;
}

export async function createHospitalLabOrder(
  input: CreateHospitalLabOrderInput,
) {
  const { businessId, userId } = await getHospitalLabContext();
  const patientId = input.patientId?.trim();
  const encounterId = input.encounterId?.trim();

  if (!patientId || !encounterId) {
    throw new HospitalLabError(
      "A patient and encounter are required.",
    );
  }

  if (!Array.isArray(input.items) || input.items.length === 0) {
    throw new HospitalLabError(
      "A laboratory order must contain at least one test.",
    );
  }

  if (input.items.length > 100) {
    throw new HospitalLabError(
      "A laboratory order cannot contain more than 100 tests.",
    );
  }

  const priority = input.priority ?? "ROUTINE";
  if (!["ROUTINE", "URGENT", "STAT"].includes(priority)) {
    throw new HospitalLabError("Invalid laboratory order priority.");
  }

  const clinicalIndication = optionalText(
    input.clinicalIndication,
    "Clinical indication",
    2000,
  );
  const notes = optionalText(input.notes, "Order notes", 4000);

  const items = input.items.map((item) => {
    const testName = item.testName?.trim();
    const specimenType = item.specimenType?.trim();

    if (!testName || testName.length > 200) {
      throw new HospitalLabError(
        "Every test requires a name of at most 200 characters.",
      );
    }

    if (!specimenType || specimenType.length > 100) {
      throw new HospitalLabError(
        "Every test requires a specimen type of at most 100 characters.",
      );
    }

    return {
      testCode: optionalText(item.testCode, "Test code", 100),
      testName,
      specimenType,
      instructions: optionalText(item.instructions, "Test instructions", 1000),
    };
  });

  return prisma.$transaction(
    async (tx) => {
      const patient = await tx.patient.findFirst({
        where: { id: patientId, businessId, isActive: true },
        select: { id: true },
      });

      if (!patient) {
        throw new HospitalLabError(
          "Active patient not found in this hospital.",
          404,
        );
      }

      const encounter = await tx.hospitalEncounter.findFirst({
        where: { id: encounterId, businessId, patientId },
        select: { id: true, status: true },
      });

      if (!encounter) {
        throw new HospitalLabError(
          "Encounter not found for this patient in this hospital.",
          404,
        );
      }

      if (
        encounter.status === "COMPLETED" ||
        encounter.status === "CANCELLED"
      ) {
        throw new HospitalLabError(
          "Laboratory orders cannot be created for a completed or cancelled encounter.",
          409,
        );
      }

      const orderNumber = await generateBusinessReference({
        businessId,
        referenceType: "HOSPITAL_LAB_ORDER",
        prefix: "LAB",
        client: tx,
      });

      const order = await tx.hospitalLabOrder.create({
        data: {
          businessId,
          patientId,
          encounterId,
          orderNumber,
          orderedBy: userId,
          priority,
          clinicalIndication,
          notes,
          items: {
            create: items.map((item) => ({
              businessId,
              ...item,
            })),
          },
        },
        include: { items: true },
      });

      await recordAuditEvent(
        {
          businessId,
          actorId: userId,
          action: AUDIT_ACTIONS.HOSPITAL_LAB_ORDER_CREATED,
          category: "HOSPITAL",
          entityType: "HospitalLabOrder",
          entityId: order.id,
          metadata: {
            orderNumber,
            patientId,
            encounterId,
            itemCount: order.items.length,
            priority,
          },
        },
        tx,
      );

      return order;
    },
    { maxWait: 10_000, timeout: 15_000 },
  );
}

export async function cancelHospitalLabOrder(
  orderId: string,
  reason: string,
) {
  const { businessId, userId } = await getHospitalLabContext();
  const id = orderId?.trim();
  const cancellationReason = reason?.trim();

  if (!id) {
    throw new HospitalLabError("Laboratory order ID is required.");
  }

  if (!cancellationReason || cancellationReason.length > 2000) {
    throw new HospitalLabError(
      "A cancellation reason is required and must not exceed 2,000 characters.",
    );
  }

  return prisma.$transaction(
    async (tx) => {
      const order = await tx.hospitalLabOrder.findFirst({
        where: { id, businessId },
        include: {
          items: {
            select: { id: true, status: true },
          },
        },
      });

      if (!order) {
        throw new HospitalLabError(
          "Laboratory order not found in this hospital.",
          404,
        );
      }

      if (order.status === "CANCELLED") {
        throw new HospitalLabError(
          "This laboratory order has already been cancelled.",
          409,
        );
      }

      const releasedResult = await tx.hospitalLabResult.findFirst({
        where: {
          businessId,
          status: { in: ["RELEASED", "AMENDED"] },
          orderItem: { orderId: order.id, businessId },
        },
        select: { id: true },
      });

      if (releasedResult) {
        throw new HospitalLabError(
          "Orders with released or amended results cannot be cancelled, to preserve the clinical record.",
          409,
        );
      }

      await tx.hospitalLabOrderItem.updateMany({
        where: {
          businessId,
          orderId: order.id,
          status: { not: "CANCELLED" },
        },
        data: { status: "CANCELLED" },
      });

      const cancelledAt = new Date();

      const cancelledOrder = await tx.hospitalLabOrder.update({
        where: { id: order.id },
        data: {
          status: "CANCELLED",
          cancelledAt,
        },
        include: { items: true },
      });

      await recordAuditEvent(
        {
          businessId,
          actorId: userId,
          action: AUDIT_ACTIONS.HOSPITAL_LAB_ORDER_CANCELLED,
          category: "HOSPITAL",
          entityType: "HospitalLabOrder",
          entityId: order.id,
          metadata: {
            orderNumber: order.orderNumber,
            reason: cancellationReason,
            previousStatus: order.status,
            status: cancelledOrder.status,
            cancelledItemCount: order.items.filter(
              (item) => item.status !== "CANCELLED",
            ).length,
          },
        },
        tx,
      );

      return cancelledOrder;
    },
    { maxWait: 10_000, timeout: 15_000 },
  );
}

type HospitalLabSpecimenAction = "collect" | "receive" | "reject";

export async function updateHospitalLabSpecimen(
  specimenId: string,
  action: HospitalLabSpecimenAction,
  input: {
    specimenNumber?: string;
    rejectionReason?: string | null;
    notes?: string | null;
  } = {},
) {
  const { businessId, userId } = await getHospitalLabContext();
  const id = specimenId?.trim();

  if (!id) {
    throw new HospitalLabError("Specimen ID is required.");
  }

  if (!["collect", "receive", "reject"].includes(action)) {
    throw new HospitalLabError("Invalid specimen action.");
  }

  const rejectionReason = optionalText(
    input.rejectionReason,
    "Rejection reason",
    1000,
  );
  const notes = optionalText(input.notes, "Specimen notes", 2000);

  return prisma.$transaction(
    async (tx) => {
      const specimen = await tx.hospitalLabSpecimen.findFirst({
        where: { id, businessId },
        include: {
          orderItem: {
            include: {
              order: {
                select: {
                  id: true,
                  businessId: true,
                  status: true,
                },
              },
            },
          },
        },
      });

      if (!specimen || specimen.orderItem.businessId !== businessId ||
          specimen.orderItem.order.businessId !== businessId) {
        throw new HospitalLabError("Specimen not found in this hospital.", 404);
      }

      if (
        specimen.orderItem.status === "CANCELLED" ||
        specimen.orderItem.order.status === "CANCELLED" ||
        specimen.orderItem.order.status === "COMPLETED"
      ) {
        throw new HospitalLabError(
          "Specimens cannot be updated for cancelled or completed laboratory orders.",
          409,
        );
      }

      if (action === "collect" && specimen.status !== "PENDING") {
        throw new HospitalLabError(
          "Only pending specimens can be collected.",
          409,
        );
      }

      if (action === "receive" && specimen.status !== "COLLECTED") {
        throw new HospitalLabError(
          "Only collected specimens can be received.",
          409,
        );
      }

      if (action === "reject" &&
          !["PENDING", "COLLECTED"].includes(specimen.status)) {
        throw new HospitalLabError(
          "Only pending or collected specimens can be rejected.",
          409,
        );
      }

      if (action === "reject" && !rejectionReason) {
        throw new HospitalLabError(
          "A reason is required when rejecting a specimen.",
        );
      }

      const updated = await tx.hospitalLabSpecimen.update({
        where: { id: specimen.id },
        data: {
          ...(action === "collect"
            ? {
                status: "COLLECTED" as const,
                collectedBy: userId,
                collectedAt: new Date(),
              }
            : {}),
          ...(action === "receive"
            ? {
                status: "RECEIVED" as const,
                receivedAt: new Date(),
              }
            : {}),
          ...(action === "reject"
            ? {
                status: "REJECTED" as const,
                rejectionReason,
              }
            : {}),
          ...(notes !== null ? { notes } : {}),
        },
      });

      if (
        action !== "reject" &&
        specimen.orderItem.order.status === "ORDERED"
      ) {
        await tx.hospitalLabOrder.update({
          where: { id: specimen.orderItem.order.id },
          data: { status: "IN_PROGRESS" },
        });
      }

      const auditAction = {
        collect: AUDIT_ACTIONS.HOSPITAL_LAB_SPECIMEN_COLLECTED,
        receive: AUDIT_ACTIONS.HOSPITAL_LAB_SPECIMEN_RECEIVED,
        reject: AUDIT_ACTIONS.HOSPITAL_LAB_SPECIMEN_REJECTED,
      }[action];

      await recordAuditEvent(
        {
          businessId,
          actorId: userId,
          action: auditAction,
          category: "HOSPITAL",
          entityType: "HospitalLabSpecimen",
          entityId: updated.id,
          metadata: {
            orderItemId: specimen.orderItemId,
            previousStatus: specimen.status,
            status: updated.status,
            rejectionReason: action === "reject" ? rejectionReason : null,
          },
        },
        tx,
      );

      return updated;
    },
    { maxWait: 10_000, timeout: 15_000 },
  );
}

export async function createHospitalLabSpecimen(
  orderItemId: string,
  input: {
    specimenType?: string;
    notes?: string | null;
  } = {},
) {
  const { businessId, userId } = await getHospitalLabContext();
  const id = orderItemId?.trim();

  if (!id) {
    throw new HospitalLabError("Laboratory order item ID is required.");
  }

  const specimenType = input.specimenType?.trim();
  if (specimenType && specimenType.length > 100) {
    throw new HospitalLabError(
      "Specimen type cannot exceed 100 characters.",
    );
  }

  const notes = optionalText(input.notes, "Specimen notes", 2000);

  return prisma.$transaction(
    async (tx) => {
      const item = await tx.hospitalLabOrderItem.findFirst({
        where: { id, businessId },
        include: {
          order: {
            select: {
              id: true,
              businessId: true,
              status: true,
            },
          },
        },
      });

      if (!item || item.order.businessId !== businessId) {
        throw new HospitalLabError(
          "Laboratory order item not found in this hospital.",
          404,
        );
      }

      if (
        item.status === "CANCELLED" ||
        item.order.status === "CANCELLED" ||
        item.order.status === "COMPLETED"
      ) {
        throw new HospitalLabError(
          "Specimens cannot be created for cancelled or completed laboratory orders.",
          409,
        );
      }

      const specimen = await tx.hospitalLabSpecimen.create({
        data: {
          businessId,
          orderItemId: item.id,
          specimenNumber: `SP-${crypto.randomUUID()}`,
          specimenType: specimenType || item.specimenType,
          notes,
        },
      });

      await tx.hospitalLabOrderItem.update({
        where: { id: item.id },
        data: { status: "PROCESSING" },
      });

      if (item.order.status === "ORDERED") {
        await tx.hospitalLabOrder.update({
          where: { id: item.order.id },
          data: { status: "IN_PROGRESS" },
        });
      }

      await recordAuditEvent(
        {
          businessId,
          actorId: userId,
          action: AUDIT_ACTIONS.HOSPITAL_LAB_SPECIMEN_CREATED,
          category: "HOSPITAL",
          entityType: "HospitalLabSpecimen",
          entityId: specimen.id,
          metadata: {
            orderItemId: item.id,
            specimenNumber: specimen.specimenNumber,
            status: specimen.status,
            action: "created",
          },
        },
        tx,
      );

      return specimen;
    },
    { maxWait: 10_000, timeout: 15_000 },
  );
}

type CreateHospitalLabResultInput = {
  orderItemId: string;
  specimenId?: string | null;
  resultValue: string;
  numericValue?: string | number | null;
  unit?: string | null;
  referenceRange?: string | null;
  abnormalFlag?: string | null;
};

export async function listHospitalLabResults(
  orderItemId: string,
  skip = 0,
  take = 25,
) {
  const { businessId, userId } = await getHospitalLabContext();
  const id = orderItemId?.trim();

  if (!id) {
    throw new HospitalLabError("Laboratory order item ID is required.");
  }

  validatePagination(skip, take);

  const item = await prisma.hospitalLabOrderItem.findFirst({
    where: { id, businessId },
    select: { id: true },
  });

  if (!item) {
    throw new HospitalLabError(
      "Laboratory order item not found in this hospital.",
      404,
    );
  }

  const results = await prisma.hospitalLabResult.findMany({
    where: { businessId, orderItemId: id },
    include: { revisions: { orderBy: { revision: "desc" } } },
    orderBy: { createdAt: "desc" },
    skip,
    take,
  });

  for (const result of results) {
    await recordAuditEvent({
      businessId,
      actorId: userId,
      action: AUDIT_ACTIONS.HOSPITAL_LAB_RESULT_VIEWED,
      category: "HOSPITAL",
      entityType: "HospitalLabResult",
      entityId: result.id,
      metadata: {
        orderItemId: id,
        status: result.status,
        accessMode: "list",
      },
    });
  }

  return results;
}

export async function createHospitalLabResult(
  input: CreateHospitalLabResultInput,
) {
  const { businessId, userId } = await getHospitalLabContext();
  const orderItemId = input.orderItemId?.trim();
  const specimenId = input.specimenId?.trim() || null;
  const resultValue = input.resultValue?.trim();

  if (!orderItemId) {
    throw new HospitalLabError("Laboratory order item ID is required.");
  }

  if (!resultValue || resultValue.length > 20_000) {
    throw new HospitalLabError(
      "Result value is required and cannot exceed 20,000 characters.",
    );
  }

  const numericInput = input.numericValue;
  let numericValue: import("@/generated/prisma/client").Prisma.Decimal | null =
    null;

  if (numericInput !== undefined && numericInput !== null && numericInput !== "") {
    try {
      numericValue = new (await import("@/generated/prisma/client")).Prisma.Decimal(
        numericInput,
      );
    } catch {
      throw new HospitalLabError("Numeric result must be a valid number.");
    }

    if (
      !numericValue.isFinite() ||
      numericValue.decimalPlaces() > 4
    ) {
      throw new HospitalLabError(
        "Numeric result must be finite and have at most four decimal places.",
      );
    }
  }

  const unit = optionalText(input.unit, "Result unit", 100);
  const referenceRange = optionalText(
    input.referenceRange,
    "Reference range",
    200,
  );
  const abnormalFlag = optionalText(input.abnormalFlag, "Abnormal flag", 50);

  return prisma.$transaction(
    async (tx) => {
      const item = await tx.hospitalLabOrderItem.findFirst({
        where: { id: orderItemId, businessId },
        include: {
          order: { select: { id: true, businessId: true, status: true } },
        },
      });

      if (!item || item.order.businessId !== businessId) {
        throw new HospitalLabError(
          "Laboratory order item not found in this hospital.",
          404,
        );
      }

      if (
        item.status === "CANCELLED" ||
        item.order.status === "CANCELLED" ||
        item.order.status === "COMPLETED"
      ) {
        throw new HospitalLabError(
          "Results cannot be entered for cancelled or completed laboratory orders.",
          409,
        );
      }

      if (specimenId) {
        const specimen = await tx.hospitalLabSpecimen.findFirst({
          where: { id: specimenId, businessId, orderItemId },
          select: { id: true, status: true },
        });

        if (!specimen) {
          throw new HospitalLabError(
            "Specimen not found for this test in this hospital.",
            404,
          );
        }

        if (specimen.status !== "RECEIVED") {
          throw new HospitalLabError(
            "A result can only be entered against a received specimen.",
            409,
          );
        }
      }

      const result = await tx.hospitalLabResult.create({
        data: {
          businessId,
          orderItemId,
          specimenId,
          resultValue,
          numericValue,
          unit,
          referenceRange,
          abnormalFlag,
          enteredBy: userId,
        },
      });

      await recordAuditEvent(
        {
          businessId,
          actorId: userId,
          action: AUDIT_ACTIONS.HOSPITAL_LAB_RESULT_CREATED,
          category: "HOSPITAL",
          entityType: "HospitalLabResult",
          entityId: result.id,
          metadata: {
            orderItemId,
            specimenId,
            status: result.status,
            hasNumericValue: numericValue !== null,
            hasAbnormalFlag: abnormalFlag !== null,
          },
        },
        tx,
      );

      return result;
    },
    { maxWait: 10_000, timeout: 15_000 },
  );
}

export async function verifyHospitalLabResult(resultId: string) {
  const { businessId, userId } = await getHospitalLabContext();
  const id = resultId?.trim();

  if (!id) {
    throw new HospitalLabError("Laboratory result ID is required.");
  }

  return prisma.$transaction(
    async (tx) => {
      const result = await tx.hospitalLabResult.findFirst({
        where: { id, businessId },
        include: {
          orderItem: {
            include: {
              order: { select: { businessId: true, status: true } },
            },
          },
        },
      });

      if (
        !result ||
        result.orderItem.businessId !== businessId ||
        result.orderItem.order.businessId !== businessId
      ) {
        throw new HospitalLabError(
          "Laboratory result not found in this hospital.",
          404,
        );
      }

      if (
        result.status !== "DRAFT" &&
        result.status !== "AMENDED" &&
        result.status !== "PRELIMINARY"
      ) {
        throw new HospitalLabError(
          "Only draft, preliminary, or amended results can be verified.",
          409,
        );
      }

      if (
        result.orderItem.status === "CANCELLED" ||
        result.orderItem.order.status === "CANCELLED"
      ) {
        throw new HospitalLabError(
          "Results for cancelled laboratory orders cannot be verified.",
          409,
        );
      }

      const updated = await tx.hospitalLabResult.update({
        where: { id: result.id },
        data: {
          status: "VERIFIED",
          verifiedBy: userId,
          verifiedAt: new Date(),
        },
      });

      await recordAuditEvent(
        {
          businessId,
          actorId: userId,
          action: AUDIT_ACTIONS.HOSPITAL_LAB_RESULT_VERIFIED,
          category: "HOSPITAL",
          entityType: "HospitalLabResult",
          entityId: updated.id,
          metadata: {
            previousStatus: result.status,
            status: updated.status,
            orderItemId: result.orderItemId,
          },
        },
        tx,
      );

      return updated;
    },
    { maxWait: 10_000, timeout: 15_000 },
  );
}

export async function releaseHospitalLabResult(resultId: string) {
  const { businessId, userId } = await getHospitalLabContext();
  const id = resultId?.trim();

  if (!id) {
    throw new HospitalLabError("Laboratory result ID is required.");
  }

  return prisma.$transaction(
    async (tx) => {
      const result = await tx.hospitalLabResult.findFirst({
        where: { id, businessId },
        include: {
          orderItem: {
            include: {
              order: {
                select: {
                  id: true,
                  businessId: true,
                  status: true,
                },
              },
            },
          },
        },
      });

      if (
        !result ||
        result.orderItem.businessId !== businessId ||
        result.orderItem.order.businessId !== businessId
      ) {
        throw new HospitalLabError(
          "Laboratory result not found in this hospital.",
          404,
        );
      }

      if (result.status !== "VERIFIED") {
        throw new HospitalLabError(
          "Only verified laboratory results can be released.",
          409,
        );
      }

      if (
        result.orderItem.status === "CANCELLED" ||
        result.orderItem.order.status === "CANCELLED"
      ) {
        throw new HospitalLabError(
          "Results for cancelled laboratory orders or items cannot be released.",
          409,
        );
      }

      const updated = await tx.hospitalLabResult.update({
        where: { id: result.id },
        data: {
          status: "RELEASED",
          releasedBy: userId,
          releasedAt: new Date(),
        },
      });

      const itemResults = await tx.hospitalLabResult.findMany({
        where: {
          businessId,
          orderItemId: result.orderItemId,
        },
        select: { status: true },
      });

      const hasResults = itemResults.length > 0;
      const allResultsReleased =
        hasResults && itemResults.every((entry) => entry.status === "RELEASED");

      // A released amendment on a completed order updates the result's
      // release metadata without reopening the historical order or item.
      if (result.orderItem.order.status !== "COMPLETED") {
        if (allResultsReleased) {
          await tx.hospitalLabOrderItem.update({
            where: { id: result.orderItemId },
            data: { status: "RESULTED" },
          });
        }

        const activeItems = await tx.hospitalLabOrderItem.findMany({
          where: {
            businessId,
            orderId: result.orderItem.orderId,
            status: { not: "CANCELLED" },
          },
          select: { id: true, status: true },
        });

        if (activeItems.length > 0) {
          const allItemsResulted = activeItems.every(
            (item) =>
              item.id === result.orderItemId
                ? allResultsReleased
                : item.status === "RESULTED",
          );
          const anyItemResulted = activeItems.some(
            (item) =>
              item.status === "RESULTED" ||
              (item.id === result.orderItemId && allResultsReleased),
          );

          const nextOrderStatus = allItemsResulted
            ? "COMPLETED"
            : anyItemResulted
              ? "PARTIALLY_RESULTED"
              : "IN_PROGRESS";

          await tx.hospitalLabOrder.update({
            where: { id: result.orderItem.orderId },
            data: { status: nextOrderStatus },
          });
        }
      }

      await recordAuditEvent(
        {
          businessId,
          actorId: userId,
          action: AUDIT_ACTIONS.HOSPITAL_LAB_RESULT_RELEASED,
          category: "HOSPITAL",
          entityType: "HospitalLabResult",
          entityId: updated.id,
          metadata: {
            previousStatus: result.status,
            status: updated.status,
            orderItemId: result.orderItemId,
            itemStatus: allResultsReleased ? "RESULTED" : result.orderItem.status,
          },
        },
        tx,
      );

      return updated;
    },
    { maxWait: 10_000, timeout: 15_000 },
  );
}

export async function amendHospitalLabResult(
  resultId: string,
  input: {
    resultValue: string;
    numericValue?: number | string | null;
    unit?: string | null;
    referenceRange?: string | null;
    abnormalFlag?: string | null;
    amendmentReason: string;
  },
) {
  const { businessId, userId } = await getHospitalLabContext();
  const id = resultId?.trim();
  const resultValue = input.resultValue?.trim();
  const amendmentReason = input.amendmentReason?.trim();

  if (!id) throw new HospitalLabError("Laboratory result ID is required.");
  if (!resultValue || resultValue.length > 20_000) {
    throw new HospitalLabError("A valid result value is required.");
  }
  if (!amendmentReason || amendmentReason.length > 2_000) {
    throw new HospitalLabError("An amendment reason is required and must not exceed 2,000 characters.");
  }

  const optionalText = (value: string | null | undefined, maxLength: number, field: string) => {
    if (value == null) return null;
    const normalized = value.trim();
    if (normalized.length > maxLength) {
      throw new HospitalLabError(`${field} must not exceed ${maxLength} characters.`);
    }
    return normalized || null;
  };

  const unit = optionalText(input.unit, 100, "Unit");
  const referenceRange = optionalText(input.referenceRange, 250, "Reference range");

  let numericValue: import("@/generated/prisma/client").Prisma.Decimal | null = null;
  if (input.numericValue !== undefined && input.numericValue !== null && input.numericValue !== "") {
    const raw = String(input.numericValue).trim();
    if (!/^-?\d+(\.\d{1,4})?$/.test(raw)) {
      throw new HospitalLabError("Numeric result must be a valid number with up to 4 decimal places.");
    }
    numericValue = new (await import("@/generated/prisma/client")).Prisma.Decimal(raw);
    if (!numericValue.isFinite()) {
      throw new HospitalLabError("Numeric result must be finite.");
    }
  }

  return prisma.$transaction(async (tx) => {
    // Serialize amendments to the same result before calculating revision numbers.
    await tx.$queryRaw`SELECT "id" FROM "HospitalLabResult" WHERE "id" = ${id} AND "businessId" = ${businessId} FOR UPDATE`;

    const result = await tx.hospitalLabResult.findFirst({
      where: { id, businessId },
      include: {
        orderItem: {
          include: {
            order: { select: { businessId: true, status: true } },
          },
        },
      },
    });

    if (
      !result ||
      result.orderItem.businessId !== businessId ||
      result.orderItem.order.businessId !== businessId
    ) {
      throw new HospitalLabError("Laboratory result not found in this hospital.", 404);
    }

    if (result.status !== "RELEASED" && result.status !== "AMENDED") {
      throw new HospitalLabError("Only released laboratory results can be amended.", 409);
    }

    if (
      result.orderItem.status === "CANCELLED" ||
      result.orderItem.order.status === "CANCELLED"
    ) {
      throw new HospitalLabError("Results for cancelled laboratory orders or items cannot be amended.", 409);
    }

    const latestRevision = await tx.hospitalLabResultRevision.aggregate({
      where: { businessId, resultId: result.id },
      _max: { revision: true },
    });
    const revision = (latestRevision._max.revision ?? 0) + 1;

    await tx.hospitalLabResultRevision.create({
      data: {
        businessId,
        resultId: result.id,
        revision,
        resultValue: result.resultValue,
        numericValue: result.numericValue,
        unit: result.unit,
        referenceRange: result.referenceRange,
        abnormalFlag: result.abnormalFlag,
        status: result.status,
        amendedBy: userId,
        amendmentReason,
      },
    });

    const updated = await tx.hospitalLabResult.update({
      where: { id: result.id },
      data: {
        resultValue,
        numericValue,
        unit,
        referenceRange,
        abnormalFlag: input.abnormalFlag?.trim() || null,
        status: "AMENDED",
        amendmentReason,
        verifiedBy: null,
        verifiedAt: null,
        releasedBy: null,
        releasedAt: null,
      },
    });

    // Preserve completed orders as historical workflow records. Only reopen
    // an in-progress workflow when the parent order has not been completed.
    if (result.orderItem.order.status !== "COMPLETED") {
      await tx.hospitalLabOrderItem.update({
        where: { id: result.orderItemId },
        data: { status: "PROCESSING" },
      });

      const activeItems = await tx.hospitalLabOrderItem.findMany({
        where: {
          businessId,
          orderId: result.orderItem.orderId,
          status: { not: "CANCELLED" },
        },
        select: { id: true, status: true },
      });

      const anyItemResulted = activeItems.some(
        (item) => item.id !== result.orderItemId && item.status === "RESULTED",
      );

      await tx.hospitalLabOrder.update({
        where: { id: result.orderItem.orderId },
        data: {
          status: anyItemResulted ? "PARTIALLY_RESULTED" : "IN_PROGRESS",
        },
      });
    }

    await recordAuditEvent({
      businessId,
      actorId: userId,
      action: AUDIT_ACTIONS.HOSPITAL_LAB_RESULT_AMENDED,
      category: "HOSPITAL",
      entityType: "HospitalLabResult",
      entityId: updated.id,
      metadata: {
        revision,
        previousStatus: result.status,
        status: updated.status,
        orderItemId: result.orderItemId,
        amendmentReason,
      },
    }, tx);

    return updated;
  }, { maxWait: 10_000, timeout: 15_000 });
}
