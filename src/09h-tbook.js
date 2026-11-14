/* ===== TARJUMA BOOK and TAFSEER (both open from "Qur'an Majeed") =====
   TARJUMA BOOK: the translation of each Mushaf page as a book page of exactly 15 ruled lines, in Hinglish, اردو, हिन्दी or English.
   A Mushaf page whose translation is longer than 15 lines runs on to the next sheet ("Part 2/3"); Next/Back (and a swipe) turn
   sheet by sheet and then page by page. Page numbers are the Mushaf's own. The tint colours and the night page are the reader's.
   TAFSEER: "Aasan Tarjuma Quran" by Mufti Taqi Usmani (Urdu), 1976 scanned pages in /tafseer/, opened by surah or para. */
var TB_ROWS = 15, tbSt = { tok:0, page:2, sheet:0, total:1, lang:'' };
const tbLastPage = ()=> QA_PAGE_FIRST.length;
const tbClamp = p => Math.max(2, Math.min(tbLastPage(), p | 0 || 2));
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
function tbFs(lh){ const l = tbLang(); return Math.round(lh / (l === 'ur' ? 2.6 : l === 'hi' ? 1.85 : 1.72) * 10) / 10; }
function tbBookSvg(kind){
  const c = 'var(--accent)', lines = [0,1,2,3].map(i=>{ const y = 15 + i * 6; return `<line x1="9" y1="${y}" x2="27" y2="${y+1.5}" stroke="${c}" stroke-width="2.6" stroke-linecap="round"/><line x1="37" y1="${y+1.5}" x2="55" y2="${y}" stroke="${kind === 'tafseer' ? 'currentColor' : c}" stroke-width="2.6" stroke-linecap="round"/>`; }).join('');
  return `<svg viewBox="0 0 64 48" width="48" height="36" aria-hidden="true"><path d="M32 9 C24 4 12 4 4 7 V43 C12 40 24 40 32 45 C40 40 52 40 60 43 V7 C52 4 40 4 32 9 Z" fill="var(--card2)" stroke="var(--sub)" stroke-width="2" stroke-linejoin="round"/><line x1="32" y1="9" x2="32" y2="45" stroke="var(--sub)" stroke-width="2"/>${lines}</svg>`;
}
/* the section on the Qur'an home screen */
function tbHomeHtml(){
  return `<div class="section-title" style="margin:6px 14px 8px;">${L({rur:'Tarjuma aur Tafseer', en:'Translation and Tafseer'})}</div>
    <div class="qbook-row">
      <button class="qbook" id="qhTbook">${tbBookSvg('tarjuma')}<b>${L({rur:'Tarjuma', en:'Translation'})}</b><span>${L({rur:'15 line ka safha, 4 zubaan', en:'15-line pages, 4 languages'})}</span></button>
      <button class="qbook" id="qhTafseer">${tbBookSvg('tafseer')}<b>${L({rur:'Tafseer', en:'Tafseer'})}</b><span>${L({rur:'Aasan Tarjuma · Urdu', en:'Aasan Tarjuma · Urdu'})}</span></button>
    </div>`;
}
function tbHomeWire(){
  const a = document.getElementById('qhTbook'), b = document.getElementById('qhTafseer');
  if(a) a.onclick = ()=> renderTarjumaBook(state.tbPage || 2);
  if(b) b.onclick = ()=> renderTafseerIndex();
}
/* HTML of one Mushaf page in one language: surah headings take two lines, the text runs on with the ayah numbers */
async function tbBuild(page, lang){
  const ur = lang === 'ur', ids = trPageAyahs(page), surahs = [...new Set(ids.map(x=>qaSurahAyah(x).s))];
  const data = await Promise.all(surahs.map(s=>trLoad(s, lang)));
  const open = '<p class="tb-p"' + (ur ? ' dir="rtl" lang="ur"' : lang === 'hi' ? ' lang="hi"' : '') + '>';
  let html = open;
  ids.forEach(x=>{
    const r = qaSurahAyah(x), t = (data[surahs.indexOf(r.s)][r.a-1] || '').replace(/</g, '&lt;').replace(/\uFDFA/g, '<span class="tb-sw">\uFDFA</span>');
    if(r.a === 1){
      if(html.endsWith(open)) html = html.slice(0, -open.length); else html += '</p>';
      html += `<div class="tb-surah" data-a="${x}"><span>${ur ? 'سورۃ ' + tbSurahName(r.s, lang) : r.s + '. ' + tbSurahName(r.s, lang)}</span></div>${open}`;
    }
    html += `<span class="tb-ay" data-a="${x}">${t} <i class="tb-n" dir="ltr">&#xFD3E;${trpDigits(r.a, ur)}&#xFD3F;</i></span> `;
  });
  return html + '</p>';
}
function renderTarjumaBook(page, sheet){
  page = tbClamp(page); const lang = tbLang(), lh = tbLh(), ur = lang === 'ur';
  if(qa.on && !tbSt.following && qa.syncPage !== page && typeof qaSyncToPage === 'function') qaSyncToPage(page);   /* turning the page by hand moves a playing recitation with it */
  state.tbPage = page; saveState(); tbSt.page = page; tbSt.lang = lang; tbSt.sheet = 0; tbSt.total = 1;
  setNavCtx([0, 1, 2], 1, ()=>{}, null); __navCtx.rtl = false; __navCtx.turn = true;
  document.getElementById('detailTitle').textContent = L({rur:'Tarjuma', en:'Translation'});
  const ids = trPageAyahs(page), para = quranParaOf(page), sn = ids.length ? qaSurahAyah(ids[0]).s : quranSurahOf(page).n;
  const night = quranNightOn(), tint = QURAN_TINTS.find(x=>x.k === (state.quranTint || ''));
  const pageCss = night ? '' : tint && tint.c ? `--tbbg:${tint.c};--tbac:${tint.a};` : '';
  document.getElementById('detailBody').innerHTML = `
    <div class="tb-top"><span>${L({rur:'Paara', en:'Para'})} ${para.n}</span><b${ur ? ' dir="rtl" lang="ur" class="tb-urname"' : ''}>${tbSurahName(sn, lang)}</b><span>${L({rur:'Page', en:'Page'})} ${page}</span></div>
    <div class="tb-sheet${night ? ' night' : ''}" id="tbSheet" style="--lh:${lh}px;--fs:${tbFs(lh)}px;${pageCss}">
      <div class="tb-view${ur ? ' ur' : ''}" id="tbView"><div class="tb-rules">${Array.from({length:TB_ROWS},(_, k)=>`<i style="--k:${k+1}"></i>`).join('')}</div><div class="tb-flow" id="tbFlow"><div class="tb-msg">${trpMsg()}</div></div></div>
      <div class="tb-foot"><span id="tbPart"></span></div>
    </div>
    <div class="pn-bar tb-bar"><button class="pn-btn pn-prev" id="pnPrevBtn"><span class="pn-ic">⬅️</span>${isEn() ? 'Previous' : 'Pichla'}</button><span class="pn-pos" id="tbPos"></span><button class="pn-btn pn-next" id="pnNextBtn">${isEn() ? 'Next' : 'Agla'}<span class="pn-ic">➡️</span></button></div>
    <div class="tb-tools"><div class="tb-langs">${TR_LANGS.map(l=>`<button type="button" data-l="${l.k}" class="${l.k === lang ? 'on' : ''}">${l.n}</button>`).join('')}</div><span class="tb-sz"><button class="quran-tool" type="button" data-z="-1" aria-label="Smaller text">A−</button><button class="quran-tool" type="button" data-z="1" aria-label="Bigger text">A+</button></span></div>
    <div class="quran-tools tb-acts">
      <button class="quran-tool tb-listen" id="tbListenBtn">🎧 ${L({rur:'Tilawat sunein', en:'Listen'})}</button>
      <button class="quran-tool ${notesForPage(page, 'tb').length ? 'on' : ''}" id="tbNoteBtn">📝 ${L({rur:'Note', en:'Note'})}${notesForPage(page, 'tb').length ? ' (' + notesForPage(page, 'tb').length + ')' : ''}</button>
      <button class="quran-tool" id="tbTintBtn">🎨 ${L({rur:'Rang', en:'Tint'})}</button>
      <button class="quran-tool ${night ? 'on' : ''}" id="tbNightBtn">🌙 ${L({rur:'Andhera', en:'Night'})}</button>
      <button class="quran-tool ${state.quranTurnSound ? 'on' : ''}" id="tbSoundBtn">${state.quranTurnSound ? '🔈' : '🔇'} ${L({rur:'Awaaz', en:'Sound'})}</button>
      <button class="quran-tool" id="tbMushafBtn">${tbBookSvg('tarjuma').replace('width="48" height="36"', 'width="22" height="17"')} ${L({rur:'Mushaf', en:'Mushaf'})}</button>
    </div>
    <div class="q-tints" id="tbTints" hidden>${QURAN_TINTS.map(t=>`<button type="button" class="q-tint${(state.quranTint || '') === t.k ? ' active' : ''}" data-t="${t.k}" style="--tc:${t.c || '#ffffff'}" aria-label="${t.n}" title="${t.n}"></button>`).join('')}</div>
    <div class="quran-jump"><span>${L({rur:'Page par jaayein', en:'Go to page'})}</span><input type="number" id="tbJump" min="2" max="${tbLastPage()}" value="${page}"><button id="tbJumpBtn">${L({rur:'Jaayein', en:'Go'})}</button></div>`;
  const $ = id => document.getElementById(id);
  document.querySelector('.tb-langs').onclick = e=>{ const b = e.target.closest('button'); if(!b) return; state.tbLang = b.dataset.l; saveState(); renderTarjumaBook(tbSt.page, tbSt.sheet); };
  document.querySelector('.tb-sz').onclick = e=>{ const b = e.target.closest('button'); if(!b) return; state.tbZ = Math.max(-3, Math.min(8, (state.tbZ || 0) + (+b.dataset.z))); saveState(); renderTarjumaBook(tbSt.page, tbSt.sheet); };
  $('tbTintBtn').onclick = ()=>{ $('tbTints').hidden = !$('tbTints').hidden; };
  $('tbTints').onclick = e=>{ const b = e.target.closest('.q-tint'); if(!b) return; state.quranTint = b.dataset.t; if(b.dataset.t) state.quranNight = false; saveState(); renderTarjumaBook(tbSt.page, tbSt.sheet); $('tbTints').hidden = false; };
  $('tbNightBtn').onclick = ()=>{ state.quranNight = !quranNightOn(); saveState(); renderTarjumaBook(tbSt.page, tbSt.sheet); };
  $('tbListenBtn').onclick = ()=>{ if(qa.on) qaStop(); else tbPlayFrom(tbFirstAyah()); };
  $('tbNoteBtn').onclick = ()=> openNoteBox({ page, sec:'tb' }, ()=>{ const b = document.getElementById('tbNoteBtn'); if(b){ const c = notesForPage(page, 'tb').length; b.classList.toggle('on', c > 0); b.textContent = '📝 ' + L({rur:'Note', en:'Note'}) + (c ? ' (' + c + ')' : ''); } });
  $('tbFlow').onclick = e=>{ const ay = e.target.closest('.tb-ay'); if(ay) tbPlayFrom(+ay.dataset.a); };
  $('tbSoundBtn').onclick = ()=>{ state.quranTurnSound = !state.quranTurnSound; saveState(); renderTarjumaBook(tbSt.page, tbSt.sheet); if(state.quranTurnSound) playPageSound(); };
  $('tbMushafBtn').onclick = ()=> renderQuranReader(tbSt.page);
  const jump = ()=>{ const v = parseInt($('tbJump').value); if(v >= 2 && v <= tbLastPage()) renderTarjumaBook(v); };
  $('tbJumpBtn').onclick = jump; $('tbJump').onkeydown = e=>{ if(e.key === 'Enter') jump(); };
  $('pnPrevBtn').onclick = tbPrev; $('pnNextBtn').onclick = tbNext;
  tbLoad(page, sheet);
  [page + 1].forEach(n=>{ if(n <= tbLastPage()) tbBuild(n, lang).catch(()=>{}); });   /* the next page's translation is fetched while this one is read */
}
async function tbLoad(page, sheet){
  const my = ++tbSt.tok, lang = tbLang(); let html;
  try{ html = await tbBuild(page, lang); }
  catch(e){
    const f = document.getElementById('tbFlow'); if(my !== tbSt.tok || !f) return;
    f.innerHTML = `<div class="tb-msg">${L({rur:'Tarjuma load nahi hua. Internet check karein.', en:'Could not load the translation. Check your internet connection.'})}<br><button type="button" class="tp-retry" id="tbRetry">${L({rur:'Dobara koshish', en:'Retry'})}</button></div>`;
    document.getElementById('tbRetry').onclick = ()=> renderTarjumaBook(page, sheet); return;
  }
  const flow = document.getElementById('tbFlow'); if(my !== tbSt.tok || !flow) return;
  flow.innerHTML = html;
  if(lang === 'ur' && document.fonts && document.fonts.ready){ try{ await document.fonts.ready; }catch(e){} if(my !== tbSt.tok || !document.getElementById('tbFlow')) return; }
  tbMeasure(sheet); tbSt.following = false; tbSync();
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(()=>{ if(my === tbSt.tok) tbMeasure(tbSt.sheet); });
}
/* how many 15-line sheets the page needs, and show sheet n of them */
function tbMeasure(sheet){
  const flow = document.getElementById('tbFlow'), sh = document.getElementById('tbSheet'); if(!flow || !sh) return;
  const lh = parseFloat(getComputedStyle(sh).getPropertyValue('--lh')), H = lh * TB_ROWS;
  const total = Math.max(1, Math.ceil((flow.scrollHeight - 3) / H));
  tbSt.total = total;
  tbSt.sheet = sheet === 'last' ? total - 1 : Math.max(0, Math.min(total - 1, sheet | 0));
  flow.style.transform = `translateY(${-tbSt.sheet * H}px)`;
  const first = tbSt.page <= 2 && tbSt.sheet === 0, last = tbSt.page >= tbLastPage() && tbSt.sheet >= total - 1;
  const p = document.getElementById('pnPrevBtn'), n = document.getElementById('pnNextBtn'); if(p) p.disabled = first; if(n) n.disabled = last;
  const part = document.getElementById('tbPart'); if(part) part.textContent = total > 1 ? `${L({rur:'Hissa', en:'Part'})} ${tbSt.sheet + 1}/${total}` : '';
  const pos = document.getElementById('tbPos'); if(pos) pos.textContent = `${L({rur:'Page', en:'Page'})} ${tbSt.page}${total > 1 ? ' · ' + (tbSt.sheet + 1) + '/' + total : ''}`;
  state.tbSheet = tbSt.sheet;
}
function tbNext(){
  if(tbSt.sheet + 1 < tbSt.total){ tbMeasure(tbSt.sheet + 1); }
  else if(tbSt.page < tbLastPage()) renderTarjumaBook(tbSt.page + 1, 0);
}
function tbPrev(){
  if(tbSt.sheet > 0){ tbMeasure(tbSt.sheet - 1); }
  else if(tbSt.page > 2) renderTarjumaBook(tbSt.page - 1, 'last');
}
/* ---- Urdu tarjuma audio inside the book (no Arabic): plays the Shamshad Ali Khan recording ayah by ayah, highlights the ayah and turns the sheet/page with it ---- */
function tbFirstAyah(){
  const flow = document.getElementById('tbFlow'), sh = document.getElementById('tbSheet');
  const ids = trPageAyahs(tbSt.page); if(!flow || !sh) return ids[0];
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
function tbSync(){
  const sh = document.getElementById('tbSheet'); if(!sh) { if(!qa.on) tbRestoreVoice(); return; }
  const btn = document.getElementById('tbListenBtn');
  if(btn){ btn.classList.toggle('on', !!qa.on); btn.innerHTML = '🎧 ' + L({rur:'Tilawat sunein', en:'Listen'}); }
  const flow = document.getElementById('tbFlow'); flow.querySelectorAll('.hl').forEach(e=>e.classList.remove('hl'));
  if(!qa.on){ tbRestoreVoice(); return; }
  const pg = qaAyahPage(qa.abs);
  if(pg !== tbSt.page){
    if(pg >= 2 && pg <= tbLastPage() && !tbSt.following && flow.querySelector('.tb-ay')){
      tbSt.following = true; qa.syncPage = pg; const fwd = pg > tbSt.page;
      const go = ()=> renderTarjumaBook(pg, 0);
      if(typeof slideDetail === 'function') slideDetail(fwd ? -1 : 1, go); else go();
      setTimeout(()=>{ if(tbSt.following && tbSt.page !== pg) go(); }, 900);
    }
    return;
  }
  const el = qa.bism ? flow.querySelector(`.tb-surah[data-a="${qa.abs}"]`) : flow.querySelector(`.tb-ay[data-a="${qa.abs}"]`);
  if(!el) return;
  el.classList.add('hl');
  const H = parseFloat(getComputedStyle(sh).getPropertyValue('--lh')) * TB_ROWS, rs = el.getClientRects();
  const idx = Math.max(0, Math.min(tbSt.total - 1, Math.floor((rs[0].top - flow.getBoundingClientRect().top + 2) / H)));
  if(idx !== tbSt.sheet){ const dir = idx > tbSt.sheet ? -1 : 1, go = ()=>{ tbMeasure(idx); tbSync(); }; if(typeof slideDetail === 'function') slideDetail(dir, go); else go(); }
}
function tbRestoreVoice(){ if(tbSt.prevVoice){ const v = tbSt.prevVoice; tbSt.prevVoice = null; if(!qa.on) qaSetVoice(v); } }
window.addEventListener('resize', ()=>{ if(document.getElementById('tbSheet')) renderTarjumaBook(tbSt.page, tbSt.sheet); });

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
  n = Math.max(1, Math.min(TF_PAGES, n | 0 || 1)); state.tfPage = n; saveState();
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
      <button class="quran-tool ${notesForPage(n, 'tf').length ? 'on' : ''}" id="tfNoteBtn">📝 ${L({rur:'Note', en:'Note'})}${notesForPage(n, 'tf').length ? ' (' + notesForPage(n, 'tf').length + ')' : ''}</button>
      <button class="quran-tool" id="tfTintBtn">🎨 ${L({rur:'Rang', en:'Tint'})}</button>
      <button class="quran-tool ${night ? 'on' : ''}" id="tfNightBtn">🌙 ${L({rur:'Andhera', en:'Night'})}</button>
      <button class="quran-tool" id="tfZoomBtn">🔍 ${L({rur:'Bara karein', en:'Zoom'})}</button>
      <button class="quran-tool ${state.quranTurnSound ? 'on' : ''}" id="tfSoundBtn">${state.quranTurnSound ? '🔈' : '🔇'} ${L({rur:'Awaaz', en:'Sound'})}</button>
    </div>
    <div class="q-tints" id="tfTints" hidden>${QURAN_TINTS.map(t=>`<button type="button" class="q-tint${(state.quranTint || '') === t.k ? ' active' : ''}" data-t="${t.k}" style="--tc:${t.c || '#ffffff'}" aria-label="${t.n}" title="${t.n}"></button>`).join('')}</div>
    <div class="quran-jump"><span>${L({rur:'Page par jaayein', en:'Go to page'})}</span><input type="number" id="tfJump" min="1" max="${TF_PAGES}" value="${n}"><button id="tfJumpBtn">${L({rur:'Jaayein', en:'Go'})}</button></div>`;
  const $ = id => document.getElementById(id);
  $('tfIndexBtn').onclick = ()=> renderTafseerIndex();
  $('tfTintBtn').onclick = ()=>{ $('tfTints').hidden = !$('tfTints').hidden; };
  $('tfTints').onclick = e=>{ const b = e.target.closest('.q-tint'); if(!b) return; state.quranTint = b.dataset.t; if(b.dataset.t) state.quranNight = false; saveState(); renderTafseerPage(n); $('tfTints').hidden = false; };
  $('tfNightBtn').onclick = ()=>{ state.quranNight = !quranNightOn(); saveState(); renderTafseerPage(n); };
  const wrap = $('tfWrap'), zoom = ()=>{ wrap.classList.toggle('zoomed'); $('tfZoomBtn').classList.toggle('on', wrap.classList.contains('zoomed')); };
  $('tfZoomBtn').onclick = zoom;
  $('tfNoteBtn').onclick = ()=> openNoteBox({ page:n, sec:'tf' }, ()=>{ const b = document.getElementById('tfNoteBtn'); if(b){ const c = notesForPage(n, 'tf').length; b.classList.toggle('on', c > 0); b.textContent = '📝 ' + L({rur:'Note', en:'Note'}) + (c ? ' (' + c + ')' : ''); } });
  $('tfSoundBtn').onclick = ()=>{ state.quranTurnSound = !state.quranTurnSound; saveState(); renderTafseerPage(n); if(state.quranTurnSound) playPageSound(); };
  let lastTap = 0; wrap.addEventListener('click', ()=>{ const t = Date.now(); if(t - lastTap < 320) zoom(); lastTap = t; });
  const go = ()=>{ const v = parseInt($('tfJump').value); if(v >= 1 && v <= TF_PAGES) renderTafseerPage(v); };
  $('tfJumpBtn').onclick = go; $('tfJump').onkeydown = e=>{ if(e.key === 'Enter') go(); };
  { const im = wrap.querySelector('img'), ready = ()=> wrap.classList.add('ready'); if(im.complete) ready(); else { im.addEventListener('load', ready); im.addEventListener('error', ready); } }
  wirePnBar();
  [n + 1, n - 1, n + 2].forEach(k=>{ if(k >= 1 && k <= TF_PAGES){ const im = new Image(); im.src = tfImg(k); } });
}
navWrap('renderTarjumaBook', 2);
navWrap('renderTafseerIndex', 1);
navWrap('renderTafseerPage', 2);
