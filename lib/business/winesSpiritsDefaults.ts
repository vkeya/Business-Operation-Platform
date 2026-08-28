export interface WinesSpiritsCategoryDefault {
  name: string;
  description: string;
}

export const winesSpiritsCategoryDefaults: WinesSpiritsCategoryDefault[] = [
  {
    name: "Beer",
    description:
      "Bottled, canned and other packaged beers.",
  },
  {
    name: "Draught Beer",
    description:
      "Beer sold on tap or from draught systems.",
  },
  {
    name: "Wine",
    description:
      "Red, white, rosé, sparkling and other wines.",
  },
  {
    name: "Spirits",
    description:
      "Whisky, vodka, gin, rum, tequila and other spirits.",
  },
  {
    name: "Shots",
    description:
      "Single-shot and premium spirit servings.",
  },
  {
    name: "Ciders & Coolers",
    description:
      "Ciders, coolers and similar alcoholic beverages.",
  },
  {
    name: "Soft Drinks & Mixers",
    description:
      "Soft drinks, mixers, juices and non-alcoholic beverages.",
  },
  {
    name: "Other Products",
    description:
      "Other wines, spirits and related products.",
  },
];