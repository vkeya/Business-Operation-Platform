import { supermarketBasketIntelligenceService } from "@/lib/supermarket/supermarketBasketIntelligenceService";
import { supermarketDemandService } from "@/lib/supermarket/supermarketDemandService";
import { supermarketForecastingIntelligenceService } from "@/lib/supermarket/supermarketForecastingIntelligenceService";
import { supermarketPricingPromotionIntelligenceService } from "@/lib/supermarket/supermarketPricingPromotionIntelligenceService";
import { supermarketStockService } from "@/lib/supermarket/supermarketStockService";
import { prisma } from "@/lib/database/prisma";
import { recordAuditEvent } from "@/lib/audit/auditService";
import { AUDIT_ACTIONS } from "@/lib/audit/auditActions";
import type { SupermarketAutopilotActionStatus } from "@/generated/prisma/client";

const DEFAULT_LOOKBACK_DAYS = 30;
const DEFAULT_MIN_BASKETS = 2;
const DEFAULT_MAX_ACTIONS = 50;

export type SupermarketAutopilotPriority =
  | "CRITICAL"
  | "HIGH"
  | "MEDIUM"
  | "LOW";

export type SupermarketAutopilotActionUpdateStatus =
  | "ACCEPTED"
  | "DISMISSED"
  | "SNOOZED"
  | "COMPLETED";

export type SupermarketAutopilotActionType =
  | "REPLENISH"
  | "PROTECT_STOCK"
  | "PROMOTE"
  | "CLEARANCE"
  | "PROTECT_MARGIN"
  | "REVIEW_PRICE"
  | "CROSS_SELL"
  | "MONITOR";

export type SupermarketAutopilotSource =
  | "STOCK"
  | "DEMAND"
  | "FORECAST"
  | "PRICING"
  | "BASKET";

export interface SupermarketAutopilotAction {
  id: string;

  productId: string | null;

  productName: string;
  sku: string | null;

  priority: SupermarketAutopilotPriority;
  action: SupermarketAutopilotActionType;

  title: string;
  reason: string;

  source: SupermarketAutopilotSource;

  score: number;

  evidence: {
    stockCoverageDays: number | null;
    forecastStockoutDays: number | null;
    forecastDailyVelocity: number | null;

    demandTrend:
      | "ACCELERATING"
      | "DECLINING"
      | "STABLE"
      | "DORMANT"
      | null;

    pricingAction: string | null;
    pricingRisk: string | null;

    basketOpportunity:
      | "STRONG"
      | "GOOD"
      | "EMERGING"
      | "INSUFFICIENT"
      | null;

    basketPartnerProductId: string | null;
    basketPartnerProductName: string | null;
  };
}

export interface SupermarketAutopilotSummary {
  businessId: string;
  lookbackDays: number;

  generatedAt: string;

  totalActions: number;

  criticalActions: number;
  highPriorityActions: number;
  mediumPriorityActions: number;
  lowPriorityActions: number;

  replenishmentActions: number;
  promotionActions: number;
  pricingActions: number;
  crossSellActions: number;
  monitoringActions: number;

  actions: SupermarketAutopilotAction[];
}

function round(value: number, decimals = 2) {
  const factor = 10 ** decimals;

  return Math.round(value * factor) / factor;
}

function priorityFromScore(
  score: number,
): SupermarketAutopilotPriority {
  if (score >= 90) {
    return "CRITICAL";
  }

  if (score >= 70) {
    return "HIGH";
  }

  if (score >= 40) {
    return "MEDIUM";
  }

  return "LOW";
}

function addAction(
  actions: SupermarketAutopilotAction[],
  action: SupermarketAutopilotAction,
) {
  const existing = actions.find(
    (item) =>
      item.productId === action.productId &&
      item.action === action.action,
  );

  if (!existing) {
    actions.push(action);
    return;
  }

  if (action.score > existing.score) {
    Object.assign(existing, action);
  }
}

export const supermarketAutopilotService = {
  async getAutopilotIntelligence(
    businessId: string,
    options?: {
      warehouseId?: string;
      lookbackDays?: number;
      productId?: string;
      minBaskets?: number;
      maxActions?: number;
    },
  ): Promise<SupermarketAutopilotSummary> {
    if (!businessId) {
      throw new Error("Business ID is required.");
    }

    const lookbackDays = Math.max(
      1,
      Math.min(
        options?.lookbackDays ??
          DEFAULT_LOOKBACK_DAYS,
        365,
      ),
    );

    const minBaskets = Math.max(
      2,
      Math.min(
        options?.minBaskets ??
          DEFAULT_MIN_BASKETS,
        100,
      ),
    );

    const maxActions = Math.max(
      1,
      Math.min(
        options?.maxActions ??
          DEFAULT_MAX_ACTIONS,
        200,
      ),
    );

    const serviceOptions = {
      warehouseId:
        options?.warehouseId,
      lookbackDays,
      productId:
        options?.productId,
    };

    const [
      stock,
      demand,
      forecast,
      pricing,
      basket,
    ] = await Promise.all([
      supermarketStockService.getStockIntelligence(
        businessId,
        serviceOptions,
      ),

      supermarketDemandService.getDemandIntelligence(
        businessId,
        serviceOptions,
      ),

      supermarketForecastingIntelligenceService.getForecastingIntelligence(
        businessId,
        serviceOptions,
      ),

      supermarketPricingPromotionIntelligenceService.getPricingPromotionIntelligence(
        businessId,
        serviceOptions,
      ),

      supermarketBasketIntelligenceService.getBasketIntelligence(
        businessId,
        {
          ...serviceOptions,
          minBaskets,
        },
      ),
    ]);

    const actions: SupermarketAutopilotAction[] =
      [];

    const stockByProduct = new Map(
      stock.items.map((item) => [
        item.productId,
        item,
      ]),
    );

    const demandByProduct = new Map(
      demand.items.map((item) => [
        item.productId,
        item,
      ]),
    );

    const forecastByProduct = new Map(
      forecast.items.map((item) => [
        item.productId,
        item,
      ]),
    );

    const pricingByProduct = new Map(
      pricing.items.map((item) => [
        item.productId,
        item,
      ]),
    );

    /*
     * 1. STOCK + FORECAST
     *
     * These are the most operationally important
     * signals and therefore receive the highest
     * priority.
     */
    for (const item of forecast.items) {
      const stockItem =
        stockByProduct.get(
          item.productId,
        );

      const availableStock =
        stockItem?.availableStock ??
        item.availableStock;

      const coverage =
        item.stockCoverageDays;

      const stockoutDays =
        item.projectedStockoutDays;

      if (
        availableStock <= 0 ||
        (stockoutDays !== null &&
          stockoutDays <= 7)
      ) {
        const score =
          availableStock <= 0
            ? 100
            : 95;

        addAction(actions, {
          id: `replenish-${item.productId}`,

          productId: item.productId,

          productName: item.name,
          sku: item.sku,

          priority:
            priorityFromScore(score),

          action: "REPLENISH",

          title:
            availableStock <= 0
              ? "Replenish immediately"
              : "Replenish before stockout",

          reason:
            availableStock <= 0
              ? "The product is currently out of stock."
              : `Forecast indicates stockout in approximately ${round(
                  stockoutDays ?? 0,
                )} days.`,

          source: "FORECAST",

          score,

          evidence: {
            stockCoverageDays:
              coverage,

            forecastStockoutDays:
              stockoutDays,

            forecastDailyVelocity:
              item.forecastDailyVelocity,

            demandTrend:
              item.trend,

            pricingAction:
              pricingByProduct.get(
                item.productId,
              )?.action ?? null,

            pricingRisk:
              pricingByProduct.get(
                item.productId,
              )?.risk ?? null,

            basketOpportunity:
              null,

            basketPartnerProductId:
              null,

            basketPartnerProductName:
              null,
          },
        });

        continue;
      }

      if (
        stockItem?.risk === "CRITICAL" ||
        stockItem?.risk === "LOW" ||
        (coverage !== null &&
          coverage <= 14)
      ) {
        const score =
          coverage !== null &&
          coverage <= 7
            ? 90
            : 80;

        addAction(actions, {
          id: `protect-stock-${item.productId}`,

          productId: item.productId,

          productName: item.name,
          sku: item.sku,

          priority:
            priorityFromScore(score),

          action: "PROTECT_STOCK",

          title: "Protect stock availability",

          reason:
            "Current stock coverage is low relative to forecast demand.",

          source: "FORECAST",

          score,

          evidence: {
            stockCoverageDays:
              coverage,

            forecastStockoutDays:
              stockoutDays,

            forecastDailyVelocity:
              item.forecastDailyVelocity,

            demandTrend:
              item.trend,

            pricingAction:
              pricingByProduct.get(
                item.productId,
              )?.action ?? null,

            pricingRisk:
              pricingByProduct.get(
                item.productId,
              )?.risk ?? null,

            basketOpportunity:
              null,

            basketPartnerProductId:
              null,

            basketPartnerProductName:
              null,
          },
        });
      }
    }

    /*
     * 2. PRICING / PROMOTION
     *
     * Pricing intelligence becomes an action only
     * when it does not conflict with a more urgent
     * stock protection requirement.
     */
    for (const item of pricing.items) {
      const forecastItem =
        forecastByProduct.get(
          item.productId,
        );

      if (
        item.action === "CLEARANCE"
      ) {
        addAction(actions, {
          id: `clearance-${item.productId}`,

          productId: item.productId,

          productName: item.name,
          sku: item.sku,

          priority: "HIGH",

          action: "CLEARANCE",

          title: "Reduce excess stock",

          reason: item.reason,

          source: "PRICING",

          score: 75,

          evidence: {
            stockCoverageDays:
              item.daysOfStockRemaining,

            forecastStockoutDays:
              forecastItem
                ?.projectedStockoutDays ??
              null,

            forecastDailyVelocity:
              forecastItem
                ?.forecastDailyVelocity ??
              null,

            demandTrend:
              forecastItem?.trend ?? null,

            pricingAction:
              item.action,

            pricingRisk:
              item.risk,

            basketOpportunity:
              null,

            basketPartnerProductId:
              null,

            basketPartnerProductName:
              null,
          },
        });
      } else if (
        item.action === "PROMOTE"
      ) {
        addAction(actions, {
          id: `promote-${item.productId}`,

          productId: item.productId,

          productName: item.name,
          sku: item.sku,

          priority: "MEDIUM",

          action: "PROMOTE",

          title: "Consider promotion",

          reason: item.reason,

          source: "PRICING",

          score: 55,

          evidence: {
            stockCoverageDays:
              item.daysOfStockRemaining,

            forecastStockoutDays:
              forecastItem
                ?.projectedStockoutDays ??
              null,

            forecastDailyVelocity:
              forecastItem
                ?.forecastDailyVelocity ??
              null,

            demandTrend:
              forecastItem?.trend ?? null,

            pricingAction:
              item.action,

            pricingRisk:
              item.risk,

            basketOpportunity:
              null,

            basketPartnerProductId:
              null,

            basketPartnerProductName:
              null,
          },
        });
      } else if (
        item.action ===
        "PROTECT_MARGIN"
      ) {
        addAction(actions, {
          id: `margin-${item.productId}`,

          productId: item.productId,

          productName: item.name,
          sku: item.sku,

          priority: "HIGH",

          action: "PROTECT_MARGIN",

          title: "Protect product margin",

          reason: item.reason,

          source: "PRICING",

          score: 72,

          evidence: {
            stockCoverageDays:
              item.daysOfStockRemaining,

            forecastStockoutDays:
              forecastItem
                ?.projectedStockoutDays ??
              null,

            forecastDailyVelocity:
              forecastItem
                ?.forecastDailyVelocity ??
              null,

            demandTrend:
              forecastItem?.trend ?? null,

            pricingAction:
              item.action,

            pricingRisk:
              item.risk,

            basketOpportunity:
              null,

            basketPartnerProductId:
              null,

            basketPartnerProductName:
              null,
          },
        });
      } else if (
        item.action ===
        "REVIEW_PRICE"
      ) {
        addAction(actions, {
          id: `price-review-${item.productId}`,

          productId: item.productId,

          productName: item.name,
          sku: item.sku,

          priority: "LOW",

          action: "REVIEW_PRICE",

          title: "Review pricing",

          reason: item.reason,

          source: "PRICING",

          score: 35,

          evidence: {
            stockCoverageDays:
              item.daysOfStockRemaining,

            forecastStockoutDays:
              forecastItem
                ?.projectedStockoutDays ??
              null,

            forecastDailyVelocity:
              forecastItem
                ?.forecastDailyVelocity ??
              null,

            demandTrend:
              forecastItem?.trend ?? null,

            pricingAction:
              item.action,

            pricingRisk:
              item.risk,

            basketOpportunity:
              null,

            basketPartnerProductId:
              null,

            basketPartnerProductName:
              null,
          },
        });
      }
    }

    /*
     * 3. BASKET OPPORTUNITIES
     *
     * Strong and good associations become
     * cross-selling opportunities.
     */
    for (const association of basket.associations) {
      if (
        association.opportunity !==
          "STRONG" &&
        association.opportunity !==
          "GOOD"
      ) {
        continue;
      }

      const score =
        association.opportunity ===
        "STRONG"
          ? 70
          : 50;

      const productA =
        association.productA;

      const productB =
        association.productB;

      addAction(actions, {
        id: `cross-sell-${productA.id}-${productB.id}`,

        productId: productA.id,

        productName: productA.name,
        sku: productA.sku,

        priority:
          priorityFromScore(score),

        action: "CROSS_SELL",

        title:
          `Cross-sell with ${productB.name}`,

        reason:
          `These products show a ${association.opportunity.toLowerCase()} basket association with lift ${round(
            association.lift,
          )} and ${round(
            Math.max(
              association.confidenceAtoBPercentage,
              association.confidenceBtoAPercentage,
            ),
          )}% maximum directional confidence.`,

        source: "BASKET",

        score,

        evidence: {
          stockCoverageDays:
            stockByProduct.get(
              productA.id,
            )?.daysOfStockRemaining ??
            null,

          forecastStockoutDays:
            forecastByProduct.get(
              productA.id,
            )?.projectedStockoutDays ??
            null,

          forecastDailyVelocity:
            forecastByProduct.get(
              productA.id,
            )?.forecastDailyVelocity ??
            null,

          demandTrend:
            demandByProduct.get(
              productA.id,
            )?.trend ?? null,

          pricingAction:
            pricingByProduct.get(
              productA.id,
            )?.action ?? null,

          pricingRisk:
            pricingByProduct.get(
              productA.id,
            )?.risk ?? null,

          basketOpportunity:
            association.opportunity,

          basketPartnerProductId:
            productB.id,

          basketPartnerProductName:
            productB.name,
        },
      });
    }

    /*
     * 4. HIGH-GROWTH DEMAND
     *
     * A rapidly accelerating product that is not
     * yet critically low becomes a monitoring action.
     */
    for (const item of demand.items) {
      if (
        item.trend !==
        "ACCELERATING"
      ) {
        continue;
      }

      const forecastItem =
        forecastByProduct.get(
          item.productId,
        );

      if (
        forecastItem?.projectedStockoutDays !==
          null &&
        (forecastItem?.projectedStockoutDays ??
          Infinity) <= 14
      ) {
        continue;
      }

      addAction(actions, {
        id: `monitor-growth-${item.productId}`,

        productId: item.productId,

        productName: item.name,
        sku: item.sku,

        priority: "MEDIUM",

        action: "MONITOR",

        title: "Watch accelerating demand",

        reason:
          "Recent demand is accelerating and should be monitored before it creates a stock constraint.",

        source: "DEMAND",

        score: 45,

        evidence: {
          stockCoverageDays:
            forecastItem
              ?.stockCoverageDays ??
            stockByProduct.get(
              item.productId,
            )?.daysOfStockRemaining ??
            null,

          forecastStockoutDays:
            forecastItem
              ?.projectedStockoutDays ??
            null,

          forecastDailyVelocity:
            forecastItem
              ?.forecastDailyVelocity ??
            null,

          demandTrend:
            item.trend,

          pricingAction:
            pricingByProduct.get(
              item.productId,
            )?.action ?? null,

          pricingRisk:
            pricingByProduct.get(
              item.productId,
            )?.risk ?? null,

          basketOpportunity:
            null,

          basketPartnerProductId:
            null,

          basketPartnerProductName:
            null,
        },
      });
    }

    /*
     * Final ordering:
     *
     * 1. Priority
     * 2. Score
     *
     * The orchestrator deliberately presents the
     * most actionable items first.
     */
    const priorityRank: Record<
      SupermarketAutopilotPriority,
      number
    > = {
      CRITICAL: 0,
      HIGH: 1,
      MEDIUM: 2,
      LOW: 3,
    };

    actions.sort((a, b) => {
      const priorityDifference =
        priorityRank[a.priority] -
        priorityRank[b.priority];

      if (priorityDifference !== 0) {
        return priorityDifference;
      }

      return b.score - a.score;
    });

    const limitedActions =
      actions.slice(0, maxActions);

    return {
      businessId,
      lookbackDays,

      generatedAt:
        new Date().toISOString(),

      totalActions:
        limitedActions.length,

      criticalActions:
        limitedActions.filter(
          (item) =>
            item.priority ===
            "CRITICAL",
        ).length,

      highPriorityActions:
        limitedActions.filter(
          (item) =>
            item.priority ===
            "HIGH",
        ).length,

      mediumPriorityActions:
        limitedActions.filter(
          (item) =>
            item.priority ===
            "MEDIUM",
        ).length,

      lowPriorityActions:
        limitedActions.filter(
          (item) =>
            item.priority ===
            "LOW",
        ).length,

      replenishmentActions:
        limitedActions.filter(
          (item) =>
            item.action ===
              "REPLENISH" ||
            item.action ===
              "PROTECT_STOCK",
        ).length,

      promotionActions:
        limitedActions.filter(
          (item) =>
            item.action ===
              "PROMOTE" ||
            item.action ===
              "CLEARANCE",
        ).length,

      pricingActions:
        limitedActions.filter(
          (item) =>
            item.action ===
              "PROTECT_MARGIN" ||
            item.action ===
              "REVIEW_PRICE",
        ).length,

      crossSellActions:
        limitedActions.filter(
          (item) =>
            item.action ===
            "CROSS_SELL",
        ).length,

      monitoringActions:
        limitedActions.filter(
          (item) =>
            item.action ===
            "MONITOR",
        ).length,

      actions: limitedActions,
    };
  },

    async updateAction(
    businessId: string,
    actionId: string,
    status: SupermarketAutopilotActionUpdateStatus,
    options?: {
      snoozedUntil?: Date | null;
      actorId?: string | null;
    },
  ) {
    if (!businessId) {
      throw new Error("Business ID is required.");
    }

    if (!actionId) {
      throw new Error("Action ID is required.");
    }

    const action =
      await prisma.supermarketAutopilotAction.findFirst({
        where: {
          id: actionId,
          businessId,
        },
      });

    if (!action) {
      throw new Error(
        "Autopilot action not found.",
      );
    }

	const allowedTransitions: Record<
  SupermarketAutopilotActionStatus,
  SupermarketAutopilotActionStatus[]
> = {
  PENDING: [
    "ACCEPTED",
    "DISMISSED",
    "SNOOZED",
  ],

  ACCEPTED: [
    "COMPLETED",
  ],

  SNOOZED: [
    "ACCEPTED",
    "DISMISSED",
  ],

  DISMISSED: [],

  COMPLETED: [],

  EXPIRED: [],
};

const allowedNextStatuses =
  allowedTransitions[action.status];

if (!allowedNextStatuses.includes(status)) {
  throw new Error(
    `Invalid Autopilot action transition: ${action.status} → ${status}.`,
  );
}

if (status === "SNOOZED") {
  if (!options?.snoozedUntil) {
    throw new Error(
      "snoozedUntil is required when snoozing an Autopilot action.",
    );
  }

  if (
    options.snoozedUntil.getTime() <=
    Date.now()
  ) {
    throw new Error(
      "snoozedUntil must be in the future.",
    );
  }
}

    const now = new Date();

    const data: {
      status: SupermarketAutopilotActionStatus;
      snoozedUntil?: Date | null;
      acceptedAt?: Date | null;
      dismissedAt?: Date | null;
      completedAt?: Date | null;
    } = {
      status,
    };

    if (status === "ACCEPTED") {
      data.acceptedAt = now;
      data.dismissedAt = null;
      data.completedAt = null;
      data.snoozedUntil = null;
    }

    if (status === "DISMISSED") {
      data.dismissedAt = now;
      data.acceptedAt = null;
      data.completedAt = null;
      data.snoozedUntil = null;
    }

    if (status === "SNOOZED") {
      data.snoozedUntil =
        options?.snoozedUntil ?? null;
      data.acceptedAt = null;
      data.dismissedAt = null;
      data.completedAt = null;
    }

    if (status === "COMPLETED") {
      data.completedAt = now;
      data.acceptedAt =
        action.acceptedAt ?? now;
      data.dismissedAt = null;
      data.snoozedUntil = null;
    }

    const updated =
      await prisma.supermarketAutopilotAction.update({
        where: {
          id: action.id,
        },
        data,
      });

    await recordAuditEvent({
      businessId,
      actorId: options?.actorId ?? null,

      action:
        AUDIT_ACTIONS.SUPERMARKET_AUTOPILOT_ACTION_UPDATED,

      category: "BUSINESS",
      severity: "INFO",
      outcome: "SUCCESS",

      entityType:
        "SupermarketAutopilotAction",

      entityId: action.id,

      beforeData: {
        status: action.status,
        snoozedUntil:
          action.snoozedUntil,
        acceptedAt:
          action.acceptedAt,
        dismissedAt:
          action.dismissedAt,
        completedAt:
          action.completedAt,
      },

      afterData: {
        status: updated.status,
        snoozedUntil:
          updated.snoozedUntil,
        acceptedAt:
          updated.acceptedAt,
        dismissedAt:
          updated.dismissedAt,
        completedAt:
          updated.completedAt,
      },

      metadata: {
        actionType:
          action.actionType,
        productId:
          action.productId,
        productName:
          action.productName,
        priority:
          action.priority,
      },
    });

    return updated;
  },

};
