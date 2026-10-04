#!/usr/bin/env python3
"""Pre-generate Thai and English audio samples for every card in data/decks.json.

Uses edge-tts (Microsoft Edge's online neural TTS; no API key, needs network).
Writes data/audio/<hash>.mp3 plus data/audio/manifest.json, which maps each
card's exact `thai` / `english` string to its file, per language. The app looks
samples up in the manifest and falls back to browser TTS for anything missing.

Re-runs skip samples that already exist, so it's cheap to run after adding cards:

    python3 -u tools/gen_audio.py            # generate missing samples
    python3 -u tools/gen_audio.py --prune    # also delete samples no card uses
"""
import argparse
import asyncio
import hashlib
import json
import re
import sys
from pathlib import Path

import edge_tts

ROOT = Path(__file__).resolve().parent.parent
DECKS = ROOT / 'data' / 'decks.json'
AUDIO_DIR = ROOT / 'data' / 'audio'
MANIFEST = AUDIO_DIR / 'manifest.json'

# manifest language -> card field
FIELDS = {'th': 'thai', 'en': 'english'}


THAI_DIGITS = str.maketrans('๐๑๒๓๔๕๖๗๘๙', '0123456789')


def spoken_text(text, lang):
    """What the voice actually says, where reading the card text verbatim sounds wrong."""
    if lang == 'th':
        # Thai laughter "555" (5 = ห้า, hâa) would be read as "five hundred and fifty-five".
        if re.fullmatch(r'5+', text):
            return ' '.join(['ห้า'] * len(text))
        # The Thai voice all but skips Thai digits (๐–๙) but reads Arabic ones in Thai.
        return text.translate(THAI_DIGITS)
    # English glosses list alternatives as "a / b", which the voice runs together with no pause.
    text = re.sub(r'\s+/\s+', ', ', text)            # "money / silver" -> "money, silver"
    text = re.sub(r'(?<=\w)/(?=\w)', ' or ', text)   # "yes/no" -> "yes or no"
    # Symbol-only brackets like "(≠)" or "(∀)" are for the eye; the voice reads them out again.
    text = re.sub(r'\s*\((?:(?!\w)[^\s)])+\)', '', text)
    return text


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
    for lang in FIELDS:
        files = {key: name for (l, key), name in entries.items()
                 if l == lang and (AUDIO_DIR / name).exists()}
        # 'voice' is the language's main voice; see voice_for() for exceptions.
        manifest[lang] = {'voice': voices[lang], 'rate': rate, 'files': files}
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
    # sample filename -> (spoken text, voice); several card texts can share one sample
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
                samples[name] = (said, voice)
    AUDIO_DIR.mkdir(exist_ok=True)

    todo = [(name, said, voice) for name, (said, voice) in sorted(samples.items())
            if not (AUDIO_DIR / name).exists()]
    print(f'{len(samples)} samples needed ({voices["th"]}, {voices["en"]}, rate {args.rate}); '
          f'{len(samples) - len(todo)} already exist; {len(todo)} to generate with {args.jobs} jobs')

    sem = asyncio.Semaphore(args.jobs)
    failed = []
    done = 0

    async def one(name, said, voice):
        nonlocal done
        async with sem:
            err = await synth(said, voice, args.rate, AUDIO_DIR / name, args.attempts)
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
        for lang, field in FIELDS.items():
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
