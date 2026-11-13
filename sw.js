// The clock moved to https://limestonecitybitcoin.com/debt-clock/.
// This worker replaces the old offline one: it clears the saved copy and
// removes itself, so returning visitors get forwarded to the new address.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
      .then(() => self.registration.unregister())
      .then(() => self.clients.matchAll({ type: "window" }))
      .then((clients) => clients.forEach((c) => c.navigate("https://limestonecitybitcoin.com/debt-clock/")))
  );
});
