import type { BusinessType } from "@/types";

export type ProductAttributeType =
  | "text"
  | "select"
  | "number";

export interface ProductAttributeOption {
  value: string;
  label: string;
}

export interface ProductAttribute {
  id: string;
  label: string;
  type: ProductAttributeType;
  options?: ProductAttributeOption[];
}

export interface ProductConfiguration {
  sellingUnits: string[];
  productCategories: string[];
  categorySellingUnits?: Record<
    string,
    ProductCategoryConfiguration
  >;
  attributes: ProductAttribute[];
  supportsInventory: boolean;
  supportsServices: boolean;
}

export interface ProductCategoryConfiguration {
  sellingUnits: string[];
}

const clothingSizes: ProductAttributeOption[] = [
  { value: "XS", label: "XS" },
  { value: "S", label: "S" },
  { value: "M", label: "M" },
  { value: "L", label: "L" },
  { value: "XL", label: "XL" },
  { value: "XXL", label: "XXL" },
];

const shoeSizes: ProductAttributeOption[] = [
  { value: "36", label: "36" },
  { value: "37", label: "37" },
  { value: "38", label: "38" },
  { value: "39", label: "39" },
  { value: "40", label: "40" },
  { value: "41", label: "41" },
  { value: "42", label: "42" },
  { value: "43", label: "43" },
  { value: "44", label: "44" },
  { value: "45", label: "45" },
];

const alcoholTypes: ProductAttributeOption[] = [
  { value: "whiskey", label: "Whiskey" },
  { value: "gin", label: "Gin" },
  { value: "vodka", label: "Vodka" },
  { value: "rum", label: "Rum" },
  { value: "brandy", label: "Brandy" },
  { value: "tequila", label: "Tequila" },
  { value: "liqueur", label: "Liqueur" },
];

const productConfigurations: Record<
  BusinessType,
  ProductConfiguration
> = {
  restaurant: {
    sellingUnits: [
      "Piece",
      "Portion",
      "Pack",
      "Bottle",
      "Can",
      "Kilogram",
      "Gram",
      "Litre",
      "Millilitre",
    ],
    productCategories: [
      "Ingredients",
      "Beverages",
      "Packaging",
      "Supplies",
    ],
    attributes: [],
    supportsInventory: true,
    supportsServices: false,
  },

  wines_spirits: {
    sellingUnits: [
      "Bottle",
      "Shot",
      "Glass",
      "Case",
      "Pack",
      "Can",
    ],
    productCategories: [
      "Beer",
      "Wine",
      "Spirits",
      "Shots",
      "Mixers",
    ],
	
	categorySellingUnits: {
  Spirits: {
    sellingUnits: [
      "Bottle",
      "Shot",
      "Double Shot",
    ],
  },

  Beer: {
    sellingUnits: [
      "Bottle",
      "Can",
    ],
  },

  Wine: {
    sellingUnits: [
      "Bottle",
      "Glass",
    ],
  },

  Mixers: {
    sellingUnits: [
      "Bottle",
      "Can",
    ],
  },

  Shots: {
    sellingUnits: [
      "Shot",
      "Double Shot",
    ],
  },
},

    attributes: [
  {
    id: "volume",
    label: "Volume",
    type: "text",
  },
  {
    id: "alcoholType",
    label: "Alcohol Type",
    type: "select",
    options: alcoholTypes,
  },
],
    supportsInventory: true,
    supportsServices: false,
  },

  boutique: {
    sellingUnits: [
      "Piece",
      "Pair",
      "Set",
    ],
    productCategories: [
      "Dresses",
      "Shirts",
      "Trousers",
      "Shoes",
      "Bags",
      "Accessories",
    ],
    attributes: [
      {
        id: "clothingSize",
        label: "Clothing Size",
        type: "select",
        options: clothingSizes,
      },
      {
        id: "shoeSize",
        label: "Shoe Size",
        type: "select",
        options: shoeSizes,
      },
      {
        id: "color",
        label: "Color",
        type: "text",
      },
      {
        id: "brand",
        label: "Brand",
        type: "text",
      },
    ],
    supportsInventory: true,
    supportsServices: true,
  },

  supermarket: {
    sellingUnits: [
      "Piece",
      "Pack",
      "Carton",
      "Box",
      "Bag",
      "Kilogram",
      "Gram",
      "Litre",
      "Millilitre",
    ],
    productCategories: [],
    attributes: [],
    supportsInventory: true,
    supportsServices: false,
  },

  shop: {
    sellingUnits: [
      "Piece",
      "Pack",
      "Box",
      "Bag",
      "Set",
    ],
    productCategories: [],
    attributes: [],
    supportsInventory: true,
    supportsServices: true,
  },

  other: {
    sellingUnits: [
      "Piece",
      "Pack",
      "Box",
      "Set",
    ],
    productCategories: [],
    attributes: [],
    supportsInventory: true,
    supportsServices: true,
  },

  bar: {
    sellingUnits: [
      "Bottle",
      "Shot",
      "Glass",
      "Can",
      "Case",
      "Pack",
    ],
    productCategories: [
      "Beer",
      "Wine",
      "Spirits",
      "Cocktails",
      "Mixers",
      "Snacks",
    ],
	
	categorySellingUnits: {
  Spirits: {
    sellingUnits: [
      "Bottle",
      "Shot",
      "Double Shot",
    ],
  },

  Beer: {
    sellingUnits: [
      "Bottle",
      "Can",
    ],
  },

  Wine: {
    sellingUnits: [
      "Bottle",
      "Glass",
    ],
  },

  Mixers: {
    sellingUnits: [
      "Bottle",
      "Can",
    ],
  },
},

    attributes: [
  {
    id: "volume",
    label: "Volume",
    type: "text",
  },
  {
    id: "alcoholType",
    label: "Alcohol Type",
    type: "select",
    options: alcoholTypes,
  },
],
    supportsInventory: true,
    supportsServices: true,
  },

  hotel: {
    sellingUnits: [
      "Piece",
      "Bottle",
      "Pack",
      "Box",
      "Set",
    ],
    productCategories: [
      "Guest Supplies",
      "Housekeeping",
      "Food & Beverages",
      "Amenities",
      "Maintenance Supplies",
    ],
    attributes: [],
    supportsInventory: true,
    supportsServices: true,
  },

  hospital: {
    sellingUnits: [
      "Piece",
      "Pack",
      "Box",
      "Bottle",
      "Set",
    ],
    productCategories: [
      "Medical Supplies",
      "Consumables",
      "Equipment",
      "Laboratory Supplies",
      "Pharmacy",
    ],
    attributes: [],
    supportsInventory: true,
    supportsServices: true,
  },
};

export function getProductConfiguration(
  businessType: BusinessType,
): ProductConfiguration {
  return productConfigurations[businessType];
}