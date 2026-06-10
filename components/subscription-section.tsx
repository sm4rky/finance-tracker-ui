"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Repeat } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppliedRecurringCashflowsFilter } from "@/hooks/use-applied-recurring-cashflows-filter";
import type { ProfileCustomCategorySetResponse } from "@/interface/profile-custom-category";
import type { ProfileRecurringCashflowResponse } from "@/interface/profile-recurring-cashflow";
import { listProfileRecurringCashflows } from "@/lib/api/profile-recurring-cashflow";
import {
  getCustomCategoryMeta,
  type CustomCategoryMeta,
} from "@/lib/custom-category";
import {
  getPfcPrmaryMeta,
  type PfcPrimaryMeta,
  UNCATEGORIZED_PFC_PRIMARY,
} from "@/lib/pfc-primary";
import { filterRecurringCashflows } from "@/lib/recurring-cashflow-filter";
import { cn } from "@/lib/utils";

const SUBSCRIPTION_LIMIT = 5;

function formatCurrencyUsd(amount: number): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD",
    }).format(Math.abs(amount));
  } catch {
    return Math.abs(amount).toFixed(2);
  }
}

function parseISODateLocal(value: string): Date | null {
  const datePart = value.trim().split("T")[0];
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

function formatNextDueDisplay(iso: string | null | undefined): {
  dateLine: string;
  relative: string | null;
} {
  if (iso == null || iso === "") {
    return { dateLine: "—", relative: null };
  }

  const date = parseISODateLocal(iso);
  if (date == null) {
    return { dateLine: "—", relative: null };
  }

  const dateLine = date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  const diffDays = Math.round(
    (target.getTime() - today.getTime()) / (24 * 60 * 60 * 1000),
  );

  if (diffDays === 0) return { dateLine, relative: "Today" };
  if (diffDays === 1) return { dateLine, relative: "Tomorrow" };
  if (diffDays === -1) return { dateLine, relative: "Yesterday" };

  return { dateLine, relative: null };
}

function recurringCashflowTitle(row: ProfileRecurringCashflowResponse): string {
  const merchantName = row.merchantName?.trim();
  if (merchantName) return merchantName;

  const description = row.description?.trim();
  if (description) return description;

  return "—";
}

function getRecurringCashflowCategoryMeta(
  categorySet: ProfileCustomCategorySetResponse | null,
  pfcPrimary: string | null | undefined,
): CustomCategoryMeta | PfcPrimaryMeta {
  const normalized = pfcPrimary?.trim() || UNCATEGORIZED_PFC_PRIMARY;
  const customCategory = categorySet?.categories.find((category) =>
    category.pfcPrimaries.some(
      (mapping) => mapping.pfcPrimaryCode === normalized,
    ),
  );

  return customCategory
    ? getCustomCategoryMeta(customCategory)
    : getPfcPrmaryMeta(normalized);
}

export function SubscriptionSection() {
  const { banks, appliedFilter, selectedCategorySet } =
    useAppliedRecurringCashflowsFilter();
  const { data = [], isPending, isError, error } = useQuery({
    queryKey: ["profile-recurring-cashflows"],
    queryFn: listProfileRecurringCashflows,
  });

  const items = filterRecurringCashflows(
    data ?? [],
    appliedFilter,
    banks,
    selectedCategorySet,
  ).slice(0, SUBSCRIPTION_LIMIT);

  return (
    <section className="flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm">
      <header className="flex min-w-0 shrink-0 flex-row items-start justify-between gap-2 px-3 py-2 sm:px-4 sm:py-2.5">
        <h2 className="font-heading text-base font-light tracking-tight sm:text-lg">
          Subscriptions
        </h2>
        <Link
          href="/subscriptions"
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
            {Array.from({ length: SUBSCRIPTION_LIMIT }, (_, i) => (
              <li
                key={i}
                className="flex items-center gap-3 border-b border-border/40 py-3 last:border-0"
              >
                <Skeleton className="size-9 shrink-0 rounded-lg" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-full max-w-44" />
                  <Skeleton className="h-3 w-28" />
                </div>
                <Skeleton className="h-4 w-16 shrink-0" />
              </li>
            ))}
          </ul>
        ) : isError ? (
          <p className="px-1 py-6 text-center text-sm text-destructive">
            {error instanceof Error
              ? error.message
              : "Could not load subscriptions."}
          </p>
        ) : items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-1 py-8 text-center text-sm text-muted-foreground">
            <Repeat className="size-9" aria-hidden />
            <p>
              {data.length === 0
                ? "No subscriptions yet."
                : "No matching subscriptions."}
            </p>
          </div>
        ) : (
          <div className="min-w-0">
            {items.map((row) => {
              const meta = getRecurringCashflowCategoryMeta(
                selectedCategorySet,
                row.pfcPrimary,
              );
              const Icon = meta.Icon;
              const label = recurringCashflowTitle(row);
              const { dateLine, relative } = formatNextDueDisplay(
                row.predictedNextDate,
              );
              const amountClass =
                row.direction === "inflow"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-destructive";

              return (
                <div
                  key={row.id}
                  className="flex min-w-0 items-center gap-3 border-b border-border/60 py-3 last:border-b-0"
                >
                  <div
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/40",
                      meta.fallbackIconClassName,
                    )}
                    aria-hidden
                  >
                    <Icon className="size-4 shrink-0 opacity-90" />
                  </div>

                  <div className="min-w-0 flex-1 space-y-0.5">
                    <p className="truncate text-sm font-medium leading-tight">
                      {label}
                    </p>
                    <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                      <span className="shrink-0">
                        Next {dateLine}
                      </span>
                      {relative ? (
                        <span className="shrink-0">{relative}</span>
                      ) : null}
                    </div>
                  </div>

                  <p
                    className={cn(
                      "shrink-0 text-right text-sm font-medium tabular-nums",
                      amountClass,
                    )}
                  >
                    {row.direction === "inflow" ? "+" : "-"}
                    {formatCurrencyUsd(row.expectedAmount)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
