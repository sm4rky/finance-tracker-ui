"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CreditCard, LogOut, Settings, Wallet } from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-session";

const ROUTE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/transactions": "Transactions",
  "/subscriptions": "Subscriptions",
  "/profile": "Profile",
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
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.userProfile);
  const title = formatHeaderTitle(pathname);
  const [dateLabel, setDateLabel] = useState("");
  const [signingOut, setSigningOut] = useState(false);

  const email = user?.email ?? "";
  const displayLine = profile?.fullName?.trim() || "Account";

  useEffect(() => {
    setDateLabel(formatHeaderDate(new Date()));
  }, []);

  async function handleSignOut() {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    useAuthStore.getState().clear();
    router.push("/login");
    router.refresh();
  }

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
      <DropdownMenu>
        <DropdownMenuTrigger className="shrink-0 rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
          <Avatar>
            <AvatarImage src={profile?.avatarUrl ?? ""} alt="" />
            <AvatarFallback>
              {profile?.fullName?.[0] ?? "0"}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-48" sideOffset={6}>
          <DropdownMenuGroup>
            <DropdownMenuLabel className="font-normal">
              <div className="flex items-center gap-2 py-0.5">
                <Avatar
                  className="pointer-events-none shrink-0"
                >
                  <AvatarImage src={profile?.avatarUrl ?? ""} alt="" />
                  <AvatarFallback>
                    {profile?.fullName?.[0] ?? "0"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-sm font-medium leading-tight">
                    {displayLine}
                  </span>
                  {email && displayLine !== email ? (
                    <span className="truncate text-xs text-muted-foreground">
                      {email}
                    </span>
                  ) : null}
                </div>
              </div>
            </DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push("/profile#settings")}>
            <Settings />
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push("/profile#planbilling")}
          >
            <CreditCard />
            Plan & Billing
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/profile#accounts")}>
            <Wallet />
            Accounts
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            disabled={signingOut}
            onClick={() => void handleSignOut()}
          >
            <LogOut />
            {signingOut ? "Signing out…" : "Sign out"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
