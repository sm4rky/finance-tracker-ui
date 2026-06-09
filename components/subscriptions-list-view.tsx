"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Repeat } from "lucide-react";

import { RecurringCashflowRow } from "@/components/recurring-cashflow-row";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { LinkedBankResponse } from "@/interface/plaid";
import type { ProfileCustomCategorySetResponse } from "@/interface/profile-custom-category";
import type { ProfileRecurringCashflowResponse } from "@/interface/profile-recurring-cashflow";
import { listProfileRecurringCashflows } from "@/lib/api/profile-recurring-cashflow";
import {
  filterRecurringCashflows,
  type RecurringCashflowsFilterState,
} from "@/lib/recurring-cashflow-filter";

function getAccountLabel(row: ProfileRecurringCashflowResponse): string {
  const account = row.linkedBankAccount;
  if (account == null) return "No linked account";

  const base =
    account.officialName?.trim() || account.accountName?.trim() || "Account";
  return account.mask ? `${base} ••••${account.mask}` : base;
}

export type SubscriptionsListViewProps = {
  appliedFilter: RecurringCashflowsFilterState;
  banks: LinkedBankResponse[] | undefined;
  categorySet: ProfileCustomCategorySetResponse | null;
  onAdd: () => void;
  onEdit: (row: ProfileRecurringCashflowResponse) => void;
  onDelete: (id: string) => void;
};

export function SubscriptionsListView({
  appliedFilter,
  banks,
  categorySet,
  onAdd,
  onEdit,
  onDelete,
}: SubscriptionsListViewProps) {
  const { data, isPending, isError } = useQuery({
    queryKey: ["profile-recurring-cashflows"],
    queryFn: listProfileRecurringCashflows,
  });

  const filteredRows = useMemo(
    () =>
      filterRecurringCashflows(data ?? [], appliedFilter, banks, categorySet),
    [data, appliedFilter, banks, categorySet],
  );

  return (
    <div className="flex min-h-0 min-w-0 w-full flex-col gap-3">
      {isPending ? (
        Array.from({ length: 3 }).map((_, i) => (
          <div
            key={`recurring-cashflow-sk-${i}`}
            className="flex flex-row flex-wrap items-center gap-3 rounded-xl border border-border bg-card px-3 py-3 sm:gap-4"
          >
            <Skeleton className="size-10 shrink-0 rounded-lg" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-56" />
            </div>
            <Skeleton className="h-12 w-24" />
            <Skeleton className="h-12 w-20" />
            <Skeleton className="size-8 shrink-0 rounded-lg" />
          </div>
        ))
      ) : isError ? (
        <p className="text-sm text-destructive">
          Could not load subscriptions.
        </p>
      ) : (data ?? []).length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <Repeat className="size-10 text-muted-foreground" aria-hidden />
            <div>
              <div className="font-medium">No subscriptions yet</div>
              <p className="text-sm text-muted-foreground">
                Add your first subscription to start tracking recurring
                cashflows.
              </p>
            </div>
            <Button variant="outline" onClick={onAdd}>
              <Plus className="size-4 shrink-0" aria-hidden />
              Add subscription
            </Button>
          </CardContent>
        </Card>
      ) : filteredRows.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <Repeat className="size-10 text-muted-foreground" aria-hidden />
            <div>
              <div className="font-medium">No matching subscriptions</div>
              <p className="text-sm text-muted-foreground">
                No subscriptions match your filters.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        filteredRows.map((row) => {
          const accountLine = getAccountLabel(row);

          return (
            <RecurringCashflowRow
              key={row.id}
              row={row}
              accountLine={accountLine}
              categorySet={categorySet}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          );
        })
      )}
    </div>
  );
}
