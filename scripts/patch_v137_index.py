from pathlib import Path
from urllib.request import urlopen
url='https://raw.githubusercontent.com/cutepms123-blip/team-eysl/4336a6afa056e8939e87a653cce0f90992512c7a/index.html'
with urlopen(url, timeout=30) as r:
    old=r.read().decode('utf-8')
old=old.replace("navigator.serviceWorker.register('/sw.js?v=final121-notice-deadline-layout')", "navigator.serviceWorker.register('/sw.js?v=final140-lean-runtime',{scope:'/',updateViaCache:'none'})")
Path('index.html').write_text(old)
print('restored immutable known-good index and activated final140 lean runtime')
