/* ============================================================
   HOME TAB RENDER
   ============================================================ */
const FIVE = ['fajr','zuhr','asr','maghrib','isha'];
const DOW = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MON = ['January','February','March','April','May','June','July','August','September','October','November','December'];

/* The namaz "day" runs from Sehri to the following Fajr, not midnight-to-midnight.
   Before today's own Sehri starts, we're still inside the previous calendar day's
   overnight schedule (Isha/Tahajjud/Du'a Qubooliyat), so that's the "operating day". */
function operatingDate(now){
  const d = new Date(now); d.setHours(0,0,0,0);
  const todaySched = buildSchedule(d);
  if(now >= todaySched[0].start) return d;
  return new Date(d.getTime()-86400000);
}
let homeViewDate = operatingDate(new Date());
let homeFollowsToday = true;
let lastLiveKey = null, liveCenterKey = null, liveUserScrolled = false;
/* Put the live prayer row a little below the top of the list (so the next rows stay visible). */
function centerLiveRow(instant){
  const listEl = document.getElementById('timesList'); if(!listEl || !liveCenterKey || listEl.clientHeight < 50) return;
  const row = listEl.querySelector('.time-row[data-key="'+liveCenterKey+'"]'); if(!row) return;
  const want = Math.max(0, listEl.scrollTop + (row.getBoundingClientRect().top - listEl.getBoundingClientRect().top) - listEl.clientHeight * 0.22);
  if(Math.abs(want - listEl.scrollTop) < 2) return;
  listEl.scrollTo({ top: want, behavior: instant ? 'auto' : 'smooth' });
}
(function(){
  const l = document.getElementById('timesList'); if(!l) return;
  ['touchstart','wheel','pointerdown'].forEach(ev=> l.addEventListener(ev, ()=>{ liveUserScrolled = true; }, { passive:true }));
  document.addEventListener('visibilitychange', ()=>{ if(!document.hidden && !liveUserScrolled) setTimeout(()=>centerLiveRow(true), 150); });
  document.querySelectorAll('.tab-btn[data-tab="home"]').forEach(b=> b.addEventListener('click', ()=>{ if(!liveUserScrolled) setTimeout(()=>centerLiveRow(true), 120); }));
})();
let homeNextChange = 0, homeRenderedDay = null; // set by renderHome, read by homeTick
function isSameDay(a,b){ return dayKey(a)===dayKey(b); }

/* Missed-prayer banner: a Farz whose time has ended and which was never marked. ✓ = padh li, Qaza = adds one to the Qaza tracker and marks it Baaki. */
function renderMissedBar(viewDate, isToday, sched, now){
  const old = document.getElementById('missedBar'); if(old) old.remove();
  if(!isToday) return;
  const dk = dayKey(viewDate); if(state.missedOff && state.missedOff[dk]) return;
  const miss = sched.filter(p=> FIVE.includes(p.key) && now >= p.end && getStatus(viewDate, p.key) === undefined);
  if(!miss.length) return;
  const bar = document.createElement('div'); bar.id = 'missedBar'; bar.className = 'missed-bar';
  bar.innerHTML = `<div class="mb-head"><b>⏰ ${miss.length === 1 ? miss[0].name + ' ka waqt nikal gaya' : miss.length + ' namazon ka waqt nikal gaya'}</b><button type="button" class="mb-x" aria-label="Aaj ke liye chhupayein">✕</button></div>`
    + miss.map(p=>`<div class="mb-row"><span>${PRAYER_META[p.key] ? PRAYER_META[p.key].icon : ''} ${p.name}</span><span class="mb-btns"><button type="button" class="mb-ok" data-k="${p.key}">✓ Padh li</button><button type="button" class="mb-qz" data-k="${p.key}">＋ Qaza mein</button></span></div>`).join('');
  bar.onclick = e=>{
    const b = e.target.closest('button'); if(!b) return;
    if(b.classList.contains('mb-x')){ state.missedOff = state.missedOff || {}; state.missedOff[dk] = true; saveState(); bar.remove(); return; }
    const k = b.dataset.k; if(!k) return;
    if(b.classList.contains('mb-ok')){ state.status[statusKey(viewDate, k)] = 'green'; showToast('Allah qubool farmaye'); }
    else{
      state.status[statusKey(viewDate, k)] = 'red';
      state.qazaAdded = state.qazaAdded || {}; const qk = dk + k;
      if(!state.qazaAdded[qk]){ state.qazaAdded[qk] = 1; qazaState(); state.qaza[k] = (state.qaza[k] || 0) + 1; }
      showToast('Qaza tracker mein jud gayi');
    }
    saveState(); renderHome(); if(typeof updateQazaBadge === 'function') updateQazaBadge();
  };
  document.getElementById('timesList').before(bar);
}
function renderHome(){
  const now = new Date();
  if(homeFollowsToday){ homeViewDate = operatingDate(now); }
  const viewDate = homeViewDate;
  const isToday = isSameDay(viewDate, now) || isSameDay(viewDate, operatingDate(now));
  const isPastDate = !isToday && viewDate < now;
  const isFutureDate = !isToday && !isPastDate;
  document.getElementById('bulkBtns').classList.toggle('disabled', isFutureDate);

  document.getElementById('gregDate').innerHTML = DOW[viewDate.getDay()]+', '+viewDate.getDate()+' '+MON[viewDate.getMonth()]+' '+viewDate.getFullYear() + (isToday ? '<span class="todayTag">Aaj</span>' : '');
  const hd = gregorianToHijri(viewDate);
  document.getElementById('hijriDate').textContent = hd.day+' '+hd.monthName+' '+hd.year+' AH';
  document.getElementById('cityLabel').textContent = '📍 ' + state.location.name + (state.location.state ? ', '+state.location.state : '');
  document.getElementById('namazModeBtn').classList.toggle('on', state.namazMode);

  const sched = buildSchedule(viewDate);
  const listEl = document.getElementById('timesList');
  listEl.innerHTML = '';
  listEl.classList.toggle('namaz-mode', state.namazMode);

  renderMissedBar(viewDate, isToday, sched, now);
  let currentIdx = -1, currentStart = null;
  if(isToday){
    for(let i=0;i<sched.length;i++){
      if(sched[i].key==='iftar' || sched[i].key==='ghurub') continue; // overlap with Maghrib/Asr; handled separately below
      if(now >= sched[i].start && now < sched[i].end){
        // prefer the latest-starting match (a narrower window, e.g. Du'a Qubooliyat inside
        // Tahajjud, should win over the wider one it sits inside); on an exact tie (e.g.
        // Awwabin shares its whole window with Maghrib) the Fard prayer takes priority.
        if(currentStart===null || sched[i].start > currentStart || (sched[i].start.getTime()===currentStart.getTime() && sched[i].type==='fard')){
          currentIdx = i; currentStart = sched[i].start;
        }
      }
    }
  }
  // Tahajjud sits inside Isha's time, and Du'a Qubooliyat (tihai) sits inside Tahajjud's: when the
  // narrowest one is current, its parents stay live too, instead of switching off.
  const NEST_PARENT = { tahajjud:'isha', tihai:'tahajjud' };
  const liveParents = new Set();
  for(let k = currentIdx>=0 ? sched[currentIdx].key : null; NEST_PARENT[k]; k = NEST_PARENT[k]) liveParents.add(NEST_PARENT[k]);
  const maghribRow = sched.find(x=>x.key==='maghrib');
  const ishaRow = sched.find(x=>x.key==='isha');
  const fajrRow = sched.find(x=>x.key==='fajr');
  const ghurubRow = sched.find(x=>x.key==='ghurub');
  const isIftarActive = isToday && now>=maghribRow.start && now<ishaRow.start;
  const isAsrWarning = isToday && now>=ghurubRow.start && now<maghribRow.start;
  const isGhurubActive = isAsrWarning;

  const displaySched = state.namazMode ? sched.filter(p=>FIVE.includes(p.key)) : sched;
  displaySched.forEach((p)=>{
    const idx = sched.indexOf(p);
    const row = document.createElement('div');
    let isPast, isFuture, isLive = false;
    if(p.key==='iftar'){
      isLive = isIftarActive;
      isPast = isToday ? now>=ishaRow.start : isPastDate;
      isFuture = isToday ? now<maghribRow.start : !isPastDate;
    } else if(p.key==='ghurub'){
      isLive = isGhurubActive;
      isPast = isToday ? now>=maghribRow.start : isPastDate;
      isFuture = isToday ? now<ghurubRow.start : !isPastDate;
    } else if(isToday){
      const isLiveParent = liveParents.has(p.key);
      isPast = idx!==currentIdx && !isLiveParent && (now>=p.end || idx<currentIdx);
      isFuture = idx!==currentIdx && !isLiveParent && now<p.start && idx>currentIdx;
      // Awwabin shares Maghrib's exact window, so it lights up together with it
      isLive = idx===currentIdx || isLiveParent || (p.key==='awwabin' && currentIdx>=0 && sched[currentIdx].key==='maghrib');
    } else {
      isPast = isPastDate;
      isFuture = !isPastDate;
    }
    const stateClass = isLive ? 'current' : isPastDate ? 'normal' : isPast ? 'past' : 'future';
    const rowStatus = (FIVE.includes(p.key) || (nafilOn() && NAFIL_KEYS.includes(p.key))) ? getStatus(viewDate, p.key) : undefined;
    const statusClass = rowStatus ? ' status-'+rowStatus : '';
    row.className = 'time-row '+p.type+' '+stateClass+statusClass;
    row.dataset.key = p.key;

    let dotsHtml = '';
    let sehriHtml = '';
    if(FIVE.includes(p.key) && !isFuture){
      const st = rowStatus;
      dotsHtml = `<div class="status-dots">
        <button class="dot-btn ${st==='green'?'on-green':''}" data-prayer="${p.key}" data-set="green" title="Padh Li">✓</button>
        <button class="dot-btn ${st==='yellow'?'on-yellow':''}" data-prayer="${p.key}" data-set="yellow" title="Qaza Padhi">~</button>
        <button class="dot-btn ${st==='red'?'on-red':''}" data-prayer="${p.key}" data-set="red" title="Baaki Hai">⏳</button>
      </div>`;
    } else if(nafilOn() && NAFIL_KEYS.includes(p.key) && !isFuture){
      const st = rowStatus;
      dotsHtml = `<div class="status-dots nafil-dots">
        <button class="dot-btn ${st==='green'?'on-green':''}" data-prayer="${p.key}" data-set="green" title="Padh Li">✓</button>
        <button class="dot-btn ${st==='red'?'on-red':''}" data-prayer="${p.key}" data-set="red" title="Nahi Padhi">✗</button>
      </div>`;
    } else if(p.key==='sehri' && !isFutureDate){
      const rozaOn = !!state.roza[dayKey(viewDate)];
      sehriHtml = `<div style="display:flex; align-items:center; gap:5px;">
        <span style="font-size:10px; color:var(--sub); font-weight:600;">Roza</span>
        <div class="roza-mini ${rozaOn?'on':''}" id="rozaMiniBtn"><div class="roza-mini-knob"></div></div>
      </div>`;
    }

    const icon = (PRAYER_META[p.key] && PRAYER_META[p.key].icon) || '🕐';
    let meterColor = p.type==='fard'?'var(--fard)':p.type==='nafil'?'var(--nafil)':p.type==='meal'?'var(--meal)':'var(--special)';
    if(p.key==='asr' && isAsrWarning) meterColor = 'var(--red)';

    let meterHtml = '';
    let remainHtml = '';
    if(p.key==='iftar'){
      if(isLive) meterHtml = `<div class="meterWrap"><div class="meterFill" style="width:100%; background:${meterColor}"></div></div>`;
    } else if(p.key==='sehri' && isLive){
      const effStart = new Date(fajrRow.start.getTime() - 60*60000);
      if(now >= effStart){
        const pct = Math.min(100, Math.max(0, (now-effStart)/(fajrRow.start-effStart)*100));
        meterHtml = `<div class="meterWrap"><div class="meterFill" data-s="${effStart.getTime()}" data-e="${fajrRow.start.getTime()}" style="width:${100-pct}%; background:${meterColor}"></div></div>`;
        remainHtml = `<div class="remainText"><span class="remainLabel">Waqt Baaqi:</span> <span class="remainValue" data-t="${fajrRow.start.getTime()}">${fmtRemain(fajrRow.start-now)}</span></div>`;
      }
    } else if(isLive){
      const pct = Math.min(100, Math.max(0, (now-p.start)/(p.end-p.start)*100));
      meterHtml = `<div class="meterWrap"><div class="meterFill" data-s="${p.start.getTime()}" data-e="${p.end.getTime()}" style="width:${100-pct}%; background:${meterColor}"></div></div>`;
      remainHtml = `<div class="remainText"><span class="remainLabel">Waqt Baaqi:</span> <span class="remainValue" data-t="${p.end.getTime()}">${fmtRemain(p.end-now)}</span></div>`;
    }

    let dotsSlot = '';
    if(dotsHtml){
      dotsSlot = `<div class="dotsSlot">${dotsHtml}</div>`;
    } else if(p.key==='sehri'){
      dotsSlot = sehriHtml;
    } else if(meterHtml){
      dotsSlot = `<div class="dotsSlot dotsSlotEmpty"></div>`;
    }

    row.innerHTML = `
      <div class="rowMain">
        <div class="name"><span class="pIcon">${icon}</span><span class="nameTxt">${p.name}</span></div>
        <div class="clock">${fmtRange(p)}</div>
        ${jamaatChip(p, viewDate)}
        <div style="flex:1;"></div>
        ${dotsSlot}
      </div>
      ${meterHtml ? `<div class="meterRow">${remainHtml || '<div class="remainText remainEmpty">&nbsp;</div>'}${meterHtml}</div>` : ''}
    `;
    row.querySelector('.name').onclick = ()=> showInfoModal(p.key);
    attachLongPress(row, ()=> openRowSheet(p, viewDate));
    listEl.appendChild(row);
  });

  if(isToday){
    const liveKey = (isIftarActive && 'iftar') || (isGhurubActive && 'ghurub') || (currentIdx>=0 && sched[currentIdx].key) || null;
    if(liveKey && liveKey !== lastLiveKey){
      liveCenterKey = liveKey; liveUserScrolled = false;
      centerLiveRow(instantScroll);
      /* layout may still be settling (fonts, tab just shown): settle again unless the person has scrolled themselves */
      [120, 500, 1200].forEach(ms=> setTimeout(()=>{ if(!liveUserScrolled) centerLiveRow(true); }, ms));
    }
    lastLiveKey = liveKey;
  }
  homeNextChange = Infinity;
  if(isToday){
    const t = now.getTime();
    sched.forEach(x=>{ [x.start, x.end].forEach(d=>{ const v = d.getTime(); if(v > t && v < homeNextChange) homeNextChange = v; }); });
    const sehriMeterStart = fajrRow.start.getTime() - 60*60000;
    if(sehriMeterStart > t && sehriMeterStart < homeNextChange) homeNextChange = sehriMeterStart;
  }
  homeRenderedDay = dayKey(operatingDate(now));

  listEl.querySelectorAll('.dot-btn').forEach(btn=>{
    btn.onclick = ()=>{
      const prayer = btn.dataset.prayer, want = btn.dataset.set;
      const cur = getStatus(viewDate, prayer);
      const k = statusKey(viewDate, prayer);
      if(cur===want){ delete state.status[k]; markToast(prayer, want, true); }
      else{ state.status[k]=want; markToast(prayer, want, false); }
      saveState();
      renderHome();
    };
  });

  const rozaBtn = document.getElementById('rozaMiniBtn');
  if(rozaBtn){
    rozaBtn.onclick = ()=>{
      const rk = dayKey(viewDate);
      state.roza[rk] = !state.roza[rk];
      saveState();
      renderHome();
    };
  }
  const homeEl = document.getElementById('tab-home');
  const rozaActive = !!state.roza[dayKey(viewDate)];
  homeEl.style.background = rozaActive ? 'color-mix(in srgb, var(--roza) 9%, var(--bg))' : '';
}
document.getElementById('dateBack').onclick=()=>{ homeFollowsToday = false; homeViewDate = new Date(homeViewDate.getTime()-24*3600000); renderHome(); };
document.getElementById('dateFwd').onclick=()=>{ homeFollowsToday = false; homeViewDate = new Date(homeViewDate.getTime()+24*3600000); renderHome(); };
document.getElementById('dateCenterBtn').onclick=()=>{ homeFollowsToday = true; homeViewDate = operatingDate(new Date()); renderHome(); };
document.getElementById('cityLabel').onclick=(e)=>{ e.stopPropagation(); settingsTab = 'location'; openOverlay(renderMoreSettings); };
let instantScroll = false;
document.getElementById('namazModeBtn').onclick=()=>{
  state.namazMode = !state.namazMode; saveState(); lastLiveKey = null;
  instantScroll = true;
  document.getElementById('timesList').scrollTop = 0;
  renderHome();
  requestAnimationFrame(()=>{ instantScroll = false; });
};

/* ============================================================
   SHARE A DAY'S SCHEDULE, as text or as an image
   ============================================================ */
function buildDaySchedLines(date){
  const sched = buildSchedule(date);
  const skip = ['zawal','ghurub','tihai'];
  return sched.filter(p=>!skip.includes(p.key)).map(p=>{
    const icon = (PRAYER_META[p.key]&&PRAYER_META[p.key].icon)||'🕐';
    const range = p.key==='sehri' ? 'Khatm '+fmtTimeCompact(p.end) : p.key==='iftar' ? 'Shuru '+fmtTimeCompact(p.start) : fmtTimeCompact(p.start)+' – '+fmtTimeCompact(p.end);
    let mark = '';
    if(FIVE.includes(p.key)){
      const st = getStatus(date, p.key);
      mark = st==='green' ? ' ✅' : st==='yellow' ? ' 〰️' : st==='red' ? ' ❌' : '';
    }
    return { icon, name: p.name, range, mark };
  });
}
function buildDayShareText(date){
  const hd = gregorianToHijri(date);
  const lines = buildDaySchedLines(date);
  let txt = `🕌 Waqt24, ${DOW[date.getDay()]}, ${date.getDate()} ${MON[date.getMonth()]} ${date.getFullYear()} (${hd.day} ${hd.monthName} ${hd.year} AH)\n📍 ${state.location.name}\n\n`;
  lines.forEach(l=>{ txt += `${l.icon} ${l.name}: ${l.range}${l.mark}\n`; });
  return txt;
}
async function shareDayText(date){
  const text = buildDayShareText(date);
  if(navigator.share){
    try{ await navigator.share({ text, title:'Waqt24' }); return; }catch(e){ if(e && e.name==='AbortError') return; }
  }
  try{
    await navigator.clipboard.writeText(text);
    showToast('Schedule copy ho gaya, ab kahin bhi paste kar sakte hain.');
  }catch(e){
    appInfo(text);
  }
}
function drawDayShareCanvas(date){
  const lines = buildDaySchedLines(date);
  const hd = gregorianToHijri(date);
  const cs = getComputedStyle(document.documentElement);
  const col = (name, fallback)=>{ const v = cs.getPropertyValue(name).trim(); return v || fallback; };
  const cBg = col('--bg', '#0d1420');
  const cText = col('--text', '#e9edf3');
  const cSub = col('--sub', '#7c8ba0');
  const cLine = col('--line', '#232f42');
  const cAccent = col('--accent', '#3a9bd9');
  const W = 720, rowH = 62, headerH = 150, footerH = 50;
  const H = headerH + lines.length*rowH + footerH;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = cBg; ctx.fillRect(0,0,W,H);
  ctx.fillStyle = cText;
  ctx.font = '700 30px sans-serif';
  ctx.fillText('🕌 Waqt24', 32, 52);
  ctx.font = '600 20px sans-serif';
  ctx.fillStyle = cSub;
  ctx.fillText(`${DOW[date.getDay()]}, ${date.getDate()} ${MON[date.getMonth()]} ${date.getFullYear()}`, 32, 84);
  ctx.fillText(`${hd.day} ${hd.monthName} ${hd.year} AH  •  📍 ${state.location.name}`, 32, 112);
  ctx.strokeStyle = cAccent; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(32, headerH-14); ctx.lineTo(W-32, headerH-14); ctx.stroke();

  lines.forEach((l,i)=>{
    const y = headerH + i*rowH;
    if(i>0){ ctx.strokeStyle=cLine; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(32,y); ctx.lineTo(W-32,y); ctx.stroke(); }
    ctx.font = '26px sans-serif';
    ctx.fillText(l.icon, 32, y+38);
    ctx.font = '600 22px sans-serif';
    ctx.fillStyle = cText;
    ctx.fillText(l.name+(l.mark?'  '+l.mark:''), 78, y+38);
    ctx.font = '20px sans-serif';
    ctx.fillStyle = cSub;
    ctx.textAlign = 'right';
    ctx.fillText(l.range, W-32, y+38);
    ctx.textAlign = 'left';
  });
  ctx.font = '16px sans-serif';
  ctx.fillStyle = cSub;
  ctx.textAlign = 'center';
  ctx.fillText('iam-zain.github.io/waqt24', W/2, H-20);
  ctx.textAlign = 'left';
  return canvas;
}
async function shareDayImage(date){
  const canvas = drawDayShareCanvas(date);
  canvas.toBlob(async (blob)=>{
    if(!blob) return;
    const fileName = 'waqt24-'+dayKey(date).replace(/\//g,'-')+'.png';
    const file = new File([blob], fileName, {type:'image/png'});
    if(navigator.canShare && navigator.canShare({files:[file]})){
      try{ await navigator.share({ files:[file], title:'Waqt24', text: `${DOW[date.getDay()]}, ${date.getDate()} ${MON[date.getMonth()]} ${date.getFullYear()}` }); return; }catch(e){ if(e && e.name==='AbortError') return; }
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = fileName;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(()=> URL.revokeObjectURL(url), 4000);
  }, 'image/png');
}
function openShareChooser(date){
  document.getElementById('shareChooserImg').onclick = ()=>{ closeModal(); shareDayImage(date); };
  document.getElementById('shareChooserTxt').onclick = ()=>{ closeModal(); shareDayText(date); };
  document.getElementById('shareChooser').classList.add('active');
  pushModalState();
}
document.getElementById('shareDayBtn').onclick = ()=> openShareChooser(homeViewDate);
document.getElementById('shareChooserClose').onclick = closeModal;
document.getElementById('shareChooser').onclick = (e)=>{ if(e.target.id==='shareChooser') closeModal(); };

function bulkSetFive(status, date, onDone){
  const now = new Date();
  if(!isSameDay(date, now) && date > now) return; // future days locked
  const isToday = isSameDay(date, now);
  const sched = isToday ? buildSchedule(date) : null;
  FIVE.forEach(p=>{
    if(isToday){
      const pSched = sched.find(x=>x.key===p);
      if(pSched && now < pSched.start) return; // prayer hasn't started yet today
    }
    state.status[statusKey(date, p)] = status;
  });
  saveState();
  onDone();
}
function bulkClearFive(date, onDone){
  if(!isSameDay(date, new Date()) && date > new Date()) return; // future days locked
  FIVE.forEach(p=>{ delete state.status[statusKey(date, p)]; });
  saveState();
  onDone();
}
document.getElementById('bulkGreen').onclick = ()=> bulkSetFive('green', homeViewDate, renderHome);
document.getElementById('bulkYellow').onclick = ()=> bulkSetFive('yellow', homeViewDate, renderHome);
document.getElementById('bulkRed').onclick = ()=> bulkSetFive('red', homeViewDate, renderHome);
document.getElementById('bulkClear').onclick = ()=> bulkClearFive(homeViewDate, renderHome);
renderHome();
/* Pull-to-refresh on Home: drag the prayer list down from the top to recalculate and jump to now */
(()=>{
  const list = document.getElementById('timesList'), ptr = document.getElementById('homePtr');
  if(!list || !ptr) return;
  const txt = ptr.querySelector('.ptr-txt'), ic = ptr.querySelector('.ptr-ic');
  let y0 = null, pull = 0;
  const set = (h)=>{ ptr.style.height = h + 'px'; ptr.style.opacity = Math.min(1, h/50); };
  list.addEventListener('touchstart', (e)=>{ y0 = list.scrollTop <= 0 ? e.touches[0].clientY : null; pull = 0; ptr.style.transition = 'none'; }, { passive:true });
  list.addEventListener('touchmove', (e)=>{
    if(y0 === null) return;
    pull = Math.max(0, Math.min(90, (e.touches[0].clientY - y0) * 0.5));
    set(pull);
    const ready = pull > 55;
    ic.textContent = ready ? '↻' : '↓';
    ptr.classList.toggle('ready', ready);
    txt.textContent = ready ? L({rur:'Chhod dein, waqt taaza karte hain', en:'Release to refresh'}) : L({rur:'Taaza karne ke liye neeche kheenchein', en:'Pull down to refresh'});
  }, { passive:true });
  list.addEventListener('touchend', ()=>{
    if(y0 === null) return;
    y0 = null;
    ptr.style.transition = 'height .25s ease, opacity .25s ease';
    if(pull > 55){
      ptr.classList.add('spin');
      homeFollowsToday = true; homeViewDate = operatingDate(new Date()); lastLiveKey = null;
      renderHome(); scheduleNotifications(true);
      setTimeout(()=>{ ptr.classList.remove('spin', 'ready'); set(0); showToast(L({rur:'Waqt taaza kar diye', en:'Times refreshed'}), '↻'); }, 450);
    } else { set(0); ptr.classList.remove('ready'); }
    pull = 0;
  });
})();

/* Home tick: only the live timer bar and "time left" text move; the list is redrawn only when a
   prayer window starts or ends (or the day changes), so it no longer jumps every few seconds. */
function homeTick(){
  if(!(homeFollowsToday || isSameDay(homeViewDate, new Date()))) return;
  const now = Date.now();
  if(now >= homeNextChange || homeRenderedDay !== dayKey(operatingDate(new Date()))){ renderHome(); return; }
  document.querySelectorAll('#timesList .meterFill[data-e]').forEach(el=>{
    const s0 = +el.dataset.s, e0 = +el.dataset.e;
    const pct = Math.min(100, Math.max(0, (now - s0) / (e0 - s0) * 100));
    el.style.animation = 'none';
    el.style.width = (100 - pct) + '%';
  });
  document.querySelectorAll('#timesList .remainValue[data-t]').forEach(el=>{
    const v = fmtRemain(+el.dataset.t - now);
    if(el.dataset.v !== v){ el.dataset.v = v; el.textContent = v; } // compare the raw value; English mode translates the shown text
  });
}
setInterval(homeTick, 5000);

/* ============================================================
   NOTIFICATIONS, local, best-effort while the app is open
   (browsers do not allow reliable scheduled notifications from a
   static page when it is fully closed; this schedules timers for
   whatever remains of today whenever the app is open/foregrounded)
   ============================================================ */
/* Show a notification through the service worker: Android Chrome and installed PWAs refuse `new Notification()`. */
function showNotif(title, opts){
  opts = Object.assign({ icon:'icons/icon-192.png', badge:'icons/icon-192.png' }, opts || {});
  const direct = ()=>{ try{ new Notification(title, opts); }catch(e){} };
  try{
    if('serviceWorker' in navigator && navigator.serviceWorker.getRegistration){
      navigator.serviceWorker.getRegistration().then(reg=>{ if(reg && reg.showNotification) reg.showNotification(title, opts); else direct(); }).catch(direct);
      return;
    }
  }catch(e){}
  direct();
}
let scheduledNotifDay = null;
let notifTimers = [];
function scheduleNotifications(force){
  if(!('Notification' in window)) return;
  const today = dayKey(new Date());
  if(!force && scheduledNotifDay===today) return;
  notifTimers.forEach(id=>clearTimeout(id));
  notifTimers = [];
  scheduledNotifDay = today;
  if(Notification.permission!=='granted') return;
  const now = new Date();
  const sched = buildSchedule(now);
  sched.forEach(p=>{
    if(!state.notif[p.type]) return;
    const delay = p.start - now;
    if(delay<=0 || delay>24*3600000) return;
    const id = setTimeout(()=>{
      try{
        const icon = (PRAYER_META[p.key]&&PRAYER_META[p.key].icon)||'🕐';
        showNotif(icon+' '+p.name+' ka waqt', { body: p.name+' ka waqt ho gaya hai.', icon:'icons/icon-192.png', tag:'waqt24-'+p.key });
      }catch(e){}
    }, delay);
    notifTimers.push(id);
  });
  const iq = iqamahState();
  if(iq.on && iq.remind > 0){
    sched.filter(p=>FIVE.includes(p.key)).forEach(p=>{
      const j = jamaatTime(p, operatingDate(now)); if(!j) return;
      const delay = j.getTime() - iq.remind*60000 - now.getTime();
      if(delay<=0 || delay>24*3600000) return;
      notifTimers.push(setTimeout(()=>{
        try{ showNotif(`🕌 ${p.name} ki jamaat ${fmtTimeCompact(j)} par`, { body:`${iq.remind} minute baaqi hain.`, icon:'icons/icon-192.png', tag:'waqt24-iq-'+p.key }); }catch(e){}
      }, delay));
    });
  }
  const lt = String(state.notif.learnTime || '08:00').split(':').map(Number);
  const at = new Date(now); at.setHours(lt[0]||0, lt[1]||0, 0, 0);
  const learnDelay = at - now;
  if(learnDelay>0 && learnDelay<24*3600000){
    const fire = (title, body, tag)=>{ try{ showNotif(title, { body, icon:'icons/icon-192.png', tag }); }catch(e){} };
    if(state.notif.lafz) notifTimers.push(setTimeout(()=>{
      const w = KHAAS_SHABD[dailyWordIndex(0)];
      fire('📚 Aaj ka lafz: '+w.tr, w.m, 'waqt24-lafz');
    }, learnDelay));
    if(state.notif.hadees) notifTimers.push(setTimeout(()=>{
      const h = HADEES[Math.floor(Date.now()/86400000) % HADEES.length];
      fire('📖 Aaj ki Hadees ('+h.src+')', h.txt, 'waqt24-hadees');
    }, learnDelay));
  }
}
scheduleNotifications();
setInterval(()=> scheduleNotifications(), 60000);
document.addEventListener('visibilitychange', ()=>{ if(!document.hidden) scheduleNotifications(); });

let scrollHideTimer = null;
document.getElementById('timesList').addEventListener('scroll', ()=>{
  const listEl = document.getElementById('timesList');
  listEl.classList.add('scrolling');
  clearTimeout(scrollHideTimer);
  scrollHideTimer = setTimeout(()=> listEl.classList.remove('scrolling'), 1000);
}, { passive: true });

/* ============================================================
   CALENDAR TAB
   ============================================================ */
let calMode = 'greg'; // greg | hijri
let calViewDate = new Date();

document.getElementById('calGregBtn').onclick=()=>{ calMode='greg'; document.getElementById('calGregBtn').classList.add('active'); document.getElementById('calHijriBtn').classList.remove('active'); renderCalendar(); };
document.getElementById('calHijriBtn').onclick=()=>{ calMode='hijri'; document.getElementById('calHijriBtn').classList.add('active'); document.getElementById('calGregBtn').classList.remove('active'); renderCalendar(); };
document.getElementById('calPrev').onclick=()=>{ shiftCalMonth(-1); };
document.getElementById('calNext').onclick=()=>{ shiftCalMonth(1); };

function shiftCalMonth(dir){
  if(calMode==='greg'){
    calViewDate = new Date(calViewDate.getFullYear(), calViewDate.getMonth()+dir, 1);
  } else {
    calViewDate = new Date(calViewDate.getTime() + dir*29.5*24*3600000);
  }
  renderCalendar();
}

function renderCalendar(preserveDetail){
  renderCalLegend();
  const dowEl = document.getElementById('calDow');
  dowEl.innerHTML = ['S','M','T','W','T','F','S'].map(d=>`<div class="cal-dow">${d}</div>`).join('');
  const grid = document.getElementById('calGrid');
  grid.innerHTML = '';
  if(!preserveDetail){
    document.getElementById('calDetail').style.display='none';
    calDetailDate = null;
  }

  if(calMode==='greg'){
    const y = calViewDate.getFullYear(), m = calViewDate.getMonth();
    document.getElementById('calMonthLabel').innerHTML = MON[m]+' '+y+'<span class="sub">'+(()=>{const a=gregorianToHijri(new Date(y,m,1)),b=gregorianToHijri(new Date(y,m+1,0));return a.month===b.month?a.monthName+' '+a.year+' AH':a.monthName+' – '+b.monthName+' '+b.year+' AH';})()+'</span>';
    const first = new Date(y,m,1);
    const startDow = first.getDay();
    const daysInMonth = new Date(y,m+1,0).getDate();
    for(let i=0;i<startDow;i++){ grid.appendChild(emptyCell()); }
    for(let d=1; d<=daysInMonth; d++){
      const date = new Date(y,m,d);
      grid.appendChild(dayCell(date));
    }
  } else {
    const hd = gregorianToHijri(calViewDate);
    document.getElementById('calMonthLabel').innerHTML = hd.monthName+' '+hd.year+'<span class="sub">Hijri</span>';
    // find first gregorian date corresponding to day 1 of this hijri month
    let probe = new Date(calViewDate);
    let cur = gregorianToHijri(probe);
    while(cur.day !== 1 || cur.month !== hd.month){
      probe = new Date(probe.getTime() - 24*3600000);
      cur = gregorianToHijri(probe);
      if (cur.month === hd.month && cur.day===1) break;
    }
    const monthStart = new Date(probe);
    const startDow = monthStart.getDay();
    for(let i=0;i<startDow;i++){ grid.appendChild(emptyCell()); }
    let d = new Date(monthStart);
    let count = 0;
    while(true){
      const h = gregorianToHijri(d);
      if(h.month !== hd.month || count>35) break;
      grid.appendChild(dayCell(new Date(d)));
      d = new Date(d.getTime()+24*3600000);
      count++;
    }
    const lastG = new Date(d.getTime()-24*3600000);
    document.getElementById('calMonthLabel').querySelector('.sub').textContent = monthStart.getMonth()===lastG.getMonth() ? MON[monthStart.getMonth()]+' '+monthStart.getFullYear() : MON[monthStart.getMonth()]+' – '+MON[lastG.getMonth()]+' '+lastG.getFullYear();
  }

  if(!preserveDetail){
    const todayCell = grid.querySelector('.cal-cell.today');
    if(todayCell) showDayDetail(new Date());
  }
}
function renderCalLegend(){
  const el = document.getElementById('calLegend'); if(!el) return;
  el.innerHTML = nafilOn() ? `<span><i class="lg-farz"></i> ${L({rur:'Farz', en:'Farz'})}</span><span><i class="lg-nafil"></i> ${L({rur:'Nafil', en:'Nafil'})}</span>` : '';
}
function emptyCell(){ const c=document.createElement('div'); c.className='cal-cell empty'; return c; }
function dayCell(date){
  const c = document.createElement('div');
  const isToday = dayKey(date)===dayKey(new Date());
  const rozaOn = !!state.roza[dayKey(date)];
  c.className = 'cal-cell'+(isToday?' today':'')+(rozaOn?' roza':'');
  const label = calMode==='greg' ? date.getDate() : gregorianToHijri(date).day;
  let dotsHtml = '<div class="cal-dots">';
  FIVE.forEach(p=>{
    const st = getStatus(date, p);
    const color = st==='green'?'var(--green)':st==='yellow'?'var(--yellow)':st==='red'?'var(--red)':'var(--line)';
    dotsHtml += `<span style="background:${color}"></span>`;
  });
  dotsHtml += '</div>';
  if(nafilOn()){
    dotsHtml += '<div class="cal-dots nafil">' + NAFIL_KEYS.map(k=>{ const st = getStatus(date, k); return `<span class="${st==='green'?'ok':st==='red'?'no':''}"></span>`; }).join('') + '</div>';
  }
  const rozaMark = rozaOn ? '<span class="cal-roza-mark">☪️</span>' : '';
  c.innerHTML = `${rozaMark}<div>${label}</div>${dotsHtml}`;
  c.onclick = ()=> showDayDetail(date);
  return c;
}
let calDetailDate = null;
function showDayDetail(date){
  calDetailDate = date;
  const det = document.getElementById('calDetail');
  det.style.display='block';
  const hd = gregorianToHijri(date);
  const icon = (k)=> (PRAYER_META[k] && PRAYER_META[k].icon) || '🕐';
  const now = new Date();
  const isFuture = !isSameDay(date, now) && date > now;
  const rozaOn = !!state.roza[dayKey(date)];
  if(det) det.classList.toggle('roza-on', rozaOn);
  let html = `<div style="display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:8px;">
    <div class="cal-dtxt">
      <div class="cal-dg">${DOW[date.getDay()]}, ${date.getDate()} ${MON[date.getMonth()]} ${date.getFullYear()}</div>
      <div class="cal-dh">${hd.day} ${hd.monthName} ${hd.year} AH</div>
    </div>
    <button id="calShareBtn" title="Share karein" style="flex:0 0 auto; width:28px; height:28px; border-radius:8px; border:1px solid var(--line); background:var(--card2); color:var(--text); font-size:14px; cursor:pointer; display:inline-flex; align-items:center; justify-content:center;">${SHARE_SVG}</button>
  </div>
  <div class="controlBar" style="border-top:1px solid var(--line); border-bottom:1px solid var(--line); margin:0 -12px 8px; padding:8px 12px;">
    <div class="controlCol">
      <span class="bulkLabel">Roza</span>
      <div class="roza-mini ${rozaOn?'on':''}${isFuture?' disabled':''}" id="calRozaBtn"><div class="roza-mini-knob"></div></div>
    </div>
    <div class="controlDivider"></div>
    <div class="controlCol bulkCol" id="calBulkCol">
      <span class="bulkLabel">5 Farz Namaz</span>
      <div class="bulkBtns${isFuture?' disabled':''}" id="calBulkBtns">
        <button class="bulk-btn bulk-green" id="calBulkGreen" title="Sab Padh Li">✓</button>
        <button class="bulk-btn bulk-yellow" id="calBulkYellow" title="Sab Qaza Padhi">~</button>
        <button class="bulk-btn bulk-red" id="calBulkRed" title="Sab Baaki Hai">⏳</button>
        <button class="bulk-btn bulk-clear" id="calBulkClear" title="Sab Clear Karein">↺</button>
        <button class="bulk-btn bulk-info" id="calBulkInfo" title="Buttons ka matlab">ⓘ</button>
      </div>
    </div>
  </div>`;
  const todaySched = isSameDay(date, now) ? buildSchedule(date) : null;
  FIVE.forEach(p=>{
    const st = getStatus(date,p);
    const pSched = todaySched && todaySched.find(x=>x.key===p);
    const notStarted = (pSched && now < pSched.start) || isFuture;
    html += `<div class="row">
      <span style="text-transform:capitalize">${icon(p)} ${p}</span>
      <div class="status-dots"${notStarted ? ' style="opacity:0.3; pointer-events:none;" title="Abhi shuru nahi hua"' : ''}>
        <button class="dot-btn ${st==='green'?'on-green':''}" data-prayer="${p}" data-set="green" title="Padh Li">✓</button>
        <button class="dot-btn ${st==='yellow'?'on-yellow':''}" data-prayer="${p}" data-set="yellow" title="Qaza Padhi">~</button>
        <button class="dot-btn ${st==='red'?'on-red':''}" data-prayer="${p}" data-set="red" title="Baaki Hai">⏳</button>
      </div>
    </div>`;
  });
  if(nafilOn()){
    const fullSched = buildSchedule(date);
    html += `<div class="cal-sec-title">🌙 ${L({rur:'Nafil Namaz', en:'Nafl Prayers'})}</div>`;
    NAFIL_KEYS.forEach(k=>{
      const st = getStatus(date, k);
      const ps = fullSched.find(x=>x.key===k);
      const notStarted = isFuture || (isSameDay(date, now) && ps && now < ps.start);
      html += `<div class="row">
        <span>${icon(k)} ${NAFIL_NAMES[k]}</span>
        <div class="status-dots nafil-dots"${notStarted ? ' style="opacity:0.3; pointer-events:none;" title="Abhi shuru nahi hua"' : ''}>
          <button class="dot-btn ${st==='green'?'on-green':''}" data-prayer="${k}" data-set="green" title="Padh Li">✓</button>
          <button class="dot-btn ${st==='red'?'on-red':''}" data-prayer="${k}" data-set="red" title="Nahi Padhi">✗</button>
        </div>
      </div>`;
    });
  }
  ensureZikrProfiles();
  const morningPf = state.tasbeeh.profiles.find(p=>p.id==='morning');
  const eveningPf = state.tasbeeh.profiles.find(p=>p.id==='evening');
  if(morningPf && eveningPf){
    const mDone = isZikrProfileComplete(date, morningPf);
    const eDone = isZikrProfileComplete(date, eveningPf);
    const mMarked = zikrDayMarkedBaaki(date, morningPf.id);
    const eMarked = zikrDayMarkedBaaki(date, eveningPf.id);
    const zikrDisabledAttr = isFuture ? ' style="opacity:0.3; pointer-events:none;" title="Abhi shuru nahi hua"' : '';
    html += `<div class="cal-sec-title">📿 Zikr / Tasbeeh</div>
      <div class="row">
        <span class="zikr-name-link" data-zprofile="morning" role="button" tabindex="0">🌅 Subah ke Azkar</span>
        <div style="display:flex; align-items:center; gap:8px;"${zikrDisabledAttr}>
          <div class="status-dots">
            <button class="dot-btn ${mDone?'on-green':''}" data-zp="morning" data-zd="done" title="Padh Liye">✓</button>
            <button class="dot-btn ${(!mDone && mMarked)?'on-red':''}" data-zp="morning" data-zd="baaki" title="Padhna Baaki Hai">⏳</button>
          </div>
          <button class="bulk-btn bulk-clear" data-zp="morning" data-zreset="1" title="Reset Karein" style="width:24px; height:24px; font-size:11px;">↺</button>
        </div>
      </div>
      <div class="row">
        <span class="zikr-name-link" data-zprofile="evening" role="button" tabindex="0">🌇 Shaam ke Azkar</span>
        <div style="display:flex; align-items:center; gap:8px;"${zikrDisabledAttr}>
          <div class="status-dots">
            <button class="dot-btn ${eDone?'on-green':''}" data-zp="evening" data-zd="done" title="Padh Liye">✓</button>
            <button class="dot-btn ${(!eDone && eMarked)?'on-red':''}" data-zp="evening" data-zd="baaki" title="Padhna Baaki Hai">⏳</button>
          </div>
          <button class="bulk-btn bulk-clear" data-zp="evening" data-zreset="1" title="Reset Karein" style="width:24px; height:24px; font-size:11px;">↺</button>
        </div>
      </div>`;
  }
  det.innerHTML = html;
  det.querySelector('#calShareBtn').onclick = ()=> openShareChooser(calDetailDate);
  const afterCalEdit = ()=>{ renderCalendar(true); showDayDetail(calDetailDate); renderHome(); };
  det.querySelector('#calRozaBtn').onclick = ()=>{
    if(isFuture) return;
    const k = dayKey(calDetailDate);
    state.roza[k] = !state.roza[k];
    saveState();
    /* The fill animation plays for the card when it's re-drawn */
    document.body.classList.add('roza-filling');
    setTimeout(()=>document.body.classList.remove('roza-filling'), 650);
    afterCalEdit();
  };
  det.querySelector('#calBulkInfo').onclick = showBulkInfoModal;
  det.querySelector('#calBulkGreen').onclick = ()=> bulkSetFive('green', calDetailDate, afterCalEdit);
  det.querySelector('#calBulkYellow').onclick = ()=> bulkSetFive('yellow', calDetailDate, afterCalEdit);
  det.querySelector('#calBulkRed').onclick = ()=> bulkSetFive('red', calDetailDate, afterCalEdit);
  det.querySelector('#calBulkClear').onclick = ()=> bulkClearFive(calDetailDate, afterCalEdit);
  det.querySelectorAll('.dot-btn').forEach(btn=>{
    btn.onclick = ()=>{
      if(isFuture) return;
      const prayer = btn.dataset.prayer, want = btn.dataset.set;
      const cur = getStatus(calDetailDate, prayer);
      const k = statusKey(calDetailDate, prayer);
      if(cur===want){ delete state.status[k]; markToast(prayer, want, true); }
      else{ state.status[k]=want; markToast(prayer, want, false); }
      saveState();
      renderCalendar(true);
      showDayDetail(calDetailDate);
      renderHome();
    };
  });
  det.querySelectorAll('[data-zp]').forEach(el=>{
    el.onclick = ()=>{
      if(isFuture) return;
      const pf = state.tasbeeh.profiles.find(p=>p.id===el.dataset.zp);
      if(!pf) return;
      const day = getZikrDay(calDetailDate, pf.id, true);
      if(el.dataset.zreset){
        pf.items.forEach(it=>{ day[it.id] = 0; });
        delete day.__marked;
        saveState();
        showToast(pf.name + ' reset ho gaya');
        showDayDetail(calDetailDate);
        return;
      }
      const wantDone = el.dataset.zd === 'done';
      pf.items.forEach(it=>{ day[it.id] = wantDone ? it.target : 0; });
      day.__marked = true;
      saveState();
      showToast(pf.name + ': ' + (wantDone ? 'Padh Liye' : 'Padhna Baaki Hai'));
      showDayDetail(calDetailDate);
    };
  });
  det.querySelectorAll('[data-zprofile]').forEach(el=>{
    el.onclick = ()=> openOverlay(()=>{ renderTasbeeh(); renderZikrProfile(el.dataset.zprofile); });
  });
}

/* ============================================================
   RAMZAN TAB
   ============================================================ */
function renderRamzan(){
  const now = new Date();
  const k = dayKey(now);
  const liveRamzan = gregorianToHijri(now).month===9;
  const rozaOn = liveRamzan && !!state.roza[k];
  document.getElementById('rozaSwitch').className = 'switch'+(rozaOn?' on':'');
  document.getElementById('rozaLabel').textContent = rozaOn ? 'Roza Rakha ✓' : 'Roza Rakhiye';

  document.getElementById('rozaSwitch').onclick = ()=>{
    state.roza[k] = !state.roza[k];
    saveState();
    renderRamzan();
  };

  const sched = buildSchedule(now);
  const listEl = document.getElementById('ramzanNamazList');
  listEl.innerHTML='';
  FIVE.forEach(p=>{
    const row = document.createElement('div');
    row.className='ramzan-card';
    row.style.margin='0 14px 8px';
    row.style.display='flex'; row.style.justifyContent='space-between'; row.style.alignItems='center'; row.style.padding='10px 14px';
    const st = getStatus(now,p);
    const icon = (PRAYER_META[p] && PRAYER_META[p].icon) || '🕐';
    const pSched = sched.find(x=>x.key===p);
    const notStarted = pSched && now < pSched.start;
    const dotsHtml = (notStarted || !liveRamzan) ? '' : `<div class="status-dots">
        <button class="dot-btn ${st==='green'?'on-green':''}" data-p="${p}" data-s="green" title="Padh Li">✓</button>
        <button class="dot-btn ${st==='yellow'?'on-yellow':''}" data-p="${p}" data-s="yellow" title="Qaza Padhi">~</button>
        <button class="dot-btn ${st==='red'?'on-red':''}" data-p="${p}" data-s="red" title="Baaki Hai">⏳</button>
      </div>`;
    row.innerHTML = `<span style="font-weight:700; font-size:13.5px; text-transform:capitalize; cursor:pointer;" data-info="${p}">${icon} ${p}</span>
      ${dotsHtml}`;
    row.querySelector('[data-info]').onclick = ()=> showInfoModal(p);
    listEl.appendChild(row);
  });
  const tk = 'tarabih_'+k;
  const tSt = state.tarabih[tk];
  const ishaRowR = sched.find(x=>x.key==='isha');
  const tarabihStarted = ishaRowR && now >= ishaRowR.start;
  const tDotsHtml = (tarabihStarted && liveRamzan) ? `<div class="status-dots">
      <button class="dot-btn ${tSt==='prayed'?'on-green':''}" data-t="prayed" title="Padhi Gayi">✓</button>
      <button class="dot-btn ${tSt==='qaza'?'on-yellow':''}" data-t="qaza" title="Qaza">~</button>
      <button class="dot-btn ${tSt==='pending'?'on-red':''}" data-t="pending" title="Baaki Hai">⏳</button>
    </div>` : '';
  const tRow = document.createElement('div');
  tRow.className='ramzan-card';
  tRow.style.margin='0 14px 8px';
  tRow.style.display='flex'; tRow.style.justifyContent='space-between'; tRow.style.alignItems='center'; tRow.style.padding='10px 14px';
  tRow.innerHTML = `<span style="font-weight:700; font-size:13.5px;">📿 Taraabih</span>${tDotsHtml}`;
  listEl.appendChild(tRow);

  listEl.querySelectorAll('.dot-btn').forEach(btn=>{
    if(btn.dataset.p){
      btn.onclick=()=>{
        const p=btn.dataset.p, want=btn.dataset.s;
        const kk = statusKey(now,p);
        const label = p.charAt(0).toUpperCase()+p.slice(1);
        if(state.status[kk]===want){ delete state.status[kk]; showToast(label+': Clear ho gaya'); }
        else{ state.status[kk]=want; showToast(label+': '+NAMAZ_STATUS_LABEL[want]); }
        saveState(); renderRamzan();
      };
    } else if(btn.dataset.t){
      btn.onclick=()=>{
        const want=btn.dataset.t;
        const label = 'Taraabih';
        if(state.tarabih[tk]===want){ state.tarabih[tk] = undefined; showToast(label+': Clear ho gaya'); }
        else{ state.tarabih[tk] = want; showToast(label+': '+(want==='prayed'?'Padhi Gayi':want==='qaza'?'Qaza':'Baaki Hai')); }
        saveState(); renderRamzan();
      };
    }
  });
}

