/* ===== Khel hub + 5 more games: Jodi Milao, Tarteeb Lagao, Lafz Jodo, Surah Pehchaan, Sahi ya Ghalat =====
   All content comes from the app's own data. Sound / vibration / effects follow the Lafz Talash settings (state.lafz). */

const KH_GAMES = [
  { id:'lafz',    ic:'🔤', rur:'Lafz Talash',    en:'Word Search',    dr:'Grid mein chhupe lafz dhoondhein',     de:'Find hidden words in a grid',     go:()=> renderLafz() },
  { id:'clue',    ic:'🕵️', rur:'Deen Detective', en:'Deen Detective', dr:'4 suraag, 1 jawab, jaldi pehchanein',  de:'4 clues, 1 answer, guess early',  go:()=> khClueHome() },
  { id:'jodi',    ic:'🧩', rur:'Jodi Milao',     en:'Match Pairs',    dr:'Lafz aur uska matlab milayein',        de:'Match words with their meanings', go:()=> khJodiStart() },
  { id:'tarteeb', ic:'🔢', rur:'Tarteeb Lagao',  en:'Order It',       dr:'Sahi tarteeb se lagayein',             de:'Put things in the right order',   go:()=> khTarteebStart() },
  { id:'jodo',    ic:'🔀', rur:'Lafz Jodo',      en:'Word Scramble',  dr:'Bikhre harf jod kar lafz banayein',    de:'Unscramble the letters',          go:()=> khScrStart() },
  { id:'surah', q:1, ic:'📖', rur:'Surah Pehchaan', en:'Surah Quiz',     dr:'Surah aur para ki tarteeb',            de:'Order and numbers of surahs',     go:()=> khSurahStart() },
  { id:'sahi', q:1, ic:'⚡', rur:'Sahi ya Ghalat', en:'True or False',  dr:'60 second, 3 jaan, tez jawab',         de:'60 seconds, 3 lives, fast',       go:()=> khSahiStart() }
];
const khS = ()=>{ const s = state.khel = state.khel || {}; s.best = s.best || {}; s.plays = s.plays || {}; return s; };
const khName = g => isEn() ? g.en : g.rur;
const khBody = ()=> document.getElementById('detailBody');
const khTitle = t=>{ document.getElementById('detailTitle').textContent = t; };
const khShake = el=>{ if(el && lzState().fx){ el.classList.remove('lz-shake'); void el.offsetWidth; el.classList.add('lz-shake'); } };
const khStarsFor = (pct)=> pct >= .9 ? 3 : pct >= .65 ? 2 : 1;
let khTimer = null;
const khClear = ()=>{ clearInterval(khTimer); khTimer = null; };

function renderKhel(){
  quizState = null; if(typeof quizTimerStop === 'function') quizTimerStop(); khClear();
  khTitle(L({ rur: 'Quiz aur Khel', en: 'Quiz and Games' }));
  const S = khS(), Z = lzState();
  khBody().innerHTML = `${khTabsHtml('games')}<div class="lz"><p class="lz-sub" style="margin:0 0 12px;">${L({ rur: 'Khelte hue seekhein', en: 'Learn while you play' })}</p>
    ${KH_GAMES.filter(g=> !g.q).map(g=> {
      const best = g.id === 'lafz' ? `${L({ rur: 'Level', en: 'Level' })} ${Z.lvl || 1}` : (S.best[g.id] != null ? `${L({ rur: 'Behtar', en: 'Best' })}: ${S.best[g.id]}` : '');
      return `<button type="button" class="kh-card" data-g="${g.id}"><span class="kh-ic">${g.ic}</span><span class="kh-tx"><b>${isEn() ? g.en : g.rur}</b><small>${isEn() ? g.de : g.dr}</small></span><span class="kh-best">${best}</span></button>`;
    }).join('')}
    <p class="lz-note">${L({ rur: 'Awaaz, vibration aur effects ke liye har game mein ⚙️ hai, ya More tab dekhein.', en: 'Every game has a ⚙️ for sound, vibration and effects, or see the More tab.' })}</p></div>`;
  khTabsBind();
  khBody().querySelectorAll('.kh-card[data-g]').forEach(b=>{ b.onclick = ()=> KH_GAMES.find(g=> g.id === b.dataset.g).go(); });
}

/* shared result screen */
function khResult(id, headline, score, total, stars, extraHtml, again, review){
  khClear();
  const S = khS(); S.plays[id] = (S.plays[id] || 0) + 1;
  const val = Math.round(score);
  if(S.best[id] == null || val > S.best[id]) S.best[id] = val;
  saveState(); lzWin(); lzVib([30, 40, 30, 40, 80]);
  const conf = lzState().fx ? Array.from({ length: 16 }, (_, i)=> `<s style="--x:${lzRand(100)}%;--dl:${(i * 60) % 700}ms;--cc:${LZ_COLS.multi[i % 8]}"></s>`).join('') : '';
  khBody().innerHTML = `<div class="lz lz-done">${conf ? `<div class="lz-conf">${conf}</div>` : ''}
    <div class="lz-banner">${headline}</div>
    <div class="lz-stars">${[1, 2, 3].map(i=> `<span class="${i <= stars ? 'on' : ''}">★</span>`).join('')}</div>
    <p class="lz-sub">${L({ rur: 'Score', en: 'Score' })}: ${val}${total ? ' / ' + total : ''}</p>${extraHtml || ''}${khReviewHtml(review)}
    <button type="button" class="quiz-next" id="khAgain" style="position:static;margin-top:14px;">${L({ rur: 'Dobara khelein', en: 'Play again' })} ▶</button>
    <button type="button" class="kh-back" id="khHub">${L({ rur: 'Saare khel', en: 'All games' })}</button></div>`;
  khReviewBind();
  document.getElementById('khAgain').onclick = again;
  document.getElementById('khHub').onclick = ()=> renderKhel();
}
const khHead = (title, right)=> `<div class="lz-top"><span class="lz-lv">${title}</span><span class="lz-grow"></span>${right || ''}<button type="button" class="lz-ic" id="khSet" aria-label="Settings">⚙️</button></div><div class="lz-panel" id="khPanel" hidden></div>`;

/* ---------- 1. Jodi Milao ---------- */
function khPairSets(){
  const en = isEn(), clip = s=> String(s || '').length <= 64;
  const sh = (typeof SHK_DATA !== 'undefined') ? SHK_DATA : {};
  const ppl = k=> (sh[k] || []).map(r=>({ a: lzPersonWord(r[0]), b: r[2] }));
  const S = [
    { n: { rur: 'Asma-ul-Husna aur matlab', en: 'Asma-ul-Husna and meanings' }, ic: '🌙', it: ASMA_UL_HUSNA.map(x=>({ a: lzStripArticle(x.tr), b: en ? x.en : x.m })) },
    { n: { rur: 'Surah aur number', en: 'Surah and number' }, ic: '📖', it: QURAN_SURAHS.map(x=>({ a: x.name, b: (en ? 'Surah ' : 'Surah ') + x.n })) },
    { n: { rur: 'Para aur number', en: 'Para and number' }, ic: '📚', it: QURAN_PARAS.map(x=>({ a: x.name, b: 'Para ' + x.n })) },
    { n: { rur: 'Qur’ani alfaaz aur matlab', en: 'Qur’anic words and meanings' }, ic: '📖', it: QURAN_WORDS.map(x=>({ a: lzStripArticle(x.tr), b: en ? x.en : x.m })) },
    { n: { rur: 'Khaas Shabd aur matlab', en: 'Key terms and meanings' }, ic: '🔤', it: KHAAS_SHABD.map(x=>({ a: x.tr, b: en ? x.en : x.m })) },
    { n: { rur: 'Nabi ﷺ ke naam aur matlab', en: 'Names of the Prophet ﷺ' }, ic: '🕌', it: PROPHET_NAMES.map(x=>({ a: x.tr, b: en ? x.en : x.m })) },
    { n: { rur: 'Anbiya aur pehchaan', en: 'Prophets and descriptions' }, ic: '🌟', it: ppl('anbiya') },
    { n: { rur: 'Sahaba aur pehchaan', en: 'Companions and descriptions' }, ic: '🤝', it: ppl('khulafa').concat(ppl('sahaba')) }
  ];
  return S.map(s=> ({ ...s, it: s.it.filter(x=> x.a && x.b && clip(x.b)) })).filter(s=> s.it.length >= 6);
}
let khJ = null;
function khJodiStart(){
  khTitle(L({ rur: 'Jodi Milao', en: 'Match Pairs' }));
  khJ = { board: 0, mist: 0, sets: khPairSets(), sel: null };
  khJodiBoard();
}
function khJodiBoard(){
  const J = khJ, set = J.sets[lzRand(J.sets.length)];
  const seenA = new Set(), seenB = new Set(), pairs = [];
  lzShuffle(set.it).forEach(x=>{ if(pairs.length < 5 && !seenA.has(x.a) && !seenB.has(x.b)){ seenA.add(x.a); seenB.add(x.b); pairs.push(x); } });
  J.pairs = pairs; J.left = lzShuffle(pairs.map((p, i)=> ({ t: p.a, i }))); J.right = lzShuffle(pairs.map((p, i)=> ({ t: p.b, i }))); J.done = 0; J.sel = null; J.set = set;
  khBody().innerHTML = `<div class="lz">${khHead(`${L({ rur: 'Board', en: 'Board' })} ${J.board + 1}/3`, `<span class="kh-mist">✖ <b id="khMist">${J.mist}</b></span>`)}
    <div class="lz-cat"><span>${set.ic} ${isEn() ? set.n.en : set.n.rur}</span><b id="khDone">0/5</b></div>
    <div class="kh-cols"><div class="kh-col" id="khL">${J.left.map(x=> `<button type="button" class="kh-tile" data-i="${x.i}">${x.t}</button>`).join('')}</div>
    <div class="kh-col" id="khR">${J.right.map(x=> `<button type="button" class="kh-tile kh-sm" data-i="${x.i}">${x.t}</button>`).join('')}</div></div>
    <div class="lz-toast" id="lzToast"></div></div>`;
  const tiles = col=> [...document.querySelectorAll(`#${col} .kh-tile`)];
  const pick = (col, b)=>{
    if(b.disabled) return; lzTick();
    const side = col === 'khL' ? 'l' : 'r';
    tiles(col).forEach(x=> x.classList.remove('sel')); b.classList.add('sel');
    J.sel = J.sel || {}; J.sel[side] = b;
    if(J.sel.l && J.sel.r){
      const l = J.sel.l, r = J.sel.r; J.sel = null;
      if(l.dataset.i === r.dataset.i){
        const c = lzColor(+l.dataset.i);
        [l, r].forEach(x=>{ x.disabled = true; x.classList.remove('sel'); x.classList.add('ok'); x.style.setProperty('--c', c); });
        J.done++; document.getElementById('khDone').textContent = J.done + '/5'; lzOk(); lzVib(20);
        if(J.done === 5) setTimeout(()=>{ J.board++; J.board >= 3 ? khJodiEnd() : khJodiBoard(); }, lzState().fx ? 700 : 200);
      } else {
        J.mist++; document.getElementById('khMist').textContent = J.mist; lzBad(); lzVib([40, 40, 40]);
        [l, r].forEach(x=>{ x.classList.remove('sel'); x.classList.add('bad'); khShake(x); setTimeout(()=> x.classList.remove('bad'), 450); });
      }
    }
  };
  tiles('khL').forEach(b=> b.onclick = ()=> pick('khL', b));
  tiles('khR').forEach(b=> b.onclick = ()=> pick('khR', b));
}
function khJodiEnd(){
  const m = khJ.mist, stars = m <= 2 ? 3 : m <= 6 ? 2 : 1, score = Math.max(0, 15 - m);
  khResult('jodi', L({ rur: 'Shabaash!', en: 'Well done!' }), score, 15, stars, `<p class="lz-sub">${L({ rur: 'Galtiyan', en: 'Mistakes' })}: ${m}</p>`, khJodiStart);
}

/* ---------- 2. Tarteeb Lagao ---------- */
function khOrderSets(){
  const rn = (arr, k)=>{ const s = Math.floor(Math.random() * (arr.length - k + 1)); return arr.slice(s, s + k); };
  const sorted5 = (arr, key)=>{ const a = lzShuffle(arr).slice(0, 5).sort((x, y)=> x.n - y.n); return a; };
  return [
    () => ({ t: { rur: 'Hijri mahine: Muharram se aage ki tarteeb', en: 'Hijri months in order from Muharram' }, ic: '🗓️', items: rn(HIJRI_MONTHS, 5), note: { rur: 'Hijri saal Muharram se shuru hota hai.', en: 'The Hijri year begins with Muharram.' } }),
    () => ({ t: { rur: 'Din ki namazein: Fajr se shuru', en: 'Daily prayers starting from Fajr' }, ic: '🕋', items: ['Fajr', 'Zuhr', 'Asr', 'Maghrib', 'Isha'], note: { rur: 'Rakat (farz): 2, 4, 4, 3, 4.', en: 'Farz rak‘ahs: 2, 4, 4, 3, 4.' } }),
    () => ({ t: { rur: 'Namaz ki ek rakat ki tarteeb', en: 'Order within one rak‘ah' }, ic: '🕋', items: ['Qiyam (khade hona)', 'Qiraat', 'Ruku', 'Qauma (ruku se seedha khade hona)', 'Sajda', 'Jalsa (do sajdon ke beech)', 'Dusra Sajda'], note: { rur: 'Aam tareeqe ke mutabiq; tafseel ke liye ulema se mashwara karein.', en: 'The general method; consult your ulema for detail.' } }),
    () => ({ t: { rur: 'Wuzu ke 4 farz (Qur’an 5:6)', en: 'The 4 farz of wudu (Qur’an 5:6)' }, ic: '💧', items: ['Chehra dhona', 'Dono haath kohniyon samet dhona', 'Sar ka masah', 'Dono paon takhno samet dhona'], note: { rur: 'Surah Al-Ma’idah 5:6. Sunnat tareeqe mein aur cheezein bhi hain; ulema se poochhein.', en: 'Surah Al-Ma’idah 5:6. The Sunnah method has more steps; ask your ulema.' } }),
    () => ({ t: { rur: 'Khulafa-e-Rashidin ki tarteeb', en: 'The Rightly-Guided Caliphs in order' }, ic: '🕌', items: ['Abu Bakr as-Siddiq', 'Umar ibn al-Khattab', 'Uthman ibn Affan', 'Ali ibn Abi Talib'], note: { rur: 'Chaaron RA.', en: 'May Allah be pleased with them.' } }),
    () => ({ t: { rur: 'Qur’an ki tarteeb se surahein', en: 'Surahs in Mushaf order' }, ic: '📖', items: sorted5(QURAN_SURAHS).map(s=> s.name), note: { rur: 'Surah ke number se tarteeb.', en: 'Ordered by surah number.' } }),
    () => ({ t: { rur: 'Qur’an ke para tarteeb se', en: 'Paras in order' }, ic: '📚', items: sorted5(QURAN_PARAS).map(s=> s.name), note: { rur: 'Para ke number se tarteeb.', en: 'Ordered by para number.' } })
  ];
}
let khT = null;
function khTarteebStart(){ khTitle(L({ rur: 'Tarteeb Lagao', en: 'Order It' })); khT = { r: 0, mist: 0, sets: khOrderSets(), last: -1 }; khTarteebRound(); }
function khTarteebRound(){
  const T = khT; let k; do{ k = lzRand(T.sets.length); }while(k === T.last && T.sets.length > 1); T.last = k;
  const s = T.sets[k](); T.cur = s; T.pos = 0;
  const order = lzShuffle(s.items.map((t, i)=> ({ t, i }))); if(order.every((x, i)=> x.i === i)) order.reverse();
  khBody().innerHTML = `<div class="lz">${khHead(`${L({ rur: 'Round', en: 'Round' })} ${T.r + 1}/5`, `<span class="kh-mist">✖ <b id="khMist">${T.mist}</b></span>`)}
    <div class="lz-cat"><span>${s.ic} ${isEn() ? s.t.en : s.t.rur}</span></div>
    <div class="kh-slots" id="khSlots">${s.items.map((_, i)=> `<div class="kh-slot" data-i="${i}"><em>${i + 1}</em><span></span></div>`).join('')}</div>
    <p class="lz-sub" style="margin:10px 0 6px;">${L({ rur: 'Agla sahi item dabayein', en: 'Tap the next correct item' })}</p>
    <div class="kh-pool" id="khPool">${order.map(x=> `<button type="button" class="kh-tile" data-i="${x.i}">${x.t}</button>`).join('')}</div>
    <div class="lz-toast" id="lzToast"></div></div>`;
  document.querySelectorAll('#khPool .kh-tile').forEach(b=>{
    b.onclick = ()=>{
      if(+b.dataset.i === T.pos){
        const slot = document.querySelector(`#khSlots .kh-slot[data-i="${T.pos}"]`);
        slot.querySelector('span').textContent = b.textContent; slot.classList.add('ok'); slot.style.setProperty('--c', lzColor(T.pos));
        b.disabled = true; b.classList.add('ok'); T.pos++; lzOk(); lzVib(15);
        if(T.pos === s.items.length){
          lzToast(isEn() ? s.note.en : s.note.rur, 'ok'); clearTimeout(khT._n);
          T._n = setTimeout(()=>{ T.r++; T.r >= 5 ? khTarteebEnd() : khTarteebRound(); }, 1700);
        }
      } else {
        T.mist++; document.getElementById('khMist').textContent = T.mist; lzBad(); lzVib([40, 40, 40]);
        b.classList.add('bad'); khShake(b); setTimeout(()=> b.classList.remove('bad'), 450);
      }
    };
  });
}
function khTarteebEnd(){
  const m = khT.mist, stars = m <= 3 ? 3 : m <= 8 ? 2 : 1, score = Math.max(0, 20 - m);
  khResult('tarteeb', L({ rur: 'Shabaash!', en: 'Well done!' }), score, 20, stars, `<p class="lz-sub">${L({ rur: 'Galtiyan', en: 'Mistakes' })}: ${m}</p>`, khTarteebStart);
}

/* ---------- 4. Lafz Jodo (scramble) ---------- */
let khC = null;
const khMeaning = (w)=>{ let m = String(w.m || '').replace(/^[^:]*:\s*/, ''); try{ m = m.replace(new RegExp(w.w.replace(/[^A-Za-z]/g, '.?'), 'ig'), '___'); }catch(e){} return m; };
function khScrStart(){
  khTitle(L({ rur: 'Lafz Jodo', en: 'Word Scramble' }));
  const pool = [];
  lzCats().forEach(c=> c.ws.forEach(w=>{ if(w.k.length >= 4 && w.k.length <= 9 && w.m) pool.push({ ...w, cat: c }); }));
  khC = { r: 0, ok: 0, hints: 3, used: 0, words: lzShuffle(pool).slice(0, 10) };
  khScrRound();
}
function khScrRound(){
  const C = khC, w = C.words[C.r];
  let letters = lzShuffle(w.k.split('')); if(letters.join('') === w.k) letters.reverse();
  C.cur = w; C.tiles = letters.map((ch, i)=> ({ ch, i, used: false })); C.ans = []; C.locked = false; C.hintUsedHere = false;
  khBody().innerHTML = `<div class="lz">${khHead(`${C.r + 1}/10`, `<span class="kh-mist">✔ <b>${C.ok}</b></span>`)}
    <div class="lz-cat"><span>${w.cat.ic} ${lzCatName(w.cat)}</span></div>
    <p class="kh-clue">${khMeaning(w)}</p>
    <div class="kh-ans" id="khAns"></div>
    <div class="kh-pool kh-letters" id="khLet"></div>
    <div class="lz-hintrow"><button type="button" class="lz-hint" id="khBk">⌫</button><button type="button" class="lz-hint" id="khHn">💡 ${L({ rur: 'Agla harf', en: 'Next letter' })} <em id="khHnN">${C.hints}</em></button><button type="button" class="lz-hint" id="khSk">⏭️ ${L({ rur: 'Chhodein', en: 'Skip' })}</button></div>
    <div class="lz-toast" id="lzToast"></div></div>`;
  khScrDraw();
  document.getElementById('khBk').onclick = ()=>{ if(C.locked || !C.ans.length) return; const t = C.ans.pop(); if(t.fixed){ C.ans.push(t); return; } C.tiles[t.i].used = false; khScrDraw(); };
  document.getElementById('khSk').onclick = ()=>{ if(C.locked) return; C.locked = true; lzToast(w.w, 'bad'); setTimeout(()=> khScrNext(), 900); };
  document.getElementById('khHn').onclick = ()=>{
    if(C.locked || C.hints < 1) return;
    while(C.ans.length && !C.ans[C.ans.length - 1].fixed){ const t = C.ans.pop(); C.tiles[t.i].used = false; }
    const need = w.k[C.ans.length], t = C.tiles.find(x=> !x.used && x.ch === need); if(!t) return;
    t.used = true; C.ans.push({ i: t.i, ch: t.ch, fixed: true }); C.hints--; C.used++; document.getElementById('khHnN').textContent = C.hints; lzHintSnd(); khScrDraw(); khScrCheck();
  };
}
function khScrDraw(){
  const C = khC, a = document.getElementById('khAns'), l = document.getElementById('khLet'); if(!a) return;
  a.innerHTML = C.cur.k.split('').map((_, i)=> `<span class="kh-box${C.ans[i] ? ' f' : ''}${C.ans[i] && C.ans[i].fixed ? ' fx' : ''}">${C.ans[i] ? C.ans[i].ch : ''}</span>`).join('');
  l.innerHTML = C.tiles.map(t=> `<button type="button" class="kh-let" data-i="${t.i}" ${t.used ? 'disabled' : ''}>${t.ch}</button>`).join('');
  l.querySelectorAll('.kh-let').forEach(b=>{ b.onclick = ()=>{
    if(C.locked || C.ans.length >= C.cur.k.length) return;
    const t = C.tiles[+b.dataset.i]; t.used = true; C.ans.push({ i: t.i, ch: t.ch }); lzTick(); khScrDraw(); khScrCheck();
  }; });
}
function khScrCheck(){
  const C = khC; if(C.ans.length < C.cur.k.length) return;
  const got = C.ans.map(x=> x.ch).join('');
  if(got === C.cur.k){
    C.locked = true; C.ok++; lzOk(); lzVib(25);
    document.querySelectorAll('#khAns .kh-box').forEach((b, i)=>{ b.classList.add('ok'); b.style.setProperty('--d', i * 50 + 'ms'); });
    lzToast(`${C.cur.w}: ${khMeaning(C.cur).replace(/___/g, C.cur.w)}`, 'ok'); setTimeout(()=> khScrNext(), 1500);
  } else {
    C.locked = true; lzBad(); lzVib([40, 40, 40]); khShake(document.getElementById('khAns'));
    document.querySelectorAll('#khAns .kh-box').forEach(b=> b.classList.add('bad'));
    setTimeout(()=>{ C.ans.filter(x=> !x.fixed).forEach(x=>{ C.tiles[x.i].used = false; }); C.ans = C.ans.filter(x=> x.fixed); C.locked = false; khScrDraw(); }, 600);
  }
}
function khScrNext(){ khC.r++; khC.r >= 10 ? khScrEnd() : khScrRound(); }
function khScrEnd(){
  const C = khC, stars = C.ok >= 9 && C.used <= 1 ? 3 : C.ok >= 6 ? 2 : 1;
  khResult('jodo', L({ rur: 'Shabaash!', en: 'Well done!' }), C.ok, 10, stars, '', khScrStart);
}

/* ---------- 5. Surah Pehchaan ---------- */
let khQ = null;
function khSurahQs(){
  const S = QURAN_SURAHS, P = QURAN_PARAS, out = [];
  const opts = (right, pool, key)=>{ const o = [right]; lzShuffle(pool).forEach(x=>{ if(o.length < 4 && !o.includes(key(x))) o.push(key(x)); }); return lzShuffle(o); };
  const sn = s=> s.name;
  for(let t = 0; out.length < 10 && t < 200; t++){
    const kind = lzRand(5), s = S[lzRand(S.length)];
    if(kind === 0) out.push({ q: L({ rur: `Surah number ${s.n} ka naam kya hai?`, en: `What is the name of Surah number ${s.n}?` }), ar: s.ar, o: opts(sn(s), S, sn), a: sn(s) });
    else if(kind === 1) out.push({ q: L({ rur: `${s.name} Qur’an ki kitnaveen surah hai?`, en: `Which number surah is ${s.name}?` }), ar: s.ar, o: opts(String(s.n), S, x=> String(x.n)), a: String(s.n) });
    else if(kind === 2 && s.n < 114) out.push({ q: L({ rur: `${s.name} ke baad kaun si surah aati hai?`, en: `Which surah comes right after ${s.name}?` }), ar: s.ar, o: opts(sn(S[s.n]), S, sn), a: sn(S[s.n]) });
    else if(kind === 3 && s.n > 1) out.push({ q: L({ rur: `${s.name} se pehle kaun si surah aati hai?`, en: `Which surah comes right before ${s.name}?` }), ar: s.ar, o: opts(sn(S[s.n - 2]), S, sn), a: sn(S[s.n - 2]) });
    else if(kind === 4){ const p = P[lzRand(P.length)]; out.push({ q: L({ rur: `Para number ${p.n} ka naam kya hai?`, en: `What is the name of Para number ${p.n}?` }), ar: '', o: opts(p.name, P, x=> x.name), a: p.name }); }
  }
  return out.filter(x=> x.o.length === 4).slice(0, 10);
}
function khSurahStart(){ khTitle(L({ rur: 'Surah Pehchaan', en: 'Surah Quiz' })); khQ = { i: 0, ok: 0, streak: 0, qs: khSurahQs() }; khSurahShow(); }
function khSurahShow(){
  const Q = khQ, q = Q.qs[Q.i];
  khBody().innerHTML = `<div class="lz">${khHead(`${Q.i + 1}/${Q.qs.length}`, `<span class="kh-mist">🔥 <b>${Q.streak}</b></span>`)}
    <div class="quiz-card"><div class="quiz-q">${q.q}</div>${q.ar ? `<div class="quiz-q-ar">${q.ar}</div>` : ''}</div>
    <div class="quiz-opts">${q.o.map((o, i)=> `<button type="button" class="quiz-opt qopt-${'ABCD'[i]}" data-o="${o.replace(/"/g, '&quot;')}"><span class="opt-letter">${'ABCD'[i]}</span><span class="quiz-opt-txt">${o}</span></button>`).join('')}</div>
    <p class="lz-note">${L({ rur: 'Tarteeb Mushaf ke mutabiq hai.', en: 'Order follows the standard Mushaf.' })}</p></div>`;
  document.querySelectorAll('.quiz-opt').forEach(b=>{ b.onclick = ()=>{
    if(Q.lock) return; Q.lock = true; const ok = b.dataset.o === q.a;
    document.querySelectorAll('.quiz-opt').forEach(x=>{ if(x.dataset.o === q.a) x.classList.add('correct'); x.disabled = true; });
    if(ok){ Q.ok++; Q.streak++; lzOk(); lzVib(20); } else { Q.streak = 0; b.classList.add('wrong'); khShake(b); lzBad(); lzVib([40, 40, 40]); }
    setTimeout(()=>{ Q.lock = false; Q.i++; Q.i >= Q.qs.length ? khResult('surah', L({ rur: 'Shabaash!', en: 'Well done!' }), Q.ok, Q.qs.length, khStarsFor(Q.ok / Q.qs.length), '', khSurahStart) : khSurahShow(); }, ok ? 800 : 1500);
  }; });
}

/* ---------- 6. Sahi ya Ghalat (60 s, 3 lives) ---------- */
let khF = null;
function khSahiStart(){
  khTitle(L({ rur: 'Sahi ya Ghalat', en: 'True or False' })); khClear();
  const pool = QUIZ_BANK.filter(q=> q[1] && q[1].length >= 2 && typeof q[2] === 'number');
  khF = { pool: lzShuffle(pool), i: 0, ok: 0, lives: 3, t: 60, streak: 0, lock: false, over: false, log: [] };
  khSahiShow();
  khTimer = setInterval(()=>{
    const el = document.getElementById('khClock');
    if(!el){ khClear(); return; }
    if(khF.t > 0 && !khF.lock) khF.t--;
    el.textContent = khF.t + 's';
    if(khF.t <= 0 && !khF.over){ khF.over = true; khSahiEnd(); }
  }, 1000);
}
function khSahiShow(){
  const F = khF, item = F.pool[F.i % F.pool.length], loc = quizLocal(item), q = loc[0], opts = loc[1], correct = loc[2];
  const truth = Math.random() < .5, wrongs = opts.map((o, i)=> i).filter(i=> i !== correct), shown = truth ? correct : wrongs[lzRand(wrongs.length)];
  F.cur = { truth, item, shown };
  khBody().innerHTML = `<div class="lz">${khHead(`⏱️ <b id="khClock">${F.t}s</b>`, `<span class="kh-mist">${'❤️'.repeat(F.lives)}${'🖤'.repeat(3 - F.lives)} · ✔ <b>${F.ok}</b></span>`)}
    <div class="quiz-card"><div class="quiz-q">${String(q).replace(/\n\n/g, '<br>')}</div><div class="kh-ansline">${L({ rur: 'Jawab', en: 'Answer' })}: <b>${opts[shown]}</b></div></div>
    <div class="kh-tf"><button type="button" class="kh-yes" data-v="1">✅ ${L({ rur: 'Sahi', en: 'True' })}</button><button type="button" class="kh-no" data-v="0">❌ ${L({ rur: 'Ghalat', en: 'False' })}</button></div>
    <div class="lz-toast" id="lzToast"></div></div>`;
  document.querySelectorAll('.kh-tf button').forEach(b=>{ b.onclick = ()=>{
    if(F.lock || F.over) return; F.lock = true;
    const ok = (b.dataset.v === '1') === F.cur.truth;
    document.querySelectorAll('.kh-tf button').forEach(x=> x.disabled = true);
    if(ok){ F.ok++; F.streak++; lzOk(); lzVib(20); b.classList.add('good'); }
    else { F.lives--; F.streak = 0; lzBad(); lzVib([40, 40, 40]); b.classList.add('bad'); khShake(document.querySelector('.quiz-card')); }
    const why = (typeof quizWhy === 'function') ? quizWhy(item) : '';
    F.log.push({ ok, q: String(q).replace(/\n\n/g, ' '), a: opts[correct], shown: opts[shown], truth: F.cur.truth, why });
    const right = `${L({ rur: 'Sahi jawab', en: 'Correct answer' })}: ${opts[correct]}`;
    lzToast(ok ? (why || '') : (why ? right + '. ' + why : right), ok ? 'ok' : 'bad');
    clearTimeout(khF._n); const wait = ok ? (why ? 1700 : 600) : 2200;
    khF._n = setTimeout(()=>{
      F.lock = false; F.i++;
      if(F.lives <= 0 || F.t <= 0){ if(!F.over){ F.over = true; khSahiEnd(); } } else khSahiShow();
    }, wait);
  }; });
}
function khSahiEnd(){
  khClear(); const F = khF, stars = F.ok >= 20 ? 3 : F.ok >= 10 ? 2 : 1;
  khResult('sahi', F.lives <= 0 ? L({ rur: 'Jaan khatam!', en: 'Out of lives!' }) : L({ rur: 'Waqt khatam!', en: 'Time up!' }), F.ok, 0, stars, `<p class="lz-sub">${L({ rur: 'Sahi jawab', en: 'Correct answers' })}: ${F.ok}</p>`, khSahiStart, F.log.map(x=> ({ ok: x.ok, q: x.q, a: x.a, why: (x.truth ? '' : L({ rur: 'Dikhaya gaya jawab ghalat tha: ', en: 'The shown answer was wrong: ' }) + x.shown + '. ') + (x.why || ''), tag: x.ok ? '✔' : '✘' })));
}
