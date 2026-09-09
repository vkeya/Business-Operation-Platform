import { saleService } from "@/lib/sales/saleService";
import { paymentService } from "@/lib/payment/paymentService";

export interface PosReceiptItem {
  productName: string;
  sku?: string | null;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
}

export interface PosReceiptPayment {
  method: string;
  amount: number;
  currency: string;
  reference: string;
  status: string;
}

export interface PosReceipt {
  saleId: string;
  referenceNumber: string;
  status: string;
  createdAt: Date;
  currency: string;

  customer: {
    id: string;
    name: string;
    phone?: string | null;
    email?: string | null;
  } | null;

  warehouse: {
    id: string;
    name: string;
    code: string;
  } | null;

  items: PosReceiptItem[];

  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;

  payments: PosReceiptPayment[];
  amountPaid: number;
  changeAmount: number;
}

export const posReceiptService = {
  async getReceipt(
    businessId: string,
    saleId: string,
  ): Promise<PosReceipt> {
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

    const sale =
      await saleService.findById(
        businessId,
        saleId,
      );

    if (!sale) {
      throw new Error(
        "Sale not found.",
      );
    }

    if (sale.status !== "COMPLETED") {
      throw new Error(
        "Only completed sales can have a receipt.",
      );
    }

    const payments =
      await paymentService.listSalePayments(
        businessId,
        saleId,
      );

    const amountPaid =
      payments.reduce(
        (total, payment) =>
          total + Number(payment.amount),
        0,
      );

    const changeAmount =
      Math.max(
        0,
        amountPaid -
          Number(sale.totalAmount),
      );

    return {
      saleId: sale.id,
      referenceNumber:
        sale.referenceNumber,
      status: sale.status,
      createdAt: sale.createdAt,
      currency: sale.currency,

      customer: sale.customer
        ? {
            id: sale.customer.id,
            name: sale.customer.name,
            phone: sale.customer.phone,
            email: sale.customer.email,
          }
        : null,

      warehouse: sale.warehouse
        ? {
            id: sale.warehouse.id,
            name: sale.warehouse.name,
            code: sale.warehouse.code,
          }
        : null,

      items: sale.items.map(
        (item) => ({
          productName:
            item.productName,
          sku: item.sku,
          quantity:
            Number(item.quantity),
          unitPrice:
            Number(item.unitPrice),
          discountAmount:
            Number(item.discountAmount),
          taxAmount:
            Number(item.taxAmount),
          totalAmount:
            Number(item.totalAmount),
        }),
      ),

      subtotal:
        Number(sale.subtotal),
      discountAmount:
        Number(sale.discountAmount),
      taxAmount:
        Number(sale.taxAmount),
      totalAmount:
        Number(sale.totalAmount),

      payments:
        payments.map(
          (payment) => ({
            method: payment.method,
            amount:
              Number(payment.amount),
            currency:
              payment.currency,
            reference:
              payment.reference,
            status:
              payment.status,
          }),
        ),

      amountPaid,
      changeAmount,
    };
  },
};