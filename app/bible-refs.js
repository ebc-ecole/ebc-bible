/* EBC Bible — références bibliques cliquables dans les cours (FR/EN)
   Repère « Jean 3.16 », « 1 Jean 1.7-9 », « John 3:16 »… et affiche le verset dans une bulle,
   avec un lien vers la Bible du site. Chargé depuis le JavaScript du thème. */
(function () {
  'use strict';
  if (window.__ebcRefs) return; window.__ebcRefs = 1;
  var SCRIPT = document.currentScript;
  var BASE = window.EBC_BIBLE_BASE || (SCRIPT && SCRIPT.src.replace(/app\/bible-refs(\.min)?\.js.*$/, '')) || './';
  var DV = (SCRIPT && (SCRIPT.src.match(/[?&][dv]=([\w.-]+)/) || [])[1]) || ''; var QS = DV ? '?v=' + DV : '';
  var EN = /^\/en\//.test(location.pathname) || (document.documentElement.lang || '').indexOf('en') === 0;
  if (document.getElementById('ebc-bible')) return; // pas sur la page Bible elle-même
  var VER = EN ? 'kjv' : 'lsg';
  var BIBLE_URL = EN ? '/en/pages/bible.html' : '/pages/bible.html';
  var META, AL = {}, RE = null, cache = {};

  function getJSON(p) { if (!cache[p]) cache[p] = fetch(BASE + 'data/' + p + QS).then(function (r) { return r.json(); }); return cache[p]; }
  function strip(s) { return s.normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  var EXTRA = { PSA: ['Psaume', 'Psalm', 'Ps'], SNG: ['Cantique', 'Song of Songs', 'Cantique des Cantiques'], REV: ['Revelation', 'Apocalypse'], ISA: ['Esaïe', 'Ésaïe', 'Isaïe'], ACT: ['Actes des apôtres', 'Acts'], ECC: ['Ecclésiaste'], JOL: ['Joël'], EZK: ['Ézéchiel', 'Ezéchiel'], HOS: ['Osée'] };

  function build() {
    META.books.forEach(function (b) {
      [b.fr, b.en].concat(EXTRA[b.id] || []).forEach(function (n) {
        AL[n] = b.id; AL[strip(n)] = b.id; AL[n.replace(/^[ÉÈ]/, 'E')] = b.id;
      });
    });
    var names = Object.keys(AL).sort(function (a, b) { return b.length - a.length; }).map(function (n) { return n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); });
    RE = new RegExp('(^|[^\\wÀ-ÿ])(' + names.join('|') + ')\\s+(\\d{1,3})\\s*[.:]\\s*(\\d{1,3})(?:\\s*[-–]\\s*(\\d{1,3}))?(?![\\w])', 'g');
  }

  var SKIP = 'button,a,label,select,textarea,input,option,[draggable="true"],[role="button"],[contenteditable],svg,script,style,noscript,.ebr,.ebr-pop,code,pre,h1,title,#ebc-lang,header,nav';
  function scan(root) {
    if (!RE || !root) return;
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        if (!n.nodeValue || n.nodeValue.length < 5 || !/\d/.test(n.nodeValue)) return NodeFilter.FILTER_REJECT;
        var p = n.parentElement; if (!p || p.closest(SKIP)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var nodes = []; while (w.nextNode()) nodes.push(w.currentNode);
    nodes.forEach(function (n) {
      var t = n.nodeValue; RE.lastIndex = 0;
      if (!RE.test(t)) return; RE.lastIndex = 0;
      var frag = document.createDocumentFragment(), last = 0, m;
      while ((m = RE.exec(t))) {
        var start = m.index + m[1].length, full = m[0].slice(m[1].length);
        var b = AL[m[2]]; if (!b) continue;
        frag.appendChild(document.createTextNode(t.slice(last, start)));
        var a = document.createElement('span'); a.className = 'ebr'; a.tabIndex = 0;
        a.setAttribute('data-r', b + '.' + m[3] + '.' + m[4] + (m[5] ? '-' + m[5] : ''));
        a.textContent = full; frag.appendChild(a); last = start + full.length;
      }
      if (last === 0) return;
      frag.appendChild(document.createTextNode(t.slice(last)));
      n.parentNode.replaceChild(frag, n);
    });
  }

  var POP = null, HIDE = null;
  function css() {
    var s = document.createElement('style');
    s.textContent = '.ebr{color:inherit;border-bottom:1.5px dotted #b7708f;cursor:pointer;transition:color .15s}.ebr:hover,.ebr:focus{color:#7a3a66;outline:0}' +
      '.ebr-pop{position:absolute;z-index:2147483000;max-width:min(420px,calc(100vw - 20px));background:#fffdfb;color:#2a2026;border-radius:14px;box-shadow:0 14px 44px rgba(75,29,63,.25);border:1px solid #ecdfe6;font:15px/1.6 "Jost",system-ui,sans-serif;overflow:hidden;opacity:0;transform:translateY(6px);transition:opacity .15s,transform .15s}' +
      '.ebr-pop.on{opacity:1;transform:none}.ebr-pop .h{display:flex;justify-content:space-between;align-items:center;gap:10px;background:linear-gradient(135deg,#4b1d3f,#7a3a66);color:#fff;padding:9px 14px;font-weight:600;font-size:14px}' +
      '.ebr-pop .h small{opacity:.8;font-weight:500;letter-spacing:.06em}.ebr-pop .b{padding:12px 14px 6px;font-family:"Cormorant Garamond",Georgia,serif;font-size:19px;line-height:1.5;max-height:260px;overflow:auto}' +
      '.ebr-pop .b sup{font:600 11px "Jost",sans-serif;color:#b7708f;margin-right:3px}.ebr-pop .f{padding:6px 14px 12px;display:flex;justify-content:flex-end}' +
      '.ebr-pop .f a{background:#4b1d3f;color:#fff!important;text-decoration:none;border-radius:999px;padding:7px 14px;font-size:13px;font-weight:600}.ebr-pop .f a:hover{background:#7a3a66}';
    document.head.appendChild(s);
  }
  function label(r) {
    var p = r.split('.'), b = META.books.filter(function (x) { return x.id === p[0]; })[0];
    return (EN ? b.en : b.fr) + ' ' + p[1] + (EN ? ':' : '.') + p[2];
  }
  function show(el) {
    clearTimeout(HIDE);
    var r = el.getAttribute('data-r'), p = r.split('.'), vv = p[2].split('-'), v1 = +vv[0], v2 = +(vv[1] || vv[0]);
    if (!POP) { POP = document.createElement('div'); POP.className = 'ebr-pop'; document.body.appendChild(POP); POP.onmouseenter = function () { clearTimeout(HIDE); }; POP.onmouseleave = hideSoon; }
    var url = BIBLE_URL + '#/' + VER + '/' + p[0] + '/' + p[1] + '/' + v1 + (v2 !== v1 ? '-' + v2 : '');
    POP.innerHTML = '<div class="h"><span>' + esc(label(r)) + '</span><small>' + (EN ? 'KJV' : 'LOUIS SEGOND') + '</small></div><div class="b">…</div><div class="f"><a href="' + url + '">' + (EN ? 'Read in the Bible →' : 'Lire dans la Bible →') + '</a></div>';
    place(el);
    getJSON(VER + '/' + (META.books.filter(function (x) { return x.id === p[0]; })[0].t === 'NT' ? 'NT' : 'OT') + '.json').then(function (dd) { var d = dd[p[0]];
      var ch = d.c[+p[1] - 1] || [], h = '';
      for (var v = v1; v <= Math.min(v2, v1 + 15); v++) if (ch[v - 1]) h += (v2 > v1 ? '<sup>' + v + '</sup>' : '') + esc(ch[v - 1].replace(/\[([^\]|]+)\|[GH]\d+\]/g, '$1').replace(/[‹›]/g, '')) + ' ';
      $b().innerHTML = h || '—'; place(el);
    });
    function $b() { return POP.querySelector('.b'); }
    requestAnimationFrame(function () { POP.classList.add('on'); });
  }
  function place(el) {
    var r = el.getBoundingClientRect(), pw = POP.offsetWidth, ph = POP.offsetHeight;
    var x = Math.min(Math.max(10, r.left + window.scrollX), window.scrollX + document.documentElement.clientWidth - pw - 10);
    var y = r.bottom + window.scrollY + 8;
    if (r.bottom + ph + 16 > window.innerHeight && r.top > ph + 16) y = r.top + window.scrollY - ph - 8;
    POP.style.left = x + 'px'; POP.style.top = y + 'px';
  }
  function hideSoon() { clearTimeout(HIDE); HIDE = setTimeout(function () { if (POP) POP.classList.remove('on'); }, 250); }

  function init() {
    css(); build();
    var root = document.querySelector('#ebc-cours, .ebc-cours, main, #content, .content, body') || document.body;
    scan(document.body);
    var pend = false;
    new MutationObserver(function (ms) {
      if (pend) return; pend = true;
      setTimeout(function () { pend = false; scan(document.body); }, 300);
    }).observe(document.body, { childList: true, subtree: true });
    var hoverable = window.matchMedia && window.matchMedia('(hover:hover)').matches;
    document.addEventListener('mouseover', function (e) { var a = e.target.closest && e.target.closest('.ebr'); if (a && hoverable) show(a); });
    document.addEventListener('mouseout', function (e) { var a = e.target.closest && e.target.closest('.ebr'); if (a && hoverable) hideSoon(); });
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('.ebr');
      if (a) { e.preventDefault(); e.stopPropagation(); show(a); return; }
      if (POP && !e.target.closest('.ebr-pop')) POP.classList.remove('on');
    }, true);
    document.addEventListener('keydown', function (e) { if (e.key === 'Enter' && e.target.classList && e.target.classList.contains('ebr')) show(e.target); if (e.key === 'Escape' && POP) POP.classList.remove('on'); });
  }
  getJSON('meta.json').then(function (m) { META = m; if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init(); });
})();
