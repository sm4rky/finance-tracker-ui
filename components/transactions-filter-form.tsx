"use client";

import { Fragment, useMemo, useState } from "react";
import { ChevronDown, Wallet } from "lucide-react";
import Image from "next/image";

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
import type { ProfileCustomCategorySetResponse } from "@/interface/profile-custom-category";
import {
  getCustomCategoryMeta,
  type CustomCategoryMeta,
} from "@/lib/custom-category";
import {
  PAYMENT_CHANNELS,
  getPaymentChannelMeta,
  type PaymentChannel,
} from "@/lib/payment-channel";
import {
  getPfcPrmaryMeta,
  PFC_PRIMARY,
  type PfcPrimaryMeta,
} from "@/lib/pfc-primary";
import type { TransactionsFilterState } from "@/lib/transaction-filter";
import { getAllAccountIds } from "@/lib/linked-bank-accounts";
import { getPlaidInstitutionIcon } from "@/lib/plaid-institution-icons";
import { cn } from "@/lib/utils";

function getFilterCategoryMeta(
  categorySet: ProfileCustomCategorySetResponse | null,
  categoryId: string,
): CustomCategoryMeta | PfcPrimaryMeta {
  if (categorySet) {
    const category = categorySet.categories.find(
      (item) => item.id === categoryId,
    );

    if (category) {
      return getCustomCategoryMeta(category);
    }
  }

  return getPfcPrmaryMeta(categoryId);
}

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

export type TransactionsFilterFormProps = {
  filterState: TransactionsFilterState;
  onChange: (next: TransactionsFilterState) => void;
  banks: LinkedBankResponse[] | undefined;
  categorySet: ProfileCustomCategorySetResponse | null;
  variant?: "default" | "sheet";
};

export function TransactionsFilterForm({
  filterState,
  onChange,
  banks,
  categorySet,
  variant = "default",
}: TransactionsFilterFormProps) {
  const isSheet = variant === "sheet";
  const [categorySearch, setCategorySearch] = useState("");
  const categoryIds = useMemo(
    () =>
      categorySet
        ? categorySet.categories.map((category) => category.id)
        : [...PFC_PRIMARY],
    [categorySet],
  );
  const isCustomCategorySet = categorySet !== null;
  const customCategorySetId = categorySet?.id;

  const allAccountIds = useMemo(() => getAllAccountIds(banks), [banks]);
  const selectedAccountIds =
    filterState.accountIds === undefined ? allAccountIds : filterState.accountIds;
  const selectedCategoryIds = isCustomCategorySet
    ? (filterState.customCategoryIds ?? [])
    : (filterState.pfcPrimaryList ?? []);
  const selectedPaymentChannels = filterState.paymentChannels ?? [];

  const filteredCategoryIds = useMemo(() => {
    const keyword = categorySearch.trim().toLowerCase();
    if (!keyword) return categoryIds;

    return categoryIds.filter((categoryId) =>
      getFilterCategoryMeta(categorySet, categoryId)
        .displayName.toLowerCase()
        .includes(keyword)
    );
  }, [categoryIds, categorySearch, categorySet]);

  const allAccountsSelected =
    allAccountIds.length > 0 &&
    allAccountIds.every((id) => selectedAccountIds.includes(id));

  const allCategoriesSelected =
    categoryIds.length > 0 &&
    categoryIds.every((categoryId) =>
      selectedCategoryIds.includes(categoryId),
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
  const categoriesCount = selectedCategoryIds.length;
  const channelsCount = selectedPaymentChannels.length;

  const setAllAccounts = () => {
    onChange({
      ...filterState,
      accountIds: allAccountsSelected ? [] : [...allAccountIds],
    });
  };

  const setAllCategories = () => {
    const nextCategoryIds = allCategoriesSelected ? [] : categoryIds;
    onChange({
      ...filterState,
      pfcPrimaryList: isCustomCategorySet ? undefined : nextCategoryIds,
      customCategorySetId,
      customCategoryIds: isCustomCategorySet ? nextCategoryIds : undefined,
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

  const updateCategorySelection = (categoryId: string, checked: boolean) => {
    const nextCategoryIds = toggleSelection(
      selectedCategoryIds,
      categoryId,
      checked,
    );

    onChange({
      ...filterState,
      pfcPrimaryList: isCustomCategorySet ? undefined : nextCategoryIds,
      customCategorySetId,
      customCategoryIds: isCustomCategorySet ? nextCategoryIds : undefined,
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
      <div className={cn(isSheet && "w-full")}>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger
            type="button"
            className={cn(
              buttonVariants({
                variant: accountsCount > 0 ? "secondary" : "outline",
                size: "sm",
              }),
              "h-8 gap-1.5 border-dashed font-normal",
              isSheet && "h-10 w-full min-w-0 justify-between",
            )}
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

                {banks.map((bank, bankIndex) => {
                  const institutionName = bank.institutionName?.trim() || "Bank";
                  const institutionIcon =
                    getPlaidInstitutionIcon(institutionName);

                  return (
                    <Fragment key={bank.id}>
                      {bankIndex > 0 ? <DropdownMenuSeparator /> : null}

                      <DropdownMenuGroup>
                        <DropdownMenuLabel className="flex min-w-0 items-center gap-2 text-[11px] font-semibold uppercase tracking-wide">
                          {institutionIcon ? (
                            <Image
                              src={institutionIcon.src}
                              alt={institutionIcon.alt}
                              width={16}
                              height={16}
                              className="size-4 shrink-0 object-contain"
                            />
                          ) : null}
                          <span className="min-w-0 truncate">
                            {institutionName}
                          </span>
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
                  );
                })}
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

      <div className={cn(isSheet && "w-full")}>
        <DropdownMenu
          modal={false}
          onOpenChange={(open) => {
            if (!open) setCategorySearch("");
          }}
        >
          <DropdownMenuTrigger
            type="button"
            className={cn(
              buttonVariants({
                variant: categoriesCount > 0 ? "secondary" : "outline",
                size: "sm",
              }),
              "h-8 gap-1.5 border-dashed font-normal",
              isSheet && "h-10 w-full min-w-0 justify-between",
            )}
          >
            <span>Categories ({categoriesCount})</span>
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

            {filteredCategoryIds.length === 0 ? (
              <p className="px-2 py-3 text-center text-sm text-muted-foreground">
                No matches
              </p>
            ) : (
              filteredCategoryIds.map((categoryId) => {
                const meta = getFilterCategoryMeta(categorySet, categoryId);
                const checked = selectedCategoryIds.includes(categoryId);

                return (
                  <DropdownMenuItem
                    key={categoryId}
                    closeOnClick={false}
                    onClick={() => updateCategorySelection(categoryId, !checked)}
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

      <div className={cn(isSheet && "w-full")}>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger
            type="button"
            className={cn(
              buttonVariants({
                variant: channelsCount > 0 ? "secondary" : "outline",
                size: "sm",
              }),
              "h-8 gap-1.5 border-dashed font-normal",
              isSheet && "h-10 w-full min-w-0 justify-between",
            )}
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

      <div className={cn(isSheet && "w-full")}>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger
            type="button"
            className={cn(
              buttonVariants({
                variant: hasAmountFilter ? "secondary" : "outline",
                size: "sm",
              }),
              "h-8 gap-1.5 border-dashed font-normal",
              isSheet && "h-10 w-full min-w-0 justify-between",
            )}
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
