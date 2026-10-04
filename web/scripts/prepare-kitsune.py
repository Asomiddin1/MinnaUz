"""Convert the supplied Kitsune PNG archive to transparent, web-sized assets.
Usage: python3 scripts/prepare-kitsune.py /path/to/kitsune_png_toplam.zip
Requires Pillow. Originals remain in the supplied archive.
"""
from pathlib import Path
from PIL import Image
import hashlib
import io
import json
import sys
import zipfile

root = Path(__file__).resolve().parents[1] / 'public' / 'kitsune'
groups = {'pozalar': 'poses', 'mimikalar': 'expressions', 'darajalar': 'levels'}
manifest = []
seen = {}
with zipfile.ZipFile(sys.argv[1]) as archive:
    for name in sorted(archive.namelist(), key=lambda n: (not n.startswith('pozalar/'), n)):
        if not name.endswith('.png'):
            continue
        data = archive.read(name)
        digest = hashlib.sha256(data).hexdigest()
        group, filename = name.split('/')
        target = f'{groups[group]}/{Path(filename).stem}'
        if digest in seen:
            manifest.append({'source': name, 'sha256': digest, 'alias': seen[digest]})
            continue
        seen[digest] = target
        original = Image.open(io.BytesIO(data)).convert('RGBA')
        sizes = [512, 768] if filename == 'P01_salom.png' else [512]
        outputs = []
        for size in sizes:
            # Keep the full canvas and transparent edges; do not crop the character.
            image = original.resize((size, size), Image.Resampling.LANCZOS)
            path = root / f'{target}{"-hero" if size == 768 else ""}.webp'
            path.parent.mkdir(parents=True, exist_ok=True)
            image.save(path, 'WEBP', quality=85, method=6)
            outputs.append({'path': '/kitsune/' + str(path.relative_to(root)), 'width': size, 'height': size, 'bytes': path.stat().st_size})
        manifest.append({'source': name, 'sha256': digest, 'outputs': outputs})
(root / 'sources.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
print(f'{len(seen)} unique images; {sum(p.stat().st_size for p in root.rglob("*.webp")):,} bytes total')
