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
function nameAccent(which){ return which==='asma' ? 'var(--accent)' : '#3fa8a0'; }
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
    ${which==='asma' ? asmaFullBarHtml() : ''}
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
      ${which==='asma' && i < ASMA_CLIPS ? `<button class="asma-pl" data-i="${i}" aria-label="${L({rur:'Yeh naam sunein', en:'Listen to this name'})}">▶</button>` : ''}
      <div class="chev">›</div>
    </div>`;
  }).join('');
  grid.querySelectorAll('.asma-pl').forEach(b=>{ b.onclick = e=>{ e.stopPropagation(); asmaPlayOne(+b.dataset.i); }; });
  if(which==='asma') asmaWireFull();
  grid.querySelectorAll('[data-idx]').forEach(el=>{
    el.onclick = ()=>{
      const i = parseInt(el.dataset.idx);
      if(which==='asma' && typeof asmaStop === 'function') asmaStop();   // opening a name stops whatever was playing
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
    ${which==='asma' && idx < ASMA_CLIPS ? `<button class="asma-listen" data-i="${idx}"><span class="asma-li">▶</span> <span class="asma-lt">${L({rur:'Yeh naam sunein', en:'Listen to this name'})}</span></button>${asmaOptsHtml()}` : ''}
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
  { const lb = document.querySelector('.asma-listen'); if(lb){ lb.onclick = ()=> asmaPlayOne(idx); asmaWireOpts(); asmaUI(); } }
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
    ['textsize','🔠','Text ka Size', ({s:'Chhota',m:'Normal',l:'Bara',xl:'Bohot Bara',xxl:'Sabse Bara'}[state.textScale]||'Normal') + ((state.arScale||'m')!=='m' ? ' · Arabic ' + ({l:'Bara',xl:'Bohot Bara',xxl:'Sabse Bara'}[state.arScale]||'') : '')],
    ['homecard','🃏','Home Card', {full:'Poora',strip:'Patli patti',off:'Band'}[state.heroMode||'full']],
    ['feedback','📳','Vibration aur Awaaz', (state.haptics===false?'Vib off':'Vib on')+' · '+(state.sounds===false?'Sound off':'Sound on')],
    ['lang','🌐','Zubaan', state.lang==='en' ? 'English' : 'Hinglish / Roman Urdu'],
    ['notif','🔔','Yaad-dahaniyan', ''],
    ['azaan','🔊','Azaan', azaanState().on ? 'On' : 'Off'],
    ['nafil','🌙','Nafil Namaz Mark Karein', nafilOn() ? 'On' : 'Off'],
    ['calc','🧮','Namaz ka Hisaab', (calcMethod().name.split(' (')[0]) + ' · ' + (state.asrMethod==='shafi' ? "Asr: Shafi'i" : 'Asr: Hanafi') + (hijriOffset() ? ` · Hijri ${hijriOffset()>0?'+':''}${hijriOffset()}` : '')],
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
    <div class="backup-note">${L({rur:'Home par abhi ki namaz aur agli namaz ka card. Card ko left/right swipe ya ✕ se sirf is baar ke liye chhota ya band kar sakte hain; app dobara kholne par wapas aa jata hai. Hamesha ke liye chhota ya band rakhna ho to yahan se chunein.', en:'The card on Home showing the current and next prayer. Swiping it away or tapping ✕ only hides it for this visit; it returns when you reopen the app. Choose here to keep it slim or off permanently.'})}</div>`;
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

