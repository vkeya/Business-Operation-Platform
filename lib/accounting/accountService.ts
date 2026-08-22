import {
  accountRepository,
} from "./accountRepository";

const defaultAccounts = [
  {
    code: "1000",
    name: "Cash",
    type: "ASSET" as const,
    description:
      "Business cash account",
  },

  {
    code: "1100",
    name: "Inventory",
    type: "ASSET" as const,
    description:
      "Inventory assets",
  },
  
  {
  code: "1200",
  name: "Accounts Receivable",
  type: "ASSET" as const,
  description:
    "Amounts owed by customers",
},
  
  {
  code: "1200",
  name: "Accounts Receivable",
  type: "ASSET" as const,
  description:
    "Amounts owed by customers",
},

  {
    code: "2000",
    name: "Accounts Payable",
    type: "LIABILITY" as const,
    description:
      "Money owed to suppliers",
  },

  {
  code: "4000",
  name: "Sales Revenue",
  type: "REVENUE" as const,
  description:
    "Revenue from sales",
},

  {
    code: "5000",
    name: "Operating Expenses",
    type: "EXPENSE" as const,
    description:
      "Business operating expenses",
  },
];


export const accountService = {
  async listAccounts(
    businessId: string,
  ) {
    if (!businessId) {
      throw new Error(
        "Business context is required.",
      );
    }

    return accountRepository.list(
      businessId,
    );
  },


  async createDefaultAccounts(
    businessId: string,
  ) {
    if (!businessId) {
      throw new Error(
        "Business context is required.",
      );
    }

    const created = [];

    for (const account of defaultAccounts) {
      const existing =
        await accountRepository.findByCode(
          businessId,
          account.code,
        );

      if (existing) {
        created.push(existing);
        continue;
      }

      const newAccount =
        await accountRepository.create({
          businessId,
          ...account,
          isSystem: true,
        });

      created.push(newAccount);
    }

    return created;
  },
};