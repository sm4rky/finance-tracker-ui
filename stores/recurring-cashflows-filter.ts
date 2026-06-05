import type { RecurringCashflowsFilterState } from "@/lib/recurring-cashflow-filter";
import { create } from "zustand";
import {
  createJSONStorage,
  persist,
  type StateStorage,
} from "zustand/middleware";

const noopSessionStorageFallback: StateStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

type RecurringCashflowsFilterStoreState = {
  appliedFilter: RecurringCashflowsFilterState | null;
  setAppliedFilter: (filterState: RecurringCashflowsFilterState) => void;
  clearAppliedFilter: () => void;
};

export const useRecurringCashflowsFilterStore =
  create<RecurringCashflowsFilterStoreState>()(
    persist(
      (set) => ({
        appliedFilter: null,
        setAppliedFilter: (filterState) => {
          set({ appliedFilter: filterState });
        },
        clearAppliedFilter: () => {
          set({ appliedFilter: null });
        },
      }),
      {
        name: "money-insight-recurring-cashflows-filter",
        storage: createJSONStorage(() =>
          typeof window === "undefined"
            ? noopSessionStorageFallback
            : sessionStorage,
        ),
      },
    ),
  );
