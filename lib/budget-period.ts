export const BUDGET_PERIOD = ["WEEKLY", "MONTHLY", "YEARLY"] as const;

export type BudgetPeriod = (typeof BUDGET_PERIOD)[number];

export const BUDGET_PERIOD_LABEL: Record<BudgetPeriod, string> = {
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  YEARLY: "Yearly",
};
