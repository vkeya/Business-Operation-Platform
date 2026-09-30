import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth/auth";
import { requireBusinessPermission } from "@/lib/business/businessPermissionService";
import { getCurrentBusinessContext } from "@/lib/business/currentBusiness";
import { listAdminUsers } from "@/lib/admin/adminUserService";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 },
      );
    }

    const context = await getCurrentBusinessContext();

    await requireBusinessPermission(
      session.user.id,
      context.business.id,
      "users.read",
    );

    const users = await listAdminUsers();

    return NextResponse.json({
      users,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      "statusCode" in error &&
      error.statusCode === 403
    ) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 },
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to retrieve users.",
      },
      { status: 500 },
    );
  }
}