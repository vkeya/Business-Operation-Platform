import type { BusinessType } from "@/types";
import {
  getBusinessCapabilities,
  type BusinessCapability,
} from "./businessCapabilities";

export interface BusinessDomain {
  type: BusinessType;
  capabilities: BusinessCapability[];
}

export function getBusinessDomain(
  businessType: BusinessType,
): BusinessDomain {
  return {
    type: businessType,
    capabilities:
      getBusinessCapabilities(
        businessType,
      ),
  };
}

export function hasBusinessCapability(
  businessType: BusinessType,
  capability: BusinessCapability,
): boolean {
  return getBusinessCapabilities(
    businessType,
  ).includes(capability);
}
