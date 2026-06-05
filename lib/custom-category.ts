import type { LucideIcon } from "lucide-react";

import type { ProfileCustomCategoryResponse } from "@/interface/profile-custom-category";
import { getCustomCategoryColorSet } from "@/lib/custom-category-colors";
import { getCustomCategoryIconMeta } from "@/lib/custom-category-icons";

export type CustomCategoryMeta = {
  displayName: string;
  badgeClassName: string;
  fallbackIconClassName: string;
  calendarDotClassName: string;
  Icon: LucideIcon;
};

export function getCustomCategoryMeta(
  category: ProfileCustomCategoryResponse,
): CustomCategoryMeta {
  const { colorSet, iconName, name } = category;
  const colorMeta = getCustomCategoryColorSet(colorSet);
  const iconMeta = getCustomCategoryIconMeta(iconName);

  return {
    displayName: name,
    badgeClassName: colorMeta.badgeClassName,
    fallbackIconClassName: colorMeta.fallbackIconClassName,
    calendarDotClassName: colorMeta.calendarDotClassName,
    Icon: iconMeta.Icon,
  };
}