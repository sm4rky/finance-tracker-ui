"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import type { ColumnDef, Table as TanStackTable } from "@tanstack/react-table";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Car,
  CircleDollarSign,
  CircleHelp,
  Clapperboard,
  Hammer,
  HandCoins,
  HeartPulse,
  Home,
  Landmark,
  MoreHorizontal,
  Pencil,
  Plane,
  Receipt,
  ShoppingBag,
  Sparkles,
  Tag,
  Trash2,
  UtensilsCrossed,
  Wallet,
  Wrench,
} from "lucide-react";

import { DataTableColumnHeader } from "@/components/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { TransactionResponse } from "@/interface/transaction";
import { cn } from "@/lib/utils";

type PfcPrimaryMeta = {
  displayName: string;
  badgeClassName: string;
  fallbackIconClassName: string;
  Icon: LucideIcon;
};

type PaymentChannelMeta = {
  displayName: string;
  badgeClassName: string;
};

type TransactionCashFlow = "in" | "out" | "neutral";

const PFC_PRIMARY_BY_CODE: Record<string, PfcPrimaryMeta> = {
  BANK_FEES: {
    displayName: "Bank fees",
    badgeClassName:
      "border-slate-500/25 bg-slate-500/15 text-slate-900 dark:text-slate-100",
    fallbackIconClassName:
      "bg-slate-500/15 text-slate-800 dark:text-slate-200",
    Icon: CircleDollarSign,
  },
  ENTERTAINMENT: {
    displayName: "Entertainment",
    badgeClassName:
      "border-violet-500/25 bg-violet-500/15 text-violet-900 dark:text-violet-100",
    fallbackIconClassName:
      "bg-violet-500/15 text-violet-800 dark:text-violet-200",
    Icon: Clapperboard,
  },
  FOOD_AND_DRINK: {
    displayName: "Food & drink",
    badgeClassName:
      "border-orange-500/25 bg-orange-500/15 text-orange-950 dark:text-orange-100",
    fallbackIconClassName:
      "bg-orange-500/15 text-orange-900 dark:text-orange-200",
    Icon: UtensilsCrossed,
  },
  GENERAL_MERCHANDISE: {
    displayName: "General merchandise",
    badgeClassName:
      "border-sky-500/25 bg-sky-500/15 text-sky-950 dark:text-sky-100",
    fallbackIconClassName: "bg-sky-500/15 text-sky-900 dark:text-sky-200",
    Icon: ShoppingBag,
  },
  GENERAL_SERVICES: {
    displayName: "General services",
    badgeClassName:
      "border-zinc-500/25 bg-zinc-500/15 text-zinc-900 dark:text-zinc-100",
    fallbackIconClassName: "bg-zinc-500/15 text-zinc-800 dark:text-zinc-200",
    Icon: Wrench,
  },
  GOVERNMENT_AND_NON_PROFIT: {
    displayName: "Government & nonprofit",
    badgeClassName:
      "border-indigo-500/25 bg-indigo-500/15 text-indigo-950 dark:text-indigo-100",
    fallbackIconClassName:
      "bg-indigo-500/15 text-indigo-900 dark:text-indigo-200",
    Icon: Landmark,
  },
  HOME_IMPROVEMENT: {
    displayName: "Home improvement",
    badgeClassName:
      "border-amber-700/25 bg-amber-700/15 text-amber-950 dark:text-amber-100",
    fallbackIconClassName:
      "bg-amber-700/15 text-amber-900 dark:text-amber-200",
    Icon: Hammer,
  },
  INCOME: {
    displayName: "Income",
    badgeClassName:
      "border-emerald-600/25 bg-emerald-600/15 text-emerald-950 dark:text-emerald-100",
    fallbackIconClassName:
      "bg-emerald-600/15 text-emerald-900 dark:text-emerald-200",
    Icon: Wallet,
  },
  LOAN_DISBURSEMENTS: {
    displayName: "Loan disbursements",
    badgeClassName:
      "border-teal-500/25 bg-teal-500/15 text-teal-950 dark:text-teal-100",
    fallbackIconClassName: "bg-teal-500/15 text-teal-900 dark:text-teal-200",
    Icon: HandCoins,
  },
  LOAN_PAYMENTS: {
    displayName: "Loan payments",
    badgeClassName:
      "border-rose-500/25 bg-rose-500/15 text-rose-950 dark:text-rose-100",
    fallbackIconClassName: "bg-rose-500/15 text-rose-900 dark:text-rose-200",
    Icon: Receipt,
  },
  MEDICAL: {
    displayName: "Medical",
    badgeClassName:
      "border-red-500/25 bg-red-500/15 text-red-950 dark:text-red-100",
    fallbackIconClassName: "bg-red-500/15 text-red-900 dark:text-red-200",
    Icon: HeartPulse,
  },
  OTHER: {
    displayName: "Other",
    badgeClassName:
      "border-neutral-500/25 bg-neutral-500/15 text-neutral-900 dark:text-neutral-100",
    fallbackIconClassName:
      "bg-neutral-500/15 text-neutral-800 dark:text-neutral-200",
    Icon: CircleHelp,
  },
  PERSONAL_CARE: {
    displayName: "Personal care",
    badgeClassName:
      "border-fuchsia-500/25 bg-fuchsia-500/15 text-fuchsia-950 dark:text-fuchsia-100",
    fallbackIconClassName:
      "bg-fuchsia-500/15 text-fuchsia-900 dark:text-fuchsia-200",
    Icon: Sparkles,
  },
  RENT_AND_UTILITIES: {
    displayName: "Rent & utilities",
    badgeClassName:
      "border-cyan-600/25 bg-cyan-600/15 text-cyan-950 dark:text-cyan-100",
    fallbackIconClassName: "bg-cyan-600/15 text-cyan-900 dark:text-cyan-200",
    Icon: Home,
  },
  TRANSFER_IN: {
    displayName: "Transfer in",
    badgeClassName:
      "border-lime-600/25 bg-lime-600/15 text-lime-950 dark:text-lime-100",
    fallbackIconClassName: "bg-lime-600/15 text-lime-900 dark:text-lime-200",
    Icon: ArrowDownLeft,
  },
  TRANSFER_OUT: {
    displayName: "Transfer out",
    badgeClassName:
      "border-amber-600/25 bg-amber-600/15 text-amber-950 dark:text-amber-100",
    fallbackIconClassName:
      "bg-amber-600/15 text-amber-900 dark:text-amber-200",
    Icon: ArrowUpRight,
  },
  TRANSPORTATION: {
    displayName: "Transportation",
    badgeClassName:
      "border-blue-600/25 bg-blue-600/15 text-blue-950 dark:text-blue-100",
    fallbackIconClassName: "bg-blue-600/15 text-blue-900 dark:text-blue-200",
    Icon: Car,
  },
  TRAVEL: {
    displayName: "Travel",
    badgeClassName:
      "border-purple-600/25 bg-purple-600/15 text-purple-950 dark:text-purple-100",
    fallbackIconClassName:
      "bg-purple-600/15 text-purple-900 dark:text-purple-200",
    Icon: Plane,
  },
};

const PFC_PRIMARY_FALLBACK: PfcPrimaryMeta = {
  displayName: "Uncategorized",
  badgeClassName:
    "border-muted-foreground/25 bg-muted text-muted-foreground",
  fallbackIconClassName: "bg-muted text-muted-foreground",
  Icon: Tag,
};

const PAYMENT_CHANNEL_META_BY_KEY: Record<string, PaymentChannelMeta> = {
  online: {
    displayName: "Online",
    badgeClassName:
      "border-sky-500/30 bg-sky-500/15 text-sky-950 dark:text-sky-100",
  },
  instore: {
    displayName: "In store",
    badgeClassName:
      "border-violet-500/30 bg-violet-500/15 text-violet-950 dark:text-violet-100",
  },
  other: {
    displayName: "Other",
    badgeClassName:
      "border-zinc-500/30 bg-zinc-500/15 text-zinc-900 dark:text-zinc-100",
  },
};

const PFC_MONEY_IN_CODES = new Set([
  "INCOME",
  "TRANSFER_IN",
  "LOAN_DISBURSEMENTS",
]);

const PFC_MONEY_OUT_CODES = new Set(["TRANSFER_OUT", "LOAN_PAYMENTS"]);

function SelectAllCheckbox<TData>({
  table,
}: {
  table: TanStackTable<TData>;
}) {
  const allSelected = table.getIsAllPageRowsSelected();
  const someSelected = table.getIsSomePageRowsSelected();

  return (
    <Checkbox
      checked={allSelected}
      indeterminate={someSelected && !allSelected}
      onCheckedChange={(checked) => table.toggleAllPageRowsSelected(!!checked)}
      aria-label="Select all on this page"
    />
  );
}

function getPfcPrimaryMeta(code: string | null | undefined): PfcPrimaryMeta {
  const normalized = code?.trim().toUpperCase();
  return normalized ? PFC_PRIMARY_BY_CODE[normalized] ?? PFC_PRIMARY_FALLBACK : PFC_PRIMARY_FALLBACK;
}

function getMerchantLabel(row: TransactionResponse): string {
  return row.merchantName?.trim() || row.name?.trim() || "—";
}

function MerchantCell({ row }: { row: TransactionResponse }) {
  const [imgFailed, setImgFailed] = useState(false);

  const meta = getPfcPrimaryMeta(row.pfcPrimary);
  const label = getMerchantLabel(row);
  const logoUrl = row.logoUrl?.trim();
  const shouldShowImage = Boolean(logoUrl) && !imgFailed;

  const Icon = meta.Icon;

  return (
    <div className="flex min-w-0 max-w-[min(100%,16rem)] items-center gap-3">
      {shouldShowImage ? (
        <img
          src={logoUrl}
          alt=""
          className="size-9 shrink-0 rounded-lg border border-border/60 bg-muted object-contain"
          loading="lazy"
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

      <span className="min-w-0 truncate font-medium">{label}</span>
    </div>
  );
}

function formatDetailCategory(raw: string | null | undefined): string {
  const trimmed = raw?.trim();
  return trimmed ? trimmed.replace(/_/g, " ") : "—";
}

function formatTxDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getTransactionCashFlow(
  row: Pick<TransactionResponse, "amount" | "pfcPrimary">,
): TransactionCashFlow {
  if (row.amount === 0) return "neutral";

  const code = row.pfcPrimary?.trim().toUpperCase();
  if (code && PFC_MONEY_IN_CODES.has(code)) return "in";
  if (code && PFC_MONEY_OUT_CODES.has(code)) return "out";

  return row.amount < 0 ? "in" : "out";
}

function formatMoneyAbs(absAmount: number, currency?: string | null): string {
  const code = currency?.toUpperCase() || "USD";

  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: code,
    }).format(absAmount);
  } catch {
    return absAmount.toFixed(2);
  }
}

function AmountCell({ row }: { row: TransactionResponse }) {
  const flow = getTransactionCashFlow(row);
  const formatted = formatMoneyAbs(Math.abs(row.amount), row.isoCurrencyCode);

  if (flow === "neutral") {
    return (
      <div className="text-right font-medium tabular-nums text-muted-foreground">
        {formatted}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "text-right font-medium tabular-nums",
        flow === "in"
          ? "text-emerald-600 dark:text-emerald-400"
          : "text-red-600 dark:text-red-400",
      )}
    >
      {flow === "in" ? "+" : "-"}
      {formatted}
    </div>
  );
}

function getPaymentChannelMeta(
  raw: string | null | undefined,
): PaymentChannelMeta {
  const trimmed = raw?.trim();
  if (!trimmed) {
    return {
      displayName: "—",
      badgeClassName:
        "border-muted-foreground/20 bg-muted/80 text-muted-foreground",
    };
  }

  const normalizedKey = trimmed.toLowerCase().replace(/[\s_]+/g, "");
  return (
    PAYMENT_CHANNEL_META_BY_KEY[normalizedKey] ?? {
      displayName: trimmed,
      badgeClassName:
        "border-muted-foreground/25 bg-muted text-muted-foreground",
    }
  );
}

function TransactionRowActions({
  row,
  onEdit,
}: {
  row: TransactionResponse;
  onEdit?: (row: TransactionResponse) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        type="button"
        className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        aria-label={`Actions for transaction ${row.id}`}
      >
        <MoreHorizontal className="size-4" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="min-w-36">
        <DropdownMenuItem onClick={() => onEdit?.(row)}>
          <Pencil className="size-4 text-muted-foreground" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onClick={() => {}}>
          <Trash2 className="size-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export type CreateTransactionColumnsOptions = {
  onEdit?: (row: TransactionResponse) => void;
};

export function createTransactionColumns(
  accountLabelMap: Map<string, string>,
  options?: CreateTransactionColumnsOptions,
): ColumnDef<TransactionResponse>[] {
  return [
    {
      id: "select",
      header: ({ table }) => <SelectAllCheckbox table={table} />,
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(checked) => row.toggleSelected(!!checked)}
          disabled={!row.getCanSelect()}
          aria-label={`Select transaction ${row.original.id}`}
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 40,
    },
    {
      id: "merchant",
      accessorFn: (row) => getMerchantLabel(row),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Merchant" />
      ),
      cell: ({ row }) => <MerchantCell row={row.original} />,
    },
    {
      id: "account",
      accessorKey: "linkedBankAccountId",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Account" />
      ),
      cell: ({ row }) => {
        const id = row.original.linkedBankAccountId;
        const label = id ? accountLabelMap.get(id) ?? "—" : "—";

        return (
          <span className="max-w-[10rem] truncate text-muted-foreground">
            {label}
          </span>
        );
      },
    },
    {
      id: "category",
      accessorKey: "pfcPrimary",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Category" />
      ),
      cell: ({ row }) => {
        const meta = getPfcPrimaryMeta(row.original.pfcPrimary);

        return (
          <Badge
            variant="outline"
            className={cn(
              "max-w-[11rem] truncate border font-normal text-xs",
              meta.badgeClassName,
            )}
          >
            {meta.displayName}
          </Badge>
        );
      },
    },
    {
      id: "detailCategory",
      accessorKey: "pfcDetailed",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Detail category" />
      ),
      cell: ({ row }) => (
        <span className="max-w-[12rem] truncate text-muted-foreground text-xs">
          {formatDetailCategory(row.original.pfcDetailed)}
        </span>
      ),
    },
    {
      accessorKey: "date",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Date" />
      ),
      cell: ({ row }) => (
        <span className="whitespace-nowrap tabular-nums">
          {formatTxDate(row.original.date)}
        </span>
      ),
    },
    {
      accessorKey: "amount",
      header: ({ column }) => (
        <div className="flex w-full justify-end">
          <DataTableColumnHeader
            column={column}
            title="Amount"
            className="justify-end"
          />
        </div>
      ),
      cell: ({ row }) => <AmountCell row={row.original} />,
    },
    {
      id: "paymentChannel",
      accessorKey: "paymentChannel",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Channel" />
      ),
      cell: ({ row }) => {
        const meta = getPaymentChannelMeta(row.original.paymentChannel);

        return meta.displayName === "—" ? (
          <span className="text-muted-foreground text-xs">—</span>
        ) : (
          <Badge
            variant="outline"
            className={cn(
              "max-w-[7rem] truncate border font-normal text-xs",
              meta.badgeClassName,
            )}
          >
            {meta.displayName}
          </Badge>
        );
      },
    },
    {
      id: "pending",
      accessorKey: "pending",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Pending" />
      ),
      cell: ({ row }) =>
        row.original.pending ? (
          <Badge
            variant="outline"
            className="border-orange-500/35 bg-orange-500/15 font-medium text-[10px] text-orange-950 dark:text-orange-200"
          >
            PENDING
          </Badge>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <TransactionRowActions
          row={row.original}
          onEdit={options?.onEdit}
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 48,
    },
  ];
}