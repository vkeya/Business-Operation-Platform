import { NextResponse } from "next/server";
import { requireBusinessOperationAccess } from "@/lib/subscription/businessOperationAccessService";
import { BusinessPermissionError } from "@/lib/business/businessPermissionService";
import { getCurrentBusinessContext } from "@/lib/business/currentBusiness";
import { executePosCheckout } from "@/lib/pos/posCheckoutAdapter";
import { recordAuditEvent } from "@/lib/audit/auditService";
import { SubscriptionEntitlementError } from "@/lib/subscription/subscriptionEntitlementService";
import { AUDIT_ACTIONS } from "@/lib/audit/auditActions";
import type { PosCheckoutRequest } from "@/lib/pos/posTypes";

export async function POST(request: Request) {
  let context: Awaited<
    ReturnType<typeof getCurrentBusinessContext>
  > | null = null;

  try {
    context = await getCurrentBusinessContext();;

await requireBusinessOperationAccess(
  context.user.id,
  context.business.id,
  "sales.manage",
);

    const body =
      (await request.json()) as PosCheckoutRequest;

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        {
          error: "Invalid checkout request.",
        },
        { status: 400 },
      );
    }

    if (!body.warehouseId?.trim()) {
      return NextResponse.json(
        {
          error: "Warehouse is required.",
        },
        { status: 400 },
      );
    }

    if (!body.currency?.trim()) {
      return NextResponse.json(
        {
          error: "Currency is required.",
        },
        { status: 400 },
      );
    }

    if (!body.cart || !Array.isArray(body.cart.items)) {
      return NextResponse.json(
        {
          error: "Cart items are required.",
        },
        { status: 400 },
      );
    }

    if (!body.payment) {
      return NextResponse.json(
        {
          error: "Payment details are required.",
        },
        { status: 400 },
      );
    }

	const result = await executePosCheckout(
  body,
  context.business.id,
  context.user.id,
);

console.log("[POS AUDIT] ABOUT TO WRITE", {
  businessId: context.business.id,
  actorId: context.user.id,
  action: AUDIT_ACTIONS.SALE_CREATED,
  saleId: result.sale.saleId,
});

try {
    await recordAuditEvent({
  businessId: context.business.id,
  actorId: context.user.id,

  action: AUDIT_ACTIONS.SALE_CREATED,

  category: "SALES",
  severity: "INFO",
  outcome: "SUCCESS",

  entityType: "SALE",
  entityId: result.sale.saleId,

  metadata: {
    source: "POS",
    operation: "pos_checkout",
    status: result.status,
    paymentMethod: body.payment.method,
    referenceNumber: result.sale.referenceNumber,
    totalAmount: result.sale.totalAmount,
    currency: result.sale.currency,
  },
});

 console.log("[POS AUDIT] SUCCESS", {
    saleId: result.sale.saleId,
  });
} catch (auditError) {
  console.error(
    "[POS AUDIT] FAILED TO RECORD SUCCESS EVENT",
    auditError,
  );
}

    return NextResponse.json(result, {
      status: 201,
    });
      } catch (error) {
    if (
        error instanceof BusinessPermissionError ||
        error instanceof SubscriptionEntitlementError
      ) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }

    console.error(
      "POS checkout failed:",
      error,
    );

    if (context) {
      try {
        await recordAuditEvent({
          businessId: context.business.id,
          actorId: context.user.id,

          action:
            AUDIT_ACTIONS.SALE_CHECKOUT_FAILED,

          category: "SALES",
          severity: "ERROR",
          outcome: "FAILED",

          entityType: "POS_CHECKOUT",

           metadata: {
    source: "POS",
    operation: "pos_checkout",
    error:
      error instanceof Error
        ? error.message
        : "Unable to complete POS checkout.",
  },
        });
		 console.log("[POS AUDIT] CHECKOUT FAILURE RECORDED");
      } catch (auditError) {
        console.error(
          "Failed to record POS checkout audit event:",
          auditError,
        );
      }
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to complete POS checkout.",
      },
      { status: 500 },
    );
  }
}