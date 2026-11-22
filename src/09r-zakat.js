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
function zkState(){
  if(!state.zakat || typeof state.zakat !== 'object') state.zakat = {};
  const z = state.zakat;
  if(!z.f) z.f = {};
  if(!z.mode) z.mode = 'est';
  if(!z.basis) z.basis = 'silver';
  if(!(z.gold > 0)) z.gold = ZK.EST.gold;
  if(!(z.silver > 0)) z.silver = ZK.EST.silver;
  return z;
}
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
async function zkFetchPrices(){
  const get = async (u)=>{ const ctl = new AbortController(); const t = setTimeout(()=> ctl.abort(), 9000); try{ const r = await fetch(u, { signal: ctl.signal }); if(!r.ok) throw new Error(r.status); return await r.json(); } finally{ clearTimeout(t); } };
  const [g, s, fx] = await Promise.all([get('https://api.gold-api.com/price/XAU'), get('https://api.gold-api.com/price/XAG'), get('https://open.er-api.com/v6/latest/USD')]);
  const inr = fx && fx.rates && fx.rates.INR;
  if(!(g && g.price > 0 && s && s.price > 0 && inr > 0)) throw new Error('bad data');
  return { gold: g.price / ZK.OZ_G * inr, silver: s.price / ZK.OZ_G * inr };
}
function renderZakat(){
  const z = zkState(), f = z.f;
  document.getElementById('detailTitle').textContent = L({ rur:'Zakat Calculator', en:'Zakat Calculator' });
  const inp = (key, ph, extra)=> `<input class="zk-in" inputmode="decimal" data-k="${key}" placeholder="${ph}" value="${f[key] != null ? f[key] : ''}" ${extra || ''}>`;
  const sel = (key, opts)=> `<select class="zk-sel" data-k="${key}">${opts.map(o=>`<option value="${o[0]}"${String(f[key] || opts[0][0]) === String(o[0]) ? ' selected' : ''}>${o[1]}</option>`).join('')}</select>`;
  const money = (key, ic, label, hint)=> `<div class="zk-row"><div class="zk-lbl"><span>${ic}</span><div><b>${label}</b>${hint ? `<small>${hint}</small>` : ''}</div></div><div class="zk-field"><i>₹</i>${inp(key, '0')}</div></div>`;
  document.getElementById('detailBody').innerHTML = `
    <div class="zk-hero"><div class="zk-hero-ic">🌙</div><div><div class="zk-hero-t">Zakat Calculator</div><div class="zk-hero-s">Hanafi fiqh ke mutabiq · 2.5% · nisab ke saath</div></div></div>

    <div class="zk-card">
      <div class="zk-h"><span>1</span> Sone aur chandi ka bhaav (₹ per gram)</div>
      <div class="zk-seg" id="zkMode">
        <button data-m="manual" class="${z.mode === 'manual' ? 'on' : ''}">✍️ Khud likhein</button>
        <button data-m="live" class="${z.mode === 'live' ? 'on' : ''}">🌐 Live bhaav</button>
        <button data-m="est" class="${z.mode === 'est' ? 'on' : ''}">📌 Andaaza</button>
      </div>
      <div class="zk-prices">
        <label><span>🥇 Sona (24K)</span><div class="zk-field"><i>₹</i><input class="zk-in" inputmode="decimal" id="zkGoldP" value="${Math.round(z.gold)}"></div></label>
        <label><span>🥈 Chandi (999)</span><div class="zk-field"><i>₹</i><input class="zk-in" inputmode="decimal" id="zkSilverP" value="${Math.round(z.silver * 100) / 100}"></div></label>
      </div>
      <div class="zk-note" id="zkPriceNote"></div>
      <button class="backup-btn zk-fetch" id="zkFetch" style="display:none;">🌐 Abhi ka bhaav lein</button>
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

    <div class="zk-card">
      <div class="zk-h"><span>📅</span> Hawl (saal ka hisaab)</div>
      <div class="zk-note" style="margin:0 0 8px;">Zakat tab farz hai jab nisab ke barabar maal par ek chaand ka poora saal (354 din) guzar jaye. Aakhri baar Zakat kab di?</div>
      <input type="date" class="zk-in zk-date" id="zkPaid" value="${z.lastPaid || ''}">
      <div class="zk-note" id="zkNext"></div>
    </div>

    <div class="zk-card zk-info">
      <details><summary>📖 Kin cheezon par Zakat hai?</summary><p>Nakdi, sona-chandi (zewar samet), tijarat ka maal, wapas milne wala udhaar, aur tijarat ke liye liye gaye shares. Maal par ek saal guzarna zaroori hai.</p></details>
      <details><summary>🚫 Kin par Zakat nahi?</summary><p>Rehne ka ghar, zaati istemal ki gaadi, ghar ka saaman, kapde, aur pesha-war auzaar (tools). Qarz minus karke hi hisaab hota hai.</p></details>
      <details><summary>🤲 Zakat kise de sakte hain? (8 masarif)</summary><p>Qur'an (9:60) ke mutabiq: faqeer, miskeen, zakat ke karkun, jinke dil jodne hon, ghulam azad karna, qarzdar, Allah ki raah mein, aur musafir. Zakat ada karte waqt <b>niyyat</b> zaroori hai aur maalik bana kar dena zaroori hai.</p></details>
      <details><summary>🚷 Kise nahi de sakte?</summary><p>Apne walidain, dada-dadi, aulad, pota-pote, aur biwi ya shauhar ko Zakat nahi di ja sakti. Hanafi mein Sayyid (Bani Hashim) ko bhi nahi. Maaldaar (jo nisab ka maalik ho) ko nahi.</p></details>
    </div>
    <div class="backup-note">Ye calculator ek madadgar andaaza hai. Sona-chandi ka bhaav aap ke shehar ke bazaar ke hisaab se thoda alag ho sakta hai. Kisi masle mein shak ho to apne mustanad aalim se zaroor poochhein.</div>
    <div style="height:30px;"></div>`;
  const save = ()=> saveState();
  const paint = ()=>{ document.getElementById('zkResult').innerHTML = zkResultHtml(); };
  const noteEl = document.getElementById('zkPriceNote');
  const fetchBtn = document.getElementById('zkFetch');
  const drawNote = ()=>{
    const zz = zkState();
    fetchBtn.style.display = zz.mode === 'live' ? '' : 'none';
    noteEl.textContent = zz.mode === 'est' ? `Andaaza: India mein ${ZK.EST.label} ke aas-paas ka bhaav (24K sona ₹${ZK.EST.gold.toLocaleString('en-IN')}/g, chandi ₹${ZK.EST.silver}/g). Bhaav roz badalta hai, apne shehar ka bhaav dekh kar badlein.`
      : zz.mode === 'live' ? (zz.pricesAt ? `Live bhaav (antarrashtriya spot) · ${new Date(zz.pricesAt).toLocaleString('en-IN')}. India ke bazaar ka bhaav duty ki wajah se thoda zyada hota hai.` : 'Neeche button dabakar abhi ka bhaav lein. Internet chahiye.')
      : 'Apne shehar ka aaj ka bhaav likhein.';
  };
  const dateNote = ()=>{
    const el = document.getElementById('zkNext'), zz = zkState();
    if(!zz.lastPaid){ el.textContent = ''; return; }
    const d = new Date(zz.lastPaid + 'T00:00:00'); d.setDate(d.getDate() + 354);
    const days = Math.ceil((d - new Date()) / 86400000);
    el.textContent = days > 0 ? `Agli Zakat ka saal ${d.toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })} ko poora hoga (${days} din baaqi).` : `Zakat ka saal poora ho chuka hai (${d.toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}). Hisaab karke Zakat ada kar dein.`;
  };
  document.querySelectorAll('#detailBody [data-k]').forEach(el=>{
    const h = ()=>{ f[el.dataset.k] = el.value; save(); paint(); };
    el.addEventListener('input', h); el.addEventListener('change', h);
  });
  const setPrice = ()=>{ const zz = zkState(); zz.gold = zkNum(document.getElementById('zkGoldP').value) || zz.gold; zz.silver = zkNum(document.getElementById('zkSilverP').value) || zz.silver; };
  ['zkGoldP', 'zkSilverP'].forEach(id=>{
    document.getElementById(id).addEventListener('input', ()=>{ const zz = zkState(); if(zz.mode === 'est'){ zz.mode = 'manual'; document.querySelectorAll('#zkMode button').forEach(b=> b.classList.toggle('on', b.dataset.m === 'manual')); } setPrice(); save(); drawNote(); paint(); });
  });
  document.querySelectorAll('#zkMode button').forEach(b=>{
    b.onclick = ()=>{
      const zz = zkState(); zz.mode = b.dataset.m;
      if(zz.mode === 'est'){ zz.gold = ZK.EST.gold; zz.silver = ZK.EST.silver; document.getElementById('zkGoldP').value = zz.gold; document.getElementById('zkSilverP').value = zz.silver; }
      document.querySelectorAll('#zkMode button').forEach(x=> x.classList.toggle('on', x === b));
      save(); drawNote(); paint();
      if(zz.mode === 'live' && !zz.pricesAt) fetchBtn.click();
    };
  });
  fetchBtn.onclick = async ()=>{
    fetchBtn.disabled = true; fetchBtn.textContent = '⏳ Bhaav aa raha hai...';
    try{
      const p = await zkFetchPrices(); const zz = zkState();
      zz.gold = Math.round(p.gold); zz.silver = Math.round(p.silver * 100) / 100; zz.pricesAt = Date.now(); zz.mode = 'live'; save();
      document.getElementById('zkGoldP').value = zz.gold; document.getElementById('zkSilverP').value = zz.silver;
      showToast('Live bhaav aa gaya');
    }catch(e){ showToast('Live bhaav nahi mil paya. Khud likhein ya Andaaza chunein.'); }
    fetchBtn.disabled = false; fetchBtn.textContent = '🌐 Abhi ka bhaav lein'; drawNote(); paint();
  };
  document.querySelectorAll('#zkBasis button').forEach(b=>{
    b.onclick = ()=>{ zkState().basis = b.dataset.b; document.querySelectorAll('#zkBasis button').forEach(x=> x.classList.toggle('on', x === b)); save(); paint(); };
  });
  document.getElementById('zkPaid').onchange = e=>{ zkState().lastPaid = e.target.value; save(); dateNote(); };
  document.getElementById('zkShare').onclick = ()=>{ const c = zkCalc(); if(c.gross <= 0){ showToast('Pehle apna maal likhein'); return; } shareText(zkShareText()); };
  document.getElementById('zkReset').onclick = async ()=>{
    if(!(await appConfirm('Likha hua saara hisaab saaf kar dein?', 'Haan, saaf karein'))) return;
    zkState().f = {}; save(); renderZakat();
  };
  drawNote(); dateNote(); paint();
}
