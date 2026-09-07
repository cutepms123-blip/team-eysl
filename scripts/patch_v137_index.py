from pathlib import Path
# v140: legacy one-shot attendance patch is intentionally disabled.
# Runtime/navigation changes must be committed explicitly instead of mutating index.html from a workflow.
p=Path('index.html')
assert p.exists()
print('v140 legacy index patch disabled; no changes applied')
