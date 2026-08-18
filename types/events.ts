export type BusinessEventType =
  | "business_created"
  | "sale_created"
  | "sale_confirmed"
  | "sale_cancelled"
  | "payment_received"
  | "payment_made"
  | "purchase_created"
  | "purchase_received"
  | "purchase_cancelled"
  | "expense_recorded"
  | "stock_received"
  | "stock_sold"
  | "stock_adjusted"
  | "stock_transferred"
  | "stock_wasted"
  | "customer_created"
  | "supplier_created"
  | "product_created"
  | "product_updated"
  | "low_stock_detected";

export interface BusinessEvent {
  id: string;

  businessId: string;
  branchId?: string;

  type: BusinessEventType;

  entityType: string;
  entityId: string;

  occurredAt: string;

  actorId?: string;

  metadata?: Record<string, unknown>;
}

export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "approve"
  | "cancel"
  | "complete"
  | "login"
  | "logout";

export interface AuditEvent {
  id: string;

  businessId: string;
  branchId?: string;

  action: AuditAction;

  entityType: string;
  entityId: string;

  actorId?: string;

  description: string;

  metadata?: Record<string, unknown>;

  occurredAt: string;
}