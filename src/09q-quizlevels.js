/* ============================================================
   QUIZ LEVELS, BADGES and the weekly challenge, all worked out from state.quizLog
   ============================================================ */
const QUIZ_LEVELS = [
  { at:0,   ic:'🌱', n:'Mubtadi' },
  { at:25,  ic:'📘', n:'Talib-e-Ilm' },
  { at:100, ic:'🧭', n:'Ilm Ka Musafir' },
  { at:300, ic:'🌟', n:'Sahib-e-Ilm' },
  { at:800, ic:'🏆', n:'Aalim-e-Quiz' }
];
function quizProfile(){
  const log = Array.isArray(state.quizLog) ? state.quizLog : [];
  const correct = log.reduce((a,x)=> a + (x.score||0), 0);
  const days = new Set(log.map(x=> dayKey(new Date(x.t))));
  let streak = 0; const d = new Date();
  if(!days.has(dayKey(d))) d.setDate(d.getDate() - 1);
  while(days.has(dayKey(d))){ streak++; d.setDate(d.getDate() - 1); }
  const tried = new Set(log.map(x=>x.cat));
  const weekAgo = Date.now() - 7*86400000;
  const week = log.filter(x=> x.t >= weekAgo).length;
  let li = 0; QUIZ_LEVELS.forEach((l,i)=>{ if(correct >= l.at) li = i; });
  const next = QUIZ_LEVELS[li+1] || null;
  const badges = [
    { ic:'🎯', n:'Pehla Quiz', d:'Ek quiz poora karein', ok: log.length >= 1 },
    { ic:'🔟', n:'10 Quiz', d:'10 quiz poore karein', ok: log.length >= 10 },
    { ic:'💯', n:'Poore Number', d:'Kisi quiz mein sab jawab sahi', ok: log.some(x=> x.total >= 5 && x.score === x.total) },
    { ic:'🔥', n:'3 Din Lagataar', d:'3 din lagataar quiz khelein', ok: streak >= 3 || maxQuizStreak(days) >= 3 },
    { ic:'🗺️', n:'Har Category', d:'Har category ka quiz khelein', ok: QUIZ_CATEGORIES.every(c=> tried.has(c)) },
    { ic:'📚', n:'100 Sahi Jawab', d:'Kul 100 sahi jawab', ok: correct >= 100 }
  ];
  return { correct, quizzes:log.length, streak, week, level:QUIZ_LEVELS[li], next, badges };
}
function maxQuizStreak(days){
  const arr = [...days].map(k=>{ const p = k.split('-'); return new Date(+p[0], +p[1]-1, +p[2]).getTime(); }).sort((a,b)=>a-b); let best = 0, run = 0, prev = null;
  arr.forEach(t=>{
    run = (prev !== null && Math.round((t - prev)/86400000) === 1) ? run + 1 : 1;
    prev = t; if(run > best) best = run;
  });
  return best;
}
function quizProfileHtml(){
  const p = quizProfile();
  const pct = p.next ? Math.min(100, Math.round((p.correct - p.level.at) / (p.next.at - p.level.at) * 100)) : 100;
  const goal = 5, wk = Math.min(goal, p.week);
  return `<div class="ql-card">
    <div class="ql-top"><div class="ql-ic">${p.level.ic}</div><div class="ql-info"><div class="ql-n">${p.level.n}</div>
      <div class="ql-s">${p.correct} sahi jawab${p.next ? ` · ${p.next.at - p.correct} aur sahi jawab par "${p.next.n}"` : ' · Sabse bada level'}</div></div></div>
    <div class="ql-bar"><i style="width:${pct}%"></i></div>
    <div class="ql-week"><span>🗓️ Is hafte ka challenge: ${goal} quiz</span><b>${wk} / ${goal}${wk >= goal ? ' ✅' : ''}</b></div>
    ${p.streak ? `<div class="ql-streak">🔥 ${p.streak} din lagataar</div>` : ''}
    <div class="ql-badges">${p.badges.map(b=>`<div class="ql-b${b.ok ? ' on' : ''}" title="${b.d}"><span>${b.ic}</span><em>${b.n}</em></div>`).join('')}</div>
  </div>`;
}
