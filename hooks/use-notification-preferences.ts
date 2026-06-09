"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { getMyNotificationPreferences } from "@/lib/api/notification-preferences";
import { useNotificationPreferenceStore } from "@/stores/notification-preference";

export function useNotificationPreferences() {
  const storedPreferences = useNotificationPreferenceStore(
    (state) => state.preferences,
  );
  const setPreferences = useNotificationPreferenceStore(
    (state) => state.setPreferences,
  );
  const updatePreferences = useNotificationPreferenceStore(
    (state) => state.updatePreferences,
  );

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["notification-preferences", "me"],
    queryFn: getMyNotificationPreferences,
  });

  useEffect(() => {
    if (data) {
      setPreferences(data);
    }
  }, [data, setPreferences]);

  useEffect(() => {
    if (isError) {
      setPreferences(null);
    }
  }, [isError, setPreferences]);

  return {
    preferences: data ?? storedPreferences,
    isPending,
    isError,
    error,
    updatePreferences,
  };
}
