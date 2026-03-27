"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CreditCard, LogOut, Moon, Settings, Sun, Wallet } from "lucide-react";

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
import { Switch } from "@/components/ui/switch";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-session";
import { useUserPreferenceStore } from "@/stores/user-preference";

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
  const colorMode = useUserPreferenceStore((s) => s.theme);
  const setThemeColorMode = useUserPreferenceStore((s) => s.setThemeColorMode);

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

  function navigateToProfileSection(value: string) {
    if (pathname === "/profile") {
      window.location.hash = value;
      return;
    }
    router.push(`/profile#${value}`);
  }

  return (
    <header className="sticky top-0 z-10 flex min-h-14 shrink-0 items-center gap-3 border-b border-border bg-background px-4 py-2">
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
        <DropdownMenuContent align="end" className="min-w-60" sideOffset={6}>
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
          <DropdownMenuItem
            closeOnClick={false}
            className="flex cursor-default items-center justify-between gap-3 py-2"
          >
            <span className="flex min-w-0 flex-1 items-center gap-2">
              {colorMode === "dark" ? (
                <Moon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              ) : (
                <Sun className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              )}
              <span className="leading-tight">
                {colorMode === "dark" ? "Dark mode" : "Light mode"}
              </span>
            </span>
            <Switch
              checked={colorMode === "dark"}
              onCheckedChange={(checked) =>
                setThemeColorMode(checked ? "dark" : "light")
              }
              aria-label={colorMode === "dark" ? "Use light mode" : "Use dark mode"}
            />
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuLabel>Profile</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigateToProfileSection("settings")}>
              <Settings />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigateToProfileSection("planbilling")}
            >
              <CreditCard />
              Plan & Billing
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigateToProfileSection("accounts")}>
              <Wallet />
              Accounts
            </DropdownMenuItem>
          </DropdownMenuGroup>
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
