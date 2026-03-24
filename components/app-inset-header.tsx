"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { SidebarTrigger } from "@/components/ui/sidebar";

const ROUTE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/transactions": "Transactions",
  "/subscriptions": "Subscriptions",
};

function formatHeaderTitle(pathname: string | null): string {
  if (!pathname) return "";
  if (ROUTE_TITLES[pathname]) return ROUTE_TITLES[pathname];
  const segment = pathname.split("/").filter(Boolean).pop();
  if (!segment) return "MoneyInsight";
  return segment
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function formatHeaderDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function AppInsetHeader() {
  const pathname = usePathname();
  const title = formatHeaderTitle(pathname);
  const [dateLabel, setDateLabel] = useState("");

  useEffect(() => {
    setDateLabel(formatHeaderDate(new Date()));
  }, []);

  return (
    <header className="flex min-h-14 shrink-0 items-center gap-3 border-b px-4 py-2">
      <SidebarTrigger />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <h1 className="font-heading text-sm font-semibold leading-tight tracking-tight">
          {title}
        </h1>
        <p className="min-h-[1rem] text-xs leading-tight text-muted-foreground">
          {dateLabel || "\u00a0"}
        </p>
      </div>
    </header>
  );
}
