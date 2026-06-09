"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { MobileBrand } from "@/components/mobile-brand";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  type ResetPasswordFormValues,
  resetPasswordSchema,
} from "@/schema/reset-password.schema";
import { useAuthStore } from "@/stores/auth-session";

export function ResetPasswordForm() {
  const router = useRouter();
  const setUserProfile = useAuthStore((s) => s.setUserProfile);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const { control, handleSubmit, clearErrors, setError, formState } = form;

  async function onSubmit(values: ResetPasswordFormValues) {
    clearErrors();
    try {
      await setPasswordWithSession(values.newPassword);
      const profile = await markPasswordLoginEnabled();
      setUserProfile(profile);
      await fetch("/api/auth/password-recovery", { method: "DELETE" }).catch(
        () => undefined,
      );
      toast.success("Password reset.");
      router.replace("/dashboard");
      router.refresh();
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Could not reset password.";
      setError("root", { type: "server", message });
      toast.error(message);
    }
  }

  return (
    <div className="flex min-h-dvh w-full flex-1 flex-col bg-background px-4 py-10 md:min-h-screen md:py-12">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
        <MobileBrand />

        <Card className="shadow-sm ring-border dark:ring-foreground/10">
          <CardHeader className="space-y-1 pb-2">
            <CardTitle className="font-heading text-xl">
              Reset password
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Choose a new password for your account.
            </p>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              noValidate
              onSubmit={handleSubmit(onSubmit)}
            >
              <FieldGroup className="gap-4">
                <Controller
                  name="newPassword"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid ? true : undefined}>
                      <FieldLabel htmlFor="reset-new-password">
                        New password
                      </FieldLabel>
                      <FieldContent>
                        <div className="relative">
                          <Input
                            {...field}
                            id="reset-new-password"
                            type={showNewPassword ? "text" : "password"}
                            autoComplete="new-password"
                            className="h-10 pr-10"
                            disabled={formState.isSubmitting}
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
                            disabled={formState.isSubmitting}
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
                      <FieldLabel htmlFor="reset-confirm-password">
                        Confirm password
                      </FieldLabel>
                      <FieldContent>
                        <div className="relative">
                          <Input
                            {...field}
                            id="reset-confirm-password"
                            type={showConfirmPassword ? "text" : "password"}
                            autoComplete="new-password"
                            className="h-10 pr-10"
                            disabled={formState.isSubmitting}
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
                            disabled={formState.isSubmitting}
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

              <FieldError errors={[formState.errors.root]} />

              <Button
                type="submit"
                disabled={formState.isSubmitting}
                className="h-10 w-full"
              >
                {formState.isSubmitting ? "Resetting..." : "Reset password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
