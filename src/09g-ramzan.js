/* ============================================================
   RAMZAN MODE: while it is Ramzan, a bar on Home counts down to Sehri end / Iftar and shows the roza count with a one-tap Roza switch.
   The Ramzan screen gets the same live card plus two optional reminders (Sehri, Taraweeh).
   ============================================================ */
function isRamzanNow(d){ return gregorianToHijri(d || new Date()).month === 9; }
/* what is next: Sehri ends (at Fajr) -> Iftar (Maghrib) -> tomorrow's Sehri */
function ramzanNext(now){
  const find = (d, k)=> buildSchedule(d).find(x=>x.key === k);
  const today = find(now, 'sehri'), iftar = find(now, 'iftar');
  if(today && now < today.end) return { kind:'sehri', at:today.end, label:L({rur:'Sehri ka waqt khatam hone mein', en:'Sehri ends in'}), ic:'🍽️' };
  if(iftar && now < iftar.start) return { kind:'iftar', at:iftar.start, label:L({rur:'Iftar mein', en:'Iftar in'}), ic:'🌅' };
  const tm = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 12), nt = find(tm, 'sehri');
  return { kind:'sehri', at:nt.end, label:L({rur:'Kal Sehri ka waqt khatam hone mein', en:'Tomorrow Sehri ends in'}), ic:'🍽️' };
}
/* roza kept so far in this Ramzan (state.roza is keyed by day) */
function ramzanRozaCount(now){
  const hd = gregorianToHijri(now), first = hijriToGregorian(1, 9, hd.year); let n = 0;
  for(let d = new Date(first); d <= now; d.setDate(d.getDate() + 1)) if(state.roza[dayKey(d)]) n++;
  return { kept:n, day:hd.day };
}
function ramzanLiveHtml(){
  const now = new Date(), nx = ramzanNext(now), rc = ramzanRozaCount(now), on = !!state.roza[dayKey(now)];
  return `<span class="rz-ic">${nx.ic}</span><span class="rz-txt"><b class="rz-cd" data-at="${nx.at.getTime()}">${nx.label} ${fmtRemain(nx.at - now)}</b><small>${L({rur:'Ramzan', en:'Ramadan'})} ${rc.day} · ${L({rur:'Roze', en:'Roza'})} ${rc.kept}</small></span><button type="button" class="rz-roza${on ? ' on' : ''}" id="rzBarRoza">${on ? '✓ ' + L({rur:'Roza rakha', en:'Fasting'}) : L({rur:'Roza rakha?', en:'Fasting?'})}</button>`;
}
function renderRamzanBar(){
  const old = document.getElementById('ramzanBar');
  if(!isRamzanNow() || !uiGateOpen()){ if(old) old.remove(); return; }
  const list = document.getElementById('timesList'); if(!list) return;
  const bar = old || document.createElement('div');
  bar.id = 'ramzanBar'; bar.className = 'rz-bar'; bar.innerHTML = ramzanLiveHtml();
  if(!old) list.before(bar);
  document.getElementById('rzBarRoza').onclick = ()=>{ const k = dayKey(new Date()); state.roza[k] = !state.roza[k]; saveState(); renderRamzanBar(); };
}
function ramzanBarTick(){
  document.querySelectorAll('.rz-cd[data-at]').forEach(el=>{
    const at = +el.dataset.at; if(Date.now() >= at){ renderRamzanBar(); const c = document.getElementById('rzNowCard'); if(c) c.innerHTML = ramzanLiveHtml(); return; }
    const t = el.textContent.replace(/ \d.*$/, '') + ' ' + fmtRemain(at - Date.now()); if(el.textContent !== t) el.textContent = t;
  });
}
setInterval(ramzanBarTick, 5000);
/* reminders for a given day: Sehri (30 min before it ends) and Taraweeh (20 min after Isha starts) */
function ramzanReminders(day){
  if(!isRamzanNow(day)) return [];
  const out = [], sch = buildSchedule(day), n = state.notif || {};
  const sehri = sch.find(x=>x.key === 'sehri'), isha = sch.find(x=>x.key === 'isha');
  if(n.rzSehri && sehri) out.push({ at:new Date(sehri.end.getTime() - 30 * 60000), title:'🍽️ ' + L({rur:'Sehri ka waqt khatam hone wala hai', en:'Sehri is about to end'}), body:L({rur:'30 minute baaqi hain.', en:'30 minutes left.'}), key:'rzs' + dayKey(day) });
  if(n.rzTaraweeh && isha) out.push({ at:new Date(isha.start.getTime() + 20 * 60000), title:'🌙 ' + L({rur:'Taraaweeh ka waqt', en:'Time for Taraweeh'}), body:L({rur:'Isha ke baad Taraaweeh padh lein.', en:'Pray Taraweeh after Isha.'}), key:'rzt' + dayKey(day) });
  return out;
}
/* toggles + live card, drawn at the top of the Ramzan screen */
function ramzanScreenTopHtml(){
  const n = state.notif || {};
  return `<div class="rz-bar rz-card" id="rzNowCard">${ramzanLiveHtml()}</div>
    <div class="rz-opts">
      <div class="tasbeeh-sound-toggle">🍽️ ${L({rur:'Sehri ka reminder (30 min pehle)', en:'Sehri reminder (30 min before)'})}<div class="roza-mini ${n.rzSehri ? 'on' : ''}" data-rzn="rzSehri"><div class="roza-mini-knob"></div></div></div>
      <div class="tasbeeh-sound-toggle">🌙 ${L({rur:'Taraaweeh ka reminder', en:'Taraweeh reminder'})}<div class="roza-mini ${n.rzTaraweeh ? 'on' : ''}" data-rzn="rzTaraweeh"><div class="roza-mini-knob"></div></div></div>
    </div>`;
}
function wireRamzanScreenTop(){
  const roza = document.getElementById('rzBarRoza'); if(roza) roza.onclick = ()=>{ const k = dayKey(new Date()); state.roza[k] = !state.roza[k]; saveState(); document.getElementById('rzNowCard').innerHTML = ramzanLiveHtml(); wireRamzanScreenTop(); renderRamzan(); };
  document.querySelectorAll('[data-rzn]').forEach(b=>{
    b.onclick = async ()=>{
      const k = b.dataset.rzn; state.notif[k] = !state.notif[k];
      if(state.notif[k] && 'Notification' in window && Notification.permission === 'default'){ try{ await Notification.requestPermission(); }catch(e){} }
      saveState(); b.classList.toggle('on', !!state.notif[k]); if(typeof scheduleNotifications === 'function') scheduleNotifications(true);
    };
  });
}
