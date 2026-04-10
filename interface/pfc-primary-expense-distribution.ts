export interface PfcPrimaryExpenseDistributionResponse {
  slices: PfcPrimaryExpenseSlice[];
}

export interface PfcPrimaryExpenseSlice {
  pfcPrimary: string | null;
  totalExpenses: number;
}

