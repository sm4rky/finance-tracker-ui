import type { PagedResponse } from "@/interface/paged-response";
import type {
  QueryTransactionsRequest,
  TransactionResponse,
} from "@/interface/transaction";

import { apiFetch, parseApiErrorMessage } from "./client";

const BASE_URL = "/api/Transactions" as const;

export async function queryTransactions(
  request: QueryTransactionsRequest,
): Promise<PagedResponse<TransactionResponse>> {
  const page = Math.max(1, request.page);
  const limit = Math.min(100, Math.max(1, request.limit));
  const q = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (request.sortBy) {
    q.set("sortBy", request.sortBy);
    if (request.sortDirection === "asc" || request.sortDirection === "desc") {
      q.set("sortDirection", request.sortDirection);
    }
  }
  const res = await apiFetch(`${BASE_URL}?${q.toString()}`, { method: "GET" });
  if (!res.ok) throw new Error(await parseApiErrorMessage(res));
  return (await res.json()) as PagedResponse<TransactionResponse>;
}
