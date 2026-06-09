import type { UserResponse } from "@/interface/user";

import { apiFetch, parseApiErrorMessage } from "./client";

export type { UserResponse } from "@/interface/user";

const BASE_URL = "/api/user" as const;

export async function ensureUserProfile(): Promise<UserResponse> {
  const res = await apiFetch(`${BASE_URL}/ensure`, { method: "POST" });
  if (!res.ok) throw new Error(await parseApiErrorMessage(res));
  return (await res.json()) as UserResponse;
}

export async function setProfileUsername(
  username: string,
): Promise<UserResponse> {
  const res = await apiFetch(`${BASE_URL}/username`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username }),
  });
  if (!res.ok) throw new Error(await parseApiErrorMessage(res));
  return (await res.json()) as UserResponse;
}

export async function markPasswordLoginEnabled(): Promise<UserResponse> {
  const res = await apiFetch(`${BASE_URL}/password-login-enabled`, {
    method: "POST",
  });
  if (!res.ok) throw new Error(await parseApiErrorMessage(res));
  return (await res.json()) as UserResponse;
}

export async function updateProfileAvatar(
  avatarUrl: string | null,
): Promise<UserResponse> {
  const res = await apiFetch(`${BASE_URL}/avatar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ avatarUrl }),
  });
  if (!res.ok) throw new Error(await parseApiErrorMessage(res));
  return (await res.json()) as UserResponse;
}

export const ensureUser = ensureUserProfile;
