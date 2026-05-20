"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { EChartsOption } from "echarts";
import ReactECharts from "echarts-for-react";
import { toast } from "sonner";

import {
  getDefaultTransactionsFilter,
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
import type { TimeGranularity } from "@/interface/granularity";
import type {
  GroupedExpenseByAccountBar,
  GroupedExpenseByAccountBucket,
} from "@/interface/grouped-expenses-by-account";
import { fetchGroupedExpensesByAccount } from "@/lib/api/analytics";
import { listPlaidConnections } from "@/lib/api/plaid";
import { TIME_GRANULARITY_OPTIONS } from "@/lib/time-granularity";
import { useTransactionsFilterStore } from "@/stores/transactions-filter";

const UNLINKED_KEY = "unlinked";

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

function segmentDisplayName(
  key: string,
  officialNameByKey: ReadonlyMap<string, string | null>,
): string {
  const official = officialNameByKey.get(key);
  const trimmed = official?.trim();
  if (trimmed) return trimmed;
  if (key === UNLINKED_KEY) return "Unlinked";
  return `Account (${key.slice(0, 8)})`;
}

function getOfficialNamesMap(
  buckets: readonly GroupedExpenseByAccountBucket[],
): Map<string, string | null> {
  const map = new Map<string, string | null>();
  for (const b of buckets) {
    for (const bar of b.bars) {
      const key = bar.linkedBankAccountId ?? UNLINKED_KEY;
      if (!map.has(key)) {
        map.set(key, bar.officialName);
      } else if (map.get(key) == null && bar.officialName != null) {
        map.set(key, bar.officialName);
      }
    }
  }
  return map;
}

function buildAccountKeysAcrossBuckets(
  buckets: readonly GroupedExpenseByAccountBucket[],
  officialNamesMap: ReadonlyMap<string, string | null>,
): string[] {
  const totals = new Map<string, number>();
  for (const b of buckets) {
    for (const bar of b.bars) {
      const key = bar.linkedBankAccountId ?? UNLINKED_KEY;
      totals.set(key, (totals.get(key) ?? 0) + bar.amount);
    }
  }
  const keys = [...totals.keys()];
  keys.sort((a, b) => {
    const diff = (totals.get(b) ?? 0) - (totals.get(a) ?? 0);
    if (diff !== 0) return diff;
    return segmentDisplayName(a, officialNamesMap).localeCompare(
      segmentDisplayName(b, officialNamesMap),
      undefined,
      { sensitivity: "base" },
    );
  });
  return keys;
}

function amountForBucketBar(
  bars: readonly GroupedExpenseByAccountBar[],
  key: string,
): number {
  const hit = bars.find(
    (bar) => bar.linkedBankAccountId ?? UNLINKED_KEY === key,
  );
  return hit?.amount ?? 0;
}

function uniqueSeriesNames(
  keys: string[],
  officialNamesMap: ReadonlyMap<string, string | null>,
): string[] {
  const labelsMap = keys.map((k) => segmentDisplayName(k, officialNamesMap));
  const countByLabel = new Map<string, number>();
  for (const l of labelsMap) {
    countByLabel.set(l, (countByLabel.get(l) ?? 0) + 1);
  }
  return keys.map((k, i) => {
    const base = labelsMap[i]!;
    if ((countByLabel.get(base) ?? 0) <= 1) return base;
    return `${base} (${k === UNLINKED_KEY ? "unlinked" : k.slice(0, 8)})`;
  });
}

export function AccountExpenseBarChart() {
  const [isFilterStoreHydrated, setIsFilterStoreHydrated] = useState(() => {
    const persistApi = useTransactionsFilterStore.persist;
    return !persistApi || persistApi.hasHydrated();
  });
  const [timeGranularity, setTimeGranularity] =
    useState<TimeGranularity>("month");

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
  const queryReady =
    isFilterStoreHydrated &&
    Boolean(appliedFilter.dateFrom?.trim() && appliedFilter.dateTo?.trim());

  const { data, isPending, isError, error } = useQuery({
    queryKey: [
      "analytics-grouped-expense-by-account",
      filterKey,
      timeGranularity,
    ],
    queryFn: () =>
      fetchGroupedExpensesByAccount({
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
      id: "analytics-grouped-expense-by-account-error",
    });
  }, [isError, error]);

  const buckets = useMemo(() => data?.buckets ?? [], [data?.buckets]);

  const chartOption = useMemo((): EChartsOption | null => {
    if (buckets.length === 0) return null;

    const officialNamesMap = getOfficialNamesMap(buckets);
    const accountKeys = buildAccountKeysAcrossBuckets(
      buckets,
      officialNamesMap,
    );
    if (accountKeys.length === 0) return null;

    const categories = buckets.map((b) => b.period);

    const seriesNames = uniqueSeriesNames(accountKeys, officialNamesMap);

    const series = accountKeys.map((key, index) => ({
      name: seriesNames[index]!,
      type: "bar" as const,
      barMaxWidth: 22,
      barGap: "12%",
      emphasis: { focus: "series" as const },
      data: buckets.map((bucket) => amountForBucketBar(bucket.bars, key)),
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
        {
          type: "inside",
          xAxisIndex: 0,
          // zoomOnMouseWheel: false,
        },
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

  const showSkeleton = !isFilterStoreHydrated || (queryReady && isPending);

  const showEmpty =
    queryReady && !isPending && !isError && buckets.length === 0;

  return (
    <section className="flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm">
      <header className="flex min-w-0 shrink-0 flex-col gap-2 px-3 py-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3 sm:px-4 sm:py-2.5">
        <h2 className="min-w-0 shrink text-balance font-heading text-base font-light tracking-tight sm:max-w-[min(100%,20rem)] sm:text-lg md:max-w-none">
          Expenses by account over time
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
              aria-label="Expenses by account over time chart"
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
