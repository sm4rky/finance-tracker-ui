"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import { Controller, useForm } from "react-hook-form";

import { GoogleIcon } from "@/components/google-icon";
import { MobileBrand } from "@/components/mobile-brand";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type LoginFormValues, loginSchema } from "@/schema/login";

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      remember: false,
    },
  });

  const { control, handleSubmit, formState } = form;

  function onSubmit(_data: LoginFormValues) {
    // Wire Supabase / API next
  }

  return (
    <div className="flex min-h-[100dvh] w-full flex-1 flex-col bg-background px-4 py-10 md:min-h-screen md:py-12">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
        <MobileBrand />

        <Card className="border-0 bg-transparent shadow-none ring-0 dark:bg-card dark:shadow-sm dark:ring-1 dark:ring-foreground/10">
        <CardHeader className="space-y-1 pb-2">
          <CardTitle className="font-heading text-xl">Login</CardTitle>
          <p className="text-sm text-muted-foreground">
            Sign in to your account
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
                name="username"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid ? true : undefined}>
                    <FieldLabel htmlFor="login-username">Username</FieldLabel>
                    <FieldContent>
                      <div className="relative">
                        <User
                          className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                          aria-hidden
                        />
                        <Input
                          {...field}
                          id="login-username"
                          type="text"
                          autoComplete="username"
                          placeholder="e.g. janedoe or blue_whale"
                          className="h-10 pl-9"
                          aria-invalid={fieldState.invalid}
                        />
                      </div>
                    </FieldContent>
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />

              <Controller
                name="password"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid ? true : undefined}>
                    <FieldLabel htmlFor="login-password">Password</FieldLabel>
                    <FieldContent>
                      <div className="relative">
                        <Lock
                          className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                          aria-hidden
                        />
                        <Input
                          {...field}
                          id="login-password"
                          type={showPassword ? "text" : "password"}
                          autoComplete="current-password"
                          placeholder="••••••••"
                          className="h-10 pr-10 pl-9"
                          aria-invalid={fieldState.invalid}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1.5 top-1/2 size-8 -translate-y-1/2 text-muted-foreground"
                          onClick={() => setShowPassword((v) => !v)}
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                          aria-pressed={showPassword}
                        >
                          {showPassword ? (
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

            <div className="flex flex-wrap items-center justify-between gap-2">
              <Controller
                name="remember"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="login-remember"
                      checked={field.value ?? false}
                      onCheckedChange={(v) => field.onChange(v === true)}
                    />
                    <Label htmlFor="login-remember" className="font-normal">
                      Remember me
                    </Label>
                  </div>
                )}
              />
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={formState.isSubmitting}
              className="h-10 w-full"
            >
              Sign In
            </Button>
          </form>

          <FieldSeparator className="my-6">
            Or continue with
          </FieldSeparator>

          <Button
            type="button"
            variant="outline"
            className="h-10 w-full gap-2"
          >
            <GoogleIcon className="size-4" />
            Continue with Google
          </Button>
        </CardContent>
      </Card>

      <nav
        className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-center text-xs text-muted-foreground"
        aria-label="Legal"
      >
        <Link
          href="/privacy-policy"
          className="underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          Privacy Policy
        </Link>
        <span className="hidden sm:inline" aria-hidden>
          ·
        </span>
        <Link
          href="/terms"
          className="underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          Terms
        </Link>
      </nav>
      </div>
    </div>
  );
}
