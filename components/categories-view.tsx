"use client";

import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { CategorySetSelector } from "@/components/category-set-selector";
import { CategorySetEditor } from "@/components/category-set-editor";
import type { ProfileCustomCategorySetResponse } from "@/interface/profile-custom-category";
import { listProfileCustomCategorySets } from "@/lib/api/profile-custom-category";

const DEFAULT_CATEGORY_SET: ProfileCustomCategorySetResponse = {
  id: "",
  name: "My Categories",
  createdAt: "",
  updatedAt: "",
  categories: [],
};

export function CategoriesView() {
  const [selectedCategorySet, setSelectedCategorySet] =
    useState<ProfileCustomCategorySetResponse | null>(null);

  const { data: categorySets = [], isLoading } = useQuery({
    queryKey: ["profile-custom-category-sets"],
    queryFn: listProfileCustomCategorySets,
  });

  const activeCategorySet = useMemo(() => {
    if (selectedCategorySet?.id === "") {
      return selectedCategorySet;
    }

    if (selectedCategorySet?.id) {
      return (
        categorySets.find(
          (categorySet) => categorySet.id === selectedCategorySet.id,
        ) ??
        categorySets[0] ??
        null
      );
    }

    return categorySets[0] ?? null;
  }, [categorySets, selectedCategorySet]);

  const handleAddCategorySet = useCallback(() => {
    setSelectedCategorySet(DEFAULT_CATEGORY_SET);
  }, []);

  const handleSelectCategorySet = useCallback(
    (categorySet: ProfileCustomCategorySetResponse) => {
      setSelectedCategorySet(categorySet);
    },
    [],
  );

  const handleSaveCategorySet = useCallback(
    (categorySet: ProfileCustomCategorySetResponse) => {
      setSelectedCategorySet(categorySet);
    },
    [],
  );

  const handleDeleteCategorySet = useCallback(
    (deletedCategorySetId: string) => {
      const nextCategorySet = categorySets.find(
        (categorySet) => categorySet.id !== deletedCategorySetId,
      );
      setSelectedCategorySet(nextCategorySet ?? null);
    },
    [categorySets],
  );

  return (
    <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col gap-4 p-6 md:p-8">
      <div className="flex flex-wrap items-center gap-2">
        <CategorySetSelector
          categorySets={categorySets}
          selectedCategorySet={activeCategorySet}
          isLoading={isLoading}
          onAddCategorySet={handleAddCategorySet}
          onSelectCategorySet={handleSelectCategorySet}
        />
      </div>

      {activeCategorySet !== null ? (
        <CategorySetEditor
          key={activeCategorySet.id || "new-category-set"}
          selectedCategorySet={activeCategorySet}
          onSaveCategorySet={handleSaveCategorySet}
          onDeleteCategorySet={handleDeleteCategorySet}
        />
      ) : isLoading ? null : (
        <p className="text-sm text-muted-foreground">
          No category sets yet. Use Add Category Set to create one.
        </p>
      )}
    </div>
  );
}
