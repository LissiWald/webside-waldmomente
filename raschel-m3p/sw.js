"use strict";
/* ══════════════════════════════════════════
   Alte Adresse von Raschel.
   Wer die Rallye hier schon einmal fuer den Wald
   gespeichert hat, hat einen Service Worker auf dem
   Geraet, der weiter die alten Dateien ausliefert.
   Diese Fassung raeumt ihn und seinen Speicher ab,
   damit die Weiche auf die neue Adresse greift.
   ══════════════════════════════════════════ */

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const namen = await caches.keys();
    await Promise.all(namen
      .filter(n => n.startsWith("raschel-"))
      .map(n => caches.delete(n)));
    await self.registration.unregister();
    const fenster = await self.clients.matchAll({ type: "window" });
    for (const f of fenster) f.navigate(f.url);
  })());
});

/* Nichts mehr abfangen. Alles geht ans Netz. */
