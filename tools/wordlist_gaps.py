"""Which common Thai words have no card: the cards against open frequency lists, and those missing
checked against the Royal Institute dictionary. The user asked how to measure word coverage, knowing
a dictionary lacks our slang (2026-11-08): so it only counts how many of a list's words we have, and
slang and phrases we hold beyond a list can't lower the score.

Lists aren't in the repo; fetch them into a folder (DIR), outside it:
    PyThaiNLP (CC0): words_th.txt, tnc_freq.txt, ttc_freq.txt from
        https://raw.githubusercontent.com/PyThaiNLP/pythainlp/dev/pythainlp/corpus/
    FrequencyWords (subtitles): th_50k.txt, renamed from
        https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/th/th_50k.txt

    python3 -u tools/wordlist_gaps.py report DIR   # coverage by rank; writes DIR/missing.json
    python3 -u tools/wordlist_gaps.py lookup DIR   # each missing word in the dictionary, one every
                                                   # half second, resumable: DIR/ri.jsonl

A list's top words include names and fragments (ศรี, จอห์น), and the dictionary lists plenty that are
royal, legal or old (and not เมื่อวาน), so its results are for choosing from by hand, not a verdict.
"""
import html
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request

import decks_io

THAI = re.compile(r'^[ก-๛]+$')
# How far down each list counts as common: National Corpus, Textbook Corpus, subtitles.
LIMITS = {'tnc_freq.txt': ('\t', 6000), 'ttc_freq.txt': ('\t', 6000), 'th_50k.txt': (' ', 1500)}
LOOKUP = 'https://dictionary.orst.go.th/func_lookup.php'


def card_words():
    return {c['thai'].replace(' ', '') for t in decks_io.load()['decks'] for c in t['cards']}


def ranks(path, sep, only=None):
    out = {}
    for line in open(path, encoding='utf8', errors='replace'):
        p = line.rstrip('\n').split(sep)
        if len(p) >= 2 and THAI.match(p[0]) and p[1].isdigit() and (only is None or p[0] in only):
            out.setdefault(p[0], len(out) + 1)
    return out


def report(folder):
    cards = card_words()
    words = {w.strip() for w in open(f'{folder}/words_th.txt', encoding='utf8') if w.strip()}
    missing = {}
    for name, (sep, limit) in LIMITS.items():
        # The subtitle list is split on spaces, so only its dictionary words are words at all.
        rank = ranks(f'{folder}/{name}', sep, words if name == 'th_50k.txt' else None)
        top = sorted(rank, key=rank.get)
        print(name, len(top), 'words')
        for n in (500, 1000, 2000, 5000, 10000):
            if n <= len(top):
                print(f'  top {n:6d}: {100 * sum(w in cards for w in top[:n]) / n:5.1f}%')
        for w in top[:limit]:
            if w not in cards and w in words and len(w) > 2:
                missing[w] = min(missing.get(w, 1), rank[w] / limit)
    out = sorted(missing, key=missing.get)
    json.dump(out, open(f'{folder}/missing.json', 'w', encoding='utf8'), ensure_ascii=False, indent=0)
    print(len(out), 'missing, most common first:', ' '.join(out[:60]))


def lookup(folder):
    words = json.load(open(f'{folder}/missing.json', encoding='utf8'))
    path = f'{folder}/ri.jsonl'
    done = {json.loads(l)['w'] for l in open(path, encoding='utf8')} if os.path.exists(path) else set()
    todo = [w for w in words if w not in done]
    print(len(words), 'words,', len(todo), 'to do', flush=True)
    with open(path, 'a', encoding='utf8') as f:
        for i, w in enumerate(todo):
            data = urllib.parse.urlencode({'word': w, 'funcName': 'lookupWord', 'status': 'lookup'}).encode()
            req = urllib.request.Request(LOOKUP, data=data, headers={'User-Agent': 'Mozilla/5.0 (word-list check)'})
            page = urllib.request.urlopen(req, timeout=30).read().decode('utf8', 'replace')
            text = html.unescape(re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', page))).strip()
            found = 'ไม่พบคำศัพท์' not in text
            f.write(json.dumps({'w': w, 'found': found, 'text': text[:320] if found else ''}, ensure_ascii=False) + '\n')
            f.flush()
            if (i + 1) % 100 == 0:
                print(i + 1, 'done', flush=True)
            time.sleep(0.5)


if __name__ == '__main__':
    {'report': report, 'lookup': lookup}[sys.argv[1]](sys.argv[2])
