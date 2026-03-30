"use client";

import type { HTMLAttributes } from "react";
import type { Column } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronsUpDown, EyeOff } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export type DataTableColumnHeaderProps<TData, TValue> =
  HTMLAttributes<HTMLDivElement> & {
    column: Column<TData, TValue>;
    title: string;
  };

export function DataTableColumnHeader<TData, TValue>({
  className,
  column,
  title,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  const sorted = column.getIsSorted();

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger
          type="button"
          className={cn(
            "-ml-1.5 inline-flex h-8 items-center gap-1 rounded-lg border border-transparent px-2.5 text-left text-sm font-medium outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 data-popup-open:bg-muted data-open:bg-muted",
          )}
          aria-label={`Sort by ${title}`}
        >
          <span>{title}</span>
          {sorted === "desc" ? (
            <ArrowDown className="size-4 shrink-0 opacity-60" aria-hidden />
          ) : sorted === "asc" ? (
            <ArrowUp className="size-4 shrink-0 opacity-60" aria-hidden />
          ) : (
            <ChevronsUpDown
              className="size-4 shrink-0 opacity-50"
              aria-hidden
            />
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-40">
          <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
            <ArrowUp className="size-4 text-muted-foreground" aria-hidden />
            Asc
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
            <ArrowDown className="size-4 text-muted-foreground" aria-hidden />
            Desc
          </DropdownMenuItem>
          {column.getIsSorted() ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => column.clearSorting()}>
                <EyeOff className="size-4 text-muted-foreground" aria-hidden />
                Clear
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
