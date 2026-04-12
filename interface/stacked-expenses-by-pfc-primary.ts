import type { TransactionAnalyticsQueryRequest } from "@/interface/transaction-analytics";

export type TimeGranularity = "day" | "week" | "month" | "year";

export type StackedExpensesByPfcPrimaryAmount = {
  pfcPrimary: string | null;
  amount: number;
};

export type StackedExpensesByPfcPrimaryBucket = {
  period: string;
  stacks: readonly StackedExpensesByPfcPrimaryAmount[];
};

export type StackedExpensesByPfcPrimaryResponse = {
  timeGranularity: TimeGranularity;
  buckets: readonly StackedExpensesByPfcPrimaryBucket[];
};

export type StackedExpensesByPfcPrimaryRequest =
  TransactionAnalyticsQueryRequest & {
    timeGranularity: TimeGranularity;
  };
