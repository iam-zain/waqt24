/* ============================================================
   BOOKMARK FOLDERS: group Pasandeeda items into folders (state.bmFolders = [{id,name,ic}], state.bmMap = { bookmarkKey: folderId }).
   An item sits in at most one folder; no folder = "Bina folder". Removing a bookmark also clears its folder.
   ============================================================ */
const BMF_ICONS = ['📁','⭐','🌟','🕌','📖','🤲','💚','🎓','🌿','🕋'];
let bmfSel = 'all';          /* 'all' | 'none' | folder id */
function bmfList(){ if(!Array.isArray(state.bmFolders)) state.bmFolders = []; return state.bmFolders; }
function bmfMap(){ if(!state.bmMap || typeof state.bmMap !== 'object' || Array.isArray(state.bmMap)) state.bmMap = {}; return state.bmMap; }
function bmfOf(k){ const id = bmfMap()[k]; return bmfList().find(f=>f.id === id) || null; }
function bmfCount(id, items){ return items.filter(x=> id === 'none' ? !bmfOf(x.k) : (bmfMap()[x.k] === id)).length; }
const bmfEsc = t=> String(t).replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function bmfFilter(items){
  if(bmfSel === 'all' || (bmfSel !== 'none' && !bmfList().some(f=>f.id === bmfSel))){ bmfSel = 'all'; return items; }
  return items.filter(x=> bmfSel === 'none' ? !bmfOf(x.k) : bmfMap()[x.k] === bmfSel);
}
function bmfBarHtml(items){
  const fl = bmfList(); if(!fl.length && !items.length) return '';
  const chip = (id, ic, n, c)=> `<button type="button" class="bmf-chip ${bmfSel === id ? 'on' : ''}" data-f="${id}">${ic} ${n}<i>${c}</i></button>`;
  let h = `<div class="bmf-bar">${chip('all', '🔖', L({rur:'Sab', en:'All'}), items.length)}`;
  fl.forEach(f=>{ h += chip(f.id, f.ic, bmfEsc(f.name), bmfCount(f.id, items)); });
  if(fl.length && bmfCount('none', items)) h += chip('none', '📄', L({rur:'Bina folder', en:'No folder'}), bmfCount('none', items));
  h += `<button type="button" class="bmf-chip bmf-new" id="bmfNew">＋ ${L({rur:'Naya folder', en:'New folder'})}</button></div>`;
  const cur = fl.find(f=>f.id === bmfSel);
  if(cur) h += `<div class="bmf-manage"><span>${cur.ic} ${bmfEsc(cur.name)}</span><button type="button" id="bmfRen">✏️ ${L({rur:'Naam badlein', en:'Rename'})}</button><button type="button" id="bmfDel">🗑️ ${L({rur:'Hatayein', en:'Delete'})}</button></div>`;
  return h;
}
/* a small sheet: ask for a folder name (and an icon), optionally pre-filled for renaming */
function bmfAsk(title, cur, done){
  const w = document.createElement('div'); w.className = 'app-confirm';
  let ic = cur ? cur.ic : BMF_ICONS[0];
  w.innerHTML = `<div class="info-card"><div class="info-text"><b>${title}</b></div>
    <input class="bmf-in" maxlength="24" placeholder="${L({rur:'Folder ka naam', en:'Folder name'})}" value="${cur ? bmfEsc(cur.name) : ''}">
    <div class="bmf-ics">${BMF_ICONS.map(i=>`<button type="button" class="${i === ic ? 'on' : ''}" data-i="${i}">${i}</button>`).join('')}</div>
    <div class="ac-btns"><button class="ac-no">${L({rur:'Rehne dein', en:'Cancel'})}</button><button class="ac-yes">${L({rur:'Save karein', en:'Save'})}</button></div></div>`;
  document.body.appendChild(w);
  const inp = w.querySelector('.bmf-in'); setTimeout(()=> inp.focus(), 50);
  w.querySelectorAll('.bmf-ics button').forEach(b=> b.onclick = ()=>{ ic = b.dataset.i; w.querySelectorAll('.bmf-ics button').forEach(x=> x.classList.toggle('on', x === b)); });
  const close = ()=> w.remove();
  w.querySelector('.ac-no').onclick = close; w.onclick = e=>{ if(e.target === w) close(); };
  const ok = ()=>{ const n = inp.value.trim(); if(!n){ inp.focus(); return; } close(); done(n, ic); };
  w.querySelector('.ac-yes').onclick = ok; inp.onkeydown = e=>{ if(e.key === 'Enter') ok(); };
}
function bmfCreate(after){
  bmfAsk(L({rur:'Naya folder', en:'New folder'}), null, (n, ic)=>{
    const f = { id:'f' + Date.now().toString(36), name:n, ic }; bmfList().push(f); saveState(); bmfSel = f.id;
    if(after) after(f); else renderBookmarks();
  });
}
/* choose a folder for one bookmark */
function bmfPick(k, redraw){
  const w = document.createElement('div'); w.className = 'app-confirm';
  const cur = bmfMap()[k] || '';
  w.innerHTML = `<div class="info-card"><div class="info-text"><b>📁 ${L({rur:'Kis folder mein rakhein?', en:'Move to folder'})}</b></div>
    <div class="bmf-pick">${bmfList().map(f=>`<button type="button" class="${cur === f.id ? 'on' : ''}" data-f="${f.id}">${f.ic} ${bmfEsc(f.name)}</button>`).join('')}
    <button type="button" class="${cur ? '' : 'on'}" data-f="">📄 ${L({rur:'Bina folder', en:'No folder'})}</button>
    <button type="button" class="bmf-add" data-f="+">＋ ${L({rur:'Naya folder banayein', en:'New folder'})}</button></div></div>`;
  document.body.appendChild(w);
  const close = ()=> w.remove(); w.onclick = e=>{ if(e.target === w) close(); };
  w.querySelectorAll('[data-f]').forEach(b=> b.onclick = ()=>{
    const v = b.dataset.f; close();
    if(v === '+'){ bmfCreate(f=>{ bmfMap()[k] = f.id; saveState(); showToast(L({rur:'Folder mein rakh diya', en:'Moved'})); redraw(); }); return; }
    if(v) bmfMap()[k] = v; else delete bmfMap()[k];
    saveState(); showToast(v ? L({rur:'Folder mein rakh diya', en:'Moved'}) : L({rur:'Folder se nikal diya', en:'Removed from folder'})); redraw();
  });
}
function bmfWire(body, redraw){
  body.querySelectorAll('.bmf-chip[data-f]').forEach(b=> b.onclick = ()=>{ bmfSel = (bmfSel === b.dataset.f && b.dataset.f !== 'all') ? 'all' : b.dataset.f; redraw(); });
  const nw = document.getElementById('bmfNew'); if(nw) nw.onclick = ()=> bmfCreate();
  const rn = document.getElementById('bmfRen'); if(rn) rn.onclick = ()=>{ const f = bmfList().find(x=>x.id === bmfSel); if(f) bmfAsk(L({rur:'Folder ka naam badlein', en:'Rename folder'}), f, (n, ic)=>{ f.name = n; f.ic = ic; saveState(); redraw(); }); };
  const dl = document.getElementById('bmfDel'); if(dl) dl.onclick = async ()=>{
    const f = bmfList().find(x=>x.id === bmfSel); if(!f) return;
    if(!(await appConfirm(L({rur:`"${bmfEsc(f.name)}" folder hata dein? Andar ke pasandeeda delete nahi honge, bas "Bina folder" mein aa jayenge.`, en:`Delete folder "${bmfEsc(f.name)}"? Items stay in Bookmarks as "No folder".`}), L({rur:'Haan, hatayein', en:'Delete'})))) return;
    const m = bmfMap(); Object.keys(m).forEach(k=>{ if(m[k] === f.id) delete m[k]; });
    state.bmFolders = bmfList().filter(x=>x.id !== f.id); bmfSel = 'all'; saveState(); redraw();
  };
  body.querySelectorAll('[data-fp]').forEach(b=> b.onclick = e=>{ e.stopPropagation(); bmfPick(b.dataset.fp, redraw); });
}
