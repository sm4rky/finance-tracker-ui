import type { TransactionAnalyticsQueryRequest } from "@/interface/transaction-analytics";
import type { TimeGranularity } from "@/interface/stacked-expenses-by-pfc-primary";

export type GroupedExpenseByAccountBar = {
  linkedBankAccountId: string | null;
  officialName: string | null;
  amount: number;
};

export type GroupedExpenseByAccountBucket = {
  period: string;
  bars: readonly GroupedExpenseByAccountBar[];
};

export type GroupedExpensesByAccountResponse = {
  timeGranularity: TimeGranularity;
  buckets: readonly GroupedExpenseByAccountBucket[];
};

export type GroupedExpensesByAccountRequest =
  TransactionAnalyticsQueryRequest & {
    timeGranularity: TimeGranularity;
  };
