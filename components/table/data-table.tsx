"use client";

import type { ReactNode } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type OnChangeFn,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  type Table as TanStackTable,
} from "@tanstack/react-table";

import { Skeleton } from "@/components/ui/skeleton";
import { DataTablePagination } from "@/components/table/data-table-pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  getRowId?: (row: TData) => string;
  pageCount: number;
  pagination: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>;
  sorting: SortingState;
  onSortingChange: OnChangeFn<SortingState>;
  columnFilters: ColumnFiltersState;
  onColumnFiltersChange: OnChangeFn<ColumnFiltersState>;
  globalFilter: string;
  onGlobalFilterChange: OnChangeFn<string>;
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
  footerPagination?: boolean;
  totalRows?: number;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  useMobileLayout?: boolean;
  renderMobileView?: (table: TanStackTable<TData>) => ReactNode;
};

export function DataTable<TData, TValue>({
  columns,
  data,
  getRowId,
  pageCount,
  pagination,
  onPaginationChange,
  sorting,
  onSortingChange,
  columnFilters,
  onColumnFiltersChange,
  globalFilter,
  onGlobalFilterChange,
  isLoading,
  emptyMessage = "No results.",
  className,
  footerPagination,
  totalRows,
  rowSelection,
  onRowSelectionChange,
  useMobileLayout,
  renderMobileView,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getRowId,
    pageCount,
    state: {
      pagination,
      sorting,
      columnFilters,
      globalFilter,
      ...(rowSelection !== undefined ? { rowSelection } : {}),
    },
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    onPaginationChange,
    onSortingChange,
    onColumnFiltersChange,
    onGlobalFilterChange,
    ...(rowSelection !== undefined && onRowSelectionChange
      ? {
          enableRowSelection: true,
          onRowSelectionChange,
        }
      : {}),
    getCoreRowModel: getCoreRowModel(),
  });

  const leafCount = table.getVisibleLeafColumns().length || columns.length;

  const tableShell = (
    <div
      className={cn(
        "min-w-0 overflow-x-auto rounded-xl border border-border bg-card",
        className,
      )}
    >
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="whitespace-nowrap">
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: pagination.pageSize }).map((_, i) => (
              <TableRow key={`sk-${i}`}>
                {Array.from({ length: leafCount }).map((__, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-4 w-full max-w-[12rem]" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() ? "selected" : undefined}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={leafCount} className="h-24 text-center">
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );

  const content =
    useMobileLayout && renderMobileView
      ? renderMobileView(table)
      : tableShell;

  if (!footerPagination) {
    return content;
  }

  return (
    <div className="flex flex-col gap-4">
      {content}
      <DataTablePagination table={table} totalRows={totalRows} />
    </div>
  );
}
