/* ===== Haftawar Hadaf: weekly dua / hadees / surah / own goals, under the daily goal ===== */
const WK_TYPES = { dua:['🤲', 'Dua'], hadees:['📜', 'Hadees'], surah:['📖', 'Surah'], own:['✍️', 'Apna'] };
function wkKey(d){ const x = new Date(d || new Date()); x.setHours(0,0,0,0); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return dayKey(x); } /* week starts Monday */
function wkRnd(seed){ return ()=>{ seed = (seed*1664525 + 1013904223) >>> 0; return seed / 4294967296; }; }
function wkItemFor(type, rnd, used){
  const pick = arr=>{ for(let t = 0; t < 20; t++){ const i = Math.floor(rnd() * arr.length); if(!used.has(type + i)) return i; } return Math.floor(rnd() * arr.length); };
  if(type === 'dua'){ const i = pick(DUAS); return { t:'dua', id:DUAS[i].title, i }; }
  if(type === 'hadees'){ const i = pick(HADEES); return { t:'hadees', id:hadeesKey(HADEES[i]), i }; }
  const short = QURAN_SURAHS.filter(s=> s.n >= 78 || s.n === 1 || s.n === 36 || s.n === 67 || s.n === 18);
  const i = Math.floor(rnd() * short.length); return { t:'surah', id:String(short[i].n), i };
}
function wkState(){
  const w = state.wk = (state.wk && typeof state.wk === 'object') ? state.wk : {}, k = wkKey();
  if(w.key !== k || !Array.isArray(w.items)){
    let seed = 11; for(const ch of k) seed = (seed*31 + ch.charCodeAt(0)) >>> 0;
    const r = wkRnd(seed), used = new Set();
    w.key = k; w.items = ['dua', 'hadees', 'surah'].map(t=>{ const x = wkItemFor(t, r, used); used.add(t + x.i); delete x.i; x.done = false; return x; });
    saveState();
  }
  return w;
}
function wkLabel(x){
  if(x.t === 'dua'){ const d = DUAS.find(y=> y.title === x.id); return d ? { main:d.title, sub:d.cat } : { main:x.id, sub:'' }; }
  if(x.t === 'hadees'){ const h = HADEES.find(y=> hadeesKey(y) === x.id); return h ? { main:(hTxt(h) || '').slice(0, 70) + '…', sub:h.cat } : { main:'Hadees', sub:'' }; }
  if(x.t === 'surah'){ const s = QURAN_SURAHS[(+x.id || 1) - 1]; return { main:`Surah ${s.name}`, sub:s.ar }; }
  return { main:x.id, sub:'' };
}
function wkOpen(x){
  if(x.t === 'dua'){ const d = DUAS.find(y=> y.title === x.id); if(d) openOverlay(()=> openDuaDetail(d)); }
  else if(x.t === 'hadees'){ const h = HADEES.find(y=> hadeesKey(y) === x.id); if(h) openOverlay(()=> openHadeesDetail(h)); }
  else if(x.t === 'surah'){ const s = QURAN_SURAHS[(+x.id || 1) - 1]; state.quranPage = s.page; saveState(); goTask({ tab:'more', open:'quran' }); }
}
function wkEsc(s){ return String(s).replace(/[&<>"]/g, c=> ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c])); }
let wkAdding = null, wkOpenCard = false;
function renderWeekGoal(){
  const el = document.getElementById('weekGoalCard'); if(!el) return;
  const w = wkState(), n = w.items.filter(x=> x.done).length, tot = w.items.length, dayN = ((new Date().getDay() + 6) % 7) + 1;
  el.innerHTML = `<div class="hd-card wk-card ${wkOpenCard ? 'open' : ''}">
    <button class="wk-head" id="wkHead" aria-expanded="${wkOpenCard}"><span class="wk-hi">📅</span><span class="wk-ht">Haftawar Hadaf</span><span class="wk-left">${dayN === 7 ? 'Aakhri din' : (7 - dayN) + ' din baaqi'}</span><span class="wk-hc">${tot ? `${n}/${tot}` : '0'}</span><b class="goal-arrow wk-car">›</b></button>
    <div class="wk-body">
    ${tot ? w.items.map((x, i)=>{ const l = wkLabel(x), m = WK_TYPES[x.t]; return `<div class="wk-item goal-item ${x.done ? 'done' : ''}" data-i="${i}">
      <button class="gi-check wk-chk" data-a="tick" aria-label="Mukammal">${x.done ? '✓' : ''}</button>
      <button class="wk-txt" data-a="open"><span class="wk-ty">${m[0]} ${m[1]}</span><span class="gi-txt wk-main">${wkEsc(l.main)}</span></button>
      ${x.t !== 'own' ? `<button class="wk-sm" data-a="swap" aria-label="Badlein">${uiIcon('refresh')}</button>` : ''}<button class="wk-sm" data-a="del" aria-label="Hatayein">✕</button></div>`; }).join('') : `<div class="wk-empty">Is hafte ka koi hadaf nahi. Neeche se jodein.</div>`}
    ${n === tot && tot ? `<div class="goal-win">Mashallah! Is hafte ka hadaf mukammal 🎉</div>` : ''}
    ${wkAdding ? `<div class="wk-add"><div class="wk-types">${Object.keys(WK_TYPES).map(t=> `<button data-ty="${t}" class="${wkAdding.t === t ? 'on' : ''}">${WK_TYPES[t][0]} ${WK_TYPES[t][1]}</button>`).join('')}</div>
      ${wkAdding.t === 'own' ? `<input class="wk-in" id="wkOwn" placeholder="Apna hadaf likhein" maxlength="200">`
        : `<select class="wk-in" id="wkSel">${wkAdding.t === 'dua' ? DUAS.map(d=> `<option value="${wkEsc(d.title)}">${wkEsc(d.title)} (${wkEsc(d.cat)})</option>`).join('')
        : wkAdding.t === 'hadees' ? HADEES.map(h=> `<option value="${wkEsc(hadeesKey(h))}">${wkEsc(h.cat)}: ${wkEsc((hTxt(h) || '').slice(0, 50))}…</option>`).join('')
        : QURAN_SURAHS.map(s=> `<option value="${s.n}">${s.n}. ${wkEsc(s.name)}</option>`).join('')}</select>`}
      <div class="wk-btns"><button id="wkSave" class="wk-pri">Jodein</button><button id="wkCancel">Radd</button></div></div>`
    : `<div class="wk-btns"><button id="wkAdd" class="goal-reroll">＋ Hadaf jodein</button><button id="wkRand" class="goal-reroll">🎲 Random jodein</button></div>`}
    </div>
  </div>`;
  document.getElementById('wkHead').onclick = ()=>{ wkOpenCard = !wkOpenCard; renderWeekGoal(); };
  el.querySelectorAll('.wk-item').forEach(row=>{
    const i = +row.dataset.i;
    row.querySelectorAll('[data-a]').forEach(b=> b.onclick = ()=>{
      const x = w.items[i], a = b.dataset.a;
      if(a === 'tick'){ x.done = !x.done; }
      else if(a === 'open'){ wkOpen(x); if(x.t === 'own') return; return; }
      else if(a === 'del'){ w.items.splice(i, 1); }
      else if(a === 'swap'){ const r = wkRnd((Date.now() & 0xffffff) + i), y = wkItemFor(x.t, r, new Set()); delete y.i; y.done = false; w.items[i] = y; }
      saveState(); renderWeekGoal();
    });
  });
  const q = id=> document.getElementById(id);
  if(q('wkAdd')) q('wkAdd').onclick = ()=>{ wkAdding = { t:'dua' }; renderWeekGoal(); };
  if(q('wkRand')) q('wkRand').onclick = ()=>{ const t = ['dua', 'hadees', 'surah'][Math.floor(Math.random() * 3)], x = wkItemFor(t, Math.random, new Set()); delete x.i; x.done = false; w.items.push(x); saveState(); renderWeekGoal(); };
  if(q('wkCancel')) q('wkCancel').onclick = ()=>{ wkAdding = null; renderWeekGoal(); };
  el.querySelectorAll('.wk-types button').forEach(b=> b.onclick = ()=>{ wkAdding.t = b.dataset.ty; renderWeekGoal(); });
  if(q('wkSave')) q('wkSave').onclick = ()=>{
    const v = wkAdding.t === 'own' ? q('wkOwn').value.trim() : q('wkSel').value;
    if(!v){ showToast('Pehle kuch likhein'); return; }
    w.items.push({ t:wkAdding.t, id:v, done:false }); wkAdding = null; saveState(); renderWeekGoal();
  };
}
