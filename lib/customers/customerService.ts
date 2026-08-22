import {
  customerRepository,
  type CreateCustomerInput,
} from "./customerRepository";

export const customerService = {
  async createCustomer(input: CreateCustomerInput) {
    const name = input.name.trim();

    if (!input.businessId) {
      throw new Error("Business context is required.");
    }

    if (!name) {
      throw new Error("Customer name is required.");
    }

    const phone = input.phone?.trim() || undefined;
    const email = input.email?.trim() || undefined;
    const address = input.address?.trim() || undefined;
    const taxNumber =
      input.taxNumber?.trim() || undefined;

    if (
      input.creditLimit !== undefined &&
      input.creditLimit < 0
    ) {
      throw new Error(
        "Credit limit cannot be negative.",
      );
    }

    return customerRepository.create({
      ...input,
      name,
      phone,
      email,
      address,
      taxNumber,
    });
  },

  async listCustomers(businessId: string) {
    if (!businessId) {
      throw new Error(
        "Business context is required.",
      );
    }

    return customerRepository.list(
      businessId,
    );
  },

  async searchCustomers(
    businessId: string,
    query: string,
  ) {
    if (!businessId) {
      throw new Error(
        "Business context is required.",
      );
    }

    return customerRepository.search(
      businessId,
      query,
    );
  },

  async findCustomer(
    businessId: string,
    customerId: string,
  ) {
    if (!businessId) {
      throw new Error(
        "Business context is required.",
      );
    }

    if (!customerId) {
      throw new Error(
        "Customer is required.",
      );
    }

    return customerRepository.findById(
      businessId,
      customerId,
    );
  },

  async updateCustomer(
    businessId: string,
    customerId: string,
    input: Omit<
  CreateCustomerInput,
  "businessId"
> & {
  isActive: boolean;
},
  ) {
    if (!businessId) {
      throw new Error(
        "Business context is required.",
      );
    }

    if (!customerId) {
      throw new Error(
        "Customer is required.",
      );
    }

    const name = input.name.trim();

    if (!name) {
      throw new Error(
        "Customer name is required.",
      );
    }

    if (
      input.creditLimit !== undefined &&
      input.creditLimit < 0
    ) {
      throw new Error(
        "Credit limit cannot be negative.",
      );
    }

    return customerRepository.update(
      businessId,
      customerId,
      {
        ...input,
        name,
        phone:
          input.phone?.trim() || undefined,
        email:
          input.email?.trim() || undefined,
        address:
          input.address?.trim() || undefined,
        taxNumber:
          input.taxNumber?.trim() || undefined,
      },
    );
  },

  async updateCustomerStatus(
    businessId: string,
    customerId: string,
    isActive: boolean,
  ) {
    if (!businessId) {
      throw new Error(
        "Business context is required.",
      );
    }

    if (!customerId) {
      throw new Error(
        "Customer is required.",
      );
    }

    return customerRepository.updateStatus(
      businessId,
      customerId,
      isActive,
    );
  },
};