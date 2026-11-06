import {
  requireEntitlement,
  type EntitlementResolution,
} from "@/lib/subscription/subscriptionEntitlementService";

export async function requireAdvancedReporting(
  businessId: string,
): Promise<EntitlementResolution> {
  return requireEntitlement(
    businessId,
    "ADVANCED_REPORTING",
  );
}

export async function requireCashIntelligence(
  businessId: string,
): Promise<EntitlementResolution> {
  return requireEntitlement(
    businessId,
    "CASH_INTELLIGENCE",
  );
}

export async function requireBusinessPulse(
  businessId: string,
): Promise<EntitlementResolution> {
  return requireEntitlement(
    businessId,
    "BUSINESS_PULSE",
  );
}

export async function requireProfessionalIntelligence(
  businessId: string,
): Promise<EntitlementResolution> {
  const result = await requireEntitlement(
    businessId,
    "BUSINESS_PULSE",
  );

  return result;
}

export async function requireSalesIntelligence(
  businessId: string,
): Promise<EntitlementResolution> {
  return requireEntitlement(
    businessId,
    "SALES_INTELLIGENCE",
  );
}

export async function requireProfitabilityIntelligence(
  businessId: string,
): Promise<EntitlementResolution> {
  return requireEntitlement(
    businessId,
    "PROFITABILITY_INTELLIGENCE",
  );
}

export async function requireCustomerIntelligence(
  businessId: string,
): Promise<EntitlementResolution> {
  return requireEntitlement(
    businessId,
    "CUSTOMER_INTELLIGENCE",
  );
}

export async function requireSupplierIntelligence(
  businessId: string,
): Promise<EntitlementResolution> {
  return requireEntitlement(
    businessId,
    "SUPPLIER_INTELLIGENCE",
  );
}

export async function requireAnomalyDetection(
  businessId: string,
): Promise<EntitlementResolution> {
  return requireEntitlement(
    businessId,
    "ANOMALY_DETECTION",
  );
}

export async function requireForecasting(
  businessId: string,
): Promise<EntitlementResolution> {
  return requireEntitlement(
    businessId,
    "FORECASTING",
  );
}
