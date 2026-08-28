import { accountRepository } from "@/lib/accounting/accountRepository";
import { journalService } from "@/lib/accounting/journalService";

interface ReverseSaleInput {
  businessId: string;
  saleId: string;
  referenceNumber: string;
  totalAmount: number;
  currency: string;
  customerId?: string | null;
  createdBy: string;
}

export async function reverseSaleAccounting(
  input: ReverseSaleInput,
) {
  const receivableAccount =
    await accountRepository.findByCode(
      input.businessId,
      "1200",
    );

  const revenueAccount =
    await accountRepository.findByCode(
      input.businessId,
      "4000",
    );

  if (!receivableAccount) {
    throw new Error(
      "Accounts Receivable account not configured.",
    );
  }

  if (!revenueAccount) {
    throw new Error(
      "Sales Revenue account not configured.",
    );
  }

  return journalService.create({
    businessId:
      input.businessId,

    reference:
      `SALE-${input.referenceNumber}-REVERSAL`,

    description:
      `Reversal of sale ${input.referenceNumber}`,

    entryDate:
      new Date(),

    createdBy:
      input.createdBy,

    currency:
      input.currency,

    lines: [
      {
        accountId:
          revenueAccount.id,

        description:
          "Reversal of sales revenue",

        debit:
          input.totalAmount,

        credit:
          0,
      },

      {
        accountId:
          receivableAccount.id,

        description:
          "Reversal of customer receivable",

        debit:
          0,

        credit:
          input.totalAmount,
      },
    ],
  });
}