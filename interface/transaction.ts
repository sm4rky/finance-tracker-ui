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

export interface TransactionLinkedBankAccountResponse {
  id: string;
  accountName?: string | null;
  officialName?: string | null;
  mask?: string | null;
  type?: string | null;
  subtype?: string | null;
}

export type QueryTransactionsRequest = {
  page?: number;
  limit?: number;
  sortBy?: TransactionSortField;
  sortDirection?: SortDirection;
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

export interface TransactionResponse {
  id: string;
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
  linkedBankAccount?: TransactionLinkedBankAccountResponse | null;
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

export type DeleteTransactionsResponse = {
  deletedCount: number;
};
