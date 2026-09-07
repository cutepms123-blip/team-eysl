from pathlib import Path
p=Path('index.html')
s=p.read_text()
# The installed iOS PWA can keep an older controller. Make the HTML itself own all current fixes.
s=s.replace("/sw.js?v=final140-lean-runtime","/sw.js?v=final147-direct-runtime")
files=[
 ('race-attachment-v123.js','final147'),
 ('race-time-fields-v124.js','final147'),
 ('race-application-v125.js','final147'),
 ('race-ui-v142.js','final147'),
 ('schedule-deadline-race-v142.js','final147'),
 ('author-monthly-deadline-v145.js','final147'),
]
for f,v in files:
    # Remove any older direct instance, then append one canonical instance at the very end.
    import re
    s=re.sub(r'\n?<script src="/'+re.escape(f)+r'\?v=[^"]+"></script>','',s)
    s=s.replace('</body>',f'<script src="/{f}?v={v}"></script>\n</body>')
p.write_text(s)
print('v147 direct runtime injected')
