/* ===== Search: when nothing matches, show names starting with the same letter(s) ===== */
function sgNames(q, names, max){
  const s = String(q || '').trim().toLowerCase().replace(/[^a-z0-9ऀ-ॿ؀-ۿ]/gi, '');
  if(!s) return [];
  const clean = [...new Set((names || []).map(n=> String(n || '').replace(/\s+/g, ' ').trim()).filter(Boolean))];
  for(let l = Math.min(s.length, 6); l >= 1; l--){
    const p = s.slice(0, l), m = clean.filter(n=> n.toLowerCase().replace(/^[^a-z0-9ऀ-ॿ؀-ۿ]+/i, '').startsWith(p));
    if(m.length) return m.sort((a, b)=> a.localeCompare(b)).slice(0, max || 8);
  }
  return [];
}
function sgEmpty(q, names, inputId, msg, extra){
  const m = sgNames(q, names), first = String(q || '').trim().charAt(0).toUpperCase();
  const esc = t=> String(t).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  return `<div class="empty-state" ${extra || ''}>${msg}${m.length ? `<div class="sg-lbl">"${esc(first)}" se shuru hone wale naam:</div><div class="sg-chips">${m.map(n=>`<button type="button" class="sg-chip" data-in="${inputId}" data-v="${esc(n)}">${esc(n)}</button>`).join('')}</div>` : ''}</div>`;
}
document.addEventListener('click', e=>{
  const b = e.target.closest && e.target.closest('.sg-chip'); if(!b) return;
  const inp = document.getElementById(b.dataset.in); if(!inp) return;
  e.preventDefault(); e.stopPropagation();
  inp.value = b.dataset.v; inp.dispatchEvent(new Event('input', { bubbles:true })); inp.dispatchEvent(new Event('change', { bubbles:true })); try{ inp.focus(); }catch(_){}
}, true);

/* City search: names starting with the text first, then the rest of the name or the state, then close spellings */
function cityMatch(raw, max){
  const q = gsNorm(String(raw || '').trim()); if(!q) return { list:[], fuzzy:false };
  const sc = c=>{ const n = gsNorm(c.name), s = gsNorm(c.state || ''); return n.startsWith(q) ? 0 : n.includes(q) ? 1 : s.startsWith(q) ? 2 : (n + s).includes(q) ? 3 : 9; };
  let list = CITIES.map(c=>[sc(c), c]).filter(x=>x[0] < 9).sort((a, b)=> a[0] - b[0] || a[1].name.localeCompare(b[1].name)).map(x=>x[1]);
  if(list.length || q.length < 3) return { list:list.slice(0, max || 40), fuzzy:false };
  const ed = (a, b)=>{ const d = Array.from({length:a.length + 1}, (_, i)=>[i]); for(let j = 1; j <= b.length; j++) d[0][j] = j; for(let i = 1; i <= a.length; i++) for(let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i-1][j] + 1, d[i][j-1] + 1, d[i-1][j-1] + (a[i-1] === b[j-1] ? 0 : 1)); return d[a.length][b.length]; };
  list = CITIES.map(c=>[ed(q, gsNorm(c.name).slice(0, q.length + 1)), c]).filter(x=>x[0] <= (q.length > 5 ? 2 : 1)).sort((a, b)=> a[0] - b[0]).map(x=>x[1]);
  return { list:list.slice(0, 8), fuzzy:true };
}
function cityFuzzyNote(){ return '<div class="sg-lbl" style="margin:4px 0 8px;">Kya aap yeh dhoondh rahe the?</div>'; }
