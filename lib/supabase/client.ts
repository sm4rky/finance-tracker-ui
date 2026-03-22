import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | undefined;

function oauthRedirectBase(originFallback: string): string {
  const full = process.env.NEXT_PUBLIC_AUTH_CALLBACK_URL?.replace(/\/$/, "");
  if (full) return full;
  const site = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  const raw = process.env.NEXT_PUBLIC_AUTH_CALLBACK_PATH ?? "/api/auth/callback";
  const path = raw.startsWith("/") ? raw : `/${raw}`;
  return `${site ?? originFallback}${path}`;
}

/**
 * Browser-only singleton. Session refresh + `onAuthStateChange` stay on one instance.
 * On the server use `@/lib/supabase/server`.
 */
export function createClient(): SupabaseClient {
  if (typeof window === "undefined") {
    throw new Error(
      "createClient() is browser-only. Use @/lib/supabase/server on the server.",
    );
  }
  if (!browserClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) {
      throw new Error(
        "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
      );
    }
    browserClient = createBrowserClient(url, key);
  }
  return browserClient;
}

export async function signInWithGoogle(options?: { next?: string }) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    return {
      data: { provider: "google" as const, url: null },
      error: new Error(
        "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
      ),
    };
  }

  const supabase = createClient();
  const next = options?.next ?? "/dashboard";
  const redirectTo = `${oauthRedirectBase(window.location.origin)}?next=${encodeURIComponent(next)}`;

  return supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo },
  });
}
