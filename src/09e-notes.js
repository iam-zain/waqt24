/* ============================================================
   NOTES: write anything. A note can be free, tied to a Qur'an page (popup in the reader) or to a saved item (Mere Pasandeeda).
   state.notes = [{ id, page?, bm?, text, ts }]
   ============================================================ */
function notesList(){ if(!Array.isArray(state.notes)) state.notes = []; return state.notes; }
function notesForPage(p, sec){ return notesList().filter(n=>n.page === p && (n.sec || '') === (sec || '')); }
/* where a page note belongs: the Mushaf reader (no sec), the Tarjuma book ('tb') or Tafseer ('tf') */
function noteSecName(n){ const pg = n.page; const sa = n.ayah ? QURAN_SURAHS[qaSurahAyah(n.ayah).s - 1].name : ''; if(n.sec === 'tf'){ const s = typeof tfSurahOf === 'function' ? tfSurahOf(pg) : 0; return `📕 Tafseer · Page ${pg} · ${s ? QURAN_SURAHS[s - 1].name : 'Muqaddima'}`; } return `${n.sec === 'tb' ? '📘 Tarjuma' : '📖'} ${n.sec === 'tb' ? '· ' : ''}Page ${pg} · ${sa || quranSurahOf(pg).name}`; }
function notesForBm(k){ return notesList().filter(n=>n.bm === k); }
function noteEsc(t){ return String(t).replace(/[&<>"]/g, c=>({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c])); }
function noteWhen(ts){ const d = new Date(ts); return d.getDate() + ' ' + MON[d.getMonth()] + ' ' + d.getFullYear(); }
/* Popup. ctx: { page } | { bm, title } | {} (free note). Shows the notes already attached, plus a box to write a new one. */
function openNoteBox(ctx, onClose){
  ctx = ctx || {};
  const old = document.getElementById('noteBox'); if(old) old.remove();
  const matches = ()=> notesList().filter(n=> ctx.page ? (n.page === ctx.page && (n.sec || '') === (ctx.sec || '') && (!ctx.ayah || n.ayah === ctx.ayah)) : ctx.bm ? n.bm === ctx.bm : (!n.page && !n.bm));
  const title = ctx.page ? '📝 ' + noteSecName({ page:ctx.page, sec:ctx.sec, ayah:ctx.ayah }).replace(/^\S+\s/, '') + (ctx.ayah ? ` · ${L({rur:'Ayat', en:'Ayah'})} ${qaSurahAyah(ctx.ayah).s}:${qaSurahAyah(ctx.ayah).a}` : '') : ctx.bm ? `📝 ${noteEsc(ctx.title || '')}` : `📝 ${L({rur:'Mere Notes', en:'My notes'})}`;
  const w = document.createElement('div'); w.id = 'noteBox'; w.className = 'note-ov';
  const close = ()=>{ w.remove(); if(onClose) onClose(); };
  let editId = null;
  const draw = ()=>{
    const list = matches();
    w.innerHTML = `<div class="note-sheet" role="dialog" aria-label="Note">
      <div class="note-head"><b>${title}</b><button type="button" class="note-x" aria-label="Band karein">✕</button></div>
      <div class="note-list">${list.length ? list.map(n=>`<div class="note-item" data-id="${n.id}"><div class="note-text">${n.ayah ? `<span class="note-ay">📌 ${L({rur:'Ayat', en:'Ayah'})} ${qaSurahAyah(n.ayah).s}:${qaSurahAyah(n.ayah).a}</span> ` : ''}${noteEsc(n.text).replace(/\n/g, '<br>')}</div><div class="note-meta"><span>${noteWhen(n.ts)}</span><span><button type="button" data-edit="${n.id}">✎ ${L({rur:'Badlein', en:'Edit'})}</button><button type="button" data-del="${n.id}">🗑</button></span></div></div>`).join('') : `<div class="note-empty">${L({rur:'Abhi koi note nahi. Neeche kuch bhi likhein.', en:'No notes yet. Write anything below.'})}</div>`}</div>
      <textarea id="noteTa" rows="4" placeholder="${L({rur:'Yahan likhein…', en:'Write here…'})}"></textarea>
      <div class="note-btns"><button type="button" class="note-save" id="noteSave">${editId ? L({rur:'Note update karein', en:'Update note'}) : L({rur:'Note save karein', en:'Save note'})}</button>${editId ? `<button type="button" id="noteCancel">${L({rur:'Rehne dein', en:'Cancel'})}</button>` : ''}</div>
    </div>`;
    const ta = w.querySelector('#noteTa'); if(editId){ const n = notesList().find(x=>x.id === editId); if(n) ta.value = n.text; }
    w.querySelector('.note-x').onclick = close;
    const cancel = w.querySelector('#noteCancel'); if(cancel) cancel.onclick = ()=>{ editId = null; draw(); };
    w.querySelector('#noteSave').onclick = ()=>{
      const t = ta.value.trim(); if(!t){ ta.focus(); return; }
      if(editId){ const n = notesList().find(x=>x.id === editId); if(n){ n.text = t; n.ts = Date.now(); } editId = null; }
      else{ const n = { id:'n' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), text:t, ts:Date.now() }; if(ctx.page){ n.page = ctx.page; if(ctx.sec) n.sec = ctx.sec; if(ctx.ayah) n.ayah = ctx.ayah; } if(ctx.bm) n.bm = ctx.bm; notesList().unshift(n); }
      saveState(); showToast(L({rur:'Note save ho gaya', en:'Note saved'})); draw();
    };
    w.querySelectorAll('[data-edit]').forEach(b=>{ b.onclick = ()=>{ editId = b.dataset.edit; draw(); w.querySelector('#noteTa').focus(); }; });
    w.querySelectorAll('[data-del]').forEach(b=>{ b.onclick = async ()=>{ if(!(await appConfirm(L({rur:'Yeh note hata dein?', en:'Delete this note?'})))) return; state.notes = notesList().filter(x=>x.id !== b.dataset.del); saveState(); draw(); }; });
  };
  w.onclick = e=>{ if(e.target === w) close(); };
  document.body.appendChild(w); draw();
}
/* "Mere Notes" block for the Mere Pasandeeda screen: every note, newest first; a page note opens that page */
function notesSectionHtml(){
  const list = notesList();
  return `<div class="dw-section"><div class="dw-section-title"><span>📝 ${L({rur:'Mere Notes', en:'My notes'})}</span><span class="dw-count">${list.length}</span></div>
    <button type="button" class="note-add" id="noteAddBtn">＋ ${L({rur:'Naya note likhein', en:'Write a new note'})}</button>
    ${list.map(n=>`<div class="dw-row note-row" data-nid="${n.id}" ${n.page ? `data-page="${n.page}"` : ''}><div class="info"><div class="tr">${n.page ? noteSecName(n) : n.bm ? '⭐ ' + noteEsc((typeof bmResolve === 'function' && bmResolve(n.bm) || {}).title || '') : L({rur:'Note', en:'Note'})}</div><div class="m">${noteEsc(n.text).slice(0, 140)}${n.text.length > 140 ? '…' : ''}</div></div><span class="note-when">${noteWhen(n.ts)}</span></div>`).join('')}</div>`;
}
function wireNotesSection(rerender){
  const add = document.getElementById('noteAddBtn'); if(add) add.onclick = ()=> openNoteBox({}, rerender);
  document.querySelectorAll('.note-row').forEach(r=>{
    r.onclick = ()=>{
      const n = notesList().find(x=>x.id === r.dataset.nid); if(!n) return;
      if(n.page){ if(n.sec === 'tb') renderTarjumaBook(n.page); else if(n.sec === 'tf') renderTafseerPage(n.page); else renderQuranReader(n.page); } else openNoteBox(n.bm ? { bm:n.bm, title:(bmResolve(n.bm) || {}).title } : {}, rerender);
    };
  });
}
