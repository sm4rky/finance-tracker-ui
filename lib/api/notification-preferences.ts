import type { ProfileNotificationPreferenceResponse } from "@/interface/notification-preferences";

import { apiFetch, parseApiErrorMessage } from "./client";

const BASE_URL = "/api/notification-preferences" as const;

export async function getMyNotificationPreferences(): Promise<ProfileNotificationPreferenceResponse> {
  const res = await apiFetch(`${BASE_URL}/me`, { method: "GET" });

  if (!res.ok) {
    throw new Error(await parseApiErrorMessage(res));
  }

  return (await res.json()) as ProfileNotificationPreferenceResponse;
}

export async function patchEmailEnabled(
  enabled: boolean,
): Promise<ProfileNotificationPreferenceResponse> {
  const res = await apiFetch(`${BASE_URL}/me/email-enabled`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ enabled }),
  });

  if (!res.ok) {
    throw new Error(await parseApiErrorMessage(res));
  }

  return (await res.json()) as ProfileNotificationPreferenceResponse;
}

export async function patchDueReminderEnabled(
  enabled: boolean,
): Promise<ProfileNotificationPreferenceResponse> {
  const res = await apiFetch(`${BASE_URL}/me/due-reminder-enabled`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ enabled }),
  });

  if (!res.ok) {
    throw new Error(await parseApiErrorMessage(res));
  }

  return (await res.json()) as ProfileNotificationPreferenceResponse;
}

export async function patchReminderDaysBefore(
  days: number,
): Promise<ProfileNotificationPreferenceResponse> {
  const res = await apiFetch(`${BASE_URL}/me/reminder-days-before`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ days }),
  });

  if (!res.ok) {
    throw new Error(await parseApiErrorMessage(res));
  }

  return (await res.json()) as ProfileNotificationPreferenceResponse;
}

export async function patchBudgetAlertEnabled(
  enabled: boolean,
): Promise<ProfileNotificationPreferenceResponse> {
  const res = await apiFetch(`${BASE_URL}/me/budget-alert-enabled`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ enabled }),
  });

  if (!res.ok) {
    throw new Error(await parseApiErrorMessage(res));
  }

  return (await res.json()) as ProfileNotificationPreferenceResponse;
}

export async function patchBudgetAlertThreshold(
  threshold: number,
): Promise<ProfileNotificationPreferenceResponse> {
  const res = await apiFetch(`${BASE_URL}/me/budget-alert-threshold`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ threshold }),
  });

  if (!res.ok) {
    throw new Error(await parseApiErrorMessage(res));
  }

  return (await res.json()) as ProfileNotificationPreferenceResponse;
}

export async function patchMonthlyStatementEnabled(
  enabled: boolean,
): Promise<ProfileNotificationPreferenceResponse> {
  const res = await apiFetch(`${BASE_URL}/me/monthly-statement-enabled`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ enabled }),
  });

  if (!res.ok) {
    throw new Error(await parseApiErrorMessage(res));
  }

  return (await res.json()) as ProfileNotificationPreferenceResponse;
}
