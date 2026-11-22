/* ============================================================
   ZAKAT CALCULATOR (Hanafi): nisab by the silver standard (default) or the gold standard,
   gold and silver weighed by purity, cash, trade goods, money lent, shares, minus debts due now. 2.5% on the rest.
   Gold and silver prices: typed in, fetched live, or a dated estimate.
   ============================================================ */
const ZK = {
  SILVER_NISAB_G: 612.36,   // 52.5 tola
  GOLD_NISAB_G: 87.48,      // 7.5 tola
  TOLA_G: 11.664,
  OZ_G: 31.1035,
  EST: { gold: 13480, silver: 170, label: '17 November 2026' }
};
const ZK_W = ['', 'Ek','Do','Teen','Char','Paanch','Chhe','Saat','Aath','Nau','Das','Gyarah','Barah','Terah','Chaudah','Pandrah','Solah','Satrah','Atharah','Unnis','Bees','Ikkis','Baais','Teis','Chaubis','Pachchis','Chhabbis','Sattais','Atthais','Unattis','Tees','Ikattis','Battis','Taintis','Chauntis','Paintis','Chhattis','Saintis','Adtis','Untalis','Chalis','Iktalis','Bayalis','Taintalis','Chauwalis','Paitalis','Chhiyalis','Saintalis','Adtalis','Unchas','Pachas','Ikyawan','Baawan','Tirpan','Chauwan','Pachpan','Chhappan','Sattawan','Atthawan','Unsath','Saath','Iksath','Baasath','Tirsath','Chausath','Painsath','Chhiyasath','Sarsath','Arsath','Unhattar','Sattar','Ikhattar','Bahattar','Tihattar','Chauhattar','Pachhattar','Chhihattar','Satattar','Athattar','Unaasi','Assi','Ikyaasi','Bayaasi','Tiraasi','Chauraasi','Pachaasi','Chhiyaasi','Sattaasi','Atthaasi','Navaasi','Nabbe','Ikyaanave','Baanave','Tiraanave','Chauraanave','Pachaanave','Chhiyaanave','Sattaanave','Atthaanave','Ninyaanave'];
function zkWords(n){
  n = Math.floor(n); if(!(n > 0)) return '';
  const parts = [], take = (div, name)=>{ const q = Math.floor(n / div); n -= q * div; if(q > 0) parts.push(zkWords(q) + ' ' + name); };
  take(1e9, 'Arab'); take(1e7, 'Crore'); take(1e5, 'Lakh'); take(1e3, 'Hazar'); take(100, 'Sau');
  if(n > 0) parts.push(ZK_W[n]);
  return parts.join(' ');
}
function zkComma(raw){
  const t = String(raw == null ? '' : raw).replace(/[^\d.]/g, ''), i = t.indexOf('.');
  const ip = (i < 0 ? t : t.slice(0, i)).replace(/^0+(?=\d)/, ''), dp = i < 0 ? '' : '.' + t.slice(i + 1).replace(/\./g, '').slice(0, 2);
  return (ip ? Number(ip).toLocaleString('en-IN') : (i < 0 ? '' : '0')) + dp;
}
const zkWordsLbl = v => { const n = zkNum(v); return n >= 1 ? zkWords(n) + ' rupay' : ''; };
function zkState(){
  if(!state.zakat || typeof state.zakat !== 'object') state.zakat = {};
  const z = state.zakat;
  if(!z.f) z.f = {};
  if(!z.mode || z.mode === 'live') z.mode = 'est';
  if(z.mode === 'hawl' && !z.nisabDate) z.mode = 'est';
  if(!z.basis) z.basis = 'silver';
  if(!(z.gold > 0)) z.gold = ZK.EST.gold;
  if(!(z.silver > 0)) z.silver = ZK.EST.silver;
  return z;
}
const zkBusy = { k:'' };
const ZK_RECALL = [
  { ic:'💼', t:'Pehli salary', d:'Wo mahina yaad karein jab salary ya bachat jama hoke pehli baar nisab ke barabar hui. Bank statement ya salary slip mein balance dekh kar tareekh pakad sakte hain.' },
  { ic:'💍', t:'Nikah ka zewar / mehr', d:'Nikah ya rukhsati ka din dekhein, jab sona-chandi ya mehr aapki milkiyat mein aaya. Nikah-naame ya album ki tareekh madad karegi. Agar zewar 87.48 g sone ya 612.36 g chandi ke barabar na ho to nisab tab banta hai jab dusra maal milakar poora ho.' },
  { ic:'🎁', t:'Tohfa / gift', d:'Jis din tohfa ya raqam aapke qabze mein aayi, wohi din hai. Eid, shaadi ya kisi taqreeb ka din yaad karein.' },
  { ic:'🏞️', t:'Walid se zameen / wirasat', d:'Wirasat mein jis din hissa aapka hua, wo din dekhein. Dhyan rahe: rehne ya khet ke liye zameen par Zakat nahi. Bechne ki niyyat se hai to wo tijarat ka maal hai, aur bechne ke baad ki raqam nakdi ban jati hai. Is mein aalim se poochh lein.' },
  { ic:'🥇', t:'Sona / chandi khareeda', d:'Sone ya chandi ki raseed ya bill par likhi tareekh dekhein.' },
  { ic:'🏪', t:'Karobaar shuru kiya', d:'Jis din dukaan ya karobaar ka maal nisab ke barabar hua, wo din chunein.' },
  { ic:'🌙', t:'Koi khaas din', d:'Bahut se log kisi yaad rehne wali Hijri tareekh, jaise 1 Ramzan, ko hawl ki date rakh lete hain. Ye saal bhar ek hi tareekh par hisaab karne ka aasan tareeqa hai, lekin sahi tareekh pata ho to wohi rakhein.' }
];
const zkNum = v => { const n = parseFloat(String(v == null ? '' : v).replace(/,/g, '')); return isFinite(n) && n > 0 ? n : 0; };
const zkFmt = n => '₹' + Math.round(n).toLocaleString('en-IN');
const zkG = n => (Math.round(n * 100) / 100).toLocaleString('en-IN', { maximumFractionDigits:2 });
function zkCalc(){
  const z = zkState(), f = z.f;
  const goldG = zkNum(f.goldW) * (f.goldU === 'tola' ? ZK.TOLA_G : 1);
  const goldPure = goldG * (zkNum(f.goldK) || 24) / 24;
  const silverG = zkNum(f.silverW) * (f.silverU === 'tola' ? ZK.TOLA_G : 1);
  const silverPure = silverG * ((zkNum(f.silverP) || 999) / 1000);
  const rows = [
    { k:'cash',  ic:'💰', n:'Nakdi', v:zkNum(f.cash) },
    { k:'gold',  ic:'🥇', n:'Sona (' + zkG(goldPure) + ' g khaalis)', v:goldPure * z.gold },
    { k:'silver',ic:'🥈', n:'Chandi (' + zkG(silverPure) + ' g khaalis)', v:silverPure * z.silver },
    { k:'trade', ic:'🏪', n:'Tijarat ka maal', v:zkNum(f.trade) },
    { k:'lent',  ic:'🤝', n:'Wapas milne wala udhaar', v:zkNum(f.lent) },
    { k:'shares',ic:'📈', n:'Shares / investment (tijarat ke liye)', v:zkNum(f.shares) },
    { k:'other', ic:'➕', n:'Aur zakat wala maal', v:zkNum(f.other) }
  ];
  const gross = rows.reduce((a, r)=> a + r.v, 0);
  const debts = zkNum(f.debts);
  const net = Math.max(0, gross - debts);
  const nisabSilver = ZK.SILVER_NISAB_G * z.silver, nisabGold = ZK.GOLD_NISAB_G * z.gold;
  const nisab = z.basis === 'gold' ? nisabGold : nisabSilver;
  const due = net >= nisab && net > 0;
  return { rows, gross, debts, net, nisab, nisabSilver, nisabGold, due, zakat: due ? net * 0.025 : 0, short: due ? 0 : Math.max(0, nisab - net) };
}
const zkScene = k => (window.sceneByKey ? (sceneByKey(k) || '') : '');
const zkHF = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', { day:'numeric', month:'long', year:'numeric' });
function zkHP(d){ const o = {}; zkHF.formatToParts(d).forEach(p=>{ o[p.type] = p.value; }); return { d:+o.day, m:o.month, y:parseInt(o.year, 10) }; }
const zkHijri = d => { const h = zkHP(d); return `${h.d} ${h.m} ${h.y} AH`; };
const zkGreg = d => d.toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' });
function zkHawlEnd(d0){ /* same Hijri day, one Hijri year later */
  const h = zkHP(d0), t = new Date(d0); t.setDate(t.getDate() + 352);
  for(let i = 0; i < 8; i++){ const x = zkHP(t); if(x.y === h.y + 1 && x.m === h.m && x.d === h.d) return t; if(x.y === h.y + 1 && x.m === h.m && x.d > h.d) break; t.setDate(t.getDate() + 1); }
  const f = new Date(d0); f.setDate(f.getDate() + 354); return f;
}
function zkResultHtml(){
  const c = zkCalc(), z = zkState();
  const pct = c.nisab > 0 ? Math.min(100, Math.round(c.net / c.nisab * 100)) : 0;
  const filled = c.rows.filter(r=> r.v > 0);
  let status;
  if(c.gross <= 0) status = `<div class="zk-st zk-idle">Upar apna maal likhna shuru karein, hisaab yahin dikhega.</div>`;
  else if(c.due) status = `<div class="zk-st zk-yes">✅ Aap par Zakat farz hai</div><div class="zk-amt"><small>Aapki Zakat (2.5%)</small>${zkFmt(c.zakat)}</div>`;
  else status = `<div class="zk-st zk-no">Abhi aap par Zakat farz nahi</div><div class="zk-amt zk-amt-no"><small>Nisab tak</small>${zkFmt(c.short)} <em>kam</em></div>`;
  return `<div class="zk-res">
    ${status}
    <div class="zk-bar"><i style="width:${pct}%"></i></div>
    <div class="zk-barlbl"><span>Aapka maal ${zkFmt(c.net)}</span><span>Nisab ${zkFmt(c.nisab)}</span></div>
    ${filled.length ? `<div class="zk-brk">${filled.map(r=>`<div><span>${r.ic} ${r.n}</span><b>${zkFmt(r.v)}</b></div>`).join('')}
      ${c.debts > 0 ? `<div class="zk-minus"><span>🧾 Qarz / bills (minus)</span><b>− ${zkFmt(c.debts)}</b></div>` : ''}
      <div class="zk-tot"><span>Zakat wala kul maal</span><b>${zkFmt(c.net)}</b></div></div>` : ''}
    <div class="zk-nis">📏 Nisab: ${z.basis === 'gold' ? `sona ${ZK.GOLD_NISAB_G} g (7.5 tola)` : `chandi ${ZK.SILVER_NISAB_G} g (52.5 tola)`} ≈ ${zkFmt(c.nisab)}</div>
  </div>`;
}
function zkShareText(){
  const c = zkCalc(), z = zkState();
  const L1 = c.rows.filter(r=> r.v > 0).map(r=> `• ${r.n}: ${zkFmt(r.v)}`).join('\n');
  return `Zakat ka hisaab (Hanafi)\n\n${L1}${c.debts > 0 ? `\n• Qarz (minus): ${zkFmt(c.debts)}` : ''}\n\nZakat wala kul maal: ${zkFmt(c.net)}\nNisab (${z.basis === 'gold' ? 'sona 87.48 g' : 'chandi 612.36 g'}): ${zkFmt(c.nisab)}\n` + (c.due ? `\nZakat (2.5%): ${zkFmt(c.zakat)}` : `\nAbhi Zakat farz nahi (nisab tak ${zkFmt(c.short)} kam).`) + `\n\nWaqt24: iam-zain.github.io/waqt24`;
}
async function zkFetchMetal(when){   /* when: 'latest' or 'YYYY-MM-DD'; returns INR per gram for 24K gold and 999 silver */
  const get = async (u)=>{ const ctl = new AbortController(), t = setTimeout(()=> ctl.abort(), 9000); try{ const r = await fetch(u, { signal: ctl.signal }); if(!r.ok) throw new Error(r.status); return await r.json(); } finally{ clearTimeout(t); } };
  const one = async (m)=>{
    const urls = [`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@${when}/v1/currencies/${m}.json`, `https://${when === 'latest' ? 'latest' : when}.currency-api.pages.dev/v1/currencies/${m}.json`];
    for(const u of urls){ try{ const j = await get(u), v = j && j[m] && j[m].inr; if(v > 0) return { perG: v / ZK.OZ_G, day: j.date }; }catch(e){} }
    throw new Error('no ' + m);
  };
  const [g, s] = await Promise.all([one('xau'), one('xag')]);
  if(!(g.perG > 3000 && g.perG < 100000 && s.perG > 20 && s.perG < 3000)) throw new Error('bad data');
  return { gold:g.perG, silver:s.perG, day:g.day || '' };
}
async function zkFetchLatestAny(){
  try{ return await zkFetchMetal('latest'); }catch(e){}
  const get = async (u)=>{ const ctl = new AbortController(), t = setTimeout(()=> ctl.abort(), 9000); try{ const r = await fetch(u, { signal: ctl.signal }); if(!r.ok) throw new Error(r.status); return await r.json(); } finally{ clearTimeout(t); } };
  const [g, s, fx] = await Promise.all([get('https://api.gold-api.com/price/XAU'), get('https://api.gold-api.com/price/XAG'), get('https://open.er-api.com/v6/latest/USD')]);
  const inr = fx && fx.rates && fx.rates.INR;
  if(!(g && g.price > 0 && s && s.price > 0 && inr > 0)) throw new Error('bad data');
  return { gold:g.price / ZK.OZ_G * inr, silver:s.price / ZK.OZ_G * inr, day:'' };
}
/* the most recent date on which the person's Zakat year completed (or the Maalik-e-Nisaab date itself if no year has completed yet) */
function zkHawlRefDate(){
  const z = zkState(); if(!z.nisabDate) return '';
  const t = new Date(); t.setHours(0, 0, 0, 0);
  let d = new Date(z.nisabDate + 'T00:00:00'), last = d;
  for(let i = 0; i < 60; i++){ const e = zkHawlEnd(d); if(e <= t){ last = e; d = e; } else break; }
  return zkISO(last > t ? t : last);
}
function renderZakat(){
  const z = zkState(), f = z.f;
  document.getElementById('detailTitle').textContent = L({ rur:'Zakat Calculator', en:'Zakat Calculator' });
  const inp = (key, ph, extra)=> `<input class="zk-in" inputmode="decimal" data-k="${key}" placeholder="${ph}" value="${f[key] != null ? f[key] : ''}" ${extra || ''}>`;
  const sel = (key, opts)=> `<select class="zk-sel" data-k="${key}">${opts.map(o=>`<option value="${o[0]}"${String(f[key] || opts[0][0]) === String(o[0]) ? ' selected' : ''}>${o[1]}</option>`).join('')}</select>`;
  const money = (key, ic, label, hint)=> `<div class="zk-row"><div class="zk-lbl"><span>${ic}</span><div><b>${label}</b>${hint ? `<small>${hint}</small>` : ''}</div></div><div class="zk-field"><i>₹</i><input class="zk-in zk-money" inputmode="decimal" data-k="${key}" placeholder="0" value="${zkComma(f[key])}"></div><div class="zk-words" data-w="${key}">${zkWordsLbl(f[key])}</div></div>`;
  document.getElementById('detailBody').innerHTML = `
    <div class="zk-hero"><div class="zk-hero-ic">🌙</div><div><div class="zk-hero-t">Zakat Calculator</div><div class="zk-hero-s">Hanafi fiqh ke mutabiq · 2.5% · nisab ke saath</div></div></div>

    <div class="zk-card">
      <div class="zk-h"><span>1</span> Sone aur chandi ka bhaav (₹ per gram)</div>
      <div class="zk-seg" id="zkMode">
        <button data-m="manual" class="${z.mode === 'manual' ? 'on' : ''}">✍️ Khud likhein</button>
        <button data-m="est" class="${z.mode === 'est' ? 'on' : ''}">📌 Andaaza</button>
        <button data-m="hawl" class="${z.mode === 'hawl' ? 'on' : ''}${z.nisabDate ? '' : ' dis'}">🌱 Maalik-e-Nisaab date</button>
      </div>
      <div class="zk-prices">
        <label><span>🥇 Sona (24K)</span><div class="zk-field"><i>₹</i><input class="zk-in" inputmode="decimal" id="zkGoldP" value="${Math.round(z.gold)}"></div></label>
        <label><span>🥈 Chandi (999)</span><div class="zk-field"><i>₹</i><input class="zk-in" inputmode="decimal" id="zkSilverP" value="${Math.round(z.silver * 100) / 100}"></div></label>
      </div>
      <div class="zk-note" id="zkPriceNote"></div>
      <button class="backup-btn zk-fetch" id="zkFetch" style="display:none;">🔄 Bhaav dobara lein</button>
    </div>

    <div class="zk-card">
      <div class="zk-h"><span>2</span> Aapke paas kya hai?</div>
      ${money('cash', '💰', 'Nakdi', 'Haath mein, bank, wallet, UPI')}
      <div class="zk-row"><div class="zk-lbl"><span>🥇</span><div><b>Sona</b><small>Zewar bhi (Hanafi mein zewar par Zakat hai)</small></div></div>
        <div class="zk-multi">${inp('goldW', '0')}${sel('goldU', [['g','gram'],['tola','tola']])}${sel('goldK', [['24','24K'],['22','22K'],['21','21K'],['18','18K'],['14','14K']])}</div></div>
      <div class="zk-row"><div class="zk-lbl"><span>🥈</span><div><b>Chandi</b><small>Zewar aur bartan bhi</small></div></div>
        <div class="zk-multi">${inp('silverW', '0')}${sel('silverU', [['g','gram'],['tola','tola']])}${sel('silverP', [['999','999'],['925','925']])}</div></div>
      ${money('trade', '🏪', 'Tijarat ka maal', 'Bechne ke liye rakha saaman, dukaan ka stock')}
      ${money('lent', '🤝', 'Udhaar jo wapas milne wala hai', 'Jiski wapsi ki ummeed ho')}
      ${money('shares', '📈', 'Shares / investment', 'Jo bechne ki niyyat se liye hon')}
      ${money('other', '➕', 'Aur zakat wala maal', 'Jama kiraya, bachat, committee waghera')}
    </div>

    <div class="zk-card">
      <div class="zk-h"><span>3</span> Qarz aur nisab</div>
      ${money('debts', '🧾', 'Abhi dene wale qarz aur bills', 'Jo foran ada karne hain, ghar ya car ki lambi kisht nahi')}
      <div class="zk-row"><div class="zk-lbl"><span>📏</span><div><b>Nisab ka maiyaar</b><small>Hanafi fatwa mein chandi ka nisab liya jata hai (gareeb ke faide mein)</small></div></div></div>
      <div class="zk-seg zk-seg2" id="zkBasis"><button data-b="silver" class="${z.basis === 'silver' ? 'on' : ''}">🥈 Chandi (612.36 g)</button><button data-b="gold" class="${z.basis === 'gold' ? 'on' : ''}">🥇 Sona (87.48 g)</button></div>
    </div>

    <div id="zkResult"></div>

    <div class="zk-act">
      <button class="backup-btn" id="zkShare">${SHARE_SVG} Hisaab share karein</button>
      <button class="backup-btn secondary" id="zkReset">🔄 Saaf karein</button>
    </div>
    <div class="zk-act"><button class="backup-btn" id="zkSave">💾 Record save karein</button></div>
    ${zkLogHtml()}

    <div class="zk-card">
      <div class="zk-h"><span>📅</span> Hawl: Maalik-e-Nisaab kab bane?</div>
      <div class="zk-sc">${zkScene('hourglass')}</div>
      <div class="zk-note" style="margin:0 0 8px;">Jis din aap pehli baar nisab ke barabar maal ke maalik bane, wo tareekh chunein. Zakat us din se poore ek chaand ke saal (Hijri) baad farz hoti hai.</div>
      <input type="date" class="zk-in zk-date" id="zkPaid" value="${z.nisabDate || ''}">
      <div class="zk-hij" id="zkHij"></div>
      <div class="zk-recall"><div class="zk-recall-t">🧠 Date yaad nahi aa rahi? In mein se dekhein</div>
        <div class="zk-chips" id="zkChips">${ZK_RECALL.map((x, i)=>`<button type="button" data-rc="${i}">${x.ic} ${x.t}</button>`).join('')}</div>
        <div class="zk-rctip" id="zkRcTip"></div>
        <div class="zk-note" style="margin:8px 0 0;">Tareekh English mein chun lein, Hijri tareekh aap ko upar apne aap dikh jayegi. Agar pehle se nisab ke maalik hain, to naya nakdi ya sona-chandi (jaise salary ya tohfa) usi purani date wale saal mein shamil ho jata hai, naya saal shuru nahi hota.</div></div>
      <div class="zk-hawl" id="zkNext"></div>
      <div class="tasbeeh-sound-toggle" style="margin-top:10px;">🔔 Yaad-dahani (30, 7, 1 din pehle aur us din)<div class="roza-mini ${(state.notif || {}).zkRem !== false ? 'on' : ''}" id="zkRemTg"><div class="roza-mini-knob"></div></div></div>
    </div>

    <div class="zk-card zk-info">
      <details class="zk-sec" open><summary>⏳ Zakat kab farz hoti hai?</summary><div class="zk-sc">${zkScene('calendar')}</div><ul class="zk-ul"><li><span>1️⃣</span><div>Pehle aap nisab ke barabar maal ke maalik banein (Maalik-e-Nisaab)</div></li><li><span>🌙</span><div>Us din se ek poora chaand ka saal (354 din ke aas-paas) guzre</div></li><li><span>✅</span><div>Saal ke aakhir mein bhi maal nisab ke barabar ho</div></li><li><span>🤲</span><div>Tab 2.5% Zakat farz hoti hai</div></li></ul><p>Saal ke beech maal kam-zyada hone se hawl nahi tootta, bas saal ke shuru aur aakhir mein nisab hona chahiye. Zakat farz hone se pehle ada karna theek nahi, aur farz hone ke baad deri karna gunah hai. Agar pehle Zakat de chuke hain to agla saal usi tareekh se ginein. Zakat ka saal Hijri (chaand) ke hisaab se hota hai, isliye tareekh Hijri aur English dono mein dikhayi gayi hai.</p></details>
      <details class="zk-sec" open><summary>📖 Kin cheezon par Zakat hai?</summary><div class="zk-sc">${zkScene('coins')}</div><ul class="zk-ul"><li><span>💰</span><div>Nakdi: haath mein, bank, wallet, UPI</div></li><li><span>🥇</span><div>Sona aur zewar</div></li><li><span>🥈</span><div>Chandi aur zewar</div></li><li><span>🏪</span><div>Tijarat ka maal</div></li><li><span>🤝</span><div>Wapas milne wala udhaar</div></li><li><span>📈</span><div>Tijarat ke liye liye gaye shares</div></li></ul><p>Maal par ek chaand ka saal guzarna zaroori hai.</p></details>
      <details class="zk-sec" open><summary>🚫 Kin par Zakat nahi?</summary><div class="zk-sc">${zkScene('house')}</div><ul class="zk-ul"><li><span>🏠</span><div>Rehne ka ghar</div></li><li><span>🚗</span><div>Zaati istemal ki gaadi</div></li><li><span>🛋️</span><div>Ghar ka saaman aur kapde</div></li><li><span>🛠️</span><div>Pesha-war auzaar (tools)</div></li></ul><p>Qarz minus karke hi hisaab hota hai.</p></details>
      <details class="zk-sec" open><summary>🤲 Zakat kise de sakte hain? (8 masarif)</summary><div class="zk-sc">${zkScene('hands')}</div><ul class="zk-ul"><li><span>🍞</span><div>Faqeer</div></li><li><span>🥣</span><div>Miskeen</div></li><li><span>📋</span><div>Zakat ke karkun</div></li><li><span>💞</span><div>Jinke dil jodne hon</div></li><li><span>🔓</span><div>Ghulam azad karna</div></li><li><span>🧾</span><div>Qarzdar</div></li><li><span>🕌</span><div>Allah ki raah mein</div></li><li><span>🧳</span><div>Musafir</div></li></ul><p>Qur'an (9:60) ke mutabiq. Zakat ada karte waqt <b>niyyat</b> zaroori hai aur maalik bana kar dena zaroori hai.</p></details>
      <details class="zk-sec" open><summary>🚷 Kise nahi de sakte?</summary><div class="zk-sc">${zkScene('family')}</div><ul class="zk-ul"><li><span>👪</span><div>Apne walidain aur dada-dadi</div></li><li><span>🧒</span><div>Aulad aur pota-pote</div></li><li><span>💍</span><div>Biwi ya shauhar</div></li><li><span>🌙</span><div>Sayyid (Bani Hashim), Hanafi mein</div></li><li><span>💼</span><div>Maaldaar jo nisab ka maalik ho</div></li></ul></details>
    </div>
    <div class="backup-note">Ye calculator ek madadgar andaaza hai. Sona-chandi ka bhaav aap ke shehar ke bazaar ke hisaab se thoda alag ho sakta hai. Kisi masle mein shak ho to apne mustanad aalim se zaroor poochhein.</div>
    <div class="zk-fab-wrap"><button type="button" class="zk-fab" id="zkFab"></button></div>`;
  const save = ()=> saveState();
  const paint = ()=>{
    document.getElementById('zkResult').innerHTML = zkResultHtml();
    const c = zkCalc(), fab = document.getElementById('zkFab');
    fab.innerHTML = c.gross <= 0 ? '🧮 Zakat ka hisaab dekhein ↓' : (c.due ? `🧮 Zakat ${zkFmt(c.zakat)} · hisaab dekhein ↓` : '🧮 Abhi Zakat farz nahi · hisaab dekhein ↓');
    fab.className = 'zk-fab' + (c.gross > 0 ? (c.due ? ' yes' : ' no') : '');
  };
  try{ if(window.IntersectionObserver){ const fab = document.getElementById('zkFab'); const io = new IntersectionObserver(es=>{ if(!document.body.contains(fab)){ io.disconnect(); return; } fab.parentNode.classList.toggle('hide', es[0].isIntersecting); }, { threshold:0.15 }); io.observe(document.getElementById('zkResult')); } }catch(e){}
  document.getElementById('zkFab').onclick = ()=> document.getElementById('zkResult').scrollIntoView({ behavior:'smooth', block:'center' });
  const noteEl = document.getElementById('zkPriceNote');
  const fetchBtn = document.getElementById('zkFetch');
  const drawNote = ()=>{
    const zz = zkState(), shortD = iso=> zkGreg(new Date(iso + 'T00:00:00'));
    fetchBtn.style.display = (zz.mode === 'est' || zz.mode === 'hawl') && zkBusy.k !== zz.mode ? '' : 'none';
    if(zz.mode === 'est'){
      noteEl.textContent = zkBusy.k === 'est' ? '⏳ Aaj/kal ka India bhaav aa raha hai...'
        : zz.latest && zz.latest.at ? `Aaj/kal ka India bhaav (₹ mein, ${zz.latest.day ? shortD(zz.latest.day) : new Date(zz.latest.at).toLocaleDateString('en-IN')} ka). Sonar ki dukaan ka bhaav duty ki wajah se thoda zyada ho sakta hai, chahein to upar badal lein.`
        : `Internet se bhaav nahi aaya, isliye ${ZK.EST.label} ke aas-paas ka andaaza lagaya hai (24K sona ₹${ZK.EST.gold.toLocaleString('en-IN')}/g, chandi ₹${ZK.EST.silver}/g). Dobara koshish karein ya khud likhein.`;
    } else if(zz.mode === 'hawl'){
      const rd = zkHawlRefDate();
      noteEl.textContent = zkBusy.k === 'hawl' ? '⏳ Us tareekh ka bhaav aa raha hai...'
        : zz.hawlP && zz.hawlP.date === rd ? `${shortD(rd)} (${zkHijri(new Date(rd + 'T00:00:00'))}) ka bhaav. Ye woh din hai jab aapka Zakat ka saal poora hua (ya Maalik-e-Nisaab bane). Sonar ki dukaan ka bhaav thoda zyada ho sakta hai.`
        : `${shortD(rd)} ka bhaav nahi aaya. Internet check karke "Bhaav dobara lein" dabayein, ya khud likhein.`;
    } else noteEl.textContent = 'Apne shehar ka aaj ka bhaav likhein.';
  };
  const showPrices = ()=>{ const zz = zkState(); document.getElementById('zkGoldP').value = Math.round(zz.gold); document.getElementById('zkSilverP').value = Math.round(zz.silver * 100) / 100; };
  const loadPrices = async (force)=>{
    const zz = zkState(), mode = zz.mode;
    if(mode === 'est'){
      if(!force && zz.latest && Date.now() - zz.latest.at < 6 * 3600000){ zz.gold = zz.latest.gold; zz.silver = zz.latest.silver; showPrices(); save(); drawNote(); paint(); return; }
      zkBusy.k = 'est'; drawNote();
      try{ const p = await zkFetchLatestAny(); zz.latest = { gold:Math.round(p.gold), silver:Math.round(p.silver * 100) / 100, day:p.day, at:Date.now() }; if(zz.mode === 'est'){ zz.gold = zz.latest.gold; zz.silver = zz.latest.silver; } }
      catch(e){ if(zz.mode === 'est' && !(zz.latest && zz.latest.at)){ zz.gold = ZK.EST.gold; zz.silver = ZK.EST.silver; } if(force) showToast('Bhaav nahi mil paya. Khud likhein.'); }
      zkBusy.k = ''; if(!document.getElementById('zkGoldP')) return; if(zz.mode === 'est') showPrices(); save(); drawNote(); paint();
    } else if(mode === 'hawl'){
      const rd = zkHawlRefDate(); if(!rd) return;
      if(!force && zz.hawlP && zz.hawlP.date === rd){ zz.gold = zz.hawlP.gold; zz.silver = zz.hawlP.silver; showPrices(); save(); drawNote(); paint(); return; }
      zkBusy.k = 'hawl'; drawNote();
      try{ const p = await zkFetchMetal(rd); zz.hawlP = { date:rd, gold:Math.round(p.gold), silver:Math.round(p.silver * 100) / 100 }; if(zz.mode === 'hawl'){ zz.gold = zz.hawlP.gold; zz.silver = zz.hawlP.silver; } }
      catch(e){ showToast('Us tareekh ka bhaav nahi mil paya.'); }
      zkBusy.k = ''; if(!document.getElementById('zkGoldP')) return; if(zz.mode === 'hawl') showPrices(); save(); drawNote(); paint();
    }
  };
  const hijNote = ()=>{ const z2 = zkState(), el = document.getElementById('zkHij'); el.innerHTML = z2.nisabDate ? `🌙 Hijri: <b>${zkHijri(new Date(z2.nisabDate + 'T00:00:00'))}</b>` : ''; };
  document.querySelectorAll('[data-rc]').forEach(b=> b.onclick = ()=>{
    const tip = document.getElementById('zkRcTip'), on = b.classList.contains('on');
    document.querySelectorAll('[data-rc]').forEach(x=> x.classList.remove('on'));
    if(on){ tip.textContent = ''; tip.classList.remove('show'); return; }
    b.classList.add('on'); tip.textContent = ZK_RECALL[+b.dataset.rc].d; tip.classList.add('show');
  });
  const dateNote = ()=>{
    const el = document.getElementById('zkNext'), zz = zkState();
    if(!zz.nisabDate){ el.innerHTML = ''; return; }
    const d0 = new Date(zz.nisabDate + 'T00:00:00'), end = zkHawlEnd(d0), days = Math.ceil((end - new Date()) / 86400000);
    el.innerHTML = `<div><small>🌱 Maalik-e-Nisaab bane</small><b>${zkHijri(d0)}</b><span>${zkGreg(d0)}</span></div>
      <div><small>🗓️ Zakat farz hogi (1 saal baad)</small><b>${zkHijri(end)}</b><span>${zkGreg(end)}</span></div>
      <p>${days > 0 ? `Abhi ${days} din baaqi hain. Is se pehle Zakat farz nahi.` : `Saal poora ho chuka hai. Aaj ke maal ka hisaab karke Zakat ada kar dein.`}</p>`;
  };
  document.querySelectorAll('#detailBody [data-k]').forEach(el=>{
    const h = ()=>{
      if(el.classList.contains('zk-money')){
        const digitsBefore = el.value.slice(0, el.selectionStart || 0).replace(/[^\d.]/g, '').length, txt = zkComma(el.value);
        el.value = txt; f[el.dataset.k] = txt.replace(/,/g, '');
        let c = 0, pos = 0; while(pos < txt.length && c < digitsBefore){ if(/[\d.]/.test(txt[pos])) c++; pos++; }
        try{ el.setSelectionRange(pos, pos); }catch(e){}
        const w = document.querySelector('[data-w="' + el.dataset.k + '"]'); if(w) w.textContent = zkWordsLbl(f[el.dataset.k]);
      } else f[el.dataset.k] = el.value;
      save(); paint();
    };
    el.addEventListener('input', h); el.addEventListener('change', h);
  });
  const setPrice = ()=>{ const zz = zkState(); zz.gold = zkNum(document.getElementById('zkGoldP').value) || zz.gold; zz.silver = zkNum(document.getElementById('zkSilverP').value) || zz.silver; };
  ['zkGoldP', 'zkSilverP'].forEach(id=>{
    document.getElementById(id).addEventListener('input', ()=>{ const zz = zkState(); if(zz.mode === 'est' || zz.mode === 'hawl'){ zz.mode = 'manual'; document.querySelectorAll('#zkMode button').forEach(b=> b.classList.toggle('on', b.dataset.m === 'manual')); } setPrice(); save(); drawNote(); paint(); });
  });
  document.querySelectorAll('#zkMode button').forEach(b=>{
    b.onclick = ()=>{
      const zz = zkState();
      if(b.dataset.m === 'hawl' && !zz.nisabDate){ showToast('Pehle neeche "Hawl" mein Maalik-e-Nisaab ki date chunein'); return; }
      zz.mode = b.dataset.m;
      document.querySelectorAll('#zkMode button').forEach(x=> x.classList.toggle('on', x === b));
      save(); drawNote(); paint(); if(zz.mode !== 'manual') loadPrices(false);
    };
  });
  fetchBtn.onclick = ()=> loadPrices(true);
  document.querySelectorAll('#zkBasis button').forEach(b=>{
    b.onclick = ()=>{ zkState().basis = b.dataset.b; document.querySelectorAll('#zkBasis button').forEach(x=> x.classList.toggle('on', x === b)); save(); paint(); };
  });
  document.getElementById('zkRemTg').onclick = e=>{
    if(!state.notif) state.notif = {}; state.notif.zkRem = state.notif.zkRem === false; saveState(); e.currentTarget.classList.toggle('on', state.notif.zkRem !== false);
    if(state.notif.zkRem !== false){ try{ if(window.Notification && Notification.permission === 'default') Notification.requestPermission(); }catch(x){} if(typeof nativeSchedule === 'function') nativeSchedule(true); if(typeof scheduleNotifs === 'function') scheduleNotifs(); }
    showToast(state.notif.zkRem !== false ? 'Yaad-dahani chalu' : 'Yaad-dahani band');
  };
  document.getElementById('zkPaid').onchange = e=>{ const zz = zkState(); zz.nisabDate = e.target.value; const hb = document.querySelector('#zkMode [data-m="hawl"]'); hb.classList.toggle('dis', !zz.nisabDate);
    if(!zz.nisabDate && zz.mode === 'hawl'){ zz.mode = 'est'; document.querySelectorAll('#zkMode button').forEach(x=> x.classList.toggle('on', x.dataset.m === 'est')); }
    save(); dateNote(); hijNote(); if(zz.mode === 'hawl' || zz.mode === 'est') loadPrices(false); if(typeof nativeSchedule === 'function') nativeSchedule(true); };
  document.getElementById('zkSave').onclick = ()=>{ if(zkCalc().gross <= 0){ showToast('Pehle apna maal likhein'); return; } zkSaveSheet(()=>{ renderZakat(); setTimeout(()=>{ const x = document.querySelector('.zk-logtot'); if(x) x.scrollIntoView({ behavior:'smooth', block:'center' }); }, 60); }); };
  zkWireLog(renderZakat);
  document.getElementById('zkShare').onclick = ()=>{ const c = zkCalc(); if(c.gross <= 0){ showToast('Pehle apna maal likhein'); return; } zkShareCard({ kind:'Zakat', title:c.due ? 'Zakat farz hai' : 'Abhi Zakat farz nahi', sub:c.due ? zkFmt(c.zakat) + ' (2.5%)' : 'Nisab tak ' + zkFmt(c.short) + ' kam', body:'Zakat wala kul maal ' + zkFmt(c.net) + ' · Nisab ' + zkFmt(c.nisab), plain:zkShareText() }); };
  document.getElementById('zkReset').onclick = async ()=>{
    if(!(await appConfirm('Likha hua saara hisaab saaf kar dein?', 'Haan, saaf karein'))) return;
    zkState().f = {}; save(); renderZakat();
  };
  drawNote(); dateNote(); hijNote(); paint();
  if(z.mode === 'est' || z.mode === 'hawl') loadPrices(false);
}

/* ---- Zakat record: a saved calculation, its payments (qist), and a plan for the 8 masarif ---- */
const ZK_MASARIF = [
  { k:'faqeer', ic:'🍞', n:'Faqeer' }, { k:'miskeen', ic:'🥣', n:'Miskeen' }, { k:'amil', ic:'📋', n:'Zakat ke karkun' }, { k:'muallafa', ic:'💞', n:'Dil jodne wale' },
  { k:'riqab', ic:'🔓', n:'Ghulam azad karna' }, { k:'gharim', ic:'🧾', n:'Qarzdar' }, { k:'sabil', ic:'🕌', n:'Allah ki raah mein' }, { k:'ibn', ic:'🧳', n:'Musafir' }
];
const zkMas = k => ZK_MASARIF.find(m=> m.k === k) || { ic:'🤲', n:'Zakat' };
function zkLog(){ if(!Array.isArray(state.zakatLog)) state.zakatLog = []; return state.zakatLog; }
const zkPaidOf = r => Array.isArray(r.pays) ? r.pays.reduce((a, x)=> a + (x.amt || 0), 0) : (r.paid || 0);
const zkISO = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const zkDateLbl = iso => { const d = new Date(iso + 'T00:00:00'); return isNaN(d) ? '' : zkHijri(d) + ' · ' + zkGreg(d); };
let zkOpenRec = '';
/* small sheet builder: fields = [{id,label,type,value,ph,money,options}] */
function zkSheet(title, fields, okLabel, onOk, extraHtml){
  const w = document.createElement('div'); w.className = 'app-confirm';
  const f = fields.map(x=> `<div class="zk-lrow"><label class="zk-sl">${x.label}</label>${x.chip ? `<button type="button" class="zk-fill" data-fill="${x.id}" data-v="${x.chip.val}">${x.chip.txt}</button>` : ''}</div>` + (x.options
    ? `<select class="bmf-in zk-sin" id="${x.id}">${x.options.map(o=>`<option value="${o[0]}"${o[0] === x.value ? ' selected' : ''}>${o[1]}</option>`).join('')}</select>`
    : `<input class="bmf-in zk-sin" id="${x.id}" ${x.type === 'date' ? 'type="date"' : 'inputmode="' + (x.money ? 'decimal' : 'text') + '"'} maxlength="60" value="${x.value == null ? '' : bmfEsc(x.value)}" placeholder="${x.ph || ''}">`)).join('');
  w.innerHTML = `<div class="info-card zk-sheet"><div class="info-text"><b>${title}</b></div>${f}${extraHtml || ''}<div class="ac-btns"><button class="ac-no">Rehne dein</button><button class="ac-yes">${okLabel}</button></div></div>`;
  document.body.appendChild(w);
  const g = id=> w.querySelector('#' + id), close = ()=> w.remove();
  w.querySelectorAll('[data-fill]').forEach(b=> b.onclick = ()=>{ const i = g(b.dataset.fill); i.value = zkComma(b.dataset.v); i.dispatchEvent(new Event('input')); });
  fields.filter(x=> x.money).forEach(x=>{ g(x.id).oninput = e=>{ e.target.value = zkComma(e.target.value); }; });
  w.querySelector('.ac-no').onclick = close; w.onclick = e=>{ if(e.target === w) close(); };
  w.querySelector('.ac-yes').onclick = ()=>{ const v = {}; fields.forEach(x=>{ v[x.id] = g(x.id).value; }); if(onOk(v, w) !== false) close(); };
  return w;
}
function zkSaveSheet(onDone){
  const c = zkCalc(), z = zkState(), today = new Date();
  zkSheet('💾 Zakat ka record save karein', [
    { id:'rName', label:'Naam', value:'Zakat ' + zkHP(today).y + ' AH' },
    { id:'rDate', label:'Hisaab ki tareekh', type:'date', value:zkISO(today) },
    { id:'rPaid', label:'Abhi kitni Zakat di? (₹)', money:true, value:'', ph:'0', chip:c.due ? { txt:'Farz ' + zkFmt(c.zakat), val:Math.round(c.zakat) } : null },
    { id:'rNote', label:'Note (zaroori nahi)', value:'', ph:'Jaise: masjid, madrasa, rishtedaar...' }
  ], 'Save karein', v=>{
    const name = v.rName.trim(); if(!name) return false;
    const paid = zkNum(v.rPaid), id = 'z' + Date.now().toString(36);
    zkLog().unshift({ id, name, date:v.rDate || zkISO(today), note:v.rNote.trim(), net:c.net, nisab:c.nisab, zakat:c.due ? c.zakat : 0, basis:z.basis, debts:c.debts,
      rows:c.rows.filter(r=> r.v > 0).map(r=>({ ic:r.ic, n:r.n, v:r.v })), pays:paid > 0 ? [{ id:'p' + Date.now().toString(36), date:v.rDate || zkISO(today), amt:paid, m:'', to:'', note:'' }] : [], plan:{} });
    zkOpenRec = id; saveState(); showToast('Record save ho gaya'); onDone();
  });
}
function zkPaySheet(r, onDone){
  const left = Math.max(0, Math.round(r.zakat - zkPaidOf(r)));
  zkSheet('➕ Qist / payment jodein', [
    { id:'pAmt', label:'Kitni Zakat di? (₹)', money:true, value:'', ph:'0', chip:left > 0 ? { txt:'Baaqi ' + zkFmt(left), val:left } : null },
    { id:'pDate', label:'Kab di?', type:'date', value:zkISO(new Date()) },
    { id:'pM', label:'Kis madd mein?', value:'', options:[['', '🤲 Tay nahi']].concat(ZK_MASARIF.map(m=>[m.k, m.ic + ' ' + m.n])) },
    { id:'pTo', label:'Kisko / kahan? (zaroori nahi)', value:'', ph:'Jaise: madrasa, kisi ka naam' }
  ], 'Jodein', v=>{
    const amt = zkNum(v.pAmt); if(!(amt > 0)) return false;
    if(!Array.isArray(r.pays)) r.pays = r.paid > 0 ? [{ id:'p0', date:r.date, amt:r.paid, m:'', to:'', note:'' }] : [];
    r.pays.push({ id:'p' + Date.now().toString(36), date:v.pDate || zkISO(new Date()), amt, m:v.pM, to:v.pTo.trim(), note:'' });
    r.pays.sort((a, b)=> a.date < b.date ? -1 : 1); saveState(); showToast('Qist jud gayi'); onDone();
  });
}
function zkPlanSheet(r, onDone){
  const eq = Math.round(r.zakat / 2);
  const rows = ZK_MASARIF.map(m=>`<div class="zk-pl"><label><input type="checkbox" data-pc="${m.k}" ${(r.plan && r.plan[m.k] > 0) ? 'checked' : ''}> ${m.ic} ${m.n}</label><input class="bmf-in zk-sin" data-pa="${m.k}" inputmode="decimal" placeholder="₹" value="${r.plan && r.plan[m.k] > 0 ? zkComma(r.plan[m.k]) : ''}"></div>`).join('');
  const w = zkSheet('🗂️ Baantne ka plan', [], 'Plan save karein', (v, ww)=>{
    const plan = {}; ww.querySelectorAll('[data-pa]').forEach(inp=>{ const n = zkNum(inp.value); if(n > 0) plan[inp.dataset.pa] = n; });
    r.plan = plan; saveState(); onDone();
  }, `<div class="zk-note" style="margin:6px 0 8px;">Zakat ${zkFmt(r.zakat)} ko kin kin mein baantna hai, tay kar lein.</div><div class="zk-pls">${rows}</div><button type="button" class="backup-btn secondary zk-eqb" id="zkEq">⚖️ Chune hue mein barabar baant dein</button>`);
  w.querySelectorAll('[data-pc]').forEach(cb=> cb.onchange = ()=>{ const inp = w.querySelector('[data-pa="' + cb.dataset.pc + '"]'); if(!cb.checked) inp.value = ''; });
  w.querySelector('#zkEq').onclick = ()=>{
    let ch = [...w.querySelectorAll('[data-pc]')].filter(c=> c.checked);
    if(!ch.length){ ['faqeer', 'miskeen'].forEach(k=>{ const c = w.querySelector('[data-pc="' + k + '"]'); c.checked = true; }); ch = [...w.querySelectorAll('[data-pc]')].filter(c=> c.checked); }
    const each = Math.floor(r.zakat / ch.length);
    ch.forEach((c, i)=>{ w.querySelector('[data-pa="' + c.dataset.pc + '"]').value = zkComma(i === ch.length - 1 ? Math.round(r.zakat - each * (ch.length - 1)) : each); });
  };
  w.querySelectorAll('[data-pa]').forEach(inp=> inp.addEventListener('input', ()=>{ w.querySelector('[data-pc="' + inp.dataset.pa + '"]').checked = zkNum(inp.value) > 0; }));
}
function zkRecBody(r){
  const paid = zkPaidOf(r), left = Math.max(0, r.zakat - paid), pct = r.zakat > 0 ? Math.min(100, Math.round(paid / r.zakat * 100)) : (paid > 0 ? 100 : 0);
  const pays = Array.isArray(r.pays) ? r.pays : (r.paid > 0 ? [{ id:'p0', date:r.date, amt:r.paid, m:'', to:'' }] : []);
  const plan = r.plan || {}, planKeys = ZK_MASARIF.filter(m=> plan[m.k] > 0), planTot = planKeys.reduce((a, m)=> a + plan[m.k], 0);
  const paidBy = k => pays.filter(x=> x.m === k).reduce((a, x)=> a + x.amt, 0);
  return `<div class="zk-recb">
    <div class="zk-prog"><div class="zk-bar"><i style="width:${pct}%"></i></div>
      <div class="zk-barlbl"><span>Di gayi ${zkFmt(paid)}</span><span>${left > 0.5 ? 'Baaqi ' + zkFmt(left) : (r.zakat > 0 ? '✅ Poori ada' : '')}</span></div></div>
    <div class="zk-recsub">🤲 Qist / payments</div>
    ${pays.length ? pays.map(x=>`<div class="zk-pay"><div><b>${zkFmt(x.amt)}</b><small>${zkMas(x.m).ic} ${x.m ? zkMas(x.m).n : 'Zakat'}${x.to ? ' · ' + bmfEsc(x.to) : ''}<br>${zkDateLbl(x.date)}</small></div><button type="button" data-pd="${r.id}|${x.id}" aria-label="Hatayein">✕</button></div>`).join('') : '<div class="zk-note" style="margin:0 0 6px;">Abhi koi payment nahi.</div>'}
    <button type="button" class="zk-addbtn" data-pa-add="${r.id}">＋ Qist / payment jodein</button>
    <div class="zk-recsub">🗂️ Baantne ka plan</div>
    ${planKeys.length ? planKeys.map(m=>{ const pd = paidBy(m.k), pc = Math.min(100, Math.round(pd / plan[m.k] * 100)); return `<div class="zk-plrow"><div><span>${m.ic} ${m.n}</span><b>${zkFmt(pd)} / ${zkFmt(plan[m.k])}</b></div><div class="zk-bar sm"><i style="width:${pc}%"></i></div></div>`; }).join('')
      + (planTot < r.zakat - 0.5 ? `<div class="zk-note" style="margin:4px 0;">Abhi ${zkFmt(r.zakat - planTot)} ka plan baaqi hai.</div>` : '') : '<div class="zk-note" style="margin:0 0 6px;">Zakat kin kin mein baantni hai, tay kar lein.</div>'}
    <button type="button" class="zk-addbtn" data-plan="${r.id}">🗂️ ${planKeys.length ? 'Plan badlein' : 'Plan banayein'}</button>
    <div class="zk-recsub">🧮 Hisaab</div>
    ${(r.rows || []).map(x=>`<div class="zk-l"><span>${x.ic} ${x.n}</span><b>${zkFmt(x.v)}</b></div>`).join('')}
    ${r.debts > 0 ? `<div class="zk-l zk-minus"><span>🧾 Qarz (minus)</span><b>− ${zkFmt(r.debts)}</b></div>` : ''}
    <div class="zk-l zk-tot"><span>Zakat wala kul maal</span><b>${zkFmt(r.net)}</b></div>
    <div class="zk-l"><span>📏 Nisab (${r.basis === 'gold' ? 'sona' : 'chandi'})</span><b>${zkFmt(r.nisab)}</b></div>
    <div class="zk-l"><span>🧮 Hisaab se Zakat (2.5%)</span><b>${zkFmt(r.zakat)}</b></div>
    ${r.note ? `<div class="zk-recn">📝 ${bmfEsc(r.note)}</div>` : ''}
    <div class="zk-recbtn"><button type="button" data-rpdf="${r.id}">📄 PDF</button><button type="button" data-rs="${r.id}">${SHARE_SVG} Share</button><button type="button" data-rd="${r.id}">🗑️</button></div></div>`;
}
function zkLogHtml(){
  const L0 = zkLog(), total = L0.reduce((a, r)=> a + zkPaidOf(r), 0);
  if(!L0.length) return `<div class="zk-card"><div class="zk-h"><span>📒</span> Zakat ka Record</div><div class="zk-note" style="margin:0;">Abhi koi record nahi. Hisaab karke "Record save karein" dabayein. Phir har saal ki Zakat, uski qiston aur baantne ka plan yahan jama rahega.</div></div>`;
  return `<div class="zk-card"><div class="zk-h"><span>📒</span> Zakat ka Record</div>
    <div class="zk-logtot"><small>Ab tak ada ki hui Zakat</small><b>${zkFmt(total)}</b><span>${L0.length} record</span></div>
    <button type="button" class="zk-addbtn" id="zkPdfAll">📄 Poore record ka PDF</button>
    ${L0.map(r=>{ const pd = zkPaidOf(r), left = Math.max(0, r.zakat - pd);
      return `<details class="zk-rec" data-id="${r.id}" ${zkOpenRec === r.id ? 'open' : ''}><summary><div><b>${bmfEsc(r.name)}</b><small>${zkDateLbl(r.date)}</small></div><span class="${r.zakat > 0 && left > 0.5 ? 'part' : ''}">${zkFmt(pd)}${r.zakat > 0 && left > 0.5 ? `<em>baaqi ${zkFmt(left)}</em>` : ''}</span></summary>${zkRecBody(r)}</details>`; }).join('')}
  </div>`;
}
function zkWireLog(redraw){
  const rec = id=> zkLog().find(x=> x.id === id);
  document.querySelectorAll('.zk-rec').forEach(d=> d.addEventListener('toggle', ()=>{ if(d.open) zkOpenRec = d.dataset.id; else if(zkOpenRec === d.dataset.id) zkOpenRec = ''; }));
  document.querySelectorAll('[data-rd]').forEach(b=> b.onclick = async ()=>{
    if(!(await appConfirm('Ye record hata dein?', 'Haan, hatayein'))) return;
    state.zakatLog = zkLog().filter(r=> r.id !== b.dataset.rd); saveState(); redraw();
  });
  document.querySelectorAll('[data-pa-add]').forEach(b=> b.onclick = ()=>{ const r = rec(b.dataset.paAdd); if(r){ zkOpenRec = r.id; zkPaySheet(r, redraw); } });
  document.querySelectorAll('[data-plan]').forEach(b=> b.onclick = ()=>{ const r = rec(b.dataset.plan); if(!r) return; if(!(r.zakat > 0)){ showToast('Is hisaab mein Zakat farz nahi thi'); return; } zkOpenRec = r.id; zkPlanSheet(r, redraw); });
  document.querySelectorAll('[data-pd]').forEach(b=> b.onclick = async ()=>{
    const [rid, pid] = b.dataset.pd.split('|'), r = rec(rid); if(!r) return;
    if(!(await appConfirm('Ye payment hata dein?', 'Haan, hatayein'))) return;
    if(!Array.isArray(r.pays)) r.pays = r.paid > 0 ? [{ id:'p0', date:r.date, amt:r.paid, m:'', to:'' }] : [];
    r.pays = r.pays.filter(x=> x.id !== pid); zkOpenRec = r.id; saveState(); redraw();
  });
  document.querySelectorAll('[data-rs]').forEach(b=> b.onclick = ()=>{
    const r = rec(b.dataset.rs); if(!r) return;
    const pays = Array.isArray(r.pays) ? r.pays : [];
    const plain = `${r.name}\n\n` + (r.rows || []).map(x=>`• ${x.n}: ${zkFmt(x.v)}`).join('\n') + (r.debts > 0 ? `\n• Qarz (minus): ${zkFmt(r.debts)}` : '') + `\n\nZakat wala kul maal: ${zkFmt(r.net)}\nZakat (2.5%): ${zkFmt(r.zakat)}\nDi gayi Zakat: ${zkFmt(zkPaidOf(r))}` + (pays.length ? '\n\nQisten:\n' + pays.map(x=>`• ${zkDateLbl(x.date)}: ${zkFmt(x.amt)}${x.m ? ' (' + zkMas(x.m).n + ')' : ''}${x.to ? ', ' + x.to : ''}`).join('\n') : '') + `\n\nWaqt24: iam-zain.github.io/waqt24`;
    zkShareCard({ kind:'Zakat', title:r.name, sub:'Zakat ' + zkFmt(r.zakat) + ' · Di gayi ' + zkFmt(zkPaidOf(r)), body:'Zakat wala kul maal ' + zkFmt(r.net) + (r.zakat - zkPaidOf(r) > 0.5 ? ' · Baaqi ' + zkFmt(r.zakat - zkPaidOf(r)) : ' · Poori ada'), plain });
  });
  document.querySelectorAll('[data-rpdf]').forEach(b=> b.onclick = ()=>{ const r = rec(b.dataset.rpdf); if(r) zkPdfShare([r], 'waqt24-' + String(r.name).replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase() + '.pdf'); });
  const all = document.getElementById('zkPdfAll'); if(all) all.onclick = ()=> zkPdfShare(zkLog().slice(), 'waqt24-zakat-record.pdf');
}

/* ---- PDF made in the browser (plain A4 pages, Helvetica, Latin text only: no library, nothing uploaded) ---- */
function zkPdfBuild(recs){
  const A = s=> String(s == null ? '' : s).replace(/₹/g, 'Rs. ').replace(/−/g, '-').replace(/[’‘]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, '-').replace(/·/g, '|').replace(/[^\x20-\x7E]/g, '').replace(/\s{2,}/g, ' ').trim();
  const esc = s=> A(s).replace(/([\\()])/g, '\\$1');
  const W = 595, H = 842, M = 48, pages = []; let cur = null, y = 0;
  const wid = (s, size, bold)=> { let w = 0; for(const ch of A(s)) w += ('0123456789'.includes(ch) ? .556 : ',. '.includes(ch) ? .278 : ch === '-' ? .333 : /[A-Z]/.test(ch) ? .68 : ch === 'i' || ch === 'l' || ch === 'j' || ch === 't' || ch === 'f' ? .26 : ch === 'm' || ch === 'w' ? .8 : .53) * (bold ? 1.06 : 1); return w * size; };
  const newPage = ()=>{ cur = []; pages.push(cur); y = H - M; };
  const text = (x, yy, s, size, bold, col, right)=>{ const t = esc(s); if(!t) return; const xx = right ? x - wid(s, size, bold) : x; cur.push(`BT ${col || '0.1 0.1 0.1'} rg /${bold ? 'F2' : 'F1'} ${size} Tf ${xx.toFixed(1)} ${yy.toFixed(1)} Td (${t}) Tj ET`); };
  const rect = (x, yy, w, h, col)=> cur.push(`${col} rg ${x.toFixed(1)} ${yy.toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)} re f`);
  const line = (yy)=> cur.push(`0.85 0.85 0.85 RG 0.5 w ${M} ${yy.toFixed(1)} m ${W - M} ${yy.toFixed(1)} l S`);
  const need = h=>{ if(y - h < 56) newPage(); };
  const row = (l, r, bold, col)=>{ need(16); text(M, y, l, 10, bold, col); text(W - M, y, r, 10, bold, col, true); y -= 15; };
  const now = new Date();
  newPage();
  rect(0, H - 84, W, 84, '0.11 0.42 0.32'); text(M, H - 40, 'Waqt24  |  Zakat Record', 20, true, '1 1 1'); text(M, H - 62, 'Hanafi fiqh ke mutabiq hisaab  |  ' + zkGreg(now) + '  (' + zkHijri(now) + ')', 9.5, false, '0.85 0.95 0.9');
  y = H - 112;
  const tot = recs.reduce((a, r)=> a + zkPaidOf(r), 0), due = recs.reduce((a, r)=> a + r.zakat, 0);
  row('Records', String(recs.length), true); row('Hisaab se kul Zakat', zkFmt(due), false); row('Ab tak di gayi Zakat', zkFmt(tot), true, '0.1 0.5 0.35'); y -= 6; line(y + 6); y -= 8;
  recs.forEach((r, idx)=>{
    need(120); if(idx > 0){ y -= 8; line(y + 6); y -= 10; }
    text(M, y, r.name, 15, true, '0.11 0.42 0.32'); y -= 16;
    text(M, y, 'Tareekh: ' + zkDateLbl(r.date), 9.5, false, '0.4 0.4 0.4'); y -= 18;
    (r.rows || []).forEach(x=> row(x.n, zkFmt(x.v)));
    if(r.debts > 0) row('Qarz / bills (minus)', '- ' + zkFmt(r.debts), false, '0.75 0.45 0.15');
    row('Zakat wala kul maal', zkFmt(r.net), true); row('Nisab (' + (r.basis === 'gold' ? 'sona 87.48 g' : 'chandi 612.36 g') + ')', zkFmt(r.nisab));
    row('Zakat (2.5%)', zkFmt(r.zakat), true);
    const pays = Array.isArray(r.pays) ? r.pays : (r.paid > 0 ? [{ date:r.date, amt:r.paid, m:'', to:'' }] : []), pd = zkPaidOf(r), left = Math.max(0, r.zakat - pd);
    y -= 4; need(40); text(M, y, 'Di gayi Zakat (qist / payments)', 11, true); y -= 16;
    if(!pays.length){ text(M, y, 'Abhi koi payment darj nahi.', 9.5, false, '0.4 0.4 0.4'); y -= 15; }
    pays.forEach(x=>{ need(16); text(M, y, zkDateLbl(x.date), 9.5); text(M + 250, y, (x.m ? zkMas(x.m).n : 'Zakat') + (x.to ? ' - ' + x.to : ''), 9.5, false, '0.35 0.35 0.35'); text(W - M, y, zkFmt(x.amt), 10, false, null, true); y -= 14; });
    row('Kul di gayi', zkFmt(pd), true, '0.1 0.5 0.35'); row(left > 0.5 ? 'Baaqi' : 'Status', left > 0.5 ? zkFmt(left) : 'Poori ada', true, left > 0.5 ? '0.75 0.45 0.15' : '0.1 0.5 0.35');
    const plan = r.plan || {}, pk = ZK_MASARIF.filter(m=> plan[m.k] > 0);
    if(pk.length){ y -= 4; need(40); text(M, y, 'Baantne ka plan', 11, true); y -= 16; pk.forEach(m=>{ const pdm = pays.filter(x=> x.m === m.k).reduce((a, x)=> a + x.amt, 0); row(m.n, zkFmt(pdm) + ' / ' + zkFmt(plan[m.k])); }); }
    if(r.note){ y -= 2; need(16); text(M, y, 'Note: ' + r.note, 9.5, false, '0.4 0.4 0.4'); y -= 14; }
  });
  pages.forEach((c, i)=>{ cur = c; text(M, 30, 'Waqt24 app se bana. Fiqh ke masle mein apne mustanad aalim se zaroor poochhein.', 8, false, '0.5 0.5 0.5'); text(W - M, 30, 'Page ' + (i + 1) + ' / ' + pages.length, 8, false, '0.5 0.5 0.5', true); });
  const objs = [];
  objs.push('<< /Type /Catalog /Pages 2 0 R >>');
  objs.push('<< /Type /Pages /Kids [' + pages.map((_, i)=> (5 + i * 2) + ' 0 R').join(' ') + '] /Count ' + pages.length + ' >>');
  objs.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
  objs.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
  pages.forEach((c, i)=>{
    const body = c.join('\n');
    objs.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${6 + i * 2} 0 R >>`);
    objs.push(`<< /Length ${body.length} >>\nstream\n${body}\nendstream`);
  });
  let out = '%PDF-1.4\n'; const off = [];
  objs.forEach((o, i)=>{ off.push(out.length); out += `${i + 1} 0 obj\n${o}\nendobj\n`; });
  const xr = out.length;
  out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n` + off.map(o=> String(o).padStart(10, '0') + ' 00000 n \n').join('') + `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xr}\n%%EOF`;
  const bytes = new Uint8Array(out.length); for(let i = 0; i < out.length; i++) bytes[i] = out.charCodeAt(i) & 255;
  return new Blob([bytes], { type:'application/pdf' });
}
async function zkPdfShare(recs, name){
  if(!recs.length){ showToast('Pehle koi record save karein'); return; }
  let blob; try{ blob = zkPdfBuild(recs); }catch(e){ console.warn(e); showToast('PDF nahi ban payi'); return; }
  const file = new File([blob], name, { type:'application/pdf' });
  try{ if(navigator.canShare && navigator.canShare({ files:[file] })){ await navigator.share({ files:[file], title:'Waqt24 Zakat Record' }); return; } }catch(e){ if(e && e.name === 'AbortError') return; }
  const url = URL.createObjectURL(blob), a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=> URL.revokeObjectURL(url), 3000); showToast('PDF download ho gayi');
}

/* ---- Reminders: 30, 7 and 1 day before the hawl completes, and on the day (9 am). Used by the web timers and the Android app. ---- */
function zkNextDue(){
  const z = zkState(); if(!z.nisabDate) return null;
  let d = zkHawlEnd(new Date(z.nisabDate + 'T00:00:00')); const t0 = new Date(); t0.setHours(0, 0, 0, 0);
  for(let i = 0; i < 60 && d < t0; i++) d = zkHawlEnd(d);
  return d;
}
function zakatReminders(day){
  const z = zkState(), n = state.notif || {}; if(!z.nisabDate || n.zkRem === false) return [];
  const due = zkNextDue(); if(!due) return [];
  const dd = new Date(day.getFullYear(), day.getMonth(), day.getDate()), diff = Math.round((due - dd) / 86400000);
  const txt = { 30:'Zakat ka saal 30 din mein poora hoga. Hisaab ki taiyari shuru karein.', 7:'Zakat ka saal 7 din mein poora hoga. Maal ka hisaab kar lein.', 1:'Kal aapki Zakat ka saal poora ho raha hai. Hisaab karke Zakat ada karne ki taiyari kar lein.', 0:'Aaj aapki Zakat ka saal poora hua. Hisaab karke Zakat ada kar dein.' }[diff];
  if(!txt) return [];
  return [{ at:new Date(day.getFullYear(), day.getMonth(), day.getDate(), 9, 0, 0), title:'🌙 ' + (diff === 0 ? 'Zakat ka din' : diff === 1 ? 'Zakat kal farz hogi' : 'Zakat ki yaad-dahani'), body:txt, key:'zakat' + zkISO(dd) }];
}

function zkShareCard(cfg){
  openCardShareChooser(Object.assign({ scene:(window.sceneByKey ? sceneByKey('coins') : ''), foot:'Waqt24 · Zakat Calculator' }, cfg));
}
