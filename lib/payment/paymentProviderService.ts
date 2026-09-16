import type {
  ExternalPaymentProvider,
  ExternalPaymentRequest,
  ExternalPaymentResult,
} from "./paymentProvider";

export function createPaymentProviderService(
  provider: ExternalPaymentProvider,
) {
  return {
    async initiate(
      request: ExternalPaymentRequest,
    ): Promise<ExternalPaymentResult> {
      if (!request.businessId.trim()) {
        throw new Error("Business context is required.");
      }

      if (!Number.isFinite(request.amount) || request.amount <= 0) {
        throw new Error(
          "Payment amount must be greater than zero.",
        );
      }

      const currency =
        request.currency.trim().toUpperCase();

      if (!currency) {
        throw new Error(
          "Payment currency is required.",
        );
      }

      if (!request.createdBy.trim()) {
        throw new Error("User context is required.");
      }

      return provider.initiate({
        ...request,
        currency,
      });
    },
  };
}