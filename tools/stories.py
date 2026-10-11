"""Reading stories: check them, keep their cards in step with the topics, add new ones, and report
how well they cover the topics' words.

    python3 -u tools/stories.py check               # every story's passage and cards are consistent
    python3 -u tools/stories.py sync [--dry-run]    # story cards = their topic cards, after topic edits
    python3 -u tools/stories.py add FILE [--dry-run]  # add or replace stories from a JSON file
    python3 -u tools/stories.py coverage [--list N] # topic words in stories; topics with few stories
    python3 -u tools/stories.py show ID             # a story's lines and the cards its words use
    python3 -u tools/stories.py export ID [ID…]     # stories as `add` source (to edit, then add back)

data/decks.json is the source of truth: a story is a topic with a `passage` (category Reading,
group Little Stories, Easy, Medium or Harder). Each passage line's `th` has its words split with |
(spaces separate runs of words; a word ending in : is a speaker label; _ is a space inside a word).
Every Thai word is a card in the story's `cards`, copied from a topic card (without `partners`);
digits and symbols need none. A phrase card (with `words`, e.g. โทรศัพท์โดนวิ่งราว) is split into its
words in the passage, and the story keeps the phrase card as well as each word's card. Which sense a
word takes (ร้อง "to sing" or "to call (an animal)") is simply the card the story holds.

Until 2026-10-11 stories were built from source modules by a script in a session scratchpad, which
was lost; this replaced it, working on decks.json alone. See docs/implementation-notes.md → Stories.

A file for `add` is a JSON list of stories:
    [{"id": "rs-the-lost-cat", "group": "Easy", "name": "The Lost Cat",
      "description": "One line for the story list.",
      "lines": [["แมว|ของ|ฉัน|หาย", "My cat is lost."], ...],
      "picks": {"ร้อง": "to call, cry (any animal)"}}]
A word with several cards takes the one in `picks`, or else the sense other stories use most (it
says which, so you can pin another); Thai Script spelling examples only when there's nothing else.
A word with no card is an error: add the card to a topic first (every story word has a topic card).
A new story goes at the end of its group; one with an existing id replaces it in place. To change a
story, `export` it (its phrases joined up again and every word's sense pinned in `picks`), edit the
lines, and `add` the file: what you didn't touch comes back as it was.
"""
import json
import re
import sys
from collections import Counter, defaultdict

import decks_io
from decks_io import key, is_story

GROUPS = ['Little Stories', 'Easy', 'Medium', 'Harder']
STORY_MIN, STORY_MAX = 3, 90  # as tools/audit_decks.py
# As app.js's storiesFor: a topic's stories share at least 2 of its words, not counting these.
READING_MIN_MATCH = 2
READING_COMMON = set(('ไป มา มี เป็น อยู่ ได้ ให้ ทำ ของ ที่ ไม่ ใน กับ และ แต่ แล้ว จะ ก็ นะ ครับ ค่ะ คะ จ้ะ '
                      'ฉัน ผม เรา เขา คุณ นี่ นี้ คือ ว่า มาก ดี ไหม เลย ยัง ด้วย กัน ตอน').split())
TOPIC_MIN_STORIES = 5
THAI = re.compile(r'[ก-๛]')


def words_of(th):
    """A passage line's words: (as written, as looked up)."""
    for run in th.split(' '):
        for tok in run.split('|'):
            w = (tok[:-1] if tok.endswith(':') else tok).replace('_', ' ')
            if w:
                yield tok, w


def story_copy(card):
    return {k: v for k, v in card.items() if k != 'partners'}


class Index:
    """The topic cards, and how stories use them."""

    def __init__(self, data):
        self.decks = data['decks']
        self.by_thai = defaultdict(list)   # thai -> [(topic, card)], in decks order
        self.by_key = defaultdict(list)    # key -> [(topic, card)]
        for t in self.decks:
            if is_story(t):
                continue
            for c in t['cards']:
                self.by_thai[c['thai']].append((t, c))
                self.by_key[key(c)].append((t, c))
        self.uses = Counter()              # key -> stories using it
        self.copies = defaultdict(Counter)  # key -> Counter of story copies (as JSON)
        for t in self.decks:
            if not is_story(t):
                continue
            for c in t['cards']:
                self.uses[key(c)] += 1
                self.copies[key(c)][json.dumps(c, ensure_ascii=False, sort_keys=True)] += 1

    def copy_for(self, k):
        """The story copy of the card with key k: the copy stories use most, else the first topic's
        (outside Thai Script if it can)."""
        options = [story_copy(c) for _, c in self.by_key[k]]
        if not options:
            return None
        seen = self.copies.get(k)
        if seen:
            for js, _ in seen.most_common():
                c = json.loads(js)
                if c in options:
                    return next(o for o in options if o == c)
        main = [story_copy(c) for t, c in self.by_key[k] if t['category'] != 'Thai Script']
        return (main or options)[0]

    def senses(self, thai):
        """The distinct cards for a word, best first: not Thai Script if there's another, then the
        sense stories use most, then decks order."""
        keys = list(dict.fromkeys(key(c) for _, c in self.by_thai.get(thai, [])))
        main = [k for k in keys if any(t['category'] != 'Thai Script' for t, _ in self.by_key[k])]
        keys = main or keys
        return sorted(keys, key=lambda k: (-self.uses[k], keys.index(k)))


def check(data, quiet=False):
    """Problems with the stories, as a list of strings."""
    ix = Index(data)
    problems = []
    for t in data['decks']:
        if not is_story(t):
            continue
        sid = t['id']
        if t.get('category') != 'Reading' or t.get('group') not in GROUPS:
            problems.append(f'{sid}: category/group should be Reading / one of {GROUPS}')
        own = {}
        for c in t['cards']:
            if c['thai'] in own:
                problems.append(f'{sid}: two cards for {c["thai"]}')
            own[c['thai']] = c
            options = [story_copy(x) for _, x in ix.by_key.get(key(c), [])]
            if not options:
                problems.append(f'{sid}: {key(c)} is in no topic')
            elif c not in options:
                problems.append(f'{sid}: {key(c)} differs from its topic card (run sync)')
        used = set()
        for line in t['passage']:
            for _, w in words_of(line['th']):
                if not THAI.search(w):
                    continue
                used.add(w)
                if w not in own:
                    problems.append(f'{sid}: "{w}" has no card')
        for c in t['cards']:
            pieces = [k.split('::', 1)[0] for k in c.get('words', [])]
            if c['thai'] not in used and not (len(pieces) > 1 and all(p in used for p in pieces)):
                problems.append(f'{sid}: card {c["thai"]} isn\'t in the passage')
        if not STORY_MIN <= len(t['cards']) <= STORY_MAX:
            problems.append(f'{sid}: {len(t["cards"])} cards (keep to {STORY_MIN}–{STORY_MAX})')
    return problems


def sync(data):
    """Story cards = their topic cards. Returns (changes, problems)."""
    ix = Index(data)
    changes, problems = [], []
    for t in data['decks']:
        if not is_story(t):
            continue
        for i, c in enumerate(t['cards']):
            k = key(c)
            if ix.by_key.get(k):
                options = [story_copy(x) for _, x in ix.by_key[k]]
                if c not in options:
                    t['cards'][i] = ix.copy_for(k)
                    changes.append(f'{t["id"]}: {k} updated from its topic')
                continue
            # The topic card's English changed (or it went): the same word's card, if it has one.
            senses = ix.senses(c['thai'])
            if len(senses) == 1:
                t['cards'][i] = ix.copy_for(senses[0])
                changes.append(f'{t["id"]}: {k} → {senses[0]}')
            elif senses:
                problems.append(f'{t["id"]}: {k} is gone; pick one of {senses} (add the story again with a pick)')
            else:
                problems.append(f'{t["id"]}: {k} is gone and {c["thai"]} has no card')
    return changes, problems


def build_story(src, ix, keep=()):
    """A story topic from a source entry. Returns (topic, notes, errors). `keep`: the cards of the
    story it replaces, whose copies it keeps (topics can hold one card with different notes)."""
    notes, errors = [], []
    picks = src.get('picks', {})
    kept = {key(c): c for c in keep}
    cards, have = [], set()
    chosen = {}  # thai -> key: one card per word in a story (the reader looks words up by their Thai)

    def add(k):
        if k not in have:
            have.add(k)
            options = [story_copy(c) for _, c in ix.by_key[k]]
            cards.append(kept[k] if kept.get(k) in options else ix.copy_for(k))
        chosen.setdefault(k.split('::', 1)[0], k)

    def pinned(w):
        """The card a word must take here: its pick, or the one it already has in this story."""
        if w in picks:
            return f'{w}::{picks[w]}'
        return chosen.get(w)

    passage = []
    for th, en in src['lines']:
        runs = []
        for run in th.split(' '):
            toks = []
            for tok in run.split('|'):
                label = tok.endswith(':')
                w = (tok[:-1] if label else tok).replace('_', ' ')
                if not THAI.search(w):
                    toks.append(tok)
                    continue
                senses = ix.senses(w)
                if pinned(w):
                    k = pinned(w)
                    if k not in ix.by_key:
                        errors.append(f'pick {k} is no card; its cards: {senses}')
                        toks.append(tok)
                        continue
                elif not senses:
                    errors.append(f'"{w}" has no card: add it to a topic first')
                    toks.append(tok)
                    continue
                else:
                    k = senses[0]
                    if len(senses) > 1 and k not in have:
                        notes.append(f'{w}: "{k.split("::", 1)[1]}" ({ix.uses[k]} stories); also '
                                     + ', '.join(f'"{s.split("::", 1)[1]}" ({ix.uses[s]})' for s in senses[1:]))
                card = ix.by_key[k][0][1]
                pieces = card.get('words', [])
                if len(pieces) > 1 and all(p in ix.by_key for p in pieces):
                    # A phrase: its words in the passage, and its card with theirs.
                    add(k)
                    for p in pieces:
                        pt = p.split('::', 1)[0]
                        add(pinned(pt) if pinned(pt) in ix.by_key else p)
                    toks.append('|'.join(p.split('::', 1)[0].replace(' ', '_') for p in pieces) + (':' if label else ''))
                else:
                    add(k)
                    toks.append(tok)
            runs.append('|'.join(toks))
        passage.append({'th': ' '.join(runs), 'en': en})
    # One card per word: two senses of one word in a story would clash in the reader.
    by_thai = Counter(c['thai'] for c in cards)
    for w, n in by_thai.items():
        if n > 1:
            errors.append(f'{w} has {n} senses in one story: use one')
    topic = {'id': src['id'], 'category': 'Reading', 'group': src['group'], 'name': src['name'],
             'description': src['description'], 'passage': passage, 'cards': cards}
    if src['group'] not in GROUPS:
        errors.append(f'group must be one of {GROUPS}')
    if not STORY_MIN <= len(cards) <= STORY_MAX:
        errors.append(f'{len(cards)} cards (keep to {STORY_MIN}–{STORY_MAX})')
    return topic, notes, errors


def add_stories(data, sources):
    ix = Index(data)
    decks = data['decks']
    ok = True
    for src in sources:
        at = next((i for i, t in enumerate(decks) if t['id'] == src['id']), None)
        topic, notes, errors = build_story(src, ix, decks[at]['cards'] if at is not None else ())
        print(f'{src["id"]}: {len(topic["cards"])} cards')
        for n in notes:
            print(f'  sense: {n}')
        for e in errors:
            print(f'  ERROR: {e}')
        if errors:
            ok = False
            continue
        if at is not None:
            if not is_story(decks[at]):
                print(f'  ERROR: {src["id"]} is a topic, not a story')
                ok = False
                continue
            decks[at] = topic
            print('  replaced')
        else:
            order = GROUPS.index(topic['group'])
            last = max((i for i, t in enumerate(decks) if is_story(t) and GROUPS.index(t['group']) <= order), default=None)
            if last is None:
                last = max(i for i, t in enumerate(decks) if is_story(t))
            decks.insert(last + 1, topic)
            print('  added')
    return ok


def coverage(data, show=0):
    decks = data['decks']
    in_stories = {key(c) for t in decks if is_story(t) for c in t['cards']}
    topic_keys = {key(c) for t in decks if not is_story(t) and t['category'] != 'Thai Script' for c in t['cards']}
    covered = topic_keys & in_stories
    print(f'cards outside Thai Script in a story: {len(covered)}/{len(topic_keys)} = {100 * len(covered) / len(topic_keys):.2f}%')
    missing = sorted(topic_keys - in_stories)
    for k in missing[:show]:
        print('  ', k)
    stories = [(t, {c['thai'] for c in t['cards']}) for t in decks if is_story(t)]
    few = []
    for t in decks:
        if is_story(t):
            continue
        words = {c['thai'] for c in t['cards']} - READING_COMMON
        n = sum(1 for _, ws in stories if len(ws & words) >= READING_MIN_MATCH)
        if n < TOPIC_MIN_STORIES and t['category'] != 'Thai Script':
            few.append((n, t['name']))
    print(f'topics outside Thai Script with fewer than {TOPIC_MIN_STORIES} stories: {len(few)}')
    for n, name in sorted(few)[:show or 10]:
        print(f'   {n}  {name}')
    return missing


def export_story(t):
    """A story as `add` source: its phrases' words joined back into the phrase, and every word's
    card pinned."""
    phrases = []
    for c in t['cards']:
        pieces = [k.split('::', 1)[0].replace(' ', '_') for k in c.get('words', [])]
        if len(pieces) > 1:
            phrases.append((pieces, c['thai'].replace(' ', '_')))
    phrases.sort(key=lambda p: -len(p[0]))  # longest first
    lines = []
    for line in t['passage']:
        runs = []
        for run in line['th'].split(' '):
            toks = run.split('|')
            out, i = [], 0
            while i < len(toks):
                for pieces, phrase in phrases:
                    n = len(pieces)
                    seg = toks[i:i + n]
                    if [x.rstrip(':') for x in seg] == pieces and not any(x.endswith(':') for x in seg[:-1]):
                        out.append(phrase + (':' if seg[-1].endswith(':') else ''))
                        i += n
                        break
                else:
                    out.append(toks[i])
                    i += 1
            runs.append('|'.join(out))
        lines.append([' '.join(runs), line['en']])
    picks = {c['thai']: c['english'] for c in t['cards']}
    return {'id': t['id'], 'group': t['group'], 'name': t['name'], 'description': t['description'],
            'lines': lines, 'picks': picks}


def show_story(data, sid):
    t = next((t for t in data['decks'] if t['id'] == sid), None)
    if not t or not is_story(t):
        sys.exit(f'no story {sid}')
    print(f'{t["name"]} [{t["group"]}] — {t["description"]}')
    for line in t['passage']:
        print('  ', line['th'].replace('|', ''), ' — ', line['en'])
    for c in t['cards']:
        print(f'     {c["thai"]} {c["translit"]} = {c["english"]}')


def main(argv):
    if not argv:
        sys.exit(__doc__)
    cmd, args = argv[0], argv[1:]
    dry = '--dry-run' in args
    args = [a for a in args if a != '--dry-run']
    data = decks_io.load()
    if cmd == 'check':
        problems = check(data)
        for p in problems:
            print(p)
        print(f'{len(problems)} problems in {sum(1 for t in data["decks"] if is_story(t))} stories')
        return 1 if problems else 0
    if cmd == 'sync':
        changes, problems = sync(data)
        for c in changes:
            print(c)
        for p in problems:
            print('PROBLEM:', p)
        print(f'{len(changes)} cards updated, {len(problems)} problems')
        if changes and not dry:
            decks_io.save(data)
            print('written')
        return 1 if problems else 0
    if cmd == 'add':
        sources = json.loads(open(args[0]).read())
        if not add_stories(data, sources):
            print('not written: fix the errors first')
            return 1
        problems = check(data)
        for p in problems:
            print(p)
        if problems:
            print('not written')
            return 1
        if not dry:
            decks_io.save(data)
            print('written')
        return 0
    if cmd == 'coverage':
        n = int(args[args.index('--list') + 1]) if '--list' in args else 0
        coverage(data, n)
        return 0
    if cmd == 'show':
        show_story(data, args[0])
        return 0
    if cmd == 'export':
        stories = {t['id']: t for t in data['decks'] if is_story(t)}
        missing = [a for a in args if a not in stories]
        if missing:
            sys.exit(f'no story {missing}')
        print(json.dumps([export_story(stories[a]) for a in args], ensure_ascii=False, indent=1))
        return 0
    sys.exit(__doc__)


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
