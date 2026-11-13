/* ============================================================
   STATS / REPORT
   ============================================================ */
let statsCal = 'greg'; // greg | hijri
let statsRange = 'month'; // month | year
let statsDate = new Date();

function hijriMonthDays(anchorDate){
  const hd = gregorianToHijri(anchorDate);
  let probe = new Date(anchorDate);
  let cur = gregorianToHijri(probe);
  while(cur.day !== 1 || cur.month !== hd.month){
    probe = new Date(probe.getTime() - 24*3600000);
    cur = gregorianToHijri(probe);
    if(cur.month===hd.month && cur.day===1) break;
  }
  const days=[]; let d=new Date(probe); let count=0;
  while(true){ const h=gregorianToHijri(d); if(h.month!==hd.month || count>35) break; days.push(new Date(d)); d=new Date(d.getTime()+86400000); count++; }
  return { days, label: hd.monthName+' '+hd.year+' AH' };
}
function hijriYearDays(anchorDate){
  const hd = gregorianToHijri(anchorDate);
  let probe = new Date(anchorDate);
  let cur = gregorianToHijri(probe);
  let guard = 0;
  while(!(cur.month===1 && cur.day===1) && guard<400){
    probe = new Date(probe.getTime() - 24*3600000);
    cur = gregorianToHijri(probe);
    guard++;
  }
  const days=[]; let d=new Date(probe); let count=0;
  while(count<360){ const h=gregorianToHijri(d); if(h.year!==hd.year) break; days.push(new Date(d)); d=new Date(d.getTime()+86400000); count++; }
  return { days, label: hd.year+' AH' };
}
function getStatsPeriod(){
  if(statsCal==='greg'){
    if(statsRange==='month'){
      const y=statsDate.getFullYear(), m=statsDate.getMonth();
      const daysInMonth = new Date(y,m+1,0).getDate();
      const days=[]; for(let d=1; d<=daysInMonth; d++) days.push(new Date(y,m,d));
      return { days, label: MON[m]+' '+y };
    } else {
      const y=statsDate.getFullYear();
      const days=[]; let d=new Date(y,0,1); while(d.getFullYear()===y){ days.push(new Date(d)); d=new Date(d.getTime()+86400000); }
      return { days, label: ''+y };
    }
  } else {
    return statsRange==='month' ? hijriMonthDays(statsDate) : hijriYearDays(statsDate);
  }
}
function shiftStatsPeriod(dir){
  if(statsCal==='greg'){
    if(statsRange==='month') statsDate = new Date(statsDate.getFullYear(), statsDate.getMonth()+dir, 1);
    else statsDate = new Date(statsDate.getFullYear()+dir, statsDate.getMonth(), 1);
  } else {
    if(statsRange==='month') statsDate = new Date(statsDate.getTime() + dir*29.5*24*3600000);
    else statsDate = new Date(statsDate.getTime() + dir*354*24*3600000);
  }
  renderStats();
}
/* Last seven days of the daily goal, shown as its own card in Safar-e-Taraqqi */
/* Streak = days in a row with all five farz marked prayed. Today only counts once it is complete, but never breaks the streak early. */
function dayAllPrayed(d){ return FIVE.every(p=>getStatus(d,p) === 'green'); }
function streakInfo(){
  const t = new Date(); t.setHours(0,0,0,0);
  let best = 0, run = 0;
  for(let i=0; i<400; i++){ const d = new Date(t); d.setDate(d.getDate() - i); if(dayAllPrayed(d)){ run++; if(run > best) best = run; } else run = 0; }
  let cur = 0; const d0 = new Date(t); if(!dayAllPrayed(d0)) d0.setDate(d0.getDate() - 1);
  for(let i=0; i<400; i++){ const d = new Date(d0); d.setDate(d.getDate() - i); if(dayAllPrayed(d)) cur++; else break; }
  return { cur, best };
}
function weekSummaryHtml(){
  const L7 = ['S','M','T','W','T','F','S'], days = [], per = {}; FIVE.forEach(p=>per[p]=0);
  let total = 0;
  for(let i=6; i>=0; i--){
    const d = new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate() - i);
    const n = FIVE.filter(p=>getStatus(d,p) === 'green').length;
    FIVE.forEach(p=>{ if(getStatus(d,p) !== 'green' && i > 0) per[p]++; });
    total += n; days.push({ d, n, today: i === 0 });
  }
  const { cur, best } = streakInfo();
  const weak = FIVE.slice().sort((a,b)=>per[b]-per[a])[0], weakN = per[weak];
  return `<div class="ramzan-card" style="margin:0 14px 12px;">
    <div class="streak-top"><div class="streak-big">🔥 <b>${cur}</b><small>${L({rur:'din ki lagataar', en:'day streak'})}</small></div><div class="streak-best">${L({rur:'Sabse lambi', en:'Best'})}: <b>${best}</b></div></div>
    <div style="font-size:13px; font-weight:800; margin:12px 0 8px;">${L({rur:'Is hafte ka khulasa', en:'This week at a glance'})} · ${total}/35</div>
    <div class="wk-bars">${days.map(x=>`<div class="wk-col ${x.today?'today':''}"><div class="wk-bar"><i style="height:${x.n/5*100}%"></i></div><small>${x.n}</small><small>${L7[x.d.getDay()]}</small></div>`).join('')}</div>
    ${weakN > 0 ? `<div class="streak-tip">${(PRAYER_META[weak]&&PRAYER_META[weak].icon)||''} ${L({rur:`${weak.charAt(0).toUpperCase()+weak.slice(1)} is hafte ${weakN} baar chhooti. Us par khaas dhyaan dein.`, en:`${weak.charAt(0).toUpperCase()+weak.slice(1)} was missed ${weakN} time${weakN>1?'s':''} this week. Give it extra care.`})}</div>` : (total >= 35 ? `<div class="streak-tip">${L({rur:'MashaAllah! Poore hafte ki saari namazein.', en:'MashaAllah! Every prayer this week.'})}</div>` : '')}
  </div>`;
}
function goalWeekCardHtml(){
  const days = [];
  for(let i=6; i>=0; i--){
    const d = new Date(); d.setDate(d.getDate() - i);
    const tasks = goalTasksFor(d);
    days.push({ d, done: tasks.filter(t=>t.done).length, total: tasks.length, today: i===0 });
  }
  const L7 = ['S','M','T','W','T','F','S'];
  return `<div class="ramzan-card" style="margin:0 14px 12px;">
    <div style="font-size:13px; font-weight:800; margin-bottom:10px;">${L({rur:'Rozana Hadaf: pichle 7 din', en:'Daily Goal: last 7 days'})}</div>
    <div class="goal-week" style="margin-top:0;">${days.map(x=>`<div class="goal-day ${x.done===x.total?'ok':''} ${x.today?'today':''}"><i></i><small>${L7[x.d.getDay()]}</small><small style="font-weight:600;">${x.done}/${x.total}</small></div>`).join('')}</div>
  </div>`;
}
/* Counts roll up from 0 when shown (after the English layer has translated the text) */
function rollNumbers(root, sel){
  setTimeout(()=>{
    (root || document).querySelectorAll(sel).forEach(el=>{
      const text = el.textContent, m = text.match(/\d+/);
      if(!m) return;
      const target = +m[0]; if(target < 2) return;
      let k = 0;
      const t = setInterval(()=>{
        k++;
        if(!el.isConnected){ clearInterval(t); return; }
        if(k >= 12){ el.textContent = text; clearInterval(t); return; }
        const e = 1 - Math.pow(1 - k/12, 3);
        el.textContent = text.replace(m[0], String(Math.round(target * e)));
      }, 40);
    });
  }, 90);
}
function renderStats(){
  document.getElementById('detailTitle').textContent = 'Safar-e-Taraqqi';
  const { days, label } = getStatsPeriod();
  const today = new Date(); today.setHours(0,0,0,0);
  const pastDays = days.filter(d=>d<=today);

  const farzCount = {}; FIVE.forEach(p=> farzCount[p] = {green:0, yellow:0, red:0});
  let allFiveDays = 0, rozaDays = 0;
  pastDays.forEach(d=>{
    let allGreen = true;
    FIVE.forEach(p=>{
      const st = getStatus(d,p);
      if(st) farzCount[p][st]++;
      if(st!=='green') allGreen = false;
    });
    if(allGreen) allFiveDays++;
    if(state.roza[dayKey(d)]) rozaDays++;
  });
  let totalGreen=0, totalYellow=0, totalRed=0;
  FIVE.forEach(p=>{ totalGreen+=farzCount[p].green; totalYellow+=farzCount[p].yellow; totalRed+=farzCount[p].red; });
  const totalPossible = pastDays.length*5;

  const icon = (k)=> (PRAYER_META[k] && PRAYER_META[k].icon) || '🕐';
  function topPrayers(field){
    let max = 0;
    FIVE.forEach(p=>{ if(farzCount[p][field]>max) max = farzCount[p][field]; });
    if(max===0) return null;
    const names = FIVE.filter(p=>farzCount[p][field]===max).map(p=>icon(p)+' '+p.charAt(0).toUpperCase()+p.slice(1));
    return names.join(', ');
  }
  const highestPrayed = topPrayers('green');
  const highestQaza = topPrayers('yellow');
  const highestMissed = topPrayers('red');
  const pct = totalPossible>0 ? Math.round(totalGreen/totalPossible*100) : 0;

  document.getElementById('detailBody').innerHTML = `
    <div class="detail-actions" style="justify-content:flex-end;">
      <button class="act-btn" id="statsShareBtn" title="Share karein">${SHARE_SVG}</button>
    </div>
    ${weekSummaryHtml()}
    ${goalWeekCardHtml()}
    <div class="cal-toggle" style="padding:0 0 8px;">
      <button id="statsGregBtn" class="${statsCal==='greg'?'active':''}">Gregorian</button>
      <button id="statsHijriBtn" class="${statsCal==='hijri'?'active':''}">Hijri</button>
    </div>
    <div class="cal-toggle" style="padding:0 0 14px;">
      <button id="statsMonthBtn" class="${statsRange==='month'?'active':''}">Maahana</button>
      <button id="statsYearBtn" class="${statsRange==='year'?'active':''}">Saalana</button>
    </div>
    <div class="cal-header" style="padding:0 0 14px; border:none;">
      <button id="statsPrev">‹</button>
      <div class="month-label">${label}</div>
      <button id="statsNext">›</button>
    </div>

    <div class="ramzan-card" style="margin:0 0 14px; text-align:center;">
      <div style="font-size:32px; font-weight:800; color:var(--accentInk);">${pct}%</div>
      <div style="font-size:12px; color:var(--sub); margin-top:2px;">Farz Namaz waqt par mukammal (${totalGreen}/${totalPossible})</div>
    </div>

    <div class="ramzan-card" style="margin:0 0 14px;">
      <div class="cal-detail-row-title" style="font-size:12.5px; color:var(--sub); margin-bottom:10px;">Farz Namaz ka Jaiza</div>
      ${FIVE.map(p=>{
        const c = farzCount[p]; const total = c.green+c.yellow+c.red;
        const w = total>0 ? Math.round(c.green/Math.max(1,pastDays.length)*100) : 0;
        return `<div style="display:flex; align-items:center; gap:8px; margin-bottom:10px;">
          <span style="width:80px; font-size:12.5px; font-weight:600; text-transform:capitalize;">${icon(p)} ${p}</span>
          <div style="flex:1; height:8px; background:var(--meterBg); border-radius:4px; overflow:hidden;"><div style="width:${w}%; height:100%; background:var(--green);"></div></div>
          <span style="width:56px; text-align:right; font-size:11px; color:var(--sub);">${c.green}/${pastDays.length}</span>
        </div>`;
      }).join('')}
    </div>

    <div class="ramzan-card" style="margin:0 0 14px;">
      <div class="cal-detail-row-title" style="font-size:12.5px; color:var(--sub); margin-bottom:10px;">🛐 Namaz ka Jaiza</div>
      <div class="stats-row"><span>🏆 Sabse Zyada Padhi Gayi</span><b>${highestPrayed || '-'}</b></div>
      <div class="stats-row"><span>〰️ Sabse Zyada Qaza</span><b>${highestQaza || '-'}</b></div>
      <div class="stats-row"><span>⚠️ Sabse Zyada Chhooti</span><b>${highestMissed || '-'}</b></div>
      <div class="stats-row"><span>✅ Saare 5 Farz wale din</span><b>${allFiveDays} / ${pastDays.length}</b></div>
      <div class="stats-row"><span>🔁 Qaza padhi gayi</span><b>${pastDays.reduce((a,d)=> a + qazaDoneOn(d), 0)}</b></div>
      <div class="stats-row"><span>⏳ Qaza abhi baaki</span><b>${qazaTotal()}</b></div>
    </div>

    ${(()=>{
      ensureZikrProfiles();
      const morning = state.tasbeeh.profiles.find(p=>p.id==='morning');
      const evening = state.tasbeeh.profiles.find(p=>p.id==='evening');
      if(!morning || !evening) return '';
      let mDone=0, eDone=0;
      pastDays.forEach(d=>{
        if(isZikrProfileComplete(d, morning)) mDone++;
        if(isZikrProfileComplete(d, evening)) eDone++;
      });
      return `<div class="ramzan-card" style="margin:0 0 14px;">
        <div class="cal-detail-row-title" style="font-size:12.5px; color:var(--sub); margin-bottom:10px;">📿 Azkar ka Jaiza</div>
        <div class="stats-row"><span>🌄 Subah Azkar mukammal din</span><b>${mDone} / ${pastDays.length}</b></div>
        <div class="stats-row"><span>🌉 Shaam Azkar mukammal din</span><b>${eDone} / ${pastDays.length}</b></div>
      </div>`;
    })()}

    <div class="ramzan-card" style="margin:0 0 14px;">
      <div class="cal-detail-row-title" style="font-size:12.5px; color:var(--sub); margin-bottom:10px;">☪️ Roza ka Jaiza</div>
      <div class="stats-row"><span>🌙 Roza rakhe gaye din</span><b>${rozaDays}</b></div>
    </div>


    ${(()=>{
      const t0 = days[0].getTime(), t1 = days[days.length-1].getTime() + 86400000;
      const logs = (state.quizLog||[]).filter(x=>x.t>=t0 && x.t<t1);
      const played = logs.length;
      const asked = logs.reduce((a,x)=>a+x.total,0);
      const right = logs.reduce((a,x)=>a+x.score,0);
      const acc = asked>0 ? Math.round(right/asked*100) : 0;
      const best = played ? Math.max(...logs.map(x=>Math.round(x.score/x.total*100))) : 0;
      return `<div class="ramzan-card" style="margin:0 0 14px;">
        <div class="cal-detail-row-title" style="font-size:12.5px; color:var(--sub); margin-bottom:10px;">🧠 Quiz ka Jaiza</div>
        <div class="stats-row"><span>🎮 Quiz khele gaye</span><b>${played}</b></div>
        <div class="stats-row"><span>☑️ Sahi jawab</span><b>${right} / ${asked}</b></div>
        <div class="stats-row"><span>🎯 Durustgi</span><b>${played ? acc+'%' : '-'}</b></div>
        <div class="stats-row"><span>🎖️ Sabse behtar nateeja</span><b>${played ? best+'%' : '-'}</b></div>
      </div>`;
    })()}

    ${(()=>{
      const total = KHAAS_SHABD.length;
      const ws = state.wordStatus || {};
      const yaad = KHAAS_SHABD.filter(w=>ws[w.tr]==='known').length;
      const baki = KHAAS_SHABD.filter(w=>ws[w.tr]==='learning').length;
      const w = Math.round(yaad/total*100);
      return `<div class="ramzan-card" style="margin:0 0 14px;">
        <div class="cal-detail-row-title" style="font-size:12.5px; color:var(--sub); margin-bottom:10px;">📚 Lafz ka Jaiza (Khaas Shabd)</div>
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:10px;">
          <div style="flex:1; height:8px; background:var(--meterBg); border-radius:4px; overflow:hidden;"><div style="width:${w}%; height:100%; background:var(--green);"></div></div>
          <span style="font-size:11px; color:var(--sub);">${yaad}/${total}</span>
        </div>
        <div class="stats-row"><span>📗 Lafz yaad ho gaye</span><b>${yaad}</b></div>
        <div class="stats-row"><span>📝 Yaad karna baaki</span><b>${baki}</b></div>
        <div class="stats-row"><span>🆕 Abhi shuru nahi kiye</span><b>${total-yaad-baki}</b></div>
      </div>`;
    })()}


    ${(()=>{
      const ns = computeStreak(), as = azkarStreak(), qs = quizStreak(), ls = learnStreak();
      const row = (icon, label, sub, val)=> `<div class="stats-row"><span>${icon} ${label}<span class="stat-sub">${sub}</span></span><b>${val} din</b></div>`;
      const block = (icon, bestIcon, label, sub, st)=>
        row(icon, label+' ki Paabandi', 'Lagatar din jab '+sub, st.cur) +
        row(bestIcon, 'Sabse Lambi '+label+' Paabandi', 'Ab tak ke sabse zyada lagatar din', st.best);
      return `<div class="ramzan-card" style="margin:0 0 14px;">
        <div class="cal-detail-row-title" style="font-size:12.5px; color:var(--sub); margin-bottom:10px;">🔥 Paabandi</div>
        ${(()=>{ const tt = goalTasksFor(new Date()), dn = tt.filter(t=>t.done).length; return `<div class="stats-row"><span>🎯 Aaj ka Hadaf<span class="stat-sub">aaj ke ${tt.length} kaam mein se kitne mukammal</span></span><b>${dn}/${tt.length}</b></div>`; })()}
        ${block('🕋','🥇','Namaz','paanchon Farz waqt par padhe', ns.current===undefined?ns:{cur:ns.current,best:ns.best})}
        ${block('🌿','🥈','Azkar','Subah aur Shaam dono azkar mukammal kiye', as)}
        ${block('🎲','🥉','Quiz','kam az kam ek quiz khela', qs)}
        ${block('✍️','🏅','Lafz','koi lafz mark kiya ya lafz ka quiz kiya', ls)}
        ${block('🎯','🏆','Hadaf','aaj ki hadaf ke sab kaam mukammal kiye', hadafStreak())}
      </div>`;
    })()}
  `;
  rollNumbers(document.getElementById('detailBody'), '.stats-row b, .goal-day small:last-child');
  document.getElementById('statsGregBtn').onclick = ()=>{ statsCal='greg'; renderStats(); };
  document.getElementById('statsHijriBtn').onclick = ()=>{ statsCal='hijri'; renderStats(); };
  document.getElementById('statsMonthBtn').onclick = ()=>{ statsRange='month'; renderStats(); };
  document.getElementById('statsYearBtn').onclick = ()=>{ statsRange='year'; renderStats(); };
  document.getElementById('statsPrev').onclick = ()=> shiftStatsPeriod(-1);
  document.getElementById('statsNext').onclick = ()=> shiftStatsPeriod(1);
  document.getElementById('statsShareBtn').onclick = ()=>{
    const t0 = days[0].getTime(), t1 = days[days.length-1].getTime() + 86400000;
    const logs = (state.quizLog||[]).filter(x=>x.t>=t0 && x.t<t1);
    const played = logs.length;
    const asked = logs.reduce((a,x)=>a+x.total,0);
    const right = logs.reduce((a,x)=>a+x.score,0);
    const acc = asked>0 ? Math.round(right/asked*100) : 0;
    const total = KHAAS_SHABD.length;
    const ws = state.wordStatus || {};
    const yaad = KHAAS_SHABD.filter(w=>ws[w.tr]==='known').length;
    const ns = computeStreak();
    const lines = [
      `Farz Namaz waqt par: ${pct}% (${totalGreen}/${totalPossible})`,
      `Saare 5 Farz wale din: ${allFiveDays} / ${pastDays.length}`,
      `Roza rakhe gaye din: ${rozaDays}`,
      `Quiz khele gaye: ${played}${played?' (Durustgi '+acc+'%)':''}`,
      `Lafz yaad ho gaye: ${yaad} / ${total}`,
      `Namaz ki Paabandi: ${ns.current} din (sabse lambi ${ns.best})`,
    ];
    openCardShareChooser({ kind:'Safar-e-Taraqqi', title:'Mera Safar-e-Taraqqi', sub:label, body:lines.join('\n') });
  };
}

/* ============================================================
   QIBLA DIRECTION
   ============================================================ */
const KAABA = { lat: 21.4225, lon: 39.8262 };
function qiblaBearing(lat, lon){
  const toRad = d=>d*Math.PI/180, toDeg = r=>r*180/Math.PI;
  const phi1 = toRad(lat), phi2 = toRad(KAABA.lat);
  const dLambda = toRad(KAABA.lon - lon);
  const y = Math.sin(dLambda)*Math.cos(phi2);
  const x = Math.cos(phi1)*Math.sin(phi2) - Math.sin(phi1)*Math.cos(phi2)*Math.cos(dLambda);
  return (toDeg(Math.atan2(y,x)) + 360) % 360;
}
let qiblaOrientHandler = null;
function stopQiblaCompass(){
  if(qiblaOrientHandler){
    window.removeEventListener('deviceorientationabsolute', qiblaOrientHandler);
    window.removeEventListener('deviceorientation', qiblaOrientHandler);
    qiblaOrientHandler = null;
  }
}
function renderQibla(){
  stopQiblaCompass();
  document.getElementById('detailTitle').textContent = 'Qibla ka Rukh';
  const loc = state.location;
  const bearing = qiblaBearing(loc.lat, loc.lon);
  document.getElementById('detailBody').innerHTML = `
    <div style="text-align:center; padding:10px 0 4px;">
      <div style="font-size:12.5px; color:var(--sub); margin-bottom:16px;">📍 ${loc.name} se Khana Kaaba ki taraf</div>
      <div style="position:relative; width:240px; height:240px; margin:0 auto;">
        <svg id="qiblaDial" viewBox="0 0 200 200" style="width:100%; height:100%; transition:transform .15s ease-out;">
          <circle cx="100" cy="100" r="96" fill="var(--card2)" stroke="var(--line)" stroke-width="2"/>
          <text x="100" y="20" text-anchor="middle" font-size="14" font-weight="700" fill="var(--sub)">N</text>
          <text x="100" y="190" text-anchor="middle" font-size="12" fill="var(--sub)">S</text>
          <text x="14" y="105" text-anchor="middle" font-size="12" fill="var(--sub)">W</text>
          <text x="186" y="105" text-anchor="middle" font-size="12" fill="var(--sub)">E</text>
          <g id="qiblaNeedle" style="transform-origin:100px 100px;">
            <polygon points="100,26 90,108 100,96 110,108" fill="var(--accent)"/>
            <text x="100" y="46" text-anchor="middle" font-size="20">🕋</text>
          </g>
          <circle cx="100" cy="100" r="5" fill="var(--accent)"/>
        </svg>
      </div>
      <div style="font-size:13px; color:var(--text); margin-top:16px; font-weight:700;">Qibla: ${Math.round(bearing)}° (Shumaal se) · Kaaba ${Math.round(qiblaDistanceKm(loc.lat, loc.lon)).toLocaleString('en-US')} km door</div>
      <div id="qiblaOff" class="qibla-off" aria-live="polite"></div>
      <div id="qiblaStatus" style="font-size:11.5px; color:var(--sub); margin-top:6px; line-height:1.6;">
        Compass on karne ke liye button dabayein, ya phone ko flat rakh kar upar diya hua angle khud North se naapein.
      </div>
      <button id="qiblaCompassBtn" style="margin-top:14px; padding:10px 20px; border-radius:10px; border:1px solid var(--line); background:var(--accent); color:var(--fardText); font-size:13px; font-weight:700; cursor:pointer;">🧭 Compass On Karein</button>
    </div>
  `;
  const needle = document.getElementById('qiblaNeedle');
  const statusEl = document.getElementById('qiblaStatus');
  const dial = document.getElementById('qiblaDial');
  needle.style.transform = `rotate(${bearing}deg)`;

  /* smoothed heading (circular low-pass), "off by N°" readout, green + vibration when aligned, calibration hint if readings are poor or missing */
  const offEl = document.getElementById('qiblaOff'), svg = document.getElementById('qiblaDial');
  let smooth = null, wasAligned = false, lastEvt = 0, calTimer = null, jitter = [];
  const angDiff = (a, b)=> ((a - b + 540) % 360) - 180;
  const onHeading = (raw, acc)=>{
    lastEvt = Date.now();
    smooth = smooth === null ? raw : (smooth + angDiff(raw, smooth) * 0.25 + 360) % 360;
    jitter.push(Math.abs(angDiff(raw, smooth))); if(jitter.length > 25) jitter.shift();
    dial.style.transition = 'none'; dial.style.transform = `rotate(${-smooth}deg)`;
    needle.style.transform = `rotate(${bearing}deg)`;
    const off = angDiff(bearing, smooth);               // how far to turn: + is clockwise (right)
    const ok = Math.abs(off) <= 4;
    svg.classList.toggle('aligned', ok);
    offEl.className = 'qibla-off' + (ok ? ' ok' : '');
    offEl.textContent = ok ? '✅ Aap Qibla ki taraf hain' : (off > 0 ? 'Daayein ghoomein ' : 'Baayein ghoomein ') + Math.round(Math.abs(off)) + '°';
    if(ok && !wasAligned){ try{ navigator.vibrate && navigator.vibrate([30, 40, 30]); }catch(e){} }
    wasAligned = ok;
    const poor = (acc != null && acc > 25) || (jitter.length > 15 && jitter.reduce((x, y)=>x + y, 0) / jitter.length > 9);
    statusEl.innerHTML = poor
      ? '⚠️ Compass theek se calibrate nahi lag raha. Phone ko hawa mein <b>8 (aath) ke shakal mein</b> kuch baar ghumayein, phir lohe/magnet/chhat ke paas se hat kar dekhein.'
      : 'Phone ko seedha (flat) pakdein, 🕋 wahi Qibla ki taraf ishara karega.';
  };
  document.getElementById('qiblaCompassBtn').onclick = async ()=>{
    const start = ()=>{
      qiblaOrientHandler = (e)=>{
        let heading = (typeof e.webkitCompassHeading === 'number') ? e.webkitCompassHeading : (e.alpha != null ? (360 - e.alpha) % 360 : null);
        if(heading == null) return;
        onHeading(heading, typeof e.webkitCompassAccuracy === 'number' && e.webkitCompassAccuracy >= 0 ? e.webkitCompassAccuracy : null);
      };
      const evt = ('ondeviceorientationabsolute' in window) ? 'deviceorientationabsolute' : 'deviceorientation';
      window.addEventListener(evt, qiblaOrientHandler);
      document.getElementById('qiblaCompassBtn').textContent = '🧭 Compass chalu hai';
      clearTimeout(calTimer);
      calTimer = setTimeout(()=>{ if(!lastEvt) statusEl.textContent = 'Compass se koi reading nahi mil rahi. Phone ki Settings mein Location/Motion sensors on karein, ya upar diya hua angle khud North se naapein.'; }, 3000);
    };
    if(typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function'){
      try{
        const res = await DeviceOrientationEvent.requestPermission();
        if(res==='granted') start();
        else statusEl.textContent = 'Compass ki ijaazat nahi mili. Manually angle ka istemal karein.';
      }catch(e){ statusEl.textContent = 'Compass is device par uplabdh nahi hai.'; }
    } else if('DeviceOrientationEvent' in window){
      start();
    } else {
      statusEl.textContent = 'Is browser/device mein compass sensor uplabdh nahi hai.';
    }
  };
  if('DeviceOrientationEvent' in window && typeof DeviceOrientationEvent.requestPermission !== 'function') document.getElementById('qiblaCompassBtn').click(); // Android: no permission prompt, so start at once
}
/* great-circle distance to the Kaaba */
function qiblaDistanceKm(lat, lon){
  const R = 6371, r = x=>x * Math.PI / 180, kl = 21.4225, ko = 39.8262;
  const dLat = r(kl - lat), dLon = r(ko - lon);
  const a = Math.sin(dLat/2)**2 + Math.cos(r(lat)) * Math.cos(r(kl)) * Math.sin(dLon/2)**2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/* ============================================================
   DATA BACKUP, export/import the whole localStorage state as JSON
   ============================================================ */
function renderBackup(){
  document.getElementById('detailTitle').textContent = 'Data Backup';
  document.getElementById('detailBody').innerHTML = `
    <div class="backup-note">Aapka poora data (namaz status, roza, tasbeeh, quiz scores, yaad kiye lafz, pasandeeda, settings) sirf isi phone/browser mein save hota hai. Backup file bana kar rakh lein taake data delete/lost na ho, ya naye phone mein restore kar sakein.</div>
    <button class="backup-btn" id="backupExportBtn">⬇️ Backup Banayein (Export)</button>
    <button class="backup-btn secondary" id="backupImportBtn">⬆️ Backup Restore Karein (Import)</button>
    <input type="file" id="backupFileInput" accept="application/json" style="display:none;">
    <div class="backup-note" id="backupMsg"></div>
  `;
  document.getElementById('backupExportBtn').onclick = ()=>{
    state.lastBackup = Date.now(); state.backupDataCount = backupDataCount(); saveState();
    const payload = { app:'waqt24', schema: STATE_VERSION, exportedAt: new Date().toISOString(), state, hijriOffset: hijriOffset() };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const d = new Date();
    a.href = url;
    a.download = `waqt24-backup-${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
    document.getElementById('backupMsg').textContent = 'Backup file download ho gayi hai.';
  };
  const fileInput = document.getElementById('backupFileInput');
  document.getElementById('backupImportBtn').onclick = ()=> fileInput.click();
  fileInput.onchange = ()=>{
    const file = fileInput.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = ()=>{
      try{
        const payload = JSON.parse(reader.result);
        const incoming = payload && payload.state ? payload.state : payload;
        if(!incoming || typeof incoming !== 'object') throw new Error('bad file');
        const newer = (parseInt(incoming.schema) || 0) > STATE_VERSION;
        state = Object.assign(state, migrateState(incoming));
        if(payload && payload.hijriOffset!==undefined){ try{ localStorage.setItem('hijriOffset', String(payload.hijriOffset)); }catch(e){} hijriOffset._v = undefined; }
        saveState();
        renderHome(); renderCalendar(); updateRamzanLock(); updateQazaBadge();
        document.getElementById('backupMsg').textContent = '✅ Data restore ho gaya hai.' + (newer ? ' (Yeh backup naye version ka hai, kuch nayi settings ignore hui hongi.)' : '');
      }catch(e){
        document.getElementById('backupMsg').textContent = '❌ Yeh file valid backup nahi hai.';
      }
    };
    reader.readAsText(file);
  };
}

/* ============================================================
   TASBEEH COUNTER
   ============================================================ */
const TASBEEH_TARGETS = [33, 34, 99, 100];
const TASBEEH_COLORS = ['#3fae6a','#3a9bd9','#d4a72c','#c85a4a','#a074e0','#e0729a'];
const TASBEEH_SHAPES = ['●','◆','■','★'];
const TASBEEH_DESIGNS = [ {id:'tap', label:'🔘 Button'}, {id:'beadsH', label:'📿 Beads ↔'}, {id:'beadsV', label:'📿 Beads ↕'} ];
/* Quick zikr presets: tap one to set the label and target and start from zero. Tasbeeh-e-Fatima runs 33 + 33 + 34 in a row. */
const TASBEEH_PRESETS = [
  { n:'SubhanAllah', ar:'سُبْحَانَ اللّٰهِ', t:33 }, { n:'Alhamdulillah', ar:'اَلْحَمْدُ لِلّٰهِ', t:33 }, { n:'Allahu Akbar', ar:'اللّٰهُ أَكْبَرُ', t:34 },
  { n:'La ilaha illallah', ar:'لَا إِلٰهَ إِلَّا اللّٰهُ', t:100 }, { n:'Astaghfirullah', ar:'أَسْتَغْفِرُ اللّٰهَ', t:100 }, { n:'Durood Sharif', ar:'اَللّٰهُمَّ صَلِّ عَلٰى مُحَمَّدٍ', t:100 },
];
const TASBEEH_FATIMA = [0, 1, 2];
function tasbeehLog(){ if(!state.tasbeeh.log) state.tasbeeh.log = {}; return state.tasbeeh.log; }
function tasbeehHistoryHtml(){
  const log = tasbeehLog(), days = [];
  for(let i = 6; i >= 0; i--){ const d = new Date(); d.setDate(d.getDate() - i); days.push({ d, n: log[dayKey(d)] || 0 }); }
  const max = Math.max(1, ...days.map(x=>x.n)), total = days.reduce((a, x)=>a + x.n, 0);
  return `<div class="ts-hist"><div class="ts-hist-head"><b>${L({rur:'Aaj', en:'Today'})}: ${days[6].n}</b><span>${L({rur:'7 din', en:'7 days'})}: ${total}</span></div><div class="ts-bars">${days.map(x=>`<div class="ts-bar"><i style="height:${Math.round(x.n / max * 100)}%"></i><small>${['S','M','T','W','T','F','S'][x.d.getDay()]}</small></div>`).join('')}</div></div>`;
}
function tasbeehApplyPreset(i){
  const pr = TASBEEH_PRESETS[i], t = state.tasbeeh; t.label = pr.n; t.labelAr = pr.ar; t.target = pr.t; t.count = 0; t.seq = null; saveState(); renderTasbeeh();
}
function tasbeehStartFatima(){
  const t = state.tasbeeh; t.seq = 0; const pr = TASBEEH_PRESETS[0]; t.label = pr.n; t.labelAr = pr.ar; t.target = 33; t.count = 0; saveState(); renderTasbeeh();
  showToast(L({rur:'Tasbeeh-e-Fatima: 33 + 33 + 34', en:'Tasbeeh of Fatima: 33 + 33 + 34'}));
}
let tasbeehAudioCtx = null;
function tasbeehBeep(){
  if(!state.tasbeeh.sound) return;
  try{
    if(!tasbeehAudioCtx) tasbeehAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const ctx = tasbeehAudioCtx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + 0.12);
  }catch(e){}
}
function tasbeehTick(){
  const t = state.tasbeeh;
  t.count++;
  const lg = tasbeehLog(), dk = dayKey(new Date()); lg[dk] = (lg[dk] || 0) + 1;
  Object.keys(lg).forEach(x=>{ const [y, m, dd] = x.split('-').map(Number); if(Date.now() - new Date(y, m - 1, dd).getTime() > 120 * 86400000) delete lg[x]; });
  saveState();
  if(t.vibrate !== false && navigator.vibrate) navigator.vibrate(t.count % t.target === 0 ? [40,40,80] : 15);
  if(t.seq !== null && t.seq !== undefined && t.count >= t.target){
    const next = t.seq + 1;
    setTimeout(()=>{
      if(next >= TASBEEH_FATIMA.length){ t.seq = null; saveState(); showToast(L({rur:'Mashallah! Tasbeeh-e-Fatima mukammal 🎉', en:'Mashallah! Tasbeeh of Fatima complete 🎉'})); renderTasbeeh(); return; }
      const pr = TASBEEH_PRESETS[TASBEEH_FATIMA[next]]; t.seq = next; t.label = pr.n; t.labelAr = pr.ar; t.target = pr.t; t.count = 0; saveState(); renderTasbeeh();
    }, 650);
  }
  tasbeehBeep();
  const countEl = document.querySelector('.tasbeeh-count');
  if(countEl){
    countEl.textContent = t.count;
    countEl.classList.remove('bump', 'hit'); void countEl.offsetWidth;
    countEl.classList.add(t.count % t.target === 0 ? 'hit' : 'bump');
  }
  const beadCount = 11;
  const activeIdx = t.count % beadCount;
  document.querySelectorAll('.beads-track .bead').forEach((b,i)=> b.classList.toggle('active', i===activeIdx));
}
function setupBeadsDrag(track, isH, onTick){
  const tick = onTick || tasbeehTick;
  let activePointerId = null, last = null, dist = 0;
  const threshold = 42; // a deliberate finger-width swipe per bead, avoids over-sensitive counting
  const getPos = (e)=> isH ? e.clientX : e.clientY;
  track.addEventListener('pointerdown', (e)=>{
    if(activePointerId !== null) return; // ignore a second finger while one is already dragging
    activePointerId = e.pointerId;
    track.setPointerCapture(e.pointerId);
    last = getPos(e); dist = 0;
    e.preventDefault();
  });
  track.addEventListener('pointermove', (e)=>{
    if(e.pointerId !== activePointerId || last===null) return;
    e.preventDefault();
    const pos = getPos(e);
    // moving right-to-left (H) or bottom-to-top (V) both mean the coordinate decreases
    const delta = last - pos;
    last = pos;
    if(delta>0){
      dist += delta;
      if(dist >= threshold){ dist -= threshold; tick(); } // at most one bead per move event, however far it jumped
    } else if(delta<0){
      dist = Math.max(0, dist + delta*0.5); // reverse wobble bleeds off progress instead of reversing count
    }
  });
  const end = (e)=>{
    if(e && e.pointerId!==undefined && e.pointerId!==activePointerId) return;
    activePointerId = null; last = null; dist = 0;
  };
  track.addEventListener('pointerup', end);
  track.addEventListener('pointercancel', end);
  track.addEventListener('pointerleave', end);
}
function renderTasbeeh(){
  document.getElementById('detailTitle').textContent = 'Tasbeeh Counter';
  const t = state.tasbeeh;
  const beadCount = 11;
  const activeIdx = t.count % beadCount;
  const beadsHtml = Array.from({length:beadCount}).map((_,i)=>`<div class="bead ${i===activeIdx?'active':''}"></div>`).join('');
  const tapAreaHtml = t.design==='beadsH'
    ? `<div class="beads-track h" id="beadsTrack" style="--tasbeehColor:${t.color};">${beadsHtml}</div><div class="beads-hint">Ungli se right se left swipe karein 👉👈</div>`
    : t.design==='beadsV'
    ? `<div class="beads-track v" id="beadsTrack" style="--tasbeehColor:${t.color};">${beadsHtml}</div><div class="beads-hint">Ungli se neeche se upar swipe karein 👆</div>`
    : `<button class="tasbeeh-tap" id="tasbeehTapBtn" style="--tasbeehColor:${t.color};"><span class="tasbeeh-tap-icon">${t.shape}</span>Dabaiye</button>`;
  document.getElementById('detailBody').innerHTML = `
    ${t.label ? `<div class="ts-label"><div class="ts-label-ar" dir="rtl">${t.labelAr || ''}</div><div class="ts-label-n">${t.label}${t.seq != null ? ` · ${t.seq + 1}/3` : ''}</div></div>` : ''}
    <div class="tasbeeh-count" style="--tasbeehColor:${t.color};">${t.count}</div>
    <div class="tasbeeh-target">Target: ${t.target}</div>
    ${tapAreaHtml}
    <div class="ts-presets" id="tsPresets">${TASBEEH_PRESETS.map((p, i)=>`<button type="button" class="ts-preset${t.label === p.n ? ' on' : ''}" data-pr="${i}">${p.n} · ${p.t}</button>`).join('')}<button type="button" class="ts-preset fatima${t.seq != null ? ' on' : ''}" id="tsFatima">📿 ${L({rur:'Tasbeeh-e-Fatima', en:'Fatima tasbeeh'})} 33·33·34</button></div>
    <div class="tasbeeh-design-row" id="tasbeehDesignRow">
      ${TASBEEH_DESIGNS.map(d=>`<button class="tasbeeh-design-btn ${t.design===d.id?'active':''}" data-design="${d.id}">${d.label}</button>`).join('')}
    </div>
    <div class="tasbeeh-row" id="tasbeehTargetRow">
      ${TASBEEH_TARGETS.map(n=>`<button class="tasbeeh-target-btn ${t.target===n?'active':''}" data-target="${n}">${n}</button>`).join('')}
      <button class="tasbeeh-target-btn ${!TASBEEH_TARGETS.includes(t.target)?'active':''}" id="tasbeehCustomBtn">Custom${!TASBEEH_TARGETS.includes(t.target)?` (${t.target})`:''}</button>
    </div>
    <div class="tasbeeh-swatches" id="tasbeehSwatches">
      ${TASBEEH_COLORS.map(c=>`<div class="tasbeeh-swatch ${t.color===c?'active':''}" data-color="${c}" style="background:${c};"></div>`).join('')}
    </div>
    ${t.design==='tap' ? `<div class="tasbeeh-shape-row" id="tasbeehShapes">
      ${TASBEEH_SHAPES.map(s=>`<button class="tasbeeh-shape-btn ${t.shape===s?'active':''}" data-shape="${s}">${s}</button>`).join('')}
    </div>` : ''}
    <div class="tasbeeh-sound-toggle">
      🔊 Awaaz
      <div class="roza-mini ${t.sound?'on':''}" id="tasbeehSoundBtn"><div class="roza-mini-knob"></div></div>
    </div>
    <div class="tasbeeh-sound-toggle">
      📳 ${L({rur:'Vibration', en:'Vibration'})}
      <div class="roza-mini ${t.vibrate !== false ? 'on' : ''}" id="tasbeehVibBtn"><div class="roza-mini-knob"></div></div>
    </div>
    <div class="tasbeeh-actions">
      <button id="tasbeehResetBtn">↺ Reset Karein</button>
    </div>
    ${tasbeehHistoryHtml()}

    <div class="section-title" style="padding:22px 0 10px;">Zikr Profiles</div>
    <div id="zikrProfileList"></div>
    <div class="tasbeeh-actions" style="margin-top:4px;">
      <button id="zikrAddProfileBtn">+ Naya Profile Banayein</button>
    </div>
  `;
  if(t.design==='tap'){
    document.getElementById('tasbeehTapBtn').onclick = tasbeehTick;
  } else {
    setupBeadsDrag(document.getElementById('beadsTrack'), t.design==='beadsH');
  }
  document.getElementById('tasbeehResetBtn').onclick = ()=>{ t.count = 0; saveState(); renderTasbeeh(); };
  document.querySelectorAll('#tsPresets [data-pr]').forEach(b=>{ b.onclick = ()=> tasbeehApplyPreset(+b.dataset.pr); });
  document.getElementById('tsFatima').onclick = tasbeehStartFatima;
  document.getElementById('tasbeehVibBtn').onclick = ()=>{ t.vibrate = t.vibrate === false; saveState(); renderTasbeeh(); if(t.vibrate && navigator.vibrate) navigator.vibrate(30); };
  document.getElementById('tasbeehSoundBtn').onclick = ()=>{ t.sound = !t.sound; saveState(); renderTasbeeh(); };
  document.getElementById('tasbeehDesignRow').querySelectorAll('[data-design]').forEach(btn=>{
    btn.onclick = ()=>{ t.design = btn.dataset.design; saveState(); renderTasbeeh(); };
  });
  document.getElementById('tasbeehTargetRow').querySelectorAll('[data-target]').forEach(btn=>{
    btn.onclick = ()=>{ t.target = parseInt(btn.dataset.target); t.seq = null; saveState(); renderTasbeeh(); };
  });
  document.getElementById('tasbeehCustomBtn').onclick = ()=>{
    const val = prompt('Custom target darj karein:', t.target);
    const n = parseInt(val);
    if(n && n>0){ t.target = n; saveState(); renderTasbeeh(); }
  };
  document.getElementById('tasbeehSwatches').querySelectorAll('[data-color]').forEach(el=>{
    el.onclick = ()=>{ t.color = el.dataset.color; saveState(); renderTasbeeh(); };
  });
  const shapeRow = document.getElementById('tasbeehShapes');
  if(shapeRow) shapeRow.querySelectorAll('[data-shape]').forEach(el=>{
    el.onclick = ()=>{ t.shape = el.dataset.shape; saveState(); renderTasbeeh(); };
  });
  renderZikrProfileList();
  document.getElementById('zikrAddProfileBtn').onclick = ()=>{
    const name = prompt('Naye profile ka naam darj karein (jaise "Safar ki Duaein"):');
    if(!name || !name.trim()) return;
    ensureZikrProfiles();
    const id = 'p'+Date.now();
    state.tasbeeh.profiles.push({ id, name:name.trim(), builtin:false, items:[] });
    saveState();
    renderZikrProfile(id);
  };
}

/* ============================================================
   ZIKR PROFILES (Morning/Evening Azkar + custom), attached to Tasbeeh
   ============================================================ */
const ZIKR_SUGGESTIONS = ["Subhan Allah","Alhamdulillah","Allahu Akbar","La ilaha illallah","Durud Sharif","Astaghfar","Teesra Kalima","Auzu Billah","Bismillah","La hawla wala quwwata illa billah","Ayat-ul-Kursi","Surah Ikhlas","Surah Al-Falaq","Surah An-Naas","Subhanallahi wa bihamdihi"];
function defaultAzkarItems(){
  return [
    {id:'subhanallah', name:'Subhan Allah', target:99},
    {id:'alhamdulillah', name:'Alhamdulillah', target:99},
    {id:'allahuakbar', name:'Allahu Akbar', target:100},
    {id:'durud', name:'Durud Sharif', target:100},
    {id:'astaghfar', name:'Astaghfar', target:100},
    {id:'kalima3', name:'Teesra Kalima', target:100},
  ];
}
function ensureZikrProfiles(){
  if(!state.tasbeeh.profiles){
    state.tasbeeh.profiles = [
      { id:'morning', name:'Subah ke Azkar', builtin:true, dtype:'morning', items:defaultAzkarItems() },
      { id:'evening', name:'Shaam ke Azkar', builtin:true, dtype:'evening', items:defaultAzkarItems() },
    ];
    saveState();
  }
  if(!state.tasbeeh.daily) state.tasbeeh.daily = {};
}
function getZikrDay(date, profileId, create){
  ensureZikrProfiles();
  const k = dayKey(date);
  if(!state.tasbeeh.daily[k]) state.tasbeeh.daily[k] = {};
  if(!state.tasbeeh.daily[k][profileId]){
    if(!create) return {};
    state.tasbeeh.daily[k][profileId] = {};
  }
  return state.tasbeeh.daily[k][profileId];
}
function zikrProfileProgress(date, profile){
  const day = getZikrDay(date, profile.id, false);
  let done = 0;
  profile.items.forEach(it=>{ if((day[it.id]||0) >= it.target) done++; });
  return { done, total: profile.items.length };
}
function isZikrProfileComplete(date, profile){
  const p = zikrProfileProgress(date, profile);
  return p.total>0 && p.done===p.total;
}
function zikrDayMarkedBaaki(date, profileId){
  const k = dayKey(date);
  return !!(state.tasbeeh.daily[k] && state.tasbeeh.daily[k][profileId] && state.tasbeeh.daily[k][profileId].__marked);
}
function renderZikrProfileList(){
  ensureZikrProfiles();
  const wrap = document.getElementById('zikrProfileList');
  if(!wrap) return;
  const today = new Date();
  wrap.innerHTML = state.tasbeeh.profiles.map(pf=>{
    const { done, total } = zikrProfileProgress(today, pf);
    const pct = total>0 ? Math.round(done/total*100) : 0;
    return `<div class="zikr-profile-card" data-pf="${pf.id}">
      <div style="flex:1;">
        <div class="zpName">${pf.name}</div>
        <div class="zpProgWrap"><div style="width:${pct}%;"></div></div>
        <div class="zpCount">${done}/${total} zikr mukammal (aaj)</div>
      </div>
      <button class="bulk-btn bulk-clear" data-pfreset="${pf.id}" title="Aaj ka reset karein" style="width:26px; height:26px; font-size:12px; flex:0 0 auto;">↺</button>
      <div class="chev">›</div>
    </div>`;
  }).join('');
  wrap.querySelectorAll('[data-pf]').forEach(el=>{
    el.onclick = ()=> renderZikrProfile(el.dataset.pf);
  });
  wrap.querySelectorAll('[data-pfreset]').forEach(btn=>{
    btn.onclick = (e)=>{
      e.stopPropagation();
      const pf = state.tasbeeh.profiles.find(p=>p.id===btn.dataset.pfreset);
      if(!pf) return;
      const day = getZikrDay(today, pf.id, true);
      pf.items.forEach(it=>{ day[it.id] = 0; });
      delete day.__marked;
      saveState();
      showToast(pf.name + ' aaj ke liye reset ho gaya');
      renderZikrProfileList();
    };
  });
}
function renderZikrProfile(profileId){
  ensureZikrProfiles();
  const profile = state.tasbeeh.profiles.find(p=>p.id===profileId);
  if(!profile) return renderTasbeeh();
  document.getElementById('detailTitle').textContent = profile.name;
  const today = new Date();
  const day = getZikrDay(today, profile.id, true);
  saveState();
  document.getElementById('detailBody').innerHTML = `
    <button id="zikrBackToTasbeeh" style="margin-bottom:14px; padding:8px 14px; border-radius:10px; border:1px solid var(--line); background:var(--card2); color:var(--text); font-size:12.5px; font-weight:700; cursor:pointer;">‹ Tasbeeh Counter</button>
    <div id="zikrItemsWrap"></div>
    <div class="zikr-add-row">
      <input type="text" id="zikrNewName" list="zikrSuggestList" placeholder="Naya zikr/dua ka naam">
      <datalist id="zikrSuggestList">${ZIKR_SUGGESTIONS.map(s=>`<option value="${s}">`).join('')}</datalist>
      <input type="number" id="zikrNewTarget" class="target" placeholder="Target" value="100">
      <button id="zikrAddItemBtn">+ Add</button>
    </div>
    <div class="tasbeeh-actions" style="margin-top:16px;">
      ${profile.builtin ? `<button id="zikrResetDefaultBtn">↺ Default 6 Zikr Wapas Layein</button>` : `<button id="zikrDeleteProfileBtn">🗑️ Profile Delete Karein</button>`}
    </div>
  `;
  function renderItems(){
    const w = document.getElementById('zikrItemsWrap');
    w.innerHTML = profile.items.map(it=>{
      const c = day[it.id]||0;
      const done = c>=it.target;
      const pct = Math.min(100, Math.round(c/it.target*100));
      return `<div class="zikr-item-card ${done?'done':''}" data-item="${it.id}">
        <div style="flex:1; cursor:pointer;" data-open="${it.id}">
          <div class="ziName">${done?'✅ ':''}${it.name}</div>
          <div class="ziCount">${c} / ${it.target}</div>
          <div class="ziBar"><div style="width:${pct}%;"></div></div>
        </div>
        <button class="zikr-item-tap" data-tap="${it.id}">+1</button>
        <button class="zikr-item-del" data-del="${it.id}">✕</button>
      </div>`;
    }).join('');
    w.querySelectorAll('[data-tap]').forEach(btn=>{
      btn.onclick = ()=>{
        const id = btn.dataset.tap;
        day[id] = (day[id]||0) + 1;
        saveState();
        if(navigator.vibrate) navigator.vibrate(10);
        renderItems();
      };
    });
    w.querySelectorAll('[data-open]').forEach(el=>{
      el.onclick = ()=> renderZikrItemCounter(profile.id, el.dataset.open);
    });
    w.querySelectorAll('[data-del]').forEach(btn=>{
      btn.onclick = ()=>{
        const id = btn.dataset.del;
        profile.items = profile.items.filter(it=>it.id!==id);
        delete day[id];
        saveState();
        renderItems();
      };
    });
  }
  renderItems();
  document.getElementById('zikrBackToTasbeeh').onclick = renderTasbeeh;
  document.getElementById('zikrAddItemBtn').onclick = ()=>{
    const nameEl = document.getElementById('zikrNewName');
    const targetEl = document.getElementById('zikrNewTarget');
    const name = nameEl.value.trim();
    const target = parseInt(targetEl.value) || 100;
    if(!name) return;
    const id = 'z'+Date.now();
    profile.items.push({ id, name, target });
    saveState();
    nameEl.value=''; targetEl.value='100';
    renderItems();
  };
  const delProfileBtn = document.getElementById('zikrDeleteProfileBtn');
  if(delProfileBtn) delProfileBtn.onclick = async ()=>{
    if(!(await appConfirm('Yeh profile delete karein?'))) return;
    state.tasbeeh.profiles = state.tasbeeh.profiles.filter(p=>p.id!==profile.id);
    saveState();
    renderTasbeeh();
  };
  const resetDefaultBtn = document.getElementById('zikrResetDefaultBtn');
  if(resetDefaultBtn) resetDefaultBtn.onclick = async ()=>{
    if(!(await appConfirm('Is profile ko wapas default 6 zikr par reset karein? Aapke add kiye hue extra zikr hat jayenge.'))) return;
    profile.items = defaultAzkarItems();
    saveState();
    renderZikrProfile(profile.id);
  };
}

/* Full-screen tap/beads counting animation for a single zikr/dua inside a profile, mirrors the main Tasbeeh Counter but counts against that item's own saved progress. */
function renderZikrItemCounter(profileId, itemId){
  const profile = state.tasbeeh.profiles.find(p=>p.id===profileId);
  if(!profile) return renderTasbeeh();
  const item = profile.items.find(i=>i.id===itemId);
  if(!item) return renderZikrProfile(profileId);
  const day = getZikrDay(new Date(), profileId, true);
  const t = state.tasbeeh;
  const beadCount = 11;
  document.getElementById('detailTitle').textContent = item.name;

  function draw(){
    const c = day[item.id]||0;
    const activeIdx = c % beadCount;
    const beadsHtml = Array.from({length:beadCount}).map((_,i)=>`<div class="bead ${i===activeIdx?'active':''}"></div>`).join('');
    const tapAreaHtml = t.design==='beadsH'
      ? `<div class="beads-track h" id="beadsTrack" style="--tasbeehColor:${t.color};">${beadsHtml}</div><div class="beads-hint">Ungli se right se left swipe karein 👉👈</div>`
      : t.design==='beadsV'
      ? `<div class="beads-track v" id="beadsTrack" style="--tasbeehColor:${t.color};">${beadsHtml}</div><div class="beads-hint">Ungli se neeche se upar swipe karein 👆</div>`
      : `<button class="tasbeeh-tap" id="tasbeehTapBtn" style="--tasbeehColor:${t.color};"><span class="tasbeeh-tap-icon">${t.shape}</span>Dabaiye</button>`;
    document.getElementById('detailBody').innerHTML = `
      <button id="zikrItemBackBtn" style="margin-bottom:14px; padding:8px 14px; border-radius:10px; border:1px solid var(--line); background:var(--card2); color:var(--text); font-size:12.5px; font-weight:700; cursor:pointer;">‹ ${profile.name}</button>
      <div class="tasbeeh-count" style="--tasbeehColor:${t.color};">${c}</div>
      <div class="tasbeeh-target">Target: ${item.target}</div>
      ${tapAreaHtml}
      <div class="tasbeeh-actions" style="margin-top:20px;">
        <button id="zikrItemResetBtn">↺ Yeh Zikr Reset Karein</button>
      </div>
    `;
    document.getElementById('zikrItemBackBtn').onclick = ()=> renderZikrProfile(profileId);
    document.getElementById('zikrItemResetBtn').onclick = ()=>{ day[item.id] = 0; saveState(); draw(); };
    const tick = ()=>{
      const nc = (day[item.id]||0) + 1;
      day[item.id] = nc;
      saveState();
      if(navigator.vibrate) navigator.vibrate(nc % item.target === 0 ? [40,40,80] : 15);
      tasbeehBeep();
      const countEl = document.querySelector('.tasbeeh-count');
      if(countEl) countEl.textContent = nc;
      const newActiveIdx = nc % beadCount;
      document.querySelectorAll('.beads-track .bead').forEach((b,i)=> b.classList.toggle('active', i===newActiveIdx));
      if(nc >= item.target){
        setTimeout(()=>{ renderZikrProfile(profileId); }, 500); // let the user see the final count/feel the vibration, then auto-return
      }
    };
    if(t.design==='tap'){
      document.getElementById('tasbeehTapBtn').onclick = tick;
    } else {
      setupBeadsDrag(document.getElementById('beadsTrack'), t.design==='beadsH', tick);
    }
  }
  draw();
}

/* ============================================================
   HIJRI <-> GREGORIAN CONVERTER
   ============================================================ */
function jdToGregorian(jd){
  jd = Math.floor(jd + 0.5);
  const a = jd + 32044;
  const b = Math.floor((4*a+3)/146097);
  const c = a - Math.floor(146097*b/4);
  const d = Math.floor((4*c+3)/1461);
  const e = c - Math.floor(1461*d/4);
  const m = Math.floor((5*e+2)/153);
  const day = e - Math.floor((153*m+2)/5) + 1;
  const month = m + 3 - 12*Math.floor(m/10);
  const year = 100*b + d - 4800 + Math.floor(m/10);
  return new Date(year, month-1, day);
}
function hijriToGregorian(day, month, year){
  // Approximate the Gregorian date from mean Hijri year/month lengths, then correct
  // by searching nearby days against gregorianToHijri() so the two functions always
  // round-trip exactly (avoids drift from an independently-derived inverse formula).
  const epochJD = julianDate(622,7,19) - 1; // 1 Muharram 1 AH (Gregorian proleptic)
  const approxDays = (year-1)*354.36667 + (month-1)*29.53056 + (day-1);
  const guess = jdToGregorian(epochJD + approxDays);
  for(let delta=-20; delta<=20; delta++){
    const cand = new Date(guess.getFullYear(), guess.getMonth(), guess.getDate()+delta);
    const hd = gregorianToHijri(cand);
    if(hd.day===day && hd.month===month && hd.year===year) return cand;
  }
  return guess;
}
function renderHijriConverter(){
  document.getElementById('detailTitle').textContent = 'Tareekh Badlein';
  const todayG = new Date();
  const todayH = gregorianToHijri(todayG);
  document.getElementById('detailBody').innerHTML = `
    <div class="hconv-box">
      <div class="cal-detail-row-title" style="font-size:12.5px; color:var(--sub); margin-bottom:10px;">Gregorian → Hijri</div>
      <label>Tareekh chunein</label>
      <input type="date" id="convGregInput" value="${todayG.getFullYear()}-${String(todayG.getMonth()+1).padStart(2,'0')}-${String(todayG.getDate()).padStart(2,'0')}">
      <div class="hconv-result" id="convGregResult"></div>
    </div>
    <div class="hconv-box">
      <div class="cal-detail-row-title" style="font-size:12.5px; color:var(--sub); margin-bottom:10px;">Hijri → Gregorian</div>
      <div class="hconv-row">
        <div><label>Din</label><input type="number" id="convHDay" min="1" max="30" value="${todayH.day}"></div>
        <div><label>Mahina</label>
          <select id="convHMonth">${HIJRI_MONTHS.map((m,i)=>`<option value="${i+1}" ${i+1===todayH.month?'selected':''}>${m}</option>`).join('')}</select>
        </div>
        <div><label>Saal (AH)</label><input type="number" id="convHYear" value="${todayH.year}"></div>
      </div>
      <div class="hconv-result" id="convHResult"></div>
    </div>
  `;
  const gInput = document.getElementById('convGregInput');
  const gResult = document.getElementById('convGregResult');
  function updateGregToHijri(){
    const parts = gInput.value.split('-').map(Number);
    if(parts.length!==3 || parts.some(isNaN)){ gResult.textContent=''; return; }
    const d = new Date(parts[0], parts[1]-1, parts[2]);
    const hd = gregorianToHijri(d);
    gResult.textContent = `${hd.day} ${hd.monthName} ${hd.year} AH`;
  }
  gInput.oninput = updateGregToHijri;
  updateGregToHijri();

  const hDay = document.getElementById('convHDay'), hMonth = document.getElementById('convHMonth'), hYear = document.getElementById('convHYear');
  const hResult = document.getElementById('convHResult');
  function updateHijriToGreg(){
    const day = parseInt(hDay.value), month = parseInt(hMonth.value), year = parseInt(hYear.value);
    if(!day || !month || !year){ hResult.textContent=''; return; }
    const g = hijriToGregorian(day, month, year);
    hResult.textContent = `${DOW[g.getDay()]}, ${g.getDate()} ${MON[g.getMonth()]} ${g.getFullYear()}`;
  }
  [hDay, hMonth, hYear].forEach(el=> el.oninput = updateHijriToGreg);
  updateHijriToGreg();
}

/* ============================================================
   ISLAMIC MONTHS
   ============================================================ */
const HIJRI_MONTH_META = [
  {icon:'🎆', color:'#8e6fd6'}, {icon:'🌫️', color:'#5c8fc9'}, {icon:'🌟', color:'#d4a72c'},
  {icon:'🌸', color:'#3a9bd9'}, {icon:'❄️', color:'#4fb0c9'}, {icon:'🧊', color:'#4f9fc9'},
  {icon:'🌌', color:'#6a6fd6'}, {icon:'🌒', color:'#a074e0'}, {icon:'🌕', color:'#3fae6a'},
  {icon:'🍬', color:'#e0729a'}, {icon:'🛤️', color:'#5cbf8a'}, {icon:'🕋', color:'#c85a4a'},
];
function renderIslamicMonths(){
  document.getElementById('detailTitle').textContent = 'Islami Mahine';
  const curH = gregorianToHijri(new Date());
  document.getElementById('detailBody').innerHTML = `
    <div class="backup-note">Hijri (Qamri) saal ke 12 mahine, chand ki bunyaad par. Kisi mahine par dabayein to us ki maloomat dikhengi.</div>
    ${HIJRI_MONTHS.map((name,i)=>{
      const meta = HIJRI_MONTH_META[i];
      const isCurrent = curH.month===i+1;
      return `<div class="hmonth-card ${isCurrent?'current':''}" data-m="${i}" role="button" tabindex="0">
        <div class="hIcon" style="background:color-mix(in srgb, ${meta.color} 22%, transparent); color:${meta.color};">${meta.icon}</div>
        <div style="flex:1;">
          <div class="hNo">Mahina ${i+1}${isCurrent?' · Abhi chal raha hai':''}${HIJRI_MONTH_INFO[i].sacred?' · Haram Mahina':''}</div>
          <div class="hName">${name}</div>
        </div>
        <div class="hChev">›</div>
      </div>`;
    }).join('')}
  `;
  document.querySelectorAll('#detailBody [data-m]').forEach(el=>{
    el.onclick = ()=> renderMonthDetail(parseInt(el.dataset.m));
  });
}
function renderMonthDetail(i){
  const info = HIJRI_MONTH_INFO[i], meta = HIJRI_MONTH_META[i];
  const c = state.lang==='en' ? info.en : info.rur;
  const curH = gregorianToHijri(new Date());
  document.getElementById('detailTitle').textContent = HIJRI_MONTHS[i];
  document.getElementById('detailBody').innerHTML = `
    <div class="mdetail-head">
      <div class="hIcon big" style="background:color-mix(in srgb, ${meta.color} 22%, transparent); color:${meta.color};">${meta.icon}</div>
      <div class="mdetail-ar">${info.ar}</div>
      <div class="mdetail-name">${HIJRI_MONTHS[i]}</div>
      <div class="mdetail-badges">
        <span class="mbadge">${L({rur:'Mahina',en:'Month'})} ${i+1} / 12</span>
        ${info.sacred ? `<span class="mbadge sacred">🕋 ${L({rur:'Haram Mahina',en:'Sacred Month'})}</span>` : ''}
        ${curH.month===i+1 ? `<span class="mbadge now">${L({rur:'Abhi chal raha hai',en:'Current month'})}</span>` : ''}
      </div>
    </div>
    <div class="section-title">${L({rur:'Ahem Baatein',en:'Key Points'})}</div>
    ${c.points.map(t=>`<div class="minfo-card">${t}</div>`).join('')}
    ${c.events && c.events.length ? `<div class="section-title">${L({rur:'Ahem Waqiat',en:'Notable Events'})}</div>${c.events.map(t=>`<div class="minfo-card ev">${t}</div>`).join('')}` : ''}
    <div class="backup-note">${L({rur:"Maloomat Qur’an, Sahih Ahadees aur mash'hoor tareekhi riwayat se hain. Jahan ulama ya muarrikhin mein ikhtilaf hai wahan wazahat ki gayi hai.", en:"Information is drawn from the Qur’an, authentic hadith and well-known historical accounts. Where scholars or historians differ, this is noted."})}</div>
    <div class="pn-bar">
      <button class="pn-btn" id="pnPrevBtn" ${i<=0?'disabled':''}>‹ ${L({rur:'Pichla',en:'Previous'})}</button>
      <span class="pn-pos">${i+1} / 12</span>
      <button class="pn-btn" id="pnNextBtn" ${i>=11?'disabled':''}>${L({rur:'Agla',en:'Next'})} ›</button>
    </div>
  `;
  document.getElementById('pnPrevBtn').onclick = ()=> i>0 && renderMonthDetail(i-1);
  document.getElementById('pnNextBtn').onclick = ()=> i<11 && renderMonthDetail(i+1);
}

/* ============================================================
   RAABTA (Contact)
   ============================================================ */
const CONTACT_EMAIL = 'contact.waqt24@gmail.com';
function mailtoLink(subject, extra){
  const errs = errLogText(900);
  const info = `App: Waqt24 (build ${appBuildId()}, data v${state.schema||STATE_VERSION})\nZubaan: ${state.lang==='en'?'English':'Hinglish / Roman Urdu'}\nTheme: ${state.theme} · Method: ${state.calcMethod||'mwl'} · TZ: ${locTZ()}\nInstalled: ${window.matchMedia('(display-mode: standalone)').matches?'yes':'no'}\nDevice: ${navigator.userAgent}\n`;
  const body = `\n\n---\n${info}${extra||''}${errs ? '\nRecent errors:\n'+errs+'\n' : ''}`;
  return 'mailto:'+CONTACT_EMAIL+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
}
function renderRaabta(){
  document.getElementById('detailTitle').textContent = 'Raabta';
  const cards = [
    { ic:'📝', t:{rur:'Sujhaav Dein', en:'Send a Suggestion'}, d:{rur:'Koi nayi cheez ya behtari ka khayal ho to batayein.', en:'Have an idea for a new feature or an improvement? Tell us.'}, subj:'Waqt24 - Suggestion' },
    { ic:'🆘', t:{rur:'Madad Chahiye', en:'Need Help'}, d:{rur:'App istemal karne mein koi mushkil ho to likhein.', en:'Facing difficulty using the app? Write to us.'}, subj:'Waqt24 - Help' },
    { ic:'🐞', t:{rur:'Masla / Ghalti Batayein', en:'Report a Problem'}, d:{rur:'Koi ghalti, ghalat waqt ya ghalat maloomat nazar aaye to zaroor batayein.', en:'Spotted a bug, a wrong time or wrong information? Please let us know.'}, subj:'Waqt24 - Problem report' },
  ];
  document.getElementById('detailBody').innerHTML = `
    <div class="raabta-head">
      <div class="raabta-ic">📧</div>
      <div class="raabta-t">${L({rur:'Hum se raabta karein', en:'Get in touch'})}</div>
      <div class="raabta-sub">${L({rur:'Sujhaav aur madad ke liye is email par likhein:', en:'For suggestions and help, write to this email:'})}</div>
      <div class="raabta-mail" data-no-i18n>${CONTACT_EMAIL}</div>
      <div class="raabta-btns">
        <a class="raabta-btn primary" href="${mailtoLink('Waqt24')}">${L({rur:'Email Bhejein', en:'Send Email'})}</a>
        <button class="raabta-btn" id="raabtaCopy">${L({rur:'Email Copy Karein', en:'Copy Email'})}</button>
      </div>
    </div>
    ${cards.map(c=>`<a class="howto-card raabta-card" href="${mailtoLink(c.subj)}">
      <div class="howto-ic">${c.ic}</div>
      <div class="howto-body"><div class="howto-t">${L(c.t)}</div><div class="howto-d">${L(c.d)}</div></div>
      <div class="hChev">›</div>
    </a>`).join('')}
    <div class="backup-note">${L({rur:'Hum aapke paighaam ka jald jawab dene ki koshish karenge. Bug batate waqt kaunsa screen tha aur kya hua, yeh likh dein to madad milti hai.', en:'We will try to reply soon. When reporting a problem, mention which screen you were on and what happened.'})}</div>
  `;
  const nErr = errLogRead().length;
  if(nErr){
    const box = document.createElement('div'); box.className = 'backup-note'; box.id = 'errBox';
    box.innerHTML = `${L({rur:'Is phone par '+nErr+' ghalti ka record hai. Email bhejte waqt yeh khud lag jata hai taake masla theek karna aasan ho. Kuch bhi apne aap nahi bheja jata.', en:nErr+' recent error(s) are saved on this phone. They are added to the email you send so the problem is easier to fix. Nothing is sent automatically.'})}<div class="tt-actions"><button class="backup-btn" id="errCopy">${L({rur:'Log Copy Karein', en:'Copy log'})}</button><button class="backup-btn secondary" id="errClear">${L({rur:'Log Saaf Karein', en:'Clear log'})}</button></div>`;
    document.getElementById('detailBody').appendChild(box);
    document.getElementById('errCopy').onclick = async ()=>{ try{ await navigator.clipboard.writeText(errLogText()); showToast(L({rur:'Log copy ho gaya', en:'Log copied'})); }catch(e){ showToast(L({rur:'Copy nahi hua', en:'Could not copy'})); } };
    document.getElementById('errClear').onclick = ()=>{ errLogClear(); renderRaabta(); };
  }
  document.getElementById('raabtaCopy').onclick = async ()=>{
    try{ await navigator.clipboard.writeText(CONTACT_EMAIL); showToast(L({rur:'Email copy ho gaya', en:'Email copied'})); }
    catch(e){ showToast(CONTACT_EMAIL); }
  };
}

/* ============================================================
   ISTEMAL KA TAREEQA (How to Use)
   ============================================================ */
function renderHowTo(){
  document.getElementById('detailTitle').textContent = 'Istemal ka Tareeqa';
  document.getElementById('detailBody').innerHTML = `
    <div class="backup-note">${L({rur:"Waqt24 ke har hisse ka mukhtasar tareeqa. Har card mein us hisse ki wazahat hai.", en:"A quick guide to every part of Waqt24. Each card explains one feature."})}</div>
    ${HOWTO_GROUPS.map(g=>`
      <div class="section-title">${L(g)}</div>
      ${HOWTO_CARDS.filter(c=>c.g===g.key).map(c=>`<div class="howto-card">
        <div class="howto-ic">${c.ic}</div>
        <div class="howto-body"><div class="howto-t">${L(c.t)}</div><div class="howto-d">${L(c.d)}</div></div>
      </div>`).join('')}
    `).join('')}
  `;
}

/* ============================================================
   ISLAMIC EVENTS
   ============================================================ */
function hijriYearStart(hYear){
  return hijriToGregorian(1, 1, hYear);
}
function findLastFridayInHijriMonth(hMonth, hYear){
  let d = hijriToGregorian(1, hMonth, hYear);
  let lastFriday = null;
  for(let i=0;i<31;i++){
    const hd = gregorianToHijri(d);
    if(hd.month!==hMonth || hd.year!==hYear) break;
    if(d.getDay()===5) lastFriday = new Date(d);
    d = new Date(d.getTime()+86400000);
  }
  return lastFriday;
}
function nextOccurrence(computeForYear){
  const today = new Date(); today.setHours(0,0,0,0);
  const curH = gregorianToHijri(today);
  let g = computeForYear(curH.year);
  if(g < today) g = computeForYear(curH.year+1);
  return g;
}
function islamicEventsList(){
  const events = [
    { name:"Islami Naya Saal (1 Muharram-ul-Haraam)", h:(y)=>hijriToGregorian(1,1,y), ic:"🥳", tag:"newyear" },
    { name:"Muharram-ul-Haraam ki 10 Tareekh", h:(y)=>hijriToGregorian(10,1,y), ic:"🖤", tag:"ashura" },
    { name:"Milad-un-Nabi ﷺ (12 Rabi-ul-Awwal)", h:(y)=>hijriToGregorian(12,3,y), ic:"🌹", tag:"milad" },
    { name:"Laylat-ul-Miraj (27 Rajab)", h:(y)=>hijriToGregorian(27,7,y), ic:"🌠", tag:"miraj", yr:"Safar-e-Miraj ki mash'hoor raat", note:"Tareekh mein ikhtilaf, mash'hoor riwayat 27 Rajab hai, qatai nahi" },
    { name:"Ramzan Shuru (1 Ramzan)", h:(y)=>hijriToGregorian(1,9,y), ic:"🌛", tag:"ramzan" },
    { name:"Ghazwa-e-Badr (17 Ramzan)", h:(y)=>hijriToGregorian(17,9,y), ic:"⚔️", tag:"ghazwa", yr:"2 Hijri" },
    { name:"Shab-e-Qadr ka Ehtimaal", nights:[21,23,25,27,29].map(d=>({day:d, h:(y)=>hijriToGregorian(d,9,y)})), ic:"✨", tag:"qadr" },
    { name:"Jumat-ul-Vida (Ramzan ki aakhri Jumu'ah)", h:(y)=> findLastFridayInHijriMonth(9,y), ic:"🕊️", tag:"jumavida" },
    { name:"Fateh Makkah (20 Ramzan)", h:(y)=>hijriToGregorian(20,9,y), ic:"🚩", tag:"ghazwa", yr:"8 Hijri", note:"Mash'hoor tareekh 20 Ramzan hai; ba'z riwayat mein farq milta hai" },
    { name:"Eid-ul-Fitr (1 Shawwal)", h:(y)=>hijriToGregorian(1,10,y), ic:"🎊", tag:"eid" },
    { name:"Ghazwa-e-Uhud (7 Shawwal)", h:(y)=>hijriToGregorian(7,10,y), ic:"🛡️", tag:"ghazwa", yr:"3 Hijri", note:"Ba'z riwayat mein 15 Shawwal bhi milta hai" },
    { name:"Ghazwa-e-Hunain (10 Shawwal)", h:(y)=>hijriToGregorian(10,10,y), ic:"🏹", tag:"ghazwa", yr:"8 Hijri", note:"Tareekh mein ikhtilaf (6 ya 10 Shawwal)" },
    { name:"Sulah Hudaibiyah (1 Zul-Qa'dah)", h:(y)=>hijriToGregorian(1,11,y), ic:"🤝", tag:"ghazwa", yr:"6 Hijri", note:"Rawangi ki tareekh; muahida usi mahine mein hua, din ta'qreebi hai" },
    { name:"Ghazwa-e-Khandaq (8 Zul-Qa'dah)", h:(y)=>hijriToGregorian(8,11,y), ic:"⛏️", tag:"ghazwa", yr:"5 Hijri", note:"Tareekh ta'qreebi hai; ba'z riwayat mein Shawwal" },
    { name:"Eid-ul-Azha / Baqr-Eid (10 Zul-Hijjah)", h:(y)=>hijriToGregorian(10,12,y), ic:"🐐", tag:"eid" },
  ];
  return events.map(e=>{
    if(e.nights){
      const nights = e.nights.map(n=>{
        const g = nextOccurrence(n.h);
        const hd = gregorianToHijri(g);
        return { day:n.day, greg:g, hijri:`${hd.day} ${hd.monthName} ${hd.year} AH` };
      });
      return { name:e.name, nights, greg:nights[0].greg, ic:e.ic, tag:e.tag };
    }
    const g = nextOccurrence(e.h);
    const hd = gregorianToHijri(g);
    return { name:e.name, greg:g, hijri:`${hd.day} ${hd.monthName} ${hd.year} AH`, ic:e.ic, tag:e.tag, yr:e.yr, note:e.note };
  }).sort((a,b)=> a.greg - b.greg);
}
let khaasDinTab = 'all';
const KHAAS_DIN_TABS = [['all','Sabhi'],['eid','Eid'],['ramzan','Ramzan'],['ghazwa','Ghazwa'],['misc','Mazeed']];
function eventInTab(e, tab){
  if(tab==='all') return true;
  if(tab==='eid') return e.tag==='eid';
  if(tab==='ramzan') return ['ramzan','qadr','jumavida'].includes(e.tag) || (e.tag==='ghazwa' && /Ramzan/.test(e.name));
  if(tab==='ghazwa') return e.tag==='ghazwa';
  return ['newyear','ashura','milad','miraj'].includes(e.tag);
}
function renderIslamicEvents(){
  document.getElementById('detailTitle').textContent = 'Khaas Din';
  const events = islamicEventsList().filter(e=> eventInTab(e, khaasDinTab));
  const fmtG = g=> `${DOW[g.getDay()]}, ${g.getDate()} ${MON[g.getMonth()]} ${g.getFullYear()}`;
  document.getElementById('detailBody').innerHTML = `
    <div class="chip-row he-tabs" id="heTabs">
      ${KHAAS_DIN_TABS.map(([k,l])=>`<div class="chip ${khaasDinTab===k?'active':''}" data-tab="${k}">${l}</div>`).join('')}
    </div>
    <div class="backup-note">Aane wale ahem Islami tareekhein (Hijri arithmetic hisaab se; chaand dikhne par 1 din aage-peeche ho sakta hai). ⚠️ wale din ki tareekh mein ikhtilaf ya ta'qreeb hai.</div>
    ${events.map((e,i)=> e.nights ? `<div class="hevent-card tag-${e.tag}">
      <div class="heIc">${e.ic}</div>
      <div class="heName">${e.name}</div>
      ${e.nights.map(n=>`<div class="heNightRow">
        <span class="heNightLeft">
          <span class="heNightDay">${n.day} Ramzan</span>
          <span class="heHijri">${n.hijri}</span>
        </span>
        <span class="heGreg">📅 ${fmtG(n.greg)}</span>
      </div>`).join('')}
      <button class="he-share" data-i="${i}" title="Share karein">${SHARE_SVG}</button>
    </div>` : `<div class="hevent-card tag-${e.tag}">
      <div class="heIc">${e.ic}</div>
      <div class="heName">${e.name}</div>
      ${e.yr ? `<div class="heYr">${e.yr}</div>` : ''}
      <div class="heHijri">${e.hijri}</div>
      <div class="heGreg">📅 ${fmtG(e.greg)}</div>
      ${e.note ? `<div class="heBadge">⚠️ ${e.note}</div>` : ''}
      <button class="he-share" data-i="${i}" title="Share karein">${SHARE_SVG}</button>
    </div>`).join('')}
  `;
  document.querySelectorAll('#heTabs [data-tab]').forEach(el=>{
    el.onclick = ()=>{ khaasDinTab = el.dataset.tab; renderIslamicEvents(); };
  });
  document.querySelectorAll('#detailBody .he-share').forEach(btn=>{
    btn.onclick = ()=>{
      const e = events[parseInt(btn.dataset.i)];
      const body = e.nights ? e.nights.map(n=>`${n.day} Ramzan, ${fmtG(n.greg)}`).join('\n') : `${e.hijri}\n${fmtG(e.greg)}`;
      openCardShareChooser({ kind:'Khaas Din', title:e.name, sub:e.yr||'', body, foot:e.note||'' });
    };
  });
}

function daysUntilRamzan(){
  let d = new Date(); d.setHours(0,0,0,0);
  for(let i=0;i<380;i++){
    const hd = gregorianToHijri(d);
    if(hd.month===9 && hd.day===1) return i;
    d = new Date(d.getTime()+24*3600000);
  }
  return null;
}
function updateRamzanLock(){
  const item = document.getElementById('ramzanMoreItem');
  const sub = document.getElementById('ramzanSub');
  if(!item) return;
  const hd = gregorianToHijri(new Date());
  const isRamzan = hd.month===9;
  document.body.classList.toggle('ramadan', isRamzan);
  item.classList.remove('disabled');
  if(!isRamzan){
    const days = daysUntilRamzan();
    sub.textContent = days!=null ? (days===0 ? 'Ramzan kal shuru hoga' : `Ramzan mein ${days} din baaki`) : '';
  } else {
    sub.textContent = '';
  }
}
updateRamzanLock();

