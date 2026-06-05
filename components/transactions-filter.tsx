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
import { TransactionsFilterForm } from "@/components/transactions-filter-form";
import { useAppliedTransactionsFilter } from "@/hooks/use-applied-transactions-filter";
import { useSelectedCategorySet } from "@/hooks/use-selected-category-set";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  areTransactionsFiltersEqual,
  getDefaultTransactionsFilter,
  sanitizeTransactionsFilter,
  type TransactionsFilterState,
} from "@/lib/transaction-filter";
import { cn } from "@/lib/utils";

export type TransactionsFilterTriggerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TransactionsFilterTrigger({
  open,
  onOpenChange,
}: TransactionsFilterTriggerProps) {
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

export type TransactionsFilterPanelsProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TransactionsFilterPanels({
  open,
  onOpenChange,
}: TransactionsFilterPanelsProps) {
  const isMobile = useIsMobile();
  const { banks, appliedFilter, setAppliedFilter } =
    useAppliedTransactionsFilter();
  const { selectedCategorySet } = useSelectedCategorySet();

  const [filterState, setFilterState] =
    useState<TransactionsFilterState>(appliedFilter);

  useEffect(() => {
    if (open) {
      startTransition(() => {
        setFilterState((current) => {
          const next = sanitizeTransactionsFilter(
            {
              ...current,
              dateFrom: appliedFilter.dateFrom,
              dateTo: appliedFilter.dateTo,
            },
            banks,
            selectedCategorySet,
          );

          if (areTransactionsFiltersEqual(current, next)) {
            return current;
          }

          return next;
        });
      });
      return;
    }

    startTransition(() => {
      setFilterState((current) =>
        areTransactionsFiltersEqual(current, appliedFilter)
          ? current
          : appliedFilter,
      );
    });
  }, [appliedFilter, banks, open, selectedCategorySet]);

  const handleClearFilter = useCallback(() => {
    const defaults = getDefaultTransactionsFilter(banks, selectedCategorySet);
    setFilterState({
      ...defaults,
      dateFrom: appliedFilter.dateFrom,
      dateTo: appliedFilter.dateTo,
    });
  }, [
    appliedFilter.dateFrom,
    appliedFilter.dateTo,
    banks,
    selectedCategorySet,
  ]);

  const handleApplyFilter = useCallback(() => {
    setAppliedFilter(filterState);
  }, [filterState, setAppliedFilter]);

  return (
    <>
      {!isMobile && open ? (
        <div
          className="rounded-xl border border-border bg-card p-4 shadow-sm"
          id="transactions-filters-panel"
        >
          <TransactionsFilterForm
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

      <Sheet open={isMobile && open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className="max-h-[85vh] gap-0 overflow-hidden p-0"
          showCloseButton
        >
          <SheetHeader className="border-b border-border px-5 py-4 text-left">
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6">
            <TransactionsFilterForm
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
  onClearFilter?: () => void;
  onApplyFilter: () => void;
};

function FilterActions({
  onClearFilter,
  onApplyFilter,
}: FilterActionsProps) {
  return (
    <div className="flex flex-wrap justify-end gap-2">
      {onClearFilter ? (
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
      ) : null}
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