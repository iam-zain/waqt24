/* ===== TARJUMA PAGE: the translation as a book-like page docked under the Mushaf =====
   A panel at the bottom of the reader (drag the handle to make it taller or shorter; default about half the screen), so the Arabic
   page stays visible above it. The ayahs of the open page run on as continuous text with ayah numbers on ruled lines; the ayah
   being recited is highlighted and kept in view, and the Arabic page scrolls so the recited line is never hidden behind the panel.
   Languages: Hinglish, اردو (Nastaliq), हिन्दी, English. Uses the same translation data as the Tarjuma sheet. */
const TRP_SIZES = [17, 20, 23, 27];
const trpSizeIdx = ()=> (state.trpSize >= 0 && state.trpSize < TRP_SIZES.length) ? state.trpSize : 1;
const trpDigits = (n, ur)=> ur ? String(n).replace(/\d/g, d=>'٠١٢٣٤٥٦٧٨٩'[d]) : String(n);
const trpMsg = ()=> L({rur:'Load ho raha hai…', en:'Loading…'});
function trpPanel(){
  let el = document.getElementById('tpPanel'); if(el) return el;
  el = document.createElement('div'); el.id = 'tpPanel'; el.className = 'tp-panel'; el.setAttribute('role', 'region'); el.setAttribute('aria-label', 'Translation page');
  el.innerHTML = '<div class="tp-grip" aria-label="Drag to resize"><i></i></div><div class="tp-head" id="tpHead"></div><div class="tp-scroll" id="tpScroll"></div>';
  (document.getElementById('detailOverlay').parentElement || document.body).appendChild(el);
  const g = el.querySelector('.tp-grip'); let y0 = 0, h0 = 0, drag = false;
  g.addEventListener('pointerdown', e=>{ drag = true; y0 = e.clientY; h0 = el.offsetHeight; try{ g.setPointerCapture(e.pointerId); }catch(x){} el.classList.add('drag'); });
  g.addEventListener('pointermove', e=>{ if(drag) trpSetH(h0 + (y0 - e.clientY), false); });
  const end = ()=>{ if(!drag) return; drag = false; el.classList.remove('drag'); state.trpH = +(el.offsetHeight / innerHeight).toFixed(3); saveState(); trpKeepArabic(true); };
  g.addEventListener('pointerup', end); g.addEventListener('pointercancel', end);
  el.querySelector('.tp-scroll').onclick = e=>{ const a = e.target.closest('.tp-a'); if(a) qaPlayFrom(+a.dataset.abs); };
  return el;
}
function trpSetH(px, save){
  const el = document.getElementById('tpPanel'); if(!el) return;
  const h = Math.round(Math.max(innerHeight * .24, Math.min(innerHeight * .86, px)));
  el.style.height = h + 'px'; trpPad();
  if(save){ state.trpH = +(h / innerHeight).toFixed(3); saveState(); }
}
/* the reader page can scroll up past the panel, so the lowest lines of the Arabic page are reachable above it */
function trpPad(){
  const el = document.getElementById('tpPanel'), body = document.getElementById('detailBody'); if(!body) return;
  body.style.paddingBottom = (el && el.classList.contains('show')) ? (el.offsetHeight + (parseFloat(el.style.bottom) || 0) + 16) + 'px' : '';
}
function trpPlace(){
  const el = document.getElementById('tpPanel'); if(!el || !el.classList.contains('show')) return;
  const q = document.getElementById('qPlayer'), ov = document.getElementById('detailOverlay'), tb = document.getElementById('tabbar');
  const up = q && q.classList.contains('show') ? q.offsetHeight + parseFloat(getComputedStyle(q).marginBottom || 0) + 8 : 0;
  el.style.bottom = (up || ((ov && ov.classList.contains('active')) ? 0 : (tb ? tb.offsetHeight : 0))) + 'px';
  trpPad();
}
function trpHide(){
  const el = document.getElementById('tpPanel'); if(el) el.classList.remove('show');
  const body = document.getElementById('detailBody'); if(body) body.style.paddingBottom = '';
}
async function trpFill(page){
  if(!document.getElementById('quranWrap')) return trpHide();
  const el = trpPanel(), head = el.querySelector('#tpHead'), sc = el.querySelector('#tpScroll');
  const lang = trLang(), ids = trPageAyahs(page), ur = lang === 'ur', z = TRP_SIZES[trpSizeIdx()];
  el.style.setProperty('--tpz', z + 'px'); el.style.setProperty('--tpu', (z + 7) + 'px');
  el.classList.toggle('tp-night', typeof quranNightOn === 'function' && quranNightOn());
  if(!el.classList.contains('show')){ el.classList.add('show'); trpSetH(innerHeight * (state.trpH || .46), false); }
  trpPlace(); if(typeof quranTintPlayer === 'function') quranTintPlayer();
  const para = quranParaOf(page), first = ids.length ? qaSurahAyah(ids[0]).s : quranSurahOf(page).n, sname = (QURAN_SURAHS[first-1] || {}).name || '';
  head.innerHTML = `<div class="tp-top"><span>${L({rur:'Paara', en:'Para'})} ${para.n}</span><b>${sname}</b><span>${L({rur:'Safha', en:'Page'})} ${page}</span><button type="button" class="tp-x" aria-label="Close">✕</button></div>
    <div class="tp-tools"><div class="tp-langs">${TR_LANGS.map(l=>`<button type="button" data-l="${l.k}" class="${l.k === lang ? 'on' : ''}">${l.n}</button>`).join('')}</div><div class="tp-sz"><button type="button" data-z="-1" aria-label="Smaller text">A−</button><button type="button" data-z="1" aria-label="Bigger text">A+</button></div></div>`;
  head.querySelector('.tp-x').onclick = ()=>{ state.quranTrPage = false; saveState(); trpHide(); const b = document.getElementById('quranTpBtn'); if(b) b.classList.remove('on'); const t = document.getElementById('quranTrBtn'); if(t) t.hidden = false; };
  head.querySelector('.tp-langs').onclick = e=>{ const b = e.target.closest('button'); if(!b) return; state.quranTr = b.dataset.l; saveState(); trpFill(state.quranPage); };
  head.querySelector('.tp-sz').onclick = e=>{ const b = e.target.closest('button'); if(!b) return; state.trpSize = Math.max(0, Math.min(TRP_SIZES.length - 1, trpSizeIdx() + (+b.dataset.z))); saveState(); trpFill(state.quranPage); };
  if(!ids.length){ sc.innerHTML = `<div class="tp-msg">${L({rur:'Is safhe par ayaat nahi hain.', en:'There are no ayahs on this page.'})}</div>`; return; }
  sc.innerHTML = `<div class="tp-msg">${trpMsg()}</div>`;
  const surahs = [...new Set(ids.map(x=>qaSurahAyah(x).s))];
  let data;
  try{ data = await Promise.all(surahs.map(s=>trLoad(s, lang))); }
  catch(e){
    if(state.quranPage !== page) return;
    sc.innerHTML = `<div class="tp-msg">${L({rur:'Tarjuma load nahi hua. Internet check karein.', en:'Could not load the translation. Check your internet connection.'})}<br><button type="button" class="tp-retry">${L({rur:'Dobara koshish', en:'Retry'})}</button></div>`;
    sc.querySelector('.tp-retry').onclick = ()=>trpFill(page); return;
  }
  if(state.quranPage !== page || !state.quranTrPage) return;
  const open = '<p class="tp-p"' + (ur ? ' dir="rtl" lang="ur"' : '') + '>';
  let html = open;
  ids.forEach(x=>{
    const r = qaSurahAyah(x), t = (data[surahs.indexOf(r.s)][r.a-1] || '').replace(/</g, '&lt;');
    if(r.a === 1){
      if(html.endsWith(open)) html = html.slice(0, -open.length); else html += '</p>';
      html += `<div class="tp-surah">${r.s}. ${(QURAN_SURAHS[r.s-1] || {}).name || ''}</div>${open}`;
    }
    html += `<span class="tp-a" data-abs="${x}">${t} <i class="tp-n" dir="ltr">&#xFD3E;${trpDigits(r.a, ur)}&#xFD3F;</i></span> `;
  });
  html += '</p>';
  if(lang === 'rom') html += `<div class="tp-note">${L({rur:'Hindi tarjuma ko Roman mein khud-ba-khud badla gaya hai, spelling mein thodi kami ho sakti hai.', en:'The Hindi translation is converted to Roman letters automatically, so some spellings may be imperfect.'})}</div>`;
  sc.innerHTML = `<div class="tp-text">${html}</div>`;
  sc.scrollTop = 0;
  trpSync(true);
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
/* keep the line being recited visible above the panel */
function trpKeepArabic(instant){
  const el = document.getElementById('tpPanel'), body = document.getElementById('detailBody'), hl = document.querySelector('#quranWrap .qhl');
  if(!el || !el.classList.contains('show') || !body || !hl || !qa.on) return;
  const r = hl.getBoundingClientRect(), br = body.getBoundingClientRect(), lo = br.top + 6, hi = el.getBoundingClientRect().top - 8;
  if(r.top >= lo && r.bottom <= hi) return;
  const mid = r.top + r.height / 2 - (lo + (hi - lo) / 2);
  body.scrollTo({ top: Math.max(0, body.scrollTop + mid), behavior: instant ? 'auto' : 'smooth' });
}
/* mark the ayah being recited and keep it in view */
function trpSync(force){
  const sc = document.getElementById('tpScroll'); if(!sc || !document.getElementById('tpPanel').classList.contains('show')) return;
  sc.querySelectorAll('.tp-a.cur').forEach(n=>n.classList.remove('cur'));
  const cur = qa.on ? sc.querySelector(`.tp-a[data-abs="${qa.abs}"]`) : null;
  if(!cur){ trpSync._a = 0; return; }
  cur.classList.add('cur'); sc.querySelectorAll('.tp-a.tap').forEach(n=>n.classList.remove('tap'));
  if(trpSync._a === qa.abs && !force) return;
  trpSync._a = qa.abs;
  trpScrollTo(cur, force);
  trpKeepArabic(force);
}
(function(){
  const ov = document.getElementById('detailOverlay');
  if(ov) new MutationObserver(()=>{ if(!ov.classList.contains('active')) trpHide(); else trpPlace(); }).observe(ov, { attributes:true, attributeFilter:['class'] });
  const body = document.getElementById('detailBody');
  if(body) new MutationObserver(()=>{ if(!document.getElementById('quranWrap')) trpHide(); }).observe(body, { childList:true });
  window.addEventListener('resize', ()=>{ const el = document.getElementById('tpPanel'); if(el && el.classList.contains('show')){ trpSetH(innerHeight * (state.trpH || .46), false); trpPlace(); } });
})();
