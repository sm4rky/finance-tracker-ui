"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { markPasswordLoginEnabled } from "@/lib/api/user";
import { setPasswordWithSession } from "@/lib/supabase/password";
import {
  type SetInitialPasswordFormValues,
  setInitialPasswordSchema,
} from "@/schema/profile-password.schema";
import { useAuthStore } from "@/stores/auth-session";

export function SetInitialPasswordForm() {
  const setUserProfile = useAuthStore((s) => s.setUserProfile);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<SetInitialPasswordFormValues>({
    resolver: zodResolver(setInitialPasswordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const { control, handleSubmit, watch, clearErrors, setError } = form;

  async function onSubmit(values: SetInitialPasswordFormValues) {
    clearErrors();
    setIsSubmitting(true);
    try {
      await setPasswordWithSession(values.newPassword);
      const profile = await markPasswordLoginEnabled();
      setUserProfile(profile);
      toast.success("Password saved. You can sign in with email and password.");
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Could not save password.";
      setError("root", { type: "server", message });
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const newPasswordWatch = watch("newPassword");
  const confirmPasswordWatch = watch("confirmPassword");

  return (
    <form className="space-y-4" noValidate onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup className="gap-4">
        <Controller
          name="newPassword"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid ? true : undefined}>
              <FieldLabel htmlFor="profile-new-password">
                New password
              </FieldLabel>
              <FieldContent>
                <div className="relative">
                  <Input
                    {...field}
                    id="profile-new-password"
                    type={showNewPassword ? "text" : "password"}
                    autoComplete="new-password"
                    className="pr-10"
                    disabled={isSubmitting}
                    aria-invalid={fieldState.invalid}
                    onChange={(e) => {
                      clearErrors("root");
                      field.onChange(e);
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1.5 top-1/2 size-8 -translate-y-1/2 text-muted-foreground"
                    disabled={isSubmitting}
                    onClick={() => setShowNewPassword((v) => !v)}
                    aria-label={
                      showNewPassword
                        ? "Hide new password"
                        : "Show new password"
                    }
                    aria-pressed={showNewPassword}
                  >
                    {showNewPassword ? (
                      <EyeOff className="size-4" aria-hidden />
                    ) : (
                      <Eye className="size-4" aria-hidden />
                    )}
                  </Button>
                </div>
              </FieldContent>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Controller
          name="confirmPassword"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid ? true : undefined}>
              <FieldLabel htmlFor="profile-confirm-password">
                Confirm password
              </FieldLabel>
              <FieldContent>
                <div className="relative">
                  <Input
                    {...field}
                    id="profile-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    className="pr-10"
                    disabled={isSubmitting}
                    aria-invalid={fieldState.invalid}
                    onChange={(e) => {
                      clearErrors("root");
                      field.onChange(e);
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1.5 top-1/2 size-8 -translate-y-1/2 text-muted-foreground"
                    disabled={isSubmitting}
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                    aria-pressed={showConfirmPassword}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="size-4" aria-hidden />
                    ) : (
                      <Eye className="size-4" aria-hidden />
                    )}
                  </Button>
                </div>
              </FieldContent>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
      </FieldGroup>

      <FieldError errors={[form.formState.errors.root]} />

      <Button
        type="submit"
        disabled={
          isSubmitting ||
          !String(newPasswordWatch ?? "").trim() ||
          !String(confirmPasswordWatch ?? "").trim()
        }
      >
        {isSubmitting ? "Saving…" : "Save password"}
      </Button>
    </form>
  );
}
