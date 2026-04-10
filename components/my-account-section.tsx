"use client";

import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Building2, ChevronDown, Wallet } from "lucide-react";
import Link from "next/link";

import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchNetWorth } from "@/lib/api/analytics";
import type {
  LinkedBankAccountResponse,
  LinkedBankResponse,
} from "@/interface/plaid";
import { listPlaidConnections } from "@/lib/api/plaid";
import { useAuthStore } from "@/stores/auth-session";
import { cn } from "@/lib/utils";

function formatUsd(amount: number): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD",
    }).format(amount);
  } catch {
    return amount.toFixed(2);
  }
}

function formatMoney(
  amount: number | null,
  currency?: string | null,
): string {
  if (amount == null || Number.isNaN(amount)) return "—";
  const code = currency?.toUpperCase() || "USD";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: code,
    }).format(amount);
  } catch {
    return amount.toFixed(2);
  }
}

function accountLabel(account: LinkedBankAccountResponse): string {
  const official = account.officialName?.trim();
  const name = account.accountName.trim();
  const base = official || name || "Account";
  const mask = account.mask?.trim();
  return mask ? `${base} · ${mask}` : base;
}

function sumBankBalance(bank: LinkedBankResponse): number {
  return bank.accounts
    .filter((a) => a.isActive)
    .reduce((sum, a) => sum + (a.currentBalance ?? 0), 0);
}

function sumAllBanksBalance(banks: LinkedBankResponse[]): number {
  return banks.reduce((sum, b) => sum + sumBankBalance(b), 0);
}

function bankAccountsList(bank: LinkedBankResponse): ReactNode {
  const active = bank.accounts.filter((a) => a.isActive);
  if (active.length === 0) {
    return (
      <p className="pl-4 text-xs text-muted-foreground">No active accounts.</p>
    );
  }
  return (
    <div className="pl-4">
      <div className="divide-y divide-border/60">
        {active.map((account) => (
          <div
            key={account.id}
            className="flex gap-3 py-2.5 first:pt-0 last:pb-0"
          >
            <div className="min-w-0 flex-1 space-y-0.5">
              <p className="text-xs font-medium leading-snug">
                {accountLabel(account)}
              </p>
              <p className="text-[11px] leading-snug text-muted-foreground">
                {[account.type, account.subtype].filter(Boolean).join(" · ") ||
                  "—"}
              </p>
            </div>
            <p className="shrink-0 text-right text-xs font-medium tabular-nums">
              {formatMoney(account.currentBalance, account.isoCurrencyCode)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MyAccountSection() {
  const accessToken = useAuthStore((s) => s.accessToken);

  const { data: netWorth, isPending: isNetWorthPending } = useQuery({
    queryKey: ["analytics-net-worth"],
    queryFn: fetchNetWorth,
    enabled: Boolean(accessToken),
  });

  const { data: connections, isPending: isConnectionsPending } = useQuery({
    queryKey: ["list-plaid-connections"],
    queryFn: listPlaidConnections,
    enabled: Boolean(accessToken),
  });

  const banks = connections ?? [];

  const netWorthDisplay = netWorth?.netWorth ?? 0;
  const assetsDisplay = netWorth?.totalAssets ?? 0;
  const liabilitiesDisplay = netWorth?.totalLiabilities ?? 0;

  const aggregate = sumAllBanksBalance(banks);
  const banksCurrency =
    banks.find((b) => b.accounts[0]?.isoCurrencyCode)?.accounts[0]
      ?.isoCurrencyCode ?? "USD";

  return (
    <section className="flex h-full min-h-0 max-h-92 flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm sm:max-h-92">
      <header className="flex shrink-0 items-center justify-between gap-3 bg-card px-4 py-3 sm:px-5">
        <h2 className="font-heading text-base font-semibold tracking-tight sm:text-lg">
          My accounts
        </h2>
        <Link
          href="/profile#accounts"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "shrink-0",
          )}
        >
          Manage banks
        </Link>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 sm:px-3">
        <Accordion type="multiple" className="w-full">
          <AccordionItem
            value="net-worth"
            className="border-b border-border last:border-b-0"
          >
            <AccordionHeader className="flex w-full">
              <AccordionTrigger className="w-full gap-3 py-4 hover:no-underline">
                <span className="flex min-w-0 flex-1 items-center gap-2.5">
                  <Wallet
                    className="size-[1.125rem] shrink-0 text-foreground"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                  <span className="text-sm font-medium">Net worth</span>
                </span>
                <span className="shrink-0 tabular-nums text-sm font-semibold">
                  {isNetWorthPending ? (
                    <Skeleton className="inline-block h-5 w-24 rounded" />
                  ) : (
                    formatUsd(netWorthDisplay)
                  )}
                </span>
                <ChevronDown
                  className="chevron-accordion size-4 shrink-0 text-muted-foreground"
                  aria-hidden
                />
              </AccordionTrigger>
            </AccordionHeader>
            <AccordionContent className="pb-4">
              <div className="space-y-3 border-t border-border/80 pt-3 pl-7">
                {isNetWorthPending ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full max-w-xs" />
                    <Skeleton className="h-4 w-full max-w-xs" />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between gap-4 text-sm">
                      <span className="text-sm font-semibold leading-tight">
                        Assets
                      </span>
                      <span className="tabular-nums text-sm font-medium text-muted-foreground">
                        {formatUsd(assetsDisplay)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4 text-sm">
                      <span className="text-sm font-semibold leading-tight">
                        Liabilities
                      </span>
                      <span className="tabular-nums text-sm font-medium text-muted-foreground">
                        {formatUsd(liabilitiesDisplay)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem
            value="banks"
            className="border-b border-border last:border-b-0"
          >
            <AccordionHeader className="flex w-full">
              <AccordionTrigger className="w-full gap-3 py-4 hover:no-underline">
                <span className="flex min-w-0 flex-1 items-center gap-2.5">
                  <Building2
                    className="size-[1.125rem] shrink-0 text-foreground"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                  <span className="text-sm font-medium">Banks</span>
                </span>
                <span className="shrink-0 tabular-nums text-sm font-semibold">
                  {isConnectionsPending ? (
                    <Skeleton className="inline-block h-5 w-24 rounded" />
                  ) : banks.length === 0 ? (
                    "—"
                  ) : (
                    formatMoney(aggregate, banksCurrency)
                  )}
                </span>
                <ChevronDown
                  className="chevron-accordion size-4 shrink-0 text-muted-foreground"
                  aria-hidden
                />
              </AccordionTrigger>
            </AccordionHeader>
            <AccordionContent className="pb-4">
              <div className="space-y-8 border-t border-border/80 pt-4 pl-7">
                {isConnectionsPending ? (
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-40 rounded" />
                    <Skeleton className="h-16 w-full rounded-lg" />
                    <Skeleton className="h-16 w-full rounded-lg" />
                  </div>
                ) : banks.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No linked banks yet.{" "}
                    <Link
                      href="/profile#accounts"
                      className="font-medium text-foreground underline-offset-4 hover:underline"
                    >
                      Connect an institution
                    </Link>
                    .
                  </p>
                ) : (
                  <div className="flex flex-col divide-y divide-border/80">
                    {banks.map((bank) => {
                      const title =
                        bank.institutionName?.trim() || "Linked institution";
                      const needsAttention =
                        bank.status === "relink_required";
                      return (
                        <div
                          key={bank.id}
                          className="space-y-2 py-4 first:pt-0"
                        >
                          <div className="flex flex-wrap items-baseline justify-between gap-2">
                            <h3 className="text-sm font-semibold leading-tight">
                              {title}
                            </h3>
                            <span className="shrink-0 text-sm font-medium tabular-nums text-muted-foreground">
                              {formatMoney(
                                sumBankBalance(bank),
                                bank.accounts[0]?.isoCurrencyCode ?? "USD",
                              )}
                            </span>
                          </div>
                          {needsAttention ? (
                            <p className="text-xs text-amber-600 dark:text-amber-500">
                              Action required — reconnect in Manage banks
                            </p>
                          ) : null}
                          {bankAccountsList(bank)}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  );
}
