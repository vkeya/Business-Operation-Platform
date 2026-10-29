import { NextResponse } from "next/server";

import { getCurrentBusinessContext } from "@/lib/business/currentBusiness";
import { BusinessPermissionError } from "@/lib/business/businessPermissionService";
import { prisma } from "@/lib/database/prisma";
import { HospitalAccessError, requireHospitalBusiness } from "@/lib/hospital/hospitalAccessService";
import type { BusinessType } from "@/types";
import { requireBusinessOperationAccess } from "@/lib/subscription/businessOperationAccessService";
import { SubscriptionEntitlementError } from "@/lib/subscription/subscriptionEntitlementService";

export async function GET() {
  try {
    const context = await getCurrentBusinessContext();

    await requireBusinessOperationAccess(
      context.user.id,
      context.business.id,
      "hospital.appointments.read",
    );

    requireHospitalBusiness(context.business.type as BusinessType);

    const memberships = await prisma.businessMembership.findMany({
      where: {
        businessId: context.business.id,
        isActive: true,
        user: {
          isActive: true,
        },
      },
      select: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    const clinicians = memberships.map(({ user }) => ({
      id: user.id,
      name: user.name,
      email: user.email,
    }));

    return NextResponse.json({ clinicians });
  } catch (error) {
    if (
      error instanceof BusinessPermissionError ||
      error instanceof SubscriptionEntitlementError ||
      error instanceof HospitalAccessError
    ) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }

    console.error("Hospital clinician lookup failed:", error);

    return NextResponse.json(
      { error: "Unable to load hospital clinicians." },
      { status: 500 },
    );
  }
}
