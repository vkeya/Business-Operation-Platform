import {
  journalRepository,
  type CreateJournalEntryInput,
} from "./journalRepository";


export const journalService = {
  async create(
    input: CreateJournalEntryInput,
  ) {
    if (!input.businessId) {
      throw new Error(
        "Business context is required.",
      );
    }

    if (!input.reference.trim()) {
      throw new Error(
        "Journal reference is required.",
      );
    }

    if (!input.description.trim()) {
      throw new Error(
        "Journal description is required.",
      );
    }

    if (!input.createdBy) {
      throw new Error(
        "User context is required.",
      );
    }

    if (!input.currency) {
      throw new Error(
        "Currency is required.",
      );
    }

    if (input.lines.length < 2) {
      throw new Error(
        "A journal entry requires at least two lines.",
      );
    }


    const totalDebit =
      input.lines.reduce(
        (total, line) =>
          total + line.debit,
        0,
      );

    const totalCredit =
      input.lines.reduce(
        (total, line) =>
          total + line.credit,
        0,
      );


    if (
      totalDebit !== totalCredit
    ) {
      throw new Error(
        "Journal entry must be balanced.",
      );
    }


    for (const line of input.lines) {
      if (!line.accountId) {
        throw new Error(
          "Account is required for every journal line.",
        );
      }

      if (
        line.debit < 0 ||
        line.credit < 0
      ) {
        throw new Error(
          "Debit and credit values cannot be negative.",
        );
      }

      if (
        line.debit > 0 &&
        line.credit > 0
      ) {
        throw new Error(
          "A journal line cannot contain both debit and credit.",
        );
      }
    }


    return journalRepository.create({
      ...input,
      reference:
        input.reference.trim(),
      description:
        input.description.trim(),
    });
  },


  async list(
    businessId: string,
  ) {
    if (!businessId) {
      throw new Error(
        "Business context is required.",
      );
    }

    return journalRepository.list(
      businessId,
    );
  },
};