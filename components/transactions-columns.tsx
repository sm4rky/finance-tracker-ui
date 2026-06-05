"use client";

import { useState } from "react";
import type { ColumnDef, Table as TanStackTable } from "@tanstack/react-table";
import Image from "next/image";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

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
import {
  getCustomCategoryMeta,
  type CustomCategoryMeta,
} from "@/lib/custom-category";
import { getPaymentChannelMeta } from "@/lib/payment-channel";
import { getPfcPrmaryMeta, type PfcPrimaryMeta } from "@/lib/pfc-primary";
import {
  formatMoneyAbs,
  getTransactionCashFlow,
} from "@/lib/transaction-amount";
import { cn } from "@/lib/utils";

function SelectAllCheckbox<TData>({ table }: { table: TanStackTable<TData> }) {
  const allSelected = table.getIsAllPageRowsSelected();
  const someSelected = table.getIsSomePageRowsSelected();

  return (
    <Checkbox
      checked={allSelected}
      indeterminate={someSelected && !allSelected}
      onCheckedChange={(checked) => table.toggleAllPageRowsSelected(!!checked)}
      aria-label="Select all"
    />
  );
}

export function getMerchantLabel(row: TransactionResponse): string {
  return row.merchantName?.trim() || row.name?.trim() || "—";
}

export function getTransactionAccountLabel(row: TransactionResponse): string {
  const account = row.linkedBankAccount;
  if (account == null) return "—";

  const baseLabel =
    account.officialName?.trim() ||
    account.accountName?.trim() ||
    "Account";

  return account.mask ? `${baseLabel} ·•••${account.mask}` : baseLabel;
}

export function getTransactionCategoryMeta(
  row: TransactionResponse,
): CustomCategoryMeta | PfcPrimaryMeta {
  if (row.customCategory) {
    return getCustomCategoryMeta(row.customCategory);
  }

  return getPfcPrmaryMeta(row.pfcPrimary);
}

export function MerchantCell({ row }: { row: TransactionResponse }) {
  const [imgFailed, setImgFailed] = useState(false);

  const meta = getTransactionCategoryMeta(row);
  const label = getMerchantLabel(row);
  const logoUrl = row.logoUrl?.trim() ?? "";
  const shouldShowImage = logoUrl !== "" && !imgFailed;

  const Icon = meta.Icon;

  return (
    <div className="flex min-w-0 max-w-[min(100%,16rem)] items-center gap-3">
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

      <span className="min-w-0 truncate font-medium">{label}</span>
    </div>
  );
}

export function formatDetailCategory(raw: string | null | undefined): string {
  const trimmed = raw?.trim();
  return trimmed ? trimmed.replace(/_/g, " ") : "—";
}

export function formatTxDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function AmountCell({ row }: { row: TransactionResponse }) {
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

export function TransactionRowActions({
  row,
  onEdit,
  onDelete,
}: {
  row: TransactionResponse;
  onEdit?: (row: TransactionResponse) => void;
  onDelete?: (row: TransactionResponse) => void;
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
        <DropdownMenuItem variant="destructive" onClick={() => onDelete?.(row)}>
          <Trash2 className="size-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export type CreateTransactionColumnsOptions = {
  onEdit?: (row: TransactionResponse) => void;
  onDelete?: (row: TransactionResponse) => void;
};

export function createTransactionColumns(
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
      accessorFn: (row) => row.linkedBankAccount?.id ?? "",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Account" />
      ),
      cell: ({ row }) => {
        const label = getTransactionAccountLabel(row.original);

        return (
          <span className="max-w-40 truncate text-muted-foreground">
            {label}
          </span>
        );
      },
    },
    {
      id: "category",
      accessorFn: (row) => row.customCategory?.name ?? row.pfcPrimary ?? "",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Category" />
      ),
      cell: ({ row }) => {
        const meta = getTransactionCategoryMeta(row.original);

        return (
          <Badge
            variant="outline"
            className={cn(
              "max-w-44 truncate border font-normal text-xs",
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
        <span className="max-w-48 truncate text-muted-foreground text-xs">
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
              "max-w-28 truncate border font-normal text-xs",
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
          onDelete={options?.onDelete}
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 48,
    },
  ];
}
