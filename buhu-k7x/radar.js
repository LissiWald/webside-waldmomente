/* ══════════════════════════════════════════
   Buhu, das kleine Waldgespenst
   Gemeinsamer Motor: Klang, Radar, Schreibmaschine, Risse
   Kein fremder Programmcode, alles selbst erzeugt.
   ══════════════════════════════════════════ */
(function (welt) {
  'use strict';

  var ruhig = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─────────── KLANG ─────────── */
  var Klang = {
    ctx: null,
    meister: null,
    wind: null,
    rauschen: null,
    an: true,

    wecken: function () {
      if (this.ctx) {
        if (this.ctx.state === 'suspended') this.ctx.resume();
        return;
      }
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) { this.an = false; return; }
      this.ctx = new AC();
      this.meister = this.ctx.createGain();
      this.meister.gain.value = this.an ? 0.9 : 0;
      this.meister.connect(this.ctx.destination);
    },

    /* Puffer mit weissem Rauschen */
    rauschPuffer: function (sekunden) {
      var n = Math.floor(this.ctx.sampleRate * sekunden);
      var puffer = this.ctx.createBuffer(1, n, this.ctx.sampleRate);
      var daten = puffer.getChannelData(0);
      for (var i = 0; i < n; i++) daten[i] = Math.random() * 2 - 1;
      return puffer;
    },

    /* Funkrauschen, leise und gefiltert */
    funkAn: function (lautstaerke) {
      if (!this.ctx || this.rauschen) return;
      var q = this.ctx.createBufferSource();
      q.buffer = this.rauschPuffer(2);
      q.loop = true;
      var band = this.ctx.createBiquadFilter();
      band.type = 'bandpass';
      band.frequency.value = 1400;
      band.Q.value = 0.8;
      var g = this.ctx.createGain();
      g.gain.value = lautstaerke === undefined ? 0.05 : lautstaerke;
      q.connect(band); band.connect(g); g.connect(this.meister);
      q.start();
      this.rauschen = { quelle: q, gain: g };
    },
    funkAus: function (dauer) {
      if (!this.rauschen) return;
      var r = this.rauschen, t = this.ctx.currentTime;
      this.rauschen = null;
      r.gain.gain.setValueAtTime(r.gain.gain.value, t);
      r.gain.gain.linearRampToValueAtTime(0, t + (dauer || 0.6));
      setTimeout(function () { try { r.quelle.stop(); } catch (e) {} }, (dauer || 0.6) * 1000 + 120);
    },

    /* Nachtwind im Hintergrund, langsam schwellend */
    windAn: function () {
      if (!this.ctx || this.wind) return;
      var q = this.ctx.createBufferSource();
      q.buffer = this.rauschPuffer(4);
      q.loop = true;
      var tief = this.ctx.createBiquadFilter();
      tief.type = 'lowpass';
      tief.frequency.value = 420;
      var g = this.ctx.createGain();
      g.gain.value = 0.035;
      /* langsames Schwellen */
      var lfo = this.ctx.createOscillator();
      lfo.frequency.value = 0.055;
      var lfoTiefe = this.ctx.createGain();
      lfoTiefe.gain.value = 0.022;
      lfo.connect(lfoTiefe); lfoTiefe.connect(g.gain);
      lfo.start();
      q.connect(tief); tief.connect(g); g.connect(this.meister);
      q.start();
      this.wind = { quelle: q, lfo: lfo };
    },

    /* Einfacher Ton mit Ausklang */
    ton: function (hz, dauer, art, spitze, verzug) {
      if (!this.ctx || !this.an) return;
      var t = this.ctx.currentTime + (verzug || 0);
      var o = this.ctx.createOscillator();
      var g = this.ctx.createGain();
      o.type = art || 'sine';
      o.frequency.setValueAtTime(hz, t);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(spitze === undefined ? 0.22 : spitze, t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dauer);
      o.connect(g); g.connect(this.meister);
      o.start(t); o.stop(t + dauer + 0.05);
      return o;
    },

    piep: function (verzug) { this.ton(1180, 0.1, 'sine', 0.13, verzug); },

    fundton: function (verzug) {
      this.ton(523.25, 0.5, 'sine', 0.2, verzug);
      this.ton(783.99, 0.6, 'sine', 0.15, (verzug || 0) + 0.08);
    },

    tippKlick: function () {
      if (!this.ctx || !this.an) return;
      var t = this.ctx.currentTime;
      var q = this.ctx.createBufferSource();
      q.buffer = this.rauschPuffer(0.03);
      var hp = this.ctx.createBiquadFilter();
      hp.type = 'highpass'; hp.frequency.value = 2600;
      var g = this.ctx.createGain();
      g.gain.setValueAtTime(0.035, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);
      q.connect(hp); hp.connect(g); g.connect(this.meister);
      q.start(t); q.stop(t + 0.04);
    },

    /* Warmer Klang, wenn ein Riss sich schliesst */
    flickenKlang: function () {
      if (!this.ctx || !this.an) return;
      [392.00, 523.25, 659.25].forEach(function (hz, i) {
        Klang.ton(hz, 1.1, 'sine', 0.16, i * 0.075);
      }, this);
    },

    /* Holzklang fuer das Klopfen */
    holz: function (verzug) {
      if (!this.ctx || !this.an) return;
      var t = this.ctx.currentTime + (verzug || 0);
      var q = this.ctx.createBufferSource();
      q.buffer = this.rauschPuffer(0.12);
      var bp = this.ctx.createBiquadFilter();
      bp.type = 'bandpass'; bp.frequency.value = 900; bp.Q.value = 5;
      var g = this.ctx.createGain();
      g.gain.setValueAtTime(0.3, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
      q.connect(bp); bp.connect(g); g.connect(this.meister);
      q.start(t); q.stop(t + 0.14);
      this.ton(230, 0.09, 'triangle', 0.14, verzug);
    },

    plopp: function () { this.ton(180, 0.14, 'sine', 0.1); },

    /* Schlussakkord */
    akkord: function () {
      if (!this.ctx || !this.an) return;
      [261.63, 329.63, 392.00, 523.25].forEach(function (hz, i) {
        Klang.ton(hz, 2.6, 'sine', 0.14, i * 0.1);
      });
    },

    /* Tiefes, langsames Klopfen des zweiten Gespensts */
    fremdesKlopfen: function () {
      if (!this.ctx || !this.an) return;
      [0, 0.62, 1.3].forEach(function (v) {
        var t = Klang.ctx.currentTime + v;
        var o = Klang.ctx.createOscillator();
        var g = Klang.ctx.createGain();
        o.type = 'sine';
        o.frequency.setValueAtTime(96, t);
        o.frequency.exponentialRampToValueAtTime(58, t + 0.2);
        g.gain.setValueAtTime(0.22, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
        o.connect(g); g.connect(Klang.meister);
        o.start(t); o.stop(t + 0.35);
      });
    },

    /* Geraeusche fuer Station 2 */
    eule: function (verzug) {
      if (!this.ctx || !this.an) return;
      var t = this.ctx.currentTime + (verzug || 0);
      [0, 0.42].forEach(function (v) {
        var o = Klang.ctx.createOscillator();
        var g = Klang.ctx.createGain();
        o.type = 'sine';
        o.frequency.setValueAtTime(430, t + v);
        o.frequency.linearRampToValueAtTime(372, t + v + 0.3);
        g.gain.setValueAtTime(0, t + v);
        g.gain.linearRampToValueAtTime(0.18, t + v + 0.07);
        g.gain.exponentialRampToValueAtTime(0.0001, t + v + 0.34);
        o.connect(g); g.connect(Klang.meister);
        o.start(t + v); o.stop(t + v + 0.4);
      });
    },
    astKnackt: function (verzug) {
      if (!this.ctx || !this.an) return;
      var t = this.ctx.currentTime + (verzug || 0);
      var q = this.ctx.createBufferSource();
      q.buffer = this.rauschPuffer(0.09);
      var bp = this.ctx.createBiquadFilter();
      bp.type = 'bandpass'; bp.frequency.value = 2100; bp.Q.value = 2.4;
      var g = this.ctx.createGain();
      g.gain.setValueAtTime(0.34, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
      q.connect(bp); bp.connect(g); g.connect(this.meister);
      q.start(t); q.stop(t + 0.1);
    },
    windstoss: function (verzug) {
      if (!this.ctx || !this.an) return;
      var t = this.ctx.currentTime + (verzug || 0);
      var q = this.ctx.createBufferSource();
      q.buffer = this.rauschPuffer(1.5);
      var lp = this.ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(300, t);
      lp.frequency.linearRampToValueAtTime(900, t + 0.6);
      lp.frequency.linearRampToValueAtTime(280, t + 1.3);
      var g = this.ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.2, t + 0.5);
      g.gain.linearRampToValueAtTime(0, t + 1.35);
      q.connect(lp); lp.connect(g); g.connect(this.meister);
      q.start(t); q.stop(t + 1.4);
    },
    rascheln: function (verzug) {
      if (!this.ctx || !this.an) return;
      var t0 = this.ctx.currentTime + (verzug || 0);
      for (var i = 0; i < 11; i++) {
        var t = t0 + i * 0.065 + Math.random() * 0.03;
        var q = this.ctx.createBufferSource();
        q.buffer = this.rauschPuffer(0.05);
        var hp = this.ctx.createBiquadFilter();
        hp.type = 'highpass'; hp.frequency.value = 3200;
        var g = this.ctx.createGain();
        g.gain.setValueAtTime(0.07 + Math.random() * 0.05, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
        q.connect(hp); hp.connect(g); g.connect(this.meister);
        q.start(t); q.stop(t + 0.06);
      }
    },
    specht: function (verzug) {
      if (!this.ctx || !this.an) return;
      for (var i = 0; i < 7; i++) this.holz((verzug || 0) + i * 0.055);
    },

    schalten: function (an) {
      this.an = an;
      if (this.meister) {
        this.meister.gain.setTargetAtTime(an ? 0.9 : 0, this.ctx.currentTime, 0.05);
      }
    }
  };

  /* ─────────── RADAR ─────────── */
  function Radar(leinwand) {
    this.c = leinwand;
    this.ctx = leinwand.getContext('2d');
    this.winkel = 0;
    this.laeuft = false;
    this.fund = null;     /* {x, y} in Einheiten von -1 bis 1 */
    this.glimmen = 0;     /* 0 bis 1, fuer Station 7 */
    this.zweiterPunkt = false;
    this.skalieren();
    var selbst = this;
    window.addEventListener('resize', function () { selbst.skalieren(); });
  }
  Radar.prototype.skalieren = function () {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var b = this.c.getBoundingClientRect();
    var groesse = Math.max(b.width, 240);
    this.c.width = groesse * dpr;
    this.c.height = groesse * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.gr = groesse;
    if (!this.laeuft) this.malen();
  };
  Radar.prototype.start = function () {
    if (this.laeuft) return;
    this.laeuft = true;
    var selbst = this;
    (function schleife() {
      if (!selbst.laeuft) return;
      selbst.winkel += ruhig ? 0.016 : 0.027;
      selbst.malen();
      requestAnimationFrame(schleife);
    })();
  };
  Radar.prototype.stopp = function () { this.laeuft = false; };
  Radar.prototype.malen = function () {
    var g = this.ctx, s = this.gr, m = s / 2, r = m * 0.93;
    g.clearRect(0, 0, s, s);

    /* Grund */
    var grund = g.createRadialGradient(m, m, 0, m, m, r);
    grund.addColorStop(0, 'rgba(45,74,53,.62)');
    grund.addColorStop(1, 'rgba(20,26,18,.95)');
    g.fillStyle = grund;
    g.beginPath(); g.arc(m, m, r, 0, Math.PI * 2); g.fill();

    /* Glimmen (Station 7) */
    if (this.glimmen > 0) {
      var gl = g.createRadialGradient(m, m, 0, m, m, r);
      gl.addColorStop(0, 'rgba(200,169,110,' + (0.5 * this.glimmen) + ')');
      gl.addColorStop(1, 'rgba(200,169,110,0)');
      g.fillStyle = gl;
      g.beginPath(); g.arc(m, m, r, 0, Math.PI * 2); g.fill();
    }

    /* Ringe */
    g.strokeStyle = 'rgba(159,212,166,.26)';
    g.lineWidth = 1;
    for (var i = 1; i <= 4; i++) {
      g.beginPath(); g.arc(m, m, r * i / 4, 0, Math.PI * 2); g.stroke();
    }
    /* Fadenkreuz */
    g.beginPath();
    g.moveTo(m - r, m); g.lineTo(m + r, m);
    g.moveTo(m, m - r); g.lineTo(m, m + r);
    g.stroke();

    /* Suchstrahl mit Schweif */
    if (this.laeuft) {
      var schweif = Math.PI / 2.6;
      for (var k = 0; k < 26; k++) {
        var a = this.winkel - (k / 26) * schweif;
        g.beginPath();
        g.moveTo(m, m);
        g.arc(m, m, r, a - 0.03, a);
        g.closePath();
        g.fillStyle = 'rgba(159,212,166,' + (0.17 * (1 - k / 26)) + ')';
        g.fill();
      }
      g.beginPath();
      g.moveTo(m, m);
      g.lineTo(m + Math.cos(this.winkel) * r, m + Math.sin(this.winkel) * r);
      g.strokeStyle = 'rgba(159,212,166,.85)';
      g.lineWidth = 2;
      g.stroke();
    }

    /* Fundpunkt */
    if (this.fund) {
      var fx = m + this.fund.x * r * 0.62;
      var fy = m + this.fund.y * r * 0.62;
      var puls = ruhig ? 0.8 : (0.55 + 0.45 * Math.abs(Math.sin(Date.now() / 420)));
      var leucht = g.createRadialGradient(fx, fy, 0, fx, fy, 22);
      leucht.addColorStop(0, 'rgba(239,232,216,' + puls + ')');
      leucht.addColorStop(0.35, 'rgba(159,212,166,' + (puls * 0.55) + ')');
      leucht.addColorStop(1, 'rgba(159,212,166,0)');
      g.fillStyle = leucht;
      g.beginPath(); g.arc(fx, fy, 22, 0, Math.PI * 2); g.fill();
      g.fillStyle = 'rgba(239,232,216,' + puls + ')';
      g.beginPath(); g.arc(fx, fy, 4.5, 0, Math.PI * 2); g.fill();
    }

    /* Zweiter winziger Punkt am Rand (Ende Station 7) */
    if (this.zweiterPunkt) {
      var zp = 0.4 + 0.6 * Math.abs(Math.sin(Date.now() / 700));
      var zx = m + Math.cos(-0.72) * r * 0.9;
      var zy = m + Math.sin(-0.72) * r * 0.9;
      g.fillStyle = 'rgba(200,169,110,' + zp + ')';
      g.beginPath(); g.arc(zx, zy, 3, 0, Math.PI * 2); g.fill();
    }

    /* Rand */
    g.strokeStyle = 'rgba(200,169,110,.45)';
    g.lineWidth = 2;
    g.beginPath(); g.arc(m, m, r, 0, Math.PI * 2); g.stroke();
  };

  /* ─────────── SIGNALBALKEN ─────────── */
  function Signal(wurzel) { this.balken = wurzel.querySelectorAll('span'); }
  Signal.prototype.setzen = function (n) {
    for (var i = 0; i < this.balken.length; i++) {
      this.balken[i].classList.toggle('an', i < n);
    }
  };

  /* ─────────── SCHREIBMASCHINE ─────────── */
  function schreiben(feld, text, fertig, tempo, pauseProZeile) {
    feld.textContent = '';
    var cursor = document.createElement('span');
    cursor.className = 'cursor';
    feld.appendChild(cursor);

    if (ruhig) {
      feld.innerHTML = alsHtml(text);
      if (fertig) fertig();
      return { abbrechen: function () {} };
    }

    var i = 0, abgebrochen = false;
    var schritt = tempo || 34;

    function naechster() {
      if (abgebrochen) return;
      if (i >= text.length) {
        cursor.remove();
        if (fertig) fertig();
        return;
      }
      var z = text.charAt(i);
      var knoten;
      if (z === '_') {
        knoten = document.createElement('span');
        knoten.className = 'luecke';
        knoten.textContent = '_';
      } else {
        knoten = document.createTextNode(z);
      }
      feld.insertBefore(knoten, cursor);
      if (z.trim()) Klang.tippKlick();
      i++;
      var wartet = schritt;
      if (z === '\n') wartet = pauseProZeile || 260;
      else if ('.!?'.indexOf(z) >= 0) wartet = schritt * 7;
      else if (z === ',') wartet = schritt * 3;
      setTimeout(naechster, wartet);
    }
    setTimeout(naechster, 260);
    return { abbrechen: function () { abgebrochen = true; cursor.remove(); feld.innerHTML = alsHtml(text); } };
  }

  function alsHtml(text) {
    var sicher = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return sicher.replace(/_/g, '<span class="luecke">_</span>');
  }

  /* ─────────── BUHU MIT SIEBEN RISSEN ─────────── */
  /* Riss 7 sitzt in Brusthoehe, dort wo das Herz waere. */
  var RISSE = [
    { x: 30,  y: 44,  d: 'M0,0 l7,-5 l6,6 l-7,4 z',       drehung: -18 },
    { x: 68,  y: 38,  d: 'M0,0 l8,4 l-3,7 l-7,-4 z',      drehung: 12 },
    { x: 24,  y: 72,  d: 'M0,0 l9,-3 l2,7 l-8,3 z',       drehung: 24 },
    { x: 74,  y: 70,  d: 'M0,0 l6,6 l-6,5 l-4,-7 z',      drehung: -8 },
    { x: 44,  y: 92,  d: 'M0,0 l9,2 l-2,8 l-8,-3 z',      drehung: 6 },
    { x: 62,  y: 100, d: 'M0,0 l7,-4 l5,6 l-7,5 z',       drehung: -22 },
    { x: 49,  y: 60,  d: 'M0,0 l8,-4 l5,7 l-8,5 z',       drehung: 0 }
  ];

  function buhuSvg() {
    var risse = '', flicken = '';
    RISSE.forEach(function (r, i) {
      var n = i + 1;
      risse += '<g class="riss" data-riss="' + n + '" transform="translate(' + r.x + ',' + r.y + ') rotate(' + r.drehung + ')">' +
               '<path d="' + r.d + '" fill="#141a12" opacity=".92"/>' +
               '</g>';
      flicken += '<g class="flicken" data-flicken="' + n + '" transform="translate(' + r.x + ',' + r.y + ') rotate(' + r.drehung + ')">' +
                 '<path d="M-1,-2 l12,-5 l7,9 l-11,8 z" fill="#2D4A35" stroke="#C8A96E" stroke-width="1.1" stroke-linejoin="round"/>' +
                 '<path d="M-1,-2 l12,-5 l7,9 l-11,8 z" fill="none" stroke="#C8A96E" stroke-width=".8" stroke-dasharray="2 2.4" opacity=".9"/>' +
                 '</g>';
    });

    return '' +
    '<svg viewBox="0 0 100 140" role="img" aria-label="Buhu, das kleine Waldgespenst">' +
      '<defs>' +
        '<linearGradient id="laken" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0" stop-color="#F6F1E5"/>' +
          '<stop offset="1" stop-color="#C9C3B2"/>' +
        '</linearGradient>' +
      '</defs>' +
      '<g class="buhu-koerper">' +
        /* Laken mit gewelltem Saum */
        '<path d="M50,8 C72,8 86,26 86,50 L86,104 ' +
                 'q-6,10 -12,0 q-6,10 -12,0 q-6,10 -12,0 q-6,10 -12,0 q-6,10 -12,0 ' +
                 'L14,50 C14,26 28,8 50,8 Z" fill="url(#laken)"/>' +
        /* Eichenblatt auf dem Kopf */
        '<g transform="translate(50,9) rotate(-16)">' +
          '<path d="M0,0 c5,-4 10,-3 12,2 c4,-2 7,1 6,5 c3,1 3,5 0,6 c-2,4 -7,4 -10,1 ' +
                   'c-4,2 -9,0 -9,-4 c-3,-2 -2,-8 1,-10 z" fill="#8B6847"/>' +
          '<path d="M-1,1 L9,13" stroke="#6B4F36" stroke-width="1" fill="none"/>' +
        '</g>' +
        /* Augen */
        '<ellipse class="auge" cx="39" cy="52" rx="5.2" ry="6.6" fill="#1C2318"/>' +
        '<ellipse class="auge" cx="61" cy="52" rx="5.2" ry="6.6" fill="#1C2318"/>' +
        '<circle cx="40.6" cy="49.8" r="1.5" fill="#F6F1E5" opacity=".85"/>' +
        '<circle cx="62.6" cy="49.8" r="1.5" fill="#F6F1E5" opacity=".85"/>' +
        /* Mund */
        '<path d="M45,67 q5,4 10,0" stroke="#1C2318" stroke-width="2" fill="none" stroke-linecap="round"/>' +
        risse +
        flicken +
      '</g>' +
    '</svg>';
  }

  function BuhuFigur(wurzel) {
    wurzel.innerHTML = buhuSvg();
    this.wurzel = wurzel;
  }
  BuhuFigur.prototype.setzeGeschlossen = function (anzahl) {
    for (var n = 1; n <= 7; n++) {
      var f = this.wurzel.querySelector('[data-flicken="' + n + '"]');
      var r = this.wurzel.querySelector('[data-riss="' + n + '"]');
      var zu = n <= anzahl;
      f.classList.toggle('zu', zu);
      if (r) r.style.opacity = zu ? '0' : '1';
    }
  };
  BuhuFigur.prototype.schliessen = function (n, fertig) {
    var f = this.wurzel.querySelector('[data-flicken="' + n + '"]');
    var r = this.wurzel.querySelector('[data-riss="' + n + '"]');
    if (!f) { if (fertig) fertig(); return; }
    if (r) r.style.opacity = '0';
    f.classList.add('zu', 'schliesst');
    Klang.flickenKlang();
    setTimeout(function () { f.classList.remove('schliesst'); if (fertig) fertig(); }, ruhig ? 60 : 950);
  };
  BuhuFigur.prototype.naehteLeuchten = function () {
    var k = this.wurzel.querySelector('.buhu-koerper');
    if (!k) return;
    k.classList.add('naht-leuchten');
    setTimeout(function () { k.classList.remove('naht-leuchten'); }, 1700);
  };

  /* ─────────── STATIONS-ABLAUF ─────────── */
  var BUHU = {
    ruhig: ruhig,
    Klang: Klang,

    /* Baut Kopfzeile, Radar, Signal, Buhu und verkabelt den Tonschalter */
    aufbauen: function (einst) {
      var selbst = this;
      this.station = einst.station;

      var tonKnopf = document.getElementById('tonKnopf');
      if (tonKnopf) {
        tonKnopf.addEventListener('click', function () {
          var jetztAn = !Klang.an;
          Klang.schalten(jetztAn);
          tonKnopf.textContent = jetztAn ? 'Ton aus' : 'Ton an';
          tonKnopf.setAttribute('aria-pressed', String(!jetztAn));
        });
      }

      var feld = document.getElementById('radarCanvas');
      this.radar = feld ? new Radar(feld) : null;

      var sig = document.getElementById('signal');
      this.signal = sig ? new Signal(sig) : null;

      var fig = document.getElementById('buhuFigur');
      this.figur = fig ? new BuhuFigur(fig) : null;
      if (this.figur) this.figur.setzeGeschlossen(einst.station - 1);

      this.status = document.getElementById('statuszeile');
      this.nachrichtFeld = document.getElementById('nachricht');
      return this;
    },

    sagen: function (text) { if (this.status) this.status.textContent = text; },

    /* Radar einschalten, suchen, finden. Danach Rueckruf. */
    suchen: function (fertig) {
      var selbst = this;
      Klang.wecken();
      Klang.windAn();
      Klang.funkAn();
      if (this.radar) this.radar.start();
      this.sagen('Suche Signal');
      if (this.signal) this.signal.setzen(1);

      var schritte = [
        [700,  function () { if (selbst.signal) selbst.signal.setzen(2); Klang.piep(); }],
        [1500, function () { if (selbst.signal) selbst.signal.setzen(3); selbst.sagen('Etwas ist da'); Klang.piep(); }],
        [2300, function () { if (selbst.signal) selbst.signal.setzen(4); }],
        [3000, function () {
          if (selbst.signal) selbst.signal.setzen(5);
          selbst.sagen('Signal gefunden');
          if (selbst.radar) selbst.radar.fund = { x: -0.34, y: 0.26 };
          Klang.fundton();
          Klang.funkAus(1.4);
          if (fertig) fertig();
        }]
      ];
      schritte.forEach(function (s) { setTimeout(s[1], ruhig ? s[0] / 3 : s[0]); });
    },

    /* Buhus Nachricht tippen */
    nachricht: function (text, fertig, tempo, zeilenpause) {
      if (!this.nachrichtFeld) { if (fertig) fertig(); return; }
      return schreiben(this.nachrichtFeld, text, fertig, tempo, zeilenpause);
    },

    /* Szenenbild weich einblenden */
    bildZeigen: function (id, fertig) {
      var s = document.getElementById(id || 'szene');
      if (!s) { if (fertig) fertig(); return; }
      s.hidden = false;
      requestAnimationFrame(function () {
        s.classList.add('sichtbar');
        setTimeout(function () { if (fertig) fertig(); }, ruhig ? 50 : 1400);
      });
    },

    zeigen: function (id) { var e = document.getElementById(id); if (e) e.hidden = false; },
    verstecken: function (id) { var e = document.getElementById(id); if (e) e.hidden = true; },

    /* Riss schliessen und den Abschluss der Station zeigen */
    rissSchliessen: function (fertig) {
      var selbst = this;
      var n = this.station;
      if (this.figur) {
        this.figur.schliessen(n, function () {
          selbst.abschlussZeigen(n);
          if (fertig) fertig();
        });
      } else {
        this.abschlussZeigen(n);
        if (fertig) fertig();
      }
    },

    abschlussZeigen: function (n) {
      var a = document.getElementById('abschluss');
      if (!a) return;
      var zeile = a.querySelector('.abschluss__zeile');
      var hinweis = a.querySelector('.abschluss__hinweis');
      if (zeile) zeile.textContent = 'Riss geschlossen.';
      if (hinweis) hinweis.textContent = 'Malt auf eurem Zettel Flicken Nummer ' + n + ' aus.';
      a.hidden = false;
      a.scrollIntoView({ behavior: ruhig ? 'auto' : 'smooth', block: 'center' });
    },

    /* Freundliche Rueckmeldung */
    ruecksagen: function (text) {
      var r = document.getElementById('ruecksage');
      if (r) r.textContent = text || '';
    },

    mischen: function (liste) {
      var a = liste.slice();
      for (var i = a.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = a[i]; a[i] = a[j]; a[j] = t;
      }
      return a;
    }
  };

  welt.BUHU = BUHU;
  welt.BuhuKlang = Klang;
})(window);
