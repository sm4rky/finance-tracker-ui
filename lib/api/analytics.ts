import type { NetWorthResponse } from "@/interface/net-worth";

import { apiFetch, parseApiErrorMessage } from "./client";

const BASE_URL = "/api/Analytics" as const;

export async function fetchNetWorth(): Promise<NetWorthResponse> {
  const res = await apiFetch(`${BASE_URL}/net-worth`, { method: "GET" });
  if (!res.ok) throw new Error(await parseApiErrorMessage(res));
  return (await res.json()) as NetWorthResponse;
}
