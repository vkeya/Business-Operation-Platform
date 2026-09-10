import fs from "fs";
import path from "path";

const args = process.argv.slice(2);

const useProduction =
  args.includes("--production");

const envFile = useProduction
  ? ".env.production.local"
  : ".env";

const envPath = path.join(
  process.cwd(),
  envFile,
);

if (!fs.existsSync(envPath)) {
  throw new Error(
    `Environment file not found: ${envFile}`,
  );
}

const envContent =
  fs.readFileSync(envPath, "utf8");

for (const line of envContent.split(/\r?\n/)) {
  const trimmed = line.trim();

  if (
    !trimmed ||
    trimmed.startsWith("#")
  ) {
    continue;
  }

  const separator =
    trimmed.indexOf("=");

  if (separator === -1) {
    continue;
  }

  const key =
    trimmed.slice(0, separator).trim();

  const value =
    trimmed.slice(separator + 1).trim();

  if (key) {
    process.env[key] = value;
  }
}

const businessId =
  args.find((arg) => arg.startsWith("--business-id="))
    ?.split("=")[1]
    ?.trim() || "";

const mode =
  args.includes("--apply")
    ? "apply"
    : args.includes("--dry-run")
      ? "dry-run"
      : "";

if (!businessId) {
  throw new Error(
    "Usage: --business-id=<BUSINESS_ID> --dry-run|--apply",
  );
}

if (!mode) {
  throw new Error(
    "Specify exactly one mode: --dry-run or --apply",
  );
}

async function main() {
	const { prisma } = await import("../lib/database/prisma");
  const products =
    await prisma.product.findMany({
      where: {
        businessId,
      },
      select: {
        id: true,
        name: true,
        sku: true,
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
      orderBy: {
        sku: "asc",
      },
    });

  let matched = 0;
  let changed = 0;
  let unchanged = 0;

  for (const product of products) {
    const retailPrice = product.prices[0]?.price;

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

    console.log(
      `[Retail Price Backfill] ${
        product.sku
      } | ${product.name} | ${currentPrice} -> ${newPrice}`,
    );

    if (mode === "apply") {
      await prisma.product.update({
        where: {
          id: product.id,
        },
        data: {
          sellingPrice: newPrice,
        },
      });
    }
  }

  console.log("");
  console.log("Retail price backfill complete.");
  console.log(`Products scanned: ${products.length}`);
  console.log(`Retail prices found: ${matched}`);
  console.log(`Products to change: ${changed}`);
  console.log(`Already correct: ${unchanged}`);
  console.log(`Mode: ${mode}`);
}

main().catch((error) => {
  console.error(
    "Retail price backfill failed:",
    error,
  );
  process.exit(1);
});