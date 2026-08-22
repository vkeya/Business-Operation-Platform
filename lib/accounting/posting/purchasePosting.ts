import { accountRepository } from "@/lib/accounting/accountRepository";
import { journalService } from "@/lib/accounting/journalService";

interface PostPurchaseInput {
  businessId: string;
  purchaseId: string;
  referenceNumber: string;
  totalAmount: number;
  currency: string;
  createdBy: string;
}


export async function postPurchaseToAccounting(
  input: PostPurchaseInput,
) {
  const inventoryAccount =
    await accountRepository.findByCode(
      input.businessId,
      "1100",
    );

  const payableAccount =
    await accountRepository.findByCode(
      input.businessId,
      "2000",
    );


  if (!inventoryAccount) {
    throw new Error(
      "Inventory account not configured.",
    );
  }

  if (!payableAccount) {
    throw new Error(
      "Accounts Payable account not configured.",
    );
  }


  return journalService.create({
    businessId:
      input.businessId,

    reference:
      `PURCHASE-${input.referenceNumber}`,

    description:
      `Purchase ${input.referenceNumber}`,

    entryDate:
      new Date(),

    createdBy:
      input.createdBy,

    currency:
      input.currency,

    lines: [
      {
        accountId:
          inventoryAccount.id,

        description:
          "Inventory received",

        debit:
          input.totalAmount,

        credit:
          0,
      },

      {
        accountId:
          payableAccount.id,

        description:
          "Supplier payable",

        debit:
          0,

        credit:
          input.totalAmount,
      },
    ],
  });
}