import { createClient } from "@/lib/supabase/client";

export async function setPasswordWithSession(newPassword: string) {
  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) {
    throw new Error(error.message ?? "Could not save password.");
  }
  await supabase.auth.refreshSession();
}

export async function changePasswordWithCurrent(
  currentPassword: string,
  newPassword: string,
) {
  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
    current_password: currentPassword,
  });
  if (error) {
    throw new Error(error.message ?? "Could not update password.");
  }
  await supabase.auth.refreshSession();
}
