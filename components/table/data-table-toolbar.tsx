"use client";

import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type DataTableToolbarProps = {
  className?: string;
  showSearch?: boolean;
  searchPlaceholder?: string;
  /** Value kept in sync with table `globalFilter` / API query. */
  searchValue: string;
  /** If `debounceMs` is unset: `onSearchChange` runs on every change. If set: debounced after typing stops. */
  onSearchChange: (value: string) => void;
  debounceMs?: number;
  /** API-driven filters: selects, date range, etc. */
  filters?: React.ReactNode;
};

export function DataTableToolbar({
  className,
  showSearch = true,
  searchPlaceholder = "Search…",
  searchValue,
  onSearchChange,
  debounceMs,
  filters,
}: DataTableToolbarProps) {
  const [draft, setDraft] = useState(searchValue);
  const skipDebounceEffect = useRef(true);

  useEffect(() => {
    setDraft(searchValue);
  }, [searchValue]);

  useEffect(() => {
    if (debounceMs == null) return;
    if (skipDebounceEffect.current) {
      skipDebounceEffect.current = false;
      return;
    }
    const id = window.setTimeout(() => {
      onSearchChange(draft);
    }, debounceMs);
    return () => window.clearTimeout(id);
  }, [draft, debounceMs, onSearchChange]);

  const handleInputChange = (value: string) => {
    if (debounceMs != null) {
      setDraft(value);
      return;
    }
    onSearchChange(value);
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
        {showSearch ? (
          <div className="relative max-w-sm min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              type="search"
              placeholder={searchPlaceholder}
              value={debounceMs != null ? draft : searchValue}
              onChange={(e) => handleInputChange(e.target.value)}
              className="h-8 pl-8"
              aria-label={searchPlaceholder}
            />
          </div>
        ) : null}
        {filters ? (
          <div className="flex min-w-0 flex-wrap items-center gap-2">{filters}</div>
        ) : null}
      </div>
    </div>
  );
}
