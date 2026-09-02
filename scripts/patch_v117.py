from pathlib import Path
import re

index_path=Path('index.html')
sw_path=Path('sw.js')
index=index_path.read_text(encoding='utf-8')
sw=sw_path.read_text(encoding='utf-8')

marker='/notice-engagement-v117.js?v=final117-notice-engagement'
script=f'<script src="{marker}"></script>'

if marker not in index:
    anchor='<script src="/notice-upload-fix-v116.js?v=final116-notice-upload"></script>'
    if anchor in index:
        index=index.replace(anchor, anchor+'\n'+script, 1)
    else:
        index=index.replace('</body>', script+'\n</body>', 1)

index=re.sub(r"navigator\.serviceWorker\.register\('/sw\.js\?v=[^']+'\)", "navigator.serviceWorker.register('/sw.js?v=final117-notice-engagement')", index, count=1)

sw=re.sub(r"const VERSION='[^']+';", "const VERSION='team-eysl-final117-notice-engagement';", sw, count=1)

if "'/notice-engagement-v117.js'" not in sw:
    sw=sw.replace("'/notice-upload-fix-v116.js'];", "'/notice-upload-fix-v116.js','/notice-engagement-v117.js'];", 1)

inject="    if(!html.includes('/notice-engagement-v117.js'))html=html.replace('</body>','<script src=\"/notice-engagement-v117.js?v=final117-notice-engagement\"></script></body>');\n"
if "/notice-engagement-v117.js?v=final117-notice-engagement" not in sw:
    anchor="    if(!html.includes('/notice-upload-fix-v116.js'))html=html.replace('</body>','<script src=\"/notice-upload-fix-v116.js?v=final116-notice-upload\"></script></body>');\n"
    if anchor in sw:
        sw=sw.replace(anchor, anchor+inject, 1)
    else:
        needle="    return new Response(html,{status:res.status,statusText:res.statusText,headers:new Headers(res.headers)});\n"
        sw=sw.replace(needle, inject+needle, 1)

index_path.write_text(index,encoding='utf-8')
sw_path.write_text(sw,encoding='utf-8')

assert marker in index
assert 'final117-notice-engagement' in index
assert "team-eysl-final117-notice-engagement" in sw
assert "/notice-engagement-v117.js" in sw
print('v117 notice engagement patch applied')
