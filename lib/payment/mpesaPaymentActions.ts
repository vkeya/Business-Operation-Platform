"use server";

import {
  getAuthenticatedUserId,
} from "@/lib/auth/auth";

import {
  getCurrentBusiness,
} from "@/lib/business/currentBusiness";

import {
  mpesaPaymentService,
} from "@/lib/payment/providers/mpesa/mpesaPaymentService";

export async function initiateMpesaPaymentAction(
  input: {
    saleId: string;
    amount: number;
    customerPhone: string;
  },
) {
  const business =
    await getCurrentBusiness();

  const userId =
    await getAuthenticatedUserId();

  return mpesaPaymentService.initiateSalePayment({
    businessId:
      business.id,

    saleId:
      input.saleId,

    amount:
      input.amount,

    customerPhone:
      input.customerPhone,

    createdBy:
      userId,
  });
}