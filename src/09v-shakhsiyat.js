/* ===== Mashhoor Shakhsiyaat: Anbiya se le kar aaj tak (shuru se aakhir) ===== */
const SHK_GROUPS = [
  { id:'anbiya',   ic:'🌟', t:'Anbiya-e-Kiram',        sub:'Qur’an mein zikr hue 25 Nabi',        color:'#d49a1a', s:'عَلَيْهِ ٱلسَّلَامُ' },
  { id:'ahlebait', ic:'🏡', t:'Sahabiyat aur Ahl-e-Bait', sub:'Nabi ﷺ ka ghar aur khawateen',     color:'#e0709f', s:'RA' },
  { id:'khulafa',  ic:'🕌', t:'Khulafa-e-Rashidin',    sub:'Nabi ﷺ ke baad ke 4 khalifa',        color:'#2e9e5b', s:'RA' },
  { id:'sahaba',   ic:'🤝', t:'Sahaba-e-Kiram',        sub:'Baaqi Ashara Mubashshara aur doosre', color:'#3f8fe0', s:'RA' },
  { id:'ashara',   ic:'🌿', t:'Ashara Mubashshara',    sub:'Jannat ki basharat wale 10 sahaba',   color:'#d49a1a', s:'RA' },
  { id:'tabiin',   ic:'📿', t:'Tabi’een',              sub:'Sahaba ke baad ke buzurg',           color:'#8f6bd1', s:'rahimahullah' },
  { id:'imams',    ic:'📚', t:'Imam aur Muhaddithin',  sub:'Chaar Imam aur hadees ke Imam',      color:'#5c7cfa', s:'rahimahullah' },
  { id:'ulama',    ic:'🕯️', t:'Ulama aur Sufiya',      sub:'Ilm, tazkiya aur roohaniyat',        color:'#c79a2e', s:'rahimahullah' },
  { id:'science',  ic:'🔭', t:'Scientists aur Mufakkir', sub:'Science, tibb, falsafa, tareekh',  color:'#2fb6b0', s:'rahimahullah' },
  { id:'sipah',    ic:'🛡️', t:'Sipah-salar aur Mujahid', sub:'Jung ke maidan ke mashhoor qaaid',   color:'#6b7a8f', s:'rahimahullah' },
  { id:'rulers',   ic:'🏰', t:'Hukmaran aur Banane Wale', sub:'Fatah, saltanat aur idare',       color:'#c2456b', s:'rahimahullah' },
  { id:'azadi',    ic:'🇮🇳', t:'Hind ki Azadi ke Mujahid', sub:'1857 se 1947 tak',                  color:'#2e9e5b', s:'rahimahullah' },
  { id:'modern',   ic:'🖋️', t:'Jadeed Daur',           sub:'Aaj ke zamane ke mufakkir',          color:'#e07b3f', s:'rahimahullah' }
];

/* [naam, saal, chhota title, taaruf, [khaas baatein]] */
const SHK_DATA = {
anbiya:[
 ['Adam','', 'Pehle insan aur pehle Nabi','Allah ne Hazrat Adam عَلَيْهِ ٱلسَّلَامُ ko mitti se banaya aur farishton ne unhe sajda kiya. Hazrat Hawwa عَلَيْهَا ٱلسَّلَامُ unki zauja hain. Bhool hone par unhone tauba ki aur Allah ne qubool farmayi.',['Pehle insan','Jannat se zameen par aana','Tauba ki pehli misaal']],
 ['Idris','', 'Sabr aur sachchai wale Nabi','Qur’an ne Hazrat Idris عَلَيْهِ ٱلسَّلَامُ ko sachcha Nabi aur sabr karne walon mein bataya, aur unhe buland maqam par uthane ka zikr kiya.',['Qur’an mein Siddiq aur Nabi kaha gaya','Sabr karne walon mein shumar']],
 ['Nuh','', 'Sabse lambi dawat','Hazrat Nuh عَلَيْهِ ٱلسَّلَامُ ne apni qaum ko lagbhag 950 saal dawat di. Qaum ke inkar par toofan aaya, aur Allah ke hukm se kashti banayi gayi jisme imaan walon ko bachaya gaya.',['950 saal dawat','Kashti aur toofan','Ulul-Azm Rasoolon mein se']],
 ['Hud','', 'Qaum-e-Aad ke Nabi','Hazrat Hud عَلَيْهِ ٱلسَّلَامُ qaum-e-Aad ki taraf bheje gaye, jo apni taaqat aur imaaraton par ghamand karti thi. Inkar par un par tez aandhi ka azab aaya.',['Qaum-e-Aad','Tauheed ki dawat']],
 ['Salih','', 'Qaum-e-Thamud ke Nabi','Hazrat Salih عَلَيْهِ ٱلسَّلَامُ ko qaum-e-Thamud ki taraf bheja gaya. Ek oontni unki nishani thi, jise qaum ne maar diya aur azab aaya.',['Qaum-e-Thamud','Allah ki oontni']],
 ['Ibrahim','', 'Khalilullah, Tauheed ke imam','Hazrat Ibrahim عَلَيْهِ ٱلسَّلَامُ ne but-parasti ke khilaf awaz uthayi aur aag mein daale gaye, magar Allah ne unhe bacha liya. Unhone apne bete Ismail عَلَيْهِ ٱلسَّلَامُ ke saath Ka’ba ki tameer ki. Hajj aur Qurbani unki yaad se juda hai.',['Khalilullah','Ka’ba ki tameer','Qurbani ki bunyad','Ulul-Azm Rasoolon mein se']],
 ['Lut','', 'Hazrat Ibrahim عَلَيْهِ ٱلسَّلَامُ ke hum-asr','Hazrat Lut عَلَيْهِ ٱلسَّلَامُ ne apni qaum ko behayai se rokne ki dawat di. Qaum ne nahi mana to azab aaya, aur Allah ne unhe aur imaan walon ko bacha liya.',['Qaum ko burai se rokna','Imaan walon ki hifazat']],
 ['Ismail','', 'Hazrat Ibrahim عَلَيْهِ ٱلسَّلَامُ ke bete','Hazrat Ismail عَلَيْهِ ٱلسَّلَامُ ko Allah ne Ibrahim عَلَيْهِ ٱلسَّلَامُ ke imtihan mein sabr ke saath qurbani ke liye taiyar paya. Unhone Ka’ba ki tameer mein walid ka saath diya. Arab ki nasl unse milti hai.',['Sabr aur farmabardari','Ka’ba ki tameer','Nabi ﷺ unki nasl se']],
 ['Ishaq','', 'Hazrat Ibrahim عَلَيْهِ ٱلسَّلَامُ ke bete','Hazrat Ishaq عَلَيْهِ ٱلسَّلَامُ Hazrat Ibrahim عَلَيْهِ ٱلسَّلَامُ ke doosre bete aur Hazrat Yaqub عَلَيْهِ ٱلسَّلَامُ ke walid hain. Bani Israil ke zyadatar Nabi unki nasl se aaye.',['Hazrat Yaqub عَلَيْهِ ٱلسَّلَامُ ke walid','Bani Israil ke Nabiyon ka silsila']],
 ['Yaqub','', 'Israel, sabr-e-jameel ki misaal','Hazrat Yaqub عَلَيْهِ ٱلسَّلَامُ ke 12 bete the. Hazrat Yusuf عَلَيْهِ ٱلسَّلَامُ ke judai par unhone sabr-e-jameel kiya. Unhe Israel bhi kaha gaya, isi se Bani Israil naam hai.',['Sabr-e-jameel','12 bete','Bani Israil unki nasl']],
 ['Yusuf','', 'Ahsan-ul-Qasas wale Nabi','Hazrat Yusuf عَلَيْهِ ٱلسَّلَامُ ki kahani Qur’an ne Surah Yusuf mein bayan ki hai. Bhaiyon ki saazish, kuen, Misr, qaid, khwab ki tabeer aur phir khazane ki zimmedari ke baad unhone bhaiyon ko maaf kar diya.',['Surah Yusuf','Khwab ki tabeer','Afw aur maaf karna','Pakdaamani']],
 ['Ayyub','', 'Sabr ki sab se badi misaal','Hazrat Ayyub عَلَيْهِ ٱلسَّلَامُ ne lambi bimari aur azmaish mein sabr kiya aur Allah se dua ki. Allah ne unhe shifa di aur nawaza.',['Bimari mein sabr','Shifa ki dua']],
 ['Shuaib','', 'Madyan ke Nabi','Hazrat Shuaib عَلَيْهِ ٱلسَّلَامُ ne Madyan walon ko naap tol mein imandari aur ek Allah ki ibadat ki dawat di. Qaum ke inkar par azab aaya.',['Naap tol mein imandari','Madyan']],
 ['Musa','', 'Kalimullah, Firaun ke muqable','Hazrat Musa عَلَيْهِ ٱلسَّلَامُ ne Firaun ke zulm ke khilaf Bani Israil ki rehnumai ki aur unhe Misr se nijat dilayi. Allah ne unse Toor par kalam kiya aur Taurat ata ki. Qur’an mein unka zikr sabse zyada aaya hai.',['Kalimullah','Firaun se muqabla','Taurat','Ulul-Azm Rasoolon mein se']],
 ['Harun','', 'Hazrat Musa عَلَيْهِ ٱلسَّلَامُ ke bhai','Hazrat Harun عَلَيْهِ ٱلسَّلَامُ Hazrat Musa عَلَيْهِ ٱلسَّلَامُ ke bhai aur madadgaar the, aur Musa عَلَيْهِ ٱلسَّلَامُ ki dua par Nabi banaye gaye. Wo faseeh-ul-lisan the.',['Hazrat Musa عَلَيْهِ ٱلسَّلَامُ ke wazir','Faseeh zubaan']],
 ['Dhul-Kifl','', 'Sabr karne wale Nabi','Qur’an mein Hazrat Dhul-Kifl عَلَيْهِ ٱلسَّلَامُ ko sabr karne walon aur nek logon mein bataya gaya hai. Unke baare mein Qur’an mein zyada tafseel nahi aayi.',['Sabr karne walon mein shumar']],
 ['Dawud','', 'Zaboor wale Nabi aur badshah','Hazrat Dawud عَلَيْهِ ٱلسَّلَامُ ko Allah ne Zaboor ata ki, hukumat aur hikmat di. Unhone Jalut ko shikast di aur apne haath ki kamayi se rizq kamate the.',['Zaboor','Jalut par fatah','Haath ki kamayi']],
 ['Sulaiman','', 'Hazrat Dawud عَلَيْهِ ٱلسَّلَامُ ke bete','Hazrat Sulaiman عَلَيْهِ ٱلسَّلَامُ ko Allah ne azeem saltanat di aur parindon ki boli sikhayi. Saba ki malika ka waqia Qur’an mein aaya hai.',['Hikmat aur saltanat','Parindon ki boli','Malika-e-Saba']],
 ['Ilyas','', 'Ba’l ki puja ke khilaf','Hazrat Ilyas عَلَيْهِ ٱلسَّلَامُ ne apni qaum ko Ba’l ki puja chhodkar ek Allah ki taraf bulaya.',['Tauheed ki dawat']],
 ['Alyasa','', 'Hazrat Ilyas عَلَيْهِ ٱلسَّلَامُ ke baad','Hazrat Alyasa عَلَيْهِ ٱلسَّلَامُ ka zikr Qur’an mein nek aur chune hue Anbiya mein aaya hai.',['Qur’an mein Anbiya ke saath zikr']],
 ['Yunus','', 'Machhli wale Nabi','Hazrat Yunus عَلَيْهِ ٱلسَّلَامُ apni qaum se naraz ho kar chale gaye, to machhli ne unhe nigal liya. Unhone andheron mein dua ki, aur Allah ne unhe nijat di. Phir poori qaum imaan layi.',['Machhli ka waqia','Dua-e-Yunus','Qaum ka imaan lana']],
 ['Zakariyya','', 'Hazrat Maryam عَلَيْهَا ٱلسَّلَامُ ke kafeel','Hazrat Zakariyya عَلَيْهِ ٱلسَّلَامُ ne budhape mein Allah se aulad ki dua ki, aur Allah ne Hazrat Yahya عَلَيْهِ ٱلسَّلَامُ ata kiye.',['Dua ki qabuliyat','Hazrat Maryam عَلَيْهَا ٱلسَّلَامُ ke sarparast']],
 ['Yahya','', 'Bachpan se hikmat','Hazrat Yahya عَلَيْهِ ٱلسَّلَامُ ko bachpan mein hikmat di gayi. Wo nek, parhezgar aur walidain ke farmabardar the.',['Parhezgari','Walidain ki khidmat']],
 ['Isa','', 'Maryam عَلَيْهَا ٱلسَّلَامُ ke bete, Masih','Hazrat Isa عَلَيْهِ ٱلسَّلَامُ Hazrat Maryam عَلَيْهَا ٱلسَّلَامُ ke bete hain, jinhe Allah ne bina baap ke paida kiya. Unhe Injeel di gayi aur Allah ke hukm se mojizat dikhaye. Musalman maante hain ki Allah ne unhe apni taraf utha liya aur wo qayamat se pehle dobara aayenge.',['Bin baap ke paidaish','Injeel','Mojizat Allah ke hukm se','Ulul-Azm Rasoolon mein se']],
 ['Muhammad ﷺ','570 se 632 CE','Khatam-un-Nabiyyin, aakhri Nabi','Nabi ﷺ Makkah mein paida hue aur 40 saal ki umr mein wahi shuru hui. 13 saal Makkah mein dawat di, phir 622 mein Madina hijrat ki. Madina mein Islami riyasat qayam hui, Makkah fatah hua aur 632 mein Madina mein wafat hui. Qur’an aur Sunnat un hi ke zariye ummat tak pahunche.',['Aakhri Nabi aur Rasool','Qur’an ki wahi','Hijrat: 622 CE','Fatah-e-Makkah','Ulul-Azm Rasoolon mein se']]
],
ahlebait:[
 ['Khadijah bint Khuwaylid','~555 se 619 CE','Ummul Momineen, Nabi ﷺ ki pehli zauja','Hazrat Khadijah RA ek kamyab tajira thin. Wahi shuru hone par sabse pehle imaan laayin aur apna maal aur saath dono Islam ke liye lagaya. Unki wafat ka saal Nabi ﷺ ke liye gham ka saal kehlaya.',['Sabse pehle imaan laane walon mein','Maal aur himmat se saath','Wafat: 619 CE']],
 ['Aisha bint Abu Bakr','~613 se 678 CE','Ummul Momineen, aalima','Hazrat Aisha RA Hazrat Abu Bakr RA ki beti aur Nabi ﷺ ki zauja hain. Wo ilm, fiqh aur hadees ki bari aalima thin, aur 2,000 se zyada ahadees unse marwi hain. Sahaba unse masail poochhte the.',['2,000 se zyada ahadees','Fiqh aur ilm mein mahir','Sahaba ki ustaad']],
 ['Fatimah al-Zahra','~605 se 632 CE','Nabi ﷺ ki sahabzadi','Hazrat Fatimah RA Nabi ﷺ ki sabse chhoti beti, Hazrat Ali RA ki zauja aur Hazrat Hasan RA aur Hazrat Husayn RA ki walida hain. Hadees mein unhe jannati khawateen ki sardar kaha gaya hai. Unki wafat Nabi ﷺ ke chand mahine baad hui.',['Jannati khawateen ki sardar','Hasan aur Husayn RA ki walida','Saadgi aur sabr']],
 ['Sumayyah bint Khayyat','Wafat ~615 CE','Islam ki pehli shaheed khatoon','Hazrat Sumayyah RA sabse pehle imaan laane walon mein theen. Makkah ke zalimon ne unhe sakht takleefein di, magar wo imaan par sabit rahin aur shaheed hui. Unhe Islam ki pehli shaheed mana jata hai.',['Sabr aur sabit qadmi','Islam ki pehli shaheed']],
 ['Asma bint Abu Bakr','~595 se 692 CE','Zaat-un-Nitaqain','Hazrat Asma RA ne Hijrat ke safar mein Nabi ﷺ aur Hazrat Abu Bakr RA ke liye khana pahunchaya aur apne nitaq (kamarband) ke do tukde kiye, isliye unhe Zaat-un-Nitaqain kaha jata hai.',['Hijrat mein madad','Himmat aur wafadari']],
 ['Hasan ibn Ali','~625 se 670 CE','Nabi ﷺ ke nawase','Hazrat Hasan RA Nabi ﷺ ke nawase aur jannati naujawanon ke sardar hain. Unhone ummat ko jung se bachane ke liye Hazrat Muawiya RA se sulah ki, aur is se musalmanon mein ittehad hua.',['Sulah se ittehad','Narm mizaji aur sakhawat']],
 ['Husayn ibn Ali','~626 se 680 CE','Karbala ke shaheed','Hazrat Husayn RA Nabi ﷺ ke nawase hain. 680 CE mein Karbala mein unhone zulm ke khilaf istiqamat dikhayi aur apne saathiyon ke saath shaheed hue. Ummat unhe sabr aur haq par qayam rehne ki misaal maanti hai.',['Karbala: 680 CE','Haq par istiqamat']]
],
khulafa:[
 ['Abu Bakr as-Siddiq','573 se 634 CE','Pehle Khalifa, Siddiq-e-Akbar','Hazrat Abu Bakr RA mardon mein sabse pehle imaan laane walon mein se the aur hijrat ke safar mein Nabi ﷺ ke saath Ghaar-e-Thaur mein rahe. Khalifa banne ke baad unhone murtadeen aur zakat ke inkar karne walon ke fitne ko roka aur Qur’an ko ek jagah jama karwane ka kaam shuru karwaya.',['Khilafat: 632 se 634 CE','Ghaar-e-Thaur ke saathi','Qur’an ki pehli jama','Riddah ke fitne ka khatma']],
 ['Umar ibn al-Khattab','584 se 644 CE','Doosre Khalifa, Al-Faruq','Hazrat Umar RA ke daur mein Iraq, Sham, Misr aur Quds fatah hue. Unhone Hijri calendar, diwan (mahkama) aur adl ka nizam qayam kiya. Wo adl, saadgi aur raiyyat ki fikr ke liye mashhoor hain. Fajr ki namaz mein unhein shaheed kiya gaya.',['Khilafat: 634 se 644 CE','Hijri calendar ki shuruaat','Quds ki fatah','Adl aur saadgi']],
 ['Uthman ibn Affan','576 se 656 CE','Teesre Khalifa, Dhun-Nurayn','Hazrat Uthman RA Nabi ﷺ ki do sahabzadiyon ke shauhar rahe, isliye Dhun-Nurayn kehlaye. Wo bade sakhi the aur Madina mein kuan khareed kar waqf kiya aur Masjid Nabawi ke liye bhi kharch kiya. Unhone Qur’an ke ek mushaf (Mushaf-e-Uthmani) par ummat ko jama kiya. Fitne mein unhe ghar mein shaheed kiya gaya.',['Khilafat: 644 se 656 CE','Mushaf-e-Uthmani','Sakhawat','Haya ke paikar']],
 ['Ali ibn Abi Talib','~600 se 661 CE','Chauthe Khalifa, Nabi ﷺ ke chachazad','Hazrat Ali RA Nabi ﷺ ke chachazad aur damaad hain aur bachpan se Nabi ﷺ ki parwarish mein rahe. Wo bahadur, aalim aur zahid mashhoor hain. Khilafat ke daur mein fitne ke haalat the. Kufa mein unhe shaheed kiya gaya.',['Khilafat: 656 se 661 CE','Ilm aur bahaduri','Zuhd aur adl']]
],
sahaba:[
 ['Talha ibn Ubaydullah','Wafat 656 CE','Ashara Mubashshara mein se','Hazrat Talha RA un 10 sahaba mein se hain jinhe jannat ki khushkhabri di gayi. Uhud ke din unhone Nabi ﷺ ki hifazat mein apne jism par waar jhele.',['Jannat ki basharat','Uhud mein Nabi ﷺ ki hifazat']],
 ['Zubayr ibn al-Awwam','Wafat 656 CE','Hawari-e-Rasool','Hazrat Zubayr RA Nabi ﷺ ke phupheri bhai the aur un 10 sahaba mein se the jinhe jannat ki khushkhabri di gayi. Nabi ﷺ ne unhe apna Hawari kaha. Wo bahadur mujahid the.',['Jannat ki basharat','Hawari-e-Rasool']],
 ['Abdur Rahman ibn Auf','Wafat ~653 CE','Sakhi tajir','Hazrat Abdur Rahman ibn Auf RA ek kamyab tajir the aur jannat ki khushkhabri wale 10 sahaba mein se the. Unhone apna maal Islam ki raah mein dil kholkar kharch kiya.',['Jannat ki basharat','Sadqe mein sakhawat','Imaandar tijarat']],
 ['Sa’d ibn Abi Waqqas','~595 se ~674 CE','Qadisiyya ke fateh','Hazrat Sa’d RA Islam ki raah mein teer chalane wale pehle sahaba mein shumar hote hain. Hazrat Umar RA ke daur mein Qadisiyya ki jung mein Muslim lashkar ke qaaid the, jisse Iran ki fatah ka raasta khula. Wo bhi jannat ki khushkhabri wale 10 mein se hain.',['Qadisiyya ki fatah','Mustajab-ud-Dawat','Jannat ki basharat']],
 ['Sa’id ibn Zayd','Wafat ~671 CE','Ashara Mubashshara mein se','Hazrat Sa’id ibn Zayd RA un 10 sahaba mein se hain jinhe jannat ki khushkhabri mili. Wo Hazrat Umar RA ke bahnoi aur unke imaan lane ke sabab ban gaye.',['Jannat ki basharat','Ibtida mein imaan lane wale']],
 ['Abu Ubaidah ibn al-Jarrah','Wafat 639 CE','Ameen-ul-Ummah','Nabi ﷺ ne Hazrat Abu Ubaidah RA ko is ummat ka ameen kaha. Wo Sham ki fatah ke bade sipah-salar the aur un 10 sahaba mein se the jinhe jannat ki khushkhabri di gayi.',['Ameen-ul-Ummah','Sham ki fatah','Jannat ki basharat']],
 ['Bilal ibn Rabah','~580 se ~640 CE','Pehle Muazzin','Hazrat Bilal RA Habsha se the aur ghulami mein bhi imaan par sabit rahe. Makkah ke zalimon ki takleefon mein "Ahad, Ahad" kehte rahe. Nabi ﷺ ne unhe Islam ka pehla muazzin banaya.',['Pehle muazzin','Imaan par sabit qadmi','Barabari ki misaal']],
 ['Khalid ibn al-Walid','592 se 642 CE','Saifullah, bade sipah-salar','Hazrat Khalid RA Makkah ke bahadur sipah-salar the aur baad mein imaan laaye. Nabi ﷺ ne unhe Saifullah (Allah ki talwar) ka laqab diya. Yarmuk aur Iraq ki jungon mein unki qiyadat mashhoor hai.',['Saifullah ka laqab','Yarmuk ki jung','Maahir jangi hikmat-e-amali']],
 ['Salman al-Farisi','Wafat ~656 CE','Haq ki talash mein Iran se aaye','Hazrat Salman RA Iran se haq ki talash mein nikle aur Madina pahunche. Jung-e-Khandaq mein unhone khandaq (khai) khodne ka mashwara diya, jo madadgaar sabit hua.',['Haq ki talash','Khandaq ka mashwara']],
 ['Abu Hurairah','~603 se ~678 CE','Sabse zyada ahadees ke raavi','Hazrat Abu Hurairah RA ne Nabi ﷺ ki khidmat mein zyada waqt guzara aur sabse zyada ahadees yaad ki aur riwayat ki. Unse hazaron ahadees marwi hain.',['Sabse zyada ahadees','Ilm ki lagan']],
 ['Hamza ibn Abdul Muttalib','~568 se 625 CE','Asadullah, Sayyid-ush-Shuhada','Hazrat Hamza RA Nabi ﷺ ke chacha aur dudh-shareek bhai the. Wo bahadur the aur Uhud mein shaheed hue. Nabi ﷺ ne unhe Sayyid-ush-Shuhada kaha.',['Uhud ke shaheed','Bahaduri']],
 ['Mus’ab ibn Umair','Wafat 625 CE','Madina ke pehle daai','Hazrat Mus’ab RA Makkah ke aish-o-aaram ko chhod kar imaan laaye. Nabi ﷺ ne unhe Madina bheja, jahan unke zariye bahut se log musalman hue. Wo Uhud mein shaheed hue.',['Madina mein dawat','Uhud ke shaheed']],
 ['Zaid ibn Thabit','~611 se ~665 CE','Kaatib-e-Wahi','Hazrat Zaid RA Nabi ﷺ ke wahi likhne walon mein the. Hazrat Abu Bakr RA ke daur mein Qur’an ko ek jagah jama karne aur Hazrat Uthman RA ke daur mein Mushaf ki tayyari mein unka bada kirdar raha.',['Wahi ke kaatib','Qur’an ki jama aur tarteeb']],
 ['Abdullah ibn Abbas','619 se ~687 CE','Hibr-ul-Ummah, tafseer ke Imam','Hazrat Ibn Abbas RA Nabi ﷺ ke chachazad bhai the. Nabi ﷺ ne unke liye dua ki thi, aur wo Qur’an ki tafseer mein sabse mahir sahaba mein shumar hote hain.',['Tafseer ke Imam','Nabi ﷺ ki dua','Hibr-ul-Ummah']],
 ['Abdullah ibn Mas’ud','Wafat ~653 CE','Qur’an ke maahir','Hazrat Ibn Mas’ud RA Nabi ﷺ ki khidmat mein rahe aur Qur’an ki tilawat aur tafseer ke bade aalim the. Unhe Kufa mein ilm phailane ke liye bheja gaya.',['Qari aur mufassir','Kufa mein ilm']]
],
tabiin:[
 ['Uwais al-Qarni','Wafat ~657 CE','Khair-ut-Tabi’een','Hazrat Uwais RA Yaman ke the. Unhone Nabi ﷺ ko dekha nahi, magar walida ki khidmat aur imaan mein buland maqam paya. Hadees mein unka zikr khair-ut-tabi’een ke taur par aaya hai.',['Walida ki khidmat','Ishq-e-Rasool ﷺ']],
 ['Umar ibn Abdul Aziz','682 se 720 CE','Khalifa-e-Rashid jaisa adl','Banu Umayya ke khalifa the. Kam muddat ki hukumat mein unhone adl, saadgi aur ghareebon ki madad par zor diya. Unhe "paanchwa Khalifa-e-Rashid" bhi kaha jata hai.',['Adl aur saadgi','Hadees ki tadween ka hukm']],
 ['Hasan al-Basri','642 se 728 CE','Bade waaiz aur zahid','Hazrat Hasan al-Basri Basra ke bade aalim aur waaiz the. Unke bayanat mein dunya se be-raghbati aur Aakhirat ki fikr ka paigham hota tha.',['Zuhd aur taqwa','Dil par asar karne wale wa’z']],
 ['Rabia al-Adawiyya','~714 se 801 CE','Ishq-e-Ilahi ki zahida','Hazrat Rabia al-Adawiyya Basra ki zahida thin. Unki ibadat Allah ki muhabbat aur khauf par mabni thi, aur wo taqwa aur ikhlas ki misaal mani jati hain.',['Ikhlas aur muhabbat-e-Ilahi','Zuhd']]
],
imams:[
 ['Imam Abu Hanifa','699 se 767 CE','Imam-e-Azam, Fiqh Hanafi','Imam Abu Hanifa Kufa ke bade faqih the aur unke shagirdon ne Fiqh Hanafi ko tarteeb diya. Unhone qadi ka oohda lene se inkar kiya, aur is par unhe takleef bhi uthani padi. Aaj bhi duniya ke bahut se Musalman Hanafi hain.',['Fiqh Hanafi','Qiyas aur istidlal','Qazi ka oohda qubool na kiya']],
 ['Imam Malik','711 se 795 CE','Imam-e-Madina, Al-Muwatta','Imam Malik Madina ke bade aalim the. Unki kitab Al-Muwatta hadees aur Madina walon ke amal ki ibtidai aur mashhoor kitabon mein hai. Fiqh Maliki unhi se hai.',['Al-Muwatta','Fiqh Maliki','Madina ka amal']],
 ['Imam Shafi’i','767 se 820 CE','Usul-ul-Fiqh ke bani','Imam Shafi’i ne usul-ul-fiqh par pehli tartibwar kitab Al-Risala likhi. Fiqh Shafi’i unhi ki taraf mansoob hai. Wo hadees aur fiqh dono ke bade imam mane jate hain.',['Al-Risala','Al-Umm','Fiqh Shafi’i']],
 ['Imam Ahmad ibn Hanbal','780 se 855 CE','Imam-e-Ahl-us-Sunnah','Imam Ahmad ne hadees ki bari kitab Musnad Ahmad jama ki. Unhone Qur’an ke makhlooq hone ka aqeeda manne se inkar kiya aur is par qaid aur koron ki takleef sahi. Fiqh Hanbali unhi se hai.',['Musnad Ahmad','Fiqh Hanbali','Aqeede par istiqamat']],
 ['Imam al-Bukhari','810 se 870 CE','Amirul Momineen fil Hadees','Imam Bukhari ne hadees ki sabse mutabar kitab Al-Jami’ al-Sahih (Sahih Bukhari) jama ki. Wo har hadees likhne se pehle ghusl aur do rakat namaz parhte the, aur raavi ki janch mein bahut sakht the.',['Sahih Bukhari','Hadees ki janch mein sakhti','Bukhara ke the']],
 ['Imam Muslim','~815 se 875 CE','Sahih Muslim ke musannif','Imam Muslim Nishapur ke the aur Imam Bukhari ke shagird. Unki kitab Sahih Muslim hadees ki do sabse mutabar kitabon mein shumar hoti hai, jo tarteeb aur sanad ki wazahat ke liye mashhoor hai.',['Sahih Muslim','Tarteeb aur sanad']],
 ['Abu Dawud, Tirmidhi, Nasa’i, Ibn Majah','9vin sadi','Sihah Sitta ke baaqi chaar Imam','Sahih Bukhari aur Sahih Muslim ke saath in chaar Imamon ki kitabein Sunan Abi Dawud, Jami’ Tirmidhi, Sunan Nasa’i aur Sunan Ibn Majah "Sihah Sitta" (chhe mashhoor hadees ki kitabein) kehlati hain.',['Sunan Abi Dawud','Jami’ Tirmidhi','Sunan Nasa’i','Sunan Ibn Majah']]
],
ulama:[
 ['Imam al-Ghazali','1058 se 1111 CE','Hujjatul Islam','Imam Ghazali Baghdad ke bade aalim aur faqih the. Unhone dil ki islah aur ilm ko amal se jodne par zor diya. Unki mashhoor kitab Ihya Ulum al-Din hai.',['Ihya Ulum al-Din','Ilm aur tazkiya ka sangam']],
 ['Sheikh Abdul Qadir Jilani','1078 se 1166 CE','Ghaus-e-Azam ke naam se mashhoor','Sheikh Abdul Qadir Jilani Baghdad ke bade aalim, waaiz aur sufi the. Unke naam par Qadiriyya silsila chala. Unki mashhoor kitabon mein Ghunyatut Talibeen hai.',['Waaiz aur murabbi','Qadiriyya silsila']],
 ['Imam Nawawi','1233 se 1277 CE','Riyad-us-Saliheen ke musannif','Imam Nawawi Sham ke bade muhaddith aur faqih the. Unki kitabein Riyad-us-Saliheen aur Al-Arba’in an-Nawawiyya aaj bhi bahut parhi jati hain. Wo kam umr mein duniya se chale gaye.',['Riyad-us-Saliheen','Al-Arba’in','Saadgi aur ilm']],
 ['Ibn Kathir','~1300 se 1373 CE','Mufassir aur mauarrikh','Ibn Kathir Dimashq ke aalim the. Unki Tafseer Ibn Kathir aur tareekh ki kitab Al-Bidaya wa’n-Nihaya mashhoor hain.',['Tafseer Ibn Kathir','Al-Bidaya wa’n-Nihaya']],
 ['Jalaluddin Rumi','1207 se 1273 CE','Masnavi ke shayar','Maulana Rumi Qonya (aaj ke Turkey) mein rahe. Unki Masnavi aur kalaam ishq-e-Ilahi aur akhlaq ke paigham ke liye mashhoor hai.',['Masnavi','Ishq-e-Ilahi ki shayari']],
 ['Ibn Arabi','1165 se 1240 CE','Sufi mufakkir','Ibn Arabi Andalus ke sufi aur mufakkir the. Unki tehreeron par ulama ki raay mukhtalif rahi hai, isliye unhe parhte waqt mustanad aalim se rahnumai lena behtar hai.',['Futuhat al-Makkiyya','Fusus al-Hikam']],
 ['Shah Waliullah Dehlawi','1703 se 1762 CE','Hind ke mujaddid','Shah Waliullah Delhi ke bade aalim the. Unhone Qur’an ka Farsi tarjuma kiya, aur hadees, fiqh aur ummat ki islah par kaam kiya. Unki kitab Hujjatullah al-Baligha mashhoor hai.',['Qur’an ka Farsi tarjuma','Hujjatullah al-Baligha','Hind mein ilm-e-hadees']]
],
science:[
 ['Jabir ibn Hayyan','8vin sadi','Kimiya ke pehle maahiron mein','Jabir ibn Hayyan ko kimiya (chemistry) ke pehle maahiron mein ginte hain. Unhone tajurbe aur tarteeb par zor diya aur kai chemical amal bayan kiye.',['Chemistry ki bunyad','Tajurbe par zor']],
 ['Al-Khwarizmi','~780 se ~850 CE','Algebra ke bani','Al-Khwarizmi Baghdad ke riyazidaan the. Unki kitab se "algebra" lafz aur unke naam se "algorithm" lafz nikla. Unhone hindsa (number system) ko Europe tak pahunchane mein bhi bada kirdar nibhaya.',['Algebra','Algorithm lafz unke naam se','Baghdad ka Bait-ul-Hikmah']],
 ['Al-Kindi','~801 se 873 CE','Falsafe ke pehle Arab mufakkir','Al-Kindi ne riyazi, tibb, mausiqi aur falsafe par kitabein likhin aur Yunani ilm ko Arabi mein laane mein bada hissa liya.',['Falsafa aur riyazi','Tarjume ki tehreek']],
 ['Al-Razi','~865 se ~925 CE','Tabeeb aur kimiya-dan','Al-Razi ne chechak aur khasra ke farq par kitab likhi aur tibb ki kitab Al-Hawi tayyar ki. Wo aksar tajurbe aur mareez ki nigrani par zor dete.',['Chechak aur khasra ka farq','Al-Hawi']],
 ['Al-Farabi','~872 se ~950 CE','Falsafi aur mausiqi ke maahir','Al-Farabi ne Yunani falsafe ki sharah ki aur siyasat, mantiq aur mausiqi par likha. Unhe "Mu’allim-e-Sani" (doosre ustaad) kaha jata hai.',['Mantiq aur siyasat','Mu’allim-e-Sani']],
 ['Al-Biruni','973 se 1048 CE','Hind aur zameen ke mahir','Al-Biruni ne Hind ke ilm, zubanon aur mazhabon par kitab likhi aur zameen ke gher ka andaza lagaya. Wo falkiyat, jughrafiya aur tareekh ke maahir the.',['Kitab-ul-Hind','Zameen ka gher']],
 ['Ibn Sina (Avicenna)','980 se 1037 CE','Tibb ke Imam','Ibn Sina ne tibb ki mashhoor kitab Al-Qanun fi’t-Tibb likhi, jo kai sadiyon tak Europe aur Islami duniya mein parhayi gayi. Wo falsafe aur tibb dono ke maahir the.',['Al-Qanun fi’t-Tibb','Kitab-ush-Shifa']],
 ['Ibn al-Haytham (Alhazen)','~965 se ~1040 CE','Optics ke bani','Ibn al-Haytham ne Kitab-ul-Manazir likhi, jisme dekhne ka amal aur roshni ke qawaneen tajurbon se samjhaye. Unhe tajurbe par mabni scientific tareeqe ke mashhoor maahiron mein ginte hain.',['Kitab-ul-Manazir','Tajurbe ka tareeqa']],
 ['Al-Zahrawi','~936 se 1013 CE','Jarrahi (surgery) ke Imam','Al-Zahrawi Andalus ke tabeeb the. Unhone Al-Tasrif likhi, jisme jarrahi ke auzar aur tareeqe tasveer ke saath bayan hue.',['Al-Tasrif','Jarrahi ke auzar']],
 ['Ibn Rushd (Averroes)','1126 se 1198 CE','Faqih, qadi aur faylasuf','Ibn Rushd Andalus ke qadi, faqih aur faylasuf the. Unhone Aristotle ki kitabon ki sharahein likhin aur fiqh par Bidayat-ul-Mujtahid likhi.',['Bidayat-ul-Mujtahid','Falsafa ki sharahein']],
 ['Ibn al-Nafis','1213 se 1288 CE','Khoon ki gardish ke maahir','Ibn al-Nafis Dimashq aur Qahira ke tabeeb the. Unhone phephron se guzarne wali khoon ki gardish (pulmonary circulation) ke baare mein likha.',['Phephron mein khoon ki gardish','Tibb']],
 ['Al-Jazari','1136 se 1206 CE','Mechanical engineering ke maahir','Al-Jazari ne apni kitab mein ghadiyon, pani ke auzar aur khud-kaar machinon ke design bayan kiye, jo engineering ki tareekh mein ahem hain.',['Mechanical machine','Ghadiyan aur pani ke auzar']],
 ['Ibn Khaldun','1332 se 1406 CE','Tareekh aur samajiyat ke maahir','Ibn Khaldun ne Muqaddimah likhi, jisme samaj, riyasat, ma’ashi aur tareekh ke asbaab par bahas ki. Unhe samajiyat ke bunyad-guzaron mein ginte hain.',['Muqaddimah','Tareekh ka falsafa']],
 ['Ibn Battuta','1304 se ~1369 CE','Mashhoor sayyah','Ibn Battuta Morocco ke sayyah the. Unhone kai mulkon ka lamba safar kiya aur apne safar ka haal Rihla mein likha.',['Rihla','Takreeban 30 saal ka safar']]
],
sipah:[
 ['Zayd ibn Harithah','581 se 629 CE','Nabi ﷺ ke mehboob sahabi aur sipah-salar','Hazrat Zayd RA Nabi ﷺ ke azaad kiye hue ghulam aur bade pyaare sahabi the. Nabi ﷺ ne unhein kai muhimmon mein qaaid banaya, aur Mu’tah ki jung mein wo pehle qaaid the jo shaheed hue.',['Kai baar qaaid muqarrar','Mu’tah mein shahadat']],
 ['Usama ibn Zayd','615 se 680 CE','Kam umr ke sipah-salar','Hazrat Usama RA ko Nabi ﷺ ne takreeban 18 saal ki umr mein bade lashkar ka qaaid banaya, jo Islami tareekh ki sabse kam umr qaaidon mein se hai.',['Kam umr mein qiyadat']],
 ['Muhammad bin Qasim','695 se 715 CE','Sindh ke fateh','Muhammad bin Qasim ne Sindh, Multan aur Punjab ke kuch hisse fatah kiye. Is fatah se Hind ke ek hisse mein Islam ka asar shuru hua.',['Sindh aur Multan ki fatah']],
 ['Alp Arslan','1029 se 1072 CE','Seljuk sultan','Alp Arslan ne 1071 mein Manzikert ki jung mein fatah paayi, jisse Anatolia (aaj ke Turkey) ka raasta Turk qabilon ke liye khula.',['Manzikert: 1071']],
 ['Yusuf ibn Tashfin','11vin sadi','Murabitin saltanat ke bani','Yusuf ibn Tashfin ne Murabitin (Almoravid) saltanat qayam ki aur Andalus mein Isaai lashkaron ke khilaf ahem fatah paayi.',['Andalus ka difa']],
 ['Nur ad-Din Zangi','1118 se 1174 CE','Salibi jungon ke khilaf qaaid','Nur ad-Din Zangi Sham ke hukmaran the jinhone Salibiyon ka muqabla kiya aur muttahid mohaz banane ki koshish ki. Unke baad Salahuddin Ayyubi ne yehi silsila aage badhaya.',['Salibiyon ka muqabla','Sham ka ittehad']],
 ['Saif ad-Din Qutuz','Wafat 1260 CE','Ain Jalut ke fateh','Qutuz ne 1260 mein Ain Jalut ki jung mein Mongolon ko shikast di aur unki pesh-qadmi ko roka.',['Ain Jalut: 1260']],
 ['Sultan Baibars','1223 se 1277 CE','Mamluk sultan','Baibars Mamluk sultan the jinhone Salibiyon aur Mongolon dono ke khilaf jung ladi aur Misr aur Sham ko mazboot kiya.',['Salibiyon aur Mongolon ka muqabla']],
 ['Hayreddin Barbarossa','~1466 se 1546 CE','Usmani bahri admiral','Hayreddin Barbarossa Usmani bahri bede ke admiral the. Unki bahri fatahon se Mediterranean mein Usmaniyon ka ghalba qayam hua.',['Mediterranean mein Usmani ghalba']],
 ['Zahiruddin Babur','1483 se 1530 CE','Mughal saltanat ke bani','Babur ne 1526 mein Panipat ki jung ke baad Hind mein Mughal saltanat ki bunyad rakhi. Unhone apni tuzuk (Baburnama) bhi likhi.',['Panipat: 1526','Baburnama']],
 ['Ahmad Shah Durrani','1722 se 1772 CE','Durrani saltanat ke bani','Ahmad Shah Durrani ne Afghanistan mein Durrani saltanat qayam ki aur 1761 mein Panipat ki teesri jung mein fatah paayi.',['Panipat ki teesri jung: 1761']],
 ['Imam Shamil','1797 se 1871 CE','Qafqaz ke mujahid','Imam Shamil ne Qafqaz (Caucasus) mein Russi ghalbe ke khilaf lagbhag 25 saal muzahimat ki qiyadat ki.',['Qafqaz ki muzahimat']],
 ['Omar Mukhtar','1858 se 1931 CE','Libya ke "Sher-e-Sehra"','Omar Mukhtar Libya mein Italvi qabze ke khilaf muzahimat ke qaaid the. 1931 mein unhein giraftar karke phansi di gayi.',['Italvi qabze ka muqabla','Shaheed: 1931']]
],
rulers:[
 ['Tariq ibn Ziyad','Fatah: 711 CE','Andalus (Spain) ke fateh','Tariq ibn Ziyad ne 711 CE mein Andalus ki fatah ki shuruaat ki. Unke naam par Gibraltar (Jabal Tariq) mashhoor hua.',['Andalus ki fatah','Jabal Tariq']],
 ['Harun al-Rashid','763 se 809 CE','Abbasi khalifa','Harun al-Rashid ka daur Abbasi saltanat ki shaan aur ilm ke farogh ke liye mashhoor hai. Baghdad ilm aur tehzeeb ka markaz bana.',['Abbasi daur','Baghdad ka ilmi markaz']],
 ['Sultan Salahuddin Ayyubi','~1137 se 1193 CE','Ayyubi sultan','Salahuddin ne 1187 mein Hittin ki jung ke baad Quds fatah kiya. Unhe adl, rahm dili aur sabr ke liye Musalman aur Europe dono yaad karte hain.',['Hittin aur Quds ki fatah','Rahm aur adl']],
 ['Osman I','~1258 se ~1326 CE','Usmani saltanat ke bani','Osman I ne Usmani saltanat ki buniyad rakhi, jo aage chal kar bahut badi saltanat bani.',['Usmani saltanat ki bunyad']],
 ['Sultan Mehmed II (Al-Fatih)','1432 se 1481 CE','Qustuntuniya ke fateh','Sultan Mehmed II ne 1453 mein Qustuntuniya (Istanbul) fatah kiya, jo Hadees mein khushkhabri wali fatah ke taur par yaad ki jati hai. Wo ilm aur fan ke qadrdan bhi the.',['Fatah-e-Qustuntuniya: 1453','Hadees ki basharat']],
 ['Sultan Suleiman','1494 se 1566 CE','Usmani saltanat ka urooj','Sultan Suleiman ke daur mein Usmani saltanat apni bulandi par thi. Unhe "Qanuni" bhi kaha jata hai, kyunki unhone qanoon ka nizam mazboot kiya. Memaari mein Sinan jaise maahir ka daur bhi yehi tha.',['Usmani saltanat ka urooj','Qanuni nizam']],
 ['Fatima al-Fihri','Wafat ~880 CE','Qarawiyyin ki bani','Fatima al-Fihri ne 859 CE ke aas paas Fez (Morocco) mein Al-Qarawiyyin masjid aur madrasa ki bunyad rakhi, jo aage chal kar bada taleemi idara bana. Ise duniya ke qadeem taleemi idaron mein ginte hain.',['Al-Qarawiyyin: 859 CE','Taleem mein khidmat']],
 ['Sultan Abdul Hamid II','1842 se 1918 CE','Aakhri bade Usmani Sultan','Sultan Abdul Hamid II ne apne daur mein Usmani saltanat ko mazboot rakhne ki koshish ki, aur Hijaz Railway jaise mansoobe shuru kiye. Unke daur ke baare mein tareekhi raayein mukhtalif hain.',['Hijaz Railway','Saltanat ko bachane ki koshish']]
],
azadi:[
 ['Tipu Sultan','1750 se 1799 CE','Mysore ke sher','Tipu Sultan ne Angrezi tawassu ke khilaf Anglo-Mysore ki chaar jungein ladeen aur 1799 mein Srirangapatna mein maidan-e-jung mein shaheed hue.',['4 Anglo-Mysore jungein','Shahadat: 1799']],
 ['Moulvi Muhammad Baqir','1780 se 1857','Sahafi aur shaheed','Moulvi Baqir ne Delhi Urdu Akhbar mein 1857 ki bagawat ke haq mein khabrein chhapin. Angrezon ne unhein is par phansi di.',['Urdu sahafat','Shahadat: 1857']],
 ['Maulvi Liaquat Ali','1857','Allahabad ke qaaid','Maulvi Liaquat Ali ne 1857 ki bagawat mein Allahabad ki qiyadat ki aur Khusro Bagh par qabza kiya.',['1857 ki bagawat','Allahabad']],
 ['Maulvi Ahmadullah Shah','Wafat 1858 ya 1859','1857 ke mujahid','Maulvi Ahmadullah Shah ne 1857 ki bagawat mein Angrezi fauj ka muqabla kiya aur Begum Hazrat Mahal ke saath bhi shamil rahe.',['1857 ki jung','Awadh']],
 ['Begum Hazrat Mahal','1820 se 1879','Lucknow ki bahadur malika','Begum Hazrat Mahal ne 1857 mein Lucknow mein Angrezon ke khilaf bagawat ki qiyadat ki aur apne bete ko Awadh ka hukmaran muqarrar kiya.',['Lucknow ki qiyadat','1857 ki bagawat']],
 ['Bakht Khan','1797 se 1859','Dilli ki fauj ke qaaid','Bakht Khan East India Company ki fauj ke subedar the. 1857 mein unhone Delhi mein baaghi fauj ki qiyadat sambhali.',['Baaghi fauj ke commander-in-chief']],
 ['Peer Ali Khan','Wafat 1857','Patna ke kitab-farosh','Peer Ali Khan Patna ke kitab-farosh the. 1857 ki bagawat mein hissa lene par unhein Angrezon ne phansi di.',['Patna','Shahadat: 1857']],
 ['Maulvi Allauddin aur Turrebaz Khan','1857','Hyderabad Residency par hamla','Jul 1857 mein Maulvi Allauddin aur Turrebaz Khan ne Hyderabad ki Angrezi Residency par hamla kiya. Turrebaz Khan maare gaye aur Maulvi Allauddin ko Andaman bheja gaya.',['Hyderabad Residency','Andaman ki qaid']],
 ['Maulana Mahmud al-Hasan (Shaykh al-Hind)','1851 se 1920','Darul Uloom Deoband ke ustaad','Maulana Mahmud al-Hasan ne Silk Letter tehreek ki rehnumai ki. Unhein Arabia mein giraftar karke Malta mein jilawatan rakha gaya. Jamia Millia Islamia ke qayam mein bhi unka hissa raha.',['Silk Letter tehreek','Malta mein qaid','Jamia Millia ke qayam mein hissa']],
 ['Badruddin Tyabji','1844 se 1906','Congress ke pehle Muslim sadar','Badruddin Tyabji 1887 mein Indian National Congress ke pehle Musalman sadar bane.',['Congress sadar: 1887']],
 ['Hakim Ajmal Khan','1868 se 1927','Tabeeb aur qaumi rehnuma','Hakim Ajmal Khan mashhoor tabeeb the aur Jamia Millia Islamia ke bunyad-guzaron mein se hain. Wo Congress ke sadar bhi rahe.',['Tibb aur taleem','Jamia Millia']],
 ['Maulana Mazharul Haque','1866 se 1930','Champaran ke himayati','Maulana Mazharul Haque Patna ke wakeel the. Unhone Champaran Satyagraha aur Bihar ke Home Rule mein ahem hissa liya.',['Champaran Satyagraha','Bihar mein tehreek']],
 ['Maulana Mohammad Ali Jauhar','1878 se 1931','Khilafat tehreek ke rehnuma','Maulana Mohammad Ali Jauhar aur unke bhai Shaukat Ali Khilafat tehreek ke bade rehnuma the. Unhone awam ko tehreek se jora.',['Khilafat tehreek','Sahafat']],
 ['Abadi Bano Begum (Bi Amma)','1850 se 1924','Khilafat tehreek mein khawateen ki rehnuma','Bi Amma Jauhar bhaiyon ki walida thin. Unhone Khilafat tehreek mein hissa liya aur khawateen ko tehreek mein shamil karne mein ahem kirdar nibhaya.',['Khilafat tehreek','Khawateen ki bedari']],
 ['Hasrat Mohani','1875 se 1951','"Inquilab Zindabad" ke naare ke shayar','Hasrat Mohani shayar aur azadi ke mujahid the. Unhone mukammal azadi ka mutalba kiya aur "Inquilab Zindabad" ka naara diya.',['Mukammal azadi ka mutalba','Inquilab Zindabad']],
 ['Maulana Abul Kalam Azad','1888 se 1958','Al-Hilal ke editor, pehle Taleem Wazir','Maulana Azad Congress ke sabse kam umr sadar bane aur Quit India ke daur mein bhi sadar rahe. Aazad Hind ke pehle taleem wazir bane.',['Al-Hilal','Congress sadar','Pehle taleem wazir']],
 ['Saifuddin Kitchlew','1888 se 1963','Amritsar ke rehnuma','Saifuddin Kitchlew Rowlatt Act ke khilaf tehreek aur Jallianwala Bagh se pehle ke ihtijajon ke bade rehnuma the.',['Rowlatt Act ka virodh','Amritsar']],
 ['Asaf Ali','1888 se 1953','Wakeel aur rehnuma','Asaf Ali ne Bhagat Singh jaise kai azadi ke mujahidon ke muqadme lade aur Quit India ke daur mein qaid hue.',['Muqadme ki pairvi','Quit India']],
 ['Dr. Mukhtar Ahmed Ansari','1880 se 1936','Tabeeb aur Congress sadar','Dr. Ansari mashhoor tabeeb the, Congress ke sadar rahe aur Jamia Millia Islamia ki hamayat ki.',['Congress sadar','Jamia Millia']],
 ['Khan Abdul Ghaffar Khan','1890 se 1988','Sarhadi Gandhi','Khan Abdul Ghaffar Khan ne 1929 mein Khudai Khidmatgar tehreek shuru ki aur Shumal-Maghribi Sarhad par ahinsa ke saath muzahimat ki.',['Khudai Khidmatgar','Ahinsa']],
 ['Dr. Zakir Husain','1897 se 1969','Jamia ke maar, teesre sadar','Dr. Zakir Husain ne Jamia Millia Islamia ki khidmat ki aur Hind ke teesre aur pehle Musalman sadar bane.',['Jamia ke Vice Chancellor','Hind ke teesre sadar']],
 ['Allahbux Soomro','1900 se 1943','Sindh ke wazir-e-aala','Allahbux Soomro ne Sind Ittehad Party banayi, do baar Sindh ke wazir-e-aala rahe aur two-nation theory ke mukhalif the. 1943 mein unhein qatl kar diya gaya.',['Sind Ittehad Party','Two-nation theory ke mukhalif']],
 ['Ashfaqulla Khan','1900 se 1927','Kakori ke shaheed','Ashfaqulla Khan Hindustan Republican Association ke bani aur rehnumaon mein the. Kakori train action mein unhein phansi di gayi.',['Kakori','Shahadat: 1927']],
 ['Maghfoor Ahmad Ajazi','1900 se 1966','Bihar ke mujahid','Maghfoor Ajazi ne 1921 mein Non-Cooperation mein hissa liya aur All India Jamhur Muslim League qayam ki.',['Non-Cooperation','Jamhur Muslim League']],
 ['Prof. Abdul Bari','1892 se 1947','Bihar ke taleemi aur mazdoor rehnuma','Prof. Abdul Bari Bihar ke taleem-yafta aur Congress ke rehnuma the aur Tata Workers’ Union ki qiyadat ki. 1947 mein unhein qatl kiya gaya.',['Mazdoor union','Bihar']],
 ['Shah Nawaz Khan','1914 se 1983','Azad Hind Fauj ke afsar','Shah Nawaz Khan Indian National Army (Azad Hind Fauj) ke bade afsar the.',['INA','Azad Hind Fauj']],
 ['Abbas Ali','1920 se 2014','INA ke sipahi aur mujahid','Abbas Ali ne 1939 mein Angrezi fauj chhod kar INA mein shamooliyat ikhtiyar ki. INA ki shikast ke baad unhein maut ki saza sunayi gayi, aur wo 50 se zyada baar qaid hue.',['INA','50 se zyada baar qaid']],
 ['Vakkom Majeed, Muzaffar Ahmed aur Mohammed Abdur Rahman','20vin sadi','Kerala aur Bengal ke mujahid','Vakkom Majeed aur Mohammed Abdur Rahman Kerala ke Congress rehnuma the, jinhone Quit India aur two-nation theory ki mukhalifat mein hissa liya. Muzaffar Ahmed Communist Party of India ke co-founder rahe.',['Kerala ke mujahid','Bengal mein mazdoor tehreek']]
],
modern:[
 ['Allama Muhammad Iqbal','1877 se 1938 CE','Shayar-e-Mashriq','Allama Iqbal Urdu aur Farsi ke bade shayar aur mufakkir the. Unhone Musalmanon ko khudi, bedari aur ilm ka paigham diya.',['Shayari aur falsafa','Khudi ka paigham']],
 ['Malcolm X (El-Hajj Malik El-Shabazz)','1925 se 1965 CE','Haq aur insaaf ki awaz','Malcolm X Amrika ke mashhoor rehnuma the. Islam qubool karne ke baad Hajj ke safar ne unki soch badli, aur unhone nasli bhedbhav ke khilaf aur insaan ki barabari ke liye awaz uthayi.',['Hajj ke baad soch mein badlaav','Insaaf ki jadd-o-jehad']]
]
};

let shkSearch = '', shkTag = '', shkView = 'groups', shkTlMode = 'all';
const SHK_SORTS = [['def', 'Tarteeb'], ['old', 'Purane pehle'], ['new', 'Naye pehle'], ['az', 'A → Z'], ['za', 'Z → A']];
const shkSort = ()=> SHK_SORTS.some(x=> x[0] === state.shkSort) ? state.shkSort : 'def';
const SHK_GTAG = { anbiya:'Nabi', ahlebait:'Ahl-e-Bait', khulafa:'Khalifa', sahaba:'Sahabi', tabiin:'Tabi’een', imams:'Imam', ulama:'Aalim', science:'Scientist', sipah:'Sipah-salar', rulers:'Hukmaran', azadi:'Azadi ka Mujahid', modern:'Jadeed Daur' };
const SHK_KW = [
  ['Shaheed', /shaheed|shahadat/i], ['Hadees', /hadees|muhaddith|sahih/i], ['Tafseer', /tafseer|mufassir/i], ['Fiqh', /fiqh|faqih/i],
  ['Tibb', /tibb|tabeeb|jarrahi|physician/i], ['Science', /science|riyazi|algebra|optics|kimiya|chemistry|engineering|falkiyat/i],
  ['Falsafa', /falsaf|faylasuf|mantiq/i], ['Tareekh', /tareekh|mauarrikh|samajiyat/i], ['Jung aur Fatah', /jung|fatah|sipah|qaaid|lashkar/i],
  ['Taleem', /taleem|madrasa|jamia|ustaad|school|university/i], ['Hukumat', /khalifa|khilafat|sultan|saltanat|hukmaran/i],
  ['Sabr', /sabr/i], ['Tasawwuf', /sufi|zuhd|zahid|tazkiya|ishq/i], ['Shayari', /shayar|shayari/i], ['Tijarat', /tajir|tijarat/i], ['Safar', /safar|sayyah|jughrafiya/i]
];
const SHK_ASHARA = ['Abu Bakr as-Siddiq', 'Umar ibn al-Khattab', 'Uthman ibn Affan', 'Ali ibn Abi Talib', 'Talha ibn Ubaydullah', 'Zubayr ibn al-Awwam', 'Abdur Rahman ibn Auf', 'Sa’d ibn Abi Waqqas', 'Sa’id ibn Zayd', 'Abu Ubaidah ibn al-Jarrah'];
function shkTags(x){
  if(x._tg) return x._tg;
  const t = [SHK_GTAG[x.g.id]], hay = x.n + ' ' + x.t + ' ' + x.p + ' ' + x.pts.join(' ');
  SHK_KW.forEach(([k, re])=>{ if(re.test(hay)) t.push(k); });
  if(/^(Khadijah|Aisha|Fatimah|Sumayyah|Asma|Rabia|Fatima|Begum|Abadi)/.test(x.n)) t.push('Khawateen');
  if(x.g.id === 'anbiya' && /Ulul-Azm/.test(hay)) t.push('Ulul-Azm');
  if(SHK_ASHARA.includes(x.n)) t.push('Ashara Mubashshara');
  return x._tg = [...new Set(t)];
}
function shkYear(x){
  const y = x.y || '', m = y.match(/(\d{1,2})(?:vin)? sadi/);
  if(m) return (+m[1] - 1) * 100 + 50;
  const d = y.match(/\d{3,4}/); return d ? +d[0] : null;
}
const shkAll = ()=> SHK_GROUPS.flatMap(g=> (SHK_DATA[g.id] || []).map((r, i)=> ({ g, i, n:r[0], y:r[1], t:r[2], p:r[3], pts:r[4] || [] })));
function shkSorted(rows){
  const so = shkSort(), r = rows.slice(), gi = x=> SHK_GROUPS.indexOf(x.g);
  const yr = (x, d)=> { const v = shkYear(x); return v === null ? d : v; };
  if(so === 'az') r.sort((a, b)=> a.n.localeCompare(b.n));
  else if(so === 'za') r.sort((a, b)=> b.n.localeCompare(a.n));
  else if(so === 'old') r.sort((a, b)=> yr(a, -9999) - yr(b, -9999) || gi(a) - gi(b) || a.i - b.i);
  else if(so === 'new') r.sort((a, b)=> yr(b, -9999) - yr(a, -9999) || gi(a) - gi(b) || a.i - b.i);
  else r.sort((a, b)=> gi(a) - gi(b) || a.i - b.i);
  return r;
}
function shkName(x){
  const w = /^(Khadijah|Aisha|Fatimah|Sumayyah|Asma|Rabia|Fatima|Begum|Abadi)/.test(x.n), sf = (w && x.g.s === 'rahimahullah') ? 'rahimahallah' : x.g.s;
  return x.n.includes('ﷺ') ? x.n : `${x.n} ${sf}`;
}
function shkAv(x){
  if(x.g.id === 'anbiya' || x.n.includes('ﷺ')) return x.g.ic;
  const w = x.n.replace(/\(.*?\)/g, '').split(/\s+/).filter(t=> /^[A-Za-zĀ-ž]/.test(t) && !/^(ibn|bin|bint|al|an|ad|as|ar|ul|ud|of|aur|ki|ke)$/i.test(t.replace(/[-’']/g, '')));
  return ((w[0] || '?')[0] + (w[1] ? w[1][0] : '')).toUpperCase();
}
function shkCardHtml(x, n){
  return `<div class="zr-card shk-card"><div class="zr-card-top" role="button" tabindex="0" aria-expanded="false"><span class="shk-av" style="--zc:${x.g.color};">${shkAv(x)}</span><div class="zr-card-h"><b>${shkName(x)}</b><small>${x.t}</small></div><span class="shk-no">${n}</span><span class="zr-chev" aria-hidden="true">▾</span></div>
    <div class="zr-body">
      <div class="shk-chips"><span>${x.g.ic} ${x.g.t}</span>${x.y ? `<span>🗓️ ${x.y}</span>` : ''}</div>
      <p>${x.p}</p>
      ${x.pts.length ? `<ul class="shk-pts">${x.pts.map(t=>`<li>${t}</li>`).join('')}</ul>` : ''}
      <div class="zr-tags">${shkTags(x).map(t=>`<button type="button" class="zr-tag ${shkTag === t ? 'on' : ''}" data-t="${t}">#${t}</button>`).join('')}</div>
      <div class="nt-row">${noteBtn('shk:' + x.n, shkName(x).replace(/<[^>]*>/g, ''))}</div>
    </div>
  </div>`;
}
const shkSortBar = ()=> `<div class="zr-sortbar"><div class="zr-sorts" id="shkSorts"><span>↕️ Tarteeb:</span>${SHK_SORTS.map(([k, n])=>`<button type="button" class="zr-lang ${shkSort() === k ? 'on' : ''}" data-s="${k}">${n}</button>`).join('')}</div><button type="button" class="zr-lang zr-toggleall">⇕ Sab kholein</button></div>`;
function shkWireList(redraw){
  document.querySelectorAll('#shkSorts .zr-lang').forEach(b=> b.onclick = ()=>{ state.shkSort = b.dataset.s; saveState(); redraw(); });
  document.querySelectorAll('#detailBody .shk-card .zr-tag, #shkTagbar .zr-tag').forEach(b=> b.onclick = ()=>{ shkTag = (shkTag === b.dataset.t) ? '' : b.dataset.t; redraw(); });
}
/* ---- Timeline views: all / by century / by group ---- */
const SHK_TL_MODES = [['all', 'Sab'], ['sadi', 'Sadi-wise'], ['group', 'Group-wise']];
const shkCentury = y=> Math.floor((y - 1) / 100) + 1;
function shkTlItem(x, i){ return `<div class="shk-tl-item" style="--zc:${x.g.color};">${x.y ? `<span class="shk-tl-yr">${x.y}</span>` : ''}${shkCardHtml(x, i + 1)}</div>`; }
function shkTlByYear(rows){ return rows.slice().sort((a, b)=> shkYear(a) - shkYear(b) || SHK_GROUPS.indexOf(a.g) - SHK_GROUPS.indexOf(b.g) || a.i - b.i); }
function shkTimelineHtml(mode){
  const all = shkAll(), dated = all.filter(x=> shkYear(x) !== null), undated = all.filter(x=> shkYear(x) === null);
  const qadeem = undated.filter(x=> x.g.id === 'anbiya'), baqi = undated.filter(x=> x.g.id !== 'anbiya');
  const sec = (title, sub, rows, ic)=> rows.length ? `<div class="shk-tl-sec"><div class="shk-tl-h">${ic || ''} <b>${title}</b><small>${sub || ''}${sub ? ' · ' : ''}${rows.length} naam</small></div><div class="shk-tl">${rows.map(shkTlItem).join('')}</div></div>` : '';
  let out = '';
  if(mode === 'group'){
    out = SHK_GROUPS.map(g=> sec(g.t, g.sub, shkTlByYear(all.filter(x=> x.g.id === g.id && shkYear(x) !== null)).concat(all.filter(x=> x.g.id === g.id && shkYear(x) === null)), g.ic)).join('');
  }else if(mode === 'sadi'){
    const by = {}; shkTlByYear(dated).forEach(x=>{ (by[shkCentury(shkYear(x))] = by[shkCentury(shkYear(x))] || []).push(x); });
    out = sec('Qadeem daur', 'Anbiya-e-Kiram, saal ki tasreeh nahi', qadeem, '🌟')
      + Object.keys(by).map(Number).sort((a, b)=> a - b).map(c=> sec(`${c}vin sadi`, `${(c - 1) * 100 + 1} se ${c * 100} CE`, by[c], '🕰️')).join('')
      + sec('Saal ki maloomat nahi', '', baqi, '📌');
  }else{
    out = sec('Qadeem daur', 'Anbiya-e-Kiram, saal ki tasreeh nahi', qadeem, '🌟') + sec('Shuru se aakhir', 'Saal ke hisaab se', shkTlByYear(dated), '🕰️') + sec('Saal ki maloomat nahi', '', baqi, '📌');
  }
  return `<div class="shk-tlbar"><div class="zr-sorts">${SHK_TL_MODES.map(([k, n])=>`<button type="button" class="zr-lang ${mode === k ? 'on' : ''}" data-tm="${k}">${n}</button>`).join('')}</div><button type="button" class="zr-lang zr-toggleall">⇕ Sab kholein</button></div>${out}`;
}
function renderShakhsiyat(){
  document.getElementById('detailTitle').textContent = 'Mashhoor Shakhsiyaat';
  const total = shkAll().length;
  document.getElementById('detailBody').innerHTML = `
    <div class="zr-hero shk-hero"><div class="zr-hero-ic">👥</div><div><div class="zr-hero-t">Mashhoor Shakhsiyaat</div><div class="zr-hero-s">Anbiya se le kar aaj tak, shuru se aakhir · ${total} naam</div></div></div>
    <div class="shk-search"><input id="shkQ" type="search" placeholder="🔎 Naam likh kar dhoondein" value="${shkSearch.replace(/"/g, '&quot;')}" autocomplete="off"></div>
    <div id="shkBody"></div>
    <div class="backup-note">Ye maloomat mukhtasar hai aur umooman maroof tareekhi kitabon par mabni hai. Tareekhein kuch jagah taqreebi hain (~). Deeni masail aur tafseeli maloomat ke liye mustanad kitabein aur ulema dekhein.</div>
    <div class="tab-end"></div>`;
  const draw = ()=>{
    const q = shkSearch.trim().toLowerCase(), box = document.getElementById('shkBody');
    if(q){
      const hits = shkSorted(shkAll().filter(x=> (x.n + ' ' + x.t + ' ' + x.p + ' ' + shkTags(x).join(' ')).toLowerCase().includes(q)));
      box.innerHTML = (hits.length ? shkSortBar() + `<div class="zr-list">${hits.map((x, i)=> shkCardHtml(x, i + 1)).join('')}</div>` : sgEmpty(shkSearch, shkAll().map(x=> x.n.replace(/\s*\(.*?\)/g, '')), 'shkQ', 'Is naam se koi nahi mila.'));
      shkWireList(()=>{ shkSearch = shkTag || shkSearch; draw(); });
      return;
    }
    const vseg = `<div class="zk-seg shk-vseg" id="shkViews"><button data-v="groups" class="${shkView === 'groups' ? 'on' : ''}">🗂️ Groups</button><button data-v="tl" class="${shkView === 'tl' ? 'on' : ''}">🕰️ Timeline</button></div>`;
    const wireV = ()=> box.querySelectorAll('#shkViews button').forEach(b=> b.onclick = ()=>{ shkView = b.dataset.v; draw(); });
    if(shkView === 'tl'){
      box.innerHTML = vseg + shkTimelineHtml(shkTlMode);
      wireV();
      box.querySelectorAll('[data-tm]').forEach(b=> b.onclick = ()=>{ shkTlMode = b.dataset.tm; draw(); });
      shkWireList(()=>{ shkSearch = shkTag || shkSearch; draw(); });
      return;
    }
    const cnt = g=> g.id === 'ashara' ? SHK_ASHARA.length : (SHK_DATA[g.id] || []).length;
    box.innerHTML = vseg + `<div class="zr-grid">${SHK_GROUPS.map((g, i)=>`<button type="button" class="zr-tile" data-g="${g.id}" style="--zc:${g.color};"><div class="zr-tile-ic">${g.ic}</div><div class="zr-tile-t">${i + 1}. ${g.t}</div><div class="zr-tile-s">${g.sub}</div><div class="zr-tile-n">${cnt(g)} naam</div></button>`).join('')}
      <button type="button" class="zr-tile" data-g="all" style="--zc:#2e9e5b;"><div class="zr-tile-ic">📜</div><div class="zr-tile-t">Sab naam ek saath</div><div class="zr-tile-s">Saal, naam ya tag se tarteeb aur filter</div><div class="zr-tile-n">${shkAll().length} naam</div></button></div>`;
    wireV();
    box.querySelectorAll('.zr-grid .zr-tile').forEach(b=> b.onclick = ()=>{ shkTag = ''; renderShakhsiyatList(b.dataset.g); });
  };
  draw();
  document.getElementById('shkQ').oninput = e=>{ shkSearch = e.target.value; draw(); };
}
function renderShakhsiyatList(gid){
  const all = gid === 'all', ash = gid === 'ashara', g = all ? { id:'all', ic:'📜', t:'Sab naam ek saath', sub:'Anbiya se aaj tak', color:'#2e9e5b' } : ash ? { id:'ashara', ic:'🌿', t:'Ashara Mubashshara', sub:'Jannat ki basharat wale 10 sahaba', color:'#d49a1a' } : (SHK_GROUPS.find(x=> x.id === gid) || SHK_GROUPS[0]);
  const base = shkAll().filter(x=> all || (ash ? SHK_ASHARA.includes(x.n) : x.g.id === g.id)), tags = [...new Set(base.flatMap(shkTags))];
  if(shkTag && !tags.includes(shkTag)) shkTag = '';
  const rows = shkSorted(shkTag ? base.filter(x=> shkTags(x).includes(shkTag)) : base);
  document.getElementById('detailTitle').textContent = g.t;
  document.getElementById('detailBody').innerHTML = `
    <div class="zr-sechead" style="--zc:${g.color};"><div class="zr-tile-ic">${g.ic}</div><div><b>${g.t}</b><small>${g.sub} · ${rows.length} naam</small></div></div>
    ${ash ? '<div class="shk-intro">Ek hadees mein Nabi ﷺ ne in 10 sahaba ke naam le kar unhein jannat ki khushkhabri di (Sunan Abi Dawud, Jami’ Tirmidhi). Is hadees ki wajah se ye "Ashara Mubashshara" kehlate hain. Doosre sahaba ko bhi jannat ki khushkhabri ke dusre mauqe aaye hain.</div>' : ''}
    ${shkSortBar()}
    <div class="zr-tagbar" id="shkTagbar">${tags.map(t=>`<button type="button" class="zr-tag ${shkTag === t ? 'on' : ''}" data-t="${t}">#${t}</button>`).join('')}</div>
    <div class="zr-list">${rows.map((x, i)=> shkCardHtml(x, i + 1)).join('')}</div>
    <div class="tab-end"></div>`;
  shkWireList(()=> renderShakhsiyatList(gid));
}
