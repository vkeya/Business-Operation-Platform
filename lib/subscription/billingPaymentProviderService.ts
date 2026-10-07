import type {
  BillingPaymentProvider,
  BillingPaymentProviderRequest,
  BillingPaymentProviderResult,
} from "./billingPaymentProvider";

export function createBillingPaymentProviderService(
  provider: BillingPaymentProvider,
) {
  return {
    async initiate(
      request: BillingPaymentProviderRequest,
    ): Promise<BillingPaymentProviderResult> {
      if (!request.businessId.trim()) {
        throw new Error("Business context is required.");
      }

      if (!request.invoiceId.trim()) {
        throw new Error("Billing invoice is required.");
      }

      if (!request.paymentId.trim()) {
        throw new Error("Billing payment is required.");
      }

      if (!Number.isFinite(request.amount) || request.amount <= 0) {
        throw new Error(
          "Billing payment amount must be greater than zero.",
        );
      }

      const currency = request.currency.trim().toUpperCase();

      if (!currency) {
        throw new Error("Billing payment currency is required.");
      }

      if (!request.reference.trim()) {
        throw new Error("Billing payment reference is required.");
      }

      return provider.initiate({
        ...request,
        currency,
      });
    },
  };
}