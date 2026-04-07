"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Car,
  Check,
  ChevronDown,
  CircleDollarSign,
  CircleHelp,
  Clapperboard,
  FilterX,
  Hammer,
  HandCoins,
  HeartPulse,
  Home,
  Landmark,
  Plane,
  Receipt,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Tag,
  UtensilsCrossed,
  Wallet,
  Wrench,
} from "lucide-react";

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
import type { TransactionsFilterState } from "@/interface/transaction";
import { getDateRangeForPreset } from "@/lib/transactions-date-range";
import { cn } from "@/lib/utils";

import { TransactionsFilterForm } from "./transactions-filter-form";

type PfcPrimaryMeta = {
  displayName: string;
  badgeClassName: string;
  fallbackIconClassName: string;
  Icon: LucideIcon;
};

type PaymentChannelMeta = {
  displayName: string;
  badgeClassName: string;
};

export const PFC_PRIMARY_UNCATEGORIZED_FILTER_CODE = "__UNCATEGORIZED__";

const PFC_PRIMARY_BY_CODE: Record<string, PfcPrimaryMeta> = {
  BANK_FEES: {
    displayName: "Bank fees",
    badgeClassName:
      "border-slate-500/25 bg-slate-500/15 text-slate-900 dark:text-slate-100",
    fallbackIconClassName:
      "bg-slate-500/15 text-slate-800 dark:text-slate-200",
    Icon: CircleDollarSign,
  },
  ENTERTAINMENT: {
    displayName: "Entertainment",
    badgeClassName:
      "border-violet-500/25 bg-violet-500/15 text-violet-900 dark:text-violet-100",
    fallbackIconClassName:
      "bg-violet-500/15 text-violet-800 dark:text-violet-200",
    Icon: Clapperboard,
  },
  FOOD_AND_DRINK: {
    displayName: "Food & drink",
    badgeClassName:
      "border-orange-500/25 bg-orange-500/15 text-orange-950 dark:text-orange-100",
    fallbackIconClassName:
      "bg-orange-500/15 text-orange-900 dark:text-orange-200",
    Icon: UtensilsCrossed,
  },
  GENERAL_MERCHANDISE: {
    displayName: "General merchandise",
    badgeClassName:
      "border-sky-500/25 bg-sky-500/15 text-sky-950 dark:text-sky-100",
    fallbackIconClassName: "bg-sky-500/15 text-sky-900 dark:text-sky-200",
    Icon: ShoppingBag,
  },
  GENERAL_SERVICES: {
    displayName: "General services",
    badgeClassName:
      "border-zinc-500/25 bg-zinc-500/15 text-zinc-900 dark:text-zinc-100",
    fallbackIconClassName: "bg-zinc-500/15 text-zinc-800 dark:text-zinc-200",
    Icon: Wrench,
  },
  GOVERNMENT_AND_NON_PROFIT: {
    displayName: "Government & nonprofit",
    badgeClassName:
      "border-indigo-500/25 bg-indigo-500/15 text-indigo-950 dark:text-indigo-100",
    fallbackIconClassName:
      "bg-indigo-500/15 text-indigo-900 dark:text-indigo-200",
    Icon: Landmark,
  },
  HOME_IMPROVEMENT: {
    displayName: "Home improvement",
    badgeClassName:
      "border-amber-700/25 bg-amber-700/15 text-amber-950 dark:text-amber-100",
    fallbackIconClassName:
      "bg-amber-700/15 text-amber-900 dark:text-amber-200",
    Icon: Hammer,
  },
  INCOME: {
    displayName: "Income",
    badgeClassName:
      "border-emerald-600/25 bg-emerald-600/15 text-emerald-950 dark:text-emerald-100",
    fallbackIconClassName:
      "bg-emerald-600/15 text-emerald-900 dark:text-emerald-200",
    Icon: Wallet,
  },
  LOAN_DISBURSEMENTS: {
    displayName: "Loan disbursements",
    badgeClassName:
      "border-teal-500/25 bg-teal-500/15 text-teal-950 dark:text-teal-100",
    fallbackIconClassName: "bg-teal-500/15 text-teal-900 dark:text-teal-200",
    Icon: HandCoins,
  },
  LOAN_PAYMENTS: {
    displayName: "Loan payments",
    badgeClassName:
      "border-rose-500/25 bg-rose-500/15 text-rose-950 dark:text-rose-100",
    fallbackIconClassName: "bg-rose-500/15 text-rose-900 dark:text-rose-200",
    Icon: Receipt,
  },
  MEDICAL: {
    displayName: "Medical",
    badgeClassName:
      "border-red-500/25 bg-red-500/15 text-red-950 dark:text-red-100",
    fallbackIconClassName: "bg-red-500/15 text-red-900 dark:text-red-200",
    Icon: HeartPulse,
  },
  OTHER: {
    displayName: "Other",
    badgeClassName:
      "border-neutral-500/25 bg-neutral-500/15 text-neutral-900 dark:text-neutral-100",
    fallbackIconClassName:
      "bg-neutral-500/15 text-neutral-800 dark:text-neutral-200",
    Icon: CircleHelp,
  },
  PERSONAL_CARE: {
    displayName: "Personal care",
    badgeClassName:
      "border-fuchsia-500/25 bg-fuchsia-500/15 text-fuchsia-950 dark:text-fuchsia-100",
    fallbackIconClassName:
      "bg-fuchsia-500/15 text-fuchsia-900 dark:text-fuchsia-200",
    Icon: Sparkles,
  },
  RENT_AND_UTILITIES: {
    displayName: "Rent & utilities",
    badgeClassName:
      "border-cyan-600/25 bg-cyan-600/15 text-cyan-950 dark:text-cyan-100",
    fallbackIconClassName: "bg-cyan-600/15 text-cyan-900 dark:text-cyan-200",
    Icon: Home,
  },
  TRANSFER_IN: {
    displayName: "Transfer in",
    badgeClassName:
      "border-lime-600/25 bg-lime-600/15 text-lime-950 dark:text-lime-100",
    fallbackIconClassName: "bg-lime-600/15 text-lime-900 dark:text-lime-200",
    Icon: ArrowDownLeft,
  },
  TRANSFER_OUT: {
    displayName: "Transfer out",
    badgeClassName:
      "border-amber-600/25 bg-amber-600/15 text-amber-950 dark:text-amber-100",
    fallbackIconClassName:
      "bg-amber-600/15 text-amber-900 dark:text-amber-200",
    Icon: ArrowUpRight,
  },
  TRANSPORTATION: {
    displayName: "Transportation",
    badgeClassName:
      "border-blue-600/25 bg-blue-600/15 text-blue-950 dark:text-blue-100",
    fallbackIconClassName: "bg-blue-600/15 text-blue-900 dark:text-blue-200",
    Icon: Car,
  },
  TRAVEL: {
    displayName: "Travel",
    badgeClassName:
      "border-purple-600/25 bg-purple-600/15 text-purple-950 dark:text-purple-100",
    fallbackIconClassName:
      "bg-purple-600/15 text-purple-900 dark:text-purple-200",
    Icon: Plane,
  },
};

const PFC_PRIMARY_FALLBACK: PfcPrimaryMeta = {
  displayName: "Uncategorized",
  badgeClassName:
    "border-muted-foreground/25 bg-muted text-muted-foreground",
  fallbackIconClassName: "bg-muted text-muted-foreground",
  Icon: Tag,
};

export const PFC_PRIMARY_CATEGORY_CODES = [
  ...Object.keys(PFC_PRIMARY_BY_CODE),
  PFC_PRIMARY_UNCATEGORIZED_FILTER_CODE,
];

const PAYMENT_CHANNEL_META_BY_KEY: Record<string, PaymentChannelMeta> = {
  online: {
    displayName: "Online",
    badgeClassName:
      "border-sky-500/30 bg-sky-500/15 text-sky-950 dark:text-sky-100",
  },
  instore: {
    displayName: "In store",
    badgeClassName:
      "border-violet-500/30 bg-violet-500/15 text-violet-950 dark:text-violet-100",
  },
  other: {
    displayName: "Other",
    badgeClassName:
      "border-zinc-500/30 bg-zinc-500/15 text-zinc-900 dark:text-zinc-100",
  },
};

export const PAYMENT_CHANNEL_FILTER_IDS = [
  "online",
  "instore",
  "other",
] as const;

export type ChannelFilterId = (typeof PAYMENT_CHANNEL_FILTER_IDS)[number];

export function getPfcCategoryMeta(code: string): PfcPrimaryMeta {
  return code === PFC_PRIMARY_UNCATEGORIZED_FILTER_CODE
    ? PFC_PRIMARY_FALLBACK
    : PFC_PRIMARY_BY_CODE[code] ?? PFC_PRIMARY_FALLBACK;
}

export function getPaymentChannelMeta(id: ChannelFilterId): PaymentChannelMeta {
  return PAYMENT_CHANNEL_META_BY_KEY[id];
}

export function getAllAccountIds(
  banks: LinkedBankResponse[] | undefined,
): string[] {
  return (banks ?? []).flatMap((bank) =>
    bank.accounts.map((account) => account.id),
  );
}

export function getDefaultTransactionsFilter(
  banks: LinkedBankResponse[] | undefined,
): TransactionsFilterState {
  const { dateFrom, dateTo } = getDateRangeForPreset("this_month");
  return {
    accountIds: getAllAccountIds(banks),
    includeUnlinkedTransactions: true,
    pfcPrimaryList: [...PFC_PRIMARY_CATEGORY_CODES],
    paymentChannels: [...PAYMENT_CHANNEL_FILTER_IDS],
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
  const validCategoryCodes = new Set(PFC_PRIMARY_CATEGORY_CODES);
  const validChannelIds = new Set<string>(PAYMENT_CHANNEL_FILTER_IDS);

  const accountIds =
    filter.accountIds === undefined
      ? validAccountIds.size > 0
        ? [...validAccountIds]
        : []
      : filter.accountIds.filter((id) => validAccountIds.has(id));

  let pfcPrimaryList = (filter.pfcPrimaryList ?? []).filter((code) =>
    validCategoryCodes.has(code),
  );
  let paymentChannels = (filter.paymentChannels ?? []).filter((channel) =>
    validChannelIds.has(channel),
  );

  if (pfcPrimaryList.length === 0) {
    pfcPrimaryList = [...PFC_PRIMARY_CATEGORY_CODES];
  }

  if (paymentChannels.length === 0) {
    paymentChannels = [...PAYMENT_CHANNEL_FILTER_IDS];
  }

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
  applied: TransactionsFilterState;
  onApply: (filter: TransactionsFilterState) => void;
};

export type TransactionsFilterTriggerProps = {
  isMobile: boolean;
  isDesktopOpen: boolean;
  isMobileOpen: boolean;
  onOpen: () => void;
  className?: string;
};

export type TransactionsFilterPanelsProps = {
  banks: LinkedBankResponse[] | undefined;
  draftFilter: TransactionsFilterState;
  setDraftFilter: Dispatch<SetStateAction<TransactionsFilterState>>;
  isMobile: boolean;
  isDesktopOpen: boolean;
  isMobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
  onClear: () => void;
  onApply: () => void;
};

type FilterActionsProps = {
  onClear?: () => void;
  onApply: () => void;
  className?: string;
};

function FilterActions({
  onClear,
  onApply,
  className,
}: FilterActionsProps) {
  return (
    <div className={cn("flex flex-wrap justify-end gap-2", className)}>
      {onClear ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={onClear}
        >
          <FilterX className="size-4 shrink-0" aria-hidden />
          Clear
        </Button>
      ) : null}
      <Button type="button" size="sm" className="gap-1.5" onClick={onApply}>
        <Check className="size-4 shrink-0" aria-hidden />
        Apply
      </Button>
    </div>
  );
}

export function useTransactionsFilter({
  banks,
  applied,
  onApply,
}: UseTransactionsFilterOptions) {
  const isMobile = useIsMobile();
  const [isDesktopOpen, setIsDesktopOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [draftFilter, setDraftFilter] =
    useState<TransactionsFilterState>(applied);
  const draftFilterRef = useRef(draftFilter);
  draftFilterRef.current = draftFilter;

  useEffect(() => {
    if (isDesktopOpen || isMobileOpen) {
      setDraftFilter((current) => {
        if (
          current.dateFrom === applied.dateFrom &&
          current.dateTo === applied.dateTo
        ) {
          return current;
        }
        return { ...current, dateFrom: applied.dateFrom, dateTo: applied.dateTo };
      });
      return;
    }

    setDraftFilter((current) =>
      areTransactionsFiltersEqual(current, applied) ? current : applied,
    );
  }, [applied, isDesktopOpen, isMobileOpen]);

  const handleClear = useCallback(() => {
    const defaults = getDefaultTransactionsFilter(banks);
    setDraftFilter({
      ...defaults,
      dateFrom: applied.dateFrom,
      dateTo: applied.dateTo,
    });
  }, [banks, applied.dateFrom, applied.dateTo]);

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
    } satisfies TransactionsFilterTriggerProps,
    panelsProps: {
      banks,
      draftFilter,
      setDraftFilter,
      isMobile,
      isDesktopOpen,
      isMobileOpen,
      onMobileOpenChange: setIsMobileOpen,
      onClear: handleClear,
      onApply: handleApply,
    } satisfies TransactionsFilterPanelsProps,
  };
}

export function TransactionsFilterTrigger({
  isMobile,
  isDesktopOpen,
  isMobileOpen,
  onOpen,
  className,
}: TransactionsFilterTriggerProps) {
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

export function TransactionsFilterPanels({
  banks,
  draftFilter,
  setDraftFilter,
  isMobile,
  isDesktopOpen,
  isMobileOpen,
  onMobileOpenChange,
  onClear,
  onApply,
}: TransactionsFilterPanelsProps) {
  return (
    <>
      {!isMobile && isDesktopOpen ? (
        <div
          className="rounded-xl border border-border bg-card p-4 shadow-sm"
          id="transactions-filters-panel"
        >
          <TransactionsFilterForm
            filter={draftFilter}
            onChange={setDraftFilter}
            banks={banks}
            variant="default"
          />
          <div className="mt-4 border-t border-border pt-4">
            <FilterActions onClear={onClear} onApply={onApply} />
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
            <TransactionsFilterForm
              filter={draftFilter}
              onChange={setDraftFilter}
              banks={banks}
              variant="sheet"
            />
          </div>

          <SheetFooter className="border-t border-border px-5 py-4">
            <FilterActions
              className="gap-4"
              onClear={onClear}
              onApply={onApply}
            />
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}