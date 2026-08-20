export type ProductUnit =
  | "piece"
  | "kg"
  | "g"
  | "litre"
  | "ml"
  | "pack"
  | "box"
  | "bottle"
  | "carton";

export const productUnits: {
  value: ProductUnit;
  label: string;
}[] = [
  { value: "piece", label: "Piece" },
  { value: "kg", label: "Kilogram" },
  { value: "g", label: "Gram" },
  { value: "litre", label: "Litre" },
  { value: "ml", label: "Millilitre" },
  { value: "pack", label: "Pack" },
  { value: "box", label: "Box" },
  { value: "bottle", label: "Bottle" },
  { value: "carton", label: "Carton" },
];