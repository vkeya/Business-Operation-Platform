import { NextRequest, NextResponse } from "next/server";

import { getCurrentBusiness } from "@/lib/business/currentBusiness";
import { inventoryService } from "@/lib/inventory/inventoryService";
import { productService } from "@/lib/inventory/productService";
import { prisma } from "@/lib/database/prisma";

export const dynamic = "force-dynamic";

function escapeCsv(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  const stringValue = String(value);

  if (
    stringValue.includes(",") ||
    stringValue.includes('"') ||
    stringValue.includes("\n") ||
    stringValue.includes("\r")
  ) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

function buildCsv(
  rows: Array<Record<string, unknown>>,
): string {
  if (rows.length === 0) {
    return "";
  }

  const headers = Object.keys(rows[0]);

  const headerRow = headers
    .map(escapeCsv)
    .join(",");

  const dataRows = rows.map((row) =>
    headers
      .map((header) => escapeCsv(row[header]))
      .join(","),
  );

  return [headerRow, ...dataRows].join("\r\n");
}

export async function GET(request: NextRequest) {
  try {
    const business = await getCurrentBusiness();

    const warehouseId =
      request.nextUrl.searchParams.get("warehouseId") ||
      undefined;

    const balances =
      await inventoryService.listBalances(
        business.id,
        undefined,
        warehouseId,
      );

    const products =
      await productService.listProducts(
        business.id,
      );

    const warehouses =
      await prisma.warehouse.findMany({
        where: {
          businessId: business.id,
          isActive: true,
          ...(warehouseId
            ? { id: warehouseId }
            : {}),
        },
        orderBy: {
          name: "asc",
        },
        select: {
          id: true,
          name: true,
          code: true,
        },
      });

    const productMap = new Map(
      products.map((product) => [
        product.id,
        product,
      ]),
    );

    const warehouseMap = new Map(
      warehouses.map((warehouse) => [
        warehouse.id,
        warehouse,
      ]),
    );

    const rows = balances.flatMap((balance) => {
  const product = productMap.get(balance.productId);
  const warehouse = warehouseMap.get(balance.warehouseId);

  if (!product || !warehouse) {
    return [];
  }

  const quantity = Number(balance.quantity);
  const reservedQuantity = Number(
    balance.reservedQuantity ?? 0,
  );
  const availableQuantity =
    quantity - reservedQuantity;

  const averageCost = Number(balance.averageCost);
  const stockValue = quantity * averageCost;

  const reorderLevel =
    product.reorderLevel ??
    product.minimumStock ??
    "";

  let stockStatus = "HEALTHY";

  if (quantity <= 0) {
    stockStatus = "OUT OF STOCK";
  } else if (
    reorderLevel !== "" &&
    quantity <= Number(reorderLevel)
  ) {
    stockStatus = "LOW STOCK";
  }

  return [
    {
      SKU: product.sku,
      "Product Name": product.name,
      Warehouse: warehouse.name,
      "Warehouse Code": warehouse.code,
      "Quantity On Hand": quantity,
      Reserved: reservedQuantity,
      Available: availableQuantity,
      "Reorder Level": reorderLevel,
      "Average Cost": averageCost,
      "Stock Value": stockValue,
      Currency: balance.currency,
      "Stock Status": stockStatus,
    },
  ];
});

const csv = buildCsv(rows);

    const date = new Date()
      .toISOString()
      .slice(0, 10);

    const filename =
      `smatpic-inventory-${date}.csv`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type":
          "text/csv; charset=utf-8",
        "Content-Disposition":
          `attachment; filename="${filename}"`,
        "Cache-Control":
          "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error(
      "Inventory export failed:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to export inventory.",
      },
      {
        status: 500,
      },
    );
  }
}