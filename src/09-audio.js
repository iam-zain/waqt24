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
let QA_ANCHORS = null;
function qaLastPage(){ return QURAN_SURAHS[113].page; }
function qaPageStart(page){
  /* If an exact table (first ayah of every page, 1-based page index) is ever added as QA_PAGE_FIRST, it wins. */
  if(typeof QA_PAGE_FIRST !== 'undefined' && QA_PAGE_FIRST[page-1]) return { abs: QA_PAGE_FIRST[page-1], exact:true };
  if(page > qaLastPage()) return { abs: QA_TOTAL, exact:true };
  const para = QURAN_PARAS.find(p=>p.page===page);
  if(para) return { abs: QA_JUZ[para.n-1], exact:true };
  const sur = QURAN_SURAHS.find(x=>x.page===page);
  if(sur) return { abs: qaAbs(sur.n, 1), exact:true };
  if(!QA_ANCHORS) QA_ANCHORS = QURAN_SURAHS.map(x=>({ page:x.page, abs:qaAbs(x.n,1) })).concat(QURAN_PARAS.map(p=>({ page:p.page, abs:QA_JUZ[p.n-1] })))
    .sort((x,y)=> x.page - y.page || x.abs - y.abs);
  let a = QA_ANCHORS[0], b = { page: qaLastPage() + 1, abs: QA_TOTAL + 1 };
  for(const x of QA_ANCHORS){ if(x.page <= page) a = x; else { b = x; break; } }
  const abs = a.abs + Math.round((page - a.page) * (b.abs - a.abs) / Math.max(1, b.page - a.page));
  return { abs: Math.max(1, Math.min(QA_TOTAL, abs)), exact:false };
}
/* While the recitation plays and the reader is showing the page it started from, turn the page when the audio reaches the next one. */
/* ---- Line highlight: the line(s) being recited are tinted on the page image. Light: one absolutely positioned <div>, moved on every ayah. ---- */
const QA_GEO = { normal:{ t:.090, b:.911, wb:1.17, wm:.97 }, tajweed:{ t:.089, b:.911, wb:1.08, wm:.8 } };  /* averages + row-height weights (surah banner, Bismillah) */
/* 8-line pages (Al-Fatihah and the start of Al-Baqarah): line 2 centre and line step, as a fraction of the image height */
const QA_GEO_SHORT = { 2:{ normal:[.530,.0455], tajweed:[.463,.0677] }, 3:{ normal:[.543,.0443], tajweed:[.478,.0667] } };
function qaAyahPage(abs){ let lo = 0, hi = QA_PAGE_FIRST.length - 1; while(lo < hi){ const m = (lo + hi + 1) >> 1; if(QA_PAGE_FIRST[m] <= abs) lo = m; else hi = m - 1; } return lo + 1; }
function qaLineSpan(abs, bism){
  const i = (abs - 1) * 2; let a = parseInt(QA_LINES[i], 16), b = parseInt(QA_LINES[i+1], 16);
  if(bism){ a = b = a - 1; if(a < 1) return null; }
  return [a, b];
}
function qaHL(){
  const wrap = document.getElementById('quranWrap');
  let hl = wrap && wrap.querySelector('.qhl');
  const page = wrap && state.quranPage;
  if(!wrap || !qa.on || typeof QA_LINES === 'undefined' || !page || page >= QURAN_SURAHS[113].page || qaAyahPage(qa.abs) !== page){ if(hl) hl.remove(); return; }
  const img = wrap.querySelector('.quran-page-img'), span = qaLineSpan(qa.abs, qa.bism);
  if(!img || !span){ if(hl) hl.remove(); return; }
  if(!img.naturalWidth){ if(!img._hlw){ img._hlw = 1; img.addEventListener('load', ()=>qaHL(), { once:true }); } return; }
  const ed = quranEd(), g = QA_GEO[ed], sh = QA_GEO_SHORT[page];
  let y0, y1;
  if(sh){ const [c, st] = sh[ed], h = st * .46; y0 = c + st * (span[0] - 2) - h; y1 = c + st * (span[1] - 2) + h; }
  else {
    /* row boundaries: this page's measured top/bottom, rows weighted by kind (banner rows are taller, Bismillah rows a little shorter) */
    const w = new Array(16).fill(1), f = QA_PAGE_FIRST[page-1], nx = QA_PAGE_FIRST[page] || (QA_TOTAL + 1);
    for(let x = f; x < nx; x++){
      const r = qaSurahAyah(x); if(r.a !== 1 || r.s === 1) continue;
      const ln = parseInt(QA_LINES[(x-1)*2], 16), hb = qaHasBism(r.s);
      if(hb) w[ln-1] = g.wm;
      w[ln - (hb ? 2 : 1)] = g.wb;
    }
    let tot = 0, c0 = 0, c1 = 0; for(let i = 1; i <= 15; i++){ tot += w[i]; if(i < span[0]) c0 += w[i]; if(i <= span[1]) c1 += w[i]; }
    const gm = QA_GEOM[ed], t = (gm.t[page-2] || g.t * 1000) / 1000, b = (gm.b[page-2] || g.b * 1000) / 1000;
    y0 = t + (b - t) * c0 / tot; y1 = t + (b - t) * c1 / tot;
    const pad = (y1 - y0) * .04; y0 += pad; y1 -= pad;
  }
  /* the image is letterboxed inside its box (object-fit: contain): find where it really is */
  const bw = img.clientWidth, bh = img.clientHeight, k = Math.min(bw / img.naturalWidth, bh / img.naturalHeight);
  const iw = img.naturalWidth * k, ih = img.naturalHeight * k, ox = img.offsetLeft + (bw - iw) / 2, oy = img.offsetTop + (bh - ih) / 2;
  if(!hl){ hl = document.createElement('div'); hl.className = 'qhl'; wrap.appendChild(hl); }
  hl.style.cssText = `left:${(ox + iw * .085).toFixed(1)}px;width:${(iw * .83).toFixed(1)}px;top:${(oy + ih * y0).toFixed(1)}px;height:${(ih * (y1 - y0)).toFixed(1)}px`;
}
window.addEventListener('resize', ()=>{ if(qa.on) qaHL(); });
function qaFollowPage(){
  if(!qa.on || !qa.syncPage || !document.getElementById('quranWrap') || !document.getElementById('detailOverlay').classList.contains('active')) return;
  const viewing = (typeof state !== 'undefined') ? state.quranPage : 0;
  if(viewing !== qa.syncPage) return;
  /* exact table: the page this ayah is on (works forwards and backwards) */
  const np = Math.min(qaLastPage(), qaAyahPage(qa.abs));
  if(np === qa.syncPage) return;
  qa.syncPage = np;           /* set first, so the reader's own page-change hook does not restart the audio */
  renderQuranReader(np);
}

/* Player state. `bism` = currently on the Bismillah that opens a Surah (Al-Fatihah has it as ayah 1; At-Tawbah has none). */
const qa = { dur:{}, headDone:{}, syncPage:0, forceSync:false, on:false, abs:1, bism:false, exact:true, playing:false, A:null, B:null, cur:null, err:false, loading:false };
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
const qaKey = (abs, bism)=> bism ? 'b' : abs;
/* Surah timing. Exact lengths of every ayah are learned lazily (tiny HEAD requests: at 128 kbps, bytes / 16000 = seconds);
   until then the missing ones are estimated from the average of the known ones. */
function qaHeadDurations(){
  const r = qaSurahAyah(qa.abs); if(qa.headDone[r.s] || typeof fetch !== 'function') return;
  qa.headDone[r.s] = 1;
  const todo = []; for(let a = 1; a <= QA_COUNTS[r.s-1]; a++){ const k = QA_CUM[r.s-1] + a; if(!qa.dur[k]) todo.push(k); }
  let i = 0, dead = false;
  const worker = async ()=>{
    while(!dead && i < todo.length){
      const k = todo[i++], q = qaSurahAyah(k);
      try{
        const res = await fetch(QA_BASE + qaPad(q.s) + qaPad(q.a) + '.mp3', { method:'HEAD' });
        const n = +res.headers.get('content-length');
        if(!res.ok || !n){ dead = true; return; }
        if(!qa.dur[k]) qa.dur[k] = n / 16000;
      }catch(e){ dead = true; return; }
    }
    if(!dead) qaProg();
  };
  worker(); worker();
}
function qaTimes(){
  const r = qaSurahAyah(qa.abs), n = QA_COUNTS[r.s-1], base = QA_CUM[r.s-1];
  const known = []; for(let a = 1; a <= n; a++) if(qa.dur[base+a]) known.push(qa.dur[base+a]);
  const avg = known.length ? known.reduce((x,y)=>x+y,0) / known.length : 8;
  const d = a => qa.dur[base+a] || avg;
  const hasB = qaHasBism(r.s), bd = qa.dur.b || 5;
  let total = hasB ? bd : 0, done = 0;
  for(let a = 1; a <= n; a++) total += d(a);
  if(hasB && !qa.bism) done += bd;
  for(let a = 1; a < r.a && !qa.bism; a++) done += d(a);
  if(qa.bism && qa.abs !== base+1) done = 0;
  const t = (qa.cur && qa.cur.currentTime) || 0;
  done += qa.bism ? t : t;
  done = Math.min(done, total);
  return { total, done, approx: known.length < n || (hasB && !qa.dur.b) };
}
/* Which ayah (and how far into it) is at fraction f of the whole surah? */
function qaLocate(f){
  const r = qaSurahAyah(qa.abs), n = QA_COUNTS[r.s-1], base = QA_CUM[r.s-1], T = qaTimes();
  const known = []; for(let a = 1; a <= n; a++) if(qa.dur[base+a]) known.push(qa.dur[base+a]);
  const avg = known.length ? known.reduce((x,y)=>x+y,0) / known.length : 8;
  let t = Math.max(0, Math.min(.9999, f)) * T.total;
  if(qaHasBism(r.s)){ const bd = qa.dur.b || 5; if(t < bd) return { abs: base + 1, bism:true, off:t }; t -= bd; }
  for(let a = 1; a <= n; a++){ const d = qa.dur[base+a] || avg; if(t < d || a === n) return { abs: base + a, bism:false, off: Math.min(t, d) }; t -= d; }
}
function qaSeek(f){
  const loc = qaLocate(f); if(!loc) return;
  qaEls();
  const same = loc.abs === qa.abs && loc.bism === qa.bism && qa.cur.src === qaFile(loc.abs, loc.bism);
  qa.abs = loc.abs; qa.bism = loc.bism; qa.exact = true; qaFollowPage();
  const apply = ()=>{ try{ qa.cur.currentTime = loc.off; }catch(e){} qaProg(); };
  if(same){ apply(); if(qa.cur.paused){ const p = qa.cur.play(); if(p && p.catch) p.catch(()=>qaFail()); } return; }
  qa.cur.pause(); qaPlayCurrent();
  if(loc.off > .3){ const el = qa.cur; if(el.readyState >= 1) apply(); else el.addEventListener('loadedmetadata', apply, { once:true }); }
}
const qaFmt = x=>{ x = Math.max(0, Math.round(x)); return Math.floor(x/60) + ':' + String(x%60).padStart(2,'0'); };
function qaProg(){
  if(!qa.on) return;
  const e = document.getElementById('qPlayer'); if(!e) return;
  const T = qaTimes(), ap = T.approx ? '~' : '';
  if(e.querySelector('.qp-bar').matches(':active')) return;
  e.querySelector('#qpFill').style.width = (T.total ? T.done / T.total * 100 : 0).toFixed(2) + '%';
  e.querySelector('#qpT1').textContent = qaFmt(T.done);
  e.querySelector('#qpT2').textContent = '-' + ap + qaFmt(T.total - T.done);
  e.querySelector('#qpT3').textContent = L({rur:'Poori surah', en:'Full surah'}) + ' ' + ap + qaFmt(T.total);
}
function qaEls(){
  if(!qa.A){
    qa.A = new Audio(); qa.B = new Audio();
    [qa.A, qa.B].forEach(el=>{
      el.preload = 'none';
      el.addEventListener('loadedmetadata', ()=>{ if(el._k && isFinite(el.duration) && el.duration > 0){ qa.dur[el._k] = el.duration; if(el === qa.cur) qaProg(); } });
      el.addEventListener('timeupdate', ()=>{ if(el === qa.cur) qaProg(); });
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
  if(other.src !== url){ other._k = qaKey(n.abs, n.bism); other.src = url; other.preload = 'auto'; try{ other.load(); }catch(e){} }
}
function qaPlayCurrent(){
  qaEls();
  const url = qaFile(qa.abs, qa.bism);
  if(qa.cur.src !== url){ qa.cur._k = qaKey(qa.abs, qa.bism); qa.cur.src = url; }
  qaHeadDurations();
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
  qa.abs = n.abs; qa.bism = n.bism; qaFollowPage();
  const other = qa.cur === qa.A ? qa.B : qa.A, url = qaFile(qa.abs, qa.bism);
  if(other.src === url){ qa.cur = other; qa.cur.currentTime = 0; qa.err = false; qaUI(); qaMediaMeta(); const p = qa.cur.play(); if(p && p.catch) p.catch(()=>qaFail()); qaPreloadNext(); }
  else qaPlayCurrent();
}
function qaStep(dir){
  const n = dir > 0 ? qaNextStep(qa.abs, qa.bism) : qaPrevStep(qa.abs, qa.bism);
  if(!n) return;
  qa.abs = n.abs; qa.bism = n.bism; qa.exact = true; qaFollowPage();
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
  el.innerHTML = `<div class="qp-row"><div class="qp-info"><b id="qpTitle"></b><span id="qpSub"></span></div>
    <button type="button" id="qpPrev" aria-label="Previous ayah">${QA_ICON.prev}</button>
    <button type="button" id="qpPlay" class="qp-main" aria-label="Play or pause"></button>
    <button type="button" id="qpNext" aria-label="Next ayah">${QA_ICON.next}</button>
    <button type="button" id="qpClose" aria-label="Close player">${QA_ICON.close}</button></div>
    <div class="qp-time"><span id="qpT1">0:00</span><div class="qp-bar" role="progressbar" aria-label="Surah progress"><i id="qpFill"></i></div><span id="qpT2">-0:00</span></div>
    <div class="qp-tot" id="qpT3"></div>`;
  (document.getElementById('detailOverlay').parentElement || document.body).appendChild(el);
  el.querySelector('#qpPrev').onclick = ()=>qaStep(-1);
  el.querySelector('#qpNext').onclick = ()=>qaStep(1);
  el.querySelector('#qpPlay').onclick = qaToggle;
  el.querySelector('#qpClose').onclick = qaStop;
  /* tap or drag on the bar to jump: the recitation continues from that point */
  const bar = el.querySelector('.qp-bar'); let drag = false;
  const frac = ev=>{ const r = bar.getBoundingClientRect(); return Math.max(0, Math.min(1, (ev.clientX - r.left) / r.width)); };
  bar.addEventListener('pointerdown', ev=>{ drag = true; try{ bar.setPointerCapture(ev.pointerId); }catch(e){} el.querySelector('#qpFill').style.width = (frac(ev)*100) + '%'; });
  bar.addEventListener('pointermove', ev=>{ if(drag) el.querySelector('#qpFill').style.width = (frac(ev)*100) + '%'; });
  bar.addEventListener('pointerup', ev=>{ if(!drag) return; drag = false; qaSeek(frac(ev)); });
  bar.addEventListener('pointercancel', ()=>{ drag = false; qaProg(); });
  bar.tabIndex = 0;
  bar.addEventListener('keydown', ev=>{ if(ev.key === 'ArrowRight') qaStep(1); else if(ev.key === 'ArrowLeft') qaStep(-1); });
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
  const lb = document.getElementById('quranListenBtn'); if(lb) lb.classList.toggle('on', qa.on);
  if(!qa.on){ const e = document.getElementById('qPlayer'); if(e) e.classList.remove('show'); qaHL(); return; }
  const el = qaBar(), r = qaSurahAyah(qa.abs), nm = (QURAN_SURAHS[r.s-1] || {}).name || '';
  el.querySelector('#qpTitle').textContent = qa.bism ? `${nm} · Bismillah` : `${nm} · ${L({rur:'Ayat', en:'Ayah'})} ${qa.exact ? '' : '≈ '}${r.s}:${r.a}`;
  const cnt = `${L({rur:'Ayat', en:'Ayah'})} ${r.a} / ${QA_COUNTS[r.s-1]}`;
  el.querySelector('#qpSub').textContent = qa.err ? L({rur:'Internet chahiye · dobara dabayein', en:'Needs internet · tap play to retry'})
    : qa.loading ? L({rur:'Load ho raha hai…', en:'Loading…'})
    : (qa.exact ? cnt + ' · Mishary Alafasy' : L({rur:'Mishary Alafasy · shuruaat andaaze se, ⏮ ⏭ se theek karein', en:'Mishary Alafasy · start is approximate, adjust with ⏮ ⏭'}));
  el.querySelector('#qpPlay').innerHTML = qa.playing ? QA_ICON.pause : QA_ICON.play;
  el.classList.toggle('show', true);
  qaPlace(); qaProg(); qaHL();
  qaMediaMeta();
}
(function(){
  const ov = document.getElementById('detailOverlay');
  if(ov) new MutationObserver(qaPlace).observe(ov, { attributes:true, attributeFilter:['class'] });
  window.addEventListener('resize', qaPlace);
})();
