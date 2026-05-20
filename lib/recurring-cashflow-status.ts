import { Check, HelpCircle, Unlink, type LucideIcon } from "lucide-react";

export type RecurringCashflowStatus = "active" | "unlinked";

export const RECURRING_CASHFLOW_STATUSES: RecurringCashflowStatus[] =
  ["active", "unlinked"];

export type RecurringCashflowStatusMeta = {
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline";
  Icon: LucideIcon;
  className?: string;
};

export const RECURRING_CASHFLOW_STATUS_METAS: Record<
  RecurringCashflowStatus,
  RecurringCashflowStatusMeta
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
  const trimmed = status?.trim();
  if (!trimmed) return "—";
  return trimmed
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function getRecurringCashflowStatusMeta(
  status: string | null | undefined,
): RecurringCashflowStatusMeta {
  const key = status?.trim().toLowerCase() ?? "";
  if (key === "active" || key === "unlinked") {
    return RECURRING_CASHFLOW_STATUS_METAS[key];
  }

  return {
    label: formatRecurringStatusLabel(status),
    variant: "outline",
    Icon: HelpCircle,
    className: "text-muted-foreground",
  };
}
