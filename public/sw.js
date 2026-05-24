const SW_VERSION = "moneyinsight-sw-v1";

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((cacheName) => cacheName.startsWith("moneyinsight-"))
          .filter((cacheName) => cacheName !== SW_VERSION)
          .map((cacheName) => caches.delete(cacheName)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", () => { });

self.addEventListener("push", (event) => {
  const fallbackTitle = "MoneyInsight";
  const fallbackOptions = {
    body: "You have a new notification.",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    data: { url: "/" },
  };

  let payload = {};
  if (event.data) {
    try {
      payload = event.data.json();
    } catch {
      payload = { body: event.data.text() };
    }
  }

  const title = payload.title || fallbackTitle;
  const options = {
    ...fallbackOptions,
    ...payload,
    data: {
      ...fallbackOptions.data,
      ...(payload.data || {}),
      url: payload.url || payload.data?.url || fallbackOptions.data.url,
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = new URL(event.notification.data?.url || "/", self.location.origin);

  event.waitUntil(
    (async () => {
      const windowClients = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      for (const client of windowClients) {
        const clientUrl = new URL(client.url);
        if (clientUrl.origin === targetUrl.origin) {
          await client.navigate(targetUrl.href);
          return client.focus();
        }
      }

      return self.clients.openWindow(targetUrl.href);
    })(),
  );
});
