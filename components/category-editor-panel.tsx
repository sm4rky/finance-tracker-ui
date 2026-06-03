import { Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { CustomCategoryNode } from "@/components/custom-category-flow-node";
import type { ProfileCustomCategoryResponse } from "@/interface/profile-custom-category";
import { getPfcPrmaryMeta } from "@/lib/pfc-primary";
import {
  getProfileCustomCategoryColorSet as getProfileCustomCategoryColorMeta,
  PROFILE_CUSTOM_CATEGORY_COLORS,
} from "@/lib/profile-custom-category-colors";
import {
  getProfileCustomCategoryIconMeta,
  PROFILE_CUSTOM_CATEGORY_ICON_GROUPS,
} from "@/lib/profile-custom-category-icons";
import { cn } from "@/lib/utils";

type CategoryEditorPanelProps = {
  categoryNode: CustomCategoryNode | null;
  connectedPfcCodes: string[];
  customizeMode: "color" | "icon";
  onCustomizeModeChange: (mode: "color" | "icon") => void;
  onCategoryChange: (patch: Partial<ProfileCustomCategoryResponse>) => void;
  onDeleteCategory: () => void;
  isMobile?: boolean;
};

export function CategoryEditorPanel({
  categoryNode,
  connectedPfcCodes,
  customizeMode,
  onCustomizeModeChange,
  onCategoryChange,
  onDeleteCategory,
  isMobile = false,
}: CategoryEditorPanelProps) {
  if (!categoryNode) {
    return (
      <Card className="min-h-0 p-4">No custom category selected yet.</Card>
    );
  }

  const category = categoryNode.data.category;
  const colorSet = getProfileCustomCategoryColorMeta(category.colorSet);
  const iconMeta = getProfileCustomCategoryIconMeta(category.iconName);
  const Icon = iconMeta.Icon;

  return (
    <Card className={cn("min-h-0 p-4 flex flex-col gap-5 overflow-auto no-scrollbar", isMobile ? "w-full rounded-none" : "w-90")}>
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/40",
            colorSet.fallbackIconClassName,
          )}
          aria-hidden
        >
          <Icon className="size-4 shrink-0 opacity-90" />
        </span>
        <Badge
          variant="outline"
          className={cn(
            "shrink-0 border font-normal text-xs",
            colorSet.badgeClassName,
          )}
        >
          {category.name || "Untitled category"}
        </Badge>
      </div>

      <div className="space-y-2">
        <Label htmlFor="custom-category-name">Name</Label>
        <Input
          id="custom-category-name"
          value={category.name}
          onChange={(e) => onCategoryChange({ name: e.target.value })}
          placeholder="e.g. Food, Bills, Travel..."
        />
      </div>

      <Tabs
        value={customizeMode}
        onValueChange={(value) => {
          if (value === "color" || value === "icon") {
            onCustomizeModeChange(value);
          }
        }}
        className="gap-4"
      >
        <TabsList className="min-w-0">
          <TabsTrigger value="color" className="w-20 shrink-0">
            Color
          </TabsTrigger>
          <TabsTrigger value="icon" className="w-20 shrink-0">
            Icon
          </TabsTrigger>
        </TabsList>

        <TabsContent value="color">
          <div className="grid grid-cols-4 gap-4">
            {PROFILE_CUSTOM_CATEGORY_COLORS.map((colorSet) => {
              const colorMeta = getProfileCustomCategoryColorMeta(colorSet);
              const selected = colorSet === category.colorSet;
              return (
                <button
                  type="button"
                  key={colorSet}
                  title={colorMeta.displayName}
                  className={cn(
                    "size-8 rounded-full border border-border/20 ring-offset-background transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    colorMeta.calendarDotClassName,
                    selected
                      ? "ring-2 ring-foreground ring-offset-2"
                      : "hover:ring-2 hover:ring-muted-foreground/30 hover:ring-offset-2",
                  )}
                  onClick={() => onCategoryChange({ colorSet })}
                />
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="icon">
          <div className="flex flex-col gap-4">
            {PROFILE_CUSTOM_CATEGORY_ICON_GROUPS.map((group) => (
              <div key={group.displayName} className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">
                  {group.displayName}
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {group.icons.map((iconName) => {
                    const iconMeta =
                      getProfileCustomCategoryIconMeta(iconName);
                    const selected = iconName === category.iconName;
                    const Icon = iconMeta.Icon;
                    return (
                      <button
                        type="button"
                        key={iconName}
                        title={iconMeta.displayName}
                        className={cn(
                          "flex size-10 shrink-0 items-center justify-center rounded-lg border border-border/40 bg-background text-muted-foreground transition hover:bg-muted hover:text-foreground",
                          selected && "border-primary text-foreground",
                        )}
                        onClick={() => onCategoryChange({ iconName })}
                      >
                        <Icon
                          className="size-4 shrink-0 opacity-90"
                          aria-hidden
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Separator />

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <Label>Mapped primary categories</Label>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {connectedPfcCodes.length > 0 ? (
            connectedPfcCodes.map((code) => {
              const meta = getPfcPrmaryMeta(code);
              return (
                <Badge
                  key={code}
                  variant="outline"
                  className={cn(
                    "shrink-0 border font-normal text-xs",
                    meta.badgeClassName,
                  )}
                >
                  {meta.displayName}
                </Badge>
              );
            })
          ) : (
            <p className="text-sm text-muted-foreground">
              No Plaid primary categories connected yet.
            </p>
          )}
        </div>
      </div>

      <Separator />

      <Button
        type="button"
        variant="destructive"
        onClick={onDeleteCategory}
      >
        <Trash2 className="size-4" aria-hidden />
        Delete this category
      </Button>
    </Card>
  );
}
