/* ===== 4 Tasveer, 1 Surah =====
   Start with 2 pictures; more pictures can be revealed one by one (each costs a point). 2 chances, 2 hints.
   Points per question: 5 with 2 pictures, 4 with 3, 3 with 4. Each hint -1, a correct answer on the 2nd chance -1 (never below 1). */
const SP_DISC = { rur: 'Ye tasveerein sirf yaad rakhne ke liye bani hain, tafseer nahi. Anbiya aur farishton ki tasveer nahi banayi jati, unki jagah asa, kashti ya chiraagh jaisi nishani hai. Surah ke mazmoon ke liye tafseer aur ulema se mashwara karein.', en: 'These pictures are memory aids only, not tafseer. Prophets and angels are never drawn; a symbol such as a staff, ark or lamp stands in. For the meaning of a surah consult tafseer and your ulema.' };
let khSp = null;
const spMeta = n=>{ const s = QURAN_SURAHS[n - 1], pg = s.page, ay = CL_AYAT[n - 1];
  return { name: s.name, ar: s.ar, ay, madani: CL_MADANI.has(n), para: quranParaOf(pg), manzil: quranManzilOf(pg), size: ay >= 100 ? 'lambi' : ay >= 30 ? 'darmiyani' : 'chhoti' }; };
function khSpQs(cnt){
  const nums = lzShuffle(Array.from({ length: 114 }, (_, i)=> i + 1)).slice(0, cnt);
  return nums.map(n=>{
    const wrong = lzShuffle(Array.from({ length: 114 }, (_, i)=> i + 1).filter(x=> x !== n)).slice(0, 3);
    return { n, pics: SP_PICS[n - 1].map(k=> spPic(k)), o: lzShuffle([n, ...wrong]).map(x=> spMeta(x).name), a: spMeta(n).name };
  });
}
function khSpStart(){
  khTitle(L({ rur: '4 Tasveer, 1 Surah', en: '4 Pictures, 1 Surah' })); khClear();
  khSp = { i: 0, pts: 0, ok: 0, log: [], qs: khSpQs(khRounds()), lock: false }; khSpShow();
}
function khSpShow(){
  const G = khSp, q = G.qs[G.i]; G.imgs = 2; G.hints = 0; G.tries = 0; G.excl = []; G.lock = false; G.hintTxt = [];
  khSpDraw();
}
const khSpPts = G=> Math.max(1, ({ 2: 5, 3: 4, 4: 3 })[G.imgs] - G.hints - (G.tries ? 1 : 0));
function khSpDraw(){
  const G = khSp, q = G.qs[G.i], m = spMeta(q.n);
  khBody().innerHTML = `<div class="lz">${khHead(`${G.i + 1}/${G.qs.length}`, `<span class="kh-mist">⭐ <b>${G.pts}</b></span>`)}
    <div class="quiz-card"><div class="quiz-q">${L({ rur: 'In tasveeron ka kaun si Surah se talluq hai?', en: 'Which surah do these pictures connect to?' })}</div>
      <div class="sp-grid">${q.pics.map((p, i)=> i < G.imgs ? `<div class="sp-cell">${p}</div>` : `<div class="sp-cell sp-lock">❓</div>`).join('')}</div>
      <div class="kh-disc kh-disc-s">ℹ️ ${L({ rur: 'Tasveerein sirf yaad rakhne ke liye hain, tafseer nahi.', en: 'Pictures are memory aids, not tafseer.' })}</div>
      <div class="sp-info">${L({ rur: 'Is sawal ke points', en: 'Points for this question' })}: <b>${khSpPts(G)}</b> · ${L({ rur: 'Mauqe', en: 'Chances' })}: <b>${2 - G.tries}</b></div>
      ${G.hintTxt.length ? `<div class="sp-hint">${G.hintTxt.map(h=> `💡 ${h}`).join('<br>')}</div>` : ''}
      <div class="sp-acts"><button type="button" class="kh-act" id="spMore" ${G.imgs >= 4 || G.lock ? 'disabled' : ''}>🖼️ ${L({ rur: 'Agli tasveer', en: 'Next picture' })}</button>
      <button type="button" class="kh-act" id="spHint" ${G.hints >= 2 || G.lock ? 'disabled' : ''}>💡 ${L({ rur: 'Hint', en: 'Hint' })} (${2 - G.hints})</button></div></div>
    <div class="quiz-opts">${q.o.map((o, i)=> `<button type="button" class="quiz-opt qopt-${'ABCD'[i]}" data-o="${o.replace(/"/g, '&quot;')}" ${G.excl.includes(o) ? 'disabled style="opacity:.45"' : ''}><span class="opt-letter">${'ABCD'[i]}</span><span class="quiz-opt-txt">${o}</span></button>`).join('')}</div>
    <div id="khNextWrap"></div><div class="lz-toast" id="lzToast"></div></div>`;
  document.getElementById('spMore').onclick = ()=>{ if(G.lock || G.imgs >= 4) return; G.imgs++; khSpDraw(); };
  document.getElementById('spHint').onclick = ()=>{ if(G.lock || G.hints >= 2) return;
    G.hintTxt.push(G.hints === 0 ? L({ rur: `${m.madani ? 'Madani' : 'Makki'} surah, ${m.size} surah hai (${m.ay} ayat).`, en: `${m.madani ? 'Madani' : 'Makki'} surah, ${m.size}, ${m.ay} verses.` }) : L({ rur: `Shuru Para ${m.para.n} (${m.para.name}) mein, ${m.manzil.name} mein aati hai.`, en: `Starts in Para ${m.para.n} (${m.para.name}), ${m.manzil.name}.` }));
    G.hints++; khSpDraw(); };
  document.querySelectorAll('.quiz-opt').forEach(b=>{ b.onclick = ()=>{
    if(G.lock) return; const ok = b.dataset.o === q.a;
    if(ok){ G.lock = true; const pts = khSpPts(G); G.pts += pts; G.ok++; lzOk(); lzVib(20); khSpDone(true, pts, b); }
    else { lzBad(); lzVib([40, 40, 40]); khShake(b); G.excl.push(b.dataset.o); G.tries++;
      if(G.tries >= 2){ G.lock = true; khSpDone(false, 0, b); }
      else { if(G.imgs < 4) G.imgs++; setTimeout(khSpDraw, 450); } }
  }; });
}
function khSpDone(ok, pts, btn){
  const G = khSp, q = G.qs[G.i], m = spMeta(q.n), wait = (khAnsSecs() + (ok ? 0 : 1)) * 1000;
  document.querySelectorAll('.quiz-opt').forEach(x=>{ x.disabled = true; if(x.dataset.o === q.a) x.classList.add('correct'); }); if(!ok) btn.classList.add('wrong');
  document.querySelectorAll('.sp-cell').forEach((c, i)=>{ if(c.classList.contains('sp-lock')){ c.classList.remove('sp-lock'); c.innerHTML = q.pics[i]; } });
  const why = `${q.n}. ${m.name} (${m.ar}) — ${m.madani ? 'Madani' : 'Makki'}, ${m.ay} ayat, Para ${m.para.n} se shuru, ${m.manzil.name}.`;
  G.log.push({ ok, q: L({ rur: `Surah pehchaniye (${G.imgs} tasveerein dikhi)`, en: 'Guess the surah' }), a: q.a, why });
  lzToast(`${ok ? '+' + pts + ' ' : ''}${why}`, ok ? 'ok' : 'bad', khAutoOn() ? wait : 600000);
  khNext(wait, G.i + 1 >= G.qs.length, ()=>{ G.i++; G.i >= G.qs.length ? khSpEnd() : khSpShow(); });
}
function khSpEnd(){
  const G = khSp, max = G.qs.length * 5, pct = G.pts / max;
  khResult('surahpic', pct >= .7 ? 'MashaAllah!' : L({ rur: 'Shabaash!', en: 'Well done!' }), G.pts, max, khStarsFor(pct), `<p class="lz-note">${L({ rur: `Sahi jawab: ${G.ok}/${G.qs.length}`, en: `Correct: ${G.ok}/${G.qs.length}` })}</p><div class="kh-disc kh-disc-s">ℹ️ ${L(SP_DISC)}</div>`, khSpStart, G.log, `4 Tasveer, 1 Surah: ${G.pts}/${max} (Waqt24)`);
}
