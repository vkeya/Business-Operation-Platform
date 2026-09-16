export class PaymentProviderError extends Error {
  readonly code: string;

  constructor(
    message: string,
    code = "PAYMENT_PROVIDER_ERROR",
  ) {
    super(message);
    this.name = "PaymentProviderError";
    this.code = code;
  }
}