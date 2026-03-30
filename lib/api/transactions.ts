import type { PagedResponse } from "@/interface/paged-response";
import type {
  QueryTransactionsRequest,
  TransactionResponse,
} from "@/interface/transaction";

import { apiFetch, parseApiErrorMessage } from "./client";

const BASE_URL = "/api/Transactions" as const;
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function buildTransactionsQuery(request: QueryTransactionsRequest = {}): string {
  const params = new URLSearchParams();

  params.set("page", String(Math.max(1, request.page ?? DEFAULT_PAGE)));
  params.set(
    "limit",
    String(Math.min(MAX_LIMIT, Math.max(1, request.limit ?? DEFAULT_LIMIT))),
  );

  for (const [key, value] of Object.entries(request)) {
    if (key === "page" || key === "limit") continue;
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

export async function queryTransactions(
  request: QueryTransactionsRequest = {},
): Promise<PagedResponse<TransactionResponse>> {
  const res = await apiFetch(`${BASE_URL}?${buildTransactionsQuery(request)}`, {
    method: "GET",
  });

  if (!res.ok) {
    throw new Error(await parseApiErrorMessage(res));
  }

  return (await res.json()) as PagedResponse<TransactionResponse>;
}