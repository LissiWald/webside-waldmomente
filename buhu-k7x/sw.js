/* ══════════════════════════════════════════
   Buhu, das kleine Waldgespenst
   Macht die Tour offline lauffaehig.
   Beim ersten Besuch mit Netz wird alles abgelegt,
   danach laeuft die Tour auch ohne Empfang.
   ══════════════════════════════════════════ */

var LAGER = 'buhu-v1';

/* Von den Szenenbildern nur WebP ablegen, das spart die Haelfte.
   JPG bleibt als Rueckfall fuer alte Browser, aber nur online. */
var DATEIEN = [
  './',
  'start.html',
  'station1.html', 'station2.html', 'station3.html', 'station4.html',
  'station5.html', 'station6.html', 'station7.html',
  'radar.css',
  'radar.js',

  'img/buhu-1-angst.webp',
  'img/buhu-2-lauschen.webp',
  'img/buhu-3-blaetter.webp',
  'img/buhu-4-stoecke.webp',
  'img/buhu-5-kugel.webp',
  'img/buhu-6-truhe.webp',
  'img/buhu-7-finale.webp',

  'img/buhu-flicken-0.png', 'img/buhu-flicken-1.png', 'img/buhu-flicken-2.png',
  'img/buhu-flicken-3.png', 'img/buhu-flicken-4.png', 'img/buhu-flicken-5.png',
  'img/buhu-flicken-6.png', 'img/buhu-flicken-7.png',

  'img/karte-laub.png', 'img/karte-voegel.png',
  'img/karte-tropfen.png', 'img/karte-wind.png',

  'klang/laub.mp3', 'klang/voegel.mp3',
  'klang/tropfen.mp3', 'klang/wind.mp3'
];

/* Schriften liegen bei Google. Ohne sie sieht es anders aus, aber
   die Tour laeuft. Darum werden sie nur versucht, nicht erzwungen. */
var SCHRIFTEN = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;1,400;1,500;1,600&family=Jost:wght@300;400;500&family=Special+Elite&display=swap';

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(LAGER).then(function (lager) {
      /* Jede Datei einzeln, damit eine fehlende nicht alles verhindert */
      return Promise.all(DATEIEN.map(function (d) {
        return lager.add(d).catch(function () { /* weiter */ });
      })).then(function () {
        return lager.add(SCHRIFTEN).catch(function () {});
      });
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (namen) {
      return Promise.all(namen.map(function (n) {
        if (n !== LAGER) return caches.delete(n);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;

  var url = e.request.url;
  var istSchrift = url.indexOf('fonts.googleapis.com') > -1 ||
                   url.indexOf('fonts.gstatic.com') > -1;

  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(function (treffer) {
      if (treffer) return treffer;

      return fetch(e.request).then(function (antwort) {
        /* Eigene Dateien ablegen, Schriften ebenfalls, damit sie im
           Wald nicht fehlen. Bei Schriften ist der Inhalt undurchsichtig,
           das macht nichts, der Browser kann ihn trotzdem verwenden. */
        var ablegen = antwort && (
          (antwort.status === 200 && antwort.type === 'basic') ||
          (istSchrift && (antwort.status === 200 || antwort.type === 'opaque'))
        );
        if (ablegen) {
          var kopie = antwort.clone();
          caches.open(LAGER).then(function (l) { l.put(e.request, kopie); });
        }
        return antwort;
      }).catch(function () {
        /* Kein Netz und nichts abgelegt. Bei Schriften einfach aufgeben,
           die Seite hat Ersatzschriften. */
        if (istSchrift) return new Response('', { status: 200, headers: { 'Content-Type': 'text/css' } });
        /* Szenenbilder: WebP gegen JPG tauschen und noch einmal schauen */
        if (/\.jpe?g$/i.test(url)) {
          return caches.match(url.replace(/\.jpe?g$/i, '.webp'), { ignoreSearch: true })
            .then(function (t) { return t || Response.error(); });
        }
        return Response.error();
      });
    })
  );
});

/* Die Startseite fragt nach, ob schon alles da ist */
self.addEventListener('message', function (e) {
  if (!e.data || e.data.frage !== 'stand') return;
  caches.open(LAGER).then(function (lager) {
    return lager.keys();
  }).then(function (liste) {
    e.source.postMessage({ antwort: 'stand', abgelegt: liste.length, gesamt: DATEIEN.length });
  });
});
