"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { useEffect } from "react";

import { ThemePreferenceSync } from "@/components/theme-preference-sync";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ensureUserProfile } from "@/lib/api/users";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-session";

const DEFAULT_STALE_MS = 60 * 1000;
const PLAID_CONNECTIONS_STALE_MS = 5 * 60 * 1000;

// Cùng cấu hình cho mọi QueryClient; không dùng module-level `const client = new QueryClient(...)`
// vì SSR cần client mới từng request, còn trình duyệt cần một client dùng lại (cache giữa lần điều hướng).
const queryClientConfig = {
  defaultOptions: {
    queries: {
      staleTime: DEFAULT_STALE_MS,
    },
  },
};

function createAppQueryClient(): QueryClient {
  const client = new QueryClient(queryClientConfig);
  client.setQueryDefaults(["list-plaid-connections"], {
    staleTime: PLAID_CONNECTIONS_STALE_MS,
  });
  return client;
}

/** Chỉ trên trình duyệt: một QueryClient dùng lại; môi trường server trả về `new` mỗi lần. */
let browserQueryClient: QueryClient | undefined;

function getQueryClient(): QueryClient {
  if (typeof window === "undefined") {
    return createAppQueryClient();
  }
  browserQueryClient ??= createAppQueryClient();
  return browserQueryClient;
}

/**
 * `userId` sau lần gọi `POST /ensure` thành công. Cùng user thì không gọi lại khi chỉ
 * refresh access token (tránh lặp request không cần thiết).
 */
let lastEnsuredUserId: string | null = null;

/**
 * Nếu khác `null`, đang có một lời gọi `ensureUserProfile()` (POST /ensure) chưa xong;
 * các lượt `runEnsure` khác cùng lúc sẽ `await` cùng promise này thay vì bắn thêm request.
 */
let ensureProfilePromise: Promise<void> | null = null;

/** Bọc app: React Query, theme, Supabase auth → store + `ensure` user. */
export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  // Lấy ref ổn định tới action store: mỗi lần session Supabase đổi, cập nhật token + user để toàn app
  // (ví dụ `apiFetch` đọc `accessToken`, component đọc `user`) và xóa khi đăng xuất.
  const setFromSession = useAuthStore((s) => s.setFromSession);
  // Ghi kết quả `POST /ensure`: dữ liệu hồ sơ trên API backend (tên hiển thị, …), không nằm trong JWT Supabase.
  const setUserProfile = useAuthStore((s) => s.setUserProfile);

  // Đồng bộ Zustand với session Supabase; sau đăng nhập gọi `ensure` để lấy/tạo user trên API.
  useEffect(() => {
    const supabase = createClient();

    /** Gọi `POST /api/users/ensure` tối đa mỗi user (và tối đa một request đồng thời). */
    const runEnsure = async (session: Session) => {
      const userId = session.user.id;
      if (lastEnsuredUserId === userId) {
        return;
      }
      if (ensureProfilePromise) {
        // Đang có request ensure; chờ xong rồi kiểm tra lại (có thể thành công hoặc cần thử lại).
        await ensureProfilePromise;
        if (lastEnsuredUserId === userId) {
          return;
        }
      }
      ensureProfilePromise = (async () => {
        try {
          const profile = await ensureUserProfile();
          setUserProfile(profile);
          lastEnsuredUserId = userId;
        } catch {
          lastEnsuredUserId = null;
          setUserProfile(null);
        } finally {
          ensureProfilePromise = null;
        }
      })();
      await ensureProfilePromise;
    };

    const applySession = async (session: Session | null) => {
      setFromSession(session);
      if (!session) {
        // Đăng xuất: cho phép lần đăng nhập tới gọi ensure lại từ đầu.
        lastEnsuredUserId = null;
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
        // Cập nhật store theo từng sự kiện (đăng nhập, refresh token, đăng xuất, …).
        void applySession(session);
      },
    );

    return () => {
      subscription.unsubscribe();
    };
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
        <TooltipProvider>
          {children}
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
