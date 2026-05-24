import type {
  SubscriptionPaymentHistoryResponse,
  SubscriptionPaymentResponse,
  SubscriptionPlanResponse,
} from "@/interface/plan";

import { apiFetch, parseApiErrorMessage } from "./client";

const BASE_URL = "/api/plan" as const;

async function readListResponse<T>(res: Response): Promise<T[]> {
  const json: unknown = await res.json();
  return Array.isArray(json) ? (json as T[]) : [];
}

export async function listSubscriptionPlans(): Promise<
  SubscriptionPlanResponse[]
> {
  const res = await apiFetch(BASE_URL, { method: "GET" });

  if (!res.ok) {
    throw new Error(await parseApiErrorMessage(res));
  }

  return readListResponse<SubscriptionPlanResponse>(res);
}

export async function listAllSubscriptionPayments(): Promise<
  SubscriptionPaymentResponse[]
> {
  const res = await apiFetch(`${BASE_URL}/payment`, { method: "GET" });

  if (!res.ok) {
    throw new Error(await parseApiErrorMessage(res));
  }

  return readListResponse<SubscriptionPaymentResponse>(res);
}

export async function listMySubscriptionPayments(): Promise<
  SubscriptionPaymentResponse[]
> {
  const res = await apiFetch(`${BASE_URL}/payment/me`, { method: "GET" });

  if (!res.ok) {
    throw new Error(await parseApiErrorMessage(res));
  }

  return readListResponse<SubscriptionPaymentResponse>(res);
}

export async function listProfileSubscriptionPayments(
  profileId: string,
): Promise<SubscriptionPaymentResponse[]> {
  const res = await apiFetch(
    `${BASE_URL}/payment/${encodeURIComponent(profileId)}`,
    { method: "GET" },
  );

  if (!res.ok) {
    throw new Error(await parseApiErrorMessage(res));
  }

  return readListResponse<SubscriptionPaymentResponse>(res);
}

export async function listAllSubscriptionPaymentHistory(): Promise<
  SubscriptionPaymentHistoryResponse[]
> {
  const res = await apiFetch(`${BASE_URL}/payment-history`, { method: "GET" });

  if (!res.ok) {
    throw new Error(await parseApiErrorMessage(res));
  }

  return readListResponse<SubscriptionPaymentHistoryResponse>(res);
}

export async function listMySubscriptionPaymentHistory(): Promise<
  SubscriptionPaymentHistoryResponse[]
> {
  const res = await apiFetch(`${BASE_URL}/payment-history/me`, {
    method: "GET",
  });

  if (!res.ok) {
    throw new Error(await parseApiErrorMessage(res));
  }

  return readListResponse<SubscriptionPaymentHistoryResponse>(res);
}

export async function listProfileSubscriptionPaymentHistory(
  profileId: string,
): Promise<SubscriptionPaymentHistoryResponse[]> {
  const res = await apiFetch(
    `${BASE_URL}/payment-history/${encodeURIComponent(profileId)}`,
    { method: "GET" },
  );

  if (!res.ok) {
    throw new Error(await parseApiErrorMessage(res));
  }

  return readListResponse<SubscriptionPaymentHistoryResponse>(res);
}
