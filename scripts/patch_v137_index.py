from pathlib import Path
import re
p=Path('index.html')
s=p.read_text()
s=re.sub(r"/sw\.js\?v=final\d+[^'\"]*","/sw.js?v=final148-direct-runtime",s)
# Order matters: deadline wraps base form first; race-ui loads last so fixed/manual rosters cannot be overwritten.
files=[
 ('race-attachment-v123.js','final148'),
 ('race-time-fields-v124.js','final148'),
 ('race-application-v125.js','final148'),
 ('schedule-deadline-race-v142.js','final148'),
 ('race-ui-v142.js','final148'),
 ('author-monthly-deadline-v145.js','final148'),
]
for f,v in files:
    s=re.sub(r'\n?<script src="/'+re.escape(f)+r'\?v=[^"]+"></script>','',s)
for f,v in files:
    s=s.replace('</body>',f'<script src="/{f}?v={v}"></script>\n</body>')
p.write_text(s)
print('v148 canonical direct runtime injected')
