import type {
  CreatePlaidLinkTokenRequest,
  CreatePlaidLinkTokenResponse,
  ExchangePlaidPublicTokenRequest,
  ExchangePlaidPublicTokenResponse,
  HardDeleteLinkedBankResponse,
  LinkedBankResponse,
  SoftDisconnectLinkedBankResponse,
} from "@/interface/plaid";

import { apiFetch, parseApiErrorMessage } from "./client";

export type {
  CreatePlaidLinkTokenRequest,
  CreatePlaidLinkTokenResponse,
  ExchangePlaidPublicTokenRequest,
  ExchangePlaidPublicTokenResponse,
  HardDeleteLinkedBankResponse,
  LinkedBankAccountResponse,
  LinkedBankResponse,
  LinkedBankStatus,
  PlaidLinkIntent,
  SoftDisconnectLinkedBankResponse,
} from "@/interface/plaid";

const JSON_HEADERS = { "Content-Type": "application/json" } as const;

const BASE_URL = "/api/Plaid" as const;

export async function createPlaidLinkToken(
  body: CreatePlaidLinkTokenRequest = {},
): Promise<CreatePlaidLinkTokenResponse> {
  const res = await apiFetch(`${BASE_URL}/link-token`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await parseApiErrorMessage(res));
  return (await res.json()) as CreatePlaidLinkTokenResponse;
}

export async function exchangePlaidPublicToken(
  body: ExchangePlaidPublicTokenRequest,
): Promise<ExchangePlaidPublicTokenResponse> {
  const res = await apiFetch(`${BASE_URL}/exchange`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await parseApiErrorMessage(res));
  return (await res.json()) as ExchangePlaidPublicTokenResponse;
}

export async function listPlaidConnections(): Promise<LinkedBankResponse[]> {
  const res = await apiFetch(`${BASE_URL}/connections`, { method: "GET" });
  if (!res.ok) throw new Error(await parseApiErrorMessage(res));
  return (await res.json()) as LinkedBankResponse[];
}

export async function softDisconnectPlaidConnection(
  linkedBankId: string,
): Promise<SoftDisconnectLinkedBankResponse> {
  const res = await apiFetch(
    `${BASE_URL}/connections/${encodeURIComponent(linkedBankId)}/soft-disconnect`,
    { method: "POST" },
  );
  if (!res.ok) throw new Error(await parseApiErrorMessage(res));
  return (await res.json()) as SoftDisconnectLinkedBankResponse;
}

export async function hardDeletePlaidConnection(
  linkedBankId: string,
): Promise<HardDeleteLinkedBankResponse> {
  const res = await apiFetch(
    `${BASE_URL}/connections/${encodeURIComponent(linkedBankId)}`,
    { method: "DELETE" },
  );
  if (!res.ok) throw new Error(await parseApiErrorMessage(res));
  return (await res.json()) as HardDeleteLinkedBankResponse;
}
