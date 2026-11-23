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
