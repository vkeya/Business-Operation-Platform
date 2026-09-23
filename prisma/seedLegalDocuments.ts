import { prisma } from "@/lib/database/prisma";
import { LegalDocumentType } from "../generated/prisma/client";

const documents = [
  {
    type: LegalDocumentType.TERMS_OF_SERVICE,
    version: "1.0",
    title: "SmatPic Terms of Service",
  },
  {
    type: LegalDocumentType.PRIVACY_POLICY,
    version: "1.0",
    title: "SmatPic Privacy Policy",
  },
  {
    type: LegalDocumentType.ACCEPTABLE_USE,
    version: "1.0",
    title: "SmatPic Acceptable Use Policy",
  },
  {
    type: LegalDocumentType.COOKIE_POLICY,
    version: "1.0",
    title: "SmatPic Cookie Policy",
  },
  {
    type: LegalDocumentType.PAYMENT_REFUND,
    version: "1.0",
    title: "SmatPic Payment, Subscription and Refund Policy",
  },
  {
    type: LegalDocumentType.SERVICE_LEVEL,
    version: "1.0",
    title: "SmatPic Service Availability Policy",
  },
  {
    type: LegalDocumentType.DPA,
    version: "1.0",
    title: "SmatPic Data Processing Agreement",
  },
];

async function main() {
  for (const document of documents) {
    await prisma.legalDocument.upsert({
      where: {
        type_version: {
          type: document.type,
          version: document.version,
        },
      },
      update: {
        title: document.title,
        isActive: true,
      },
      create: {
        ...document,
        effectiveAt: new Date(),
        publishedAt: new Date(),
        isActive: true,
      },
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });