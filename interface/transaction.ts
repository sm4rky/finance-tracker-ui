export type TransactionsFilterState = {
  accountIds?: string[];
  includeUnlinkedTransactions?: boolean;
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
  plaidTransactionId: string | null;
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
  website?: string | null;
  status: string;
  removedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SaveTransactionRequest {
  merchantName: string;
  linkedBankAccountId: string | null;
  date: string;
  pfcPrimary: string | null;
  pfcDetailed: string | null;
  paymentChannel: string | null;
  amountFlow: "expense" | "income";
  amount: number;
  website: string | null;
  status: "active" | "account_opted_out";
  pending: boolean;
  clearLogo?: boolean;
}
