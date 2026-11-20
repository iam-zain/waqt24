/* Ghalat Fehmi Ka Izala: a small line icon beside each question, and a bolded "nahi" in the explanation. Drawn for Waqt24. */
const MYTH_ICONS = {
  scissors:'<circle cx="6" cy="6.5" r="2.8"/><circle cx="6" cy="17.5" r="2.8"/><path d="M8.4 8 L20 19 M8.4 16 L20 5"/>',
  cat:'<path d="M5 9 V4 L9 7 Q12 6 15 7 L19 4 V9 Q20 13 17 17 Q12 21 7 17 Q4 13 5 9z"/><circle cx="9.5" cy="12" r=".8"/><circle cx="14.5" cy="12" r=".8"/>',
  calendar:'<rect x="4" y="5" width="16" height="15" rx="3"/><path d="M4 10 H20 M8 3 V7 M16 3 V7"/>',
  broom:'<path d="M19 3 L12 13"/><path d="M7.5 13 H15 L17 21 H5.5z"/>',
  smile:'<circle cx="12" cy="12" r="9"/><circle cx="9" cy="10" r=".8"/><circle cx="15" cy="10" r=".8"/><path d="M8 14 Q12 18 16 14"/>',
  mosque:'<path d="M5 20 V13 Q5 7 12 7 Q19 7 19 13 V20z"/><path d="M12 7 V3"/><path d="M10 20 V16 Q12 14 14 16 V20"/>',
  minaret:'<path d="M10 21 V8 L12 3 L14 8 V21"/><path d="M8 13 H16 M8 21 H16"/>',
  tap:'<path d="M5 9 H13 Q17 9 17 13 V14"/><path d="M5 6 V12"/><path d="M17 17 q1.6 2.6 0 4 q-1.6 -1.4 0 -4z"/>',
  book:'<path d="M12 6 Q8 4 3 5 V18 Q8 17 12 19 Q16 17 21 18 V5 Q16 4 12 6z"/><path d="M12 6 V19"/>',
  speech:'<path d="M5 5 H19 Q21 5 21 7 V14 Q21 16 19 16 H11 L7 20 V16 H5 Q3 16 3 14 V7 Q3 5 5 5z"/>',
  hands:'<path d="M3 11 Q4 18 12 19 Q20 18 21 11 Q16 15 12 15 Q8 15 3 11z"/><path d="M12 3.5 l1.2 2.6 l2.6 1.2 l-2.6 1.2 l-1.2 2.6 l-1.2 -2.6 l-2.6 -1.2 l2.6 -1.2z"/>',
  mat:'<path d="M6 21 L8 4 H16 L18 21z"/><path d="M12 9 q-3 3 0 7 q3 -4 0 -7z"/>',
  crescent:'<path d="M20 14.5 A8 8 0 1 1 9.5 4 6.5 6.5 0 0 0 20 14.5z"/><path d="M17 4 l.8 1.8 l1.8 .8 l-1.8 .8 l-.8 1.8 l-.8 -1.8 l-1.8 -.8 l1.8 -.8z"/>',
  heart:'<path d="M12 20 C4 14 4 7.5 8.5 7 C10.5 6.8 11.6 8 12 9 C12.4 8 13.5 6.8 15.5 7 C20 7.5 20 14 12 20z"/>',
  scale:'<path d="M12 4 V20 M7 20 H17 M5 7 H19"/><path d="M5 7 L2.5 13 H7.5z M19 7 L16.5 13 H21.5z"/>',
  people:'<circle cx="8" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M2.5 20 Q3 13 8 13 Q13 13 13.5 20z"/><path d="M14.5 20 Q15 14.5 17.5 14.5 Q21 14.5 21.5 20z"/>',
  rings:'<circle cx="9" cy="14" r="5"/><circle cx="15" cy="14" r="5"/><path d="M10 5.5 L12 3 L14 5.5 L12 8z"/>',
  sprout:'<path d="M12 21 V11"/><path d="M12 13 Q6 13 5 7 Q11 7 12 13z"/><path d="M12 11 Q18 11 19 5 Q13 5 12 11z"/>',
  house:'<path d="M3 11 L12 4 L21 11"/><path d="M5 10 V20 H19 V10"/><path d="M10 20 V14 H14 V20"/>',
  eye:'<path d="M2 12 Q12 4 22 12 Q12 20 2 12z"/><circle cx="12" cy="12" r="3"/>',
  coins:'<ellipse cx="12" cy="7" rx="7" ry="3"/><path d="M5 7 V12 Q5 15 12 15 Q19 15 19 12 V7"/><path d="M5 12 V17 Q5 20 12 20 Q19 20 19 17 V12"/>',
  dove:'<path d="M3 14 Q7 6 15 8 Q15 12 11 14 Q9 18 4 17 Q8 15 8 14z"/><path d="M15 8 L21 6 L18 10"/>',
  mountain:'<path d="M2 20 L9 8 L13 14 L16 10 L22 20z"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 3 V5 M12 19 V21 M3 12 H5 M19 12 H21 M5.6 5.6 L7 7 M17 17 L18.4 18.4 M5.6 18.4 L7 17 M17 7 L18.4 5.6"/>',
  drop:'<path d="M12 4 C16 9 18 12 18 15 A6 6 0 0 1 6 15 C6 12 8 9 12 4z"/>',
  gate:'<path d="M5 21 V10 Q5 4 12 4 Q19 4 19 10 V21"/><path d="M9 21 V12 Q9 9 12 9 Q15 9 15 12 V21"/>',
  globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12 H21"/><path d="M12 3 Q7 12 12 21 Q17 12 12 3z"/>'
};
const MYTH_ICON_COL = { scissors:'#e0709f', cat:'#6b7f99', calendar:'#e0893f', broom:'#c79a2e', smile:'#e0b04f', mosque:'#2f9e6e', minaret:'#3aa86a', tap:'#3f8fe0', book:'#9b6fd6', speech:'#5c7cfa', hands:'#9b6fd6', mat:'#2fb6b0', crescent:'#c79a2e', heart:'#e0709f', scale:'#c0563f', people:'#3f8fe0', rings:'#e0709f', sprout:'#3aa86a', house:'#e0893f', eye:'#6b7f99', coins:'#d4a017', dove:'#4f8fd6', mountain:'#6b7f99', sun:'#e0893f', drop:'#3f8fe0', gate:'#4fb286', globe:'#2fb6b0' };
/* one icon per myth, in the same order as MYTH_BUSTERS */
const MYTH_ICON_ORDER = ['scissors','scissors','scissors','cat','calendar','calendar','broom','smile','mosque','minaret',
  'tap','book','speech','hands','hands','hands','mat','mat','crescent','crescent',
  'crescent','heart','book','hands','scale','people','rings','people','sprout','house',
  'speech','speech','eye','eye','coins','dove','mountain','sun','drop','heart',
  'gate','gate','globe','scale','heart','mountain','heart','scale','book','people'];
function mythIconHtml(m){
  const i = MYTH_BUSTERS.indexOf(m), k = MYTH_ICON_ORDER[i];
  if(!k) return '';
  return `<span class="myth-ic" style="--c:${MYTH_ICON_COL[k]}" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${MYTH_ICONS[k]}</svg></span>`;
}
/* the explanation: "nahi" stands out */
function mythExplainHtml(t){ return String(t || '').replace(/\b(nahi|Nahi)\b/g, '<b>$1</b>'); }
