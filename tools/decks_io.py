"""Read and write data/decks.json in its hand-written layout: one topic key per line, one card per
line. dump(load()) reproduces the file byte for byte, so a tool that changes a few cards leaves a
small diff."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DECKS = ROOT / 'data' / 'decks.json'


def load(path=DECKS):
    return json.loads(Path(path).read_text())


def dump(data):
    j = lambda v: json.dumps(v, ensure_ascii=False)
    out = ['{', '  "decks": [']
    for di, d in enumerate(data['decks']):
        out.append('    {')
        for k in [k for k in d if k != 'cards']:
            out.append(f'      {j(k)}: {j(d[k])},')
        out.append('      "cards": [')
        for ci, c in enumerate(d['cards']):
            body = ', '.join(f'{j(k)}: {j(v)}' for k, v in c.items())
            out.append(f'        {{ {body} }}' + (',' if ci < len(d['cards']) - 1 else ''))
        out.append('      ]')
        out.append('    }' + (',' if di < len(data['decks']) - 1 else ''))
    out += ['  ]', '}']
    return '\n'.join(out) + '\n'


def save(data, path=DECKS):
    Path(path).write_text(dump(data))


def key(card):
    """A card's key, as app.js's cardKey: thai::english."""
    return f"{card['thai']}::{card['english']}"


def is_story(topic):
    return bool(topic.get('passage'))
