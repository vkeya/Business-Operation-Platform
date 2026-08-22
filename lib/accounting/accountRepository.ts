import { prisma } from "@/lib/database/prisma";

export const accountRepository = {
  async list(
    businessId: string,
  ) {
    return prisma.account.findMany({
      where: {
        businessId,
      },
      orderBy: [
        {
          type: "asc",
        },
        {
          code: "asc",
        },
      ],
    });
  },


  async findByCode(
    businessId: string,
    code: string,
  ) {
    return prisma.account.findUnique({
      where: {
        businessId_code: {
          businessId,
          code,
        },
      },
    });
  },


  async create(
    data: {
      businessId: string;
      code: string;
      name: string;
      type:
  | "ASSET"
  | "LIABILITY"
  | "EQUITY"
  | "REVENUE"
  | "EXPENSE";
      description?: string;
      isSystem?: boolean;
    },
  ) {
    return prisma.account.create({
      data,
    });
  },
};