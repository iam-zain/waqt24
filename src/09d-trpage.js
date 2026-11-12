/* ===== TARJUMA PAGE: the translation laid out as a framed page, one Mushaf page at a time =====
   Same pages as the Mushaf (swipe / page number work as usual). The ayahs of the open page run on as continuous text with
   ayah numbers; the ayah being recited is highlighted and kept in view; tap an ayah to play from it.
   Languages: Hinglish, اردو (Nastaliq), हिन्दी, English. Uses the same translation data as the Tarjuma sheet. */
const TRP_SIZES = [17, 20, 23, 27];
const trpSizeIdx = ()=> (state.trpSize >= 0 && state.trpSize < TRP_SIZES.length) ? state.trpSize : 1;
const trpDigits = (n, ur)=> ur ? String(n).replace(/\d/g, d=>'٠١٢٣٤٥٦٧٨٩'[d]) : String(n);
function trpShell(){ return '<div class="tp-page" id="trPage"><div class="tp-msg">' + L({rur:'Load ho raha hai…', en:'Loading…'}) + '</div></div>'; }
async function trpFill(page){
  const el = document.getElementById('trPage'); if(!el) return;
  const lang = trLang(), ids = trPageAyahs(page), ur = lang === 'ur';
  const z = TRP_SIZES[trpSizeIdx()]; el.style.setProperty('--tpz', z + 'px'); el.style.setProperty('--tpu', (z + 8) + 'px');
  const para = quranParaOf(page);
  if(!ids.length){ el.innerHTML = `<div class="tp-msg">${L({rur:'Is safhe par ayaat nahi hain.', en:'There are no ayahs on this page.'})}</div>`; return; }
  const first = qaSurahAyah(ids[0]).s, sname = (QURAN_SURAHS[first-1] || {}).name || '';
  const bar = `<div class="tp-tools"><div class="tp-langs">${TR_LANGS.map(l=>`<button type="button" data-l="${l.k}" class="${l.k === lang ? 'on' : ''}">${l.n}</button>`).join('')}</div><div class="tp-sz"><button type="button" data-z="-1" aria-label="Smaller text">A−</button><button type="button" data-z="1" aria-label="Bigger text">A+</button></div></div>`;
  const top = `<div class="tp-top"><span>${L({rur:'Paara', en:'Para'})} ${para.n}</span><b>${sname}</b><span>${L({rur:'Safha', en:'Page'})} ${page}</span></div>`;
  el.innerHTML = top + bar + `<div class="tp-msg">${L({rur:'Load ho raha hai…', en:'Loading…'})}</div>`;
  wireBar(el);
  const surahs = [...new Set(ids.map(x=>qaSurahAyah(x).s))];
  let data;
  try{ data = await Promise.all(surahs.map(s=>trLoad(s, lang))); }
  catch(e){
    if(state.quranPage !== page || !document.getElementById('trPage')) return;
    el.innerHTML = top + bar + `<div class="tp-msg">${L({rur:'Tarjuma load nahi hua. Internet check karein.', en:'Could not load the translation. Check your internet connection.'})}<br><button type="button" class="tp-retry">${L({rur:'Dobara koshish', en:'Retry'})}</button></div>`;
    wireBar(el); const rb = el.querySelector('.tp-retry'); if(rb) rb.onclick = ()=>trpFill(page); return;
  }
  if(state.quranPage !== page || document.getElementById('trPage') !== el) return;
  let html = '<p class="tp-p"' + (ur ? ' dir="rtl" lang="ur"' : '') + '>', k = 0;
  ids.forEach(x=>{
    const r = qaSurahAyah(x), t = (data[surahs.indexOf(r.s)][r.a-1] || '').replace(/</g, '&lt;');
    if(r.a === 1 && x !== ids[0] || (r.a === 1 && x === ids[0] && false)){ html += '</p>'; }
    if(r.a === 1){
      if(html.endsWith('<p class="tp-p"' + (ur ? ' dir="rtl" lang="ur"' : '') + '>')) html = html.slice(0, -('<p class="tp-p"' + (ur ? ' dir="rtl" lang="ur"' : '') + '>').length);
      else if(!html.endsWith('</p>')) html += '</p>';
      html += `<div class="tp-surah">${r.s}. ${(QURAN_SURAHS[r.s-1] || {}).name || ''}</div><p class="tp-p"${ur ? ' dir="rtl" lang="ur"' : ''}>`;
    }
    html += `<span class="tp-a${k++ % 2 ? ' alt' : ''}" data-abs="${x}">${t} <i class="tp-n">﴿${trpDigits(r.a, ur)}﴾</i></span> `;
  });
  html += '</p>';
  if(lang === 'rom') html += `<div class="tp-note">${L({rur:'Hindi tarjuma ko Roman mein khud-ba-khud badla gaya hai, spelling mein thodi kami ho sakti hai.', en:'The Hindi translation is converted to Roman letters automatically, so some spellings may be imperfect.'})}</div>`;
  el.innerHTML = top + bar + `<div class="tp-text">${html}</div>`;
  wireBar(el);
  el.querySelector('.tp-text').onclick = e=>{ const a = e.target.closest('.tp-a'); if(a) qaPlayFrom(+a.dataset.abs); };
  trpSync(true);
}
function wireBar(el){
  const langs = el.querySelector('.tp-langs'), sz = el.querySelector('.tp-sz');
  if(langs) langs.onclick = e=>{ const b = e.target.closest('button'); if(!b) return; state.quranTr = b.dataset.l; saveState(); trpFill(state.quranPage); };
  if(sz) sz.onclick = e=>{ const b = e.target.closest('button'); if(!b) return; state.trpSize = Math.max(0, Math.min(TRP_SIZES.length - 1, trpSizeIdx() + (+b.dataset.z))); saveState(); trpFill(state.quranPage); };
}
/* mark the ayah being recited and keep it in view above the player */
function trpSync(force){
  const el = document.getElementById('trPage'); if(!el) return;
  el.querySelectorAll('.tp-a.cur').forEach(n=>n.classList.remove('cur'));
  const cur = qa.on ? el.querySelector(`.tp-a[data-abs="${qa.abs}"]`) : null;
  if(!cur){ trpSync._a = 0; return; }
  cur.classList.add('cur');
  if(trpSync._a === qa.abs && !force) return;
  trpSync._a = qa.abs;
  const body = document.getElementById('detailBody'), q = document.getElementById('qPlayer');
  if(!body) return;
  const br = body.getBoundingClientRect(), qh = q && q.classList.contains('show') ? q.offsetHeight + 12 : 0, vis = br.height - qh;
  const rects = cur.getClientRects(); if(!rects.length) return;
  const top = rects[0].top, bot = rects[rects.length - 1].bottom, h = bot - top;
  const want = h > vis * .7 ? top - br.top - vis * .15 : (top + bot) / 2 - br.top - vis / 2;   /* long ayah: start near the top, else centre it */
  body.scrollTo({ top: Math.max(0, body.scrollTop + want), behavior: force ? 'auto' : 'smooth' });
}
