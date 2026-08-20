import type { ProductUnit } from "./productUnits";

const unitAliases: Record<string, ProductUnit> = {
  piece: "piece",
  pieces: "piece",
  pc: "piece",
  pcs: "piece",

  kg: "kg",
  kilogram: "kg",
  kilograms: "kg",

  g: "g",
  gram: "g",
  grams: "g",

  litre: "litre",
  litres: "litre",
  liter: "litre",
  liters: "litre",
  l: "litre",

  ml: "ml",
  millilitre: "ml",
  millilitres: "ml",
  milliliter: "ml",
  milliliters: "ml",

  pack: "pack",
  packs: "pack",

  box: "box",
  boxes: "box",

  bottle: "bottle",
  bottles: "bottle",

  carton: "carton",
  cartons: "carton",
};

export function normalizeProductUnit(
  unit: string,
): ProductUnit {
  const normalized = unit
    .trim()
    .toLowerCase();

  const productUnit =
    unitAliases[normalized];

  if (!productUnit) {
    throw new Error(
      `Unsupported product unit "${unit}".`,
    );
  }

  return productUnit;
}