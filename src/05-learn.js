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
    chip.onclick = ()=>{ aadaabCat = (aadaabCat===c.id ? '__all__' : c.id); renderAadaab(); };
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
  if(!filtered.length){ wrap.innerHTML = sgEmpty(aadaabSearch, AADAAB_TOPICS.map(t=>t.title), 'aadaabSearchInput', 'Koi unwan nahi mila.'); return; }
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
      { sc:4, n:'④', ic:'🌹', lbl:'Nabi ﷺ Ka Amal', txt:t.nabi },
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
    ${aadaabSceneHtml(t0)}
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
  document.getElementById('aadaabImgBtn').onclick = ()=> openCardShareChooser({ scene:aadaabSceneSvg(t0), kind:'Aadaab-e-Zindagi', title:t.title, sub:c.label, body:t.guide ? t.closing : t.tabdeeli, });
  document.getElementById('aadaabSochBtn').onclick = ()=>{ setAadaabStatus(t.id, 'soch'); openAadaabDetail(t); };
  document.getElementById('aadaabAmalBtn').onclick = ()=>{ setAadaabStatus(t.id, 'amal'); openAadaabDetail(t); };
  wirePnBar();
}

function renderMoreHadees(){
  document.getElementById('detailTitle').textContent="Hadees";
  const cats = [...new Set(HADEES.flatMap(hadeesCats))].sort((a,b)=>a.localeCompare(b));
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
    const count = HADEES.filter(h=>hadeesCats(h).includes(c)).length;
    const chip = document.createElement('div');
    chip.className = 'chip' + (hadeesFilter===c ? ' prayed' : '');
    chip.textContent = `${hadeesMeta(c)[0]} ${c} (${count})`;
    chip.onclick = ()=>{ hadeesFilter = (hadeesFilter===c ? 'All' : c); renderMoreHadees(); };
    catsEl.appendChild(chip);
  });
  renderHadeesList();
}
function renderHadeesList(){
  const wrap = document.getElementById('hList');
  const q = hadeesSearch.trim().toLowerCase();
  const items = HADEES.filter(h=> (hadeesFilter==='All'||hadeesCats(h).includes(hadeesFilter)) && (h.txt+' '+h.src+' '+hadeesCats(h).join(' ')).toLowerCase().includes(q)).sort((a,b)=>a.txt.localeCompare(b.txt));
  if(!items.length){ wrap.innerHTML = sgEmpty(hadeesSearch, HADEES.map(h=>h.txt.slice(0, 32)), 'hSearchInput', 'Koi hadees nahi mili.'); return; }
  wrap.innerHTML = items.map((h,i)=>{
    const st = duaStatus(hadeesKey(h));
    return `<div class="aad-card status-${st||'none'}" data-i="${i}" style="--aad-c:${hadeesMeta(h.cat)[1]};">
      <div class="aad-ic">${hadeesMeta(h.cat)[0]}</div>
      <div class="aad-info">
        <div class="aad-title">${hTxt(h).length>110 ? hTxt(h).slice(0,110).trimEnd()+'...' : hTxt(h)}</div>
        <div class="aad-tags"><span class="aad-tag">${h.src}</span></div>
        <div class="aad-cat-lbl">${hadeesCats(h).join(' · ')}</div>
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
const HADEES_CAT_META = { 'Samaaj':['🏘️','#3f9d6b'], 'Jannat':['🌿','#2f9e6b'], 'Parivaar':['🏠','#d28a3c'], 'Khawateen':['🌷','#d6708f'], 'Azaan':['🔊','#2fb6b0'], 'Akhlaq':['🤝','#3f8fe0'], 'Ilm':['📚','#9b6fd6'], 'Namaz':['🕌','#2fb6b0'], 'Ramzan':['🌙','#c79a2e'], 'Sadqa':['💝','#e0893f'], 'Zikr':['📿','#2fb6b0'], 'Imaan':['💎','#5c7cfa'], 'Ibadat':['🕋','#b5832b'], 'Tauba':['💧','#4a8fd0'], 'Aadaab':['🪴','#d6708f'] };
/* a hadees has one main category and may carry extra topics (h.tags), e.g. Khawateen + Samaaj */
function hadeesCats(h){ return [h.cat, ...(h.tags||[])]; }
/* "Isi topic par aur": up to 4 related hadees / duas, ranked by how many topics they share (the very broad Quranic and Rabbana tags are ignored) */
const REL_SKIP = ['Quranic','Rabbana'];
function relatedItems(self, pool, topicsFn, max){
  const mine = topicsFn(self).filter(t=>!REL_SKIP.includes(t));
  return pool.filter(x=>x!==self)
    .map(x=>({ x, n: topicsFn(x).filter(t=>mine.includes(t)).length }))
    .filter(o=>o.n>0)
    .sort((a,b)=> b.n-a.n || String(a.x.title||a.x.txt).localeCompare(String(b.x.title||b.x.txt)))
    .slice(0, max||4).map(o=>o.x);
}
function relatedHtml(items, titleFn, subFn, iconFn, colorFn){
  if(!items.length) return '';
  return `<details class="rel-sec"><summary class="rel-head"><span>${L({rur:'Isi topic par aur', en:'More on this topic'})}</span><span class="rel-n">${items.length}</span><span class="rel-chev">›</span></summary><div class="rel-list">${items.map((x,i)=>`<div class="aad-card rel-card" data-ri="${i}" style="--aad-c:${colorFn(x)};"><div class="aad-ic">${iconFn(x)}</div><div class="aad-info"><div class="aad-title">${titleFn(x)}</div><div class="aad-cat-lbl">${subFn(x)}</div></div><div class="chev">›</div></div>`).join('')}</div></details>`;
}
function wireRelated(items, openFn, navCat){
  document.querySelectorAll('#detailBody .rel-card').forEach(el=>{
    el.onclick = ()=>{ const i = +el.dataset.ri; setNavCtx(items, i, openFn, navCat()); openFn(items[i]); const b = document.getElementById('detailBody'); if(b) b.scrollTop = 0; };
  });
}
function hadeesRelated(h){ return relatedItems(h, HADEES, hadeesCats, 4); }
function hadeesRelatedHtml(h){
  return relatedHtml(hadeesRelated(h), x=>{ const t = hTxt(x); return t.length>90 ? t.slice(0,90).trimEnd()+'...' : t; }, x=>hadeesCats(x).join(' · '), x=>hadeesMeta(x.cat)[0], x=>hadeesMeta(x.cat)[1]);
}
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
    ${hadeesSceneHtml(h)}
    <div class="aad-head status-${st||'none'}" style="--aad-c:${hadeesMeta(h.cat)[1]};">
      <div class="aad-head-ic">${hadeesMeta(h.cat)[0]}</div>
      <div class="aad-head-title">${h.cat}</div>
      <div class="ref" style="margin:-4px 0 8px;">Hawala: ${h.src}</div>
      <div class="aad-cat-pill">${hadeesMeta(h.cat)[0]} Hadees</div>
      ${(h.tags||[]).length ? `<div class="aad-pill-row" style="margin-top:8px;flex-wrap:wrap;">${h.tags.map(t=>`<span class="aad-cat-pill" style="--aad-c:${hadeesMeta(t)[1]};">${hadeesMeta(t)[0]} ${t}</span>`).join('')}</div>` : ''}
      ${qaListenBtn(h.src, 'hadeesListenBtn') ? `<div class="aad-pill-row" style="margin-top:8px;">${qaListenBtn(h.src, 'hadeesListenBtn')}</div>` : ''}
    </div>
    <div class="dua-detail">
      <div class="aad-guide-sec hadees-sec">
        <div class="aad-guide-head"><span class="aad-step-lbl">Hadees</span></div>
        <div class="meaning hadees-txt">${hTxt(h)}</div>
      </div>
      ${h.exp ? `<div class="aad-guide-sec dua-sec-info hadees-exp">
        <div class="aad-guide-head"><span class="aad-step-lbl">${isEn() ? 'Explanation' : 'Samajhne ki Baat'}</span></div>
        <div class="meaning dua-info">${isEn() && h.enexp ? h.enexp : h.exp}</div>
      </div>` : ''}
    </div>
    ${hadeesRelatedHtml(h)}
    <div class="aad-status-row">
      <button class="aad-status-btn soch ${st==='soch'?'on':''}" id="hadeesSochBtn">⏳ Yaad karna baaqi hai</button>
      <button class="aad-status-btn amal ${st==='amal'?'on':''}" id="hadeesAmalBtn">✅ Yaad ho chuka hai</button>
    </div>
    ${pnBarHtml()}
  `;
  { const lb = document.getElementById('hadeesListenBtn'); if(lb) lb.onclick = ()=> qaListenRef(h.src); }
  wireRelated(hadeesRelated(h), openHadeesDetail, hadeesNavCat);
  document.getElementById('hadeesSochBtn').onclick = ()=>{ setDuaStatus(key, 'soch'); openHadeesDetail(h); };
  document.getElementById('hadeesAmalBtn').onclick = ()=>{ setDuaStatus(key, 'amal'); openHadeesDetail(h); };
  document.getElementById('hadeesImgBtn').onclick = ()=> openCardShareChooser({ scene:hadeesSceneSvg(h), kind:'Hadees', title:h.cat, body:hTxt(h), foot:'Hawala: '+h.src });
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
  "Seerat-un-Nabi ﷺ":"🌹", "Ambiya-e-Kiram AS":"⭐", "Ahadees aur Sunnat":"📜", "Duain":"🤲",
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
    QUIZ_BANK.push([`"${w.tr}" (${w.ar}) ka matlab kya hai?`, options, correctIdx, "Khaas Shabd", undefined, { u:`${w.tr}: ${w.m}. ${w.ex}`, e:`${w.tr}: ${w.en || w.m}. ${w.exen || ""}` }]);
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
function nameAccent(which){ return which==='asma' ? 'var(--accent)' : '#3fa8a0'; }
function renderNamesList(which){
  const dataset = which==='asma' ? ASMA_UL_HUSNA : PROPHET_NAMES;
  const title = which==='asma' ? 'Asma-ul-Husna' : 'Asma-ul-Nabi';
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
    ${asmaFullBarHtml()}
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
      ${i < ASMA_CLIPS ? `<button class="asma-pl" data-i="${i}" aria-label="${L({rur:'Yeh naam sunein', en:'Listen to this name'})}">▶</button>` : ''}
      <div class="chev">›</div>
    </div>`;
  }).join('');
  grid.querySelectorAll('.asma-pl').forEach(b=>{ b.onclick = e=>{ e.stopPropagation(); asmaPlayOne(+b.dataset.i, which); }; });
  asmaWireFull();
  grid.querySelectorAll('[data-idx]').forEach(el=>{
    el.onclick = ()=>{
      const i = parseInt(el.dataset.idx);
      if(typeof asmaOpenName === 'function') asmaOpenName();   // opening a name pauses the full audio (resumable) or stops a single name
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
    ${nameSceneHtml(which, w)}
    <div class="aad-head status-${st||'none'}" style="--aad-c:${nameAccent(which)};">
      <div class="aad-head-ic">🔤</div>
      <div class="aad-head-title ar-font">${w.ar}</div>
      <div class="aad-cat-pill">${w.tr}</div>
    </div>
    ${idx < ASMA_CLIPS ? `<button class="asma-listen" data-i="${idx}"><span class="asma-li">▶</span> <span class="asma-lt">${L({rur:'Yeh naam sunein', en:'Listen to this name'})}</span></button>${asmaOptsHtml()}` : ''}
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
  document.getElementById('nameImgBtn').onclick = ()=> openCardShareChooser({ scene:nameSceneSvg(which, w), kind: which==='asma' ? 'Asma-ul-Husna' : 'Asma-ul-Nabi', arabic:w.ar, title:w.tr, body:isEn() && w.en ? w.en : w.m });
  { const lb = document.querySelector('.asma-listen'); if(lb){ lb.onclick = ()=> asmaPlayOne(idx, which); asmaWireOpts(); asmaUI(); } }
  wirePnBar();
}

/* ============================================================
   KHAAS SHABD (Islamic Vocabulary)
   ============================================================ */
let shabdSearch = '';
const SHABD_CAT_ICON = {
  "Allah, Imaan aur Aqeeda":"🕋", "Allah ke Naam aur Sifaat":"💚", "Nabi, Rasool aur Ambiya":"🌟",
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
/* A word card in the same family as the Dua / Hadees / Aadaab cards: Arabic tile, word, meaning, category */
function shabdCardHtml(w){
  const col = (typeof shabdColor === 'function') ? shabdColor(w) : 'var(--accent)';
  const st = duaStatus('word:' + w.tr);
  return `<div class="aad-card status-${st||'none'}" data-idx="${w.i}" style="--aad-c:${col};">
      <div class="aad-ic qw-ic" dir="rtl"><span>${w.ar}</span></div>
      <div class="aad-info">
        <div class="aad-title">${w.tr}</div>
        <div class="aad-tags"><span class="aad-tag">${sMean(w)}</span></div>
        <div class="aad-cat-lbl">${w.cat}</div>
      </div>
      ${st==='amal' ? '<div class="aad-status-badge amal">✅</div>' : st==='soch' ? '<div class="aad-status-badge soch">⏳</div>' : ''}
      <div class="chev">›</div>
    </div>`;
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
    wrap.className = 'dua-grid list';
    wrap.innerHTML = results.map(w=>shabdCardHtml(w)).join('') || sgEmpty(shabdSearch, KHAAS_SHABD.map(w=>w.tr), 'shabdSearchInput', 'Koi lafz nahi mila.');
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
  wrap.className = '';
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
    <div class="search-bar-wrap">
      <input id="shabdCatSearchInput" placeholder="${isAll?'Sabhi mein dhoondhiye...':'Isi category mein dhoondhiye...'}">
      <button id="shabdCatSearchClear" class="search-clear-btn">✕</button>
    </div>
    <div class="dua-grid list" id="shabdCatList"></div>
  `;
  const renderList = ()=>{
    const wrap = document.getElementById('shabdCatList');
    const q = shabdCatSearch.trim().toLowerCase();
    const items = KHAAS_SHABD.map((w,i)=>({...w,i})).filter(w=> (isAll || w.cat===cat) && (w.tr+w.m).toLowerCase().includes(q));
    wrap.innerHTML = items.map(w=>shabdCardHtml(w)).join('') || sgEmpty(shabdCatSearch, KHAAS_SHABD.map(w=>w.tr), 'shabdCatSearchInput', 'Koi lafz nahi mila.');
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
  const shabdKey = 'word:' + w.tr, shabdSt = duaStatus(shabdKey);
  document.getElementById('detailTitle').textContent = w.cat;
  document.getElementById('detailBody').innerHTML = `
    <div class="detail-actions">${bmBtn('word:'+w.tr)}<button class="act-btn" id="shabdImgBtn" title="Share karein">${SHARE_SVG}</button></div>
    ${shabdSceneHtml(w)}
    <div class="aad-head status-${shabdSt||'none'}" style="--aad-c:${(typeof shabdColor === 'function') ? shabdColor(w) : 'var(--accent)'};">
      <div class="aad-head-ic">${SHABD_CAT_ICON[w.cat] || '📚'}</div>
      <div class="aad-head-title">${w.tr}</div>
      <div class="arabic qword-ar">${w.ar}</div>
      <div class="aad-cat-pill">${SHABD_CAT_ICON[w.cat] || '📚'} ${w.cat}</div>
    </div>
    <div class="dua-detail">
      <div class="aad-guide-sec qword-sec-m">
        <div class="aad-guide-head"><span class="aad-step-lbl">${isEn() ? 'Meaning' : 'Matlab'}</span></div>
        <div class="meaning qword-m">${sMean(w)}</div>
      </div>
      ${w.ex ? `<div class="aad-guide-sec qword-sec-ex">
        <div class="aad-guide-head"><span class="aad-step-lbl">${isEn() ? 'Example' : 'Misaal'}</span></div>
        <div class="meaning qword-m">${sEx(w)}</div>
      </div>` : ''}
    </div>
    <div class="aad-status-row">
      <button class="aad-status-btn soch ${shabdSt==='soch'?'on':''}" id="shabdSochBtn">⏳ Yaad karna baaki hai</button>
      <button class="aad-status-btn amal ${shabdSt==='amal'?'on':''}" id="shabdAmalBtn">✅ Yaad ho chuka hai</button>
    </div>
    ${pnBarHtml()}
  `;
  document.getElementById('shabdSochBtn').onclick = ()=>{ setDuaStatus(shabdKey, 'soch'); markLearnDay(); renderShabdDetail(idx, backFn); };
  document.getElementById('shabdAmalBtn').onclick = ()=>{ setDuaStatus(shabdKey, 'amal'); markLearnDay(); renderShabdDetail(idx, backFn); };
  document.getElementById('shabdImgBtn').onclick = ()=> openCardShareChooser({ scene:shabdSceneSvg(w), kind:'Khaas Shabd', arabic:w.ar, title:w.tr, body:w.m, foot:w.ex });
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
/* Khaas Shabd now shares one "Yaad" store (state.duaStatus) with Dua, Hadees, Aadaab and Alfaaz: known = amal, learning = soch */
function wordStatus(tr){
  const v = duaStatus('word:' + tr);
  return v === 'amal' ? 'known' : v === 'soch' ? 'learning' : null;
}
(function migrateWordStatus(){
  try{
    const old = state.wordStatus; if(!old || state.wordStatusV2) return;
    if(!state.duaStatus) state.duaStatus = {};
    Object.keys(old).forEach(tr=>{ const k = 'word:' + tr; if(!state.duaStatus[k] && (old[tr]==='known' || old[tr]==='learning')) state.duaStatus[k] = old[tr]==='known' ? 'amal' : 'soch'; });
    state.wordStatusV2 = true; saveState();
  }catch(e){}
})();
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
  if(!state.duaStatus) state.duaStatus = {};
  const k = 'word:' + tr;
  if(status) state.duaStatus[k] = status === 'known' ? 'amal' : 'soch'; else delete state.duaStatus[k];
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
      ${shabdSceneHtml(w)}
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
      ${pnBarCustom({ prevId:'wordPrevBtn', nextId:'wordNextBtn', pos:`${idx+1} / ${KHAAS_SHABD.length}` })}
      ${learning.length ? `<button id="wordReviewBtn" class="review-start-btn">🔁 Baaki Lafz ka Quiz (${learning.length})</button>` : ''}
      ${section('known', '✅ Yaad ho gaya', known, 'Abhi tak koi lafz "Yaad ho gaya" mark nahi hua.')}
      ${section('learning', '📖 Yaad karna baaki hai', learning, 'Abhi tak koi lafz "Yaad karna baaki hai" mark nahi hua.')}
    </div>
  `;
  const rvBtn = document.getElementById('wordReviewBtn');
  if(rvBtn) rvBtn.onclick = startWordReview;
  document.getElementById('wordImgBtn').onclick = ()=> openCardShareChooser({ scene:shabdSceneSvg(w), kind:'Aaj Ka Lafz', arabic:w.ar, title:w.tr, body:w.m, foot:w.ex });
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
    <div class="myth-qrow quiz">${mythIconHtml(m)}<div class="quiz-q">${mL(m).q}</div></div>
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
      document.getElementById('mythQuizRevealWrap').innerHTML = `<div class="quiz-reveal"><b>✅ Sahi Jawab: Option ${m.correctIdx===0?'A':'B'}</b><div class="myth-explain-txt" style="margin-top:6px;">${mythExplainHtml(mL(m).explain)}</div></div>`;
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
    ` +
    levels.map(level=>{
      const items = MYTH_BUSTERS.map((m,i)=>({...m,i})).filter(m=>m.level===level);
      return `<div class="myth-level-title">${isEn() && (MYTH_BUSTERS.find(x=>x.level===level)||{}).enLevel || level}</div>` + items.map(m=>{
        return `<div class="myth-card">
          <div class="myth-qrow">${mythIconHtml(MYTH_BUSTERS[m.i])}<div class="q">${m.i+1}. ${mL(m).q}</div></div>
          <div class="myth-opt-row">
            <div class="myth-opt-btn ${m.correctIdx===0?'correct':'wrong'}"><b class="opt-letter">A</b> ${mL(m).optA}</div>
            <div class="myth-opt-btn ${m.correctIdx===1?'correct':'wrong'}"><b class="opt-letter">B</b> ${mL(m).optB}</div>
          </div>
          <div class="myth-answer">✅ Sahi Jawab: Option ${m.correctIdx===0?'A':'B'}</div>
          <div class="myth-explain" style="display:block;">${mythExplainHtml(mL(m).explain)}</div>
        </div>`;
      }).join('');
    }).join('');
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
/* Personal practice: each question the player has met is remembered (short hash, not the text).
   c = right answers in a row, w = times missed. "Kamzor" (weak) = missed at least once and not yet right twice in a row. */
function qzKey(item){ const t = String(item[0] || ''); let h = 5381; for(let i = 0; i < t.length; i++) h = ((h << 5) + h + t.charCodeAt(i)) | 0; return (h >>> 0).toString(36); }
function qzStat(item){ return (state.quizStat || {})[qzKey(item)]; }
function qzRecord(item, ok){
  if(!state.quizStat) state.quizStat = {};
  const k = qzKey(item), st = state.quizStat[k] || { c:0, w:0 };
  if(ok){ st.c = Math.min(9, st.c + 1); } else { st.c = 0; st.w = Math.min(99, st.w + 1); }
  st.t = Math.floor(Date.now() / 86400000);
  state.quizStat[k] = st;
}
const qzIsWeak = item=>{ const st = qzStat(item); return !!st && st.w > 0 && st.c < 2; };
const qzIsNew = item=> !qzStat(item);
const qzIsSolid = item=>{ const st = qzStat(item); return !!st && st.c >= 2; };
function qzWeakAll(){ return QUIZ_BANK.filter(qzIsWeak); }
function renderMoreQuiz(){
  quizState = null;
  document.getElementById('detailBody').classList.remove('quiz-hiding');
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
    <button class="quiz-cat-btn lz-entry" id="lzOpenBtn" style="border-color:var(--accent);"><span class="quiz-cat-ic">🔤</span><span class="quiz-cat-name">${L({rur:'Lafz Talash (Khel)', en:'Word Search (Game)'})}</span><span class="quiz-cat-count">${L({rur:'Level', en:'Level'})} ${(state.lafz && state.lafz.lvl) || 1}</span></button>
    ${(()=>{ const d = quizSaved(); return d ? `<button class="quiz-cat-btn" id="quizResumeBtn" style="border-color:#2e9e5b;"><span class="quiz-cat-ic">▶️</span><span class="quiz-cat-name">${L({rur:'Quiz jaari rakhein', en:'Continue quiz'})}</span><span class="quiz-cat-count">${d.cat} · ${d.idx+1}/${d.questions.length}</span></button>` : ''; })()}
    ${quizProfileHtml()}
    ${(()=>{ const w = qzWeakAll().length; return w ? `<button class="quiz-cat-btn" id="quizWeakBtn" style="border-color:#e0893f;"><span class="quiz-cat-ic">🔁</span><span class="quiz-cat-name">${L({rur:'Galat sawal ki practice', en:'Practise missed questions'})}</span><span class="quiz-cat-count">${w} ${L({rur:'sawal', en:'questions'})}</span></button>` : ''; })()}
    <button class="quiz-cat-btn" data-cat="__all__" style="border-color:var(--accent);">
      <span class="quiz-cat-ic">🌐</span>
      <span class="quiz-cat-name">Sab Categories (Mix)</span>
      <span class="quiz-cat-count">${QUIZ_BANK.length} sawal</span>
    </button>
    ${catRows}
  `;
  body.querySelectorAll('.quiz-cat-btn[data-cat]').forEach(btn=>{
    btn.onclick = ()=> renderQuizCountSelect(btn.dataset.cat);
  });
  const lzb = document.getElementById('lzOpenBtn'); if(lzb) lzb.onclick = renderLafz;
  const rb = document.getElementById('quizResumeBtn');
  if(rb) rb.onclick = quizResume;
  const wb = document.getElementById('quizWeakBtn');
  if(wb) wb.onclick = ()=>{ const w = qzWeakAll(); startQuiz(w, Math.min(10, w.length), L({rur:'Galat sawal ki practice', en:'Missed questions'})); };
}

/* Colours for quiz categories, in alphabetical order; green is left out on purpose */
const QUIZ_PALETTE = ['var(--fard)','var(--nafil)','var(--special)','var(--meal)','var(--roza)','color-mix(in srgb, var(--fard) 55%, var(--special))','color-mix(in srgb, var(--nafil) 55%, var(--special))','color-mix(in srgb, var(--meal) 55%, var(--fard))','color-mix(in srgb, var(--roza) 55%, var(--meal))','color-mix(in srgb, var(--special) 55%, var(--meal))'];
let quizLevel = 'all';
function renderQuizCountSelect(cat){
  const base = cat==='__all__' ? QUIZ_BANK : QUIZ_BANK.filter(q=>q[3]===cat);
  const lv = { all:base, new:base.filter(qzIsNew), weak:base.filter(qzIsWeak), solid:base.filter(qzIsSolid) };
  if(!lv[quizLevel] || (quizLevel !== 'all' && !lv[quizLevel].length)) quizLevel = 'all';
  const pool = lv[quizLevel];
  document.getElementById('detailTitle').textContent = "Quiz";
  const body = document.getElementById('detailBody');
  const label = cat==='__all__' ? L({rur:'Sab Categories', en:'All categories'}) : cat;
  const LV = [['all','🎲',L({rur:'Sab', en:'All'})],['new','✨',L({rur:'Naye', en:'New'})],['weak','🎯',L({rur:'Kamzor', en:'Weak'})],['solid','💪',L({rur:'Pakke', en:'Solid'})]];
  body.innerHTML = `
    <div style="text-align:center; padding:26px 10px;">
      <div style="font-size:40px; margin-bottom:10px;">${cat==='__all__'?'🌐':(QUIZ_CAT_ICON[cat]||'❓')}</div>
      <div style="font-size:15px; font-weight:700; margin-bottom:6px;">${label}</div>
      <div class="qz-lv-lbl">${L({rur:'Kaun se sawal?', en:'Which questions?'})}</div>
      <div class="qz-lv">${LV.map(([k,ic,n])=>`<button type="button" data-lv="${k}" class="${quizLevel===k?'on':''}" ${lv[k].length ? '' : 'disabled'}><span>${ic}</span><b>${n}</b><em>${lv[k].length}</em></button>`).join('')}</div>
      <div class="qz-lv-note">${L({rur:'Naye: abhi tak nahi khele. Kamzor: galat hue, abhi 2 baar lagataar sahi nahi. Pakke: 2 baar lagataar sahi. Ye aapke apne jawabon se banta hai.', en:'New: not played yet. Weak: missed and not yet right twice in a row. Solid: right twice in a row. Based on your own answers.'})}</div>
      <div class="qz-auto"><span class="qz-opt-txt">⏱️ ${L({rur:'Timer (har sawal)', en:'Timer (per question)'})}</span><div class="qz-seg" id="quizTimerSeg">${QZ_TIMER.map(n=>`<button type="button" data-s="${n}" class="${quizSecsPref()===n?'on':''}">${n ? n + L({rur:' sec', en:' s'}) : L({rur:'Band', en:'Off'})}</button>`).join('')}</div></div>
      <div class="qz-auto"><span class="qz-opt-txt">⏭️ ${L({rur:'Agla sawal khud khule', en:'Next question opens by itself'})}</span><div class="qz-seg" id="quizAutoSeg">${QZ_AUTO.map(n=>`<button type="button" data-s="${n}" class="${(QZ_AUTO.includes(state.quizAutoSecs) ? state.quizAutoSecs : 0)===n?'on':''}">${n ? n + L({rur:' sec', en:' s'}) : L({rur:'Band', en:'Off'})}</button>`).join('')}</div></div>
      <div class="qz-lv-note" style="margin-top:6px;">💡 ${L({rur:'Hint: 5 sawal mein 2, 10 sawal mein 4 (50-50, Sandarbh, Skip, +10s, Do mauka). Ek sawal par ek hi hint. Hint se sahi jawab dene par wo sawal "Pakke" mein nahi ginta.', en:'Hints: 2 in 5 questions, 4 in 10 (50-50, Clue, Skip, +10s, 2 chances). One hint per question. A correct answer that used a hint does not count towards "Solid".'})}</div>
      <div style="font-size:13px; color:var(--sub); margin:18px 0 14px;">${L({rur:'Kitne sawal khelna chahte hain?', en:'How many questions?'})}</div>
      <div style="display:flex; gap:12px; justify-content:center;">
        <button id="quiz5" class="quiz-count-btn c5" ${pool.length ? '' : 'disabled'}>${Math.min(5, pool.length)} ${L({rur:'Sawal', en:'Questions'})}</button>
        <button id="quiz10" class="quiz-count-btn c10" ${pool.length >= 10 ? '' : 'disabled'}>10 ${L({rur:'Sawal', en:'Questions'})}</button>
      </div>
      <button id="quizBackToCats" style="margin-top:22px; background:none; border:none; color:var(--sub); font-size:12.5px; text-decoration:underline; cursor:pointer;">‹ ${L({rur:'Category Badlein', en:'Change category'})}</button>
    </div>
  `;
  body.querySelectorAll('[data-lv]').forEach(b=>{ b.onclick = ()=>{ quizLevel = b.dataset.lv; renderQuizCountSelect(cat); }; });
  document.querySelectorAll('#quizTimerSeg button').forEach(b=>{ b.onclick = ()=>{ state.quizTimerSecs = +b.dataset.s; state.quizTimer = !!state.quizTimerSecs; saveState(); document.querySelectorAll('#quizTimerSeg button').forEach(x=>x.classList.toggle('on', x===b)); }; });
  document.querySelectorAll('#quizAutoSeg button').forEach(b=>{ b.onclick = ()=>{ state.quizAutoSecs = +b.dataset.s; saveState(); document.querySelectorAll('#quizAutoSeg button').forEach(x=>x.classList.toggle('on', x===b)); }; });
  document.getElementById('quiz5').onclick = ()=> startQuiz(pool, Math.min(5, pool.length), label);
  document.getElementById('quiz10').onclick = ()=> pool.length >= 10 && startQuiz(pool, Math.min(10, pool.length), label);
  document.getElementById('quizBackToCats').onclick = renderMoreQuiz;
}

function logQuizResult(cat, score, total){
  if(!Array.isArray(state.quizLog)) state.quizLog = [];
  state.quizLog.push({ t: Date.now(), cat, score, total });
  if(state.quizLog.length > 1000) state.quizLog.shift();
  saveState();
}
/* Resume: the running quiz is kept in localStorage so the player can carry on where they left (not for quizzes that use hooks, e.g. Lafz review) */
const QZ_SAVE_KEY = 'waqt24_quiz_resume';
function quizSave(){
  try{
    const qs = quizState;
    if(!qs || (qs.hooks && Object.keys(qs.hooks).length)) return;
    const idx = qs.answered ? qs.idx + 1 : qs.idx;
    if(idx >= qs.questions.length){ localStorage.removeItem(QZ_SAVE_KEY); return; }
    const { questions, score, cat, wrong, timer, secs, auto, hints, hintsLeft, spare, results, streak, best, logged } = qs;
    localStorage.setItem(QZ_SAVE_KEY, JSON.stringify({ questions, idx, score, cat, wrong, timer, secs, auto, hints, hintsLeft, spare, results, streak, best, logged, at: Date.now() }));
  }catch(e){}
}
function quizSaved(){
  try{ const d = JSON.parse(localStorage.getItem(QZ_SAVE_KEY) || 'null'); return d && Array.isArray(d.questions) && d.idx < d.questions.length ? d : null; }catch(e){ return null; }
}
function quizSaveClear(){ try{ localStorage.removeItem(QZ_SAVE_KEY); }catch(e){} }
function quizResume(){
  const d = quizSaved(); if(!d) return;
  quizTimerStop();
  quizState = Object.assign({}, d, { answered: false, hooks: {}, extra: 0 });
  renderQuizQuestion();
}
function startQuiz(pool, n, cat, hooks){
  const shuf = shuffleArr(pool), picked = shuf.slice(0, n), spare = shuf.slice(n);
  const hints = quizHintsFor(picked.length);
  quizTimerStop();
  quizState = { questions: picked, idx: 0, score: 0, answered: false, cat: cat || 'Mix', wrong: [], hooks: hooks || {}, timer: quizSecsPref() > 0, secs: quizSecsPref(), auto: QZ_AUTO.includes(state.quizAutoSecs) ? state.quizAutoSecs : 0, hints, hintsLeft: hints, spare, extra: 0, results: [], streak: 0, best: 0 };
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
/* "Wajah": a short explanation shown after each answer, only where the data has one.
   Generated questions carry it (item[5] = {u, e}); Du'a and Qur'ani Alfaaz questions are looked up from DUAS / QURAN_WORDS.
   The hand-written questions have none yet, so they show only "Sahi Jawab". */
const QZ_AR_NORM = s=> String(s).replace(/[ً-ٰٟـۖ-ۭ]/g,'').replace(/[يى]/g,'ی').replace(/ك/g,'ک').replace(/[أإآٱ]/g,'ا').replace(/\s+/g,'');
let __qzWordMap = null;
function qzWordMap(){
  if(__qzWordMap) return __qzWordMap;
  const m = new Map(), dup = new Set();
  QURAN_WORDS.forEach(w=>{ const k = QZ_AR_NORM(w.ar); if(m.has(k)) dup.add(k); else m.set(k, w); });
  dup.forEach(k=>m.delete(k));   /* same spelling, different words: do not guess */
  return (__qzWordMap = m);
}
/* Namaz quiz: wajah (sourced) + context clue, keyed by the question text */
const QZ_NAMAZ = {"Namaz mein takbeer-e-tahrima kehte waqt haath kahan tak uthaye jate hain?": {"u": "Hanafi fiqh mein takbeer-e-tahrima par haath kaano ki lau tak uthaye jate hain. Kuch riwayaton mein kandhon tak uthana aaya hai (jaise Nasa'i 1059), isliye doosre madhab kandhon tak kehte hain. Ye jawab Hanafi fiqh ke mutabiq hai; doosre madhab mein farq ho sakta hai. Apne ulema se mashwara karein.", "e": "In Hanafi fiqh the hands are raised to the earlobes at the opening takbir. Some reports mention the shoulders (e.g. Nasa'i 1059), which is why other schools say shoulders. This answer follows Hanafi fiqh; other schools may differ. Please consult your ulema.", "cu": "Kuch riwayaton mein kandhe aaye hain, magar Hanafi tareeqa unse thoda upar ka hai.", "ce": "Some reports say shoulders, but the Hanafi method is a little higher."}, "Hanafi fiqh ke mutabiq mardon ke liye Qiyam mein haath kahan bandhna sunnat hai?": {"u": "Hanafi fiqh mein mard haath naaf ke neeche baandhte hain (right hand ko left par). Ye jawab Hanafi fiqh ke mutabiq hai; doosre madhab mein farq ho sakta hai. Apne ulema se mashwara karein.", "e": "In Hanafi fiqh men fold the hands below the navel (right hand over left). This answer follows Hanafi fiqh; other schools may differ. Please consult your ulema.", "cu": "Sawal Hanafi tareeqe ka hai: haath seene par nahi, usse neeche baandhe jate hain.", "ce": "This is about the Hanafi method: the hands are tied lower than the chest."}, "Fajr ki farz namaz mein kitni rakat hoti hain?": {"u": "Bukhari 350 (Aisha RA): namaz shuru mein do do rakat farz hui, phir muqeem ki namaz badhayi gayi. Fajr do hi rahi (ek riwayat mein wajah lambi qiraat batayi gayi hai).", "e": "Bukhari 350 (Aisha RA): prayer was first prescribed as two rak'ahs; later the resident's prayer was increased. Fajr stayed at two (one report gives its long recitation as the reason).", "cu": "Ye subah ki namaz hai; ise muqeem ke liye badhaya nahi gaya.", "ce": "This is the dawn prayer; it was not increased for residents."}, "Zuhr ki farz namaz mein kitni rakat hoti hain?": {"u": "Bukhari 350: muqeem ki namaz do se badha di gayi, aur Zuhr 4 rakat farz hai. Musafir 2 rakat padhta hai.", "e": "Bukhari 350: the resident's prayer was increased from two, and Zuhr is four farz rak'ahs. A traveller prays two.", "cu": "Pehle do do rakat thi, muqeem ke liye ye double ho gayi.", "ce": "It started as two rak'ahs and was doubled for residents."}, "Asr ki farz namaz mein kitni rakat hoti hain?": {"u": "Asr 4 farz rakat hai (Bukhari 350). Pehli do rakat mein Fatiha ke saath surah, aakhri do mein sirf Fatiha (Muslim 451, Abu Qatada RA).", "e": "Asr is four farz rak'ahs (Bukhari 350). In the first two the Fatiha is followed by a surah, in the last two only the Fatiha (Muslim 451, Abu Qatada RA).", "cu": "Ye Zuhr ke baad aur Maghrib se pehle ki namaz hai, aur uski farz rakaton ke barabar.", "ce": "It is offered after Zuhr and before Maghrib, with the same farz count as Zuhr."}, "Maghrib ki farz namaz mein kitni rakat hoti hain?": {"u": "Maghrib 3 rakat hai; Maghrib ko badhaya nahi gaya. Ek riwayat (Ibn Khuzaymah) mein ise din ki Witr kaha gaya hai.", "e": "Maghrib is three rak'ahs and was not increased. One report (Ibn Khuzaymah) calls it the Witr of the day.", "cu": "Ye taaq (odd) rakaton ki namaz hai.", "ce": "It has an odd number of rak'ahs."}, "Isha ki farz namaz mein kitni rakat hoti hain?": {"u": "Isha 4 farz rakat hai (musafir ke liye 2). Bukhari 350 ke mutabiq muqeem ki namaz badhayi gayi, Fajr aur Maghrib ko chhodkar.", "e": "Isha is four farz rak'ahs (two for a traveller). Per Bukhari 350 the resident's prayer was increased, except Fajr and Maghrib.", "cu": "Ye raat ki namaz hai, aur Zuhr ke barabar rakat wali.", "ce": "This is the night prayer, with the same count as Zuhr."}, "Hanafi fiqh mein Witr ki kitni rakat hain?": {"u": "Hanafi fiqh mein Witr wajib hai aur 3 rakat hai. Doosre aimma 1, 3, 5 jaisi taaq rakaton ki bhi ijazat dete hain. Ye jawab Hanafi fiqh ke mutabiq hai; doosre madhab mein farq ho sakta hai. Apne ulema se mashwara karein.", "e": "In Hanafi fiqh Witr is wajib and is three rak'ahs. Other schools also allow odd numbers like 1, 3 or 5. This answer follows Hanafi fiqh; other schools may differ. Please consult your ulema.", "cu": "Sawal Hanafi fiqh ka hai. Ye taaq rakaton ki namaz hai aur Maghrib ke barabar.", "ce": "The question is about Hanafi fiqh. It is an odd count, equal to Maghrib."}, "Witr ki teesri rakat mein Dua-e-Qunoot kab padhi jati hai?": {"u": "Hanafi fiqh mein Witr ki teesri rakat mein qiraat ke baad takbeer keh kar haath uthate hain, phir Dua-e-Qunoot, phir ruku. Doosre madhab mein qunoot ruku ke baad bhi aata hai. Ye jawab Hanafi fiqh ke mutabiq hai; doosre madhab mein farq ho sakta hai. Apne ulema se mashwara karein.", "e": "In Hanafi fiqh, in the third rak'ah of Witr after the recitation one says takbeer, raises the hands and recites Dua-e-Qunoot, then goes to ruku. Other schools also have it after ruku. This answer follows Hanafi fiqh; other schools may differ. Please consult your ulema.", "cu": "Hanafi tareeqe mein ye ruku se pehle hota hai, aur takbeer ke saath.", "ce": "In the Hanafi method it comes before ruku, with a takbeer."}, "Namaz mein Surah Fatiha ke baad kya padha jata hai?": {"u": "Pehli do rakat mein Fatiha ke baad koi surah ya kuch ayaat padhna Nabi ﷺ ka tareeqa hai; aakhri do mein sirf Fatiha (Abu Qatada RA, Bukhari 776, Muslim 451).", "e": "In the first two rak'ahs, reciting a surah or some verses after the Fatiha is the Prophet's ﷺ practice; in the last two only the Fatiha (Abu Qatada RA, Bukhari 776, Muslim 451).", "cu": "Fatiha ke saath Qur'an ka kuch hissa aur padha jata hai.", "ce": "Some more of the Qur'an is read along with the Fatiha."}, "Namaz mein ruku mein aam tor par kya tasbeeh padhi jati hai?": {"u": "Ruku mein 'Subhana Rabbiyal Azim' (mera Rabb bohat azeem hai) padhte hain, aam tor par teen baar (Nasa'i 1046, Ibn Majah 888, Hudhayfah RA).", "e": "In ruku we say 'Subhana Rabbiyal Azim' (Glory to my Lord, the Most Great), usually three times (Nasa'i 1046, Ibn Majah 888, Hudhayfah RA).", "cu": "Ruku mein Allah ki 'azmat' (bade hone) ka zikr hota hai.", "ce": "In ruku we speak of Allah's greatness."}, "Sajde mein aam tor par kya tasbeeh padhi jati hai?": {"u": "Sajde mein 'Subhana Rabbiyal A'la' (mera Rabb sab se buland hai) padhte hain, aam tor par teen baar (Nasa'i 1046, Ibn Majah 888, Hudhayfah RA).", "e": "In sajdah we say 'Subhana Rabbiyal A'la' (Glory to my Lord, the Most High), usually three times (Nasa'i 1046, Ibn Majah 888, Hudhayfah RA).", "cu": "Sajde mein Allah ke 'sab se buland' hone ka zikr hota hai.", "ce": "In sajdah we speak of Allah being 'the Most High'."}, "Ruku se uthte waqt Imam ya akela namaz padhne wala kya kehta hai?": {"u": "Ruku se uthte waqt Imam ya akela namaz padhne wala 'Sami'Allahu liman hamidah' (Allah ne us ki sun li jisne uski tareef ki) kehta hai (Bukhari 795, Abu Huraira RA). Muqtadi 'Rabbana wa lakal hamd' kehta hai (Ibn Majah 876).", "e": "When rising from ruku the imam or one praying alone says 'Sami'Allahu liman hamidah' (Allah hears the one who praises Him) (Bukhari 795, Abu Huraira RA). The follower says 'Rabbana wa lakal hamd' (Ibn Majah 876).", "cu": "Is jumle mein 'sun lene' ka zikr hai, aur uthne ke saath kaha jata hai.", "ce": "This phrase speaks of Allah 'hearing', and is said while rising."}, "Ruku se seedha kharay hone ke baad kya kaha jata hai?": {"u": "Seedha khade hone ke baad 'Rabbana wa lakal hamd' (ae hamare Rab, sab tareef tere hi liye hai) kaha jata hai (Bukhari 795, Ibn Majah 876).", "e": "After standing up straight one says 'Rabbana wa lakal hamd' (Our Lord, all praise is Yours) (Bukhari 795, Ibn Majah 876).", "cu": "Ye jumla 'hamare Rab' keh kar Allah ko pukarte hue shuru hota hai.", "ce": "This phrase begins by addressing Allah as 'our Lord'."}, "Do sajdon ke darmiyan kis halat mein baitha jata hai?": {"u": "Do sajdon ke beech ki baithak Jalsa kehlati hai. Hudhayfah RA ki riwayat (Abu Dawud 874) mein is dauraan 'Rabbighfir li' (ae mere Rab, mujhe bakhsh de) kehna aaya hai.", "e": "The sitting between the two sajdahs is called Jalsa. In Hudhayfah RA's report (Abu Dawud 874) 'Rabbighfir li' (My Lord, forgive me) is said at this point.", "cu": "Ye lafz do sajdon ke darmiyani baithak ka hai; Qa'dah aakhir ki ya pehli rakaton ke baad ki baithak hai.", "ce": "This word is for the pause between two sajdahs; Qa'dah is a different sitting, after rak'ahs."}, "Namaz mein pehla qa'dah kis namaz mein hota hai?": {"u": "Pehla qa'dah (do rakat ke baad baithak) un namazon mein hota hai jo 3 ya 4 rakat ki hon. 2 rakat ki namaz mein sirf ek hi baithak, yani aakhri, hoti hai.", "e": "The first qa'dah (sitting after two rak'ahs) occurs in prayers of 3 or 4 rak'ahs. A two-rak'ah prayer has just one sitting, the last.", "cu": "Sochein: kis namaz mein do rakat ke baad baithkar phir khade hona padta hai?", "ce": "Think: in which prayers do you sit after two rak'ahs and then stand again?"}, "Pehle qa'dah mein Hanafi fiqh ke mutabiq kya padha jata hai?": {"u": "Hanafi fiqh mein pehle qa'dah mein sirf Attahiyyat padhte hain. Agar bhool se Attahiyyat ke baad Durood shuru ho jaye ('Muhammad' tak) to Sajda-e-Sahw lazim aata hai. Ye jawab Hanafi fiqh ke mutabiq hai; doosre madhab mein farq ho sakta hai. Apne ulema se mashwara karein.", "e": "In Hanafi fiqh only the Tashahhud (Attahiyyat) is recited in the first sitting. If one starts the Durood by mistake (up to 'Muhammad') Sajda-e-Sahw becomes necessary. This answer follows Hanafi fiqh; other schools may differ. Please consult your ulema.", "cu": "Pehla qa'dah chhota hota hai; Durood baad wale qa'dah mein aata hai.", "ce": "The first sitting is short; the Durood belongs to the later sitting."}, "Aakhri qa'dah mein Attahiyyat ke baad kya padha jata hai?": {"u": "Hanafi fiqh mein aakhri qa'dah mein Attahiyyat ke baad Durood-e-Ibrahimi aur phir Qur'an ya hadees ke alfaaz wali dua padhna sunnat hai, phir salam. Ye jawab Hanafi fiqh ke mutabiq hai; doosre madhab mein farq ho sakta hai. Apne ulema se mashwara karein.", "e": "In Hanafi fiqh, in the last sitting after the Tashahhud it is Sunnah to recite the Durood-e-Ibrahimi and then a dua with words from the Qur'an or Hadith, then the salam. This answer follows Hanafi fiqh; other schools may differ. Please consult your ulema.", "cu": "Attahiyyat ke baad Nabi ﷺ par rehmat ki dua aur phir koi masnoon dua padhi jati hai.", "ce": "After the Tashahhud one sends blessings on the Prophet ﷺ and then makes a masnoon dua."}, "Namaz ka ikhtitam kis cheez se hota hai?": {"u": "Abu Dawud 61 aur Tirmidhi 3 (Ali RA): 'namaz ki kunji paaki hai, uska tahrim (haram karne wala) takbeer aur tahleel (halal karne wala) salam hai.' Yani namaz salam se khatam hoti hai.", "e": "Abu Dawud 61 and Tirmidhi 3 (Ali RA): 'The key to prayer is purification, its tahrim is the Takbir and its tahlil is the Taslim (salam).' So the prayer ends with the salam.", "cu": "Hadees mein kaha gaya ke namaz ka shuru karne wala amal takbeer hai; iske muqable ka amal usse khatam karta hai.", "ce": "The hadith says the opening act is the takbeer; its counterpart closes the prayer."}, "Salam mein pehle kis taraf munh pherna sunnat hai?": {"u": "Namaz ka salam pehle daayen taraf, phir baayen taraf 'Assalamu alaikum wa rahmatullah' keh kar phera jata hai.", "e": "The salam is given first to the right, then to the left, saying 'Assalamu alaikum wa rahmatullah'.", "cu": "Islam mein achhe kaam aam tor par isi taraf se shuru karna pasandeeda hai.", "ce": "In Islam good acts are generally preferred to begin from this side."}, "Namaz ke liye Wuzu toot jane ki surat mein kya karna zaroori hai?": {"u": "Bukhari 135 (Abu Huraira RA): jis ka wuzu toot jaye uski namaz qubool nahi hoti jab tak wo dobara wuzu na kar le.", "e": "Bukhari 135 (Abu Huraira RA): the prayer of one whose wudu has broken is not accepted until he performs wudu again.", "cu": "Hadees: wuzu tootne par namaz tab tak qubool nahi jab tak wuzu naya na ho.", "ce": "Hadith: after the wudu breaks, the prayer is not accepted until wudu is renewed."}, "Qibla ki taraf rukh karna namaz ki kis cheez mein shamil hai?": {"u": "Qibla ki taraf rukh karna namaz ki sharaait mein se hai. Qur'an 2:144: 'Masjid-e-Haram ki taraf apna rukh karo aur tum jahan bhi ho usi ki taraf rukh karo.'", "e": "Facing the qibla is one of the conditions of prayer. Qur'an 2:144 commands turning towards al-Masjid al-Haram, wherever you are.", "cu": "Qur'an ki ayat (2:144) mein is ka hukm 'tum jahan bhi ho' ke alfaaz ke saath aaya hai.", "ce": "Qur'an 2:144 gives this command with the words 'wherever you are'."}, "Namaz ke liye badan, kapray aur jagah ka paak hona kya hai?": {"u": "Abu Dawud 61 aur Tirmidhi 3: 'namaz ki kunji paaki hai.' Badan, kapre aur jagah ki paaki namaz ki aham sharaait mein se hai.", "e": "Abu Dawud 61 and Tirmidhi 3: 'The key to prayer is purification.' Purity of body, clothes and place is among the main conditions of prayer.", "cu": "Hadees mein paaki ko namaz ki 'kunji' kaha gaya hai.", "ce": "A hadith calls purity the 'key' to prayer."}, "Hanafi fiqh ke mutabiq mardon ke liye namaz mein Satr-e-Aurat ki had kya hai?": {"u": "Hanafi fiqh mein mard ka satr naaf ke neeche se ghutnon samet hai (ghutne bhi satr mein shamil hain). Namaz mein satr dhakna sharat hai. Ye jawab Hanafi fiqh ke mutabiq hai; doosre madhab mein farq ho sakta hai. Apne ulema se mashwara karein.", "e": "In Hanafi fiqh a man's satr is from below the navel to and including the knees. Covering it is a condition of prayer. This answer follows Hanafi fiqh; other schools may differ. Please consult your ulema.", "cu": "Hanafi mein ghutne bhi dhakne ke hukm mein aate hain.", "ce": "In Hanafi fiqh the knees are also covered."}, "Jamat mein Imam ke peeche Muqtadi ko Qiraat ke bare mein Hanafi fiqh ka kya hukm hai?": {"u": "Hanafi fiqh mein muqtadi imam ke peeche qiraat nahi karta; imam ki qiraat uske liye kaafi hai. Doosre madhab (jaise Shafi'i) Fatiha padhne ko zaroori kehte hain; ulema mein ikhtilaf hai. Ye jawab Hanafi fiqh ke mutabiq hai; doosre madhab mein farq ho sakta hai. Apne ulema se mashwara karein.", "e": "In Hanafi fiqh the follower does not recite behind the imam; the imam's recitation suffices. Other schools (e.g. Shafi'i) require the Fatiha; scholars differ. This answer follows Hanafi fiqh; other schools may differ. Please consult your ulema.", "cu": "Sawal Hanafi hukm ka hai: muqtadi ke liye khamoshi.", "ce": "The question is the Hanafi ruling: silence for the follower."}, "Jumu'ah ki farz namaz kitni rakat hai?": {"u": "Jumu'ah 2 rakat farz hai (Nasa'i 1420, Umar RA: 'Jumu'ah ki namaz do rakat hai'). Ye Zuhr ki jagah padhi jati hai.", "e": "Jumu'ah is two farz rak'ahs (Nasa'i 1420, Umar RA). It takes the place of Zuhr.", "cu": "Ye Zuhr ki 4 rakat ki jagah aati hai, aur isko Eid ki namaz ke barabar rakat wali kaha gaya.", "ce": "It replaces Zuhr's four rak'ahs and has the same count as the Eid prayers."}, "Jumu'ah ki namaz se pehle kya hota hai?": {"u": "Jumu'ah se pehle imam do khutbe deta hai, jo namaz se pehle hote hain. Qur'an 62:9 mein Jumu'ah ki azaan par Allah ke zikr ki taraf daudne ka hukm hai.", "e": "Before Jumu'ah the imam gives two khutbas, delivered before the prayer. Qur'an 62:9 commands hastening to the remembrance of Allah at the Friday call.", "cu": "Imam khade ho kar do baar logon se khitab karta hai, phir namaz hoti hai.", "ce": "The imam addresses the people twice, standing, and then the prayer is held."}, "Agar namaz mein wajib bhool se chhoot jaye to Hanafi fiqh mein aam tor par kya kiya jata hai?": {"u": "Hanafi fiqh mein bhool se wajib chhoot jaye to Sajda-e-Sahw se talafi hoti hai. Jaan-boojh kar chhodne par namaz dobara padhni padti hai. Ye jawab Hanafi fiqh ke mutabiq hai; doosre madhab mein farq ho sakta hai. Apne ulema se mashwara karein.", "e": "In Hanafi fiqh, if a wajib is missed by mistake it is made up with Sajda-e-Sahw. If left on purpose, the prayer must be repeated. This answer follows Hanafi fiqh; other schools may differ. Please consult your ulema.", "cu": "Bhool par namaz torne ki zaroorat nahi; do sajdon se bharpai hoti hai.", "ce": "No need to break the prayer; it is made up with two prostrations."}, "Hanafi fiqh mein Sajda-e-Sahw namaz ke kis hissa mein kiya jata hai?": {"u": "Hanafi tareeqa: aakhri qa'dah mein Attahiyyat padhkar sirf ek taraf (daayen) salam pherte hain, phir do sajde karte hain, phir Attahiyyat, Durood aur dua padhkar salam pherte hain. Doosre madhab mein salam se pehle sajde bhi hain. Ye jawab Hanafi fiqh ke mutabiq hai; doosre madhab mein farq ho sakta hai. Apne ulema se mashwara karein.", "e": "Hanafi method: in the last sitting recite the Tashahhud, give one salam (to the right), then make two prostrations, then recite Tashahhud, Durood and dua and give the salams. Other schools also have the prostrations before the salam. This answer follows Hanafi fiqh; other schools may differ. Please consult your ulema.", "cu": "Sawal 'kab' ka hai: ye namaz ke aakhri qa'dah mein aata hai, magar salam ke saath iska rishta madhab ke hisaab se alag hai.", "ce": "The question is 'when': in the last sitting, but its relation to the salam differs by school."}, "Namaz mein Takbeer-e-Tahrima ka kya maqsad hai?": {"u": "Abu Dawud 61 aur Tirmidhi 3: namaz ka 'tahrim' (dunyavi kaam haram karne wala amal) takbeer hai. Isi liye ise takbeer-e-tahrima kehte hain.", "e": "Abu Dawud 61 and Tirmidhi 3: the 'tahrim' (what makes worldly acts forbidden) of the prayer is the Takbir, hence the name takbeer-e-tahrima.", "cu": "Naam hi dekhiye: 'tahrima' ka matlab haram karne wala amal hai, jo kaam namaz mein rukte hain unko.", "ce": "Look at the name: 'tahrima' is the act that makes other acts forbidden, as the prayer begins."}};
function quizClue(item){
  try{
    const n = QZ_NAMAZ[String(item[0])];
    if(n) return isEn() ? n.ce : n.cu;
    if(item[3] === 'Duain'){
      const t = String(item[0]).split('\n\n')[1], d = DUAS.find(x=>x.translit === t);
      if(d) return L({rur:'Ye dua is mauqe ki hai', en:'This dua is for'}) + ': ' + dTitle(d);
    }
  }catch(e){}
  return '';
}
function quizWhy(item){
  try{
    if(item[5]) return isEn() ? item[5].e : item[5].u;
    const nz = QZ_NAMAZ[String(item[0])];
    if(nz) return isEn() ? nz.e : nz.u;
    const cat = item[3], q = String(item[0]);
    if(cat === 'Duain'){
      const t = q.split('\n\n')[1], d = DUAS.find(x=>x.translit === t);
      if(!d) return '';
      const info = d.info && d.info.length <= 240 ? ' ' + dInfo(d) : '';
      return `${dTitle(d)}. ${L({rur:'Hawala', en:'Source'})}: ${d.ref}.${info}`;
    }
    if(cat === 'Qur’ani Alfaaz'){
      const m = q.match(/^"(.+)" ka Roman Urdu matlab/), w = m && qzWordMap().get(QZ_AR_NORM(m[1]));
      if(!w) return '';
      return isEn()
        ? `${w.tr}: ${w.en || w.m}. Used ${w.occ} times in the Qur'an. Example: ${w.exen || w.exm}`
        : `${w.tr}: ${w.m}. Qur'an mein ${w.occ} baar aaya hai. Misaal: ${w.exm}`;
    }
  }catch(e){}
  return '';
}
const QZ_AUTO = [0, 1, 3, 5];   /* seconds before the next question opens by itself (0 = off) */
/* Quiz timer (optional, chosen on the start screen) and 50-50 hint (1 per 5 questions) */
const QZ_TIMER = [0, 10, 15, 20];   /* seconds per question (0 = no timer) */
function quizSecsPref(){ return QZ_TIMER.includes(state.quizTimerSecs) ? state.quizTimerSecs : (state.quizTimer ? 20 : 0); }
function quizHintsFor(n){ return n >= 10 ? 4 : n >= 5 ? 2 : n >= 3 ? 1 : 0; }   /* 2 hints per 5 sawal, 4 per 10 (shared by all hint types) */
function quizTimerStop(){ if(quizState && quizState.tmr){ clearInterval(quizState.tmr); quizState.tmr = null; } }
function renderQuizQuestion(){
  const qs = quizState;
  quizTimerStop();
  const [q, opts, correct] = quizLocal(qs.questions[qs.idx]);
  quizSave();
  qs.hinted = false; qs.extra = 0; qs.second = false; qs.secondUsed = false;
  document.getElementById('detailBody').classList.remove('quiz-hiding');
  document.getElementById('detailTitle').textContent = `Sawal ${qs.idx+1}/${qs.questions.length}`;
  const body = document.getElementById('detailBody');
  const canHint = qs.hintsLeft > 0 && opts.length > 2;
  const clue = quizClue(qs.questions[qs.idx]);
  const canClue = qs.hintsLeft > 0 && !!clue;
  const canSkip = qs.hintsLeft > 0 && qs.spare.length > 0;
  const canTime = qs.hintsLeft > 0 && qs.timer;
  const canSecond = qs.hintsLeft > 0;
  body.innerHTML = `
    <div class="quiz-dots-row"><div class="quiz-dots" role="img" aria-label="${qs.idx+1} / ${qs.questions.length}">${qs.questions.map((_,k)=>`<i class="${k<qs.idx ? (qs.results[k] ? 'ok' : 'no') : k===qs.idx ? 'cur' : ''}"></i>`).join('')}</div>${qs.streak >= 2 ? `<span class="quiz-streak">🔥 ${qs.streak} ${L({rur:'sahi lagataar', en:'in a row'})}</span>` : ''}</div>
    <div class="quiz-tools">
      ${qs.timer ? `<div class="quiz-timer" id="quizTimer"><span class="qt-ic">⏱️</span><span class="qt-n" id="quizTimerN">${qs.secs}</span><div class="qt-bar"><div class="qt-fill" id="quizTimerFill"></div></div></div>` : '<div></div>'}
      ${qs.hints ? `<button type="button" class="quiz-hint quiz-hint-toggle" id="quizHintToggle" aria-expanded="false" ${qs.hintsLeft > 0 ? '' : 'disabled'}>💡 ${L({rur:'Hint', en:'Hint'})} <em class="quiz-hint-n" id="quizHintN">${qs.hintsLeft}/${qs.hints}</em></button>` : ''}
    </div>
    ${qs.hints ? `<div class="quiz-hint-panel" id="quizHintPanel" hidden><button type="button" class="quiz-hint" id="quizHintBtn" ${canHint ? '' : 'disabled'}>💡 50-50</button>${clue ? `<button type="button" class="quiz-hint" id="quizClueBtn" ${canClue ? '' : 'disabled'}>🧭 ${L({rur:'Sandarbh', en:'Clue'})}</button>` : ''}<button type="button" class="quiz-hint" id="quizSkipBtn" ${canSkip ? '' : 'disabled'}>⏭️ ${L({rur:'Sawal badlein', en:'Change question'})}</button>${qs.timer ? `<button type="button" class="quiz-hint" id="quizTimeBtn" ${canTime ? '' : 'disabled'}>⏱️ +10s</button>` : ''}<button type="button" class="quiz-hint" id="quizSecondBtn" ${canSecond ? '' : 'disabled'}>🔁 ${L({rur:'Do mauka', en:'2 chances'})}</button></div>` : ''}
    <div class="quiz-card">
      ${quizQHtml(q)}
    </div>
    <div class="quiz-opts" id="quizOpts">
      ${opts.map((o,i)=>`<button class="quiz-opt qopt-${'ABCD'[i]}" data-i="${i}"><b class="opt-letter">${'ABCD'[i]}</b><span class="quiz-opt-txt">${o}</span></button>`).join('')}
    </div>
    <div id="quizClueBox"></div>
    <div id="quizRevealWrap"></div>
    <div id="quizNextWrap" style="margin-top:16px; text-align:center;"></div>
  `;
  /* chosen = option index, or -1 when the time ran out */
  const finish = (chosen)=>{
    if(qs.answered) return;
    /* "2 tries" hint: the first wrong tap only crosses that option out */
    if(qs.second && !qs.secondUsed && chosen >= 0 && chosen !== correct){
      qs.secondUsed = true;
      const wb = body.querySelector(`.quiz-opt[data-i="${chosen}"]`);
      if(wb){ wb.disabled = true; wb.classList.add('struck'); }
      buzz(30);
      document.getElementById('quizClueBox').innerHTML = `<div class="quiz-clue">🔁 ${L({rur:'Ye galat hai, ek mauka aur hai.', en:'Not that one, one more chance.'})}</div>`;
      return;
    }
    qs.answered = true;
    quizTimerStop();
    const ok = chosen === correct;
    body.querySelectorAll('.quiz-opt').forEach(b=>{
      const bi = parseInt(b.dataset.i);
      if(bi===correct) b.classList.add('correct');
      else if(bi===chosen) b.classList.add('wrong');
    });
    body.querySelectorAll('.quiz-hint').forEach(b=>{ b.disabled = true; });
    qs.results[qs.idx] = ok;
    qs.streak = ok ? qs.streak + 1 : 0; if(qs.streak > qs.best) qs.best = qs.streak;
    buzz(ok ? 15 : [30, 40, 30]);
    const item = qs.questions[qs.idx];
    /* a correct answer that needed the hint is not counted towards mastery */
    try{ if(!(ok && qs.hinted)){ qzRecord(item, ok); saveState(); } }catch(e){}
    if(ok){
      qs.score++;
    } else {
      qs.wrong.push({ q, chosenText: chosen < 0 ? L({rur:'Jawab nahi diya (waqt khatam)', en:'No answer (time ran out)'}) : opts[chosen], correctText: opts[correct], item });
    }
    const why = quizWhy(item);
    if(!ok || why){
      document.getElementById('quizRevealWrap').innerHTML = `<div class="quiz-reveal">${ok ? '' : `${chosen < 0 ? L({rur:'Waqt khatam. ', en:'Time is up. '}) : ''}${L({rur:'Sahi Jawab', en:'Correct answer'})}: <b>${opts[correct]}</b>`}${why ? `<div class="quiz-why"><span>💡 ${L({rur:'Wajah / jaankari', en:'Why / more info'})}</span>${why}</div>` : ''}</div>`;
    }
    if(qs.hooks.onAnswer) qs.hooks.onAnswer(item, ok);
    quizSave();
    const isLast = qs.idx===qs.questions.length-1;
    document.getElementById('quizNextWrap').innerHTML = `<button id="quizNextBtn" class="quiz-next"><span class="qn-fill" id="quizNextFill"></span><span class="qn-txt">${isLast?'Result Dekhiye':'Agla Sawal'} ›</span></button>`;
    const goNext = ()=>{ if(isLast){ renderQuizResult(); } else { qs.idx++; qs.answered=false; renderQuizQuestion(); } };
    document.getElementById('quizNextBtn').onclick = goNext;
    /* optional: open the next question by itself after 1 / 3 / 5 seconds; the button fills up while it waits and a tap goes at once */
    if(qs.auto > 0){
      const at = qs.idx, fill = document.getElementById('quizNextFill');
      if(fill){ fill.style.transition = `width ${qs.auto}s linear`; requestAnimationFrame(()=>requestAnimationFrame(()=>{ fill.style.width = '100%'; })); }
      setTimeout(()=>{ if(quizState === qs && qs.idx === at && qs.answered && document.getElementById('quizNextBtn')) goNext(); }, qs.auto * 1000);
    }
  };
  body.querySelectorAll('.quiz-opt').forEach(btn=>{ btn.onclick = ()=> finish(parseInt(btn.dataset.i)); });
  const hintBtn = document.getElementById('quizHintBtn');
  if(hintBtn && canHint) hintBtn.onclick = ()=>{
    if(qs.answered || qs.hinted || qs.hintsLeft < 1) return;
    qs.hinted = true; qs.hintsLeft--;
    const wrong = opts.map((_,i)=>i).filter(i=>i!==correct);
    shuffleArr(wrong).slice(0,2).forEach(i=>{ const b = body.querySelector(`.quiz-opt[data-i="${i}"]`); if(b){ b.disabled = true; b.classList.add('struck'); } });
    body.querySelectorAll('.quiz-hint').forEach(b=>{ b.disabled = true; });
    document.getElementById('quizHintN').textContent = qs.hintsLeft + '/' + qs.hints;
    hintView(false);
  };
  const tg = document.getElementById('quizHintToggle'), pnl = document.getElementById('quizHintPanel');
  /* opening the hint list hides the question and options and holds the timer; closing it (or choosing a hint) shows them again */
  const hintView = (open)=>{
    if(pnl) pnl.hidden = !open;
    if(tg) tg.setAttribute('aria-expanded', open);
    body.classList.toggle('quiz-hiding', open);
    if(qs.timer && !qs.answered){
      if(open){ if(!qs.pauseAt) qs.pauseAt = Date.now(); }
      else if(qs.pauseAt){ qs.t0 += Date.now() - qs.pauseAt; qs.pauseAt = null; }
    }
  };
  if(tg && pnl) tg.onclick = ()=> hintView(pnl.hidden);
  const useHint = (fn)=>{
    if(qs.answered || qs.hinted || qs.hintsLeft < 1) return false;
    qs.hinted = true; qs.hintsLeft--;
    body.querySelectorAll('.quiz-hint').forEach(b=>{ b.disabled = true; });
    hintView(false);
    const hn = document.getElementById('quizHintN'); if(hn) hn.textContent = qs.hintsLeft + '/' + qs.hints;
    return true;
  };
  const skipBtn = document.getElementById('quizSkipBtn');
  if(skipBtn && canSkip) skipBtn.onclick = ()=>{
    /* swaps in a fresh question; the skipped one is not counted either way */
    if(qs.answered || qs.hintsLeft < 1 || !qs.spare.length) return;
    qs.hintsLeft--;
    qs.questions[qs.idx] = qs.spare.shift();
    renderQuizQuestion();
  };
  const timeBtn = document.getElementById('quizTimeBtn');
  if(timeBtn && canTime) timeBtn.onclick = ()=>{ if(useHint()) qs.extra = 10; };
  const secondBtn = document.getElementById('quizSecondBtn');
  if(secondBtn && canSecond) secondBtn.onclick = ()=>{
    if(!useHint()) return;
    qs.second = true;
    document.getElementById('quizClueBox').innerHTML = `<div class="quiz-clue">🔁 ${L({rur:'Do mauke: pehla galat option sirf kat jayega, dobara chunein.', en:'Two chances: a wrong first tap is just crossed out, pick again.'})}</div>`;
  };
  const clueBtn = document.getElementById('quizClueBtn');
  if(clueBtn && canClue) clueBtn.onclick = ()=>{
    if(qs.answered || qs.hinted || qs.hintsLeft < 1) return;
    qs.hinted = true; qs.hintsLeft--;
    document.getElementById('quizClueBox').innerHTML = `<div class="quiz-clue">🧭 ${clue}</div>`;
    body.querySelectorAll('.quiz-hint').forEach(b=>{ b.disabled = true; });
    document.getElementById('quizHintN').textContent = qs.hintsLeft + '/' + qs.hints;
    hintView(false);
  };
  if(qs.timer){
    qs.t0 = Date.now(); qs.pauseAt = null; const idx = qs.idx;
    const fill = document.getElementById('quizTimerFill'), num = document.getElementById('quizTimerN'), box = document.getElementById('quizTimer');
    qs.tmr = setInterval(()=>{
      /* stop by itself if the screen changed or the quiz was left */
      if(quizState !== qs || qs.idx !== idx || qs.answered || !document.getElementById('quizTimer')){ clearInterval(qs.tmr); qs.tmr = null; return; }
      if(qs.pauseAt) return;   /* hint list is open: the clock is held */
      const tot = qs.secs + qs.extra, left = Math.max(0, tot - (Date.now()-qs.t0)/1000);
      num.textContent = Math.ceil(left);
      fill.style.width = (left/tot*100) + '%';
      box.classList.toggle('low', left <= 5);
      if(left <= 0) finish(-1);
    }, 200);
  }
}

function renderQuizResult(){
  const qs = quizState;
  quizSaveClear();
  document.getElementById('detailBody').classList.remove('quiz-hiding');
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
      ${qs.best >= 2 ? `<div style="font-size:13px; font-weight:700; margin-bottom:14px;">🔥 ${L({rur:'Sabse lambi streak', en:'Longest streak'})}: ${qs.best}</div>` : ''}
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
    ['location',uiIcon('location'),'Apna Shahar Chunein', state.location.name],
    ['qibla',uiIcon('qibla'),'Qibla ka Rukh', ''],
    ['timefmt',uiIcon('timefmt'),'Waqt ka Andaaz', state.timeFormat==='12' ? '12 Ghante (AM/PM)' : '24 Ghante'],
    ['textsize',uiIcon('textsize'),'Text ka Size', ({s:'Chhota',m:'Normal',l:'Bara',xl:'Bohot Bara',xxl:'Sabse Bara'}[state.textScale]||'Normal') + ((state.arScale||'m')!=='m' ? ' · Arabic ' + ({l:'Bara',xl:'Bohot Bara',xxl:'Sabse Bara'}[state.arScale]||'') : '')],
    ['homecard',uiIcon('homecard'),'Home Card', {full:'Poora',strip:'Patli patti',off:'Band'}[state.heroMode||'full']],
    ['feedback',uiIcon('feedback'),'Vibration aur Awaaz', (state.haptics===false?'Vib off':'Vib on')+' · '+(state.sounds===false?'Sound off':'Sound on')],
    ['lang',uiIcon('lang'),'Zubaan', state.lang==='en' ? 'English' : 'Hinglish / Roman Urdu'],
    ['notif',uiIcon('notif'),'Yaad-dahaniyan', ''],
    ['azaan',uiIcon('azaan'),'Azaan', azaanState().on ? 'On' : 'Off'],
    ['nafil',uiIcon('nafil'),'Nafil Namaz Mark Karein', nafilOn() ? 'On' : 'Off'],
    ['calc',uiIcon('calc'),'Namaz ka Hisaab', (calcMethod().name.split(' (')[0]) + ' · ' + (state.asrMethod==='shafi' ? "Asr: Shafi'i" : 'Asr: Hanafi') + (hijriOffset() ? ` · Hijri ${hijriOffset()>0?'+':''}${hijriOffset()}` : '')],
    ['iqamah',uiIcon('iqamah'),'Jamaat ka Waqt (Iqamah)', iqamahState().on ? 'On' : 'Off'],
    ['howto',uiIcon('howto'),'Istemal ka Tareeqa', ''],
    ['backup',uiIcon('backup'),'Data Backup', ''],
    ['about',uiIcon('about'),'Iske Baare Mein', ''],
  ];
  /* Settings are grouped under headings and can be searched (the words after each key are extra search terms) */
  const SET_GROUPS = [
    [L({rur:'Namaz aur shahar', en:'Prayer and city'}), ['location','calc','iqamah','nafil','azaan','notif','qibla']],
    [L({rur:'Dikhawat aur awaaz', en:'Look and sound'}), ['lang','timefmt','textsize','homecard','feedback']],
    [L({rur:'Madad aur data', en:'Help and data'}), ['howto','backup','about']],
  ];
  const SET_KW = { location:'city shahar gps location', calc:'method hisaab asr hanafi shafi hijri fajr isha time calculation', iqamah:'jamaat iqamah masjid', nafil:'nafil ishraq chasht tahajjud', azaan:'adhan azan awaaz', notif:'reminder alert yaad notification', qibla:'compass direction rukh', lang:'language zubaan english urdu hinglish', timefmt:'12 24 hour clock time format', textsize:'font size arabic bara chhota', homecard:'home card hero strip', feedback:'vibration haptic sound awaaz', howto:'help guide tareeqa', backup:'backup restore export import data', about:'privacy version sources naya kya hai whats new' };
  const byKey = {}; items.forEach(it=>{ byKey[it[0]] = it; });
  document.getElementById('detailBody').innerHTML = `<div class="set-search"><input id="setQ" type="search" autocomplete="off" placeholder="${L({rur:'Settings dhoondhiye...', en:'Search settings...'})}" aria-label="${L({rur:'Settings dhoondhiye', en:'Search settings'})}"></div>
    ${SET_GROUPS.map(([gl, keys])=>`<div class="set-grp"><div class="set-grp-t">${gl}</div><div class="more-list set-list">${keys.filter(k=>byKey[k]).map(k=>{ const [kk,ic,l,sub] = byKey[k]; return `<div class="more-item" data-sec="${kk}" data-kw="${SET_KW[kk] || ''}" role="button" tabindex="0"><div class="ic">${ic}</div><div class="lbl">${l}${sub?`<span class="lblSub">${sub}</span>`:''}</div><div class="chev">›</div></div>`; }).join('')}</div></div>`).join('')}
    <div class="empty-state" id="setNone" hidden>${L({rur:'Koi setting nahi mili.', en:'No setting found.'})}</div>`;
  const setQ = document.getElementById('setQ');
  setQ.oninput = ()=>{
    const q = setQ.value.trim().toLowerCase(); let any = false;
    document.querySelectorAll('#detailBody .set-grp').forEach(g=>{
      let vis = 0;
      g.querySelectorAll('.more-item').forEach(el=>{ const hit = !q || (el.textContent + ' ' + (el.dataset.kw || '')).toLowerCase().includes(q); el.hidden = !hit; if(hit) vis++; });
      g.hidden = !vis; if(vis) any = true;
    });
    document.getElementById('setNone').hidden = any;
  };
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
  document.getElementById('detailTitle').textContent = ({notif:'Yaad-dahaniyan', lang:'Zubaan', timefmt:'Waqt ka Andaaz', textsize:'Text ka Size', homecard:'Home Card', feedback:'Vibration aur Awaaz'})[settingsTab] || 'Apna Shahar Chunein';
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
        <span style="color:var(--text)">${L({rur:'Settings › Namaz ka Hisaab', en:'Settings › Prayer Calculation'})}</span> ${L({rur:'mein badal sakte hain.', en:'to change these.'})}
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
    const sizeRow = (key, opts, label)=>`<div class="ts-lbl">${label}</div><div class="theme-row ts-row" style="padding:0 0 12px;">${opts.map(([k,n])=>`<button data-${key}="${k}" class="${(state[key==='size'?'textScale':'arScale']||'m')===k?'active':''}">${n}</button>`).join('')}</div>`;
    pane.innerHTML = sizeRow('size', [['s','Chhota'],['m','Normal'],['l','Bara'],['xl','Bohot Bara'],['xxl','Sabse Bara']], L({rur:'Poora text', en:'All text'}))
      + sizeRow('ar', [['m','Normal'],['l','Bara'],['xl','Bohot Bara'],['xxl','Sabse Bara']], L({rur:'Arabic text (dua, Qur’ani alfaaz…)', en:'Arabic text (duas, Qur’anic words…)'}))
      + `<div class="ts-prev"><div class="arabic dua-ar" dir="rtl" style="font-family:'Scheherazade New','Noto Naskh Arabic',serif; font-size:26px; line-height:1.9;">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</div><div style="font-size:14px; color:var(--sub); margin-top:6px;">${L({rur:'Shuru Allah ke naam se, jo bada meherbaan, nihayat reham karne wala hai.', en:'In the name of Allah, the Most Gracious, the Most Merciful.'})}</div></div>`;
    pane.querySelectorAll('[data-size]').forEach(b=>{ b.onclick = ()=>{ state.textScale = b.dataset.size; saveState(); applyTextScale(); renderTextSizePane(); }; });
    pane.querySelectorAll('[data-ar]').forEach(b=>{ b.onclick = ()=>{ state.arScale = b.dataset.ar; saveState(); applyTextScale(); renderTextSizePane(); }; });
  }
  function renderHomeCardPane(){
    const m = state.heroMode || 'full';
    pane.innerHTML = `<div class="theme-row" style="padding:0 0 12px;">
      <button data-hm="full" class="${m==='full'?'active':''}">${L({rur:'Poora card', en:'Full card'})}</button>
      <button data-hm="strip" class="${m==='strip'?'active':''}">${L({rur:'Patli patti', en:'Slim strip'})}</button>
      <button data-hm="off" class="${m==='off'?'active':''}">${L({rur:'Band', en:'Off'})}</button>
    </div>
    <div class="ts-lbl">${L({rur:'Card ka aana aur chhota hona', en:'Card intro'})}</div>
    <div class="theme-row" style="padding:0 0 12px;">
      <button data-ha="1" class="${state.heroAuto!==false?'active':''}">${L({rur:'Chalu (4 sec baad aaye, 12 sec baad chhota)', en:'On (appears after 4 s, shrinks after 12 s)'})}</button>
      <button data-ha="0" class="${state.heroAuto===false?'active':''}">${L({rur:'Band', en:'Off'})}</button>
    </div>
    <div class="backup-note">${L({rur:'Home par abhi ki namaz aur agli namaz ka card. Card ko left/right swipe ya ✕ se sirf is baar ke liye chhota ya band kar sakte hain; app dobara kholne par wapas aa jata hai. Hamesha ke liye chhota ya band rakhna ho to yahan se chunein.', en:'The card on Home showing the current and next prayer. Swiping it away or tapping ✕ only hides it for this visit; it returns when you reopen the app. Choose here to keep it slim or off permanently.'})}</div>`;
    pane.querySelectorAll('[data-ha]').forEach(b=>{ b.onclick = ()=>{ state.heroAuto = b.dataset.ha === '1'; saveState(); renderHomeCardPane(); }; });
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
  if(settingsTab==='notif') renderNotifPane(); else if(settingsTab==='lang') renderLangPane(); else if(settingsTab==='timefmt') renderTimeFmtPane(); else if(settingsTab==='textsize') renderTextSizePane(); else if(settingsTab==='homecard') renderHomeCardPane(); else if(settingsTab==='feedback') renderFeedbackPane(pane); else renderLocationPane();

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
      const cm = cityMatch(citySearch, 60);
      if(!cm.list.length){ cityListEl.innerHTML = sgEmpty(citySearch, CITIES.map(c=>c.name), 'citySearchInput', 'Yeh shehar list mein nahi mila. GPS ya saved jagah istemaal karein.'); return; }
      if(cm.fuzzy) cityListEl.insertAdjacentHTML('beforeend', cityFuzzyNote());
      cm.list.forEach(c=>{ cityListEl.appendChild(renderCityRow(c)); });
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
        state.location = {name:'Current Location', lat:pos.coords.latitude, lon:pos.coords.longitude, source:'gps', tz:deviceTZ()};
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
  document.getElementById('detailTitle').textContent = 'Roza';
  const live = gregorianToHijri(new Date()).month===9;
  document.getElementById('detailBody').innerHTML = `
    ${live ? '' : `<div class="backup-note" style="margin-bottom:12px;">🌙 Abhi Ramzan nahi hai, yeh sirf jhalak hai. Ramzan mein yahan roza aur namaz mark kar sakenge.</div>`}
    ${live ? ramzanScreenTopHtml() : ''}
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
  if(live) wireRamzanScreenTop();
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
        <div class="rz-t"><span><i>🌅</i><b>${r.sehri}</b></span><span><i>🌇</i><b>${r.iftar}</b></span></div>
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
const ABOUT_LINKEDIN = 'https://www.linkedin.com/in/mdzainulali/';
function renderMoreAbout(){
  document.getElementById('detailTitle').textContent="Iske Baare Mein";
  document.getElementById('detailBody').innerHTML = `
    <div style="font-size:13.5px; line-height:1.8; color:var(--sub);">
      ${L({rur:'Namaz Timer App: Aapki roz ki namaz, sehri, iftar aur nawafil ke auqaat ek nazar mein.', en:'Namaz Timer App: your daily prayer, sehri, iftar and nafl times at a glance.'})}<br><br>
      ${L({rur:'Banaya gaya hai mohabbat se, taake har Musalman apni namaz waqt par ada kar sake. Allah hum sabko namaz ki hifazat karne ki taufeeq de. Ameen.', en:'Made with love so that every Muslim can pray on time. May Allah give us all the ability to guard our prayers. Ameen.'})}
    </div>
    <div class="howto-card about-maker">
      <div class="howto-ic">${uiIcon('about')}</div>
      <div class="howto-body">
        <div class="howto-t">${L({rur:'Banane wale', en:'Made by'})}</div>
        <div class="howto-d"><b data-no-i18n>Dr Zain</b><br><span data-no-i18n>PhD, Computational Biology<br>University of Hyderabad</span><br>${L({rur:'Yeh app Dr Zain ne banayi hai.', en:'This app is made by Dr Zain.'})}</div>
        ${ABOUT_LINKEDIN ? `<a class="li-link" href="${ABOUT_LINKEDIN}" target="_blank" rel="noopener" data-no-i18n><svg viewBox="0 0 24 24" aria-hidden="true"><rect width="24" height="24" rx="4.5" fill="#0A66C2"/><circle cx="7.3" cy="7.6" r="1.7" fill="#fff"/><path fill="#fff" d="M5.8 10h3v8.4h-3zM10.8 10h2.9v1.2c.5-.8 1.5-1.4 2.9-1.4 2.6 0 3.4 1.7 3.4 4v4.6h-3v-4.1c0-1.1-.3-1.8-1.3-1.8-1.1 0-1.5.8-1.5 1.9v4h-3z"/></svg><span>LinkedIn</span></a>` : ''}
      </div>
    </div>
  `;
}

