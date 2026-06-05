"use client";

import { useQuery } from "@tanstack/react-query";

import type { LinkedBankResponse } from "@/interface/plaid";
import { listPlaidConnections } from "@/lib/api/plaid";

export function useLinkedBanks() {
  const { data: banks = [], isLoading } = useQuery<LinkedBankResponse[]>({
    queryKey: ["list-plaid-connections"],
    queryFn: listPlaidConnections,
  });

  return {
    banks,
    isLoading,
  };
}
