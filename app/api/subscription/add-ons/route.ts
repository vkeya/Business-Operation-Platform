import { NextResponse } from "next/server";
import { getCurrentBusinessContext } from "@/lib/business/currentBusiness";
import { prisma } from "@/lib/database/prisma";
import type { SubscriptionAddOnCode } from "@/lib/subscription/subscriptionPlanCatalog";

const ADD_ON_PRICING: Record<
  SubscriptionAddOnCode,
  {
    name: string;
    description: string;
    monthly: number;
    annual: number;
  }
> = {
  ADDITIONAL_USER: {
    name: "Additional User",
    description: "Additional user capacity beyond the plan allowance.",
    monthly: 300,
    annual: 3000,
  },
  ADDITIONAL_BRANCH: {
    name: "Additional Branch",
    description: "Additional branch capacity beyond the plan allowance.",
    monthly: 1000,
    annual: 10000,
  },
  AUTOPILOT_LITE: {
    name: "Autopilot Lite",
    description: "Professional-tier Autopilot recommendations as a commercial add-on.",
    monthly: 1500,
    annual: 15000,
  },
};

const PROFESSIONAL_MINIMUM = "PROFESSIONAL";

export async function GET() {
  try {
    const context = await getCurrentBusinessContext();

    const subscription = await prisma.businessSubscription.findUnique({
      where: {
        businessId: context.business.id,
      },
      select: {
        plan: true,
        status: true,
        addOns: {
          where: {
            status: "ACTIVE",
          },
          select: {
            addOnCode: true,
            quantity: true,
            startedAt: true,
            endedAt: true,
          },
        },
      },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: "This business does not have a subscription." },
        { status: 404 },
      );
    }

    const eligible =
      subscription.status === "ACTIVE" &&
      (subscription.plan === PROFESSIONAL_MINIMUM ||
        subscription.plan === "BUSINESS");

    const addOns = Object.entries(ADD_ON_PRICING).map(
      ([code, pricing]) => {
        const addOnCode = code as SubscriptionAddOnCode;
        const active = subscription.addOns.find(
          (addOn) => addOn.addOnCode === addOnCode,
        );

        return {
          code: addOnCode,
          name: pricing.name,
          description: pricing.description,
          billingCurrency: "KES",
          pricing: {
            monthly: pricing.monthly,
            annual: pricing.annual,
          },
          minimumPlan: PROFESSIONAL_MINIMUM,
          available:
            eligible && subscription.plan !== "BUSINESS",
          activeQuantity: active?.quantity ?? 0,
          startedAt: active?.startedAt ?? null,
          endedAt: active?.endedAt ?? null,
        };
      },
    );

    return NextResponse.json({
      success: true,
      plan: subscription.plan,
      subscriptionStatus: subscription.status,
      addOns,
    });
  } catch (error) {
    console.error("Subscription add-on catalog failed:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load subscription add-ons.",
      },
      { status: 500 },
    );
  }
}
