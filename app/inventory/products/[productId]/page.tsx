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

  const product = await productRepository.findById(
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
    }}
    configuration={configuration}
  />
);
}