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
import { changePasswordWithCurrent } from "@/lib/supabase/password";
import {
  type ChangePasswordFormValues,
  changePasswordSchema,
} from "@/schema/profile-password.schema";
import { useAuthStore } from "@/stores/auth-session";

export function ChangePasswordForm() {
  const setUserProfile = useAuthStore((s) => s.setUserProfile);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const { control, handleSubmit, watch, clearErrors, setError } = form;

  async function onSubmit(values: ChangePasswordFormValues) {
    clearErrors();
    setIsSubmitting(true);
    try {
      await changePasswordWithCurrent(
        values.currentPassword,
        values.newPassword,
      );
      const profile = await markPasswordLoginEnabled();
      setUserProfile(profile);
      form.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      toast.success("Password updated.");
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Could not update password.";
      setError("root", { type: "server", message });
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const currentPasswordWatch = watch("currentPassword");
  const newPasswordWatch = watch("newPassword");
  const confirmPasswordWatch = watch("confirmPassword");

  return (
    <form className="space-y-4" noValidate onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup className="gap-4">
        <Controller
          name="currentPassword"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid ? true : undefined}>
              <FieldLabel htmlFor="profile-current-password">
                Current password
              </FieldLabel>
              <FieldContent>
                <div className="relative">
                  <Input
                    {...field}
                    id="profile-current-password"
                    type={showCurrentPassword ? "text" : "password"}
                    autoComplete="current-password"
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
                    onClick={() => setShowCurrentPassword((v) => !v)}
                    aria-label={
                      showCurrentPassword
                        ? "Hide current password"
                        : "Show current password"
                    }
                    aria-pressed={showCurrentPassword}
                  >
                    {showCurrentPassword ? (
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
          name="newPassword"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid ? true : undefined}>
              <FieldLabel htmlFor="profile-change-new-password">
                New password
              </FieldLabel>
              <FieldContent>
                <div className="relative">
                  <Input
                    {...field}
                    id="profile-change-new-password"
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
              <FieldLabel htmlFor="profile-change-confirm-password">
                Confirm new password
              </FieldLabel>
              <FieldContent>
                <div className="relative">
                  <Input
                    {...field}
                    id="profile-change-confirm-password"
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
          !String(currentPasswordWatch ?? "").trim() ||
          !String(newPasswordWatch ?? "").trim() ||
          !String(confirmPasswordWatch ?? "").trim()
        }
      >
        {isSubmitting ? "Updating…" : "Update password"}
      </Button>
    </form>
  );
}
