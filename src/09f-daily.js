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
  if(state.dailyOff){ el.style.display = 'none'; el.innerHTML = ''; dailyDrawnKey = ''; return; }
  el.style.display = '';
  const key = dayKey(new Date()) + dailyTab + dailyShift[dailyTab] + (isEn() ? 'e' : 'u');
  if(key === dailyDrawnKey && el.firstChild) return;
  dailyDrawnKey = key;
  const x = dailyPick(dailyTab), en = isEn(), isDua = dailyTab === 'dua';
  el.innerHTML = `<div class="dc-tabs"><button type="button" class="${isDua ? 'on' : ''}" data-dt="dua">🤲 ${L({rur:'Aaj ki Du\'a', en:'Today\'s Du\'a'})}</button><button type="button" class="${isDua ? '' : 'on'}" data-dt="hadees">📜 ${L({rur:'Aaj ki Hadees', en:'Today\'s Hadees'})}</button></div>
    <div class="dc-body">
      ${isDua ? `<div class="dc-title">${en && x.ent ? x.ent : x.title}</div><div class="dc-ar" dir="rtl">${x.arabic}</div><div class="dc-tr">${x.translit}</div><div class="dc-m">${en && x.enm ? x.enm : x.meaning}</div><div class="dc-ref">${x.ref || ''}</div>`
        : `<div class="dc-m dc-h">${en && x.en ? x.en : x.txt}</div><div class="dc-ref">${x.src}</div>`}
    </div>
    <div class="dc-btns"><button type="button" id="dcMore">🔄 ${L({rur:'Doosri', en:'Another'})}</button><button type="button" id="dcShare">📤 ${L({rur:'Share', en:'Share'})}</button></div>`;
  el.querySelectorAll('[data-dt]').forEach(b=>{ b.onclick = ()=>{ dailyTab = b.dataset.dt; renderDailyCard(); }; });
  document.getElementById('dcMore').onclick = ()=>{ dailyShift[dailyTab]++; renderDailyCard(); };
  document.getElementById('dcShare').onclick = ()=>{
    openCardShareChooser(isDua
      ? { kind:L({rur:'Aaj ki Du\'a', en:'Today\'s Du\'a'}), arabic:x.arabic, title:en && x.ent ? x.ent : x.title, sub:x.translit, body:en && x.enm ? x.enm : x.meaning, foot:(x.ref || '') + ' · Waqt24' }
      : { kind:L({rur:'Aaj ki Hadees', en:'Today\'s Hadees'}), body:en && x.en ? x.en : x.txt, foot:x.src + ' · Waqt24' });
  };
}
renderDailyCard();
