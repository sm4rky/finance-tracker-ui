export type PaymentChannelMeta = {
  displayName: string;
  badgeClassName: string;
};

export const PAYMENT_CHANNEL_METAS: Record<string, PaymentChannelMeta> = {
  online: {
    displayName: "Online",
    badgeClassName:
      "border-sky-500/30 bg-sky-500/15 text-sky-950 dark:text-sky-100",
  },
  instore: {
    displayName: "In store",
    badgeClassName:
      "border-violet-500/30 bg-violet-500/15 text-violet-950 dark:text-violet-100",
  },
  other: {
    displayName: "Other",
    badgeClassName:
      "border-zinc-500/30 bg-zinc-500/15 text-zinc-900 dark:text-zinc-100",
  },
};

export const PAYMENT_CHANNEL_META_FALLBACK: PaymentChannelMeta = {
  displayName: "—",
  badgeClassName:
    "border-muted-foreground/20 bg-muted/80 text-muted-foreground",
};

export type PaymentChannel = "online" | "instore" | "other";

export const PAYMENT_CHANNELS: PaymentChannel[] = [
  "online",
  "instore",
  "other",
];

export function getPaymentChannelMeta(
  paymentChannel: string | null | undefined,
): PaymentChannelMeta {
  const trimmed = paymentChannel?.trim();
  if (!trimmed) {
    return PAYMENT_CHANNEL_META_FALLBACK;
  }

  const normalizedKey = trimmed.toLowerCase().replace(/[\s_]+/g, "");
  return (
    PAYMENT_CHANNEL_METAS[normalizedKey] ?? {
      displayName: trimmed,
      badgeClassName:
        "border-muted-foreground/25 bg-muted text-muted-foreground",
    }
  );
}
