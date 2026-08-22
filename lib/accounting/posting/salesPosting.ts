import { accountRepository } from "@/lib/accounting/accountRepository";
import { journalService } from "@/lib/accounting/journalService";


interface PostSaleInput {
  businessId: string;
  saleId: string;
  referenceNumber: string;
  totalAmount: number;
  currency: string;
  customerId?: string | null;
  createdBy: string;
}


export async function postSaleToAccounting(
  input: PostSaleInput,
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
      `SALE-${input.referenceNumber}`,

    description:
      `Sale ${input.referenceNumber}`,

    entryDate:
      new Date(),

    createdBy:
      input.createdBy,

    currency:
      input.currency,

    lines: [
      {
        accountId:
          receivableAccount.id,

        description:
          "Customer receivable",

        debit:
          input.totalAmount,

        credit:
          0,
      },

      {
        accountId:
          revenueAccount.id,

        description:
          "Sales revenue",

        debit:
          0,

        credit:
          input.totalAmount,
      },
    ],
  });
}