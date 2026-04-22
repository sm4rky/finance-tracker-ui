import type { TransactionResponse } from "@/interface/transaction";

export type TransactionCashFlow = "in" | "out" | "neutral";

export function getTransactionCashFlow(
  row: Pick<TransactionResponse, "amount">,
): TransactionCashFlow {
  if (row.amount === 0) return "neutral";
  return row.amount < 0 ? "in" : "out";
}

export function formatMoneyAbs(
  absAmount: number,
  currency?: string | null,
): string {
  const code = currency?.toUpperCase() || "USD";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: code,
    }).format(absAmount);
  } catch {
    return absAmount.toFixed(2);
  }
}
