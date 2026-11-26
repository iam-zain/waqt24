"""English-mode audit: open every screen with language = English and list visible Roman-Urdu words in the UI.
Run: python3 tools/langcheck.py   (content data such as du'as and hadith meanings stays Roman Urdu by design)"""
import sys, re, threading, functools, http.server, socketserver, pathlib, collections
from playwright.sync_api import sync_playwright
root = pathlib.Path(__file__).resolve().parent.parent
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
srv = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Q, directory=str(root))); port = srv.server_address[1]
threading.Thread(target=srv.serve_forever, daemon=True).start()
WORDS = set("ka ke ki hai hain mein aur karein karen dekhein dekhiye padhein padhiye sunein suniye likhein hatayein jodein badlein chunein chuniye chuniye baaqi baaki nahi nahin abhi wala wale wali liye saath sirf kuch yeh woh apna apni aapka aapki aap hamesha jaata jaati baad pehle phir lein dein rokein shuru khatam naya naye nayi roz din ghante ghanta hafte hafta mahine mahina sab bahut bohot zyada kam thoda poora poori khaas baare matlab tarjuma hawala maloom mil mila mile sakte sakta sakti chahiye chahte kaise kya kyun kahan kab jab tak bhi agar lekin magar isse usse inhe unhe iska uska inka unka hum tum mera meri mere tera teri tumhara hamara sunte padhte karna karne karte kiya kiye gaya gayi gaye hua hui hue raha rahi rahe wahi yahan wahan neeche upar andar bahar tarah tarah jaise jaisa waqt namaz sawab gunah dua ibadat".split())
OK = set("namaz dua ibadat waqt".split())  # proper nouns used on purpose in English text
WORDS -= OK
seen = collections.OrderedDict(); LAST=['start']
def scan(pg, where):
    LAST[0] = where
    txt = pg.evaluate("""()=>{ const out=[]; const ov=document.getElementById('detailOverlay'); const root=(ov&&ov.classList.contains('active'))?ov:document.body; const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
      while(w.nextNode()){ const n=w.currentNode, p=n.parentElement; if(!p||/SCRIPT|STYLE/.test(p.tagName)) continue;
        const r=p.getBoundingClientRect(); if(!r.width||!r.height) continue; const cs=getComputedStyle(p); if(cs.visibility==='hidden'||cs.display==='none') continue;
        if(p.closest('.arabic,.ar-font,.dua-ar,[dir=rtl]')) continue;
        const t=n.nodeValue.trim(); if(t) out.push(t);} return out; }""")
    for t in txt:
        ws = re.findall(r"[A-Za-z']+", t.lower())
        hits = [w for w in ws if w in WORDS]
        if len(hits) >= 1 and (len(hits) >= 2 or len(ws) <= 4): seen.setdefault(t, (where, hits))
with sync_playwright() as p:
    b = p.chromium.launch(args=['--no-sandbox']); ctx = b.new_context(viewport={'width':390,'height':844}, timezone_id='Asia/Kolkata', service_workers='block'); pg = ctx.new_page(); pass
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_timeout(1000); pg.evaluate("closeSetup();state.lang='en';saveState()")
    pg.reload(); pg.wait_for_timeout(1200); pg.evaluate('closeSetup()'); pg.wait_for_timeout(400)
    for tab in ['home','calendar','explore','more']:
        pg.click(f'.tab-btn[data-tab={tab}]'); pg.wait_for_timeout(300); scan(pg, 'tab:'+tab)
    keys = pg.eval_on_selector_all('.more-item[data-open]', 'els=>els.map(e=>e.dataset.open)')
    for k in keys:
        if k == 'install': continue
        pg.evaluate('closeModal && closeModal()'); pg.click('.tab-btn[data-tab=more]'); pg.wait_for_timeout(150)
        pg.evaluate(f'document.querySelector(\'.more-item[data-open="{k}"]\').click()'); pg.wait_for_timeout(450); scan(pg, k)
        # click through tabs / segmented controls inside the screen
        for sel in ['#detailBody .zk-seg button','#detailBody .tabs button','#detailBody [data-tab]','#detailBody .seg button','#detailBody .chip-row button']:
            n = pg.evaluate(f"document.querySelectorAll('{sel}').length")
            for i in range(min(n, 8)):
                try: LAST[0]=f'click {k} {sel}#{i}'; pg.evaluate(f"document.querySelectorAll('{sel}')[{i}].click()"); pg.wait_for_timeout(200); scan(pg, f'{k}>{sel.split(" ")[-1]}#{i}')
                except Exception: pass
        pg.evaluate('document.getElementById("detailBack").click()'); pg.wait_for_timeout(150)
    pg.evaluate('openOverlay(renderSettingsMenu)'); pg.wait_for_timeout(300); scan(pg, 'settings')
    for k in pg.eval_on_selector_all('#detailBody [data-sec]', 'els=>els.map(e=>e.dataset.sec)'):
        pg.evaluate('openOverlay(renderSettingsMenu)'); pg.wait_for_timeout(150); pg.click(f'#detailBody [data-sec="{k}"]'); pg.wait_for_timeout(300); scan(pg, 'settings:'+k)
    pg.evaluate('closeModal && closeModal()')
    # extra layers: home goal cards (opened + info), notes editor, setup steps, saved items, a dua and a hadith detail
    ctx.close(); ctx = b.new_context(viewport={'width':390,'height':844}, timezone_id='Asia/Kolkata', service_workers='block'); pg = ctx.new_page()
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_timeout(1000); pg.evaluate("closeSetup();state.lang='en';saveState()")
    pg.reload(); pg.wait_for_timeout(4000); pg.evaluate('closeSetup()'); pg.wait_for_timeout(500)
    for code in ["goalOpenCard=true;goalInfoOpen=true;wkOpenCard=true;wkInfoOpen=true;renderGoalCard()", "openNoteBox({})", "openOverlay(renderBookmarks)", "showWhatsNew && showWhatsNew()", "showSetup('lang')", "showSetup('city')", "openDuaDetail(DUAS[0])", "openDuaDetail(DUAS.find(d=>d.cat==='Rabbana'))", "openOverlay(renderMoreSettings)"]:
        try:
            pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_timeout(2500); pg.evaluate('closeSetup()'); pg.wait_for_timeout(1500)
            pg.evaluate(code); pg.wait_for_timeout(450); scan(pg, code[:24])
        except Exception as e: print('skip', code[:30], str(e)[:70])
    b.close()
srv.shutdown()
import json
if '--json' in sys.argv: json.dump(list(seen.keys()), open('/tmp/lang.json','w'), ensure_ascii=False, indent=0)
for t, (w, h) in seen.items(): print(f'{w:22} | {t[:140]}   <- {",".join(h)}')
print(len(seen), 'suspect strings')
