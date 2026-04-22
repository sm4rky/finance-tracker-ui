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
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    notation: Math.abs(value) >= 1000 ? "compact" : "standard",
    maximumFractionDigits: Math.abs(value) >= 1000 ? 1 : 0,
  }).format(value);
}

function formatUsdTooltip(value: number): string {
  return new Intl.NumberFormat(undefined, {
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

function buildChartOption(
  sorted: readonly NetWorthTrendItem[],
): EChartsOption {
  const categories = sorted.map((row) => formatMonthAxisLabel(row.periodStartDate));
  const netWorthData = sorted.map((row) => row.netWorth);

  const hasPoints = sorted.length > 0;
  let yMin: number | undefined;
  let yMax: number | undefined;
  if (hasPoints) {
    const vals = netWorthData;
    const lo = Math.min(...vals);
    const hi = Math.max(...vals);
    const pad = Math.max((hi - lo) * 0.08, 1);
    yMin = lo - pad;
    yMax = hi + pad;
    if (lo === hi) {
      yMin = lo - 1;
      yMax = hi + 1;
    }
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
      data: hasPoints ? categories : [],
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
      min: hasPoints ? yMin : 0,
      max: hasPoints ? yMax : 1,
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
        data: hasPoints ? netWorthData : [],
      },
    ],
  };
}

export function NetWorthTrendChart() {
  const historyQuery = useQuery({
    queryKey: ["analytics-net-worth-trend"],
    queryFn: () => fetchNetWorthTrend(),
  });

  const { isPending, isError, error, data } = historyQuery;

  useEffect(() => {
    if (!isError || !(error instanceof Error)) return;
    toast.error(error.message, { id: "analytics-net-worth-trend-error" });
  }, [isError, error]);

  const sorted = useMemo(
    () => sortHistoryItems(data?.items ?? []),
    [data?.items],
  );

  const dateRangeSubtitle = useMemo(() => {
    if (sorted.length === 0) return null;
    if (sorted.length === 1) {
      return formatMonthSubtitle(sorted[0]!.periodStartDate);
    }
    return `${formatMonthSubtitle(sorted[0]!.periodStartDate)} – ${formatMonthSubtitle(sorted[sorted.length - 1]!.periodStartDate)}`;
  }, [sorted]);

  const chartOption = useMemo(() => buildChartOption(sorted), [sorted]);

  return (
    <section className="flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm">
      <header className="flex min-w-0 shrink-0 flex-col gap-0.5 px-3 py-2 sm:px-4 sm:py-2.5">
        <h2 className="font-heading text-base font-light tracking-tight sm:text-lg">
          Net worth trend
        </h2>
        {dateRangeSubtitle != null ? (
          <p className="text-xs text-muted-foreground sm:text-sm">
            {dateRangeSubtitle}
          </p>
        ) : null}
      </header>

      <div className="relative flex min-h-0 flex-1 flex-col px-2 pb-2 sm:px-3 sm:pb-3">
        {isPending ? (
          <Skeleton className="mx-auto min-h-52 w-full flex-1 rounded-lg sm:min-h-56 md:min-h-60" />
        ) : isError ? (
          <p className="flex min-h-52 flex-1 items-center justify-center px-2 py-5 text-center text-sm text-destructive sm:min-h-56 md:min-h-60">
            {error instanceof Error ? error.message : "Could not load chart."}
          </p>
        ) : (
          <div className="mx-auto flex min-h-52 w-full flex-1 flex-col sm:min-h-56 md:min-h-60">
            <ReactECharts
              option={chartOption}
              className="min-h-0 w-full flex-1"
              style={{ height: "100%", width: "100%", minHeight: 220 }}
              opts={{ renderer: "svg" }}
              aria-label="Net worth trend chart"
            />
          </div>
        )}
      </div>
    </section>
  );
}
