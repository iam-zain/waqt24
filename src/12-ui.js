/* ============================================================
   UI POLISH: display options (high contrast, calm motion, daily card), swipe-down sheets, tap ripple, first-run tour
   ============================================================ */
function applyDisplayPrefs(){
  document.body.classList.toggle('hc', !!state.hc);
  document.body.classList.toggle('calm', !!state.calm);
  if(typeof renderDailyCard === 'function') renderDailyCard();
}
(function displayOptions(){
  const anchor = document.getElementById('palRow'); if(!anchor) return;
  const box = document.createElement('div'); box.className = 'disp-opts'; box.id = 'dispOpts';
  const rows = [
    ['hc',  '◐', {rur:'Zyada contrast', en:'High contrast'}, ()=>!!state.hc],
    ['calm','🍃', {rur:'Kam animation', en:'Calmer motion'}, ()=>!!state.calm],
    ['daily','🤲', {rur:'Home par Aaj ki Du\'a / Hadees', en:'Daily Du\'a / Hadees on Home'}, ()=>!state.dailyOff],
  ];
  const draw = ()=>{
    box.innerHTML = rows.map(r=>`<div class="tasbeeh-sound-toggle"><span>${r[1]} ${L(r[2])}</span><div class="roza-mini ${r[3]() ? 'on' : ''}" role="switch" aria-checked="${r[3]()}" tabindex="0" data-disp="${r[0]}"><div class="roza-mini-knob"></div></div></div>`).join('')
      + `<button type="button" class="disp-tour" id="dispTour">🧭 ${L({rur:'Tour dobara dekhein', en:'Show the tour again'})}</button>`;
    box.querySelectorAll('[data-disp]').forEach(b=>{
      const flip = ()=>{ const k = b.dataset.disp; if(k === 'hc') state.hc = !state.hc; else if(k === 'calm') state.calm = !state.calm; else state.dailyOff = !state.dailyOff; saveState(); applyDisplayPrefs(); draw(); };
      b.onclick = flip; b.onkeydown = e=>{ if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); flip(); } };
    });
    document.getElementById('dispTour').onclick = ()=> startTour(true);
  };
  anchor.after(box); draw(); applyDisplayPrefs();
})();

/* one behaviour for every bottom sheet: drag down from its top (when scrolled to the top) to close */
function sheetSwipe(container, sheetSel, close){
  let y0 = null, dy = 0, sheet = null;
  container.addEventListener('touchstart', e=>{
    sheet = e.target.closest(sheetSel); if(!sheet || e.target.closest('textarea, input, select')){ y0 = null; return; }
    if(sheet.scrollTop > 0){ y0 = null; return; }
    y0 = e.touches[0].clientY; dy = 0; sheet.style.transition = 'none';
  }, { passive:true });
  container.addEventListener('touchmove', e=>{
    if(y0 === null || !sheet) return; dy = e.touches[0].clientY - y0;
    if(dy > 0) sheet.style.transform = `translateY(${dy}px)`; else dy = 0;
  }, { passive:true });
  const end = ()=>{
    if(y0 === null || !sheet) return; const s = sheet; y0 = null;
    s.style.transition = 'transform .22s var(--fx-ease, ease)';
    if(dy > 90){ s.style.transform = 'translateY(110%)'; setTimeout(()=>{ s.style.transform = ''; s.style.transition = ''; close(); }, 180); }
    else{ s.style.transform = ''; setTimeout(()=>{ s.style.transition = ''; }, 240); }
  };
  container.addEventListener('touchend', end); container.addEventListener('touchcancel', end);
}
(function(){
  const sc = document.getElementById('shareChooser'); if(sc) sheetSwipe(sc, '.info-card', ()=> closeModal());
  new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(n=>{
    if(n.nodeType === 1 && n.classList.contains('note-ov')) sheetSwipe(n, '.note-sheet', ()=>{ const x = n.querySelector('.note-x'); if(x) x.click(); else n.remove(); });
  }))).observe(document.body, { childList:true });
})();

/* tap ripple on the Tasbeeh button */
document.addEventListener('pointerdown', e=>{
  const b = e.target.closest('.tasbeeh-tap'); if(!b || document.body.classList.contains('calm')) return;
  const r = b.getBoundingClientRect(), s = document.createElement('i'); s.className = 'tap-ripple';
  s.style.left = (e.clientX - r.left) + 'px'; s.style.top = (e.clientY - r.top) + 'px'; b.appendChild(s); setTimeout(()=>s.remove(), 600);
});

/* first-run tour: three cards, once, never during automated tests */
const TOUR = [
  { ic:'✓', t:{rur:'Namaz mark karein', en:'Mark your prayers'}, b:{rur:'Har namaz ke saamne ✓ (padh li), ~ (qaza padhi) ya ⏳ (baaki) dabayein. Waqt nikal jaye aur mark na ho to Home par yaad dilane wali patti aati hai, jahan se seedha Qaza mein jod sakte hain.', en:'Tap ✓ (prayed), ~ (made up) or ⏳ (pending) beside each prayer. If a time passes unmarked, a reminder bar on Home lets you add it straight to your Qaza.'} },
  { ic:'📖', t:{rur:'Qur\'an aur Tarjuma', en:'Quran and Translation'}, b:{rur:'Qur\'an mein Tilawat sunein, Tarjuma (Hinglish, Urdu, Hindi, English) kholen, kisi bhi page par Note likhein, aur Khatm ka plan banayein. "Aur" button mein baaki auzaar hain.', en:'In the Quran, listen to recitation, open the Translation, write a Note on any page and set a Khatm plan. More tools are under the "More" button.'} },
  { ic:'🕌', t:{rur:'Aur kya hai', en:'What else'}, b:{rur:'Deegar mein Qaza, Tasbeeh, Ramzan, Qibla aur Azaan milenge. Band app mein bhi Azaan ke liye Android app install karein (Install wali screen mein link hai).', en:'Under More you will find Qaza, Tasbeeh, Ramzan, Qibla and Azan. For Azan while the app is closed, install the Android app (link on the Install screen).'} },
];
function startTour(force){
  if(!force && (state.tourDone || navigator.webdriver || document.getElementById('setupOverlay'))) return;
  if(document.getElementById('tourOv')) return;
  let i = 0; const ov = document.createElement('div'); ov.id = 'tourOv'; ov.className = 'tour-ov';
  const done = ()=>{ state.tourDone = true; saveState(); ov.remove(); };
  const draw = ()=>{
    const s = TOUR[i];
    ov.innerHTML = `<div class="tour-card" role="dialog" aria-label="Tour"><div class="tour-ic">${s.ic}</div><h3>${L(s.t)}</h3><p>${L(s.b)}</p><div class="tour-dots">${TOUR.map((_, k)=>`<i class="${k === i ? 'on' : ''}"></i>`).join('')}</div><div class="tour-btns"><button type="button" id="tourSkip">${L({rur:'Chhodein', en:'Skip'})}</button><button type="button" id="tourNext" class="go">${i === TOUR.length - 1 ? L({rur:'Shuru karein', en:'Start'}) : L({rur:'Aage', en:'Next'})}</button></div></div>`;
    document.getElementById('tourSkip').onclick = done;
    document.getElementById('tourNext').onclick = ()=>{ if(i >= TOUR.length - 1) done(); else{ i++; draw(); } };
  };
  document.body.appendChild(ov); draw();
}
setTimeout(()=> startTour(false), 2500);
