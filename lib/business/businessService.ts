import type { BusinessRepository } from "./businessRepository";
import { requireBusinessContext } from "./businessContext";
import type { BusinessSetup } from "@/types/setup";
import {
  boutiqueCategoryDefaults,
} from "./boutiqueDefaults";
import {
  winesSpiritsCategoryDefaults,
} from "./winesSpiritsDefaults";
import {
  accountService,
} from "@/lib/accounting/accountService";
import {
  assignBusinessOwnerRole,
} from "./businessRoleService";

export function createBusinessService(
  repository: BusinessRepository,
) {
  return {
    async createBusiness(
      setup: BusinessSetup,
      userId: string,
    ) {
      if (!setup.business.name.trim()) {
        throw new Error("Business name is required.");
      }

      if (!setup.business.country.trim()) {
        throw new Error("Business country is required.");
      }

      if (!setup.business.baseCurrency.trim()) {
        throw new Error("Business currency is required.");
      }

      if (!setup.branch.name.trim()) {
        throw new Error("Initial branch name is required.");
      }

      if (!setup.warehouse.name.trim()) {
        throw new Error("Initial warehouse name is required.");
      }

      const result =
  await repository.createBusiness(
    setup,
    userId,
  );

  await assignBusinessOwnerRole(
  userId,
  result.business.id,
);

	  await accountService.createDefaultAccounts(
  result.business.id,
);

      const defaultCategories =
  setup.business.type === "boutique"
    ? boutiqueCategoryDefaults
    : setup.business.type === "wines_spirits"
      ? winesSpiritsCategoryDefaults
      : [];

for (const category of defaultCategories) {
  await repository.createProductCategory({
    businessId: result.business.id,
    name: category.name,
    description: category.description,
  });
}


      return {
        ...result,
        context: await requireBusinessContext({
  businessId: result.business.id,
  userId,
  branchId: result.branch.id,
}),

      };
    },

    async listBusinesses(
  userId: string,
) {
  if (!userId) {
    throw new Error(
      "User context is required.",
    );
  }

  return repository.listBusinesses(
    userId,
  );
},

    async getBusiness(
      businessId: string,
      userId: string,
    ) {
      const context = await requireBusinessContext({
        businessId,
        userId,
      });

      return repository.getBusiness(
        context.businessId,
      );
    },

    async getBranches(
      businessId: string,
      userId: string,
    ) {
      const context = await requireBusinessContext({
        businessId,
        userId,
      });

      return repository.getBranches(
        context.businessId,
      );
    },

    async getWarehouses(
      businessId: string,
      userId: string,
    ) {
      const context = await requireBusinessContext({
        businessId,
        userId,
      });

      return repository.getWarehouses(
        context.businessId,
      );
    },
  };
}