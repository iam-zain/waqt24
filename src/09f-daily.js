/* ============================================================
   DAILY CARD on Home: today's Du'a and Hadees (changes every day), "another" button, share as image
   ============================================================ */
var dailyTab = 'dua', dailyShift = { dua:0, hadees:0 }, dailyDrawnKey = ''; // var: renderHome may call renderDailyCard before this file's top level has run
function dailyPick(kind){
  const list = kind === 'dua' ? DUAS : HADEES, day = Math.floor(new Date().setHours(12, 0, 0, 0) / 86400000);
  const i = ((day * (kind === 'dua' ? 7 : 5) + dailyShift[kind]) % list.length + list.length) % list.length;
  return list[i];
}
function renderDailyCard(){
  const el = document.getElementById('dailyCard'); if(!el || !dailyShift) return; // not initialised yet (called from the first renderHome)
  if(state.dailyOff || state.dailyHideDay === dayKey(new Date()) || !uiGateOpen(30)){ el.style.display = 'none'; el.innerHTML = ''; dailyDrawnKey = ''; return; }
  el.style.display = '';
  { const list = document.getElementById('timesList'); if(list && el.parentElement !== list) list.appendChild(el); }
  const key = dayKey(new Date()) + dailyTab + dailyShift[dailyTab] + (isEn() ? 'e' : 'u');
  if(key === dailyDrawnKey && el.firstChild) return;
  dailyDrawnKey = key;
  const x = dailyPick(dailyTab), en = isEn(), isDua = dailyTab === 'dua';
  const wasHidden = !el.firstChild;
  el.innerHTML = `<div class="dc-top"><div class="dc-tabs"><button type="button" class="${isDua ? 'on' : ''}" data-dt="dua">🤲 ${L({rur:'Aaj ki Du\'a', en:'Today\'s Du\'a'})}</button><button type="button" class="${isDua ? '' : 'on'}" data-dt="hadees">📜 ${L({rur:'Aaj ki Hadees', en:'Today\'s Hadees'})}</button></div><button type="button" class="dc-x" id="dcClose" aria-label="${L({rur:'Band karein', en:'Close'})}"><svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/></svg></button></div>
    <div class="dc-body">
      ${isDua ? `<div class="dc-title">${en && x.ent ? x.ent : x.title}</div><div class="dc-ar" dir="rtl">${x.arabic}</div><div class="dc-tr">${x.translit}</div><div class="dc-m">${en && x.enm ? x.enm : x.meaning}</div><div class="dc-ref">${x.ref || ''}</div>`
        : `<div class="dc-m dc-h">${en && x.en ? x.en : x.txt}</div><div class="dc-ref">${x.src}</div>`}
    </div>
    <div class="dc-dots" aria-hidden="true"><i class="${isDua ? 'on' : ''}"></i><i class="${isDua ? '' : 'on'}"></i></div>
    <div class="dc-btns"><button type="button" id="dcMore">🔄 ${L({rur:'Doosri', en:'Another'})}</button><button type="button" id="dcShare">📤 ${L({rur:'Share', en:'Share'})}</button></div>`;
  if(wasHidden){ el.classList.remove('dc-in'); void el.offsetWidth; el.classList.add('dc-in'); } else { const bd = el.querySelector('.dc-body'); bd.classList.add('dc-swap'); }
  el.querySelectorAll('[data-dt]').forEach(b=>{ b.onclick = ()=>{ if(dailyTab === b.dataset.dt) return; dailyTab = b.dataset.dt; renderDailyCard(); }; });
  document.getElementById('dcClose').onclick = ()=>{ state.dailyHideDay = dayKey(new Date()); saveState(); el.classList.add('dc-out'); setTimeout(()=>{ el.classList.remove('dc-out', 'dc-in'); renderDailyCard(); }, document.body.classList.contains('calm') ? 0 : 280); };
  document.getElementById('dcMore').onclick = ()=>{ dailyShift[dailyTab]++; renderDailyCard(); };
  document.getElementById('dcShare').onclick = ()=>{
    openCardShareChooser(isDua
      ? { kind:L({rur:'Aaj ki Du\'a', en:'Today\'s Du\'a'}), arabic:x.arabic, title:en && x.ent ? x.ent : x.title, sub:x.translit, body:en && x.enm ? x.enm : x.meaning, foot:(x.ref || '') + ' · Waqt24' }
      : { kind:L({rur:'Aaj ki Hadees', en:'Today\'s Hadees'}), body:en && x.en ? x.en : x.txt, foot:x.src + ' · Waqt24' });
  };
}
renderDailyCard();
setTimeout(()=>{ renderDailyCard(); }, 30100); // the card first appears 30 seconds after the app opens

/* swipe the card sideways to flip between Du'a and Hadees; the text area scrolls up and down when a passage is long */
(function(){
  const el = document.getElementById('dailyCard'); if(!el) return;
  let x0 = null, y0 = 0;
  el.addEventListener('touchstart', e=>{ if(e.target.closest('button')){ x0 = null; return; } x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive:true });
  el.addEventListener('touchend', e=>{
    if(x0 === null) return; const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0; x0 = null;
    if(Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    const want = dx < 0 ? 'hadees' : 'dua'; if(want !== dailyTab){ dailyTab = want; renderDailyCard(); }
  });
})();
