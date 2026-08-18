export type InventoryMovementType =
  | "purchase"
  | "sale"
  | "sale_return"
  | "purchase_return"
  | "transfer_in"
  | "transfer_out"
  | "adjustment_in"
  | "adjustment_out"
  | "waste"
  | "damage"
  | "opening_balance";

export interface InventoryBalance {
  id: string;
  businessId: string;
  productId: string;
  warehouseId: string;

  quantity: number;
  reservedQuantity: number;

  averageCost: number;
  currency: string;

  updatedAt: string;
}

export interface InventoryMovement {
  id: string;
  businessId: string;
  productId: string;

  warehouseId: string;

  type: InventoryMovementType;

  quantity: number;

  unitCost?: number;
  totalCost?: number;

  referenceType?: string;
  referenceId?: string;

  notes?: string;

  createdBy: string;
  createdAt: string;
}

export interface StockTransfer {
  id: string;
  businessId: string;

  productId: string;

  fromWarehouseId: string;
  toWarehouseId: string;

  quantity: number;

  status: "pending" | "completed" | "cancelled";

  notes?: string;

  createdBy: string;
  createdAt: string;
  completedAt?: string;
}