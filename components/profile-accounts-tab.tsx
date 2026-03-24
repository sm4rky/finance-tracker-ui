"use client";

import { TabsContent } from "@/components/ui/tabs";

export function ProfileAccountsTab() {
  return (
    <TabsContent
      value="accounts"
      className="rounded-xl border border-border bg-card/40 p-4 sm:p-6 text-sm text-muted-foreground focus-visible:outline-none"
    >
      Linked banks and accounts will go here.
    </TabsContent>
  );
}
