"use client";

import { TabsContent } from "@/components/ui/tabs";

export function ProfilePlanBillingTab() {
  return (
    <TabsContent
      value="planbilling"
      className="rounded-xl border border-border bg-card/40 p-4 sm:p-6 text-sm text-muted-foreground focus-visible:outline-none"
    >
      Subscription and invoices will go here.
    </TabsContent>
  );
}
