# Reads a consistent SQLite snapshot without modifying the source database.
import json, pathlib, sqlite3, sys
source = pathlib.Path(sys.argv[1]).resolve()
if not source.is_file():
    raise SystemExit('SQLite dosyası bulunamadı.')
with sqlite3.connect(source.as_uri() + '?mode=ro', uri=True) as db:
    db.row_factory = sqlite3.Row
    db.execute('BEGIN')
    snapshot = {'runs': [dict(r) for r in db.execute('SELECT * FROM run')],
                'answers': [dict(r) for r in db.execute('SELECT * FROM answer')]}
    print(json.dumps(snapshot, ensure_ascii=True))
