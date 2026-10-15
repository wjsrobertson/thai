#!/usr/bin/env python3
"""When each word of every Reading sentence is said, for the reader to light up the word being
said (2026-10-12, the user's request). Writes data/audio/timings.json:

    {"voice": ..., "rate": ..., "words": {sentence: [c, start, end, c, start, end, …]}}

`sentence` is the passage line as said (gen_audio's sentence_text, the manifest's key); each word
the voice says gives its position in the sentence (c, in characters) and when it's said (start
and end, in ms from the start of the clip). The voice's word breaks are its own, finer than the
passage's (ผู้ก่อการร้าย comes as ผู้ ก่อ การ ร้าย); the app lights the passage word each falls in.

The timings come from edge-tts's word boundaries, which means saying the sentence again. The new
clip matches the stored one in length but not byte for byte (2026-10-12: the same speech, encoded a
little differently), so the stored clip is kept unless its length differs, when the new one
replaces it and the timings fit it exactly. Re-runs skip sentences that have timings already;
it writes as it goes, so stopping it loses little.

    python3 -u tools/word_timings.py            # the sentences still without timings
    python3 -u tools/word_timings.py --limit 50 # just 50 of them (a trial)
"""
import argparse
import asyncio
import json
import sys
from pathlib import Path

import edge_tts

sys.path.insert(0, str(Path(__file__).resolve().parent))
from gen_audio import AUDIO_DIR, DECKS, sample_name, sentence_text, spoken_text  # noqa: E402

TIMINGS = AUDIO_DIR / 'timings.json'


def load():
    try:
        return json.loads(TIMINGS.read_text())
    except (OSError, ValueError):
        return {}


def save(data):
    tmp = TIMINGS.with_suffix('.part')
    tmp.write_text(json.dumps(data, ensure_ascii=False, separators=(',', ':'), sort_keys=True))
    tmp.replace(TIMINGS)


async def words_of(said, voice, rate, attempts):
    """(audio bytes, [(text, start ms, end ms)]) for one sentence, retrying failures."""
    err = None
    for i in range(attempts):
        try:
            audio, words = bytearray(), []
            async for chunk in edge_tts.Communicate(said, voice, rate=rate, boundary='WordBoundary').stream():
                if chunk['type'] == 'audio':
                    audio += chunk['data']
                elif chunk['type'] == 'WordBoundary':
                    start = chunk['offset'] / 1e4  # 100 ns units to ms
                    words.append((chunk['text'], round(start), round(start + chunk['duration'] / 1e4)))
            if audio and words:
                return bytes(audio), words, None
            err = 'no audio or no word boundaries'
        except Exception as e:  # NoAudioReceived, websocket/network errors
            err = e
        await asyncio.sleep(2 ** i)
    return None, None, err


def placed(said, words, sentence=None):
    """[c, start, end, …]: each word's position in the sentence, found in order. Found in what the
    voice was given (`said`), and taken back to the sentence when that was respelled for the voice
    (gen_audio's spoken_text: ยักษ์ said ยัก, 2026-10-15), so the words after it light up in place."""
    import difflib
    back = None
    if sentence is not None and sentence != said:
        back = [len(sentence)] * (len(said) + 1)
        for tag, i1, i2, j1, j2 in difflib.SequenceMatcher(None, sentence, said, autojunk=False).get_opcodes():
            for k in range(j1, j2):  # what was said, matched one for one, or respelled (its start)
                back[k] = i1 + (k - j1 if tag == 'equal' else 0)
    out, at = [], 0
    for text, start, end in words:
        c = said.find(text, at)
        if c < 0:
            continue  # the voice said it differently (a number read out): no light for it
        out += [back[c] if back else c, start, end]
        at = c + len(text)
    return out


async def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--th-voice', default='th-TH-NiwatNeural')
    ap.add_argument('--rate', default='+0%')
    ap.add_argument('--jobs', type=int, default=4)
    ap.add_argument('--attempts', type=int, default=5)
    ap.add_argument('--limit', type=int, default=0, help='do at most this many (0: all)')
    args = ap.parse_args()

    data = load()
    if data.get('voice') != args.th_voice or data.get('rate') != args.rate:
        data = {'voice': args.th_voice, 'rate': args.rate, 'words': {}}
    have = data['words']
    sentences = []
    for d in json.loads(DECKS.read_text())['decks']:
        for line in d.get('passage', []):
            text = sentence_text(line['th'])
            if text not in have and text not in sentences:
                sentences.append(text)
    if args.limit:
        sentences = sentences[:args.limit]
    print(f'{len(have)} sentences have timings; {len(sentences)} to do')

    sem = asyncio.Semaphore(args.jobs)
    done = replaced = 0
    failed = []

    async def one(text):
        nonlocal done, replaced
        said = spoken_text(text, 'th')
        async with sem:
            audio, words, err = await words_of(said, args.th_voice, args.rate, args.attempts)
        done += 1
        if err:
            failed.append(text)
            print(f'FAIL {text!r}: {err!r}')
            return
        clip = AUDIO_DIR / sample_name(said, args.th_voice, args.rate)
        if not clip.exists() or clip.stat().st_size != len(audio):
            tmp = clip.with_suffix('.part')
            tmp.write_bytes(audio)
            tmp.replace(clip)
            replaced += 1
        have[text] = placed(said, words, text)
        if done % 100 == 0 or done == len(sentences):
            save(data)
            print(f'{done}/{len(sentences)} done, {replaced} clips replaced, {len(failed)} failed')

    try:
        await asyncio.gather(*(one(t) for t in sentences))
    finally:
        save(data)
    print(f'timings for {len(have)} sentences; {replaced} clips replaced')
    if failed:
        print(f'{len(failed)} failed; re-run to retry them.')
        sys.exit(1)


if __name__ == '__main__':
    asyncio.run(main())
