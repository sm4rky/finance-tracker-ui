import type {
  ProfileRecurringCashflowCalendarOccurrenceResponse,
  ProfileRecurringCashflowResponse,
  SaveProfileRecurringCashflowRequest,
} from "@/interface/profile-recurring-cashflow";

import { apiFetch, parseApiErrorMessage } from "./client";

const BASE_URL = "/api/profile-recurring-cashflow" as const;

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

export async function listProfileRecurringCashflowsCalendar(request: {
  dateFrom: string;
  dateTo: string;
}): Promise<ProfileRecurringCashflowCalendarOccurrenceResponse[]> {
  const params = new URLSearchParams();
  if (request.dateFrom?.trim()) params.set("dateFrom", request.dateFrom.trim());
  if (request.dateTo?.trim()) params.set("dateTo", request.dateTo.trim());
  const qs = params.toString();
  const res = await apiFetch(`${BASE_URL}/calendar${qs ? `?${qs}` : ""}`, {
    method: "GET",
  });

  if (!res.ok) {
    throw new Error(await parseApiErrorMessage(res));
  }

  const json: unknown = await res.json();
  if (!Array.isArray(json)) {
    return [];
  }
  return json as ProfileRecurringCashflowCalendarOccurrenceResponse[];
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

export async function deleteProfileRecurringCashflow(
  id: string,
): Promise<void> {
  const res = await apiFetch(`${BASE_URL}/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error(await parseApiErrorMessage(res));
  }
}
