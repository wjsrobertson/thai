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
app.js                all JS (ES module); imports spell.js
spell.js              spelling a Thai word aloud: school method and letter names (see Spelling)
sw.js                 service worker (see Offline & install)
app.webmanifest       web app manifest; icons/ holds its icons
data/decks.json       all vocabulary
data/audio/           generated MP3s + manifest.json (see Audio / TTS)
tools/gen_audio.py    audio generator (dev-time only)
tools/phone_shots.py  phone-size screenshots via headless Chromium (dev-time only)
tools/audit_decks.py  content audit of decks.json; exits 1 on errors (dev-time only)
tools/spelling.mjs    spelling coverage report; writes data/spelling-parts.json (dev-time only)
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
  Use it for long lists, for example "Spoken Top 500" as 25 topics of 20. Decks sharing a
  `group` within a category form one collapsible block, placed where the first of them appears.
- **Topic size: about 20 cards, never over 25** (the user's rule since 2026-10-06; bigger topics
  are a pain to study). Split a growing topic along real sub-themes and name the parts
  "Topic: Sub-theme" when the sub-theme alone wouldn't say which topic it is.
- **`formerIds` (optional, on a topic):** old topic ids it replaces. The app resolves a saved current
  topic through them, so splitting or regrouping topics doesn't strand anyone. When splitting,
  give the first part the original id instead.
- **New or changed content isn't done until it has audio:** run `node tools/spelling.mjs --write`
  (spelling parts) and then `tools/gen_audio.py` (the user expects this without being asked).
- **Card identity is `cardKey()` = `${thai}::${english}`.** Changing either text resets that
  card's progress. That's acceptable: see Constraints.
- Adding optional fields is fine; restructuring the file breaks the app and the curated content.
- **The file is hand-formatted:** one card per line, 2-space indent. Rewrite it in that style
  (not `json.dump(indent=2)`) so diffs stay readable.
- As of 2026-10-06 there are 6649 cards in 373 topics across 22 categories (see Topic list order
  and Topic splits).

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
  - **Same word, same meaning → reuse the exact existing `english`.** Card identity is
    `thai::english`, so "above / upstairs" and "upstairs / above" are two cards. You'd review the
    word twice, and a ✓ in one topic wouldn't show in the other. A genuinely different sense
    (เข่า "knee" vs "knee (strike)") should stay a separate card.
  - **Alternatives are written "a / b"** with spaces, not "a/b" or "a, b". Fixed terms like
    "yes/no" are fine.
- **Run `python3 -u tools/audit_decks.py` after content changes.** It exits 1 on errors (always
  fix: duplicates within a topic, Thai typing slips, Thai in `english`, "a/b" slashes, the same
  meaning worded differently) and lists judgement calls under "Worth a look". Add `--errors` for
  errors only. Known intentional cases are allowed in the script (เขา's two transliterations).
- **Audit, 2026-10-06** (now `tools/audit_decks.py`; the fixes were scratchpad `decks/merge16.py`):
  - **Folded:** 40 same-meaning glosses worded differently (order, commas, plurals). Each word kept
    an existing wording, so no new audio was needed.
  - **Rewritten:** two English glosses that contained Thai (พึ่ง, เถิด), with the Thai moved to the
    note, and five "a/b" slashes.
  - **Clean:** the audit found no Thai typing errors, no duplicates within a topic, and nothing
    structural.
  - **Left alone on purpose:** broader vs narrower glosses (mostly the multi-sense Spoken Top-500
    cards), different senses of one word, the plain example meanings in Tone Rules and Final
    Consonant Sounds notes, and notes that differ by topic.

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

- **Spoken Thai → "Top 500 Spoken Words"** (group) is 25 topics of 20 in subtitle frequency
  order (10 of 50 until 2026-10-06; see Topic splits).
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

**Topic list order, 2026-10-06** (scratchpad `decks/merge17.py`). The list had grown in the order
things were added: 37 categories, beginner material scattered (Survival #28, Grammar #26), many
two- or three-topic categories, and the middle level used only by big categories. The user asked
for Talking About Language early and a review of the order and hierarchy.
- **Now 22 categories**, from beginner essentials to specialist. Small categories became groups
  in bigger ones, so nothing is nested deeper than category → group → topic:
  1. Basics (First Words, Everyday Words, Time & Date)
  2. Talking About Language
  3. Thai Script
  4. Grammar
  5. Spoken Thai
  6. Slang & Swearing
  7. Southern Thai
  8. People & Relationships
  9. Culture & Values
  10. Food & Drink
  11. Home
  12. Shopping & Errands (Shopping, Services, Money, Visas & Paperwork)
  13. Getting Around (Travel, Places, On the Road, Air & Sea)
  14. Work & Education
  15. Health & Medicine (Health & Doctor joined At the Doctor)
  16. Nature & Animals
  17. Sport & Leisure (with TV, Film & Social Media)
  18. Music
  19. News & Politics (News, Politics, Military)
  20. Crime & Law
  21. Mathematics
  22. Science
- **Moves:**
  - Thai Literature & Poetry went to Culture & Values.
  - Common Adjectives went to Basics; Weather to Nature & Animals; Clothing and Negotiation &
    Bargaining to Shopping; Hobbies to Sport & Leisure; The Economy to News & Politics.
  - Categories that already had their own groups (Thai Script, Spoken Thai, Home, Music, Crime &
    Law, Mathematics, Science, Medicine) kept them.
- **Only `category`, `group` and file order changed;** topic ids, names and cards didn't, so
  progress and Review are untouched.
- **A new user now starts on Greetings & Politeness,** the first topic in the file (it was Time of
  Day).
- **The history paragraphs below use the category names of their time.**

**Topic splits, 2026-10-06** (scratchpad `decks/splits.py`, applied by `decks/merge18.py`). The
user found topics over ~20 cards a pain. Every topic over 25 cards was split, by hand, along real
sub-themes, so nothing is now over 25.
- **The numbers:** 130 topics became 272; there are 373 topics in all. Parts are 12–22 cards,
  averaging about 16.
- **Naming:** parts are named for their content, prefixed with the old topic when needed, for
  example "Family: Parents & Children" or "Body: Head & Upper Body".
- **Where parts go:** each part stays in the old topic's category and group. The first part keeps
  the old topic's id.
- **Spoken Top 500** was regrouped by rank into 25 topics of 20: "Spoken 1–20" and so on. Each new
  topic lists the old ids it absorbed in `formerIds`, on the topic holding the old one's first
  word.
- **Cards are unchanged:** exactly the same cards, only regrouped. Progress is per card, so
  nothing is lost.
- **Checks:** the merge script checks that every card is placed exactly once, part sizes, unique
  names and ids, and no duplicate Thai or English within a part.

**Register ladders, 2026-10-06** (+39 new cards, +32 existing cards shared into these topics).
The user asked for slang and casual versions beside the polite words, starting with pronouns and
people. A shared card is copied exactly from its other topic (same `cardKey`, progress and audio).
Script: scratchpad `decks/merge15.py`.
- **Pronouns & People** (13 → 46) was rebuilt as a ladder from formal to rude:
  - I: ข้าพเจ้า, กระผม, ผม, ดิฉัน, ฉัน, ชั้น, หนู, เรา, ข้า, อั๊ว, กู
  - you: ท่าน, คุณ, เธอ, ตัวเอง, นาย, แก, ลื้อ, มึง, พวกคุณ, ทุกคน
  - he/she/they/we: เขา, เค้า, หล่อน, มัน, พวกเรา, พวกเขา, พวกเค้า
  - people: formal ชาย, หญิง, สุภาพบุรุษ, สุภาพสตรี; หนุ่ม, สาว, วัยรุ่น; ผู้สูงอายุ (polite) vs
    คนแก่ (blunt); เพื่อนซี้; ฝรั่ง, ชาวต่างชาติ
  - Each note says who uses the word with whom.
- **Family:** ป๊า, หม่าม๊า; คุณพ่อ, คุณแม่; บิดา, มารดา (forms); บุตร; ผัว, เมีย, คู่สมรส; and plain
  gaps: พี่น้อง, ลูกพี่ลูกน้อง (cousin), ลูกคนโต, ลูกคนเล็ก.
- **Greetings & Politeness:** หวัดดี, ดีจ้า, ว่าไง, ขอบใจ, แต๊งกิ้ว, โทษที, บ๊ายบาย, ไปก่อนนะ, ฝันดี, จ้า.
- **Second pass:**
  - Common Verbs: รับประทาน, แดก (beside กิน, ทาน)
  - Shopping & Money: ตังค์
  - Bathroom: ห้องน้ำ, สุขา (beside ส้วม)
  - Body Parts: ศีรษะ, พุง, ก้น, ตูด. หน้าอก was skipped because อก is already there.
  - Life Events: ตาย, เสียชีวิต, ถึงแก่กรรม, ม่องเท่ง, ซี้แหงแก๋
- **เขา's two transliterations are deliberate:** kháo for the pronoun (as it's said), khǎo for horn
  or mountain.

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

The app opens on a **Home** page: three cards (Flashcards, Wordlists, Review), each with a short
description. Flashcards and Wordlists show the current deck ("Topic: Time of Day"), and Review shows today's due/new counts
(`renderHome`).
Tapping "Learn Thai" (top left) returns there. No tab is selected on Home. It was added on
2026-10-05 at the user's request; before that, the app opened on Review.

The tabs are **Flashcards | Wordlists | Review** (see "Today review and scheduling" below).
- **Internal ids:** Review's view id and code still say `today` (`renderToday`, `#today-section`,
  `.today-only`). Flashcards has view id `flashcards`, and Wordlists `wordlist`.
- **History:**
  - 2026-10-05: the user renamed Today to Review and moved it to the end.
  - 2026-10-06: Decks went back to being called Flashcards (tab, Home card, the Settings section
    that was "Deck mode") and Wordlist became Wordlists.
  - 2026-10-06: a set of words is now called a **topic** on Home ("Topic: Time of Day") and
    throughout Settings: "All topics" / "Current topic only", "Reset current topic" (since removed), the reset
    dialogs, and the Test card order option "List order" (was "Deck order"). The same day the rest
    of the UI followed: the picker ("Choose a topic", "Search topics…", "3 topics" counts, "No
    topics match"), Review's "across all topics" / "mixed from your topics", and the empty and
    load-error messages. No "deck" is left on screen. The code, the data (`decks.json`), element
    ids and setting values still say deck; Settings groups that mention it accept both words in
    search.
- **Phone top bar:**
  - **Spacing:** tabs 7px side padding, 5px at 380px or less; 4px gaps; no letter-spacing on the
    title. At 340px or less, the title is 14px and the tabs 12px.
  - **Spare width:** in Chromium it's ~30px at 390px, 27px at 375px and 8px at 320px. iOS's
    system font is wider. With only 9px spare after the Flashcards rename, the bar was a few px
    too wide on the user's iPhone, so every page could pan sideways.
- **No pull-down bounce:** `html, body { overscroll-behavior: none }` (iOS Safari 16+) stops the
  rubber-band pull and pull-to-refresh. The page background also has a solid `var(--bg)` under its
  gradient; without it, anything showing past the edge, such as a bounce on older iOS, was the
  browser's default white.
- **No sideways panning:** `html, body { overflow-x: clip }`, with a `hidden` fallback on html for
  iOS before 16. It's a safety net, so anything a pixel too wide is clipped instead of pannable.
  `clip` doesn't create a scroll container, so the sticky top bar still works (checked).

**Flashcards** shows one card at a time. The corner buttons (position pill, 🔊, flip) exist on
*both* faces, so they rotate with the card when it flips.

**Auto-play follows the Thai** (2026-10-06):
- **Thai → English:** moving to a card plays its Thai.
- **English → Thai:** moving to a card stays quiet, since the sound would give the answer away. The
  Thai plays when the card is flipped to it, or when a Test answer reveals it.
- **An answered Test card** opens on its Thai back, so moving to it plays the Thai.

**Moving on from a flipped card** jumps straight to the front, with no animation
(`setFlipped(false, { instant: true })` in `renderCard`, using `.card.no-anim`). Before
2026-10-06 it flipped back with the animation after the new text was in, so the next card's
answer showed for about the first 140ms of the turn. Flips you make yourself still animate.

The controls row holds:

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

**Wordlists** shows the topic as a sortable, filterable table, and each row has a 🔊 button. Which
column comes first, Thai or English, is the Settings → Wordlists "Show first" setting
(`settings.wordlistFirst`). It moved off the page on 2026-10-06; an English choice saved in the
old `prefs.primaryCol` carries over once. "Read all" walks the visible (filtered and
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
- **Two update rules:** a review on the same study day (`dayKey`, 4 am rollover) as the last one
  uses the same-day stability rule; later reviews use the forgetting curve.
- **Again:** due in 10 minutes and requeued in-session.
- **Otherwise:** due in `round(interval(S, retention))` days, at least 1.
- **Desired retention** is a setting (default 0.9). 95% roughly halves every interval.

**Changes to plain FSRS (2026-10-06).** The user found the defaults far too long, for example
"Hard 10d". That came from an old Leitner box-3 word converted to S = 7. FSRS counts Hard as a
success, so even a new word rated Hard every time went 3 → 5 → 7 → 10 → 13 days.
- **Hard means "only just":** the interval is at most 1.2× the last gap, and at least a day more
  than it. The last gap is the interval the item was given, or the time since its last review if
  longer (reviewed late). S is lowered to match, so later reviews start from it too.
- **A correct multiple-choice answer is scheduled as Hard** (`scheduleItem(…, { mc })`, from
  `gradeItem`'s `mode`). That covers Flashcards Test mode and Review's first goes. Picking from
  three is recognition, so the first real recall check is the next day, not in 3.
- **Same-day repeats don't lengthen the gap.** On the same study day, the short-term update can
  only lower S (Again, Hard). A correct multiple-choice repeat, such as another Test round, leaves
  the item unchanged. Before, each same-day Good multiplied S by about 1.4, so four right answers
  in one day meant 9 days.
- **Effect on a new word** (one correct MC answer, then rated the same each time it's due):

  | Each time | Plain FSRS | Now |
  |---|---|---|
  | Hard | 3 → 5 → 7 → 10 → 13 days | 1 → 2 → 3 → 4 → 5 days |
  | Good | 3 → 11 → 35 → 101 days | 1 → 3 → 9 → 25 → 64 days |

- **Carried-over Leitner progress** still holds the generous converted S, so an old box-3 word
  shows Hard 8d. The user was advised to use Settings → Reset (now "Reset all progress"), since old progress
  doesn't need keeping.

**The Review icon** marks every "add to Review" control: "Add all to Review", the button on each
Wordlists row, and the corner button on a Flashcards card. Words already in Review show ✓
instead.
- **What it is:** Home's 🔁 redrawn as a line SVG (`reviewIcon()`, `.review-icon`) in the text
  colour. The emoji itself was too colourful next to the muted controls; the Home card keeps the
  emoji, beside 📖 and 📋.
- **Built with `lineIcon(cls, viewBox, d, label)`,** which the → arrows use too.

**What Review covers** (Settings → Daily review → "Adding to Review", `settings.newSource`; since
2026-10-06):
- **"Only words I add" (`manual`, the default)** covers only the words in `store.reviewWords`
  (`{ cardKey: addedAt }`).
  - **Review starts empty,** with a note on how to add words; the Home card says "Nothing added
    yet". The `review-manual` settings migration moved both automatic values to manual, and the
    user chose to start from an empty set.
  - **Ways to add:**
    - **"Add to Review…" on a deck Test round's score screen** opens a dialog of that round's
      words (`state.lastRound`).
      - Nothing is ticked at first; All / Missed only / None pick quickly.
      - Words already in Review are shown ticked and greyed out.
    - **Wordlists: a Review button on each row, left of the speaker** (`.row-review`): the Review
      icon, or a green ✓ once added. Tapping it toggles and shows a toast naming the word.
      - It's a plain icon with no border, so it reads as less important than the speaker.
      - History: a bordered + button there first looked as important as the speaker. On
        2026-10-06 it was replaced by press-and-hold (click with a mouse) opening a strip under
        the row. That was removed the same day, at the user's request, in favour of this button.
      - "Add all to Review" is in the toolbar.
    - **🔁 in the top-right of a Flashcards card,** in Learn and Test mode (`updateReviewToggle`;
      Test mode since 2026-10-06). It becomes ✓ once added,
      and tapping it again takes the word out.
  - **There's no daily limit:** every added word that hasn't started yet shows up as new straight
    away, in the order added.
  - **Words already answered** in deck Test mode keep that progress: a miss is due within about
    10 minutes, a correct answer the next day (multiple choice counts as Hard; see "Changes to
    plain FSRS").
  - **The ✕ in the breakdown** takes words out of the set (`setInReview(keys, false)`) and keeps
    their progress, so re-adding carries on.
- **Automatic (`started` / `current`)** is the earlier behaviour: every word with progress, new cards
  drawn from started decks or the current deck within "New cards per day", and ✕ deleting
  progress (`reviewExcluded` / `reviewExcludedCards`).
- **`reviewFilter()`** is the single test both modes go through, used by `planReview` and
  `dueTomorrow`.

**Today** (`planReview` → `startReview`):
- **The Review screen** shows only the due and new counts and Start. Under the card, a table
  breaks the session down by category, biggest first (`renderTodayBreakdown`; a due item counts
  under the deck it's reviewed in).
  - **Each row's ✕** (`removeCategoryFromReview`, no confirm: the user didn't want one) does two
    things:
    - It deletes the items reviewed under that category, so they aren't due today or later.
      Words shared with a kept category stay with that one.
    - It adds the category's decks to `store.reviewExcluded`. New cards don't come from those
      decks, and due items skip them when choosing their deck.
  - **Why:** for decks the user was only trying out.
  - **Single words:** tapping a category row expands its words for today, one category at a time
    (`state.breakdownOpen`). Each word shows its Thai, translit, English and whether it's due or
    new, plus a ✕.
    - `removeWordFromReview` deletes the word's items (both directions) and adds its `cardKey` to
      `store.reviewExcludedCards`, which `planReview` skips for due and new.
    - Answering the word in deck Test mode brings it back.
  - **Bringing a deck back:** answering one of its cards in deck Test mode removes it from the
    list (`saveDeckRating`). "Current deck only" ignores removals, and Reset all progress clears
    them. A Tomorrow / next 7 days
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
    shows the deck button (the `today-deck` class on `.stage`), in the same place as on Flashcards.
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

**Flashcards (deck Test mode) now uses items too.**
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
keywords. Its sections are App, Display, Daily review, Flashcards (was "Deck mode"), Wordlists,
Audio, Confirmations and Reset. Search doesn't look at section names, so each Flashcards group has
"flashcards" in its `data-search`.
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

**Confirm dialog** (`confirmDialog`, 2026-10-06): the app's one confirm component, a small
centred card on every screen size (mobile.css turns the other modals into full-screen sheets).

- **Call:** `await confirmDialog({ title, message, confirmLabel, cancelLabel, setting, danger })`
  resolves `true` for the confirm button, `false` for Cancel, the backdrop or Escape. `message`
  can hold `\n` line breaks. Focus starts on the confirm button, so Enter confirms.
- **`danger`** (for what can't be undone): a red confirm button, and focus starts on Cancel so
  Enter doesn't confirm. No `setting` with it: these always ask.
- **"Don't ask again":** with `setting` (a boolean setting, `true` = ask), the dialog shows the
  checkbox. Ticking it and confirming sets the setting to `false`; ticking it and cancelling
  changes nothing. While the setting is `false`, the call resolves `true` straight away.
- **To add one:**
  1. Add the setting (default `true`) to `DEFAULT_SETTINGS`.
  2. Add a checkbox with `data-confirm-setting="<name>"` to Settings → Confirmations.
     `renderSettings` and its listener handle every such checkbox, so no `els` entry is needed.
  3. Call `confirmDialog({ …, setting: '<name>' })`.
- **Uses:**
  - **Wordlist "Add all to Review"** (`confirmAddAll`): "Add all 22 words in <deck> to Review?",
    or "Add the 3 words in <deck> that aren't in Review yet?" when some already are.
  - **Settings → Reset** (`danger`, always asks): "Reset all progress?", "Reset the Review list?"
    and "Reset all settings?".
    A toast confirms when it's done (this replaced the browser's `confirm()` / `alert()`).
    - **"Reset current topic" was removed** on 2026-10-06 at the user's request.
    - **"Reset Review list"** empties `store.reviewWords` (the "Only words I add" list) and keeps
      progress, so re-adding a word carries on. With nothing in Review it just says so. The
      Settings order is: progress, Review list, settings.
    - **"Reset settings"** clears `store.settings`, so every value falls back to `DEFAULT_SETTINGS`.
      It keeps `offlineAudio`, so downloaded audio stays downloaded. It then re-renders what
      settings drive directly, without redrawing the card, which would play its word.
  - **Settings → App "Delete downloaded audio"**: not `danger`, since clips download again as
    they're played. A toast confirms.
  - **Wordlist "✓ All in Review"** (`confirmRemoveAll`): once the whole deck is in Review, the same
    button removes it all: "Remove all 22 words in <deck> from Review? Your progress on them is
    kept." With a mouse, hovering it reads "− Remove all" (both labels share one grid cell, so the width
    doesn't change).

**Toast** (`toast(message, { ms, tone })`, 2026-10-06): a pill at the bottom of the screen that
fades in, then out after `ms` (default 2000). A new one replaces any still showing. It's
`role="status"` (read out by screen readers), ignores taps (`pointer-events: none`), and sits above
the "new version" bar when that's showing. `tone: 'good'` makes it green.
- **Uses:**
  - **The 🔁 / ✓ on a Flashcards card:** "✓ Added to Review" / "Removed from Review". It doesn't
    name the word, since that could give away the side of the card not yet seen.
  - **Wordlists:** the row button ("✓ Added เวลา to Review" / "Removed เวลา from Review") and
    the whole-deck button ("✓ Added 22 words to Review" / "Removed 22 words from
    Review"). These name the word, since it's on screen anyway.

**Arrows** (2026-10-06): every → shown in the UI is an inline SVG (`.arrow-icon`), not the →
character, which some fonts draw noticeably low.
- **Static text** uses the SVG in `index.html`. Text set from JS goes through
  `textWithArrows(el, text, { caps })`, including content from `decks.json`: topic descriptions
  (picker, Wordlists heading) and card notes (card back, Wordlists, Review). 8 descriptions and 2
  notes contain → as of 2026-10-06.
- **Centring:** `vertical-align: middle` centres it on lowercase letters; `.caps` centres it on
  capitals, for the "EN→TH" tag in Review's word breakdown. Measured within 0.3px of centre
  everywhere.
- **Screen readers** read it as "to" (`role="img" aria-label="to"`). The Settings → Confirmations
  one is `aria-hidden`.
- **The one exception** is the "Next (→)" tooltip, since a `title` can't hold markup.

---

## Spelling (2026-10-06), `spell.js`

Every word and phrase card shows its spelling on the card back. A spell-aloud button (ก with sound
waves, `spellIcon()`) reads it aloud.
- **On the card:** bottom centre, between 🔊 and ⟳.
  - It's always on the back.
  - It's on the front only in Thai → English mode, where the front shows the Thai (added
    2026-10-06 at the user's request). In English → Thai mode the front is English, and spelling
    the Thai there would give the answer away.
- **In Wordlists:** on each row, between the Review button and the speaker.
- **No spelling for single letters:** Thai Script's letter and symbol cards get none (`isSpellable`).
- **Two styles** (Settings → Display → Spelling, `settings.spellingStyle`):
  - **School method (`school`):** สะกดคำ. Each syllable is built up: consonant sound +
    vowel name (+ final sound) → syllable, then the tone mark's name and the toned syllable.
    Words of several syllables end with the whole word; a phrase spells word by word and ends with
    the whole phrase.
    - บ้าน: บอ – อา – นอ – บาน – ไม้โท – บ้าน
    - สบาย: สอ – อะ – สะ · บอ – อา – ยอ – บาย · สบาย
  - **Letter names (`letters`, the default since 2026-10-06; the `spelling-letters` migration moved
    saves on the old default):** dictation. Every symbol in written (typing) order by its name,
    so leading vowels come first. ข้าว: ข ไข่ · ไม้โท · สระอา · ว แหวน.
- **How the school method is worked out (`schoolSpelling`):** Thai doesn't mark syllables or every
  vowel, so the parser tries every reading the spelling allows and keeps the one whose sounds match
  the card's transliteration, syllable for syllable.
  - Matching ignores tone, vowel length and aspiration: only the grouping into syllables is being
    checked.
  - It handles:
    - hidden vowels: คน โอะ, สบาย อะ, บริษัท ออ, อักษร ออ + ร
    - reused finals: ผลไม้, วิทยา, จักรยาน = จัก-กระ
    - clusters, silent leading ห and อ, รร (กรรม, ภรรยา), ฤ, ไทย
    - silent letters: ์, ญาติ, บุตร, พุทธ
    - loanwords with ร์ before a final (พอร์ต)
    - a leading vowel belonging to the second consonant (เสมอ = สะ-เมอ)
    - ๆ
  - If nothing matches, it returns null and the letter names are used. As of 2026-10-06 it spells
    5442 of 5496 words and phrases (99%). The rest are abbreviations, digits, irregular loanwords
    and transliteration oddities.
- **Reading aloud (`speakSpelling`):**
  - Each step plays its recording from the manifest's **`sp`** section, falling back to the
    browser voice.
  - The final whole word or phrase uses the card's own recording.
  - There are pauses between syllables and words, and any other audio stops it.
- **Recordings are per part, never per word** (the user's call):
  - `node tools/spelling.mjs --write` lists every distinct spoken step across all cards and both
    styles (letter names like กอ ไก่, sounds, vowel and tone-mark names, syllables, the words of
    phrases): 4060 parts.
  - `tools/gen_audio.py` records them under `sp`, so a part never clashes with a card's text. For
    example, the vowel step อา isn't the Thai Script card อา, whose recording says สระอา.
  - Recordings are named by what's said, so a part that's also a card word reuses that file.
    Only 2465 were new.
- **Card back layout:**
  - The back's text sits in `.face-body`: centred when it fits, scrolling when it doesn't, with
    the corner buttons fixed.
  - Spacer pseudo-elements do the centring, because `justify-content: center` would cut off the
    top of overflowing content.
  - The longest spelling (about 280 characters, an idiom) fits a 390px phone without scrolling.
- **Check coverage after content changes:** `node tools/spelling.mjs --failed 60` lists words
  that fall back; `--samples --random` prints spellings to eyeball.

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
  "Add all to Review" and "Read all" share their row in two equal halves, under the full-width
  topic button.
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
  - **App files (`SHELL`) are cache-first** in `learnthai-shell-v2`, precached on install. The app
    opens instantly whatever the connection.
    - **Why:** until 2026-10-06 they were network-first with a 4 s fallback. On a weak signal the
      user waited about 5 s to see the home page.
    - **Measured** with a local server adding a delay to every request (installed service worker,
      time until the home page's counts appear):

      | Delay per request | Network-first | Cache-first |
      |---|---|---|
      | 0 ms | 0.1 s | 0.1 s |
      | 300 ms | 0.7 s | 0.1 s |
      | 1500 ms | 3.1–4.9 s | 0.1 s |

  - **Updates (`refreshShell`):** each launch (navigation) revalidates every shell file in the
    background with `cache: 'no-cache'`, mostly cheap 304s.
    - If any file's ETag or Last-Modified changed, the whole set is stored together, so the page
      never mixes files from two versions (a new `app.js` with an old `index.html` would break).
    - Open pages then get an `update-ready` message, and show a "A new version is ready ·
      Reload" bar (`#update-bar`).
    - Offline, or if a file fails, the current version stays.
  - **Anything else on the site** is still network-first with the 4 s fallback.
  - **Audio** is cache-first in `learnthai-audio`. Clip names are content hashes, so a cached
    clip never goes stale.
  - **Byte ranges:** Safari's `<audio>` requests byte ranges and won't play a plain 200, so
    `rangeResponse()` answers a `Range` header with a 206 sliced from the cached file.
- **Offline audio** (Settings → App):
  - Every clip that passes through the worker is cached, and `preloadDeckAudio()` fetches a whole
    deck, so opening a deck saves its audio.
  - **Spelling parts too** (since 2026-10-06): after the deck's Thai and English clips, it fetches
    the spelling parts its cards use in the current style, skipping ones already cached. These go
    only into the worker's audio cache, not the in-memory one, so they never evict the deck's own
    clips.
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
