"use client";

import {
  startTransition,
  useCallback,
  useEffect,
  useState,
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
import { useAppliedRecurringCashflowsFilter } from "@/hooks/use-applied-recurring-cashflows-filter";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  areRecurringCashflowsFiltersEqual,
  getDefaultRecurringCashflowsFilter,
  sanitizeRecurringCashflowsFilter,
  type RecurringCashflowsFilterState,
} from "@/lib/recurring-cashflow-filter";
import { cn } from "@/lib/utils";

export type RecurringCashflowsFilterTriggerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function RecurringCashflowsFilterTrigger({
  open,
  onOpenChange,
}: RecurringCashflowsFilterTriggerProps) {
  const isMobile = useIsMobile();

  return (
    <Button
      type="button"
      variant={open && !isMobile ? "secondary" : "outline"}
      onClick={() => onOpenChange(!open)}
      aria-expanded={open}
    >
      <SlidersHorizontal className="size-4" aria-hidden />
      Filters
      {!isMobile ? (
        <ChevronDown
          className={cn(
            "size-4 transition-transform",
            open && "rotate-180",
          )}
          aria-hidden
        />
      ) : null}
    </Button>
  );
}

export type RecurringCashflowsFilterPanelsProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function RecurringCashflowsFilterPanels({
  open,
  onOpenChange,
}: RecurringCashflowsFilterPanelsProps) {
  const isMobile = useIsMobile();
  const {
    banks,
    appliedFilter,
    selectedCategorySet,
    setAppliedFilter,
  } = useAppliedRecurringCashflowsFilter();

  const [filterState, setFilterState] =
    useState<RecurringCashflowsFilterState>(appliedFilter);

  useEffect(() => {
    if (open) {
      startTransition(() => {
        setFilterState((current) => {
          const next = sanitizeRecurringCashflowsFilter(
            current,
            banks,
            selectedCategorySet,
          );

          return areRecurringCashflowsFiltersEqual(current, next)
            ? current
            : next;
        });
      });
      return;
    }

    startTransition(() => {
      setFilterState((current) =>
        areRecurringCashflowsFiltersEqual(current, appliedFilter)
          ? current
          : appliedFilter,
      );
    });
  }, [appliedFilter, banks, open, selectedCategorySet]);

  const handleClearFilter = useCallback(() => {
    setFilterState(
      getDefaultRecurringCashflowsFilter(banks, selectedCategorySet),
    );
  }, [banks, selectedCategorySet]);

  const handleApplyFilter = useCallback(() => {
    setAppliedFilter(filterState);
  }, [filterState, setAppliedFilter]);

  return (
    <>
      {!isMobile && open ? (
        <div
          className="rounded-xl border border-border bg-card p-4 shadow-sm"
          id="recurring-cashflows-filters-panel"
        >
          <RecurringCashflowsFilterForm
            filterState={filterState}
            onChange={setFilterState}
            banks={banks}
            categorySet={selectedCategorySet}
            variant="default"
          />
          <div className="mt-4 border-t border-border pt-4">
            <FilterActions
              onClearFilter={handleClearFilter}
              onApplyFilter={handleApplyFilter}
            />
          </div>
        </div>
      ) : null}

      <Sheet
        open={isMobile && open}
        onOpenChange={onOpenChange}
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
              categorySet={selectedCategorySet}
              variant="sheet"
            />
          </div>

          <SheetFooter className="border-t border-border px-5 py-4">
            <FilterActions
              onClearFilter={handleClearFilter}
              onApplyFilter={handleApplyFilter}
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
};

function FilterActions({
  onClearFilter,
  onApplyFilter,
}: FilterActionsProps) {
  return (
    <div className="flex flex-wrap justify-end gap-2">
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
