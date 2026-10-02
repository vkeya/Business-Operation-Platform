export type SupermarketSellingMode =
  | "UNIT"
  | "WEIGHT"
  | "PACK"
  | "BULK";

export type SupermarketProductInput = {
  productId: string;
  sellingMode?: SupermarketSellingMode;
  weighted?: boolean;
  shelfLocation?: string;
  aisle?: string;
  section?: string;
  reorderEnabled?: boolean;
  reorderPoint?: number;
  reorderQuantity?: number;
  promotionEligible?: boolean;
};
