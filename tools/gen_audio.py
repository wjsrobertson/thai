#!/usr/bin/env python3
"""Pre-generate Thai and English audio samples for every card in data/decks.json.

Uses edge-tts (Microsoft Edge's online neural TTS; no API key, needs network).
Writes data/audio/<hash>.mp3 plus data/audio/manifest.json, which maps each
card's exact `thai` / `english` string to its file, per language. The app looks
samples up in the manifest and falls back to browser TTS for anything missing.

It also records the parts spellings are read out with (data/spelling-parts.json, written by
`node tools/spelling.mjs --write`): letter names, sounds, vowel and tone-mark names, syllables.
They're keyed under the manifest section `sp`, so a part never collides with a card's text.
Parts are trimmed of the silence edge-tts pads every clip with (about 0.2 s before and 1.2–1.5 s
after the speech), so a spelling plays briskly; the app sets the pause between parts. Trimming
needs ffmpeg, and makes a part from the untrimmed recording if one exists (a card's, or an older
run's), else records one.

Re-runs skip samples that already exist, so it's cheap to run after adding cards:

    python3 -u tools/gen_audio.py            # generate missing samples
    python3 -u tools/gen_audio.py --prune    # also delete samples no card uses
"""
import argparse
import asyncio
import hashlib
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

import edge_tts

ROOT = Path(__file__).resolve().parent.parent
DECKS = ROOT / 'data' / 'decks.json'
AUDIO_DIR = ROOT / 'data' / 'audio'
MANIFEST = AUDIO_DIR / 'manifest.json'
SPELLING_PARTS = ROOT / 'data' / 'spelling-parts.json'

# manifest language -> card field
FIELDS = {'th': 'thai', 'en': 'english'}


THAI_DIGITS = str.maketrans('๐๑๒๓๔๕๖๗๘๙', '0123456789')


def spoken_text(text, lang):
    """What the voice actually says, where reading the card text verbatim sounds wrong."""
    if lang == 'th':
        # Thai laughter "555" (5 = ห้า, hâa) would be read as "five hundred and fifty-five".
        if re.fullmatch(r'5+', text):
            return ' '.join(['ห้า'] * len(text))
        # The obsolete letters ฦ and ฦๅ (in a note) get no audio at all from the voice: read them
        # as they sound, lʉ and lʉʉ, as the ฤๅ card's 'say' does for its sibling.
        text = {'ฦ': 'ลึ', 'ฦๅ': 'ลือ'}.get(text, text)
        # The Thai voice all but skips Thai digits (๐–๙) but reads Arabic ones in Thai.
        return text.translate(THAI_DIGITS)
    # English glosses list alternatives as "a / b", which the voice runs together with no pause.
    text = re.sub(r'\s+/\s+', ', ', text)            # "money / silver" -> "money, silver"
    text = re.sub(r'(?<=\w)/(?=\w)', ' or ', text)   # "yes/no" -> "yes or no"
    # Symbol-only brackets like "(≠)" or "(∀)" are for the eye; the voice reads them out again.
    text = re.sub(r'\s*\((?:(?!\w)[^\s)])+\)', '', text)
    return text


# A run of Thai words in a note or topic paragraph, and whether the app plays it: it has a
# consonant, doesn't start with a vowel or tone mark (a spelling note's –ือ), and isn't a list of
# letters (ด ต ถ ท ธ …). Keep in step with THAI_RUN and playableThai() in app.js.
THAI_RUN = re.compile('[\u0E01-\u0E5B]+(?:[ \u00A0]+[\u0E01-\u0E5B]+)*')


def playable_thai(run):
    if not re.search('[\u0E01-\u0E2E]', run) or re.match('[\u0E30-\u0E3A\u0E45-\u0E4E]', run):
        return False
    words = re.split('[ \u00A0]+', run)
    return not (len(words) >= 3 and all(len(w) <= 2 for w in words))


def sentence_text(th):
    """A passage line as it's said: word breaks (|) joined up, and a speaker's label ("ลูกค้า: ")
    left off. Keep in step with sentenceText() in app.js."""
    return re.sub(r'^[^ ]+: ', '', th).replace('|', '').replace('_', ' ')


def voice_for(said, lang, voices):
    # The English voice silently drops Thai script, so English glosses that
    # quote a Thai word ("formal version of เถอะ") use the Thai voice instead.
    if lang == 'en' and re.search(r'[฀-๿]', said):
        return voices['th']
    return voices[lang]


def sample_name(text, voice, rate):
    # Voice and rate are part of the hash so changing either regenerates
    # everything rather than leaving a mix of old and new voices.
    return hashlib.sha1(f'{voice}|{rate}|{text}'.encode()).hexdigest()[:16] + '.mp3'


def trimmed_name(text, voice, rate):
    # A spelling part's trimmed clip. Named apart from the untrimmed recording, which a card can
    # share (a part such as กา can also be a card's word), and so phones that cached an untrimmed
    # part fetch the new one.
    return hashlib.sha1(f'{voice}|{rate}|trim|{text}'.encode()).hexdigest()[:16] + '.mp3'


# Keep 0.03 s before the speech and 0.1 s after: silenceremove on the start, then on the reversed
# clip for the end. -50 dB (peak) is below the quietest speech tails (a final ด or บ).
TRIM_FILTER = ('silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.03:detection=peak,'
               'areverse,silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.1:detection=peak,'
               'areverse')


def trim_silence(src, dest):
    """Write src without its padding to dest, in edge-tts's own format (24 kHz mono, 48 kbit/s)."""
    tmp = dest.with_suffix('.part')
    r = subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(src), '-af', TRIM_FILTER,
                        '-ac', '1', '-ar', '24000', '-c:a', 'libmp3lame', '-b:a', '48k', '-f', 'mp3', str(tmp)],
                       capture_output=True, text=True)
    if r.returncode or not tmp.exists() or tmp.stat().st_size == 0:
        tmp.unlink(missing_ok=True)
        return r.stderr.strip() or 'ffmpeg failed'
    tmp.replace(dest)
    return None


async def synth(text, voice, rate, dest, attempts):
    """Write one sample, retrying: the service intermittently returns no audio."""
    tmp = dest.with_suffix('.part')
    err = None
    for i in range(attempts):
        try:
            await edge_tts.Communicate(text, voice, rate=rate).save(str(tmp))
            if tmp.stat().st_size > 0:
                tmp.replace(dest)  # atomic, so a half-written file is never served
                return None
        except Exception as e:  # NoAudioReceived, websocket/network errors
            err = e
        await asyncio.sleep(2 ** i)
    tmp.unlink(missing_ok=True)
    return err or 'empty audio'


def write_manifest(entries, voices, rate):
    manifest = {}
    for lang in [*FIELDS, 'sp']:
        files = {key: name for (l, key), name in entries.items()
                 if l == lang and (AUDIO_DIR / name).exists()}
        # 'voice' is the language's main voice; see voice_for() for exceptions. sp is Thai.
        manifest[lang] = {'voice': voices['th' if lang == 'sp' else lang], 'rate': rate, 'files': files}
    tmp = MANIFEST.with_suffix('.part')
    tmp.write_text(json.dumps(manifest, ensure_ascii=False, indent=1, sort_keys=True))
    tmp.replace(MANIFEST)
    return manifest


async def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--th-voice', default='th-TH-NiwatNeural', help='Thai voice (default: %(default)s)')
    ap.add_argument('--en-voice', default='en-GB-SoniaNeural', help='English voice (default: %(default)s)')
    ap.add_argument('--rate', default='+0%', help='speed adjustment, e.g. -20%% (default: %(default)s)')
    ap.add_argument('--jobs', type=int, default=3, help='concurrent requests (default: %(default)s)')
    ap.add_argument('--attempts', type=int, default=5, help='tries per sample (default: %(default)s)')
    ap.add_argument('--prune', action='store_true', help='delete samples not referenced by any card')
    args = ap.parse_args()
    voices = {'th': args.th_voice, 'en': args.en_voice}

    decks = json.loads(DECKS.read_text())['decks']
    # (lang, card text) -> sample filename
    entries = {}
    # sample filename -> (spoken text, voice, trimmed); several card texts can share one sample
    samples = {}
    for d in decks:
        for c in d['cards']:
            for lang, field in FIELDS.items():
                # A card's optional 'say' replaces what the Thai voice reads, e.g. a lone
                # letter is read by its name (ก -> กอ ไก่). The manifest stays keyed by c['thai'].
                text = c.get('say', c[field]) if lang == 'th' else c[field]
                said = spoken_text(text, lang)
                voice = voice_for(said, lang, voices)
                name = sample_name(said, voice, args.rate)
                if entries.get((lang, c[field]), name) != name:
                    print(f'warning: {c[field]!r} is said two ways; using {said!r} ({d["id"]})')
                entries[(lang, c[field])] = name
                samples[name] = (said, voice, False)
    # Thai in notes and topic paragraphs, which the app makes tap-to-play (appendNoteText,
    # 2026-10-08): each playable run, keyed under 'th' like a card's Thai. A run that is a card's
    # Thai keeps that card's sample (its 'say' and all).
    for text in [c.get('note', '') for d in decks for c in d['cards']] + [d.get('about', '') for d in decks]:
        for run in THAI_RUN.findall(text):
            if not playable_thai(run) or ('th', run) in entries:
                continue
            said = spoken_text(run, 'th')
            name = sample_name(said, voices['th'], args.rate)
            entries[('th', run)] = name
            samples[name] = (said, voices['th'], False)
    # Reading passages (a topic's `passage`): each sentence, so the reader can play it whole. Keyed
    # by sentence_text(), as the app's reader does.
    for d in decks:
        for line in d.get('passage', []):
            text = sentence_text(line['th'])
            if ('th', text) in entries:
                continue
            said = spoken_text(text, 'th')
            name = sample_name(said, voices['th'], args.rate)
            entries[('th', text)] = name
            samples[name] = (said, voices['th'], False)
    # Spelling parts, read by the Thai voice (see the module docstring).
    if SPELLING_PARTS.exists():
        for part in json.loads(SPELLING_PARTS.read_text()):
            said = spoken_text(part, 'th')
            name = trimmed_name(said, voices['th'], args.rate)
            entries[('sp', part)] = name
            samples[name] = (said, voices['th'], True)
    AUDIO_DIR.mkdir(exist_ok=True)

    todo = [(name, said, voice, trim) for name, (said, voice, trim) in sorted(samples.items())
            if not (AUDIO_DIR / name).exists()]
    if any(trim for *_, trim in todo) and not shutil.which('ffmpeg'):
        sys.exit('ffmpeg is needed to trim spelling parts (see the module docstring)')
    print(f'{len(samples)} samples needed ({voices["th"]}, {voices["en"]}, rate {args.rate}); '
          f'{len(samples) - len(todo)} already exist; {len(todo)} to generate with {args.jobs} jobs')

    sem = asyncio.Semaphore(args.jobs)
    failed = []
    done = 0

    async def one(name, said, voice, trim):
        nonlocal done
        dest = AUDIO_DIR / name
        async with sem:
            if not trim:
                err = await synth(said, voice, args.rate, dest, args.attempts)
            else:
                # Trim the untrimmed recording if there is one, else record a throwaway one.
                src = AUDIO_DIR / sample_name(said, voice, args.rate)
                raw = src if src.exists() else dest.with_suffix('.raw.mp3')
                err = None if raw.exists() else await synth(said, voice, args.rate, raw, args.attempts)
                if not err:
                    err = await asyncio.to_thread(trim_silence, raw, dest)
                if raw != src:
                    raw.unlink(missing_ok=True)
        done += 1
        if err:
            failed.append(said)
            print(f'FAIL {said!r}: {err!r}')
        if done % 50 == 0 or done == len(todo):
            print(f'{done}/{len(todo)} done, {len(failed)} failed')

    try:
        await asyncio.gather(*(one(*t) for t in todo))
    finally:
        # Written even on Ctrl-C so whatever finished is usable.
        manifest = write_manifest(entries, voices, args.rate)
        for lang, field in [*FIELDS.items(), ('sp', 'spelling-part')]:
            total = sum(1 for l, _ in entries if l == lang)
            print(f'manifest {lang}: {len(manifest[lang]["files"])}/{total} {field} strings have samples')

    if args.prune:
        keep = set(entries.values())
        stale = [p for p in AUDIO_DIR.iterdir()
                 if (p.suffix == '.mp3' and p.name not in keep) or p.suffix == '.part']
        for p in stale:
            p.unlink()
        print(f'pruned {len(stale)} unused files')

    if failed:
        print(f'{len(failed)} failed; re-run to retry them.')
        sys.exit(1)


if __name__ == '__main__':
    asyncio.run(main())
