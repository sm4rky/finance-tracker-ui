import { ChevronDown, Loader2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ProfileCustomCategorySetResponse } from "@/interface/profile-custom-category";

type CategorySetSelectorProps = {
  categorySets: ProfileCustomCategorySetResponse[];
  selectedCategorySet: ProfileCustomCategorySetResponse | null;
  isLoading: boolean;
  onAddCategorySet: () => void;
  onSelectCategorySet: (categorySet: ProfileCustomCategorySetResponse) => void;
};

export function CategorySetSelector({
  categorySets,
  selectedCategorySet,
  isLoading,
  onAddCategorySet,
  onSelectCategorySet,
}: CategorySetSelectorProps) {
  if (isLoading) {
    return (
      <Button type="button" variant="outline" className="gap-1.5" disabled>
        <Loader2 className="size-4 animate-spin" aria-hidden />
        Loading category sets
      </Button>
    );
  }

  if (categorySets.length === 0) {
    return (
      <Button
        type="button"
        variant="outline"
        className="gap-1.5"
        onClick={onAddCategorySet}
      >
        <Plus className="size-4" aria-hidden />
        Add Category Set
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        type="button"
        className="inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-sm font-medium whitespace-nowrap transition-all outline-none hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 dark:border-input dark:bg-input/30 dark:hover:bg-input/50"
      >
        <span className="max-w-64 truncate">
          {selectedCategorySet?.id
            ? selectedCategorySet.name
            : "New Category Set"}
        </span>
        <ChevronDown className="size-3.5 opacity-60" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-64">
        <DropdownMenuItem onClick={onAddCategorySet}>
          <Plus className="size-4" aria-hidden />
          Add Category Set
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {categorySets.map((categorySet) => (
          <DropdownMenuItem
            key={categorySet.id}
            onClick={() => onSelectCategorySet(categorySet)}
          >
            <span className="truncate">{categorySet.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
