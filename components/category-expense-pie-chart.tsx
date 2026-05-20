"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { EChartsOption } from "echarts";
import ReactECharts from "echarts-for-react";

import {
  getDefaultTransactionsFilter,
  sanitizeTransactionsFilter,
} from "@/components/transactions-filter";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchPfcPrimaryExpenseDistribution } from "@/lib/api/analytics";
import { listPlaidConnections } from "@/lib/api/plaid";
import { getPfcPrmaryMeta } from "@/lib/pfc-primary";
import { cn } from "@/lib/utils";
import { useTransactionsFilterStore } from "@/stores/transactions-filter";

const UNCATEGORIZED_LABEL = "Uncategorized";

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
    return UNCATEGORIZED_LABEL;
  }
  return getPfcPrmaryMeta(pfcPrimary).displayName;
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
  const [isFilterStoreHydrated, setIsFilterStoreHydrated] = useState(() => {
    const persistApi = useTransactionsFilterStore.persist;
    return !persistApi || persistApi.hasHydrated();
  });

  useEffect(() => {
    const persistApi = useTransactionsFilterStore.persist;
    if (!persistApi || persistApi.hasHydrated()) {
      return;
    }

    return persistApi.onFinishHydration(() => {
      setIsFilterStoreHydrated(true);
    });
  }, []);

  const storedAppliedFilter = useTransactionsFilterStore(
    (state) => state.appliedFilter,
  );

  const { data: plaidConnections } = useQuery({
    queryKey: ["list-plaid-connections"],
    queryFn: listPlaidConnections,
  });

  const allBanks = useMemo(() => plaidConnections ?? [], [plaidConnections]);

  const activeBanks = useMemo(
    () =>
      allBanks.filter(
        (bank) => bank.status === "active" || bank.status === "relink_required",
      ),
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

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["analytics-pfc-expense-distribution", filterKey],
    queryFn: () => fetchPfcPrimaryExpenseDistribution(appliedFilter),
    enabled: isFilterStoreHydrated,
  });

  const expenseSlices = useMemo(() => {
    const slices = data?.slices ?? [];
    return slices.filter((s) => s.totalExpenses > 0);
  }, [data?.slices]);

  const chartOption = useMemo((): EChartsOption | null => {
    const series = expenseSlices.map((s) => ({
      name: sliceDisplayName(s.pfcPrimary),
      value: s.totalExpenses,
    }));

    if (series.length === 0) return null;

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
        type: "scroll",
        orient: "vertical",
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
          radius: ["45%", "70%"],
          label: { show: false },
          labelLine: { show: false },
          emphasis: {
            scale: true,
            scaleSize: 6,
          },
          itemStyle: {
            borderRadius: 4,
            borderColor: "var(--card)",
            borderWidth: 2,
          },
          data: series,
        },
      ],
    };
  }, [expenseSlices]);

  const expensesChangeRounded =
    expensesChangePercentFromPrevious != null
      ? Math.round(expensesChangePercentFromPrevious * 10) / 10
      : null;

  const showSkeleton = !isFilterStoreHydrated || isPending;

  const showEmpty = !isPending && !isError && chartOption == null;

  return (
    <section className="flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm">
      <header className="flex min-w-0 shrink-0 flex-col gap-2 px-3 py-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3 sm:px-4 sm:py-2.5">
        <h2 className="min-w-0 shrink font-heading text-base font-light tracking-tight sm:max-w-[min(100%,14rem)] sm:text-lg md:max-w-none">
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
                    expensesChangeRounded === 0 && "text-muted-foreground",
                  )}
                >
                  {formatSignedPercent(expensesChangeRounded)}
                </p>
              )}
            </>
          )}
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-2 pb-2 sm:px-3 sm:pb-3">
        {showSkeleton ? (
          <Skeleton className="mx-auto min-h-60 w-full max-w-xl flex-1 rounded-lg sm:min-h-64 md:min-h-72" />
        ) : isError ? (
          <p className="flex min-h-60 flex-1 items-center justify-center px-2 py-5 text-center text-sm text-muted-foreground sm:min-h-64 md:min-h-72">
            {error instanceof Error ? error.message : "Could not load chart."}
          </p>
        ) : showEmpty ? (
          <p className="flex min-h-60 flex-1 items-center justify-center px-2 py-5 text-center text-sm text-muted-foreground sm:min-h-64 md:min-h-72">
            No expense data for this period.
          </p>
        ) : chartOption ? (
          <div className="relative mx-auto flex min-h-60 w-full max-w-xl flex-1 flex-col sm:min-h-64 md:min-h-72">
            <ReactECharts
              option={chartOption}
              className="min-h-0 w-full flex-1"
              style={{ height: "100%", width: "100%" }}
              opts={{ renderer: "svg" }}
              aria-label="Expense distribution chart"
            />
          </div>
        ) : (
          <p className="flex min-h-60 flex-1 items-center justify-center px-2 py-5 text-center text-sm text-muted-foreground sm:min-h-64 md:min-h-72">
            No expense data for this period.
          </p>
        )}
      </div>
    </section>
  );
}
