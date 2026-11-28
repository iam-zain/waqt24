/* ===== Deen Detective: Islamic Clue Challenge =====
   4 clues are revealed one by one; the player picks from 4 options, max 2 attempts per question.
   Points: 100 / 75 / 50 / 25 for a correct answer after clue 1 / 2 / 3 / 4.
   Surah questions are built from the verified ayah counts + Makki/Madani list (api.alquran.cloud; sum = 6236 ayahs, 28 Madani)
   and hand-written topic clues. Other questions are hand-written. Clues are in Roman Urdu. */

const CL_POINTS = [100, 75, 50, 25];
const CL_CATS = [
  ['quran', '📖', 'Qur’an (Surah)', 'Qur’an (Surahs)'], ['anbiya', '🌟', 'Anbiya', 'Prophets'], ['seerat', '🕌', 'Seerat', 'Seerah'],
  ['sahaba', '🤝', 'Sahaba', 'Companions'], ['maqamat', '📍', 'Maqamaat', 'Places in Islam'], ['ibadat', '🕋', 'Namaz aur Ibadat', 'Salah and Worship'],
  ['ramzan', '🌙', 'Ramzan aur Roza', 'Ramadan and Fasting'], ['tareekh', '🏛️', 'Tareekh aur Shakhsiyat', 'History and Personalities'], ['ilm', '💡', 'Deeni Ilm', 'Islamic Knowledge']
];
const CL_AYAT = [7,286,200,176,120,165,206,75,129,109,123,111,43,52,99,128,111,110,98,135,112,78,118,64,77,227,93,88,69,60,34,30,73,54,45,83,182,88,75,85,54,53,89,59,37,35,38,29,18,45,60,49,62,55,78,96,29,22,24,13,14,11,11,18,12,12,30,52,52,44,28,28,20,56,40,31,50,40,46,42,29,19,36,25,22,17,19,26,30,20,15,21,11,8,8,19,5,8,8,11,11,8,3,9,5,4,7,3,6,3,5,4,5,6];
const CL_MADANI = new Set([2,3,4,5,8,9,13,22,24,33,47,48,49,55,57,58,59,60,61,62,63,64,65,66,76,98,99,110]);
/* surah number: [topic clue, meaning of the name] */
const CL_SURAH_TOPIC = {
  1: ['Is mein Allah ki hamd aur seedhe raaste ki dua hai.', 'The Opening'],
  2: ['Qur’an ki sabse badi surah hai; isi mein Ayat-ul-Kursi (2:255) hai.', 'The Cow'],
  12: ['Poori surah mein ek Nabi ke bachpan se Misr mein hukumat tak ka qissa bayan hai.', '@Hazrat Yusuf AS'],
  18: ['Ashab-e-Kahf, Hazrat Musa AS aur Khidr AS ka safar, aur Zul-Qarnain ka zikr hai.', 'The Cave'],
  19: ['Hazrat Maryam AS, Hazrat Zakariyya AS aur Hazrat Isa AS ki paidaish ka zikr hai.', '@Hazrat Maryam AS'],
  21: ['Isme kai Anbiya ka zikr hai, jaise Ibrahim, Lut, Nuh, Dawud, Sulaiman, Ayyub aur Yunus AS.', 'The Prophets'],
  23: ['Shuru mein kamyab momineen ki sifaat bayan hui hain, jaise namaz mein khushu.', 'The Believers'],
  24: ['Isme Ayat-un-Noor (24:35) hai aur ghar ke aadaab aur paak-daamni ke ahkam hain.', 'The Light'],
  27: ['Hazrat Sulaiman AS, Saba ki malika aur chiyuntiyon ki baat ka zikr hai.', 'The Ant'],
  29: ['Is mein ek kamzor ghar ki misaal di gayi hai, jo un logon ke liye hai jo Allah ke siwa sahare dhoondhte hain.', 'The Spider'],
  31: ['Ek nek bande ki apne bete ko naseehatein isme hain, jaise shirk se bachna.', '@Hazrat Luqman'],
  33: ['Ghazwa-e-Khandaq ka zikr aur Nabi ﷺ ke ghar ke aadaab isme hain.', 'The Clans'],
  8: ['Badr ki jung aur maal-e-ghanimat ke ahkam isme hain.', 'The Spoils of War'],
  9: ['Ye wahid surah hai jiske shuru mein Bismillah nahi likhi jati.', 'The Repentance'],
  16: ['Isme shahad ki makkhi ka zikr hai jise Allah ne wahi ki.', 'The Bee'],
  48: ['Sulah Hudaybiyyah ke baad utri aur ise "khuli fatah" kaha gaya.', 'The Victory'],
  49: ['Isme aapas ke adab hain: bad-gumani, gheebat, mazaq udane aur bure laqab se mana kiya gaya.', 'The Inner Apartments'],
  55: ['Isme ek ayat baar baar dohrayi jati hai: tum dono apne Rab ki kaun kaun si nemat ko jhutlaoge.', 'The Most Merciful'],
  56: ['Qayamat ke din logon ke teen giroh bayan hue hain.', 'The Inevitable'],
  62: ['Isme Juma ki azaan par Allah ke zikr ki taraf daudne ka hukm hai (62:9).', 'Friday'],
  67: ['Isme Allah ki badshahi aur maut-o-hayat ke imtihan ka zikr hai.', 'The Sovereignty'],
  96: ['Iski shuruaati ayaat wahi ke aaghaz mein utri thin, aur "Iqra" (padh) se shuru hoti hai.', 'The Clot'],
  97: ['Isme ek raat ka zikr hai jo hazar mahino se behtar hai.', 'The Night of Power'],
  103: ['Waqt ki qasam khakar bataya gaya ke nuqsan se wohi bacha jo imaan, nek amal, haq aur sabr ki talqeen par ho.', 'Zamana (Al-Asr)'],
  105: ['Ek hathi wali fauj ka zikr hai jo Ka’be par chadh aayi thi.', 'The Elephant'],
  106: ['Quraysh ke sardi-garmi ke tijarati safar aur is Ghar ke Rab ki ibadat ka zikr hai.', '@Quraysh qabile'],
  108: ['Ye Qur’an ki sabse chhoti surah hai; isme Nabi ﷺ ko ek bohat bada tohfa milne ki khabar hai.', 'Abundance'],
  109: ['Isme saaf elaan hai: tumhara deen tumhare liye, aur mera deen mere liye.', 'The Disbelievers'],
  110: ['Isme Allah ki madad aur fatah aane, aur log fauj dar fauj Islam mein dakhil hone ka zikr hai.', 'Divine Support'],
  111: ['Isme Nabi ﷺ ke ek chacha aur uski biwi ka zikr hai jinhone dushmani ki.', 'The Palm Fibre'],
  112: ['Isme Allah ke ek aur be-niyaz hone ka bayan hai; na usne kisi ko jana, na wo jana gaya.', 'Sincerity'],
  113: ['Isme subah ke Rab ki panah maangi gayi hai, andheri raat aur hasad ke shar se.', 'The Daybreak'],
  114: ['Isme insaanon ke Rab, Badshah aur Ma‘bood ki panah maangi gayi hai, waswase se bachne ke liye.', 'Mankind']
};
/* hand-written: [cat, answer, [3 wrong options], [clue 1 (hardest) ... clue 4 (easiest)]] */
const CL_BANK = [
  ['anbiya', 'Hazrat Ibrahim AS', ['Hazrat Nuh AS', 'Hazrat Musa AS', 'Hazrat Yusuf AS'], ['Maine apni qaum ke buton ko tod diya.', 'Mujhe aag mein daala gaya, magar Allah ke hukm se wo thandi aur salamati wali ho gayi.', 'Mujhe Allah ne Khalil (dost) banaya.', 'Maine apne bete ke saath Ka’be ki bunyadein uthayin.']],
  ['anbiya', 'Hazrat Nuh AS', ['Hazrat Hud AS', 'Hazrat Salih AS', 'Hazrat Lut AS'], ['Meri qaum ne zyadatar mera inkaar kiya.', 'Maine bohat lambe arse tak dawat di; Qur’an ke mutabiq 950 saal (29:14).', 'Allah ke hukm se maine ek kashti banayi.', 'Meri qaum par toofan aaya, aur Qur’an ki ek surah mere naam par hai.']],
  ['anbiya', 'Hazrat Yusuf AS', ['Hazrat Yaqub AS', 'Hazrat Ayyub AS', 'Hazrat Yunus AS'], ['Main apne walid ka bohat piyara tha.', 'Mere bhaiyon ne mujhe kuen mein daal diya.', 'Main Misr ke khazaano ka zimmedar bana.', 'Maine bachpan mein 11 sitaron, suraj aur chand ka khwab dekha.']],
  ['anbiya', 'Hazrat Musa AS', ['Hazrat Isa AS', 'Hazrat Dawud AS', 'Hazrat Harun AS'], ['Mujhe bachpan mein ek sandooq mein daal kar nadi mein bahaya gaya.', 'Allah ne mujhse Toor ke maqam par kalam kiya.', 'Mera asa Allah ke hukm se saanp ban jata tha.', 'Mere saath Bani Israel ne Firaun se nijaat paayi.']],
  ['anbiya', 'Hazrat Isa AS', ['Hazrat Yahya AS', 'Hazrat Zakariyya AS', 'Hazrat Musa AS'], ['Meri paidaish baghair walid ke, Allah ke hukm se hui.', 'Maine jhoole mein baat ki (Qur’an 19:29-30).', 'Mujhe Injeel di gayi.', 'Meri walida Hazrat Maryam AS hain.']],
  ['anbiya', 'Hazrat Yunus AS', ['Hazrat Ayyub AS', 'Hazrat Idris AS', 'Hazrat Hud AS'], ['Main apni qaum se naraz hokar chala gaya.', 'Mujhe ek badi machhli ne nigal liya.', 'Maine andheron mein pukara: La ilaha illa anta subhanaka inni kuntu minaz-zalimin (21:87).', 'Meri qaum ne baad mein imaan laya aur azaab hata liya gaya (10:98).']],
  ['anbiya', 'Hazrat Ayyub AS', ['Hazrat Yaqub AS', 'Hazrat Sulaiman AS', 'Hazrat Dawud AS'], ['Meri misaal sabr ke liye di jati hai.', 'Mujhe lambi bimari aur azmaish ka samna hua.', 'Maine pukara: "Mujhe takleef pahunchi hai aur tu sabse bada Raheem hai" (21:83).', 'Allah ne mujhe sehat di aur apni rehmat se nawaza.']],
  ['anbiya', 'Hazrat Sulaiman AS', ['Hazrat Dawud AS', 'Hazrat Yusuf AS', 'Hazrat Musa AS'], ['Mere paas bohat badi hukumat thi.', 'Allah ne mujhe parindon aur jinnaat par ikhtiyar diya.', 'Saba ki malika mujhse milne aayi.', 'Ek chiyunti ne apni qaum ko mere lashkar se bachne ko kaha (27:18).']],
  ['anbiya', 'Hazrat Adam AS', ['Hazrat Idris AS', 'Hazrat Nuh AS', 'Hazrat Ibrahim AS'], ['Mujhe mitti se banaya gaya.', 'Farishton ne mujhe sajda kiya, magar Iblees ne inkaar kiya.', 'Mujhe aur meri biwi ko ek darakht ke qareeb jaane se roka gaya.', 'Main sabse pehla insaan hoon.']],
  ['anbiya', 'Hazrat Ismail AS', ['Hazrat Ishaq AS', 'Hazrat Yaqub AS', 'Hazrat Lut AS'], ['Meri walida ko Makkah ki sookhi wadi mein chhoda gaya.', 'Mere liye Zamzam ka chashma phoota.', 'Maine apne walid Hazrat Ibrahim AS ke saath Ka’be ki bunyadein uthayin (2:127).', 'Qur’an ne mujhe ‘wada ka sachcha’ kaha (19:54); Nabi Muhammad ﷺ meri nasl se hain.']],
  ['seerat', 'Hijrat', ['Isra aur Miraj', 'Fatah-e-Makkah', 'Hajjatul Wida'], ['Ye safar Islami Hijri calendar ke aaghaz ki bunyad bana.', 'Ye Makkah se Madinah ki taraf hua.', 'Nabi ﷺ ke saath Hazrat Abu Bakr RA the.', 'Safar ke dauraan Ghar-e-Thawr mein panah li gayi.']],
  ['seerat', 'Isra aur Miraj', ['Hijrat', 'Sulah Hudaybiyyah', 'Fatah-e-Makkah'], ['Ye ek raat ka mojiza tha.', 'Nabi ﷺ ko Masjid-e-Haram se Masjid-e-Aqsa tak le jaya gaya (17:1).', 'Iske baad aasmanon ki taraf Miraj ka safar hua.', 'Isi mein panch waqt ki namaz ka tohfa mila.']],
  ['seerat', 'Sulah Hudaybiyyah', ['Ghazwa-e-Khandaq', 'Fatah-e-Makkah', 'Ghazwa-e-Badr'], ['Ye 6 Hijri ka waqia hai.', 'Nabi ﷺ umrah ke irade se nikle, magar roke gaye.', 'Mu‘ahida Quraysh ke saath hua.', 'Iske baad Surah Al-Fath utri.']],
  ['seerat', 'Fatah-e-Makkah', ['Sulah Hudaybiyyah', 'Ghazwa-e-Hunain', 'Ghazwa-e-Badr'], ['Ye ek bohat bada waqia tha jisme intiqam nahi liya gaya.', 'Ye 8 Hijri mein hua.', 'Ka’be ko buton se paak kiya gaya.', 'Nabi ﷺ ne aam maafi ka elaan farmaya.']],
  ['seerat', 'Ghazwa-e-Khandaq', ['Ghazwa-e-Badr', 'Ghazwa-e-Uhud', 'Ghazwa-e-Khaybar'], ['Madinah ki hifazat ke liye ek khaas tadbeer apnayi gayi.', 'Ek lambi khaai khodi gayi.', 'Ye mashwara Hazrat Salman Farsi RA ne diya.', 'Surah Al-Ahzab is waqiye se judi hai.']],
  ['seerat', 'Hajjatul Wida', ['Fatah-e-Makkah', 'Sulah Hudaybiyyah', 'Hijrat'], ['Ye Nabi ﷺ ka aakhri Hajj tha.', 'Ye 10 Hijri mein hua.', 'Khutba Arafat ke maidan mein diya gaya.', 'Is khutbe mein insaani huqooq aur barabari ka bohat saaf paigham diya gaya.']],
  ['sahaba', 'Hazrat Abu Bakr RA', ['Hazrat Umar RA', 'Hazrat Uthman RA', 'Hazrat Ali RA'], ['Mujhe "As-Siddiq" kaha jata hai.', 'Maine Hijrat ke safar mein Nabi ﷺ ka saath diya.', 'Main Ashara Mubashshara mein shamil hoon.', 'Main Nabi ﷺ ke baad pehla khalifa bana.']],
  ['sahaba', 'Hazrat Umar RA', ['Hazrat Abu Bakr RA', 'Hazrat Uthman RA', 'Hazrat Ali RA'], ['Mujhe "Al-Farooq" kaha jata hai.', 'Main Ashara Mubashshara mein shamil hoon.', 'Meri khilafat mein Baitul Maqdis fatah hua.', 'Main doosra khalifa-e-Rashid hoon.']],
  ['sahaba', 'Hazrat Uthman RA', ['Hazrat Umar RA', 'Hazrat Ali RA', 'Hazrat Abu Bakr RA'], ['Mujhe "Zun-Noorain" (do noor wala) kaha jata hai.', 'Maine Nabi ﷺ ki do sahabzadiyon se nikah kiya.', 'Mere daur mein Qur’an ke nuskhe tayyar karke bheje gaye.', 'Main teesra khalifa-e-Rashid hoon.']],
  ['sahaba', 'Hazrat Ali RA', ['Hazrat Umar RA', 'Hazrat Uthman RA', 'Hazrat Talha RA'], ['Main Nabi ﷺ ke ghar mein parwarish pane wale pehle bachchon mein tha.', 'Maine Hijrat ki raat Nabi ﷺ ke bistar par aaram kiya.', 'Mera nikah Hazrat Fatimah RA se hua.', 'Main chautha khalifa-e-Rashid hoon.']],
  ['sahaba', 'Hazrat Bilal RA', ['Hazrat Salman Farsi RA', 'Hazrat Khalid bin Walid RA', 'Hazrat Zayd bin Haritha RA'], ['Mujhe islam ki wajah se sakht takleefein di gayin.', 'Meri zubaan par "Ahad, Ahad" ka lafz tha.', 'Mujhe Hazrat Abu Bakr RA ne khareed kar azaad kiya.', 'Main Islam ke pehle muazzin hone ka sharaf rakhta hoon.']],
  ['sahaba', 'Hazrat Khadijah RA', ['Hazrat Aisha RA', 'Hazrat Fatimah RA', 'Hazrat Hafsa RA'], ['Main ek kamyab tajira thin.', 'Main Nabi ﷺ ki sabse pehli zaujah hoon.', 'Maine sabse pehle Nabi ﷺ par imaan laya (pehle imaan laane walon mein).', 'Meri aulaad mein Hazrat Fatimah RA shamil hain.']],
  ['sahaba', 'Hazrat Aisha RA', ['Hazrat Khadijah RA', 'Hazrat Fatimah RA', 'Hazrat Hafsa RA'], ['Mujhe Umm-ul-Momineen kaha jata hai.', 'Main Hazrat Abu Bakr RA ki beti hoon.', 'Mujhse bohat si ahadees riwayat hain.', 'Nabi ﷺ ki wafat mere hujre mein hui.']],
  ['sahaba', 'Hazrat Khalid bin Walid RA', ['Hazrat Bilal RA', 'Hazrat Salman Farsi RA', 'Hazrat Abu Ubaidah RA'], ['Main aham jungon ka qaaid raha.', 'Mujhe ‘Saifullah’ (Allah ki talwar) ka laqab mila.', 'Mu’ta ki jung mein maine lashkar ko sambhala.', 'Yarmuk ki jung mein bhi aham kirdar ada kiya.']],
  ['sahaba', 'Hazrat Salman Farsi RA', ['Hazrat Bilal RA', 'Hazrat Abu Dharr RA', 'Hazrat Ammar RA'], ['Main haq ki talash mein kai mulkon ka safar karke Madinah pahuncha.', 'Main Farsi (Iran) ka rehne wala tha.', 'Mujhe ghulami se azaad hone mein Nabi ﷺ ne madad ki.', 'Khandaq ki jung mein maine khaai khodne ka mashwara diya.']],
  ['maqamat', 'Masjid-e-Aqsa', ['Ghar-e-Hira', 'Masjid Quba', 'Jabal-e-Arafat'], ['Ye ek bohat ahem safar ki manzil hai.', 'Nabi ﷺ ko Isra ki raat yahan le jaya gaya.', 'Ye Baitul Maqdis (Jerusalem) mein hai.', 'Ise "Masjid-e-Aqsa", yani door wali masjid, kaha jata hai (17:1).']],
  ['maqamat', 'Ghar-e-Hira', ['Ghar-e-Thawr', 'Masjid Quba', 'Jabal-e-Uhud'], ['Ye ek chhoti gufa hai jo pahaad par hai.', 'Nabi ﷺ nabuwwat se pehle yahan ibadat ke liye tanhai mein jaate the.', 'Yahin pehli wahi aayi.', 'Ye Makkah ke qareeb Jabal-e-Noor mein hai.']],
  ['maqamat', 'Ghar-e-Thawr', ['Ghar-e-Hira', 'Masjid Quba', 'Jabal-e-Uhud'], ['Ye ek pahaadi gufa hai jiska zikr hijrat ke safar se judta hai.', 'Nabi ﷺ aur Hazrat Abu Bakr RA ne yahan panah li.', 'Dushman talash karte hue yahan tak pahunche, magar Allah ne hifazat farmayi (9:40).', 'Ye Makkah ke qareeb Jabal-e-Thawr mein hai.']],
  ['maqamat', 'Masjid Quba', ['Masjid-e-Nabawi', 'Masjid-e-Aqsa', 'Masjid al-Haram'], ['Ye ek masjid hai jiski bunyad ek khaas safar ke dauraan padi.', 'Ye Madinah ke qareeb hai.', 'Hijrat mein Nabi ﷺ Madinah pahunchne se pehle yahan thehre.', 'Ise Islam ki sabse pehli masjid kaha jata hai.']],
  ['maqamat', 'Jabal-e-Arafat', ['Mina', 'Muzdalifah', 'Safa'], ['Yahan har saal bohat bade majme ka ijtima hota hai.', 'Hajj ka sabse ahem rukn yahin hota hai.', '9 Zul-Hijjah ko yahan thehr kar dua aur zikr kiya jata hai.', 'Nabi ﷺ ne Hajjatul Wida ka khutba yahin diya.']],
  ['maqamat', 'Ka’bah', ['Safa', 'Zamzam', 'Mina'], ['Dunia bhar ke Musalman iski taraf rukh karte hain.', 'Ise Allah ka pehla ghar kaha gaya (3:96).', 'Hazrat Ibrahim AS aur Hazrat Ismail AS ne iski bunyad uthayi.', 'Isme Hajar-e-Aswad laga hua hai.']],
  ['maqamat', 'Zamzam', ['Maqam-e-Ibrahim', 'Hateem', 'Mina'], ['Ye ek chashma hai jo ek maa aur bachche ke liye phoota.', 'Hazrat Hajra AS Safa aur Marwa ke darmiyan daudi thin.', 'Ye Masjid al-Haram mein Ka’be ke qareeb hai.', 'Hajj aur Umrah mein haji iska paani peete hain.']],
  ['maqamat', 'Masjid-e-Nabawi', ['Masjid Quba', 'Masjid-e-Aqsa', 'Masjid al-Haram'], ['Iski taameer mein Nabi ﷺ ne khud hissa liya.', 'Ye Madinah Munawwarah mein hai.', 'Isme Nabi ﷺ ka rauza mubarak hai.', 'Isme Riyaz-ul-Jannah (Jannat ka baagh) naam ki jagah hai.']],
  ['maqamat', 'Madinah Munawwarah', ['Makkah Mukarramah', 'Taif', 'Khaybar'], ['Iska purana naam Yathrib tha.', 'Hijrat ke baad Nabi ﷺ ne yahan qayam kiya.', 'Yahan Ansar ne Muhajireen ki madad ki.', 'Yahan Masjid-e-Nabawi hai.']],
  ['maqamat', 'Badr', ['Uhud', 'Hunain', 'Khandaq'], ['Ye ek maidan hai jo Islam ki pehli badi jung se juda hai.', 'Ye jung 17 Ramzan 2 Hijri ko hui.', 'Musalmanon ki taadaad lagbhag 313 thi.', 'Surah Al-Anfal is jung ke hawale se aayi.']],
  ['maqamat', 'Uhud', ['Badr', 'Hunain', 'Khandaq'], ['Madinah ke qareeb ek pahaad hai jahan ek mushkil jung hui.', 'Teer-andazon ko pahaadi par rukne ka hukm tha.', 'Nabi ﷺ ke chacha Hazrat Hamza RA yahan shaheed hue.', 'Ye jung 3 Hijri mein hui.']],
  ['maqamat', 'Mina', ['Jabal-e-Arafat', 'Muzdalifah', 'Safa'], ['Hajj ka ek maqam jahan haji kuch raatein guzarte hain.', 'Ye Makkah aur Muzdalifah ke darmiyan ek wadi hai.', 'Yahan Jamarat hain.', '10 Zul-Hijjah ko yahan bade Jamarah ko kankariyan maari jati hain.']],
  ['ibadat', 'Fajr', ['Zuhr', 'Asr', 'Isha'], ['Meri farz rakat sabse kam hain.', 'Mujhe raat ke andhere ke baad padha jata hai.', 'Meri azaan mein "As-salatu khairum minan-nawm" kaha jata hai.', 'Main subah ki namaz hoon.']],
  ['ibadat', 'Maghrib', ['Zuhr', 'Asr', 'Isha'], ['Main din ke aakhir se judi namaz hoon.', 'Meri farz 3 rakat hain.', 'Roza iftar ke waqt mere waqt mein khulta hai.', 'Main suraj doobne par shuru hone wali namaz hoon.']],
  ['ibadat', 'Zakat', ['Sawm', 'Hajj', 'Salah'], ['Ye Islam ka ek rukn hai.', 'Ye maal se judi ibadat hai.', 'Ye shahadat aur namaz ke baad aata hai.', 'Nisab ko pahunchne wale maal par saal guzarne par aam tor par 2.5% diya jata hai.']],
  ['ibadat', 'Tayammum', ['Ghusl', 'Wuzu', 'Masah-e-Khuff'], ['Ye paaki hasil karne ka ek tareeqa hai.', 'Ye tab hota hai jab paani na mile ya istemal mumkin na ho.', 'Isme paak mitti par haath maare jate hain.', 'Chehra aur haathon ka masah kiya jata hai.']],
  ['ibadat', 'Juma', ['Eid-ul-Fitr', 'Tarawih', 'Zuhr'], ['Mera din hafte mein ek baar aata hai.', 'Mujhse pehle khutba hota hai.', 'Meri 2 rakat farz hain.', 'Surah Al-Jumu‘a mujhse mutalliq hai.']],
  ['ibadat', 'Wuzu', ['Ghusl', 'Tayammum', 'Azan'], ['Ye namaz ki ek shart se judi cheez hai.', 'Isme 4 farz bayan hue hain (Qur’an 5:6).', 'Chehra dhona, haath dhona, sar ka masah aur paon dhona.', 'Namaz se pehle kiya jata hai.']],
  ['ramzan', 'Laylat-ul-Qadr', ['Shab-e-Barat', 'Eid ki raat', 'Arafah ki raat'], ['Ye ek raat hai jisse Qur’an ka gehra talluq hai.', 'Ye hazar mahino se behtar hai (97:3).', 'Ise Ramzan ke aakhri dahe ki taaq raaton mein talash karne ko kaha gaya.', 'Surah Al-Qadr ka naam isi par hai.']],
  ['ramzan', 'Sehri', ['Iftar', 'Tarawih', 'Zakat-ul-Fitr'], ['Ye roze ki taiyari se judi hai.', 'Ye subah sadiq se pehle ki jati hai.', 'Nabi ﷺ ne ismein barkat hone ki khabar di.', 'Ye roza shuru hone se pehle khana hai.']],
  ['ramzan', 'Zakat-ul-Fitr (Sadqa-e-Fitr)', ['Zakat', 'Fidya', 'Kaffara'], ['Ye ek wajib sadqa hai.', 'Ye Ramzan se judi hai.', 'Ye Eid ki namaz se pehle ada karna behtar hai.', 'Isse roze ki kamiyon ki talafi aur gareebon ki Eid mein madad hoti hai.']],
  ['ramzan', 'Itikaf', ['Tarawih', 'Sehri', 'Umrah'], ['Ye ek sunnat ibadat hai.', 'Isme banda ek jagah thehr jata hai.', 'Ye aam tor par Ramzan ke aakhri dahe mein hota hai.', 'Ye masjid mein niyyat ke saath thehrna hai.']],
  ['tareekh', 'Salahuddin Ayyubi', ['Tariq bin Ziyad', 'Muhammad bin Qasim', 'Muhammad al-Fatih'], ['Main Ayyubi saltanat ka bani hoon.', 'Maine Hattin ki jung mein salibiyon ko shikast di (1187).', 'Mere haathon Baitul Maqdis dobara Musalmanon ke paas aaya.', 'Teesri Salibi jung (Third Crusade) mein mera muqabla Richard Lionheart se hua.']],
  ['tareekh', 'Muhammad al-Fatih', ['Salahuddin Ayyubi', 'Tariq bin Ziyad', 'Alp Arslan'], ['Main Usmani sultan tha.', 'Maine bohat kam umr mein hukumat sambhali.', 'Maine 1453 mein ek mashhoor shehar fatah kiya.', 'Maine Constantinople fatah kiya, jo ab Istanbul kehlata hai.']],
  ['tareekh', 'Tariq bin Ziyad', ['Muhammad bin Qasim', 'Salahuddin Ayyubi', 'Khalid bin Walid RA'], ['Main ek Muslim fauji qaaid tha.', 'Maine samandar paar karke ek nai sarzameen mein qadam rakha.', 'Meri fatah Andalus (Spain) mein 711 ke aaspaas hui.', 'Gibraltar ka naam mere naam se juda hai.']],
  ['tareekh', 'Imam Bukhari', ['Imam Muslim', 'Imam Tirmidhi', 'Imam Abu Dawood'], ['Main hadees ka bada Imam hoon.', 'Maine hadees ki ek mashhoor kitab jama ki.', 'Meri kitab ka naam "Al-Jami as-Sahih" hai.', 'Meri kitab Sahih Bukhari kehlati hai.']],
  ['tareekh', 'Imam Abu Hanifa', ['Imam Malik', 'Imam Shafi‘i', 'Imam Ahmad bin Hanbal'], ['Main fiqh ka bada Imam hoon.', 'Mera naam Nu‘man bin Thabit hai.', 'Main Kufa se juda hoon.', 'Hanafi fiqh meri taraf mansoob hai.']],
  ['tareekh', 'Al-Khwarizmi', ['Ibn Sina', 'Ibn Battuta', 'Jabir bin Hayyan'], ['Main ek Musalman aalim tha jiska kaam ginti se juda hai.', 'Maine ek aisi kitab likhi jisse ek ilm ka naam nikla.', 'Mere naam se "algorithm" lafz nikla.', 'Mujhe algebra ka bani samjha jata hai.']],
  ['ilm', 'Arkan-e-Islam (5)', ['Arkan-e-Imaan (6)', 'Aqaid ke 4 stoon', 'Farz Namazein (5)'], ['Is ginti ka zikr ek mashhoor hadees mein hai.', 'Isme shahadat, namaz, zakat, roza aur hajj hain.', 'Ye Islam ki bunyad kahe gaye hain.', 'In paanch ko Arkan-e-Islam kehte hain.']],
  ['ilm', 'Ayat-ul-Kursi', ['Surah Al-Ikhlas', 'Ayat-un-Noor', 'Surah Al-Fatihah'], ['Ye Qur’an ki ek bohat mashhoor ayat hai.', 'Isme Allah ke Hayy-ul-Qayyum hone ka zikr hai.', 'Ye Surah Al-Baqarah mein hai (2:255).', 'Ise Qur’an ki sabse azeem ayat kaha gaya hai.']]
];

/* ---------- build question set ---------- */
let CL_SURAH_Q = null;
function clSurahQs(){
  if(CL_SURAH_Q) return CL_SURAH_Q;
  const names = QURAN_SURAHS.map(s=> s.name), out = [];
  Object.keys(CL_SURAH_TOPIC).forEach(k=>{
    const n = +k, ay = CL_AYAT[n - 1], mad = CL_MADANI.has(n), [topic, meaning] = CL_SURAH_TOPIC[k];
    const near = names.map((nm, i)=> ({ nm, i: i + 1 })).filter(x=> x.i !== n && Math.abs(CL_AYAT[x.i - 1] - ay) <= Math.max(4, ay * .25) && CL_MADANI.has(x.i) === mad);
    const pool = near.length >= 3 ? near : names.map((nm, i)=> ({ nm, i: i + 1 })).filter(x=> x.i !== n);
    const wrong = lzShuffle(pool).slice(0, 3).map(x=> x.nm);
    const prev = n > 1 ? names[n - 2] : null, next = n < 114 ? names[n] : null;
    const place = !prev ? `Mushaf ki pehli surah hai; iske baad ${next} aati hai.` : !next ? `Mushaf ki aakhri surah hai; ${prev} ke baad aati hai.` : `Mushaf mein ${prev} ke baad aur ${next} se pehle aati hai.`;
    out.push({ cat: 'quran', a: names[n - 1], o: wrong, c: [`Is surah mein ${ay} ayaat hain aur ye aam tor par ${mad ? 'Madani' : 'Makki'} maani jati hai.`, topic, place, meaning[0] === '@' ? `Ye surah ${meaning.slice(1)} ke naam par hai.` : `Iske naam ka matlab: "${meaning}".`] });
  });
  return CL_SURAH_Q = out;
}
let CL_ALL = null;
function clAll(){
  if(CL_ALL) return CL_ALL;
  return CL_ALL = CL_BANK.map(x=> ({ cat: x[0], a: x[1], o: x[2], c: x[3] })).concat(clSurahQs());
}
/* seeded random (daily challenge is the same for everyone) */
function clRng(seed){ let a = seed >>> 0; return ()=>{ a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const clSeedShuffle = (arr, r)=>{ const a = arr.slice(); for(let i = a.length - 1; i > 0; i--){ const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const clToday = ()=>{ const d = new Date(); return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(); };

/* ---------- screens ---------- */
let clG = null, clCat = 'mixed';
const clS = ()=>{ const s = khS(); s.clue = s.clue || { best: {}, daily: {} }; return s.clue; };
function khClueHome(){
  khClear(); khTitle(L({ rur: 'Deen Detective', en: 'Deen Detective' }));
  const S = clS(), today = clToday(), dd = S.daily[today];
  khBody().innerHTML = `<div class="lz"><p class="lz-sub" style="margin:0 0 10px;">${L({ rur: '4 suraag, 1 jawab. Jitni jaldi pehchanein, utne zyada number.', en: '4 clues, 1 answer. The earlier you guess, the more points.' })}</p>
    <div class="cl-chips" id="clChips"><button type="button" data-c="mixed" class="${clCat === 'mixed' ? 'on' : ''}">🎲 ${L({ rur: 'Mixed', en: 'Mixed' })}</button>${CL_CATS.map(c=> `<button type="button" data-c="${c[0]}" class="${clCat === c[0] ? 'on' : ''}">${c[1]} ${isEn() ? c[3] : c[2]}</button>`).join('')}</div>
    <button type="button" class="kh-card" data-m="quick"><span class="kh-ic">⚡</span><span class="kh-tx"><b>Quick Play</b><small>${L({ rur: '5 sawal, 2-3 minute', en: '5 questions, 2-3 minutes' })}</small></span><span class="kh-best">${S.best.quick != null ? L({ rur: 'Behtar', en: 'Best' }) + ': ' + S.best.quick : ''}</span></button>
    <button type="button" class="kh-card" data-m="daily"><span class="kh-ic">📅</span><span class="kh-tx"><b>${L({ rur: 'Aaj ka Challenge', en: 'Daily Challenge' })}</b><small>${L({ rur: 'Har roz 5 sawal, sab ke liye ek jaise', en: '5 questions every day, same for everyone' })}</small></span><span class="kh-best">${dd ? '✔ ' + dd.score : ''}</span></button>
    <button type="button" class="kh-card" data-m="marathon"><span class="kh-ic">🏃</span><span class="kh-tx"><b>Marathon</b><small>${L({ rur: '20 sawal, total score jodte jayein', en: '20 questions, scores add up' })}</small></span><span class="kh-best">${S.best.marathon != null ? L({ rur: 'Behtar', en: 'Best' }) + ': ' + S.best.marathon : ''}</span></button>
    <p class="lz-note">${L({ rur: 'Clue Roman Urdu mein hain. Deeni maslon ke liye ulema se mashwara karein.', en: 'Clues are in Roman Urdu. For religious rulings, consult your ulema.' })}</p></div>`;
  document.querySelectorAll('#clChips button').forEach(b=>{ b.onclick = ()=>{ clCat = b.dataset.c; document.querySelectorAll('#clChips button').forEach(x=> x.classList.toggle('on', x === b)); }; });
  document.querySelectorAll('.kh-card[data-m]').forEach(b=>{ b.onclick = ()=> khClueStart(b.dataset.m); });
}
function khClueStart(mode){
  const all = clAll(), n = mode === 'marathon' ? 20 : 5;
  let qs;
  if(mode === 'daily'){
    const r = clRng(clToday()); qs = clSeedShuffle(all, r).slice(0, n).map(q=> ({ ...q, order: clSeedShuffle([q.a, ...q.o], r) }));
  } else {
    let pool = clCat === 'mixed' ? all : all.filter(q=> q.cat === clCat);
    if(pool.length < n) pool = all;
    qs = lzShuffle(pool).slice(0, n).map(q=> ({ ...q, order: lzShuffle([q.a, ...q.o]) }));
  }
  clG = { mode, qs, i: 0, score: 0, ok: 0, clueSum: 0, res: [], rev: [] };
  clQ();
}
function clQ(){
  const G = clG, q = G.qs[G.i]; G.clue = 0; G.tries = 0; G.struck = []; G.lock = false;
  const dots = G.qs.map((_, i)=> `<i class="${i < G.res.length ? (G.res[i] > 0 ? 'ok' : 'no') : i === G.i ? 'cur' : ''}"></i>`).join('');
  khBody().innerHTML = `<div class="lz">${khHead(`${G.i + 1}/${G.qs.length}`, `<span class="kh-mist">🏆 <b id="clScore">${G.score}</b></span>`)}
    ${G.qs.length <= 10 ? `<div class="quiz-dots" style="margin:0 0 10px;">${dots}</div>` : ''}
    <div class="lz-cat"><span>🕵️ ${L({ rur: 'Suraag', en: 'Clue' })} <b id="clN">1</b>/4</span><b id="clPts">${CL_POINTS[0]} ${L({ rur: 'number', en: 'pts' })}</b></div>
    <div class="cl-clues" id="clClues"></div>
    <div class="quiz-opts" id="clOpts">${q.order.map((o, i)=> `<button type="button" class="quiz-opt qopt-${'ABCD'[i]}" data-o="${o.replace(/"/g, '&quot;')}"><span class="opt-letter">${'ABCD'[i]}</span><span class="quiz-opt-txt">${o}</span></button>`).join('')}</div>
    <button type="button" class="lz-hint cl-next" id="clMore">🔎 ${L({ rur: 'Agla suraag dikhayein', en: 'Reveal next clue' })}</button>
    <div class="lz-toast" id="lzToast"></div></div>`;
  clDrawClues();
  document.getElementById('clMore').onclick = ()=>{ if(G.lock || G.clue >= 3) return; G.clue++; lzTick(); lzVib(8); clDrawClues(); };
  document.querySelectorAll('#clOpts .quiz-opt').forEach(b=>{ b.onclick = ()=> clGuess(b); });
}
function clDrawClues(){
  const G = clG, q = G.qs[G.i];
  document.getElementById('clClues').innerHTML = q.c.slice(0, G.clue + 1).map((t, i)=> `<div class="cl-clue${i === G.clue ? ' new' : ''}"><em>${i + 1}</em><span>${t}</span></div>`).join('');
  document.getElementById('clN').textContent = G.clue + 1;
  document.getElementById('clPts').textContent = CL_POINTS[G.clue] + ' ' + L({ rur: 'number', en: 'pts' });
  const more = document.getElementById('clMore'); if(more) more.style.display = G.clue >= 3 ? 'none' : '';
}
function clGuess(b){
  const G = clG, q = G.qs[G.i]; if(G.lock || b.disabled) return;
  if(b.dataset.o === q.a){
    G.lock = true; const pts = CL_POINTS[G.clue]; G.score += pts; G.ok++; G.clueSum += G.clue + 1; G.res.push(pts); G.rev.push({ ok: true, q: q.a, why: q.c.join(' → '), tag: pts + ' ' + L({ rur: 'number', en: 'pts' }) });
    b.classList.add('correct'); document.querySelectorAll('#clOpts .quiz-opt').forEach(x=> x.disabled = true);
    document.getElementById('clScore').textContent = G.score; lzOk(); lzVib(25);
    lzToast(`+${pts} ${L({ rur: 'number', en: 'pts' })}  ·  ${q.c[3]}`, 'ok'); clNext(1900);
  } else {
    G.tries++; b.disabled = true; b.classList.add('wrong'); khShake(b); lzBad(); lzVib([40, 40, 40]);
    if(G.tries >= 2){
      G.lock = true; G.res.push(0); G.rev.push({ ok: false, q: q.a, why: q.c.join(' → '), tag: '0' }); document.querySelectorAll('#clOpts .quiz-opt').forEach(x=>{ x.disabled = true; if(x.dataset.o === q.a) x.classList.add('correct'); });
      document.getElementById('clClues').innerHTML = q.c.map((t, i)=> `<div class="cl-clue"><em>${i + 1}</em><span>${t}</span></div>`).join('');
      lzToast(`${L({ rur: 'Sahi jawab', en: 'Correct answer' })}: ${q.a}`, 'bad'); clNext(2800);
    } else lzToast(L({ rur: 'Ek koshish baaki hai.', en: 'One attempt left.' }), 'bad');
  }
}
function clNext(ms){
  clearTimeout(clG._t);
  clG._t = setTimeout(()=>{ clG.i++; clG.i >= clG.qs.length ? clEnd() : clQ(); }, ms);
}
function clEnd(){
  const G = clG, S = clS(), max = G.qs.length * 100, avg = G.ok ? (G.clueSum / G.ok).toFixed(1) : '–', acc = Math.round(G.ok / G.qs.length * 100);
  const key = G.mode, prevBest = S.best[key]; if(prevBest == null || G.score > prevBest) S.best[key] = G.score;
  if(G.mode === 'daily') S.daily[clToday()] = { score: G.score, ok: G.ok };
  S.c1 = (S.c1 || 0) + G.res.filter(p=> p === 100).length; S.games = (S.games || 0) + 1; if(G.score === max) S.perfect = 1;
  const pct = G.score / max, stars = pct >= .75 ? 3 : pct >= .45 ? 2 : 1;
  const msg = pct >= .75 ? L({ rur: 'MashaAllah! Aapka deeni ilm kamaal ka hai.', en: 'MashaAllah! Sharp Islamic knowledge.' }) : pct >= .45 ? L({ rur: 'Achha raha! Thodi aur mashq se aur behtar.', en: 'Good job! A little more practice.' }) : L({ rur: 'Koi baat nahi, seekhte rahein.', en: 'Keep learning, you will get there.' });
  const share = `🕵️ Deen Detective (Waqt24)\n${L({ rur: 'Score', en: 'Score' })}: ${G.score} / ${max}\n${L({ rur: 'Sahi', en: 'Correct' })}: ${G.ok}/${G.qs.length}\n${L({ rur: 'Average suraag', en: 'Average clue' })}: ${avg}\n${G.res.map(p=> p >= 100 ? '🟩' : p >= 50 ? '🟨' : p > 0 ? '🟧' : '🟥').join('')}`;
  saveState(); khClear();
  khResult('clue', msg, G.score, max, stars, `<div class="cl-stats"><div><b>${G.ok}/${G.qs.length}</b><small>${L({ rur: 'Sahi', en: 'Correct' })}</small></div><div><b>${avg}</b><small>${L({ rur: 'Average suraag', en: 'Avg clue' })}</small></div><div><b>${acc}%</b><small>${L({ rur: 'Durusti', en: 'Accuracy' })}</small></div><div><b>${S.best[key]}</b><small>${L({ rur: 'Behtar', en: 'Best' })}</small></div></div>
    <button type="button" class="lz-hint" id="clShare" style="margin-top:12px;">📤 ${L({ rur: 'Result share karein', en: 'Share result' })}</button>`, ()=> khClueHome(), G.rev);
  document.getElementById('clShare').onclick = async ()=>{
    try{ if(navigator.share){ await navigator.share({ text: share }); } else { await navigator.clipboard.writeText(share); lzToast(L({ rur: 'Copy ho gaya.', en: 'Copied.' }), 'ok'); } }catch(e){}
  };
}
