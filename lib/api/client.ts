import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-session";

function trimEnv(v: string | undefined): string | undefined {
  if (v == null) return undefined;
  const t = v.trim().replace(/^["']|["']$/g, "").trim();
  return t === "" ? undefined : t;
}

export function getApiBaseUrl(): string | null {
  const url = trimEnv(process.env.NEXT_PUBLIC_API_BASE_URL);
  return url ? url.replace(/\/$/, "") : null;
}

/** Path relative to `NEXT_PUBLIC_API_BASE_URL`, or an absolute `http(s)` URL. */
export function buildApiUrl(path: string): string {
  const base = getApiBaseUrl();
  if (!base) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not set.");
  }
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

/**
 * `fetch` to the backend API with `Authorization: Bearer` from the auth store.
 * On **401**: `refreshSession()` once, retry once; still **401** → sign out + clear store.
 */
export async function apiFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const headers = new Headers(init.headers);
  const token = useAuthStore.getState().accessToken;
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const url = buildApiUrl(path);
  let res = await fetch(url, { ...init, headers });

  if (res.status !== 401) {
    return res;
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.refreshSession();
  if (error || !data.session) {
    await supabase.auth.signOut();
    useAuthStore.getState().clear();
    return res;
  }

  useAuthStore.getState().setFromSession(data.session);
  headers.set("Authorization", `Bearer ${data.session.access_token}`);
  res = await fetch(url, { ...init, headers });
  if (res.status === 401) {
    await supabase.auth.signOut();
    useAuthStore.getState().clear();
  }
  return res;
}

export async function parseApiErrorMessage(response: Response): Promise<string> {
  const text = await response.text().catch(() => "");
  if (!text.trim()) {
    return `Request failed (${response.status})`;
  }
  try {
    const data = JSON.parse(text) as {
      message?: string;
      detail?: string;
      title?: string;
    };
    return data.message ?? data.detail ?? data.title ?? text;
  } catch {
    return text;
  }
}
