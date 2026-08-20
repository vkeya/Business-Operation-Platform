export type SaleStatus =
  | "draft"
  | "confirmed"
  | "partially_paid"
  | "paid"
  | "cancelled"
  | "refunded";

export type PaymentStatus =
  | "unpaid"
  | "partially_paid"
  | "paid"
  | "refunded";

export interface Customer {
  id: string;
  businessId: string;

  name: string;
  phone?: string;
  email?: string;
  address?: string;

  taxNumber?: string;

  creditLimit?: number;
  currency?: string;

  isActive: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface SaleItem {
  id: string;
  saleId: string;
  productId: string;
  menuItemId?: string;

  productName: string;
  sku?: string;

  quantity: number;
  unitPrice: number;

  discountAmount: number;
  taxAmount: number;

  totalAmount: number;
}

export interface Sale {
  id: string;
  businessId: string;
  branchId?: string;

  customerId?: string;

  referenceNumber: string;

  status: SaleStatus;
  paymentStatus: PaymentStatus;

  currency: string;
  exchangeRate?: number;

  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;

  notes?: string;

  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface SalePayment {
  id: string;
  businessId: string;
  saleId: string;

  amount: number;
  currency: string;
  exchangeRate?: number;

  paymentMethodId: string;

  reference?: string;
  notes?: string;

  receivedBy: string;
  createdAt: string;
}