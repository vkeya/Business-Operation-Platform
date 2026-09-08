import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  }),
});

interface CsvRow {
  rowNumber: number;
  sku: string;
  quantity: number;
  unitCost: number;
}

interface Options {
  businessId: string;
  warehouseCode: string;
  csvPath: string;
  dryRun: boolean;
}

function getArgument(name: string): string | undefined {
  const index = process.argv.indexOf(name);

  if (index === -1) {
    return undefined;
  }

  return process.argv[index + 1];
}

function hasFlag(name: string): boolean {
  return process.argv.includes(name);
}

function printUsage(): void {
  console.log(`
Usage:

  npx tsx scripts/backfill-inventory-opening-stock.ts \\
    --business-id <business-id> \\
    --warehouse-code <warehouse-code> \\
    --csv <csv-path> \\
    --dry-run

Options:

  --business-id       Target business ID.
  --warehouse-code    Target warehouse code, e.g. MAIN.
  --csv               Path to the original inventory CSV.
  --dry-run           Validate and report only. Makes no database changes.
`);
}

function parseNumber(value: string): number {
  const normalized = value.replace(/,/g, "").trim();

  if (!normalized) {
    return 0;
  }

  const number = Number(normalized);

  if (!Number.isFinite(number)) {
    throw new Error(`Invalid number: "${value}"`);
  }

  return number;
}

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let insideQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];

    if (character === '"') {
      if (insideQuotes && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        insideQuotes = !insideQuotes;
      }

      continue;
    }

    if (character === "," && !insideQuotes) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += character;
  }

  values.push(current.trim());

  return values;
}

function normalizeHeader(value: string): string {
  return value
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase();
}

function parseInventoryCsv(content: string): CsvRow[] {
  const lines = content
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);

  if (lines.length < 2) {
    throw new Error("The CSV does not contain any data rows.");
  }

  const headers = parseCsvLine(lines[0]).map(normalizeHeader);

  const skuIndex = headers.indexOf("product code");
  const quantityIndex = headers.indexOf("qty.");
  const purchaseCostIndex = headers.indexOf("purchase cost");

  if (skuIndex === -1) {
    throw new Error('CSV column "Product Code" was not found.');
  }

  if (quantityIndex === -1) {
    throw new Error('CSV column "Qty." was not found.');
  }

  if (purchaseCostIndex === -1) {
    throw new Error('CSV column "Purchase Cost" was not found.');
  }

  return lines.slice(1).map((line, index) => {
    const values = parseCsvLine(line);

    const sku = String(values[skuIndex] ?? "").trim().toUpperCase();
    const quantity = parseNumber(String(values[quantityIndex] ?? ""));
    const unitCost = parseNumber(String(values[purchaseCostIndex] ?? ""));

    const rowNumber = index + 2;

    if (!sku) {
      throw new Error(`CSV row ${rowNumber}: Product Code is empty.`);
    }

    if (quantity < 0) {
      throw new Error(`CSV row ${rowNumber}: Qty. cannot be negative.`);
    }

    if (unitCost < 0) {
      throw new Error(`CSV row ${rowNumber}: Purchase Cost cannot be negative.`);
    }

    return {
      rowNumber,
      sku,
      quantity,
      unitCost,
    };
  });
}

function getOptions(): Options {
  const businessId = getArgument("--business-id");
  const warehouseCode = getArgument("--warehouse-code");
  const csvPath = getArgument("--csv");
  const dryRun = hasFlag("--dry-run");
  const apply = hasFlag("--apply");

  if (!businessId || !warehouseCode || !csvPath) {
    printUsage();
    throw new Error(
      "Missing required arguments. --business-id, --warehouse-code and --csv are required.",
    );
  }

  if (dryRun === apply) {
    throw new Error(
      "Specify exactly one of --dry-run or --apply.",
    );
  }

  return {
    businessId,
    warehouseCode: warehouseCode.trim().toUpperCase(),
    csvPath,
    dryRun,
  };
}

async function main(): Promise<void> {
  const options = getOptions();

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const csvPath = resolve(options.csvPath);

  console.log("");
  console.log("==============================================");
  console.log("Inventory Opening Stock Backfill");
  console.log("==============================================");
  console.log(`Business ID:    ${options.businessId}`);
  console.log(`Warehouse Code: ${options.warehouseCode}`);
  console.log(`CSV:            ${csvPath}`);
  console.log(`Mode:           ${options.dryRun ? "DRY RUN" : "LIVE"}`);
  console.log("==============================================");
  console.log("");

  const csvContent = await readFile(csvPath, "utf8");
  const csvRows = parseInventoryCsv(csvContent);

  console.log(`CSV rows: ${csvRows.length}`);

  const uniqueSkus = new Set(csvRows.map((row) => row.sku));

  console.log(`Unique SKUs: ${uniqueSkus.size}`);

  if (uniqueSkus.size !== csvRows.length) {
    throw new Error(
      `CSV contains duplicate Product Codes. Rows: ${csvRows.length}, unique SKUs: ${uniqueSkus.size}.`,
    );
  }

  const business = await prisma.business.findUnique({
    where: {
      id: options.businessId,
    },
    select: {
      id: true,
      name: true,
      baseCurrency: true,
    },
  });

  if (!business) {
    throw new Error(`Business "${options.businessId}" was not found.`);
  }

  console.log(`Business: ${business.name}`);
  console.log(`Base currency: ${business.baseCurrency}`);

  const warehouse = await prisma.warehouse.findFirst({
    where: {
      businessId: business.id,
      code: options.warehouseCode,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      code: true,
    },
  });

  if (!warehouse) {
    throw new Error(
      `Active warehouse "${options.warehouseCode}" was not found for business "${business.name}".`,
    );
  }

  console.log(`Warehouse: ${warehouse.name} (${warehouse.code})`);

  const skus = csvRows.map((row) => row.sku);

  const products = await prisma.product.findMany({
    where: {
      businessId: business.id,
      sku: {
        in: skus,
      },
    },
    select: {
      id: true,
      sku: true,
      name: true,
      type: true,
      trackInventory: true,
      unit: true,
      costPrice: true,
      currency: true,
    },
  });

  const productsBySku = new Map(
    products.map((product) => [product.sku.toUpperCase(), product]),
  );

  const missingProducts = csvRows.filter(
    (row) => !productsBySku.has(row.sku),
  );

  if (missingProducts.length > 0) {
    console.log("");
    console.log(`Missing products: ${missingProducts.length}`);

    for (const row of missingProducts.slice(0, 20)) {
      console.log(`  Row ${row.rowNumber}: ${row.sku}`);
    }

    if (missingProducts.length > 20) {
      console.log(`  ...and ${missingProducts.length - 20} more.`);
    }

    throw new Error(
      "Backfill stopped because one or more CSV products do not exist in the target business.",
    );
  }

  const balances = await prisma.inventoryBalance.findMany({
    where: {
      businessId: business.id,
      warehouseId: warehouse.id,
      productId: {
        in: products.map((product) => product.id),
      },
    },
    select: {
      productId: true,
      quantity: true,
    },
  });

  const existingBalanceProductIds = new Set(
    balances.map((balance) => balance.productId),
  );

  const eligibleRows = csvRows.filter((row) => {
    const product = productsBySku.get(row.sku);

    if (!product) {
      return false;
    }

    return (
      product.type === "PRODUCT" &&
      product.trackInventory &&
      row.quantity > 0 &&
      !existingBalanceProductIds.has(product.id)
    );
  });

  const alreadyBalancedRows = csvRows.filter((row) => {
    const product = productsBySku.get(row.sku);

    return product ? existingBalanceProductIds.has(product.id) : false;
  });

  const zeroQuantityRows = csvRows.filter((row) => row.quantity === 0);

  const nonInventoryRows = csvRows.filter((row) => {
    const product = productsBySku.get(row.sku);

    return (
      product?.type === "SERVICE" ||
      product?.trackInventory === false
    );
  });

  const totalQuantity = eligibleRows.reduce(
    (sum, row) => sum + row.quantity,
    0,
  );

  const totalCost = eligibleRows.reduce(
    (sum, row) => sum + row.quantity * row.unitCost,
    0,
  );

  console.log("");
  console.log("Backfill analysis");
  console.log("----------------------------------------------");
  console.log(`Products matched:          ${products.length}`);
  console.log(`Existing balances:         ${balances.length}`);
  console.log(`Already balanced:          ${alreadyBalancedRows.length}`);
  console.log(`Zero quantity rows:        ${zeroQuantityRows.length}`);
  console.log(`Non-inventory rows:        ${nonInventoryRows.length}`);
  console.log(`Opening balances to add:   ${eligibleRows.length}`);
  console.log(`Opening units to add:      ${totalQuantity}`);
  console.log(`Opening stock cost:        ${totalCost}`);
  console.log("----------------------------------------------");
  console.log("");

  if (eligibleRows.length > 0) {
    console.log("Sample opening-stock records:");

    for (const row of eligibleRows.slice(0, 10)) {
      const product = productsBySku.get(row.sku);

      console.log(
        `  ${row.sku} | ${product?.name ?? "Unknown"} | Qty ${row.quantity} | Cost ${row.unitCost}`,
      );
    }

    if (eligibleRows.length > 10) {
      console.log(`  ...and ${eligibleRows.length - 10} more.`);
    }
  }

  console.log("");

    if (options.dryRun) {
    console.log("DRY RUN COMPLETE.");
    console.log("No database records were created or modified.");
    return;
  }

  console.log("APPLY MODE");
  console.log("==============================================");
  console.log("Creating opening inventory balances and movements...");
  console.log("");

  await prisma.$transaction(
    async (tx) => {
      for (const row of eligibleRows) {
        const product = productsBySku.get(row.sku);

        if (!product) {
          throw new Error(
            `Product "${row.sku}" was not found during apply.`,
          );
        }

        await tx.inventoryMovement.create({
          data: {
            businessId: business.id,
            productId: product.id,
            warehouseId: warehouse.id,
            type: "RECEIPT",
            quantity: row.quantity,
            unitCost: row.unitCost,
            totalCost: row.quantity * row.unitCost,
            referenceType: "INVENTORY_IMPORT_BACKFILL",
            createdBy: "inventory-opening-stock-backfill",
            notes: "Opening inventory restored from historical spreadsheet.",
          },
        });

        await tx.inventoryBalance.create({
          data: {
            businessId: business.id,
            productId: product.id,
            warehouseId: warehouse.id,
            quantity: row.quantity,
            reservedQuantity: 0,
            averageCost: row.unitCost,
            currency: product.currency || business.baseCurrency,
          },
        });
      }
    },
    {
      maxWait: 10000,
      timeout: 120000,
    },
  );

  console.log("");
  console.log("==============================================");
  console.log("BACKFILL COMPLETE");
  console.log("==============================================");
  console.log(`Balances created: ${eligibleRows.length}`);
  console.log(`Units restored:   ${totalQuantity}`);
  console.log(`Stock cost:       ${totalCost}`);
  console.log("==============================================");
}

main()
  .catch((error: unknown) => {
    console.error("");
    console.error("BACKFILL FAILED");
    console.error(
      error instanceof Error ? error.message : String(error),
    );
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });