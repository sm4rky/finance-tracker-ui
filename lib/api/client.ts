import type { Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-session";

/**
 * Một lượt `refreshSession()` đang chạy; mọi response 401 đồng thời sẽ chờ cùng
 * `Promise` này thay vì mỗi thứ tự gọi refresh.
 */
let refreshSessionSingleFlightPromise: Promise<Session | null> | null = null;

/** Chuỗi biến môi trường: cắt trắng thừa, bỏ bao ngoặc dư nếu có. */
function trimEnv(v: string | undefined): string | undefined {
  if (v == null) return undefined;
  const t = v
    .trim()
    .replace(/^["']|["']$/g, "")
    .trim();
  return t === "" ? undefined : t;
}

/**
 * Lấy URL gốc API từ `NEXT_PUBLIC_API_BASE_URL` (không dấu `/` cuối);
 * nếu chưa cấu hình thì trả về `null`.
 */
export function getApiBaseUrl(): string | null {
  const url = trimEnv(process.env.NEXT_PUBLIC_API_BASE_URL);
  return url ? url.replace(/\/$/, "") : null;
}

/**
 * Ghép `path` với base URL; `path` có thể tương đối hoặc `http(s)://` tuyệt đối.
 * @throws Nếu base URL chưa được cấu hình.
 */
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
 * Lấy (hoặc tạo) lượt refresh chung: với 401, nhiều lời gọi `apiFetch` không chạy
 * `refreshSession` trùng mà cùng chờ một lần làm mới.
 */
function getRefreshSessionSingleFlight(): Promise<Session | null> {
  if (refreshSessionSingleFlightPromise) {
    return refreshSessionSingleFlightPromise;
  }
  const run = (async (): Promise<Session | null> => {
    const supabase = createClient();
    const { data, error } = await supabase.auth.refreshSession();
    if (error || !data.session) {
      await supabase.auth.signOut();
      useAuthStore.getState().clear();
      return null;
    }
    useAuthStore.getState().setFromSession(data.session);
    return data.session;
  })();
  refreshSessionSingleFlightPromise = run;
  void run.finally(() => {
    refreshSessionSingleFlightPromise = null;
  });
  return run;
}

/**
 * `fetch` tới backend, gắn `Authorization: Bearer` từ store (token hiện tại).
 * Nhận **401**: cùng một lượt `refreshSession()` (single-flight), cập nhật session, rồi gửi lại **một lần**;
 * nếu vẫn **401** thì đăng xuất và xóa store.
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

  const session = await getRefreshSessionSingleFlight();
  if (!session) {
    // Refresh thất bại: trả về response 401 ban đầu (nếu vẫn cần đọc body ở caller).
    return res;
  }

  headers.set("Authorization", `Bearer ${session.access_token}`);
  res = await fetch(url, { ...init, headers });
  if (res.status === 401) {
    // Token mới mà vẫn 401: coi như phiên hết hạn, đăng xuất sạch.
    const supabase = createClient();
    await supabase.auth.signOut();
    useAuthStore.getState().clear();
  }
  return res;
}

/**
 * Trích thông điệp lỗi từ body (JSON) của `Response`, phục vụ `throw new Error` hoặc hiển thị toast.
 */
export async function parseApiErrorMessage(
  response: Response,
): Promise<string> {
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
