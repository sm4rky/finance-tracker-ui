"use client";

import { Fragment } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import type { FieldError as HookFormFieldError } from "react-hook-form";

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
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import type {
  LinkedBankAccountResponse,
  LinkedBankResponse,
} from "@/interface/plaid";
import { getPlaidInstitutionIcon } from "@/lib/plaid-institution-icons";
import { cn } from "@/lib/utils";

export type CreateBudgetAccountsMultiSelectProps = {
  banks: LinkedBankResponse[];
  value: string[];
  disabled: boolean;
  error?: HookFormFieldError;
  onChange: (value: string[]) => void;
};

function toggleValue(
  values: string[],
  value: string,
  checked: boolean,
): string[] {
  if (checked) return values.includes(value) ? values : [...values, value];
  return values.filter((item) => item !== value);
}

function getAccountLabel(account: LinkedBankAccountResponse): string {
  const base =
    account.officialName?.trim() || account.accountName.trim() || "Account";
  return account.mask ? `${base} ••••${account.mask}` : base;
}

export function CreateBudgetAccountsMultiSelect({
  banks,
  value,
  disabled,
  error,
  onChange,
}: CreateBudgetAccountsMultiSelectProps) {
  const accountOptions = banks.flatMap((bank) =>
    bank.accounts
      .filter((account) => account.isActive)
      .map((account) => ({
        id: account.id,
        label: getAccountLabel(account),
      })),
  );
  const selectedLabels = accountOptions
    .filter((account) => value.includes(account.id))
    .map((account) => account.label);
  const allSelected =
    accountOptions.length > 0 &&
    accountOptions.every((account) => value.includes(account.id));

  return (
    <Field
      data-invalid={error ? true : undefined}
      data-disabled={disabled ? true : undefined}
    >
      <FieldLabel>Accounts</FieldLabel>
      <FieldContent>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger
            type="button"
            disabled={disabled}
            className={cn(
              buttonVariants({
                variant: value.length > 0 ? "secondary" : "outline",
                size: "sm",
              }),
              "h-10 min-h-10 w-full justify-between gap-2 border-dashed py-2 text-sm font-normal",
            )}
          >
            <span className="min-w-0 flex-1 truncate text-left">
              {selectedLabels.length > 0
                ? selectedLabels.join(", ")
                : "Select accounts"}
            </span>
            <ChevronDown className="size-3.5 shrink-0 opacity-60" aria-hidden />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="start"
            className="max-h-72 overflow-y-auto p-1"
          >
            {accountOptions.length === 0 ? (
              <p className="px-2 py-3 text-center text-sm text-muted-foreground">
                Connect at least one account before creating a budget.
              </p>
            ) : (
              <>
                <DropdownMenuItem
                  closeOnClick={false}
                  onClick={(event) => {
                    event.preventDefault();
                    onChange(
                      allSelected ? [] : accountOptions.map(({ id }) => id),
                    );
                  }}
                  className="cursor-pointer gap-2 py-1.5 pr-2 pl-1.5"
                >
                  <span
                    className="pointer-events-none flex shrink-0 items-center"
                    aria-hidden
                  >
                    <Checkbox checked={allSelected} tabIndex={-1} />
                  </span>
                  <span className="min-w-0 flex-1 text-xs font-medium">
                    Select all
                  </span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />

                {banks.map((bank, index) => {
                  const accounts = bank.accounts.filter(
                    (account) => account.isActive,
                  );
                  if (accounts.length === 0) return null;

                  const institutionName =
                    bank.institutionName?.trim() || "Bank";
                  const institutionIcon =
                    getPlaidInstitutionIcon(institutionName);

                  return (
                    <Fragment key={bank.id}>
                      {index > 0 ? <DropdownMenuSeparator /> : null}
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

                        {accounts.map((account) => {
                          const checked = value.includes(account.id);
                          return (
                            <DropdownMenuItem
                              key={account.id}
                              closeOnClick={false}
                              onClick={(event) => {
                                event.preventDefault();
                                onChange(
                                  toggleValue(value, account.id, !checked),
                                );
                              }}
                              className="cursor-pointer gap-2 py-1.5 pr-2 pl-1.5"
                            >
                              <span
                                className="pointer-events-none flex shrink-0 items-center"
                                aria-hidden
                              >
                                <Checkbox checked={checked} tabIndex={-1} />
                              </span>
                              <span className="min-w-0 flex-1 truncate">
                                {getAccountLabel(account)}
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
        <FieldError errors={[error]} />
      </FieldContent>
    </Field>
  );
}
