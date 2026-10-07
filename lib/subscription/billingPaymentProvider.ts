export type BillingPaymentProviderStatus =
  | "PENDING"
  | "PROCESSING"
  | "SUCCEEDED"
  | "FAILED"
  | "CANCELLED";

export interface BillingPaymentProviderRequest {
  businessId: string;
  invoiceId: string;
  paymentId: string;
  amount: number;
  currency: string;
  reference: string;
  description?: string;
  metadata?: Record<string, string>;
}

export interface BillingPaymentProviderResult {
  status: BillingPaymentProviderStatus;
  providerReference?: string;
  providerResponse?: Record<string, unknown>;
  message?: string;
}

export interface BillingPaymentProvider {
  readonly provider: string;

  initiate(
    request: BillingPaymentProviderRequest,
  ): Promise<BillingPaymentProviderResult>;
}