"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AtSign } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { setProfileUsername } from "@/lib/api/users";
import {
  type ProfileUsernameFormValues,
  profileUsernameSchema,
} from "@/schema/profile-username.schema";
import { useAuthStore } from "@/stores/auth-session";

export function ProfileUsernameSection() {
  const profile = useAuthStore((s) => s.userProfile);
  const setUserProfile = useAuthStore((s) => s.setUserProfile);

  const username = profile?.username?.trim() ?? "";

  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProfileUsernameFormValues>({
    resolver: zodResolver(profileUsernameSchema),
    defaultValues: { username: "" },
  });

  const { control, handleSubmit, watch, clearErrors, setError } = form;

  async function onSubmitUsername(values: ProfileUsernameFormValues) {
    clearErrors("username");
    setIsSubmitting(true);
    try {
      const updatedProfile = await setProfileUsername(values.username.trim());
      setUserProfile(updatedProfile);
      toast.success("Username saved.");
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Could not save username.";
      setError("username", { type: "server", message });
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <div className="flex min-w-0 items-center gap-2 text-sm font-medium">
        <AtSign className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <span className="min-w-0">Username</span>
      </div>

      <div className="mt-4 sm:mt-5">
        {username !== "" ? (
          <div className="space-y-2">
            <Label htmlFor="profile-username-locked">Username</Label>
            <Input
              id="profile-username-locked"
              disabled
              value={username}
              placeholder="—"
              autoComplete="username"
            />
          </div>
        ) : (
          <form
            className="space-y-4"
            noValidate
            onSubmit={handleSubmit(onSubmitUsername)}
          >
            <FieldGroup className="gap-4">
              <Controller
                name="username"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid ? true : undefined}>
                    <FieldLabel htmlFor="profile-username">Username</FieldLabel>
                    <FieldContent>
                      <Input
                        {...field}
                        id="profile-username"
                        type="text"
                        autoComplete="username"
                        placeholder="e.g. blue_whale"
                        aria-invalid={fieldState.invalid}
                        disabled={isSubmitting}
                        onChange={(e) => {
                          clearErrors("username");
                          field.onChange(e);
                        }}
                      />
                    </FieldContent>
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            </FieldGroup>

            <Button
              type="submit"
              disabled={
                isSubmitting || !String(watch("username") ?? "").trim()
              }
            >
              {isSubmitting ? "Saving…" : "Save"}
            </Button>
          </form>
        )}
      </div>
    </>
  );
}
