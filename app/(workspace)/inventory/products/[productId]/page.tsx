import { notFound } from "next/navigation";
import { getCurrentBusiness } from "@/lib/business/currentBusiness";
import { productRepository } from "@/lib/inventory/productRepository";
import ProductForm from "../ProductForm";
import type { BusinessType } from "@/types";
import { getProductConfiguration } from "@/lib/business/productConfiguration";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;

  const business = await getCurrentBusiness();

  const product = await productRepository.findByIdWithSellingUnits(
    business.id,
    productId,
  );

  if (!product) {
    notFound();
  }

    const configuration =
    getProductConfiguration(
      business.type as BusinessType,
    );


  return (
    <ProductForm
      mode="edit"
      product={{
        ...product,
        costPrice: Number(product.costPrice),
        sellingPrice: Number(product.sellingPrice),
        minimumStock:
          product.minimumStock == null
            ? null
            : Number(product.minimumStock),
        reorderLevel:
          product.reorderLevel == null
            ? null
            : Number(product.reorderLevel),
        attributes:
          product.attributes &&
          typeof product.attributes === "object" &&
          !Array.isArray(product.attributes)
            ? Object.fromEntries(
                Object.entries(product.attributes).map(
                  ([key, value]) => [
                    key,
                    typeof value === "string"
                      ? value
                      : String(value ?? ""),
                  ],
                ),
              )
            : {},
        sellingUnits: product.sellingUnits.map((sellingUnit) => ({
          id: sellingUnit.id,
          name: sellingUnit.name,
          quantity: Number(sellingUnit.quantity),
          unit: sellingUnit.unit,
          sellingPrice: Number(sellingUnit.sellingPrice),
          conversionQuantity:
            sellingUnit.conversionQuantity == null
              ? null
              : Number(sellingUnit.conversionQuantity),
          conversionUnit: sellingUnit.conversionUnit,
        })),
      }}
      configuration={configuration}
    />
  );
}