export type PurchaseStatus =
  | "draft"
  | "ordered"
  | "partially_received"
  | "received"
  | "cancelled"
  | "returned";

export type PurchasePaymentStatus =
  | "unpaid"
  | "partially_paid"
  | "paid"
  | "refunded";

export interface Supplier {
  id: string;
  businessId: string;

  name: string;
  phone?: string;
  email?: string;
  address?: string;

  taxNumber?: string;

  paymentTermsDays?: number;
  currency?: string;

  isActive: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface PurchaseItem {
  id: string;
  purchaseId: string;
  productId: string;

  productName: string;
  sku?: string;

  quantity: number;
  unitCost: number;

  discountAmount: number;
  taxAmount: number;

  totalAmount: number;
}

export interface Purchase {
  id: string;
  businessId: string;
  branchId?: string;
  warehouseId?: string;

  supplierId: string;

  referenceNumber: string;
  supplierInvoiceNumber?: string;

  status: PurchaseStatus;
  paymentStatus: PurchasePaymentStatus;

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

export interface PurchasePayment {
  id: string;
  businessId: string;
  purchaseId: string;

  amount: number;
  currency: string;
  exchangeRate?: number;

  paymentMethodId: string;

  reference?: string;
  notes?: string;

  paidBy: string;
  createdAt: string;
}