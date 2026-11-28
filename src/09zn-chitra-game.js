/* ===== Chitra Quiz: categories, questions and play loop ===== */
const CH_DISC_TXT = { rur: 'Ye tasveerein asli nahi, sirf jankari ke liye banayi gayi nazdeeki (representative) illustrations hain. Asli shakl mein kuch farq ho sakta hai. Asli tasveer internet par ya wahan ja kar dekh sakte hain.', en: 'These are representative illustrations, not real photos, made for information only. The real thing may look somewhat different. You can see real pictures on the internet or by visiting.' };
/* [svg id, name, use / reference, fact] */
const CH_DATA = {
  cheezein: [
    ['miswak', 'Miswak', 'Daant aur munh saaf karne ke liye', 'Miswak ke baare mein ahadees aati hain; Nabi ﷺ ne ise munh ki safai aur Rab ki raza ka zariya farmaya.'],
    ['tasbih', 'Tasbih', 'Zikr ginne ke liye', 'Tasbih ke daane SubhanAllah, Alhamdulillah, Allahu Akbar jaise zikr ki ginti yaad rakhne mein madad dete hain.'],
    ['ihram', 'Ihram', 'Hajj ya Umrah mein mard ka libaas', 'Mard do beselay safed kapde pehente hain.'],
    ['janamaz', 'Janamaz (Prayer mat)', 'Namaz ada karne ke liye', 'Namaz mein qibla (Ka’be) ki taraf rukh kiya jata hai; janamaz par aksar mihrab ki shakl hoti hai.'],
    ['kiswa', 'Kiswa', 'Ka’be par dala jane wala ghilaf', 'Kala ghilaf jis par sunehri Qur’ani khattati ki patti hoti hai; ise badla jata rehta hai.'],
    ['zamzam', 'Zamzam ki bottle', 'Zamzam ka paani rakhne ke liye', 'Zamzam Masjid al-Haram mein Ka’be ke qareeb hai aur Hazrat Hajra AS aur Hazrat Ismail AS ke qisse se judta hai.'],
    ['ittar', 'Ittar', 'Khushbu lagane ke liye', 'Nabi ﷺ ko khushbu pasand thi; ulema se Juma/Eid ki khushbu ke masail poochh sakte hain.'],
    ['mabkhara', 'Mabkhara', 'Bakhoor / loban jalane ke liye', 'Masjid aur gharon mein khushbu ke liye bakhoor jalane ka rivaj hai.'],
    ['quran', 'Qur’an Majeed', 'Allah ki kitab, tilawat aur hidayat ke liye', 'Qur’an Majeed Islam ki muqaddas kitab hai.'],
    ['ramzan', 'Fanous (lantern)', 'Ramzan ki sajawat ka lantern', 'Fanous Ramzan ki roshni aur khushi ki mashhoor nishani ban gaya hai.'],
    ['astrolabe', 'Astrolabe', 'Sitaron aur suraj ki position se waqt/rukh maloom karne ke liye', 'Purane Muslim aur doosre falakiyat-daan is saaz ko astronomy aur safar mein istemal karte the.'],
    ['qibla', 'Qibla numa (compass)', 'Qibla ki simt maloom karne ke liye', 'Namaz mein Ka’be ki taraf rukh karna zaroori hai; qibla numa isme madad deta hai.'],
    ['rehal', 'Rehal', 'Qur’an rakh kar padhne ke liye', 'Lakdi ka stand jo Qur’an ko zameen se unchi aur saaf jagah par rakhta hai.']
  ],
  phal: [
    ['khajoor', 'Khajoor / Ajwa', 'Qur’an 19:23-25; Bukhari 5445, Muslim 2047', 'Hazrat Maryam AS ko taza khajoor khane ka hukm hua (19:25). Hadees: jo subah 7 Ajwa khajoor khaye, us din zeher aur jadu usko nuqsan nahi dega. Ajwa Madina ki mashhoor kaali khajoor hai.'],
    ['zaitoon', 'Zaitoon (Olive)', 'Qur’an 95:1, 24:35', 'Allah ne Tin aur Zaitoon ki qasam khayi (95:1). Surah An-Nur mein mubarak zaitoon ke darakht ki misaal hai (24:35).'],
    ['anjeer', 'Anjeer (Fig)', 'Qur’an 95:1', 'Surah At-Tin ka naam anjeer (Tin) par hai aur Allah ne isi surah mein anjeer ki qasam khayi.'],
    ['anar', 'Anar (Pomegranate)', 'Qur’an 6:99, 55:68', 'Qur’an mein anar ka zikr Allah ki nematon aur Jannat ke phalon ke saath aata hai.'],
    ['angoor', 'Angoor (Grapes)', 'Qur’an 2:266, 6:99', 'Qur’an mein angoor ke baghat Allah ki nemat ke taur par aate hain.'],
    ['sidr', 'Sidr (Ber ka darakht)', 'Qur’an 53:14, 56:28', 'Sidrat-ul-Muntaha ka zikr Miraj ke bayan mein hai; Jannat mein bhi kaante-rahit ber ke darakht ka zikr hai (56:28).'],
    ['kheera', 'Kheera (Cucumber)', 'Qur’an 2:61; Bukhari 5440, Muslim 2043', 'Bani Israel ne kheera jaisi sabziyan maangi (2:61). Sahabi Abdullah bin Jafar RA ne Nabi ﷺ ko taza khajoor kheere ke saath khate dekha.'],
    ['pyaz', 'Pyaz aur Lahsun', 'Qur’an 2:61; Bukhari 855, Muslim 564', 'Pyaz ka zikr 2:61 mein hai. Hadees: kachchi pyaz/lahsun khane wale ko masjid se door rehne ko kaha gaya, kyunki uski badbu se namaziyon aur farishton ko takleef hoti hai. Pakane se badbu jaye to hukm ke liye ulema se mashwara karein.'],
    ['masoor', 'Masoor ki daal (Lentils)', 'Qur’an 2:61', 'Bani Israel ne masoor ki daal bhi maangi thi (2:61).'],
    ['kalonji', 'Kalonji (Black seed)', 'Bukhari 5688, Muslim 2215', 'Hadees: kalonji mein har bimari ki shifa hai, siwaye maut ke. Ye dawa ya ilaj ka badal nahi; bimari mein doctor se zaroor milein.'],
    ['shahad', 'Shahad (Honey)', 'Qur’an 16:68-69; Bukhari 5684', 'Qur’an mein shahad ko logon ke liye shifa kaha gaya (16:69). Hadees mein pet ki takleef ke liye shahad pilane ka zikr hai.'],
    ['kaddu', 'Kaddu (Gourd / Pumpkin)', 'Bukhari 5433, 5436; Muslim 2041', 'Hazrat Anas RA ne Nabi ﷺ ko kaddu pasand karke khate dekha, aur kaha ke tab se mujhe kaddu pasand hai.'],
    ['kamah', 'Kumbhi (Kam’a / Truffle)', 'Bukhari 4478, Muslim 2049', 'Hadees: Kam’a Manna mein se hai aur iska paani aankh ke liye shifa hai. (Manna Bani Israel par utarne wali nemat hai.)'],
    ['adrak', 'Adrak (Ginger)', 'Qur’an 76:17', 'Jannat walon ko aise jaam pilaye jayenge jis mein adrak (Zanjabeel) ki milawat hogi.'],
    ['doodh', 'Doodh (Milk)', 'Qur’an 16:66, 47:15', 'Qur’an mein chaupayon ke pet se saaf, peene walon ke liye khush-guwar doodh nikalne ka zikr hai; Jannat mein doodh ki nehron ka bhi.'],
    ['jau', 'Jau ki roti aur Talbina', 'Bukhari 5436, 5417', 'Jau ki roti Nabi ﷺ ke daur ki aam ghiza thi. Talbina aate ya chokar aur doodh se bani patli khichdi hai; hadees mein ise dukhi/bimar ke dil ko sukoon dene wali kaha gaya.']
  ],
  qudrat: [
    ['pahaad', 'Pahaad (Mountain)', 'Qur’an 52:1, 95:2', 'Allah ne Toor (pahaad) aur Toor-e-Sinin ki qasam khayi.'],
    ['baarish', 'Baarish', 'Qur’an 25:48', 'Allah aasman se paak paani utaarta hai; baarish se zameen zinda hoti hai.'],
    ['bijli', 'Bijli aur kadak', 'Qur’an 13:12-13', 'Bijli dikhana aur badal ki gargarahat Allah ki tasbeeh karna Qur’an mein bayan hua.'],
    ['sitare', 'Sitare (Stars)', 'Qur’an 53:1, 6:97', 'Allah ne sitare ki qasam khayi (53:1) aur sitare raaston ki rahnumayi ke liye bhi banaye (6:97).'],
    ['suraj', 'Suraj (Sun)', 'Qur’an 91:1', 'Surah Ash-Shams mein Allah ne suraj aur uski roshni ki qasam khayi.'],
    ['samandar', 'Samandar (Sea)', 'Qur’an 52:6, 55:19-20', 'Allah ne samandar ki qasam khayi (52:6) aur do samandaron ke darmiyan parde ka zikr hai (55:19-20).'],
    ['baagh', 'Baagh aur nehrein', 'Qur’an 2:25', 'Jannat ke baghon ke neeche nehrein behti hain; Qur’an Jannat ki aisi tasweer kai jagah pesh karta hai.'],
    ['beej', 'Beej aur ugta paudha', 'Qur’an 6:95', 'Allah daane aur guthli ko chir kar paudha nikalta hai; ye uski qudrat ki nishani hai.'],
    ['moti', 'Moti (Pearl)', 'Qur’an 22:23, 55:22, 76:19', 'Jannat walon ke liye moti ke zewar aur bikhre hue moti jaise khidmatgaron ka zikr hai.'],
    ['sarson', 'Rai ka daana (Mustard seed)', 'Qur’an 21:47, 31:16', 'Qiyamat ke tarazu mein rai ke daane ke barabar amal bhi saamne aayega; ye chhoti si cheez ki misaal hai.']
  ],
  janwar: [
    ['oont', 'Oont (Camel)', 'Surah Al-Ghashiyah (88:17)', 'Qur’an mein oont ki takhleeq par ghaur karne ko kaha gaya.'],
    ['makkhi', 'Shahad ki makkhi', 'Surah An-Nahl (16:68-69)', 'Allah ne makkhi ko wahi (ilham) farmayi; surah ka naam An-Nahl (makkhi) hai.'],
    ['cheenti', 'Cheenti', 'Surah An-Naml (27:18)', 'Hazrat Sulaiman AS ke lashkar se bachne ki cheenti ki baat is surah mein aati hai.'],
    ['hudhud', 'Hudhud (Hoopoe)', 'Surah An-Naml (27:20-22)', 'Hudhud ne Hazrat Sulaiman AS ko Saba ki khabar di.'],
    ['makdi', 'Makdi', 'Surah Al-Ankabut (29:41)', 'Makdi ke jaale ki misaal di gayi, jo sabse kamzor ghar hai.'],
    ['hathi', 'Hathi', 'Surah Al-Fil (105)', 'Ashab-ul-Fil ka waqia; surah ka naam Al-Fil (hathi) hai.'],
    ['machhli', 'Badi machhli (Al-Hut)', 'Hazrat Yunus AS ka qissa (37:139-144)', 'Hazrat Yunus AS ko machhli ne nigal liya aur unhone dua ki (21:87).'],
    ['gaay', 'Gaay', 'Surah Al-Baqarah (2:67-71)', 'Bani Israel ko gaay zabah karne ka hukm hua; isi se surah ka naam Al-Baqarah (gaay) hai.'],
    ['kauwa', 'Kauwa', 'Surah Al-Ma’idah (5:31)', 'Allah ne ek kauwa bheja jisne Qabil ko bhai ki laash dafan karna sikhaya.'],
    ['dog', 'Kutta', 'Surah Al-Kahf (18:18)', 'Ashab-e-Kahf ka kutta ghaar ke darwaze par apne agle panjey phailaye baitha tha.'],
    ['wolf', 'Bheriya (Wolf)', 'Surah Yusuf (12:13-17)', 'Hazrat Yaqub AS ko darr tha ke bheriya Yusuf AS ko kha jaye; bhaiyon ne isi bahane ko istemal kiya.'],
    ['horse', 'Ghoda', 'Surah Al-Adiyat (100:1); Aal-e-Imran (3:14)', 'Surah Al-Adiyat mein Allah ne daudte hue ghodon ki qasam khayi.'],
    ['donkey', 'Gadha', 'Surah Luqman (31:19); An-Nahl (16:8)', 'Gadhe, ghode aur khachchar sawari aur zeenat ke liye hain (16:8); Luqman 31:19 mein aawaz dheemi rakhne ki nasihat hai.'],
    ['quail', 'Bater (Quail)', 'Surah Al-Baqarah (2:57)', 'Bani Israel par Manna aur Salwa (bater) ki nemat utari.']
  ],
  imarat: [
    ['mihrab', 'Mihrab', 'Qibla ki taraf ishara karne wala taaq', 'Imam aam taur par mihrab ke saamne khada hota hai.'],
    ['minbar', 'Minbar', 'Juma aur Eid ka khutba dene ki unchi seedhiyan', 'Khatib minbar par se khutba deta hai.'],
    ['minaret', 'Minar (Minaret)', 'Azaan dene ke liye unchi minar', 'Aaj azaan aam taur par loudspeaker se di jati hai, magar minar masjid ki pehchaan hai.'],
    ['gumbad', 'Gumbad (Dome)', 'Masjid ki chhat ka gol hissa', 'Gumbad masajid ki mashhoor pehchaan hai.'],
    ['sahn', 'Sahn (Courtyard)', 'Masjid ka khula aangan', 'Sahn mein namaziyon ke liye jagah hoti hai aur aksar hauz ya fountain bhi.'],
    ['wuzu', 'Wuzu-khana', 'Namaz se pehle wuzu karne ki jagah', 'Qur’an (5:6) mein wuzu ke arkan bayan hue hain.'],
    ['muqarnas', 'Muqarnas', 'Gumbad ya mehrab ke andar chhatte jaisi sajawat', 'Muqarnas Islami imarat ki mashhoor sajawat hai.'],
    ['mashrabiya', 'Mashrabiya', 'Lakdi ki jaali wali khidki', 'Garam ilaqon mein hawa aur roshni ke saath parda bhi deti hai.']
  ],
  zindagi: [
    ['topi', 'Topi (Prayer cap)', 'Sar par pehnne ki topi', 'Bahut se Musalman mard namaz aur aam din mein topi pehente hain.'],
    ['thobe', 'Thobe', 'Arab mulkon mein mard ka lamba libaas', 'Thobe (dishdasha) Arab ilaqon mein aam libaas hai.'],
    ['abaya', 'Abaya', 'Auraton ka dhila bahar ka libaas', 'Abaya Khaleeji mulkon mein aam hai; libaas ke masail ke liye ulema se mashwara karein.'],
    ['dallah', 'Dallah', 'Arabi qahwa banane aur parosne ke liye', 'Dallah mein qahwa tayyar karke finjan mein pesh kiya jata hai.'],
    ['finjan', 'Finjan (qahwa ke pyale)', 'Arabi qahwa peene ke liye', 'Arabi qahwa mehmaan-nawazi ki nishani samjha jata hai.'],
    ['mashka', 'Mashkeezah (jild ki mashk)', 'Paani bharne aur le jane ke liye', 'Purane zamane mein safar aur sahra mein paani le jane ke liye istemal hoti thi.'],
    ['qalam', 'Qalam', 'Likhne ke liye', 'Pehli wahi mein qalam ka zikr hai (96:4) aur Surah Al-Qalam (68) ka naam bhi isi par hai.'],
    ['davaat', 'Davaat (siyahi daan)', 'Siyahi rakhne ke liye', 'Purane zamane mein qalam ke saath siyahi daan istemal hota tha.']
  ],
  fann: [
    ['tile', 'Seramik tile (kashi)', 'Mitti se bani rangeen chamakdaar tile', 'Masajid aur imaraton ki deewaron par rangeen tile ka kaam mashhoor hai.'],
    ['mosaic', 'Mosaic', 'Chhote chhote tukdon se naqsh banana', 'Mosaic mein rangeen tukde jod kar naqsh ya tasveer banayi jati hai.'],
    ['door', 'Lakdi ki naqqashi (Wood carving)', 'Lakdi par naqsh tarashna', 'Darwaze, minbar aur khidkiyon par geometric naqsh ki naqqashi hoti hai.'],
    ['tray', 'Peetal ki naqshi thali', 'Peetal par naqqashi', 'Peetal par barik naqqashi Islami dastkari ki mashhoor misaal hai.'],
    ['zellige', 'Zellige', 'Morocco ka hath se kata hua rangeen tile ka kaam', 'Zellige Morocco ki mashhoor Islami tile-kari hai.'],
    ['carpet', 'Qaleen (Carpet)', 'Dhaage se bun kar bana naqshi farsh', 'Islami duniya mein qaleen bunai purani dastkari hai.'],
    ['bowl', 'Seramik katora (Iznik)', 'Mitti ka rangeen naqshi katora', 'Iznik seramik Usmani daur mein mashhoor tha.'],
    ['glass', 'Rangeen shisha (Stained glass)', 'Rangeen shishon wali khidki', 'Rangeen shishe roshni ko rang dete hain.'],
    ['coin', 'Purana Islami sikka', 'Len-den ka sikka, jis par aksar Arabi ibarat hoti thi', 'Islami hukumaton ke sikkon par aksar Arabi likhai hoti thi.']
  ],
  hajj: [
    ['tawaf', 'Tawaf', 'Ka’be ke gird 7 chakkar', 'Tawaf Ka’be ke gird 7 chakkar lagane ko kehte hain.'],
    ['sai', 'Sa’i', 'Safa aur Marwa ke darmiyan 7 baar chalna', 'Ye Hazrat Hajra AS ki daud-dhoop ki yaad se judi ibadat hai.'],
    ['rami', 'Rami al-Jamarat', 'Mina mein Jamarat par kankariyan marna', 'Hajj ke dauraan Mina mein Jamarat par kankariyan maari jati hain.'],
    ['GA:arafat', 'Wuquf-e-Arafat', '9 Zul-Hijjah ko Arafat mein thehrna', 'Wuquf-e-Arafat Hajj ka sabse ahem rukn hai.'],
    ['GA:mina', 'Mina', 'Hajj mein raatein guzarne aur Jamarat ka maqam', 'Mina ke khaimon ka shehar Hajj ke dino mein abaad hota hai.'],
    ['GA:muzdalifah', 'Muzdalifah', 'Arafat ke baad raat guzarne ka maqam', 'Hajj ke dauraan haji Muzdalifah mein raat guzarte hain.']
  ],
  mauqe: [
    ['chand', 'Chand ki ruyat (Hilal)', '', 'Islami (Hijri) mahine chand ki ruyat se shuru hote hain.'],
    ['ramzan', 'Ramzan', '', 'Qur’an ka nuzool Ramzan mein shuru hua (2:185); fanous Ramzan ki mashhoor sajawat hai.'],
    ['iftar', 'Iftar', '', 'Nabi ﷺ se khajoor aur paani se iftar karne ki riwayat hai.'],
    ['qurbani', 'Eid-ul-Adha (Qurbani)', '', 'Hazrat Ibrahim AS ki sunnat; Qurbani ke ahkam ke liye ulema se mashwara karein.'],
    ['eidi', 'Eidi', '', 'Eid par bachchon ko khushi mein tohfa ya paise dene ka rivaj hai.'],
    ['hajj', 'Hajj', '', 'Hajj Islam ka rukn hai jo istita‘at hone par zindagi mein ek baar farz hai.', 'GA:kaaba'],
    ['qadr', 'Laylat-ul-Qadr', '', 'Ye raat hazar mahino se behtar hai (97:3).']
  ]
};
const CH_DUAS = [[0, 'sleep'], [1, 'wake'], [2, 'plate'], [51, 'plate2'], [4, 'car'], [5, 'GA:quba'], [6, 'GA:quba'], [8, 'house']];
const CH_KHAT = [['ٱللَّه', 'Allah', 'Allah ka zaati naam'], ['مُحَمَّد', 'Muhammad ﷺ', 'Allah ke aakhri Nabi'], ['مُوسَىٰ', 'Musa AS', 'Allah ke Nabi Hazrat Musa AS'], ['عِيسَىٰ', 'Isa AS', 'Allah ke Nabi Hazrat Isa AS'], ['يُوسُف', 'Yusuf AS', 'Allah ke Nabi Hazrat Yusuf AS'], ['إِبْرَاهِيم', 'Ibrahim AS', 'Allah ke Nabi Hazrat Ibrahim AS'], ['بِسْمِ ٱللَّهِ', 'Bismillah', 'Allah ke naam se'], ['ٱلْحَمْدُ لِلَّهِ', 'Alhamdulillah', 'Sab taareef Allah ke liye'], ['سُبْحَانَ ٱللَّهِ', 'SubhanAllah', 'Allah paak hai'], ['ٱللَّهُ أَكْبَرُ', 'Allahu Akbar', 'Allah sabse bada hai'], ['لَا إِلَٰهَ إِلَّا ٱللَّهُ', 'La ilaha illallah', 'Allah ke siwa koi ma‘bood nahi'], ['مَا شَاءَ ٱللَّهُ', 'MashaAllah', 'Jo Allah ne chaha'], ['إِن شَاءَ ٱللَّهُ', 'InshaAllah', 'Agar Allah ne chaha'], ['أَسْتَغْفِرُ ٱللَّهَ', 'Astaghfirullah', 'Main Allah se maafi maangta hoon'], ['جَزَاكَ ٱللَّهُ خَيْرًا', 'JazakAllah khair', 'Allah tumhein behtar badla de']];
const CH_CATS = [
  ['maqamat', '🗺️', 'Maqamat (jagahein)', 'Places', ()=> geoQs(4).map(q=> ({ q: q.q, o: q.o, a: q.a, art: GA.svg(q.art), why: `${q.p.n}: ${q.p.city ? q.p.city + ', ' : ''}${q.p.co}. ${q.p.c}` })), 46],
  ['cheezein', '📿', 'Islami cheezein', 'Objects', m=> chItems('cheezein', m, 'Iska istemal kya hai?', 'What is it used for?'), 14],
  ['phal', '🌿', 'Phal, ghiza aur shifa (Qur’an/Hadees)', 'Fruits and foods (Qur’an/Hadith)', m=> chItems('phal', m, 'Iska zikr Qur’an ya Sahih Hadees mein kahan aata hai?', 'Where is it mentioned (Qur’an or Sahih Hadith)?'), 16],
  ['qudrat', '🌄', 'Qudrat ke nishan (Qur’an)', 'Signs in nature (Qur’an)', m=> chItems('qudrat', m, 'Qur’an mein iska zikr kahan aata hai?', 'Where is it mentioned in the Qur’an?'), 10],
  ['janwar', '🐪', 'Qur’ani janwar', 'Animals', m=> chItems('janwar', m, 'Qur’an mein iska zikr kis surah ya qisse mein aata hai?', 'Which surah or story mentions it?'), 14],
  ['imarat', '🕌', 'Masjid ke hisse', 'Mosque features', m=> chItems('imarat', m, 'Iska kaam kya hai?', 'What is its purpose?'), 8],
  ['zindagi', '☕', 'Rozmarra (Arab/Islami)', 'Daily life', m=> chItems('zindagi', m, 'Iska istemal kya hai?', 'What is it used for?'), 8],
  ['fann', '🧱', 'Islami fann aur dastkari', 'Islamic crafts', m=> chItems('fann', m, 'Ye kya hai / kis cheez ka kaam hai?', 'What is it?'), 9],
  ['quran', '📖', 'Qur’an aur Arabi ilm', 'Qur’an and Arabic basics', m=> chQuran(m), 34],
  ['hajj', '🕋', 'Hajj ke arkan', 'Hajj rituals', m=> chItems('hajj', m, 'Ye kya hai / kab hota hai?', 'What is it?'), 6],
  ['mauqe', '🌙', 'Islami mauqe', 'Occasions', m=> chItems('mauqe', m, '', ''), 6],
  ['dua', '🤲', 'Dua aur mauqa', 'Dua and situation', m=> chDua(m), 8],
  ['khat', '✍️', 'Arabi khat', 'Arabic calligraphy', m=> chKhat(m), 15],
  ['naqsh', '🎨', 'Islami naqsh', 'Patterns', m=> chNaqsh(m), 7]
];
const chSvg = id=> id.startsWith('GA:') ? GA.svg(id.slice(3)) : CI.svg(id);
const CH_KIND = { cheezein: 'Ye ek Islami cheez hai', phal: 'Ye ek phal, sabzi ya ghiza hai jiska Qur’an ya Sahih Hadees mein zikr aata hai', qudrat: 'Ye Allah ki qudrat ki nishani hai jiska Qur’an mein zikr aata hai', janwar: 'Ye ek janwar hai jiska Qur’an mein zikr aata hai', imarat: 'Ye masjid ka ek hissa hai', zindagi: 'Ye Arab aur Islami rozmarra ki cheez hai', fann: 'Ye Islami fann ya dastkari ki cheez hai', hajj: 'Ye Hajj ya Umrah se jura hai' };
function chItems(cat, m, qUseR, qUseE){
  const kind = CH_KIND[cat] ? CH_KIND[cat] + '. ' : '';
  const items = CH_DATA[cat], out = [];
  for(let r = 0; out.length < m; r++){
    lzShuffle(items).forEach(it=>{
      if(out.length >= m) return;
      const useQ = it[2] && qUseR && lzRand(2) === 0, others = items.filter(x=> x !== it);
      let o, a, q;
      if(useQ){ a = it[2]; const pool = [...new Set(others.map(x=> x[2]).filter(x=> x && x !== a))]; if(pool.length < 3){ o = null; } else { o = lzShuffle([a, ...lzShuffle(pool).slice(0, 3)]); q = L({ rur: `${kind}Tasveer: ${it[1]}. ${qUseR.replace(/^Iska /, 'Iska ')}`, en: `${it[1]}: ${qUseE}` }); } }
      if(!o){ a = it[1]; o = lzShuffle([a, ...lzShuffle(others.map(x=> x[1])).slice(0, 3)]); const clue = it[2] && it[2].length < 90 && !it[1].toLowerCase().split(/[ (/]/).some(w=> w.length > 3 && it[2].toLowerCase().includes(w)); q = clue && lzRand(2) === 0 ? L({ rur: `${kind}Iska hawala/istemal: ${it[2]}. Tasveer mein kya hai?`, en: 'What is shown?' }) : L({ rur: kind + 'Tasveer mein kya hai?', en: 'What is this?' }); }
      out.push({ q, o, a, art: chSvg(it[4] || it[0]), why: `${it[1]}${it[2] ? ' — ' + it[2] : ''}. ${it[3]}` });
    });
  }
  return out;
}
function chDua(m){
  const out = [];
  for(let r = 0; out.length < m; r++) lzShuffle(CH_DUAS).forEach(x=>{
    if(out.length >= m) return;
    const d = DUAS[x[0]], cut = s=> { s = String(s || ''); return s.length > 70 ? s.slice(0, 68).replace(/\s+\S*$/, '') + '…' : s; };
    const pool = DUAS.filter((y, i)=> i !== x[0] && y.translit && !/^Surah|Ayat/.test(y.title)).map(y=> cut(y.translit)).filter(t=> t !== cut(d.translit));
    out.push({ q: L({ rur: 'Is mauqe par kaun si dua padhi jati hai?', en: 'Which dua is recited in this situation?' }), o: lzShuffle([cut(d.translit), ...lzShuffle([...new Set(pool)]).slice(0, 3)]), a: cut(d.translit), art: chSvg(x[1]), why: `${dTitle(d)}: ${d.translit} (${d.meaning})${d.ref ? ' [' + d.ref + ']' : ''}` });
  });
  return out;
}
function chKhat(m){
  const out = [];
  if(m >= 5 && lzRand(3) === 0) out.push({ q: L({ rur: 'Harf ke upar/neeche in nishano (zabar, zer, pesh) ko kya kehte hain?', en: 'What are the marks above/below letters (fatha, kasra, damma) called?' }), ar: 'بَ  بِ  بُ', o: lzShuffle(['Harakat', 'Surah', 'Sajdah', 'Ruku']), a: 'Harakat', art: '', why: L({ rur: 'Zabar, zer aur pesh ko harakat kehte hain; ye harf ki awaaz batate hain.', en: 'Fatha, kasra and damma are called harakat; they show how a letter is voiced.' }) });
  for(let r = 0; out.length < m; r++) lzShuffle(CH_KHAT).forEach(x=>{
    if(out.length >= m) return;
    const byMeaning = lzRand(2) === 0, others = CH_KHAT.filter(y=> y !== x), idx = byMeaning ? 2 : 1;
    out.push({ q: byMeaning ? L({ rur: 'Is Arabi ka matlab kya hai?', en: 'What does this Arabic mean?' }) : L({ rur: 'Ye kya likha hai?', en: 'What is written here?' }), ar: x[0], o: lzShuffle([x[idx], ...lzShuffle(others.map(y=> y[idx])).slice(0, 3)]), a: x[idx], art: '', why: `${x[0]} = ${x[1]}: ${x[2]}.` });
  });
  return out;
}
const CH_LET = [['ا', 'Alif'], ['ب', 'Be'], ['ت', 'Te'], ['ث', 'Se'], ['ج', 'Jeem'], ['ح', 'Bari He'], ['خ', 'Khe'], ['د', 'Daal'], ['ذ', 'Zaal'], ['ر', 'Re'], ['ز', 'Ze'], ['س', 'Seen'], ['ش', 'Sheen'], ['ص', 'Suaad'], ['ض', 'Zuaad'], ['ط', 'Toe'], ['ظ', 'Zoe'], ['ع', 'Ain'], ['غ', 'Ghain'], ['ف', 'Fe'], ['ق', 'Qaaf'], ['ك', 'Kaaf'], ['ل', 'Laam'], ['م', 'Meem'], ['ن', 'Noon'], ['و', 'Waaw'], ['ه', 'Chhoti He'], ['ي', 'Ye']];
const CH_QF = [
  { ar: '۩', q: ['Qur’an mein ye nishan kya batata hai?', 'What does this mark in the Qur’an show?'], a: 'Sajdah ki aayat', o: ['Sajdah ki aayat', 'Surah ka aaghaz', 'Juz ka khatma', 'Tarjuma'], why: 'Is nishan wali aayat par Sajdah-e-Tilawat ka hukm hai (ahkam ke liye ulema se mashwara karein).' },
  { ar: '۝', q: ['Ye gol nishan Qur’an mein kahan aata hai?', 'Where does this round mark appear in the Qur’an?'], a: 'Aayat ke khatme par', o: ['Aayat ke khatme par', 'Surah ke aaghaz par', 'Safhe ke upar', 'Sirf Juz ke shuru mein'], why: 'Aayat ke khatme par gol nishan hota hai, aksar uske andar aayat ka number likha hota hai.' },
  { ar: '', q: ['Qur’an ki ek aayat ko kya kehte hain?', 'What is a single verse of the Qur’an called?'], a: 'Ayah', o: ['Ayah', 'Surah', 'Juz', 'Manzil'], why: 'Ek aayat ko Ayah kehte hain; Ayaat milkar Surah banati hain.' },
  { ar: '', q: ['Qur’an ke 30 hisson mein se ek hissa kya kehlata hai?', 'What is one of the 30 parts of the Qur’an called?'], a: 'Juz (Para)', o: ['Juz (Para)', 'Ruku', 'Manzil', 'Sajdah'], why: 'Qur’an 30 Juz (Para) mein taqseem hai.' },
  { ar: '', q: ['Qur’an mein kul kitni surahein hain?', 'How many surahs are in the Qur’an?'], a: '114', o: ['114', '99', '124', '30'], why: 'Qur’an mein 114 surahein hain.' },
  { ar: '', q: ['Qur’an mein kul kitne Para (Juz) hain?', 'How many Juz are in the Qur’an?'], a: '30', o: ['30', '20', '40', '60'], why: 'Qur’an 30 Para (Juz) mein hai.' }
];
function chQuran(m){
  const out = [];
  while(out.length < m){
    if(lzRand(3) === 0){ const x = CH_QF[lzRand(CH_QF.length)]; if(!out.some(y=> y.why === x.why)) out.push({ q: L({ rur: x.q[0], en: x.q[1] }), ar: x.ar, o: lzShuffle(x.o), a: x.a, art: '', why: x.why }); continue; }
    const t = CH_LET[lzRand(CH_LET.length)]; if(out.some(y=> y.ar === t[0])) continue;
    out.push({ q: L({ rur: 'Ye Arabi harf kaun sa hai?', en: 'Which Arabic letter is this?' }), ar: t[0], o: lzShuffle([t[1], ...lzShuffle(CH_LET.filter(y=> y !== t).map(y=> y[1])).slice(0, 3)]), a: t[1], art: '', why: `${t[0]} = ${t[1]}` });
  }
  return out;
}
function chNaqsh(m){
  const out = [], NS = [5, 6, 7, 8, 9, 10, 12];
  for(let i = 0; i < m; i++){
    const n = NS[lzRand(NS.length)], o = lzShuffle([n, ...lzShuffle(NS.filter(x=> x !== n)).slice(0, 3)]).map(String);
    out.push({ q: L({ rur: 'Is naqsh (sitare) mein kitni nok hain?', en: 'How many points does this star pattern have?' }), o, a: String(n), art: CI.star(n), why: L({ rur: `Is sitare mein ${n} nok hain.`, en: `This star has ${n} points.` }) });
  }
  return out;
}
function chBuild(cat, n){
  if(cat === 'mixed'){ const all = []; CH_CATS.forEach(c=> all.push(...c[4](3))); return lzShuffle(all).slice(0, n); }
  return CH_CATS.find(c=> c[0] === cat)[4](n).slice(0, n);
}
let khCh = null;
function khChitraHome(){
  khClear(); khTitle(L({ rur: 'Chitra Quiz', en: 'Picture Quiz' }));
  const S = khS(); S.chBest = S.chBest || {};
  khBody().innerHTML = `<div class="lz"><p class="lz-sub" style="margin:0 0 8px;">${L({ rur: 'Tasveer dekh kar pehchaniye', en: 'Identify from the picture' })}</p>
    <div class="kh-disc">ℹ️ ${L(CH_DISC_TXT)}</div>
    <button type="button" class="kh-card" data-c="mixed"><span class="kh-ic">🎲</span><span class="kh-tx"><b>${L({ rur: 'Sab mila kar (Mixed)', en: 'All mixed' })}</b><small>${L({ rur: 'Har category se thode sawal', en: 'A few from every category' })}</small></span><span class="kh-best">${S.chBest.mixed != null ? L({ rur: 'Behtar', en: 'Best' }) + ': ' + S.chBest.mixed : ''}</span></button>
    ${CH_CATS.map(c=> `<button type="button" class="kh-card" data-c="${c[0]}"><span class="kh-ic">${c[1]}</span><span class="kh-tx"><b>${isEn() ? c[3] : c[2]}</b><small>${c[5]} ${L({ rur: 'cheezein', en: 'items' })}</small></span><span class="kh-best">${S.chBest[c[0]] != null ? L({ rur: 'Behtar', en: 'Best' }) + ': ' + S.chBest[c[0]] : ''}</span></button>`).join('')}
    <p class="lz-note">${L({ rur: 'Deeni maslon ke liye ulema se mashwara karein.', en: 'For religious rulings, consult your ulema.' })}</p></div>`;
  khBody().querySelectorAll('.kh-card[data-c]').forEach(b=>{ b.onclick = ()=> khChitraStart(b.dataset.c); });
}
function khChitraStart(cat){
  khTitle(L({ rur: 'Chitra Quiz', en: 'Picture Quiz' })); khClear();
  khCh = { cat, i: 0, ok: 0, log: [], lock: false, qs: chBuild(cat, khRounds()) }; khChitraShow();
}
function khChitraShow(){
  const G = khCh, q = G.qs[G.i]; G.lock = false;
  khBody().innerHTML = `<div class="lz">${khHead(`${G.i + 1}/${G.qs.length}`, `<span class="kh-mist">✔ <b>${G.ok}</b></span>`)}
    <div class="quiz-card">${q.art ? q.art + `<div class="kh-disc kh-disc-s">ℹ️ ${L({ rur: 'Representative tasveer, asli nahi; farq ho sakta hai.', en: 'Representative picture, not real; it may differ.' })}</div>` : ''}${q.ar ? `<div class="quiz-q-ar kh-bigar">${q.ar}</div>` : ''}<div class="quiz-q">${q.q}</div></div>
    <div class="quiz-opts">${q.o.map((o, i)=> `<button type="button" class="quiz-opt qopt-${'ABCD'[i]}" data-o="${String(o).replace(/"/g, '&quot;')}"><span class="opt-letter">${'ABCD'[i]}</span><span class="quiz-opt-txt">${o}</span></button>`).join('')}</div>
    <div id="khNextWrap"></div><div class="lz-toast" id="lzToast"></div></div>`;
  document.querySelectorAll('.quiz-opt').forEach(b=>{ b.onclick = ()=>{
    if(G.lock) return; G.lock = true; const ok = b.dataset.o === q.a;
    document.querySelectorAll('.quiz-opt').forEach(x=>{ x.disabled = true; if(x.dataset.o === q.a) x.classList.add('correct'); });
    if(ok){ G.ok++; lzOk(); lzVib(20); } else { b.classList.add('wrong'); khShake(b); lzBad(); lzVib([40, 40, 40]); }
    G.log.push({ ok, q: q.q, a: q.a, why: q.why });
    const wait = (khAnsSecs() + (ok ? 0 : 1)) * 1000;
    lzToast(q.why, ok ? 'ok' : 'bad', khAutoOn() ? wait : 600000);
    khNext(wait, G.i + 1 >= G.qs.length, ()=>{ G.i++; G.i >= G.qs.length ? khChitraEnd() : khChitraShow(); });
  }; });
}
function khChitraEnd(){
  const G = khCh, S = khS(); S.chBest = S.chBest || {}; const pct = G.ok / G.qs.length;
  if(S.chBest[G.cat] == null || G.ok > S.chBest[G.cat]) S.chBest[G.cat] = G.ok;
  khResult('chitra', pct >= .8 ? 'MashaAllah!' : L({ rur: 'Shabaash!', en: 'Well done!' }), G.ok, G.qs.length, khStarsFor(pct), `<div class="kh-disc kh-disc-s">ℹ️ ${L(CH_DISC_TXT)}</div>`, ()=> khChitraStart(G.cat), G.log);
}
