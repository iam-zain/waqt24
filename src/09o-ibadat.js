/* ============================================================
   NAMAZ AUR TAHARAT: Wuzu, Ghusl, Tayammum, Namaz ka tareeqa, Namaz ki rakaat.
   Hanafi fiqh ke mutabiq. Same look as Dua / Hadees / Aadaab: a card list, then a page with a scene, steps, Yaad status, Pichla / Agla.
   ============================================================ */
const IBADAT_NOTE = 'Ye tareeqa Hanafi fiqh ke mutabiq hai. Kisi masle mein shak ho to apne mustanad aalim ya imam sahab se zaroor poochhein.';
const IBADAT_GUIDES = [
  { id:'wuzu', title:'Wuzu Ka Tareeqa', ic:'💧', color:'#3f8fe0', tags:['Taharat','Hanafi','Namaz se pehle'], sub:'Farz, sunnat tareeqa aur dua',
    intro:'Wuzu namaz ki kunji hai. Jis tarah Allah ne hukm diya aur Nabi ﷺ ne sikhaya, usi tarah wuzu karein, aur paani zaya na karein.',
    sections:[
      { h:'Wuzu ke 4 Farz', ic:'⭐', steps:[
        { t:'Chehra dhona', d:'Peshani ke baalon ki jagah se thodi (neeche) tak aur ek kaan ki lau se doosre kaan ki lau tak.' },
        { t:'Dono haath kohniyon samet dhona', d:'Kohni bhi dhoni hai, sirf kalai tak nahi.' },
        { t:'Sar ka masah', d:'Kam az kam chauthai sar ka masah farz hai. Poore sar ka masah sunnat hai.' },
        { t:'Dono pair takhnon samet dhona', d:'Takhne dhone mein shamil hain. Ungliyon ke beech paani pahunchana na bhoolein.' } ] },
      { h:'Wuzu ka Sunnat Tareeqa', ic:'💧', steps:[
        { t:'Niyyat aur Bismillah', d:'Dil mein wuzu ki niyyat karein aur "Bismillah" kehkar shuru karein.', ar:'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ', tr:'Bismillahir Rahmanir Raheem' },
        { t:'Dono haath kalaaiyon tak', d:'Teen baar dhoyein. Pehle dahina, phir bayan. Ungliyon ka khilaal karein.' },
        { t:'Miswak', d:'Daant miswak ya ungli se saaf karein.' },
        { t:'Kulli', d:'Daaye haath se paani lekar teen baar kulli karein, paani poore munh mein ghumayein.' },
        { t:'Naak mein paani', d:'Daaye haath se paani naak mein charhayein aur baayen haath se naak saaf karein. Teen baar.' },
        { t:'Chehra', d:'Teen baar poora chehra dhoyein. Daadhi ho to ungliyon se khilaal karein.' },
        { t:'Dono haath kohniyon samet', d:'Pehle dahina haath, phir bayan, teen-teen baar. Angoothi ya ghadi ho to hilakar paani neeche tak pahunchayein.' },
        { t:'Sar, kaan aur gardan ka masah', d:'Geeli hatheliyon se poore sar ka ek baar masah karein, phir kaanon ka, aur ulte haath se gardan ka masah karein. Sar ka masah dhoya nahi jata, ek hi baar hota hai.' },
        { t:'Dono pair takhnon samet', d:'Pehle dahina pair, phir bayan, teen-teen baar. Baayen haath ki chhoti ungli se pair ki ungliyon ka khilaal karein.' } ] },
      { h:'Wuzu ke Baad ki Dua', ic:'🤲', steps:[
        { t:'Kalima-e-Shahadat', d:'Wuzu ke baad ye padhein. Nabi ﷺ ne farmaya ke jo achhi tarah wuzu kare phir ye padhe, uske liye Jannat ke aathon darwaze khol diye jate hain.', ar:'أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ', tr:'Ash-hadu an laa ilaaha illallaahu wahdahu laa shareeka lah, wa ash-hadu anna Muhammadan abduhu wa rasooluh' },
        { t:'Tauba aur paaki ki dua', d:'Ae Allah, mujhe tauba karne walon mein aur paaki rakhne walon mein shamil farma.', ar:'اللَّهُمَّ اجْعَلْنِي مِنَ التَّوَّابِينَ وَاجْعَلْنِي مِنَ الْمُتَطَهِّرِينَ', tr:'Allahummaj-alni minat-tawwabeena waj-alni minal-mutatahhireen' } ] },
      { h:'Wuzu Kin Cheezon Se Toot Jata Hai', ic:'⚠️', steps:[
        { t:'Pesha ya paakhana, aur hawa kharij hona', d:'In raaston se kuch bhi nikalna.' },
        { t:'Badan se khoon ya peep behkar nikalna', d:'Itna ke jism ke us hisse tak aa jaye jise wuzu mein dhoya jata hai.' },
        { t:'Munh bhar ulti', d:'Itni ulti jo bina koshish rok na saken.' },
        { t:'Soo jaana', d:'Tek lagakar, leitkar ya sajde jaisi halat mein gehri neend. Baithe-baithe halki unghh se wuzu nahi tootta.' },
        { t:'Behoshi, junoon ya nashe ki halat', d:'In sab se wuzu toot jata hai.' },
        { t:'Namaz mein qahqaha (zor se hansna)', d:'Rukoo-sajde wali namaz mein awaaz se hansne par namaz aur wuzu dono toot jate hain.' } ] }
    ],
    closing:'Wuzu mein jald-baazi na karein aur har hissa tasalli se dhoyein. Dhyan rahe: Hanafi mein khoon behna wuzu tod deta hai, jabke bahut se doosre ulama ke nazdeek nahi.' },

  { id:'ghusl', title:'Ghusl Ka Tareeqa', ic:'🚿', color:'#2fb6b0', tags:['Taharat','Hanafi','Paaki'], sub:'Farz, sunnat tareeqa aur kab farz hota hai',
    intro:'Ghusl poore badan ki paaki hai. Janabat, haiz aur nifaas ke baad ghusl farz hota hai. Namaz aur Qur’an ko haath lagane se pehle ghusl karna zaroori hai.',
    sections:[
      { h:'Ghusl Kab Farz Hota Hai', ic:'📌', steps:[
        { t:'Janabat', d:'Shahwat ke saath manii ka nikalna ya mian-biwi ka milaap (chahe manii na bhi nikle).' },
        { t:'Haiz ke baad', d:'Haiz ka khoon band hone ke baad ghusl farz hai.' },
        { t:'Nifaas ke baad', d:'Bachche ki paidaish ke baad ka khoon band hone par ghusl farz hai.' } ] },
      { h:'Ghusl ke 3 Farz', ic:'⭐', steps:[
        { t:'Kulli', d:'Poore munh mein, halaq tak, paani pahunchana.' },
        { t:'Naak mein paani', d:'Naak ke narm hisse tak paani charhana.' },
        { t:'Poore badan par paani bahana', d:'Sar ke baal se paon tak, kisi baal ke barabar jagah bhi sookhi na rahe. Naaf, kaan ke andar aur ghani zulfon ki jad tak paani pahunchana zaroori hai.' } ] },
      { h:'Ghusl ka Sunnat Tareeqa', ic:'🚿', steps:[
        { t:'Niyyat aur Bismillah', d:'Dil se paaki ki niyyat karein aur Bismillah kehkar shuru karein.' },
        { t:'Dono haath dhoyein', d:'Pehle haath kalaaiyon tak teen baar dhoyein.' },
        { t:'Jism par lagi najasat door karein', d:'Pehle istinja karein aur jahan kuch lagi ho wahan se saaf karein.' },
        { t:'Poora wuzu karein', d:'Namaz wale wuzu ki tarah. Agar paaon ke neeche paani jama ho raha ho to paaon ghusl ke baad dhoyein.' },
        { t:'Sar par teen baar paani', d:'Poore sar par teen baar paani bahayein.' },
        { t:'Daaye kandhe par teen baar', d:'Phir daaye kandhe se shuru karke dahina hissa poora dhoyein.' },
        { t:'Baayen kandhe par teen baar', d:'Phir baayen hisse par teen baar paani bahayein.' },
        { t:'Haath se malein', d:'Paani bahate hue badan ko malte jayein taake har jagah paani pahunche.' } ] },
      { h:'Ghusl Jinke Liye Sunnat Hai', ic:'🌿', steps:[
        { t:'Juma ke din', d:'Juma ki namaz ke liye ghusl karna sunnat hai.' },
        { t:'Eid ke din', d:'Eid-ul-Fitr aur Eid-ul-Adha par ghusl karna sunnat hai.' },
        { t:'Arafa ke din aur Ihram se pehle', d:'Hajj ke dino mein ghusl karna mustahab hai.' } ] }
    ],
    closing:'Ghusl ke baad alag se wuzu zaroori nahi, agar ghusl ke dauran wuzu ka koi sabab pesh na aaye. Is mein haya aur pardah ka khayal rakhein.' },

  { id:'namaz-tareeqa', title:'Namaz Ka Tareeqa', ic:'🕌', color:'#2f9e6e', tags:['Namaz','Hanafi','Qadam ba qadam'], sub:'Takbeer se salam tak, dua ke saath',
    intro:'Namaz Islam ka sutoon hai. Niche 2 rakat farz (jaise Fajr) ka tareeqa qadam ba qadam diya gaya hai, phir 3 aur 4 rakat ka farq.',
    sections:[
      { h:'Namaz se Pehle: 7 Shartein', ic:'📋', steps:[
        { t:'Badan ki paaki', d:'Wuzu ya zaroorat ho to ghusl.' },
        { t:'Kapdon ki paaki', d:'Kapde najasat se paak hon.' },
        { t:'Jagah ki paaki', d:'Namaz ki jagah paak ho.' },
        { t:'Satr dhakna', d:'Mard naaf se ghutne tak, aurat chehra, hatheli aur paon ke siwa poora badan dhake.' },
        { t:'Qibla rukh', d:'Seena Kaaba sharif ki taraf ho.' },
        { t:'Waqt', d:'Namaz apne waqt par padhi jaye.' },
        { t:'Niyyat', d:'Dil se pakka irada, zubaan se kehna behtar hai.' } ] },
      { h:'Ek Rakat ka Tareeqa', ic:'🕌', steps:[
        { t:'1. Niyyat', d:'Dil mein niyyat karein, jaise: "Main Allah ke liye aaj ki 2 rakat farz Fajr ki niyyat karta hoon, rukh Kaaba sharif ki taraf."' },
        { t:'2. Takbeer-e-Tahreema', d:'"Allahu Akbar" kehte hue dono haath kaanon tak uthayein, phir haath baandh lein: mard naaf ke neeche (daaya haath baayen par), aurat seene par. Nazar sajde ki jagah rahe.', ar:'اللَّهُ أَكْبَرُ', tr:'Allahu Akbar' },
        { t:'3. Sana', d:'Haath baandhne ke baad aahista padhein.', ar:'سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ وَتَبَارَكَ اسْمُكَ وَتَعَالَى جَدُّكَ وَلَا إِلَهَ غَيْرُكَ', tr:'Subhanakallahumma wa bihamdika wa tabarakasmuka wa ta-ala jadduka wa la ilaha ghairuk' },
        { t:'4. Ta’awwuz aur Bismillah', d:'Aahista padhein: "A-udhu billahi minash shaitanir rajeem", phir "Bismillahir Rahmanir Raheem".' },
        { t:'5. Qira’at', d:'Surah Fatiha padhein, phir koi Surah ya kam az kam 3 chhoti aayatein (jaise Surah Ikhlas). Fatiha ke baad aahista "Aameen" kehein.' },
        { t:'6. Ruku', d:'"Allahu Akbar" kehte hue ruku mein jayein. Haath ghutnon par, peeth seedhi, sar peeth ke barabar. 3 baar ye tasbeeh padhein.', ar:'سُبْحَانَ رَبِّيَ الْعَظِيمِ', tr:'Subhana Rabbiyal Azeem' },
        { t:'7. Qauma (ruku se uthna)', d:'Seedhe khade hote hue imam aur akela namazi padhe, phir "Rabbana lakal hamd" (muqtadi sirf ye).', ar:'سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ، رَبَّنَا لَكَ الْحَمْدُ', tr:'Sami-allahu liman hamidah, Rabbana lakal hamd' },
        { t:'8. Sajda', d:'"Allahu Akbar" kehte hue sajde mein jayein: pehle ghutne, phir haath, phir naak aur peshani. 3 baar ye tasbeeh padhein. Mard kohniyan zameen se uthi aur pet raanon se juda rakhein, aurat simat kar sajda kare.', ar:'سُبْحَانَ رَبِّيَ الْأَعْلَى', tr:'Subhana Rabbiyal A-la' },
        { t:'9. Jalsa (do sajdon ke beech)', d:'"Allahu Akbar" kehkar seedhe baith jayein. Baayan pair bichhakar uspar baithein aur daaya khada rakhein (aurat dono paaon daaye taraf nikalkar). Thodi der ruk kar phir "Allahu Akbar" kehte hue doosra sajda karein.' },
        { t:'10. Doosri rakat', d:'"Allahu Akbar" kehkar khade ho jayein. Ab Sana nahi padhte, seedha "Bismillah", Fatiha aur surah padhein. Ruku aur sajde isi tarah karein.' } ] },
      { h:'Qa’da, Durood aur Salam', ic:'🤲', steps:[
        { t:'Qa’da: Attahiyyat', d:'Doosri rakat ke doosre sajde ke baad baith jayein aur padhein. "Ashhadu an la ilaha" par shahadat ki ungli uthayein aur "illallah" par jhuka dein.', ar:'التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ، السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ، السَّلَامُ عَلَيْنَا وَعَلَى عِبَادِ اللَّهِ الصَّالِحِينَ، أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ', tr:'At-tahiyyatu lillahi was-salawatu wat-tayyibat. As-salamu alayka ayyuhan-nabiyyu wa rahmatullahi wa barakatuh. As-salamu alayna wa ala ibadillahis-salihin. Ash-hadu an la ilaha illallah, wa ash-hadu anna Muhammadan abduhu wa rasuluh' },
        { t:'Durood-e-Ibrahim (aakhri qa’da mein)', d:'Aakhri qa’da mein Attahiyyat ke baad padhein.', ar:'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ، اللَّهُمَّ بَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ', tr:'Allahumma salli ala Muhammadin wa ala aali Muhammad, kama sallayta ala Ibraheema wa ala aali Ibraheem, innaka Hameedun Majeed. Allahumma baarik ala Muhammadin wa ala aali Muhammad, kama barakta ala Ibraheema wa ala aali Ibraheem, innaka Hameedun Majeed' },
        { t:'Dua (Rabbij’alni)', d:'Durood ke baad koi masnoon dua padhein, jaise:', ar:'رَبِّ اجْعَلْنِي مُقِيمَ الصَّلَاةِ وَمِنْ ذُرِّيَّتِي رَبَّنَا وَتَقَبَّلْ دُعَاءِ، رَبَّنَا اغْفِرْ لِي وَلِوَالِدَيَّ وَلِلْمُؤْمِنِينَ يَوْمَ يَقُومُ الْحِسَابُ', tr:'Rabbij-alni muqeemas-salati wa min dhurriyyati, Rabbana wa taqabbal dua. Rabbanaghfir li wa liwalidayya wa lil-mu-mineena yawma yaqoomul-hisab' },
        { t:'Salam', d:'Pehle daaye phir baayen kandhe ki taraf munh pherte hue kehein.', ar:'السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ', tr:'As-salamu alaykum wa rahmatullah' } ] },
      { h:'3 aur 4 Rakat ki Namaz', ic:'🔢', steps:[
        { t:'Pehla qa’da', d:'3 ya 4 rakat mein doosri rakat ke baad sirf Attahiyyat padhkar "Allahu Akbar" kehte hue teesri rakat ke liye khade ho jayein.' },
        { t:'Teesri aur chauthi rakat', d:'Farz mein sirf Surah Fatiha padhein (surah nahi). Sunnat aur Nafl mein Fatiha ke saath surah bhi padhein.' },
        { t:'Maghrib (3 rakat)', d:'2 rakat ke baad qa’da, teesri rakat mein sirf Fatiha, phir aakhri qa’da mein Attahiyyat, Durood, dua aur Salam.' },
        { t:'Namaz ke baad', d:'Ek martaba "Astaghfirullah" teen baar, Ayat-ul-Kursi, aur Tasbeeh-e-Fatima: SubhanAllah 33, Alhamdulillah 33, Allahu Akbar 34 martaba. Phir dua karein. Tasbeeh ke liye app ka Tasbeeh Counter istemal kar sakte hain.' } ] },
      { h:'Namaz ke 6 Arkaan', ic:'⭐', steps:[
        { t:'Takbeer-e-Tahreema', d:'Allahu Akbar kehkar namaz shuru karna.' },
        { t:'Qiyam', d:'Farz mein khade hokar padhna.' },
        { t:'Qira’at', d:'Qur’an ki tilawat.' },
        { t:'Ruku', d:'Jhukna.' },
        { t:'Sajda', d:'Har rakat mein do sajde.' },
        { t:'Qa’da-e-Akhira', d:'Aakhri rakat ke baad Attahiyyat ki miqdar baithna.' } ] }
    ],
    closing:'Namaz sukoon aur khushu ke saath padhein, jaldi mein nahi. Namaz ke har rukn ko poora ada karein, aur pehle sunnat tareeqa seekhne ke liye kisi aalim se ek baar amali tareeqa zaroor dekh lein.' },

  { id:'namaz-rakaat', title:'Namaz Ki Rakaat', ic:'🔢', color:'#5c7cfa', tags:['Namaz','Farz','Sunnat','Nafl'], sub:'Paanchon namaz, Juma aur Witr',
    intro:'Har namaz mein farz ke saath sunnat aur nafl rakaat bhi hoti hain. Neeche tarteeb se likhi hain (Hanafi), har namaz ke kul rakaat ke saath.',
    sections:[
      { h:'Paanch Waqt ki Namaz', ic:'🕌', steps:[
        { t:'Fajr', d:'2 Sunnat-e-Muakkada, phir 2 Farz.<br><b>Kul: 4 rakaat</b>' },
        { t:'Zuhr', d:'4 Sunnat-e-Muakkada, 4 Farz, 2 Sunnat-e-Muakkada, 2 Nafl.<br><b>Kul: 12 rakaat</b>' },
        { t:'Asr', d:'4 Sunnat (ghair muakkada), 4 Farz.<br><b>Kul: 8 rakaat</b>' },
        { t:'Maghrib', d:'3 Farz, 2 Sunnat-e-Muakkada, 2 Nafl.<br><b>Kul: 7 rakaat</b>' },
        { t:'Isha', d:'4 Sunnat (ghair muakkada), 4 Farz, 2 Sunnat-e-Muakkada, 2 Nafl, 3 Witr (Wajib), 2 Nafl.<br><b>Kul: 17 rakaat</b>' } ] },
      { h:'Juma ki Namaz', ic:'🌙', steps:[
        { t:'Juma', d:'4 Sunnat-e-Muakkada, khutba, 2 Farz, 4 Sunnat-e-Muakkada, 2 Sunnat-e-Muakkada, 2 Nafl.<br><b>Kul: 14 (khutba ke alawa) rakaat</b>' } ] },
      { h:'Witr ki 3 Rakat (Wajib)', ic:'🌌', steps:[
        { t:'Pehli aur doosri rakat', d:'Doosri rakat ke baad qa’da mein sirf Attahiyyat padhkar teesri rakat ke liye khade ho jayein.' },
        { t:'Teesri rakat', d:'Fatiha aur surah padhkar "Allahu Akbar" kehte hue dono haath kaanon tak uthayein, phir haath baandhkar Dua-e-Qunoot padhein, phir ruku karein.' },
        { t:'Dua-e-Qunoot', d:'Ae Allah, hum tujhse madad maangte hain, tujhse bakhshish chahte hain, tujh par imaan laate hain, tujh par bharosa karte hain.', ar:'اللَّهُمَّ إِنَّا نَسْتَعِينُكَ وَنَسْتَغْفِرُكَ وَنُؤْمِنُ بِكَ وَنَتَوَكَّلُ عَلَيْكَ وَنُثْنِي عَلَيْكَ الْخَيْرَ وَنَشْكُرُكَ وَلَا نَكْفُرُكَ وَنَخْلَعُ وَنَتْرُكُ مَنْ يَفْجُرُكَ، اللَّهُمَّ إِيَّاكَ نَعْبُدُ وَلَكَ نُصَلِّي وَنَسْجُدُ وَإِلَيْكَ نَسْعَى وَنَحْفِدُ وَنَرْجُو رَحْمَتَكَ وَنَخْشَى عَذَابَكَ إِنَّ عَذَابَكَ بِالْكُفَّارِ مُلْحِقٌ', tr:'Allahumma inna nasta-eenuka wa nastaghfiruka wa nu-minu bika wa natawakkalu alayka wa nuthni alaykal khayr, wa nashkuruka wa la nakfuruka, wa nakhla-u wa natruku man yafjuruk. Allahumma iyyaka na-budu wa laka nusalli wa nasjudu wa ilayka nas-a wa nahfid, wa narju rahmataka wa nakhsha adhabaka inna adhabaka bil-kuffari mulhiq' } ] },
      { h:'Sunnat Ki Qismein', ic:'📘', steps:[
        { t:'Sunnat-e-Muakkada', d:'Jise Nabi ﷺ ne hamesha padha. Bila uzr chhodna gunah hai.' },
        { t:'Sunnat Ghair Muakkada', d:'Kabhi padhi, kabhi chhodi. Padhne par sawab hai, chhodne par gunah nahi.' },
        { t:'Nafl', d:'Mustahab aur Sunnat ke ilawa extra namaz, jis mein sirf sawab hai.' } ] }
    ],
    closing:'Farz kabhi na chhodein. Sunnat-e-Muakkada ka ahtimam karein, baqi nafl jitni himmat ho utni padhein.' },

  { id:'janaza', title:'Janaza Ka Tareeqa', ic:'🕊️', color:'#6b7a90', tags:['Janaza','Farz-e-Kifaya','Hanafi'], sub:'Ghusl, kafan, namaz-e-janaza aur dafan',
    intro:'Janaza ke huqooq adaa karna farz-e-kifaya hai: kuch log adaa kar dein to sab ki taraf se ho jata hai. Marne wale ke liye ye aakhri neki aur dua ka moqa hai.',
    sections:[
      { h:'Inteqal ke Foran Baad', ic:'🤍', steps:[
        { t:'Sabr aur Istirja', d:'Khabar milte hi sabr karein aur ye padhein.', ar:'إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ', tr:'Inna lillahi wa inna ilayhi raji-oon' },
        { t:'Aankhein band karein', d:'Narmi se aankhein band karein aur munh ko kapde ya patti se baandh dein. Dua dein.' },
        { t:'Jaldi karein', d:'Ghusl, kafan aur dafan mein bila wajah der na karein.' } ] },
      { h:'Ghusl aur Kafan', ic:'🧼', steps:[
        { t:'Ghusl', d:'Mayyit ko wuzu karakar, poora badan dhoya jata hai. Mard ko mard aur aurat ko aurat ghusl de. Satr hamesha dhaka rahe.' },
        { t:'Mard ka kafan', d:'Sunnat ke mutabiq 3 kapde: izaar, qameez (kafni) aur lifafa. Safed kapda behtar hai.' },
        { t:'Aurat ka kafan', d:'Sunnat ke mutabiq 5 kapde: izaar, qameez, lifafa, orhni (sar-band) aur seena-band.' } ] },
      { h:'Namaz-e-Janaza', ic:'🕌', steps:[
        { t:'Ye namaz kaise alag hai', d:'Isme ruku, sajda aur qa’da nahi hota. Sirf 4 takbeerein aur khade hokar dua. Dono farz hain: 4 takbeerein aur qiyam. Isme wuzu aur qibla bhi zaroori hain.' },
        { t:'Niyyat', d:'Dil mein niyyat karein: "Main Allah ke liye ye namaz-e-janaza, isme dua mayyit ke liye, imam ke peeche padhta hoon." Imam mayyit ke seene ke barabar khada hota hai.' },
        { t:'1. Pehli takbeer + Sana', d:'Haath kaanon tak utha kar "Allahu Akbar", phir haath baandh lein (mard naaf ke neeche, aurat seene par). Phir aahista Sana padhein.', ar:'سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ وَتَبَارَكَ اسْمُكَ وَتَعَالَى جَدُّكَ وَجَلَّ ثَنَاؤُكَ وَلَا إِلَهَ غَيْرُكَ', tr:'Subhanakallahumma wa bihamdika wa tabarakasmuka wa ta-ala jadduka wa jalla thana-uka wa la ilaha ghairuk' },
        { t:'2. Doosri takbeer + Durood', d:'Bina haath uthaye "Allahu Akbar" kehein aur Durood-e-Ibrahim padhein (wahi jo namaz ke aakhri qa’da mein padhte hain).' },
        { t:'3. Teesri takbeer + Janaza ki Dua', d:'Bina haath uthaye "Allahu Akbar" kehein. Baaligh mard ya aurat ke liye ye dua padhein.', ar:'اللَّهُمَّ اغْفِرْ لِحَيِّنَا وَمَيِّتِنَا وَشَاهِدِنَا وَغَائِبِنَا وَصَغِيرِنَا وَكَبِيرِنَا وَذَكَرِنَا وَأُنْثَانَا، اللَّهُمَّ مَنْ أَحْيَيْتَهُ مِنَّا فَأَحْيِهِ عَلَى الْإِسْلَامِ وَمَنْ تَوَفَّيْتَهُ مِنَّا فَتَوَفَّهُ عَلَى الْإِيمَانِ', tr:'Allahummaghfir li hayyina wa mayyitina wa shahidina wa gha-ibina wa saghirina wa kabirina wa dhakarina wa unthana. Allahumma man ahyaytahu minna fa-ahyihi alal Islam, wa man tawaffaytahu minna fa-tawaffahu alal Iman' },
        { t:'Nabalig ladke ki dua', d:'Agar mayyit nabalig bachcha ho to ye padhein.', ar:'اللَّهُمَّ اجْعَلْهُ لَنَا فَرَطًا وَاجْعَلْهُ لَنَا أَجْرًا وَذُخْرًا وَاجْعَلْهُ لَنَا شَافِعًا وَمُشَفَّعًا', tr:'Allahummaj-alhu lana faratan waj-alhu lana ajran wa dhukhran waj-alhu lana shafi-an wa mushaffa-a' },
        { t:'Nabaligh ladki ki dua', d:'Agar mayyit nabaligh bachchi ho to ye padhein.', ar:'اللَّهُمَّ اجْعَلْهَا لَنَا فَرَطًا وَاجْعَلْهَا لَنَا أَجْرًا وَذُخْرًا وَاجْعَلْهَا لَنَا شَافِعَةً وَمُشَفَّعَةً', tr:'Allahummaj-alha lana faratan waj-alha lana ajran wa dhukhran waj-alha lana shafi-atan wa mushaffa-ah' },
        { t:'4. Chauthi takbeer + Salam', d:'"Allahu Akbar" kehein, phir haath chhod dein aur pehle daayen phir baayen salam pherein.', ar:'السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ', tr:'As-salamu alaykum wa rahmatullah' } ] },
      { h:'Dafan', ic:'🌿', steps:[
        { t:'Qabr', d:'Qabr qibla ki taraf, seedhi gehri aur lahad (daayen taraf khoda hua hissa) wali behtar hai.' },
        { t:'Mayyit ko utarna', d:'Mayyit ko qibla ki taraf daayen karwat par litayein. Utarte waqt ye padhein.', ar:'بِسْمِ اللَّهِ وَعَلَى مِلَّةِ رَسُولِ اللَّهِ', tr:'Bismillahi wa ala millati Rasulillah' },
        { t:'Mitti dena', d:'Teen baar mitti daalein aur phir qabr dhak dein. Qabr ko zameen se thoda unchi (ek balisht) rakhein.' },
        { t:'Dafan ke baad', d:'Thodi der qabr ke paas theher kar mayyit ke liye saabit qadmi (sabit-qadmi) aur maghfirat ki dua karein.' } ] }
    ],
    closing:'Mayyit ke liye dua aur sadqa-e-jaariya sabse badi madad hai. Ghusl aur kafan ka amali tareeqa kisi aalim ya tajurbakar se zaroor seekhein.' },

  { id:'taraweeh', title:'Taraweeh', ic:'🌙', color:'#7a5bd6', tags:['Ramzan','Sunnat-e-Muakkada','Hanafi'], sub:'Ramzan ki raaton ki khaas namaz',
    intro:'Taraweeh Ramzan ki raaton mein Isha ke baad padhi jati hai. Hanafi mein ye sunnat-e-muakkada hai aur mard aur aurat dono ke liye hai.',
    sections:[
      { h:'Kab aur Kitni Rakaat', ic:'⏰', steps:[
        { t:'Waqt', d:'Ramzan ki har raat, Isha ki farz ke baad se subah sadiq tak.' },
        { t:'Rakaat', d:'20 rakaat, 2-2 rakaat karke 10 salam ke saath. Hanafi mein jamaat ke saath padhna sunnat-e-kifaya hai.' },
        { t:'Witr', d:'Ramzan mein Taraweeh ke baad Witr ki 3 rakaat jamaat se padhi jati hain.' } ] },
      { h:'Tareeqa', ic:'🕌', steps:[
        { t:'Niyyat', d:'"Main Allah ke liye 2 rakaat Taraweeh ki niyyat karta hoon, rukh Kaaba sharif ki taraf, imam ke peeche."' },
        { t:'Har 2 rakaat par salam', d:'2 rakaat padh kar salam phero, phir naye sire se 2 rakaat ki niyyat karein.' },
        { t:'Har 4 rakaat ke baad aaram', d:'4 rakaat ke baad thodi der baithna (tarweeha) mustahab hai. Is waqt tasbeeh, dua ya durood padhein.' },
        { t:'Aam taur par padhi jane wali tasbeeh', d:'Ye zikr bahut jagah padha jata hai (isme koi khaas hadees ki pabandi nahi).', ar:'سُبْحَانَ ذِي الْمُلْكِ وَالْمَلَكُوتِ، سُبْحَانَ ذِي الْعِزَّةِ وَالْعَظَمَةِ وَالْهَيْبَةِ وَالْقُدْرَةِ وَالْكِبْرِيَاءِ وَالْجَبَرُوتِ، سُبْحَانَ الْمَلِكِ الْحَيِّ الَّذِي لَا يَنَامُ وَلَا يَمُوتُ، سُبُّوحٌ قُدُّوسٌ رَبُّنَا وَرَبُّ الْمَلَائِكَةِ وَالرُّوحِ', tr:'Subhana dhil-mulki wal-malakut, subhana dhil-izzati wal-azamati wal-haybati wal-qudrati wal-kibriya-i wal-jabarut, subhanal-malikil-hayyil-ladhi la yanamu wa la yamut, subbuhun quddusun Rabbuna wa Rabbul-mala-ikati war-ruh' },
        { t:'Quran ka khatm', d:'Poori Ramzan mein ek baar Qur’an khatm sunna sunnat hai. Hafiz na ho to chhoti surahon se bhi padh sakte hain.' } ] }
    ],
    closing:'Taraweeh ke ruku aur sajde aaram se karein, jaldi mein na padhein. Ramzan ka asal maqsad taqwa hai.' },

  { id:'eid', title:'Eid Ki Namaz', ic:'🎉', color:'#e08a1e', tags:['Eid','Wajib','Hanafi'], sub:'Eid-ul-Fitr aur Eid-ul-Adha',
    intro:'Hanafi mein Eid ki namaz wajib hai. Ye 2 rakaat hai, isme azaan ya iqamat nahi hoti, aur jamaat ke saath ada hoti hai.',
    sections:[
      { h:'Eid ki Sunnatein', ic:'🌿', steps:[
        { t:'Ghusl aur miswak', d:'Subah uth kar ghusl karein, miswak karein.' },
        { t:'Behtar kapde aur khushbu', d:'Apne paas ke sabse achhe paak kapde pehnein aur khushbu lagayein.' },
        { t:'Eid-ul-Fitr', d:'Namaz se pehle kuch meetha (khajoor) khayein aur Sadqa-e-Fitr namaz se pehle ada kar dein. Raaste mein aahista takbeer padhein.' },
        { t:'Eid-ul-Adha', d:'Namaz ke baad kuch khayein (qurbani ka gosht behtar). Raaste mein buland awaaz se takbeer padhein.' },
        { t:'Raaste badal kar jana', d:'Eidgah ek raaste se jayein aur doosre raaste se wapas aayein.' },
        { t:'Takbeer-e-Tashreeq', d:'Eid-ul-Adha ke dino mein padhi jati hai.', ar:'اللَّهُ أَكْبَرُ اللَّهُ أَكْبَرُ لَا إِلَهَ إِلَّا اللَّهُ وَاللَّهُ أَكْبَرُ اللَّهُ أَكْبَرُ وَلِلَّهِ الْحَمْدُ', tr:'Allahu Akbar Allahu Akbar, La ilaha illallahu wallahu Akbar, Allahu Akbar wa lillahil hamd' } ] },
      { h:'Eid ki Namaz ka Tareeqa', ic:'🕌', steps:[
        { t:'Niyyat', d:'"Main Allah ke liye 2 rakaat Eid-ul-Fitr (ya Adha) ki wajib namaz, 6 zaid takbeeron ke saath, imam ke peeche padhta hoon."' },
        { t:'Pehli rakat', d:'Takbeer-e-Tahreema, haath baandh kar Sana padhein.' },
        { t:'3 zaid takbeerein', d:'Sana ke baad 3 baar "Allahu Akbar" kehein: pehli aur doosri par haath kaanon tak utha kar chhod dein, teesri par haath utha kar baandh lein.' },
        { t:'Qira’at aur rakat poori', d:'Ta’awwuz, Bismillah, Fatiha aur surah padhein, phir ruku aur sajde karein.' },
        { t:'Doosri rakat', d:'Fatiha aur surah padhne ke baad 3 zaid takbeerein kehein: teeno par haath kaanon tak utha kar chhod dein.' },
        { t:'4th takbeer ruku ke liye', d:'Phir bina haath uthaye "Allahu Akbar" kehkar ruku mein jayein. Baaki namaz aam tareeqe se poori karein, salam pheren.' },
        { t:'Khutba', d:'Namaz ke baad imam khutba deta hai. Isko sunna wajib hai.' } ] }
    ],
    closing:'Eid khushi aur shukr ka din hai. Is din ghareeb aur padosi ko bhi apni khushi mein shamil karein.' },

  { id:'tahajjud', title:'Tahajjud', ic:'🌌', color:'#3a4d8f', tags:['Raat ki Namaz','Nafl','Hanafi'], sub:'Raat ke aakhri hisse ki khaas ibadat',
    intro:'Nabi ﷺ ne farmaya ke farz ke baad sabse afzal namaz raat ki namaz hai (Sahih Muslim). Tahajjud raat ke aakhri hisse mein padhne ki ek khaas nafl ibadat hai.',
    sections:[
      { h:'Kab aur Kitni', ic:'⏰', steps:[
        { t:'Waqt', d:'Isha ke baad soo kar uthne ke baad se subah sadiq tak. Raat ka aakhri tihai (teesra hissa) sabse behtar hai.' },
        { t:'Rakaat', d:'Kam az kam 2 rakaat, aur zyada se zyada 12. Aam taur par 8 rakaat padhi jati hai.' },
        { t:'Salam', d:'2-2 rakaat karke salam pherna behtar hai.' } ] },
      { h:'Tareeqa', ic:'🕌', steps:[
        { t:'Niyyat', d:'Dil mein 2 rakaat nafl Tahajjud ki niyyat karein.' },
        { t:'Namaz', d:'Aam nafl namaz ki tarah: Sana, Fatiha, surah, ruku, sajde, qa’da, durood, dua aur salam. Aahista aur sukoon se padhein.' },
        { t:'Dua ka waqt', d:'Tahajjud ke baad aur sajde mein dil khol kar dua karein. Hadees mein hai ke raat ke aakhri hisse mein Allah ki khaas rehmat utarti hai (Bukhari, Muslim).' } ] }
    ],
    closing:'Agar neend gaalib ho to halki namaz padhein. Tahajjud ke liye raat ko jaldi sona aur Isha ke baad ghair-zaroori baatein kam karna madadgar hai.' },

  { id:'ishraq-chasht', title:'Ishraq aur Chasht', ic:'☀️', color:'#f0a020', tags:['Nafl','Subah','Hanafi'], sub:'Sooraj nikalne ke baad ki nafl namazein',
    intro:'Fajr ke baad ibadat mein masroof rehna aur phir sooraj nikalne ke baad Ishraq padhna bahut fazilat wala amal hai. Chasht (Duha) din chadhne ke baad ki nafl namaz hai.',
    sections:[
      { h:'Ishraq', ic:'🌅', steps:[
        { t:'Fazilat', d:'Hadees (Tirmidhi) mein hai ke jo Fajr ki jamaat ke baad baithkar Allah ka zikr kare, phir sooraj nikalne ke baad 2 rakaat padhe, use mukammal Hajj aur Umrah jaisa sawab milta hai.' },
        { t:'Waqt', d:'Sooraj nikalne ke takreeban 15-20 minute baad, jab makruh waqt khatam ho jaye.' },
        { t:'Rakaat', d:'2 rakaat (ya 4). Niyyat: "2 rakaat nafl Ishraq ki."' } ] },
      { h:'Chasht (Duha)', ic:'🌞', steps:[
        { t:'Fazilat', d:'Sahih Muslim mein hai ke subah har insaan ke jism ke har jod ki taraf se sadqa hota hai, aur Duha ki 2 rakaat uski taraf se kaafi hain.' },
        { t:'Waqt', d:'Sooraj ke achhi tarah buland hone se le kar zawal (dopahar) se pehle tak. Afzal waqt din ka chauthai hissa guzarne ke baad hai.' },
        { t:'Rakaat', d:'Kam az kam 2 rakaat, zyada se zyada 12. 2-2 karke padhein.' } ] }
    ],
    closing:'Ye namazein chhoti hain magar roz padhne se bohat sawab banta hai. Thoda lekin lagaatar amal pasandeeda hai.' },

  { id:'haajat', title:'Salat-ul-Haajat', ic:'🤲', color:'#2f9e6e', tags:['Nafl','Dua','Hanafi'], sub:'Kisi zaroorat ya mushkil ke liye',
    intro:'Jab koi bari zaroorat ya pareshani ho to wuzu karke 2 rakaat nafl padhna aur phir Allah se dua karna musta’mal tareeqa hai. Ye riwayat Tirmidhi aur Ibn Majah mein aati hai, jis ki sanad par ulama ne kalam kiya hai, magar fazail ke baab mein ye amal aam hai.',
    sections:[
      { h:'Tareeqa', ic:'🕌', steps:[
        { t:'Wuzu aur niyyat', d:'Achhi tarah wuzu karein aur 2 rakaat nafl Salat-ul-Haajat ki niyyat karein.' },
        { t:'2 rakaat namaz', d:'Aam nafl ki tarah: Fatiha aur surah (jaise Ikhlas), ruku aur sajde karein, salam pheren.' },
        { t:'Hamd aur Durood', d:'Salam ke baad Allah ki hamd karein aur Nabi ﷺ par durood bhejein.' },
        { t:'Dua', d:'Phir ye dua padhein aur apni zaroorat Allah ke samne rakhein.', ar:'لَا إِلَهَ إِلَّا اللَّهُ الْحَلِيمُ الْكَرِيمُ، سُبْحَانَ اللَّهِ رَبِّ الْعَرْشِ الْعَظِيمِ، الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ، أَسْأَلُكَ مُوجِبَاتِ رَحْمَتِكَ وَعَزَائِمَ مَغْفِرَتِكَ، وَالْغَنِيمَةَ مِنْ كُلِّ بِرٍّ وَالسَّلَامَةَ مِنْ كُلِّ إِثْمٍ، لَا تَدَعْ لِي ذَنْبًا إِلَّا غَفَرْتَهُ وَلَا هَمًّا إِلَّا فَرَّجْتَهُ وَلَا حَاجَةً هِيَ لَكَ رِضًا إِلَّا قَضَيْتَهَا يَا أَرْحَمَ الرَّاحِمِينَ', tr:'La ilaha illallahul Haleemul Kareem, subhanallahi Rabbil Arshil Azeem, alhamdu lillahi Rabbil Aalameen. As-aluka mujibati rahmatika wa aza-ima maghfiratik, wal ghaneemata min kulli birrin was-salamata min kulli ithm. La tada-li dhanban illa ghafartahu, wa la hamman illa farrajtahu, wa la hajatan hiya laka ridan illa qadaytaha, ya Arhamar-Rahimeen' } ] }
    ],
    closing:'Dua mein yaqeen aur sabr rakhein. Allah ka faisla hamesha hamare liye behtar hota hai, chahe dua ka jawab der se aaye.' },

  { id:'istikhara', title:'Salat-ul-Istikhara', ic:'🧭', color:'#2fb6b0', tags:['Nafl','Faisla','Sahih Bukhari'], sub:'Kisi kaam ya faisle mein Allah se bhalai maangna',
    intro:'Jab kisi kaam ya faisle mein uljhan ho, to Nabi ﷺ ne istikhara sikhaya (Sahih Bukhari, Jabir RA ki riwayat). Istikhara ka matlab hai Allah se behtari maangna.',
    sections:[
      { h:'Tareeqa', ic:'🕌', steps:[
        { t:'Pehle mashwara', d:'Pehle samajhdar aur bharosemand logon se mashwara karein, phir istikhara karein.' },
        { t:'2 rakaat nafl', d:'Wuzu karke 2 rakaat nafl padhein (farz namaz ke ilawa). Pehli rakat mein Surah Kafirun aur doosri mein Surah Ikhlas padhna behtar hai.' },
        { t:'Salam ke baad dua', d:'Salam ke baad Allah ki hamd, durood aur ye dua padhein. "Haadhal amra" ki jagah apna kaam dil mein soch kar uska naam lein.', ar:'اللَّهُمَّ إِنِّي أَسْتَخِيرُكَ بِعِلْمِكَ وَأَسْتَقْدِرُكَ بِقُدْرَتِكَ وَأَسْأَلُكَ مِنْ فَضْلِكَ الْعَظِيمِ، فَإِنَّكَ تَقْدِرُ وَلَا أَقْدِرُ وَتَعْلَمُ وَلَا أَعْلَمُ وَأَنْتَ عَلَّامُ الْغُيُوبِ، اللَّهُمَّ إِنْ كُنْتَ تَعْلَمُ أَنَّ هَذَا الْأَمْرَ خَيْرٌ لِي فِي دِينِي وَمَعَاشِي وَعَاقِبَةِ أَمْرِي فَاقْدُرْهُ لِي وَيَسِّرْهُ لِي ثُمَّ بَارِكْ لِي فِيهِ، وَإِنْ كُنْتَ تَعْلَمُ أَنَّ هَذَا الْأَمْرَ شَرٌّ لِي فِي دِينِي وَمَعَاشِي وَعَاقِبَةِ أَمْرِي فَاصْرِفْهُ عَنِّي وَاصْرِفْنِي عَنْهُ وَاقْدُرْ لِيَ الْخَيْرَ حَيْثُ كَانَ ثُمَّ أَرْضِنِي بِهِ', tr:'Allahumma inni astakheeruka bi-ilmika, wa astaqdiruka bi-qudratika, wa as-aluka min fadlikal azeem. Fa innaka taqdiru wa la aqdir, wa ta-lamu wa la a-lam, wa anta Allamul Ghuyoob. Allahumma in kunta ta-lamu anna haadhal amra khayrun li fi deeni wa ma-ashi wa aaqibati amri, faqdurhu li wa yassirhu li thumma baarik li feeh. Wa in kunta ta-lamu anna haadhal amra sharrun li fi deeni wa ma-ashi wa aaqibati amri, fasrifhu anni wasrifni anhu, waqdur liyal khayra haythu kaana thumma ardini bih' },
        { t:'Phir kya karein', d:'Istikhara ke baad jis taraf dil ka sukoon aur raasta aasan lage, tawakkul karke wahi kaam karein. Ye zaroori nahi ke khwab hi aaye.' } ] }
    ],
    closing:'Istikhara ek dua hai, koi jadoo ya khwab dekhne ka amal nahi. Faisla karne ke baad Allah par bharosa rakhein.' },

  { id:'sahw', title:'Sajda-e-Sahw', ic:'⏱️', color:'#c0605a', tags:['Namaz','Bhool','Hanafi'], sub:'Namaz mein bhool ho jaye to',
    intro:'Namaz mein agar bhool se koi wajib chhoot jaye to namaz doharane ke bajaye 2 sajde-e-sahw kar lene se namaz theek ho jati hai. Ye Allah ki aasani hai.',
    sections:[
      { h:'Kab Wajib Hota Hai', ic:'📌', steps:[
        { t:'Koi wajib bhool kar chhoot jaye', d:'Jaise Fatiha ke baad surah milana bhool jana, ya pehla qa’da (3 ya 4 rakaat mein) chhod dena.' },
        { t:'Wajib mein der ho jaye', d:'Jaise Fatiha padhne ya ruku-sajde mein kuch der ke liye soch mein ruk jana.' },
        { t:'Rakaat ya sajde ki ginti mein shak', d:'Shak ho to zyada par yaqeen karein ya jis taraf dil jame us par amal karein, aur akhir mein sajda-e-sahw kar lein.' } ] },
      { h:'Tareeqa', ic:'🕌', steps:[
        { t:'Aakhri qa’da tak padhein', d:'Aakhri qa’da mein sirf Attahiyyat padhein.' },
        { t:'Sirf daayen taraf salam', d:'Phir sirf daayen taraf ek salam pherein.' },
        { t:'2 sajde karein', d:'"Allahu Akbar" kehkar 2 sajde karein, beech mein jalsa karke.' },
        { t:'Dobara qa’da', d:'Phir baith kar Attahiyyat, Durood-e-Ibrahim aur dua padhein, aur dono taraf salam pherein.' } ] },
      { h:'Zaroori Baatein', ic:'⚠️', steps:[
        { t:'Farz chhoot jaye', d:'Agar koi farz (jaise ruku ya sajda) chhoot jaye to sajda-e-sahw se kaam nahi chalta, namaz dobara padhni hogi.' },
        { t:'Sunnat chhoot jaye', d:'Sunnat ya mustahab chhootne par sajda-e-sahw nahi hota.' },
        { t:'Jaan-boojh kar wajib chhodna', d:'Isme sajda-e-sahw kaafi nahi, namaz dobara padhna wajib hai.' },
        { t:'Kai bhool par bhi 2 sajde', d:'Ek namaz mein kai wajib chhootein to bhi sirf 2 sajde kaafi hain.' } ] }
    ],
    closing:'Bhool insaan ki fitrat hai. Ghabrayein nahi, sajda-e-sahw kar ke namaz mukammal kar lein.' },

  { id:'qasr', title:'Safar Ki Namaz (Qasr)', ic:'🧳', color:'#3f8fe0', tags:['Safar','Qasr','Hanafi'], sub:'Musafir ki namaz ke ahkaam',
    intro:'Safar mein Allah ne namaz mein aasani di hai: 4 rakaat wali farz namaz 2 rakaat padhi jati hai. Hanafi mein musafir ke liye qasr zaroori hai, ikhtiyari nahi.',
    sections:[
      { h:'Musafir Kaun Hai', ic:'📌', steps:[
        { t:'Doori', d:'Hanafi ke mutabiq takreeban 48 meel (aam taur par 77-78 km) ya zyada ka safar karne ki niyyat ho.' },
        { t:'Qasr kab shuru hota hai', d:'Apni basti ya shehar ki aabadi ki hadd se bahar nikalte hi.' },
        { t:'Qasr kab khatam hota hai', d:'Apne watan ya shehar ki hadd mein dakhil hone par. Ya jahan 15 din ya zyada rukne ki pakki niyyat ho, wahan muqeem ho jata hai.' } ] },
      { h:'Safar mein Namaz', ic:'🕌', steps:[
        { t:'Zuhr, Asr, Isha', d:'4 rakaat ki farz ki jagah 2 rakaat padhein.' },
        { t:'Fajr aur Maghrib', d:'Inme koi kami nahi, Fajr 2 aur Maghrib 3 rakaat hi rahengi.' },
        { t:'Witr', d:'Witr ki 3 rakaat poori padhein.' },
        { t:'Sunnatein', d:'Fajr ki sunnat na chhodein. Baaki sunnatein halat dekh kar padh sakte hain. Jaldi ho ya thakan ho to chhodna gunah nahi.' },
        { t:'Imam ke saath', d:'Agar musafir muqeem imam ke peeche namaz padhe to imam ke saath poori namaz padhega. Agar musafir imam ho to wo 2 rakaat ke baad salam pherega aur muqeem muqtadi apni baaki rakaat khud poori karenge.' },
        { t:'Qaza', d:'Safar mein qaza hui namaz ghar wapas aakar bhi 2 rakaat hi padhi jati hai, aur ghar mein qaza hui namaz safar mein poori padhi jati hai.' } ] }
    ],
    closing:'Safar ke masail mein halaat aur door ka hisaab alag ho sakta hai. Zaroorat ho to apne mustanad aalim se poochh lein.' },

  { id:'tauba', title:'Salat-ut-Tauba', ic:'💧', color:'#4a8fd0', tags:['Nafl','Tauba','Istighfar'], sub:'Gunah ke baad Allah ki taraf lautna',
    intro:'Jab insaan se koi gunah ho jaye to Allah ki rehmat se naumeed hone ke bajaye fauran tauba karna chahiye. Hadees mein tauba ke liye 2 rakaat nafl padhne ka tareeqa aaya hai (Sunan Abu Dawood, Tirmidhi, Abu Bakr RA se).',
    sections:[
      { h:'Tauba ki Shartein', ic:'📌', steps:[
        { t:'Gunah chhod dena', d:'Jis gunah par tauba kar rahe hain use fauran chhod dein.' },
        { t:'Dil se sharminda hona', d:'Dil mein sachchi nadamat ho ke Allah ki na-farmani hui.' },
        { t:'Dobara na karne ka pakka irada', d:'Pakka irada karein ke ye gunah dobara nahi karenge.' },
        { t:'Haq wapas karna', d:'Agar gunah mein kisi bande ka haq tha (maal ya izzat) to use lauta dein ya maafi maang lein.' } ] },
      { h:'Namaz ka Tareeqa', ic:'🕌', steps:[
        { t:'Achhi tarah wuzu', d:'Pehle achhi tarah wuzu karein.' },
        { t:'2 rakaat nafl', d:'Makruh waqt chhod kar kisi bhi waqt 2 rakaat nafl Salat-ut-Tauba ki niyyat se padhein. Aam nafl namaz ki tarah Fatiha aur surah milayein.' },
        { t:'Salam ke baad istighfar', d:'Salam ke baad Allah ki hamd aur durood ke baad dil se istighfar karein. Sabse behtareen istighfar ye hai.', ar:'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ لَكَ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ', tr:'Allahumma anta Rabbi la ilaha illa ant, khalaqtani wa ana abduka wa ana ala ahdika wa wa-dika mastata-t, a-udhu bika min sharri ma sana-t, abu-u laka bi-ni-matika alayya wa abu-u laka bidhanbi, faghfir li fa innahu la yaghfirudh-dhunuba illa ant' },
        { t:'Allah ka wada', d:'Hadees mein hai ke jo banda gunah kar baithe, phir achhi tarah wuzu karke 2 rakaat padhe aur Allah se maghfirat maange, to Allah use bakhsh deta hai.' } ] }
    ],
    closing:'Allah tauba karne walon ko pasand farmata hai. Gunah ke baad der na karein, aur Allah ki rehmat se kabhi naumeed na hon.' },

  { id:'zabah', title:'Zabah Ka Tareeqa', ic:'🐑', color:'#8a6d3b', tags:['Zabah','Halal','Hanafi'], sub:'Janwar ko sahi tareeqe se halal karna',
    intro:'Islam mein janwar ko zabah karna ek ibadat jaisa amal hai, jisme Allah ka naam lena aur janwar par raham karna zaroori hai. Nabi ﷺ ne farmaya: Allah ne har cheez mein ehsan (achhai) farz ki hai, to zabah karo to achhe tareeqe se karo, chhuri tez karo aur janwar ko aaram do (Sahih Muslim).',
    sections:[
      { h:'Zabah ki Shartein', ic:'📌', steps:[
        { t:'Zabah karne wala', d:'Muslim (ya Ahl-e-Kitab), aqal wala ho. Bachcha jo samajhdar ho wo bhi kar sakta hai.' },
        { t:'Allah ka naam', d:'Zabah ke waqt "Bismillahi Allahu Akbar" kehna zaroori hai. Jaan-boojh kar chhodne se janwar halal nahi hota. Bhool kar chhoot jaye to Hanafi mein halal hai.' },
        { t:'Janwar halal ho', d:'Sirf halal janwar ka zabah jaiz hai. Murda ya Allah ke siwa kisi aur ke naam par zabah kiya hua janwar haram hai.' },
        { t:'Tez chhuri', d:'Chhuri bohat tez ho taake janwar ko kam se kam takleef ho.' } ] },
      { h:'Zabah ka Tareeqa', ic:'🔪', steps:[
        { t:'Janwar ko aaram dein', d:'Zabah se pehle janwar ko pani pilayein. Chhuri janwar ke samne tez na karein, aur ek janwar ke samne doosre ko zabah na karein.' },
        { t:'Qibla rukh litana', d:'Janwar ko baayen karwat par is tarah litayein ke uska munh qibla ki taraf ho. Ye mustahab hai.' },
        { t:'Bismillah', d:'Chhuri chalane se pehle ye kehein.', ar:'بِسْمِ اللَّهِ وَاللَّهُ أَكْبَرُ', tr:'Bismillahi Allahu Akbar' },
        { t:'Rag kaatna', d:'Gale par, jabde ke neeche, tezi se chhuri chalayein. Chaar ragon (saans ki naali, khane ki naali aur 2 moti ragein) mein se kam az kam 3 kat jani chahiye. Chhuri ek hi baar mein kheinch kar kaatein, baar-baar chhuri na uthayein.' },
        { t:'Jaan nikalne tak ruk jayein', d:'Jab tak janwar poori tarah thanda na ho jaye, khaal na utarein aur gardan na todein.' } ] },
      { h:'Zaroori Adab', ic:'🌿', steps:[
        { t:'Raham', d:'Janwar ko takleef na dein. Use ghaseet kar na le jayein aur zabah ke qareeb tak pyaasa na rakhein.' },
        { t:'Khoon ka khayal', d:'Behta hua khoon saaf karein, safai ka khayal rakhein.' },
        { t:'Zabah ki dua', d:'Zabah ke waqt aur baad ki dua Dua list mein Zabah aur Qurbani ke tahat bhi maujood hai.' } ] }
    ],
    closing:'Zabah mein sab se zaroori cheez Allah ka naam aur janwar par raham hai. Bade janwar ka zabah karna seekhne ke liye kisi tajurbakar se pehle amali tareeqa dekh lein.' },

  { id:'qurbani', title:'Qurbani Ke Masail', ic:'🕋', color:'#b5832b', tags:['Qurbani','Wajib','Hanafi'], sub:'Kis par wajib, kab, kaun sa janwar, aur dua',
    intro:'Qurbani Hazrat Ibrahim (AS) ki sunnat hai, jo Eid-ul-Adha ke dinon mein ki jati hai. Qur’an mein hai ke Allah tak na unka gosht pahunchta hai na khoon, balke tumhara taqwa pahunchta hai (Surah Al-Hajj 22:37).',
    sections:[
      { h:'Qurbani Kis Par Wajib Hai', ic:'📌', steps:[
        { t:'Hanafi mein wajib', d:'Har aqal wale, baaligh, muqeem (jo musafir na ho) Musalman par jiske paas nisab ke barabar maal ho (sadqa-e-fitr wala nisab, yaani saadhe 52 tola chandi ke barabar maal ya uski qeemat).' },
        { t:'Saal guzarna zaroori nahi', d:'Zakat ke mukable mein yahan maal par poora saal guzarna shart nahi, Eid ke dinon mein nisab ka malik hona kaafi hai.' },
        { t:'Apne aur doosron ki taraf se', d:'Wajib sirf apni taraf se hai. Biwi, bachchon ya walidain ki taraf se karna chahein to wo nafl hai.' } ] },
      { h:'Waqt', ic:'⏰', steps:[
        { t:'Qurbani ke 3 din', d:'10, 11 aur 12 Zil-Hijja. Pehla din sabse afzal hai.' },
        { t:'Shehar mein', d:'Eid ki namaz ke baad. Namaz se pehle qurbani sahi nahi hoti.' },
        { t:'Gaon mein jahan Eid ki namaz wajib nahi', d:'Subah sadiq ke baad se.' } ] },
      { h:'Qurbani ke Janwar', ic:'🐑', steps:[
        { t:'Bakri, bhed, dumba', d:'Kam az kam 1 saal ka. Dumba ya bhed agar itna mota ho ke saal bhar ka lage aur 6 mahine ka ho to bhi jaiz hai. Ismein 1 hissa hai.' },
        { t:'Gaay, bhains', d:'Kam az kam 2 saal ki. Ismein 7 hisse tak ho sakte hain.' },
        { t:'Oont', d:'Kam az kam 5 saal ka. Ismein bhi 7 hisse tak.' },
        { t:'Ayb (nuqs) se paak', d:'Janwar andha, bohat langda, bohat bimar, kata hua kaan ya poori dum kata hua, ya bohat dubla na ho.' } ] },
      { h:'Qurbani ka Tareeqa', ic:'🕋', steps:[
        { t:'Pehle se tayyari', d:'Janwar ko achhi tarah khilayein-pilayein. Chhuri pehle se tez karke rakhein aur janwar ko dikhayen nahi.' },
        { t:'Qibla rukh litana', d:'Janwar ko baayen karwat par qibla rukh litayein. Apna rukh bhi qibla ki taraf rakhein.' },
        { t:'Dua padhein', d:'Zabah se pehle ye dua padhein (Sunan Abu Dawood).', ar:'إِنِّي وَجَّهْتُ وَجْهِيَ لِلَّذِي فَطَرَ السَّمَاوَاتِ وَالْأَرْضَ حَنِيفًا وَمَا أَنَا مِنَ الْمُشْرِكِينَ، إِنَّ صَلَاتِي وَنُسُكِي وَمَحْيَايَ وَمَمَاتِي لِلَّهِ رَبِّ الْعَالَمِينَ، لَا شَرِيكَ لَهُ وَبِذَلِكَ أُمِرْتُ وَأَنَا مِنَ الْمُسْلِمِينَ', tr:'Inni wajjahtu wajhiya lilladhi fataras-samawati wal-arda hanifan wa ma ana minal-mushrikeen. Inna salati wa nusuki wa mahyaya wa mamati lillahi Rabbil-aalameen, la shareeka lah, wa bidhalika umirtu wa ana minal-muslimeen' },
        { t:'Bismillah', d:'Phir ye kehkar zabah karein.', ar:'بِسْمِ اللَّهِ اللَّهُ أَكْبَرُ، اللَّهُمَّ مِنْكَ وَلَكَ', tr:'Bismillahi Allahu Akbar, Allahumma minka wa laka' },
        { t:'Zabah ke baad', d:'Ye dua padhein (Sahih Muslim, Nabi ﷺ se). Apni taraf se karein to "Muhammadin" ki jagah apna naam bhi le sakte hain.', ar:'اللَّهُمَّ تَقَبَّلْ مِنْ مُحَمَّدٍ وَآلِ مُحَمَّدٍ وَمِنْ أُمَّةِ مُحَمَّدٍ', tr:'Allahumma taqabbal min Muhammadin wa aali Muhammadin wa min ummati Muhammad' } ] },
      { h:'Gosht aur Khaal', ic:'🍲', steps:[
        { t:'Gosht ke 3 hisse', d:'Mustahab hai ke 3 hisse karein: ek apne ghar ke liye, ek rishtedaron aur doston ke liye, aur ek ghareebon ke liye.' },
        { t:'Khaal', d:'Khaal sadqa kar dein ya kisi dini idare ko de dein. Qasai ya zabah karne wale ki mazdoori gosht ya khaal se na dein.' },
        { t:'Mustahab: baal aur nakhun', d:'Zil-Hijja ka chaand dikhne ke baad qurbani karne tak baal aur nakhun na kaatna mustahab hai (Sahih Muslim).' } ] }
    ],
    closing:'Qurbani ka maqsad Allah ki raza aur taqwa hai, dikhawe ya gosht khane ka nahi. Maal aur janwar ki sharton mein shak ho to apne aalim se zaroor poochhein.' },

  { id:'tayammum', title:'Tayammum Ka Tareeqa', ic:'🏜️', color:'#d4a017', tags:['Taharat','Hanafi','Paani na ho'], sub:'Jab wuzu ya ghusl mumkin na ho',
    intro:'Jab paani na mile ya istemal se nuqsan ka khauf ho to wuzu aur ghusl ki jagah pak mitti se tayammum karna Allah ki ek aasani hai.',
    sections:[
      { h:'Tayammum Kab Jaiz Hai', ic:'📌', steps:[
        { t:'Paani maujood na ho', d:'Aas-paas kam az kam ek meel (takreeban 1.8 km) tak paani na mile.' },
        { t:'Bimari', d:'Paani se bimari ke badhne ya der se theek hone ka khauf ho.' },
        { t:'Sakht sardi', d:'Jaan ya sehat ko nuqsan ka khauf ho aur garam paani ka intezam na ho.' } ] },
      { h:'Tayammum ke Farz', ic:'⭐', steps:[
        { t:'Niyyat', d:'Paaki hasil karne ya namaz padhne ke jawaz ki niyyat.' },
        { t:'Chehre ka masah', d:'Poore chehre par haath pherna.' },
        { t:'Kohniyon samet dono haath ka masah', d:'Dono haath kohniyon tak masah karna.' } ] },
      { h:'Tayammum ka Tareeqa', ic:'🏜️', steps:[
        { t:'Niyyat aur Bismillah', d:'Niyyat karke Bismillah kehein.' },
        { t:'Pehli baar zameen par haath maarein', d:'Pak mitti, ret, patthar ya chuna jaisi zameen ki cheez par dono haath ungliyan khuli rakhkar marein, phir halka jhaad lein.' },
        { t:'Chehre par haath pheren', d:'Dono hatheliyon se poore chehre ka masah karein.' },
        { t:'Doosri baar zameen par haath maarein', d:'Dobara haath marein aur jhaad lein. Angoothi ya ghadi utar lein.' },
        { t:'Dono haath kohniyon tak', d:'Pehle daaye phir baayen haath ka kohni samet masah karein. Ungliyon ka khilaal bhi karein.' } ] },
      { h:'Tayammum Kab Toot Jata Hai', ic:'⚠️', steps:[
        { t:'Jin cheezon se wuzu ya ghusl toot jata hai', d:'Unhi se tayammum bhi toot jata hai.' },
        { t:'Paani par qudrat mil jana', d:'Jaise hi paani mil jaye ya bimari door ho, tayammum khatam ho jata hai aur wuzu ya ghusl karna hoga.' } ] }
    ],
    closing:'Tayammum ek ruksat hai, jaise hi paani mile ya uzr khatam ho, wuzu ya ghusl kar lein.' }
];
IBADAT_GUIDES.sort((a,b)=>['wuzu','ghusl','tayammum','namaz-tareeqa','namaz-rakaat','qasr','janaza','taraweeh','eid','tahajjud','ishraq-chasht','haajat','istikhara','tauba','sahw','zabah','qurbani'].indexOf(a.id) - ['wuzu','ghusl','tayammum','namaz-tareeqa','namaz-rakaat','qasr','janaza','taraweeh','eid','tahajjud','ishraq-chasht','haajat','istikhara','tauba','sahw','zabah','qurbani'].indexOf(b.id));
function ibadatNavCat(){
  return { sec:{ ur:'Namaz aur Taharat', en:'Prayer and Purity' }, cats:['all'], catOf:()=>'all', all:IBADAT_GUIDES, sortFn:(a,b)=>IBADAT_GUIDES.indexOf(a)-IBADAT_GUIDES.indexOf(b) };
}
function ibadatTagChips(g){ return g.tags.map(t=>`<span class="aad-tag">${t}</span>`).join(''); }
function renderIbadat(){
  document.getElementById('detailTitle').textContent = L({ rur:'Namaz aur Taharat', en:'Prayer and Purity' });
  document.getElementById('detailBody').innerHTML = `
    <div class="aad-intro">${L({ rur:'Wuzu, Ghusl, Tayammum, Namaz ka tareeqa, Safar, Janaza, Taraweeh, Eid, Tahajjud, Istikhara, Tauba, Sajda-e-Sahw, Zabah aur Qurbani, Hanafi fiqh ke mutabiq.', en:'Wudu, ghusl, tayammum and the prayer, step by step, following Hanafi fiqh.' })}</div>
    <div class="dua-grid list" id="ibadatList">${IBADAT_GUIDES.map((g,i)=>{
      const st = duaStatus('ibadat:' + g.id);
      return `<div class="aad-card status-${st||'none'}" data-i="${i}" style="--aad-c:${g.color};">
        <div class="aad-ic">${g.ic}</div>
        <div class="aad-info"><div class="aad-title">${g.title}</div><div class="aad-tags">${ibadatTagChips(g)}</div><div class="aad-cat-lbl">${g.sub}</div></div>
        ${st==='amal' ? '<div class="aad-status-badge amal">✅</div>' : st==='soch' ? '<div class="aad-status-badge soch">⏳</div>' : ''}
        <div class="chev">›</div></div>`;
    }).join('')}</div>`;
  document.querySelectorAll('#ibadatList .aad-card').forEach(el=>{
    el.onclick = ()=>{ const i = +el.dataset.i; setNavCtx(IBADAT_GUIDES, i, openIbadatDetail, ibadatNavCat()); openIbadatDetail(IBADAT_GUIDES[i]); };
  });
}
function openIbadatDetail(g){
  state.lastRead = { k:'ibadat', id:g.id, label:g.title }; saveState();
  markReadDay();
  const key = 'ibadat:' + g.id, st = duaStatus(key);
  document.getElementById('detailTitle').textContent = g.title;
  let stepNo = 0;
  const stepHtml = (s)=>`<div class="ib-step">
      <div class="ib-n">${++stepNo}</div>
      <div class="ib-b"><b>${s.t.replace(/^\d+\.\s*/, '')}</b>${s.d ? `<p>${s.d}</p>` : ''}
        ${s.ar ? `<div class="arabic dua-ar" dir="rtl">${s.ar}</div>` : ''}${s.tr ? `<div class="translit dua-tr">${s.tr}</div>` : ''}</div>
    </div>`;
  document.getElementById('detailBody').innerHTML = `
    <div class="detail-actions">
      ${bmBtn('ibadat:'+g.id)}
      <button class="act-btn" id="ibadatImgBtn" title="Share karein">${SHARE_SVG}</button>
    </div>
    ${sceneBox(ibadatSceneSvg(g))}
    <div class="aad-head status-${st||'none'}" style="--aad-c:${g.color};">
      <div class="aad-head-ic">${g.ic}</div>
      <div class="aad-head-title">${g.title}</div>
      <div class="aad-tags center">${ibadatTagChips(g)}</div>
      <div class="aad-cat-pill">🕌 ${L({ rur:'Namaz aur Taharat', en:'Prayer and Purity' })}</div>
    </div>
    <div class="aad-intro">${g.intro}</div>
    ${g.sections.map((sec,i)=>`<div class="aad-guide-sec g${i%10}">
      <div class="aad-guide-head"><span class="aad-step-ic">${sec.ic}</span><span class="aad-step-lbl">${sec.h}</span></div>
      <div class="ib-steps">${(stepNo = 0, sec.steps.map(stepHtml).join(''))}</div>
    </div>`).join('')}
    <div class="aad-guide-closing">${g.closing}</div>
    <div class="backup-note" style="margin:10px 14px;">${IBADAT_NOTE}</div>
    <div class="aad-status-row">
      <button class="aad-status-btn soch ${st==='soch'?'on':''}" id="ibadatSochBtn">⏳ Seekhna baaki hai</button>
      <button class="aad-status-btn amal ${st==='amal'?'on':''}" id="ibadatAmalBtn">✅ Seekh liya</button>
    </div>
    ${pnBarHtml()}
  `;
  document.getElementById('ibadatSochBtn').onclick = ()=>{ setDuaStatus(key, 'soch'); openIbadatDetail(g); };
  document.getElementById('ibadatAmalBtn').onclick = ()=>{ setDuaStatus(key, 'amal'); openIbadatDetail(g); };
  document.getElementById('ibadatImgBtn').onclick = ()=> openCardShareChooser({ scene:ibadatSceneSvg(g), kind:'Namaz aur Taharat', title:g.title, sub:g.tags.join(' · '), body:g.intro, foot:'Hanafi fiqh ke mutabiq' });
  wirePnBar();
}
