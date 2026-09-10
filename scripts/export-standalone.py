"""After npm run build, bundle the website and all its assets into one offline HTML file.
Usage: python scripts/export-standalone.py [output.html]
No Python dependencies are needed.
"""
from pathlib import Path
import base64
import mimetypes
import re
import sys

root = Path(__file__).resolve().parents[1]
build = root / 'dist'
html = (build / 'index.html').read_text()

def inline_script(match):
    path = build / match.group(1).lstrip('/')
    script = path.read_text().replace('</script', '<\\/script')
    return '<script type="module">' + script + '</script>'

def inline_style(match):
    path = build / match.group(1).lstrip('/')
    return '<style>' + path.read_text() + '</style>'

html = re.sub(r'<script\b[^>]*src="([^"]+)"[^>]*></script>', inline_script, html)
html = re.sub(r'<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>', inline_style, html)
for asset in (root / 'public').rglob('*'):
    if not asset.is_file() or asset.suffix.lower() == '.txt':
        continue
    url = '/' + asset.relative_to(root / 'public').as_posix()
    if url not in html:
        continue
    mime = mimetypes.guess_type(asset.name)[0] or 'application/octet-stream'
    data = base64.b64encode(asset.read_bytes()).decode()
    html = html.replace(url, f'data:{mime};base64,{data}')
output = Path(sys.argv[1]) if len(sys.argv) > 1 else root.parent / 'Rishabh-Portfolio.html'
output.write_text(html)
print(f'Created {output} ({output.stat().st_size / 1024 / 1024:.2f} MB)')
