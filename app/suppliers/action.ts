"use server";

import { getCurrentBusiness } from "@/lib/business/currentBusiness";
import { supplierService } from "@/lib/supplier/supplierService";

export async function getSuppliersAction() {
  const business = await getCurrentBusiness();

  return supplierService.listSuppliers(
    business.id,
  );
}

export async function searchSuppliersAction(
  query: string,
) {
  const business = await getCurrentBusiness();

  return supplierService.searchSuppliers(
    business.id,
    query,
  );
}

export async function createSupplierAction(
  input: {
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    taxNumber?: string;
    paymentTermsDays?: number;
    currency?: string;
  },
) {
  const business = await getCurrentBusiness();

  return supplierService.createSupplier({
    businessId: business.id,
    name: input.name,
    phone: input.phone,
    email: input.email,
    address: input.address,
    taxNumber: input.taxNumber,
    paymentTermsDays:
      input.paymentTermsDays,
    currency: input.currency,
  });
}