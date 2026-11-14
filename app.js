/* app.js is BUILT from src/*.js by tools/build.py. Edit the files in src/, not this one. */
/* ===== LOCAL ERROR LOG (stays on this device; attached to the Raabta email only when the user sends it) ===== */
const ERR_KEY = 'waqtErrLog', ERR_MAX = 30;
function errLogRead(){ try{ return JSON.parse(localStorage.getItem(ERR_KEY)||'[]') || []; }catch(e){ return []; } }
function errLogClear(){ try{ localStorage.removeItem(ERR_KEY); }catch(e){} }
function errLogAdd(kind, msg, where, stack){
  try{
    const list = errLogRead(), m = String(msg||'').slice(0,200), w = String(where||'').replace(/^https?:\/\/[^/]+/,'').slice(0,80);
    const last = list[list.length-1];
    if(last && last.m===m && last.w===w){ last.n = (last.n||1)+1; last.t = Date.now(); }
    else list.push({ t:Date.now(), k:kind, m, w, s:String(stack||'').split('\n').slice(0,3).join(' | ').replace(/https?:\/\/[^/\s]+/g,'').slice(0,240), sc:(document.getElementById('detailTitle')||{}).textContent||'' , n:1 });
    while(list.length > ERR_MAX) list.shift();
    localStorage.setItem(ERR_KEY, JSON.stringify(list));
  }catch(e){}
}
window.addEventListener('error', e=>{ if(e.target && e.target!==window) return; errLogAdd('error', e.message, (e.filename||'')+':'+(e.lineno||0)+':'+(e.colno||0), e.error && e.error.stack); });
window.addEventListener('unhandledrejection', e=>{ const r = e.reason; errLogAdd('promise', (r && r.message) || r, '', r && r.stack); });
function errLogText(max){
  const list = errLogRead().slice(-6).reverse();
  if(!list.length) return '';
  let out = list.map(x=>{
    const d = new Date(x.t), ts = d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')+' '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');
    return `[${ts}] ${x.m}${x.n>1?' x'+x.n:''} @ ${x.w}${x.sc?' ('+x.sc+')':''}`;
  }).join('\n');
  return max && out.length > max ? out.slice(0,max)+'…' : out;
}
function appBuildId(){ try{ const m = (document.querySelector('script[src*="app.js"]')||{}).src.match(/v=([0-9a-f]+)/); return m ? m[1] : 'dev'; }catch(e){ return 'dev'; } }

/* ============================================================
   PRAYER TIME ASTRONOMICAL CALCULATION (PrayTimes.org method, MWL params)
   ============================================================ */
function L(o){ return (state.lang==='en' && o.en!==undefined) ? o.en : o.rur; }
const SHARE_SVG = '<svg class="ic-share" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.6" y1="13.5" x2="15.4" y2="17.5"></line><line x1="15.4" y1="6.5" x2="8.6" y2="10.5"></line></svg>';
const TZ = 5.5; // India Standard Time
const PRIORITY_CITIES = [
  {name:'Chittaranjan', state:'West Bengal', lat:23.8315, lon:86.8908},
  {name:'Gaya', state:'Bihar', lat:24.7955, lon:85.0002},
  {name:'Gondia', state:'Maharashtra', lat:21.4602, lon:80.1961},
  {name:'Hyderabad', state:'Telangana', lat:17.3850, lon:78.4867},
  {name:'Jehanabad', state:'Bihar', lat:25.2131, lon:84.9909},
  {name:'Koraput', state:'Odisha', lat:18.8117, lon:82.7126},
  {name:'Pune', state:'Maharashtra', lat:18.5204, lon:73.8567},
  {name:'Ranchi', state:'Jharkhand', lat:23.3441, lon:85.3096},
].sort((a,b)=>a.name.localeCompare(b.name));

const OTHER_CITIES = [
  {name:'Agra', lat:27.1767, lon:78.0081},
  {name:'Ahmedabad', lat:23.0225, lon:72.5714},
  {name:'Ajmer', lat:26.4499, lon:74.6399},
  {name:'Aligarh', lat:27.8974, lon:78.0880},
  {name:'Amritsar', lat:31.6340, lon:74.8723},
  {name:'Bareilly', lat:28.3670, lon:79.4304},
  {name:'Bengaluru', lat:12.9716, lon:77.5946},
  {name:'Bhopal', lat:23.2599, lon:77.4126},
  {name:'Bhubaneswar', lat:20.2961, lon:85.8245},
  {name:'Chennai', lat:13.0827, lon:80.2707},
  {name:'Delhi', lat:28.6139, lon:77.2090},
  {name:'Gorakhpur', lat:26.7606, lon:83.3732},
  {name:'Guwahati', lat:26.1445, lon:91.7362},
  {name:'Hubli', lat:15.3647, lon:75.1240},
  {name:'Indore', lat:22.7196, lon:75.8577},
  {name:'Jaipur', lat:26.9124, lon:75.7873},
  {name:'Jodhpur', lat:26.2389, lon:73.0243},
  {name:'Kanpur', lat:26.4499, lon:80.3319},
  {name:'Kochi', lat:9.9312, lon:76.2673},
  {name:'Kolhapur', lat:16.7050, lon:74.2433},
  {name:'Kolkata', lat:22.5726, lon:88.3639},
  {name:'Kozhikode', lat:11.2588, lon:75.7804},
  {name:'Lucknow', lat:26.8467, lon:80.9462},
  {name:'Ludhiana', lat:30.9010, lon:75.8573},
  {name:'Malappuram', lat:11.0510, lon:76.0711},
  {name:'Meerut', lat:28.9845, lon:77.7064},
  {name:'Moradabad', lat:28.8386, lon:78.7733},
  {name:'Mumbai', lat:19.0760, lon:72.8777},
  {name:'Nagpur', lat:21.1458, lon:79.0882},
  {name:'Nashik', lat:19.9975, lon:73.7898},
  {name:'Patna', lat:25.5941, lon:85.1376},
  {name:'Raipur', lat:21.2514, lon:81.6296},
  {name:'Srinagar', lat:34.0837, lon:74.7973},
  {name:'Surat', lat:21.1702, lon:72.8311},
  {name:'Varanasi', lat:25.3176, lon:82.9739},
].sort((a,b)=>a.name.localeCompare(b.name));

const CITIES = [...PRIORITY_CITIES, ...OTHER_CITIES];
/* Calculation methods. isha is an angle, or {min} = minutes after Maghrib (Umm al-Qura: 90, or 120 in Ramzan). */
const CALC_METHODS = {
  mwl:     { name:'Muslim World League', fajr:18,   isha:17,  note:'Fajr 18° · Isha 17°' },
  karachi: { name:'Karachi (Univ. of Islamic Sciences)', fajr:18, isha:18, note:'Fajr 18° · Isha 18°' },
  isna:    { name:'ISNA (North America)', fajr:15,   isha:15,  note:'Fajr 15° · Isha 15°' },
  egypt:   { name:'Egyptian General Authority', fajr:19.5, isha:17.5, note:'Fajr 19.5° · Isha 17.5°' },
  makkah:  { name:'Umm al-Qura (Makkah)', fajr:18.5, isha:{min:90}, note:'Fajr 18.5° · Isha 90 min after Maghrib (120 in Ramzan)' }
};
function calcMethod(){ return CALC_METHODS[state.calcMethod] || CALC_METHODS.mwl; }
const ADJ_KEYS = ['fajr','zuhr','asr','maghrib','isha'];
function prayerAdjust(k){ const a = state.adjust && +state.adjust[k]; return a||0; }

function julianDate(y,m,d){
  if(m<=2){ y-=1; m+=12; }
  const A=Math.floor(y/100), B=2-A+Math.floor(A/4);
  return Math.floor(365.25*(y+4716))+Math.floor(30.6001*(m+1))+d+B-1524.5;
}
function sunPosition(jd){
  const D = jd - 2451545.0;
  const g = fixAngle(357.529 + 0.98560028*D);
  const q = fixAngle(280.459 + 0.98564736*D);
  const L = fixAngle(q + 1.915*dsin(g) + 0.020*dsin(2*g));
  const e = 23.439 - 0.00000036*D;
  const dec = darcsin(dsin(e)*dsin(L));
  let RA = darctan2(dcos(e)*dsin(L), dcos(L))/15;
  RA = fixHour(RA);
  const eqt = q/15 - RA;
  return {declination:dec, eqt:eqt};
}
function fixAngle(a){ a=a-360*Math.floor(a/360); return a<0?a+360:a; }
function fixHour(a){ a=a-24*Math.floor(a/24); return a<0?a+24:a; }
function dsin(d){return Math.sin(d*Math.PI/180);}
function dcos(d){return Math.cos(d*Math.PI/180);}
function dtan(d){return Math.tan(d*Math.PI/180);}
function darcsin(x){return Math.asin(x)*180/Math.PI;}
function darccos(x){return Math.acos(x)*180/Math.PI;}
function darctan2(y,x){return Math.atan2(y,x)*180/Math.PI;}

function computeTime(jd, angleOrMin, isAngle, isAfter, lat, lon, tz){
  const sp = sunPosition(jd + (isAfter? 0.5 : -0.5 + 0.5)); // approximation, refined below with iteration
  return sp;
}

function sunAngleTime(jd, angle, lat, direction){
  const sp = sunPosition(jd);
  const dec = sp.declination;
  const num = -dsin(angle) - dsin(dec)*dsin(lat);
  const den = dcos(dec)*dcos(lat);
  let ratio = num/den;
  ratio = Math.max(-1, Math.min(1, ratio));
  const t = darccos(ratio)/15;
  return direction==='ccw' ? -t : t;
}

/* ---- Time zone handling: offsets are looked up per date (DST-safe) for the city's own time zone ---- */
const _tzFmt = {};
let _devTZ = null;
function deviceTZ(){ if(_devTZ===null){ try{ _devTZ = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; }catch(e){ _devTZ=''; } } return _devTZ; }
function locTZ(){
  const l = (typeof state!=='undefined') && state.location;
  if(l && l.tz) return l.tz;
  if(l && l.source==='gps' && deviceTZ()) return deviceTZ();
  return 'Asia/Kolkata';
}
function tzOffsetHours(ts, tz){
  try{
    const f = _tzFmt[tz] || (_tzFmt[tz] = new Intl.DateTimeFormat('en-US',{timeZone:tz,hourCycle:'h23',year:'numeric',month:'numeric',day:'numeric',hour:'numeric',minute:'numeric',second:'numeric'}));
    const p = {}; f.formatToParts(ts).forEach(x=>{ p[x.type]=+x.value; });
    return (Date.UTC(p.year,p.month-1,p.day,p.hour%24,p.minute,p.second) - Math.floor(ts/1000)*1000)/3600000;
  }catch(e){ return TZ; }
}
/* Offset (hours from UTC) in force at the location around midday on the given calendar day */
function dayOffsetHours(date){ return tzOffsetHours(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12) , locTZ()); }
/* Hours:minutes on the wall clock of the location (falls back to the device clock when they are the same zone) */
function wallHM(d){
  const tz = locTZ();
  if(tz === deviceTZ()) return [d.getHours(), d.getMinutes()];
  try{
    const f = _tzFmt['hm:'+tz] || (_tzFmt['hm:'+tz] = new Intl.DateTimeFormat('en-US',{timeZone:tz,hourCycle:'h23',hour:'numeric',minute:'numeric'}));
    const p = {}; f.formatToParts(d).forEach(x=>{ p[x.type]=+x.value; });
    return [p.hour%24, p.minute];
  }catch(e){ return [d.getHours(), d.getMinutes()]; }
}

function computeDayTimes(date, lat, lon, tz){
  const jd = julianDate(date.getFullYear(), date.getMonth()+1, date.getDate()) - lon/(15*24);
  const noonBase = 12 - lon/15 + tz - 0; // approx

  function timeFor(angle, isMorning, strict){
    let T = 12; // start guess (hours, local solar-ish)
    for(let i=0;i<2;i++){
      const jdT = jd + T/24;
      const sp = sunPosition(jdT);
      const dec = sp.declination, eqt = sp.eqt;
      const noon = fixHour(12 - eqt);
      const num = -dsin(angle) - dsin(dec)*dsin(lat);
      const den = dcos(dec)*dcos(lat);
      if(strict && Math.abs(num/den) > 1) return NaN; // the sun never reaches this angle tonight (high latitude)
      let ratio = Math.max(-1, Math.min(1, num/den));
      const H = darccos(ratio)/15;
      T = isMorning ? noon - H : noon + H;
    }
    return fixHour(T + tz - lon/15);
  }
  function solarNoon(){
    let T=12;
    const jdT = jd + T/24;
    const sp = sunPosition(jdT);
    const noon = fixHour(12 - sp.eqt);
    return fixHour(noon + tz - lon/15);
  }
  function darccot(x){ return darctan2(1,x); }
  function asrTime(shadowFactor){
    let T = 13;
    for(let i=0;i<2;i++){
      const jdT = jd + T/24;
      const sp = sunPosition(jdT);
      const dec = sp.declination, eqt = sp.eqt;
      const noon = fixHour(12 - eqt);
      const angle = -darccot(shadowFactor + dtan(Math.abs(lat-dec)));
      const num = -dsin(angle) - dsin(dec)*dsin(lat);
      const den = dcos(dec)*dcos(lat);
      const ratio = Math.max(-1, Math.min(1, num/den));
      const H = darccos(ratio)/15;
      T = noon + H;
    }
    return fixHour(T + tz - lon/15);
  }

  const M = calcMethod();
  const FAJR_ANGLE = M.fajr;
  let fajr = timeFor(FAJR_ANGLE, true, true);
  const sunrise = timeFor(0.833, true);
  const dhuhr = fixHour(solarNoon() + (1/60)); // +1 min safety after zawal
  const zawalEnd = solarNoon(); // moment of zawal (istawa) - zuhr starts right after
  const asr = asrTime(state.asrMethod==='shafi' ? 1 : 2); // Hanafi: shadow twice the length (default); Shafi'i: shadow equal to length
  const maghrib = timeFor(0.833, false);
  const ishaFixed = typeof M.isha==='object';
  let ISHA_ANGLE = ishaFixed ? 17 : M.isha;
  let isha;
  if(ishaFixed){
    const ramzan = gregorianToHijri(date).month === 9;
    isha = fixHour(maghrib + (ramzan ? 120 : M.isha.min)/60);
  } else isha = timeFor(ISHA_ANGLE, false, true);
  // Angle-based night-portion rule: where twilight never reaches the Fajr/Isha angle (northern summers),
  // take that angle's share (angle/60) of the night, so the time is sensible instead of a clamped guess.
  let highLat = false;
  if(isNaN(fajr) || isNaN(isha)){
    highLat = true;
    const night = fixHour(sunrise - maghrib);
    if(isNaN(fajr)) fajr = fixHour(sunrise - night * FAJR_ANGLE / 60);
    if(isNaN(isha)) isha = fixHour(maghrib + night * ISHA_ANGLE / 60);
  }

  return { fajr, sunrise, dhuhr, zawal: zawalEnd, asr, maghrib, isha, jd, highLat };
}

function toDate(baseDate, hourFloat, offH){
  /* hourFloat is the wall-clock hour at the location; offH its UTC offset on that day. Returns the exact instant. */
  if(offH === undefined) offH = TZ;
  const mins = Math.round(hourFloat*60);
  return new Date(Date.UTC(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate()) + (mins - Math.round(offH*60))*60000);
}
function fmtTime(d){
  const [hh, mm] = wallHM(d);
  const m = String(mm).padStart(2,'0');
  if(state.timeFormat==='12'){
    let h = hh;
    const ap = h>=12?'PM':'AM';
    h = h%12; if(h===0) h=12;
    return h + ':' + m + ' ' + ap;
  }
  return String(hh).padStart(2,'0') + ':' + m;
}
function fmtTimeCompact(d){
  const [hh, mm] = wallHM(d);
  const m = String(mm).padStart(2,'0');
  if(state.timeFormat==='12'){
    let h = hh;
    const ap = h>=12?'PM':'AM';
    h = h%12; if(h===0) h=12;
    return h + ':' + m + ' ' + ap;
  }
  return String(hh).padStart(2,'0') + ':' + m;
}
function fmtRange(p){
  if(p.key==='sehri') return 'Khatm ' + fmtTimeCompact(p.end);
  if(p.key==='iftar') return 'Shuru ' + fmtTimeCompact(p.start);
  return fmtTimeCompact(p.start) + '<span class="arrow">–</span>' + fmtTimeCompact(p.end);
}
function addMin(d, mins){ return new Date(d.getTime() + mins*60000); }
function fmtRemain(ms){
  const totalMin = Math.max(0, Math.ceil(ms/60000));
  if(totalMin >= 60){
    const h = Math.floor(totalMin/60), m = totalMin%60;
    return h+' Ghante'+(m>0 ? ' '+m+' Minute' : '');
  }
  return totalMin+' Minute'+(totalMin===1?'':'s');
}

/* Build full schedule for a given date */
function buildSchedule(date){
  const loc = (typeof state!=='undefined' && state.location) ? state.location : CITIES[0];
  const off = dayOffsetHours(date);
  const t = computeDayTimes(date, loc.lat, loc.lon, off);
  const fajr = addMin(toDate(date, t.fajr, off), prayerAdjust('fajr'));
  const sunrise = toDate(date, t.sunrise, off);
  const zawal = toDate(date, t.zawal, off);
  const dhuhr = addMin(zawal, 3 + prayerAdjust('zuhr')); // zuhr begins shortly after zawal ends
  const asr = addMin(toDate(date, t.asr, off), prayerAdjust('asr'));
  const maghrib = addMin(toDate(date, t.maghrib, off), prayerAdjust('maghrib'));
  const isha = addMin(toDate(date, t.isha, off), prayerAdjust('isha'));

  const sehriEnd = addMin(fajr, -1); // sehri ends 1 min before fajr
  const sehriStart = addMin(fajr, -90);
  const ishraq = addMin(sunrise, 20);
  const chaast = addMin(sunrise, 90);
  const zawalStart = addMin(zawal, -15); // makrooh window before zawal
  const iftar = new Date(maghrib);
  const awwabin = new Date(maghrib); // same window as Maghrib; shown together with it
  const nightLen = (fajr.getTime()+24*3600000 - maghrib.getTime());
  const tahajjudStart = new Date(maghrib.getTime() + nightLen*0.5); // half the night
  const tihaiStart = new Date(maghrib.getTime() + nightLen*(2/3)); // last third of the night
  const ishaEnd = addMin(fajr,-1);

  return [
    {key:'sehri', name:'Sehri', type:'meal', start:sehriStart, end:sehriEnd},
    {key:'fajr', name:'Fajr', type:'fard', start:fajr, end:sunrise},
    {key:'tulu', name:'Tulu Aftab', type:'special', start:sunrise, end:ishraq},
    {key:'ishraq', name:'Ishraq', type:'nafil', start:ishraq, end:chaast},
    {key:'chaast', name:'Chaast', type:'nafil', start:chaast, end:zawalStart},
    {key:'zawal', name:'Zawal', type:'special', start:zawalStart, end:dhuhr},
    {key:'zuhr', name:'Zuhr', type:'fard', start:dhuhr, end:asr},
    {key:'asr', name:'Asr', type:'fard', start:asr, end:maghrib},
    {key:'ghurub', name:'Ghurub Aftab', type:'special', start:addMin(maghrib,-20), end:maghrib},
    {key:'iftar', name:'Iftar', type:'meal', start:maghrib, end:addMin(maghrib,10)},
    {key:'maghrib', name:'Maghrib', type:'fard', start:maghrib, end:isha},
    {key:'awwabin', name:'Awwabin', type:'nafil', start:awwabin, end:isha},
    {key:'isha', name:'Isha', type:'fard', start:isha, end:addMin(fajr,24*60-1)},
    {key:'tahajjud', name:'Tahajjud', type:'nafil', start:tahajjudStart, end:addMin(fajr,24*60-1)},
    {key:'tihai', name:"Du'a Qubooliyat", type:'special', start:tihaiStart, end:addMin(fajr,24*60-1)},
  ];
}

/* icon + ambient-theme-category per prayer key */
const PRAYER_META = {
  sehri:   {icon:'🍽️', waqt:'waqt-darkest'},
  fajr:    {icon:'🌅', waqt:'waqt-morning'},
  tulu:    {icon:'🌄', waqt:'waqt-morning'},
  ishraq:  {icon:'☀️', waqt:'waqt-bright'},
  chaast:  {icon:'🌤️', waqt:'waqt-bright'},
  zawal:   {icon:'⏸️', waqt:'waqt-dim'},
  zuhr:    {icon:'🔆', waqt:'waqt-bright'},
  asr:     {icon:'🌇', waqt:'waqt-dim'},
  ghurub:  {icon:'🌆', waqt:'waqt-grey'},
  iftar:   {icon:'🍲', waqt:'waqt-grey'},
  maghrib: {icon:'🕌', waqt:'waqt-grey'},
  awwabin: {icon:'🌌', waqt:'waqt-dark'},
  isha:    {icon:'🌃', waqt:'waqt-dark'},
  tahajjud:{icon:'🌗', waqt:'waqt-darkest'},
  tihai:   {icon:'🤲', waqt:'waqt-darkest'},
};

/* ============================================================
   INFO MODAL, meaning + timing of each entry
   ============================================================ */
const INFO_TEXT = {
  sehri:   {time:'Fajr se pehle', text:"Subah sadiq (Fajr) se pehle khaya jaane wala aakhri khana, roze ki niyyat ke saath. Sehri ka waqt Fajr shuru hote hi khatam ho jaata hai."},
  fajr:    {time:'Subah sadiq se Suraj nikalne tak', text:'Din ki pehli farz namaz. Subah sadiq (pau phatna) se shuru hoke suraj nikalne tak ka waqt hota hai.'},
  tulu:    {time:'Suraj nikalne ka lamha', text:'Suraj nikalne (Tulu Aftab) ka waqt. Is waqt namaz padhna mana hai, yeh sirf waqt ki nishani ke taur par dikhaya gaya hai.'},
  ishraq:  {time:'Suraj nikalne ke ~20 min baad', text:'Suraj nikalne ke thodi der baad padhi jaane wali nafil namaz, jiska bohot sawaab bataya gaya hai, poori Hajj-Umrah jaisa ajar milta hai.'},
  chaast:  {time:'Din chadhne par, Zawal se pehle', text:"Din chadhne par padhi jaane wali nafil namaz, jise Duha (Chaast) ki namaz kehte hain. Har jodh (jism ke joint) ka sadqa is namaz se ada ho jaata hai."},
  zawal:   {time:'Zuhr se thodi der pehle', text:'Suraj apne sabse oonche point (istawa) par pahunchne ka waqt. Is thodi der ke waqt mein namaz padhna makrooh hai, isliye intezar kijiye.'},
  zuhr:    {time:'Zawal ke baad se Asr tak', text:'Din ki doosri farz namaz, jo zawal khatam hone ke foran baad se Asr shuru hone tak padhi jaati hai.'},
  asr:     {time:'Saaye lambe hone se Maghrib tak', text:'Din ki teesri farz namaz. Jab cheezon ke saaye lambe hone lagte hain, tab se Maghrib se thodi der pehle tak ka waqt hota hai.'},
  ghurub:  {time:'Suraj doobne se pehle', text:'Suraj doobne se thodi der pehle ka waqt. Is waqt bhi namaz padhna makrooh hai, isliye Maghrib ka intezar kijiye.'},
  iftar:   {time:'Maghrib ki azan ke saath', text:'Roza kholne ka waqt, jo Maghrib ki azan hote hi shuru ho jaata hai. Roza jald kholna sunnat hai.'},
  maghrib: {time:'Suraj doobte hi se Isha tak', text:'Din ki chauthi farz namaz, suraj doobte hi shuru hoti hai aur Isha ka waqt shuru hone tak rehti hai.'},
  awwabin: {time:'Maghrib ke faraiz ke baad', text:"Maghrib ke baad padhi jaane wali nafil namaz (6 raka'at), jinhe Awwabin kehte hain, taubah karne walon ki namaz."},
  isha:    {time:'Raat ke andhere se Subah Sadiq tak', text:'Din ki paanchvi aur aakhri farz namaz, raat ke andhere mein shuru hoke subah sadiq (Fajr) tak ka waqt hota hai.'},
  tahajjud:{time:'Aadhi raat se Fajr tak', text:'Raat ki nafil namaz jo raat ke aadhe hisse ke baad shuru hoke Fajr tak padhi jaa sakti hai, Allah se sabse zyada qareeb hone ka waqt maana jaata hai.'},
  tihai:   {time:'Raat ke aakhri teesre hisse mein', text:"Raat ke aakhri teesre hisse ka waqt (Fajr tak), jab Allah aasmaan-e-duniya par nuzool farmata hai aur du'a qubool hone ki sabse zyada ummeed hoti hai."},
};
/* Long-press (about half a second) on an element, cancelled if the finger moves or lifts early */
function attachLongPress(el, fn){
  let t = null, x0 = 0, y0 = 0;
  const cancel = ()=>{ clearTimeout(t); t = null; };
  el.addEventListener('touchstart', e=>{ x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; cancel(); t = setTimeout(()=>{ t = null; buzz(15); fn(); }, 520); }, { passive:true });
  el.addEventListener('touchmove', e=>{ if(t && (Math.abs(e.touches[0].clientX-x0) > 10 || Math.abs(e.touches[0].clientY-y0) > 10)) cancel(); }, { passive:true });
  el.addEventListener('touchend', cancel); el.addEventListener('touchcancel', cancel);
  el.addEventListener('contextmenu', e=>{ e.preventDefault(); fn(); }); // right-click / long-press on desktop
}
/* Quick options for one prayer row */
function openRowSheet(p, date){
  const isFard = FIVE.includes(p.key);
  const q = iqamahState();
  const w = document.createElement('div');
  w.className = 'app-confirm';
  w.innerHTML = `<div class="info-card">
    <div class="rs-head"><span class="rs-ic">${(PRAYER_META[p.key]||{}).icon||'🕐'}</span><div><b>${p.name}</b><span>${fmtRange(p)}</span></div></div>
    <button class="rs-opt" data-act="info">ℹ️ ${L({rur:'Is waqt ki maloomat', en:'About this time'})}</button>
    ${isFard ? `<div class="rs-opt rs-jam">🕌 ${L({rur:'Jamaat ka waqt', en:'Jamaat time'})}<input type="time" id="rsJam" value="${q.t[p.key]||''}"></div>` : ''}
    <button class="rs-opt" data-act="share">📤 ${L({rur:'Aaj ke auqaat share karein', en:'Share today\u2019s times'})}</button>
    <div class="ac-btns"><button class="ac-no">${L({rur:'Band karein', en:'Close'})}</button></div>
  </div>`;
  document.body.appendChild(w);
  const close = ()=> w.remove();
  w.onclick = e=>{ if(e.target === w) close(); };
  w.querySelector('.ac-no').onclick = close;
  w.querySelector('[data-act="info"]').onclick = ()=>{ close(); showInfoModal(p.key); };
  w.querySelector('[data-act="share"]').onclick = ()=>{ close(); openShareChooser(date); };
  const jam = w.querySelector('#rsJam');
  if(jam) jam.onchange = ()=>{
    q.t[p.key] = jam.value; if(jam.value) q.on = true; saveState();
    renderHome(); scheduleNotifications(true);
    showToast(jam.value ? `${p.name}: ${L({rur:'jamaat', en:'jamaat'})} ${jam.value}` : `${p.name}: ${L({rur:'Jamaat ka waqt hata diya', en:'Jamaat time removed'})}`);
  };
}
function showInfoModal(key){
  const info = INFO_TEXT[key];
  const meta = PRAYER_META[key];
  const name = (buildSchedule(new Date()).find(p=>p.key===key) || {}).name || key;
  if(!info) return;
  document.getElementById('infoTitle').innerHTML = `<span class="pIcon">${meta?meta.icon:''}</span>${name}`;
  document.getElementById('infoTime').textContent = info.time;
  document.getElementById('infoText').textContent = info.text;
  document.getElementById('infoModal').classList.add('active');
  pushModalState();
}
/* Explains the 5 Farz bulk buttons (green / yellow / red / reset) in the shared info modal */
function showBulkInfoModal(){
  document.getElementById('infoTitle').innerHTML = `<span class="pIcon">🕋</span>5 Farz Namaz ke Buttons`;
  document.getElementById('infoTime').textContent = 'Ek click mein paanchon Farz ka status';
  document.getElementById('infoText').innerHTML = `
    <div class="bulk-help-row"><span class="bulk-btn bulk-green">✓</span><div><b>Hara (Padh Li)</b><br>Paanchon Farz ek saath "Padh Li" ho jayenge.</div></div>
    <div class="bulk-help-row"><span class="bulk-btn bulk-yellow">~</span><div><b>Peela (Qaza Padhi)</b><br>Paanchon Farz ek saath "Qaza Padhi" ho jayenge.</div></div>
    <div class="bulk-help-row"><span class="bulk-btn bulk-red">⏳</span><div><b>Laal (Baaki Hai)</b><br>Paanchon Farz ek saath "Baaki Hai" mark ho jayenge.</div></div>
    <div class="bulk-help-row"><span class="bulk-btn bulk-clear">↺</span><div><b>Reset</b><br>Paanchon Farz ka aaj ka status khaali (clear) ho jayega.</div></div>
    <div style="font-size:12px; opacity:0.75; margin-top:8px;">Yeh buttons sirf paanchon Farz par asar karte hain. Har namaz ko alag se bhi set kar sakte hain.</div>`;
  document.getElementById('infoModal').classList.add('active');
  pushModalState();
}
document.getElementById('bulkInfo').onclick = showBulkInfoModal;
document.getElementById('infoClose').onclick = closeModal;
document.getElementById('infoModal').onclick = (e)=>{ if(e.target.id==='infoModal') closeModal(); };

/* ============================================================
   HIJRI DATE (arithmetic / tabular Islamic calendar approximation)
   ============================================================ */
const HIJRI_MONTHS = ["Muharram-ul-Haraam","Safar-ul-Muzaffar","Rabi-ul-Awwal","Rabi-ul-Aakhir","Jamadi-ul-Awwal","Jamadi-ul-Aakhir","Rajab-ul-Murajjab","Sha'ban-ul-Muazzam","Ramzan-ul-Mubarak","Shawwal-ul-Mukarram","Zul-Qa'dah","Zul-Hijjah"];
function gregorianToHijri(date){
  const jd = Math.floor(julianDate(date.getFullYear(), date.getMonth()+1, date.getDate())) + 1 + hijriOffset();
  let l = jd - 1948440 + 10632;
  const n = Math.floor((l-1)/10631);
  l = l - 10631*n + 354;
  const j = (Math.floor((10985-l)/5316))*(Math.floor((50*l)/17719)) + (Math.floor(l/5670))*(Math.floor((43*l)/15238));
  l = l - (Math.floor((30-j)/15))*(Math.floor((17719*j)/50)) - (Math.floor(j/16))*(Math.floor((15238*j)/43)) + 29;
  const month = Math.floor((24*l)/709);
  const day = l - Math.floor((709*month)/24);
  const year = 30*n + j - 30;
  return { day, month, year, monthName: HIJRI_MONTHS[month-1] };
}
/* Hijri date adjustment in days (moon sighting can differ by a day or two from the calculation) */
function hijriOffset(){
  if(hijriOffset._v === undefined){ try{ hijriOffset._v = parseInt(localStorage.getItem('hijriOffset')||'0') || 0; }catch(e){ hijriOffset._v = 0; } }
  return hijriOffset._v;
}
function setHijriOffset(v){ hijriOffset._v = v; try{ localStorage.setItem('hijriOffset', String(v)); }catch(e){} }

/* ============================================================
   STATE
   ============================================================ */
let IS_FIRST_RUN = false;
try{ IS_FIRST_RUN = !localStorage.getItem('namazState'); }catch(e){}
let state = {
  theme: 'waqti',
  palette: 'default',
  timeFormat: '24',
  schema: 0,
  location: {name:'Delhi', lat:28.6139, lon:77.2090, source:'manual'},
  status: {}, // key: date+prayer -> 'green'|'yellow'|'red'
  roza: {},
  tarabih: {},
  namazMode: false,
  notif: { fard:false, nafil:false, meal:false, special:false, lafz:false, hadees:false, learnTime:'08:00' },
  tasbeeh: { count:0, target:33, color:'#3fae6a', shape:'●', sound:true, design:'tap', profiles:null, daily:{} },
  wordStatus: {},
  quizLog: [],
  lang: 'rur',
  wordCorrect: {},
  learnDays: {},
  bookmarks: [],
};
/* ---- Saved-data schema. Bump STATE_VERSION when a setting is added/renamed and add a step to MIGRATIONS.
   Backups and stored data with an older (or missing) `schema` are upgraded step by step before use. ---- */
const STATE_VERSION = 2;
const MIGRATIONS = {
  /* 1 -> 2: heroMode, calculation method, minute adjustments, haptics/sound switches, location time zone */
  1: s=>{
    if(!['full','strip','off'].includes(s.heroMode)) s.heroMode = 'full';
    if(!CALC_METHODS[s.calcMethod]) s.calcMethod = 'mwl';
    if(!s.adjust || typeof s.adjust!=='object' || Array.isArray(s.adjust)) s.adjust = {};
    if(typeof s.haptics!=='boolean') s.haptics = true;
    if(typeof s.sounds!=='boolean') s.sounds = true;
    if(s.location && typeof s.location==='object' && !s.location.tz && s.location.source!=='gps') s.location.tz = 'Asia/Kolkata';
    return s;
  }
};
const STATE_SHAPE = { status:'o', roza:'o', tarabih:'o', wordStatus:'o', wordCorrect:'o', learnDays:'o', notif:'o', tasbeeh:'o', location:'o', adjust:'o', quizLog:'a', bookmarks:'a', notes:'a' };
/* Returns a clean, current-version copy of any saved/imported state object (never throws). */
function migrateState(raw){
  let s = (raw && typeof raw==='object' && !Array.isArray(raw)) ? Object.assign({}, raw) : {};
  Object.keys(STATE_SHAPE).forEach(k=>{
    if(!(k in s)) return;
    const v = s[k], isArr = Array.isArray(v), isObj = v && typeof v==='object' && !isArr;
    if(STATE_SHAPE[k]==='a' ? !isArr : !isObj) delete s[k];   /* wrong type: drop it so the default applies */
  });
  let v = parseInt(s.schema); if(!(v>=1)) v = 1;
  for(; v < STATE_VERSION; v++) if(MIGRATIONS[v]){ try{ s = MIGRATIONS[v](s) || s; }catch(e){ errLogAdd('migrate', e.message, 'v'+v); } }
  s.schema = STATE_VERSION;
  return s;
}
function loadState(){
  try{ const s = migrateState(JSON.parse(localStorage.getItem('namazState')||'{}')); state = Object.assign(state, s); }catch(e){}
  if(state.timeFormat!=='12') state.timeFormat = '24';
  if(!['s','m','l','xl','xxl'].includes(state.textScale)) state.textScale = 'm';
  if(!['m','l','xl','xxl'].includes(state.arScale)) state.arScale = 'm';
  if(state.lang!=='en') state.lang = 'rur';
}
function saveState(){
  try{ localStorage.setItem('namazState', JSON.stringify(state)); }catch(e){}
}
loadState();

function dayKey(d){ return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate(); }
function statusKey(d, prayer){ return dayKey(d)+'_'+prayer; }
/* Bottom sheets can be dismissed by dragging them down */
(()=>{
  document.querySelectorAll('#infoModal .info-card, #shareChooser .info-card').forEach(card=>{
    let y0 = null;
    card.addEventListener('touchstart', (e)=>{ y0 = e.touches[0].clientY; card.style.transition = 'none'; }, { passive:true });
    card.addEventListener('touchmove', (e)=>{
      if(y0 == null) return;
      card.style.transform = `translateY(${Math.max(0, e.touches[0].clientY - y0)}px)`;
    }, { passive:true });
    card.addEventListener('touchend', (e)=>{
      if(y0 == null) return;
      const dy = e.changedTouches[0].clientY - y0; y0 = null;
      card.style.transition = 'transform .2s ease';
      if(dy > 90){
        card.style.transform = 'translateY(100%)';
        setTimeout(()=>{ closeModal(); card.style.transform = ''; card.style.transition = ''; }, 180);
      } else {
        card.style.transform = '';
      }
    });
  });
})();
/* Haptic feedback: a short buzz on Android when a prayer is marked or a bead or option is tapped (iPhone ignores it) */
function buzz(ms){ try{ if(navigator.vibrate) navigator.vibrate(ms); }catch(e){} }
document.addEventListener('click', (e)=>{
  if(e.target.closest('.tasbeeh-tap, .bulk-btn, .quiz-opt, .bm-btn, .switch, .lang-opt')) buzz(8);
}, true);
/* Fill and empty motion: a short window after any status change, so the dots, cards and calendar cells animate */
let pendTimer = null;
function markStatusChange(){
  document.body.classList.add('pop-pending');
  clearTimeout(pendTimer);
  pendTimer = setTimeout(()=>document.body.classList.remove('pop-pending'), 520);
}
document.addEventListener('click', (e)=>{
  if(e.target.closest('.dot-btn, .bulk-btn, .aad-status-btn, .roza-mini, #duaSochBtn, #duaAmalBtn')) markStatusChange();
}, true);
function cycleStatus(d, prayer){
  buzz(12);
  document.body.classList.add('pop-pending');
  setTimeout(()=>document.body.classList.remove('pop-pending'), 450);
  const k = statusKey(d, prayer);
  const cur = state.status[k];
  const next = cur===undefined ? 'green' : cur==='green' ? 'yellow' : cur==='yellow' ? 'red' : undefined;
  if(next===undefined) delete state.status[k]; else state.status[k]=next;
  saveState();
}
function getStatus(d, prayer){ return state.status[statusKey(d,prayer)]; }
/* Nafil marking (off by default, turned on in Settings): only "prayed" (green) or "not prayed" (red).
   Stored next to the Farz marks, but every statistic and streak still counts only the five Farz. */
const NAFIL_KEYS = ['ishraq','chaast','awwabin','tahajjud','tihai'];
const NAFIL_NAMES = { ishraq:'Ishraq', chaast:'Chaast', awwabin:'Awwabin', tahajjud:'Tahajjud', tihai:"Du'a Qubooliyat" };
function nafilOn(){ return !!state.nafilMark; }
function markToast(prayer, want, cleared){
  const isNafil = NAFIL_KEYS.includes(prayer);
  const label = isNafil ? NAFIL_NAMES[prayer] : prayer.charAt(0).toUpperCase()+prayer.slice(1);
  showToast(label + ': ' + (cleared ? 'Clear ho gaya' : isNafil ? (want==='green' ? 'Padh Li' : 'Nahi Padhi') : NAMAZ_STATUS_LABEL[want]));
}

/* ============================================================
   THEME
   ============================================================ */
function currentPrayerKey(){
  const now = new Date();
  const sched = buildSchedule(now);
  for(let i=0;i<sched.length;i++){
    if(now >= sched[i].start && now < sched[i].end) return sched[i].key;
  }
  return 'isha';
}
function setThemeAttr(next){ document.documentElement.setAttribute('data-theme', next); } // replaced by the motion block below
function applyTheme(){
  let name;
  if(state.theme==='auto'){ const h = new Date().getHours(); name = (h>=6 && h<18) ? 'light' : 'dark'; }
  else if(state.theme==='waqti'){ const key = currentPrayerKey(); name = (PRAYER_META[key] && PRAYER_META[key].waqt) || 'waqt-dark'; }
  else name = state.theme;
  setThemeAttr(name);
  applyPalette(name);
  document.querySelectorAll('.theme-row button').forEach(b=>b.classList.remove('active'));
  document.getElementById('theme'+state.theme.charAt(0).toUpperCase()+state.theme.slice(1)).classList.add('active');
}

/* ---- Colour palettes (accent + tinted surfaces). Styles live in styles.css; this only picks one. ---- */
const PALETTES = [
  { k:'default', n:'Original', sw:['#3a9bd9','#16202f'] },
  { k:'emerald', n:'Zumurrud', sw:['#3fb97a','#12211b'] },
  { k:'rose',    n:'Gulaab',   sw:['#e0698d','#25151d'] },
  { k:'gold',    n:'Sunehri',  sw:['#d4a72c','#201a10'] },
  { k:'violet',  n:'Binafsha', sw:['#9b82e8','#1b1530'] },
  { k:'ocean',   n:'Samundar', sw:['#2cb5c9','#0f242b'] },
  { k:'graphite',n:'Raakh',    sw:['#b8bfcc','#1b1b1b'] }
];
const LIGHT_THEMES = ['light','waqt-morning','waqt-bright','waqt-dim'];
/* text colour that is readable on the current accent: dark or white, whichever has the higher contrast */
function applyOnAccent(){
  const root = document.documentElement, probe = document.createElement('i'); probe.style.color = getComputedStyle(root).getPropertyValue('--accent'); document.body.appendChild(probe);
  const m = getComputedStyle(probe).color.match(/[\d.]+/g); probe.remove(); if(!m) return;
  const f = v=>{ v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }, L = .2126 * f(+m[0]) + .7152 * f(+m[1]) + .0722 * f(+m[2]);
  root.style.setProperty('--onAccent', (L + .05) / .05 > 1.05 / (L + .05) ? '#08131c' : '#ffffff'); // dark ink if it beats white
}
function applyPalette(name){
  const root = document.documentElement, pal = (PALETTES.find(p=>p.k===state.palette) || PALETTES[0]).k;
  if(pal === 'default') root.removeAttribute('data-palette'); else root.setAttribute('data-palette', pal);
  root.setAttribute('data-tone', LIGHT_THEMES.includes(name) ? 'light' : 'dark');
  root.setAttribute('data-mode', state.theme === 'waqti' ? 'ambient' : 'fixed');
  document.querySelectorAll('#palRow .pal').forEach(b=>b.classList.toggle('active', b.dataset.k === pal));
  requestAnimationFrame(()=>{ try{ const m = document.querySelector('meta[name=theme-color]'); if(m) m.content = getComputedStyle(root).getPropertyValue('--bg').trim() || m.content; }catch(e){} try{ applyOnAccent(); }catch(e){} });
}
(function(){
  const row = document.getElementById('palRow'); if(!row) return;
  row.innerHTML = PALETTES.map(p=>`<button type="button" class="pal" data-k="${p.k}" style="--sw:${p.sw[0]};--sw2:${p.sw[1]}" aria-label="${p.n}" title="${p.n}"></button>`).join('');
  row.onclick = e=>{ const b = e.target.closest('.pal'); if(!b) return; state.palette = b.dataset.k; saveState(); applyTheme(); };
})();
document.getElementById('themeLight').onclick=()=>{state.theme='light';saveState();applyTheme();};
document.getElementById('themeDark').onclick=()=>{state.theme='dark';saveState();applyTheme();};
document.getElementById('themeAuto').onclick=()=>{state.theme='auto';saveState();applyTheme();};
document.getElementById('themeWaqti').onclick=()=>{state.theme='waqti';saveState();applyTheme();};
applyTheme();
setInterval(applyTheme, 30000);

function setTimeFormat(f){ state.timeFormat = f; saveState(); renderHome(); renderCalendar(); }

/* ============================================================
   STREAK TRACKER, consecutive days with all 5 Farz prayed on time
   ============================================================ */
function isAllFiveGreen(d){
  return FIVE.every(p=> getStatus(d,p)==='green');
}
const NAMAZ_STATUS_LABEL = { green:'Padh Li', yellow:'Qaza Padhi', red:'Baaki Hai' };
let toastTimer = null;
/* A small icon tells the kind of message at a glance; picked from the text unless given */
function toastIcon(msg){
  const m = String(msg);
  if(/🎉|Mashallah/i.test(m)) return '';
  if(/Clear ho gaya|hata diya|hata di|removed|cleared/i.test(m)) return '↺';
  if(/Pasandeeda mein|favourite/i.test(m)) return '★';
  if(/Nishaan|Bookmark/i.test(m)) return '🔖';
  if(/Baaki Hai|Pending/i.test(m)) return '⏳';
  if(/Qaza Padhi/i.test(m)) return '〰';
  if(/nahi ho sak|nahi mil|Could not|not found|block/i.test(m)) return '⚠️';
  if(/Azaan/i.test(m)) return '🔊';
  return '✓';
}
function showToast(msg, ic){
  let el = document.getElementById('appToast');
  if(!el){
    el = document.createElement('div');
    el.id = 'appToast';
    el.className = 'app-toast';
    document.body.appendChild(el);
  }
  const icon = ic === undefined ? toastIcon(msg) : ic;
  el.innerHTML = icon ? '<span class="t-ic"></span><span class="t-msg"></span>' : '<span class="t-msg"></span>';
  if(icon) el.querySelector('.t-ic').textContent = icon;
  el.querySelector('.t-msg').textContent = msg;
  /* Sit just above whichever bottom bar is on screen: a detail's action bar, or the main tab bar */
  const detailOpen = document.getElementById('detailOverlay').classList.contains('active');
  const bar = detailOpen ? document.querySelector('#detailOverlay .pn-bar') : document.getElementById('tabbar');
  const barH = bar && bar.offsetParent !== null ? bar.offsetHeight : 0;
  el.style.bottom = (barH + 14) + 'px';
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=> el.classList.remove('show'), 2100);
}
function computeStreak(){
  const today = new Date(); today.setHours(0,0,0,0);
  let current = 0;
  // today counts only once all 5 are already marked green; otherwise start counting from yesterday
  let cursor = isAllFiveGreen(today) ? today : new Date(today.getTime()-86400000);
  while(isAllFiveGreen(cursor)){
    current++;
    cursor = new Date(cursor.getTime()-86400000);
  }
  // scan back up to ~2 years to find the best-ever streak
  let best = current, run = 0;
  let d = new Date(today);
  for(let i=0;i<730;i++){
    if(isAllFiveGreen(d)){ run++; if(run>best) best = run; }
    else{ run = 0; }
    d = new Date(d.getTime()-86400000);
  }
  return { current, best };
}

/* ============================================================
   TAB NAVIGATION
   ============================================================ */
document.querySelectorAll('.tab-btn').forEach(btn=>{
  btn.onclick=()=>{
    document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-'+btn.dataset.tab).classList.add('active');
    if(btn.dataset.tab==='calendar') renderCalendar();
    if(btn.dataset.tab==='explore'){ renderGoalMini(); renderContinueCard(); const dws=document.getElementById('dailyWordSub'); if(dws){ try{ dws.textContent = KHAAS_SHABD[dailyWordIndex(0)].tr; }catch(e){} } const qs=document.getElementById('quranSub'); if(qs) qs.textContent = `Page ${quranLastPage()}/${QURAN_PAGE_COUNT}`; }
    if(btn.dataset.tab==='more'){ updateQazaBadge(); renderGoalCard(); }
    moveTabIndicator();
  };
});

/* Bottom bar: slides the highlight under the active tab */
function moveTabIndicator(){
  const a = document.querySelector('#tabbar .tab-btn.active');
  const ind = document.getElementById('tabInd');
  if(!a || !ind) return;
  ind.style.width = a.offsetWidth + 'px';
  ind.style.transform = `translateX(${a.offsetLeft}px)`;
}
requestAnimationFrame(moveTabIndicator);
window.addEventListener('resize', moveTabIndicator);

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
/* Home extras (missed-prayer bar, Ramzan bar) wait a little after the app opens, so the prayer list comes first */
var UI_OPEN_AT = Date.now(), UI_GATE_SEC = 20;
function uiGateOpen(sec){ return Date.now() - UI_OPEN_AT >= (sec || UI_GATE_SEC) * 1000; }
setTimeout(()=>{ try{ renderHome(); }catch(e){} }, UI_GATE_SEC * 1000 + 100);
function renderMissedBar(viewDate, isToday, sched, now){
  const old = document.getElementById('missedBar'); if(old) old.remove();
  if(!isToday || !uiGateOpen()) return;
  const dk = dayKey(viewDate); if(state.missedOff && state.missedOff[dk]) return;
  const miss = sched.filter(p=> FIVE.includes(p.key) && now >= p.end && getStatus(viewDate, p.key) === undefined);
  if(!miss.length) return;
  const bar = document.createElement('div'); bar.id = 'missedBar'; bar.className = 'missed-bar';
  const open = miss.length === 1 || !!window.__missedOpen;   /* several missed: one collapsed line until opened */
  bar.innerHTML = `<div class="mb-head"><b>⏰ ${miss.length === 1 ? miss[0].name + ' ka waqt nikal gaya' : miss.length + ' namazon ka waqt nikal gaya'}</b><span>${miss.length > 1 ? `<button type="button" class="mb-tog" aria-expanded="${open}">${open ? '▴' : '▾ ' + L({rur:'Dekhein', en:'View'})}</button>` : ''}<button type="button" class="mb-x" aria-label="Aaj ke liye chhupayein">✕</button></span></div>`
    + (open ? miss : []).map(p=>`<div class="mb-row"><span>${PRAYER_META[p.key] ? PRAYER_META[p.key].icon : ''} ${p.name}</span><span class="mb-btns"><button type="button" class="mb-ok" data-k="${p.key}">✓ Padh li</button><button type="button" class="mb-qz" data-k="${p.key}">＋ Qaza mein</button></span></div>`).join('');
  bar.onclick = e=>{
    const b = e.target.closest('button'); if(!b) return;
    if(b.classList.contains('mb-tog')){ window.__missedOpen = !window.__missedOpen; renderMissedBar(viewDate, isToday, sched, now); return; }
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
  document.getElementById('timesList').prepend(bar);
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
  const dcNode = document.getElementById('dailyCard'); if(dcNode && dcNode.parentElement === listEl) listEl.removeChild(dcNode);   // keep the daily card through the redraw
  listEl.innerHTML = '';
  listEl.classList.toggle('namaz-mode', state.namazMode);

  renderMissedBar(viewDate, isToday, sched, now);
  if(typeof renderDailyCard === 'function') renderDailyCard();
  if(typeof renderRamzanBar === 'function') renderRamzanBar();
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

  if(dcNode) listEl.appendChild(dcNode);   // the daily card is the last item of the scrolling list, so it can never squeeze the prayer rows
  if(isToday){
    const liveKey = (isIftarActive && 'iftar') || (isGhurubActive && 'ghurub') || (currentIdx>=0 && sched[currentIdx].key) || null;
    if(liveKey && liveKey !== lastLiveKey){
      liveCenterKey = liveKey; liveUserScrolled = false;
      centerLiveRow(instantScroll);
      /* layout may still be settling (fonts, tab just shown): settle again unless the person has scrolled themselves */
      [120, 500, 1200].forEach(ms=> setTimeout(()=>{ if(!liveUserScrolled) centerLiveRow(true); }, ms));
    }
    if(liveKey && lastLiveKey && liveKey !== lastLiveKey){ const nr = listEl.querySelector(`.time-row[data-key="${liveKey}"]`); if(nr){ nr.classList.add('row-in'); setTimeout(()=>nr.classList.remove('row-in'), 900); } }
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
  if(typeof ramzanReminders === 'function') ramzanReminders(operatingDate(now)).forEach(r=>{
    const delay = r.at - now; if(delay <= 0 || delay > 24*3600000) return;
    notifTimers.push(setTimeout(()=>{ try{ showNotif(r.title, { body:r.body, icon:'icons/icon-192.png', tag:'waqt24-' + r.key }); }catch(e){} }, delay));
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

/* ============================================================
   MORE TAB - Dua & Hadees data + detail overlay
   ============================================================ */
/* (data moved to data.js: DUAS, HADEES) */

/* ============================================================
   BOOKMARKS (Mere Pasandeeda) + IMAGE SHARE CARDS
   ============================================================ */
function bmList(){ if(!Array.isArray(state.bookmarks)) state.bookmarks = []; return state.bookmarks; }
function isBookmarked(k){ return bmList().includes(k); }
function toggleBookmark(k){
  const l = bmList(); const i = l.indexOf(k);
  if(i>=0) l.splice(i,1); else l.push(k);
  saveState();
  return i<0;
}
function bmBtn(k, extra){
  const on = isBookmarked(k);
  return `<button class="bm-btn ${on?'on':''}" data-bm="${k.replace(/"/g,'&quot;')}" ${extra||''} title="Pasandeeda">${on?'★':'☆'}</button>`;
}

/* Generic Prev/Next nav for "list -> detail" screens. Whatever renders the
   list calls setNavCtx(list, idx, openFn) right before opening a detail item;
   the detail screen then drops in pnBarHtml() + calls wirePnBar(). */
let __navCtx = null;
function setNavCtx(list, idx, openFn, cat){ __navCtx = { list, idx, openFn, cat }; }
/* Next category after the current item's category, or null */
function catNextKey(){
  const c = __navCtx && __navCtx.cat; if(!c) return null;
  const cur = __navCtx.list[__navCtx.idx];
  const ci = c.cats.indexOf(c.catOf(cur));
  return (ci>=0 && ci<c.cats.length-1) ? c.cats[ci+1] : null;
}
function openNextCategory(){
  const c = __navCtx.cat, k = catNextKey(); if(!k) return;
  const items = c.all.filter(x=>c.catOf(x)===k).sort(c.sortFn);
  const openFn = __navCtx.openFn;
  setNavCtx(items, 0, openFn, c);
  openFn(items[0]);
}
function pnBarHtml(){
  if(!__navCtx) return '';
  const { list, idx, cat } = __navCtx;
  const sec = cat && cat.sec ? (isEn() ? cat.sec.en : cat.sec.ur) : '';
  const last = idx>=list.length-1;
  if(!last){
    const rtl = !!__navCtx.rtl;
    return `<div class="pn-bar${rtl?' rtl':''}">
    <button class="pn-btn pn-prev" id="pnPrevBtn" ${idx<=0?'disabled':''}>${rtl ? `${isEn() ? 'Previous' : 'Pichla'}<span class="pn-ic">➡️</span>` : `<span class="pn-ic">⬅️</span>${isEn() ? 'Previous' : 'Pichla'}`}</button>
    <span class="pn-pos">${idx+1} / ${list.length}</span>
    <button class="pn-btn pn-next" id="pnNextBtn">${rtl ? `<span class="pn-ic">⬅️</span>${isEn() ? 'Next' : 'Agla'}` : `${isEn() ? 'Next' : 'Agla'}<span class="pn-ic">➡️</span>`}</button>
  </div>`;
  }
  /* last item of a section: exactly two buttons, back to the section and the next category */
  const backLbl = isEn() ? `‹ Back to ${sec || 'list'}` : `‹ ${sec ? sec + ' mein' : 'List mein'} wapas`;
  const nextLbl = isEn() ? 'Next category ›' : 'Agli category ›';
  const hasNext = !!catNextKey();
  return `<div class="pn-end">
    <button class="pn-btn pn-back" id="pnBackBtn"><span class="pn-ic">📂</span>${backLbl}</button>
    ${hasNext ? `<button class="pn-btn pn-nextcat" id="pnNextCatBtn">${nextLbl}<span class="pn-ic">⏭️</span></button>` : ''}
  </div>`;
}
/* Category settings for the in-section navigation (end-of-section buttons) */
function duaNavCat(){
  return { sec:{ur:"Du'a", en:"Duas"}, cats:[...new Set(DUAS.map(d=>d.cat))].sort((a,b)=>a.localeCompare(b)),
    catOf:d=>d.cat, all:DUAS, sortFn:(a,b)=>a.title.localeCompare(b.title) };
}
function hadeesNavCat(){
  return { sec:{ur:"Hadees", en:"Hadith"}, cats:[...new Set(HADEES.map(h=>h.cat))].sort((a,b)=>a.localeCompare(b)),
    catOf:h=>h.cat, all:HADEES, sortFn:(a,b)=>a.txt.localeCompare(b.txt) };
}
function aadaabNavCat(){
  return { sec:{ur:"Aadaab-e-Zindagi", en:"Aadaab-e-Zindagi"},
    cats:[...AADAAB_CATEGORIES].sort((a,b)=>a.label.localeCompare(b.label)).map(c=>c.id),
    catOf:t=>t.cat, all:AADAAB_TOPICS, sortFn:(a,b)=>AADAAB_TOPICS.indexOf(a)-AADAAB_TOPICS.indexOf(b) };
}
function qwordNavCat(){
  return { sec:{ur:"Qur'ani Alfaaz", en:"Quranic Words"}, cats:Object.keys(QWORD_GROUP_COLOR), catOf:qwordGroup, all:QURAN_WORDS,
    sortFn: qwordSortFn() };
}
/* Star and share sit inside the title card (top-right) so the card keeps its size */
function placeActionsInHead(){
  const act = document.querySelector('#detailBody > .detail-actions');
  const head = document.querySelector('#detailBody > .aad-head');
  if(act && head && !head.contains(act)){ act.classList.add('in-head'); head.appendChild(act); }
}
function wirePnBar(){
  placeActionsInHead();
  if(!__navCtx) return;
  const { list, idx, openFn } = __navCtx;
  /* One-time hint that the reader can swipe between items */
  try{
    if(list.length>1 && !localStorage.getItem('waqt24_swipeHint')){
      localStorage.setItem('waqt24_swipeHint','1');
      setTimeout(()=>showToast(isEn() ? 'Swipe left or right to move between items' : 'Left ya right swipe karke aage-peeche jaayein'), 400);
    }
  }catch(e){}
  const prevBtn = document.getElementById('pnPrevBtn');
  const nextBtn = document.getElementById('pnNextBtn');
  const go = (newIdx)=>{ setNavCtx(list, newIdx, openFn, __navCtx.cat); openFn(list[newIdx], newIdx); };
  if(prevBtn) prevBtn.onclick = ()=>{ if(idx>0) go(idx-1); };
  if(nextBtn) nextBtn.onclick = ()=>{ if(idx<list.length-1) go(idx+1); };
  const backBtn = document.getElementById('pnBackBtn');
  if(backBtn) backBtn.onclick = ()=> closeModal();
  const nextCatBtn = document.getElementById('pnNextCatBtn');
  if(nextCatBtn) nextCatBtn.onclick = ()=> openNextCategory();
}
/* Swipe left/right in an open detail, and the Agla/Pichla buttons, slide the card like Instagram or Facebook.
   Both go through slideDetail(), so the animation is the same whichever way the reader moves. */
(()=>{
  const body = document.getElementById('detailBody');
  const ease = 'transform .2s ease, opacity .2s ease';
  let bypass = false, busy = false;
  // dir -1: moving to the next item (card leaves to the left); 1: previous item
  window.slideDetail = (dir, change, yFrac)=>{
    if(busy) return; busy = true;
    if(__navCtx && (__navCtx.rtl || __navCtx.turn)) return pageTurn(dir, change, yFrac);
    body.style.transition = ease;
    body.style.transform = `translateX(${dir * 60}px)`;
    body.style.opacity = '0';
    setTimeout(()=>{
      change();
      body.style.transition = 'none';
      body.style.transform = `translateX(${dir * -60}px)`;
      void body.offsetWidth; // apply the start position before animating back in
      body.style.transition = ease;
      body.style.transform = 'none';
      body.style.opacity = '1';
      // a timer, not requestAnimationFrame: frames pause in a background tab, which would leave busy stuck
      setTimeout(()=>{ busy = false; }, 200);
    }, 200);
  };
  // Book-style page turn. Only the page moves: a copy of the current page sits on top and curls away,
  // while the next page (already preloaded) is rendered underneath, so buttons and text never jump.
  // yFrac is where the finger started on the page: top half curls from the top corner, bottom half from the bottom.
  const pageTurn = (dir, change, yFrac)=>{
    const img = body.querySelector('.quran-page-img'), sheet = !img && body.querySelector('.tb-sheet');
    if(!img && !sheet){ change(); busy = false; return; }
    if(sheet){   /* Tarjuma book: a copy of the sheet is the leaf */
      const r = sheet.getBoundingClientRect(), leaf = document.createElement('div');
      leaf.className = 'page-leaf'; leaf.style.cssText = `left:${r.left}px; top:${r.top}px; width:${r.width}px; height:${r.height}px;`;
      const cp = sheet.cloneNode(true); cp.removeAttribute('id'); cp.style.margin = '0'; cp.style.width = '100%'; cp.style.boxSizing = 'border-box'; cp.style.boxShadow = 'none';
      leaf.appendChild(cp); leaf.insertAdjacentHTML('beforeend', '<i class="page-leaf-shade"></i>'); document.body.appendChild(leaf);
      setTimeout(change, 0); playPageSound();
      const y = (typeof yFrac === 'number') ? yFrac : 0.5, corner = y < 0.4 ? 'top' : y > 0.6 ? 'bottom' : 'center', tilt = corner === 'top' ? 12 : corner === 'bottom' ? -12 : 0;
      leaf.style.transformOrigin = `${dir > 0 ? 'right' : 'left'} ${corner}`; void leaf.offsetWidth; leaf.classList.add('turning');
      leaf.style.transform = `perspective(1600px) rotateY(${dir * -108}deg) rotateZ(${dir * tilt}deg) translateY(${tilt * -1.2}px)`;
      leaf.style.setProperty('--shade-from', dir > 0 ? 'left' : 'right');
      setTimeout(()=>{ leaf.remove(); busy = false; }, 560); return;
    }
    const box = img.getBoundingClientRect();
    const nw = img.naturalWidth || box.width, nh = img.naturalHeight || box.height;
    const sc = Math.min(box.width / nw, box.height / nh);
    const r = { width: nw*sc, height: nh*sc, left: box.left + (box.width - nw*sc)/2, top: box.top + (box.height - nh*sc)/2 };
    const leaf = document.createElement('div');
    leaf.className = 'page-leaf';
    leaf.style.cssText = `left:${r.left}px; top:${r.top}px; width:${r.width}px; height:${r.height}px;`;
    leaf.innerHTML = `<img src="${img.currentSrc || img.src}" alt="" style="filter:${getComputedStyle(img).filter};background:${getComputedStyle(img).backgroundColor}">${(tn=>tn?`<i class="page-leaf-tint" style="background:${tn.style.background}"></i>`:'')(body.querySelector('.qtint'))}<i class="page-leaf-shade"></i>`;
    document.body.appendChild(leaf);
    // the next page renders underneath the leaf. Deferred by a tick: when this runs inside a button's click,
    // the browser ignores a second click() on that same button until the first one has finished.
    setTimeout(change, 0);
    playPageSound();
    const y = (typeof yFrac === 'number') ? yFrac : 0.5;
    const corner = y < 0.4 ? 'top' : y > 0.6 ? 'bottom' : 'center';
    const tilt = corner === 'top' ? 12 : corner === 'bottom' ? -12 : 0;
    leaf.style.transformOrigin = `${dir > 0 ? 'right' : 'left'} ${corner}`;
    void leaf.offsetWidth;
    leaf.classList.add('turning');
    leaf.style.transform = `perspective(1600px) rotateY(${dir * -108}deg) rotateZ(${dir * tilt}deg) translateY(${tilt * -1.2}px)`;
    leaf.style.setProperty('--shade-from', dir > 0 ? 'left' : 'right');
    // a timer, not an animation event: it still fires if the tab is hidden mid-turn
    setTimeout(()=>{ leaf.remove(); busy = false; }, 560);
  };
  // First or last item: a small nudge shows there is nothing further
  const nudge = (dir)=>{
    body.style.transition = 'transform .12s ease';
    body.style.transform = `translateX(${dir * -14}px)`;
    setTimeout(()=>{ body.style.transform = 'none'; }, 120);
  };
  // Agla/Pichla buttons: intercept the click, slide, then let the original handler run
  document.addEventListener('click', (e)=>{
    if(bypass) return;
    const b = e.target.closest('#pnNextBtn, #pnPrevBtn');
    if(!b) return;
    e.stopPropagation(); e.preventDefault();
    if(b.disabled) return;
    const rtl = !!(__navCtx && __navCtx.rtl);
    const fwd = b.id === 'pnNextBtn';
    slideDetail(rtl ? (fwd ? 1 : -1) : (fwd ? -1 : 1), ()=>{ bypass = true; b.click(); bypass = false; });
  }, true);
  body.addEventListener('touchstart', (e)=>{
    sxSkip = !!e.target.closest('input, textarea, select, .chips, .qword-tabs, .cat-tabs, .hscroll, [data-no-swipe], .quran-page-wrap.zoomed');
    sx = e.touches[0].clientX; sy = e.touches[0].clientY;
  }, { passive:true });
  body.addEventListener('touchend', (e)=>{
    if(sxSkip || !__navCtx || !document.getElementById('detailOverlay').classList.contains('active')) return;
    const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if(Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    const dir = dx < 0 ? -1 : 1;
    // Right-to-left (Qur'an): swiping right moves forward, like turning an Arabic book's page
    const forward = (__navCtx && __navCtx.rtl) ? dir > 0 : dir < 0;
    const b = document.getElementById(forward ? 'pnNextBtn' : 'pnPrevBtn');
    if(!b || b.disabled){ nudge(dir); return; }
    const pg = body.querySelector('.quran-page-img');
    let yFrac = 0.5;
    if(pg){ const pr = pg.getBoundingClientRect(); yFrac = (sy - pr.top) / Math.max(1, pr.height); }
    slideDetail(dir, ()=>{ bypass = true; b.click(); bypass = false; }, yFrac);
  }, { passive:true });
  let sx = 0, sy = 0, sxSkip = false;
})();
document.getElementById('detailBody').addEventListener('click', (e)=>{
  const b = e.target.closest('.bm-btn');
  if(!b) return;
  e.stopPropagation();
  const on = toggleBookmark(b.dataset.bm);
  b.classList.toggle('on', on);
  b.textContent = on ? '★' : '☆';
  showToast(on ? 'Pasandeeda mein add ho gaya' : 'Pasandeeda se hata diya');
  if(b.dataset.refresh) renderBookmarks();
}, true);
function bmResolve(k){
  const i = k.indexOf(':'); const t = k.slice(0,i), id = k.slice(i+1);
  if(t==='dua'){ const d = DUAS.find(x=>x.title===id); return d && { type:"Du'a", ar:'', title:d.title, sub:d.cat, open:()=>{ __navCtx=null; openDuaDetail(d); } }; }
  if(t==='hadees'){ const h = HADEES.find(x=>x.txt.slice(0,40)===id); return h && { type:'Hadees', ar:'', title:h.txt.length>70?h.txt.slice(0,70)+'…':h.txt, sub:h.src, open:()=>{ __navCtx=null; openHadeesDetail(h); } }; }
  if(t==='asma'){ const x = ASMA_UL_HUSNA.findIndex(n=>n.tr===id); return x>=0 && { type:'Asma-ul-Husna', ar:ASMA_UL_HUSNA[x].ar, title:id, sub:ASMA_UL_HUSNA[x].m, open:()=>renderNameDetail('asma', x) }; }
  if(t==='prophet'){ const x = PROPHET_NAMES.findIndex(n=>n.tr===id); return x>=0 && { type:'Muhammad ﷺ ke Naam', ar:PROPHET_NAMES[x].ar, title:id, sub:PROPHET_NAMES[x].m, open:()=>renderNameDetail('prophet', x) }; }
  if(t==='word'){ const x = KHAAS_SHABD.findIndex(n=>n.tr===id); return x>=0 && { type:'Khaas Shabd', ar:KHAAS_SHABD[x].ar, title:id, sub:KHAAS_SHABD[x].m, open:()=>{ __navCtx=null; renderShabdDetail(x, renderBookmarks); } }; }
  if(t==='qword'){ const w = QURAN_WORDS.find(n=>n.tr===id); return w && { type:'Qur’ani Alfaaz', ar:w.ar, title:id, sub:w.m, open:()=>{ __navCtx=null; openQuranWordDetail(w); } }; }
  if(t==='aadaab'){ const a = AADAAB_TOPICS.find(n=>n.id===id); return a && { type:'Aadaab-e-Zindagi', ar:'', title:a.title, sub:aadaabCatInfo(a.cat).label, open:()=>{ __navCtx=null; openAadaabDetail(a); } }; }
  return null;
}
function renderBookmarks(){
  document.getElementById('detailTitle').textContent = 'Mere Pasandeeda';
  const items = bmList().map(k=>({k, r:bmResolve(k)})).filter(x=>x.r);
  const body = document.getElementById('detailBody');
  const types = [...new Set(items.map(x=>x.r.type))];
  body.innerHTML = notesSectionHtml() + (!items.length ? `<div class="empty-state">Abhi tak kuch pasandeeda nahi.<br>Kisi bhi dua, hadees, naam ya lafz par ☆ dabayein.</div>` : types.map(t=>`
    <div class="dw-section">
      <div class="dw-section-title"><span>${t}</span><span class="dw-count">${items.filter(x=>x.r.type===t).length}</span></div>
      ${items.filter(x=>x.r.type===t).map(x=>{ const nn = notesForBm(x.k); return `<div class="dw-row" data-k="${x.k.replace(/"/g,'&quot;')}">
        ${x.r.ar ? `<div class="ar">${x.r.ar}</div>` : ''}
        <div class="info"><div class="tr">${x.r.title}</div><div class="m">${x.r.sub}</div>${nn.length ? `<div class="bm-note">📝 ${noteEsc(nn[0].text).slice(0, 90)}${nn.length > 1 ? ' (+' + (nn.length - 1) + ')' : ''}</div>` : ''}</div>
        <button type="button" class="bm-btn bm-note-btn ${nn.length ? 'on' : ''}" data-nt="${x.k.replace(/"/g,'&quot;')}" title="Note">📝</button>
        ${bmBtn(x.k, 'data-refresh="1"')}
      </div>`; }).join('')}
    </div>`).join(''));
  wireNotesSection(renderBookmarks);
  body.querySelectorAll('.dw-row[data-k]').forEach(el=>{
    el.onclick = ()=>{ const r = bmResolve(el.dataset.k); if(r) r.open(); };
  });
  body.querySelectorAll('[data-nt]').forEach(b=>{
    b.onclick = e=>{ e.stopPropagation(); const k = b.dataset.nt, r = bmResolve(k); openNoteBox({ bm:k, title:r ? r.title : '' }, renderBookmarks); };
  });
}

async function shareCard(cfg){
  try{ await document.fonts.load('700 60px "Scheherazade New"', cfg.arabic || 'ا'); }catch(e){}
  const W = 1080, PAD = 84, MAXW = W - PAD*2;
  const SANS = '"Segoe UI", system-ui, -apple-system, Roboto, sans-serif';
  const AR = '"Scheherazade New", "Noto Naskh Arabic", serif';
  const meas = document.createElement('canvas').getContext('2d');
  function wrap(text, font, dir){
    meas.font = font; meas.direction = dir || 'ltr';
    const out = [];
    String(text).split('\n').forEach(par=>{
      let line = '';
      par.split(/\s+/).filter(Boolean).forEach(w=>{
        const t = line ? line+' '+w : w;
        if(meas.measureText(t).width > MAXW && line){ out.push(line); line = w; } else line = t;
      });
      out.push(line);
    });
    return out;
  }
  const blocks = [];
  if(cfg.kind) blocks.push({ lines:[cfg.kind.toUpperCase()], font:`700 30px ${SANS}`, color:'#a9782f', lh:44, gap:34 });
  if(cfg.arabic){
    let size = 84, lines;
    do{ lines = wrap(cfg.arabic, `700 ${size}px ${AR}`, 'rtl'); size -= 4; }while(lines.length>6 && size>40);
    size += 4;
    blocks.push({ lines, font:`700 ${size}px ${AR}`, color:'#2a2117', lh:Math.round(size*1.7), gap:30, dir:'rtl' });
  }
  if(cfg.title) blocks.push({ lines:wrap(cfg.title, `800 54px ${SANS}`), font:`800 54px ${SANS}`, color:'#a9782f', lh:70, gap:22 });
  if(cfg.sub) blocks.push({ lines:wrap(cfg.sub, `italic 36px ${SANS}`), font:`italic 36px ${SANS}`, color:'#7a6d5a', lh:52, gap:22 });
  if(cfg.body) blocks.push({ lines:wrap(cfg.body, `500 42px ${SANS}`), font:`500 42px ${SANS}`, color:'#2a2117', lh:64, gap:22 });
  if(cfg.foot) blocks.push({ lines:wrap(cfg.foot, `500 30px ${SANS}`), font:`500 30px ${SANS}`, color:'#7a6d5a', lh:44, gap:10 });
  let H = PAD*2 + 90;
  blocks.forEach(b=>{ H += b.lines.length*b.lh + b.gap; });
  H = Math.max(H, 1080);
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0,0,0,H); g.addColorStop(0,'#f8f2e6'); g.addColorStop(1,'#efe4d0');
  ctx.fillStyle = g; ctx.fillRect(0,0,W,H);
  ctx.strokeStyle = '#c9a24f'; ctx.lineWidth = 6; ctx.strokeRect(28,28,W-56,H-56);
  ctx.strokeStyle = '#e2cf9f'; ctx.lineWidth = 2; ctx.strokeRect(44,44,W-88,H-88);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const contentH = blocks.reduce((a,b)=> a + b.lines.length*b.lh + b.gap, 0);
  let y = Math.max(PAD + 30, Math.round((H - contentH)/2) - 20);
  blocks.forEach(b=>{
    ctx.font = b.font; ctx.fillStyle = b.color; ctx.direction = b.dir || 'ltr';
    b.lines.forEach(l=>{ ctx.fillText(l, W/2, y + b.lh/2); y += b.lh; });
    y += b.gap;
  });
  ctx.direction = 'ltr'; ctx.font = `700 30px ${SANS}`; ctx.fillStyle = '#a9782f';
  ctx.fillText('Waqt24  •  iam-zain.github.io/waqt24', W/2, H - PAD - 20);
  const blob = await new Promise(r=> c.toBlob(r, 'image/png'));
  if(!blob){ showToast('Image nahi ban saki'); return; }
  const file = new File([blob], 'waqt24-card.png', { type:'image/png' });
  try{
    if(navigator.canShare && navigator.canShare({ files:[file] })){
      await navigator.share({ files:[file], title:'Waqt24' });
      return;
    }
  }catch(e){ if(e && e.name==='AbortError') return; }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'waqt24-card.png';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(url), 2000);
  showToast('Image download ho gayi');
}
/* Every card share button asks first: Image (card picture) or Text (plain words) */
function openCardShareChooser(cfg){
  const plain = [cfg.kind, cfg.arabic, cfg.title, cfg.sub, cfg.body, cfg.foot].filter(Boolean).join('\n\n');
  document.getElementById('shareChooserImg').onclick = ()=>{ closeModal(); shareCard(cfg); };
  document.getElementById('shareChooserTxt').onclick = ()=>{ closeModal(); shareText(plain + '\n\nWaqt24: iam-zain.github.io/waqt24'); };
  document.getElementById('shareChooser').classList.add('active');
  pushModalState();
}

let duaCat='__all__', duaSearch='';
let hadeesFilter='All', hadeesSearch='';
/* Icon and accent colour per dua category; chips and cards share the Aadaab-e-Zindagi look */
/* One colour per category (Quranic green is reserved for its label) */
const DUA_CAT_META = { 'Rabbana':['🤲','#2fb6b0'], 'Roz Marra':['🛏️','#3a4d8f'], 'Khana':['🍽️','#c0563f'], 'Safar':['🧭','#3f8fe0'], 'Masjid':['🕌','#9b6fd6'], 'Pareshani':['🌧️','#e0893f'], 'Ghar':['🏠','#d6708f'], 'Ramzan':['🌙','#c79a2e'] };
function duaMeta(cat){ return DUA_CAT_META[cat] || ['🤲','#5b8def']; }
/* Rabbana duas each get an icon for their theme (the theme is the third tag) */
const RABBANA_THEME_ICON = { 'Qabooliyat':'🙏', 'Islam':'☪️', 'Duniya Aur Aakhirat':'🌅', 'Sabr':'🏔️', 'Tauba':'💧', 'Hifazat':'🛡️', 'Maghfirat':'🌿', 'Hidayat':'💡', 'Qiyamat':'⏳', 'Iman':'☝️', 'Nek Log':'💫', 'Jahannam':'🔥', 'Rizq':'🍞', 'Sohbat':'👥', 'Haq':'⚖️', 'Ilm-e-Ilahi':'👁️', 'Namaz':'📿', 'Walidain':'👪', 'Aulad':'👶', 'Rehmat':'💞', 'Shukr':'🌸', 'Jannat':'🌳', 'Ukhuwwat':'🤝', 'Tawakkul':'🌱', 'Noor':'✨' };
function duaIcon(d){
  if(d.cat==='Rabbana' && d.tags && RABBANA_THEME_ICON[d.tags[2]]) return RABBANA_THEME_ICON[d.tags[2]];
  return duaMeta(d.cat)[0];
}
function isQuranDua(d){ return /^Qur/.test(d.ref || ''); }
/* English-or-Roman-Urdu text for content. Keys (titles, names) used for bookmarks and status stay in Roman Urdu. */
function isEn(){ return state.lang==='en'; }
function dTitle(d){ return isEn() && d.ent ? d.ent : d.title; }
function dMean(d){ return isEn() && d.enm ? d.enm : d.meaning; }
function dInfo(d){ return isEn() && d.eninfo ? d.eninfo : d.info; }
function hTxt(h){ return isEn() && h.en ? h.en : h.txt; }
function wMean(w){ return isEn() && w.en ? w.en : w.m; }
function wEx(w){ return isEn() && w.exen ? w.exen : w.exm; }
/* Myth-buster item in the current language (Roman Urdu or English) */
function mL(m){ return isEn() && m.enq ? {q:m.enq, optA:m.enA, optB:m.enB, explain:m.enExplain} : m; }
/* Aadaab topic in the current language: English fields replace Roman Urdu ones when the language is English */
function aL(t){
  if(!(isEn() && t.en)) return t;
  const o = Object.assign({}, t, t.en);
  /* guide sections keep their original icon; only heading and items come from the English text */
  if(t.guide && t.en.sections) o.sections = t.sections.map((s,i)=>Object.assign({}, s, t.en.sections[i] || {}));
  return o;
}
function sMean(w){ return isEn() && w.en ? w.en : w.m; }
function sEx(w){ return isEn() && w.exen ? w.exen : w.ex; }
/* Quiz item as [question, options, correct, category]; English version when the language is English */
function quizLocal(item){ return (isEn() && item[4]) ? [item[4].q, item[4].o, item[2], item[3]] : item; }
function renderMoreDua(){
  document.getElementById('detailTitle').textContent="Du'a";
  const body = document.getElementById('detailBody');
  body.innerHTML = `
    <div style="text-align:center; padding:10px 14px 6px;">
      <div style="font-size:12.5px; color:var(--sub);">Quran aur Sunnah ki duayein, Arabic, transliteration, Roman Urdu tarjuma aur hawale ke saath.</div>
    </div>
    <div class="search-bar-wrap">
      <input id="duaSearchInput" placeholder="Dua dhoondhiye...">
      <button id="duaSearchClear" class="search-clear-btn">✕</button>
    </div>
    <div class="chip-row" id="duaCatRow" style="padding:0 0 10px;"></div>
    <div id="duaList"></div>
  `;
  const catRow = body.querySelector('#duaCatRow');
  const allChip = document.createElement('div');
  allChip.className = 'chip' + (duaCat==='__all__' ? ' prayed' : '');
  allChip.textContent = `🌐 Sabhi (${DUAS.length})`;
  allChip.onclick = ()=>{ duaCat='__all__'; renderMoreDua(); };
  catRow.appendChild(allChip);
  /* Chips in one alphabetical list. Qur'ani Dua collects every Quran-sourced dua across categories (Rabbana included) */
  const chipDefs = [...new Set(DUAS.map(d=>d.cat))].map(cat=>({ key:cat, name:cat, ic:duaMeta(cat)[0], count:DUAS.filter(d=>d.cat===cat).length }));
  chipDefs.push({ key:'__quran__', name:"Qur'ani Dua", ic:'📖', count:DUAS.filter(d=>isQuranDua(d)).length });
  chipDefs.sort((a,b)=>a.name.localeCompare(b.name)).forEach(c=>{
    const chip = document.createElement('div');
    chip.className = 'chip' + (duaCat===c.key ? ' prayed' : '');
    chip.textContent = `${c.ic} ${c.name} (${c.count})`;
    chip.onclick = ()=>{ duaCat = c.key; renderMoreDua(); };
    catRow.appendChild(chip);
  });
  document.getElementById('duaSearchInput').value = duaSearch;
  wireLiveSearch('duaSearchInput', 'duaSearchClear', renderDuaList, v=>{ duaSearch = v; });
  renderDuaList();
}
function renderDuaList(){
  const wrap = document.getElementById('duaList');
  const q = duaSearch.trim().toLowerCase();
  const filtered = DUAS.filter(d=>
    (duaCat==='__all__' || (duaCat==='__quran__' ? isQuranDua(d) : d.cat===duaCat)) &&
    (d.title+' '+d.cat+' '+(d.tags||[]).join(' ')+' '+d.translit+' '+d.meaning).toLowerCase().includes(q)
  ).sort((a,b)=>a.title.localeCompare(b.title));
  if(!filtered.length){ wrap.innerHTML = `<div class="empty-state">Koi dua nahi mili.</div>`; return; }
  wrap.innerHTML = filtered.map((d,i)=>{
    const ic = duaIcon(d), color = duaMeta(d.cat)[1];
    const st = duaStatus(d.title);
    return `<div class="aad-card status-${st||'none'}" data-i="${i}" style="--aad-c:${color};">
      <div class="aad-ic">${ic}</div>
      <div class="aad-info">
        <div class="aad-title">${dTitle(d)}</div>
        <div class="aad-tags">${duaTagChips(d)}</div>
        <div class="aad-cat-lbl">${duaCatLabel(d)}</div>
      </div>
      ${st==='amal' ? '<div class="aad-status-badge amal">✅</div>' : st==='soch' ? '<div class="aad-status-badge soch">⏳</div>' : ''}
      <div class="chev">›</div>
    </div>`;
  }).join('');
  wrap.querySelectorAll('.aad-card').forEach(el=>{
    el.onclick = ()=>{
      const i = parseInt(el.dataset.i);
      setNavCtx(filtered, i, openDuaDetail, duaNavCat());
      openDuaDetail(filtered[i]);
    };
  });
}

/* Same tag chip look as Aadaab-e-Zindagi (.aad-tag); duas without explicit tags show their category */
/* Tags that just repeat the category name are dropped; the category is already shown on its own line */
function duaTagChips(d){
  const tags = (d.tags || []).filter(x=>x!==d.cat && x!=='Quranic').sort((a,b)=>a.localeCompare(b));
  return tags.map(x=>`<span class="aad-tag">${x}</span>`).join('');
}
/* Category line on a dua card; Quran-sourced duas show a green "Quranic" beside it */
function duaCatLabel(d){
  return `${d.cat}${isQuranDua(d) ? ' <span class="dua-quran-lbl">• Quranic</span>' : ''}`;
}
/* Memorisation status per dua ('soch' = still to memorise, 'amal' = memorised), same pattern as Aadaab */
function duaStatus(title){ return (state.duaStatus && state.duaStatus[title]) || null; }
function setDuaStatus(title, val){
  if(!state.duaStatus) state.duaStatus = {};
  if(duaStatus(title)===val){ delete state.duaStatus[title]; } // tap again to clear
  else{ state.duaStatus[title] = val; }
  saveState();
}
function openDuaDetail(d){
  state.lastRead = { k:'dua', id:d.title, label:dTitle(d) }; saveState();
  markReadDay();
  document.getElementById('detailTitle').textContent = dTitle(d);
  document.getElementById('detailBody').innerHTML = `
    <div class="detail-actions">
      ${bmBtn('dua:'+d.title)}
      <button class="act-btn" id="duaImgBtn" title="Share karein">${SHARE_SVG}</button>
    </div>
    <div class="aad-head status-${duaStatus(d.title)||'none'}" style="--aad-c:${duaMeta(d.cat)[1]};">
      <div class="aad-head-ic">${duaIcon(d)}</div>
      <div class="aad-head-title">${dTitle(d)}</div>
      <div class="ref" style="margin:-4px 0 8px;">Hawala: ${d.ref}</div>
      <div class="aad-tags center">${duaTagChips(d)}</div>
      <div class="aad-cat-pill">${duaIcon(d)} ${d.cat}</div>
    </div>
    <div class="dua-detail">
      <div class="aad-guide-sec dua-sec-ar">
        <div class="aad-guide-head"><span class="aad-step-lbl">Dua (Arabic)</span></div>
        <div class="arabic dua-ar">${d.arabic}</div>
      </div>
      <div class="aad-guide-sec dua-sec-tr">
        <div class="aad-guide-head"><span class="aad-step-lbl">${isEn() ? 'Transliteration' : 'Talaffuz (Transliteration)'}</span></div>
        <div class="translit dua-tr">${d.translit}</div>
      </div>
      <div class="aad-guide-sec dua-sec-ur">
        <div class="aad-guide-head"><span class="aad-step-lbl">${isEn() ? 'Meaning' : 'Tarjuma (Roman Urdu)'}</span></div>
        <div class="meaning dua-ur">${dMean(d)}</div>
      </div>
      ${d.info ? `<div class="aad-guide-sec dua-sec-info">
        <div class="aad-guide-head"><span class="aad-step-lbl">${isEn() ? 'Hadith & Virtue' : 'Hadees aur Fazilat'}</span></div>
        <div class="meaning dua-info">${dInfo(d)}</div>
      </div>` : ''}
      <div class="dua-amen">آمیــــــــــــــــــــــــــــــــــــــــن یارب العالمیــــــــــــــــــــــــــــــــــــــــن</div>
    </div>
    <div class="aad-status-row">
      <button class="aad-status-btn soch ${duaStatus(d.title)==='soch'?'on':''}" id="duaSochBtn">⏳ Yaad karna baaqi hai</button>
      <button class="aad-status-btn amal ${duaStatus(d.title)==='amal'?'on':''}" id="duaAmalBtn">✅ Yaad ho chuka hai</button>
    </div>
    ${pnBarHtml()}
  `;
  document.getElementById('duaSochBtn').onclick = ()=>{ setDuaStatus(d.title, 'soch'); openDuaDetail(d); };
  document.getElementById('duaAmalBtn').onclick = ()=>{ setDuaStatus(d.title, 'amal'); openDuaDetail(d); };
  document.getElementById('duaImgBtn').onclick = ()=> openCardShareChooser({ kind:"Du'a", arabic:d.arabic, title:dTitle(d), sub:d.translit, body:dMean(d), foot:'Hawala: '+d.ref });
  wirePnBar();
}

let qwordView='grid', qwordSearch='', qwordGroupFilter='__all__', qwordSortMode=0;
/* Taadaad button cycles: 0 = A to Z, 1 = most used first, 2 = least used first */
function qwordSortFn(){
  if(qwordSortMode===1) return (a,b)=>Number(b.occ)-Number(a.occ);
  if(qwordSortMode===2) return (a,b)=>Number(a.occ)-Number(b.occ);
  return (a,b)=>a.tr.localeCompare(b.tr);
}

/* ============================================================
   CONTINUE CARD and SEARCH EVERYTHING (Ma'rifat)
   ============================================================ */
function renderContinueCard(){
  const el = document.getElementById('continueCard');
  if(!el) return;
  const r = state.lastRead;
  const ic = r ? ({quran:'📖', dua:'🤲', hadees:'📜', aadaab:'🪴', name:'💚', qword:'📗'}[r.k] || '📖') : '';
  el.innerHTML = `${r ? `<button class="goal-mini-card cont-card" id="contBtn"><span class="gm-ic">${ic}</span>
      <span class="cont-txt"><span class="cont-lbl">${L({rur:'Jaari rakhein', en:'Continue'})}</span><span class="cont-name">${r.label}</span></span><b class="goal-arrow">›</b></button>` : ''}
    <button class="gs-entry" id="gsEntryBtn">🔍 ${L({rur:'Sab kuch dhoondhiye: dua, hadees, lafz, naam, surah...', en:'Search everything: duas, hadith, words, names, surahs...'})}</button>`;
  const c = document.getElementById('contBtn'); if(c) c.onclick = openLastRead;
  document.getElementById('gsEntryBtn').onclick = ()=> openOverlay(()=>{ gsQuery = ''; renderGlobalSearch(); });
}
function openLastRead(){
  const r = state.lastRead; if(!r) return;
  if(r.k==='quran'){ if(r.ed) state.quranEd = r.ed; return openOverlay(()=> renderQuranReader(r.id)); }
  if(r.k==='name') return openOverlay(()=> renderNameDetail(r.which, r.id));
  const find = { dua:()=>DUAS.find(x=>x.title===r.id), hadees:()=>HADEES.find(x=>hadeesKey(x)===r.id),
    aadaab:()=>AADAAB_TOPICS.find(x=>x.id===r.id), qword:()=>QURAN_WORDS.find(x=>x.tr===r.id) }[r.k];
  const open = { dua:openDuaDetail, hadees:openHadeesDetail, aadaab:openAadaabDetail, qword:openQuranWordDetail }[r.k];
  const item = find && find();
  if(item) openOverlay(()=>{ __navCtx = null; open(item); });
}
let gsQuery = '';
function gsNorm(t){ return String(t||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f'’ʿʾ`]/g,'').replace(/[\s-]+/g,''); } // spaces and hyphens ignored: "yasin" finds Ya-Sin
function renderGlobalSearch(){
  document.getElementById('detailTitle').textContent = L({rur:'Sab mein dhoondhiye', en:'Search everything'});
  document.getElementById('detailBody').innerHTML = `
    <div class="search-bar" style="margin:0 14px 12px;"><input id="gsInput" type="search" placeholder="${L({rur:'Dua, hadees, lafz, naam, surah...', en:'Dua, hadith, word, name, surah...'})}" value="${gsQuery.replace(/"/g,'&quot;')}"></div>
    <div id="gsResults"></div>`;
  const inp = document.getElementById('gsInput');
  inp.oninput = ()=>{ gsQuery = inp.value; drawGlobalSearch(); };
  drawGlobalSearch();
  setTimeout(()=>{ try{ inp.focus(); }catch(e){} }, 60);
}
function drawGlobalSearch(){
  const out = document.getElementById('gsResults'); if(!out) return;
  const q = gsNorm(gsQuery.trim());
  if(q.length < 2){ out.innerHTML = `<div class="empty-state">${L({rur:'Kam az kam 2 harf likhiye', en:'Type at least 2 letters'})}</div>`; return; }
  const has = (...f)=> f.some(x=> gsNorm(x).includes(q));
  const groups = [
    { k:'surah', t:L({rur:'Qur\'an: Surah', en:'Quran: Surahs'}), ic:'📖', items:QURAN_SURAHS.filter(x=>has(x.name, x.ar)).map(x=>({ i:x.n, t:`${x.n}. ${x.name}`, s:`${x.ar} · Page ${x.page}` })) },
    { k:'dua', t:L({rur:'Duain', en:'Duas'}), ic:'🤲', items:DUAS.map((d,i)=>({d,i})).filter(({d})=>has(d.title, dTitle(d), d.translit, d.meaning, dMean(d))).map(({d,i})=>({ i, t:dTitle(d), s:d.cat })) },
    { k:'hadees', t:L({rur:'Hadees', en:'Hadith'}), ic:'📜', items:HADEES.map((h,i)=>({h,i})).filter(({h})=>has(h.txt, hTxt(h), h.src)).map(({h,i})=>({ i, t:(hTxt(h)||'').slice(0,70)+'…', s:h.src })) },
    { k:'aadaab', t:'Aadaab-e-Zindagi', ic:'🪴', items:AADAAB_TOPICS.map((t,i)=>({t,i})).filter(({t})=>has(t.title, t.en && t.en.title)).map(({t,i})=>({ i, t:(isEn() && t.en && t.en.title) || t.title, s:'' })) },
    { k:'qword', t:L({rur:"Qur'ani Alfaaz", en:'Quranic Words'}), ic:'📗', items:QURAN_WORDS.map((w,i)=>({w,i})).filter(({w})=>has(w.tr, w.m, w.en)).map(({w,i})=>({ i, t:w.tr, s:(isEn() && w.en) || w.m })) },
    { k:'shabd', t:L({rur:'Khaas Shabd', en:'Special Words'}), ic:'📚', items:KHAAS_SHABD.map((w,i)=>({w,i})).filter(({w})=>has(w.tr, w.m, w.en)).map(({w,i})=>({ i, t:w.tr, s:(isEn() && w.en) || w.m })) },
    { k:'asma', t:'Asma-ul-Husna', ic:'💚', items:ASMA_UL_HUSNA.map((w,i)=>({w,i})).filter(({w})=>has(w.tr, w.m, w.en)).map(({w,i})=>({ i, t:w.tr, s:(isEn() && w.en) || w.m })) },
    { k:'prophet', t:L({rur:'Muhammad ﷺ ke Naam', en:'Names of Muhammad ﷺ'}), ic:'🌙', items:PROPHET_NAMES.map((w,i)=>({w,i})).filter(({w})=>has(w.tr, w.m, w.en)).map(({w,i})=>({ i, t:w.tr, s:(isEn() && w.en) || w.m })) },
  ].filter(g=>g.items.length);
  if(!groups.length){ out.innerHTML = `<div class="empty-state">${L({rur:'Kuch nahi mila', en:'Nothing found'})}</div>`; return; }
  out.innerHTML = groups.map(g=>`<div class="section-title" style="margin:6px 14px 8px;">${g.ic} ${g.t} <span class="gs-count">${g.items.length}</span></div>
    <div class="more-list" style="padding-top:0;">${g.items.slice(0,15).map(x=>`<div class="more-item gs-item" data-g="${g.k}" data-i="${x.i}"><div class="lbl">${x.t}${x.s?`<span class="lblSub">${String(x.s).slice(0,90)}</span>`:''}</div><div class="chev">›</div></div>`).join('')}</div>`).join('');
  out.querySelectorAll('.gs-item').forEach(el=>{
    el.onclick = ()=>{
      const i = +el.dataset.i, g = el.dataset.g;
      if(g==='surah') return renderQuranReader(QURAN_SURAHS[i-1].page);
      if(g==='asma' || g==='prophet') return renderNameDetail(g, i);
      if(g==='shabd') return renderShabdDetail(i, renderGlobalSearch);
      __navCtx = null;
      if(g==='dua') openDuaDetail(DUAS[i]);
      else if(g==='hadees') openHadeesDetail(HADEES[i]);
      else if(g==='aadaab') openAadaabDetail(AADAAB_TOPICS[i]);
      else if(g==='qword') openQuranWordDetail(QURAN_WORDS[i]);
    };
  });
}

/* ============================================================
   IN-APP SHEETS in place of the browser's own alert/confirm pop-ups
   ============================================================ */
function appConfirm(msg, okLabel){
  return new Promise(res=>{
    const w = document.createElement('div');
    w.className = 'app-confirm';
    w.innerHTML = `<div class="info-card"><div class="info-text">${msg}</div><div class="ac-btns">
      <button class="ac-no">${L({rur:'Rehne dein', en:'Cancel'})}</button><button class="ac-yes">${okLabel || L({rur:'Haan', en:'Yes'})}</button></div></div>`;
    document.body.appendChild(w);
    const done = v=>{ w.remove(); res(v); };
    w.querySelector('.ac-no').onclick = ()=> done(false);
    w.querySelector('.ac-yes').onclick = ()=> done(true);
    w.onclick = e=>{ if(e.target===w) done(false); };
  });
}
function appInfo(text){
  const w = document.createElement('div');
  w.className = 'app-confirm';
  w.innerHTML = `<div class="info-card"><pre class="ac-pre"></pre><div class="ac-btns"><button class="ac-yes">OK</button></div></div>`;
  w.querySelector('.ac-pre').textContent = text;
  document.body.appendChild(w);
  w.querySelector('.ac-yes').onclick = ()=> w.remove();
  w.onclick = e=>{ if(e.target===w) w.remove(); };
}

/* ============================================================
   FIRST-RUN SETUP: city, language, Azaan and reminders (every step can be skipped)
   ============================================================ */
let setupCityQuery = '';
function closeSetup(){ state.setupDone = true; delete state.setupStep; saveState(); const o = document.getElementById('setupOverlay'); if(o) o.remove(); renderHome(); }
function showSetup(step){
  let o = document.getElementById('setupOverlay');
  if(!o){ o = document.createElement('div'); o.id = 'setupOverlay'; document.body.appendChild(o); }
  state.setupStep = step; saveState();
  const steps = ['city','lang','alerts'];
  const n = steps.indexOf(step);
  const head = `<div class="su-top"><div class="su-dots">${steps.map((x,i)=>`<i class="${i<=n?'on':''}"></i>`).join('')}</div>
    <button class="su-skip" id="suSkip">${L({rur:'Skip karein', en:'Skip'})}</button></div>`;
  let body = '';
  if(step==='city'){
    body = `<div class="su-ic">🕌</div><div class="su-title">${L({rur:'Assalamu Alaikum! Apna shahar chunein', en:'Assalamu Alaikum! Choose your city'})}</div>
      <div class="su-sub">${L({rur:'Namaz ke sahi auqaat ke liye.', en:'For accurate prayer times.'})}</div>
      <button class="backup-btn" id="suGps">📡 ${L({rur:'GPS se location lein', en:'Use my location (GPS)'})}</button>
      <div class="su-sub" id="suGpsMsg"></div>
      <div class="search-bar" style="margin:8px 0 10px;"><input id="suCity" placeholder="${L({rur:'Shahar dhoondhiye...', en:'Search city...'})}" value="${setupCityQuery.replace(/"/g,'&quot;')}"></div>
      <div id="suCityList" class="su-list"></div>`;
  } else if(step==='lang'){
    body = `<div class="su-ic">🌐</div><div class="su-title">${L({rur:'Zubaan chunein', en:'Choose language'})}</div>
      ${[['rur','Hinglish / Roman Urdu'],['en','English']].map(([k,l])=>`<div class="lang-opt ${state.lang===k?'on':''}" data-su-lang="${k}" role="button" tabindex="0"><div><b>${l}</b></div><div class="lang-check">${state.lang===k?'✓':''}</div></div>`).join('')}
      <button class="backup-btn" id="suNext">${L({rur:'Aage', en:'Next'})} ›</button>`;
  } else {
    const a = azaanState();
    body = `<div class="su-ic">🔔</div><div class="su-title">${L({rur:'Azaan aur yaad-dahani', en:'Azaan and reminders'})}</div>
      <div class="ramzan-card" style="margin:0 0 12px;">
        <div class="roza-toggle"><span style="font-size:13.5px; font-weight:700;">${L({rur:'Namaz ke waqt Azaan', en:'Azaan at prayer times'})}<span class="su-note">${L({rur:'Jab app khuli ho', en:'While the app is open'})}</span></span><div class="switch ${a.on?'on':''}" id="suAz"><div class="knob"></div></div></div>
        <div class="roza-toggle"><span style="font-size:13.5px; font-weight:700;">${L({rur:'Farz namaz ki yaad-dahani', en:'Farz prayer reminders'})}<span class="su-note">${L({rur:'Notification', en:'Notification'})}</span></span><div class="switch ${state.notif.fard?'on':''}" id="suNotif"><div class="knob"></div></div></div>
      </div>
      <div class="su-sub">${L({rur:'Yeh sab baad mein Settings mein badal sakte hain.', en:'You can change all of this later in Settings.'})}</div>
      <button class="backup-btn" id="suDone">${L({rur:'Shuru karein', en:'Get started'})} ✓</button>`;
  }
  o.innerHTML = `<div class="su-card">${head}${body}</div>`;
  document.getElementById('suSkip').onclick = closeSetup;
  if(step==='city'){
    const pick = c=>{ state.location = { name:c.name, lat:c.lat, lon:c.lon, state:c.state, source:'manual' }; saveState(); renderHome(); renderCalendar(); showSetup('lang'); };
    const draw = ()=>{
      const q = gsNorm(setupCityQuery.trim());
      const list = (q ? CITIES.filter(c=> gsNorm(c.name+' '+(c.state||'')).includes(q)) : CITIES).slice(0, 40);
      const el = document.getElementById('suCityList');
      el.innerHTML = list.map((c,i)=>`<div class="more-item" data-ci="${i}"><div class="lbl">${c.name}${c.state?`<span class="lblSub">${c.state}</span>`:''}</div><div class="chev">›</div></div>`).join('');
      el.querySelectorAll('[data-ci]').forEach(r=>{ r.onclick = ()=> pick(list[+r.dataset.ci]); });
    };
    const inp = document.getElementById('suCity');
    inp.oninput = ()=>{ setupCityQuery = inp.value; draw(); };
    draw();
    document.getElementById('suGps').onclick = ()=>{
      const msg = document.getElementById('suGpsMsg');
      if(!navigator.geolocation){ msg.textContent = L({rur:'Is browser mein GPS nahi hai, list se shahar chunein.', en:'GPS is not available here; choose a city from the list.'}); return; }
      msg.textContent = L({rur:'Location maloom ki jaa rahi hai...', en:'Finding your location...'});
      navigator.geolocation.getCurrentPosition(pos=>{
        state.location = { name:'Current Location', lat:pos.coords.latitude, lon:pos.coords.longitude, source:'gps', tz:deviceTZ() };
        saveState(); renderHome(); renderCalendar(); showSetup('lang');
      }, ()=>{ msg.textContent = L({rur:'Location nahi mil saki, list se shahar chunein.', en:'Could not get your location; choose a city from the list.'}); }, { timeout:10000 });
    };
  } else if(step==='lang'){
    o.querySelectorAll('[data-su-lang]').forEach(el=>{
      el.onclick = ()=>{
        const v = el.dataset.suLang;
        if(v===state.lang) return;
        state.lang = v; state.setupStep = 'lang'; saveState(); reloadSmooth(false); // the English layer starts on load
      };
    });
    document.getElementById('suNext').onclick = ()=> showSetup('alerts');
  } else {
    document.getElementById('suAz').onclick = ()=>{ const a = azaanState(); a.on = !a.on; saveState(); showSetup('alerts'); };
    document.getElementById('suNotif').onclick = async ()=>{
      state.notif.fard = !state.notif.fard; saveState();
      if(state.notif.fard && 'Notification' in window && Notification.permission==='default'){ try{ await Notification.requestPermission(); }catch(e){} }
      scheduleNotifications(true); showSetup('alerts');
    };
    document.getElementById('suDone').onclick = closeSetup;
  }
}
/* ============================================================
   AZAAN: text with meaning, recordings from around the world, and playback at prayer time
   (recordings: freely licensed, from Wikimedia Commons; credits shown on the Azaan screen)
   ============================================================ */
const AZAAN_RECS = [{"id": "makkah", "ic": "🕋", "rur": "Makkah · Masjid al-Haram", "en": "Makkah · Masjid al-Haram", "sec": 197, "excerpt": false, "fajr": false, "artist": "Seyfula Islam", "license": "CC BY 3.0", "page": "https://commons.wikimedia.org/wiki/File%3AAdhan%2C_Great_Mosque_of_Mecca_-_Jan_21%2C_2013.webm"}, {"id": "makkah-maghrib", "ic": "🕋", "rur": "Makkah · Masjid al-Haram (Maghrib)", "en": "Makkah · Masjid al-Haram (Maghrib)", "sec": 301, "excerpt": false, "fajr": false, "artist": "3omar Faruq", "license": "CC BY 3.0", "page": "https://commons.wikimedia.org/wiki/File%3AMaghrib_Adhan_at_the_Masjid_al_Haram%2C_Mecca_-_25_Feb%2C_2012.webm"}, {"id": "madinah", "ic": "🕌", "rur": "Madinah · Masjid an-Nabawi", "en": "Madinah · Prophet's Mosque", "sec": 187, "excerpt": false, "fajr": false, "artist": "ejaz215", "license": "CC BY 3.0", "page": "https://commons.wikimedia.org/wiki/File%3A33937_ejaz215_call-to-prayer-from-the-prophet-s-mo.ogg"}, {"id": "malmo-fajr", "ic": "🌅", "rur": "Malmö, Sweden · Fajr ki Azaan", "en": "Malmö, Sweden · Fajr Azaan", "sec": 248, "excerpt": false, "fajr": true, "artist": "Islamic Center Malmö", "license": "CC BY 3.0", "page": "https://commons.wikimedia.org/wiki/File%3AEid_al-Fitr_Fajr_azan_at_Malm%C3%B6_Mosque_-_19_August_2012.webm"}, {"id": "aleppo", "ic": "🇸🇾", "rur": "Halab (Aleppo), Syria · Sabah Fakhri", "en": "Aleppo, Syria · Sabah Fakhri", "sec": 158, "excerpt": false, "fajr": false, "artist": "Sabah Fakhri", "license": "Public domain", "page": "https://commons.wikimedia.org/wiki/File%3ACall_to_prayer_by_Sabah_Fakhry.mp3"}, {"id": "casablanca", "ic": "🇲🇦", "rur": "Casablanca, Morocco · Hassan II Masjid", "en": "Casablanca, Morocco · Hassan II Mosque", "sec": 176, "excerpt": false, "fajr": false, "artist": "Fraguando", "license": "CC BY-SA 4.0", "page": "https://commons.wikimedia.org/wiki/File%3ALlamada_a_oraci%C3%B3n_Mezquita_Hassan_II.wav"}, {"id": "kazakhstan", "ic": "🇰🇿", "rur": "Shalqar, Kazakhstan", "en": "Shalqar, Kazakhstan", "sec": 155, "excerpt": false, "fajr": false, "artist": "Esetok", "license": "CC BY-SA 4.0", "page": "https://commons.wikimedia.org/wiki/File%3AAdhan_in_Shalqar_mosque.webm"}, {"id": "istanbul", "ic": "🇹🇷", "rur": "Istanbul, Turkey", "en": "Istanbul, Turkey", "sec": 50, "excerpt": true, "fajr": false, "artist": "Viceskeeni2", "license": "CC0", "page": "https://commons.wikimedia.org/wiki/File%3AAdhan_in_Istanbul.webm"}, {"id": "konya", "ic": "🇹🇷", "rur": "Konya, Turkey", "en": "Konya, Turkey", "sec": 60, "excerpt": true, "fajr": false, "artist": "Frans van der Vaart", "license": "CC BY 3.0", "page": "https://commons.wikimedia.org/wiki/File%3AHminsec150_Konya.webm"}, {"id": "nigeria", "ic": "🇳🇬", "rur": "Nigeria", "en": "Nigeria", "sec": 65, "excerpt": true, "fajr": false, "artist": "Isaacayodele32", "license": "CC BY-SA 4.0", "page": "https://commons.wikimedia.org/wiki/File%3ACall_to_prayer.ogg"}, {"id": "aaqib", "ic": "🎙️", "rur": "Aaqib Azeez ki awaaz mein", "en": "Recited by Aaqib Azeez", "sec": 87, "excerpt": false, "fajr": false, "artist": "Atcovi", "license": "CC BY-SA 4.0", "page": "https://commons.wikimedia.org/wiki/File%3AThe_Adhan_-_Muslim_Call_to_Prayer_-_Aaqib_Azeez.mp3"}, {"id": "adam", "ic": "🎙️", "rur": "Azaan (Adam-synagda ki recording)", "en": "Azaan (recorded by Adam-synagda)", "sec": 154, "excerpt": false, "fajr": false, "artist": "Adam-synagda", "license": "CC0", "page": "https://commons.wikimedia.org/wiki/File%3ABeautiful_adhan.ogg"}, {"id": "andrewler", "ic": "🎙️", "rur": "Azaan (Andrewler ki recording)", "en": "Azaan (recorded by Andrewler)", "sec": 184, "excerpt": false, "fajr": false, "artist": "Andrewler", "license": "CC BY-SA 4.0", "page": "https://commons.wikimedia.org/wiki/File%3AAzan.ogg"}];
const AZAAN_TEXT = [
  { ar:'اللّٰهُ أَكْبَرُ', tr:'Allahu Akbar', n:4, m:{rur:'Allah sab se bada hai', en:'Allah is the Greatest'} },
  { ar:'أَشْهَدُ أَنْ لَا إِلٰهَ إِلَّا اللّٰهُ', tr:'Ash-hadu an la ilaha illallah', n:2, m:{rur:'Main gawahi deta hoon ke Allah ke siwa koi ibadat ke laaiq nahi', en:'I bear witness that there is no god but Allah'} },
  { ar:'أَشْهَدُ أَنَّ مُحَمَّدًا رَسُولُ اللّٰهِ', tr:'Ash-hadu anna Muhammadan Rasulullah', n:2, m:{rur:'Main gawahi deta hoon ke Muhammad ﷺ Allah ke Rasool hain', en:'I bear witness that Muhammad ﷺ is the Messenger of Allah'} },
  { ar:'حَيَّ عَلَى الصَّلَاةِ', tr:"Hayya 'alas-Salah", n:2, m:{rur:'Aao namaz ki taraf', en:'Come to prayer'} },
  { ar:'حَيَّ عَلَى الْفَلَاحِ', tr:"Hayya 'alal-Falah", n:2, m:{rur:'Aao kamyabi ki taraf', en:'Come to success'} },
  { ar:'الصَّلَاةُ خَيْرٌ مِنَ النَّوْمِ', tr:'As-Salatu khairum minan-nawm', n:2, fajr:true, m:{rur:'Namaz neend se behtar hai', en:'Prayer is better than sleep'} },
  { ar:'اللّٰهُ أَكْبَرُ', tr:'Allahu Akbar', n:2, m:{rur:'Allah sab se bada hai', en:'Allah is the Greatest'} },
  { ar:'لَا إِلٰهَ إِلَّا اللّٰهُ', tr:'La ilaha illallah', n:1, m:{rur:'Allah ke siwa koi ibadat ke laaiq nahi', en:'There is no god but Allah'} },
];
const AZAAN_DUA = {
  ar:'اللّٰهُمَّ رَبَّ هٰذِهِ الدَّعْوَةِ التَّامَّةِ، وَالصَّلَاةِ الْقَائِمَةِ، آتِ مُحَمَّدًا الْوَسِيلَةَ وَالْفَضِيلَةَ، وَابْعَثْهُ مَقَامًا مَحْمُودًا الَّذِي وَعَدْتَهُ',
  tr:"Allahumma Rabba hazihid-da'watit-tammah, was-salatil-qa'imah, aati Muhammadanil-waseelata wal-fadeelah, wab'ath-hu maqamam mahmudanil-lazi wa'adtah",
  m:{rur:'Aye Allah, is mukammal pukaar aur qaaim hone wali namaz ke Rab! Muhammad ﷺ ko Waseela aur Fazeelat ata farma, aur unhein us Maqam-e-Mahmood par pahuncha jiska Tu ne un se waada kiya hai.',
     en:'O Allah, Lord of this perfect call and of the prayer about to be established, grant Muhammad ﷺ al-Waseelah and excellence, and raise him to the praised station You have promised him.'},
  ref:'Sahih al-Bukhari 614'
};
/* Default: a different recording for each prayer, so the sound itself tells which prayer it is */
const AZAAN_DEFAULT_PICK = { fajr:'malmo-fajr', zuhr:'madinah', asr:'aleppo', maghrib:'makkah-maghrib', isha:'makkah' };
function azaanState(){
  if(!state.azaan) state.azaan = { on:false, prayers:{fajr:true, zuhr:true, asr:true, maghrib:true, isha:true}, pick:Object.assign({}, AZAAN_DEFAULT_PICK) };
  const a = state.azaan;
  if(!a.prayers) a.prayers = {fajr:true, zuhr:true, asr:true, maghrib:true, isha:true};
  if(!a.pick) a.pick = Object.assign({}, AZAAN_DEFAULT_PICK);
  // Fajr may only use a Fajr Azaan; the other four only a regular one
  FIVE.forEach(k=>{ if(!azaanRecsFor(k).some(r=>r.id===a.pick[k])) a.pick[k] = AZAAN_DEFAULT_PICK[k]; });
  if(!a.played) a.played = {};
  return a;
}
function azaanRecsFor(k){ return AZAAN_RECS.filter(r=> k==='fajr' ? r.fajr : !r.fajr); }
function azaanRec(id){ return AZAAN_RECS.find(r=>r.id===id) || AZAAN_RECS[0]; }
function fmtSecs(n){ return Math.floor(n/60) + ':' + String(n%60).padStart(2,'0'); }
const PRAYER_LABEL = { fajr:'Fajr', zuhr:'Zuhr', asr:'Asr', maghrib:'Maghrib', isha:'Isha' };

/* One shared player for previews and prayer-time Azaan, with a floating Stop bar */
let azaanAudio = null, azaanPlayingId = null;
function stopAzaan(){
  if(azaanAudio){ azaanAudio.pause(); if(azaanAudio.src.startsWith('blob:')) URL.revokeObjectURL(azaanAudio.src); azaanAudio = null; }
  azaanPlayingId = null;
  const bar = document.getElementById('azaanBar'); if(bar) bar.remove();
  document.querySelectorAll('.az-play.on').forEach(b=>{ b.classList.remove('on'); b.textContent = '▶'; });
}
function playAzaan(id, label){
  stopAzaan();
  const rec = azaanRec(id);
  azaanAudio = new Audio(`azan/${rec.id}.mp3`);
  azaanPlayingId = rec.id;
  azaanAudio.onended = stopAzaan;
  // gentle start: the volume rises to the chosen level over about 3 seconds
  const target = Math.max(0.05, Math.min(1, azaanState().vol ?? 1));
  azaanAudio.volume = 0;
  const au = azaanAudio, fade = setInterval(()=>{ if(au !== azaanAudio){ clearInterval(fade); return; } au.volume = Math.min(target, au.volume + target/30); if(au.volume >= target) clearInterval(fade); }, 100);
  const p = azaanAudio.play();
  if(p && p.catch) p.catch(()=>{ stopAzaan(); showToast(L({rur:'Azaan chalaane ke liye app par ek baar tap karein', en:'Tap the app once to allow the Azaan to play'})); });
  const bar = document.createElement('div');
  bar.id = 'azaanBar';
  bar.innerHTML = `<div class="azb-top"><span class="azb-ic">🔊</span><span class="azb-txt">${label || L({rur:rec.rur, en:rec.en})}</span><button class="azb-pause" id="azaanPauseBtn" aria-label="Pause">❚❚</button><button id="azaanStopBtn">■ ${L({rur:'Band karein', en:'Stop'})}</button></div>
    <div class="azb-seek"><span id="azbCur">0:00</span><input type="range" id="azbRange" min="0" max="${rec.sec}" step="0.1" value="0" aria-label="${L({rur:'Azaan ki timeline', en:'Azaan timeline'})}"><span id="azbDur">${fmtSecs(rec.sec)}</span></div>`;
  document.body.appendChild(bar);
  document.getElementById('azaanStopBtn').onclick = stopAzaan;
  wireAzaanSeek(azaanAudio, rec);
  document.querySelectorAll(`.az-play[data-id="${rec.id}"]`).forEach(b=>{ b.classList.add('on'); b.textContent = '■'; });
}
/* Keep the bar's timeline in step with the audio; dragging or tapping the timeline jumps there */
function wireAzaanSeek(audio, rec){
  const range = document.getElementById('azbRange'), cur = document.getElementById('azbCur'), dur = document.getElementById('azbDur');
  const pauseBtn = document.getElementById('azaanPauseBtn');
  let dragging = false;
  const total = ()=> (isFinite(audio.duration) && audio.duration > 0) ? audio.duration : rec.sec;
  const paint = (t)=>{
    range.max = total();
    range.style.setProperty('--p', (Math.min(1, t / total()) * 100) + '%');
    cur.textContent = fmtSecs(Math.floor(t));
  };
  audio.addEventListener('loadedmetadata', ()=>{ dur.textContent = fmtSecs(Math.round(total())); paint(audio.currentTime); });
  audio.addEventListener('timeupdate', ()=>{ if(audio !== azaanAudio || dragging) return; range.value = audio.currentTime; paint(audio.currentTime); });
  range.addEventListener('input', ()=>{ dragging = true; paint(parseFloat(range.value)); });
  range.addEventListener('change', ()=>{ seekAzaan(audio, parseFloat(range.value)); dragging = false; });
  pauseBtn.onclick = ()=>{
    if(audio.paused){ audio.play(); pauseBtn.textContent = '❚❚'; pauseBtn.setAttribute('aria-label', 'Pause'); }
    else { audio.pause(); pauseBtn.textContent = '▶'; pauseBtn.setAttribute('aria-label', 'Play'); }
  };
}
/* Jump to t seconds. A recording served whole (the offline cache, or a server without byte ranges)
   cannot be seeked while streaming, so load it into memory once and seek there. */
function seekAzaan(audio, t){
  const s = audio.seekable;
  for(let i = 0; i < s.length; i++) if(s.start(i) <= t && t <= s.end(i)){ audio.currentTime = t; return; }
  if(audio.src.startsWith('blob:')){ audio.currentTime = t; return; }
  fetch(audio.src).then(r=> r.blob()).then(b=>{
    if(audio !== azaanAudio) return;
    const wasPaused = audio.paused;
    audio.addEventListener('loadedmetadata', ()=>{ audio.currentTime = t; if(!wasPaused) audio.play(); }, { once:true });
    audio.src = URL.createObjectURL(b);
  }).catch(()=>{});
}
/* At each chosen prayer's start time, play its Azaan once (only while the app is open) */
function checkAzaanTime(){
  const a = azaanState();
  if(!a.on) return;
  const now = new Date();
  const sched = buildSchedule(operatingDate(now));
  FIVE.forEach(k=>{
    if(!a.prayers[k]) return;
    const p = sched.find(x=>x.key===k); if(!p) return;
    const key = dayKey(p.start) + '_' + k;
    const late = now - p.start;
    if(late >= 0 && late < 90*1000 && !a.played[key]){
      a.played[key] = true;
      // keep only the last few days of "already played" marks
      Object.keys(a.played).forEach(x=>{ if(x.slice(0, x.lastIndexOf('_')) < dayKey(new Date(now - 3*86400000))) delete a.played[x]; });
      saveState();
      playAzaan(a.pick[k], `${PRAYER_LABEL[k]} ${L({rur:'ki Azaan', en:'Azaan'})}`);
    }
  });
}
setInterval(checkAzaanTime, 5000);
document.addEventListener('visibilitychange', ()=>{ if(!document.hidden) checkAzaanTime(); });

function azaanRecRow(r){
  return `<div class="az-rec">
    <button class="az-play ${azaanPlayingId===r.id?'on':''}" data-id="${r.id}">${azaanPlayingId===r.id?'■':'▶'}</button>
    <div class="az-info">
      <div class="az-name">${r.ic} ${L({rur:r.rur, en:r.en})}</div>
      <div class="az-sub">${fmtSecs(r.sec)}${r.excerpt ? ' · ' + L({rur:'hissa (poori nahi)', en:'excerpt'}) : ''}${r.fajr ? ' · ' + L({rur:'Fajr ke liye', en:'for Fajr'}) : ''}</div>
      <div class="az-credit">${L({rur:'Recording', en:'Recording'})}: ${r.artist} · ${r.license} · <a href="${r.page}" target="_blank" rel="noopener">Wikimedia Commons</a></div>
    </div>
  </div>`;
}
function wireAzaanPlay(){
  document.querySelectorAll('#detailBody .az-play').forEach(b=>{
    b.onclick = ()=>{ if(azaanPlayingId===b.dataset.id) stopAzaan(); else playAzaan(b.dataset.id); };
  });
}
function renderAzaan(){
  document.getElementById('detailTitle').textContent = 'Azaan';
  const a = azaanState();
  document.getElementById('detailBody').innerHTML = `
    <div class="backup-note">${L({rur:'Azaan ke alfaaz, unka talaffuz aur maana, aur duniya bhar ki masjidon se Azaan suniye.', en:'The words of the Azaan with pronunciation and meaning, and Azaan recordings from mosques around the world.'})}</div>
    <button class="backup-btn" id="azaanSetBtn">⚙️ ${L({rur:'Namaz ke waqt Azaan', en:'Azaan at prayer times'})}: ${a.on ? L({rur:'On', en:'On'}) : L({rur:'Off', en:'Off'})}</button>
    <div class="section-title">${L({rur:'Azaan ke Alfaaz', en:'Words of the Azaan'})}</div>
    <div class="az-text">${AZAAN_TEXT.map(x=>`<div class="az-line ${x.fajr?'fajr':''}">
      <div class="az-ar ar-font">${x.ar}</div>
      <div class="az-tr">${x.tr} <b>×${x.n}</b></div>
      <div class="az-m">${L(x.m)}</div>
      ${x.fajr ? `<div class="az-fajr">${L({rur:'Sirf Fajr ki Azaan mein, Hayya alal-Falah ke baad', en:'Only in the Fajr Azaan, after Hayya alal-Falah'})}</div>` : ''}
    </div>`).join('')}</div>
    <div class="section-title">${L({rur:'Azaan ke baad ki Dua', en:'Dua after the Azaan'})}</div>
    <div class="az-text"><div class="az-line">
      <div class="az-ar ar-font">${AZAAN_DUA.ar}</div>
      <div class="az-tr">${AZAAN_DUA.tr}</div>
      <div class="az-m">${L(AZAAN_DUA.m)}</div>
      <div class="az-fajr">${L({rur:'Hawala', en:'Reference'})}: ${AZAAN_DUA.ref}</div>
    </div></div>
    <div class="section-title">${L({rur:'Duniya bhar ki Azaan', en:'Azaan from around the world'})}</div>
    <div class="az-list">${AZAAN_RECS.map(azaanRecRow).join('')}</div>
    <div class="backup-note">${L({rur:'Recordings Wikimedia Commons se hain, free license (CC0, Public domain, CC BY, CC BY-SA) ke saath. Har recording ke saath uske banane wale aur license ka zikr hai.', en:'Recordings are from Wikimedia Commons under free licences (CC0, public domain, CC BY, CC BY-SA). Each recording lists its author and licence.'})}</div>
  `;
  document.getElementById('azaanSetBtn').onclick = renderAzaanSettings;
  wireAzaanPlay();
}

/* ============================================================
   SETTINGS: prayer calculation (Asr method, Hijri adjustment) and Iqamah (jamaat) times
   ============================================================ */
function afterCalcChange(){ renderHome(); renderCalendar(); updateRamzanLock(); scheduleNotifications(true); }
function renderCalcSettings(){
  document.getElementById('detailTitle').textContent = L({rur:'Namaz ka Hisaab', en:'Prayer Calculation'});
  const hd = gregorianToHijri(new Date());
  const off = hijriOffset();
  document.getElementById('detailBody').innerHTML = `
    <div class="section-title" style="margin-top:0;">${L({rur:'Asr ka waqt', en:'Asr time'})}</div>
    <div class="theme-row" style="padding:0 0 6px;">
      <button data-asr="hanafi" class="${state.asrMethod!=='shafi'?'active':''}">Hanafi</button>
      <button data-asr="shafi" class="${state.asrMethod==='shafi'?'active':''}">Shafi'i / Maliki / Hanbali</button>
    </div>
    <div class="backup-note" style="margin-top:0;">${L({rur:"Hanafi: jab saaya cheez se do guna ho jaaye. Shafi'i: jab saaya cheez ke barabar ho. Shafi'i mein Asr lagbhag ek ghanta pehle shuru hoti hai.", en:"Hanafi: when a shadow is twice an object's length. Shafi'i: when it equals the length. Shafi'i Asr starts about an hour earlier."})}</div>
    <div class="section-title">${L({rur:'Hijri tareekh', en:'Hijri date'})}</div>
    <div class="ramzan-card" style="margin:0 0 8px;">
      <div style="font-size:15px; font-weight:800; text-align:center; margin-bottom:10px;">${hd.day} ${hd.monthName} ${hd.year} AH</div>
      <div class="hij-adj">${[-2,-1,0,1,2].map(v=>`<button data-hoff="${v}" class="${v===off?'on':''}">${v>0?'+':''}${v}</button>`).join('')}</div>
    </div>
    <div class="backup-note" style="margin-top:0;">${L({rur:'Chaand dikhne ke hisaab se agar aapke yahan tareekh ek do din aage ya peeche ho to yahan theek karein. Ramzan, Khaas Din aur Taareekh sab is ke saath badlenge.', en:'If your local moon sighting puts the date a day or two ahead or behind, adjust it here. Ramzan, Special Days and the Calendar all follow it.'})}</div>
    <div class="section-title">${L({rur:'Hisaab ka tareeqa (Fajr aur Isha)', en:'Calculation method (Fajr and Isha)'})}</div>
    ${Object.entries(CALC_METHODS).map(([k,m])=>`<div class="lang-opt ${ (state.calcMethod||'mwl')===k?'on':''}" data-cm="${k}" role="radio" aria-checked="${(state.calcMethod||'mwl')===k}" tabindex="0"><div><b>${m.name}</b><span>${m.note}</span></div><div class="lang-check">${(state.calcMethod||'mwl')===k?'✓':''}</div></div>`).join('')}
    <div class="backup-note">${L({rur:'India aur Pakistan mein aam taur par Karachi ya MWL chalta hai. Agar aapki masjid ke waqt se farq aaye to yahan tareeqa badlein ya neeche minute adjust karein.', en:'Karachi or MWL is common in India and Pakistan. If times differ from your mosque, change the method here or fine-tune minutes below.'})}</div>
    <div class="section-title">${L({rur:'Har namaz ke minute adjust karein', en:'Adjust minutes per prayer'})}</div>
    <div class="adj-list">${ADJ_KEYS.map(k=>{ const v = prayerAdjust(k); return `<div class="adj-row"><span>${({fajr:'Fajr',zuhr:'Zuhr',asr:'Asr',maghrib:'Maghrib',isha:'Isha'})[k]}</span><button data-adj="${k}" data-d="-1" aria-label="${k} minus 1 minute">−</button><b>${v>0?'+':''}${v} min</b><button data-adj="${k}" data-d="1" aria-label="${k} plus 1 minute">+</button></div>`; }).join('')}
      <button class="backup-btn" id="adjReset" style="margin-top:10px;">${L({rur:'Sab adjustment hata dein', en:'Reset all adjustments'})}</button></div>
    <div class="backup-note">${L({rur:'Waqt aap ke shahar ke time zone (garmi/sardi ki ghadi samet) ke mutabiq hain.', en:"Times follow your city's time zone, including daylight saving."})}</div>`;
  document.querySelectorAll('#detailBody [data-asr]').forEach(b=>{ b.onclick = ()=>{ state.asrMethod = b.dataset.asr; saveState(); afterCalcChange(); renderCalcSettings(); }; });
  document.querySelectorAll('#detailBody [data-cm]').forEach(el=>{
    const go = ()=>{ state.calcMethod = el.dataset.cm; saveState(); afterCalcChange(); renderCalcSettings(); };
    el.onclick = go; el.onkeydown = e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); go(); } };
  });
  document.querySelectorAll('#detailBody [data-adj]').forEach(b=>{ b.onclick = ()=>{
    state.adjust = state.adjust || {}; const k = b.dataset.adj;
    state.adjust[k] = Math.max(-30, Math.min(30, prayerAdjust(k) + (+b.dataset.d))); saveState(); afterCalcChange(); renderCalcSettings();
  }; });
  const ar = document.getElementById('adjReset'); if(ar) ar.onclick = ()=>{ state.adjust = {}; saveState(); afterCalcChange(); renderCalcSettings(); };
  document.querySelectorAll('#detailBody [data-hoff]').forEach(b=>{ b.onclick = ()=>{ setHijriOffset(+b.dataset.hoff); afterCalcChange(); renderCalcSettings(); }; });
}
function iqamahState(){
  if(!state.iqamah) state.iqamah = { on:false, t:{}, after:{}, remind:10 };
  const q = state.iqamah; if(!q.t) q.t = {}; if(!q.after) q.after = {};
  return q;
}
/* Jamaat time for a prayer on a date: a fixed clock time, or minutes after the prayer starts */
function jamaatTime(prayerRow, date){
  const q = iqamahState(); if(!q.on || !prayerRow) return null;
  const k = prayerRow.key, fixed = q.t[k], after = parseInt(q.after[k]);
  if(fixed){ const [h,m] = fixed.split(':').map(Number); const d = new Date(date); d.setHours(h, m, 0, 0); return d; }
  if(after > 0) return new Date(prayerRow.start.getTime() + after*60000);
  return null;
}
function jamaatChip(p, date){
  if(!FIVE.includes(p.key)) return '';
  const j = jamaatTime(p, date);
  return j ? `<div class="jamaat-chip" title="${L({rur:'Jamaat', en:'Congregation'})}">🕌 ${fmtTimeCompact(j)}</div>` : '';
}
function renderIqamahSettings(){
  document.getElementById('detailTitle').textContent = L({rur:'Jamaat ka Waqt (Iqamah)', en:'Jamaat Times (Iqamah)'});
  const q = iqamahState();
  document.getElementById('detailBody').innerHTML = `
    <div class="ramzan-card" style="margin:0 0 14px;">
      <div class="roza-toggle"><span style="font-size:13.5px; font-weight:700;">${L({rur:'Apni masjid ki jamaat ka waqt dikhayein', en:'Show my masjid\u2019s jamaat times'})}</span><div class="switch ${q.on?'on':''}" id="iqOn"><div class="knob"></div></div></div>
      <div class="roza-toggle"><span style="font-size:13px; font-weight:600;">${L({rur:'Jamaat se pehle yaad-dahani', en:'Reminder before jamaat'})}</span>
        <select id="iqRemind" class="az-select" style="flex:0 0 auto; width:auto;">${[0,5,10,15,20,30].map(m=>`<option value="${m}" ${q.remind===m?'selected':''}>${m ? m+' min' : L({rur:'Off', en:'Off'})}</option>`).join('')}</select></div>
    </div>
    <div class="backup-note" style="margin-top:0;">${L({rur:'Har namaz ke liye ya to jamaat ka waqt likhein, ya yeh ke Azaan ke kitne minute baad jamaat hoti hai.', en:'For each prayer, enter either the jamaat time, or how many minutes after the Azaan it starts.'})}</div>
    ${FIVE.map(k=>`<div class="ramzan-card iq-row" style="margin:0 0 8px;">
      <b>${(PRAYER_META[k]||{}).icon||''} ${PRAYER_LABEL[k]}</b>
      <div class="iq-inputs">
        <label>${L({rur:'Waqt', en:'Time'})}<input type="time" data-iq-t="${k}" value="${q.t[k]||''}"></label>
        <span class="iq-or">${L({rur:'ya', en:'or'})}</span>
        <label>${L({rur:'Azaan ke baad', en:'After Azaan'})}<input type="number" min="0" max="120" placeholder="min" data-iq-a="${k}" value="${q.after[k]||''}"></label>
      </div>
    </div>`).join('')}`;
  document.getElementById('iqOn').onclick = async ()=>{
    q.on = !q.on; saveState();
    if(q.on && q.remind && 'Notification' in window && Notification.permission==='default'){ try{ await Notification.requestPermission(); }catch(e){} }
    renderHome(); scheduleNotifications(true); renderIqamahSettings();
  };
  document.getElementById('iqRemind').onchange = (e)=>{ q.remind = +e.target.value; saveState(); scheduleNotifications(true); };
  document.querySelectorAll('#detailBody [data-iq-t]').forEach(inp=>{ inp.onchange = ()=>{ q.t[inp.dataset.iqT] = inp.value; saveState(); renderHome(); scheduleNotifications(true); }; });
  document.querySelectorAll('#detailBody [data-iq-a]').forEach(inp=>{ inp.onchange = ()=>{ q.after[inp.dataset.iqA] = inp.value; saveState(); renderHome(); scheduleNotifications(true); }; });
}
function renderNafilSettings(){
  document.getElementById('detailTitle').textContent = L({rur:'Nafil Namaz', en:'Nafl Prayers'});
  document.getElementById('detailBody').innerHTML = `
    <div class="ramzan-card" style="margin:0 0 14px;">
      <div class="roza-toggle"><span style="font-size:13.5px; font-weight:700;">${L({rur:'Nafil namaz bhi mark karein', en:'Mark nafl prayers too'})}</span><div class="switch ${nafilOn()?'on':''}" id="nafilSw"><div class="knob"></div></div></div>
    </div>
    <div class="backup-note">${L({rur:'On karne par Maskan par Ishraq, Chaast, Awwabin, Tahajjud aur Du\'a Qubooliyat ke saath ✓ (padh li) aur ✗ (nahi padhi) ke buttons aa jayenge. Taareekh mein yeh Farz ke gol nishaan ke neeche chhote ▲ nishaan se dikhengi (hara: padh li, laal: nahi padhi). Namaz Mode aur Farz ke hisaab (Paabandi, Jaiza) par is ka asar nahi hota.', en:'When on, Ishraq, Chaast, Awwabin, Tahajjud and Du\'a Qubooliyat get ✓ (prayed) and ✗ (not prayed) buttons on Home. In the Calendar they show as small ▲ marks under the round Farz dots (green: prayed, red: not prayed). Namaz Mode and the Farz statistics (streaks, reviews) are not affected.'})}</div>`;
  document.getElementById('nafilSw').onclick = ()=>{
    state.nafilMark = !nafilOn(); saveState();
    renderHome(); renderCalendar(); renderNafilSettings();
    showToast(nafilOn() ? L({rur:'Nafil marking On', en:'Nafl marking on'}) : L({rur:'Nafil marking Off', en:'Nafl marking off'}));
  };
}
function renderAzaanSettings(){
  document.getElementById('detailTitle').textContent = L({rur:'Azaan Settings', en:'Azaan Settings'});
  const a = azaanState();
  const allOn = FIVE.every(k=>a.prayers[k]);
  const opts = (sel, k)=> azaanRecsFor(k).map(r=>`<option value="${r.id}" ${r.id===sel?'selected':''}>${r.ic} ${L({rur:r.rur, en:r.en})}${r.excerpt?' ('+L({rur:'hissa', en:'excerpt'})+')':''}</option>`).join('');
  document.getElementById('detailBody').innerHTML = `
    <div class="ramzan-card" style="margin:0 0 14px;">
      <div class="roza-toggle"><span style="font-size:13.5px; font-weight:700;">${L({rur:'Namaz ke waqt Azaan chalaayein', en:'Play Azaan at prayer times'})}</span><div class="switch ${a.on?'on':''}" id="azOnSw"><div class="knob"></div></div></div>
      <div class="roza-toggle"><span style="font-size:13px; font-weight:600;">${L({rur:'Sab namazon ke liye', en:'For all prayers'})}</span><div class="switch ${allOn?'on':''}" id="azAllSw"><div class="knob"></div></div></div>
      <div class="roza-toggle"><span style="font-size:13px; font-weight:600;">🔊 ${L({rur:'Awaaz', en:'Volume'})}</span><input type="range" id="azVol" min="10" max="100" step="5" value="${Math.round((a.vol ?? 1)*100)}" class="az-vol"></div>
      <button class="quran-tool" id="azFajrOnly" style="width:100%; margin-top:6px;">🌅 ${L({rur:'Sirf Fajr ki Azaan', en:'Fajr Azaan only'})}</button>
    </div>
    <div class="section-title" style="margin-top:0;">${L({rur:'Har namaz ki Azaan', en:'Azaan for each prayer'})}</div>
    ${FIVE.map(k=>`<div class="ramzan-card az-pray" style="margin:0 0 10px;">
      <div class="roza-toggle" style="padding:0 0 8px;"><span style="font-size:13.5px; font-weight:700;">${(PRAYER_META[k]||{}).icon||''} ${PRAYER_LABEL[k]}</span><div class="switch ${a.prayers[k]?'on':''}" data-az-pray="${k}"><div class="knob"></div></div></div>
      <div class="az-pick-row">
        <select class="az-select" data-az-pick="${k}">${opts(a.pick[k], k)}</select>
        <button class="az-play ${azaanPlayingId===a.pick[k]?'on':''}" data-id="${a.pick[k]}">${azaanPlayingId===a.pick[k]?'■':'▶'}</button>
      </div>
      ${k==='fajr' ? `<div class="az-warn">${L({rur:'Fajr ke liye sirf Fajr wali Azaan, jis mein "As-Salatu khairum minan-nawm" hai.', en:'Fajr uses only a Fajr Azaan, which includes "As-Salatu khairum minan-nawm".'})}</div>` : ''}
    </div>`).join('')}
    <div class="backup-note">${L({rur:'Azaan sirf tab chalti hai jab app khuli ho. App band ho ya phone lock ho to browser poori Azaan chalaane nahi deta; tab Yaad-dahani (notification) aati hai, agar Settings mein On ho.', en:'The Azaan plays only while the app is open. When the app is closed or the phone is locked, browsers do not allow a full Azaan; a reminder notification comes instead, if it is on in Settings.'})}</div>
  `;
  document.getElementById('azOnSw').onclick = ()=>{
    a.on = !a.on; saveState();
    if(a.on) showToast(L({rur:'Azaan On: namaz ke waqt app khuli ho to Azaan chalegi', en:'Azaan on: it plays at prayer time while the app is open'}));
    renderAzaanSettings();
  };
  document.getElementById('azVol').oninput = (e)=>{ a.vol = (+e.target.value)/100; saveState(); if(azaanAudio) azaanAudio.volume = a.vol; };
  document.getElementById('azFajrOnly').onclick = ()=>{ FIVE.forEach(k=> a.prayers[k] = (k==='fajr')); a.on = true; saveState(); renderAzaanSettings(); showToast(L({rur:'Ab sirf Fajr ki Azaan chalegi', en:'Only the Fajr Azaan will play now'})); };
  document.getElementById('azAllSw').onclick = ()=>{ const v = !allOn; FIVE.forEach(k=> a.prayers[k] = v); saveState(); renderAzaanSettings(); };
  document.querySelectorAll('#detailBody [data-az-pray]').forEach(sw=>{ sw.onclick = ()=>{ const k = sw.dataset.azPray; a.prayers[k] = !a.prayers[k]; saveState(); renderAzaanSettings(); }; });
  document.querySelectorAll('#detailBody [data-az-pick]').forEach(sel=>{ sel.onchange = ()=>{ a.pick[sel.dataset.azPick] = sel.value; saveState(); renderAzaanSettings(); }; });
  wireAzaanPlay();
}

/* ============================================================
   QUR'AN MAJEED, page-by-page reader (15-line Mushaf page images)
   ============================================================ */
const QURAN_PAGE_COUNT = 616;
const QURAN_PAGE_LIST = Array.from({ length: QURAN_PAGE_COUNT }, (_, i) => i + 1);
/* Start page of each Para and each Surah in this 15-line Mushaf (pages checked against the printed headers) */
const QURAN_PARAS = [{"n": 1, "name": "Alif Lam Meem", "page": 2}, {"n": 2, "name": "Sayaqool", "page": 23}, {"n": 3, "name": "Tilkar Rusul", "page": 43}, {"n": 4, "name": "Lan Tanaloo", "page": 63}, {"n": 5, "name": "Wal Muhsanat", "page": 83}, {"n": 6, "name": "La Yuhibbullah", "page": 103}, {"n": 7, "name": "Wa Iza Sami'oo", "page": 123}, {"n": 8, "name": "Wa Lau Annana", "page": 143}, {"n": 9, "name": "Qalal Mala'u", "page": 163}, {"n": 10, "name": "Wa A'lamoo", "page": 183}, {"n": 11, "name": "Ya'tazeroon", "page": 203}, {"n": 12, "name": "Wa Ma Min Dabbah", "page": 223}, {"n": 13, "name": "Wa Ma Ubarri'u", "page": 243}, {"n": 14, "name": "Rubama", "page": 263}, {"n": 15, "name": "Subhanallazi", "page": 283}, {"n": 16, "name": "Qal Alam", "page": 303}, {"n": 17, "name": "Iqtaraba", "page": 323}, {"n": 18, "name": "Qad Aflaha", "page": 343}, {"n": 19, "name": "Wa Qalallazina", "page": 363}, {"n": 20, "name": "Amman Khalaq", "page": 383}, {"n": 21, "name": "Utlu Ma Oohiya", "page": 403}, {"n": 22, "name": "Wa Man Yaqnut", "page": 423}, {"n": 23, "name": "Wa Maliya", "page": 443}, {"n": 24, "name": "Faman Azlamu", "page": 463}, {"n": 25, "name": "Ilaihi Yuraddu", "page": 483}, {"n": 26, "name": "Ha Meem", "page": 503}, {"n": 27, "name": "Qala Fama Khatbukum", "page": 523}, {"n": 28, "name": "Qad Sami'allah", "page": 543}, {"n": 29, "name": "Tabarakallazi", "page": 563}, {"n": 30, "name": "Amma", "page": 587}];
const QURAN_SURAHS = [{"n": 1, "name": "Al-Fatihah", "ar": "الفاتحة", "page": 2}, {"n": 2, "name": "Al-Baqarah", "ar": "البقرة", "page": 3}, {"n": 3, "name": "Aal-e-Imran", "ar": "آل عمران", "page": 51}, {"n": 4, "name": "An-Nisa", "ar": "النساء", "page": 78}, {"n": 5, "name": "Al-Ma'idah", "ar": "المائدة", "page": 107}, {"n": 6, "name": "Al-An'am", "ar": "الأنعام", "page": 129}, {"n": 7, "name": "Al-A'raf", "ar": "الأعراف", "page": 152}, {"n": 8, "name": "Al-Anfal", "ar": "الأنفال", "page": 178}, {"n": 9, "name": "At-Tawbah", "ar": "التوبة", "page": 188}, {"n": 10, "name": "Yunus", "ar": "يونس", "page": 209}, {"n": 11, "name": "Hud", "ar": "هود", "page": 222}, {"n": 12, "name": "Yusuf", "ar": "يوسف", "page": 236}, {"n": 13, "name": "Ar-Ra'd", "ar": "الرعد", "page": 250}, {"n": 14, "name": "Ibrahim", "ar": "إبراهيم", "page": 256}, {"n": 15, "name": "Al-Hijr", "ar": "الحجر", "page": 262}, {"n": 16, "name": "An-Nahl", "ar": "النحل", "page": 268}, {"n": 17, "name": "Bani Isra'il", "ar": "بني إسرائيل", "page": 283}, {"n": 18, "name": "Al-Kahf", "ar": "الكهف", "page": 294}, {"n": 19, "name": "Maryam", "ar": "مريم", "page": 306}, {"n": 20, "name": "Taha", "ar": "طه", "page": 313}, {"n": 21, "name": "Al-Anbiya", "ar": "الأنبياء", "page": 323}, {"n": 22, "name": "Al-Hajj", "ar": "الحج", "page": 332}, {"n": 23, "name": "Al-Mu'minun", "ar": "المؤمنون", "page": 343}, {"n": 24, "name": "An-Nur", "ar": "النور", "page": 351}, {"n": 25, "name": "Al-Furqan", "ar": "الفرقان", "page": 360}, {"n": 26, "name": "Ash-Shu'ara", "ar": "الشعراء", "page": 367}, {"n": 27, "name": "An-Naml", "ar": "النمل", "page": 377}, {"n": 28, "name": "Al-Qasas", "ar": "القصص", "page": 386}, {"n": 29, "name": "Al-'Ankabut", "ar": "العنكبوت", "page": 397}, {"n": 30, "name": "Ar-Rum", "ar": "الروم", "page": 405}, {"n": 31, "name": "Luqman", "ar": "لقمان", "page": 412}, {"n": 32, "name": "As-Sajdah", "ar": "السجدة", "page": 416}, {"n": 33, "name": "Al-Ahzab", "ar": "الأحزاب", "page": 419}, {"n": 34, "name": "Saba", "ar": "سبأ", "page": 429}, {"n": 35, "name": "Fatir", "ar": "فاطر", "page": 435}, {"n": 36, "name": "Ya-Sin", "ar": "يس", "page": 441}, {"n": 37, "name": "As-Saffat", "ar": "الصافات", "page": 446}, {"n": 38, "name": "Sad", "ar": "ص", "page": 453}, {"n": 39, "name": "Az-Zumar", "ar": "الزمر", "page": 459}, {"n": 40, "name": "Al-Mu'min", "ar": "المؤمن", "page": 468}, {"n": 41, "name": "Ha-Mim As-Sajdah", "ar": "حم السجدة", "page": 478}, {"n": 42, "name": "Ash-Shura", "ar": "الشورى", "page": 484}, {"n": 43, "name": "Az-Zukhruf", "ar": "الزخرف", "page": 490}, {"n": 44, "name": "Ad-Dukhan", "ar": "الدخان", "page": 496}, {"n": 45, "name": "Al-Jathiyah", "ar": "الجاثية", "page": 499}, {"n": 46, "name": "Al-Ahqaf", "ar": "الأحقاف", "page": 503}, {"n": 47, "name": "Muhammad", "ar": "محمد", "page": 507}, {"n": 48, "name": "Al-Fath", "ar": "الفتح", "page": 512}, {"n": 49, "name": "Al-Hujurat", "ar": "الحجرات", "page": 516}, {"n": 50, "name": "Qaf", "ar": "ق", "page": 519}, {"n": 51, "name": "Adh-Dhariyat", "ar": "الذاريات", "page": 521}, {"n": 52, "name": "At-Tur", "ar": "الطور", "page": 524}, {"n": 53, "name": "An-Najm", "ar": "النجم", "page": 527}, {"n": 54, "name": "Al-Qamar", "ar": "القمر", "page": 529}, {"n": 55, "name": "Ar-Rahman", "ar": "الرحمن", "page": 532}, {"n": 56, "name": "Al-Waqi'ah", "ar": "الواقعة", "page": 535}, {"n": 57, "name": "Al-Hadid", "ar": "الحديد", "page": 538}, {"n": 58, "name": "Al-Mujadilah", "ar": "المجادلة", "page": 543}, {"n": 59, "name": "Al-Hashr", "ar": "الحشر", "page": 546}, {"n": 60, "name": "Al-Mumtahanah", "ar": "الممتحنة", "page": 550}, {"n": 61, "name": "As-Saff", "ar": "الصف", "page": 552}, {"n": 62, "name": "Al-Jumu'ah", "ar": "الجمعة", "page": 554}, {"n": 63, "name": "Al-Munafiqun", "ar": "المنافقون", "page": 555}, {"n": 64, "name": "At-Taghabun", "ar": "التغابن", "page": 557}, {"n": 65, "name": "At-Talaq", "ar": "الطلاق", "page": 559}, {"n": 66, "name": "At-Tahrim", "ar": "التحريم", "page": 561}, {"n": 67, "name": "Al-Mulk", "ar": "الملك", "page": 563}, {"n": 68, "name": "Al-Qalam", "ar": "القلم", "page": 565}, {"n": 69, "name": "Al-Haqqah", "ar": "الحاقة", "page": 568}, {"n": 70, "name": "Al-Ma'arij", "ar": "المعارج", "page": 570}, {"n": 71, "name": "Nuh", "ar": "نوح", "page": 572}, {"n": 72, "name": "Al-Jinn", "ar": "الجن", "page": 574}, {"n": 73, "name": "Al-Muzzammil", "ar": "المزمل", "page": 577}, {"n": 74, "name": "Al-Muddaththir", "ar": "المدثر", "page": 579}, {"n": 75, "name": "Al-Qiyamah", "ar": "القيامة", "page": 581}, {"n": 76, "name": "Ad-Dahr", "ar": "الدهر", "page": 583}, {"n": 77, "name": "Al-Mursalat", "ar": "المرسلات", "page": 585}, {"n": 78, "name": "An-Naba", "ar": "النبأ", "page": 587}, {"n": 79, "name": "An-Nazi'at", "ar": "النازعات", "page": 588}, {"n": 80, "name": "'Abasa", "ar": "عبس", "page": 590}, {"n": 81, "name": "At-Takwir", "ar": "التكوير", "page": 591}, {"n": 82, "name": "Al-Infitar", "ar": "الانفطار", "page": 592}, {"n": 83, "name": "Al-Mutaffifin", "ar": "المطففين", "page": 593}, {"n": 84, "name": "Al-Inshiqaq", "ar": "الانشقاق", "page": 595}, {"n": 85, "name": "Al-Buruj", "ar": "البروج", "page": 596}, {"n": 86, "name": "At-Tariq", "ar": "الطارق", "page": 597}, {"n": 87, "name": "Al-A'la", "ar": "الأعلى", "page": 598}, {"n": 88, "name": "Al-Ghashiyah", "ar": "الغاشية", "page": 598}, {"n": 89, "name": "Al-Fajr", "ar": "الفجر", "page": 599}, {"n": 90, "name": "Al-Balad", "ar": "البلد", "page": 601}, {"n": 91, "name": "Ash-Shams", "ar": "الشمس", "page": 601}, {"n": 92, "name": "Al-Layl", "ar": "الليل", "page": 602}, {"n": 93, "name": "Ad-Duha", "ar": "الضحى", "page": 603}, {"n": 94, "name": "Alam Nashrah", "ar": "الشرح", "page": 603}, {"n": 95, "name": "At-Tin", "ar": "التين", "page": 604}, {"n": 96, "name": "Al-'Alaq", "ar": "العلق", "page": 604}, {"n": 97, "name": "Al-Qadr", "ar": "القدر", "page": 605}, {"n": 98, "name": "Al-Bayyinah", "ar": "البينة", "page": 605}, {"n": 99, "name": "Az-Zalzalah", "ar": "الزلزلة", "page": 606}, {"n": 100, "name": "Al-'Adiyat", "ar": "العاديات", "page": 606}, {"n": 101, "name": "Al-Qari'ah", "ar": "القارعة", "page": 607}, {"n": 102, "name": "At-Takathur", "ar": "التكاثر", "page": 607}, {"n": 103, "name": "Al-'Asr", "ar": "العصر", "page": 608}, {"n": 104, "name": "Al-Humazah", "ar": "الهمزة", "page": 608}, {"n": 105, "name": "Al-Fil", "ar": "الفيل", "page": 608}, {"n": 106, "name": "Quraysh", "ar": "قريش", "page": 609}, {"n": 107, "name": "Al-Ma'un", "ar": "الماعون", "page": 609}, {"n": 108, "name": "Al-Kawthar", "ar": "الكوثر", "page": 609}, {"n": 109, "name": "Al-Kafirun", "ar": "الكافرون", "page": 609}, {"n": 110, "name": "An-Nasr", "ar": "النصر", "page": 610}, {"n": 111, "name": "Al-Lahab", "ar": "اللهب", "page": 610}, {"n": 112, "name": "Al-Ikhlas", "ar": "الإخلاص", "page": 610}, {"n": 113, "name": "Al-Falaq", "ar": "الفلق", "page": 611}, {"n": 114, "name": "An-Nas", "ar": "الناس", "page": 611}];
/* The 7 Manzil each begin at the start of a Surah: Al-Fatihah, Al-Ma'idah, Yunus, Bani Isra'il, Ash-Shu'ara, As-Saffat, Qaf */
const QURAN_MANZILS = [1, 5, 10, 17, 26, 37, 50].map((s, i, arr)=>{
  const first = QURAN_SURAHS[s - 1], last = QURAN_SURAHS[(arr[i + 1] || 115) - 2];
  return { n: i + 1, name: `Manzil ${i + 1}`, from: first.name, to: last.name, page: first.page };
});
function quranParaOf(page){ let r = QURAN_PARAS[0]; for(const x of QURAN_PARAS) if(x.page<=page) r = x; return r; }
function quranManzilOf(page){ let r = QURAN_MANZILS[0]; for(const x of QURAN_MANZILS) if(x.page<=page) r = x; return r; }
function quranSurahOf(page){ let r = QURAN_SURAHS[0]; for(const x of QURAN_SURAHS) if(x.page<=page) r = x; return r; }
/* Two Mushaf editions with identical page numbering, so Para / Surah / Manzil lists, bookmarks and the
   last page are shared. Tajweed page n is PDF page n+8 of the source (its first 8 pages are the rules guide). */
function quranEd(){ return state.quranEd==='tajweed' ? 'tajweed' : 'normal'; }
function quranEdLabel(ed){ return (ed||quranEd())==='tajweed' ? L({rur:"Qur'an (Tajweed)", en:'Quran (Tajweed)'}) : "Qur'an Majeed"; }
function quranImg(n, ed){ const pad = String(n).padStart(3,'0'); return (ed||quranEd())==='tajweed' ? `quran/tajweed/${pad}.webp` : `quran/pages/${pad}.png`; }
const TAJWEED_GUIDE_COUNT = 8;
const TAJWEED_GUIDE_LIST = Array.from({ length: TAJWEED_GUIDE_COUNT }, (_, i) => i + 1);
function quranMarked(p){ return (state.quranMarks||[]).includes(p); }
/* Night page: white text on black. Follows the app's dark theme unless the reader switched it */
/* Reading tints: a light colour laid over the page picture with multiply, so black text stays black. */
const QURAN_TINTS = [{k:'',n:'Original',c:''},{k:'cream',n:'Cream',c:'#f3e6c4',a:'#a8801a'},{k:'sand',n:'Sand',c:'#e6d2a8',a:'#8a6a2a'},{k:'mint',n:'Mint',c:'#d6ecd9',a:'#2f8f57'},{k:'sky',n:'Sky',c:'#d3e6f6',a:'#2b7fc0'},{k:'rose',n:'Rose',c:'#f6d9e1',a:'#c2456b'},{k:'lilac',n:'Lilac',c:'#e3daf3',a:'#7a5fc8'}];
/* the recitation player wears the same colour as the page */
function quranTintPlayer(){
  const t = QURAN_TINTS.find(x=>x.k === (state.quranTint||'')), on = t && t.c && (document.getElementById('quranWrap') || document.getElementById('tbSheet') || document.getElementById('tfWrap')) && !quranNightOn();
  ['qPlayer','tpPanel'].forEach(id=>{
    const q = document.getElementById(id); if(!q) return;
    if(on){ q.setAttribute('data-tint', t.k); q.style.setProperty('--qtc', t.c); q.style.setProperty('--qta', t.a); } else q.removeAttribute('data-tint');
  });
  if(typeof trpRulesLater === 'function') trpRulesLater();
}
let quranTintOpen = false;
function quranTintApply(){
  quranTintPlayer();
  const wrap = document.getElementById('quranWrap'); if(!wrap) return;
  let el = wrap.querySelector('.qtint');
  const t = QURAN_TINTS.find(x=>x.k === (state.quranTint||'')), img = wrap.querySelector('.quran-page-img');
  if(!t || !t.c || !img || quranNightOn()){ if(el) el.remove(); return; }
  if(!img.naturalWidth){ if(!img._tw){ img._tw = 1; img.addEventListener('load', quranTintApply, { once:true }); } return; }
  const bw = img.clientWidth, bh = img.clientHeight, k = Math.min(bw / img.naturalWidth, bh / img.naturalHeight), iw = img.naturalWidth * k, ih = img.naturalHeight * k;
  if(!el){ el = document.createElement('div'); el.className = 'qtint'; wrap.appendChild(el); }
  el.style.cssText = `background:${t.c};left:${(img.offsetLeft + (bw - iw) / 2).toFixed(1)}px;top:${(img.offsetTop + (bh - ih) / 2).toFixed(1)}px;width:${iw.toFixed(1)}px;height:${ih.toFixed(1)}px`;
}
window.addEventListener('resize', ()=>quranTintApply());
function quranNightOn(){
  if(typeof state.quranNight === 'boolean') return state.quranNight;
  const m = getComputedStyle(document.body).backgroundColor.match(/\d+/g);
  return m ? (0.299*m[0] + 0.587*m[1] + 0.114*m[2]) < 110 : false;
}
let quranDl = null; // offline download in progress: { done, total, stop }
async function quranCachedCount(){
  const dir = quranEd()==='tajweed' ? '/quran/tajweed/' : '/quran/pages/';
  try{ const c = await caches.open('waqt24-quran-v1'); return (await c.keys()).filter(r=>r.url.includes(dir) && /\/\d{3}\.(png|webp)/.test(r.url)).length; }catch(e){ return 0; }
}
async function startQuranDownload(onProgress){
  if(quranDl) return;
  let have = new Set();
  try{ const c = await caches.open('waqt24-quran-v1'); const dir = quranEd()==='tajweed' ? 'tajweed' : 'pages'; (await c.keys()).forEach(r=>{ const m = r.url.match(new RegExp('/quran/' + dir + '/(\\d{3})\\.')); if(m) have.add(+m[1]); }); }catch(e){}
  const todo = QURAN_PAGE_LIST.filter(n=>!have.has(n));
  quranDl = { done: QURAN_PAGE_COUNT - todo.length, total: QURAN_PAGE_COUNT, stop:false, ed:quranEd() };
  onProgress();
  let next = 0;
  const worker = async ()=>{
    while(!quranDl.stop && next < todo.length){
      const n = todo[next++];
      try{ await fetch(quranImg(n, quranDl.ed)); quranDl.done++; }catch(e){}
      onProgress();
    }
  };
  await Promise.all([worker(), worker(), worker(), worker()]);
  const finished = !quranDl.stop;
  quranDl = null; onProgress(finished);
}
function quranLastPage(){ return (state.quranPage>=1 && state.quranPage<=QURAN_PAGE_COUNT) ? state.quranPage : 1; }

/* ============================================================
   TILAWAT: a page counts as read after 8 seconds on it; daily target and Khatm progress
   ============================================================ */
let quranReadTimer = null;
const KHATM_FIRST = 2, KHATM_LAST = 611, KHATM_PAGES = KHATM_LAST - KHATM_FIRST + 1;
function tilawatTarget(){ return Math.max(1, Math.min(120, state.tilawatTarget || 2)); }
function tilawatCount(d){ const k = dayKey(d||new Date()); return ((state.qread||{})[k] || []).length + ((state.qmanual||{})[k] || 0); }
/* Pages read from a printed Qur'an (or anywhere outside the app), entered by hand */
function addManualPages(n){
  if(!state.qmanual) state.qmanual = {};
  const k = dayKey(new Date());
  const before = tilawatCount();
  const cur = state.qmanual[k] || 0, next = Math.max(0, cur + n);
  state.qmanual[k] = next;
  const kh = khatmState(); kh.extra = Math.max(0, (kh.extra || 0) + (next - cur)); // hardcopy pages also count toward the Khatm
  saveState();
  if(before < tilawatTarget() && tilawatCount() >= tilawatTarget()) showToast(L({rur:'Mashallah! Aaj ka tilawat ka target poora 🎉', en:'Mashallah! Today’s reading target is done 🎉'}));
}
function khatmState(){ if(!state.khatm) state.khatm = { start: Date.now(), pages:{}, done:0 }; return state.khatm; }
function markQuranPageRead(page){
  if(!state.qread) state.qread = {};
  const k = dayKey(new Date());
  const list = state.qread[k] || (state.qread[k] = []);
  if(!list.includes(page)) list.push(page);
  if(page >= KHATM_FIRST && page <= KHATM_LAST) khatmState().pages[page] = 1;
  // keep about 90 days of daily reading
  const cutoff = Date.now() - 90*86400000;
  Object.keys(state.qread).forEach(x=>{ const [y,m,dd] = x.split('-').map(Number); if(new Date(y, m-1, dd).getTime() < cutoff) delete state.qread[x]; });
  saveState();
  if(tilawatCount() === tilawatTarget()) showToast(L({rur:'Mashallah! Aaj ka tilawat ka target poora 🎉', en:'Mashallah! Today\u2019s reading target is done 🎉'}));
}
function khatmInfo(){
  const k = khatmState();
  const read = Math.min(KHATM_PAGES, Object.keys(k.pages).length + (k.extra || 0));
  const days = Math.max(1, Math.ceil((Date.now() - k.start) / 86400000));
  const pace = read / days;
  const left = KHATM_PAGES - read;
  const eta = pace > 0 && left > 0 ? new Date(Date.now() + Math.ceil(left / pace) * 86400000) : null;
  return { read, left, pct: Math.min(100, Math.round(read / KHATM_PAGES * 100)), pace, eta, days, done: k.done || 0 };
}
/* Khatm plan: finish in N days (preset or custom). Expected pages by today vs pages read; sets the daily reading target. */
function khatmPlanInfo(){
  const k = khatmState(), pl = k.plan; if(!pl || !pl.days) return null;
  const read = khatmInfo().read, N = pl.days;
  const dayNo = Math.min(N, Math.max(1, Math.floor((Date.now() - pl.start) / 86400000) + 1));
  const perDay = Math.ceil(KHATM_PAGES / N);
  const expected = Math.min(KHATM_PAGES, Math.ceil(KHATM_PAGES * dayNo / N)), before = Math.ceil(KHATM_PAGES * (dayNo - 1) / N); // pages due by end of today / by end of yesterday
  const end = new Date(pl.start + N * 86400000 - 86400000);
  return { N, dayNo, perDay, expected, before, read, diff: read - expected, behind: Math.max(0, before - read), end, over: Date.now() > pl.start + N * 86400000 && read < KHATM_PAGES, left: KHATM_PAGES - read, daysLeft: Math.max(1, N - dayNo + 1) };
}
function khatmSetPlan(days){
  days = Math.max(1, Math.min(730, Math.round(days) || 0)); if(!days) return;
  khatmState().plan = { days, start: new Date().setHours(0, 0, 0, 0) };
  state.tilawatTarget = Math.min(120, Math.ceil(KHATM_PAGES / days));
  saveState();
}
function khatmPlanHtml(){
  const pi = khatmPlanInfo();
  const presets = [7, 15, 30, 40, 60, 90, 180, 365];
  const chips = `<div class="kp-chips">${presets.map(d=>`<button type="button" class="kp-chip${pi && pi.N === d ? ' on' : ''}" data-kp="${d}">${d} ${L({rur:'din', en:'days'})}</button>`).join('')}</div>
    <div class="kp-custom"><span>${L({rur:'Apne din:', en:'Custom days:'})}</span><input type="number" id="kpDays" min="1" max="730" inputmode="numeric" placeholder="45" value="${pi && presets.indexOf(pi.N) < 0 ? pi.N : ''}"><button type="button" id="kpSet">${L({rur:'Plan banayein', en:'Set plan'})}</button></div>`;
  if(!pi) return `<div class="kp"><div class="kp-title">🗓️ ${L({rur:'Khatm ka plan', en:'Khatm planner'})}</div><div class="tl-sub">${L({rur:'Kitne din mein Khatm karna hai? Rozana ke page khud ban jayenge.', en:'How many days to finish? Daily pages are worked out for you.'})}</div>${chips}</div>`;
  const ahead = pi.behind > 0 ? `<span class="kp-bad">${pi.behind} ${L({rur:'page peeche', en:'pages behind'})}</span>`
    : pi.diff >= 0 ? `<span class="kp-ok">${pi.diff > 0 ? '+' + pi.diff + ' ' + L({rur:'page aage', en:'pages ahead'}) : L({rur:'Aaj ka hissa poora ✓', en:'Today\u2019s part done ✓'})}</span>`
    : `<span class="kp-ok">${L({rur:'Waqt par', en:'On track'})}</span> · ${L({rur:'aaj ke', en:'today:'})} ${-pi.diff} ${L({rur:'page baaki', en:'pages to go'})}`;
  const catchUp = pi.behind > 0 && pi.left > 0 ? `<div class="tl-sub">${L({rur:'Barabar hone ke liye ab rozana', en:'To catch up, read'})} <b>${Math.ceil(pi.left / pi.daysLeft)}</b> ${L({rur:'page padhein', en:'pages a day now'})}</div>` : '';
  return `<div class="kp"><div class="kp-title">🗓️ ${L({rur:'Khatm ka plan', en:'Khatm planner'})}: ${pi.N} ${L({rur:'din', en:'days'})} <span class="tl-sub">(${L({rur:'din', en:'day'})} ${pi.dayNo}/${pi.N})</span></div>
    <div class="tl-sub">${L({rur:'Rozana', en:'Daily'})} <b>${pi.perDay}</b> ${L({rur:'page', en:'pages'})} · ${L({rur:'Aaj ke aakhir tak', en:'By end of today'})} ${pi.expected} ${L({rur:'page', en:'pages'})}, ${L({rur:'aapne', en:'you read'})} ${pi.read} · ${ahead}</div>
    ${catchUp}${pi.over ? `<div class="tl-sub kp-bad">${L({rur:'Plan ke din poore ho gaye; naya plan banayein ya jaari rakhein.', en:'Plan days are over; set a new plan or keep reading.'})}</div>` : ''}
    <div class="tl-sub">${L({rur:'Aakhri din', en:'Finish date'})}: ${pi.end.getDate()} ${MON[pi.end.getMonth()]} ${pi.end.getFullYear()}</div>
    ${chips}<button type="button" class="kp-clear" id="kpClear">${L({rur:'Plan hatayein', en:'Remove plan'})}</button></div>`;
}
function tilawatCardsHtml(){
  const n = tilawatCount(), t = tilawatTarget(), kh = khatmInfo();
  const etaTxt = kh.left <= 0 ? L({rur:'Khatm mukammal! Mashallah', en:'Khatm complete! Mashallah'})
    : kh.eta ? `${L({rur:'Is raftaar se mukammal', en:'At this pace, done by'})}: ${kh.eta.getDate()} ${MON[kh.eta.getMonth()]} ${kh.eta.getFullYear()}` : L({rur:'Padhna shuru karein to andaaza dikhega', en:'Start reading to see an estimate'});
  return `<div class="ramzan-card tl-card" style="margin:0 14px 10px;">
      <div class="tl-head"><b>📖 ${L({rur:'Aaj ki Tilawat', en:'Today\u2019s Reading'})}</b><span class="tl-count ${n>=t?'ok':''}">${n} / ${t} ${L({rur:'page', en:'pages'})}</span></div>
      <div class="tl-bar"><i style="width:${Math.min(100, n/t*100)}%"></i></div>
      <div class="tl-target"><span>${L({rur:'Rozana target', en:'Daily target'})}</span><button id="tlMinus">−</button><b>${t}</b><button id="tlPlus">+</button></div>
      <div class="tl-target"><span>📕 ${L({rur:'Kitab (hardcopy) se padhe page', en:'Pages read from a printed copy'})}</span><button id="tlManMinus">−</button><b>${(state.qmanual||{})[dayKey(new Date())] || 0}</b><button id="tlManPlus">+</button></div>
      ${n < t ? `<button class="quran-tool" id="tlDone" style="margin-top:8px;">✅ ${L({rur:'Aaj ka target poora (hardcopy se padha)', en:'Mark today’s target done (read on paper)'})}</button>` : ''}
    </div>
    <div class="ramzan-card tl-card" style="margin:0 14px 12px;">
      <div class="tl-head"><b>🏁 ${L({rur:'Khatm', en:'Khatm'})}${kh.done ? ` <span class="tl-sub">(${kh.done} ${L({rur:'mukammal', en:'completed'})})</span>` : ''}</b><span class="tl-count">${kh.pct}%</span></div>
      <div class="tl-bar"><i style="width:${kh.pct}%"></i></div>
      <div class="tl-sub">${kh.read} / ${KHATM_PAGES} ${L({rur:'page', en:'pages'})} · ${kh.pace.toFixed(1)} ${L({rur:'page rozana', en:'pages a day'})} · ${etaTxt}</div>
      ${khatmPlanHtml()}
      <button class="quran-tool" id="khatmNew" style="margin-top:8px;">${L({rur:'Naya Khatm shuru karein', en:'Start a new Khatm'})}</button>
    </div>`;
}
function wireTilawatCards(rerender){
  const t = tilawatTarget();
  document.getElementById('tlMinus').onclick = ()=>{ state.tilawatTarget = Math.max(1, t-1); saveState(); rerender(); };
  document.getElementById('tlPlus').onclick = ()=>{ state.tilawatTarget = Math.min(120, t+1); saveState(); rerender(); };
  document.getElementById('tlManPlus').onclick = ()=>{ addManualPages(1); rerender(); };
  document.getElementById('tlManMinus').onclick = ()=>{ addManualPages(-1); rerender(); };
  const done = document.getElementById('tlDone');
  if(done) done.onclick = ()=>{ addManualPages(Math.max(0, tilawatTarget() - tilawatCount())); rerender(); };
  document.querySelectorAll('.kp-chip').forEach(b=>{ b.onclick = ()=>{ khatmSetPlan(+b.dataset.kp); rerender(); showToast(L({rur:'Plan ban gaya: rozana ' + Math.ceil(KHATM_PAGES / +b.dataset.kp) + ' page', en:'Plan set: ' + Math.ceil(KHATM_PAGES / +b.dataset.kp) + ' pages a day'})); }; });
  const kpSet = document.getElementById('kpSet');
  if(kpSet) kpSet.onclick = ()=>{ const v = parseInt(document.getElementById('kpDays').value); if(!(v >= 1)) return showToast(L({rur:'Din likhein (1 se 730)', en:'Enter days (1 to 730)'})); khatmSetPlan(v); rerender(); showToast(L({rur:'Plan ban gaya: rozana ' + Math.ceil(KHATM_PAGES / v) + ' page', en:'Plan set: ' + Math.ceil(KHATM_PAGES / v) + ' pages a day'})); };
  const kpClear = document.getElementById('kpClear');
  if(kpClear) kpClear.onclick = ()=>{ delete khatmState().plan; saveState(); rerender(); };
  document.getElementById('khatmNew').onclick = async ()=>{
    const kh = khatmInfo();
    if(!(await appConfirm(L({rur:'Naya Khatm shuru karein? Abhi ka hisaab (' + kh.read + ' page) saaf ho jayega.', en:'Start a new Khatm? The current count (' + kh.read + ' pages) will be cleared.'})))) return;
    const done = (state.khatm && state.khatm.done || 0) + (kh.left <= 0 ? 1 : 0);
    state.khatm = { start: Date.now(), pages:{}, done }; saveState(); rerender();
  };
}
/* Share the page as a JPEG (widely accepted by chat apps), or download it where sharing files isn't supported */
async function shareQuranPage(page){
  try{
    const img = new Image(); img.src = quranImg(page);
    await img.decode();
    const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight;
    const ctx = c.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height); ctx.drawImage(img, 0, 0);
    const blob = await new Promise(r=> c.toBlob(r, 'image/jpeg', 0.9));
    const s = quranSurahOf(page);
    const name = `quran-${quranEd()}-page-${page}.jpg`;
    const file = new File([blob], name, { type:'image/jpeg' });
    const text = `${quranEdLabel()} · Page ${page} · ${s.n}. ${s.name} (Waqt24)`;
    if(navigator.canShare && navigator.canShare({ files:[file] })){ await navigator.share({ files:[file], title:text, text }); return; }
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=> URL.revokeObjectURL(a.href), 2000);
    showToast(L({rur:'Page download ho gaya', en:'Page downloaded'}));
  }catch(e){ if(e && e.name==='AbortError') return; showToast(L({rur:'Share nahi ho saka', en:'Could not share'})); }
}
/* Screen Wake Lock (supported phones): the screen does not dim while reading; released when the reader closes */
let quranWakeLock = null, quranReaderOpen = false;
async function quranWake(on){
  quranReaderOpen = on;
  try{
    if(on && !quranWakeLock && navigator.wakeLock && !document.hidden){
      quranWakeLock = await navigator.wakeLock.request('screen');
      quranWakeLock.addEventListener('release', ()=>{ quranWakeLock = null; });
    } else if(!on && quranWakeLock){ await quranWakeLock.release(); quranWakeLock = null; }
  }catch(e){ quranWakeLock = null; }
}
document.addEventListener('visibilitychange', ()=>{ if(!document.hidden && quranReaderOpen) quranWake(true); });
function renderQuranReader(page){
  quranWake(true);
  page = Math.max(1, Math.min(QURAN_PAGE_COUNT, page || quranLastPage()));
  /* A page change inside the reader (or a pick from the index) moves the recitation too; merely reopening the reader does not */
  const qaFlip = !!document.getElementById('quranWrap') || qa.forceSync; qa.forceSync = false;
  if(qaFlip) qaSyncToPage(page);
  const prevPage = state.quranPage; state.quranPage = page; qLastSet('mushaf');
  clearTimeout(quranReadTimer); quranReadTimer = setTimeout(()=> markQuranPageRead(page), 8000);
  state.lastRead = { k:'quran', id:page, ed:quranEd(), label:`${quranEdLabel()} · Page ${page} · ${quranSurahOf(page).name}` };
  saveState();
  setNavCtx(QURAN_PAGE_LIST, page - 1, (p, i)=> renderQuranReader(p), null);
  __navCtx.rtl = true; // Arabic reads right to left, so page turns run the other way
  document.getElementById('detailTitle').textContent = `${quranEdLabel()} · ${page}/${QURAN_PAGE_COUNT}`;
  const pad = String(page).padStart(3, '0');
  const para = quranParaOf(page), surah = quranSurahOf(page), manzil = quranManzilOf(page);
  document.getElementById('detailBody').innerHTML = `
    <div class="quran-index-row">
      <button class="quran-index-btn qi-short" id="quranParaBtn" title="${para.name}"><span>📚</span> ${L({rur:'Paara', en:'Para'})} ${para.n}</button>
      <button class="quran-index-btn" id="quranSurahBtn"><span>📜</span> ${surah.n}. ${surah.name}</button>
      <button class="quran-index-btn qi-short" id="quranManzilBtn"><span>🏷️</span> ${L({rur:'Manzil', en:'Manzil'})} ${manzil.n}</button>
    </div>
    <div class="quran-page-wrap${quranNightOn() ? (quranEd()==='tajweed' ? ' night-color' : ' night') : ''}" id="quranWrap">
      <img class="quran-page-img" src="${quranImg(page)}" alt="Quran page ${page}" draggable="false">
    </div>
    ${pnBarHtml()}
    <div class="quran-tools">
      <button class="quran-tool ${quranMarked(page)?'on':''}" id="quranMarkBtn">🔖 ${quranMarked(page) ? L({rur:'Nishaan laga hai', en:'Bookmarked'}) : L({rur:'Nishaan lagayein', en:'Bookmark'})}</button>
      <button class="quran-tool qt-ed" id="quranEdBtn">${quranEd()==='tajweed' ? quranBookSvg(false, 22) + ' Normal' : quranBookSvg(true, 22) + ' Tajweed'}</button>
      <button class="quran-tool ${qa.on?'on':''}" id="quranListenBtn">🎧 ${L({rur:'Tilawat sunein', en:'Listen'})}</button>
      <button class="quran-tool ${state.quranTrPage?'on':''}" id="quranTpBtn">📜 ${L({rur:'Tarjuma', en:'Translation'})}</button>
      <button class="quran-tool ${notesForPage(page).length?'on':''}" id="quranNoteBtn">📝 ${L({rur:'Note', en:'Note'})}${notesForPage(page).length ? ' (' + notesForPage(page).length + ')' : ''}</button>
      <button class="quran-tool qt-moretog ${state.qToolsOpen?'on':''}" id="quranMoreBtn" aria-expanded="${!!state.qToolsOpen}">${state.qToolsOpen ? '▴' : '⋯'} ${L({rur:'Aur', en:'More'})}</button>
      <span class="qt-more" ${state.qToolsOpen ? '' : 'hidden'}>
      <button class="quran-tool ${state.quranTint?'on':''}" id="quranTintBtn">🎨 ${L({rur:'Rang', en:'Tint'})}</button>
      <button class="quran-tool ${quranNightOn()?'on':''}" id="quranNightBtn">🌙 ${L({rur:'Andhera', en:'Night'})}</button>
      <button class="quran-tool" id="quranZoomBtn">🔍 ${L({rur:'Bara karein', en:'Zoom'})}</button>
      <button class="quran-tool" id="quranShareBtn">📤 ${L({rur:'Share', en:'Share'})}</button>
      <button class="quran-tool ${state.quranTurnSound?'on':''}" id="quranSoundBtn">${state.quranTurnSound ? '🔈' : '🔇'} ${L({rur:'Awaaz', en:'Sound'})}</button>
      <button class="quran-tool" id="quranSignsBtn">🛑 ${L({rur:'Alamaat', en:'Signs'})}</button>
      </span>
    </div>
    <div class="q-tints" id="qTints" ${quranTintOpen ? '' : 'hidden'}>${QURAN_TINTS.map(t=>`<button type="button" class="q-tint${(state.quranTint||'')===t.k?' active':''}" data-t="${t.k}" style="--tc:${t.c || '#ffffff'}" aria-label="${t.n}" title="${t.n}"></button>`).join('')}</div>
  `;
  pageJumpWire(1, QURAN_PAGE_COUNT, page, v=> renderQuranReader(v));
  document.getElementById('quranMarkBtn').onclick = ()=>{
    const m = state.quranMarks || (state.quranMarks = []);
    const i = m.indexOf(page);
    if(i>=0) m.splice(i,1); else { m.push(page); m.sort((x,y)=>x-y); }
    saveState(); renderQuranReader(page);
    showToast(i>=0 ? L({rur:'Nishaan hata diya', en:'Bookmark removed'}) : L({rur:'Nishaan laga diya', en:'Bookmarked'}));
  };
  document.getElementById('quranNoteBtn').onclick = ()=> openNoteBox({ page }, ()=>{ const b = document.getElementById('quranNoteBtn'); if(b){ const c = notesForPage(page).length; b.classList.toggle('on', c > 0); b.textContent = '📝 ' + L({rur:'Note', en:'Note'}) + (c ? ' (' + c + ')' : ''); } });
  document.getElementById('quranMoreBtn').onclick = ()=>{ state.qToolsOpen = !state.qToolsOpen; saveState(); const sp = document.querySelector('.qt-more'); sp.hidden = !state.qToolsOpen; const b = document.getElementById('quranMoreBtn'); b.classList.toggle('on', !!state.qToolsOpen); b.setAttribute('aria-expanded', !!state.qToolsOpen); b.textContent = (state.qToolsOpen ? '▴' : '⋯') + ' ' + L({rur:'Aur', en:'More'}); };
  document.getElementById('quranTintBtn').onclick = ()=>{ quranTintOpen = !quranTintOpen; document.getElementById('qTints').hidden = !quranTintOpen; };
  document.getElementById('qTints').onclick = e=>{ const b = e.target.closest('.q-tint'); if(!b) return; state.quranTint = b.dataset.t; if(b.dataset.t) state.quranNight = false; saveState(); renderQuranReader(page); };
  quranTintApply();
  document.getElementById('quranTpBtn').onclick = ()=>{ state.quranTrPage = !state.quranTrPage; saveState(); renderQuranReader(page); };
  if(state.quranTrPage) trpFill(page); else if(typeof trpHide === 'function') trpHide();
  document.getElementById('quranNightBtn').onclick = ()=>{ state.quranNight = !quranNightOn(); saveState(); renderQuranReader(page); };
  const wrap = document.getElementById('quranWrap');
  const toggleZoom = ()=>{ wrap.classList.toggle('zoomed'); document.getElementById('quranZoomBtn').classList.toggle('on', wrap.classList.contains('zoomed')); setTimeout(()=>{ if(typeof qaHL === 'function') qaHL(); quranTintApply(); }, 30); };
  document.getElementById('quranZoomBtn').onclick = toggleZoom;
  document.getElementById('quranListenBtn').onclick = ()=>{ if(qa.on) qaStop(); else quranListen(page); };
  if(typeof qaHL === 'function') qaHL();
  document.getElementById('quranSignsBtn').onclick = renderQuranSigns;
  document.getElementById('quranShareBtn').onclick = ()=> shareQuranPage(page);
  document.getElementById('quranSoundBtn').onclick = ()=>{ state.quranTurnSound = !state.quranTurnSound; saveState(); renderQuranReader(page); if(state.quranTurnSound) playPageSound(); };
  document.getElementById('quranEdBtn').onclick = ()=>{ state.quranEd = quranEd()==='tajweed' ? 'normal' : 'tajweed'; saveState(); renderQuranReader(page); };
  let lastTap = 0;
  wrap.addEventListener('click', ()=>{ const t = Date.now(); if(t - lastTap < 320) toggleZoom(); lastTap = t; });
  document.getElementById('quranParaBtn').onclick = ()=>{ qiOpener = null; renderQuranIndex('para'); };
  document.getElementById('quranSurahBtn').onclick = ()=>{ qiOpener = null; renderQuranIndex('surah'); };
  document.getElementById('quranManzilBtn').onclick = ()=>{ qiOpener = null; renderQuranIndex('manzil'); };
  if(qaFlip && prevPage && prevPage !== page){ const im = document.querySelector('.quran-page-img'); if(im){ im.classList.add(page > prevPage ? 'turn-l' : 'turn-r'); setTimeout(()=>im.classList.remove('turn-l', 'turn-r'), 360); } }
  { const im = document.querySelector('.quran-page-img'), w = im && im.parentElement; if(im && w){ const ready = ()=> w.classList.add('ready'); if(im.complete) ready(); else { im.addEventListener('load', ready); im.addEventListener('error', ready); } } }
  wirePnBar();
  // two pages each way, so fast page turns never show a blank page
  [page + 1, page - 1, page + 2, page - 2].forEach(n=>{ if(n>=1 && n<=QURAN_PAGE_COUNT){ const im = new Image(); im.src = quranImg(n); } });
  const sub = document.getElementById('quranSub');
  if(sub) sub.textContent = L({rur:`Page ${page}/${QURAN_PAGE_COUNT}`, en:`Page ${page}/${QURAN_PAGE_COUNT}`});
}
/* ============================================================
   QUR'AN KI ALAMAAT: stopping signs (waqf) and the other marks on a Mushaf page, explained in Roman Urdu
   (waqf rules follow the Understand Quran "Asan Qaidah, Lesson 21: Stopping Signs" sheet)
   ============================================================ */
// level: red = rukna zaroori / ek jagah, amber = rukna behtar, yellow = dono jaaiz, green = milaana behtar, nostop = mat rukiye
const WAQF_SIGNS = [
  { s:'۝', name:{rur:'Aayat ka khatma', en:'End of an ayah'}, lvl:'amber',
    m:{rur:'Aayat yahan poori hoti hai; is ke andar aayat ka number hota hai.', en:'The ayah ends here; the circle holds the ayah number.'},
    x:{rur:'Har aayat ke aakhir par rukna Nabi ﷺ ki Sunnat hai.', en:'Stopping at the end of every ayah is the Sunnah of the Prophet ﷺ.'} },
  { s:'م', name:{rur:'Waqf-e-Laazim', en:'Waqf Lazim (compulsory stop)'}, lvl:'red',
    m:{rur:'Yahan rukna zaroori hai.', en:'You must stop here.'},
    x:{rur:'Agar yahan na ruken aur aage mila kar padhein to maana badal sakta hai.', en:'Joining it to what follows can change the meaning.'} },
  { s:'س · سكتة', name:{rur:'Saktah', en:'Saktah (short pause)'}, lvl:'red',
    m:{rur:'Saans liye baghair zara sa ruk jaayein.', en:'Pause briefly without taking a breath.'},
    x:{rur:'Lagbhag do harkat ke barabar ruk kar, saans liye baghair, aage padhein.', en:'Pause for about two harakah without breathing, then carry on.'} },
  { s:'وقفة', name:{rur:'Waqfah', en:'Waqfah (longer pause)'}, lvl:'amber',
    m:{rur:'Saktah se thoda lamba rukna.', en:'A longer pause than a saktah.'},
    x:{rur:'Saktah se zyada der rukiye, lekin saans na lijiye; phir aage padhein.', en:'Pause longer than a saktah, still without a breath, then continue.'} },
  { s:'∴ ∴', name:{rur:'Mu\u2019aanaqah (teen nuqte, do jagah)', en:'Mu\u2019anaqah (pair of three dots)'}, lvl:'red',
    m:{rur:'Do jagah teen teen nuqte: in mein se kisi ek par ruk jaayein.', en:'Three dots in two places: stop at one of them.'},
    x:{rur:'Dono jagah na rukiye aur dono jagah se aage bhi na nikal jaayein; sirf ek par rukna hai.', en:'Do not stop at both, and do not skip both; stop at only one.'} },
  { s:'ط', name:{rur:'Waqf-e-Mutlaq', en:'Waqf Mutlaq'}, lvl:'amber',
    m:{rur:'Yahan rukna behtar hai.', en:'It is better to stop here.'},
    x:{rur:'Baat yahan poori ho jaati hai, is liye ruk jaana behtar hai.', en:'The thought is complete here, so stopping is preferred.'} },
  { s:'قف', name:{rur:'Qif', en:'Qif'}, lvl:'amber',
    m:{rur:'"Ruk jaao": yahan ruk jaayein.', en:'"Stop": stop here.'},
    x:{rur:'Yeh rukne ki hidayat hai; rukna behtar hai, aage milana bhi jaaiz hai.', en:'It is an instruction to stop; stopping is better, though continuing is allowed.'} },
  { s:'قلے', name:{rur:'Qeela alaihil-waqf', en:'Qila alayhil-waqf'}, lvl:'amber',
    m:{rur:'Yahan rukna behtar hai.', en:'It is better to stop here.'},
    x:{rur:'Kai ulama ne yahan rukne ko pasand kiya hai; milana bhi jaaiz hai.', en:'Many scholars preferred stopping here; continuing is also allowed.'} },
  { s:'ج', name:{rur:'Waqf-e-Jaaiz', en:'Waqf Jaiz (permissible)'}, lvl:'yellow',
    m:{rur:'Rukna bhi jaaiz, milana bhi jaaiz.', en:'You may stop or continue.'},
    x:{rur:'Dono tarah sahi hai; jo aasaan ho woh kijiye.', en:'Both are correct; do whichever is easier.'} },
  { s:'صلے', name:{rur:'Al-waslu aula', en:'Al-waslu awla'}, lvl:'yellow',
    m:{rur:'Rukna jaaiz hai, lekin milana behtar.', en:'Stopping is allowed, but joining is better.'},
    x:{rur:'Zaroorat ho to ruk sakte hain, warna aage mila kar padhein.', en:'You may stop if needed; otherwise read on.'} },
  { s:'لا ۝', name:{rur:'Aayat ke nishaan par لا', en:'لا over the ayah circle'}, lvl:'yellow',
    m:{rur:'Aayat ke aakhir par rukna bhi jaaiz, milana bhi.', en:'At the ayah end you may stop or continue.'},
    x:{rur:'Aayat khatam hai, is liye ruk sakte hain; lekin maana agli aayat se juda hai, is liye milana bhi theek hai.', en:'The ayah ends, so you may stop; the meaning continues, so joining is also fine.'} },
  { s:'ز', name:{rur:'Waqf-e-Mujawwaz', en:'Waqf Mujawwaz'}, lvl:'green',
    m:{rur:'Milana behtar hai.', en:'Better to continue.'},
    x:{rur:'Rukna jaaiz hai, lekin aage mila kar padhna behtar.', en:'Stopping is allowed, but continuing is better.'} },
  { s:'ص', name:{rur:'Waqf-e-Murakhkhas', en:'Waqf Murakhkhas'}, lvl:'green',
    m:{rur:'Milana behtar hai.', en:'Better to continue.'},
    x:{rur:'Lambi aayat ho aur saans toote to yahan rukne ki ijaazat hai.', en:'In a long ayah you may stop here if you run out of breath.'} },
  { s:'ق', name:{rur:'Qeela (kaha gaya)', en:'Qila (it is said)'}, lvl:'green',
    m:{rur:'Milana behtar hai.', en:'Better to continue.'},
    x:{rur:'Kuch ulama ke nazdeek yahan rukna hai, lekin aksar ke nazdeek mila kar padhna behtar.', en:'A few scholars stop here, but most prefer continuing.'} },
  { s:'لا', name:{rur:'Laa (mat rukiye)', en:'La (do not stop)'}, lvl:'nostop',
    m:{rur:'Yahan na rukiye.', en:'Do not stop here.'},
    x:{rur:'Yahan rukne se maana bigad sakta hai. Majboori mein ruk jaayein to do teen lafz peeche se (ya aayat ke shuru se) dohra kar padhein.', en:'Stopping here can distort the meaning. If you are forced to stop, repeat from two or three words back (or from the start of the ayah).'} },
];
const WAQF_LEVELS = [
  { lvl:'red', ic:'🔴', t:{rur:'Rukna zaroori', en:'Must stop'}, d:{rur:'م, سكتة, ∴ ∴: aage milana mana hai (saktah mein saans liye baghair rukna, ∴ mein sirf ek jagah).', en:'م, Saktah, ∴ ∴: continuing is not allowed (saktah: pause without breath; ∴: stop at one place only).'} },
  { lvl:'amber', ic:'🟠', t:{rur:'Rukna behtar', en:'Better to stop'}, d:{rur:'۝, ط, قف, قلے, وقفة: rukna behtar, milana jaaiz.', en:'۝, ط, قف, قلے, وقفة: stopping is better, continuing allowed.'} },
  { lvl:'yellow', ic:'🟡', t:{rur:'Dono jaaiz', en:'Stop or continue'}, d:{rur:'ج, صلے, لا ۝: rukna aur milana dono theek.', en:'ج, صلے, لا ۝: both are fine.'} },
  { lvl:'green', ic:'🟢', t:{rur:'Milana behtar', en:'Better to continue'}, d:{rur:'ز, ص, ق: milana behtar, rukna jaaiz.', en:'ز, ص, ق: continuing is better, stopping allowed.'} },
  { lvl:'nostop', ic:'⛔', t:{rur:'Mat rukiye', en:'Do not stop'}, d:{rur:'لا: rukna mana hai.', en:'لا: stopping is not allowed.'} },
];
const PAGE_MARKS = [
  { s:'سورة … مكية / مدنية', t:{rur:'Surah ka unwaan', en:'Surah title band'}, m:{rur:'Beech mein Surah ka naam aur yeh ke woh Makki hai ya Madani. Daayein khaane mein "Aayaatuha" (kitni aayatein) aur baayein mein "Rukoo\u2019aatuha" (kitne rukoo) likhe hote hain.', en:'The Surah\u2019s name and whether it is Makki or Madani in the middle; one box gives "Ayatuha" (number of ayahs), the other "Ruku\u2019atuha" (number of rukus).'} },
  { s:'بسم الله الرحمن الرحيم', t:{rur:'Bismillah', en:'Bismillah'}, m:{rur:'Har Surah se pehle, siwaye Surah At-Tawbah (9) ke.', en:'Before every Surah except Surah At-Tawbah (9).'} },
  { s:'ع', t:{rur:'Rukoo ka nishaan', en:'Ruku mark'}, m:{rur:'Haashiye (kinaare) par "ع" ek rukoo, yaani ek mazmoon ka hissa, khatam hone ki nishaani hai. Upar ka number Surah mein rukoo ka number, beech ka us rukoo ki aayatein, neeche ka Paare mein rukoo ka number.', en:'"ع" in the margin marks the end of a ruku, a section of the text. The top number is the ruku\u2019s number in the Surah, the middle its ayahs, the bottom its number in the Para.'} },
  { s:'السجدة', t:{rur:'Sajda-e-Tilawat', en:'Prostration of recitation'}, m:{rur:'Haashiye par "سجدة" ho to woh aayat padhne ya sunne par Sajda-e-Tilawat wajib hai (Hanafi). Poore Qur\u2019an mein 14 jagah.', en:'"سجدة" in the margin marks an ayah of prostration; reciting or hearing it requires the Sajdah of recitation (Hanafi). There are 14 in the Quran.'} },
  { s:'الربع · النصف · الثلثة', t:{rur:'Paare ke hisse', en:'Quarters of a Para'}, m:{rur:'Haashiye par Paare ka chauthai (ربع), aadha (نصف) aur teen chauthai (ثلثة) hissa.', en:'Margin marks for a quarter (ربع), half (نصف) and three quarters (ثلثة) of a Para.'} },
  { s:'منزل', t:{rur:'Manzil', en:'Manzil'}, m:{rur:'Qur\u2019an 7 Manzilon mein bata hai, taake hafte mein ek baar poora padha ja sake. Page ke neeche "منزل" aur number.', en:'The Quran is divided into 7 Manzils so it can be read in a week; "منزل" and its number appear at the foot of the page.'} },
  { s:'سرخی · صفحہ', t:{rur:'Page ke upar', en:'Top of the page'}, m:{rur:'Ek taraf Paare ka naam aur number, doosri taraf Surah ka naam aur number, beech mein page number.', en:'The Para name and number on one side, the Surah name and number on the other, the page number in the middle.'} },
];
function renderQuranSigns(){
  document.getElementById('detailTitle').textContent = L({rur:"Qur'an ki Alamaat", en:'Signs in the Quran'});
  const lvlName = {}; WAQF_LEVELS.forEach(x=> lvlName[x.lvl] = x);
  document.getElementById('detailBody').innerHTML = `
    <div class="backup-note">${L({rur:"Tilawat ke dauran kahan rukna hai aur kahan nahi, yeh Qur'an mein likhi alamaat batati hain. Ek jagah ek se zyada alamat ho to sab se upar wali par amal karein.", en:'The signs written in the Quran tell you where to stop while reciting and where not to. If more than one sign appears together, follow the uppermost one.'})}</div>
    <div class="section-title">${L({rur:'Rukne ke darje', en:'Kinds of stop'})}</div>
    <div class="ws-levels">${WAQF_LEVELS.map(x=>`<div class="ws-level lv-${x.lvl}"><span class="ws-lic">${x.ic}</span><div><b>${L(x.t)}</b><span>${L(x.d)}</span></div></div>`).join('')}</div>
    <div class="section-title">${L({rur:'Waqf ki Alamaat', en:'Stopping signs'})}</div>
    ${WAQF_SIGNS.map(x=>`<div class="ws-card lv-${x.lvl}">
      <div class="ws-sign ar-font">${x.s}</div>
      <div class="ws-body"><div class="ws-name">${L(x.name)} <span class="ws-tag">${lvlName[x.lvl].ic} ${L(lvlName[x.lvl].t)}</span></div>
        <div class="ws-m">${L(x.m)}</div><div class="ws-x">${L(x.x)}</div></div>
    </div>`).join('')}
    <div class="section-title">${L({rur:'Page ki doosri alamaat', en:'Other marks on the page'})}</div>
    ${PAGE_MARKS.map(x=>`<div class="ws-card"><div class="ws-sign ar-font sm">${x.s}</div><div class="ws-body"><div class="ws-name">${L(x.t)}</div><div class="ws-m">${L(x.m)}</div></div></div>`).join('')}
    <div class="backup-note">${L({rur:'Hawala: Understand Quran Academy, "Asan Qaidah", Sabaq 21: Rukne ki Alamaat. Alag Mushaf mein alamaat thodi mukhtalif ho sakti hain.', en:'Source: Understand Quran Academy, "Asan Qaidah", Lesson 21: Stopping Signs. Signs can differ slightly between Mushaf prints.'})}</div>`;
}

/* ============================================================
   TAJWEED KE QAWAID in easy Roman Urdu (the 7 colour rules of this Mushaf, and where letters come from)
   ============================================================ */
const TAJWEED_RULES = [
  { k:'ikhfa', c:'#0b6b2e', name:'Ikhfa', ar:'إخفاء', letters:'ت ث ج د ذ ز س ش ص ض ط ظ ف ق ك',
    when:{rur:'Noon saakin (نْ) ya tanween (ــًــٍــٌ) ke baad in 15 haroof mein se koi harf aaye.', en:'A noon saakin (نْ) or tanween is followed by one of these 15 letters.'},
    how:{rur:'Noon ki awaaz poori na nikaalein, use naak mein "chhupa" dein, aur halki gunjaar (ghunna) ke saath lagbhag do harkat tak padhein. Zubaan noon ki jagah na lagaayein.', en:'Do not pronounce the noon fully: hide it in the nose with a light hum (ghunnah) for about two counts, without the tongue touching the noon\u2019s place.'},
    ex:'مِنْ قَبْلِ · أَنْتُمْ', exr:'min qabli → "mi(n͂) qabli"' },
  { k:'ghunna', c:'#1a7fd0', name:'Ghunna', ar:'غنّہ', letters:'نّ مّ',
    when:{rur:'Noon ya meem par tashdeed (ّ) ho.', en:'A noon or meem carries a shaddah (ّ).'},
    how:{rur:'Awaaz ko naak mein do harkat tak rok kar gunjaar ke saath padhein, phir aage badhein.', en:'Hold the sound in the nose with a hum for about two counts, then carry on.'},
    ex:'إِنَّ · ثُمَّ', exr:'in-na · thum-ma' },
  { k:'ikhfa-meem', c:'#9cc43a', name:'Ikhfa Meem Saakin (Ikhfa Shafawi)', ar:'إخفاء شفوی', letters:'مْ ← ب',
    when:{rur:'Meem saakin (مْ) ke baad harf "ب" aaye.', en:'A meem saakin (مْ) is followed by "ب".'},
    how:{rur:'Hont halke se milaayein, meem ko poora na dabaayein, aur naak mein ghunna ke saath do harkat padh kar "ب" se milaayein.', en:'Close the lips lightly, do not press the meem fully, hum through the nose for two counts and join it to the "ب".'},
    ex:'تَرْمِيهِمْ بِحِجَارَةٍ', exr:'tarmeehim bi-hijaarah' },
  { k:'idghaam', c:'#e0451b', name:'Idghaam', ar:'إدغام', letters:'ی و م ن',
    when:{rur:'Noon saakin ya tanween ke baad (do alag lafzon mein) ی، و، م، ن mein se koi harf aaye.', en:'A noon saakin or tanween is followed, in the next word, by ی، و، م or ن.'},
    how:{rur:'Noon ko alag na padhein, use agle harf mein mila dein ("idghaam" yaani milaana), aur ghunna ke saath padhein.', en:'Do not read the noon separately: merge it into the next letter and read with ghunnah.'},
    note:{rur:'ل aur ر se pehle bhi noon milaya jaata hai, lekin baghair ghunna ke.', en:'Before ل and ر the noon is also merged, but without ghunnah.'},
    ex:'مَنْ يَقُولُ · مِنْ وَالٍ', exr:'man yaqoolu → "may-yaqoolu"' },
  { k:'qalqala', c:'#f08a1c', name:'Qalqala', ar:'قلقلہ', letters:'ق ط ب ج د',
    when:{rur:'Yeh 5 haroof (yaad rakhne ke liye: "قُطْبُ جَدٍّ") saakin hon, ya inhi par waqf (ruk) karein.', en:'These 5 letters (remember them as "قُطْبُ جَدٍّ") are saakin, or you stop on them.'},
    how:{rur:'Harf ki awaaz ko halka sa "uchhaal" dein, jaise awaaz takra kar wapas aaye. Ruk kar padhne par yeh uchhaal zyada saaf hoti hai.', en:'Give the letter a slight bounce, as if the sound strikes and echoes back. It is clearest when you stop on it.'},
    ex:'يَخْلُقْ · أَحَدْ', exr:'yakhluq(q) · ahad(d)' },
  { k:'qalb', c:'#6a2c7a', name:'Qalb (Iqlaab)', ar:'قلب', letters:'نْ / تنوین ← ب',
    when:{rur:'Noon saakin ya tanween ke baad "ب" aaye. Aksar wahan chhota sa "م" likha hota hai.', en:'A noon saakin or tanween is followed by "ب"; a small "م" is often written there.'},
    how:{rur:'Noon ko "meem" se badal dein ("qalb" yaani badalna), aur naak mein ghunna ke saath do harkat padh kar "ب" se milaayein.', en:'Change the noon into a meem and read it with ghunnah for two counts before the "ب".'},
    ex:'مِنْ بَعْدِ · سَمِيعٌ بَصِيرٌ', exr:'min ba\u2019di → "mim ba\u2019di"' },
  { k:'idghaam-meem', c:'#e0559a', name:'Idghaam Meem Saakin (Idghaam Shafawi)', ar:'إدغام شفوی', letters:'مْ ← م',
    when:{rur:'Meem saakin (مْ) ke baad doosra "م" aaye.', en:'A meem saakin (مْ) is followed by another "م".'},
    how:{rur:'Dono meem mila kar ek tashdeed wale meem ki tarah, ghunna ke saath do harkat padhein.', en:'Merge both meems into one doubled meem and read with ghunnah for two counts.'},
    ex:'لَهُمْ مَا · كُمْ مِنْ', exr:'lahum-maa' },
];
const MAKHARIJ = [
  { t:{rur:'Munh ka khaali hissa (Jauf)', en:'Empty space of the mouth (Jawf)'}, h:'ا و ي', d:{rur:'Madd ke haroof: lambi awaaz munh ki khaali jagah se.', en:'The madd letters: the long sound comes from the hollow of the mouth.'} },
  { t:{rur:'Halq (gala)', en:'Throat'}, h:'ء ه · ع ح · غ خ', d:{rur:'Gale ka neeche ka hissa (ء ه), beech (ع ح), aur upar ka hissa (غ خ).', en:'Lower throat (ء ه), middle (ع ح) and upper throat (غ خ).'} },
  { t:{rur:'Zubaan', en:'Tongue'}, h:'ق ك · ج ش ي · ض · ل ن ر · ط د ت · ظ ذ ث · ص س ز', d:{rur:'Zubaan ki jad (ق ك), beech (ج ش ي), kinaara (ض), nok ke paas (ل ن ر), nok aur daanton ki jad (ط د ت), nok aur daanton ka kinaara (ظ ذ ث), aur nok neeche ke daanton ke paas (ص س ز).', en:'Back of the tongue (ق ك), middle (ج ش ي), side (ض), near the tip (ل ن ر), tip at the tooth roots (ط د ت), tip at the tooth edges (ظ ذ ث) and tip near the lower teeth (ص س ز).'} },
  { t:{rur:'Hont', en:'Lips'}, h:'ب م و · ف', d:{rur:'Dono hont mila kar (ب م), gol kar ke (و), aur neeche ka hont upar ke daanton se (ف).', en:'Both lips together (ب م), rounded (و), and the lower lip on the upper teeth (ف).'} },
  { t:{rur:'Naak (Khaishoom)', en:'Nose'}, h:'غنّہ', d:{rur:'Ghunna ki gunjaar naak se nikalti hai.', en:'The hum of ghunnah comes from the nose.'} },
];
function renderTajweedRules(){
  document.getElementById('detailTitle').textContent = L({rur:'Tajweed ke Qawaid', en:'Tajweed Rules'});
  document.getElementById('detailBody').innerHTML = `
    <div class="backup-note">${L({rur:"Is Tajweed wale Qur'an mein 7 rang hain. Har rang batata hai ke us lafz ko kaise padhna hai. Neeche har rang ka matlab aasaan alfaaz mein. \"Harkat\" yaani lagbhag ek ungli band ya khol ne jitna waqt.", en:'This Tajweed Quran uses 7 colours. Each colour tells you how to read that word. Below is what each colour means, in simple words. A "count" (harakah) is about the time it takes to fold or open a finger.'})}</div>
    ${TAJWEED_RULES.map((r,i)=>`<div class="tj-card" style="--tjc:${r.c};">
      <div class="tj-head"><span class="tj-dot"></span><b>${i+1}. ${r.name}</b><span class="tj-ar ar-font">${r.ar}</span></div>
      <div class="tj-badge"><i></i><b>${r.name.split(' (')[0]}</b><span class="ar-font">(${r.letters})</span></div>
      <div class="tj-row"><span class="tj-lbl">${L({rur:'Haroof', en:'Letters'})}</span><span class="tj-letters ar-font">${r.letters}</span></div>
      <div class="tj-row"><span class="tj-lbl">${L({rur:'Kab?', en:'When?'})}</span><span>${L(r.when)}</span></div>
      <div class="tj-row"><span class="tj-lbl">${L({rur:'Kaise?', en:'How?'})}</span><span>${L(r.how)}</span></div>
      ${r.note ? `<div class="tj-row"><span class="tj-lbl">${L({rur:'Note', en:'Note'})}</span><span>${L(r.note)}</span></div>` : ''}
      <div class="tj-ex"><span class="ar-font">${r.ex}</span><span class="tj-exr">${r.exr}</span></div>
    </div>`).join('')}
    <div class="section-title">${L({rur:'Huroof ke Makharij (harf kahan se nikalta hai)', en:'Makharij (where each letter comes from)'})}</div>
    <div class="backup-note">${L({rur:'Arabi ke 29 haroof 17 jagahon se ada hote hain. Mukhtasar mein 5 hisse:', en:'The 29 Arabic letters are pronounced from 17 places, grouped into 5 areas:'})}</div>
    ${MAKHARIJ.map(m=>`<div class="ws-card"><div class="ws-sign ar-font sm">${m.h}</div><div class="ws-body"><div class="ws-name">${L(m.t)}</div><div class="ws-m">${L(m.d)}</div></div></div>`).join('')}
    <button class="backup-btn" id="tjGuideBtn">📘 ${L({rur:"Qur'an mein diye asal 8 page dekhein", en:'See the original 8 guide pages'})}</button>
    <div class="backup-note">${L({rur:"Aasaan samjhaane ke liye mukhtasar kiya gaya hai. Sahi talaffuz ke liye kisi qaari se seekhna behtar hai.", en:'Simplified for easy understanding. Learning from a qualified teacher is best for correct pronunciation.'})}</div>`;
  document.getElementById('tjGuideBtn').onclick = ()=> renderTajweedGuide(1);
}

/* Page-turn sound (off by default): a short paper rustle made in the browser, no audio file */
let pageSoundCtx = null;
function playPageSound(){
  if(!state.quranTurnSound) return;
  try{
    pageSoundCtx = pageSoundCtx || new (window.AudioContext || window.webkitAudioContext)();
    const ctx = pageSoundCtx, sr = ctx.sampleRate, dur = 0.55, n = Math.floor(sr * dur);
    const buf = ctx.createBuffer(1, n, sr), d = buf.getChannelData(0);
    // paper rustle: broadband noise broken into tiny random "crinkle" grains, swelling then fading
    let grain = 0, gLeft = 0, prev = 0;
    for(let i=0;i<n;i++){
      const t = i / sr;
      if(gLeft-- <= 0){ grain = 0.25 + Math.random()*0.75; gLeft = Math.floor(sr * (0.002 + Math.random()*0.006)); }
      const swish = t < 0.09 ? t/0.09 : Math.exp(-(t-0.09)*7.5);          // quick lift, slower fall
      const settle = Math.exp(-Math.pow((t-0.40)/0.045, 2)) * 0.35;        // soft second rustle as the page lands
      const white = Math.random()*2 - 1;
      prev = prev*0.55 + white*0.45;                                        // slightly darker than pure white noise
      d[i] = prev * grain * (swish + settle);
    }
    const src = ctx.createBufferSource(); src.buffer = buf;
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 350; hp.Q.value = 0.5;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 0.4;
    const t0 = ctx.currentTime;
    lp.frequency.setValueAtTime(1800, t0);                                  // brightens as the page sweeps, then dulls
    lp.frequency.linearRampToValueAtTime(5200, t0 + 0.12);
    lp.frequency.linearRampToValueAtTime(2200, t0 + dur);
    const g = ctx.createGain(); g.gain.value = 0.5;
    src.connect(hp).connect(lp).connect(g).connect(ctx.destination);
    src.start(t0);
  }catch(e){}
}

function quranChoice(id, ic, title, sub){
  return `<button class="quran-choice" id="${id}"><span class="qc-ic">${ic}</span><span class="qc-txt"><b>${title}</b><span>${sub}</span></span><span class="chev">›</span></button>`;
}
/* Open-book icon, the same for both editions: plain lines for Normal, the 7 Tajweed colours for Tajweed */
function quranBookSvg(tajweed, size){
  const cols = tajweed ? ['#0b6b2e','#1a7fd0','#9cc43a','#e0451b','#f08a1c','#6a2c7a','#e0559a','#1a7fd0'] : Array(8).fill('currentColor');
  const lines = [0,1,2,3].map(i=>{ const y = 15 + i*6;
    return `<line x1="9" y1="${y}" x2="27" y2="${y+1.5}" stroke="${cols[i]}" stroke-width="2.6" stroke-linecap="round"/><line x1="37" y1="${y+1.5}" x2="55" y2="${y}" stroke="${cols[i+4]}" stroke-width="2.6" stroke-linecap="round"/>`; }).join('');
  return `<svg viewBox="0 0 64 48" width="${size||48}" height="${Math.round((size||48)*0.75)}" aria-hidden="true">
    <path d="M32 9 C24 4 12 4 4 7 V43 C12 40 24 40 32 45 C40 40 52 40 60 43 V7 C52 4 40 4 32 9 Z" fill="var(--card2)" stroke="var(--sub)" stroke-width="2" stroke-linejoin="round"/>
    <line x1="32" y1="9" x2="32" y2="45" stroke="var(--sub)" stroke-width="2"/>${lines}</svg>`;
}
/* "Continue reading": the book last opened (Mushaf, Tarjuma or Tafseer) and where, one tap to go back */
function qLastSet(k){ state.qLast = { k, t:Date.now() }; }
function qContinueHtml(){
  const q = state.qLast; if(!q) return '';
  let ic, name, where;
  if(q.k === 'tarjuma' && state.tbSurah){ ic = '📘'; name = L({rur:'Tarjuma', en:'Translation'}); where = `${state.tbSurah}. ${QURAN_SURAHS[state.tbSurah - 1].name} · ${L({rur:'Page', en:'Page'})} ${state.tbPage || 2}`; }
  else if(q.k === 'tafseer' && state.tfPage){ const sn = typeof tfSurahOf === 'function' ? tfSurahOf(state.tfPage) : 0; ic = '📕'; name = 'Tafseer'; where = `${sn ? sn + '. ' + QURAN_SURAHS[sn - 1].name : L({rur:'Muqaddima', en:'Introduction'})} · ${L({rur:'Page', en:'Page'})} ${state.tfPage}`; }
  else if(q.k === 'mushaf' && state.quranPage){ const sn = quranSurahOf(state.quranPage); ic = '📖'; name = quranEdLabel(); where = `${sn.n}. ${sn.name} · ${L({rur:'Page', en:'Page'})} ${state.quranPage}`; }
  else return '';
  return `<button type="button" class="qcont" id="qhContinue"><span class="qc-ic">${ic}</span><span class="qc-t"><small>${L({rur:'Wahin se jaari rakhein', en:'Continue reading'})}</small><b>${name}</b><span>${where}</span></span><span class="qc-go">›</span></button>`;
}
function renderQuranHome(){
  document.getElementById('detailTitle').textContent = "Qur'an Majeed";
  const last = quranLastPage(), ed = quranEd();
  document.getElementById('detailBody').innerHTML = `
    ${qContinueHtml()}
    <div class="section-title" style="margin:0 14px 8px;">${L({rur:"Qur'an padhein", en:'Read the Quran'})}</div>
    <div class="qbook-row">
      <button class="qbook ${ed==='normal'?'last':''}" id="qhNormal">${quranBookSvg(false)}<b>${L({rur:'Normal', en:'Normal'})}</b><span>${L({rur:'15 line Mushaf', en:'15-line Mushaf'})}</span></button>
      <button class="qbook ${ed==='tajweed'?'last':''}" id="qhTajweed">${quranBookSvg(true)}<b>Tajweed</b><span>${L({rur:'Rangon ke saath', en:'Colour-coded'})}</span></button>
    </div>
    <div class="qbook-note">${L({rur:`Dono mein page number ek jaise hain: aakhri page ${last}, aur nishaan dono mein kaam karte hain.`, en:`Both share page numbers: last page ${last}, and bookmarks work in both.`})}</div>
    ${typeof tbHomeHtml === 'function' ? tbHomeHtml() : ''}
    ${tilawatCardsHtml()}
    <div class="section-title" style="margin:6px 14px 8px;">${L({rur:'Samajhne ke liye', en:'Learn'})}</div>
    <div class="more-list" style="padding-top:0;">
      <div class="more-item" id="qhSigns"><div class="ic">🛑</div><div class="lbl">${L({rur:"Qur'an ki Alamaat", en:'Signs in the Quran'})}<span class="lblSub">${L({rur:'Kahan rukna hai, kahan nahi, aur page ke nishaan', en:'Where to stop, where not to, and page marks'})}</span></div><div class="chev">›</div></div>
      <div class="more-item" id="qhRules"><div class="ic">📘</div><div class="lbl">${L({rur:'Tajweed ke Qawaid', en:'Tajweed Rules'})}<span class="lblSub">${L({rur:'Har rang ka matlab, aasaan Roman Urdu mein', en:'What each colour means, in simple words'})}</span></div><div class="chev">›</div></div>
    </div>
    <div class="ramzan-card" style="margin:4px 14px 12px;"><div class="roza-toggle"><span style="font-size:13.5px; font-weight:700;">🔈 ${L({rur:'Page palatne ki awaaz', en:'Page-turn sound'})}</span><div class="switch ${state.quranTurnSound?'on':''}" id="qhSoundSw"><div class="knob"></div></div></div></div>`;
  document.getElementById('qhNormal').onclick = ()=>{ state.quranEd = 'normal'; saveState(); renderQuranReader(); };
  document.getElementById('qhTajweed').onclick = ()=>{ state.quranEd = 'tajweed'; saveState(); renderQuranReader(); };
  document.getElementById('qhSigns').onclick = renderQuranSigns;
  document.getElementById('qhRules').onclick = renderTajweedRules;
  { const c = document.getElementById('qhContinue'); if(c) c.onclick = ()=>{ const k = state.qLast && state.qLast.k;
      if(k === 'tarjuma') renderTarjumaBook(state.tbPage || 2, state.tbAbs ? { abs:state.tbAbs } : 0, state.tbSurah);
      else if(k === 'tafseer') renderTafseerPage(state.tfPage || 1); else renderQuranReader(state.quranPage); }; }
  if(typeof tbHomeWire === 'function') tbHomeWire();
  wireTilawatCards(renderQuranHome);
  rollNumbers(document.getElementById('detailBody'), '.tl-count');
  document.getElementById('qhSoundSw').onclick = ()=>{ state.quranTurnSound = !state.quranTurnSound; saveState(); renderQuranHome(); if(state.quranTurnSound) playPageSound(); };
}
function renderTajweedMenu(){
  document.getElementById('detailTitle').textContent = 'Tajweed';
  document.getElementById('detailBody').innerHTML = `
    <div class="quran-choices">
      ${quranChoice('tjQuran', '📖', L({rur:"Qur'an (Tajweed)", en:'Quran (Tajweed)'}), L({rur:'Tajweed ke rangon ke saath poora Qur\'an', en:'The whole Quran with Tajweed colours'}))}
      ${quranChoice('tjRules', '📘', L({rur:'Tajweed ke Qawaid', en:'Tajweed Rules'}), L({rur:'Har rang ka matlab, aasaan Roman Urdu mein', en:'What each colour means, in simple words'}))}
    </div>`;
  document.getElementById('tjQuran').onclick = ()=>{ state.quranEd = 'tajweed'; saveState(); renderQuranReader(); };
  document.getElementById('tjRules').onclick = renderTajweedRules;
}
function renderTajweedGuide(i){
  i = Math.max(1, Math.min(TAJWEED_GUIDE_COUNT, i || 1));
  setNavCtx(TAJWEED_GUIDE_LIST, i - 1, (g)=> renderTajweedGuide(g), null);
  __navCtx.rtl = true;
  document.getElementById('detailTitle').textContent = `${L({rur:'Tajweed ke Qawaid', en:'Tajweed Rules'})} · ${i}/${TAJWEED_GUIDE_COUNT}`;
  document.getElementById('detailBody').innerHTML = `
    <div class="quran-page-wrap" id="quranWrap"><img class="quran-page-img" src="quran/tajweed/g${i}.webp" alt="Tajweed rules page ${i}" draggable="false"></div>
    ${pnBarHtml()}`;
  wirePnBar();
  [i - 1, i + 1].forEach(n=>{ if(n>=1 && n<=TAJWEED_GUIDE_COUNT){ const im = new Image(); im.src = `quran/tajweed/g${n}.webp`; } });
}
/* where a tapped row goes: the Mushaf reader by default, or the Tarjuma book when the index was opened from it */
let qiOpener = null;
function renderQuranIndex(kind){
  const cur = quranLastPage();
  const isPara = kind==='para', isManzil = kind==='manzil', isMarks = kind==='marks';
  const marks = (state.quranMarks||[]).map(pg=>({ n:'🔖', name:`Page ${pg}`, page:pg, sub:`${quranSurahOf(pg).name} · ${L({rur:'Paara', en:'Para'})} ${quranParaOf(pg).n}` }));
  const list = isMarks ? marks : isPara ? QURAN_PARAS : isManzil ? QURAN_MANZILS : QURAN_SURAHS;
  const curItem = isMarks ? null : isPara ? quranParaOf(cur) : isManzil ? quranManzilOf(cur) : quranSurahOf(cur);
  document.getElementById('detailTitle').textContent = isMarks ? L({rur:'Nishaan', en:'Bookmarks'}) : isPara ? L({rur:'30 Paare', en:'30 Paras'}) : isManzil ? L({rur:'7 Manzil', en:'7 Manzils'}) : L({rur:'114 Surah', en:'114 Surahs'});
  const sub = x => isMarks ? `<span class="lblSub">${x.sub}</span>` : isPara ? '' : isManzil ? `<span class="lblSub">${x.from} – ${x.to}</span>` : `<span class="lblSub ar-font">${x.ar}</span>`;
  document.getElementById('detailBody').innerHTML = `
    <div class="qi-sticky">
    <div class="view-toggle" style="margin:0 14px 12px;">
      <button id="qiParaTab" class="${isPara?'active':''}">${L({rur:'Paara', en:'Para'})}</button>
      <button id="qiSurahTab" class="${kind==='surah'?'active':''}">Surah</button>
      <button id="qiManzilTab" class="${isManzil?'active':''}">Manzil</button>
      <button id="qiMarksTab" class="${isMarks?'active':''}">🔖 ${marks.length}</button>
    </div>
    ${isMarks ? '' : `<div class="search-bar-wrap" style="margin:0 14px 10px;"><input id="qiSearch" type="search" inputmode="search" autocomplete="off" placeholder="${kind==='surah' ? L({rur:'Surah ka naam ya number', en:'Search surah by name or number'}) : isPara ? L({rur:'Paara number', en:'Para number'}) : L({rur:'Manzil number', en:'Manzil number'})}" aria-label="Search"></div>`}
    </div>
    ${isMarks && !marks.length ? `<div class="empty-state">${L({rur:'Abhi koi nishaan nahi. Kisi page par 🔖 dabayein.', en:'No bookmarks yet. Tap 🔖 on any page.'})}</div>` : ''}
    <div class="more-list" style="padding-top:0;">${list.map(x=>`
      <div class="more-item quran-idx-item ${x===curItem?'on':''}" data-page="${x.page}" data-n="${isMarks?'':x.n}" data-f="${isMarks||kind!=='surah'?'':String(x.name).replace(/^(al|an|ar|as|at|ad|az|ash|adh|ath)-/i,'').charAt(0).toLowerCase()+'|'+String(x.ar||'').replace(/^ال/,'').charAt(0)}" data-q="${isMarks?'':String(x.name+' '+(x.ar||'')).toLowerCase().replace(/[^a-z0-9\u0600-\u06ff]/g,'')}">
        <div class="ic">${x.n}</div>
        <div class="lbl">${x.name}${sub(x)}</div>
        <div class="qi-page">${L({rur:'Page', en:'Page'})} ${x.page}</div>
      </div>`).join('')}</div>
    <div class="ramzan-card" style="margin:14px 14px 10px;">
      <div style="font-size:13px; font-weight:800; margin-bottom:4px;">⬇️ ${L({rur:"Poora Qur'an offline", en:'Whole Quran offline'})} · ${quranEdLabel()}</div>
      <div class="su-sub" id="qDlMsg" style="text-align:left;">…</div>
      <button class="backup-btn" id="qDlBtn" style="margin-top:8px;"></button>
    </div>`;
  const dlMsg = document.getElementById('qDlMsg'), dlBtn = document.getElementById('qDlBtn');
  const showDl = async (finished)=>{
    if(!document.body.contains(dlBtn)) return;
    if(quranDl){
      dlMsg.textContent = `${L({rur:'Download ho raha hai', en:'Downloading'})}: ${quranDl.done} / ${quranDl.total}`;
      dlBtn.textContent = L({rur:'Rok dein', en:'Stop'});
      dlBtn.onclick = ()=>{ if(quranDl) quranDl.stop = true; };
    } else {
      const n = await quranCachedCount();
      dlMsg.textContent = n >= QURAN_PAGE_COUNT ? L({rur:"Poora Qur'an is phone par save hai, internet ke baghair bhi khulega.", en:'The whole Quran is saved on this phone and opens without internet.'})
        : `${n} / ${QURAN_PAGE_COUNT} ${quranEd()==='tajweed' ? L({rur:'page save hain. Baaqi download karein (lagbhag 60 MB).', en:'pages saved. Download the rest (about 60 MB).'}) : L({rur:'page save hain. Baaqi download karein (lagbhag 25 MB).', en:'pages saved. Download the rest (about 25 MB).'})}`;
      dlBtn.style.display = n >= QURAN_PAGE_COUNT ? 'none' : '';
      dlBtn.textContent = L({rur:'Download karein', en:'Download'});
      dlBtn.onclick = ()=> startQuranDownload(showDl);
      if(finished) showToast(L({rur:"Qur'an offline save ho gaya", en:'Quran saved for offline use'}));
    }
  };
  showDl();
  document.getElementById('qiParaTab').onclick = ()=> renderQuranIndex('para');
  document.getElementById('qiSurahTab').onclick = ()=> renderQuranIndex('surah');
  document.getElementById('qiManzilTab').onclick = ()=> renderQuranIndex('manzil');
  document.getElementById('qiMarksTab').onclick = ()=> renderQuranIndex('marks');
  document.querySelectorAll('#detailBody .quran-idx-item').forEach(el=>{ el.onclick = ()=>{ qa.forceSync = true; if(qiOpener) qiOpener(parseInt(el.dataset.page), el.dataset.n); else renderQuranReader(parseInt(el.dataset.page)); }; });
  const qiSearch = document.getElementById('qiSearch');
  if(qiSearch){
    const rows = [...document.querySelectorAll('#detailBody .quran-idx-item')];
    const none = document.createElement('div'); none.className = 'empty-state'; none.style.display = 'none';
    none.textContent = L({rur:'Koi nateeja nahi mila.', en:'No match found.'});
    rows[0] && rows[0].parentElement.after(none);
    qiSearch.oninput = ()=>{
      const raw = qiSearch.value.trim().toLowerCase(), q = raw.replace(/[^a-z0-9\u0600-\u06ff]/g,'');
      let shown = 0;
      rows.forEach(r=>{
        const ok = !q || (/^\d+$/.test(q) ? r.dataset.n === String(parseInt(q)) : r.dataset.q.includes(q));
        r.style.animation = 'none'; r.style.display = ok ? '' : 'none'; if(ok) shown++;
      });
      none.style.display = shown ? 'none' : '';
      /* No match: suggest surahs that start with the same first letter the person typed (later letters are ignored) */
      if(!shown && kind==='surah' && !/^\d+$/.test(q)){
        const first = q.charAt(0);
        const isAr = /[\u0600-\u06ff]/.test(first);
        let sug = 0;
        rows.forEach(r=>{
          const [en, ar] = r.dataset.f.split('|');
          if(isAr ? ar===first : en===first){ r.style.display = ''; sug++; }
        });
        if(sug) none.textContent = L({rur:`Koi nateeja nahi mila. "${first.toUpperCase()}" se shuru hone wale Surah:`, en:`No match. Surahs starting with "${first.toUpperCase()}":`});
        else none.textContent = L({rur:'Koi nateeja nahi mila.', en:'No match found.'});
      }
    };
  }
  const on = document.querySelector('#detailBody .quran-idx-item.on');
  if(on) setTimeout(()=> on.scrollIntoView({ block:'center' }), 30);
}
function renderQuranWords(){
  document.getElementById('detailTitle').textContent = "Qur’ani Alfaaz Aur Ma’ani";
  const body = document.getElementById('detailBody');
  body.innerHTML = `
    <div style="text-align:center; padding:10px 10px 6px;">
      <div style="font-size:12.5px; color:var(--sub);">Qur’an mein sab se zyada istemal hone wale 125 alfaaz, unke matlab aur kitni martaba aaye hain.</div>
    </div>
    <div class="search-bar-wrap">
      <input id="qwordSearchInput" placeholder="Lafz dhoondhiye...">
      <button id="qwordSearchClear" class="search-clear-btn">✕</button>
    </div>
    <div class="chip-row" id="qwordGroupRow" style="padding:0 0 10px;"></div>
    <div class="view-toggle">
      <button id="qwordGridBtn" class="${qwordView==='grid'?'active':''}">Grid</button>
      <button id="qwordListBtn" class="${qwordView==='list'?'active':''}">List</button>
      <button id="qwordSortBtn" class="${qwordSortMode>0?'active':''} sort-m${qwordSortMode}" title="Zyada istemal hone wale alfaaz pehle">Taadaad ke Hisaab se</button>
    </div>
    <div class="dua-grid ${qwordView==='list'?'list':''}" id="qwordGrid"></div>
  `;
  /* Group tabs: All, then each grammatical group with its count */
  const groupRow = body.querySelector('#qwordGroupRow');
  const countOf = g => QURAN_WORDS.filter(w=>qwordGroup(w)===g).length;
  const tab = (key, label, count, color) => {
    const chip = document.createElement('div');
    chip.className = 'chip' + (qwordGroupFilter===key ? ' prayed' : '');
    chip.textContent = `${label} (${count})`;
    chip.onclick = ()=>{ qwordGroupFilter = key; renderQuranWords(); };
    groupRow.appendChild(chip);
  };
  tab('__all__', '🌐 Sabhi', QURAN_WORDS.length);
  Object.keys(QWORD_GROUP_COLOR).forEach(g=> tab(g, g, countOf(g)));
  document.getElementById('qwordSearchInput').value = qwordSearch;
  wireLiveSearch('qwordSearchInput', 'qwordSearchClear', renderQwordGrid, v=>{ qwordSearch = v; });
  body.querySelector('#qwordGridBtn').onclick = ()=>{ qwordView='grid'; renderQuranWords(); };
  body.querySelector('#qwordListBtn').onclick = ()=>{ qwordView='list'; renderQuranWords(); };
  body.querySelector('#qwordSortBtn').onclick = ()=>{ qwordSortMode=(qwordSortMode+1)%3; renderQuranWords(); };
  renderQwordGrid();
}
function renderQwordGrid(){
  const grid = document.getElementById('qwordGrid');
  const q = qwordSearch.trim().toLowerCase();
  grid.innerHTML = '';
  /* Filter by group; sort alphabetically, or by occurrences in the Quran (highest first) when the Sort tab is on */
  const filtered = QURAN_WORDS
    .filter(w=> (qwordGroupFilter==='__all__' || qwordGroup(w)===qwordGroupFilter) && (w.tr+' '+w.m+' '+w.cat+' '+w.ar).toLowerCase().includes(q))
    .sort(qwordSortFn());
  if(!filtered.length){ grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;">Koi lafz nahi mila.</div>`; return; }
  filtered.forEach((w,i)=>{
    const c = document.createElement('div');
    const st = duaStatus(qwordKey(w));
    c.className = 'aad-card status-' + (st||'none');
    c.style.setProperty('--aad-c', qwordColor(w));
    c.innerHTML = `<div class="aad-ic qw-ic" dir="rtl"><span>${w.ar}</span></div>
      <div class="aad-info">
        <div class="aad-title">${w.tr}</div>
        <div class="aad-tags"><span class="aad-tag">${wMean(w)}</span></div>
        <div class="aad-cat-lbl">${qwordGroup(w)}</div>
      </div>
      ${st==='amal' ? '<div class="aad-status-badge amal">✅</div>' : st==='soch' ? '<div class="aad-status-badge soch">⏳</div>' : ''}
      <div class="chev">›</div>`;
    c.onclick = ()=>{ setNavCtx(filtered, i, openQuranWordDetail, qwordNavCat()); openQuranWordDetail(w); };
    grid.appendChild(c);
  });
}
/* Yaad status key and colour for a Qur'ani word (colour comes from the quiz palette, by category name) */
function qwordKey(w){ return 'qword:' + w.tr; }
/* Main grammatical group of a word (its category text is often a mix such as "Harf / zameer") */
const QWORD_GROUP_COLOR = { 'Ism':'#3f8fe0', 'Sifat':'#e0893f', 'Zameer':'#9b6fd6', 'Harf':'#e0709f', 'Fail (fe\'l)':'#2fb6b0', 'Ism-e-mausool':'#c79a2e', 'Ism-e-ishara':'#5c7cfa', 'Sawaliya lafz':'#c0563f' };
function qwordGroup(w){
  const c = String(w.cat).toLowerCase();
  if(c.includes('zameer')) return 'Zameer';
  if(c.includes('harf') || c.includes('nida') || c.includes('zarf')) return 'Harf';
  if(c.includes('sifat')) return 'Sifat';
  if(c.includes('verb') || c.includes('fail')) return 'Fail (fe\'l)';
  if(c.includes('mausool')) return 'Ism-e-mausool';
  if(c.includes('ishara')) return 'Ism-e-ishara';
  if(c.includes('sawaliya')) return 'Sawaliya lafz';
  return 'Ism';
}
function qwordColor(w){ return QWORD_GROUP_COLOR[qwordGroup(w)]; }
function openQuranWordDetail(w){
  state.lastRead = { k:'qword', id:w.tr, label:w.tr }; saveState();
  markDayFlag('qwordDays');
  const key = qwordKey(w), st = duaStatus(key), color = qwordColor(w);
  document.getElementById('detailTitle').textContent = w.tr;
  document.getElementById('detailBody').innerHTML = `
    <div class="detail-actions">
      ${bmBtn('qword:'+w.tr)}
      <button class="act-btn" id="qwordImgBtn" title="Share karein">${SHARE_SVG}</button>
    </div>
    <div class="aad-head status-${st||'none'}" style="--aad-c:${color};">
      <div class="aad-head-ic">🔤</div>
      <div class="aad-head-title">${w.tr}</div>
      <div class="arabic qword-ar">${w.ar}</div>
      <div class="aad-cat-pill">🔤 ${w.cat}</div>
    </div>
    <div class="dua-detail">
      <div class="aad-guide-sec qword-sec-m">
        <div class="aad-guide-head"><span class="aad-step-lbl">Matlab</span></div>
        <div class="meaning qword-m">${wMean(w)}</div>
      </div>
      <div class="aad-guide-sec qword-sec-st">
        <div class="aad-guide-head"><span class="aad-step-lbl">Qur’an mein</span></div>
        <div class="qword-stat">🔁 <b>${w.occ} martaba</b> aaya hai</div>
        <div class="ref">Doosri shaklein: <span class="ar-font">${w.comb}</span></div>
      </div>
      <div class="aad-guide-sec qword-sec-ex">
        <div class="aad-guide-head"><span class="aad-step-lbl">Misaal</span></div>
        <div class="arabic qword-exar">${w.ex}</div>
        <div class="meaning qword-exm">${wEx(w)}</div>
      </div>
    </div>
    <div class="aad-status-row">
      <button class="aad-status-btn soch ${st==='soch'?'on':''}" id="qwordSochBtn">⏳ Yaad karna baaqi hai</button>
      <button class="aad-status-btn amal ${st==='amal'?'on':''}" id="qwordAmalBtn">✅ Yaad ho chuka hai</button>
    </div>
    ${pnBarHtml()}
  `;
  document.getElementById('qwordSochBtn').onclick = ()=>{ setDuaStatus(key, 'soch'); openQuranWordDetail(w); };
  document.getElementById('qwordAmalBtn').onclick = ()=>{ setDuaStatus(key, 'amal'); openQuranWordDetail(w); };
  document.getElementById('qwordImgBtn').onclick = ()=> openCardShareChooser({ kind:'Qur’ani Lafz', arabic:w.ar, title:w.tr, sub:w.m, body:w.ex+'\n'+w.exm, foot:'Qur’an mein '+w.occ+' martaba' });
  wirePnBar();
}

/* ============================================================
   AADAAB-E-ZINDAGI (daily-life Islamic adab, by category)
   ============================================================ */
let aadaabSearch = '', aadaabCat = '__all__';
function aadaabCatInfo(id){ return AADAAB_CATEGORIES.find(c=>c.id===id) || { label:id, ic:'🪴', color:'#9b6fd6' }; }
function aadaabStatus(id){ return (state.aadaabStatus && state.aadaabStatus[id]) || null; }
function setAadaabStatus(id, val){
  if(!state.aadaabStatus) state.aadaabStatus = {};
  if(aadaabStatus(id)===val){ delete state.aadaabStatus[id]; } // tap again to clear
  else{ state.aadaabStatus[id] = val; }
  saveState();
}
function renderAadaab(){
  document.getElementById('detailTitle').textContent = 'Aadaab-e-Zindagi';
  const body = document.getElementById('detailBody');
  body.innerHTML = `
    <div style="text-align:center; padding:10px 14px 6px;">
      <div style="font-size:12.5px; color:var(--sub);">Rozmarra zindagi ko Islami adab aur Sunnah ke mutabiq behtar banane ke liye, safai, huqooq, muashira, akhlaq aur bohot kuch, chhote chhote unwano mein.</div>
    </div>
    <div class="search-bar-wrap">
      <input id="aadaabSearchInput" placeholder="Unwan dhoondhiye..." value="${aadaabSearch}">
      <button id="aadaabSearchClear" class="search-clear-btn">✕</button>
    </div>
    <div class="chip-row" id="aadaabCatRow" style="padding:0 0 10px;"></div>
    <div id="aadaabList"></div>
  `;
  const catRow = body.querySelector('#aadaabCatRow');
  const allChip = document.createElement('div');
  allChip.className = 'chip' + (aadaabCat==='__all__' ? ' prayed' : '');
  allChip.textContent = `🌐 Sabhi (${AADAAB_TOPICS.length})`;
  allChip.onclick = ()=>{ aadaabCat='__all__'; renderAadaab(); };
  catRow.appendChild(allChip);
  [...AADAAB_CATEGORIES].sort((a,b)=>a.label.localeCompare(b.label)).forEach(c=>{
    const count = AADAAB_TOPICS.filter(t=>t.cat===c.id).length;
    const chip = document.createElement('div');
    chip.className = 'chip' + (aadaabCat===c.id ? ' prayed' : '');
    chip.textContent = `${c.ic} ${c.label} (${count})`;
    chip.onclick = ()=>{ aadaabCat = c.id; renderAadaab(); };
    catRow.appendChild(chip);
  });
  wireLiveSearch('aadaabSearchInput', 'aadaabSearchClear', renderAadaabList, v=>{ aadaabSearch = v; });
  renderAadaabList();
}
function renderAadaabList(){
  const wrap = document.getElementById('aadaabList');
  const q = aadaabSearch.trim().toLowerCase();
  const filtered = AADAAB_TOPICS.filter(t=>
    (aadaabCat==='__all__' || t.cat===aadaabCat) &&
    (t.title+' '+t.tags.join(' ')+' '+aadaabCatInfo(t.cat).label).toLowerCase().includes(q)
  );
  if(!filtered.length){ wrap.innerHTML = `<div class="empty-state">Koi unwan nahi mila.</div>`; return; }
  wrap.innerHTML = filtered.map((t0,i)=>{
    const t = aL(t0);
    const c = aadaabCatInfo(t.cat);
    const st = aadaabStatus(t.id);
    return `<div class="aad-card status-${st||'none'}" data-i="${i}" style="--aad-c:${t.color};">
      <div class="aad-ic">${t.ic}</div>
      <div class="aad-info">
        <div class="aad-title">${t.title}</div>
        <div class="aad-tags">${t.tags.map(x=>`<span class="aad-tag">${x}</span>`).join('')}</div>
        <div class="aad-cat-lbl">${c.ic} ${c.label}</div>
      </div>
      ${st==='amal' ? '<div class="aad-status-badge amal">✅</div>' : st==='soch' ? '<div class="aad-status-badge soch">💭</div>' : ''}
      <div class="chev">›</div>
    </div>`;
  }).join('');
  wrap.querySelectorAll('.aad-card').forEach(el=>{
    el.onclick = ()=>{
      const i = parseInt(el.dataset.i);
      setNavCtx(filtered, i, openAadaabDetail, aadaabNavCat());
      openAadaabDetail(filtered[i]);
    };
  });
}
function openAadaabDetail(t0){
  state.lastRead = { k:'aadaab', id:t0.id, label:(isEn() && t0.en && t0.en.title) || t0.title }; saveState();
  markDayFlag('aadaabDays');
  const t = aL(t0);
  const c = aadaabCatInfo(t.cat);
  const st = aadaabStatus(t.id);
  document.getElementById('detailTitle').textContent = t.title;
  const bodyHtml = t.guide ? `
    <div class="aad-intro">${t.intro}</div>
    ${t.sections.map((s,i)=>`<div class="aad-guide-sec g${i%10}">
      <div class="aad-guide-head"><span class="aad-step-ic">${s.ic}</span><span class="aad-step-lbl">${s.heading}</span></div>
      <ul class="aad-guide-list">${s.items.map(it=>`<li>${it}</li>`).join('')}</ul>
    </div>`).join('')}
    <div class="aad-guide-closing">${t.closing}</div>
  ` : (()=>{
    const steps = [
      { sc:1, n:'①', ic:'🎬', lbl:'Aaj Hum Kya Karte Hain?', txt:t.scene },
      { sc:2, n:'②', ic:'❗', lbl:'Masla Kahan Hai?', txt:t.masla },
      { sc:3, n:'③', ic:'📖', lbl:'Islam Humein Kya Sikhata Hai?', txt:t.islam },
      { sc:4, n:'④', ic:'🌙', lbl:'Nabi ﷺ Ka Amal', txt:t.nabi },
      { sc:5, n:'⑤', ic:'🪞', lbl:'Hum Kahan Galti Karte Hain?', txt:t.galti },
      { sc:6, n:'⑥', ic:'✅', lbl:'Aaj Se Ek Chhoti Tabdeeli', txt:t.tabdeeli },
    ].filter(s=>s.txt);
    return steps.map(s=>`<div class="aad-step s${s.sc}">
      <div class="aad-step-head"><span class="aad-step-ic">${s.ic}</span><span class="aad-step-lbl">${s.lbl}</span></div>
      <div class="aad-step-txt">${s.txt}</div>
    </div>`).join('');
  })();
  document.getElementById('detailBody').innerHTML = `
    <div class="detail-actions">
      ${bmBtn('aadaab:'+t.id)}
      <button class="act-btn" id="aadaabImgBtn" title="Share karein">${SHARE_SVG}</button>
    </div>
    <div class="aad-head status-${st||'none'}" style="--aad-c:${t.color};">
      <div class="aad-head-ic">${t.ic}</div>
      <div class="aad-head-title">${t.title}</div>
      <div class="aad-tags center">${t.tags.map(x=>`<span class="aad-tag">${x}</span>`).join('')}</div>
      <div class="aad-cat-pill">${c.ic} ${c.label}</div>
    </div>
    ${bodyHtml}
    <div class="aad-status-row">
      <button class="aad-status-btn soch ${st==='soch'?'on':''}" id="aadaabSochBtn">💭 Is Par Socha Jayega</button>
      <button class="aad-status-btn amal ${st==='amal'?'on':''}" id="aadaabAmalBtn">✅ Is Par Amal Kiya Jayega!</button>
    </div>
    ${pnBarHtml()}
  `;
  document.getElementById('aadaabImgBtn').onclick = ()=> openCardShareChooser({ kind:'Aadaab-e-Zindagi', title:t.title, sub:c.label, body:t.guide ? t.closing : t.tabdeeli, });
  document.getElementById('aadaabSochBtn').onclick = ()=>{ setAadaabStatus(t.id, 'soch'); openAadaabDetail(t); };
  document.getElementById('aadaabAmalBtn').onclick = ()=>{ setAadaabStatus(t.id, 'amal'); openAadaabDetail(t); };
  wirePnBar();
}

function renderMoreHadees(){
  document.getElementById('detailTitle').textContent="Hadees";
  const cats = [...new Set(HADEES.map(h=>h.cat))].sort((a,b)=>a.localeCompare(b));
  const body = document.getElementById('detailBody');
  body.innerHTML = `
    <div style="text-align:center; padding:10px 14px 6px;">
      <div style="font-size:12.5px; color:var(--sub);">Nabi ﷺ ki chuni hui hadeesein, mauzoo ke hisaab se, asal hawale ke saath.</div>
    </div>
    <div class="search-bar-wrap">
      <input id="hSearchInput" placeholder="Hadees dhoondhiye...">
      <button id="hSearchClear" class="search-clear-btn">✕</button>
    </div>
    <div class="chip-row" id="hCats" style="padding:0 0 10px;"></div>
    <div id="hList"></div>
  `;
  document.getElementById('hSearchInput').value = hadeesSearch;
  wireLiveSearch('hSearchInput', 'hSearchClear', renderHadeesList, v=>{ hadeesSearch = v; });
  const catsEl = body.querySelector('#hCats');
  const allChip = document.createElement('div');
  allChip.className = 'chip' + (hadeesFilter==='All' ? ' prayed' : '');
  allChip.textContent = `🌐 Sabhi (${HADEES.length})`;
  allChip.onclick = ()=>{ hadeesFilter='All'; renderMoreHadees(); };
  catsEl.appendChild(allChip);
  cats.forEach(c=>{
    const count = HADEES.filter(h=>h.cat===c).length;
    const chip = document.createElement('div');
    chip.className = 'chip' + (hadeesFilter===c ? ' prayed' : '');
    chip.textContent = `${hadeesMeta(c)[0]} ${c} (${count})`;
    chip.onclick = ()=>{ hadeesFilter=c; renderMoreHadees(); };
    catsEl.appendChild(chip);
  });
  renderHadeesList();
}
function renderHadeesList(){
  const wrap = document.getElementById('hList');
  const q = hadeesSearch.trim().toLowerCase();
  const items = HADEES.filter(h=> (hadeesFilter==='All'||h.cat===hadeesFilter) && (h.txt+' '+h.src+' '+h.cat).toLowerCase().includes(q)).sort((a,b)=>a.txt.localeCompare(b.txt));
  if(!items.length){ wrap.innerHTML = `<div class="empty-state">Koi hadees nahi mili.</div>`; return; }
  wrap.innerHTML = items.map((h,i)=>{
    const st = duaStatus(hadeesKey(h));
    return `<div class="aad-card status-${st||'none'}" data-i="${i}" style="--aad-c:${hadeesMeta(h.cat)[1]};">
      <div class="aad-ic">${hadeesMeta(h.cat)[0]}</div>
      <div class="aad-info">
        <div class="aad-title">${hTxt(h).length>110 ? hTxt(h).slice(0,110).trimEnd()+'...' : hTxt(h)}</div>
        <div class="aad-tags"><span class="aad-tag">${h.src}</span></div>
        <div class="aad-cat-lbl">${h.cat}</div>
      </div>
      ${st==='amal' ? '<div class="aad-status-badge amal">✅</div>' : st==='soch' ? '<div class="aad-status-badge soch">⏳</div>' : ''}
      <div class="chev">›</div>
    </div>`;
  }).join('');
  wrap.querySelectorAll('.aad-card').forEach(el=>{
    el.onclick = ()=>{
      const i = parseInt(el.dataset.i);
      setNavCtx(items, i, openHadeesDetail, hadeesNavCat());
      openHadeesDetail(items[i]);
    };
  });
}
async function shareText(text){
  if(navigator.share){
    try{ await navigator.share({ text, title:'Waqt24' }); return; }catch(e){ if(e && e.name==='AbortError') return; }
  }
  try{
    await navigator.clipboard.writeText(text);
    showToast('Copy ho gaya');
  }catch(e){ showToast('Share/Copy nahi ho saka'); }
}
/* Colour and icon per hadees category */
const HADEES_CAT_META = { 'Akhlaq':['🤝','#3f8fe0'], 'Ilm':['📚','#9b6fd6'], 'Namaz':['🕌','#2fb6b0'], 'Ramzan':['🌙','#c79a2e'], 'Sadqa':['💝','#e0893f'] };
function hadeesMeta(cat){ return HADEES_CAT_META[cat] || ['📜','#5c7cfa']; }
/* Yaad status key for a hadees (hadees have no title, so the start of the text identifies it) */
function hadeesKey(h){ return 'hadees:' + h.txt.slice(0,60); }
function openHadeesDetail(h){
  state.lastRead = { k:'hadees', id:hadeesKey(h), label:(hTxt(h)||'').slice(0,60) + '…' }; saveState();
  markReadDay();
  markReadDay();
  document.getElementById('detailTitle').textContent = h.cat;
  const key = hadeesKey(h), st = duaStatus(key);
  document.getElementById('detailBody').innerHTML = `
    <div class="detail-actions">
      ${bmBtn('hadees:'+h.txt.slice(0,40))}
      <button class="act-btn" id="hadeesImgBtn" title="Share karein">${SHARE_SVG}</button>
    </div>
    <div class="aad-head status-${st||'none'}" style="--aad-c:${hadeesMeta(h.cat)[1]};">
      <div class="aad-head-ic">${hadeesMeta(h.cat)[0]}</div>
      <div class="aad-head-title">${h.cat}</div>
      <div class="ref" style="margin:-4px 0 8px;">Hawala: ${h.src}</div>
      <div class="aad-cat-pill">${hadeesMeta(h.cat)[0]} Hadees</div>
    </div>
    <div class="dua-detail">
      <div class="aad-guide-sec hadees-sec">
        <div class="aad-guide-head"><span class="aad-step-lbl">Hadees</span></div>
        <div class="meaning hadees-txt">${hTxt(h)}</div>
      </div>
    </div>
    <div class="aad-status-row">
      <button class="aad-status-btn soch ${st==='soch'?'on':''}" id="hadeesSochBtn">⏳ Yaad karna baaqi hai</button>
      <button class="aad-status-btn amal ${st==='amal'?'on':''}" id="hadeesAmalBtn">✅ Yaad ho chuka hai</button>
    </div>
    ${pnBarHtml()}
  `;
  document.getElementById('hadeesSochBtn').onclick = ()=>{ setDuaStatus(key, 'soch'); openHadeesDetail(h); };
  document.getElementById('hadeesAmalBtn').onclick = ()=>{ setDuaStatus(key, 'amal'); openHadeesDetail(h); };
  document.getElementById('hadeesImgBtn').onclick = ()=> openCardShareChooser({ kind:'Hadees', title:h.cat, body:h.txt, foot:'Hawala: '+h.src });
  wirePnBar();
}
/* ============================================================
   QUIZ
   ============================================================ */
/* ============================================================
   ILM DATA, Asma-ul-Husna, Prophet's Names, Khaas Shabd, Myth Busters
   ============================================================ */
/* (data moved to data.js: ASMA_UL_HUSNA, PROPHET_NAMES, KHAAS_SHABD, MYTH_BUSTERS, QUIZ_CATEGORIES, QUIZ_BANK) */

let quizState = null;

function shuffleArr(arr){
  const a = arr.slice();
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}

const QUIZ_CAT_ICON = {
  "Namaz":"🕌", "Akhlaq aur Muashira":"🤝", "Qur’an aur Ibadaat":"📖",
  "Seerat-un-Nabi ﷺ":"🌙", "Ambiya-e-Kiram AS":"⭐", "Ahadees aur Sunnat":"📜", "Duain":"🤲",
  "Sahaba-e-Kiram RA":"👥", "Akhirat":"🌌", "Khaas Shabd":"📚",
  "Asma-ul-Husna":"💚", "Qur’ani Alfaaz":"📗"
};

/* Auto-generate quiz questions from the Khaas Shabd word bank: "<word> ka matlab?" MCQ */
(function generateKhaasShabdQuiz(){
  QUIZ_CATEGORIES.push("Khaas Shabd");
  const pool = shuffleArr(KHAAS_SHABD).slice(0, 40);
  pool.forEach(w=>{
    const wrongPool = KHAAS_SHABD.filter(x=>x.m!==w.m);
    const wrongs = shuffleArr(wrongPool).slice(0,3).map(x=>x.m);
    const options = shuffleArr([w.m, ...wrongs]);
    const correctIdx = options.indexOf(w.m);
    QUIZ_BANK.push([`"${w.tr}" (${w.ar}) ka matlab kya hai?`, options, correctIdx, "Khaas Shabd"]);
  });
})();

/* Auto-generate quiz questions from the 99 Names datasets:
   1) "<name> ka matlab?" MCQ (uses the full 99-name pool)
   2) "In mein se kaunsa naam sahi hai?" (1 real + 3 fake distractors)
   3) "In mein se kaunsa naam sahi NAHI hai?" (3 real + 1 fake distractor) */
(function generateNamesQuiz(){
  QUIZ_CATEGORIES.push("Asma-ul-Husna");
  const dedupByTr = (arr)=>{
    const seen = new Set(); const out = [];
    arr.forEach(w=>{ if(!seen.has(w.tr)){ seen.add(w.tr); out.push(w); } });
    return out;
  };
  const genericPool = dedupByTr(KHAAS_SHABD);
  [
    [ASMA_UL_HUSNA, "Asma-ul-Husna", "Allah"],
    [PROPHET_NAMES, "Seerat-un-Nabi ﷺ", "Muhammad ﷺ"]
  ].forEach(([dataset, catName, subject])=>{
    // 1) meaning questions, full pool
    shuffleArr(dataset).forEach(w=>{
      const wrongPool = dataset.filter(x=>x.m!==w.m);
      const wrongs = shuffleArr(wrongPool).slice(0,3).map(x=>x.m);
      const options = shuffleArr([w.m, ...wrongs]);
      const correctIdx = options.indexOf(w.m);
      QUIZ_BANK.push([`"${w.tr}" (${w.ar}) ka matlab kya hai?`, options, correctIdx, catName]);
    });
    const realTrs = new Set(dataset.map(w=>w.tr));
    const fakePool = genericPool.filter(w=>!realTrs.has(w.tr));
    const label = w => `${w.tr} (${w.ar})`;
    // 2) which one IS a real name (1 real + 3 fake)
    shuffleArr(dataset).slice(0, 20).forEach(real=>{
      const fakes = shuffleArr(fakePool).slice(0,3);
      const options = shuffleArr([real, ...fakes]).map(label);
      const correctIdx = options.indexOf(label(real));
      QUIZ_BANK.push([`In mein se kaunsa naam ${subject} ka sahi naam hai?`, options, correctIdx, catName]);
    });
    // 3) which one is NOT a real name (3 real + 1 fake)
    shuffleArr(fakePool).slice(0, 20).forEach(fake=>{
      const reals = shuffleArr(dataset).slice(0,3);
      const options = shuffleArr([fake, ...reals]).map(label);
      const correctIdx = options.indexOf(label(fake));
      QUIZ_BANK.push([`In mein se kaunsa naam ${subject} ka sahi naam NAHI hai?`, options, correctIdx, catName]);
    });
  });
})();

/* ============================================================
   99 NAMES, Allah ke Naam / Muhammad ﷺ ke Naam
   ============================================================ */
let namesView = 'grid';
/* Yaad status for a name, stored with the other memorisation statuses */
function nameKey(which, w){ return 'name:' + which + ':' + w.tr; }
function nameAccent(which){ return which==='asma' ? '#c99a4a' : '#3fa8a0'; }
function renderNamesList(which){
  const dataset = which==='asma' ? ASMA_UL_HUSNA : PROPHET_NAMES;
  const title = which==='asma' ? 'Asma-ul-Husna' : "Muhammad ﷺ ke 99 Naam";
  document.getElementById('detailTitle').textContent = title;
  const body = document.getElementById('detailBody');
  const note = which==='prophet'
    ? `<div class="backup-note" style="margin:0 14px 12px;">Yeh naam/alqaab Qur’an, Sahih Ahadees aur mash'hoor kitabon (Dala'il-ul-Khayrat, Qasida Burda) se liye gaye hain. Allah ke Asma-ul-Husna ki tarah iski koi ek mutlaq/fixed list nahi hai, isliye yeh 99 naam Dala'il-ul-Khayrat ki fehrist se, Qur’an-o-Sahih Ahadees mein aaye naamon ko tarjeeh dekar chune gaye hain.</div>`
    : '';
  body.innerHTML = `
    <div class="view-toggle" style="margin:0 14px 12px;">
      <button id="namesGridBtn" class="${namesView==='grid'?'active':''}">Grid</button>
      <button id="namesListBtn" class="${namesView==='list'?'active':''}">List</button>
    </div>
    ${note}
    <div class="dua-grid names-cards ${namesView==='list'?'list':''}" id="namesGrid"></div>
  `;
  document.getElementById('namesGridBtn').onclick = ()=>{ namesView='grid'; renderNamesList(which); };
  document.getElementById('namesListBtn').onclick = ()=>{ namesView='list'; renderNamesList(which); };
  const grid = document.getElementById('namesGrid');
  grid.innerHTML = dataset.map((w,i)=>{
    const st = duaStatus(nameKey(which, w));
    return `<div class="aad-card status-${st||'none'}" data-idx="${i}" style="--aad-c:${nameAccent(which)};">
      <div class="aad-ic">${i+1}</div>
      <div class="aad-info">
        <div class="aad-title">${w.ar}</div>
        <div class="aad-cat-lbl">${w.tr}</div>
        ${namesView==='list' ? `<div class="m-preview">${isEn() && w.en ? w.en : w.m}</div>` : ''}
      </div>
      ${st==='amal' ? '<div class="aad-status-badge amal">✅</div>' : st==='soch' ? '<div class="aad-status-badge soch">⏳</div>' : ''}
      <div class="chev">›</div>
    </div>`;
  }).join('');
  grid.querySelectorAll('[data-idx]').forEach(el=>{
    el.onclick = ()=>{
      const i = parseInt(el.dataset.idx);
      setNavCtx(dataset, i, (w,j)=>renderNameDetail(which, j), null);
      renderNameDetail(which, i);
    };
  });
}
function renderNameDetail(which, idx){
  { const ds = which==='asma' ? ASMA_UL_HUSNA : PROPHET_NAMES; state.lastRead = { k:'name', which, id:idx, label:ds[idx].tr }; saveState(); }
  markDayFlag('nameDays');
  const dataset = which==='asma' ? ASMA_UL_HUSNA : PROPHET_NAMES;
  const w = dataset[idx];
  const key = nameKey(which, w);
  const st = duaStatus(key);
  setNavCtx(dataset, idx, (x,j)=>renderNameDetail(which, j), null);
  document.getElementById('detailTitle').textContent = `${idx+1} / ${dataset.length}`;
  document.getElementById('detailBody').innerHTML = `
    <div class="detail-actions">
      ${bmBtn((which==='asma'?'asma:':'prophet:')+w.tr)}
      <button class="act-btn" id="nameImgBtn" title="Share karein">${SHARE_SVG}</button>
    </div>
    <div class="aad-head status-${st||'none'}" style="--aad-c:${nameAccent(which)};">
      <div class="aad-head-ic">🔤</div>
      <div class="aad-head-title ar-font">${w.ar}</div>
      <div class="aad-cat-pill">${w.tr}</div>
    </div>
    <div class="dua-detail">
      <div class="aad-guide-sec dua-sec-ar">
        <div class="aad-guide-head"><span class="aad-step-lbl">${isEn() ? 'Name (Arabic)' : 'Naam (Arabic)'}</span></div>
        <div class="arabic dua-ar">${w.ar}</div>
      </div>
      <div class="aad-guide-sec dua-sec-tr">
        <div class="aad-guide-head"><span class="aad-step-lbl">${isEn() ? 'Transliteration' : 'Talaffuz (Transliteration)'}</span></div>
        <div class="translit dua-tr">${w.tr}</div>
      </div>
      <div class="aad-guide-sec dua-sec-ur">
        <div class="aad-guide-head"><span class="aad-step-lbl">${isEn() ? 'Meaning' : 'Maana (Roman Urdu)'}</span></div>
        <div class="meaning dua-ur">${isEn() && w.en ? w.en : w.m}</div>
      </div>
    </div>
    <div class="aad-status-row">
      <button class="aad-status-btn soch ${st==='soch'?'on':''}" id="nameSochBtn">⏳ Yaad karna baaqi hai</button>
      <button class="aad-status-btn amal ${st==='amal'?'on':''}" id="nameAmalBtn">✅ Yaad ho chuka hai</button>
    </div>
    ${pnBarHtml()}
  `;
  document.getElementById('nameSochBtn').onclick = ()=>{ setDuaStatus(key, 'soch'); renderNameDetail(which, idx); };
  document.getElementById('nameAmalBtn').onclick = ()=>{ setDuaStatus(key, 'amal'); renderNameDetail(which, idx); };
  document.getElementById('nameImgBtn').onclick = ()=> openCardShareChooser({ kind: which==='asma' ? 'Asma-ul-Husna' : 'Muhammad ﷺ ke Naam', arabic:w.ar, title:w.tr, body:isEn() && w.en ? w.en : w.m });
  wirePnBar();
}

/* ============================================================
   KHAAS SHABD (Islamic Vocabulary)
   ============================================================ */
let shabdSearch = '';
const SHABD_CAT_ICON = {
  "Allah, Imaan aur Aqeeda":"🕋", "Allah ke Naam aur Sifaat":"💚", "Nabi, Rasool aur Ambiya":"🌙",
  "Quran, Wahi aur Asmani Kitabein":"📖", "Farishte aur Ghaibi Makhlooq":"👼", "Sahaba aur Ahl-e-Bait":"👥",
  "Ibadat aur Namaz":"🙏", "Roza aur Ramzan":"🍽️", "Nekiyan, Gunah aur Akhlaaq":"⚖️",
  "Sadqah, Khairat aur Maali Ibadat":"💰", "Hajj, Umrah aur Qurbani":"🐪", "Jannat aur Aakhirat":"🌌",
  "Qayamat, Qabr aur Aamaal":"⏳", "Nabi ﷺ ki Zindagi aur Seerat":"⭐", "Islamic Battles / Ghazawaat":"🗡️",
  "Quran mein zikr hone wale Mashhoor Log":"📜", "Mashhoor Islamic Titles":"🏷️",
  "Nabi ﷺ ke liye Istemal hone wale Alfaz":"💫", "Islamic Expressions / Rozmarrah ke Alfaz":"💬",
  "Durood aur Salam":"🤍", "Dua aur Allah se Maangna":"🤲", "Jannat ke Naam / Mutalliq Alfaz":"🌺",
  "Kuch aur bohat important Islamic Terms":"📚"
};
/* Wires a search input's oninput to update only the results container (not
   the whole screen), so the input never gets re-created and loses focus/cursor. */
function wireLiveSearch(inputId, clearBtnId, onChange, setVal){
  const input = document.getElementById(inputId);
  const clearBtn = document.getElementById(clearBtnId);
  const set = setVal || (v=>{ shabdSearch = v; });
  clearBtn.classList.toggle('show', !!input.value);
  input.oninput = ()=>{
    set(input.value);
    clearBtn.classList.toggle('show', !!input.value);
    onChange();
  };
  clearBtn.onclick = ()=>{
    set('');
    input.value = '';
    clearBtn.classList.remove('show');
    onChange();
    input.focus();
  };
}
function renderKhaasShabd(){
  document.getElementById('detailTitle').textContent = 'Khaas Shabd';
  const body = document.getElementById('detailBody');
  body.innerHTML = `
    <div class="search-bar-wrap">
      <input id="shabdSearchInput" placeholder="Lafz dhoondhiye..." value="${shabdSearch}">
      <button id="shabdSearchClear" class="search-clear-btn">✕</button>
    </div>
    <div id="shabdHubList"></div>
  `;
  wireLiveSearch('shabdSearchInput', 'shabdSearchClear', renderShabdHubList);
  renderShabdHubList();
}
function renderShabdHubList(){
  const wrap = document.getElementById('shabdHubList');
  const q = shabdSearch.trim().toLowerCase();
  if(q){
    const results = KHAAS_SHABD.map((w,i)=>({...w,i})).filter(w=> (w.tr+w.m+w.cat).toLowerCase().includes(q));
    wrap.innerHTML = results.map(w=>`<div class="shabd-row" data-idx="${w.i}">
        <div class="ar">${w.ar}</div>
        <div class="info"><div class="tr">${w.tr}</div><div class="m">${sMean(w)}</div></div>
      </div>`).join('') || `<div style="text-align:center; color:var(--sub); padding:30px 0; font-size:13px;">Koi lafz nahi mila.</div>`;
    const idxList = results.map(w=>w.i);
    wrap.querySelectorAll('[data-idx]').forEach((el,i)=>{
      el.onclick = ()=>{
        const openFn = (ix)=> renderShabdDetail(ix, renderKhaasShabd);
        setNavCtx(idxList, i, openFn);
        openFn(idxList[i]);
      };
    });
    return;
  }
  const cats = [...new Set(KHAAS_SHABD.map(w=>w.cat))];
  const allCard = `<div class="shabd-cat-card" data-cat="__all__" style="border-color:var(--accent);">
      <div class="ic">🌐</div>
      <div class="info"><div class="name">Sabhi Naam</div><div class="count">${KHAAS_SHABD.length} alfaz</div></div>
      <div class="chev">›</div>
    </div>`;
  wrap.innerHTML = allCard + cats.map(c=>{
    const count = KHAAS_SHABD.filter(w=>w.cat===c).length;
    return `<div class="shabd-cat-card" data-cat="${c}">
      <div class="ic">${SHABD_CAT_ICON[c]||'📚'}</div>
      <div class="info"><div class="name">${c}</div><div class="count">${count} alfaz</div></div>
      <div class="chev">›</div>
    </div>`;
  }).join('');
  wrap.querySelectorAll('[data-cat]').forEach(el=>{
    el.onclick = ()=> renderShabdCategory(el.dataset.cat);
  });
}
let shabdCatSearch = '';
function renderShabdCategory(cat){
  const isAll = cat === '__all__';
  document.getElementById('detailTitle').textContent = isAll ? 'Sabhi Naam' : cat;
  shabdCatSearch = '';
  const body = document.getElementById('detailBody');
  body.innerHTML = `
    <button id="shabdCatBackBtn" style="margin:0 14px 14px; padding:8px 14px; border-radius:10px; border:1px solid var(--line); background:var(--card2); color:var(--text); font-size:12.5px; font-weight:700; cursor:pointer;">‹ Khaas Shabd</button>
    <div class="search-bar-wrap">
      <input id="shabdCatSearchInput" placeholder="${isAll?'Sabhi mein dhoondhiye...':'Isi category mein dhoondhiye...'}">
      <button id="shabdCatSearchClear" class="search-clear-btn">✕</button>
    </div>
    <div id="shabdCatList"></div>
  `;
  document.getElementById('shabdCatBackBtn').onclick = renderKhaasShabd;
  const renderList = ()=>{
    const wrap = document.getElementById('shabdCatList');
    const q = shabdCatSearch.trim().toLowerCase();
    const items = KHAAS_SHABD.map((w,i)=>({...w,i})).filter(w=> (isAll || w.cat===cat) && (w.tr+w.m).toLowerCase().includes(q));
    wrap.innerHTML = items.map(w=>`<div class="shabd-row" data-idx="${w.i}">
        <div class="ar">${w.ar}</div>
        <div class="info"><div class="tr">${w.tr}</div><div class="m">${sMean(w)}</div></div>
      </div>`).join('') || `<div style="text-align:center; color:var(--sub); padding:30px 0; font-size:13px;">Koi lafz nahi mila.</div>`;
    const idxList = items.map(w=>w.i);
    wrap.querySelectorAll('[data-idx]').forEach((el,i)=>{
      el.onclick = ()=>{
        const openFn = (ix)=> renderShabdDetail(ix, ()=> renderShabdCategory(cat));
        setNavCtx(idxList, i, openFn);
        openFn(idxList[i]);
      };
    });
  };
  const input = document.getElementById('shabdCatSearchInput');
  const clearBtn = document.getElementById('shabdCatSearchClear');
  input.oninput = ()=>{ shabdCatSearch = input.value; clearBtn.classList.toggle('show', !!input.value); renderList(); };
  clearBtn.onclick = ()=>{ shabdCatSearch=''; input.value=''; clearBtn.classList.remove('show'); renderList(); input.focus(); };
  renderList();
}
function renderShabdDetail(idx, backFn){
  markDayFlag('shabdDays');
  const w = KHAAS_SHABD[idx];
  document.getElementById('detailTitle').textContent = w.cat;
  document.getElementById('detailBody').innerHTML = `
    <div class="detail-actions between" style="margin:0 14px 14px;">
      <button id="shabdBackBtn" class="back-pill">‹ Wapas</button>
      <span class="act-group">${bmBtn('word:'+w.tr)}<button class="act-btn" id="shabdImgBtn" title="Share karein">${SHARE_SVG}</button></span>
    </div>
    <div class="shabd-detail">
      <div class="ar">${w.ar}</div>
      <div class="tr">${w.tr}</div>
      <div class="section-label">Meaning</div>
      <div class="m">${sMean(w)}</div>
      <div class="section-label">Misaal (Example)</div>
      <div class="ex">${sEx(w)}</div>
    </div>
    ${pnBarHtml()}
  `;
  document.getElementById('shabdBackBtn').onclick = backFn || renderKhaasShabd;
  document.getElementById('shabdImgBtn').onclick = ()=> openCardShareChooser({ kind:'Khaas Shabd', arabic:w.ar, title:w.tr, body:w.m, foot:w.ex });
  wirePnBar();
}

/* ============================================================
   AAJ KA LAFZ (Daily Word)
   ============================================================ */
function seededOrder(n, seed){
  const a = Array.from({length:n}, (_,i)=>i);
  let t = (seed*2654435761 + 12345) >>> 0;
  const rnd = ()=>{ t += 0x6D2B79F5; let x = Math.imul(t ^ (t>>>15), 1 | t); x ^= x + Math.imul(x ^ (x>>>7), 61 | x); return ((x ^ (x>>>14)) >>> 0) / 4294967296; };
  for(let i=n-1;i>0;i--){ const j = Math.floor(rnd()*(i+1)); [a[i],a[j]] = [a[j],a[i]]; }
  return a;
}
function dailyWordIndex(offset){
  const day = Math.floor(Date.now()/86400000) + (offset||0);
  const cats = [...new Set(KHAAS_SHABD.map(w=>w.cat))];
  const n = cats.length;
  const cycle = Math.floor(day / n);
  const pos = ((day % n) + n) % n;
  const order = seededOrder(n, cycle);
  if(pos===0){
    const prevLast = seededOrder(n, cycle-1)[n-1];
    if(order[0]===prevLast) [order[0], order[1]] = [order[1], order[0]];
  }
  const catIdx = order[pos];
  const idxs = [];
  KHAAS_SHABD.forEach((w,i)=>{ if(w.cat===cats[catIdx]) idxs.push(i); });
  const pick = seededOrder(idxs.length, catIdx*1000 + 7);
  return idxs[pick[((cycle % idxs.length) + idxs.length) % idxs.length]];
}
function wordStatus(tr){
  return (state.wordStatus && state.wordStatus[tr]) || null;
}
function markLearnDay(){
  if(!state.learnDays) state.learnDays = {};
  state.learnDays[dayKey(new Date())] = true;
}
function calcStreak(has){
  const probe = new Date(); probe.setHours(0,0,0,0);
  const start = new Date(probe);
  if(!has(probe)) probe.setDate(probe.getDate()-1);
  let cur = 0;
  while(has(probe) && cur<3650){ cur++; probe.setDate(probe.getDate()-1); }
  let best = 0, run = 0;
  const d = new Date(start);
  for(let i=0;i<730;i++){
    if(has(d)){ run++; if(run>best) best = run; } else run = 0;
    d.setDate(d.getDate()-1);
  }
  return { cur, best: Math.max(best, cur) };
}
function azkarStreak(){
  ensureZikrProfiles();
  const m = state.tasbeeh.profiles.find(p=>p.id==='morning');
  const e = state.tasbeeh.profiles.find(p=>p.id==='evening');
  if(!m || !e) return { cur:0, best:0 };
  return calcStreak(d=> isZikrProfileComplete(d, m) && isZikrProfileComplete(d, e));
}
/* Hadaf streak: consecutive days on which all of that day's goal tasks were completed */
function hadafStreak(){
  return calcStreak(d=> goalTasksFor(d).every(t=>t.done));
}
function quizStreak(){
  const days = new Set((state.quizLog||[]).map(x=> dayKey(new Date(x.t))));
  return calcStreak(d=> days.has(dayKey(d)));
}
function learnStreak(){
  const days = state.learnDays || {};
  const has = d=> !!days[dayKey(d)];
  const probe = new Date(); probe.setHours(0,0,0,0);
  if(!has(probe)) probe.setDate(probe.getDate()-1);
  let cur = 0;
  while(has(probe)){ cur++; probe.setDate(probe.getDate()-1); }
  const times = Object.keys(days).map(k=>{ const [y,m,d] = k.split('-').map(Number); return new Date(y, m-1, d).getTime(); }).sort((a,b)=>a-b);
  let best = 0, run = 0, prev = null;
  times.forEach(t=>{
    run = (prev!==null && Math.round((t-prev)/86400000)===1) ? run+1 : 1;
    if(run>best) best = run;
    prev = t;
  });
  return { cur, best };
}
function setWordStatus(tr, status){
  if(!state.wordStatus) state.wordStatus = {};
  state.wordStatus[tr] = status;
  if(status) markLearnDay();
  saveState();
}
function startWordReview(){
  const learning = KHAAS_SHABD.filter(w=>wordStatus(w.tr)==='learning');
  if(!learning.length){ showToast('Koi lafz "Yaad karna baaki hai" mein nahi hai'); return; }
  const pool = shuffleArr(learning).slice(0, 10).map(w=>{
    const wrongs = shuffleArr(KHAAS_SHABD.filter(x=>x.m!==w.m)).slice(0,3).map(x=>x.m);
    const options = shuffleArr([w.m, ...wrongs]);
    return [`"${w.tr}" (${w.ar}) ka matlab kya hai?`, options, options.indexOf(w.m), 'Lafz Review', w.tr];
  });
  const promoted = [];
  startQuiz(pool, pool.length, 'Lafz Review', {
    onAnswer:(item, ok)=>{
      const tr = item[4];
      if(!state.wordCorrect) state.wordCorrect = {};
      if(ok){
        state.wordCorrect[tr] = (state.wordCorrect[tr]||0) + 1;
        if(state.wordCorrect[tr] >= 2){ delete state.wordCorrect[tr]; setWordStatus(tr, 'known'); promoted.push(tr); }
      } else {
        state.wordCorrect[tr] = 0;
      }
      markLearnDay();
      saveState();
    },
    summary:()=> promoted.length
      ? `<div class="review-note">🎉 Yaad ho gaye: <b>${promoted.join(', ')}</b></div>`
      : `<div class="review-note">Kisi lafz ka matlab 2 martaba sahi batayein to woh "Yaad ho gaya" mein chala jayega.</div>`,
    backLabel:'Aaj Ka Lafz par Wapas',
    back:()=> renderDailyWord()
  });
}
let dailyWordOffset = 0;
let dailyWordPin = null;
function renderDailyWord(){
  document.getElementById('detailTitle').textContent = 'Aaj Ka Lafz';
  const idx = dailyWordPin!==null ? dailyWordPin : dailyWordIndex(dailyWordOffset);
  const w = KHAAS_SHABD[idx];
  const st = wordStatus(w.tr);
  const all = KHAAS_SHABD.map((x,i)=>({...x,i}));
  const known = all.filter(x=>wordStatus(x.tr)==='known');
  const learning = all.filter(x=>wordStatus(x.tr)==='learning');
  const section = (cls, title, items, emptyMsg)=>`
    <div class="dw-section ${cls}">
      <div class="dw-section-title"><span>${title}</span><span class="dw-count">${items.length}</span></div>
      ${items.length ? items.map(x=>`<div class="dw-row" data-i="${x.i}">
          <div class="ar">${x.ar}</div>
          <div class="info"><div class="tr">${x.tr}${cls==='learning' && (state.wordCorrect||{})[x.tr] ? `<span class="dw-prog">${(state.wordCorrect||{})[x.tr]}/2 sahi</span>` : ''}</div><div class="m">${x.m}</div></div>
        </div>`).join('') : `<div class="empty-state" style="padding:14px 10px;">${emptyMsg}</div>`}
    </div>`;
  document.getElementById('detailBody').innerHTML = `
    <div class="dw-wrap">
      <div class="dw-top"><span class="dw-pos">Lafz ${idx+1} / ${KHAAS_SHABD.length}</span><span class="act-group">${bmBtn('word:'+w.tr)}<button class="act-btn" id="wordImgBtn" title="Share karein">${SHARE_SVG}</button></span></div>
      <div class="daily-word-card ${st==='known'?'is-known':st==='learning'?'is-learning':''}" id="dailyWordCard">
        <div class="cat">${w.cat}</div>
        <div class="ar">${w.ar}</div>
        <div class="tr">${w.tr}</div>
        <div class="m">${sMean(w)}</div>
        <div class="ex">${sEx(w)}</div>
      </div>
      <div class="daily-word-status">
        <button id="wordKnownBtn" class="${st==='known'?'active-known':''}">✅ Yaad ho gaya</button>
        <button id="wordLearningBtn" class="${st==='learning'?'active-learning':''}">📖 Yaad karna baaki hai</button>
      </div>
      <div class="daily-word-nav">
        <button id="wordPrevBtn">‹ Pichla</button>
        <button id="wordNextBtn">Agla ›</button>
      </div>
      ${learning.length ? `<button id="wordReviewBtn" class="review-start-btn">🔁 Baaki Lafz ka Quiz (${learning.length})</button>` : ''}
      ${section('known', '✅ Yaad ho gaya', known, 'Abhi tak koi lafz "Yaad ho gaya" mark nahi hua.')}
      ${section('learning', '📖 Yaad karna baaki hai', learning, 'Abhi tak koi lafz "Yaad karna baaki hai" mark nahi hua.')}
    </div>
  `;
  const rvBtn = document.getElementById('wordReviewBtn');
  if(rvBtn) rvBtn.onclick = startWordReview;
  document.getElementById('wordImgBtn').onclick = ()=> openCardShareChooser({ kind:'Aaj Ka Lafz', arabic:w.ar, title:w.tr, body:w.m, foot:w.ex });
  document.getElementById('wordKnownBtn').onclick = ()=>{ setWordStatus(w.tr, st==='known'?null:'known'); renderDailyWord(); };
  document.getElementById('wordLearningBtn').onclick = ()=>{ setWordStatus(w.tr, st==='learning'?null:'learning'); renderDailyWord(); };
  document.getElementById('wordPrevBtn').onclick = ()=>{ dailyWordPin = null; dailyWordOffset--; renderDailyWord(); };
  document.getElementById('wordNextBtn').onclick = ()=>{ dailyWordPin = null; dailyWordOffset++; renderDailyWord(); };
  document.querySelectorAll('#detailBody .dw-row').forEach(el=>{
    el.onclick = ()=>{
      dailyWordPin = parseInt(el.dataset.i);
      renderDailyWord();
      document.getElementById('detailBody').scrollTop = 0;
    };
  });
  const card = document.getElementById('dailyWordCard');
  let touchStartX = null;
  card.addEventListener('pointerdown', (e)=>{ touchStartX = e.clientX; });
  card.addEventListener('pointerup', (e)=>{
    if(touchStartX===null) return;
    const dx = e.clientX - touchStartX;
    touchStartX = null;
    if(dx > 40){ dailyWordPin = null; dailyWordOffset--; renderDailyWord(); }
    else if(dx < -40){ dailyWordPin = null; dailyWordOffset++; renderDailyWord(); }
  });
}

/* ============================================================
   GHALAT FEHMI KA IZALA (Myth Busters), quiz mode + read-through mode
   ============================================================ */
function renderMythBusters(){
  document.getElementById('detailTitle').textContent = 'Ghalat Fehmi Ka Izala';
  document.getElementById('detailBody').innerHTML = `
    <div style="text-align:center; padding:16px 10px 6px;">
      <div style="font-size:40px; margin-bottom:8px;">💡</div>
      <div style="font-size:15px; font-weight:700; margin-bottom:4px;">Ghalat Fehmi Ka Izala</div>
      <div style="font-size:13px; color:var(--sub); margin-bottom:18px;">50 Islami ghalat-fehmiyon ka izala</div>
    </div>
    <button class="quiz-cat-btn" id="mythModeRead" style="border-color:var(--accent);">
      <span class="quiz-cat-ic">📖</span>
      <span class="quiz-cat-name">Sab Padhein<small class="quiz-cat-sub">Poori list, jawabon ke saath</small></span>
    </button>
    <button class="quiz-cat-btn" id="mythModeQuiz">
      <span class="quiz-cat-ic">🧠</span>
      <span class="quiz-cat-name">Quiz ke Taur Par Khelein<small class="quiz-cat-sub">Ek ek sawal, khud jawab dijiye</small></span>
    </button>
  `;
  document.getElementById('mythModeQuiz').onclick = renderMythCountSelect;
  document.getElementById('mythModeRead').onclick = renderMythReadList;
}
function renderMythCountSelect(){
  document.getElementById('detailTitle').textContent = 'Ghalat Fehmi Ka Izala';
  document.getElementById('detailBody').innerHTML = `
    <div style="text-align:center; padding:30px 10px;">
      <div style="font-size:40px; margin-bottom:10px;">💡</div>
      <div style="font-size:15px; font-weight:700; margin-bottom:6px;">Quiz Mode</div>
      <div style="font-size:13px; color:var(--sub); margin-bottom:24px;">Kitne sawal khelna chahte hain?</div>
      <div style="display:flex; gap:12px; justify-content:center;">
        <button id="myth5" class="quiz-count-btn c5">5 Sawal</button>
        <button id="myth10" class="quiz-count-btn c10">10 Sawal</button>
      </div>
      <button id="mythBackToHub" style="margin-top:22px; background:none; border:none; color:var(--sub); font-size:12.5px; text-decoration:underline; cursor:pointer;">‹ Wapas</button>
    </div>
  `;
  document.getElementById('myth5').onclick = ()=> startMythQuiz(5);
  document.getElementById('myth10').onclick = ()=> startMythQuiz(10);
  document.getElementById('mythBackToHub').onclick = renderMythBusters;
}
let mythQuizState = null;
function startMythQuiz(n){
  const picked = shuffleArr(MYTH_BUSTERS).slice(0, Math.min(n, MYTH_BUSTERS.length));
  mythQuizState = { questions: picked, idx: 0, score: 0, answered: false, wrong: [] };
  renderMythQuizQuestion();
}
function renderMythQuizQuestion(){
  const qs = mythQuizState;
  const m = qs.questions[qs.idx];
  document.getElementById('detailTitle').textContent = `Sawal ${qs.idx+1}/${qs.questions.length}`;
  const body = document.getElementById('detailBody');
  body.innerHTML = `
    <div class="quiz-progress"><div class="quiz-progress-fill" style="width:${(qs.idx/qs.questions.length)*100}%"></div></div>
    <div class="quiz-q">${mL(m).q}</div>
    <div class="quiz-opts" id="mythQuizOpts">
      <button class="quiz-opt" data-i="0"><b class="opt-letter">A</b> ${mL(m).optA}</button>
      <button class="quiz-opt" data-i="1"><b class="opt-letter">B</b> ${mL(m).optB}</button>
    </div>
    <div id="mythQuizRevealWrap"></div>
    <div id="mythQuizNextWrap" style="margin-top:16px; text-align:center;"></div>
  `;
  body.querySelectorAll('#mythQuizOpts .quiz-opt').forEach(btn=>{
    btn.onclick = ()=>{
      if(qs.answered) return;
      qs.answered = true;
      const chosen = parseInt(btn.dataset.i);
      body.querySelectorAll('#mythQuizOpts .quiz-opt').forEach(b=>{
        const bi = parseInt(b.dataset.i);
        if(bi===m.correctIdx) b.classList.add('correct');
        else if(bi===chosen) b.classList.add('wrong');
      });
      if(chosen===m.correctIdx) qs.score++;
      else qs.wrong.push({ q:m.q, chosenText:(chosen===0?'A. '+mL(m).optA:'B. '+mL(m).optB), correctText:(m.correctIdx===0?'A. '+mL(m).optA:'B. '+mL(m).optB), explain:mL(m).explain });
      document.getElementById('mythQuizRevealWrap').innerHTML = `<div class="quiz-reveal"><b>✅ Sahi Jawab: Option ${m.correctIdx===0?'A':'B'}</b><div style="margin-top:6px;">${m.explain}</div></div>`;
      const isLast = qs.idx===qs.questions.length-1;
      document.getElementById('mythQuizNextWrap').innerHTML = `<button id="mythQuizNextBtn" style="padding:12px 28px; border-radius:12px; border:none; background:var(--accent); color:var(--fardText); font-size:14px; font-weight:700; cursor:pointer;">${isLast?'Result Dekhiye':'Agla Sawal'}</button>`;
      document.getElementById('mythQuizNextBtn').onclick = ()=>{
        if(isLast){ renderMythQuizResult(); } else { qs.idx++; qs.answered=false; renderMythQuizQuestion(); }
      };
    };
  });
}
function renderMythQuizResult(){
  const qs = mythQuizState;
  if(!qs.logged){ qs.logged = true; logQuizResult('Ghalat Fehmi Ka Izala', qs.score, qs.questions.length); }
  const pct = Math.round((qs.score/qs.questions.length)*100);
  const msg = pct>=80 ? 'Zabardast! Mashallah.' : pct>=50 ? 'Achha kiya, aur mehnat kijiye.' : 'Koi baat nahi, "Sab Padhein" mode mein poori list dekh lijiye.';
  document.getElementById('detailTitle').textContent = "Result";
  document.getElementById('detailBody').innerHTML = `
    <div style="text-align:center; padding:30px 10px;">
      <div style="font-size:44px; margin-bottom:10px;">🏆</div>
      <div style="font-size:26px; font-weight:800; margin-bottom:4px;">${qs.score} / ${qs.questions.length}</div>
      <div style="font-size:13px; color:var(--sub); margin-bottom:6px;">${pct}% Sahi Jawab</div>
      <div style="font-size:13.5px; margin-bottom:18px;">${msg}</div>
      ${qs.wrong.length ? `<button id="mythReviewBtn" class="res-btn">❌ Galat Jawabon ka Jaiza (${qs.wrong.length})</button>` : ''}
      <button id="mythQuizRetry" class="res-btn">Wapas</button>
    </div>
  `;
  document.getElementById('mythQuizRetry').onclick = renderMythBusters;
  const mrb = document.getElementById('mythReviewBtn');
  if(mrb) mrb.onclick = ()=> renderReviewList(qs.wrong, renderMythQuizResult, false);
}
function renderMythReadList(){
  document.getElementById('detailTitle').textContent = 'Sab Padhein';
  const body = document.getElementById('detailBody');
  const levels = [...new Set(MYTH_BUSTERS.map(m=>m.level))];
  body.innerHTML = `
    <button id="mythReadBackBtn" style="margin:12px 14px; padding:8px 14px; border-radius:10px; border:1px solid var(--line); background:var(--card2); color:var(--text); font-size:12.5px; font-weight:700; cursor:pointer;">‹ Wapas</button>
    ` +
    levels.map(level=>{
      const items = MYTH_BUSTERS.map((m,i)=>({...m,i})).filter(m=>m.level===level);
      return `<div class="myth-level-title">${isEn() && (MYTH_BUSTERS.find(x=>x.level===level)||{}).enLevel || level}</div>` + items.map(m=>{
        return `<div class="myth-card">
          <div class="q">${m.i+1}. ${mL(m).q}</div>
          <div class="myth-opt-row">
            <div class="myth-opt-btn ${m.correctIdx===0?'correct':''}"><b class="opt-letter">A</b> ${mL(m).optA}</div>
            <div class="myth-opt-btn ${m.correctIdx===1?'correct':''}"><b class="opt-letter">B</b> ${mL(m).optB}</div>
          </div>
          <div class="myth-answer">✅ Sahi Jawab: Option ${m.correctIdx===0?'A':'B'}</div>
          <div class="myth-explain" style="display:block;">${mL(m).explain}</div>
        </div>`;
      }).join('');
    }).join('');
  document.getElementById('mythReadBackBtn').onclick = renderMythBusters;
}

function renderReviewList(items, backFn){
  document.getElementById('detailTitle').textContent = 'Galat Jawabon ka Jaiza';
  document.getElementById('detailBody').innerHTML = `
    <button id="reviewBackBtn" class="back-pill" style="margin-bottom:14px;">‹ Result</button>
    ${items.map((w,i)=>`<div class="review-card">
      <div class="q">${i+1}. ${w.q}</div>
      <div class="rv wrong">❌ Aapka jawab: ${w.chosenText}</div>
      <div class="rv right">✅ Sahi jawab: ${w.correctText}</div>
      ${w.explain ? `<div class="myth-explain" style="display:block;">${w.explain}</div>` : ''}
    </div>`).join('')}
  `;
  document.getElementById('reviewBackBtn').onclick = backFn;
}
function renderMoreQuiz(){
  quizState = null;
  document.getElementById('detailTitle').textContent = "Quiz";
  const body = document.getElementById('detailBody');
  const catRows = [...QUIZ_CATEGORIES].sort((a,b)=> a.localeCompare(b)).map(cat=>{
    const count = QUIZ_BANK.filter(q=>q[3]===cat).length;
    return `<button class="quiz-cat-btn" data-cat="${cat}" style="--qc:${QUIZ_PALETTE[ [...QUIZ_CATEGORIES].sort((a,b)=>a.localeCompare(b)).indexOf(cat) % QUIZ_PALETTE.length ]};">
      <span class="quiz-cat-ic">${QUIZ_CAT_ICON[cat]||'❓'}</span>
      <span class="quiz-cat-name">${cat}</span>
      <span class="quiz-cat-count">${count} sawal</span>
    </button>`;
  }).join('');
  body.innerHTML = `
    <div style="text-align:center; padding:16px 10px 6px;">
      <div style="font-size:40px; margin-bottom:8px;">🧠</div>
      <div style="font-size:15px; font-weight:700; margin-bottom:4px;">Islami Malumat Ka Quiz</div>
      <div style="font-size:13px; color:var(--sub); margin-bottom:14px;">Category chuniye</div>
    </div>
    <button class="quiz-cat-btn" data-cat="__all__" style="border-color:var(--accent);">
      <span class="quiz-cat-ic">🌐</span>
      <span class="quiz-cat-name">Sab Categories (Mix)</span>
      <span class="quiz-cat-count">${QUIZ_BANK.length} sawal</span>
    </button>
    ${catRows}
  `;
  body.querySelectorAll('.quiz-cat-btn').forEach(btn=>{
    btn.onclick = ()=> renderQuizCountSelect(btn.dataset.cat);
  });
}

/* Colours for quiz categories, in alphabetical order; green is left out on purpose */
const QUIZ_PALETTE = ['#3f8fe0','#e0709f','#e0893f','#9b6fd6','#2fb6b0','#c79a2e','#d6708f','#5c7cfa','#c0563f','#3a4d8f'];
function renderQuizCountSelect(cat){
  const pool = cat==='__all__' ? QUIZ_BANK : QUIZ_BANK.filter(q=>q[3]===cat);
  document.getElementById('detailTitle').textContent = "Quiz";
  const body = document.getElementById('detailBody');
  const label = cat==='__all__' ? 'Sab Categories' : cat;
  body.innerHTML = `
    <div style="text-align:center; padding:30px 10px;">
      <div style="font-size:40px; margin-bottom:10px;">${cat==='__all__'?'🌐':(QUIZ_CAT_ICON[cat]||'❓')}</div>
      <div style="font-size:15px; font-weight:700; margin-bottom:6px;">${label}</div>
      <div style="font-size:13px; color:var(--sub); margin-bottom:24px;">Kitne sawal khelna chahte hain?</div>
      <div style="display:flex; gap:12px; justify-content:center;">
        <button id="quiz5" class="quiz-count-btn c5">5 Sawal</button>
        <button id="quiz10" class="quiz-count-btn c10">10 Sawal</button>
      </div>
      <button id="quizBackToCats" style="margin-top:22px; background:none; border:none; color:var(--sub); font-size:12.5px; text-decoration:underline; cursor:pointer;">‹ Category Badlein</button>
    </div>
  `;
  document.getElementById('quiz5').onclick = ()=> startQuiz(pool, Math.min(5, pool.length), label);
  document.getElementById('quiz10').onclick = ()=> startQuiz(pool, Math.min(10, pool.length), label);
  document.getElementById('quizBackToCats').onclick = renderMoreQuiz;
}

function logQuizResult(cat, score, total){
  if(!Array.isArray(state.quizLog)) state.quizLog = [];
  state.quizLog.push({ t: Date.now(), cat, score, total });
  if(state.quizLog.length > 1000) state.quizLog.shift();
  saveState();
}
function startQuiz(pool, n, cat, hooks){
  const picked = shuffleArr(pool).slice(0, n);
  quizState = { questions: picked, idx: 0, score: 0, answered: false, cat: cat || 'Mix', wrong: [], hooks: hooks || {} };
  renderQuizQuestion();
}

/* Dua questions are "prompt / transliteration / Arabic" separated by blank lines; other questions are plain text */
function quizQHtml(q){
  const parts = String(q).split('\n\n');
  if(parts.length<3) return `<div class="quiz-q">${q}</div>`;
  return `<div class="quiz-q">${parts[0]}</div>
    <div class="quiz-q-tr">${parts[1]}</div>
    <div class="quiz-q-ar">${parts[2]}</div>
    ${parts[3] ? `<div class="quiz-q-ref">${parts[3]}</div>` : ''}`;
}
function renderQuizQuestion(){
  const qs = quizState;
  const [q, opts, correct] = quizLocal(qs.questions[qs.idx]);
  document.getElementById('detailTitle').textContent = `Sawal ${qs.idx+1}/${qs.questions.length}`;
  const body = document.getElementById('detailBody');
  body.innerHTML = `
    <div class="quiz-progress"><div class="quiz-progress-fill" style="width:${(qs.idx/qs.questions.length)*100}%"></div></div>
    <div class="quiz-card">
      ${quizQHtml(q)}
    </div>
    <div class="quiz-opts" id="quizOpts">
      ${opts.map((o,i)=>`<button class="quiz-opt qopt-${'ABCD'[i]}" data-i="${i}"><b class="opt-letter">${'ABCD'[i]}</b><span class="quiz-opt-txt">${o}</span></button>`).join('')}
    </div>
    <div id="quizRevealWrap"></div>
    <div id="quizNextWrap" style="margin-top:16px; text-align:center;"></div>
  `;
  body.querySelectorAll('.quiz-opt').forEach(btn=>{
    btn.onclick = ()=>{
      if(qs.answered) return;
      qs.answered = true;
      const chosen = parseInt(btn.dataset.i);
      body.querySelectorAll('.quiz-opt').forEach(b=>{
        const bi = parseInt(b.dataset.i);
        if(bi===correct) b.classList.add('correct');
        else if(bi===chosen) b.classList.add('wrong');
      });
      const item = qs.questions[qs.idx];
      if(chosen===correct){
        qs.score++;
      } else {
        qs.wrong.push({ q, chosenText: opts[chosen], correctText: opts[correct], item });
        document.getElementById('quizRevealWrap').innerHTML = `<div class="quiz-reveal">Sahi Jawab: <b>${opts[correct]}</b></div>`;
      }
      if(qs.hooks.onAnswer) qs.hooks.onAnswer(item, chosen===correct);
      const isLast = qs.idx===qs.questions.length-1;
      document.getElementById('quizNextWrap').innerHTML = `<button id="quizNextBtn" style="padding:12px 28px; border-radius:12px; border:none; background:var(--accent); color:var(--fardText); font-size:14px; font-weight:700; cursor:pointer;">${isLast?'Result Dekhiye':'Agla Sawal'}</button>`;
      document.getElementById('quizNextBtn').onclick = ()=>{
        if(isLast){ renderQuizResult(); } else { qs.idx++; qs.answered=false; renderQuizQuestion(); }
      };
    };
  });
}

function renderQuizResult(){
  const qs = quizState;
  if(!qs.logged){ qs.logged = true; logQuizResult(qs.cat, qs.score, qs.questions.length); }
  const pct = Math.round((qs.score/qs.questions.length)*100);
  const msg = pct>=80 ? 'Zabardast! Mashallah.' : pct>=50 ? 'Achha kiya, aur mehnat kijiye.' : 'Koi baat nahi, dobara koshish kijiye.';
  document.getElementById('detailTitle').textContent = "Result";
  document.getElementById('detailBody').innerHTML = `
    <div style="text-align:center; padding:30px 10px;">
      <div style="font-size:44px; margin-bottom:10px;">🏆</div>
      <div style="font-size:26px; font-weight:800; margin-bottom:4px;">${qs.score} / ${qs.questions.length}</div>
      <div style="font-size:13px; color:var(--sub); margin-bottom:6px;">${pct}% Sahi Jawab</div>
      <div style="font-size:13.5px; margin-bottom:18px;">${msg}</div>
      ${qs.hooks.summary ? qs.hooks.summary() : ''}
      ${qs.wrong.length ? `<button id="quizReviewBtn" class="res-btn">❌ Galat Jawabon ka Jaiza (${qs.wrong.length})</button>
      <button id="quizRedoWrongBtn" class="res-btn">🔁 Sirf Galat Sawal Dobara</button>` : ''}
      <button id="quizRetry" class="res-btn">${qs.hooks.backLabel || 'Dobara Khelein'}</button>
      <button id="quizShareBtn" class="res-btn">📤 Result Share Karein</button>
    </div>
  `;
  document.getElementById('quizRetry').onclick = qs.hooks.back || renderMoreQuiz;
  document.getElementById('quizShareBtn').onclick = ()=> openCardShareChooser({
    kind:'Quiz Result', title: qs.cat || 'Quiz', sub: `${qs.score} / ${qs.questions.length} (${pct}% Sahi Jawab)`, body: msg
  });
  const rvb = document.getElementById('quizReviewBtn');
  if(rvb) rvb.onclick = ()=> renderReviewList(qs.wrong, renderQuizResult, true);
  const rdb = document.getElementById('quizRedoWrongBtn');
  if(rdb) rdb.onclick = ()=>{ startQuiz(qs.wrong.map(w=>w.item), qs.wrong.length, qs.cat, qs.hooks); quizState.logged = true; };
}

let citySearch = '';
const NOTIF_CATS = [
  {key:'fard', label:'Farz Namaz', sub:'Fajr, Zuhr, Asr, Maghrib, Isha'},
  {key:'nafil', label:'Nafil Namaz', sub:'Ishraq, Chaast, Awwabin, Tahajjud'},
  {key:'meal', label:'Sehri / Iftar', sub:'Sehri khatm, Iftar shuru'},
  {key:'special', label:'Tulu / Ghurub / Zawal', sub:'Suraj nikalna, doobna, zawal'},
];
const LEARN_NOTIF = [
  {key:'lafz', label:'Aaj Ka Lafz', sub:'Roz ek naya Islami lafz'},
  {key:'hadees', label:'Aaj ki Hadees', sub:'Roz ek hadees'},
];
function notifPermLabel(){
  if(!('Notification' in window)) return 'Is browser mein yaad-dahaniyan ka support nahi hai';
  if(Notification.permission==='granted') return '✅ Yaad-dahaniyon ki ijaazat mil gayi hai';
  if(Notification.permission==='denied') return '⛔ Yaad-dahaniyan block hain, browser settings mein ijaazat dijiye';
  return 'Yaad-dahaniyan abhi off hain';
}
let settingsTab = 'location'; // location | notif | lang
function renderSettingsMenu(){
  document.getElementById('detailTitle').textContent = 'Settings';
  const items = [
    ['location','🏙️','Apna Shahar Chunein', state.location.name],
    ['qibla','🧭','Qibla ka Rukh', ''],
    ['timefmt','🕒','Waqt ka Andaaz', state.timeFormat==='12' ? '12 Ghante (AM/PM)' : '24 Ghante'],
    ['textsize','🔠','Text ka Size', ({s:'Chhota',m:'Normal',l:'Bara',xl:'Bohot Bara',xxl:'Sabse Bara'}[state.textScale]||'Normal') + ((state.arScale||'m')!=='m' ? ' · Arabic ' + ({l:'Bara',xl:'Bohot Bara',xxl:'Sabse Bara'}[state.arScale]||'') : '')],
    ['homecard','🃏','Home Card', {full:'Poora',strip:'Patli patti',off:'Band'}[state.heroMode||'full']],
    ['feedback','📳','Vibration aur Awaaz', (state.haptics===false?'Vib off':'Vib on')+' · '+(state.sounds===false?'Sound off':'Sound on')],
    ['lang','🌐','Zubaan', state.lang==='en' ? 'English' : 'Hinglish / Roman Urdu'],
    ['notif','🔔','Yaad-dahaniyan', ''],
    ['azaan','🔊','Azaan', azaanState().on ? 'On' : 'Off'],
    ['nafil','🌙','Nafil Namaz Mark Karein', nafilOn() ? 'On' : 'Off'],
    ['calc','🧮','Namaz ka Hisaab', (calcMethod().name.split(' (')[0]) + ' · ' + (state.asrMethod==='shafi' ? "Asr: Shafi'i" : 'Asr: Hanafi') + (hijriOffset() ? ` · Hijri ${hijriOffset()>0?'+':''}${hijriOffset()}` : '')],
    ['iqamah','🕌','Jamaat ka Waqt (Iqamah)', iqamahState().on ? 'On' : 'Off'],
    ['howto','📘','Istemal ka Tareeqa', ''],
    ['backup','💾','Data Backup', ''],
    ['about','ℹ️','Iske Baare Mein', ''],
  ];
  document.getElementById('detailBody').innerHTML = `<div class="more-list set-list">${items.map(([k,ic,l,sub])=>`
    <div class="more-item" data-sec="${k}" role="button" tabindex="0"><div class="ic">${ic}</div><div class="lbl">${l}${sub?`<span class="lblSub">${sub}</span>`:''}</div><div class="chev">›</div></div>`).join('')}</div>`;
  document.querySelectorAll('#detailBody [data-sec]').forEach(el=>{
    el.onclick = ()=>{
      const k = el.dataset.sec;
      if(k==='backup') renderBackup();
      else if(k==='qibla') renderQibla();
      else if(k==='howto') renderHowTo();
      else if(k==='about') renderMoreAbout();
      else if(k==='azaan') renderAzaanSettings();
      else if(k==='nafil') renderNafilSettings();
      else if(k==='calc') renderCalcSettings();
      else if(k==='iqamah') renderIqamahSettings();
      else { settingsTab = k; renderMoreSettings(); }
    };
  });
}
function renderMoreSettings(){
  document.getElementById('detailTitle').textContent = ({notif:'Yaad-dahaniyan', lang:'Zubaan', timefmt:'Waqt ka Andaaz', textsize:'Text ka Size', homecard:'Home Card', feedback:'Vibration aur Awaaz'})[settingsTab] || 'Apna Shahar Chunein';
  const loc = state.location;
  const body = document.getElementById('detailBody');
  const canNotify = 'Notification' in window;
  const granted = canNotify && Notification.permission==='granted';
  body.innerHTML = `
    <div id="settingsPane"></div>
  `;
  const pane = body.querySelector('#settingsPane');

  function renderNotifPane(){
    pane.innerHTML = `
      <div class="ramzan-card" style="margin:0 0 14px;">
        <div style="font-size:12px; color:var(--sub); margin-bottom:10px;">${notifPermLabel()}</div>
        <div style="font-size:11.5px; line-height:1.5; color:var(--sub); margin:-4px 0 12px; padding:8px 10px; border-radius:10px; background:color-mix(in srgb, var(--yellow) 12%, var(--card2));">ℹ️ ${L({rur:'Yaad-dahaniyan aur Azaan tabhi chalte hain jab Waqt24 khula ho ya phone ke background mein chal raha ho. App band kar dene par browser unhe nahi bhej sakta, isliye zaroori waqt par phone ka alarm bhi lagaaiye.', en:'Reminders and Azaan only play while Waqt24 is open or running in the background. Once the app is fully closed, the browser cannot send them, so keep a phone alarm for prayers you must not miss.'})}</div>
        ${!granted && canNotify && Notification.permission!=='denied' ? `<button id="notifPermBtn" style="width:100%; padding:11px; border-radius:10px; border:1px solid var(--line); background:var(--accent); color:var(--fardText); font-size:13px; font-weight:700; cursor:pointer; margin-bottom:12px;">🔔 Yaad-dahaniyan On Karein</button>` : ''}
        ${NOTIF_CATS.map(c=>`
          <div class="roza-toggle" style="padding:8px 0;">
            <span style="font-size:13px; font-weight:600;">${c.label}<span style="display:block; font-size:10.5px; color:var(--sub); font-weight:500; margin-top:2px;">${c.sub}</span></span>
            <div class="switch ${state.notif[c.key]?'on':''}" data-notif-cat="${c.key}"><div class="knob"></div></div>
          </div>
        `).join('')}
      </div>
      <div class="section-title" style="margin-top:0;">Seekhne ki Yaad-dahani</div>
      <div class="ramzan-card" style="margin:0 0 14px;">
        ${LEARN_NOTIF.map(c=>`
          <div class="roza-toggle" style="padding:8px 0;">
            <span style="font-size:13px; font-weight:600;">${c.label}<span style="display:block; font-size:10.5px; color:var(--sub); font-weight:500; margin-top:2px;">${c.sub}</span></span>
            <div class="switch ${state.notif[c.key]?'on':''}" data-notif-cat="${c.key}"><div class="knob"></div></div>
          </div>
        `).join('')}
        <div class="roza-toggle" style="padding:8px 0;">
          <span style="font-size:13px; font-weight:600;">Yaad-dahani ka waqt</span>
          <input type="time" id="learnTimeInput" value="${state.notif.learnTime || '08:00'}" style="padding:6px 8px; border-radius:8px; border:1px solid var(--line); background:var(--card2); color:var(--text); font-size:13px;">
        </div>
        <div style="font-size:10.5px; color:var(--sub); margin-top:6px;">Yaad-dahani tab aati hai jab app khuli ho ya background mein ho.</div>
      </div>
    `;
    const learnInput = pane.querySelector('#learnTimeInput');
    learnInput.onchange = ()=>{ if(learnInput.value){ state.notif.learnTime = learnInput.value; saveState(); scheduleNotifications(true); } };
    const permBtn = pane.querySelector('#notifPermBtn');
    if(permBtn) permBtn.onclick = async ()=>{
      try{ await Notification.requestPermission(); }catch(e){}
      scheduleNotifications(true);
      renderMoreSettings();
    };
    pane.querySelectorAll('[data-notif-cat]').forEach(sw=>{
      sw.onclick = ()=>{
        const cat = sw.dataset.notifCat;
        state.notif[cat] = !state.notif[cat];
        saveState();
        sw.classList.toggle('on', state.notif[cat]);
        scheduleNotifications(true);
      };
    });
  }

  function renderLocationPane(){
    pane.innerHTML = `
      <div class="section-title" style="margin-top:0;">Aapki Maujooda Jagah</div>
      <div class="ramzan-card" style="margin:0 0 14px;">
        <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:8px;">
          <div>
            <div style="font-size:13.5px; font-weight:700; margin-bottom:2px;">📍 ${loc.name}</div>
            <div style="font-size:11.5px; color:var(--sub); margin-bottom:12px;">${loc.lat.toFixed(4)}, ${loc.lon.toFixed(4)} ${loc.source==='gps' ? '(GPS)' : ''}</div>
          </div>
          <button id="saveLocBtn" title="Is jagah ko save karein" style="flex:0 0 auto; width:34px; height:34px; border-radius:10px; border:1px solid var(--line); background:var(--card2); color:var(--text); font-size:16px; cursor:pointer;">${(state.savedLocations||[]).some(c=>c.name===loc.name && c.lat===loc.lat && c.lon===loc.lon) ? '★' : '☆'}</button>
        </div>
        <button id="gpsBtn" style="width:100%; padding:11px; border-radius:10px; border:1px solid var(--line); background:var(--accent); color:var(--fardText); font-size:13px; font-weight:700; cursor:pointer;">📡 GPS Se Location Lein</button>
        <div id="gpsStatus" style="font-size:11.5px; color:var(--sub); margin-top:8px;"></div>
      </div>
      ${(state.savedLocations||[]).length ? `
      <div class="section-title" style="margin-top:0;">Aapki Saved Jagah</div>
      <div id="savedLocList" style="margin-bottom:6px;"></div>
      ` : ''}
      <div class="section-title" style="margin-top:0;">Ya Shehar Chuniye</div>
      <div class="search-bar" style="margin:0 0 10px;"><input id="citySearchInput" placeholder="Shehar dhoondhiye..." value="${citySearch}"></div>
      <div id="cityList"></div>
      <div class="section-title">Hisaab</div>
      <div style="font-size:13px; line-height:1.8; color:var(--sub); padding-bottom:10px;">
        Fajr Angle: 18 darja &nbsp;|&nbsp; Isha Angle: 17 darja<br>
        Asr Hisaab: ${state.asrMethod==='shafi' ? "Shafi'i" : 'Hanafi'} · Hijri: ${hijriOffset()>0?'+':''}${hijriOffset()} din<br>
        <span style="color:var(--text)">Settings › Namaz ka Hisaab</span> mein badal sakte hain.
      </div>
    `;
    setupLocationPane();
  }

  function renderTimeFmtPane(){
    pane.innerHTML = `<div class="theme-row" style="padding:0 0 12px;">
      <button data-fmt="24" class="${state.timeFormat==='24'?'active':''}">24 Ghante</button>
      <button data-fmt="12" class="${state.timeFormat==='12'?'active':''}">12 Ghante (AM/PM)</button>
    </div>`;
    pane.querySelectorAll('[data-fmt]').forEach(b=>{ b.onclick = ()=>{ setTimeFormat(b.dataset.fmt); renderTimeFmtPane(); }; });
  }
  function renderTextSizePane(){
    const sizeRow = (key, opts, label)=>`<div class="ts-lbl">${label}</div><div class="theme-row ts-row" style="padding:0 0 12px;">${opts.map(([k,n])=>`<button data-${key}="${k}" class="${(state[key==='size'?'textScale':'arScale']||'m')===k?'active':''}">${n}</button>`).join('')}</div>`;
    pane.innerHTML = sizeRow('size', [['s','Chhota'],['m','Normal'],['l','Bara'],['xl','Bohot Bara'],['xxl','Sabse Bara']], L({rur:'Poora text', en:'All text'}))
      + sizeRow('ar', [['m','Normal'],['l','Bara'],['xl','Bohot Bara'],['xxl','Sabse Bara']], L({rur:'Arabic text (dua, Qur’ani alfaaz…)', en:'Arabic text (duas, Qur’anic words…)'}))
      + `<div class="ts-prev"><div class="arabic dua-ar" dir="rtl" style="font-family:'Scheherazade New','Noto Naskh Arabic',serif; font-size:26px; line-height:1.9;">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</div><div style="font-size:14px; color:var(--sub); margin-top:6px;">${L({rur:'Shuru Allah ke naam se, jo bada meherbaan, nihayat reham karne wala hai.', en:'In the name of Allah, the Most Gracious, the Most Merciful.'})}</div></div>`;
    pane.querySelectorAll('[data-size]').forEach(b=>{ b.onclick = ()=>{ state.textScale = b.dataset.size; saveState(); applyTextScale(); renderTextSizePane(); }; });
    pane.querySelectorAll('[data-ar]').forEach(b=>{ b.onclick = ()=>{ state.arScale = b.dataset.ar; saveState(); applyTextScale(); renderTextSizePane(); }; });
  }
  function renderHomeCardPane(){
    const m = state.heroMode || 'full';
    pane.innerHTML = `<div class="theme-row" style="padding:0 0 12px;">
      <button data-hm="full" class="${m==='full'?'active':''}">${L({rur:'Poora card', en:'Full card'})}</button>
      <button data-hm="strip" class="${m==='strip'?'active':''}">${L({rur:'Patli patti', en:'Slim strip'})}</button>
      <button data-hm="off" class="${m==='off'?'active':''}">${L({rur:'Band', en:'Off'})}</button>
    </div>
    <div class="backup-note">${L({rur:'Home par abhi ki namaz aur agli namaz ka card. Card ko left/right swipe ya ✕ se sirf is baar ke liye chhota ya band kar sakte hain; app dobara kholne par wapas aa jata hai. Hamesha ke liye chhota ya band rakhna ho to yahan se chunein.', en:'The card on Home showing the current and next prayer. Swiping it away or tapping ✕ only hides it for this visit; it returns when you reopen the app. Choose here to keep it slim or off permanently.'})}</div>`;
    pane.querySelectorAll('[data-hm]').forEach(b=>{ b.onclick = ()=>{ setHeroMode(b.dataset.hm); renderHomeCardPane(); }; });
  }
  function renderLangPane(){
    pane.innerHTML = `
      <div class="section-title" style="margin-top:0;">${L({rur:'Zubaan chuniye',en:'Choose language'})}</div>
      ${[['rur','Hinglish / Roman Urdu',L({rur:'Maujooda zubaan',en:'Current language'})],['en','English',L({rur:'Menu aur buttons English mein',en:'Menus and buttons in English'})]].map(([k,l,sub])=>`
        <div class="lang-opt ${state.lang===k?'on':''}" data-lang="${k}" role="button" tabindex="0"><div><b>${l}</b><span>${sub}</span></div><div class="lang-check">${state.lang===k?'✓':''}</div></div>`).join('')}
      <div class="backup-note">${L({rur:"English mein menu aur buttons badal jate hain; dua, hadees, quiz aur Khaas Shabd ka matlab abhi Roman Urdu mein hi rahega.", en:"Menus, buttons and all content switch to English."})}</div>
    `;
    pane.querySelectorAll('[data-lang]').forEach(el=>{
      el.onclick = ()=>{ if(state.lang===el.dataset.lang) return; state.lang = el.dataset.lang; saveState(); reloadSmooth(true); };
    });
  }
  if(settingsTab==='notif') renderNotifPane(); else if(settingsTab==='lang') renderLangPane(); else if(settingsTab==='timefmt') renderTimeFmtPane(); else if(settingsTab==='textsize') renderTextSizePane(); else if(settingsTab==='homecard') renderHomeCardPane(); else if(settingsTab==='feedback') renderFeedbackPane(pane); else renderLocationPane();

  function setupLocationPane(){
  const cityListEl = body.querySelector('#cityList');
  function renderCityRow(c){
    const isActive = loc.source!=='gps' && loc.name===c.name;
    const row = document.createElement('div');
    row.className = 'hadees-item';
    row.style.margin = '0 0 8px';
    row.style.cursor = 'pointer';
    row.style.display = 'flex';
    row.style.justifyContent = 'space-between';
    row.style.alignItems = 'center';
    if(isActive){ row.style.borderColor = 'var(--accent)'; }
    row.innerHTML = `<span style="font-size:13.5px; font-weight:600;">${c.name}${c.state ? `<span style="color:var(--sub); font-weight:500;"> - ${c.state}</span>` : ''}</span>${isActive ? '<span style="color:var(--accentInk); font-size:13px;">✓</span>' : ''}`;
    row.onclick = ()=>{
      state.location = {name:c.name, lat:c.lat, lon:c.lon, state:c.state, source:'manual'};
      saveState();
      renderHome(); renderCalendar();
      renderMoreSettings();
    };
    return row;
  }
  function renderCityList(){
    cityListEl.innerHTML = '';
    if(citySearch.trim()===''){
      PRIORITY_CITIES.forEach(c=> cityListEl.appendChild(renderCityRow(c)));
      const divider = document.createElement('div');
      divider.textContent = 'Baaki Shehar';
      divider.style.cssText = 'font-size:11px; font-weight:700; color:var(--sub); margin:10px 0 8px; text-transform:uppercase; letter-spacing:0.3px;';
      cityListEl.appendChild(divider);
      OTHER_CITIES.forEach(c=> cityListEl.appendChild(renderCityRow(c)));
    } else {
      CITIES.filter(c=>c.name.toLowerCase().includes(citySearch.toLowerCase())).forEach(c=>{
        cityListEl.appendChild(renderCityRow(c));
      });
    }
  }
  renderCityList();
  body.querySelector('#citySearchInput').oninput = (e)=>{ citySearch=e.target.value; renderCityList(); };
  function renderSavedLocList(){
    const wrap = body.querySelector('#savedLocList');
    if(!wrap) return;
    wrap.innerHTML = '';
    (state.savedLocations||[]).forEach(c=>{
      const isActive = loc.name===c.name && loc.lat===c.lat && loc.lon===c.lon;
      const row = document.createElement('div');
      row.className = 'hadees-item';
      row.style.cssText = 'margin:0 0 8px; cursor:pointer; display:flex; justify-content:space-between; align-items:center; gap:8px;'+(isActive?' border-color:var(--accent);':'');
      row.innerHTML = `<span style="font-size:13.5px; font-weight:600; flex:1;">⭐ ${c.name}${c.state ? `<span style="color:var(--sub); font-weight:500;"> - ${c.state}</span>` : ''}${isActive ? ' <span style="color:var(--accentInk);">✓</span>' : ''}</span>
        <button data-rm="1" title="Hatayein" style="flex:0 0 auto; width:26px; height:26px; border-radius:8px; border:1px solid var(--line); background:var(--card); color:var(--sub); font-size:12px; cursor:pointer;">✕</button>`;
      row.onclick = (e)=>{
        if(e.target.closest('[data-rm]')) return;
        state.location = {name:c.name, lat:c.lat, lon:c.lon, state:c.state, source:'manual'};
        saveState();
        renderHome(); renderCalendar();
        renderMoreSettings();
      };
      row.querySelector('[data-rm]').onclick = (e)=>{
        e.stopPropagation();
        state.savedLocations = (state.savedLocations||[]).filter(x=>!(x.name===c.name && x.lat===c.lat && x.lon===c.lon));
        saveState();
        renderMoreSettings();
      };
      wrap.appendChild(row);
    });
  }
  renderSavedLocList();
  const saveLocBtn = body.querySelector('#saveLocBtn');
  if(saveLocBtn){
    saveLocBtn.onclick = ()=>{
      if(!state.savedLocations) state.savedLocations = [];
      const already = state.savedLocations.some(c=>c.name===loc.name && c.lat===loc.lat && c.lon===loc.lon);
      if(already){
        state.savedLocations = state.savedLocations.filter(c=>!(c.name===loc.name && c.lat===loc.lat && c.lon===loc.lon));
        showToast('Jagah saved list se hata di gayi');
      } else {
        state.savedLocations.push({name:loc.name, lat:loc.lat, lon:loc.lon, state:loc.state});
        showToast('Jagah save ho gayi');
      }
      saveState();
      renderMoreSettings();
    };
  }
  body.querySelector('#gpsBtn').onclick = ()=>{
    const statusEl = body.querySelector('#gpsStatus');
    if(!navigator.geolocation){
      statusEl.textContent = 'Is browser mein GPS support nahi hai.';
      return;
    }
    statusEl.innerHTML = '<div>Location maloom ki jaa rahi hai...</div><div class="skel-line"></div><div class="skel-line short"></div>';
    navigator.geolocation.getCurrentPosition(
      (pos)=>{
        state.location = {name:'Current Location', lat:pos.coords.latitude, lon:pos.coords.longitude, source:'gps', tz:deviceTZ()};
        saveState();
        renderHome(); renderCalendar();
        renderMoreSettings();
      },
      (err)=>{
        statusEl.textContent = 'Location nahi mil saki. Manually shehar chuniye.';
      },
      {timeout:10000}
    );
  };
  }
}
function renderMoreRamzan(){
  document.getElementById('detailTitle').textContent = 'Roza';
  const live = gregorianToHijri(new Date()).month===9;
  document.getElementById('detailBody').innerHTML = `
    ${live ? '' : `<div class="backup-note" style="margin-bottom:12px;">🌙 Abhi Ramzan nahi hai, yeh sirf jhalak hai. Ramzan mein yahan roza aur namaz mark kar sakenge.</div>`}
    ${live ? ramzanScreenTopHtml() : ''}
    <div class="${live ? '' : 'ramzan-locked'}">
    <div class="section-title" style="margin-top:0;">Aaj ka Roza</div>
    <div class="ramzan-card" style="margin:0 0 14px;">
      <div class="roza-toggle">
        <span style="font-size:13.5px; font-weight:600;" id="rozaLabel">Roza Rakha</span>
        <div class="switch" id="rozaSwitch"><div class="knob"></div></div>
      </div>
    </div>
    <div class="section-title">Aaj ki 5 Namaz</div>
    <div id="ramzanNamazList"></div>
    </div>
    <div id="ramzanCal"></div>
  `;
  renderRamzan();
  if(live) wireRamzanScreenTop();
  renderRamzanCalendar();
}
let rzView = 'grid', rzSel = null;
function renderRamzanCalendar(){
  const today = new Date(); today.setHours(0,0,0,0);
  const th = gregorianToHijri(today);
  const year = th.month>9 ? th.year+1 : th.year;
  const first = hijriToGregorian(1, 9, year);
  const shawwal1 = hijriToGregorian(1, 10, year);
  const count = Math.round((shawwal1 - first)/86400000);
  const rows = [];
  for(let n=1; n<=count; n++){
    const d = new Date(first.getFullYear(), first.getMonth(), first.getDate()+n-1);
    const sch = buildSchedule(d);
    const sehri = sch.find(x=>x.key==='sehri'), iftar = sch.find(x=>x.key==='iftar');
    rows.push({ n, d, sehri: sehri ? fmtTime(sehri.end) : '--', iftar: iftar ? fmtTime(iftar.start) : '--', isToday: d.getTime()===today.getTime(), qadr: n>=21 && n%2===1 });
  }
  if(rzSel===null || rzSel>count){ const t = rows.find(r=>r.isToday); rzSel = t ? t.n : 1; }
  const ashra = [[1,10,'🤲 Pehla Ashra, Rehmat'],[11,20,'🕊️ Doosra Ashra, Maghfirat'],[21,count,'🔥 Teesra Ashra, Jahannam se Nijat']];
  const dateStr = d=> `${DOW[d.getDay()].slice(0,3)}, ${d.getDate()} ${MON[d.getMonth()].slice(0,3)} ${d.getFullYear()}`;
  const detail = r=> `<div class="rz-detail">
      <div class="rz-detail-top"><span class="rz-detail-n">${r.n}</span>
        <div><div class="rz-g">${DOW[r.d.getDay()]}, ${r.d.getDate()} ${MON[r.d.getMonth()]} ${r.d.getFullYear()}</div>
        <div class="rz-h">${r.n} Ramzan-ul-Mubarak ${year} AH${r.qadr ? ' • ✨ Shab-e-Qadr ka Ehtimaal' : ''}</div></div></div>
      <div class="rz-detail-times"><span>🌅 Sehri khatm: <b>${r.sehri}</b></span><span>🌇 Iftar: <b>${r.iftar}</b></span></div>
    </div>`;
  const gridHtml = `
    <div class="rz-dow">${['S','M','T','W','T','F','S'].map(x=>`<span>${x}</span>`).join('')}</div>
    <div class="rz-grid">
      ${Array(first.getDay()).fill('<div></div>').join('')}
      ${rows.map(r=>`<button class="rz-cell ${r.isToday?'today':''} ${r.qadr?'qadr':''} ${r.n===rzSel?'sel':''}" data-n="${r.n}">
        <span class="rz-cn">${r.n}</span>
        <span class="rz-cg">${r.d.getDate()} ${MON[r.d.getMonth()].slice(0,3)}</span>
        ${r.qadr ? '<span class="rz-cq">✨</span>' : ''}
      </button>`).join('')}
    </div>
    <div id="rzDetailWrap">${detail(rows[rzSel-1])}</div>
    <div class="rz-legend">${L({rur:'Andar ka bara number = Ramzan ka din &nbsp;•&nbsp; ✨ = Shab-e-Qadr ka ehtimaal', en:'Large number = day of Ramadan &nbsp;•&nbsp; ✨ = possible Laylat-ul-Qadr'})}</div>`;
  const listHtml = ashra.map(([a,b,label])=>`
      <div class="rz-ashra">${label}</div>
      ${rows.filter(r=>r.n>=a && r.n<=b).map(r=>`<div class="rz-row ${r.isToday?'today':''} ${r.qadr?'qadr':''}">
        <div class="rz-n">${r.n}</div>
        <div class="rz-mid">
          <div class="rz-g">${dateStr(r.d)}</div>
          <div class="rz-h">${r.n} Ramzan-ul-Mubarak ${year} AH${r.qadr ? ' • ✨ Shab-e-Qadr ka Ehtimaal' : ''}</div>
        </div>
        <div class="rz-t"><span>🌅 ${r.sehri}</span><span>🌇 ${r.iftar}</span></div>
      </div>`).join('')}
    `).join('');
  document.getElementById('ramzanCal').innerHTML = `
    <div class="section-title">Ramzan ${year} AH ka Calendar</div>
    <div class="backup-note" style="margin-bottom:10px;">${first.getFullYear()} mein mutawaqqa tareekhein (Hijri arithmetic hisaab se; chaand dikhne par 1 din aage-peeche ho sakta hai). Ramzan ${count} din ka hai.</div>
    <div class="view-toggle" style="margin:0 0 12px;">
      <button id="rzGridBtn" class="${rzView==='grid'?'active':''}">Grid</button>
      <button id="rzListBtn" class="${rzView==='list'?'active':''}">List</button>
    </div>
    ${rzView==='grid' ? gridHtml : `<div class="backup-note" style="margin-bottom:6px;">🌅 Sehri khatm &nbsp; 🌇 Iftar</div>` + listHtml}
  `;
  document.getElementById('rzGridBtn').onclick = ()=>{ rzView='grid'; renderRamzanCalendar(); };
  document.getElementById('rzListBtn').onclick = ()=>{ rzView='list'; renderRamzanCalendar(); };
  document.querySelectorAll('#ramzanCal .rz-cell').forEach(el=>{
    el.onclick = ()=>{
      rzSel = parseInt(el.dataset.n);
      document.querySelectorAll('#ramzanCal .rz-cell').forEach(c=> c.classList.toggle('sel', c===el));
      document.getElementById('rzDetailWrap').innerHTML = detail(rows[rzSel-1]);
    };
  });
}
function renderMoreAbout(){
  document.getElementById('detailTitle').textContent="Iske Baare Mein";
  document.getElementById('detailBody').innerHTML = `
    <div style="font-size:13.5px; line-height:1.8; color:var(--sub);">
      Namaz Timer App: Aapki roz ki namaz, sehri, iftar aur nawafil ke auqaat ek nazar mein.<br><br>
      Banaya gaya hai mohabbat se, taake har Musalman apni namaz waqt par ada kar sake. Allah hum sabko namaz ki hifazat karne ki taufeeq de. Ameen.
    </div>
  `;
}

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
/* ===== QUR'AN RECITATION (Mishary Alafasy, 128 kbps, ayah by ayah from EveryAyah) =====
   Light by design: nothing is bundled or saved. One <audio> element plays the current ayah while a second one
   quietly preloads only the next ayah, so playback is gapless without decoding or caching anything. */
const QA_COUNTS = [7,286,200,176,120,165,206,75,129,109,123,111,43,52,99,128,111,110,98,135,112,78,118,64,77,227,93,88,69,60,34,30,73,54,45,83,182,88,75,85,54,53,89,59,37,35,38,29,18,45,60,49,62,55,78,96,29,22,24,13,14,11,11,18,12,12,30,52,52,44,28,28,20,56,40,31,50,40,46,42,29,19,36,25,22,17,19,26,30,20,15,21,11,8,8,19,5,8,8,11,11,8,3,9,5,4,7,3,6,3,5,4,5,6];
const QA_JUZ = [1,149,260,386,517,641,751,900,1042,1201,1328,1479,1649,1803,2030,2215,2484,2674,2876,3215,3386,3564,3733,4090,4265,4511,4706,5105,5242,5673]; /* first ayah (1..6236) of each Para */
const QA_BASE = 'https://everyayah.com/data/Alafasy_128kbps/';
const QA_TOTAL = 6236;
const QA_CUM = (()=>{ const c=[0]; QA_COUNTS.forEach(n=>c.push(c[c.length-1]+n)); return c; })();
const qaAbs = (s,a)=> QA_CUM[s-1] + a;
function qaSurahAyah(abs){ let s = 1; while(s < 114 && QA_CUM[s] < abs) s++; return { s, a: abs - QA_CUM[s-1] }; }
const qaPad = n=> String(n).padStart(3,'0');

/* Which ayah does a page of this Mushaf start with? The exact page-by-ayah table of this edition is not bundled, so it is
   exact on Para-start pages and estimated between known anchors (every Surah start and Para start) everywhere else. */
let QA_ANCHORS = null;
function qaLastPage(){ return QURAN_SURAHS[113].page; }
function qaPageStart(page){
  /* If an exact table (first ayah of every page, 1-based page index) is ever added as QA_PAGE_FIRST, it wins. */
  if(typeof QA_PAGE_FIRST !== 'undefined' && QA_PAGE_FIRST[page-1]) return { abs: QA_PAGE_FIRST[page-1], exact:true };
  if(page > qaLastPage()) return { abs: QA_TOTAL, exact:true };
  const para = QURAN_PARAS.find(p=>p.page===page);
  if(para) return { abs: QA_JUZ[para.n-1], exact:true };
  const sur = QURAN_SURAHS.find(x=>x.page===page);
  if(sur) return { abs: qaAbs(sur.n, 1), exact:true };
  if(!QA_ANCHORS) QA_ANCHORS = QURAN_SURAHS.map(x=>({ page:x.page, abs:qaAbs(x.n,1) })).concat(QURAN_PARAS.map(p=>({ page:p.page, abs:QA_JUZ[p.n-1] })))
    .sort((x,y)=> x.page - y.page || x.abs - y.abs);
  let a = QA_ANCHORS[0], b = { page: qaLastPage() + 1, abs: QA_TOTAL + 1 };
  for(const x of QA_ANCHORS){ if(x.page <= page) a = x; else { b = x; break; } }
  const abs = a.abs + Math.round((page - a.page) * (b.abs - a.abs) / Math.max(1, b.page - a.page));
  return { abs: Math.max(1, Math.min(QA_TOTAL, abs)), exact:false };
}
/* While the recitation plays and the reader is showing the page it started from, turn the page when the audio reaches the next one. */
/* ---- Line highlight: the line(s) being recited are tinted on the page image. Light: one absolutely positioned <div>, moved on every ayah. ---- */
const QA_GEO = { normal:{ t:.090, b:.911, wb:1.17, wm:.97 }, tajweed:{ t:.089, b:.911, wb:1.08, wm:.8 } };  /* averages + row-height weights (surah banner, Bismillah) */
/* 8-line pages (Al-Fatihah and the start of Al-Baqarah): line 2 centre and line step, as a fraction of the image height */
const QA_GEO_SHORT = { 2:{ normal:[.530,.0455], tajweed:[.463,.0677] }, 3:{ normal:[.543,.0443], tajweed:[.478,.0667] } };
function qaAyahPage(abs){ let lo = 0, hi = QA_PAGE_FIRST.length - 1; while(lo < hi){ const m = (lo + hi + 1) >> 1; if(QA_PAGE_FIRST[m] <= abs) lo = m; else hi = m - 1; } return lo + 1; }
function qaLineSpan(abs, bism){
  const i = (abs - 1) * 2; let a = parseInt(QA_LINES[i], 16), b = parseInt(QA_LINES[i+1], 16);
  if(bism){ a = b = a - 1; if(a < 1) return null; }
  return [a, b];
}
/* Row edges of a page as fractions of the image height: edges[i-1]..edges[i] is line i. */
function qaEdges(page, ed){
  const g = QA_GEO[ed], sh = QA_GEO_SHORT[page];
  if(sh){ const [c, st] = sh[ed], out = []; for(let l = 1; l <= 9; l++) out.push(c + st * (l - 1.5 - 1)); return out; }
  const w = new Array(16).fill(1), f = QA_PAGE_FIRST[page-1], nx = QA_PAGE_FIRST[page] || (QA_TOTAL + 1);
  for(let x = f; x < nx; x++){
    const r = qaSurahAyah(x); if(r.a !== 1 || r.s === 1) continue;
    const ln = parseInt(QA_LINES[(x-1)*2], 16), hb = qaHasBism(r.s);
    if(hb) w[ln-1] = g.wm;
    w[ln - (hb ? 2 : 1)] = g.wb;
  }
  let tot = 0; for(let i = 1; i <= 15; i++) tot += w[i];
  const gm = QA_GEOM[ed], t = (gm.t[page-2] || g.t * 1000) / 1000, b = (gm.b[page-2] || g.b * 1000) / 1000, out = [t]; let c = 0;
  for(let i = 1; i <= 15; i++){ c += w[i]; out.push(t + (b - t) * c / tot); }
  return out;
}
function qaHL(){
  const wrap = document.getElementById('quranWrap');
  let hl = wrap && wrap.querySelector('.qhl');
  const page = wrap && state.quranPage;
  if(!wrap || !qa.on || typeof QA_LINES === 'undefined' || !page || page >= QURAN_SURAHS[113].page || qaAyahPage(qa.abs) !== page){ if(hl) hl.remove(); return; }
  const img = wrap.querySelector('.quran-page-img'), span = qaLineSpan(qa.abs, qa.bism);
  if(!img || !span){ if(hl) hl.remove(); return; }
  if(!img.naturalWidth){ if(!img._hlw){ img._hlw = 1; img.addEventListener('load', ()=>qaHL(), { once:true }); } return; }
  const E = qaEdges(page, quranEd());
  let y0 = E[span[0]-1], y1 = E[span[1]]; { const pad = (y1 - y0) * .04; y0 += pad; y1 -= pad; }
  /* the image is letterboxed inside its box (object-fit: contain): find where it really is */
  const bw = img.clientWidth, bh = img.clientHeight, k = Math.min(bw / img.naturalWidth, bh / img.naturalHeight);
  const iw = img.naturalWidth * k, ih = img.naturalHeight * k, ox = img.offsetLeft + (bw - iw) / 2, oy = img.offsetTop + (bh - ih) / 2;
  if(!hl){ hl = document.createElement('div'); hl.className = 'qhl'; wrap.appendChild(hl); }
  hl.style.cssText = `left:${(ox + iw * .085).toFixed(1)}px;width:${(iw * .83).toFixed(1)}px;top:${(oy + ih * y0).toFixed(1)}px;height:${(ih * (y1 - y0)).toFixed(1)}px`;
}
window.addEventListener('resize', ()=>{ if(qa.on) qaHL(); });
function qaFollowPage(){
  if(!qa.on || !qa.syncPage || !document.getElementById('quranWrap') || !document.getElementById('detailOverlay').classList.contains('active')) return;
  const viewing = (typeof state !== 'undefined') ? state.quranPage : 0;
  if(viewing !== qa.syncPage) return;
  /* exact table: the page this ayah is on (works forwards and backwards) */
  const np = Math.min(qaLastPage(), qaAyahPage(qa.abs));
  if(np === qa.syncPage) return;
  const fwd = np > qa.syncPage;
  qa.syncPage = np;           /* set first, so the reader's own page-change hook does not restart the audio */
  /* turn the page with the same animation as a swipe; if a swipe animation is mid-way, fall back to a plain switch */
  if(typeof slideDetail === 'function'){
    slideDetail(fwd ? 1 : -1, ()=>renderQuranReader(np));
    setTimeout(()=>{ if(state.quranPage !== np && qa.syncPage === np && document.getElementById('quranWrap')) renderQuranReader(np); }, 900);
  } else renderQuranReader(np);
}

/* Player state. `bism` = currently on the Bismillah that opens a Surah (Al-Fatihah has it as ayah 1; At-Tawbah has none). */
const qa = { voice:'ar', part:'a', store:{ ar:{ dur:{}, head:{} }, ur:{ dur:{ b:5.784 }, head:{} } }, rate:1, rep:0, repCount:0, sleepMin:0, sleepT:0, dur:{}, headDone:{}, syncPage:0, forceSync:false, on:false, abs:1, bism:false, exact:true, playing:false, A:null, B:null, cur:null, err:false, loading:false };
/* Surahs 2-114 except At-Tawbah open with a Bismillah step. Arabic: Alafasy's Bismillah. Urdu: the recorded Urdu translation of it (the Shamshad Ali Khan set has none). Arabic + Urdu: the Arabic, then the Urdu. */
const qaHasBism = s => s !== 1 && s !== 9;
const QA_UR_BISM = 'qaudio/bismillah-ur.mp3';
const qaBismDflt = ()=> qa.voice === 'both' ? 11 : 5.8;
/* Urdu translation voice: Shamshad Ali Khan reading the Jalandhry translation, ayah by ayah (EveryAyah, 46 kbps).
   That set has no separate Bismillah, so the Urdu Bismillah comes from QA_UR_BISM. */
const QA_UR_BASE = 'https://everyayah.com/data/translations/urdu_shamshad_ali_khan_46kbps/';
/* voice: 'ar' Arabic only, 'ur' Urdu only, 'both' = every ayah in Arabic, then in Urdu. In 'both' each ayah has two parts: qa.part 'a' then 'u'. */
const qaVoiceOf = part=> qa.voice === 'both' ? (part === 'u' ? 'ur' : 'ar') : qa.voice;
const qaBaseOf = v=> v === 'ur' ? QA_UR_BASE : QA_BASE;
const qaBpsOf = v=> v === 'ur' ? 5750 : 16000;
const qaVoiceName = ()=> qa.voice === 'ur' ? 'Urdu tarjuma · Shamshad Ali Khan' : qa.voice === 'both' ? (qa.part === 'u' ? 'Urdu tarjuma · Shamshad Ali Khan' : 'Arabi · Mishary Alafasy') : 'Mishary Alafasy';
/* length of one ayah step; in 'both' it is the Arabic and the Urdu file together (undefined until both are known) */
function qaDurGet(k){
  const st = qa.store;
  if(qa.voice !== 'both') return st[qa.voice].dur[k];
  if(k === 'b') return st.ar.dur.b ? st.ar.dur.b + (st.ur.dur.b || 5.784) : undefined;
  const x = st.ar.dur[k], y = st.ur.dur[k]; return (x && y) ? x + y : undefined;
}
function qaSetVoice(v, restart){
  v = v === 'ur' || v === 'both' ? v : 'ar';
  if(v === qa.voice && !restart) return;
  qa.voice = v; qa.part = 'a';
  state.qaVoice = v; saveState();
  if(qa.on){
    const was = qa.playing || qa.loading; qa.repCount = 0;
    if(qa.A){ qa.cur.pause(); [qa.A, qa.B].forEach(el=>{ el.removeAttribute('src'); try{ el.load(); }catch(e){} }); }
    qa.playing = false; qa.loading = false; qa.err = false;
    if(was) qaPlayCurrent(); else qaUI();
  } else qaOptsUI();
}
function qaFile(abs, bism, part){
  const v = qaVoiceOf(part === undefined ? qa.part : part);
  if(bism) return v === 'ur' ? QA_UR_BISM : QA_BASE + '001001.mp3';
  const r = qaSurahAyah(abs); return qaBaseOf(v) + qaPad(r.s) + qaPad(r.a) + '.mp3';
}
function qaNextStep(abs, bism, part){
  if(part === undefined) part = qa.part;
  if(bism) return (qa.voice === 'both' && part !== 'u') ? { abs, bism:true, part:'u' } : { abs, bism:false, part:'a' };
  if(qa.voice === 'both' && part !== 'u') return { abs, bism:false, part:'u' };
  if(abs >= QA_TOTAL) return null;
  const n = abs + 1, r = qaSurahAyah(n);
  return { abs:n, bism: r.a === 1 && qaHasBism(r.s), part:'a' };
}
function qaPrevStep(abs, bism, part){
  if(part === undefined) part = qa.part;
  const both = qa.voice === 'both', pu = both ? 'u' : 'a';
  if(both && !bism && part === 'u') return { abs, bism:false, part:'a' };
  if(bism && both && part === 'u') return { abs, bism:true, part:'a' };
  if(bism) return abs > 1 ? { abs:abs-1, bism:false, part:pu } : { abs, bism:false, part:'a' };
  const r = qaSurahAyah(abs);
  if(r.a === 1 && qaHasBism(r.s)) return { abs, bism:true, part:pu };
  return { abs: Math.max(1, abs-1), bism:false, part: abs > 1 ? pu : 'a' };
}
function qaApplyRate(){ [qa.A, qa.B].forEach(el=>{ if(!el) return; el.defaultPlaybackRate = qa.rate; el.playbackRate = qa.rate; try{ el.preservesPitch = true; }catch(e){} }); }
const QA_RATES = [1, 1.25, 1.5, 0.75], QA_REPS = [0, 1, 3], QA_SLEEPS = [0, 15, 30, 60];
function qaCycle(kind){
  if(kind === 'rate'){ qa.rate = QA_RATES[(QA_RATES.indexOf(qa.rate) + 1) % QA_RATES.length]; qaApplyRate(); state.qaRate = qa.rate; saveState(); }
  else if(kind === 'rep'){ qa.rep = QA_REPS[(QA_REPS.indexOf(qa.rep) + 1) % QA_REPS.length]; qa.repCount = 0; }
  else if(kind === 'sleep'){ const r = document.getElementById('qpSleepRow'); if(r) r.hidden = !r.hidden; }
  qaOptsUI();
}
function qaSetSleep(min){
  min = Math.max(0, Math.min(720, Math.round(+min || 0)));
  clearTimeout(qa.sleepT); qa.sleepT = 0; qa.sleepMin = min;
  if(min){ qa.sleepT = setTimeout(()=>{ qa.sleepMin = 0; qa.sleepT = 0; qaStop(); showToast(L({rur:'Sleep timer: tilawat band ho gayi', en:'Sleep timer: recitation stopped'})); }, min * 60000); }
  const r = document.getElementById('qpSleepRow'); if(r) r.hidden = true;
  qaOptsUI();
}
function qaOptsUI(){
  const e = document.getElementById('qPlayer'); if(!e) return;
  const va = e.querySelector('#qpVoiceAr'), vu = e.querySelector('#qpVoiceUr');
  const vb = e.querySelector('#qpVoiceBoth');
  va.textContent = '🎙 ' + L({rur:'Arabi tilawat', en:'Arabic recitation'}); vu.textContent = '🗣 ' + L({rur:'Sirf Urdu tarjuma', en:'Urdu translation only'}); vb.textContent = '🎧 ' + L({rur:'Arabi + Urdu, ek ek ayat', en:'Arabic + Urdu, ayah by ayah'});
  va.classList.toggle('on', qa.voice === 'ar'); vu.classList.toggle('on', qa.voice === 'ur'); vb.classList.toggle('on', qa.voice === 'both');
  e.querySelector('#qpRate').textContent = '⚡ ' + qa.rate + '×';
  e.querySelector('#qpRep').textContent = '🔁 ' + (qa.rep === 0 ? L({rur:'Dohraana', en:'Repeat'}) : qa.rep === 1 ? L({rur:'Ayat dohraayein', en:'Repeat ayah'}) : '3× ' + L({rur:'har ayat', en:'each ayah'}));
  e.querySelector('#qpSleep').textContent = '😴 ' + (qa.sleepMin ? qa.sleepMin + ' min' : L({rur:'Sleep timer', en:'Sleep timer'}));
  ['qpRate','qpRep','qpSleep'].forEach(id=>{ const b = e.querySelector('#'+id), on = id==='qpRate' ? qa.rate !== 1 : id==='qpRep' ? qa.rep : qa.sleepMin; b.classList.toggle('on', !!on); });
}
const qaKey = (abs, bism)=> bism ? 'b' : abs;
/* Surah timing. Exact lengths of every ayah are learned lazily (tiny HEAD requests: at 128 kbps, bytes / 16000 = seconds);
   until then the missing ones are estimated from the average of the known ones. */
function qaHeadDurations(){
  const r = qaSurahAyah(qa.abs); if(typeof fetch !== 'function') return;
  (qa.voice === 'both' ? ['ar', 'ur'] : [qa.voice]).forEach(v=>{
    const st = qa.store[v]; if(st.head[r.s]) return;
    st.head[r.s] = 1;
    const todo = []; for(let a = 1; a <= QA_COUNTS[r.s-1]; a++){ const k = QA_CUM[r.s-1] + a; if(!st.dur[k]) todo.push(k); }
    let i = 0, dead = false;
    const worker = async ()=>{
      while(!dead && i < todo.length){
        const k = todo[i++], q = qaSurahAyah(k);
        try{
          const res = await fetch(qaBaseOf(v) + qaPad(q.s) + qaPad(q.a) + '.mp3', { method:'HEAD' });
          const n = +res.headers.get('content-length');
          if(!res.ok || !n){ dead = true; return; }
          if(!st.dur[k]) st.dur[k] = n / qaBpsOf(v);
        }catch(e){ dead = true; return; }
      }
      if(!dead) qaProg();
    };
    worker(); worker();
  });
}
function qaTimes(){
  const r = qaSurahAyah(qa.abs), n = QA_COUNTS[r.s-1], base = QA_CUM[r.s-1];
  const known = []; for(let a = 1; a <= n; a++){ const x = qaDurGet(base+a); if(x) known.push(x); }
  const avg = known.length ? known.reduce((x,y)=>x+y,0) / known.length : (qa.voice === 'both' ? 14 : 8);
  const d = a => qaDurGet(base+a) || avg;
  const hasB = qaHasBism(r.s), bd = qaDurGet('b') || qaBismDflt();
  let total = hasB ? bd : 0, done = 0;
  for(let a = 1; a <= n; a++) total += d(a);
  if(hasB && !qa.bism) done += bd;
  for(let a = 1; a < r.a && !qa.bism; a++) done += d(a);
  if(qa.bism && qa.abs !== base+1) done = 0;
  let t = (qa.cur && qa.cur.currentTime) || 0;
  if(qa.voice === 'both' && qa.part === 'u') t += (qa.bism ? qa.store.ar.dur.b : qa.store.ar.dur[qa.abs]) || (qa.bism ? 5 : 0);
  done += t;
  done = Math.min(done, total);
  return { total, done, approx: known.length < n || (hasB && !qaDurGet('b')) };
}
/* Which ayah (and how far into it) is at fraction f of the whole surah? */
function qaLocate(f){
  const r = qaSurahAyah(qa.abs), n = QA_COUNTS[r.s-1], base = QA_CUM[r.s-1], T = qaTimes();
  const known = []; for(let a = 1; a <= n; a++){ const x = qaDurGet(base+a); if(x) known.push(x); }
  const avg = known.length ? known.reduce((x,y)=>x+y,0) / known.length : (qa.voice === 'both' ? 14 : 8);
  let t = Math.max(0, Math.min(.9999, f)) * T.total;
  if(qaHasBism(r.s)){ const bd = qaDurGet('b') || qaBismDflt(); if(t < bd){ let off = t, part = 'a'; if(qa.voice === 'both'){ const ab = qa.store.ar.dur.b || 5; if(off >= ab){ part = 'u'; off -= ab; } } return { abs: base + 1, bism:true, off, part }; } t -= bd; }
  for(let a = 1; a <= n; a++){
    const d = qaDurGet(base+a) || avg;
    if(t < d || a === n){
      let off = Math.min(t, d), part = 'a';
      if(qa.voice === 'both'){ const ad = qa.store.ar.dur[base+a] || d / 2; if(off >= ad){ part = 'u'; off -= ad; } }
      return { abs: base + a, bism:false, off, part };
    }
    t -= d;
  }
}
function qaSeek(f){
  qa.repCount = 0;
  if(typeof trpJump === 'function') setTimeout(trpJump, 0);
  const loc = qaLocate(f); if(!loc) return;
  qaEls();
  const same = loc.abs === qa.abs && loc.bism === qa.bism && qa.cur.src === qaFile(loc.abs, loc.bism, loc.part);
  qa.abs = loc.abs; qa.bism = loc.bism; qa.part = loc.part || 'a'; qa.exact = true; qaFollowPage();
  const apply = ()=>{ try{ qa.cur.currentTime = loc.off; }catch(e){} qaProg(); };
  if(same){ apply(); if(qa.cur.paused){ const p = qa.cur.play(); if(p && p.catch) p.catch(()=>qaFail()); } return; }
  qa.cur.pause(); qaPlayCurrent();
  if(loc.off > .3){ const el = qa.cur; if(el.readyState >= 1) apply(); else el.addEventListener('loadedmetadata', apply, { once:true }); }
}
const qaFmt = x=>{ x = Math.max(0, Math.round(x)); return Math.floor(x/60) + ':' + String(x%60).padStart(2,'0'); };
function qaProg(){
  if(!qa.on) return;
  const e = document.getElementById('qPlayer'); if(!e) return;
  const T = qaTimes(), ap = T.approx ? '~' : '';
  if(e.querySelector('.qp-bar').matches(':active')) return;
  e.querySelector('#qpFill').style.width = (T.total ? T.done / T.total * 100 : 0).toFixed(2) + '%';
  e.querySelector('#qpT1').textContent = qaFmt(T.done);
  e.querySelector('#qpT2').textContent = '-' + ap + qaFmt(T.total - T.done);
  e.querySelector('#qpT3').textContent = L({rur:'Poori surah', en:'Full surah'}) + ' ' + ap + qaFmt(T.total);
}
function qaEls(){
  if(state.qaRate && !qa.A) qa.rate = state.qaRate;
  if(!qa.A && state.qaVoice && state.qaVoice !== qa.voice) qaSetVoice(state.qaVoice);
  if(!qa.A){
    qa.A = new Audio(); qa.B = new Audio();
    [qa.A, qa.B].forEach(el=>{
      el.preload = 'none';
      el.addEventListener('loadedmetadata', ()=>{ if(el._k && isFinite(el.duration) && el.duration > 0){ qa.store[el._v || qa.voice].dur[el._k] = el.duration; if(el === qa.cur) qaProg(); } });
      el.addEventListener('timeupdate', ()=>{ if(el === qa.cur) qaProg(); });
      el.addEventListener('ended', ()=>{ if(el === qa.cur) qaAdvance(); });
      el.addEventListener('error', ()=>{ if(el === qa.cur && el.src) qaFail(); });
      el.addEventListener('waiting', ()=>{ if(el === qa.cur){ qa.loading = true; qaUI(); } });
      el.addEventListener('playing', ()=>{ if(el === qa.cur){ qa.loading = false; qa.err = false; qa.playing = true; qaUI(); } });
      el.addEventListener('pause', ()=>{ if(el === qa.cur && !el.ended){ qa.playing = false; qaUI(); } });
    });
    qa.cur = qa.A;
    qaApplyRate();
  }
  return qa;
}
function qaPreloadNext(){
  const n = qaNextStep(qa.abs, qa.bism, qa.part); if(!n) return;
  const other = qa.cur === qa.A ? qa.B : qa.A, url = qaFile(n.abs, n.bism, n.part);
  if(other.src !== url){ other._k = qaKey(n.abs, n.bism); other._v = qaVoiceOf(n.part); other.src = url; other.preload = 'auto'; try{ other.load(); }catch(e){} }
}
function qaPlayCurrent(){
  qaEls();
  const url = qaFile(qa.abs, qa.bism);
  if(qa.cur.src !== url){ qa.cur._k = qaKey(qa.abs, qa.bism); qa.cur._v = qaVoiceOf(qa.part); qa.cur.src = url; }
  qaHeadDurations();
  qa.err = false; qa.loading = true; qaUI(); qaMediaMeta();
  const p = qa.cur.play(); if(p && p.catch) p.catch(()=>{ if(!qa.err && qa.cur.paused) qaFail(); });
  qaPreloadNext();
}
function qaFail(){
  qa.err = true; qa.loading = false; qa.playing = false; qaUI();
  showToast(L({rur:'Awaaz nahi chal saki. Internet check karein.', en:'Could not play. Check your internet connection.'}), '!');
}
function qaAdvance(){
  const midAyah = qa.voice === 'both' && qa.part === 'a';   /* Arabic done, the Urdu of this ayah comes next: nothing to repeat yet */
  if(!midAyah && qa.rep && (qa.rep === 1 || qa.repCount < qa.rep - 1)){
    qa.repCount++;
    if(qa.voice === 'both'){ qa.part = 'a'; qa.cur.pause(); qaPlayCurrent(); return; }
    qa.cur.currentTime = 0; const p = qa.cur.play(); if(p && p.catch) p.catch(()=>qaFail()); return;
  }
  if(!midAyah) qa.repCount = 0;
  const n = qaNextStep(qa.abs, qa.bism, qa.part);
  if(!n){ qaStop(); return; }
  qa.abs = n.abs; qa.bism = n.bism; qa.part = n.part; qaFollowPage();
  const other = qa.cur === qa.A ? qa.B : qa.A, url = qaFile(qa.abs, qa.bism);
  if(other.src === url){ qa.cur = other; qa.cur.currentTime = 0; qa.err = false; qaUI(); qaMediaMeta(); const p = qa.cur.play(); if(p && p.catch) p.catch(()=>qaFail()); qaPreloadNext(); }
  else qaPlayCurrent();
}
function qaStep(dir){
  qa.repCount = 0;
  if(typeof trpJump === 'function') setTimeout(trpJump, 0);
  const n = dir > 0 ? qaNextStep(qa.abs, qa.bism, qa.part) : qaPrevStep(qa.abs, qa.bism, qa.part);
  if(!n) return;
  qa.abs = n.abs; qa.bism = n.bism; qa.part = n.part; qa.exact = true; qaFollowPage();
  qa.cur.pause(); qaPlayCurrent();
}
function qaToggle(){
  qaEls();
  if(!qa.playing && typeof trpJump === 'function') trpJump();   /* pressing play brings the Tarjuma panel back to the ayah being recited */
  if(qa.playing){ qa.cur.pause(); }
  else if(qa.cur.src && !qa.err && qa.cur.src === qaFile(qa.abs, qa.bism)){ const p = qa.cur.play(); if(p && p.catch) p.catch(()=>qaFail()); }
  else qaPlayCurrent();
}
function qaStop(){
  if(qa.A){ [qa.A, qa.B].forEach(el=>{ el.pause(); el.removeAttribute('src'); try{ el.load(); }catch(e){} }); }
  qa.on = false; qa.playing = false; qa.loading = false; qa.err = false; qa.repCount = 0; clearTimeout(qa.sleepT); qa.sleepT = 0; qa.sleepMin = 0;
  try{ if(navigator.mediaSession) navigator.mediaSession.playbackState = 'none'; }catch(e){}
  qaUI();
}
/* Start from the current Mushaf page */
function quranListen(page){
  const st = qaPageStart(page);
  qaEls(); qa.on = true; qa.syncPage = page; qa.abs = st.abs; qa.part = 'a'; qa.exact = st.exact;
  const r = qaSurahAyah(st.abs); qa.bism = r.a === 1 && qaHasBism(r.s);
  qa.cur.pause(); qaPlayCurrent();
}
/* Play from a given ayah of the page that is open (used by the Tarjuma sheet and by tapping a line) */
function qaPlayFrom(abs){
  if(typeof trpJump === 'function') setTimeout(trpJump, 0);
  qaEls(); qa.on = true; qa.repCount = 0; qa.syncPage = state.quranPage || qa.syncPage; qa.part = 'a'; qa.abs = abs; qa.exact = true;
  const r = qaSurahAyah(abs); qa.bism = r.a === 1 && qaHasBism(r.s);
  qa.cur.pause(); qaPlayCurrent();
}
/* The reader moved to another page while the player is open: follow it. A playing recitation restarts at the new page,
   a paused one just moves its position (and stays paused). Re-renders of the same page change nothing. */
function qaSyncToPage(page){
  if(!qa.on || qa.syncPage === page) return;
  const st = qaPageStart(page), was = qa.playing || qa.loading;
  qa.syncPage = page; qa.abs = st.abs; qa.part = 'a'; qa.exact = st.exact;
  const r = qaSurahAyah(st.abs); qa.bism = r.a === 1 && qaHasBism(r.s);
  qaEls(); qa.cur.pause();
  if(was) qaPlayCurrent(); else { qa.playing = false; qa.loading = false; qa.err = false; qaUI(); }
}
function qaMediaMeta(){
  try{
    if(!('mediaSession' in navigator)) return;
    const r = qaSurahAyah(qa.abs), nm = (QURAN_SURAHS[r.s-1] || {}).name || '';
    navigator.mediaSession.metadata = new MediaMetadata({ title: qa.bism ? `${nm} · Bismillah` : `${nm} · Ayah ${r.a}`, artist: qaVoiceName(), album:"Qur'an · Waqt24", artwork:[{ src:'icons/icon-192.png', sizes:'192x192', type:'image/png' }] });
    const ms = navigator.mediaSession;
    ms.setActionHandler('play', ()=>qaToggle()); ms.setActionHandler('pause', ()=>qaToggle());
    ms.setActionHandler('previoustrack', ()=>qaStep(-1)); ms.setActionHandler('nexttrack', ()=>qaStep(1));
    ms.playbackState = qa.playing ? 'playing' : 'paused';
  }catch(e){}
}

/* ---- Mini player bar ---- */
const QA_ICON = {
  play:'<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/></svg>',
  pause:'<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4.2" height="14" rx="1.2"/><rect x="13.8" y="5" width="4.2" height="14" rx="1.2"/></svg>',
  prev:'<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M6 6h2v12H6zM20 6.5v11a.8.8 0 0 1-1.25.66L10.5 12.7a.8.8 0 0 1 0-1.32l8.25-5.54A.8.8 0 0 1 20 6.5z"/></svg>',
  next:'<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M16 6h2v12h-2zM4 6.5v11a.8.8 0 0 0 1.25.66l8.25-5.46a.8.8 0 0 0 0-1.32L5.25 5.84A.8.8 0 0 0 4 6.5z"/></svg>',
  close:'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>'
};
function qaBar(){
  let el = document.getElementById('qPlayer');
  if(el) return el;
  el = document.createElement('div'); el.id = 'qPlayer'; el.className = 'qp'; el.setAttribute('role','region'); el.setAttribute('aria-label', 'Qur\'an recitation');
  el.innerHTML = `<div class="qp-row"><div class="qp-info"><b id="qpTitle"></b><span id="qpSub"></span></div>
    <button type="button" id="qpPrev" aria-label="Previous ayah">${QA_ICON.prev}</button>
    <button type="button" id="qpPlay" class="qp-main" aria-label="Play or pause"></button>
    <button type="button" id="qpNext" aria-label="Next ayah">${QA_ICON.next}</button>
    <button type="button" id="qpClose" aria-label="Close player">${QA_ICON.close}</button></div>
    <div class="qp-time"><span id="qpT1">0:00</span><div class="qp-bar" role="progressbar" aria-label="Surah progress"><i id="qpFill"></i></div><span id="qpT2">-0:00</span></div>
    <div class="qp-tot" id="qpT3"></div>
    <div class="qp-opts qp-voice"><button type="button" id="qpVoiceAr" data-v="ar"></button><button type="button" id="qpVoiceUr" data-v="ur"></button><button type="button" id="qpVoiceBoth" data-v="both"></button></div>
    <div class="qp-opts"><button type="button" id="qpRate"></button><button type="button" id="qpRep"></button><button type="button" id="qpSleep"></button></div>
    <div class="qp-opts qp-sleep" id="qpSleepRow" hidden><button type="button" data-m="0">${'Off'}</button><button type="button" data-m="15">15</button><button type="button" data-m="30">30</button><button type="button" data-m="60">60</button><input type="number" id="qpSleepIn" min="1" max="720" inputmode="numeric" placeholder="min" aria-label="Custom minutes"><button type="button" id="qpSleepSet">Set</button></div>`;
  (document.getElementById('detailOverlay').parentElement || document.body).appendChild(el);
  el.querySelector('#qpPrev').onclick = ()=>qaStep(-1);
  el.querySelector('#qpNext').onclick = ()=>qaStep(1);
  el.querySelector('#qpPlay').onclick = qaToggle;
  el.querySelector('#qpClose').onclick = qaStop;
  el.querySelector('#qpSleepRow').onclick = e=>{ const b = e.target.closest('button[data-m]'); if(b) qaSetSleep(b.dataset.m); };
  el.querySelector('#qpSleepSet').onclick = ()=>{ const v = +el.querySelector('#qpSleepIn').value; if(v > 0) qaSetSleep(v); };
  el.querySelector('#qpSleepIn').onkeydown = e=>{ if(e.key === 'Enter'){ const v = +e.target.value; if(v > 0) qaSetSleep(v); } };
  el.querySelector('.qp-voice').onclick = e=>{ const b = e.target.closest('button[data-v]'); if(b) qaSetVoice(b.dataset.v); };
  el.querySelector('#qpRate').onclick = ()=>qaCycle('rate'); el.querySelector('#qpRep').onclick = ()=>qaCycle('rep'); el.querySelector('#qpSleep').onclick = ()=>qaCycle('sleep');
  /* tap or drag on the bar to jump: the recitation continues from that point */
  const bar = el.querySelector('.qp-bar'); let drag = false;
  const frac = ev=>{ const r = bar.getBoundingClientRect(); return Math.max(0, Math.min(1, (ev.clientX - r.left) / r.width)); };
  bar.addEventListener('pointerdown', ev=>{ drag = true; try{ bar.setPointerCapture(ev.pointerId); }catch(e){} el.querySelector('#qpFill').style.width = (frac(ev)*100) + '%'; });
  bar.addEventListener('pointermove', ev=>{ if(drag) el.querySelector('#qpFill').style.width = (frac(ev)*100) + '%'; });
  bar.addEventListener('pointerup', ev=>{ if(!drag) return; drag = false; qaSeek(frac(ev)); });
  bar.addEventListener('pointercancel', ()=>{ drag = false; qaProg(); });
  bar.tabIndex = 0;
  bar.addEventListener('keydown', ev=>{ if(ev.key === 'ArrowRight') qaStep(1); else if(ev.key === 'ArrowLeft') qaStep(-1); });
  return el;
}
function qaPlace(){
  const el = document.getElementById('qPlayer'); if(!el) return;
  const ov = document.getElementById('detailOverlay'), tb = document.getElementById('tabbar');
  const overlayOn = ov && ov.classList.contains('active');
  el.style.bottom = overlayOn ? '0px' : ((tb ? tb.offsetHeight : 0) + 'px');
}
function qaUI(){
  document.body.classList.toggle('qp-on', qa.on);
  const lb = document.getElementById('quranListenBtn'); if(lb) lb.classList.toggle('on', qa.on);
  if(!qa.on){ const e = document.getElementById('qPlayer'); if(e) e.classList.remove('show'); qaHL(); if(typeof trpPlace === 'function') trpPlace(); if(typeof tbSync === 'function') tbSync(); return; }
  const el = qaBar(), r = qaSurahAyah(qa.abs), nm = (QURAN_SURAHS[r.s-1] || {}).name || '';
  el.querySelector('#qpTitle').textContent = qa.bism ? `${nm} · Bismillah` : `${nm} · ${L({rur:'Ayat', en:'Ayah'})} ${qa.exact ? '' : '≈ '}${r.s}:${r.a}`;
  const cnt = `${L({rur:'Ayat', en:'Ayah'})} ${r.a} / ${QA_COUNTS[r.s-1]}`;
  el.querySelector('#qpSub').textContent = qa.err ? L({rur:'Internet chahiye · dobara dabayein', en:'Needs internet · tap play to retry'})
    : qa.loading ? L({rur:'Load ho raha hai…', en:'Loading…'})
    : (qa.exact ? cnt + ' · ' + qaVoiceName() : L({rur:qaVoiceName() + ' · shuruaat andaaze se, ⏮ ⏭ se theek karein', en:qaVoiceName() + ' · start is approximate, adjust with ⏮ ⏭'}));
  el.querySelector('#qpPlay').innerHTML = qa.playing ? QA_ICON.pause : QA_ICON.play;
  el.classList.toggle('show', true);
  qaPlace(); qaProg(); qaOptsUI(); qaHL(); if(typeof trpSync === 'function'){ trpSync(); trpPlace(); } if(typeof quranTintPlayer === 'function') quranTintPlayer(); if(typeof tbSync === 'function') tbSync();
  qaMediaMeta();
}
(function(){
  const ov = document.getElementById('detailOverlay');
  if(ov) new MutationObserver(qaPlace).observe(ov, { attributes:true, attributeFilter:['class'] });
  window.addEventListener('resize', qaPlace);
})();
/* Exact layout of the 15-line Indo-Pak Mushaf used here (derived from QUL layout data). Generated; do not edit.
   QA_PAGE_FIRST[appPage-1] = first ayah (1..6236) starting on that page.
   QA_LINES = 2 hex digits per ayah: first line, last line (1..15) on its page. */
const QA_PAGE_FIRST = [1,1,8,12,23,31,37,45,56,65,69,77,84,91,96,101,109,113,120,127,134,142,149,154,164,172,180,185,192,195,201,205,211,219,223,227,232,237,240,243,250,255,260,264,267,272,277,282,289,290,294,302,309,316,323,331,339,347,356,364,371,377,385,394,402,409,415,426,434,441,447,451,459,467,474,480,487,494,499,504,506,512,517,522,528,535,540,548,554,562,569,574,581,585,589,595,599,607,615,621,628,634,641,648,656,664,669,672,675,679,683,687,693,701,706,711,715,720,726,733,738,745,752,759,765,773,778,783,790,798,808,816,824,833,841,848,857,863,871,880,884,891,900,908,914,920,927,932,936,941,947,955,966,977,985,992,998,1006,1012,1022,1028,1036,1042,1050,1059,1076,1085,1092,1098,1104,1110,1114,1118,1125,1133,1142,1150,1161,1169,1177,1186,1194,1201,1206,1213,1222,1230,1236,1242,1249,1256,1262,1267,1272,1277,1283,1290,1297,1304,1308,1315,1322,1329,1335,1342,1347,1353,1358,1365,1371,1379,1385,1390,1398,1406,1417,1426,1435,1443,1453,1462,1471,1479,1486,1493,1502,1511,1519,1527,1536,1546,1555,1562,1571,1582,1591,1601,1611,1619,1627,1634,1640,1649,1660,1666,1675,1683,1692,1699,1708,1713,1721,1725,1734,1741,1749,1756,1761,1771,1777,1786,1794,1804,1821,1836,1855,1875,1893,1908,1916,1928,1936,1944,1956,1966,1974,1981,1989,1995,2004,2013,2020,2030,2037,2047,2059,2070,2081,2090,2099,2110,2122,2130,2141,2152,2159,2163,2170,2179,2188,2195,2203,2215,2224,2237,2250,2262,2276,2289,2302,2314,2326,2346,2361,2387,2400,2414,2425,2435,2446,2462,2475,2484,2495,2508,2519,2529,2541,2556,2565,2574,2586,2597,2602,2611,2619,2626,2633,2642,2651,2660,2668,2674,2691,2701,2716,2732,2748,2763,2778,2792,2799,2810,2818,2823,2828,2835,2845,2850,2853,2858,2867,2876,2888,2900,2913,2924,2937,2956,2976,2997,3023,3050,3075,3099,3122,3148,3165,3176,3186,3199,3206,3219,3226,3239,3248,3258,3266,3273,3281,3288,3296,3303,3312,3323,3330,3337,3346,3354,3362,3369,3377,3385,3393,3404,3415,3425,3434,3442,3451,3459,3468,3480,3488,3497,3504,3514,3524,3534,3540,3549,3556,3564,3569,3577,3584,3588,3596,3607,3614,3621,3629,3639,3647,3655,3664,3672,3679,3690,3698,3704,3715,3727,3743,3758,3776,3792,3818,3845,3871,3896,3922,3949,3974,3989,3998,4014,4033,4053,4064,4069,4080,4090,4099,4106,4115,4126,4133,4141,4150,4159,4166,4174,4183,4192,4200,4211,4219,4230,4239,4247,4257,4265,4273,4283,4288,4295,4304,4316,4324,4337,4349,4361,4375,4389,4405,4419,4441,4463,4480,4491,4500,4511,4519,4526,4533,4540,4547,4557,4564,4575,4584,4593,4599,4607,4612,4617,4624,4631,4646,4665,4682,4706,4726,4750,4767,4785,4810,4824,4850,4871,4891,4915,4940,4968,4996,5031,5056,5079,5086,5093,5100,5105,5111,5116,5125,5130,5136,5143,5151,5155,5161,5168,5177,5184,5192,5200,5208,5218,5223,5230,5236,5242,5252,5264,5278,5303,5320,5336,5358,5380,5407,5422,5438,5449,5462,5475,5491,5496,5526,5545,5566,5592,5606,5622,5648,5673,5700,5721,5751,5779,5808,5835,5859,5882,5906,5923,5949,5975,6003,6024,6049,6077,6099,6124,6137,6155,6177,6194,6210,6226];
const QA_LINES = '223334445566683334466811233445677889aaacdeff1224445779abbddf12266aaccdef133556699aacceef1223455778899aabbccdef13344666778bbccddf1335588f13355778899bceef122456677bbddf112336688aabcf12299aaeef14477aaccf123447799abccddf199bbccf12244669acceef1447899aabceef133556688aacdf12244668899bbeef122668899aaeef13377bbeef111335588aabbccddeff12244667799aabbf144557899aacceef133667899f145567799abccf15678f1337789dddef13355cdf1446699bbccf12344667799bbddf13399ddf133aaccf13488bceef1224455aaf144bbf178abf1347789aadeeff1334466bbf1349abbeef16688ddf14489f14577aabbf14488bcdef1235599ddf1567799aacceef1f14477aaf3333345677899eef122345577aaddf122335588bceef123446688abddf1334566778899ccf122456688aabbddf111344499bbcceef11155668899aabbeef111557799bbddeef122447788ccddf1447799ddeef144557899aabbddf12255667788bbcceef122447899bbddeef1225566abcceef1235588cceef1223355678899bbcdeefff122447799abbbcdf111335588bbddf122444577ccf188aaeef111456789aabbdef112557788abccdef12234567789ccf133448899ccf133667788bbddf122778889bbeef36688ccdef16699bbdef178f1335588aaccf144678899f155ccddfff133446688abf1337799bbddeef12288aabbf144667788bbccddf122446799ccf122446699bbeefff13344557799bcf13388cceef1335588aacceef13366bbf16688bcf122567899cdf189bbeef11133568899aaccf134668899abdeeff133557799bbf1447788bbcceef14588aaaaccf1557799bbcceef12233667799ddf13344778899bbccf144567799aabcddf16688ccddf158aaf177abf188bbeef12255bbf14488aaf1447799bbddf122445688aabccdf15599bbddf122445577f14466bbf14455bbeef1336688cdeef1335577aacceef16677aaccf1335577aaccddf122446678aaccf13345667799aaf122456688bbf133667788aaccddf13355aaddf1229abbdef1334588bbcceff34466778899cdeef12233457788bbccddfff144667799aabbeef1224455779abbddf133456688aabcddeef1234466889abbdef1446699aacceef133567789aabbeefff1334489ccddf12244557799aaddf12234667788aabcdef15578ccf122445677cceef1223355667799bbeef1336677aabcddeff1445588aaccf1445566aabcf12233556688ccf1447799def13488ccf1226677bbf1456799aabcf144667799aabbddf3334466778899aabbcceef122334444557788aaccddf12233446699bcdef122557788aabcf1456699aaccf133457788aabbddf122669aaaccf123556677889abbddeef1114567aaccf1447788aabbcdeef122334599ddf133778899aaccddf13344556799bbcdeff1223344556667778899aabbccddeeeffff1113344556699bbeef133446699aaccf133445578bbf1225599bbdef15566889abbf144bbeef16699ccf133556688aaeef12355778899ddeef1345566778899bbccf13367888999bbddf112334455668899bbcceef355778899bbccfff122447799bbccddf13344668899aabbeef133456688aacceef1335588aacceef15599cceef1224588abccdef122455677889aabeef122445588bbddeef1334499bbddf2234478aaddf133667789aaddf122346688bbdef1223356aaddf1225599ccf1224488bbf1447799eef1446688aacdf123457788bbddf13344557799ccf122446688aaddf15599cdf122778899bbcdf1336677aaccdef122445688bbddf1447788aaccf1446788aacceef1446699abf1336688aaccf14455abddf133557799cceef3335688bceef12233557799cceef1446688bbddf1237799eef122557899aaddeef122556799aacdeef1223344668899aaccddeef1123455557788aaccf11222445588aaddeef1445578aabccdeef111224445778899aaccf122556677aacdeefff13344667799aaddeef133556999aaddddf1236689aabbddf123446677bbeef1334455778899aaddf13344778899bbcdeef12244667799cceef133457799aacceef1223344678899bbdef13345668899aabbddeef12233446677aabbccf12233668899bcf133446688aaccdeeef1223344668899aabbccdef13355667799bbbceef122335566778bbbcceef12255668899bbccddeef12333557799abeef13355789abbccddf144668899aaddf1334588aacdf1123355778899bceef1224455677789aabbcceef1225588bbeef1223344666688bbeef122668899bbddeef133567799aabcddfff123344566bbeef1112234446677bbddf3447799cdf13355667789ccddf13355aaf13355567799bbcceef122334477bbccf122447799bbcceef12347889abbddf1445577bbf13355778899aabbeefff14499bbcdeef13344456688bbcceef1336688aabbcceef1335566778899aabbcff1122333445566778899aaabbbccddeefff12233445566778899aabbccdddeeef11122233334555666788899aaaabccdddeeeff1112233444555666777788899bbccccdddeeefff1112233334445556677788899bbbbcceefff11122223334445566699abbccddeff12244556799bbccf12223334455667799aabbddf133556689aacceef1447788aaccddfff1223455667789aabbccddeef1113334456678aacceef12244557799bbddf12233669abbdef144778899aacceef1225578aadef1334466889abbcceef133445588aabbcceef14455779acdddf1334455667799ccddeff355778899bbddf12244556688aaaacdeef1223344566699aabbccddeef1223344668899aacccceef1112333556788aabbccddf1123344667799bbddf12244557788aaccddf1234455778899aabbddeef112334455778899bbccddeef133446677aacceef1224455667788aabbbbdef34456667788aabbbcddeff11233557799cdf15577bbf11133446688ccf122557789aabbddfff1224455778899cceef1236699bbddeef1335588abccddeef133445566778899aacccdeef11233557799aabbeff1112244557777889999aacceef11133445566788899bbccddeef125555566778999abccddeef1112233445566778899bbccddeff1233455666788899aabccddeef1223344556677889aabccdeeff111223345556699abccddeff12244455677888899aaccddf122334455556677888999aabbbbbccddddeeefff12233477777888999aabbcccceeeef11122334445666677789999aaaaabbbbbccccccddddddeeeefff1336777888899aaabddeeeefff11133445566778899aabbccdeeff1222233455588aaccddeef123444466889aaabbccf122445567778899aabbddf112333444556677888889aabbccddeef122334456667788aaaacceeeff12244557799abcceef33455667899aabbccddeef11123334455668899aabbccddf1223344567799abbcddeef1233444667899abcceef1224456778899aabbccddeff11223344555677789aabbcccdddeef13355567799abcdeef12233566777aabbcdf1223344566678aabbccddeef122445566678899aabbcff1335566eef12233556699aabbddf1124488aabbbbddf122557788bbcdf1334455789addf122337799aaaabcddf1223444556699bbeef12234667799abcceef13345667788aaccf144557788aaf333444455566777889999aaabbbdeeeeff1223345666788abbbccf122333444558899aaaabbccddeefff11133455667778899aabbccddddeefff11122334456667788899aaabbddeeeff12233445566778899aabbccddddfff1113444556667778899aabbcdddfff1112233445677888999aabbcdeff3447789bbcceff1223344668899bbcdeefff12334779abbccddf122446678f1238899eef123446799bbccf1124455778899abccdef1337789aaf13366f15588addef1335566789abbcdeef1123344556688abcdf133445566778899aabbccdef112334455778888aabbddeef12233445577888899bbcceeeef1224455678899aabbccddf11133445566889999adddddeef12233444555666677888899aaabbcccddeefff11222333445566677778899aaabbbbcccddeefff1222333334466777888999aaaaabbbbccccddeefff11112223333444555566677778889999aaabbbcccdddeeeeffff1111222333344445555666677788889999aaabbbbcccddddeeefff11222333444445556667778889999aaaaaabbccccddeeeefff1111122333334444555666677889999aabbbbcccdddeeeef1112222333334445556667777788999aabbbbccddeeeef1112222333344445566667788889999aaaabbbcccccddddeefff111222233334444555566668bbbccddeef1113344557788aabbcceef12244678899aabbddfff11123334455667799aabbddeef155668899cceef12233555667888899bbccddeef1446688aacdeef122334556667899aabbcdddeff1223456778899bbddf1223355667aaaaabbeef122456689abcceef122667788aaddf122336677aabbeef1335688bbccdef123457899abccddf122446689bbddf1112244567799bcddf12244557799aabbccddeef1235566789acdf133557799ccdef13345668bbbccddeef122346677abbceef133445599abcceef1224467aabbeef134446688bbccddf122446699ccddeef133568899aaccddf122334556668899aaccddf122445567889cccccddeff122335599bbccccdeeef122334466779abbddf122335599abddeef1233344667799bbeef12244556699bbeef12233456689aaccddf1112555555677789abbccddf122445577aacceef122557788aabbccddf1124455779acdf333345588aaabcccceef12234557789aabbccddf12234557788aaccddeff344556699ccf12344668889aaddeef122445599ccddf123446688aaccdef1235588aaf13388aabbdddeeef1122333445688f14477eff144557799bbddeef12233445566778999bbddf3446699abcceef122556688abddf133555678aabbddf133445566778899aaeef145667788bbcceef122448899bbddfff111334455667accdef12233456688aaddf1447799aabbccf11112224444567788bbddf12234668899abcdf1224488aaccf1447aaaaaaabbbbccddeef1123355667799aaaaccddeff11233334455556777889aaabbccddeff1112244455566667889bbbbccddeef1122233444555567777889999bbccddeefff112223344445566778899bbbccffffff1112222334444556666777788899999aaaabbcccdddddeeeefff111222333444555666677778888899999aaaabbbbcccdddeeeefff11122223334445555667777888999aaaabbbbccddddeeeefffff11111223333344444555566667777888999aaaaddddeeeffff1111122223344556666777788889999aaaabbccccddddeeeefff111112222333344445556667777888999aaabbbbcccccddddeffff111112222333344445555666677778888999aaaabbbbeeeeff12223445566778899aabbbccdddeff11122235566aabbeef12233445566778899aaaabbccccdeeef12233444455667788889999aaaabbbbccdeeff1112233444455566677889999bbcccdddeeeefff11112233444477788bbddf14477aaddf111223333557788aabbcdf123667789aabbcceefff1223344668899ddeef133667799bbddf12244557799bbcceef1123344667788aabbcdddf13345569abbddf12555557788bbccf133446688aabbcceef122444466aabcccddf1334499ccddfff122557788bbccddf11233567788aacceef1234456777799ccdef12244667889bbddf1445566778899aabbddeef144557778aaccdef333334455678899aacceef133446689bbcdddeef133556688bbcceef12355667788aabbcceef13355667799cceef134556699bbcdeef3333344557788aacceef1334489bcf133447788aaccf133567788aabbddeef111333445668899aaccddfff122557788bbcdeef133477777888899aabbccddeef122444455667788aabbccddf12233444555667788bbddeef1122344556677788999bbccddeef1113344556677778899abbbdddef11233445566677799aabbbcccddeefff122233445667799aaabbeeeeefff1112233444455556677778899aaabbbcccdddeeeffff1111222334455556667778899aabbcccdddddeeeefff1111222223344445566777aaaaabbcceef111223355667899aabcddf12234446788abcceef1223344667799aaccdeeff333345588aabbcdf122556788aabbf123567789cceef1224466aabbddf123446688aacff122459999aabbbbcceef1335566aaddeef1225566788899bbccddeef122335677889abbccf333555578aaddeeeef1337799aaccf1446799aaccddeef12377bbeef169aacdeef122346777abccf1446699bbcceef3334455666788999abbbbccdddeeff1223334445566777888899aaabbccdddeeefff1112344556677888999aabeeeeeeffffff111112222233333445566667777888899aabbccccddeefff1112222333444556677888899aabbcccdddeefff11233334444556666788bbbbbbbbcccccccddddddeeeefff1112333445556888999aabbbcccddeefff11122333344556677778899aabbbcccdefff333334444555555666677778888899999aaaabbbbccccfffff1223355667799cccdddddeeeefff11112222233334444555566667777888899999aaaabbbbeeefff111223344556666778888999aaabbbbccddddeeeff11122334445556677778899aabbbcccddddeefff1112222334445556666777aaaaaaaabbbbccccdddeeeffff1112222333344444555566677778888999aaaaaccddeeeefff11122333344455556666677777888899aaabbbbccccddddeeeeeffff11112222233334444555566699999aaaaabbbbbccdddddeeeeefffff11122223333334444555566666667777778888889999999aaaabbbbbbccccdeeeeefff11112222333344445556677788899999aaabbccccddeeeefff111112222333344445556666777888899999aaaadddeff144556688aabcf1224488aabceef1224489bbddeef14466bbddf3457799cceef14488aaccf1335677889abbddeff111699aeef12233569accf1336788aacceef12244557799bbddf37799aaf1223455779af133789ccdddeef133667789aabbddeff14788aaabbceef1123355779cddeff133556689bbcceef344567789aacceef13455668889bbccdefff377aabceef144667888aaddf3445588bbddf1226688bbddf3445577889aabbbddeff11122334466778899bbddeef122334455668899adddeeeefffff1222233334444555566667788899999aaabbbccccdddeeefff1122333444455557777889abbccddeeeef12222444777777888999abcccddeefff111223334555677778888899abbbbcccccdddddeefff111122223333344555566677788889999aaadddeeeef1111122223333445555666667777788889999aaaabbbbccddddeff11122333344455566778899aabefff11133445577778899aabbccccddeefff11122333455667789aacff11223334466778899bbccddeef11123445566777799abccddeef1255555666677888999aabbcccdddeef112333445f33333344444555556667777888889999aaaaabbbbbbccccdddeeeeefffff17777888889999aaaabbbbbccccddddeeeefff111112333344458888999aabbbbcccccdddddeefff11122223333444455556666777788889999aaaabbbbccddddeef344556667778899aabbccddeefff1122233335556778899aaaabbccdeeef12555556666667777788888999999aaabbbbbccccdddeeeeefff1112223334445555566667778889999aaabbbccccddeeeefff33333444444555566666777788899999aaabbbcccdddddeeeeffff1111222333333444455668899adddddeeeeeefffff1111222233333444555666677777788889999aaabbbcccccddddeeefffff11122233344444558888899999aaaaabbbbbbcccccddddddeeeeffff11111222233334444445555556666777788889999aaadddddeeeefffff1111122222333334444455555666777788899999aaabeeeeefffff1112222333344444555556667778bbbbcccddddeeeefffff11122334445556666777778888999aabbbbccddddeefff11122255555666677888999aaaabbbbccccdddddeeeeefff11112223666667777888899aabbddeffff111112222223334444777788889999aaabbbbccccdddddeeeeef333334444455566666677777888889999aaaaadddddeeeeeefff11111222223333344445555666777788889999cccccccddddeeeefff1111222333345666677888899aabbccccdddeeefff333334444555566666677777788888999aaaabbbeeeeefffff111112222333333445558888899999aaaaabbbbccccddddeeeeeffff1112225555556667777888889999ccccdddddeeeefff33333334445566669999aaaaabbbbbbccccccddddeeeefffff111144445556669aaabbbcceef1123666677777889999addddddeeeeefffff1111225555556667777888899999cccccddddeeeefff3333347777888889999aaaaadddeeeffff3333344477778888899999ccccccffff11112222555666999aaaabbbeeeeefff3333344455888888999aaa';
const QA_GEOM = { normal:{ t:[0,0,96,88,92,92,86,88,92,96,88,104,94,82,96,102,60,108,108,78,72,76,84,80,74,76,80,110,112,118,104,94,100,92,94,92,94,96,90,88,88,88,96,108,108,106,110,100,100,88,106,80,80,82,82,78,82,80,78,104,106,98,100,86,84,80,92,88,90,94,88,84,96,94,96,98,96,96,104,96,96,84,90,90,90,88,84,76,88,88,92,90,100,88,100,82,94,86,90,90,88,88,92,86,82,84,90,84,86,84,84,78,84,82,76,98,92,84,96,80,78,96,94,80,78,98,86,82,84,88,90,84,90,90,92,86,92,80,86,88,92,80,84,76,82,76,82,96,102,96,92,86,96,98,100,72,76,84,86,88,88,96,86,78,80,78,80,78,78,80,78,96,96,94,98,88,80,84,82,90,92,88,92,92,86,94,88,88,90,94,96,88,88,86,84,84,88,84,84,80,84,82,96,80,92,94,94,76,86,84,94,86,94,90,88,86,100,94,92,94,96,92,92,84,86,86,100,84,98,92,88,84,92,90,82,98,86,86,94,86,96,88,92,92,92,86,88,86,78,88,94,90,90,98,96,96,90,92,100,96,108,102,100,90,94,98,98,100,90,98,108,88,84,86,92,88,94,84,90,82,88,78,94,92,84,98,104,88,94,88,90,94,78,86,84,86,82,86,96,90,82,84,92,78,68,76,82,100,106,102,102,94,102,102,98,86,84,76,82,78,88,78,80,102,92,90,102,94,88,84,100,82,92,86,84,86,90,86,86,92,90,78,94,90,86,88,98,90,86,78,90,96,92,90,94,98,106,92,96,84,94,106,102,82,82,98,104,86,78,78,80,98,102,92,94,94,94,100,104,78,80,88,82,82,86,86,80,92,92,88,94,92,90,88,98,90,94,92,92,94,86,90,94,88,92,92,82,86,86,92,82,96,90,94,90,92,92,80,96,94,98,96,92,86,92,98,94,78,92,92,96,90,94,94,92,86,86,90,88,88,82,88,94,90,96,98,90,96,90,90,92,102,102,96,92,86,100,98,102,86,84,94,96,90,90,90,84,92,86,84,88,84,76,88,86,92,82,96,90,88,84,80,82,90,104,98,92,88,98,96,88,92,86,82,96,92,90,98,92,92,90,76,94,82,76,92,92,98,96,94,92,90,88,92,92,92,88,76,94,94,90,94,96,88,94,78,86,94,96,96,98,104,110,108,102,94,100,106,104,96,92,86,98,88,94,88,92,86,74,82,90,84,78,92,86,88,98,90,100,72,84,74,90,96,98,96,92,92,98,98,98,94,88,88,88,84,86,84,84,94,88,82,94,82,84,82,100,80,92,98,86,90,96,86,84,106,84,94,100,90,86,100,102,78,100,102,90,108,104,0], b:[0,0,907,909,915,913,917,907,909,911,903,915,909,899,913,917,885,925,921,895,893,893,901,899,893,893,899,929,927,935,919,909,911,909,901,911,905,903,907,909,905,909,915,921,921,923,921,921,917,921,923,899,903,905,897,901,899,901,901,925,921,919,917,903,899,903,903,905,911,911,907,909,913,915,911,919,913,911,919,911,909,905,909,901,909,903,905,899,901,911,911,917,919,911,917,905,913,907,909,911,905,905,913,911,905,907,907,909,903,911,905,899,903,895,901,915,913,909,913,901,899,913,917,905,901,911,909,903,907,901,909,905,911,911,911,909,911,911,909,911,909,905,905,899,897,899,897,917,921,915,911,911,911,915,917,897,895,905,905,913,909,909,911,905,901,901,903,895,899,903,901,919,913,919,917,909,909,907,907,913,909,913,911,905,903,917,919,905,911,911,913,907,911,911,905,907,905,905,907,901,899,907,909,907,909,913,913,909,903,901,909,907,913,915,905,905,917,919,915,919,911,905,913,911,903,905,915,907,915,911,909,905,909,915,905,917,905,911,911,911,913,905,907,909,911,909,909,905,903,911,907,911,909,915,909,919,909,915,917,913,921,921,915,911,915,921,915,919,909,915,923,911,905,905,911,905,907,905,907,901,905,909,909,915,905,913,915,911,911,911,909,911,909,909,907,905,905,911,911,907,907,915,915,903,895,897,901,923,927,925,923,915,921,921,919,907,895,901,899,899,911,911,903,923,909,919,931,921,907,911,923,903,913,913,901,905,907,905,905,913,911,913,913,911,903,913,911,913,907,913,905,915,911,911,909,919,919,917,915,909,909,923,921,909,907,915,921,903,901,901,901,917,917,915,915,913,911,925,917,903,901,909,909,903,907,909,903,917,909,911,915,909,907,911,907,903,911,913,907,915,911,909,915,909,911,913,907,905,907,917,905,917,911,913,915,919,911,913,913,911,919,913,913,911,913,921,917,915,905,913,915,915,909,911,913,909,911,911,911,903,903,913,911,915,921,917,913,915,913,911,911,921,923,919,915,909,913,923,919,903,901,917,917,911,911,909,911,909,903,907,905,903,899,909,911,909,913,917,913,913,903,905,913,911,919,919,909,907,915,919,905,915,905,903,913,915,913,915,915,915,911,915,907,905,901,911,913,921,923,915,915,913,913,917,915,915,911,911,913,915,909,911,917,909,911,911,907,921,915,913,917,923,929,923,921,917,923,929,923,917,911,919,921,917,909,917,915,913,907,907,909,911,905,911,911,923,917,925,919,907,901,907,907,915,917,913,917,915,915,923,915,915,913,905,911,909,911,911,903,917,909,911,913,911,905,911,921,907,911,919,911,905,911,909,901,921,921,915,917,913,903,921,929,911,913,921,915,933,925,0] }, tajweed:{ t:[0,0,90,92,84,98,90,104,96,100,92,90,92,94,84,96,92,102,96,102,92,102,98,98,92,94,94,96,88,96,86,92,86,96,94,86,90,94,88,92,92,92,88,94,86,92,88,88,84,94,88,92,88,94,92,92,88,92,88,94,92,92,88,94,86,94,88,88,82,92,78,82,86,88,82,98,92,90,94,100,86,98,98,80,84,90,74,88,84,84,84,92,92,88,88,86,90,98,96,86,78,88,82,96,94,90,94,94,92,90,88,82,82,92,100,86,84,94,90,88,92,92,88,90,82,88,84,92,76,96,84,90,84,94,88,90,82,94,84,92,88,92,84,90,92,94,90,94,86,86,84,88,86,86,82,94,90,92,88,90,82,98,90,86,78,86,84,92,90,98,90,88,78,88,88,94,90,88,82,98,98,84,74,88,86,90,82,90,84,90,86,90,86,94,94,90,90,92,84,90,82,88,84,106,102,110,102,110,108,114,110,94,92,90,84,86,84,84,82,96,88,98,94,98,94,98,94,86,80,84,76,92,86,92,84,96,90,96,94,94,94,96,96,86,78,82,84,86,84,92,86,96,88,96,88,94,94,96,92,90,88,86,82,88,80,88,74,94,88,88,82,90,84,100,94,86,80,90,86,92,92,96,94,92,94,90,98,94,98,92,96,100,98,96,92,90,96,84,92,86,90,88,84,86,80,98,96,84,86,92,90,86,98,94,90,92,90,90,92,92,92,92,94,84,86,84,88,88,94,82,92,92,90,90,88,88,86,96,98,82,80,92,88,96,90,90,98,94,90,90,90,86,80,92,88,88,88,90,82,100,94,98,94,94,86,90,84,84,72,94,84,92,90,94,92,94,94,94,92,100,94,100,94,96,88,104,100,96,90,102,92,86,84,88,84,88,90,94,88,96,88,100,90,90,86,88,84,92,82,90,84,88,84,94,88,92,90,92,86,98,92,86,86,88,90,92,84,92,86,88,80,86,82,88,92,88,90,94,90,88,86,92,88,90,86,92,88,88,84,88,84,90,86,92,86,86,88,92,88,86,80,88,80,84,80,92,88,96,90,98,92,96,82,92,88,104,98,106,92,98,100,98,102,88,90,88,84,92,86,90,88,94,94,94,92,86,88,90,88,86,82,88,88,90,84,90,88,86,84,88,84,86,82,88,76,92,84,88,80,92,92,96,86,86,80,86,84,80,76,80,80,92,86,88,86,86,84,84,80,92,84,92,82,84,78,94,88,84,80,86,78,90,82,88,86,96,88,90,88,90,84,94,88,82,78,86,74,90,78,84,80,84,88,90,86,90,80,96,86,82,78,88,80,88,84,94,86,82,74,80,80,86,78,84,74,90,86,86,82,90,82,84,80,96,84,90,84,98,64,0], b:[0,0,907,917,911,917,913,927,919,923,917,915,913,917,909,917,915,925,915,921,915,921,919,919,913,921,913,915,907,913,903,913,909,921,913,911,907,911,911,917,911,917,911,911,911,911,909,909,907,915,909,919,913,915,911,913,903,913,907,913,907,917,911,913,905,917,911,907,905,915,903,903,911,911,901,921,911,913,911,923,907,923,921,905,899,909,897,913,907,911,907,913,913,913,909,911,911,923,917,907,903,909,907,913,913,917,911,919,907,911,911,907,903,907,919,911,907,915,911,915,911,917,909,917,909,911,909,911,901,913,909,915,909,913,909,913,907,909,909,911,911,913,907,917,911,915,911,915,909,907,901,911,907,911,907,917,911,917,911,911,905,915,915,909,905,913,907,911,909,917,911,909,899,909,907,909,909,907,901,919,915,909,901,909,903,915,907,917,909,911,905,913,909,915,913,911,911,911,909,909,899,913,905,929,925,929,919,927,927,931,923,915,915,909,907,911,907,911,907,923,915,917,917,917,915,919,913,907,903,903,901,915,909,911,909,919,911,917,915,919,913,919,917,909,905,909,905,913,905,915,907,917,911,915,913,919,911,917,911,917,905,909,907,909,905,909,903,917,909,909,909,915,909,919,913,903,903,907,903,915,911,917,913,911,911,913,919,919,923,917,915,921,913,915,909,913,913,913,917,911,913,909,909,909,905,917,913,909,905,915,913,911,927,913,913,911,913,911,909,909,909,911,911,905,909,903,907,913,913,911,905,915,913,909,911,905,907,921,915,905,901,913,909,917,915,917,913,913,909,913,911,909,901,915,911,909,907,915,907,917,917,921,909,913,905,903,905,905,897,913,907,915,909,919,911,921,915,919,911,921,917,915,915,917,913,925,919,913,911,921,915,909,903,909,907,913,911,915,909,915,911,919,909,913,905,909,905,911,905,913,915,909,905,911,905,915,907,913,905,919,911,909,905,911,907,911,903,915,905,909,907,905,903,915,911,911,909,917,905,913,907,915,907,915,899,911,909,911,903,907,907,915,909,909,905,917,913,919,909,909,901,911,901,911,901,913,909,915,911,915,913,915,907,913,911,921,919,923,917,921,923,925,923,915,909,913,907,917,905,911,907,917,917,917,905,907,909,917,911,911,905,909,905,915,909,907,913,909,909,905,905,909,903,909,903,915,909,909,905,911,915,919,911,907,899,899,907,903,901,905,903,915,911,917,907,909,897,911,905,915,907,911,907,911,905,913,911,903,903,913,905,911,909,913,905,917,907,917,907,911,907,915,909,901,899,903,901,907,903,911,901,911,901,909,905,911,903,919,909,911,899,915,903,915,911,919,901,907,901,899,895,905,895,909,903,915,901,913,901,911,903,911,903,917,903,913,909,919,897,0] } }; /* per app page 2..611, in 1/1000 of the image height; 0 = use the average */
/* ===== TRANSLATION DATA for the Tarjuma page (and the Arabic-line tap) =====
   Nothing is bundled. The translation of a Surah is fetched only when needed (alquran.cloud, public API), kept in memory and
   in the browser cache, so a Surah is downloaded once. Tapping a line of the Mushaf opens the Tarjuma page at that ayah. */
const TR_LANGS = [{ k:'rom', n:'Hinglish', ed:'hi.hindi', conv:'roman' }, { k:'ur', n:'اردو', ed:'ur.jalandhry' }, { k:'hi', n:'हिन्दी', ed:'hi.hindi' }, { k:'en', n:'English', ed:'en.sahih' }];
/* Hinglish = the Hindi translation written in Roman letters, converted on the device (no Roman-Urdu translation exists as free data).
   Spelling follows everyday Roman Urdu / Hinglish: aa->a, ee, oo, schwa dropped at word ends and between syllables. */
const DV_C = { 'क':'k','ख':'kh','ग':'g','घ':'gh','ङ':'n','च':'ch','छ':'chh','ज':'j','झ':'jh','ञ':'n','ट':'t','ठ':'th','ड':'d','ढ':'dh','ण':'n','त':'t','थ':'th','द':'d','ध':'dh','न':'n','प':'p','फ':'f','ब':'b','भ':'bh','म':'m','य':'y','र':'r','ल':'l','व':'v','श':'sh','ष':'sh','स':'s','ह':'h','ळ':'l',
  'क़':'q','ख़':'kh','ग़':'gh','ज़':'z','ड़':'r','ढ़':'dh','फ़':'f','य़':'y' };
const DV_NUKTA = { 'क':'क़','ख':'ख़','ग':'ग़','ज':'ज़','ड':'ड़','ढ':'ढ़','फ':'फ़','य':'य़' };
const DV_V = { 'अ':'a','आ':'a','इ':'i','ई':'ee','उ':'u','ऊ':'oo','ऋ':'ri','ए':'e','ऐ':'ai','ओ':'o','औ':'au','ऑ':'o' };
const DV_M = { 'ा':'a','ि':'i','ी':'ee','ु':'u','ू':'oo','ृ':'ri','े':'e','ै':'ai','ो':'o','ौ':'au','ॉ':'o','ॅ':'e' };
function devaWord(w){
  const ch = Array.from(w.normalize('NFC')), syl = [];   /* syl: {c: consonant roman, v: vowel roman|null (inherent), tail: anusvara etc.} */
  for(let i = 0; i < ch.length; i++){
    let c = ch[i];
    if(DV_C[c] !== undefined){
      if(ch[i+1] === '़' && DV_NUKTA[c]){ c = DV_NUKTA[c]; i++; }
      let cons = DV_C[c];
      /* conjuncts: consonant + virama + consonant stay in one cluster */
      let v = null, inh = true;
      while(ch[i+1] === '्' && DV_C[ch[i+2]] !== undefined){ let n = ch[i+2]; i += 2; if(ch[i+1] === '़' && DV_NUKTA[n]){ n = DV_NUKTA[n]; i++; } cons += DV_C[n]; }
      if(ch[i+1] === '्'){ i++; inh = false; v = ''; }
      else if(DV_M[ch[i+1]] !== undefined){ v = DV_M[ch[i+1]]; inh = false; i++; }
      cons = cons.replace(/^ksh?$/, m=>m).replace('jgy','gy');
      syl.push({ c:cons, v, inh });
    } else if(DV_V[c] !== undefined){ syl.push({ c:'', v:DV_V[c], inh:false });
    } else if(c === 'ं' || c === 'ँ'){ if(syl.length) syl[syl.length-1].tail = (syl[syl.length-1].tail || '') + 'n';
    } else if(c === 'ः'){ if(syl.length) syl[syl.length-1].tail = (syl[syl.length-1].tail || '') + 'h';
    } else if(c === '़' || c === '्'){ /* stray */
    } else syl.push({ lit:c });
  }
  /* inherent "a": dropped at the end of a word and inside it when both neighbours carry a vowel */
  const has = k=> syl[k] && !syl[k].lit && (syl[k].v === 'a' || (syl[k].v && syl[k].v !== '') || (syl[k].inh && !syl[k].drop));
  for(let k = syl.length - 1; k >= 0; k--){
    const y = syl[k]; if(y.lit || !y.inh) continue;
    let lastC = true; for(let j = k + 1; j < syl.length; j++) if(!syl[j].lit){ lastC = false; break; }
    if(y.tail) continue;
    if(lastC){ if(syl.filter(z=>!z.lit).length > 1) y.drop = true; continue; }
    if(k > 0 && has(k-1) && has(k+1) && !syl[k+1].lit) y.drop = true;
  }
  return syl.map(y=> y.lit ? y.lit : y.c + (y.inh ? (y.drop ? '' : 'a') : (y.tail === 'n' && y.v === 'ee' ? '' : (y.v || ''))) + (y.tail === 'n' && y.v === 'e' ? 'in' : (y.tail === 'n' && y.v === 'ee' ? 'in' : (y.tail || '')))).join('');
}
const DV_FIX = { lie:'liye', koee:'koi', naheen:'nahin', yah:'yeh', vah:'woh', kiya:'kiya', nam:'naam', bara:'bada', kisee:'kisi', hee:'hi', bhee:'bhi', jaaoge:'jaoge', gae:'gaye', gaee:'gayi', kee:'ki', ke:'ke', meree:'meri', tumhaaree:'tumhari', hamaaree:'hamari', unheen:'unhein', aphsos:'afsos', hae:'haye', fir:'phir', fal:'phal', aibjoo:'aib-joo', aee:'aayi', aeen:'aayen', bhaeeyon:'bhaiyon', bhaee:'bhai', israeel:'israeel', onkhein:'ankhein', onkhon:'ankhon', onkh:'ankh', paighmbar:'paighambar', ikttha:'ikattha', iktthe:'ikatthe', iktthi:'ikatthi', ondhi:'aandhi', onsoo:'aansoo' };
/* spelling clean-up on the finished Roman word: 'ae' needs a y (jaye, laye); 'ein' before ge/gi is 'en' (jayenge); long final ee -> i */
function dvPost(w){
  if(w.length > 3 && /ee$/.test(w)) w = w.slice(0, -2) + 'i';
  return w.replace(/chchh/g, 'chh').replace(/ngein$/, 'ngen').replace(/^ae/, 'aaye').replace(/ae/g, 'aye').replace(/ein(?=g[eiy])/g, 'en').replace(/yein$/, 'yen');
}
function devaToRoman(text){
  let out = text.replace(/[\u0900-\u097F]+/g, w=>devaWord(w)).replace(/।/g, '.').replace(/\s+/g, ' ').trim();
  out = out.replace(/[a-z]+/g, w=>DV_FIX[w] || dvPost(w));
  out = out.replace(/(^|[.?!]\s+)([a-z])/g, (m, a, b)=>a + b.toUpperCase()).replace(/\ballah/g, 'Allah').replace(/\bmuhammad\b/gi, 'Muhammad');
  return out;
}
/* ayahs where the Hindi edition's wording is odd ("aibjoo"): Hindi + Hinglish follow the Urdu (Jalandhry) text instead */
const TR_OVR = { '68:10': { hi:'और किसी ऐसे शख़्स के कहने में न आ जाना जो बहुत क़समें खाने वाला, ज़लील औक़ात है', rom:'Aur kisi aise shakhs ke kahne mein na aa jana jo bahut qasmein khane wala, zaleel auqat hai' } };
const trOvr = (s, a, lang)=>{ const o = TR_OVR[s + ':' + a.numberInSurah]; return o && o[lang] || null; };
const TR_MEM = {};
const trLang = ()=> (TR_LANGS.find(l=>l.k === state.quranTr) || TR_LANGS.find(l=>l.k === (state.lang === 'en' ? 'en' : 'rom'))).k;
/* the prophets' names carry "alaihis salam" (not the angels, not Maryam). Salih is left out on purpose: it is also the ordinary word "righteous". */
const TR_AS = { rom:' alaihis salam', en:' alaihis salam', ur:' علیہ السلام', hi:' अलैहिस्सलाम' };
const trDv = w => w.replace(/([क-ह])/g, '$1़?');
const TR_NABI = {
  en: /\b(Adam|Idrees|Idris|Noah|Hud|Abraham|Lot|Ishmael|Isaac|Jacob|Joseph|Job|Shuaib|Shu'?aib|Moses|Aaron|Dhul-?Kifl|David|Solomon|Elias|Elijah|Elisha|Jonah|Zechariah|John|Jesus)\b/g,
  ur: /(آدم|ادریس|نوح|ہود|ابرا[ہھ]یم|لوط|اسماعیل|اسحاق|اسحٰق|یعقوب|یوسف|ایوب|شعیب|موس[یى]ٰ?|ہارون|ذوالکفل|داؤد|داود|سلیمان|الیاس|الیسع|یونس|زکریا|یحی[یى]?ٰ?|عیس[یى]ٰ?)(?![؀-ۿ])/g,
  hi: new RegExp('(' + ['आदम','इदरीस','नूह','हूद','इब्राही[मम]','इब्राहिम','लूत','इस्माई?ल','इसमाई?ल','इस्माइल','इस्हाक','इसहाक','याकू?ब','यूसुफ','अय्यूब','शुऐब','शुएब','शुऎब','मूसा','हारून','ज़ुलकिफ्ल','जुलकिफ्ल','ज़ुल्किफ्ल','दाऊद','दाउद','सुलैमान','सुलेमान','इल्यास','इलियास','अल्यसअ','अलयसअ','यूनुस','ज़करिया','जकरिया','ज़कारिया','यह्या','यहया','ईसा'].map(trDv).join('|') + ')(?![ऀ-ॿ])', 'g')
};
/* "(ऐ रसूल)" in brackets always addresses the Prophet: name him, as the Urdu edition does ("اے محمد") */
const trAddr = t => t ? t.replace(/\(\s*[एऐ]\s+रसूल\s*\)/g, '(ऐ मुहम्मद)').replace(/तुमको को(?![\u0900-\u097F])/g, 'तुमको') : t;
/* Salih is also the plain word "righteous", so his name is only marked in the surahs that tell his story (Al-A'raf, Hud, Ash-Shu'ara, An-Naml) */
const TR_SALIH = { en:/\b(Salih|Saleh)\b/g, ur:/(?<![\u0600-\u06FF])(صالح)(?![\u0600-\u06FF])/g, hi:/(?<![\u0900-\u097F])(सालेह|सालिह|सालह|सॉलेह)(?![\u0900-\u097F])/g };
function trNabi(t, lang, surah){
  if(!t) return t; const k = lang === 'rom' ? 'hi' : lang, re = TR_NABI[k]; if(!re) return t;
  const skip = new RegExp('^\\s*(?:\\(\\s*)?(?:alaihis|alayhi|عليه|علیہ|अलैहिस|अलैहि|\\(?(?:a\\.?s|peace)\\b)', 'i');
  const mark = (m, g1, off, str)=> skip.test(str.slice(off + m.length)) ? m : m + TR_AS[lang];
  t = t.replace(re, mark);
  if([7, 11, 26, 27].includes(surah) && TR_SALIH[k]) t = t.replace(TR_SALIH[k], mark);
  return t;
}
/* the Prophet's name always carries the salawat: Muhammad ﷺ (all four languages; skipped where it is already written) */
function trSal(t, lang){
  if(!t) return t; const SAL = '\uFDFA', after = '(?!\\s*(?:' + SAL + '|\\(\\s*(?:صلی|ﷺ|sallallahu|salallahu)))';
  if(lang === 'en' || lang === 'rom') return t.replace(new RegExp('\\b(M[uo]h+a?mm?[ae]d)\\b' + after, 'gi'), (m)=> (lang === 'rom' ? 'Muhammad' : m) + ' ' + SAL);
  if(lang === 'ur') return t.replace(new RegExp('(محمد)(?![\\u0600-\\u06FF])' + after, 'g'), '$1 ' + SAL);
  if(lang === 'hi') return t.replace(new RegExp('(म[ुो]हम्मद)(?![\\u0900-\\u097F])' + after, 'g'), '$1 ' + SAL);
  return t;
}
/* the translations ship inside the app (qtr/ur|hi|en.json, the same editions as the online ones), so they work without internet; Hinglish is made from the Hindi one */
const TR_LOCAL = {};
function trLocal(f){ return TR_LOCAL[f] || (TR_LOCAL[f] = fetch('qtr/' + f + '.json').then(r=>{ if(!r.ok) throw new Error('qtr ' + r.status); return r.json(); }).catch(e=>{ delete TR_LOCAL[f]; throw e; })); }
async function trLoad(s, lang){
  const key = lang + s; if(TR_MEM[key]) return TR_MEM[key];
  const def = TR_LANGS.find(l=>l.k === lang), conv = def.conv === 'roman' ? (x=> devaToRoman(trNabi(trAddr(x), 'rom', s)).replace(/\btumko ko\b/gi, m=> m.slice(0, 5))) : (x=> trNabi(lang === 'hi' ? trAddr(x) : x, lang, s));
  try{ const all = await trLocal(lang === 'rom' ? 'hi' : lang); const arr = all[s - 1]; if(arr && arr.length) return TR_MEM[key] = arr.map((t, i)=> trSal(trOvr(s, { numberInSurah:i + 1 }, lang) || conv(t), lang)); }catch(e){}
  const url = `https://api.alquran.cloud/v1/surah/${s}/${def.ed}`;
  let cache = null; try{ cache = await caches.open('waqt24-tr-v1'); const hit = await cache.match(url); if(hit){ const j = await hit.json(); return TR_MEM[key] = j.data.ayahs.map(a=>trSal(trOvr(s, a, lang) || conv(a.text), lang)); } }catch(e){}
  const res = await fetch(url); if(!res.ok) throw new Error('tr ' + res.status);
  try{ if(cache) cache.put(url, res.clone()); }catch(e){}
  const j = await res.json(); return TR_MEM[key] = j.data.ayahs.map(a=>trSal(trOvr(s, a, lang) || conv(a.text), lang));
}
function trPageAyahs(page){ const f = QA_PAGE_FIRST[page-1], nx = QA_PAGE_FIRST[page] || (QA_TOTAL + 1), out = []; for(let x = f; x < nx; x++) out.push(x); return out; }
/* tap on a line of the page -> the ayah on that line */
function trLineTap(ev){
  const wrap = document.getElementById('quranWrap'); if(!wrap || wrap.classList.contains('zoomed')) return;
  const img = wrap.querySelector('.quran-page-img'), page = state.quranPage; if(!img || !img.naturalWidth || page < 2 || page >= QURAN_SURAHS[113].page) return;
  const r = img.getBoundingClientRect(), k = Math.min(r.width / img.naturalWidth, r.height / img.naturalHeight), ih = img.naturalHeight * k, iw = img.naturalWidth * k;
  const top = r.top + (r.height - ih) / 2, left = r.left + (r.width - iw) / 2;
  if(ev.clientX < left || ev.clientX > left + iw) return;
  const y = (ev.clientY - top) / ih, E = qaEdges(page, quranEd()); let line = 0;
  for(let i = 1; i < E.length; i++) if(y >= E[i-1] && y < E[i]){ line = i; break; }
  if(!line) return;
  const ids = trPageAyahs(page); let hit = 0;
  for(const x of ids){ const a = parseInt(QA_LINES[(x-1)*2], 16), b = parseInt(QA_LINES[(x-1)*2+1], 16); if(line >= a && line <= b){ hit = x; break; } }
  if(!hit) return;
  /* the Tarjuma page opens (if it is closed) and marks the ayah on that line; a running recitation moves there too */
  trp.focus = hit;
  if(!state.quranTrPage){ state.quranTrPage = true; saveState(); renderQuranReader(page); } else trpFocus(hit);
  if(qa.on) qaPlayFrom(hit);
}
(function(){
  const ov = document.getElementById('detailOverlay');
  document.addEventListener('click', e=>{ if(e.target.closest && e.target.closest('.quran-page-img')) trLineTap(e); });
})();
/* ===== NEARBY MASJID: opens the phone's maps app with a search for mosques ===== */
function masjidMapsUrl(lat, lon){ return `https://www.google.com/maps/search/mosque/@${(+lat).toFixed(5)},${(+lon).toFixed(5)},15z`; }
function masjidOpen(url){ try{ window.open(url, '_blank', 'noopener'); }catch(e){ location.href = url; } }
function renderMasjid(){
  document.getElementById('detailTitle').textContent = L({rur:'Qareebi Masjid', en:'Nearby Masjid'});
  const loc = state.location || CITIES[0];
  document.getElementById('detailBody').innerHTML = `<div class="masjid-card">
      <div class="masjid-ic">🕌</div>
      <div class="masjid-h">${L({rur:'Apne paas ki masjid dhoondhein', en:'Find a masjid near you'})}</div>
      <p>${L({rur:'Maps khulega aur paas ki masjidein dikhayega. Aapki location sirf maps ko jaati hai, Waqt24 use save nahi karta.', en:'Your maps app opens with mosques around you. Your location goes only to maps; Waqt24 does not store it.'})}</p>
      <button type="button" class="masjid-btn primary" id="masjidGps">📍 ${L({rur:'Meri location ke paas', en:'Near my location'})}</button>
      <button type="button" class="masjid-btn" id="masjidCity">🏙️ ${L({rur:`${loc.name} mein masjidein`, en:`Mosques in ${loc.name}`})}</button>
      <div class="masjid-msg" id="masjidMsg"></div>
    </div>
    <div class="masjid-card soft">
      <div class="masjid-h" style="font-size:15px;">⏰ ${L({rur:'Apni masjid ki jamaat ka waqt', en:'Your masjid’s jamaat times'})}</div>
      <p>${L({rur:'Jamaat ka waqt set karein, Home par jamaat ki yaad-dahani milegi.', en:'Set the jamaat times and get a jamaat reminder on Home.'})}</p>
      <button type="button" class="masjid-btn" id="masjidJamaat">${L({rur:'Jamaat settings kholein', en:'Open jamaat settings'})}</button>
    </div>`;
  const msg = document.getElementById('masjidMsg');
  document.getElementById('masjidCity').onclick = ()=> masjidOpen(masjidMapsUrl(loc.lat, loc.lon));
  document.getElementById('masjidJamaat').onclick = ()=> openOverlay(renderIqamahSettings);
  document.getElementById('masjidGps').onclick = ()=>{
    if(!navigator.geolocation){ msg.textContent = L({rur:'Is device par location nahi mil sakti. Shehar se dhoondhein.', en:'Location is not available here. Try the city search.'}); return; }
    msg.textContent = L({rur:'Location dhoondh rahe hain…', en:'Finding your location…'});
    navigator.geolocation.getCurrentPosition(
      pos=>{ msg.textContent = ''; masjidOpen(masjidMapsUrl(pos.coords.latitude, pos.coords.longitude)); },
      ()=>{ msg.textContent = L({rur:'Location ki ijazat nahi mili. Shehar se dhoondhein.', en:'Location permission was not given. Try the city search.'}); },
      { enableHighAccuracy:false, timeout:10000, maximumAge:300000 });
  };
}
navWrap('renderMasjid', 0);
(function(){
  const item = document.querySelector('.more-item[data-open="masjid"]');
  if(item) item.onclick = ()=> openOverlay(renderMasjid);
})();
/* ===== TARJUMA PAGE: the translation as a book-like page docked under the Mushaf =====
   A panel at the bottom of the reader (drag the handle to make it taller or shorter; default about half the screen), so the Arabic
   page stays visible above it. The ayahs of the open page run on as continuous text with ayah numbers on ruled lines; the ayah
   being recited is highlighted and kept in view, and the Arabic page scrolls so the recited line is never hidden behind the panel.
   Languages: Hinglish, اردو (Nastaliq), हिन्दी, English. Uses the same translation data as the Tarjuma sheet. */
const TRP_SIZES = [11, 12, 13, 14, 15, 17, 20, 23, 27];   /* px of the Latin / Devanagari text; Urdu is drawn 7px larger */
const trpSizeIdx = ()=>{ const i = TRP_SIZES.indexOf(state.trpPx); return i >= 0 ? i : 6; };   /* default 20px */
const trpDigits = (n, ur)=> ur ? String(n).replace(/\d/g, d=>'٠١٢٣٤٥٦٧٨٩'[d]) : String(n);
const trpMsg = ()=> L({rur:'Load ho raha hai…', en:'Loading…'});
const trpFree = ()=> typeof state.trpTop === 'number';
function trpPanel(){
  let el = document.getElementById('tpPanel'); if(el) return el;
  el = document.createElement('div'); el.id = 'tpPanel'; el.className = 'tp-panel'; el.setAttribute('role', 'region'); el.setAttribute('aria-label', 'Translation page');
  el.innerHTML = '<div class="tp-grip" aria-label="Drag to resize"><i></i></div><div class="tp-head" id="tpHead"></div><div class="tp-scroll" id="tpScroll"></div><div class="tp-rs" aria-label="Drag to resize"><i></i></div>';
  (document.getElementById('detailOverlay').parentElement || document.body).appendChild(el);
  /* drag the top handle = taller / shorter, the header band = move the whole panel up or down, the bottom bar (when floating) = resize from below.
     Double-tap the handle or the header to dock it to the bottom again. */
  const wire = (node, mode)=>{
    let on = false, y0 = 0, top0 = 0, h0 = 0, moved = false;
    node.addEventListener('pointerdown', e=>{ if(e.target.closest('button')) return; on = true; moved = false; y0 = e.clientY; const r = el.getBoundingClientRect(); top0 = r.top; h0 = r.height; try{ node.setPointerCapture(e.pointerId); }catch(x){} el.classList.add('drag'); });
    node.addEventListener('pointermove', e=>{
      if(!on) return; const H = innerHeight, dy = e.clientY - y0; if(Math.abs(dy) > 3) moved = true; if(!moved) return;
      if(mode === 'move'){ state.trpTop = Math.max(8, Math.min(H - 90, top0 + dy)) / H; state.trpH = Math.min(h0, H - state.trpTop * H - 8) / H; if(top0 + dy >= trpDockTop(h0) - 2) state.trpTop = null; }
      else if(mode === 'top'){ if(trpFree()){ const t = Math.max(8, top0 + dy); state.trpTop = t / H; state.trpH = Math.max(H * .2, h0 - (t - top0)) / H; } else state.trpH = Math.max(H * .2, Math.min(H * .9, h0 - dy)) / H; }
      else { if(!trpFree()) state.trpTop = top0 / H; state.trpH = Math.max(H * .2, Math.min(H - top0 - 8, h0 + dy)) / H; }
      trpPlace();
    });
    const end = ()=>{
      if(!on) return; on = false; el.classList.remove('drag');
      if(moved && mode === 'move' && trpFree() && Math.abs(el.getBoundingClientRect().top - trpDockTop(el.offsetHeight)) < 36) state.trpTop = null;
      if(moved){ state.trpH = +(el.offsetHeight / innerHeight).toFixed(3); if(trpFree()) state.trpTop = +(state.trpTop).toFixed(3); saveState(); trpPlace(); trpKeepArabic(true); }
    };
    node.addEventListener('pointerup', end); node.addEventListener('pointercancel', end);
    if(mode !== 'bottom') node.addEventListener('dblclick', e=>{ if(e.target.closest('button')) return; state.trpTop = null; saveState(); trpPlace(); trpKeepArabic(true); });
  };
  wire(el.querySelector('.tp-grip'), 'top'); wire(el.querySelector('.tp-rs'), 'bottom');
  wire(el.querySelector('#tpHead'), 'move');
  const scr = el.querySelector('.tp-scroll');
  scr.onclick = e=>{ const m = e.target.closest('.tp-more'); if(m){ trpMore(m.classList.contains('up') ? -1 : 1); return; } const a = e.target.closest('.tp-a'); if(a) trpTap(+a.dataset.abs); };
  ['touchstart', 'wheel', 'pointerdown'].forEach(ev=> scr.addEventListener(ev, ()=>{ trp.touch = Date.now(); }, { passive:true }));
  let raf = 0;
  scr.addEventListener('scroll', ()=>{ if(raf) return; raf = requestAnimationFrame(()=>{ raf = 0; trpHeadUpdate(); });   /* next / earlier pages load only when their button is tapped */ }, { passive:true });
  return el;
}
/* where the bottom edge of a docked panel sits (above the player while it is open, else above the tab bar) */
function trpDockBottom(){
  const q = document.getElementById('qPlayer'), ov = document.getElementById('detailOverlay'), tb = document.getElementById('tabbar');
  const up = q && q.classList.contains('show') ? q.offsetHeight + parseFloat(getComputedStyle(q).marginBottom || 0) + 8 : 0;
  return up || ((ov && ov.classList.contains('active')) ? 0 : (tb ? tb.offsetHeight : 0));
}
const trpDockTop = h => innerHeight - trpDockBottom() - h;
/* lay the panel out: docked at the bottom, or floating where the person put it */
function trpPlace(){
  const el = document.getElementById('tpPanel'), body = document.getElementById('detailBody'); if(!el || !el.classList.contains('show')) return;
  const H = innerHeight, h = Math.round(Math.max(H * .2, Math.min(H * .92, (state.trpH || .46) * H)));
  el.style.height = h + 'px';
  if(trpFree()){
    const top = Math.max(8, Math.min(H - 90, state.trpTop * H)); el.style.top = top + 'px'; el.style.bottom = 'auto'; el.classList.add('tp-free');
    if(body) body.style.paddingBottom = Math.max(0, H - top + 16) + 'px';
  } else {
    el.style.top = 'auto'; el.style.bottom = trpDockBottom() + 'px'; el.classList.remove('tp-free');
    if(body) body.style.paddingBottom = (el.offsetHeight + trpDockBottom() + 16) + 'px';
  }
}
function trpHide(){
  const el = document.getElementById('tpPanel'); if(el) el.classList.remove('show');
  const body = document.getElementById('detailBody'); if(body) body.style.paddingBottom = '';
}
/* The panel shows a run of pages (trp.from..trp.to) as one continuous scroll; "earlier / next" add a page at either end. */
const trp = { from:0, to:0, lang:'', busy:false, touch:0, focus:0 };
const trpHasPage = n => n >= 2 && n <= QA_PAGE_FIRST.length && trPageAyahs(n).length > 0;
function trpSizeApply(){
  const el = document.getElementById('tpPanel'); if(!el) return;
  const z = TRP_SIZES[trpSizeIdx()]; el.style.setProperty('--tpz', z + 'px'); el.style.setProperty('--tpu', (z + 7) + 'px');
  trpRules();
}
/* Ruled lines: put each rule exactly midway between two lines of text, whatever the font. The first baseline of every paragraph is
   measured (a zero-size probe sits on it); a rule then goes at baseline + half a line - a quarter em, which is the middle of the gap
   between the descenders of one line and the capitals / headline of the next. (Urdu keeps a hand-tuned offset in the stylesheet.) */
function trpRules(){
  const sc = document.getElementById('tpScroll'), panel = document.getElementById('tpPanel'); if(!sc || !panel) return;
  /* whole-pixel line height everywhere, so the lines and the rules can never drift apart down the page */
  sc.querySelectorAll('.tp-p').forEach(p=>{
    const rtl = p.matches('[dir=rtl]'), z = parseFloat(getComputedStyle(panel).getPropertyValue(rtl ? '--tpu' : '--tpz'));
    if(z) p.style.setProperty('--tpl', Math.round(z * (rtl ? 2.9 : 2.35)) + 'px');
  });
  sc.querySelectorAll('.tp-p:not([dir=rtl])').forEach(p=>{
    let probe = p.querySelector('.tp-pb');
    if(!probe){ probe = document.createElement('i'); probe.className = 'tp-pb'; p.insertBefore(probe, p.firstChild); }
    const cs = getComputedStyle(p), L = parseFloat(cs.lineHeight), fs = parseFloat(cs.fontSize);
    if(!L || !fs || !probe.offsetParent) return;
    const base = probe.offsetTop;                  /* layout position of the first baseline (not affected by animations / transforms) */
    const rule = base + L / 2 - fs * .25, first = rule - L;
    p.style.backgroundPosition = '0 ' + first.toFixed(2) + 'px';
    /* no rule above the very first line (the page divider is already there) */
    const cut = first > -1 && first < L / 2 ? Math.ceil(first + 3) : 0;
    p.style.webkitMaskImage = p.style.maskImage = cut ? `linear-gradient(to bottom, transparent ${cut}px, #000 ${cut}px)` : '';
  });
}
/* measure again once things have settled (fonts, tint change, animations, resize) */
function trpRulesLater(){ requestAnimationFrame(()=>{ trpRules(); requestAnimationFrame(trpRules); }); setTimeout(trpRules, 300); setTimeout(trpRules, 900); }
/* HTML of whole pages, in one language */
async function trpBuild(pages, lang){
  const ur = lang === 'ur', ids = pages.flatMap(trPageAyahs), surahs = [...new Set(ids.map(x=>qaSurahAyah(x).s))];
  const data = await Promise.all(surahs.map(s=>trLoad(s, lang)));
  const open = '<p class="tp-p"' + (ur ? ' dir="rtl" lang="ur"' : lang === 'hi' ? ' lang="hi"' : '') + '>';
  return pages.map(pg=>{
    const list = trPageAyahs(pg); if(!list.length) return '';
    let html = open;
    list.forEach(x=>{
      const r = qaSurahAyah(x), t = (data[surahs.indexOf(r.s)][r.a-1] || '').replace(/</g, '&lt;');
      if(r.a === 1){
        if(html.endsWith(open)) html = html.slice(0, -open.length); else html += '</p>';
        html += `<div class="tp-surah">${r.s}. ${(QURAN_SURAHS[r.s-1] || {}).name || ''}</div>${open}`;
      }
      html += `<span class="tp-a" data-abs="${x}">${t} <i class="tp-n" dir="ltr">&#xFD3E;${trpDigits(r.a, ur)}&#xFD3F;</i></span> `;
    });
    return `<section class="tp-pg" data-page="${pg}"><div class="tp-pgno"><span>${L({rur:'Safha', en:'Page'})} ${pg}</span></div>${html}</p></section>`;
  }).join('');
}
function trpHead(page, lang){
  const ids = trPageAyahs(page), para = quranParaOf(page), first = ids.length ? qaSurahAyah(ids[0]).s : quranSurahOf(page).n;
  const head = document.getElementById('tpHead');
  head.innerHTML = `<div class="tp-top"><span id="tpHdPara">${L({rur:'Paara', en:'Para'})} ${para.n}</span><b id="tpHdSurah">${(QURAN_SURAHS[first-1] || {}).name || ''}</b><span id="tpHdPage">${L({rur:'Safha', en:'Page'})} ${page}</span><button type="button" class="tp-x" aria-label="Close">✕</button></div>
    <div class="tp-tools"><div class="tp-langs">${TR_LANGS.map(l=>`<button type="button" data-l="${l.k}" class="${l.k === lang ? 'on' : ''}">${l.n}</button>`).join('')}</div><div class="tp-sz"><button type="button" data-z="-1" aria-label="Smaller text">A−</button><button type="button" data-z="1" aria-label="Bigger text">A+</button></div></div>`;
  head.querySelector('.tp-x').onclick = ()=>{ state.quranTrPage = false; saveState(); trpHide(); const b = document.getElementById('quranTpBtn'); if(b) b.classList.remove('on'); };
  head.querySelector('.tp-langs').onclick = e=>{ const b = e.target.closest('button'); if(!b) return; state.quranTr = b.dataset.l; saveState(); trpFill(state.quranPage); };
  head.querySelector('.tp-sz').onclick = e=>{ const b = e.target.closest('button'); if(!b) return; state.trpPx = TRP_SIZES[Math.max(0, Math.min(TRP_SIZES.length - 1, trpSizeIdx() + (+b.dataset.z)))]; saveState(); trpSizeApply(); };
}
/* the header follows what is at the top of the scroll: its page, para and surah */
function trpHeadUpdate(){
  const sc = document.getElementById('tpScroll'); if(!sc || !document.getElementById('tpHdPage')) return;
  const top = sc.getBoundingClientRect().top;
  const a = [...sc.querySelectorAll('.tp-a')].find(n=>{ const r = n.getClientRects(); return r.length && r[r.length-1].bottom > top + 4; }); if(!a) return;
  const abs = +a.dataset.abs, pg = qaAyahPage(abs), sn = qaSurahAyah(abs).s;
  document.getElementById('tpHdPage').textContent = L({rur:'Safha', en:'Page'}) + ' ' + pg;
  document.getElementById('tpHdPara').textContent = L({rur:'Paara', en:'Para'}) + ' ' + quranParaOf(pg).n;
  document.getElementById('tpHdSurah').textContent = (QURAN_SURAHS[sn-1] || {}).name || '';
}
function trpMoreUI(){
  const sc = document.getElementById('tpScroll'); if(!sc) return;
  const up = sc.querySelector('.tp-more.up'), dn = sc.querySelector('.tp-more.down'); if(!up || !dn) return;
  up.hidden = !trpHasPage(trp.from - 1); dn.hidden = !trpHasPage(trp.to + 1);
  up.textContent = '⬆ ' + L({rur:'Pehle ke ayat', en:'Earlier ayahs'}) + ' · ' + L({rur:'Safha', en:'Page'}) + ' ' + (trp.from - 1);
  dn.textContent = '⬇ ' + L({rur:'Aage ke ayat', en:'Next ayahs'}) + ' · ' + L({rur:'Safha', en:'Page'}) + ' ' + (trp.to + 1);
}
async function trpMore(dir){
  const sc = document.getElementById('tpScroll'), box = sc && sc.querySelector('.tp-pages'); if(!box || trp.busy) return;
  const n = dir < 0 ? trp.from - 1 : trp.to + 1; if(!trpHasPage(n)) return;
  trp.busy = true;
  try{
    const html = await trpBuild([n], trp.lang);
    if(!document.getElementById('tpScroll') || trp.lang !== trLang()) return;
    if(dir < 0){ const h0 = sc.scrollHeight; box.insertAdjacentHTML('afterbegin', html); sc.scrollTop += sc.scrollHeight - h0; trp.from = n; }
    else { box.insertAdjacentHTML('beforeend', html); trp.to = n; }
    trpMoreUI(); trpRules(); trpRulesLater(); trpSync(true, true);
  }catch(e){ showToast(L({rur:'Tarjuma load nahi hua. Internet check karein.', en:'Could not load the translation. Check your internet connection.'}), '!'); }
  finally{ trp.busy = false; }
}
async function trpFill(page){
  if(!document.getElementById('quranWrap')) return trpHide();
  const el = trpPanel(), sc = el.querySelector('#tpScroll'), lang = trLang();
  trpSizeApply();
  el.classList.toggle('tp-night', typeof quranNightOn === 'function' && quranNightOn());
  if(!el.classList.contains('show')) el.classList.add('show');
  trpPlace(); if(typeof quranTintPlayer === 'function') quranTintPlayer();
  const inRange = page >= trp.from && page <= trp.to && !!sc.querySelector('.tp-pages');
  if(inRange && trp.lang === lang){   /* same run of pages: nothing to reload (e.g. the reader moved to a page already shown) */
    if(!document.getElementById('tpHdPage')) trpHead(page, lang);
    trpRulesLater(); trpHeadUpdate(); trpSync(true); if(trp.focus){ trpFocus(trp.focus); trp.focus = 0; } return;
  }
  const pages = []; if(inRange){ for(let n = trp.from; n <= trp.to; n++) pages.push(n); } else { trp.from = trp.to = page; pages.push(page); }
  trp.lang = lang; trpHead(page, lang);
  if(!trPageAyahs(page).length){ sc.innerHTML = `<div class="tp-msg">${L({rur:'Is safhe par ayaat nahi hain.', en:'There are no ayahs on this page.'})}</div>`; return; }
  sc.innerHTML = `<div class="tp-msg loading">${trpMsg()}</div>`;
  let html;
  try{ html = await trpBuild(pages, lang); }
  catch(e){
    if(state.quranPage !== page) return;
    sc.innerHTML = `<div class="tp-msg">${L({rur:'Tarjuma load nahi hua. Internet check karein.', en:'Could not load the translation. Check your internet connection.'})}<br><button type="button" class="tp-retry">${L({rur:'Dobara koshish', en:'Retry'})}</button></div>`;
    sc.querySelector('.tp-retry').onclick = ()=>{ trp.from = trp.to = 0; trpFill(page); }; return;
  }
  if(state.quranPage !== page || !state.quranTrPage) return;
  sc.innerHTML = `<div class="tp-text"><button type="button" class="tp-more up"></button><div class="tp-pages">${html}</div><button type="button" class="tp-more down"></button>${lang === 'rom' ? `<div class="tp-note">${L({rur:'Hindi tarjuma ko Roman mein khud-ba-khud badla gaya hai, spelling mein thodi kami ho sakti hai.', en:'The Hindi translation is converted to Roman letters automatically, so some spellings may be imperfect.'})}</div>` : ''}${lang === 'ur' ? `<div class="tp-note" dir="rtl" lang="ur">آڈیو (شمشاد علی خان) اور تحریری ترجمے کے الفاظ میں معمولی فرق ہو سکتا ہے، مگر مفہوم اور اصل مطلب ایک ہی رہتا ہے۔</div>` : `<div class="tp-note">${L({rur:'Audio (Urdu, Shamshad Ali Khan) aur likhe huye tarjuma ke alfaaz thode alag ho sakte hain, lekin mafhoom aur asal matlab ek hi rehta hai.', en:'The audio (Urdu, Shamshad Ali Khan) and the written translation may differ slightly in wording, but the meaning stays the same.'})}</div>`}</div>`;
  trpMoreUI(); trpRules(); trpRulesLater();
  const sec = sc.querySelector(`.tp-pg[data-page="${page}"]`); sc.scrollTop = inRange && sec ? Math.max(0, sec.offsetTop - sc.offsetTop - 4) : 0;
  trpHeadUpdate(); trpSync(true);
  if(trp.focus){ trpFocus(trp.focus); trp.focus = 0; }
}
/* tap an ayah: the Arabic page of that ayah opens above (if it is another page) and the recitation starts from it */
function trpTap(abs){
  const pg = qaAyahPage(abs), go = ()=>{ if(pg !== state.quranPage) renderQuranReader(pg); qaPlayFrom(abs); };
  if(pg !== state.quranPage && typeof slideDetail === 'function'){ slideDetail(pg > state.quranPage ? 1 : -1, go); setTimeout(()=>{ if(state.quranPage !== pg && document.getElementById('quranWrap')) go(); }, 900); }
  else go();
}
/* a line of the Arabic page was tapped: mark that ayah in the panel */
function trpFocus(abs){
  const sc = document.getElementById('tpScroll'); if(!sc) return;
  sc.querySelectorAll('.tp-a.tap').forEach(n=>n.classList.remove('tap'));
  const a = sc.querySelector(`.tp-a[data-abs="${abs}"]`); if(!a) return;
  a.classList.add('tap'); trpScrollTo(a, false);
}
function trpScrollTo(a, instant){
  const sc = document.getElementById('tpScroll'); if(!sc) return;
  const br = sc.getBoundingClientRect(), rects = a.getClientRects(); if(!rects.length) return;
  const top = rects[0].top, bot = rects[rects.length - 1].bottom, h = bot - top;
  const want = h > br.height * .7 ? top - br.top - br.height * .12 : (top + bot) / 2 - br.top - br.height / 2;
  sc.scrollTo({ top: Math.max(0, sc.scrollTop + want), behavior: instant ? 'auto' : 'smooth' });
}
/* keep the line being recited visible: above the panel when it sits low, below it when it has been moved to the top */
function trpKeepArabic(instant){
  const el = document.getElementById('tpPanel'), body = document.getElementById('detailBody'), hl = document.querySelector('#quranWrap .qhl');
  if(!el || !el.classList.contains('show') || !body || !hl || !qa.on) return;
  const r = hl.getBoundingClientRect(), br = body.getBoundingClientRect(), pr = el.getBoundingClientRect();
  const below = pr.top + pr.height / 2 < innerHeight / 2;   /* panel in the upper half: the page shows below it */
  const q = document.getElementById('qPlayer'), floor = q && q.classList.contains('show') ? q.getBoundingClientRect().top : innerHeight;
  const lo = below ? pr.bottom + 8 : br.top + 6, hi = below ? floor - 8 : pr.top - 8;
  if(hi - lo < r.height || (r.top >= lo && r.bottom <= hi)) return;
  const mid = r.top + r.height / 2 - (lo + (hi - lo) / 2);
  body.scrollTo({ top: Math.max(0, body.scrollTop + mid), behavior: instant ? 'auto' : 'smooth' });
}
/* back to the ayah being recited, whatever was scrolled meanwhile */
function trpJump(){ trp.touch = 0; const el = document.getElementById('tpPanel'); if(el && el.classList.contains('show')) trpSync(true); }
/* mark the ayah being recited and keep it in view */
function trpSync(force, quiet){
  const sc = document.getElementById('tpScroll'); if(!sc || !document.getElementById('tpPanel').classList.contains('show')) return;
  sc.querySelectorAll('.tp-a.cur').forEach(n=>n.classList.remove('cur'));
  document.getElementById('tpPanel').classList.toggle('tp-follow', !!qa.on);
  const cur = qa.on ? sc.querySelector(`.tp-a[data-abs="${qa.abs}"]`) : null;
  if(!cur){ trpSync._a = 0; return; }
  cur.classList.add('cur'); sc.querySelectorAll('.tp-a.tap').forEach(n=>n.classList.remove('tap'));
  if(trpSync._a === qa.abs && !force) return;
  trpSync._a = qa.abs;
  if(!quiet && (force || Date.now() - trp.touch > 8000)){ trpScrollTo(cur, force); trpKeepArabic(force); }   /* while someone is reading on their own, the recitation does not pull the scroll away */
}
if(document.fonts && document.fonts.ready) document.fonts.ready.then(()=>trpRules());
(function(){
  const ov = document.getElementById('detailOverlay');
  if(ov) new MutationObserver(()=>{ if(!ov.classList.contains('active')) trpHide(); else trpPlace(); }).observe(ov, { attributes:true, attributeFilter:['class'] });
  const body = document.getElementById('detailBody');
  if(body) new MutationObserver(()=>{ if(!document.getElementById('quranWrap')) trpHide(); }).observe(body, { childList:true });
  window.addEventListener('resize', ()=>{ trpPlace(); trpRulesLater(); });
})();
/* ============================================================
   NOTES: write anything. A note can be free, tied to a Qur'an page (popup in the reader) or to a saved item (Mere Pasandeeda).
   state.notes = [{ id, page?, bm?, text, ts }]
   ============================================================ */
function notesList(){ if(!Array.isArray(state.notes)) state.notes = []; return state.notes; }
function notesForPage(p, sec){ return notesList().filter(n=>n.page === p && (n.sec || '') === (sec || '')); }
/* where a page note belongs: the Mushaf reader (no sec), the Tarjuma book ('tb') or Tafseer ('tf') */
function noteSecName(n){ const pg = n.page; if(n.sec === 'tf'){ const s = typeof tfSurahOf === 'function' ? tfSurahOf(pg) : 0; return `📕 Tafseer · Page ${pg} · ${s ? QURAN_SURAHS[s - 1].name : 'Muqaddima'}`; } return `${n.sec === 'tb' ? '📘 Tarjuma' : '📖'} ${n.sec === 'tb' ? '· ' : ''}Page ${pg} · ${quranSurahOf(pg).name}`; }
function notesForBm(k){ return notesList().filter(n=>n.bm === k); }
function noteEsc(t){ return String(t).replace(/[&<>"]/g, c=>({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c])); }
function noteWhen(ts){ const d = new Date(ts); return d.getDate() + ' ' + MON[d.getMonth()] + ' ' + d.getFullYear(); }
/* Popup. ctx: { page } | { bm, title } | {} (free note). Shows the notes already attached, plus a box to write a new one. */
function openNoteBox(ctx, onClose){
  ctx = ctx || {};
  const old = document.getElementById('noteBox'); if(old) old.remove();
  const matches = ()=> notesList().filter(n=> ctx.page ? (n.page === ctx.page && (n.sec || '') === (ctx.sec || '')) : ctx.bm ? n.bm === ctx.bm : (!n.page && !n.bm));
  const title = ctx.page ? '📝 ' + noteSecName({ page:ctx.page, sec:ctx.sec }).replace(/^\S+\s/, '') : ctx.bm ? `📝 ${noteEsc(ctx.title || '')}` : `📝 ${L({rur:'Mere Notes', en:'My notes'})}`;
  const w = document.createElement('div'); w.id = 'noteBox'; w.className = 'note-ov';
  const close = ()=>{ w.remove(); if(onClose) onClose(); };
  let editId = null;
  const draw = ()=>{
    const list = matches();
    w.innerHTML = `<div class="note-sheet" role="dialog" aria-label="Note">
      <div class="note-head"><b>${title}</b><button type="button" class="note-x" aria-label="Band karein">✕</button></div>
      <div class="note-list">${list.length ? list.map(n=>`<div class="note-item" data-id="${n.id}"><div class="note-text">${noteEsc(n.text).replace(/\n/g, '<br>')}</div><div class="note-meta"><span>${noteWhen(n.ts)}</span><span><button type="button" data-edit="${n.id}">✎ ${L({rur:'Badlein', en:'Edit'})}</button><button type="button" data-del="${n.id}">🗑</button></span></div></div>`).join('') : `<div class="note-empty">${L({rur:'Abhi koi note nahi. Neeche kuch bhi likhein.', en:'No notes yet. Write anything below.'})}</div>`}</div>
      <textarea id="noteTa" rows="4" placeholder="${L({rur:'Yahan likhein…', en:'Write here…'})}"></textarea>
      <div class="note-btns"><button type="button" class="note-save" id="noteSave">${editId ? L({rur:'Note update karein', en:'Update note'}) : L({rur:'Note save karein', en:'Save note'})}</button>${editId ? `<button type="button" id="noteCancel">${L({rur:'Rehne dein', en:'Cancel'})}</button>` : ''}</div>
    </div>`;
    const ta = w.querySelector('#noteTa'); if(editId){ const n = notesList().find(x=>x.id === editId); if(n) ta.value = n.text; }
    w.querySelector('.note-x').onclick = close;
    const cancel = w.querySelector('#noteCancel'); if(cancel) cancel.onclick = ()=>{ editId = null; draw(); };
    w.querySelector('#noteSave').onclick = ()=>{
      const t = ta.value.trim(); if(!t){ ta.focus(); return; }
      if(editId){ const n = notesList().find(x=>x.id === editId); if(n){ n.text = t; n.ts = Date.now(); } editId = null; }
      else{ const n = { id:'n' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), text:t, ts:Date.now() }; if(ctx.page){ n.page = ctx.page; if(ctx.sec) n.sec = ctx.sec; } if(ctx.bm) n.bm = ctx.bm; notesList().unshift(n); }
      saveState(); showToast(L({rur:'Note save ho gaya', en:'Note saved'})); draw();
    };
    w.querySelectorAll('[data-edit]').forEach(b=>{ b.onclick = ()=>{ editId = b.dataset.edit; draw(); w.querySelector('#noteTa').focus(); }; });
    w.querySelectorAll('[data-del]').forEach(b=>{ b.onclick = async ()=>{ if(!(await appConfirm(L({rur:'Yeh note hata dein?', en:'Delete this note?'})))) return; state.notes = notesList().filter(x=>x.id !== b.dataset.del); saveState(); draw(); }; });
  };
  w.onclick = e=>{ if(e.target === w) close(); };
  document.body.appendChild(w); draw();
}
/* "Mere Notes" block for the Mere Pasandeeda screen: every note, newest first; a page note opens that page */
function notesSectionHtml(){
  const list = notesList();
  return `<div class="dw-section"><div class="dw-section-title"><span>📝 ${L({rur:'Mere Notes', en:'My notes'})}</span><span class="dw-count">${list.length}</span></div>
    <button type="button" class="note-add" id="noteAddBtn">＋ ${L({rur:'Naya note likhein', en:'Write a new note'})}</button>
    ${list.map(n=>`<div class="dw-row note-row" data-nid="${n.id}" ${n.page ? `data-page="${n.page}"` : ''}><div class="info"><div class="tr">${n.page ? noteSecName(n) : n.bm ? '⭐ ' + noteEsc((typeof bmResolve === 'function' && bmResolve(n.bm) || {}).title || '') : L({rur:'Note', en:'Note'})}</div><div class="m">${noteEsc(n.text).slice(0, 140)}${n.text.length > 140 ? '…' : ''}</div></div><span class="note-when">${noteWhen(n.ts)}</span></div>`).join('')}</div>`;
}
function wireNotesSection(rerender){
  const add = document.getElementById('noteAddBtn'); if(add) add.onclick = ()=> openNoteBox({}, rerender);
  document.querySelectorAll('.note-row').forEach(r=>{
    r.onclick = ()=>{
      const n = notesList().find(x=>x.id === r.dataset.nid); if(!n) return;
      if(n.page){ if(n.sec === 'tb') renderTarjumaBook(n.page); else if(n.sec === 'tf') renderTafseerPage(n.page); else renderQuranReader(n.page); } else openNoteBox(n.bm ? { bm:n.bm, title:(bmResolve(n.bm) || {}).title } : {}, rerender);
    };
  });
}
/* ============================================================
   DAILY CARD on Home: today's Du'a and Hadees (changes every day), "another" button, share as image
   ============================================================ */
var dailyTab = 'dua', dailyShift = { dua:0, hadees:0 }, dailyDrawnKey = ''; // var: renderHome may call renderDailyCard before this file's top level has run
function dailyPick(kind){
  const list = kind === 'dua' ? DUAS : HADEES, day = Math.floor(new Date().setHours(12, 0, 0, 0) / 86400000);
  const i = ((day * (kind === 'dua' ? 7 : 5) + dailyShift[kind]) % list.length + list.length) % list.length;
  return list[i];
}
function renderDailyCard(){
  const el = document.getElementById('dailyCard'); if(!el || !dailyShift) return; // not initialised yet (called from the first renderHome)
  if(state.dailyOff || state.dailyHideDay === dayKey(new Date()) || !uiGateOpen(30)){ el.style.display = 'none'; el.innerHTML = ''; dailyDrawnKey = ''; return; }
  el.style.display = '';
  { const list = document.getElementById('timesList'); if(list && el.parentElement !== list) list.appendChild(el); }
  const key = dayKey(new Date()) + dailyTab + dailyShift[dailyTab] + (isEn() ? 'e' : 'u');
  if(key === dailyDrawnKey && el.firstChild) return;
  dailyDrawnKey = key;
  const x = dailyPick(dailyTab), en = isEn(), isDua = dailyTab === 'dua';
  const wasHidden = !el.firstChild;
  el.innerHTML = `<div class="dc-top"><div class="dc-tabs"><button type="button" class="${isDua ? 'on' : ''}" data-dt="dua">🤲 ${L({rur:'Aaj ki Du\'a', en:'Today\'s Du\'a'})}</button><button type="button" class="${isDua ? '' : 'on'}" data-dt="hadees">📜 ${L({rur:'Aaj ki Hadees', en:'Today\'s Hadees'})}</button></div><button type="button" class="dc-x" id="dcClose" aria-label="${L({rur:'Band karein', en:'Close'})}"><svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/></svg></button></div>
    <div class="dc-body">
      ${isDua ? `<div class="dc-title">${en && x.ent ? x.ent : x.title}</div><div class="dc-ar" dir="rtl">${x.arabic}</div><div class="dc-tr">${x.translit}</div><div class="dc-m">${en && x.enm ? x.enm : x.meaning}</div><div class="dc-ref">${x.ref || ''}</div>`
        : `<div class="dc-m dc-h">${en && x.en ? x.en : x.txt}</div><div class="dc-ref">${x.src}</div>`}
    </div>
    <div class="dc-dots" aria-hidden="true"><i class="${isDua ? 'on' : ''}"></i><i class="${isDua ? '' : 'on'}"></i></div>
    <div class="dc-btns"><button type="button" id="dcMore">🔄 ${L({rur:'Doosri', en:'Another'})}</button><button type="button" id="dcShare">📤 ${L({rur:'Share', en:'Share'})}</button></div>`;
  if(wasHidden){ el.classList.remove('dc-in'); void el.offsetWidth; el.classList.add('dc-in'); } else { const bd = el.querySelector('.dc-body'); bd.classList.add('dc-swap'); }
  el.querySelectorAll('[data-dt]').forEach(b=>{ b.onclick = ()=>{ if(dailyTab === b.dataset.dt) return; dailyTab = b.dataset.dt; renderDailyCard(); }; });
  document.getElementById('dcClose').onclick = ()=>{ state.dailyHideDay = dayKey(new Date()); saveState(); el.classList.add('dc-out'); setTimeout(()=>{ el.classList.remove('dc-out', 'dc-in'); renderDailyCard(); }, document.body.classList.contains('calm') ? 0 : 280); };
  document.getElementById('dcMore').onclick = ()=>{ dailyShift[dailyTab]++; renderDailyCard(); };
  document.getElementById('dcShare').onclick = ()=>{
    openCardShareChooser(isDua
      ? { kind:L({rur:'Aaj ki Du\'a', en:'Today\'s Du\'a'}), arabic:x.arabic, title:en && x.ent ? x.ent : x.title, sub:x.translit, body:en && x.enm ? x.enm : x.meaning, foot:(x.ref || '') + ' · Waqt24' }
      : { kind:L({rur:'Aaj ki Hadees', en:'Today\'s Hadees'}), body:en && x.en ? x.en : x.txt, foot:x.src + ' · Waqt24' });
  };
}
renderDailyCard();
setTimeout(()=>{ renderDailyCard(); }, 30100); // the card first appears 30 seconds after the app opens

/* swipe the card sideways to flip between Du'a and Hadees; the text area scrolls up and down when a passage is long */
(function(){
  const el = document.getElementById('dailyCard'); if(!el) return;
  let x0 = null, y0 = 0;
  el.addEventListener('touchstart', e=>{ if(e.target.closest('button')){ x0 = null; return; } x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive:true });
  el.addEventListener('touchend', e=>{
    if(x0 === null) return; const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0; x0 = null;
    if(Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    const want = dx < 0 ? 'hadees' : 'dua'; if(want !== dailyTab){ dailyTab = want; renderDailyCard(); }
  });
})();
/* ============================================================
   RAMZAN MODE: while it is Ramzan, a bar on Home counts down to Sehri end / Iftar and shows the roza count with a one-tap Roza switch.
   The Ramzan screen gets the same live card plus two optional reminders (Sehri, Taraweeh).
   ============================================================ */
function isRamzanNow(d){ return gregorianToHijri(d || new Date()).month === 9; }
/* what is next: Sehri ends (at Fajr) -> Iftar (Maghrib) -> tomorrow's Sehri */
function ramzanNext(now){
  const find = (d, k)=> buildSchedule(d).find(x=>x.key === k);
  const today = find(now, 'sehri'), iftar = find(now, 'iftar');
  if(today && now < today.end) return { kind:'sehri', at:today.end, label:L({rur:'Sehri ka waqt khatam hone mein', en:'Sehri ends in'}), ic:'🍽️' };
  if(iftar && now < iftar.start) return { kind:'iftar', at:iftar.start, label:L({rur:'Iftar mein', en:'Iftar in'}), ic:'🌅' };
  const tm = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 12), nt = find(tm, 'sehri');
  return { kind:'sehri', at:nt.end, label:L({rur:'Kal Sehri ka waqt khatam hone mein', en:'Tomorrow Sehri ends in'}), ic:'🍽️' };
}
/* roza kept so far in this Ramzan (state.roza is keyed by day) */
function ramzanRozaCount(now){
  const hd = gregorianToHijri(now), first = hijriToGregorian(1, 9, hd.year); let n = 0;
  for(let d = new Date(first); d <= now; d.setDate(d.getDate() + 1)) if(state.roza[dayKey(d)]) n++;
  return { kept:n, day:hd.day };
}
function ramzanLiveHtml(){
  const now = new Date(), nx = ramzanNext(now), rc = ramzanRozaCount(now), on = !!state.roza[dayKey(now)];
  return `<span class="rz-ic">${nx.ic}</span><span class="rz-txt"><b class="rz-cd" data-at="${nx.at.getTime()}">${nx.label} ${fmtRemain(nx.at - now)}</b><small>${L({rur:'Ramzan', en:'Ramadan'})} ${rc.day} · ${L({rur:'Roze', en:'Roza'})} ${rc.kept}</small></span><button type="button" class="rz-roza${on ? ' on' : ''}" id="rzBarRoza">${on ? '✓ ' + L({rur:'Roza rakha', en:'Fasting'}) : L({rur:'Roza rakha?', en:'Fasting?'})}</button>`;
}
function renderRamzanBar(){
  const old = document.getElementById('ramzanBar');
  if(!isRamzanNow() || !uiGateOpen()){ if(old) old.remove(); return; }
  const list = document.getElementById('timesList'); if(!list) return;
  const bar = old || document.createElement('div');
  bar.id = 'ramzanBar'; bar.className = 'rz-bar'; bar.innerHTML = ramzanLiveHtml();
  if(!old) list.prepend(bar);
  document.getElementById('rzBarRoza').onclick = ()=>{ const k = dayKey(new Date()); state.roza[k] = !state.roza[k]; saveState(); renderRamzanBar(); };
}
function ramzanBarTick(){
  document.querySelectorAll('.rz-cd[data-at]').forEach(el=>{
    const at = +el.dataset.at; if(Date.now() >= at){ renderRamzanBar(); const c = document.getElementById('rzNowCard'); if(c) c.innerHTML = ramzanLiveHtml(); return; }
    const t = el.textContent.replace(/ \d.*$/, '') + ' ' + fmtRemain(at - Date.now()); if(el.textContent !== t) el.textContent = t;
  });
}
setInterval(ramzanBarTick, 5000);
/* reminders for a given day: Sehri (30 min before it ends) and Taraweeh (20 min after Isha starts) */
function ramzanReminders(day){
  if(!isRamzanNow(day)) return [];
  const out = [], sch = buildSchedule(day), n = state.notif || {};
  const sehri = sch.find(x=>x.key === 'sehri'), isha = sch.find(x=>x.key === 'isha');
  if(n.rzSehri && sehri) out.push({ at:new Date(sehri.end.getTime() - 30 * 60000), title:'🍽️ ' + L({rur:'Sehri ka waqt khatam hone wala hai', en:'Sehri is about to end'}), body:L({rur:'30 minute baaqi hain.', en:'30 minutes left.'}), key:'rzs' + dayKey(day) });
  if(n.rzTaraweeh && isha) out.push({ at:new Date(isha.start.getTime() + 20 * 60000), title:'🌙 ' + L({rur:'Taraaweeh ka waqt', en:'Time for Taraweeh'}), body:L({rur:'Isha ke baad Taraaweeh padh lein.', en:'Pray Taraweeh after Isha.'}), key:'rzt' + dayKey(day) });
  return out;
}
/* toggles + live card, drawn at the top of the Ramzan screen */
function ramzanScreenTopHtml(){
  const n = state.notif || {};
  return `<div class="rz-bar rz-card" id="rzNowCard">${ramzanLiveHtml()}</div>
    <div class="rz-opts">
      <div class="tasbeeh-sound-toggle">🍽️ ${L({rur:'Sehri ka reminder (30 min pehle)', en:'Sehri reminder (30 min before)'})}<div class="roza-mini ${n.rzSehri ? 'on' : ''}" data-rzn="rzSehri"><div class="roza-mini-knob"></div></div></div>
      <div class="tasbeeh-sound-toggle">🌙 ${L({rur:'Taraaweeh ka reminder', en:'Taraweeh reminder'})}<div class="roza-mini ${n.rzTaraweeh ? 'on' : ''}" data-rzn="rzTaraweeh"><div class="roza-mini-knob"></div></div></div>
    </div>`;
}
function wireRamzanScreenTop(){
  const roza = document.getElementById('rzBarRoza'); if(roza) roza.onclick = ()=>{ const k = dayKey(new Date()); state.roza[k] = !state.roza[k]; saveState(); document.getElementById('rzNowCard').innerHTML = ramzanLiveHtml(); wireRamzanScreenTop(); renderRamzan(); };
  document.querySelectorAll('[data-rzn]').forEach(b=>{
    b.onclick = async ()=>{
      const k = b.dataset.rzn; state.notif[k] = !state.notif[k];
      if(state.notif[k] && 'Notification' in window && Notification.permission === 'default'){ try{ await Notification.requestPermission(); }catch(e){} }
      saveState(); b.classList.toggle('on', !!state.notif[k]); if(typeof scheduleNotifications === 'function') scheduleNotifications(true);
    };
  });
}
/* ===== TARJUMA BOOK and TAFSEER (both open from "Qur'an Majeed") =====
   TARJUMA BOOK: the translation of each Mushaf page as a book page of exactly 15 ruled lines, in Hinglish, اردو, हिन्दी or English.
   A Mushaf page whose translation is longer than 15 lines runs on to the next sheet ("Part 2/3"); Next/Back (and a swipe) turn
   sheet by sheet and then page by page. Page numbers are the Mushaf's own. The tint colours and the night page are the reader's.
   TAFSEER: "Aasan Tarjuma Quran" by Mufti Taqi Usmani (Urdu), 1976 scanned pages in /tafseer/, opened by surah or para. */
var TB_ROWS = 15, tbSt = { tok:0, page:2, sheet:0, total:1, lang:'' };
const tbLastPage = ()=> QA_PAGE_FIRST.length;
const tbClamp = p => Math.max(2, Math.min(tbLastPage(), p | 0 || 2));
/* The book is laid out per surah: each surah starts on a fresh page and its text runs on page after page (15 ruled lines each),
   so a surah never leaves half-empty pages the way the Mushaf's own page breaks would. Mushaf page numbers are kept for marks, notes and the Mushaf button. */
let TB_UNITS = null;
function tbUnits(){ return TB_UNITS || (TB_UNITS = QURAN_SURAHS.map(x=>({ p:x.page, s:x.n }))); }
function tbUnitIdx(p, sn){ if(sn) return Math.max(0, Math.min(113, sn - 1)); const ids = trPageAyahs(p); return ids.length ? qaSurahAyah(ids[0]).s - 1 : Math.max(0, quranSurahOf(p).n - 1); }
const tbUnitIds = (p, sn)=> Array.from({ length:QA_COUNTS[sn - 1] }, (_, i)=> QA_CUM[sn - 1] + i + 1);
const TB_HI = "अल-फ़ातिहा,अल-बक़रह,आल-ए-इमरान,अन-निसा,अल-माइदह,अल-अनआम,अल-आराफ़,अल-अनफ़ाल,अत-तौबह,यूनुस,हूद,यूसुफ़,अर-रअद,इब्राहीम,अल-हिज्र,अन-नहल,बनी इसराईल,अल-कहफ़,मरयम,ता-हा,अल-अंबिया,अल-हज,अल-मूमिनून,अन-नूर,अल-फ़ुरक़ान,अश-शुअरा,अन-नम्ल,अल-क़सस,अल-अनकबूत,अर-रूम,लुक़मान,अस-सज्दह,अल-अहज़ाब,सबा,फ़ातिर,या-सीन,अस-साफ़्फ़ात,सॉद,अज़-ज़ुमर,ग़ाफ़िर,हा-मीम अस-सज्दह,अश-शूरा,अज़-ज़ुख़रुफ़,अद-दुख़ान,अल-जासिया,अल-अहक़ाफ़,मुहम्मद,अल-फ़तह,अल-हुजुरात,क़ॉफ़,अज़-ज़ारियात,अत-तूर,अन-नज्म,अल-क़मर,अर-रहमान,अल-वाक़िअह,अल-हदीद,अल-मुजादलह,अल-हश्र,अल-मुमतहिनह,अस-सफ़,अल-जुमुअह,अल-मुनाफ़िक़ून,अत-तग़ाबुन,अत-तलाक़,अत-तहरीम,अल-मुल्क,अल-क़लम,अल-हाक़्क़ह,अल-मआरिज,नूह,अल-जिन्न,अल-मुज़म्मिल,अल-मुदस्सिर,अल-क़ियामह,अद-दहर,अल-मुरसलात,अन-नबा,अन-नाज़िआत,अबस,अत-तकवीर,अल-इंफ़ितार,अल-मुतफ़्फ़िफ़ीन,अल-इंशिक़ाक़,अल-बुरूज,अत-तारिक़,अल-अअला,अल-ग़ाशियह,अल-फ़ज्र,अल-बलद,अश-शम्स,अल-लैल,अज़-ज़ुहा,अल-इंशिराह,अत-तीन,अल-अलक़,अल-क़द्र,अल-बय्यिनह,अज़-ज़िलज़ाल,अल-आदियात,अल-क़ारिअह,अत-तकासुर,अल-अस्र,अल-हुमज़ह,अल-फ़ील,क़ुरैश,अल-माऊन,अल-कौसर,अल-काफ़िरून,अन-नस्र,अल-लहब,अल-इख़लास,अल-फ़लक़,अन-नास".split(',');
/* surah name in the language of the page: Urdu in Urdu script (ة written ہ), Hindi in Devanagari, Hinglish/English as written in Latin */
function tbSurahName(n, lang){
  const x = QURAN_SURAHS[n-1] || {};
  if(lang === 'ur') return String(x.ar || '').replace(/ة/g, 'ہ');
  if(lang === 'hi') return TB_HI[n-1] || x.name || '';
  return x.name || '';
}
/* the book has its own language, Hinglish by default (separate from the Mushaf's Tarjuma panel) */
const tbLang = ()=> TR_LANGS.some(l=>l.k === state.tbLang) ? state.tbLang : 'rom';
const tbIsUr = ()=> tbLang() === 'ur';
/* line height: fills the screen under the controls; A−/A+ change it by 3px a step */
function tbLh(){
  const base = Math.max(26, Math.min(42, Math.floor((innerHeight - 330) / TB_ROWS)));
  return Math.max(22, Math.min(64, base + 3 * (state.tbZ || 0)));
}
/* text size from the line height: Urdu (Nastaliq) and Devanagari need more air than Latin */
function tbFs(lh){ const l = tbLang(); return Math.round(lh / (l === 'ur' ? 3.5 : l === 'hi' ? 1.85 : 1.72) * 10) / 10; }
function tbBookSvg(kind){
  const c = 'var(--accent)', lines = [0,1,2,3].map(i=>{ const y = 15 + i * 6; return `<line x1="9" y1="${y}" x2="27" y2="${y+1.5}" stroke="${c}" stroke-width="2.6" stroke-linecap="round"/><line x1="37" y1="${y+1.5}" x2="55" y2="${y}" stroke="${kind === 'tafseer' ? 'currentColor' : c}" stroke-width="2.6" stroke-linecap="round"/>`; }).join('');
  return `<svg viewBox="0 0 64 48" width="48" height="36" aria-hidden="true"><path d="M32 9 C24 4 12 4 4 7 V43 C12 40 24 40 32 45 C40 40 52 40 60 43 V7 C52 4 40 4 32 9 Z" fill="var(--card2)" stroke="var(--sub)" stroke-width="2" stroke-linejoin="round"/><line x1="32" y1="9" x2="32" y2="45" stroke="var(--sub)" stroke-width="2"/>${lines}</svg>`;
}
/* the section on the Qur'an home screen */
/* the page number in the Agla/Pichla bar is a button: tap it, type a page, Go */
function pageJumpWire(min, max, cur, go, curFn){
  const pos = document.querySelector('.pn-bar .pn-pos'); if(!pos) return;
  pos.classList.add('pn-pos-btn'); pos.setAttribute('role', 'button'); pos.setAttribute('tabindex', '0'); pos.title = L({rur:'Page par jaayein', en:'Go to page'});
  const open = ()=>{
    const old = document.getElementById('pageJump'); if(old) old.remove();
    const w = document.createElement('div'); w.id = 'pageJump'; w.className = 'note-ov';
    w.innerHTML = `<div class="note-sheet pj-sheet" role="dialog"><div class="note-head"><b>${L({rur:'Page par jaayein', en:'Go to page'})}</b><button type="button" class="note-x" aria-label="Close">✕</button></div>
      <div class="pj-row"><input type="number" inputmode="numeric" id="pjIn" min="${min}" max="${max}" value="${curFn ? curFn() : cur}"><span>/ ${max}</span><button type="button" class="note-save" id="pjGo">${L({rur:'Jaayein', en:'Go'})}</button></div></div>`;
    document.body.appendChild(w);
    const close = ()=> w.remove(), inp = w.querySelector('#pjIn');
    const doGo = ()=>{ const v = parseInt(inp.value); if(v >= min && v <= max){ close(); go(v); } else { inp.focus(); inp.select(); } };
    w.querySelector('.note-x').onclick = close; w.onclick = e=>{ if(e.target === w) close(); };
    w.querySelector('#pjGo').onclick = doGo; inp.onkeydown = e=>{ if(e.key === 'Enter') doGo(); };
    inp.focus(); inp.select();
  };
  pos.onclick = open; pos.onkeydown = e=>{ if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); open(); } };
}
/* bookmarks (state.tbMarks: Mushaf page numbers; state.tfMarks: Tafseer pages) and sharing */
function bkMarks(sec){ const k = sec === 'tf' ? 'tfMarks' : 'tbMarks'; return state[k] || (state[k] = []); }
function bkHas(sec, p){ return bkMarks(sec).includes(p); }
function bkLabel(sec, p){ return bkHas(sec, p) ? L({rur:'Nishaan laga hai', en:'Bookmarked'}) : L({rur:'Nishaan lagayein', en:'Bookmark'}); }
function bkToggle(sec, p){ const m = bkMarks(sec), i = m.indexOf(p); if(i >= 0) m.splice(i, 1); else { m.push(p); m.sort((x, y)=>x - y); } saveState(); showToast(i >= 0 ? L({rur:'Nishaan hata diya', en:'Bookmark removed'}) : L({rur:'Nishaan laga diya', en:'Bookmarked'})); }
async function tbShareText(){
  const flow = document.getElementById('tbFlow'); if(!flow) return;
  const ays = [...flow.querySelectorAll('.tb-ay')].map(e=>e.textContent.replace(/[\uFD3E\uFD3F]/g, '').replace(/\s+/g, ' ').trim());
  const sn = QURAN_SURAHS[(tbSt.surah || quranSurahOf(tbSt.page).n) - 1], text = `${sn.n}. ${sn.name} · Page ${tbSt.page} (Waqt24)\n\n` + ays.join('\n');
  if(navigator.share){ try{ await navigator.share({ text, title:`${sn.name} · Page ${tbSt.page}` }); return; }catch(e){ if(e && e.name === 'AbortError') return; } }
  try{ await navigator.clipboard.writeText(text); showToast(L({rur:'Page ka matan copy ho gaya', en:'Page text copied'})); }catch(e){ showToast(L({rur:'Share nahi ho saka', en:'Could not share'})); }
}
async function tfShareImage(n){
  try{
    const img = new Image(); img.src = tfImg(n); await img.decode();
    const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight;
    const x = c.getContext('2d'); x.fillStyle = tfTintBg(); x.fillRect(0, 0, c.width, c.height); x.drawImage(img, 0, 0);
    const blob = await new Promise(r=> c.toBlob(r, 'image/jpeg', 0.9)), name = `tafseer-page-${n}.jpg`, file = new File([blob], name, { type:'image/jpeg' });
    const s = tfSurahOf(n), text = `Tafseer · Page ${n}${s ? ' · ' + s + '. ' + QURAN_SURAHS[s - 1].name : ''} (Waqt24)`;
    if(navigator.canShare && navigator.canShare({ files:[file] })){ await navigator.share({ files:[file], title:text, text }); return; }
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=> URL.revokeObjectURL(a.href), 2000); showToast(L({rur:'Page download ho gaya', en:'Page downloaded'}));
  }catch(e){ if(!(e && e.name === 'AbortError')) showToast(L({rur:'Share nahi ho saka', en:'Could not share'})); }
}
function tbHomeHtml(){
  return `<div class="section-title" style="margin:6px 14px 8px;">${L({rur:'Tarjuma aur Tafseer', en:'Translation and Tafseer'})}</div>
    <div class="qbook-row">
      <button class="qbook" id="qhTbook">${tbBookSvg('tarjuma')}<b>${L({rur:'Tarjuma', en:'Translation'})}</b><span>${L({rur:'15 line ka safha, 4 zubaan', en:'15-line pages, 4 languages'})}</span></button>
      <button class="qbook" id="qhTafseer">${tbBookSvg('tafseer')}<b>${L({rur:'Tafseer', en:'Tafseer'})}</b><span>${L({rur:'Aasan Tarjuma · Urdu', en:'Aasan Tarjuma · Urdu'})}</span></button>
    </div>
    ${bkMarks('tb').length || bkMarks('tf').length ? `<div class="bk-chips"><span>🔖</span>${bkMarks('tb').map(p=>`<button type="button" data-bk="tb" data-p="${p}">📘 ${p}</button>`).join('')}${bkMarks('tf').map(p=>`<button type="button" data-bk="tf" data-p="${p}">📕 ${p}</button>`).join('')}</div>` : ''}`;
}
function tbHomeWire(){
  document.querySelectorAll('.bk-chips [data-bk]').forEach(b=>{ b.onclick = ()=>{ const p = +b.dataset.p; if(b.dataset.bk === 'tf') renderTafseerPage(p); else renderTarjumaBook(p, { page:p }); }; });
  const a = document.getElementById('qhTbook'), b = document.getElementById('qhTafseer');
  if(a) a.onclick = ()=> renderTarjumaBook(state.tbPage || 2, state.tbAbs ? { abs:state.tbAbs } : 0, state.tbSurah);
  if(b) b.onclick = ()=> renderTafseerIndex();
}
/* HTML of one Mushaf page in one language: surah headings take two lines, the text runs on with the ayah numbers */
async function tbBuild(page, lang, surah){
  const ur = lang === 'ur', ids = surah ? tbUnitIds(page, surah) : trPageAyahs(page), surahs = [...new Set(ids.map(x=>qaSurahAyah(x).s))];
  const data = await Promise.all(surahs.map(s=>trLoad(s, lang)));
  const open = '<p class="tb-p"' + (ur ? ' dir="rtl" lang="ur"' : lang === 'hi' ? ' lang="hi"' : '') + '>';
  let html = open;
  ids.forEach(x=>{
    const r = qaSurahAyah(x), t = (data[surahs.indexOf(r.s)][r.a-1] || '').replace(/</g, '&lt;').replace(/\uFDFA/g, '<span class="tb-sw">\uFDFA</span>');
    if(r.a === 1){
      if(html.endsWith(open)) html = html.slice(0, -open.length); else html += '</p>';
      html += `<div class="tb-surah" data-a="${x}"><span${ur ? ' dir="rtl"' : ''}>${ur ? 'سورۃ ' + tbSurahName(r.s, lang) + ' <bdi dir="ltr">(' + trpDigits(r.s, true) + ')</bdi>' : r.s + '. ' + tbSurahName(r.s, lang)}</span></div>${open}`;
    }
    html += `<span class="tb-ay" data-a="${x}">${t} <i class="tb-n" dir="ltr">&#xFD3E;${trpDigits(r.a, ur)}&#xFD3F;</i></span> `;
  });
  return html + '</p>';
}
function renderTarjumaBook(page, sheet, surah){
  page = tbClamp(page); const lang = tbLang(), lh = tbLh(), ur = lang === 'ur';
  const ui = tbUnitIdx(page, surah), sn = tbUnits()[ui].s, ids = tbUnitIds(page, sn);
  if(sheet && typeof sheet === 'object' && sheet.page && !sheet.abs) sheet = { abs: ids.find(x=> qaAyahPage(x) >= sheet.page) || ids[0] };   /* opened by Mushaf page: land on its first ayah in this surah */
  if(qa.on && !tbSt.following && ids.length && !ids.includes(qa.abs)) tbAudioTo(sheet && sheet.abs ? sheet.abs : ids[0], page);   /* opening another surah by hand moves a playing recitation with it */
  tbSt.surah = sn; tbSt.ui = ui; tbSt.lang = lang; tbSt.sheet = 0; tbSt.total = 1; state.tbSurah = sn; qLastSet('tarjuma'); saveState();
  setNavCtx([0, 1, 2], 1, ()=>{}, null); __navCtx.rtl = false; __navCtx.turn = true;
  document.getElementById('detailTitle').textContent = L({rur:'Tarjuma', en:'Translation'});
  const para = quranParaOf(page), mz = quranManzilOf(page);
  const night = quranNightOn(), tint = QURAN_TINTS.find(x=>x.k === (state.quranTint || ''));
  const pageCss = night ? '' : tint && tint.c ? `--tbbg:${tint.c};--tbac:${tint.a};` : '';
  document.getElementById('detailBody').innerHTML = `
    <div class="quran-index-row tb-top">
      <button type="button" class="quran-index-btn qi-short" id="tbParaBtn"><span>📚</span> ${L({rur:'Paara', en:'Para'})} ${para.n}</button>
      <button type="button" class="quran-index-btn${ur ? ' tb-urname' : ''}" id="tbSurahBtn"${ur ? ' dir="rtl" lang="ur"' : ''}><span>📜</span> ${ur ? '<bdi dir="ltr">' + trpDigits(sn, true) + '</bdi> ' + tbSurahName(sn, lang) : sn + '. ' + tbSurahName(sn, lang)}</button>
      <button type="button" class="quran-index-btn qi-short" id="tbManzilBtn"><span>🏷️</span> ${L({rur:'Manzil', en:'Manzil'})} ${mz.n}</button>
    </div>
    <div class="tb-sheet${night ? ' night' : ''}" id="tbSheet" style="--lh:${lh}px;--fs:${tbFs(lh)}px;${pageCss}">
      <div class="tb-view${ur ? ' ur' : ''}" id="tbView"><div class="tb-rules">${Array.from({length:TB_ROWS},(_, k)=>`<i style="--k:${k+1}"></i>`).join('')}</div><div class="tb-flow" id="tbFlow"><div class="tb-msg">${trpMsg()}</div></div></div>
      <div class="tb-foot"><span id="tbPart"></span></div>
    </div>
    <div class="pn-bar tb-bar"><button class="pn-btn pn-prev" id="pnPrevBtn"><span class="pn-ic">⬅️</span>${isEn() ? 'Previous' : 'Pichla'}</button><span class="pn-pos" id="tbPos"></span><button class="pn-btn pn-next" id="pnNextBtn">${isEn() ? 'Next' : 'Agla'}<span class="pn-ic">➡️</span></button></div>
    <div class="tb-tools"><div class="tb-langs">${TR_LANGS.map(l=>`<button type="button" data-l="${l.k}" class="${l.k === lang ? 'on' : ''}">${l.n}</button>`).join('')}</div><span class="tb-sz"><button class="quran-tool" type="button" data-z="-1" aria-label="Smaller text">A−</button><button class="quran-tool" type="button" data-z="1" aria-label="Bigger text">A+</button></span></div>
    <div class="quran-tools tb-acts">
      <button class="quran-tool ${bkHas('tb', page) ? 'on' : ''}" id="tbMarkBtn">🔖 ${bkLabel('tb', page)}</button>
      <button class="quran-tool tb-listen" id="tbListenBtn">🎧 ${L({rur:'Tilawat sunein', en:'Listen'})}</button>
      <button class="quran-tool ${notesForPage(page, 'tb').length ? 'on' : ''}" id="tbNoteBtn">📝 ${L({rur:'Note', en:'Note'})}${notesForPage(page, 'tb').length ? ' (' + notesForPage(page, 'tb').length + ')' : ''}</button>
      <button class="quran-tool" id="tbTintBtn">🎨 ${L({rur:'Rang', en:'Tint'})}</button>
      <button class="quran-tool ${night ? 'on' : ''}" id="tbNightBtn">🌙 ${L({rur:'Andhera', en:'Night'})}</button>
      <button class="quran-tool" id="tbShareBtn">📤 ${L({rur:'Share', en:'Share'})}</button>
      <button class="quran-tool ${state.quranTurnSound ? 'on' : ''}" id="tbSoundBtn">${state.quranTurnSound ? '🔈' : '🔇'} ${L({rur:'Awaaz', en:'Sound'})}</button>
      <button class="quran-tool" id="tbMushafBtn">${tbBookSvg('tarjuma').replace('width="48" height="36"', 'width="22" height="17"')} ${L({rur:'Mushaf', en:'Mushaf'})}</button>
    </div>
    <div class="q-tints" id="tbTints" hidden>${QURAN_TINTS.map(t=>`<button type="button" class="q-tint${(state.quranTint || '') === t.k ? ' active' : ''}" data-t="${t.k}" style="--tc:${t.c || '#ffffff'}" aria-label="${t.n}" title="${t.n}"></button>`).join('')}</div>`;
  const $ = id => document.getElementById(id);
  document.querySelector('.tb-langs').onclick = e=>{ const b = e.target.closest('button'); if(!b) return; state.tbLang = b.dataset.l; saveState(); renderTarjumaBook(tbSt.page, tbSt.sheet, tbSt.surah); };
  document.querySelector('.tb-sz').onclick = e=>{ const b = e.target.closest('button'); if(!b) return; state.tbZ = Math.max(-3, Math.min(8, (state.tbZ || 0) + (+b.dataset.z))); saveState(); renderTarjumaBook(tbSt.page, tbSt.sheet, tbSt.surah); };
  $('tbTintBtn').onclick = ()=>{ $('tbTints').hidden = !$('tbTints').hidden; };
  $('tbTints').onclick = e=>{ const b = e.target.closest('.q-tint'); if(!b) return; state.quranTint = b.dataset.t; if(b.dataset.t) state.quranNight = false; saveState(); renderTarjumaBook(tbSt.page, tbSt.sheet, tbSt.surah); $('tbTints').hidden = false; quranTintPlayer(); };
  $('tbNightBtn').onclick = ()=>{ state.quranNight = !quranNightOn(); saveState(); renderTarjumaBook(tbSt.page, tbSt.sheet, tbSt.surah); };
  $('tbListenBtn').onclick = ()=>{ if(qa.on) qaStop(); else tbPlayFrom(tbFirstAyah()); };
  quranTintPlayer();
  [['tbParaBtn', 'para'], ['tbSurahBtn', 'surah'], ['tbManzilBtn', 'manzil']].forEach(([id, k])=>{ $(id).onclick = ()=>{ qiOpener = (p, n)=> renderTarjumaBook(p, { page:p }, n ? +n : undefined); renderQuranIndex(k); }; });
  $('tbMarkBtn').onclick = ()=>{ bkToggle('tb', tbSt.page); tbHdrSync(); };
  $('tbShareBtn').onclick = ()=> tbShareText();
  $('tbNoteBtn').onclick = ()=> openNoteBox({ page:tbSt.page, sec:'tb' }, tbHdrSync);
  $('tbFlow').onclick = e=>{ const ay = e.target.closest('.tb-ay'); if(ay) tbPlayFrom(+ay.dataset.a); };
  $('tbSoundBtn').onclick = ()=>{ state.quranTurnSound = !state.quranTurnSound; saveState(); renderTarjumaBook(tbSt.page, tbSt.sheet, tbSt.surah); if(state.quranTurnSound) playPageSound(); };
  $('tbMushafBtn').onclick = ()=> renderQuranReader(tbSt.page);
  pageJumpWire(2, tbLastPage(), page, v=> renderTarjumaBook(v, { page:v }), ()=> tbSt.page);
  $('pnPrevBtn').onclick = tbPrev; $('pnNextBtn').onclick = tbNext;
  tbLoad(page, sheet, sn);
  { const nu = tbUnits()[ui + 1]; if(nu) tbBuild(nu.p, lang, nu.s).catch(()=>{}); }   /* the next page's translation is fetched while this one is read */
}
async function tbLoad(page, sheet, surah){
  const my = ++tbSt.tok, lang = tbLang(); let html;
  try{ html = await tbBuild(page, lang, surah); }
  catch(e){
    const f = document.getElementById('tbFlow'); if(my !== tbSt.tok || !f) return;
    f.innerHTML = `<div class="tb-msg">${L({rur:'Tarjuma load nahi hua. Internet check karein.', en:'Could not load the translation. Check your internet connection.'})}<br><button type="button" class="tp-retry" id="tbRetry">${L({rur:'Dobara koshish', en:'Retry'})}</button></div>`;
    document.getElementById('tbRetry').onclick = ()=> renderTarjumaBook(page, sheet, surah); return;
  }
  const flow = document.getElementById('tbFlow'); if(my !== tbSt.tok || !flow) return;
  flow.innerHTML = html;
  if(lang === 'ur' && document.fonts && document.fonts.ready){ try{ await document.fonts.ready; }catch(e){} if(my !== tbSt.tok || !document.getElementById('tbFlow')) return; }
  tbMeasure(sheet); tbSt.following = false; tbSync();
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(()=>{ if(my === tbSt.tok){ tbMeasure(tbSt.sheet); tbSync(); } });
}
/* how many 15-line sheets the page needs, and show sheet n of them */
function tbMeasure(sheet){
  const flow = document.getElementById('tbFlow'), sh = document.getElementById('tbSheet'); if(!flow || !sh) return;
  const lh = parseFloat(getComputedStyle(sh).getPropertyValue('--lh')), H = lh * TB_ROWS;
  const total = Math.max(1, Math.ceil((flow.scrollHeight - 3) / H));
  tbSt.total = total;
  if(sheet && typeof sheet === 'object'){   /* a sheet given by an ayah: the one that holds it */
    const el = sheet.abs && flow.querySelector(`.tb-ay[data-a="${sheet.abs}"]`), rs = el && el.getClientRects();
    sheet = rs && rs.length ? Math.floor((rs[0].top - flow.getBoundingClientRect().top + 2) / H) : 0;
  }
  tbSt.sheet = sheet === 'last' ? total - 1 : Math.max(0, Math.min(total - 1, sheet | 0));
  flow.style.transform = `translateY(${-tbSt.sheet * H}px)`;
  const first = tbSt.ui <= 0 && tbSt.sheet === 0, last = tbSt.ui >= tbUnits().length - 1 && tbSt.sheet >= total - 1;
  const p = document.getElementById('pnPrevBtn'), n = document.getElementById('pnNextBtn'); if(p) p.disabled = first; if(n) n.disabled = last;
  const part = document.getElementById('tbPart'); if(part) part.textContent = total > 1 ? `${L({rur:'Hissa', en:'Part'})} ${tbSt.sheet + 1}/${total}` : '';
  state.tbSheet = tbSt.sheet;
  const fa = tbFirstAyah(); if(fa){ tbSt.page = qaAyahPage(fa); state.tbPage = tbSt.page; state.tbAbs = fa; saveState(); }
  tbHdrSync();
}
/* the bar above the book (Para / Manzil), the page label and the bookmark / note buttons follow the ayahs on the open sheet */
function tbHdrSync(){
  const pg = tbSt.page, $ = id => document.getElementById(id); if(!$('tbSheet')) return;
  const pb = $('tbParaBtn'), mb = $('tbManzilBtn');
  if(pb) pb.innerHTML = `<span>📚</span> ${L({rur:'Paara', en:'Para'})} ${quranParaOf(pg).n}`;
  if(mb) mb.innerHTML = `<span>🏷️</span> ${L({rur:'Manzil', en:'Manzil'})} ${quranManzilOf(pg).n}`;
  const pos = $('tbPos'); if(pos) pos.textContent = `${L({rur:'Page', en:'Page'})} ${pg}${tbSt.total > 1 ? ' · ' + (tbSt.sheet + 1) + '/' + tbSt.total : ''}`;
  const mk = $('tbMarkBtn'); if(mk){ mk.classList.toggle('on', bkHas('tb', pg)); mk.textContent = '🔖 ' + bkLabel('tb', pg); }
  const nb = $('tbNoteBtn'); if(nb){ const c = notesForPage(pg, 'tb').length; nb.classList.toggle('on', c > 0); nb.textContent = '📝 ' + L({rur:'Note', en:'Note'}) + (c ? ' (' + c + ')' : ''); }
}
/* move a playing recitation to an ayah (used when the reader turns to another surah or sheet by hand) */
function tbAudioTo(abs, page){
  const was = qa.playing || qa.loading; qa.syncPage = page || qaAyahPage(abs); qa.abs = abs; qa.part = 'a'; qa.exact = true;
  const r0 = qaSurahAyah(abs); qa.bism = r0.a === 1 && qaHasBism(r0.s); qaEls(); qa.cur.pause();
  if(was) qaPlayCurrent(); else { qa.playing = false; qa.loading = false; qa.err = false; qaUI(); }
}
function tbAudioFollowSheet(){
  if(!qa.on || tbSt.following) return;
  const flow = document.getElementById('tbFlow'), sh = document.getElementById('tbSheet'); if(!flow || !sh) return;
  const H = parseFloat(getComputedStyle(sh).getPropertyValue('--lh')) * TB_ROWS, el = flow.querySelector(`.tb-ay[data-a="${qa.abs}"]`), rs = el && el.getClientRects();
  const at = rs && rs.length ? Math.floor((rs[0].top - flow.getBoundingClientRect().top + 2) / H) : -1;
  if(at !== tbSt.sheet){ const fa = tbFirstAyah(); if(fa) tbAudioTo(fa); }
}
function tbNext(){
  if(tbSt.sheet + 1 < tbSt.total){ tbMeasure(tbSt.sheet + 1); tbAudioFollowSheet(); }
  else { const u = tbUnits()[tbSt.ui + 1]; if(u) renderTarjumaBook(u.p, 0, u.s); }
}
function tbPrev(){
  if(tbSt.sheet > 0){ tbMeasure(tbSt.sheet - 1); tbAudioFollowSheet(); }
  else { const u = tbUnits()[tbSt.ui - 1]; if(u) renderTarjumaBook(u.p, 'last', u.s); }
}
/* ---- Urdu tarjuma audio inside the book (no Arabic): plays the Shamshad Ali Khan recording ayah by ayah, highlights the ayah and turns the sheet/page with it ---- */
function tbFirstAyah(){
  const flow = document.getElementById('tbFlow'), sh = document.getElementById('tbSheet');
  const ids = tbUnitIds(tbSt.page, tbSt.surah); if(!flow || !sh) return ids[0];
  const H = parseFloat(getComputedStyle(sh).getPropertyValue('--lh')) * TB_ROWS, fr = flow.getBoundingClientRect().top;
  for(const el of flow.querySelectorAll('.tb-ay')){ const r = el.getClientRects(); const last = r[r.length - 1]; if(last && last.bottom - fr > tbSt.sheet * H + 4) return +el.dataset.a; }
  return ids[0];
}
function tbPlayFrom(abs){
  if(qa.voice !== 'ur'){ tbSt.prevVoice = tbSt.prevVoice || qa.voice; qaSetVoice('ur'); }
  qaEls(); qa.on = true; qa.repCount = 0; qa.syncPage = tbSt.page; qa.part = 'a'; qa.abs = abs; qa.exact = true;
  const r = qaSurahAyah(abs); qa.bism = r.a === 1 && qaHasBism(r.s);
  qa.cur.pause(); qaPlayCurrent();
}
/* the highlight is painted as one band per ruled row (measured from the text), so it never spills across the lines, whatever the font's own box height */
function tbPaintHl(el){
  const flow = document.getElementById('tbFlow'), sh = document.getElementById('tbSheet'); if(!flow || !sh || !el) return;
  const lh = parseFloat(getComputedStyle(sh).getPropertyValue('--lh')), ur = tbLang() === 'ur', fr = flow.getBoundingClientRect();
  const rg = document.createRange(); rg.selectNodeContents(el);
  const rows = new Map();   /* one band per row: the ayah's pieces (text, number marker) are merged */
  [...rg.getClientRects()].forEach(r=>{
    if(r.width < 3 || r.height < 3) return;
    const row = Math.round((r.top + r.height / 2 - fr.top) / lh - .5); if(row < 0) return;
    const o = rows.get(row); if(o){ o.l = Math.min(o.l, r.left); o.r = Math.max(o.r, r.right); } else rows.set(row, { l:r.left, r:r.right });
  });
  rows.forEach((o, row)=>{
    const b = document.createElement('i'); b.className = 'tb-hlb';
    b.style.cssText = `left:${o.l - fr.left - 2}px;width:${o.r - o.l + 4}px;top:${row * lh + (ur ? 0 : 0) + 1.5}px;height:${lh - 3}px;`;
    flow.appendChild(b);
  });
}
function tbSync(){
  const sh = document.getElementById('tbSheet'); if(!sh) { if(!qa.on) tbRestoreVoice(); return; }
  const btn = document.getElementById('tbListenBtn');
  if(btn){ btn.classList.toggle('on', !!qa.on); btn.innerHTML = '🎧 ' + L({rur:'Tilawat sunein', en:'Listen'}); }
  const flow = document.getElementById('tbFlow'); flow.querySelectorAll('.hl').forEach(e=>e.classList.remove('hl')); flow.querySelectorAll('.tb-hlb').forEach(e=>e.remove());
  if(!qa.on){ tbRestoreVoice(); return; }
  const pg = qaAyahPage(qa.abs), asn = qaSurahAyah(qa.abs).s;
  if(asn !== tbSt.surah){
    if(pg >= 2 && pg <= tbLastPage() && !tbSt.following && flow.querySelector('.tb-ay')){
      tbSt.following = true; qa.syncPage = pg; const fwd = pg > tbSt.page;
      const go = ()=> renderTarjumaBook(pg, { abs:qa.abs }, asn);
      if(typeof slideDetail === 'function') slideDetail(fwd ? -1 : 1, go); else go();
      setTimeout(()=>{ if(tbSt.following && tbSt.surah !== asn) go(); }, 900);
    }
    return;
  }
  const el = qa.bism ? flow.querySelector(`.tb-surah[data-a="${qa.abs}"]`) : flow.querySelector(`.tb-ay[data-a="${qa.abs}"]`);
  if(!el) return;
  el.classList.add('hl'); if(el.classList.contains('tb-ay')) tbPaintHl(el);
  const H = parseFloat(getComputedStyle(sh).getPropertyValue('--lh')) * TB_ROWS, rs = el.getClientRects();
  const idx = Math.max(0, Math.min(tbSt.total - 1, Math.floor((rs[0].top - flow.getBoundingClientRect().top + 2) / H)));
  if(idx !== tbSt.sheet){ const dir = idx > tbSt.sheet ? -1 : 1, go = ()=>{ tbMeasure(idx); tbSync(); }; if(typeof slideDetail === 'function') slideDetail(dir, go); else go(); }
}
function tbRestoreVoice(){ if(tbSt.prevVoice){ const v = tbSt.prevVoice; tbSt.prevVoice = null; if(!qa.on) qaSetVoice(v); } }
window.addEventListener('resize', ()=>{ if(document.getElementById('tbSheet')) renderTarjumaBook(tbSt.page, tbSt.sheet, tbSt.surah); });

/* ============================================================ TAFSEER ============================================================ */
const TF_PAGES = 1976;   /* TF_SURAH (first page of each surah) are in 09i-tfdata.js */
const tfImg = n => 'tafseer/p' + String(n).padStart(4, '0') + '.png';
const tfPageList = Array.from({ length: TF_PAGES }, (_, i)=> i + 1);
function tfSurahOf(n){ let r = 0; for(let i = 0; i < TF_SURAH.length; i++) if(TF_SURAH[i] <= n) r = i + 1; return r; }   /* 0 = introduction */
function renderTafseerIndex(){
  document.getElementById('detailTitle').textContent = L({rur:'Tafseer', en:'Tafseer'});
  const cur = state.tfPage || 0, curS = tfSurahOf(cur);
  const intro = `<div class="more-item quran-idx-item ${cur && !curS ? 'on' : ''}" data-pg="1"><div class="ic">📖</div><div class="lbl">${L({rur:'Muqaddima', en:'Introduction'})}<span class="lblSub">${L({rur:"Qur'an ke baare mein", en:'About the Quran'})}</span></div><div class="qi-page">${L({rur:'Page', en:'Page'})} 1</div></div>`;
  const items = QURAN_SURAHS.map((x, i)=>`<div class="more-item quran-idx-item ${curS === x.n ? 'on' : ''}" data-pg="${TF_SURAH[i]}" data-f="${(x.n + ' ' + x.name + ' ' + String(x.name).replace(/^(al|an|ar|as|at|ad|az|ash|adh|ath)-/i, '')).toLowerCase()}"><div class="ic">${x.n}</div><div class="lbl">${x.name}<span class="lblSub ar-font">${x.ar}</span></div><div class="qi-page">${L({rur:'Page', en:'Page'})} ${TF_SURAH[i]}</div></div>`).join('');
  document.getElementById('detailBody').innerHTML = `
    <div class="backup-note">${L({rur:"Aasan Tarjuma Qur'an, Mufti Muhammad Taqi Usmani. Abhi sirf Urdu mein hai. Page tasveer ki shakal mein hain, pehli baar kholne par internet chahiye; jo page ek baar khul gaya woh offline bhi chalta hai.", en:'Aasan Tarjuma Quran by Mufti Muhammad Taqi Usmani, Urdu only for now. Pages are pictures, so they need internet the first time; a page you have opened works offline afterwards.'})}</div>
    <div class="qi-sticky"><div class="search-bar-wrap" style="margin:0 14px 10px;"><input id="tfSearch" type="search" inputmode="search" autocomplete="off" placeholder="${L({rur:'Surah ka naam ya number', en:'Surah name or number'})}"></div></div>
    <div class="more-list" style="padding-top:0;">${intro}${items}</div>
    <div class="quran-jump"><span>${L({rur:'Page par jaayein', en:'Go to page'})}</span><input type="number" id="tfJump" min="1" max="${TF_PAGES}" value="${cur || 1}"><button id="tfJumpBtn">${L({rur:'Jaayein', en:'Go'})}</button></div>`;
  const body = document.getElementById('detailBody');
  body.querySelectorAll('[data-pg]').forEach(el=> el.onclick = ()=> renderTafseerPage(+el.dataset.pg));
  const s = document.getElementById('tfSearch');
  s.oninput = ()=>{ const q = s.value.trim().toLowerCase(); body.querySelectorAll('[data-f]').forEach(el=>{ el.style.display = !q || el.dataset.f.includes(q) ? '' : 'none'; }); };
  const go = ()=>{ const v = parseInt(document.getElementById('tfJump').value); if(v >= 1 && v <= TF_PAGES) renderTafseerPage(v); };
  document.getElementById('tfJumpBtn').onclick = go; document.getElementById('tfJump').onkeydown = e=>{ if(e.key === 'Enter') go(); };
  const on = body.querySelector('.quran-idx-item.on'); if(on) on.scrollIntoView({ block:'center' });
}
function tfTintBg(){ const t = QURAN_TINTS.find(x=>x.k === (state.quranTint || '')); return t && t.c ? t.c : '#ffffff'; }
function renderTafseerPage(n){
  n = Math.max(1, Math.min(TF_PAGES, n | 0 || 1)); state.tfPage = n; qLastSet('tafseer'); saveState();
  setNavCtx(tfPageList, n - 1, (p)=> renderTafseerPage(p), null); __navCtx.rtl = true;   /* an Urdu book turns from the right, like the Mushaf */
  const s = tfSurahOf(n), night = quranNightOn();
  document.getElementById('detailTitle').textContent = `${L({rur:'Tafseer', en:'Tafseer'})} · ${n}/${TF_PAGES}`;
  document.getElementById('detailBody').innerHTML = `
    <div class="quran-index-row">
      <button class="quran-index-btn" id="tfIndexBtn"><span>📜</span> ${s ? s + '. ' + QURAN_SURAHS[s-1].name : L({rur:'Muqaddima', en:'Introduction'})}</button>
    </div>
    <div class="quran-page-wrap tf-wrap${night ? ' night' : ''}" id="tfWrap"><img class="quran-page-img tf-img" src="${tfImg(n)}" alt="Tafseer page ${n}" draggable="false" style="background-color:${night ? '#fff' : tfTintBg()}"></div>
    ${pnBarHtml()}
    <div class="quran-tools">
      <button class="quran-tool ${bkHas('tf', n) ? 'on' : ''}" id="tfMarkBtn">🔖 ${bkLabel('tf', n)}</button>
      <button class="quran-tool ${notesForPage(n, 'tf').length ? 'on' : ''}" id="tfNoteBtn">📝 ${L({rur:'Note', en:'Note'})}${notesForPage(n, 'tf').length ? ' (' + notesForPage(n, 'tf').length + ')' : ''}</button>
      <button class="quran-tool" id="tfTintBtn">🎨 ${L({rur:'Rang', en:'Tint'})}</button>
      <button class="quran-tool ${night ? 'on' : ''}" id="tfNightBtn">🌙 ${L({rur:'Andhera', en:'Night'})}</button>
      <button class="quran-tool" id="tfZoomBtn">🔍 ${L({rur:'Bara karein', en:'Zoom'})}</button>
      <button class="quran-tool" id="tfShareBtn">📤 ${L({rur:'Share', en:'Share'})}</button>
      <button class="quran-tool ${state.quranTurnSound ? 'on' : ''}" id="tfSoundBtn">${state.quranTurnSound ? '🔈' : '🔇'} ${L({rur:'Awaaz', en:'Sound'})}</button>
    </div>
    <div class="q-tints" id="tfTints" hidden>${QURAN_TINTS.map(t=>`<button type="button" class="q-tint${(state.quranTint || '') === t.k ? ' active' : ''}" data-t="${t.k}" style="--tc:${t.c || '#ffffff'}" aria-label="${t.n}" title="${t.n}"></button>`).join('')}</div>`;
  const $ = id => document.getElementById(id);
  $('tfIndexBtn').onclick = ()=> renderTafseerIndex();
  $('tfTintBtn').onclick = ()=>{ $('tfTints').hidden = !$('tfTints').hidden; };
  $('tfTints').onclick = e=>{ const b = e.target.closest('.q-tint'); if(!b) return; state.quranTint = b.dataset.t; if(b.dataset.t) state.quranNight = false; saveState(); renderTafseerPage(n); $('tfTints').hidden = false; quranTintPlayer(); };
  $('tfNightBtn').onclick = ()=>{ state.quranNight = !quranNightOn(); saveState(); renderTafseerPage(n); };
  const wrap = $('tfWrap'), zoom = ()=>{ wrap.classList.toggle('zoomed'); $('tfZoomBtn').classList.toggle('on', wrap.classList.contains('zoomed')); };
  $('tfZoomBtn').onclick = zoom;
  quranTintPlayer();
  $('tfMarkBtn').onclick = ()=>{ bkToggle('tf', n); const b = $('tfMarkBtn'); b.classList.toggle('on', bkHas('tf', n)); b.textContent = '🔖 ' + bkLabel('tf', n); };
  $('tfShareBtn').onclick = ()=> tfShareImage(n);
  $('tfNoteBtn').onclick = ()=> openNoteBox({ page:n, sec:'tf' }, ()=>{ const b = document.getElementById('tfNoteBtn'); if(b){ const c = notesForPage(n, 'tf').length; b.classList.toggle('on', c > 0); b.textContent = '📝 ' + L({rur:'Note', en:'Note'}) + (c ? ' (' + c + ')' : ''); } });
  $('tfSoundBtn').onclick = ()=>{ state.quranTurnSound = !state.quranTurnSound; saveState(); renderTafseerPage(n); if(state.quranTurnSound) playPageSound(); };
  let lastTap = 0; wrap.addEventListener('click', ()=>{ const t = Date.now(); if(t - lastTap < 320) zoom(); lastTap = t; });
  pageJumpWire(1, TF_PAGES, n, v=> renderTafseerPage(v));
  { const im = wrap.querySelector('img'), ready = ()=> wrap.classList.add('ready'); if(im.complete) ready(); else { im.addEventListener('load', ready); im.addEventListener('error', ready); } }
  wirePnBar();
  [n + 1, n - 1, n + 2].forEach(k=>{ if(k >= 1 && k <= TF_PAGES){ const im = new Image(); im.src = tfImg(k); } });
}
navWrap('renderTarjumaBook', 2);
navWrap('renderTafseerIndex', 1);
navWrap('renderTafseerPage', 2);
/* Aasan Tarjuma Quran (Mufti Taqi Usmani): the first page of each surah in the 1976-page scan (the surah's title page where it has one,
   otherwise the page where its text begins). Index n-1 = surah n. Page 1 is the introduction (Muqaddima). */
const TF_SURAH = [36,40,180,244,320,380,442,518,556,629,665,705,751,777,797,815,853,889,929,951,983,1011,1039,1061,1093,1113,1143,1167,1199,1233,1253,1267,1277,1313,1333,1349,1367,1389,1409,1431,1453,1469,1485,1507,1517,1529,1545,1559,1577,1589,1601,1613,1625,1637,1647,1659,1671,1687,1699,1711,1723,1731,1737,1745,1753,1763,1771,1780,1790,1798,1806,1813,1823,1831,1842,1849,1857,1865,1873,1881,1888,1894,1898,1904,1909,1915,1917,1919,1922,1926,1930,1933,1936,1938,1940,1942,1945,1946,1948,1950,1952,1953,1954,1955,1957,1959,1961,1963,1964,1966,1968,1970,1972,1973];
/* ===== Salutation after the name of Allah: "Allah ﷻ" everywhere =====
   Every text on screen is covered: the names, the Qur'an translations (Hinglish / English, Hindi अल्लाह, Urdu اللہ), the quiz and
   all other screens. It is applied to the text of the page as it appears or changes, so nothing needs editing one by one.
   Forms such as Allahu, Allahumma, MashaAllah and the Arabic script of the Mushaf are left as they are. */
const HON_RE = /(\bAllah\b(?!['’])|अल्लाह(?![ऀ-ॿ])|اللّ?ٰ?ہ(?![؀-ۿ]))(?!\s?ﷻ)/g;
const HON_FAST = /Allah|अल्लाह|الل/;
const HON_SKIP = /^(SCRIPT|STYLE|TEXTAREA|INPUT|NOSCRIPT)$/;
function honorific(s){ return HON_FAST.test(s) ? s.replace(HON_RE, '$1 ﷻ') : s; }
function honNode(n){
  if(!n) return;
  if(n.nodeType === 3){
    const p = n.parentNode; if(!p || HON_SKIP.test(p.nodeName) || p.isContentEditable) return;
    const v = n.nodeValue; if(v && HON_FAST.test(v)){ const w = v.replace(HON_RE, '$1 ﷻ'); if(w !== v) n.nodeValue = w; }
    return;
  }
  if(n.nodeType !== 1 || HON_SKIP.test(n.nodeName)) return;
  const walk = document.createTreeWalker(n, NodeFilter.SHOW_TEXT); const list = []; while(walk.nextNode()) list.push(walk.currentNode);
  list.forEach(honNode);
}
(function(){
  const start = ()=>{
    honNode(document.body);
    new MutationObserver(ms=>{ for(const m of ms){ if(m.type === 'characterData') honNode(m.target); else m.addedNodes.forEach(honNode); } })
      .observe(document.body, { childList:true, subtree:true, characterData:true });
  };
  if(document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
/* ============================================================
   NATIVE (Android app built with Capacitor): Azan and prayer notifications that still fire when the app is closed.
   In the browser/PWA this file does nothing. In the app it schedules the next NATIVE_DAYS days with the system alarm manager
   every time the app opens or settings change; open the app at least once in that period to refresh.
   ============================================================ */
const NATIVE_DAYS = 14;
const nativeLN = ()=>{ try{ return window.Capacitor && Capacitor.isNativePlatform && Capacitor.isNativePlatform() && Capacitor.Plugins && Capacitor.Plugins.LocalNotifications || null; }catch(e){ return null; } };
const nativeRaw = id=> String(id).replace(/-/g, '_');
let nativeSig = '', nativeBusy = false, nativeChannels = {};
async function nativeEnsureChannel(LN, id){
  const ch = id ? 'azan_' + nativeRaw(id) : 'waqt24_default';
  if(nativeChannels[ch]) return ch;
  try{ await LN.createChannel(id ? { id:ch, name:'Azan · ' + id, description:'Azan at prayer time', importance:5, sound:nativeRaw(id) + '.mp3', vibration:true, visibility:1 } : { id:ch, name:'Waqt24 reminders', description:'Prayer and learning reminders', importance:4, vibration:true, visibility:1 }); }catch(e){}
  nativeChannels[ch] = 1; return ch;
}
/* the list of notifications to schedule: [{ at: Date, title, body, key, azan: recordingId|null }] */
function nativePlan(now){
  const out = [], az = azaanState();
  for(let d = 0; d < NATIVE_DAYS; d++){
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + d, 12, 0, 0);
    buildSchedule(day).forEach(p=>{
      if(p.start <= now) return;
      const isAz = FIVE.includes(p.key) && az.on && az.prayers[p.key];
      if(isAz){ out.push({ at:p.start, title:(PRAYER_META[p.key] ? PRAYER_META[p.key].icon : '🕌') + ' ' + p.name + ' ki Azaan', body:p.name + ' ka waqt ho gaya hai.', key:dayKey(day) + p.key, azan:az.pick[p.key] }); return; }
      if(state.notif && state.notif[p.type]) out.push({ at:p.start, title:(PRAYER_META[p.key] ? PRAYER_META[p.key].icon : '🕐') + ' ' + p.name + ' ka waqt', body:p.name + ' ka waqt ho gaya hai.', key:dayKey(day) + p.key, azan:null });
    });
  }
  for(let d = 0; d < NATIVE_DAYS; d++){
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + d, 12, 0, 0);
    ramzanReminders(day).forEach(r=>{ if(r.at > now) out.push({ at:r.at, title:r.title, body:r.body, key:r.key, azan:null }); });
  }
  return out.sort((a, b)=> a.at - b.at);
}
async function nativeSchedule(force){
  const LN = nativeLN(); if(!LN || nativeBusy) return;
  const plan = nativePlan(new Date());
  let h = 0; plan.forEach(n=>{ const t = n.key + '|' + n.azan + '|' + n.at.getTime() + '|' + n.title; for(let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) | 0; });
  const sig = plan.length + ':' + h;
  if(!force && sig === nativeSig) return;
  nativeBusy = true;
  try{
    let perm = await LN.checkPermissions();
    if(perm.display !== 'granted') perm = await LN.requestPermissions();
    if(perm.display !== 'granted') return;
    try{ const ex = await LN.checkExactNotificationSetting(); if(ex && ex.exact_alarm === 'prompt') await LN.changeExactNotificationSetting(); }catch(e){}
    const pending = await LN.getPending(); if(pending.notifications && pending.notifications.length) await LN.cancel({ notifications: pending.notifications });
    const items = []; let id = 1;
    for(const n of plan){ items.push({ id:id++, title:n.title, body:n.body, schedule:{ at:n.at, allowWhileIdle:true }, channelId:await nativeEnsureChannel(LN, n.azan), smallIcon:'ic_stat_waqt24' }); }
    for(let i = 0; i < items.length; i += 60) await LN.schedule({ notifications: items.slice(i, i + 60) });
    nativeSig = sig;
  }catch(e){ console.warn('native schedule', e); }
  finally{ nativeBusy = false; }
}
if(nativeLN()){
  document.body.classList.add('native-app');
  setTimeout(()=>nativeSchedule(), 1500);
  document.addEventListener('visibilitychange', ()=>{ if(!document.hidden) nativeSchedule(); });
  setInterval(()=>nativeSchedule(), 5 * 60000);
}
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
    const tabs = [['home','🕌','Maskan'], ['calendar','🗓️','Taareekh'], ['explore','🎓',"Ma'rifat"], ['more','☰','Deegar']], cur = state.startTab || 'home';
    box.innerHTML = `<div class="disp-start"><div class="disp-start-t">${L({rur:'App kholne par pehle yeh tab dikhe', en:'Open this tab when the app starts'})}</div><div class="disp-start-row" role="radiogroup">${tabs.map(t=>`<button type="button" role="radio" aria-checked="${cur === t[0]}" class="${cur === t[0] ? 'on' : ''}" data-start="${t[0]}"><span>${t[1]}</span>${t[2]}</button>`).join('')}</div></div>`
      + rows.map(r=>`<div class="tasbeeh-sound-toggle"><span>${r[1]} ${L(r[2])}</span><div class="roza-mini ${r[3]() ? 'on' : ''}" role="switch" aria-checked="${r[3]()}" tabindex="0" data-disp="${r[0]}"><div class="roza-mini-knob"></div></div></div>`).join('')
      + `<button type="button" class="disp-tour" id="dispTour">🧭 ${L({rur:'Tour dobara dekhein', en:'Show the tour again'})}</button>`;
    box.querySelectorAll('[data-disp]').forEach(b=>{
      const flip = ()=>{ const k = b.dataset.disp; if(k === 'hc') state.hc = !state.hc; else if(k === 'calm') state.calm = !state.calm; else state.dailyOff = !state.dailyOff; saveState(); applyDisplayPrefs(); draw(); };
      b.onclick = flip; b.onkeydown = e=>{ if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); flip(); } };
    });
    box.querySelectorAll('[data-start]').forEach(b=>{ b.onclick = ()=>{ state.startTab = b.dataset.start; saveState(); draw(); showToast(L({rur:'Ab app isi tab se khulega', en:'The app will now open on this tab'})); }; });
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
setTimeout(()=> startTour(false), 20000);

/* open the chosen start tab once, when the app loads */
(function(){
  const t = state.startTab; if(!t || t === 'home') return;
  const b = document.querySelector(`.tab-btn[data-tab="${t}"]`); if(b) setTimeout(()=> b.click(), 0);
})();

/* cold-start safety: some phones paint the tab bar and lists late until the first touch; re-lay-out and re-promote the bar a few times right after launch and whenever the app comes back to the front */
function paintNudge(){
  const tb = document.getElementById('tabbar'); if(!tb) return;
  void document.body.offsetHeight; tb.style.willChange = 'transform';
  requestAnimationFrame(()=> requestAnimationFrame(()=>{ tb.style.willChange = ''; }));
}
[100, 400, 1000, 2500].forEach(t=> setTimeout(paintNudge, t));
document.addEventListener('visibilitychange', ()=>{ if(!document.hidden) paintNudge(); });
window.addEventListener('pageshow', paintNudge);
