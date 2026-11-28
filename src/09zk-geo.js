/* ===== Islami Maqamat: Islamic geography quiz =====
   Places and countries come from the list the user supplied; clues are short, well-known facts only.
   Each place may later get `img: [url, ...]` (3-5 photos); when present one is shown at random, otherwise the question is text-only. */
/* [name, city, country, category, clue] ; city null = no "which city" question */
const GEO_ART = {"Masjid al-Haram (Ka’bah)": "kaaba", "Masjid-e-Nabawi": "nabawi", "Qubbat-us-Sakhra (Dome of the Rock)": "sakhra", "Masjid-e-Aqsa": "aqsa", "Masjid Quba": "quba", "Masjid Qiblatain": "qiblatain", "Jabal-e-Arafat": "arafat", "Mina": "mina", "Muzdalifah": "muzdalifah", "Ghar-e-Hira (Jabal-e-Noor)": "hira", "Ghar-e-Thawr": "thawr", "Jabal-e-Uhud": "uhud", "Badr": "badr", "Masjid al-Ghamama": "ghamama", "Masjid al-Jumu’ah": "jumuah", "Taif": "taif", "Aya Sofya (Hagia Sophia)": "hagia", "Neeli Masjid (Sultan Ahmed Mosque)": "blue", "Sheikh Zayed Grand Mosque": "zayed", "Sultan Qaboos Grand Mosque": "qaboos", "Faisal Masjid": "faisal", "Badshahi Masjid": "badshahi", "Hassan II Masjid": "hassan", "Jame Masjid Kairouan": "kairouan", "Mezquita (Masjid-e-Qurtuba)": "qurtuba", "Sultan Omar Ali Saifuddien Masjid": "brunei", "Makkah Mukarramah": "makkah", "Madinah Munawwarah": "madinah", "Baitul Maqdis (Jerusalem)": "quds", "Karbala": "karbala", "Najaf": "najaf", "Dimashq (Damascus)": "dimashq", "Qahira (Cairo)": "qahira", "Istanbul": "istanbul", "Kuala Lumpur": "kl", "Dhaka": "dhaka", "Qasr-ul-Hamra (Alhambra)": "alhambra", "Topkapi Mahal": "topkapi", "Neeli Masjid (Rauza-e-Sharif)": "mazar", "Jame Masjid Samarra (Al-Malwiya)": "samarra", "Masjid-e-Shah (Isfahan)": "shah", "Rauza Imam Reza": "reza", "Jame Masjid Djenné": "djenne", "Masjid Sankore": "sankore", "Stone Town (Zanzibar)": "stone", "Wazir Khan Masjid": "wazir"};
const GEO_PLACES = [
  ['Masjid al-Haram (Ka’bah)', 'Makkah', 'Saudi Arabia', 'haram', 'Isme Ka’bah hai, jiski taraf Musalman namaz mein rukh karte hain.'],
  ['Masjid-e-Nabawi', 'Madinah', 'Saudi Arabia', 'haram', 'Isme Nabi ﷺ ka rauza mubarak hai.'],
  ['Qubbat-us-Sakhra (Dome of the Rock)', 'Jerusalem', 'Palestine', 'haram', 'Sunehri gumbad wali imarat jo Baitul Maqdis ke Haram ash-Sharif mein hai.'],
  ['Masjid-e-Aqsa', 'Jerusalem', 'Palestine', 'haram', 'Isra ki raat Nabi ﷺ yahan tak laaye gaye; ye Musalmanon ka pehla qibla bhi raha.'],
  ['Masjid Quba', 'Madinah', 'Saudi Arabia', 'haram', 'Hijrat ke safar mein Nabi ﷺ ne Madinah pahunchne se pehle yahan bunyad rakhi; ise Islam ki pehli masjid kaha jata hai.'],
  ['Masjid Qiblatain', 'Madinah', 'Saudi Arabia', 'haram', 'Riwayat ke mutabiq yahan namaz ke dauraan qibla Baitul Maqdis se Ka’be ki taraf badla.'],
  ['Jabal-e-Arafat', 'Makkah', 'Saudi Arabia', 'haram', '9 Zul-Hijjah ko Hajj ka sabse ahem rukn, wuqoof, yahin hota hai.'],
  ['Mina', 'Makkah', 'Saudi Arabia', 'haram', 'Hajj mein haji yahan raatein guzarte hain aur yahin Jamarat hain.'],
  ['Muzdalifah', 'Makkah', 'Saudi Arabia', 'haram', 'Arafat se wapasi par Hajj ke dauraan haji yahan raat guzarte hain.'],
  ['Ghar-e-Hira (Jabal-e-Noor)', 'Makkah', 'Saudi Arabia', 'seerat', 'Yahin Nabi ﷺ par pehli wahi (Iqra) utri.'],
  ['Ghar-e-Thawr', 'Makkah', 'Saudi Arabia', 'seerat', 'Hijrat ke safar mein Nabi ﷺ aur Hazrat Abu Bakr RA ne yahan panah li.'],
  ['Jabal-e-Uhud', 'Madinah', 'Saudi Arabia', 'seerat', 'Is pahaad ke paas 3 Hijri mein jung hui; Hazrat Hamza RA yahin shaheed hue.'],
  ['Badr', null, 'Saudi Arabia', 'seerat', 'Yahan 17 Ramzan 2 Hijri ko Islam ki pehli badi jung hui.'],
  ['Masjid al-Ghamama', 'Madinah', 'Saudi Arabia', 'seerat', 'Masjid-e-Nabawi ke qareeb ek masjid; iske naam ka matlab "badal (cloud)" hai.'],
  ['Masjid al-Jumu’ah', 'Madinah', 'Saudi Arabia', 'seerat', 'Riwayat ke mutabiq Hijrat ke safar mein Nabi ﷺ ne yahan pehli Juma ki namaz padhayi.'],
  ['Taif', null, 'Saudi Arabia', 'seerat', 'Makkah ke qareeb pahaadi shehar jahan Nabi ﷺ dawat dene tashreef le gaye.'],
  ['Aya Sofya (Hagia Sophia)', 'Istanbul', 'Türkiye', 'masjid', 'Pehle girja thi, 1453 ke baad Usmani daur mein masjid bani.'],
  ['Neeli Masjid (Sultan Ahmed Mosque)', 'Istanbul', 'Türkiye', 'masjid', 'Andar ki neeli Iznik tiles ki wajah se "Blue Mosque" kehlati hai.'],
  ['Sheikh Zayed Grand Mosque', 'Abu Dhabi', 'UAE', 'masjid', 'Safed sang-e-marmar ki badi masjid, UAE ki rajdhani mein.'],
  ['Sultan Qaboos Grand Mosque', 'Muscat', 'Oman', 'masjid', 'Oman ki rajdhani ki sabse badi masjid, Sultan Qaboos ke naam par.'],
  ['Faisal Masjid', 'Islamabad', 'Pakistan', 'masjid', 'Khemay ki shakl ka design; Saudi Badshah Faisal ke naam par hai.'],
  ['Badshahi Masjid', 'Lahore', 'Pakistan', 'masjid', 'Mughal badshah Aurangzeb ke daur mein bani badi masjid.'],
  ['Hassan II Masjid', 'Casablanca', 'Morocco', 'masjid', 'Atlantic samandar ke kinare, bohat unchi minar wali masjid.'],
  ['Jame Masjid Kairouan', 'Kairouan', 'Tunisia', 'masjid', 'Africa ki sabse purani masajid mein se ek; bunyad Uqba bin Nafi ke daur (670 ke aaspaas) se judi hai.'],
  ['Mezquita (Masjid-e-Qurtuba)', 'Cordoba', 'Spain', 'masjid', 'Andalus ke Umawi daur ki mashhoor masjid, jo ab girja hai.'],
  ['Sultan Omar Ali Saifuddien Masjid', 'Bandar Seri Begawan', 'Brunei', 'masjid', 'Brunei ki rajdhani ki mashhoor sunehri gumbad wali masjid.'],
  ['Makkah Mukarramah', null, 'Saudi Arabia', 'shehar', 'Isme Ka’bah aur Masjid al-Haram hain.'],
  ['Madinah Munawwarah', null, 'Saudi Arabia', 'shehar', 'Hijrat ke baad Nabi ﷺ ka shehar; purana naam Yathrib.'],
  ['Baitul Maqdis (Jerusalem)', null, 'Palestine', 'shehar', 'Isme Masjid-e-Aqsa aur Qubbat-us-Sakhra hain.'],
  ['Karbala', null, 'Iraq', 'shehar', 'Muharram 61 Hijri mein Hazrat Imam Husain RA yahan shaheed hue.'],
  ['Najaf', null, 'Iraq', 'shehar', 'Hazrat Ali RA ke rauze ki nisbat se mashhoor shehar.'],
  ['Dimashq (Damascus)', null, 'Syria', 'shehar', 'Umawi khilafat ka markaz raha; yahan Jame Umawi hai.'],
  ['Qahira (Cairo)', null, 'Egypt', 'shehar', 'Yahan Jamia Al-Azhar hai, jiski bunyad 970 ke aaspaas padi.'],
  ['Istanbul', null, 'Türkiye', 'shehar', 'Pehle Constantinople; 1453 mein Sultan Muhammad al-Fatih ne fatah kiya.'],
  ['Kuala Lumpur', null, 'Malaysia', 'shehar', 'Malaysia ki rajdhani.'],
  ['Dhaka', null, 'Bangladesh', 'shehar', 'Bangladesh ki rajdhani.'],
  ['Qasr-ul-Hamra (Alhambra)', 'Granada', 'Spain', 'virasat', 'Andalus ke Nasri daur ka mashhoor mahal aur qila.'],
  ['Topkapi Mahal', 'Istanbul', 'Türkiye', 'virasat', 'Usmani sultanon ka mahal, jo kai sadiyon tak hukumat ka markaz raha.'],
  ['Neeli Masjid (Rauza-e-Sharif)', 'Mazar-i-Sharif', 'Afghanistan', 'virasat', 'Neeli tiles wali mashhoor imarat.'],
  ['Jame Masjid Samarra (Al-Malwiya)', 'Samarra', 'Iraq', 'virasat', 'Ghoomti hui (spiral) minar ke liye mashhoor Abbasi daur ki masjid.'],
  ['Masjid-e-Shah (Isfahan)', 'Isfahan', 'Iran', 'virasat', 'Safawi daur ki masjid, naqsh-e-jahan maidan ke saath.'],
  ['Rauza Imam Reza', 'Mashhad', 'Iran', 'virasat', 'Imam Ali al-Ridha se mansoob rauza.'],
  ['Jame Masjid Djenné', 'Djenné', 'Mali', 'virasat', 'Mitti ki eentoon se bani duniya ki sabse badi imaraton mein shumar.'],
  ['Masjid Sankore', 'Timbuktu', 'Mali', 'virasat', 'Timbuktu ke ilmi markaz (Sankore) se judi masjid.'],
  ['Stone Town (Zanzibar)', null, 'Tanzania', 'virasat', 'Zanzibar ka purana shehar, UNESCO world heritage.'],
  ['Wazir Khan Masjid', 'Lahore', 'Pakistan', 'masjid', 'Mughal daur ki masjid jo naqqashi aur tile ke kaam ke liye mashhoor hai.']
].map(a=> ({ n: a[0], city: a[1], co: a[2], cat: a[3], c: a[4], img: [], v: GEO_ART[a[0]] || '' }));
const GEO_CITIES = ['Makkah', 'Madinah', 'Jerusalem', 'Istanbul', 'Abu Dhabi', 'Muscat', 'Islamabad', 'Lahore', 'Casablanca', 'Kairouan', 'Cordoba', 'Granada', 'Isfahan', 'Mashhad', 'Samarra', 'Mazar-i-Sharif', 'Timbuktu', 'Djenné', 'Bandar Seri Begawan', 'Baghdad', 'Damascus', 'Cairo', 'Riyadh', 'Jeddah', 'Amman', 'Tunis', 'Fez', 'Delhi', 'Dhaka', 'Konya', 'Bukhara'];
const GEO_COUNTRIES = ['Saudi Arabia', 'Palestine', 'Türkiye', 'UAE', 'Oman', 'Pakistan', 'Morocco', 'Tunisia', 'Spain', 'Brunei', 'Iraq', 'Syria', 'Egypt', 'Malaysia', 'Bangladesh', 'Afghanistan', 'Iran', 'Mali', 'Tanzania', 'Jordan', 'Indonesia', 'India', 'Algeria', 'Libya', 'Yemen', 'Kuwait', 'Qatar', 'Uzbekistan', 'Sudan', 'Nigeria'];
function geoOpts(right, pool){ const o = [right]; lzShuffle(pool.filter(x=> x !== right)).forEach(x=>{ if(o.length < 4) o.push(x); }); return lzShuffle(o); }
function geoQs(n){
  const out = []; let guard = 0, last = '';
  const P = lzShuffle(GEO_PLACES);
  while(out.length < n && guard++ < 400){
    const p = P[out.length % P.length === 0 && guard > P.length ? lzRand(P.length) : (guard - 1) % P.length];
    if(out.some(q=> q.p === p)) continue;
    const kinds = ['country', 'who']; if(p.city) kinds.push('city', 'city');
    let k = kinds[lzRand(kinds.length)]; if(k === last && kinds.length > 1){ k = kinds[lzRand(kinds.length)]; } last = k;
    const names = GEO_PLACES.filter(x=> x.cat === p.cat && x !== p).map(x=> x.n);
    const more = GEO_PLACES.filter(x=> x.cat !== p.cat && x !== p).map(x=> x.n);
    const pool = names.length >= 3 ? names : names.concat(lzShuffle(more));
    let q, o, a;
    if(k === 'city'){ q = L({ rur: `${p.n} kis shehar mein hai?`, en: `In which city is ${p.n}?` }); a = p.city; o = geoOpts(a, GEO_CITIES); }
    else if(k === 'country'){ q = L({ rur: `${p.n} kis mulk mein hai?`, en: `In which country is ${p.n}?` }); a = p.co; o = geoOpts(a, GEO_COUNTRIES); }
    else { q = L({ rur: `Pehchaniye: ${p.c}`, en: `Identify: ${p.c}` }); a = p.n; o = geoOpts(a, pool); }
    out.push({ p, q, o, a, img: p.img && p.img.length ? p.img[lzRand(p.img.length)] : '', art: p.v });
  }
  return out;
}
let khG = null;
function khGeoStart(){
  khTitle(L({ rur: 'Islami Maqamat', en: 'Islamic Places' })); khClear();
  khG = { i: 0, ok: 0, streak: 0, qs: geoQs(khRounds()), log: [], lock: false }; khGeoShow();
}
function khGeoShow(){
  const G = khG, q = G.qs[G.i]; G.lock = false;
  khBody().innerHTML = `<div class="lz">${khHead(`${G.i + 1}/${G.qs.length}`, `<span class="kh-mist">✔ <b>${G.ok}</b></span>`)}
    <div class="quiz-card">${q.img ? `<img class="kh-geoimg" src="${q.img}" alt="" loading="lazy">` : GA.svg(q.art)}<div class="quiz-q">${q.q}</div></div>
    <div class="quiz-opts">${q.o.map((o, i)=> `<button type="button" class="quiz-opt qopt-${'ABCD'[i]}" data-o="${o.replace(/"/g, '&quot;')}"><span class="opt-letter">${'ABCD'[i]}</span><span class="quiz-opt-txt">${o}</span></button>`).join('')}</div>
    <div id="khNextWrap"></div><div class="lz-toast" id="lzToast"></div></div>`;
  document.querySelectorAll('.quiz-opt').forEach(b=>{ b.onclick = ()=>{
    if(G.lock) return; G.lock = true; const ok = b.dataset.o === q.a;
    document.querySelectorAll('.quiz-opt').forEach(x=>{ x.disabled = true; if(x.dataset.o === q.a) x.classList.add('correct'); });
    const why = `${q.p.n}: ${q.p.city ? q.p.city + ', ' : ''}${q.p.co}. ${q.p.c}`;
    if(ok){ G.ok++; G.streak++; lzOk(); lzVib(20); } else { G.streak = 0; b.classList.add('wrong'); khShake(b); lzBad(); lzVib([40, 40, 40]); }
    G.log.push({ ok, q: q.q, a: q.a, why });
    const wait = (khAnsSecs() + (ok ? 0 : 1)) * 1000;
    lzToast(why, ok ? 'ok' : 'bad', khAutoOn() ? wait : 600000);
    khNext(wait, G.i + 1 >= G.qs.length, ()=>{ G.i++; G.i >= G.qs.length ? khGeoEnd() : khGeoShow(); });
  }; });
}
function khGeoEnd(){
  const G = khG, pct = G.ok / G.qs.length;
  khResult('geo', pct >= .8 ? L({ rur: 'MashaAllah!', en: 'MashaAllah!' }) : L({ rur: 'Shabaash!', en: 'Well done!' }), G.ok, G.qs.length, khStarsFor(pct), '', khGeoStart, G.log.map(x=> ({ ok: x.ok, q: x.q, a: x.a, why: x.why })));
}
