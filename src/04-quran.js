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
  const t = QURAN_TINTS.find(x=>x.k === (state.quranTint||'')), on = t && t.c && document.getElementById('quranWrap') && !quranNightOn();
  ['qPlayer','trSheet','trPage'].forEach(id=>{
    const q = document.getElementById(id); if(!q) return;
    if(on){ q.setAttribute('data-tint', t.k); q.style.setProperty('--qtc', t.c); q.style.setProperty('--qta', t.a); } else q.removeAttribute('data-tint');
  });
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
  /* A page change inside the reader (or a pick from the index) moves the recitation too; merely reopening the reader does not */
  const qaFlip = !!document.getElementById('quranWrap') || qa.forceSync; qa.forceSync = false;
  if(qaFlip) qaSyncToPage(page);
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
    <div class="quran-page-wrap${state.quranTrPage ? ' tp-mode' + (quranNightOn() ? ' tp-night' : '') : (quranNightOn() ? (quranEd()==='tajweed' ? ' night-color' : ' night') : '')}" id="quranWrap">
      ${state.quranTrPage ? trpShell() : `<img class="quran-page-img" src="${quranImg(page)}" alt="Quran page ${page}" draggable="false">`}
    </div>
    <div class="quran-tools">
      <button class="quran-tool ${quranMarked(page)?'on':''}" id="quranMarkBtn">🔖 ${quranMarked(page) ? L({rur:'Nishaan laga hai', en:'Bookmarked'}) : L({rur:'Nishaan lagayein', en:'Bookmark'})}</button>
      <button class="quran-tool ${quranNightOn()?'on':''}" id="quranNightBtn">🌙 ${L({rur:'Andhera', en:'Night'})}</button>
      <button class="quran-tool ${state.quranTint?'on':''}" id="quranTintBtn">🎨 ${L({rur:'Rang', en:'Tint'})}</button>
      <button class="quran-tool ${state.quranTrPage?'on':''}" id="quranTpBtn">📜 ${L({rur:'Tarjuma page', en:'Translation page'})}</button>
      <button class="quran-tool" id="quranTrBtn" ${state.quranTrPage ? 'hidden' : ''}>📖 ${L({rur:'Tarjuma', en:'Meaning'})}</button>
      <button class="quran-tool" id="quranZoomBtn" ${state.quranTrPage ? 'hidden' : ''}>🔍 ${L({rur:'Bara karein', en:'Zoom'})}</button>
      <button class="quran-tool" id="quranShareBtn">📤 ${L({rur:'Share', en:'Share'})}</button>
      <button class="quran-tool ${state.quranTurnSound?'on':''}" id="quranSoundBtn">${state.quranTurnSound ? '🔈' : '🔇'} ${L({rur:'Awaaz', en:'Sound'})}</button>
      <button class="quran-tool ${qa.on?'on':''}" id="quranListenBtn">🎧 ${L({rur:'Sunein', en:'Listen'})}</button>
      <button class="quran-tool" id="quranSignsBtn">🛑 ${L({rur:'Alamaat', en:'Signs'})}</button>
      <button class="quran-tool qt-ed" id="quranEdBtn">${quranEd()==='tajweed' ? quranBookSvg(false, 22) + ' Normal' : quranBookSvg(true, 22) + ' Tajweed'}</button>
    </div>
    <div class="q-tints" id="qTints" ${quranTintOpen ? '' : 'hidden'}>${QURAN_TINTS.map(t=>`<button type="button" class="q-tint${(state.quranTint||'')===t.k?' active':''}" data-t="${t.k}" style="--tc:${t.c || '#ffffff'}" aria-label="${t.n}" title="${t.n}"></button>`).join('')}</div>
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
  document.getElementById('quranTintBtn').onclick = ()=>{ quranTintOpen = !quranTintOpen; document.getElementById('qTints').hidden = !quranTintOpen; };
  document.getElementById('qTints').onclick = e=>{ const b = e.target.closest('.q-tint'); if(!b) return; state.quranTint = b.dataset.t; if(b.dataset.t) state.quranNight = false; saveState(); renderQuranReader(page); };
  quranTintApply();
  document.getElementById('quranTrBtn').onclick = ()=> openTarjuma(qa.on ? qa.abs : 0);
  document.getElementById('quranTpBtn').onclick = ()=>{ state.quranTrPage = !state.quranTrPage; saveState(); if(state.quranTrPage && typeof trClose === 'function') trClose(); renderQuranReader(page); };
  if(state.quranTrPage) trpFill(page);
  if(typeof trRefresh === 'function') trRefresh();
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
  if(!state.quranTrPage) wrap.addEventListener('click', ()=>{ const t = Date.now(); if(t - lastTap < 320) toggleZoom(); lastTap = t; });
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
  document.querySelectorAll('#detailBody .quran-idx-item').forEach(el=>{ el.onclick = ()=>{ qa.forceSync = true; renderQuranReader(parseInt(el.dataset.page)); }; });
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

