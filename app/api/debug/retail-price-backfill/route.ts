import { NextResponse } from "next/server";

import { getCurrentBusinessContext } from "@/lib/business/currentBusiness";
import { prisma } from "@/lib/database/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { business } =
      await getCurrentBusinessContext();

    const url = new URL(request.url);
    const mode = url.searchParams.get("mode") || "dry-run";

    if (mode !== "dry-run" && mode !== "apply") {
      return NextResponse.json(
        {
          error:
            'Invalid mode. Use "dry-run" or "apply".',
        },
        { status: 400 },
      );
    }

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
    let updated = 0;

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
        continue;
      }

      changed++;

      if (mode === "apply") {
        await prisma.product.update({
          where: {
            id: product.id,
          },
          data: {
            sellingPrice: newPrice,
          },
        });

        updated++;
      }
    }

    return NextResponse.json({
      mode,
      businessId: business.id,
      businessName: business.name,
      productsScanned: products.length,
      retailPricesFound: matched,
      productsToChange: changed,
      alreadyCorrect: unchanged,
      productsUpdated: updated,
    });
  } catch (error) {
    console.error(
      "Retail price backfill failed:",
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