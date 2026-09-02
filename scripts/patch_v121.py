from pathlib import Path
import re

index_path=Path('index.html')
sw_path=Path('sw.js')
index=index_path.read_text(encoding='utf-8')
sw=sw_path.read_text(encoding='utf-8')

marker='/notice-deadline-layout-v121.js?v=final121-notice-deadline-layout'
script=f'<script src="{marker}"></script>'

if marker not in index:
    anchor='<script src="/notice-date-picker-v119.js?v=final119-notice-date-picker"></script>'
    if anchor in index:
        index=index.replace(anchor, anchor+'\n'+script, 1)
    else:
        index=index.replace('</body>', script+'\n</body>', 1)

index=re.sub(r"navigator\.serviceWorker\.register\('/sw\.js\?v=[^']+'\)", "navigator.serviceWorker.register('/sw.js?v=final121-notice-deadline-layout')", index, count=1)
sw=re.sub(r"const VERSION='[^']+';", "const VERSION='team-eysl-final121-notice-deadline-layout';", sw, count=1)

if "'/notice-deadline-layout-v121.js'" not in sw:
    sw=sw.replace("'/notice-date-picker-v119.js'];", "'/notice-date-picker-v119.js','/notice-deadline-layout-v121.js'];", 1)

inject="    if(!html.includes('/notice-deadline-layout-v121.js'))html=html.replace('</body>','<script src=\"/notice-deadline-layout-v121.js?v=final121-notice-deadline-layout\"></script></body>');\n"
if "/notice-deadline-layout-v121.js?v=final121-notice-deadline-layout" not in sw:
    anchor="    if(!html.includes('/notice-date-picker-v119.js'))html=html.replace('</body>','<script src=\"/notice-date-picker-v119.js?v=final119-notice-date-picker\"></script></body>');\n"
    if anchor in sw:
        sw=sw.replace(anchor, anchor+inject, 1)
    else:
        needle="    return new Response(html,{status:res.status,statusText:res.statusText,headers:new Headers(res.headers)});\n"
        sw=sw.replace(needle, inject+needle, 1)

index_path.write_text(index,encoding='utf-8')
sw_path.write_text(sw,encoding='utf-8')

assert marker in index
assert 'final121-notice-deadline-layout' in index
assert "team-eysl-final121-notice-deadline-layout" in sw
assert "/notice-deadline-layout-v121.js" in sw
print('v121 notice deadline layout patch applied')
