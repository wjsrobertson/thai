"""Add idiom (or other phrase) topics to data/decks.json from a spec, with each saying's words.

    python3 -u tools/add_idioms.py tools/specs/idioms-2026-11-28.json           # report only
    python3 -u tools/add_idioms.py tools/specs/idioms-2026-11-28.json --apply   # write decks.json

Written 2026-11-28 for the user's "can we add a load more?" idioms. A spec is
{ "after": topic id the phrase topics go after, "words_after": topic id the new word topics go after,
  "topics": [{ id, category, group, name, description, cards: [{ thai, english, note, words }] }],
  "new_words": { thai: [translit, english] } or { "thai::english": [translit, english] },
  "senses": { thai: english } (which card a bare Thai means in these sayings),
  "word_topics": [{ id, name, description }] }.
A card's `words` are Thai (or "thai::english" for one sense), which together spell it (spaces aside).
Each is resolved to a card that exists (`thai::english`; with only the Thai, its sense in an
Idioms "Words in…" topic, else in a word topic, else any, and the report lists the choice when there
were several), else made from `new_words` into the word topics, 25 to a topic. The saying's translit
is its words' joined with spaces. Phrase topics get `"phrases": true`. Then run the data steps in
CLAUDE.md (audit, stories check, spelling, gen_audio)."""
import json
import sys
from collections import defaultdict

import decks_io

TOPIC_MAX = 25


def main():
    spec = json.load(open(sys.argv[1]))
    apply = '--apply' in sys.argv
    data = decks_io.load()
    decks = data['decks']
    # Which sense, given only the Thai: the sayings' own words first, then a word topic's, then a
    # story's; never Thai Script's (its cards explain a spelling, "mid tone — fish").
    def rank(cd):
        c, d = cd
        cat = d.get('category')
        if d['id'].startswith(('script-', 'read-')) or cat == 'Thai Script':
            return 3
        return 0 if d['id'].startswith('idiom-words') else 2 if cat == 'Reading' or d.get('phrases') else 1

    by_key = {}
    senses = defaultdict(list)  # thai -> [(card, deck)]
    for d in decks:
        for c in d['cards']:
            by_key.setdefault(decks_io.key(c), (c, d))
            same = [x for x in senses[c['thai']] if decks_io.key(x[0]) == decks_io.key(c)]
            if not same:
                senses[c['thai']].append((c, d))
            elif rank((c, d)) < rank(same[0]):  # a sense goes by the best topic it's in
                senses[c['thai']][senses[c['thai']].index(same[0])] = (c, d)
    existing_thai = {c['thai'] for d in decks for c in d['cards'] if d.get('phrases')}
    new_cards = {}  # key -> card
    problems, notes = [], []

    def resolve(tok, where):
        if '::' in tok:
            if tok in by_key:
                return by_key[tok][0]
            if tok in new_cards:
                return new_cards[tok]
            thai = tok.split('::')[0]
            if tok in spec['new_words']:
                tr, en = spec['new_words'][tok]
                new_cards[tok] = {'thai': thai, 'translit': tr, 'english': en}
                return new_cards[tok]
            problems.append(f'{where}: no card {tok}')
            return None
        if tok in spec.get('senses', {}):  # the sense picked for this saying set's bare Thai
            return resolve(f"{tok}::{spec['senses'][tok]}", where)
        if senses.get(tok):
            options = sorted(senses[tok], key=rank)
            if len(options) > 1:
                notes.append(f'{where}: {tok} → "{options[0][0]["english"]}" ({options[0][1]["id"]}); also '
                             + ' | '.join(f'"{c["english"]}"' for c, _ in options[1:4]))
            return options[0][0]
        made = [c for k, c in new_cards.items() if c['thai'] == tok]
        if made:
            return made[0]
        if tok in spec['new_words']:
            tr, en = spec['new_words'][tok]
            card = {'thai': tok, 'translit': tr, 'english': en}
            new_cards[decks_io.key(card)] = card
            return card
        problems.append(f'{where}: no card for {tok} (add it to new_words)')
        return None

    topics = []
    for t in spec['topics']:
        cards = []
        for s in t['cards']:
            where = s['thai']
            if s['thai'] in existing_thai:
                problems.append(f'{where}: already a phrase card')
            words = [resolve(w, where) for w in s['words']]
            if None in words:
                continue
            if ''.join(w['thai'] for w in words) != s['thai'].replace(' ', ''):
                problems.append(f"{where}: words spell {''.join(w['thai'] for w in words)}")
                continue
            card = {'thai': s['thai'], 'translit': ' '.join(w['translit'] for w in words), 'english': s['english']}
            if s.get('note'):
                card['note'] = s['note']
            card['words'] = [decks_io.key(w) for w in words]
            cards.append(card)
        if len(t['cards']) > TOPIC_MAX:
            problems.append(f"{t['id']}: {len(t['cards'])} cards, over {TOPIC_MAX}")
        topics.append({**{k: v for k, v in t.items() if k != 'cards'}, 'phrases': True, 'cards': cards})

    word_cards = list(new_cards.values())
    word_topics = []
    for i, wt in enumerate(spec['word_topics']):
        chunk = word_cards[i * TOPIC_MAX:(i + 1) * TOPIC_MAX]
        if chunk:
            base = topics[0]
            word_topics.append({'id': wt['id'], 'category': base['category'], 'group': base['group'],
                                'name': wt['name'], 'description': wt['description'], 'cards': chunk})
    if len(word_cards) > TOPIC_MAX * len(spec['word_topics']):
        problems.append(f'{len(word_cards)} new words: add a word topic')

    for n in notes:
        print('  sense:', n)
    print(f"{sum(len(t['cards']) for t in topics)} sayings in {len(topics)} topics; {len(word_cards)} new words:")
    for c in word_cards:
        print(f"    {c['thai']} ({c['translit']}) {c['english']}")
    for p in problems:
        print('  PROBLEM:', p)
    if not apply:
        return
    if problems:
        sys.exit('not applied: problems above')
    ids = [d['id'] for d in decks]
    if any(t['id'] in ids for t in topics + word_topics):
        sys.exit('not applied: a topic id exists already')
    at = ids.index(spec['after']) + 1
    decks[at:at] = topics
    ids = [d['id'] for d in decks]
    at = ids.index(spec['words_after']) + 1
    decks[at:at] = word_topics
    decks_io.save(data)
    print('written')


if __name__ == '__main__':
    main()
