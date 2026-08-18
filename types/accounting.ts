export type AccountType =
  | "asset"
  | "liability"
  | "equity"
  | "revenue"
  | "expense";

export type AccountStatus = "active" | "inactive";

export interface Account {
  id: string;
  businessId: string;

  code: string;
  name: string;

  type: AccountType;

  parentId?: string;

  description?: string;

  status: AccountStatus;

  isSystemAccount: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface JournalEntryLine {
  id: string;
  journalEntryId: string;

  accountId: string;

  description?: string;

  debit: number;
  credit: number;

  currency: string;
  exchangeRate?: number;
}

export interface JournalEntry {
  id: string;
  businessId: string;
  branchId?: string;

  referenceNumber: string;

  description: string;

  transactionDate: string;

  currency: string;
  exchangeRate?: number;

  sourceType?: string;
  sourceId?: string;

  lines: JournalEntryLine[];

  createdBy: string;
  createdAt: string;
}