"use client";

import { Check } from "lucide-react";

import { BILLING_PLANS } from "@/components/billing-plan";
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-session";

export function ProfilePlanBillingTab() {
  const plan = useAuthStore((s) => s.userProfile?.plan);
  const currentPlan = plan?.trim().toLowerCase() || "free";

  return (
    <TabsContent
      value="planbilling"
      className="flex flex-col gap-4 focus-visible:outline-none"
    >
      <div className="min-w-0 space-y-1">
        <h3 className="font-heading text-base font-semibold text-foreground sm:text-lg">
          Plan & Billing
        </h3>
        <p className="text-xs text-muted-foreground sm:text-sm">
          Manage your subscription plan and billing details
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {BILLING_PLANS.map((billingPlan) => {
          const isCurrentPlan = billingPlan.id === currentPlan;

          return (
            <section
              key={billingPlan.id}
              className={cn(
                "flex h-full flex-col justify-between rounded-xl border border-transparent bg-card/60 p-4 shadow-sm",
                isCurrentPlan && "border-primary bg-primary/5",
              )}
            >
              <div>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold text-primary">
                    {billingPlan.name}
                  </h3>

                  {isCurrentPlan ? (
                    <Check
                      className="size-4 text-primary"
                      aria-label="Current plan"
                    />
                  ) : null}
                </div>

                <ul className="space-y-2 text-sm text-muted-foreground">
                  {billingPlan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check
                        className="mt-0.5 size-3.5 shrink-0 text-primary"
                        aria-hidden
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 flex h-8 items-center justify-center">
                {isCurrentPlan ? (
                  <p className="text-sm font-medium text-primary">
                    Current Plan
                  </p>
                ) : (
                  <Button type="button" className="w-full">
                    Select
                  </Button>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </TabsContent>
  );
}
