"use client";

import {
  AlertTriangle,
  Building2,
  Check,
  ChevronDown,
  MoreVertical,
  RefreshCw,
  Unlink,
  WifiOff,
  type LucideIcon,
} from "lucide-react";

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
import type { LinkedBankResponse, LinkedBankStatus } from "@/interface/plaid";
import { cn } from "@/lib/utils";

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
  const statusConfig = LINKED_BANK_STATUS_BADGE[bank.status];
  const StatusIcon = statusConfig.Icon;

  const accountCount = bank.accounts.length;
  const institutionName = bank.institutionName?.trim() || "Linked institution";
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
            "min-h-[4.5rem] w-full gap-2 px-3 py-3 pr-20 sm:min-h-0 sm:gap-3 sm:px-4 sm:pr-24",
            "flex-wrap items-start sm:flex-nowrap sm:items-center",
          )}
        >
          <div className="flex min-w-0 flex-1 basis-full items-center gap-3 sm:basis-auto sm:flex-row">
            <div
              className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted"
              aria-hidden
            >
              <Building2 className="size-5 text-muted-foreground" />
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

          <div className="flex w-full items-center justify-between gap-2 pl-[3.25rem] sm:w-auto sm:flex-1 sm:justify-end sm:pl-0">
            <div className="text-left sm:text-right">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Total Balance
              </p>
              <p className="text-sm font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                {formatMoney(totalBalance, currencyCode)}
              </p>
            </div>

            <div className="flex shrink-0 flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-3">
              <Badge
                variant={statusConfig.variant}
                className={cn("gap-1", statusConfig.className)}
              >
                <StatusIcon className="size-3.5 shrink-0" aria-hidden />
                {statusConfig.label}
              </Badge>
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
                <DropdownMenuItem onClick={() => {}}>
                  <RefreshCw className="size-4 text-muted-foreground" />
                  Sync Now
                </DropdownMenuItem>

                <DropdownMenuItem variant="destructive" onClick={() => {}}>
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
    </AccordionItem>
  );
}