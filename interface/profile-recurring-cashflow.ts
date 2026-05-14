export type RecurringCashflowDirection = "inflow" | "outflow";

export type RecurringCashflowFrequency =
  | "UNKNOWN"
  | "WEEKLY"
  | "BIWEEKLY"
  | "SEMI_MONTHLY"
  | "MONTHLY"
  | "ANNUALLY"
  | "ONE_TIME";

export interface SaveProfileRecurringCashflowRequest {
  linkedBankAccountId: string | null;
  direction: RecurringCashflowDirection;
  merchantName?: string | null;
  description: string;
  pfcPrimary: string | null;
  pfcDetailed: string | null;
  frequency: RecurringCashflowFrequency;
  lastAmount?: number | null;
  expectedAmount: number;
  firstDate?: string | null;
  lastDate?: string | null;
  predictedNextDate?: string | null;
}

export interface ProfileRecurringCashflowResponse {
  id: string;
  linkedBankAccountId: string | null;
  plaidStreamId: string | null;
  direction: RecurringCashflowDirection;
  merchantName: string | null;
  description: string;
  pfcPrimary: string | null;
  pfcDetailed: string | null;
  frequency: RecurringCashflowFrequency;
  lastAmount: number | null;
  expectedAmount: number;
  expectedAmountUserSet?: boolean;
  firstDate: string | null;
  lastDate: string | null;
  predictedNextDate: string | null;
  status: string;
  linkedBankAccount?: RecurringCashflowLinkedBankAccountResponse | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProfileRecurringCashflowCalendarOccurrenceResponse {
  date: string;
  amount: number;
  merchantName?: string | null;
  description?: string | null;
  pfcPrimary?: string | null;
  pfcDetailed?: string | null;
  linkedBankAccountId?: string | null;
  recurringCashflowId: string;
  frequency: string;
  direction: string;
  status: string;
  linkedBankAccount?: RecurringCashflowLinkedBankAccountResponse | null;
}

export interface RecurringCashflowLinkedBankAccountResponse {
  id: string;
  name: string;
  mask?: string | null;
  type?: string | null;
  subtype?: string | null;
}

export type RecurringCashflowStatusFilterId = "active" | "unlinked";

export const RECURRING_CASHFLOW_STATUS_FILTER_IDS: RecurringCashflowStatusFilterId[] =
  ["active", "unlinked"];

export type RecurringCashflowsFilterState = {
  accountIds?: string[];
  includeUnlinked?: boolean;
  pfcPrimaryList?: string[];
  statusList?: string[];
};
