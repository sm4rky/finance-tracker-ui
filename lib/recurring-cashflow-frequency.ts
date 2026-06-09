export const RECURRING_CASHFLOW_FREQUENCY = [
  "UNKNOWN",
  "WEEKLY",
  "BIWEEKLY",
  "SEMI_MONTHLY",
  "MONTHLY",
  "ANNUALLY",
  "ONE_TIME",
] as const;

export type RecurringCashflowFrequency =
  (typeof RECURRING_CASHFLOW_FREQUENCY)[number];

export const RECURRING_CASHFLOW_FREQUENCY_LABEL: Record<
  RecurringCashflowFrequency,
  string
> = {
  UNKNOWN: "Unknown",
  ONE_TIME: "One time",
  WEEKLY: "Weekly",
  BIWEEKLY: "Biweekly",
  SEMI_MONTHLY: "Semi monthly",
  MONTHLY: "Monthly",
  ANNUALLY: "Annually",
};

export const RECURRING_FREQUENCY_SELECT_ORDER: RecurringCashflowFrequency[] = [
  "UNKNOWN",
  "ONE_TIME",
  "WEEKLY",
  "BIWEEKLY",
  "SEMI_MONTHLY",
  "MONTHLY",
  "ANNUALLY",
];
