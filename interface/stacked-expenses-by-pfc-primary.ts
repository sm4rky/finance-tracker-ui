import { TimeGranularity } from "@/interface/granularity";
import type { TransactionAnalyticsQueryRequest } from "@/interface/transaction-analytics";

export type StackedExpensesByPfcPrimaryAmount = {
  pfcPrimary: string | null;
  amount: number;
};

export type StackedExpensesByPfcPrimaryBucket = {
  period: string;
  stacks: readonly StackedExpensesByPfcPrimaryAmount[];
};

export type StackedExpensesByPfcPrimaryRequest =
  TransactionAnalyticsQueryRequest & {
    timeGranularity: TimeGranularity;
  };

export type StackedExpensesByPfcPrimaryResponse = {
  timeGranularity: TimeGranularity;
  buckets: readonly StackedExpensesByPfcPrimaryBucket[];
};
