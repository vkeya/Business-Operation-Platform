"use server";

import { getCurrentBusiness } from "@/lib/business/currentBusiness";
import { supplierService } from "@/lib/supplier/supplierService";
import {
  getAuthenticatedUserId,
} from "@/lib/auth/auth";
import {
  requireBusinessPermission,
} from "@/lib/business/businessPermissionService";

export async function getSuppliersAction() {
  const business = await getCurrentBusiness();

  const userId =
  await getAuthenticatedUserId();

await requireBusinessPermission(
  userId,
  business.id,
  "purchases.read",
);

  return supplierService.listSuppliers(
    business.id,
  );
}

export async function searchSuppliersAction(
  query: string,
) {
  const business = await getCurrentBusiness();

  const userId =
  await getAuthenticatedUserId();

await requireBusinessPermission(
  userId,
  business.id,
  "purchases.read",
);

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
	operationId: string;
  },
) {
  const business = await getCurrentBusiness();

  const userId =
  await getAuthenticatedUserId();

await requireBusinessPermission(
  userId,
  business.id,
  "purchases.manage",
);

  return supplierService.createSupplier({
	  ...input,
    businessId: business.id,
    createdBy: userId,
  });
}