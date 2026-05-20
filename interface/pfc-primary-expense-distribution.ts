export interface PfcPrimaryExpenseSlice {
  pfcPrimary: string | null;
  totalExpenses: number;
}

export interface PfcPrimaryExpenseDistributionResponse {
  slices: PfcPrimaryExpenseSlice[];
}

