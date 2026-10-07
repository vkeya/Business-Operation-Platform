import type { BusinessType } from "@/types";
import type { SubscriptionPlan } from "@/generated/prisma/client";

export type EntitlementCategory =
  | "CORE"
  | "INTELLIGENCE"
  | "EXECUTIVE"
  | "VERTICAL_INTELLIGENCE"
  | "AUTOMATION";

export type EntitlementCode =
  | "DASHBOARD"
  | "POS"
  | "SALES"
  | "INVENTORY"
  | "PURCHASING"
  | "CUSTOMERS"
  | "SUPPLIERS"
  | "PAYMENTS"
  | "EXPENSES"
  | "ACCOUNTING"
  | "BASIC_REPORTS"
  | "ADVANCED_REPORTING"
  | "SALES_INTELLIGENCE"
  | "PROFITABILITY_INTELLIGENCE"
  | "CUSTOMER_INTELLIGENCE"
  | "SUPPLIER_INTELLIGENCE"
  | "CASH_INTELLIGENCE"
  | "BUSINESS_PULSE"
  | "ANOMALY_DETECTION"
  | "FORECASTING"
  | "EXECUTIVE_ANALYTICS"
  | "ADVANCED_AUTOMATION"
  | "ADVANCED_AUDIT"
  | "API_ACCESS"
  | "MULTI_BRANCH_INTELLIGENCE"
  | "CONSOLIDATED_REPORTING"
  | "SUPERMARKET_INTELLIGENCE"
  | "SUPERMARKET_STOCK_INTELLIGENCE"
  | "SUPERMARKET_DEMAND_INTELLIGENCE"
  | "SUPERMARKET_REPLENISHMENT"
  | "SUPERMARKET_FORECASTING"
  | "SUPERMARKET_BASKET_INTELLIGENCE"
  | "SUPERMARKET_PRICING_INTELLIGENCE"
  | "SUPERMARKET_AUTOPILOT"
  | "AUTOPILOT_ASSISTED"
  | "AUTOPILOT_ADVANCED"
  | "PHARMACY_INTELLIGENCE"
  | "PHARMACY_EXPIRY_INTELLIGENCE"
  | "PHARMACY_STOCK_INTELLIGENCE"
  | "PHARMACY_PRESCRIPTION_INTELLIGENCE"
  | "PHARMACY_CONTROLLED_INTELLIGENCE"
  | "RESTAURANT_INTELLIGENCE"
  | "RESTAURANT_FOOD_COST_INTELLIGENCE"
  | "RESTAURANT_MENU_PROFITABILITY"
  | "RESTAURANT_DEMAND_INTELLIGENCE"
  | "BAR_INTELLIGENCE"
  | "BAR_MARGIN_INTELLIGENCE"
  | "BAR_PRODUCT_MIX_INTELLIGENCE"
  | "BAR_DEMAND_INTELLIGENCE"
  | "WINES_SPIRITS_INTELLIGENCE"
  | "WINES_SPIRITS_MARGIN_INTELLIGENCE"
  | "WINES_SPIRITS_STOCK_INTELLIGENCE"
  | "WINES_SPIRITS_DEMAND_INTELLIGENCE"
  | "HOTEL_INTELLIGENCE"
  | "HOTEL_REVENUE_INTELLIGENCE"
  | "HOTEL_OCCUPANCY_INTELLIGENCE"
  | "HOTEL_PROFITABILITY_INTELLIGENCE"
  | "HEALTHCARE_INTELLIGENCE"
  | "HEALTHCARE_STOCK_INTELLIGENCE"
  | "HEALTHCARE_COST_INTELLIGENCE"
  | "HEALTHCARE_SERVICE_INTELLIGENCE"
  | "RETAIL_INTELLIGENCE"
  | "RETAIL_SALES_INTELLIGENCE"
  | "RETAIL_MARGIN_INTELLIGENCE"
  | "RETAIL_DEMAND_INTELLIGENCE"
  | "BOUTIQUE_INTELLIGENCE"
  | "BOUTIQUE_PRODUCT_INTELLIGENCE"
  | "BOUTIQUE_MARGIN_INTELLIGENCE"
  | "BOUTIQUE_DEMAND_INTELLIGENCE"
  | "AUTOPILOT_LITE"
  | "ADDITIONAL_BRANCH"
  | "ADDITIONAL_USER";

export interface EntitlementDefinition {
  code: EntitlementCode;
  name: string;
  description: string;
  category: EntitlementCategory;
  minimumPlan: SubscriptionPlan;
  requiredBusinessTypes?: readonly BusinessType[];
  includedInTrial: boolean;
  addOnCode?: string;
  parentEntitlement?: EntitlementCode;
}

const core = (
  code: EntitlementCode,
  name: string,
): EntitlementDefinition => ({
  code,
  name,
  description: `${name} is included in SmatPic core business operations.`,
  category: "CORE",
  minimumPlan: "STARTER",
  includedInTrial: true,
});

const intelligence = (
  code: EntitlementCode,
  name: string,
): EntitlementDefinition => ({
  code,
  name,
  description: `${name} is part of SmatPic Professional intelligence.`,
  category: "INTELLIGENCE",
  minimumPlan: "PROFESSIONAL",
  includedInTrial: true,
});

const business = (
  code: EntitlementCode,
  name: string,
): EntitlementDefinition => ({
  code,
  name,
  description: `${name} is part of SmatPic Business capabilities.`,
  category: "EXECUTIVE",
  minimumPlan: "BUSINESS",
  includedInTrial: false,
});

const vertical = (
  code: EntitlementCode,
  name: string,
  businessType: BusinessType,
  parentEntitlement?: EntitlementCode,
): EntitlementDefinition => ({
  code,
  name,
  description: `${name} is available to the compatible business type on Professional or Business.`,
  category: "VERTICAL_INTELLIGENCE",
  minimumPlan: "PROFESSIONAL",
  requiredBusinessTypes: [businessType],
  includedInTrial: true,
  parentEntitlement,
});

export const entitlementDefinitions: Record<
  EntitlementCode,
  EntitlementDefinition
> = {
  DASHBOARD: core("DASHBOARD", "Dashboard"),
  POS: core("POS", "Point of Sale"),
  SALES: core("SALES", "Sales"),
  INVENTORY: core("INVENTORY", "Inventory"),
  PURCHASING: core("PURCHASING", "Purchasing"),
  CUSTOMERS: core("CUSTOMERS", "Customers"),
  SUPPLIERS: core("SUPPLIERS", "Suppliers"),
  PAYMENTS: core("PAYMENTS", "Payments"),
  EXPENSES: core("EXPENSES", "Expenses"),
  ACCOUNTING: core("ACCOUNTING", "Accounting"),
  BASIC_REPORTS: {
    ...core("BASIC_REPORTS", "Basic Reports"),
    description: "Basic business reporting is included in Starter.",
  },

  ADVANCED_REPORTING: intelligence("ADVANCED_REPORTING", "Advanced Reporting"),
  SALES_INTELLIGENCE: intelligence("SALES_INTELLIGENCE", "Sales Intelligence"),
  PROFITABILITY_INTELLIGENCE: intelligence(
    "PROFITABILITY_INTELLIGENCE",
    "Profitability Intelligence",
  ),
  CUSTOMER_INTELLIGENCE: intelligence(
    "CUSTOMER_INTELLIGENCE",
    "Customer Intelligence",
  ),
  SUPPLIER_INTELLIGENCE: intelligence(
    "SUPPLIER_INTELLIGENCE",
    "Supplier Intelligence",
  ),
  CASH_INTELLIGENCE: intelligence("CASH_INTELLIGENCE", "Cash Intelligence"),
  BUSINESS_PULSE: intelligence("BUSINESS_PULSE", "Business Pulse"),
  ANOMALY_DETECTION: intelligence("ANOMALY_DETECTION", "Anomaly Detection"),
  FORECASTING: intelligence("FORECASTING", "Forecasting"),

  EXECUTIVE_ANALYTICS: business(
    "EXECUTIVE_ANALYTICS",
    "Executive Analytics",
  ),
  ADVANCED_AUTOMATION: business(
    "ADVANCED_AUTOMATION",
    "Advanced Automation",
  ),
  ADVANCED_AUDIT: business("ADVANCED_AUDIT", "Advanced Audit"),
  API_ACCESS: business("API_ACCESS", "API Access"),
  MULTI_BRANCH_INTELLIGENCE: business(
    "MULTI_BRANCH_INTELLIGENCE",
    "Multi-branch Intelligence",
  ),
  CONSOLIDATED_REPORTING: business(
    "CONSOLIDATED_REPORTING",
    "Consolidated Reporting",
  ),

  SUPERMARKET_INTELLIGENCE: vertical(
    "SUPERMARKET_INTELLIGENCE",
    "Supermarket Intelligence",
    "supermarket",
  ),
  SUPERMARKET_STOCK_INTELLIGENCE: vertical(
    "SUPERMARKET_STOCK_INTELLIGENCE",
    "Supermarket Stock Intelligence",
    "supermarket",
    "SUPERMARKET_INTELLIGENCE",
  ),
  SUPERMARKET_DEMAND_INTELLIGENCE: vertical(
    "SUPERMARKET_DEMAND_INTELLIGENCE",
    "Supermarket Demand Intelligence",
    "supermarket",
    "SUPERMARKET_INTELLIGENCE",
  ),
  SUPERMARKET_REPLENISHMENT: vertical(
    "SUPERMARKET_REPLENISHMENT",
    "Supermarket Replenishment",
    "supermarket",
    "SUPERMARKET_INTELLIGENCE",
  ),
  SUPERMARKET_FORECASTING: vertical(
    "SUPERMARKET_FORECASTING",
    "Supermarket Forecasting",
    "supermarket",
    "SUPERMARKET_INTELLIGENCE",
  ),
  SUPERMARKET_BASKET_INTELLIGENCE: vertical(
    "SUPERMARKET_BASKET_INTELLIGENCE",
    "Supermarket Basket Intelligence",
    "supermarket",
    "SUPERMARKET_INTELLIGENCE",
  ),
  SUPERMARKET_PRICING_INTELLIGENCE: vertical(
    "SUPERMARKET_PRICING_INTELLIGENCE",
    "Supermarket Pricing Intelligence",
    "supermarket",
    "SUPERMARKET_INTELLIGENCE",
  ),
  SUPERMARKET_AUTOPILOT: {
    code: "SUPERMARKET_AUTOPILOT",
    name: "Supermarket Autopilot",
    description: "Supermarket Autopilot recommendations and execution.",
    category: "AUTOMATION",
    minimumPlan: "BUSINESS",
    requiredBusinessTypes: ["supermarket"],
    includedInTrial: false,
  },
  AUTOPILOT_ASSISTED: {
    code: "AUTOPILOT_ASSISTED",
    name: "Assisted Autopilot",
    description: "Assisted execution of eligible Autopilot actions.",
    category: "AUTOMATION",
    minimumPlan: "BUSINESS",
    includedInTrial: false,
  },
  AUTOPILOT_ADVANCED: {
    code: "AUTOPILOT_ADVANCED",
    name: "Advanced Autopilot",
    description: "Advanced autonomous Autopilot capabilities.",
    category: "AUTOMATION",
    minimumPlan: "BUSINESS",
    includedInTrial: false,
  },

  PHARMACY_INTELLIGENCE: vertical(
    "PHARMACY_INTELLIGENCE",
    "Pharmacy Intelligence",
    "pharmacy",
  ),
  PHARMACY_EXPIRY_INTELLIGENCE: vertical(
    "PHARMACY_EXPIRY_INTELLIGENCE",
    "Pharmacy Expiry Intelligence",
    "pharmacy",
    "PHARMACY_INTELLIGENCE",
  ),
  PHARMACY_STOCK_INTELLIGENCE: vertical(
    "PHARMACY_STOCK_INTELLIGENCE",
    "Pharmacy Stock Intelligence",
    "pharmacy",
    "PHARMACY_INTELLIGENCE",
  ),
  PHARMACY_PRESCRIPTION_INTELLIGENCE: vertical(
    "PHARMACY_PRESCRIPTION_INTELLIGENCE",
    "Pharmacy Prescription Intelligence",
    "pharmacy",
    "PHARMACY_INTELLIGENCE",
  ),
  PHARMACY_CONTROLLED_INTELLIGENCE: vertical(
    "PHARMACY_CONTROLLED_INTELLIGENCE",
    "Pharmacy Controlled Medicine Intelligence",
    "pharmacy",
    "PHARMACY_INTELLIGENCE",
  ),

  RESTAURANT_INTELLIGENCE: vertical("RESTAURANT_INTELLIGENCE", "Restaurant Intelligence", "restaurant"),
  RESTAURANT_FOOD_COST_INTELLIGENCE: vertical("RESTAURANT_FOOD_COST_INTELLIGENCE", "Restaurant Food Cost Intelligence", "restaurant", "RESTAURANT_INTELLIGENCE"),
  RESTAURANT_MENU_PROFITABILITY: vertical("RESTAURANT_MENU_PROFITABILITY", "Restaurant Menu Profitability", "restaurant", "RESTAURANT_INTELLIGENCE"),
  RESTAURANT_DEMAND_INTELLIGENCE: vertical("RESTAURANT_DEMAND_INTELLIGENCE", "Restaurant Demand Intelligence", "restaurant", "RESTAURANT_INTELLIGENCE"),

  BAR_INTELLIGENCE: vertical("BAR_INTELLIGENCE", "Bar Intelligence", "bar"),
  BAR_MARGIN_INTELLIGENCE: vertical("BAR_MARGIN_INTELLIGENCE", "Bar Margin Intelligence", "bar", "BAR_INTELLIGENCE"),
  BAR_PRODUCT_MIX_INTELLIGENCE: vertical("BAR_PRODUCT_MIX_INTELLIGENCE", "Bar Product Mix Intelligence", "bar", "BAR_INTELLIGENCE"),
  BAR_DEMAND_INTELLIGENCE: vertical("BAR_DEMAND_INTELLIGENCE", "Bar Demand Intelligence", "bar", "BAR_INTELLIGENCE"),

  WINES_SPIRITS_INTELLIGENCE: vertical("WINES_SPIRITS_INTELLIGENCE", "Wines & Spirits Intelligence", "wines_spirits"),
  WINES_SPIRITS_MARGIN_INTELLIGENCE: vertical("WINES_SPIRITS_MARGIN_INTELLIGENCE", "Wines & Spirits Margin Intelligence", "wines_spirits", "WINES_SPIRITS_INTELLIGENCE"),
  WINES_SPIRITS_STOCK_INTELLIGENCE: vertical("WINES_SPIRITS_STOCK_INTELLIGENCE", "Wines & Spirits Stock Intelligence", "wines_spirits", "WINES_SPIRITS_INTELLIGENCE"),
  WINES_SPIRITS_DEMAND_INTELLIGENCE: vertical("WINES_SPIRITS_DEMAND_INTELLIGENCE", "Wines & Spirits Demand Intelligence", "wines_spirits", "WINES_SPIRITS_INTELLIGENCE"),

  HOTEL_INTELLIGENCE: vertical("HOTEL_INTELLIGENCE", "Hotel Intelligence", "hotel"),
  HOTEL_REVENUE_INTELLIGENCE: vertical("HOTEL_REVENUE_INTELLIGENCE", "Hotel Revenue Intelligence", "hotel", "HOTEL_INTELLIGENCE"),
  HOTEL_OCCUPANCY_INTELLIGENCE: vertical("HOTEL_OCCUPANCY_INTELLIGENCE", "Hotel Occupancy Intelligence", "hotel", "HOTEL_INTELLIGENCE"),
  HOTEL_PROFITABILITY_INTELLIGENCE: vertical("HOTEL_PROFITABILITY_INTELLIGENCE", "Hotel Profitability Intelligence", "hotel", "HOTEL_INTELLIGENCE"),

  HEALTHCARE_INTELLIGENCE: vertical("HEALTHCARE_INTELLIGENCE", "Healthcare Intelligence", "hospital"),
  HEALTHCARE_STOCK_INTELLIGENCE: vertical("HEALTHCARE_STOCK_INTELLIGENCE", "Healthcare Stock Intelligence", "hospital", "HEALTHCARE_INTELLIGENCE"),
  HEALTHCARE_COST_INTELLIGENCE: vertical("HEALTHCARE_COST_INTELLIGENCE", "Healthcare Cost Intelligence", "hospital", "HEALTHCARE_INTELLIGENCE"),
  HEALTHCARE_SERVICE_INTELLIGENCE: vertical("HEALTHCARE_SERVICE_INTELLIGENCE", "Healthcare Service Intelligence", "hospital", "HEALTHCARE_INTELLIGENCE"),

  RETAIL_INTELLIGENCE: vertical("RETAIL_INTELLIGENCE", "Retail Intelligence", "shop"),
  RETAIL_SALES_INTELLIGENCE: vertical("RETAIL_SALES_INTELLIGENCE", "Retail Sales Intelligence", "shop", "RETAIL_INTELLIGENCE"),
  RETAIL_MARGIN_INTELLIGENCE: vertical("RETAIL_MARGIN_INTELLIGENCE", "Retail Margin Intelligence", "shop", "RETAIL_INTELLIGENCE"),
  RETAIL_DEMAND_INTELLIGENCE: vertical("RETAIL_DEMAND_INTELLIGENCE", "Retail Demand Intelligence", "shop", "RETAIL_INTELLIGENCE"),

  BOUTIQUE_INTELLIGENCE: vertical("BOUTIQUE_INTELLIGENCE", "Boutique Intelligence", "boutique"),
  BOUTIQUE_PRODUCT_INTELLIGENCE: vertical("BOUTIQUE_PRODUCT_INTELLIGENCE", "Boutique Product Intelligence", "boutique", "BOUTIQUE_INTELLIGENCE"),
  BOUTIQUE_MARGIN_INTELLIGENCE: vertical("BOUTIQUE_MARGIN_INTELLIGENCE", "Boutique Margin Intelligence", "boutique", "BOUTIQUE_INTELLIGENCE"),
  BOUTIQUE_DEMAND_INTELLIGENCE: vertical("BOUTIQUE_DEMAND_INTELLIGENCE", "Boutique Demand Intelligence", "boutique", "BOUTIQUE_INTELLIGENCE"),

  AUTOPILOT_LITE: {
    code: "AUTOPILOT_LITE",
    name: "Autopilot Lite",
    description: "Professional-tier Autopilot recommendations as a commercial add-on.",
    category: "AUTOMATION",
    minimumPlan: "PROFESSIONAL",
    includedInTrial: false,
    addOnCode: "AUTOPILOT_LITE",
  },
  ADDITIONAL_BRANCH: {
    code: "ADDITIONAL_BRANCH",
    name: "Additional Branch",
    description: "Additional branch capacity beyond the plan allowance.",
    category: "EXECUTIVE",
    minimumPlan: "PROFESSIONAL",
    includedInTrial: false,
    addOnCode: "ADDITIONAL_BRANCH",
  },
  ADDITIONAL_USER: {
    code: "ADDITIONAL_USER",
    name: "Additional User",
    description: "Additional user capacity beyond the plan allowance.",
    category: "EXECUTIVE",
    minimumPlan: "PROFESSIONAL",
    includedInTrial: false,
    addOnCode: "ADDITIONAL_USER",
  },
};

export function getEntitlementDefinition(
  code: EntitlementCode,
): EntitlementDefinition {
  return entitlementDefinitions[code];
}
