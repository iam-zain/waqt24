/* ============================================================
   INTERACTION PASS: a light tap haptic everywhere, a streak chip on Home, pinch-to-zoom on Quran and Tafseer pages,
   a reading-progress line in the Quran reader, and labels for screen readers.
   The vibration switch in Settings (state.haptics) silences all of it, because navigator.vibrate is wrapped in 08-polish.js.
   ============================================================ */
(function(){
  /* ---- 1. Tap haptic: a very short tick on tabs, chips, switches and buttons ---- */
  const TAP = '.tab-btn, .chip, .roza-mini, button, [role=button], .more-item, .aad-card, .quiz-opt, .hadees-item, .dua-card, .name-tile';
  const OWN = '.tasbeeh-tap, .dot-btn, .bulk-btn, .quran-page-wrap, .beads-track, input, textarea, select';  /* these already have their own feedback, or are not taps */
  let lastBuzz = 0;
  document.addEventListener('pointerdown', e=>{
    if(e.pointerType === 'mouse') return;
    const t = e.target.closest && e.target.closest(TAP);
    if(!t || t.closest(OWN) || t.disabled || t.classList.contains('disabled')) return;
    const n = performance.now(); if(n - lastBuzz < 60) return; lastBuzz = n;
    if(typeof buzz === 'function') buzz(7);
  }, { passive:true, capture:true });

  /* ---- 2. Streak chip under the city name: shown from two days in a row ---- */
  function syncStreak(){
    const c = document.querySelector('.dateCenter'); if(!c || typeof streakInfo !== 'function') return;
    let chip = document.getElementById('streakChip');
    let cur = 0; try{ cur = streakInfo().cur; }catch(e){}
    if(cur < 2){ if(chip) chip.remove(); return; }
    if(!chip){
      chip = document.createElement('button'); chip.id = 'streakChip'; chip.type = 'button'; chip.className = 'streak-chip';
      chip.onclick = e=>{ e.stopPropagation(); if(typeof openOverlay === 'function' && typeof renderStats === 'function') openOverlay(renderStats); };
      c.appendChild(chip);
    }
    const txt = L({ rur: cur + ' din ki lagataar', en: cur + '-day streak' });
    if(chip.dataset.v !== String(cur)){
      chip.dataset.v = String(cur); chip.innerHTML = `<span class="sc-f">🔥</span> ${txt}`;
      chip.classList.remove('pop'); void chip.offsetWidth; chip.classList.add('pop');
    }
    chip.setAttribute('aria-label', txt);
  }
  if(typeof renderHome === 'function'){ const rh = renderHome; renderHome = function(){ const r = rh.apply(this, arguments); try{ syncStreak(); }catch(e){} return r; }; }
  if(typeof markStatusChange === 'function'){ const ms = markStatusChange; markStatusChange = function(){ const r = ms.apply(this, arguments); setTimeout(()=>{ try{ syncStreak(); }catch(e){} }, 400); return r; }; }
  try{ syncStreak(); }catch(e){}
  setInterval(()=>{ try{ syncStreak(); }catch(e){} }, 60000);

  /* ---- 3. Pinch to zoom on Quran and Tafseer pages: spread to zoom in, pinch to zoom out ---- */
  (function(){
    let d0 = 0, wrap = null;
    const dist = t=> Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
    document.addEventListener('touchstart', e=>{
      if(e.touches.length !== 2){ d0 = 0; return; }
      wrap = e.target.closest && e.target.closest('.quran-page-wrap'); d0 = wrap ? dist(e.touches) : 0;
    }, { passive:true });
    document.addEventListener('touchend', e=>{
      if(!d0 || !wrap || e.touches.length >= 2) return;
      const ct = e.changedTouches; if(!ct || ct.length < 1) { d0 = 0; return; }
      /* ratio from the last move */
      const r = wrap._pinchR || 1; wrap._pinchR = 1; const w = wrap; d0 = 0; wrap = null;
      const zoomed = w.classList.contains('zoomed');
      const btn = document.getElementById(w.id === 'tfWrap' ? 'tfZoomBtn' : 'quranZoomBtn');
      if(btn && ((r > 1.25 && !zoomed) || (r < 0.8 && zoomed))) btn.click();
    }, { passive:true });
    document.addEventListener('touchmove', e=>{
      if(!d0 || !wrap || e.touches.length !== 2) return;
      wrap._pinchR = dist(e.touches) / d0;
    }, { passive:true });
  })();

  /* ---- 4. Reading-progress line under the Quran header ---- */
  const body = document.getElementById('detailBody'), ov = document.getElementById('detailOverlay');
  function syncProg(){
    if(!ov) return;
    const head = ov.querySelector('.detail-header'); if(!head) return;
    let bar = head.querySelector('.q-prog');
    const on = !!(body && body.querySelector('#quranWrap'));
    if(!on){ if(bar) bar.remove(); return; }
    if(!bar){ bar = document.createElement('div'); bar.className = 'q-prog'; bar.setAttribute('aria-hidden', 'true'); bar.innerHTML = '<i></i>'; head.appendChild(bar); }
    const pg = Math.max(1, Math.min(QURAN_PAGE_COUNT, state.quranPage || 1));
    bar.firstChild.style.width = (pg / QURAN_PAGE_COUNT * 100).toFixed(2) + '%';
  }
  if(body) new MutationObserver(()=>{ try{ syncProg(); }catch(e){} }).observe(body, { childList:true });

  /* ---- 5. Labels for screen readers on icon-only buttons ---- */
  const SYM = { '‹':'Peeche', '›':'Aage', '✕':'Band karein', '×':'Band karein', '✓':'Theek hai', '☆':'Bookmark', '★':'Bookmark hata dein', '↓':'Refresh', '↺':'Clear karein', 'ⓘ':'Jaankari', '+':'Zyada', '−':'Kam', '-':'Kam', '▶':'Chalayein', '⏸':'Roken', '⏹':'Band karein' };
  function labelPass(root){
    (root || document).querySelectorAll('button:not([aria-label]), [role=button]:not([aria-label])').forEach(b=>{
      const txt = (b.textContent || '').trim();
      let lbl = b.getAttribute('title') || '';
      if(!lbl && txt.length <= 2) lbl = SYM[txt] || '';
      if(!lbl && !txt && b.querySelector('svg')) lbl = b.id ? b.id.replace(/Btn$/, '').replace(/([A-Z])/g, ' $1').trim() : '';
      if(lbl) b.setAttribute('aria-label', lbl);
    });
    document.querySelectorAll('.tab-btn').forEach(t=> t.setAttribute('aria-current', t.classList.contains('active') ? 'page' : 'false'));
    const toast = document.getElementById('appToast'); if(toast && !toast.getAttribute('role')){ toast.setAttribute('role', 'status'); toast.setAttribute('aria-live', 'polite'); }
  }
  let lp = 0;
  new MutationObserver(()=>{ clearTimeout(lp); lp = setTimeout(()=>{ try{ labelPass(); }catch(e){} }, 250); }).observe(document.body, { childList:true, subtree:true });
  labelPass();
})();
