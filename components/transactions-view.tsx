"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import type {
  ColumnFiltersState,
  PaginationState,
  RowSelectionState,
  SortingState,
  Updater,
} from "@tanstack/react-table";

import { createTransactionColumns } from "@/components/transactions-columns";
import { TransactionsDateFilter } from "@/components/transactions-date-filter";
import {
  getDefaultTransactionsFilter,
  sanitizeTransactionsFilter,
  TransactionsFilterPanels,
  TransactionsFilterTrigger,
  useTransactionsFilter,
} from "@/components/transactions-filter";
import { DeleteTransactionsDialog } from "@/components/delete-transactions-dialog";
import { SaveTransactionSheet } from "@/components/save-transaction-sheet";
import { TransactionsSyncMenu } from "@/components/transactions-sync-menu";
import { DataTable } from "@/components/table";
import { TransactionsMobileList } from "@/components/transactions-mobile-list";
import { Button } from "@/components/ui/button";
import type {
  QueryTransactionsRequest,
  TransactionResponse,
  TransactionSortField,
} from "@/interface/transaction";
import { listPlaidConnections } from "@/lib/api/plaid";
import { queryTransactions } from "@/lib/api/transaction";
import type { TransactionsFilterState } from "@/lib/transaction-filter";
import { useIsMobile } from "@/hooks/use-mobile";
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

function applyTableUpdater<T>(updater: Updater<T>, previous: T): T {
  return typeof updater === "function"
    ? (updater as (old: T) => T)(previous)
    : updater;
}

export function TransactionsView() {
  const isMobile = useIsMobile();
  const [isFilterStoreHydrated, setIsFilterStoreHydrated] = useState(() => {
    const persistApi = useTransactionsFilterStore.persist;
    return !persistApi || persistApi.hasHydrated();
  });

  useEffect(() => {
    const persistApi = useTransactionsFilterStore.persist;
    if (!persistApi || persistApi.hasHydrated()) {
      return;
    }

    return persistApi.onFinishHydration(() => {
      setIsFilterStoreHydrated(true);
    });
  }, []);

  const storedAppliedFilter = useTransactionsFilterStore(
    (state) => state.appliedFilter,
  );
  const setAppliedFilter = useTransactionsFilterStore(
    (state) => state.setAppliedFilter,
  );

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [saveSheetOpen, setSaveSheetOpen] = useState(false);
  const [saveSheetMode, setSaveSheetMode] = useState<"create" | "edit">(
    "create",
  );
  const [editingTransaction, setEditingTransaction] =
    useState<TransactionResponse | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTransactionIds, setDeleteTransactionIds] = useState<string[]>(
    [],
  );

  const { data: plaidConnections } = useQuery({
    queryKey: ["list-plaid-connections"],
    queryFn: listPlaidConnections,
  });

  const allBanks = useMemo(() => plaidConnections ?? [], [plaidConnections]);

  const activeBanks = useMemo(
    () =>
      allBanks.filter(
        (bank) => bank.status === "active" || bank.status === "relink_required",
      ),
    [allBanks],
  );

  const appliedFilter = useMemo(() => {
    if (!isFilterStoreHydrated) {
      return getDefaultTransactionsFilter(undefined);
    }

    return sanitizeTransactionsFilter(
      storedAppliedFilter ?? getDefaultTransactionsFilter(activeBanks),
      activeBanks,
    );
  }, [isFilterStoreHydrated, storedAppliedFilter, activeBanks]);

  const resetPaginationAndSelection = useCallback(() => {
    setPagination((previous) => {
      if (previous.pageIndex === 0) return previous;
      return { ...previous, pageIndex: 0 };
    });
    setRowSelection({});
  }, []);

  const handlePaginationChange = useCallback(
    (updater: Updater<PaginationState>) => {
      setPagination((previous) => applyTableUpdater(updater, previous));
      setRowSelection({});
    },
    [],
  );

  const handleSortingChange = useCallback(
    (updater: Updater<SortingState>) => {
      setSorting((previous) => applyTableUpdater(updater, previous));
      resetPaginationAndSelection();
    },
    [resetPaginationAndSelection],
  );

  const handleApplyFilter = useCallback(
    (filterState: TransactionsFilterState) => {
      setAppliedFilter(filterState, activeBanks);
      resetPaginationAndSelection();
    },
    [activeBanks, resetPaginationAndSelection, setAppliedFilter],
  );

  const { triggerProps, panelsProps } = useTransactionsFilter({
    banks: activeBanks,
    appliedFilter,
    onApplyFilter: handleApplyFilter,
  });

  const page = pagination.pageIndex + 1;
  const limit = pagination.pageSize;
  const sortKey = sorting[0]
    ? `${sorting[0].id}:${sorting[0].desc ? "desc" : "asc"}`
    : "default";
  const filterKey = JSON.stringify(appliedFilter);

  const openCreateTransactionSheet = useCallback(() => {
    setSaveSheetMode("create");
    setEditingTransaction(null);
    setSaveSheetOpen(true);
  }, []);

  const openEditTransactionSheet = useCallback((row: TransactionResponse) => {
    setSaveSheetMode("edit");
    setEditingTransaction(row);
    setSaveSheetOpen(true);
  }, []);

  const openDeleteMultipleTransactionsDialog = useCallback(() => {
    const selectedTransactionIds = Object.entries(rowSelection)
      .filter(([, selected]) => selected)
      .map(([id]) => id);

    if (selectedTransactionIds.length === 0) return;

    setDeleteTransactionIds(selectedTransactionIds);
    setDeleteDialogOpen(true);
  }, [rowSelection]);

  const openDeleteSingleTransactionDialog = useCallback(
    (row: TransactionResponse) => {
      setDeleteTransactionIds([row.id]);
      setDeleteDialogOpen(true);
    },
    [],
  );

  const columns = useMemo(
    () =>
      createTransactionColumns({
        onEdit: openEditTransactionSheet,
        onDelete: openDeleteSingleTransactionDialog,
      }),
    [openEditTransactionSheet, openDeleteSingleTransactionDialog],
  );

  const transactionsQuery = useQuery({
    queryKey: ["query-transaction-list", page, limit, sortKey, filterKey],
    queryFn: () =>
      queryTransactions({
        page,
        limit,
        ...getApiSortParams(sorting),
        ...appliedFilter,
      }),
    enabled: isFilterStoreHydrated,
  });

  const pagedResponse = transactionsQuery.data;
  const transactions = pagedResponse?.items ?? [];
  const totalRows = pagedResponse?.totalCount;
  const pageCount = Math.max(1, pagedResponse?.totalPages ?? 1);
  const selectedRowCount = Object.values(rowSelection).filter(Boolean).length;

  return (
    <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col gap-6 p-6 md:p-8">
      <div className="flex w-full flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <TransactionsDateFilter
            banks={activeBanks}
            isStoreReady={isFilterStoreHydrated}
            onFilterChange={resetPaginationAndSelection}
          />
          <TransactionsFilterTrigger {...triggerProps} />
          <TransactionsSyncMenu banks={allBanks} />
          <Button
            type="button"
            variant="outline"
            className="gap-1.5"
            onClick={openCreateTransactionSheet}
          >
            <Plus className="size-4 shrink-0" aria-hidden />
            Add transaction
          </Button>
        </div>
        <TransactionsFilterPanels {...panelsProps} />
      </div>

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
            className="gap-1.5"
            disabled={selectedRowCount === 0}
            onClick={openDeleteMultipleTransactionsDialog}
          >
            <Trash2 className="size-4 shrink-0" aria-hidden />
            Delete
          </Button>
        </div>

        <DeleteTransactionsDialog
          open={deleteDialogOpen}
          onOpenChange={(next) => {
            setDeleteDialogOpen(next);
            if (!next) setDeleteTransactionIds([]);
          }}
          transactionIds={deleteTransactionIds}
          onDeleted={() => setRowSelection({})}
        />

        <SaveTransactionSheet
          open={saveSheetOpen}
          onOpenChange={(next) => {
            setSaveSheetOpen(next);
            if (!next) setEditingTransaction(null);
          }}
          mode={saveSheetMode}
          transaction={editingTransaction}
          banks={activeBanks}
        />

        <DataTable
          columns={columns}
          data={transactions}
          getRowId={(row) => row.id}
          pageCount={pageCount}
          pagination={pagination}
          onPaginationChange={handlePaginationChange}
          sorting={sorting}
          onSortingChange={handleSortingChange}
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
          useMobileLayout={isMobile}
          renderMobileView={(table) => (
            <TransactionsMobileList
              table={table}
              data={transactions}
              isLoading={!isFilterStoreHydrated || transactionsQuery.isPending}
              emptyMessage={
                transactionsQuery.isError
                  ? "Could not load transactions."
                  : "No transactions yet."
              }
              onEdit={openEditTransactionSheet}
              onDelete={openDeleteSingleTransactionDialog}
            />
          )}
        />
      </div>
    </div>
  );
}
