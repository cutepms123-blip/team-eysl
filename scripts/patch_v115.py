from pathlib import Path

index = Path('index.html')
text = index.read_text(encoding='utf-8')

script_tag = '<script src="/notice-poll-v115.js?v=final115-notice-poll"></script>'
if script_tag not in text:
    if '</body>' not in text:
        raise SystemExit('index body anchor not found')
    text = text.replace('</body>', script_tag + '\n</body>', 1)

text = text.replace('/sw.js?v=final114-direct-index', '/sw.js?v=final115-notice-poll')
if '/sw.js?v=final115-notice-poll' not in text:
    raise SystemExit('service worker registration anchor not found')
index.write_text(text, encoding='utf-8')

sw = Path('sw.js')
s = sw.read_text(encoding='utf-8')
s = s.replace("const VERSION='team-eysl-final113-remove-aggregation';", "const VERSION='team-eysl-final115-notice-poll';")
if "'/notice-poll-v115.js'" not in s:
    s = s.replace("'/remove-aggregation-v113.js'];", "'/remove-aggregation-v113.js','/notice-poll-v115.js'];")
inject = '    if(!html.includes(\'/notice-poll-v115.js\'))html=html.replace(\'</body>\',\'<script src="/notice-poll-v115.js?v=final115-notice-poll"></script></body>\');\n'
if "html.includes('/notice-poll-v115.js')" not in s:
    anchor = "    if(!html.includes('/remove-aggregation-v113.js'))html=html.replace('</body>','<script src=\"/remove-aggregation-v113.js?v=final113\"></script></body>');\n"
    if anchor not in s:
        raise SystemExit('sw injection anchor not found')
    s = s.replace(anchor, anchor + inject, 1)
if "team-eysl-final115-notice-poll" not in s or "/notice-poll-v115.js" not in s:
    raise SystemExit('sw validation failed')
sw.write_text(s, encoding='utf-8')
print('v115 notice poll shell patch applied')
