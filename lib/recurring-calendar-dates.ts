export function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export type CalendarCell = { date: Date; inMonth: boolean };

export function buildMonthCalendarGrid(date: Date): CalendarCell[][] {
  const year = date.getFullYear();
  const month = date.getMonth();
  const start = new Date(year, month, 1);
  const lead = start.getDay();
  const gridStart = new Date(year, month, 1 - lead);
  const weeks: CalendarCell[][] = [];
  const cur = new Date(gridStart);
  for (let w = 0; w < 6; w++) {
    const row: CalendarCell[] = [];
    for (let d = 0; d < 7; d++) {
      row.push({
        date: new Date(cur),
        inMonth: cur.getMonth() === month,
      });
      cur.setDate(cur.getDate() + 1);
    }
    weeks.push(row);
  }
  while (
    weeks.length > 0 &&
    !weeks[weeks.length - 1]!.some((c) => c.inMonth)
  ) {
    weeks.pop();
  }
  return weeks;
}
