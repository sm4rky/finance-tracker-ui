import type { SortingState } from "@tanstack/react-table";

export type QueryTransactionsRequest = {
  page: number;
  limit: number;
  sortBy?: TransactionSortByField;
  sortDirection?: SortDirection;
};

export interface TransactionResponse {
  id: string;
  linkedBankAccountId: string | null;
  plaidTransactionId: string;
  amount: number;
  isoCurrencyCode: string | null;
  date: string;
  authorizedDate: string | null;
  authorizedDatetime: string | null;
  name: string;
  merchantName: string | null;
  pending: boolean;
  paymentChannel: string | null;
  pfcPrimary: string | null;
  pfcDetailed: string | null;
  logoUrl: string | null;
  status: string;
  removedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type SortDirection = "asc" | "desc";

export type TransactionSortByField =
  | "merchantName"
  | "linkedBankAccountId"
  | "pfcPrimary"
  | "pfcDetailed"
  | "date"
  | "amount"
  | "paymentChannel"
  | "pending";

export const TRANSACTION_SORT_COLUMN_TO_API: Record<
  string,
  TransactionSortByField
> = {
  merchant: "merchantName",
  account: "linkedBankAccountId",
  category: "pfcPrimary",
  detailCategory: "pfcDetailed",
  date: "date",
  amount: "amount",
  paymentChannel: "paymentChannel",
  pending: "pending",
};

export function transactionSortFromTableState(
  sorting: SortingState,
): Pick<QueryTransactionsRequest, "sortBy" | "sortDirection"> {
  const first = sorting[0];
  if (!first) return {};
  const sortBy = TRANSACTION_SORT_COLUMN_TO_API[first.id];
  if (!sortBy) return {};
  return {
    sortBy,
    sortDirection: first.desc ? "desc" : "asc",
  };
}
