import type { TimeGranularity } from "@/interface/granularity";
import type { ProfileCustomCategoryResponse } from "@/interface/profile-custom-category";
import type { TransactionAnalyticsQueryRequest } from "@/interface/transaction-analytics";

export type StackedExpensesByCategoryAmount = {
  pfcPrimary: string | null;
  customCategory: ProfileCustomCategoryResponse | null;
  amount: number;
};

export type StackedExpensesByCategoryBucket = {
  period: string;
  stacks: readonly StackedExpensesByCategoryAmount[];
};

export type StackedExpensesByCategoryRequest =
  TransactionAnalyticsQueryRequest & {
    timeGranularity: TimeGranularity;
  };

export type StackedExpensesByCategoryResponse = {
  timeGranularity: TimeGranularity;
  buckets: readonly StackedExpensesByCategoryBucket[];
};
