"use client";

import {
  startTransition,
  useCallback,
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { Check, ChevronDown, FilterX, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { RecurringCashflowsFilterForm } from "@/components/recurring-cashflows-filter-form";
import { useIsMobile } from "@/hooks/use-mobile";
import type { LinkedBankResponse } from "@/interface/plaid";
import {
  type ProfileRecurringCashflowCalendarOccurrenceResponse,
  type ProfileRecurringCashflowResponse,
} from "@/interface/profile-recurring-cashflow";
import type { RecurringCashflowsFilterState } from "@/lib/recurring-cashflow-filter";
import { RECURRING_CASHFLOW_STATUSES } from "@/lib/recurring-cashflow-status";
import {
  PFC_PRIMARY,
  UNCATEGORIZED_PFC_PRIMARY,
} from "@/lib/pfc-primary";
import { getAllAccountIds } from "@/lib/linked-bank-accounts";
import { cn } from "@/lib/utils";

export function getDefaultRecurringCashflowsFilter(): RecurringCashflowsFilterState {
  return {
    accountIds: undefined,
    includeUnlinked: true,
    pfcPrimaryList: [...PFC_PRIMARY],
    statusList: [...RECURRING_CASHFLOW_STATUSES],
  };
}

export function sanitizeRecurringCashflowsFilter(
  filter: RecurringCashflowsFilterState,
  banks: LinkedBankResponse[] | undefined,
): RecurringCashflowsFilterState {
  const validAccountIds = new Set(getAllAccountIds(banks));
  const validPfcPrimary = new Set(PFC_PRIMARY);
  const validStatuses = new Set<string>(RECURRING_CASHFLOW_STATUSES);

  const accountIds =
    filter.accountIds === undefined
      ? validAccountIds.size > 0
        ? [...validAccountIds]
        : []
      : filter.accountIds.filter((accountId) => validAccountIds.has(accountId));

  const pfcPrimaryList = (
    filter.pfcPrimaryList === undefined
      ? [...PFC_PRIMARY]
      : [...filter.pfcPrimaryList]
  ).filter((pfcPrimary) => validPfcPrimary.has(pfcPrimary));

  const statusList = (
    filter.statusList === undefined
      ? [...RECURRING_CASHFLOW_STATUSES]
      : [...filter.statusList]
  ).filter((status) => validStatuses.has(status));

  return {
    ...filter,
    accountIds,
    includeUnlinked: filter.includeUnlinked ?? true,
    pfcPrimaryList,
    statusList,
  };
}

export function filterRecurringCashflows(
  rows: ProfileRecurringCashflowResponse[],
  filterState: RecurringCashflowsFilterState,
  banks: LinkedBankResponse[] | undefined,
): ProfileRecurringCashflowResponse[] {
  return rows.filter((row) =>
    matchesRecurringCashflowFilter(row, filterState, banks),
  );
}

export function filterRecurringCalendarOccurrences(
  occurrences: ProfileRecurringCashflowCalendarOccurrenceResponse[],
  filterState: RecurringCashflowsFilterState,
  banks: LinkedBankResponse[] | undefined,
): ProfileRecurringCashflowCalendarOccurrenceResponse[] {
  return occurrences.filter((occurrence) =>
    matchesRecurringCashflowFilter(occurrence, filterState, banks),
  );
}

type ProfileRecurringCashflowItem =
  | ProfileRecurringCashflowResponse
  | ProfileRecurringCashflowCalendarOccurrenceResponse;

function matchesRecurringCashflowFilter(
  item: ProfileRecurringCashflowItem,
  filterState: RecurringCashflowsFilterState,
  banks: LinkedBankResponse[] | undefined,
): boolean {
  const accountIds = filterState.accountIds ?? getAllAccountIds(banks);
  const includeUnlinked = filterState.includeUnlinked ?? true;
  const pfcPrimaryList = filterState.pfcPrimaryList ?? [...PFC_PRIMARY];
  const statusList = filterState.statusList ?? [...RECURRING_CASHFLOW_STATUSES];
  const linkedBankAccountId = item.linkedBankAccount?.id.trim() || null;

  if (linkedBankAccountId == null) {
    if (!includeUnlinked) return false;
  } else if (!accountIds.includes(linkedBankAccountId)) {
    return false;
  }

  const pfcPrimary = item.pfcPrimary?.trim() || UNCATEGORIZED_PFC_PRIMARY;
  if (!pfcPrimaryList.includes(pfcPrimary)) return false;

  const status = item.status.trim().toLowerCase();
  if (!statusList.includes(status)) return false;

  return true;
}

type UseRecurringCashflowsFilterProps = {
  banks: LinkedBankResponse[] | undefined;
  appliedFilter: RecurringCashflowsFilterState;
  onApplyFilter: (filter: RecurringCashflowsFilterState) => void;
};

export function useRecurringCashflowsFilter({
  banks,
  appliedFilter,
  onApplyFilter,
}: UseRecurringCashflowsFilterProps) {
  const [isFilterControlsOpen, setIsFilterControlsOpen] = useState(false);
  const [filterState, setFilterState] =
    useState<RecurringCashflowsFilterState>(appliedFilter);

  useEffect(() => {
    if (isFilterControlsOpen) return;

    startTransition(() => {
      setFilterState(appliedFilter);
    });
  }, [appliedFilter, isFilterControlsOpen]);

  const handleClearFilter = useCallback(() => {
    setFilterState(getDefaultRecurringCashflowsFilter());
  }, []);

  const handleApplyFilter = useCallback(() => {
    onApplyFilter(sanitizeRecurringCashflowsFilter(filterState, banks));
  }, [filterState, onApplyFilter, banks]);

  const handleOpenFilterControls = useCallback(() => {
    setFilterState(appliedFilter);
    setIsFilterControlsOpen((open) => !open);
  }, [appliedFilter]);

  return {
    triggerProps: {
      isFilterControlsOpen,
      onOpenFilterControls: handleOpenFilterControls,
    } satisfies RecurringCashflowsFilterTriggerProps,
    panelsProps: {
      banks,
      filterState,
      setFilterState,
      isFilterControlsOpen,
      onFilterControlsOpenChange: setIsFilterControlsOpen,
      onClearFilter: handleClearFilter,
      onApplyFilter: handleApplyFilter,
    } satisfies RecurringCashflowsFilterPanelsProps,
  };
}

export type RecurringCashflowsFilterTriggerProps = {
  isFilterControlsOpen: boolean;
  onOpenFilterControls: () => void;
  className?: string;
};

export function RecurringCashflowsFilterTrigger({
  isFilterControlsOpen,
  onOpenFilterControls,
  className,
}: RecurringCashflowsFilterTriggerProps) {
  const isMobile = useIsMobile();

  return (
    <Button
      type="button"
      variant={isFilterControlsOpen && !isMobile ? "secondary" : "outline"}
      className={className}
      onClick={onOpenFilterControls}
      aria-expanded={isFilterControlsOpen}
    >
      <SlidersHorizontal className="size-4" aria-hidden />
      Filters
      {!isMobile ? (
        <ChevronDown
          className={cn(
            "size-4 transition-transform",
            isFilterControlsOpen && "rotate-180",
          )}
          aria-hidden
        />
      ) : null}
    </Button>
  );
}

export type RecurringCashflowsFilterPanelsProps = {
  banks: LinkedBankResponse[] | undefined;
  filterState: RecurringCashflowsFilterState;
  setFilterState: Dispatch<SetStateAction<RecurringCashflowsFilterState>>;
  isFilterControlsOpen: boolean;
  onFilterControlsOpenChange: (open: boolean) => void;
  onClearFilter: () => void;
  onApplyFilter: () => void;
};

export function RecurringCashflowsFilterPanels({
  banks,
  filterState,
  setFilterState,
  isFilterControlsOpen,
  onFilterControlsOpenChange,
  onClearFilter,
  onApplyFilter,
}: RecurringCashflowsFilterPanelsProps) {
  const isMobile = useIsMobile();

  return (
    <>
      {!isMobile && isFilterControlsOpen ? (
        <div
          className="rounded-xl border border-border bg-card p-4 shadow-sm"
          id="recurring-cashflows-filters-panel"
        >
          <RecurringCashflowsFilterForm
            filterState={filterState}
            onChange={setFilterState}
            banks={banks}
            variant="default"
          />
          <div className="mt-4 border-t border-border pt-4">
            <FilterActions
              onClearFilter={onClearFilter}
              onApplyFilter={onApplyFilter}
            />
          </div>
        </div>
      ) : null}

      <Sheet
        open={isMobile && isFilterControlsOpen}
        onOpenChange={onFilterControlsOpenChange}
      >
        <SheetContent
          side="bottom"
          className="max-h-[85vh] gap-0 overflow-hidden p-0"
          showCloseButton
        >
          <SheetHeader className="border-b border-border px-5 py-4 text-left">
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6">
            <RecurringCashflowsFilterForm
              filterState={filterState}
              onChange={setFilterState}
              banks={banks}
              variant="sheet"
            />
          </div>

          <SheetFooter className="border-t border-border px-5 py-4">
            <FilterActions
              className="gap-4"
              onClearFilter={onClearFilter}
              onApplyFilter={onApplyFilter}
            />
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}

type FilterActionsProps = {
  onClearFilter: () => void;
  onApplyFilter: () => void;
  className?: string;
};

function FilterActions({
  onClearFilter,
  onApplyFilter,
  className,
}: FilterActionsProps) {
  return (
    <div className={cn("flex flex-wrap justify-end gap-2", className)}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={onClearFilter}
      >
        <FilterX className="size-4 shrink-0" aria-hidden />
        Clear
      </Button>
      <Button
        type="button"
        size="sm"
        className="gap-1.5"
        onClick={onApplyFilter}
      >
        <Check className="size-4 shrink-0" aria-hidden />
        Apply
      </Button>
    </div>
  );
}
