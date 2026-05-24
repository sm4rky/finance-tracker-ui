"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import { Controller, useForm } from "react-hook-form";

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
import { sendPasswordResetEmail } from "@/lib/supabase/client";
import {
  type ForgotPasswordFormValues,
  forgotPasswordSchema,
} from "@/schema/reset-password.schema";

export function ForgotPasswordForm() {
  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const { control, handleSubmit, clearErrors, setError, formState } = form;
  const submitted = formState.isSubmitSuccessful && !formState.errors.root;

  async function onSubmit(values: ForgotPasswordFormValues) {
    clearErrors();
    try {
      const { error } = await sendPasswordResetEmail(values.email);
      if (error) {
        throw new Error(error.message);
      }
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Could not send reset email.";
      setError("root", { type: "server", message });
    }
  }

  return (
    <div className="flex min-h-dvh w-full flex-1 flex-col bg-background px-4 py-10 md:min-h-screen md:py-12">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
        <MobileBrand />

        <Card className="shadow-sm ring-border dark:ring-foreground/10">
          <CardHeader className="space-y-1 pb-2">
            <CardTitle className="font-heading text-xl">
              Forgot password
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Enter your email and we will send a link to reset your password.
            </p>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <p className="mb-4 text-sm text-muted-foreground" role="status">
                If an account exists for that email, we sent a password reset
                link.
              </p>
            ) : null}

            <form className="space-y-4" noValidate onSubmit={handleSubmit(onSubmit)}>
              <FieldGroup className="gap-4">
                <Controller
                  name="email"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid ? true : undefined}>
                      <FieldLabel htmlFor="forgot-password-email">
                        Email
                      </FieldLabel>
                      <FieldContent>
                        <div className="relative">
                          <Mail
                            className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                            aria-hidden
                          />
                          <Input
                            {...field}
                            id="forgot-password-email"
                            type="email"
                            autoComplete="email"
                            placeholder="you@example.com"
                            className="h-10 pl-9"
                            disabled={formState.isSubmitting}
                            aria-invalid={fieldState.invalid}
                            onChange={(e) => {
                              clearErrors("root");
                              field.onChange(e);
                            }}
                          />
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
                {formState.isSubmitting ? "Sending..." : "Send reset link"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                Back to login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
