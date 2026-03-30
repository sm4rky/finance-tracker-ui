import { sanitizeTransactionsFilter } from "@/components/transactions-filter";
import type { LinkedBankResponse } from "@/interface/plaid";
import type { TransactionsFilterState } from "@/interface/transaction";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type TransactionsFilterStoreState = {
  appliedFilter: TransactionsFilterState | null;
  setAppliedFilter: (
    filterState: TransactionsFilterState,
    linkedBanks: LinkedBankResponse[] | undefined,
  ) => void;
  clearAppliedFilter: () => void;
};

export const useTransactionsFilterStore = create<TransactionsFilterStoreState>()(
  persist(
    (set) => ({
      appliedFilter: null,
      setAppliedFilter: (filterState, linkedBanks) => {
        set({
          appliedFilter: sanitizeTransactionsFilter(filterState, linkedBanks),
        });
      },
      clearAppliedFilter: () => {
        set({ appliedFilter: null });
      },
    }),
    {
      name: "money-insight-transactions-filter",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);