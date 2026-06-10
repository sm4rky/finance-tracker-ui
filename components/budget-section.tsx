"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, PiggyBank } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { listOngoingProfileBudgetPeriods } from "@/lib/api/profile-budget";
import { cn } from "@/lib/utils";

const BUDGET_LIMIT = 3;

function formatUsd(amount: number): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function formatPeriodEndDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getSpentPercent(spentAmount: number, amountLimit: number): number {
  if (amountLimit <= 0) return 0;

  const value = (spentAmount / amountLimit) * 100;
  if (!Number.isFinite(value)) return 0;

  return Math.min(100, Math.max(0, value));
}

export function BudgetSection() {
  const { data = [], isPending, isError, error } = useQuery({
    queryKey: ["ongoing-profile-budget-periods", BUDGET_LIMIT] as const,
    queryFn: () => listOngoingProfileBudgetPeriods(BUDGET_LIMIT),
  });

  return (
    <section className="flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm">
      <header className="flex min-w-0 shrink-0 flex-row items-start justify-between gap-2 px-3 py-2 sm:px-4 sm:py-2.5">
        <h2 className="font-heading text-base font-light tracking-tight sm:text-lg">
          Budgets
        </h2>
        <Link
          href="/budgets"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "shrink-0",
          )}
        >
          <ArrowUpRight className="opacity-90" strokeWidth={1.75} aria-hidden />
          View all
        </Link>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto no-scrollbar px-2 pb-2 sm:px-3 sm:pb-3">
        {isPending ? (
          <ul className="space-y-0" aria-hidden>
            {Array.from({ length: BUDGET_LIMIT }, (_, i) => (
              <li
                key={i}
                className="flex flex-col gap-2 border-b border-border/40 py-3 last:border-0"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-4 w-full max-w-44" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                  <Skeleton className="h-4 w-24 shrink-0" />
                </div>
                <Skeleton className="h-1.5 w-full rounded-full" />
                <Skeleton className="ml-auto h-3 w-10" />
              </li>
            ))}
          </ul>
        ) : isError ? (
          <p className="px-1 py-6 text-center text-sm text-destructive">
            {error instanceof Error
              ? error.message
              : "Could not load budgets."}
          </p>
        ) : data.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-1 py-8 text-center text-sm text-muted-foreground">
            <PiggyBank className="size-9" aria-hidden />
            <p>No active budget periods.</p>
          </div>
        ) : (
          <div className="min-w-0">
            {data.map((period) => {
              const percent = getSpentPercent(
                period.spentAmount,
                period.amountLimit,
              );
              const overLimit =
                period.amountLimit > 0 &&
                period.spentAmount > period.amountLimit;

              return (
                <div
                  key={period.id}
                  className="flex min-w-0 flex-col gap-2 border-b border-border/60 py-3 last:border-b-0"
                >
                  <div className="flex min-w-0 items-start justify-between gap-3">
                    <div className="min-w-0 space-y-0.5">
                      <p className="truncate text-sm font-medium leading-tight">
                        {period.periodName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Ends {formatPeriodEndDate(period.periodEndDate)}
                      </p>
                    </div>
                    <p
                      className={cn(
                        "shrink-0 text-right text-sm font-medium tabular-nums",
                        overLimit && "text-destructive",
                      )}
                      title={`${formatUsd(period.spentAmount)} / ${formatUsd(period.amountLimit)}`}
                    >
                      {formatUsd(period.spentAmount)}
                      <span className="text-muted-foreground">
                        {" "}
                        / {formatUsd(period.amountLimit)}
                      </span>
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Progress
                      value={percent}
                      className={cn(
                        "h-1.5",
                        overLimit && "bg-destructive/20",
                      )}
                      indicatorClassName={cn(overLimit && "bg-destructive")}
                    />
                    <p className="text-right text-xs text-muted-foreground tabular-nums">
                      {Math.round(percent)}%
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
