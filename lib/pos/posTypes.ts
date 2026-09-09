import type { CreateSaleInput } from "@/lib/sales/saleRepository";

export type PosPaymentMethod =
  | "CASH"
  | "MPESA"
  | "CARD"
  | "BANK"
  | "CREDIT";

export type PosSaleItem =
  CreateSaleInput["items"][number];

export type PosCartItem =
  PosSaleItem & {
    lineId: string;
	inventoryQuantity: number;
  };

export interface PosPaymentInput {
  method: PosPaymentMethod;
  amount: number;
  currency?: string;
  reference?: string;
}

export interface PosCart {
  items: PosCartItem[];

  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
}

export interface PosCheckoutRequest {
  branchId?: string;
  warehouseId: string;
  customerId?: string;

  currency: string;
  exchangeRate?: number;

  notes?: string;

  cart: PosCart;

  payment: PosPaymentInput;
}

export interface PosProductSelection {
  productId: string;
  productName: string;
  sku?: string;

  sellingUnitId?: string;

  quantity: number;
  unitPrice: number;
  inventoryQuantity: number;

  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
}

export interface PosSaleSummary {
  saleId: string;
  referenceNumber: string;

  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;

  currency: string;

  paymentMethod: PosPaymentMethod;
  paymentAmount: number;
  paymentReference: string;
}

export interface PosCheckoutResult {
  sale: PosSaleSummary;
}