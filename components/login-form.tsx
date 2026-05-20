"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Controller, useForm } from "react-hook-form";

import { GoogleIcon } from "@/components/google-icon";
import { MobileBrand } from "@/components/mobile-brand";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { type LoginFormValues, loginSchema } from "@/schema/login.schema";
import {
  signInWithEmailPassword,
  signInWithGoogle,
} from "@/lib/supabase/client";

function oauthReturnPath(nextParam: string | null): string {
  if (nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//")) {
    return nextParam;
  }
  return "/dashboard";
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [credentialsError, setCredentialsError] = useState<string | null>(null);
  const oauthError = searchParams.get("error") === "oauth";

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { control, handleSubmit, formState } = form;

  async function handleSignInWithEmail(data: LoginFormValues) {
    setCredentialsError(null);
    try {
      const { error } = await signInWithEmailPassword(
        data.email,
        data.password,
      );
      if (error) {
        const msg =
          error.message === "Invalid login credentials"
            ? "Invalid email or password."
            : error.message;
        setCredentialsError(msg);
        return;
      }
      router.push(oauthReturnPath(searchParams.get("next")));
      router.refresh();
    } catch (e) {
      setCredentialsError(
        e instanceof Error ? e.message : "Could not sign in.",
      );
    }
  }

  async function handleContinueWithGoogle() {
    setGoogleError(null);
    setGoogleLoading(true);
    try {
      const { data, error } = await signInWithGoogle({
        next: oauthReturnPath(searchParams.get("next")),
      });
      if (error) {
        setGoogleError(error.message);
        return;
      }
      if (data?.url) {
        window.location.assign(data.url);
        return;
      }
    } catch (e) {
      setGoogleError(
        e instanceof Error ? e.message : "Could not start Google sign-in.",
      );
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh w-full flex-1 flex-col bg-background px-4 py-10 md:min-h-screen md:py-12">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
        <MobileBrand />

        <Card className="shadow-sm ring-border dark:ring-foreground/10">
          <CardHeader className="space-y-1 pb-2">
            <CardTitle className="font-heading text-xl">Login</CardTitle>
            <p className="text-sm text-muted-foreground">
              Sign in to your account
            </p>
          </CardHeader>
          <CardContent>
            {oauthError ? (
              <p className="mb-4 text-sm text-destructive" role="alert">
                Could not sign in with Google. Please try again.
              </p>
            ) : null}
            {googleError ? (
              <p className="mb-4 text-sm text-destructive" role="alert">
                {googleError}
              </p>
            ) : null}
            {credentialsError ? (
              <p className="mb-4 text-sm text-destructive" role="alert">
                {credentialsError}
              </p>
            ) : null}
            <form
              className="space-y-4"
              noValidate
              onSubmit={handleSubmit(handleSignInWithEmail)}
            >
              <FieldGroup className="gap-4">
                <Controller
                  name="email"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid ? true : undefined}>
                      <FieldLabel htmlFor="login-email">Email</FieldLabel>
                      <FieldContent>
                        <div className="relative">
                          <Mail
                            className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                            aria-hidden
                          />
                          <Input
                            {...field}
                            id="login-email"
                            type="email"
                            autoComplete="email"
                            placeholder="you@example.com"
                            className="h-10 pl-9"
                            aria-invalid={fieldState.invalid}
                            onChange={(e) => {
                              setCredentialsError(null);
                              field.onChange(e);
                            }}
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
                            onChange={(e) => {
                              setCredentialsError(null);
                              field.onChange(e);
                            }}
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

              <div className="flex justify-end">
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

            <FieldSeparator className="my-6">Or continue with</FieldSeparator>

            <Button
              type="button"
              variant="outline"
              className="h-10 w-full gap-2"
              disabled={googleLoading}
              onClick={handleContinueWithGoogle}
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
