"use client";

import type { Table as TanStackTable } from "@tanstack/react-table";

import {
  Pagination,
  PaginationContent,
  PaginationFirst,
  PaginationItem,
  PaginationLast,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

export type DataTablePaginationProps<TData> = {
  table: TanStackTable<TData>;
  /** Total row count from the API (for “X–Y of Z”). */
  totalRows?: number;
  className?: string;
};

export function DataTablePagination<TData>({
  table,
  totalRows,
  className,
}: DataTablePaginationProps<TData>) {
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const pageCount = table.getPageCount();

  const from = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
  const to =
    totalRows == null
      ? null
      : Math.min((pageIndex + 1) * pageSize, totalRows);

  const lastIndex = pageCount > 0 ? pageCount - 1 : 0;

  return (
    <div
      className={cn(
        "flex flex-col gap-4 px-2 py-4 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="text-sm text-muted-foreground">
        {totalRows != null && to != null ? (
          <span>
            {from}–{to} of {totalRows}
          </span>
        ) : (
          <span>
            Page {pageIndex + 1}
            {pageCount > 0 ? ` of ${pageCount}` : ""}
          </span>
        )}
      </div>

      <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:gap-6 lg:gap-8">
        <div className="flex items-center gap-2">
          <p className="whitespace-nowrap text-sm font-medium text-muted-foreground">
            Rows per page
          </p>
          <Select
            value={String(pageSize)}
            onValueChange={(v: string | null) => {
              if (v != null) table.setPageSize(Number(v));
            }}
          >
            <SelectTrigger size="sm" className="w-[4.5rem]" aria-label="Rows per page">
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="top" align="end" alignItemWithTrigger={false}>
              {PAGE_SIZE_OPTIONS.map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Pagination className="mx-0 w-auto justify-end">
          <PaginationContent>
            <PaginationItem>
              <PaginationFirst
                className="hidden sm:flex"
                disabled={!table.getCanPreviousPage()}
                onClick={() => table.setPageIndex(0)}
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationPrevious
                disabled={!table.getCanPreviousPage()}
                onClick={() => table.previousPage()}
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                disabled={!table.getCanNextPage()}
                onClick={() => table.nextPage()}
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationLast
                className="hidden sm:flex"
                disabled={!table.getCanNextPage()}
                onClick={() => table.setPageIndex(lastIndex)}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
