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
function ibadatNavCat(){
  return { sec:{ ur:'Namaz aur Taharat', en:'Prayer and Purity' }, cats:['all'], catOf:()=>'all', all:IBADAT_GUIDES, sortFn:(a,b)=>IBADAT_GUIDES.indexOf(a)-IBADAT_GUIDES.indexOf(b) };
}
function ibadatTagChips(g){ return g.tags.map(t=>`<span class="aad-tag">${t}</span>`).join(''); }
function renderIbadat(){
  document.getElementById('detailTitle').textContent = L({ rur:'Namaz aur Taharat', en:'Prayer and Purity' });
  document.getElementById('detailBody').innerHTML = `
    <div class="aad-intro">${L({ rur:'Wuzu, Ghusl, Tayammum aur Namaz ka tareeqa qadam ba qadam, Hanafi fiqh ke mutabiq.', en:'Wudu, ghusl, tayammum and the prayer, step by step, following Hanafi fiqh.' })}</div>
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
  const stepHtml = (s)=>`<div class="ib-step">
      <div class="ib-b"><b>${s.t}</b>${s.d ? `<p>${s.d}</p>` : ''}
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
      <div class="ib-steps">${sec.steps.map(stepHtml).join('')}</div>
    </div>`).join('')}
    <div class="aad-guide-closing">${g.closing}</div>
    <div class="backup-note" style="margin:10px 14px;">${IBADAT_NOTE}</div>
    <div class="aad-status-row">
      <button class="aad-status-btn soch ${st==='soch'?'on':''}" id="ibadatSochBtn">⏳ Yaad karna baaki hai</button>
      <button class="aad-status-btn amal ${st==='amal'?'on':''}" id="ibadatAmalBtn">✅ Yaad ho chuka hai</button>
    </div>
    ${pnBarHtml()}
  `;
  document.getElementById('ibadatSochBtn').onclick = ()=>{ setDuaStatus(key, 'soch'); openIbadatDetail(g); };
  document.getElementById('ibadatAmalBtn').onclick = ()=>{ setDuaStatus(key, 'amal'); openIbadatDetail(g); };
  document.getElementById('ibadatImgBtn').onclick = ()=> openCardShareChooser({ scene:ibadatSceneSvg(g), kind:'Namaz aur Taharat', title:g.title, sub:g.tags.join(' · '), body:g.intro, foot:'Hanafi fiqh ke mutabiq' });
  wirePnBar();
}
