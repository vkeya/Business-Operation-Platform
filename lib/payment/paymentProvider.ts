export type ExternalPaymentMethod =
  | "MPESA"
  | "CARD";

export type ExternalPaymentStatus =
  | "PENDING"
  | "PAID"
  | "FAILED";

export interface ExternalPaymentRequest {
  businessId: string;
  amount: number;
  currency: string;
  reference?: string;
  description?: string;
  createdBy: string;
}

export interface ExternalPaymentResult {
  status: ExternalPaymentStatus;
  providerReference?: string;
  message?: string;
}

export interface ExternalPaymentProvider {
  readonly method: ExternalPaymentMethod;

  initiate(
    request: ExternalPaymentRequest,
  ): Promise<ExternalPaymentResult>;
}