"""Package only project sources, documentation and the verified local build."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
from hashlib import sha256
import subprocess

root = Path(__file__).resolve().parent.parent
output = root / 'release'
output.mkdir(exist_ok=True)
archive = output / 'NETVERSE-projeto-completo.zip'
if not (root / 'dist/index.html').is_file():
    raise SystemExit('Execute npm run build antes de empacotar.')
folders = ['src', 'public', 'docs', 'e2e', 'scripts', 'dist']
try:
    tracked = set(subprocess.check_output(
        ['git', 'ls-files', '-z'], cwd=root,
    ).decode('utf-8').split('\0')) if (root / '.git').exists() else None
except (FileNotFoundError, subprocess.CalledProcessError):
    tracked = None

def belongs_to_project(file):
    relative = file.relative_to(root)
    return relative.parts[0] == 'dist' or tracked is None or relative.as_posix() in tracked

files = [p for p in root.iterdir() if p.is_file() and (
    p.suffix in {'.md', '.json', '.ts', '.js', '.html', '.bat', '.txt', '.code-workspace'}
    or p.name in {'.gitignore', '.gitattributes', '.nvmrc'}
)]
for folder in folders:
    files.extend(p for p in (root / folder).rglob('*') if p.is_file() and '__pycache__' not in p.parts)
files = [p for p in files if belongs_to_project(p)]
with ZipFile(archive, 'w', ZIP_DEFLATED, compresslevel=9) as z:
    for file in sorted(set(files)):
        z.write(file, 'NETVERSE/' + file.relative_to(root).as_posix())
digest = sha256(archive.read_bytes()).hexdigest()
(output / 'SHA256.txt').write_text(f'{digest}  {archive.name}\n', encoding='utf-8')
with ZipFile(archive) as z:
    assert z.testzip() is None
    assert 'NETVERSE/dist/index.html' in z.namelist()
    assert not any('/node_modules/' in n or '/.git/' in n or '/.env' in n for n in z.namelist())
    print(f'{archive}\n{len(z.namelist())} arquivos; {archive.stat().st_size:,} bytes\nSHA256 {digest}')
