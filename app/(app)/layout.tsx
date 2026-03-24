import { redirect } from "next/navigation";

import { AppSidebarShell } from "@/components/app-sidebar-shell";
import { createClient } from "@/lib/supabase/server";

/** Authenticated layout with sidebar: `/` redirects to `/dashboard`; add routes under `(app)` to reuse it. */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/");
  }

  return <AppSidebarShell>{children}</AppSidebarShell>;
}
