/*
  Der Adventswald: Inhalte der 24 Türen
  ======================================

  Hier trägst du ein, wer hinter welcher Tür steht.
  Alles andere (Wald, Schnee, Klänge, Lichter) macht die Seite selbst.

  So füllst du eine Tür:
  - Text immer zwischen die Anführungszeichen schreiben: "so"
  - Felder, die eine Partnerin nicht hat, einfach leer lassen: ""
  - Bilder und Videos in den Ordner  adventskalender/medien/  legen
    und hier nur den Dateinamen mit Ordner eintragen,
    z. B.  bild: "adventskalender/medien/03-anna.jpg"
  - Video bitte als .mp4, hochkant ist gut, möglichst unter 15 MB.
    Für das Video ein Vorschaubild (poster) angeben, dann lädt es schöner.

  Felder:
    name      Name der Partnerin
    account   Instagram-Name mit @
    instagram Link zum Instagram-Profil
    rolle     kurz, was sie macht (erscheint in Gold): "Buchautorin", "Kräuterfrau" ...
    text      Ihre Vorstellung. Absätze mit einer leeren Zeile trennen (\n\n).
    gruss     Optional: ein Satz von ihr, wird als Zitat gezeigt.
    bild      Foto (jpg/webp)
    video     Video (mp4). Wenn vorhanden, wird es statt des Fotos gezeigt.
    poster    Vorschaubild für das Video
    link      Optional: ein Knopf zu Shop, Buch oder Webseite
              { text: "Zum Buch", url: "https://..." }
    geschenk  Optional: ein Hinweis auf eine Aktion, NUR wenn die Partnerin sie wirklich anbietet.
              z. B. "Mit dem Code ADVENTSWALD bis 7.12. zehn Prozent im Shop."

  Vorschau: waldmomente.me/adventskalender.html?vorschau=1
  öffnet alle Türen sofort, nur für dich zum Testen. Nichts wird dabei gespeichert.

  Direkt zu einer Tür springen (für den Link in der Instagram-Story):
  waldmomente.me/adventskalender.html?tuer=7
*/

window.ADVENTSWALD = {
  jahr: 2026,

  tueren: [
    { tag: 1,  name: "", account: "", instagram: "", rolle: "", text: "", gruss: "", bild: "", video: "", poster: "", link: null, geschenk: "" },
    { tag: 2,  name: "", account: "", instagram: "", rolle: "", text: "", gruss: "", bild: "", video: "", poster: "", link: null, geschenk: "" },
    { tag: 3,  name: "", account: "", instagram: "", rolle: "", text: "", gruss: "", bild: "", video: "", poster: "", link: null, geschenk: "" },
    { tag: 4,  name: "", account: "", instagram: "", rolle: "", text: "", gruss: "", bild: "", video: "", poster: "", link: null, geschenk: "" },
    { tag: 5,  name: "", account: "", instagram: "", rolle: "", text: "", gruss: "", bild: "", video: "", poster: "", link: null, geschenk: "" },
    { tag: 6,  name: "", account: "", instagram: "", rolle: "", text: "", gruss: "", bild: "", video: "", poster: "", link: null, geschenk: "" },
    { tag: 7,  name: "", account: "", instagram: "", rolle: "", text: "", gruss: "", bild: "", video: "", poster: "", link: null, geschenk: "" },
    { tag: 8,  name: "", account: "", instagram: "", rolle: "", text: "", gruss: "", bild: "", video: "", poster: "", link: null, geschenk: "" },
    { tag: 9,  name: "", account: "", instagram: "", rolle: "", text: "", gruss: "", bild: "", video: "", poster: "", link: null, geschenk: "" },
    { tag: 10, name: "", account: "", instagram: "", rolle: "", text: "", gruss: "", bild: "", video: "", poster: "", link: null, geschenk: "" },
    { tag: 11, name: "", account: "", instagram: "", rolle: "", text: "", gruss: "", bild: "", video: "", poster: "", link: null, geschenk: "" },
    { tag: 12, name: "", account: "", instagram: "", rolle: "", text: "", gruss: "", bild: "", video: "", poster: "", link: null, geschenk: "" },
    { tag: 13, name: "", account: "", instagram: "", rolle: "", text: "", gruss: "", bild: "", video: "", poster: "", link: null, geschenk: "" },
    { tag: 14, name: "", account: "", instagram: "", rolle: "", text: "", gruss: "", bild: "", video: "", poster: "", link: null, geschenk: "" },
    { tag: 15, name: "", account: "", instagram: "", rolle: "", text: "", gruss: "", bild: "", video: "", poster: "", link: null, geschenk: "" },
    { tag: 16, name: "", account: "", instagram: "", rolle: "", text: "", gruss: "", bild: "", video: "", poster: "", link: null, geschenk: "" },
    { tag: 17, name: "", account: "", instagram: "", rolle: "", text: "", gruss: "", bild: "", video: "", poster: "", link: null, geschenk: "" },
    { tag: 18, name: "", account: "", instagram: "", rolle: "", text: "", gruss: "", bild: "", video: "", poster: "", link: null, geschenk: "" },
    { tag: 19, name: "", account: "", instagram: "", rolle: "", text: "", gruss: "", bild: "", video: "", poster: "", link: null, geschenk: "" },
    { tag: 20, name: "", account: "", instagram: "", rolle: "", text: "", gruss: "", bild: "", video: "", poster: "", link: null, geschenk: "" },
    { tag: 21, name: "", account: "", instagram: "", rolle: "", text: "", gruss: "", bild: "", video: "", poster: "", link: null, geschenk: "" },
    { tag: 22, name: "", account: "", instagram: "", rolle: "", text: "", gruss: "", bild: "", video: "", poster: "", link: null, geschenk: "" },
    { tag: 23, name: "", account: "", instagram: "", rolle: "", text: "", gruss: "", bild: "", video: "", poster: "", link: null, geschenk: "" },

    /* Tür 24 ist als Beispiel ausgefüllt, damit du in der Vorschau siehst, wie eine fertige Tür aussieht.
       Text und Bild gern ersetzen. */
    {
      tag: 24,
      name: "Lissi",
      account: "@waldmomente",
      instagram: "https://www.instagram.com/waldmomente/",
      rolle: "Waldmomente",
      text: "Hinter der letzten Tür stehe ich.\n\nDreiundzwanzig Frauen haben in diesem Advent ihre Tür im Wald aufgemacht. Jede hat etwas mitgebracht, das man draußen findet oder das von draußen erzählt.\n\nGeh heute noch einmal raus. Egal wie kurz. Schau, was in deinem Wald gerade leuchtet.",
      gruss: "Frohe Weihnachten aus dem Wald.",
      bild: "lissi-herbst.jpeg",
      video: "",
      poster: "",
      link: { text: "Zu Waldmomente", url: "index.html" },
      geschenk: ""
    }
  ]
};
