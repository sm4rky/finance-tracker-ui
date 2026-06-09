"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import type { ProfileCustomCategorySetResponse } from "@/interface/profile-custom-category";
import { listProfileCustomCategorySets } from "@/lib/api/profile-custom-category";
import { useUserPreferenceStore } from "@/stores/user-preference";

export function useSelectedCategorySet() {
  const storedSelectedCategorySet = useUserPreferenceStore(
    (state) => state.selectedCategorySet,
  );
  const setSelectedCategorySet = useUserPreferenceStore(
    (state) => state.setSelectedCategorySet,
  );

  const {
    data = [],
    isLoading,
    isSuccess,
  } = useQuery<ProfileCustomCategorySetResponse[]>({
    queryKey: ["profile-custom-category-sets"],
    queryFn: listProfileCustomCategorySets,
  });

  const selectedCategorySet = useMemo(() => {
    if (!storedSelectedCategorySet) {
      return null;
    }

    if (!isSuccess) {
      return storedSelectedCategorySet;
    }

    return (
      data.find(
        (categorySet) => categorySet.id === storedSelectedCategorySet.id,
      ) ?? null
    );
  }, [data, isSuccess, storedSelectedCategorySet]);

  return {
    categorySets: data,
    isLoading,
    selectedCategorySet,
    setSelectedCategorySet,
  };
}
