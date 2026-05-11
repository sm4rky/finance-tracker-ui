"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Table as TanStackTable } from "@tanstack/react-table";

import {
  AmountCell,
  formatDetailCategory,
  formatTxDate,
  getMerchantLabel,
  getPaymentChannelMeta,
  getPfcPrimaryMeta,
  TransactionRowActions,
} from "@/components/transactions-columns";
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import type { TransactionResponse } from "@/interface/transaction";
import { cn } from "@/lib/utils";

function MobileMerchantSummary({
  row,
  dateLabel,
}: {
  row: TransactionResponse;
  dateLabel: string;
}) {
  const [imgFailed, setImgFailed] = useState(false);

  const meta = getPfcPrimaryMeta(row.pfcPrimary);
  const label = getMerchantLabel(row);
  const logoUrl = row.logoUrl?.trim();
  const shouldShowImage = Boolean(logoUrl) && !imgFailed;

  const Icon = meta.Icon;

  return (
    <div className="flex min-w-0 flex-1 items-start gap-3">
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

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate font-medium">{label}</span>
        <span className="text-muted-foreground text-xs tabular-nums">
          {dateLabel}
        </span>
      </div>
    </div>
  );
}

export type TransactionsMobileListProps = {
  table: TanStackTable<TransactionResponse>;
  data: TransactionResponse[];
  accountLabelMap: Map<string, string>;
  isLoading: boolean;
  emptyMessage: string;
  onEdit: (row: TransactionResponse) => void;
  onDelete: (row: TransactionResponse) => void;
};

export function TransactionsMobileList({
  table,
  data,
  accountLabelMap,
  isLoading,
  emptyMessage,
  onEdit,
  onDelete,
}: TransactionsMobileListProps) {
  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-xl border border-border">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton
            key={i}
            className={cn(
              "h-14 w-full rounded-none",
              i > 0 && "border-t border-border",
            )}
          />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-border px-4 py-12 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          indeterminate={
            table.getIsSomePageRowsSelected() &&
            !table.getIsAllPageRowsSelected()
          }
          onCheckedChange={(checked) =>
            table.toggleAllPageRowsSelected(!!checked)
          }
          aria-label="Select all"
        />
        <span className="text-sm text-muted-foreground">Select all</span>
      </div>

      <Accordion type="single" collapsible className="w-full">
        {data.map((transaction) => {
          const row = table.getRow(transaction.id);
          const selected = row?.getIsSelected() ?? false;

          const merchantLabel = getMerchantLabel(transaction);

          const accountId = transaction.linkedBankAccountId;
          const accountLabel = accountId
            ? (accountLabelMap.get(accountId) ?? "—")
            : "—";

          const categoryMeta = getPfcPrimaryMeta(transaction.pfcPrimary);
          const detailCategoryMeta = formatDetailCategory(transaction.pfcDetailed);
          const channelMeta = getPaymentChannelMeta(transaction.paymentChannel);

          return (
            <AccordionItem
              key={transaction.id}
              value={transaction.id}
              className="overflow-hidden rounded-none border-0 border-t border-border first:border-t-0"
            >
              <AccordionHeader className="flex min-h-[3.25rem] w-full items-center gap-2 border-0 px-4 py-1">
                <div
                  className="flex shrink-0 items-center"
                  onClick={(e) => e.stopPropagation()}
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <Checkbox
                    checked={selected}
                    onCheckedChange={(checked) =>
                      row?.toggleSelected(!!checked)
                    }
                    aria-label={`Select transaction ${transaction.id}`}
                  />
                </div>

                <AccordionTrigger className="min-h-0 min-w-0 flex-1 items-center gap-2 py-2 hover:no-underline [&[data-state=open]]:bg-transparent">
                  <ChevronDown
                    className="chevron-accordion size-4 shrink-0 text-muted-foreground transition-transform"
                    aria-hidden
                  />
                  <div className="flex min-w-0 flex-1 items-center gap-3 text-left">
                    <MobileMerchantSummary
                      row={transaction}
                      dateLabel={formatTxDate(transaction.date)}
                    />
                    <div className="shrink-0 text-sm">
                      <AmountCell row={transaction} />
                    </div>
                  </div>
                </AccordionTrigger>

                <div
                  className="flex shrink-0 items-center self-center"
                  onClick={(e) => e.stopPropagation()}
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <TransactionRowActions
                    row={transaction}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                </div>
              </AccordionHeader>

              <AccordionContent className="border-t border-border/60 px-4 pb-3 pt-0">
                <dl className="flex flex-col gap-3 pt-3">
                  <div className="space-y-0.5">
                    <dt className="text-muted-foreground text-xs">Merchant</dt>
                    <dd className="min-w-0 break-words text-sm font-medium">
                      {merchantLabel}
                    </dd>
                  </div>
                  <div className="space-y-0.5">
                    <dt className="text-muted-foreground text-xs">Account</dt>
                    <dd className="min-w-0 break-words text-sm">{accountLabel}</dd>
                  </div>
                  <div className="space-y-0.5">
                    <dt className="text-muted-foreground text-xs">
                      Category
                    </dt>
                    <dd className="text-sm">
                      <Badge
                        variant="outline"
                        className={cn(
                          "max-w-full truncate border font-normal text-xs",
                          categoryMeta.badgeClassName,
                        )}
                      >
                        {categoryMeta.displayName}
                      </Badge>
                    </dd>
                  </div>
                  <div className="space-y-0.5">
                    <dt className="text-muted-foreground text-xs">
                      Detail category
                    </dt>
                    <dd className="text-muted-foreground text-sm">
                      {detailCategoryMeta}
                    </dd>
                  </div>
                  <div className="space-y-0.5">
                    <dt className="text-muted-foreground text-xs">Channel</dt>
                    <dd className="text-sm">
                      {channelMeta.displayName === "—" ? (
                        <span className="text-muted-foreground text-xs">
                          —
                        </span>
                      ) : (
                        <Badge
                          variant="outline"
                          className={cn(
                            "max-w-full truncate border font-normal text-xs",
                            channelMeta.badgeClassName,
                          )}
                        >
                          {channelMeta.displayName}
                        </Badge>
                      )}
                    </dd>
                  </div>
                  <div className="space-y-0.5">
                    <dt className="text-muted-foreground text-xs">Pending</dt>
                    <dd className="text-sm">
                      {transaction.pending ? (
                        <Badge
                          variant="outline"
                          className="border-orange-500/35 bg-orange-500/15 font-medium text-[10px] text-orange-950 dark:text-orange-200"
                        >
                          PENDING
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </dd>
                  </div>
                  {transaction.authorizedDate &&
                    transaction.authorizedDate.trim() !==
                      transaction.date.trim() && (
                      <div className="space-y-0.5">
                        <dt className="text-muted-foreground text-xs">
                          Authorized
                        </dt>
                        <dd className="text-sm tabular-nums">
                          {formatTxDate(transaction.authorizedDate)}
                        </dd>
                      </div>
                    )}
                </dl>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
