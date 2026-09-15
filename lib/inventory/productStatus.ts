import type { Prisma } from "../../generated/prisma/client";

type ProductStatusClient = Pick<
  Prisma.TransactionClient,
  "product"
>;

export async function assertActiveProduct(
  client: ProductStatusClient,
  businessId: string,
  productId: string,
) {
  const product = await client.product.findFirst({
    where: {
      id: productId,
      businessId,
    },
    select: {
      id: true,
      status: true,
      name: true,
    },
  });

  if (!product) {
    throw new Error("Product not found.");
  }

  if (product.status !== "ACTIVE") {
    throw new Error(
      `Product "${product.name}" is archived and cannot be used for new operations.`,
    );
  }

  return product;
}