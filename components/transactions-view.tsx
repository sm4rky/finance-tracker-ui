"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type {
  ColumnFiltersState,
  PaginationState,
  RowSelectionState,
  SortingState,
  Updater,
} from "@tanstack/react-table";

import { createTransactionColumns } from "@/components/transactions-columns";
import {
  getDefaultTransactionsFilter,
  sanitizeTransactionsFilter,
  TransactionsFilter,
} from "@/components/transactions-filter";
import { DataTable } from "@/components/table";
import { Button } from "@/components/ui/button";
import type {
  QueryTransactionsRequest,
  TransactionSortField,
  TransactionsFilterState,
} from "@/interface/transaction";
import { listPlaidConnections } from "@/lib/api/plaid";
import { queryTransactions } from "@/lib/api/transactions";
import { useTransactionsFilterStore } from "@/stores/transactions-filter";

const TRANSACTION_SORT_COLUMN_TO_API: Record<string, TransactionSortField> = {
  merchant: "merchantName",
  account: "linkedBankAccountId",
  category: "pfcPrimary",
  detailCategory: "pfcDetailed",
  date: "date",
  amount: "amount",
  paymentChannel: "paymentChannel",
  pending: "pending",
};

function getApiSortParams(
  sorting: SortingState,
): Pick<QueryTransactionsRequest, "sortBy" | "sortDirection"> {
  const firstSort = sorting[0];
  if (!firstSort) return {};

  const sortBy = TRANSACTION_SORT_COLUMN_TO_API[firstSort.id];
  if (!sortBy) return {};

  return {
    sortBy,
    sortDirection: firstSort.desc ? "desc" : "asc",
  };
}

function resolveUpdater<T>(updater: Updater<T>, previousValue: T): T {
  return typeof updater === "function"
    ? (updater as (old: T) => T)(previousValue)
    : updater;
}

export function TransactionsView() {
  const [isFilterStoreHydrated, setIsFilterStoreHydrated] = useState(false);

  useEffect(() => {
    const store = useTransactionsFilterStore;

    if (store.persist.hasHydrated()) {
      setIsFilterStoreHydrated(true);
      return;
    }

    const unsubscribe = store.persist.onFinishHydration(() => {
      setIsFilterStoreHydrated(true);
    });

    return unsubscribe;
  }, []);

  const plaidConnectionsQuery = useQuery({
    queryKey: ["list-plaid-connections"],
    queryFn: listPlaidConnections,
  });

  const allBanks = plaidConnectionsQuery.data ?? [];

  const activeBanks = useMemo(
    () => allBanks.filter((bank) => bank.status === "active"),
    [allBanks],
  );

  const storedAppliedFilter = useTransactionsFilterStore(
    (state) => state.appliedFilter,
  );
  const setAppliedFilter = useTransactionsFilterStore(
    (state) => state.setAppliedFilter,
  );

  const appliedFilter = useMemo<TransactionsFilterState>(() => {
    if (!isFilterStoreHydrated) {
      return getDefaultTransactionsFilter(undefined);
    }

    return sanitizeTransactionsFilter(
      storedAppliedFilter ?? getDefaultTransactionsFilter(activeBanks),
      activeBanks,
    );
  }, [isFilterStoreHydrated, storedAppliedFilter, activeBanks]);

  const handleApplyFilter = useCallback(
    (draftFilter: TransactionsFilterState) => {
      setAppliedFilter(draftFilter, activeBanks);
    },
    [setAppliedFilter, activeBanks],
  );

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const currentPage = pagination.pageIndex + 1;
  const pageSize = pagination.pageSize;

  const sortKey = sorting[0]
    ? `${sorting[0].id}:${sorting[0].desc ? "desc" : "asc"}`
    : "default";

  const appliedFilterKey = JSON.stringify(appliedFilter);

  useEffect(() => {
    setRowSelection({});
  }, [currentPage, pageSize, sortKey, appliedFilterKey]);

  useEffect(() => {
    setPagination((previous) => ({ ...previous, pageIndex: 0 }));
  }, [appliedFilterKey]);

  const selectedRowCount = useMemo(
    () => Object.values(rowSelection).filter(Boolean).length,
    [rowSelection],
  );

  const accountLabelById = useMemo(() => {
    const map = new Map<string, string>();

    for (const bank of allBanks) {
      for (const account of bank.accounts) {
        const baseLabel =
          account.officialName?.trim() ||
          account.accountName.trim() ||
          "Account";

        const label = account.mask
          ? `${baseLabel} ·•••${account.mask}`
          : baseLabel;

        map.set(account.id, label);
      }
    }

    return map;
  }, [allBanks]);

  const columns = useMemo(
    () => createTransactionColumns(accountLabelById),
    [accountLabelById],
  );

  const transactionsQuery = useQuery({
    queryKey: [
      "query-transaction-list",
      currentPage,
      pageSize,
      sortKey,
      appliedFilterKey,
    ],
    queryFn: () =>
      queryTransactions({
        page: currentPage,
        limit: pageSize,
        ...getApiSortParams(sorting),
        ...appliedFilter,
      }),
    enabled: isFilterStoreHydrated,
  });

  const pagedResponse = transactionsQuery.data;
  const transactions = pagedResponse?.items ?? [];
  const totalRows = pagedResponse?.totalCount;
  const pageCount = Math.max(1, pagedResponse?.totalPages ?? 1);

  return (
    <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col gap-6 p-6 md:p-8">
      <TransactionsFilter
        banks={activeBanks}
        applied={appliedFilter}
        onApply={handleApplyFilter}
      />

      <div className="flex min-h-0 flex-1 flex-col gap-3">
        <div className="flex min-h-9 flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {selectedRowCount === 0
              ? "No transactions selected"
              : `${selectedRowCount} transaction${selectedRowCount === 1 ? "" : "s"} selected`}
          </p>

          <Button
            type="button"
            variant="destructive"
            size="sm"
            disabled={selectedRowCount === 0}
            onClick={() => {}}
          >
            Delete
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={transactions}
          getRowId={(row) => row.id}
          pageCount={pageCount}
          pagination={pagination}
          onPaginationChange={setPagination}
          sorting={sorting}
          onSortingChange={(updater) => {
            setSorting((previous) => resolveUpdater(updater, previous));
            setPagination((previous) => ({ ...previous, pageIndex: 0 }));
          }}
          columnFilters={columnFilters}
          onColumnFiltersChange={setColumnFilters}
          globalFilter={globalFilter}
          onGlobalFilterChange={setGlobalFilter}
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
          isLoading={!isFilterStoreHydrated || transactionsQuery.isPending}
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