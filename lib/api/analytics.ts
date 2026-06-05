import type { CashflowResponse } from "@/interface/cashflow";
import type {
  NetWorthTrendQueryRequest,
  NetWorthTrendResponse,
} from "@/interface/net-worth-trend";
import type { NetWorthResponse } from "@/interface/net-worth";
import type { CategoryExpenseDistributionResponse } from "@/interface/category-expense-distribution";
import type {
  GroupedExpensesByAccountRequest,
  GroupedExpensesByAccountResponse,
} from "@/interface/grouped-expenses-by-account";
import type {
  StackedExpensesByCategoryRequest,
  StackedExpensesByCategoryResponse,
} from "@/interface/stacked-expenses-by-category";
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

export async function fetchNetWorthTrend(
  request?: NetWorthTrendQueryRequest,
): Promise<NetWorthTrendResponse> {
  const params = new URLSearchParams();
  if (request?.dateFrom?.trim()) params.set("dateFrom", request.dateFrom.trim());
  if (request?.dateTo?.trim()) params.set("dateTo", request.dateTo.trim());
  const qs = params.toString();
  const res = await apiFetch(
    `${BASE_URL}/net-worth/history${qs ? `?${qs}` : ""}`,
    { method: "GET" },
  );
  if (!res.ok) throw new Error(await parseApiErrorMessage(res));
  return (await res.json()) as NetWorthTrendResponse;
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

export async function fetchCategoryExpenseDistribution(
  request: TransactionAnalyticsQueryRequest,
): Promise<CategoryExpenseDistributionResponse> {
  const res = await apiFetch(
    `${BASE_URL}/expense/category-distribution?${buildTransactionAnalyticsQuery(request)}`,
    { method: "GET" },
  );

  if (!res.ok) {
    throw new Error(await parseApiErrorMessage(res));
  }

  return (await res.json()) as CategoryExpenseDistributionResponse;
}

export async function fetchStackedExpensesByCategory(
  request: StackedExpensesByCategoryRequest,
): Promise<StackedExpensesByCategoryResponse> {
  const res = await apiFetch(
    `${BASE_URL}/expense/stacked-by-category?${buildTransactionAnalyticsQuery(request)}`,
    { method: "GET" },
  );

  if (!res.ok) {
    throw new Error(await parseApiErrorMessage(res));
  }

  return (await res.json()) as StackedExpensesByCategoryResponse;
}

export async function fetchGroupedExpensesByAccount(
  request: GroupedExpensesByAccountRequest,
): Promise<GroupedExpensesByAccountResponse> {
  const res = await apiFetch(
    `${BASE_URL}/expense/grouped-by-account?${buildTransactionAnalyticsQuery(request)}`,
    { method: "GET" },
  );

  if (!res.ok) {
    throw new Error(await parseApiErrorMessage(res));
  }

  return (await res.json()) as GroupedExpensesByAccountResponse;
}
