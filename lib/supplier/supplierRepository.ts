import { prisma } from "@/lib/database/prisma";

export interface CreateSupplierInput {
  businessId: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  taxNumber?: string;
  paymentTermsDays?: number;
  currency?: string;
}

export const supplierRepository = {
  async create(input: CreateSupplierInput) {
    return prisma.supplier.create({
      data: {
        businessId: input.businessId,
        name: input.name,
        phone: input.phone,
        email: input.email,
        address: input.address,
        taxNumber: input.taxNumber,
        paymentTermsDays:
          input.paymentTermsDays,
        currency: input.currency,
      },
    });
  },

  async list(businessId: string) {
    return prisma.supplier.findMany({
      where: {
        businessId,
      },
      orderBy: {
        name: "asc",
      },
    });
  },

  async search(
    businessId: string,
    query: string,
  ) {
    const searchTerm = query.trim();

    if (!searchTerm) {
      return this.list(businessId);
    }

    return prisma.supplier.findMany({
      where: {
        businessId,
        OR: [
          {
            name: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
          {
            phone: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
          {
            email: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
        ],
      },
      orderBy: {
        name: "asc",
      },
    });
  },

  async findByName(
    businessId: string,
    name: string,
  ) {
    return prisma.supplier.findFirst({
      where: {
        businessId,
        name: {
          equals: name,
          mode: "insensitive",
        },
      },
    });
  },
};