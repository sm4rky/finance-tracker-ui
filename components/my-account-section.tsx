"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowUpRight,
  Building2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

import { BankAccountCard } from "@/components/bank-account-card";
import {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLinkedBanks } from "@/hooks/use-linked-banks";
import { fetchNetWorth } from "@/lib/api/analytics";
import { cn } from "@/lib/utils";

function formatUsd(amount: number): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function MyAccountSection() {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const { data, isPending } = useQuery({
    queryKey: ["analytics-net-worth"],
    queryFn: fetchNetWorth,
  });

  const { banks, isLoading: isBanksLoading } = useLinkedBanks();

  const accountCards = banks.flatMap((bank) =>
    bank.accounts
      .filter((account) => account.isActive)
      .map((account) => ({
        account,
        institutionName: bank.institutionName?.trim() || "Linked institution",
      })),
  );

  const selectedAccount = accountCards[selectedIndex] ?? null;

  function getSelectedCardIndex() {
    return Math.min(
      Math.max(selectedIndex, 0),
      Math.max(accountCards.length - 1, 0),
    );
  }

  function handlePreviousCard() {
    const previousIndex = Math.max(getSelectedCardIndex() - 1, 0);
    setSelectedIndex(previousIndex);
    carouselApi?.scrollTo(previousIndex);
  }

  function handleNextCard() {
    const nextIndex = Math.min(
      getSelectedCardIndex() + 1,
      accountCards.length - 1,
    );
    setSelectedIndex(nextIndex);
    carouselApi?.scrollTo(nextIndex);
  }

  useEffect(() => {
    if (!carouselApi) return;

    const syncSelectedCard = () => {
      setSelectedIndex(carouselApi.selectedScrollSnap());
    };

    syncSelectedCard();
    carouselApi.on("select", syncSelectedCard);
    carouselApi.on("reInit", syncSelectedCard);

    return () => {
      carouselApi.off("select", syncSelectedCard);
      carouselApi.off("reInit", syncSelectedCard);
    };
  }, [carouselApi]);

  return (
    <section className="flex h-full min-h-0 w-full min-w-0 flex-col gap-8 rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm">
      <div className="min-w-0 space-y-4">
        <div className="min-w-0 space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            NETWORTH
          </p>
          {isPending ? (
            <Skeleton className="h-10 w-48" />
          ) : (
            <p className="truncate text-4xl font-semibold tracking-tight tabular-nums">
              {formatUsd(data?.netWorth ?? 0)}
            </p>
          )}
        </div>

        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex min-w-0 items-center justify-between gap-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              ASSETS
            </p>
            {isPending ? (
              <Skeleton className="h-5 w-28" />
            ) : (
              <p className="min-w-0 truncate text-right text-sm font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                {formatUsd(data?.totalAssets ?? 0)}
              </p>
            )}
          </div>

          <div className="flex min-w-0 items-center justify-between gap-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              LIABILITIES
            </p>
            {isPending ? (
              <Skeleton className="h-5 w-28" />
            ) : (
              <p className="min-w-0 truncate text-right text-sm font-semibold tabular-nums text-destructive">
                {formatUsd(data?.totalLiabilities ?? 0)}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="min-w-0 space-y-2">
        <div className="flex min-w-0 items-center justify-between">
          <h1 className="font-heading text-base font-semibold tracking-tight">
            Cards
          </h1>
          <div className="flex items-center gap-2">
            {accountCards.length > 1 ? (
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  disabled={getSelectedCardIndex() === 0}
                  onClick={handlePreviousCard}
                  aria-label="Previous card"
                >
                  <ChevronLeft className="size-4 shrink-0" aria-hidden />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  disabled={getSelectedCardIndex() >= accountCards.length - 1}
                  onClick={handleNextCard}
                  aria-label="Next card"
                >
                  <ChevronRight className="size-4 shrink-0" aria-hidden />
                </Button>
              </div>
            ) : null}
            <Link
              href="/profile#accounts"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "shrink-0",
              )}
            >
              <ArrowUpRight
                className="opacity-90"
                strokeWidth={1.75}
                aria-hidden
              />
              Manage banks
            </Link>
          </div>
        </div>

        {isBanksLoading ? (
          <Skeleton className="aspect-[1.6/1] min-w-0 max-w-full rounded-xl" />
        ) : accountCards.length === 0 ? (
          <div className="w-full p-4 flex flex-col items-center justify-center gap-3 text-center">
            <Building2 className="size-10 text-muted-foreground" aria-hidden />
            <div>
              <div className="font-medium">No active bank accounts.</div>
              <p className="text-sm text-muted-foreground">
                Connect a bank to start syncing accounts and balances.
              </p>
            </div>
            <Link
              href="/profile#accounts"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "shrink-0",
              )}
            >
              <ArrowUpRight
                className="opacity-90"
                strokeWidth={1.75}
                aria-hidden
              />
              Manage banks
            </Link>
          </div>
        ) : (
          <Carousel setApi={setCarouselApi}>
            <CarouselContent className="-ml-3 py-2">
              {accountCards.map(({ account, institutionName }, index) => (
                <CarouselItem key={account.id} className="pl-3 basis-[20rem]">
                  <BankAccountCard
                    account={account}
                    institutionName={institutionName}
                    className={
                      getSelectedCardIndex() === index
                        ? "opacity-100"
                        : "opacity-35"
                    }
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        )}

        {accountCards.length > 0 && selectedAccount != null ? (
          <div className="flex min-w-0 flex-col gap-2">
            <div className="flex min-w-0 justify-between items-center gap-4 text-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                BANK
              </p>
              <p
                className="min-w-0 truncate text-right text-sm font-semibold tabular-nums"
                title={selectedAccount.institutionName}
              >
                {selectedAccount.institutionName}
              </p>
            </div>
            <div className="flex min-w-0 justify-between items-center gap-4 text-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                ACCOUNT
              </p>
              <p
                className="min-w-0 truncate text-right text-sm font-semibold tabular-nums"
                title={
                  selectedAccount.account.officialName?.trim() ||
                  selectedAccount.account.accountName?.trim() ||
                  "Account"
                }
              >
                {selectedAccount.account.officialName?.trim() ||
                  selectedAccount.account.accountName?.trim() ||
                  "Account"}
              </p>
            </div>
            <div className="flex min-w-0 justify-between items-center gap-4 text-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                MASK
              </p>
              <p
                className="min-w-0 truncate text-right text-sm font-semibold tabular-nums"
                title={selectedAccount.account.mask ?? "—"}
              >
                {selectedAccount.account.mask || "—"}
              </p>
            </div>
            <div className="flex min-w-0 justify-between items-center gap-4 text-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                TYPE
              </p>
              <p
                className="min-w-0 truncate text-right text-sm font-semibold tabular-nums"
                title={selectedAccount.account.type ?? "—"}
              >
                {selectedAccount.account.type ?? "—"}
              </p>
            </div>
            <div className="flex min-w-0 justify-between items-center gap-4 text-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                SUBTYPE
              </p>
              <p
                className="min-w-0 truncate text-right text-sm font-semibold tabular-nums"
                title={selectedAccount.account.subtype ?? "—"}
              >
                {selectedAccount.account.subtype ?? "—"}
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
