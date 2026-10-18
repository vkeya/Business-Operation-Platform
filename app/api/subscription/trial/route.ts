
import { NextResponse } from "next/server";

import { getCurrentBusinessContext } from "@/lib/business/currentBusiness";
import { prisma } from "@/lib/database/prisma";
import { subscriptionPlanCatalog } from "@/lib/subscription/subscriptionPlanCatalog";
import { recordAuditEvent } from "@/lib/audit/auditService";
import { AUDIT_ACTIONS } from "@/lib/audit/auditActions";

export async function POST() {
  try {
    const context = await getCurrentBusinessContext();
    const businessId = context.business.id;

    const existing = await prisma.businessSubscription.findUnique({
      where: { businessId },
    });

    if (existing) {
      return NextResponse.json(
        {
          error:
            "This business already has a subscription record. Choose a paid plan or manage the existing subscription.",
          subscription: {
            plan: existing.plan,
            status: existing.status,
          },
        },
        { status: 409 },
      );
    }

    const trialDays =
      subscriptionPlanCatalog.FREE_TRIAL.trialDays;

    if (!trialDays || trialDays <= 0) {
      throw new Error("The free trial duration is not configured.");
    }

    const trialStartedAt = new Date();
    const trialEndsAt = new Date(trialStartedAt);
    trialEndsAt.setDate(trialEndsAt.getDate() + trialDays);

    let subscription;

    try {
      subscription = await prisma.businessSubscription.create({
        data: {
          businessId,
          plan: "FREE_TRIAL",
          status: "TRIALING",
          trialStartedAt,
          trialEndsAt,
        },
      });
    } catch (error) {
      // The unique businessId constraint protects against simultaneous
      // requests starting more than one trial.
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "P2002"
      ) {
        return NextResponse.json(
          { error: "A subscription already exists for this business." },
          { status: 409 },
        );
      }

      throw error;
    }

    try {
      await recordAuditEvent({
        businessId,
        actorId: context.user.id,
        action: AUDIT_ACTIONS.SUBSCRIPTION_TRIAL_STARTED,
        category: "BUSINESS",
        entityType: "BusinessSubscription",
        entityId: subscription.id,
        afterData: {
          plan: subscription.plan,
          status: subscription.status,
          trialStartedAt: subscription.trialStartedAt?.toISOString() ?? null,
          trialEndsAt: subscription.trialEndsAt?.toISOString() ?? null,
        },
      });
    } catch (auditError) {
      // Do not report trial creation as failed after it has committed.
      console.error("Failed to audit subscription trial start:", auditError);
    }

    return NextResponse.json(
      {
        success: true,
        message: `Your ${trialDays}-day free trial has started.`,
        subscription: {
          plan: subscription.plan,
          status: subscription.status,
          trialStartedAt: subscription.trialStartedAt,
          trialEndsAt: subscription.trialEndsAt,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Subscription trial start failed:", error);

    return NextResponse.json(
      { error: "Unable to start the free trial." },
      { status: 500 },
    );
  }
}
