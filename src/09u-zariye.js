/* ============================================================
   SEEKHNE KE ZARIYE: recommended YouTube channels, series, movies, books, podcasts, websites, kids' content, courses.
   The tab and its sections are ready; ZARIYE_ITEMS is empty on purpose and is filled later from a reviewed list.
   An item looks like:
     { id:'unique-id', cat:'youtube', t:'Naam', why:'Ek line mein kyun dekhein', by:'Kis ka / channel', lang:['ur','hi'], level:'Beginner', url:'https://...', checked:'2026-11' }
   Optional: facts:['5 seasons', '150 episodes'] (big boxes at the top of the card), tags:['Life Hero','Tareekh'] (shown as chips; tap one to filter), links:[{t:'Season 1 · Episode 1', url:'...'}] for several episodes/parts,
   about:{ h:'Heading', p:'paragraph', pts:['bullet', ...] } for a short profile of the hero / author / topic, note:'a caution line'.
   cat: one of ZARIYE_CATS ids. lang: 'ur' | 'hi' | 'en'. level: 'Beginner' | 'Aage ka' | 'Sab ke liye'. checked: month the link was last verified.
   ============================================================ */
const ZARIYE_CATS = [
  { id:'youtube',  ic:'📺', t:'YouTube Channels',  sub:'Tafseer, seerat, bayanaat', color:'#d9534f' },
  { id:'series',   ic:'🎞️', t:'Series',             sub:'Seerat aur tareekh par',  color:'#8a63d2' },
  { id:'movies',   ic:'🎬', t:'Movies',             sub:'Documentary aur filmein', color:'#c0752f' },
  { id:'books',    ic:'📚', t:'Kitabein',           sub:'Namaz se seerat tak',      color:'#2f9e6e' },
  { id:'audio',    ic:'🎧', t:'Podcast aur Audio',  sub:'Safar mein sunne ke liye', color:'#3f8fe0' },
  { id:'web',      ic:'🌐', t:'Websites aur Apps',  sub:'Qur’an, hadees, fatwa',    color:'#2fb6b0' },
  { id:'kids',     ic:'🧒', t:'Bachchon ke liye',   sub:'Kahaniyan aur nasheed',    color:'#e0709f' },
  { id:'courses',  ic:'🎓', t:'Kors aur Classes',   sub:'Arabic, tajweed, Qur’an',   color:'#5c7cfa' }
];
const ZARIYE_LANGS = [['all', 'Sab'], ['ur', 'Urdu'], ['hi', 'Hindi'], ['en', 'English']];
const ZARIYE_LANG_RANK = { ur:0, hi:1, en:2 };   /* Urdu first, then Hindi, then English */
const ZARIYE_ITEMS = [
  { id:'islam-films-list-web', cat:'web', t:'List of Islam-related films', by:'Website · Wikipedia', lang:['en'], level:'Bade (ulema se mashwara)', checked:'2026-11', url:'https://en.wikipedia.org/wiki/List_of_Islam-related_films',
    why:'Islam se jude filmon ki ek lambi list, jisse pata chalta hai kaun si film kis mauzu par bani hai.',
    tags:['Films ki List', 'Movies', 'Tareekh'],
    note:'Ye sirf films ki list hai, sifarish nahi. Koi bhi film dekhne se pehle ulema se mashwara kar lein, kyunki kai filmon mein deeni ya tareekhi baatein sahi tarah pesh nahi ki gayi hotin.' },
  { id:'darulifta-deoband-web', cat:'web', t:'Darul Ifta, Darul Uloom Deoband', by:'Website · darulifta-deoband.com', lang:['ur','hi','en'], level:'Sab ke liye', checked:'2026-11', url:'https://darulifta-deoband.com/en',
    why:'Masail aur fatawa ki website. Sawal-jawab category ke hisaab se parhe ja sakte hain, aur apna sawal bhi bheja ja sakta hai.',
    facts:['Urdu, English, Hindi', 'Ask Question', '9,000+ sawalat'],
    tags:['Fatwa', 'Masail', 'Ilm', 'Q&A'],
    about:{ h:'Website mein kya hai',
      p:'Ye Darul Uloom Deoband (India) se jura fatawa ka Q&A platform hai. Website English aur Urdu mein hai, aur Hindi fatawa ka hissa bhi hai.',
      pts:[
        'Category ke hisaab se sawal: Aqaid, Namaz aur Ibadat, Muashrat, Len-den, aur mutafarriq.',
        'Recent Posts, Special Fatwas aur Modern Issues ki list.',
        '"Ask Question" se naya sawal bheja ja sakta hai.',
        'Website par abhi lagbhag 9,181 sawalat dikhaye gaye (ginti badalti rehti hai).'
      ] },
    note:'Fatwa har shakhs ke haalat ke mutabiq badal sakta hai. Apne masle mein apne mustanad aalim se bhi rujoo karein.' },
  { id:'mufti-shamail-yt', cat:'youtube', t:'Mufti Shamail Nadwi', by:'YouTube channel', lang:['ur'], level:'Sab ke liye', checked:'2026-11', url:'https://www.youtube.com/@muftishamail',
    why:'Fiqh, Qur’an aur tafseer, hadees aur deeni sawalat ke jawab ("masail") wali videos, aur Islami yaad-dehaniyan.',
    tags:['Fiqh', 'Masail', 'Qur’an aur Tafseer', 'Hadees', 'Q&A'],
    note:'Zubaan (Urdu) maine channel page se confirm nahi ki, aapke mutabiq rakhi hai. Zaroorat ho to bad mein badal denge. Fiqh ke masail mein apne mustanad aalim se bhi rujoo karein.' },
  { id:'bismillah-song-kids', cat:'kids', t:'Bismillah Song for Kids', by:'Nasheed · Deen Kids TV (English)', lang:['en'], level:'Bachche', checked:'2026-11',
    why:'Bismillah aur achhe akhlaq ka chhota sa English nasheed. Bachchon ko khane peene aur rozmarra ke kaam Bismillah se shuru karna sikhata hai.',
    tags:['Nasheed','Adab','Bismillah'],
    links:[ { t:'▶ Bismillah Song dekhein', url:'https://www.youtube.com/watch?v=d9OV_youpfE' } ],
    note:'Bachchon ko dikhane se pehle ek baar khud dekh lein. Deeni baat mein kisi aalim se tasdeeq kar lein.' },
  { id:'abdullah-chiriya-kids', cat:'kids', t:'Abdullah Ne Chiriya Ko Paani Pilaya', by:'Cartoon · Amna & Abdullah (Urdu)', lang:['ur'], level:'Bachche', checked:'2026-11',
    why:'Urdu mein Islami cartoon kahani. Jaanwaron par raham karne ka sabaq milta hai.',
    tags:['Kahani','Akhlaq','Cartoon'],
    links:[ { t:'▶ Kahani dekhein', url:'https://www.youtube.com/watch?v=XeqjmhBZWW0' } ],
    note:'Bachchon ko dikhane se pehle ek baar khud dekh lein. Deeni baat mein kisi aalim se tasdeeq kar lein.' },
  { id:'nuh-as-kids', cat:'kids', t:'Prophet Nuh (AS) ka Qissa', by:'Qasas-ul-Anbiya · Urdu Stories of the Prophets', lang:['ur'], level:'Bachche', checked:'2026-11',
    why:'Hazrat Nuh AS ka qissa Urdu mein, bachchon ke liye aasan andaaz mein.',
    tags:['Qasas-ul-Anbiya','Kahani','Anbiya'],
    links:[ { t:'▶ Qissa dekhein', url:'https://www.youtube.com/watch?v=NgBkdtrrKLg' } ],
    note:'Bachchon ko dikhane se pehle ek baar khud dekh lein. Deeni baat mein kisi aalim se tasdeeq kar lein.' },
  { id:'allahs-miracles-quran-book', cat:'books', t:'Allah’s Miracles in the Quran', by:'Book · Harun Yahya · Goodword Books', lang:['en'], level:'Sab ke liye', checked:'2026-11',
    why:'Qur’an mein maujood science se jude ishaaron par mabni kitab. Kainaat ki takhleeq, insani janin ka irtiqa, fiza aur zameen par zindagi ke asbab jaise mauzuat.',
    facts:['2005', '412 pages', 'English'],
    tags:['Qur’an', 'Science', 'I‘jaz', 'Kainaat'],
    links:[ { t:'Kitab ka page kholein', url:'https://islamicbookstore.com/b9947.html' } ],
    about:{ h:'Kitab ke baare mein',
      p:'Is kitab mein ye mauqif pesh kiya gaya hai ki Qur’an mein kuch aisi science se mutaalliq baatein hain jo 7vin sadi mein maloom na thin, aur ye Qur’an ke Allah ka kalam hone ki daleel hai. Kitab khud bhi maanti hai ki Qur’an asal mein hidayat ki kitab hai, science ki nahi.',
      pts:[
        'Musannif: Harun Yahya',
        'Publisher: Goodword Books, 2005',
        'Paperback, 412 pages, ISBN 8178985381',
        'Mauzuat: kainaat ki takhleeq, insani janin ka irtiqa, fiza, zameen par zindagi ke asbab'
      ] },
    note:'Is musannif ke kuch khayalat (khaas kar irtiqa ke radd par) par bahut se ulama aur scientists ne aitraz kiya hai. Is kitab ko ehtiyat se padhein aur mustanad ulama ki tafaseer se bhi milaan karein.' },
  { id:'lost-islamic-history-book', cat:'books', t:'Lost Islamic History', by:'Book · Firas Alkhateeb · Reclaiming Muslim Civilisation from the Past', lang:['en','ur'], level:'Sab ke liye', checked:'2026-11',
    why:'Islami tareekh aur Muslim tehzeeb ki ilmi, tahqeeqi jhalak. Muslim tehzeeb ki yaad dilane wali kitab.',
    facts:['2014', 'Hurst Publishers (UK)', 'Urdu tarjuma maujood'],
    tags:['Tareekh', 'Islami Tehzeeb', 'Research'],
    links:[ { t:'Wikipedia par dekhein', url:'https://en.wikipedia.org/wiki/Lost_Islamic_History:_Reclaiming_Muslim_Civilisation_from_the_Past' } ],
    about:{ h:'Kitab ke baare mein',
      p:'Ye kitab Islami tareekh par hai. Iske musannif American mohaqqiq aur mauarrikh Firas Alkhateeb hain. Ye pehli baar 2014 mein Hurst Publishers (UK) se shaya hui.',
      pts:[
        'Musannif: Firas Alkhateeb',
        'Pehli ishaat: 2014, Hurst Publishers, UK',
        'Tarjume: Turkish, Bengali, Indonesian aur Urdu',
        'Ye link sirf kitab ki jankari ka hai. Kitab apni pasand ke zariye se khud haasil karein.'
      ] },
    note:'Kisi bhi tareekhi kitab ko akeli na padhein. Doosri mustanad kitabon se bhi milaan karte rahein.' },
  { id:'abdulhamid-series', cat:'series', t:'Payitaht Sultan Abdulhamid', by:'Payitaht: Abdülhamid · Turkish series, Urdu dub (YouTube par)', lang:['ur'], level:'Sab ke liye', checked:'2026-11',
    why:'Usmani Sultan Abdul Hamid II ke daur, unke daur ki saazishon aur saltanat bachane ki jaddojahad par bani series.',
    facts:['5 seasons', '154 episodes', '2017 se 2021 tak'],
    tags:['Tareekh', 'Usmani', 'Drama', 'Siyasat', 'Life Hero'],
    links:[ { t:'Urdu · Season 1 · Episode 1', url:'https://www.youtube.com/watch?v=GyqbUrT_7j8&t=1185s' } ],
    about:{ h:'Series ke baare mein',
      p:'Ye series Turkey ke TRT 1 par 24 February 2017 se 4 June 2021 tak chali. Isme Sultan Abdul Hamid II ke aakhri barson ki kahani dikhayi gayi hai. Har episode lagbhag 2 ghante ka hota hai.',
      pts:[
        'Season 1: 17 episode (2017)',
        'Season 2: 37 episode (2017 se 2018)',
        'Season 3: 34 episode (2018 se 2019)',
        'Season 4: 31 episode (2019 se 2020)',
        'Season 5: 35 episode (2020 se 2021)',
        'Kul lagbhag 154 episode (websites par ginti thodi alag hai).',
        'Baqi episodes aap YouTube par "Payitaht Abdulhamid Urdu" likh kar khud dhoond sakte hain.'
      ] },
    note:'Ye series historical drama hai. Kuch kirdar aur waqiyat drama ke liye badle ya banaye gaye ho sakte hain. Asal tareekh ke liye mustanad kitabein bhi dekhein.' },
  { id:'really-maktoob-yt', cat:'youtube', t:'Really Maktoob', by:'YouTube channel', lang:['ur'], level:'Sab ke liye', checked:'2026-11', url:'https://www.youtube.com/@ReallyMaktoob',
    why:'Surah ki tafseeli wazahat aur seerat jaise mauzu aasan andaaz mein samjhane wala channel.',
    tags:['Surah Explain', 'Seerat', 'Quran Fehmi', 'Tareekh'],
    note:'Channel ki maloomat aapke bataye mutabiq hain. Deeni masail mein kisi mustanad aalim se bhi tasdeeq kar lein.' },
  { id:'towards-eternity-yt', cat:'youtube', t:'Towards Eternity (Urdu)', by:'YouTube channel', lang:['ur'], level:'Sab ke liye', checked:'2026-11', url:'https://www.youtube.com/@TowardsEternityUrduHindi',
    why:'Urdu mein Islami mauzuat par videos. Is channel ke Hindi aur English versions bhi maujood hain, YouTube par "Towards Eternity" likh kar dhoond sakte hain.',
    tags:['Islamic Knowledge', 'Qur’an', 'Qasas', 'Tareekh'],
    note:'Channel ki maloomat aapke bataye mutabiq hain. Deeni masail mein kisi mustanad aalim se bhi tasdeeq kar lein.' },
  { id:'osman-series', cat:'series', t:'Kurulus Osman', by:'Kuruluş: Osman · Turkish series, Urdu dub (YouTube par)', lang:['ur'], level:'Sab ke liye', checked:'2026-11',
    why:'Ertugrul Ghazi ke bete Osman Bey aur Usmani saltanat ki buniyad ki kahani. Ye Diriliş: Ertuğrul ka agla hissa hai.',
    facts:['6 seasons', 'lagbhag 194 episodes', '2019 se 2025 tak'],
    tags:['Tareekh', 'Usmani', 'Drama', 'Jung aur Fatah', 'Life Hero'],
    links:[ { t:'Urdu · Season 1 · Episode 1', url:'https://www.youtube.com/watch?v=yzC6IWPLg78' } ],
    about:{ h:'Series ke baare mein',
      p:'Ye series Turkey ke ATV par 20 November 2019 se shuru hui aur 2025 mein khatam hui. Isme Osman Bey ki zindagi dikhayi gayi hai jo Ertugrul Ghazi ke bete aur Usmani saltanat ke bani the. Har episode lagbhag 2 ghante ka hota hai.',
      pts:[
        'Kul 6 seasons, lagbhag 194 episodes (alag websites par ginti thodi alag hai).',
        'Pehla episode: 20 November 2019.',
        'Ye Diriliş: Ertuğrul ki sequel hai, dono ke producer Mehmet Bozdağ hain.',
        'Urdu dub mein episodes ki ginti alag ho sakti hai.',
        'Baqi episodes aap YouTube par "Kurulus Osman Urdu" likh kar khud dhoond sakte hain.'
      ] },
    note:'Ye series historical fiction hai. Osman Bey ke baare mein asal tareekhi maloomat kam hain, isliye bahut sa hissa drama aur qissa hai. Isse tareekh ki dastaavez na samjhein.' },
  { id:'the-message-1976', cat:'movies', t:'The Message (1976)', by:'Film · Director: Moustapha Akkad · English / Arabic', lang:['en'], level:'Sab ke liye', checked:'2026-11',
    why:'Nabi-e-Akram ﷺ ke daur aur Islam ke shuruaati dino ki kahani. Film mein Nabi ﷺ aur khulafa-e-rashidin ko nahi dikhaya gaya.',
    facts:['1976', '2h 57m', 'IMDb 8.1'],
    tags:['Seerat', 'Tareekh', 'Islam ka Aaghaz', 'Drama'],
    links:[ { t:'IMDb par dekhein', url:'https://www.imdb.com/title/tt0074896/' } ],
    about:{ h:'Film ke baare mein',
      p:'Ye film Nabi-e-Akram ﷺ ki zindagi aur Islam ke aaghaz ko pesh karti hai. Isko Moustapha Akkad ne banaya.',
      pts:[
        'Director: Moustapha Akkad',
        'Stars: Anthony Quinn, Irene Papas, Michael Ansara',
        'Saal: 1976, lambai 2 ghante 57 minute',
        'Rating: PG, IMDb 8.1',
        'Ye link sirf film ki jankari ka hai. Film dekhne ke liye apni pasand ka platform khud dhoond lein.'
      ] },
    note:'Ye film ek drama hai. Kuch kirdar aur scenes film ke liye banaye gaye ho sakte hain. Seerat ke liye mustanad kitabein (jaise Ar-Raheeq al-Makhtum) zaroor dekhein.' },
  { id:'kingdom-of-heaven', cat:'movies', t:'Kingdom of Heaven', by:'Film · Director: Ridley Scott · English', lang:['en'], level:'Sirf bade (violence)', checked:'2026-11',
    why:'Salibi jungon ke daur mein Yerushalam ke difa ki kahani. Is mein Sultan Salahuddin Ayyubi ke daur aur 1187 ke muhasre ki jhalak milti hai.',
    facts:['2005', '2h 24m', 'IMDb 7.3'],
    tags:['Tareekh', 'Salibi Jung', 'Jung aur Fatah', 'Drama', 'Life Hero'],
    links:[ { t:'IMDb par dekhein', url:'https://www.imdb.com/title/tt0320661/' } ],
    about:{ h:'Film ke baare mein',
      p:'12vin sadi ke Salibi jungon ke background par bani film. Balian of Ibelin Yerushalam pahunchta hai aur shehar aur logon ka muhafiz ban jata hai.',
      pts:[
        'Director: Ridley Scott',
        'Stars: Orlando Bloom, Eva Green, Liam Neeson',
        'Saal: 2005, lambai 2 ghante 24 minute',
        'Rating: R (jung ke manazir), IMDb 7.3, Metascore 63',
        'Ye link sirf film ki jankari ka hai. Film dekhne ke liye apni pasand ka platform khud dhoondein.'
      ] },
    note:'Ye film ek fictional drama hai. Kai kirdar aur waqiyat asal tareekh se alag hain, aur jung ke manazir bade logon ke liye hain. Asal tareekh ke liye mustanad kitabein dekhein.' },
  { id:'ertugrul-series', cat:'series', t:'Ertugrul Ghazi', by:'Diriliş: Ertuğrul · Turkish series, Urdu dub (YouTube par)', lang:['ur'], level:'Sab ke liye', checked:'2026-11',
    why:'Usmani saltanat ke bani Usman Ghazi ke walid Ertugrul Bey ki zindagi par bani mashhoor Turkish series. Himmat, imaan, wafadari aur qabeele ki qiyadat ka sabaq.',
    facts:['5 seasons', '150 episodes (asli)', '2014 se 2019 tak'],
    tags:['Tareekh', 'Usmani', 'Drama', 'Jung aur Fatah', 'Life Hero'],
    links:[ { t:'Urdu · Season 1 · Episode 1', url:'https://www.youtube.com/watch?v=fa89NxhAKis' } ],
    about:{ h:'Series ke baare mein',
      p:'Ye series Turkey ke TRT 1 par 10 December 2014 se 29 May 2019 tak chali. Isme kul 5 season aur 150 episode hain, aur har episode lagbhag 2 ghante ka tha. Urdu dub mein episode chhote kaat kar dikhaye jate hain, isliye Urdu mein episodes ki ginti zyada (PTV Home par 470) hoti hai.',
      pts:[
        'Season 1: 26 episode (Dec 2014 se June 2015)',
        'Season 2: 35 episode (Sept 2015 se June 2016)',
        'Season 3: 30 episode (Oct 2016 se June 2017)',
        'Season 4: 30 episode (Oct 2017 se June 2018)',
        'Season 5: 29 episode (Nov 2018 se May 2019)',
        'Kul: 150 episode asli, Netflix par 448, PTV Home (Urdu) par 470.',
        'Baqi episodes aap YouTube par isi tarah "Ertugrul Ghazi Urdu" likh kar khud dhoond sakte hain.'
      ] },
    note:'Ertugrul Bey ke baare mein asal tareekhi maloomat bahut kam hain, isliye series ka bahut hissa drama aur qissa hai. Isse tareekh ki dastaavez na samjhein.' },
  { id:'kohistani-yt', cat:'youtube', t:'The Kohistani', by:'YouTube channel', lang:['ur'], level:'Sab ke liye', checked:'2026-11', url:'https://www.youtube.com/@Thekohistani',
    why:'Islami tareekh aur shakhsiyaat par lambi (lagbhag 20-25 minute ki) narration wali videos, jinmein series ke taur par bhi episodes aate hain, jaise Hazrat Umar RA ki series. Channel ka tarif-naama ek hadees se hai: achchi baat kaho ya khamosh raho.',
    tags:['Historical Narration', 'AI Video', 'Man Explaining', 'Tareekh', 'Sahaba'],
    note:'Channel ke video aksar tasveeron aur AI se bani visuals ke saath hote hain. Tareekhi baton ko doosri mustanad kitabon se bhi milakar dekhein.' },
  { id:'salahuddin-series', cat:'series', t:'Sultan Salahuddin Ayyubi', by:'Series (YouTube par Urdu mein)', lang:['ur'], level:'Sab ke liye', checked:'2026-11',
    why:'Ek bahadur, rahmdil aur insaaf-pasand hukmaran ki zindagi par bani series. Hero ki zindagi se himmat aur kirdar seekhne ke liye.',
    tags:['Life Hero', 'Tareekh', 'Jung aur Fatah', 'Drama'],
    links:[
      { t:'Season 1 · Episode 1', url:'https://www.youtube.com/watch?v=zENZc5TNCRE' },
      { t:'Season 2 · Episode 1', url:'https://www.youtube.com/watch?v=s9fmf_8RmJA' }
    ],
    about:{ h:'Sultan Salahuddin Ayyubi (rahimahullah)',
      p:'Salahuddin Yusuf bin Ayyub 1137/38 ke aas-paas Tikrit (aaj ke Iraq) mein paida hue. Kurd khandaan se the. Apne chacha Shirkuh ke saath Misr gaye, wahan wazir bane, aur baad mein Misr aur Shaam ke pehle sultan aur Ayyubi saltanat ke bani huye. Unhein sabse zyada Baitul Maqdis (Jerusalem) ki fatah ke liye yaad kiya jata hai.',
      pts:[
        'Janam: Tikrit, Iraq (lagbhag 1137/38), Kurd khandaan se.',
        'Chacha Shirkuh ke saath Misr gaye, aur 1169 mein Misr mein wazir muqarrar hue.',
        'Misr aur Shaam ke pehle sultan bane, aur Ayyubi saltanat ki buniyad rakhi.',
        'Misr mein Sunni deen ki wapsi: 1171 mein juma ke khutbe mein Abbasi khalifa ka naam padha gaya.',
        '4 July 1187 ko Hattin ki jang mein Salibi lashkar ko bhaari shikast di.',
        '2 October 1187 ko Baitul Maqdis 88 saal baad wapas liya.',
        'Tareekh mein unke reham, wa’de ki paasdaari aur dushman ke saath bhi insaaf ke bahut zikr milte hain.',
        'Teesri Salibi jang mein Richard (Lionheart) ka muqabla kiya, aur 1192 mein sulah hui.',
        'Wafat: 4 March 1193 ko Damascus mein. Bahut daulat sadqa kar chuke the, aur saadgi se rehte the.'
      ] },
    note:'Ye series ek drama hai. Kuch kirdar aur scenes tareekh se alag ya sajaye hue ho sakte hain. Asal tareekh ke liye mustanad kitabein bhi dekhein.' }
];

function zariyeLang(){ return ['all', 'ur', 'hi', 'en'].includes(state.zariyeLang) ? state.zariyeLang : 'all'; }
const ZARIYE_SORTS = [['def', 'Pasandida'], ['az', 'A → Z'], ['za', 'Z → A']];
const zariyeSort = ()=> ZARIYE_SORTS.some(x=> x[0] === state.zariyeSort) ? state.zariyeSort : 'def';
const zariyeSeen = id=> !!(state.zariyeSeen && state.zariyeSeen[id]);
function zariyeItems(cat){
  const lg = zariyeLang(), so = zariyeSort(), rk = x=> Math.min(...(x.lang || ['en']).map(l=> ZARIYE_LANG_RANK[l] ?? 3));
  return ZARIYE_ITEMS.filter(x=> (!cat || x.cat === cat) && (lg === 'all' || (x.lang || []).includes(lg)))
    .sort((a, b)=> (zariyeSeen(a.id) - zariyeSeen(b.id))
      || (so === 'az' ? a.t.localeCompare(b.t) : so === 'za' ? b.t.localeCompare(a.t) : rk(a) - rk(b)));
}
const zariyeSortBar = items=> `<div class="zr-sortbar"><div class="zr-sorts" id="zrSorts"><span>↕️ Tarteeb:</span>${ZARIYE_SORTS.map(([k, n])=>`<button type="button" class="zr-lang ${zariyeSort() === k ? 'on' : ''}" data-s="${k}">${n}</button>`).join('')}</div><small>✅ Dekhe hue: ${items.filter(x=> zariyeSeen(x.id)).length}/${items.length}</small></div>`;
const zariyeLangChips = ()=> `<div class="zr-langs" id="zrLangs">${ZARIYE_LANGS.map(([k, n])=>`<button type="button" class="zr-lang ${zariyeLang() === k ? 'on' : ''}" data-l="${k}">${n}</button>`).join('')}</div>`;
function zariyeWireLangs(redraw){
  document.querySelectorAll('#zrLangs .zr-lang').forEach(b=> b.onclick = ()=>{ state.zariyeLang = b.dataset.l; saveState(); redraw(); });
}
function renderZariye(){
  document.getElementById('detailTitle').textContent = 'Online aur Doosre Resources';
  document.getElementById('detailBody').innerHTML = `
    <div class="zr-hero"><div class="zr-hero-ic">🧭</div><div><div class="zr-hero-t">Online aur Doosre Resources</div><div class="zr-hero-s">Achche channels, series, movies aur kitabein ek jagah</div></div></div>
    ${zariyeLangChips()}
    <div class="zr-grid">${ZARIYE_CATS.map(c=>{ const n = zariyeItems(c.id).length;
      return `<button type="button" class="zr-tile" data-c="${c.id}" style="--zc:${c.color};"><div class="zr-tile-ic">${c.ic}</div><div class="zr-tile-t">${c.t}</div><div class="zr-tile-s">${c.sub}</div><div class="zr-tile-n">${n ? n + ' jaankari' : 'Jald aa raha hai'}</div></button>`; }).join('')}</div>
    <div class="backup-note">Ye list ahtiyat se chuni jati hai. Kisi bhi masle mein apne mustanad aalim se zaroor poochhein.</div>
    <div class="tab-end"></div>`;
  zariyeWireLangs(renderZariye);
  document.querySelectorAll('.zr-tile').forEach(b=> b.onclick = ()=> renderZariyeList(b.dataset.c));
}
function zariyeCardHtml(x, n){
  const lg = (x.lang || []).map(l=> (ZARIYE_LANGS.find(z=> z[0] === l) || [0, l])[1]).join(' · ');
  const a = x.about;
  return `<div class="zr-card ${zariyeSeen(x.id) ? 'seen' : ''}"><div class="zr-card-top"><span class="zr-sn">${n}</span><div class="zr-card-h"><b>${x.t}</b>${x.by ? `<small>${x.by}</small>` : ''}</div><button type="button" class="zr-seen ${zariyeSeen(x.id) ? 'on' : ''}" data-id="${x.id}" aria-pressed="${zariyeSeen(x.id)}">${zariyeSeen(x.id) ? '✅ Dekh liya' : '⬜ Dekh liya?'}</button></div>
    ${x.why ? `<p>${x.why}</p>` : ''}
    ${(x.facts || []).length ? `<div class="zr-facts">${x.facts.map(f=>`<div>${f}</div>`).join('')}</div>` : ''}
    ${(x.tags || []).length ? `<div class="zr-tags">${x.tags.map(t=>`<button type="button" class="zr-tag ${zrTag === t ? 'on' : ''}" data-t="${t}">#${t}</button>`).join('')}</div>` : ''}
    <div class="zr-meta">${lg ? `<span>🗣️ ${lg}</span>` : ''}${x.level ? `<span>🎯 ${x.level}</span>` : ''}${x.checked ? `<span>✔️ ${x.checked}</span>` : ''}</div>
    ${a ? `<details class="zr-about"><summary>📖 ${a.h || 'Taaruf'}</summary>${a.p ? `<p>${a.p}</p>` : ''}${(a.pts || []).length ? `<ul>${a.pts.map(t=>`<li>${t}</li>`).join('')}</ul>` : ''}</details>` : ''}
    ${x.note ? `<div class="zr-note">⚠️ ${x.note}</div>` : ''}
    ${(x.links || (x.url ? [{ t:'Kholein', url:x.url }] : [])).map(l=>`<div class="zr-linkrow"><a class="zr-open" href="${l.url}" target="_blank" rel="noopener">▶ ${l.t}</a><button type="button" class="zr-copy" data-u="${l.url}" aria-label="Link copy karein">📋 Copy link</button></div>`).join('')}</div>`;
}
let zrTag = '';
function renderZariyeList(catId){
  const c = ZARIYE_CATS.find(x=> x.id === catId) || ZARIYE_CATS[0], all = zariyeItems(c.id), tags = [...new Set(all.flatMap(x=> x.tags || []))];
  if(zrTag && !tags.includes(zrTag)) zrTag = '';
  const items = zrTag ? all.filter(x=> (x.tags || []).includes(zrTag)) : all;
  document.getElementById('detailTitle').textContent = c.t;
  document.getElementById('detailBody').innerHTML = `
    <div class="zr-sechead" style="--zc:${c.color};"><div class="zr-tile-ic">${c.ic}</div><div><b>${c.t}</b><small>${c.sub}</small></div></div>
    ${zariyeLangChips()}
    ${all.length ? zariyeSortBar(all) : ''}
    ${tags.length ? `<div class="zr-tagbar">${tags.map(t=>`<button type="button" class="zr-tag ${zrTag === t ? 'on' : ''}" data-t="${t}">#${t}</button>`).join('')}</div>` : ''}
    ${items.length ? `<div class="zr-list">${items.map((x, i)=> zariyeCardHtml(x, i + 1)).join('')}</div>`
      : `<div class="empty-state"><div style="font-size:42px;margin-bottom:8px;">${c.ic}</div>Is hisse mein abhi kuch nahi.<br>Jaldi hi chuni hui jaankari yahan aayegi.</div>`}
    <div class="tab-end"></div>`;
  zariyeWireLangs(()=> renderZariyeList(c.id));
  document.querySelectorAll('#zrSorts .zr-lang').forEach(b=> b.onclick = ()=>{ state.zariyeSort = b.dataset.s; saveState(); renderZariyeList(c.id); });
  document.querySelectorAll('.zr-seen').forEach(b=> b.onclick = ()=>{
    state.zariyeSeen = state.zariyeSeen || {}; const id = b.dataset.id;
    if(state.zariyeSeen[id]) delete state.zariyeSeen[id]; else state.zariyeSeen[id] = Date.now();
    saveState(); renderZariyeList(c.id);
  });
  document.querySelectorAll('.zr-copy').forEach(b=> b.onclick = async ()=>{
    const u = b.dataset.u; let ok = false;
    try{ if(navigator.clipboard && navigator.clipboard.writeText){ await navigator.clipboard.writeText(u); ok = true; } }catch(e){}
    if(!ok){ try{ const t = document.createElement('textarea'); t.value = u; t.style.cssText = 'position:fixed;opacity:0;'; document.body.appendChild(t); t.select(); ok = document.execCommand('copy'); t.remove(); }catch(e){} }
    showToast(ok ? 'Link copy ho gaya' : 'Copy nahi ho paya');
  });
  document.querySelectorAll('.zr-tag').forEach(b=> b.onclick = ()=>{ zrTag = (zrTag === b.dataset.t) ? '' : b.dataset.t; renderZariyeList(c.id); });
}
