export interface SubscriptionPlanResponse {
  id: string;
  name: string;
  maxAccounts: number | null;
  historyMonths: number | null;
  hasAi: boolean;
  monthlyPrice: number | null;
}

export interface SubscriptionPaymentResponse {
  id: string;
  profileId: string | null;
  amount: number;
  chargedAt: string;
  planId: string;
  paymentType: string;
  reference: string | null;
  createdAt: string;
}

export interface SubscriptionPaymentHistoryResponse {
  id: string;
  profileId: string | null;
  eventType: string;
  fromPlanId: string | null;
  toPlanId: string | null;
  createdAt: string;
  effectiveAt: string;
}
