import type {
  ProfileCustomCategorySetResponse,
  UpsertProfileCustomCategorySetRequest,
} from "@/interface/profile-custom-category";

import { apiFetch, parseApiErrorMessage } from "./client";

const BASE_URL = "/api/profile-custom-category-sets" as const;
const JSON_HEADERS = { "Content-Type": "application/json" } as const;

export async function listProfileCustomCategorySets(): Promise<
  ProfileCustomCategorySetResponse[]
> {
  const res = await apiFetch(BASE_URL, { method: "GET" });

  if (!res.ok) {
    throw new Error(await parseApiErrorMessage(res));
  }

  const json: unknown = await res.json();
  return Array.isArray(json) ? (json as ProfileCustomCategorySetResponse[]) : [];
}

export async function upsertProfileCustomCategorySet(
  body: UpsertProfileCustomCategorySetRequest,
): Promise<ProfileCustomCategorySetResponse> {
  const res = await apiFetch(`${BASE_URL}/upsert`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(await parseApiErrorMessage(res));
  }

  return (await res.json()) as ProfileCustomCategorySetResponse;
}

export async function deleteProfileCustomCategorySet(id: string): Promise<void> {
  const res = await apiFetch(`${BASE_URL}/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error(await parseApiErrorMessage(res));
  }
}
