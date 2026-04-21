"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { EChartsOption } from "echarts";
import ReactECharts from "echarts-for-react";
import { toast } from "sonner";

import {
  getDefaultTransactionsFilter,
  getPfcCategoryMeta,
  sanitizeTransactionsFilter,
} from "@/components/transactions-filter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  StackedExpensesByPfcPrimaryAmount,
  StackedExpensesByPfcPrimaryBucket,
  TimeGranularity,
} from "@/interface/stacked-expenses-by-pfc-primary";
import { fetchStackedExpensesByPfcPrimary } from "@/lib/api/analytics";
import { listPlaidConnections } from "@/lib/api/plaid";
import { useTransactionsFilterStore } from "@/stores/transactions-filter";

const TIME_GRANULARITY_OPTIONS: { value: TimeGranularity; label: string }[] = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "year", label: "Year" },
];

function formatUsdTooltip(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatUsdAxis(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: value >= 1000 ? "compact" : "standard",
    maximumFractionDigits: value >= 1000 ? 1 : 0,
  }).format(value);
}

function sliceDisplayName(pfcPrimary: string | null): string {
  if (pfcPrimary == null || pfcPrimary === "") {
    return "Uncategorized";
  }
  return getPfcCategoryMeta(pfcPrimary).displayName;
}

function buildPfcKeysAcrossBuckets(
  buckets: readonly StackedExpensesByPfcPrimaryBucket[],
): (string | null)[] {
  const totals = new Map<string | null, number>();
  for (const b of buckets) {
    for (const s of b.stacks) {
      const k = s.pfcPrimary;
      totals.set(k, (totals.get(k) ?? 0) + s.amount);
    }
  }
  const keys = [...totals.keys()];
  keys.sort((a, b) => {
    const diff = (totals.get(b) ?? 0) - (totals.get(a) ?? 0);
    if (diff !== 0) return diff;
    return sliceDisplayName(a).localeCompare(
      sliceDisplayName(b),
      undefined,
      { sensitivity: "base" },
    );
  });
  return keys;
}

export function CategoryExpenseBarChart() {
  const [isFilterStoreHydrated, setIsFilterStoreHydrated] = useState(false);
  const [timeGranularity, setTimeGranularity] =
    useState<TimeGranularity>("month");

  useEffect(() => {
    const persistApi = useTransactionsFilterStore.persist;
    if (!persistApi) {
      setIsFilterStoreHydrated(true);
      return;
    }
    if (persistApi.hasHydrated()) {
      setIsFilterStoreHydrated(true);
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
  const queryReady =
    isFilterStoreHydrated &&
    Boolean(appliedFilter.dateFrom?.trim() && appliedFilter.dateTo?.trim());

  const stackedQuery = useQuery({
    queryKey: [
      "analytics-stacked-expense-pfc-primary",
      filterKey,
      timeGranularity,
    ],
    queryFn: () =>
      fetchStackedExpensesByPfcPrimary({
        ...appliedFilter,
        timeGranularity,
      }),
    enabled: queryReady,
  });

  const { isPending: isStackedPending, isError: isStackedError } = stackedQuery;

  useEffect(() => {
    if (!isStackedError || !(stackedQuery.error instanceof Error)) {
      return;
    }
    toast.error(stackedQuery.error.message, {
      id: "analytics-stacked-expense-pfc-primary-error",
    });
  }, [isStackedError, stackedQuery.error]);

  const buckets = useMemo(
    () => stackedQuery.data?.buckets ?? [],
    [stackedQuery.data?.buckets],
  );

  const chartOption = useMemo((): EChartsOption | null => {
    if (buckets.length === 0) return null;

    const pfcKeys = buildPfcKeysAcrossBuckets(buckets);
    if (pfcKeys.length === 0) return null;

    const categories = buckets.map((b) => b.period);

    const amountForBucket = (
      stacks: readonly StackedExpensesByPfcPrimaryAmount[],
      key: string | null,
    ): number => {
      const hit = stacks.find((s) => s.pfcPrimary === key);
      return hit?.amount ?? 0;
    };

    const series = pfcKeys.map((pfcKey) => ({
      name: sliceDisplayName(pfcKey),
      type: "bar" as const,
      stack: "expense",
      barMaxWidth: 100,
      barCategoryGap: "40%",
      emphasis: { focus: "series" as const },
      data: buckets.map((b) => amountForBucket(b.stacks, pfcKey)),
    }));

    return {
      grid: {
        left: 20,
        right: 20,
        top: 20,
        bottom: 80,
        containLabel: true,
      },
      dataZoom: [
        {
          type: "slider",
          xAxisIndex: 0,
          height: 20,
          bottom: 5,
          left: 30,
          right: 30,
          showDetail: false,
          handleSize: 10,
          moveHandleSize: 6,
        },
        { type: "inside", xAxisIndex: 0 },
      ],
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
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
        orient: "horizontal",
        left: "center",
        bottom: 38,
        width: "96%",
        height: 60,
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
      xAxis: {
        type: "category",
        data: categories,
        axisLabel: {
          color: "var(--muted-foreground)",
          fontSize: 11,
          rotate: categories.length > 8 ? 35 : 0,
          interval: 0,
        },
        axisLine: { lineStyle: { color: "var(--border)" } },
      },
      yAxis: {
        type: "value",
        axisLabel: {
          color: "var(--muted-foreground)",
          fontSize: 11,
          formatter: (v: number) => formatUsdAxis(v),
        },
        splitLine: {
          lineStyle: { color: "var(--border)", opacity: 0.5 },
        },
      },
      series,
    };
  }, [buckets]);

  const showSkeleton =
    !isFilterStoreHydrated || (queryReady && isStackedPending);

  const showEmpty =
    queryReady &&
    !isStackedPending &&
    !isStackedError &&
    buckets.length === 0;

  return (
    <section className="flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm">
      <header className="flex min-w-0 shrink-0 flex-col gap-2 px-3 py-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3 sm:px-4 sm:py-2.5">
        <h2 className="min-w-0 shrink text-balance font-heading text-base font-light tracking-tight sm:max-w-[min(100%,20rem)] sm:text-lg md:max-w-none">
          Expenses by category over time
        </h2>
        <div className="flex w-full min-w-0 flex-row items-center gap-2 sm:w-auto sm:shrink-0 sm:justify-end">
          <span className="shrink-0 text-xs text-muted-foreground sm:text-sm">
            Group by
          </span>
          <Select
            value={timeGranularity}
            onValueChange={(v) => setTimeGranularity(v as TimeGranularity)}
          >
            <SelectTrigger
              size="sm"
              className="min-w-0 flex-1 sm:flex-initial sm:w-[7.5rem]"
              aria-label="Time grouping"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end" className="min-w-[7.5rem]">
              {TIME_GRANULARITY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden overscroll-contain px-2 pb-2 sm:px-3 sm:pb-3">
        {showSkeleton ? (
          <Skeleton className="mx-auto min-h-60 w-full flex-1 rounded-lg sm:min-h-64 md:min-h-72" />
        ) : isStackedError ? (
          <p className="flex min-h-60 flex-1 items-center justify-center px-2 py-5 text-center text-sm text-destructive sm:min-h-64 md:min-h-72">
            {stackedQuery.error instanceof Error
              ? stackedQuery.error.message
              : "Could not load chart."}
          </p>
        ) : showEmpty ? (
          <p className="flex min-h-60 flex-1 items-center justify-center px-2 py-5 text-center text-sm text-muted-foreground sm:min-h-64 md:min-h-72">
            No expense data for this period.
          </p>
        ) : chartOption ? (
          <div className="relative mx-auto flex min-h-60 w-full flex-1 flex-col sm:min-h-64 md:min-h-72">
            <ReactECharts
              option={chartOption}
              className="min-h-0 w-full flex-1"
              style={{ height: "100%", width: "100%" }}
              opts={{ renderer: "svg" }}
              aria-label="Expense categories over time chart"
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
