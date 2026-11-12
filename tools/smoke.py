"""Smoke test: serve the site, open every menu screen and fail on any JS error.
Run:  python3 tools/smoke.py   (needs: pip install playwright && playwright install chromium)"""
import sys, threading, functools, http.server, socketserver, pathlib, os
from playwright.sync_api import sync_playwright

root = pathlib.Path(__file__).resolve().parent.parent
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
handler = functools.partial(Q, directory=str(root))
srv = socketserver.TCPServer(('127.0.0.1', 0), handler); port = srv.server_address[1]
threading.Thread(target=srv.serve_forever, daemon=True).start()

errs = []; opened = 0
exe = os.environ.get('CHROME_PATH')
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=exe, args=['--no-sandbox']) if exe else p.chromium.launch(args=['--no-sandbox'])
    ctx = b.new_context(viewport={'width':390,'height':844}, timezone_id='Asia/Kolkata')
    pg = ctx.new_page()
    pg.on('pageerror', lambda e: errs.append('pageerror: '+str(e)))
    pg.on('console', lambda m: errs.append('console: '+m.text) if m.type=='error' and 'favicon' not in m.text else None)
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_timeout(1200)
    pg.evaluate('closeSetup()'); pg.wait_for_timeout(500)
    for tab in ['home','calendar','explore','more']:
        pg.click(f'.tab-btn[data-tab={tab}]'); pg.wait_for_timeout(250)
    keys = pg.eval_on_selector_all('.more-item[data-open]', 'els=>els.map(e=>e.dataset.open)')
    for k in keys:
        if k in ('install',): continue
        pg.evaluate('closeModal && closeModal()')
        pg.click('.tab-btn[data-tab=more]'); pg.wait_for_timeout(150)
        pg.evaluate(f'document.querySelector(\'.more-item[data-open="{k}"]\').click()'); pg.wait_for_timeout(350); opened += 1
        if not pg.evaluate('document.getElementById("detailOverlay").classList.contains("active")'):
            errs.append(f'screen did not open: {k}')
        pg.evaluate('document.getElementById("detailBack").click()'); pg.wait_for_timeout(200)
    # settings sub-screens, calculation methods, timezone sanity
    pg.evaluate('openOverlay(renderSettingsMenu)'); pg.wait_for_timeout(300)
    for k in pg.eval_on_selector_all('#detailBody [data-sec]', 'els=>els.map(e=>e.dataset.sec)'):
        pg.evaluate('openOverlay(renderSettingsMenu)'); pg.wait_for_timeout(150)
        pg.click(f'#detailBody [data-sec="{k}"]'); pg.wait_for_timeout(250); opened += 1
    for m in ['mwl','karachi','isna','egypt','makkah']:
        pg.evaluate(f"state.calcMethod='{m}'")
        t = pg.evaluate("buildSchedule(new Date(2026,10,1,12)).filter(p=>p.key==='fajr'||p.key==='isha').map(p=>p.start.getTime())")
        if any(x!=x for x in t): errs.append('NaN prayer time for '+m)
    # DST: New York noon stays put in UTC across the March change (local clock jumps an hour)
    off = pg.evaluate("(()=>{state.location={name:'NY',lat:40.71,lon:-74,tz:'America/New_York'};const a=buildSchedule(new Date(2026,2,7,12)).find(p=>p.key==='zuhr').start;const b=buildSchedule(new Date(2026,2,9,12)).find(p=>p.key==='zuhr').start;return Math.round((a.getTime()+2*86400000-b.getTime())/60000)})()")
    if abs(off) > 3: errs.append(f'DST: zuhr should stay the same in UTC across the change, drifted {off} min')
    b.close()
srv.shutdown()
print(f'opened {opened} screens, {len(errs)} problems')
for e in errs: print(' -', e)
sys.exit(1 if errs else 0)
