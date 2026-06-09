"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Check, ChevronDown } from "lucide-react";

import { CreateBudgetAccountsMultiSelect } from "@/components/create-budget-accounts-multi-select";
import {
  CreateBudgetCategoryMultiSelect,
  type CreateBudgetCategoryOption,
} from "@/components/create-budget-category-multi-select";

import { buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import type { LinkedBankResponse } from "@/interface/plaid";
import type { CreateProfileBudgetRequest } from "@/interface/profile-budget";
import type { ProfileCustomCategorySetResponse } from "@/interface/profile-custom-category";
import { BUDGET_PERIOD_LABEL, BUDGET_PERIOD } from "@/lib/budget-period";
import { getCustomCategoryColorSet } from "@/lib/custom-category-colors";
import {
  PFC_PRIMARY_WITHOUT_UNCATEGORIZED,
  getPfcPrmaryMeta,
} from "@/lib/pfc-primary";
import { cn } from "@/lib/utils";
import {
  createBudgetFormSchema,
  type CreateBudgetFormValues,
} from "@/schema/create-budget.schema";

const PFC_VERSION = "V2";
const DEFAULT_CATEGORY_SET_LABEL = "Default categories";

const PFC_CATEGORY_OPTIONS: CreateBudgetCategoryOption[] =
  PFC_PRIMARY_WITHOUT_UNCATEGORIZED.map((id) => {
    const meta = getPfcPrmaryMeta(id);
    return {
      id,
      label: meta.displayName,
      badgeClassName: meta.badgeClassName,
    };
  });

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function defaultFormValues(): CreateBudgetFormValues {
  return {
    name: "",
    amountLimit: 0,
    isRecurring: false,
    periodType: "MONTHLY",
    startDate: todayIsoDate(),
    endDate: "",
    profileCustomCategorySetId: "",
    pfcPrimaryCodes: [],
    customCategoryIds: [],
    linkedBankAccountIds: [],
    includeIncome: false,
    includeUnlinkedTransactions: false,
  };
}

function selectTriggerClassName(active: boolean): string {
  return cn(
    buttonVariants({ variant: active ? "secondary" : "outline", size: "sm" }),
    "h-8 gap-1.5 border-dashed font-normal",
  );
}

export function formValuesToCreateBudgetRequest(
  values: CreateBudgetFormValues,
): CreateProfileBudgetRequest {
  const usesCustomCategories = values.customCategoryIds.length > 0;

  return {
    name: values.name.trim(),
    amountLimit: values.amountLimit,
    isRecurring: values.isRecurring,
    periodType: values.isRecurring ? values.periodType : null,
    startDate: values.startDate,
    endDate: values.isRecurring ? values.endDate || null : values.endDate,
    profileCustomCategorySetId: usesCustomCategories
      ? values.profileCustomCategorySetId
      : null,
    includeIncome: values.includeIncome,
    includeUnlinkedTransactions: values.includeUnlinkedTransactions,
    categories: usesCustomCategories
      ? values.customCategoryIds.map((customCategoryId) => ({
          customCategoryId,
        }))
      : values.pfcPrimaryCodes.map((pfcPrimaryCode) => ({
          pfcPrimaryCode,
          pfcVersion: PFC_VERSION,
        })),
    linkedBankAccountIds: values.linkedBankAccountIds,
  };
}

export type CreateBudgetFormProps = {
  open: boolean;
  banks: LinkedBankResponse[];
  categorySets: ProfileCustomCategorySetResponse[];
  busy: boolean;
  error: unknown;
  onSubmit: (values: CreateBudgetFormValues) => void;
};

export function CreateBudgetForm({
  open,
  banks,
  categorySets,
  busy,
  error,
  onSubmit,
}: CreateBudgetFormProps) {
  const budgetTypeRadioGroupName = useId();
  const [categorySetMenuOpen, setCategorySetMenuOpen] = useState(false);

  const { control, clearErrors, handleSubmit, reset, setValue, formState } =
    useForm<CreateBudgetFormValues>({
      resolver: zodResolver(createBudgetFormSchema),
      defaultValues: defaultFormValues(),
      shouldUnregister: false,
    });

  useEffect(() => {
    if (!open) return;
    reset(defaultFormValues());
  }, [open, reset]);

  const isRecurring = useWatch({ control, name: "isRecurring" });
  const profileCustomCategorySetId = useWatch({
    control,
    name: "profileCustomCategorySetId",
  });
  const selectedCustomCategorySet =
    categorySets.find(({ id }) => id === profileCustomCategorySetId) ?? null;
  const categorySetDropdownLabel = selectedCustomCategorySet
    ? selectedCustomCategorySet.name
    : DEFAULT_CATEGORY_SET_LABEL;
  const customCategoryOptions = useMemo<CreateBudgetCategoryOption[]>(
    () =>
      selectedCustomCategorySet?.categories.map((category) => {
        const colorSet = getCustomCategoryColorSet(category.colorSet);
        return {
          id: category.id,
          label: category.name || "Untitled category",
          badgeClassName: colorSet.badgeClassName,
        };
      }) ?? [],
    [selectedCustomCategorySet],
  );

  function clearCategoryErrors() {
    clearErrors([
      "profileCustomCategorySetId",
      "customCategoryIds",
      "pfcPrimaryCodes",
    ]);
  }

  function selectDefaultCategorySet() {
    setValue("profileCustomCategorySetId", "", { shouldDirty: true });
    setValue("pfcPrimaryCodes", [], { shouldDirty: true });
    setValue("customCategoryIds", [], { shouldDirty: true });
    clearCategoryErrors();
    setCategorySetMenuOpen(false);
  }

  function selectCustomCategorySet(categorySetId: string) {
    setValue("profileCustomCategorySetId", categorySetId, {
      shouldDirty: true,
    });
    setValue("pfcPrimaryCodes", [], { shouldDirty: true });
    setValue("customCategoryIds", [], { shouldDirty: true });
    clearCategoryErrors();
    setCategorySetMenuOpen(false);
  }

  return (
    <form
      id="create-budget-form"
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
              <FieldLabel htmlFor="budget-name">Name</FieldLabel>
              <FieldContent>
                <Input
                  id="budget-name"
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
              <FieldLabel htmlFor="budget-limit">Limit amount</FieldLabel>
              <FieldContent>
                <Input
                  id="budget-limit"
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

        <Controller
          name="includeIncome"
          control={control}
          render={({ field }) => (
            <Field orientation="horizontal">
              <Checkbox
                id="budget-include-income"
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(checked === true)}
                disabled={busy}
              />
              <FieldLabel
                htmlFor="budget-include-income"
                className="font-normal"
              >
                Include income
              </FieldLabel>
            </Field>
          )}
        />

        <Controller
          name="isRecurring"
          control={control}
          render={({ field }) => (
            <Field data-disabled={busy ? true : undefined}>
              <FieldLabel>Budget type</FieldLabel>
              <FieldContent className="flex flex-row flex-wrap items-center gap-x-6 gap-y-2 p-0">
                <label className="inline-flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name={budgetTypeRadioGroupName}
                    className="size-4 shrink-0 accent-primary"
                    checked={!field.value}
                    disabled={busy}
                    onChange={() => field.onChange(false)}
                  />
                  <span className="text-sm font-medium">Fixed</span>
                </label>
                <label className="inline-flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name={budgetTypeRadioGroupName}
                    className="size-4 shrink-0 accent-primary"
                    checked={field.value}
                    disabled={busy}
                    onChange={() => field.onChange(true)}
                  />
                  <span className="text-sm font-medium">Recurring</span>
                </label>
              </FieldContent>
            </Field>
          )}
        />

        {isRecurring ? (
          <Controller
            name="periodType"
            control={control}
            render={({ field }) => (
              <Field data-disabled={busy ? true : undefined}>
                <FieldLabel>Period</FieldLabel>
                <FieldContent>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={busy}
                  >
                    <SelectTrigger
                      id="budget-period"
                      className={cn(
                        selectTriggerClassName(true),
                        "h-10 min-h-10 w-full py-2 text-sm",
                      )}
                    >
                      <span className="min-w-0 flex-1 truncate text-left">
                        {BUDGET_PERIOD_LABEL[field.value]}
                      </span>
                    </SelectTrigger>
                    <SelectContent align="start" className="max-h-72">
                      {BUDGET_PERIOD.map((periodType) => (
                        <SelectItem key={periodType} value={periodType}>
                          {BUDGET_PERIOD_LABEL[periodType]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FieldContent>
              </Field>
            )}
          />
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            name="startDate"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid ? true : undefined}>
                <FieldLabel htmlFor="budget-start-date">Start date</FieldLabel>
                <FieldContent>
                  <Input
                    id="budget-start-date"
                    type="date"
                    disabled={busy}
                    {...field}
                  />
                  <FieldError errors={[fieldState.error]} />
                </FieldContent>
              </Field>
            )}
          />

          <Controller
            name="endDate"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid ? true : undefined}>
                <FieldLabel htmlFor="budget-end-date">
                  End date {isRecurring ? "(Optional)" : null}
                </FieldLabel>
                <FieldContent>
                  <Input
                    id="budget-end-date"
                    type="date"
                    disabled={busy}
                    {...field}
                  />
                  <FieldError errors={[fieldState.error]} />
                </FieldContent>
              </Field>
            )}
          />
        </div>

        <Field data-disabled={busy ? true : undefined}>
          <FieldLabel>Categories Set</FieldLabel>
          <FieldContent>
            <DropdownMenu
              open={categorySetMenuOpen}
              onOpenChange={setCategorySetMenuOpen}
              modal={false}
            >
              <DropdownMenuTrigger
                type="button"
                disabled={busy}
                aria-label="Budget category set"
                className={cn(
                  buttonVariants({
                    variant: categorySetMenuOpen ? "secondary" : "outline",
                    size: "sm",
                  }),
                  "h-10 min-h-10 w-full justify-start gap-1.5 border-dashed py-2 text-sm font-normal",
                )}
              >
                <span className="min-w-0 flex-1 truncate text-left">
                  {categorySetDropdownLabel}
                </span>
                <ChevronDown
                  className={cn(
                    "size-4 shrink-0 transition-transform",
                    categorySetMenuOpen && "rotate-180",
                  )}
                  aria-hidden
                />
              </DropdownMenuTrigger>

              <DropdownMenuContent align="start" className="w-72 p-1">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-[11px] font-semibold uppercase tracking-wide">
                    Categories Set
                  </DropdownMenuLabel>
                  <DropdownMenuItem
                    className={cn(
                      "cursor-pointer gap-2",
                      !profileCustomCategorySetId && "bg-accent",
                    )}
                    onClick={selectDefaultCategorySet}
                  >
                    <span className="min-w-0 flex-1 truncate">
                      {DEFAULT_CATEGORY_SET_LABEL}
                    </span>
                    {!profileCustomCategorySetId ? (
                      <Check className="size-4 shrink-0" aria-hidden />
                    ) : null}
                  </DropdownMenuItem>
                </DropdownMenuGroup>

                {categorySets.length > 0 ? (
                  <DropdownMenuGroup>
                    {categorySets.map((categorySet) => {
                      const selected =
                        profileCustomCategorySetId === categorySet.id;

                      return (
                        <DropdownMenuItem
                          key={categorySet.id}
                          className={cn(
                            "cursor-pointer gap-2",
                            selected && "bg-accent",
                          )}
                          onClick={() =>
                            selectCustomCategorySet(categorySet.id)
                          }
                        >
                          <span className="min-w-0 flex-1 truncate">
                            {categorySet.name}
                          </span>
                          {selected ? (
                            <Check className="size-4 shrink-0" aria-hidden />
                          ) : null}
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuGroup>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
            {formState.errors.profileCustomCategorySetId ? (
              <FieldError
                errors={[formState.errors.profileCustomCategorySetId]}
              />
            ) : null}
          </FieldContent>
        </Field>

        <div className={cn(profileCustomCategorySetId && "hidden")}>
          <Controller
            name="pfcPrimaryCodes"
            control={control}
            render={({ field, fieldState }) => (
              <CreateBudgetCategoryMultiSelect
                options={PFC_CATEGORY_OPTIONS}
                value={field.value}
                disabled={busy}
                emptyMessage="No categories"
                error={fieldState.error}
                onChange={field.onChange}
              />
            )}
          />
        </div>

        <div className={cn(!profileCustomCategorySetId && "hidden")}>
          <Controller
            name="customCategoryIds"
            control={control}
            render={({ field, fieldState }) => (
              <CreateBudgetCategoryMultiSelect
                options={customCategoryOptions}
                value={field.value}
                disabled={busy}
                emptyMessage="Select a custom category set first."
                error={fieldState.error}
                onChange={field.onChange}
              />
            )}
          />
        </div>

        <Controller
          name="linkedBankAccountIds"
          control={control}
          render={({ field, fieldState }) => (
            <CreateBudgetAccountsMultiSelect
              banks={banks}
              value={field.value}
              disabled={busy}
              error={fieldState.error}
              onChange={field.onChange}
            />
          )}
        />

        <Controller
          name="includeUnlinkedTransactions"
          control={control}
          render={({ field }) => (
            <Field orientation="horizontal">
              <Checkbox
                id="budget-include-unlinked"
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(checked === true)}
                disabled={busy}
              />
              <FieldLabel
                htmlFor="budget-include-unlinked"
                className="font-normal"
              >
                Include unlinked transactions
              </FieldLabel>
            </Field>
          )}
        />

        {error ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error instanceof Error ? error.message : "Could not save budget."}
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
