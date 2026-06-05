"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useSelectedCategorySet } from "@/hooks/use-selected-category-set";
import { useLinkedBanks } from "@/hooks/use-linked-banks";
import {
  areTransactionsFiltersEqual,
  getDefaultTransactionsFilter,
  sanitizeTransactionsFilter,
  type TransactionsFilterState,
} from "@/lib/transaction-filter";
import { useTransactionsFilterStore } from "@/stores/transactions-filter";

export function useAppliedTransactionsFilter() {
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
  const setStoredAppliedFilter = useTransactionsFilterStore(
    (state) => state.setAppliedFilter,
  );

  const { selectedCategorySet } = useSelectedCategorySet();

  const { banks } = useLinkedBanks();

  useEffect(() => {
    if (!isFilterStoreHydrated) {
      return;
    }

    const appliedFilter = storedAppliedFilter ?? getDefaultTransactionsFilter(banks, selectedCategorySet);

    const sanitized = sanitizeTransactionsFilter(appliedFilter, banks, selectedCategorySet);

    if (
      storedAppliedFilter &&
      !areTransactionsFiltersEqual(sanitized, storedAppliedFilter)
    ) {
      setStoredAppliedFilter(sanitized);
    }

  }, [
    banks,
    isFilterStoreHydrated,
    selectedCategorySet,
    setStoredAppliedFilter,
    storedAppliedFilter,
  ]);

  const appliedFilter = useMemo(() => {
    if (!isFilterStoreHydrated) {
      return getDefaultTransactionsFilter(undefined, selectedCategorySet);
    }

    return sanitizeTransactionsFilter(
      storedAppliedFilter ??
      getDefaultTransactionsFilter(banks, selectedCategorySet),
      banks,
      selectedCategorySet,
    );
  }, [
    banks,
    isFilterStoreHydrated,
    selectedCategorySet,
    storedAppliedFilter,
  ]);

  const filterKey = useMemo(() => JSON.stringify(appliedFilter), [appliedFilter]);

  const setAppliedFilter = useCallback(
    (filterState: TransactionsFilterState) => {
      setStoredAppliedFilter(
        sanitizeTransactionsFilter(
          filterState,
          banks,
          selectedCategorySet,
        ),
      );
    },
    [banks, selectedCategorySet, setStoredAppliedFilter],
  );

  return {
    banks,
    appliedFilter,
    filterKey,
    isFilterStoreHydrated,
    setAppliedFilter,
  };
}
