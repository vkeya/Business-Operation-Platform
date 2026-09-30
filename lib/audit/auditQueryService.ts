import { prisma } from "@/lib/database/prisma";

import type {
  AuditCategory,
  AuditOutcome,
  AuditSeverity,
} from "./auditTypes";

export interface AuditEventQuery {
  businessId: string;

  page?: number;
  pageSize?: number;

  action?: string;
  category?: AuditCategory;
  severity?: AuditSeverity;
  outcome?: AuditOutcome;

  actorId?: string;
  entityType?: string;
  entityId?: string;

  search?: string;

  from?: Date;
  to?: Date;
}

export async function queryAuditEvents(input: AuditEventQuery) {
  const businessId = input.businessId.trim();

  if (!businessId) {
    throw new Error("Business ID is required.");
  }

  const page = Math.max(1, input.page ?? 1);
  const pageSize = Math.min(
    Math.max(1, input.pageSize ?? 50),
    100,
  );

  const where = {
    businessId,

    ...(input.action
      ? { action: input.action }
      : {}),

    ...(input.category
      ? { category: input.category }
      : {}),

    ...(input.severity
      ? { severity: input.severity }
      : {}),

    ...(input.outcome
      ? { outcome: input.outcome }
      : {}),

    ...(input.actorId
      ? { actorId: input.actorId }
      : {}),

    ...(input.entityType
      ? { entityType: input.entityType }
      : {}),

    ...(input.entityId
      ? { entityId: input.entityId }
      : {}),

    ...(input.from || input.to
      ? {
          createdAt: {
            ...(input.from
              ? { gte: input.from }
              : {}),
            ...(input.to
              ? { lte: input.to }
              : {}),
          },
        }
      : {}),

    ...(input.search
      ? {
          OR: [
            {
              action: {
                contains: input.search,
                mode: "insensitive" as const,
              },
            },
            {
              entityType: {
                contains: input.search,
                mode: "insensitive" as const,
              },
            },
            {
              entityId: {
                contains: input.search,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : {}),
  };

  const skip = (page - 1) * pageSize;

  const [events, total] = await Promise.all([
    prisma.auditEvent.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: pageSize,
    }),

    prisma.auditEvent.count({
      where,
    }),
  ]);

  /*
   * AuditEvent intentionally stores actorId without a Prisma
   * relation. Resolve users separately so audit records remain
   * valid even when the actor is unavailable or represents
   * a system process.
   */
  const actorIds = [
    ...new Set(
      events
        .map((event) => event.actorId)
        .filter(
          (actorId): actorId is string =>
            Boolean(actorId),
        ),
    ),
  ];

  const actors =
    actorIds.length > 0
      ? await prisma.user.findMany({
          where: {
            id: {
              in: actorIds,
            },
          },
          select: {
            id: true,
            name: true,
            email: true,
          },
        })
      : [];

  const actorMap = new Map(
    actors.map((actor) => [
      actor.id,
      actor,
    ]),
  );

  const enrichedEvents = events.map(
    (event) => ({
      ...event,
      actor: event.actorId
        ? actorMap.get(event.actorId) ?? null
        : null,
    }),
  );

  return {
    events: enrichedEvents,

    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(
        total / pageSize,
      ),
      hasNextPage:
        page * pageSize < total,
      hasPreviousPage: page > 1,
    },
  };
}