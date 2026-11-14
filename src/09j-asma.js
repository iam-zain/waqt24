/* ============================================================
   ASMA-UL-HUSNA AUDIO: the full recitation (asma/full.m4a) and one short clip per name (asma/01.m4a ...).
   As-Sabur (no. 99) comes from a separate recording and is appended to the end of the full track.
   ============================================================ */
const ASMA_CLIPS = 99;
/* second at which each name starts in asma/full.m4a (used to highlight the name being recited) */
const ASMA_T = [0.66, 1.67, 2.47, 3.25, 4.55, 5.57, 6.36, 7.42, 8.27, 9.28, 10.36, 11.41, 12.17, 13.26, 14.22, 15.17, 16.22, 16.94, 18.28, 19.12, 20.14, 21.01, 22.0, 22.86, 23.87, 24.85, 25.77, 26.53, 27.66, 28.46, 29.42, 30.39, 31.34, 32.16, 33.27, 34.27, 35.05, 35.79, 36.93, 37.88, 38.85, 39.96, 40.48, 41.58, 42.27, 43.4, 44.25, 45.29, 46.15, 47.19, 48.14, 48.84, 49.85, 50.58, 51.42, 52.53, 53.35, 54.36, 55.26, 56.17, 57.02, 57.96, 58.72, 59.59, 60.54, 61.47, 62.44, 63.26, 63.9, 65.01, 65.85, 66.98, 67.92, 68.67, 69.57, 70.48, 71.37, 72.23, 73.26, 74.06, 75.07, 76.05, 76.99, 77.77, 79.15, 80.71, 81.72, 82.43, 83.49, 84.34, 85.19, 85.91, 86.85, 87.66, 88.53, 89.34, 90.23, 91.18, 92.3];
/* Asma-ul-Nabi: asma-nabi/r3/full.m4a (intro trimmed) plus one clip per name; second at which each name starts in the full track */
const NABI_T = [0.0, 1.83, 2.63, 4.41, 6.06, 7.3, 8.17, 9.71, 12.39, 13.95, 16.13, 17.32, 18.77, 22.07, 23.44, 24.61, 25.55, 26.13, 26.63, 27.9, 30.48, 32.89, 35.45, 36.41, 38.26, 39.16, 41.02, 43.68, 47.53, 48.75, 52.95, 53.45, 54.71, 56.24, 57.73, 59.0, 61.49, 62.64, 65.14, 66.72, 67.63, 68.68, 70.7, 72.63, 73.33, 74.89, 75.68, 77.08, 79.5, 80.87, 82.94, 84.41, 86.49, 88.78, 89.69, 91.86, 92.93, 95.88, 97.6, 99.11, 101.14, 102.62, 107.02, 111.09, 112.9, 114.3, 116.19, 118.34, 121.66, 122.82, 124.69, 125.19, 127.09, 128.16, 130.77, 132.23, 133.64, 134.37, 135.11, 138.2, 139.64, 140.76, 143.33, 144.56, 146.23, 149.68, 150.7, 152.69, 154.88, 155.38, 156.15, 157.31, 161.0, 162.38, 163.2, 164.82, 166.77, 168.94, 171.25];
const ASMA_SETS = {
  asma:   { data:()=>ASMA_UL_HUSNA, T:ASMA_T,  dir:'asma/r2/',       dur:93.6,  durLbl:'1:34', title:'Asma-ul-Husna', ttl:{rur:'Asma-ul-Husna: poora audio', en:'Asma-ul-Husna: full audio'}, all:{rur:'Poori recitation, 99 naam', en:'Full recitation, 99 names'} },
  prophet:{ data:()=>PROPHET_NAMES, T:NABI_T, dir:'asma-nabi/r3/', dur:187.55, durLbl:'3:08', title:'Asma-ul-Nabi',  ttl:{rur:'Asma-ul-Nabi: poora audio', en:'Asma-ul-Nabi: full audio'},  all:{rur:'Poori recitation, 99 naam', en:'Full recitation, 99 names'} }
};
function asmaScreenWhich(){ const s = typeof curScreen !== 'undefined' ? curScreen : null; return s && s.args && s.args[0] === 'prophet' ? 'prophet' : 'asma'; }
function asmaW(){ return asmaSt.mode ? asmaSt.which : asmaScreenWhich(); }
function asmaSet(){ return ASMA_SETS[asmaW()]; }
const ASMA_GAP_MS = 1500;   // pause between the repeats of a name
let asmaGapT = 0;
const asmaSt = { mode:null, idx:-1, n:1, gap:false, which:'asma' };   // n: which repeat of a single name is playing   // mode: 'full' | 'one' | null
let asmaAu = null;
const ASMA_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2];
function asmaRate(){ return ASMA_RATES.indexOf(state.asmaRate) >= 0 ? state.asmaRate : 1; }
function asmaApplyRate(){ if(!asmaAu) return; asmaAu.defaultPlaybackRate = asmaRate(); asmaAu.playbackRate = asmaRate(); try{ asmaAu.preservesPitch = true; }catch(e){} }
function asmaRep(){ return state.asmaRep === 3 ? 3 : 0; }
function asmaToggleRep(){ state.asmaRep = asmaRep() ? 0 : 3; saveState(); asmaUI(); }
function asmaCycleRate(){ state.asmaRate = ASMA_RATES[(ASMA_RATES.indexOf(asmaRate()) + 1) % ASMA_RATES.length]; saveState(); asmaApplyRate(); asmaUI(); }
function asmaEl(){
  if(asmaAu) return asmaAu;
  asmaAu = new Audio(); asmaAu.preload = 'auto';
  asmaAu.addEventListener('ended', ()=>{
    if(asmaSt.mode === 'one' && asmaRep() && asmaSt.n < asmaRep()){
      asmaSt.n++; asmaSt.gap = true; asmaUI();
      clearTimeout(asmaGapT); asmaGapT = setTimeout(()=>{ asmaSt.gap = false; if(asmaSt.mode !== 'one' || !asmaAu) return; asmaAu.currentTime = 0; const p = asmaAu.play(); if(p && p.catch) p.catch(()=>{}); asmaUI(); }, ASMA_GAP_MS);
      return;
    }
    asmaSt.mode = null; asmaSt.idx = -1; asmaSt.n = 1; asmaUI();
  });
  asmaAu.addEventListener('pause', ()=>{ if(asmaSt.mode && !asmaAu.ended) asmaUI(); });
  asmaAu.addEventListener('play', asmaUI);
  asmaAu.addEventListener('timeupdate', asmaTick);
  asmaAu.addEventListener('error', ()=>{ if(!asmaSt.mode) return; asmaSt.mode = null; asmaSt.idx = -1; asmaUI(); showToast(L({rur:'Audio nahin chal saka. Internet check karke dobara koshish karein', en:'Could not play the audio. Check your connection and try again'})); });
  return asmaAu;
}
function asmaName(i){ const d = asmaSet().data(); return d[i] ? d[i].tr : ''; }
/* Opening a name card: the full recitation is paused where it is (the bar resumes from there); a single name just stops */
function asmaOpenName(){
  if(asmaSt.mode === 'full' && asmaAu){ if(!asmaAu.paused) asmaAu.pause(); asmaUI(); }
  else asmaStop();
}
function asmaStop(){
  clearTimeout(asmaGapT); asmaSt.gap = false;
  if(asmaAu){ asmaAu.pause(); asmaAu.removeAttribute('src'); try{ asmaAu.load(); }catch(e){} }
  asmaSt.mode = null; asmaSt.idx = -1; asmaUI();
}
function asmaBegin(src, mode, which){
  if(which) asmaSt.which = which;
  if(typeof qa !== 'undefined' && qa.on && typeof qaStop === 'function') qaStop();
  if(typeof stopAzaan === 'function') stopAzaan();
  clearTimeout(asmaGapT); asmaSt.gap = false;
  const a = asmaEl(); a.pause(); a.src = src; asmaApplyRate(); asmaSt.mode = mode; asmaSt.idx = -1; asmaSt.n = 1;
  const p = a.play(); if(p && p.catch) p.catch(()=>{ asmaSt.mode = null; asmaUI(); showToast(L({rur:'Audio chalane ke liye ek baar aur tap karein', en:'Tap once more to play the audio'})); });
  try{ if(navigator.mediaSession){ navigator.mediaSession.metadata = new MediaMetadata({ title:asmaSet().title, artist:'Waqt24' }); } }catch(e){}
  asmaUI();
}
function asmaPlayOne(i, which){
  which = which || asmaScreenWhich();
  if(i < 0 || i >= ASMA_CLIPS) return;
  if(asmaSt.mode === 'one' && asmaSt.which === which && asmaSt.idx === i && asmaAu && !asmaAu.paused){ asmaStop(); return; }
  asmaBegin(ASMA_SETS[which].dir + String(i + 1).padStart(2, '0') + '.m4a', 'one', which); asmaSt.idx = i; asmaUI();
}
function asmaToggleFull(){
  const w = asmaScreenWhich();
  if(asmaSt.mode === 'full' && asmaSt.which === w && asmaAu){
    if(asmaAu.paused){ const p = asmaAu.play(); if(p && p.catch) p.catch(()=>{}); } else asmaAu.pause();
    asmaUI(); return;
  }
  asmaBegin(ASMA_SETS[w].dir + 'full.m4a', 'full', w);
}
function asmaFullIdx(t){ const T = asmaSet().T; let k = -1; for(let i = 0; i < T.length; i++){ if(T[i] <= t + 0.05) k = i; else break; } return k; }
let asmaLastNow = -2;
function asmaTick(){
  if(asmaSt.mode !== 'full' || !asmaAu) return;
  const t = asmaAu.currentTime, r = document.getElementById('asmaRange'), c = document.getElementById('asmaCur');
  if(r && !r.dataset.drag){ r.max = isFinite(asmaAu.duration) ? asmaAu.duration : asmaSet().dur; r.value = t; }
  if(c) c.textContent = fmtSecs(Math.floor(t));
  const k = asmaFullIdx(t);
  if(k !== asmaLastNow){ asmaLastNow = k; asmaUI(true); }
}
function asmaUI(scroll){
  const full = asmaSt.mode === 'full' && asmaSt.which === asmaScreenWhich(), playing = !!(asmaSt.mode && asmaAu && (!asmaAu.paused || asmaSt.gap));
  const fb = document.getElementById('asmaFullBtn');
  if(fb){ fb.textContent = full && playing ? '❚❚' : '▶'; fb.classList.toggle('on', full && playing); }
  const now = full ? asmaFullIdx(asmaAu ? asmaAu.currentTime : 0) : (asmaSt.mode === 'one' && asmaSt.which === asmaScreenWhich() ? asmaSt.idx : -1);
  document.querySelectorAll('.asma-rate').forEach(rb=>{ rb.textContent = '⚡ ' + asmaRate() + '×'; rb.classList.toggle('on', asmaRate() !== 1); });
  document.querySelectorAll('.asma-rep').forEach(rb=>{ const r = asmaRep(); rb.textContent = '🔁 ' + (r ? (asmaSt.mode === 'one' && playing ? L({rur:'Baar ', en:'Time '}) + asmaSt.n + '/' + r : L({rur:r + ' baar', en:r + ' times'})) : L({rur:'Dohrana band', en:'Repeat off'})); rb.classList.toggle('on', !!r); });
  if(full && asmaAu){ const r = document.getElementById('asmaRange'), c = document.getElementById('asmaCur'); if(r && !r.dataset.drag){ r.max = isFinite(asmaAu.duration) ? asmaAu.duration : asmaSet().dur; r.value = asmaAu.currentTime; } if(c) c.textContent = fmtSecs(Math.floor(asmaAu.currentTime)); }
  const lbl = document.getElementById('asmaNowLbl');
  if(lbl) lbl.textContent = full && now >= 0 ? (now + 1) + '. ' + asmaName(now) : L(asmaSet().all);
  document.querySelectorAll('.asma-pl').forEach(b=>{ const i = +b.dataset.i, on = asmaSt.mode === 'one' && asmaSt.which === asmaW() && asmaSt.idx === i && playing; b.classList.toggle('on', on); b.textContent = on ? '■' : '▶'; });
  document.querySelectorAll('.asma-listen').forEach(b=>{ const i = +b.dataset.i, on = asmaSt.mode === 'one' && asmaSt.which === asmaW() && asmaSt.idx === i && playing; b.classList.toggle('on', on); b.querySelector('.asma-lt').textContent = on ? L({rur:'Rokein', en:'Stop'}) : L({rur:'Yeh naam sunein', en:'Listen to this name'}); b.querySelector('.asma-li').textContent = on ? '■' : '▶'; });
  document.querySelectorAll('#namesGrid .aad-card').forEach(c=>{ const cur = full && +c.dataset.idx === now; if(c.classList.contains('asma-now') !== cur) c.classList.toggle('asma-now', cur); if(cur && scroll === true){ try{ c.scrollIntoView({ block:'center', behavior:'smooth' }); }catch(e){} } });
  if(!full){ const r = document.getElementById('asmaRange'); if(r && !r.dataset.drag) r.value = 0; const c = document.getElementById('asmaCur'); if(c) c.textContent = '0:00'; asmaLastNow = -2; }
}
function asmaFullBarHtml(){
  return `<div class="asma-full" id="asmaFull">
    <button class="asma-fbtn" id="asmaFullBtn" aria-label="${L({rur:'Poori recitation chalayein', en:'Play the full recitation'})}">▶</button>
    <div class="asma-fmid"><div class="asma-ftop"><div class="asma-ftitle">${L(asmaSet().ttl)}</div><button class="asma-rate" id="asmaRateBtn" data-act="rate" aria-label="${L({rur:'Raftaar', en:'Speed'})}">⚡ 1×</button></div><div class="asma-fnow" id="asmaNowLbl"></div>
      <div class="asma-fseek"><span id="asmaCur">0:00</span><input type="range" id="asmaRange" min="0" max="${asmaSet().dur}" step="0.1" value="0" aria-label="${L({rur:'Audio ki timeline', en:'Audio timeline'})}"><span>${asmaSet().durLbl}</span></div></div>
  </div>`;
}
function asmaWireOpts(){ document.querySelectorAll('.asma-rate').forEach(b=>{ b.onclick = asmaCycleRate; }); document.querySelectorAll('.asma-rep').forEach(b=>{ b.onclick = asmaToggleRep; }); }
function asmaOptsHtml(){ return `<div class="asma-opts"><button type="button" class="asma-rate">⚡ 1×</button><button type="button" class="asma-rep">🔁</button></div>`; }
function asmaWireFull(){
  const fb = document.getElementById('asmaFullBtn'); if(!fb) return;
  fb.onclick = asmaToggleFull; asmaWireOpts();
  const r = document.getElementById('asmaRange');
  r.oninput = ()=>{ r.dataset.drag = '1'; const c = document.getElementById('asmaCur'); if(c) c.textContent = fmtSecs(Math.floor(+r.value)); };
  r.onchange = ()=>{ delete r.dataset.drag; if(asmaSt.mode !== 'full' || asmaSt.which !== asmaScreenWhich()) asmaBegin(asmaSet().dir + 'full.m4a', 'full', asmaScreenWhich()); const a = asmaEl(); const go = ()=>{ try{ a.currentTime = +r.value; }catch(e){} }; if(a.readyState >= 1) go(); else a.addEventListener('loadedmetadata', go, { once:true }); asmaUI(true); };
  asmaUI();
}
/* Leaving the Asma-ul-Husna screens (back, home, another section) stops the audio */
function asmaScreenOpen(){
  const ov = document.getElementById('detailOverlay'); if(!ov || !ov.classList.contains('active') || ov.classList.contains('closing')) return false;
  const s = typeof curScreen !== 'undefined' ? curScreen : null;
  return !!(s && (s.fn === 'renderNamesList' || s.fn === 'renderNameDetail') && s.args && (s.args[0] === 'asma' || s.args[0] === 'prophet'));
}
function asmaGuard(){ if(asmaSt.mode && (!asmaScreenOpen() || asmaSt.which !== asmaScreenWhich())) asmaStop(); }
(function(){ const ov = document.getElementById('detailOverlay'); if(ov) new MutationObserver(asmaGuard).observe(ov, { attributes:true, attributeFilter:['class'] }); })();
