/* ===== Salutation after the name of Allah: "Allah ﷻ" everywhere =====
   Every text on screen is covered: the names, the Qur'an translations (Hinglish / English, Hindi अल्लाह, Urdu اللہ), the quiz and
   all other screens. It is applied to the text of the page as it appears or changes, so nothing needs editing one by one.
   Forms such as Allahu, Allahumma, MashaAllah and the Arabic script of the Mushaf are left as they are. */
const HON_RE = /(\bAllah\b(?!['’])|अल्लाह(?![ऀ-ॿ])|اللّ?ٰ?ہ(?![؀-ۿ]))(?!\s?ﷻ)/g;
const HON_FAST = /Allah|अल्लाह|الل/;
const HON_SKIP = /^(SCRIPT|STYLE|TEXTAREA|INPUT|NOSCRIPT)$/;
function honorific(s){ return HON_FAST.test(s) ? s.replace(HON_RE, '$1 ﷻ') : s; }
function honNode(n){
  if(!n) return;
  if(n.nodeType === 3){
    const p = n.parentNode; if(!p || HON_SKIP.test(p.nodeName) || p.isContentEditable) return;
    const v = n.nodeValue; if(v && HON_FAST.test(v)){ const w = v.replace(HON_RE, '$1 ﷻ'); if(w !== v) n.nodeValue = w; }
    return;
  }
  if(n.nodeType !== 1 || HON_SKIP.test(n.nodeName)) return;
  const walk = document.createTreeWalker(n, NodeFilter.SHOW_TEXT); const list = []; while(walk.nextNode()) list.push(walk.currentNode);
  list.forEach(honNode);
}
(function(){
  const start = ()=>{
    honNode(document.body);
    new MutationObserver(ms=>{ for(const m of ms){ if(m.type === 'characterData') honNode(m.target); else m.addedNodes.forEach(honNode); } })
      .observe(document.body, { childList:true, subtree:true, characterData:true });
  };
  if(document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
