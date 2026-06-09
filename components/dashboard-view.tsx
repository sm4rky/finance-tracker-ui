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
  const { appliedFilter, filterKey, isFilterStoreHydrated } =
    useAppliedTransactionsFilter();

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
      <div className="flex flex-wrap items-center justify-between gap-3">
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
        <div className="flex flex-wrap items-center gap-2">
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
