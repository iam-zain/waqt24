/* ============================================================
   ASMA-UL-HUSNA AUDIO: the full recitation (asma/full.m4a) and one short clip per name (asma/01.m4a ...).
   As-Sabur (no. 99) comes from a separate recording and is appended to the end of the full track.
   ============================================================ */
const ASMA_CLIPS = 99;
/* second at which each name starts in asma/full.m4a (used to highlight the name being recited) */
const ASMA_T = [0.68, 1.52, 2.49, 3.31, 4.56, 5.6, 6.39, 7.46, 8.31, 9.37, 10.39, 11.45, 12.26, 13.31, 14.26, 15.21, 16.27, 17.23, 18.33, 19.17, 20.19, 21.07, 22.07, 22.93, 23.93, 24.9, 25.85, 26.87, 27.74, 28.53, 29.66, 30.46, 31.42, 32.39, 33.35, 34.37, 35.15, 36.09, 37.03, 38.0, 38.96, 39.83, 40.74, 41.68, 42.58, 43.5, 44.47, 45.39, 46.35, 47.31, 48.26, 49.04, 49.96, 50.83, 51.8, 52.67, 53.59, 54.49, 55.4, 56.31, 57.16, 58.1, 58.85, 59.86, 60.78, 61.67, 62.6, 63.41, 64.22, 65.17, 66.17, 67.13, 68.08, 68.91, 69.74, 70.65, 71.54, 72.4, 73.48, 74.23, 75.25, 76.24, 77.18, 78.15, 79.33, 80.9, 81.92, 82.82, 83.69, 84.53, 85.39, 86.19, 87.07, 87.87, 88.74, 89.55, 90.41, 91.37, 92.5];
const asmaSt = { mode:null, idx:-1, n:1 };   // n: which repeat of a single name is playing   // mode: 'full' | 'one' | null
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
    if(asmaSt.mode === 'one' && asmaRep() && asmaSt.n < asmaRep()){ asmaSt.n++; asmaAu.currentTime = 0; const p = asmaAu.play(); if(p && p.catch) p.catch(()=>{}); asmaUI(); return; }
    asmaSt.mode = null; asmaSt.idx = -1; asmaSt.n = 1; asmaUI();
  });
  asmaAu.addEventListener('pause', ()=>{ if(asmaSt.mode && !asmaAu.ended) asmaUI(); });
  asmaAu.addEventListener('play', asmaUI);
  asmaAu.addEventListener('timeupdate', asmaTick);
  asmaAu.addEventListener('error', ()=>{ if(!asmaSt.mode) return; asmaSt.mode = null; asmaSt.idx = -1; asmaUI(); showToast(L({rur:'Audio nahin chal saka. Internet check karke dobara koshish karein', en:'Could not play the audio. Check your connection and try again'})); });
  return asmaAu;
}
function asmaName(i){ return ASMA_UL_HUSNA[i] ? ASMA_UL_HUSNA[i].tr : ''; }
function asmaStop(){
  if(asmaAu){ asmaAu.pause(); asmaAu.removeAttribute('src'); try{ asmaAu.load(); }catch(e){} }
  asmaSt.mode = null; asmaSt.idx = -1; asmaUI();
}
function asmaBegin(src, mode){
  if(typeof qa !== 'undefined' && qa.on && typeof qaStop === 'function') qaStop();
  if(typeof stopAzaan === 'function') stopAzaan();
  const a = asmaEl(); a.pause(); a.src = src; asmaApplyRate(); asmaSt.mode = mode; asmaSt.idx = -1; asmaSt.n = 1;
  const p = a.play(); if(p && p.catch) p.catch(()=>{ asmaSt.mode = null; asmaUI(); showToast(L({rur:'Audio chalane ke liye ek baar aur tap karein', en:'Tap once more to play the audio'})); });
  try{ if(navigator.mediaSession){ navigator.mediaSession.metadata = new MediaMetadata({ title:'Asma-ul-Husna', artist:'Waqt24' }); } }catch(e){}
  asmaUI();
}
function asmaPlayOne(i){
  if(i < 0 || i >= ASMA_CLIPS) return;
  if(asmaSt.mode === 'one' && asmaSt.idx === i && asmaAu && !asmaAu.paused){ asmaStop(); return; }
  asmaBegin('asma/' + String(i + 1).padStart(2, '0') + '.m4a', 'one'); asmaSt.idx = i; asmaUI();
}
function asmaToggleFull(){
  if(asmaSt.mode === 'full' && asmaAu){
    if(asmaAu.paused){ const p = asmaAu.play(); if(p && p.catch) p.catch(()=>{}); } else asmaAu.pause();
    asmaUI(); return;
  }
  asmaBegin('asma/full.m4a', 'full');
}
function asmaFullIdx(t){ let k = -1; for(let i = 0; i < ASMA_T.length; i++){ if(ASMA_T[i] <= t + 0.05) k = i; else break; } return k; }
let asmaLastNow = -2;
function asmaTick(){
  if(asmaSt.mode !== 'full' || !asmaAu) return;
  const t = asmaAu.currentTime, r = document.getElementById('asmaRange'), c = document.getElementById('asmaCur');
  if(r && !r.dataset.drag){ r.max = isFinite(asmaAu.duration) ? asmaAu.duration : 93.8; r.value = t; }
  if(c) c.textContent = fmtSecs(Math.floor(t));
  const k = asmaFullIdx(t);
  if(k !== asmaLastNow){ asmaLastNow = k; asmaUI(true); }
}
function asmaUI(scroll){
  const full = asmaSt.mode === 'full', playing = !!(asmaAu && !asmaAu.paused && asmaSt.mode);
  const fb = document.getElementById('asmaFullBtn');
  if(fb){ fb.textContent = full && playing ? '❚❚' : '▶'; fb.classList.toggle('on', full && playing); }
  const now = full ? asmaFullIdx(asmaAu ? asmaAu.currentTime : 0) : (asmaSt.mode === 'one' ? asmaSt.idx : -1);
  document.querySelectorAll('.asma-rate').forEach(rb=>{ rb.textContent = '⚡ ' + asmaRate() + '×'; rb.classList.toggle('on', asmaRate() !== 1); });
  document.querySelectorAll('.asma-rep').forEach(rb=>{ const r = asmaRep(); rb.textContent = '🔁 ' + (r ? (asmaSt.mode === 'one' && playing ? asmaSt.n + '/' + r : r + '×') : L({rur:'Dohrana band', en:'Repeat off'})); rb.classList.toggle('on', !!r); });
  const lbl = document.getElementById('asmaNowLbl');
  if(lbl) lbl.textContent = full && now >= 0 ? (now + 1) + '. ' + asmaName(now) : L({rur:'Poori recitation, 99 naam', en:'Full recitation, 99 names'});
  document.querySelectorAll('.asma-pl').forEach(b=>{ const i = +b.dataset.i, on = asmaSt.mode === 'one' && asmaSt.idx === i && playing; b.classList.toggle('on', on); b.textContent = on ? '■' : '▶'; });
  document.querySelectorAll('.asma-listen').forEach(b=>{ const i = +b.dataset.i, on = asmaSt.mode === 'one' && asmaSt.idx === i && playing; b.classList.toggle('on', on); b.querySelector('.asma-lt').textContent = on ? L({rur:'Rokein', en:'Stop'}) : L({rur:'Yeh naam sunein', en:'Listen to this name'}); b.querySelector('.asma-li').textContent = on ? '■' : '▶'; });
  document.querySelectorAll('#namesGrid .aad-card').forEach(c=>{ const cur = full && playing && +c.dataset.idx === now; if(c.classList.contains('asma-now') !== cur) c.classList.toggle('asma-now', cur); if(cur && scroll === true){ try{ c.scrollIntoView({ block:'center', behavior:'smooth' }); }catch(e){} } });
  if(!full){ const r = document.getElementById('asmaRange'); if(r && !r.dataset.drag) r.value = 0; const c = document.getElementById('asmaCur'); if(c) c.textContent = '0:00'; asmaLastNow = -2; }
}
function asmaFullBarHtml(){
  return `<div class="asma-full" id="asmaFull">
    <button class="asma-fbtn" id="asmaFullBtn" aria-label="${L({rur:'Poori recitation chalayein', en:'Play the full recitation'})}">▶</button>
    <div class="asma-fmid"><div class="asma-ftop"><div class="asma-ftitle">${L({rur:'Asma-ul-Husna: poora audio', en:'Asma-ul-Husna: full audio'})}</div><button class="asma-rate" id="asmaRateBtn" data-act="rate" aria-label="${L({rur:'Raftaar', en:'Speed'})}">⚡ 1×</button></div><div class="asma-fnow" id="asmaNowLbl"></div>
      <div class="asma-fseek"><span id="asmaCur">0:00</span><input type="range" id="asmaRange" min="0" max="93.8" step="0.1" value="0" aria-label="${L({rur:'Audio ki timeline', en:'Audio timeline'})}"><span>1:34</span></div></div>
  </div>`;
}
function asmaWireOpts(){ document.querySelectorAll('.asma-rate').forEach(b=>{ b.onclick = asmaCycleRate; }); document.querySelectorAll('.asma-rep').forEach(b=>{ b.onclick = asmaToggleRep; }); }
function asmaOptsHtml(){ return `<div class="asma-opts"><button type="button" class="asma-rate">⚡ 1×</button><button type="button" class="asma-rep">🔁</button></div>`; }
function asmaWireFull(){
  const fb = document.getElementById('asmaFullBtn'); if(!fb) return;
  fb.onclick = asmaToggleFull; asmaWireOpts();
  const r = document.getElementById('asmaRange');
  r.oninput = ()=>{ r.dataset.drag = '1'; const c = document.getElementById('asmaCur'); if(c) c.textContent = fmtSecs(Math.floor(+r.value)); };
  r.onchange = ()=>{ delete r.dataset.drag; if(asmaSt.mode !== 'full') asmaBegin('asma/full.m4a', 'full'); const a = asmaEl(); const go = ()=>{ try{ a.currentTime = +r.value; }catch(e){} }; if(a.readyState >= 1) go(); else a.addEventListener('loadedmetadata', go, { once:true }); asmaUI(true); };
  asmaUI();
}
