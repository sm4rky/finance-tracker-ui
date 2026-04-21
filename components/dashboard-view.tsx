"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { TransactionsDateFilter } from "@/components/transactions-date-filter";
import {
  getDefaultTransactionsFilter,
  sanitizeTransactionsFilter,
  TransactionsFilterPanels,
  TransactionsFilterTrigger,
  useTransactionsFilter,
} from "@/components/transactions-filter";
import { CategoryExpensePieChart } from "@/components/category-expense-pie-chart";
import { MyAccountSection } from "@/components/my-account-section";
import { AccountExpenseBarChart } from "@/components/account-expense-bar-chart";
import { CategoryExpenseBarChart } from "@/components/category-expense-bar-chart";
import type { TransactionsFilterState } from "@/interface/transaction";
import { fetchCashflow } from "@/lib/api/analytics";
import { listPlaidConnections } from "@/lib/api/plaid";
import { useAuthStore } from "@/stores/auth-session";
import { useTransactionsFilterStore } from "@/stores/transactions-filter";

export function DashboardView() {
  const [isFilterStoreHydrated, setIsFilterStoreHydrated] = useState(false);

  useEffect(() => {
    const store = useTransactionsFilterStore;

    if (store.persist.hasHydrated()) {
      setIsFilterStoreHydrated(true);
      return;
    }

    const unsubscribe = store.persist.onFinishHydration(() => {
      setIsFilterStoreHydrated(true);
    });

    return unsubscribe;
  }, []);

  const storedAppliedFilter = useTransactionsFilterStore(
    (state) => state.appliedFilter,
  );
  const setAppliedFilter = useTransactionsFilterStore(
    (state) => state.setAppliedFilter,
  );

  const plaidConnectionsQuery = useQuery({
    queryKey: ["list-plaid-connections"],
    queryFn: listPlaidConnections,
  });

  const allBanks = plaidConnectionsQuery.data ?? [];

  const activeBanks = useMemo(
    () => allBanks.filter((bank) => bank.status === "active" || bank.status === "relink_required"),
    [allBanks],
  );

  const appliedFilter = useMemo(() => {
    if (!isFilterStoreHydrated) {
      return getDefaultTransactionsFilter(undefined);
    }

    return sanitizeTransactionsFilter(
      storedAppliedFilter ?? getDefaultTransactionsFilter(activeBanks),
      activeBanks,
    );
  }, [isFilterStoreHydrated, storedAppliedFilter, activeBanks]);

  const filterKey = JSON.stringify(appliedFilter);

  const { data: cashflow, isPending: isCashflowPending } = useQuery({
    queryKey: ["analytics-cashflow", filterKey],
    queryFn: () => fetchCashflow(appliedFilter),
    enabled: isFilterStoreHydrated,
  });

  const handleApplyFilter = useCallback(
    (nextFilter: TransactionsFilterState) => {
      setAppliedFilter(nextFilter, activeBanks);
    },
    [setAppliedFilter, activeBanks],
  );

  const { triggerProps, panelsProps } = useTransactionsFilter({
    banks: activeBanks,
    applied: appliedFilter,
    onApply: handleApplyFilter,
  });

  const profile = useAuthStore((state) => state.userProfile);
  const displayLine = profile?.fullName?.trim() || "";

  return (
    <div className="flex w-full min-w-0 flex-col gap-3 p-4 sm:gap-5 sm:p-6 md:p-8">
      <div className="flex w-full min-w-0 shrink-0 flex-col gap-3 sm:gap-4">
        <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <p className="min-w-0 flex-1 text-balance font-heading text-xl font-semibold leading-snug tracking-tight sm:text-2xl md:text-3xl">
            {displayLine ? `Hi ${displayLine}!` : "Hi!"}
          </p>
          <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
            <TransactionsDateFilter
              banks={activeBanks}
              isStoreReady={isFilterStoreHydrated}
            />
            <TransactionsFilterTrigger {...triggerProps} />
          </div>
        </div>
        <TransactionsFilterPanels {...panelsProps} />
      </div>

      <div className="grid w-full min-w-0 shrink-0 grid-cols-1 gap-3 lg:grid-cols-2 lg:items-stretch lg:gap-5">
        <MyAccountSection />
        <CategoryExpensePieChart
          totalExpenses={cashflow?.totalExpenses}
          expensesChangePercentFromPrevious={
            cashflow?.expensesChangePercentFromPrevious
          }
          cashflowLoading={isCashflowPending}
        />
      </div>

      <div className="grid w-full min-w-0 shrink-0 grid-cols-1 gap-3 lg:grid-cols-2 lg:items-stretch lg:gap-5">
        <CategoryExpenseBarChart />
        <AccountExpenseBarChart />
      </div>
    </div>
  );
}
