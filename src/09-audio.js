/* ===== QUR'AN RECITATION (Mishary Alafasy, 128 kbps, ayah by ayah from EveryAyah) =====
   Light by design: nothing is bundled or saved. One <audio> element plays the current ayah while a second one
   quietly preloads only the next ayah, so playback is gapless without decoding or caching anything. */
const QA_COUNTS = [7,286,200,176,120,165,206,75,129,109,123,111,43,52,99,128,111,110,98,135,112,78,118,64,77,227,93,88,69,60,34,30,73,54,45,83,182,88,75,85,54,53,89,59,37,35,38,29,18,45,60,49,62,55,78,96,29,22,24,13,14,11,11,18,12,12,30,52,52,44,28,28,20,56,40,31,50,40,46,42,29,19,36,25,22,17,19,26,30,20,15,21,11,8,8,19,5,8,8,11,11,8,3,9,5,4,7,3,6,3,5,4,5,6];
const QA_JUZ = [1,149,260,386,517,641,751,900,1042,1201,1328,1479,1649,1803,2030,2215,2484,2674,2876,3215,3386,3564,3733,4090,4265,4511,4706,5105,5242,5673]; /* first ayah (1..6236) of each Para */
const QA_BASE = 'https://everyayah.com/data/Alafasy_128kbps/';
const QA_TOTAL = 6236;
const QA_CUM = (()=>{ const c=[0]; QA_COUNTS.forEach(n=>c.push(c[c.length-1]+n)); return c; })();
const qaAbs = (s,a)=> QA_CUM[s-1] + a;
function qaSurahAyah(abs){ let s = 1; while(s < 114 && QA_CUM[s] < abs) s++; return { s, a: abs - QA_CUM[s-1] }; }
const qaPad = n=> String(n).padStart(3,'0');

/* Which ayah does a page of this Mushaf start with? The exact page-by-ayah table of this edition is not bundled, so it is
   exact on Para-start pages and estimated between known anchors (every Surah start and Para start) everywhere else. */
function qaPageStart(page){
  const para = QURAN_PARAS.find(p=>p.page===page);
  if(para) return { abs: QA_JUZ[para.n-1], exact:true };
  const sur = QURAN_SURAHS.find(x=>x.page===page);
  if(sur) return { abs: qaAbs(sur.n, 1), exact:true };
  const anchors = QURAN_SURAHS.map(x=>({ page:x.page, abs:qaAbs(x.n,1) })).concat(QURAN_PARAS.map(p=>({ page:p.page, abs:QA_JUZ[p.n-1] })))
    .sort((x,y)=> x.page - y.page || x.abs - y.abs);
  let a = anchors[0], b = { page: QURAN_PAGE_COUNT, abs: QA_TOTAL + 1 };
  for(const x of anchors){ if(x.page <= page) a = x; else { b = x; break; } }
  const abs = a.abs + Math.round((page - a.page) * (b.abs - a.abs) / Math.max(1, b.page - a.page));
  return { abs: Math.max(1, Math.min(QA_TOTAL, abs)), exact:false };
}

/* Player state. `bism` = currently on the Bismillah that opens a Surah (Al-Fatihah has it as ayah 1; At-Tawbah has none). */
const qa = { syncPage:0, forceSync:false, on:false, abs:1, bism:false, exact:true, playing:false, A:null, B:null, cur:null, err:false, loading:false };
const qaHasBism = s => s !== 1 && s !== 9;
function qaFile(abs, bism){ if(bism) return QA_BASE + '001001.mp3'; const r = qaSurahAyah(abs); return QA_BASE + qaPad(r.s) + qaPad(r.a) + '.mp3'; }
function qaNextStep(abs, bism){
  if(bism) return { abs, bism:false };
  if(abs >= QA_TOTAL) return null;
  const n = abs + 1, r = qaSurahAyah(n);
  return { abs:n, bism: r.a === 1 && qaHasBism(r.s) };
}
function qaPrevStep(abs, bism){
  if(bism) return abs > 1 ? { abs:abs-1, bism:false } : { abs, bism:false };
  const r = qaSurahAyah(abs);
  if(r.a === 1 && qaHasBism(r.s)) return { abs, bism:true };
  return { abs: Math.max(1, abs-1), bism:false };
}
function qaEls(){
  if(!qa.A){
    qa.A = new Audio(); qa.B = new Audio();
    [qa.A, qa.B].forEach(el=>{
      el.preload = 'none';
      el.addEventListener('ended', ()=>{ if(el === qa.cur) qaAdvance(); });
      el.addEventListener('error', ()=>{ if(el === qa.cur && el.src) qaFail(); });
      el.addEventListener('waiting', ()=>{ if(el === qa.cur){ qa.loading = true; qaUI(); } });
      el.addEventListener('playing', ()=>{ if(el === qa.cur){ qa.loading = false; qa.err = false; qa.playing = true; qaUI(); } });
      el.addEventListener('pause', ()=>{ if(el === qa.cur && !el.ended){ qa.playing = false; qaUI(); } });
    });
    qa.cur = qa.A;
  }
  return qa;
}
function qaPreloadNext(){
  const n = qaNextStep(qa.abs, qa.bism); if(!n) return;
  const other = qa.cur === qa.A ? qa.B : qa.A, url = qaFile(n.abs, n.bism);
  if(other.src !== url){ other.src = url; other.preload = 'auto'; try{ other.load(); }catch(e){} }
}
function qaPlayCurrent(){
  qaEls();
  const url = qaFile(qa.abs, qa.bism);
  if(qa.cur.src !== url) qa.cur.src = url;
  qa.err = false; qa.loading = true; qaUI(); qaMediaMeta();
  const p = qa.cur.play(); if(p && p.catch) p.catch(()=>{ if(!qa.err && qa.cur.paused) qaFail(); });
  qaPreloadNext();
}
function qaFail(){
  qa.err = true; qa.loading = false; qa.playing = false; qaUI();
  showToast(L({rur:'Awaaz nahi chal saki. Internet check karein.', en:'Could not play. Check your internet connection.'}), '!');
}
function qaAdvance(){
  const n = qaNextStep(qa.abs, qa.bism);
  if(!n){ qaStop(); return; }
  qa.abs = n.abs; qa.bism = n.bism;
  const other = qa.cur === qa.A ? qa.B : qa.A, url = qaFile(qa.abs, qa.bism);
  if(other.src === url){ qa.cur = other; qa.cur.currentTime = 0; qa.err = false; qaUI(); qaMediaMeta(); const p = qa.cur.play(); if(p && p.catch) p.catch(()=>qaFail()); qaPreloadNext(); }
  else qaPlayCurrent();
}
function qaStep(dir){
  const n = dir > 0 ? qaNextStep(qa.abs, qa.bism) : qaPrevStep(qa.abs, qa.bism);
  if(!n) return;
  qa.abs = n.abs; qa.bism = n.bism; qa.exact = true;
  qa.cur.pause(); qaPlayCurrent();
}
function qaToggle(){
  qaEls();
  if(qa.playing){ qa.cur.pause(); }
  else if(qa.cur.src && !qa.err && qa.cur.src === qaFile(qa.abs, qa.bism)){ const p = qa.cur.play(); if(p && p.catch) p.catch(()=>qaFail()); }
  else qaPlayCurrent();
}
function qaStop(){
  if(qa.A){ [qa.A, qa.B].forEach(el=>{ el.pause(); el.removeAttribute('src'); try{ el.load(); }catch(e){} }); }
  qa.on = false; qa.playing = false; qa.loading = false; qa.err = false;
  try{ if(navigator.mediaSession) navigator.mediaSession.playbackState = 'none'; }catch(e){}
  qaUI();
}
/* Start from the current Mushaf page */
function quranListen(page){
  const st = qaPageStart(page);
  qaEls(); qa.on = true; qa.syncPage = page; qa.abs = st.abs; qa.exact = st.exact;
  const r = qaSurahAyah(st.abs); qa.bism = r.a === 1 && qaHasBism(r.s);
  qa.cur.pause(); qaPlayCurrent();
}
/* The reader moved to another page while the player is open: follow it. A playing recitation restarts at the new page,
   a paused one just moves its position (and stays paused). Re-renders of the same page change nothing. */
function qaSyncToPage(page){
  if(!qa.on || qa.syncPage === page) return;
  const st = qaPageStart(page), was = qa.playing || qa.loading;
  qa.syncPage = page; qa.abs = st.abs; qa.exact = st.exact;
  const r = qaSurahAyah(st.abs); qa.bism = r.a === 1 && qaHasBism(r.s);
  qaEls(); qa.cur.pause();
  if(was) qaPlayCurrent(); else { qa.playing = false; qa.loading = false; qa.err = false; qaUI(); }
}
function qaMediaMeta(){
  try{
    if(!('mediaSession' in navigator)) return;
    const r = qaSurahAyah(qa.abs), nm = (QURAN_SURAHS[r.s-1] || {}).name || '';
    navigator.mediaSession.metadata = new MediaMetadata({ title: qa.bism ? `${nm} · Bismillah` : `${nm} · Ayah ${r.a}`, artist:'Mishary Alafasy', album:"Qur'an · Waqt24", artwork:[{ src:'icons/icon-192.png', sizes:'192x192', type:'image/png' }] });
    const ms = navigator.mediaSession;
    ms.setActionHandler('play', ()=>qaToggle()); ms.setActionHandler('pause', ()=>qaToggle());
    ms.setActionHandler('previoustrack', ()=>qaStep(-1)); ms.setActionHandler('nexttrack', ()=>qaStep(1));
    ms.playbackState = qa.playing ? 'playing' : 'paused';
  }catch(e){}
}

/* ---- Mini player bar ---- */
const QA_ICON = {
  play:'<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/></svg>',
  pause:'<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4.2" height="14" rx="1.2"/><rect x="13.8" y="5" width="4.2" height="14" rx="1.2"/></svg>',
  prev:'<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M6 6h2v12H6zM20 6.5v11a.8.8 0 0 1-1.25.66L10.5 12.7a.8.8 0 0 1 0-1.32l8.25-5.54A.8.8 0 0 1 20 6.5z"/></svg>',
  next:'<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M16 6h2v12h-2zM4 6.5v11a.8.8 0 0 0 1.25.66l8.25-5.46a.8.8 0 0 0 0-1.32L5.25 5.84A.8.8 0 0 0 4 6.5z"/></svg>',
  close:'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>'
};
function qaBar(){
  let el = document.getElementById('qPlayer');
  if(el) return el;
  el = document.createElement('div'); el.id = 'qPlayer'; el.className = 'qp'; el.setAttribute('role','region'); el.setAttribute('aria-label', 'Qur\'an recitation');
  el.innerHTML = `<div class="qp-info"><b id="qpTitle"></b><span id="qpSub"></span></div>
    <button type="button" id="qpPrev" aria-label="Previous ayah">${QA_ICON.prev}</button>
    <button type="button" id="qpPlay" class="qp-main" aria-label="Play or pause"></button>
    <button type="button" id="qpNext" aria-label="Next ayah">${QA_ICON.next}</button>
    <button type="button" id="qpClose" aria-label="Close player">${QA_ICON.close}</button>`;
  (document.getElementById('detailOverlay').parentElement || document.body).appendChild(el);
  el.querySelector('#qpPrev').onclick = ()=>qaStep(-1);
  el.querySelector('#qpNext').onclick = ()=>qaStep(1);
  el.querySelector('#qpPlay').onclick = qaToggle;
  el.querySelector('#qpClose').onclick = qaStop;
  return el;
}
function qaPlace(){
  const el = document.getElementById('qPlayer'); if(!el) return;
  const ov = document.getElementById('detailOverlay'), tb = document.getElementById('tabbar');
  const overlayOn = ov && ov.classList.contains('active');
  el.style.bottom = overlayOn ? '0px' : ((tb ? tb.offsetHeight : 0) + 'px');
}
function qaUI(){
  document.body.classList.toggle('qp-on', qa.on);
  if(!qa.on){ const e = document.getElementById('qPlayer'); if(e) e.classList.remove('show'); return; }
  const el = qaBar(), r = qaSurahAyah(qa.abs), nm = (QURAN_SURAHS[r.s-1] || {}).name || '';
  el.querySelector('#qpTitle').textContent = qa.bism ? `${nm} · Bismillah` : `${nm} · ${L({rur:'Ayat', en:'Ayah'})} ${qa.exact ? '' : '≈ '}${r.a}`;
  el.querySelector('#qpSub').textContent = qa.err ? L({rur:'Internet chahiye · dobara dabayein', en:'Needs internet · tap play to retry'})
    : qa.loading ? L({rur:'Load ho raha hai…', en:'Loading…'})
    : (qa.exact ? 'Mishary Alafasy' : L({rur:'Mishary Alafasy · shuruaat andaaze se, ⏮ ⏭ se theek karein', en:'Mishary Alafasy · start is approximate, adjust with ⏮ ⏭'}));
  el.querySelector('#qpPlay').innerHTML = qa.playing ? QA_ICON.pause : QA_ICON.play;
  el.classList.toggle('show', true);
  qaPlace();
  qaMediaMeta();
}
(function(){
  const ov = document.getElementById('detailOverlay');
  if(ov) new MutationObserver(qaPlace).observe(ov, { attributes:true, attributeFilter:['class'] });
  window.addEventListener('resize', qaPlace);
})();
