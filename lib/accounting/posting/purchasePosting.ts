import { accountRepository } from "@/lib/accounting/accountRepository";
import { journalService } from "@/lib/accounting/journalService";
import { prisma } from "@/lib/database/prisma";

type PrismaTransactionClient =
  Parameters<typeof prisma.$transaction>[0] extends (
    client: infer T,
  ) => unknown
    ? T
    : never;

interface PostPurchaseInput {
  businessId: string;
  purchaseId: string;
  referenceNumber: string;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  createdBy: string;
  client?: PrismaTransactionClient;
}

export async function postPurchaseToAccounting(
  input: PostPurchaseInput,
) {
  const inventoryAccount =
    await accountRepository.findByCode(
      input.businessId,
      "1100",
      input.client,
    );

  const inputVatAccount =
    await accountRepository.findByCode(
      input.businessId,
      "1205",
      input.client,
    );

  const payableAccount =
    await accountRepository.findByCode(
      input.businessId,
      "2000",
      input.client,
    );

  if (!inventoryAccount) {
    throw new Error(
      "Inventory account not configured.",
    );
  }

  if (!inputVatAccount) {
    throw new Error(
      "Input VAT account not configured.",
    );
  }

  if (!payableAccount) {
    throw new Error(
      "Accounts Payable account not configured.",
    );
  }

  const inventoryAmount =
    input.subtotal - input.discountAmount;

  if (inventoryAmount < 0) {
    throw new Error(
      "Purchase discount cannot exceed subtotal.",
    );
  }

  const lines = [
    {
      accountId: inventoryAccount.id,
      description: "Inventory received",
      debit: inventoryAmount,
      credit: 0,
    },
    {
      accountId: inputVatAccount.id,
      description: "Input VAT",
      debit: input.taxAmount,
      credit: 0,
    },
    {
      accountId: payableAccount.id,
      description: "Supplier payable",
      debit: 0,
      credit: input.totalAmount,
    },
  ];

  return journalService.create(
    {
      businessId: input.businessId,
      reference:
        `PURCHASE-${input.referenceNumber}`,
      description:
        `Purchase ${input.referenceNumber}`,
      entryDate: new Date(),
      createdBy: input.createdBy,
      currency: input.currency,
      lines,
    },
    input.client,
  );
}