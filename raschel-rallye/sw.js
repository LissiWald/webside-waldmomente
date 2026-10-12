"use strict";
/* ══════════════════════════════════════════
   Raschel, das Waldgespenst

   Die Rallye wird nicht mehr auf dem Geraet abgelegt. Wer sie
   frueher einmal gespeichert hat, hat aber noch einen Service
   Worker samt Speicher auf dem Geraet, und der wuerde weiter die
   alten Dateien ausliefern. Diese Fassung raeumt beides ab und
   meldet sich danach ab. Sie faengt nichts mehr ab.
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
