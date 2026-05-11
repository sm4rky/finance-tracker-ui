import type { UserProfile } from "@/interface/user";

import { apiFetch, parseApiErrorMessage } from "./client";

export type { UserProfile } from "@/interface/user";

const BASE_URL = "/api/users" as const;

export async function ensureUserProfile(): Promise<UserProfile> {
  const res = await apiFetch(`${BASE_URL}/ensure`, { method: "POST" });
  if (!res.ok) throw new Error(await parseApiErrorMessage(res));
  return (await res.json()) as UserProfile;
}

export async function setProfileUsername(username: string): Promise<UserProfile> {
  const res = await apiFetch(`${BASE_URL}/username`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username }),
  });
  if (!res.ok) throw new Error(await parseApiErrorMessage(res));
  return (await res.json()) as UserProfile;
}

export async function markPasswordLoginEnabled(): Promise<UserProfile> {
  const res = await apiFetch(`${BASE_URL}/password-login-enabled`, {
    method: "POST",
  });
  if (!res.ok) throw new Error(await parseApiErrorMessage(res));
  return (await res.json()) as UserProfile;
}

export async function updateProfileAvatar(
  avatarUrl: string,
): Promise<UserProfile> {
  const res = await apiFetch(`${BASE_URL}/avatar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ avatarUrl }),
  });
  if (!res.ok) throw new Error(await parseApiErrorMessage(res));
  return (await res.json()) as UserProfile;
}

export const ensureUser = ensureUserProfile;
