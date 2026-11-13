/* ===== TARJUMA PAGE: the translation as a book-like page docked under the Mushaf =====
   A panel at the bottom of the reader (drag the handle to make it taller or shorter; default about half the screen), so the Arabic
   page stays visible above it. The ayahs of the open page run on as continuous text with ayah numbers on ruled lines; the ayah
   being recited is highlighted and kept in view, and the Arabic page scrolls so the recited line is never hidden behind the panel.
   Languages: Hinglish, اردو (Nastaliq), हिन्दी, English. Uses the same translation data as the Tarjuma sheet. */
const TRP_SIZES = [11, 12, 13, 14, 15, 17, 20, 23, 27];   /* px of the Latin / Devanagari text; Urdu is drawn 7px larger */
const trpSizeIdx = ()=>{ const i = TRP_SIZES.indexOf(state.trpPx); return i >= 0 ? i : 6; };   /* default 20px */
const trpDigits = (n, ur)=> ur ? String(n).replace(/\d/g, d=>'٠١٢٣٤٥٦٧٨٩'[d]) : String(n);
const trpMsg = ()=> L({rur:'Load ho raha hai…', en:'Loading…'});
const trpFree = ()=> typeof state.trpTop === 'number';
function trpPanel(){
  let el = document.getElementById('tpPanel'); if(el) return el;
  el = document.createElement('div'); el.id = 'tpPanel'; el.className = 'tp-panel'; el.setAttribute('role', 'region'); el.setAttribute('aria-label', 'Translation page');
  el.innerHTML = '<div class="tp-grip" aria-label="Drag to resize"><i></i></div><div class="tp-head" id="tpHead"></div><div class="tp-scroll" id="tpScroll"></div><div class="tp-rs" aria-label="Drag to resize"><i></i></div>';
  (document.getElementById('detailOverlay').parentElement || document.body).appendChild(el);
  /* drag the top handle = taller / shorter, the header band = move the whole panel up or down, the bottom bar (when floating) = resize from below.
     Double-tap the handle or the header to dock it to the bottom again. */
  const wire = (node, mode)=>{
    let on = false, y0 = 0, top0 = 0, h0 = 0, moved = false;
    node.addEventListener('pointerdown', e=>{ if(e.target.closest('button')) return; on = true; moved = false; y0 = e.clientY; const r = el.getBoundingClientRect(); top0 = r.top; h0 = r.height; try{ node.setPointerCapture(e.pointerId); }catch(x){} el.classList.add('drag'); });
    node.addEventListener('pointermove', e=>{
      if(!on) return; const H = innerHeight, dy = e.clientY - y0; if(Math.abs(dy) > 3) moved = true; if(!moved) return;
      if(mode === 'move'){ state.trpTop = Math.max(8, Math.min(H - 90, top0 + dy)) / H; state.trpH = Math.min(h0, H - state.trpTop * H - 8) / H; if(top0 + dy >= trpDockTop(h0) - 2) state.trpTop = null; }
      else if(mode === 'top'){ if(trpFree()){ const t = Math.max(8, top0 + dy); state.trpTop = t / H; state.trpH = Math.max(H * .2, h0 - (t - top0)) / H; } else state.trpH = Math.max(H * .2, Math.min(H * .9, h0 - dy)) / H; }
      else { if(!trpFree()) state.trpTop = top0 / H; state.trpH = Math.max(H * .2, Math.min(H - top0 - 8, h0 + dy)) / H; }
      trpPlace();
    });
    const end = ()=>{
      if(!on) return; on = false; el.classList.remove('drag');
      if(moved && mode === 'move' && trpFree() && Math.abs(el.getBoundingClientRect().top - trpDockTop(el.offsetHeight)) < 36) state.trpTop = null;
      if(moved){ state.trpH = +(el.offsetHeight / innerHeight).toFixed(3); if(trpFree()) state.trpTop = +(state.trpTop).toFixed(3); saveState(); trpPlace(); trpKeepArabic(true); }
    };
    node.addEventListener('pointerup', end); node.addEventListener('pointercancel', end);
    if(mode !== 'bottom') node.addEventListener('dblclick', e=>{ if(e.target.closest('button')) return; state.trpTop = null; saveState(); trpPlace(); trpKeepArabic(true); });
  };
  wire(el.querySelector('.tp-grip'), 'top'); wire(el.querySelector('.tp-rs'), 'bottom');
  wire(el.querySelector('#tpHead'), 'move');
  const scr = el.querySelector('.tp-scroll');
  scr.onclick = e=>{ const m = e.target.closest('.tp-more'); if(m){ trpMore(m.classList.contains('up') ? -1 : 1); return; } const a = e.target.closest('.tp-a'); if(a) trpTap(+a.dataset.abs); };
  ['touchstart', 'wheel', 'pointerdown'].forEach(ev=> scr.addEventListener(ev, ()=>{ trp.touch = Date.now(); }, { passive:true }));
  let raf = 0;
  scr.addEventListener('scroll', ()=>{ if(raf) return; raf = requestAnimationFrame(()=>{ raf = 0; trpHeadUpdate(); });   /* next / earlier pages load only when their button is tapped */ }, { passive:true });
  return el;
}
/* where the bottom edge of a docked panel sits (above the player while it is open, else above the tab bar) */
function trpDockBottom(){
  const q = document.getElementById('qPlayer'), ov = document.getElementById('detailOverlay'), tb = document.getElementById('tabbar');
  const up = q && q.classList.contains('show') ? q.offsetHeight + parseFloat(getComputedStyle(q).marginBottom || 0) + 8 : 0;
  return up || ((ov && ov.classList.contains('active')) ? 0 : (tb ? tb.offsetHeight : 0));
}
const trpDockTop = h => innerHeight - trpDockBottom() - h;
/* lay the panel out: docked at the bottom, or floating where the person put it */
function trpPlace(){
  const el = document.getElementById('tpPanel'), body = document.getElementById('detailBody'); if(!el || !el.classList.contains('show')) return;
  const H = innerHeight, h = Math.round(Math.max(H * .2, Math.min(H * .92, (state.trpH || .46) * H)));
  el.style.height = h + 'px';
  if(trpFree()){
    const top = Math.max(8, Math.min(H - 90, state.trpTop * H)); el.style.top = top + 'px'; el.style.bottom = 'auto'; el.classList.add('tp-free');
    if(body) body.style.paddingBottom = Math.max(0, H - top + 16) + 'px';
  } else {
    el.style.top = 'auto'; el.style.bottom = trpDockBottom() + 'px'; el.classList.remove('tp-free');
    if(body) body.style.paddingBottom = (el.offsetHeight + trpDockBottom() + 16) + 'px';
  }
}
function trpHide(){
  const el = document.getElementById('tpPanel'); if(el) el.classList.remove('show');
  const body = document.getElementById('detailBody'); if(body) body.style.paddingBottom = '';
}
/* The panel shows a run of pages (trp.from..trp.to) as one continuous scroll; "earlier / next" add a page at either end. */
const trp = { from:0, to:0, lang:'', busy:false, touch:0, focus:0 };
const trpHasPage = n => n >= 2 && n <= QA_PAGE_FIRST.length && trPageAyahs(n).length > 0;
function trpSizeApply(){
  const el = document.getElementById('tpPanel'); if(!el) return;
  const z = TRP_SIZES[trpSizeIdx()]; el.style.setProperty('--tpz', z + 'px'); el.style.setProperty('--tpu', (z + 7) + 'px');
  trpRules();
}
/* Ruled lines: put each rule exactly midway between two lines of text, whatever the font. The first baseline of every paragraph is
   measured (a zero-size probe sits on it); a rule then goes at baseline + half a line - a quarter em, which is the middle of the gap
   between the descenders of one line and the capitals / headline of the next. (Urdu keeps a hand-tuned offset in the stylesheet.) */
function trpRules(){
  const sc = document.getElementById('tpScroll'), panel = document.getElementById('tpPanel'); if(!sc || !panel) return;
  /* whole-pixel line height everywhere, so the lines and the rules can never drift apart down the page */
  sc.querySelectorAll('.tp-p').forEach(p=>{
    const rtl = p.matches('[dir=rtl]'), z = parseFloat(getComputedStyle(panel).getPropertyValue(rtl ? '--tpu' : '--tpz'));
    if(z) p.style.setProperty('--tpl', Math.round(z * (rtl ? 2.9 : 2.35)) + 'px');
  });
  sc.querySelectorAll('.tp-p:not([dir=rtl])').forEach(p=>{
    let probe = p.querySelector('.tp-pb');
    if(!probe){ probe = document.createElement('i'); probe.className = 'tp-pb'; p.insertBefore(probe, p.firstChild); }
    const cs = getComputedStyle(p), L = parseFloat(cs.lineHeight), fs = parseFloat(cs.fontSize);
    if(!L || !fs || !probe.offsetParent) return;
    const base = probe.offsetTop;                  /* layout position of the first baseline (not affected by animations / transforms) */
    const rule = base + L / 2 - fs * .25, first = rule - L;
    p.style.backgroundPosition = '0 ' + first.toFixed(2) + 'px';
    /* no rule above the very first line (the page divider is already there) */
    const cut = first > -1 && first < L / 2 ? Math.ceil(first + 3) : 0;
    p.style.webkitMaskImage = p.style.maskImage = cut ? `linear-gradient(to bottom, transparent ${cut}px, #000 ${cut}px)` : '';
  });
}
/* measure again once things have settled (fonts, tint change, animations, resize) */
function trpRulesLater(){ requestAnimationFrame(()=>{ trpRules(); requestAnimationFrame(trpRules); }); setTimeout(trpRules, 300); setTimeout(trpRules, 900); }
/* HTML of whole pages, in one language */
async function trpBuild(pages, lang){
  const ur = lang === 'ur', ids = pages.flatMap(trPageAyahs), surahs = [...new Set(ids.map(x=>qaSurahAyah(x).s))];
  const data = await Promise.all(surahs.map(s=>trLoad(s, lang)));
  const open = '<p class="tp-p"' + (ur ? ' dir="rtl" lang="ur"' : lang === 'hi' ? ' lang="hi"' : '') + '>';
  return pages.map(pg=>{
    const list = trPageAyahs(pg); if(!list.length) return '';
    let html = open;
    list.forEach(x=>{
      const r = qaSurahAyah(x), t = (data[surahs.indexOf(r.s)][r.a-1] || '').replace(/</g, '&lt;');
      if(r.a === 1){
        if(html.endsWith(open)) html = html.slice(0, -open.length); else html += '</p>';
        html += `<div class="tp-surah">${r.s}. ${(QURAN_SURAHS[r.s-1] || {}).name || ''}</div>${open}`;
      }
      html += `<span class="tp-a" data-abs="${x}">${t} <i class="tp-n" dir="ltr">&#xFD3E;${trpDigits(r.a, ur)}&#xFD3F;</i></span> `;
    });
    return `<section class="tp-pg" data-page="${pg}"><div class="tp-pgno"><span>${L({rur:'Safha', en:'Page'})} ${pg}</span></div>${html}</p></section>`;
  }).join('');
}
function trpHead(page, lang){
  const ids = trPageAyahs(page), para = quranParaOf(page), first = ids.length ? qaSurahAyah(ids[0]).s : quranSurahOf(page).n;
  const head = document.getElementById('tpHead');
  head.innerHTML = `<div class="tp-top"><span id="tpHdPara">${L({rur:'Paara', en:'Para'})} ${para.n}</span><b id="tpHdSurah">${(QURAN_SURAHS[first-1] || {}).name || ''}</b><span id="tpHdPage">${L({rur:'Safha', en:'Page'})} ${page}</span><button type="button" class="tp-x" aria-label="Close">✕</button></div>
    <div class="tp-tools"><div class="tp-langs">${TR_LANGS.map(l=>`<button type="button" data-l="${l.k}" class="${l.k === lang ? 'on' : ''}">${l.n}</button>`).join('')}</div><div class="tp-sz"><button type="button" data-z="-1" aria-label="Smaller text">A−</button><button type="button" data-z="1" aria-label="Bigger text">A+</button></div></div>`;
  head.querySelector('.tp-x').onclick = ()=>{ state.quranTrPage = false; saveState(); trpHide(); const b = document.getElementById('quranTpBtn'); if(b) b.classList.remove('on'); };
  head.querySelector('.tp-langs').onclick = e=>{ const b = e.target.closest('button'); if(!b) return; state.quranTr = b.dataset.l; saveState(); trpFill(state.quranPage); };
  head.querySelector('.tp-sz').onclick = e=>{ const b = e.target.closest('button'); if(!b) return; state.trpPx = TRP_SIZES[Math.max(0, Math.min(TRP_SIZES.length - 1, trpSizeIdx() + (+b.dataset.z)))]; saveState(); trpSizeApply(); };
}
/* the header follows what is at the top of the scroll: its page, para and surah */
function trpHeadUpdate(){
  const sc = document.getElementById('tpScroll'); if(!sc || !document.getElementById('tpHdPage')) return;
  const top = sc.getBoundingClientRect().top;
  const a = [...sc.querySelectorAll('.tp-a')].find(n=>{ const r = n.getClientRects(); return r.length && r[r.length-1].bottom > top + 4; }); if(!a) return;
  const abs = +a.dataset.abs, pg = qaAyahPage(abs), sn = qaSurahAyah(abs).s;
  document.getElementById('tpHdPage').textContent = L({rur:'Safha', en:'Page'}) + ' ' + pg;
  document.getElementById('tpHdPara').textContent = L({rur:'Paara', en:'Para'}) + ' ' + quranParaOf(pg).n;
  document.getElementById('tpHdSurah').textContent = (QURAN_SURAHS[sn-1] || {}).name || '';
}
function trpMoreUI(){
  const sc = document.getElementById('tpScroll'); if(!sc) return;
  const up = sc.querySelector('.tp-more.up'), dn = sc.querySelector('.tp-more.down'); if(!up || !dn) return;
  up.hidden = !trpHasPage(trp.from - 1); dn.hidden = !trpHasPage(trp.to + 1);
  up.textContent = '⬆ ' + L({rur:'Pehle ke ayat', en:'Earlier ayahs'}) + ' · ' + L({rur:'Safha', en:'Page'}) + ' ' + (trp.from - 1);
  dn.textContent = '⬇ ' + L({rur:'Aage ke ayat', en:'Next ayahs'}) + ' · ' + L({rur:'Safha', en:'Page'}) + ' ' + (trp.to + 1);
}
async function trpMore(dir){
  const sc = document.getElementById('tpScroll'), box = sc && sc.querySelector('.tp-pages'); if(!box || trp.busy) return;
  const n = dir < 0 ? trp.from - 1 : trp.to + 1; if(!trpHasPage(n)) return;
  trp.busy = true;
  try{
    const html = await trpBuild([n], trp.lang);
    if(!document.getElementById('tpScroll') || trp.lang !== trLang()) return;
    if(dir < 0){ const h0 = sc.scrollHeight; box.insertAdjacentHTML('afterbegin', html); sc.scrollTop += sc.scrollHeight - h0; trp.from = n; }
    else { box.insertAdjacentHTML('beforeend', html); trp.to = n; }
    trpMoreUI(); trpRules(); trpRulesLater(); trpSync(true, true);
  }catch(e){ showToast(L({rur:'Tarjuma load nahi hua. Internet check karein.', en:'Could not load the translation. Check your internet connection.'}), '!'); }
  finally{ trp.busy = false; }
}
async function trpFill(page){
  if(!document.getElementById('quranWrap')) return trpHide();
  const el = trpPanel(), sc = el.querySelector('#tpScroll'), lang = trLang();
  trpSizeApply();
  el.classList.toggle('tp-night', typeof quranNightOn === 'function' && quranNightOn());
  if(!el.classList.contains('show')) el.classList.add('show');
  trpPlace(); if(typeof quranTintPlayer === 'function') quranTintPlayer();
  const inRange = page >= trp.from && page <= trp.to && !!sc.querySelector('.tp-pages');
  if(inRange && trp.lang === lang){   /* same run of pages: nothing to reload (e.g. the reader moved to a page already shown) */
    if(!document.getElementById('tpHdPage')) trpHead(page, lang);
    trpRulesLater(); trpHeadUpdate(); trpSync(true); if(trp.focus){ trpFocus(trp.focus); trp.focus = 0; } return;
  }
  const pages = []; if(inRange){ for(let n = trp.from; n <= trp.to; n++) pages.push(n); } else { trp.from = trp.to = page; pages.push(page); }
  trp.lang = lang; trpHead(page, lang);
  if(!trPageAyahs(page).length){ sc.innerHTML = `<div class="tp-msg">${L({rur:'Is safhe par ayaat nahi hain.', en:'There are no ayahs on this page.'})}</div>`; return; }
  sc.innerHTML = `<div class="tp-msg">${trpMsg()}</div>`;
  let html;
  try{ html = await trpBuild(pages, lang); }
  catch(e){
    if(state.quranPage !== page) return;
    sc.innerHTML = `<div class="tp-msg">${L({rur:'Tarjuma load nahi hua. Internet check karein.', en:'Could not load the translation. Check your internet connection.'})}<br><button type="button" class="tp-retry">${L({rur:'Dobara koshish', en:'Retry'})}</button></div>`;
    sc.querySelector('.tp-retry').onclick = ()=>{ trp.from = trp.to = 0; trpFill(page); }; return;
  }
  if(state.quranPage !== page || !state.quranTrPage) return;
  sc.innerHTML = `<div class="tp-text"><button type="button" class="tp-more up"></button><div class="tp-pages">${html}</div><button type="button" class="tp-more down"></button>${lang === 'rom' ? `<div class="tp-note">${L({rur:'Hindi tarjuma ko Roman mein khud-ba-khud badla gaya hai, spelling mein thodi kami ho sakti hai.', en:'The Hindi translation is converted to Roman letters automatically, so some spellings may be imperfect.'})}</div>` : ''}${lang === 'ur' ? `<div class="tp-note" dir="rtl" lang="ur">آڈیو (شمشاد علی خان) اور تحریری ترجمے کے الفاظ میں معمولی فرق ہو سکتا ہے، مگر مفہوم اور اصل مطلب ایک ہی رہتا ہے۔</div>` : `<div class="tp-note">${L({rur:'Audio (Urdu, Shamshad Ali Khan) aur likhe huye tarjuma ke alfaaz thode alag ho sakte hain, lekin mafhoom aur asal matlab ek hi rehta hai.', en:'The audio (Urdu, Shamshad Ali Khan) and the written translation may differ slightly in wording, but the meaning stays the same.'})}</div>`}</div>`;
  trpMoreUI(); trpRules(); trpRulesLater();
  const sec = sc.querySelector(`.tp-pg[data-page="${page}"]`); sc.scrollTop = inRange && sec ? Math.max(0, sec.offsetTop - sc.offsetTop - 4) : 0;
  trpHeadUpdate(); trpSync(true);
  if(trp.focus){ trpFocus(trp.focus); trp.focus = 0; }
}
/* tap an ayah: the Arabic page of that ayah opens above (if it is another page) and the recitation starts from it */
function trpTap(abs){
  const pg = qaAyahPage(abs), go = ()=>{ if(pg !== state.quranPage) renderQuranReader(pg); qaPlayFrom(abs); };
  if(pg !== state.quranPage && typeof slideDetail === 'function'){ slideDetail(pg > state.quranPage ? 1 : -1, go); setTimeout(()=>{ if(state.quranPage !== pg && document.getElementById('quranWrap')) go(); }, 900); }
  else go();
}
/* a line of the Arabic page was tapped: mark that ayah in the panel */
function trpFocus(abs){
  const sc = document.getElementById('tpScroll'); if(!sc) return;
  sc.querySelectorAll('.tp-a.tap').forEach(n=>n.classList.remove('tap'));
  const a = sc.querySelector(`.tp-a[data-abs="${abs}"]`); if(!a) return;
  a.classList.add('tap'); trpScrollTo(a, false);
}
function trpScrollTo(a, instant){
  const sc = document.getElementById('tpScroll'); if(!sc) return;
  const br = sc.getBoundingClientRect(), rects = a.getClientRects(); if(!rects.length) return;
  const top = rects[0].top, bot = rects[rects.length - 1].bottom, h = bot - top;
  const want = h > br.height * .7 ? top - br.top - br.height * .12 : (top + bot) / 2 - br.top - br.height / 2;
  sc.scrollTo({ top: Math.max(0, sc.scrollTop + want), behavior: instant ? 'auto' : 'smooth' });
}
/* keep the line being recited visible: above the panel when it sits low, below it when it has been moved to the top */
function trpKeepArabic(instant){
  const el = document.getElementById('tpPanel'), body = document.getElementById('detailBody'), hl = document.querySelector('#quranWrap .qhl');
  if(!el || !el.classList.contains('show') || !body || !hl || !qa.on) return;
  const r = hl.getBoundingClientRect(), br = body.getBoundingClientRect(), pr = el.getBoundingClientRect();
  const below = pr.top + pr.height / 2 < innerHeight / 2;   /* panel in the upper half: the page shows below it */
  const q = document.getElementById('qPlayer'), floor = q && q.classList.contains('show') ? q.getBoundingClientRect().top : innerHeight;
  const lo = below ? pr.bottom + 8 : br.top + 6, hi = below ? floor - 8 : pr.top - 8;
  if(hi - lo < r.height || (r.top >= lo && r.bottom <= hi)) return;
  const mid = r.top + r.height / 2 - (lo + (hi - lo) / 2);
  body.scrollTo({ top: Math.max(0, body.scrollTop + mid), behavior: instant ? 'auto' : 'smooth' });
}
/* back to the ayah being recited, whatever was scrolled meanwhile */
function trpJump(){ trp.touch = 0; const el = document.getElementById('tpPanel'); if(el && el.classList.contains('show')) trpSync(true); }
/* mark the ayah being recited and keep it in view */
function trpSync(force, quiet){
  const sc = document.getElementById('tpScroll'); if(!sc || !document.getElementById('tpPanel').classList.contains('show')) return;
  sc.querySelectorAll('.tp-a.cur').forEach(n=>n.classList.remove('cur'));
  document.getElementById('tpPanel').classList.toggle('tp-follow', !!qa.on);
  const cur = qa.on ? sc.querySelector(`.tp-a[data-abs="${qa.abs}"]`) : null;
  if(!cur){ trpSync._a = 0; return; }
  cur.classList.add('cur'); sc.querySelectorAll('.tp-a.tap').forEach(n=>n.classList.remove('tap'));
  if(trpSync._a === qa.abs && !force) return;
  trpSync._a = qa.abs;
  if(!quiet && (force || Date.now() - trp.touch > 8000)){ trpScrollTo(cur, force); trpKeepArabic(force); }   /* while someone is reading on their own, the recitation does not pull the scroll away */
}
if(document.fonts && document.fonts.ready) document.fonts.ready.then(()=>trpRules());
(function(){
  const ov = document.getElementById('detailOverlay');
  if(ov) new MutationObserver(()=>{ if(!ov.classList.contains('active')) trpHide(); else trpPlace(); }).observe(ov, { attributes:true, attributeFilter:['class'] });
  const body = document.getElementById('detailBody');
  if(body) new MutationObserver(()=>{ if(!document.getElementById('quranWrap')) trpHide(); }).observe(body, { childList:true });
  window.addEventListener('resize', ()=>{ trpPlace(); trpRulesLater(); });
})();
