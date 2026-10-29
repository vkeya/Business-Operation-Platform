import { NextResponse } from "next/server";

import { getCurrentBusinessContext } from "@/lib/business/currentBusiness";
import { BusinessPermissionError } from "@/lib/business/businessPermissionService";
import { requireBusinessOperationAccess } from "@/lib/subscription/businessOperationAccessService";
import { SubscriptionEntitlementError } from "@/lib/subscription/subscriptionEntitlementService";
import {
  HospitalAccessError,
  requireHospitalBusiness,
} from "@/lib/hospital/hospitalAccessService";
import {
  HospitalLabError,
  cancelHospitalLabOrder,
} from "@/lib/hospital/hospitalLabService";
import type { BusinessType } from "@/types";

type RouteContext = {
  params: Promise<{ orderId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const businessContext = await getCurrentBusinessContext();

    await requireBusinessOperationAccess(
      businessContext.user.id,
      businessContext.business.id,
      "hospital.labs.manage",
    );

    requireHospitalBusiness(
      businessContext.business.type as BusinessType,
    );

    const { orderId } = await context.params;

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "A valid JSON cancellation request is required." },
        { status: 400 },
      );
    }

    if (
      typeof body !== "object" ||
      body === null ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        { error: "A valid cancellation request is required." },
        { status: 400 },
      );
    }

    const input = body as Record<string, unknown>;

    for (const field of Object.keys(input)) {
      if (field !== "reason") {
        return NextResponse.json(
          { error: `Unsupported cancellation field: ${field}.` },
          { status: 400 },
        );
      }
    }

    if (
      typeof input.reason !== "string" ||
      !input.reason.trim() ||
      input.reason.trim().length > 2000
    ) {
      return NextResponse.json(
        { error: "A cancellation reason of 1–2,000 characters is required." },
        { status: 400 },
      );
    }

    const order = await cancelHospitalLabOrder(
      orderId,
      input.reason,
    );

    return NextResponse.json({ order });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Authentication is required."
    ) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 },
      );
    }

    if (
      error instanceof BusinessPermissionError ||
      error instanceof SubscriptionEntitlementError ||
      error instanceof HospitalAccessError ||
      error instanceof HospitalLabError
    ) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }

    console.error("Hospital laboratory order cancellation failed:", error);
    return NextResponse.json(
      { error: "Unable to cancel the hospital laboratory order." },
      { status: 500 },
    );
  }
}
