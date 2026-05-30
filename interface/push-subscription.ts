export interface PushSubscriptionResponse {
  id: string;
  profileId: string;
  endpoint: string;
  userAgent: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertPushSubscriptionRequest {
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent?: string | null;
}
