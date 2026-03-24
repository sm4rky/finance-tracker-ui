"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Camera, Crown } from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileAccountsTab } from "@/components/profile-accounts-tab";
import { ProfilePlanBillingTab } from "@/components/profile-plan-billing-tab";
import { ProfileSettingsTab } from "@/components/profile-settings-tab";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-session";

const PLAN_LABELS: Record<string, string> = {
  free: "Free Plan",
  pro: "Pro Plan",
  premium: "Premium Plan",
};

const PLAN_ACCENT_CLASS: Record<string, string> = {
  free: "text-muted-foreground",
  pro: "text-amber-500",
  premium: "text-sky-600 dark:text-sky-400",
};

const PROFILE_SECTION_LABELS: Record<string, string> = {
  settings: "Settings",
  planbilling: "Plan & Billing",
  accounts: "Accounts",
};

const PROFILE_DEFAULT_SECTION = "settings";

function planDisplayLabel(plan: string | undefined): string {
  const key = plan?.trim().toLowerCase() ?? "";
  return PLAN_LABELS[key] ?? PLAN_LABELS.free;
}

function planAccentClass(plan: string | undefined): string {
  const key = plan?.trim().toLowerCase() ?? "";
  return PLAN_ACCENT_CLASS[key] ?? PLAN_ACCENT_CLASS.free;
}

function isProfileSection(value: string): boolean {
  return Object.prototype.hasOwnProperty.call(PROFILE_SECTION_LABELS, value);
}

export function ProfileView() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.userProfile);
  const [section, setSection] = useState<string | null>(null);

  const email = user?.email ?? "";
  const displayName = profile?.fullName?.trim() || "Account";

  useLayoutEffect(() => {
    if (pathname !== "/profile") return;
    const raw = window.location.hash.slice(1);
    if (!raw || !isProfileSection(raw)) {
      router.replace(`/profile#${PROFILE_DEFAULT_SECTION}`, { scroll: false });
      setSection(PROFILE_DEFAULT_SECTION);
      return;
    }
    setSection(raw);
  }, [pathname, router]);

  useEffect(() => {
    if (pathname !== "/profile") return;
    const onHashChange = () => {
      const h = window.location.hash.slice(1);
      if (isProfileSection(h)) setSection(h);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [pathname]);

  const tabValue = section ?? PROFILE_DEFAULT_SECTION;

  return (
    <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col px-4 py-5 sm:p-6 md:p-8">
      <div className="mx-auto flex w-full min-w-0 max-w-2xl flex-col gap-5 sm:gap-6">
        <div className="rounded-xl border border-border bg-card/40 p-4 sm:p-6">
          <div className="flex flex-row items-center gap-4 sm:items-start sm:gap-6">
            <div className="relative shrink-0">
              <Avatar className="size-20 rounded-xl after:rounded-xl sm:size-24 [&_[data-slot=avatar-image]]:rounded-xl [&_[data-slot=avatar-fallback]]:rounded-xl">
                <AvatarImage src={profile?.avatarUrl ?? ""} alt="" />
                <AvatarFallback className="rounded-xl bg-primary !text-xl font-bold text-primary-foreground">
                  {profile?.fullName?.[0] ?? "0"}
                </AvatarFallback>
              </Avatar>
              <Button
                type="button"
                size="icon-sm"
                variant="secondary"
                className="absolute -right-1 -bottom-1 size-8 rounded-full shadow-md"
                aria-label="Update profile photo"
              >
                <Camera className="size-3.5" />
              </Button>
            </div>
            <div className="flex min-w-0 flex-1 flex-col space-y-1.5 sm:space-y-2">
              <h2 className="font-heading text-lg font-semibold tracking-tight break-words sm:text-xl">
                {displayName}
              </h2>
              <p className="text-xs text-muted-foreground break-all sm:text-sm">
                {email}
              </p>
              <span
                className={cn(
                  "inline-flex w-fit max-w-full items-center gap-1 rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-xs font-medium",
                  planAccentClass(profile?.plan),
                )}
              >
                <Crown className="size-3.5 shrink-0" aria-hidden />
                {planDisplayLabel(profile?.plan)}
              </span>
            </div>
          </div>
        </div>

        <Tabs
          value={tabValue}
          onValueChange={(v) => {
            if (!isProfileSection(v)) return;
            setSection(v);
            router.replace(`/profile#${v}`, { scroll: false });
          }}
          className="min-w-0 gap-3 sm:gap-4"
        >
          <div className="w-full min-w-0 overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] sm:overflow-visible [&::-webkit-scrollbar]:hidden">
            <TabsList className="inline-flex h-auto min-h-9 w-max max-w-none flex-nowrap gap-0.5 rounded-lg p-1 sm:h-9 sm:w-fit sm:gap-0">
              {Object.entries(PROFILE_SECTION_LABELS).map(([id, label]) => (
                <TabsTrigger
                  key={id}
                  value={id}
                  className="shrink-0 flex-none px-2.5 py-2 text-xs whitespace-nowrap sm:px-3 sm:py-0.5 sm:text-sm"
                >
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <ProfileSettingsTab />
          <ProfilePlanBillingTab />
          <ProfileAccountsTab />
        </Tabs>
      </div>
    </div>
  );
}
