from pathlib import Path
p=Path('index.html')
s=p.read_text()
s=s.replace("/sw.js?v=final137-direct-runtime","/sw.js?v=final138-db-direct")
s=s.replace('<script src="/attendance-direct-v137.js?v=final137-direct-runtime"></script>','<script src="/attendance-direct-v138.js?v=final138-db-direct"></script>')
if 'attendance-direct-v138.js' not in s:
    s=s.replace('</body>','<script src="/attendance-direct-v138.js?v=final138-db-direct"></script>\n</body>')
p.write_text(s)
# v138 delivery trigger
