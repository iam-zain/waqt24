/* ============================================================
   ROZMARRA KI SUNNATEIN (Seekhiye).
   Source: "The Daily Sunnahs" booklet (Khaled Al Husaiban), uploaded by the user. Hawale wahi hain jo kitab mein diye gaye
   (Bukhari, Muslim, Abu Dawood, Tirmizi ...). Koi hadees number apni taraf se nahi likha gaya.
   Order: pehle muashira, ghar aur khandan, khana-peena, phir zaati aur namaz se jude amal.
   Each item: [title, detail, ref, flag]. flag 'ik' = madhab/ulema ke darmiyan tareeqe mein farq, ulema se mashwara karein.
   ============================================================ */
const SN_NOTE = 'Ye maloomat "Daily Sunnahs" kitab (Khaled Al Husaiban) se Roman Urdu mein li gayi hain. Namaz ke tareeqe mein madhab ke andar ikhtilaf hai (jaise "ik" nishan wali baatein), is liye ulema se mashwara karein.';
const SN_GROUPS = [
  { id:'muashira', ic:'🤝', color:'#2f9e6e', label:'Muashira aur Logon se Milna', topics:[
    { id:'salaam', ic:'👋', title:'Salaam, Muskurahat aur Musafaha', sub:'Mulaqat ki 3 pyari sunnatein',
      intro:'Mulaqat ke waqt salaam, muskurahat aur musafaha, teeno ek saath karne se ek hi lamhe mein kai sunnatein ho jati hain.',
      items:[
        ['Jaan-pehchaan ho ya na ho, salaam karna', 'Nabi ﷺ se poochha gaya: kaun sa Islam behtar hai? Farmaya: khana khilana aur har us shakhs ko salaam karna jise tum jaante ho ya nahi jaante.', 'Bukhari, Muslim'],
        ['Poora salaam kehna', 'Ek shakhs ne "Assalamu alaikum" kaha to Nabi ﷺ ne farmaya "das (neki)". Doosre ne "wa rahmatullah" barhaya to "bees", teesre ne "wa barakatuh" bhi kaha to "tees". Isliye poora salaam kahein: Assalamu alaikum wa rahmatullahi wa barakatuh.', 'Abu Dawood, Tirmizi'],
        ['Muskurakar milna', 'Nabi ﷺ ne farmaya: kisi neki ko haqeer na samjho, chahe apne bhai se muskurahat ke saath milna hi ho.', 'Muslim'],
        ['Musafaha karna', 'Jab do Musalman milkar musafaha karte hain to juda hone se pehle unki maghfirat kar di jati hai. Imam Nawawi ke mutabiq har mulaqat par musafaha mustahab hai.', 'Abu Dawood, Tirmizi, Ibn Majah']
      ], fazl:'Ek baar mein teen sunnatein: salaam + muskurahat + musafaha.' },
    { id:'baat', ic:'💬', title:'Meethi Baat (Kalima-e-Khair)', sub:'Biwi, bachche, padosi aur dost sab ke liye',
      intro:'Achhi baat karna sadqa hai. Shaitan logon ke darmiyan bigaad dalta hai, isliye zubaan ko narm aur achhi rakhein.',
      items:[
        ['Qur’an ki hidayat', 'Allah ﷻ ne farmaya ke mere bandon se kaho woh baat kahein jo sabse achhi ho, kyunke shaitan unke darmiyan fasad dalta hai.', 'Qur’an 17:53'],
        ['Achhi baat sadqa hai', 'Nabi ﷺ ne farmaya: achhi baat sadqa hai.', 'Bukhari, Muslim'],
        ['Achhi baat mein kya kya aata hai', 'Allah ka zikr, dua, salaam, jaiz tareef, achha akhlaq aur nek baatein.', 'Kitab ki wazahat'],
        ['Kin se achhi baat karein', 'Biwi, bachche, padosi, dost, naukar aur har us shakhs se jisse aap ka waasta hai. Meethi baat dil jeet leti hai.', 'Kitab ki wazahat']
      ] },
    { id:'majlis', ic:'🪑', title:'Majlis Se Uthne Ki Dua', sub:'Kaffara-e-Majlis',
      intro:'Din mein kai majlisein hoti hain: khane par, dost ya padosi se mulaqat, kaam ya school, biwi bachchon ke saath baithna, safar mein, bayan ya lecture. Uthte waqt ye dua padhein.',
      items:[
        ['Dua (Kaffara-e-Majlis)', 'Subhanaka Allahumma wa bihamdika, ash-hadu an la ilaha illa anta, astaghfiruka wa atubu ilaik.\nMatlab: Ae Allah, tu paak hai aur tarif tere hi liye hai. Main gawahi deta hoon ke tere siwa koi ma‘bood nahi. Main tujhse maafi maangta hoon aur tauba karta hoon.', 'Sunan ki kitabein']
      ], fazl:'Majlis mein jo kami ya galti ho gayi ho, is dua se uski maafi ki umeed hai.' }
  ] },
  { id:'ghar', ic:'🏠', color:'#d98a2b', label:'Ghar aur Ghar Walay', topics:[
    { id:'gharaana', ic:'🚪', title:'Ghar Se Nikalna Aur Ghar Mein Aana', sub:'Bismillah, dua, salaam, miswak',
      intro:'Insaan din mein kai baar ghar se nikalta aur aata hai. Har baar ye sunnatein dohrane se hifazat aur barkat milti hai.',
      items:[
        ['Ghar mein dakhil hote waqt Allah ka naam', 'Jab banda ghar mein dakhil hote aur khana khate waqt Allah ka naam leta hai to shaitan apne saathiyon se kehta hai: aaj tumhare liye na raat ka thikana hai na khana.', 'Muslim'],
        ['Dakhil hone ki dua', 'Allahumma inni as’aluka khairal-mawlaji wa khairal-makhraj, bismillahi walajna wa bismillahi kharajna, wa ‘alallahi rabbina tawakkalna. Phir ghar walon ko salaam karein.', 'Abu Dawood'],
        ['Ghar walon ko salaam', 'Qur’an mein hai: jab ghar mein dakhil ho to apne logon ko salaam karo, ye Allah ki taraf se mubarak aur pakeeza dua hai.', 'Qur’an 24:61'],
        ['Ghar mein dakhil hote hi miswak', 'Hazrat Aisha RA farmati hain ke ghar aate waqt Nabi ﷺ sabse pehle miswak karte the.', 'Muslim'],
        ['Ghar se nikalne ki dua', 'Bismillahi tawakkaltu ‘alallahi, la hawla wa la quwwata illa billah.\nMatlab: Allah ke naam se, maine Allah par bharosa kiya, koi taqat aur quwwat nahi magar Allah ki madad se.', 'Tirmizi, Abu Dawood']
      ], fazl:'Is dua se bande ki hifazat hoti hai aur shaitan us se door ho jata hai. Masjid jane wale ko ye sunnatein din mein kai baar milti hain.' },
    { id:'gharnafl', ic:'🕌', title:'Nafl Namaz Ghar Mein', sub:'Riya se bachne aur ghar mein barkat ka zariya',
      intro:'Farz namaz ke siwa nafl aur sunnat namazein ghar mein parhna behtar hai.',
      items:[
        ['Ghar ki namaz', 'Nabi ﷺ ne farmaya: insaan ki behtareen namaz wo hai jo woh apne ghar mein parhe, siwaye farz namaz ke.', 'Bukhari, Muslim'],
        ['Ghar mein nafl ke fawaid', 'Dikhawe se bachna aur ikhlaas, ghar par rahmat ka nuzool aur shaitan ka nikal jana. Khaas taur par sunnat-e-muakkada, chasht aur witr ghar mein parhein.', 'Kitab ki wazahat']
      ] }
  ] },
  { id:'khana', ic:'🍽️', color:'#c0562f', label:'Khana aur Peena', topics:[
    { id:'khaana', ic:'🍛', title:'Khane Ki Sunnatein', sub:'Din mein kam az kam 15 sunnatein',
      intro:'Din mein teen baar khane se bahut si sunnatein mil sakti hain. Snacks par bhi yehi adab hai.',
      items:[
        ['Bismillah padhna', 'Khane se pehle Allah ka naam lein.', 'Muslim'],
        ['Seedhe haath se khana', 'Nabi ﷺ ne bachche se farmaya: Bismillah padho, seedhe haath se khao aur apne saamne se khao.', 'Muslim'],
        ['Apne saamne se khana', 'Plate ke beech ya doosron ke saamne se na uthayein.', 'Muslim'],
        ['Loqma gir jaye to', 'Jo saaf kar ke khane ke qabil ho, mitti jhad kar use kha lein.', 'Muslim'],
        ['Teen ungliyon se khana', 'Nabi ﷺ aksar teen ungliyon se khate the. Zaroorat ho to zyada ungliyon ka istemal bhi theek hai.', 'Muslim'],
        ['Baithne ka tareeqa', 'Ghutnon aur paon ki pusht par baithna, ya daya paon khada aur bayan par baithna.', 'Fath al-Bari (kitab se)'],
        ['Ungliyan aur bartan chaat lena', 'Nabi ﷺ ne ungliyan aur bartan chaatne ka hukm diya aur farmaya: tum nahi jaante ke barkat kis hisse mein hai.', 'Muslim'],
        ['Khane ke baad Allah ki tareef', 'Nabi ﷺ ne farmaya: Allah is bande se raazi hota hai jo khana khakar uski hamd kare.', 'Muslim'],
        ['Khane ke baad ki dua', 'Alhamdulillahil-ladhi at’amani hadha wa razaqanihi min ghayri hawlin minni wa la quwwah.\nMatlab: Allah ka shukr jisne mujhe ye khilaya aur bina meri taqat aur koshish ke ata kiya.', 'Abu Dawood, Tirmizi, Ibn Majah']
      ], fazl:'Hadees mein hai ke is dua se pichle gunah maaf ho jate hain.' },
    { id:'peena', ic:'🥤', title:'Peene Ki Sunnatein', sub:'Paani, chai, juice, sab par',
      intro:'Peene ki sunnatein har qism ke mashroob par lagu hoti hain: thanda, garam, juice ya paani.',
      items:[
        ['Bismillah', 'Peene se pehle Allah ka naam lein.', 'Muslim'],
        ['Seedhe haath se peena', 'Nabi ﷺ ne bachche se farmaya: Bismillah padho aur seedhe haath se khao.', 'Muslim'],
        ['Teen saans mein peena', 'Ek ghoont lein, bartan se hata kar saans lein, phir dobara. Isi tarah teen baar. Saans bartan ke andar na lein.', 'Muslim'],
        ['Baith kar peena', 'Nabi ﷺ ne farmaya: tum mein se koi khade ho kar na piye.', 'Muslim'],
        ['Peene ke baad shukr', 'Allah ﷻ us bande se raazi hota hai jo khane ya peene ke baad uski hamd karta hai.', 'Muslim']
      ] }
  ] },
  { id:'zaati', ic:'🧼', color:'#3f8fe0', label:'Zaati aur Roz Ke Amal', topics:[
    { id:'jagna', ic:'🌅', title:'Neend Se Jagne Ki Sunnatein', sub:'Dua, haath se neend door karna, miswak',
      intro:'Din ki shuruaat sunnat se karein.',
      items:[
        ['Haath se chehre ki neend door karna', 'Nabi ﷺ jaag kar baithe aur haath se chehre ko ponchte the (neend ka asar door karte).', 'Muslim'],
        ['Jagne ki dua', 'Alhamdulillahil-ladhi ahyana ba’da ma amatana wa ilaihin-nushur.\nMatlab: Allah ka shukr jisne hamein maut (neend) ke baad zinda kiya aur usi ki taraf uthna hai.', 'Bukhari'],
        ['Miswak karna', 'Nabi ﷺ jab bhi jaagte, chahe raat mein, miswak karte the.', 'Bukhari, Muslim']
      ] },
    { id:'bathroom', ic:'🚻', title:'Bathroom Mein Jane Ki Sunnatein', sub:'3 sunnatein, din mein kai baar',
      intro:'Bathroom din mein kai baar jana hota hai, isliye ye 3 sunnatein bahut faida deti hain.',
      items:[
        ['Pehle bayan paon andar, nikalte waqt seedha paon', 'Bathroom mein jate hue bayan, nikalte hue daya paon.', 'Kitab ki wazahat'],
        ['Dakhil hone ki dua', 'Allahumma inni a’udhu bika minal-khubuthi wal-khaba’ith.\nMatlab: Ae Allah, main khabees jinnat (mard aur aurat) se teri panah maangta hoon.', 'Bukhari, Muslim'],
        ['Nikalne ki dua', 'Ghufranak.\nMatlab: Ae Allah, hamein bakhsh de.', 'Sunan ki kitabein (Nasai ke siwa)']
      ] },
    { id:'wuzu', ic:'💧', title:'Wuzu Ki Sunnatein', sub:'Bismillah se dua tak',
      intro:'Wuzu din mein kai baar hota hai, har baar in sunnaton ka khayal rakhein. Farz aur tafseeli tareeqa Namaz Guide mein hai.',
      items:[
        ['Bismillah', 'Wuzu ki shuruaat Bismillah se.', 'Kitab ki wazahat'],
        ['Pehle dono haath teen baar dhona', 'Chehra dhone se pehle haath dhoein.', 'Bukhari, Muslim'],
        ['Kulli aur naak mein paani', 'Munh aur naak mein paani dena, aur naak ko baayen haath se saaf karna. Rozedaar na ho to naak mein achhi tarah paani charhana.', 'Bukhari, Muslim; Tirmizi, Abu Dawood'],
        ['Miswak', 'Kulli se pehle miswak. Nabi ﷺ ne farmaya: agar ummat par mushkil na hoti to main har namaz se pehle miswak ka hukm deta.', 'Ahmad, Nasai'],
        ['Ungliyon ka khilaal', 'Haath aur paon ki ungliyon ke beech geeli ungli se paani pahunchana. Daadhi ka khilaal bhi.', 'Tirmizi'],
        ['Seedhe taraf se shuruaat', 'Nabi ﷺ jootay pehenne, kanghi karne, paak hone aur har kaam mein seedhe se shuru karte the.', 'Bukhari, Muslim'],
        ['Teen teen baar dhona', 'Chehra, haath aur paon teen baar.', 'Bukhari, Muslim'],
        ['Kam paani istemal karna', 'Nabi ﷺ wuzu mein thoda paani istemal karte the.', 'Bukhari, Muslim'],
        ['Wuzu ke baad Kalima-e-Shahadat', 'Nabi ﷺ ne farmaya: jo achhi tarah wuzu kare aur ye padhe, uske liye Jannat ke aathon darwaze khol diye jayenge.', 'Muslim'],
        ['Ghar mein wuzu karke masjid jana', 'Aise shakhs ka har qadam ek gunah mitata aur ek darja badhata hai.', 'Muslim'],
        ['Wuzu ke baad do rakat', 'Jo mere jaisa wuzu kare aur dil ko idhar udhar kiye bina do rakat parhe, uske pichle gunah maaf.', 'Bukhari, Muslim']
      ], fazl:'Nabi ﷺ ne farmaya: jo achhi tarah wuzu karta hai, uske gunah badan se nikal jate hain, yahan tak ke nakhunon ke neeche se bhi.' },
    { id:'miswak', ic:'🪥', title:'Miswak Ki Sunnat', sub:'Din mein 20 se zyada baar',
      intro:'Miswak (Arak ke darakht ki dantun) daanton ki safai aur Allah ki raza ka zariya hai. Nabi ﷺ ne farmaya: miswak munh ko saaf karta aur Rab ko raazi karta hai.',
      items:[
        ['Har namaz aur wuzu ke waqt', 'Panch farz, sunnatein, chasht, witr aur wuzu ke waqt.', 'Bukhari, Muslim; Ahmad'],
        ['Ghar mein dakhil hote hi', 'Nabi ﷺ ghar aate hi sabse pehle miswak karte the.', 'Muslim'],
        ['Qur’an padhne se pehle', 'Munh ki bu door karne ke liye.', 'Kitab ki wazahat'],
        ['Neend se jagne par', 'Din ya raat, jab bhi jaagein.', 'Bukhari, Muslim']
      ], fazl:'Faide: Allah ki raza aur munh ki safai.' },
    { id:'joota', ic:'👟', title:'Joote Pehenne Ki Sunnat', sub:'Seedhe se pehenna, ulte se utarna',
      intro:'Din mein kai baar joota pehenna aur utarna hota hai.',
      items:[
        ['Pehenne aur utarne ka tareeqa', 'Nabi ﷺ ne farmaya: jab joota pehnana chaho to seedhe paon se shuru karo aur utarte waqt bayen se. Ya dono ek saath pehno ya dono utaar do.', 'Muslim']
      ] },
    { id:'libaas', ic:'👕', title:'Libaas Ki Sunnatein', sub:'Bismillah, dua, seedhe se shuru',
      intro:'Libaas pehenna aur utarna din mein kai baar hota hai.',
      items:[
        ['Bismillah kehna', 'Pehenne aur utarne ke waqt Bismillah. Imam Nawawi: har kaam mein Bismillah mustahab hai.', 'Kitab ki wazahat'],
        ['Naya libaas pehenne ki dua', 'Ae Allah, main tujhse iski bhalai aur jis maqsad ke liye ye bana hai uski bhalai maangta hoon, aur iske sharr aur iske maqsad ke sharr se teri panah maangta hoon.', 'Abu Dawood, Tirmizi, Ahmad'],
        ['Seedhe taraf se pehenna', 'Nabi ﷺ ne farmaya: libaas pehno to seedhe se shuru karo.', 'Tirmizi, Abu Dawood, Ibn Majah'],
        ['Utarte waqt bayen se', 'Pehle bayen, phir seedhe taraf.', 'Kitab ki wazahat']
      ] },
    { id:'sona', ic:'🌙', title:'Sone Se Pehle Ki Sunnatein', sub:'Din mein 2 baar bhi lagu',
      intro:'Dopahar ki neend par bhi ye lagu hain. Imam Nawawi: jitna mumkin ho amal karein, na ho to sabse zaroori wali chhodein nahi.',
      items:[
        ['Wuzu karna', 'Jab bistar par jao to wuzu karo.', 'Bukhari, Muslim'],
        ['Bistar jhad lena', 'Nabi ﷺ ne farmaya: bistar par jao to usko jhad lo, kyunke tum nahi jaante uspar kya reh gaya.', 'Bukhari, Muslim'],
        ['Seedhe karwat par lete', 'Seedhe haath ko gaal ke neeche rakhna.', 'Bukhari, Muslim; Abu Dawood'],
        ['Surah Ikhlaas, Falaq, Naas', 'Dono hathelion ko jod kar phoonkein, teeno surah padhein, phir sar, chehra aur badan ke agle hisse par haath pherein. Teen baar.', 'Bukhari'],
        ['Ayat-ul-Kursi', 'Padhne walay par raat bhar Allah ki taraf se hifazat karne wala muqarrar rehta hai aur shaitan qareeb nahi aata.', 'Bukhari'],
        ['Surah Baqarah ki aakhri do ayatein', 'Jo raat mein ye padhe, ye use kaafi hain.', 'Bukhari, Muslim'],
        ['Surah Kafirun', 'Shirk se bari hone ka izhaar.', 'Abu Dawood, Tirmizi, Ahmad'],
        ['Bismika Allahumma amutu wa ahya', 'Ae Allah, tere hi naam se marta aur jeeta hoon.', 'Bukhari'],
        ['SubhanAllah 33, Alhamdulillah 33, Allahu Akbar 34', 'Sone se pehle.', 'Bukhari, Muslim'],
        ['Sone ki aur duain', 'Kitab mein sone ki kai aur duain hain, jaise "Allahumma qini adhabaka yawma tab’athu ibadak" (teen baar, seedhe haath ko gaal ke neeche rakh kar) aur "Alhamdulillahil-ladhi at’amana wa saqana wa kafana wa awana".', 'Abu Dawood, Tirmizi; Muslim']
      ], fazl:'Kitab ke mutabiq in tasbihat se 100 sadqay likhe jate hain aur bande ki hifazat hoti hai. Din ka khatma Allah ke zikr par hota hai.' },
    { id:'niyyat', ic:'🎯', title:'Niyyat Se Aam Kaam Ibadat Ban Jate Hain', sub:'Khana, sona, kaam',
      intro:'Mubah (jaiz) kaam bhi achhi niyyat se ibadat ban jate hain.',
      items:[
        ['Hadees', 'Nabi ﷺ ne farmaya: aamaal ka daromadar niyyaton par hai aur har shakhs ke liye wahi hai jo usne niyyat ki.', 'Bukhari, Muslim'],
        ['Misaal', 'Jaldi so jana is niyyat se ke Tahajjud ya Fajr ke liye uth sakein, aisi neend ibadat ban jati hai.', 'Kitab ki wazahat'],
        ['Ek saath kai ibadatein', 'Masjid jate hue zikr karein ya Qur’an sunein. Shadi ki jaiz mehfil mein bhi zikr ya deen ki faide wali baat karein.', 'Kitab ki wazahat']
      ] }
  ] },
  { id:'namaz', ic:'🕌', color:'#7a5be0', label:'Namaz Se Jude Amal', topics:[
    { id:'masjid', ic:'🚶', title:'Masjid Jane Ki Sunnatein', sub:'Pure paanch waqt mein 50 sunnatein',
      intro:'Jo paanchon namazein masjid mein parhta hai woh ye sunnatein bar bar paata hai.',
      items:[
        ['Jaldi pahunchna', 'Nabi ﷺ ne farmaya: log azaan aur pehli saf ka sawab jaan lein to qura-andazi karen, aur jaldi pahunchne ka sawab jaan lein to ek doosre se aage badhein.', 'Bukhari, Muslim'],
        ['Sukoon aur waqar se chalna', 'Azaan sun kar namaz ke liye sukoon se chalo.', 'Bukhari, Muslim'],
        ['Paidal jana', 'Qadmon ka sawab milta hai. Nabi ﷺ ne farmaya: kya main tumhein wo amal na bataun jisse gunah mitate aur darje buland hote hain? Un mein masjid ki taraf chalna bhi bataya.', 'Muslim'],
        ['Masjid jate waqt dua', 'Allahumma-j’al fi qalbi nuran, wa fi lisani nuran, wa fi sam’i nuran, wa fi basari nuran ... (Ae Allah mere dil, zubaan, kaan, aankh, aage-peeche, upar-neeche noor kar de).', 'Muslim'],
        ['Seedhe paon se dakhil, durood aur dua', 'Seedhe paon se andar jayein, Nabi ﷺ par durood padhein aur kahein: Allahumma iftah li abwaba rahmatik.', 'Nasai, Ibn Majah, Ibn Khuzaima, Ibn Hibban'],
        ['Agli saf ki koshish', 'Pehli saf ka sawab bahut zyada hai.', 'Bukhari, Muslim'],
        ['Tahiyyat-ul-Masjid', 'Nabi ﷺ ne farmaya: jab masjid mein dakhil ho to do rakat parhe bina na baitho.', 'Bukhari, Muslim'],
        ['Nikalte waqt, bayen paon aur dua', 'Allahumma inni as’aluka min fadlik (Ae Allah main tujhse tere fazl ka sawal karta hoon). Saath durood bhi behtar hai.', 'Muslim, Nasai']
      ] },
    { id:'azaan', ic:'📢', title:'Azaan Aur Iqamat Ki Sunnatein', sub:'Sunne walon ke 5 amal',
      intro:'Azaan sunte waqt panch sunnatein hain (Zad al-Ma’ad). Iqamat par bhi pehle chaar lagu hain.',
      items:[
        ['Muazzin ke alfaaz dohrana', 'Siwaye "Hayya alas-salah" aur "Hayya alal-falah" ke, jin par kahein: La hawla wa la quwwata illa billah. "Qad qamatis-salah" par bhi yehi.', 'Bukhari, Muslim'],
        ['Shahadat ke baad', 'Wa ana ash-hadu an la ilaha illallahu wa anna Muhammadan rasuluh, radheetu billahi rabba, wa bil-islami deena, wa bi Muhammadin rasula.', 'Muslim'],
        ['Azaan ke baad durood', 'Nabi ﷺ par durood (Durood-e-Ibrahimi): jo ek baar durood bheje Allah uspar das rahmatein bhejta hai.', 'Muslim, Bukhari'],
        ['Wasila ki dua', 'Allahumma rabba hadhihid-da’watit-tammah was-salatil-qa’imah, ati Muhammadanil-wasilata wal-fadilah, wab’athhu maqamam-mahmudanil-ladhi wa’adtah.', 'Bukhari'],
        ['Apne liye dua', 'Azaan ke dohrane ke baad Allah se jo chaho maango, qabool hogi.', 'Abu Dawood'],
        ['Azaan aur iqamat ke adab', 'Qibla rukh, khade hokar, wuzu ke saath, azaan mein kaano mein ungliyan, awaaz buland aur iqamat mein dheemi.', 'Kitab ki wazahat (ik)']
      ], fazl:'Azaan ke jawab ki fazilat mein Jannat ka wada aur gunahon ki maafi aati hai (Muslim). Ek namaz ki azaan par kul 25 sunnatein, iqamat par 20 tak.' },
    { id:'sutra', ic:'🧱', title:'Sutra Ke Peeche Namaz', sub:'Namazi ke saamne rukawat',
      intro:'Sutra woh cheez hai jo namaz parhne wale ke saamne rakhi jati hai (deewar, lakdi, sutoon).',
      items:[
        ['Hukm', 'Nabi ﷺ ne farmaya: jab namaz parho to sutra ki taraf parho, uske qareeb khade ho aur kisi ko apne aur sutra ke darmiyan se guzarne na do.', 'Abu Dawood, Ibn Majah, Ibn Khuzaima'],
        ['Kab', 'Ghar mein ya masjid mein, mard aur aurat dono. Jamaat mein imam ka sutra sab ke liye kaafi hai.', 'Kitab ki wazahat'],
        ['Taqreeban', 'Ek bitta unchaai aur sajde ki jagah jitna faasla.', 'Kitab ki wazahat']
      ] },
    { id:'nafl', ic:'🌤️', title:'Sunnat Aur Nafl Namazein', sub:'12 rakat, chasht, asr se pehle',
      intro:'Farz ke siwa ye namazein Jannat mein ghar aur gunahon ki maafi ka zariya hain.',
      items:[
        ['Roz ki 12 rakat', 'Nabi ﷺ ne farmaya: jo banda rozana 12 rakat farz ke siwa parhe, Allah uske liye Jannat mein ghar banata hai. Zuhr se pehle 4, baad 2; Maghrib ke baad 2; Isha ke baad 2; Fajr se pehle 2.', 'Muslim'],
        ['Namaz-e-Chasht', 'Insaan ke 360 jodon par roz sadqa hai. Subah ki do rakat un sab ke badle kaafi hain. Waqt sooraj nikalne se thodi der baad se zawal se pehle tak. Kam az kam 2 rakat.', 'Muslim'],
        ['Asr se pehle 4 rakat', 'Nabi ﷺ ne farmaya: Allah us par rahm kare jo Asr se pehle 4 rakat parhe.', 'Abu Dawood, Tirmizi'],
        ['Maghrib se pehle', 'Nabi ﷺ ne farmaya: Maghrib se pehle namaz parho. Teesri baar farmaya: jo chahe.', 'Bukhari'],
        ['Har azaan aur iqamat ke darmiyan namaz', 'Nabi ﷺ ne teen baar farmaya: har do azaanon ke darmiyan namaz hai, teesri baar: jo chahe.', 'Bukhari, Muslim']
      ] },
    { id:'raat', ic:'🌌', title:'Raat Ki Namaz Aur Witr', sub:'Tahajjud, witr, aur azkaar',
      intro:'Nabi ﷺ ne farmaya: Ramzan ke baad sabse afzal roza Muharram ka hai aur farz ke baad sabse afzal namaz raat ki namaz hai.',
      items:[
        ['Raat ki namaz', 'Nabi ﷺ ki aadat 11 ya 13 rakat thi (witr samet).', 'Bukhari (ik)'],
        ['Miswak aur Aal-Imran ki aakhri ayatein', 'Raat ko uthkar miswak karna aur Surah Aal-Imran ki aakhri ayatein (Inna fi khalqis-samawati wal-ard ...) padhna.', 'Bukhari, Muslim'],
        ['Witr mein Surah', 'Teen rakat witr mein A’la, Kafirun aur Ikhlaas padhna.', 'Abu Dawood, Tirmizi, Ibn Majah (ik)'],
        ['Witr ke baad', 'Subhanal-malikil-quddus teen baar, teesri baar awaaz buland kar ke aur "Rabbil-mala’ikati war-ruh" barhana.', 'Nasai, Abu Dawood, Daraqutni']
      ] },
    { id:'fajr', ic:'🌄', title:'Fajr Ki Sunnatein', sub:'Sunnat-e-Fajr aur baad ka waqt',
      intro:'Fajr ki sunnat sabse taqeed wali sunnatein mein se hai.',
      items:[
        ['Chhoti do rakat', 'Hazrat Aisha RA: Nabi ﷺ azaan aur Fajr ki jamaat ke darmiyan do halki rakat parhte the.', 'Bukhari, Muslim'],
        ['Qiraat', 'Pehli rakat mein Surah Baqarah ki ayat 2:136, doosri rakat mein Aal-Imran ki ayat 3:52 (ek riwayat mein 3:64) padhte the.', 'Muslim'],
        ['Seedhe karwat par lete', 'Fajr ki sunnat ke baad ghar par kuch der seedhe karwat par lena.', 'Bukhari (ik)'],
        ['Fajr ke baad apni jagah baithna', 'Nabi ﷺ Fajr ke baad apni namaz ki jagah par sooraj nikalne tak baithe rehte the.', 'Muslim']
      ] },
    { id:'andar', ic:'🧎', title:'Namaz Ke Andar Ki Sunnatein', sub:'Madhab ke ikhtilaf ka khayal rakhein',
      intro:'Kitab ne in sunnaton ko ginwaya hai. Haath uthane, tashahhud mein ungli hilane aur baithne ke tareeqon mein Hanafi aur doosre madhab ke darmiyan ikhtilaf hai, isliye in mein se jo bhi apnayein apne ulema se tasdeeq kar lein.',
      items:[
        ['Sana (thana)', 'Takbeer ke baad: Subhanakallahumma wa bihamdika wa tabarakasmuka wa ta’ala jadduka wa la ilaha ghairuk.', 'Chaar Sunan (ik)'],
        ['Taawwuz aur Bismillah', 'Qiraat se pehle Audhu billahi minash-shaitanir-rajeem aur Bismillah.', 'Kitab ki wazahat'],
        ['Ameen', 'Surah Fatiha ke baad Ameen kehna.', 'Kitab ki wazahat (ik)'],
        ['Fatiha ke baad Surah', 'Farz ki pehli do rakat aur nafl mein.', 'Kitab ki wazahat'],
        ['Sajde ki jagah nazar', 'Namaz mein sajde ki jagah dekhna.', 'Kitab ki wazahat'],
        ['Ruku mein baar baar tasbeeh', 'Ruku aur sajde mein tasbeeh ek se zyada baar.', 'Kitab ki wazahat'],
        ['Do sajdon ke darmiyan', 'Rabbighfir li (Ae mere Rab mujhe bakhsh de) ek se zyada baar.', 'Kitab ki wazahat'],
        ['Sajde mein dua', 'Nabi ﷺ ne farmaya: bande ke liye sajde ki halat mein Rab sabse qareeb hota hai, is liye dua zyada karo.', 'Muslim'],
        ['Aakhri tashahhud ke baad dua', 'Allahumma inni a’udhu bika min adhabi jahannam, wa min adhabil-qabr, wa min fitnatil-mahya wal-mamat, wa min fitnatil-masihid-dajjal.', 'Bukhari, Muslim'],
        ['Haath bandhna', 'Qiyam mein dayan haath bayen haath par rakhna (jagah mein madhab ka farq hai).', 'Kitab ki wazahat (ik)'],
        ['Khushu', 'Namaz ke alfaaz ke maani par dhyan dena.', 'Kitab ki wazahat']
      ] },
    { id:'baad', ic:'📿', title:'Namaz Ke Baad Ke Azkaar', sub:'Har farz namaz ke baad',
      intro:'Har farz namaz ke baad ye azkaar kar ke 55 tak sunnatein mil sakti hain, Fajr aur Maghrib ke baad aur zyada.',
      items:[
        ['Astaghfirullah teen baar', 'Phir: Allahumma antas-salam wa minkas-salam, tabarakta ya dhal-jalali wal-ikram.', 'Muslim'],
        ['La ilaha illallahu wahdahu la sharika lah ...', 'Lahul-mulku wa lahul-hamdu wa huwa ‘ala kulli shay’in qadir. Allahumma la mani’a lima a’tayta wa la mu’tiya lima mana’ta, wa la yanfa’u dhal-jaddi minkal-jadd.', 'Bukhari, Muslim'],
        ['Tasbeehat', 'SubhanAllah 33, Alhamdulillah 33, Allahu Akbar 33, phir La ilaha illallahu wahdahu la sharika lah ...', 'Muslim'],
        ['Allahumma a’inni ‘ala dhikrika wa shukrika wa husni ‘ibadatik', 'Ae Allah, apne zikr, shukr aur achhi ibadat par meri madad farma.', 'Abu Dawood, Nasai'],
        ['Ayat-ul-Kursi', 'Har farz ke baad. Kitab ke mutabiq Jannat mein jane se sirf maut roki hai.', 'Nasai'],
        ['Surah Ikhlaas, Falaq, Naas', 'Har namaz ke baad, aur Fajr aur Maghrib ke baad teen teen baar.', 'Abu Dawood, Tirmizi, Nasai'],
        ['Ek hi jagah baith kar', 'Zikr usi jagah karein jahan namaz parhi ho.', 'Kitab ki wazahat']
      ], fazl:'Hadees ke mutabiq in tasbihat se gunah samandar ke jhaag ke barabar bhi hon to maaf kar diye jate hain (Muslim).' }
  ] },
  { id:'zikr', ic:'📖', color:'#c2457a', label:'Zikr, Shukr aur Qur’an', topics:[
    { id:'azkaar', ic:'🌅', title:'Subah-Shaam Ke Azkaar', sub:'Din ki hifazat',
      intro:'Subah aur shaam ke ye azkaar kitab mein tarteeb se diye gaye hain. Inhein samajh kar aur yaqeen ke saath padhein.',
      items:[
        ['Ayat-ul-Kursi', 'Jo subah padhe shaam tak aur jo shaam ko padhe subah tak jinnat se mehfooz rehta hai.', 'Nasai'],
        ['Ikhlaas, Falaq, Naas', 'Subah aur shaam teen teen baar. Har cheez ke sharr se bachaw.', 'Abu Dawood, Tirmizi'],
        ['Allahumma anta rabbi la ilaha illa anta ... (Sayyid-ul-Istighfar)', 'Jo ise yaqeen se shaam ko padhe aur usi raat mar jaye, Jannat mein dakhil hoga. Subah ko padhe aur usi din mar jaye to bhi.', 'Bukhari'],
        ['Subhanallahi wa bihamdihi 100 baar', 'Subah aur shaam. Qiyamat ke din koi isse behtar amal na laye ga siwaye us ke jisne itna ya zyada kaha.', 'Muslim'],
        ['La ilaha illallahu wahdahu la sharika lah ... 100 baar', 'Das ghulam azad karne ka sawab, 10 neki, 10 gunah mit-te aur shaitan se din bhar hifazat.', 'Bukhari, Muslim'],
        ['Astaghfirullah wa atubu ilaih 100 baar', 'Rozana 100 baar.', 'Bukhari, Muslim'],
        ['Allahumma inni as’aluka ilman nafi’an wa rizqan tayyiban wa amalan mutaqabbala', 'Subah ke waqt. Faide wala ilm, pakeeza rizq aur qabool hone wale amal ki dua.', 'Ibn Majah'],
        ['Bismillahil-ladhi la yadurru ma’asmihi shay’un fil-ardi wa la fis-sama’i wa huwas-sami’ul-alim', 'Subah aur shaam teen teen baar, koi cheez nuqsan nahi pahunchati.', 'Abu Dawood, Tirmizi, Ibn Majah, Ahmad'],
        ['Radheetu billahi rabba, wa bil-islami deena, wa bi Muhammadin nabiyya', 'Subah aur shaam teen teen baar. Allah ka sacha wada hai ke Qiyamat ke din use khush karega.', 'Abu Dawood, Tirmizi, Nasai, Ahmad'],
        ['Hasbiyallahu la ilaha illa huwa, ‘alayhi tawakkaltu wa huwa rabbul-‘arshil-‘azim', 'Subah aur shaam 7 baar. Dunya aur aakhirat ke ghum se hifazat.', 'Abu Dawood'],
        ['A’udhu bikalimatillahit-tammati min sharri ma khalaq', 'Shaam ko teen baar.', 'Tirmizi, Ibn Majah, Ahmad']
      ] },
    { id:'nematein', ic:'🌸', title:'Allah Ki Nematon Par Ghaur', sub:'Shukr ki aadat',
      intro:'Nabi ﷺ ne farmaya: Allah ki nematon mein ghaur karo, uski zaat mein nahi.',
      items:[
        ['Hadees', 'Allah ki nematon mein ghaur karo, lekin Allah ki zaat mein ghaur na karo.', 'Tabarani (Awsat), Bayhaqi (Shu’ab)'],
        ['Kahan kahan shukr yaad aaye', 'Masjid jate hue jab doosre soye hon, bazaar mein hadse dekh kar, khabron mein bhookh, baadh aur jang sunkar. Deen, sehat, aman jaisi nematon par shukr karein.', 'Kitab ki wazahat'],
        ['Mareez ko dekh kar dua', 'Alhamdulillahil-ladhi ‘afani mimmabtalaka bihi wa faddalani ‘ala kathirin mimman khalaqa tafdila. Jo ye kahe wo us bimari mein mubtala nahi hota.', 'Tirmizi']
      ] },
    { id:'zikrhar', ic:'📿', title:'Har Waqt Allah Ka Zikr', sub:'Dil ki rahat',
      intro:'Hazrat Aisha RA: Nabi ﷺ har waqt Allah ka zikr karte the (Muslim).',
      items:[
        ['Zikr ki ahmiyat', 'Allah ka zikr dil ko sukoon deta hai: "Khabardar! Allah ke zikr se dilon ko itminan milta hai."', 'Qur’an 13:28'],
        ['Allah apne zikr karne walon ko yaad karta hai', 'Mujhe yaad karo main tumhein yaad karoonga.', 'Qur’an 2:152'],
        ['Be-wuzu aur janabat mein zikr', 'Imam Nawawi: ulema ka ijma hai ke be-wuzu, janabat aur haiz-nifaas wali aurat ke liye tasbeeh, hamd, takbeer, durood aur dua jaiz hai (Qur’an padhne ka hukm alag hai).', 'Kitab ki wazahat (ulema se mashwara)'],
        ['Zubaan ke saath dil', 'Zikr sirf zubaan se nahi, dil ke saath aur maani par ghaur karke ho.', 'Qur’an 7:205']
      ] },
    { id:'quranmahina', ic:'📖', title:'Har Mahine Qur’an Ka Khatam', sub:'Roz taqreeban ek Juz',
      intro:'Nabi ﷺ ne farmaya: har mahine Qur’an padho.',
      items:[
        ['Aasaan tareeqa', 'Har namaz se 10 minute pehle masjid pahunchein aur namaz ke aage-peeche thoda thoda padhein. Roz taqreeban ek Juz (kareeban 20 safhe) padhne se mahine mein khatam ho jata hai.', 'Abu Dawood; kitab ka mashwara']
      ] }
  ] }
];
const SN_TOPICS = SN_GROUPS.flatMap(g=> g.topics.map(t=> Object.assign({ g:g.id, color:g.color }, t)));
function snDone(id){ return (state.sunnahDone && state.sunnahDone[id]) || []; }
function snToggle(id, i){
  state.sunnahDone = state.sunnahDone || {};
  const a = new Set(state.sunnahDone[id] || []); a.has(i) ? a.delete(i) : a.add(i);
  state.sunnahDone[id] = [...a]; saveState();
}
function renderSunnah(){
  document.getElementById('detailTitle').textContent = 'Rozmarra Ki Sunnatein';
  const total = SN_TOPICS.reduce((n, t)=> n + t.items.length, 0), did = SN_TOPICS.reduce((n, t)=> n + snDone(t.id).length, 0);
  document.getElementById('detailBody').innerHTML = `
    <div class="aad-intro">Nabi ﷺ ki rozmarra ki sunnatein, mauzu ke hisaab se. Pehle muashira aur ghar walon ke saath, phir khana-peena, zaati amal aur namaz se jude amal. Har sunnat par amal ka nishan laga sakte hain.<br><b>${did}/${total}</b> sunnatein amal mein.</div>
    <div class="kh-disc kh-disc-s">ℹ️ ${SN_NOTE}</div>
    ${SN_GROUPS.map(g=> `<div class="sn-grp" style="--sn-c:${g.color}"><div class="sn-grp-h">${g.ic} ${g.label}</div>${g.topics.map(t=>{ const n = snDone(t.id).length; return `<div class="aad-card status-none" data-sn="${t.id}" style="--aad-c:${g.color};"><div class="aad-ic">${t.ic}</div><div class="aad-info"><div class="aad-title">${t.title}</div><div class="aad-cat-lbl">${t.sub} • ${n}/${t.items.length}</div></div><div class="chev">›</div></div>`; }).join('')}</div>`).join('')}
    <button class="kh-primary" id="snQuizBtn" style="width:100%;margin:12px 0">🧠 Sunnatein ka Quiz khelein</button>`;
  document.querySelectorAll('[data-sn]').forEach(el=> el.onclick = ()=> openSunnahDetail(el.dataset.sn));
  document.getElementById('snQuizBtn').onclick = ()=> renderQuizCountSelect('Rozmarra Ki Sunnatein');
}
function openSunnahDetail(id){
  const t = SN_TOPICS.find(x=> x.id === id); if(!t) return;
  document.getElementById('detailTitle').textContent = t.title;
  const done = snDone(id);
  document.getElementById('detailBody').innerHTML = `
    <div class="aad-head" style="--aad-c:${t.color};"><div class="aad-head-ic">${t.ic}</div><div class="aad-head-title">${t.title}</div></div>
    <div class="aad-intro">${t.intro}</div>
    <div class="aad-guide-sec g1"><ul class="aad-guide-list sn-list">${t.items.map((it, i)=> `<li class="sn-item ${done.includes(i) ? 'on' : ''}" data-i="${i}"><label class="sn-chk"><input type="checkbox" ${done.includes(i) ? 'checked' : ''}> <b>${it[0]}</b></label><div class="sn-d">${String(it[1]).replace(/\n/g, '<br>')}</div><div class="sn-ref">📖 ${String(it[2]).replace(/ ?\(ik\)/, '')}${/\(ik\)/.test(it[2]) ? ' <span class="sn-ik">⚠️ ulema se mashwara</span>' : ''}</div></li>`).join('')}</ul></div>
    ${t.fazl ? `<div class="aad-guide-closing">✨ ${t.fazl}</div>` : ''}
    <div class="kh-disc kh-disc-s">ℹ️ ${SN_NOTE}</div>`;
  document.querySelectorAll('.sn-item input').forEach(cb=> cb.onchange = ()=>{ const li = cb.closest('.sn-item'); snToggle(id, +li.dataset.i); li.classList.toggle('on', cb.checked); });
}

/* QUIZ: category "Rozmarra Ki Sunnatein" (hand-written from the same booklet, so every answer is in the data above). [question, right, wrong1, wrong2, wrong3, explanation] */
(function snQuiz(){
  const CAT = 'Rozmarra Ki Sunnatein';
  const Q = [
    ['Nabi ﷺ ke mutabiq kaun sa Islam behtar hai?', 'Khana khilana aur jaan-pehchaan ho ya na ho, sab ko salaam karna', 'Sirf rishtedaron ko salaam karna', 'Sirf bade logon se milna', 'Alag rehna', 'Bukhari, Muslim ki hadees ke mutabiq: khana khilana aur har kisi ko salaam karna.'],
    ['Poore salaam par kitni nekiyan milti hain (hadees ke mutabiq)?', '30', '10', '20', '50', 'Assalamu alaikum 10, wa rahmatullah 20, wa barakatuh 30 (Abu Dawood, Tirmizi).'],
    ['Kisi neki ko haqeer na samjho, chahe...', 'Apne bhai se muskurakar milna ho', 'Sirf sadqa dena ho', 'Hajj karna ho', 'Qur’an khatam karna ho', 'Muslim ki hadees: muskurahat bhi neki hai.'],
    ['Do Musalman musafaha karen to?', 'Juda hone se pehle unki maghfirat kar di jati hai', 'Kuch nahi hota', 'Roza toot jata hai', 'Wuzu toot jata hai', 'Abu Dawood, Tirmizi, Ibn Majah ki hadees.'],
    ['"Achhi baat" kya hai?', 'Sadqa', 'Sirf adab', 'Gunah', 'Makrooh', 'Bukhari, Muslim: achhi baat sadqa hai.'],
    ['Majlis se uthte waqt kaun si dua padhi jati hai?', 'Kaffara-e-Majlis (Subhanaka Allahumma wa bihamdika ...)', 'Dua-e-Qunoot', 'Dua-e-Masura', 'Sayyid-ul-Istighfar', 'Majlis ki galtiyon ka kaffara.'],
    ['Ghar mein dakhil hote hi pehle Nabi ﷺ kya karte the?', 'Miswak', 'Chai peete', 'Khana khate', 'Sote', 'Hazrat Aisha RA se Muslim ki riwayat.'],
    ['Ghar mein dakhil hote waqt Allah ka naam lene par shaitan kya kehta hai?', 'Tumhare liye na raat ka thikana hai na khana', 'Wo ghar ko jala deta hai', 'Kuch nahi kehta', 'Aao andar chalein', 'Muslim ki hadees.'],
    ['Ghar walon ko dakhil hote waqt kya karna chahiye?', 'Salaam', 'Khamoshi', 'Daantna', 'Kuch nahi', 'Qur’an 24:61 aur Abu Dawood ki hadees.'],
    ['Ghar se nikalne ki dua ke alfaaz kaun se hain?', 'Bismillahi tawakkaltu ‘alallahi, la hawla wa la quwwata illa billah', 'Subhanakallahumma', 'Rabbi zidni ilma', 'Allahu Akbar kabira', 'Tirmizi, Abu Dawood.'],
    ['Farz ke siwa behtareen namaz kahan parhi jaye?', 'Ghar mein', 'Bazaar mein', 'Sirf masjid mein', 'Safar mein hi', 'Bukhari, Muslim.'],
    ['Khane se pehle kya kehna sunnat hai?', 'Bismillah', 'Alhamdulillah', 'Allahu Akbar', 'La hawla', 'Muslim.'],
    ['Khana kis haath se khana chahiye?', 'Seedhe haath se', 'Bayen haath se', 'Kisi bhi se', 'Dono se', 'Muslim.'],
    ['Khane mein kahan se khana sunnat hai?', 'Apne saamne se', 'Beech se', 'Doosron ke saamne se', 'Kahin se bhi', 'Muslim.'],
    ['Nabi ﷺ aksar kitni ungliyon se khate the?', 'Teen', 'Ek', 'Do', 'Paanch', 'Muslim.'],
    ['Khane ke baad ki dua ka phal kya hai?', 'Pichle gunah maaf', 'Sirf bhookh khatam', 'Rizq band', 'Kuch nahi', 'Abu Dawood, Tirmizi, Ibn Majah.'],
    ['Peete waqt saans kahan lein?', 'Bartan ke bahar, teen ghoont mein', 'Bartan ke andar', 'Beech mein saans na lein', 'Ek hi saans mein khatam', 'Muslim.'],
    ['Nabi ﷺ ne peene ke baare mein kya farmaya?', 'Koi khada hokar na piye', 'Hamesha khade hokar piyo', 'Sirf raat ko piyo', 'Sirf garam piyo', 'Muslim.'],
    ['Bathroom mein dakhil hote waqt pehle kaun sa paon?', 'Bayan', 'Seedha', 'Dono ek saath', 'Koi farq nahi', 'Kitab ke mutabiq bayan andar, seedha bahar.'],
    ['Bathroom se nikalne ki dua kya hai?', 'Ghufranak', 'Bismillah', 'Alhamdulillah', 'Subhanallah', 'Sunan ki kitabein (Nasai ke siwa).'],
    ['Jootay pehenne mein kaun sa paon pehle?', 'Seedha', 'Bayan', 'Koi farq nahi', 'Dono ek saath nahi', 'Muslim.'],
    ['Joota utarte waqt pehle kaun sa paon?', 'Bayan', 'Seedha', 'Dono nahi', 'Koi farq nahi', 'Muslim.'],
    ['Libaas pehenne mein pehle kaun si taraf?', 'Seedhi', 'Ulti', 'Peeche', 'Koi farq nahi', 'Tirmizi, Abu Dawood, Ibn Majah.'],
    ['Wuzu ke baad Kalima-e-Shahadat padhne par?', 'Jannat ke aathon darwaze khul jate hain', 'Wuzu toot jata hai', 'Kuch nahi hota', 'Sirf namaz kaafi', 'Muslim.'],
    ['Nabi ﷺ ne miswak ke baare mein kya farmaya?', 'Agar ummat par mushkil na hoti to har namaz se pehle hukm deta', 'Sirf Ramzan mein karo', 'Sirf Juma ko karo', 'Miswak mana hai', 'Ahmad, Nasai; Bukhari, Muslim.'],
    ['Sone se pehle Surah Ikhlaas, Falaq, Naas padh kar kya karte the?', 'Phoonk kar badan par haath pherte (teen baar)', 'Seedha so jate the', 'Sirf padhte the', 'Likhte the', 'Bukhari.'],
    ['Sone se pehle kaun si ayat raat bhar hifazat ka zariya hai?', 'Ayat-ul-Kursi', 'Surah Fatiha', 'Surah Yaseen', 'Surah Mulk', 'Bukhari.'],
    ['Sone se pehle kis taraf lete?', 'Seedhi karwat par', 'Ulti', 'Peeth ke bal', 'Pait ke bal', 'Bukhari, Muslim.'],
    ['Sone se pehle bistar ke saath kya karna sunnat hai?', 'Jhad lena', 'Dhona', 'Badalna', 'Kuch nahi', 'Bukhari, Muslim.'],
    ['Aam kaam ko ibadat banane ke liye kya zaroori hai?', 'Achhi niyyat', 'Zyada waqt', 'Zyada paisa', 'Logon ko dikhana', 'Bukhari, Muslim: aamaal ka daromadar niyyat par hai.'],
    ['Masjid mein dakhil hote waqt kaun sa paon pehle?', 'Seedha', 'Bayan', 'Koi farq nahi', 'Dono nahi', 'Hazrat Anas RA ka qaul.'],
    ['Masjid mein dakhil hone ki dua kya hai?', 'Allahumma iftah li abwaba rahmatik', 'Allahumma inni as’aluka min fadlik', 'Ghufranak', 'Bismillah', 'Nasai, Ibn Majah.'],
    ['Masjid se nikalne ki dua kya hai?', 'Allahumma inni as’aluka min fadlik', 'Allahumma iftah li abwaba rahmatik', 'Ghufranak', 'Subhanallah', 'Muslim.'],
    ['Masjid mein baithne se pehle kya parhna sunnat hai?', 'Do rakat Tahiyyat-ul-Masjid', 'Chaar rakat', 'Kuch nahi', 'Sirf dua', 'Bukhari, Muslim.'],
    ['Azaan ke jawab mein "Hayya alas-salah" par kya kehte hain?', 'La hawla wa la quwwata illa billah', 'Hayya alas-salah', 'Subhanallah', 'Allahu Akbar', 'Bukhari, Muslim.'],
    ['Azaan ke baad Nabi ﷺ par durood bhejne par Allah kya karta hai?', 'Das rahmatein bhejta hai', 'Ek rahmat', 'Kuch nahi', 'Sau rahmatein', 'Muslim.'],
    ['Rozana 12 rakat (sunnat) parhne par kya milta hai?', 'Jannat mein ghar', 'Sirf sawab ki umeed', 'Kuch nahi', 'Roza ka sawab', 'Muslim.'],
    ['Namaz-e-Chasht kitne jodon ke sadqe ke barabar hai?', '360', '100', '200', '99', 'Insaan ke 360 jodon par roz sadqa hai (Muslim).'],
    ['Fajr ki sunnat kaisi parhi jati hai?', 'Do halki rakat', 'Lambi chaar rakat', 'Sirf ek', 'Koi nahi', 'Bukhari, Muslim.'],
    ['Fajr ke baad Nabi ﷺ kya karte the?', 'Apni jagah par sooraj nikalne tak baithe rehte', 'Sote', 'Kaam par jate', 'Kuch nahi', 'Muslim.'],
    ['Witr mein 3 rakat ki surah kaun si hain (kitab ke mutabiq)?', 'A’la, Kafirun, Ikhlaas', 'Fatiha, Baqarah, Nas', 'Yaseen, Rahman, Mulk', 'Falaq, Naas, Kausar', 'Abu Dawood, Tirmizi, Ibn Majah.'],
    ['Har farz namaz ke baad pehle kitni baar Astaghfirullah?', 'Teen', 'Ek', 'Paanch', 'Das', 'Muslim.'],
    ['Namaz ke baad tasbihat (SubhanAllah, Alhamdulillah, Allahu Akbar) kitni kitni baar?', '33', '10', '50', '100', 'Muslim.'],
    ['Zikr se dilon ko kya milta hai?', 'Itminan (sukoon)', 'Bechaini', 'Ghussa', 'Thakan', 'Qur’an 13:28.'],
    ['Allah ﷻ farmata hai: mujhe yaad karo to...', 'Main tumhein yaad karoonga', 'Main tumhein bhool jaoonga', 'Kuch nahi', 'Doosron ko yaad karoonga', 'Qur’an 2:152.'],
    ['Hadees ke mutabiq sochna kis par chahiye?', 'Allah ki nematon par', 'Allah ki zaat par', 'Sirf maal par', 'Sirf dunya par', 'Tabarani, Bayhaqi ki riwayat.'],
    ['Nabi ﷺ ne kitne waqfe mein Qur’an padhne ko farmaya?', 'Har mahine', 'Har saal', 'Har hafte', 'Har din', 'Abu Dawood.'],
    ['Mareez ko dekh kar kaun si dua padhne par wo bimari nahi lagti?', 'Alhamdulillahil-ladhi ‘afani mimmabtalaka bihi...', 'Ghufranak', 'Bismillah', 'La hawla', 'Tirmizi.'],
    ['Sutra namazi ke saamne rakha jata hai taake...', 'Koi saamne se guzarne na paye', 'Awaaz band ho', 'Roshni mile', 'Hawa na aaye', 'Abu Dawood, Ibn Majah, Ibn Khuzaima.']
  ];
  if(QUIZ_CATEGORIES.indexOf(CAT) < 0) QUIZ_CATEGORIES.push(CAT);
  QUIZ_CAT_ICON[CAT] = '🌿';
  Q.forEach(q=>{ const opts = shuffleArr([q[1], q[2], q[3], q[4]]); QUIZ_BANK.push([q[0], opts, opts.indexOf(q[1]), CAT, undefined, { u:q[5], e:q[5] }]); });
})();
