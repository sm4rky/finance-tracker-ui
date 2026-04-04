export type RecurringCashflowDirection = "inflow" | "outflow";

export type RecurringCashflowFrequency =
  | "UNKNOWN"
  | "WEEKLY"
  | "BIWEEKLY"
  | "SEMI_MONTHLY"
  | "MONTHLY"
  | "ANNUALLY"
  | "ONE_TIME";

/** Matches backend `RecurringCashflowLinkedBankAccountResponse`. */
export interface RecurringCashflowLinkedBankAccountResponse {
  id: string;
  name: string;
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
