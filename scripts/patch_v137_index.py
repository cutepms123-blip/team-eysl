from pathlib import Path
import subprocess
# Restore the last known-good full index, then only bump the service-worker URL.
old = subprocess.check_output(['git','show','4336a6afa056e8939e87a653cce0f90992512c7a:index.html'], text=True)
old = old.replace("navigator.serviceWorker.register('/sw.js?v=final121-notice-deadline-layout')", "navigator.serviceWorker.register('/sw.js?v=final140-lean-runtime',{scope:'/',updateViaCache:'none'})")
Path('index.html').write_text(old)
print('restored known-good index and activated final140 lean runtime')
