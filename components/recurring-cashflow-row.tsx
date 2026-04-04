"use client";

import {
  Check,
  HelpCircle,
  MoreHorizontal,
  Pencil,
  Trash2,
  Unlink,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  getPfcCategoryMeta,
  PFC_PRIMARY_UNCATEGORIZED_FILTER_CODE,
} from "@/components/transactions-filter";
import type { ProfileRecurringCashflowResponse } from "@/interface/profile-recurring-cashflow";
import { cn } from "@/lib/utils";
import { RECURRING_FREQUENCY_LABEL } from "@/schema/save-recurring-cashflow.schema";

type RecurringCashflowStatusKey = "active" | "unlinked";

const RECURRING_CASHFLOW_STATUS_BADGE: Record<
  RecurringCashflowStatusKey,
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
  unlinked: {
    label: "Unlinked",
    variant: "outline",
    Icon: Unlink,
    className: "text-muted-foreground",
  },
};

function formatRecurringStatusLabel(status: string | null | undefined): string {
  const s = status?.trim();
  if (!s) return "—";
  return s
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function getRecurringCashflowStatusConfig(status: string | null | undefined): {
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline";
  Icon: LucideIcon;
  className?: string;
} {
  const key = status?.trim().toLowerCase() ?? "";
  if (key === "active" || key === "unlinked") {
    return RECURRING_CASHFLOW_STATUS_BADGE[key];
  }
  return {
    label: formatRecurringStatusLabel(status),
    variant: "outline",
    Icon: HelpCircle,
    className: "text-muted-foreground",
  };
}

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

function formatNextDueDisplay(iso: string | null | undefined): {
  dateLine: string;
  relative: string | null;
} {
  if (iso == null || iso === "") {
    return { dateLine: "—", relative: null };
  }
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return { dateLine: "—", relative: null };
  }
  const dateLine = d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);
  const diffDays = Math.round(
    (target.getTime() - today.getTime()) / (24 * 60 * 60 * 1000),
  );

  let relative: string | null;
  if (diffDays === 0) relative = "Today";
  else if (diffDays === 1) relative = "Tomorrow";
  else if (diffDays === -1) relative = "Yesterday";
  else if (diffDays > 1) relative = `${diffDays} days`;
  else if (diffDays < -1) relative = `${Math.abs(diffDays)} days ago`;
  else relative = null;

  return { dateLine, relative };
}

function recurringCashflowTitle(row: ProfileRecurringCashflowResponse): string {
  const m = row.merchantName?.trim();
  if (m) return m;
  const d = row.description?.trim();
  if (d) return d;
  return "—";
}

export type RecurringCashflowRowProps = {
  row: ProfileRecurringCashflowResponse;
  accountLine: string;
  onEdit: (row: ProfileRecurringCashflowResponse) => void;
  onDelete: (id: string) => void;
};

export function RecurringCashflowRow({
  row,
  accountLine,
  onEdit,
  onDelete,
}: RecurringCashflowRowProps) {
  const title = recurringCashflowTitle(row);
  const statusConfig = getRecurringCashflowStatusConfig(row.status);
  const StatusIcon = statusConfig.Icon;

  const pfcCode =
    row.pfcPrimary?.trim() || PFC_PRIMARY_UNCATEGORIZED_FILTER_CODE;
  const catMeta = getPfcCategoryMeta(pfcCode);
  const CategoryIcon = catMeta.Icon;

  const { dateLine, relative } = formatNextDueDisplay(row.predictedNextDate);
  const freqLabel =
    RECURRING_FREQUENCY_LABEL[row.frequency] ?? row.frequency;
  const freqUpper = freqLabel.toUpperCase();

  const amountStr = `${row.direction === "inflow" ? "+" : "-"}${formatCurrencyUsd(row.expectedAmount)}`;
  const amountClass =
    row.direction === "inflow"
      ? "text-emerald-600 dark:text-emerald-400"
      : "text-destructive";

  return (
    <div
      className={cn(
        "flex w-full min-w-0 items-start gap-3 rounded-xl border border-border bg-card px-3 py-3 transition-colors",
        "hover:border-primary/40",
      )}
    >
      <div className="flex min-h-[2.5rem] min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-2">
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-lg border border-border/40",
            catMeta.fallbackIconClassName,
          )}
          aria-hidden
        >
          <CategoryIcon className="size-4 shrink-0 opacity-90" />
        </div>

        <div className="min-w-0 flex-[1_1_12rem]">
          <div className="flex min-w-0 items-center gap-2">
            <p className="min-w-0 truncate font-semibold leading-snug text-foreground">
              {title}
            </p>
            <Badge
              variant="outline"
              className={cn(
                "hidden max-w-[9rem] shrink-0 truncate border font-normal text-xs sm:inline-flex",
                catMeta.badgeClassName,
              )}
            >
              {catMeta.displayName}
            </Badge>
          </div>
          <p className="mt-0.5 truncate text-xs leading-snug text-muted-foreground">
            {accountLine}
          </p>
        </div>

        <Badge
          variant={statusConfig.variant}
          className={cn(
            "hidden shrink-0 gap-1 font-normal text-xs sm:inline-flex",
            statusConfig.className,
          )}
        >
          <StatusIcon className="size-3.5 shrink-0" aria-hidden />
          {statusConfig.label}
        </Badge>

        <div
          className={cn(
            "flex w-full min-w-0 basis-full flex-row items-end justify-between gap-4",
            "sm:contents",
          )}
        >
          <div className="min-w-0 shrink-0 text-left sm:text-right">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Next due
            </p>
            <p className="text-sm font-semibold tabular-nums text-foreground">
              {dateLine}
            </p>
            {relative ? (
              <p className="text-xs text-muted-foreground">{relative}</p>
            ) : null}
          </div>

          <div className="flex min-w-[6.5rem] shrink-0 flex-col items-end text-right">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              {freqUpper}
            </p>
            <p
              className={cn(
                "text-sm font-semibold tabular-nums",
                amountClass,
              )}
            >
              {amountStr}
            </p>
          </div>
        </div>
      </div>

      <div className="shrink-0 self-center">
        <DropdownMenu>
          <DropdownMenuTrigger
            type="button"
            className={cn(
              "inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground outline-none transition-colors",
              "hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
            )}
            aria-label={`Actions for ${row.id}`}
          >
            <MoreHorizontal className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-36">
            <DropdownMenuItem onClick={() => onEdit(row)}>
              <Pencil className="size-4 text-muted-foreground" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDelete(row.id)}
            >
              <Trash2 className="size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
