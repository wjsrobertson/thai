"""Parse the OpenSubtitles-2018 Thai frequency list into a clean spoken-Thai word list.

Thai subtitles put spaces between phrases, not words, so each entry is a chunk ("ขอโทษนะคะ").
Steps: drop noise (Latin, no-Thai, mis-decoded UTF-8, credits) -> segment each chunk into words
by dictionary DP (TNC + TTC + slang lexicon + our decks) -> aggregate counts -> compare with
written frequency (TNC) to find what's characteristic of speech.

    python3 -u subs.py    # writes subs_*.tsv next to this file

Needs th_full.txt (277 MB, not kept in the repo) next to this file:
    curl -L -o th_full.zip https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/th/th_full.zip
    python3 -c "import zipfile; zipfile.ZipFile('th_full.zip').extractall('.')"
tnc_freq.txt / ttc_freq.txt come from PyThaiNLP (CC0): github.com/PyThaiNLP/pythainlp, pythainlp/corpus/.
"""
import json, math, re, time
from collections import Counter, defaultdict
from pathlib import Path

HERE = Path(__file__).parent
SLANG = HERE.parent / 'slang' / 'lexicon.json'
DECKS = Path('/home/will/Development/code/learnthai/data/decks.json')
MIN_COUNT = 1          # entries are phrases, so many genuine ones occur once
MAX_WORD = 20          # longest dictionary word considered, in code points

THAI = re.compile(r'[ก-๛]')
LATIN = re.compile(r'[A-Za-z]')
# UTF-8 Thai mis-decoded as cp874 shows up as เ + ธ/น + a char from ก..ฟ (the continuation byte).
MOJI = re.compile(r'เ[ธน][ก-ฟ]|เ[ธน]$')
CREDITS = {'บรรยายไทยโดย', 'แปลโดย', 'ซับไทย', 'ซับไตเติ้ล', 'คำบรรยายไทย', 'แปลไทย', 'ถอดความ',
           'ตรวจทาน', 'ซับ', 'บรรยายไทย', 'ทีมงาน', 'เรียบเรียง', 'ปรับปรุงโดย', 'ซิงค์'}
NOT_THAI_WORD = re.compile(r'[^ก-๛]+')

WORD_START = re.compile('[\u0e01-\u0e2e\u0e40-\u0e44]')  # consonant or leading vowel เ แ โ ใ ไ
MARKS_ONLY = re.compile('^[\u0e30-\u0e3a\u0e45-\u0e4e]+$')  # dependent vowels / tone marks only

def garbled(w):
    return sum(len(m.group()) for m in MOJI.finditer(w)) / len(w) >= 0.5

def load_freq(path):
    out = {}
    for line in open(path, encoding='utf-8'):
        w, _, n = line.rstrip('\n').partition('\t')
        if n.strip().isdigit() and THAI.search(w):
            out[w] = out.get(w, 0) + int(n)
    return out

def build():
    t0 = time.time()
    tnc = load_freq(HERE / 'tnc_freq.txt')
    tnc_total = sum(tnc.values())

    slang = {}
    if SLANG.exists():
        for e in json.load(open(SLANG)):
            for part in re.split(r'\s+|\.\.\.', e['thai']):
                if THAI.search(part):
                    slang.setdefault(part, e['register'])
    deck_words = set()
    for d in json.load(open(DECKS))['decks']:
        for c in d['cards']:
            for part in re.split(r'\s+|\.\.\.', c['thai']):
                if THAI.search(part): deck_words.add(part)

    # Dictionary = TNC words + slang lexicon only, so word boundaries match TNC's and the
    # spoken-vs-written comparison is like for like. (TTC and deck words brought in compounds
    # such as ไม่มี / ทำอะไร that TNC splits, which inflated their "speech skew".)
    SLANG_PRIOR = 50  # pseudo-count for lexicon forms TNC lacks: used when they match, not dominant
    weight = {w: n for w, n in tnc.items() if n >= 2}
    for w in slang: weight[w] = max(weight.get(w, 0), SLANG_PRIOR)
    # A Thai word can't start with a dependent vowel or tone mark; such entries are fragments.
    weight = {w: n for w, n in weight.items()
              if len(w) <= MAX_WORD and not NOT_THAI_WORD.search(w) and WORD_START.match(w) and w != 'ๆ'}
    print(f'dictionary: {len(weight):,} words ({len(slang):,} slang forms) in {time.time()-t0:.1f}s', flush=True)

    total_w = sum(weight.values())
    logp = {w: math.log(n / total_w) for w, n in weight.items()}
    UNK = math.log(0.01 / total_w)  # per character: far less likely than any dictionary word
    cache = {}

    def segment(s):
        """Most probable segmentation under a unigram model; unknown runs grouped."""
        if s in cache: return cache[s]
        n = len(s)
        best = [None] * (n + 1); best[0] = (0.0, [])   # best[i] = (log prob, path) for s[:i]
        for i in range(n):
            if best[i] is None: continue
            bs, bp = best[i]
            for j in range(i + 1, min(n, i + MAX_WORD) + 1):
                w = s[i:j]
                if w in logp:
                    cand = (bs + logp[w], bp + [(w, True)])
                elif j == i + 1:
                    cand = (bs + UNK, bp + [(w, False)])
                else:
                    continue
                if best[j] is None or cand[0] > best[j][0]:
                    best[j] = cand
        toks, run = [], ''
        for w, known in best[n][1]:            # merge consecutive unknown chars into one span
            if known:
                if run: toks.append((run, False)); run = ''
                toks.append((w, True))
            else:
                run += w
        if run: toks.append((run, False))
        if len(cache) < 2_000_000: cache[s] = toks
        return toks

    return tnc, slang, deck_words, segment


def main():
    t0 = time.time()
    tnc, slang, deck_words, segment = build()
    tnc_total = sum(tnc.values())
    noise = Counter(); chunks = Counter(); words = Counter(); unknown = Counter()
    entries = 0
    with open(HERE / 'th_full.txt', encoding='utf-8', errors='replace') as f:
        for line in f:
            w, _, n = line.rstrip('\n').rpartition(' ')
            if not n.isdigit(): continue
            n = int(n)
            if LATIN.search(w): noise['latin'] += n; continue
            if not THAI.search(w): noise['no_thai'] += n; continue
            if garbled(w): noise['garbled'] += n; continue
            if n < MIN_COUNT: noise['singleton'] += n; continue
            w = w.strip('.,!?…"\'-–—:;()[]{}*~_')
            if w in CREDITS: noise['credits'] += n; continue
            if NOT_THAI_WORD.search(w):                     # digits/punctuation inside: keep Thai runs
                parts = [p for p in NOT_THAI_WORD.split(w) if p]
            else:
                parts = [w]
            for p in parts:
                if p == 'ๆ': continue
                chunks[p] += n
                for tok, known in segment(p):
                    if tok == 'ๆ': continue
                    if known: words[tok] += n
                    elif MARKS_ONLY.match(tok): noise['stray_marks'] += n
                    else: unknown[tok] += n
            entries += 1
            if entries % 200_000 == 0:
                print(f'{entries:,} entries, {time.time()-t0:.0f}s', flush=True)

    total = sum(words.values()) + sum(unknown.values())
    print(f'done: {entries:,} entries; {total:,} word tokens; unknown spans {sum(unknown.values())/total:.1%}', flush=True)
    print('noise (occurrences):', dict(noise), flush=True)

    tnc_rank = {w: i + 1 for i, (w, _) in enumerate(sorted(tnc.items(), key=lambda x: -x[1]))}
    with open(HERE / 'subs_words.tsv', 'w') as f:
        f.write('rank\tword\tcount\tper_million\ttnc_rank\tspeech_skew\tslang\tin_decks\n')
        for i, (w, n) in enumerate(words.most_common(), 1):
            pm = n / total * 1e6
            # Ratio only where TNC has a real count; otherwise the form is speech-only.
            skew = f'{pm / (tnc[w] / tnc_total * 1e6):.2f}' if tnc.get(w, 0) >= 5 else 'speech-only'
            f.write(f'{i}\t{w}\t{n}\t{pm:.1f}\t{tnc_rank.get(w, "")}\t{skew}\t{slang.get(w, "")}\t{"y" if w in deck_words else ""}\n')
    with open(HERE / 'subs_chunks.tsv', 'w') as f:
        for w, n in chunks.most_common(20000): f.write(f'{w}\t{n}\n')
    with open(HERE / 'subs_unknown.tsv', 'w') as f:
        for w, n in unknown.most_common(5000): f.write(f'{w}\t{n}\n')
    print(f'wrote subs_words.tsv ({len(words):,} words), subs_chunks.tsv, subs_unknown.tsv in {time.time()-t0:.0f}s')

if __name__ == '__main__':
    main()
