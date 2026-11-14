/* ============================================================
   RANG for the reading sections (Du'a, Hadees, Qur'ani Alfaaz, Aadaab, Names, Khaas Shabd, Myth Busters):
   one colour for all of them. "Theme" (the first swatch, the default) leaves the app's own colours; the others
   tint the page the same way the Quran, Tarjuma and Tafseer do.
   ============================================================ */
const RANG_FNS = new Set(['renderMoreDua','renderMoreHadees','renderQuranWords','renderAadaab','renderNamesList','renderKhaasShabd','renderDailyWord','renderMythBusters','renderDailyCatchup',
  'openDuaDetail','openHadeesDetail','openQuranWordDetail','openAadaabDetail','renderNameDetail','renderShabdCategory','renderMythReadList']);
function rangList(){ return [{ k:'', n:L({rur:'Theme jaisa', en:'Match theme'}) }].concat(QURAN_TINTS.filter(t=>t.k && t.k !== 'theme')); }
function rangStripDraw(){
  const strip = document.getElementById('rangStrip'); if(!strip) return;
  strip.innerHTML = rangList().map(t=>`<button type="button" class="q-tint${(state.pageTint || '') === t.k ? ' active' : ''}${t.k ? '' : ' q-theme'}" data-t="${t.k}" style="--tc:${t.c || 'var(--accent)'}" aria-label="${t.n}" title="${t.n}"></button>`).join('');
}
function rangApply(){
  const ov = document.getElementById('detailOverlay'), b = document.getElementById('detailRang'); if(!ov || !b) return;
  const x = state.pageTint && QURAN_TINTS.find(t=>t.k === state.pageTint);
  if(x && x.c){ ov.dataset.tint = x.k; ov.style.setProperty('--qtc', x.c); ov.style.setProperty('--qta', x.a); }
  else { ov.removeAttribute('data-tint'); ov.style.removeProperty('--qtc'); ov.style.removeProperty('--qta'); }
  b.classList.toggle('on', !!(state.pageTint)); rangStripDraw();
}
function rangSync(){
  const ov = document.getElementById('detailOverlay'), b = document.getElementById('detailRang'), strip = document.getElementById('rangStrip'); if(!ov || !b) return;
  const on = !!(curScreen && RANG_FNS.has(curScreen.fn));
  b.hidden = !on;
  if(!on){ strip.hidden = true; ov.removeAttribute('data-tint'); ov.style.removeProperty('--qtc'); ov.style.removeProperty('--qta'); return; }
  rangApply();
}
(function(){
  const b = document.getElementById('detailRang'), strip = document.getElementById('rangStrip'); if(!b) return;
  b.onclick = ()=>{ strip.hidden = !strip.hidden; };
  strip.onclick = e=>{ const t = e.target.closest('.q-tint'); if(!t) return; state.pageTint = t.dataset.t; saveState(); rangApply(); };
})();
