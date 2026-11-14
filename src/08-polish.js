/* ===== POLISH PASS: monthly timetable, vibration/sound switches, shortcuts, accessibility ===== */

/* --- Vibration and sound master switches (Settings -> Vibration aur Awaaz) --- */
(function(){
  const orig = navigator.vibrate ? navigator.vibrate.bind(navigator) : null;
  if(orig){
    try{ Object.defineProperty(navigator, 'vibrate', { configurable:true, value:function(p){ return state.haptics===false ? false : orig(p); } }); }catch(e){}
  }
  const wrapSilent = name=>{
    const f = window[name]; if(typeof f !== 'function') return;
    window[name] = function(...a){ if(state.sounds===false) return; return f.apply(this, a); };
  };
  wrapSilent('tasbeehBeep'); wrapSilent('playPageSound');
})();

/* --- Monthly timetable (Namaz and Ramzan) --- */
let ttYear = new Date().getFullYear(), ttMonth = new Date().getMonth(), ttMode = 'namaz';
function ttRows(){
  const days = new Date(ttYear, ttMonth+1, 0).getDate(), rows = [];
  for(let d=1; d<=days; d++){
    const date = new Date(ttYear, ttMonth, d, 12, 0, 0);
    const s = buildSchedule(date), g = k=>s.find(x=>x.key===k);
    const hd = gregorianToHijri(date);
    const cells = ttMode==='ramzan'
      ? [fmtTime(g('sehri').end), fmtTime(g('fajr').start), fmtTime(g('maghrib').start)]
      : [fmtTime(g('fajr').start), fmtTime(g('tulu').start), fmtTime(g('zuhr').start), fmtTime(g('asr').start), fmtTime(g('maghrib').start), fmtTime(g('isha').start)];
    rows.push({ d, dow:date.getDay(), hd, cells, today: dayKey(date)===dayKey(new Date()) });
  }
  return rows;
}
function ttHead(){
  return ttMode==='ramzan' ? ['Sehri ends','Fajr','Iftar'] : ['Fajr','Sunrise','Zuhr','Asr','Maghrib','Isha'];
}
function renderMonthTable(){
  document.getElementById('detailTitle').textContent = L({rur:'Mahine ka Timetable', en:'Monthly Timetable'});
  const rows = ttRows(), head = ttHead();
  document.getElementById('detailBody').innerHTML = `
    <div class="tt-nav">
      <button class="tt-arrow" id="ttPrev" aria-label="Previous month">‹</button>
      <div class="tt-title">${MON[ttMonth]} ${ttYear}</div>
      <button class="tt-arrow" id="ttNext" aria-label="Next month">›</button>
    </div>
    <div class="theme-row" style="padding:0 0 12px;" role="group">
      <button data-ttm="namaz" class="${ttMode==='namaz'?'active':''}" aria-pressed="${ttMode==='namaz'}">${L({rur:'Namaz', en:'Prayers'})}</button>
      <button data-ttm="ramzan" class="${ttMode==='ramzan'?'active':''}" aria-pressed="${ttMode==='ramzan'}">${L({rur:'Roza (Sehri/Iftar)', en:'Roza (Suhoor/Iftar)'})}</button>
    </div>
    <div class="tt-wrap"><table class="tt-table">
      <thead><tr><th>${L({rur:'Din', en:'Day'})}</th>${head.map(h=>`<th>${h}</th>`).join('')}</tr></thead>
      <tbody>${rows.map(r=>`<tr class="${r.today?'today':''} ${r.dow===5?'fri':''}">
        <td class="tt-d"><b>${r.d}</b> ${DOW[r.dow].slice(0,3)}<small>${r.hd.day} ${r.hd.monthName.split('-')[0]}</small></td>
        ${r.cells.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
    </table></div>
    <div class="tt-actions">
      <button class="backup-btn" id="ttShare">🖼️ ${L({rur:'Image share karein', en:'Share as image'})}</button>
      <button class="backup-btn" id="ttPrint">🖨️ ${L({rur:'Print / PDF', en:'Print / PDF'})}</button>
    </div>
    <div class="backup-note">${state.location.name} · ${L({rur:'Waqt aap ke Namaz ke Hisaab (Settings) ke mutabiq hain.', en:'Times follow your calculation settings.'})}</div>`;
  const body = document.getElementById('detailBody');
  const shift = n=>{ ttMonth += n; if(ttMonth<0){ttMonth=11;ttYear--;} if(ttMonth>11){ttMonth=0;ttYear++;} renderMonthTable(); };
  body.querySelector('#ttPrev').onclick = ()=>shift(-1);
  body.querySelector('#ttNext').onclick = ()=>shift(1);
  body.querySelectorAll('[data-ttm]').forEach(b=> b.onclick = ()=>{ ttMode = b.dataset.ttm; renderMonthTable(); });
  body.querySelector('#ttShare').onclick = shareMonthImage;
  body.querySelector('#ttPrint').onclick = ()=> window.print();
}
function drawMonthCanvas(){
  const rows = ttRows(), head = ttHead();
  const cs = getComputedStyle(document.documentElement);
  const col = (n,f)=> cs.getPropertyValue(n).trim() || f;
  const cBg=col('--bg','#0d1420'), cText=col('--text','#e9edf3'), cSub=col('--sub','#8f9bb3'), cLine=col('--line','#232f42'), cAcc=col('--accent','#3a9bd9'), cCard=col('--card','#16202f');
  const W=900, headerH=130, rowH=40, footerH=50, H=headerH+rowH*(rows.length+1)+footerH;
  const sc=2, cv=document.createElement('canvas'); cv.width=W*sc; cv.height=H*sc;
  const c=cv.getContext('2d'); c.scale(sc,sc);
  c.fillStyle=cBg; c.fillRect(0,0,W,H);
  c.textBaseline='middle';
  c.fillStyle=cAcc; c.font='700 30px Inter, system-ui, sans-serif'; c.fillText('Waqt24', 32, 42);
  c.fillStyle=cText; c.font='700 24px Inter, system-ui, sans-serif'; c.fillText(`${MON[ttMonth]} ${ttYear} · ${ttMode==='ramzan'?'Sehri / Iftar':'Namaz timetable'}`, 32, 82);
  c.fillStyle=cSub; c.font='500 16px Inter, system-ui, sans-serif'; c.fillText(state.location.name, 32, 110);
  const cols=head.length+1, firstW=150, cw=(W-64-firstW)/head.length;
  let y=headerH;
  c.fillStyle=cCard; c.fillRect(24,y,W-48,rowH);
  c.fillStyle=cSub; c.font='700 15px Inter, system-ui, sans-serif'; c.fillText('Day', 36, y+rowH/2);
  head.forEach((h,i)=>{ c.textAlign='center'; c.fillText(h, 32+firstW+cw*i+cw/2, y+rowH/2); c.textAlign='left'; });
  rows.forEach((r,idx)=>{
    y=headerH+rowH*(idx+1);
    if(idx%2===1){ c.fillStyle=cText; c.globalAlpha=.06; c.fillRect(24,y,W-48,rowH); c.globalAlpha=1; }
    if(r.today){ c.fillStyle=cAcc; c.globalAlpha=.22; c.fillRect(24,y,W-48,rowH); c.globalAlpha=1; }
    else if(r.dow===5){ c.fillStyle=cAcc; c.globalAlpha=.12; c.fillRect(24,y,W-48,rowH); c.globalAlpha=1; }
    c.fillStyle=cLine; c.fillRect(24,y+rowH-1,W-48,1);
    c.fillStyle=cText; c.font='700 16px Inter, system-ui, sans-serif'; c.fillText(`${r.d} ${DOW[r.dow].slice(0,3)}`, 36, y+rowH/2);
    c.fillStyle=cSub; c.font='500 12px Inter, system-ui, sans-serif'; c.fillText(`${r.hd.day} ${r.hd.monthName.split('-')[0]}`, 108, y+rowH/2);
    c.fillStyle=cText; c.font='600 16px Inter, system-ui, sans-serif';
    r.cells.forEach((t,i)=>{ c.textAlign='center'; c.fillText(t, 32+firstW+cw*i+cw/2, y+rowH/2); c.textAlign='left'; });
  });
  c.fillStyle=cSub; c.font='500 13px Inter, system-ui, sans-serif'; c.fillText('Made with Waqt24 · iam-zain.github.io/waqt24', 32, H-24);
  return cv;
}
function shareMonthImage(){
  drawMonthCanvas().toBlob(async blob=>{
    if(!blob) return;
    const name = `waqt24-${ttYear}-${String(ttMonth+1).padStart(2,'0')}-${ttMode}.png`;
    const file = new File([blob], name, {type:'image/png'});
    if(navigator.canShare && navigator.canShare({files:[file]})){
      try{ await navigator.share({ files:[file], title:'Waqt24' }); return; }catch(e){ if(e && e.name==='AbortError') return; }
    }
    const url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href=url; a.download=name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(url), 4000);
  }, 'image/png');
}
navWrap('renderMonthTable', 0);
(function(){
  const item = document.querySelector('.more-item[data-open="monthTable"]');
  if(item) item.onclick = ()=> openOverlay(renderMonthTable);
})();

/* --- Settings pane: vibration and sound --- */
function renderFeedbackPane(pane){
  const row = (k, ic, t, d)=> `<div class="lang-opt ${state[k]!==false?'on':''}" data-fb="${k}" role="switch" aria-checked="${state[k]!==false}" tabindex="0"><div><b>${ic} ${t}</b><span>${d}</span></div><div class="lang-check">${state[k]!==false?'✓':''}</div></div>`;
  pane.innerHTML = row('haptics','📳',L({rur:'Vibration',en:'Vibration'}),L({rur:'Button dabane aur tasbeeh par halki vibration',en:'Light vibration on taps and tasbeeh'}))
    + row('sounds','🔈',L({rur:'Awaaz',en:'Sounds'}),L({rur:'Tasbeeh ki beep aur Quran ke page palatne ki awaaz',en:'Tasbeeh beep and Quran page-turn sound'}))
    + `<div class="backup-note">${L({rur:'Azaan ki awaaz alag se Azaan ki settings se control hoti hai.',en:'Azaan audio is controlled in the Azaan settings.'})}</div>`;
  pane.querySelectorAll('[data-fb]').forEach(el=>{
    const go = ()=>{ const k=el.dataset.fb; state[k] = state[k]===false; saveState(); renderFeedbackPane(pane); };
    el.onclick = go; el.onkeydown = e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); go(); } };
  });
}

/* --- Home screen shortcuts: index.html#tasbeeh, #qibla, #quran --- */
function runHashShortcut(){
  const h = (location.hash||'').replace('#','');
  if(!h) return;
  history.replaceState(null, '', location.pathname + location.search);
  if(h==='qibla') openOverlay(renderQibla);
  else { const it = document.querySelector(`.more-item[data-open="${h}"]`); if(it) it.click(); }
}
setTimeout(runHashShortcut, 400);

/* --- Accessibility --- */
(function(){
  const dlg = document.getElementById('detailOverlay'); if(dlg){ dlg.setAttribute('role','dialog'); dlg.setAttribute('aria-modal','true'); dlg.setAttribute('aria-labelledby','detailTitle'); }
  document.getElementById('detailBack')?.setAttribute('aria-label','Back');
  const syncTabs = ()=> document.querySelectorAll('.tab-btn').forEach(b=>{ b.classList.contains('active') ? b.setAttribute('aria-current','page') : b.removeAttribute('aria-current'); });
  const tabs = document.querySelector('.tab-btn')?.parentElement;
  if(tabs){ new MutationObserver(syncTabs).observe(tabs,{subtree:true,attributes:true,attributeFilter:['class']}); syncTabs(); }
  const LBL = {green:'Padh Li', yellow:'Qaza Padhi', red:'Baaki Hai'};
  const fixDots = root=> (root||document).querySelectorAll('.dot-btn').forEach(b=>{
    const t = b.getAttribute('title'); if(t && !b.hasAttribute('aria-label')) b.setAttribute('aria-label', (b.dataset.prayer ? b.dataset.prayer + ': ' : '') + t);
    b.setAttribute('aria-pressed', /\bon-(green|yellow|red)\b/.test(b.className) ? 'true' : 'false');
  });
  let pend = 0;
  new MutationObserver(()=>{ if(pend) return; pend = requestAnimationFrame(()=>{ pend=0; fixDots(); const t=document.getElementById('appToast'); if(t && !t.hasAttribute('role')){ t.setAttribute('role','status'); t.setAttribute('aria-live','polite'); } }); })
    .observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
  fixDots();
})();
