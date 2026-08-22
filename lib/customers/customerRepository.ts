import { prisma } from "@/lib/database/prisma";

export interface CreateCustomerInput {
  businessId: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  taxNumber?: string;
  creditLimit?: number;
  currency?: string;
}

export interface UpdateCustomerInput
  extends Omit<CreateCustomerInput, "businessId"> {
  isActive: boolean;
}

function serializeCustomer<T extends {
  creditLimit: { toNumber(): number } | null;
}>(customer: T) {
  return {
    ...customer,
    creditLimit:
      customer.creditLimit?.toNumber() ?? null,
  };
}

export const customerRepository = {
  async create(input: CreateCustomerInput) {
    const customer = await prisma.customer.create({
      data: {
        businessId: input.businessId,
        name: input.name,
        phone: input.phone,
        email: input.email,
        address: input.address,
        taxNumber: input.taxNumber,
        creditLimit: input.creditLimit,
        currency: input.currency,
      },
    });

    return serializeCustomer(customer);
  },

  async list(businessId: string) {
    const customers =
  await prisma.customer.findMany({
    where: {
      businessId,
    },
    include: {
      _count: {
        select: {
          sales: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

    return customers.map(serializeCustomer);
  },

  async search(
    businessId: string,
    query: string,
  ) {
    const searchTerm = query.trim();

    if (!searchTerm) {
      return this.list(businessId);
    }

   const customers =
  await prisma.customer.findMany({
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
    include: {
      _count: {
        select: {
          sales: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });
    return customers.map(serializeCustomer);
  },

  async findById(
    businessId: string,
    customerId: string,
  ) {
    const customer =
      await prisma.customer.findFirst({
        where: {
          id: customerId,
          businessId,
        },
        include: {
          sales: {
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      });

    return customer
      ? serializeCustomer(customer)
      : null;
  },

  async update(
  businessId: string,
  customerId: string,
  input: UpdateCustomerInput,
) {
 
    const customer =
      await prisma.customer.updateMany({
        where: {
          id: customerId,
          businessId,
        },
        data: {
  name: input.name,
  phone: input.phone,
  email: input.email,
  address: input.address,
  taxNumber: input.taxNumber,
  creditLimit: input.creditLimit,
  currency: input.currency,
  isActive: input.isActive,
},
      });

    if (customer.count === 0) {
      throw new Error("Customer not found.");
    }

    return this.findById(
      businessId,
      customerId,
    );
  },

  async updateStatus(
    businessId: string,
    customerId: string,
    isActive: boolean,
  ) {
    const customer =
      await prisma.customer.updateMany({
        where: {
          id: customerId,
          businessId,
        },
        data: {
          isActive,
        },
      });

    if (customer.count === 0) {
      throw new Error("Customer not found.");
    }

    return this.findById(
      businessId,
      customerId,
    );
  },
};