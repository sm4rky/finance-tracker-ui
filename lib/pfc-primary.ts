import type { LucideIcon } from "lucide-react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Car,
  CircleDollarSign,
  CircleHelp,
  Clapperboard,
  Hammer,
  HandCoins,
  HeartPulse,
  Home,
  Landmark,
  Plane,
  Receipt,
  ShoppingBag,
  Sparkles,
  Tag,
  UtensilsCrossed,
  Wallet,
  Wrench,
} from "lucide-react";

export type PfcPrimaryMeta = {
  displayName: string;
  badgeClassName: string;
  fallbackIconClassName: string;
  calendarDotClassName: string;
  Icon: LucideIcon;
};

export const UNCATEGORIZED_PFC_PRIMARY = "__UNCATEGORIZED__";

export const PFC_PRIMARY_METAS: Record<string, PfcPrimaryMeta> = {
  BANK_FEES: {
    displayName: "Bank fees",
    badgeClassName:
      "border-slate-500/25 bg-slate-500/15 text-slate-900 dark:text-slate-100",
    fallbackIconClassName: "bg-slate-500/15 text-slate-800 dark:text-slate-200",
    calendarDotClassName: "bg-slate-400 dark:bg-slate-400",
    Icon: CircleDollarSign,
  },
  ENTERTAINMENT: {
    displayName: "Entertainment",
    badgeClassName:
      "border-violet-500/25 bg-violet-500/15 text-violet-900 dark:text-violet-100",
    fallbackIconClassName:
      "bg-violet-500/15 text-violet-800 dark:text-violet-200",
    calendarDotClassName: "bg-violet-400 dark:bg-violet-400",
    Icon: Clapperboard,
  },
  FOOD_AND_DRINK: {
    displayName: "Food & drink",
    badgeClassName:
      "border-orange-500/25 bg-orange-500/15 text-orange-950 dark:text-orange-100",
    fallbackIconClassName:
      "bg-orange-500/15 text-orange-900 dark:text-orange-200",
    calendarDotClassName: "bg-orange-400 dark:bg-orange-400",
    Icon: UtensilsCrossed,
  },
  GENERAL_MERCHANDISE: {
    displayName: "General merchandise",
    badgeClassName:
      "border-sky-500/25 bg-sky-500/15 text-sky-950 dark:text-sky-100",
    fallbackIconClassName: "bg-sky-500/15 text-sky-900 dark:text-sky-200",
    calendarDotClassName: "bg-sky-400 dark:bg-sky-400",
    Icon: ShoppingBag,
  },
  GENERAL_SERVICES: {
    displayName: "General services",
    badgeClassName:
      "border-zinc-500/25 bg-zinc-500/15 text-zinc-900 dark:text-zinc-100",
    fallbackIconClassName: "bg-zinc-500/15 text-zinc-800 dark:text-zinc-200",
    calendarDotClassName: "bg-zinc-400 dark:bg-zinc-400",
    Icon: Wrench,
  },
  GOVERNMENT_AND_NON_PROFIT: {
    displayName: "Government & nonprofit",
    badgeClassName:
      "border-indigo-500/25 bg-indigo-500/15 text-indigo-950 dark:text-indigo-100",
    fallbackIconClassName:
      "bg-indigo-500/15 text-indigo-900 dark:text-indigo-200",
    calendarDotClassName: "bg-indigo-400 dark:bg-indigo-400",
    Icon: Landmark,
  },
  HOME_IMPROVEMENT: {
    displayName: "Home improvement",
    badgeClassName:
      "border-amber-700/25 bg-amber-700/15 text-amber-950 dark:text-amber-100",
    fallbackIconClassName: "bg-amber-700/15 text-amber-900 dark:text-amber-200",
    calendarDotClassName: "bg-amber-500 dark:bg-amber-400",
    Icon: Hammer,
  },
  INCOME: {
    displayName: "Income",
    badgeClassName:
      "border-emerald-600/25 bg-emerald-600/15 text-emerald-950 dark:text-emerald-100",
    fallbackIconClassName:
      "bg-emerald-600/15 text-emerald-900 dark:text-emerald-200",
    calendarDotClassName: "bg-emerald-400 dark:bg-emerald-400",
    Icon: Wallet,
  },
  LOAN_DISBURSEMENTS: {
    displayName: "Loan disbursements",
    badgeClassName:
      "border-teal-500/25 bg-teal-500/15 text-teal-950 dark:text-teal-100",
    fallbackIconClassName: "bg-teal-500/15 text-teal-900 dark:text-teal-200",
    calendarDotClassName: "bg-teal-400 dark:bg-teal-400",
    Icon: HandCoins,
  },
  LOAN_PAYMENTS: {
    displayName: "Loan payments",
    badgeClassName:
      "border-rose-500/25 bg-rose-500/15 text-rose-950 dark:text-rose-100",
    fallbackIconClassName: "bg-rose-500/15 text-rose-900 dark:text-rose-200",
    calendarDotClassName: "bg-rose-400 dark:bg-rose-400",
    Icon: Receipt,
  },
  MEDICAL: {
    displayName: "Medical",
    badgeClassName:
      "border-red-500/25 bg-red-500/15 text-red-950 dark:text-red-100",
    fallbackIconClassName: "bg-red-500/15 text-red-900 dark:text-red-200",
    calendarDotClassName: "bg-red-400 dark:bg-red-400",
    Icon: HeartPulse,
  },
  OTHER: {
    displayName: "Other",
    badgeClassName:
      "border-neutral-500/25 bg-neutral-500/15 text-neutral-900 dark:text-neutral-100",
    fallbackIconClassName:
      "bg-neutral-500/15 text-neutral-800 dark:text-neutral-200",
    calendarDotClassName: "bg-neutral-400 dark:bg-neutral-400",
    Icon: CircleHelp,
  },
  PERSONAL_CARE: {
    displayName: "Personal care",
    badgeClassName:
      "border-fuchsia-500/25 bg-fuchsia-500/15 text-fuchsia-950 dark:text-fuchsia-100",
    fallbackIconClassName:
      "bg-fuchsia-500/15 text-fuchsia-900 dark:text-fuchsia-200",
    calendarDotClassName: "bg-fuchsia-400 dark:bg-fuchsia-400",
    Icon: Sparkles,
  },
  RENT_AND_UTILITIES: {
    displayName: "Rent & utilities",
    badgeClassName:
      "border-cyan-600/25 bg-cyan-600/15 text-cyan-950 dark:text-cyan-100",
    fallbackIconClassName: "bg-cyan-600/15 text-cyan-900 dark:text-cyan-200",
    calendarDotClassName: "bg-cyan-400 dark:bg-cyan-400",
    Icon: Home,
  },
  TRANSFER_IN: {
    displayName: "Transfer in",
    badgeClassName:
      "border-lime-600/25 bg-lime-600/15 text-lime-950 dark:text-lime-100",
    fallbackIconClassName: "bg-lime-600/15 text-lime-900 dark:text-lime-200",
    calendarDotClassName: "bg-lime-500 dark:bg-lime-400",
    Icon: ArrowDownLeft,
  },
  TRANSFER_OUT: {
    displayName: "Transfer out",
    badgeClassName:
      "border-amber-600/25 bg-amber-600/15 text-amber-950 dark:text-amber-100",
    fallbackIconClassName: "bg-amber-600/15 text-amber-900 dark:text-amber-200",
    calendarDotClassName: "bg-amber-500 dark:bg-amber-400",
    Icon: ArrowUpRight,
  },
  TRANSPORTATION: {
    displayName: "Transportation",
    badgeClassName:
      "border-blue-600/25 bg-blue-600/15 text-blue-950 dark:text-blue-100",
    fallbackIconClassName: "bg-blue-600/15 text-blue-900 dark:text-blue-200",
    calendarDotClassName: "bg-blue-400 dark:bg-blue-400",
    Icon: Car,
  },
  TRAVEL: {
    displayName: "Travel",
    badgeClassName:
      "border-purple-600/25 bg-purple-600/15 text-purple-950 dark:text-purple-100",
    fallbackIconClassName:
      "bg-purple-600/15 text-purple-900 dark:text-purple-200",
    calendarDotClassName: "bg-purple-400 dark:bg-purple-400",
    Icon: Plane,
  },
};

export const PFC_PRIMARY_META_FALLBACK: PfcPrimaryMeta = {
  displayName: "Uncategorized",
  badgeClassName: "border-muted-foreground/25 bg-muted text-muted-foreground",
  fallbackIconClassName: "bg-muted text-muted-foreground",
  calendarDotClassName: "bg-muted-foreground/55 dark:bg-muted-foreground/50",
  Icon: Tag,
};

export const PFC_PRIMARY = [
  ...Object.keys(PFC_PRIMARY_METAS),
  UNCATEGORIZED_PFC_PRIMARY,
];

export function getPfcPrmaryMeta(
  pfcPrimary: string | null | undefined,
): PfcPrimaryMeta {
  const normalized = pfcPrimary?.trim().toUpperCase();
  if (!normalized || normalized === UNCATEGORIZED_PFC_PRIMARY) {
    return PFC_PRIMARY_META_FALLBACK;
  }

  return PFC_PRIMARY_METAS[normalized] ?? PFC_PRIMARY_META_FALLBACK;
};
