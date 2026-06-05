"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useLinkedBanks } from "@/hooks/use-linked-banks";
import { useSelectedCategorySet } from "@/hooks/use-selected-category-set";
import {
  areRecurringCashflowsFiltersEqual,
  getDefaultRecurringCashflowsFilter,
  sanitizeRecurringCashflowsFilter,
  type RecurringCashflowsFilterState,
} from "@/lib/recurring-cashflow-filter";
import { useRecurringCashflowsFilterStore } from "@/stores/recurring-cashflows-filter";

export function useAppliedRecurringCashflowsFilter() {
  const [isFilterStoreHydrated, setIsFilterStoreHydrated] = useState(() => {
    const persistApi = useRecurringCashflowsFilterStore.persist;
    return !persistApi || persistApi.hasHydrated();
  });

  useEffect(() => {
    const persistApi = useRecurringCashflowsFilterStore.persist;
    if (!persistApi || persistApi.hasHydrated()) {
      return;
    }

    return persistApi.onFinishHydration(() => {
      setIsFilterStoreHydrated(true);
    });
  }, []);

  const storedAppliedFilter = useRecurringCashflowsFilterStore(
    (state) => state.appliedFilter,
  );
  const setStoredAppliedFilter = useRecurringCashflowsFilterStore(
    (state) => state.setAppliedFilter,
  );
  const { selectedCategorySet } = useSelectedCategorySet();
  const { banks } = useLinkedBanks();

  useEffect(() => {
    if (!isFilterStoreHydrated) {
      return;
    }

    const base =
      storedAppliedFilter ??
      getDefaultRecurringCashflowsFilter(banks, selectedCategorySet);
    const sanitized = sanitizeRecurringCashflowsFilter(
      base,
      banks,
      selectedCategorySet,
    );

    if (
      storedAppliedFilter &&
      !areRecurringCashflowsFiltersEqual(sanitized, storedAppliedFilter)
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
      return getDefaultRecurringCashflowsFilter(undefined, selectedCategorySet);
    }

    return sanitizeRecurringCashflowsFilter(
      storedAppliedFilter ??
        getDefaultRecurringCashflowsFilter(banks, selectedCategorySet),
      banks,
      selectedCategorySet,
    );
  }, [
    banks,
    isFilterStoreHydrated,
    selectedCategorySet,
    storedAppliedFilter,
  ]);

  const setAppliedFilter = useCallback(
    (filterState: RecurringCashflowsFilterState) => {
      setStoredAppliedFilter(
        sanitizeRecurringCashflowsFilter(
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
    isFilterStoreHydrated,
    selectedCategorySet,
    setAppliedFilter,
  };
}
