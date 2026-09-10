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
        key: "productId",
        label: "Product ID",
        type: "reference",

        description:
          "The source system product identifier, used as a fallback when no SKU is provided.",
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
        key: "unit",
        label: "Unit",
        type: "string",
        required: true,

        description:
          "The unit used to measure or sell the product, such as piece, kg, litre, or box.",
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
        key: "warehouse",
        label: "Warehouse / Store",
        type: "string",

        description:
          "The warehouse or store where the opening inventory quantity is held.",
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
        key: "retailPrice",
        label: "Retail Price",
        type: "currency",

        description:
          "The standard retail selling price.",
      },

      {
        key: "wholesalePrice",
        label: "Wholesale Price",
        type: "currency",

        description:
          "The wholesale selling price.",
      },

      {
        key: "minimumPrice",
        label: "Minimum Sales Price",
        type: "currency",

        description:
          "The lowest permitted selling price.",
      },

      {
        key: "rate1Price",
        label: "Rate 1",
        type: "currency",

        description:
          "Additional price rate 1.",
      },

      {
        key: "rate2Price",
        label: "Rate 2",
        type: "currency",

        description:
          "Additional price rate 2.",
      },

      {
        key: "rate3Price",
        label: "Rate 3",
        type: "currency",

        description:
          "Additional price rate 3.",
      },

      {
        key: "rate4Price",
        label: "Rate 4",
        type: "currency",

        description:
          "Additional price rate 4.",
      },

      {
        key: "currency",
        label: "Currency",
        type: "string",

        description:
          "Optional currency for the imported prices. If not provided, SmatPic uses the active business's base currency.",
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