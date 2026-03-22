import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

/** Authenticated shell: `/` redirects to `/dashboard`; other routes can live here later. */
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

  return <>{children}</>;
}
