"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
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
  SelectValue,
} from "@/components/ui/select";
import type { LinkedBankResponse } from "@/interface/plaid";
import type {
  ProfileRecurringCashflowResponse,
  SaveProfileRecurringCashflowRequest,
} from "@/interface/profile-recurring-cashflow";
import {
  PFC_PRIMARY,
  UNCATEGORIZED_PFC_PRIMARY,
  getPfcPrmaryMeta,
} from "@/lib/pfc-primary";
import { cn } from "@/lib/utils";
import {
  RECURRING_FREQUENCY_LABEL,
  RECURRING_FREQUENCY_SELECT_ORDER,
  saveRecurringCashflowFormSchema,
  type SaveRecurringCashflowFormValues,
} from "@/schema/save-recurring-cashflow.schema";

const ACCOUNT_NONE_VALUE = "__none__";

function getDefaultSaveRecurringCashflowFormValues(): SaveRecurringCashflowFormValues {
  return {
    merchantName: "",
    description: "",
    direction: "outflow",
    linkedBankAccountId: null,
    pfcPrimary: UNCATEGORIZED_PFC_PRIMARY,
    pfcDetailed: "",
    frequency: "MONTHLY",
    expectedAmount: 0,
    lastAmount: undefined,
    firstDate: "",
    lastDate: "",
    predictedNextDate: "",
  };
}

function normalizeTextDateToYmd(date: string | null | undefined): string {
  if (date == null || date === "") return "";
  const t = date.trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(t)) return t.slice(0, 10);
  const d = new Date(t);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function recurringCashflowResponseToFormValues(
  recurringCashflow: ProfileRecurringCashflowResponse,
): SaveRecurringCashflowFormValues {
  return {
    merchantName: recurringCashflow.merchantName?.trim() ?? "",
    description: recurringCashflow.description?.trim() ?? "",
    direction: recurringCashflow.direction,
    linkedBankAccountId: recurringCashflow.linkedBankAccount?.id ?? null,
    pfcPrimary:
      recurringCashflow.pfcPrimary?.trim() || UNCATEGORIZED_PFC_PRIMARY,
    pfcDetailed: recurringCashflow.pfcDetailed?.trim() ?? "",
    frequency: recurringCashflow.frequency,
    expectedAmount: recurringCashflow.expectedAmount,
    lastAmount: recurringCashflow.lastAmount ?? undefined,
    firstDate: normalizeTextDateToYmd(recurringCashflow.firstDate),
    lastDate: normalizeTextDateToYmd(recurringCashflow.lastDate),
    predictedNextDate: normalizeTextDateToYmd(
      recurringCashflow.predictedNextDate,
    ),
  };
}

function trimDateOrNull(date: string | undefined): string | null {
  const trimmed = date?.trim() ?? "";
  return trimmed === "" ? null : trimmed;
}

export function formValuesToSaveRecurringCashflowRequest(
  values: SaveRecurringCashflowFormValues,
): SaveProfileRecurringCashflowRequest {
  let pfcPrimary: string | null = values.pfcPrimary.trim();
  if (
    pfcPrimary === "" ||
    pfcPrimary === UNCATEGORIZED_PFC_PRIMARY
  ) {
    pfcPrimary = null;
  }

  const pfcDetailed = values.pfcDetailed?.trim() || null;
  const merchantName = values.merchantName.trim() || null;

  return {
    merchantName,
    description: values.description.trim(),
    direction: values.direction,
    linkedBankAccountId: values.linkedBankAccountId,
    pfcPrimary,
    pfcDetailed,
    frequency: values.frequency,
    expectedAmount: values.expectedAmount,
    lastAmount: values.lastAmount === undefined ? null : values.lastAmount,
    firstDate: trimDateOrNull(values.firstDate),
    lastDate: trimDateOrNull(values.lastDate),
    predictedNextDate: trimDateOrNull(values.predictedNextDate),
  };
}

function getSelectTriggerClassName(active: boolean): string {
  return cn(
    buttonVariants({ variant: active ? "secondary" : "outline", size: "sm" }),
    "h-8 gap-1.5 border-dashed font-normal",
  );
}

export type SaveRecurringCashflowFormProps = {
  open: boolean;
  mode: "create" | "edit";
  recurring: ProfileRecurringCashflowResponse | null;
  banks: LinkedBankResponse[];
  busy: boolean;
  error: unknown;
  onSubmit: (values: SaveRecurringCashflowFormValues) => void;
};

export function SaveRecurringCashflowForm({
  open,
  mode,
  recurring,
  banks,
  busy,
  error,
  onSubmit,
}: SaveRecurringCashflowFormProps) {
  const directionRadioGroupName = useId();
  const [pfcPrimarySearch, setPfcPrimarySearch] = useState("");

  const accountOptions = useMemo(() => {
    const rows: { id: string; label: string }[] = [];
    const seen = new Set<string>();
    for (const bank of banks) {
      for (const account of bank.accounts) {
        const base =
          account.officialName?.trim() ||
          account.accountName.trim() ||
          "Account";
        const label = account.mask
          ? `${bank.institutionName ?? "Bank"} · ${base} ·•••${account.mask}`
          : `${bank.institutionName ?? "Bank"} · ${base}`;
        rows.push({ id: account.id, label });
        seen.add(account.id);
      }
    }
    const orphanId = recurring
      ? recurring.linkedBankAccount?.id ?? null
      : null;
    if (orphanId && recurring && !seen.has(orphanId)) {
      rows.unshift({
        id: orphanId,
        label: "Opted out account",
      });
    }
    return rows;
  }, [banks, recurring]);

  const filteredPfcPrimary = useMemo(() => {
    const keyword = pfcPrimarySearch.trim().toLowerCase();
    if (!keyword) return PFC_PRIMARY;

    return PFC_PRIMARY.filter((pfcPrimary) =>
      pfcPrimary.toLowerCase().includes(keyword),
    );
  }, [pfcPrimarySearch]);

  const { control, handleSubmit, reset } =
    useForm<SaveRecurringCashflowFormValues>({
      resolver: zodResolver(saveRecurringCashflowFormSchema),
      defaultValues: getDefaultSaveRecurringCashflowFormValues(),
    });

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && recurring) {
      reset(recurringCashflowResponseToFormValues(recurring));
    } else {
      reset(getDefaultSaveRecurringCashflowFormValues());
    }
  }, [open, mode, recurring, reset]);

  return (
    <form
      id="recurring-cashflow-save-form"
      className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-4"
      noValidate
      onSubmit={handleSubmit(onSubmit)}
    >
      <FieldGroup className="gap-4">
        <Controller
          name="merchantName"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid ? true : undefined}>
              <FieldLabel htmlFor="sub-merchant">
                Merchant name (optional)
              </FieldLabel>
              <FieldContent>
                <Input
                  id="sub-merchant"
                  type="text"
                  autoComplete="off"
                  disabled={busy}
                  placeholder="e.g. Amazon Prime"
                  {...field}
                />
                <FieldError errors={[fieldState.error]} />
              </FieldContent>
            </Field>
          )}
        />

        <Controller
          name="description"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid ? true : undefined}>
              <FieldLabel htmlFor="sub-description">
                Description (optional)
              </FieldLabel>
              <FieldContent>
                <Input
                  id="sub-description"
                  type="text"
                  autoComplete="off"
                  disabled={busy}
                  placeholder="e.g. Rent, Salary"
                  {...field}
                />
                <FieldError errors={[fieldState.error]} />
              </FieldContent>
            </Field>
          )}
        />

        <Controller
          name="direction"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid ? true : undefined}>
              <FieldLabel>Direction</FieldLabel>
              <FieldContent className="flex flex-row flex-wrap items-center gap-x-6 gap-y-2 p-0">
                <label className="inline-flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name={directionRadioGroupName}
                    className="size-4 shrink-0 accent-primary"
                    checked={field.value === "outflow"}
                    disabled={busy}
                    onChange={() => field.onChange("outflow")}
                  />
                  <span className="text-sm font-medium text-destructive">
                    Outflow
                  </span>
                </label>
                <label className="inline-flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name={directionRadioGroupName}
                    className="size-4 shrink-0 accent-primary"
                    checked={field.value === "inflow"}
                    disabled={busy}
                    onChange={() => field.onChange("inflow")}
                  />
                  <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    Inflow
                  </span>
                </label>
              </FieldContent>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <Controller
          name="linkedBankAccountId"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid ? true : undefined}>
              <FieldLabel htmlFor="sub-account">Account</FieldLabel>
              <FieldContent>
                <Select
                  value={field.value ?? ACCOUNT_NONE_VALUE}
                  onValueChange={(v) =>
                    field.onChange(v === ACCOUNT_NONE_VALUE ? null : v)
                  }
                  disabled={busy}
                >
                  <SelectTrigger
                    id="sub-account"
                    className={cn(
                      getSelectTriggerClassName(field.value != null),
                      "h-10 min-h-10 w-full py-2 text-sm",
                    )}
                  >
                    <SelectValue placeholder="No account" />
                  </SelectTrigger>
                  <SelectContent
                    align="start"
                    side="bottom"
                    sideOffset={4}
                    className="max-h-72"
                  >
                    <SelectItem value={ACCOUNT_NONE_VALUE}>
                      No account (unlinked)
                    </SelectItem>
                    {accountOptions.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={[fieldState.error]} />
              </FieldContent>
            </Field>
          )}
        />

        <Controller
          name="pfcPrimary"
          control={control}
          render={({ field, fieldState }) => {
            const meta = getPfcPrmaryMeta(field.value);
            return (
              <Field data-invalid={fieldState.invalid ? true : undefined}>
                <FieldLabel htmlFor="sub-pfc-primary">
                  Primary Category
                </FieldLabel>
                <FieldContent>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    onOpenChange={(nextOpen) => {
                      if (!nextOpen) setPfcPrimarySearch("");
                    }}
                    disabled={busy}
                  >
                    <SelectTrigger
                      id="sub-pfc-primary"
                      aria-label={`Primary category: ${meta.displayName}`}
                      className={cn(
                        getSelectTriggerClassName(true),
                        "h-10 min-h-10 w-full py-2",
                      )}
                    >
                      <span className="flex min-w-0 flex-1 items-center">
                        <Badge
                          aria-hidden
                          variant="outline"
                          className={cn(
                            "max-w-[min(100%,16rem)] truncate border font-normal text-xs",
                            meta.badgeClassName,
                          )}
                        >
                          {meta.displayName}
                        </Badge>
                        <SelectValue className="sr-only" />
                      </span>
                    </SelectTrigger>
                    <SelectContent align="start" className="max-h-72">
                      <div
                        className="px-1 py-1.5"
                        onPointerDown={(e) => e.stopPropagation()}
                      >
                        <Input
                          placeholder="Search categories…"
                          value={pfcPrimarySearch}
                          onChange={(e) => setPfcPrimarySearch(e.target.value)}
                          className="h-8 text-sm"
                          autoComplete="off"
                          aria-label="Search categories"
                          onPointerDown={(e) => e.stopPropagation()}
                          onKeyDown={(e) => e.stopPropagation()}
                          onKeyUp={(e) => e.stopPropagation()}
                        />
                      </div>

                      {filteredPfcPrimary.length === 0 ? (
                        <p className="px-2 py-3 text-center text-sm text-muted-foreground">
                          No matches
                        </p>
                      ) : (
                        filteredPfcPrimary.map((pfcPrimary) => {
                          const meta = getPfcPrmaryMeta(pfcPrimary);
                          return (
                            <SelectItem key={pfcPrimary} value={pfcPrimary}>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "max-w-[min(100%,16rem)] truncate border font-normal text-xs",
                                  meta.badgeClassName,
                                )}
                              >
                                {meta.displayName}
                              </Badge>
                            </SelectItem>
                          );
                        })
                      )}
                    </SelectContent>
                  </Select>
                  <FieldError errors={[fieldState.error]} />
                </FieldContent>
              </Field>
            );
          }}
        />

        <Controller
          name="pfcDetailed"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid ? true : undefined}>
              <FieldLabel htmlFor="sub-pfc-detailed">
                Detailed category (optional)
              </FieldLabel>
              <FieldContent>
                <Input
                  id="sub-pfc-detailed"
                  type="text"
                  autoComplete="off"
                  disabled={busy}
                  placeholder="e.g. FAST_FOOD"
                  {...field}
                />
                <FieldError errors={[fieldState.error]} />
              </FieldContent>
            </Field>
          )}
        />

        <Controller
          name="frequency"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid ? true : undefined}>
              <FieldLabel htmlFor="sub-frequency">Frequency</FieldLabel>
              <FieldContent>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={busy}
                >
                  <SelectTrigger
                    id="sub-frequency"
                    className={cn(
                      getSelectTriggerClassName(true),
                      "h-10 min-h-10 w-full py-2 text-sm",
                    )}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent align="start" className="max-h-72">
                    {RECURRING_FREQUENCY_SELECT_ORDER.map((freq) => (
                      <SelectItem key={freq} value={freq}>
                        {RECURRING_FREQUENCY_LABEL[freq]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={[fieldState.error]} />
              </FieldContent>
            </Field>
          )}
        />

        <Controller
          name="expectedAmount"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid ? true : undefined}>
              <FieldLabel htmlFor="sub-expected">Expected amount</FieldLabel>
              <FieldContent>
                <Input
                  id="sub-expected"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="0.01"
                  disabled={busy}
                  {...field}
                  value={Number.isNaN(field.value) ? "" : field.value}
                  onChange={(e) => {
                    const v = e.target.value;
                    field.onChange(v === "" ? 0 : Number(v));
                  }}
                />
                <FieldError errors={[fieldState.error]} />
              </FieldContent>
            </Field>
          )}
        />

        <Controller
          name="lastAmount"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid ? true : undefined}>
              <FieldLabel htmlFor="sub-last">
                Last amount (optional)
              </FieldLabel>
              <FieldContent>
                <Input
                  id="sub-last"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="0.01"
                  disabled={busy}
                  value={
                    field.value === undefined || field.value === null
                      ? ""
                      : field.value
                  }
                  onChange={(e) => {
                    const v = e.target.value;
                    field.onChange(v === "" ? undefined : Number(v));
                  }}
                />
                <FieldError errors={[fieldState.error]} />
              </FieldContent>
            </Field>
          )}
        />

        <Controller
          name="firstDate"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid ? true : undefined}>
              <FieldLabel htmlFor="sub-first">
                First date (optional)
              </FieldLabel>
              <FieldContent>
                <Input
                  id="sub-first"
                  type="date"
                  disabled={busy}
                  {...field}
                  value={field.value ?? ""}
                />
                <FieldError errors={[fieldState.error]} />
              </FieldContent>
            </Field>
          )}
        />

        <Controller
          name="lastDate"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid ? true : undefined}>
              <FieldLabel htmlFor="sub-last-date">
                Last date (optional)
              </FieldLabel>
              <FieldContent>
                <Input
                  id="sub-last-date"
                  type="date"
                  disabled={busy}
                  {...field}
                  value={field.value ?? ""}
                />
                <FieldError errors={[fieldState.error]} />
              </FieldContent>
            </Field>
          )}
        />

        <Controller
          name="predictedNextDate"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid ? true : undefined}>
              <FieldLabel htmlFor="sub-next">
                Predicted next date (optional)
              </FieldLabel>
              <FieldContent>
                <Input
                  id="sub-next"
                  type="date"
                  disabled={busy}
                  {...field}
                  value={field.value ?? ""}
                />
                <FieldError errors={[fieldState.error]} />
              </FieldContent>
            </Field>
          )}
        />

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error instanceof Error
              ? error.message
              : "Could not save recurring cashflow."}
          </p>
        ) : null}
      </FieldGroup>
    </form>
  );
}
