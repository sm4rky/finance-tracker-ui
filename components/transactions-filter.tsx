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
import { TransactionsFilterForm } from "@/components/transactions-filter-form";
import { useIsMobile } from "@/hooks/use-mobile";
import type { LinkedBankResponse } from "@/interface/plaid";
import { getAllAccountIds } from "@/lib/linked-bank-accounts";
import { PAYMENT_CHANNELS } from "@/lib/payment-channel";
import { PFC_PRIMARY } from "@/lib/pfc-primary";
import type { TransactionsFilterState } from "@/lib/transaction-filter";
import { getDateRangeForPreset } from "@/lib/transactions-date-range";
import { cn } from "@/lib/utils";


export function getDefaultTransactionsFilter(
  banks: LinkedBankResponse[] | undefined,
): TransactionsFilterState {
  const { dateFrom, dateTo } = getDateRangeForPreset("this_month");
  return {
    accountIds: getAllAccountIds(banks),
    includeUnlinkedTransactions: true,
    pfcPrimaryList: [...PFC_PRIMARY],
    paymentChannels: [...PAYMENT_CHANNELS],
    pending: undefined,
    dateFrom,
    dateTo,
    amountMin: undefined,
    amountMax: undefined,
    amountFlow: null,
  };
}

export function sanitizeTransactionsFilter(
  filter: TransactionsFilterState,
  banks: LinkedBankResponse[] | undefined,
): TransactionsFilterState {
  const validAccountIds = new Set(getAllAccountIds(banks));
  const validPfcPrimary = new Set(PFC_PRIMARY);
  const validChannelIds = new Set<string>(PAYMENT_CHANNELS);

  const accountIds =
    filter.accountIds === undefined
      ? validAccountIds.size > 0
        ? [...validAccountIds]
        : []
      : filter.accountIds.filter((id) => validAccountIds.has(id));

  const pfcPrimaryList =
    filter.pfcPrimaryList === undefined
      ? [...PFC_PRIMARY]
      : filter.pfcPrimaryList.filter((code) => validPfcPrimary.has(code));

  const paymentChannels =
    filter.paymentChannels === undefined
      ? [...PAYMENT_CHANNELS]
      : filter.paymentChannels.filter((channel) =>
        validChannelIds.has(channel),
      );

  return {
    ...filter,
    accountIds,
    includeUnlinkedTransactions: filter.includeUnlinkedTransactions ?? true,
    pfcPrimaryList,
    paymentChannels,
  };
}

function areTransactionsFiltersEqual(
  a: TransactionsFilterState,
  b: TransactionsFilterState,
): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

type UseTransactionsFilterOptions = {
  banks: LinkedBankResponse[] | undefined;
  appliedFilter: TransactionsFilterState;
  onApplyFilter: (filter: TransactionsFilterState) => void;
};

export function useTransactionsFilter({
  banks,
  appliedFilter,
  onApplyFilter,
}: UseTransactionsFilterOptions) {
  const [isFilterControlsOpen, setIsFilterControlsOpen] = useState(false);
  const [filterState, setFilterState] =
    useState<TransactionsFilterState>(appliedFilter);

  useEffect(() => {
    if (isFilterControlsOpen) {
      startTransition(() => {
        setFilterState((current) => {
          if (
            current.dateFrom === appliedFilter.dateFrom &&
            current.dateTo === appliedFilter.dateTo
          ) {
            return current;
          }
          return {
            ...current,
            dateFrom: appliedFilter.dateFrom,
            dateTo: appliedFilter.dateTo,
          };
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
  }, [appliedFilter, isFilterControlsOpen]);

  const handleClearFilter = useCallback(() => {
    const defaults = getDefaultTransactionsFilter(banks);
    setFilterState({
      ...defaults,
      dateFrom: appliedFilter.dateFrom,
      dateTo: appliedFilter.dateTo,
    });
  }, [banks, appliedFilter.dateFrom, appliedFilter.dateTo]);

  const handleApplyFilter = useCallback(() => {
    onApplyFilter(filterState);
  }, [onApplyFilter, filterState]);

  const handleOpenFilterControls = useCallback(() => {
    setIsFilterControlsOpen((open) => !open);
  }, []);

  return {
    triggerProps: {
      isFilterControlsOpen,
      onOpenFilterControls: handleOpenFilterControls,
    } satisfies TransactionsFilterTriggerProps,
    panelsProps: {
      banks,
      filterState,
      setFilterState,
      isFilterControlsOpen,
      onFilterControlsOpenChange: setIsFilterControlsOpen,
      onClearFilter: handleClearFilter,
      onApplyFilter: handleApplyFilter,
    } satisfies TransactionsFilterPanelsProps,
  };
}

export type TransactionsFilterTriggerProps = {
  isFilterControlsOpen: boolean;
  onOpenFilterControls: () => void;
  className?: string;
};

export function TransactionsFilterTrigger({
  isFilterControlsOpen,
  onOpenFilterControls: onToggleFilterControls,
  className,
}: TransactionsFilterTriggerProps) {
  const isMobile = useIsMobile();

  return (
    <Button
      type="button"
      variant={isFilterControlsOpen && !isMobile ? "secondary" : "outline"}
      className={className}
      onClick={onToggleFilterControls}
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

export type TransactionsFilterPanelsProps = {
  banks: LinkedBankResponse[] | undefined;
  filterState: TransactionsFilterState;
  setFilterState: Dispatch<SetStateAction<TransactionsFilterState>>;
  isFilterControlsOpen: boolean;
  onFilterControlsOpenChange: (open: boolean) => void;
  onClearFilter: () => void;
  onApplyFilter: () => void;
};

export function TransactionsFilterPanels({
  banks,
  filterState,
  setFilterState,
  isFilterControlsOpen,
  onFilterControlsOpenChange,
  onClearFilter,
  onApplyFilter,
}: TransactionsFilterPanelsProps) {
  const isMobile = useIsMobile();

  return (
    <>
      {!isMobile && isFilterControlsOpen ? (
        <div
          className="rounded-xl border border-border bg-card p-4 shadow-sm"
          id="transactions-filters-panel"
        >
          <TransactionsFilterForm
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
            <TransactionsFilterForm
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
  onClearFilter?: () => void;
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