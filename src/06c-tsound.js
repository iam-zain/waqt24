/* ============================================================
   TASBEEH SOUNDS: bead sounds made with the Web Audio API (no audio files).
   "Moti Tik" follows the character of a bright bead tick: a tiny click plus two quick partials about an octave apart.
   Each tap gets a slight random pitch so a long count does not sound mechanical.
   Settings (state.tasbeeh): sound (on/off), soundId, vol (0 to 1), chime (round-complete bell), markTik (a lower tick on every 11th bead).
   ============================================================ */
const TS_SOUNDS = [
  { id:'tik',   n:{ rur:'Moti Tik', en:'Bead Tik' } },
  { id:'wood',  n:{ rur:'Lakdi', en:'Wood' } },
  { id:'glass', n:{ rur:'Sheesha', en:'Glass' } },
  { id:'bell',  n:{ rur:'Ghanti', en:'Bell' } },
  { id:'drop',  n:{ rur:'Paani', en:'Water' } },
  { id:'soft',  n:{ rur:'Naram', en:'Soft' } },
  { id:'click', n:{ rur:'Click', en:'Click' } },
  { id:'beep',  n:{ rur:'Beep', en:'Beep' } },
];
let tasbeehAudioCtx = null, tsMaster = null, tsNoise = null;

function tsCtx(){
  if(!tasbeehAudioCtx){
    const AC = window.AudioContext || window.webkitAudioContext; if(!AC) return null;
    tasbeehAudioCtx = new AC();
    tsMaster = tasbeehAudioCtx.createGain();
    const comp = tasbeehAudioCtx.createDynamicsCompressor();   /* keeps quick repeated taps from clipping */
    comp.threshold.value = -14; comp.ratio.value = 6; comp.attack.value = 0.002; comp.release.value = 0.08;
    tsMaster.connect(comp); comp.connect(tasbeehAudioCtx.destination);
    const len = Math.floor(tasbeehAudioCtx.sampleRate * 0.1), buf = tasbeehAudioCtx.createBuffer(1, len, tasbeehAudioCtx.sampleRate), d = buf.getChannelData(0);
    for(let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    tsNoise = buf;
  }
  if(tasbeehAudioCtx.state === 'suspended') tasbeehAudioCtx.resume();
  return tasbeehAudioCtx;
}
function tsVol(){ const v = state.tasbeeh.vol; return Math.max(0.05, Math.min(1, v == null ? 0.8 : v)); }

/* a decaying tone: tau is the time constant in seconds; f2 makes it glide to another pitch */
function tsTone(ctx, t0, f, amp, tau, o){
  o = o || {};
  const osc = ctx.createOscillator(), g = ctx.createGain(), att = o.att || 0.0012;
  osc.type = o.type || 'sine';
  osc.frequency.setValueAtTime(f, t0);
  if(o.f2) osc.frequency.exponentialRampToValueAtTime(o.f2, t0 + (o.glide || 0.05));
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.linearRampToValueAtTime(amp, t0 + att);
  g.gain.setTargetAtTime(0.0001, t0 + att, tau);
  osc.connect(g); g.connect(tsMaster);
  osc.start(t0); osc.stop(t0 + att + tau * 7);
}
/* a short filtered noise burst: the "click" of the bead touching the next one */
function tsNoiseBurst(ctx, t0, dur, fc, q, amp){
  const src = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), g = ctx.createGain();
  src.buffer = tsNoise; bp.type = 'bandpass'; bp.frequency.value = fc; bp.Q.value = q;
  g.gain.setValueAtTime(amp, t0); g.gain.setTargetAtTime(0.0001, t0, dur / 3);
  src.connect(bp); bp.connect(g); g.connect(tsMaster);
  src.start(t0); src.stop(t0 + dur * 2.5);
}

/* One recipe per sound. r is the small random pitch factor; k is 'tap', 'mark' (every 11th bead) or 'done'. */
const TS_RECIPES = {
  tik(ctx, t, r, k){
    const p = k === 'mark' ? 0.78 : 1;
    tsNoiseBurst(ctx, t, 0.012, 3800, 0.9, 0.32);
    tsTone(ctx, t, 1178 * r * p, 0.55, 0.011);
    tsTone(ctx, t, 2348 * r * p, 0.30, 0.008);
    if(k === 'mark') tsTone(ctx, t, 590 * r, 0.35, 0.02);
  },
  wood(ctx, t, r, k){
    const p = k === 'mark' ? 0.8 : 1;
    tsNoiseBurst(ctx, t, 0.02, 1800, 1.2, 0.34);
    tsTone(ctx, t, 560 * r * p, 0.6, 0.02, { f2:400 * r * p, glide:0.04 });
    tsTone(ctx, t, 1120 * r * p, 0.22, 0.012);
  },
  glass(ctx, t, r, k){
    const p = k === 'mark' ? 0.8 : 1;
    tsNoiseBurst(ctx, t, 0.006, 5000, 1.5, 0.12);
    tsTone(ctx, t, 1568 * r * p, 0.34, 0.07);
    tsTone(ctx, t, 2349 * r * p, 0.16, 0.05);
    tsTone(ctx, t, 4150 * r * p, 0.1, 0.03);
  },
  bell(ctx, t, r, k){
    const p = k === 'mark' ? 0.75 : 1, f = 880 * r * p;
    tsTone(ctx, t, f, 0.34, 0.22, { att:0.002 });
    tsTone(ctx, t, f * 2.76, 0.16, 0.13, { att:0.002 });
    tsTone(ctx, t, f * 5.4, 0.07, 0.07, { att:0.002 });
  },
  drop(ctx, t, r, k){
    const p = k === 'mark' ? 0.75 : 1;
    tsTone(ctx, t, 700 * r * p, 0.5, 0.05, { f2:1500 * r * p, glide:0.045, att:0.002 });
    tsTone(ctx, t + 0.05, 1100 * r * p, 0.14, 0.06, { att:0.004 });
  },
  soft(ctx, t, r, k){
    const p = k === 'mark' ? 0.8 : 1;
    tsTone(ctx, t, 300 * r * p, 0.62, 0.035, { att:0.006 });
    tsNoiseBurst(ctx, t, 0.03, 600, 0.8, 0.16);
    tsTone(ctx, t, 600 * r * p, 0.15, 0.02, { att:0.006 });
  },
  click(ctx, t, r, k){
    const p = k === 'mark' ? 0.7 : 1;
    tsNoiseBurst(ctx, t, 0.006, 2600 * p, 1.6, 0.34);
    tsNoiseBurst(ctx, t + 0.012, 0.006, 3200 * p, 1.6, 0.24);
    tsTone(ctx, t, 3000 * r * p, 0.08, 0.004);
  },
  beep(ctx, t, r, k){
    tsTone(ctx, t, (k === 'mark' ? 660 : 880) * r, 0.18, 0.04, { att:0.004 });
  },
};
/* The "complete" tone: a clear rising four-note bell with a long ring. It is the same for every bead sound, so it always means "done". */
function tsChime(ctx, t){
  [[659.3, 0], [880, 0.11], [1108.7, 0.22], [1318.5, 0.35]].forEach(([f, d], i)=>{
    const last = i === 3, tau = last ? 0.55 : 0.2, a = last ? 0.5 : 0.38;
    tsTone(ctx, t + d, f, a, tau, { att:0.003 });
    tsTone(ctx, t + d, f * 2.01, a * 0.35, tau * 0.6, { att:0.003 });
    tsTone(ctx, t + d, f * 3.0, a * 0.15, tau * 0.4, { att:0.003 });
  });
}
function tsPlay(id, kind, force){
  const ctx = tsCtx(); if(!ctx) return;
  tsMaster.gain.value = tsVol();
  const fn = TS_RECIPES[id] || TS_RECIPES.tik, r = 0.97 + Math.random() * 0.06, t = ctx.currentTime + 0.005;
  if(kind === 'done'){
    fn(ctx, t, r, 'tap');
    if(state.tasbeeh.chime !== false) tsChime(ctx, t + 0.12);
    return;
  }
  fn(ctx, t, r, kind === 'mark' ? 'mark' : 'tap');
}
function tasbeehChimePreview(){
  if(state.sounds === false) return;
  try{ const ctx = tsCtx(); if(ctx){ tsMaster.gain.value = tsVol(); tsChime(ctx, ctx.currentTime + 0.01); } }catch(e){}
}
/* Called on every counted bead. kind: '' | 'mark' | 'done' */
function tasbeehBeep(kind){
  const t = state.tasbeeh;
  if(!t.sound) return;
  try{ tsPlay(t.soundId || 'tik', kind === 'mark' && t.markTik === false ? '' : kind); }catch(e){}
}
function tasbeehPreview(id){
  if(state.sounds === false) return;
  try{ tsPlay(id, ''); }catch(e){}
}

/* Sound choices (chips + volume + two switches). Used by the counter screen and the classic screen. */
function tsPickerHtml(){
  const t = state.tasbeeh, cur = t.soundId || 'tik', vol = Math.round(tsVol() * 100);
  return `<div class="ts-snd">
    <div class="ts-snd-chips">${TS_SOUNDS.map(s=>`<button type="button" class="ts-snd-chip${cur === s.id ? ' on' : ''}" data-snd="${s.id}">♪ ${L(s.n)}</button>`).join('')}</div>
    <label class="ts-vol"><span>🔉 ${L({ rur:'Awaaz ki tezi', en:'Volume' })}</span><input type="range" min="10" max="100" step="5" value="${vol}" data-vol></label>
    <div class="ts-snd-sw"><span>${L({ rur:'Poora hone par khaas tone (ghanti)', en:'Bell when a round completes' })}</span><button type="button" class="ms-sw${t.chime !== false ? ' on' : ''}" data-tsw="chime" role="switch" aria-checked="${t.chime !== false}"><i></i></button></div>
    <div class="ts-snd-sw"><span>${L({ rur:'Har 11vi moti par alag tik', en:'Different tick on every 11th bead' })}</span><button type="button" class="ms-sw${t.markTik !== false ? ' on' : ''}" data-tsw="markTik" role="switch" aria-checked="${t.markTik !== false}"><i></i></button></div>
  </div>`;
}
function tsPickerWire(root, again){
  const t = state.tasbeeh;
  root.querySelectorAll('[data-snd]').forEach(b=>{
    b.onclick = ()=>{ t.soundId = b.dataset.snd; if(!t.sound) t.sound = true; saveState(); tasbeehPreview(t.soundId); again(); };
  });
  const v = root.querySelector('[data-vol]');
  if(v){
    v.oninput = ()=>{ t.vol = +v.value / 100; if(tsMaster) tsMaster.gain.value = tsVol(); };
    v.onchange = ()=>{ saveState(); tasbeehPreview(t.soundId || 'tik'); };
  }
  root.querySelectorAll('[data-tsw]').forEach(b=>{
    b.onclick = ()=>{ const k = b.dataset.tsw; t[k] = t[k] === false; saveState(); if(k === 'chime' && t.chime !== false) tasbeehChimePreview(); again(); };
  });
}
