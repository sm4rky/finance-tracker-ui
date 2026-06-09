import type { BudgetPeriod } from "@/lib/budget-period";
import type { ProfileCustomCategoryResponse } from "@/interface/profile-custom-category";

export interface CreateProfileBudgetCategoryRequest {
  pfcPrimaryCode?: string | null;
  pfcVersion?: string | null;
  customCategoryId?: string | null;
}

export interface CreateProfileBudgetRequest {
  name: string;
  amountLimit: number;
  isRecurring: boolean;
  periodType: BudgetPeriod | null;
  startDate: string;
  endDate?: string | null;
  profileCustomCategorySetId?: string | null;
  includeIncome: boolean;
  includeUnlinkedTransactions: boolean;
  categories: CreateProfileBudgetCategoryRequest[];
  linkedBankAccountIds: string[];
}

export interface UpdateProfileBudgetRequest {
  name: string;
  amountLimit: number;
  isActive: boolean;
}

export interface UpdateProfileBudgetActiveRequest {
  isActive: boolean;
}

export interface ProfileBudgetCategoryResponse {
  id: string;
  pfcPrimaryCode?: string | null;
  pfcVersion?: string | null;
  customCategory?: ProfileCustomCategoryResponse | null;
}

export interface ProfileBudgetPeriodResponse {
  id: string;
  periodStartDate: string;
  periodEndDate: string;
  periodName: string;
  amountLimit: number;
  spentAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileBudgetResponse {
  id: string;
  name: string;
  amountLimit: number;
  isRecurring: boolean;
  periodType: BudgetPeriod | null;
  startDate: string;
  endDate?: string | null;
  isActive: boolean;
  profileCustomCategorySetId?: string | null;
  includeIncome: boolean;
  includeUnlinkedTransactions: boolean;
  createdAt: string;
  updatedAt: string;
  categories: ProfileBudgetCategoryResponse[];
  linkedBankAccountIds: string[];
  currentPeriod?: ProfileBudgetPeriodResponse | null;
}
