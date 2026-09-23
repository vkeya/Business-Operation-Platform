import "server-only";

import { prisma } from "@/lib/database/prisma";
import {
  DataSubjectRequestStatus,
  DataSubjectRequestType,
} from "@/generated/prisma/client";

const ACTIVE_REQUEST_STATUSES: DataSubjectRequestStatus[] = [
  DataSubjectRequestStatus.PENDING,
  DataSubjectRequestStatus.IN_REVIEW,
];

function normalizeUserId(userId: string) {
  const normalized = userId.trim();

  if (!normalized) {
    throw new Error("User ID is required.");
  }

  return normalized;
}

function normalizeRequestType(
  type: DataSubjectRequestType,
) {
  if (!Object.values(DataSubjectRequestType).includes(type)) {
    throw new Error("Invalid data subject request type.");
  }

  return type;
}

export async function createDataSubjectRequest(
  userId: string,
  type: DataSubjectRequestType,
) {
  const normalizedUserId = normalizeUserId(userId);
  const normalizedType = normalizeRequestType(type);

  const existingRequest =
    await prisma.dataSubjectRequest.findFirst({
      where: {
        userId: normalizedUserId,
        type: normalizedType,
        status: {
          in: ACTIVE_REQUEST_STATUSES,
        },
      },
      orderBy: {
        requestedAt: "desc",
      },
    });

  if (existingRequest) {
    throw new Error(
      "You already have an active request of this type.",
    );
  }

  return prisma.dataSubjectRequest.create({
    data: {
      userId: normalizedUserId,
      type: normalizedType,
      status: DataSubjectRequestStatus.PENDING,
    },
  });
}

export async function getUserDataSubjectRequests(
  userId: string,
) {
  const normalizedUserId = normalizeUserId(userId);

  return prisma.dataSubjectRequest.findMany({
    where: {
      userId: normalizedUserId,
    },
    orderBy: {
      requestedAt: "desc",
    },
  });
}

export async function getUserDataSubjectRequest(
  userId: string,
  requestId: string,
) {
  const normalizedUserId = normalizeUserId(userId);
  const normalizedRequestId = requestId.trim();

  if (!normalizedRequestId) {
    throw new Error("Request ID is required.");
  }

  return prisma.dataSubjectRequest.findFirst({
    where: {
      id: normalizedRequestId,
      userId: normalizedUserId,
    },
  });
}

export async function cancelDataSubjectRequest(
  userId: string,
  requestId: string,
) {
  const normalizedUserId = normalizeUserId(userId);
  const normalizedRequestId = requestId.trim();

  if (!normalizedRequestId) {
    throw new Error("Request ID is required.");
  }

  const request =
    await prisma.dataSubjectRequest.findFirst({
      where: {
        id: normalizedRequestId,
        userId: normalizedUserId,
      },
    });

  if (!request) {
    throw new Error("Data subject request not found.");
  }

  if (
    request.status !==
    DataSubjectRequestStatus.PENDING
  ) {
    throw new Error(
      "Only pending requests can be cancelled.",
    );
  }

  return prisma.dataSubjectRequest.update({
    where: {
      id: request.id,
    },
    data: {
      status: DataSubjectRequestStatus.CANCELLED,
    },
  });
}