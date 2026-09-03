export const importFieldAliases: Record<
  string,
  string[]
> = {
  name: [
    "product",
    "product name",
    "item",
    "item name",
    "item description",
    "product description",
    "description",
  ],

  sku: [
    "sku",
    "product code",
    "item code",
    "stock code",
    "product id",
    "item id",
  ],

  barcode: [
    "barcode",
    "bar code",
    "ean",
    "upc",
  ],

  category: [
    "category",
    "product category",
    "item category",
    "category name",
  ],

  quantity: [
    "quantity",
    "qty",
    "stock",
    "stock quantity",
    "stock on hand",
    "available quantity",
    "available qty",
    "current stock",
    "opening quantity",
    "balance",
  ],

  unitCost: [
    "unit cost",
    "cost",
    "cost price",
    "purchase price",
    "buying price",
    "unit purchase price",
  ],

  sellingPrice: [
    "selling price",
    "sale price",
    "retail price",
    "unit price",
    "price",
    "selling price per unit",
  ],

  reorderLevel: [
    "reorder level",
    "reorder point",
    "minimum stock",
    "minimum quantity",
    "minimum qty",
    "stock minimum",
  ],

  supplier: [
    "supplier",
    "supplier name",
    "vendor",
    "vendor name",
  ],

  description: [
    "description",
    "product description",
    "item description",
    "notes",
    "remarks",
  ],
};

export function getFieldAliases(
  fieldKey: string,
): string[] {
  return importFieldAliases[
    fieldKey
  ] ?? [];
}