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
      this.meister.gain.value = this.an ? 1.0 : 0;
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
      g.gain.linearRampToValueAtTime(spitze === undefined ? 0.5 : spitze, t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dauer);
      o.connect(g); g.connect(this.meister);
      o.start(t); o.stop(t + dauer + 0.05);
      return o;
    },

    piep: function (verzug) { this.ton(1180, 0.12, 'sine', 0.34, verzug); },

    fundton: function (verzug) {
      this.ton(523.25, 0.5, 'sine', 0.46, verzug);
      this.ton(783.99, 0.6, 'sine', 0.36, (verzug || 0) + 0.08);
    },

    tippKlick: function () {
      if (!this.ctx || !this.an) return;
      var t = this.ctx.currentTime;
      var q = this.ctx.createBufferSource();
      q.buffer = this.rauschPuffer(0.03);
      var hp = this.ctx.createBiquadFilter();
      hp.type = 'highpass'; hp.frequency.value = 2600;
      var g = this.ctx.createGain();
      g.gain.setValueAtTime(0.06, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);
      q.connect(hp); hp.connect(g); g.connect(this.meister);
      q.start(t); q.stop(t + 0.04);
    },

    /* Warmer Klang, wenn ein Riss sich schliesst */
    flickenKlang: function () {
      if (!this.ctx || !this.an) return;
      [392.00, 523.25, 659.25].forEach(function (hz, i) {
        Klang.ton(hz, 1.1, 'sine', 0.38, i * 0.075);
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
      g.gain.setValueAtTime(0.85, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
      q.connect(bp); bp.connect(g); g.connect(this.meister);
      q.start(t); q.stop(t + 0.14);
      this.ton(230, 0.12, 'triangle', 0.5, verzug);
    },

    plopp: function () { this.ton(180, 0.16, 'sine', 0.32); },

    /* Schlussakkord */
    akkord: function () {
      if (!this.ctx || !this.an) return;
      [261.63, 329.63, 392.00, 523.25].forEach(function (hz, i) {
        Klang.ton(hz, 2.6, 'sine', 0.3, i * 0.1);
      });
    },

    /* Klopfen des zweiten Gespensts. Tiefer und langsamer als Buhus
       Klopfen, aber hoch genug, damit ein Handylautsprecher es wiedergibt.
       Unter etwa 150 Hz kommt dort nichts mehr an. */
    fremdesKlopfen: function () {
      if (!this.ctx || !this.an) return;
      [0, 0.72, 1.5].forEach(function (v) {
        var t = Klang.ctx.currentTime + v;

        /* Anschlag: kurzer harter Impuls, der traegt */
        var q = Klang.ctx.createBufferSource();
        q.buffer = Klang.rauschPuffer(0.08);
        var bp = Klang.ctx.createBiquadFilter();
        bp.type = 'bandpass'; bp.frequency.value = 420; bp.Q.value = 3;
        var qg = Klang.ctx.createGain();
        qg.gain.setValueAtTime(0.5, t);
        qg.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
        q.connect(bp); bp.connect(qg); qg.connect(Klang.meister);
        q.start(t); q.stop(t + 0.09);

        /* Holzkoerper darunter */
        var o = Klang.ctx.createOscillator();
        var g = Klang.ctx.createGain();
        o.type = 'triangle';
        o.frequency.setValueAtTime(260, t);
        o.frequency.exponentialRampToValueAtTime(165, t + 0.22);
        g.gain.setValueAtTime(0.34, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
        o.connect(g); g.connect(Klang.meister);
        o.start(t); o.stop(t + 0.36);
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
        this.meister.gain.setTargetAtTime(an ? 1.0 : 0, this.ctx.currentTime, 0.05);
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
    var g = this.ctx, s = this.gr, m = s / 2, r = m * 0.88;
    var jetzt = Date.now();
    g.clearRect(0, 0, s, s);

    /* ── Aussenring mit Teilstrichen ── */
    g.save();
    g.translate(m, m);
    g.rotate(this.winkel * 0.12);
    for (var t = 0; t < 72; t++) {
      var gross = t % 6 === 0;
      var a = (t / 72) * Math.PI * 2;
      var i1 = r * (gross ? 1.055 : 1.075), i2 = r * 1.105;
      g.beginPath();
      g.moveTo(Math.cos(a) * i1, Math.sin(a) * i1);
      g.lineTo(Math.cos(a) * i2, Math.sin(a) * i2);
      g.strokeStyle = gross ? 'rgba(200,169,110,.55)' : 'rgba(200,169,110,.2)';
      g.lineWidth = gross ? 2 : 1;
      g.stroke();
    }
    g.restore();

    /* ── Grund mit Tiefe ── */
    var grund = g.createRadialGradient(m, m * 0.82, 0, m, m, r);
    grund.addColorStop(0,   'rgba(58,92,66,.72)');
    grund.addColorStop(0.5, 'rgba(36,58,42,.85)');
    grund.addColorStop(1,   'rgba(16,22,15,.97)');
    g.fillStyle = grund;
    g.beginPath(); g.arc(m, m, r, 0, Math.PI * 2); g.fill();

    /* ── Glimmen (Station 7) ── */
    if (this.glimmen > 0) {
      var gl = g.createRadialGradient(m, m, 0, m, m, r);
      gl.addColorStop(0, 'rgba(200,169,110,' + (0.6 * this.glimmen) + ')');
      gl.addColorStop(0.6, 'rgba(200,169,110,' + (0.2 * this.glimmen) + ')');
      gl.addColorStop(1, 'rgba(200,169,110,0)');
      g.fillStyle = gl;
      g.beginPath(); g.arc(m, m, r, 0, Math.PI * 2); g.fill();
    }

    g.save();
    g.beginPath(); g.arc(m, m, r, 0, Math.PI * 2); g.clip();

    /* ── Entfernungsringe ── */
    for (var i = 1; i <= 4; i++) {
      g.beginPath(); g.arc(m, m, r * i / 4, 0, Math.PI * 2);
      g.strokeStyle = i === 4 ? 'rgba(159,212,166,.34)' : 'rgba(159,212,166,.2)';
      g.lineWidth = 1;
      g.stroke();
    }

    /* ── Fadenkreuz mit Luecke in der Mitte ── */
    g.strokeStyle = 'rgba(159,212,166,.26)';
    g.lineWidth = 1;
    var luecke = r * 0.07;
    [[1,0],[-1,0],[0,1],[0,-1]].forEach(function (d) {
      g.beginPath();
      g.moveTo(m + d[0]*luecke, m + d[1]*luecke);
      g.lineTo(m + d[0]*r, m + d[1]*r);
      g.stroke();
    });
    /* Diagonalen, feiner */
    g.strokeStyle = 'rgba(159,212,166,.12)';
    [[0.707,0.707],[-0.707,0.707],[0.707,-0.707],[-0.707,-0.707]].forEach(function (d) {
      g.beginPath();
      g.moveTo(m + d[0]*luecke, m + d[1]*luecke);
      g.lineTo(m + d[0]*r, m + d[1]*r);
      g.stroke();
    });

    /* ── Rauschpunkte, die der Strahl aufwirbelt ── */
    if (this.laeuft) {
      if (!this.punkte) {
        this.punkte = [];
        for (var k = 0; k < 26; k++) {
          this.punkte.push({ a: Math.random()*Math.PI*2, d: 0.2 + Math.random()*0.78, gr: 0.7 + Math.random()*1.6 });
        }
      }
      var selbst = this;
      this.punkte.forEach(function (p) {
        /* heller, wenn der Strahl gerade vorbeikam */
        var diff = ((selbst.winkel - p.a) % (Math.PI*2) + Math.PI*2) % (Math.PI*2);
        var frisch = Math.max(0, 1 - diff / (Math.PI / 1.6));
        if (frisch <= 0.02) return;
        var px = m + Math.cos(p.a) * r * p.d;
        var py = m + Math.sin(p.a) * r * p.d;
        g.fillStyle = 'rgba(159,212,166,' + (0.5 * frisch) + ')';
        g.beginPath(); g.arc(px, py, p.gr, 0, Math.PI*2); g.fill();
      });
    }

    /* ── Suchstrahl mit langem Schweif ── */
    if (this.laeuft) {
      var schweif = Math.PI / 1.5;
      var stufen = 42;
      for (var q = 0; q < stufen; q++) {
        var aa = this.winkel - (q / stufen) * schweif;
        var staerke = Math.pow(1 - q / stufen, 1.7);
        g.beginPath();
        g.moveTo(m, m);
        g.arc(m, m, r, aa - 0.028, aa);
        g.closePath();
        g.fillStyle = 'rgba(159,212,166,' + (0.2 * staerke) + ')';
        g.fill();
      }
      /* Vorderkante, hell und mit Schein */
      var ex = m + Math.cos(this.winkel) * r;
      var ey = m + Math.sin(this.winkel) * r;
      var kante = g.createLinearGradient(m, m, ex, ey);
      kante.addColorStop(0,   'rgba(159,212,166,.15)');
      kante.addColorStop(0.7, 'rgba(200,232,205,.75)');
      kante.addColorStop(1,   'rgba(239,232,216,.95)');
      g.strokeStyle = kante;
      g.lineWidth = 2.4;
      g.beginPath(); g.moveTo(m, m); g.lineTo(ex, ey); g.stroke();
      /* Lichtpunkt am Rand */
      var sp = g.createRadialGradient(ex, ey, 0, ex, ey, 14);
      sp.addColorStop(0, 'rgba(239,232,216,.8)');
      sp.addColorStop(1, 'rgba(159,212,166,0)');
      g.fillStyle = sp;
      g.beginPath(); g.arc(ex, ey, 14, 0, Math.PI*2); g.fill();
    }

    /* ── Fundpunkt mit auslaufenden Ringen ── */
    if (this.fund) {
      var fx = m + this.fund.x * r * 0.62;
      var fy = m + this.fund.y * r * 0.62;

      if (!ruhig) {
        for (var w = 0; w < 3; w++) {
          var ph = ((jetzt / 1500) + w / 3) % 1;
          var rad = ph * r * 0.42;
          g.beginPath(); g.arc(fx, fy, rad, 0, Math.PI*2);
          g.strokeStyle = 'rgba(239,232,216,' + (0.5 * (1 - ph)) + ')';
          g.lineWidth = 1.6;
          g.stroke();
        }
      }

      var puls = ruhig ? 0.85 : (0.6 + 0.4 * Math.abs(Math.sin(jetzt / 380)));
      var leucht = g.createRadialGradient(fx, fy, 0, fx, fy, 30);
      leucht.addColorStop(0,    'rgba(255,255,255,' + puls + ')');
      leucht.addColorStop(0.22, 'rgba(239,232,216,' + (puls * 0.8) + ')');
      leucht.addColorStop(0.55, 'rgba(159,212,166,' + (puls * 0.35) + ')');
      leucht.addColorStop(1,    'rgba(159,212,166,0)');
      g.fillStyle = leucht;
      g.beginPath(); g.arc(fx, fy, 30, 0, Math.PI*2); g.fill();
      g.fillStyle = 'rgba(255,255,255,' + puls + ')';
      g.beginPath(); g.arc(fx, fy, 4.6, 0, Math.PI*2); g.fill();
    }

    /* ── Zweiter winziger Punkt am Rand (Ende Station 7) ── */
    if (this.zweiterPunkt) {
      var zp = 0.35 + 0.65 * Math.abs(Math.sin(jetzt / 700));
      var zx = m + Math.cos(-0.72) * r * 0.9;
      var zy = m + Math.sin(-0.72) * r * 0.9;
      var zg = g.createRadialGradient(zx, zy, 0, zx, zy, 11);
      zg.addColorStop(0, 'rgba(200,169,110,' + zp + ')');
      zg.addColorStop(1, 'rgba(200,169,110,0)');
      g.fillStyle = zg;
      g.beginPath(); g.arc(zx, zy, 11, 0, Math.PI*2); g.fill();
      g.fillStyle = 'rgba(200,169,110,' + zp + ')';
      g.beginPath(); g.arc(zx, zy, 2.6, 0, Math.PI*2); g.fill();
    }

    /* ── Feine Abtastzeilen ── */
    if (!ruhig) {
      g.globalAlpha = 0.055;
      g.strokeStyle = '#9FD4A6';
      g.lineWidth = 1;
      for (var y = (jetzt / 55 % 4); y < s; y += 4) {
        g.beginPath(); g.moveTo(0, y); g.lineTo(s, y); g.stroke();
      }
      g.globalAlpha = 1;
    }

    /* ── Abdunkeln zum Rand hin ── */
    var vig = g.createRadialGradient(m, m, r * 0.52, m, m, r);
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(1, 'rgba(0,0,0,.42)');
    g.fillStyle = vig;
    g.beginPath(); g.arc(m, m, r, 0, Math.PI*2); g.fill();

    g.restore();

    /* ── Glasrand ── */
    g.beginPath(); g.arc(m, m, r, 0, Math.PI*2);
    g.strokeStyle = 'rgba(200,169,110,.75)';
    g.lineWidth = 2.5;
    g.stroke();
    g.beginPath(); g.arc(m, m, r * 0.985, 0, Math.PI*2);
    g.strokeStyle = 'rgba(239,232,216,.18)';
    g.lineWidth = 1;
    g.stroke();
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
  /* Koerper im viewBox 0 0 100 140: x von 15 bis 85, y von 10 bis 100.
     Das Gesicht belegt jetzt die Mitte: Brauen ab y 37, Augen x 32 bis 44
     und x 56 bis 68 bei y 45 bis 59, Wangen bis y 68, Mund bis y 74.
     Die Flicken sitzen deshalb an den Seiten und unten.
     Riss 7 sitzt in Brusthoehe, dort wo das Herz waere. */
  var RISSE = [
    { x: 18, y: 42, drehung: -16 },
    { x: 72, y: 42, drehung: 14 },
    { x: 19, y: 70, drehung: 22 },
    { x: 74, y: 68, drehung: -10 },
    { x: 26, y: 88, drehung: 8 },
    { x: 64, y: 88, drehung: -20 },
    { x: 42, y: 84, drehung: 0 }
  ];
  var RISS_FORM    = 'M0,0 l6,-2 l2,5 l-5,3 z';
  var FLICKEN_FORM = 'M-1,-1 l8,-3 l3,6 l-7,4 z';

  function buhuSvg() {
    var risse = '', flicken = '';
    RISSE.forEach(function (r, i) {
      var n = i + 1;
      var lage = 'translate(' + r.x + ',' + r.y + ') rotate(' + r.drehung + ')';
      /* Die Lage sitzt in einer aeusseren Gruppe. Die innere traegt die
         Animation. Sonst wuerde transform-origin aus dem CSS auch auf das
         SVG-Attribut wirken und den Flicken verschieben. */
      risse += '<g transform="' + lage + '">' +
               '<g class="riss" data-riss="' + n + '">' +
               '<path d="' + RISS_FORM + '" fill="#141a12" opacity=".9"/>' +
               '</g></g>';
      flicken += '<g transform="' + lage + '">' +
                 '<g class="flicken" data-flicken="' + n + '">' +
                 '<path d="' + FLICKEN_FORM + '" fill="#2D4A35" stroke="#C8A96E" stroke-width="1" stroke-linejoin="round"/>' +
                 '<path d="' + FLICKEN_FORM + '" fill="none" stroke="#C8A96E" stroke-width=".7" stroke-dasharray="1.8 2.2" opacity=".9"/>' +
                 '</g></g>';
    });

    return '' +
    '<svg viewBox="0 0 100 140" role="img" aria-label="Buhu, das kleine Waldgespenst">' +
      '<defs>' +
        '<radialGradient id="laken" cx="38%" cy="28%" r="78%">' +
          '<stop offset="0" stop-color="#FFFDF6"/>' +
          '<stop offset="55%" stop-color="#F3EDDC"/>' +
          '<stop offset="1" stop-color="#D8CFB8"/>' +
        '</radialGradient>' +
        '<radialGradient id="wange" cx="50%" cy="50%" r="50%">' +
          '<stop offset="0" stop-color="#E8A89A" stop-opacity=".55"/>' +
          '<stop offset="1" stop-color="#E8A89A" stop-opacity="0"/>' +
        '</radialGradient>' +
        '<linearGradient id="blatt" x1="0" y1="0" x2="1" y2="1">' +
          '<stop offset="0" stop-color="#C2672A"/>' +
          '<stop offset="1" stop-color="#8B4513"/>' +
        '</linearGradient>' +
        '<filter id="schein" x="-35%" y="-35%" width="170%" height="170%">' +
          '<feGaussianBlur stdDeviation="3.2" result="w"/>' +
          '<feMerge><feMergeNode in="w"/><feMergeNode in="SourceGraphic"/></feMerge>' +
        '</filter>' +
      '</defs>' +

      '<g class="buhu-koerper" filter="url(#schein)">' +

        /* Koerper: hohe runde Kuppe, weicher Wellensaum */
        '<path d="M50,10 ' +
                 'C70,10 84,25 85,46 ' +
                 'C86,62 85,80 85,98 ' +
                 'q-5.5,11 -11,0 q-5.5,11 -11,0 q-5.5,11 -11,0 ' +
                 'q-5.5,11 -11,0 q-5.5,11 -11,0 q-5.5,11 -8,-2 ' +
                 'C15,80 14,62 15,46 ' +
                 'C16,25 30,10 50,10 Z" fill="url(#laken)"/>' +

        /* Aermchen seitlich */
        '<path d="M15,58 c-6,-2 -10,2 -9,6 c1,4 6,5 9,2 z" fill="url(#laken)"/>' +
        '<path d="M85,58 c6,-2 10,2 9,6 c-1,4 -6,5 -9,2 z" fill="url(#laken)"/>' +

        /* Eichenblatt schraeg auf dem Kopf. Bewusst einfach gehalten,
           feine Lappen verschwinden bei dieser Groesse zu einem Klecks. */
        '<g transform="translate(47,14) rotate(-24)">' +
          '<path d="M0,0 C1,-7 7,-13 15,-14 C19,-10 21,-10 24,-12 ' +
                   'C25,-7 27,-6 30,-6 C28,-2 29,1 31,3 ' +
                   'C27,4 26,7 26,10 C22,8 19,9 17,12 ' +
                   'C13,8 7,6 0,0 Z" fill="url(#blatt)"/>' +
          '<path d="M0,0 C8,-2 16,-5 24,-10" stroke="#6B4F36" stroke-width="1" fill="none" stroke-linecap="round" opacity=".75"/>' +
          '<path d="M8,-2 l2,4 M15,-4 l2,4 M21,-7 l2,4" stroke="#6B4F36" stroke-width=".7" fill="none" stroke-linecap="round" opacity=".6"/>' +
          '<path d="M0,0 c-3,1 -5,3 -5,6" stroke="#6B4F36" stroke-width="1.3" fill="none" stroke-linecap="round"/>' +
        '</g>' +

        /* Wangen */
        '<ellipse cx="30" cy="63" rx="8" ry="5.5" fill="url(#wange)"/>' +
        '<ellipse cx="70" cy="63" rx="8" ry="5.5" fill="url(#wange)"/>' +

        /* Brauen */
        '<path d="M32,41 q6,-4 12,-1" stroke="#6B5844" stroke-width="1.8" fill="none" stroke-linecap="round"/>' +
        '<path d="M56,40 q6,-3 12,1" stroke="#6B5844" stroke-width="1.8" fill="none" stroke-linecap="round"/>' +

        /* Augen, gross und freundlich */
        '<ellipse class="auge" cx="38" cy="52" rx="6.4" ry="7.4" fill="#3B2A1C"/>' +
        '<ellipse class="auge" cx="62" cy="52" rx="6.4" ry="7.4" fill="#3B2A1C"/>' +
        '<circle cx="40.2" cy="49.2" r="2.3" fill="#FFFDF6"/>' +
        '<circle cx="64.2" cy="49.2" r="2.3" fill="#FFFDF6"/>' +
        '<circle cx="35.8" cy="55.2" r="1.1" fill="#FFFDF6" opacity=".6"/>' +
        '<circle cx="59.8" cy="55.2" r="1.1" fill="#FFFDF6" opacity=".6"/>' +

        /* Mund, kleines Laecheln */
        '<path d="M44,68 q6,5.5 12,0" stroke="#3B2A1C" stroke-width="2.1" fill="none" stroke-linecap="round"/>' +

        risse +
        flicken +
      '</g>' +
    '</svg>';
  }

  function BuhuFigur(wurzel) {
    wurzel.innerHTML = buhuSvg();
    this.wurzel = wurzel;
    this.bild = null;
    this.stand = 0;

    /* Gezeichnete Bilder bevorzugen: img/buhu-flicken-0.png bis
       buhu-flicken-7.png, jeweils Buhu mit so vielen Flicken.
       Geprueft wird das Bild, das diese Station gerade braucht.
       Fehlt es, bleibt die Zeichnung stehen. So laesst sich die Reihe
       auch Stueck fuer Stueck nachliefern.
       Die Pruefung laeuft erst, wenn der Stand gesetzt ist. */
  }

  BuhuFigur.prototype.bildPfad = function (n) {
    return 'img/buhu-flicken-' + n + '.png';
  };

  BuhuFigur.prototype.bilderPruefen = function () {
    var selbst = this;
    var probe = new Image();
    probe.onload = function () { selbst.bilderNutzen(); };
    probe.onerror = function () { /* fehlt, Zeichnung bleibt */ };
    probe.src = this.bildPfad(this.stand);
  };

  BuhuFigur.prototype.bilderNutzen = function () {
    if (this.bild) return;
    var selbst = this;
    var b = document.createElement('img');
    b.className = 'buhu-bild';
    b.alt = 'Buhu';
    b.onerror = function () { selbst.zurueckZurZeichnung(); };
    b.src = this.bildPfad(this.stand);
    this.wurzel.innerHTML = '';
    this.wurzel.appendChild(b);
    this.wurzel.classList.add('buhu-fortschritt--bild');
    this.bild = b;
  };

  /* Falls mitten in der Reihe ein Bild fehlt */
  BuhuFigur.prototype.zurueckZurZeichnung = function () {
    this.bild = null;
    this.wurzel.classList.remove('buhu-fortschritt--bild');
    this.wurzel.innerHTML = buhuSvg();
    this.setzeGeschlossen(this.stand);
  };

  BuhuFigur.prototype.setzeGeschlossen = function (anzahl) {
    this.stand = anzahl;
    if (this.bild) { this.bild.src = this.bildPfad(anzahl); return; }
    for (var n = 1; n <= 7; n++) {
      var f = this.wurzel.querySelector('[data-flicken="' + n + '"]');
      var r = this.wurzel.querySelector('[data-riss="' + n + '"]');
      if (!f) continue;
      var zu = n <= anzahl;
      f.classList.toggle('zu', zu);
      if (r) r.style.opacity = zu ? '0' : '1';
    }
  };

  BuhuFigur.prototype.schliessen = function (n, fertig) {
    var selbst = this;
    this.stand = n;

    if (this.bild) {
      this.bild.src = this.bildPfad(n);
      this.bild.classList.remove('ploppt');
      void this.bild.offsetWidth;
      this.bild.classList.add('ploppt');
      Klang.flickenKlang();
      setTimeout(function () {
        if (selbst.bild) selbst.bild.classList.remove('ploppt');
        if (fertig) fertig();
      }, ruhig ? 60 : 900);
      return;
    }

    var f = this.wurzel.querySelector('[data-flicken="' + n + '"]');
    var r = this.wurzel.querySelector('[data-riss="' + n + '"]');
    if (!f) { if (fertig) fertig(); return; }
    if (r) r.style.opacity = '0';
    f.classList.add('zu', 'schliesst');
    Klang.flickenKlang();
    setTimeout(function () { f.classList.remove('schliesst'); if (fertig) fertig(); }, ruhig ? 60 : 950);
  };

  BuhuFigur.prototype.naehteLeuchten = function () {
    var k = this.wurzel.querySelector('.buhu-koerper') || this.bild;
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
      if (this.figur) {
        this.figur.setzeGeschlossen(einst.station - 1);
        /* Erst jetzt nach gezeichneten Bildern suchen, denn gesucht wird
           nach dem Bild, das diese Station braucht. */
        this.figur.bilderPruefen();
      }

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

      /* Jede Station findet Buhu woanders, sonst wird es langweilig. */
      var ORTE = [
        { x: -0.34, y:  0.26 },
        { x:  0.42, y: -0.31 },
        { x:  0.12, y:  0.48 },
        { x: -0.47, y: -0.18 },
        { x:  0.29, y:  0.39 },
        { x: -0.21, y: -0.44 },
        { x:  0.00, y:  0.00 }   /* zuletzt genau in der Mitte, beim Herz */
      ];
      var ort = ORTE[(this.station - 1) % ORTE.length];

      var schritte = [
        [700,  function () { if (selbst.signal) selbst.signal.setzen(2); Klang.piep(); }],
        [1500, function () { if (selbst.signal) selbst.signal.setzen(3); selbst.sagen('Etwas ist da'); Klang.piep(); }],
        [2300, function () { if (selbst.signal) selbst.signal.setzen(4); }],
        [3000, function () {
          if (selbst.signal) selbst.signal.setzen(5);
          selbst.sagen('Signal gefunden');
          if (selbst.radar) selbst.radar.fund = ort;
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
      var offen = 7 - n;
      if (zeile) zeile.textContent = 'Riss geschlossen.';
      if (hinweis) {
        hinweis.textContent = offen === 0
          ? 'Buhu ist wieder ganz.'
          : (offen === 1
              ? 'Noch ein Riss, dann ist Buhu wieder ganz.'
              : 'Noch ' + offen + ' Risse, dann ist Buhu wieder ganz.');
      }
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
