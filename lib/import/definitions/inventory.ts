import type {
  ImportDefinition,
} from "../types";

export const inventoryImportDefinition: ImportDefinition =
  {
    entityType: "inventory",

    label: "Inventory",

    description:
      "Import products and opening inventory balances from a spreadsheet.",

    fields: [
      {
        key: "name",
        label: "Product Name",
        type: "string",
        required: true,

        description:
          "The name of the product or inventory item.",
      },

      {
        key: "sku",
        label: "SKU",
        type: "reference",

        description:
          "The product stock keeping unit or internal code.",
      },

      {
        key: "barcode",
        label: "Barcode",
        type: "reference",

        description:
          "The product barcode, if available.",
      },

      {
        key: "category",
        label: "Category",
        type: "string",

        description:
          "The product category.",
      },

      {
        key: "quantity",
        label: "Opening Quantity",
        type: "number",

        description:
          "The current or opening stock quantity.",
      },

      {
        key: "unitCost",
        label: "Unit Cost",
        type: "currency",

        description:
          "The cost of one unit.",
      },

      {
        key: "sellingPrice",
        label: "Selling Price",
        type: "currency",

        description:
          "The selling price of one unit.",
      },

      {
        key: "reorderLevel",
        label: "Reorder Level",
        type: "number",

        description:
          "The minimum stock level before replenishment is needed.",
      },

      {
        key: "supplier",
        label: "Supplier",
        type: "string",

        description:
          "The supplier associated with the product.",
      },

      {
        key: "description",
        label: "Description",
        type: "string",

        description:
          "Additional product details or notes.",
      },
    ],
  };