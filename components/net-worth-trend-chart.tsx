"use client";

import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { EChartsOption } from "echarts";
import ReactECharts from "echarts-for-react";
import { toast } from "sonner";

import { Skeleton } from "@/components/ui/skeleton";
import type { NetWorthTrendItem } from "@/interface/net-worth-trend";
import { fetchNetWorthTrend } from "@/lib/api/analytics";

const NET_WORTH_LINE_COLOR = "#5071de";
const NET_WORTH_AREA_TOP_COLOR = "rgba(80, 113, 222, 0.38)";
const NET_WORTH_AREA_BOTTOM_COLOR = "rgba(80, 113, 222, 0.04)";

function formatMonthAxisLabel(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  if (!y || !m) return isoDate;
  const dt = new Date(y, m - 1, d || 1);
  return dt.toLocaleDateString(undefined, { month: "short" });
}

function formatMonthSubtitle(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  if (!y || !m) return isoDate;
  const dt = new Date(y, m - 1, d || 1);
  return dt.toLocaleDateString(undefined, {
    month: "short",
    year: "numeric",
  });
}

function formatUsdCompact(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: Math.abs(value) >= 1000 ? "compact" : "standard",
    maximumFractionDigits: Math.abs(value) >= 1000 ? 1 : 0,
  }).format(value);
}

function formatUsdTooltip(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function sortHistoryItems(
  items: readonly NetWorthTrendItem[],
): NetWorthTrendItem[] {
  return [...items].sort((a, b) =>
    a.periodStartDate.localeCompare(b.periodStartDate),
  );
}

function buildChartOption(sorted: readonly NetWorthTrendItem[]): EChartsOption {
  const categories = sorted.map((row) => formatMonthAxisLabel(row.periodStartDate));
  const netWorthData = sorted.map((row) => row.netWorth);

  const vals = netWorthData;
  const lo = Math.min(...vals);
  const hi = Math.max(...vals);
  const pad = Math.max((hi - lo) * 0.08, 1);
  let yMin = lo - pad;
  let yMax = hi + pad;
  if (lo === hi) {
    yMin = lo - 1;
    yMax = hi + 1;
  }

  return {
    grid: {
      left: 20,
      right: 20,
      top: 20,
      bottom: 40,
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
      },
    ],
    tooltip: {
      trigger: "axis",
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
      axisPointer: {
        type: "line",
        snap: true,
        animation: false,
        lineStyle: {
          color: "var(--muted-foreground)",
          width: 1,
        },
        label: {
          show: false,
        },
      },
      valueFormatter: (v) =>
        formatUsdTooltip(typeof v === "number" ? v : Number(v)),
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: categories,
      axisLabel: {
        color: "var(--muted-foreground)",
        fontSize: 11,
        interval: 0,
        rotate: categories.length > 10 ? 35 : 0,
      },
      axisLine: { lineStyle: { color: "var(--border)" } },
    },
    yAxis: {
      type: "value",
      min: yMin,
      max: yMax,
      scale: true,
      axisLabel: {
        color: "var(--muted-foreground)",
        fontSize: 11,
        formatter: (v: number) => formatUsdCompact(v),
      },
      splitLine: {
        lineStyle: { color: "var(--border)", opacity: 0.5 },
      },
    },
    series: [
      {
        name: "Net worth",
        type: "line",
        smooth: false,
        showSymbol: false,
        lineStyle: {
          width: 2,
          color: NET_WORTH_LINE_COLOR,
        },
        itemStyle: { color: NET_WORTH_LINE_COLOR },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: NET_WORTH_AREA_TOP_COLOR },
              { offset: 1, color: NET_WORTH_AREA_BOTTOM_COLOR },
            ],
          },
        },
        data: netWorthData,
      },
    ],
  };
}

export function NetWorthTrendChart() {
  const historyQuery = useQuery({
    queryKey: ["analytics-net-worth-trend"],
    queryFn: () => fetchNetWorthTrend(),
  });

  const { isPending, isError } = historyQuery;

  useEffect(() => {
    if (!isError || !(historyQuery.error instanceof Error)) return;
    toast.error(historyQuery.error.message, {
      id: "analytics-net-worth-trend-error",
    });
  }, [isError, historyQuery.error]);

  const sorted = useMemo(
    () => sortHistoryItems(historyQuery.data?.items ?? []),
    [historyQuery.data?.items],
  );

  const dateRangeSubtitle = useMemo(() => {
    if (sorted.length === 0) return null;
    if (sorted.length === 1) {
      return formatMonthSubtitle(sorted[0]!.periodStartDate);
    }
    return `${formatMonthSubtitle(sorted[0]!.periodStartDate)} – ${formatMonthSubtitle(sorted[sorted.length - 1]!.periodStartDate)}`;
  }, [sorted]);

  const showSkeleton = isPending;
  const showEmpty =
    !isPending && !isError && sorted.length === 0;
  const chartOption = useMemo((): EChartsOption | null => {
    if (sorted.length === 0) return null;
    return buildChartOption(sorted);
  }, [sorted]);

  return (
    <section className="flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm">
      <header className="flex min-w-0 shrink-0 flex-col gap-2 px-3 py-2 sm:px-4 sm:py-2.5">
        <h2 className="min-w-0 shrink text-balance font-heading text-base font-light tracking-tight sm:text-lg">
          Net worth trend
        </h2>
        {dateRangeSubtitle != null ? (
          <p className="text-xs text-muted-foreground sm:text-sm">
            {dateRangeSubtitle}
          </p>
        ) : null}
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-2 pb-2 sm:px-3 sm:pb-3">
        {showSkeleton ? (
          <Skeleton className="mx-auto min-h-60 w-full flex-1 rounded-lg sm:min-h-64 md:min-h-72" />
        ) : isError ? (
          <p className="flex min-h-60 flex-1 items-center justify-center px-2 py-5 text-center text-sm text-destructive sm:min-h-64 md:min-h-72">
            {historyQuery.error instanceof Error
              ? historyQuery.error.message
              : "Could not load chart."}
          </p>
        ) : showEmpty ? (
          <p className="flex min-h-60 flex-1 items-center justify-center px-2 py-5 text-center text-sm text-muted-foreground sm:min-h-64 md:min-h-72">
            No net worth data for this period.
          </p>
        ) : chartOption ? (
          <div className="relative mx-auto flex min-h-60 w-full flex-1 flex-col sm:min-h-64 md:min-h-72">
            <ReactECharts
              option={chartOption}
              className="min-h-0 w-full flex-1"
              style={{ height: "100%", width: "100%" }}
              opts={{ renderer: "svg" }}
              aria-label="Net worth trend chart"
            />
          </div>
        ) : (
          <p className="flex min-h-60 flex-1 items-center justify-center px-2 py-5 text-center text-sm text-muted-foreground sm:min-h-64 md:min-h-72">
            No net worth data for this period.
          </p>
        )}
      </div>
    </section>
  );
}
