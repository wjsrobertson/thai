#!/usr/bin/env python3
"""Audit data/decks.json for content problems. Run it after adding or editing cards:

    python3 -u tools/audit_decks.py            # errors, then the judgement calls
    python3 -u tools/audit_decks.py --errors   # errors only

Errors (exit status 1) are things that should always be fixed:
  structure (topic sizes, including word topics over 25 cards except Alphabet in Order, missing
  fields, split categories/groups), duplicate thai/english within
  a topic, Thai typing slips (ำ typed as ํ + า, doubled or misordered marks), stray whitespace or
  invisible characters, Thai script in `english` (the English voice reads it), odd translit
  characters, "a/b" slashes without spaces, and the same word with the same meaning glossed in
  different words (order, punctuation, plural), which splits it into separate cards.

"Worth a look" lists judgement calls that are often fine: one gloss broader than another (e.g. a
multi-sense Spoken Top-500 card beside a topic card), the same card with different notes per
topic, the same Thai transliterated differently, and notes with no final punctuation.
See docs/implementation-notes.md → Content → Writing cards.
"""
import json, re, sys, unicodedata
from collections import Counter, defaultdict
from pathlib import Path

DECKS_JSON = Path(__file__).resolve().parent.parent / 'data' / 'decks.json'
TRANSLIT_OK = re.compile(r"^[a-zà-ǿɔɛəʉ̀-ͯ .\-]+$")
THAI = re.compile(r'[฀-๿]')
# Known and intentional.
SAME_THAI_TRANSLIT_OK = {'เขา'}   # kháo (pronoun, as said) vs khǎo (horn, mountain)
# Word topics hold at most 25 cards (the user's rule, 2026-10-06: longer ones were split by sub-theme).
# The one exception, the user's call on 2026-10-09: Alphabet in Order, all 44 consonants ก to ฮ,
# where the unbroken order is the point. Reading stories' word lists aren't topics in this sense.
TOPIC_MAX = 25
# A story's word list holds each phrase it uses and, since 2026-10-10, the phrase's words too (the
# reader splits phrases into words), so a story full of idioms runs past 50.
STORY_MAX = 70
OVER_MAX_OK = {'script-consonants-all'}


def words(e, keep_parens=True):
    """Lower-case words, order-free, crude singular: for spotting rewordings."""
    if not keep_parens:
        e = re.sub(r'\(.*?\)', '', e)
    return sorted(w[:-1] if w.endswith('s') and len(w) > 3 else w for w in re.sub(r'[^a-z0-9 ]', ' ', e.lower()).split())


def audit(decks):
    errors, review = defaultdict(list), defaultdict(list)
    cards = [(dk, c) for dk in decks for c in dk['cards']]
    all_keys = {f"{c['thai']}::{c['english']}" for _, c in cards}

    # Structure
    for dk in decks:
        top = STORY_MAX if dk.get('category') == 'Reading' else 50
        if not 3 <= len(dk['cards']) <= top:
            errors[f'topic size outside 3–{top}'].append(f"{dk['name']}: {len(dk['cards'])}")
        if dk.get('category') != 'Reading' and len(dk['cards']) > TOPIC_MAX and dk['id'] not in OVER_MAX_OK:
            errors[f'word topic over {TOPIC_MAX} cards (split it by sub-theme)'].append(f"{dk['name']}: {len(dk['cards'])}")
        for k in ('id', 'category', 'name', 'description'):
            if not dk.get(k):
                errors['topic missing a field'].append(f"{dk.get('name')}: {k}")
    for label, key in (('duplicate topic id', 'id'), ('duplicate topic name', 'name')):
        errors[label] += [v for v, n in Counter(dk[key] for dk in decks).items() if n > 1]
    seen_cats, last = [], None
    for dk in decks:
        if dk['category'] != last:
            if dk['category'] in seen_cats:
                errors['category split in two places'].append(dk['category'])
            seen_cats.append(dk['category'])
            last = dk['category']
    for cat in seen_cats:
        groups, last = [], object()
        for dk in (x for x in decks if x['category'] == cat):
            g = dk.get('group')
            if g != last:
                if g and g in groups:
                    errors['group split within a category'].append(f'{cat} → {g}')
                groups.append(g)
                last = g

    # Each card
    for dk, c in cards:
        where = f"{dk['name']}: {c.get('thai')}"
        for k in ('thai', 'translit', 'english'):
            if not c.get(k):
                errors['card missing a field'].append(f'{where} ({k})')
        fields = {'thai', 'translit', 'english', 'note', 'say', 'partners', 'words'}
        if set(c) - fields:
            errors['unknown card field'].append(f'{where} {set(c) - fields}')
        # A phrase's words (2026-10-10): card keys that exist somewhere and spell the phrase.
        if 'words' in c:
            if ''.join(k.split('::')[0] for k in c['words']) != c['thai']:
                errors["phrase words that don't spell it"].append(where)
            missing = [k for k in c['words'] if k not in all_keys]
            if missing: errors['phrase word with no card'].append(f'{where}: {missing}')
        # Tone / Sound Pairs: partners are card keys (thai::english) of other cards in the same topic.
        if 'partners' in c:
            own = {f"{x['thai']}::{x['english']}" for x in dk['cards']}
            ps = c['partners']
            if not isinstance(ps, list) or not ps or any(p not in own for p in ps) or f"{c['thai']}::{c['english']}" in ps:
                errors['bad partners'].append(f'{where} {ps}')
        for k, v in c.items():
            if not isinstance(v, str):
                continue
            if v != v.strip():
                errors['leading/trailing space'].append(f'{where} [{k}]')
            if '  ' in v:
                errors['double space'].append(f'{where} [{k}]')
            if re.search(r'[​-‍﻿ ]', v):
                errors['invisible character'].append(f'{where} [{k}]')
            if unicodedata.normalize('NFC', v) != v:
                errors['not NFC-normalised'].append(f'{where} [{k}]')
        t, tr, e, n = c.get('thai', ''), c.get('translit', ''), c.get('english', ''), c.get('note', '')
        if 'ํา' in t:
            errors['ำ typed as ํ + า'].append(where)
        if re.search(r'[่-๋]{2}', t):
            errors['two tone marks in a row'].append(where)
        if re.search(r'[่-๋][ัิ-ื]', t):
            errors['tone mark typed before an upper vowel'].append(where)
        if re.search(r'([เแโใไ])\1', t):
            errors['doubled leading vowel'].append(where)
        if THAI.search(e):
            errors['Thai script in english (move it to the note)'].append(f'{where}: {e}')
        if tr and not TRANSLIT_OK.match(tr):
            errors['odd translit characters'].append(f'{where}: {tr!r}')
        if re.search(r'--|^-|-$|- | -', tr):
            errors['translit hyphen glitch'].append(f'{where}: {tr!r}')
        if re.search(r'\S/\S', e) and not re.search(r'\d/\d|\b[a-z]{2,3}/[a-z]{2,3}\b|w/', e):
            errors['"a/b" without spaces (write "a / b")'].append(f'{where}: {e!r}')
        if n and not re.search(r'[.!?)…"”]$', n):
            review['note without final punctuation'].append(f'{where}: …{n[-30:]!r}')

    # Reading passages (a topic's `passage`, 2026-10-08): lines of {th, en}. In th, | marks a word
    # break and a space is a real space; a trailing ':' (a speaker's label) is punctuation. Every
    # Thai word must be a card in the topic, for the reader's look-up.
    for dk in decks:
        if 'passage' not in dk:
            continue
        own = {c['thai'] for c in dk['cards']}
        lines = dk['passage']
        if not isinstance(lines, list) or not lines:
            errors['bad passage'].append(dk['name'])
            continue
        for line in lines:
            if not isinstance(line, dict) or set(line) != {'th', 'en'} or not line['th'] or not line['en']:
                errors['bad passage line'].append(f"{dk['name']}: {line!r}")
                continue
            if re.search(r'\|\||^\||\|$|\| | \||  ', line['th']):
                errors['passage word-break glitch'].append(f"{dk['name']}: {line['th']}")
            for chunk in line['th'].split(' '):
                for t in chunk.split('|'):
                    w = t.rstrip(':').replace('_', ' ')  # _ is a space inside a word (จริง_ๆ)
                    if THAI.search(w) and w not in own:
                        errors['passage word with no card in its topic'].append(f"{dk['name']}: {w}")

    # Within a topic
    for dk in decks:
        for k in ('thai', 'english'):
            errors[f'duplicate {k} within a topic'] += [
                f"{dk['name']}: {v!r}" for v, n in Counter(c[k] for c in dk['cards']).items() if n > 1]

    # Across topics
    by_thai = defaultdict(lambda: defaultdict(list))
    translits = defaultdict(lambda: defaultdict(list))
    notes = defaultdict(set)
    for dk, c in cards:
        by_thai[c['thai']][c['english']].append(dk['name'])
        translits[c['thai']][c['translit']].append(dk['name'])
        notes[(c['thai'], c['english'])].add(c.get('note', ''))
    for t, glosses in by_thai.items():
        gs = sorted(glosses)
        for i, a in enumerate(gs):
            for b in gs[i + 1:]:
                pair = f'{t}: {a!r} ({glosses[a][0]}) vs {b!r} ({glosses[b][0]})'
                if words(a) == words(b):
                    errors['same meaning, worded differently (one card split in two)'].append(pair)
                else:
                    wa, wb = set(words(a, False)), set(words(b, False))
                    if wa and wb and (wa <= wb or wb <= wa):
                        review['one gloss broader than the other'].append(pair)
    for t, trs in translits.items():
        if len(trs) > 1 and t not in SAME_THAI_TRANSLIT_OK:
            review['same Thai, different translit'].append(f'{t}: ' + ' | '.join(f'{k} ({v[0]})' for k, v in trs.items()))
    review['same card, different notes per topic'] += [f'{k[0]} = {k[1]}' for k, v in notes.items() if len(v) > 1]
    return cards, errors, review


def show(title, found, limit):
    found = {k: v for k, v in found.items() if v}
    print(f'\n{title}: {sum(len(v) for v in found.values())}')
    for k, v in found.items():
        print(f'  {k}: {len(v)}')
        for line in v[:limit]:
            print(f'    {line}')
        if len(v) > limit:
            print(f'    … {len(v) - limit} more')


def main():
    decks = json.loads(DECKS_JSON.read_text())['decks']
    cards, errors, review = audit(decks)
    print(f"{len(decks)} topics, {len(cards)} cards, {len({(c['thai'], c['english']) for _, c in cards})} distinct")
    show('Errors', errors, 20)
    if '--errors' not in sys.argv:
        show('Worth a look', review, 8)
    sys.exit(1 if any(errors.values()) else 0)


if __name__ == '__main__':
    main()
