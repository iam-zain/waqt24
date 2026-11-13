/* ============================================================
   NATIVE (Android app built with Capacitor): Azan and prayer notifications that still fire when the app is closed.
   In the browser/PWA this file does nothing. In the app it schedules the next NATIVE_DAYS days with the system alarm manager
   every time the app opens or settings change; open the app at least once in that period to refresh.
   ============================================================ */
const NATIVE_DAYS = 14;
const nativeLN = ()=>{ try{ return window.Capacitor && Capacitor.isNativePlatform && Capacitor.isNativePlatform() && Capacitor.Plugins && Capacitor.Plugins.LocalNotifications || null; }catch(e){ return null; } };
const nativeRaw = id=> String(id).replace(/-/g, '_');
let nativeSig = '', nativeBusy = false, nativeChannels = {};
async function nativeEnsureChannel(LN, id){
  const ch = id ? 'azan_' + nativeRaw(id) : 'waqt24_default';
  if(nativeChannels[ch]) return ch;
  try{ await LN.createChannel(id ? { id:ch, name:'Azan · ' + id, description:'Azan at prayer time', importance:5, sound:nativeRaw(id) + '.mp3', vibration:true, visibility:1 } : { id:ch, name:'Waqt24 reminders', description:'Prayer and learning reminders', importance:4, vibration:true, visibility:1 }); }catch(e){}
  nativeChannels[ch] = 1; return ch;
}
/* the list of notifications to schedule: [{ at: Date, title, body, key, azan: recordingId|null }] */
function nativePlan(now){
  const out = [], az = azaanState();
  for(let d = 0; d < NATIVE_DAYS; d++){
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + d, 12, 0, 0);
    buildSchedule(day).forEach(p=>{
      if(p.start <= now) return;
      const isAz = FIVE.includes(p.key) && az.on && az.prayers[p.key];
      if(isAz){ out.push({ at:p.start, title:(PRAYER_META[p.key] ? PRAYER_META[p.key].icon : '🕌') + ' ' + p.name + ' ki Azaan', body:p.name + ' ka waqt ho gaya hai.', key:dayKey(day) + p.key, azan:az.pick[p.key] }); return; }
      if(state.notif && state.notif[p.type]) out.push({ at:p.start, title:(PRAYER_META[p.key] ? PRAYER_META[p.key].icon : '🕐') + ' ' + p.name + ' ka waqt', body:p.name + ' ka waqt ho gaya hai.', key:dayKey(day) + p.key, azan:null });
    });
  }
  return out.sort((a, b)=> a.at - b.at);
}
async function nativeSchedule(force){
  const LN = nativeLN(); if(!LN || nativeBusy) return;
  const plan = nativePlan(new Date());
  let h = 0; plan.forEach(n=>{ const t = n.key + '|' + n.azan + '|' + n.at.getTime() + '|' + n.title; for(let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) | 0; });
  const sig = plan.length + ':' + h;
  if(!force && sig === nativeSig) return;
  nativeBusy = true;
  try{
    let perm = await LN.checkPermissions();
    if(perm.display !== 'granted') perm = await LN.requestPermissions();
    if(perm.display !== 'granted') return;
    try{ const ex = await LN.checkExactNotificationSetting(); if(ex && ex.exact_alarm === 'prompt') await LN.changeExactNotificationSetting(); }catch(e){}
    const pending = await LN.getPending(); if(pending.notifications && pending.notifications.length) await LN.cancel({ notifications: pending.notifications });
    const items = []; let id = 1;
    for(const n of plan){ items.push({ id:id++, title:n.title, body:n.body, schedule:{ at:n.at, allowWhileIdle:true }, channelId:await nativeEnsureChannel(LN, n.azan), smallIcon:'ic_stat_waqt24' }); }
    for(let i = 0; i < items.length; i += 60) await LN.schedule({ notifications: items.slice(i, i + 60) });
    nativeSig = sig;
  }catch(e){ console.warn('native schedule', e); }
  finally{ nativeBusy = false; }
}
if(nativeLN()){
  document.body.classList.add('native-app');
  setTimeout(()=>nativeSchedule(), 1500);
  document.addEventListener('visibilitychange', ()=>{ if(!document.hidden) nativeSchedule(); });
  setInterval(()=>nativeSchedule(), 5 * 60000);
}
