import pathlib, sys

root = pathlib.Path(r'C:\\Users\\forco\\Desktop\\DarogaDesk\\DarogaDesk')
extensions = {'.py', '.md', '.html', '.js', '.css', '.yaml', '.json'}
for path in root.rglob('*'):
    if path.is_file() and path.suffix.lower() in extensions:
        try:
            text = path.read_text(encoding='utf-8')
        except Exception as e:
            print(f'Error reading {path}: {e}', file=sys.stderr)
            continue
        if 'DarogaDesk' in text:
            new_text = text.replace('DarogaDesk', 'DarogaDesk')
            try:
                path.write_text(new_text, encoding='utf-8')
                print(f'Updated {path}')
            except Exception as e:
                print(f'Error writing {path}: {e}', file=sys.stderr)
