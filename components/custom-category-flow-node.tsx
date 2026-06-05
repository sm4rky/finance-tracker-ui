import { Trash2 } from "lucide-react";
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";

import { Button } from "@/components/ui/button";
import { getCustomCategoryColorSet } from "@/lib/custom-category-colors";
import { getCustomCategoryIconMeta } from "@/lib/custom-category-icons";
import { cn } from "@/lib/utils";
import type { ProfileCustomCategoryResponse } from "@/interface/profile-custom-category";

export type CustomCategoryNodeData = {
  category: ProfileCustomCategoryResponse;
  selected: boolean;
  mappedCount: number;
  onDeleteCustomCategory?: () => void;
} & Record<string, unknown>;

export type CustomCategoryNode = Node<CustomCategoryNodeData, "customCategory">;

export type CustomCategoryFlowNodeProps = NodeProps<CustomCategoryNode>;

export function CustomCategoryFlowNode({ data }: CustomCategoryFlowNodeProps) {
  const colorSet = getCustomCategoryColorSet(data.category.colorSet);
  const iconMeta = getCustomCategoryIconMeta(data.category.iconName);
  const Icon = iconMeta.Icon;

  return (
    <div
      className={cn(
        "relative min-w-64 rounded-xl border bg-card px-3 py-3 text-card-foreground shadow-sm transition",
        data.selected && "shadow-md ring-2 ring-primary",
      )}
    >
      {data.selected && (
        <Button
          type="button"
          size="icon-sm"
          className="absolute -top-3 -right-3 z-10 size-7 rounded-full shadow-sm cursor-pointer"
          aria-label="Delete category"
          onClick={(event) => {
            event.stopPropagation();
            data.onDeleteCustomCategory?.();
          }}
        >
          <Trash2 className="size-3.5" aria-hidden />
        </Button>
      )}
      <Handle
        type="source"
        position={Position.Left}
        className="size-3! border-background! bg-primary!"
      />
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg",
            colorSet.fallbackIconClassName,
          )}
          aria-hidden
        >
          <Icon className="size-4 shrink-0 opacity-90" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate font-semibold">
            {data.category.name || "Untitled category"}
          </div>
          <div className="truncate text-xs text-muted-foreground">
            {data.mappedCount} primary categories
          </div>
        </div>
      </div>
    </div>
  );
}
