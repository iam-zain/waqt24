/* ===== Lafz Talash: word-search game =====
   Words come from the app's own data (surah, para, Asma-ul-Husna, Nabi/Sahaba names, Khaas Shabd, Qur'ani alfaaz ...).
   The grid grows very slowly (5x5 for the first 8 levels, +1 every 8 levels up to 12x12), and each level picks a random
   category, so two players are rarely on the same category at the same level. */

const LZ_ALL_DIRS = [[0,1],[1,0],[1,1],[-1,1],[0,-1],[-1,0],[-1,-1],[1,-1]];
const lzSize = lv => Math.min(12, 5 + Math.floor((lv - 1) / 8));
const lzWordCount = lv => Math.min(8, 3 + Math.floor((lv - 1) / 10));
const lzDirsFor = lv => lv < 4 ? LZ_ALL_DIRS.slice(0, 2) : lv < 12 ? LZ_ALL_DIRS.slice(0, 3) : lv < 24 ? LZ_ALL_DIRS.slice(0, 4) : LZ_ALL_DIRS;
const lzKey = s => String(s).normalize('NFD').replace(/[^A-Za-z]/g, '').toUpperCase();
const LZ_HINTS_PER_LEVEL = 3;
const LZ_COLS = {
  multi: ['#ef476f', '#ffa62b', '#06d6a0', '#4cc9f0', '#9b5de5', '#f15bb5', '#8ac926', '#1982c4'],
  theme: ['var(--fard)', 'var(--nafil)', 'var(--special)', 'var(--meal)', 'var(--roza)', 'var(--accent)', 'var(--green)', 'var(--red)'],
  one:   ['var(--accent)']
};
const LZ_COL_NAMES = [['multi', 'Rang-birangi', 'Colourful'], ['theme', 'Theme ke rang', 'Theme colours'], ['one', 'Ek rang', 'One colour']];

/* ---------- word pools ---------- */
function lzStripArticle(n){ return String(n).replace(/^aal-e-/i, '').replace(/^(al|an|ar|as|at|ad|az|ash|adh|ath)[-\s]/i, ''); }
function lzPersonWord(full){
  let s = String(full).replace(/\(.*?\)/g, '').trim();
  for(let i = 0; i < 3; i++) s = s.replace(/^(Imam|Sheikh|Shaykh|Sultan|Hazrat|Maulana|Maulvi|Moulvi|Allama|Dr\.|Prof\.|Hakim|Al-|Ash-|As-)\s*/i, '');
  const t = s.split(/\s+/);
  if(/^(muhammad|mohammad)$/i.test(t[0]) && /^(bin|ibn)$/i.test(t[1]||'') && t[2]) return t[2];
  if(/^(abu|umm|ibn|bin|alp|abdul|abdur|abd)$/i.test(t[0]) && t[1]) return t[0] + ' ' + t[1];
  return t[0];
}
let LZ_CATS = null;
function lzCats(){
  if(LZ_CATS) return LZ_CATS;
  const C = [];
  const add = (id, ic, rur, en, list)=>{
    const seen = new Set(), ws = [];
    list.forEach(x=>{
      const k = lzKey(x.w); if(k.length < 3 || k.length > 12 || seen.has(k) || k === k.split('').reverse().join('')) return;
      seen.add(k); ws.push({ w: String(x.w).replace(/^[^A-Za-z]+/, ''), k, m: x.m || '' });
    });
    if(ws.length >= 6) C.push({ id, ic, rur, en, ws });
  };
  const sh = (typeof SHK_DATA !== 'undefined') ? SHK_DATA : {};
  const people = (keys, suf)=> keys.flatMap(k=> (sh[k] || []).map(r=>({ w: lzPersonWord(r[0]), m: `${r[0]}${suf ? ' ' + suf : ''}: ${r[2]}` })));
  try{
    add('surah', '📖', 'Surah ke Naam', 'Names of Surahs', QURAN_SURAHS.map(s=>({ w: lzStripArticle(s.name), m: `Surah ${s.n} · ${s.name} · ${s.ar}` })));
    add('para', '📚', 'Para ke Naam', 'Names of Paras', QURAN_PARAS.map(p=>({ w: p.name, m: `Para ${p.n}` })));
    add('asma', '🌙', 'Asma-ul-Husna', 'Asma-ul-Husna', ASMA_UL_HUSNA.map(a=>({ w: lzStripArticle(a.tr), m: `${a.tr}: ${a.m}` })));
    add('nabinames', '🕌', 'Nabi ﷺ ke Naam', 'Names of the Prophet ﷺ', PROPHET_NAMES.map(a=>({ w: lzStripArticle(a.tr), m: `${a.tr}: ${a.m}` })));
    add('anbiya', '🌟', 'Anbiya-e-Kiram', 'Prophets', people(['anbiya'], '(AS)'));
    add('sahaba', '🤝', 'Sahaba-e-Kiram', 'Companions', people(['khulafa', 'sahaba'], '(RA)'));
    add('sahabiyat', '🏡', 'Sahabiyat aur Ahl-e-Bait', 'Women Companions and Ahl-e-Bait', people(['ahlebait'], '(RA)'));
    add('ulama', '📿', 'Ulama, Imam aur Buzurg', 'Imams and Scholars', people(['tabiin', 'imams', 'ulama'], '(rh.)'));
    add('science', '🔭', 'Scientists aur Mufakkir', 'Scientists and Thinkers', people(['science'], '(rh.)'));
    add('sipah', '🛡️', 'Sipah-salar aur Hukmaran', 'Commanders and Rulers', people(['sipah', 'rulers'], '(rh.)'));
    const mon = HIJRI_MONTHS.map(n=>{ const p = n.split('-'); const k = /^(Rabi|Jamadi)$/.test(p[0]) ? p[0] + p[1] + p[2] : p[0] === 'Zul' ? p[0] + p[1] : p[0]; return { w: k.replace(/'/g, ''), m: `${n}: Hijri saal ka ${HIJRI_MONTHS.indexOf(n) + 1}vaan mahina` }; });
    add('months', '🗓️', 'Islami Mahine', 'Islamic Months', mon);
  }catch(e){}
  const grp = {};
  KHAAS_SHABD.forEach(x=>{ (grp[x.cat] = grp[x.cat] || []).push({ w: x.tr, m: `${x.tr} (${x.ar}): ${x.m}` }); });
  const khIc = { 'Allah, Imaan aur Aqeeda':'☪️', 'Nabi, Rasool aur Ambiya':'🌟', 'Farishte aur Ghaibi Makhlooq':'👼', 'Ibadat aur Namaz':'🕋', 'Roza aur Ramzan':'🌙', 'Hajj, Umrah aur Qurbani':'🕋', 'Jannat aur Aakhirat':'🌿', 'Islamic Battles / Ghazawaat':'🛡️' };
  Object.keys(grp).forEach(cat=> add('kh:' + cat, khIc[cat] || '🔤', cat, cat, grp[cat]));
  add('qalfaz', '📖', 'Qur’ani Alfaaz', 'Qur’anic Words', QURAN_WORDS.map(q=>({ w: lzStripArticle(q.tr), m: `${q.tr} (${q.ar}): ${q.m}` })));
  add('hbooks', '📜', 'Hadees ki Kitabein', 'Hadith Books', [
    { w:'Bukhari', m:'Sahih Bukhari: Imam Bukhari ki hadees ki kitab' }, { w:'Muslim', m:'Sahih Muslim: Imam Muslim ki hadees ki kitab' },
    { w:'Tirmidhi', m:'Jami at-Tirmidhi: Imam Tirmidhi ki kitab' }, { w:'Nasai', m:'Sunan an-Nasai: Imam Nasai ki kitab' },
    { w:'Abu Dawood', m:'Sunan Abu Dawood: Imam Abu Dawood ki kitab' }, { w:'Ibn Majah', m:'Sunan Ibn Majah: Imam Ibn Majah ki kitab' },
    { w:'Muwatta', m:'Muwatta: Imam Malik ki kitab' }, { w:'Musnad', m:'Musnad Ahmad: Imam Ahmad ibn Hanbal ki badi kitab' },
    { w:'Riyazus Saliheen', m:'Riyaz as-Salihin: Imam Nawawi ki kitab' }, { w:'Mishkat', m:'Mishkat al-Masabih: hadees ka mashhoor majmua' },
    { w:'Bulugh', m:'Bulugh al-Maram: Ibn Hajar al-Asqalani ki kitab' }, { w:'Arbaeen', m:'Arbaeen: Imam Nawawi ki 40 hadees' },
    { w:'Darimi', m:'Sunan ad-Darimi: hadees ki kitab' }, { w:'Mustadrak', m:'Al-Mustadrak: Imam Al-Hakim ki kitab' }
  ]);
  add('hterms', '📜', 'Hadees ki Istilahat', 'Hadith Terms', [
    { w:'Sahih', m:'Sahih: durust aur mazboot sanad wali hadees' }, { w:'Hasan', m:'Hasan: achhi hadees (Sahih se kuch kam darje ki)' },
    { w:'Daif', m:'Daif: kamzor sanad wali hadees' }, { w:'Mutawatir', m:'Mutawatir: itne zyada raviyon se jis par jhoot par ittefaq mumkin nahi' },
    { w:'Mauzu', m:'Mauzu: gadhi hui (jaali) hadees' }, { w:'Sanad', m:'Sanad: raviyon ka silsila' }, { w:'Matn', m:'Matn: hadees ke alfaaz (text)' },
    { w:'Rawi', m:'Rawi: hadees bayan karne wala' }, { w:'Muhaddith', m:'Muhaddith: hadees ka aalim' }, { w:'Marfu', m:'Marfu: wo hadees jo Nabi ﷺ tak pahunchti hai' },
    { w:'Mauquf', m:'Mauquf: wo riwayat jo Sahabi tak pahunchti hai' }, { w:'Qudsi', m:'Hadees-e-Qudsi: Nabi ﷺ ka Allah ki taraf se baat naqal karna' }
  ]);
  add('nnames', '🕋', 'Namaz ke Naam', 'Names of Prayers', [
    { w:'Fajr', m:'Fajr: subah ki farz namaz, 2 rakat' }, { w:'Zuhr', m:'Zuhr: dopahar ki farz namaz, 4 rakat' }, { w:'Asr', m:'Asr: ahdhi dopahar ke baad ki farz namaz, 4 rakat' },
    { w:'Maghrib', m:'Maghrib: suraj doobne par, 3 rakat' }, { w:'Isha', m:'Isha: raat ki farz namaz, 4 rakat' }, { w:'Witr', m:'Witr: Isha ke baad ki taaq rakaton ki namaz (Hanafi mein wajib)' },
    { w:'Juma', m:'Juma: hafte ki khaas namaz, 2 rakat farz, khutba ke saath' }, { w:'Tahajjud', m:'Tahajjud: raat ke aakhri hisse ki nafil namaz' },
    { w:'Ishraq', m:'Ishraq: suraj nikalne ke baad ki nafil namaz' }, { w:'Chaasht', m:'Chaasht: din chadhne par ki nafil namaz' },
    { w:'Awwabin', m:'Awwabin: Maghrib ke baad ki nafil namaz' }, { w:'Tarawih', m:'Tarawih: Ramzan ki raaton ki namaz' },
    { w:'Janaza', m:'Janaza: mayyat ki namaz, khade ho kar, bina ruku aur sajde ke' }, { w:'Istikhara', m:'Istikhara: bhalai ki dua ki 2 rakat nafil namaz' }
  ]);
  add('narkan', '🕋', 'Namaz ke Arkaan aur Alfaaz', 'Words of Prayer', [
    { w:'Qiyam', m:'Qiyam: namaz mein khade hona' }, { w:'Ruku', m:'Ruku: namaz mein jhukna' }, { w:'Sajda', m:'Sajda: zameen par peshani rakhna' },
    { w:'Jalsa', m:'Jalsa: do sajdon ke beech ki baithak' }, { w:'Qadah', m:'Qa’dah: namaz mein baithak' }, { w:'Takbeer', m:'Takbeer: "Allahu Akbar" kehna' },
    { w:'Salam', m:'Salam: namaz khatam karne ka salam' }, { w:'Tashahhud', m:'Tashahhud (Attahiyyat): baithak mein padhi jane wali dua' }, { w:'Qiraat', m:'Qiraat: namaz mein Qur’an padhna' },
    { w:'Wuzu', m:'Wuzu: namaz se pehle ki paaki' }, { w:'Ghusl', m:'Ghusl: poore badan ki paaki' }, { w:'Tayammum', m:'Tayammum: paani na hone par paak mitti se paaki' },
    { w:'Qibla', m:'Qibla: Kaaba ki taraf ka rukh' }, { w:'Azan', m:'Azan: namaz ke liye pukar' }, { w:'Iqamat', m:'Iqamat: jamaat shuru hone se pehle ki takbeer' },
    { w:'Imam', m:'Imam: namaz padhane wala' }, { w:'Muqtadi', m:'Muqtadi: imam ke peeche namaz padhne wala' }, { w:'Niyat', m:'Niyat: namaz ka iraada' }, { w:'Rakat', m:'Rakat: namaz ki ek ikai' }, { w:'Durood', m:'Durood: Nabi ﷺ par salam o rehmat ki dua' }
  ]);
  LZ_CATS = C;
  return C;
}

/* ---------- puzzle generation ---------- */
const lzRand = n => Math.floor(Math.random() * n);
function lzShuffle(a){ a = a.slice(); for(let i = a.length - 1; i > 0; i--){ const j = lzRand(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function lzState(){
  const s = state.lafz = state.lafz || {};
  if(!s.lvl) s.lvl = 1;
  s.max = Math.max(s.max || 1, s.lvl);
  if(s.snd === undefined) s.snd = true;
  if(s.vib === undefined) s.vib = true;
  if(s.fx === undefined) s.fx = true;
  if(!LZ_COLS[s.col]) s.col = 'multi';
  s.seen = s.seen || {}; s.plays = s.plays || {}; s.last = s.last || []; s.stars = s.stars || {};
  return s;
}
function lzPickCategory(size, count){
  const S = lzState(), ok = lzCats().filter(c=> c.ws.filter(w=> w.k.length <= size).length >= count);
  const pool = ok.filter(c=> !S.last.slice(-2).includes(c.id));
  const from = pool.length ? pool : ok;
  const wts = from.map(c=> 1 / (1 + (S.plays[c.id] || 0)));
  let r = Math.random() * wts.reduce((a, b)=> a + b, 0);
  for(let i = 0; i < from.length; i++){ r -= wts[i]; if(r <= 0) return from[i]; }
  return from[0];
}
function lzPickWords(cat, size, count){
  const S = lzState();
  const cands = lzShuffle(cat.ws.filter(w=> w.k.length <= size)).sort((a, b)=> (S.seen[a.k] || 0) - (S.seen[b.k] || 0) + (Math.random() - .5) * 1.5);
  const out = [];
  for(const c of cands){
    if(out.length >= count) break;
    const rv = c.k.split('').reverse().join('');
    if(out.some(o=> o.k.includes(c.k) || c.k.includes(o.k) || o.k.includes(rv) || rv.includes(o.k))) continue;
    out.push(c);
  }
  return out;
}
function lzPlace(words, size, dirs){
  const g = Array.from({ length: size }, ()=> Array(size).fill(''));
  const placed = [];
  for(const w of words.slice().sort((a, b)=> b.k.length - a.k.length)){
    let done = false;
    for(let t = 0; t < 260 && !done; t++){
      const [dr, dc] = dirs[lzRand(dirs.length)], r = lzRand(size), c = lzRand(size);
      const er = r + dr * (w.k.length - 1), ec = c + dc * (w.k.length - 1);
      if(er < 0 || er >= size || ec < 0 || ec >= size) continue;
      let fit = true;
      for(let i = 0; i < w.k.length; i++){ const ch = g[r + dr * i][c + dc * i]; if(ch && ch !== w.k[i]){ fit = false; break; } }
      if(!fit) continue;
      for(let i = 0; i < w.k.length; i++) g[r + dr * i][c + dc * i] = w.k[i];
      placed.push({ ...w, r, c, dr, dc, found: false }); done = true;
    }
    if(!done) return null;
  }
  return { g, placed };
}
function lzCountOcc(g, k){
  const n = g.length; let c = 0;
  for(let r = 0; r < n; r++) for(let col = 0; col < n; col++) for(const [dr, dc] of LZ_ALL_DIRS){
    let i = 0; while(i < k.length){ const rr = r + dr * i, cc = col + dc * i; if(rr < 0 || rr >= n || cc < 0 || cc >= n || g[rr][cc] !== k[i]) break; i++; }
    if(i === k.length) c++;
  }
  return c;
}
function lzBuild(level){
  const size = lzSize(level), dirs = lzDirsFor(level);
  let count = lzWordCount(level);
  for(let attempt = 0; attempt < 40; attempt++){
    if(attempt === 25) count = Math.max(3, count - 1);
    const cat = lzPickCategory(size, count), words = lzPickWords(cat, size, count);
    if(words.length < count) continue;
    const pl = lzPlace(words, size, dirs); if(!pl) continue;
    const letters = words.map(w=> w.k).join('') + 'AEIOUNRLSTMDHKBQ';
    for(let f = 0; f < 25; f++){
      const g = pl.g.map(row=> row.map(ch=> ch || letters[lzRand(letters.length)]));
      if(pl.placed.every(w=> lzCountOcc(g, w.k) === 1)){
        return { level, cat: cat.id, size, grid: g.map(r=> r.join('')), words: pl.placed.map((w, i)=> ({ ...w, i })), wrong: 0, hints: 0, hl: LZ_HINTS_PER_LEVEL };
      }
    }
  }
  return null;
}

/* ---------- sound / vibration ---------- */
let lzAC = null;
function lzTone(seq, type, vol){
  const S = lzState(); if(!S.snd) return;
  try{
    lzAC = lzAC || new (window.AudioContext || window.webkitAudioContext)();
    if(lzAC.state === 'suspended') lzAC.resume();
    let t = lzAC.currentTime;
    seq.forEach(([f, d])=>{
      const o = lzAC.createOscillator(), gn = lzAC.createGain();
      o.type = type || 'sine'; o.frequency.value = f;
      gn.gain.setValueAtTime(0.0001, t); gn.gain.exponentialRampToValueAtTime(vol || .18, t + .01); gn.gain.exponentialRampToValueAtTime(0.0001, t + d);
      o.connect(gn); gn.connect(lzAC.destination); o.start(t); o.stop(t + d + .02); t += d * .8;
    });
  }catch(e){}
}
const lzOk = ()=> lzTone([[523, .1], [659, .1], [784, .16]], 'triangle', .2);
const lzBad = ()=> lzTone([[190, .13], [150, .2]], 'sawtooth', .12);
const lzTick = ()=> lzTone([[900, .03]], 'sine', .05);
const lzWin = ()=> lzTone([[523, .12], [659, .12], [784, .12], [1047, .3]], 'triangle', .22);
const lzHintSnd = ()=> lzTone([[740, .08], [988, .12]], 'sine', .14);
function lzVib(p){ const S = lzState(); if(S.vib){ try{ if(navigator.vibrate) navigator.vibrate(p); }catch(e){} } }

/* ---------- screen ---------- */
let lzCur = null, lzSel = null, lzTarget = -1, lzDrag = null, lzGeo = null;
const lzColor = i => { const a = LZ_COLS[lzState().col] || LZ_COLS.multi; return a[i % a.length]; };
const lzCatOf = id => lzCats().find(c=> c.id === id);
const lzCatName = c => isEn() ? c.en : c.rur;

function lzStart(fresh){
  const S = lzState();
  if(fresh || !S.cur || !S.cur.words || !S.cur.grid || S.cur.words.every(w=> w.found)){
    const p = lzBuild(S.lvl);
    if(!p){ S.cur = null; return false; }
    S.cur = p; S.last.push(p.cat); S.last = S.last.slice(-6); S.plays[p.cat] = (S.plays[p.cat] || 0) + 1;
    saveState();
  }
  return true;
}
function renderLafz(){
  quizState = null; if(typeof quizTimerStop === 'function') quizTimerStop();
  const S = lzState();
  document.getElementById('detailTitle').textContent = L({ rur: 'Lafz Talash', en: 'Word Search' });
  const body = document.getElementById('detailBody');
  if(!lzStart(false)){ body.innerHTML = `<div class="info-card"><p>${L({ rur: 'Abhi puzzle nahi ban saka. Dobara koshish karein.', en: 'Could not build a puzzle. Please try again.' })}</p></div>`; return; }
  lzCur = S.cur; lzSel = null; lzTarget = -1; lzDrag = null;
  const P = lzCur, cat = lzCatOf(P.cat) || { ic: '🔤', rur: '', en: '' }, n = P.size;
  const found = P.words.filter(w=> w.found).length;
  body.innerHTML = `
    <div class="lz">
      <div class="lz-top">
        <span class="lz-lv">${L({ rur: 'Level', en: 'Level' })} ${P.level}</span>
        <span class="lz-grow"></span>
        <button type="button" class="lz-ic" id="lzSet" aria-label="Settings" title="${L({ rur: 'Settings', en: 'Settings' })}" data-tip="${L({ rur: 'Settings', en: 'Settings' })}">⚙️</button>
        <button type="button" class="lz-ic" id="lzHelp" aria-label="Help" title="${L({ rur: 'Madad', en: 'Help' })}" data-tip="${L({ rur: 'Madad', en: 'Help' })}">❓</button>
      </div>
      <div class="lz-panel" id="lzPanel" hidden></div>
      <div class="lz-cat"><span>${cat.ic} ${lzCatName(cat)}</span><b id="lzCnt">${found}/${P.words.length}</b></div>
      <div class="lz-words" id="lzWords"></div>
      <div class="lz-gridwrap">
        <div class="lz-grid" id="lzGrid" style="--n:${n}">${P.grid.map((row, r)=> row.split('').map((ch, c)=> `<i data-r="${r}" data-c="${c}">${ch}</i>`).join('')).join('')}
          <svg class="lz-svg" id="lzSvg" viewBox="0 0 ${n} ${n}" preserveAspectRatio="none"></svg>
        </div>
      </div>
      <div class="lz-toast" id="lzToast"></div>
      <div class="lz-hintrow">
        <button type="button" class="lz-hint" id="lzH1">💡 ${L({ rur: 'Pehla harf', en: 'First letter' })} <em id="lzHN">${P.hl}</em></button>
        <button type="button" class="lz-hint" id="lzH2">🔍 ${L({ rur: 'Word dikhao', en: 'Show word' })} <em>2</em></button>
      </div>
    </div>`;
  lzDrawWords(); lzDrawLines(); lzWire();
  if(found === P.words.length) lzFinish(true);
}
function lzDrawWords(){
  const el = document.getElementById('lzWords'); if(!el) return;
  el.innerHTML = lzCur.words.map(w=> `<button type="button" class="lz-w${w.found ? ' done' : ''}${lzTarget === w.i ? ' target' : ''}" data-i="${w.i}" ${w.found ? `style="--c:${lzColor(w.i)}"` : ''}>${w.w}</button>`).join('');
  el.querySelectorAll('.lz-w').forEach(b=>{
    b.onclick = ()=>{
      const w = lzCur.words[+b.dataset.i];
      if(w.found){ lzToast(w.m || w.w, 'info'); return; }
      lzTarget = lzTarget === w.i ? -1 : w.i; lzDrawWords();
    };
  });
  const c = document.getElementById('lzCnt'); if(c) c.textContent = lzCur.words.filter(w=> w.found).length + '/' + lzCur.words.length;
}
function lzLine(r, c, dr, dc, len, color, cls, op){
  const x1 = c + .5, y1 = r + .5, x2 = c + dc * (len - 1) + .5, y2 = r + dr * (len - 1) + .5;
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width=".78" stroke-linecap="round" opacity="${op || .5}" class="${cls || ''}"/>`;
}
function lzDrawLines(extra){
  const svg = document.getElementById('lzSvg'); if(!svg) return;
  svg.innerHTML = lzCur.words.filter(w=> w.found).map(w=> lzLine(w.r, w.c, w.dr, w.dc, w.k.length, lzColor(w.i), 'lz-fnd', .5)).join('') + (extra || '');
}
function lzToast(txt, kind, ms){
  const t = document.getElementById('lzToast'); if(!t) return;
  t.className = 'lz-toast show ' + (kind || ''); t.textContent = txt;
  clearTimeout(lzToast._t); lzToast._t = setTimeout(()=>{ t.className = 'lz-toast'; }, ms || (kind === 'bad' ? 1100 : 3600));
}
function lzCellFromPoint(e){
  const g = document.getElementById('lzGrid'); if(!g) return null;
  const R = g.getBoundingClientRect(), n = lzCur.size;
  return { x: (e.clientX - R.left) / R.width * n, y: (e.clientY - R.top) / R.height * n };
}
function lzSelFrom(start, pt){
  const dx = pt.x - (start.c + .5), dy = pt.y - (start.r + .5);
  if(Math.hypot(dx, dy) < .45) return { r: start.r, c: start.c, dr: 0, dc: 1, len: 1 };
  const ang = Math.round(Math.atan2(dy, dx) / (Math.PI / 4)), dirs = [[0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0], [-1, 1]];
  const [dr, dc] = dirs[((ang % 8) + 8) % 8], n = lzCur.size;
  let len = Math.round((dx * dc + dy * dr) / (dc * dc + dr * dr)) + 1;
  let maxLen = 99;
  if(dr > 0) maxLen = Math.min(maxLen, n - start.r); if(dr < 0) maxLen = Math.min(maxLen, start.r + 1);
  if(dc > 0) maxLen = Math.min(maxLen, n - start.c); if(dc < 0) maxLen = Math.min(maxLen, start.c + 1);
  len = Math.max(1, Math.min(len, maxLen));
  return { r: start.r, c: start.c, dr, dc, len };
}
function lzSelText(s){ let t = ''; for(let i = 0; i < s.len; i++) t += lzCur.grid[s.r + s.dr * i][s.c + s.dc * i]; return t; }
function lzWire(){
  const g = document.getElementById('lzGrid'); if(!g) return;
  const fit = ()=>{ const w = g.getBoundingClientRect().width; g.style.fontSize = Math.max(14, w / lzCur.size * .5) + 'px'; };
  fit(); requestAnimationFrame(fit);
  g.onpointerdown = e=>{
    if(lzCur.words.every(w=> w.found)) return;
    const pt = lzCellFromPoint(e); if(!pt) return;
    const r = Math.floor(pt.y), c = Math.floor(pt.x); if(r < 0 || c < 0 || r >= lzCur.size || c >= lzCur.size) return;
    try{ g.setPointerCapture(e.pointerId); }catch(_){}
    lzDrag = { r, c }; lzSel = { r, c, dr: 0, dc: 1, len: 1 }; lzPaintSel('sel'); lzTick(); e.preventDefault();
  };
  g.onpointermove = e=>{
    if(!lzDrag) return; const pt = lzCellFromPoint(e); if(!pt) return;
    const s = lzSelFrom(lzDrag, pt);
    if(!lzSel || s.len !== lzSel.len || s.dr !== lzSel.dr || s.dc !== lzSel.dc){ if(!lzSel || s.len !== lzSel.len){ lzTick(); lzVib(6); } lzSel = s; lzPaintSel('sel'); }
  };
  const end = ()=>{
    if(!lzDrag) return; lzDrag = null; const s = lzSel; lzSel = null;
    if(!s || s.len < 2){ lzDrawLines(); return; }
    lzCheck(s);
  };
  g.onpointerup = end; g.onpointercancel = ()=>{ lzDrag = null; lzSel = null; lzDrawLines(); };
  g.oncontextmenu = e=> e.preventDefault();
  document.getElementById('lzH1').onclick = ()=> lzHint(1);
  document.getElementById('lzH2').onclick = ()=> lzHint(2);
  document.getElementById('lzSet').onclick = lzSettings;
  document.getElementById('lzHelp').onclick = lzHelp;
}
function lzPaintSel(kind){
  if(!lzSel) return;
  lzDrawLines(lzLine(lzSel.r, lzSel.c, lzSel.dr, lzSel.dc, lzSel.len, kind === 'bad' ? 'var(--red)' : 'var(--accent)', kind === 'bad' ? 'lz-bad' : 'lz-sel', kind === 'bad' ? .6 : .45));
}
function lzCheck(s){
  const txt = lzSelText(s), rev = txt.split('').reverse().join('');
  const w = lzCur.words.find(x=> !x.found && (x.k === txt || x.k === rev));
  if(w){
    w.found = true; if(lzTarget === w.i) lzTarget = -1;
    const S = lzState(); S.seen[w.k] = (S.seen[w.k] || 0) + 1;
    lzDrawLines(); lzDrawWords(); saveState();
    lzPop(w); lzOk(); lzVib(25); lzToast(w.m || w.w, 'ok');
    if(lzCur.words.every(x=> x.found)) setTimeout(()=> lzFinish(false), lzState().fx ? 900 : 250);
  } else {
    lzCur.wrong++; saveState();
    lzSel = s; lzPaintSel('bad'); lzBad(); lzVib([40, 40, 40]);
    const g = document.getElementById('lzGrid');
    if(lzState().fx && g){ g.classList.remove('lz-shake'); void g.offsetWidth; g.classList.add('lz-shake'); }
    setTimeout(()=>{ lzSel = null; lzDrawLines(); }, 420);
  }
}
function lzPop(w){
  if(!lzState().fx) return;
  const g = document.getElementById('lzGrid'); if(!g) return;
  for(let i = 0; i < w.k.length; i++){
    const cell = g.querySelector(`i[data-r="${w.r + w.dr * i}"][data-c="${w.c + w.dc * i}"]`);
    if(cell){ cell.style.setProperty('--d', (i * 55) + 'ms'); cell.style.setProperty('--pc', lzColor(w.i)); cell.classList.remove('lz-pop'); void cell.offsetWidth; cell.classList.add('lz-pop'); }
  }
}
function lzHint(kind){
  const P = lzCur; if(!P || P.words.every(w=> w.found)) return;
  const cost = kind === 2 ? 2 : 1;
  if(P.hl < cost){ lzToast(L({ rur: 'Is level ke hint khatam ho gaye.', en: 'No hints left for this level.' }), 'bad'); return; }
  const left = P.words.filter(w=> !w.found);
  const w = (lzTarget >= 0 && !P.words[lzTarget].found) ? P.words[lzTarget] : left[lzRand(left.length)];
  P.hl -= cost; P.hints += cost; saveState();
  const hn = document.getElementById('lzHN'); if(hn) hn.textContent = P.hl;
  lzHintSnd(); lzVib(15);
  const g = document.getElementById('lzGrid'), first = g.querySelector(`i[data-r="${w.r}"][data-c="${w.c}"]`);
  if(kind === 1){
    first.classList.remove('lz-hl'); void first.offsetWidth; first.classList.add('lz-hl');
    setTimeout(()=> first.classList.remove('lz-hl'), 4200);
    lzToast(L({ rur: `"${w.w}" ka pehla harf: ${w.k[0]}`, en: `First letter of "${w.w}": ${w.k[0]}` }), 'info');
  } else {
    lzDrawLines(lzLine(w.r, w.c, w.dr, w.dc, w.k.length, 'var(--special)', 'lz-hint-line', .55));
    setTimeout(()=> lzDrawLines(), 2200);
  }
}
function lzSettings(){
  const p = document.getElementById('lzPanel'); if(!p) return;
  if(!p.hidden){ p.hidden = true; return; }
  const S = lzState();
  const row = (id, ic, t, on)=> `<button type="button" class="lz-row" data-k="${id}"><span>${ic} ${t}</span><span class="lz-sw${on ? ' on' : ''}"></span></button>`;
  p.innerHTML = row('snd', '🔊', L({ rur: 'Awaaz', en: 'Sound' }), S.snd) + row('vib', '📳', L({ rur: 'Vibration', en: 'Vibration' }), S.vib) + row('fx', '✨', L({ rur: 'Effects (animation)', en: 'Effects (animation)' }), S.fx)
    + `<div class="lz-row2"><span>🎨 ${L({ rur: 'Rang', en: 'Colours' })}</span><div class="qz-seg" id="lzColSeg">${LZ_COL_NAMES.map(([k, r, e])=> `<button type="button" data-k="${k}" class="${S.col === k ? 'on' : ''}">${isEn() ? e : r}</button>`).join('')}</div></div>`;
  p.insertAdjacentHTML('beforeend', lzProgressHtml(true)); lzProgressBind(p, true);
  p.hidden = false;
  p.querySelectorAll('.lz-row[data-k]').forEach(b=>{ b.onclick = ()=>{ S[b.dataset.k] = !S[b.dataset.k]; saveState(); b.querySelector('.lz-sw').classList.toggle('on', S[b.dataset.k]); if(b.dataset.k === 'snd' && S.snd) lzOk(); }; });
  p.querySelectorAll('#lzColSeg button').forEach(b=>{ b.onclick = ()=>{ S.col = b.dataset.k; saveState(); p.querySelectorAll('#lzColSeg button').forEach(x=> x.classList.toggle('on', x === b)); lzDrawWords(); lzDrawLines(); }; });
}
/* go back to any earlier level, restart the level, or reset progress */
function lzProgressHtml(inGame){
  const S = lzState(), max = Math.max(S.max || 1, S.lvl);
  const opts = Array.from({ length: max }, (_, i)=> { const n = i + 1, st = S.stars[n] || 0; return `<option value="${n}"${n === S.lvl ? ' selected' : ''}>${L({ rur: 'Level', en: 'Level' })} ${n}${st ? ' ' + '★'.repeat(st) : ''}${n === S.lvl ? ' (' + L({ rur: 'abhi', en: 'current' }) + ')' : ''}</option>`; }).join('');
  return `<div class="lz-row2"><span>📍 ${L({ rur: 'Level chuniye', en: 'Choose level' })} <small>(${L({ rur: 'sabse unchi', en: 'highest' })}: ${max})</small></span><div class="lz-lvpick"><select id="lzLvSel">${opts}</select><button type="button" class="kh-act" id="lzLvGo">${L({ rur: 'Chalo', en: 'Go' })} ▶</button></div></div>
    ${inGame ? `<button type="button" class="lz-row lz-act" id="lzRestart"><span>🔁 ${L({ rur: 'Is level ko dobara shuru karein', en: 'Restart this level' })}</span></button>` : ''}
    <button type="button" class="lz-row lz-act" id="lzReset"><span>🗑️ ${L({ rur: 'Level progress reset (Level 1 se)', en: 'Reset level progress (from Level 1)' })}</span></button>`;
}
function lzProgressBind(p, inGame){
  const S = lzState(), go = n=>{ S.lvl = n; S.cur = null; saveState(); renderLafz(); };
  const g = p.querySelector('#lzLvGo'); if(g) g.onclick = ()=> go(+p.querySelector('#lzLvSel').value);
  const r = p.querySelector('#lzRestart'); if(r) r.onclick = ()=> go(S.lvl);
  const x = p.querySelector('#lzReset'); if(!x) return;
  const label = x.innerHTML;
  x.onclick = ()=>{
    if(!x.dataset.sure){ x.dataset.sure = '1'; x.classList.add('danger'); x.innerHTML = `<span>⚠️ ${L({ rur: 'Pakka? Sab levels aur sitare mit jayenge. Dobara dabayein.', en: 'Sure? All levels and stars will be cleared. Tap again.' })}</span>`; setTimeout(()=>{ if(x.dataset.sure){ delete x.dataset.sure; x.classList.remove('danger'); x.innerHTML = label; } }, 5000); return; }
    S.lvl = 1; S.max = 1; S.stars = {}; S.cur = null; saveState();
    if(inGame) renderLafz(); else { renderKhelMore(); }
  };
}
function lzHelp(){
  lzToast(L({ rur: 'Grid mein chhupe lafz dhoondhein: pehle harf par ungli rakh kar aakhri harf tak ghumayein (seedhi ya tirchi line). Lafz ke naam par dabane se uska matlab aur hint ka nishana milta hai. Zyada tafseel ke liye ulema se mashwara karein.', en: 'Find the hidden words: press on the first letter and drag to the last (straight or diagonal). Tap a word in the list to see its meaning or to aim a hint at it. Please consult your ulema for more detail.' }), 'info');
  clearTimeout(lzToast._t); lzToast._t = setTimeout(()=>{ const t = document.getElementById('lzToast'); if(t) t.className = 'lz-toast'; }, 9000);
}
function lzStars(P){ return P.hints === 0 && P.wrong <= 2 ? 3 : P.wrong <= 6 ? 2 : 1; }
function lzFinish(resumed){
  const S = lzState(), P = lzCur, body = document.getElementById('detailBody'); if(!P) return;
  const stars = lzStars(P);
  if(!resumed){
    S.stars[P.level] = Math.max(S.stars[P.level] || 0, stars); S.done = (S.done || 0) + 1; S.wordsFound = (S.wordsFound || 0) + P.words.length;
    S.lvl = P.level + 1; S.max = Math.max(S.max || 1, S.lvl); S.cur = null; saveState(); lzWin(); lzVib([30, 40, 30, 40, 80]);
  }
  const cat = lzCatOf(P.cat) || { ic: '🔤', rur: '', en: '' };
  const conf = lzState().fx && !resumed ? Array.from({ length: 18 }, (_, i)=> `<s style="--x:${lzRand(100)}%;--dl:${(i * 60) % 700}ms;--cc:${LZ_COLS.multi[i % 8]}"></s>`).join('') : '';
  body.innerHTML = `<div class="lz lz-done">${conf ? `<div class="lz-conf">${conf}</div>` : ''}
    <div class="lz-banner">${L({ rur: `Level ${P.level} poora!`, en: `Level ${P.level} complete!` })}</div>
    <div class="lz-stars">${[1, 2, 3].map(i=> `<span class="${i <= stars ? 'on' : ''}">★</span>`).join('')}</div>
    <p class="lz-sub">${cat.ic} ${lzCatName(cat)}</p>
    <div class="lz-learn">${P.words.map(w=> `<div class="lz-lrow" style="--c:${lzColor(w.i)}"><b>${w.w}</b><span>${(w.m || '').replace(/^[^:]*:\s*/, '') || w.m}</span></div>`).join('')}</div>
    <button type="button" class="quiz-next" id="lzNext" style="position:static;margin-top:14px;">${L({ rur: `Agla level ${P.level + 1}`, en: `Next level ${P.level + 1}` })} ▶</button>
    <p class="lz-note">${L({ rur: 'Ye jaankari sirf seekhne ke liye hai; mazeed ke liye ulema se mashwara karein.', en: 'This is for learning only; please consult your ulema for more.' })}</p>
  </div>`;
  document.getElementById('lzNext').onclick = ()=>{ renderLafz(); };
}
