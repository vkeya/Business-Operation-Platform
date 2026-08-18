"use server";

import { createBusinessService } from "@/lib/business/businessService";
import { postgresBusinessRepository } from "@/lib/business/postgresBusinessRepository";
import { requireAuthContext } from "@/lib/auth/authContext";
import type { BusinessSetup } from "@/types/setup";

const businessService = createBusinessService(
  postgresBusinessRepository,
);

export async function createBusinessAction(
  setup: BusinessSetup,
  userId: string,
) {
  const authContext = requireAuthContext({
    user: {
      id: userId,
      email: "",
    },
  });

  return businessService.createBusiness(
    setup,
    authContext.user.id,
  );
}