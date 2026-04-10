"use client";

import { useAuthStore } from "@/stores/auth-session";

import { MyAccountSection } from "@/components/my-account-section";

export function DashboardView() {
  const profile = useAuthStore((s) => s.userProfile);
  const displayLine = profile?.fullName?.trim() || "";

  return (
    <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col gap-6 p-4 sm:gap-8 sm:p-6 md:p-8">
      <p className="text-balance font-heading text-xl font-semibold leading-snug tracking-tight sm:text-2xl md:text-3xl">
        {displayLine ? `Hi ${displayLine}!` : "Hi!"}
      </p>

      <MyAccountSection className="min-h-0 flex-1" />
    </div>
  );
}
