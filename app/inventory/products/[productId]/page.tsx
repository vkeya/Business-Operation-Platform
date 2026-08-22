import { notFound } from "next/navigation";
import { getCurrentBusiness } from "@/lib/business/currentBusiness";
import { productRepository } from "@/lib/inventory/productRepository";
import ProductForm from "../ProductForm";

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

  return (
    <ProductForm
      mode="edit"
      product={product}
    />
  );
}