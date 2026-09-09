import { prisma } from "@/lib/database/prisma";


type PrismaTransactionClient =
  Parameters<typeof prisma.$transaction>[0] extends (
    client: infer T,
  ) => unknown
    ? T
    : never;

export interface CreateJournalEntryInput {
  businessId: string;
  branchId?: string;
  reference: string;
  description: string;
  entryDate: Date;
  createdBy: string;
  currency: string;

  lines: {
    accountId: string;
    description?: string;
    debit: number;
    credit: number;
  }[];
}


export const journalRepository = {
  async create(
  input: CreateJournalEntryInput,
  client: PrismaTransactionClient = prisma,
) {
  return client.journalEntry.create({
    data: {
      businessId: input.businessId,
      branchId: input.branchId,
      reference: input.reference,
      description: input.description,
      entryDate: input.entryDate,
      createdBy: input.createdBy,

      lines: {
        create: input.lines.map(
          (line) => ({
            accountId: line.accountId,
            description: line.description,
            debit: line.debit,
            credit: line.credit,
            currency: input.currency,
          }),
        ),
      },
    },

    include: {
      lines: true,
    },
  });
},


  async list(
    businessId: string,
  ) {
    return prisma.journalEntry.findMany({
      where: {
        businessId,
      },

      include: {
        lines: {
          include: {
            account: true,
          },
        },
      },

      orderBy: {
        entryDate: "desc",
      },
    });
  },
};