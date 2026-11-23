/* ============================================================
   SEEKHNE KE ZARIYE: recommended YouTube channels, series, movies, books, podcasts, websites, kids' content, courses.
   The tab and its sections are ready; ZARIYE_ITEMS is empty on purpose and is filled later from a reviewed list.
   An item looks like:
     { id:'unique-id', cat:'youtube', t:'Naam', why:'Ek line mein kyun dekhein', by:'Kis ka / channel', lang:['ur','hi'], level:'Beginner', url:'https://...', checked:'2026-11' }
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
const ZARIYE_ITEMS = [];

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
function zariyeCardHtml(x){
  const lg = (x.lang || []).map(l=> (ZARIYE_LANGS.find(z=> z[0] === l) || [0, l])[1]).join(' · ');
  return `<div class="zr-card"><div class="zr-card-h"><b>${x.t}</b>${x.by ? `<small>${x.by}</small>` : ''}</div>
    ${x.why ? `<p>${x.why}</p>` : ''}
    <div class="zr-meta">${lg ? `<span>🗣️ ${lg}</span>` : ''}${x.level ? `<span>🎯 ${x.level}</span>` : ''}${x.checked ? `<span>✔️ ${x.checked}</span>` : ''}</div>
    ${x.url ? `<a class="zr-open" href="${x.url}" target="_blank" rel="noopener">Kholein ↗</a>` : ''}</div>`;
}
function renderZariyeList(catId){
  const c = ZARIYE_CATS.find(x=> x.id === catId) || ZARIYE_CATS[0], items = zariyeItems(c.id);
  document.getElementById('detailTitle').textContent = c.t;
  document.getElementById('detailBody').innerHTML = `
    <div class="zr-sechead" style="--zc:${c.color};"><div class="zr-tile-ic">${c.ic}</div><div><b>${c.t}</b><small>${c.sub}</small></div></div>
    ${zariyeLangChips()}
    ${items.length ? `<div class="zr-list">${items.map(zariyeCardHtml).join('')}</div>`
      : `<div class="empty-state"><div style="font-size:42px;margin-bottom:8px;">${c.ic}</div>Is hisse mein abhi kuch nahi.<br>Jaldi hi chuni hui jaankari yahan aayegi.</div>`}
    <div class="tab-end"></div>`;
  zariyeWireLangs(()=> renderZariyeList(c.id));
}
