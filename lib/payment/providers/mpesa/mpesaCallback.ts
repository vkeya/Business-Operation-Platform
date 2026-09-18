import "server-only";

import type {
  MpesaCallbackItem,
  MpesaCallbackPayload,
  ParsedMpesaCallback,
} from "./mpesaTypes";

function getCallbackItem(
  items: MpesaCallbackItem[],
  name: string,
) {
  return items.find(
    (item) => item.Name === name,
  )?.Value;
}

export function parseMpesaCallback(
  payload: unknown,
): ParsedMpesaCallback {
  if (
  !payload ||
  typeof payload !== "object" ||
  Array.isArray(payload)
) {
  throw new Error(
    "Invalid M-Pesa callback: payload must be an object.",
  );
}

const data =
  payload as MpesaCallbackPayload;

const callback =
  data.Body?.stkCallback;

  if (!callback) {
    throw new Error(
      "Invalid M-Pesa callback: stkCallback is missing.",
    );
  }

  if (!callback.MerchantRequestID) {
    throw new Error(
      "Invalid M-Pesa callback: MerchantRequestID is missing.",
    );
  }

  if (!callback.CheckoutRequestID) {
    throw new Error(
      "Invalid M-Pesa callback: CheckoutRequestID is missing.",
    );
  }

  if (
    typeof callback.ResultCode !==
    "number"
  ) {
    throw new Error(
      "Invalid M-Pesa callback: ResultCode is missing.",
    );
  }

  const items =
    callback.CallbackMetadata?.Item ??
    [];

  const amount =
    getCallbackItem(items, "Amount");

  const mpesaReceiptNumber =
    getCallbackItem(
      items,
      "MpesaReceiptNumber",
    );

  const transactionDate =
    getCallbackItem(
      items,
      "TransactionDate",
    );

  const phoneNumber =
    getCallbackItem(
      items,
      "PhoneNumber",
    );

  return {
    merchantRequestId:
      callback.MerchantRequestID,

    checkoutRequestId:
      callback.CheckoutRequestID,

    resultCode:
      callback.ResultCode,

    resultDescription:
      callback.ResultDesc,

    amount:
      typeof amount === "number"
        ? amount
        : typeof amount === "string"
          ? Number(amount)
          : undefined,

    mpesaReceiptNumber:
      mpesaReceiptNumber !== undefined
        ? String(mpesaReceiptNumber)
        : undefined,

    transactionDate:
      transactionDate !== undefined
        ? String(transactionDate)
        : undefined,

    phoneNumber:
      phoneNumber !== undefined
        ? String(phoneNumber)
        : undefined,
  };
}