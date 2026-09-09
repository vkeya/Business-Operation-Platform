import { prisma } from "@/lib/database/prisma";

type PrismaTransactionClient =
  Parameters<typeof prisma.$transaction>[0] extends (
    client: infer T,
  ) => unknown
    ? T
    : never;

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
  client: PrismaTransactionClient = prisma,
) {
  return client.account.findUnique({
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