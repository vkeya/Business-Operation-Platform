export interface BoutiqueCategoryDefault {
  name: string;
  description: string;
  parentName?: string;
}

export const boutiqueCategoryDefaults: BoutiqueCategoryDefault[] = [
  {
    name: "Clothing",
    description:
      "Clothing and apparel including dresses, shirts, trousers, jackets and skirts.",
  },
  {
    name: "Dresses",
    description: "Casual, formal and special occasion dresses.",
    parentName: "Clothing",
  },
  {
  name: "Suits",
  description:
    "Formal suits, business suits and coordinated suit sets.",
  parentName: "Clothing",
},
  {
    name: "Shirts",
    description: "Shirts, blouses and tops.",
    parentName: "Clothing",
  },
  {
    name: "Trousers",
    description: "Trousers, pants and jeans.",
    parentName: "Clothing",
  },
  {
    name: "Jackets",
    description: "Jackets, coats and outerwear.",
    parentName: "Clothing",
  },
  {
    name: "Skirts",
    description: "Skirts and related apparel.",
    parentName: "Clothing",
  },

  {
    name: "Shoes",
    description:
      "Footwear including sneakers, sandals, boots and formal shoes.",
  },
  {
    name: "Sneakers",
    description: "Casual and sports sneakers.",
    parentName: "Shoes",
  },
  {
    name: "Sandals",
    description: "Casual and formal sandals.",
    parentName: "Shoes",
  },
  {
    name: "Boots",
    description: "Fashion, casual and outdoor boots.",
    parentName: "Shoes",
  },
  {
    name: "Formal Shoes",
    description: "Formal and business footwear.",
    parentName: "Shoes",
  },

  {
    name: "Handbags & Bags",
    description:
      "Handbags, backpacks, travel bags, wallets and other bags.",
  },
  {
    name: "Handbags",
    description: "Fashion and everyday handbags.",
    parentName: "Handbags & Bags",
  },
  {
    name: "Backpacks",
    description: "Backpacks for fashion, work and travel.",
    parentName: "Handbags & Bags",
  },
  {
    name: "Travel Bags",
    description: "Travel and luggage bags.",
    parentName: "Handbags & Bags",
  },
  {
    name: "Wallets",
    description: "Wallets, purses and small carry accessories.",
    parentName: "Handbags & Bags",
  },

  {
    name: "Accessories",
    description:
      "Fashion accessories including belts, watches, sunglasses and jewellery.",
  },
  {
    name: "Belts",
    description: "Fashion and utility belts.",
    parentName: "Accessories",
  },
  {
    name: "Watches",
    description: "Wrist watches and related accessories.",
    parentName: "Accessories",
  },
  {
    name: "Sunglasses",
    description: "Fashion and protective eyewear.",
    parentName: "Accessories",
  },
  {
    name: "Jewellery",
    description: "Fashion jewellery and accessories.",
    parentName: "Accessories",
  },

  {
    name: "Beauty Products",
    description:
      "Cosmetics, skincare, haircare and other beauty products.",
  },
  {
    name: "Skincare",
    description: "Skincare and facial care products.",
    parentName: "Beauty Products",
  },
  {
    name: "Makeup",
    description: "Cosmetics and makeup products.",
    parentName: "Beauty Products",
  },
  {
    name: "Haircare",
    description: "Haircare and hair treatment products.",
    parentName: "Beauty Products",
  },

  {
    name: "Other",
    description:
      "Other retail products sold by the boutique.",
  },
];