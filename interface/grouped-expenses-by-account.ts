import { TimeGranularity } from "@/interface/granularity";
import type { TransactionAnalyticsQueryRequest } from "@/interface/transaction-analytics";

export type GroupedExpenseByAccountBar = {
  linkedBankAccountId: string | null;
  officialName: string | null;
  amount: number;
};

export type GroupedExpenseByAccountBucket = {
  period: string;
  bars: readonly GroupedExpenseByAccountBar[];
};

export type GroupedExpensesByAccountRequest =
  TransactionAnalyticsQueryRequest & {
    timeGranularity: TimeGranularity;
  };

export type GroupedExpensesByAccountResponse = {
  timeGranularity: TimeGranularity;
  buckets: readonly GroupedExpenseByAccountBucket[];
};
