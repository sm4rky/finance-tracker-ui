import type { UpsertPushSubscriptionRequest } from "@/interface/push-subscription";

function isServiceWorkerEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_SERVICE_WORKER === "true";
}

function getVapidPublicKey(): string {
  return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim() ?? "";
}

function urlBase64ToUint8Array(value: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = `${value}${padding}`.replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const outputArray = new Uint8Array(buffer);

  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

export function isPushNotificationSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    isServiceWorkerEnabled() &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

async function getExistingServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!isPushNotificationSupported()) return null;
  return (await navigator.serviceWorker.getRegistration("/")) || null;
}

async function ensureServiceWorkerRegistration(): Promise<ServiceWorkerRegistration> {
  if (!isPushNotificationSupported()) {
    throw new Error("Push notifications are not supported on this device.");
  }

  const existing = await navigator.serviceWorker.getRegistration("/");
  if (existing) return existing;

  return navigator.serviceWorker.register("/sw.js", { scope: "/" });
}

export async function getCurrentPushSubscription(): Promise<PushSubscription | null> {
  const registration = await getExistingServiceWorkerRegistration();
  if (!registration) return null;

  return registration.pushManager.getSubscription();
}

export async function subscribeCurrentDeviceToPushNotifications(): Promise<PushSubscription> {
  const publicKey = getVapidPublicKey();
  if (!publicKey) {
    throw new Error("NEXT_PUBLIC_VAPID_PUBLIC_KEY is not set.");
  }

  if (Notification.permission === "denied") {
    throw new Error("Notifications are blocked for this browser.");
  }

  if (Notification.permission === "default") {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      throw new Error("Notification permission was not granted.");
    }
  }

  const registration = await ensureServiceWorkerRegistration();
  const existing = await registration.pushManager.getSubscription();
  if (existing) return existing;

  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey),
  });
}

export async function unsubscribeCurrentPushSubscription(): Promise<PushSubscription | null> {
  const subscription = await getCurrentPushSubscription();
  if (!subscription) return null;

  await subscription.unsubscribe();
  return subscription;
}

export function pushSubscriptionToUpsertRequest(
  subscription: PushSubscription,
): UpsertPushSubscriptionRequest {
  const json = subscription.toJSON();
  const p256dh = json.keys?.p256dh;
  const auth = json.keys?.auth;

  if (!subscription.endpoint || !p256dh || !auth) {
    throw new Error("Push subscription is missing required browser keys.");
  }

  const userAgent =
    typeof navigator === "undefined" ? null : navigator.userAgent;

  return {
    endpoint: subscription.endpoint,
    p256dh,
    auth,
    userAgent,
  };
}
