"use client";

import Image from "next/image";
import { Asterisk } from "lucide-react";

import type { LinkedBankAccountResponse } from "@/interface/plaid";
import {
  getBankAccountCardMeta,
  getBankAccountPaymentBadge,
} from "@/lib/bank-account-card";
import { getBankAccountNetworkIcon } from "@/lib/bank-account-network-icon";
import { getPlaidInstitutionCardIcon } from "@/lib/plaid-institution-card-icons";
import { cn } from "@/lib/utils";

function formatUsd(amount: number): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export type BankAccountCardProps = {
  account: LinkedBankAccountResponse;
  institutionName: string;
  className?: string;
};

export function BankAccountCard({
  account,
  institutionName,
  className,
}: BankAccountCardProps) {
  const institutionIcon = getPlaidInstitutionCardIcon(institutionName);
  const networkIcon = getBankAccountNetworkIcon(
    account.accountName,
    account.officialName,
  );
  const cardMeta = getBankAccountCardMeta(account.type);
  const paymentBadge = getBankAccountPaymentBadge(
    account.type,
    account.subtype,
  );

  return (
    <div
      className={cn(
        "relative flex aspect-[1.6/1] min-w-0 flex-col overflow-hidden rounded-xl text-white shadow-md transition-opacity duration-400",
        cardMeta.className,
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-6 top-14 size-16 rounded-full bg-white/10" />
        <div className="absolute left-16 -top-20 size-32 rounded-full bg-white/10" />
        <div className="absolute left-12 -top-24 size-40 rounded-full border border-white/10" />
        <Image
          src="/money-insight-logo-dark-mode.svg"
          alt=""
          width={280}
          height={280}
          className="absolute -right-12 -bottom-20 size-64 select-none opacity-10"
          aria-hidden
        />
      </div>

      <div className="absolute top-4 left-4 right-4 z-10 flex justify-end">
        {institutionIcon ? (
          <Image
            src={institutionIcon.src}
            alt={institutionIcon.alt}
            width={80}
            height={32}
            className="max-h-10 w-auto object-contain"
          />
        ) : (
          <p className="max-w-24 truncate text-right text-xs font-semibold uppercase tracking-wide text-white/70">
            {institutionName}
          </p>
        )}
      </div>

      <div className="absolute top-[50%] -translate-y-1/2 left-4 right-4 z-10 flex min-h-0 items-center justify-between">
        <Image
          src="/chip.png"
          alt=""
          width={40}
          height={40}
          className="h-9 w-auto shrink-0 rounded-sm"
          aria-hidden
        />
        <div className="flex min-w-0 gap-2 text-lg tracking-wide">
          <span className="flex items-center gap-1" aria-hidden>
            {Array.from({ length: 4 }, (_, index) => (
              <Asterisk key={index} className="size-3 stroke-3" />
            ))}
          </span>
          <p className="tabular-nums">{account.mask ?? "----"}</p>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 right-4 z-10 flex justify-between items-end">
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold uppercase tracking-wide text-white/70">
            BALANCE
          </p>
          <p className="truncate font-semibold tabular-nums">
            {formatUsd(account.currentBalance ?? 0)}
          </p>
        </div>

        <div className="min-w-0">
          {networkIcon ? (
            <div className="space-y-1">
              {paymentBadge ? (
                <p className="text-[8px] font-semibold uppercase tracking-wide text-white/70 text-right">
                  {paymentBadge}
                </p>
              ) : null}
              <Image
                src={networkIcon.src}
                alt={networkIcon.alt}
                width={80}
                height={32}
                className="max-h-8 w-auto object-contain"
              />
            </div>
          ) : paymentBadge ? (
            <p className="text-lg font-semibold uppercase tracking-wide text-right">
              {paymentBadge}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
