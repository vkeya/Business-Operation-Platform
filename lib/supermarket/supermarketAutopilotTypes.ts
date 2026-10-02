// lib/supermarket/supermarketAutopilotTypes.ts

export type SupermarketAutopilotActionType =
  | "REPLENISH"
  | "PRICE_REVIEW"
  | "PROMOTION"
  | "DEMAND_ALERT"
  | "FORECAST_ALERT"
  | "BASKET_OPPORTUNITY";

export type SupermarketAutopilotPriority =
  | "CRITICAL"
  | "HIGH"
  | "MEDIUM";

export type SupermarketAutopilotSource =
  | "STOCK"
  | "REPLENISHMENT"
  | "DEMAND"
  | "FORECAST"
  | "PRICING"
  | "BASKET";

export interface SupermarketAutopilotAction {
  id: string;

  type: SupermarketAutopilotActionType;
  priority: SupermarketAutopilotPriority;

  productId: string;
  productName: string;

  title: string;
  explanation: string;
  recommendedAction: string;

  source: SupermarketAutopilotSource;

  /**
   * Confidence that the intelligence finding
   * is sufficiently strong to surface as an action.
   *
   * Range: 0–1.
   */
  confidence: number;

  metadata: Record<string, unknown>;
}

export interface SupermarketAutopilotSummary {
  totalActions: number;

  critical: number;
  high: number;
  medium: number;
}

export interface SupermarketAutopilotResult {
  businessId: string;

  generatedAt: string;

  summary: SupermarketAutopilotSummary;

  actions: SupermarketAutopilotAction[];
}