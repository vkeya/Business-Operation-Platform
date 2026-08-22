import { accountRepository } from "@/lib/accounting/accountRepository";
import { journalService } from "@/lib/accounting/journalService";


interface PostPaymentInput {
  businessId: string;
  paymentId: string;
  reference: string;
  amount: number;
  currency: string;
  createdBy: string;
  type: "SALE" | "PURCHASE";
}


export async function postPaymentToAccounting(
  input: PostPaymentInput,
) {
  const cashAccount =
    await accountRepository.findByCode(
      input.businessId,
      "1000",
    );

  if (!cashAccount) {
    throw new Error(
      "Cash account not configured.",
    );
  }


  const receivableAccount =
    await accountRepository.findByCode(
      input.businessId,
      "1200",
    );

  const payableAccount =
    await accountRepository.findByCode(
      input.businessId,
      "2000",
    );


  if (
    input.type === "SALE" &&
    !receivableAccount
  ) {
    throw new Error(
      "Accounts Receivable account not configured.",
    );
  }


  if (
    input.type === "PURCHASE" &&
    !payableAccount
  ) {
    throw new Error(
      "Accounts Payable account not configured.",
    );
  }


  return journalService.create({
    businessId:
      input.businessId,

    reference:
      `PAY-${input.reference}`,

    description:
      `${input.type} payment ${input.reference}`,

    entryDate:
      new Date(),

    createdBy:
      input.createdBy,

    currency:
      input.currency,

    lines:
      input.type === "SALE"
        ? [
            {
              accountId:
                cashAccount.id,
              description:
                "Customer payment received",
              debit:
                input.amount,
              credit:
                0,
            },
            {
              accountId:
                receivableAccount!.id,
              description:
                "Customer receivable cleared",
              debit:
                0,
              credit:
                input.amount,
            },
          ]
        : [
            {
              accountId:
                payableAccount!.id,
              description:
                "Supplier payable cleared",
              debit:
                input.amount,
              credit:
                0,
            },
            {
              accountId:
                cashAccount.id,
              description:
                "Supplier payment made",
              debit:
                0,
              credit:
                input.amount,
            },
          ],
  });
}