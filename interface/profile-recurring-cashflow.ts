export type RecurringCashflowDirection = "inflow" | "outflow";

export type RecurringCashflowFrequency =
  | "UNKNOWN"
  | "WEEKLY"
  | "BIWEEKLY"
  | "SEMI_MONTHLY"
  | "MONTHLY"
  | "ANNUALLY"
  | "ONE_TIME";

export interface RecurringCashflowLinkedBankAccountResponse {
  id: string;
  accountName?: string | null;
  officialName?: string | null;
  mask?: string | null;
  type?: string | null;
  subtype?: string | null;
}

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
  merchantName: string | null;
  description: string;
  pfcPrimary: string | null;
  pfcDetailed: string | null;
  direction: RecurringCashflowDirection;
  frequency: RecurringCashflowFrequency;
  status: string;
  lastAmount: number | null;
  expectedAmount: number;
  expectedAmountUserSet?: boolean;
  plaidStreamId: string | null;
  firstDate: string | null;
  lastDate: string | null;
  predictedNextDate: string | null;
  linkedBankAccount?: RecurringCashflowLinkedBankAccountResponse | null;
}

export interface ProfileRecurringCashflowCalendarOccurrenceResponse {
  date: string;
  amount: number;
  merchantName?: string | null;
  description?: string | null;
  pfcPrimary?: string | null;
  pfcDetailed?: string | null;
  recurringCashflowId: string;
  frequency: string;
  direction: string;
  status: string;
  linkedBankAccount?: RecurringCashflowLinkedBankAccountResponse | null;
}
