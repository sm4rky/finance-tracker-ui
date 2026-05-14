"use client";

import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";

import { DeleteRecurringCashflowDialog } from "@/components/delete-recurring-cashflow-dialog";
import { SubscriptionsCalendarView } from "@/components/subscriptions-calendar-view";
import { SubscriptionsListView } from "@/components/subscriptions-list-view";
import {
  SubscriptionsViewModeToggle,
  type SubscriptionsViewMode,
} from "@/components/subscriptions-view-mode-toggle";
import {
  getDefaultRecurringCashflowsFilter,
  RecurringCashflowsFilterPanels,
  RecurringCashflowsFilterTrigger,
  sanitizeRecurringCashflowsFilter,
  useRecurringCashflowsFilter,
} from "@/components/recurring-cashflows-filter";
import { SaveRecurringCashflowSheet } from "@/components/save-recurring-cashflow-sheet";
import { Button } from "@/components/ui/button";
import type {
  ProfileRecurringCashflowResponse,
  RecurringCashflowsFilterState,
} from "@/interface/profile-recurring-cashflow";
import { listPlaidConnections } from "@/lib/api/plaid";

export function SubscriptionsView() {
  const [viewMode, setViewMode] = useState<SubscriptionsViewMode>("list");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] =
    useState<ProfileRecurringCashflowResponse | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [storedFilter, setStoredFilter] = useState<RecurringCashflowsFilterState>(
    getDefaultRecurringCashflowsFilter,
  );

  const { data: plaidConnections } = useQuery({
    queryKey: ["list-plaid-connections"],
    queryFn: listPlaidConnections,
  });

  const allBanks = plaidConnections ?? [];

  const activeBanks = useMemo(
    () => allBanks.filter((bank) => bank.status === "active" || bank.status === "relink_required"),
    [allBanks],
  );

  const appliedFilter = useMemo(
    () => sanitizeRecurringCashflowsFilter(storedFilter, activeBanks),
    [storedFilter, activeBanks],
  );

  const handleApplyFilter = useCallback(
    (next: RecurringCashflowsFilterState) => {
      setStoredFilter(next);
    },
    [],
  );

  const { triggerProps, panelsProps } = useRecurringCashflowsFilter({
    banks: activeBanks,
    applied: appliedFilter,
    onApply: handleApplyFilter,
  });

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
      <div className="flex w-full flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <RecurringCashflowsFilterTrigger {...triggerProps} />
          <Button
            type="button"
            variant="outline"
            className="gap-1.5"
            onClick={openCreate}
          >
            <Plus className="size-4 shrink-0" aria-hidden />
            Add subscription
          </Button>
          <SubscriptionsViewModeToggle mode={viewMode} onModeChange={setViewMode} />
        </div>
        <RecurringCashflowsFilterPanels {...panelsProps} />
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

      {viewMode === "calendar" ? (
        <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col">
          <SubscriptionsCalendarView
            appliedFilter={appliedFilter}
            banks={allBanks}
          />
        </div>
      ) : (
        <SubscriptionsListView
          appliedFilter={appliedFilter}
          banks={allBanks}
          onEdit={openEdit}
          onDelete={openDelete}
        />
      )}
    </div>
  );
}
