import {
  checkoutPosSale,
  type PosCheckoutInput,
} from "./posCheckoutService";

import type {
  PosCheckoutRequest,
  PosCheckoutResult,
} from "./posTypes";

export function buildPosCheckoutInput(
  request: PosCheckoutRequest,
  businessId: string,
  createdBy: string,
): PosCheckoutInput {
  return {
	  operationId:
    request.operationId,

    businessId,

    branchId:
      request.branchId,

    warehouseId:
      request.warehouseId,

    customerId:
      request.customerId,

    currency:
      request.currency,

    exchangeRate:
      request.exchangeRate,

    createdBy,

    notes:
      request.notes,

    items:
      request.cart.items.map(
        ({
          lineId: _lineId,
          ...item
        }) => item,
      ),

    subtotal:
      request.cart.subtotal,

    discountAmount:
      request.cart.discountAmount,

    taxAmount:
      request.cart.taxAmount,

    totalAmount:
      request.cart.totalAmount,

    payment:
      request.payment,
  };
}

export async function executePosCheckout(
  request: PosCheckoutRequest,
  businessId: string,
  createdBy: string,
): Promise<PosCheckoutResult> {
  const input =
    buildPosCheckoutInput(
      request,
      businessId,
      createdBy,
    );

  const result =
    await checkoutPosSale(input);

  if (request.payment.method === "MPESA") {
    if (!result.paymentAttempt) {
      throw new Error(
        "M-Pesa checkout did not create a payment attempt.",
      );
    }

    return {
      status: "PENDING",

      sale: {
        saleId:
          result.sale.id,

        referenceNumber:
          result.sale.referenceNumber,

        subtotal:
          result.sale.subtotal,

        discountAmount:
          result.sale.discountAmount,

        taxAmount:
          result.sale.taxAmount,

        totalAmount:
          result.sale.totalAmount,

        currency:
          result.sale.currency,

        paymentMethod:
          request.payment.method,

        paymentAmount:
          request.payment.amount,

        paymentReference:
          result.paymentAttempt.providerReference ??
          "",
      },

      paymentAttempt: {
        attemptId:
          result.paymentAttempt.attemptId,

        providerReference:
          result.paymentAttempt.providerReference ??
          null,

        message:
          result.paymentAttempt.message,
      },
    };
  }

  if (!result.payment) {
    throw new Error(
      "POS checkout did not create a payment.",
    );
  }

  return {
    status: "COMPLETED",

    sale: {
      saleId:
        result.sale.id,

      referenceNumber:
        result.sale.referenceNumber,

      subtotal:
        result.sale.subtotal,

      discountAmount:
        result.sale.discountAmount,

      taxAmount:
        result.sale.taxAmount,

      totalAmount:
        result.sale.totalAmount,

      currency:
        result.sale.currency,

      paymentMethod:
        request.payment.method,

      paymentAmount:
        result.payment.amount,

      paymentReference:
        result.payment.reference,
    },
  };
}