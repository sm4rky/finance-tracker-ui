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
import { cn } from "@/lib/utils";
import { useTransactionsFilterStore } from "@/stores/transactions-filter";

function formatUsdTooltip(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatSignedPercent(roundedToOneDecimal: number): string {
  const sign = roundedToOneDecimal > 0 ? "+" : "";
  return `${sign}${roundedToOneDecimal.toFixed(1)}%`;
}

function sliceDisplayName(pfcPrimary: string | null): string {
  if (pfcPrimary == null || pfcPrimary === "") {
    return "Uncategorized";
  }
  return getPfcCategoryMeta(pfcPrimary).displayName;
}

export type CategoryExpensePieChartProps = {
  totalExpenses?: number | null;
  expensesChangePercentFromPrevious?: number | null;
  cashflowLoading?: boolean;
};

export function CategoryExpensePieChart({
  totalExpenses,
  expensesChangePercentFromPrevious,
  cashflowLoading = false,
}: CategoryExpensePieChartProps = {}) {
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
            borderRadius: 3,
            borderColor: "var(--card)",
            borderWidth: 2,
          },
          data: seriesData,
        },
      ],
    };
  }, [expenseSlices, resolvedTheme]);

  const showSkeleton = !isFilterStoreHydrated || isPending;

  const expensesChangeRounded =
    expensesChangePercentFromPrevious != null
      ? Math.round(expensesChangePercentFromPrevious * 10) / 10
      : null;

  return (
    <section className="flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm">
      <header className="flex min-w-0 shrink-0 flex-col gap-2 px-3 py-2.5 sm:flex-row sm:items-start sm:justify-between sm:gap-3 sm:px-4 sm:py-3">
        <h2 className="min-w-0 shrink font-heading text-base font-semibold tracking-tight sm:max-w-[min(100%,14rem)] sm:text-lg md:max-w-none">
          Expense by Category
        </h2>
        <div className="flex w-full min-w-0 flex-col items-start gap-0.5 text-left sm:max-w-[min(100%,12rem)] sm:shrink-0 sm:items-end sm:text-right md:max-w-[55%]">
          {cashflowLoading ? (
            <>
              <Skeleton className="h-5 w-44 self-start sm:self-end" />
              <Skeleton className="h-3.5 w-14 self-start sm:self-end" />
            </>
          ) : (
            <>
              <p className="min-w-0 max-w-full text-left leading-snug text-sm sm:text-right">
                <span className="text-muted-foreground">Total expense: </span>
                <span className="font-semibold tabular-nums">
                  {totalExpenses != null
                    ? formatUsdTooltip(totalExpenses)
                    : "—"}
                </span>
              </p>
              {expensesChangeRounded !== null && (
                <p
                  className={cn(
                    "text-left text-xs font-medium tabular-nums sm:text-right",
                    expensesChangeRounded > 0 &&
                      "text-emerald-600 dark:text-emerald-400",
                    expensesChangeRounded < 0 &&
                      "text-red-600 dark:text-red-400",
                    expensesChangeRounded === 0 &&
                      "text-muted-foreground",
                  )}
                >
                  {formatSignedPercent(expensesChangeRounded)}
                </p>
              )}
            </>
          )}
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden overscroll-contain px-2 pb-3 sm:px-3 sm:pb-4">
        {showSkeleton ? (
          <Skeleton className="mx-auto min-h-72 w-full max-w-xl flex-1 rounded-lg sm:min-h-80 md:min-h-96" />
        ) : isError || chartOption == null ? (
          <p className="flex min-h-72 flex-1 items-center justify-center px-2 py-8 text-center text-sm text-muted-foreground sm:min-h-80 md:min-h-96">
            No expense data for this period.
          </p>
        ) : (
          <div className="relative mx-auto flex min-h-72 w-full max-w-xl flex-1 flex-col sm:min-h-80 md:min-h-96">
            <ReactECharts
              option={chartOption}
              className="min-h-0 w-full flex-1"
              style={{ height: "100%", width: "100%" }}
              opts={{ renderer: "svg" }}
              aria-label="Expense distribution chart"
            />
          </div>
        )}
      </div>
    </section>
  );
}
