/* ===== TARJUMA: translation of the ayahs on the open Mushaf page =====
   Nothing is bundled. The translation of a Surah is fetched only when needed (alquran.cloud, public API), kept in memory and
   in the browser cache, so a Surah is downloaded once. Tap a line of the page (or the Tarjuma button) to open the sheet. */
const TR_LANGS = [{ k:'rom', n:'Hinglish', ed:'hi.hindi', conv:'roman' }, { k:'ur', n:'اردو', ed:'ur.jalandhry' }, { k:'hi', n:'हिन्दी', ed:'hi.hindi' }, { k:'en', n:'English', ed:'en.sahih' }];
/* Hinglish = the Hindi translation written in Roman letters, converted on the device (no Roman-Urdu translation exists as free data).
   Spelling follows everyday Roman Urdu / Hinglish: aa->a, ee, oo, schwa dropped at word ends and between syllables. */
const DV_C = { 'क':'k','ख':'kh','ग':'g','घ':'gh','ङ':'n','च':'ch','छ':'chh','ज':'j','झ':'jh','ञ':'n','ट':'t','ठ':'th','ड':'d','ढ':'dh','ण':'n','त':'t','थ':'th','द':'d','ध':'dh','न':'n','प':'p','फ':'ph','ब':'b','भ':'bh','म':'m','य':'y','र':'r','ल':'l','व':'v','श':'sh','ष':'sh','स':'s','ह':'h','ळ':'l',
  'क़':'q','ख़':'kh','ग़':'gh','ज़':'z','ड़':'r','ढ़':'rh','फ़':'f','य़':'y' };
const DV_NUKTA = { 'क':'क़','ख':'ख़','ग':'ग़','ज':'ज़','ड':'ड़','ढ':'ढ़','फ':'फ़','य':'य़' };
const DV_V = { 'अ':'a','आ':'a','इ':'i','ई':'ee','उ':'u','ऊ':'oo','ऋ':'ri','ए':'e','ऐ':'ai','ओ':'o','औ':'au','ऑ':'o' };
const DV_M = { 'ा':'a','ि':'i','ी':'ee','ु':'u','ू':'oo','ृ':'ri','े':'e','ै':'ai','ो':'o','ौ':'au','ॉ':'o','ॅ':'e' };
function devaWord(w){
  const ch = Array.from(w.normalize('NFC')), syl = [];   /* syl: {c: consonant roman, v: vowel roman|null (inherent), tail: anusvara etc.} */
  for(let i = 0; i < ch.length; i++){
    let c = ch[i];
    if(DV_C[c] !== undefined){
      if(ch[i+1] === '़' && DV_NUKTA[c]){ c = DV_NUKTA[c]; i++; }
      let cons = DV_C[c];
      /* conjuncts: consonant + virama + consonant stay in one cluster */
      let v = null, inh = true;
      while(ch[i+1] === '्' && DV_C[ch[i+2]] !== undefined){ let n = ch[i+2]; i += 2; if(ch[i+1] === '़' && DV_NUKTA[n]){ n = DV_NUKTA[n]; i++; } cons += DV_C[n]; }
      if(ch[i+1] === '्'){ i++; inh = false; v = ''; }
      else if(DV_M[ch[i+1]] !== undefined){ v = DV_M[ch[i+1]]; inh = false; i++; }
      cons = cons.replace(/^ksh?$/, m=>m).replace('jgy','gy');
      syl.push({ c:cons, v, inh });
    } else if(DV_V[c] !== undefined){ syl.push({ c:'', v:DV_V[c], inh:false });
    } else if(c === 'ं' || c === 'ँ'){ if(syl.length) syl[syl.length-1].tail = (syl[syl.length-1].tail || '') + 'n';
    } else if(c === 'ः'){ if(syl.length) syl[syl.length-1].tail = (syl[syl.length-1].tail || '') + 'h';
    } else if(c === '़' || c === '्'){ /* stray */
    } else syl.push({ lit:c });
  }
  /* inherent "a": dropped at the end of a word and inside it when both neighbours carry a vowel */
  const has = k=> syl[k] && !syl[k].lit && (syl[k].v === 'a' || (syl[k].v && syl[k].v !== '') || (syl[k].inh && !syl[k].drop));
  for(let k = syl.length - 1; k >= 0; k--){
    const y = syl[k]; if(y.lit || !y.inh) continue;
    let lastC = true; for(let j = k + 1; j < syl.length; j++) if(!syl[j].lit){ lastC = false; break; }
    if(y.tail) continue;
    if(lastC){ if(syl.filter(z=>!z.lit).length > 1) y.drop = true; continue; }
    if(k > 0 && has(k-1) && has(k+1) && !syl[k+1].lit) y.drop = true;
  }
  return syl.map(y=> y.lit ? y.lit : y.c + (y.inh ? (y.drop ? '' : 'a') : (y.tail === 'n' && y.v === 'ee' ? '' : (y.v || ''))) + (y.tail === 'n' && y.v === 'e' ? 'in' : (y.tail === 'n' && y.v === 'ee' ? 'in' : (y.tail || '')))).join('');
}
const DV_FIX = { lie:'liye', koee:'koi', naheen:'nahin', yah:'yeh', vah:'woh', kiya:'kiya', nam:'naam', bara:'bada', kisee:'kisi', hee:'hi', bhee:'bhi', jaaoge:'jaoge', gae:'gaye', gaee:'gayi', kee:'ki', ke:'ke', meree:'meri', tumhaaree:'tumhari', hamaaree:'hamari', unheen:'unhein' };
function devaToRoman(text){
  let out = text.replace(/[\u0900-\u097F]+/g, w=>devaWord(w)).replace(/।/g, '.').replace(/\s+/g, ' ').trim();
  out = out.replace(/[a-z]+/g, w=>DV_FIX[w] || (w.length > 3 && /ee$/.test(w) ? w.slice(0, -2) + 'i' : w));
  out = out.replace(/(^|[.?!]\s+)([a-z])/g, (m, a, b)=>a + b.toUpperCase()).replace(/\ballah\b/g, 'Allah').replace(/\bmuhammad\b/gi, 'Muhammad');
  return out;
}
const TR_MEM = {};
let trOpen = false, trFocus = 0;
const trLang = ()=> (TR_LANGS.find(l=>l.k === state.quranTr) || TR_LANGS.find(l=>l.k === (state.lang === 'en' ? 'en' : 'rom'))).k;
async function trLoad(s, lang){
  const key = lang + s; if(TR_MEM[key]) return TR_MEM[key];
  const def = TR_LANGS.find(l=>l.k === lang), conv = def.conv === 'roman' ? devaToRoman : (x=>x);
  const url = `https://api.alquran.cloud/v1/surah/${s}/${def.ed}`;
  let cache = null; try{ cache = await caches.open('waqt24-tr-v1'); const hit = await cache.match(url); if(hit){ const j = await hit.json(); return TR_MEM[key] = j.data.ayahs.map(a=>conv(a.text)); } }catch(e){}
  const res = await fetch(url); if(!res.ok) throw new Error('tr ' + res.status);
  try{ if(cache) cache.put(url, res.clone()); }catch(e){}
  const j = await res.json(); return TR_MEM[key] = j.data.ayahs.map(a=>conv(a.text));
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
  const up = q && q.classList.contains('show') ? q.offsetHeight + parseFloat(getComputedStyle(q).marginBottom || 0) + 8 : 0;
  /* flush with the bottom of the screen (above the tab bar if it shows), or just above the player while that is open */
  const ov = document.getElementById('detailOverlay'), tb = document.getElementById('tabbar');
  el.style.bottom = (up || ((ov && ov.classList.contains('active')) ? 0 : (tb ? tb.offsetHeight : 0))) + 'px';
  el.classList.toggle('tr-flush', !up);
}
async function trRender(){
  const page = state.quranPage; if(!trOpen || !page || !document.getElementById('quranWrap')) return;
  const el = trSheet(), body = el.querySelector('#trBody'), lang = trLang();
  el.querySelectorAll('.tr-langs button').forEach(b=>b.classList.toggle('on', b.dataset.l === lang));
  el.classList.add('show'); trPlace(); if(typeof quranTintPlayer === 'function') quranTintPlayer();
  const ids = trPageAyahs(page);
  if(!ids.length || page >= QURAN_SURAHS[113].page && false){ body.textContent = ''; return; }
  body.innerHTML = `<div class="tr-msg">${L({rur:'Load ho raha hai…', en:'Loading…'})}</div>`;
  const surahs = [...new Set(ids.map(x=>qaSurahAyah(x).s))];
  let data;
  try{ data = await Promise.all(surahs.map(s=>trLoad(s, lang))); }
  catch(e){ if(state.quranPage === page) body.innerHTML = `<div class="tr-msg">${L({rur:'Tarjuma load nahi hua. Internet check karein.', en:'Could not load the translation. Check your internet connection.'})}<br><button type="button" class="tr-retry">${L({rur:'Dobara koshish', en:'Retry'})}</button></div>`; const rb = body.querySelector('.tr-retry'); if(rb) rb.onclick = trRender; return; }
  if(state.quranPage !== page || !trOpen) return;
  const rtl = lang === 'ur';
  body.innerHTML = ids.map(x=>{ const r = qaSurahAyah(x), t = data[surahs.indexOf(r.s)][r.a-1] || ''; return `<div class="tr-ayah" data-abs="${x}"><b>${(QURAN_SURAHS[r.s-1]||{}).name || ''} ${r.s}:${r.a}</b><p${rtl ? ' dir="rtl" lang="ur"' : ''}>${t.replace(/</g,'&lt;')}</p></div>`; }).join('') + (lang === 'rom' ? `<div class="tr-msg" style="padding:10px 6px; font-size:11.5px;">${L({rur:'Hindi tarjuma ko Roman mein khud-ba-khud badla gaya hai, spelling mein thodi kami ho sakti hai.', en:'The Hindi translation is converted to Roman letters automatically, so some spellings may be imperfect.'})}</div>` : '');
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
