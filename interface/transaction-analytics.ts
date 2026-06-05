export type TransactionAnalyticsQueryRequest = {
  accountIds?: string[];
  includeUnlinkedTransactions?: boolean;
  pfcPrimaryList?: string[];
  customCategorySetId?: string;
  customCategoryIds?: string[];
  paymentChannels?: string[];
  pending?: boolean;
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
  amountFlow?: string | null;
};
