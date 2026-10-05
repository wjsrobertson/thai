# Implementation notes

How learnthai is built and why. It's a personal Thai-learning site: single user, browser-only,
served from localhost. There's one section per feature; update them in place when things change.

## Constraints

These come from the user; don't break them without asking.

- No build step, no framework, no backend dependencies.
- No installs (`sudo`, `npm`/`pip install`, `apt`) without explicit approval. If tooling is
  missing, say so rather than installing it.
- Central Thai is the default. Dialect content lives in its own category, with a deck-level
  `dialect` field, and is never mixed into Central decks. Southern Thai was added on 2026-10-03
  at the user's request; Northern and Isaan are not planned.
- **Study progress never needs preserving** (user, 2026-10-05: "We don't need to worry about
  progress on existing decks. Not ever"). Restructure, rename, merge or delete decks and cards
  freely.

## Running

```bash
python3 -m http.server 8765    # from the project root, then open http://localhost:8765/
```

It must be served over HTTP, not `file://`, because `app.js` fetches `data/decks.json` and
`data/audio/manifest.json`.

**Live site:** https://wjsrobertson.github.io/thai/ is served by GitHub Pages from `master` (root,
with `.nojekyll`). Every push to `master` deploys within a minute or two. The git remote is
`git@github.com:wjsrobertson/thai.git`.

```
index.html            all markup
styles.css            all styles
mobile.css            phone overrides (see Phone layout)
app.js                all JS (ES module)
sw.js                 service worker (see Offline & install)
app.webmanifest       web app manifest; icons/ holds its icons
data/decks.json       all vocabulary
data/audio/           generated MP3s + manifest.json (see Audio / TTS)
tools/gen_audio.py    audio generator (dev-time only)
tools/phone_shots.py  phone-size screenshots via headless Chromium (dev-time only)
docs/                 these notes
```

## Content — `data/decks.json`

```jsonc
{ "decks": [ { "id": "greetings", "category": "Basics", "group": "optional", "name": "…", "description": "…",
  "cards": [ { "thai": "สวัสดี", "translit": "sà-wàt-dii", "english": "hello / hi", "note": "optional" } ] } ] }
```

A card can also have an optional `say`: what the Thai voice reads instead of `thai` (see
Audio / TTS → Generator).

- Edit and reload; new categories appear in the deck picker automatically, in file order.
- **`group` (optional)** nests decks one level deeper in the picker: category → group → deck.
  Use it to split long lists, for example "Spoken Top 500" as 10 decks of 50. Decks sharing a
  `group` within a category form one collapsible block, placed where the first of them appears.
  Keep each deck to about 50 cards or fewer.
- **New or changed content isn't done until it has audio:** run `tools/gen_audio.py` (the user
  expects this without being asked).
- **Card identity is `cardKey()` = `${thai}::${english}`.** Changing either text resets that
  card's progress. That's acceptable: see Constraints.
- Adding optional fields is fine; restructuring the file breaks the app and the curated content.
- **The file is hand-formatted:** one card per line, 2-space indent. Rewrite it in that style
  (not `json.dump(indent=2)`) so diffs stay readable.
- As of 2026-10-05 there are 6578 cards in 231 decks across 37 categories.

**Writing cards.** Match the existing style:

- **Transliteration** is Paiboon-style:
  - vowels: ɔ, ɛ, ʉ, ə; long vowels doubled (`aa`, `ii`)
  - tones: à á â ǎ (mid tone unmarked)
  - consonants: ก = g, ป = p, ต = t, จ = j; aspirated sounds are kh, th, ph, ch
  - spacing: hyphens between syllables of a word, spaces between words
- **Consistency:** the same Thai should have the same transliteration in every deck, so check
  against existing cards. App conventions: ไม้ is `máai` and ช่าง is `châng`; น้ำ is mixed
  (`náam`/`nám`).
- **Content:**
  - Notes are short and practical: a literal meaning, an everyday second sense, or a usage
    pattern.
  - Within a deck, `thai` and `english` must each be unique, because Test-mode distractors are
    drawn from the same deck.
  - Each deck needs at least 3 cards.
  - **Keep Thai script out of `english`** and put it in the note instead. An English gloss
    containing Thai gets read by the Thai voice (see Audio / TTS → Voices).
    The 2026-10-02 merge moved bracketed Thai, like "(cutesy จังเลย)", into notes automatically.

**Mathematics and Science** were added on 2026-10-02.

- **Mathematics** (10 decks) runs from Arithmetic up to Calculus, Linear Algebra, and Logic,
  Sets & Proof, plus two statistics decks (Descriptive; Probability & Inference).
- **Science** has 9 decks: Method, Forces & Energy, Heat/Temperature/Pressure, Electricity/Light/
  Sound, Chemistry, Biology, Body Systems, Astronomy and Earth Science.
- **Related additions:** Numbers was extended from 0–10 up to a billion (plus ordinals and Thai
  digits), and "Comparing & Quantities" went into **Grammar** rather than a science category, at
  the user's request.
- **Two vocabularies:** advanced maths often has an official Royal Institute coinage and a
  classroom loanword (ปริพันธ์ / อินทิกรัล). Both are included where both are in real use.
- **Groups**, also added 2026-10-02 (deck IDs and progress unchanged):
  - Mathematics: Foundations, Advanced, Statistics
  - Science: Physics, Life Sciences, Earth & Space; Method and Chemistry stay ungrouped

**Spoken Thai, Slang, and Swearing & Insults** were added on 2026-10-02 (889 cards, 22 decks),
built from `research/` (see that section).

- **Spoken Thai → "Top 500 Spoken Words"** (group) is 10 decks of 50 in subtitle frequency
  order.
  - **Duplicates are allowed** (user's call): many words also have cards in other decks.
  - **Removed:** character-name fragments, letters and abbreviations, plus a few ambiguous
    syllables (มิ, ชิ, นา, ลา…) and a duplicate spelling (มั๊ย).
  - **Kept with a note:** words inflated by translated films, like พระเจ้า, ที่รัก and ข้า.
  - **Grammar words** get an example in the note.
  - **Other Spoken Thai decks** are ungrouped: Casual Particles (complements Grammar → Polite
    Particles), Interjections, and Spoken Contractions (each note gives the written form).
- **Slang:** Everyday Slang, Internet & Gen Z, and LGBTQ+ Slang (ศัพท์เทย). The Gen-Z
  entries will date quickly.
- **Swearing & Insults:** Rude Pronouns & Particles, Curses & Intensifiers, Insults, Sex & Body,
  Slurs, and Film & Dubbing Insults.
  - **Chosen from the slang lexicon, not by frequency**, because subtitles soften real profanity.
  - **Every note starts with a strength:** Mild / Medium / Strong / Very strong, plus who it's OK
    with.
  - **Court rulings:** insults Thai courts have ruled unlawful (per Sanook's list of 16) say so.
  - The user explicitly wanted very offensive terms included, slurs too.

**Crime & Law** was added on 2026-10-02 (338 cards, 11 decks).

- **Groups:**
  - "Crimes": Violent Crime, Theft & Burglary, Scams & Fraud, Drugs/Gambling/Vice, Corruption &
    Organised Crime
  - "Police & Courts": Police & Investigation, Courts & Law, Prison & Punishment
  - Ungrouped: Reporting a Crime (whole phrases a victim needs), Traffic Offences, Crime Slang
- **Facts to recheck over time:**
  - Emergency numbers: police 191, Tourist Police 1155, ambulance 1669.
  - Cannabis: decriminalised in 2022 and tightened since.
  - Casinos are illegal.
  - Article 112 carries 3–15 years per count.
  - The last execution was in 2018.
- **Crime Slang sources:** mostly the slang lexicon's Wiktionary entries (ซิว, เป่า, กินข้าวแดง,
  บัญชีหนังหมา, พิซซ่า = ม.112…). Drug slang came from a single Pantip thread, so only terms
  that were also well established were used.

**Grammar → Prepositions & Small Words** (45 cards) sits after Connectors & Conjunctions.

**Medicine** was added on 2026-10-02 (373 cards, 13 decks). It complements Health & Doctor,
Body Parts and Body Systems; duplicates are allowed.

- **Groups:**
  - "At the Doctor": Symptoms & Describing Pain; Talking to the Doctor (the doctor's lines are
    marked in notes); Formal vs Everyday Words (the formal word is the card, the everyday one is
    in the note)
  - "Pharmacy": Medicine & Labels (how to read Thai dosing labels); Thai Traditional Medicine
  - "Hospital": Hospital & Departments, Medical Staff, Costs/Insurance/Paperwork, Dentist & Optician
  - "Conditions": Illnesses & Diseases, Injuries & First Aid, Mental Health, Pregnancy & Sexual Health
- **Facts to recheck over time:**
  - Mental-health hotline 1323.
  - Abortion: legal on request to 12 weeks, and to 20 with counselling.
  - Rabies shots after any dog or cat bite.
  - Vinegar for box-jellyfish stings.
  - About a million อสม. (village health volunteers).

**Big expansion, 2026-10-02** (859 cards, 28 decks; only 2% repeat a Thai word from older
decks, by design).

- **Reorganised** (deck IDs unchanged, so progress is kept):
  - House & Home moved from Daily Life to the new **Home** category.
  - Cooking & Recipes moved from Culture to **Food & Drink**.
- **Home**, with groups:
  - "Rooms": Kitchen, Bathroom, Bedroom, Living Room, Garden & Outside
  - "Housework & Repairs": Laundry & Cleaning, Repairs & Tools, Renting & Utilities
- **Food & Drink** gained Thai Dishes, Fruit & Vegetables, Meat/Seafood & Ingredients, Tastes &
  Ordering, and Drinks & Desserts.
- **Culture** gained Ghosts & Superstition, Life Events, Royal Language (ราชาศัพท์), and Idioms &
  Proverbs. For idioms, the English is the meaning and the note gives the literal image.
- **Money & Finance** (new, placed after Travel): Banking & Payments, Investing & Trading.
  Shopping & Money stays in Travel.
- **Politics & Military** (new, placed after Crime & Law), with groups:
  - "Politics": Government & Parliament, Elections & Protest
  - "Military": Modern Weapons, Traditional Thai Weapons, Armed Forces & Ranks, War/Coups &
    Conflict
- **Single decks:** Activities → Football & Sport, Travel → Driving & Scooters, Practical →
  Computing & Programming.
- **Facts to recheck over time:**
  - VAT has been 7% for years.
  - 13 successful coups since 1932, the last in 2014.
  - 20 constitutions.
  - Conscription draw each April (red card = serve).
  - Royal news at 8 pm.
  - The royal anthem plays before cinema screenings.

**Vehicles** was added on 2026-10-05, after Travel (144 new cards, 5 new decks).

- **Groups:**
  - "On the Road": Driving & Scooters (moved from Travel), Types of Vehicle, Car Parts,
    Motorcycle Parts
  - "Air & Sea": Aircraft, Ships & Boats
- **No word appears twice in Vehicles.** Car Parts leaves the controls (brake, clutch, steering
  wheel, mirrors, lights) to Driving & Scooters.

**Home → Appliances & Gadgets** was added on 2026-10-05 (32 cards, ungrouped, after House &
Home). It covers the appliances the room decks lacked:
- Kitchen: dishwasher, toaster, coffee machine, freezer, induction hob, cooker hood, hotpot.
- Water: hot-water flask, water dispenser and filter.
- Around the home: hairdryer, robot vacuum, sewing machine, doorbell, torch.
- Mosquitoes: the electric racket and repellent.
- Using them: switch on/off, timer, broken, warranty, power-hungry, the No. 5 energy label.

**Eleven categories added on 2026-10-05** (1211 cards, 48 decks). The user asked for everything
on a brainstormed list except History.

- **Thai Values & Etiquette** (after Culture): Thai Values, Etiquette & Taboos, Hierarchy & Forms
  of Address.
- **Describing People** (after People & Life): Appearance, Personality (the ขี้- family),
  ใจ Words (50 cards), Compliments & Criticism.
- **Dating & Relationships:** Dating & Flirting, Being a Couple, Marriage & Family Life, Jealousy
  & Break-ups. Wedding ceremony words stay in Culture → Life Events.
- **Errands & Services** (after Travel):
  - "Shops & Deliveries": At 7-Eleven, Delivery & Ride Apps, Post Office & Parcels, Phone & SIM
  - "Personal Services": Hair & Beauty Salon, Massage & Spa, Tailor & Repairs
- **Visas & Paperwork:** Immigration & Visas (90-day report, TM30, work permit), Government
  Offices & Forms, ID & Documents.
- **Work & Careers** (after Money & Finance):
  - "Getting a Job": Jobs & Professions, Job Hunting & Interviews
  - "At Work": Work & Office (moved from People & Life), Business & Meetings, Email & Formal
    Phrases
  - Ungrouped: The Economy
- **Education:** School & Classroom, School & University Subjects, Exams & Grades, University &
  Studying Abroad.
- **Activities** gained More Sports and Games & Esports. Five sports already in Gym were left out
  of More Sports.
- **Nature & Environment** (after Food & Drink): Plants & Trees, Thai Flowers, Landscapes,
  Environment & Pollution (PM2.5, burning season), Floods & Natural Disasters.
- **Places & Geography:** Regions & Provinces; Countries, Nationalities & Languages; Bangkok &
  Transit.
- **News & Media:** Reading Thai News (headline verbs like เผย, ชี้, ซัด, ปัด), TV & Lakorn, Film,
  Social Media & Influencers.
- **Talking About Language** (after Grammar): Asking About Words, Grammar & Linguistics Terms
  (including the tone names), Reading & Writing, Thai Literature & Poetry.

**How duplicates were handled:**
- No Thai word appears twice within a category; that check includes the old decks in Activities
  and Work & Careers.
- 156 cards repeat a word from another category, e.g. the core ใจ words that are also in Emotions.
  That's allowed.
- Older duplicates inside Activities (แพ้, กรรมการ, ว่ายน้ำ) were left as they were.

**Translit fixes made on the way:**
- Home → รีโมท `rii-mòot` → `rii-móot`.
- Music → ไม้กลอง → `máai-glɔɔng`.
- New cards whose Thai already existed took the existing transliteration.

**Music** was added on 2026-10-05, after Activities (356 cards, 15 decks).

- **Groups:**
  - "Instruments": Thai Instruments, Western Instruments, Learning an Instrument
  - "Theory": Notes, Scales & Chords; Rhythm & Reading Music
  - "Singing & Songs": Singing & the Voice, Genres & Thai Styles, Describing Music, Love-Song
    Words
  - "The Music Scene": Making & Performing Music; Concerts, Festivals & Fan Culture; Listening &
    Audio Gear; The Music Industry
  - "Thai Traditions": Thai Music Traditions & Folk Forms, Dance & Thai Performing Arts
- **No Thai word appears in two Music decks.** Hobbies still has song, music and "to sing".
- **The playing verb depends on the instrument:** Thai Instruments opens with ดีด / สี / ตี / เป่า
  (pluck / bow / strike / blow). Western instruments take เล่น.
- **Science → Electricity, Light & Sound** gained 11 acoustics cards: pitch, amplitude, loudness,
  decibel, speed of sound, medium, resonance, ultrasonic waves, noise, soundproof and acoustics.
  The user didn't want a separate acoustics deck.
- **Translit fix:** Interjections → กรี๊ด was `grìit`. A mid-class consonant with ๊ is high tone,
  so it's now `gríit`.

**Animals** was added on 2026-10-05, after People & Life (268 cards, 12 decks). It replaced People
& Life → Animals (31 cards), whose cards were spread across the new decks.

- **Groups:**
  - "Kinds of Animal": Pets, Farm Animals, Wild Animals, Birds, Sea & River Life, Reptiles &
    Amphibians, Insects & Pests
  - "Talking About Animals": Animal Words (classes, male/female, the classifier ตัว,
    conservation), Animal Body Parts, Animal Sounds (onomatopoeia and the verbs), Animal Actions
  - Ungrouped: Thai Zodiac Years (ปีชวด…ปีกุน, plus ปีนักษัตร, ปีชง and "what year were you
    born?")
- **No Thai word appears in two Animals decks.** Duplicates with other categories are fine, e.g.
  Food (crab, shrimp), Beach and Thai Script.
- **Notes flag slang senses:** ควาย, หมู, แรด, ชะนี, งูเห่า, ปลาไหล, หอย, นกเขา, แมงดา. The water
  monitor card is its polite name ตัวเงินตัวทอง; the note explains why เหี้ย is avoided.
- **เขา "horn"** is transliterated khǎo, its written tone. The pronoun เขา is kháo, as spoken. The
  validation flagged this, and it's deliberate.

**Southern Thai** was added on 2026-10-03 and sits after Slang. It has 171 cards in 7 decks:
Fruit, Food & Plants; Everyday Words; Phrases; Time, Amounts & Questions; People & Personality;
Home & Everyday Things; and Southern Idioms.

- **Batch 2** (107 cards) came mostly from a 108-word "ภาษาใต้วันละคำ" blog list and a Postjung
  thread. Its sources are tagged per row in `research/dialects/southern.tsv`.
- **Two gloss errors** in the summariser's output were corrected using their Central
  equivalents: หวัก is a ladle (ทัพพี), not "buttocks"; เปรว is a cemetery (ป่าช้า), not "wild
  tamarind".

- **Dialect field:** each deck has `"dialect": "southern"`. The app ignores the field; it's for
  the data.
- **Notes** give the Central equivalent ("Central: มะม่วง.").
- **Source:** `research/dialects/southern.tsv` (about 60 words from Wiktionary, PSU, MuslimThaiPost,
  tidjor, Learn Thai with Mod and Midtown Ratsada).
  - Only glosses with agreement or a strong source were kept.
  - Phuket Hokkien words (โก่ปี้, กิ้ดเหล้ง) are marked as such.
- **Audio uses the Central voice**, so the tones are Central, not Southern. Each deck description
  says so, and the user accepted this. Transliterations follow the Thai spelling.

**Thai Script** was added on 2026-10-03, right after Basics (185 cards, 12 decks).

- **Groups:**
  - "Consonants": Mid Class, High Class, Low Class — Paired, Low Class — Sonorants, and All 44
    Consonants (alphabet order, for mixed review)
  - "Vowels": Short & Long Vowels, Diphthongs & Special Vowels, Vowels Before a Final
  - "Tones & Reading": Tone Marks & Symbols, Tone Rules, Final Consonant Sounds, Clusters & Odd
    Spellings
- **Consonant cards:**
  - The card is the bare letter; `translit` is its name (gɔɔ gài).
  - `english` is the sound plus the word in the name ("g — chicken"), which keeps the glosses
    unique (there are six th letters).
  - The note gives the class and the final sound.
  - `say` is the name, spelled with a plain same-sound letter (ฃอ ขวด → ขอ ขวด) so the voice
    can't stumble.
- **Vowel cards:** written on อ as a placeholder (อะ, เอีย). The audio is the sound itself.
- **Mark cards:** shown on a dotted circle (◌่), with `say` as the mark's name. They render
  correctly in Chromium, but haven't been checked on iPhone.
- **Rule decks** (Vowels Before a Final, Tone Rules, Final Consonant Sounds, Clusters & Odd
  Spellings): each card is an example word, `english` names the rule, and the meaning is in the
  note.

## Views

The tabs are **Decks | Wordlist | Review**, and the app always opens on Review (see "Today review
and scheduling" below).
- **Internal ids:** Review's view id and code still say `today` (`renderToday`, `#today-section`,
  `.today-only`). Decks is the old Flashcards view, with view id `flashcards`.
- **History:** the user renamed Today to Review and moved it to the end on 2026-10-05.

**Decks** shows one card at a time. The corner buttons (position pill, 🔊, flip) exist on
*both* faces, so they rotate with the card when it flips. The controls row holds:

- The **deck picker**, a modal with collapsible categories and optional collapsible groups
  inside them, search, and per-deck progress.
  - **On every open,** only the current deck's category and group are open, and the current deck
    is scrolled to the centre (`openDeckPicker`). Group headers show the deck count and combined
    progress.
  - **Accordion** (since 2026-10-05): opening a category closes the other open category, and
    opening a group closes the other groups in that category (`pickerHeader`). What you open
    lasts until the picker closes; reopening starts from the current deck again.
  - Search matches deck name, description, category and group, and opens everything that
    matches.
  - `pickerModel()` builds the tree as plain data; the render functions only draw it.
- The **direction** toggle (Thai→English / English→Thai), which sets the language on the front.
- The **mode** toggle, Learn / Test. Internally these are `practice` / `test`; legacy pref values
  are migrated in `init()`. Learn has no scoring and flips freely.

**Wordlist** shows the deck as a sortable, filterable table. "Show first" puts the Thai or
English column first, and each row has a 🔊 button. "Read all" walks the visible (filtered and
sorted) rows, highlighting and scrolling to the current one. A view or deck change cancels it.

Keyboard: Space flips, `P` plays, ←/→ navigate.

## Test mode

1. The front shows the question; three answer pills sit below the card.
2. Two distractors come from the same deck, chosen deterministically (`buildLearnTrial`): an
   FNV-1a hash of `deckId::cardKey::seen::direction` seeds a Mulberry32 PRNG. A card shows the
   same pills until its `seen` count changes.
3. A correct answer turns green, flips the card and rates it `good`. A wrong answer turns your
   pick red and the right answer green, flips the card and rates it `again`. Flipping is blocked
   until the card has been answered.
4. Pills then lock. Going back with ‹ shows the locked state: you can flip but can't re-answer.
   The locked state is `state.learnAnswers`, which is session-only and cleared on reload or deck
   change. The SRS result persists.
5. By default the card waits after you answer: Next is disabled until then, and pulses once
   you've answered.
   - **"Test card auto-progress"** (`settings.learnAutoProgress`) is `'off'`, `'always'` or
     `'correct'`. `'correct'` advances by itself after a right answer but waits after a wrong one,
     so you can study it. It's the default since 2026-10-05; before that the default was `'off'`.
   - **Timing:** advancing happens after `learnPauseMs`, default 1500 ms. It was 3000 until
     2026-10-03, then 1000 until 2026-10-05.
   - **Changed defaults reach old saves through `migrateSettings()`.** Settings are saved in
     full, so a save made before a default changed still holds the old value. Each entry in
     `SETTINGS_MIGRATIONS` moves the old default to the new one: 3000 → 1000 → 1500 ms, and
     `'off'`/`false` → `'correct'`. It runs once per browser and is recorded in
     `store.settingsMigrations`, so a value the user picks afterwards sticks. (The first version
     of the pause fix ran on every load, which would have undone a deliberate 3000.)
   - **Old saves:** they stored a boolean, which `autoProgressMode()` maps (true → `'always'`,
     false → `'off'`).
   - **Decision:** `shouldAutoAdvance()` makes the call.

6. **End of a round** (2026-10-05): at the end of a pass, `advance()` calls
   `showRoundSummary()` instead of wrapping straight back to card 1. It shows the score (from
   `state.learnAnswers`), the percentage and the missed cards (with 🔊), plus a Start again button
   (Enter, Space or → also work).
   - **The next round is set up when the summary opens:** answers are cleared and the queue is
     rebuilt. Before this, wrapping round showed every card already answered.
   - **Leaving the summary:** `renderCard()` hides it. So Start again, picking a deck, or
     changing direction or mode all leave the summary for a fresh round.
   - **Learn mode** never reaches this: Next stops at the last card.

## Today review and scheduling (2026-10-05)

Phase 1 of `docs/review-design.md`. It replaced the per-deck Leitner boxes.

**Items.** Progress is per **item**: one card (`cardKey`) in one direction, `th-en` or `en-th`.
Items live in `store.items[`<cardKey>##<dir>`]`, global across decks, so a word in several decks
is learned once.
- **Fields:** `s` stability (days), `d` difficulty, `due`, `last`, `reps`, `lapses`, `mc`/`mcOk`
  (multiple-choice answers / was the last right), `rc` (recall answers), and `u` (th-en only: the
  en-th item is unlocked).
- **Unlock rule:** `u` is set when th-en is graded Hard or better at least about a day after its
  previous review (`gradeItem`).

**FSRS.** Uses FSRS-5 with the default `FSRS_W` parameters (`scheduleItem`; pure, so the grade
buttons can preview it).
- **Two update rules:** a review under a day after the last one uses the same-day stability rule;
  later reviews use the forgetting curve.
- **Again:** due in 10 minutes and requeued in-session.
- **Otherwise:** due in `round(interval(S, retention))` days, at least 1.
- **Desired retention** is a setting (default 0.9).

**Today** (`planReview` → `startReview`):
- **The Review screen** shows only the due and new counts and Start. Under the card, a table
  breaks the session down by category, biggest first (`renderTodayBreakdown`; a due item counts
  under the deck it's reviewed in). A Tomorrow / next 7 days
  forecast line was removed on 2026-10-05 as noise.
- **Due items** are everything due by the end of the study day (days roll over at 4 am), weakest
  (lowest retrievability) first, capped by `maxReviews` minus today's `rv`.
  - They come from all decks.
  - Settings → "Due reviews from: Current deck only" (`reviewScope`) limits them, and "due tomorrow",
    to items whose card is in the current deck (`reviewDeckId`).
  - The heading says which: "55 due across all decks / in Time of Day", "14 new mixed from your
    decks / from Time of Day". The user was confused when "New cards from: Current deck only"
    still showed due words from other decks.
- **New items** come from the `newPerDay` budget minus today's `n`:
  - English → Thai items for unlocked words take up to half the budget, oldest unlock first.
  - Then new words in deck order, round-robin across the current deck plus every "started" deck
    (any deck with a word that has an item). That's at most `NEW_PER_DECK` (5) per deck per day
    first, then relaxed to fill the budget.
  - Settings → Daily review → "New cards from" can limit this to the current deck. Today then
    shows the deck button (the `today-deck` class on `.stage`), in the same place as on Decks.
    The same happens with "Due reviews from: Current deck only". It's hidden during a session.
- **New items** are spread evenly through the reviews.

**A card in the session:**
- **Mode:** a new item is multiple choice, with a second MC go only if the first was wrong; after
  that it's recall (`reviewMode`).
- **Recall:** the front says "Say it aloud, then tap Show" (setting). Show reveals the answer, and
  four grade buttons show each grade's next interval.
- **Audio:** th-en plays the Thai on the front. en-th plays nothing until the answer is shown,
  which fixed the old English-first giveaway.
- **Requeue:** an MC answer always earns a recall go 5–8 cards later, and Again requeues until
  it's right once (`recordGrade`).
- **End screen:** cards reviewed, % right, new count, due tomorrow, and the missed list.
- **Keys:** Enter/Space show the answer or continue, 1–4 grade, and 1–3 pick an MC answer.

**Daily counters** live in `store.daily[dayKey]` (`g` gradings, `ok`, `n` new, `nd` new per deck,
`rv` due reviews), and only the last 60 days are kept.

**Deck mode now uses items too.**
- **Test answers** are graded `good`→3 / `again`→1 as MC (`saveDeckRating`). A first answer there
  counts against the day's new budget.
- **`mergeProgressIntoCards`** gives each card `dueAt`/`seen` from the item for the current
  direction. It also gives a `box` derived from stability (`boxForStability`) for
  `boxWeightedQueue`.
- **Switching direction** re-reads progress and starts a new round.
- **Picker "known"** means th-en stability ≥ 10 days.
- **Leitner conversion** (`migrateLeitnerToItems`, once, recorded as `fsrs-items`):
  - every Leitner card with `seen > 0` became a th-en item: box 1–5 → stability 1/3/7/14/30
    days, the due date kept, `rc: 1` (so no multiple choice), and `u` for box 2+
  - `store.decks` was deleted
- **Removed:** queue mode, interval presets, Again mode and the migration policy. Deck Test mode
  always runs due first, then study-ahead.

**Store cache:** `loadStore()` caches the parsed store (items are read on every card). The
`storage` event drops the cache if another tab writes.

**Checked in headless Chromium:**
- a fresh-profile session: 15 new cards, MC → recall, a forced miss requeued and passed, the end
  screen, and "All done"
- intervals: first-day Good 4d, and three days later Good 8d / Easy 19d
- the conversion from an old Leitner save
- deck Test answers saving items
- the unlock rule (two days' gap unlocks, three hours doesn't)
- the both-directions setting
- settings, wordlist and Learn mode, with no JS errors and no overflow at iPhone sizes

**Test card order** (`settings.testOrder`, added 2026-10-05; deck Test mode) is `'random'` (the
default) or `'deck'`.
- **With Smart order on,** due cards come first, then study-ahead. Random means shuffled due
  cards, then `boxWeightedQueue()`.
- **Learn mode** is always deck order.
- **A rebuilt queue is a new round** (`rebuildCurrentQueue()`): changing mode, direction, Smart
  order or Test card order clears Test answers. An answer still waiting for Next is saved first.

## Storage and settings

Everything lives in localStorage under `learnthai:v1`:

- `.settings` is merged over `DEFAULT_SETTINGS` in `getSettings()`, so a new setting gets its
  default for existing users automatically.
- `.prefs` holds the current deck, direction, mode, view and so on.
- `.items[cardKey##dir]` holds review progress, and `.daily[day]` the daily counters (see Today
  review).

The settings modal (gear icon, top right) is searchable through each group's `data-search`
keywords. Its sections are App, Display, Daily review, Deck mode, Audio and Reset.
- **Accordion** (since 2026-10-05): the sections start closed, and opening one closes the others.
- **Searching** opens every section with a match, and clearing the search closes those again
  (`data-search-opened`).

**Text size** (Display, added 2026-10-03) has five steps, -2 to 2, and `TEXT_SCALES` maps them to
0.8, 0.9, 1, 1.15 and 1.3.

- **How it works:** `applyTextSize()` sets the `--fs` CSS variable on `<html>`. It runs first
  thing in `init()`, so text never jumps size on load.
- **What scales:** content `font-size`s are written `calc(<size> * var(--fs, 1))`. That covers
  cards, Test-mode answers, the wordlist, the deck picker and settings.
- **What stays fixed:** the top bar, tabs, segmented controls, deck button and icon buttons, so
  the layout can't break.
- **Phone details:**
  - Inputs use `max(16px, …)`, because iOS zooms into anything smaller.
  - The card's height grows with `--fs`, so the longest card (เหี้ย, about 175 characters) still
    clears the corner buttons at the largest size.
- **Default:** step 0 is the size the user picked on 2026-10-03, after notes and descriptions
  went from 12–13px to 14–16px.

**To add a setting:**

1. Add a default to `DEFAULT_SETTINGS`.
2. Add a `.setting-group` with `data-search` in `index.html`.
3. Add the element to `els`.
4. Set its value in `renderSettings()`.
5. Add a listener in `bindSettings()`.

---

## Audio / TTS (2026-10-02)

Thai and English audio are **pre-generated neural-voice MP3s**, made with
[edge-tts](https://pypi.org/project/edge-tts/) and stored in `data/audio/`. Browser
`speechSynthesis` is the fallback, and a setting switches back to it entirely.

### Why edge-tts

- Browser `th-TH` TTS is robotic and gets tones wrong.
- Earlier candidates were Forvo (needs an API key, 500 req/day, per-word only) and local models
  (XTTS-v2, F5-TTS, Piper; all need installs, some a GPU).
- edge-tts was already installed (anaconda base `python3`, v7.2.8), needs no API key, and uses
  Microsoft's Azure neural voices. User listened to tone minimal sets (ใหม่/ไหม/ไม้/ไม่,
  ข้าว/ขาว/เข้า, มา/ม้า/หมา) and approved.
- **Caveat:** it uses the unofficial Edge "Read Aloud" endpoint, which can break or get blocked
  without warning. Because samples are generated once and kept, only *new* cards depend on it
  still working.

### Voices

| Use | Voice | Notes |
|---|---|---|
| Thai | `th-TH-NiwatNeural` (male) | Reliable: 0 failures across ~1000 requests. |
| English | `en-GB-SoniaNeural` (female) | User wants British, not US. Others: Ryan, Thomas (m), Libby, Maisie (f). |
| English gloss containing Thai script | `th-TH-NiwatNeural` | The en-GB voice silently drops Thai script. Applies to 2 cards: "formal version of เถอะ", "just (variant of เพิ่ง)". User OK with Niwat's accented English **only** for these. |

`th-TH-PremwadeeNeural` (the only other Thai voice) fails intermittently with
`NoAudioReceived`: 8 of 12 tone-test requests failed, some still failing after 3 retries. Avoid
it.

### Generator — `tools/gen_audio.py`

```bash
python3 -u tools/gen_audio.py            # generate whatever is missing (run after editing decks.json)
python3 -u tools/gen_audio.py --prune    # also delete samples no card references any more
python3 -u tools/gen_audio.py --help     # --th-voice, --en-voice, --rate, --jobs, --attempts
```

- **Output:** `data/audio/<sha1(voice|rate|spoken text)[:16]>.mp3`, plus `data/audio/manifest.json`:
  `{ "th": {voice, rate, files: {<card.thai>: <file>}}, "en": {…, files: {<card.english>: <file>}} }`.
  Keys are the exact card strings, so the app looks up `c.thai` / `c.english` directly and never
  needs to hash anything.
- **Voice and rate are in the hash.** Changing either regenerates everything rather than mixing
  voices; run with `--prune` to drop the old files. Editing a card's text likewise produces a new
  file and orphans the old one.
- **Text rewriting** (`spoken_text`), only where reading the card verbatim sounds wrong. The
  checks compared clip lengths against a spelled-out version of the same text.
  - **English alternatives:** `a / b` → `a, b`, because the voice otherwise runs alternatives
    together with no pause. `yes/no` → `yes or no`.
  - **English symbol-only brackets** like `(≠)`, `(≥)`, `(∀)` and `(∃)` are dropped, because the
    voice reads the symbol out as well (about +1 s each). Brackets containing letters or numbers,
    such as `(x²)`, `(H₀)`, `(½)` and `(π)`, read fine and stay.
  - **Thai digits** (๐–๙) become 0–9. Niwat all but skips Thai digits (0.6 s for the ten digits,
    against 2.2 s as words) but reads Arabic digits in Thai.
  - **Thai `555`** (internet laughter) becomes `ห้า ห้า ห้า`. Read as a number, it came out as
    "five hundred and fifty-five" (0.95 s, the same length as ห้าร้อยห้าสิบห้า).
  - **Left as-is** because they read fine:
    - English `+ − × ÷ =`, `...`, `4 — four` and ranges like `1–4 pm`
    - Thai ๆ, read as a doubled word
    - Thai `พ.ศ.`, read as an abbreviation
    - Thai `ถ้า...ก็`, which gets a pause
- **Card `say` field (2026-10-03):** an optional `say` replaces what the Thai voice reads, while
  the manifest stays keyed by `card.thai`. Thai Script uses it so that a lone letter or mark is
  read by its name (ก → กอ ไก่, ◌่ → ไม้เอก). The app's browser-TTS fallback reads `say` too
  (`sayText` in `app.js`). The generator warns if one `thai` string ends up with two `say` values.
- **Robustness:** up to 5 attempts per sample with exponential backoff. Files are written to
  `.part` then renamed, so the server never serves a half-written file. The manifest is rewritten
  in a `finally`, so a Ctrl-C'd run still leaves a usable manifest; just re-run to finish.
- **Size** (2026-10-02, after the big expansion): 3744 unique Thai + 4013 unique English
  strings = 7757 files, ~99 MB (~12 KB each); the whole project is ~105 MB,
  ~1 s per request.

### App side (`app.js`)

- **Setting:** `settings.audioSource`, either `'samples'` (default) or `'browser'`. It's under
  Settings → Audio → **Voice**. The help text shows per-language coverage (e.g. "Thai 975 of 975"),
  which is a quick way to tell whether the generator needs re-running.
- **Loading:** `loadAudioManifest()` is fetched alongside `decks.json` in `init()`. A missing or
  broken manifest gives empty maps, so everything falls back to TTS and nothing breaks.
- **Playback:** `speakAndWait(text, lang)` plays the sample when the setting is `samples` and the
  manifest has the text. If there's no sample, or the file fails to load, it falls back to
  `ttsAndWait()` (browser TTS).
- **Stopping:** there's one shared `Audio` element (`sampleAudio`). `finishSample` holds the
  resolver for the in-flight playback, and `stopAudio()` (used by `speak()` and `stopReadAloud()`)
  pauses it and resolves the pending promise, so the Read-all loop can't hang when stopped
  mid-word. `stopAudio()` also cancels TTS.
- **Preloading:** `selectDeck()` calls `preloadDeckAudio()`.
  - **What it fetches:** the deck's Thai clips, then its English clips, four at a time, held as
    blob URLs in `sampleCache`.
  - **Playback:** `playSample()` plays the blob through `cachedSampleUrl()`, so a played clip never
    waits on the network.
  - **Cancelling:** a new deck aborts the previous preload, and the browser-voice setting turns
    preloading off.
  - **Memory cap:** an LRU cache of 600 clips (about 7 MB, roughly six decks); removed clips have
    their blob URLs revoked, except the one currently loaded in the player.
  - **Tests:** 11 Node checks against stub fetch and URL functions.
- **Thai speed:** `settings.thaiSpeed` is a multiplier from 0.5 to 1 (default 1), set under
  Settings → Audio → Thai speed. Changing it plays the current card as a preview.
  - Samples use `playbackRate`, which the browser applies without lowering the pitch. Loading a
    new `src` resets `playbackRate` to `defaultPlaybackRate`, so `playSample()` sets both.
  - Browser TTS uses `utterance.rate = 0.9 × thaiSpeed`; 0.9 was the existing Thai baseline, so
    behaviour at 1× is unchanged.
  - English is always 1×.
  - Below ~0.7× the stretching can sound warbly. If so, generate slower samples instead with
    `gen_audio.py --rate -30%`; that sounds more natural but is fixed per run.
- **Autoplay:** if the browser blocks autoplay (`NotAllowedError` before the first user gesture),
  playback resolves silently with no TTS fallback, because TTS would be blocked too.
- **What plays where:**

  | Trigger | Audio |
  |---|---|
  | Navigating to a flashcard; card 🔊 button; `P` key | Thai |
  | Wordlist row 🔊 | Thai |
  | Wordlist "Read all" | Thai, then English if "Speak English too" is on |

### Testing

No browser automation is available (no installs, see Constraints). The playback logic (the TTS
section of `app.js`, run as-is) was exercised in Node against stub `Audio`/`speechSynthesis`
objects. The 20 checks covered:

- sample vs fallback, and per-language lookup
- the browser setting
- stopping mid-sample
- a broken file, and blocked autoplay
- interrupting one playback with another
- Thai speed, for samples (surviving the `src` reset) and for TTS That
harness lived in the session scratchpad and wasn't kept. As of 2026-10-02 it had **not** been
click-tested in a real browser.

### Known gaps / ideas

- **English→Thai flashcards auto-play the Thai on navigation,** which gives away the answer. This
  predates the TTS work: `renderCard()` calls `speak(c.thai)`. Since 2026-10-04 it only does so
  while the Flashcards view is showing, because picking a deck from the Wordlist re-renders the
  hidden card and used to play it. `init()` sets the saved view before `selectDeck()` for the
  same reason.
- English is only spoken in Read-all; flashcards have no English audio.
- Thai speed is a single global setting; there's no per-deck speed and no quick toggle on the
  card itself.

---

## Frequency & slang research (2026-10-02), `research/`

This work feeds new decks; it isn't part of the app. Raw corpora aren't kept. The script
docstrings say where to download them.

**`research/slang/`** is a slang lexicon of 2045 Thai forms (404 offensive, 886 slang, 755
colloquial), built by `combine.py` and stored as `lexicon.json` / `.tsv`.

- **Wiktionary:** `wikt.py` pulls 18 Thai categories (slang, vulgarities, offensive, derogatory,
  internet slang, particles, interjections and others), 1816 entries with definitions. Wikimedia
  rate-limits anonymous API use (HTTP 429), so the script is serial, waits 1.5 s between
  requests, and backs off 60 s or more after a 429.
- **Web lists:** `web_*.txt` were hand-copied from about 13 learner, swearing, Gen-Z and
  LGBTQ+-slang pages; each file names its sources.
  - Their transliterations are unreliable, for example the ค่ะ/คะ tones are swapped on one page,
    so write fresh ones for cards.
  - Some sites refused (403), or the fetch tool's summariser declined to list profanity.
- **Register is coarse.** Wiktionary tags a whole word if any sense is slang, so common words
  like มัน, บ้าน and หมอ come out as "offensive". Count a term as genuine slang only if a web list
  sourced it or it's rare in written Thai (TNC count < 300).

**`research/freq/`** is spoken-Thai frequency, made by `subs.py` from the OpenSubtitles 2018 Thai
list (hermitdave/FrequencyWords).

- **Noise is removed before counting:**
  - mis-decoded UTF-8 (`เธ…`)
  - Latin text
  - subtitle credits
  - stray marks
- **Splitting phrases into words:** entries are space-separated *phrases*, so each is split into
  words with a unigram model over TNC words plus the slang lexicon. TTC and deck words are left
  out on purpose: their compounds (ไม่มี, ทำอะไร) don't match TNC's word boundaries and would
  distort the spoken-vs-written comparison.
- **Result:** 30.8M tokens, 28k words, with 0.1% left unrecognised. `subs_words.tsv` gives each
  word's rank, its TNC rank, `speech_skew` (spoken rate ÷ written rate, or `speech-only`), its
  lexicon register, and whether it's already in a deck.
- **Caveats:**
  - **The source is translated films (translationese).** พระเจ้า, โอ้, ที่รัก, เฮ้ and the archaic
    ข้า rank high.
  - **Subtitles soften swearing** into dubbing-style insults: ไอ้บ้า, สารเลว, ไอ้เวร, ระยำ,
    งี่เง่า. Real street profanity ranks low (เหี้ย #2890, ควย #9080, สัส #10769). Use the
    lexicon rather than frequency to choose slang and swear words.
  - **Names and fragments** pollute `speech_skew` at low written counts. Only compare words with
    a TNC count of at least 100.
- **Deck coverage:** our decks give their own card to 54% of the spoken top 100, 42% of the top
  500 and 25% of the top 2000.

---

## Phone layout (2026-10-03), `mobile.css`

`mobile.css` is loaded with `media="(max-width: 600px)"` after `styles.css`, so desktop is
untouched. It fixes what made the app cramped on iPhone:

- **Sideways overflow:** the controls bar didn't wrap, so the page was 502px wide on a 390px
  screen. Now the deck button gets its own row and the two toggles share the next.
- **Flashcard layout:**
  - `.card-row` uses `display: contents` inside a grid, so the card spans the full width, the
    answer pills sit below it, and prev/next sit under the thumb.
  - The card is `clamp(240px, 42vh, 380px)` tall instead of 16:9.
  - The corner buttons shrink from 72px to 48px, so they no longer cover the word.
- **Wordlist:** each table row becomes a grid card (text stacked on the left, 🔊 on the right).
  The header row stays as a compact sort bar.
- **Modals:** the deck picker and Settings become full-screen sheets; the deck rows
  drop the progress bar.
- **iOS details:**
  - Inputs are 16px, because iOS zooms into anything smaller.
  - `touch-action: manipulation` removes double-tap zoom and the tap delay.
  - Tap highlights are off.
- **Sheet scrolling on iOS (fixed 2026-10-03):** Settings stopped scrolling after opening a
  group, closing, and reopening. The fix had four parts:
  - **No auto-focus on touch screens:** opening a modal no longer focuses its search box
    (`TOUCH_SCREEN`). On iOS, focusing an input inside a fixed sheet shifts the page underneath.
  - **Page lock:** `html.modal-open` locks the page while any modal is open (`setModalOpen()`, used
    by all four open/close functions).
  - **Sheet sizing:** the sheet is sized `height: 100%` of the fixed `.modal`, not `100dvh`, which
    can disagree with it on iOS.
  - **Scroll containment:** `.modal-body` has `overscroll-behavior: contain` and `min-height: 0`.

  Settings also reopens scrolled to the top. Chromium can't fake touch scrolling in headless mode
  (synthetic swipes move nothing, even the plain page), so this was checked with wheel scrolling
  only. It still needs confirming on a real iPhone.
- **Sideways drift in sheets (2026-10-03):** a slightly diagonal swipe dragged the Settings content
  sideways. Two causes, both fixed:
  - **The sheets could pan sideways.** `.modal-body` now has `overflow-x: hidden;
    touch-action: pan-y pinch-zoom`.
  - **Something was a few pixels too wide.** Safari can size a `<select>` by its longest option.
    The setting rows are now `minmax(0, 1fr)` and the selects are `min-width: 0; max-width: 100%`.
    The hidden "Days per box" row also counted, because `.custom-intervals { display: flex }`
    overrode `[hidden]`; `styles.css` now has `.custom-intervals[hidden] { display: none; }`.

  The custom-interval inputs are now 16px too. This is also unconfirmed on a real iPhone.
- **Not covered:** iPhone landscape (844px wide) uses the desktop layout. There's no swipe
  navigation.

**Checking it:** `tools/phone_shots.py` drives headless snap Chromium through its DevTools
protocol, using a tiny stdlib WebSocket client because Node 18 has no WebSocket.

- It emulates iPhone 14 (390×844) and SE (375×667) and screenshots Learn, the card back, Test,
  Wordlist, the picker and Settings.
- It prints the page's `scrollWidth`; anything over the viewport width is sideways overflow.
- It uses a throwaway profile under `~/snap/chromium/common/`, deleted afterwards, and stops with
  an error if the app doesn't load.

---

## Offline & install (2026-10-04)

The app installs to the home screen and works offline. It needs HTTPS (or `localhost`), so it
works on the GitHub Pages site but not over `http://192.168.0.239`.

- **Install:**
  - On iPhone, a website can't trigger installation; it only happens through Share → Add to Home
    Screen. Settings → App → Install shows those instructions on iOS.
  - In Chrome (Android and desktop), the same spot shows a real Install button, driven by
    `beforeinstallprompt`. The iOS check comes first, because Chromium fires the event even
    with an iPhone user agent.
  - The user didn't want a first-visit banner.
- **`sw.js`:**
  - **App files** (page, code, styles, `decks.json`, the audio manifest, icons) are
    network-first, revalidating with `cache: 'no-cache'` and falling back to the cache when
    offline or after 4 s. So pushes show up on the next load. They're precached on install, in
    `learnthai-shell-v1`.
  - **Audio** is cache-first in `learnthai-audio`. Clip names are content hashes, so a cached
    clip never goes stale.
  - **Byte ranges:** Safari's `<audio>` requests byte ranges and won't play a plain 200, so
    `rangeResponse()` answers a `Range` header with a 206 sliced from the cached file.
- **Offline audio** (Settings → App):
  - Every clip that passes through the worker is cached, and `preloadDeckAudio()` fetches a whole
    deck, so opening a deck saves its audio.
  - **"Download all audio"** fetches the rest with 6 workers and a progress bar, and calls
    `navigator.storage.persist()`.
    - **Resumable:** cached clips are skipped.
    - **Stop** clears `settings.offlineAudio`.
    - **Delete downloaded audio** clears the cache.
- **Keeping the cache in step** (`syncOfflineAudio()` on every load):
  - It deletes cached clips that the manifest no longer lists.
  - If `offlineAudio` is set, it downloads any missing clips, so new cards' audio arrives
    automatically.
- **Storage on iOS:** since iOS 17, a site's quota is a share of free disk, so 107 MB is fine.
  Safari's 7-day storage wipe doesn't apply to Home Screen apps.
- **Checked in headless Chromium** against a private server on :8766, which was then killed,
  because CDP's offline emulation doesn't cover the worker's own fetches:
  - The worker takes control and precaches 12 shell files.
  - Opening a deck caches its clips.
  - Download-all: 8,271 clips in 15 s from localhost.
  - A `Range: bytes=0-1` request gets a 206.
  - Stale clips are pruned.
  - With the server dead: reload, card text, audio playback and switching decks all work.
  - **Not yet tried on a real iPhone.**
- **Icons:** a gold ก (Noto Looped Thai Bold) on the app's dark gradient, drawn with Pillow.
  They're full-bleed squares, because iOS rounds the corners itself, and the glyph sits inside
  the maskable safe zone. Files: 512, 192, 180 (apple-touch-icon) and a 32px favicon.

## Backlog

- **End-to-end click-through.** There's no test suite. Try every mode × direction, the wordlist,
  settings and reset, including the new audio.
- **More decks.** The user often asks for specific topics.
- **Persist Test-mode locked answers across sessions?** They're session-only at the moment.
- **English→Thai auto-play** in deck mode still gives away the answer (Today's review doesn't).
