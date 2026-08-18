export interface BusinessContext {
  businessId: string;
  userId: string;
  branchId?: string;
}

export function createBusinessContext(
  businessId: string,
  userId: string,
  branchId?: string,
): BusinessContext {
  return {
    businessId,
    userId,
    branchId,
  };
}

export function requireBusinessContext(
  context: BusinessContext | null | undefined,
): BusinessContext {
  if (!context?.businessId) {
    throw new Error("Business context is required.");
  }

  if (!context.userId) {
    throw new Error("User context is required.");
  }

  return context;
}