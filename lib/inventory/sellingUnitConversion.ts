type ProductForConversion = {
  unit: string;
  inventoryMode?: string | null;
  attributes?: Record<string, string | number> | null;
};

type SellingUnitForConversion = {
  quantity: number;
  unit: string;
  conversionQuantity?: number | null;
  conversionUnit?: string | null;
};

const LIQUID_UNITS_TO_ML: Record<string, number> = {
  ml: 1,
  milliliter: 1,
  milliliters: 1,
  cl: 10,
  centiliter: 10,
  centiliters: 10,
  l: 1000,
  liter: 1000,
  liters: 1000,
};

function normalizeUnit(unit: string) {
  return unit.trim().toLowerCase();
}

function getVolumeInMl(
  product: ProductForConversion,
) {
  const volume =
    product.attributes?.volume;

  if (
    typeof volume === "number" &&
    volume > 0
  ) {
    return volume;
  }

  if (typeof volume === "string") {
    const parsed = Number.parseFloat(
      volume.replace(/[^\d.]/g, ""),
    );

    return Number.isFinite(parsed) &&
      parsed > 0
      ? parsed
      : null;
  }

  return null;
}

export function getInventoryQuantityForSale(
  product: ProductForConversion,
  sellingUnit: SellingUnitForConversion,
  saleQuantity: number,
) {
  if (saleQuantity <= 0) {
    throw new Error(
      "Sale quantity must be greater than zero.",
    );
  }

  if (sellingUnit.quantity <= 0) {
    throw new Error(
      "Selling unit quantity must be greater than zero.",
    );
  }

  const sellingUnitUnit =
    normalizeUnit(sellingUnit.unit);

  const productUnit =
    normalizeUnit(product.unit);

  const sellingUnitMl =
    LIQUID_UNITS_TO_ML[sellingUnitUnit];

  const productUnitMl =
    LIQUID_UNITS_TO_ML[productUnit];

  // Liquid products use the canonical inventory
  // quantity represented by the selling unit.
  //
  // Example:
  // 1 shot × 50ml = 50ml consumed.
  // 2 glasses × 150ml = 300ml consumed.
  if (product.inventoryMode === "LIQUID") {
  if (!productUnitMl) {
    throw new Error(
      `Liquid product unit "${product.unit}" is not a supported volume unit.`,
    );
  }

  const conversionQuantity =
    sellingUnit.conversionQuantity;

  const conversionUnit =
    sellingUnit.conversionUnit
      ? normalizeUnit(sellingUnit.conversionUnit)
      : null;

  if (
    conversionQuantity !== null &&
    conversionQuantity !== undefined &&
    conversionUnit
  ) {
    if (
      !Number.isFinite(conversionQuantity) ||
      conversionQuantity <= 0
    ) {
      throw new Error(
        `Invalid conversion quantity for selling unit "${sellingUnit.unit}".`,
      );
    }

    const conversionUnitMl =
      LIQUID_UNITS_TO_ML[conversionUnit];

    if (!conversionUnitMl) {
      throw new Error(
        `Liquid conversion unit "${sellingUnit.conversionUnit}" is not a supported volume unit.`,
      );
    }

    return (
      saleQuantity *
      conversionQuantity *
      (conversionUnitMl / productUnitMl)
    );
  }

  if (!sellingUnitMl) {
    throw new Error(
      `Liquid selling unit "${sellingUnit.unit}" is not a supported volume unit.`,
    );
  }

  return (
    saleQuantity *
    sellingUnit.quantity *
    (sellingUnitMl / productUnitMl)
  );
}

  // Same unit for discrete products:
  // Pack → Pack, Case → Case, etc.
  if (sellingUnitUnit === productUnit) {
    return (
      saleQuantity *
      sellingUnit.quantity
    );
  }

  // Preserve the existing fallback behaviour
  // for non-liquid products.
  return (
    saleQuantity *
    sellingUnit.quantity
  );
}
