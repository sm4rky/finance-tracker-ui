"use client";

import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";

import { DeleteRecurringCashflowDialog } from "@/components/delete-recurring-cashflow-dialog";
import { RecurringCashflowRow } from "@/components/recurring-cashflow-row";
import { SaveRecurringCashflowSheet } from "@/components/save-recurring-cashflow-sheet";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { ProfileRecurringCashflowResponse } from "@/interface/profile-recurring-cashflow";
import { listPlaidConnections } from "@/lib/api/plaid";
import { listProfileRecurringCashflows } from "@/lib/api/profile-recurring-cashflows";

function accountLineForRecurringRow(
  row: ProfileRecurringCashflowResponse,
  accountLineByLinkedId: Map<string, string>,
): string {
  const nested = row.linkedBankAccount;
  if (nested != null) {
    const base = nested.name.trim();
    const mask = nested.mask?.trim();
    if (base || mask) {
      const labelBase = base || "Account";
      return mask ? `${labelBase} ·•••${mask}` : labelBase;
    }
  }
  const linkedId = row.linkedBankAccountId ?? row.linkedBankAccount?.id ?? null;
  if (linkedId) {
    return accountLineByLinkedId.get(linkedId) ?? "Unknown account";
  }
  return "No linked account";
}

export function SubscriptionsView() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] =
    useState<ProfileRecurringCashflowResponse | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data } = useQuery({
    queryKey: ["list-plaid-connections"],
    queryFn: listPlaidConnections,
  });

  const { activeBanks, accountLineByLinkedId } = useMemo(() => {
    const banks = data ?? [];
    const activeBanks = banks.filter(
      (b) => b.status === "active" || b.status === "relink_required",
    );
    const accountLineByLinkedId = new Map<string, string>();
    for (const bank of banks) {
      for (const account of bank.accounts) {
        const base =
          account.officialName?.trim() ||
          account.accountName.trim() ||
          "Account";
        const label = account.mask
          ? `${bank.institutionName ?? "Bank"} · ${base} ·•••${account.mask}`
          : `${bank.institutionName ?? "Bank"} · ${base}`;
        accountLineByLinkedId.set(account.id, label);
      }
    }
    return { activeBanks, accountLineByLinkedId };
  }, [data]);

  const listQuery = useQuery({
    queryKey: ["profile-recurring-cashflows"],
    queryFn: listProfileRecurringCashflows,
  });

  const rows = listQuery.data ?? [];
  const loading = listQuery.isPending;
  const error = listQuery.isError;

  const openCreate = useCallback(() => {
    setSheetMode("create");
    setEditing(null);
    setSheetOpen(true);
  }, []);

  const openEdit = useCallback((row: ProfileRecurringCashflowResponse) => {
    setSheetMode("edit");
    setEditing(row);
    setSheetOpen(true);
  }, []);

  const openDelete = useCallback((id: string) => {
    setDeleteId(id);
    setDeleteOpen(true);
  }, []);

  return (
    <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col gap-6 p-6 md:p-8">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          className="gap-1.5"
          onClick={openCreate}
        >
          <Plus className="size-4 shrink-0" aria-hidden />
          Add subscription
        </Button>
      </div>

      <DeleteRecurringCashflowDialog
        open={deleteOpen}
        onOpenChange={(next) => {
          setDeleteOpen(next);
          if (!next) setDeleteId(null);
        }}
        recurringId={deleteId}
      />

      <SaveRecurringCashflowSheet
        open={sheetOpen}
        onOpenChange={(next) => {
          setSheetOpen(next);
          if (!next) setEditing(null);
        }}
        mode={sheetMode}
        recurring={editing}
        banks={activeBanks}
      />

      <div className="flex min-h-0 min-w-0 w-full flex-col gap-3">
        {loading ? (
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
        ) : error ? (
          <p className="text-sm text-destructive">
            Could not load subscriptions.
          </p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No subscriptions yet. Use Add subscription to add one.
          </p>
        ) : (
          rows.map((row) => {
            const accountLine = accountLineForRecurringRow(
              row,
              accountLineByLinkedId,
            );

            return (
              <RecurringCashflowRow
                key={row.id}
                row={row}
                accountLine={accountLine}
                onEdit={openEdit}
                onDelete={openDelete}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
