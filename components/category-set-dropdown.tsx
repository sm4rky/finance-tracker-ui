"use client";

import { useState } from "react";
import { Check, ChevronDown, Loader2, Tags } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSelectedCategorySet } from "@/hooks/use-selected-category-set";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const DEFAULT_CATEGORY_SET_LABEL = "Default categories";

type CategorySetDropdownProps = {
  onCategorySetChange?: () => void;
};

export function CategorySetDropdown({
  onCategorySetChange,
}: CategorySetDropdownProps = {}) {
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);
  const {
    categorySets,
    isLoading,
    selectedCategorySet,
    setSelectedCategorySet,
  } = useSelectedCategorySet();

  return (
    <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen} modal={false}>
      <DropdownMenuTrigger
        type="button"
        aria-label="Category set"
        className={cn(
          buttonVariants({
            variant: !isMobile && menuOpen ? "secondary" : "outline",
          }),
          "max-w-[min(100vw-6rem,18rem)] gap-1.5 font-normal",
        )}
      >
        {isLoading && categorySets.length === 0 ? (
          <Loader2 className="size-4 shrink-0 animate-spin opacity-70" aria-hidden />
        ) : (
          <Tags className="size-4 shrink-0 opacity-70" aria-hidden />
        )}
        <span className="min-w-0 flex-1 truncate">{selectedCategorySet?.name ?? DEFAULT_CATEGORY_SET_LABEL}</span>
        {!isMobile ? (
          <ChevronDown
            className={cn(
              "size-4 shrink-0 transition-transform",
              menuOpen && "rotate-180",
            )}
            aria-hidden
          />
        ) : null}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="w-72 p-1"
        sideOffset={6}
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-[11px] font-semibold uppercase tracking-wide">
            Category set
          </DropdownMenuLabel>
          <DropdownMenuItem
            className={cn(
              "cursor-pointer gap-2",
              selectedCategorySet === null && "bg-accent",
            )}
            onClick={() => {
              setSelectedCategorySet(null);
              onCategorySetChange?.();
              setMenuOpen(false);
            }}
          >
            <span className="min-w-0 flex-1 truncate">
              {DEFAULT_CATEGORY_SET_LABEL}
            </span>
            {selectedCategorySet === null ? (
              <Check className="size-4 shrink-0" aria-hidden />
            ) : null}
          </DropdownMenuItem>
        </DropdownMenuGroup>

        {categorySets.length > 0 ? (
          <DropdownMenuGroup>
            {categorySets.map((categorySet) => {
              const selected = selectedCategorySet?.id === categorySet.id;

              return (
                <DropdownMenuItem
                  key={categorySet.id}
                  className={cn("cursor-pointer gap-2", selected && "bg-accent")}
                  onClick={() => {
                    setSelectedCategorySet(categorySet);
                    onCategorySetChange?.();
                    setMenuOpen(false);
                  }}
                >
                  <span className="min-w-0 flex-1 truncate">
                    {categorySet.name}
                  </span>
                  {selected ? (
                    <Check className="size-4 shrink-0" aria-hidden />
                  ) : null}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuGroup>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
