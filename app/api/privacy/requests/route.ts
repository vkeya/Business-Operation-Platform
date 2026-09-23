import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/auth";
import {
  createDataSubjectRequest,
  getUserDataSubjectRequests,
} from "@/lib/privacy/dataSubjectRequestService";
import { DataSubjectRequestType } from "@/generated/prisma/client";

const ALLOWED_TYPES = new Set(
  Object.values(DataSubjectRequestType),
);

export async function GET() {
  try {
    const user = await getAuthenticatedUser();

    const requests =
      await getUserDataSubjectRequests(user.id);

    return NextResponse.json(
      {
        requests,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "Failed to retrieve data subject requests:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to retrieve your privacy requests.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();

    const body = await request.json();
    const type =
      typeof body?.type === "string"
        ? body.type.trim().toUpperCase()
        : "";

    if (
      !ALLOWED_TYPES.has(
        type as DataSubjectRequestType,
      )
    ) {
      return NextResponse.json(
        {
          error: "Invalid data subject request type.",
        },
        {
          status: 400,
        },
      );
    }

    const result =
      await createDataSubjectRequest(
        user.id,
        type as DataSubjectRequestType,
      );

    return NextResponse.json(
      {
        request: result,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "Failed to create data subject request:",
      error,
    );

    const message =
      error instanceof Error
        ? error.message
        : "";

    if (
      message.includes(
        "already have an active request",
      )
    ) {
      return NextResponse.json(
        {
          error: message,
        },
        {
          status: 409,
        },
      );
    }

    if (
      message === "Authentication is required."
    ) {
      return NextResponse.json(
        {
          error: "Authentication required.",
        },
        {
          status: 401,
        },
      );
    }

    return NextResponse.json(
      {
        error:
          "Unable to create your privacy request.",
      },
      {
        status: 500,
      },
    );
  }
}