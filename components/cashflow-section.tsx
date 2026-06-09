"use client";

import { useQuery } from "@tanstack/react-query";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppliedTransactionsFilter } from "@/hooks/use-applied-transactions-filter";
import { fetchCashflow } from "@/lib/api/analytics";
import { cn } from "@/lib/utils";

function formatUsd(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatPercent(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(Math.abs(value) <= 1 ? value : value / 100);
}

function formatSignedPercent(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${formatPercent(value)}`;
}

function getChangePercentClassName(value: number): string {
  return cn(
    "text-sm font-medium tabular-nums",
    value > 0 && "text-emerald-600 dark:text-emerald-400",
    value < 0 && "text-red-600 dark:text-red-400",
    value === 0 && "text-muted-foreground",
  );
}

export function CashflowSection() {
  const { appliedFilter, filterKey, isFilterStoreHydrated } =
    useAppliedTransactionsFilter();
  const queryReady =
    isFilterStoreHydrated &&
    Boolean(appliedFilter.dateFrom?.trim() && appliedFilter.dateTo?.trim());

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["analytics-cashflow", filterKey],
    queryFn: () => fetchCashflow(appliedFilter),
    enabled: queryReady,
  });

  const loading = !isFilterStoreHydrated || (queryReady && isPending);

  if (isError) {
    return (
      <section className="flex h-full min-w-0 items-center justify-center rounded-xl border border-border bg-card p-4 text-center text-sm text-destructive shadow-sm">
        {error instanceof Error ? error.message : "Could not load cashflow."}
      </section>
    );
  }

  return (
    <section className="grid h-full min-h-0 w-full min-w-0 grid-cols-1 min-w-0 gap-3">
      <Card className="flex flex-row min-w-0 border border-border items-center justify-between gap-4 p-4">
        <p className="min-w-0 truncate text-sm font-medium text-muted-foreground">
          Income
        </p>

        {loading ? (
          <div className="min-w-0 shrink-0 space-y-2">
            <Skeleton className="h-6 w-28" />
            <Skeleton className="ml-auto h-3.5 w-16" />
          </div>
        ) : (
          <div className="min-w-0 shrink-0 text-right">
            <p className="truncate text-xl font-semibold tabular-nums">
              {data ? formatUsd(data.totalIncome) : "—"}
            </p>
            {data?.incomeChangePercentFromPrevious != null ? (
              <p
                className={getChangePercentClassName(
                  data.incomeChangePercentFromPrevious,
                )}
              >
                {formatSignedPercent(data.incomeChangePercentFromPrevious)}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">No comparison</p>
            )}
          </div>
        )}
      </Card>

      <Card className="flex flex-row min-w-0 border border-border items-center justify-between gap-4 p-4">
        <p className="min-w-0 truncate text-sm font-medium text-muted-foreground">
          Expense
        </p>

        {loading ? (
          <div className="min-w-0 shrink-0 space-y-2">
            <Skeleton className="h-6 w-28" />
            <Skeleton className="ml-auto h-3.5 w-16" />
          </div>
        ) : (
          <div className="min-w-0 shrink-0 text-right">
            <p className="truncate text-xl font-semibold tabular-nums">
              {data ? formatUsd(data.totalExpenses) : "—"}
            </p>
            {data?.expensesChangePercentFromPrevious != null ? (
              <p
                className={getChangePercentClassName(
                  data.expensesChangePercentFromPrevious,
                )}
              >
                {formatSignedPercent(data.expensesChangePercentFromPrevious)}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">No comparison</p>
            )}
          </div>
        )}
      </Card>

      <Card className="flex flex-row min-w-0 border border-border items-center justify-between gap-4 p-4">
        <p className="min-w-0 truncate text-sm font-medium text-muted-foreground">
          Savings
        </p>

        {loading ? (
          <div className="min-w-0 shrink-0 space-y-2">
            <Skeleton className="h-6 w-28" />
            <Skeleton className="ml-auto h-3.5 w-16" />
          </div>
        ) : (
          <div className="min-w-0 shrink-0 text-right">
            <p className="truncate text-xl font-semibold tabular-nums">
              {data?.savingsRate != null ? formatPercent(data.savingsRate) : "—"}
            </p>
            {data?.savingsRateChangePercentFromPrevious != null ? (
              <p
                className={getChangePercentClassName(
                  data.savingsRateChangePercentFromPrevious,
                )}
              >
                {formatSignedPercent(data.savingsRateChangePercentFromPrevious)}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">No comparison</p>
            )}
          </div>
        )}
      </Card>
    </section>
  );
}
