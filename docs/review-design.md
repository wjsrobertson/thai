# Review flow design

Agreed on 2026-10-05; **phase 1 was built the same day** (see "Today review and scheduling" in
`implementation-notes.md`). The research behind it is summarised under "Why" below. The build is in
four phases; implementation details go in `implementation-notes.md` as each phase lands.

## Decisions

- **Today** is the landing tab.
- **New cards** get multiple choice for their first one or two goes, then switch to recall and
  self-grading.
- **Existing Leitner progress** is converted into rough FSRS starting points (it could have been
  dropped, since progress never needs preserving).
- **15 new cards a day** is the default.
- **No personal notes field:** the user didn't want one.

## Why (research summary)

- **Recall beats recognition** ("testing effect", Roediger & Karpicke 2006; Dunlosky et al.
  2013). Multiple choice is recognition.
- **Spacing:** Cepeda et al. 2006/2008. The FSRS scheduler gets the same retention as older
  methods with fewer reviews; it is Anki's default.
- **Successive relearning** (Rawson & Dunlosky): repeat a missed item in the same session until
  it's right once, then space it.
- **Same-category words interfere when learned together** (Tinkham 1993, Waring 1997, Nation
  2000). So new cards are mixed across decks.
- **Production needs its own practice**, so each direction is scheduled separately.
- **Saying words aloud helps** ("production effect", MacLeod et al. 2010).
- **Varied speakers and minimal pairs train tone perception** (Wang et al. 1999).
- **Learn high-frequency words first** (Nation).

## 1. Progress model

- **An item is one card in one direction:** `th>en` (understanding) and `en>th` (producing).
  `en>th` unlocks once `th>en` has been recalled correctly after a gap of at least a day.
- **Progress is global, not per deck.** It's keyed by `cardKey` + direction, so a word that
  appears in several decks is learned once.
- **FSRS state per item:** stability, difficulty, due, last review, reps, lapses, and a learning
  stage. Desired retention is a setting (default 90%).

## 2. Screens

- **Tabs:** `Today | Decks | Wordlist`. Decks is the old Flashcards view.
- **Today** shows the due and new counts, a Start button, where new cards come from, and a
  forecast (the forecast was later dropped as noise). Phase 2 adds the streak and phase 3 the tone trainer.
- **A review card has three steps:**
  1. **Recall:** "Say it aloud, then tap Show".
  2. **Reveal:** translit, meaning, note and audio.
  3. **Grade:** Again / Hard / Good / Easy, each showing its next interval.
- **en>th fronts** play no audio, so the answer isn't given away; the audio plays on reveal.
- **New cards** start with multiple choice for their first one or two goes.

## 3. A session

1. **Due reviews first,** weakest first, mixed across all decks.
2. **New cards** are mixed in, up to the daily limit (15), drawn across decks with at most 5 from
   any one deck a day.
3. **Missed items come back** 5–8 cards later until right once, then FSRS schedules them.
4. **End screen:** reviewed, accuracy, new words learned, due tomorrow.

Deck Test mode answers update the same items; Learn (flip) mode doesn't.

## 4. Start here path (phase 2)

New cards come from a frequency-ordered path: survival basics, then the spoken Top 500, with
core words from other decks woven in. Other sources: a single deck, or all decks started.

## 5. Tone trainer (phase 3)

- **Minimal-pair sets,** about 40 of them, heard and picked by ear.
- **Two voices:** each word plays at random in Niwat's or Premwadee's voice.
- **Scoring:** it has its own score, not FSRS.

## 6. Example sentences (phase 4)

An optional example sentence with audio on the back of the card, then gap-fill items, starting
with the spoken Top 500.

## 7. Settings

- **Removed:** interval presets, queue mode and "Again" mode.
- **Added:** desired retention, new cards per day, maximum reviews per day, both directions,
  and the say-it-aloud prompt. Typed answers come in phase 3.
- **Kept:** Test card order and auto-progress, for deck Test mode.

## 8. Phases

1. **Core:** item model, FSRS, Today tab, recall and grading, in-session relearning, both
   directions, end screen, Leitner conversion.
2. **Start here path,** due badges in the picker, streak and forecast.
3. **Tone trainer** (Premwadee audio) and typed answers.
4. **Example sentences and gap-fill.**
