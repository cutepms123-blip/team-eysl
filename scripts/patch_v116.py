from pathlib import Path

index_path=Path('index.html')
sw_path=Path('sw.js')
index=index_path.read_text(encoding='utf-8')
sw=sw_path.read_text(encoding='utf-8')

marker='/notice-upload-fix-v116.js?v=final116-notice-upload'
script=f'<script src="{marker}"></script>'

if marker not in index:
    anchor='<script src="/notice-poll-v115.js?v=final115-notice-poll"></script>'
    if anchor in index:
        index=index.replace(anchor, anchor+'\n'+script, 1)
    else:
        index=index.replace('</body>', script+'\n</body>', 1)

index=index.replace("navigator.serviceWorker.register('/sw.js?v=final115-notice-poll')", "navigator.serviceWorker.register('/sw.js?v=final116-notice-upload')")

if "const VERSION='team-eysl-final115-notice-poll';" in sw:
    sw=sw.replace("const VERSION='team-eysl-final115-notice-poll';", "const VERSION='team-eysl-final116-notice-upload';", 1)
elif "const VERSION='team-eysl-final116-notice-upload';" not in sw:
    import re
    sw=re.sub(r"const VERSION='[^']+';", "const VERSION='team-eysl-final116-notice-upload';", sw, count=1)

if "'/notice-upload-fix-v116.js'" not in sw:
    sw=sw.replace("'/notice-poll-v115.js'];", "'/notice-poll-v115.js','/notice-upload-fix-v116.js'];", 1)

inject="    if(!html.includes('/notice-upload-fix-v116.js'))html=html.replace('</body>','<script src=\"/notice-upload-fix-v116.js?v=final116-notice-upload\"></script></body>');\n"
if "/notice-upload-fix-v116.js?v=final116-notice-upload" not in sw:
    anchor="    if(!html.includes('/notice-poll-v115.js'))html=html.replace('</body>','<script src=\"/notice-poll-v115.js?v=final115-notice-poll\"></script></body>');\n"
    if anchor in sw:
        sw=sw.replace(anchor, anchor+inject, 1)
    else:
        needle='    return new Response(html,{status:res.status,statusText:res.statusText,headers:new Headers(res.headers)});\n'
        sw=sw.replace(needle, inject+needle, 1)

index_path.write_text(index,encoding='utf-8')
sw_path.write_text(sw,encoding='utf-8')

assert marker in index
assert "final116-notice-upload" in index
assert "team-eysl-final116-notice-upload" in sw
assert "/notice-upload-fix-v116.js" in sw
print('v116 notice upload patch applied')
