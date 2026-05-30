import type {
  PushSubscriptionResponse,
  UpsertPushSubscriptionRequest,
} from "@/interface/push-subscription";

import { apiFetch, parseApiErrorMessage } from "./client";

const BASE_URL = "/api/push-subscriptions" as const;

async function readListResponse<T>(res: Response): Promise<T[]> {
  const json: unknown = await res.json();
  return Array.isArray(json) ? (json as T[]) : [];
}

export async function listMyPushSubscriptions(): Promise<
  PushSubscriptionResponse[]
> {
  const res = await apiFetch(`${BASE_URL}/me`, { method: "GET" });

  if (!res.ok) {
    throw new Error(await parseApiErrorMessage(res));
  }

  return readListResponse<PushSubscriptionResponse>(res);
}

export async function upsertMyPushSubscription(
  body: UpsertPushSubscriptionRequest,
): Promise<PushSubscriptionResponse> {
  const res = await apiFetch(`${BASE_URL}/me`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(await parseApiErrorMessage(res));
  }

  return (await res.json()) as PushSubscriptionResponse;
}

export async function deleteMyPushSubscription(id: string): Promise<void> {
  const res = await apiFetch(`${BASE_URL}/me/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error(await parseApiErrorMessage(res));
  }
}
