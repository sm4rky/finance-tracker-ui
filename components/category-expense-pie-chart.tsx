"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { EChartsOption } from "echarts";
import ReactECharts from "echarts-for-react";
import { ChartPie } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import type { CategoryExpenseSlice } from "@/interface/category-expense-distribution";
import { useAppliedTransactionsFilter } from "@/hooks/use-applied-transactions-filter";
import { fetchCategoryExpenseDistribution } from "@/lib/api/analytics";
import { getPfcPrmaryMeta } from "@/lib/pfc-primary";

const UNCATEGORIZED_LABEL = "Uncategorized";

function formatUsdTooltip(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function sliceDisplayName(slice: CategoryExpenseSlice): string {
  if (slice.customCategory?.name) {
    return slice.customCategory.name;
  }
  if (slice.pfcPrimary == null || slice.pfcPrimary === "") {
    return UNCATEGORIZED_LABEL;
  }
  return getPfcPrmaryMeta(slice.pfcPrimary).displayName;
}

export function CategoryExpensePieChart() {
  const { appliedFilter, filterKey, isFilterStoreHydrated } =
    useAppliedTransactionsFilter();

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["analytics-category-expense-distribution", filterKey],
    queryFn: () => fetchCategoryExpenseDistribution(appliedFilter),
    enabled: isFilterStoreHydrated,
  });

  const expenseSlices = useMemo(() => {
    const slices = data?.slices ?? [];
    return slices.filter((s) => s.totalExpenses > 0);
  }, [data?.slices]);

  const chartOption = useMemo((): EChartsOption | null => {
    const series = expenseSlices.map((s) => ({
      name: sliceDisplayName(s),
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
      series: [
        {
          type: "pie",
          center: ["50%", "40%"],
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

  const showSkeleton = !isFilterStoreHydrated || isPending;

  const showEmpty = !isPending && !isError && chartOption == null;

  return (
    <section className="flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm">
      <header className="flex min-w-0 shrink-0 px-3 py-2 sm:px-4 sm:py-2.5">
        <h2 className="min-w-0 shrink font-heading text-base font-light tracking-tight sm:text-lg">
          Expense by Category
        </h2>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-2 pb-2 sm:px-3 sm:pb-3">
        {showSkeleton ? (
          <Skeleton className="mx-auto min-h-60 w-full max-w-xl flex-1 rounded-lg sm:min-h-64 md:min-h-72" />
        ) : isError ? (
          <p className="flex min-h-60 flex-1 items-center justify-center px-2 py-5 text-center text-sm text-muted-foreground sm:min-h-64 md:min-h-72">
            {error instanceof Error ? error.message : "Could not load chart."}
          </p>
        ) : showEmpty ? (
          <div className="flex min-h-60 flex-1 flex-col items-center justify-center gap-3 px-2 py-5 text-center text-sm text-muted-foreground sm:min-h-64 md:min-h-72">
            <ChartPie className="size-9" aria-hidden />
            <p>No expense data for this period.</p>
          </div>
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
          <div className="flex min-h-60 flex-1 flex-col items-center justify-center gap-3 px-2 py-5 text-center text-sm text-muted-foreground sm:min-h-64 md:min-h-72">
            <ChartPie className="size-9" aria-hidden />
            <p>No expense data for this period.</p>
          </div>
        )}
      </div>
    </section>
  );
}
