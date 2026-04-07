export type DatePreset =
  | "all_time"
  | "this_month"
  | "last_month"
  | "last_3_months"
  | "last_6_months"
  | "this_year"
  | "last_year"
  | "custom";

export const DATE_PRESET_LABELS: Record<
  Exclude<DatePreset, "custom">,
  string
> = {
  all_time: "All time",
  this_month: "This month",
  last_month: "Last month",
  last_3_months: "Last 3 months",
  last_6_months: "Last 6 months",
  this_year: "This year",
  last_year: "Last year",
};

export const DATE_PRESET_ORDER: Exclude<DatePreset, "custom">[] = [
  "this_month",
  "last_month",
  "last_3_months",
  "last_6_months",
  "this_year",
  "last_year",
  "all_time",
];

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function rangesEqual(
  a: { dateFrom?: string; dateTo?: string },
  b: { dateFrom?: string; dateTo?: string },
): boolean {
  return (
    (a.dateFrom ?? "") === (b.dateFrom ?? "") &&
    (a.dateTo ?? "") === (b.dateTo ?? "")
  );
}

export function getDateRangeForPreset(
  preset: Exclude<DatePreset, "custom">,
  now: Date = new Date(),
): { dateFrom?: string; dateTo?: string } {
  const today = startOfDay(now);

  switch (preset) {
    case "all_time":
      return {};
    case "this_month": {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      return { dateFrom: toISODate(start), dateTo: toISODate(today) };
    }
    case "last_month": {
      const firstThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastPrev = new Date(firstThisMonth.getTime() - 86400000);
      const startPrev = new Date(
        lastPrev.getFullYear(),
        lastPrev.getMonth(),
        1,
      );
      return { dateFrom: toISODate(startPrev), dateTo: toISODate(lastPrev) };
    }
    case "last_3_months": {
      const start = new Date(today.getFullYear(), today.getMonth() - 2, 1);
      return { dateFrom: toISODate(start), dateTo: toISODate(today) };
    }
    case "last_6_months": {
      const start = new Date(today.getFullYear(), today.getMonth() - 5, 1);
      return { dateFrom: toISODate(start), dateTo: toISODate(today) };
    }
    case "this_year": {
      const start = new Date(today.getFullYear(), 0, 1);
      return { dateFrom: toISODate(start), dateTo: toISODate(today) };
    }
    case "last_year": {
      const y = today.getFullYear() - 1;
      const start = new Date(y, 0, 1);
      const end = new Date(y, 11, 31);
      return { dateFrom: toISODate(start), dateTo: toISODate(end) };
    }
  }
}

export function inferDatePreset(
  dateFrom: string | undefined,
  dateTo: string | undefined,
  now: Date = new Date(),
): DatePreset {
  for (const preset of DATE_PRESET_ORDER) {
    const resolved = getDateRangeForPreset(preset, now);
    if (rangesEqual(resolved, { dateFrom, dateTo })) {
      return preset;
    }
  }
  return "custom";
}

const shortDateFmt = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function parseISODateLocal(iso: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (!y || mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  const date = new Date(y, mo - 1, d);
  if (
    date.getFullYear() !== y ||
    date.getMonth() !== mo - 1 ||
    date.getDate() !== d
  ) {
    return null;
  }
  return date;
}

export function formatCustomDateRangeLabel(
  dateFrom?: string,
  dateTo?: string,
): string {
  const from = dateFrom?.trim() ? parseISODateLocal(dateFrom) : null;
  const to = dateTo?.trim() ? parseISODateLocal(dateTo) : null;

  if (from && to) {
    return `${shortDateFmt.format(from)} – ${shortDateFmt.format(to)}`;
  }
  if (from) {
    return `From ${shortDateFmt.format(from)}`;
  }
  if (to) {
    return `Until ${shortDateFmt.format(to)}`;
  }
  return "Custom";
}

export function getTodayISODate(now: Date = new Date()): string {
  return toISODate(startOfDay(now));
}
