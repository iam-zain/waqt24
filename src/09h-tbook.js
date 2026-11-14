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
      <button class="quran-tool" id="tbSearchBtn">🔍 ${L({rur:'Khojein', en:'Search'})}</button>
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
  $('tbFlow').onclick = e=>{ if(tbSt.lp){ tbSt.lp = false; return; } const ay = e.target.closest('.tb-ay'); if(ay) tbPlayFrom(+ay.dataset.a); };
  { /* press and hold an ayah to write a note on that ayah */
    const fl = $('tbFlow'); let tm = 0, x0 = 0, y0 = 0;
    const stop = ()=>{ clearTimeout(tm); tm = 0; };
    fl.addEventListener('pointerdown', e=>{ const ay = e.target.closest('.tb-ay'); if(!ay) return; x0 = e.clientX; y0 = e.clientY; stop();
      tm = setTimeout(()=>{ tm = 0; tbSt.lp = true; const abs = +ay.dataset.a; openNoteBox({ page:qaAyahPage(abs), sec:'tb', ayah:abs }, tbHdrSync); }, 550); });
    fl.addEventListener('pointermove', e=>{ if(tm && Math.hypot(e.clientX - x0, e.clientY - y0) > 8) stop(); });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(t=> fl.addEventListener(t, stop));
    fl.addEventListener('contextmenu', e=>{ if(e.target.closest('.tb-ay')) e.preventDefault(); });
  }
  $('tbSoundBtn').onclick = ()=>{ state.quranTurnSound = !state.quranTurnSound; saveState(); renderTarjumaBook(tbSt.page, tbSt.sheet, tbSt.surah); if(state.quranTurnSound) playPageSound(); };
  $('tbSearchBtn').onclick = ()=> renderTarjumaSearch();
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

/* ---- search the translation (in the language chosen in the book) ---- */
const trNorm = (t, lang)=> {
  t = String(t).toLowerCase();
  if(lang === 'ur') return t.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\uFDFA]/g, '').replace(/[يى]/g, 'ی').replace(/ك/g, 'ک').replace(/ة/g, 'ہ').replace(/ھ/g, 'ہ').replace(/[^\u0600-\u06FF0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  if(lang === 'hi') return t.normalize('NFC').replace(/[\u093C\u0901\u0902]/g, '').replace(/[^\u0900-\u097F0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  return t.replace(/\uFDFA/g, '').replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
};
const TR_NORM = {};
async function trSearchIndex(lang){
  if(TR_NORM[lang]) return TR_NORM[lang];
  const rows = [];
  for(let sn = 1; sn <= 114; sn++){ const arr = await trLoad(sn, lang); arr.forEach((t, i)=> rows.push({ s:sn, a:i + 1, abs:QA_CUM[sn - 1] + i + 1, t, n:trNorm(t, lang) })); }
  return TR_NORM[lang] = rows;
}
function renderTarjumaSearch(q0){
  const lang = tbLang(), ur = lang === 'ur';
  document.getElementById('detailTitle').textContent = L({rur:'Tarjuma mein khojein', en:'Search the translation'});
  document.getElementById('detailBody').innerHTML = `
    <div class="qi-sticky"><div class="search-bar-wrap" style="margin:0 14px 6px;"><input id="tsQ" type="search" inputmode="search" autocomplete="off" ${ur ? 'dir="rtl"' : ''} placeholder="${L({rur:'Koi lafz likhein, ya 2:255 jaisa ayat number', en:'Type a word, or a reference like 2:255'})}" value="${noteEsc(q0 || '')}"></div>
    <div class="ts-sub" id="tsSub"></div></div>
    <div class="ts-list" id="tsList"></div>`;
  const inp = document.getElementById('tsQ'), list = document.getElementById('tsList'), sub = document.getElementById('tsSub');
  let tm = 0, tok = 0;
  const hl = (t, toks)=> { let h = noteEsc(t); toks.forEach(w=>{ if(w.length > 1) try{ h = h.replace(new RegExp('(' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi'), '<mark>$1</mark>'); }catch(e){} }); return h; };
  const run = async ()=>{
    const q = inp.value.trim(), my = ++tok; if(!q){ list.innerHTML = ''; sub.textContent = L({rur:`${TR_LANGS.find(l=>l.k === lang).n} tarjuma mein`, en:`In the ${TR_LANGS.find(l=>l.k === lang).n} translation`}); return; }
    const ref = q.match(/^(\d{1,3})\s*[:.\-]\s*(\d{1,3})$/);
    if(ref){ const sn = +ref[1], an = +ref[2]; if(sn >= 1 && sn <= 114 && an >= 1 && an <= QA_COUNTS[sn - 1]){ const abs = QA_CUM[sn - 1] + an; list.innerHTML = ''; sub.textContent = ''; renderTarjumaBook(qaAyahPage(abs), { abs }, sn); return; } }
    sub.textContent = L({rur:'Khoj rahe hain…', en:'Searching…'});
    let rows; try{ rows = await trSearchIndex(lang); }catch(e){ sub.textContent = L({rur:'Tarjuma load nahi hua', en:'Could not load the translation'}); return; }
    if(my !== tok) return;
    const toks = trNorm(q, lang).split(' ').filter(Boolean); if(!toks.length){ list.innerHTML = ''; return; }
    const hits = []; for(const r of rows){ if(toks.every(w=> r.n.includes(w))){ hits.push(r); if(hits.length >= 200) break; } }
    sub.textContent = hits.length ? L({rur:`${hits.length >= 200 ? '200+' : hits.length} nateeje`, en:`${hits.length >= 200 ? '200+' : hits.length} results`}) : L({rur:'Koi nateeja nahi mila.', en:'No match found.'});
    list.innerHTML = hits.slice(0, 60).map(r=> `<div class="dw-row ts-row" data-abs="${r.abs}" data-s="${r.s}"><div class="info"><div class="tr ts-ref">${r.s}. ${tbSurahName(r.s, lang === 'rom' ? 'rom' : lang)} · ${r.s}:${r.a}</div><div class="m ts-t"${ur ? ' dir="rtl" lang="ur"' : ''}>${hl(r.t, toks)}</div></div></div>`).join('') + (hits.length > 60 ? `<div class="backup-note" style="margin:8px 14px;">${L({rur:'Pehle 60 dikhaye gaye. Khoj mazeed tang karein.', en:'Showing the first 60. Narrow your search.'})}</div>` : '');
    list.querySelectorAll('.ts-row').forEach(el=>{ el.onclick = ()=>{ const abs = +el.dataset.abs; renderTarjumaBook(qaAyahPage(abs), { abs }, +el.dataset.s); }; });
  };
  inp.oninput = ()=>{ clearTimeout(tm); tm = setTimeout(run, 260); };
  inp.onkeydown = e=>{ if(e.key === 'Enter'){ clearTimeout(tm); run(); } };
  run(); setTimeout(()=> inp.focus(), 50);
}
navWrap('renderTarjumaSearch', 3);
/* ---- one list for every bookmark and note across the Mushaf, Tarjuma and Tafseer ---- */
function qmItems(){
  const out = [];
  (state.quranMarks || []).forEach(p=> out.push({ kind:'mark', sec:'', ic:'🔖📖', page:p, title:`${quranSurahOf(p).n}. ${quranSurahOf(p).name}`, sub:`${quranEdLabel()} · ${L({rur:'Page', en:'Page'})} ${p}`, open:()=> renderQuranReader(p) }));
  (state.tbMarks || []).forEach(p=>{ const sn = quranSurahOf(p); out.push({ kind:'mark', sec:'tb', ic:'🔖📘', page:p, title:`${sn.n}. ${sn.name}`, sub:`Tarjuma · ${L({rur:'Page', en:'Page'})} ${p}`, open:()=> renderTarjumaBook(p, { page:p }) }); });
  (state.tfMarks || []).forEach(p=>{ const s = tfSurahOf(p); out.push({ kind:'mark', sec:'tf', ic:'🔖📕', page:p, title:s ? `${s}. ${QURAN_SURAHS[s - 1].name}` : L({rur:'Muqaddima', en:'Introduction'}), sub:`Tafseer · ${L({rur:'Page', en:'Page'})} ${p}`, open:()=> renderTafseerPage(p) }); });
  notesList().filter(n=>n.page).forEach(n=>{ out.push({ kind:'note', sec:n.sec || '', id:n.id, ic:'📝', page:n.page, title:noteSecName(n).replace(/^\S+\s(?:·\s)?/, ''), sub:noteEsc(n.text).slice(0, 110), tag:n.ayah ? `${L({rur:'Ayat', en:'Ayah'})} ${qaSurahAyah(n.ayah).s}:${qaSurahAyah(n.ayah).a}` : '', open:()=> n.sec === 'tb' ? renderTarjumaBook(n.page, n.ayah ? { abs:n.ayah } : { page:n.page }, n.ayah ? qaSurahAyah(n.ayah).s : undefined) : n.sec === 'tf' ? renderTafseerPage(n.page) : renderQuranReader(n.page) }); });
  return out;
}
function renderQuranMarks(){
  document.getElementById('detailTitle').textContent = L({rur:'Nishaan aur Notes', en:'Bookmarks and Notes'});
  const all = qmItems(), marks = all.filter(x=>x.kind === 'mark'), notes = all.filter(x=>x.kind === 'note');
  const row = (x, i)=> `<div class="dw-row qm-row" data-i="${i}"><div class="info"><div class="tr">${x.ic} ${x.title}</div><div class="m">${x.tag ? '📌 ' + x.tag + ' · ' : ''}${x.sub}</div></div>${x.kind === 'mark' ? `<button type="button" class="bm-btn qm-del" data-i="${i}" aria-label="Remove">✕</button>` : ''}</div>`;
  document.getElementById('detailBody').innerHTML = `
    <div class="dw-section"><div class="dw-section-title"><span>🔖 ${L({rur:'Nishaan', en:'Bookmarks'})}</span><span class="dw-count">${marks.length}</span></div>${marks.length ? marks.map(x=> row(x, all.indexOf(x))).join('') : `<div class="empty-state">${L({rur:'Abhi koi nishaan nahi. Kisi page par 🔖 dabayein.', en:'No bookmarks yet. Tap 🔖 on any page.'})}</div>`}</div>
    <div class="dw-section"><div class="dw-section-title"><span>📝 Notes</span><span class="dw-count">${notes.length}</span></div>${notes.length ? notes.map(x=> row(x, all.indexOf(x))).join('') : `<div class="empty-state">${L({rur:'Abhi koi note nahi. Page par 📝 dabayein, ya Tarjuma mein kisi ayat ko dabaye rakhein.', en:'No notes yet. Tap 📝 on a page, or press and hold an ayah in Tarjuma.'})}</div>`}</div>`;
  document.querySelectorAll('.qm-row').forEach(r=>{ r.onclick = e=>{ if(e.target.closest('.qm-del')) return; all[+r.dataset.i].open(); }; });
  document.querySelectorAll('.qm-del').forEach(b=>{ b.onclick = ()=>{ const x = all[+b.dataset.i], key = x.sec === 'tb' ? 'tbMarks' : x.sec === 'tf' ? 'tfMarks' : 'quranMarks'; state[key] = (state[key] || []).filter(p=> p !== x.page); saveState(); renderQuranMarks(); }; });
}
navWrap('renderQuranMarks', 1);
/* ============================================================ TAFSEER ============================================================ */
const TF_PAGES = 1976;   /* TF_SURAH (first page of each surah) are in 09i-tfdata.js */
const tfImg = n => 'tafseer/p' + String(n).padStart(4, '0') + '.png';
const tfPageList = Array.from({ length: TF_PAGES }, (_, i)=> i + 1);
function tfSurahOf(n){ let r = 0; for(let i = 0; i < TF_SURAH.length; i++) if(TF_SURAH[i] <= n) r = i + 1; return r; }   /* 0 = introduction */
/* matches surah names in Latin, Urdu/Arabic and Hindi letters alike */
const tfNorm = t => String(t).toLowerCase().normalize('NFC').replace(/[أإآٱ]/g, 'ا').replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '').replace(/[يى]/g, 'ی').replace(/ك/g, 'ک').replace(/ة/g, 'ہ').replace(/[\u093C]/g, '');
function renderTafseerIndex(){
  document.getElementById('detailTitle').textContent = L({rur:'Tafseer', en:'Tafseer'});
  const cur = state.tfPage || 0, curS = tfSurahOf(cur);
  const intro = `<div class="more-item quran-idx-item ${cur && !curS ? 'on' : ''}" data-pg="1"><div class="ic">📖</div><div class="lbl">${L({rur:'Muqaddima', en:'Introduction'})}<span class="lblSub">${L({rur:"Qur'an ke baare mein", en:'About the Quran'})}</span></div><div class="qi-page">${L({rur:'Page', en:'Page'})} 1</div></div>`;
  const items = QURAN_SURAHS.map((x, i)=>`<div class="more-item quran-idx-item ${curS === x.n ? 'on' : ''}" data-pg="${TF_SURAH[i]}" data-f="${tfNorm(x.n + ' ' + x.name + ' ' + String(x.name).replace(/^(al|an|ar|as|at|ad|az|ash|adh|ath)-/i, '') + ' ' + (x.ar || '') + ' ' + (TB_HI[i] || ''))}"><div class="ic">${x.n}</div><div class="lbl">${x.name}<span class="lblSub ar-font">${x.ar}</span></div><div class="qi-page">${L({rur:'Page', en:'Page'})} ${TF_SURAH[i]}</div></div>`).join('');
  document.getElementById('detailBody').innerHTML = `
    <div class="backup-note">${L({rur:"Aasan Tarjuma Qur'an, Mufti Muhammad Taqi Usmani. Abhi sirf Urdu mein hai. Page tasveer ki shakal mein hain, pehli baar kholne par internet chahiye; jo page ek baar khul gaya woh offline bhi chalta hai.", en:'Aasan Tarjuma Quran by Mufti Muhammad Taqi Usmani, Urdu only for now. Pages are pictures, so they need internet the first time; a page you have opened works offline afterwards.'})}</div>
    <div class="qi-sticky"><div class="search-bar-wrap" style="margin:0 14px 10px;"><input id="tfSearch" type="search" inputmode="search" autocomplete="off" placeholder="${L({rur:'Surah ka naam ya number', en:'Surah name or number'})}"></div></div>
    <div class="more-list" style="padding-top:0;">${intro}${items}</div>
    <div class="quran-jump"><span>${L({rur:'Page par jaayein', en:'Go to page'})}</span><input type="number" id="tfJump" min="1" max="${TF_PAGES}" value="${cur || 1}"><button id="tfJumpBtn">${L({rur:'Jaayein', en:'Go'})}</button></div>`;
  const body = document.getElementById('detailBody');
  body.querySelectorAll('[data-pg]').forEach(el=> el.onclick = ()=> renderTafseerPage(+el.dataset.pg));
  const s = document.getElementById('tfSearch');
  s.oninput = ()=>{ const q = tfNorm(s.value.trim()); body.querySelectorAll('[data-f]').forEach(el=>{ el.style.display = !q || el.dataset.f.includes(q) ? '' : 'none'; }); };
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
