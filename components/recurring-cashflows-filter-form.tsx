"use client";

import { Fragment, useMemo, useState } from "react";
import { Check, ChevronDown, Unlink } from "lucide-react";

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
import type { LinkedBankResponse } from "@/interface/plaid";
import {
  RECURRING_CASHFLOW_STATUS_FILTER_IDS,
  type RecurringCashflowsFilterState,
} from "@/interface/profile-recurring-cashflow";
import { cn } from "@/lib/utils";

import {
  getAllAccountIds,
  getPfcCategoryMeta,
  PFC_PRIMARY_CATEGORY_CODES,
} from "@/components/transactions-filter";

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

const STATUS_META: Record<
  string,
  { label: string; className: string; Icon: typeof Check }
> = {
  active: {
    label: "Active",
    Icon: Check,
    className:
      "border-emerald-500/20 bg-emerald-500/15 text-emerald-800 dark:text-emerald-400",
  },
  unlinked: {
    label: "Unlinked",
    Icon: Unlink,
    className: "text-muted-foreground",
  },
};

export type RecurringCashflowsFilterFormProps = {
  filter: RecurringCashflowsFilterState;
  onChange: (next: RecurringCashflowsFilterState) => void;
  banks: LinkedBankResponse[] | undefined;
  variant?: "default" | "sheet";
};

export function RecurringCashflowsFilterForm({
  filter,
  onChange,
  banks,
  variant = "default",
}: RecurringCashflowsFilterFormProps) {
  const isSheet = variant === "sheet";
  const [categorySearch, setCategorySearch] = useState("");

  const allAccountIds = useMemo(() => getAllAccountIds(banks), [banks]);
  const selectedAccountIds =
    filter.accountIds === undefined ? allAccountIds : filter.accountIds;
  const selectedCategoryCodes =
    filter.pfcPrimaryList ?? [...PFC_PRIMARY_CATEGORY_CODES];
  const selectedStatuses = filter.statusList ?? [...RECURRING_CASHFLOW_STATUS_FILTER_IDS];

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

  const allStatusesSelected =
    RECURRING_CASHFLOW_STATUS_FILTER_IDS.length > 0 &&
    RECURRING_CASHFLOW_STATUS_FILTER_IDS.every((id) =>
      selectedStatuses.includes(id),
    );

  const accountCount = selectedAccountIds.length;
  const categoryCount = selectedCategoryCodes.length;
  const statusCount = selectedStatuses.length;

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

  const setAllStatuses = () => {
    onChange({
      ...filter,
      statusList: allStatusesSelected
        ? []
        : [...RECURRING_CASHFLOW_STATUS_FILTER_IDS],
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

  const updateStatusSelection = (statusId: string, checked: boolean) => {
    onChange({
      ...filter,
      statusList: toggleSelection(selectedStatuses, statusId, checked),
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
            className={cn(
              getSelectTriggerClassName(accountCount > 0),
              triggerClassName,
            )}
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
          id="rcf-include-unlinked"
          checked={filter.includeUnlinked ?? true}
          onCheckedChange={(checked) =>
            onChange({
              ...filter,
              includeUnlinked: checked === true,
            })
          }
        />
        <label
          htmlFor="rcf-include-unlinked"
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
            className={cn(
              getSelectTriggerClassName(categoryCount > 0),
              triggerClassName,
            )}
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
            className={cn(
              getSelectTriggerClassName(statusCount > 0),
              triggerClassName,
            )}
          >
            <span>Status ({statusCount})</span>
            <ChevronDown className="size-3.5 shrink-0 opacity-60" aria-hidden />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="start"
            className={cn("p-1", !isSheet && "w-[min(100vw-2rem,20rem)]")}
          >
            <DropdownMenuItem
              closeOnClick={false}
              onClick={setAllStatuses}
              className="cursor-pointer gap-2 py-1.5 pr-2 pl-1.5"
            >
              <span
                className="pointer-events-none flex shrink-0 items-center"
                aria-hidden
              >
                <Checkbox checked={allStatusesSelected} tabIndex={-1} />
              </span>
              <span className="min-w-0 flex-1 text-xs font-medium">
                Select all
              </span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {RECURRING_CASHFLOW_STATUS_FILTER_IDS.map((id) => {
              const meta = STATUS_META[id];
              const checked = selectedStatuses.includes(id);
              const Icon = meta.Icon;

              return (
                <DropdownMenuItem
                  key={id}
                  closeOnClick={false}
                  onClick={() => updateStatusSelection(id, !checked)}
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
                      "gap-1 border font-normal text-xs",
                      id === "active" ? "border-emerald-500/20" : "border-muted-foreground/25",
                      meta.className,
                    )}
                  >
                    <Icon className="size-3.5 shrink-0" aria-hidden />
                    {meta.label}
                  </Badge>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
