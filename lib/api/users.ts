import type { UserProfile } from "@/interface/user";

import { apiFetch, parseApiErrorMessage } from "./client";

export type { UserProfile } from "@/interface/user";

/**
 * `POST /api/users/ensure` — idempotent; 200 = JSON `UserProfile`.
 * Bearer token from the auth store (`apiFetch`).
 */
export async function ensureUserProfile(): Promise<UserProfile> {
  const res = await apiFetch("/api/users/ensure", { method: "POST" });
  if (!res.ok) throw new Error(await parseApiErrorMessage(res));
  return (await res.json()) as UserProfile;
}

export const ensureUser = ensureUserProfile;
