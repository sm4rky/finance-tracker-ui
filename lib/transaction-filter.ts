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
