"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { LinkedBankResponse } from "@/interface/plaid";
import type {
  SaveTransactionRequest,
  TransactionResponse,
} from "@/interface/transaction";
import {
  PFC_PRIMARY,
  UNCATEGORIZED_PFC_PRIMARY,
  getPfcPrmaryMeta,
} from "@/lib/pfc-primary";
import {
  PAYMENT_CHANNELS,
  getPaymentChannelMeta,
  type PaymentChannel,
} from "@/lib/payment-channel";
import {
  getPlaidInstitutionIcon,
  type PlaidInstitutionIcon,
} from "@/lib/plaid-institution-icons";
import { cn } from "@/lib/utils";
import {
  saveTransactionFormSchema,
  type SaveTransactionFormValues,
} from "@/schema/save-transaction.schema";

const ACCOUNT_NONE_VALUE = "__none__";

function getTodayUtcYmd(): string {
  return new Date().toISOString().slice(0, 10);
}

function getDefaultSaveTransactionFormValues(): SaveTransactionFormValues {
  return {
    merchantName: "",
    linkedBankAccountId: null,
    pfcPrimary: UNCATEGORIZED_PFC_PRIMARY,
    pfcDetailed: "",
    paymentChannel: "online",
    date: getTodayUtcYmd(),
    amountFlow: "expense",
    amount: 0,
    website: "",
    pending: false,
    clearLogo: false,
  };
}

function normalizeTextDateToYmd(date: string): string {
  const t = date.trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(t)) return t.slice(0, 10);
  const d = new Date(t);
  if (Number.isNaN(d.getTime())) return getTodayUtcYmd();
  return d.toISOString().slice(0, 10);
}

function normalizePaymentChannelToFilterId(
  paymentChannel: string | null | undefined,
): PaymentChannel {
  const trimmed = paymentChannel?.trim();
  if (!trimmed) return "online";
  const key = trimmed.toLowerCase().replace(/[\s_]+/g, "");
  if (key === "online" || key === "instore" || key === "other") {
    return key as PaymentChannel;
  }
  return "other";
}

function transactionResponseToFormValues(
  transaction: TransactionResponse,
): SaveTransactionFormValues {
  const amountFlow: "expense" | "income" =
    transaction.amount < 0 ? "income" : "expense";

  return {
    merchantName:
      transaction.merchantName?.trim() ?? transaction.name?.trim() ?? "",
    linkedBankAccountId: transaction.linkedBankAccount?.id ?? null,
    pfcPrimary: transaction.pfcPrimary?.trim() || UNCATEGORIZED_PFC_PRIMARY,
    pfcDetailed: transaction.pfcDetailed?.trim() ?? "",
    paymentChannel: normalizePaymentChannelToFilterId(
      transaction.paymentChannel,
    ),
    date: normalizeTextDateToYmd(transaction.date),
    amountFlow,
    amount: Math.abs(transaction.amount),
    website: transaction.website?.trim() ?? "",
    pending: transaction.pending,
    clearLogo: false,
  };
}

export function formValuesToSaveTransactionRequest(
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
    pfcPrimary === UNCATEGORIZED_PFC_PRIMARY
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

  const request: SaveTransactionRequest = {
    merchantName: values.merchantName.trim(),
    linkedBankAccountId: values.linkedBankAccountId,
    pfcPrimary,
    pfcDetailed,
    date: values.date,
    amountFlow: values.amountFlow,
    amount: values.amount,
    pending: values.pending,
    website,
    paymentChannel,
    status,
  };

  if (options.includeClearLogo && values.clearLogo) {
    request.clearLogo = true;
  }

  return request;
}

function getSelectTriggerClassName(active: boolean): string {
  return cn(
    buttonVariants({ variant: active ? "secondary" : "outline", size: "sm" }),
    "h-8 gap-1.5 border-dashed font-normal",
  );
}

export type SaveTransactionFormProps = {
  open: boolean;
  mode: "create" | "edit";
  transaction: TransactionResponse | null;
  banks: LinkedBankResponse[];
  busy: boolean;
  error: unknown;
  onSubmit: (values: SaveTransactionFormValues) => void;
};

export function SaveTransactionForm({
  open,
  mode,
  transaction,
  banks,
  busy,
  error,
  onSubmit,
}: SaveTransactionFormProps) {
  const amountFlowRadioGroupName = useId();
  const [pfcPrimarySearch, setPfcPrimarySearch] = useState("");

  const accountOptionGroups = useMemo(() => {
    const groups: {
      id: string;
      institutionName: string;
      icon: PlaidInstitutionIcon | null;
      accounts: { id: string; label: string }[];
    }[] = [];
    const orphanOptions: { id: string; label: string }[] = [];
    const seen = new Set<string>();
    for (const bank of banks) {
      const institutionName = bank.institutionName?.trim() || "Bank";
      const institutionIcon = getPlaidInstitutionIcon(institutionName);
      const accounts: { id: string; label: string }[] = [];
      for (const account of bank.accounts) {
        const base =
          account.officialName?.trim() ||
          account.accountName.trim() ||
          "Account";
        const label = account.mask
          ? `${base} ·•••${account.mask}`
          : base;
        accounts.push({ id: account.id, label });
        seen.add(account.id);
      }
      if (accounts.length > 0) {
        groups.push({
          id: bank.id,
          institutionName,
          icon: institutionIcon,
          accounts,
        });
      }
    }
    const orphanId = transaction?.linkedBankAccount?.id ?? null;
    if (orphanId && !seen.has(orphanId)) {
      orphanOptions.push({
        id: orphanId,
        label: "Opted out account",
      });
    }
    return { groups, orphanOptions };
  }, [banks, transaction?.linkedBankAccount?.id]);

  const filteredPfcPrimary = useMemo(() => {
    const keyword = pfcPrimarySearch.trim().toLowerCase();
    if (!keyword) return PFC_PRIMARY;

    return PFC_PRIMARY.filter((pfcPrimary) =>
      pfcPrimary.toLowerCase().includes(keyword),
    );
  }, [pfcPrimarySearch]);

  const { control, handleSubmit, reset } =
    useForm<SaveTransactionFormValues>({
      resolver: zodResolver(saveTransactionFormSchema),
      defaultValues: getDefaultSaveTransactionFormValues(),
    });

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && transaction) {
      reset(transactionResponseToFormValues(transaction));
    } else {
      reset(getDefaultSaveTransactionFormValues());
    }
  }, [open, mode, transaction, reset]);

  const showClearLogo =
    mode === "edit" && Boolean(transaction?.logoUrl?.trim());

  return (
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
                  placeholder="e.g. Amazon Prime"
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
                    field.onChange(v === ACCOUNT_NONE_VALUE ? null : v)
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
                    className="max-h-72 w-[min(28rem,calc(100vw-2rem))]"
                  >
                    <SelectItem value={ACCOUNT_NONE_VALUE}>
                      No account (unlinked)
                    </SelectItem>
                    {accountOptionGroups.orphanOptions.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.label}
                      </SelectItem>
                    ))}
                    {accountOptionGroups.groups.map((group) => (
                      <SelectGroup key={group.id}>
                        <SelectLabel className="flex min-w-0 items-center gap-2 text-[11px] font-semibold uppercase tracking-wide">
                          {group.icon ? (
                            <Image
                              src={group.icon.src}
                              alt={group.icon.alt}
                              width={16}
                              height={16}
                              className="size-4 shrink-0 object-contain"
                            />
                          ) : null}
                          <span className="min-w-0 truncate">
                            {group.institutionName}
                          </span>
                        </SelectLabel>
                        {group.accounts.map((a) => (
                          <SelectItem
                            key={a.id}
                            value={a.id}
                            className="overflow-hidden"
                          >
                            <span className="block w-[calc(100vw-6rem)] max-w-96 truncate">
                              {a.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectGroup>
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
                <FieldLabel htmlFor="tx-pfc-primary">
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
                      id="tx-pfc-primary"
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
              field.value as PaymentChannel,
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
                      {PAYMENT_CHANNELS.map((paymentChannel) => {
                        const meta = getPaymentChannelMeta(paymentChannel);
                        return (
                          <SelectItem key={paymentChannel} value={paymentChannel}>
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
                    name={amountFlowRadioGroupName}
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
                    name={amountFlowRadioGroupName}
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
              <FieldLabel htmlFor="tx-website">
                Website (optional)
              </FieldLabel>
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

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error instanceof Error
              ? error.message
              : "Could not save transaction."}
          </p>
        ) : null}
      </FieldGroup>
    </form>
  );
}
