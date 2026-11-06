
import { NextResponse } from "next/server";

import { getCurrentBusinessContext } from "@/lib/business/currentBusiness";
import {
  BusinessPermissionError,
  requireBusinessPermission,
} from "@/lib/business/businessPermissionService";
import {
  businessProfileService,
  BusinessProfileValidationError,
} from "@/lib/business/businessProfileService";

function errorResponse(error: unknown, fallback: string) {
  if (error instanceof BusinessPermissionError) {
    return NextResponse.json(
      { error: error.message },
      { status: 403 },
    );
  }

  if (error instanceof BusinessProfileValidationError) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 },
    );
  }

  if (
    error instanceof Error &&
    error.message === "Authentication is required."
  ) {
    return NextResponse.json(
      { error: "Authentication is required." },
      { status: 401 },
    );
  }

  if (
    error instanceof Error &&
    error.message === "Business not found."
  ) {
    return NextResponse.json(
      { error: error.message },
      { status: 404 },
    );
  }

  return NextResponse.json(
    { error: fallback },
    { status: 500 },
  );
}

export async function GET() {
  try {
    const context = await getCurrentBusinessContext();

    await requireBusinessPermission(
      context.user.id,
      context.business.id,
      "settings.read",
    );

    const profile = await businessProfileService.getProfile(
      context.business.id,
    );

    if (!profile) {
      return NextResponse.json(
        { error: "Business not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Business profile lookup failed:", error);

    return errorResponse(
      error,
      "Unable to load business profile.",
    );
  }
}

export async function PUT(request: Request) {
  try {
    const context = await getCurrentBusinessContext();

    await requireBusinessPermission(
      context.user.id,
      context.business.id,
      "settings.manage",
    );

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Request body must contain valid JSON." },
        { status: 400 },
      );
    }

    const profile = await businessProfileService.updateProfile(
      context.business.id,
      context.user.id,
      body,
    );

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Business profile update failed:", error);

    return errorResponse(
      error,
      "Unable to update business profile.",
    );
  }
}
