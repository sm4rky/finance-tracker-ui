import type {
  ProfileRecurringCashflowResponse,
  SaveProfileRecurringCashflowRequest,
} from "@/interface/profile-recurring-cashflow";

import { apiFetch, parseApiErrorMessage } from "./client";

const BASE_URL = "/api/profile-recurring-cashflows" as const;

export async function listProfileRecurringCashflows(): Promise<
  ProfileRecurringCashflowResponse[]
> {
  const res = await apiFetch(BASE_URL, { method: "GET" });

  if (!res.ok) {
    throw new Error(await parseApiErrorMessage(res));
  }

  const json: unknown = await res.json();
  if (Array.isArray(json)) {
    return json as ProfileRecurringCashflowResponse[];
  }
  if (
    json &&
    typeof json === "object" &&
    "items" in json &&
    Array.isArray((json as { items: unknown }).items)
  ) {
    return (json as { items: ProfileRecurringCashflowResponse[] }).items;
  }
  return [];
}

export async function getProfileRecurringCashflow(
  id: string,
): Promise<ProfileRecurringCashflowResponse> {
  const res = await apiFetch(`${BASE_URL}/${encodeURIComponent(id)}`, {
    method: "GET",
  });

  if (!res.ok) {
    throw new Error(await parseApiErrorMessage(res));
  }

  return (await res.json()) as ProfileRecurringCashflowResponse;
}

export async function createProfileRecurringCashflow(
  body: SaveProfileRecurringCashflowRequest,
): Promise<ProfileRecurringCashflowResponse> {
  const res = await apiFetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(await parseApiErrorMessage(res));
  }

  return (await res.json()) as ProfileRecurringCashflowResponse;
}

export async function updateProfileRecurringCashflow(
  id: string,
  body: SaveProfileRecurringCashflowRequest,
): Promise<ProfileRecurringCashflowResponse> {
  const res = await apiFetch(`${BASE_URL}/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(await parseApiErrorMessage(res));
  }

  return (await res.json()) as ProfileRecurringCashflowResponse;
}

export async function deleteProfileRecurringCashflow(id: string): Promise<void> {
  const res = await apiFetch(`${BASE_URL}/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error(await parseApiErrorMessage(res));
  }
}
