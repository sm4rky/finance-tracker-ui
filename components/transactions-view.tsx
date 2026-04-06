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
import { Button } from "@/components/ui/button";
import type { LinkedBankResponse } from "@/interface/plaid";
import type {
  QueryTransactionsRequest,
  TransactionResponse,
  TransactionSortField,
  TransactionsFilterState,
} from "@/interface/transaction";
import { listPlaidConnections } from "@/lib/api/plaid";
import { queryTransactions } from "@/lib/api/transactions";
import { useTransactionsFilterStore } from "@/stores/transactions-filter";

/** Backend accepts at most 100 ids per request after deduplication. */
const MAX_DELETE_BATCH = 100;

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

  const storedAppliedFilter = useTransactionsFilterStore(
    (state) => state.appliedFilter,
  );
  const setAppliedFilter = useTransactionsFilterStore(
    (state) => state.setAppliedFilter,
  );

  const plaidConnectionsQuery = useQuery({
    queryKey: ["list-plaid-connections"],
    queryFn: listPlaidConnections,
  });

  const allBanks = plaidConnectionsQuery.data ?? [];

  const activeBanks = useMemo(
    () => allBanks.filter((bank) => bank.status === "active" || bank.status === "relink_required"),
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

  const handleApplyFilter = useCallback(
    (nextFilter: TransactionsFilterState) => {
      setAppliedFilter(nextFilter, activeBanks);
    },
    [setAppliedFilter, activeBanks],
  );

  const { triggerProps, panelsProps } = useTransactionsFilter({
    banks: activeBanks,
    applied: appliedFilter,
    onApply: handleApplyFilter,
  });

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

  const page = pagination.pageIndex + 1;
  const limit = pagination.pageSize;
  const sortKey = sorting[0]
    ? `${sorting[0].id}:${sorting[0].desc ? "desc" : "asc"}`
    : "default";
  const filterKey = JSON.stringify(appliedFilter);

  useEffect(() => {
    setPagination((previous) => {
      if (previous.pageIndex === 0) return previous;
      return { ...previous, pageIndex: 0 };
    });
  }, [filterKey]);

  useEffect(() => {
    setRowSelection({});
  }, [page, limit, sortKey, filterKey]);

  const openCreateTransaction = useCallback(() => {
    setSaveSheetMode("create");
    setEditingTransaction(null);
    setSaveSheetOpen(true);
  }, []);

  const openEditTransaction = useCallback((row: TransactionResponse) => {
    setSaveSheetMode("edit");
    setEditingTransaction(row);
    setSaveSheetOpen(true);
  }, []);

  const openDeleteDialogForIds = useCallback((ids: string[]) => {
    const nextIds = [...new Set(ids)].filter(Boolean).slice(0, MAX_DELETE_BATCH);
    if (nextIds.length === 0) return;
    setDeleteTransactionIds(nextIds);
    setDeleteDialogOpen(true);
  }, []);

  const openBulkDeleteDialog = useCallback(() => {
    openDeleteDialogForIds(
      Object.entries(rowSelection)
        .filter(([, selected]) => selected)
        .map(([id]) => id),
    );
  }, [rowSelection, openDeleteDialogForIds]);

  const openSingleDeleteDialog = useCallback(
    (row: TransactionResponse) => {
      openDeleteDialogForIds([row.id]);
    },
    [openDeleteDialogForIds],
  );

  const accountLabelById = useMemo(() => {
    const labels = new Map<string, string>();

    for (const bank of allBanks) {
      for (const account of bank.accounts) {
        const baseLabel =
          account.officialName?.trim() ||
          account.accountName.trim() ||
          "Account";

        labels.set(
          account.id,
          account.mask ? `${baseLabel} ·•••${account.mask}` : baseLabel,
        );
      }
    }

    return labels;
  }, [allBanks]);

  const columns = useMemo(
    () =>
      createTransactionColumns(accountLabelById, {
        onEdit: openEditTransaction,
        onDelete: openSingleDeleteDialog,
      }),
    [accountLabelById, openEditTransaction, openSingleDeleteDialog],
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
          />
          <TransactionsFilterTrigger {...triggerProps} />
          <TransactionsSyncMenu banks={allBanks} />
          <Button
            type="button"
            variant="outline"
            className="gap-1.5"
            onClick={openCreateTransaction}
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
            onClick={openBulkDeleteDialog}
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
          onPaginationChange={setPagination}
          sorting={sorting}
          onSortingChange={(updater) => {
            setSorting((previous) => applyTableUpdater(updater, previous));
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