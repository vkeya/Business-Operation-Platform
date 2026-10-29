import { NextResponse } from "next/server";

import { getCurrentBusinessContext } from "@/lib/business/currentBusiness";
import { BusinessPermissionError } from "@/lib/business/businessPermissionService";
import { requireBusinessOperationAccess } from "@/lib/subscription/businessOperationAccessService";
import { SubscriptionEntitlementError } from "@/lib/subscription/subscriptionEntitlementService";
import { HospitalAccessError } from "@/lib/hospital/hospitalAccessService";
import {
  getHospitalInvoice,
  issueHospitalInvoice,
  voidHospitalInvoice,
  HospitalInvoiceError,
} from "@/lib/hospital/hospitalInvoiceService";

function errorResponse(error: unknown) {
  if (
    error instanceof BusinessPermissionError ||
    error instanceof SubscriptionEntitlementError ||
    error instanceof HospitalAccessError ||
    error instanceof HospitalInvoiceError
  ) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode },
    );
  }

  console.error("Hospital invoice detail load failed:", error);
  return NextResponse.json(
    { error: "Unable to load hospital invoice." },
    { status: 500 },
  );
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ invoiceId: string }> },
) {
  try {
    const context = await getCurrentBusinessContext();

    await requireBusinessOperationAccess(
      context.user.id,
      context.business.id,
      "hospital.invoices.read",
    );

    const { invoiceId } = await params;
    if (!invoiceId?.trim()) {
      return NextResponse.json(
        { error: "A valid invoice ID is required." },
        { status: 400 },
      );
    }

    const invoice = await getHospitalInvoice(invoiceId.trim());
    return NextResponse.json({ invoice });
  } catch (error) {
    return errorResponse(error);
  }
}


export async function PATCH(
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

    if (
      typeof body !== "object" ||
      body === null ||
      !("action" in body) ||
      (body.action !== "issue" && body.action !== "void")
    ) {
      return NextResponse.json(
        { error: 'Action must be either "issue" or "void".' },
        { status: 400 },
      );
    }

    const invoice =
      body.action === "issue"
        ? await issueHospitalInvoice(invoiceId.trim())
        : await voidHospitalInvoice(invoiceId.trim());

    return NextResponse.json({ invoice });
  } catch (error) {
    return errorResponse(error);
  }
}

