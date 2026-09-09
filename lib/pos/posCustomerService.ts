import { customerService } from "@/lib/customers/customerService";

export interface PosCustomer {
  customerId: string;
  name: string;
  phone?: string | null;
  email?: string | null;
}

function toPosCustomer(customer: any): PosCustomer {
  return {
    customerId: customer.id,
    name: customer.name,
    phone: customer.phone,
    email: customer.email,
  };
}

export const posCustomerService = {
  async search(
    businessId: string,
    query: string,
  ): Promise<PosCustomer[]> {
    if (!businessId) {
      throw new Error("Business context is required.");
    }

    const customers =
      await customerService.searchCustomers(
        businessId,
        query,
      );

    return customers.map(toPosCustomer);
  },
};