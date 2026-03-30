"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type {
  ColumnFiltersState,
  PaginationState,
  RowSelectionState,
  SortingState,
  Updater,
} from "@tanstack/react-table";
import { DataTable } from "@/components/table";
import { createTransactionColumns } from "@/components/transactions-columns";
import { Button } from "@/components/ui/button";
import { listPlaidConnections } from "@/lib/api/plaid";
import { transactionSortFromTableState } from "@/interface/transaction";
import { queryTransactions } from "@/lib/api/transactions";

function applyUpdater<T>(updater: Updater<T>, prev: T): T {
  if (typeof updater === "function") {
    return (updater as (old: T) => T)(prev);
  }
  return updater;
}

export function TransactionsView() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const page = pagination.pageIndex + 1;
  const limit = pagination.pageSize;

  const sortKey = sorting[0]
    ? `${sorting[0].id}:${sorting[0].desc ? "desc" : "asc"}`
    : "default";

  useEffect(() => {
    setRowSelection({});
  }, [page, limit, sortKey]);

  const selectedCount = useMemo(
    () => Object.values(rowSelection).filter(Boolean).length,
    [rowSelection],
  );

  const connectionsQuery = useQuery({
    queryKey: ["list-plaid-connections"],
    queryFn: listPlaidConnections,
  });

  const accountLabelMap = useMemo(() => {
    const map = new Map<string, string>();

    for (const bank of connectionsQuery.data ?? []) {
      for (const account of bank.accounts) {
        const baseLabel =
          account.officialName?.trim() || account.accountName.trim() || "Account";
        const label = account.mask
          ? `${baseLabel} ·•••${account.mask}`
          : baseLabel;

        map.set(account.id, label);
      }
    }

    return map;
  }, [connectionsQuery.data]);

  const columns = useMemo(
    () => createTransactionColumns(accountLabelMap),
    [accountLabelMap],
  );

  const transactionsQuery = useQuery({
    queryKey: ["query-transaction-list", page, limit, sortKey],
    queryFn: () =>
      queryTransactions({
        page,
        limit,
        ...transactionSortFromTableState(sorting),
      }),
  });

  const paged = transactionsQuery.data;
  const items = paged?.items ?? [];
  const pageCount = Math.max(1, paged?.totalPages ?? 1);
  const totalRows = paged?.totalCount;

  return (
    <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col gap-6 p-6 md:p-8">
      <div className="flex min-w-0 flex-col gap-2">
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
          Transactions
        </h1>
        <p className="text-sm text-muted-foreground">
          Transactions from your linked accounts, with server-side pagination.
        </p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3">
        <div className="flex min-h-9 flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {selectedCount === 0
              ? "No transactions selected"
              : `${selectedCount} transaction${selectedCount === 1 ? "" : "s"} selected`}
          </p>

          <Button
            type="button"
            variant="destructive"
            size="sm"
            disabled={selectedCount === 0}
            onClick={() => { }}
          >
            Delete
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={items}
          getRowId={(row) => row.id}
          pageCount={pageCount}
          pagination={pagination}
          onPaginationChange={setPagination}
          sorting={sorting}
          onSortingChange={(updater) => {
            setSorting((prev) => applyUpdater(updater, prev));
            setPagination((prev) => ({ ...prev, pageIndex: 0 }));
          }}
          columnFilters={columnFilters}
          onColumnFiltersChange={setColumnFilters}
          globalFilter={globalFilter}
          onGlobalFilterChange={setGlobalFilter}
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
          isLoading={transactionsQuery.isPending}
          emptyMessage={
            transactionsQuery.isError
              ? "Could not load transactions."
              : "No transactions yet."
          }
          footerPagination
          totalRows={totalRows}
        />
      </div>
    </div>
  );
}