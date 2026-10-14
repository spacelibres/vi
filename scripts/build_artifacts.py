from pathlib import Path
import zipfile,json
root=Path('.');version=json.loads((root/'package.json').read_text(encoding='utf-8'))['version'];out=root/'artifacts';out.mkdir(exist_ok=True)
svgs=[p for p in root.rglob('*.svg') if not any(x in p.parts for x in ['node_modules','.git','artifacts'])]
with zipfile.ZipFile(root/'spacelibre-svg-assets.zip','w',zipfile.ZIP_DEFLATED) as z:
 for p in sorted(svgs):z.write(p,p.as_posix())
if (root/'08-motion').exists():
 with zipfile.ZipFile(root/'spacelibre-motion-source.zip','w',zipfile.ZIP_DEFLATED) as z:
  motion=[p for p in (root/'08-motion').rglob('*') if p.is_file()]
  dependencies=[root/'skills/spacelibre-vi/assets/theme-engine.js',root/'icons/favicon.svg']
  for p in sorted(motion+dependencies):z.write(p,'spacelibre-motion/'+p.as_posix())
with zipfile.ZipFile(out/f'spacelibre-vi-{version}.zip','w',zipfile.ZIP_DEFLATED) as z:
 for p in sorted(root.rglob('*')):
  if p.is_file() and not any(x in p.parts for x in ['node_modules','.git','artifacts']):z.write(p,'spacelibre-vi/'+p.as_posix())
print(f'Built reproducible source package v{version} and {len(svgs)} SVG assets')
