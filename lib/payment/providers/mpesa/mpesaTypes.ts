export type MpesaEnvironment =
  | "SANDBOX"
  | "PRODUCTION";

export type MpesaMerchantType =
  | "TILL"
  | "PAYBILL";

export interface MpesaServerCredentials {
  businessId: string;
  merchantType: MpesaMerchantType;
  shortcode: string;
  environment: MpesaEnvironment;
  consumerKey: string;
  encryptedConsumerSecret: string;
  encryptedPasskey: string;
}

export interface MpesaOAuthResponse {
  access_token: string;
  expires_in: string;
}

export interface MpesaStkPushRequest {
  businessShortCode: string;
  password: string;
  timestamp: string;
  transactionType:
    | "CustomerPayBillOnline"
    | "CustomerBuyGoodsOnline";
  amount: number;
  partyA: string;
  partyB: string;
  phoneNumber: string;
  callBackURL: string;
  accountReference: string;
  transactionDesc: string;
}

export interface MpesaStkPushResponse {
  MerchantRequestID?: string;
  CheckoutRequestID?: string;
  ResponseCode?: string;
  ResponseDescription?: string;
  CustomerMessage?: string;
  errorCode?: string;
  errorMessage?: string;
}

export interface MpesaCallbackItem {
  Name: string;
  Value?: string | number;
}

export interface MpesaStkCallback {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResultCode: number;
  ResultDesc: string;
  CallbackMetadata?: {
    Item: MpesaCallbackItem[];
  };
}

export interface MpesaCallbackPayload {
  Body?: {
    stkCallback?: MpesaStkCallback;
  };
}

export interface ParsedMpesaCallback {
  merchantRequestId: string;
  checkoutRequestId: string;
  resultCode: number;
  resultDescription: string;
  amount?: number;
  mpesaReceiptNumber?: string;
  transactionDate?: string;
  phoneNumber?: string;
}