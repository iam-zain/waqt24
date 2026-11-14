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
/* the Prophet's name always carries the salawat: Muhammad ﷺ (all four languages; skipped where it is already written) */
function trSal(t, lang){
  if(!t) return t; const SAL = '\uFDFA', after = '(?!\\s*(?:' + SAL + '|\\(\\s*(?:صلی|ﷺ|sallallahu|salallahu)))';
  if(lang === 'en' || lang === 'rom') return t.replace(new RegExp('\\b(M[uo]h+a?mm?[ae]d)\\b' + after, 'gi'), (m)=> (lang === 'rom' ? 'Muhammad' : m) + ' ' + SAL);
  if(lang === 'ur') return t.replace(new RegExp('(محمد)(?![\\u0600-\\u06FF])' + after, 'g'), '$1 ' + SAL);
  if(lang === 'hi') return t.replace(new RegExp('(म[ुो]हम्मद)(?![\\u0900-\\u097F])' + after, 'g'), '$1 ' + SAL);
  return t;
}
async function trLoad(s, lang){
  const key = lang + s; if(TR_MEM[key]) return TR_MEM[key];
  const def = TR_LANGS.find(l=>l.k === lang), conv = def.conv === 'roman' ? (x=> devaToRoman(x).replace(/\btumko ko\b/gi, m=> m.slice(0, 5))) : (x=>x);
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
