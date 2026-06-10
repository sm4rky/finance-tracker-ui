export type BankAccountCardMeta = {
  className: string;
};

export const BANK_ACCOUNT_CARD_METAS: Record<string, BankAccountCardMeta> = {
  DEPOSITORY: {
    className: "bg-violet-600",
  },
  CREDIT: {
    className: "bg-red-800",
  },
  INVESTMENT: {
    className: "bg-sky-500",
  },
  LOAN: {
    className: "bg-amber-800",
  },
};

export const BANK_ACCOUNT_CARD_META_FALLBACK: BankAccountCardMeta = {
  className: "bg-slate-800",
};

export const BANK_ACCOUNT_CARD_TYPES = Object.keys(BANK_ACCOUNT_CARD_METAS);

export function normalizeKey(
  value: string | null | undefined,
): string {
  return (
    value
      ?.trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "") ?? ""
  );
}

export function getBankAccountCardMeta(
  type: string | null | undefined,
): BankAccountCardMeta {
  const normalized = normalizeKey(type);
  return BANK_ACCOUNT_CARD_METAS[normalized] ?? BANK_ACCOUNT_CARD_META_FALLBACK;
}

export function getBankAccountPaymentBadge(
  type: string | null | undefined,
  subtype: string | null | undefined,
): "CREDIT CARD" | "DEBIT" | null {
  const normalizedType = normalizeKey(type);
  const normalizedSubtype = normalizeKey(subtype);

  if (normalizedType === "CREDIT" || normalizedSubtype === "CREDITCARD") {
    return "CREDIT CARD";
  }

  if (
    normalizedType === "DEPOSITORY" &&
    (normalizedSubtype === "CHECKING" || normalizedSubtype === "PREPAID")
  ) {
    return "DEBIT";
  }

  return null;
}
