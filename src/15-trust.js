/* ============================================================
   TRUST: version, What's new (shown once per version), privacy and data sources in About, and an offline note
   ============================================================ */
const APP_VERSION = '1.1';
const WHATS_NEW = [
  ['📿', { rur:'Naya Tasbeeh Mala', en:'New Tasbeeh Mala' }, { rur:'Moti ki mala, 6 rang, kai manzar, mausam, 3 roshni ke andaaz. Koi bhi dua ya zikr chun kar ginti karein.', en:'A bead garland with 6 colours, many scenes, weather and 3 brightness modes. Count with any dua or zikr.' }],
  ['🔊', { rur:'Moti ki 8 awaazein', en:'8 bead sounds' }, { rur:'Tik, Lakdi, Sheesha, Ghanti aur baaqi. Round poora hone par khaas tone.', en:'Tik, Wood, Glass, Bell and more, with a special tone when a round completes.' }],
  ['📋', { rur:'Aaj ka zikr profile', en:'Today\'s zikr profile' }, { rur:'Ek button se poora profile shuru karein, ek ek zikr poora hone par agla khud aata hai.', en:'Start a whole profile with one button; each zikr moves on to the next when done.' }],
  ['📊', { rur:'Undo aur aaj ka hisaab', en:'Undo and today\'s count' }, { rur:'Galat tap wapas karein, aur dekhein aaj kaun si dua kitni baar padhi.', en:'Undo a wrong tap and see which dua you read how many times today.' }],
  ['🌟', { rur:'Anbiya ki duaein', en:'Duas of the Prophets' }, { rur:'Mushkil waqt ki 10 duaein tasveeron ke saath, aur Jannat/Jahannam, Istighfar ki duaein.', en:'10 duas for hard times with pictures, plus duas for Paradise, protection from the Fire and Istighfar.' }],
  ['⚙', { rur:'Settings ab sections mein', en:'Settings in sections' }, { rur:'Upar search box se kisi bhi setting tak seedha pahunchein.', en:'Use the search box on top to jump to any setting.' }],
];
function showWhatsNew(){
  if(document.getElementById('wnOv')) return;
  const o = document.createElement('div'); o.id = 'wnOv'; o.className = 'wn-ov';
  o.innerHTML = `<div class="wn-sheet" role="dialog" aria-modal="true" aria-label="${L({ rur:'Naya kya hai', en:'What\'s new' })}">
    <div class="wn-h"><b>✨ ${L({ rur:'Naya kya hai', en:'What\'s new' })}</b><span>v${APP_VERSION}</span></div>
    <div class="wn-list">${WHATS_NEW.map(x=>`<div class="wn-it"><div class="wn-ic">${x[0]}</div><div><b>${L(x[1])}</b><span>${L(x[2])}</span></div></div>`).join('')}</div>
    <button type="button" class="backup-btn" id="wnOk">${L({ rur:'Theek hai', en:'Got it' })}</button></div>`;
  document.body.appendChild(o);
  requestAnimationFrame(()=>o.classList.add('on'));
  const close = ()=>{ o.classList.remove('on'); setTimeout(()=>o.remove(), 250); };
  o.querySelector('#wnOk').onclick = close;
  o.addEventListener('click', e=>{ if(e.target === o) close(); });
}
/* A brand-new person finishes the first-run setup first; they get the current version marked as seen. Others see the sheet once per version. */
function whatsNewCheck(){
  if(state.seenVersion === APP_VERSION) return;
  if(!state.setupDone || document.getElementById('setupOverlay')){ if(!state.setupDone) { state.seenVersion = APP_VERSION; saveState(); } return; }
  state.seenVersion = APP_VERSION; saveState();
  setTimeout(()=>{ if(!document.getElementById('setupOverlay')) showWhatsNew(); }, 1800);
}
setTimeout(whatsNewCheck, 600);

function appBuildId(){ const s = document.querySelector('script[src*="app.js"]'); const m = s && /[?&]v=([\w]+)/.exec(s.getAttribute('src') || ''); return m ? m[1] : ''; }
/* About: version, privacy, data sources */
(function(){
  const base = renderMoreAbout;
  renderMoreAbout = function(){
    base();
    const body = document.getElementById('detailBody'); if(!body) return;
    const card = (ic, t, inner)=>`<div class="howto-card"><div class="howto-ic">${ic}</div><div class="howto-body"><div class="howto-t">${t}</div><div class="howto-d">${inner}</div></div></div>`;
    const ul = a=>`<ul class="tr-ul">${a.map(x=>`<li>${x}</li>`).join('')}</ul>`;
    body.insertAdjacentHTML('beforeend', `
      ${card('ℹ️', L({ rur:'Version', en:'Version' }), `<span data-no-i18n>Waqt24 v${APP_VERSION}${appBuildId() ? ' · build ' + appBuildId() : ''}</span><br><button type="button" class="tr-btn" id="abWn">✨ ${L({ rur:'Naya kya hai dekhein', en:'See what\'s new' })}</button>`)}
      ${card('🔒', L({ rur:'Aapki privacy', en:'Your privacy' }), ul([
        L({ rur:'Koi account, login, ads ya analytics nahi hai.', en:'No account, login, ads or analytics.' }),
        L({ rur:'Aapka shahar, namaz ke nishaan, tasbeeh, notes aur pasandeeda sirf aapke apne device par mehfooz hain. Backup aap khud banate hain.', en:'Your city, prayer marks, tasbeeh, notes and favourites are stored only on your own device. You make backups yourself.' }),
        L({ rur:'Namaz ke auqaat device par hi hisaab se nikalte hain. GPS sirf tab use hota hai jab aap "GPS se location lein" dabayein, sirf shahar chunne ke liye.', en:'Prayer times are calculated on your device. GPS is used only when you tap "Use my location", only to pick your city.' }),
        L({ rur:'Internet sirf Quran ki tilawat (everyayah.com) aur zaroorat par kuch online tarjume (alquran.cloud) ke liye lagta hai. Quran ke pages, Azaan, duaein aur hadees app ke andar hain aur offline chalte hain.', en:'The internet is used only for Quran recitation (everyayah.com) and some online translations (alquran.cloud) when needed. Quran pages, Azaan, duas and hadith are inside the app and work offline.' }),
      ]))}
      ${card('📚', L({ rur:'Maloomat kahan se', en:'Where the information comes from' }), ul([
        L({ rur:'Namaz ke auqaat: khagoli hisaab. Tareeqe Namaz ka Hisaab mein chunein (Muslim World League, Karachi, ISNA, Egyptian, Umm al-Qura). Hanafi ya Shafi\'i Asr bhi chun sakte hain.', en:'Prayer times: astronomical calculation. Choose the method in Prayer calculation (Muslim World League, Karachi, ISNA, Egyptian, Umm al-Qura), and Hanafi or Shafi\'i Asr.' }),
        L({ rur:'Namaz ke auqaat hisaabi hain. Apni masjid ke jamaat ke waqt se zaroor milaiye.', en:'Prayer times are calculated. Please match them with your own masjid\'s jamaat times.' }),
        L({ rur:'Hijri tareekh hisaab se hai aur chaand dikhne par ek din ka farq ho sakta hai. Namaz ka Hisaab mein theek kar sakte hain.', en:'The Hijri date is calculated and can differ by a day depending on moon sighting. You can adjust it in Prayer calculation.' }),
        L({ rur:'Tilawat: Mishary Alafasy. Urdu tarjuma ki awaaz: Shamshad Ali Khan (everyayah.com).', en:'Recitation: Mishary Alafasy. Urdu translation audio: Shamshad Ali Khan (everyayah.com).' }),
        L({ rur:'Hadees aur duaon ke saath kitaab ka hawala likha hota hai (jaise Sahih Bukhari, Jami Tirmidhi). Masail ke liye apne aalim se zaroor poochein.', en:'Hadith and duas show their book reference (such as Sahih Bukhari, Jami Tirmidhi). For rulings, please ask your own scholar.' }),
      ]))}`);
    const wn = document.getElementById('abWn'); if(wn) wn.onclick = showWhatsNew;
  };
})();

/* Offline: a calm note saying what still works */
(function(){
  let bar = null, hideT = 0;
  function show(){
    if(bar) return;
    bar = document.createElement('div'); bar.className = 'off-bar'; bar.setAttribute('role', 'status');
    bar.innerHTML = `<span>📴 ${L({ rur:'Internet nahi hai. Namaz ke auqaat, Quran ke pages, duaein aur tasbeeh chalte rahenge. Sirf tilawat ki awaaz ke liye internet chahiye.', en:'You are offline. Prayer times, Quran pages, duas and tasbeeh still work. Only recitation audio needs the internet.' })}</span><button type="button" aria-label="${L({ rur:'Band karein', en:'Dismiss' })}">✕</button>`;
    bar.querySelector('button').onclick = hide;
    document.body.appendChild(bar); requestAnimationFrame(()=>bar && bar.classList.add('on'));
  }
  function hide(){ if(!bar) return; const b = bar; bar = null; b.classList.remove('on'); setTimeout(()=>b.remove(), 250); }
  window.addEventListener('offline', ()=>{ clearTimeout(hideT); show(); });
  window.addEventListener('online', ()=>{ hide(); showToast(L({ rur:'Internet wapas aa gaya', en:'Back online' }), '✓'); });
  if(navigator.onLine === false) setTimeout(show, 1200);
})();
