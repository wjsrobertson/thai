# learnthai

A personal Thai-learning web app: plain HTML, CSS and JavaScript, no build step. Served locally
with `python3 -m http.server 8765`; GitHub Pages deploys `master` (git@github.com:wjsrobertson/thai.git).
Used mostly on an iPhone (installed to the home screen, or in Safari) and in Firefox on Linux.

## Read first

- **docs/implementation-notes.md:** what's been built and why, a section per change. Read the parts
  that touch your work, and add to it with every change.
- **docs/style-guide.md:** sizes, positions, type and colour, with the standards behind them (Apple
  HIG, WCAG 2.2). Follow it for anything on screen, and run its checklist before calling UI done.
- **docs/thai-writing.md:** the mistakes AI-written Thai keeps making. Check every Thai line you
  write or approve (stories, cards, phrases) against it.

## Working here

- Work on `master`; branch only when asked. Commit each finished change as you go (unless told
  otherwise at the time); push only when asked.
- It's in development: topic ids, card keys and saved progress or settings can change freely.
- No installs (`sudo`, `npm`/`pip install`, `apt`, `npx … install`) without asking each time. If a
  tool is missing, say so rather than installing it.
- Reusable dev tools (builders, checkers, merge scripts) go in `tools/`, never a session scratchpad:
  the story builder was lost when one was wiped (2026-10-11). The scratchpad scripts the notes
  name are gone; don't go looking for them.
- Phones are 390–430 wide; iPhone SE widths (320, 375) aren't supported. Test heights 664 (Safari
  with its bars), 763 (installed) and 844.
- Colours come from the theme tokens on `:root` in styles.css (five themes); never hard-code one.
- Comments say why, often with the date and whose call it was; keep to that.

## Data (data/decks.json)

Edit stories with `tools/stories.py`. After changing cards or stories, run in order:

1. `python3 -u tools/audit_decks.py --errors`
2. `python3 -u tools/stories.py check` (and `sync`; `export` / `add` for stories)
3. `node tools/spelling.mjs --write`
4. `python3 -u tools/gen_audio.py` (edge-tts; recordings are named by a hash of what's said)
5. `python3 -u tools/word_timings.py`, if story lines changed

A topic holds at most 25 cards, and every word in a story needs a topic card. Commit only the new
mp3s that `data/audio/manifest.json` refers to. The voice's known misreadings are respelt in
`spoken_text()` (tools/gen_audio.py); a new one goes there.

## Other parts

- **Offline:** `sw.js` caches the files in its `SHELL` list; bump `SHELL_CACHE` when that list changes.
- **Handwriting model** (Write → From memory): `tools/train_writing.py` builds
  `data/write-model.bin` from Burapha-TH, which lives outside the repo
  (~/Development/datasets/burapha-th). Its terms are research and education use, not commercial,
  citing the paper; the app ships only the weights and credits it in Settings → About.
- **Layout checks:** `python3 -u tools/check_layout.py` (the server on :8765; about 10 minutes,
  phones then a 1280x800 screen; then `390x664 390x844 --text-size 2`) is expensive: run it only for
  changes likely to have moved or resized something (CSS, sizing code, new rows or controls), not
  for every fix (the user's call, 2026-10-20). Report what fails. It checks everything the user has
  asked to line up, match or stay put; the list is in docs/implementation-notes.md, "What lines up".
  A new request of that kind gets a check there too.
- **Screenshots and UI tests:** headless Chromium scripts in ~/snap/chromium/common/learnthai-shots-out
  (built from `read_one.py`). Chromium can only read files under ~/snap/chromium/common.
  If the snap won't start ("transient scope could not be started"), run its binary directly:
  `/snap/chromium/current/usr/lib/chromium-browser/chrome --no-sandbox --headless=new …`.
