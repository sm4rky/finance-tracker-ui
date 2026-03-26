export type PlaidLinkIntent = "connect" | "relink" | "update";

export interface CreatePlaidLinkTokenRequest {
  intent?: PlaidLinkIntent;
  linkedBankId?: string;
}

export interface CreatePlaidLinkTokenResponse {
  linkToken: string;
  linkSessionId: string;
}

export interface ExchangePlaidPublicTokenRequest {
  publicToken: string;
  linkSessionId: string;
}

export interface ExchangePlaidPublicTokenResponse {
  linkedBankId: string;
  plaidItemId: string;
  accounts: LinkedBankAccountResponse[];
}

export interface LinkedBankAccountResponse {
  id: string;
  linkedBankId: string;
  plaidAccountId: string;
  accountName: string;
  officialName: string | null;
  mask: string | null;
  type: string | null;
  subtype: string | null;
  currentBalance: number | null;
  availableBalance: number | null;
  limitAmount: number | null;
  isoCurrencyCode: string | null;
  unofficialCurrencyCode: string | null;
  balanceLastFetchedAt: string | null;
  isActive: boolean;
}

export type LinkedBankStatus = "active" | "disconnected" | "relink_required";

export interface LinkedBankResponse {
  id: string;
  plaidItemId: string;
  institutionId: string | null;
  institutionName: string | null;
  status: LinkedBankStatus;
  disconnectedAt: string | null;
  tokenRemovedAt: string | null;
  lastSyncedAt: string | null;
  createdAt: string;
  accounts: LinkedBankAccountResponse[];
}

export interface SoftDisconnectLinkedBankResponse {
  linkedBankId: string;
}

export interface HardDeleteLinkedBankResponse {
  linkedBankId: string;
}
