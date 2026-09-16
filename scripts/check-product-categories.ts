import fs from "fs";
import path from "path";

const args = process.argv.slice(2);

const envFile = args.includes("--production")
  ? ".env.production.local"
  : ".env";

const envPath = path.join(process.cwd(), envFile);

if (!fs.existsSync(envPath)) {
  throw new Error(`Environment file not found: ${envFile}`);
}

const envContent = fs.readFileSync(envPath, "utf8");

for (const line of envContent.split(/\r?\n/)) {
  const trimmed = line.trim();

  if (!trimmed || trimmed.startsWith("#")) {
    continue;
  }

  const separator = trimmed.indexOf("=");

  if (separator === -1) {
    continue;
  }

  const key = trimmed.slice(0, separator).trim();
  const value = trimmed.slice(separator + 1).trim();

  if (key) {
    process.env[key] = value;
  }
}

const businessId =
  args
    .find((arg) => arg.startsWith("--business-id="))
    ?.split("=")[1]
    ?.trim() || "";

if (!businessId) {
  throw new Error(
    "Usage: --production --business-id=<BUSINESS_ID>",
  );
}

async function main() {
  const { prisma } = await import("../lib/database/prisma");

  const products = await prisma.product.findMany({
    where: {
      businessId,
    },
    select: {
      categoryId: true,
      category: {
        select: {
          name: true,
        },
      },
    },
  });

  const counts = new Map<string, number>();

  let uncategorized = 0;

  for (const product of products) {
    if (!product.categoryId || !product.category) {
      uncategorized++;
      continue;
    }

    counts.set(
      product.category.name,
      (counts.get(product.category.name) ?? 0) + 1,
    );
  }

  console.log("");
  console.log("Product category analysis");
  console.log("=========================");
  console.log(`Products scanned: ${products.length}`);
  console.log(`Categorized: ${products.length - uncategorized}`);
  console.log(`Uncategorized: ${uncategorized}`);
  console.log("");

  console.log("Existing categories:");

  for (const [name, count] of [...counts.entries()].sort(
    (a, b) => a[0].localeCompare(b[0]),
  )) {
    console.log(`  ${name}: ${count}`);
  }
}

main().catch((error) => {
  console.error(
    "Product category analysis failed:",
    error,
  );
  process.exit(1);
});
