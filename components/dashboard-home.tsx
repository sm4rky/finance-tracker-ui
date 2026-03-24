"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-session";

export function DashboardHome() {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.userProfile);

  async function handleSignOut() {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    useAuthStore.getState().clear();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col p-6 md:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Dashboard
          </h1>
          <p className="mt-2 text-muted-foreground">
            Signed in as{" "}
            <span className="font-medium text-foreground">
              {user?.email ?? user?.id}
            </span>
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          disabled={signingOut}
          onClick={handleSignOut}
        >
          {signingOut ? "Signing out…" : "Sign out"}
        </Button>
      </div>

      {!profile ? (
        <p className="mt-6 text-sm text-muted-foreground">
          No <code className="text-xs">userProfile</code> in the store yet (ensure
          pending or failed).
        </p>
      ) : (
        <section className="mt-8 rounded-lg border border-border bg-card/40 p-4">
          <h2 className="text-sm font-medium text-foreground">
            Profile
          </h2>
          <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            {(
              [
                ["Full name", profile.fullName || "—"],
                ["Email", profile.email || "—"],
                ["Role", profile.role || "—"],
                ["Plan", profile.plan || "—"],
              ] as const
            ).map(([label, value]) => (
              <div key={label} className="flex flex-col gap-0.5">
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="font-medium text-foreground">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </div>
  );
}
