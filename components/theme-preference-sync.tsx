"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";

import { useUserPreferenceStore } from "@/stores/user-preference";

/** Applies persisted user theme preference to `next-themes` on the client. */
export function ThemePreferenceSync() {
  const { setTheme } = useTheme();
  const colorMode = useUserPreferenceStore((s) => s.theme);

  useEffect(() => {
    return useUserPreferenceStore.persist.onFinishHydration(() => {
      setTheme(useUserPreferenceStore.getState().theme);
    });
  }, [setTheme]);

  useEffect(() => {
    setTheme(colorMode);
  }, [colorMode, setTheme]);

  return null;
}
