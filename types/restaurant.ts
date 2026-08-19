export interface RestaurantMenu {
  id: string;
  businessId: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RestaurantMenuItem {
  id: string;
  businessId: string;
  menuId: string;
  productId?: string;

  name: string;
  description?: string;

  sellingPrice: number;
  currency: string;

  isAvailable: boolean;
  displayOrder: number;

  createdAt: string;
  updatedAt: string;
}