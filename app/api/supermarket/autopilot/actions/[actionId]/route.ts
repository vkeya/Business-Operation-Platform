import { NextRequest, NextResponse } from "next/server";

import { getCurrentBusinessContext } from "@/lib/business/currentBusiness";
import { requireSupermarketBusiness } from "@/lib/supermarket/supermarketAccessService";
import { supermarketAutopilotService } from "@/lib/supermarket/supermarketAutopilotService";
import type { BusinessType } from "@/types";

const VALID_STATUSES = [
  "ACCEPTED",
  "DISMISSED",
  "SNOOZED",
  "COMPLETED",
] as const;

type ActionStatus =
  (typeof VALID_STATUSES)[number];

export async function PATCH(
  request: NextRequest,
  context: {
    params: Promise<{
      actionId: string;
    }>;
  },
) {
  try {
    const businessContext =
      await getCurrentBusinessContext();

    requireSupermarketBusiness(
      businessContext.business.type as BusinessType,
    );

    const { actionId } =
      await context.params;

    const body = await request.json();

    const status =
      typeof body.status === "string"
        ? body.status
        : "";

    if (
      !VALID_STATUSES.includes(
        status as ActionStatus,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid Autopilot action status.",
        },
        {
          status: 400,
        },
      );
    }

    let snoozedUntil: Date | null =
      null;

    if (status === "SNOOZED") {
      if (
        typeof body.snoozedUntil !==
        "string"
      ) {
        return NextResponse.json(
          {
            error:
              "snoozedUntil is required when snoozing an action.",
          },
          {
            status: 400,
          },
        );
      }

      snoozedUntil =
        new Date(body.snoozedUntil);

      if (
        Number.isNaN(
          snoozedUntil.getTime(),
        )
      ) {
        return NextResponse.json(
          {
            error:
              "Invalid snoozedUntil date.",
          },
          {
            status: 400,
          },
        );
      }
    }

    const result =
      await supermarketAutopilotService.updateAction(
        businessContext.business.id,
        actionId,
        status as ActionStatus,
        {
          snoozedUntil,
          actorId:
            businessContext.user?.id ??
            null,
        },
      );

    return NextResponse.json({
      action: result,
    });
  } catch (error) {
    console.error(
      "Failed to update supermarket Autopilot action:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update Autopilot action.",
      },
      {
        status: 500,
      },
    );
  }
}