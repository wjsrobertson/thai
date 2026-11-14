"""data/frequency.json: the words that have a card, most used first, for Vocabulary's "Most used"
run (app.js, vocab*). The user's request, 2026-11-14: go through the most used words, one by one,
and mark the ones you know.

The order is research/freq/subs_words.tsv (spoken Thai from film and TV subtitles; see the notes'
"Frequency & slang research"). A word counts if a topic has a card with exactly that Thai: not a
story's card, an Alphabet letter or a phrase. A word with no card is skipped, as the run has nothing
to show or say for it; so are the list's names and fragments, which have none.

Each word keeps its subtitle rank, for an estimate of the words you know beyond those answered.

    python3 -u tools/frequency.py         # after cards change; writes data/frequency.json
"""
import json
import os
import sys

import decks_io

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SUBS = os.path.join(ROOT, 'research', 'freq', 'subs_words.tsv')
OUT = os.path.join(ROOT, 'data', 'frequency.json')


def is_phrase(card):
    # As app.js's isPhrase: a card listing its words, or Thai with a space (a doubled ๆ word stays).
    return len(card.get('words') or []) > 1 or ' ' in card['thai'].replace(' ๆ', 'ๆ')


def card_words():
    words = set()
    for topic in decks_io.load()['decks']:
        if topic.get('passage'):
            continue
        for card in topic['cards']:
            if not card.get('alpha') and not is_phrase(card):
                words.add(card['thai'])
    return words


def main():
    have = card_words()
    words, ranks = [], []
    with open(SUBS, encoding='utf-8') as f:
        header = f.readline().rstrip('\n').split('\t')
        at_rank, at_word = header.index('rank'), header.index('word')
        for line in f:
            cols = line.rstrip('\n').split('\t')
            if cols[at_word] in have:
                words.append(cols[at_word])
                ranks.append(int(cols[at_rank]))
    data = {
        'source': 'research/freq/subs_words.tsv (OpenSubtitles 2018 Thai, hermitdave/FrequencyWords)',
        'words': words,
        'ranks': ranks,
    }
    with open(OUT, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, separators=(',', ':'))
        f.write('\n')
    print(f'{len(words)} words with a card, the last at subtitle rank {ranks[-1]}: {os.path.relpath(OUT, ROOT)}')
    for n in (100, 500, 1000, 2000, 5000):
        if n <= len(words):
            print(f'  the {n}th: {words[n - 1]} (rank {ranks[n - 1]})')
    return 0


if __name__ == '__main__':
    sys.exit(main())
