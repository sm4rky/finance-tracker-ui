import type {
  CreateProfileBudgetRequest,
  ProfileBudgetPeriodResponse,
  ProfileBudgetResponse,
  UpdateProfileBudgetActiveRequest,
  UpdateProfileBudgetRequest,
} from "@/interface/profile-budget";

import { apiFetch, parseApiErrorMessage } from "./client";

const BASE_URL = "/api/profile-budgets" as const;

export async function listProfileBudgets(): Promise<ProfileBudgetResponse[]> {
  const res = await apiFetch(BASE_URL, { method: "GET" });

  if (!res.ok) {
    throw new Error(await parseApiErrorMessage(res));
  }

  const json: unknown = await res.json();
  return Array.isArray(json) ? (json as ProfileBudgetResponse[]) : [];
}

export async function getProfileBudget(
  id: string,
): Promise<ProfileBudgetResponse> {
  const res = await apiFetch(`${BASE_URL}/${encodeURIComponent(id)}`, {
    method: "GET",
  });

  if (!res.ok) {
    throw new Error(await parseApiErrorMessage(res));
  }

  return (await res.json()) as ProfileBudgetResponse;
}

export async function listProfileBudgetPeriods(
  id: string,
): Promise<ProfileBudgetPeriodResponse[]> {
  const res = await apiFetch(`${BASE_URL}/${encodeURIComponent(id)}/periods`, {
    method: "GET",
  });

  if (!res.ok) {
    throw new Error(await parseApiErrorMessage(res));
  }

  const json: unknown = await res.json();
  return Array.isArray(json) ? (json as ProfileBudgetPeriodResponse[]) : [];
}

export async function createProfileBudget(
  body: CreateProfileBudgetRequest,
): Promise<ProfileBudgetResponse> {
  const res = await apiFetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(await parseApiErrorMessage(res));
  }

  return (await res.json()) as ProfileBudgetResponse;
}

export async function updateProfileBudget(
  id: string,
  body: UpdateProfileBudgetRequest,
): Promise<ProfileBudgetResponse> {
  const res = await apiFetch(`${BASE_URL}/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(await parseApiErrorMessage(res));
  }

  return (await res.json()) as ProfileBudgetResponse;
}

export async function updateProfileBudgetActive(
  id: string,
  body: UpdateProfileBudgetActiveRequest,
): Promise<ProfileBudgetResponse> {
  const res = await apiFetch(`${BASE_URL}/${encodeURIComponent(id)}/active`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(await parseApiErrorMessage(res));
  }

  return (await res.json()) as ProfileBudgetResponse;
}

export async function deleteProfileBudget(id: string): Promise<void> {
  const res = await apiFetch(`${BASE_URL}/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error(await parseApiErrorMessage(res));
  }
}
