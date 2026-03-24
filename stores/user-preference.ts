import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ColorMode = "light" | "dark";

type UserPreferenceState = {
  theme: ColorMode;
  setThemeColorMode: (mode: ColorMode) => void;
  toggleThemeColorMode: () => void;
};

export const useUserPreferenceStore = create<UserPreferenceState>()(
  persist(
    (set, get) => ({
      theme: "light",
      setThemeColorMode: (theme) => set({ theme }),
      toggleThemeColorMode: () =>
        set({
          theme: get().theme === "dark" ? "light" : "dark",
        }),
    }),
    {
      name: "money-insight-user-preference",
      partialize: (state) => ({ theme: state.theme }),
    },
  ),
);
