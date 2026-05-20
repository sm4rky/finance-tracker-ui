"use client";

import { Lock } from "lucide-react";

import { ChangePasswordForm } from "@/components/change-password-form";
import { SetInitialPasswordForm } from "@/components/set-initial-password-form";
import { useAuthStore } from "@/stores/auth-session";

export function ProfilePasswordSection() {
  const profile = useAuthStore((s) => s.userProfile);
  const hasPassword = profile?.passwordLoginEnabled === true;

  return (
    <>
      <div className="flex min-w-0 items-center gap-2 text-sm font-medium">
        <Lock className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <span className="min-w-0">Password</span>
      </div>
      <ul className="mt-1.5 list-disc space-y-0.5 pl-5 text-xs text-muted-foreground sm:text-sm">
        <li>8–128 characters long</li>
        <li>At least one uppercase letter (A-Z)</li>
        <li>At least one lowercase letter (a-z)</li>
        <li>At least one number (0-9)</li>
        <li>At least one special character (e.g., !@#$%^&*)</li>
      </ul>

      <div className="mt-4 sm:mt-5">
        {hasPassword ? (
          <ChangePasswordForm />
        ) : (
          <SetInitialPasswordForm />
        )}
      </div>
    </>
  );
}
