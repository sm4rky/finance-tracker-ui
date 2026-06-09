"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import {
  AlertTriangle,
  Building2,
  Check,
  ChevronDown,
  Link2,
  Loader2,
  MoreVertical,
  RefreshCw,
  SlidersHorizontal,
  Unlink,
  WifiOff,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import {
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LinkedBankAccountRow } from "@/components/linked-bank-account-row";
import { RelinkInstitutionDialog } from "@/components/relink-institution-dialog";
import { UnlinkInstitutionDialog } from "@/components/unlink-institution-dialog";
import { ConfirmPlaidUpdateAccountsDialog } from "@/components/confirm-plaid-update-accounts-dialog";
import {
  UpdateLinkedAccountsDialog,
  type AccountOptOutPayload,
} from "@/components/update-linked-accounts-dialog";
import type { LinkedBankResponse, LinkedBankStatus } from "@/interface/plaid";
import { syncPlaidTransactions } from "@/lib/api/plaid";
import { getPlaidInstitutionIcon } from "@/lib/plaid-institution-icons";
import { cn } from "@/lib/utils";

const SYNC_COOLDOWN_MS = 30 * 60 * 1000;

function isSyncedWithin30Minutes(iso: string | null | undefined): boolean {
  if (iso == null || iso === "") return false;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  const ageMs = Date.now() - d.getTime();
  return ageMs >= 0 && ageMs < SYNC_COOLDOWN_MS;
}

function formatMoney(amount: number | null, currency?: string | null): string {
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

function formatRelativeSync(iso: string | null): string {
  if (!iso) return "Never";

  const then = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - then.getTime();

  if (diffMs < 0) return "Just now";

  const minuteMs = 60_000;
  const hourMs = 60 * minuteMs;
  const dayMs = 24 * hourMs;

  if (diffMs < minuteMs) return "Just now";

  if (diffMs < hourMs) {
    const minutes = Math.floor(diffMs / minuteMs);
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
  }

  if (diffMs < dayMs) {
    const hours = Math.floor(diffMs / hourMs);
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  }

  if (diffMs < 2 * dayMs) return "Yesterday";

  const days = Math.floor(diffMs / dayMs);
  if (days <= 7) {
    return `${days} days ago`;
  }

  return then.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const LINKED_BANK_STATUS_BADGE: Record<
  LinkedBankStatus,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
    Icon: LucideIcon;
    className?: string;
  }
> = {
  active: {
    label: "Active",
    variant: "secondary",
    Icon: Check,
    className:
      "border-emerald-500/20 bg-emerald-500/15 text-emerald-800 dark:text-emerald-400",
  },
  disconnected: {
    label: "Disconnected",
    variant: "outline",
    Icon: WifiOff,
    className: "text-muted-foreground",
  },
  relink_required: {
    label: "Relink required",
    variant: "destructive",
    Icon: AlertTriangle,
  },
};

export type LinkedBankRowProps = {
  bank: LinkedBankResponse;
};

export function LinkedBankRow({ bank }: LinkedBankRowProps) {
  const queryClient = useQueryClient();
  const [relinkOpen, setRelinkOpen] = useState(false);
  const [unlinkOpen, setUnlinkOpen] = useState(false);
  const [updateAccountsOpen, setUpdateAccountsOpen] = useState(false);
  const [accountOptOut, setAccountOptOut] =
    useState<AccountOptOutPayload | null>(null);

  const syncMutation = useMutation({
    mutationFn: syncPlaidTransactions,
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["list-plaid-connections"],
      });
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["query-transaction-list"] }),
        queryClient.invalidateQueries({
          queryKey: ["get-recent-transactions"],
        }),
        queryClient.invalidateQueries({ queryKey: ["analytics-cashflow"] }),
        queryClient.invalidateQueries({
          queryKey: ["analytics-category-expense-distribution"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["analytics-stacked-expense-category"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["analytics-grouped-expense-by-account"],
        }),
        queryClient.invalidateQueries({ queryKey: ["analytics-net-worth"] }),
        queryClient.invalidateQueries({
          queryKey: ["analytics-net-worth-trend"],
        }),
      ]);
      toast.success("Transactions synced");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Sync failed");
    },
  });

  const syncing = syncMutation.isPending && syncMutation.variables === bank.id;
  const syncOnCooldown = isSyncedWithin30Minutes(bank.lastSyncedAt);
  const needsRelink = bank.status === "relink_required";
  const canManageAccounts = bank.status === "active" && !needsRelink;

  const statusConfig = LINKED_BANK_STATUS_BADGE[bank.status];
  const StatusIcon = statusConfig.Icon;

  const accountCount = bank.accounts.length;
  const institutionName = bank.institutionName?.trim() || "Linked institution";
  const institutionIcon = getPlaidInstitutionIcon(institutionName);
  const currencyCode = bank.accounts[0]?.isoCurrencyCode ?? "USD";
  const totalBalance = bank.accounts.reduce(
    (sum, account) => sum + (account.currentBalance ?? 0),
    0,
  );

  return (
    <AccordionItem
      value={bank.id}
      className="overflow-hidden rounded-xl border border-border bg-background/50"
    >
      <AccordionHeader className="relative border-0 p-0">
        <AccordionTrigger
          className={cn(
            "min-h-18 w-full gap-2 px-3 py-3 pr-20 sm:min-h-0 sm:gap-3 sm:px-4 sm:pr-24",
            "flex-wrap items-start sm:flex-nowrap sm:items-center",
          )}
        >
          <div className="flex min-w-0 flex-1 basis-full items-center gap-3 sm:basis-auto sm:flex-row">
            <div
              className={cn(
                "flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg",
                institutionIcon ? null : "bg-muted",
              )}
              aria-hidden
            >
              {institutionIcon ? (
                <Image
                  src={institutionIcon.src}
                  alt={institutionIcon.alt}
                  width={32}
                  height={32}
                  className="size-8 object-contain"
                />
              ) : (
                <Building2 className="size-5 text-muted-foreground" />
              )}
            </div>

            <div className="min-w-0 flex-1 text-left">
              <p className="font-semibold leading-snug text-foreground">
                <span>{institutionName}</span>
                <span className="font-normal text-xs text-muted-foreground">
                  {" "}
                  ({accountCount} {accountCount === 1 ? "account" : "accounts"})
                </span>
              </p>

              <p className="mt-0.5 text-xs text-muted-foreground">
                Last sync: {formatRelativeSync(bank.lastSyncedAt)}
              </p>
            </div>
          </div>

          <div className="flex w-full items-center justify-between gap-2 pl-13 sm:w-auto sm:flex-1 sm:justify-end sm:pl-0">
            <div className="flex shrink-0 flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-3">
              <Badge
                variant={statusConfig.variant}
                className={cn("gap-1", statusConfig.className)}
              >
                <StatusIcon className="size-3.5 shrink-0" aria-hidden />
                {statusConfig.label}
              </Badge>
            </div>

            <div className="min-w-0 shrink text-right">
              <p className="whitespace-nowrap text-[10px] uppercase leading-tight tracking-wide text-muted-foreground sm:text-[11px]">
                Total Balance
              </p>
              <p className="whitespace-nowrap text-xs font-semibold tabular-nums text-emerald-600 sm:text-sm dark:text-emerald-400">
                {formatMoney(totalBalance, currencyCode)}
              </p>
            </div>
          </div>

          <ChevronDown
            className="chevron-accordion absolute right-3 top-1/2 size-4 shrink-0 -translate-y-1/2 text-muted-foreground transition-transform duration-200"
            aria-hidden
          />
        </AccordionTrigger>

        <div className="pointer-events-none absolute inset-y-0 right-10 z-10 flex items-center sm:right-12">
          <div className="pointer-events-auto">
            <DropdownMenu>
              <DropdownMenuTrigger
                type="button"
                className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                aria-label="Institution options"
              >
                <MoreVertical className="size-4" />
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="min-w-44">
                {needsRelink ? (
                  <DropdownMenuItem onClick={() => setRelinkOpen(true)}>
                    <Link2 className="size-4 text-muted-foreground" />
                    Reconnect
                  </DropdownMenuItem>
                ) : null}

                {canManageAccounts ? (
                  <DropdownMenuItem onClick={() => setUpdateAccountsOpen(true)}>
                    <SlidersHorizontal className="size-4 text-muted-foreground" />
                    Manage linked accounts
                    {bank.hasPendingUpdateAccountDecisions ? (
                      <span className="ml-1 text-xs text-amber-600 dark:text-amber-400">
                        (action needed)
                      </span>
                    ) : null}
                  </DropdownMenuItem>
                ) : null}

                <DropdownMenuItem
                  disabled={syncOnCooldown || syncing}
                  closeOnClick={false}
                  onClick={() => syncMutation.mutate(bank.id)}
                >
                  {syncing ? (
                    <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />
                  ) : (
                    <RefreshCw className="size-4 text-muted-foreground" />
                  )}
                  Sync Now
                </DropdownMenuItem>

                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => setUnlinkOpen(true)}
                >
                  <Unlink className="size-4" />
                  Unlink Institution
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </AccordionHeader>

      <AccordionContent className="border-t border-border/80 px-0">
        <ul className="divide-y divide-border/80 px-3 pb-3 pt-4 sm:px-4">
          {bank.accounts.map((account) => (
            <LinkedBankAccountRow key={account.id} account={account} />
          ))}
        </ul>
      </AccordionContent>

      <RelinkInstitutionDialog
        bank={bank}
        open={relinkOpen}
        onOpenChange={setRelinkOpen}
      />

      <UnlinkInstitutionDialog
        bank={bank}
        open={unlinkOpen}
        onOpenChange={setUnlinkOpen}
      />

      <UpdateLinkedAccountsDialog
        bank={bank}
        open={updateAccountsOpen}
        onOpenChange={setUpdateAccountsOpen}
        onAccountOptOutRequired={setAccountOptOut}
      />

      {accountOptOut ? (
        <ConfirmPlaidUpdateAccountsDialog
          key={`${accountOptOut.linkedBankId}-${accountOptOut.pendingDeselectedAccounts.map((a) => a.plaidAccountId).join(",")}`}
          linkedBankId={accountOptOut.linkedBankId}
          institutionName={institutionName}
          pendingDeselected={accountOptOut.pendingDeselectedAccounts}
          open
          onOpenChange={(next) => {
            if (!next) setAccountOptOut(null);
          }}
        />
      ) : null}
    </AccordionItem>
  );
}
