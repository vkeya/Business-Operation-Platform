import { NextResponse } from "next/server";

import { getCurrentBusinessContext } from "@/lib/business/currentBusiness";
import { BusinessPermissionError } from "@/lib/business/businessPermissionService";
import { requireBusinessOperationAccess } from "@/lib/subscription/businessOperationAccessService";
import { SubscriptionEntitlementError } from "@/lib/subscription/subscriptionEntitlementService";
import { HospitalAccessError } from "@/lib/hospital/hospitalAccessService";
import {
  createHospitalBed,
  HospitalWardBedError,
  listHospitalBeds,
  type CreateHospitalBedInput,
} from "@/lib/hospital/hospitalWardBedService";
import { HospitalBedStatus } from "../../../../generated/prisma/client";

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

  console.error(`Hospital bed ${operation} failed:`, error);

  return NextResponse.json(
    { error: `Unable to ${operation} hospital beds.` },
    { status: 500 },
  );
}

export async function GET(request: Request) {
  try {
    const context = await getCurrentBusinessContext();
    const url = new URL(request.url);

    await requireBusinessOperationAccess(
      context.user.id,
      context.business.id,
      "hospital.beds.read",
    );

    const wardId = url.searchParams.get("wardId") ?? undefined;
    const statusParam = url.searchParams.get("status");
    const skip = Number(url.searchParams.get("skip") ?? 0);
    const take = Number(url.searchParams.get("take") ?? 25);

    if (
      !Number.isInteger(skip) ||
      skip < 0 ||
      !Number.isInteger(take) ||
      take < 1 ||
      take > 100
    ) {
      return NextResponse.json(
        { error: "Invalid pagination parameters." },
        { status: 400 },
      );
    }

    if (
      statusParam !== null &&
      !Object.values(HospitalBedStatus).includes(
        statusParam as HospitalBedStatus,
      )
    ) {
      return NextResponse.json(
        { error: "Invalid bed status." },
        { status: 400 },
      );
    }

    const beds = await listHospitalBeds({
      ...(wardId ? { wardId } : {}),
      ...(statusParam
        ? { status: statusParam as HospitalBedStatus }
        : {}),
      skip,
      take,
    });

    return NextResponse.json({ beds });
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
      "hospital.beds.manage",
    );

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "A valid JSON bed object is required." },
        { status: 400 },
      );
    }

    if (!isRecord(body)) {
      return NextResponse.json(
        { error: "A valid bed object is required." },
        { status: 400 },
      );
    }

    if (
      typeof body.wardId !== "string" ||
      !body.wardId.trim() ||
      typeof body.bedNumber !== "string" ||
      !body.bedNumber.trim()
    ) {
      return NextResponse.json(
        { error: "Ward ID and bed number are required." },
        { status: 400 },
      );
    }

    if (
      body.notes !== undefined &&
      body.notes !== null &&
      typeof body.notes !== "string"
    ) {
      return NextResponse.json(
        { error: "Notes must be a string or null." },
        { status: 400 },
      );
    }

    const input: CreateHospitalBedInput = {
      wardId: body.wardId,
      bedNumber: body.bedNumber,
      ...(body.notes !== undefined ? { notes: body.notes } : {}),
    };

    const bed = await createHospitalBed(input);

    return NextResponse.json({ bed }, { status: 201 });
  } catch (error) {
    return errorResponse(error, "create");
  }
}
