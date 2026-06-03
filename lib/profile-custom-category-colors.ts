export type ProfileCustomCategoryColorMeta = {
  displayName: string;
  badgeClassName: string;
  fallbackIconClassName: string;
  calendarDotClassName: string;
};

export const DEFAULT_PROFILE_CUSTOM_CATEGORY_COLOR = "slate";

export const PROFILE_CUSTOM_CATEGORY_COLOR_METAS: Record<
  string,
  ProfileCustomCategoryColorMeta
> = {
  slate: {
    displayName: "Slate",
    badgeClassName:
      "border-slate-500/25 bg-slate-500/15 text-slate-900 dark:text-slate-100",
    fallbackIconClassName: "bg-slate-500/15 text-slate-800 dark:text-slate-200",
    calendarDotClassName: "bg-slate-400 dark:bg-slate-400",
  },
  zinc: {
    displayName: "Zinc",
    badgeClassName:
      "border-zinc-500/25 bg-zinc-500/15 text-zinc-900 dark:text-zinc-100",
    fallbackIconClassName: "bg-zinc-500/15 text-zinc-800 dark:text-zinc-200",
    calendarDotClassName: "bg-zinc-400 dark:bg-zinc-400",
  },
  neutral: {
    displayName: "Neutral",
    badgeClassName:
      "border-neutral-500/25 bg-neutral-500/15 text-neutral-900 dark:text-neutral-100",
    fallbackIconClassName:
      "bg-neutral-500/15 text-neutral-800 dark:text-neutral-200",
    calendarDotClassName: "bg-neutral-400 dark:bg-neutral-400",
  },
  stone: {
    displayName: "Stone",
    badgeClassName:
      "border-stone-500/25 bg-stone-500/15 text-stone-900 dark:text-stone-100",
    fallbackIconClassName: "bg-stone-500/15 text-stone-800 dark:text-stone-200",
    calendarDotClassName: "bg-stone-400 dark:bg-stone-400",
  },
  red: {
    displayName: "Red",
    badgeClassName:
      "border-red-500/25 bg-red-500/15 text-red-950 dark:text-red-100",
    fallbackIconClassName: "bg-red-500/15 text-red-900 dark:text-red-200",
    calendarDotClassName: "bg-red-400 dark:bg-red-400",
  },
  orange: {
    displayName: "Orange",
    badgeClassName:
      "border-orange-500/25 bg-orange-500/15 text-orange-950 dark:text-orange-100",
    fallbackIconClassName:
      "bg-orange-500/15 text-orange-900 dark:text-orange-200",
    calendarDotClassName: "bg-orange-400 dark:bg-orange-400",
  },
  amber: {
    displayName: "Amber",
    badgeClassName:
      "border-amber-600/25 bg-amber-600/15 text-amber-950 dark:text-amber-100",
    fallbackIconClassName: "bg-amber-600/15 text-amber-900 dark:text-amber-200",
    calendarDotClassName: "bg-amber-500 dark:bg-amber-400",
  },
  yellow: {
    displayName: "Yellow",
    badgeClassName:
      "border-yellow-500/25 bg-yellow-500/15 text-yellow-950 dark:text-yellow-100",
    fallbackIconClassName:
      "bg-yellow-500/15 text-yellow-900 dark:text-yellow-200",
    calendarDotClassName: "bg-yellow-400 dark:bg-yellow-400",
  },
  lime: {
    displayName: "Lime",
    badgeClassName:
      "border-lime-600/25 bg-lime-600/15 text-lime-950 dark:text-lime-100",
    fallbackIconClassName: "bg-lime-600/15 text-lime-900 dark:text-lime-200",
    calendarDotClassName: "bg-lime-500 dark:bg-lime-400",
  },
  green: {
    displayName: "Green",
    badgeClassName:
      "border-green-600/25 bg-green-600/15 text-green-950 dark:text-green-100",
    fallbackIconClassName: "bg-green-600/15 text-green-900 dark:text-green-200",
    calendarDotClassName: "bg-green-400 dark:bg-green-400",
  },
  emerald: {
    displayName: "Emerald",
    badgeClassName:
      "border-emerald-600/25 bg-emerald-600/15 text-emerald-950 dark:text-emerald-100",
    fallbackIconClassName:
      "bg-emerald-600/15 text-emerald-900 dark:text-emerald-200",
    calendarDotClassName: "bg-emerald-400 dark:bg-emerald-400",
  },
  teal: {
    displayName: "Teal",
    badgeClassName:
      "border-teal-500/25 bg-teal-500/15 text-teal-950 dark:text-teal-100",
    fallbackIconClassName: "bg-teal-500/15 text-teal-900 dark:text-teal-200",
    calendarDotClassName: "bg-teal-400 dark:bg-teal-400",
  },
  cyan: {
    displayName: "Cyan",
    badgeClassName:
      "border-cyan-600/25 bg-cyan-600/15 text-cyan-950 dark:text-cyan-100",
    fallbackIconClassName: "bg-cyan-600/15 text-cyan-900 dark:text-cyan-200",
    calendarDotClassName: "bg-cyan-400 dark:bg-cyan-400",
  },
  sky: {
    displayName: "Sky",
    badgeClassName:
      "border-sky-500/25 bg-sky-500/15 text-sky-950 dark:text-sky-100",
    fallbackIconClassName: "bg-sky-500/15 text-sky-900 dark:text-sky-200",
    calendarDotClassName: "bg-sky-400 dark:bg-sky-400",
  },
  blue: {
    displayName: "Blue",
    badgeClassName:
      "border-blue-600/25 bg-blue-600/15 text-blue-950 dark:text-blue-100",
    fallbackIconClassName: "bg-blue-600/15 text-blue-900 dark:text-blue-200",
    calendarDotClassName: "bg-blue-400 dark:bg-blue-400",
  },
  indigo: {
    displayName: "Indigo",
    badgeClassName:
      "border-indigo-500/25 bg-indigo-500/15 text-indigo-950 dark:text-indigo-100",
    fallbackIconClassName:
      "bg-indigo-500/15 text-indigo-900 dark:text-indigo-200",
    calendarDotClassName: "bg-indigo-400 dark:bg-indigo-400",
  },
  violet: {
    displayName: "Violet",
    badgeClassName:
      "border-violet-500/25 bg-violet-500/15 text-violet-900 dark:text-violet-100",
    fallbackIconClassName:
      "bg-violet-500/15 text-violet-800 dark:text-violet-200",
    calendarDotClassName: "bg-violet-400 dark:bg-violet-400",
  },
  purple: {
    displayName: "Purple",
    badgeClassName:
      "border-purple-600/25 bg-purple-600/15 text-purple-950 dark:text-purple-100",
    fallbackIconClassName:
      "bg-purple-600/15 text-purple-900 dark:text-purple-200",
    calendarDotClassName: "bg-purple-400 dark:bg-purple-400",
  },
  pink: {
    displayName: "Pink",
    badgeClassName:
      "border-pink-500/25 bg-pink-500/15 text-pink-950 dark:text-pink-100",
    fallbackIconClassName: "bg-pink-500/15 text-pink-900 dark:text-pink-200",
    calendarDotClassName: "bg-pink-400 dark:bg-pink-400",
  },
  rose: {
    displayName: "Rose",
    badgeClassName:
      "border-rose-500/25 bg-rose-500/15 text-rose-950 dark:text-rose-100",
    fallbackIconClassName: "bg-rose-500/15 text-rose-900 dark:text-rose-200",
    calendarDotClassName: "bg-rose-400 dark:bg-rose-400",
  },
};

export const DEFAULT_PROFILE_CUSTOM_CATEGORY_COLOR_META =
  PROFILE_CUSTOM_CATEGORY_COLOR_METAS[DEFAULT_PROFILE_CUSTOM_CATEGORY_COLOR];

export const PROFILE_CUSTOM_CATEGORY_COLORS = Object.keys(
  PROFILE_CUSTOM_CATEGORY_COLOR_METAS,
);

export function getProfileCustomCategoryColorSet(
  colorSet: string | null | undefined,
): ProfileCustomCategoryColorMeta {
  const normalized = colorSet?.trim().toLowerCase();
  if (!normalized) {
    return DEFAULT_PROFILE_CUSTOM_CATEGORY_COLOR_META;
  }

  return (
    PROFILE_CUSTOM_CATEGORY_COLOR_METAS[normalized] ??
    DEFAULT_PROFILE_CUSTOM_CATEGORY_COLOR_META
  );
}
