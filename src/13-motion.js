/* ============================================================
   MOTION PASS 3: liquid prayer ring, rolling countdown digits,
   screens that step back behind an overlay, and detail screens that grow out of the card you tapped.
   All of it is skipped under "Kam animation" (body.calm) and the phone's reduce-motion setting.
   ============================================================ */
(function(){
  const reduced = ()=> document.body.classList.contains('calm') || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const hero = document.getElementById('homeHero');

  /* ---- 1. Liquid wave inside the prayer ring: its level follows the ring's progress ---- */
  const WAVE = '<path d="M0 5 Q15 0 30 5 T60 5 T90 5 T120 5 V12 H0z"/>';
  function syncWave(){
    if(!hero) return;
    const ring = hero.querySelector('.hero-ring'); if(!ring) return;
    let w = ring.querySelector('.hero-wave');
    if(!w){
      w = document.createElement('div'); w.className = 'hero-wave'; w.setAttribute('aria-hidden', 'true');
      w.innerHTML = `<div class="hw-fill"><svg class="hw-w hw-w2" viewBox="0 0 120 12" preserveAspectRatio="none">${WAVE}</svg><svg class="hw-w hw-w1" viewBox="0 0 120 12" preserveAspectRatio="none">${WAVE}</svg></div>`;
      const ic = ring.querySelector('.hero-ic'); ring.insertBefore(w, ic || null);
    }
    const bar = ring.querySelector('.bar'); if(!bar) return;
    const off = parseFloat(bar.getAttribute('stroke-dashoffset')), C = 138.23;
    if(isNaN(off)) return;
    const lvl = Math.max(0.06, Math.min(0.94, 1 - off / C));   /* never fully empty or full, so the surface always shows */
    ring.style.setProperty('--wv', lvl.toFixed(3));
  }
  if(hero){
    new MutationObserver(syncWave).observe(hero, { childList:true, subtree:true, attributes:true, attributeFilter:['stroke-dashoffset'] });
    syncWave();
  }
  /* Waves rest while the app is in the background */
  document.addEventListener('visibilitychange', ()=> document.body.classList.toggle('bg-paused', document.hidden));

  /* ---- 2. Countdown digits roll: only the characters that changed move ---- */
  function rollCountdown(b){
    if(!b) return;
    const t = b.textContent;
    if(b.children.length && b.dataset.v === t) return;          /* our own wrapping, nothing to do */
    const prev = b.dataset.v || '';
    b.dataset.v = t;
    if(reduced() || !prev){ if(b.children.length) b.textContent = t; return; }
    b.innerHTML = '';
    [...t].forEach((ch, i)=>{
      const s = document.createElement('span'); s.className = 'dg'; s.textContent = ch;
      if(prev.length === t.length && prev[i] !== ch) s.classList.add('roll');
      else if(prev.length !== t.length) s.classList.add('roll');
      b.appendChild(s);
    });
  }
  if(hero){
    new MutationObserver(ms=>{
      const seen = new Set();
      ms.forEach(m=>{ const b = (m.target.nodeType === 1 ? m.target : m.target.parentElement); const el = b && b.closest ? b.closest('.hero-cd b') : null; if(el && !seen.has(el)){ seen.add(el); rollCountdown(el); } });
    }).observe(hero, { childList:true, subtree:true, characterData:true });
  }

  /* ---- 3. Overlay: the screens behind step back, and the overlay grows out of the tapped card ---- */
  const ov = document.getElementById('detailOverlay'); if(!ov) return;
  let tapped = null;
  const CARD = '.aad-card, .more-item, .qbook, .dua-card, .hadees-item, .name-tile, .shabd-row, .quran-choice, .quiz-cat, .tl-card';
  document.addEventListener('pointerdown', e=>{
    const t = e.target.closest && e.target.closest(CARD);
    tapped = t ? { r:t.getBoundingClientRect(), t:performance.now() } : null;
  }, true);
  document.addEventListener('pointercancel', ()=>{ tapped = null; }, true);
  /* header shadow appears once the content scrolls under it */
  const db = document.getElementById('detailBody');
  if(db) db.addEventListener('scroll', ()=>{ ov.classList.toggle('scrolled', db.scrollTop > 4); }, { passive:true });
  let wasOpen = false;
  new MutationObserver(()=>{
    const open = ov.classList.contains('active') && !ov.classList.contains('closing');
    document.body.classList.toggle('ov-open', open);
    if(open && !wasOpen) ov.classList.remove('scrolled');
    if(open && !wasOpen && tapped && performance.now() - tapped.t < 800 && !reduced() && ov.animate){
      const o = ov.getBoundingClientRect(), r = tapped.r;
      if(o.width > 0 && r.width > 0 && r.height > 0){
        const from = `inset(${Math.max(0, r.top - o.top)}px ${Math.max(0, o.right - r.right)}px ${Math.max(0, o.bottom - r.bottom)}px ${Math.max(0, r.left - o.left)}px round 16px)`;
        ov.classList.add('ov-expand');
        const a = ov.animate([{ clipPath:from, opacity:.4 }, { clipPath:'inset(0px 0px 0px 0px round 0px)', opacity:1 }], { duration:360, easing:'cubic-bezier(.2,.8,.2,1)' });
        const done = ()=> ov.classList.remove('ov-expand');
        a.onfinish = done; a.oncancel = done;
      }
    }
    if(open && !wasOpen) tapped = null;
    wasOpen = open;
  }).observe(ov, { attributes:true, attributeFilter:['class'] });
})();
