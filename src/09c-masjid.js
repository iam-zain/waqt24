/* ===== NEARBY MASJID: opens the phone's maps app with a search for mosques ===== */
function masjidMapsUrl(lat, lon){ return `https://www.google.com/maps/search/mosque/@${(+lat).toFixed(5)},${(+lon).toFixed(5)},15z`; }
function masjidOpen(url){ try{ window.open(url, '_blank', 'noopener'); }catch(e){ location.href = url; } }
function renderMasjid(){
  document.getElementById('detailTitle').textContent = L({rur:'Qareebi Masjid', en:'Nearby Masjid'});
  const loc = state.location || CITIES[0];
  document.getElementById('detailBody').innerHTML = `<div class="masjid-card">
      <div class="masjid-ic">🕌</div>
      <div class="masjid-h">${L({rur:'Apne paas ki masjid dhoondhein', en:'Find a masjid near you'})}</div>
      <p>${L({rur:'Maps khulega aur paas ki masjidein dikhayega. Aapki location sirf maps ko jaati hai, Waqt24 use save nahi karta.', en:'Your maps app opens with mosques around you. Your location goes only to maps; Waqt24 does not store it.'})}</p>
      <button type="button" class="masjid-btn primary" id="masjidGps">📍 ${L({rur:'Meri location ke paas', en:'Near my location'})}</button>
      <button type="button" class="masjid-btn" id="masjidCity">🏙️ ${L({rur:`${loc.name} mein masjidein`, en:`Mosques in ${loc.name}`})}</button>
      <div class="masjid-msg" id="masjidMsg"></div>
    </div>
    <div class="masjid-card soft">
      <div class="masjid-h" style="font-size:15px;">⏰ ${L({rur:'Apni masjid ki jamaat ka waqt', en:'Your masjid’s jamaat times'})}</div>
      <p>${L({rur:'Jamaat ka waqt set karein, Home par jamaat ki yaad-dahani milegi.', en:'Set the jamaat times and get a jamaat reminder on Home.'})}</p>
      <button type="button" class="masjid-btn" id="masjidJamaat">${L({rur:'Jamaat settings kholein', en:'Open jamaat settings'})}</button>
    </div>`;
  const msg = document.getElementById('masjidMsg');
  document.getElementById('masjidCity').onclick = ()=> masjidOpen(masjidMapsUrl(loc.lat, loc.lon));
  document.getElementById('masjidJamaat').onclick = ()=> openOverlay(renderIqamahSettings);
  document.getElementById('masjidGps').onclick = ()=>{
    if(!navigator.geolocation){ msg.textContent = L({rur:'Is device par location nahi mil sakti. Shehar se dhoondhein.', en:'Location is not available here. Try the city search.'}); return; }
    msg.textContent = L({rur:'Location dhoondh rahe hain…', en:'Finding your location…'});
    navigator.geolocation.getCurrentPosition(
      pos=>{ msg.textContent = ''; masjidOpen(masjidMapsUrl(pos.coords.latitude, pos.coords.longitude)); },
      ()=>{ msg.textContent = L({rur:'Location ki ijazat nahi mili. Shehar se dhoondhein.', en:'Location permission was not given. Try the city search.'}); },
      { enableHighAccuracy:false, timeout:10000, maximumAge:300000 });
  };
}
navWrap('renderMasjid', 0);
(function(){
  const item = document.querySelector('.more-item[data-open="masjid"]');
  if(item) item.onclick = ()=> openOverlay(renderMasjid);
})();
