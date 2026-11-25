/* ===== Small "go to top" button: appears after scrolling down, in tabs and detail screens ===== */
(function(){
  const btn = document.createElement('button');
  btn.type = 'button'; btn.id = 'toTopBtn'; btn.className = 'to-top'; btn.setAttribute('aria-label', 'Upar jayein');
  btn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 6 4.5 11.5V18L12 12.5 19.5 18v-6.5z"/></svg>';
  (document.getElementById('app') || document.body).appendChild(btn); /* inside the app column, so on a laptop it sits at the app's right edge */
  const scroller = ()=>{
    const ov = document.getElementById('detailOverlay');
    if(ov && ov.classList.contains('active')) return document.getElementById('detailBody');
    return document.querySelector('.screen.active.scrollable');
  };
  let idle = 0;
  const update = ()=>{
    const s = scroller(), on = !!s && s.scrollTop > 320;
    btn.classList.toggle('show', on);
    clearTimeout(idle);
    if(on) idle = setTimeout(()=> btn.classList.remove('show'), 2000); /* hide after 2 s without scrolling or touching */
  };
  document.addEventListener('scroll', e=>{ const t = e.target; if(t && t.nodeType === 1 && (t.id === 'detailBody' || t.classList.contains('screen'))) update(); }, true);
  document.addEventListener('click', e=>{ if(e.target.closest && e.target.closest('#toTopBtn')) return; setTimeout(update, 120); }, true);
  btn.onclick = e=>{ e.stopPropagation(); const s = scroller(); if(s) s.scrollTo({ top:0, behavior:'smooth' }); };
})();
