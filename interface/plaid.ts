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
  institutionId: string | null;
  institutionName: string | null;
  accounts: LinkedBankAccountResponse[];
  requiresAccountOptOutHandling: boolean;
  pendingDeselectedAccounts: LinkedBankAccountResponse[];
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
  hasPendingUpdateAccountDecisions?: boolean;
  accounts: LinkedBankAccountResponse[];
}

export interface PlaidAccountOptOutDecision {
  plaidAccountId: string;
  deleteTransactions: boolean;
}

export interface ConfirmPlaidUpdateAccountsRequest {
  decisions: PlaidAccountOptOutDecision[];
}

export interface SyncPlaidTransactionsResponse {
  linkedBankId: string;
  transactionsUpdateStatus: string | null;
  syncedAt: string;
}

export interface ConfirmPlaidUpdateAccountsResponse {
  linkedBankId: string;
  sync: SyncPlaidTransactionsResponse;
}

export interface SoftDisconnectLinkedBankResponse {
  linkedBankId: string;
}

export interface UnlinkInstitutionRequest {
  linkedBankId: string;
  deleteTransactions: boolean;
}

export interface UnlinkInstitutionResponse {
  linkedBankId: string;
  deleted: boolean;
  transactionsRemoved: number;
}
