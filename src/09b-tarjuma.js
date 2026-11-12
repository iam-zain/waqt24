/* ===== TARJUMA: translation of the ayahs on the open Mushaf page =====
   Nothing is bundled. The translation of a Surah is fetched only when needed (alquran.cloud, public API), kept in memory and
   in the browser cache, so a Surah is downloaded once. Tap a line of the page (or the Tarjuma button) to open the sheet. */
const TR_LANGS = [{ k:'ur', n:'اردو', ed:'ur.jalandhry' }, { k:'hi', n:'हिन्दी', ed:'hi.hindi' }, { k:'en', n:'English', ed:'en.sahih' }];
const TR_MEM = {};
let trOpen = false, trFocus = 0;
const trLang = ()=> (TR_LANGS.find(l=>l.k === state.quranTr) || TR_LANGS.find(l=>l.k === (state.lang === 'en' ? 'en' : 'ur'))).k;
async function trLoad(s, lang){
  const key = lang + s; if(TR_MEM[key]) return TR_MEM[key];
  const url = `https://api.alquran.cloud/v1/surah/${s}/${TR_LANGS.find(l=>l.k === lang).ed}`;
  let cache = null; try{ cache = await caches.open('waqt24-tr-v1'); const hit = await cache.match(url); if(hit){ const j = await hit.json(); return TR_MEM[key] = j.data.ayahs.map(a=>a.text); } }catch(e){}
  const res = await fetch(url); if(!res.ok) throw new Error('tr ' + res.status);
  try{ if(cache) cache.put(url, res.clone()); }catch(e){}
  const j = await res.json(); return TR_MEM[key] = j.data.ayahs.map(a=>a.text);
}
function trPageAyahs(page){ const f = QA_PAGE_FIRST[page-1], nx = QA_PAGE_FIRST[page] || (QA_TOTAL + 1), out = []; for(let x = f; x < nx; x++) out.push(x); return out; }
function trSheet(){
  let el = document.getElementById('trSheet'); if(el) return el;
  el = document.createElement('div'); el.id = 'trSheet'; el.className = 'tr-sheet'; el.setAttribute('role','dialog'); el.setAttribute('aria-label','Translation');
  el.innerHTML = `<div class="tr-head"><div class="tr-langs">${TR_LANGS.map(l=>`<button type="button" data-l="${l.k}">${l.n}</button>`).join('')}</div><button type="button" class="tr-x" aria-label="Close">✕</button></div><div class="tr-body" id="trBody"></div>`;
  (document.getElementById('detailOverlay').parentElement || document.body).appendChild(el);
  el.querySelector('.tr-x').onclick = trClose;
  el.querySelector('.tr-langs').onclick = e=>{ const b = e.target.closest('button'); if(!b) return; state.quranTr = b.dataset.l; saveState(); trRender(); };
  return el;
}
function trClose(){ trOpen = false; const el = document.getElementById('trSheet'); if(el) el.classList.remove('show'); }
function trPlace(){
  const el = document.getElementById('trSheet'), q = document.getElementById('qPlayer'); if(!el) return;
  el.style.bottom = (q && q.classList.contains('show') ? q.offsetHeight + parseFloat(getComputedStyle(q).marginBottom || 0) + 8 : 0) + 'px';
}
async function trRender(){
  const page = state.quranPage; if(!trOpen || !page || !document.getElementById('quranWrap')) return;
  const el = trSheet(), body = el.querySelector('#trBody'), lang = trLang();
  el.querySelectorAll('.tr-langs button').forEach(b=>b.classList.toggle('on', b.dataset.l === lang));
  el.classList.add('show'); trPlace();
  const ids = trPageAyahs(page);
  if(!ids.length || page >= QURAN_SURAHS[113].page && false){ body.textContent = ''; return; }
  body.innerHTML = `<div class="tr-msg">${L({rur:'Load ho raha hai…', en:'Loading…'})}</div>`;
  const surahs = [...new Set(ids.map(x=>qaSurahAyah(x).s))];
  let data;
  try{ data = await Promise.all(surahs.map(s=>trLoad(s, lang))); }
  catch(e){ if(state.quranPage === page) body.innerHTML = `<div class="tr-msg">${L({rur:'Tarjuma load nahi hua. Internet check karein.', en:'Could not load the translation. Check your internet connection.'})}<br><button type="button" class="tr-retry">${L({rur:'Dobara koshish', en:'Retry'})}</button></div>`; const rb = body.querySelector('.tr-retry'); if(rb) rb.onclick = trRender; return; }
  if(state.quranPage !== page || !trOpen) return;
  const rtl = lang === 'ur';
  body.innerHTML = ids.map(x=>{ const r = qaSurahAyah(x), t = data[surahs.indexOf(r.s)][r.a-1] || ''; return `<div class="tr-ayah" data-abs="${x}"><b>${(QURAN_SURAHS[r.s-1]||{}).name || ''} ${r.s}:${r.a}</b><p${rtl ? ' dir="rtl" lang="ur"' : ''}>${t.replace(/</g,'&lt;')}</p></div>`; }).join('');
  trSync(true);
}
/* mark the ayah being recited (or tapped) and bring it into view */
function trSync(scroll){
  const body = document.getElementById('trBody'); if(!trOpen || !body) return;
  if(qa.on && trSync._a !== qa.abs){ if(trSync._a) trFocus = 0; trSync._a = qa.abs; }
  const want = trFocus || (qa.on ? qa.abs : 0);
  body.querySelectorAll('.tr-ayah.cur').forEach(n=>n.classList.remove('cur'));
  const n = want && body.querySelector(`.tr-ayah[data-abs="${want}"]`);
  if(n){ n.classList.add('cur'); if(scroll || (qa.on && !trFocus)) n.scrollIntoView({ block:'nearest', behavior: scroll ? 'auto' : 'smooth' }); }
}
function openTarjuma(focusAbs){ trOpen = true; trFocus = focusAbs || 0; trRender(); }
function trRefresh(){ if(trOpen){ trFocus = 0; trRender(); } }
/* tap on a line of the page -> the ayah on that line */
function trLineTap(ev){
  const wrap = document.getElementById('quranWrap'); if(!wrap || wrap.classList.contains('zoomed')) return;
  const img = wrap.querySelector('.quran-page-img'), page = state.quranPage; if(!img || !img.naturalWidth || page < 2 || page >= QURAN_SURAHS[113].page) return;
  const r = img.getBoundingClientRect(), k = Math.min(r.width / img.naturalWidth, r.height / img.naturalHeight), ih = img.naturalHeight * k, iw = img.naturalWidth * k;
  const top = r.top + (r.height - ih) / 2, left = r.left + (r.width - iw) / 2;
  if(ev.clientX < left || ev.clientX > left + iw) return;
  const y = (ev.clientY - top) / ih, E = qaEdges(page, quranEd()); let line = 0;
  for(let i = 1; i < E.length; i++) if(y >= E[i-1] && y < E[i]){ line = i; break; }
  if(!line) return;
  const ids = trPageAyahs(page); let hit = 0;
  for(const x of ids){ const a = parseInt(QA_LINES[(x-1)*2], 16), b = parseInt(QA_LINES[(x-1)*2+1], 16); if(line >= a && line <= b){ hit = x; if(line < b || true) break; } }
  if(hit) openTarjuma(hit);
}
(function(){
  const ov = document.getElementById('detailOverlay');
  if(ov) new MutationObserver(()=>{ if(!ov.classList.contains('active')) trClose(); }).observe(ov, { attributes:true, attributeFilter:['class'] });
  document.addEventListener('click', e=>{ if(e.target.closest && e.target.closest('.quran-page-img')) trLineTap(e); });
})();
