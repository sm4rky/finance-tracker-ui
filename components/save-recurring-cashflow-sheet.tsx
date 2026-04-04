"use client";

import { useEffect, useId, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { LinkedBankResponse } from "@/interface/plaid";
import type {
  ProfileRecurringCashflowResponse,
  RecurringCashflowLinkedBankAccountResponse,
  SaveProfileRecurringCashflowRequest,
} from "@/interface/profile-recurring-cashflow";
import {
  createProfileRecurringCashflow,
  updateProfileRecurringCashflow,
} from "@/lib/api/profile-recurring-cashflows";
import { cn } from "@/lib/utils";
import {
  RECURRING_FREQUENCY_LABEL,
  RECURRING_FREQUENCY_SELECT_ORDER,
  saveRecurringCashflowFormSchema,
  type SaveRecurringCashflowFormValues,
} from "@/schema/save-recurring-cashflow.schema";
import {
  getPfcCategoryMeta,
  PFC_PRIMARY_CATEGORY_CODES,
  PFC_PRIMARY_UNCATEGORIZED_FILTER_CODE,
} from "@/components/transactions-filter";

const ACCOUNT_NONE_VALUE = "__none__";

function linkedBankAccountIdFromRecurring(
  r: ProfileRecurringCashflowResponse,
): string | null {
  return r.linkedBankAccountId ?? r.linkedBankAccount?.id ?? null;
}

function linkedBankAccountSelectLabel(
  a: RecurringCashflowLinkedBankAccountResponse,
): string {
  const base = a.name.trim();
  const mask = a.mask?.trim();
  if (!base && !mask) return "Linked account";
  const labelBase = base || "Account";
  return mask ? `${labelBase} ·•••${mask}` : labelBase;
}

function getSelectTriggerClassName(active: boolean): string {
  return cn(
    buttonVariants({ variant: active ? "secondary" : "outline", size: "sm" }),
    "h-8 gap-1.5 border-dashed font-normal",
  );
}

function getDefaultSaveRecurringCashflowFormValues(): SaveRecurringCashflowFormValues {
  return {
    linkedBankAccountId: null,
    direction: "outflow",
    merchantName: "",
    description: "",
    pfcPrimary: PFC_PRIMARY_UNCATEGORIZED_FILTER_CODE,
    pfcDetailed: "",
    frequency: "MONTHLY",
    lastAmount: undefined,
    expectedAmount: 0,
    firstDate: "",
    lastDate: "",
    predictedNextDate: "",
  };
}

function trimDateOrNull(s: string | undefined): string | null {
  const t = s?.trim() ?? "";
  return t === "" ? null : t;
}

function formValuesToSaveRequest(
  values: SaveRecurringCashflowFormValues,
): SaveProfileRecurringCashflowRequest {
  let pfcPrimary: string | null = values.pfcPrimary.trim();
  if (
    pfcPrimary === "" ||
    pfcPrimary === PFC_PRIMARY_UNCATEGORIZED_FILTER_CODE
  ) {
    pfcPrimary = null;
  }

  const pfcDetailed = values.pfcDetailed?.trim() || null;
  const merchantName = values.merchantName.trim() || null;

  return {
    linkedBankAccountId: values.linkedBankAccountId,
    direction: values.direction,
    merchantName,
    description: values.description.trim(),
    pfcPrimary,
    pfcDetailed,
    frequency: values.frequency,
    lastAmount: values.lastAmount === undefined ? null : values.lastAmount,
    expectedAmount: values.expectedAmount,
    firstDate: trimDateOrNull(values.firstDate),
    lastDate: trimDateOrNull(values.lastDate),
    predictedNextDate: trimDateOrNull(values.predictedNextDate),
  };
}

function normalizeYmd(date: string | null | undefined): string {
  if (date == null || date === "") return "";
  const t = date.trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(t)) return t.slice(0, 10);
  const d = new Date(t);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function recurringToFormValues(
  r: ProfileRecurringCashflowResponse,
): SaveRecurringCashflowFormValues {
  return {
    linkedBankAccountId: linkedBankAccountIdFromRecurring(r),
    direction: r.direction,
    merchantName: r.merchantName?.trim() ?? "",
    description: r.description?.trim() ?? "",
    pfcPrimary:
      r.pfcPrimary?.trim() || PFC_PRIMARY_UNCATEGORIZED_FILTER_CODE,
    pfcDetailed: r.pfcDetailed?.trim() ?? "",
    frequency: r.frequency,
    lastAmount: r.lastAmount ?? undefined,
    expectedAmount: r.expectedAmount,
    firstDate: normalizeYmd(r.firstDate),
    lastDate: normalizeYmd(r.lastDate),
    predictedNextDate: normalizeYmd(r.predictedNextDate),
  };
}

export type SaveRecurringCashflowSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  recurring: ProfileRecurringCashflowResponse | null;
  banks: LinkedBankResponse[];
};

export function SaveRecurringCashflowSheet({
  open,
  onOpenChange,
  mode,
  recurring,
  banks,
}: SaveRecurringCashflowSheetProps) {
  const queryClient = useQueryClient();
  const directionGroup = useId();

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
      ? linkedBankAccountIdFromRecurring(recurring)
      : null;
    if (orphanId && !seen.has(orphanId)) {
      const nested = recurring?.linkedBankAccount;
      const label =
        nested != null
          ? linkedBankAccountSelectLabel(nested)
          : "Opted out account";
      rows.unshift({
        id: orphanId,
        label,
      });
    }
    return rows;
  }, [banks, recurring]);

  const { control, handleSubmit, reset } = useForm<SaveRecurringCashflowFormValues>({
    resolver: zodResolver(saveRecurringCashflowFormSchema),
    defaultValues: getDefaultSaveRecurringCashflowFormValues(),
  });

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && recurring) {
      reset(recurringToFormValues(recurring));
    } else {
      reset(getDefaultSaveRecurringCashflowFormValues());
    }
  }, [open, mode, recurring, reset]);

  const saveMutation = useMutation({
    mutationFn: async (values: SaveRecurringCashflowFormValues) => {
      const payload = formValuesToSaveRequest(values);
      if (mode === "create") {
        return createProfileRecurringCashflow(payload);
      }
      if (!recurring?.id) throw new Error("Missing recurring cashflow id");
      return updateProfileRecurringCashflow(recurring.id, payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["profile-recurring-cashflows"],
      });
      toast.success(
        mode === "create"
          ? "Subscription added."
          : "Subscription updated.",
      );
      onOpenChange(false);
    },
  });

  const onSubmit = (values: SaveRecurringCashflowFormValues) => {
    saveMutation.mutate(values);
  };

  const busy = saveMutation.isPending;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={!busy}
        className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-md"
      >
        <SheetHeader className="border-b border-border/60 px-4 py-4 text-left">
          <SheetTitle>
            {mode === "create" ? "Add subscription" : "Edit subscription"}
          </SheetTitle>
          <SheetDescription>
            {mode === "create"
              ? "Track a recurring inflow or outflow linked to an account (optional)."
              : "Update this recurring cashflow."}
          </SheetDescription>
        </SheetHeader>

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
                        name={directionGroup}
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
                        name={directionGroup}
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
                        field.onChange(
                          v === ACCOUNT_NONE_VALUE ? null : v,
                        )
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
                const triggerMeta = getPfcCategoryMeta(field.value);
                return (
                  <Field data-invalid={fieldState.invalid ? true : undefined}>
                    <FieldLabel htmlFor="sub-pfc-primary">
                      Primary Category
                    </FieldLabel>
                    <FieldContent>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={busy}
                      >
                        <SelectTrigger
                          id="sub-pfc-primary"
                          aria-label={`Primary category: ${triggerMeta.displayName}`}
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
                                triggerMeta.badgeClassName,
                              )}
                            >
                              {triggerMeta.displayName}
                            </Badge>
                            <SelectValue className="sr-only" />
                          </span>
                        </SelectTrigger>
                        <SelectContent align="start" className="max-h-72">
                          {PFC_PRIMARY_CATEGORY_CODES.map((code) => {
                            const meta = getPfcCategoryMeta(code);
                            return (
                              <SelectItem key={code} value={code}>
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
                          })}
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
                        field.onChange(
                          v === "" ? undefined : Number(v),
                        );
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

            {saveMutation.error ? (
              <p className="text-sm text-destructive" role="alert">
                {saveMutation.error instanceof Error
                  ? saveMutation.error.message
                  : "Could not save recurring cashflow."}
              </p>
            ) : null}
          </FieldGroup>
        </form>

        <SheetFooter className="mt-auto flex-row gap-2 border-t border-border/60 bg-muted/30 px-4 py-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            disabled={busy}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="recurring-cashflow-save-form"
            className="flex-1 gap-2"
            disabled={busy}
          >
            {busy ? (
              <>
                <Loader2Icon className="size-4 animate-spin" aria-hidden />
                Saving…
              </>
            ) : mode === "create" ? (
              "Add"
            ) : (
              "Save"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
