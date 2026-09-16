import { accountRepository } from "@/lib/accounting/accountRepository";
import { journalService } from "@/lib/accounting/journalService";
import { prisma } from "@/lib/database/prisma";

type PrismaTransactionClient =
  Parameters<typeof prisma.$transaction>[0] extends (
    client: infer T,
  ) => unknown
    ? T
    : never;

interface PostSaleInput {
  businessId: string;
  saleId: string;
  referenceNumber: string;
  totalAmount: number;
  taxAmount: number;
  currency: string;
  customerId?: string | null;
  createdBy: string;
  client?: PrismaTransactionClient;
}


export async function postSaleToAccounting(
  input: PostSaleInput,
) {
  const receivableAccount =
  await accountRepository.findByCode(
    input.businessId,
    "1200",
    input.client,
  );

const revenueAccount =
  await accountRepository.findByCode(
    input.businessId,
    "4000",
    input.client,
  );

const taxPayableAccount =
  await accountRepository.findByCode(
    input.businessId,
    "2100",
    input.client,
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
  
    if (
    input.taxAmount > 0 &&
    !taxPayableAccount
  ) {
    throw new Error(
      "Tax Payable account not configured.",
    );
  }


   return journalService.create(
    {
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
            input.totalAmount -
            input.taxAmount,
        },

        ...(input.taxAmount > 0 &&
        taxPayableAccount
          ? [
              {
                accountId:
                  taxPayableAccount.id,

                description:
                  "Tax payable",

                debit:
                  0,

                credit:
                  input.taxAmount,
              },
            ]
          : []),
      ],
    },
    input.client,
  );
}