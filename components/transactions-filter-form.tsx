"use client";

import { Fragment, useMemo, useState } from "react";
import { CalendarRange, ChevronDown, Wallet } from "lucide-react";

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
import type { TransactionsFilterState } from "@/interface/transaction";
import { cn } from "@/lib/utils";

import type { ChannelFilterId } from "./transactions-filter";
import {
  getAllAccountIds,
  getPfcCategoryMeta,
  getPaymentChannelMeta,
  PAYMENT_CHANNEL_FILTER_IDS,
  PFC_PRIMARY_CATEGORY_CODES,
} from "./transactions-filter";

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
  filter: TransactionsFilterState;
  onChange: (next: TransactionsFilterState) => void;
  banks: LinkedBankResponse[] | undefined;
  maxDate: string;
  variant?: "default" | "sheet";
};

export function TransactionsFilterForm({
  filter,
  onChange,
  banks,
  maxDate,
  variant = "default",
}: TransactionsFilterFormProps) {
  const isSheet = variant === "sheet";
  const [categorySearch, setCategorySearch] = useState("");

  const allAccountIds = useMemo(() => getAllAccountIds(banks), [banks]);
  const selectedAccountIds =
    filter.accountIds === undefined ? allAccountIds : filter.accountIds;
  const selectedCategoryCodes = filter.pfcPrimaryList ?? [];
  const selectedPaymentChannels = filter.paymentChannels ?? [];

  const filteredCategoryCodes = useMemo(() => {
    const keyword = categorySearch.trim().toLowerCase();
    if (!keyword) return PFC_PRIMARY_CATEGORY_CODES;

    return PFC_PRIMARY_CATEGORY_CODES.filter((code) => {
      const meta = getPfcCategoryMeta(code);
      return (
        meta.displayName.toLowerCase().includes(keyword) ||
        code.toLowerCase().includes(keyword)
      );
    });
  }, [categorySearch]);

  const allAccountsSelected =
    allAccountIds.length > 0 &&
    allAccountIds.every((id) => selectedAccountIds.includes(id));

  const allCategoriesSelected =
    PFC_PRIMARY_CATEGORY_CODES.length > 0 &&
    PFC_PRIMARY_CATEGORY_CODES.every((code) =>
      selectedCategoryCodes.includes(code),
    );

  const allChannelsSelected =
    PAYMENT_CHANNEL_FILTER_IDS.length > 0 &&
    PAYMENT_CHANNEL_FILTER_IDS.every((id) =>
      selectedPaymentChannels.includes(id),
    );

  const hasDateFilter = Boolean(filter.dateFrom || filter.dateTo);
  const hasAmountFilter =
    filter.amountMin != null ||
    filter.amountMax != null ||
    (filter.amountFlow != null && filter.amountFlow !== "");

  const accountCount = selectedAccountIds.length;
  const categoryCount = selectedCategoryCodes.length;
  const channelCount = selectedPaymentChannels.length;

  const triggerClassName = isSheet
    ? "h-10 w-full min-w-0 justify-between"
    : "";

  const rowClassName = isSheet ? "w-full" : "";

  const setAllAccounts = () => {
    onChange({
      ...filter,
      accountIds: allAccountsSelected ? [] : [...allAccountIds],
    });
  };

  const setAllCategories = () => {
    onChange({
      ...filter,
      pfcPrimaryList: allCategoriesSelected
        ? []
        : [...PFC_PRIMARY_CATEGORY_CODES],
    });
  };

  const setAllChannels = () => {
    onChange({
      ...filter,
      paymentChannels: allChannelsSelected ? [] : [...PAYMENT_CHANNEL_FILTER_IDS],
    });
  };

  const updateAccountSelection = (accountId: string, checked: boolean) => {
    onChange({
      ...filter,
      accountIds: toggleSelection(selectedAccountIds, accountId, checked),
    });
  };

  const updateCategorySelection = (categoryCode: string, checked: boolean) => {
    onChange({
      ...filter,
      pfcPrimaryList: toggleSelection(
        selectedCategoryCodes,
        categoryCode,
        checked,
      ),
    });
  };

  const updateChannelSelection = (
    channelId: ChannelFilterId,
    checked: boolean,
  ) => {
    onChange({
      ...filter,
      paymentChannels: toggleSelection(
        selectedPaymentChannels,
        channelId,
        checked,
      ) as ChannelFilterId[],
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
            className={cn(getSelectTriggerClassName(accountCount > 0), triggerClassName)}
          >
            <span>Accounts ({accountCount})</span>
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
                        const label = `${
                          account.officialName?.trim() ||
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
          checked={filter.includeUnlinkedTransactions ?? true}
          onCheckedChange={(checked) =>
            onChange({
              ...filter,
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
            if (!open) setCategorySearch("");
          }}
        >
          <DropdownMenuTrigger
            type="button"
            className={cn(getSelectTriggerClassName(categoryCount > 0), triggerClassName)}
          >
            <span>Categories ({categoryCount})</span>
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
              className="px-1 pb-1.5"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <Input
                placeholder="Search categories…"
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
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
              onClick={setAllCategories}
              className="cursor-pointer gap-2 py-1.5 pr-2 pl-1.5"
            >
              <span
                className="pointer-events-none flex shrink-0 items-center"
                aria-hidden
              >
                <Checkbox checked={allCategoriesSelected} tabIndex={-1} />
              </span>
              <span className="min-w-0 flex-1 text-xs font-medium">
                Select all
              </span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {filteredCategoryCodes.length === 0 ? (
              <p className="px-2 py-3 text-center text-sm text-muted-foreground">
                No matches
              </p>
            ) : (
              filteredCategoryCodes.map((code) => {
                const meta = getPfcCategoryMeta(code);
                const checked = selectedCategoryCodes.includes(code);

                return (
                  <DropdownMenuItem
                    key={code}
                    closeOnClick={false}
                    onClick={() => updateCategorySelection(code, !checked)}
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
            className={cn(getSelectTriggerClassName(channelCount > 0), triggerClassName)}
          >
            <span>Channel ({channelCount})</span>
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

            {PAYMENT_CHANNEL_FILTER_IDS.map((id) => {
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
          checked={filter.pending === true}
          onCheckedChange={(checked) =>
            onChange({
              ...filter,
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
            className={cn(getSelectTriggerClassName(hasDateFilter), triggerClassName)}
          >
            <span className="inline-flex items-center gap-1">
              <CalendarRange className="size-3.5 shrink-0 opacity-70" aria-hidden />
              <span>Dates</span>
            </span>

            {hasDateFilter ? (
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
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="tf-date-from" className="text-xs">
                  From
                </Label>
                <Input
                  id="tf-date-from"
                  type="date"
                  max={maxDate}
                  value={filter.dateFrom ?? ""}
                  onChange={(e) =>
                    onChange({
                      ...filter,
                      dateFrom: e.target.value || undefined,
                    })
                  }
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="tf-date-to" className="text-xs">
                  To
                </Label>
                <Input
                  id="tf-date-to"
                  type="date"
                  max={maxDate}
                  min={filter.dateFrom || undefined}
                  value={filter.dateTo ?? ""}
                  onChange={(e) =>
                    onChange({
                      ...filter,
                      dateTo: e.target.value || undefined,
                    })
                  }
                />
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
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
                    value={filter.amountMin != null ? String(filter.amountMin) : ""}
                    onChange={(e) =>
                      onChange({
                        ...filter,
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
                    value={filter.amountMax != null ? String(filter.amountMax) : ""}
                    onChange={(e) =>
                      onChange({
                        ...filter,
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
                    checked={filter.amountFlow === "income"}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        onChange({ ...filter, amountFlow: "income" });
                        return;
                      }

                      if (filter.amountFlow === "income") {
                        onChange({ ...filter, amountFlow: null });
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
                    checked={filter.amountFlow === "expense"}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        onChange({ ...filter, amountFlow: "expense" });
                        return;
                      }

                      if (filter.amountFlow === "expense") {
                        onChange({ ...filter, amountFlow: null });
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
