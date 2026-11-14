/* ============================================================
   MORE TAB - Dua & Hadees data + detail overlay
   ============================================================ */
/* (data moved to data.js: DUAS, HADEES) */

/* ============================================================
   BOOKMARKS (Mere Pasandeeda) + IMAGE SHARE CARDS
   ============================================================ */
function bmList(){ if(!Array.isArray(state.bookmarks)) state.bookmarks = []; return state.bookmarks; }
function isBookmarked(k){ return bmList().includes(k); }
function toggleBookmark(k){
  const l = bmList(); const i = l.indexOf(k);
  if(i>=0) l.splice(i,1); else l.push(k);
  saveState();
  return i<0;
}
function bmBtn(k, extra){
  const on = isBookmarked(k);
  return `<button class="bm-btn ${on?'on':''}" data-bm="${k.replace(/"/g,'&quot;')}" ${extra||''} title="Pasandeeda">${on?'★':'☆'}</button>`;
}

/* Generic Prev/Next nav for "list -> detail" screens. Whatever renders the
   list calls setNavCtx(list, idx, openFn) right before opening a detail item;
   the detail screen then drops in pnBarHtml() + calls wirePnBar(). */
let __navCtx = null;
function setNavCtx(list, idx, openFn, cat){ __navCtx = { list, idx, openFn, cat }; }
/* Next category after the current item's category, or null */
function catNextKey(){
  const c = __navCtx && __navCtx.cat; if(!c) return null;
  const cur = __navCtx.list[__navCtx.idx];
  const ci = c.cats.indexOf(c.catOf(cur));
  return (ci>=0 && ci<c.cats.length-1) ? c.cats[ci+1] : null;
}
function openNextCategory(){
  const c = __navCtx.cat, k = catNextKey(); if(!k) return;
  const items = c.all.filter(x=>c.catOf(x)===k).sort(c.sortFn);
  const openFn = __navCtx.openFn;
  setNavCtx(items, 0, openFn, c);
  openFn(items[0]);
}
function pnBarHtml(){
  if(!__navCtx) return '';
  const { list, idx, cat } = __navCtx;
  const sec = cat && cat.sec ? (isEn() ? cat.sec.en : cat.sec.ur) : '';
  const last = idx>=list.length-1;
  if(!last){
    const rtl = !!__navCtx.rtl;
    return `<div class="pn-bar${rtl?' rtl':''}">
    <button class="pn-btn pn-prev" id="pnPrevBtn" ${idx<=0?'disabled':''}>${rtl ? `${isEn() ? 'Previous' : 'Pichla'}<span class="pn-ic">➡️</span>` : `<span class="pn-ic">⬅️</span>${isEn() ? 'Previous' : 'Pichla'}`}</button>
    <span class="pn-pos">${idx+1} / ${list.length}</span>
    <button class="pn-btn pn-next" id="pnNextBtn">${rtl ? `<span class="pn-ic">⬅️</span>${isEn() ? 'Next' : 'Agla'}` : `${isEn() ? 'Next' : 'Agla'}<span class="pn-ic">➡️</span>`}</button>
  </div>`;
  }
  /* last item of a section: exactly two buttons, back to the section and the next category */
  const backLbl = isEn() ? `‹ Back to ${sec || 'list'}` : `‹ ${sec ? sec + ' mein' : 'List mein'} wapas`;
  const nextLbl = isEn() ? 'Next category ›' : 'Agli category ›';
  const hasNext = !!catNextKey();
  return `<div class="pn-end">
    <button class="pn-btn pn-back" id="pnBackBtn"><span class="pn-ic">📂</span>${backLbl}</button>
    ${hasNext ? `<button class="pn-btn pn-nextcat" id="pnNextCatBtn">${nextLbl}<span class="pn-ic">⏭️</span></button>` : ''}
  </div>`;
}
/* Category settings for the in-section navigation (end-of-section buttons) */
function duaNavCat(){
  return { sec:{ur:"Du'a", en:"Duas"}, cats:[...new Set(DUAS.map(d=>d.cat))].sort((a,b)=>a.localeCompare(b)),
    catOf:d=>d.cat, all:DUAS, sortFn:(a,b)=>a.title.localeCompare(b.title) };
}
function hadeesNavCat(){
  return { sec:{ur:"Hadees", en:"Hadith"}, cats:[...new Set(HADEES.map(h=>h.cat))].sort((a,b)=>a.localeCompare(b)),
    catOf:h=>h.cat, all:HADEES, sortFn:(a,b)=>a.txt.localeCompare(b.txt) };
}
function aadaabNavCat(){
  return { sec:{ur:"Aadaab-e-Zindagi", en:"Aadaab-e-Zindagi"},
    cats:[...AADAAB_CATEGORIES].sort((a,b)=>a.label.localeCompare(b.label)).map(c=>c.id),
    catOf:t=>t.cat, all:AADAAB_TOPICS, sortFn:(a,b)=>AADAAB_TOPICS.indexOf(a)-AADAAB_TOPICS.indexOf(b) };
}
function qwordNavCat(){
  return { sec:{ur:"Qur'ani Alfaaz", en:"Quranic Words"}, cats:Object.keys(QWORD_GROUP_COLOR), catOf:qwordGroup, all:QURAN_WORDS,
    sortFn: qwordSortFn() };
}
/* Star and share sit inside the title card (top-right) so the card keeps its size */
function placeActionsInHead(){
  const act = document.querySelector('#detailBody > .detail-actions');
  const head = document.querySelector('#detailBody > .aad-head');
  if(act && head && !head.contains(act)){ act.classList.add('in-head'); head.appendChild(act); }
}
function wirePnBar(){
  placeActionsInHead();
  if(!__navCtx) return;
  const { list, idx, openFn } = __navCtx;
  /* One-time hint that the reader can swipe between items */
  try{
    if(list.length>1 && !localStorage.getItem('waqt24_swipeHint')){
      localStorage.setItem('waqt24_swipeHint','1');
      setTimeout(()=>showToast(isEn() ? 'Swipe left or right to move between items' : 'Left ya right swipe karke aage-peeche jaayein'), 400);
    }
  }catch(e){}
  const prevBtn = document.getElementById('pnPrevBtn');
  const nextBtn = document.getElementById('pnNextBtn');
  const go = (newIdx)=>{ setNavCtx(list, newIdx, openFn, __navCtx.cat); openFn(list[newIdx], newIdx); };
  if(prevBtn) prevBtn.onclick = ()=>{ if(idx>0) go(idx-1); };
  if(nextBtn) nextBtn.onclick = ()=>{ if(idx<list.length-1) go(idx+1); };
  const backBtn = document.getElementById('pnBackBtn');
  if(backBtn) backBtn.onclick = ()=> closeModal();
  const nextCatBtn = document.getElementById('pnNextCatBtn');
  if(nextCatBtn) nextCatBtn.onclick = ()=> openNextCategory();
}
/* Swipe left/right in an open detail, and the Agla/Pichla buttons, slide the card like Instagram or Facebook.
   Both go through slideDetail(), so the animation is the same whichever way the reader moves. */
(()=>{
  const body = document.getElementById('detailBody');
  const ease = 'transform .2s ease, opacity .2s ease';
  let bypass = false, busy = false;
  // dir -1: moving to the next item (card leaves to the left); 1: previous item
  window.slideDetail = (dir, change, yFrac)=>{
    if(busy) return; busy = true;
    if(__navCtx && (__navCtx.rtl || __navCtx.turn)) return pageTurn(dir, change, yFrac);
    body.style.transition = ease;
    body.style.transform = `translateX(${dir * 60}px)`;
    body.style.opacity = '0';
    setTimeout(()=>{
      change();
      body.style.transition = 'none';
      body.style.transform = `translateX(${dir * -60}px)`;
      void body.offsetWidth; // apply the start position before animating back in
      body.style.transition = ease;
      body.style.transform = 'none';
      body.style.opacity = '1';
      // a timer, not requestAnimationFrame: frames pause in a background tab, which would leave busy stuck
      setTimeout(()=>{ busy = false; }, 200);
    }, 200);
  };
  // Book-style page turn. Only the page moves: a copy of the current page sits on top and curls away,
  // while the next page (already preloaded) is rendered underneath, so buttons and text never jump.
  // yFrac is where the finger started on the page: top half curls from the top corner, bottom half from the bottom.
  const pageTurn = (dir, change, yFrac)=>{
    const img = body.querySelector('.quran-page-img'), sheet = !img && body.querySelector('.tb-sheet');
    if(!img && !sheet){ change(); busy = false; return; }
    if(sheet){   /* Tarjuma book: a copy of the sheet is the leaf */
      const r = sheet.getBoundingClientRect(), leaf = document.createElement('div');
      leaf.className = 'page-leaf'; leaf.style.cssText = `left:${r.left}px; top:${r.top}px; width:${r.width}px; height:${r.height}px;`;
      const cp = sheet.cloneNode(true); cp.removeAttribute('id'); cp.style.margin = '0'; cp.style.width = '100%'; cp.style.boxSizing = 'border-box'; cp.style.boxShadow = 'none';
      leaf.appendChild(cp); leaf.insertAdjacentHTML('beforeend', '<i class="page-leaf-shade"></i>'); document.body.appendChild(leaf);
      setTimeout(change, 0); playPageSound();
      const y = (typeof yFrac === 'number') ? yFrac : 0.5, corner = y < 0.4 ? 'top' : y > 0.6 ? 'bottom' : 'center', tilt = corner === 'top' ? 12 : corner === 'bottom' ? -12 : 0;
      leaf.style.transformOrigin = `${dir > 0 ? 'right' : 'left'} ${corner}`; void leaf.offsetWidth; leaf.classList.add('turning');
      leaf.style.transform = `perspective(1600px) rotateY(${dir * -108}deg) rotateZ(${dir * tilt}deg) translateY(${tilt * -1.2}px)`;
      leaf.style.setProperty('--shade-from', dir > 0 ? 'left' : 'right');
      setTimeout(()=>{ leaf.remove(); busy = false; }, 560); return;
    }
    const box = img.getBoundingClientRect();
    const nw = img.naturalWidth || box.width, nh = img.naturalHeight || box.height;
    const sc = Math.min(box.width / nw, box.height / nh);
    const r = { width: nw*sc, height: nh*sc, left: box.left + (box.width - nw*sc)/2, top: box.top + (box.height - nh*sc)/2 };
    const leaf = document.createElement('div');
    leaf.className = 'page-leaf';
    leaf.style.cssText = `left:${r.left}px; top:${r.top}px; width:${r.width}px; height:${r.height}px;`;
    leaf.innerHTML = `<img src="${img.currentSrc || img.src}" alt="" style="filter:${getComputedStyle(img).filter};background:${getComputedStyle(img).backgroundColor}">${(tn=>tn?`<i class="page-leaf-tint" style="background:${tn.style.background}"></i>`:'')(body.querySelector('.qtint'))}<i class="page-leaf-shade"></i>`;
    document.body.appendChild(leaf);
    // the next page renders underneath the leaf. Deferred by a tick: when this runs inside a button's click,
    // the browser ignores a second click() on that same button until the first one has finished.
    setTimeout(change, 0);
    playPageSound();
    const y = (typeof yFrac === 'number') ? yFrac : 0.5;
    const corner = y < 0.4 ? 'top' : y > 0.6 ? 'bottom' : 'center';
    const tilt = corner === 'top' ? 12 : corner === 'bottom' ? -12 : 0;
    leaf.style.transformOrigin = `${dir > 0 ? 'right' : 'left'} ${corner}`;
    void leaf.offsetWidth;
    leaf.classList.add('turning');
    leaf.style.transform = `perspective(1600px) rotateY(${dir * -108}deg) rotateZ(${dir * tilt}deg) translateY(${tilt * -1.2}px)`;
    leaf.style.setProperty('--shade-from', dir > 0 ? 'left' : 'right');
    // a timer, not an animation event: it still fires if the tab is hidden mid-turn
    setTimeout(()=>{ leaf.remove(); busy = false; }, 560);
  };
  // First or last item: a small nudge shows there is nothing further
  const nudge = (dir)=>{
    body.style.transition = 'transform .12s ease';
    body.style.transform = `translateX(${dir * -14}px)`;
    setTimeout(()=>{ body.style.transform = 'none'; }, 120);
  };
  // Agla/Pichla buttons: intercept the click, slide, then let the original handler run
  document.addEventListener('click', (e)=>{
    if(bypass) return;
    const b = e.target.closest('#pnNextBtn, #pnPrevBtn');
    if(!b) return;
    e.stopPropagation(); e.preventDefault();
    if(b.disabled) return;
    const rtl = !!(__navCtx && __navCtx.rtl);
    const fwd = b.id === 'pnNextBtn';
    slideDetail(rtl ? (fwd ? 1 : -1) : (fwd ? -1 : 1), ()=>{ bypass = true; b.click(); bypass = false; });
  }, true);
  body.addEventListener('touchstart', (e)=>{
    sxSkip = !!e.target.closest('input, textarea, select, .chips, .qword-tabs, .cat-tabs, .hscroll, [data-no-swipe], .quran-page-wrap.zoomed');
    sx = e.touches[0].clientX; sy = e.touches[0].clientY;
  }, { passive:true });
  body.addEventListener('touchend', (e)=>{
    if(sxSkip || !__navCtx || !document.getElementById('detailOverlay').classList.contains('active')) return;
    const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if(Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    const dir = dx < 0 ? -1 : 1;
    // Right-to-left (Qur'an): swiping right moves forward, like turning an Arabic book's page
    const forward = (__navCtx && __navCtx.rtl) ? dir > 0 : dir < 0;
    const b = document.getElementById(forward ? 'pnNextBtn' : 'pnPrevBtn');
    if(!b || b.disabled){ nudge(dir); return; }
    const pg = body.querySelector('.quran-page-img');
    let yFrac = 0.5;
    if(pg){ const pr = pg.getBoundingClientRect(); yFrac = (sy - pr.top) / Math.max(1, pr.height); }
    slideDetail(dir, ()=>{ bypass = true; b.click(); bypass = false; }, yFrac);
  }, { passive:true });
  let sx = 0, sy = 0, sxSkip = false;
})();
document.getElementById('detailBody').addEventListener('click', (e)=>{
  const b = e.target.closest('.bm-btn');
  if(!b) return;
  e.stopPropagation();
  const on = toggleBookmark(b.dataset.bm);
  b.classList.toggle('on', on);
  b.textContent = on ? '★' : '☆';
  showToast(on ? 'Pasandeeda mein add ho gaya' : 'Pasandeeda se hata diya');
  if(b.dataset.refresh) renderBookmarks();
}, true);
function bmResolve(k){
  const i = k.indexOf(':'); const t = k.slice(0,i), id = k.slice(i+1);
  if(t==='dua'){ const d = DUAS.find(x=>x.title===id); return d && { type:"Du'a", ar:'', title:d.title, sub:d.cat, open:()=>{ __navCtx=null; openDuaDetail(d); } }; }
  if(t==='hadees'){ const h = HADEES.find(x=>x.txt.slice(0,40)===id); return h && { type:'Hadees', ar:'', title:h.txt.length>70?h.txt.slice(0,70)+'…':h.txt, sub:h.src, open:()=>{ __navCtx=null; openHadeesDetail(h); } }; }
  if(t==='asma'){ const x = ASMA_UL_HUSNA.findIndex(n=>n.tr===id); return x>=0 && { type:'Asma-ul-Husna', ar:ASMA_UL_HUSNA[x].ar, title:id, sub:ASMA_UL_HUSNA[x].m, open:()=>renderNameDetail('asma', x) }; }
  if(t==='prophet'){ const x = PROPHET_NAMES.findIndex(n=>n.tr===id); return x>=0 && { type:'Muhammad ﷺ ke Naam', ar:PROPHET_NAMES[x].ar, title:id, sub:PROPHET_NAMES[x].m, open:()=>renderNameDetail('prophet', x) }; }
  if(t==='word'){ const x = KHAAS_SHABD.findIndex(n=>n.tr===id); return x>=0 && { type:'Khaas Shabd', ar:KHAAS_SHABD[x].ar, title:id, sub:KHAAS_SHABD[x].m, open:()=>{ __navCtx=null; renderShabdDetail(x, renderBookmarks); } }; }
  if(t==='qword'){ const w = QURAN_WORDS.find(n=>n.tr===id); return w && { type:'Qur’ani Alfaaz', ar:w.ar, title:id, sub:w.m, open:()=>{ __navCtx=null; openQuranWordDetail(w); } }; }
  if(t==='aadaab'){ const a = AADAAB_TOPICS.find(n=>n.id===id); return a && { type:'Aadaab-e-Zindagi', ar:'', title:a.title, sub:aadaabCatInfo(a.cat).label, open:()=>{ __navCtx=null; openAadaabDetail(a); } }; }
  return null;
}
function renderBookmarks(){
  document.getElementById('detailTitle').textContent = 'Mere Pasandeeda';
  const items = bmList().map(k=>({k, r:bmResolve(k)})).filter(x=>x.r);
  const body = document.getElementById('detailBody');
  const types = [...new Set(items.map(x=>x.r.type))];
  body.innerHTML = notesSectionHtml() + (!items.length ? `<div class="empty-state">Abhi tak kuch pasandeeda nahi.<br>Kisi bhi dua, hadees, naam ya lafz par ☆ dabayein.</div>` : types.map(t=>`
    <div class="dw-section">
      <div class="dw-section-title"><span>${t}</span><span class="dw-count">${items.filter(x=>x.r.type===t).length}</span></div>
      ${items.filter(x=>x.r.type===t).map(x=>{ const nn = notesForBm(x.k); return `<div class="dw-row" data-k="${x.k.replace(/"/g,'&quot;')}">
        ${x.r.ar ? `<div class="ar">${x.r.ar}</div>` : ''}
        <div class="info"><div class="tr">${x.r.title}</div><div class="m">${x.r.sub}</div>${nn.length ? `<div class="bm-note">📝 ${noteEsc(nn[0].text).slice(0, 90)}${nn.length > 1 ? ' (+' + (nn.length - 1) + ')' : ''}</div>` : ''}</div>
        <button type="button" class="bm-btn bm-note-btn ${nn.length ? 'on' : ''}" data-nt="${x.k.replace(/"/g,'&quot;')}" title="Note">📝</button>
        ${bmBtn(x.k, 'data-refresh="1"')}
      </div>`; }).join('')}
    </div>`).join(''));
  wireNotesSection(renderBookmarks);
  body.querySelectorAll('.dw-row[data-k]').forEach(el=>{
    el.onclick = ()=>{ const r = bmResolve(el.dataset.k); if(r) r.open(); };
  });
  body.querySelectorAll('[data-nt]').forEach(b=>{
    b.onclick = e=>{ e.stopPropagation(); const k = b.dataset.nt, r = bmResolve(k); openNoteBox({ bm:k, title:r ? r.title : '' }, renderBookmarks); };
  });
}

async function shareCard(cfg){
  try{ await document.fonts.load('700 60px "Scheherazade New"', cfg.arabic || 'ا'); }catch(e){}
  const W = 1080, PAD = 84, MAXW = W - PAD*2;
  const SANS = '"Segoe UI", system-ui, -apple-system, Roboto, sans-serif';
  const AR = '"Scheherazade New", "Noto Naskh Arabic", serif';
  const meas = document.createElement('canvas').getContext('2d');
  function wrap(text, font, dir){
    meas.font = font; meas.direction = dir || 'ltr';
    const out = [];
    String(text).split('\n').forEach(par=>{
      let line = '';
      par.split(/\s+/).filter(Boolean).forEach(w=>{
        const t = line ? line+' '+w : w;
        if(meas.measureText(t).width > MAXW && line){ out.push(line); line = w; } else line = t;
      });
      out.push(line);
    });
    return out;
  }
  const blocks = [];
  if(cfg.kind) blocks.push({ lines:[cfg.kind.toUpperCase()], font:`700 30px ${SANS}`, color:'#a9782f', lh:44, gap:34 });
  if(cfg.arabic){
    let size = 84, lines;
    do{ lines = wrap(cfg.arabic, `700 ${size}px ${AR}`, 'rtl'); size -= 4; }while(lines.length>6 && size>40);
    size += 4;
    blocks.push({ lines, font:`700 ${size}px ${AR}`, color:'#2a2117', lh:Math.round(size*1.7), gap:30, dir:'rtl' });
  }
  if(cfg.title) blocks.push({ lines:wrap(cfg.title, `800 54px ${SANS}`), font:`800 54px ${SANS}`, color:'#a9782f', lh:70, gap:22 });
  if(cfg.sub) blocks.push({ lines:wrap(cfg.sub, `italic 36px ${SANS}`), font:`italic 36px ${SANS}`, color:'#7a6d5a', lh:52, gap:22 });
  if(cfg.body) blocks.push({ lines:wrap(cfg.body, `500 42px ${SANS}`), font:`500 42px ${SANS}`, color:'#2a2117', lh:64, gap:22 });
  if(cfg.foot) blocks.push({ lines:wrap(cfg.foot, `500 30px ${SANS}`), font:`500 30px ${SANS}`, color:'#7a6d5a', lh:44, gap:10 });
  let H = PAD*2 + 90;
  blocks.forEach(b=>{ H += b.lines.length*b.lh + b.gap; });
  H = Math.max(H, 1080);
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0,0,0,H); g.addColorStop(0,'#f8f2e6'); g.addColorStop(1,'#efe4d0');
  ctx.fillStyle = g; ctx.fillRect(0,0,W,H);
  ctx.strokeStyle = '#c9a24f'; ctx.lineWidth = 6; ctx.strokeRect(28,28,W-56,H-56);
  ctx.strokeStyle = '#e2cf9f'; ctx.lineWidth = 2; ctx.strokeRect(44,44,W-88,H-88);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const contentH = blocks.reduce((a,b)=> a + b.lines.length*b.lh + b.gap, 0);
  let y = Math.max(PAD + 30, Math.round((H - contentH)/2) - 20);
  blocks.forEach(b=>{
    ctx.font = b.font; ctx.fillStyle = b.color; ctx.direction = b.dir || 'ltr';
    b.lines.forEach(l=>{ ctx.fillText(l, W/2, y + b.lh/2); y += b.lh; });
    y += b.gap;
  });
  ctx.direction = 'ltr'; ctx.font = `700 30px ${SANS}`; ctx.fillStyle = '#a9782f';
  ctx.fillText('Waqt24  •  iam-zain.github.io/waqt24', W/2, H - PAD - 20);
  const blob = await new Promise(r=> c.toBlob(r, 'image/png'));
  if(!blob){ showToast('Image nahi ban saki'); return; }
  const file = new File([blob], 'waqt24-card.png', { type:'image/png' });
  try{
    if(navigator.canShare && navigator.canShare({ files:[file] })){
      await navigator.share({ files:[file], title:'Waqt24' });
      return;
    }
  }catch(e){ if(e && e.name==='AbortError') return; }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'waqt24-card.png';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(url), 2000);
  showToast('Image download ho gayi');
}
/* Every card share button asks first: Image (card picture) or Text (plain words) */
function openCardShareChooser(cfg){
  const plain = [cfg.kind, cfg.arabic, cfg.title, cfg.sub, cfg.body, cfg.foot].filter(Boolean).join('\n\n');
  document.getElementById('shareChooserImg').onclick = ()=>{ closeModal(); shareCard(cfg); };
  document.getElementById('shareChooserTxt').onclick = ()=>{ closeModal(); shareText(plain + '\n\nWaqt24: iam-zain.github.io/waqt24'); };
  document.getElementById('shareChooser').classList.add('active');
  pushModalState();
}

let duaCat='__all__', duaSearch='';
let hadeesFilter='All', hadeesSearch='';
/* Icon and accent colour per dua category; chips and cards share the Aadaab-e-Zindagi look */
/* One colour per category (Quranic green is reserved for its label) */
const DUA_CAT_META = { 'Rabbana':['🤲','#2fb6b0'], 'Roz Marra':['🛏️','#3a4d8f'], 'Khana':['🍽️','#c0563f'], 'Safar':['🧭','#3f8fe0'], 'Masjid':['🕌','#9b6fd6'], 'Pareshani':['🌧️','#e0893f'], 'Ghar':['🏠','#d6708f'], 'Ramzan':['🌙','#c79a2e'] };
function duaMeta(cat){ return DUA_CAT_META[cat] || ['🤲','#5b8def']; }
/* Rabbana duas each get an icon for their theme (the theme is the third tag) */
const RABBANA_THEME_ICON = { 'Qabooliyat':'🙏', 'Islam':'☪️', 'Duniya Aur Aakhirat':'🌅', 'Sabr':'🏔️', 'Tauba':'💧', 'Hifazat':'🛡️', 'Maghfirat':'🌿', 'Hidayat':'💡', 'Qiyamat':'⏳', 'Iman':'☝️', 'Nek Log':'💫', 'Jahannam':'🔥', 'Rizq':'🍞', 'Sohbat':'👥', 'Haq':'⚖️', 'Ilm-e-Ilahi':'👁️', 'Namaz':'📿', 'Walidain':'👪', 'Aulad':'👶', 'Rehmat':'💞', 'Shukr':'🌸', 'Jannat':'🌳', 'Ukhuwwat':'🤝', 'Tawakkul':'🌱', 'Noor':'✨' };
function duaIcon(d){
  if(d.cat==='Rabbana' && d.tags && RABBANA_THEME_ICON[d.tags[2]]) return RABBANA_THEME_ICON[d.tags[2]];
  return duaMeta(d.cat)[0];
}
function isQuranDua(d){ return /^Qur/.test(d.ref || ''); }
/* English-or-Roman-Urdu text for content. Keys (titles, names) used for bookmarks and status stay in Roman Urdu. */
function isEn(){ return state.lang==='en'; }
function dTitle(d){ return isEn() && d.ent ? d.ent : d.title; }
function dMean(d){ return isEn() && d.enm ? d.enm : d.meaning; }
function dInfo(d){ return isEn() && d.eninfo ? d.eninfo : d.info; }
function hTxt(h){ return isEn() && h.en ? h.en : h.txt; }
function wMean(w){ return isEn() && w.en ? w.en : w.m; }
function wEx(w){ return isEn() && w.exen ? w.exen : w.exm; }
/* Myth-buster item in the current language (Roman Urdu or English) */
function mL(m){ return isEn() && m.enq ? {q:m.enq, optA:m.enA, optB:m.enB, explain:m.enExplain} : m; }
/* Aadaab topic in the current language: English fields replace Roman Urdu ones when the language is English */
function aL(t){
  if(!(isEn() && t.en)) return t;
  const o = Object.assign({}, t, t.en);
  /* guide sections keep their original icon; only heading and items come from the English text */
  if(t.guide && t.en.sections) o.sections = t.sections.map((s,i)=>Object.assign({}, s, t.en.sections[i] || {}));
  return o;
}
function sMean(w){ return isEn() && w.en ? w.en : w.m; }
function sEx(w){ return isEn() && w.exen ? w.exen : w.ex; }
/* Quiz item as [question, options, correct, category]; English version when the language is English */
function quizLocal(item){ return (isEn() && item[4]) ? [item[4].q, item[4].o, item[2], item[3]] : item; }
function renderMoreDua(){
  document.getElementById('detailTitle').textContent="Du'a";
  const body = document.getElementById('detailBody');
  body.innerHTML = `
    <div style="text-align:center; padding:10px 14px 6px;">
      <div style="font-size:12.5px; color:var(--sub);">Quran aur Sunnah ki duayein, Arabic, transliteration, Roman Urdu tarjuma aur hawale ke saath.</div>
    </div>
    <div class="search-bar-wrap">
      <input id="duaSearchInput" placeholder="Dua dhoondhiye...">
      <button id="duaSearchClear" class="search-clear-btn">✕</button>
    </div>
    <div class="chip-row" id="duaCatRow" style="padding:0 0 10px;"></div>
    <div id="duaList"></div>
  `;
  const catRow = body.querySelector('#duaCatRow');
  const allChip = document.createElement('div');
  allChip.className = 'chip' + (duaCat==='__all__' ? ' prayed' : '');
  allChip.textContent = `🌐 Sabhi (${DUAS.length})`;
  allChip.onclick = ()=>{ duaCat='__all__'; renderMoreDua(); };
  catRow.appendChild(allChip);
  /* Chips in one alphabetical list. Qur'ani Dua collects every Quran-sourced dua across categories (Rabbana included) */
  const chipDefs = [...new Set(DUAS.map(d=>d.cat))].map(cat=>({ key:cat, name:cat, ic:duaMeta(cat)[0], count:DUAS.filter(d=>d.cat===cat).length }));
  chipDefs.push({ key:'__quran__', name:"Qur'ani Dua", ic:'📖', count:DUAS.filter(d=>isQuranDua(d)).length });
  chipDefs.sort((a,b)=>a.name.localeCompare(b.name)).forEach(c=>{
    const chip = document.createElement('div');
    chip.className = 'chip' + (duaCat===c.key ? ' prayed' : '');
    chip.textContent = `${c.ic} ${c.name} (${c.count})`;
    chip.onclick = ()=>{ duaCat = c.key; renderMoreDua(); };
    catRow.appendChild(chip);
  });
  document.getElementById('duaSearchInput').value = duaSearch;
  wireLiveSearch('duaSearchInput', 'duaSearchClear', renderDuaList, v=>{ duaSearch = v; });
  renderDuaList();
}
function renderDuaList(){
  const wrap = document.getElementById('duaList');
  const q = duaSearch.trim().toLowerCase();
  const filtered = DUAS.filter(d=>
    (duaCat==='__all__' || (duaCat==='__quran__' ? isQuranDua(d) : d.cat===duaCat)) &&
    (d.title+' '+d.cat+' '+(d.tags||[]).join(' ')+' '+d.translit+' '+d.meaning).toLowerCase().includes(q)
  ).sort((a,b)=>a.title.localeCompare(b.title));
  if(!filtered.length){ wrap.innerHTML = `<div class="empty-state">Koi dua nahi mili.</div>`; return; }
  wrap.innerHTML = filtered.map((d,i)=>{
    const ic = duaIcon(d), color = duaMeta(d.cat)[1];
    const st = duaStatus(d.title);
    return `<div class="aad-card status-${st||'none'}" data-i="${i}" style="--aad-c:${color};">
      <div class="aad-ic">${ic}</div>
      <div class="aad-info">
        <div class="aad-title">${dTitle(d)}</div>
        <div class="aad-tags">${duaTagChips(d)}</div>
        <div class="aad-cat-lbl">${duaCatLabel(d)}</div>
      </div>
      ${st==='amal' ? '<div class="aad-status-badge amal">✅</div>' : st==='soch' ? '<div class="aad-status-badge soch">⏳</div>' : ''}
      <div class="chev">›</div>
    </div>`;
  }).join('');
  wrap.querySelectorAll('.aad-card').forEach(el=>{
    el.onclick = ()=>{
      const i = parseInt(el.dataset.i);
      setNavCtx(filtered, i, openDuaDetail, duaNavCat());
      openDuaDetail(filtered[i]);
    };
  });
}

/* Same tag chip look as Aadaab-e-Zindagi (.aad-tag); duas without explicit tags show their category */
/* Tags that just repeat the category name are dropped; the category is already shown on its own line */
function duaTagChips(d){
  const tags = (d.tags || []).filter(x=>x!==d.cat && x!=='Quranic').sort((a,b)=>a.localeCompare(b));
  return tags.map(x=>`<span class="aad-tag">${x}</span>`).join('');
}
/* Category line on a dua card; Quran-sourced duas show a green "Quranic" beside it */
function duaCatLabel(d){
  return `${d.cat}${isQuranDua(d) ? ' <span class="dua-quran-lbl">• Quranic</span>' : ''}`;
}
/* Memorisation status per dua ('soch' = still to memorise, 'amal' = memorised), same pattern as Aadaab */
function duaStatus(title){ return (state.duaStatus && state.duaStatus[title]) || null; }
function setDuaStatus(title, val){
  if(!state.duaStatus) state.duaStatus = {};
  if(duaStatus(title)===val){ delete state.duaStatus[title]; } // tap again to clear
  else{ state.duaStatus[title] = val; }
  saveState();
}
function openDuaDetail(d){
  state.lastRead = { k:'dua', id:d.title, label:dTitle(d) }; saveState();
  markReadDay();
  document.getElementById('detailTitle').textContent = dTitle(d);
  document.getElementById('detailBody').innerHTML = `
    <div class="detail-actions">
      ${bmBtn('dua:'+d.title)}
      <button class="act-btn" id="duaImgBtn" title="Share karein">${SHARE_SVG}</button>
    </div>
    <div class="aad-head status-${duaStatus(d.title)||'none'}" style="--aad-c:${duaMeta(d.cat)[1]};">
      <div class="aad-head-ic">${duaIcon(d)}</div>
      <div class="aad-head-title">${dTitle(d)}</div>
      <div class="ref" style="margin:-4px 0 8px;">Hawala: ${d.ref}</div>
      <div class="aad-tags center">${duaTagChips(d)}</div>
      <div class="aad-cat-pill">${duaIcon(d)} ${d.cat}</div>
    </div>
    <div class="dua-detail">
      <div class="aad-guide-sec dua-sec-ar">
        <div class="aad-guide-head"><span class="aad-step-lbl">Dua (Arabic)</span></div>
        <div class="arabic dua-ar">${d.arabic}</div>
      </div>
      <div class="aad-guide-sec dua-sec-tr">
        <div class="aad-guide-head"><span class="aad-step-lbl">${isEn() ? 'Transliteration' : 'Talaffuz (Transliteration)'}</span></div>
        <div class="translit dua-tr">${d.translit}</div>
      </div>
      <div class="aad-guide-sec dua-sec-ur">
        <div class="aad-guide-head"><span class="aad-step-lbl">${isEn() ? 'Meaning' : 'Tarjuma (Roman Urdu)'}</span></div>
        <div class="meaning dua-ur">${dMean(d)}</div>
      </div>
      ${d.info ? `<div class="aad-guide-sec dua-sec-info">
        <div class="aad-guide-head"><span class="aad-step-lbl">${isEn() ? 'Hadith & Virtue' : 'Hadees aur Fazilat'}</span></div>
        <div class="meaning dua-info">${dInfo(d)}</div>
      </div>` : ''}
      <div class="dua-amen">آمیــــــــــــــــــــــــــــــــــــــــن یارب العالمیــــــــــــــــــــــــــــــــــــــــن</div>
    </div>
    <div class="aad-status-row">
      <button class="aad-status-btn soch ${duaStatus(d.title)==='soch'?'on':''}" id="duaSochBtn">⏳ Yaad karna baaqi hai</button>
      <button class="aad-status-btn amal ${duaStatus(d.title)==='amal'?'on':''}" id="duaAmalBtn">✅ Yaad ho chuka hai</button>
    </div>
    ${pnBarHtml()}
  `;
  document.getElementById('duaSochBtn').onclick = ()=>{ setDuaStatus(d.title, 'soch'); openDuaDetail(d); };
  document.getElementById('duaAmalBtn').onclick = ()=>{ setDuaStatus(d.title, 'amal'); openDuaDetail(d); };
  document.getElementById('duaImgBtn').onclick = ()=> openCardShareChooser({ kind:"Du'a", arabic:d.arabic, title:dTitle(d), sub:d.translit, body:dMean(d), foot:'Hawala: '+d.ref });
  wirePnBar();
}

let qwordView='grid', qwordSearch='', qwordGroupFilter='__all__', qwordSortMode=0;
/* Taadaad button cycles: 0 = A to Z, 1 = most used first, 2 = least used first */
function qwordSortFn(){
  if(qwordSortMode===1) return (a,b)=>Number(b.occ)-Number(a.occ);
  if(qwordSortMode===2) return (a,b)=>Number(a.occ)-Number(b.occ);
  return (a,b)=>a.tr.localeCompare(b.tr);
}

/* ============================================================
   CONTINUE CARD and SEARCH EVERYTHING (Ma'rifat)
   ============================================================ */
function renderContinueCard(){
  const el = document.getElementById('continueCard');
  if(!el) return;
  const r = state.lastRead;
  const ic = r ? ({quran:'📖', dua:'🤲', hadees:'📜', aadaab:'🪴', name:'💚', qword:'📗'}[r.k] || '📖') : '';
  el.innerHTML = `${r ? `<button class="goal-mini-card cont-card" id="contBtn"><span class="gm-ic">${ic}</span>
      <span class="cont-txt"><span class="cont-lbl">${L({rur:'Jaari rakhein', en:'Continue'})}</span><span class="cont-name">${r.label}</span></span><b class="goal-arrow">›</b></button>` : ''}
    <button class="gs-entry" id="gsEntryBtn">🔍 ${L({rur:'Sab kuch dhoondhiye: dua, hadees, lafz, naam, surah...', en:'Search everything: duas, hadith, words, names, surahs...'})}</button>`;
  const c = document.getElementById('contBtn'); if(c) c.onclick = openLastRead;
  document.getElementById('gsEntryBtn').onclick = ()=> openOverlay(()=>{ gsQuery = ''; renderGlobalSearch(); });
}
function openLastRead(){
  const r = state.lastRead; if(!r) return;
  if(r.k==='quran'){ if(r.ed) state.quranEd = r.ed; return openOverlay(()=> renderQuranReader(r.id)); }
  if(r.k==='name') return openOverlay(()=> renderNameDetail(r.which, r.id));
  const find = { dua:()=>DUAS.find(x=>x.title===r.id), hadees:()=>HADEES.find(x=>hadeesKey(x)===r.id),
    aadaab:()=>AADAAB_TOPICS.find(x=>x.id===r.id), qword:()=>QURAN_WORDS.find(x=>x.tr===r.id) }[r.k];
  const open = { dua:openDuaDetail, hadees:openHadeesDetail, aadaab:openAadaabDetail, qword:openQuranWordDetail }[r.k];
  const item = find && find();
  if(item) openOverlay(()=>{ __navCtx = null; open(item); });
}
let gsQuery = '';
function gsNorm(t){ return String(t||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f'’ʿʾ`]/g,'').replace(/[\s-]+/g,''); } // spaces and hyphens ignored: "yasin" finds Ya-Sin
function renderGlobalSearch(){
  document.getElementById('detailTitle').textContent = L({rur:'Sab mein dhoondhiye', en:'Search everything'});
  document.getElementById('detailBody').innerHTML = `
    <div class="search-bar" style="margin:0 14px 12px;"><input id="gsInput" type="search" placeholder="${L({rur:'Dua, hadees, lafz, naam, surah...', en:'Dua, hadith, word, name, surah...'})}" value="${gsQuery.replace(/"/g,'&quot;')}"></div>
    <div id="gsResults"></div>`;
  const inp = document.getElementById('gsInput');
  inp.oninput = ()=>{ gsQuery = inp.value; drawGlobalSearch(); };
  drawGlobalSearch();
  setTimeout(()=>{ try{ inp.focus(); }catch(e){} }, 60);
}
function drawGlobalSearch(){
  const out = document.getElementById('gsResults'); if(!out) return;
  const q = gsNorm(gsQuery.trim());
  if(q.length < 2){ out.innerHTML = `<div class="empty-state">${L({rur:'Kam az kam 2 harf likhiye', en:'Type at least 2 letters'})}</div>`; return; }
  const has = (...f)=> f.some(x=> gsNorm(x).includes(q));
  const groups = [
    { k:'surah', t:L({rur:'Qur\'an: Surah', en:'Quran: Surahs'}), ic:'📖', items:QURAN_SURAHS.filter(x=>has(x.name, x.ar)).map(x=>({ i:x.n, t:`${x.n}. ${x.name}`, s:`${x.ar} · Page ${x.page}` })) },
    { k:'dua', t:L({rur:'Duain', en:'Duas'}), ic:'🤲', items:DUAS.map((d,i)=>({d,i})).filter(({d})=>has(d.title, dTitle(d), d.translit, d.meaning, dMean(d))).map(({d,i})=>({ i, t:dTitle(d), s:d.cat })) },
    { k:'hadees', t:L({rur:'Hadees', en:'Hadith'}), ic:'📜', items:HADEES.map((h,i)=>({h,i})).filter(({h})=>has(h.txt, hTxt(h), h.src)).map(({h,i})=>({ i, t:(hTxt(h)||'').slice(0,70)+'…', s:h.src })) },
    { k:'aadaab', t:'Aadaab-e-Zindagi', ic:'🪴', items:AADAAB_TOPICS.map((t,i)=>({t,i})).filter(({t})=>has(t.title, t.en && t.en.title)).map(({t,i})=>({ i, t:(isEn() && t.en && t.en.title) || t.title, s:'' })) },
    { k:'qword', t:L({rur:"Qur'ani Alfaaz", en:'Quranic Words'}), ic:'📗', items:QURAN_WORDS.map((w,i)=>({w,i})).filter(({w})=>has(w.tr, w.m, w.en)).map(({w,i})=>({ i, t:w.tr, s:(isEn() && w.en) || w.m })) },
    { k:'shabd', t:L({rur:'Khaas Shabd', en:'Special Words'}), ic:'📚', items:KHAAS_SHABD.map((w,i)=>({w,i})).filter(({w})=>has(w.tr, w.m, w.en)).map(({w,i})=>({ i, t:w.tr, s:(isEn() && w.en) || w.m })) },
    { k:'asma', t:'Asma-ul-Husna', ic:'💚', items:ASMA_UL_HUSNA.map((w,i)=>({w,i})).filter(({w})=>has(w.tr, w.m, w.en)).map(({w,i})=>({ i, t:w.tr, s:(isEn() && w.en) || w.m })) },
    { k:'prophet', t:L({rur:'Muhammad ﷺ ke Naam', en:'Names of Muhammad ﷺ'}), ic:'🌙', items:PROPHET_NAMES.map((w,i)=>({w,i})).filter(({w})=>has(w.tr, w.m, w.en)).map(({w,i})=>({ i, t:w.tr, s:(isEn() && w.en) || w.m })) },
  ].filter(g=>g.items.length);
  if(!groups.length){ out.innerHTML = `<div class="empty-state">${L({rur:'Kuch nahi mila', en:'Nothing found'})}</div>`; return; }
  out.innerHTML = groups.map(g=>`<div class="section-title" style="margin:6px 14px 8px;">${g.ic} ${g.t} <span class="gs-count">${g.items.length}</span></div>
    <div class="more-list" style="padding-top:0;">${g.items.slice(0,15).map(x=>`<div class="more-item gs-item" data-g="${g.k}" data-i="${x.i}"><div class="lbl">${x.t}${x.s?`<span class="lblSub">${String(x.s).slice(0,90)}</span>`:''}</div><div class="chev">›</div></div>`).join('')}</div>`).join('');
  out.querySelectorAll('.gs-item').forEach(el=>{
    el.onclick = ()=>{
      const i = +el.dataset.i, g = el.dataset.g;
      if(g==='surah') return renderQuranReader(QURAN_SURAHS[i-1].page);
      if(g==='asma' || g==='prophet') return renderNameDetail(g, i);
      if(g==='shabd') return renderShabdDetail(i, renderGlobalSearch);
      __navCtx = null;
      if(g==='dua') openDuaDetail(DUAS[i]);
      else if(g==='hadees') openHadeesDetail(HADEES[i]);
      else if(g==='aadaab') openAadaabDetail(AADAAB_TOPICS[i]);
      else if(g==='qword') openQuranWordDetail(QURAN_WORDS[i]);
    };
  });
}

/* ============================================================
   IN-APP SHEETS in place of the browser's own alert/confirm pop-ups
   ============================================================ */
function appConfirm(msg, okLabel){
  return new Promise(res=>{
    const w = document.createElement('div');
    w.className = 'app-confirm';
    w.innerHTML = `<div class="info-card"><div class="info-text">${msg}</div><div class="ac-btns">
      <button class="ac-no">${L({rur:'Rehne dein', en:'Cancel'})}</button><button class="ac-yes">${okLabel || L({rur:'Haan', en:'Yes'})}</button></div></div>`;
    document.body.appendChild(w);
    const done = v=>{ w.remove(); res(v); };
    w.querySelector('.ac-no').onclick = ()=> done(false);
    w.querySelector('.ac-yes').onclick = ()=> done(true);
    w.onclick = e=>{ if(e.target===w) done(false); };
  });
}
function appInfo(text){
  const w = document.createElement('div');
  w.className = 'app-confirm';
  w.innerHTML = `<div class="info-card"><pre class="ac-pre"></pre><div class="ac-btns"><button class="ac-yes">OK</button></div></div>`;
  w.querySelector('.ac-pre').textContent = text;
  document.body.appendChild(w);
  w.querySelector('.ac-yes').onclick = ()=> w.remove();
  w.onclick = e=>{ if(e.target===w) w.remove(); };
}

/* ============================================================
   FIRST-RUN SETUP: city, language, Azaan and reminders (every step can be skipped)
   ============================================================ */
let setupCityQuery = '';
function closeSetup(){ state.setupDone = true; delete state.setupStep; saveState(); const o = document.getElementById('setupOverlay'); if(o) o.remove(); renderHome(); }
function showSetup(step){
  let o = document.getElementById('setupOverlay');
  if(!o){ o = document.createElement('div'); o.id = 'setupOverlay'; document.body.appendChild(o); }
  state.setupStep = step; saveState();
  const steps = ['city','lang','alerts'];
  const n = steps.indexOf(step);
  const head = `<div class="su-top"><div class="su-dots">${steps.map((x,i)=>`<i class="${i<=n?'on':''}"></i>`).join('')}</div>
    <button class="su-skip" id="suSkip">${L({rur:'Skip karein', en:'Skip'})}</button></div>`;
  let body = '';
  if(step==='city'){
    body = `<div class="su-ic">🕌</div><div class="su-title">${L({rur:'Assalamu Alaikum! Apna shahar chunein', en:'Assalamu Alaikum! Choose your city'})}</div>
      <div class="su-sub">${L({rur:'Namaz ke sahi auqaat ke liye.', en:'For accurate prayer times.'})}</div>
      <button class="backup-btn" id="suGps">📡 ${L({rur:'GPS se location lein', en:'Use my location (GPS)'})}</button>
      <div class="su-sub" id="suGpsMsg"></div>
      <div class="search-bar" style="margin:8px 0 10px;"><input id="suCity" placeholder="${L({rur:'Shahar dhoondhiye...', en:'Search city...'})}" value="${setupCityQuery.replace(/"/g,'&quot;')}"></div>
      <div id="suCityList" class="su-list"></div>`;
  } else if(step==='lang'){
    body = `<div class="su-ic">🌐</div><div class="su-title">${L({rur:'Zubaan chunein', en:'Choose language'})}</div>
      ${[['rur','Hinglish / Roman Urdu'],['en','English']].map(([k,l])=>`<div class="lang-opt ${state.lang===k?'on':''}" data-su-lang="${k}" role="button" tabindex="0"><div><b>${l}</b></div><div class="lang-check">${state.lang===k?'✓':''}</div></div>`).join('')}
      <button class="backup-btn" id="suNext">${L({rur:'Aage', en:'Next'})} ›</button>`;
  } else {
    const a = azaanState();
    body = `<div class="su-ic">🔔</div><div class="su-title">${L({rur:'Azaan aur yaad-dahani', en:'Azaan and reminders'})}</div>
      <div class="ramzan-card" style="margin:0 0 12px;">
        <div class="roza-toggle"><span style="font-size:13.5px; font-weight:700;">${L({rur:'Namaz ke waqt Azaan', en:'Azaan at prayer times'})}<span class="su-note">${L({rur:'Jab app khuli ho', en:'While the app is open'})}</span></span><div class="switch ${a.on?'on':''}" id="suAz"><div class="knob"></div></div></div>
        <div class="roza-toggle"><span style="font-size:13.5px; font-weight:700;">${L({rur:'Farz namaz ki yaad-dahani', en:'Farz prayer reminders'})}<span class="su-note">${L({rur:'Notification', en:'Notification'})}</span></span><div class="switch ${state.notif.fard?'on':''}" id="suNotif"><div class="knob"></div></div></div>
      </div>
      <div class="su-sub">${L({rur:'Yeh sab baad mein Settings mein badal sakte hain.', en:'You can change all of this later in Settings.'})}</div>
      <button class="backup-btn" id="suDone">${L({rur:'Shuru karein', en:'Get started'})} ✓</button>`;
  }
  o.innerHTML = `<div class="su-card">${head}${body}</div>`;
  document.getElementById('suSkip').onclick = closeSetup;
  if(step==='city'){
    const pick = c=>{ state.location = { name:c.name, lat:c.lat, lon:c.lon, state:c.state, source:'manual' }; saveState(); renderHome(); renderCalendar(); showSetup('lang'); };
    const draw = ()=>{
      const q = gsNorm(setupCityQuery.trim());
      const list = (q ? CITIES.filter(c=> gsNorm(c.name+' '+(c.state||'')).includes(q)) : CITIES).slice(0, 40);
      const el = document.getElementById('suCityList');
      el.innerHTML = list.map((c,i)=>`<div class="more-item" data-ci="${i}"><div class="lbl">${c.name}${c.state?`<span class="lblSub">${c.state}</span>`:''}</div><div class="chev">›</div></div>`).join('');
      el.querySelectorAll('[data-ci]').forEach(r=>{ r.onclick = ()=> pick(list[+r.dataset.ci]); });
    };
    const inp = document.getElementById('suCity');
    inp.oninput = ()=>{ setupCityQuery = inp.value; draw(); };
    draw();
    document.getElementById('suGps').onclick = ()=>{
      const msg = document.getElementById('suGpsMsg');
      if(!navigator.geolocation){ msg.textContent = L({rur:'Is browser mein GPS nahi hai, list se shahar chunein.', en:'GPS is not available here; choose a city from the list.'}); return; }
      msg.textContent = L({rur:'Location maloom ki jaa rahi hai...', en:'Finding your location...'});
      navigator.geolocation.getCurrentPosition(pos=>{
        state.location = { name:'Current Location', lat:pos.coords.latitude, lon:pos.coords.longitude, source:'gps', tz:deviceTZ() };
        saveState(); renderHome(); renderCalendar(); showSetup('lang');
      }, ()=>{ msg.textContent = L({rur:'Location nahi mil saki, list se shahar chunein.', en:'Could not get your location; choose a city from the list.'}); }, { timeout:10000 });
    };
  } else if(step==='lang'){
    o.querySelectorAll('[data-su-lang]').forEach(el=>{
      el.onclick = ()=>{
        const v = el.dataset.suLang;
        if(v===state.lang) return;
        state.lang = v; state.setupStep = 'lang'; saveState(); reloadSmooth(false); // the English layer starts on load
      };
    });
    document.getElementById('suNext').onclick = ()=> showSetup('alerts');
  } else {
    document.getElementById('suAz').onclick = ()=>{ const a = azaanState(); a.on = !a.on; saveState(); showSetup('alerts'); };
    document.getElementById('suNotif').onclick = async ()=>{
      state.notif.fard = !state.notif.fard; saveState();
      if(state.notif.fard && 'Notification' in window && Notification.permission==='default'){ try{ await Notification.requestPermission(); }catch(e){} }
      scheduleNotifications(true); showSetup('alerts');
    };
    document.getElementById('suDone').onclick = closeSetup;
  }
}
/* ============================================================
   AZAAN: text with meaning, recordings from around the world, and playback at prayer time
   (recordings: freely licensed, from Wikimedia Commons; credits shown on the Azaan screen)
   ============================================================ */
const AZAAN_RECS = [{"id": "makkah", "ic": "🕋", "rur": "Makkah · Masjid al-Haram", "en": "Makkah · Masjid al-Haram", "sec": 197, "excerpt": false, "fajr": false, "artist": "Seyfula Islam", "license": "CC BY 3.0", "page": "https://commons.wikimedia.org/wiki/File%3AAdhan%2C_Great_Mosque_of_Mecca_-_Jan_21%2C_2013.webm"}, {"id": "makkah-maghrib", "ic": "🕋", "rur": "Makkah · Masjid al-Haram (Maghrib)", "en": "Makkah · Masjid al-Haram (Maghrib)", "sec": 301, "excerpt": false, "fajr": false, "artist": "3omar Faruq", "license": "CC BY 3.0", "page": "https://commons.wikimedia.org/wiki/File%3AMaghrib_Adhan_at_the_Masjid_al_Haram%2C_Mecca_-_25_Feb%2C_2012.webm"}, {"id": "madinah", "ic": "🕌", "rur": "Madinah · Masjid an-Nabawi", "en": "Madinah · Prophet's Mosque", "sec": 187, "excerpt": false, "fajr": false, "artist": "ejaz215", "license": "CC BY 3.0", "page": "https://commons.wikimedia.org/wiki/File%3A33937_ejaz215_call-to-prayer-from-the-prophet-s-mo.ogg"}, {"id": "malmo-fajr", "ic": "🌅", "rur": "Malmö, Sweden · Fajr ki Azaan", "en": "Malmö, Sweden · Fajr Azaan", "sec": 248, "excerpt": false, "fajr": true, "artist": "Islamic Center Malmö", "license": "CC BY 3.0", "page": "https://commons.wikimedia.org/wiki/File%3AEid_al-Fitr_Fajr_azan_at_Malm%C3%B6_Mosque_-_19_August_2012.webm"}, {"id": "aleppo", "ic": "🇸🇾", "rur": "Halab (Aleppo), Syria · Sabah Fakhri", "en": "Aleppo, Syria · Sabah Fakhri", "sec": 158, "excerpt": false, "fajr": false, "artist": "Sabah Fakhri", "license": "Public domain", "page": "https://commons.wikimedia.org/wiki/File%3ACall_to_prayer_by_Sabah_Fakhry.mp3"}, {"id": "casablanca", "ic": "🇲🇦", "rur": "Casablanca, Morocco · Hassan II Masjid", "en": "Casablanca, Morocco · Hassan II Mosque", "sec": 176, "excerpt": false, "fajr": false, "artist": "Fraguando", "license": "CC BY-SA 4.0", "page": "https://commons.wikimedia.org/wiki/File%3ALlamada_a_oraci%C3%B3n_Mezquita_Hassan_II.wav"}, {"id": "kazakhstan", "ic": "🇰🇿", "rur": "Shalqar, Kazakhstan", "en": "Shalqar, Kazakhstan", "sec": 155, "excerpt": false, "fajr": false, "artist": "Esetok", "license": "CC BY-SA 4.0", "page": "https://commons.wikimedia.org/wiki/File%3AAdhan_in_Shalqar_mosque.webm"}, {"id": "istanbul", "ic": "🇹🇷", "rur": "Istanbul, Turkey", "en": "Istanbul, Turkey", "sec": 50, "excerpt": true, "fajr": false, "artist": "Viceskeeni2", "license": "CC0", "page": "https://commons.wikimedia.org/wiki/File%3AAdhan_in_Istanbul.webm"}, {"id": "konya", "ic": "🇹🇷", "rur": "Konya, Turkey", "en": "Konya, Turkey", "sec": 60, "excerpt": true, "fajr": false, "artist": "Frans van der Vaart", "license": "CC BY 3.0", "page": "https://commons.wikimedia.org/wiki/File%3AHminsec150_Konya.webm"}, {"id": "nigeria", "ic": "🇳🇬", "rur": "Nigeria", "en": "Nigeria", "sec": 65, "excerpt": true, "fajr": false, "artist": "Isaacayodele32", "license": "CC BY-SA 4.0", "page": "https://commons.wikimedia.org/wiki/File%3ACall_to_prayer.ogg"}, {"id": "aaqib", "ic": "🎙️", "rur": "Aaqib Azeez ki awaaz mein", "en": "Recited by Aaqib Azeez", "sec": 87, "excerpt": false, "fajr": false, "artist": "Atcovi", "license": "CC BY-SA 4.0", "page": "https://commons.wikimedia.org/wiki/File%3AThe_Adhan_-_Muslim_Call_to_Prayer_-_Aaqib_Azeez.mp3"}, {"id": "adam", "ic": "🎙️", "rur": "Azaan (Adam-synagda ki recording)", "en": "Azaan (recorded by Adam-synagda)", "sec": 154, "excerpt": false, "fajr": false, "artist": "Adam-synagda", "license": "CC0", "page": "https://commons.wikimedia.org/wiki/File%3ABeautiful_adhan.ogg"}, {"id": "andrewler", "ic": "🎙️", "rur": "Azaan (Andrewler ki recording)", "en": "Azaan (recorded by Andrewler)", "sec": 184, "excerpt": false, "fajr": false, "artist": "Andrewler", "license": "CC BY-SA 4.0", "page": "https://commons.wikimedia.org/wiki/File%3AAzan.ogg"}];
const AZAAN_TEXT = [
  { ar:'اللّٰهُ أَكْبَرُ', tr:'Allahu Akbar', n:4, m:{rur:'Allah sab se bada hai', en:'Allah is the Greatest'} },
  { ar:'أَشْهَدُ أَنْ لَا إِلٰهَ إِلَّا اللّٰهُ', tr:'Ash-hadu an la ilaha illallah', n:2, m:{rur:'Main gawahi deta hoon ke Allah ke siwa koi ibadat ke laaiq nahi', en:'I bear witness that there is no god but Allah'} },
  { ar:'أَشْهَدُ أَنَّ مُحَمَّدًا رَسُولُ اللّٰهِ', tr:'Ash-hadu anna Muhammadan Rasulullah', n:2, m:{rur:'Main gawahi deta hoon ke Muhammad ﷺ Allah ke Rasool hain', en:'I bear witness that Muhammad ﷺ is the Messenger of Allah'} },
  { ar:'حَيَّ عَلَى الصَّلَاةِ', tr:"Hayya 'alas-Salah", n:2, m:{rur:'Aao namaz ki taraf', en:'Come to prayer'} },
  { ar:'حَيَّ عَلَى الْفَلَاحِ', tr:"Hayya 'alal-Falah", n:2, m:{rur:'Aao kamyabi ki taraf', en:'Come to success'} },
  { ar:'الصَّلَاةُ خَيْرٌ مِنَ النَّوْمِ', tr:'As-Salatu khairum minan-nawm', n:2, fajr:true, m:{rur:'Namaz neend se behtar hai', en:'Prayer is better than sleep'} },
  { ar:'اللّٰهُ أَكْبَرُ', tr:'Allahu Akbar', n:2, m:{rur:'Allah sab se bada hai', en:'Allah is the Greatest'} },
  { ar:'لَا إِلٰهَ إِلَّا اللّٰهُ', tr:'La ilaha illallah', n:1, m:{rur:'Allah ke siwa koi ibadat ke laaiq nahi', en:'There is no god but Allah'} },
];
const AZAAN_DUA = {
  ar:'اللّٰهُمَّ رَبَّ هٰذِهِ الدَّعْوَةِ التَّامَّةِ، وَالصَّلَاةِ الْقَائِمَةِ، آتِ مُحَمَّدًا الْوَسِيلَةَ وَالْفَضِيلَةَ، وَابْعَثْهُ مَقَامًا مَحْمُودًا الَّذِي وَعَدْتَهُ',
  tr:"Allahumma Rabba hazihid-da'watit-tammah, was-salatil-qa'imah, aati Muhammadanil-waseelata wal-fadeelah, wab'ath-hu maqamam mahmudanil-lazi wa'adtah",
  m:{rur:'Aye Allah, is mukammal pukaar aur qaaim hone wali namaz ke Rab! Muhammad ﷺ ko Waseela aur Fazeelat ata farma, aur unhein us Maqam-e-Mahmood par pahuncha jiska Tu ne un se waada kiya hai.',
     en:'O Allah, Lord of this perfect call and of the prayer about to be established, grant Muhammad ﷺ al-Waseelah and excellence, and raise him to the praised station You have promised him.'},
  ref:'Sahih al-Bukhari 614'
};
/* Default: a different recording for each prayer, so the sound itself tells which prayer it is */
const AZAAN_DEFAULT_PICK = { fajr:'malmo-fajr', zuhr:'madinah', asr:'aleppo', maghrib:'makkah-maghrib', isha:'makkah' };
function azaanState(){
  if(!state.azaan) state.azaan = { on:false, prayers:{fajr:true, zuhr:true, asr:true, maghrib:true, isha:true}, pick:Object.assign({}, AZAAN_DEFAULT_PICK) };
  const a = state.azaan;
  if(!a.prayers) a.prayers = {fajr:true, zuhr:true, asr:true, maghrib:true, isha:true};
  if(!a.pick) a.pick = Object.assign({}, AZAAN_DEFAULT_PICK);
  // Fajr may only use a Fajr Azaan; the other four only a regular one
  FIVE.forEach(k=>{ if(!azaanRecsFor(k).some(r=>r.id===a.pick[k])) a.pick[k] = AZAAN_DEFAULT_PICK[k]; });
  if(!a.played) a.played = {};
  return a;
}
function azaanRecsFor(k){ return AZAAN_RECS.filter(r=> k==='fajr' ? r.fajr : !r.fajr); }
function azaanRec(id){ return AZAAN_RECS.find(r=>r.id===id) || AZAAN_RECS[0]; }
function fmtSecs(n){ return Math.floor(n/60) + ':' + String(n%60).padStart(2,'0'); }
const PRAYER_LABEL = { fajr:'Fajr', zuhr:'Zuhr', asr:'Asr', maghrib:'Maghrib', isha:'Isha' };

/* One shared player for previews and prayer-time Azaan, with a floating Stop bar */
let azaanAudio = null, azaanPlayingId = null;
function stopAzaan(){
  if(azaanAudio){ azaanAudio.pause(); if(azaanAudio.src.startsWith('blob:')) URL.revokeObjectURL(azaanAudio.src); azaanAudio = null; }
  azaanPlayingId = null;
  const bar = document.getElementById('azaanBar'); if(bar) bar.remove();
  document.querySelectorAll('.az-play.on').forEach(b=>{ b.classList.remove('on'); b.textContent = '▶'; });
}
function playAzaan(id, label){
  stopAzaan();
  const rec = azaanRec(id);
  azaanAudio = new Audio(`azan/${rec.id}.mp3`);
  azaanPlayingId = rec.id;
  azaanAudio.onended = stopAzaan;
  // gentle start: the volume rises to the chosen level over about 3 seconds
  const target = Math.max(0.05, Math.min(1, azaanState().vol ?? 1));
  azaanAudio.volume = 0;
  const au = azaanAudio, fade = setInterval(()=>{ if(au !== azaanAudio){ clearInterval(fade); return; } au.volume = Math.min(target, au.volume + target/30); if(au.volume >= target) clearInterval(fade); }, 100);
  const p = azaanAudio.play();
  if(p && p.catch) p.catch(()=>{ stopAzaan(); showToast(L({rur:'Azaan chalaane ke liye app par ek baar tap karein', en:'Tap the app once to allow the Azaan to play'})); });
  const bar = document.createElement('div');
  bar.id = 'azaanBar';
  bar.innerHTML = `<div class="azb-top"><span class="azb-ic">🔊</span><span class="azb-txt">${label || L({rur:rec.rur, en:rec.en})}</span><button class="azb-pause" id="azaanPauseBtn" aria-label="Pause">❚❚</button><button id="azaanStopBtn">■ ${L({rur:'Band karein', en:'Stop'})}</button></div>
    <div class="azb-seek"><span id="azbCur">0:00</span><input type="range" id="azbRange" min="0" max="${rec.sec}" step="0.1" value="0" aria-label="${L({rur:'Azaan ki timeline', en:'Azaan timeline'})}"><span id="azbDur">${fmtSecs(rec.sec)}</span></div>`;
  document.body.appendChild(bar);
  document.getElementById('azaanStopBtn').onclick = stopAzaan;
  wireAzaanSeek(azaanAudio, rec);
  document.querySelectorAll(`.az-play[data-id="${rec.id}"]`).forEach(b=>{ b.classList.add('on'); b.textContent = '■'; });
}
/* Keep the bar's timeline in step with the audio; dragging or tapping the timeline jumps there */
function wireAzaanSeek(audio, rec){
  const range = document.getElementById('azbRange'), cur = document.getElementById('azbCur'), dur = document.getElementById('azbDur');
  const pauseBtn = document.getElementById('azaanPauseBtn');
  let dragging = false;
  const total = ()=> (isFinite(audio.duration) && audio.duration > 0) ? audio.duration : rec.sec;
  const paint = (t)=>{
    range.max = total();
    range.style.setProperty('--p', (Math.min(1, t / total()) * 100) + '%');
    cur.textContent = fmtSecs(Math.floor(t));
  };
  audio.addEventListener('loadedmetadata', ()=>{ dur.textContent = fmtSecs(Math.round(total())); paint(audio.currentTime); });
  audio.addEventListener('timeupdate', ()=>{ if(audio !== azaanAudio || dragging) return; range.value = audio.currentTime; paint(audio.currentTime); });
  range.addEventListener('input', ()=>{ dragging = true; paint(parseFloat(range.value)); });
  range.addEventListener('change', ()=>{ seekAzaan(audio, parseFloat(range.value)); dragging = false; });
  pauseBtn.onclick = ()=>{
    if(audio.paused){ audio.play(); pauseBtn.textContent = '❚❚'; pauseBtn.setAttribute('aria-label', 'Pause'); }
    else { audio.pause(); pauseBtn.textContent = '▶'; pauseBtn.setAttribute('aria-label', 'Play'); }
  };
}
/* Jump to t seconds. A recording served whole (the offline cache, or a server without byte ranges)
   cannot be seeked while streaming, so load it into memory once and seek there. */
function seekAzaan(audio, t){
  const s = audio.seekable;
  for(let i = 0; i < s.length; i++) if(s.start(i) <= t && t <= s.end(i)){ audio.currentTime = t; return; }
  if(audio.src.startsWith('blob:')){ audio.currentTime = t; return; }
  fetch(audio.src).then(r=> r.blob()).then(b=>{
    if(audio !== azaanAudio) return;
    const wasPaused = audio.paused;
    audio.addEventListener('loadedmetadata', ()=>{ audio.currentTime = t; if(!wasPaused) audio.play(); }, { once:true });
    audio.src = URL.createObjectURL(b);
  }).catch(()=>{});
}
/* At each chosen prayer's start time, play its Azaan once (only while the app is open) */
function checkAzaanTime(){
  const a = azaanState();
  if(!a.on) return;
  const now = new Date();
  const sched = buildSchedule(operatingDate(now));
  FIVE.forEach(k=>{
    if(!a.prayers[k]) return;
    const p = sched.find(x=>x.key===k); if(!p) return;
    const key = dayKey(p.start) + '_' + k;
    const late = now - p.start;
    if(late >= 0 && late < 90*1000 && !a.played[key]){
      a.played[key] = true;
      // keep only the last few days of "already played" marks
      Object.keys(a.played).forEach(x=>{ if(x.slice(0, x.lastIndexOf('_')) < dayKey(new Date(now - 3*86400000))) delete a.played[x]; });
      saveState();
      playAzaan(a.pick[k], `${PRAYER_LABEL[k]} ${L({rur:'ki Azaan', en:'Azaan'})}`);
    }
  });
}
setInterval(checkAzaanTime, 5000);
document.addEventListener('visibilitychange', ()=>{ if(!document.hidden) checkAzaanTime(); });

function azaanRecRow(r){
  return `<div class="az-rec">
    <button class="az-play ${azaanPlayingId===r.id?'on':''}" data-id="${r.id}">${azaanPlayingId===r.id?'■':'▶'}</button>
    <div class="az-info">
      <div class="az-name">${r.ic} ${L({rur:r.rur, en:r.en})}</div>
      <div class="az-sub">${fmtSecs(r.sec)}${r.excerpt ? ' · ' + L({rur:'hissa (poori nahi)', en:'excerpt'}) : ''}${r.fajr ? ' · ' + L({rur:'Fajr ke liye', en:'for Fajr'}) : ''}</div>
      <div class="az-credit">${L({rur:'Recording', en:'Recording'})}: ${r.artist} · ${r.license} · <a href="${r.page}" target="_blank" rel="noopener">Wikimedia Commons</a></div>
    </div>
  </div>`;
}
function wireAzaanPlay(){
  document.querySelectorAll('#detailBody .az-play').forEach(b=>{
    b.onclick = ()=>{ if(azaanPlayingId===b.dataset.id) stopAzaan(); else playAzaan(b.dataset.id); };
  });
}
function renderAzaan(){
  document.getElementById('detailTitle').textContent = 'Azaan';
  const a = azaanState();
  document.getElementById('detailBody').innerHTML = `
    <div class="backup-note">${L({rur:'Azaan ke alfaaz, unka talaffuz aur maana, aur duniya bhar ki masjidon se Azaan suniye.', en:'The words of the Azaan with pronunciation and meaning, and Azaan recordings from mosques around the world.'})}</div>
    <button class="backup-btn" id="azaanSetBtn">⚙️ ${L({rur:'Namaz ke waqt Azaan', en:'Azaan at prayer times'})}: ${a.on ? L({rur:'On', en:'On'}) : L({rur:'Off', en:'Off'})}</button>
    <div class="section-title">${L({rur:'Azaan ke Alfaaz', en:'Words of the Azaan'})}</div>
    <div class="az-text">${AZAAN_TEXT.map(x=>`<div class="az-line ${x.fajr?'fajr':''}">
      <div class="az-ar ar-font">${x.ar}</div>
      <div class="az-tr">${x.tr} <b>×${x.n}</b></div>
      <div class="az-m">${L(x.m)}</div>
      ${x.fajr ? `<div class="az-fajr">${L({rur:'Sirf Fajr ki Azaan mein, Hayya alal-Falah ke baad', en:'Only in the Fajr Azaan, after Hayya alal-Falah'})}</div>` : ''}
    </div>`).join('')}</div>
    <div class="section-title">${L({rur:'Azaan ke baad ki Dua', en:'Dua after the Azaan'})}</div>
    <div class="az-text"><div class="az-line">
      <div class="az-ar ar-font">${AZAAN_DUA.ar}</div>
      <div class="az-tr">${AZAAN_DUA.tr}</div>
      <div class="az-m">${L(AZAAN_DUA.m)}</div>
      <div class="az-fajr">${L({rur:'Hawala', en:'Reference'})}: ${AZAAN_DUA.ref}</div>
    </div></div>
    <div class="section-title">${L({rur:'Duniya bhar ki Azaan', en:'Azaan from around the world'})}</div>
    <div class="az-list">${AZAAN_RECS.map(azaanRecRow).join('')}</div>
    <div class="backup-note">${L({rur:'Recordings Wikimedia Commons se hain, free license (CC0, Public domain, CC BY, CC BY-SA) ke saath. Har recording ke saath uske banane wale aur license ka zikr hai.', en:'Recordings are from Wikimedia Commons under free licences (CC0, public domain, CC BY, CC BY-SA). Each recording lists its author and licence.'})}</div>
  `;
  document.getElementById('azaanSetBtn').onclick = renderAzaanSettings;
  wireAzaanPlay();
}

/* ============================================================
   SETTINGS: prayer calculation (Asr method, Hijri adjustment) and Iqamah (jamaat) times
   ============================================================ */
function afterCalcChange(){ renderHome(); renderCalendar(); updateRamzanLock(); scheduleNotifications(true); }
function renderCalcSettings(){
  document.getElementById('detailTitle').textContent = L({rur:'Namaz ka Hisaab', en:'Prayer Calculation'});
  const hd = gregorianToHijri(new Date());
  const off = hijriOffset();
  document.getElementById('detailBody').innerHTML = `
    <div class="section-title" style="margin-top:0;">${L({rur:'Asr ka waqt', en:'Asr time'})}</div>
    <div class="theme-row" style="padding:0 0 6px;">
      <button data-asr="hanafi" class="${state.asrMethod!=='shafi'?'active':''}">Hanafi</button>
      <button data-asr="shafi" class="${state.asrMethod==='shafi'?'active':''}">Shafi'i / Maliki / Hanbali</button>
    </div>
    <div class="backup-note" style="margin-top:0;">${L({rur:"Hanafi: jab saaya cheez se do guna ho jaaye. Shafi'i: jab saaya cheez ke barabar ho. Shafi'i mein Asr lagbhag ek ghanta pehle shuru hoti hai.", en:"Hanafi: when a shadow is twice an object's length. Shafi'i: when it equals the length. Shafi'i Asr starts about an hour earlier."})}</div>
    <div class="section-title">${L({rur:'Hijri tareekh', en:'Hijri date'})}</div>
    <div class="ramzan-card" style="margin:0 0 8px;">
      <div style="font-size:15px; font-weight:800; text-align:center; margin-bottom:10px;">${hd.day} ${hd.monthName} ${hd.year} AH</div>
      <div class="hij-adj">${[-2,-1,0,1,2].map(v=>`<button data-hoff="${v}" class="${v===off?'on':''}">${v>0?'+':''}${v}</button>`).join('')}</div>
    </div>
    <div class="backup-note" style="margin-top:0;">${L({rur:'Chaand dikhne ke hisaab se agar aapke yahan tareekh ek do din aage ya peeche ho to yahan theek karein. Ramzan, Khaas Din aur Taareekh sab is ke saath badlenge.', en:'If your local moon sighting puts the date a day or two ahead or behind, adjust it here. Ramzan, Special Days and the Calendar all follow it.'})}</div>
    <div class="section-title">${L({rur:'Hisaab ka tareeqa (Fajr aur Isha)', en:'Calculation method (Fajr and Isha)'})}</div>
    ${Object.entries(CALC_METHODS).map(([k,m])=>`<div class="lang-opt ${ (state.calcMethod||'mwl')===k?'on':''}" data-cm="${k}" role="radio" aria-checked="${(state.calcMethod||'mwl')===k}" tabindex="0"><div><b>${m.name}</b><span>${m.note}</span></div><div class="lang-check">${(state.calcMethod||'mwl')===k?'✓':''}</div></div>`).join('')}
    <div class="backup-note">${L({rur:'India aur Pakistan mein aam taur par Karachi ya MWL chalta hai. Agar aapki masjid ke waqt se farq aaye to yahan tareeqa badlein ya neeche minute adjust karein.', en:'Karachi or MWL is common in India and Pakistan. If times differ from your mosque, change the method here or fine-tune minutes below.'})}</div>
    <div class="section-title">${L({rur:'Har namaz ke minute adjust karein', en:'Adjust minutes per prayer'})}</div>
    <div class="adj-list">${ADJ_KEYS.map(k=>{ const v = prayerAdjust(k); return `<div class="adj-row"><span>${({fajr:'Fajr',zuhr:'Zuhr',asr:'Asr',maghrib:'Maghrib',isha:'Isha'})[k]}</span><button data-adj="${k}" data-d="-1" aria-label="${k} minus 1 minute">−</button><b>${v>0?'+':''}${v} min</b><button data-adj="${k}" data-d="1" aria-label="${k} plus 1 minute">+</button></div>`; }).join('')}
      <button class="backup-btn" id="adjReset" style="margin-top:10px;">${L({rur:'Sab adjustment hata dein', en:'Reset all adjustments'})}</button></div>
    <div class="backup-note">${L({rur:'Waqt aap ke shahar ke time zone (garmi/sardi ki ghadi samet) ke mutabiq hain.', en:"Times follow your city's time zone, including daylight saving."})}</div>`;
  document.querySelectorAll('#detailBody [data-asr]').forEach(b=>{ b.onclick = ()=>{ state.asrMethod = b.dataset.asr; saveState(); afterCalcChange(); renderCalcSettings(); }; });
  document.querySelectorAll('#detailBody [data-cm]').forEach(el=>{
    const go = ()=>{ state.calcMethod = el.dataset.cm; saveState(); afterCalcChange(); renderCalcSettings(); };
    el.onclick = go; el.onkeydown = e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); go(); } };
  });
  document.querySelectorAll('#detailBody [data-adj]').forEach(b=>{ b.onclick = ()=>{
    state.adjust = state.adjust || {}; const k = b.dataset.adj;
    state.adjust[k] = Math.max(-30, Math.min(30, prayerAdjust(k) + (+b.dataset.d))); saveState(); afterCalcChange(); renderCalcSettings();
  }; });
  const ar = document.getElementById('adjReset'); if(ar) ar.onclick = ()=>{ state.adjust = {}; saveState(); afterCalcChange(); renderCalcSettings(); };
  document.querySelectorAll('#detailBody [data-hoff]').forEach(b=>{ b.onclick = ()=>{ setHijriOffset(+b.dataset.hoff); afterCalcChange(); renderCalcSettings(); }; });
}
function iqamahState(){
  if(!state.iqamah) state.iqamah = { on:false, t:{}, after:{}, remind:10 };
  const q = state.iqamah; if(!q.t) q.t = {}; if(!q.after) q.after = {};
  return q;
}
/* Jamaat time for a prayer on a date: a fixed clock time, or minutes after the prayer starts */
function jamaatTime(prayerRow, date){
  const q = iqamahState(); if(!q.on || !prayerRow) return null;
  const k = prayerRow.key, fixed = q.t[k], after = parseInt(q.after[k]);
  if(fixed){ const [h,m] = fixed.split(':').map(Number); const d = new Date(date); d.setHours(h, m, 0, 0); return d; }
  if(after > 0) return new Date(prayerRow.start.getTime() + after*60000);
  return null;
}
function jamaatChip(p, date){
  if(!FIVE.includes(p.key)) return '';
  const j = jamaatTime(p, date);
  return j ? `<div class="jamaat-chip" title="${L({rur:'Jamaat', en:'Congregation'})}">🕌 ${fmtTimeCompact(j)}</div>` : '';
}
function renderIqamahSettings(){
  document.getElementById('detailTitle').textContent = L({rur:'Jamaat ka Waqt (Iqamah)', en:'Jamaat Times (Iqamah)'});
  const q = iqamahState();
  document.getElementById('detailBody').innerHTML = `
    <div class="ramzan-card" style="margin:0 0 14px;">
      <div class="roza-toggle"><span style="font-size:13.5px; font-weight:700;">${L({rur:'Apni masjid ki jamaat ka waqt dikhayein', en:'Show my masjid\u2019s jamaat times'})}</span><div class="switch ${q.on?'on':''}" id="iqOn"><div class="knob"></div></div></div>
      <div class="roza-toggle"><span style="font-size:13px; font-weight:600;">${L({rur:'Jamaat se pehle yaad-dahani', en:'Reminder before jamaat'})}</span>
        <select id="iqRemind" class="az-select" style="flex:0 0 auto; width:auto;">${[0,5,10,15,20,30].map(m=>`<option value="${m}" ${q.remind===m?'selected':''}>${m ? m+' min' : L({rur:'Off', en:'Off'})}</option>`).join('')}</select></div>
    </div>
    <div class="backup-note" style="margin-top:0;">${L({rur:'Har namaz ke liye ya to jamaat ka waqt likhein, ya yeh ke Azaan ke kitne minute baad jamaat hoti hai.', en:'For each prayer, enter either the jamaat time, or how many minutes after the Azaan it starts.'})}</div>
    ${FIVE.map(k=>`<div class="ramzan-card iq-row" style="margin:0 0 8px;">
      <b>${(PRAYER_META[k]||{}).icon||''} ${PRAYER_LABEL[k]}</b>
      <div class="iq-inputs">
        <label>${L({rur:'Waqt', en:'Time'})}<input type="time" data-iq-t="${k}" value="${q.t[k]||''}"></label>
        <span class="iq-or">${L({rur:'ya', en:'or'})}</span>
        <label>${L({rur:'Azaan ke baad', en:'After Azaan'})}<input type="number" min="0" max="120" placeholder="min" data-iq-a="${k}" value="${q.after[k]||''}"></label>
      </div>
    </div>`).join('')}`;
  document.getElementById('iqOn').onclick = async ()=>{
    q.on = !q.on; saveState();
    if(q.on && q.remind && 'Notification' in window && Notification.permission==='default'){ try{ await Notification.requestPermission(); }catch(e){} }
    renderHome(); scheduleNotifications(true); renderIqamahSettings();
  };
  document.getElementById('iqRemind').onchange = (e)=>{ q.remind = +e.target.value; saveState(); scheduleNotifications(true); };
  document.querySelectorAll('#detailBody [data-iq-t]').forEach(inp=>{ inp.onchange = ()=>{ q.t[inp.dataset.iqT] = inp.value; saveState(); renderHome(); scheduleNotifications(true); }; });
  document.querySelectorAll('#detailBody [data-iq-a]').forEach(inp=>{ inp.onchange = ()=>{ q.after[inp.dataset.iqA] = inp.value; saveState(); renderHome(); scheduleNotifications(true); }; });
}
function renderNafilSettings(){
  document.getElementById('detailTitle').textContent = L({rur:'Nafil Namaz', en:'Nafl Prayers'});
  document.getElementById('detailBody').innerHTML = `
    <div class="ramzan-card" style="margin:0 0 14px;">
      <div class="roza-toggle"><span style="font-size:13.5px; font-weight:700;">${L({rur:'Nafil namaz bhi mark karein', en:'Mark nafl prayers too'})}</span><div class="switch ${nafilOn()?'on':''}" id="nafilSw"><div class="knob"></div></div></div>
    </div>
    <div class="backup-note">${L({rur:'On karne par Maskan par Ishraq, Chaast, Awwabin, Tahajjud aur Du\'a Qubooliyat ke saath ✓ (padh li) aur ✗ (nahi padhi) ke buttons aa jayenge. Taareekh mein yeh Farz ke gol nishaan ke neeche chhote ▲ nishaan se dikhengi (hara: padh li, laal: nahi padhi). Namaz Mode aur Farz ke hisaab (Paabandi, Jaiza) par is ka asar nahi hota.', en:'When on, Ishraq, Chaast, Awwabin, Tahajjud and Du\'a Qubooliyat get ✓ (prayed) and ✗ (not prayed) buttons on Home. In the Calendar they show as small ▲ marks under the round Farz dots (green: prayed, red: not prayed). Namaz Mode and the Farz statistics (streaks, reviews) are not affected.'})}</div>`;
  document.getElementById('nafilSw').onclick = ()=>{
    state.nafilMark = !nafilOn(); saveState();
    renderHome(); renderCalendar(); renderNafilSettings();
    showToast(nafilOn() ? L({rur:'Nafil marking On', en:'Nafl marking on'}) : L({rur:'Nafil marking Off', en:'Nafl marking off'}));
  };
}
function renderAzaanSettings(){
  document.getElementById('detailTitle').textContent = L({rur:'Azaan Settings', en:'Azaan Settings'});
  const a = azaanState();
  const allOn = FIVE.every(k=>a.prayers[k]);
  const opts = (sel, k)=> azaanRecsFor(k).map(r=>`<option value="${r.id}" ${r.id===sel?'selected':''}>${r.ic} ${L({rur:r.rur, en:r.en})}${r.excerpt?' ('+L({rur:'hissa', en:'excerpt'})+')':''}</option>`).join('');
  document.getElementById('detailBody').innerHTML = `
    <div class="ramzan-card" style="margin:0 0 14px;">
      <div class="roza-toggle"><span style="font-size:13.5px; font-weight:700;">${L({rur:'Namaz ke waqt Azaan chalaayein', en:'Play Azaan at prayer times'})}</span><div class="switch ${a.on?'on':''}" id="azOnSw"><div class="knob"></div></div></div>
      <div class="roza-toggle"><span style="font-size:13px; font-weight:600;">${L({rur:'Sab namazon ke liye', en:'For all prayers'})}</span><div class="switch ${allOn?'on':''}" id="azAllSw"><div class="knob"></div></div></div>
      <div class="roza-toggle"><span style="font-size:13px; font-weight:600;">🔊 ${L({rur:'Awaaz', en:'Volume'})}</span><input type="range" id="azVol" min="10" max="100" step="5" value="${Math.round((a.vol ?? 1)*100)}" class="az-vol"></div>
      <button class="quran-tool" id="azFajrOnly" style="width:100%; margin-top:6px;">🌅 ${L({rur:'Sirf Fajr ki Azaan', en:'Fajr Azaan only'})}</button>
    </div>
    <div class="section-title" style="margin-top:0;">${L({rur:'Har namaz ki Azaan', en:'Azaan for each prayer'})}</div>
    ${FIVE.map(k=>`<div class="ramzan-card az-pray" style="margin:0 0 10px;">
      <div class="roza-toggle" style="padding:0 0 8px;"><span style="font-size:13.5px; font-weight:700;">${(PRAYER_META[k]||{}).icon||''} ${PRAYER_LABEL[k]}</span><div class="switch ${a.prayers[k]?'on':''}" data-az-pray="${k}"><div class="knob"></div></div></div>
      <div class="az-pick-row">
        <select class="az-select" data-az-pick="${k}">${opts(a.pick[k], k)}</select>
        <button class="az-play ${azaanPlayingId===a.pick[k]?'on':''}" data-id="${a.pick[k]}">${azaanPlayingId===a.pick[k]?'■':'▶'}</button>
      </div>
      ${k==='fajr' ? `<div class="az-warn">${L({rur:'Fajr ke liye sirf Fajr wali Azaan, jis mein "As-Salatu khairum minan-nawm" hai.', en:'Fajr uses only a Fajr Azaan, which includes "As-Salatu khairum minan-nawm".'})}</div>` : ''}
    </div>`).join('')}
    <div class="backup-note">${L({rur:'Azaan sirf tab chalti hai jab app khuli ho. App band ho ya phone lock ho to browser poori Azaan chalaane nahi deta; tab Yaad-dahani (notification) aati hai, agar Settings mein On ho.', en:'The Azaan plays only while the app is open. When the app is closed or the phone is locked, browsers do not allow a full Azaan; a reminder notification comes instead, if it is on in Settings.'})}</div>
  `;
  document.getElementById('azOnSw').onclick = ()=>{
    a.on = !a.on; saveState();
    if(a.on) showToast(L({rur:'Azaan On: namaz ke waqt app khuli ho to Azaan chalegi', en:'Azaan on: it plays at prayer time while the app is open'}));
    renderAzaanSettings();
  };
  document.getElementById('azVol').oninput = (e)=>{ a.vol = (+e.target.value)/100; saveState(); if(azaanAudio) azaanAudio.volume = a.vol; };
  document.getElementById('azFajrOnly').onclick = ()=>{ FIVE.forEach(k=> a.prayers[k] = (k==='fajr')); a.on = true; saveState(); renderAzaanSettings(); showToast(L({rur:'Ab sirf Fajr ki Azaan chalegi', en:'Only the Fajr Azaan will play now'})); };
  document.getElementById('azAllSw').onclick = ()=>{ const v = !allOn; FIVE.forEach(k=> a.prayers[k] = v); saveState(); renderAzaanSettings(); };
  document.querySelectorAll('#detailBody [data-az-pray]').forEach(sw=>{ sw.onclick = ()=>{ const k = sw.dataset.azPray; a.prayers[k] = !a.prayers[k]; saveState(); renderAzaanSettings(); }; });
  document.querySelectorAll('#detailBody [data-az-pick]').forEach(sel=>{ sel.onchange = ()=>{ a.pick[sel.dataset.azPick] = sel.value; saveState(); renderAzaanSettings(); }; });
  wireAzaanPlay();
}

