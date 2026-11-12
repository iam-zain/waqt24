/* app.js is BUILT from src/*.js by tools/build.py. Edit the files in src/, not this one. */
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
const FAJR_ANGLE = 18, ISHA_ANGLE = 17; // MWL (Muslim World League) - common for India

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

  let fajr = timeFor(FAJR_ANGLE, true, true);
  const sunrise = timeFor(0.833, true);
  const dhuhr = fixHour(solarNoon() + (1/60)); // +1 min safety after zawal
  const zawalEnd = solarNoon(); // moment of zawal (istawa) - zuhr starts right after
  const asr = asrTime(state.asrMethod==='shafi' ? 1 : 2); // Hanafi: shadow twice the length (default); Shafi'i: shadow equal to length
  const maghrib = timeFor(0.833, false);
  let isha = timeFor(ISHA_ANGLE, false, true);
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

function toDate(baseDate, hourFloat){
  const d = new Date(baseDate);
  d.setHours(0,0,0,0);
  const h = Math.floor(hourFloat);
  const m = Math.round((hourFloat-h)*60);
  d.setHours(h, m, 0, 0);
  return d;
}
function fmtTime(d){
  const m = String(d.getMinutes()).padStart(2,'0');
  if(state.timeFormat==='12'){
    let h = d.getHours();
    const ap = h>=12?'PM':'AM';
    h = h%12; if(h===0) h=12;
    return h + ':' + m + ' ' + ap;
  }
  return String(d.getHours()).padStart(2,'0') + ':' + m;
}
function fmtTimeCompact(d){
  const m = String(d.getMinutes()).padStart(2,'0');
  if(state.timeFormat==='12'){
    let h = d.getHours();
    const ap = h>=12?'PM':'AM';
    h = h%12; if(h===0) h=12;
    return h + ':' + m + ' ' + ap;
  }
  return String(d.getHours()).padStart(2,'0') + ':' + m;
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
  const t = computeDayTimes(date, loc.lat, loc.lon, TZ);
  const fajr = toDate(date, t.fajr);
  const sunrise = toDate(date, t.sunrise);
  const zawal = toDate(date, t.zawal);
  const dhuhr = addMin(zawal, 3); // zuhr begins shortly after zawal ends
  const asr = toDate(date, t.asr);
  const maghrib = toDate(date, t.maghrib);
  const isha = toDate(date, t.isha);

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
  timeFormat: '24',
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
function loadState(){
  try{ const s = JSON.parse(localStorage.getItem('namazState')||'{}'); state = Object.assign(state, s); }catch(e){}
  if(state.timeFormat!=='12') state.timeFormat = '24';
  if(!['m','l','xl'].includes(state.textScale)) state.textScale = 'm';
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
  const root = document.documentElement;
  if(state.theme==='auto'){
    const h = new Date().getHours();
    setThemeAttr((h>=6 && h<18) ? 'light':'dark');
  } else if(state.theme==='waqti'){
    const key = currentPrayerKey();
    const waqt = (PRAYER_META[key] && PRAYER_META[key].waqt) || 'waqt-dark';
    setThemeAttr(waqt);
  } else {
    setThemeAttr(state.theme);
  }
  document.querySelectorAll('.theme-row button').forEach(b=>b.classList.remove('active'));
  document.getElementById('theme'+state.theme.charAt(0).toUpperCase()+state.theme.slice(1)).classList.add('active');
}
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
let lastLiveKey = null;
let homeNextChange = 0, homeRenderedDay = null; // set by renderHome, read by homeTick
function isSameDay(a,b){ return dayKey(a)===dayKey(b); }

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
  listEl.innerHTML = '';
  listEl.classList.toggle('namaz-mode', state.namazMode);

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

  if(isToday){
    const liveKey = (isIftarActive && 'iftar') || (isGhurubActive && 'ghurub') || (currentIdx>=0 && sched[currentIdx].key) || null;
    if(liveKey && liveKey !== lastLiveKey){
      const liveRow = listEl.querySelector('.time-row[data-key="'+liveKey+'"]');
      if(liveRow){
        const listTop = listEl.getBoundingClientRect().top;
        const rowTop = liveRow.getBoundingClientRect().top;
        const targetOffset = listEl.clientHeight * 0.22;
        listEl.scrollTo({ top: Math.max(0, listEl.scrollTop + (rowTop - listTop) - targetOffset), behavior: instantScroll ? 'auto' : 'smooth' });
      }
    }
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
    if(__navCtx && __navCtx.rtl) return pageTurn(dir, change, yFrac);
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
    const img = body.querySelector('.quran-page-img');
    if(!img){ change(); busy = false; return; }
    const box = img.getBoundingClientRect();
    const nw = img.naturalWidth || box.width, nh = img.naturalHeight || box.height;
    const sc = Math.min(box.width / nw, box.height / nh);
    const r = { width: nw*sc, height: nh*sc, left: box.left + (box.width - nw*sc)/2, top: box.top + (box.height - nh*sc)/2 };
    const leaf = document.createElement('div');
    leaf.className = 'page-leaf';
    leaf.style.cssText = `left:${r.left}px; top:${r.top}px; width:${r.width}px; height:${r.height}px;`;
    leaf.innerHTML = `<img src="${img.currentSrc || img.src}" alt="" style="filter:${getComputedStyle(img).filter}"><i class="page-leaf-shade"></i>`;
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
  if(!items.length){
    body.innerHTML = `<div class="empty-state">Abhi tak kuch pasandeeda nahi.<br>Kisi bhi dua, hadees, naam ya lafz par ☆ dabayein.</div>`;
    return;
  }
  const types = [...new Set(items.map(x=>x.r.type))];
  body.innerHTML = types.map(t=>`
    <div class="dw-section">
      <div class="dw-section-title"><span>${t}</span><span class="dw-count">${items.filter(x=>x.r.type===t).length}</span></div>
      ${items.filter(x=>x.r.type===t).map(x=>`<div class="dw-row" data-k="${x.k.replace(/"/g,'&quot;')}">
        ${x.r.ar ? `<div class="ar">${x.r.ar}</div>` : ''}
        <div class="info"><div class="tr">${x.r.title}</div><div class="m">${x.r.sub}</div></div>
        ${bmBtn(x.k, 'data-refresh="1"')}
      </div>`).join('')}
    </div>`).join('');
  body.querySelectorAll('.dw-row').forEach(el=>{
    el.onclick = ()=>{ const r = bmResolve(el.dataset.k); if(r) r.open(); };
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
        state.location = { name:'Current Location', lat:pos.coords.latitude, lon:pos.coords.longitude, source:'gps' };
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
    <div class="section-title">${L({rur:'Fajr aur Isha', en:'Fajr and Isha'})}</div>
    <div class="backup-note" style="margin-top:0;">Muslim World League: Fajr 18°, Isha 17°. ${L({rur:'Yeh waqt AlAdhan ke hisaab se 1 minute ke andar milte hain.', en:'These times match AlAdhan within a minute.'})}</div>`;
  document.querySelectorAll('#detailBody [data-asr]').forEach(b=>{ b.onclick = ()=>{ state.asrMethod = b.dataset.asr; saveState(); afterCalcChange(); renderCalcSettings(); }; });
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
function tilawatTarget(){ return Math.max(1, Math.min(40, state.tilawatTarget || 2)); }
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
      <button class="quran-tool" id="khatmNew" style="margin-top:8px;">${L({rur:'Naya Khatm shuru karein', en:'Start a new Khatm'})}</button>
    </div>`;
}
function wireTilawatCards(rerender){
  const t = tilawatTarget();
  document.getElementById('tlMinus').onclick = ()=>{ state.tilawatTarget = Math.max(1, t-1); saveState(); rerender(); };
  document.getElementById('tlPlus').onclick = ()=>{ state.tilawatTarget = Math.min(40, t+1); saveState(); rerender(); };
  document.getElementById('tlManPlus').onclick = ()=>{ addManualPages(1); rerender(); };
  document.getElementById('tlManMinus').onclick = ()=>{ addManualPages(-1); rerender(); };
  const done = document.getElementById('tlDone');
  if(done) done.onclick = ()=>{ addManualPages(Math.max(0, tilawatTarget() - tilawatCount())); rerender(); };
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
  state.quranPage = page;
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
    <div class="quran-tools">
      <button class="quran-tool ${quranMarked(page)?'on':''}" id="quranMarkBtn">🔖 ${quranMarked(page) ? L({rur:'Nishaan laga hai', en:'Bookmarked'}) : L({rur:'Nishaan lagayein', en:'Bookmark'})}</button>
      <button class="quran-tool ${quranNightOn()?'on':''}" id="quranNightBtn">🌙 ${L({rur:'Raat', en:'Night'})}</button>
      <button class="quran-tool" id="quranZoomBtn">🔍 ${L({rur:'Bara karein', en:'Zoom'})}</button>
      <button class="quran-tool" id="quranShareBtn">📤 ${L({rur:'Share', en:'Share'})}</button>
      <button class="quran-tool ${state.quranTurnSound?'on':''}" id="quranSoundBtn">${state.quranTurnSound ? '🔈' : '🔇'} ${L({rur:'Awaaz', en:'Sound'})}</button>
      <button class="quran-tool" id="quranSignsBtn">🛑 ${L({rur:'Alamaat', en:'Signs'})}</button>
      <button class="quran-tool qt-ed" id="quranEdBtn">${quranEd()==='tajweed' ? quranBookSvg(false, 22) + ' Normal' : quranBookSvg(true, 22) + ' Tajweed'}</button>
    </div>
    <div class="quran-jump">
      <span>${L({rur:'Page par jaayein', en:'Go to page'})}</span>
      <input type="number" id="quranJumpInput" min="1" max="${QURAN_PAGE_COUNT}" value="${page}">
      <button id="quranJumpBtn">${L({rur:'Jaayein', en:'Go'})}</button>
    </div>
    ${pnBarHtml()}
  `;
  const jumpBtn = document.getElementById('quranJumpBtn');
  const jumpInput = document.getElementById('quranJumpInput');
  const jump = ()=>{ const v = parseInt(jumpInput.value); if(v>=1 && v<=QURAN_PAGE_COUNT) renderQuranReader(v); };
  jumpBtn.onclick = jump;
  jumpInput.onkeydown = (e)=>{ if(e.key==='Enter') jump(); };
  document.getElementById('quranMarkBtn').onclick = ()=>{
    const m = state.quranMarks || (state.quranMarks = []);
    const i = m.indexOf(page);
    if(i>=0) m.splice(i,1); else { m.push(page); m.sort((x,y)=>x-y); }
    saveState(); renderQuranReader(page);
    showToast(i>=0 ? L({rur:'Nishaan hata diya', en:'Bookmark removed'}) : L({rur:'Nishaan laga diya', en:'Bookmarked'}));
  };
  document.getElementById('quranNightBtn').onclick = ()=>{ state.quranNight = !quranNightOn(); saveState(); renderQuranReader(page); };
  const wrap = document.getElementById('quranWrap');
  const toggleZoom = ()=>{ wrap.classList.toggle('zoomed'); document.getElementById('quranZoomBtn').classList.toggle('on', wrap.classList.contains('zoomed')); };
  document.getElementById('quranZoomBtn').onclick = toggleZoom;
  document.getElementById('quranSignsBtn').onclick = renderQuranSigns;
  document.getElementById('quranShareBtn').onclick = ()=> shareQuranPage(page);
  document.getElementById('quranSoundBtn').onclick = ()=>{ state.quranTurnSound = !state.quranTurnSound; saveState(); renderQuranReader(page); if(state.quranTurnSound) playPageSound(); };
  document.getElementById('quranEdBtn').onclick = ()=>{ state.quranEd = quranEd()==='tajweed' ? 'normal' : 'tajweed'; saveState(); renderQuranReader(page); };
  let lastTap = 0;
  wrap.addEventListener('click', ()=>{ const t = Date.now(); if(t - lastTap < 320) toggleZoom(); lastTap = t; });
  document.getElementById('quranParaBtn').onclick = ()=> renderQuranIndex('para');
  document.getElementById('quranSurahBtn').onclick = ()=> renderQuranIndex('surah');
  document.getElementById('quranManzilBtn').onclick = ()=> renderQuranIndex('manzil');
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
function renderQuranHome(){
  document.getElementById('detailTitle').textContent = "Qur'an Majeed";
  const last = quranLastPage(), ed = quranEd();
  document.getElementById('detailBody').innerHTML = `
    <div class="section-title" style="margin:0 14px 8px;">${L({rur:"Qur'an padhein", en:'Read the Quran'})}</div>
    <div class="qbook-row">
      <button class="qbook ${ed==='normal'?'last':''}" id="qhNormal">${quranBookSvg(false)}<b>${L({rur:'Normal', en:'Normal'})}</b><span>${L({rur:'15 line Mushaf', en:'15-line Mushaf'})}</span></button>
      <button class="qbook ${ed==='tajweed'?'last':''}" id="qhTajweed">${quranBookSvg(true)}<b>Tajweed</b><span>${L({rur:'Rangon ke saath', en:'Colour-coded'})}</span></button>
    </div>
    <div class="qbook-note">${L({rur:`Dono mein page number ek jaise hain: aakhri page ${last}, aur nishaan dono mein kaam karte hain.`, en:`Both share page numbers: last page ${last}, and bookmarks work in both.`})}</div>
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
function renderQuranIndex(kind){
  const cur = quranLastPage();
  const isPara = kind==='para', isManzil = kind==='manzil', isMarks = kind==='marks';
  const marks = (state.quranMarks||[]).map(pg=>({ n:'🔖', name:`Page ${pg}`, page:pg, sub:`${quranSurahOf(pg).name} · ${L({rur:'Paara', en:'Para'})} ${quranParaOf(pg).n}` }));
  const list = isMarks ? marks : isPara ? QURAN_PARAS : isManzil ? QURAN_MANZILS : QURAN_SURAHS;
  const curItem = isMarks ? null : isPara ? quranParaOf(cur) : isManzil ? quranManzilOf(cur) : quranSurahOf(cur);
  document.getElementById('detailTitle').textContent = isMarks ? L({rur:'Nishaan', en:'Bookmarks'}) : isPara ? L({rur:'30 Paare', en:'30 Paras'}) : isManzil ? L({rur:'7 Manzil', en:'7 Manzils'}) : L({rur:'114 Surah', en:'114 Surahs'});
  const sub = x => isMarks ? `<span class="lblSub">${x.sub}</span>` : isPara ? '' : isManzil ? `<span class="lblSub">${x.from} – ${x.to}</span>` : `<span class="lblSub ar-font">${x.ar}</span>`;
  document.getElementById('detailBody').innerHTML = `
    <div class="view-toggle" style="margin:0 14px 12px;">
      <button id="qiParaTab" class="${isPara?'active':''}">${L({rur:'Paara', en:'Para'})}</button>
      <button id="qiSurahTab" class="${kind==='surah'?'active':''}">Surah</button>
      <button id="qiManzilTab" class="${isManzil?'active':''}">Manzil</button>
      <button id="qiMarksTab" class="${isMarks?'active':''}">🔖 ${marks.length}</button>
    </div>
    ${isMarks && !marks.length ? `<div class="empty-state">${L({rur:'Abhi koi nishaan nahi. Kisi page par 🔖 dabayein.', en:'No bookmarks yet. Tap 🔖 on any page.'})}</div>` : ''}
    <div class="more-list" style="padding-top:0;">${list.map(x=>`
      <div class="more-item quran-idx-item ${x===curItem?'on':''}" data-page="${x.page}">
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
  document.querySelectorAll('#detailBody .quran-idx-item').forEach(el=>{ el.onclick = ()=> renderQuranReader(parseInt(el.dataset.page)); });
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
    ['textsize','🔠','Text ka Size', {m:'Normal',l:'Bara',xl:'Bohot Bara'}[state.textScale]||'Normal'],
    ['homecard','🃏','Home Card', {full:'Poora',strip:'Patli patti',off:'Band'}[state.heroMode||'full']],
    ['lang','🌐','Zubaan', state.lang==='en' ? 'English' : 'Hinglish / Roman Urdu'],
    ['notif','🔔','Yaad-dahaniyan', ''],
    ['azaan','🔊','Azaan', azaanState().on ? 'On' : 'Off'],
    ['nafil','🌙','Nafil Namaz Mark Karein', nafilOn() ? 'On' : 'Off'],
    ['calc','🧮','Namaz ka Hisaab', (state.asrMethod==='shafi' ? "Asr: Shafi'i" : 'Asr: Hanafi') + (hijriOffset() ? ` · Hijri ${hijriOffset()>0?'+':''}${hijriOffset()}` : '')],
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
  document.getElementById('detailTitle').textContent = ({notif:'Yaad-dahaniyan', lang:'Zubaan', timefmt:'Waqt ka Andaaz', textsize:'Text ka Size', homecard:'Home Card'})[settingsTab] || 'Apna Shahar Chunein';
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
    pane.innerHTML = `<div class="theme-row" style="padding:0 0 12px;">
      <button data-size="m" class="${state.textScale==='m'?'active':''}">Normal</button>
      <button data-size="l" class="${state.textScale==='l'?'active':''}">Bara</button>
      <button data-size="xl" class="${state.textScale==='xl'?'active':''}">Bohot Bara</button>
    </div>`;
    pane.querySelectorAll('[data-size]').forEach(b=>{ b.onclick = ()=>{ state.textScale = b.dataset.size; saveState(); applyTextScale(); renderTextSizePane(); }; });
  }
  function renderHomeCardPane(){
    const m = state.heroMode || 'full';
    pane.innerHTML = `<div class="theme-row" style="padding:0 0 12px;">
      <button data-hm="full" class="${m==='full'?'active':''}">${L({rur:'Poora card', en:'Full card'})}</button>
      <button data-hm="strip" class="${m==='strip'?'active':''}">${L({rur:'Patli patti', en:'Slim strip'})}</button>
      <button data-hm="off" class="${m==='off'?'active':''}">${L({rur:'Band', en:'Off'})}</button>
    </div>
    <div class="backup-note">${L({rur:'Home par abhi ki namaz aur agli namaz ka card. Card ko left/right swipe ya ✕ se chhota ya band kar sakte hain; yahan se wapas la sakte hain.', en:'The card on Home showing the current and next prayer. Swipe it sideways or tap ✕ to shrink or hide it; bring it back here.'})}</div>`;
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
  if(settingsTab==='notif') renderNotifPane(); else if(settingsTab==='lang') renderLangPane(); else if(settingsTab==='timefmt') renderTimeFmtPane(); else if(settingsTab==='textsize') renderTextSizePane(); else if(settingsTab==='homecard') renderHomeCardPane(); else renderLocationPane();

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
        state.location = {name:'Current Location', lat:pos.coords.latitude, lon:pos.coords.longitude, source:'gps'};
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
  document.getElementById('detailTitle').textContent = 'Ramzan';
  const live = gregorianToHijri(new Date()).month===9;
  document.getElementById('detailBody').innerHTML = `
    ${live ? '' : `<div class="backup-note" style="margin-bottom:12px;">🌙 Abhi Ramzan nahi hai, yeh sirf jhalak hai. Ramzan mein yahan roza aur namaz mark kar sakenge.</div>`}
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
      <div style="font-size:13px; color:var(--text); margin-top:16px; font-weight:700;">Qibla: ${Math.round(bearing)}° (Shumaal se)</div>
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

  document.getElementById('qiblaCompassBtn').onclick = async ()=>{
    const start = ()=>{
      qiblaOrientHandler = (e)=>{
        let heading = (typeof e.webkitCompassHeading === 'number') ? e.webkitCompassHeading : (e.alpha!=null ? (360 - e.alpha) : null);
        if(heading==null) return;
        dial.style.transform = `rotate(${-heading}deg)`;
        needle.style.transform = `rotate(${bearing}deg)`;
        statusEl.textContent = 'Compass chalu hai, phone ko seedha pakdein, 🕋 wahi Qibla ki taraf ishara karega.';
      };
      const evt = ('ondeviceorientationabsolute' in window) ? 'deviceorientationabsolute' : 'deviceorientation';
      window.addEventListener(evt, qiblaOrientHandler);
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
    const payload = { app:'waqt24', exportedAt: new Date().toISOString(), state, hijriOffset: hijriOffset() };
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
        state = Object.assign(state, incoming);
        if(payload && payload.hijriOffset!==undefined){ try{ localStorage.setItem('hijriOffset', String(payload.hijriOffset)); }catch(e){} hijriOffset._v = undefined; }
        saveState();
        renderHome(); renderCalendar(); updateRamzanLock(); updateQazaBadge();
        document.getElementById('backupMsg').textContent = '✅ Data restore ho gaya hai.';
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
  saveState();
  if(navigator.vibrate) navigator.vibrate(t.count % t.target === 0 ? [40,40,80] : 15);
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
    <div class="tasbeeh-count" style="--tasbeehColor:${t.color};">${t.count}</div>
    <div class="tasbeeh-target">Target: ${t.target}</div>
    ${tapAreaHtml}
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
    <div class="tasbeeh-actions">
      <button id="tasbeehResetBtn">↺ Reset Karein</button>
    </div>

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
  document.getElementById('tasbeehSoundBtn').onclick = ()=>{ t.sound = !t.sound; saveState(); renderTasbeeh(); };
  document.getElementById('tasbeehDesignRow').querySelectorAll('[data-design]').forEach(btn=>{
    btn.onclick = ()=>{ t.design = btn.dataset.design; saveState(); renderTasbeeh(); };
  });
  document.getElementById('tasbeehTargetRow').querySelectorAll('[data-target]').forEach(btn=>{
    btn.onclick = ()=>{ t.target = parseInt(btn.dataset.target); saveState(); renderTasbeeh(); };
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
  const body = `\n\n---\nApp: Waqt24\nZubaan: ${state.lang==='en'?'English':'Hinglish / Roman Urdu'}\nDevice: ${navigator.userAgent}\n${extra||''}`;
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
function onNavigate(s){
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
    curScreen = prev;
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
const TEXT_SCALES = { m:1, l:1.12, xl:1.25 };
function applyTextScale(){
  const k = state.textScale || 'm';
  const z = TEXT_SCALES[k] || 1;
  document.documentElement.style.zoom = z;
  document.documentElement.style.setProperty('--zoom', z);
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
  const cd = ms => { const m = Math.max(0, Math.ceil(ms / 60000)); return m >= 60 ? Math.floor(m / 60) + 'h ' + String(m % 60).padStart(2, '0') + 'm' : m + 'm'; };
  const inTxt = ms => L({ rur: cd(ms) + ' mein', en: 'in ' + cd(ms) });
  const heroMode = ()=>{ const m = state.heroMode || 'full'; return (m === 'full' && window.matchMedia('(max-height:680px)').matches) ? 'strip' : m; };
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
  window.setHeroMode = function(m){ state.heroMode = m; saveState(); const el = document.getElementById('homeHero'); if(el){ el.dataset.k = ''; el.style.transform = ''; el.style.opacity = ''; } try{ renderHero(true); }catch(e){} };
  // ✕ and swipe step the card down: full → slim strip → off
  function stepDown(el, dir){
    const next = heroMode() === 'full' ? 'strip' : 'off';
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){ setHeroMode(next); return; }
    el.classList.remove('dragging'); el.classList.add('snap');
    el.style.transform = `translateX(${dir * 110}%)`; el.style.opacity = '0';
    setTimeout(()=>{ el.classList.remove('snap'); setHeroMode(next); }, 200);
  }
  (()=>{
    const el = document.getElementById('homeHero'); if(!el) return;
    el.addEventListener('click', e=>{
      if(e.target.closest('.hero-x')){ e.stopPropagation(); stepDown(el, 1); return; }
      if(el.classList.contains('strip')) setHeroMode('full'); // tap the slim strip: open it again
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
