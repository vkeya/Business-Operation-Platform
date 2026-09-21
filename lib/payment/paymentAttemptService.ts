import {
  paymentAttemptRepository,
  type CreatePaymentAttemptInput,
} from "./paymentAttemptRepository";

export const paymentAttemptService = {
  async create(
    input: CreatePaymentAttemptInput,
  ) {
    if (!input.businessId.trim()) {
      throw new Error(
        "Business context is required.",
      );
    }

    if (!input.saleId.trim()) {
      throw new Error(
        "Sale is required.",
      );
    }

    if (!input.provider.trim()) {
      throw new Error(
        "Payment provider is required.",
      );
    }

    if (!input.method.trim()) {
      throw new Error(
        "Payment method is required.",
      );
    }

    if (
      !Number.isFinite(input.amount) ||
      input.amount <= 0
    ) {
      throw new Error(
        "Payment amount must be greater than zero.",
      );
    }

    const currency =
      input.currency.trim().toUpperCase();

    if (!currency) {
      throw new Error(
        "Payment currency is required.",
      );
    }

    if (!input.createdBy.trim()) {
      throw new Error(
        "User context is required.",
      );
    }

    return paymentAttemptRepository.create({
      ...input,
      provider: input.provider.trim(),
      method: input.method.trim(),
      currency,
    });
  },

    async findById(
    businessId: string,
    id: string,
  ) {
    if (!businessId.trim()) {
      throw new Error(
        "Business context is required.",
      );
    }

    if (!id.trim()) {
      throw new Error(
        "Payment attempt is required.",
      );
    }

    return paymentAttemptRepository.findById(
      businessId,
      id,
    );
  },

    async findBySaleId(
    businessId: string,
    saleId: string,
  ) {
    if (!businessId.trim()) {
      throw new Error(
        "Business context is required.",
      );
    }

    if (!saleId.trim()) {
      throw new Error(
        "Sale is required.",
      );
    }

    return paymentAttemptRepository.findBySaleId(
      businessId,
      saleId,
    );
  },

  async findByProviderReference(
    provider: string,
    providerReference: string,
  ) {
    if (!provider.trim()) {
      throw new Error(
        "Payment provider is required.",
      );
    }

    if (!providerReference.trim()) {
      throw new Error(
        "Provider reference is required.",
      );
    }

    return paymentAttemptRepository.findByProviderReference(
      provider.trim(),
      providerReference.trim(),
    );
  },

    async updateStatus(
    businessId: string,
    id: string,
    status:
      | "PENDING"
      | "PAID"
      | "FAILED",
  ) {
    if (!businessId.trim()) {
      throw new Error(
        "Business context is required.",
      );
    }

    if (!id.trim()) {
      throw new Error(
        "Payment attempt is required.",
      );
    }

    return paymentAttemptRepository.updateStatus(
      businessId,
      id,
      status,
    );
  },

  async complete(
  businessId: string,
  id: string,
) {
  const attempt =
    await paymentAttemptRepository.findById(
      businessId,
      id,
    );

  if (!attempt) {
    throw new Error(
      "Payment attempt not found.",
    );
  }

  if (attempt.status === "PAID") {
    return attempt;
  }

  if (attempt.status === "FAILED") {
    throw new Error(
      "A failed payment attempt cannot be completed.",
    );
  }

  await paymentAttemptRepository.updateStatus(
    businessId,
    id,
    "PAID",
  );

  return paymentAttemptRepository.findById(
    businessId,
    id,
  );
},

async fail(
  businessId: string,
  id: string,
) {
  const attempt =
    await paymentAttemptRepository.findById(
      businessId,
      id,
    );

  if (!attempt) {
    throw new Error(
      "Payment attempt not found.",
    );
  }

  if (attempt.status === "FAILED") {
    return attempt;
  }

  if (attempt.status === "PAID") {
    throw new Error(
      "A completed payment attempt cannot be failed.",
    );
  }

  await paymentAttemptRepository.updateStatus(
    businessId,
    id,
    "FAILED",
  );

  return paymentAttemptRepository.findById(
    businessId,
    id,
  );
},

};