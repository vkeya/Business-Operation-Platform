import { NextResponse } from "next/server";

import { getCurrentBusinessContext } from "@/lib/business/currentBusiness";
import { prisma } from "@/lib/database/prisma";
import {
  inspectBusinessReferenceSequence,
  synchronizeBusinessReferenceSequence,
} from "@/lib/business/reference/referenceSynchronizer";

export async function GET() {
  try {
    const context =
      await getCurrentBusinessContext();

    const businessId = context.business.id;

    const products =
      await prisma.product.findMany({
        where: {
          businessId,
        },
        select: {
          sku: true,
          barcode: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

    const skuInspection =
      await inspectBusinessReferenceSequence({
        businessId,
        referenceType: "PRODUCT_SKU",
        values: products.map(
          (product) => product.sku,
        ),
      });

    const barcodeInspection =
      await inspectBusinessReferenceSequence({
        businessId,
        referenceType: "PRODUCT_BARCODE",
        values: products.map(
          (product) => product.barcode,
        ),
      });

    const skuPatterns =
      new Map<string, number>();

    const barcodePatterns =
      new Map<string, number>();

    for (const product of products) {
      const sku =
        product.sku?.trim() ?? "";

      const skuMatch =
        sku.match(/^(.*?)(\d+)$/);

      if (skuMatch) {
        const pattern =
          `${skuMatch[1]}{n}`;

        skuPatterns.set(
          pattern,
          (skuPatterns.get(pattern) ?? 0) +
            1,
        );
      }

      const barcode =
        product.barcode?.trim() ?? "";

      const barcodeMatch =
        barcode.match(/^(.*?)(\d+)$/);

      if (barcodeMatch) {
        const pattern =
          `${barcodeMatch[1]}{n}`;

        barcodePatterns.set(
          pattern,
          (barcodePatterns.get(pattern) ?? 0) +
            1,
        );
      }
    }

    return NextResponse.json({
      business: {
        id: businessId,
        name: context.business.name,
      },
      products: {
        total: products.length,
        withBarcode:
          products.filter(
            (product) =>
              Boolean(product.barcode?.trim()),
          ).length,
      },
      sku: {
        ...skuInspection,
        patterns: Array.from(
          skuPatterns.entries(),
        ).map(
          ([pattern, count]) => ({
            pattern,
            count,
          }),
        ),
      },
      barcode: {
        ...barcodeInspection,
        patterns: Array.from(
          barcodePatterns.entries(),
        ).map(
          ([pattern, count]) => ({
            pattern,
            count,
          }),
        ),
      },
    });
  } catch (error) {
    console.error(
      "Reference sequence inspection failed:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to inspect reference sequences.",
      },
      { status: 500 },
    );
  }
}

export async function POST() {
  try {
    const context =
      await getCurrentBusinessContext();

    const businessId = context.business.id;

    const products =
      await prisma.product.findMany({
        where: {
          businessId,
        },
        select: {
          sku: true,
          barcode: true,
        },
      });

    const skuResult =
      await synchronizeBusinessReferenceSequence({
        businessId,
        referenceType: "PRODUCT_SKU",
        values: products.map(
          (product) => product.sku,
        ),
      });

    const barcodeResult =
      await synchronizeBusinessReferenceSequence({
        businessId,
        referenceType: "PRODUCT_BARCODE",
        values: products.map(
          (product) => product.barcode,
        ),
      });

    return NextResponse.json({
      success: true,
      business: {
        id: businessId,
        name: context.business.name,
      },
      products: {
        total: products.length,
      },
      sku: skuResult,
      barcode: barcodeResult,
    });
  } catch (error) {
    console.error(
      "Reference sequence synchronization failed:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to synchronize reference sequences.",
      },
      { status: 500 },
    );
  }
}