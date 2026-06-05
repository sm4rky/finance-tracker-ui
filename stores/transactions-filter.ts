import type { TransactionsFilterState } from "@/lib/transaction-filter";
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

type TransactionsFilterStoreState = {
  appliedFilter: TransactionsFilterState | null;
  setAppliedFilter: (filterState: TransactionsFilterState) => void;
  clearAppliedFilter: () => void;
};

export const useTransactionsFilterStore = create<TransactionsFilterStoreState>()(
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
      name: "money-insight-transactions-filter",
      storage: createJSONStorage(() =>
        typeof window === "undefined"
          ? noopSessionStorageFallback
          : sessionStorage,
      ),
    },
  ),
);