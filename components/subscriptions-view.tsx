"use client";

import { useCallback, useState } from "react";
import { Plus } from "lucide-react";

import { DeleteRecurringCashflowDialog } from "@/components/delete-recurring-cashflow-dialog";
import { SubscriptionsCalendarView } from "@/components/subscriptions-calendar-view";
import { SubscriptionsListView } from "@/components/subscriptions-list-view";
import {
  SubscriptionsViewModeToggle,
  type SubscriptionsViewMode,
} from "@/components/subscriptions-view-mode-toggle";
import {
  RecurringCashflowsFilterPanels,
  RecurringCashflowsFilterTrigger,
} from "@/components/recurring-cashflows-filter";
import { CategorySetDropdown } from "@/components/category-set-dropdown";
import { SaveRecurringCashflowSheet } from "@/components/save-recurring-cashflow-sheet";
import { Button } from "@/components/ui/button";
import { useAppliedRecurringCashflowsFilter } from "@/hooks/use-applied-recurring-cashflows-filter";
import type { ProfileRecurringCashflowResponse } from "@/interface/profile-recurring-cashflow";

export function SubscriptionsView() {
  const [viewMode, setViewMode] = useState<SubscriptionsViewMode>("list");
  const [saveSheetOpen, setSaveSheetOpen] = useState(false);
  const [saveSheetMode, setSaveSheetMode] = useState<"create" | "edit">(
    "create",
  );
  const [editingRecurringCashflow, setEditingRecurringCashflow] =
    useState<ProfileRecurringCashflowResponse | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { banks, appliedFilter, selectedCategorySet } =
    useAppliedRecurringCashflowsFilter();

  const openCreateRecurringCashflowSheet = useCallback(() => {
    setSaveSheetMode("create");
    setEditingRecurringCashflow(null);
    setSaveSheetOpen(true);
  }, []);

  const openEditRecurringCashflowSheet = useCallback(
    (row: ProfileRecurringCashflowResponse) => {
      setSaveSheetMode("edit");
      setEditingRecurringCashflow(row);
      setSaveSheetOpen(true);
    },
    [],
  );

  const openDeleteRecurringCashflowDialog = useCallback((id: string) => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  }, []);

  return (
    <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col gap-6 p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Subscriptions</h1>
          <p className="text-sm text-muted-foreground">
            Track upcoming bills and future payments.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <CategorySetDropdown />
          <RecurringCashflowsFilterTrigger
            open={filtersOpen}
            onOpenChange={setFiltersOpen}
          />
          <Button
            type="button"
            variant="outline"
            className="gap-1.5"
            onClick={openCreateRecurringCashflowSheet}
          >
            <Plus className="size-4 shrink-0" aria-hidden />
            Add subscription
          </Button>
          <SubscriptionsViewModeToggle
            mode={viewMode}
            onModeChange={setViewMode}
          />
        </div>
      </div>
      <RecurringCashflowsFilterPanels
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
      />

      <DeleteRecurringCashflowDialog
        open={deleteDialogOpen}
        onOpenChange={(next) => {
          setDeleteDialogOpen(next);
          if (!next) setDeleteId(null);
        }}
        recurringId={deleteId}
      />

      <SaveRecurringCashflowSheet
        open={saveSheetOpen}
        onOpenChange={(next) => {
          setSaveSheetOpen(next);
          if (!next) setEditingRecurringCashflow(null);
        }}
        mode={saveSheetMode}
        recurring={editingRecurringCashflow}
        banks={banks}
      />

      {viewMode === "calendar" ? (
        <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col">
          <SubscriptionsCalendarView
            appliedFilter={appliedFilter}
            banks={banks}
            categorySet={selectedCategorySet}
          />
        </div>
      ) : (
        <SubscriptionsListView
          appliedFilter={appliedFilter}
          banks={banks}
          categorySet={selectedCategorySet}
          onAdd={openCreateRecurringCashflowSheet}
          onEdit={openEditRecurringCashflowSheet}
          onDelete={openDeleteRecurringCashflowDialog}
        />
      )}
    </div>
  );
}
