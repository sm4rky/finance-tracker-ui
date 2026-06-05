import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { ProfileCustomCategorySetResponse } from "@/interface/profile-custom-category";

export type ColorMode = "light" | "dark";

type UserPreferenceState = {
  theme: ColorMode;
  selectedCategorySet: ProfileCustomCategorySetResponse | null;
  setThemeColorMode: (mode: ColorMode) => void;
  setSelectedCategorySet: (
    categorySet: ProfileCustomCategorySetResponse | null,
  ) => void;
  toggleThemeColorMode: () => void;
};

export const useUserPreferenceStore = create<UserPreferenceState>()(
  persist(
    (set, get) => ({
      theme: "light",
      selectedCategorySet: null,
      setThemeColorMode: (theme) => set({ theme }),
      setSelectedCategorySet: (selectedCategorySet) =>
        set({ selectedCategorySet }),
      toggleThemeColorMode: () =>
        set({
          theme: get().theme === "dark" ? "light" : "dark",
        }),
    }),
    {
      name: "money-insight-user-preference",
      partialize: (state) => ({
        selectedCategorySet: state.selectedCategorySet,
        theme: state.theme,
      }),
    },
  ),
);
