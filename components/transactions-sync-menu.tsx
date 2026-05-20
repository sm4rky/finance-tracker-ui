"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { LinkedBankResponse } from "@/interface/plaid";
import { syncPlaidTransactions } from "@/lib/api/plaid";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

const SYNC_COOLDOWN_MS = 30 * 60 * 1000;

function isSyncedWithin30Minutes(iso: string | null | undefined): boolean {
  if (iso == null || iso === "") return false;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  const ageMs = Date.now() - d.getTime();
  return ageMs >= 0 && ageMs < SYNC_COOLDOWN_MS;
}

function formatRelativeLastSync(iso: string | null | undefined): string {
  if (iso == null || iso === "") return "Never synced";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";

  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  if (diffMs < 0) {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(d);
  }

  const diffMin = Math.floor(diffMs / 60_000);
  const diffHr = Math.floor(diffMs / 3_600_000);
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  const startOfD = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dayDiff = Math.round(
    (startOfToday.getTime() - startOfD.getTime()) / 86_400_000,
  );

  if (dayDiff === 0) {
    if (diffMin < 1) return "Just now";
    if (diffHr < 1) {
      return diffMin === 1 ? "1 minute ago" : `${diffMin} minutes ago`;
    }
    return diffHr === 1 ? "1 hour ago" : `${diffHr} hours ago`;
  }
  if (dayDiff === 1) return "Yesterday";
  if (dayDiff >= 2 && dayDiff <= 7) return `${dayDiff} days ago`;
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(d);
}

export type TransactionsSyncMenuProps = {
  banks: LinkedBankResponse[] | undefined;
  className?: string;
};

export function TransactionsSyncMenu({
  banks,
  className,
}: TransactionsSyncMenuProps) {
  const isMobile = useIsMobile();
  const list = banks ?? [];
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

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
          queryKey: ["analytics-pfc-expense-distribution"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["analytics-stacked-expense-pfc-primary"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["analytics-grouped-expense-by-account"],
        }),
        queryClient.invalidateQueries({ queryKey: ["analytics-net-worth"] }),
        queryClient.invalidateQueries({
          queryKey: ["analytics-net-worth-trend"],
        }),
      ]);
      setOpen(false);
      toast.success("Transactions synced");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Sync failed");
    },
  });

  const syncingId =
    syncMutation.isPending && syncMutation.variables != null
      ? syncMutation.variables
      : null;

  return (
    <DropdownMenu modal={false} open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        type="button"
        className={cn(
          buttonVariants({
            variant: !isMobile && open ? "secondary" : "outline",
          }),
          "gap-1.5",
          className,
        )}
      >
        <RefreshCw className="size-4" aria-hidden />
        Sync
        {!isMobile ? (
          <ChevronDown
            className={cn("size-4 transition-transform", open && "rotate-180")}
            aria-hidden
          />
        ) : null}
        <span className="sr-only">Open sync status by bank</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-92 max-w-[calc(100vw-2rem)] p-1"
      >
        {list.length === 0 ? (
          <div className="px-3 py-6 text-center text-sm text-muted-foreground">
            No linked banks
          </div>
        ) : (
          list.map((bank) => {
            const title = (
              bank.institutionName?.trim() || "Linked bank"
            ).toUpperCase();
            const status = formatRelativeLastSync(bank.lastSyncedAt);
            const onCooldown = isSyncedWithin30Minutes(bank.lastSyncedAt);
            const syncing = syncingId === bank.id;

            return (
              <DropdownMenuItem
                key={bank.id}
                disabled={onCooldown || syncing}
                closeOnClick={false}
                onClick={() => syncMutation.mutate(bank.id)}
                className="flex items-center justify-between gap-3 px-3 py-3"
              >
                <span className="flex min-w-0 flex-1 items-center gap-2">
                  {syncing ? (
                    <Loader2
                      className="size-4 shrink-0 animate-spin text-foreground/55"
                      aria-hidden
                    />
                  ) : (
                    <RefreshCw
                      className="size-4 shrink-0 text-foreground/55"
                      aria-hidden
                    />
                  )}
                  <span className="truncate text-xs font-semibold text-foreground">
                    {title}
                  </span>
                </span>
                <span className="max-w-[60%] shrink-0 text-right text-[11px] text-muted-foreground">
                  Last sync at: {status}
                </span>
              </DropdownMenuItem>
            );
          })
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
