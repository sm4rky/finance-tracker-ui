import type { ProfileCustomCategoryResponse } from "@/interface/profile-custom-category";

export type CategoryExpenseSlice = {
  pfcPrimary: string | null;
  customCategory: ProfileCustomCategoryResponse | null;
  totalExpenses: number;
};

export type CategoryExpenseDistributionResponse = {
  slices: readonly CategoryExpenseSlice[];
};
