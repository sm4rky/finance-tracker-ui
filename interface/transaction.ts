export type TransactionsFilterState = {
  accountIds?: string[];
  pfcPrimaryList?: string[];
  paymentChannels?: string[];
  pending?: boolean;
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
  amountFlow?: string | null;
};

export type SortDirection = "asc" | "desc";

export type TransactionSortField =
  | "merchantName"
  | "linkedBankAccountId"
  | "pfcPrimary"
  | "pfcDetailed"
  | "date"
  | "amount"
  | "paymentChannel"
  | "pending";

export type QueryTransactionsRequest = TransactionsFilterState & {
  page?: number;
  limit?: number;
  sortBy?: TransactionSortField;
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
