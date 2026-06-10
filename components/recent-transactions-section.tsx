"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import {
  UNCATEGORIZED_PFC_PRIMARY,
  getPfcPrmaryMeta,
} from "@/lib/pfc-primary";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { TransactionResponse } from "@/interface/transaction";
import { fetchRecentTransactions } from "@/lib/api/transaction";
import { cn } from "@/lib/utils";

function formatTxDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getMerchantLabel(row: TransactionResponse): string {
  return row.merchantName?.trim() || row.name?.trim() || "—";
}

const RECENT_LIMIT = 5;

function TransactionRow({ row }: { row: TransactionResponse }) {
  const [imgFailed, setImgFailed] = useState(false);
  const pfcPrimary = row.pfcPrimary?.trim();
  const meta = getPfcPrmaryMeta(
    pfcPrimary
      ? pfcPrimary.toUpperCase()
      : UNCATEGORIZED_PFC_PRIMARY,
  );
  const label = getMerchantLabel(row);
  const logoUrl = row.logoUrl?.trim() ?? "";
  const shouldShowImage = logoUrl !== "" && !imgFailed;
  const flow = row.amount === 0 ? "neutral" : row.amount < 0 ? "in" : "out";
  const absAmount = Math.abs(row.amount);
  const code = row.isoCurrencyCode?.toUpperCase() || "USD";
  let formatted = absAmount.toFixed(2);

  try {
    formatted = new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: code,
    }).format(absAmount);
  } catch {}
  const Icon = meta.Icon;

  return (
    <div
      className="flex min-w-0 items-center gap-3 border-b border-border/60 py-3 last:border-b-0"
    >
      {shouldShowImage ? (
        <Image
          src={logoUrl}
          alt=""
          width={36}
          height={36}
          className="size-9 shrink-0 rounded-lg border border-border/60 bg-muted object-contain"
          unoptimized
          onError={() => setImgFailed(true)}
        />
      ) : (
        <div
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/40",
            meta.fallbackIconClassName,
          )}
          aria-hidden
        >
          <Icon className="size-4 shrink-0 opacity-90" />
        </div>
      )}
      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="truncate text-sm font-medium leading-tight">{label}</p>
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
          <span className="shrink-0">{formatTxDate(row.date)}</span>
          {row.pending ? (
            <span className="shrink-0 rounded border border-amber-500/30 bg-amber-500/10 px-1.5 py-0 text-[10px] font-medium text-amber-800 dark:text-amber-200">
              Pending
            </span>
          ) : null}
        </div>
      </div>
      <div
        className={cn(
          "shrink-0 text-right text-sm font-medium tabular-nums",
          flow === "neutral" && "text-muted-foreground",
          flow === "in" && "text-emerald-600 dark:text-emerald-400",
          flow === "out" && "text-red-600 dark:text-red-400",
        )}
      >
        {flow === "neutral" ? (
          formatted
        ) : (
          <>
            {flow === "in" ? "+" : "-"}
            {formatted}
          </>
        )}
      </div>
    </div>
  );
}

export function RecentTransactionsSection() {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["get-recent-transactions", RECENT_LIMIT] as const,
    queryFn: () => fetchRecentTransactions(RECENT_LIMIT),
  });

  const items = data ?? [];

  return (
    <section className="flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm">
      <header className="flex min-w-0 shrink-0 flex-row items-start justify-between gap-2 px-3 py-2 sm:px-4 sm:py-2.5">
        <h2 className="font-heading text-base font-light tracking-tight sm:text-lg">
          Recent transactions
        </h2>
        <Link
          href="/transactions"
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
            {Array.from({ length: RECENT_LIMIT }, (_, i) => (
              <li
                key={i}
                className="flex items-center gap-3 border-b border-border/40 py-3 last:border-0"
              >
                <Skeleton className="size-9 shrink-0 rounded-lg" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-full max-w-48" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-4 w-16 shrink-0" />
              </li>
            ))}
          </ul>
        ) : isError ? (
          <p className="px-1 py-6 text-center text-sm text-destructive">
            {error instanceof Error
              ? error.message
              : "Could not load recent transactions."}
          </p>
        ) : !isPending && items.length === 0 ? (
          <p className="px-1 py-8 text-center text-sm text-muted-foreground">
            No transactions yet.
          </p>
        ) : !isError && !isPending ? (
          <div className="min-w-0">
            {items.map((row) => (
              <TransactionRow key={row.id} row={row} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
