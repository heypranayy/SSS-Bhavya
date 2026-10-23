import os
import re

img_pattern = re.compile(r'[\'"](/(?:images|uploads)/[^\'"\s>]+)[\'"]')
found_paths = set()

for root, dirs, files in os.walk('src'):
    for f in files:
        if f.endswith(('.tsx', '.ts', '.js', '.json', '.css')):
            path = os.path.join(root, f)
            try:
                with open(path, 'r', encoding='utf-8') as fh:
                    content = fh.read()
                    for match in img_pattern.findall(content):
                        found_paths.add(match)
            except Exception:
                pass

missing = []
for p in sorted(found_paths):
    clean_p = p.split('?')[0].split('#')[0]
    local_fs = os.path.join('public', clean_p.lstrip('/'))
    if not os.path.exists(local_fs):
        missing.append((clean_p, local_fs))

print(f"Total unique static asset paths found in src: {len(found_paths)}")
print(f"Missing static asset files: {len(missing)}")
for m, l in missing:
    print(f"  MISSING: {m}")
