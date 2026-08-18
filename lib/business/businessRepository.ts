import type { Branch, Business, Warehouse } from "@/types";
import type { BusinessSetup } from "@/types/setup";

export interface BusinessRepository {
  createBusiness(setup: BusinessSetup): Promise<{
    business: Business;
    branch: Branch;
    warehouse: Warehouse;
  }>;

  getBusiness(businessId: string): Promise<Business | null>;

  getBranches(businessId: string): Promise<Branch[]>;

  getWarehouses(businessId: string): Promise<Warehouse[]>;
}