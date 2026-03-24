"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { useEffect } from "react";

import { ThemePreferenceSync } from "@/components/theme-preference-sync";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ensureUserProfile } from "@/lib/api/users";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-session";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (typeof window === "undefined") {
    return makeQueryClient();
  }
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}

/** Dedupe `ensure` for the same access token (Strict Mode / duplicate auth events). */
let lastEnsureKey: string | null = null;

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  const setFromSession = useAuthStore((s) => s.setFromSession);
  const setUserProfile = useAuthStore((s) => s.setUserProfile);

  useEffect(() => {
    const supabase = createClient();

    const runEnsure = async (session: Session) => {
      const key = `${session.user.id}:${session.access_token}`;
      if (lastEnsureKey === key) return;
      lastEnsureKey = key;
      try {
        const profile = await ensureUserProfile();
        setUserProfile(profile);
      } catch {
        lastEnsureKey = null;
        setUserProfile(null);
      }
    };

    const applySession = async (session: Session | null) => {
      setFromSession(session);
      if (!session) {
        lastEnsureKey = null;
        return;
      }
      if (session.access_token && session.user) {
        await runEnsure(session);
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        void applySession(session);
      },
    );

    return () => subscription.unsubscribe();
  }, [setFromSession, setUserProfile]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
        disableTransitionOnChange
      >
        <ThemePreferenceSync />
        <TooltipProvider>{children}</TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
