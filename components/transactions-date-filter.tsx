"use client";

import { useCallback, useMemo, useState } from "react";
import { CalendarRange, ChevronDown } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DATE_PRESET_LABELS,
  DATE_PRESET_ORDER,
  type DatePreset,
  formatCustomDateRangeLabel,
  getDateRangeForPreset,
  getTodayISODate,
  inferDatePreset,
} from "@/lib/transactions-date-range";
import { useAppliedTransactionsFilter } from "@/hooks/use-applied-transactions-filter";
import { useIsMobile } from "@/hooks/use-mobile";
import type { TransactionsFilterState } from "@/lib/transaction-filter";
import { cn } from "@/lib/utils";

type TransactionsDateFilterProps = {
  onFilterChange?: () => void;
};

function mergeAppliedDates(
  base: TransactionsFilterState,
  dateFrom: string | undefined,
  dateTo: string | undefined,
): TransactionsFilterState {
  return {
    ...base,
    dateFrom,
    dateTo,
  };
}

export function TransactionsDateFilter({
  onFilterChange,
}: TransactionsDateFilterProps = {}) {
  const isMobile = useIsMobile();
  const { appliedFilter, isFilterStoreHydrated, setAppliedFilter } =
    useAppliedTransactionsFilter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const maxDate = useMemo(() => getTodayISODate(), []);

  const activePreset = useMemo(
    () => inferDatePreset(appliedFilter.dateFrom, appliedFilter.dateTo),
    [appliedFilter.dateFrom, appliedFilter.dateTo],
  );

  const triggerLabel = useMemo(() => {
    if (activePreset === "custom") {
      return formatCustomDateRangeLabel(
        appliedFilter.dateFrom,
        appliedFilter.dateTo,
      );
    }
    return DATE_PRESET_LABELS[activePreset];
  }, [activePreset, appliedFilter.dateFrom, appliedFilter.dateTo]);

  const applyDateRange = useCallback(
    (dateFrom: string | undefined, dateTo: string | undefined) => {
      setAppliedFilter(mergeAppliedDates(appliedFilter, dateFrom, dateTo));
      onFilterChange?.();
    },
    [appliedFilter, onFilterChange, setAppliedFilter],
  );

  const handleSelectPreset = useCallback(
    (preset: Exclude<DatePreset, "custom">) => {
      const { dateFrom, dateTo } = getDateRangeForPreset(preset);
      applyDateRange(dateFrom, dateTo);
      setMenuOpen(false);
    },
    [applyDateRange],
  );

  const handleApplyCustom = useCallback(() => {
    applyDateRange(
      customFrom.trim() || undefined,
      customTo.trim() || undefined,
    );
    setMenuOpen(false);
  }, [applyDateRange, customFrom, customTo]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      setMenuOpen(open);
      if (open) {
        setCustomFrom(appliedFilter.dateFrom ?? "");
        setCustomTo(appliedFilter.dateTo ?? "");
      }
    },
    [appliedFilter.dateFrom, appliedFilter.dateTo],
  );

  return (
    <DropdownMenu open={menuOpen} onOpenChange={handleOpenChange} modal={false}>
      <DropdownMenuTrigger
        type="button"
        disabled={!isFilterStoreHydrated}
        aria-label="Date range"
        className={cn(
          buttonVariants({
            variant: !isMobile && menuOpen ? "secondary" : "outline",
          }),
          "max-w-[min(100vw-6rem,18rem)] gap-1.5 font-normal",
        )}
      >
        <CalendarRange className="size-4 shrink-0 opacity-70" aria-hidden />
        <span className="min-w-0 flex-1 truncate">{triggerLabel}</span>
        {!isMobile ? (
          <ChevronDown
            className={cn(
              "size-4 shrink-0 transition-transform",
              menuOpen && "rotate-180",
            )}
            aria-hidden
          />
        ) : null}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="w-72 p-1"
        sideOffset={6}
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-[11px] font-semibold uppercase tracking-wide">
            Date range
          </DropdownMenuLabel>

          {DATE_PRESET_ORDER.map((preset) => (
            <DropdownMenuItem
              key={preset}
              className={cn(
                "cursor-pointer gap-2",
                activePreset === preset && "bg-accent",
              )}
              onClick={() => handleSelectPreset(preset)}
            >
              {DATE_PRESET_LABELS[preset]}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <div
          className="flex flex-col gap-3 p-2"
          onPointerDown={(e) => e.preventDefault()}
        >
          <p className="text-xs font-medium text-muted-foreground">
            Custom range
          </p>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tdf-date-from" className="text-xs">
              From
            </Label>
            <Input
              id="tdf-date-from"
              type="date"
              max={maxDate}
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tdf-date-to" className="text-xs">
              To
            </Label>
            <Input
              id="tdf-date-to"
              type="date"
              max={maxDate}
              min={customFrom || undefined}
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
            />
          </div>

          <Button
            type="button"
            size="sm"
            className="w-full"
            onClick={handleApplyCustom}
          >
            Apply
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
