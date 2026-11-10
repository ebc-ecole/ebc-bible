/* EBC Bible — application de lecture et d'étude biblique (FR/EN)
   Usage dans une page : <div id="ebc-bible" data-lang="fr"></div><script src="BASE/app/bible-app.js"></script>
   Données : BASE/data/... (meta.json, <version>/<LIVRE>.json, <version>/all.txt, strong/, conc/, courses.json) */
(function () {
  'use strict';
  var SCRIPT = document.currentScript;
  var BASE = (window.EBC_BIBLE_BASE || (SCRIPT && SCRIPT.src.replace(/app\/bible-app(\.min)?\.js.*$/, '')) || './');
  var DV = (SCRIPT && (SCRIPT.src.match(/[?&][dv]=([\w.-]+)/) || [])[1]) || ''; var QS = DV ? '?v=' + DV : '';
  var ROOT = document.getElementById('ebc-bible');
  if (!ROOT) return;
  var LANG = (ROOT.getAttribute('data-lang') || (/\/en\//.test(location.pathname) ? 'en' : 'fr')) === 'en' ? 'en' : 'fr';

  /* ---------- Textes d'interface ---------- */
  var T = {
    fr: {
      bible: 'Bible en ligne', search: 'Rechercher dans la Bible…', books: 'Livres', ot: 'Ancien Testament', nt: 'Nouveau Testament',
      chapter: 'Chapitre', compare: 'Comparer', parallel: 'Vue parallèle', none: 'Aucune', settings: 'Affichage',
      size: 'Taille du texte', theme: 'Thème', light: 'Clair', sepia: 'Sépia', dark: 'Sombre', redletter: 'Paroles de Jésus en couleur',
      versenums: 'Numéros de versets', copy: 'Copier', copied: 'Copié !', share: 'Lien', linkcopied: 'Lien copié !',
      highlight: 'Surligner', note: 'Note', fav: 'Favori', original: 'Grec / hébreu', xrefs: 'Renvois', courses: 'Cours liés',
      close: 'Fermer', prev: 'Précédent', next: 'Suivant', loading: 'Chargement…', results: 'résultats', result: 'résultat',
      noresult: 'Aucun résultat.', all: 'Toute la Bible', occurrences: 'occurrences', seeocc: 'Voir les versets',
      strongword: 'Mot original', translit: 'Translittération', pron: 'Prononciation', def: 'Définition (Strong)',
      kjvdef: 'Traduit dans la KJV par', deriv: 'Origine', lexnote: 'Dictionnaire Strong (1890), définitions traduites en français. Le « Traduit dans la KJV par » reprend les mots anglais de la King James.',
      originalverse: 'Mots originaux du verset', origfrom: 'D’après le texte de la King James annoté Strong.',
      mystudy: 'Mon étude', highlights: 'Surlignages', notes: 'Notes', favorites: 'Favoris', history: 'Historique',
      empty: 'Rien pour l’instant.', votd: 'Verset du jour', plans: 'Plans de lecture', listen: 'Écouter', stop: 'Arrêter',
      plan1: 'La Bible en un an', plan2: 'Le Nouveau Testament en 90 jours', plan3: 'Psaumes et Proverbes en 31 jours',
      day: 'Jour', start: 'Commencer', markread: 'Marquer comme lu', read: 'Lu', today: 'Lecture du jour',
      notefor: 'Note sur', save: 'Enregistrer', del: 'Supprimer', courselink: 'Ce verset est étudié dans :',
      nocourse: 'Aucun cours de l’école ne cite encore ce verset.', exact: 'Astuce : "expression exacte", ou G26 / H157 pour un numéro Strong.',
      fontserif: 'Police', serif: 'Classique', sans: 'Moderne', go: 'Aller', home: 'Accueil Bible', reset: 'Tout effacer',
      confirmreset: 'Effacer tous vos surlignages, notes et favoris ?', verses: 'versets', inbook: 'par livre',
      clickword: 'Touchez un mot pour voir le mot grec ou hébreu.', versions: 'Versions', compareall: 'Toutes les versions'
    },
    en: {
      bible: 'Online Bible', search: 'Search the Bible…', books: 'Books', ot: 'Old Testament', nt: 'New Testament',
      chapter: 'Chapter', compare: 'Compare', parallel: 'Parallel view', none: 'None', settings: 'Display',
      size: 'Text size', theme: 'Theme', light: 'Light', sepia: 'Sepia', dark: 'Dark', redletter: 'Words of Jesus in color',
      versenums: 'Verse numbers', copy: 'Copy', copied: 'Copied!', share: 'Link', linkcopied: 'Link copied!',
      highlight: 'Highlight', note: 'Note', fav: 'Favorite', original: 'Greek / Hebrew', xrefs: 'Cross-references', courses: 'Related courses',
      close: 'Close', prev: 'Previous', next: 'Next', loading: 'Loading…', results: 'results', result: 'result',
      noresult: 'No results.', all: 'Whole Bible', occurrences: 'occurrences', seeocc: 'See the verses',
      strongword: 'Original word', translit: 'Transliteration', pron: 'Pronunciation', def: 'Definition (Strong)',
      kjvdef: 'Translated in the KJV as', deriv: 'Derivation', lexnote: 'Definitions from Strong’s dictionary (1890).',
      originalverse: 'Original words of this verse', origfrom: 'Based on the King James text with Strong’s numbers.',
      mystudy: 'My study', highlights: 'Highlights', notes: 'Notes', favorites: 'Favorites', history: 'History',
      empty: 'Nothing yet.', votd: 'Verse of the day', plans: 'Reading plans', listen: 'Listen', stop: 'Stop',
      plan1: 'The Bible in one year', plan2: 'The New Testament in 90 days', plan3: 'Psalms and Proverbs in 31 days',
      day: 'Day', start: 'Start', markread: 'Mark as read', read: 'Read', today: 'Today’s reading',
      notefor: 'Note on', save: 'Save', del: 'Delete', courselink: 'This verse is studied in:',
      nocourse: 'No course of the school cites this verse yet.', exact: 'Tip: "exact phrase", or G26 / H157 for a Strong’s number.',
      fontserif: 'Font', serif: 'Classic', sans: 'Modern', go: 'Go', home: 'Bible home', reset: 'Clear all',
      confirmreset: 'Clear all your highlights, notes and favorites?', verses: 'verses', inbook: 'by book',
      clickword: 'Tap a word to see the Greek or Hebrew word.', versions: 'Versions', compareall: 'All versions'
    }
  }[LANG];

  /* ---------- Utilitaires ---------- */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem('ebcb_' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem('ebcb_' + k, JSON.stringify(v)); } catch (e) { } }
  };
  var cache = {};
  function getJSON(p) {
    if (!cache[p]) cache[p] = fetch(BASE + 'data/' + p + QS).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); });
    return cache[p];
  }
  function getBook(ver, b) {
    var bk = BOOKS[b]; return getJSON(ver + '/' + (bk && bk.t === 'NT' ? 'NT' : 'OT') + '.json').then(function (d) { return d[b]; });
  }
  function getText(p) {
    if (!cache[p]) cache[p] = fetch(BASE + 'data/' + p + QS).then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); });
    return cache[p];
  }
  function plain(t) { return t.replace(/\[([^\]|]+)\|[GH]\d+\]/g, '$1').replace(/[‹›]/g, ''); }
  function norm(s) { return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[’']/g, "'"); }
  function toast(msg) {
    var t = el('div', 'eb-toast', esc(msg)); ROOT.appendChild(t);
    setTimeout(function () { t.classList.add('on'); }, 10);
    setTimeout(function () { t.classList.remove('on'); setTimeout(function () { t.remove(); }, 300); }, 1800);
  }
  function copyText(s) {
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(s);
    var ta = el('textarea'); ta.value = s; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (e) { } ta.remove(); return Promise.resolve();
  }

  /* ---------- État ---------- */
  var META, BOOKS = {}, VERS = {};
  var prefs = store.get('prefs', { size: 19, theme: 'light', red: true, nums: true, font: 'serif' });
  var S = {
    v: store.get('ver_' + LANG, LANG === 'fr' ? 'lsg' : 'kjv'),
    p: store.get('par_' + LANG, ''),
    b: 'JHN', c: 1, sel: [], hl: null
  };
  var hl = store.get('hl', {});        // "ver?|BOOK.c.v" -> color ; key without version for portability
  var notes = store.get('notes', {});  // "BOOK.c.v" -> text
  var favs = store.get('favs', []);    // ["BOOK.c.v"]
  var hist = store.get('hist', []);    // ["BOOK.c"]

  function bname(id) { var b = BOOKS[id]; return b ? b[LANG] : id; }
  function refLabel(b, c, v, v2) { return bname(b) + ' ' + c + (v ? (LANG === 'fr' ? '.' : ':') + v + (v2 && v2 !== v ? '-' + v2 : '') : ''); }

  /* ---------- Styles ---------- */
  var CSS = [
    '#ebc-bible,.eb-panel,.eb-mbox,.eb-bar{--plum:#4b1d3f;--plum2:#6d2f5c;--rose:#b7708f;--rosel:#f6e7ee;--sage:#5f826a;--gold:#a8843f;--goldl:#f7efdf;--navy:#4b1d3f;--indigo:#6d2f5c;--teal:#5f826a;--teall:#e9f1eb;--night:#2a0f26}#ebc-bible{--ink:#2a2026;--mut:#7d6f77;--bg:#fffdfb;--card:#ffffff;--line:#ecdfe6;--jesus:#a32847;',
    'font-family:"Jost",system-ui,sans-serif;color:var(--ink);background:var(--bg);border-radius:18px;position:relative;max-width:1180px;margin:34px auto 28px;min-height:70vh;box-shadow:0 10px 40px rgba(75,29,63,.08);overflow:clip}',
    '#ebc-bible.t-sepia{--bg:#f7f0e3;--card:#fbf6ec;--line:#e6d9c3;--ink:#3b2f22;--mut:#82735f}',
    '#ebc-bible.t-dark{--bg:#1a1218;--card:#241a22;--line:#3c2d38;--ink:#efe6ec;--mut:#a998a4;--rosel:#3a2533;--jesus:#ff8fa8;--plum:#d9a6c6;--plum2:#e8bcd8;--navy:#e4bdd6;--indigo:#e4bdd6;--teal:#a9cdb3;--teall:#25352b;--gold:#e2c27e;--goldl:#3a3020}',
    '#ebc-bible *{box-sizing:border-box}',
    '#ebc-bible .eb-text p,#ebc-bible .eb-p{font-size:inherit!important;line-height:inherit!important;font-family:inherit!important;color:inherit!important;margin:0 0 .55em!important;text-align:left}',
    '#ebc-bible .eb-text{line-height:1.85!important}',
    '#ebc-bible h2,#ebc-bible h3,#ebc-bible h4,.eb-panel h3,.eb-panel h4,.eb-mbox h3,.eb-mbox h4{text-transform:none;letter-spacing:normal;line-height:1.15;padding:0;border:0;background:none}',
    '#ebc-bible h2::before,#ebc-bible h2::after,#ebc-bible h3::before,#ebc-bible h3::after,#ebc-bible h4::before,#ebc-bible h4::after,.eb-panel h3::before,.eb-panel h3::after,.eb-panel h4::before,.eb-panel h4::after,.eb-mbox h3::before,.eb-mbox h3::after,.eb-mbox h4::before,.eb-mbox h4::after{content:none!important;display:none!important}',
    '#ebc-bible .eb-card h4,.eb-panel .eb-pb h4,.eb-mbox h4{background:none!important;border:0!important;padding:0!important;font-style:normal!important;font-family:"Jost",sans-serif!important;font-weight:600!important;font-size:12.5px!important;letter-spacing:.09em!important;text-transform:uppercase!important;color:var(--teal)!important;margin:0 0 8px!important;box-shadow:none!important}',
    '#ebc-bible .eb-ctitle{background:none!important;border:0;padding:0;font-style:normal}',
    '#ebc-bible .eb-pb p,.eb-panel p{font-size:15px;line-height:1.6;margin:0 0 10px}',
    '#ebc-bible button,.eb-panel button,.eb-bar button,.eb-mbox button{text-transform:none;letter-spacing:normal;box-shadow:none;line-height:1.2}',
    '#ebc-bible button{font-family:inherit;cursor:pointer}',
    '.eb-top{border-radius:18px 18px 0 0;position:relative;z-index:20;display:flex;flex-wrap:wrap;gap:8px;align-items:center;padding:12px 14px;background-color:#3a1532;background-image:radial-gradient(38% 70% at 15% 30%,rgba(183,112,143,.55),rgba(183,112,143,0) 70%),radial-gradient(34% 65% at 85% 70%,rgba(143,174,150,.55),rgba(143,174,150,0) 72%),radial-gradient(28% 60% at 55% 0%,rgba(214,178,104,.30),rgba(214,178,104,0) 70%),linear-gradient(115deg,#2a0f26,#4b1d3f 45%,#5a2a4c 70%,#3b2a33);background-size:220% 220%,220% 220%,220% 220%,100% 100%;animation:ebaurora 18s ease-in-out infinite alternate;color:#fff;overflow:hidden}',
    '.eb-top>*:not(.eb-stars),.eb-ph>*:not(.eb-stars){position:relative;z-index:1}.eb-stars{position:absolute;left:0;top:0;pointer-events:none;z-index:0;display:block}',
    '@keyframes ebsky{0%{background-position:0% 50%}100%{background-position:100% 50%}}@keyframes ebaurora{0%{background-position:0% 0%,100% 100%,40% 0%,0 0}33%{background-position:60% 40%,30% 60%,90% 30%,0 0}66%{background-position:100% 80%,0% 20%,20% 70%,0 0}100%{background-position:30% 100%,70% 0%,70% 10%,0 0}}@keyframes ebshine{0%{background-position:160% 0}100%{background-position:-60% 0}}@keyframes ebtw{0%,100%{opacity:1;transform:scale(1) rotate(0deg)}50%{opacity:.55;transform:scale(.78) rotate(25deg)}}@keyframes ebglow{0%{opacity:.55;transform:scale(1)}100%{opacity:1;transform:scale(1.18)}}',
    '.eb-brand{font-family:"Cormorant Garamond",Georgia,serif;font-size:24px;font-weight:700;letter-spacing:.3px;margin-right:6px;white-space:nowrap;cursor:pointer;background:linear-gradient(90deg,#fff 0%,#fff 38%,#ffe2a0 50%,#fff 62%,#fff 100%);background-size:260% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:ebshine 7s linear infinite}',
    '.eb-brand i{font-style:normal;display:inline-block;color:#f3d27a;-webkit-text-fill-color:#f3d27a;text-shadow:0 0 12px rgba(243,210,122,.9);animation:ebtw 2.6s ease-in-out infinite;margin-right:5px}',
    '.eb-pill{display:inline-flex;align-items:center;gap:6px;border:1px solid rgba(255,255,255,.35);background:rgba(255,255,255,.12);color:#fff;border-radius:999px;padding:7px 13px;font-size:14px;font-weight:500;white-space:nowrap}',
    '.eb-pill:hover{background:rgba(255,255,255,.22)}',
    '.eb-pill select{background:transparent;color:#fff;border:0;font:inherit;outline:0;cursor:pointer}.eb-pill select option{color:#222}',
    '.eb-search{flex:1 1 160px;display:flex;min-width:150px}',
    '.eb-search input{flex:1;border:0;border-radius:999px 0 0 999px;padding:9px 15px;font:inherit;font-size:15px;outline:0;min-width:0}',
    '.eb-search button{border:0;border-radius:0 999px 999px 0;background:linear-gradient(135deg,#e6c98a,#a8843f);color:#2a1a10;padding:0 15px;font-size:15px;font-weight:700}',
    '.eb-icons{display:flex;gap:6px;margin-left:auto}',
    '.eb-ic{width:38px;height:38px;border-radius:50%;border:1px solid rgba(255,255,255,.35);background:rgba(255,255,255,.12);color:#fff;font-size:17px;display:inline-flex;align-items:center;justify-content:center}',
    '.eb-ic:hover{background:rgba(255,255,255,.25)}',
    '.eb-main{display:flex;gap:0}',
    '.eb-read{flex:1;min-width:0;padding:22px 26px 90px}',
    '.eb-pr{display:grid;grid-template-columns:1fr 1fr;gap:28px;padding:5px 0;border-bottom:1px dashed var(--line)}.eb-prh{border:0}.eb-pr .eb-h{margin-top:4px}',
    '.eb-bar{font-family:"Jost",system-ui,sans-serif}',
    '.eb-cols{display:grid;grid-template-columns:1fr;gap:28px}.eb-cols.two{grid-template-columns:1fr 1fr}',
    '.eb-chead{display:flex;align-items:baseline;justify-content:space-between;gap:10px;margin:4px 0 16px;border-bottom:1px solid var(--line);padding-bottom:10px}',
    '.eb-ctitle{font-family:"Cormorant Garamond",Georgia,serif;font-size:34px;font-weight:700;color:var(--navy);margin:0;line-height:1.1}',
    '.eb-vtag{font-size:12px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--teal)}',
    '.eb-text{font-size:var(--fs,19px);line-height:1.85}',
    '#ebc-bible.f-serif .eb-text{font-family:"Cormorant Garamond",Georgia,serif;font-size:calc(var(--fs,19px) + 2px)}',
    '.eb-h{font-family:"Jost",sans-serif;font-size:15px;font-weight:600;color:var(--teal);margin:20px 0 6px;letter-spacing:.02em}',
    '.eb-p{margin:0 0 .55em}',
    '.eb-v{border-radius:5px;padding:1px 0;transition:background .15s;cursor:pointer}',
    '.eb-v:hover{background:rgba(95,130,106,.09)}',
    '.eb-v.sel{background:rgba(168,132,63,.22);box-shadow:0 0 0 2px rgba(168,132,63,.28)}',
    '.eb-v.flash{animation:ebflash 2.2s ease}@keyframes ebflash{0%,40%{background:rgba(176,141,87,.38)}100%{background:transparent}}',
    '.eb-n{font-family:"Jost",sans-serif;font-size:.58em;font-weight:700;color:var(--gold);vertical-align:super;margin:0 3px 0 2px;user-select:none}',
    '.nonum .eb-n{display:none}',
    '.eb-j{color:inherit}.red .eb-j{color:var(--jesus)}',
    '.eb-w{cursor:pointer;border-bottom:1px dotted transparent}.eb-w:hover{border-bottom-color:var(--teal);color:var(--teal)}',
    '.eb-mk{display:inline-block;width:7px;height:7px;border-radius:50%;background:var(--gold);margin-left:3px;vertical-align:middle}',
    '.hl-y{background:rgba(255,221,87,.55)}.hl-g{background:rgba(143,174,150,.45)}.hl-b{background:rgba(120,170,230,.38)}.hl-p{background:rgba(214,140,180,.42)}',
    '.t-dark .hl-y{background:rgba(255,221,87,.28)}.t-dark .hl-g{background:rgba(143,174,150,.3)}.t-dark .hl-b{background:rgba(120,170,230,.28)}.t-dark .hl-p{background:rgba(214,140,180,.3)}',
    '.eb-nav{display:flex;justify-content:space-between;gap:10px;margin-top:30px}',
    '.eb-btn{border:1px solid var(--line);background:var(--card);color:var(--ink);border-radius:999px;padding:10px 18px;font-size:14px;font-weight:500}',
    '.eb-btn:hover{border-color:var(--teal);color:var(--teal)}',
    '.eb-btn.pri{background:linear-gradient(135deg,#4b1d3f,#7a3a66 55%,#5f826a);background-size:180% 180%;border-color:transparent;color:#fff;transition:background-position .4s}.eb-btn.pri:hover{color:#fff;background-position:100% 50%}.t-dark .eb-btn.pri{background:linear-gradient(135deg,#e4bdd6,#a9cdb3);color:#1a1218}',
    '.eb-bar{position:fixed;left:50%;bottom:18px;transform:translateX(-50%) translateY(140%);z-index:2147483000;background:linear-gradient(135deg,#2a0f26,#4b1d3f 60%,#3f4a3c);color:#fff;border-radius:18px;padding:8px;display:flex;flex-wrap:wrap;gap:4px;align-items:center;justify-content:center;box-shadow:0 12px 40px rgba(0,0,0,.3);transition:transform .25s;max-width:calc(100vw - 20px)}',
    '.eb-bar.on{transform:translateX(-50%) translateY(0)}',
    '.eb-b1,.eb-b2{display:flex;align-items:center;gap:4px}.eb-bar{flex-direction:column}',
    '@media(max-width:760px){.eb-bar{left:8px;right:8px;bottom:8px;transform:translateY(140%);max-width:none;border-radius:16px}.eb-bar.on{transform:none}.eb-b2{width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch;justify-content:flex-start}.eb-bar button{min-width:62px;font-size:12px;padding:6px 6px;flex:0 0 auto}.eb-dots i{width:26px;height:26px}}',
    '.eb-bar button{border:0;background:transparent;color:#fff;border-radius:12px;padding:8px 10px;font-size:13px;display:inline-flex;flex-direction:column;align-items:center;gap:2px;min-width:58px}',
    '.eb-bar button:hover{background:rgba(255,255,255,.12)}.eb-bar b{font-size:17px;font-weight:400;line-height:1}',
    '.eb-bar .eb-ref{font-weight:600;padding:0 10px;font-size:13px;opacity:.85}',
    '.eb-dots{display:flex;gap:6px;padding:0 6px}.eb-dots i{width:22px;height:22px;border-radius:50%;display:block;cursor:pointer;border:2px solid rgba(255,255,255,.6)}',
    '.eb-panel{position:fixed;top:0;right:0;height:100%;width:min(460px,100vw);background:var(--card);color:var(--ink);z-index:2147483001;box-shadow:-10px 0 40px rgba(0,0,0,.18);transform:translateX(105%);transition:transform .28s;display:flex;flex-direction:column}',
    '.eb-panel.on{transform:none}',
    '.eb-ph{position:relative;overflow:hidden;display:flex;align-items:center;justify-content:space-between;padding:16px 18px;border-bottom:1px solid var(--line);background-color:#3a1532;background-image:radial-gradient(38% 70% at 15% 30%,rgba(183,112,143,.55),rgba(183,112,143,0) 70%),radial-gradient(34% 65% at 85% 70%,rgba(143,174,150,.55),rgba(143,174,150,0) 72%),radial-gradient(28% 60% at 55% 0%,rgba(214,178,104,.30),rgba(214,178,104,0) 70%),linear-gradient(115deg,#2a0f26,#4b1d3f 45%,#5a2a4c 70%,#3b2a33);background-size:220% 220%,220% 220%,220% 220%,100% 100%;animation:ebaurora 18s ease-in-out infinite alternate;color:#fff}',
    '.eb-ph h3{margin:0!important;font-family:"Cormorant Garamond",Georgia,serif!important;font-size:24px!important;color:#fff!important;font-weight:700!important;font-style:normal!important}',
    '.eb-ph button{background:rgba(255,255,255,.15);border:0;color:#fff;width:34px;height:34px;border-radius:50%;font-size:18px}',
    '.eb-pb{padding:16px 18px 40px;overflow:auto;flex:1}',
    '.eb-pb h4{font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:var(--teal);margin:18px 0 8px}',
    '.eb-lemma{font-size:34px;font-family:"SBL Greek","Cardo","Times New Roman",serif;color:var(--navy);direction:auto}',
    '.eb-kv{display:grid;grid-template-columns:auto 1fr;gap:6px 12px;font-size:14.5px}.eb-kv span:nth-child(odd){color:var(--mut)}',
    '.eb-chip{display:inline-block;background:var(--teall);color:var(--teal);border-radius:999px;padding:4px 10px;margin:3px 4px 3px 0;font-size:13px;cursor:pointer;border:0}',
    '.eb-chip:hover{background:var(--teal);color:#fff}.eb-chip:nth-of-type(3n+2){background:var(--goldl);color:#7f6230}.eb-chip:nth-of-type(3n+2):hover{background:var(--gold);color:#fff}.eb-chip:nth-of-type(3n){background:var(--rosel);color:var(--plum2)}.eb-chip:nth-of-type(3n):hover{background:var(--rose);color:#fff}',
    '.eb-li{padding:10px 0;border-bottom:1px solid var(--line);font-size:15px;line-height:1.55;cursor:pointer}',
    '.eb-li:hover .eb-lr{color:var(--teal)}',
    '.eb-lr{font-weight:600;color:var(--navy);font-size:13.5px;display:block;margin-bottom:2px}',
    '.eb-li mark{background:rgba(255,221,87,.6);color:inherit;border-radius:3px;padding:0 1px}',
    '.eb-muted{color:var(--mut);font-size:13.5px}',
    '.eb-endef{margin:-4px 0 10px}.eb-endef summary{cursor:pointer;color:var(--mut);font-size:13px}',
    '.eb-modal{position:fixed;inset:0;z-index:2147483002;background:rgba(42,15,38,.55);display:flex;align-items:flex-start;justify-content:center;padding:40px 12px;overflow:auto}',
    '.eb-mbox{background:var(--card);color:var(--ink);border-radius:20px;max-width:880px;width:100%;padding:20px 22px;box-shadow:0 20px 60px rgba(0,0,0,.3)}',
    '.eb-mbox h3{font-family:"Cormorant Garamond",Georgia,serif;font-size:26px;color:var(--navy);margin:6px 0 12px}',
    '.eb-bgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:6px;margin-bottom:12px}',
    '.eb-bgrid button,.eb-cgrid button{border:1px solid var(--line);background:var(--bg);color:var(--ink);border-radius:10px;padding:8px 8px;font-size:14px;text-align:left}',
    '.eb-bgrid button:hover,.eb-cgrid button:hover,.eb-bgrid button.on,.eb-cgrid button.on{background:var(--navy);color:#fff;border-color:var(--navy)}.t-dark .eb-bgrid button:hover,.t-dark .eb-cgrid button:hover{color:#1a1218}',
    '.eb-bgrid.ot button{border-left:3px solid var(--gold)}.eb-bgrid.nt button{border-left:3px solid var(--teal)}.eb-bgrid.ot button:hover{background:linear-gradient(135deg,#8a6a2c,#c4a061);border-color:#c4a061;color:#fff}.eb-bgrid.nt button:hover{background:linear-gradient(135deg,#4f6f58,#8fae96);border-color:#8fae96;color:#fff}',
    '.eb-cgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(52px,1fr));gap:6px}.eb-cgrid button{text-align:center}',
    '.eb-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:8px 0}',
    '.eb-seg{display:inline-flex;border:1px solid var(--line);border-radius:999px;overflow:hidden}.eb-seg button{border:0;background:transparent;color:var(--ink);padding:7px 14px;font-size:14px}.eb-seg button.on{background:var(--navy);color:#fff}.t-dark .eb-seg button.on{color:#1a1218}',
    '.eb-home{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px;margin-bottom:24px}',
    '.eb-card{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:16px 18px;border-top:3px solid var(--teal)}.eb-home .eb-card:nth-child(2){border-top-color:var(--gold)}.eb-home .eb-card:nth-child(3){border-top-color:var(--rose)}#ebc-bible .eb-home .eb-card:nth-child(2) h4{color:var(--gold)!important}#ebc-bible .eb-home .eb-card:nth-child(3) h4{color:var(--rose)!important}',
    '.eb-hero{position:relative;border-radius:20px;overflow:hidden;margin-bottom:18px;min-height:230px;color:#fff;background-color:#3a1532;background-image:radial-gradient(38% 70% at 15% 30%,rgba(183,112,143,.55),rgba(183,112,143,0) 70%),radial-gradient(34% 65% at 85% 70%,rgba(143,174,150,.55),rgba(143,174,150,0) 72%),radial-gradient(28% 60% at 55% 0%,rgba(214,178,104,.30),rgba(214,178,104,0) 70%),linear-gradient(115deg,#2a0f26,#4b1d3f 45%,#5a2a4c 70%,#3b2a33);background-size:220% 220%,220% 220%,220% 220%,100% 100%;animation:ebaurora 22s ease-in-out infinite alternate;box-shadow:0 14px 40px rgba(75,29,63,.25)}',
    '.eb-hero::after{content:"";position:absolute;right:-70px;top:-80px;width:300px;height:300px;border-radius:50%;background:radial-gradient(circle,rgba(255,232,170,.38),rgba(255,232,170,0) 68%);animation:ebglow 7s ease-in-out infinite alternate;pointer-events:none}',
    '.eb-hero-in{position:relative;z-index:1;padding:30px 32px 26px;max-width:780px}#ebc-bible .eb-hero h4{color:#f3d27a!important;margin-bottom:12px!important}',
    '#ebc-bible .eb-hero .eb-votd{color:#fff;font-size:29px;line-height:1.4;text-shadow:0 2px 18px rgba(0,0,0,.4)}#ebc-bible .eb-hero .eb-vr{color:rgba(255,255,255,.78)!important;font-size:14px!important;margin:12px 0 16px!important}',
    '.eb-hero .eb-btn.pri{background:linear-gradient(135deg,#ecd49b,#a8843f);color:#2a1a10;border:0;font-weight:600;box-shadow:0 6px 20px rgba(168,132,63,.35)}.eb-hero .eb-btn.pri:hover{color:#2a2210}',
    '@media(max-width:760px){.eb-hero-in{padding:22px 18px}#ebc-bible .eb-hero .eb-votd{font-size:23px}}',
    '@media (prefers-reduced-motion:reduce){.eb-btn.pri,.eb-top,.eb-ph,.eb-hero,.eb-hero::after,.eb-brand,.eb-brand i{animation:none!important}}',
    '.eb-card h4{margin:0 0 8px;font-size:12.5px;letter-spacing:.09em;text-transform:uppercase;color:var(--teal)}',
    '.eb-votd{font-family:"Cormorant Garamond",Georgia,serif;font-size:22px;line-height:1.45;color:var(--ink)}',
    '.eb-prog{height:6px;background:var(--line);border-radius:6px;overflow:hidden;margin:8px 0}.eb-prog i{display:block;height:100%;background:linear-gradient(90deg,#b7708f,#a8843f,#8fae96)}',
    '.eb-toast{position:fixed;left:50%;top:20px;transform:translate(-50%,-30px);opacity:0;background:#4b1d3f;color:#fff;padding:10px 18px;border-radius:999px;z-index:2147483003;transition:.25s;font-size:14px}.eb-toast.on{opacity:1;transform:translate(-50%,0)}',
    '.eb-ta{width:100%;min-height:150px;border:1px solid var(--line);border-radius:12px;padding:12px;font:inherit;font-size:15px;background:var(--bg);color:var(--ink)}',
    '.eb-res-h{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:6px}',
    '.eb-cmp{padding:10px 0;border-bottom:1px solid var(--line)}.eb-cmp b{display:block;font-size:12.5px;letter-spacing:.07em;color:var(--teal);margin-bottom:3px}',
    '.eb-orig{display:flex;flex-wrap:wrap;gap:8px}.eb-ow{border:1px solid var(--line);border-radius:12px;padding:8px 10px;cursor:pointer;background:var(--bg);min-width:90px}.eb-ow:hover{border-color:var(--teal)}',
    '.eb-ow .g{font-size:20px;font-family:"Times New Roman",serif;color:var(--navy)}.eb-ow .e{font-size:12.5px;color:var(--mut)}.eb-ow .s{font-size:11px;color:var(--gold);font-weight:600}',
    '@media(max-width:760px){.eb-pr{gap:12px;font-size:.9em}.eb-read{padding:16px 14px 110px}.eb-cols.two{grid-template-columns:1fr}.eb-ctitle{font-size:28px}.eb-brand{font-size:20px}.eb-top{gap:6px;padding:10px}.eb-icons{margin-left:0}.eb-search{order:9;flex-basis:100%}}',
    '.eb-top,.eb-ph,.eb-hero{background-color:#fbf6f8;background-image:radial-gradient(40% 75% at 15% 30%,rgba(183,112,143,.20),rgba(183,112,143,0) 70%),radial-gradient(36% 70% at 85% 70%,rgba(143,174,150,.24),rgba(143,174,150,0) 72%),radial-gradient(30% 65% at 55% 0%,rgba(214,178,104,.20),rgba(214,178,104,0) 70%),linear-gradient(115deg,#fdf9f6,#f9eff4 50%,#f1f6f1);color:#4b1d3f}',
    '.eb-top{border-bottom:1px solid var(--line)}.eb-hero{border:1px solid var(--line);box-shadow:0 12px 34px rgba(75,29,63,.08)}.eb-hero::after{background:radial-gradient(circle,rgba(214,178,104,.28),rgba(214,178,104,0) 68%)}',
    '.eb-pill,.eb-ic{border-color:rgba(75,29,63,.16);background:rgba(255,255,255,.7);color:#4b1d3f}.eb-pill:hover,.eb-ic:hover{background:#fff;border-color:rgba(75,29,63,.3)}.eb-pill select{color:#4b1d3f}',
    '.eb-search input{border:1px solid rgba(75,29,63,.16);border-right:0;background:#fff;color:var(--ink)}',
    '.eb-brand{background-image:linear-gradient(90deg,#4b1d3f 0%,#4b1d3f 38%,#c49a4a 50%,#4b1d3f 62%,#4b1d3f 100%)}.eb-brand i{color:#b8902f;-webkit-text-fill-color:#b8902f;text-shadow:0 0 10px rgba(214,178,104,.55)}',
    '.eb-ph h3{color:#4b1d3f!important}.eb-ph button{background:rgba(75,29,63,.08);color:#4b1d3f}',
    '#ebc-bible .eb-hero h4{color:#a8843f!important}#ebc-bible .eb-hero .eb-votd{color:#3a1832;text-shadow:none}#ebc-bible .eb-hero .eb-vr{color:rgba(75,29,63,.62)!important}',
    '#ebc-bible.t-dark .eb-top,#ebc-bible.t-dark .eb-hero{background-color:#2a0f26;background-image:radial-gradient(40% 75% at 15% 30%,rgba(183,112,143,.45),rgba(183,112,143,0) 70%),radial-gradient(36% 70% at 85% 70%,rgba(143,174,150,.4),rgba(143,174,150,0) 72%),linear-gradient(115deg,#2a0f26,#4b1d3f 50%,#3b2a33);color:#fff;border-color:transparent}',
    '#ebc-bible.t-dark .eb-pill,#ebc-bible.t-dark .eb-ic{border-color:rgba(255,255,255,.3);background:rgba(255,255,255,.1);color:#fff}#ebc-bible.t-dark .eb-pill select{color:#fff}#ebc-bible.t-dark .eb-brand{background-image:linear-gradient(90deg,#fff 0%,#fff 38%,#ffe2a0 50%,#fff 62%,#fff 100%)}#ebc-bible.t-dark .eb-hero .eb-votd{color:#fff}#ebc-bible.t-dark .eb-hero .eb-vr{color:rgba(255,255,255,.75)!important}',
    '.eb-lib [hidden]{display:none!important}.eb-lib,.eb-chv{margin:6px 0 30px}',
    '.eb-lib-top{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin-bottom:20px}',
    '.eb-lib-tabs{display:inline-flex;background:var(--rosel);border-radius:999px;padding:4px;gap:2px}.eb-lib-tabs button{border:0;background:transparent;color:var(--plum2);border-radius:999px;padding:8px 16px;font-size:14px;font-weight:500;transition:background .2s,color .2s}.eb-lib-tabs button.on{background:var(--card);color:var(--plum);box-shadow:0 2px 8px rgba(75,29,63,.12)}',
    '.eb-lib-find{flex:1 1 220px;display:flex;align-items:center;gap:8px;border:1px solid var(--line);background:var(--card);border-radius:999px;padding:0 14px;min-width:0;margin:0}.eb-lib-find span{color:var(--mut)}.eb-lib-find input{flex:1;border:0!important;outline:0;background:transparent;font:inherit;font-size:15px;padding:10px 0;color:var(--ink);min-width:0;box-shadow:none!important}',
    '.eb-lib-resume{border:0;border-radius:14px;padding:8px 16px;background:linear-gradient(135deg,#4b1d3f,#7a3a66 60%,#5f826a);color:#fff;font-size:14px;font-weight:600;text-align:left;line-height:1.25;box-shadow:0 6px 18px rgba(75,29,63,.2)}.eb-lib-resume small{display:block;font-size:11px;font-weight:500;opacity:.8;letter-spacing:.06em;text-transform:uppercase}',
    '.eb-cat{margin:0 0 24px}.eb-cat-h{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;margin:0 0 10px}.eb-cat-h .dot{width:10px;height:10px;border-radius:50%;background:var(--c);box-shadow:0 0 0 4px var(--ct);align-self:center}.eb-cat-h b{font-family:"Cormorant Garamond",Georgia,serif;font-size:23px;color:var(--ink);font-weight:700}.eb-cat-h small{color:var(--mut);font-size:13px}',
    '.eb-lib-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:12px}',
    '.eb-tile{position:relative;display:flex;flex-direction:column;align-items:flex-start;gap:3px;text-align:left;border:1px solid var(--line);border-radius:16px;padding:14px 14px 12px;background:linear-gradient(160deg,var(--ct),rgba(255,255,255,0) 65%),var(--card);color:var(--ink);overflow:hidden;cursor:pointer;transition:transform .25s cubic-bezier(.2,.8,.2,1),box-shadow .25s,border-color .25s;animation:ebup .5s both;animation-delay:calc(var(--i) * 12ms)}',
    '.eb-tile::after{content:"";position:absolute;top:0;left:-60%;width:40%;height:100%;background:linear-gradient(100deg,rgba(255,255,255,0),rgba(255,255,255,.6),rgba(255,255,255,0));transform:skewX(-18deg);transition:left .7s;pointer-events:none}',
    '.eb-tile:hover,.eb-tile:focus-visible{transform:translateY(-4px);box-shadow:0 14px 30px rgba(75,29,63,.14);border-color:var(--c);outline:0}.eb-tile:hover::after{left:130%}',
    '.eb-tile .ab{font-family:"Cormorant Garamond",Georgia,serif;font-size:30px;font-weight:700;line-height:1;color:var(--c)}.eb-tile .nm{font-weight:600;font-size:15.5px;margin-top:4px}',
    '.eb-tile .sm{font-size:12.5px;line-height:1.35;color:var(--mut);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:2.7em}',
    '.eb-tile .mt{font-size:11.5px;font-weight:600;letter-spacing:.04em;color:var(--c);margin-top:4px}.eb-tile .pg{align-self:stretch;height:3px;border-radius:3px;background:var(--line);overflow:hidden;margin-top:6px}.eb-tile .pg i{display:block;height:100%;background:var(--c)}',
    '@keyframes ebup{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}',
    '.eb-chv{animation:ebup .35s both}.eb-back{border:0;background:transparent;color:var(--mut);font-size:14px;padding:4px 0;margin-bottom:10px}.eb-back:hover{color:var(--c)}',
    '.eb-chv-h{display:flex;gap:18px;align-items:center;padding:20px;border-radius:20px;background:linear-gradient(135deg,var(--ct),rgba(255,255,255,0) 70%),var(--card);border:1px solid var(--line);margin-bottom:14px}',
    '.eb-chv-h .ab{flex:0 0 auto;width:84px;height:84px;border-radius:22px;display:flex;align-items:center;justify-content:center;font-family:"Cormorant Garamond",Georgia,serif;font-size:32px;font-weight:700;color:#fff;background:var(--c);box-shadow:0 10px 26px var(--ct)}',
    '.eb-chv-h small{font-size:12px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--c)}#ebc-bible .eb-chv-h h3,.eb-mbox .eb-chv-h h3{font-family:"Cormorant Garamond",Georgia,serif;font-size:34px;margin:2px 0 4px;color:var(--ink)}.eb-chv-h p{margin:0!important;color:var(--mut);font-size:15px}',
    '.eb-chg{display:grid;grid-template-columns:repeat(auto-fill,minmax(52px,1fr));gap:8px;margin-top:14px}.eb-chg button{aspect-ratio:1;border-radius:14px;border:1px solid var(--line);background:var(--card);color:var(--ink);font-size:16px;font-weight:600;transition:transform .2s,background .2s,color .2s;animation:ebup .4s both;animation-delay:calc(var(--i) * 6ms)}.eb-chg button:hover{transform:scale(1.08);background:var(--c);color:#fff;border-color:var(--c)}.eb-chg button.rd{background:var(--ct);border-color:var(--c);color:var(--c)}.eb-chg button.cur{box-shadow:0 0 0 3px var(--c)}',
    '.eb-mbox.wide{max-width:1100px}.t-dark .eb-tile::after{background:linear-gradient(100deg,rgba(255,255,255,0),rgba(255,255,255,.12),rgba(255,255,255,0))}',
    '@media(max-width:760px){.eb-lib-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.eb-tile{padding:12px}.eb-tile .ab{font-size:26px}.eb-chv-h{padding:14px;gap:12px}.eb-chv-h .ab{width:64px;height:64px;font-size:24px;border-radius:18px}#ebc-bible .eb-chv-h h3,.eb-mbox .eb-chv-h h3{font-size:27px}.eb-lib-resume{width:100%}.eb-lib-tabs{width:100%;justify-content:space-between}.eb-lib-tabs button{padding:8px 10px;font-size:13px}#ebc-bible{margin-top:22px}}',
    '@media (prefers-reduced-motion:reduce){.eb-tile,.eb-chv,.eb-chg button{animation:none}}',
    '.eb-toc{display:grid;grid-template-columns:minmax(0,1.45fr) minmax(0,1fr);gap:24px 40px}.eb-tcol{min-width:0}.eb-trow{min-width:0}.eb-trow .nm{min-width:0;flex:0 1 auto}',
    '.eb-tcol{--tint:rgba(168,132,63,.09)}.eb-tcol:nth-child(2){--tint:rgba(95,130,106,.10)}',
    '.eb-tcol-h{display:flex;align-items:baseline;gap:10px;padding-bottom:10px;margin-bottom:8px;border-bottom:2px solid var(--c)}.eb-tcol-h b{font-family:"Cormorant Garamond",Georgia,serif;font-size:28px;font-weight:700;color:var(--ink)}.eb-tcol-h small{color:var(--mut);font-size:13.5px}',
    '.eb-tlist{list-style:none!important;margin:0!important;padding:0!important;columns:auto 245px;column-gap:26px}.eb-tlist li{break-inside:avoid;margin:0!important;padding:0!important;list-style:none!important}.eb-tlist li::before,.eb-tlist li::marker{content:none!important}',
    '.eb-trow{display:flex;align-items:baseline;gap:8px;width:100%;border:0;background:transparent;padding:6px 8px;border-radius:8px;text-align:left;color:var(--ink);cursor:pointer;transition:background .15s}.eb-trow:hover,.eb-trow:focus-visible{background:var(--tint);outline:0}',
    '.eb-trow .no{flex:0 0 34px;font-size:11.5px;font-weight:600;color:var(--c);text-align:right;font-family:"Jost",sans-serif}',
    '.eb-trow .nm{font-family:"Cormorant Garamond",Georgia,serif;font-size:19px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;transition:color .15s}.eb-trow:hover .nm{color:var(--c)}',
    '.eb-trow .dl{flex:1 1 auto;min-width:10px;border-bottom:1px dotted rgba(75,29,63,.22);transform:translateY(-4px)}',
    '.eb-trow .ch{font-size:12.5px;color:var(--mut);white-space:nowrap}.eb-trow .ch i{display:inline-block;width:7px;height:7px;border-radius:50%;background:var(--c);margin-right:6px;vertical-align:middle}',
    '@media(max-width:860px){.eb-toc{grid-template-columns:minmax(0,1fr)}}'
  ].join('\n');

  /* ---------- Ciel étoilé animé ---------- */
  function starfield(host, dens, light) {
    if (!host) return;
    var cv = document.createElement('canvas'); cv.className = 'eb-stars'; cv.setAttribute('aria-hidden', 'true');
    host.insertBefore(cv, host.firstChild);
    var ctx = cv.getContext && cv.getContext('2d'); if (!ctx) return;
    var RM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var COL = light ? ['168,132,63', '168,132,63', '196,154,74', '183,112,143', '95,130,106', '122,58,102'] : ['255,255,255', '255,255,255', '255,250,240', '255,232,170', '255,214,232', '214,240,220'];
    var W = 0, H = 0, dpr = Math.min(2, window.devicePixelRatio || 1), stars = [], shoot = null, raf = 0, vis = true, last = 0, nextShoot = 0, ro = null, io = null;
    function size() {
      W = Math.max(1, host.clientWidth); H = Math.max(1, host.clientHeight);
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); cv.style.width = W + 'px'; cv.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.min(260, Math.round(W * H / (dens || 800))); stars = [];
      for (var i = 0; i < n; i++) {
        var big = Math.random() < 0.09;
        stars.push({ x: Math.random() * W, y: Math.random() * H, r: big ? 1.4 + Math.random() * 1.3 : 0.35 + Math.random() * 0.95, p: Math.random() * 6.283, s: 0.5 + Math.random() * 2.2, v: 0.015 + Math.random() * 0.06, c: COL[(Math.random() * COL.length) | 0] });
      }
      draw(performance.now());
    }
    function draw(t) {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i], a = 0.2 + 0.8 * Math.abs(Math.sin(t / 1000 * s.s + s.p));
        ctx.fillStyle = 'rgba(' + s.c + ',' + a.toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.283); ctx.fill();
        if (s.r > 1.3) {
          ctx.fillStyle = 'rgba(' + s.c + ',' + (a * 0.16).toFixed(3) + ')';
          ctx.beginPath(); ctx.arc(s.x, s.y, s.r * 3.4, 0, 6.283); ctx.fill();
          var L = s.r * 3.6 * a; ctx.strokeStyle = 'rgba(' + s.c + ',' + (a * 0.75).toFixed(3) + ')'; ctx.lineWidth = 0.7;
          ctx.beginPath(); ctx.moveTo(s.x - L, s.y); ctx.lineTo(s.x + L, s.y); ctx.moveTo(s.x, s.y - L); ctx.lineTo(s.x, s.y + L); ctx.stroke();
        }
      }
      if (shoot) {
        var k = (t - shoot.t0) / shoot.d;
        if (k >= 1 || k < 0) shoot = null;
        else {
          var x = shoot.x + shoot.dx * k, y = shoot.y + shoot.dy * k, tx = x - shoot.dx * 0.28, ty = y - shoot.dy * 0.28, al = Math.sin(k * 3.1416);
          var g = ctx.createLinearGradient(x, y, tx, ty); g.addColorStop(0, 'rgba(255,246,214,' + al.toFixed(3) + ')'); g.addColorStop(1, 'rgba(255,246,214,0)');
          ctx.strokeStyle = g; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(tx, ty); ctx.stroke();
          ctx.fillStyle = 'rgba(255,250,230,' + al.toFixed(3) + ')'; ctx.beginPath(); ctx.arc(x, y, 1.6, 0, 6.283); ctx.fill();
        }
      }
    }
    function step(t) {
      raf = 0;
      if (!cv.isConnected) { if (ro) ro.disconnect(); if (io) io.disconnect(); document.removeEventListener('visibilitychange', start); return; }
      if (!vis || document.hidden) return;
      var dt = last ? Math.min(50, t - last) : 16; last = t;
      for (var i = 0; i < stars.length; i++) { var s = stars[i]; s.x -= s.v * dt / 16; if (s.x < -4) { s.x = W + 4; s.y = Math.random() * H; } }
      if (!nextShoot) nextShoot = t + 1500 + Math.random() * 3000;
      if (!shoot && t > nextShoot) { shoot = { x: W * (0.35 + Math.random() * 0.65), y: H * Math.random() * 0.35, dx: -W * (0.18 + Math.random() * 0.22), dy: H * (0.3 + Math.random() * 0.45), t0: t, d: 850 + Math.random() * 500 }; nextShoot = t + 3500 + Math.random() * 7000; }
      draw(t); raf = requestAnimationFrame(step);
    }
    function start() { if (!raf && !RM && vis && !document.hidden && cv.isConnected) { last = 0; raf = requestAnimationFrame(step); } }
    size();
    if (window.ResizeObserver) { ro = new ResizeObserver(function () { if (Math.abs(host.clientWidth - W) > 1 || Math.abs(host.clientHeight - H) > 1) size(); }); ro.observe(host); }
    if (window.IntersectionObserver) { io = new IntersectionObserver(function (e) { vis = e[0].isIntersecting; start(); }); io.observe(host); }
    document.addEventListener('visibilitychange', start);
    start();
  }

  /* ---------- Squelette ---------- */
  function shell() {
    if (!document.getElementById('eb-fonts')) {
      var l = el('link'); l.id = 'eb-fonts'; l.rel = 'stylesheet';
      l.href = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=Jost:wght@400;500;600;700&display=swap';
      document.head.appendChild(l);
    }
    var st = el('style'); st.textContent = CSS; document.head.appendChild(st);
    ROOT.innerHTML = '';
    var top = el('div', 'eb-top');
    top.innerHTML =
      '<span class="eb-brand" data-a="home"><i>✦</i>' + esc(T.bible) + '</span>' +
      '<button class="eb-pill" data-a="books">📖 <span class="eb-cur"></span> ▾</button>' +
      '<label class="eb-pill"><select class="eb-ver" aria-label="' + esc(T.versions) + '"></select></label>' +
      '<label class="eb-pill" title="' + esc(T.parallel) + '">⇆ <select class="eb-par" aria-label="' + esc(T.parallel) + '"></select></label>' +
      '<form class="eb-search"><input type="search" placeholder="' + esc(T.search) + '" aria-label="' + esc(T.search) + '"><button type="submit" aria-label="' + esc(T.go) + '">⌕</button></form>' +
      '<span class="eb-icons"><button class="eb-ic" data-a="listen" title="' + esc(T.listen) + '">🔊</button><button class="eb-ic" data-a="study" title="' + esc(T.mystudy) + '">★</button><button class="eb-ic" data-a="settings" title="' + esc(T.settings) + '">Aa</button></span>';
    ROOT.appendChild(top); starfield(top, 900, true);
    var main = el('div', 'eb-main'); main.innerHTML = '<div class="eb-read"></div>'; ROOT.appendChild(main);
    var bar = el('div', 'eb-bar'); document.body.appendChild(bar);
    var panel = el('div', 'eb-panel'); panel.innerHTML = '<div class="eb-ph"><h3></h3><button aria-label="' + esc(T.close) + '">✕</button></div><div class="eb-pb"></div>'; document.body.appendChild(panel);
    panel.querySelector('.eb-ph button').onclick = closePanel; starfield(panel.querySelector('.eb-ph'), 800, true);
    ['t-light', 't-sepia', 't-dark'].forEach(function (c) { panel.classList.remove(c); });
    UI.top = top; UI.read = $('.eb-read', main); headerOffset(); window.addEventListener('resize', headerOffset); UI.bar = bar; UI.panel = panel;
    applyPrefs();
    var vs = $('.eb-ver', top), ps = $('.eb-par', top);
    var opts = META.versions.map(function (v) { return '<option value="' + v.id + '">' + esc(v.short + ' · ' + v.name) + '</option>'; });
    var grouped = function () {
      var fr = META.versions.filter(function (v) { return v.lang === 'fr'; }), en = META.versions.filter(function (v) { return v.lang === 'en'; });
      var mk = function (a) { return a.map(function (v) { return '<option value="' + v.id + '">' + esc(v.short + ' — ' + v.name) + '</option>'; }).join(''); };
      return '<optgroup label="Français">' + mk(fr) + '</optgroup><optgroup label="English">' + mk(en) + '</optgroup>';
    };
    vs.innerHTML = grouped(); ps.innerHTML = '<option value="">' + esc(T.none) + '</option>' + grouped();
    vs.value = S.v; ps.value = S.p;
    vs.onchange = function () { S.v = vs.value; store.set('ver_' + LANG, S.v); go(S.b, S.c); };
    ps.onchange = function () { S.p = ps.value; store.set('par_' + LANG, S.p); go(S.b, S.c); };
    $('.eb-search', top).onsubmit = function (e) { e.preventDefault(); var q = $('input', top).value.trim(); if (q) setHash('s', q); };
    top.addEventListener('click', function (e) {
      var a = e.target.closest('[data-a]'); if (!a) return;
      var k = a.getAttribute('data-a');
      if (k === 'home') setHash('home');
      else if (k === 'books') bookPicker();
      else if (k === 'settings') settings();
      else if (k === 'study') study();
      else if (k === 'listen') listen(a);
    });
    document.addEventListener('keydown', function (e) {
      if (e.target.closest && e.target.closest('input,textarea,select')) return;
      if (UI.mode !== 'read') return;
      if (e.key === 'ArrowRight') nextCh(1); else if (e.key === 'ArrowLeft') nextCh(-1); else if (e.key === 'Escape') { clearSel(); closePanel(); }
    });
  }
  var UI = {};
  function headerOffset() {
    var h = 0;
    Array.prototype.forEach.call(document.querySelectorAll('header,nav,.navbar,#header,.header'), function (e) {
      var s = getComputedStyle(e); if ((s.position === 'fixed' || s.position === 'sticky') && e.getBoundingClientRect().top <= 1) h = Math.max(h, e.offsetHeight);
    });
    ROOT.style.setProperty('--ebtop', h + 'px'); return h;
  }
  function scrollToRoot() { var h = headerOffset(); var y = ROOT.getBoundingClientRect().top + window.scrollY - h - 8; if (Math.abs(window.scrollY - y) > 40) window.scrollTo({ top: y, behavior: 'smooth' }); }
  function applyPrefs() {
    ROOT.classList.remove('t-light', 't-sepia', 't-dark', 'f-serif', 'f-sans', 'red', 'nonum');
    ROOT.classList.add('t-' + prefs.theme, 'f-' + prefs.font);
    if (prefs.red) ROOT.classList.add('red');
    if (!prefs.nums) ROOT.classList.add('nonum');
    ROOT.style.setProperty('--fs', prefs.size + 'px');
    if (UI.panel) { UI.panel.classList.remove('t-light', 't-sepia', 't-dark'); }
    store.set('prefs', prefs);
  }

  /* ---------- Routage (hash) ---------- */
  // #/lsg/JHN/3/16  |  #/s/requete  |  #/strong/G26  |  #/home
  function setHash() { var a = Array.prototype.slice.call(arguments); location.hash = '#/' + a.map(encodeURIComponent).join('/'); }
  function route() {
    closePanel(); var mm = document.querySelector('.eb-modal'); if (mm) mm.remove();
    var h = decodeURIComponent(location.hash.replace(/^#\/?/, '')).split('/');
    if (!h[0] || h[0] === 'home') return home();
    if (h[0] === 's') return search(h.slice(1).join('/'));
    if (h[0] === 'strong') return strongPage(h[1]);
    var ver = VERS[h[0]] ? h[0] : null, i = ver ? 1 : 0;
    if (ver && ver !== S.v) { S.v = ver; $('.eb-ver', UI.top).value = ver; }
    var b = (h[i] || '').toUpperCase(); if (!BOOKS[b]) return home();
    var c = Math.max(1, Math.min(parseInt(h[i + 1] || '1', 10) || 1, BOOKS[b].ch));
    var v = h[i + 2] ? h[i + 2].split('-').map(Number) : null;
    read(b, c, v);
  }
  function go(b, c, v) {
    var h = '#/' + S.v + '/' + b + '/' + c + (v ? '/' + v : '');
    if (location.hash === h) route(); else location.hash = h;
  }

  /* ---------- Lecture ---------- */
  function verseHTML(t, ver, b, c, n, strong) {
    var out = t.replace(/[&<>"]/g, function (x) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[x]; });
    out = out.replace(/\[([^\]|]+)\|([GH]\d+)\]/g, strong ? '<span class="eb-w" data-s="$2">$1</span>' : '$1');
    out = out.replace(/‹/g, '<span class="eb-j">').replace(/›/g, '</span>');
    var key = b + '.' + c + '.' + n, cls = 'eb-v', mk = '';
    if (hl[key]) cls += ' hl-' + hl[key];
    if (notes[key]) mk = '<span class="eb-mk" title="' + esc(T.note) + '"></span>';
    return '<span class="' + cls + '" data-k="' + key + '" data-v="' + n + '"><sup class="eb-n">' + n + '</sup>' + out + mk + '</span> ';
  }
  function chapterHTML(ver, d, b, c) {
    var V = VERS[ver], ch = d.c[c - 1] || [], paras = {}, html = '';
    (d.p || []).forEach(function (k) { paras[k] = 1; });
    var started = false;
    for (var i = 0; i < ch.length; i++) {
      var n = i + 1, k = c + ':' + n;
      if (!ch[i]) continue;
      if (d.h && d.h[k]) { if (started) html += '</p>'; html += '<div class="eb-h">' + esc(d.h[k]) + '</div><p class="eb-p">'; started = true; }
      else if (paras[k] && started) { html += '</p><p class="eb-p">'; }
      if (!started) { html += '<p class="eb-p">'; started = true; }
      html += verseHTML(ch[i], ver, b, c, n, !!V.strong);
    }
    return html + (started ? '</p>' : '');
  }
  function read(b, c, vs) {
    UI.mode = 'read'; clearSel();
    S.b = b; S.c = c;
    $('.eb-cur', UI.top).textContent = refLabel(b, c);
    hist = [b + '.' + c].concat(hist.filter(function (x) { return x !== b + '.' + c; })).slice(0, 30); store.set('hist', hist); markRead(b, c);
    var vers = [S.v].concat(S.p && S.p !== S.v ? [S.p] : []);
    UI.read.innerHTML = '<p class="eb-muted">' + esc(T.loading) + '</p>';
    Promise.all(vers.map(function (v) { return getBook(v, b); }).concat([b === 'PSA' ? psOffsets() : Promise.resolve({})])).then(function (ds) {
      var offs = ds.pop();
      if (ds.length > 1) return renderParallel(ds, vers, b, c, vs, offs);
      var cols = ds.map(function (d, i) {
        var V = VERS[vers[i]];
        return '<div class="eb-col" data-ver="' + V.id + '"><div class="eb-chead"><h2 class="eb-ctitle">' + esc((V.lang === 'fr' ? BOOKS[b].fr : BOOKS[b].en) + ' ' + c) + '</h2><span class="eb-vtag">' + esc(V.short) + '</span></div>' +
          (V.strong && i === 0 ? '<p class="eb-muted" style="margin:-6px 0 10px">' + esc(T.clickword) + '</p>' : '') +
          '<div class="eb-text">' + chapterHTML(vers[i], d, b, c) + '</div></div>';
      });
      UI.read.innerHTML = '<div class="eb-cols' + (cols.length > 1 ? ' two' : '') + '">' + cols.join('') + '</div>' +
        '<div class="eb-nav"><button class="eb-btn" data-n="-1">← ' + esc(T.prev) + '</button><button class="eb-btn" data-a="pick">' + esc(T.books) + '</button><button class="eb-btn pri" data-n="1">' + esc(T.next) + ' →</button></div>';
      $$('.eb-nav [data-n]', UI.read).forEach(function (x) { x.onclick = function () { nextCh(+x.getAttribute('data-n')); }; });
      $('.eb-nav [data-a="pick"]', UI.read).onclick = bookPicker;
      if (vs && vs[0]) {
        var a = vs[0], z = vs[1] || vs[0];
        var first = null;
        $$('.eb-col:first-child .eb-v', UI.read).forEach(function (x) { var n = +x.getAttribute('data-v'); if (n >= a && n <= z) { x.classList.add('flash'); if (!first) first = x; } });
        if (first) setTimeout(function () { first.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 60);
      } else { scrollToRoot(); }
      bindRead();
      updateMeta(b, c);
    }).catch(function () { UI.read.innerHTML = '<p class="eb-muted">Erreur de chargement.</p>'; });
  }
  function renderParallel(ds, vers, b, c, vs, offs) {
    var V0 = VERS[vers[0]], V1 = VERS[vers[1]], a = ds[0].c[c - 1] || [], z = ds[1].c[c - 1] || [];
    var shift = 0; if (b === 'PSA' && V0.lang !== V1.lang) { var o = offs[c] || 0; shift = V0.lang === 'fr' ? -o : o; }
    var rows = '', used = {};
    var head = function (V) { return '<div class="eb-chead"><h2 class="eb-ctitle">' + esc((V.lang === 'fr' ? BOOKS[b].fr : BOOKS[b].en) + ' ' + c) + '</h2><span class="eb-vtag">' + esc(V.short) + '</span></div>'; };
    var n = Math.max(a.length, z.length - shift);
    for (var i = 1; i <= n; i++) {
      var j = i + shift, left = a[i - 1] ? verseHTML(a[i - 1], vers[0], b, c, i, !!V0.strong) : '', right = '';
      if (j >= 1 && z[j - 1]) { right = verseHTML(z[j - 1], vers[1], b, c, j, !!V1.strong); used[j] = 1; }
      if (i === n) for (var k = j + 1; k <= z.length; k++) if (z[k - 1] && !used[k]) right += verseHTML(z[k - 1], vers[1], b, c, k, !!V1.strong);
      if (i === 1 && shift > 0) for (var k2 = 1; k2 < j; k2++) if (z[k2 - 1]) right = verseHTML(z[k2 - 1], vers[1], b, c, k2, !!V1.strong) + right;
      if (!left && !right) continue;
      var h0 = ds[0].h && ds[0].h[c + ':' + i] ? '<div class="eb-h">' + esc(ds[0].h[c + ':' + i]) + '</div>' : '';
      var h1 = ds[1].h && ds[1].h[c + ':' + j] ? '<div class="eb-h">' + esc(ds[1].h[c + ':' + j]) + '</div>' : '';
      rows += '<div class="eb-pr"><div class="eb-col" data-ver="' + V0.id + '">' + h0 + left + '</div><div class="eb-col2" data-ver="' + V1.id + '">' + h1 + right + '</div></div>';
    }
    UI.read.innerHTML = '<div class="eb-pr eb-prh"><div>' + head(V0) + '</div><div>' + head(V1) + '</div></div><div class="eb-text">' + rows + '</div>' +
      '<div class="eb-nav"><button class="eb-btn" data-n="-1">← ' + esc(T.prev) + '</button><button class="eb-btn" data-a="pick">' + esc(T.books) + '</button><button class="eb-btn pri" data-n="1">' + esc(T.next) + ' →</button></div>';
    $$('.eb-nav [data-n]', UI.read).forEach(function (x) { x.onclick = function () { nextCh(+x.getAttribute('data-n')); }; });
    $('.eb-nav [data-a="pick"]', UI.read).onclick = bookPicker;
    $$('.eb-col2 .eb-v', UI.read).forEach(function (x) { x.classList.add('eb-v2'); });
    if (vs && vs[0]) { var f = null; $$('.eb-col .eb-v', UI.read).forEach(function (x) { var nn = +x.getAttribute('data-v'); if (nn >= vs[0] && nn <= (vs[1] || vs[0])) { x.classList.add('flash'); if (!f) f = x; } }); if (f) setTimeout(function () { f.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 60); }
    bindRead(); updateMeta(b, c);
  }
  function updateMeta(b, c) {
    try { document.title = refLabel(b, c) + ' — ' + VERS[S.v].name + ' | ' + (LANG === 'fr' ? 'École Biblique du Chrétien' : 'Christian Bible School'); } catch (e) { }
  }
  function nextCh(d) {
    var i = META.books.findIndex(function (x) { return x.id === S.b; }), c = S.c + d;
    if (c < 1) { if (i === 0) return; var pb = META.books[i - 1]; return go(pb.id, pb.ch); }
    if (c > BOOKS[S.b].ch) { if (i === META.books.length - 1) return; return go(META.books[i + 1].id, 1); }
    go(S.b, c);
  }
  function bindRead() {
    UI.read.onclick = function (e) {
      var w = e.target.closest('.eb-w');
      if (w) { e.stopPropagation(); strongPanel(w.getAttribute('data-s'), w.textContent); return; }
      var v = e.target.closest('.eb-v'); if (!v || v.classList.contains('eb-v2')) return;
      var k = v.getAttribute('data-k');
      var i = S.sel.indexOf(k);
      if (i >= 0) S.sel.splice(i, 1); else S.sel.push(k);
      $$('.eb-col .eb-v', UI.read).forEach(function (x) { x.classList.toggle('sel', S.sel.indexOf(x.getAttribute('data-k')) >= 0); });
      showBar();
    };
  }
  function selSorted() { return S.sel.slice().sort(function (a, b) { return +a.split('.')[2] - +b.split('.')[2]; }); }
  function selLabel() {
    var s = selSorted(); if (!s.length) return '';
    var p = s[0].split('.'), z = s[s.length - 1].split('.')[2];
    return refLabel(p[0], p[1], p[2], s.length > 1 ? z : null);
  }
  function selText() {
    return selSorted().map(function (k) {
      var x = $('.eb-col .eb-v[data-k="' + k + '"]', UI.read); if (!x) return '';
      var c = x.cloneNode(true); $$('.eb-n,.eb-mk', c).forEach(function (n) { n.remove(); }); return c.textContent.trim();
    }).join(' ');
  }
  function clearSel() { S.sel = []; if (UI.read) $$('.eb-v.sel', UI.read).forEach(function (x) { x.classList.remove('sel'); }); if (UI.bar) UI.bar.classList.remove('on'); }
  function showBar() {
    if (!S.sel.length) return UI.bar.classList.remove('on');
    var one = S.sel.length === 1, k = selSorted()[0];
    UI.bar.innerHTML = '<div class="eb-b1"><span class="eb-ref">' + esc(selLabel()) + '</span>' +
      '<span class="eb-dots"><i data-h="y" style="background:#ffe066"></i><i data-h="g" style="background:#8fae96"></i><i data-h="b" style="background:#7aaee6"></i><i data-h="p" style="background:#d68cb4"></i><i data-h="x" style="background:transparent" title="—"></i></span></div><div class="eb-b2">' +
      '<button data-a="copy"><b>⧉</b>' + esc(T.copy) + '</button>' +
      '<button data-a="link"><b>🔗</b>' + esc(T.share) + '</button>' +
      '<button data-a="note"><b>✎</b>' + esc(T.note) + '</button>' +
      '<button data-a="fav"><b>' + (favs.indexOf(k) >= 0 ? '★' : '☆') + '</b>' + esc(T.fav) + '</button>' +
      '<button data-a="cmp"><b>⇆</b>' + esc(T.compare) + '</button>' +
      '<button data-a="orig"><b>α</b>' + esc(T.original) + '</button>' +
      (one ? '<button data-a="xref"><b>↗</b>' + esc(T.xrefs) + '</button>' : '') +
      '<button data-a="crs"><b>🎓</b>' + esc(T.courses) + '</button>' +
      '<button data-a="x"><b>✕</b></button></div>';
    UI.bar.classList.add('on');
    UI.bar.onclick = function (e) {
      var d = e.target.closest('[data-h]');
      if (d) {
        var c = d.getAttribute('data-h');
        S.sel.forEach(function (k) { if (c === 'x') delete hl[k]; else hl[k] = c; });
        store.set('hl', hl);
        $$('.eb-v', UI.read).forEach(function (x) { var kk = x.getAttribute('data-k'); x.classList.remove('hl-y', 'hl-g', 'hl-b', 'hl-p'); if (hl[kk]) x.classList.add('hl-' + hl[kk]); });
        clearSel(); return;
      }
      var b = e.target.closest('[data-a]'); if (!b) return;
      var a = b.getAttribute('data-a'), sk = selSorted();
      if (a === 'x') clearSel();
      else if (a === 'copy') { copyText('« ' + selText() + ' » (' + selLabel() + ', ' + VERS[S.v].short + ')').then(function () { toast(T.copied); }); }
      else if (a === 'link') { var p = sk[0].split('.'), z = sk[sk.length - 1].split('.')[2]; var u = location.href.split('#')[0] + '#/' + S.v + '/' + p[0] + '/' + p[1] + '/' + p[2] + (sk.length > 1 ? '-' + z : ''); copyText(u).then(function () { toast(T.linkcopied); }); }
      else if (a === 'note') { clearSel(); notePanel(sk[0]); }
      else if (a === 'fav') { sk.forEach(function (k) { var i = favs.indexOf(k); if (i >= 0) favs.splice(i, 1); else favs.unshift(k); }); store.set('favs', favs); showBar(); }
      else if (a === 'cmp') { var L0 = selLabel(); clearSel(); comparePanel(sk, L0); }
      else if (a === 'orig') { clearSel(); origPanel(sk); }
      else if (a === 'xref') { var L1 = selLabel(); clearSel(); xrefPanel(sk[0], L1); }
      else if (a === 'crs') { var L2 = selLabel(); clearSel(); coursePanel(sk, L2); }
    };
  }

  /* ---------- Panneau latéral ---------- */
  function openPanel(title, html) {
    $('h3', UI.panel).textContent = title; var pb = $('.eb-pb', UI.panel); pb.innerHTML = html; pb.scrollTop = 0;
    UI.panel.style.setProperty('--x', 1);
    copyTheme(UI.panel);
    UI.panel.classList.add('on'); return pb;
  }
  function copyTheme(node) { var cs = getComputedStyle(ROOT);['--bg', '--card', '--line', '--ink', '--mut', '--rosel', '--plum', '--plum2', '--rose', '--gold', '--goldl', '--navy', '--teal', '--teall', '--sage'].forEach(function (p) { node.style.setProperty(p, cs.getPropertyValue(p)); }); node.style.fontFamily = '"Jost",system-ui,sans-serif'; }
  function closePanel() { if (UI.panel) UI.panel.classList.remove('on'); }

  function getVerse(ver, key) {
    var p = key.split('.');
    return getBook(ver, p[0]).then(function (d) { var ch = d.c[+p[1] - 1] || []; return ch[+p[2] - 1] || ''; });
  }
  /* correspondance de numérotation FR (Segond) <-> EN (KJV) pour les Psaumes à titre */
  var PS_OFF = null;
  function psOffsets() {
    if (PS_OFF) return Promise.resolve(PS_OFF);
    return Promise.all([getBook('lsg', 'PSA'), getBook('kjv', 'PSA')]).then(function (r) {
      PS_OFF = {}; for (var i = 0; i < 150; i++) { var a = (r[0].c[i] || []).length, b = (r[1].c[i] || []).length; if (a > b) PS_OFF[i + 1] = a - b; } return PS_OFF;
    });
  }
  function mapKey(key, fromLang, toLang) {
    var p = key.split('.');
    if (p[0] !== 'PSA' || fromLang === toLang) return Promise.resolve(key);
    return psOffsets().then(function (o) {
      var off = o[+p[1]] || 0, v = +p[2] + (fromLang === 'fr' ? -off : off);
      return p[0] + '.' + p[1] + '.' + Math.max(1, v);
    });
  }
  function comparePanel(keys, lab) {
    var pb = openPanel(T.compareall + ' — ' + lab, '<p class="eb-muted">' + esc(T.loading) + '</p>');
    var from = VERS[S.v].lang;
    Promise.all(META.versions.map(function (V) {
      return Promise.all(keys.map(function (k) { return mapKey(k, from, V.lang).then(function (kk) { return getVerse(V.id, kk); }); }))
        .then(function (ts) { return '<div class="eb-cmp"><b>' + esc(V.short + ' · ' + V.name) + '</b>' + esc(plain(ts.join(' '))) + '</div>'; });
    })).then(function (h) { pb.innerHTML = h.join(''); });
  }
  function lexEntry(s) { var n = +s.slice(1); return getJSON('strong/' + s[0] + Math.floor(n / 500) + '.json').then(function (d) { return d[s]; }); }
  function strongPanel(s, word) {
    var pb = openPanel(T.strongword + ' · ' + s, '<p class="eb-muted">' + esc(T.loading) + '</p>');
    lexEntry(s).then(function (e) {
      if (!e) { pb.innerHTML = '<p>—</p>'; return; }
      pb.innerHTML = lexHTML(s, e, word);
      bindLex(pb, s);
    });
  }
  function lexHTML(s, e, word) {
    return (word ? '<p class="eb-muted">« ' + esc(word) + ' »</p>' : '') +
      '<div class="eb-lemma" lang="' + (s[0] === 'G' ? 'el' : 'he') + '">' + esc(e.l) + '</div>' +
      '<div class="eb-kv" style="margin-top:10px"><span>' + esc(T.translit) + '</span><span><b>' + esc(e.t) + '</b></span>' +
      (e.p ? '<span>' + esc(T.pron) + '</span><span>' + esc(e.p) + '</span>' : '') +
      '<span>Strong</span><span>' + esc(s) + ' · ' + (s[0] === 'G' ? (LANG === 'fr' ? 'grec' : 'Greek') : (LANG === 'fr' ? 'hébreu' : 'Hebrew')) + '</span>' +
      '<span>' + esc(T.occurrences) + '</span><span>' + e.n + '</span></div>' +
      '<h4>' + esc(T.def) + '</h4><p>' + esc(LANG === 'fr' && e.f ? e.f : e.d) + '</p>' +
      (LANG === 'fr' && e.f && e.d ? '<details class="eb-endef"><summary>Définition originale (anglais)</summary><p class="eb-muted">' + esc(e.d) + '</p></details>' : '') +
      (e.k ? '<h4>' + esc(T.kjvdef) + '</h4><p>' + esc(e.k) + '</p>' : '') +
      (e.o ? '<h4>' + esc(T.deriv) + '</h4><p>' + linkStrong(esc(e.o)) + '</p>' : '') +
      '<p class="eb-muted" style="margin-top:14px">' + esc(T.lexnote) + '</p>' +
      '<p><button class="eb-btn pri" data-occ="' + s + '">' + esc(T.seeocc) + ' (' + e.n + ')</button></p><div class="eb-occ"></div>';
  }
  function linkStrong(h) { return h.replace(/\b([GH]\d{1,4})\b/g, '<button class="eb-chip" data-st="$1">$1</button>'); }
  function bindLex(pb, s) {
    pb.onclick = function (ev) {
      var st = ev.target.closest('[data-st]'); if (st) { strongPanel(st.getAttribute('data-st')); return; }
      var o = ev.target.closest('[data-occ]'); if (o) { o.disabled = true; occurrences(s, $('.eb-occ', pb)); return; }
      var r = ev.target.closest('[data-go]'); if (r) { var p = r.getAttribute('data-go').split('.'); closePanel(); S.v = 'kjv'; $('.eb-ver', UI.top).value = 'kjv'; go(p[0], p[1], p[2]); }
    };
  }
  function occurrences(s, box) {
    var n = +s.slice(1);
    box.innerHTML = '<p class="eb-muted">' + esc(T.loading) + '</p>';
    getJSON('conc/' + s[0] + Math.floor(n / 500) + '.json').then(function (d) {
      var refs = d[s] || [], shown = 0;
      function more() {
        var part = refs.slice(shown, shown + 40); shown += part.length;
        Promise.all(part.map(function (k) { return getVerse('kjv', k).then(function (t) { return [k, t]; }); })).then(function (rows) {
          var h = rows.map(function (r) {
            var p = r[0].split('.'), txt = esc(r[1]).replace(/\[([^\]|]+)\|([GH]\d+)\]/g, function (m, w, ss) { return ss === s ? '<mark>' + w + '</mark>' : w; }).replace(/[‹›]/g, '');
            return '<div class="eb-li" data-go="' + r[0] + '"><span class="eb-lr">' + esc(BOOKS[p[0]].en + ' ' + p[1] + ':' + p[2]) + '</span>' + txt + '</div>';
          }).join('');
          var old = $('.eb-more', box); if (old) old.remove();
          if (shown === part.length) box.innerHTML = '';
          box.insertAdjacentHTML('beforeend', h + (shown < refs.length ? '<p><button class="eb-btn eb-more">+ ' + (refs.length - shown) + '</button></p>' : ''));
          var m = $('.eb-more', box); if (m) m.onclick = more;
        });
      }
      more();
    });
  }
  function origPanel(keys) {
    var pb = openPanel(T.originalverse, '<p class="eb-muted">' + esc(T.loading) + '</p>');
    var from = VERS[S.v].lang;
    Promise.all(keys.map(function (k) { return mapKey(k, from, 'en').then(function (kk) { return getVerse('kjv', kk).then(function (t) { return [kk, t]; }); }); })).then(function (rows) {
      var all = [];
      rows.forEach(function (r) { var re = /\[([^\]|]+)\|([GH]\d+)\]/g, m; while ((m = re.exec(r[1]))) all.push([m[1], m[2]]); });
      var uniq = []; var seen = {};
      all.forEach(function (x) { if (!seen[x[1]]) { seen[x[1]] = 1; uniq.push(x); } });
      Promise.all(uniq.map(function (x) { return lexEntry(x[1]); })).then(function (es) {
        pb.innerHTML = '<p class="eb-muted">' + esc(T.origfrom) + '</p><div class="eb-cmp"><b>KJV</b>' + esc(plain(rows.map(function (r) { return r[1]; }).join(' '))) + '</div><div class="eb-orig" style="margin-top:12px">' +
          uniq.map(function (x, i) { var e = es[i] || {}; return '<div class="eb-ow" data-st="' + x[1] + '"><div class="g">' + esc(e.l || '') + '</div><div><b>' + esc(e.t || '') + '</b></div><div class="e">' + esc(x[0]) + '</div><div class="s">' + x[1] + '</div></div>'; }).join('') + '</div>';
        pb.onclick = function (ev) { var st = ev.target.closest('[data-st]'); if (st) strongPanel(st.getAttribute('data-st')); };
      });
    });
  }
  /* abréviations des références de la Segond (renvois) */
  var ABBR = null;
  function abbrMap() {
    if (ABBR) return ABBR; ABBR = {};
    META.books.forEach(function (b) { ABBR[b.afr.replace(/^(\d)/, '$1 ')] = b.id; ABBR[b.afr] = b.id; });
    return ABBR;
  }
  function xrefPanel(key, lab) {
    var pb = openPanel(T.xrefs + ' — ' + lab, '<p class="eb-muted">' + esc(T.loading) + '</p>');
    var p = key.split('.');
    var srcLang = VERS[S.v].lang;
    mapKey(key, srcLang, 'fr').then(function (fk) {
      var fp = fk.split('.');
      getBook('lsg', fp[0]).then(function (d) {
        var x = (d.x || {})[fp[1] + ':' + fp[2]];
        if (!x) { pb.innerHTML = '<p>' + esc(T.empty) + '</p>'; return; }
        var refs = parseAbbrRefs(x, fp[0]);
        if (!refs.length) { pb.innerHTML = '<p>' + esc(x) + '</p>'; return; }
        Promise.all(refs.map(function (r) { return getVerse('lsg', r[0] + '.' + r[1] + '.' + r[2]).then(function (t) { return [r, t]; }); })).then(function (rows) {
          pb.innerHTML = '<p class="eb-muted">Louis Segond 1910</p>' + rows.map(function (row) {
            var r = row[0]; return '<div class="eb-li" data-go="' + r[0] + '.' + r[1] + '.' + r[2] + '"><span class="eb-lr">' + esc(BOOKS[r[0]].fr + ' ' + r[1] + '.' + r[2] + (r[3] && r[3] !== r[2] ? '-' + r[3] : '')) + '</span>' + esc(plain(row[1])) + '</div>';
          }).join('');
          pb.onclick = function (ev) { var g = ev.target.closest('[data-go]'); if (!g) return; var q = g.getAttribute('data-go').split('.'); closePanel(); if (VERS[S.v].lang !== 'fr') { S.v = 'lsg'; $('.eb-ver', UI.top).value = 'lsg'; } go(q[0], q[1], q[2]); };
        });
      });
    });
  }
  function parseAbbrRefs(s, curBook) {
    var A = abbrMap(), out = [], book = curBook, chap = null;
    s.replace(/\(|\)/g, '').split(/[;.]\s*(?=[1-3]?\s?[A-ZÉ]|\d)/).forEach(function (seg) { });
    var tokens = s.replace(/[()]/g, ' ').split(/\s*;\s*|\.\s+(?=[1-3]?\s?[A-ZÉÈ])/);
    tokens.forEach(function (tk) {
      tk = tk.trim().replace(/\.$/, ''); if (!tk) return;
      var m = tk.match(/^([1-3]?\s?[A-ZÉÈa-zéèëï]+)\s+(.*)$/);
      var rest = tk;
      if (m && (A[m[1]] || A[m[1].replace(' ', '')])) { book = A[m[1]] || A[m[1].replace(' ', '')]; rest = m[2]; }
      rest.split(/\s*,\s*/).forEach(function (part) {
        var cm = part.match(/^(\d+):(\d+)(?:-(\d+))?/);
        if (cm) { chap = +cm[1]; out.push([book, chap, +cm[2], cm[3] ? +cm[3] : null]); return; }
        var vm = part.match(/^(\d+)(?:-(\d+))?$/);
        if (vm && chap) out.push([book, chap, +vm[1], vm[2] ? +vm[2] : null]);
      });
    });
    return out.filter(function (r) { return BOOKS[r[0]]; }).slice(0, 40);
  }
  var COURSES = null;
  function coursePanel(keys, lab) {
    var pb = openPanel(T.courses + ' — ' + lab, '<p class="eb-muted">' + esc(T.loading) + '</p>');
    var from = VERS[S.v].lang;
    getJSON('courses.json').then(function (cj) {
      Promise.all(keys.map(function (k) { return mapKey(k, from, LANG); })).then(function (ks) {
        var ids = {}, list = [];
        ks.forEach(function (k) { (cj[LANG][k] || []).forEach(function (i) { if (!ids[i]) { ids[i] = 1; list.push(i); } }); });
        if (!list.length) { pb.innerHTML = '<p>' + esc(T.nocourse) + '</p>'; return; }
        pb.innerHTML = '<p class="eb-muted">' + esc(T.courselink) + '</p>' + list.map(function (i) {
          var c = cj.courses[i], u = LANG === 'fr' ? c.fu : c.eu, t = LANG === 'fr' ? c.fr : c.en, m = LANG === 'fr' ? c.m : c.me;
          return '<a class="eb-li" style="display:block;text-decoration:none;color:inherit" href="' + esc(u) + '"><span class="eb-lr">' + esc(m || '') + '</span>' + esc(t) + ' →</a>';
        }).join('');
      });
    });
  }
  function notePanel(key) {
    var p = key.split('.');
    var pb = openPanel(T.notefor + ' ' + refLabel(p[0], p[1], p[2]), '<textarea class="eb-ta"></textarea><div class="eb-row"><button class="eb-btn pri" data-a="save">' + esc(T.save) + '</button><button class="eb-btn" data-a="del">' + esc(T.del) + '</button></div>');
    var ta = $('textarea', pb); ta.value = notes[key] || ''; setTimeout(function () { ta.focus(); }, 300);
    pb.onclick = function (e) {
      var a = e.target.closest('[data-a]'); if (!a) return;
      if (a.getAttribute('data-a') === 'save' && ta.value.trim()) notes[key] = ta.value.trim(); else delete notes[key];
      store.set('notes', notes); closePanel(); clearSel(); if (UI.mode === 'read') read(S.b, S.c);
    };
  }

  /* ---------- Bibliothèque des livres (accueil + sélecteur) ---------- */
  var CATS = [
    { t: 'AT', c: '#a8843f', ct: 'rgba(168,132,63,.10)', fr: ['Pentateuque', 'La Loi de Moïse'], en: ['Pentateuch', 'The Law of Moses'], b: 'GEN EXO LEV NUM DEU' },
    { t: 'AT', c: '#b7708f', ct: 'rgba(183,112,143,.10)', fr: ['Livres historiques', 'L’histoire d’Israël'], en: ['Historical books', 'The history of Israel'], b: 'JOS JDG RUT 1SA 2SA 1KI 2KI 1CH 2CH EZR NEH EST' },
    { t: 'AT', c: '#5f826a', ct: 'rgba(95,130,106,.10)', fr: ['Poésie et sagesse', 'Prière, louange et sagesse'], en: ['Poetry and wisdom', 'Prayer, praise and wisdom'], b: 'JOB PSA PRO ECC SNG' },
    { t: 'AT', c: '#4b1d3f', ct: 'rgba(75,29,63,.08)', fr: ['Grands prophètes', 'Les grands messages prophétiques'], en: ['Major prophets', 'The great prophetic messages'], b: 'ISA JER LAM EZK DAN' },
    { t: 'AT', c: '#8a6a9a', ct: 'rgba(138,106,154,.10)', fr: ['Petits prophètes', 'Douze voix pour Israël'], en: ['Minor prophets', 'Twelve voices to Israel'], b: 'HOS JOL AMO OBA JON MIC NAM HAB ZEP HAG ZEC MAL' },
    { t: 'NT', c: '#a8843f', ct: 'rgba(168,132,63,.10)', fr: ['Évangiles', 'La vie et l’œuvre de Jésus'], en: ['Gospels', 'The life and work of Jesus'], b: 'MAT MRK LUK JHN' },
    { t: 'NT', c: '#b7708f', ct: 'rgba(183,112,143,.10)', fr: ['Actes', 'La naissance de l’Église'], en: ['Acts', 'The birth of the Church'], b: 'ACT' },
    { t: 'NT', c: '#4b1d3f', ct: 'rgba(75,29,63,.08)', fr: ['Épîtres de Paul', 'Lettres aux Églises et aux disciples'], en: ['Letters of Paul', 'Letters to churches and disciples'], b: 'ROM 1CO 2CO GAL EPH PHP COL 1TH 2TH 1TI 2TI TIT PHM' },
    { t: 'NT', c: '#5f826a', ct: 'rgba(95,130,106,.10)', fr: ['Épîtres générales', 'Lettres à tous les croyants'], en: ['General letters', 'Letters to all believers'], b: 'HEB JAS 1PE 2PE 1JN 2JN 3JN JUD' },
    { t: 'NT', c: '#8a6a9a', ct: 'rgba(138,106,154,.10)', fr: ['Prophétie', 'La victoire finale de l’Agneau'], en: ['Prophecy', 'The final victory of the Lamb'], b: 'REV' }
  ];
  var ABR = {
    fr: 'Gn Ex Lv Nb Dt Jos Jg Rt 1S 2S 1R 2R 1Ch 2Ch Esd Né Est Jb Ps Pr Ec Ct Es Jr Lm Ez Dn Os Jl Am Ab Jon Mi Na Ha So Ag Za Ml Mt Mc Lc Jn Ac Rm 1Co 2Co Ga Ep Ph Col 1Th 2Th 1Tm 2Tm Tt Phm Hé Jc 1P 2P 1Jn 2Jn 3Jn Jd Ap',
    en: 'Gen Ex Lev Num Deut Josh Judg Ruth 1Sam 2Sam 1Kgs 2Kgs 1Chr 2Chr Ezra Neh Esth Job Ps Prov Eccl Song Isa Jer Lam Ezek Dan Hos Joel Amos Obad Jonah Mic Nah Hab Zeph Hag Zech Mal Matt Mark Luke John Acts Rom 1Cor 2Cor Gal Eph Phil Col 1Th 2Th 1Tim 2Tim Titus Phlm Heb Jas 1Pet 2Pet 1Jn 2Jn 3Jn Jude Rev'
  };
  var SUM = {
    GEN: ['Les commencements : création, chute et promesse', 'Beginnings: creation, the fall and the promise'],
    EXO: ['Dieu délivre son peuple d’Égypte', 'God delivers his people from Egypt'],
    LEV: ['La sainteté et le culte rendu à Dieu', 'Holiness and the worship of God'],
    NUM: ['Quarante ans de marche au désert', 'Forty years in the wilderness'],
    DEU: ['Moïse rappelle la Loi avant la Terre promise', 'Moses restates the Law before the Promised Land'],
    JOS: ['La conquête de la Terre promise', 'The conquest of the Promised Land'],
    JDG: ['Chutes et délivrances au temps des juges', 'Falls and deliverances in the time of the judges'],
    RUT: ['Une histoire de fidélité et de rédemption', 'A story of loyalty and redemption'],
    '1SA': ['Samuel, Saül et l’onction de David', 'Samuel, Saul and the anointing of David'],
    '2SA': ['Le règne de David', 'The reign of David'],
    '1KI': ['Salomon, le Temple et le royaume divisé', 'Solomon, the Temple and the divided kingdom'],
    '2KI': ['Des rois d’Israël et de Juda jusqu’à l’exil', 'Kings of Israel and Judah up to the exile'],
    '1CH': ['L’histoire de David revue pour le culte', 'David’s story retold for worship'],
    '2CH': ['Les rois de Juda et le Temple', 'The kings of Judah and the Temple'],
    EZR: ['Le retour de l’exil et la reconstruction du Temple', 'The return from exile and the rebuilt Temple'],
    NEH: ['La reconstruction des murailles de Jérusalem', 'Rebuilding the walls of Jerusalem'],
    EST: ['Une reine courageuse sauve son peuple', 'A courageous queen saves her people'],
    JOB: ['La foi face à la souffrance', 'Faith in the face of suffering'],
    PSA: ['Cent cinquante prières et chants de louange', 'One hundred and fifty prayers and songs of praise'],
    PRO: ['La sagesse pour la vie de tous les jours', 'Wisdom for everyday life'],
    ECC: ['Le sens de la vie sous le soleil', 'The meaning of life under the sun'],
    SNG: ['Le chant de l’amour', 'The song of love'],
    ISA: ['Le Messie annoncé et le salut promis', 'The coming Messiah and promised salvation'],
    JER: ['L’appel à revenir à Dieu et la nouvelle alliance', 'A call to return to God and the new covenant'],
    LAM: ['Les larmes sur Jérusalem', 'Tears over Jerusalem'],
    EZK: ['La gloire de Dieu et la restauration', 'The glory of God and restoration'],
    DAN: ['Fidèles en exil, visions des royaumes', 'Faithful in exile, visions of kingdoms'],
    HOS: ['L’amour fidèle de Dieu pour un peuple infidèle', 'God’s faithful love for an unfaithful people'],
    JOL: ['Le jour de l’Éternel et l’Esprit répandu', 'The day of the Lord and the outpoured Spirit'],
    AMO: ['La justice de Dieu pour les opprimés', 'God’s justice for the oppressed'],
    OBA: ['Le jugement d’Édom', 'The judgment of Edom'],
    JON: ['Un prophète fuit et Dieu fait grâce', 'A runaway prophet and a gracious God'],
    MIC: ['Pratiquer la justice, aimer la miséricorde', 'Do justice, love mercy'],
    NAM: ['La chute de Ninive', 'The fall of Nineveh'],
    HAB: ['Le juste vivra par la foi', 'The just shall live by faith'],
    ZEP: ['Le jour de l’Éternel et la joie restaurée', 'The day of the Lord and restored joy'],
    HAG: ['Rebâtir la maison de Dieu', 'Rebuild the house of God'],
    ZEC: ['Visions d’espérance et le Roi qui vient', 'Visions of hope and the coming King'],
    MAL: ['Revenez à moi, dit l’Éternel', 'Return unto me, saith the Lord'],
    MAT: ['Jésus, le Roi promis', 'Jesus, the promised King'],
    MRK: ['Jésus, le Serviteur en action', 'Jesus, the Servant in action'],
    LUK: ['Jésus, le Sauveur de tous', 'Jesus, the Saviour of all'],
    JHN: ['Jésus, le Fils de Dieu qui donne la vie', 'Jesus, the Son of God who gives life'],
    ACT: ['L’Esprit saint et l’Évangile jusqu’aux extrémités de la terre', 'The Holy Spirit and the Gospel to the ends of the earth'],
    ROM: ['Le salut par la grâce, au moyen de la foi', 'Salvation by grace through faith'],
    '1CO': ['Une Église appelée à la sainteté et à l’amour', 'A church called to holiness and love'],
    '2CO': ['La force de Dieu dans la faiblesse', 'God’s strength in weakness'],
    GAL: ['La liberté en Christ', 'Freedom in Christ'],
    EPH: ['Nos richesses en Christ', 'Our riches in Christ'],
    PHP: ['La joie en toutes circonstances', 'Joy in every circumstance'],
    COL: ['Christ au-dessus de tout', 'Christ above all'],
    '1TH': ['L’espérance du retour du Seigneur', 'The hope of the Lord’s return'],
    '2TH': ['Tenir ferme jusqu’au retour de Christ', 'Standing firm until Christ returns'],
    '1TI': ['Conseils pour conduire l’Église', 'Guidance for leading the Church'],
    '2TI': ['Le dernier message de Paul : garde la foi', 'Paul’s last message: keep the faith'],
    TIT: ['La saine doctrine et les bonnes œuvres', 'Sound doctrine and good works'],
    PHM: ['Le pardon et la réconciliation', 'Forgiveness and reconciliation'],
    HEB: ['Jésus, plus grand que tout', 'Jesus, greater than all'],
    JAS: ['Une foi vivante qui agit', 'A living faith that acts'],
    '1PE': ['L’espérance au milieu des épreuves', 'Hope in the midst of trials'],
    '2PE': ['Grandir dans la grâce et la connaissance', 'Growing in grace and knowledge'],
    '1JN': ['Dieu est lumière, Dieu est amour', 'God is light, God is love'],
    '2JN': ['Marcher dans la vérité et l’amour', 'Walking in truth and love'],
    '3JN': ['L’hospitalité envers les serviteurs de Dieu', 'Hospitality to God’s servants'],
    JUD: ['Combattre pour la foi', 'Contend for the faith'],
    REV: ['Christ revient : toutes choses nouvelles', 'Christ returns: all things made new']
  };
  var readch = store.get('readch', {}); // "BOOK" -> [chapters]
  function markRead(b, c) { var a = readch[b] || (readch[b] = []); if (a.indexOf(+c) < 0) { a.push(+c); store.set('readch', readch); } }
  function catOf(id) { for (var i = 0; i < CATS.length; i++) if ((' ' + CATS[i].b + ' ').indexOf(' ' + id + ' ') >= 0) return CATS[i]; return CATS[0]; }
  function abbr(id) { var i = META.books.map(function (b) { return b.id; }).indexOf(id); return ABR[LANG].split(' ')[i] || id; }
  var TCOL = { AT: '#a8843f', NT: '#5f826a' };
  function sortKey(n) { return strip(n.toLowerCase()).replace(/^(\d)\s*(.*)$/, '$2 $1'); }
  function libHTML(order) {
    var FR = LANG === 'fr', last = hist[0] ? hist[0].split('.') : null;
    var h = '<div class="eb-lib"><div class="eb-lib-top">' +
      '<div class="eb-lib-tabs" role="group">' + [['bible', FR ? 'Ordre de la Bible' : 'Bible order'], ['az', FR ? 'Ordre alphabétique' : 'Alphabetical']].map(function (x) { return '<button type="button" data-order="' + x[0] + '"' + (x[0] === order ? ' class="on"' : '') + '>' + esc(x[1]) + '</button>'; }).join('') + '</div>' +
      '<label class="eb-lib-find"><span aria-hidden="true">⌕</span><input type="search" placeholder="' + esc(FR ? 'Trouver un livre…' : 'Find a book…') + '" aria-label="' + esc(FR ? 'Trouver un livre' : 'Find a book') + '"></label>' +
      (last && BOOKS[last[0]] ? '<button class="eb-lib-resume" data-gc="' + last[0] + '.' + last[1] + '"><small>' + esc(FR ? 'Reprendre ma lecture' : 'Continue reading') + '</small>' + esc(refLabel(last[0], last[1])) + ' →</button>' : '') +
      '</div><div class="eb-toc">';
    [['AT', T.ot], ['NT', T.nt]].forEach(function (tt) {
      var list = META.books.filter(function (b) { return b.t === tt[0]; }).map(function (b, i) { return { b: b, n: i + 1 }; });
      if (order === 'az') list.sort(function (x, y) { return sortKey(x.b[LANG]) < sortKey(y.b[LANG]) ? -1 : 1; });
      h += '<section class="eb-tcol" style="--c:' + TCOL[tt[0]] + '"><div class="eb-tcol-h"><b>' + esc(tt[1]) + '</b><small>' + list.length + ' ' + (FR ? 'livres' : 'books') + '</small></div><ol class="eb-tlist">' +
        list.map(function (x) {
          var id = x.b.id, rd = (readch[id] || []).length;
          return '<li><button class="eb-trow' + (rd ? ' started' : '') + '" data-bk="' + id + '" data-q="' + esc(strip((x.b.fr + ' ' + x.b.en + ' ' + abbr(id)).toLowerCase())) + '">' +
            '<span class="no">' + (order === 'az' ? esc(abbr(id)) : x.n) + '</span><span class="nm">' + esc(x.b[LANG]) + '</span><span class="dl"></span>' +
            '<span class="ch">' + (rd ? '<i title="' + esc(rd + ' ' + (FR ? 'lus' : 'read')) + '"></i>' : '') + x.b.ch + ' ' + (FR ? 'chap.' : 'ch.') + '</span></button></li>';
        }).join('') + '</ol></section>';
    });
    return h + '</div><p class="eb-muted eb-lib-none" hidden>' + esc(FR ? 'Aucun livre ne correspond.' : 'No book matches.') + '</p></div>';
  }
  function strip(s) { return s.normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  function chapHTML(id) {
    var B = BOOKS[id], C = { c: TCOL[B.t], ct: B.t === 'AT' ? 'rgba(168,132,63,.12)' : 'rgba(95,130,106,.12)' }, L = LANG === 'fr' ? 0 : 1, rd = readch[id] || [], cur = (hist.filter(function (k) { return k.split('.')[0] === id; })[0] || '').split('.')[1];
    var cs = ''; for (var i = 1; i <= B.ch; i++) cs += '<button data-c="' + i + '" class="' + (rd.indexOf(i) >= 0 ? 'rd' : '') + (String(i) === cur ? ' cur' : '') + '" style="--i:' + i + '">' + i + '</button>';
    return '<div class="eb-chv" style="--c:' + C.c + ';--ct:' + C.ct + '">' +
      '<button class="eb-back" data-back>← ' + esc(LANG === 'fr' ? 'Tous les livres' : 'All books') + '</button>' +
      '<div class="eb-chv-h"><span class="ab">' + esc(abbr(id)) + '</span><div><small>' + esc(B.t === 'AT' ? T.ot : T.nt) + '</small><h3>' + esc(B[LANG]) + '</h3><p>' + esc(SUM[id] ? SUM[id][L] : '') + '</p></div></div>' +
      '<div class="eb-row"><button class="eb-btn pri" data-c="' + (cur || 1) + '">' + esc(cur ? (LANG === 'fr' ? 'Reprendre au chapitre ' : 'Continue at chapter ') + cur : (LANG === 'fr' ? 'Commencer la lecture' : 'Start reading')) + ' →</button><span class="eb-muted">' + B.ch + ' ' + (LANG === 'fr' ? 'chapitres' : 'chapters') + (rd.length ? ' · ' + rd.length + ' ' + (LANG === 'fr' ? 'lus' : 'read') : '') + '</span></div>' +
      '<div class="eb-chg">' + cs + '</div></div>';
  }
  // Monte la table des matières dans un conteneur ; onPick(id, c) ouvre la lecture
  function mountLib(box, tab, onPick) {
    var order = store.get('liborder', 'bible');
    var show = function () { box.innerHTML = libHTML(order); box.removeAttribute('data-book'); };
    show();
    box.oninput = function (e) {
      if (!e.target.matches('.eb-lib-find input')) return;
      var q = strip(e.target.value.trim().toLowerCase()), any = false;
      $$('.eb-trow', box).forEach(function (t) { var ok = !q || (' ' + t.getAttribute('data-q')).indexOf(' ' + q) >= 0; t.parentNode.hidden = !ok; any = any || ok; });
      $$('.eb-tcol', box).forEach(function (s) { s.hidden = !$$('li', s).some(function (li) { return !li.hidden; }); });
      $('.eb-lib-none', box).hidden = any;
    };
    box.onkeydown = function (e) { if (e.key === 'Enter' && e.target.matches('.eb-lib-find input')) { e.preventDefault(); var f = $$('.eb-trow', box).filter(function (t) { return !t.parentNode.hidden; })[0]; if (f && e.target.value.trim()) f.click(); } };
    box.onclick = function (e) {
      var o = e.target.closest('[data-order]'); if (o) { order = o.getAttribute('data-order'); store.set('liborder', order); show(); return; }
      var r = e.target.closest('[data-gc]'); if (r) { var q = r.getAttribute('data-gc').split('.'); return onPick(q[0], +q[1]); }
      var bk = e.target.closest('[data-bk]');
      if (bk) {
        var id = bk.getAttribute('data-bk'); if (BOOKS[id].ch === 1) return onPick(id, 1);
        box.innerHTML = chapHTML(id); box.setAttribute('data-book', id);
        var top = box.getBoundingClientRect().top, sc = box.closest('.eb-modal'), off = sc ? 16 : ((parseInt(getComputedStyle(ROOT).getPropertyValue('--ebtop'), 10) || 0) + 14);
        if (top < off || top > window.innerHeight * 0.6) { if (sc) sc.scrollTop += top - off; else window.scrollTo({ top: window.scrollY + top - off, behavior: 'smooth' }); }
        return;
      }
      if (e.target.closest('[data-back]')) { show(); return; }
      var c = e.target.closest('[data-c]'); if (c) return onPick(box.getAttribute('data-book'), +c.getAttribute('data-c'));
    };
  }

  /* ---------- Sélecteur de livres ---------- */
  function modal(html) {
    var m = el('div', 'eb-modal'); m.innerHTML = '<div class="eb-mbox">' + html + '</div>'; document.body.appendChild(m);
    copyTheme($('.eb-mbox', m));
    m.addEventListener('click', function (e) { if (e.target === m || e.target.closest('[data-close]')) m.remove(); });
    return m;
  }
  function bookPicker(id) {
    var m = modal('<div class="eb-row" style="justify-content:space-between;margin-top:0"><h3>' + esc(T.books) + '</h3><button class="eb-btn" data-close>✕</button></div><div class="eb-libbox"></div>');
    $('.eb-mbox', m).classList.add('wide');
    var box = $('.eb-libbox', m);
    mountLib(box, null, function (b, c) { m.remove(); go(b, c); });
    if (id) { var t = $('[data-bk="' + id + '"]', box); if (t) t.click(); }
  }

  /* ---------- Réglages ---------- */
  function settings() {
    var seg = function (k, vals) { return '<span class="eb-seg" data-k="' + k + '">' + vals.map(function (v) { return '<button data-v="' + v[0] + '"' + (String(prefs[k]) === String(v[0]) ? ' class="on"' : '') + '>' + esc(v[1]) + '</button>'; }).join('') + '</span>'; };
    var pb = openPanel(T.settings,
      '<h4>' + esc(T.size) + '</h4><div class="eb-row"><button class="eb-btn" data-sz="-1">A−</button><b class="eb-szv">' + prefs.size + '</b><button class="eb-btn" data-sz="1">A+</button></div>' +
      '<h4>' + esc(T.theme) + '</h4>' + seg('theme', [['light', T.light], ['sepia', T.sepia], ['dark', T.dark]]) +
      '<h4>' + esc(T.fontserif) + '</h4>' + seg('font', [['serif', T.serif], ['sans', T.sans]]) +
      '<h4>' + esc(T.redletter) + '</h4>' + seg('red', [[true, '✓'], [false, '—']]) +
      '<h4>' + esc(T.versenums) + '</h4>' + seg('nums', [[true, '✓'], [false, '—']]));
    pb.onclick = function (e) {
      var z = e.target.closest('[data-sz]');
      if (z) { prefs.size = Math.max(14, Math.min(30, prefs.size + +z.getAttribute('data-sz'))); $('.eb-szv', pb).textContent = prefs.size; applyPrefs(); return; }
      var b = e.target.closest('.eb-seg button'); if (!b) return;
      var k = b.parentNode.getAttribute('data-k'), v = b.getAttribute('data-v');
      prefs[k] = v === 'true' ? true : v === 'false' ? false : v;
      $$('button', b.parentNode).forEach(function (x) { x.classList.toggle('on', x === b); });
      applyPrefs(); copyTheme(UI.panel);
    };
  }

  /* ---------- Mon étude ---------- */
  function study() {
    var hk = Object.keys(hl), nk = Object.keys(notes);
    var li = function (k, extra) { var p = k.split('.'); return '<div class="eb-li" data-go="' + k + '"><span class="eb-lr">' + esc(refLabel(p[0], p[1], p[2])) + '</span>' + (extra || '') + '</div>'; };
    var pb = openPanel(T.mystudy,
      '<h4>' + esc(T.favorites) + ' (' + favs.length + ')</h4>' + (favs.length ? favs.map(function (k) { return li(k); }).join('') : '<p class="eb-muted">' + esc(T.empty) + '</p>') +
      '<h4>' + esc(T.notes) + ' (' + nk.length + ')</h4>' + (nk.length ? nk.map(function (k) { return li(k, esc(notes[k])); }).join('') : '<p class="eb-muted">' + esc(T.empty) + '</p>') +
      '<h4>' + esc(T.highlights) + ' (' + hk.length + ')</h4>' + (hk.length ? hk.slice(0, 200).map(function (k) { return li(k, '<span class="hl-' + hl[k] + '" style="padding:0 8px;border-radius:4px">&nbsp;</span>'); }).join('') : '<p class="eb-muted">' + esc(T.empty) + '</p>') +
      '<h4>' + esc(T.history) + '</h4>' + (hist.length ? hist.map(function (k) { var p = k.split('.'); return '<button class="eb-chip" data-gc="' + k + '">' + esc(refLabel(p[0], p[1])) + '</button>'; }).join('') : '<p class="eb-muted">' + esc(T.empty) + '</p>') +
      '<p style="margin-top:24px"><button class="eb-btn" data-a="reset">' + esc(T.reset) + '</button></p>');
    pb.onclick = function (e) {
      var g = e.target.closest('[data-go]'); if (g) { var p = g.getAttribute('data-go').split('.'); closePanel(); return go(p[0], p[1], p[2]); }
      var c = e.target.closest('[data-gc]'); if (c) { var q = c.getAttribute('data-gc').split('.'); closePanel(); return go(q[0], q[1]); }
      if (e.target.closest('[data-a="reset"]') && confirm(T.confirmreset)) { hl = {}; notes = {}; favs = []; store.set('hl', hl); store.set('notes', notes); store.set('favs', favs); study(); }
    };
  }

  /* ---------- Recherche ---------- */
  var WORKER = null, WREQ = 0, WCB = {};
  function worker() {
    if (WORKER) return WORKER;
    var src = 'var D={};function nrm(s){return s.toLowerCase().normalize("NFD").replace(/[\\u0300-\\u036f]/g,"").replace(/[\\u2019\']/g,"\'")}' +
      'onmessage=function(e){var m=e.data;if(m.load){D[m.v]=m.lines.map(function(l){var i=l.indexOf("\\t");var t=l.slice(i+1);return [l.slice(0,i),t,nrm(t)]});postMessage({id:m.id,ok:1});return}' +
      'var L=D[m.v],q=m.q,res=[],phr=[],words=[];q.replace(/"([^"]+)"/g,function(x,p){phr.push(nrm(p));return""}).split(/\\s+/).forEach(function(w){w=nrm(w).replace(/[^\\w\'-]/g,"");if(w.length>0)words.push(w)});' +
      'var wr=words.map(function(w){return new RegExp("(^|[^a-z0-9])"+w.replace(/[.*+?^${}()|[\\]\\\\]/g,"\\\\$&")+(w.length>3?"":"(?![a-z0-9])"))});' +
      'for(var i=0;i<L.length;i++){var x=L[i],ok=true;if(m.t&&x[0].indexOf(".")>=0){var bi=m.bk.indexOf(x[0].split(".")[0]);if(m.t==="AT"&&bi>38)ok=false;if(m.t==="NT"&&bi<39)ok=false;if(m.t!=="AT"&&m.t!=="NT"&&x[0].split(".")[0]!==m.t)ok=false}' +
      'if(ok)for(var j=0;j<phr.length;j++)if(x[2].indexOf(phr[j])<0){ok=false;break}if(ok)for(var k=0;k<wr.length;k++)if(!wr[k].test(x[2])){ok=false;break}if(ok)res.push([x[0],x[1]])}' +
      'postMessage({id:m.id,res:res,terms:phr.concat(words)})}';
    WORKER = new Worker(URL.createObjectURL(new Blob([src], { type: 'text/javascript' })));
    WORKER.onmessage = function (e) { var cb = WCB[e.data.id]; delete WCB[e.data.id]; cb && cb(e.data); };
    return WORKER;
  }
  var LOADED = {};
  function wcall(msg) { return new Promise(function (r) { var id = ++WREQ; WCB[id] = r; msg.id = id; worker().postMessage(msg); }); }
  function ensureLoaded(v) {
    if (!LOADED[v]) LOADED[v] = Promise.all(META.books.map(function (b) { return getBook(v, b.id).then(function (d) {
      var L = []; d.c.forEach(function (ch, ci) { ch.forEach(function (x, vi) { if (x) L.push(b.id + '.' + (ci + 1) + '.' + (vi + 1) + '\t' + plain(x)); }); }); return L; }); }))
      .then(function (parts) { return wcall({ load: 1, v: v, lines: [].concat.apply([], parts) }); });
    return LOADED[v];
  }
  function search(q) {
    UI.mode = 'search'; clearSel();
    $('input', UI.top).value = q;
    var sm = q.trim().match(/^([GH])\s?0*(\d{1,4})$/i);
    if (sm) return strongPage(sm[1].toUpperCase() + sm[2]);
    UI.read.innerHTML = '<div class="eb-res-h"><h2 class="eb-ctitle">« ' + esc(q) + ' »</h2><span class="eb-vtag">' + esc(VERS[S.v].short) + '</span></div><p class="eb-muted">' + esc(T.exact) + '</p>' +
      '<div class="eb-row"><select class="eb-btn eb-flt"><option value="">' + esc(T.all) + '</option><option value="AT">' + esc(T.ot) + '</option><option value="NT">' + esc(T.nt) + '</option>' +
      META.books.map(function (b) { return '<option value="' + b.id + '">' + esc(b[LANG]) + '</option>'; }).join('') + '</select><span class="eb-cnt eb-muted"></span></div><div class="eb-bk"></div><div class="eb-res"><p class="eb-muted">' + esc(T.loading) + '</p></div>';
    var flt = $('.eb-flt', UI.read);
    var run = function () {
      ensureLoaded(S.v).then(function () { return wcall({ v: S.v, q: q, t: flt.value, bk: META.books.map(function (b) { return b.id; }) }); }).then(function (r) {
        var res = r.res, terms = r.terms.filter(Boolean);
        $('.eb-cnt', UI.read).textContent = res.length + ' ' + (res.length > 1 ? T.results : T.result);
        var byb = {}; res.forEach(function (x) { var b = x[0].split('.')[0]; byb[b] = (byb[b] || 0) + 1; });
        $('.eb-bk', UI.read).innerHTML = Object.keys(byb).length > 1 ? Object.keys(byb).map(function (b) { return '<button class="eb-chip" data-fb="' + b + '">' + esc(BOOKS[b][LANG]) + ' · ' + byb[b] + '</button>'; }).join('') : '';
        var box = $('.eb-res', UI.read), shown = 0;
        var hlre = terms.length ? new RegExp('(' + terms.map(function (t) { return t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/[aeiouc]/g, function (c) { return { a: '[aàâä]', e: '[eéèêë]', i: '[iîï]', o: '[oôö]', u: '[uùûü]', c: '[cç]' }[c]; }); }).join('|') + ')', 'gi') : null;
        var page = function () {
          var part = res.slice(shown, shown + 60); shown += part.length;
          var h = part.map(function (x) { var p = x[0].split('.'); var t = esc(x[1]); if (hlre) t = t.replace(hlre, '<mark>$1</mark>'); return '<div class="eb-li" data-go="' + x[0] + '"><span class="eb-lr">' + esc(refLabel(p[0], p[1], p[2])) + '</span>' + t + '</div>'; }).join('');
          var mb = $('.eb-more', box); if (mb) mb.remove();
          if (shown === part.length) box.innerHTML = res.length ? '' : '<p>' + esc(T.noresult) + '</p>';
          box.insertAdjacentHTML('beforeend', h + (shown < res.length ? '<p><button class="eb-btn eb-more">+ ' + (res.length - shown) + '</button></p>' : ''));
          var m = $('.eb-more', box); if (m) m.onclick = page;
        };
        page();
      });
    };
    flt.onchange = run;
    UI.read.onclick = function (e) {
      var g = e.target.closest('[data-go]'); if (g) { var p = g.getAttribute('data-go').split('.'); return go(p[0], p[1], p[2]); }
      var f = e.target.closest('[data-fb]'); if (f) { flt.value = f.getAttribute('data-fb'); run(); }
    };
    run();
  }
  function strongPage(s) {
    UI.mode = 'strong';
    UI.read.innerHTML = '<p class="eb-muted">' + esc(T.loading) + '</p>';
    lexEntry(s).then(function (e) {
      if (!e) { UI.read.innerHTML = '<p>' + esc(T.noresult) + '</p>'; return; }
      UI.read.innerHTML = '<div class="eb-card" style="max-width:760px">' + lexHTML(s, e) + '</div>';
      bindLex(UI.read, s);
    });
  }

  /* ---------- Accueil ---------- */
  var VOTD = ['JHN.3.16', 'PSA.23.1', 'ROM.8.28', 'PHP.4.13', 'ISA.40.31', 'JER.29.11', 'PRO.3.5', 'MAT.11.28', 'ROM.12.2', 'GAL.2.20', 'EPH.2.8', 'HEB.11.1', 'JHN.14.6', 'PSA.46.1', '2TI.1.7', 'JOS.1.9', 'LAM.3.22', '1JN.4.8', 'MAT.6.33', 'ROM.5.8', 'PSA.119.105', 'JHN.15.5', '2CO.5.17', 'PHP.4.6', '1PE.5.7', 'JAS.1.5', 'COL.3.23', 'PSA.37.4', 'MAT.5.14', 'JHN.17.3', '1CO.13.4', 'ISA.41.10', 'ROM.10.9', 'EPH.6.10', 'HEB.4.12', 'PSA.91.1', 'JHN.8.32', 'REV.3.20', 'MIC.6.8', 'ZEP.3.17'];
  var PLANS = {
    y: { n: 'plan1', days: 365, list: function () { return chapList(META.books.map(function (b) { return b.id; })); } },
    nt: { n: 'plan2', days: 90, list: function () { return chapList(META.books.filter(function (b) { return b.t === 'NT'; }).map(function (b) { return b.id; })); } },
    pp: { n: 'plan3', days: 31, list: function () { var l = []; for (var d = 0; d < 31; d++) { l.push(['PSA', d * 5 + 1]); if (d * 5 + 2 <= 150) l.push(['PSA', d * 5 + 2]); l.push(['PRO', d + 1]); } return l; } }
  };
  function chapList(ids) { var l = []; ids.forEach(function (id) { for (var c = 1; c <= BOOKS[id].ch; c++) l.push([id, c]); }); return l; }
  function planDay(pid, day) {
    var P = PLANS[pid], L = P.list(), per = L.length / P.days, a = Math.floor(day * per), z = Math.floor((day + 1) * per);
    return L.slice(a, Math.max(z, a + 1));
  }
  function home() {
    UI.mode = 'home'; clearSel();
    $('.eb-cur', UI.top).textContent = T.books;
    var d = new Date(), doy = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 864e5), vk = VOTD[doy % VOTD.length];
    var plans = store.get('plans', {});
    var plansHTML = Object.keys(PLANS).map(function (pid) {
      var P = PLANS[pid], st = plans[pid];
      if (!st) return '<div class="eb-li" style="cursor:default"><span class="eb-lr">' + esc(T[P.n]) + '</span><button class="eb-btn" data-ps="' + pid + '">' + esc(T.start) + '</button></div>';
      var done = st.done || [], day = Math.min(P.days - 1, done.length), rd = planDay(pid, day);
      return '<div class="eb-li" style="cursor:default"><span class="eb-lr">' + esc(T[P.n]) + ' — ' + esc(T.day) + ' ' + (day + 1) + '/' + P.days + '</span><div class="eb-prog"><i style="width:' + Math.round(100 * done.length / P.days) + '%"></i></div>' +
        rd.map(function (x) { return '<button class="eb-chip" data-gc="' + x[0] + '.' + x[1] + '">' + esc(refLabel(x[0], x[1])) + '</button>'; }).join('') +
        ' <button class="eb-btn" data-pd="' + pid + '">✓ ' + esc(T.markread) + '</button></div>';
    }).join('');
    UI.read.innerHTML = '<div class="eb-hero"><div class="eb-hero-in"><h4>✦ ' + esc(T.votd) + '</h4><div class="eb-votd eb-vt">…</div><p class="eb-muted eb-vr"></p><button class="eb-btn pri" data-gv="' + vk + '">' + esc(T.go) + ' →</button></div></div>' +
      '<div class="eb-libbox"></div>' +
      '<div class="eb-home">' +
      '<div class="eb-card"><h4>' + esc(T.plans) + '</h4>' + plansHTML + '</div>' +
      '<div class="eb-card"><h4>' + esc(T.history) + '</h4>' + (hist.length ? hist.slice(0, 12).map(function (k) { var p = k.split('.'); return '<button class="eb-chip" data-gc="' + k + '">' + esc(refLabel(p[0], p[1])) + '</button>'; }).join('') : '<p class="eb-muted">' + esc(T.empty) + '</p>') + '</div>' +
      '</div>';
    starfield($('.eb-hero', UI.read), 520, true);
    mountLib($('.eb-libbox', UI.read), null, function (id, c) { go(id, c); });
    mapKey(vk, 'en', VERS[S.v].lang).then(function (k2) {
      getVerse(S.v, k2).then(function (t) { var p = k2.split('.'); $('.eb-vt', UI.read).textContent = plain(t); $('.eb-vr', UI.read).textContent = refLabel(p[0], p[1], p[2]) + ' · ' + VERS[S.v].short; $('[data-gv]', UI.read).setAttribute('data-gv', k2); });
    });
    UI.read.onclick = function (e) {
      var g = e.target.closest('[data-gv]'); if (g) { var p = g.getAttribute('data-gv').split('.'); return go(p[0], p[1], p[2]); }
      var c = e.target.closest('[data-gc]'); if (c) { var q = c.getAttribute('data-gc').split('.'); return go(q[0], q[1]); }
      var b = e.target.closest('[data-b]'); if (b) { var id = b.getAttribute('data-b'); return BOOKS[id].ch === 1 ? go(id, 1) : (S.b = id, bookPickerFor(id)); }
      var ps = e.target.closest('[data-ps]'); if (ps) { plans[ps.getAttribute('data-ps')] = { start: Date.now(), done: [] }; store.set('plans', plans); return home(); }
      var pd = e.target.closest('[data-pd]'); if (pd) { var st = plans[pd.getAttribute('data-pd')]; st.done.push(Date.now()); store.set('plans', plans); return home(); }
    };
  }
  function bookPickerFor(id) { bookPicker(id); }

  /* ---------- Lecture audio ---------- */
  function listen(btn) {
    if (!('speechSynthesis' in window)) return;
    if (speechSynthesis.speaking) { speechSynthesis.cancel(); btn.textContent = '🔊'; return; }
    if (UI.mode !== 'read') return;
    var col = $('.eb-col', UI.read); if (!col) return;
    var vs = $$('.eb-v', col), lang = VERS[S.v].lang === 'fr' ? 'fr-FR' : 'en-US', i = 0;
    btn.textContent = '■';
    var voice = (speechSynthesis.getVoices() || []).filter(function (v) { return v.lang && v.lang.indexOf(lang.slice(0, 2)) === 0; })[0];
    var next = function () {
      $$('.eb-v.flash', col).forEach(function (x) { x.classList.remove('flash'); });
      if (i >= vs.length) { btn.textContent = '🔊'; return; }
      var x = vs[i++], c = x.cloneNode(true); $$('.eb-n,.eb-mk', c).forEach(function (n) { n.remove(); });
      x.classList.add('flash'); x.scrollIntoView({ block: 'center', behavior: 'smooth' });
      var u = new SpeechSynthesisUtterance(c.textContent); u.lang = lang; if (voice) u.voice = voice; u.rate = 0.95; u.onend = next; speechSynthesis.speak(u);
    };
    next();
  }

  /* ---------- Démarrage ---------- */
  getJSON('meta.json').then(function (m) {
    META = m; m.books.forEach(function (b) { BOOKS[b.id] = b; }); m.versions.forEach(function (v) { VERS[v.id] = v; });
    if (!VERS[S.v]) S.v = LANG === 'fr' ? 'lsg' : 'kjv';
    if (S.p && !VERS[S.p]) S.p = '';
    shell();
    window.addEventListener('hashchange', route);
    if (!location.hash) { var q = new URLSearchParams(location.search).get('ref'); if (q) { var r = parseRefString(q); if (r) { location.hash = '#/' + S.v + '/' + r.join('/'); return; } } }
    route();
  });
  function parseRefString(q) {
    var m = q.match(/^([1-3]?\s?[^\d]+?)\s*(\d+)(?:[.:](\d+(?:-\d+)?))?$/); if (!m) return null;
    var n = norm(m[1].trim());
    var b = META.books.find(function (x) { return norm(x.fr) === n || norm(x.en) === n || norm(x.afr) === n.replace(' ', '') || norm(x.aen) === n.replace(' ', '') || x.id.toLowerCase() === n; });
    return b ? [b.id, m[2]].concat(m[3] ? [m[3]] : []) : null;
  }
})();
