from pathlib import Path
import re

index_path=Path('index.html')
sw_path=Path('sw.js')
index=index_path.read_text(encoding='utf-8')
sw=sw_path.read_text(encoding='utf-8')

marker='/notice-interaction-fix-v118.js?v=final118-notice-interaction'
script=f'<script src="{marker}"></script>'

if marker not in index:
    anchor='<script src="/notice-engagement-v117.js?v=final117-notice-engagement"></script>'
    if anchor in index:
        index=index.replace(anchor, anchor+'\n'+script, 1)
    else:
        index=index.replace('</body>', script+'\n</body>', 1)

index=re.sub(r"navigator\.serviceWorker\.register\('/sw\.js\?v=[^']+'\)", "navigator.serviceWorker.register('/sw.js?v=final118-notice-interaction')", index, count=1)
sw=re.sub(r"const VERSION='[^']+';", "const VERSION='team-eysl-final118-notice-interaction';", sw, count=1)

if "'/notice-interaction-fix-v118.js'" not in sw:
    if "'/notice-engagement-v117.js'];" in sw:
        sw=sw.replace("'/notice-engagement-v117.js'];", "'/notice-engagement-v117.js','/notice-interaction-fix-v118.js'];", 1)
    elif "'/notice-engagement-v117.js'," in sw:
        pass

inject="    if(!html.includes('/notice-interaction-fix-v118.js'))html=html.replace('</body>','<script src=\"/notice-interaction-fix-v118.js?v=final118-notice-interaction\"></script></body>');\n"
if "/notice-interaction-fix-v118.js?v=final118-notice-interaction" not in sw:
    anchor="    if(!html.includes('/notice-engagement-v117.js'))html=html.replace('</body>','<script src=\"/notice-engagement-v117.js?v=final117-notice-engagement\"></script></body>');\n"
    if anchor in sw:
        sw=sw.replace(anchor, anchor+inject, 1)
    else:
        needle="    return new Response(html,{status:res.status,statusText:res.statusText,headers:new Headers(res.headers)});\n"
        sw=sw.replace(needle, inject+needle, 1)

index_path.write_text(index,encoding='utf-8')
sw_path.write_text(sw,encoding='utf-8')

assert marker in index
assert 'final118-notice-interaction' in index
assert "team-eysl-final118-notice-interaction" in sw
assert "/notice-interaction-fix-v118.js" in sw
print('v118 notice interaction patch applied')
