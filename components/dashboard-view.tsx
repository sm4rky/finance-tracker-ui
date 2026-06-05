"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { TransactionsDateFilter } from "@/components/transactions-date-filter";
import {
  TransactionsFilterPanels,
  TransactionsFilterTrigger,
} from "@/components/transactions-filter";
import { CategoryExpensePieChart } from "@/components/category-expense-pie-chart";
import { MyAccountSection } from "@/components/my-account-section";
import { NetWorthTrendChart } from "@/components/net-worth-trend-chart";
import { CategorySetDropdown } from "@/components/category-set-dropdown";
import { RecentTransactionsSection } from "@/components/recent-transactions-section";
import { AccountExpenseBarChart } from "@/components/account-expense-bar-chart";
import { CategoryExpenseBarChart } from "@/components/category-expense-bar-chart";
import { fetchCashflow } from "@/lib/api/analytics";
import { useAppliedTransactionsFilter } from "@/hooks/use-applied-transactions-filter";
import { useAuthStore } from "@/stores/auth-session";

export function DashboardView() {
  const {
    appliedFilter,
    filterKey,
    isFilterStoreHydrated,
  } = useAppliedTransactionsFilter();

  const { data: cashflow, isPending: isCashflowPending } = useQuery({
    queryKey: ["analytics-cashflow", filterKey],
    queryFn: () => fetchCashflow(appliedFilter),
    enabled:
      isFilterStoreHydrated &&
      Boolean(appliedFilter.dateFrom?.trim() && appliedFilter.dateTo?.trim()),
  });

  const [filtersOpen, setFiltersOpen] = useState(false);

  const profile = useAuthStore((state) => state.userProfile);
  const displayLine = profile?.fullName?.trim() || "";

  return (
    <div className="flex w-full min-w-0 flex-col gap-3 p-4 sm:gap-5 sm:p-6 md:p-8">
      <div className="flex w-full min-w-0 shrink-0 flex-col gap-3 sm:gap-4">
        <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <p className="min-w-0 flex-1 text-balance font-heading text-xl font-semibold leading-snug tracking-tight sm:text-2xl md:text-3xl">
            {displayLine ? `Hi ${displayLine}!` : "Hi!"}
            <span aria-hidden="true" className="ml-2 inline-block">
              👋
            </span>
          </p>
          <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
            <TransactionsDateFilter />
            <CategorySetDropdown />
            <TransactionsFilterTrigger
              open={filtersOpen}
              onOpenChange={setFiltersOpen}
            />
          </div>
        </div>
        <TransactionsFilterPanels
          open={filtersOpen}
          onOpenChange={setFiltersOpen}
        />
      </div>

      <div className="grid w-full min-w-0 shrink-0 grid-cols-1 gap-3 lg:grid-cols-[20rem_1fr] lg:items-stretch lg:gap-5 *:min-w-0">
        <MyAccountSection />
        <CategoryExpensePieChart
          totalExpenses={cashflow?.totalExpenses}
          expensesChangePercentFromPrevious={
            cashflow?.expensesChangePercentFromPrevious
          }
          cashflowLoading={isCashflowPending}
        />
      </div>

      <div className="grid w-full min-w-0 shrink-0 grid-cols-1 gap-3 lg:grid-cols-2 lg:items-stretch lg:gap-5 *:min-w-0">
        <CategoryExpenseBarChart />
        <AccountExpenseBarChart />
      </div>

      <div className="grid w-full min-w-0 shrink-0 grid-cols-1 gap-3 lg:grid-cols-[2fr_1fr] lg:items-stretch lg:gap-5 *:min-w-0">
        <NetWorthTrendChart />
        <RecentTransactionsSection />
      </div>
    </div>
  );
}
