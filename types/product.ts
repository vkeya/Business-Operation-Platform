export type ProductType =
  | "product"
  | "service"
  | "ingredient"
  | "consumable"
  | "medicine";

export type ProductStatus = "active" | "inactive";

export interface ProductCategory {
  id: string;
  businessId: string;
  name: string;
  description?: string;
  parentId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  businessId: string;
  categoryId?: string;

  name: string;
  sku: string;
  barcode?: string;

  type: ProductType;
  description?: string;

  unit: string;

  costPrice: number;
  sellingPrice: number;

  currency: string;

  taxRate?: number;
  taxCode?: string;

  trackInventory: boolean;
  minimumStock?: number;
  reorderLevel?: number;

  status: ProductStatus;

  createdAt: string;
  updatedAt: string;
}