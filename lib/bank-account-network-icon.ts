export type BankAccountNetworkIcon = {
  src: string;
  alt: string;
  keywords: string[];
};

export const BANK_ACCOUNT_NETWORK_ICONS: Record<
  string,
  BankAccountNetworkIcon
> = {
  mastercard: {
    src: "/mastercard.png",
    alt: "Mastercard",
    keywords: ["mastercard", "master card", "savor"],
  },
  visa: {
    src: "/visa.png",
    alt: "Visa",
    keywords: ["visa"],
  },
};

function normalizeNetworkText(value: string): string {
  return value.toLowerCase().trim();
}

export function getBankAccountNetworkIcon(
  accountName: string | null | undefined,
  officialName: string | null | undefined,
): BankAccountNetworkIcon | null {
  const text = normalizeNetworkText(
    [accountName, officialName].filter(Boolean).join(" "),
  );

  return (
    Object.values(BANK_ACCOUNT_NETWORK_ICONS).find((icon) =>
      icon.keywords.some((keyword) =>
        text.includes(normalizeNetworkText(keyword)),
      ),
    ) ?? null
  );
}
