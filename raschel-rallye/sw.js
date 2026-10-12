"use strict";
/* ══════════════════════════════════════════
   Raschel, das Waldgespenst
   Legt das Spiel aufs Geraet, damit es im Wald
   ohne Empfang laeuft.
   ══════════════════════════════════════════ */

const CACHE_VERSION = "raschel-v4";
const CACHE_NAME = CACHE_VERSION + "-offline";

self.addEventListener("install", event => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(namen => Promise.all(
        namen
          .filter(n => n.startsWith("raschel-") && n !== CACHE_NAME)
          .map(n => caches.delete(n))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", event => {
  if (event.data?.type !== "CACHE_RASCHEL") return;
  const port = event.ports[0];
  if (!port) return;

  event.waitUntil((async () => {
    try {
      /* Pflichtdateien: ohne sie ist das Spiel im Wald unbrauchbar.
         Kuerdateien (die Tonspuren): schoen, aber jede Nachricht
         steht auch im Text. Die werden nur gemeldet. */
      const pflicht = [...new Set(event.data.urls || [])];
      const kuer = [...new Set(event.data.kuer || [])]
        .filter(u => !pflicht.includes(u));
      const alle = pflicht.concat(kuer);

      const cache = await caches.open(CACHE_NAME);
      const fehlend = [];
      const fehlendeKuer = [];

      for (let i = 0; i < alle.length; i++) {
        const url = new URL(alle[i], self.location.href);
        if (!["http:", "https:"].includes(url.protocol)) {
          throw new Error("Ungültige Speicheradresse.");
        }
        const notwendig = i < pflicht.length;
        const name = url.pathname.split("/").pop() || url.pathname;

        /* Alle Dateien liegen auf derselben Domain. Dadurch ist die
           Antwort lesbar und ein Fehler faellt wirklich auf.
           Bei fremden Adressen waere sie undurchsichtig, und eine
           Fehlerseite liesse sich nicht von einer echten Datei
           unterscheiden. Genau deshalb liegt hier nichts ausserhalb. */
        let antwort = null;
        try {
          antwort = await fetch(new Request(url.href, {
            mode: "same-origin",
            credentials: "same-origin",
            cache: "reload"
          }));
        } catch (netzfehler) {
          antwort = null;
        }

        if (!antwort || !antwort.ok) {
          (notwendig ? fehlend : fehlendeKuer).push(name);
        } else {
          await cache.put(url.href, antwort);
        }
        port.postMessage({ type: "progress", done: i + 1, total: alle.length });
      }

      if (fehlend.length) {
        port.postMessage({
          type: "error",
          message: fehlend.length + " Datei(en) fehlen: " + fehlend.slice(0, 3).join(", ")
        });
        return;
      }
      port.postMessage({
        type: "done",
        gespeichert: alle.length - fehlendeKuer.length,
        fehlendeKuer: fehlendeKuer
      });
    } catch (fehler) {
      port.postMessage({ type: "error", message: String(fehler.message || fehler) });
    }
  })());
});

async function ausliefern(request) {
  const cache = await caches.open(CACHE_NAME);
  const sauber = new URL(request.url);
  sauber.hash = "";

  let abgelegt = await cache.match(sauber.href);
  if (!abgelegt && request.mode === "navigate") {
    sauber.search = "";
    abgelegt = await cache.match(sauber.href);
  }
  if (!abgelegt) {
    try { return await fetch(request); }
    catch (e) { return Response.error(); }
  }

  /* Tonspuren werden stueckweise angefordert. Das muss bedient werden,
     sonst spielt das Audioelement auf dem iPhone nicht ab. */
  const bereich = request.headers.get("Range");
  if (bereich) {
    const treffer = /^bytes=(\d+)-(\d*)$/.exec(bereich);
    if (treffer) {
      const daten = await abgelegt.arrayBuffer();
      const von = Number(treffer[1]);
      const bis = treffer[2]
        ? Math.min(Number(treffer[2]), daten.byteLength - 1)
        : daten.byteLength - 1;
      if (von > bis) {
        return new Response(null, {
          status: 416,
          headers: { "Content-Range": `bytes */${daten.byteLength}` }
        });
      }
      return new Response(daten.slice(von, bis + 1), {
        status: 206,
        headers: {
          "Content-Type": abgelegt.headers.get("Content-Type") || "audio/mp4",
          "Content-Range": `bytes ${von}-${bis}/${daten.byteLength}`,
          "Content-Length": String(bis - von + 1),
          "Accept-Ranges": "bytes"
        }
      });
    }
  }
  return abgelegt;
}

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  event.respondWith(ausliefern(event.request));
});
