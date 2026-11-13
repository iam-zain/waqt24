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
function applyPalette(name){
  const root = document.documentElement, pal = (PALETTES.find(p=>p.k===state.palette) || PALETTES[0]).k;
  if(pal === 'default') root.removeAttribute('data-palette'); else root.setAttribute('data-palette', pal);
  root.setAttribute('data-tone', LIGHT_THEMES.includes(name) ? 'light' : 'dark');
  root.setAttribute('data-mode', state.theme === 'waqti' ? 'ambient' : 'fixed');
  document.querySelectorAll('#palRow .pal').forEach(b=>b.classList.toggle('active', b.dataset.k === pal));
  requestAnimationFrame(()=>{ try{ const m = document.querySelector('meta[name=theme-color]'); if(m) m.content = getComputedStyle(root).getPropertyValue('--bg').trim() || m.content; }catch(e){} });
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

