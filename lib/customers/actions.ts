"use server";

import { getCurrentBusiness } from "@/lib/business/currentBusiness";
import {
  customerService,
} from "./customerService";
import type { CreateCustomerInput } from "./customerRepository";

export async function createCustomerAction(
  input: Omit<CreateCustomerInput, "businessId">,
) {
  const business = await getCurrentBusiness();

  return customerService.createCustomer({
    ...input,
    businessId: business.id,
  });
}

export async function listCustomersAction() {
  const business = await getCurrentBusiness();

  return customerService.listCustomers(
    business.id,
  );
}

export async function searchCustomersAction(
  query: string,
) {
  const business = await getCurrentBusiness();

  return customerService.searchCustomers(
    business.id,
    query,
  );
}

export async function getCustomerAction(
  customerId: string,
) {
  const business = await getCurrentBusiness();

  return customerService.findCustomer(
    business.id,
    customerId,
  );
}

export async function updateCustomerAction(
  customerId: string,
  input: Omit<
    CreateCustomerInput,
    "businessId"
  > & {
    isActive: boolean;
  },
) {
  const business = await getCurrentBusiness();

  return customerService.updateCustomer(
    business.id,
    customerId,
    input,
  );
}

export async function updateCustomerStatusAction(
  customerId: string,
  isActive: boolean,
) {
  const business = await getCurrentBusiness();

  return customerService.updateCustomerStatus(
    business.id,
    customerId,
    isActive,
  );
}