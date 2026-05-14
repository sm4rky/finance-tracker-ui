"use client";

import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

import {
  filterRecurringCalendarOccurrences,
} from "@/components/recurring-cashflows-filter";
import { getPfcPrimaryMeta } from "@/components/transactions-columns";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { LinkedBankResponse } from "@/interface/plaid";
import type {
  ProfileRecurringCashflowCalendarOccurrenceResponse,
  RecurringCashflowsFilterState,
} from "@/interface/profile-recurring-cashflow";
import { listProfileRecurringCashflowsCalendar } from "@/lib/api/profile-recurring-cashflows";
import { buildMonthCalendarGrid, parseIsoDate, toIsoDate } from "@/lib/recurring-calendar-dates";
import { cn } from "@/lib/utils";

const monthSlideVariants = {
  enter: (dir: number) => ({
    y: dir >= 0 ? 20 : -20,
    opacity: 0,
  }),
  center: { y: 0, opacity: 1 },
  exit: (dir: number) => ({
    y: dir >= 0 ? -20 : 20,
    opacity: 0,
  }),
};

function getMonthYearTitle(year: number, month: number): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month, 1));
}

function recurringCashflowMerchantName(
  row: ProfileRecurringCashflowCalendarOccurrenceResponse,
): string {
  const m = row.merchantName?.trim();
  return m || "—";
}

function recurringCashflowDescription(
  row: ProfileRecurringCashflowCalendarOccurrenceResponse,
): string {
  const d = row.description?.trim();
  return d || "—";
}

function formatHeaderDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date).toUpperCase();
}

function formatCurrencyUsd(amount: number): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD",
    }).format(Math.abs(amount));
  } catch {
    return Math.abs(amount).toFixed(2);
  }
}

function distinctCalendarDotClasses(
  items: ProfileRecurringCashflowCalendarOccurrenceResponse[] | undefined,
): string[] {
  if (!items?.length) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const o of items) {
    const meta = getPfcPrimaryMeta(o.pfcPrimary);
    const cls = meta.calendarDotClassName;
    if (seen.has(cls)) continue;
    seen.add(cls);
    out.push(cls);
    if (out.length >= 4) break;
  }
  return out;
}

export type SubscriptionsCalendarViewProps = {
  appliedFilter: RecurringCashflowsFilterState;
  banks: LinkedBankResponse[] | undefined;
};

export function SubscriptionsCalendarView({
  appliedFilter,
  banks,
}: SubscriptionsCalendarViewProps) {
  const todayIso = toIsoDate(new Date());
  const [viewMonth, setViewMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [slideDirection, setSlideDirection] = useState(0);
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);

  const { dateFrom, dateTo } = useMemo(
    () => {
      const start = new Date(viewMonth.year, viewMonth.month, 1);
      const end = new Date(viewMonth.year, viewMonth.month + 1, 0);
      return { dateFrom: toIsoDate(start), dateTo: toIsoDate(end) };
    },
    [viewMonth.year, viewMonth.month],
  );

  const date = useMemo(() => new Date(viewMonth.year, viewMonth.month, 1), [viewMonth]);
  const weeks = useMemo(() => buildMonthCalendarGrid(date), [date]);

  const { data, isPending, isError } = useQuery({
    queryKey: ["profile-recurring-calendar-cashflows", dateFrom, dateTo],
    queryFn: () => listProfileRecurringCashflowsCalendar({ dateFrom, dateTo }),
  });

  const occurrencesMapByDate = useMemo(() => {
    const filtered = filterRecurringCalendarOccurrences(data ?? [], appliedFilter, banks);
    const map = new Map<string, ProfileRecurringCashflowCalendarOccurrenceResponse[]>();
    for (const occurrence of filtered) {
      const dateKey = occurrence.date?.trim();
      if (!dateKey) continue;
      if (!map.has(dateKey)) map.set(dateKey, []);
      map.get(dateKey)!.push(occurrence);
    }
    return map;
  }, [data, appliedFilter, banks]);

  const occurrencesGroupsByDate = useMemo(() => {
    if (selectedDateKey) {
      return [{ dateKey: selectedDateKey, rows: occurrencesMapByDate.get(selectedDateKey) ?? [] }];
    }
    const keys = Array.from(occurrencesMapByDate.keys()).sort();
    return keys.map((dateKey) => ({ dateKey, rows: occurrencesMapByDate.get(dateKey)! }));
  }, [occurrencesMapByDate, selectedDateKey]);

  const canGoPrev = useMemo(() => {
    const now = new Date();
    return viewMonth.year * 12 + viewMonth.month > now.getFullYear() * 12 + now.getMonth();
  }, [viewMonth]);

  const goPreviousMonth = useCallback(() => {
    if (!canGoPrev) return;
    setSlideDirection(-1);
    setViewMonth((prev) => {
      const date = new Date(prev.year, prev.month - 1, 1);
      return { year: date.getFullYear(), month: date.getMonth() };
    });
    setSelectedDateKey(null);
  }, [canGoPrev]);

  const goNextMonth = useCallback(() => {
    setSlideDirection(1);
    setViewMonth((prev) => {
      const date = new Date(prev.year, prev.month + 1, 1);
      return { year: date.getFullYear(), month: date.getMonth() };
    });
    setSelectedDateKey(null);
  }, []);

  const onDateClick = useCallback((iso: string, inMonth: boolean) => {
    if (!inMonth) return;
    setSelectedDateKey((prev) => (prev === iso ? null : iso));
  }, []);

  return (
    <ResizablePanelGroup
      orientation="vertical"
      className="h-[min(720px,calc(100svh-10rem))] w-full min-h-[min(420px,calc(100svh-11rem))] min-w-0 shrink-0 overflow-hidden"
    >
      <ResizablePanel
        defaultSize="45%"
        minSize="30%"
        maxSize="70%"
        className="flex min-h-0 min-w-0 flex-col overflow-x-hidden overflow-y-visible"
      >
        <div className="flex shrink-0 items-center justify-between gap-2 px-0.5 pb-2">
          <h2 className="truncate text-base font-semibold tracking-tight md:text-lg">
            {getMonthYearTitle(viewMonth.year, viewMonth.month)}
          </h2>
          <div className="flex shrink-0 items-center gap-0.5">
            <Button
              type="button"
              variant="ghost"
              className="text-muted-foreground"
              aria-label="Previous month"
              disabled={!canGoPrev}
              onClick={goPreviousMonth}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="text-muted-foreground"
              aria-label="Next month"
              onClick={goNextMonth}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>

        <div className="grid shrink-0 grid-cols-7 pb-4 text-xs text-muted-foreground">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((date) => (
            <div key={date} className="text-center font-medium">
              {date}
            </div>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {isPending ? (
            <div className="flex shrink-0 flex-col gap-y-1 py-1 pb-4">
              {Array.from({ length: weeks.length }).map((_, index) => (
                <div key={index} className="grid shrink-0 grid-cols-7 py-0.5">
                  {Array.from({ length: 7 }).map((_, index) => (
                    <Skeleton key={index} className="mx-auto size-8 rounded-full" />
                  ))}
                </div>
              ))}
            </div>
          ) : isError ? (
            <p className="shrink-0 text-sm text-destructive">
              Could not load calendar.
            </p>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={`${viewMonth.year}-${viewMonth.month}`}
                custom={slideDirection}
                variants={monthSlideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                className="flex shrink-0 flex-col gap-y-1 py-1 pb-4"
              >
                {weeks.map((week, index) => (
                  <div
                    key={index}
                    className="grid shrink-0 grid-cols-7 py-0.5"
                  >
                    {week.map(({ date, inMonth }) => {
                      const iso = toIsoDate(date);
                      const isTodayCell = iso === todayIso;
                      const isSelected = selectedDateKey === iso;
                      const dayNum = date.getDate();
                      const dayItems = occurrencesMapByDate.get(iso);
                      const dots = distinctCalendarDotClasses(dayItems);

                      return (
                        <div
                          key={iso}
                          className="relative flex flex-col items-center"
                        >
                          <button
                            type="button"
                            disabled={!inMonth}
                            onClick={() => onDateClick(iso, inMonth)}
                            className={cn(
                              "relative z-[1] flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-medium tabular-nums transition-colors",
                              inMonth ? "text-foreground hover:bg-muted/85" : "opacity-40 text-muted-foreground pointer-events-none",
                              isTodayCell && !isSelected && "bg-muted-foreground/20",
                              isSelected && "bg-sky-600 text-white hover:text-foreground",
                            )}
                          >
                            {dayNum}
                          </button>
                          <div
                            className="pointer-events-none absolute bottom-1/8 left-1/2 z-[2] flex -translate-x-1/2 translate-y-[55%] items-center justify-center gap-1"
                            aria-hidden
                          >
                            {dots.map((dotCls, di) => (
                              <span
                                key={`${iso}-dot-${di}`}
                                className={cn(
                                  "size-1.5 shrink-0 rounded-full",
                                  dotCls,
                                )}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </ResizablePanel>

      <ResizableHandle className="my-4" />

      <ResizablePanel
        defaultSize="55%"
        minSize="30%"
        maxSize="70%"
        className="min-h-0 min-w-0 overflow-x-hidden overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {isPending ? (
          <div className="space-y-3 p-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-none" />
            ))}
          </div>
        ) : isError ? null : occurrencesGroupsByDate.length === 0 ? (
          <p className="px-3 py-10 text-center text-sm text-muted-foreground">
            No payments scheduled this month.
          </p>
        ) : (
          <div className="px-2 pb-6 pt-1 md:px-3">
            {occurrencesGroupsByDate.map(({ dateKey, rows }) => (
              <section key={dateKey} className="border-b border-border/50 last:border-b-0">
                <div className="flex flex-wrap items-center gap-2 pb-2 pt-3 first:pt-1">
                  <span className="text-xs font-medium tracking-wide text-muted-foreground">
                    {formatHeaderDate(parseIsoDate(dateKey))}
                  </span>
                  {dateKey === todayIso && (
                    <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                      Today
                    </span>
                  )}
                </div>

                {rows.length === 0 ? (
                  <p className="px-1 pb-6 pt-1 text-center text-sm text-muted-foreground">
                    No payments scheduled for this day.
                  </p>
                ) : (
                  <ul className="pb-2">
                    {rows.map((row, index) => {
                      const meta = getPfcPrimaryMeta(row.pfcPrimary);
                      const Icon = meta.Icon;
                      const merchantLine = recurringCashflowMerchantName(row);
                      const descriptionLine = recurringCashflowDescription(row);
                      const amountLine = `${row.direction === "inflow" ? "+" : "-"}${formatCurrencyUsd(row.amount)}`;
                      const amountClass =
                        row.direction === "inflow"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-destructive";
                      return (
                        <li
                          key={`${row.recurringCashflowId}-${row.date}-${index}`}
                          className="flex items-start gap-3 border-b border-border/60 py-3 last:border-b-0"
                        >
                          <div
                            className={cn(
                              "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/40",
                              meta.fallbackIconClassName,
                            )}
                            aria-hidden
                          >
                            <Icon className="size-4 shrink-0 opacity-90" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-medium text-foreground">
                              {merchantLine}
                            </div>
                            <div className="truncate text-xs text-muted-foreground">
                              {descriptionLine}
                            </div>
                          </div>
                          <span
                            className={cn(
                              "shrink-0 pt-0.5 tabular-nums text-sm font-medium",
                              amountClass,
                            )}
                          >
                            {amountLine}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            ))}
          </div>
        )}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
