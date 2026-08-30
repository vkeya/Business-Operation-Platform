type ProductForConversion = {
  unit: string;
  attributes?: Record<string, string | number> | null;
};

type SellingUnitForConversion = {
  quantity: number;
  unit: string;
};

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
  const sellingUnitUnit =
    sellingUnit.unit
      .trim()
      .toLowerCase();

  const productUnit =
    product.unit
      .trim()
      .toLowerCase();

  // Same unit: Bottle → Bottle,
  // Case → Case, etc.
  if (sellingUnitUnit === productUnit) {
    return (
      saleQuantity *
      sellingUnit.quantity
    );
  }

  // ml selling unit against a bottled
  // product with a known volume.
  if (sellingUnitUnit === "ml") {
    const volumeInMl =
      getVolumeInMl(product);

    if (!volumeInMl) {
      throw new Error(
        `Product "${product.unit}" requires a volume attribute for ml selling units.`,
      );
    }

    return (
      saleQuantity *
      sellingUnit.quantity /
      volumeInMl
    );
  }

  // Existing fallback behaviour.
  return (
    saleQuantity *
    sellingUnit.quantity
  );
}