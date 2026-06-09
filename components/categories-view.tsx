"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Tags } from "lucide-react";

import { CategorySetSelector } from "@/components/category-set-selector";
import { CategorySetEditor } from "@/components/category-set-editor";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
    useState<ProfileCustomCategorySetResponse | null>(() => {
      if (typeof window === "undefined") return null;
      const searchParams = new URLSearchParams(window.location.search);
      return searchParams.get("newCategorySet") === "1"
        ? DEFAULT_CATEGORY_SET
        : null;
    });

  const {
    data = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: ["profile-custom-category-sets"],
    queryFn: listProfileCustomCategorySets,
  });

  const activeCategorySet = useMemo(() => {
    if (selectedCategorySet?.id === "") {
      return selectedCategorySet;
    }

    if (selectedCategorySet?.id) {
      return (
        data.find((categorySet) => categorySet.id === selectedCategorySet.id) ??
        data[0] ??
        null
      );
    }

    return data[0] ?? null;
  }, [data, selectedCategorySet]);

  const handleAddCategorySet = useCallback(() => {
    setSelectedCategorySet(DEFAULT_CATEGORY_SET);
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get("newCategorySet") !== "1") return;

    searchParams.delete("newCategorySet");
    const query = searchParams.toString();
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${query ? `?${query}` : ""}`,
    );
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
      const nextCategorySet = data.find(
        (categorySet) => categorySet.id !== deletedCategorySetId,
      );
      setSelectedCategorySet(nextCategorySet ?? null);
    },
    [data],
  );

  return (
    <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col gap-6 p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Categories</h1>
          <p className="text-sm text-muted-foreground">
            Create and manage category sets for transaction organization.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <CategorySetSelector
            categorySets={data}
            selectedCategorySet={activeCategorySet}
            isLoading={isPending}
            onAddCategorySet={handleAddCategorySet}
            onSelectCategorySet={handleSelectCategorySet}
          />
        </div>
      </div>

      <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col gap-3">
        {isPending && activeCategorySet === null ? (
          <Skeleton className="min-h-0 w-full flex-1 rounded-xl" />
        ) : isError ? (
          <p className="text-sm text-destructive">
            Could not load category sets.
          </p>
        ) : activeCategorySet === null ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
              <Tags className="size-10 text-muted-foreground" aria-hidden />
              <div>
                <div className="font-medium">No category sets yet</div>
                <p className="text-sm text-muted-foreground">
                  Create your first category set to organize transactions.
                </p>
              </div>
              <Button variant="outline" onClick={handleAddCategorySet}>
                <Plus className="size-4 shrink-0" aria-hidden />
                Add Category Set
              </Button>
            </CardContent>
          </Card>
        ) : (
          <CategorySetEditor
            key={activeCategorySet.id || "new-category-set"}
            selectedCategorySet={activeCategorySet}
            onSaveCategorySet={handleSaveCategorySet}
            onDeleteCategorySet={handleDeleteCategorySet}
          />
        )}
      </div>
    </div>
  );
}
