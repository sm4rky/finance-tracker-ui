export function getPushSubscriptionDeviceLabel(
  userAgent: string | null | undefined,
): string {
  const trimmedUserAgent = userAgent?.trim() ?? "";
  if (!trimmedUserAgent) return "Unknown device";

  const browser = parseBrowserName(trimmedUserAgent);
  const os = parseOsName(trimmedUserAgent);

  if (browser && os) return `${browser} on ${os}`;
  if (browser) return browser;
  if (os) return os;

  return "Unknown device";
}

export type PushSubscriptionDeviceType = "desktop" | "mobile" | "unknown";

export function getPushSubscriptionDeviceType(
  userAgent: string | null | undefined,
): PushSubscriptionDeviceType {
  const ua = userAgent?.trim() ?? "";
  if (!ua) return "unknown";

  if (/Mobile|Android|iPhone|iPad|iPod/i.test(ua)) return "mobile";
  if (/Windows|Mac OS X|Linux/i.test(ua)) return "desktop";

  return "unknown";
}

function parseBrowserName(userAgent: string): string | null {
  if (/Edg\//.test(userAgent)) return "Edge";
  if (/Chrome\//.test(userAgent) && !/Edg\//.test(userAgent)) return "Chrome";
  if (/Firefox\//.test(userAgent)) return "Firefox";
  if (/Safari\//.test(userAgent) && !/Chrome\//.test(userAgent))
    return "Safari";
  return null;
}

function parseOsName(userAgent: string): string | null {
  if (/iPhone|iPad|iPod/.test(userAgent)) return "iOS";
  if (/Android/.test(userAgent)) return "Android";
  if (/Mac OS X/.test(userAgent)) return "macOS";
  if (/Windows/.test(userAgent)) return "Windows";
  if (/Linux/.test(userAgent)) return "Linux";
  return null;
}

export function formatPushSubscriptionDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;

  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
