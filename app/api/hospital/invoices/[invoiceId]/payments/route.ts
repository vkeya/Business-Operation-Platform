
import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { getCurrentBusinessContext } from "@/lib/business/currentBusiness";
import { BusinessPermissionError } from "@/lib/business/businessPermissionService";
import { requireBusinessOperationAccess } from "@/lib/subscription/businessOperationAccessService";
import { SubscriptionEntitlementError } from "@/lib/subscription/subscriptionEntitlementService";
import { HospitalAccessError } from "@/lib/hospital/hospitalAccessService";
import {
  HospitalInvoicePaymentError,
  recordHospitalInvoicePayment,
} from "@/lib/hospital/hospitalInvoicePaymentService";

function errorResponse(error: unknown) {
  if (
    error instanceof BusinessPermissionError ||
    error instanceof SubscriptionEntitlementError ||
    error instanceof HospitalAccessError ||
    error instanceof HospitalInvoicePaymentError
  ) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode },
    );
  }

  if (
  error instanceof Prisma.PrismaClientKnownRequestError &&
  error.code === "P2002" &&
  (
    error.meta?.modelName === "HospitalInvoicePayment" ||
    (
      Array.isArray(error.meta?.target) &&
      error.meta.target.includes("businessId") &&
      error.meta.target.includes("reference")
    )
  )
) {
  return NextResponse.json(
    { error: "This payment reference already exists in this business." },
    { status: 409 },
  );
}

  console.error("Hospital invoice payment failed:", error);

  return NextResponse.json(
    { error: "Unable to record hospital invoice payment." },
    { status: 500 },
  );
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ invoiceId: string }> },
) {
  try {
    const context = await getCurrentBusinessContext();

    await requireBusinessOperationAccess(
      context.user.id,
      context.business.id,
      "hospital.invoices.manage",
    );

    const { invoiceId } = await params;

    if (!invoiceId?.trim()) {
      return NextResponse.json(
        { error: "A valid invoice ID is required." },
        { status: 400 },
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "A valid JSON request body is required." },
        { status: 400 },
      );
    }

    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return NextResponse.json(
        { error: "A valid payment object is required." },
        { status: 400 },
      );
    }

    const input = body as Record<string, unknown>;

    if (
      typeof input.method !== "string" ||
      (typeof input.amount !== "string" &&
        typeof input.amount !== "number")
    ) {
      return NextResponse.json(
        { error: "Payment method and numeric amount are required." },
        { status: 400 },
      );
    }

    if (
      input.notes !== undefined &&
      input.notes !== null &&
      typeof input.notes !== "string"
    ) {
      return NextResponse.json(
        { error: "Notes must be a string or null." },
        { status: 400 },
      );
    }

    const result = await recordHospitalInvoicePayment({
      invoiceId: invoiceId.trim(),
      method: input.method,
      amount: input.amount,
      notes: input.notes as string | null | undefined,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
