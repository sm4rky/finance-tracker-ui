"use client";

import { CalendarDays, List } from "lucide-react";

import { cn } from "@/lib/utils";

export type SubscriptionsViewMode = "list" | "calendar";

export type SubscriptionsViewModeToggleProps = {
  mode: SubscriptionsViewMode;
  onModeChange: (mode: SubscriptionsViewMode) => void;
  className?: string;
};

export function SubscriptionsViewModeToggle({
  mode,
  onModeChange,
  className,
}: SubscriptionsViewModeToggleProps) {
  return (
    <div
      aria-label="Subscriptions view"
      className={cn(
        "inline-flex shrink-0 rounded-xl border border-border/80 bg-card p-1",
        className,
      )}
    >
      <button
        type="button"
        aria-selected={mode === "list"}
        className={cn(
          "flex size-7 items-center justify-center rounded-lg transition-colors",
          mode === "list"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground",
        )}
        onClick={() => onModeChange("list")}
      >
        <List className="size-4 shrink-0" aria-hidden />
        <span className="sr-only">List view</span>
      </button>
      <button
        type="button"
        aria-selected={mode === "calendar"}
        className={cn(
          "flex size-7 items-center justify-center rounded-lg transition-colors",
          mode === "calendar"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground",
        )}
        onClick={() => onModeChange("calendar")}
      >
        <CalendarDays className="size-4 shrink-0" aria-hidden />
        <span className="sr-only">Calendar view</span>
      </button>
    </div>
  );
}
