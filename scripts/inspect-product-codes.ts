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
  args
    .find((arg) =>
      arg.startsWith("--business-id="),
    )
    ?.split("=")[1]
    ?.trim() || "";

if (!businessId) {
  throw new Error(
    "Usage: --production --business-id=<BUSINESS_ID>",
  );
}

async function main() {
  const { prisma } =
    await import(
      "../lib/database/prisma"
    );

  const products =
    await prisma.product.findMany({
      where: {
        businessId,
      },
      select: {
        name: true,
        sku: true,
        barcode: true,
      },
      orderBy: {
        sku: "desc",
      },
      take: 50,
    });

  console.log("");
  console.log(
    "Existing product codes",
  );
  console.log(
    "======================",
  );

  for (const product of products) {
    console.log(
      `${product.sku}\t${
        product.barcode ?? "(no barcode)"
      }\t${product.name}`,
    );
  }

  console.log("");
  console.log(
    `Products displayed: ${products.length}`,
  );
}

main().catch((error) => {
  console.error(
    "Product code inspection failed:",
    error,
  );
  process.exit(1);
});
