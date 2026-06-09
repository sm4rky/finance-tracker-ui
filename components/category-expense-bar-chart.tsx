"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { EChartsOption } from "echarts";
import ReactECharts from "echarts-for-react";
import { toast } from "sonner";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppliedTransactionsFilter } from "@/hooks/use-applied-transactions-filter";
import type { TimeGranularity } from "@/interface/granularity";
import type {
  StackedExpensesByCategoryAmount,
  StackedExpensesByCategoryBucket,
} from "@/interface/stacked-expenses-by-category";
import { fetchStackedExpensesByCategory } from "@/lib/api/analytics";
import { getPfcPrmaryMeta } from "@/lib/pfc-primary";
import { TIME_GRANULARITY_OPTIONS } from "@/lib/time-granularity";

const UNCATEGORIZED_LABEL = "Uncategorized";

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

type CategorySeriesMeta = {
  key: string;
  name: string;
};

function getStackKey(stack: StackedExpensesByCategoryAmount): string {
  if (stack.customCategory?.id) {
    return `custom:${stack.customCategory.id}`;
  }
  if (stack.pfcPrimary == null || stack.pfcPrimary === "") {
    return "uncategorized";
  }
  return `pfc:${stack.pfcPrimary}`;
}

function segmentDisplayName(stack: StackedExpensesByCategoryAmount): string {
  if (stack.customCategory?.name) {
    return stack.customCategory.name;
  }
  if (stack.pfcPrimary == null || stack.pfcPrimary === "") {
    return UNCATEGORIZED_LABEL;
  }
  return getPfcPrmaryMeta(stack.pfcPrimary).displayName;
}

function buildCategorySeriesMeta(
  buckets: readonly StackedExpensesByCategoryBucket[],
): CategorySeriesMeta[] {
  const totals = new Map<string, { total: number; name: string }>();

  for (const bucket of buckets) {
    for (const stack of bucket.stacks) {
      const key = getStackKey(stack);
      const existing = totals.get(key);
      totals.set(key, {
        total: (existing?.total ?? 0) + stack.amount,
        name: existing?.name ?? segmentDisplayName(stack),
      });
    }
  }

  const seriesMeta = [...totals.entries()].map(([key, { total, name }]) => ({
    key,
    name,
    total,
  }));

  seriesMeta.sort((a, b) => {
    const diff = b.total - a.total;
    if (diff !== 0) return diff;
    return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
  });

  return seriesMeta.map(({ key, name }) => ({ key, name }));
}

export function CategoryExpenseBarChart() {
  const [timeGranularity, setTimeGranularity] =
    useState<TimeGranularity>("month");
  const { appliedFilter, filterKey, isFilterStoreHydrated } =
    useAppliedTransactionsFilter();
  const queryReady =
    isFilterStoreHydrated &&
    Boolean(appliedFilter.dateFrom?.trim() && appliedFilter.dateTo?.trim());

  const { data, isPending, isError, error } = useQuery({
    queryKey: [
      "analytics-stacked-expense-category",
      filterKey,
      timeGranularity,
    ],
    queryFn: () =>
      fetchStackedExpensesByCategory({
        ...appliedFilter,
        timeGranularity,
      }),
    enabled: queryReady,
  });

  useEffect(() => {
    if (!isError || !(error instanceof Error)) {
      return;
    }
    toast.error(error.message, {
      id: "analytics-stacked-expense-category-error",
    });
  }, [isError, error]);

  const buckets = useMemo(() => data?.buckets ?? [], [data?.buckets]);

  const chartOption = useMemo((): EChartsOption | null => {
    if (buckets.length === 0) return null;

    const seriesMeta = buildCategorySeriesMeta(buckets);
    if (seriesMeta.length === 0) return null;

    const categories = buckets.map((b) => b.period);

    const amountForBucket = (
      stacks: readonly StackedExpensesByCategoryAmount[],
      key: string,
    ): number => {
      const hit = stacks.find((s) => getStackKey(s) === key);
      return hit?.amount ?? 0;
    };

    const series = seriesMeta.map(({ key, name }) => ({
      name,
      type: "bar" as const,
      stack: "expense",
      barMaxWidth: 100,
      barCategoryGap: "40%",
      emphasis: { focus: "series" as const },
      data: buckets.map((bucket) => amountForBucket(bucket.stacks, key)),
    }));

    return {
      grid: {
        left: 20,
        right: 20,
        top: 20,
        bottom: 50,
        containLabel: true,
      },
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
        bottom: 10,
        width: "100%",
        height: 50,
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

  const showSkeleton = !isFilterStoreHydrated || (queryReady && isPending);

  const showEmpty =
    queryReady && !isPending && !isError && buckets.length === 0;

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
              className="min-w-0 flex-1 sm:flex-initial sm:w-30"
              aria-label="Time grouping"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end" className="min-w-30">
              {TIME_GRANULARITY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-2 pb-2 sm:px-3 sm:pb-3">
        {showSkeleton ? (
          <Skeleton className="mx-auto min-h-60 w-full flex-1 rounded-lg sm:min-h-64 md:min-h-72" />
        ) : isError ? (
          <p className="flex min-h-60 flex-1 items-center justify-center px-2 py-5 text-center text-sm text-destructive sm:min-h-64 md:min-h-72">
            {error instanceof Error ? error.message : "Could not load chart."}
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
