export interface CashflowResponse {
  totalIncome: number;
  incomeChangePercentFromPrevious: number | null;
  totalExpenses: number;
  expensesChangePercentFromPrevious: number | null;
  savingsRate: number | null;
  savingsRateChangePercentFromPrevious: number | null;
}
