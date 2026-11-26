/* ============================================================
   NOTES: write anything. A note can be free, tied to a Qur'an page (popup in the reader) or to a saved item (Mere Pasandeeda).
   state.notes = [{ id, page?, sec?, ayah?, bm?, ref?, rt?, text (plain), html? (formatted, sanitised), c? (card tint), ts }]
   ============================================================ */
function notesList(){ if(!Array.isArray(state.notes)) state.notes = []; return state.notes; }
function notesForPage(p, sec){ return notesList().filter(n=>n.page === p && (n.sec || '') === (sec || '')); }
/* where a page note belongs: the Mushaf reader (no sec), the Tarjuma book ('tb') or Tafseer ('tf') */
function noteSecName(n){ const pg = n.page; const sa = n.ayah ? QURAN_SURAHS[qaSurahAyah(n.ayah).s - 1].name : ''; if(n.sec === 'tf'){ const s = typeof tfSurahOf === 'function' ? tfSurahOf(pg) : 0; return `📕 Tafseer · Page ${pg} · ${s ? QURAN_SURAHS[s - 1].name : 'Muqaddima'}`; } return `${n.sec === 'tb' ? '📘 Tarjuma' : '📖'} ${n.sec === 'tb' ? '· ' : ''}Page ${pg} · ${sa || quranSurahOf(pg).name}`; }
function notesForBm(k){ return notesList().filter(n=>n.bm === k); }
function noteEsc(t){ return String(t).replace(/[&<>"]/g, c=>({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c])); }
function noteWhen(ts){ const d = new Date(ts); return d.getDate() + ' ' + MON[d.getMonth()] + ' ' + d.getFullYear(); }
/* ---- Rich text: sanitised HTML only (bold, italic, underline, strike, lists, text colour, highlight) ---- */
const NOTE_COLORS = [['#d9534f','Laal'],['#e07b2a','Narangi'],['#2e9e5b','Sabz'],['#2f86c9','Neela'],['#8a5fd0','Binafsha'],['#6b7280','Raakh']];
const NOTE_HL = [['#fff0a6','Peela'],['#c9efd5','Sabz'],['#cfe6fa','Neela'],['#fad2e0','Gulabi']];
const NOTE_TINT = [['#fff3b0','Peela'],['#d3f0dc','Sabz'],['#d5e8fa','Neela'],['#fbd9e6','Gulabi'],['#e6dcfa','Binafsha']];
function noteClean(html){
  const doc = new DOMParser().parseFromString('<body>' + html + '</body>', 'text/html');
  const OK = { B:1, STRONG:1, I:1, EM:1, U:1, S:1, STRIKE:1, BR:1, DIV:1, P:1, UL:1, OL:1, LI:1, SPAN:1, FONT:1 }, col = /^(#[0-9a-f]{3,8}|rgba?\([\d\s,.%]+\))$/i;
  const walk = (src, dst)=>{
    src.childNodes.forEach(n=>{
      if(n.nodeType === 3){ dst.appendChild(document.createTextNode(n.nodeValue)); return; }
      if(n.nodeType !== 1) return;
      const t = n.tagName;
      if(!OK[t]){ walk(n, dst); return; }
      const tag = t === 'FONT' ? 'span' : t === 'STRIKE' ? 's' : t === 'STRONG' ? 'b' : t === 'EM' ? 'i' : t.toLowerCase(), e = document.createElement(tag), st = n.style || {};
      if(t === 'FONT' && n.getAttribute('color') && col.test(n.getAttribute('color'))) e.style.color = n.getAttribute('color');
      if(st.color && col.test(st.color)) e.style.color = st.color;
      if(st.backgroundColor && col.test(st.backgroundColor)) e.style.backgroundColor = st.backgroundColor;
      if(st.fontWeight === 'bold' || +st.fontWeight >= 600) e.style.fontWeight = '700';
      if(st.fontStyle === 'italic') e.style.fontStyle = 'italic';
      const td = (st.textDecorationLine || st.textDecoration || '');
      if(/underline/.test(td) || /line-through/.test(td)) e.style.textDecoration = (/underline/.test(td) ? 'underline ' : '') + (/line-through/.test(td) ? 'line-through' : '');
      walk(n, e); dst.appendChild(e);
    });
  };
  const out = document.createElement('div'); walk(doc.body, out); return out.innerHTML;
}
function noteHtmlToText(html){ const d = document.createElement('div'); d.innerHTML = String(html).replace(/<br\s*\/?>/gi, '\n').replace(/<\/(div|p|li)>/gi, '\n'); return (d.textContent || '').replace(/\n{3,}/g, '\n\n').trim(); }
function noteBody(n){ return n.html ? n.html : noteEsc(n.text).replace(/\n/g, '<br>'); }
/* ---- Note buttons for any card ---- */
function noteBtn(ref, title){ const c = notesList().filter(n=>n.ref === ref).length; return `<button type="button" class="nt-btn ${c ? 'has' : ''}" data-nref="${noteEsc(ref)}" data-ntitle="${noteEsc(title)}">📝 ${L({rur:'Note', en:'Note'})}${c ? ` <span class="nt-c">${c}</span>` : ''}</button>`; }
function noteBtnBm(k){ const c = notesForBm(k).length; return `<button type="button" class="nt-btn nt-ico ${c ? 'has' : ''}" data-nbm="${noteEsc(k)}" title="Note" aria-label="Note">📝${c ? `<span class="nt-c">${c}</span>` : ''}</button>`; }
function noteRefresh(){
  document.querySelectorAll('.nt-btn').forEach(b=>{
    const c = b.dataset.nbm ? notesForBm(b.dataset.nbm).length : notesList().filter(n=>n.ref === b.dataset.nref).length;
    b.classList.toggle('has', c > 0);
    b.innerHTML = (b.classList.contains('nt-ico') ? '📝' : '📝 ' + L({rur:'Note', en:'Note'})) + (c ? (b.classList.contains('nt-ico') ? `<span class="nt-c">${c}</span>` : ` <span class="nt-c">${c}</span>`) : '');
  });
}
document.addEventListener('click', e=>{
  const b = e.target.closest && e.target.closest('.nt-btn'); if(!b) return;
  e.stopPropagation(); e.preventDefault();
  const ctx = b.dataset.nbm ? { bm:b.dataset.nbm, title:((typeof bmResolve === 'function' && bmResolve(b.dataset.nbm)) || {}).title || '' } : { ref:b.dataset.nref, title:b.dataset.ntitle };
  openNoteBox(ctx, noteRefresh);
}, true);
/* Popup. ctx: { page } | { bm, title } | { ref, title } | {} (free note). Shows the notes already attached, plus a rich editor for a new one. */
function openNoteBox(ctx, onClose){
  ctx = ctx || {};
  const old = document.getElementById('noteBox'); if(old) old.remove();
  const matches = ()=> notesList().filter(n=> ctx.page ? (n.page === ctx.page && (n.sec || '') === (ctx.sec || '') && (!ctx.ayah || n.ayah === ctx.ayah)) : ctx.bm ? n.bm === ctx.bm : ctx.ref ? n.ref === ctx.ref : (!n.page && !n.bm && !n.ref));
  const title = ctx.page ? '📝 ' + noteSecName({ page:ctx.page, sec:ctx.sec, ayah:ctx.ayah }).replace(/^\S+\s/, '') + (ctx.ayah ? ` · ${L({rur:'Ayat', en:'Ayah'})} ${qaSurahAyah(ctx.ayah).s}:${qaSurahAyah(ctx.ayah).a}` : '') : (ctx.bm || ctx.ref) ? `📝 ${noteEsc(ctx.title || '')}` : `📝 ${L({rur:'Mere Notes', en:'My notes'})}`;
  const w = document.createElement('div'); w.id = 'noteBox'; w.className = 'note-ov';
  const close = ()=>{ w.remove(); if(onClose) onClose(); };
  let editId = null, tint = '';
  const draw = ()=>{
    const list = matches(), cur = editId ? notesList().find(x=>x.id === editId) : null;
    w.innerHTML = `<div class="note-sheet" role="dialog" aria-label="Note">
      <div class="note-head"><b>${title}</b><button type="button" class="note-x" aria-label="Band karein">✕</button></div>
      <div class="note-list">${list.length ? list.map(n=>`<div class="note-item" data-id="${n.id}" ${n.c ? `style="background:${n.c};color:#1d1d1d;border-color:transparent;"` : ''}><div class="note-text">${n.ayah ? `<span class="note-ay">📌 ${L({rur:'Ayat', en:'Ayah'})} ${qaSurahAyah(n.ayah).s}:${qaSurahAyah(n.ayah).a}</span> ` : ''}${noteBody(n)}</div><div class="note-meta"><span>${noteWhen(n.ts)}</span><span><button type="button" data-edit="${n.id}">✎ ${L({rur:'Badlein', en:'Edit'})}</button><button type="button" data-del="${n.id}">🗑</button></span></div></div>`).join('') : `<div class="note-empty">${L({rur:'Abhi koi note nahi. Neeche kuch bhi likhein.', en:'No notes yet. Write anything below.'})}</div>`}</div>
      <div class="ne-bar" id="neBar">
        <button type="button" data-c="bold" title="Bold"><b>B</b></button><button type="button" data-c="italic" title="Italic"><i>I</i></button><button type="button" data-c="underline" title="Underline"><u>U</u></button><button type="button" data-c="strikeThrough" title="Strike"><s>S</s></button><button type="button" data-c="insertUnorderedList" title="List">• ≡</button><button type="button" data-c="removeFormat" title="Saaf karein">⌫</button>
      </div>
      <div class="ne-row"><span class="ne-l">A</span>${NOTE_COLORS.map(([c, n])=>`<button type="button" class="ne-dot" data-fg="${c}" title="${n}" style="background:${c};"></button>`).join('')}<span class="ne-l ne-l2">🖍</span>${NOTE_HL.map(([c, n])=>`<button type="button" class="ne-dot" data-bg="${c}" title="${n}" style="background:${c};"></button>`).join('')}</div>
      <div id="noteEd" class="note-ed" contenteditable="true" role="textbox" aria-multiline="true" data-ph="${L({rur:'Yahan likhein…', en:'Write here…'})}"></div>
      <div class="ne-row"><span class="ne-l ne-card">${L({rur:'Card ka rang', en:'Card colour'})}</span><button type="button" class="ne-dot ne-none ${tint ? '' : 'on'}" data-tint="" title="Koi nahi">∅</button>${NOTE_TINT.map(([c, n])=>`<button type="button" class="ne-dot ${tint === c ? 'on' : ''}" data-tint="${c}" title="${n}" style="background:${c};"></button>`).join('')}</div>
      <div class="note-btns"><button type="button" class="note-save" id="noteSave">${editId ? L({rur:'Note update karein', en:'Update note'}) : L({rur:'Note save karein', en:'Save note'})}</button>${editId ? `<button type="button" id="noteCancel">${L({rur:'Rehne dein', en:'Cancel'})}</button>` : ''}</div>
    </div>`;
    const ed = w.querySelector('#noteEd'); if(cur){ ed.innerHTML = noteBody(cur); }
    w.querySelector('.note-x').onclick = close;
    ed.addEventListener('paste', e=>{ e.preventDefault(); const tx = (e.clipboardData || window.clipboardData).getData('text/plain'); document.execCommand('insertText', false, tx); }); /* paste as plain text only */
    const keep = e=> e.preventDefault();
    const fmt = (cmd, val)=>{ ed.focus(); try{ document.execCommand('styleWithCSS', false, true); }catch(_){} document.execCommand(cmd, false, val); };
    w.querySelectorAll('#neBar [data-c]').forEach(b=>{ b.onmousedown = keep; b.onclick = ()=> fmt(b.dataset.c); });
    w.querySelectorAll('[data-fg]').forEach(b=>{ b.onmousedown = keep; b.onclick = ()=> fmt('foreColor', b.dataset.fg); });
    w.querySelectorAll('[data-bg]').forEach(b=>{ b.onmousedown = keep; b.onclick = ()=> fmt('hiliteColor', b.dataset.bg); });
    w.querySelectorAll('[data-tint]').forEach(b=>{ b.onclick = ()=>{ tint = b.dataset.tint; w.querySelectorAll('[data-tint]').forEach(x=> x.classList.toggle('on', x === b)); ed.style.background = tint || ''; ed.style.color = tint ? '#1d1d1d' : ''; }; });
    if(cur && cur.c){ tint = cur.c; w.querySelectorAll('[data-tint]').forEach(x=> x.classList.toggle('on', x.dataset.tint === tint)); ed.style.background = tint; ed.style.color = '#1d1d1d'; }
    const cancel = w.querySelector('#noteCancel'); if(cancel) cancel.onclick = ()=>{ editId = null; tint = ''; draw(); };
    w.querySelector('#noteSave').onclick = ()=>{
      const html = noteClean(ed.innerHTML), t = noteHtmlToText(html); if(!t){ ed.focus(); return; }
      const plain = !/<(b|i|u|s|ul|ol|li)\b|style=/i.test(html);
      if(editId){ const n = notesList().find(x=>x.id === editId); if(n){ n.text = t; n.ts = Date.now(); if(plain) delete n.html; else n.html = html; if(tint) n.c = tint; else delete n.c; } editId = null; }
      else{ const n = { id:'n' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), text:t, ts:Date.now() }; if(!plain) n.html = html; if(tint) n.c = tint; if(ctx.page){ n.page = ctx.page; if(ctx.sec) n.sec = ctx.sec; if(ctx.ayah) n.ayah = ctx.ayah; } if(ctx.bm) n.bm = ctx.bm; if(ctx.ref){ n.ref = ctx.ref; n.rt = ctx.title || ''; } notesList().unshift(n); }
      tint = ''; saveState(); showToast(L({rur:'Note save ho gaya', en:'Note saved'})); draw();
    };
    w.querySelectorAll('[data-edit]').forEach(b=>{ b.onclick = ()=>{ editId = b.dataset.edit; draw(); w.querySelector('#noteEd').focus(); }; });
    w.querySelectorAll('[data-del]').forEach(b=>{ b.onclick = async ()=>{ if(!(await appConfirm(L({rur:'Yeh note hata dein?', en:'Delete this note?'})))) return; state.notes = notesList().filter(x=>x.id !== b.dataset.del); saveState(); draw(); }; });
  };
  w.onclick = e=>{ if(e.target === w) close(); };
  document.body.appendChild(w); draw();
}
/* "Mere Notes" block for the Mere Pasandeeda screen: every note, newest first; a page note opens that page */
function noteLabel(n){ return n.page ? noteSecName(n) : n.bm ? '⭐ ' + noteEsc((typeof bmResolve === 'function' && bmResolve(n.bm) || {}).title || '') : n.ref ? '📌 ' + noteEsc(n.rt || '') : L({rur:'Note', en:'Note'}); }
function notesSectionHtml(){
  const list = notesList();
  return `<div class="dw-section"><div class="dw-section-title"><span>📝 ${L({rur:'Mere Notes', en:'My notes'})}</span><span class="dw-count">${list.length}</span></div>
    <button type="button" class="note-add" id="noteAddBtn">＋ ${L({rur:'Naya note likhein', en:'Write a new note'})}</button>
    ${list.map(n=>`<div class="dw-row note-row" data-nid="${n.id}" ${n.page ? `data-page="${n.page}"` : ''} ${n.c ? `style="background:${n.c};color:#1d1d1d;"` : ''}><div class="info"><div class="tr">${noteLabel(n)}</div><div class="m note-prev">${noteBody(n)}</div></div><span class="note-when">${noteWhen(n.ts)}</span></div>`).join('')}</div>`;
}
function wireNotesSection(rerender){
  const add = document.getElementById('noteAddBtn'); if(add) add.onclick = ()=> openNoteBox({}, rerender);
  document.querySelectorAll('.note-row').forEach(r=>{
    r.onclick = ()=>{
      const n = notesList().find(x=>x.id === r.dataset.nid); if(!n) return;
      if(n.page){ if(n.sec === 'tb') renderTarjumaBook(n.page); else if(n.sec === 'tf') renderTafseerPage(n.page); else renderQuranReader(n.page); } else openNoteBox(n.bm ? { bm:n.bm, title:(bmResolve(n.bm) || {}).title } : n.ref ? { ref:n.ref, title:n.rt } : {}, rerender);
    };
  });
}
