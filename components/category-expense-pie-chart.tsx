"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { EChartsOption } from "echarts";
import ReactECharts from "echarts-for-react";
import { useTheme } from "next-themes";

import {
  getDefaultTransactionsFilter,
  getPfcCategoryMeta,
  sanitizeTransactionsFilter,
} from "@/components/transactions-filter";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchPfcPrimaryExpenseDistribution } from "@/lib/api/analytics";
import { listPlaidConnections } from "@/lib/api/plaid";
import { useTransactionsFilterStore } from "@/stores/transactions-filter";

function formatUsdTooltip(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function sliceDisplayName(pfcPrimary: string | null): string {
  if (pfcPrimary == null || pfcPrimary === "") {
    return "Uncategorized";
  }
  return getPfcCategoryMeta(pfcPrimary).displayName;
}

export function CategoryExpensePieChart() {
  const { resolvedTheme } = useTheme();
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

  const { data: plaidConnections } = useQuery({
    queryKey: ["list-plaid-connections"],
    queryFn: listPlaidConnections,
  });

  const banks = plaidConnections ?? [];

  const appliedFilter = useMemo(() => {
    if (!isFilterStoreHydrated) {
      return getDefaultTransactionsFilter(undefined);
    }

    return sanitizeTransactionsFilter(
      storedAppliedFilter ?? getDefaultTransactionsFilter(banks),
      banks,
    );
  }, [isFilterStoreHydrated, storedAppliedFilter, banks]);

  const filterKey = JSON.stringify(appliedFilter);

  const { data: expenseDistribution, isPending, isError } = useQuery({
    queryKey: ["analytics-pfc-expense-distribution", filterKey],
    queryFn: () => fetchPfcPrimaryExpenseDistribution(appliedFilter),
    enabled: isFilterStoreHydrated,
  });

  const expenseSlices = useMemo(() => {
    const slices = expenseDistribution?.slices ?? [];
    return slices.filter((s) => s.totalExpenses > 0);
  }, [expenseDistribution?.slices]);

  const chartOption = useMemo((): EChartsOption | null => {
    const seriesData = expenseSlices.map((s) => ({
      name: sliceDisplayName(s.pfcPrimary),
      value: s.totalExpenses,
    }));

    if (seriesData.length === 0) return null;

    return {
      tooltip: {
        trigger: "item",
        renderMode: "html",
        appendToBody: true,
        confine: true,
        backgroundColor: "var(--popover)",
        borderColor: "var(--border)",
        borderWidth: 1,
        padding: [8, 12],
        textStyle: {
          color: "var(--popover-foreground)",
          fontSize: 12,
        },
        valueFormatter: (value) =>
          formatUsdTooltip(typeof value === "number" ? value : Number(value)),
      },
      legend: {
        orient: "vertical",
        type: "scroll",
        right: 0,
        top: "middle",
        height: "72%",
        width: 72,
        itemGap: 8,
        itemWidth: 12,
        itemHeight: 12,
        textStyle: {
          fontSize: 12,
          color: "var(--card-foreground)",
          overflow: "truncate",
          width: 96,
        },
        pageIconColor: "var(--muted-foreground)",
        pageIconInactiveColor: "var(--muted-foreground)",
        pageTextStyle: {
          color: "var(--muted-foreground)",
          fontSize: 9,
        },
        pageButtonItemGap: 6,
        animationDurationUpdate: 200,
      },
      series: [
        {
          type: "pie",
          center: ["35%", "50%"],
          radius: ["0%", "70%"],
          label: { show: false },
          labelLine: { show: false },
          emphasis: {
            scale: true,
            scaleSize: 6,
          },
          itemStyle: {
            borderRadius: 8,
            borderColor: "var(--card)",
            borderWidth: 2,
          },
          data: seriesData,
        },
      ],
    };
  }, [expenseSlices, resolvedTheme]);

  const showSkeleton = !isFilterStoreHydrated || isPending;

  return (
    <section className="flex h-full min-h-0 max-h-92 flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm sm:max-h-92">
      <header className="shrink-0 px-3 py-2.5 sm:px-4 sm:py-3">
        <h2 className="font-heading text-base font-semibold tracking-tight sm:text-lg">
          Expense by Category
        </h2>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden overscroll-contain px-2 pb-3 sm:px-3 sm:pb-4">
        {showSkeleton ? (
          <Skeleton className="mx-auto min-h-48 w-full max-w-xl flex-1 rounded-lg" />
        ) : isError || chartOption == null ? (
          <p className="flex min-h-48 flex-1 items-center justify-center px-2 py-8 text-center text-sm text-muted-foreground">
            No expense data for this period.
          </p>
        ) : (
          <div className="relative mx-auto flex min-h-48 w-full max-w-xl flex-1 flex-col">
            <ReactECharts
              option={chartOption}
              className="min-h-0 flex-1"
              style={{ height: "100%", width: "100%", minHeight: 0 }}
              opts={{ renderer: "svg" }}
              aria-label="Expense distribution chart"
            />
          </div>
        )}
      </div>
    </section>
  );
}
