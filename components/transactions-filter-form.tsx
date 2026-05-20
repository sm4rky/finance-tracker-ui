"use client";

import { Fragment, useMemo, useState } from "react";
import { ChevronDown, Wallet } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { LinkedBankResponse } from "@/interface/plaid";
import {
  PFC_PRIMARY,
  getPfcPrmaryMeta,
} from "@/lib/pfc-primary";
import {
  PAYMENT_CHANNELS,
  getPaymentChannelMeta,
  type PaymentChannel,
} from "@/lib/payment-channel";
import type { TransactionsFilterState } from "@/lib/transaction-filter";
import { getAllAccountIds } from "@/lib/linked-bank-accounts";
import { cn } from "@/lib/utils";

function parseOptionalAmount(raw: string): number | undefined {
  const value = raw.trim();
  if (value === "") return undefined;

  const parsed = Number(value);
  if (Number.isNaN(parsed) || parsed < 0) return undefined;

  return parsed;
}

function toggleSelection(
  list: string[],
  value: string,
  checked: boolean,
): string[] {
  const next = new Set(list);
  if (checked) next.add(value);
  else next.delete(value);
  return [...next];
}

function getSelectTriggerClassName(active: boolean): string {
  return cn(
    buttonVariants({ variant: active ? "secondary" : "outline", size: "sm" }),
    "h-8 gap-1.5 border-dashed font-normal",
  );
}

export type TransactionsFilterFormProps = {
  filterState: TransactionsFilterState;
  onChange: (next: TransactionsFilterState) => void;
  banks: LinkedBankResponse[] | undefined;
  variant?: "default" | "sheet";
};

export function TransactionsFilterForm({
  filterState,
  onChange,
  banks,
  variant = "default",
}: TransactionsFilterFormProps) {
  const isSheet = variant === "sheet";
  const [pfcPrimarySearch, setPfcPrimarySearch] = useState("");

  const allAccountIds = useMemo(() => getAllAccountIds(banks), [banks]);
  const selectedAccountIds =
    filterState.accountIds === undefined ? allAccountIds : filterState.accountIds;
  const selectedPfcPrimary = filterState.pfcPrimaryList ?? [];
  const selectedPaymentChannels = filterState.paymentChannels ?? [];

  const filteredPfcPrimary = useMemo(() => {
    const keyword = pfcPrimarySearch.trim().toLowerCase();
    if (!keyword) return PFC_PRIMARY;

    return PFC_PRIMARY.filter((pfcPrimary) =>
      pfcPrimary.toLowerCase().includes(keyword)
    );
  }, [pfcPrimarySearch]);

  const allAccountsSelected =
    allAccountIds.length > 0 &&
    allAccountIds.every((id) => selectedAccountIds.includes(id));

  const allPfcPrimarySelected =
    PFC_PRIMARY.length > 0 &&
    PFC_PRIMARY.every((pfcPrimary) =>
      selectedPfcPrimary.includes(pfcPrimary),
    );

  const allChannelsSelected =
    PAYMENT_CHANNELS.length > 0 &&
    PAYMENT_CHANNELS.every((paymentChannel) =>
      selectedPaymentChannels.includes(paymentChannel),
    );

  const hasAmountFilter =
    filterState.amountMin != null ||
    filterState.amountMax != null ||
    (filterState.amountFlow != null && filterState.amountFlow !== "");

  const accountsCount = selectedAccountIds.length;
  const pfcPrimaryCount = selectedPfcPrimary.length;
  const channelsCount = selectedPaymentChannels.length;

  const triggerClassName = isSheet
    ? "h-10 w-full min-w-0 justify-between"
    : "";

  const rowClassName = isSheet ? "w-full" : "";

  const setAllAccounts = () => {
    onChange({
      ...filterState,
      accountIds: allAccountsSelected ? [] : [...allAccountIds],
    });
  };

  const setAllPfcPrimary = () => {
    onChange({
      ...filterState,
      pfcPrimaryList: allPfcPrimarySelected
        ? []
        : [...PFC_PRIMARY],
    });
  };

  const setAllChannels = () => {
    onChange({
      ...filterState,
      paymentChannels: allChannelsSelected ? [] : [...PAYMENT_CHANNELS],
    });
  };

  const updateAccountSelection = (accountId: string, checked: boolean) => {
    onChange({
      ...filterState,
      accountIds: toggleSelection(selectedAccountIds, accountId, checked),
    });
  };

  const updatePfcPrimarySelection = (pfcPrimary: string, checked: boolean) => {
    onChange({
      ...filterState,
      pfcPrimaryList: toggleSelection(
        selectedPfcPrimary,
        pfcPrimary,
        checked,
      ),
    });
  };

  const updateChannelSelection = (
    channelId: PaymentChannel,
    checked: boolean,
  ) => {
    onChange({
      ...filterState,
      paymentChannels: toggleSelection(
        selectedPaymentChannels,
        channelId,
        checked,
      ) as PaymentChannel[],
    });
  };

  return (
    <div
      className={cn(
        isSheet
          ? "flex w-full flex-col gap-4"
          : "flex flex-row flex-wrap items-center content-start gap-2",
      )}
    >
      <div className={rowClassName}>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger
            type="button"
            className={cn(getSelectTriggerClassName(accountsCount > 0), triggerClassName)}
          >
            <span>Accounts ({accountsCount})</span>
            <ChevronDown className="size-3.5 shrink-0 opacity-60" aria-hidden />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className={cn(
              "max-h-72 overflow-y-auto p-1",
              !isSheet && "w-[min(100vw-2rem,20rem)]",
            )}
          >
            {!banks?.length ? (
              <p className="px-2 py-2 text-sm text-muted-foreground">
                No linked accounts. Link a bank in Profile.
              </p>
            ) : (
              <>
                <DropdownMenuItem
                  closeOnClick={false}
                  onClick={setAllAccounts}
                  className="cursor-pointer gap-2 py-1.5 pr-2 pl-1.5"
                >
                  <span
                    className="pointer-events-none flex shrink-0 items-center"
                    aria-hidden
                  >
                    <Checkbox checked={allAccountsSelected} tabIndex={-1} />
                  </span>
                  <span className="min-w-0 flex-1 text-xs font-medium">
                    Select all
                  </span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {banks.map((bank, bankIndex) => (
                  <Fragment key={bank.id}>
                    {bankIndex > 0 ? <DropdownMenuSeparator /> : null}

                    <DropdownMenuGroup>
                      <DropdownMenuLabel className="text-[11px] font-semibold uppercase tracking-wide">
                        {bank.institutionName?.trim() || "Bank"}
                      </DropdownMenuLabel>

                      {bank.accounts.map((account) => {
                        const checked = selectedAccountIds.includes(account.id);
                        const label = `${account.officialName?.trim() ||
                          account.accountName.trim() ||
                          "Account"
                          }${account.mask ? ` ·•••${account.mask}` : ""}`;

                        return (
                          <DropdownMenuItem
                            key={account.id}
                            closeOnClick={false}
                            onClick={() =>
                              updateAccountSelection(account.id, !checked)
                            }
                            className="cursor-pointer gap-2 py-1.5 pr-2 pl-1.5"
                          >
                            <span
                              className="pointer-events-none flex shrink-0 items-center"
                              aria-hidden
                            >
                              <Checkbox checked={checked} tabIndex={-1} />
                            </span>
                            <span className="min-w-0 flex-1 truncate">
                              {label}
                            </span>
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuGroup>
                  </Fragment>
                ))}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div
        className={cn(
          "flex items-center gap-2",
          isSheet ? "h-10 w-full rounded-md border border-dashed px-3" : "h-8",
        )}
      >
        <Checkbox
          id="tf-include-unlinked"
          checked={filterState.includeUnlinkedTransactions ?? true}
          onCheckedChange={(checked) =>
            onChange({
              ...filterState,
              includeUnlinkedTransactions: checked === true,
            })
          }
        />
        <label
          htmlFor="tf-include-unlinked"
          className="cursor-pointer select-none text-sm font-normal"
        >
          Include unlinked account
        </label>
      </div>

      <div className={rowClassName}>
        <DropdownMenu
          modal={false}
          onOpenChange={(open) => {
            if (!open) setPfcPrimarySearch("");
          }}
        >
          <DropdownMenuTrigger
            type="button"
            className={cn(getSelectTriggerClassName(pfcPrimaryCount > 0), triggerClassName)}
          >
            <span>Categories ({pfcPrimaryCount})</span>
            <ChevronDown className="size-3.5 shrink-0 opacity-60" aria-hidden />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="start"
            className={cn(
              "max-h-72 overflow-y-auto p-1",
              !isSheet && "w-[min(100vw-2rem,20rem)]",
            )}
          >
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

            <DropdownMenuSeparator />

            <DropdownMenuItem
              closeOnClick={false}
              onClick={setAllPfcPrimary}
              className="cursor-pointer gap-2 py-1.5 pr-2 pl-1.5"
            >
              <span
                className="pointer-events-none flex shrink-0 items-center"
                aria-hidden
              >
                <Checkbox checked={allPfcPrimarySelected} tabIndex={-1} />
              </span>
              <span className="min-w-0 flex-1 text-xs font-medium">
                Select all
              </span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {filteredPfcPrimary.length === 0 ? (
              <p className="px-2 py-3 text-center text-sm text-muted-foreground">
                No matches
              </p>
            ) : (
              filteredPfcPrimary.map((code) => {
                const meta = getPfcPrmaryMeta(code);
                const checked = selectedPfcPrimary.includes(code);

                return (
                  <DropdownMenuItem
                    key={code}
                    closeOnClick={false}
                    onClick={() => updatePfcPrimarySelection(code, !checked)}
                    className="cursor-pointer gap-2 py-1.5 pr-2 pl-1.5"
                  >
                    <span
                      className="pointer-events-none flex shrink-0 items-center"
                      aria-hidden
                    >
                      <Checkbox checked={checked} tabIndex={-1} />
                    </span>

                    <Badge
                      variant="outline"
                      className={cn(
                        "shrink-0 border font-normal text-xs",
                        meta.badgeClassName,
                      )}
                    >
                      {meta.displayName}
                    </Badge>
                  </DropdownMenuItem>
                );
              })
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className={rowClassName}>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger
            type="button"
            className={cn(getSelectTriggerClassName(channelsCount > 0), triggerClassName)}
          >
            <span>Channel ({channelsCount})</span>
            <ChevronDown className="size-3.5 shrink-0 opacity-60" aria-hidden />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="start"
            className={cn("p-1", !isSheet && "w-[min(100vw-2rem,20rem)]")}
          >
            <DropdownMenuItem
              closeOnClick={false}
              onClick={setAllChannels}
              className="cursor-pointer gap-2 py-1.5 pr-2 pl-1.5"
            >
              <span
                className="pointer-events-none flex shrink-0 items-center"
                aria-hidden
              >
                <Checkbox checked={allChannelsSelected} tabIndex={-1} />
              </span>
              <span className="min-w-0 flex-1 text-xs font-medium">
                Select all
              </span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {PAYMENT_CHANNELS.map((id) => {
              const meta = getPaymentChannelMeta(id);
              const checked = selectedPaymentChannels.includes(id);

              return (
                <DropdownMenuItem
                  key={id}
                  closeOnClick={false}
                  onClick={() => updateChannelSelection(id, !checked)}
                  className="cursor-pointer gap-2 py-1.5 pr-2 pl-1.5"
                >
                  <span
                    className="pointer-events-none flex shrink-0 items-center"
                    aria-hidden
                  >
                    <Checkbox checked={checked} tabIndex={-1} />
                  </span>

                  <Badge
                    variant="outline"
                    className={cn(
                      "shrink-0 border font-normal text-xs",
                      meta.badgeClassName,
                    )}
                  >
                    {meta.displayName}
                  </Badge>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div
        className={cn(
          "flex items-center gap-2",
          isSheet ? "h-10 w-full rounded-md border border-dashed px-3" : "h-8",
        )}
      >
        <Checkbox
          id="tf-pending"
          checked={filterState.pending === true}
          onCheckedChange={(checked) =>
            onChange({
              ...filterState,
              pending: checked === true ? true : undefined,
            })
          }
        />
        <label
          htmlFor="tf-pending"
          className="cursor-pointer text-sm font-normal select-none"
        >
          Pending
        </label>
      </div>

      <div className={rowClassName}>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger
            type="button"
            className={cn(getSelectTriggerClassName(hasAmountFilter), triggerClassName)}
          >
            <span className="inline-flex items-center gap-1">
              <Wallet className="size-3.5 shrink-0 opacity-70" aria-hidden />
              <span>Amount</span>
            </span>

            {hasAmountFilter ? (
              <Badge
                variant="secondary"
                className="h-5 min-w-5 px-1.5 font-normal"
              >
                Set
              </Badge>
            ) : null}

            <ChevronDown className="size-3.5 shrink-0 opacity-60" aria-hidden />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="start"
            className={cn("p-3", isSheet ? "min-w-0" : "w-72")}
            sideOffset={6}
          >
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="tf-amt-min" className="text-xs">
                    Min
                  </Label>
                  <Input
                    id="tf-amt-min"
                    type="number"
                    min={0}
                    step="0.01"
                    inputMode="decimal"
                    placeholder="0"
                    value={filterState.amountMin != null ? String(filterState.amountMin) : ""}
                    onChange={(e) =>
                      onChange({
                        ...filterState,
                        amountMin: parseOptionalAmount(e.target.value),
                      })
                    }
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="tf-amt-max" className="text-xs">
                    Max
                  </Label>
                  <Input
                    id="tf-amt-max"
                    type="number"
                    min={0}
                    step="0.01"
                    inputMode="decimal"
                    placeholder="0"
                    value={filterState.amountMax != null ? String(filterState.amountMax) : ""}
                    onChange={(e) =>
                      onChange({
                        ...filterState,
                        amountMax: parseOptionalAmount(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="tf-flow-in"
                    checked={filterState.amountFlow === "income"}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        onChange({ ...filterState, amountFlow: "income" });
                        return;
                      }

                      if (filterState.amountFlow === "income") {
                        onChange({ ...filterState, amountFlow: null });
                      }
                    }}
                  />
                  <label htmlFor="tf-flow-in" className="text-sm">
                    Income
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="tf-flow-ex"
                    checked={filterState.amountFlow === "expense"}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        onChange({ ...filterState, amountFlow: "expense" });
                        return;
                      }

                      if (filterState.amountFlow === "expense") {
                        onChange({ ...filterState, amountFlow: null });
                      }
                    }}
                  />
                  <label htmlFor="tf-flow-ex" className="text-sm">
                    Expense
                  </label>
                </div>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
