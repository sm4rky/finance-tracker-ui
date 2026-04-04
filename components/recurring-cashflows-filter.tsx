"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { SlidersHorizontal, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import type { LinkedBankResponse } from "@/interface/plaid";
import {
  RECURRING_CASHFLOW_STATUS_FILTER_IDS,
  type ProfileRecurringCashflowResponse,
  type RecurringCashflowsFilterState,
} from "@/interface/profile-recurring-cashflow";
import { cn } from "@/lib/utils";

import { RecurringCashflowsFilterForm } from "@/components/recurring-cashflows-filter-form";
import {
  getAllAccountIds,
  PFC_PRIMARY_CATEGORY_CODES,
  PFC_PRIMARY_UNCATEGORIZED_FILTER_CODE,
} from "@/components/transactions-filter";

export function getDefaultRecurringCashflowsFilter(): RecurringCashflowsFilterState {
  return {
    accountIds: undefined,
    includeUnlinked: true,
    pfcPrimaryList: [...PFC_PRIMARY_CATEGORY_CODES],
    statusList: [...RECURRING_CASHFLOW_STATUS_FILTER_IDS],
  };
}

export function sanitizeRecurringCashflowsFilter(
  filter: RecurringCashflowsFilterState,
  banks: LinkedBankResponse[] | undefined,
): RecurringCashflowsFilterState {
  const validAccountIds = new Set(getAllAccountIds(banks));
  const validCategoryCodes = new Set(PFC_PRIMARY_CATEGORY_CODES);
  const validStatuses = new Set<string>(RECURRING_CASHFLOW_STATUS_FILTER_IDS);

  const accountIds =
    filter.accountIds === undefined
      ? validAccountIds.size > 0
        ? [...validAccountIds]
        : []
      : filter.accountIds.filter((id) => validAccountIds.has(id));

  let pfcPrimaryList = (filter.pfcPrimaryList ?? []).filter((code) =>
    validCategoryCodes.has(code),
  );
  let statusList = (filter.statusList ?? []).filter((s) =>
    validStatuses.has(s),
  );

  if (pfcPrimaryList.length === 0) {
    pfcPrimaryList = [...PFC_PRIMARY_CATEGORY_CODES];
  }

  if (statusList.length === 0) {
    statusList = [...RECURRING_CASHFLOW_STATUS_FILTER_IDS];
  }

  return {
    ...filter,
    accountIds,
    includeUnlinked: filter.includeUnlinked ?? true,
    pfcPrimaryList,
    statusList,
  };
}

export function filterRecurringCashflowRows(
  rows: ProfileRecurringCashflowResponse[],
  filter: RecurringCashflowsFilterState,
  banks: LinkedBankResponse[] | undefined,
): ProfileRecurringCashflowResponse[] {
  const allAccountIds = getAllAccountIds(banks);
  const selectedAccountIds =
    filter.accountIds === undefined ? allAccountIds : filter.accountIds;
  const selectedCategories =
    filter.pfcPrimaryList ?? [...PFC_PRIMARY_CATEGORY_CODES];
  const selectedStatuses =
    filter.statusList ?? [...RECURRING_CASHFLOW_STATUS_FILTER_IDS];
  const includeUnlinked = filter.includeUnlinked ?? true;

  return rows.filter((row) => {
    const linkedId =
      row.linkedBankAccountId ?? row.linkedBankAccount?.id ?? null;

    if (linkedId == null) {
      if (!includeUnlinked) return false;
    } else {
      if (!selectedAccountIds.includes(linkedId)) return false;
    }

    const code =
      row.pfcPrimary?.trim() || PFC_PRIMARY_UNCATEGORIZED_FILTER_CODE;
    if (!selectedCategories.includes(code)) return false;

    const st = row.status?.trim().toLowerCase() ?? "";
    if (!selectedStatuses.includes(st)) return false;

    return true;
  });
}

function areRecurringCashflowsFiltersEqual(
  a: RecurringCashflowsFilterState,
  b: RecurringCashflowsFilterState,
): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

type UseRecurringCashflowsFilterOptions = {
  banks: LinkedBankResponse[] | undefined;
  applied: RecurringCashflowsFilterState;
  onApply: (filter: RecurringCashflowsFilterState) => void;
};

export type RecurringCashflowsFilterTriggerProps = {
  isMobile: boolean;
  isDesktopOpen: boolean;
  isMobileOpen: boolean;
  onOpen: () => void;
  className?: string;
};

export type RecurringCashflowsFilterPanelsProps = {
  banks: LinkedBankResponse[] | undefined;
  draftFilter: RecurringCashflowsFilterState;
  setDraftFilter: Dispatch<SetStateAction<RecurringCashflowsFilterState>>;
  isMobile: boolean;
  isDesktopOpen: boolean;
  isMobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
  onCancel: () => void;
  onApply: () => void;
};

type FilterActionsProps = {
  onCancel: () => void;
  onApply: () => void;
  className?: string;
};

function FilterActions({ onCancel, onApply, className }: FilterActionsProps) {
  return (
    <div className={cn("flex flex-wrap justify-end gap-2", className)}>
      <Button type="button" variant="outline" size="sm" onClick={onCancel}>
        Cancel
      </Button>
      <Button type="button" size="sm" onClick={onApply}>
        Apply
      </Button>
    </div>
  );
}

export function useRecurringCashflowsFilter({
  banks,
  applied,
  onApply,
}: UseRecurringCashflowsFilterOptions) {
  const isMobile = useIsMobile();
  const [isDesktopOpen, setIsDesktopOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [draftFilter, setDraftFilter] =
    useState<RecurringCashflowsFilterState>(applied);
  const draftFilterRef = useRef(draftFilter);
  draftFilterRef.current = draftFilter;

  useEffect(() => {
    if (isDesktopOpen || isMobileOpen) return;

    setDraftFilter((current) =>
      areRecurringCashflowsFiltersEqual(current, applied) ? current : applied,
    );
  }, [applied, isDesktopOpen, isMobileOpen]);

  const closeAllPanels = useCallback(() => {
    setIsDesktopOpen(false);
    setIsMobileOpen(false);
  }, []);

  const handleCancel = useCallback(() => {
    setDraftFilter(applied);
    closeAllPanels();
  }, [applied, closeAllPanels]);

  const handleApply = useCallback(() => {
    onApply(draftFilterRef.current);
  }, [onApply]);

  const handleOpen = useCallback(() => {
    if (isMobile) {
      setIsMobileOpen(true);
      return;
    }

    setIsDesktopOpen((open) => !open);
  }, [isMobile]);

  return {
    triggerProps: {
      isMobile,
      isDesktopOpen,
      isMobileOpen,
      onOpen: handleOpen,
    } satisfies RecurringCashflowsFilterTriggerProps,
    panelsProps: {
      banks,
      draftFilter,
      setDraftFilter,
      isMobile,
      isDesktopOpen,
      isMobileOpen,
      onMobileOpenChange: setIsMobileOpen,
      onCancel: handleCancel,
      onApply: handleApply,
    } satisfies RecurringCashflowsFilterPanelsProps,
  };
}

export function RecurringCashflowsFilterTrigger({
  isMobile,
  isDesktopOpen,
  isMobileOpen,
  onOpen,
  className,
}: RecurringCashflowsFilterTriggerProps) {
  return (
    <Button
      type="button"
      variant={isDesktopOpen && !isMobile ? "secondary" : "outline"}
      className={className}
      onClick={onOpen}
      aria-expanded={isMobile ? isMobileOpen : isDesktopOpen}
    >
      <SlidersHorizontal className="size-4" aria-hidden />
      Filters
      {!isMobile ? (
        <ChevronDown
          className={cn(
            "size-4 transition-transform",
            isDesktopOpen && "rotate-180",
          )}
          aria-hidden
        />
      ) : null}
    </Button>
  );
}

export function RecurringCashflowsFilterPanels({
  banks,
  draftFilter,
  setDraftFilter,
  isMobile,
  isDesktopOpen,
  isMobileOpen,
  onMobileOpenChange,
  onCancel,
  onApply,
}: RecurringCashflowsFilterPanelsProps) {
  return (
    <>
      {!isMobile && isDesktopOpen ? (
        <div
          className="rounded-xl border border-border bg-card p-4 shadow-sm"
          id="recurring-cashflows-filters-panel"
        >
          <RecurringCashflowsFilterForm
            filter={draftFilter}
            onChange={setDraftFilter}
            banks={banks}
            variant="default"
          />
          <div className="mt-4 border-t border-border pt-4">
            <FilterActions onCancel={onCancel} onApply={onApply} />
          </div>
        </div>
      ) : null}

      <Sheet open={isMobile && isMobileOpen} onOpenChange={onMobileOpenChange}>
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
              filter={draftFilter}
              onChange={setDraftFilter}
              banks={banks}
              variant="sheet"
            />
          </div>

          <SheetFooter className="border-t border-border px-5 py-4">
            <FilterActions
              className="gap-4"
              onCancel={onCancel}
              onApply={onApply}
            />
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
