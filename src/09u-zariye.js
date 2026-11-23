/* ============================================================
   SEEKHNE KE ZARIYE: recommended YouTube channels, series, movies, books, podcasts, websites, kids' content, courses.
   The tab and its sections are ready; ZARIYE_ITEMS is empty on purpose and is filled later from a reviewed list.
   An item looks like:
     { id:'unique-id', cat:'youtube', t:'Naam', why:'Ek line mein kyun dekhein', by:'Kis ka / channel', lang:['ur','hi'], level:'Beginner', url:'https://...', checked:'2026-11' }
   Optional: facts:['5 seasons', '150 episodes'] (big boxes at the top of the card), tags:['Life Hero','Tareekh'] (shown as chips; tap one to filter), links:[{t:'Season 1 · Episode 1', url:'...'}] for several episodes/parts,
   about:{ h:'Heading', p:'paragraph', pts:['bullet', ...] } for a short profile of the hero / author / topic, note:'a caution line'.
   cat: one of ZARIYE_CATS ids. lang: 'ur' | 'hi' | 'en'. level: 'Beginner' | 'Aage ka' | 'Sab ke liye'. checked: month the link was last verified.
   ============================================================ */
const ZARIYE_CATS = [
  { id:'youtube',  ic:'📺', t:'YouTube Channels',  sub:'Tafseer, seerat, bayanaat', color:'#d9534f' },
  { id:'series',   ic:'🎞️', t:'Series',             sub:'Seerat aur tareekh par',  color:'#8a63d2' },
  { id:'movies',   ic:'🎬', t:'Movies',             sub:'Documentary aur filmein', color:'#c0752f' },
  { id:'books',    ic:'📚', t:'Kitabein',           sub:'Namaz se seerat tak',      color:'#2f9e6e' },
  { id:'audio',    ic:'🎧', t:'Podcast aur Audio',  sub:'Safar mein sunne ke liye', color:'#3f8fe0' },
  { id:'web',      ic:'🌐', t:'Websites aur Apps',  sub:'Qur’an, hadees, fatwa',    color:'#2fb6b0' },
  { id:'kids',     ic:'🧒', t:'Bachchon ke liye',   sub:'Kahaniyan aur nasheed',    color:'#e0709f' },
  { id:'courses',  ic:'🎓', t:'Kors aur Classes',   sub:'Arabic, tajweed, Qur’an',   color:'#5c7cfa' },
  { id:'newmuslim',ic:'🆕', t:'Naye Muslim ke liye',sub:'Pehle kya seekhein',       color:'#c79a2e' }
];
const ZARIYE_LANGS = [['all', 'Sab'], ['ur', 'Urdu'], ['hi', 'Hindi'], ['en', 'English']];
const ZARIYE_LANG_RANK = { ur:0, hi:1, en:2 };   /* Urdu first, then Hindi, then English */
const ZARIYE_ITEMS = [
  { id:'kingdom-of-heaven', cat:'movies', t:'Kingdom of Heaven', by:'Film · Director: Ridley Scott · English', lang:['en'], level:'Sirf bade (violence)', checked:'2026-11',
    why:'Salibi jungon ke daur mein Yerushalam ke difa ki kahani. Is mein Sultan Salahuddin Ayyubi ke daur aur 1187 ke muhasre ki jhalak milti hai.',
    facts:['2005', '2h 24m', 'IMDb 7.3'],
    tags:['Tareekh', 'Salibi Jung', 'Jung aur Fatah', 'Drama', 'Life Hero'],
    links:[ { t:'IMDb par dekhein', url:'https://www.imdb.com/title/tt0320661/' } ],
    about:{ h:'Film ke baare mein',
      p:'12vin sadi ke Salibi jungon ke background par bani film. Balian of Ibelin Yerushalam pahunchta hai aur shehar aur logon ka muhafiz ban jata hai.',
      pts:[
        'Director: Ridley Scott',
        'Stars: Orlando Bloom, Eva Green, Liam Neeson',
        'Saal: 2005, lambai 2 ghante 24 minute',
        'Rating: R (jung ke manazir), IMDb 7.3, Metascore 63',
        'Ye link sirf film ki jankari ka hai. Film dekhne ke liye apni pasand ka platform khud dhoondein.'
      ] },
    note:'Ye film ek fictional drama hai. Kai kirdar aur waqiyat asal tareekh se alag hain, aur jung ke manazir bade logon ke liye hain. Asal tareekh ke liye mustanad kitabein dekhein.' },
  { id:'ertugrul-series', cat:'series', t:'Ertugrul Ghazi', by:'Diriliş: Ertuğrul · Turkish series, Urdu dub (YouTube par)', lang:['ur'], level:'Sab ke liye', checked:'2026-11',
    why:'Usmani saltanat ke bani Usman Ghazi ke walid Ertugrul Bey ki zindagi par bani mashhoor Turkish series. Himmat, imaan, wafadari aur qabeele ki qiyadat ka sabaq.',
    facts:['5 seasons', '150 episodes (asli)', '2014 se 2019 tak'],
    tags:['Tareekh', 'Usmani', 'Drama', 'Jung aur Fatah', 'Life Hero'],
    links:[ { t:'Urdu · Season 1 · Episode 1', url:'https://www.youtube.com/watch?v=fa89NxhAKis' } ],
    about:{ h:'Series ke baare mein',
      p:'Ye series Turkey ke TRT 1 par 10 December 2014 se 29 May 2019 tak chali. Isme kul 5 season aur 150 episode hain, aur har episode lagbhag 2 ghante ka tha. Urdu dub mein episode chhote kaat kar dikhaye jate hain, isliye Urdu mein episodes ki ginti zyada (PTV Home par 470) hoti hai.',
      pts:[
        'Season 1: 26 episode (Dec 2014 se June 2015)',
        'Season 2: 35 episode (Sept 2015 se June 2016)',
        'Season 3: 30 episode (Oct 2016 se June 2017)',
        'Season 4: 30 episode (Oct 2017 se June 2018)',
        'Season 5: 29 episode (Nov 2018 se May 2019)',
        'Kul: 150 episode asli, Netflix par 448, PTV Home (Urdu) par 470.',
        'Baqi episodes aap YouTube par isi tarah "Ertugrul Ghazi Urdu" likh kar khud dhoond sakte hain.'
      ] },
    note:'Ertugrul Bey ke baare mein asal tareekhi maloomat bahut kam hain, isliye series ka bahut hissa drama aur qissa hai. Isse tareekh ki dastaavez na samjhein.' },
  { id:'kohistani-yt', cat:'youtube', t:'The Kohistani', by:'YouTube channel', lang:['ur'], level:'Sab ke liye', checked:'2026-11', url:'https://www.youtube.com/@Thekohistani',
    why:'Islami tareekh aur shakhsiyaat par lambi (lagbhag 20-25 minute ki) narration wali videos, jinmein series ke taur par bhi episodes aate hain, jaise Hazrat Umar RA ki series. Channel ka tarif-naama ek hadees se hai: achchi baat kaho ya khamosh raho.',
    tags:['Historical Narration', 'AI Video', 'Man Explaining', 'Tareekh', 'Sahaba'],
    note:'Channel ke video aksar tasveeron aur AI se bani visuals ke saath hote hain. Tareekhi baton ko doosri mustanad kitabon se bhi milakar dekhein.' },
  { id:'salahuddin-series', cat:'series', t:'Sultan Salahuddin Ayyubi', by:'Series (YouTube par Urdu mein)', lang:['ur'], level:'Sab ke liye', checked:'2026-11',
    why:'Ek bahadur, rahmdil aur insaaf-pasand hukmaran ki zindagi par bani series. Hero ki zindagi se himmat aur kirdar seekhne ke liye.',
    tags:['Life Hero', 'Tareekh', 'Jung aur Fatah', 'Drama'],
    links:[
      { t:'Season 1 · Episode 1', url:'https://www.youtube.com/watch?v=zENZc5TNCRE' },
      { t:'Season 2 · Episode 1', url:'https://www.youtube.com/watch?v=s9fmf_8RmJA' }
    ],
    about:{ h:'Sultan Salahuddin Ayyubi (rahimahullah)',
      p:'Salahuddin Yusuf bin Ayyub 1137/38 ke aas-paas Tikrit (aaj ke Iraq) mein paida hue. Kurd khandaan se the. Apne chacha Shirkuh ke saath Misr gaye, wahan wazir bane, aur baad mein Misr aur Shaam ke pehle sultan aur Ayyubi saltanat ke bani huye. Unhein sabse zyada Baitul Maqdis (Jerusalem) ki fatah ke liye yaad kiya jata hai.',
      pts:[
        'Janam: Tikrit, Iraq (lagbhag 1137/38), Kurd khandaan se.',
        'Chacha Shirkuh ke saath Misr gaye, aur 1169 mein Misr mein wazir muqarrar hue.',
        'Misr aur Shaam ke pehle sultan bane, aur Ayyubi saltanat ki buniyad rakhi.',
        'Misr mein Sunni deen ki wapsi: 1171 mein juma ke khutbe mein Abbasi khalifa ka naam padha gaya.',
        '4 July 1187 ko Hattin ki jang mein Salibi lashkar ko bhaari shikast di.',
        '2 October 1187 ko Baitul Maqdis 88 saal baad wapas liya.',
        'Tareekh mein unke reham, wa’de ki paasdaari aur dushman ke saath bhi insaaf ke bahut zikr milte hain.',
        'Teesri Salibi jang mein Richard (Lionheart) ka muqabla kiya, aur 1192 mein sulah hui.',
        'Wafat: 4 March 1193 ko Damascus mein. Bahut daulat sadqa kar chuke the, aur saadgi se rehte the.'
      ] },
    note:'Ye series ek drama hai. Kuch kirdar aur scenes tareekh se alag ya sajaye hue ho sakte hain. Asal tareekh ke liye mustanad kitabein bhi dekhein.' }
];

function zariyeLang(){ return ['all', 'ur', 'hi', 'en'].includes(state.zariyeLang) ? state.zariyeLang : 'all'; }
function zariyeItems(cat){
  const lg = zariyeLang();
  return ZARIYE_ITEMS.filter(x=> (!cat || x.cat === cat) && (lg === 'all' || (x.lang || []).includes(lg)))
    .sort((a, b)=> Math.min(...(a.lang || ['en']).map(l=> ZARIYE_LANG_RANK[l] ?? 3)) - Math.min(...(b.lang || ['en']).map(l=> ZARIYE_LANG_RANK[l] ?? 3)));
}
const zariyeLangChips = ()=> `<div class="zr-langs" id="zrLangs">${ZARIYE_LANGS.map(([k, n])=>`<button type="button" class="zr-lang ${zariyeLang() === k ? 'on' : ''}" data-l="${k}">${n}</button>`).join('')}</div>`;
function zariyeWireLangs(redraw){
  document.querySelectorAll('#zrLangs .zr-lang').forEach(b=> b.onclick = ()=>{ state.zariyeLang = b.dataset.l; saveState(); redraw(); });
}
function renderZariye(){
  document.getElementById('detailTitle').textContent = 'Seekhne ke Zariye';
  document.getElementById('detailBody').innerHTML = `
    <div class="zr-hero"><div class="zr-hero-ic">🧭</div><div><div class="zr-hero-t">Seekhne ke Zariye</div><div class="zr-hero-s">Achche channels, series, movies aur kitabein ek jagah</div></div></div>
    ${zariyeLangChips()}
    <div class="zr-grid">${ZARIYE_CATS.map(c=>{ const n = zariyeItems(c.id).length;
      return `<button type="button" class="zr-tile" data-c="${c.id}" style="--zc:${c.color};"><div class="zr-tile-ic">${c.ic}</div><div class="zr-tile-t">${c.t}</div><div class="zr-tile-s">${c.sub}</div><div class="zr-tile-n">${n ? n + ' jaankari' : 'Jald aa raha hai'}</div></button>`; }).join('')}</div>
    <div class="backup-note">Ye list ahtiyat se chuni jati hai. Kisi bhi masle mein apne mustanad aalim se zaroor poochhein.</div>
    <div class="tab-end"></div>`;
  zariyeWireLangs(renderZariye);
  document.querySelectorAll('.zr-tile').forEach(b=> b.onclick = ()=> renderZariyeList(b.dataset.c));
}
function zariyeCardHtml(x, n){
  const lg = (x.lang || []).map(l=> (ZARIYE_LANGS.find(z=> z[0] === l) || [0, l])[1]).join(' · ');
  const a = x.about;
  return `<div class="zr-card"><div class="zr-card-top"><span class="zr-sn">${n}</span><div class="zr-card-h"><b>${x.t}</b>${x.by ? `<small>${x.by}</small>` : ''}</div></div>
    ${x.why ? `<p>${x.why}</p>` : ''}
    ${(x.facts || []).length ? `<div class="zr-facts">${x.facts.map(f=>`<div>${f}</div>`).join('')}</div>` : ''}
    ${(x.tags || []).length ? `<div class="zr-tags">${x.tags.map(t=>`<button type="button" class="zr-tag ${zrTag === t ? 'on' : ''}" data-t="${t}">#${t}</button>`).join('')}</div>` : ''}
    <div class="zr-meta">${lg ? `<span>🗣️ ${lg}</span>` : ''}${x.level ? `<span>🎯 ${x.level}</span>` : ''}${x.checked ? `<span>✔️ ${x.checked}</span>` : ''}</div>
    ${a ? `<details class="zr-about"><summary>📖 ${a.h || 'Taaruf'}</summary>${a.p ? `<p>${a.p}</p>` : ''}${(a.pts || []).length ? `<ul>${a.pts.map(t=>`<li>${t}</li>`).join('')}</ul>` : ''}</details>` : ''}
    ${x.note ? `<div class="zr-note">⚠️ ${x.note}</div>` : ''}
    ${(x.links || (x.url ? [{ t:'Kholein', url:x.url }] : [])).map(l=>`<div class="zr-linkrow"><a class="zr-open" href="${l.url}" target="_blank" rel="noopener">▶ ${l.t}</a><button type="button" class="zr-copy" data-u="${l.url}" aria-label="Link copy karein">📋 Copy link</button></div>`).join('')}</div>`;
}
let zrTag = '';
function renderZariyeList(catId){
  const c = ZARIYE_CATS.find(x=> x.id === catId) || ZARIYE_CATS[0], all = zariyeItems(c.id), tags = [...new Set(all.flatMap(x=> x.tags || []))];
  if(zrTag && !tags.includes(zrTag)) zrTag = '';
  const items = zrTag ? all.filter(x=> (x.tags || []).includes(zrTag)) : all;
  document.getElementById('detailTitle').textContent = c.t;
  document.getElementById('detailBody').innerHTML = `
    <div class="zr-sechead" style="--zc:${c.color};"><div class="zr-tile-ic">${c.ic}</div><div><b>${c.t}</b><small>${c.sub}</small></div></div>
    ${zariyeLangChips()}
    ${tags.length ? `<div class="zr-tagbar">${tags.map(t=>`<button type="button" class="zr-tag ${zrTag === t ? 'on' : ''}" data-t="${t}">#${t}</button>`).join('')}</div>` : ''}
    ${items.length ? `<div class="zr-list">${items.map((x, i)=> zariyeCardHtml(x, i + 1)).join('')}</div>`
      : `<div class="empty-state"><div style="font-size:42px;margin-bottom:8px;">${c.ic}</div>Is hisse mein abhi kuch nahi.<br>Jaldi hi chuni hui jaankari yahan aayegi.</div>`}
    <div class="tab-end"></div>`;
  zariyeWireLangs(()=> renderZariyeList(c.id));
  document.querySelectorAll('.zr-copy').forEach(b=> b.onclick = async ()=>{
    const u = b.dataset.u; let ok = false;
    try{ if(navigator.clipboard && navigator.clipboard.writeText){ await navigator.clipboard.writeText(u); ok = true; } }catch(e){}
    if(!ok){ try{ const t = document.createElement('textarea'); t.value = u; t.style.cssText = 'position:fixed;opacity:0;'; document.body.appendChild(t); t.select(); ok = document.execCommand('copy'); t.remove(); }catch(e){} }
    showToast(ok ? 'Link copy ho gaya' : 'Copy nahi ho paya');
  });
  document.querySelectorAll('.zr-tag').forEach(b=> b.onclick = ()=>{ zrTag = (zrTag === b.dataset.t) ? '' : b.dataset.t; renderZariyeList(c.id); });
}
