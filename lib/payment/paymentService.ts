import {
  paymentRepository,
  type CreatePurchasePaymentInput,
  type CreateSalePaymentInput,
} from "./paymentRepository";

export const paymentService = {
  async createPurchasePayment(
    input: CreatePurchasePaymentInput,
  ) {
    if (!input.businessId) {
      throw new Error(
        "Business context is required.",
      );
    }

    if (!input.purchaseId) {
      throw new Error(
        "Purchase is required.",
      );
    }

    if (!input.reference.trim()) {
      throw new Error(
        "Payment reference is required.",
      );
    }

    if (!input.method.trim()) {
      throw new Error(
        "Payment method is required.",
      );
    }

    if (input.amount <= 0) {
      throw new Error(
        "Payment amount must be greater than zero.",
      );
    }

    if (!input.currency.trim()) {
      throw new Error(
        "Payment currency is required.",
      );
    }

    if (!input.createdBy) {
      throw new Error(
        "User context is required.",
      );
    }

    const purchase =
      await paymentRepository.findPurchaseWithPayments(
        input.businessId,
        input.purchaseId,
      );

    if (!purchase) {
      throw new Error(
        "Purchase not found.",
      );
    }

    const paidAmount =
      purchase.payments.reduce(
        (total, payment) =>
          total + payment.amount.toNumber(),
        0,
      );

    const outstandingAmount =
      purchase.totalAmount.toNumber() -
      paidAmount;

    if (input.amount > outstandingAmount) {
      throw new Error(
        "Payment amount exceeds the outstanding purchase balance.",
      );
    }

    const newPaidAmount =
      paidAmount + input.amount;

    const paymentStatus =
      newPaidAmount >=
      purchase.totalAmount.toNumber()
        ? "PAID"
        : "PARTIAL";

    const payment =
      await paymentRepository.createPurchasePayment(
        {
          ...input,
          reference:
            input.reference.trim(),
          method:
            input.method.trim(),
          currency:
            input.currency.trim(),
        },
      );

    await paymentRepository.updatePurchasePaymentStatus(
      input.businessId,
      input.purchaseId,
      paymentStatus,
    );

    return payment;
  },

  async listPurchasePayments(
    businessId: string,
    purchaseId: string,
  ) {
    if (!businessId) {
      throw new Error(
        "Business context is required.",
      );
    }

    if (!purchaseId) {
      throw new Error(
        "Purchase is required.",
      );
    }

    return paymentRepository.listPurchasePayments(
      businessId,
      purchaseId,
    );
  },

  async createSalePayment(
    input: CreateSalePaymentInput,
  ) {
    if (!input.businessId) {
      throw new Error(
        "Business context is required.",
      );
    }

    if (!input.saleId) {
      throw new Error(
        "Sale is required.",
      );
    }

    if (!input.reference.trim()) {
      throw new Error(
        "Payment reference is required.",
      );
    }

    if (!input.method.trim()) {
      throw new Error(
        "Payment method is required.",
      );
    }

    if (input.amount <= 0) {
      throw new Error(
        "Payment amount must be greater than zero.",
      );
    }

    if (!input.currency.trim()) {
      throw new Error(
        "Payment currency is required.",
      );
    }

    if (!input.createdBy) {
      throw new Error(
        "User context is required.",
      );
    }

    const sale =
      await paymentRepository.findSaleWithPayments(
        input.businessId,
        input.saleId,
      );

    if (!sale) {
      throw new Error(
        "Sale not found.",
      );
    }

    const paidAmount =
      sale.payments.reduce(
        (total, payment) =>
          total + payment.amount.toNumber(),
        0,
      );

    const outstandingAmount =
      sale.totalAmount.toNumber() -
      paidAmount;

    if (outstandingAmount <= 0) {
      throw new Error(
        "This sale has already been fully paid.",
      );
    }

    if (input.amount > outstandingAmount) {
      throw new Error(
        "Payment amount exceeds the outstanding sale balance.",
      );
    }

    const newPaidAmount =
      paidAmount + input.amount;

    const paymentStatus =
      newPaidAmount >=
      sale.totalAmount.toNumber()
        ? "PAID"
        : "PARTIAL";

    const payment =
      await paymentRepository.createSalePayment(
        {
          ...input,
          reference:
            input.reference.trim(),
          method:
            input.method.trim(),
          currency:
            input.currency.trim(),
        },
      );

    await paymentRepository.updateSalePaymentStatus(
      input.businessId,
      input.saleId,
      paymentStatus,
    );

    return payment;
  },

  async listSalePayments(
    businessId: string,
    saleId: string,
  ) {
    if (!businessId) {
      throw new Error(
        "Business context is required.",
      );
    }

    if (!saleId) {
      throw new Error(
        "Sale is required.",
      );
    }

    return paymentRepository.listSalePayments(
      businessId,
      saleId,
    );
  },
};