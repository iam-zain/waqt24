/* ============================================================
   MUBARAK CARDS: Juma, Eid, Ramzan, Hijri saal, Nikah, naye bachche ki mubarakbad.
   Pick a card, optionally add your name, share it as a picture in any card look (Noor / Raat / Sabz).
   ============================================================ */
const MUBARAK_CARDS = [
  { id:'juma', ic:'🕌', title:'Juma Mubarak', scene:'masjidIn', ar:'جُمُعَةٌ مُبَارَكَةٌ', wish:'Allah is mubarak din ki barkatein aap aur aapke ghar walon par nazil farmaye aur aapki duain qabool farmaye.' },
  { id:'fitr', ic:'🌙', title:'Eid-ul-Fitr Mubarak', scene:'lanterns', ar:'تَقَبَّلَ اللَّهُ مِنَّا وَمِنْكُمْ', wish:'Taqabbalallahu minna wa minkum. Allah hamare aur aapke roze aur ibadaat qabool farmaye. Eid Mubarak!' },
  { id:'adha', ic:'🐑', title:'Eid-ul-Adha Mubarak', scene:'kaaba', ar:'عِيدٌ مُبَارَكٌ', wish:'Allah hamari qurbani aur ibadaat qabool farmaye aur is Eid ko khushiyon aur barkaton wali banaye. Eid Mubarak!' },
  { id:'ramzan', ic:'☪️', title:'Ramzan Mubarak', scene:'bookNight', ar:'رَمَضَانُ مُبَارَكٌ', wish:'Allah is Ramzan ko aapke liye maghfirat, rehmat aur jahannam se nijaat ka zariya banaye.' },
  { id:'hijri', ic:'📅', title:'Naya Hijri Saal Mubarak', scene:'calendar', ar:'كُلُّ عَامٍ وَأَنْتُمْ بِخَيْرٍ', wish:'Naya Islami saal aapke liye imaan, sukoon aur bhalai lekar aaye. Allah is saal ko behtar banaye.' },
  { id:'nikah', ic:'💐', title:'Nikah Mubarak', scene:'flower', ar:'بَارَكَ اللَّهُ لَكُمَا وَبَارَكَ عَلَيْكُمَا وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ', wish:'Allah aap dono ko barkat de, aap par barkat nazil kare aur aap dono ko bhalai mein jama rakhe.' },
  { id:'baby', ic:'🌱', title:'Naye Mehmaan Ki Mubarakbad', scene:'sprout', ar:'بَارَكَ اللَّهُ لَكَ فِي الْمَوْهُوبِ لَكَ', wish:'Allah is naye mehmaan ko aapke liye barkat banaye, use nek aur lambi umr de aur aapko iska shukr karne ki taufeeq ata farmaye.' }
];
function mubarakNameVal(){ return (state.mubarakName || '').trim(); }
function mubarakShare(c){
  const nm = mubarakNameVal();
  openCardShareChooser({ scene: (window.sceneByKey ? sceneByKey(c.scene) : ''), kind:'Mubarak', arabic:c.ar, title:c.title, body:c.wish, foot: nm ? ('— ' + nm) : '' });
}
function renderMubarak(){
  document.getElementById('detailTitle').textContent = L({ rur:'Mubarak Cards', en:'Greeting Cards' });
  document.getElementById('detailBody').innerHTML = `
    <div class="aad-intro">${L({ rur:'Apne apnon ko mubarakbad bhejein. Card chuniye, chahein to apna naam likhein, phir Share dabayein. Card ka look (Noor, Raat, Sabz) share karte waqt badal sakte hain.', en:'Send greetings to your loved ones. Pick a card, add your name if you like, then tap Share. You can change the look when you share.' })}</div>
    <div class="mb-name"><input id="mbName" type="text" maxlength="30" placeholder="${L({ rur:'Aapka naam (zaroori nahi)', en:'Your name (optional)' })}" value="${mubarakNameVal().replace(/"/g, '&quot;')}"></div>
    <div class="mb-list">${MUBARAK_CARDS.map((c,i)=>`<div class="mb-card" data-i="${i}">
      <div class="dua-scene">${sceneByKey(c.scene)}</div>
      <div class="mb-body"><div class="mb-ar arabic">${c.ar}</div><div class="mb-t">${c.ic} ${c.title}</div><div class="mb-w">${c.wish}</div>
      <button class="backup-btn mb-share" data-i="${i}">${SHARE_SVG} ${L({ rur:'Share karein', en:'Share' })}</button></div>
    </div>`).join('')}</div>`;
  const inp = document.getElementById('mbName');
  inp.oninput = ()=>{ state.mubarakName = inp.value; saveState(); };
  document.querySelectorAll('.mb-share').forEach(b=>{ b.onclick = ()=> mubarakShare(MUBARAK_CARDS[+b.dataset.i]); });
}
