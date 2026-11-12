#!/usr/bin/env python3
"""Waqt24 build step. Run from anywhere:  python tools/build.py

1. Joins src/*.js (in filename order) into app.js. The app is written as one program split over
   several files for easier editing; it must still run as ONE script, because its parts call each
   other's functions while loading.
2. Stamps a short content hash on every versioned file in index.html (styles.css, app.js, data.js,
   i18n.js) and the same hashes plus a build id into sw.js, so a changed file always gets a new URL
   and the service worker updates by itself. No manual version numbers.

Edit src/*.js, styles.css, data.js, i18n.js, index.html; then run this before committing.
"""
import hashlib, pathlib, re, sys

root = pathlib.Path(__file__).resolve().parent.parent
parts = sorted((root / 'src').glob('*.js'))
if not parts:
    sys.exit('no src/*.js found')
banner = '/* app.js is BUILT from src/*.js by tools/build.py. Edit the files in src/, not this one. */\n'
app = banner + ''.join(p.read_text(encoding='utf-8') for p in parts)
(root / 'app.js').write_text(app, encoding='utf-8', newline='\n')

def h(name):
    return hashlib.sha1((root / name).read_bytes()).hexdigest()[:8]

versioned = ['styles.css', 'app.js', 'data.js', 'i18n.js']
ver = {n: h(n) for n in versioned}

index = root / 'index.html'
t = index.read_text(encoding='utf-8')
for n, v in ver.items():
    t, k = re.subn(r'(%s)\?v=[\w]+' % re.escape(n), r'\1?v=' + v, t)
    if not k:
        sys.exit('index.html does not reference ' + n)
index.write_text(t, encoding='utf-8', newline='\n')

build = hashlib.sha1(''.join(ver[n] for n in versioned).encode() + (root / 'index.html').read_bytes()).hexdigest()[:8]
sw = root / 'sw.js'
s = sw.read_text(encoding='utf-8')
s = re.sub(r"const BUILD = '[\w]*';", "const BUILD = '%s';" % build, s)
for n, v in ver.items():
    s, k = re.subn(r"'\./%s\?v=[\w]+'" % re.escape(n), "'./%s?v=%s'" % (n, v), s)
    if not k:
        sys.exit('sw.js does not list ' + n)
sw.write_text(s, encoding='utf-8', newline='\n')
print('built app.js (%d bytes from %d files)' % (len(app.encode()), len(parts)))
print('build', build, ver)
