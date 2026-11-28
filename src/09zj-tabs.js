/* ===== Quiz aur Khel: 3 tabs (Games, Quiz, More), shared settings, result review ===== */
const KH_TABS = [['games', '🎮', 'Games', ()=> renderKhel()], ['quiz', '🧠', 'Quiz', ()=> renderMoreQuiz()], ['more', '🏅', 'More', ()=> renderKhelMore()]];
function khTabsHtml(active){
  return `<div class="kh-tabs" role="tablist">${KH_TABS.map(t=> `<button type="button" role="tab" data-t="${t[0]}" aria-selected="${t[0] === active}" class="${t[0] === active ? 'on' : ''}"><span>${t[1]}</span>${t[2]}</button>`).join('')}</div>`;
}
function khQuizCardsHtml(){
  const S = khS();
  return `<div class="kh-qrow">${KH_GAMES.filter(g=> g.q).map(g=> `<button type="button" class="kh-card" data-g="${g.id}"><span class="kh-ic">${g.ic}</span><span class="kh-tx"><b>${isEn() ? g.en : g.rur}</b><small>${isEn() ? g.de : g.dr}</small></span><span class="kh-best">${S.best[g.id] != null ? L({ rur: 'Behtar', en: 'Best' }) + ': ' + S.best[g.id] : ''}</span></button>`).join('')}</div>`;
}
function khTabsBind(){
  document.querySelectorAll('.kh-qrow .kh-card[data-g]').forEach(b=>{ b.onclick = ()=> KH_GAMES.find(g=> g.id === b.dataset.g).go(); });
  document.querySelectorAll('.kh-tabs button').forEach(b=>{ b.onclick = ()=>{ if(b.classList.contains('on')) return; KH_TABS.find(t=> t[0] === b.dataset.t)[3](); }; });
}

/* ---- settings (sound / vibration / effects / colour), shared by every game ---- */
function khSetRows(p, after){
  const S = lzState();
  const row = (id, ic, t, on)=> `<button type="button" class="lz-row" data-k="${id}"><span>${ic} ${t}</span><span class="lz-sw${on ? ' on' : ''}"></span></button>`;
  const K = khS(), seg = (id, arr, cur)=> `<div class="qz-seg" id="${id}">${arr.map(([v, t])=> `<button type="button" data-v="${v}" class="${String(cur) === String(v) ? 'on' : ''}">${t}</button>`).join('')}</div>`;
  p.innerHTML = row('snd', '🔊', L({ rur: 'Awaaz', en: 'Sound' }), S.snd) + row('vib', '📳', L({ rur: 'Vibration', en: 'Vibration' }), S.vib) + row('fx', '✨', L({ rur: 'Effects (animation)', en: 'Effects (animation)' }), S.fx)
    + `<div class="lz-row2"><span>🔢 ${L({ rur: 'Sawal/round har game mein', en: 'Questions/rounds per game' })}</span>${seg('khQnSeg', [[5, '5'], [10, '10'], [15, '15']], khRounds())}</div>`
    + `<div class="lz-row2"><span>💬 ${L({ rur: 'Jawab/wajah dikhne ka waqt', en: 'Answer and explanation time' })}</span>${seg('khAnsSeg', [[2, '2s'], [3, '3s'], [5, '5s'], [8, '8s']], khAnsSecs())}</div>`
    + `<div class="lz-row2"><span>⏭️ ${L({ rur: 'Agla sawal', en: 'Next question' })}</span>${seg('khAutoSeg', [[1, L({ rur: 'Khud khule', en: 'Automatic' })], [0, L({ rur: 'Tap par', en: 'On tap' })]], khAutoOn() ? 1 : 0)}</div>`
    + `<div class="lz-row2"><span>🎨 ${L({ rur: 'Rang (Lafz Talash)', en: 'Colours (Word Search)' })}</span><div class="qz-seg khColSeg">${LZ_COL_NAMES.map(([k, r, e])=> `<button type="button" data-k="${k}" class="${S.col === k ? 'on' : ''}">${isEn() ? e : r}</button>`).join('')}</div></div>`;
  p.querySelectorAll('.lz-row[data-k]').forEach(b=>{ b.onclick = ()=>{ S[b.dataset.k] = !S[b.dataset.k]; saveState(); b.querySelector('.lz-sw').classList.toggle('on', S[b.dataset.k]); if(b.dataset.k === 'snd' && S.snd) lzOk(); }; });
  p.querySelectorAll('#khQnSeg button').forEach(b=>{ b.onclick = ()=>{ K.qn = +b.dataset.v; saveState(); p.querySelectorAll('#khQnSeg button').forEach(x=> x.classList.toggle('on', x === b)); }; });
  p.querySelectorAll('#khAnsSeg button').forEach(b=>{ b.onclick = ()=>{ K.ans = +b.dataset.v; saveState(); p.querySelectorAll('#khAnsSeg button').forEach(x=> x.classList.toggle('on', x === b)); }; });
  p.querySelectorAll('#khAutoSeg button').forEach(b=>{ b.onclick = ()=>{ K.auto = b.dataset.v === '1'; saveState(); p.querySelectorAll('#khAutoSeg button').forEach(x=> x.classList.toggle('on', x === b)); }; });
  p.querySelectorAll('.khColSeg button').forEach(b=>{ b.onclick = ()=>{ S.col = b.dataset.k; saveState(); p.querySelectorAll('.khColSeg button').forEach(x=> x.classList.toggle('on', x === b)); }; });
}
document.addEventListener('click', e=>{
  const b = e.target.closest && e.target.closest('#khSet'); if(!b) return;
  const p = document.getElementById('khPanel'); if(!p) return;
  if(!p.hidden){ p.hidden = true; return; }
  khSetRows(p); p.hidden = false;
});

/* ---- "Next" button that fills up while it waits (same look as the quiz) ---- */
function khNext(ms, isLast, fn){
  clearTimeout(khNT); const w = document.getElementById('khNextWrap'); if(!w) return;
  w.innerHTML = `<button type="button" class="quiz-next kh-nx" id="khNxBtn"><span class="qn-fill" id="khNxFill"></span><span class="qn-txt">${isLast ? L({ rur: 'Result dekhiye', en: 'See result' }) : L({ rur: 'Agla sawal', en: 'Next question' })} ›</span></button>`;
  const btn = document.getElementById('khNxBtn'), fill = document.getElementById('khNxFill');
  const go = ()=>{ clearTimeout(khNT); if(!document.getElementById('khNxBtn')) return; fn(); };
  btn.onclick = go;
  if(khAutoOn()){
    fill.style.transition = `width ${ms / 1000}s linear`; requestAnimationFrame(()=> requestAnimationFrame(()=>{ fill.style.width = '100%'; }));
    khNT = setTimeout(go, ms);
  }
}

/* ---- review of answers with explanations, shown on result screens ---- */
let khRevData = null;
function khReviewHtml(items){
  khRevData = items && items.length ? items : null; if(!khRevData) return '';
  return `<button type="button" class="kh-act kh-revbtn" id="khRevBtn">📋 ${L({ rur: 'Jawab aur wajah dekhein', en: 'Show answers and explanations' })} (${items.length})</button><div class="kh-rev" id="khRev" hidden></div>`;
}
function khReviewBind(){
  const b = document.getElementById('khRevBtn'); if(!b || !khRevData) return;
  b.onclick = ()=>{
    const box = document.getElementById('khRev');
    if(!box.hidden){ box.hidden = true; return; }
    box.innerHTML = khRevData.map((x, i)=> `<div class="kh-ri ${x.ok ? 'ok' : 'no'}"><div class="kh-rq"><em>${i + 1}</em><span>${x.q}</span><b>${x.tag || (x.ok ? '✔' : '✘')}</b></div><div class="kh-ra">${L({ rur: 'Jawab', en: 'Answer' })}: <b>${x.a || ''}</b></div>${x.why ? `<div class="kh-rw">${x.why}</div>` : ''}</div>`).join('');
    box.hidden = false; box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };
}

function khBestStr(g){
  const S = khS(), Z = lzState(), C = clS();
  if(g.id === 'lafz') return `${L({ rur: 'Behtar', en: 'Best' })}: Level ${Math.max(Z.max || 1, Z.lvl || 1)}`;
  if(g.id === 'clue'){ const a = [C.best.quick != null ? 'Quick ' + C.best.quick : '', C.best.marathon != null ? 'Marathon ' + C.best.marathon : ''].filter(Boolean).join(' · '); return a ? L({ rur: 'Behtar', en: 'Best' }) + ': ' + a : ''; }
  return S.best[g.id] != null ? `${L({ rur: 'Behtar', en: 'Best' })}: ${S.best[g.id]}` : '';
}

/* ---- More tab: achievements, stats, settings ---- */
function khDailyStreak(S){
  const keys = Object.keys(S.daily || {}).map(Number), has = new Set(keys); let n = 0; const d = new Date();
  const k = x=> x.getFullYear() * 10000 + (x.getMonth() + 1) * 100 + x.getDate();
  if(!has.has(k(d))) d.setDate(d.getDate() - 1);
  while(has.has(k(d))){ n++; d.setDate(d.getDate() - 1); }
  return n;
}
function khBadges(){
  const S = khS(), Z = lzState(), C = (typeof clS === 'function') ? clS() : { best: {}, daily: {} };
  const stars = Object.values(Z.stars || {}).reduce((a, b)=> a + b, 0), ds = khDailyStreak(C);
  const played = id=> id === 'lafz' ? (Z.done || 0) > 0 : (S.plays[id] || 0) > 0;
  return [
    { ic: '🎮', n: L({ rur: 'Sab Khel', en: 'All Games' }), d: L({ rur: 'Har game kam az kam ek baar khelein', en: 'Play every game once' }), ok: KH_GAMES.every(g=> played(g.id)) },
    { ic: '🔤', n: L({ rur: 'Lafz Khoji', en: 'Word Hunter' }), d: L({ rur: 'Lafz Talash mein 25 lafz dhoondhein', en: 'Find 25 words in Word Search' }), ok: (Z.wordsFound || 0) >= 25 },
    { ic: '🧱', n: L({ rur: 'Level 10', en: 'Level 10' }), d: L({ rur: 'Lafz Talash ke Level 10 tak pahunchein', en: 'Reach Word Search level 10' }), ok: Math.max(Z.max || 1, Z.lvl || 1) >= 10 },
    { ic: '⭐', n: L({ rur: '10 Sitare', en: '10 Stars' }), d: L({ rur: 'Lafz Talash mein kul 10 sitare', en: '10 stars in Word Search' }), ok: stars >= 10 },
    { ic: '⚡', n: L({ rur: 'Tez Jawab', en: 'Quick Answers' }), d: L({ rur: 'Sahi ya Ghalat mein 20 sahi', en: '20 correct in True or False' }), ok: (S.best.sahi || 0) >= 20 },
    { ic: '🕵️', n: L({ rur: 'Pehla Suraag', en: 'First Clue' }), d: L({ rur: 'Deen Detective mein pehle suraag par sahi jawab', en: 'Correct on clue 1 in Deen Detective' }), ok: (C.c1 || 0) >= 1 },
    { ic: '🎯', n: L({ rur: '10 Tez Nishane', en: '10 Sharp Guesses' }), d: L({ rur: 'Pehle suraag par 10 sahi jawab', en: '10 correct answers on clue 1' }), ok: (C.c1 || 0) >= 10 },
    { ic: '💯', n: L({ rur: 'Perfect Detective', en: 'Perfect Detective' }), d: L({ rur: 'Ek round mein poore number', en: 'Full marks in one round' }), ok: !!C.perfect },
    { ic: '📅', n: L({ rur: 'Aaj ka Challenge', en: 'Daily Challenge' }), d: L({ rur: 'Daily Challenge poora karein', en: 'Finish a Daily Challenge' }), ok: Object.keys(C.daily || {}).length > 0 },
    { ic: '🔥', n: L({ rur: '3 Din Daily', en: '3-day Daily' }), d: L({ rur: '3 din lagataar Daily Challenge', en: 'Daily Challenge 3 days in a row' }), ok: ds >= 3 }
  ];
}
function renderKhelMore(){
  quizState = null; if(typeof quizTimerStop === 'function') quizTimerStop(); khClear();
  khTitle(L({ rur: 'Quiz aur Khel', en: 'Quiz and Games' }));
  const S = khS(), Z = lzState(), C = clS(), bd = khBadges(), got = bd.filter(b=> b.ok).length;
  const plays = Object.values(S.plays).reduce((a, b)=> a + b, 0) + (Z.done || 0);
  const best = KH_GAMES.map(g=>{
    const v = khBestStr(g).replace(/^[^:]*:\s*/, '');
    return `<div class="kh-stat"><span>${g.ic} ${khName(g)}</span><b>${v || '–'}</b></div>`;
  }).join('');
  khBody().innerHTML = `${khTabsHtml('more')}<div class="lz">
    <h3 class="kh-h">🏅 ${L({ rur: 'Achievements', en: 'Achievements' })}</h3>
    ${quizProfileHtml()}
    <h3 class="kh-h">🎮 ${L({ rur: 'Game badges', en: 'Game badges' })} <small>${got}/${bd.length}</small></h3>
    <div class="ql-badges kh-badges">${bd.map(b=> `<div class="ql-b${b.ok ? ' on' : ''}" title="${b.d}"><span>${b.ic}</span><em>${b.n}</em></div>`).join('')}</div>
    <p class="lz-note" id="khBadgeNote" style="margin:6px 0 0;">${L({ rur: 'Badge par dabane se shart dikhti hai.', en: 'Tap a badge to see how to earn it.' })}</p>
    <h3 class="kh-h">📊 ${L({ rur: 'Aapke nateeje', en: 'Your results' })} <small>${plays} ${L({ rur: 'game khele', en: 'games played' })}</small></h3>
    <div class="kh-stats">${best}${C.daily && khDailyStreak(C) ? `<div class="kh-stat"><span>🔥 ${L({ rur: 'Daily lagataar', en: 'Daily streak' })}</span><b>${khDailyStreak(C)}</b></div>` : ''}</div>
    <h3 class="kh-h">⚙️ ${L({ rur: 'Settings', en: 'Settings' })}</h3><div class="lz-panel" id="khMoreSet" style="display:block;"></div>
    <p class="lz-note">${L({ rur: 'Ye settings saare games par lagu hoti hain.', en: 'These settings apply to every game.' })}</p>
    <h3 class="kh-h">🔤 ${L({ rur: 'Lafz Talash levels', en: 'Word Search levels' })}</h3><div class="lz-panel" id="khLvPanel" style="display:block;">${lzProgressHtml(false)}</div></div>`;
  khTabsBind(); khSetRows(document.getElementById('khMoreSet')); lzProgressBind(document.getElementById('khLvPanel'), false);
  khBody().querySelectorAll('.kh-badges .ql-b').forEach(b=>{ b.onclick = ()=>{ const n = document.getElementById('khBadgeNote'); const t = b.getAttribute('title'); n.textContent = b.querySelector('em').textContent + ': ' + t; }; });
}
