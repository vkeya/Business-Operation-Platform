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
  HospitalImagingError,
  verifyHospitalImagingReport,
  releaseHospitalImagingReport,
  amendHospitalImagingReport,
} from "@/lib/hospital/hospitalImagingService";
import type { BusinessType } from "@/types";

type RouteContext = {
  params: Promise<{ reportId: string }>;
};

function errorResponse(error: unknown) {
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
    error instanceof HospitalImagingError
  ) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode },
    );
  }

  console.error("Hospital imaging report lifecycle operation failed:", error);

  return NextResponse.json(
    { error: "Unable to complete the hospital imaging report operation." },
    { status: 500 },
  );
}

async function authorize(permission: string) {
  const context = await getCurrentBusinessContext();

  await requireBusinessOperationAccess(
    context.user.id,
    context.business.id,
    permission,
  );

  requireHospitalBusiness(context.business.type as BusinessType);
}

export async function PATCH(
  request: Request,
  { params }: RouteContext,
) {
  try {
    const { reportId } = await params;

    if (!reportId?.trim()) {
      return NextResponse.json(
        { error: "Imaging report ID is required." },
        { status: 400 },
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "A valid JSON imaging report action is required." },
        { status: 400 },
      );
    }

    if (
      typeof body !== "object" ||
      body === null ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        { error: "A valid imaging report action object is required." },
        { status: 400 },
      );
    }

    const input = body as Record<string, unknown>;

    if (typeof input.action !== "string") {
      return NextResponse.json(
        { error: "A report action is required." },
        { status: 400 },
      );
    }

    if (input.action === "verify") {
      const allowedFields = new Set(["action"]);

      if (Object.keys(input).some((field) => !allowedFields.has(field))) {
        return NextResponse.json(
          { error: "Unsupported field for report verification." },
          { status: 400 },
        );
      }

      await authorize("hospital.imaging_reports.verify");
      const report = await verifyHospitalImagingReport(reportId);

      return NextResponse.json({ report });
    }

    if (input.action === "release") {
      const allowedFields = new Set(["action"]);

      if (Object.keys(input).some((field) => !allowedFields.has(field))) {
        return NextResponse.json(
          { error: "Unsupported field for report release." },
          { status: 400 },
        );
      }

      await authorize("hospital.imaging_reports.release");
      const report = await releaseHospitalImagingReport(reportId);

      return NextResponse.json({ report });
    }

    if (input.action === "amend") {
      const allowedFields = new Set([
        "action",
        "findings",
        "impression",
        "recommendations",
        "amendmentReason",
      ]);

      if (Object.keys(input).some((field) => !allowedFields.has(field))) {
        return NextResponse.json(
          { error: "Unsupported field for report amendment." },
          { status: 400 },
        );
      }

      if (
        typeof input.findings !== "string" ||
        !input.findings.trim() ||
        typeof input.impression !== "string" ||
        !input.impression.trim() ||
        typeof input.amendmentReason !== "string" ||
        !input.amendmentReason.trim() ||
        (input.recommendations !== undefined &&
          input.recommendations !== null &&
          typeof input.recommendations !== "string")
      ) {
        return NextResponse.json(
          {
            error:
              "Valid findings, impression, and amendmentReason are required.",
          },
          { status: 400 },
        );
      }

      await authorize("hospital.imaging_reports.amend");

      const report = await amendHospitalImagingReport(reportId, {
        findings: input.findings,
        impression: input.impression,
        amendmentReason: input.amendmentReason,
        ...(typeof input.recommendations === "string" ||
        input.recommendations === null
          ? { recommendations: input.recommendations }
          : {}),
      });

      return NextResponse.json({ report });
    }

    return NextResponse.json(
      { error: "Action must be verify, release, or amend." },
      { status: 400 },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
