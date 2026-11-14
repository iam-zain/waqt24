/* ============================================================
   BACK-BUTTON HANDLING, make the phone/browser back button close
   overlays instead of exiting the app, by pushing a history entry
   for each overlay we open and popping it on close.
   ============================================================ */
function pushModalState(){ history.pushState({ waqtModal: true }, ''); }
/* Swipe down from the top of a detail screen to close it (like the bottom sheets) */
(()=>{
  const ov = document.getElementById('detailOverlay'), body = document.getElementById('detailBody');
  let y0 = null, x0 = 0, dy = 0;
  body.addEventListener('touchstart', e=>{
    const skip = e.target.closest('input, textarea, select, .quran-page-wrap, .beads-track, .tasbeeh-tap, [data-no-swipe]');
    y0 = (!skip && body.scrollTop <= 0) ? e.touches[0].clientY : null; x0 = e.touches[0].clientX; dy = 0;
  }, { passive:true });
  body.addEventListener('touchmove', e=>{
    if(y0 === null) return;
    dy = e.touches[0].clientY - y0;
    const dx = Math.abs(e.touches[0].clientX - x0);
    if(dy < 0 || dx > dy){ ov.style.transform = ''; return; }
    ov.style.transition = 'none';
    ov.style.transform = `translateY(${Math.min(160, dy*0.45)}px)`;
    ov.style.opacity = String(1 - Math.min(0.35, dy/600));
  }, { passive:true });
  body.addEventListener('touchend', ()=>{
    if(y0 === null) return;
    y0 = null;
    ov.style.transition = 'transform .2s ease, opacity .2s ease';
    if(dy > 120){ closeModal(); setTimeout(()=>{ ov.style.transform = ''; ov.style.opacity = ''; ov.style.transition = ''; }, 220); }
    else { ov.style.transform = ''; ov.style.opacity = ''; }
    dy = 0;
  });
})();

/* Close the detail screen with a short slide-out; reopening during it cancels the close */
function closeDetailAnimated(){
  if(quranReaderOpen) quranWake(false);
  const d = document.getElementById('detailOverlay');
  const tok = d._closeTok = (d._closeTok || 0) + 1;
  d.classList.add('closing');
  setTimeout(()=>{ if(d._closeTok === tok){ d.classList.remove('active', 'closing'); } }, 190);
}
function cancelDetailClose(){ const d = document.getElementById('detailOverlay'); d._closeTok = (d._closeTok || 0) + 1; d.classList.remove('closing'); }
function closeTopModalUI(){
  const share = document.getElementById('shareChooser');
  const info = document.getElementById('infoModal');
  const detail = document.getElementById('detailOverlay');
  if(share.classList.contains('active')){ share.classList.remove('active'); return; }
  if(info.classList.contains('active')){ info.classList.remove('active'); return; }
  if(detail.classList.contains('active')){ closeDetailAnimated(); navStack.length = 0; curScreen = null; __navCtx = null; stopQiblaCompass(); renderGoalCard(); renderBackupNudge(); renderContinueCard(); return; }
}
function closeModal(){
  if(history.state && history.state.waqtModal){ history.back(); }
  else{ closeTopModalUI(); }
}
/* In-overlay navigation: each deeper screen pushes one history entry, so the
   phone's back button steps back one screen instead of closing the overlay. */
const navStack = [];
let curScreen = null;
let suppressPops = 0;
const navOrig = {};
function overlayActive(){ return document.getElementById('detailOverlay').classList.contains('active'); }
function onNavigate(s){ onNavigate0(s); homeBtnSync(); }
function onNavigate0(s){
  if(s && s.fn !== 'renderQuranReader' && quranReaderOpen) quranWake(false);
  if(!overlayActive()){ navStack.length = 0; curScreen = s; return; }
  if(!curScreen){ curScreen = s; return; }
  if(s.level > curScreen.level){
    curScreen.scroll = document.getElementById('detailBody').scrollTop;
    navStack.push(curScreen);
    history.pushState({ waqtModal:true, nav:true }, '');
    curScreen = s;
  } else if(s.level === curScreen.level){
    curScreen = s;
  } else {
    let removed = 0;
    while(navStack.length && navStack[navStack.length-1].level >= s.level){ navStack.pop(); removed++; }
    curScreen = s;
    if(removed){ suppressPops++; history.go(-removed); }
  }
}
function navWrap(name, level){
  if(typeof window[name] !== 'function') return;
  navOrig[name] = window[name];
  window[name] = function(...args){
    onNavigate({ fn:name, args, level });
    return navOrig[name].apply(this, args);
  };
}
window.addEventListener('popstate', ()=>{
  if(suppressPops){ suppressPops--; return; }
  const share = document.getElementById('shareChooser');
  const info = document.getElementById('infoModal');
  if(overlayActive() && navStack.length && !share.classList.contains('active') && !info.classList.contains('active')){
    const prev = navStack.pop();
    curScreen = prev; homeBtnSync();
    navOrig[prev.fn](...prev.args);
    const sc = prev.scroll || 0;
    setTimeout(()=>{ document.getElementById('detailBody').scrollTop = sc; }, 0);
    return;
  }
  closeTopModalUI();
});

document.querySelectorAll('.more-item').forEach(item=>{
  item.onclick = ()=>{
    if(item.classList.contains('disabled')) return;
    const which = item.dataset.open;
    /* Opening a section from the menu starts fresh: "Sabhi" selected and an empty search */
    if(['dua','hadees','aadaab','quranWords'].includes(which)){
      duaCat='__all__'; duaSearch=''; hadeesFilter='All'; hadeesSearch='';
      aadaabCat='__all__'; aadaabSearch=''; qwordSearch=''; qwordGroupFilter='__all__';
    }
    if(which==='dua') renderMoreDua();
    else if(which==='hadees') renderMoreHadees();
    else if(which==='quranWords') renderQuranWords();
    else if(which==='aadaab') renderAadaab();
    else if(which==='quiz') renderMoreQuiz();
    else if(which==='ramzan') renderMoreRamzan();
    else if(which==='qibla') renderQibla();
    else if(which==='stats') renderStats();
    else if(which==='tasbeeh') renderTasbeeh();
    else if(which==='quran') renderQuranHome();
    else if(which==='asma') renderNamesList('asma');
    else if(which==='prophetNames') renderNamesList('prophet');
    else if(which==='khaasShabd') renderKhaasShabd();
    else if(which==='dailyWord') renderDailyWord();
    else if(which==='bookmarks') renderBookmarks();
    else if(which==='qaza') renderQaza();
    else if(which==='howto') renderHowTo();
    else if(which==='raabta') renderRaabta();
    else if(which==='azaan') renderAzaan();
    else if(which==='install') renderInstall();
    else if(which==='mythBusters') renderMythBusters();
    else if(which==='hijriConv') renderHijriConverter();
    else if(which==='islamicMonths') renderIslamicMonths();
    else if(which==='islamicEvents') renderIslamicEvents();
    else if(which==='backup') renderBackup();
    else if(which==='settings') renderSettingsMenu();
    else if(which==='about') renderMoreAbout();
    document.getElementById('detailOverlay').classList.add('active'); cancelDetailClose();
    document.getElementById('detailBody').scrollTop = 0;
    pushModalState();
  };
});
document.getElementById('detailBack').onclick = closeModal;
/* Home: from any depth, leave the whole overlay in one tap and land on the tab it was opened from (Maarifat, Deegar...) */
function homeBtnSync(){ const b = document.getElementById('detailHome'); if(b) b.hidden = !(overlayActive() && navStack.length > 0); }
document.getElementById('detailHome').onclick = ()=>{
  const k = navStack.length + (history.state && history.state.waqtModal ? 1 : 0);
  navStack.length = 0; curScreen = null;
  for(let i = 0; i < 3 && overlayActive(); i++) closeTopModalUI();
  if(k){ suppressPops++; history.go(-k); }
  homeBtnSync();
};
['renderMoreDua','renderMoreHadees','renderQuranWords','renderAadaab','renderNamesList','renderKhaasShabd','renderDailyWord','renderMythBusters','renderMoreQuiz','renderBookmarks','renderIslamicMonths','renderSettingsMenu'].forEach(n=>navWrap(n,0));
['openDuaDetail','openHadeesDetail','openQuranWordDetail','openAadaabDetail','renderNameDetail','renderShabdCategory','renderMythCountSelect','renderMythReadList','renderQuizCountSelect','renderMonthDetail','renderMoreSettings','renderBackup','renderMoreAbout','renderHowTo','renderQibla',].forEach(n=>navWrap(n,1));
navWrap('renderQuranHome',0);
navWrap('renderTajweedMenu',1);
navWrap('renderQuranSigns',3);
navWrap('renderQuranReader',2);
navWrap('renderTajweedRules',2);
navWrap('renderTajweedGuide',3);
navWrap('renderQuranIndex',3);
navWrap('renderGlobalSearch',0);
navWrap('renderAzaan',0);
navWrap('renderAzaanSettings',1);
navWrap('renderNafilSettings',1);
navWrap('renderCalcSettings',1);
navWrap('renderIqamahSettings',1);
['renderShabdDetail','renderQuizQuestion','renderQuizResult','renderMythQuizQuestion','renderMythQuizResult'].forEach(n=>navWrap(n,2));
navWrap('renderReviewList',3);
(function(){
  const t = document.getElementById('detailTitle');
  let last = t.textContent;
  new MutationObserver(()=>{
    if(t.textContent !== last){ last = t.textContent; document.getElementById('detailBody').scrollTop = 0; }
  }).observe(t, { childList:true, characterData:true, subtree:true });
})();

/* init calendar/ramzan lazily on first view already handled by tab click */

/* ============================================================
   QAZA NAMAZ TRACKER
   ============================================================ */
const QAZA_KEYS = [['fajr','Fajr','🌅'],['zuhr','Zuhr','☀️'],['asr','Asr','🌇'],['maghrib','Maghrib','🌆'],['isha','Isha','🌃'],['witr','Witr','🌙']];
function qazaState(){
  if(!state.qaza) state.qaza = {};
  QAZA_KEYS.forEach(([k])=>{ if(typeof state.qaza[k]!=='number') state.qaza[k] = 0; });
  if(!state.qazaDone) state.qazaDone = {};
  return state.qaza;
}
function qazaTotal(){ const q = qazaState(); return QAZA_KEYS.reduce((a,[k])=> a + q[k], 0); }
function qazaDoneOn(d){ return (state.qazaDone||{})[dayKey(d)] || 0; }
function updateQazaBadge(){
  const sub = document.getElementById('qazaSub');
  if(!sub) return;
  const total = qazaTotal();
  sub.textContent = total>0 ? `${total} baaki` : '';
}
updateQazaBadge();
function renderQaza(){
  const q = qazaState();
  updateQazaBadge();
  document.getElementById('detailTitle').textContent = 'Qaza Namaz';
  document.getElementById('detailBody').innerHTML = `
    <div class="ramzan-card qz-total">
      <div class="qz-big">${qazaTotal()}</div>
      <div class="qz-sub">Kul qaza namazein baaki</div>
      <div class="qz-today">Aaj padhi gayi qaza: <b>${qazaDoneOn(new Date())}</b></div>
    </div>
    <div class="section-title">Namaz-wari Hisaab</div>
    ${QAZA_KEYS.map(([k,l,ic])=>`<div class="qz-row">
      <div class="qz-name">${ic} ${l}</div>
      <input class="qz-count" type="number" inputmode="numeric" min="0" data-k="${k}" value="${q[k]}" aria-label="${l} ki qaza ginti">
      <button class="qz-btn add" data-add="${k}" aria-label="${l} ki ek qaza jodein">＋</button>
      <button class="qz-btn done" data-done="${k}" ${q[k]<=0?'disabled':''}>✓ Padh Li</button>
    </div>`).join('')}
    <div class="section-title">Purani Qaza Jodein</div>
    <div class="ramzan-card" style="margin:0 0 14px;">
      <div class="qz-note">Kitne din ki qaza baaki hai? Har namaz (Witr samet) mein utne din jud jayenge.</div>
      <div class="chip-row" style="margin-bottom:10px;">
        ${[['30 din',0,0,30],['6 mahine',0,6,0],['1 saal',1,0,0],['5 saal',5,0,0]].map(([l,y,m,d])=>`<div class="chip" data-y="${y}" data-m="${m}" data-d="${d}">${l}</div>`).join('')}
      </div>
      <div class="qz-custom">
        <label>Saal<input id="qzYears" type="number" inputmode="numeric" min="0" placeholder="0"></label>
        <label>Mahine<input id="qzMonths" type="number" inputmode="numeric" min="0" placeholder="0"></label>
        <label>Din<input id="qzDays" type="number" inputmode="numeric" min="0" placeholder="0"></label>
      </div>
      <div class="qz-preview" id="qzPreview">Kul: 0 din</div>
      <button id="qzBulkBtn" class="qz-btn add full">Sab mein Jodein</button>
    </div>
    <div class="section-title">Reset</div>
    <div class="ramzan-card" style="margin:0 0 14px;">
      <button class="qz-btn danger full" id="qzResetLeft" style="margin-bottom:10px;">↺ Baaki Qaza Reset Karein (sab 0)</button>
      <button class="qz-btn danger full" id="qzResetDone">↺ Padhi Gayi Qaza ka Record Reset Karein</button>
    </div>
    <div class="backup-note">Yeh aapka apna hisaab hai, sirf isi phone mein save hota hai.</div>
  `;
  const body = document.getElementById('detailBody');
  body.querySelectorAll('.qz-count').forEach(inp=>{
    inp.onchange = ()=>{ q[inp.dataset.k] = Math.max(0, parseInt(inp.value)||0); saveState(); renderQaza(); };
  });
  body.querySelectorAll('[data-add]').forEach(b=>{
    b.onclick = ()=>{ q[b.dataset.add]++; saveState(); renderQaza(); };
  });
  body.querySelectorAll('[data-done]').forEach(b=>{
    b.onclick = ()=>{
      const k = b.dataset.done;
      if(q[k]<=0) return;
      q[k]--;
      const dk = dayKey(new Date());
      state.qazaDone[dk] = (state.qazaDone[dk]||0) + 1;
      saveState();
      renderQaza();
      showToast('Ek qaza padh li, Allah qubool farmaye');
    };
  });
  const qzInputs = ['qzYears','qzMonths','qzDays'].map(id=>document.getElementById(id));
  const qzTotalDays = ()=> (parseInt(qzInputs[0].value)||0)*365 + (parseInt(qzInputs[1].value)||0)*30 + (parseInt(qzInputs[2].value)||0);
  const qzUpdatePreview = ()=>{ document.getElementById('qzPreview').textContent = 'Kul: ' + qzTotalDays() + ' din (har namaz mein judenge)'; };
  qzInputs.forEach(i=> i.oninput = qzUpdatePreview);
  body.querySelectorAll('[data-y]').forEach(c=>{
    c.onclick = ()=>{
      qzInputs[0].value = c.dataset.y!=='0' ? c.dataset.y : '';
      qzInputs[1].value = c.dataset.m!=='0' ? c.dataset.m : '';
      qzInputs[2].value = c.dataset.d!=='0' ? c.dataset.d : '';
      qzUpdatePreview();
    };
  });
  document.getElementById('qzBulkBtn').onclick = ()=>{
    const n = qzTotalDays();
    if(n<1){ showToast('Saal, mahine ya din likhein'); return; }
    QAZA_KEYS.forEach(([k])=>{ q[k] += n; });
    saveState();
    renderQaza();
    showToast(n+' din ki qaza jud gayi');
  };
  const twoStep = (btn, label, action)=>{
    let armed = null;
    btn.onclick = ()=>{
      if(armed){ clearTimeout(armed); armed = null; action(); return; }
      btn.textContent = 'Pakka? Dobara dabayein';
      armed = setTimeout(()=>{ armed = null; btn.textContent = label; }, 4000);
    };
  };
  twoStep(document.getElementById('qzResetLeft'), '↺ Baaki Qaza Reset Karein (sab 0)', ()=>{
    QAZA_KEYS.forEach(([k])=>{ q[k] = 0; });
    saveState(); renderQaza(); showToast('Baaki qaza reset ho gayi');
  });
  twoStep(document.getElementById('qzResetDone'), '↺ Padhi Gayi Qaza ka Record Reset Karein', ()=>{
    state.qazaDone = {};
    saveState(); renderQaza(); showToast('Padhi gayi qaza ka record reset ho gaya');
  });
}

/* ============================================================
   APP INSTALL (Add to Home Screen)
   ============================================================ */
let deferredInstall = null;
window.addEventListener('beforeinstallprompt', (e)=>{ e.preventDefault(); deferredInstall = e; });
window.addEventListener('appinstalled', ()=>{ deferredInstall = null; showToast('App install ho gayi'); });
function isStandalone(){
  return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
}
function renderInstall(){
  document.getElementById('detailTitle').textContent = 'App Install Karein';
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  let action;
  if(isStandalone()){
    action = `<div class="ramzan-card" style="margin:0 0 14px; text-align:center;">✅ App pehle se install hai.</div>`;
  } else if(deferredInstall){
    action = `<button id="installBtn" class="backup-btn">📲 Abhi Install Karein</button>`;
  } else if(ios){
    action = `<div class="ramzan-card" style="margin:0 0 14px; line-height:1.8;">${L({rur:'<b>iPhone / iPad par:</b>', en:'<b>On iPhone / iPad:</b>'})}<br>${L({rur:'1. Safari mein neeche <b>Share</b> (⬆️) dabayein.', en:'1. In Safari, tap <b>Share</b> (⬆️) at the bottom.'})}<br>${L({rur:'2. <b>Add to Home Screen</b> chunein.', en:'2. Choose <b>Add to Home Screen</b>.'})}<br>${L({rur:'3. <b>Add</b> dabayein.', en:'3. Tap <b>Add</b>.'})}</div>`;
  } else {
    action = `<div class="ramzan-card" style="margin:0 0 14px; line-height:1.8;">${L({rur:'<b>Android / Chrome par:</b>', en:'<b>On Android / Chrome:</b>'})}<br>${L({rur:'1. Browser ke menu (⋮) ko kholein.', en:'1. Open the browser menu (⋮).'})}<br>${L({rur:'2. <b>Install app</b> ya <b>Add to Home screen</b> chunein.', en:'2. Choose <b>Install app</b> or <b>Add to Home screen</b>.'})}<br>${L({rur:'3. <b>Install</b> dabayein.', en:'3. Tap <b>Install</b>.'})}</div>`;
  }
  document.getElementById('detailBody').innerHTML = `
    <div class="backup-note">Waqt24 ko apni home screen par rakhein, alag app ki tarah khulti hai, tez chalti hai aur internet ke baghair bhi kaam karti hai.</div>
    ${action}
  `;
  const btn = document.getElementById('installBtn');
  if(btn) btn.onclick = async ()=>{
    try{ deferredInstall.prompt(); await deferredInstall.userChoice; }catch(e){}
    deferredInstall = null;
    renderInstall();
  };
}

/* ============================================================
   ROZANA HADAF (daily goal ring on Ma'rifat)
   ============================================================ */
function markReadDay(){
  if(!state.readDays) state.readDays = {};
  state.readDays[dayKey(new Date())] = true;
  saveState();
}
/* Activity flags for the goal: one true per day, stored in state[flag][dayKey] */
function markDayFlag(flag){ if(!state[flag]) state[flag] = {}; state[flag][dayKey(new Date())] = true; saveState(); }
function flagOn(flag, d){ return !!((state[flag] || {})[dayKey(d)]); }
/* Pool of daily tasks. Namaz is always in; two others are picked at random for each day. */
const GOAL_POOL = [
  {id:'namaz',  ic:'🕌', lbl:{rur:'Aaj ki paanchon Farz namaz mark karein', en:'Mark all five Farz prayers today'}, go:{tab:'home'}, done:d=>FIVE.every(p=>!!state.status[statusKey(d,p)])},
  {id:'dua',    ic:'🤲', lbl:{rur:'Ek dua ya hadees padhein', en:'Read one dua or hadith'}, go:{tab:'explore', open:'dua'}, done:d=>!!((state.readDays||{})[dayKey(d)])},
  {id:'lafz',   ic:'🔤', lbl:{rur:'Ek lafz yaad karein ya mark karein', en:'Learn or mark one word'}, go:{tab:'explore', open:'dailyWord'}, done:d=>!!((state.learnDays||{})[dayKey(d)])},
  {id:'quiz',   ic:'🧠', lbl:{rur:'Ek quiz khelein', en:'Play one quiz'}, go:{tab:'explore', open:'quiz'}, done:d=>(state.quizLog||[]).some(x=>dayKey(new Date(x.t))===dayKey(d))},
  {id:'names',  ic:'💚', lbl:{rur:'Ek Asma-ul-Husna ya Naam padhein', en:'Read one name of Allah or the Prophet ﷺ'}, go:{tab:'explore', open:'asma'}, done:d=>flagOn('nameDays', d)},
  {id:'aadaab', ic:'🪴', lbl:{rur:'Ek Aadaab-e-Zindagi topic padhein', en:'Read one Aadaab-e-Zindagi topic'}, go:{tab:'explore', open:'aadaab'}, done:d=>flagOn('aadaabDays', d)},
  {id:'shabd',  ic:'📚', lbl:{rur:'Ek Khaas Shabd padhein', en:'Read one Special Word'}, go:{tab:'explore', open:'khaasShabd'}, done:d=>flagOn('shabdDays', d)},
  {id:'qword',  ic:'📗', lbl:{rur:"Ek Qur'ani lafz ka matlab padhein", en:'Read the meaning of one Quranic word'}, go:{tab:'explore', open:'quranWords'}, done:d=>flagOn('qwordDays', d)},
  {id:'qaza',   ic:'🧎', lbl:{rur:'Ek qaza namaz ada karein', en:'Make up one qaza prayer'}, go:{tab:'more', open:'qaza'}, done:d=>qazaDoneOn(d)>0},
  {id:'tilawat', ic:'📖', lbl:{rur:"Aaj ki Qur'an tilawat ka target poora karein", en:'Meet today’s Quran reading target'}, go:{tab:'explore', open:'quran'}, done:d=>tilawatCount(d) >= tilawatTarget()},
];
const GOAL_TILAWAT_FROM = new Date(2026, 9, 22).getTime();
/* The same date always gives the same three tasks, and different dates give different ones */
function goalTasksFor(d){
  const k = dayKey(d);
  let seed = 7; for(const ch of k) seed = (seed*31 + ch.charCodeAt(0)) >>> 0;
  const round = goalRound(d);
  seed = (seed + round*7919) >>> 0; // each change of goal today gives a new set
  const rnd = ()=>{ seed = (seed*1664525 + 1013904223) >>> 0; return seed/4294967296; };
  const others = GOAL_POOL.slice(1).filter(t=> t.id!=='tilawat' || d.getTime() >= GOAL_TILAWAT_FROM);
  for(let i=others.length-1; i>0; i--){ const j = Math.floor(rnd()*(i+1)); [others[i], others[j]] = [others[j], others[i]]; }
  return [GOAL_POOL[0], ...others.slice(0,2)].map(t=>({ id:t.id, ic:t.ic, label:t.lbl, go:t.go, done:t.done(d) }));
}
function goalTasks(){ return goalTasksFor(new Date()); }
/* How many times the goal was changed on a day (0 to GOAL_MAX_CHANGES) */
const GOAL_MAX_CHANGES = 3;
function goalRound(d){ return ((state.goalRound || {})[dayKey(d)]) || 0; }
function changeTodayGoal(){
  if(!state.goalRound) state.goalRound = {};
  const k = dayKey(new Date());
  const used = state.goalRound[k] || 0;
  if(used >= GOAL_MAX_CHANGES) return;
  state.goalRound[k] = used + 1;
  saveState();
  renderGoalCard();
  showToast(L({rur:'Nayi hadaf aa gayi', en:'New goal set'}));
}
/* Last seven days: a dot is filled when that day's goal was completed */
function goalWeek(){
  const out = [];
  for(let i=6; i>=0; i--){
    const d = new Date(); d.setDate(d.getDate() - i);
    out.push({ d, ok: goalTasksFor(d).every(t=>t.done), today: i===0 });
  }
  return out;
}
/* Small summary of today's goal, shown in Deegar; tapping it opens the full card in Ma'rifat */
function renderGoalMini(){
  const el = document.getElementById('goalMini');
  if(!el) return;
  const tasks = goalTasks();
  /* One line: the goal's icon, its title, then one icon per task (a tick when done, faded when not) */
  el.innerHTML = `<button class="goal-mini-card" id="goalMiniBtn">
    <span class="gm-ic">🎯</span>
    <span class="gm-title">${L({rur:'Rozana Hadaf', en:'Daily Goal'})}</span>
    <span class="gm-tasks">${tasks.map(t=>`<span class="gm-task ${t.done?'done':''}" title="${t.done?'':''}">${t.done?'✅':t.ic}</span>`).join('')}</span>
    <b class="goal-arrow">›</b>
  </button>`;
  document.getElementById('goalMiniBtn').onclick = ()=> goTask({ tab:'more' });
}
/* Tapping a task opens the place where it's done */
function goTask(go){
  const tab = document.querySelector(`.tab-btn[data-tab="${go.tab}"]`);
  if(tab) tab.click();
  if(go.open){ const el = document.querySelector(`#tab-${go.tab} [data-open="${go.open}"]`); if(el) el.click(); }
}
function renderGoalCard(){
  const el = document.getElementById('goalCard');
  if(!el) return;
  const tasks = goalTasks();
  const n = tasks.filter(t=>t.done).length;
  const week = goalWeek();
  const R = 34, C = 2*Math.PI*R;
  el.innerHTML = `<div class="goal-card">
    <svg class="goal-ring" viewBox="0 0 84 84" role="img" aria-label="Rozana Hadaf ${n} / ${tasks.length}">
      <circle cx="42" cy="42" r="${R}" class="goal-bg"></circle>
      <circle cx="42" cy="42" r="${R}" class="goal-fg${n>0?' n'+n:''}" stroke-dasharray="${C.toFixed(2)}" stroke-dashoffset="${(C*(1-n/tasks.length)).toFixed(2)}" transform="rotate(-90 42 42)"></circle>
      <text x="42" y="47" text-anchor="middle" class="goal-txt">${n}/${tasks.length}</text>
    </svg>
    <div class="goal-info">
      <div class="goal-title">${L({rur:'Rozana Hadaf', en:'Daily Goal'})}</div>
      ${tasks.map((t,i)=>`<button class="goal-item ${t.done?'done':''}" data-go="${i}"><span class="gi-check">${t.done?'✓':''}</span><span class="gi-txt">${L(t.label)}</span><b class="goal-arrow">›</b></button>`).join('')}
      <div class="goal-week">${week.map(w=>`<div class="goal-day ${w.ok?'ok':''} ${w.today?'today':''}" title="${dayKey(w.d)}"><i></i><small>${['S','M','T','W','T','F','S'][w.d.getDay()]}</small></div>`).join('')}</div>
      ${(()=>{ const left = GOAL_MAX_CHANGES - goalRound(new Date()); return left > 0
        ? `<button class="goal-reroll" id="goalRerollBtn">🔄 ${L({rur:'Nayi hadaf', en:'New goal'})} (${left} ${L({rur:'baaqi', en:'left'})})</button>`
        : `<div class="goal-reroll-note">${L({rur:'Aaj ki hadaf teen dafa badal chuki hai', en:'Today’s goal has been changed 3 times'})}</div>`; })()}
      ${n===tasks.length ? `<div class="goal-win">${L({rur:'Mashallah! Aaj ka hadaf mukammal 🎉', en:'Mashallah! Today’s goal is complete 🎉'})}</div>` : ''}
    </div>
  </div>`;
  el.querySelectorAll('[data-go]').forEach(btn=>{ btn.onclick = ()=> goTask(tasks[+btn.dataset.go].go); });
  const rr = document.getElementById('goalRerollBtn');
  if(rr) rr.onclick = changeTodayGoal;
  if(n===tasks.length) celebrate(el);
  renderGoalMini();
}
/* Confetti once per day, when the daily goal is first completed */
function celebrate(el){
  const key = new Date().toDateString();
  try{
    if(localStorage.getItem('waqt24_confetti')===key) return;
    localStorage.setItem('waqt24_confetti', key);
  }catch(e){}
  const box = el.querySelector('.goal-card');
  if(!box) return;
  const colours = ['#d4af37','#3fae6a','#3a9bd9','#c85a4a','#8b7fd6'];
  for(let i=0;i<28;i++){
    const p = document.createElement('span');
    p.className = 'confetti';
    p.style.left = (Math.random()*100)+'%';
    p.style.background = colours[i % colours.length];
    p.style.animationDelay = (Math.random()*0.3)+'s';
    p.style.animationDuration = (1.2+Math.random()*0.8)+'s';
    box.appendChild(p);
    setTimeout(()=>p.remove(), 2600);
  }
}

/* ============================================================
   BACKUP REMINDER NUDGE (Maskan)
   ============================================================ */
function openOverlay(fn){
  fn();
  document.getElementById('detailOverlay').classList.add('active'); cancelDetailClose();
  document.getElementById('detailBody').scrollTop = 0;
  pushModalState();
}
function backupDataCount(){
  const n = o => o && typeof o === 'object' ? Object.keys(o).length : 0;
  return n(state.status) + n(state.duaStatus) + n(state.roza) + (Array.isArray(state.bookmarks) ? state.bookmarks.length : n(state.bookmarks))
    + (state.quranMarks||[]).length + Object.values(state.qread||{}).reduce((a,x)=>a + x.length, 0) + n(state.learnDays) + (state.quizLog||[]).length + Object.values(state.qmanual||{}).reduce((a,x)=>a + x, 0);
}
function renderBackupNudge(){
  const el = document.getElementById('backupNudge');
  if(!el) return;
  if(!state.firstUse){ state.firstUse = Date.now(); saveState(); }
  const now = Date.now(), DAY = 86400000;
  // also due when a lot has been saved since the last backup (prayer marks, Yaad, bookmarks, reading...)
  const grown = state.lastBackup ? backupDataCount() - (state.backupDataCount || 0) : 0;
  const due = state.lastBackup ? (now - state.lastBackup > 30*DAY || (grown >= 40 && now - state.lastBackup > 3*DAY)) : (now - state.firstUse > 7*DAY);
  if(!due || now < (state.backupSnooze||0)){ el.style.display = 'none'; return; }
  const ago = !state.lastBackup ? 'Abhi tak koi backup nahi liya.' : grown >= 40 ? `Pichle backup ke baad ${grown} nayi cheezein save hui hain.` : `Aakhri backup ${Math.floor((now-state.lastBackup)/DAY)} din pehle tha.`;
  el.style.display = 'flex';
  el.innerHTML = `<div class="nudge-txt">💾 <b>Backup le lein</b><span>${ago} Data sirf isi phone mein hai.</span></div>
    <div class="nudge-btns"><button id="nudgeNow">Abhi</button><button id="nudgeLater" class="ghost">Baad mein</button></div>`;
  document.getElementById('nudgeNow').onclick = ()=> openOverlay(renderBackup);
  document.getElementById('nudgeLater').onclick = ()=>{ state.backupSnooze = Date.now() + 7*DAY; saveState(); renderBackupNudge(); };
}

/* ============================================================
   ACCESSIBILITY helpers (labels + keyboard access) and TEXT SIZE
   ============================================================ */
const A11Y_SYMBOL_LABELS = { '✓':'Padh Li', '~':'Qaza Padhi', '⏳':'Baaki Hai', '✗':'Nahi Padhi', '▶':'Chalaayein', '■':'Band karein', 'ⓘ':'Maloomat', '−':'Kam karein', '+':'Zyada karein', '‹':'Wapas', '›':'Aage', '✕':'Saaf karein', '↺':'Reset', '⤴':'Share', '☆':'Pasandeeda', '★':'Pasandeeda', '＋':'Jodein', '🖼':'Image share' };
const A11Y_CLICKABLE = '.aad-card, .quran-idx-item, .gs-item, .lang-opt, .more-item, .chip, .name-tile, .shabd-row, .dw-row, .dua-card, .hadees-item, .shabd-cat-card, .quiz-cat-btn';
function emptyStateIcons(root){
  (root||document).querySelectorAll('.empty-state:not([data-ic])').forEach(el=>{
    const t = el.textContent.toLowerCase();
    el.dataset.ic = /nishaan|bookmark/.test(t) ? '🔖' : /pasandeeda|favourite/.test(t) ? '⭐' : /nahi mil|nothing found|koi .* nahi|no .* found/.test(t) ? '🔍' : /lafz|word/.test(t) ? '📚' : '🌿';
  });
}
function a11yFix(root){
  emptyStateIcons(root);
  (root||document).querySelectorAll('button:not([aria-label])').forEach(b=>{
    const t = (b.getAttribute('title') || A11Y_SYMBOL_LABELS[(b.textContent||'').trim()] || '');
    if(t) b.setAttribute('aria-label', state.lang==='en' ? i18nCore(t) : t);
  });
  (root||document).querySelectorAll(A11Y_CLICKABLE).forEach(el=>{
    if(el.tagName==='BUTTON' || el.hasAttribute('role')) return;
    el.setAttribute('role','button'); el.setAttribute('tabindex','0');
  });
}
let a11yTimer = null;
new MutationObserver(()=>{ clearTimeout(a11yTimer); a11yTimer = setTimeout(()=>a11yFix(), 60); }).observe(document.body, { childList:true, subtree:true });
document.addEventListener('keydown', (e)=>{
  if((e.key==='Enter' || e.key===' ') && e.target.getAttribute && e.target.getAttribute('role')==='button' && e.target.tagName!=='BUTTON'){
    e.preventDefault(); e.target.click();
  }
});
const TEXT_SCALES = { s:.92, m:1, l:1.12, xl:1.25, xxl:1.4 };
const AR_SCALES = { m:1, l:1.2, xl:1.4, xxl:1.65 };
function applyTextScale(){
  const k = state.textScale || 'm';
  const z = TEXT_SCALES[k] || 1;
  document.documentElement.style.zoom = z;
  document.documentElement.style.setProperty('--zoom', z);
  document.documentElement.style.setProperty('--arz', AR_SCALES[state.arScale || 'm'] || 1);
}
applyTextScale();
a11yFix();
renderGoalCard();
renderBackupNudge();
document.addEventListener('visibilitychange', ()=>{ if(!document.hidden){ renderBackupNudge(); renderGoalCard(); } });

/* ============================================================
   UPDATE BANNER (new version ready)
   ============================================================ */
function showUpdateBanner(){
  if(document.getElementById('updateBanner')) return;
  const el = document.createElement('div');
  el.id = 'updateBanner';
  el.setAttribute('role','status');
  el.innerHTML = `<span>🔄 Naya version tayyar hai</span><button id="updateNow">Refresh karein</button><button id="updateLater" class="ghost" aria-label="Baad mein">✕</button>`;
  document.body.appendChild(el);
  document.getElementById('updateNow').onclick = ()=> location.reload();
  document.getElementById('updateLater').onclick = ()=> el.remove();
}

/* ============================================================
   LANGUAGE, English UI translation layer (dictionary in i18n.js)
   ============================================================ */
function i18nCore(str){
  if(typeof I18N_EN==='undefined') return str;
  const t = str.trim();
  if(!t) return str;
  if(I18N_EN[t]!==undefined) return str.replace(t, I18N_EN[t]);
  const m = t.match(/^([^\p{L}\p{N}]*)(.*?)([^\p{L}\p{N})?!.']*)$/su);
  if(m && m[2] && I18N_EN[m[2]]!==undefined) return str.replace(t, m[1]+I18N_EN[m[2]]+m[3]);
  const pats = (typeof I18N_PATTERNS!=='undefined' ? I18N_PATTERNS : []);
  for(const [re,fn] of pats){
    const mm = t.match(re);
    if(mm) return str.replace(t, fn(mm));
  }
  if(m && m[2]){
    for(const [re,fn] of pats){
      const mm = m[2].match(re);
      if(mm) return str.replace(t, m[1]+fn(mm)+m[3]);
    }
  }
  return str.replace(/Ramzan/g, 'Ramadan');
}
function i18nWalk(root){
  if(state.lang!=='en') return;
  const walker = document.createTreeWalker(root||document.body, NodeFilter.SHOW_TEXT);
  const nodes = []; let n;
  while((n = walker.nextNode())) nodes.push(n);
  nodes.forEach(node=>{
    const p = node.parentNode;
    if(!p || /^(SCRIPT|STYLE|TEXTAREA)$/.test(p.nodeName)) return;
    if(p.closest && p.closest('[data-no-i18n]')) return;
    const v = node.nodeValue, nv = i18nCore(v);
    if(nv!==v) node.nodeValue = nv;
  });
  (root||document).querySelectorAll('[placeholder],[title],[aria-label]').forEach(el=>{
    ['placeholder','title','aria-label'].forEach(a=>{
      const v = el.getAttribute(a);
      if(v){ const nv = i18nCore(v); if(nv!==v) el.setAttribute(a, nv); }
    });
  });
}
if(!state.setupDone){
  if(!IS_FIRST_RUN && !state.setupStep){ state.setupDone = true; saveState(); } // existing users: never shown
  else showSetup(state.setupStep || 'city');
}
renderContinueCard();
if(state.lang==='en'){
  document.documentElement.lang = 'en';
  let i18nTimer = null;
  // Only the nodes that were added or changed are translated, instead of re-reading the whole page
  const i18nPending = new Set();
  new MutationObserver(muts=>{
    muts.forEach(m=>{ if(m.type==='characterData') i18nPending.add(m.target); else m.addedNodes.forEach(n=>i18nPending.add(n)); });
    clearTimeout(i18nTimer);
    i18nTimer = setTimeout(()=>{
      const list = [...i18nPending]; i18nPending.clear();
      list.forEach(n=>{
        if(!n.isConnected) return;
        if(n.nodeType===3){
          const par = n.parentNode;
          if(!par || /^(SCRIPT|STYLE|TEXTAREA)$/.test(par.nodeName) || (par.closest && par.closest('[data-no-i18n]'))) return;
          const v = n.nodeValue, nv = i18nCore(v); if(nv!==v) n.nodeValue = nv;
        } else if(n.nodeType===1){
          i18nWalk(n);
          ['placeholder','title','aria-label'].forEach(a=>{ const v = n.getAttribute && n.getAttribute(a); if(v){ const nv = i18nCore(v); if(nv!==v) n.setAttribute(a, nv); } });
        }
      });
    }, 30);
  }).observe(document.body, { childList:true, subtree:true, characterData:true });
  i18nWalk();
}

/* ============================================================
   PWA: service worker registration (offline support)
   ============================================================ */
if('serviceWorker' in navigator){
  let hadController = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener('controllerchange', ()=>{
    if(hadController) showUpdateBanner();
    hadController = true;
  });
  window.addEventListener('load', ()=>{
    navigator.serviceWorker.register('sw.js').then(reg=>{
      document.addEventListener('visibilitychange', ()=>{ if(!document.hidden) reg.update().catch(()=>{}); });
      setInterval(()=> reg.update().catch(()=>{}), 3600000);
    }).catch(()=>{});
  });
}

/* Language switch: fade out, reload (the English layer starts on load), fade in on the same tab and settings page */
function reloadSmooth(backToSettings){
  try{
    const tab = (document.querySelector('.tab-btn.active') || {}).dataset;
    sessionStorage.setItem('waqt24_resume', JSON.stringify({ tab: tab ? tab.tab : 'home', settings: backToSettings ? settingsTab : null }));
  }catch(e){}
  document.body.style.transition = 'opacity .16s ease';
  document.body.style.opacity = '0';
  setTimeout(()=> location.reload(), 170);
}
(()=>{
  let r = null;
  try{ r = JSON.parse(sessionStorage.getItem('waqt24_resume') || 'null'); sessionStorage.removeItem('waqt24_resume'); }catch(e){}
  if(!r) return;
  try{
    const b = document.querySelector('.tab-btn[data-tab="' + r.tab + '"]'); if(b && r.tab !== 'home') b.click();
    if(r.settings){ settingsTab = r.settings; openOverlay(renderMoreSettings); }
  }catch(e){}
})();

/* ============================================================
   MOTION PASS 2 (see the matching CSS block)
   ============================================================ */
(()=>{
  const RM = ()=> window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const EASE = 'cubic-bezier(.2,.8,.2,1)';

  /* ---- 1. Highlight glide: the ring slides from the old live prayer to the new one ---- */
  const _renderHome = renderHome;
  renderHome = function(){
    const list = document.getElementById('timesList');
    const old = list && list.querySelector('.time-row.current');
    const snap = old ? { key: old.dataset.key, top: old.offsetTop, h: old.offsetHeight } : null;
    const out = _renderHome.apply(this, arguments);
    try{ glide(snap); }catch(e){}
    return out;
  };
  function glide(snap){
    if(!snap || RM() || (typeof instantScroll !== 'undefined' && instantScroll)) return;
    const list = document.getElementById('timesList');
    if(!list || !list.offsetParent) return;
    const cur = list.querySelector('.time-row.current');
    if(!cur || cur.dataset.key === snap.key) return;
    const type = ['fard','nafil','special','meal'].find(c=> cur.classList.contains(c)) || 'accent';
    const ring = document.createElement('div');
    ring.className = 'glide-ring';
    ring.style.setProperty('--gc', `var(--${type})`);
    ring.style.borderRadius = getComputedStyle(cur).borderRadius;
    ring.style.top = cur.offsetTop + 'px';
    ring.style.height = cur.offsetHeight + 'px';
    list.appendChild(ring);
    cur.classList.add('glide-wait');
    const finish = ()=>{ cur.classList.remove('glide-wait'); ring.animate([{opacity:1},{opacity:0}], {duration:220, fill:'forwards'}).onfinish = ()=> ring.remove(); };
    const a = ring.animate(
      [{ top: snap.top+'px', height: snap.h+'px' }, { top: cur.offsetTop+'px', height: cur.offsetHeight+'px' }],
      { duration: 620, easing: 'cubic-bezier(.3,1.25,.45,1)' }
    );
    a.onfinish = finish; a.oncancel = finish;
  }

  /* ---- 2. Theme change: circle reveal from the tapped button, cross-fade for automatic changes ---- */
  let themeOrigin = null, themeSeen = true; // the first theme was already applied at load
  window.setThemeAttr = function(next){
    const root = document.documentElement;
    if(root.getAttribute('data-theme') === next){ themeSeen = true; return; }
    const first = !themeSeen; themeSeen = true;
    if(first || RM() || !document.startViewTransition){ root.setAttribute('data-theme', next); return; }
    const o = themeOrigin; themeOrigin = null;
    if(o) root.classList.add('vt-circle');
    const vt = document.startViewTransition(()=>{ root.setAttribute('data-theme', next); });
    if(o){
      vt.ready.then(()=>{
        const r = Math.hypot(Math.max(o.x, innerWidth - o.x), Math.max(o.y, innerHeight - o.y));
        root.animate({ clipPath: [`circle(0px at ${o.x}px ${o.y}px)`, `circle(${r}px at ${o.x}px ${o.y}px)`] },
          { duration: 650, easing: EASE, pseudoElement: '::view-transition-new(root)' });
      }).catch(()=>{});
    }
    vt.finished.finally(()=> root.classList.remove('vt-circle'));
  };
  document.addEventListener('click', e=>{
    if(e.target.closest('.theme-row button')) themeOrigin = { x:e.clientX, y:e.clientY };
  }, true);

  /* ---- 3. Tab bar: the indicator stretches toward the new tab and settles with a spring; the icon hops ---- */
  let tabAnim = false, lastX = null, lastW = null;
  document.querySelectorAll('.tab-btn').forEach(b=> b.addEventListener('click', ()=>{
    tabAnim = true;
    if(!RM()){ b.classList.remove('hop'); void b.offsetWidth; b.classList.add('hop'); setTimeout(()=> b.classList.remove('hop'), 520); }
  }, true));
  moveTabIndicator = function(){
    const a = document.querySelector('#tabbar .tab-btn.active');
    const ind = document.getElementById('tabInd');
    if(!a || !ind) return;
    const nx = a.offsetLeft, nw = a.offsetWidth;
    if(tabAnim && !RM() && lastX !== null && (lastX !== nx || lastW !== nw)){
      const lo = Math.min(lastX, nx), span = Math.abs(nx - lastX) + Math.max(lastW, nw);
      ind.animate([
        { transform:`translateX(${lastX}px)`, width: lastW+'px' },
        { transform:`translateX(${lo}px)`, width: span+'px', offset:.42 },
        { transform:`translateX(${nx}px)`, width: nw+'px' }
      ], { duration: 520, easing: 'cubic-bezier(.34,1.3,.5,1)' });
    }
    tabAnim = false;
    ind.style.width = nw + 'px';
    ind.style.transform = `translateX(${nx}px)`;
    lastX = nx; lastW = nw;
  };
  moveTabIndicator();

  /* ---- 4. Drawn ticks + a distinct haptic per status ---- */
  const TICK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path style="--len:20" d="M5.5 12.8l4.2 4.2L18.6 7.4"/></svg>';
  const CROSS = '<svg viewBox="0 0 24 24" aria-hidden="true"><path style="--len:14" d="M7 7l10 10"/><path style="--len:14" d="M17 7L7 17"/></svg>';
  function enhanceTicks(root){
    (root || document).querySelectorAll('.dot-btn.on-green:not([data-tk]), .dot-btn.on-red:not([data-tk])').forEach(b=>{
      const t = b.textContent.trim();
      if(t === '✓' && b.classList.contains('on-green')){ b.innerHTML = TICK; b.dataset.tk = 1; }
      else if(t === '✗' && b.classList.contains('on-red')){ b.innerHTML = CROSS; b.dataset.tk = 1; }
    });
  }
  document.addEventListener('click', e=>{
    const b = e.target.closest('.dot-btn'); if(!b) return;
    const d = b.dataset;
    const want = d.set || d.s || (d.t === 'prayed' ? 'green' : null) || (d.zd === 'done' ? 'green' : d.zd === 'baaki' ? 'red' : null);
    if(want && b.classList.contains('on-' + want)) buzz(6);               // clearing
    else if(want === 'green') buzz([10, 30, 14]);
    else if(want === 'yellow') buzz(14);
    else if(want === 'red') buzz(22);
    else buzz(8);
    // the click handler re-renders; give the new buttons their drawn ticks right away
    requestAnimationFrame(()=> enhanceTicks());
  }, true);

  /* ---- 5. Swipe back from the left edge ---- */
  (()=>{
    const ov = document.getElementById('detailOverlay');
    let st = null;
    const under = ()=> document.querySelector('.screen.active');
    const setUnder = (p, anim)=>{ const u = under(); if(!u) return; u.style.transition = anim ? `transform .24s ${EASE}` : 'none'; u.style.transform = p === null ? '' : `translateX(${-(1 - p) * 26}px)`; };
    ov.addEventListener('touchstart', e=>{
      st = null;
      if(!ov.classList.contains('active') || ov.classList.contains('closing') || RM()) return;
      if(typeof quranReaderOpen !== 'undefined' && quranReaderOpen) return;
      const t = e.touches[0], r = ov.getBoundingClientRect();
      if(t.clientX - r.left > 24) return;
      st = { x:t.clientX, y:t.clientY, t:performance.now(), dx:0, live:false, w:r.width };
    }, { passive:true });
    ov.addEventListener('touchmove', e=>{
      if(!st) return;
      const t = e.touches[0], dx = t.clientX - st.x, dy = t.clientY - st.y;
      if(!st.live){
        if(Math.abs(dy) > 8 && Math.abs(dy) > Math.abs(dx)){ st = null; return; }
        if(dx > 8){ st.live = true; ov.style.transition = 'none'; ov.classList.add('swiping'); } else return;
      }
      e.preventDefault();
      st.dx = Math.max(0, dx);
      ov.style.transform = `translateX(${st.dx}px)`;
      setUnder(Math.min(1, st.dx / st.w), false);
    }, { passive:false });
    const end = ()=>{
      if(!st || !st.live){ st = null; return; }
      const s = st; st = null;
      const v = s.dx / Math.max(1, performance.now() - s.t);
      const done = s.dx > s.w * 0.35 || (v > 0.6 && s.dx > 40);
      ov.style.transition = `transform .24s ${EASE}`;
      if(done){
        ov.style.transform = `translateX(${s.w}px)`;
        setUnder(1, true);
        setTimeout(()=>{
          ov.classList.add('swipe-gone'); ov.style.transition = 'none'; ov.style.transform = '';
          setUnder(null, false);
          closeModal();
          setTimeout(()=>{
            ov.classList.remove('swipe-gone', 'swiping'); ov.style.transition = '';
            // only stepped back one level inside the overlay: slide the earlier screen in
            if(ov.classList.contains('active') && !ov.classList.contains('closing')) ov.animate([{ transform:'translateX(-24px)', opacity:0 }, { transform:'none', opacity:1 }], { duration:220, easing:EASE });
          }, 380);
        }, 230);
      } else {
        ov.style.transform = '';
        setUnder(0, true);
        setTimeout(()=>{ ov.style.transition = ''; ov.classList.remove('swiping'); setUnder(null, false); }, 260);
      }
    };
    ov.addEventListener('touchend', end);
    ov.addEventListener('touchcancel', end);
  })();

  /* ---- 6. Tasbeeh: ripple at the tap point, previous number rolls away, ring burst on the target ---- */
  document.addEventListener('pointerdown', e=>{
    const b = e.target.closest('.tasbeeh-tap'); if(!b || RM()) return;
    const r = b.getBoundingClientRect();
    const s = document.createElement('span');
    s.className = 'tap-ripple';
    s.style.left = (e.clientX - r.left) + 'px'; s.style.top = (e.clientY - r.top) + 'px';
    b.appendChild(s);
    s.addEventListener('animationend', ()=> s.remove());
  }, true);
  function burst(countEl){
    const host = countEl.parentElement; if(!host || RM()) return;
    if(getComputedStyle(host).position === 'static') host.style.position = 'relative';
    for(let i = 0; i < 3; i++){
      const r = document.createElement('i');
      r.className = 'tasbeeh-ring';
      r.style.left = (countEl.offsetLeft + countEl.offsetWidth / 2) + 'px';
      r.style.top = (countEl.offsetTop + countEl.offsetHeight / 2) + 'px';
      r.style.animationDelay = (i * 0.12) + 's';
      host.appendChild(r);
      r.addEventListener('animationend', ()=> r.remove());
    }
  }
  const body = document.getElementById('detailBody');
  new MutationObserver(muts=>{
    const seen = new Set();
    muts.forEach(m=>{
      if(m.type === 'childList' && m.target.classList && m.target.classList.contains('tasbeeh-count')){
        const prev = [...m.removedNodes].filter(n=> n.nodeType === 3).map(n=> n.data).join('');
        if(prev) m.target.dataset.prev = prev;
      } else if(m.type === 'attributes' && m.target.classList.contains('tasbeeh-count') && !seen.has(m.target)){
        seen.add(m.target);
        if(m.target.classList.contains('hit') && !(m.oldValue || '').includes('hit')) burst(m.target);
      }
    });
  }).observe(body, { subtree:true, childList:true, attributes:true, attributeFilter:['class'], attributeOldValue:true });

  /* ---- 7. Stagger index for list children (first 11 only; the rest use the capped default) ---- */
  const LISTS = '.more-list, .dua-grid, .hadees-list, .shabd-list, .quiz-cat-grid, .aad-grid, .mf-grid, .names-grid';
  function indexList(el){ const kids = el.children; for(let i = 0; i < kids.length && i < 11; i++) kids[i].style.setProperty('--i', i); }

  /* ---- 8. Ambient sky ---- */
  const SKY = { 'waqt-morning':'dawn', 'waqt-bright':'day', 'waqt-dim':'asr', 'waqt-grey':'dusk', 'waqt-dark':'night', 'waqt-darkest':'deep' };
  const home = document.getElementById('tab-home');
  const amb = document.createElement('div'); amb.id = 'ambient'; amb.setAttribute('aria-hidden', 'true');
  home.prepend(amb);
  function updateSky(){
    let key = 'isha'; try{ key = currentPrayerKey(); }catch(e){}
    const s = SKY[(PRAYER_META[key] && PRAYER_META[key].waqt) || 'waqt-dark'] || 'night';
    if(home.dataset.sky !== s) home.dataset.sky = s;
  }
  updateSky();
  setInterval(updateSky, 60000);
  document.addEventListener('visibilitychange', ()=>{ if(!document.hidden) updateSky(); });

  /* One observer for the bits that follow DOM changes: list indexes, drawn ticks */
  let queued = false;
  new MutationObserver(muts=>{
    for(const m of muts){
      for(const n of m.addedNodes){
        if(n.nodeType !== 1) continue;
        if(n.parentElement && n.parentElement.matches(LISTS)) indexList(n.parentElement);
        if(n.matches(LISTS)) indexList(n);
        n.querySelectorAll && n.querySelectorAll(LISTS).forEach(indexList);
      }
    }
    if(!queued){ queued = true; requestAnimationFrame(()=>{ queued = false; enhanceTicks(); }); }
  }).observe(document.getElementById('app'), { childList:true, subtree:true });
  document.querySelectorAll(LISTS).forEach(indexList);
  enhanceTicks();
})();

/* ============================================================
   UI PASS (see the matching CSS block)
   ============================================================ */
(()=>{
  /* ---- Icons ---- */
  const S = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const ICON = {
    // tab bar
    home:      'M3 20h18M5 20v-7a7 7 0 0 1 14 0v7M12 6V3M10 20v-4a2 2 0 0 1 4 0v4',
    calendar:  '<rect x="4" y="5" width="16" height="15" rx="2.5"/><path d="M4 10h16M8 3v4M16 3v4"/>',
    explore:   'M2 9l10-5 10 5-10 5zM6 11.5V16c0 1.5 3 3 6 3s6-1.5 6-3v-4.5M22 9v6',
    more:      'M4 7h16M4 12h16M4 17h16',
    // lists
    quran:     'M4 5.5C4 5.5 7 4 12 6c5-2 8-.5 8-.5V19s-3-1.5-8 .5C7 17.5 4 19 4 19zM12 6v13.5',
    dua:       'M12 3l1.8 4.7 4.7 1.8-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8zM19 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z',
    hadees:    'M7 3h8l4 4v14H7zM15 3v4h4M10 12h6M10 16h6',
    asma:      'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10z',
    prophetNames:'M20 14.5A8 8 0 1 1 9.5 4 6.5 6.5 0 0 0 20 14.5z',
    quranWords:'M5 8l6 6M4 14l6-6 2-3M2 5h12M7 2h1M22 22l-5-10-5 10M14 18h6',
    aadaab:    'M12 21v-9M12 12c0-4 3-6 7-6 0 4-3 6-7 6zM12 14c0-3-2-5-6-5 0 3 2 5 6 5z',
    khaasShabd:'M5 4h10a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2zM17 8h2v12h-2M9 8h4',
    dailyWord: '<rect x="4" y="5" width="16" height="15" rx="2.5"/><path d="M4 10h16M8 3v4M16 3v4M8 14.5h8"/>',
    mythBusters:'M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z',
    quiz:      '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7M12 17h.01"/>',
    stats:     'M5 20v-9M12 20V5M19 20v-7',
    tasbeeh:   '<circle cx="12" cy="4.5" r="1.9"/><circle cx="18" cy="8.2" r="1.9"/><circle cx="18" cy="15.8" r="1.9"/><circle cx="12" cy="19.5" r="1.9"/><circle cx="6" cy="15.8" r="1.9"/><circle cx="6" cy="8.2" r="1.9"/>',
    azaan:     'M4 9v6h4l5 4V5L8 9zM16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11',
    qaza:      '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    hijriConv: 'M4 8h13M14 4l4 4-4 4M20 16H7M10 12l-4 4 4 4',
    islamicMonths:'<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 0 0 18z"/>',
    islamicEvents:'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z',
    ramzan:    'M18 14.5A7 7 0 1 1 10 5.5 5.5 5.5 0 0 0 18 14.5zM18 4l.7 1.6 1.6.7-1.6.7L18 8.6l-.7-1.6-1.6-.7 1.6-.7z',
    bookmarks: 'M7 3h10v18l-5-4-5 4z',
    settings:  '<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>',
    install:   'M12 4v11M7 11l5 5 5-5M5 20h14',
    raabta:    '<rect x="3.5" y="5.5" width="17" height="13" rx="2.5"/><path d="M4 7l8 6 8-6"/>'
  };
  const body = d => S(d.startsWith('<') ? d : `<path d="${d}"/>`);
  document.querySelectorAll('.tab-btn[data-tab]').forEach(b=>{ const ic = b.querySelector('.ic'), d = ICON[b.dataset.tab]; if(ic && d) ic.innerHTML = body(d); });
  document.querySelectorAll('.more-item[data-open]').forEach(it=>{ const ic = it.querySelector('.ic'), d = ICON[it.dataset.open]; if(ic && d) ic.innerHTML = body(d); });

  /* ---- Hero card: the live prayer, with the next one underneath. Full / slim strip / off (swipe or ✕ steps it down;
          Settings → Home Card brings it back). Small screens get the slim strip so the list keeps its room. ---- */
  const C = 138.23; // circumference of r=22
  const cd = ms => { const m = Math.max(0, Math.ceil(ms / 60000)); return m >= 60 ? Math.floor(m / 60) + 'h ' + String(m % 60).padStart(2, '0') + ' min' : m + ' min'; };
  const inTxt = ms => L({ rur: cd(ms) + ' mein', en: 'in ' + cd(ms) });
  let heroSession = null; /* closing/shrinking the card (✕ or swipe) lasts for this visit only; it returns on refresh or reopen */
  const heroMode = ()=>{ const m = heroSession || state.heroMode || 'full'; return (m === 'full' && window.matchMedia('(max-height:680px)').matches) ? 'strip' : m; };
  const iconOf = k => (PRAYER_META[k] && PRAYER_META[k].icon) || '🕌';
  function heroData(){
    const now = Date.now(), base = operatingDate(new Date());
    const list = [];
    [-1, 0, 1].forEach(d=> buildSchedule(new Date(base.getTime() + d * 86400000)).forEach(p=>{ if(FIVE.includes(p.key)) list.push(p); }));
    list.sort((a, b)=> a.start - b.start);
    const cur = list.filter(p=> p.start <= now && now < p.end).pop();
    const upcoming = list.filter(x=> x.start > now);
    let mode, p, prog, left, after;
    if(cur){ mode = 'now'; p = cur; prog = (now - p.start) / (p.end - p.start); left = p.end - now; after = upcoming[0]; }
    else {
      p = upcoming[0]; if(!p) return null;
      const prevEnd = list.filter(x=> x.end <= now).pop();
      const from = prevEnd ? +prevEnd.end : p.start - 4 * 3600000;
      mode = 'next'; prog = (now - from) / (p.start - from); left = p.start - now; after = upcoming[1];
    }
    return { now, mode, p, after, prog: Math.min(1, Math.max(0, prog)), left };
  }
  function renderHero(animate){
    const el = document.getElementById('homeHero'); if(!el) return;
    const vm = heroMode();
    if(vm === 'off' || !(homeFollowsToday || isSameDay(homeViewDate, new Date()))){ el.classList.add('hide'); el.dataset.k = ''; return; }
    const d = heroData(); if(!d){ el.classList.add('hide'); return; }
    const { now, mode, p, after, prog, left } = d;
    const key = vm + mode + p.key + (+p.start) + (after ? after.key : '');
    if(el.dataset.k !== key){
      el.dataset.k = key;
      el.classList.toggle('strip', vm === 'strip');
      const x = `<button class="hero-x" type="button" aria-label="${L({rur:'Card band karein', en:'Close card'})}">✕</button>`;
      const afterLbl = mode === 'now' ? L({rur:'Agla', en:'Next'}) : L({rur:'Phir', en:'Then'});
      if(vm === 'strip'){
        el.innerHTML = `<div class="hero-strip"><span class="hs-ic">${iconOf(p.key)}</span>
          <span class="hs-main"><b></b> · <span class="hs-left"></span></span>
          ${after ? `<span class="hs-next">${afterLbl} <b></b> <span class="hs-t"></span></span>` : ''}</div>${x}`;
        el.querySelector('.hs-main b').textContent = p.name;
        if(after){ el.querySelector('.hs-next b').textContent = after.name; el.querySelector('.hs-t').textContent = fmtTime(new Date(after.start)); }
      } else {
        el.innerHTML = `<div class="hero-main"><div class="hero-ring"><svg viewBox="0 0 54 54"><circle class="trk" cx="27" cy="27" r="22"/><circle class="bar" cx="27" cy="27" r="22" stroke-dashoffset="${C}"/></svg><div class="hero-ic">${iconOf(p.key)}</div></div>
          <div class="hero-txt"><div class="hero-k">${mode === 'now' ? L({rur:'Abhi ka waqt', en:'Now'}) : L({rur:'Agli namaz', en:'Next prayer'})}</div><div class="hero-n"></div><div class="hero-t"></div></div>
          <div class="hero-cd"><b></b><span>${mode === 'now' ? L({rur:'khatam hone mein', en:'time left'}) : L({rur:'shuru hone mein', en:'starts in'})}</span></div></div>
          ${after ? `<div class="hero-after"><span>${afterLbl}:</span><span class="ha-ic">${iconOf(after.key)}</span><b></b><span class="ha-t"></span><span class="in"></span></div>` : ''}${x}`;
        el.querySelector('.hero-n').textContent = p.name;
        el.querySelector('.hero-t').textContent = fmtTime(new Date(p.start)) + ' – ' + fmtTime(new Date(p.end));
        if(after){ el.querySelector('.hero-after b').textContent = after.name; el.querySelector('.ha-t').textContent = fmtTime(new Date(after.start)); }
        requestAnimationFrame(()=> requestAnimationFrame(()=>{ const bar = el.querySelector('.bar'); if(bar) bar.setAttribute('stroke-dashoffset', C * (1 - prog)); }));
      }
      if(animate){ el.classList.remove('hero-in'); void el.offsetWidth; el.classList.add('hero-in'); }
    }
    const bar = el.querySelector('.bar'); if(bar) bar.setAttribute('stroke-dashoffset', C * (1 - prog));
    const cdEl = el.querySelector('.hero-cd b'); if(cdEl) cdEl.textContent = cd(left);
    const hl = el.querySelector('.hs-left'); if(hl) hl.textContent = L({ rur: cd(left) + ' baaqi', en: cd(left) + ' left' });
    const ai = el.querySelector('.hero-after .in'); if(ai && after) ai.textContent = (mode === 'now' && Math.abs(after.start - p.end) < 60000) ? '' : inTxt(after.start - now); // same as the big countdown when one prayer follows the other directly
    el.classList.remove('hide');
  }
  window.setHeroMode = function(m){ heroSession = null; state.heroMode = m; saveState(); const el = document.getElementById('homeHero'); if(el){ el.dataset.k = ''; el.style.transform = ''; el.style.opacity = ''; } try{ renderHero(true); }catch(e){} };
  window.setHeroSession = function(m){ heroSession = (m === (state.heroMode || 'full')) ? null : m; const el = document.getElementById('homeHero'); if(el){ el.dataset.k = ''; el.style.transform = ''; el.style.opacity = ''; } try{ renderHero(true); }catch(e){} };
  // ✕ and swipe step the card down for this visit only: full → slim strip → off (Settings → Home Card keeps it permanently)
  function stepDown(el, dir){
    const next = heroMode() === 'full' ? 'strip' : 'off';
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){ setHeroSession(next); return; }
    el.classList.remove('dragging'); el.classList.add('snap');
    el.style.transform = `translateX(${dir * 110}%)`; el.style.opacity = '0';
    setTimeout(()=>{ el.classList.remove('snap'); setHeroSession(next); }, 200);
  }
  (()=>{
    const el = document.getElementById('homeHero'); if(!el) return;
    el.addEventListener('click', e=>{
      if(e.target.closest('.hero-x')){ e.stopPropagation(); stepDown(el, 1); return; }
      if(el.classList.contains('strip')) setHeroSession('full'); // tap the slim strip: open it again (this visit)
    });
    let st = null;
    el.addEventListener('touchstart', e=>{ const t = e.touches[0]; st = { x:t.clientX, y:t.clientY, t:performance.now(), live:false, dx:0 }; }, { passive:true });
    el.addEventListener('touchmove', e=>{
      if(!st) return; const t = e.touches[0], dx = t.clientX - st.x, dy = t.clientY - st.y;
      if(!st.live){ if(Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)){ st = null; return; } if(Math.abs(dx) > 10){ st.live = true; el.classList.add('dragging'); } else return; }
      st.dx = dx; el.style.transform = `translateX(${dx}px)`; el.style.opacity = String(Math.max(0.25, 1 - Math.abs(dx) / 280));
    }, { passive:true });
    const end = ()=>{
      if(!st || !st.live){ st = null; return; }
      const s = st; st = null; const v = Math.abs(s.dx) / Math.max(1, performance.now() - s.t);
      if(Math.abs(s.dx) > 90 || (v > 0.55 && Math.abs(s.dx) > 40)) stepDown(el, s.dx < 0 ? -1 : 1);
      else { el.classList.remove('dragging'); el.classList.add('snap'); el.style.transform = ''; el.style.opacity = ''; setTimeout(()=> el.classList.remove('snap'), 220); }
    };
    el.addEventListener('touchend', end); el.addEventListener('touchcancel', end);
  })();
  window.addEventListener('resize', ()=>{ try{ const el = document.getElementById('homeHero'); if(el) el.dataset.k = ''; renderHero(); }catch(e){} });
  const _renderHome = renderHome;
  renderHome = function(){ const r = _renderHome.apply(this, arguments); try{ renderHero(); }catch(e){} return r; };
  setInterval(()=>{ try{ renderHero(); }catch(e){} }, 5000);
  document.addEventListener('visibilitychange', ()=>{ if(!document.hidden){ try{ renderHero(); }catch(e){} } });
  try{ renderHero(); }catch(e){}

  /* ---- Quran page images: fade in once loaded (the shimmer shows until then) ---- */
  const done = e=>{ const t = e.target; if(t && t.classList && t.classList.contains('quran-page-img')) t.classList.add('loaded'); };
  document.addEventListener('load', done, true);
  document.addEventListener('error', done, true);
})();
