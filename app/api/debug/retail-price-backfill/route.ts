import { NextResponse } from "next/server";

import { getCurrentBusinessContext } from "@/lib/business/currentBusiness";
import { prisma } from "@/lib/database/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { business } =
      await getCurrentBusinessContext();

    const products =
      await prisma.product.findMany({
        where: {
          businessId: business.id,
        },
        select: {
          id: true,
          sellingPrice: true,
          prices: {
            where: {
              type: "RETAIL",
              isActive: true,
            },
            select: {
              price: true,
            },
            take: 1,
          },
        },
      });

    let matched = 0;
    let changed = 0;
    let unchanged = 0;

    for (const product of products) {
      const retailPrice =
        product.prices[0]?.price;

      if (retailPrice === undefined) {
        continue;
      }

      matched++;

      const currentPrice =
        Number(product.sellingPrice);

      const newPrice =
        Number(retailPrice);

      if (currentPrice === newPrice) {
        unchanged++;
      } else {
        changed++;
      }
    }

    return NextResponse.json({
      mode: "dry-run",
      businessId: business.id,
      businessName: business.name,
      productsScanned: products.length,
      retailPricesFound: matched,
      productsToChange: changed,
      alreadyCorrect: unchanged,
    });
  } catch (error) {
    console.error(
      "Retail price backfill debug failed:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Retail price backfill failed.",
      },
      { status: 500 },
    );
  }
}