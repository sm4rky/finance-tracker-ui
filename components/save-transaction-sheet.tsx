"use client";

import { useEffect, useId, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import type { SaveTransactionRequest, TransactionResponse } from "@/interface/transaction";
import { createTransaction, updateTransaction } from "@/lib/api/transactions";
import { cn } from "@/lib/utils";
import {
  saveTransactionFormSchema,
  type SaveTransactionFormValues,
} from "@/schema/save-transaction.schema";
import {
  type ChannelFilterId,
  getPfcCategoryMeta,
  getPaymentChannelMeta,
  PAYMENT_CHANNEL_FILTER_IDS,
  PFC_PRIMARY_CATEGORY_CODES,
  PFC_PRIMARY_UNCATEGORIZED_FILTER_CODE,
} from "@/components/transactions-filter";

const ACCOUNT_NONE_VALUE = "__none__";

function getTodayUtcYmd(): string {
  return new Date().toISOString().slice(0, 10);
}

function normalizePaymentChannelToFilterId(
  raw: string | null | undefined,
): ChannelFilterId {
  const trimmed = raw?.trim();
  if (!trimmed) return "online";
  const key = trimmed.toLowerCase().replace(/[\s_]+/g, "");
  if (
    key === "online" ||
    key === "instore" ||
    key === "other"
  ) {
    return key as ChannelFilterId;
  }
  return "other";
}

function getDefaultSaveTransactionFormValues(): SaveTransactionFormValues {
  return {
    linkedBankAccountId: null,
    amount: 0,
    amountFlow: "expense",
    date: getTodayUtcYmd(),
    merchantName: "",
    pending: false,
    paymentChannel: "online",
    pfcPrimary: PFC_PRIMARY_UNCATEGORIZED_FILTER_CODE,
    pfcDetailed: "",
    website: "",
    clearLogo: false,
  };
}

function formValuesToSaveRequest(
  values: SaveTransactionFormValues,
  options: {
    includeClearLogo: boolean;
    optedOutLinkedAccountId: string | null;
  },
): SaveTransactionRequest {
  const paymentChannel = values.paymentChannel;

  let pfcPrimary: string | null = values.pfcPrimary.trim();
  if (
    pfcPrimary === "" ||
    pfcPrimary === PFC_PRIMARY_UNCATEGORIZED_FILTER_CODE
  ) {
    pfcPrimary = null;
  }

  const pfcDetailed = values.pfcDetailed?.trim() || null;
  const website = values.website?.trim() || null;

  const status: "active" | "account_opted_out" =
    values.linkedBankAccountId != null &&
    options.optedOutLinkedAccountId != null &&
    values.linkedBankAccountId === options.optedOutLinkedAccountId
      ? "account_opted_out"
      : "active";

  const req: SaveTransactionRequest = {
    linkedBankAccountId: values.linkedBankAccountId,
    amount: values.amount,
    amountFlow: values.amountFlow,
    date: values.date,
    merchantName: values.merchantName.trim(),
    pending: values.pending,
    paymentChannel,
    pfcPrimary,
    pfcDetailed,
    website,
    status,
  };

  if (options.includeClearLogo && values.clearLogo) {
    req.clearLogo = true;
  }

  return req;
}

function getSelectTriggerClassName(active: boolean): string {
  return cn(
    buttonVariants({ variant: active ? "secondary" : "outline", size: "sm" }),
    "h-8 gap-1.5 border-dashed font-normal",
  );
}

function normalizeTxDateToYmd(date: string): string {
  const t = date.trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(t)) return t.slice(0, 10);
  const d = new Date(t);
  if (Number.isNaN(d.getTime())) return getTodayUtcYmd();
  return d.toISOString().slice(0, 10);
}

function transactionToFormValues(t: TransactionResponse): SaveTransactionFormValues {
  const amountFlow: "expense" | "income" = t.amount < 0 ? "income" : "expense";

  return {
    linkedBankAccountId: t.linkedBankAccountId,
    amount: Math.abs(t.amount),
    amountFlow,
    date: normalizeTxDateToYmd(t.date),
    merchantName: t.merchantName?.trim() ?? t.name?.trim() ?? "",
    pending: t.pending,
    paymentChannel: normalizePaymentChannelToFilterId(t.paymentChannel),
    pfcPrimary:
      t.pfcPrimary?.trim() || PFC_PRIMARY_UNCATEGORIZED_FILTER_CODE,
    pfcDetailed: t.pfcDetailed?.trim() ?? "",
    website: t.website?.trim() ?? "",
    clearLogo: false,
  };
}

export type SaveTransactionSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  transaction: TransactionResponse | null;
  banks: LinkedBankResponse[];
};

export function SaveTransactionSheet({
  open,
  onOpenChange,
  mode,
  transaction,
  banks,
}: SaveTransactionSheetProps) {
  const queryClient = useQueryClient();
  const amountFlowGroup = useId();

  const optedOutLinkedAccountId = useMemo(() => {
    const id = transaction?.linkedBankAccountId ?? null;
    if (!id) return null;
    const seen = new Set<string>();
    for (const bank of banks) {
      for (const a of bank.accounts) seen.add(a.id);
    }
    return seen.has(id) ? null : id;
  }, [banks, transaction?.linkedBankAccountId]);

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
    const orphanId = transaction?.linkedBankAccountId;
    if (orphanId && !seen.has(orphanId)) {
      rows.unshift({
        id: orphanId,
        label: "Opted out account",
      });
    }
    return rows;
  }, [banks, transaction?.linkedBankAccountId]);

  const { control, handleSubmit, reset } = useForm<SaveTransactionFormValues>({
    resolver: zodResolver(saveTransactionFormSchema),
    defaultValues: getDefaultSaveTransactionFormValues(),
  });

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && transaction) {
      reset(transactionToFormValues(transaction));
    } else {
      reset(getDefaultSaveTransactionFormValues());
    }
  }, [open, mode, transaction, reset]);

  const saveMutation = useMutation({
    mutationFn: async (values: SaveTransactionFormValues) => {
      const payload = formValuesToSaveRequest(values, {
        includeClearLogo: mode === "edit",
        optedOutLinkedAccountId,
      });
      if (mode === "create") {
        return createTransaction(payload);
      }
      if (!transaction?.id) throw new Error("Missing transaction id");
      return updateTransaction(transaction.id, payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["query-transaction-list"] });
      await queryClient.invalidateQueries({ queryKey: ["get-recent-transactions"] });
      toast.success(mode === "create" ? "Transaction added." : "Transaction updated.");
      onOpenChange(false);
    },
  });

  const onSubmit = (values: SaveTransactionFormValues) => {
    saveMutation.mutate(values);
  };

  const busy = saveMutation.isPending;
  const showClearLogo =
    mode === "edit" && Boolean(transaction?.logoUrl?.trim());

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={!busy}
        className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-md"
      >
        <SheetHeader className="border-b border-border/60 px-4 py-4 text-left">
          <SheetTitle>
            {mode === "create" ? "Add transaction" : "Edit transaction"}
          </SheetTitle>
          <SheetDescription>
            {mode === "create"
              ? "Create a manual entry. Amount is the magnitude; choose expense or income."
              : "Update this transaction. Changes sync to your data."}
          </SheetDescription>
        </SheetHeader>

        <form
          id="tx-save-form"
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
                  <FieldLabel htmlFor="tx-merchant">Merchant Name</FieldLabel>
                  <FieldContent>
                    <Input
                      id="tx-merchant"
                      type="text"
                      autoComplete="off"
                      disabled={busy}
                      placeholder="e.g. Grocery store"
                      {...field}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </FieldContent>
                </Field>
              )}
            />

            <Controller
              name="linkedBankAccountId"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid ? true : undefined}>
                  <FieldLabel htmlFor="tx-account">Account</FieldLabel>
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
                        id="tx-account"
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
                    <FieldLabel htmlFor="tx-pfc-primary">
                      Primary Category
                    </FieldLabel>
                    <FieldContent>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={busy}
                      >
                        <SelectTrigger
                          id="tx-pfc-primary"
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
                  <FieldLabel htmlFor="tx-pfc-detailed">
                    Detailed category (optional)
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      id="tx-pfc-detailed"
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
              name="date"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid ? true : undefined}>
                  <FieldLabel htmlFor="tx-date">Date</FieldLabel>
                  <FieldContent>
                    <Input
                      id="tx-date"
                      type="date"
                      max={getTodayUtcYmd()}
                      disabled={busy}
                      {...field}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </FieldContent>
                </Field>
              )}
            />

            <Controller
              name="paymentChannel"
              control={control}
              render={({ field, fieldState }) => {
                const triggerMeta = getPaymentChannelMeta(
                  field.value as ChannelFilterId,
                );
                return (
                  <Field data-invalid={fieldState.invalid ? true : undefined}>
                    <FieldLabel htmlFor="tx-payment-channel">
                      Payment channel
                    </FieldLabel>
                    <FieldContent>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={busy}
                      >
                        <SelectTrigger
                          id="tx-payment-channel"
                          aria-label={`Payment channel: ${triggerMeta.displayName}`}
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
                                "max-w-[min(100%,14rem)] truncate border font-normal text-xs",
                                triggerMeta.badgeClassName,
                              )}
                            >
                              {triggerMeta.displayName}
                            </Badge>
                            <SelectValue className="sr-only" />
                          </span>
                        </SelectTrigger>
                        <SelectContent align="start" className="max-h-72">
                          {PAYMENT_CHANNEL_FILTER_IDS.map((id) => {
                            const meta = getPaymentChannelMeta(id);
                            return (
                              <SelectItem key={id} value={id}>
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "border font-normal text-xs",
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
              name="amountFlow"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid ? true : undefined}>
                  <FieldLabel>Type</FieldLabel>
                  <FieldContent className="flex flex-row flex-wrap items-center gap-x-6 gap-y-2 p-0">
                    <label className="inline-flex cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        name={amountFlowGroup}
                        className="size-4 shrink-0 accent-primary"
                        checked={field.value === "expense"}
                        disabled={busy}
                        onChange={() => field.onChange("expense")}
                      />
                      <span className="text-sm font-medium text-foreground">
                        Expense
                      </span>
                    </label>
                    <label className="inline-flex cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        name={amountFlowGroup}
                        className="size-4 shrink-0 accent-primary"
                        checked={field.value === "income"}
                        disabled={busy}
                        onChange={() => field.onChange("income")}
                      />
                      <span className="text-sm font-medium text-foreground">
                        Income
                      </span>
                    </label>
                  </FieldContent>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Controller
              name="amount"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid ? true : undefined}>
                  <FieldLabel htmlFor="tx-amount">Amount</FieldLabel>
                  <FieldContent>
                    <Input
                      id="tx-amount"
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
              name="website"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid ? true : undefined}>
                  <FieldLabel htmlFor="tx-website">Website (optional)</FieldLabel>
                  <FieldContent>
                    <Input
                      id="tx-website"
                      type="url"
                      autoComplete="off"
                      disabled={busy}
                      placeholder="https://"
                      {...field}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </FieldContent>
                </Field>
              )}
            />

            <Controller
              name="pending"
              control={control}
              render={({ field }) => (
                <Field orientation="horizontal">
                  <Checkbox
                    id="tx-pending"
                    checked={field.value}
                    onCheckedChange={(c) => field.onChange(c === true)}
                    disabled={busy}
                  />
                  <FieldLabel htmlFor="tx-pending" className="font-normal">
                    Pending
                  </FieldLabel>
                </Field>
              )}
            />

            {showClearLogo ? (
              <Controller
                name="clearLogo"
                control={control}
                render={({ field }) => (
                  <Field orientation="horizontal">
                    <Checkbox
                      id="tx-clear-logo"
                      checked={field.value}
                      onCheckedChange={(c) => field.onChange(c === true)}
                      disabled={busy}
                    />
                    <FieldLabel htmlFor="tx-clear-logo" className="font-normal">
                      Remove merchant logo
                    </FieldLabel>
                  </Field>
                )}
              />
            ) : null}

            {saveMutation.error ? (
              <p className="text-sm text-destructive" role="alert">
                {saveMutation.error instanceof Error
                  ? saveMutation.error.message
                  : "Could not save transaction."}
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
            form="tx-save-form"
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
