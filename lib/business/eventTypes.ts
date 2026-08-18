export const businessEventTypes = {
  BUSINESS_CREATED: "business.created",

  USER_CREATED: "user.created",
  USER_ROLE_CHANGED: "user.role_changed",

  PRODUCT_CREATED: "product.created",
  PRODUCT_UPDATED: "product.updated",

  INVENTORY_RECEIVED: "inventory.received",
  INVENTORY_ADJUSTED: "inventory.adjusted",
  INVENTORY_TRANSFERRED: "inventory.transferred",

  SALE_CREATED: "sale.created",
  SALE_COMPLETED: "sale.completed",
  SALE_CANCELLED: "sale.cancelled",

  PURCHASE_CREATED: "purchase.created",
  PURCHASE_RECEIVED: "purchase.received",
  PURCHASE_CANCELLED: "purchase.cancelled",

  PAYMENT_RECEIVED: "payment.received",
  PAYMENT_MADE: "payment.made",

  EXPENSE_CREATED: "expense.created",

  JOURNAL_ENTRY_POSTED: "journal_entry.posted",
} as const;

export type BusinessEventType =
  (typeof businessEventTypes)[keyof typeof businessEventTypes];