"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { createBusinessService } from "@/lib/business/businessService";
import { postgresBusinessRepository } from "@/lib/business/postgresBusinessRepository";
import type { BusinessSetup } from "@/types/setup";

const businessService = createBusinessService(
  postgresBusinessRepository,
);

export async function createBusinessAction(
  setup: BusinessSetup,
) {
  const session = await getServerSession(
    authOptions,
  );

  const userId = session?.user?.id;

  if (!userId) {
    throw new Error(
      "You must be signed in to create a business.",
    );
  }

  return businessService.createBusiness(
    setup,
    userId,
  );
}