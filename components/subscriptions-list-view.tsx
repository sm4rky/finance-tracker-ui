"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { filterRecurringCashflowRows } from "@/components/recurring-cashflows-filter";
import { RecurringCashflowRow } from "@/components/recurring-cashflow-row";
import { Skeleton } from "@/components/ui/skeleton";
import type { LinkedBankResponse } from "@/interface/plaid";
import type {
  ProfileRecurringCashflowResponse,
  RecurringCashflowsFilterState,
} from "@/interface/profile-recurring-cashflow";
import { listProfileRecurringCashflows } from "@/lib/api/profile-recurring-cashflows";

function getRecurringCashflowAccountLine(row: ProfileRecurringCashflowResponse): string {
  const account = row.linkedBankAccount;
  if (account != null) {
    const base = account.name.trim();
    const mask = account.mask?.trim();
    return `${base} ·•••${mask}`;
  }
  if (row.linkedBankAccountId ?? row.linkedBankAccount?.id) {
    return "Linked account";
  }
  return "No linked account";
}

export type SubscriptionsListViewProps = {
  appliedFilter: RecurringCashflowsFilterState;
  banks: LinkedBankResponse[] | undefined;
  onEdit: (row: ProfileRecurringCashflowResponse) => void;
  onDelete: (id: string) => void;
};

export function SubscriptionsListView({
  appliedFilter,
  banks,
  onEdit,
  onDelete,
}: SubscriptionsListViewProps) {
  const { data, isPending, isError } = useQuery({
    queryKey: ["profile-recurring-cashflows"],
    queryFn: listProfileRecurringCashflows,
  });

  const filteredRows = useMemo(
    () => filterRecurringCashflowRows(data ?? [], appliedFilter, banks),
    [data, appliedFilter, banks],
  );

  const hasNoSubscriptions = (data ?? []).length === 0;

  return (
    <div className="flex min-h-0 min-w-0 w-full flex-col gap-3">
      {isPending ? (
        Array.from({ length: 4 }).map((_, i) => (
          <div
            key={`sk-${i}`}
            className="flex flex-row flex-wrap items-center gap-3 rounded-xl border border-border bg-card px-3 py-3 sm:gap-4"
          >
            <Skeleton className="size-10 shrink-0 rounded-lg" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-56" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-12 w-24" />
            <Skeleton className="h-12 w-20" />
            <Skeleton className="size-8 shrink-0 rounded-lg" />
          </div>
        ))
      ) : isError ? (
        <p className="text-sm text-destructive">Could not load subscriptions.</p>
      ) : hasNoSubscriptions ? (
        <p className="text-sm text-muted-foreground">
          No subscriptions yet. Use Add subscription to add one.
        </p>
      ) : filteredRows.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No subscriptions match your filters.
        </p>
      ) : (
        filteredRows.map((row) => {
          const accountLine = getRecurringCashflowAccountLine(row);

          return (
            <RecurringCashflowRow
              key={row.id}
              row={row}
              accountLine={accountLine}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          );
        })
      )}
    </div>
  );
}
