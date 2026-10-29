import { NextResponse } from "next/server";

import { getCurrentBusinessContext } from "@/lib/business/currentBusiness";
import { BusinessPermissionError } from "@/lib/business/businessPermissionService";
import { requireBusinessOperationAccess } from "@/lib/subscription/businessOperationAccessService";
import { SubscriptionEntitlementError } from "@/lib/subscription/subscriptionEntitlementService";
import { HospitalAccessError } from "@/lib/hospital/hospitalAccessService";
import {
  getHospitalWard,
  HospitalWardBedError,
  updateHospitalWard,
  type UpdateHospitalWardInput,
} from "@/lib/hospital/hospitalWardBedService";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function errorResponse(error: unknown, operation: string) {
  if (
    error instanceof BusinessPermissionError ||
    error instanceof SubscriptionEntitlementError ||
    error instanceof HospitalAccessError ||
    error instanceof HospitalWardBedError
  ) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode },
    );
  }

  console.error(`Hospital ward ${operation} failed:`, error);

  return NextResponse.json(
    { error: `Unable to ${operation} hospital ward.` },
    { status: 500 },
  );
}

type RouteContext = {
  params: Promise<{ wardId: string }>;
};

export async function GET(_request: Request, routeContext: RouteContext) {
  try {
    const context = await getCurrentBusinessContext();

    await requireBusinessOperationAccess(
      context.user.id,
      context.business.id,
      "hospital.wards.read",
    );

    const { wardId } = await routeContext.params;
    const ward = await getHospitalWard(wardId);

    return NextResponse.json({ ward });
  } catch (error) {
    return errorResponse(error, "load");
  }
}

export async function PATCH(request: Request, routeContext: RouteContext) {
  try {
    const context = await getCurrentBusinessContext();

    await requireBusinessOperationAccess(
      context.user.id,
      context.business.id,
      "hospital.wards.manage",
    );

    const { wardId } = await routeContext.params;

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "A valid JSON ward object is required." },
        { status: 400 },
      );
    }

    if (!isRecord(body)) {
      return NextResponse.json(
        { error: "A valid ward object is required." },
        { status: 400 },
      );
    }

    const allowedFields = new Set([
      "code",
      "name",
      "type",
      "description",
      "isActive",
    ]);

    const unsupportedFields = Object.keys(body).filter(
      (key) => !allowedFields.has(key),
    );

    if (unsupportedFields.length > 0) {
      return NextResponse.json(
        { error: `Unsupported ward fields: ${unsupportedFields.join(", ")}.` },
        { status: 400 },
      );
    }

    if (Object.keys(body).length === 0) {
      return NextResponse.json(
        { error: "At least one ward field must be provided." },
        { status: 400 },
      );
    }

    if (
      body.code !== undefined &&
      (typeof body.code !== "string" || !body.code.trim())
    ) {
      return NextResponse.json(
        { error: "Ward code must be a non-empty string." },
        { status: 400 },
      );
    }

    if (
      body.name !== undefined &&
      (typeof body.name !== "string" || !body.name.trim())
    ) {
      return NextResponse.json(
        { error: "Ward name must be a non-empty string." },
        { status: 400 },
      );
    }

    if (body.type !== undefined && typeof body.type !== "string") {
      return NextResponse.json(
        { error: "Ward type must be a string." },
        { status: 400 },
      );
    }

    if (
      body.description !== undefined &&
      body.description !== null &&
      typeof body.description !== "string"
    ) {
      return NextResponse.json(
        { error: "Description must be a string or null." },
        { status: 400 },
      );
    }

    if (
      body.isActive !== undefined &&
      typeof body.isActive !== "boolean"
    ) {
      return NextResponse.json(
        { error: "isActive must be a boolean." },
        { status: 400 },
      );
    }

    const input: UpdateHospitalWardInput = {
      ...(body.code !== undefined ? { code: body.code } : {}),
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.type !== undefined
        ? { type: body.type as UpdateHospitalWardInput["type"] }
        : {}),
      ...(body.description !== undefined
        ? { description: body.description }
        : {}),
      ...(body.isActive !== undefined
        ? { isActive: body.isActive }
        : {}),
    };

    const ward = await updateHospitalWard(wardId, input);

    return NextResponse.json({ ward });
  } catch (error) {
    return errorResponse(error, "update");
  }
}
