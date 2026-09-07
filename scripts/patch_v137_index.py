from pathlib import Path
p=Path('index.html')
s=p.read_text()
s=s.replace("navigator.serviceWorker.register('/sw.js?v=final121-notice-deadline-layout')","navigator.serviceWorker.register('/sw.js?v=final137-direct-runtime',{scope:'/',updateViaCache:'none'})")
needle='</body>'
tag='<script src="/attendance-direct-v137.js?v=final137-direct-runtime"></script>\n'
if 'attendance-direct-v137.js' not in s:
    s=s.replace(needle,tag+needle)
p.write_text(s)
