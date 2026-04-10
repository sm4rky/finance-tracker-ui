import type { CashflowResponse } from "@/interface/cashflow";
import type { PfcPrimaryExpenseDistributionResponse } from "@/interface/pfc-primary-expense-distribution";
import type { NetWorthResponse } from "@/interface/net-worth";
import type { TransactionAnalyticsQueryRequest } from "@/interface/transaction-analytics";

import { apiFetch, parseApiErrorMessage } from "./client";

const BASE_URL = "/api/Analytics" as const;

function buildTransactionAnalyticsQuery(
  request: TransactionAnalyticsQueryRequest,
): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(request)) {
    if (value == null) continue;

    if (Array.isArray(value)) {
      for (const item of value) {
        const s = String(item);
        if (s !== "") params.append(key, s);
      }
      continue;
    }

    const s = String(value);
    if (s !== "") params.set(key, s);
  }

  return params.toString();
}

export async function fetchNetWorth(): Promise<NetWorthResponse> {
  const res = await apiFetch(`${BASE_URL}/net-worth`, { method: "GET" });
  if (!res.ok) throw new Error(await parseApiErrorMessage(res));
  return (await res.json()) as NetWorthResponse;
}

export async function fetchCashflow(
  request: TransactionAnalyticsQueryRequest,
): Promise<CashflowResponse> {
  const res = await apiFetch(
    `${BASE_URL}/cashflow?${buildTransactionAnalyticsQuery(request)}`,
    { method: "GET" },
  );

  if (!res.ok) {
    throw new Error(await parseApiErrorMessage(res));
  }

  return (await res.json()) as CashflowResponse;
}

export async function fetchPfcPrimaryExpenseDistribution(
  request: TransactionAnalyticsQueryRequest,
): Promise<PfcPrimaryExpenseDistributionResponse> {
  const res = await apiFetch(
    `${BASE_URL}/pfc-primary/expense-distribution?${buildTransactionAnalyticsQuery(request)}`,
    { method: "GET" },
  );

  if (!res.ok) {
    throw new Error(await parseApiErrorMessage(res));
  }

  return (await res.json()) as PfcPrimaryExpenseDistributionResponse;
}
