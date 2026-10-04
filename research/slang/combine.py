"""Merge all slang sources into one lexicon keyed by Thai spelling.

Inputs: wiktionary.json (from wikt.py) + web_*.txt ("thai | translit | meaning | note", '#' lines
name the source). Output: lexicon.json and lexicon.tsv, one entry per Thai form with its register,
glosses and sources. Web transliterations are kept for reference only — they're inconsistent and
sometimes wrong, so cards get fresh ones.
"""
import json, re
from collections import defaultdict
from pathlib import Path

HERE = Path(__file__).parent
THAI = re.compile(r'[ก-๛]')

OFFENSIVE = ('vulgar', 'offensive', 'derogatory', 'slur', 'pejorative', 'profan', 'insult', 'swear')
SLANG = ('slang', 'internet', 'fandom', 'text messaging', 'teen', 'gen z', 'gen y', 'gen alpha', 'ศัพท์เทย', 'humorous')
COLLOQ = ('colloquial', 'informal', 'particle', 'interjection', 'casual', 'intimate', 'std:')

def register(tags):
    t = ' '.join(tags).lower()
    if any(k in t for k in OFFENSIVE): return 'offensive'
    if any(k in t for k in SLANG): return 'slang'
    if any(k in t for k in COLLOQ): return 'colloquial'
    return 'slang'

def norm(thai):
    # "...ใกล้ฉัน" -> "ใกล้ฉัน"; collapse spaces. Keep ๆ and internal ... (patterns like ยิ่ง...ยิ่ง).
    thai = thai.strip().strip('.?!').strip()
    return re.sub(r'\s+', ' ', thai)

lex = defaultdict(lambda: {'thai': None, 'glosses': [], 'translits': set(), 'tags': set(), 'sources': set()})

def add(thai, gloss, translit, tags, source):
    thai = norm(thai)
    if not THAI.search(thai): return
    e = lex[thai]; e['thai'] = thai
    if gloss and gloss not in e['glosses']: e['glosses'].append(gloss)
    if translit: e['translits'].add(translit)
    e['tags'].update(t for t in tags if t); e['sources'].add(source)

# Wiktionary
wikt = HERE / 'wiktionary.json'
if wikt.exists():
    for w in json.load(open(wikt)):
        tags = list(w['cats']) + list(w['labels'])
        glosses = [d['def'] for d in w['defs'] if d['def']][:3]
        add(w['thai'], '; '.join(glosses), None, tags, 'wiktionary')

# Web lists
for f in sorted(HERE.glob('web_*.txt')):
    source = f.stem
    for line in open(f):
        line = line.rstrip('\n')
        if line.startswith('# source:'):
            source = line.split(':', 1)[1].strip().split(' ')[0]; continue
        if not line.strip() or line.startswith('#'): continue
        parts = [p.strip() for p in line.split('|')] + ['', '', '']
        thai, translit, meaning, note = parts[:4]
        add(thai, meaning, translit or None, [note, f.stem], source)

out = []
for e in lex.values():
    out.append({'thai': e['thai'], 'register': register(e['tags']), 'glosses': e['glosses'],
                'translits': sorted(e['translits']), 'tags': sorted(e['tags']), 'sources': sorted(e['sources'])})
out.sort(key=lambda e: (e['register'], e['thai']))
json.dump(out, open(HERE / 'lexicon.json', 'w'), ensure_ascii=False, indent=1)
with open(HERE / 'lexicon.tsv', 'w') as f:
    for e in out:
        f.write('\t'.join([e['thai'], e['register'], ' / '.join(e['glosses'])[:200], ','.join(e['sources'])]) + '\n')

from collections import Counter
print(len(out), 'entries;', dict(Counter(e['register'] for e in out)))
print('multi-source entries:', sum(1 for e in out if len(e['sources']) > 1))
