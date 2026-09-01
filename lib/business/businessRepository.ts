import type {
  Branch,
  Business,
  Warehouse,
} from "@/types";
import type { BusinessSetup } from "@/types/setup";

export interface BusinessRepository {
  createBusiness(
  setup: BusinessSetup,
  userId: string,
): Promise<{
    business: Business;
    branch: Branch;
    warehouse: Warehouse;
  }>;

  createProductCategory(input: {
  businessId: string;
  name: string;
  description?: string;
  parentId?: string;
}): Promise<{
  id: string;
  businessId: string;
  name: string;
  description: string | null;
  parentId: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}>;

  listBusinesses(
  userId: string,
): Promise<Business[]>;

  getBusiness(
    businessId: string,
  ): Promise<Business | null>;

  getBranches(
    businessId: string,
  ): Promise<Branch[]>;

  getWarehouses(
    businessId: string,
  ): Promise<Warehouse[]>;
}