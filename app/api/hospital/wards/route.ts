import { NextResponse } from "next/server";

import { getCurrentBusinessContext } from "@/lib/business/currentBusiness";
import { BusinessPermissionError } from "@/lib/business/businessPermissionService";
import { requireBusinessOperationAccess } from "@/lib/subscription/businessOperationAccessService";
import { SubscriptionEntitlementError } from "@/lib/subscription/subscriptionEntitlementService";
import {
  HospitalAccessError,
} from "@/lib/hospital/hospitalAccessService";
import {
  createHospitalWard,
  HospitalWardBedError,
  listHospitalWards,
  type CreateHospitalWardInput,
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
    { error: `Unable to ${operation} hospital wards.` },
    { status: 500 },
  );
}

export async function GET(request: Request) {
  try {
    const context = await getCurrentBusinessContext();
    const url = new URL(request.url);

    const includeInactiveParam = url.searchParams.get("includeInactive");

    if (
      includeInactiveParam !== null &&
      includeInactiveParam !== "true" &&
      includeInactiveParam !== "false"
    ) {
      return NextResponse.json(
        { error: "includeInactive must be true or false." },
        { status: 400 },
      );
    }

    const includeInactive = includeInactiveParam === "true";

    await requireBusinessOperationAccess(
      context.user.id,
      context.business.id,
      includeInactive ? "hospital.wards.manage" : "hospital.wards.read",
    );

    const skipValue = Number(url.searchParams.get("skip") ?? 0);
    const takeValue = Number(url.searchParams.get("take") ?? 25);

    if (
      !Number.isInteger(skipValue) ||
      skipValue < 0 ||
      !Number.isInteger(takeValue) ||
      takeValue < 1 ||
      takeValue > 100
    ) {
      return NextResponse.json(
        { error: "Invalid pagination parameters." },
        { status: 400 },
      );
    }

    const wards = await listHospitalWards({
      skip: skipValue,
      take: takeValue,
      includeInactive,
    });

    return NextResponse.json({ wards });
  } catch (error) {
    return errorResponse(error, "load");
  }
}

export async function POST(request: Request) {
  try {
    const context = await getCurrentBusinessContext();

    await requireBusinessOperationAccess(
      context.user.id,
      context.business.id,
      "hospital.wards.manage",
    );

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

    if (
      typeof body.code !== "string" ||
      !body.code.trim() ||
      typeof body.name !== "string" ||
      !body.name.trim()
    ) {
      return NextResponse.json(
        { error: "Ward code and name are required." },
        { status: 400 },
      );
    }

    if (
      body.type !== undefined &&
      typeof body.type !== "string"
    ) {
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

    const ward = await createHospitalWard({
      code: body.code,
      name: body.name,
      ...(body.type !== undefined
        ? { type: body.type as CreateHospitalWardInput["type"] }
        : {}),
      ...(body.description !== undefined
        ? { description: body.description }
        : {}),
    });

    return NextResponse.json({ ward }, { status: 201 });
  } catch (error) {
    return errorResponse(error, "create");
  }
}
