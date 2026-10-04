"""Pull Thai slang/vulgar/colloquial entries from Wiktionary with definitions + usage labels."""
import json, re, time, urllib.request, urllib.parse, urllib.error
from collections import defaultdict

CATS = ['Thai slang', 'Thai colloquialisms', 'Thai derogatory terms', 'Thai humorous terms',
        'Thai interjections', 'Thai offensive terms', 'Thai vulgarities', 'Thai informal terms',
        'Thai particles', 'Thai internet slang', 'Thai ethnic slurs', 'Thai internet laughter slang',
        'Thai fandom slang', 'Thai euphemisms', 'Thai text messaging slang', 'Thai interjection forms',
        'Thai particle forms', 'Thai interrogative particles']

def api(**p):
    # Wikimedia rate-limits anonymous API use: stay serial and slow, back off hard on 429.
    p.update(format='json', action='query', maxlag=5)
    req = urllib.request.Request('https://en.wiktionary.org/w/api.php?' + urllib.parse.urlencode(p),
                                 headers={'User-Agent': 'learnthai-personal/0.1 (single-user vocab research; serial requests)'})
    for attempt in range(6):
        time.sleep(1.5)
        try:
            return json.load(urllib.request.urlopen(req, timeout=60))
        except urllib.error.HTTPError as e:
            wait = 60 * (attempt + 1) if e.code == 429 else 5 * (attempt + 1)
            print(f'[HTTP {e.code}; waiting {wait}s]', flush=True)
            time.sleep(wait)
        except Exception as e:
            print(f'[{type(e).__name__}; retrying]', flush=True)
            time.sleep(5 * (attempt + 1))
    raise RuntimeError(p)

members = defaultdict(set)
for cat in CATS:
    cont = {}
    while True:
        r = api(list='categorymembers', cmtitle='Category:' + cat, cmlimit=500, cmnamespace=0, **cont)
        for m in r['query']['categorymembers']:
            members[m['title']].add(cat.removeprefix('Thai '))
        if 'continue' not in r: break
        cont = r['continue']
print(len(members), 'unique entries')

def clean(s):
    labels = []
    def lb(m):
        parts = [p for p in m.group(1).split('|')[2:] if '=' not in p and p not in ('_', 'and', 'or')]
        labels.extend(parts); return ''
    s = re.sub(r'\{\{(?:lb|lbl|label)\|([^{}]*)\}\}', lb, s)
    # {{tpl|...|text}} -> keep the most text-like positional arg, repeatedly for nesting
    def tpl(m):
        parts = [p for p in m.group(1).split('|')[1:] if '=' not in p]
        name = m.group(1).split('|')[0]
        if name in ('gloss', 'gl', 'q', 'qualifier', 'i', 'n-g', 'ng', 'non-gloss', 'sense', 's'):
            return '(' + ', '.join(parts) + ')'
        if name in ('l', 'm', 'll', 'w', 'lang', 'taxlink', 'vern'):
            return parts[-1] if len(parts) >= 2 else (parts[0] if parts else '')
        if parts:
            return parts[-1]
        return ''
    for _ in range(4):
        s = re.sub(r'\{\{([^{}]*)\}\}', tpl, s)
    s = re.sub(r'\[\[(?:[^\]|]*\|)?([^\]]*)\]\]', r'\1', s)
    s = re.sub(r"'''?|<[^>]+>", '', s)
    return re.sub(r'\s+', ' ', s).strip(' ;:'), labels

entries = []
titles = sorted(members)
for i in range(0, len(titles), 50):
    batch = titles[i:i + 50]
    r = api(prop='revisions', rvprop='content', rvslots='main', titles='|'.join(batch))
    for page in r['query']['pages'].values():
        text = page.get('revisions', [{}])[0].get('slots', {}).get('main', {}).get('*', '')
        m = re.search(r'^==Thai==\s*$(.*?)(?=^==[^=]|\Z)', text, re.S | re.M)
        sec = m.group(1) if m else ''
        defs, labels, pos = [], [], None
        for line in sec.splitlines():
            h = re.match(r'^===+\s*([^=]+?)\s*===+', line)
            if h: pos = h.group(1)
            if re.match(r'^#(?![:*])', line):
                d, lab = clean(line.lstrip('# '))
                if d or lab:
                    defs.append({'pos': pos, 'labels': lab, 'def': d}); labels += lab
        entries.append({'thai': page['title'], 'cats': sorted(members[page['title']]),
                        'labels': sorted(set(labels)), 'defs': defs, 'src': 'wiktionary'})
    print(f'{min(i + 50, len(titles))}/{len(titles)}', end=' ', flush=True)
json.dump(entries, open('wiktionary.json', 'w'), ensure_ascii=False, indent=1)
print('\nwrote', len(entries), 'entries;', sum(1 for e in entries if e['defs']), 'with definitions')
