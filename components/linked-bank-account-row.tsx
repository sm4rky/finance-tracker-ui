"use client";

import {
  Banknote,
  Building2,
  CreditCard,
  Landmark,
  LineChart,
  type LucideIcon,
} from "lucide-react";

import type { LinkedBankAccountResponse } from "@/interface/plaid";
import { cn } from "@/lib/utils";

const LINKED_BANK_ACCOUNT_ICON_BY_TYPE: Record<string, LucideIcon> = {
  depository: Landmark,
  credit: CreditCard,
  investment: LineChart,
  loan: Banknote,
  other: Building2,
};

function normalizePlaidKey(value: string | null | undefined): string {
  if (!value) return "";
  return value.toLowerCase().trim().replace(/_/g, " ");
}

function formatMoney(amount: number | null, currency?: string | null): string {
  if (amount == null || Number.isNaN(amount)) return "—";

  const code = currency?.toUpperCase() || "USD";

  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: code,
    }).format(amount);
  } catch {
    return amount.toFixed(2);
  }
}

function getAccountMetaLabel(account: LinkedBankAccountResponse): string {
  const subtype = normalizePlaidKey(account.subtype);
  const type = normalizePlaidKey(account.type);

  if (subtype && type) return `${subtype} · ${type}`;
  if (subtype) return subtype;
  if (type) return type;
  return "Account";
}

function AccountSecondaryLine({
  account,
}: {
  account: LinkedBankAccountResponse;
}) {
  const normalizedType = normalizePlaidKey(account.type);

  if (normalizedType === "credit" && account.limitAmount != null) {
    return (
      <p className="text-xs text-muted-foreground">
        Limit: {formatMoney(account.limitAmount, account.isoCurrencyCode)}
      </p>
    );
  }

  if (account.availableBalance != null) {
    return (
      <p className="text-xs text-muted-foreground">
        Available:{" "}
        {formatMoney(account.availableBalance, account.isoCurrencyCode)}
      </p>
    );
  }

  return null;
}

export type LinkedBankAccountRowProps = {
  account: LinkedBankAccountResponse;
};

export function LinkedBankAccountRow({ account }: LinkedBankAccountRowProps) {
  const normalizedType = normalizePlaidKey(account.type);
  const Icon = LINKED_BANK_ACCOUNT_ICON_BY_TYPE[normalizedType] ?? Building2;

  const displayName =
    account.officialName?.trim() || account.accountName.trim();

  const metaLabel = getAccountMetaLabel(account);

  return (
    <li className="flex flex-col gap-4 py-3 first:pt-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <div
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted"
          aria-hidden
        >
          <Icon className="size-4 text-muted-foreground" aria-hidden />
        </div>

        <div className="min-w-0">
          <p className="font-medium text-foreground">
            {displayName}
            {account.mask ? (
              <span className="ml-1 font-normal text-muted-foreground">
                {`••••${account.mask}`}
              </span>
            ) : null}
          </p>

          <p className="text-xs capitalize text-muted-foreground">
            {metaLabel}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end pl-12 text-right sm:pl-0">
        <p
          className={cn(
            "font-semibold tabular-nums",
            account.currentBalance != null && account.currentBalance < 0
              ? "text-destructive"
              : "text-foreground",
          )}
        >
          {formatMoney(account.currentBalance, account.isoCurrencyCode)}
        </p>

        <AccountSecondaryLine account={account} />
      </div>
    </li>
  );
}
