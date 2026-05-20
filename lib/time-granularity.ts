import type { TimeGranularity } from "@/interface/granularity";

const TIME_GRANULARITIES: TimeGranularity[] = ["day", "week", "month", "year"];

export const TIME_GRANULARITY_OPTIONS = TIME_GRANULARITIES.map(
  (granularity) => ({
    value: granularity,
    label: granularity.charAt(0).toUpperCase() + granularity.slice(1),
  }),
);
