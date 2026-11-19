/* ============================================================
   MALA: a bead-garland Tasbeeh that shows the dua you are reading.
   - Counted beads, the current bead and the beads still to come each have their own colour (six colour themes).
   - The dua (Arabic, pronunciation, meaning), the count and the total (7 / 33) share the screen.
   - Everything is set from the gear panel: colours, scene, text size, what to show, target, sound, vibration, tap area.
   - Works for the single Tasbeeh counter and for a set of duas that run one after another (like "Toofan Ke 5 Duas").
   ============================================================ */
const MALA_LIB = [
  { n:"Hasbunallahu wa ni'mal wakeel", ar:'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ', m:'Humein Allah hi kaafi hai, aur woh behtareen kaarsaaz (bharose ke laayak) hai.', en:'Allah is sufficient for us, and He is the best Disposer of affairs.', t:3, alias:['Hasbunallah'] },
  { n:'Allahumma ajirni minan naar', ar:'اللَّهُمَّ أَجِرْنِي مِنَ النَّارِ', m:'Ae Allah, mujhe (Jahannam ki) aag se panah de.', en:'O Allah, protect me from the Fire.', t:3 },
  { n:"Allahumma inni as'alukal jannah", ar:'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْجَنَّةَ', m:'Ae Allah, main Tujh se Jannat maangta hoon.', en:'O Allah, I ask You for Paradise.', t:3 },
  { n:'Astaghfirullaha wa atoobu ilaih', ar:'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ', m:'Main Allah se maafi maangta hoon aur usi ki taraf tauba karta hoon.', en:"I seek Allah's forgiveness and turn to Him in repentance.", t:3 },
  { n:'La hawla wala quwwata illa billah', ar:'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ', m:'Allah ke bina na koi taqat hai aur na koi zor.', en:'There is no power and no strength except with Allah.', t:3 },
  { n:'SubhanAllah', ar:'سُبْحَانَ اللَّهِ', m:'Allah paak hai.', en:'Glory be to Allah.', t:33, alias:['Subhan Allah'] },
  { n:'Alhamdulillah', ar:'الْحَمْدُ لِلَّهِ', m:'Sab tareef Allah ke liye hai.', en:'All praise is for Allah.', t:33 },
  { n:'Allahu Akbar', ar:'اللَّهُ أَكْبَرُ', m:'Allah sab se bada hai.', en:'Allah is the Greatest.', t:34 },
  { n:'La ilaha illallah', ar:'لَا إِلَهَ إِلَّا اللَّهُ', m:"Allah ke siwa koi ma'bood nahi.", en:'There is no god but Allah.', t:100 },
  { n:'Astaghfirullah', ar:'أَسْتَغْفِرُ اللَّهَ', m:'Main Allah se maafi maangta hoon.', en:'I seek forgiveness from Allah.', t:100, alias:['Astaghfar'] },
  { n:'Subhanallahi wa bihamdihi', ar:'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', m:'Allah paak hai aur usi ki tareef hai.', en:'Glory be to Allah and praise be to Him.', t:100 },
  { n:'Subhanallahil azeem', ar:'سُبْحَانَ اللَّهِ الْعَظِيمِ', m:'Azmat wala Allah paak hai.', en:'Glory be to Allah, the Magnificent.', t:100 },
  { n:'Teesra Kalima', tr:'Subhanallahi walhamdulillahi wa la ilaha illallahu wallahu akbar, wa la hawla wa la quwwata illa billahil aliyyil azim', ar:'سُبْحَانَ ٱللَّٰهِ وَٱلْحَمْدُ لِلَّٰهِ وَلَا إِلَٰهَ إِلَّا ٱللَّٰهُ وَٱللَّٰهُ أَكْبَرُ وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِٱللَّٰهِ ٱلْعَلِيِّ ٱلْعَظِيمِ', m:"Allah paak hai, aur sab tareefein Allah hi ke liye hain, aur Allah ke siwa koi ma'bood nahi, aur Allah sab se bada hai. Aur gunah se bachne ki taqat aur neki karne ki quwwat Allah hi ki taraf se hai, jo buland martabe aur azmat wala hai.", en:'Glory be to Allah, and all praise is for Allah, and there is no god but Allah, and Allah is the Greatest. There is no power or strength except with Allah, the Most High, the Most Great.', t:100, alias:['Teesra Kalma', 'Third Kalima', 'Kalima Tamjeed'] },
  { n:'Auzu Billah', tr:'Auzu billahi minash shaitanir rajim', ar:'أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ', m:'Main mardood shaitan se Allah ki panah maangta hoon.', en:'I seek refuge in Allah from the accursed Satan.', t:3, alias:['Auzubillah'] },
  { n:'Bismillah', tr:'Bismillahir rahmanir rahim', ar:'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', m:'Allah ke naam se, jo nihayat meharban, nihayat reham karne wala hai.', en:'In the name of Allah, the Most Gracious, the Most Merciful.', t:3, alias:['Bismillahir Rahmanir Rahim'] },
  { n:'Durood Sharif', ar:'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ', m:'Ae Allah, Muhammad ﷺ par rehmat bhej.', en:'O Allah, send blessings upon Muhammad ﷺ.', t:100, alias:['Durud Sharif'] },
];
/* The five duas, three times each, as a ready-made set */
/* a profile made from one Du'a category, in the order of the Du'a section; each dua is read as often as its own repeat count */
function malaCatItems(cat, rep){
  return (typeof DUAS !== 'undefined' ? DUAS : []).filter(d=>d.cat === cat).sort((a, b)=>(a.ord || 99) - (b.ord || 99))
    .map((d, i)=>({ id:'c' + i + '_' + malaHash(d.title), name:d.title, target:rep || d.ptarget || d.rep || 3 }));
}
function malaStormItems(){
  return MALA_LIB.slice(0, 5).map((x, i)=>({ id:'st' + (i + 1), name:x.n, ar:x.ar, tr:x.n, m:x.m, en:x.en, target:3 }));
}

const MALA_THEMES = [
  { id:'gold',     n:{rur:'Sunehri', en:'Gold'},     on:'#f6c453', off:'#d8d2c2', cur:'#fff3b8', mark:'#e5702f' },
  { id:'emerald',  n:{rur:'Zumurrad', en:'Emerald'}, on:'#34d399', off:'#c3ebdf', cur:'#ffffff', mark:'#f59e0b' },
  { id:'ocean',    n:{rur:'Neela', en:'Ocean'},      on:'#38bdf8', off:'#c8e5f4', cur:'#ffffff', mark:'#f97316' },
  { id:'rose',     n:{rur:'Gulabi', en:'Rose'},      on:'#f472b6', off:'#f2d3e3', cur:'#fff0f7', mark:'#fbbf24' },
  { id:'amethyst', n:{rur:'Jamni', en:'Amethyst'},   on:'#a78bfa', off:'#d8d1f2', cur:'#ffffff', mark:'#fb923c' },
  { id:'sunset',   n:{rur:'Shaam', en:'Sunset'},     on:'#f0643c', off:'#8fd3d9', cur:'#ffe2d6', mark:'#e11d48' },
];
const MALA_SCENE_NAMES = [ {rur:'Raat', en:'Night'}, {rur:'Maidaan', en:'Meadow'}, {rur:'Shaam', en:'Dusk'}, {rur:'Pahaad', en:'Peak'}, {rur:'Registan', en:'Desert'}, {rur:'Samundar', en:'Sea'}, {rur:'Subah', en:'Sunrise'}, {rur:'Ghuroob', en:'Sunset'}, {rur:'Badal', en:'Cloudy'} ];
/* Clean backgrounds after the nine scenes: [name, colour or [top, bottom]] */
const MALA_ART = 9;
const MALA_PLAIN = [
  [{rur:'Kaala', en:'Black'}, '#0b0e14'], [{rur:'Gehra Neela', en:'Navy'}, '#10203a'], [{rur:'Gehra Hara', en:'Forest'}, '#0e2a22'],
  [{rur:'Baingni', en:'Plum'}, '#2a1a40'], [{rur:'Bhoora', en:'Brown'}, '#2d221b'], [{rur:'Slate', en:'Slate'}, '#2b3440'],
  [{rur:'Neela-Baingni', en:'Indigo glow'}, ['#1b2a6b', '#6a2c91']], [{rur:'Hara-Neela', en:'Emerald sea'}, ['#0f6b4f', '#0b3a6b']],
  [{rur:'Narangi-Gulabi', en:'Sunset blend'}, ['#e0613a', '#8e2a6b']], [{rur:'Sunehri', en:'Gold dark'}, ['#b88a2e', '#1a1409']],
  [{rur:'Aasmani', en:'Sky'}, ['#4aa3df', '#1b3c6b']], [{rur:'Raat-Subah', en:'Night to dawn'}, ['#0b1220', '#c9785f']],
];
MALA_PLAIN.forEach(x=> MALA_SCENE_NAMES.push(x[0]));
/* Each scene's own weather when the weather is left on Auto: Night, Meadow, Dusk, Peak, Desert, Sea, Sunrise, Sunset, Cloudy */
const MALA_FX = ['firefly', 'wind', 'none', 'snow', 'dust', 'bubble', 'none', 'wind', 'rain'];
const MALA_WEATHER = [
  { id:'auto', n:{ rur:'Auto', en:'Auto' } }, { id:'none', n:{ rur:'Kuch nahi', en:'None' } },
  { id:'rain', n:{ rur:'🌧 Barish', en:'🌧 Rain' } }, { id:'snow', n:{ rur:'❄ Baraf', en:'❄ Snow' } },
  { id:'wind', n:{ rur:'🍃 Hawa', en:'🍃 Wind' } }, { id:'petal', n:{ rur:'🌸 Phool', en:'🌸 Petals' } },
  { id:'dust', n:{ rur:'✨ Gard', en:'✨ Dust' } }, { id:'bubble', n:{ rur:'🫧 Bulbule', en:'🫧 Bubbles' } },
  { id:'firefly', n:{ rur:'✦ Jugnu', en:'✦ Fireflies' } },
];
const MALA_SPEEDS = [ { id:'slow', k:1.9, n:{ rur:'Aahista', en:'Slow' } }, { id:'mid', k:1, n:{ rur:'Darmiyana', en:'Mild' } }, { id:'fast', k:0.5, n:{ rur:'Tez', en:'Fast' } } ];
const MALA_AR_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'], MALA_AR_K = { XS:.7, S:.85, M:1, L:1.2, XL:1.45, XXL:1.75 };
const MALA_TARGETS = [1, 3, 7, 11, 33, 99, 100];

function malaCfg(){
  const t = state.tasbeeh;
  if(!t.mala) t.mala = {};
  const m = t.mala, d = { theme:0, scene:null, arSize:'M', light:1, markEvery:0, stopAtTarget:false, keepAwake:false, showTr:true, showM:true, tapAny:true, fx:true, weather:'auto', speed:'mid', live:true, liveReal:false, liveMin:5, liveT0:0, livePaused:false, livePhase:0 };
  Object.keys(d).forEach(k=>{ if(m[k] === undefined) m[k] = d[k]; });
  if(m.markEvery === 11 && !m.markChosen) m.markEvery = 0;   /* marker beads are off unless the person turned them on */
  return m;
}
/* "SubhanAllah" and "Subhan Allah ﷻ" are the same zikr: add up names that differ only in spacing, case or the ﷻ sign (the most-read spelling is shown) */
/* names are shown without the ﷻ / ﷺ signs in the history lists */
function malaPlainName(n){ return String(n == null ? '' : n).replace(/[\uFDFA\uFDFB]/g, '').replace(/\bSubhan\s+Allah\b/gi, 'SubhanAllah').replace(/\s{2,}/g, ' ').trim(); }
function malaMergeNames(o){
  const m = {};
  Object.entries(o || {}).forEach(([n, v])=>{
    const k = String(n).toLowerCase().replace(/[^a-z\u0600-\u06ff]/g, '') || n;
    if(!m[k]) m[k] = { n, v:0, top:0 };
    m[k].v += v; if(v > m[k].top){ m[k].top = v; m[k].n = n; }
  });
  return Object.values(m).sort((x, y)=>y.v - x.v).map(x=>[malaPlainName(x.n), x.v]);
}
/* What was read today, by dua: state.tasbeeh.duaLog[day][name] = count (kept for 60 days) */
function malaDuaLog(){ const t = state.tasbeeh; if(!t.duaLog) t.duaLog = {}; return t.duaLog; }
function malaLogDua(name, d){
  name = name || L({ rur:'(bina naam ka zikr)', en:'(unnamed zikr)' });
  const lg = malaDuaLog(), k = dayKey(new Date()); if(!lg[k]) lg[k] = {};
  lg[k][name] = Math.max(0, (lg[k][name] || 0) + d); if(!lg[k][name]) delete lg[k][name];
  const keys = Object.keys(lg).sort(); while(keys.length > 60) delete lg[keys.shift()];
}
/* A dua counted on the plain counter also counts for the same-named zikr in today's profile */
function malaCreditProfile(name, d){
  const pf = malaTodayProfile(); if(!pf || !name) return;
  const key = malaNorm(name), it = pf.items.find(x=>malaNorm(x.name) === key); if(!it) return;
  const day = getZikrDay(new Date(), pf.id, true); day[it.id] = Math.max(0, (day[it.id] || 0) + d);
  if(d < 0) delete day.__marked;
}
function malaToday(){ return tasbeehLog()[dayKey(new Date())] || 0; }
/* "Aaj ka zikr profile": the one the person chose, otherwise Subah before 1 pm and Shaam after */
function malaTodayProfile(){
  ensureZikrProfiles();
  const t = state.tasbeeh, ps = t.profiles;
  const chosen = t.todayProfile && ps.find(x=>x.id === t.todayProfile);
  if(chosen) return chosen;
  /* a profile the person scheduled for today's weekday (and morning / evening) comes before the built-in ones */
  const now = new Date(), dow = now.getDay(), pm = now.getHours() >= 13;
  const hit = ps.filter(p=>p.sched && p.sched.days && p.sched.days.includes(dow) && (!p.sched.slot || p.sched.slot === 'any' || (p.sched.slot === 'pm') === pm) && p.items.length);
  if(hit.length) return hit.sort((a, b)=>(a.sched.slot && a.sched.slot !== 'any' ? 0 : 1) - (b.sched.slot && b.sched.slot !== 'any' ? 0 : 1))[0];
  return ps.find(x=>x.id === (pm ? 'evening' : 'morning')) || ps[0];
}
/* Days in a row on which at least one zikr set was completed */
function malaProfileStreak(){
  ensureZikrProfiles();
  const ps = state.tasbeeh.profiles.filter(p=>p.items.length);
  return calcStreak(d=> ps.some(p=>isZikrProfileComplete(d, p)));
}
/* Keep the screen on while the counter is open (only when switched on in settings) */
let malaWakeLock = null, malaWakeWatch = false;
function malaWake(){
  const M = malaCfg(), ov = document.getElementById('detailOverlay');
  const want = !!(M.keepAwake && document.querySelector('#detailBody .mala') && ov && ov.classList.contains('active') && !document.hidden);
  if(want && !malaWakeLock && navigator.wakeLock){
    navigator.wakeLock.request('screen').then(l=>{ malaWakeLock = l; l.addEventListener('release', ()=>{ if(malaWakeLock === l) malaWakeLock = null; }); }).catch(()=>{});
  } else if(!want && malaWakeLock){ try{ malaWakeLock.release(); }catch(e){} malaWakeLock = null; }
  if(!malaWakeWatch){
    malaWakeWatch = true;
    const mo = new MutationObserver(malaWake), b = document.getElementById('detailBody');
    if(b) mo.observe(b, { childList:true }); if(ov) mo.observe(ov, { attributes:true, attributeFilter:['class'] });
    document.addEventListener('visibilitychange', malaWake);
  }
}
function malaEsc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, c=>({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c])); }
function malaNorm(s){ return typeof gsNorm === 'function' ? gsNorm(s) : String(s || '').toLowerCase().replace(/[^a-z]/g, ''); }
function malaHash(s){ let h = 0; String(s).split('').forEach(c=>{ h = (h * 31 + c.charCodeAt(0)) >>> 0; }); return h; }
/* colour helpers for the bead gradients */
function malaRgb(hex){ const v = hex.replace('#', ''); return [0, 2, 4].map(i=>parseInt(v.substr(i, 2), 16)); }
function malaMix(a, b, p){ const A = malaRgb(a), B = malaRgb(b); return '#' + A.map((x, i)=>Math.round(x + (B[i] - x) * p).toString(16).padStart(2, '0')).join(''); }

/* Fill in Arabic, pronunciation and meaning for any item: its own fields first, then the zikr list, then the Du'a library */
function malaInfo(o){
  const n = o.n || o.name || '';
  const info = { n, ar:o.ar || '', tr:o.tr || '', m:o.m || '', en:o.en || '' };
  if(!info.ar || !info.m){
    const k = malaNorm(n);
    const hit = MALA_LIB.find(x=>malaNorm(x.n) === k || (x.alias || []).some(a=>malaNorm(a) === k))
      || (typeof DUAS !== 'undefined' && DUAS.find(d=>malaNorm(d.translit) === k || malaNorm(d.title) === k));
    if(hit){
      if(!info.ar) info.ar = hit.ar || hit.arabic || '';
      if(!info.tr) info.tr = hit.translit || hit.tr || hit.n || '';
      if(!info.m) info.m = hit.m || hit.meaning || '';
      if(!info.en) info.en = hit.en || hit.enm || '';
    }
  }
  if(!info.tr) info.tr = n;
  return info;
}
function malaMeaning(info){ return isEn() ? (info.en || info.m) : (info.m || info.en); }

/* ---------- Live sky: the sun, moon and stars move through one cycle (2, 5 or 10 minutes) while the person counts ---------- */
const MALA_LIVE_MIN = [2, 5, 10];
/* Real-time sky: Sunrise = 0, Zuhr = .3 (sun at its highest), Maghrib = .6 (sunset), Isha = .72, next Fajr = .88, next Sunrise = 1 */
function malaRealPhase(){
  try{
    const now = Date.now(), knots = [], at = (sch, k)=>{ const x = sch.find(y=>y.key === k); return x ? x.start.getTime() : 0; };
    for(let i = -1; i <= 1; i++){
      const d = new Date(); d.setDate(d.getDate() + i);
      const nx = new Date(d); nx.setDate(nx.getDate() + 1);
      const a = buildSchedule(d), b = buildSchedule(nx);
      [[at(a, 'tulu'), 0], [at(a, 'zuhr'), .3], [at(a, 'maghrib'), .6], [at(a, 'isha'), .72], [at(b, 'fajr'), .88]].forEach(k=>{ if(k[0]) knots.push([k[0], i + k[1]]); });
    }
    knots.sort((x, y)=>x[0] - y[0]);
    for(let j = 0; j < knots.length - 1; j++){
      const x = knots[j], y = knots[j + 1];
      if(now >= x[0] && now < y[0]){ const p = x[1] + (y[1] - x[1]) * (now - x[0]) / (y[0] - x[0]); return ((p % 1) + 1) % 1; }
    }
  }catch(e){}
  return .3;
}
function malaLivePhase(M){
  if(M.liveReal) return malaRealPhase();
  if(M.livePaused) return M.livePhase || 0;
  if(!M.liveT0){ M.liveT0 = Date.now(); saveState(); }
  const d = (M.liveMin || 5) * 60000;
  return (((Date.now() - M.liveT0) / d) % 1 + 1) % 1;
}
function malaLiveStars(){
  let r = 7, rnd = ()=>{ r = (r * 16807) % 2147483647; return r / 2147483647; };
  const g = [[], [], []];
  for(let i = 0; i < 70; i++){ const px = (rnd() * 96 + 2).toFixed(1), py = (rnd() * 54 + 2).toFixed(1), sp = rnd() < .3 ? 1.5 : rnd() < .6 ? .8 : 0, c = rnd() < .8 ? '#ffffff' : '#ffe9b0'; g[i % 3].push(`${px}vw ${py}vh 0 ${sp}px ${c}`); }
  return g.map(a=>`<i style="box-shadow:${a.join(',')}"></i>`).join('');
}
/* The moon in the sky shows today's phase from the Islamic date (day 1 is a thin crescent, day 14-15 full, day 29-30 almost gone) */
function malaMoonSvg(day){
  const T = 29.53, a = Math.min(Math.max(day, 0), T), k = Math.cos(2 * Math.PI * a / T), rx = (Math.abs(k) * 50).toFixed(1), waxing = a < T / 2;
  const d = `M50 0A50 50 0 0 1 50 100A${rx} 50 0 0 ${k > 0 ? 0 : 1} 50 0Z`;
  return { lit:(1 - k) / 2, svg:`<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="50" fill="#1a2440" opacity=".6"/><path d="${d}" fill="#efe8c4"${waxing ? '' : ' transform="translate(100 0) scale(-1 1)"'}/></svg>` };
}
function malaLiveHtml(M){
  const dur = M.liveReal ? 300 : (M.liveMin || 5) * 60, p = malaLivePhase(M), mn = malaMoonSvg(window.__moonDay || gregorianToHijri(new Date()).day);
  const still = (document.body.classList.contains('calm') || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) ? ' still' : '';
  return `<div class="lsky${M.livePaused || M.liveReal ? ' paused' : ''}${still}" style="--ld:${dur}s;--lo:-${(p * dur).toFixed(2)}s"><div class="ls-l ls-night"></div><div class="ls-l ls-dawn"></div><div class="ls-l ls-day"></div><div class="ls-l ls-dusk"></div><div class="ls-stars">${malaLiveStars()}</div><div class="ls-sun"></div><div class="ls-moon" style="--mi:${(.25 + .75 * mn.lit).toFixed(2)}">${mn.svg}</div><div class="ls-hills"><svg viewBox="0 0 360 240" preserveAspectRatio="none" aria-hidden="true"><path d="M0 70 C50 30 90 52 140 40 S250 18 300 44 S345 40 360 34 V240 H0z" fill="#1c3040"/><path d="M0 110 C60 78 110 98 170 84 S290 70 360 96 V240 H0z" fill="#10202c"/></svg></div></div>`;
}

/* ---------- Scenes (original illustrations, drawn for Waqt24) ---------- */
function malaScene(i){
  if(i >= MALA_ART){
    const c = MALA_PLAIN[i - MALA_ART][1];
    const fill = Array.isArray(c) ? `<defs><linearGradient id="msp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c[0]}"/><stop offset="1" stop-color="${c[1]}"/></linearGradient></defs><rect width="360" height="640" fill="url(#msp)"/>` : `<rect width="360" height="640" fill="${c}"/>`;
    return `<svg viewBox="0 0 360 640" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${fill}</svg>`;
  }
  const star = [[40,60],[110,30],[190,80],[260,40],[320,90],[70,130],[230,140],[150,20],[300,150]].map(p=>`<circle cx="${p[0]}" cy="${p[1]}" r="1.4" fill="#fff" opacity=".8"/>`).join('');
  const S = [
    /* 0 Night */ `<defs><linearGradient id="ms0" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b1220"/><stop offset="1" stop-color="#27394f"/></linearGradient></defs><rect width="360" height="640" fill="url(#ms0)"/>${star}<path d="M0 470 L70 400 L130 450 L210 380 L290 450 L360 410 V640 H0z" fill="#142133"/><path d="M0 520 Q90 490 180 520 T360 510 V640 H0z" fill="#0d1827"/><g stroke="#3b5875" stroke-width="2" opacity=".5"><line x1="40" y1="560" x2="120" y2="560"/><line x1="200" y1="585" x2="300" y2="585"/><line x1="90" y1="610" x2="170" y2="610"/></g>`,
    /* 1 Meadow */ `<defs><linearGradient id="ms1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6f979b"/><stop offset="1" stop-color="#d3e6de"/></linearGradient></defs><rect width="360" height="640" fill="url(#ms1)"/><path d="M-20 470 L70 360 L150 450 L230 340 L330 455 L380 400 V520 H-20z" fill="#9fb4b8"/><path d="M70 360 L50 388 L70 380 L90 392z M230 340 L210 372 L232 364 L252 376z" fill="#f4f8f8"/><path d="M0 480 Q120 450 240 480 T360 470 V640 H0z" fill="#6fa96b"/><path d="M0 540 Q120 520 240 545 T360 535 V640 H0z" fill="#5b9758"/><g fill="#2f6f4a">${[30,70,110,250,290,330].map((x,j)=>`<path d="M${x} ${500+(j%2)*18} l-14 34 h28z M${x} ${482+(j%2)*18} l-11 28 h22z"/>`).join('')}</g><rect x="165" y="505" width="30" height="20" fill="#8b4a2b"/><path d="M160 505 L180 488 L200 505z" fill="#a8452b"/>`,
    /* 2 Dusk */ `<defs><linearGradient id="ms2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#241d4d"/><stop offset=".55" stop-color="#8a4a77"/><stop offset=".78" stop-color="#e0764a"/><stop offset="1" stop-color="#f2b072"/></linearGradient></defs><rect width="360" height="640" fill="url(#ms2)"/>${star}<g fill="#1a1030"><path d="M110 470 Q180 390 250 470z"/><rect x="100" y="470" width="160" height="40"/><rect x="62" y="400" width="10" height="110"/><path d="M62 400 l5 -16 5 16z"/><rect x="288" y="410" width="10" height="100"/><path d="M288 410 l5 -16 5 16z"/><path d="M170 392 l10 -16 10 16z"/></g><rect y="510" width="360" height="130" fill="#2b1d3f" opacity=".85"/><g fill="#1a1030" opacity=".35" transform="translate(0 1020) scale(1 -1)"><path d="M110 470 Q180 390 250 470z"/><rect x="100" y="470" width="160" height="40"/></g>`,
    /* 3 Peak */ `<defs><linearGradient id="ms3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#241b45"/><stop offset=".7" stop-color="#b96590"/><stop offset="1" stop-color="#f0a97f"/></linearGradient></defs><rect width="360" height="640" fill="url(#ms3)"/>${star}<path d="M-20 520 L150 330 L190 330 L380 520z" fill="#4a3566"/><path d="M130 352 L150 330 L190 330 L210 354 L186 346 L170 358 L152 346z" fill="#fbeaf2"/><path d="M0 540 Q180 510 360 540 V640 H0z" fill="#2a2147"/><g fill="#f7b6cf" opacity=".9">${[[40,440],[62,452],[50,470],[300,430],[322,448],[310,468],[80,430],[286,452]].map(p=>`<circle cx="${p[0]}" cy="${p[1]}" r="9"/>`).join('')}</g><g stroke="#3b2a50" stroke-width="3" fill="none"><path d="M-10 500 Q40 470 70 440"/><path d="M370 500 Q320 470 290 430"/></g>`,
    /* 4 Desert */ `<defs><linearGradient id="ms4" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f1b98f"/><stop offset="1" stop-color="#fbe7c8"/></linearGradient></defs><rect width="360" height="640" fill="url(#ms4)"/><circle cx="250" cy="380" r="46" fill="#fff0c7" opacity=".9"/><path d="M-20 470 Q100 420 220 470 T380 450 V640 H-20z" fill="#e2a96d"/><path d="M-20 540 Q120 490 260 545 T380 530 V640 H-20z" fill="#d1925a"/><g stroke="#7a4a27" stroke-width="4" fill="none"><path d="M70 500 Q72 450 66 410"/></g><g fill="#3e7a4a"><path d="M66 410 q-34 -6 -44 14 q26 -10 44 -6z M66 410 q34 -6 44 14 q-26 -10 -44 -6z M66 410 q-14 -26 -38 -22 q26 4 38 22z M66 410 q14 -26 38 -22 q-26 4 -38 22z"/></g>`,
    /* 5 Sea */ `<defs><linearGradient id="ms5" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#06142b"/><stop offset=".55" stop-color="#0b3556"/><stop offset="1" stop-color="#0f5877"/></linearGradient></defs><rect width="360" height="640" fill="url(#ms5)"/>${star}<circle cx="270" cy="110" r="26" fill="#fff6cf"/><circle cx="282" cy="102" r="24" fill="#0a2038" opacity=".25"/><path d="M0 430 H360 V640 H0z" fill="#0d4767" opacity=".8"/><g stroke="#4aa3c7" stroke-width="2" fill="none" opacity=".6"><path d="M0 460 q22 -10 44 0 t44 0 t44 0 t44 0 t44 0 t44 0 t44 0 t44 0"/><path d="M0 500 q22 -10 44 0 t44 0 t44 0 t44 0 t44 0 t44 0 t44 0 t44 0"/><path d="M0 550 q22 -10 44 0 t44 0 t44 0 t44 0 t44 0 t44 0 t44 0 t44 0"/></g><path d="M240 430 l8 -34 l8 34z" fill="#f4e2b8" opacity=".8"/>`,
    /* 6 Sunrise */ `<defs><linearGradient id="ms6" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a6aa5"/><stop offset=".45" stop-color="#e9a9a0"/><stop offset=".72" stop-color="#ffd59a"/><stop offset="1" stop-color="#ffeec9"/></linearGradient><radialGradient id="ms6s"><stop offset="0" stop-color="#fff6d0"/><stop offset="1" stop-color="#fff6d0" stop-opacity="0"/></radialGradient></defs><rect width="360" height="640" fill="url(#ms6)"/><circle cx="180" cy="452" r="150" fill="url(#ms6s)"/><circle cx="180" cy="452" r="48" fill="#fff4c6"/><path d="M-20 470 Q60 430 140 466 T300 458 T400 470 V640 H-20z" fill="#d89a8e"/><path d="M-20 520 Q90 480 190 520 T380 505 V640 H-20z" fill="#8c6f86"/><g fill="#40384f"><path d="M232 505 Q256 462 280 505z"/><rect x="226" y="505" width="60" height="38"/><rect x="292" y="448" width="7" height="95"/><path d="M292 448 L295.5 436 L299 448z"/></g><path d="M-20 570 Q100 540 200 572 T380 560 V640 H-20z" fill="#30293f"/><g fill="none" stroke="#3b3550" stroke-width="1.6" stroke-linecap="round"><path d="M60 150 q8 -8 16 0 q8 -8 16 0"/><path d="M130 110 q6 -6 12 0 q6 -6 12 0"/><path d="M270 170 q7 -7 14 0 q7 -7 14 0"/></g>`,
    /* 7 Sunset */ `<defs><linearGradient id="ms7" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b1b4a"/><stop offset=".4" stop-color="#9a3f6b"/><stop offset=".66" stop-color="#f2693b"/><stop offset="1" stop-color="#ffb35a"/></linearGradient><radialGradient id="ms7s"><stop offset="0" stop-color="#ffd27a"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient></defs><rect width="360" height="640" fill="url(#ms7)"/><circle cx="180" cy="468" r="140" fill="url(#ms7s)" opacity=".7"/><circle cx="180" cy="470" r="52" fill="#ffd98a"/><path d="M-20 484 L60 446 L130 484 L220 438 L300 484 L380 452 V500 H-20z" fill="#4a2650"/><rect y="496" width="360" height="144" fill="#2a1840"/><g stroke="#ffb764" stroke-linecap="round" opacity=".75"><path d="M130 512 H230" stroke-width="3"/><path d="M146 530 H214" stroke-width="3"/><path d="M158 550 H202" stroke-width="2.5"/><path d="M168 570 H192" stroke-width="2"/></g><g fill="#1b0f2b"><path d="M42 496 L58 480 H98 L114 496z"/><rect x="74" y="446" width="2" height="34"/><path d="M76 448 L100 474 H76z"/></g>`,
    /* 8 Cloudy */ `<defs><linearGradient id="ms8" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3d4e63"/><stop offset=".6" stop-color="#8da0b2"/><stop offset="1" stop-color="#c3d0da"/></linearGradient></defs><rect width="360" height="640" fill="url(#ms8)"/><g fill="#e7edf3" opacity=".85"><ellipse cx="90" cy="130" rx="70" ry="22"/><ellipse cx="130" cy="112" rx="46" ry="22"/><ellipse cx="270" cy="210" rx="80" ry="24"/><ellipse cx="236" cy="194" rx="42" ry="20"/></g><g fill="#c2ceda" opacity=".8"><ellipse cx="60" cy="300" rx="64" ry="18"/><ellipse cx="300" cy="340" rx="70" ry="18"/></g><path d="M-20 500 Q80 440 180 490 T380 470 V640 H-20z" fill="#44594f"/><path d="M-20 560 Q120 510 240 560 T380 545 V640 H-20z" fill="#2b3f37"/><g fill="#1c2c27"><path d="M40 560 L58 510 L76 560z"/><path d="M62 570 L84 505 L106 570z"/><path d="M278 556 L296 506 L314 556z"/></g>`,
  ];
  return `<svg viewBox="0 0 360 640" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${S[i % S.length]}</svg>`;
}

/* ---------- The garland geometry ---------- */
const MALA_W = 360, MALA_H = 124;
function malaY(x){ const d = (x - 180) / 205; return 24 + 62 * (1 - d * d); }
function malaStringPath(){ const pts = []; for(let x = -10; x <= 370; x += 10) pts.push((pts.length ? 'L' : 'M') + x + ' ' + malaY(x).toFixed(1)); return pts.join(' '); }

/* ---------- The counter screen ----------
   cfg = { items:[{id,name,ar,tr,m,en,target}], idx, single, title, get(i), inc(i)->newCount, setTarget(i,n), reset(i),
           selfFeedback (the caller already vibrates/beeps), onFinish(), onBack(), backLabel, onPick() } */
function malaMount(cfg){
  const t = state.tasbeeh, M = malaCfg();
  let openF = {}, openG = { look:true }, autoScn = Math.floor(Math.random() * MALA_ART), idx = cfg.idx || 0, anim = null, panel = null, raf = 0, lastCur = null;
  const body = document.getElementById('detailBody');
  const item = ()=> cfg.items[idx];
  const info = ()=> malaInfo(item());
  function counts(){
    const target = Math.max(1, item().target || 1), count = cfg.get(idx) || 0;
    if(cfg.single){ const cur = count === 0 ? 0 : ((count - 1) % target) + 1; return { count, target, cur, round:Math.max(1, Math.ceil(count / target)) }; }
    return { count, target, cur:Math.min(count, target), round:1 };
  }
  const theme = ()=> MALA_THEMES[M.theme] || MALA_THEMES[0];
  /* On Auto the scene is picked at random, and picked again when a target completes, the dua changes or the target changes */
  const sceneIdx = ()=> M.scene != null ? M.scene : autoScn;
  function reroll(){ if(M.scene != null) return; let n; do { n = Math.floor(Math.random() * MALA_ART); } while(n === autoScn && MALA_ART > 1); autoScn = n; }
  const bgHtml = ()=> M.live ? malaLiveHtml(M) : malaScene(sceneIdx());
  let realTimer = 0;
  function keepRealSky(){
    clearInterval(realTimer);
    if(!M.live || !M.liveReal) return;
    realTimer = setInterval(()=>{
      const sky = body.querySelector('.lsky');
      if(!sky || !document.body.contains(sky)){ clearInterval(realTimer); return; }
      sky.style.setProperty('--lo', '-' + (malaRealPhase() * 300).toFixed(2) + 's');
    }, 30000);
  }
  function applyScene(){
    const root = body.querySelector('.mala'); if(!root) return;
    const bg = root.querySelector('.mala-bg'), fx = root.querySelector('.mala-fx');
    if(bg && !M.live){ bg.innerHTML = malaScene(sceneIdx()); bg.classList.remove('swap'); void bg.offsetWidth; bg.classList.add('swap'); }
    if(fx) fx.innerHTML = particles();
    root.dataset.fx = weatherId();
  }

  function arSize(text){
    const n = (text || '').length, base = n <= 24 ? 40 : n <= 50 ? 32 : n <= 90 ? 26 : 22;
    return Math.round(base * (MALA_AR_K[M.arSize] || 1));
  }
  function weatherId(){
    if(!M.fx) return 'none';
    return M.weather && M.weather !== 'auto' ? M.weather : (M.live ? 'none' : (MALA_FX[sceneIdx()] || 'none'));
  }
  function particles(){
    const w = weatherId(); if(w === 'none') return '';
    const k = (MALA_SPEEDS.find(x=>x.id === M.speed) || MALA_SPEEDS[1]).k, n = w === 'wind' ? 16 : w === 'firefly' ? 14 : 24;
    return Array.from({ length:n }).map((_, i)=>{
      const h = malaHash('p' + i), x = (i * 47 + h % 40) % 100, y = (i * 29 + h % 31) % 94, base = w === 'wind' ? 1.6 + (i % 5) * 0.45 : w === 'firefly' ? 5 + (i % 4) * 1.6 : 3.5 + (i % 5) * 0.9;
      return `<i style="left:${x}%;--y:${y}%;animation-delay:${-((i * 0.77) % 6).toFixed(2)}s;animation-duration:${(base * k).toFixed(2)}s"></i>`;
    }).join('');
  }
  function defs(){
    const th = theme(), g = (id, c)=>`<radialGradient id="${id}" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="${malaMix(c, '#ffffff', .55)}"/><stop offset=".5" stop-color="${c}"/><stop offset="1" stop-color="${malaMix(c, '#000000', .35)}"/></radialGradient>`;
    return `<defs>${g('mgOn', th.on)}${g('mgOff', th.off)}${g('mgCur', th.cur)}${g('mgMk', th.mark)}</defs>`;
  }
  function garland(){
    return `<svg class="mala-gar" viewBox="0 0 ${MALA_W} ${MALA_H}" aria-hidden="true">${defs()}<path d="${malaStringPath()}" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="1.6"/><circle id="malaGlow" cx="180" cy="${malaY(180).toFixed(1)}" r="20" fill="none" stroke="${theme().cur}" stroke-width="2" opacity=".0"/><g id="malaBeads">${Array.from({ length:17 }).map(()=>'<circle r="9" cx="-50" cy="0"/>').join('')}</g><g id="malaTassel" opacity="0"><path d="M0 0 v14" stroke="${theme().mark}" stroke-width="2"/><path d="M-5 14 h10 l3 20 h-16z" fill="${theme().mark}"/><path d="M-5 34 l-1 8 M-2 34 v9 M1 34 v9 M4 34 l1 8" stroke="${theme().mark}" stroke-width="1.4"/></g></svg>`;
  }
  function dotsHtml(){
    if(cfg.single || cfg.items.length < 2) return '';
    return `<div class="mala-dots">${cfg.items.map((it, i)=>{ const done = (cfg.get(i) || 0) >= (it.target || 1); return `<button type="button" class="${i === idx ? 'cur' : ''}${done ? ' done' : ''}" data-i="${i}" aria-label="${i + 1}"></button>`; }).join('')}</div>`;
  }
  function textHtml(){
    const inf = info();
    if(!inf.ar && !inf.tr && !item().name){
      return `<div class="mala-empty">${L({ rur:'Koi dua ya zikr chunein, phir padhte hue ginti karein.', en:'Choose a dua or zikr, then count as you read.' })}<button type="button" class="mala-big" id="malaPick2">📖 ${L({ rur:'Dua / Zikr chunein', en:'Choose dua / zikr' })}</button></div>`;
    }
    const mean = malaMeaning(inf);
    return `${inf.ar ? `<div class="mala-ar" dir="rtl" style="font-size:${arSize(inf.ar)}px">${malaEsc(inf.ar)}</div>` : ''}
      ${(inf.ar && (M.showTr || M.showM)) ? '<div class="mala-div"><i></i><b></b><i></i></div>' : ''}
      ${M.showTr && inf.tr ? `<div class="mala-tr" style="font-size:${Math.round(16 * (MALA_AR_K[M.arSize] || 1))}px">${malaEsc(inf.tr)}</div>` : ''}
      ${M.showM && mean ? `<div class="mala-m" style="font-size:${Math.round(13 * (MALA_AR_K[M.arSize] || 1))}px">${malaEsc(mean)}</div>` : ''}`;
  }
  function todayPill(){
    if(!cfg.single || cfg.onBack) return '';
    const pf = malaTodayProfile(); if(!pf) return '';
    const pr = zikrProfileProgress(new Date(), pf), nm = pf.name.replace(/\s*\(.*\)\s*$/, '');
    return `<button type="button" class="mala-btn mala-today${pr.total && pr.done >= pr.total ? ' ok' : ''}" id="malaToday" title="${malaEsc(nm)}">📋 <span>${L({ rur:'Aaj ka zikr', en:'Today\'s zikr' })}</span> <b>${pr.done}/${pr.total}</b></button>`;
  }
  function html(){
    const th = theme(), c = counts(), fx = weatherId();
    const chip = cfg.single ? (t.seq != null ? `${L({ rur:'Tasbeeh-e-Fatima', en:'Tasbeeh of Fatima' })} · ${t.seq + 1}/3` : '') : `${L({ rur:'Dua', en:'Dua' })} ${idx + 1} / ${cfg.items.length}`;
    return `<div class="mala ${M.tapAny ? 'tap-any' : ''}" data-fx="${fx}" data-live="${M.live ? 1 : 0}" data-lt="${M.light == null ? 1 : M.light}" style="--mo:${th.on};--mf:${th.off};--mc:${th.cur};--mk:${th.mark}">
      <div class="mala-bg">${bgHtml()}</div>
      <div class="mala-fx">${particles()}</div>
      <div class="mala-top">
        ${cfg.onBack ? `<button type="button" class="mala-btn" id="malaBack" aria-label="${malaEsc(cfg.backLabel || 'Wapas')}" title="${malaEsc(cfg.backLabel || 'Wapas')}">‹</button>` : ''}
        ${chip ? `<span class="mala-chip">${chip}</span>` : ''}${todayPill()}<i class="mala-sp"></i>
        ${M.live && !M.liveReal ? `<button type="button" class="mala-btn mala-live" id="malaLive" aria-label="${L({ rur:'Aasman rokein / chalayein', en:'Pause or play the sky' })}" title="${L({ rur:'Aasman rokein / chalayein', en:'Pause or play the sky' })}">${M.livePaused ? '▶' : '⏸'}</button>` : ''}
        <button type="button" class="mala-btn" id="malaFm" aria-label="Font smaller">A−</button>
        <button type="button" class="mala-btn" id="malaFp" aria-label="Font bigger">A+</button>
        <button type="button" class="mala-btn" id="malaPick" aria-label="Dua chunein">📖</button>
        <button type="button" class="mala-btn" id="malaSet" aria-label="Settings">⚙</button>
      </div>
      <div class="mala-text" id="malaText"><div class="mala-text-in">${textHtml()}</div></div>
      <div class="mala-mid">${garland()}</div>
      <div class="mala-count" id="malaCount"><div class="mala-crow"><button type="button" class="mala-side" id="malaUndo" aria-label="${L({ rur:'Undo', en:'Undo' })}">↶<small>${L({ rur:'Undo', en:'Undo' })}</small></button><div class="mala-disc" id="malaDisc">
        <svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,.16)" stroke-width="7"/><circle id="malaArc" cx="60" cy="60" r="54" fill="none" stroke="${th.on}" stroke-width="7" stroke-linecap="round" stroke-dasharray="339.3" stroke-dashoffset="339.3" transform="rotate(-90 60 60)"/></svg>
        <div class="mala-num"><b id="malaN">${c.cur}</b><span id="malaT">/ ${c.target}</span></div></div><button type="button" class="mala-side" id="malaHist" aria-label="${L({ rur:'Aaj ka hisaab', en:'Today' })}">📊<small id="malaTodayN">${L({ rur:'Aaj', en:'Today' })} ${malaToday()}</small></button></div>
        <div class="mala-cap" id="malaCap"></div></div>
      ${dotsHtml()}
      <div class="mala-bar">
        <button type="button" class="mala-btn" id="malaPrev" ${cfg.single ? 'style="visibility:hidden"' : ''} aria-label="Pichli dua">‹</button>
        <button type="button" class="mala-btn" id="malaReset">↺ ${L({ rur:'Reset', en:'Reset' })}</button>
        ${(item().name || item().ar) ? `<button type="button" class="mala-btn mala-rm" id="malaRm" aria-label="${L({ rur:'Dua hatayein', en:'Remove dua' })}" title="${L({ rur:'Dua hatayein', en:'Remove dua' })}">🗑</button>` : ''}
        <button type="button" class="mala-btn" id="malaTg">🎯 ${L({ rur:'Target', en:'Target' })} <b id="malaTgN">${c.target}</b></button>
        <button type="button" class="mala-btn" id="malaNext" ${cfg.single ? 'style="visibility:hidden"' : ''} aria-label="Agli dua">›</button>
      </div>
      <div class="mala-sheet" id="malaSheet" hidden></div>
    </div>`;
  }

  /* ----- draw the beads for a centre position ----- */
  function place(c){
    /* the bead that counts as "current" is the one at the centre of the strand right now (c moves while the strand slides),
       so the highlight never jumps ahead of the bead and the glow stays fixed above the number */
    const th = theme(), cnt = counts(), n = cnt.target, cur = Math.min(n, Math.max(0, Math.round(c)));
    const circles = body.querySelectorAll('#malaBeads circle');
    const stat = false;   /* one layout for every target: the current bead sits above the number, counted beads slide off to the left */
    let tassel = null;
    circles.forEach((el, j)=>{
      let k, u;
      if(stat){ k = j + 1; u = k - (n + 1) / 2; if(k > n){ el.setAttribute('opacity', 0); return; } }
      else { k = Math.floor(c) - 8 + j; u = k - c; }
      if(k < 1 || k > n){ el.setAttribute('opacity', 0); return; }
      const sp = n <= 11 ? 36 : 24, x = 180 + u * sp, au = Math.abs(u), lim = Math.min(7.6, 196 / sp);
      const ev = M.markEvery === 0 ? 0 : (M.markEvery || 11), marker = !stat && ev > 0 && k % ev === 0 && k < n, last = k === n;
      const isCur = k === cur, isOn = k <= cur;
      let r = (stat ? 14 : 8 + 5 * Math.max(0, 1 - au / 6)) * (marker ? 1.22 : 1) * (1 + .15 * Math.max(0, 1 - au));
      el.setAttribute('cx', x.toFixed(1)); el.setAttribute('cy', malaY(x).toFixed(1)); el.setAttribute('r', r.toFixed(1));
      el.setAttribute('fill', isCur ? 'url(#mgCur)' : marker ? 'url(#mgMk)' : isOn ? 'url(#mgOn)' : 'url(#mgOff)');
      el.setAttribute('opacity', Math.max(0, Math.min(1, (lim - au) / 1.4)).toFixed(2) * (isOn || isCur ? 1 : .88));
      el.setAttribute('stroke', isCur ? th.cur : isOn && marker ? '#fff' : 'none'); el.setAttribute('stroke-width', isCur ? 2.5 : 1.5);
      /* the ring fades out on the bead that is leaving the centre and fades in on the one arriving, so it never jumps */
      el.setAttribute('stroke-opacity', isCur ? Math.max(0, 1 - au * 2).toFixed(2) : 1);
      if(last) tassel = { x, y:malaY(x) + r - 1, o:Math.max(0, Math.min(1, (lim - au) / 1.4)) };
    });
    { const g = body.querySelector('#malaGlow'); if(g){ g.setAttribute('cx', '180'); g.setAttribute('cy', malaY(180).toFixed(1)); g.setAttribute('r', (13 * 1.15 + 6).toFixed(1)); g.setAttribute('opacity', cur >= 1 ? .85 : 0); } }
    const ts = body.querySelector('#malaTassel');
    if(ts){ if(tassel){ ts.setAttribute('transform', `translate(${tassel.x.toFixed(1)} ${tassel.y.toFixed(1)})`); ts.setAttribute('opacity', tassel.o.toFixed(2)); } else ts.setAttribute('opacity', 0); }
  }
  function centreFor(cur, n){ return cur; }
  let pos = 0;
  function frame(now){
    if(!anim){ raf = 0; return; }
    const p = Math.min(1, (now - anim.t0) / anim.d), e = 1 + 2.2 * Math.pow(p - 1, 3) + 1.2 * Math.pow(p - 1, 2);
    pos = anim.from + (anim.to - anim.from) * e; place(pos);
    if(p < 1) raf = requestAnimationFrame(frame); else { anim = null; pos = anim ? pos : counts().cur; place(pos); raf = 0; }
  }
  function slideTo(to, from){ anim = { from:from != null ? from : pos, to, t0:performance.now(), d:300 }; if(!raf) raf = requestAnimationFrame(frame); }

  function updateCount(){
    const c = counts(), num = body.querySelector('#malaN'), tt = body.querySelector('#malaT'), arc = body.querySelector('#malaArc'), cap = body.querySelector('#malaCap'), disc = body.querySelector('#malaDisc');
    if(num){ num.textContent = c.cur; num.classList.remove('bump'); void num.offsetWidth; num.classList.add('bump'); }
    if(tt) tt.textContent = '/ ' + c.target;
    const tdn = body.querySelector('#malaTodayN'); if(tdn) tdn.textContent = L({ rur:'Aaj', en:'Today' }) + ' ' + malaToday();
    const pill = body.querySelector('#malaToday b'), tpf = pill ? malaTodayProfile() : null;
    if(pill && tpf){ const pr = zikrProfileProgress(new Date(), tpf); pill.textContent = pr.done + '/' + pr.total; body.querySelector('#malaToday').classList.toggle('ok', pr.total > 0 && pr.done >= pr.total); }
    const ub = body.querySelector('#malaUndo'); if(ub) ub.classList.toggle('off', c.count <= 0);
    if(arc) arc.setAttribute('stroke-dashoffset', (339.3 * (1 - c.cur / c.target)).toFixed(1));
    if(disc) disc.classList.toggle('done', c.cur === c.target && c.count > 0);
    const tn = body.querySelector('#malaTgN'); if(tn) tn.textContent = c.target;
    if(cap){
      const left = Math.max(0, c.target - c.cur);
      cap.textContent = cfg.single
        ? (c.target > 1 ? L({ rur:`Daur ${c.round} · baaqi ${left}`, en:`Round ${c.round} · ${left} left` }) + (c.round > 1 ? ' · ' + L({ rur:`kul ${c.count}`, en:`total ${c.count}` }) : '') : '')
        : (left ? L({ rur:`Baaqi ${left}`, en:`${left} left` }) : '✓ ' + L({ rur:'Mukammal', en:'Done' }));
    }
    body.querySelectorAll('.mala-dots button').forEach((b, i)=>{ b.classList.toggle('done', (cfg.get(i) || 0) >= (cfg.items[i].target || 1)); });
  }

  function undo(){
    const before = counts();
    if(before.count <= 0){ showToast(L({ rur:'Undo karne ke liye abhi kuch nahi', en:'Nothing to undo' })); return; }
    if(cfg.single && t.seq != null){ showToast(L({ rur:'Tasbeeh-e-Fatima mein undo nahi hota', en:'No undo during the Fatima sequence' })); return; }
    if(!cfg.dec || !cfg.dec(idx)) return;
    const lg = tasbeehLog(), dk = dayKey(new Date()); lg[dk] = Math.max(0, (lg[dk] || 0) - 1);
    malaLogDua(item().name, -1); if(cfg.single) malaCreditProfile(item().name, -1); saveState();
    if(t.vibrate !== false && navigator.vibrate) navigator.vibrate(10);
    const c = counts();
    if(Math.abs(c.cur - pos) > 1.5){ pos = c.cur; place(pos); } else slideTo(c.cur, pos);
    updateCount();
  }
  let histTab = 'today';
  function statsHtml(n){
    const tl = tasbeehLog(), lg = malaDuaLog(), days = [];
    for(let i = n - 1; i >= 0; i--){ const d = new Date(); d.setDate(d.getDate() - i); days.push({ d, k:dayKey(d), v:tl[dayKey(d)] || 0 }); }
    const sum = days.reduce((a, x)=>a + x.v, 0), act = days.filter(x=>x.v > 0).length, mx = Math.max(1, ...days.map(x=>x.v));
    const best = days.reduce((a, x)=>x.v > a.v ? x : a, days[0]);
    const ps = state.tasbeeh.profiles.filter(p=>p.items.length);
    const full = days.filter(x=>ps.some(p=>isZikrProfileComplete(x.d, p))).length;
    const top = {}; days.forEach(x=>Object.entries(lg[x.k] || {}).forEach(([nm, v])=>{ top[nm] = (top[nm] || 0) + v; }));
    const tops = malaMergeNames(top).slice(0, 6), tmax = tops.length ? tops[0][1] : 1;
    const st = malaProfileStreak();
    const bars = days.map(x=>`<i class="${x.k === dayKey(new Date()) ? 'now' : ''}" title="${x.d.toLocaleDateString('en-GB', { day:'numeric', month:'short' })}: ${x.v}"><u style="height:${Math.max(x.v ? 6 : 2, Math.round(x.v / mx * 100))}%"></u><em>${n <= 7 ? x.d.toLocaleDateString('en-GB', { weekday:'narrow' }) : (x.d.getDate() % 5 === 0 ? x.d.getDate() : '')}</em></i>`).join('');
    const cell = (v, l)=>`<div class="mh-cell"><b>${v}</b><span>${l}</span></div>`;
    return `<div class="mh-bars ${n > 7 ? 'm' : ''}">${bars}</div>
      <div class="mh-cells">${cell(sum, L({ rur:'kul ginti', en:'total' }))}${cell(act + '/' + n, L({ rur:'din ginti ki', en:'active days' }))}${cell(best && best.v ? best.v : 0, L({ rur:'sab se zyada (ek din)', en:'best day' }))}${cell(full, L({ rur:'din set mukammal', en:'days set done' }))}</div>
      <div class="mh-streak">🔥 ${L({ rur:'Lagatar din', en:'Streak' })}: <b>${st.cur}</b> · ${L({ rur:'sab se lamba', en:'best' })}: <b>${st.best}</b></div>
      ${tops.length ? `<div class="ms-lbl">${L({ rur:'Sab se zyada padhi gayi', en:'Most read' })}</div>${tops.map(([nm, v])=>`<div class="mh-row mh-top"><span>${malaEsc(nm)}</span><i style="--w:${Math.round(v / tmax * 100)}%"></i><b>${v}</b></div>`).join('')}` : `<div class="ms-hint">${L({ rur:'Dua ka tafseel abhi nahi hai. Ginti shuru karein.', en:'No per-dua detail yet. Start counting.' })}</div>`}`;
  }
  function historyHtml(){
    const tabs = `<div class="ms-chips mh-tabs">${[['today', { rur:'Aaj', en:'Today' }], ['week', { rur:'Hafta', en:'Week' }], ['month', { rur:'Mahina', en:'Month' }]].map(x=>`<button type="button" class="ms-chip${histTab === x[0] ? ' on' : ''}" data-ht="${x[0]}">${L(x[1])}</button>`).join('')}</div>`;
    if(histTab !== 'today') return `<div class="ms-head"><b>📊 ${L({ rur:'Hisaab', en:'Stats' })}</b><button type="button" class="mala-btn" data-close>✕</button></div>${tabs}${statsHtml(histTab === 'week' ? 7 : 30)}`;
    const dk = dayKey(new Date()), lg = malaDuaLog(), tl = tasbeehLog();
    const named = Object.values(lg[dk] || {}).reduce((a, v)=>a + v, 0), rest = Math.max(0, (tl[dk] || 0) - named);
    const rows = o=>malaMergeNames(o).map(([n, v])=>`<div class="mh-row"><span>${malaEsc(n)}</span><b>${v}</b></div>`).join('');
    const pf = malaTodayProfile(), day = pf ? getZikrDay(new Date(), pf.id, false) : {};
    const prof = pf && pf.items.length ? `<div class="ms-lbl">📋 ${malaEsc(pf.name)}</div>${pf.items.map(it=>{ const n = day[it.id] || 0, ok = n >= (it.target || 1); return `<div class="mh-row${ok ? ' ok' : ''}"><span>${ok ? '✅' : '○'} ${malaEsc(malaPlainName(it.name))}</span><b>${Math.min(n, 9999)} / ${it.target}</b></div>`; }).join('')}` : '';
    const prev = [];
    for(let i = 1; i <= 6; i++){
      const d = new Date(); d.setDate(d.getDate() - i); const k = dayKey(d), tot = tl[k] || 0; if(!tot) continue;
      prev.push(`<details class="mh-day"><summary><span>${d.toLocaleDateString('en-GB', { weekday:'short', day:'numeric', month:'short' })}</span><b>${tot}</b></summary>${rows(lg[k]) || `<div class="ms-hint">${L({ rur:'Dua ka tafseel is din se pehle ka hai, sirf kul ginti mehfooz hai.', en:'Only the total was saved for this day.' })}</div>`}</details>`);
    }
    return `<div class="ms-head"><b>📊 ${L({ rur:'Aaj ka hisaab', en:'Today' })}</b><button type="button" class="mala-btn" data-close>✕</button></div>${tabs}
      <div class="mh-total"><b>${tl[dk] || 0}</b><span>${L({ rur:'kul ginti aaj', en:'counted today' })}</span></div>
      ${rows(lg[dk]) || (rest ? '' : `<div class="ms-hint">${L({ rur:'Aaj abhi tak kuch nahi ginti hui.', en:'Nothing counted yet today.' })}</div>`)}
      ${rest ? `<div class="mh-row"><span>${L({ rur:'Dusri ginti (dua ke naam ke bina)', en:'Other counts (no dua name saved)' })}</span><b>${rest}</b></div>` : ''}
      ${prof}
      ${prev.length ? `<div class="ms-lbl">${L({ rur:'Pichle din', en:'Earlier days' })}</div>${prev.join('')}` : ''}`;
  }
  function runToday(){
      const pf = malaTodayProfile(); if(!pf) return;
      if(!pf.items.length){ showToast(L({ rur:'Is profile mein abhi zikr nahi. Pehle add karein.', en:'This profile has no zikr yet. Add some first.' })); return renderZikrProfile(pf.id); }
      const day = getZikrDay(new Date(), pf.id, false), first = pf.items.find(it=>(day[it.id] || 0) < (it.target || 1));
      if(!first) showToast(L({ rur:'Aaj ka zikr pehle hi mukammal hai ✅', en:'Today\'s zikr is already complete ✅' }));
      malaRunSet(pf.id, (first || pf.items[0]).id);
  }
  function go(i){
    if(i < 0 || i >= cfg.items.length) return;
    idx = i; reroll(); if(cfg.onIdx) cfg.onIdx(cfg.items[i]); draw(true);
  }
  /* The whole set is done: a small card with today's total and the day streak, then back to the list */
  function showDone(){
    const root = body.querySelector('.mala'); if(!root || root.querySelector('.mala-done')) { if(cfg.onFinish) cfg.onFinish(); return; }
    const st = malaProfileStreak(), tot = tasbeehLog()[dayKey(new Date())] || 0;
    const line = st.cur > 1 ? L({ rur:`🔥 ${st.cur} din lagatar`, en:`🔥 ${st.cur} days in a row` }) : L({ rur:'🌱 Aaj se shuruaat, kal bhi aaiye', en:'🌱 A good start, come back tomorrow' });
    const el = document.createElement('div'); el.className = 'mala-done';
    el.innerHTML = `<div class="md-card"><div class="md-ic">🎉</div><b>${L({ rur:'Mashallah!', en:'Mashallah!' })}</b><span>${malaEsc(cfg.title || '')} ${L({ rur:'mukammal', en:'complete' })}</span><div class="md-st">${line}</div><div class="md-sub">${L({ rur:'Aaj kul ginti', en:'Counted today' })}: <b>${tot}</b>${st.best > 1 ? ' · ' + L({ rur:'sab se lamba', en:'best' }) + ': ' + st.best : ''}</div><button type="button" class="md-ok">${L({ rur:'Alhamdulillah', en:'Alhamdulillah' })}</button></div>`;
    root.appendChild(el);
    el.querySelector('.md-ok').onclick = ()=>{ el.remove(); if(cfg.onFinish) cfg.onFinish(); };
  }
  function finishItem(){
    if(cfg.single) return;
    const next = cfg.items.findIndex((it, i)=>i > idx && (cfg.get(i) || 0) < (it.target || 1));
    const any = next >= 0 ? next : cfg.items.findIndex((it, i)=>(cfg.get(i) || 0) < (it.target || 1));
    setTimeout(()=>{
      if(any >= 0 && any !== idx) go(any);
      else if(any < 0){ showDone(); }
    }, 800);
  }
  function tick(){
    const before = counts();
    if(M.stopAtTarget && before.count > 0 && before.cur >= before.target){
      showToast(L({ rur:'Target poora ho gaya. Reset karein ya naya target chunein.', en:'Target reached. Reset or pick a new target.' }));
      if(t.vibrate !== false && navigator.vibrate) navigator.vibrate(20);
      return;
    }
    const wasDone = !cfg.single && before.count >= before.target;
    const nc = cfg.inc(idx);
    malaLogDua(item().name, 1);
    if(cfg.single) malaCreditProfile(item().name, 1);
    const c = counts();
    if(!cfg.selfFeedback){
      if(t.vibrate !== false && navigator.vibrate) navigator.vibrate(c.cur === c.target ? [60, 50, 60, 50, 140] : 12);
      if(typeof tasbeehBeep === 'function') tasbeehBeep(c.cur === c.target ? 'done' : (c.target > 11 && M.markEvery !== 0 && c.cur % (M.markEvery || 11) === 0 ? 'mark' : ''));
    }
    /* a new round starts from the first bead again */
    if(cfg.single && c.cur === 1 && before.cur === before.target){ pos = 0; place(0); }
    slideTo(c.target <= 11 ? c.cur : c.cur, pos);
    updateCount();
    const g = body.querySelector('#malaGlow'); if(g){ g.classList.remove('pulse'); void g.getBoundingClientRect(); g.classList.add('pulse'); }
    if(!cfg.single && !wasDone && c.count === c.target) finishItem();
    else if(cfg.single && c.cur === c.target && M.scene == null && !M.live){ setTimeout(()=>{ reroll(); applyScene(); }, 900); }
  }

  /* ----- settings and target panels ----- */
  function sw(id, on, label){ return `<div class="ms-row"><span>${label}</span><button type="button" class="ms-sw${on ? ' on' : ''}" data-sw="${id}" role="switch" aria-checked="${on}"><i></i></button></div>`; }
  function sheetHtml(){
    if(panel === 'history') return historyHtml();
    if(panel === 'target'){
      const c = counts();
      return `<div class="ms-head"><b>${L({ rur:'Target', en:'Target' })}</b><button type="button" class="mala-btn" data-close>✕</button></div>
        <div class="ms-chips">${MALA_TARGETS.map(n=>`<button type="button" class="ms-chip${c.target === n ? ' on' : ''}" data-tg="${n}">${n}</button>`).join('')}<button type="button" class="ms-chip" data-tg="custom">✎ ${L({ rur:'Apna', en:'Custom' })}</button></div>`;
    }
    const F = id=> openF[id] ? ' open' : '';
    const look = `      <div class="ms-lbl">${L({ rur:'Moti ka rang', en:'Bead colours' })}</div>
      <div class="ms-fold${F('th')}" data-f="th"><div class="ms-chips">${MALA_THEMES.map((x, i)=>`<button type="button" class="ms-theme${M.theme === i ? ' on' : ''}" data-theme="${i}" aria-label="${L(x.n)}"><span style="background:${x.on}"></span><span style="background:${x.cur}"></span><span style="background:${x.off}"></span><em>${L(x.n)}</em></button>`).join('')}</div><button type="button" class="ms-more" aria-label="More">▾</button></div>
      <div class="ms-hint"><span style="--c:var(--mo)"></span>${L({ rur:'ginti hue', en:'counted' })} <span style="--c:var(--mc)"></span>${L({ rur:'abhi wala', en:'current' })} <span style="--c:var(--mf)"></span>${L({ rur:'baaki', en:'to come' })}</div>
      <div class="ms-lbl">${L({ rur:'Roshni', en:'Brightness' })}</div>
      <div class="ms-chips">${[[0, { rur:'🌙 Gehra', en:'🌙 Dark' }], [1, { rur:'🌤 Darmiyana', en:'🌤 Medium' }], [2, { rur:'☀ Roshan', en:'☀ Light' }]].map(x=>`<button type="button" class="ms-chip${(M.light == null ? 1 : M.light) === x[0] ? ' on' : ''}" data-lt="${x[0]}">${L(x[1])}</button>`).join('')}</div>
      <div class="ms-lbl">${L({ rur:'Live aasman (subah se raat tak)', en:'Live sky (dawn to night)' })}</div>
      <div class="ms-chips">${[[0, { rur:'Band', en:'Off' }], ['real', { rur:'Waqti', en:'Real time' }], ...MALA_LIVE_MIN.map(m=>[m, { rur:m + ' min', en:m + ' min' }])].map(x=>`<button type="button" class="ms-chip${(!M.live ? 0 : M.liveReal ? 'real' : M.liveMin || 5) === x[0] ? ' on' : ''}" data-live="${x[0]}">${L(x[1])}</button>`).join('')}</div>
      <div class="ms-hint">${L({ rur:'Poora din-raat itne waqt mein (counter ke ⏸ se rukta hai). "Waqti" mein aasman aapke shehar ke Fajr, Zuhr, Maghrib aur Isha ke hisaab se chalta hai.', en:'One full day-and-night in this time (pause with the ⏸). "Real time" follows the Fajr, Zuhr, Maghrib and Isha of your city.' })}</div>
      <div class="ms-lbl">${L({ rur:'Manzar', en:'Scene' })}</div>
      <div class="ms-fold${F('sc')}" data-f="sc"><div class="ms-chips"><button type="button" class="ms-chip${!M.live && M.scene == null ? ' on' : ''}" data-scene="auto">${L({ rur:'Auto', en:'Auto' })}</button>${MALA_SCENE_NAMES.slice(0, MALA_ART).map((x, i)=>`<button type="button" class="ms-chip${!M.live && M.scene === i ? ' on' : ''}" data-scene="${i}">${L(x)}</button>`).join('')}</div><button type="button" class="ms-more" aria-label="More">▾</button></div>
      <div class="ms-lbl">${L({ rur:'Saaf rang aur gradient', en:'Clean colours and gradients' })}</div>
      <div class="ms-fold${F('pl')}" data-f="pl"><div class="ms-chips">${MALA_PLAIN.map((x, j)=>{ const i = MALA_ART + j, c = x[1], bg = Array.isArray(c) ? `linear-gradient(135deg,${c[0]},${c[1]})` : c; return `<button type="button" class="ms-chip ms-bg${!M.live && M.scene === i ? ' on' : ''}" data-scene="${i}"><span style="background:${bg}"></span>${L(x[0])}</button>`; }).join('')}</div><button type="button" class="ms-more" aria-label="More">▾</button></div>
      <div class="ms-lbl">${L({ rur:'Mausam', en:'Weather' })}</div>
      <div class="ms-fold${F('wx')}" data-f="wx"><div class="ms-chips">${MALA_WEATHER.map(x=>`<button type="button" class="ms-chip${(M.fx ? (M.weather || 'auto') : 'none') === x.id ? ' on' : ''}" data-wx="${x.id}">${L(x.n)}</button>`).join('')}</div><button type="button" class="ms-more" aria-label="More">▾</button></div>
      <div class="ms-lbl">${L({ rur:'Mausam ki raftaar', en:'Weather speed' })}</div>
      <div class="ms-chips">${MALA_SPEEDS.map(x=>`<button type="button" class="ms-chip${(M.speed || 'mid') === x.id ? ' on' : ''}" data-spd="${x.id}">${L(x.n)}</button>`).join('')}</div>
`, text = `      <div class="ms-lbl">${L({ rur:'Arabic ka size', en:'Arabic size' })}</div>
      <div class="ms-chips">${MALA_AR_SIZES.map((s, i)=>`<button type="button" class="ms-chip${M.arSize === s ? ' on' : ''}" data-ars="${s}">${['A−−', 'A−', 'A', 'A+', 'A++', 'A+++'][i]}</button>`).join('')}</div>
`, marker = `      <div class="ms-lbl">${L({ rur:'Khaas moti (alag rang)', en:'Marker bead' })}</div>
      <div class="ms-chips">${[[11, { rur:'Har 11vi', en:'Every 11th' }], [10, { rur:'Har 10vi', en:'Every 10th' }], [0, { rur:'Band', en:'Off' }]].map(x=>`<button type="button" class="ms-chip${(M.markEvery == null ? 11 : M.markEvery) === x[0] ? ' on' : ''}" data-mk="${x[0]}">${L(x[1])}</button>`).join('')}</div>
      <div class="ms-hint">${L({ rur:'Asli tasbeeh ki tarah har 11vi moti par nishaan, taake 33 mein 11-11 ka hisaab dikhe.', en:'Like a real tasbih, a marker bead every 11 so you can see 11-11-11 inside 33.' })}</div>
`, swtr = `      ${sw('showTr', M.showTr, L({ rur:'Talaffuz dikhayein', en:'Show pronunciation' }))}
      ${sw('showM', M.showM, L({ rur:'Tarjuma dikhayein', en:'Show meaning' }))}
`;
    const grp = (id, title, inner)=>`<details class="ms-grp" data-g="${id}"${openG[id] ? ' open' : ''}><summary>${title}</summary><div class="ms-grp-in">${inner}</div></details>`;
    const ps = (ensureZikrProfiles(), t.profiles), tpId = t.todayProfile && ps.some(x=>x.id === t.todayProfile) ? t.todayProfile : 'auto';
    const zikrTop = `<div class="ms-hint" style="margin:0 0 8px">${L({ rur:'Upar "📋 Aaj ka zikr" button isi profile ko kholta hai. Ek ek zikr poora hone par agla khud aa jata hai.', en:'The "📋" button at the top opens this profile. Each zikr moves on to the next when it is done.' })}</div>
      <div class="ms-chips"><button type="button" class="ms-chip${tpId === 'auto' ? ' on' : ''}" data-tp="auto">${L({ rur:'Auto (subah / shaam)', en:'Auto (morning / evening)' })}</button>${ps.map(x=>`<button type="button" class="ms-chip${tpId === x.id ? ' on' : ''}" data-tp="${x.id}">${malaEsc(x.name.replace(/\s*\(.*\)\s*$/, ''))}</button>`).join('')}</div>
      ${t.lastRun || !cfg.single ? `<button type="button" class="ms-link" id="malaPlain">📿 ${L({ rur:'Seedha counter (profile ke bina)', en:'Plain counter (no profile)' })}</button>` : ''}
      <button type="button" class="ms-link" id="malaTpEdit">✎ ${L({ rur:'Is profile ke zikr edit karein', en:'Edit this profile\'s zikr' })}</button>
      <button type="button" class="ms-link" id="malaTpNew">＋ ${L({ rur:'Naya profile banayein', en:'Create a new profile' })}</button>`;
    const countBox = `${sw('tapAny', M.tapAny, L({ rur:'Screen par kahin bhi tap karein', en:'Tap anywhere to count' }))}
      <div class="ms-hint">${L({ rur:'Band karne par sirf tasbih ke moti aur disc par tap se ginti hogi.', en:'When off, only taps on the beads and disc count.' })}</div>
      ${sw('stopAtTarget', M.stopAtTarget, L({ rur:'Target par ruk jayein', en:'Stop at the target' }))}
      <div class="ms-hint">${L({ rur:'Band ho to ginti target ke baad bhi naye round mein chalti rehti hai.', en:'When off, counting continues into a new round after the target.' })}</div>
      ${sw('keepAwake', M.keepAwake, L({ rur:'Counter khula ho to screen on rakhein', en:'Keep the screen on' }))}
      ${marker}`;
    const zikrBox = zikrTop;
    const soundBox = `${sw('sound', !!t.sound, L({ rur:'Awaaz', en:'Sound' }))}
      <div id="malaSnd">${tsPickerHtml()}</div>
      ${sw('vibrate', t.vibrate !== false, L({ rur:'Vibration', en:'Vibration' }))}`;
    return `<div class="ms-head"><b>${L({ rur:'Settings', en:'Settings' })}</b><button type="button" class="mala-btn" data-close>✕</button></div>
      ${grp('zikr', '📋 ' + L({ rur:'Aaj ka zikr profile', en:'Today\'s zikr profile' }), zikrBox)}
      ${grp('look', '🎨 ' + L({ rur:'Rang, manzar aur mausam', en:'Colours, scene and weather' }), look)}
      ${grp('text', 'Aa ' + L({ rur:'Likhai', en:'Text' }), text + swtr)}
      ${grp('count', '🎯 ' + L({ rur:'Ginti ka tareeqa', en:'Counting' }), countBox)}
      ${grp('sound', '🔊 ' + L({ rur:'Awaaz aur vibration', en:'Sound and vibration' }), soundBox)}
      ${(item().name || item().ar) ? `<button type="button" class="ms-link ms-danger" id="malaRemove">🗑 ${cfg.single ? L({ rur:'Yeh dua hata dein', en:'Remove this dua' }) : L({ rur:'Yeh dua set se hata dein', en:'Remove this dua from the set' })}</button>` : ''}
      <button type="button" class="ms-link" id="malaClassic">⚙ ${L({ rur:'Purana counter, profiles aur history', en:'Classic counter, profiles and history' })}</button>`;
  }
  function removeDua(){
    panel = null;
    if(cfg.single){
      t.label = ''; t.labelAr = ''; t.labelTr = ''; t.labelM = ''; t.labelEn = ''; t.seq = null; saveState();
      cfg.items[0] = malaSingleItem();
    } else {
      cfg.items.splice(idx, 1); saveState();
      if(!cfg.items.length){ showToast(L({ rur:'Dua hata di', en:'Dua removed' })); return cfg.onFinish ? cfg.onFinish() : renderTasbeeh(); }
      idx = Math.min(idx, cfg.items.length - 1);
    }
    showToast(L({ rur:'Dua hata di', en:'Dua removed' })); draw(false, true);
  }
  function renderSheet(){
    const sh = body.querySelector('#malaSheet'); if(!sh) return;
    if(!panel){ sh.hidden = true; sh.innerHTML = ''; return; }
    sh.hidden = false; sh.innerHTML = sheetHtml();
    sh.querySelectorAll('[data-ht]').forEach(b=>{ b.onclick = ev=>{ ev.stopPropagation(); histTab = b.dataset.ht; renderSheet(); }; });
    sh.querySelectorAll('[data-close]').forEach(b=>{ b.onclick = ()=>{ panel = null; renderSheet(); }; });
    sh.querySelectorAll('[data-theme]').forEach(b=>{ b.onclick = ()=>{ M.theme = +b.dataset.theme; saveState(); draw(false, true); }; });
    sh.querySelectorAll('[data-scene]').forEach(b=>{ b.onclick = ()=>{ M.live = false; M.scene = b.dataset.scene === 'auto' ? null : +b.dataset.scene; saveState(); draw(false, true); }; });
    sh.querySelectorAll('[data-live]').forEach(b=>{ b.onclick = ()=>{ const raw = b.dataset.live, v = +raw, p = M.liveReal ? 0 : malaLivePhase(M); if(raw === 'real'){ M.live = true; M.liveReal = true; } else if(!v) M.live = false; else { M.live = true; M.liveReal = false; M.liveMin = v; M.liveT0 = Date.now() - p * v * 60000; M.livePaused = false; } saveState(); draw(false, true); }; });
    sh.querySelectorAll('[data-lt]').forEach(b=>{ b.onclick = ()=>{ M.light = +b.dataset.lt; saveState(); draw(false, true); }; });
    sh.querySelectorAll('[data-wx]').forEach(b=>{ b.onclick = ()=>{ M.weather = b.dataset.wx; M.fx = b.dataset.wx !== 'none'; saveState(); draw(false, true); }; });
    sh.querySelectorAll('[data-spd]').forEach(b=>{ b.onclick = ()=>{ M.speed = b.dataset.spd; saveState(); draw(false, true); }; });
    sh.querySelectorAll('[data-mk]').forEach(b=>{ b.onclick = ()=>{ M.markEvery = +b.dataset.mk; M.markChosen = true; saveState(); draw(false, true); }; });
    sh.querySelectorAll('[data-ars]').forEach(b=>{ b.onclick = ()=>{ M.arSize = b.dataset.ars; saveState(); draw(false, true); }; });
    sh.querySelectorAll('[data-sw]').forEach(b=>{
      b.onclick = ()=>{
        const k = b.dataset.sw;
        if(k === 'sound') t.sound = !t.sound; else if(k === 'vibrate') t.vibrate = t.vibrate === false; else M[k] = !M[k];
        saveState(); if(k === 'vibrate' && t.vibrate && navigator.vibrate) navigator.vibrate(30); if(k === 'keepAwake') malaWake(); draw(false, true);
      };
    });
    sh.querySelectorAll('[data-tg]').forEach(b=>{
      b.onclick = ()=>{
        let n = b.dataset.tg === 'custom' ? parseInt(prompt(L({ rur:'Apna target darj karein:', en:'Enter your target:' }), counts().target)) : +b.dataset.tg;
        if(n && n > 0){ cfg.setTarget(idx, n); if(cfg.single) cfg.items[0] = malaSingleItem(); reroll(); panel = null; draw(); }
      };
    });
    const snd = sh.querySelector('#malaSnd'); if(snd){ const again = ()=>{ snd.innerHTML = tsPickerHtml(); tsPickerWire(snd, again, ()=>draw(false, true)); }; tsPickerWire(snd, again, ()=>draw(false, true)); }
    sh.querySelectorAll('.ms-more').forEach(b=>{ b.onclick = ()=>{ const f = b.parentElement; f.classList.toggle('open'); openF[f.dataset.f] = f.classList.contains('open'); }; });
    sh.querySelectorAll('details.ms-grp').forEach(d=>{ d.ontoggle = ()=>{ openG[d.dataset.g] = d.open; }; });
    sh.querySelectorAll('[data-tp]').forEach(b=>{ b.onclick = ()=>{ t.todayProfile = b.dataset.tp === 'auto' ? null : b.dataset.tp; saveState(); panel = null; runToday(); }; });
    const pln = sh.querySelector('#malaPlain'); if(pln) pln.onclick = ()=>{ t.lastRun = null; saveState(); malaOpenMain(); };
    const tpe = sh.querySelector('#malaTpEdit'); if(tpe) tpe.onclick = ()=>{ const pf = malaTodayProfile(); if(pf) renderZikrProfile(pf.id); };
    const tpn = sh.querySelector('#malaTpNew'); if(tpn) tpn.onclick = ()=>{
      const name = prompt(L({ rur:'Naye profile ka naam (jaise "Safar ki Duaein"):', en:'Name of the new profile (e.g. "Travel duas"):' }));
      if(!name || !name.trim()) return;
      ensureZikrProfiles(); const id = 'p' + Date.now();
      t.profiles.push({ id, name:name.trim(), builtin:false, items:[] }); t.todayProfile = id; saveState(); renderZikrProfile(id);
    };
    const rm = sh.querySelector('#malaRemove'); if(rm) rm.onclick = removeDua;
    const cl = sh.querySelector('#malaClassic'); if(cl) cl.onclick = ()=>{ window.__tsClassicOnce = true; renderTasbeeh(); };
  }

  /* ----- build, wire ----- */
  function draw(swap, quiet){
    /* quiet: a setting changed, so rebuild without the entrance animations and keep the panel's scroll position */
    const oldSh = body.querySelector('#malaSheet'), keepTop = quiet && oldSh ? oldSh.scrollTop : 0;
    body.innerHTML = html();
    const root = body.querySelector('.mala');
    if(swap && root){ root.classList.add('enter'); }
    if(quiet && root) root.classList.add('quiet');
    const c = counts();
    pos = c.target <= 11 ? c.cur : c.cur;
    place(pos); updateCount();
    const num = body.querySelector('#malaN'); if(num) num.classList.remove('bump');
    renderSheet(); keepRealSky();
    if(quiet){ const ns = body.querySelector('#malaSheet'); if(ns) ns.scrollTop = keepTop; }
    const $ = id=>body.querySelector(id);
    if($('#malaBack')) $('#malaBack').onclick = ()=> cfg.onBack();
    const pick = ()=>{ if(cfg.onPick) cfg.onPick(); };
    if($('#malaPick')) $('#malaPick').onclick = pick; if($('#malaPick2')) $('#malaPick2').onclick = pick;
    const stepFont = d=>{ const i = Math.max(0, MALA_AR_SIZES.indexOf(M.arSize || 'M')), j = Math.max(0, Math.min(MALA_AR_SIZES.length - 1, i + d)); if(j === i) return; M.arSize = MALA_AR_SIZES[j]; saveState(); draw(false, true); };
    if($('#malaLive')) $('#malaLive').onclick = ()=>{
      const p = malaLivePhase(M);
      if(M.livePaused){ M.livePaused = false; M.liveT0 = Date.now() - p * (M.liveMin || 5) * 60000; } else { M.livePaused = true; M.livePhase = p; }
      saveState();
      const sky = body.querySelector('.lsky'); if(sky) sky.classList.toggle('paused', M.livePaused);
      $('#malaLive').textContent = M.livePaused ? '▶' : '⏸';
    };
    $('#malaFm').onclick = ()=>stepFont(-1); $('#malaFp').onclick = ()=>stepFont(1);
    $('#malaSet').onclick = ()=>{ panel = panel === 'settings' ? null : 'settings'; renderSheet(); };
    if($('#malaRm')) $('#malaRm').onclick = removeDua;
    $('#malaUndo').onclick = undo;
    $('#malaHist').onclick = ()=>{ panel = panel === 'history' ? null : 'history'; renderSheet(); };
    if($('#malaToday')) $('#malaToday').onclick = runToday;
    $('#malaTg').onclick = ()=>{ panel = panel === 'target' ? null : 'target'; renderSheet(); };
    $('#malaReset').onclick = ()=>{ cfg.reset(idx); draw(); };
    $('#malaPrev').onclick = ()=> go(idx - 1);
    $('#malaNext').onclick = ()=> go(idx + 1);
    body.querySelectorAll('.mala-dots button').forEach(b=>{ b.onclick = ()=> go(+b.dataset.i); });
    root.addEventListener('click', e=>{
      if(e.target.closest('.mala-btn, .mala-side, .mala-sheet, .mala-dots, .mala-big')) return;
      if(!M.tapAny && !e.target.closest('.mala-mid, .mala-count')) return;
      if(e.target.closest('.mala-text') && M.tapAny){ /* the text area scrolls for long duas; a tap there still counts */ }
      if(panel){ panel = null; renderSheet(); return; }
      tick();
    });
  }
  document.getElementById('detailTitle').textContent = cfg.title || L({ rur:'Tasbeeh Counter', en:'Tasbeeh Counter' });
  draw();
  malaWake();
}

/* ---------- Picking any dua or zikr ---------- */
function renderMalaPicker(opts){
  const t = state.tasbeeh; if(!t.mine) t.mine = [];
  document.getElementById('detailTitle').textContent = L({ rur:'Dua / Zikr chunein', en:'Choose dua / zikr' });
  const body = document.getElementById('detailBody');
  let q = '', formOpen = false;
  function rows(list, kind){
    return list.map((x, i)=>{
      const inf = malaInfo(x), mean = malaMeaning(inf);
      return `<div class="mp-row" data-k="${kind}" data-i="${i}"><div class="mp-ar" dir="rtl">${malaEsc(inf.ar)}</div><div class="mp-main"><b>${malaEsc(x.title || x.n || x.name)}</b><span>${malaEsc(inf.tr && inf.tr !== (x.title || x.n || x.name) ? inf.tr : mean)}</span></div>${kind === 'mine' ? `<button type="button" class="mp-del" data-del="${i}" aria-label="Delete">✕</button>` : '<i class="chev">›</i>'}</div>`;
    }).join('');
  }
  function draw(){
    const ql = q.trim().toLowerCase();
    const hit = x=> !ql || (String(x.n || x.title || x.name) + ' ' + (x.translit || '') + ' ' + (x.m || x.meaning || '') + ' ' + (x.en || x.enm || '')).toLowerCase().includes(ql);
    const mine = t.mine.filter(hit), lib = MALA_LIB.filter(hit), duas = (typeof DUAS !== 'undefined' ? DUAS : []).filter(d=>d.arabic).filter(hit);
    body.innerHTML = `<div class="mp">
      ${opts.onBack ? `<button type="button" class="mp-back" id="mpBack">‹ ${L({ rur:'Wapas', en:'Back' })}</button>` : ''}
      <input id="mpSearch" class="mp-search" placeholder="${L({ rur:'Dua ya zikr dhoondhiye...', en:'Search dua or zikr...' })}" value="${malaEsc(q)}">
      <button type="button" class="mp-new" id="mpNew">＋ ${L({ rur:'Apna dua / zikr likhein', en:'Write your own dua / zikr' })}</button>
      <div class="mp-form" id="mpForm" ${formOpen ? '' : 'hidden'}>
        <input id="mpName" placeholder="${L({ rur:'Naam ya talaffuz (zaroori)', en:'Name or pronunciation (required)' })}">
        <textarea id="mpAr" dir="rtl" rows="2" placeholder="${L({ rur:'Arabic text (optional)', en:'Arabic text (optional)' })}"></textarea>
        <textarea id="mpM" rows="2" placeholder="${L({ rur:'Tarjuma (optional)', en:'Meaning (optional)' })}"></textarea>
        <input id="mpT" type="number" min="1" value="33" placeholder="Target">
        <button type="button" class="mala-big" id="mpSave">${opts.addTo ? L({ rur:'Set mein add karein', en:'Add to set' }) : L({ rur:'Save karke chunein', en:'Save and use' })}</button>
      </div>
      ${mine.length ? `<div class="mp-sec">${L({ rur:'Mere dua / zikr', en:'My dua / zikr' })}</div>${rows(mine, 'mine')}` : ''}
      ${lib.length ? `<div class="mp-sec">${L({ rur:'Zikr aur khaas duas', en:'Zikr and special duas' })}</div>${rows(lib, 'lib')}` : ''}
      ${duas.length ? `<div class="mp-sec">${L({ rur:'Du\'a section se', en:'From the Du\'a section' })}</div>${rows(duas, 'dua')}` : ''}
      ${(!mine.length && !lib.length && !duas.length) ? `<div class="empty-state">${L({ rur:'Kuch nahi mila.', en:'Nothing found.' })}</div>` : ''}
    </div>`;
    const lists = { mine, lib, dua:duas };
    const toInfo = (x, kind)=>{
      if(kind === 'dua') return { n:x.title, ar:x.arabic, tr:x.translit, m:x.meaning, en:x.enm, t:x.rep || 3 };
      return { n:x.n || x.name, ar:x.ar, tr:x.tr || x.n || x.name, m:x.m, en:x.en, t:x.t || x.target || 33 };
    };
    body.querySelectorAll('.mp-row').forEach(r=>{
      r.onclick = e=>{
        if(e.target.closest('.mp-del')) return;
        opts.onPick(toInfo(lists[r.dataset.k][+r.dataset.i], r.dataset.k));
      };
    });
    body.querySelectorAll('.mp-del').forEach(b=>{ b.onclick = e=>{ e.stopPropagation(); const x = mine[+b.dataset.del]; t.mine = t.mine.filter(y=>y !== x); saveState(); draw(); }; });
    const s = body.querySelector('#mpSearch');
    s.oninput = ()=>{ q = s.value; const pos = s.selectionStart; draw(); const n = body.querySelector('#mpSearch'); n.focus(); try{ n.setSelectionRange(pos, pos); }catch(e){} };
    body.querySelector('#mpNew').onclick = ()=>{ formOpen = !formOpen; body.querySelector('#mpForm').hidden = !formOpen; };
    const bk = body.querySelector('#mpBack'); if(bk) bk.onclick = opts.onBack;
    body.querySelector('#mpSave').onclick = ()=>{
      const n = body.querySelector('#mpName').value.trim(); if(!n){ showToast(L({ rur:'Naam likhein', en:'Enter a name' })); return; }
      const o = { id:'m' + Date.now(), n, ar:body.querySelector('#mpAr').value.trim(), m:body.querySelector('#mpM').value.trim(), t:parseInt(body.querySelector('#mpT').value) || 33 };
      t.mine.push(o); saveState();
      opts.onPick({ n:o.n, ar:o.ar, tr:o.n, m:o.m, en:'', t:o.t });
    };
  }
  draw();
}

/* ---------- Entry points ---------- */
function malaUse(info){
  const t = state.tasbeeh;
  t.label = info.n; t.labelAr = info.ar || ''; t.labelTr = info.tr || ''; t.labelM = info.m || ''; t.labelEn = info.en || '';
  t.target = info.t || t.target || 33; t.count = 0; t.seq = null; t.lastRun = null; saveState();
}
function malaSingleItem(){
  const t = state.tasbeeh;
  return { id:'single', name:t.label || '', ar:t.labelAr || '', tr:t.labelTr || '', m:t.labelM || '', en:t.labelEn || '', target:t.target || 33 };
}
function malaOpenMain(){
  const t = state.tasbeeh;
  malaMount({
    single:true, selfFeedback:true, title:L({ rur:'Tasbeeh Counter', en:'Tasbeeh Counter' }),
    get get(){ return ()=> state.tasbeeh.count || 0; },
    items:[malaSingleItem()],
    inc:()=>{ tasbeehTick(); return state.tasbeeh.count; },
    setTarget:(i, n)=>{ t.target = n; t.seq = null; saveState(); },
    reset:()=>{ t.count = 0; saveState(); },
    dec:()=>{ if(state.tasbeeh.count > 0){ state.tasbeeh.count--; return true; } return false; },
    onPick:()=> renderMalaPicker({ onBack:()=>renderTasbeeh(), onPick:info=>{ malaUse(info); renderTasbeeh(); } }),
  });
}
/* A dua (from the Du'a section, say) read with the counter; onBack returns to where you came from */
function malaStartWith(info, onBack, backLabel){
  malaUse(info);
  const t = state.tasbeeh;
  malaMount({
    single:true, selfFeedback:true, title:L({ rur:'Tasbeeh Counter', en:'Tasbeeh Counter' }),
    items:[malaSingleItem()], get:()=> state.tasbeeh.count || 0,
    inc:()=>{ tasbeehTick(); return state.tasbeeh.count; },
    setTarget:(i, n)=>{ t.target = n; t.seq = null; saveState(); }, reset:()=>{ t.count = 0; saveState(); },
    dec:()=>{ if(state.tasbeeh.count > 0){ state.tasbeeh.count--; return true; } return false; },
    onBack, backLabel,
    onPick:()=> renderMalaPicker({ onBack:()=>malaStartWith(info, onBack, backLabel), onPick:p=>malaStartWith(p, onBack, backLabel) }),
  });
}
/* The profile dua being read is saved, so the counter comes back on it after a refresh (until the set is done or the day changes) */
function malaRemember(pid, id){ state.tasbeeh.lastRun = { pid, id, day:dayKey(new Date()) }; saveState(); }
function malaResumeRun(){
  const t = state.tasbeeh, r = t.lastRun; if(!r) return false;
  ensureZikrProfiles();
  const pf = t.profiles.find(p=>p.id === r.pid);
  if(!pf || r.day !== dayKey(new Date()) || !pf.items.some(i=>i.id === r.id) || isZikrProfileComplete(new Date(), pf)){ t.lastRun = null; saveState(); return false; }
  malaRunSet(r.pid, r.id); return true;
}
function malaRunSet(profileId, itemId){
  ensureZikrProfiles();
  const pf = state.tasbeeh.profiles.find(p=>p.id === profileId); if(!pf) return renderTasbeeh();
  const day = getZikrDay(new Date(), pf.id, true);
  const items = pf.items;
  if(!items.length){ showToast(L({ rur:'Is set mein abhi koi dua nahi', en:'No duas in this set yet' })); return renderZikrProfile(profileId); }
  let start = Math.max(0, items.findIndex(i=>i.id === itemId));
  if(items[start]) malaRemember(profileId, items[start].id);
  malaMount({
    onIdx:it=>{ malaRemember(profileId, it.id); },
    single:false, selfFeedback:false, idx:start, title:pf.name,
    items, get:i=> day[items[i].id] || 0,
    inc:i=>{ const it = items[i]; day[it.id] = (day[it.id] || 0) + 1; const lg = tasbeehLog(), dk = dayKey(new Date()); lg[dk] = (lg[dk] || 0) + 1; saveState(); return day[it.id]; },
    setTarget:(i, n)=>{ items[i].target = n; saveState(); },
    reset:i=>{ day[items[i].id] = 0; delete day.__marked; saveState(); },
    dec:i=>{ const it = items[i]; if((day[it.id] || 0) > 0){ day[it.id]--; return true; } return false; },
    onFinish:()=> renderZikrProfile(profileId),
    onBack:()=> renderZikrProfile(profileId), backLabel:pf.name,
    /* a dua picked here is read on its own; it is not added to the profile (add duas from the profile screen) */
    onPick:()=> renderMalaPicker({ onBack:()=>malaRunSet(profileId, itemId), onPick:info=>{ malaUse(info); malaOpenMain(); } }),
  });
}

/* The Tasbeeh Counter entry: the Mala look by default, the classic screen from its gear panel (or when chosen in the design row) */
function renderTasbeeh(){
  const t = state.tasbeeh;
  if(!t.designChosen && t.design === 'tap') t.design = 'mala';
  if(t.design === 'mala' && !window.__tsClassicOnce){ if(malaResumeRun()) return; return malaOpenMain(); }
  window.__tsClassicOnce = false;
  renderTasbeehClassic();
}
