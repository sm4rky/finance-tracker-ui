"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type {
  ProfileBudgetResponse,
  UpdateProfileBudgetRequest,
} from "@/interface/profile-budget";
import {
  updateBudgetFormSchema,
  type UpdateBudgetFormValues,
} from "@/schema/update-budget.schema";

type UpdateBudgetFormProps = {
  open: boolean;
  budget: ProfileBudgetResponse | null;
  busy: boolean;
  error: unknown;
  onSubmit: (values: UpdateBudgetFormValues) => void;
};

function defaultFormValues(
  budget: ProfileBudgetResponse | null,
): UpdateBudgetFormValues {
  return {
    name: budget?.name ?? "",
    amountLimit: budget?.amountLimit ?? 0,
  };
}

export function formValuesToUpdateBudgetRequest(
  values: UpdateBudgetFormValues,
  budget: ProfileBudgetResponse,
): UpdateProfileBudgetRequest {
  return {
    name: values.name.trim(),
    amountLimit: values.amountLimit,
    isActive: budget.isActive,
  };
}

export function UpdateBudgetForm({
  open,
  budget,
  busy,
  error,
  onSubmit,
}: UpdateBudgetFormProps) {
  const { control, handleSubmit, reset, formState } =
    useForm<UpdateBudgetFormValues>({
      resolver: zodResolver(updateBudgetFormSchema),
      defaultValues: defaultFormValues(budget),
    });

  useEffect(() => {
    if (!open) return;
    reset(defaultFormValues(budget));
  }, [budget, open, reset]);

  return (
    <form
      id="update-budget-form"
      className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-4"
      noValidate
      onSubmit={handleSubmit(onSubmit)}
    >
      <FieldGroup className="gap-4">
        <Controller
          name="name"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid ? true : undefined}>
              <FieldLabel htmlFor="update-budget-name">Name</FieldLabel>
              <FieldContent>
                <Input
                  id="update-budget-name"
                  type="text"
                  autoComplete="off"
                  disabled={busy}
                  placeholder="e.g. Monthly groceries"
                  {...field}
                />
                <FieldError errors={[fieldState.error]} />
              </FieldContent>
            </Field>
          )}
        />

        <Controller
          name="amountLimit"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid ? true : undefined}>
              <FieldLabel htmlFor="update-budget-limit">
                Limit amount
              </FieldLabel>
              <FieldContent>
                <Input
                  id="update-budget-limit"
                  type="number"
                  min="0"
                  step="0.01"
                  disabled={busy}
                  placeholder="500"
                  value={field.value}
                  onChange={(event) => field.onChange(event.target.value)}
                />
                <FieldError errors={[fieldState.error]} />
              </FieldContent>
            </Field>
          )}
        />

        {error ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error instanceof Error
              ? error.message
              : "Could not update budget."}
          </div>
        ) : null}

        {formState.errors.root ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {formState.errors.root.message}
          </div>
        ) : null}
      </FieldGroup>
    </form>
  );
}
