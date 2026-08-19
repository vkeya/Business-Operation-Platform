import {
  supplierRepository,
  type CreateSupplierInput,
} from "./supplierRepository";

export const supplierService = {
  async createSupplier(input: CreateSupplierInput) {
    if (!input.businessId) {
      throw new Error("Business context is required.");
    }

    if (!input.name.trim()) {
      throw new Error("Supplier name is required.");
    }

    return supplierRepository.create({
      ...input,
      name: input.name.trim(),
    });
  },

  async listSuppliers(businessId: string) {
    if (!businessId) {
      throw new Error("Business context is required.");
    }

    return supplierRepository.list(businessId);
  },

  async searchSuppliers(
    businessId: string,
    query: string,
  ) {
    if (!businessId) {
      throw new Error("Business context is required.");
    }

    return supplierRepository.search(
      businessId,
      query,
    );
  },

  async findSupplierByName(
    businessId: string,
    name: string,
  ) {
    if (!businessId) {
      throw new Error("Business context is required.");
    }

    return supplierRepository.findByName(
      businessId,
      name,
    );
  },
};