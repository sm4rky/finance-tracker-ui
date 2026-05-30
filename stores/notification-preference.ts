import { create } from "zustand";

import type { ProfileNotificationPreferenceResponse } from "@/interface/notification-preferences";

type NotificationPreferenceState = {
  preferences: ProfileNotificationPreferenceResponse | null;
  setPreferences: (
    preferences: ProfileNotificationPreferenceResponse | null,
  ) => void;
  updatePreferences: (
    preferences: ProfileNotificationPreferenceResponse,
  ) => void;
  clearPreferences: () => void;
};

export const useNotificationPreferenceStore =
  create<NotificationPreferenceState>((set) => ({
    preferences: null,
    setPreferences: (preferences) => set({ preferences }),
    updatePreferences: (preferences) => set({ preferences }),
    clearPreferences: () => set({ preferences: null }),
  }));
