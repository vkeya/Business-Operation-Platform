import { prisma } from "@/lib/database/prisma";

export interface CreateSaleInput {
  businessId: string;
  branchId?: string;
  warehouseId?: string;
  customerId?: string;

  referenceNumber: string;

  currency: string;
  exchangeRate?: number;

  notes?: string;

  createdBy: string;

  items: Array<{
    productId: string;
	menuItemId?: string;
    productName: string;
    sku?: string;

    quantity: number;
    unitPrice: number;

    discountAmount: number;
    taxAmount: number;
    totalAmount: number;
  }>;

  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
}

function serializeSaleItem<
  T extends {
    id: string;
    productId: string;
	menuItemId?: string | null;
    productName: string;
    sku: string | null;
    quantity: { toNumber(): number };
    unitPrice: { toNumber(): number };
    discountAmount: { toNumber(): number };
    taxAmount: { toNumber(): number };
    totalAmount: { toNumber(): number };
  },
>(item: T) {
  return {
    ...item,
    quantity: item.quantity.toNumber(),
    unitPrice: item.unitPrice.toNumber(),
    discountAmount:
      item.discountAmount.toNumber(),
    taxAmount:
      item.taxAmount.toNumber(),
    totalAmount:
      item.totalAmount.toNumber(),
  };
}

function serializeSale<
  T extends {
    exchangeRate:
      | { toNumber(): number }
      | null;
    subtotal: { toNumber(): number };
    discountAmount: { toNumber(): number };
    taxAmount: { toNumber(): number };
    totalAmount: { toNumber(): number };
    items: Array<{
  id: string;
  productId: string;
  menuItemId?: string | null;
  productName: string;
  sku: string | null;
      quantity: { toNumber(): number };
      unitPrice: { toNumber(): number };
      discountAmount: { toNumber(): number };
      taxAmount: { toNumber(): number };
      totalAmount: { toNumber(): number };
    }>;
  },
>(sale: T) {
  return {
    ...sale,

    exchangeRate:
      sale.exchangeRate?.toNumber() ?? null,

    subtotal:
      sale.subtotal.toNumber(),

    discountAmount:
      sale.discountAmount.toNumber(),

    taxAmount:
      sale.taxAmount.toNumber(),

    totalAmount:
      sale.totalAmount.toNumber(),

    items: sale.items.map(
      serializeSaleItem,
    ),
  };
}

export const saleRepository = {
  async create(input: CreateSaleInput) {
    const sale =
      await prisma.sale.create({
        data: {
          businessId: input.businessId,
          branchId: input.branchId,
		  warehouseId: input.warehouseId,
          customerId: input.customerId,

          referenceNumber:
            input.referenceNumber,

          status: "DRAFT",
          paymentStatus: "PENDING",

          currency: input.currency,
          exchangeRate:
            input.exchangeRate,

          subtotal: input.subtotal,
          discountAmount:
            input.discountAmount,
          taxAmount:
            input.taxAmount,
          totalAmount:
            input.totalAmount,

          notes: input.notes,
          createdBy: input.createdBy,

          items: {
            create: input.items.map(
              (item) => ({
                productId:
                  item.productId,
				menuItemId:
                  item.menuItemId,
                productName:
                  item.productName,
                sku: item.sku,

                quantity: item.quantity,
                unitPrice:
                  item.unitPrice,

                discountAmount:
                  item.discountAmount,
                taxAmount:
                  item.taxAmount,
                totalAmount:
                  item.totalAmount,
              }),
            ),
          },
        },

        include: {
          customer: true,
          items: true,
        },
      });

    return serializeSale(sale);
  },

  async list(businessId: string) {
    const sales =
      await prisma.sale.findMany({
        where: {
          businessId,
        },
        include: {
          customer: true,
		  warehouse: true,
          items: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    return sales.map(serializeSale);
  },

  async findByReference(
    businessId: string,
    referenceNumber: string,
  ) {
    const sale =
      await prisma.sale.findUnique({
        where: {
          businessId_referenceNumber: {
            businessId,
            referenceNumber,
          },
        },
        include: {
          customer: true,
		  warehouse: true,
          items: true,
        },
      });

    return sale
      ? serializeSale(sale)
      : null;
  },

  async findById(
    businessId: string,
    saleId: string,
  ) {
    const sale =
      await prisma.sale.findFirst({
        where: {
          id: saleId,
          businessId,
        },
        include: {
          customer: true,
          branch: true,
		  warehouse: true,
          items: true,
        },
      });

    return sale
      ? serializeSale(sale)
      : null;
  },

  async updateStatus(
    businessId: string,
    saleId: string,
    status:
      | "DRAFT"
      | "COMPLETED"
      | "CANCELLED",
  ) {
    const sale =
      await prisma.sale.update({
        where: {
          id: saleId,
          businessId,
        },
        data: {
          status,
        },
        include: {
          customer: true,
		  warehouse: true,
          items: true,
        },
      });

    return serializeSale(sale);
  },

  async cancel(
    businessId: string,
    saleId: string,
  ) {
    return this.updateStatus(
      businessId,
      saleId,
      "CANCELLED",
    );
  },
};