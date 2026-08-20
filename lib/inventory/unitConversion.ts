import type { ProductUnit } from "./productUnits";

const conversionFactors: Partial<
  Record<ProductUnit, Partial<Record<ProductUnit, number>>>
> = {
  kg: {
    g: 1000,
  },
  g: {
    kg: 0.001,
  },
  litre: {
    ml: 1000,
  },
  ml: {
    litre: 0.001,
  },
};

export function canConvertUnit(
  from: ProductUnit,
  to: ProductUnit,
): boolean {
  return (
    from === to ||
    conversionFactors[from]?.[to] !== undefined
  );
}

export function convertQuantity(
  quantity: number,
  from: ProductUnit,
  to: ProductUnit,
): number {
  if (from === to) {
    return quantity;
  }

  const factor =
    conversionFactors[from]?.[to];

  if (factor === undefined) {
    throw new Error(
      `Cannot convert from ${from} to ${to}.`,
    );
  }

  return quantity * factor;
}