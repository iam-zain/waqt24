/* ===== "4 Tasveer, 1 Surah" =====
   114 surahs, 4 small original SVG pictures each (no faces; no pictures of prophets, angels or other sacred figures: a symbol such as a staff, an ark or a lamp stands in).
   The pictures are memory aids only, taken from the user's list of themes; they are not tafseer. */
const SPM = (()=>{
  const e = (cx, cy, rx, ry, f, x)=> `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${f}"${x || ''}/>`;
  const c = (cx, cy, r, f, x)=> `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${f}"${x || ''}/>`;
  const r = (x, y, w, h, f, rx)=> `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${f}"${rx ? ` rx="${rx}"` : ''}/>`;
  const p = (d, f, x)=> `<path d="${d}" fill="${f}"${x || ''}/>`;
  const l = (d, s, w)=> `<path d="${d}" fill="none" stroke="${s}" stroke-width="${w || 3}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const wv = y=> l(`M0 ${y}q12-8 25 0t25 0t25 0t25 0t25 0t25 0t25 0t25 0`, '#fdfdfb', 2);
  const S = {
    dua: ['#efe6d8', c(100, 44, 26, '#f6e7a6', ' opacity=".7"') + p('M52 52q6 34 48 34t48-34q-10 8-24 4-6-18-24-18t-24 18q-14 4-24-4z', '#e8c8a0', ' stroke="#b8905a" stroke-width="2"') + l('M80 64q20 10 40 0', '#b8905a', 2)],
    road: ['#dbe9f4', r(0, 76, 200, 34, '#8fbf7a') + p('M82 110L94 50h12l12 60z', '#7d8793') + l('M100 56v8M100 72v10M100 90v14', '#fdfdfb', 3) + c(100, 40, 14, '#f6a933')],
    desert: ['#fbe5b8', c(150, 26, 12, '#f6a933') + p('M0 80q50-30 100-6t100-10v46H0z', '#d9b66a') + p('M0 96q60-20 110-4t90-8v26H0z', '#c9a04a')],
    staff: ['#efe6d8', l('M70 102L124 22q8-14 22-6', '#8d5b2e', 7) + l('M92 70l10 6', '#6f4720', 3)],
    tree: ['#e8f0e2', r(94, 56, 12, 44, '#7a5a37') + c(100, 40, 28, '#4f9a4f') + c(80, 52, 16, '#5aa85a') + c(120, 52, 16, '#5aa85a') + c(94, 34, 4, '#c0302f') + c(112, 44, 4, '#c0302f')],
    cradle: ['#f1e6ee', p('M48 56h104q-6 32-52 32T48 56z', '#c9a066') + e(100, 56, 52, 8, '#e3c9a0') + e(100, 52, 34, 10, '#fdfdfb') + l('M46 98q54 12 108 0', '#8d5b2e', 4)],
    scale: ['#efe9dd', r(97, 20, 6, 72, '#8a6c12') + r(70, 90, 60, 8, '#8a6c12', 3) + l('M52 34h96', '#8a6c12', 4) + l('M52 34L40 62M52 34l12 28M148 34l-12 28M148 34l12 28', '#8a6c12', 2) + p('M34 62h36q-4 12-18 12T34 62z', '#c9a227') + p('M130 62h36q-4 12-18 12t-18-12z', '#c9a227')],
    bread: ['#efe3cc', e(100, 62, 50, 26, '#d9a05a') + l('M70 52l16 20M96 48l16 24M122 50l14 20', '#b57a2e', 4)],
    ruins: ['#e6e0d4', r(0, 88, 200, 22, '#c9bfa8') + r(34, 40, 18, 50, '#bfb49a') + p('M34 40l6-10 6 6 6-6v10z', '#bfb49a') + r(88, 58, 18, 32, '#bfb49a') + r(130, 30, 18, 60, '#bfb49a') + p('M130 30l8-8 10 10z', '#bfb49a') + e(70, 92, 12, 5, '#a89c82') + e(160, 94, 14, 5, '#a89c82')],
    chest: ['#efe6d8', r(48, 52, 104, 44, '#8d5b2e', 4) + p('M48 52q0-28 52-28t52 28z', '#a06c36') + r(94, 56, 12, 16, '#c9a227', 2) + l('M48 66h104', '#6f4720', 3) + c(70, 98, 5, '#c9a227') + c(130, 98, 5, '#c9a227') + c(110, 100, 4, '#c9a227')],
    tent: ['#fbe5b8', r(0, 84, 200, 26, '#d9b66a') + p('M30 90L100 30l70 60z', '#b8905a') + p('M86 90l14-34 14 34z', '#6f4720') + l('M30 90L100 30l70 60', '#8d5b2e', 3)],
    scroll: ['#efe9dd', r(50, 24, 100, 62, '#f6edd2') + e(50, 55, 8, 31, '#d9c9a0') + e(150, 55, 8, 31, '#d9c9a0') + l('M66 40h68M66 52h68M66 64h50', '#8a7a5a', 3)],
    boat: ['#d6e9f5', r(0, 70, 200, 40, '#4a8fc0') + p('M50 66h100l-14 22H64z', '#8d5b2e') + r(98, 22, 4, 44, '#6f4720') + p('M102 24l36 36h-36z', '#fdfdfb') + wv(76) + wv(92)],
    ark: ['#d6e9f5', r(0, 74, 200, 36, '#4a8fc0') + p('M30 70h140l-18 22H48z', '#8d5b2e') + r(62, 42, 76, 28, '#a06c36') + p('M56 44l44-22 44 22z', '#6f4720') + r(92, 52, 16, 18, '#e8c37a') + wv(80) + wv(96)],
    flood: ['#b9d3e8', r(0, 60, 200, 50, '#4a8fc0') + wv(64) + wv(78) + wv(92) + p('M80 62l20-14 20 14z', '#8d5b2e') + r(88, 62, 24, 10, '#6f4720')],
    well: ['#e8e4d8', e(100, 80, 44, 12, '#a89c82') + r(56, 56, 88, 24, '#bfb49a') + e(100, 56, 44, 10, '#6f6a5a') + e(100, 56, 36, 7, '#2b3a4a') + r(60, 18, 6, 44, '#6f4720') + r(134, 18, 6, 44, '#6f4720') + p('M54 22l46-14 46 14z', '#8d5b2e') + l('M100 22v26', '#8d5b2e', 2) + r(94, 46, 12, 10, '#a06c36', 2)],
    palace: ['#dbe9f4', r(0, 90, 200, 20, '#8fbf7a') + r(50, 52, 100, 40, '#f0e2c0') + p('M80 52q20-34 40 0z', '#2f8f8a') + c(100, 22, 3, '#c9a227') + r(38, 40, 16, 52, '#f0e2c0') + p('M38 40l8-16 8 16z', '#2f8f8a') + r(146, 40, 16, 52, '#f0e2c0') + p('M146 40l8-16 8 16z', '#2f8f8a') + p('M90 92V74q10-12 20 0v18z', '#6f4720')],
    flame: ['#2d3446', p('M100 14q30 30 20 56q-6 24-20 28q-14-4-20-28q-10-26 20-56z', '#f08a24') + p('M100 38q16 20 10 38q-4 14-10 16q-6-2-10-16q-6-18 10-38z', '#f6d24a')],
    flowers: ['#e8f0e2', [[56, '#e0709f'], [100, '#e8c34a'], [146, '#9b6fd6']].map(a=> l(`M${a[0]} 100V56`, '#4f9a4f', 3) + [0, 1, 2, 3, 4].map(k=> c(a[0] + 12 * Math.cos(k * 1.257), 50 + 12 * Math.sin(k * 1.257), 8, a[1])).join('') + c(a[0], 50, 6, '#fdf2b0')).join('')],
    cave: ['#cfc7b8', p('M0 110V70q40-60 100-60t100 60v40z', '#8a8272') + p('M64 110V78q36-50 72 0v32z', '#2b2b33')],
    lamp: ['#2b2f43', p('M62 74q0-12 12-12h52q12 0 12 12q0 14-38 14T62 74z', '#c9a227') + p('M126 66q20-4 24 8q-14 0-22 4z', '#c9a227') + p('M100 62q14-16 0-34q-14 18 0 34z', '#f6d24a') + r(84, 88, 32, 6, '#8a6c12', 3)],
    throne: ['#efe0c0', r(62, 20, 76, 50, '#c9a227', 6) + r(70, 28, 60, 34, '#a8821a', 4) + r(54, 66, 92, 16, '#c9a227', 4) + r(60, 82, 10, 20, '#8a6c12') + r(130, 82, 10, 20, '#8a6c12') + c(100, 24, 5, '#c0302f')],
    basket: ['#d6e9f5', r(0, 62, 200, 48, '#4a8fc0') + p('M60 54h80q-4 30-40 30T60 54z', '#c9a066') + e(100, 54, 40, 6, '#e3c9a0') + wv(70) + wv(88)],
    city: ['#dbe9f4', r(0, 90, 200, 20, '#a89c82') + [[20, 44, 26], [50, 28, 22], [78, 52, 22], [106, 34, 26], [138, 58, 22], [164, 40, 24]].map(a=> r(a[0], a[1] + 14, a[2], 76 - a[1], '#d9cfba') + r(a[0] + 6, a[1] + 24, 5, 6, '#8a7a5a')).join('')],
    shield: ['#e6e9ef', p('M100 14l44 14v30q0 30-44 44q-44-14-44-44V28z', '#5a6f9a') + p('M100 24l34 11v23q0 22-34 34q-34-12-34-34V35z', '#8aa0cf')],
    bird: ['#dbe9f4', p('M44 60q30-30 56 0q26-30 56 0q-30-10-56 14q-26-24-56-14z', '#6f5a3a') + e(100, 66, 6, 10, '#6f5a3a')],
    cloud: ['#cfdbe6', c(70, 56, 24, '#fdfdfb') + c(104, 46, 30, '#fdfdfb') + c(138, 58, 22, '#fdfdfb') + r(70, 56, 68, 22, '#fdfdfb')],
    gate: ['#efe6d8', r(40, 24, 120, 76, '#c9bfa8') + p('M70 100V58q30-44 60 0v42z', '#2b2b33') + r(34, 20, 132, 8, '#a89c82')],
    ladder: ['#dbe9f4', l('M76 100L88 12M124 100L112 12', '#8d5b2e', 5) + [28, 46, 64, 82].map(y=> l(`M${82 - (y - 12) / 8} ${y}h${36 + (y - 12) / 4}`, '#8d5b2e', 4)).join('') + p('M30 30l6-6 6 6z', '#f6e7a6')],
    stairs: ['#e6e9ef', [0, 1, 2, 3, 4].map(i=> r(30 + i * 28, 90 - i * 14, 28, 20 + i * 14, ['#c9bfa8', '#bfb49a'][i % 2])).join('') + c(170, 24, 10, '#f6a933')],
    heart: ['#f6e3e3', p('M100 90C50 56 44 26 70 22q22 0 30 20q8-20 30-20c26 4 20 34-30 68z', '#d9534f')],
    calendar: ['#efe9dd', r(52, 18, 96, 80, '#fdfdfb', 6) + r(52, 18, 96, 20, '#d9534f', 6) + [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(i=> c(66 + (i % 4) * 22, 52 + Math.floor(i / 4) * 16, 4, i === 5 ? '#2f8f8a' : '#cfd6dd')).join('')],
    clock: ['#efe9dd', c(100, 56, 40, '#fdfdfb', ' stroke="#8a6c12" stroke-width="5"') + l('M100 56V32M100 56l18 10', '#2b2b33', 4) + c(100, 56, 4, '#2b2b33')],
    bones: ['#efe6d8', l('M56 82L144 30M56 30l88 52', '#fdfdfb', 8).replace('stroke="#fdfdfb"', 'stroke="#ece3d0" stroke="#fdfdfb"') + [[56, 82], [144, 30], [56, 30], [144, 82]].map(a=> c(a[0], a[1], 8, '#fdfdfb', ' stroke="#cfc4a8" stroke-width="2"')).join('')],
    cracks: ['#d9b66a', l('M100 10l-10 24 16 14-14 20 12 18-4 14M60 30l20 8M140 40l-22 6M46 80l28-4M150 84l-26-6', '#6f4a1a', 3)],
    bricks: ['#efe6d8', [0, 1, 2, 3, 4].map(i=> [0, 1, 2, 3].map(j=> r(20 + j * 44 + (i % 2) * 22, 16 + i * 18, 40, 15, '#c0704a', 2)).join('')).join('')],
    flag: ['#dbe9f4', r(0, 90, 200, 20, '#8fbf7a') + r(54, 14, 5, 80, '#6f4720') + p('M59 18h80l-14 16 14 16H59z', '#d9534f')],
    rope: ['#efe6d8', l('M50 90q-8-40 30-44t50 16q16 30-20 32T70 60q10-34 40-30', '#b8905a', 8) + l('M50 90q-8-40 30-44t50 16q16 30-20 32T70 60q10-34 40-30', '#8d5b2e', 2)],
    anvil: ['#e6e9ef', p('M50 56h80q10 0 22-10v12q-12 10-34 12v10h14v10H72V80h14V70q-22-2-36-14z', '#4a4f5a') + l('M142 24l-26 26', '#8d5b2e', 6) + r(132, 14, 22, 12, '#2b2f3a', 2)],
    moth: ['#2d3446', p('M100 20q26 40 18 58q-6 16-18 18q-12-2-18-18q-8-18 18-58z', '#f08a24', ' opacity=".8"') + [[56, 40], [150, 50], [66, 80], [140, 84]].map(a=> p(`M${a[0]} ${a[1]}q-10-10-14 0q4 8 14 0q10 8 14 0q-4-10-14 0z`, '#e8e0c8')).join('')],
    graves: ['#e6e0d4', r(0, 88, 200, 22, '#a8b890') + [30, 80, 130].map(x=> p(`M${x} 90V54q0-16 16-16t16 16v36z`, '#bfb49a') + l(`M${x + 8} 56h16`, '#8a7a5a', 2)).join('')],
    arsad: ['#efe9dd', '<text x="100" y="86" text-anchor="middle" font-size="86" font-family="serif" fill="#2f6f6a">ص</text>'],
    arqaf: ['#efe9dd', '<text x="100" y="86" text-anchor="middle" font-size="86" font-family="serif" fill="#2f6f6a">ق</text>'],
    one: ['#fbe5b8', c(100, 56, 44, '#f6e7a6', ' opacity=".8"') + '<text x="100" y="84" text-anchor="middle" font-size="80" font-weight="800" font-family="sans-serif" fill="#8a6c12">1</text>'],
    smoke: ['#4a4f5a', c(80, 70, 22, '#8a8f98') + c(110, 54, 28, '#9aa0aa') + c(136, 76, 22, '#8a8f98') + c(100, 32, 18, '#aab0ba')],
    wind: ['#dbe9f4', l('M24 36h110q18 0 18-14M24 58h140q20 0 20 16t-18 12M24 80h90q16 0 16 12', '#6f9fd0', 4)],
    footprints: ['#efe3cc', [[70, 80], [92, 58], [114, 38]].map((a, i)=> e(a[0], a[1], 8, 13, '#8d6b3a', ` transform="rotate(${20 - i * 6} ${a[0]} ${a[1]})"`)).join('') + [[104, 86], [126, 64], [148, 44]].map((a, i)=> e(a[0], a[1], 8, 13, '#a8864f', ` transform="rotate(${20 - i * 6} ${a[0]} ${a[1]})"`)).join('')],
    map: ['#efe6d8', p('M30 24l46-8 48 10 46-8v68l-46 8-48-10-46 8z', '#f6edd2', ' stroke="#b8905a" stroke-width="2"') + l('M76 16v68M124 26v68', '#d9c9a0', 2) + l('M44 70q30-30 52-8t56-30', '#d9534f', 3)],
    trench: ['#e6d8b8', r(0, 70, 200, 40, '#c9a04a') + r(40, 66, 120, 30, '#4a3a2a') + p('M40 66h120l-10 8H50z', '#6f5a3a')],
    drop: ['#dbe9f4', p('M100 16q40 48 30 66q-8 16-30 16t-30-16q-10-18 30-66z', '#4a8fc0') + e(86, 70, 6, 10, '#9fd0ee')],
    mats: ['#efe6d8', [0, 1].map(j=> [0, 1, 2, 3].map(i=> r(18 + i * 44, 16 + j * 48, 36, 40, ['#2f8f8a', '#2f6f9a', '#8a5a34', '#5aa85a'][(i + j) % 4], 4) + p(`M${28 + i * 44} ${50 + j * 48}v-18q8-12 16 0v18z`, '#e9d9a6')).join('')).join('')],
    comb: ['#f6ecd2', Array.from({ length: 12 }, (_, i)=> { const x = 50 + (i % 4) * 26 + (Math.floor(i / 4) % 2) * 13, y = 24 + Math.floor(i / 4) * 24; return `<polygon points="${[0, 1, 2, 3, 4, 5].map(k=> `${(x + 13 * Math.cos(k * Math.PI / 3 + .52)).toFixed(1)},${(y + 13 * Math.sin(k * Math.PI / 3 + .52)).toFixed(1)}`).join(' ')}" fill="#f0b83a" stroke="#c98a2b" stroke-width="2"/>`; }).join('')],
    web: ['#ece8f0', l('M100 8v94M20 55h160M36 20l128 70M164 20L36 90', '#b8b2c8', 1.5) + [14, 28, 42].map(k=> `<polygon points="${[0, 1, 2, 3, 4, 5, 6, 7].map(i=> `${(100 + k * 1.5 * Math.cos(i * Math.PI / 4)).toFixed(1)},${(55 + k * Math.sin(i * Math.PI / 4)).toFixed(1)}`).join(' ')}" fill="none" stroke="#b8b2c8" stroke-width="1.5"/>`).join('')],
    ingot: ['#e6e9ef', p('M40 80l20-24h80l20 24z', '#7d8793') + p('M52 56l12-16h72l12 16z', '#9aa4b0') + p('M70 40l10-12h40l10 12z', '#b4bdc8')],
    pillars: ['#fbe5b8', r(0, 90, 200, 20, '#d9b66a') + [30, 66, 102, 138].map(x=> r(x, 24, 14, 66, '#f0e2c0') + r(x - 4, 20, 22, 7, '#e0cfa0') + r(x - 4, 88, 22, 7, '#e0cfa0')).join('')]
  };
  const fix = k=> S[k] ? `<svg class="kh-geosvg" viewBox="0 0 200 110" role="img" aria-hidden="true"><rect width="200" height="110" fill="${S[k][0]}"/>${S[k][1]}</svg>` : '';
  return { keys: Object.keys(S), svg: k=> chVary(fix(k)) };
})();
/* picture of a key: an existing Chitra icon, a Maqamat scene ("GA:aqsa") or a new motif above */
function spPic(k){ return k.startsWith('GA:') ? GA.svg(k.slice(3)) : CI.ids.includes(k) ? CI.svg(k) : SPM.svg(k); }
/* 4 pictures per surah, in the order they are revealed (the first two are the easier ones) */
const SP_PICS = [
 ['quran','dua','road','wake'],['gaay','desert','coin','staff'],['house','cradle','khajoor','pahaad'],['abaya','house','scale','coin'],['plate','bread','tray','angoor'],
 ['gaay','ram','oont','doodh'],['pahaad','tree','staff','ruins'],['chest','coin','tent','mats'],['dua','gumbad','oont','scroll'],['machhli','samandar','boat','baarish'],
 ['ark','flood','ruins','wind'],['well','thobe','sitare','palace'],['cloud','bijli','baarish','pahaad'],['kiswa','desert','flame','house'],['pahaad','ruins','desert','door'],
 ['makkhi','comb','flowers','shahad'],['chand','GA:aqsa','sitare','road'],['cave','dog','machhli','baagh'],['khajoor','cradle','abaya','janamaz'],['staff','flame','samandar','tree'],
 ['ark','machhli','sitare','scroll'],['kiswa','ihram','ram','pahaad'],['drop','boat','ram','janamaz'],['lamp','mashrabiya','abaya','suraj'],['quran','scale','baarish','sitare'],
 ['qalam','staff','samandar','oont'],['cheenti','hudhud','throne','glass'],['basket','cradle','palace','staff'],['makdi','web','house','cave'],['ruins','mosaic','map','wake'],
 ['lamp','cradle','tree','samandar'],['janamaz','sitare','beej','quran'],['city','trench','shield','house'],['palace','bird','throne','baagh'],['bird','cloud','pahaad','baarish'],
 ['house','scroll','sitare','baagh'],['mats','bird','ram','sitare'],['arsad','horse','pahaad','throne'],['mats','gate','pahaad','quran'],['dua','chand','palace','scroll'],
 ['quran','pahaad','sitare','suraj'],['carpet','mats','quran','pahaad'],['coin','palace','throne','moti'],['smoke','flame','chand','ruins'],['janamaz','footprints','quran','samandar'],
 ['desert','ruins','oont','wind'],['quran','nadi','shield','mats'],['gate','kiswa','scroll','wake'],['house','door','carpet','mats'],['arqaf','pahaad','baagh','sitare'],
 ['wind','desert','cloud','plate'],['pahaad','quran','samandar','cloud'],['sitare','chand','sidr','lamp'],['chand','sitare','boat','ruins'],['anar','scale','nadi','moti'],
 ['mats','baagh','flame','sitare'],['ingot','anvil','scale','baarish'],['abaya','carpet','mats','house'],['mats','khajoor','city','suraj'],['abaya','eidi','oont','mats'],
 ['mats','bricks','road','flag'],['gumbad','mats','calendar','quran'],['heart','door','glass','mats'],['scale','house','coin','mats'],['scroll','house','calendar','baarish'],
 ['shahad','house','abaya','door'],['sitare','chand','throne','nadi'],['qalam','davaat','baagh','scroll'],['scale','pahaad','cracks','quran'],['stairs','ladder','sitare','janamaz'],
 ['ark','baarish','flood','wind'],['desert','chand','quran','flame'],['carpet','sitare','quran','janamaz'],['abaya','pahaad','flag','flame'],['bones','suraj','cracks','sitare'],
 ['drop','nadi','plate','baagh'],['wind','cloud','bird','flame'],['pahaad','baarish','beej','chand'],['sitare','staff','palace','wind'],['quran','plate','door','lamp'],
 ['suraj','sitare','oont','chand'],['cracks','sitare','samandar','graves'],['scale','tent','ingot','glass'],['sitare','chand','cracks','quran'],['sitare','chand','trench','flame'],
 ['sitare','chand','drop','nadi'],['pahaad','beej','sitare','quran'],['oont','pahaad','sitare','baagh'],['wake','pillars','ruins','suraj'],['kiswa','pahaad','road','plate'],
 ['suraj','chand','oont','desert'],['chand','flame','road','coin'],['suraj','house','bowl','wake'],['heart','chest','pahaad','stairs'],['anjeer','zaitoon','pahaad','city'],
 ['quran','qalam','drop','davaat'],['qadr','sitare','quran','lamp'],['quran','scroll','mats','janamaz'],['cracks','ruins','footprints','pahaad'],['horse','wind','wake','footprints'],
 ['scale','pahaad','flame','moth'],['coin','house','graves','tasbih'],['clock','suraj','road','mats'],['coin','chest','flame','tasbih'],['hathi','bird','kiswa','desert'],
 ['oont','thobe','suraj','kiswa'],['bowl','janamaz','glass','coin'],['nadi','samandar','janamaz','ram'],['kiswa','janamaz','quran','road'],['mats','gate','gumbad','dua'],
 ['rope','khajoor','flame','house'],['one','suraj','wake','moti'],['wake','sitare','chand','dua'],['heart','mats','wind','door']
];
