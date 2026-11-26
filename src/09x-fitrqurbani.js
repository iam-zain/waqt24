/* ===== Sadaqa-e-Fitr aur Qurbani calculator (Hanafi) ===== */
const FQ_ITEMS = [
  ['wheat',  '🌾 Aata (gehun)',     1, 'Hanafi mein aadha saa’'],
  ['barley', '🌿 Jau',              2, 'poora saa’'],
  ['dates',  '🌴 Khajoor',          2, 'poora saa’'],
  ['raisin', '🍇 Kishmish',         2, 'ehtiyat se poora saa’ (is par ulema ki raay thodi alag hai)']
];
/* rough per-kg estimates (₹) so the amount shows at once; the user can type their own city's price */
const FQ_PRICE_EST = { wheat:55, barley:50, dates:300, raisin:400 };
const FQ_WHEAT_KG = [[1.633, 'Aam (Al-Lubab)'], [1.625, 'Dar al-Ifta Misr'], [2.32, 'Ehtiyat wali raay']];
const FQ_ANIMALS = [['Bakra / Bhed / Dumba', '1 saal ya zyada (bhed 6 mahine ki bhi, agar saal bhar ki lage)', '1 hissa'], ['Gaay / Bail / Bhains', '2 saal ya zyada', 'Ziyada se ziyada 7 hisse'], ['Oont', '5 saal ya zyada', 'Ziyada se ziyada 7 hisse']];

function fqState(){
  const f = state.fq = (state.fq && typeof state.fq === 'object') ? state.fq : {};
  f.tab = state.zkTab === 'qurbani' ? 'qurbani' : 'fitr';
  if(f.me == null) f.me = 1; if(f.kids == null) f.kids = 0; if(f.other == null) f.other = 0; if(f.people == null) f.people = 1;
  if(!FQ_ITEMS.some(x=> x[0] === f.item)) f.item = 'wheat';
  if(!(parseFloat(f.kg) > 0)) f.kg = 1.633;
  return f;
}
const fqNum = v => { const n = parseFloat(String(v == null ? '' : v).replace(/,/g, '')); return n > 0 ? n : 0; };
const fqKg = n => (Math.round(n * 100) / 100).toLocaleString('en-IN', { maximumFractionDigits:2 });
function fqNextHijri(d, m){
  /* next occurrence (today or later) of day d of Hijri month m, as a Gregorian date */
  const today = new Date(); today.setHours(0, 0, 0, 0);
  let y = gregorianToHijri(today).year;
  for(let i = 0; i < 3; i++){ const g = hijriToGregorian(d, m, y + i); if(g && g >= today) return { date:g, year:y + i }; }
  return null;
}
const fqDateStr = g => g ? g.toLocaleDateString('en-IN', { weekday:'short', day:'numeric', month:'long', year:'numeric' }) : '';

function renderFitrQurbani(){
  const f = fqState();
    document.getElementById('detailBody').innerHTML = `
    <div class="zk-hero fq-hero"><div class="zk-hero-ic">${f.tab === 'qurbani' ? '🐑' : '🌾'}</div><div><div class="zk-hero-t">${f.tab === 'qurbani' ? 'Qurbani' : 'Sadaqa-e-Fitr'}</div><div class="zk-hero-s">${f.tab === 'qurbani' ? 'Eid-ul-Azha ka hisaab · Hanafi fiqh ke mutabiq' : 'Eid-ul-Fitr se pehle ada hota hai · Hanafi fiqh ke mutabiq'}</div></div></div></div>
    <div id="fqBody"></div>
    <div class="backup-note">Ye hisaab Hanafi fiqh ki aam maloomat par mabni hai. Wazan aur rakam ke baare mein apne masjid ke imam ya mufti ke elaan ko dekh lein. Ye mashwara nahi, sirf madad hai.</div>
    <div class="tab-end"></div>`;
  f.tab === 'fitr' ? fqDrawFitr() : fqDrawQurbani();
}

function fqStepper(k, ic, label, hint, v){
  return `<div class="zk-row fq-row"><div class="zk-lbl"><span>${ic}</span><div><b>${label}</b>${hint ? `<small>${hint}</small>` : ''}</div></div><div class="fq-step" data-k="${k}"><button type="button" data-d="-1" aria-label="Kam">−</button><b>${v}</b><button type="button" data-d="1" aria-label="Zyada">+</button></div></div>`;
}
function fqWireSteppers(redraw){
  document.querySelectorAll('.fq-step').forEach(s=>{
    s.querySelectorAll('button').forEach(b=> b.onclick = ()=>{
      const f = fqState(), k = s.dataset.k; f[k] = Math.max(0, Math.min(999, (+f[k] || 0) + (+b.dataset.d)));
      s.querySelector('b').textContent = f[k]; saveState(); redraw();
    });
  });
}
function fqNisabBtn(){
  return `<button type="button" class="fq-link" id="fqNisab">📏 Nisab kitna hai? Zakat tab mein dekhein</button>`;
}
function fqWireNisab(){ const b = document.getElementById('fqNisab'); if(b) b.onclick = ()=>{ state.zkTab = 'zakat'; saveState(); renderZakat(); }; }

/* ---------- Sadaqa-e-Fitr ---------- */
function fqFitrCalc(){
  const f = fqState(), it = FQ_ITEMS.find(x=> x[0] === f.item), wheat = fqNum(f.kg) || 1.633, per = wheat * it[2], n = (+f.me || 0) + (+f.kids || 0) + (+f.other || 0), own = fqNum(f.price), est = !(own > 0), price = est ? FQ_PRICE_EST[it[0]] : own;
  return { f, it, per, n, price, est, totalKg:per * n, perAmt:per * price, total:per * price * n };
}
function fqFitrResult(){
  const c = fqFitrCalc(), el = document.getElementById('fqRes'); if(!el) return;
  if(c.n <= 0){ el.innerHTML = `<div class="zk-st zk-idle">Upar kam se kam ek insaan chunein.</div>`; return; }
  const tag = c.est ? ` <small class="fq-est">andaaza, ${zkFmt(c.price)}/kg ke hisaab se</small>` : '';
  el.innerHTML = `<div class="zk-st zk-yes">✅ ${c.n} logon ka Sadaqa-e-Fitr</div><div class="zk-amt"><small>Kul rakam${tag}</small>${zkFmt(c.total)}</div>
       <div class="zk-brk"><div><span>👤 Ek insaan ka</span><b>${zkFmt(c.perAmt)}</b></div><div><span>⚖️ Ek insaan (${c.it[1].replace(/^\S+\s/, '')})</span><b>${fqKg(c.per)} kg</b></div><div class="zk-tot"><span>Kul wazan (${c.n} log)</span><b>${fqKg(c.totalKg)} kg</b></div></div>`;
  const top = document.getElementById('fqTop'); if(top) top.innerHTML = `<span>🌾 ${c.n} log</span><b>${zkFmt(c.total)}</b><small>${c.est ? 'andaaza' : 'aapke bhaav se'}</small>`;
  const sh = document.getElementById('fqShare'); if(sh) sh.style.display = '';
}
function fqFitrText(){
  const c = fqFitrCalc(), ed = fqNextHijri(1, 10);
  return `🌾 Sadaqa-e-Fitr (Hanafi)\n${c.n} log · ${c.it[1].replace(/^\S+\s/, '')} · ${fqKg(c.per)} kg per insaan\nEk insaan: ${zkFmt(c.perAmt)}\nKul: ${zkFmt(c.total)}\n\nEid ki namaz se pehle ada karein.${ed ? `\nEid-ul-Fitr: taqreeban ${fqDateStr(ed.date)}` : ''}\n— Waqt24`;
}
function fqDrawFitr(){
  const f = fqState(), eid = fqNextHijri(1, 10), c = fqFitrCalc();
  const itemLbl = c.it[1].replace(/^\S+\s/, '');
  document.getElementById('fqBody').innerHTML = `
    <div class="fq-top" id="fqTop"></div>
    <div class="zk-card">
      <div class="zk-h"><span>1</span> Kin logon ki taraf se?</div>
      ${fqStepper('me', '👤', 'Aap khud', 'Sahib-e-nisab par wajib', f.me)}
      ${fqStepper('kids', '🧸', 'Naabaalig bachche', 'Baap par unki taraf se wajib', f.kids)}
      ${fqStepper('other', '🏠', 'Doosre (apni khushi se)', 'Jaise biwi ya walidain, agar aap dena chahein', f.other)}
      <div class="zk-note">Biwi aur baaligh bachche agar sahib-e-nisab hain to wo apna fitrah khud denge.</div>
      ${fqNisabBtn()}
    </div>
    <div class="zk-card">
      <div class="zk-h"><span>2</span> Kya dena hai aur kitna?</div>
      <select class="zk-sel" id="fqItem">${FQ_ITEMS.map(x=>`<option value="${x[0]}" ${f.item === x[0] ? 'selected' : ''}>${x[1]}</option>`).join('')}</select>
      <div class="zk-note" style="margin-top:8px;">Gehun ka aadha saa’ kitne kg hai, is par raayein thodi alag hain. Apne masjid ya mufti ka elaan ho to wohi likhein.</div>
      <div class="fq-chips" id="fqKgChips">${FQ_WHEAT_KG.map(([v, n])=>`<button type="button" data-v="${v}" class="${Math.abs(fqNum(f.kg) - v) < 0.001 ? 'on' : ''}">${v} kg<small>${n}</small></button>`).join('')}</div>
      <div class="zk-row"><div class="zk-lbl"><span>⚖️</span><div><b>Aata/gehun (aadha saa’) kg mein</b><small>Jau, khajoor, kishmish ke liye iska doguna</small></div></div><div class="zk-field"><input class="zk-in" inputmode="decimal" id="fqKg" value="${f.kg}" style="padding-left:12px;"></div></div>
      <div class="zk-row"><div class="zk-lbl"><span>🏷️</span><div><b id="fqPriceLbl">${itemLbl} ka bhaav (per kg)</b><small>Khali chhodein to andaaza lagega. Apne shehar ka bhaav likhein.</small></div></div><div class="zk-field"><i>₹</i><input class="zk-in" inputmode="decimal" id="fqPrice" placeholder="andaaza ${FQ_PRICE_EST[f.item]}" value="${f.price != null ? f.price : ''}"></div></div>
    </div>
    <div class="zk-card"><div class="zk-h"><span>3</span> Aapka Sadaqa-e-Fitr</div><div id="fqRes"></div>
      <button type="button" class="fq-link" id="fqShare">📤 Share karein</button></div>
    <div class="zk-card fq-info"><div class="zk-h">📌 Zaroori baatein</div>
      <ul>
        <li>Wajib hone ke liye Eid ki subah sahib-e-nisab hona kaafi hai, saal guzarna zaroori nahi.</li>
        <li>Eid ki namaz se pehle de dena behtar hai.</li>
        <li>Ye Zakat ke masarif mein diya jata hai. Walidain, aulad aur biwi ko nahi diya jata.</li>
        <li>Anaaj ki jagah uski qeemat dena bhi jaiz hai.</li>
        ${eid ? `<li>Eid-ul-Fitr (1 Shawwal): taqreeban <b>${fqDateStr(eid.date)}</b>, chaand dikhne par.</li>` : ''}
      </ul></div>`;
  const redraw = ()=> fqFitrResult();
  fqWireSteppers(redraw); fqWireNisab();
  const upd = ()=>{ const c2 = fqFitrCalc(); document.getElementById('fqPriceLbl').textContent = c2.it[1].replace(/^\S+\s/, '') + ' ka bhaav (per kg)'; fqFitrResult(); };
  document.getElementById('fqItem').onchange = e=>{ f.item = e.target.value; saveState(); upd(); };
  document.getElementById('fqKg').oninput = e=>{ f.kg = e.target.value; saveState(); document.querySelectorAll('#fqKgChips button').forEach(b=> b.classList.toggle('on', Math.abs(fqNum(f.kg) - +b.dataset.v) < 0.001)); upd(); };
  document.querySelectorAll('#fqKgChips button').forEach(b=> b.onclick = ()=>{ f.kg = b.dataset.v; document.getElementById('fqKg').value = f.kg; saveState(); document.querySelectorAll('#fqKgChips button').forEach(x=> x.classList.toggle('on', x === b)); upd(); });
  document.getElementById('fqPrice').oninput = e=>{ f.price = e.target.value; saveState(); fqFitrResult(); };
  document.getElementById('fqShare').onclick = ()=> fqShareText(fqFitrText());
  fqFitrResult();
}
async function fqShareText(text){
  if(navigator.share){ try{ await navigator.share({ text, title:'Waqt24' }); return; }catch(e){ if(e && e.name === 'AbortError') return; } }
  try{ await navigator.clipboard.writeText(text); showToast('Copy ho gaya'); }catch(e){ showToast('Share nahi ho paya'); }
}

/* ---------- Qurbani ---------- */
function fqQCalc(){
  const f = fqState(), n = +f.people || 0, goat = fqNum(f.goat), cow = fqNum(f.cow), camel = fqNum(f.camel);
  return { f, n, goat, cow, camel };
}
function fqQResult(){
  const c = fqQCalc(), el = document.getElementById('fqRes'); if(!el) return;
  if(c.n <= 0){ el.innerHTML = `<div class="zk-st zk-idle">Upar kam se kam ek insaan chunein.</div>`; return; }
  const rows = [];
  if(c.goat > 0) rows.push(`<div class="fq-opt"><b>🐐 Bakra / Bhed</b><span>${c.n} jaanwar × ${zkFmt(c.goat)}</span><em>${zkFmt(c.goat * c.n)}</em></div>`);
  if(c.cow > 0) rows.push(`<div class="fq-opt"><b>🐄 Gaay / Bhains (7 hisse)</b><span>Ek hissa ${zkFmt(c.cow / 7)} · ${c.n} hisse</span><em>${zkFmt(c.cow / 7 * c.n)}</em><small>${c.n >= 7 ? `${Math.ceil(c.n / 7)} poori gaay ya doosron ke saath hisse` : 'Poori gaay ke liye 7 hisse chahiye, baaqi hisse doosre log lein'}</small></div>`);
  if(c.camel > 0) rows.push(`<div class="fq-opt"><b>🐪 Oont (7 hisse)</b><span>Ek hissa ${zkFmt(c.camel / 7)} · ${c.n} hisse</span><em>${zkFmt(c.camel / 7 * c.n)}</em></div>`);
  el.innerHTML = rows.length ? `<div class="zk-st zk-yes">✅ ${c.n} logon ki Qurbani</div>${rows.join('')}` : `<div class="zk-st zk-idle">Jaanwar ki keemat likhein, kul kharch yahin dikhega.</div>`;
  const sh = document.getElementById('fqShare'); if(sh) sh.style.display = rows.length ? '' : 'none';
}
function fqMeatResult(){
  const f = fqState(), kg = fqNum(f.meat), el = document.getElementById('fqMeatRes'); if(!el) return;
  el.innerHTML = kg > 0 ? `<div class="zk-brk"><div><span>🏠 Ghar ke liye</span><b>${fqKg(kg / 3)} kg</b></div><div><span>🤝 Rishtedar aur dost</span><b>${fqKg(kg / 3)} kg</b></div><div><span>🤲 Ghareeb aur zaroorat-mand</span><b>${fqKg(kg / 3)} kg</b></div></div>` : '';
}
function fqQText(){
  const c = fqQCalc(), ed = fqNextHijri(10, 12), L2 = [];
  if(c.goat > 0) L2.push(`🐐 Bakra/Bhed: ${zkFmt(c.goat * c.n)}`);
  if(c.cow > 0) L2.push(`🐄 Gaay/Bhains ke ${c.n} hisse: ${zkFmt(c.cow / 7 * c.n)}`);
  if(c.camel > 0) L2.push(`🐪 Oont ke ${c.n} hisse: ${zkFmt(c.camel / 7 * c.n)}`);
  return `🐑 Qurbani (Hanafi)\n${c.n} log\n${L2.join('\n')}${ed ? `\n\nQurbani ke din: 10 se 12 Zil Hijjah (10 Zil Hijjah taqreeban ${fqDateStr(ed.date)})` : ''}\n— Waqt24`;
}
function fqDrawQurbani(){
  const f = fqState(), ed = fqNextHijri(10, 12), pr = (k, ic, label, hint, ph)=> `<div class="zk-row"><div class="zk-lbl"><span>${ic}</span><div><b>${label}</b><small>${hint}</small></div></div><div class="zk-field"><i>₹</i><input class="zk-in" inputmode="decimal" data-k="${k}" placeholder="${ph}" value="${f[k] != null ? f[k] : ''}"></div></div>`;
  document.getElementById('fqBody').innerHTML = `
    <div class="zk-card">
      <div class="zk-h"><span>1</span> Kya Qurbani aap par wajib hai?</div>
      <ul class="fq-info-ul">
        <li>Hanafi mein Qurbani wajib hai har aise musalman par jo baaligh ho, muqeem ho aur 10–12 Zil Hijjah mein sahib-e-nisab ho.</li>
        <li>Ye har shakhs par alag alag hai. Ghar ka ek Qurbani sab ki taraf se kaafi nahi hai.</li>
      </ul>
      ${fqNisabBtn()}
    </div>
    <div class="zk-card">
      <div class="zk-h"><span>2</span> Kitne logon ki Qurbani?</div>
      ${fqStepper('people', '👥', 'Sahib-e-nisab log', 'Jin par Qurbani wajib hai', f.people)}
    </div>
    <div class="zk-card">
      <div class="zk-h"><span>3</span> Jaanwar ki keemat</div>
      ${pr('goat', '🐐', 'Bakra / Bhed (ek jaanwar)', 'Ek jaanwar ek shakhs ki Qurbani', 'jaise 15000')}
      ${pr('cow', '🐄', 'Gaay / Bhains (poora jaanwar)', '7 hisse ho sakte hain', 'jaise 70000')}
      ${pr('camel', '🐪', 'Oont (poora jaanwar)', '7 hisse ho sakte hain', 'jaise 150000')}
    </div>
    <div class="zk-card"><div class="zk-h"><span>4</span> Kharch</div><div id="fqRes"></div>
      <button type="button" class="fq-link" id="fqShare">📤 Share karein</button></div>
    <div class="zk-card">
      <div class="zk-h"><span>5</span> Gosht ke 3 hisse (mustahab)</div>
      <div class="zk-row"><div class="zk-lbl"><span>🥩</span><div><b>Aapke hisse ka gosht (kg)</b><small>Wazan karke likhein</small></div></div><div class="zk-field"><input class="zk-in" inputmode="decimal" id="fqMeat" placeholder="jaise 15" value="${f.meat != null ? f.meat : ''}" style="padding-left:12px;"></div></div>
      <div id="fqMeatRes"></div>
      <div class="zk-note">Teen hisse karna afzal hai, wajib nahi. Poora gosht apne paas rakhna bhi jaiz hai.</div>
    </div>
    <div class="zk-card fq-info"><div class="zk-h">🐑 Jaanwar ki umar</div>
      <div class="fq-table">${FQ_ANIMALS.map(a=>`<div><b>${a[0]}</b><span>${a[1]}</span><small>${a[2]}</small></div>`).join('')}</div>
      <ul>
        <li>Jaanwar tandurust ho aur uske kaan ya aankh jaise bade aib na hon.</li>
        <li>Sanjhe ke jaanwar mein har hissedaar ki niyyat Qurbani ya ibadat ki ho, aur kisi ka hissa 1/7 se kam na ho.</li>
        <li>Sanjhe ka gosht andaze se nahi, wazan karke barabar baantein.</li>
        <li>Qurbani ke din: 10, 11, 12 Zil Hijjah. Pehle din karna afzal hai.${ed ? ` 10 Zil Hijjah taqreeban <b>${fqDateStr(ed.date)}</b>.` : ''}</li>
      </ul></div>`;
  fqWireSteppers(fqQResult); fqWireNisab();
  document.querySelectorAll('#fqBody .zk-in[data-k]').forEach(i=> i.oninput = ()=>{ f[i.dataset.k] = i.value; saveState(); fqQResult(); });
  document.getElementById('fqMeat').oninput = e=>{ f.meat = e.target.value; saveState(); fqMeatResult(); };
  document.getElementById('fqShare').onclick = ()=> fqShareText(fqQText());
  fqQResult(); fqMeatResult();
}
