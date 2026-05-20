import type { LinkedBankResponse } from "@/interface/plaid";

export function getAllAccountIds(
  banks: LinkedBankResponse[] | undefined,
): string[] {
  return (banks ?? []).flatMap((bank) =>
    bank.accounts.map((account) => account.id),
  );
}
