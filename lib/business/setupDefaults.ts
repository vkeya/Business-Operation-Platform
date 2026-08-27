import type { BusinessType, Branch, Warehouse } from "@/types";

export interface SetupDefaults {
  branchName: string;
  branchCode: string;
  warehouseName: string;
  warehouseCode: string;
}

export function getSetupDefaults(
  businessName: string,
  businessType: BusinessType,
): SetupDefaults {
  const cleanName = businessName.trim();

  const branchName = cleanName
    ? `${cleanName} Main Branch`
    : "Main Branch";

  const warehouseName =
    businessType === "restaurant" ||
	businessType === "bar" ||
	businessType === "boutique"
      ? "Main Store"
      : "Main Warehouse";

  return {
    branchName,
    branchCode: "MAIN",
    warehouseName,
    warehouseCode: "MAIN",
  };
}

export function createInitialBranch(
  businessId: string,
  country: string,
  businessName: string,
  businessType: BusinessType,
): Branch {
  const defaults = getSetupDefaults(businessName, businessType);
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    businessId,
    name: defaults.branchName,
    code: defaults.branchCode,
    country,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };
}

export function createInitialWarehouse(
  businessId: string,
  branchId: string,
  businessName: string,
  businessType: BusinessType,
): Warehouse {
  const defaults = getSetupDefaults(businessName, businessType);
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    businessId,
    branchId,
    name: defaults.warehouseName,
    code: defaults.warehouseCode,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };
}