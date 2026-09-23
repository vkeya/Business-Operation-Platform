import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/auth";
import {
  cancelDataSubjectRequest,
  getUserDataSubjectRequest,
} from "@/lib/privacy/dataSubjectRequestService";

interface RouteContext {
  params: Promise<{
    requestId: string;
  }>;
}

export async function GET(
  _request: Request,
  context: RouteContext,
) {
  try {
    const user = await getAuthenticatedUser();
    const { requestId } = await context.params;

    const result =
      await getUserDataSubjectRequest(
        user.id,
        requestId,
      );

    if (!result) {
      return NextResponse.json(
        {
          error: "Data subject request not found.",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json(
      {
        request: result,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "Failed to retrieve data subject request:",
      error,
    );

    if (
      error instanceof Error &&
      error.message ===
        "Authentication is required."
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
          "Unable to retrieve the privacy request.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function DELETE(
  _request: Request,
  context: RouteContext,
) {
  try {
    const user = await getAuthenticatedUser();
    const { requestId } = await context.params;

    const result =
      await cancelDataSubjectRequest(
        user.id,
        requestId,
      );

    return NextResponse.json(
      {
        request: result,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "Failed to cancel data subject request:",
      error,
    );

    if (
      error instanceof Error &&
      error.message ===
        "Authentication is required."
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

    if (
      error instanceof Error &&
      error.message ===
        "Data subject request not found."
    ) {
      return NextResponse.json(
        {
          error: error.message,
        },
        {
          status: 404,
        },
      );
    }

    if (
      error instanceof Error &&
      error.message.includes(
        "Only pending requests can be cancelled.",
      )
    ) {
      return NextResponse.json(
        {
          error: error.message,
        },
        {
          status: 409,
        },
      );
    }

    return NextResponse.json(
      {
        error:
          "Unable to cancel the privacy request.",
      },
      {
        status: 500,
      },
    );
  }
}