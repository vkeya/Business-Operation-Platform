export type PaymentMethodType =
  | "cash"
  | "bank"
  | "mobile_money"
  | "card"
  | "credit"
  | "other";

export type PaymentDirection = "in" | "out";

export type ExpenseStatus = "draft" | "approved" | "paid" | "cancelled";

export interface PaymentMethod {
  id: string;
  businessId: string;

  name: string;
  type: PaymentMethodType;

  currency?: string;

  accountReference?: string;

  isActive: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  businessId: string;
  branchId?: string;

  direction: PaymentDirection;

  amount: number;
  currency: string;
  exchangeRate?: number;

  paymentMethodId: string;

  reference?: string;

  customerId?: string;
  supplierId?: string;

  saleId?: string;
  purchaseId?: string;
  expenseId?: string;

  notes?: string;

  createdBy: string;
  createdAt: string;
}

export interface ExpenseCategory {
  id: string;
  businessId: string;

  name: string;
  description?: string;

  isActive: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: string;
  businessId: string;
  branchId?: string;

  categoryId: string;

  description: string;

  amount: number;
  currency: string;
  exchangeRate?: number;

  supplierId?: string;
  paymentMethodId?: string;

  status: ExpenseStatus;

  reference?: string;
  receiptUrl?: string;
  notes?: string;

  createdBy: string;
  createdAt: string;
  updatedAt: string;
}