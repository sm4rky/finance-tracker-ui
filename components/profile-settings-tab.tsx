"use client";

import { UserRound } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { TabsContent } from "@/components/ui/tabs";
import { ProfileUsernameSection } from "@/components/profile-username-section";
import { useAuthStore } from "@/stores/auth-session";
import { ProfilePasswordSection } from "./profile-password-section";

export function ProfileSettingsTab() {
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.userProfile);
  const email = user?.email ?? "";
  const fullName = profile?.fullName?.trim() || "";

  return (
    <TabsContent
      value="settings"
      className="rounded-xl border border-border bg-card/40 p-4 sm:p-6 focus-visible:outline-none"
    >
      <div className="flex min-w-0 items-center gap-2 text-sm font-medium">
        <UserRound className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <span className="min-w-0">Personal Information</span>
      </div>
      <div className="mt-4 space-y-4 sm:mt-5 sm:space-y-5">
        <div className="space-y-2">
          <Label htmlFor="profile-full-name">Full Name</Label>
          <Input
            id="profile-full-name"
            disabled
            value={fullName}
            placeholder="—"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="profile-email">Email Address</Label>
          <Input
            id="profile-email"
            disabled
            type="email"
            value={email}
            placeholder="—"
          />
        </div>
      </div>

      <Separator className="my-6 sm:my-8" />

      <ProfileUsernameSection />

      <Separator className="my-6 sm:my-8" />

      <ProfilePasswordSection />
    </TabsContent>
  );
}
