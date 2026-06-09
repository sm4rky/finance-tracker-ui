"use client";

import { MyAccountSection } from "@/components/my-account-section";
import { NetWorthTrendChart } from "@/components/net-worth-trend-chart";
import { RecentTransactionsSection } from "@/components/recent-transactions-section";
import { useAuthStore } from "@/stores/auth-session";

export function DashboardView() {
  const profile = useAuthStore((state) => state.userProfile);
  const displayLine = profile?.fullName?.trim() || "";

  return (
    <div className="flex w-full min-w-0 flex-col gap-3 p-4 sm:gap-5 sm:p-6 md:p-8 lg:min-h-full">
      <div className="shrink-0">
        <div>
          <h1 className="font-heading text-2xl font-semibold">
            {displayLine ? `Hi ${displayLine}!` : "Hi!"}
            <span aria-hidden="true" className="ml-2 inline-block">
              👋
            </span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Review your financial overview.
          </p>
        </div>
      </div>

      <div className="grid w-full min-w-0 grid-cols-1 gap-3 2xl:min-h-0 2xl:flex-1 2xl:grid-cols-[25rem_minmax(0,1fr)] 2xl:items-stretch 2xl:gap-5 *:min-w-0">
        <MyAccountSection />

        <div className="grid min-w-0 grid-cols-1 gap-3 2xl:min-h-0 2xl:grid-rows-[minmax(0,1fr)_minmax(0,0.85fr)] 2xl:gap-5">
          <NetWorthTrendChart />

          <div className="grid min-w-0 grid-cols-1 gap-3 2xl:min-h-0 2xl:gap-5">
            <RecentTransactionsSection />
          </div>
        </div>
      </div>
    </div>
  );
}
