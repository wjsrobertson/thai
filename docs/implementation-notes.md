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
tones.js              each syllable's tone and the rule that gives it (see Tones)
typing.js             Cards' Type: the Thai keyboard's layout and the typed-answer checker (see Cards: Type)
sw.js                 service worker (see Offline & install)
app.webmanifest       web app manifest; icons/ holds its icons
data/decks.json       all vocabulary
data/audio/           generated MP3s + manifest.json (see Audio / TTS)
tools/gen_audio.py    audio generator (dev-time only)
tools/phone_shots.py  phone-size screenshots via headless Chromium (dev-time only)
tools/audit_decks.py  content audit of decks.json; exits 1 on errors (dev-time only)
tools/spelling.mjs    spelling coverage report; writes data/spelling-parts.json (dev-time only)
tools/stories.py      Reading stories: check, sync, add, export, coverage (see Story tools)
tools/decks_io.py     reads and writes decks.json in its own layout (for the Python tools)
tools/tones_check.mjs the audit's tone check; tools/tone_exceptions.txt lists the known exceptions
tools/word_timings.py when each word of every story sentence is said (data/audio/timings.json)
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
- As of 2026-10-08 there are 8315 cards in 471 topics across 26 categories (see Topic list order,
  Topic splits, Verb topics, New topics, Business topics, More idioms, Tone Pairs, Sound Pairs,
  Thai school mnemonics and Learning tricks, 2026-10-08).

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

**Learning tricks, 2026-10-08** (scratchpad `decks/trick_topics.py` + `decks/merge_tricks.py`,
backup `decks.backup28.json`).
- **Look-alike Letters** (Thai Script → Consonants, 19 cards, all reused letter cards). The
  pairs: บ/ป, ผ/ฝ, พ/ฟ, ค/ศ, ร/ธ (the tail trick), ด/ต, ข/ช/ซ, ล/ส and อ/ฮ.
  - Each note says what tells the letters apart.
  - The cards have `partners`, so Recognition offers the look-alikes as the wrong answers.
    Checked: 19 of 19.
  - **Bug, fixed later the same day:** the merge script copied each letter card without its
    `say` ("บอ ใบไม้", how the voice reads a lone letter).
    - The manifest is keyed by the Thai, so the generator mapped all 19 letters to a bare-letter
      clip, everywhere in the app. It printed "said two ways" warnings, unnoticed until the
      Reading work.
    - `say` is restored on the 19 cards, and `merge_new.py` and `build_reading.py` now copy it.
      The 19 bare clips were pruned.
    - **Check:** a gen_audio run should print no "said two ways" warnings.
- **A Word Building group in Grammar** (52 cards, 24 new), each card with its parts or literal
  meaning:
  - **Word Building: น้ำ:** น้ำตา "eye water", น้ำแข็ง "hard water", …
  - **Word Building: ลูก & นัก:** ลูกตา, ลูกค้า; นักเรียน, นักข่าว, …
  - **Word Building: ความ & การ:** ความสุข, ความรู้; การเรียน, การเดินทาง, and the fixed
    การเมือง, การบ้าน.
- **Eight more Word Building topics the same day** (scratchpad `decks/wordbuild_topics.py` +
  `decks/merge_wordbuild.py`, backup `decks.backup29.json`; 129 cards, 67 new). The user found word
  building the most interesting part.
  - **People:** ผู้, ชาว, คน, หมอ. **Places:** โรง, ร้าน, ห้อง, ที่, สนาม. **Things:** เครื่อง, ที่,
    ตู้, รถ, ผ้า.
  - **น่า Words:** น่า + verb = worth …-ing.
  - **Paired Words:** คำซ้อน, two near-synonyms. The note gives each half.
  - **Opposite Pairs:** ซื้อขาย, ขึ้นลง, ผิดชอบ, …
  - **Doubled Words:** ๆ, softening, stressing or making plural.
  - **Formal Endings:** ศาสตร์, วิทยา, ภาพ, กรรม, กร.
  - 21 drafts reused existing cards with the same meaning, e.g. ตู้เย็น "refrigerator" and
    เครื่องบิน "airplane".
- **Two "like" words** were added after the user asked how to say "like": ยังกับ "just like
  (casual, exaggerating)" in Comparing, and the filler แบบว่า in Interjections: Ouch, Hmm & Ugh.
  เหมือน, เหมือนกับ, แบบ and เช่น already existed.
- **Telling the time and sentence patterns** (scratchpad `decks/time_pattern_topics.py` +
  `decks/merge_time_patterns.py`, backup `decks.backup30.json`; 108 cards, 97 new):
  - **Basics → Time & Date** gets three topics after Time of Day:
    - **Telling the Time: Day:** …โมงเช้า, บ่าย…โมง, …โมงเย็น.
    - **Night:** …ทุ่ม, ตี…, ดึก, สองยาม.
    - **Minutes & 24-Hour:** ครึ่ง, minutes, "quarter to" with อีก, and …นาฬิกา written 14.00 น.
  - The clock โมง is a new card. The existing โมง card is the Southern "bottom / backside".
  - **A Sentence Patterns group in Grammar,** before Word Building:
    - Past, Present & Future
    - Can, Must & Don't
    - Make, Let & Get (ให้, โดน, ถูก, ได้)
    - Linking Ideas
  - Each card is a short sentence; the note gives the pattern. Five sentences reuse existing
    phrase cards, e.g. กินข้าวหรือยัง and ห้ามสูบบุหรี่.
- **The alphabet order** (the user asked for a mnemonic): `about` paragraphs on Alphabet in Order
  (All Consonants ก–ถ and ท–ฮ until 2026-10-09).
  - **The song ก เอ๋ย ก ไก่:** only its opening lines are quoted, as a pointer. Its modern words
    are copyrighted (by Mansiga Lewanich), so the full song isn't in the app.
  - **The rows:** the order is grouped by place in the mouth, each row ending in a nasal: ง ญ ณ น ม.
- **Vowel tricks** (the user asked for vowel mnemonics) were added to the `about` paragraphs:
  - **Short & Long Vowels** (appended):
    - ะ cuts a vowel short;
    - an extra stroke makes it long;
    - "U is Under";
    - three mouth shapes, with อือ as อู said with a smile.
  - **Diphthongs & Special Vowels:**
    - each glide is two vowels run together;
    - อำ ไอ ใอ เอา have their ending built in (สระเกิน).
- **Four more tricks** were added to the `about` paragraphs:
  - **Tone Rules** (prepended): live or dead, "can you hum it?". Then the two defaults: high
    class with no mark rises, and dead syllables on mid and high are low.
  - **Tone Marks & Symbols** (appended): ๊ and ๋ only go on mid-class letters.
  - **Days of the Week:** the same planets as French and Spanish, and the day colours.
  - **Polite Particles:** ค่ะ vs คะ, "the mark means telling".
- **"Same same"** (the user asked): เหมือน ๆ กัน (where the Thinglish comes from) and พอ ๆ กัน went
  into Doubled Words, and เหมือนแต่ไม่เหมือน ("same same but different") into Comparing.
- **New `about` paragraphs:**
  - **Short & Long Vowels:** the five vowels written first but said after (เ แ โ ไ ใ).
  - **Tone Rules:** low-class marks give a tone one step higher than on mid-class letters.
  - **Grammar Terms: Sounds & Tones:** each tone as an English intonation.
  - **Both classifier topics:** rules of thumb. ตัว for anything with a body or legs, ใบ for flat
    or hollow things, คัน for things with a handle, and the container as the classifier.

**Thai school mnemonics, 2026-10-08** (scratchpad `decks/mnemonic_topics.py` +
`decks/merge_mnemonics.py`, backup `decks.backup27.json`). The user asked for the common
mnemonics, after our consonant-class memory scenes.
- **The class rhymes,** as a card (recorded) in each class topic and a sentence added to its
  `about`:
  - **Mid:** ไก่จิกเด็กตายบนปากโอ่ง.
  - **High:** ผีฝากถุงข้าวสารให้ฉัน.
  - **Low sonorants:** งูใหญ่นอนอยู่ ณ ริมวัด โมฬีโลก.
- **อย่าอยู่อย่างอยาก,** the four silent-อ words: a card in Clusters & Odd Spellings, moved to
  Leading ห & อ on 2026-10-13 (same card key, and its `words`, since a story uses it as a phrase).
- **The 20 ใ Words,** a new topic in Vowels (20 cards). The rhyme ผู้ใหญ่หาผ้าใหม่… is its `about`.
- **Final Sound Families,** a new topic in Tones & Reading (9 cards): แม่ ก กา, แม่กก, แม่กด, แม่กบ,
  แม่กง, แม่กน, แม่กม, แม่เกย, แม่เกอว, each with its letters and an example. Final Consonant
  Sounds' description points to it.
- **Tone marks:** Tone Marks & Symbols' `about` says the names count up: เอก, โท, ตรี, จัตวา =
  1–4.
- **`about` caution:** the renderer keeps each "(…)" on one line (for "(ด เด็ก)" pairs), so the
  rhymes' translations are in quotes, not brackets.
- **`about` paragraphs** (2026-10-08, the user's request): a blank line (`\n\n`) in `about`
  starts a new paragraph. `#wordlist-about` is now a `<div>` of `<p>`s, 10 px apart. What Thai
  schools teach always gets its own paragraph, apart from our tricks and explanations:
  - the class rhymes (Mid, High, Low Sonorants, and since 2026-10-09 Low Paired);
  - the ก เอ๋ย ก ไก่ song (Alphabet in Order);
  - สระเกิน (Diphthongs & Special Vowels).
  
  The 20 ใ Words' `about` is only the school rhyme, so it stays one paragraph.
- **School class mnemonics, complete** (2026-10-09, the user's request: "the low class mnemonic
  isn't very good"; scratchpad `decks/class_rhymes.py`).
  - **What changed:** Low Paired had only our scene, a long one in which an owl bared its
    teeth. It now has both school rhymes as cards (16 cards):
    - พ่อค้าฟันทองซื้อช้างฮ่อ, "a gold-toothed merchant buys a Haw elephant";
    - โชคภูโซ พุทโธ ไฮไฟ, which some schools use.
  - **Its `about`:** the school paragraph comes first. Then come our tricks: each letter is the
    low twin of a letter in ผีฝากถุงข้าวสารให้ฉัน, and a letter in neither the mid rhyme nor the
    high rhyme is low. The user preferred the school rhyme to a new story for the rarer
    letters.
  - **Rhymes as sound keys:** schools read each rhyme this way. Every word stands for its
    sound, and the rarer letters with that sound join it.
    - Low Paired: พ่อ for พ ภ, ค้า for ค ฅ ฆ, ทอง for ท ธ ฑ ฒ, ช้าง for ช ฌ.
    - Mid: เด็ก for ด ฎ, ตาย for ต ฏ. The full form names them: ไก่จิก เด็กตาย เฎ็กฏาย บนปากโอ่ง.
    - High: ถุง for ถ ฐ, สาร for ส ศ ษ, ข้าว for ข ฃ.
    - Mid's and High's card notes and school paragraphs now say this.
  - **Sources:** mthai.com/campus/55768, kawtung.com (อักษรต่ำ), tutor-vip.com
    (thai-letters-and-tones), nectec schoolnet 10000-5244, and fonee85.wordpress.com (ไก่จิกเด็กตาย).
    No school rhyme covers only the rarer seven.
  - **Already present:** อย่าอยู่อย่างอยาก (Clusters & Odd Spellings), the ใ rhyme, สระเกิน, and
    the alphabet song (as a pointer).
  - **High Class's story** (same day, the user's pick of four drafts) is now a tiger after
    breakfast: one character with a goal, an obstacle (a bee in the chest) and a punchline (the
    hermit laughing). It replaced a busier scene of the hermit, the tiger and the bee
    (scratchpad `decks/high_story.py`).
- **Text cleanup** (2026-10-08, the user asked "any other cleanup to text needed?"):
  - **Topics page heading:** the name is bold (`.wordlist-title`) and the description sits under it
    in normal weight (`.wordlist-desc`). Before, both were one bold line, "Name — description",
    which made five bold lines for Mid Class on a phone.
  - **Sentence glosses** follow the phrase-card style: lowercase, no full stop, "I" kept. That's
    60 cards in Sentence Patterns and Telling the Time, e.g. "I've eaten (already)" and "what
    time is it now?".
  - **The pair topics:** all nine Tone Pairs and Sound Pairs topics moved the listening tip ("use
    Recall with Show Thai script turned off in Settings") from the description into `about`.
    Sound Pairs also moved the hand-in-front-of-your-mouth test there, leaving a one-line
    description.
  - **One idea per paragraph:** Short & Long Vowels (3), Tone Rules (2), Tone Marks (2), Days of
    the Week (2).
  - **"Thai schoolchildren"** throughout, and "…" for "..." (13 cards, so new Thai audio for those).
  - `gen_audio.py --prune` removed 95 clips no card uses.
  - **Convention for new content:** glosses are lowercase with no full stop, even for sentences.
    Tips and explanations go in `about`; the description stays short.

**Sound Pairs, 2026-10-08** (scratchpad `decks/sound_topics.py` + `decks/merge_sounds.py`, backup
`decks.backup26.json`).
- **What:** a Sound Pairs group in Thai Script after Tone Pairs: three topics, 42 cards, 15 new.
  Each pair has the same tone and vowel, and only the first sound differs.
  - **Sound Pairs: g and kh, j and ch:** ไก่ ไข่, กา คา, กาง คาง, กัน คัน, กว้าง ขว้าง, จาน ชาน, จุด ฉุด.
  - **Sound Pairs: p and ph, t and th:** ปา พา, เป็ด เผ็ด, ปิด ผิด, ป้า ผ้า, ตา ทา, ไต ไทย, ตก ถก, ตี ที.
  - **Sound Pairs: b and p, d and t:** บ้า ป้า, ใบ ไป, บ่า ป่า, บก ปก, ดี ตี, ดำ ตำ.
- **Why the third topic:** ป and ต are unaspirated, so English ears hear them as b and d.
- **Notes and descriptions:** notes name the sound and the partner ("p, no puff. Compare เผ็ด (ph)
  spicy."). The descriptions give the hand-in-front-of-your-mouth test and suggest Recall with
  Show Thai script off.

**Tone Pairs, 2026-10-08** (scratchpad `decks/tone_topics.py` + `decks/merge_tones.py`, backup
`decks.backup24.json`).
- **What:** a Tone Pairs group at the end of Thai Script, in three topics (53 cards, 11 new). The
  user picked this as the quick option. The full tone trainer (`review-design.md` §5: hear a word,
  pick it from its set, two voices) wasn't built.
  - **Tone Pairs: Five Tones & Common Words:** คา ข่า ค่า ค้า ขา, ใหม่ ไม่ ไหม้ ไม้ ไหม, มา ม้า หมา,
    ข่าว ข้าว ขาว, ไกล ใกล้.
  - **Tone Pairs: Body, Family & Animals:** เสื่อ เสื้อ เสือ, ปา ป่า ป้า, นา หน้า น้า หนา, คอ ข้อ ขอ,
    ปู ปู่, เข่า เข้า เขา.
  - **Tone Pairs: Everyday Words:** ฮา ห้า หา, ซวย สวย, สื่อ ซื่อ ซื้อ, นำ น้ำ, ชา ช้า, ยา ย่า หญ้า, ไฟ ไฝ.
  - **Every set in tone order** (2026-10-13, the user's call; 23 sets in the six topics had been in
    no order): mid, low, falling, high, rising, the order schools chant (สามัญ เอก โท ตรี จัตวา).
    The cards follow their tiles' order. Two words on one tone keep their order (ไม่ before ไหม้).
- **Recognition offers the partners as the wrong answers** (2026-10-08, the user's request; at
  first they were random picks from the topic).
  - **The data:** each card in a Tone or Sound Pairs topic has `partners`, the card keys
    (`thai::english`) of the rest of its set in that topic. The sets were derived from the
    "Compare …" notes, linked together within each topic. The audit checks that every partner is a
    card in the same topic.
  - **The answers:** `buildLearnTrial` takes up to two partners (seeded random), then fills the
    rest from the usual pool, so two-word pairs get one partner and one other.
  - **Which partners:** `partnersOf` uses the card's own topic in scope. On Everything or a
    category, where the card may come from another topic, it uses every pair topic's partners: ป้า
    can get ผ้า (Sound Pairs) and ปา (Tone Pairs).
  - **Checked in Chromium:** on Five Tones & Common Words, all 16 cards with two or more partners
    got only partners, in both directions. ใกล้ / ไกล got one partner and one other.
- **Notes:** each names the word's tone and its partners ("Rising tone. Compare ข้าว (falling)
  rice, ข่าว (low) news"). Existing cards are reused, with these notes for this group.
- **เขา:** the set uses "hill", said rising as written. เขา "he / she" is usually said high (kháo).
- **Descriptions suggest Recall with Show Thai script off,** for a pure listening test.
- **Three more topics the same day** (scratchpad `decks/tone_topics2.py` + `decks/merge_tones2.py`,
  backup `decks.backup25.json`; 51 cards, 18 new). Six topics and 104 cards in all.
  - **Tone Pairs: Numbers, Directions & Particles:** สี สี่ ซี้, เก้า เก่า เกา, ทราย ส่าย ซ้าย สาย,
    มี หมี่ หมี, ไว ไหว ไหว้, ค่ะ คะ.
  - **Tone Pairs: Body, Home & Nature:** หาง ห่าง ห้าง, ไหล ไหล่ ไล่, ฟัน ฝัน, หมอ หม้อ, ใส ใส่,
    นอน หนอน, ลม ล้ม, ต้ม ตม.
  - **Tone Pairs: Buying, Selling & More:** ขาย คาย ค่าย, เสีย เสี่ย, ห่อ หอ, เล่น เลน, เต่า เตา,
    น้อย หน่อย, ปี ปี่.
  - **New everyday cards:** ซ้าย "left" (only เลี้ยวซ้าย existed) and ล้ม "to fall over" (only the
    crime-slang sense existed).

**More idioms, 2026-10-08** (scratchpad `decks/idiom_topics.py` + `decks/merge_idioms.py`,
backup `decks.backup23.json`).
- **Why:** the user asked about important idioms. There were already 41: Wisdom (16), People &
  Behaviour (16) and Southern: Idioms (9).
- **Two new topics** after them in Culture & Values → Language & Literature (34 new cards):
  - **Idioms & Proverbs: Work, Effort & Luck:** ดินพอกหางหมู, จับแพะชนแกะ, เอามะพร้าวห้าวไปขายสวน,
    ไก่ได้พลอย, หนามยอกเอาหนามบ่ง, ชาติหน้าตอนบ่าย ๆ, …
  - **Idioms & Proverbs: Talk & Relationships:** หมาเห่าใบตองแห้ง, ปลาหมอตายเพราะปาก,
    มือถือสาก ปากถือศีล, กินบนเรือน ขี้บนหลังคา, นกสองหัว, ข้าวใหม่ปลามัน, …
- **Style:** as Southern: Idioms, the English gives the meaning and the note gives the literal
  image ("Lit. 'a dog barking at a dry banana leaf'").

**Business topics, 2026-10-08** (scratchpad `decks/biz_topics.py` + `decks/merge_biz.py`, backup
`decks.backup22.json`).
- **Why:** the user asked about business terms for professionals. The basics existed (meetings,
  money and deals, email phrases), but not the working language.
- **A Business group** in Work & Education, after At Work, holds the two existing Business topics
  (moved in) and seven new ones (112 cards, 94 new):
  - Meeting Phrases: let's start, may I add, who's responsible, by when, the minutes.
  - Management & HR.
  - Sales & Marketing.
  - Finance & Accounting, with the Thai tax paperwork: ใบกำกับภาษี, withholding tax and its 50 ทวิ
    certificate.
  - Contracts & Company Admin: the company stamp, certified true copies, BOI, registered capital.
  - Customer Service.
  - Workplace Manners: seniority, รุ่นพี่ / รุ่นน้อง, ขออนุญาต, saving face, who pays.
- **Reuse and fixes:**
  - Matching meanings reused existing cards (สวัสดิการ "benefits", รุ่นพี่ "senior (at school or
    work)", ไว้หน้า "to spare someone's face").
  - The existing โฆษณา card's transliteration was fixed: khoo-sà-naa → khôot-sà-naa.
  - ไหว้ stays "wâai" everywhere on purpose: it's pronounced with a long vowel.

**New topics, 2026-10-08** (scratchpad `decks/new_topics.py` + `decks/merge_new.py`, backup
`decks.backup21.json`).
- **Why:** the user asked what was missing. A sample-word check found the library broad but thin
  on everyday conversation: no "what's your name?", "I think", "I agree", "are you free?" or
  "hello" on the phone. Hotels, signs, materials, babies, Isan and Northern Thai were missing
  too.
- **The 18 topics (355 cards, 292 new):**
  - **Conversation**, a new category after Basics: Small Talk: Questions · Small Talk: About You ·
    Opinions & Reactions · Everyday Responses · Plans & Invitations · Phone Calls & Messages.
  - **Getting Around:** Signs & Notices (in Travel), and a new Staying & Sightseeing group with
    Hotels: Booking & Checking In, Hotels: Rooms & Problems and Sightseeing & Tours.
  - **Basics → Everyday Words:** Materials.
  - **People & Relationships:** a new Family Life group with Babies & Toddlers and Raising Kids.
  - **Nature & Animals:** Pet Care & the Vet, after Pets. Pets already had the vet, vaccines,
    neutering and walks, so this adds fleas, worming, grooming, litter, adopting and commands.
  - **Isan Thai** (4 topics) and **Northern Thai** (3), new categories after Southern Thai.
    - They follow the Southern pattern: the note gives the Central word ("Central: ไม่."), and the
      description says the audio uses the Central voice.
    - Topic names carry the region ("Isan: Food", "Northern: Food"), since topic names must be
      unique. At the user's suggestion, Southern Thai's topics took the same prefix the same day:
      "Southern: Phrases", "Southern: Idioms" (was "Southern Idioms"), and "Southern: Verbs &
      Describing" / "Southern: Places & Things" (were "Everyday Words: …"). Ids are unchanged.
    - The app spells the region "Isan", as the existing ภาคอีสาน card does.
- **Same meaning, same card.** The merge script reuses an existing card when the Thai and the
  meaning match. 20 drafts were switched to the existing English, e.g. ก็ได้ "that's fine too /
  whatever" and เลื่อนนัด "to reschedule an appointment".
  - **Real differences stayed separate cards:** Isan หลาย "very" against Central "several",
    แซ่บ "delicious" against the slang "hot", and Northern ปี้ "older sibling", whose note warns it's
    crude Central slang.
- **Checks:** audit 0 errors; spelling parts and audio regenerated (`spelling.mjs --write`,
  `gen_audio.py`).

**Verb topics, 2026-10-07** (scratchpad `decks/verbs.py`, backup `decks.backup20.json`).
- **Why:** the user couldn't find need, have or want. Common Verbs had 23 words, and most everyday
  verbs were only in the Spoken frequency topics, mixed in with other kinds of word.
- **Five new topics** after Common Verbs. All six now form a **Verbs** group in Grammar, so "All
  Verbs" covers the lot. The topics:
  - Want, Need, Can & Must (18 words)
  - Everyday Actions: Body & Day (20)
  - Everyday Actions: Things & Errands (21)
  - Thinking & Talking (21)
  - Coming & Going (21)
  Everyday Actions was one topic in the plan; it's two because of the 25-card limit.
- **Reused cards:** words already in the app reuse their exact `thai` and `english`, so progress
  and audio are shared. A few notes differ by topic, with usage patterns added here.
- **21 new cards**, recorded with the usual voices:
  - อยากได้, ไม่ต้อง, ห้าม
  - ล้าง, ยืน, หัวเราะ
  - ถือ, สั่ง, ชิม, ยืม, หัก
  - เป็นห่วง, ตอบ, แปล, สะกด, เถียง
  - ออกจาก, เลี้ยว, แวะ, ไปรับ
  - ข้าม as "to cross", beside the preposition "across / over"

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
- **The one exception** (the user's call, 2026-10-09): **Alphabet in Order**
  (`script-consonants-all`), all 44 consonants ก to ฮ, because the unbroken order is the point.
  - It was two topics, All Consonants ก–ถ and ท–ฮ, which held the same cards as the four class
    topics; the alphabet order was all they added. Mixed review of every consonant is the Thai
    Script › Consonants group.
  - The second topic's id is in `formerIds`, so a saved position still finds it. Three stories
    that targeted it now target the merged topic (scratchpad `decks/alphabet_merge.py`).
  - `tools/audit_decks.py` enforces the rule. Any word topic over 25 cards is an error unless its
    id is in `OVER_MAX_OK`, which holds only this one.
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
  - "Words & Spelling" (2026-10-13): Reading Compounds, Homophones & Homographs, Native or
    Borrowed, Commonly Misspelt Words. Topics added since are in their own sections.
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

**Each mode keeps its own place** (2026-10-08, the user's call).
- **What each keeps:** Browse its position, Recognition its stream (queue, position, words being
  relearnt, carried comebacks), and Recall its stream (`state.review`, kept when you switch away).
- **Saving and restoring:** `setOrderMode` saves the place you leave (`snapMode` →
  `state.modeSnap`) and restores the one you return to (`restoreMode`).
  - **Recognition left mid-pause** comes back on the next card, since the answer was already
    saved.
  - **Recall** comes back on its current card, from the front.
- **Starting afresh:** a place is dropped if words went into or out of Flashcards meanwhile (the
  `reviewOnlySig` check). Changing direction or topic starts every mode afresh (`discardModes`).
  Leaving Flashcards keeps all three (see "Flashcards reopens as you left it").
- **Tried first:** the same day, switching mode kept the word on screen, but the user didn't like
  it.
- **Checked in Chromium:**
  - Browse at 3/8 stayed there across every switch.
  - Recognition came back mid-stream, with a missed word returning 3 cards later.
  - Recall came back on its own card.
  - A direction change reset all three, and leaving the page kept only Browse.

**The modes are Browse | Recognition | Recall (2026-10-08).** Learn became Browse (the user's
placeholder; a better name is being discussed) and Test became Recognition.
- **Where:** the mode buttons, Home's rows, Settings → Flashcards → "Recognition", "Scheduling
  (Recognition and Recall)", and the help that mentioned Learn or Test.
- **Code values are unchanged:** `orderMode` `practice` / `test` / `review`. Settings search still
  finds "test" and "learn".
- **Phone:** the row fits from 375px up (Recognition is 81px). At 320px the modes wrap onto
  their own full-width row under the directions, which looks tidy.

**"Review" is gone from the app's wording (2026-10-08).** The user called Review "a dead
concept".
- **The mode is now Recall:**
  - Learn | Test | Recall.
  - Home's row: "**Recall** Remember each word yourself; the hard ones come back sooner".
  - Settings → Flashcards → "Recall" and "Scheduling (Test and Recall)".
  - "Recall cards" in Show Thai script.
  - The card's aria-label.
  - The manifest: "spaced recall".
- **The list of words you add is "Flashcards":**
  - "None of this topic's words are in Flashcards yet" (and "No words in Flashcards yet").
  - Settings → Reset → **Clear Flashcards** (was "Reset Review list"), with its dialog and the
    "Flashcards cleared" toast.
  - "the words in Flashcards" in the Backup, Reset progress and Reset settings text, and in the
    backup summary.
  - The topic picker's "Every word you've added to Flashcards".
  - (The Add-all button and its toasts changed earlier the same day.)
- **Desired retention** says "words come back less / more often" instead of "fewer / more
  reviews".
- **Code names are unchanged:** `orderMode: 'review'`, `state.review`, `reviewWords`,
  `#review-card`, `.today-only` and the rest. "review" stays in settings search words, so the old
  name still finds things.
- **Below:** the notes from earlier on 2026-10-08 still say "Review mode"; read it as Recall.

**Review moved into Flashcards (2026-10-08).** The user asked to get rid of the Review tab and
make it a Flashcards mode. Where older notes below say "Review" for the page, it's now
**Flashcards → Review**.
- **The page:** the tabs are **Topics | Flashcards**, and Home has two cards.
- **Home's cards** (restyled 2026-10-08 at the user's request: the bullets were cramped, and Topics
  needed balancing). Each card has a title and three lines.
  - **Flashcards' rows:** `.home-card-list` is a two-column grid (label | description), so the
    descriptions line up. Each label has an accent dot. The rows use spans, since a button can
    only hold phrasing content.
  - **No topic line:** the cards used to end with their topic ("Topic: …", or "Everything" for
    Flashcards). The user found it redundant and had it removed, `renderHome` included
    (2026-10-08). Home is now static.
  - **Topics: plain sentences**, one per line (`.home-card-text`, at the rows' size, with more
    space between them, 26px or 22px on the phone, so the card fills out beside Flashcards'):
    "Every word, sorted by topic, with audio and spelling.", "Tap 🔁 on a word to practise it in
    Flashcards." and "Hear a whole topic read out with Read all."
    - They replace "Browse words by topic" and the 🔁 note.
    - The user didn't want the Flashcards-style rows (Browse / Add / Listen) here.
  - **Flashcards:** "**Learn** Flip through the cards to memorise words", "**Test** Pick the right answer to check
    you recognise each word" and "**Review** Recall each word; the hard ones come back sooner".
  - **Earlier:** Flashcards' stat also counted what Review had waiting ("12 to review ·
    Everything"), and its description was one line: "Learn, test your recognition, then review
    to build recall".
- **Modes:** Flashcards' modes are **Learn | Test | Review** (`state.orderMode`: `practice`,
  `test`, `review`; `stage[data-order]`).
  - Review mode hides the card and the Test summary, and shows the old Review section
    (`.today-only`, `#today-section`) in their place.
  - Its card already matched the Flashcards card's size. It gained the spelling button
    (`#review-spell`, bottom left; on the front only for Thai → English). Tapping the card shows
    the answer, as Show does.
- **Direction:** Review follows Thai → English / English → Thai. `planReview(now, dir)`,
  `planPractice`, `dueTomorrow` and `nextReviewText` all take one direction.
  - The buttons read the same in every mode. A count of cards to review on each was tried for a
    day and removed at the user's request (2026-10-08).
  - **English → Thai is open for any added word.** It used to unlock once the meaning was known
    (`it.u`, still set by `gradeItem` but unused). The "Both directions" setting is gone.
- **Scope:** Review follows Flashcards' Everything / By topic (`flashScope()`;
  `reviewScopeDeckIds()`). Review's own switch (`prefs.reviewBy`) is gone. The dialog's help now
  reads "Shared with the Topics page" or "Every word you've added to Review".
- **A continuous stream, no sessions** (2026-10-08, the user's request, later the same day).
  - **What the user asked for:** no single test of "6 things" with a start and an end. The hard
    things should come back quickly and the easy ones less. New words still appear, but aren't
    marked as new: just a stream of words from the selection, in an order that helps recall.
  - **Gone:** the start panel (counts and Start), "All caught up", Practise again (and practice
    rounds that didn't touch the schedule), the end screen, the badge ("12 left · New") and
    Settings → "Maximum reviews per day". `planReview`, `planPractice`, `dueTomorrow` and the
    daily `rv` count went with them.
  - **`state.review`** is the stream: `count` (cards shown), `shownAt` and `returnAt` (item →
    count), `sinceNew`, `lastKey` and `current`. `enterReview()` starts it when you choose the
    mode, a direction or a topic. Changing mode, direction or topic starts afresh
    (`leaveReviewSession`). Grades are saved as you go.
  - **Flashcards reopens as you left it** (the user's request, 2026-10-08).
    - **What's kept:** the direction and the mode (both in prefs, so they survive a reload too),
      and each mode's place, Recall's and Recognition's streams included. A Recognition card
      answered just before leaving moves on to the next one on return.
    - **History:** earlier that day it always opened on Browse (then "Learn"), and leaving ended
      the streams. The user found that unhelpful. The old migration from the Review tab went then.
  - **`pickReviewEntry()` picks each card**, from `reviewPool()`: every added word in scope, with
    its item in the current direction, or null if not started.
    1. **Returning cards** whose turn has come, longest waiting first. **Again** sets a return 2–4
       cards later, and **Hard** 6–9 later (`REVIEW_RETURN`). **Easy** clears it, so the card
       drops out of the rotation.
    2. **Due cards** (`it.due <= now`), lowest recall probability (`fsrsR`) first. A new word
       comes in every `NEW_EVERY` (4) cards.
    3. **New words** in the order added, when nothing is due. They look like any other card.
    4. **Nothing due:** the lowest recall probability first. Elapsed time ÷ stability ranks them,
       so low-stability (hard) words come round more often than easy ones in a big pool.
    - **No repeats:** a card isn't shown again within `RECENT` (5) cards, fewer in a small pool,
      and never twice in a row. When everything is recent or waiting to return, the card shown
      longest ago comes next.
  - **The schedule:** every grade goes to FSRS (`gradeItem`, recall). Reviews ahead of time use
    FSRS's early-review maths, and the same-day tweak (repeats never lengthen a gap) stops a long
    sitting from pushing words out. Across days, due words come first.
  - **Home:** the Flashcards card shows cards due now plus words not started, in both
    directions (`reviewToDo`).
  - With none of the scope's words in Review (or all taken out mid-stream), Flashcards' empty
    message shows (`.stage.review-only-none .today` is hidden).
  - **Tested in Chromium (6 words):**
    - Again on w1 brought it back 3 cards later, twice.
    - Hard on w2 brought it back 8 and then 6 cards later.
    - Once all were Easy they rotated, never back to back.
    - With 4 overdue cards and 8 new words, the due cards came weakest first (by elapsed ÷
      stability), then the new words.
    - Leaving and returning kept the card, and removing every word showed the empty message.
- **No header:** the old session header (topic, "12 left", End review) is gone.
- **The card flips** (2026-10-08, the user's request). Review's card is now built like the
  Flashcards card: `#review-card` is a `.card` with a front and a back `.face`.
  - **Before:** the answer appeared under the large prompt.
  - **The front** has the prompt (large, fitted by `fitText`, which `fitCardText` now runs for both
    cards), the eye button, the hint, and the 🔊 and spelling buttons (Thai → English only).
  - **The back** is laid out as Flashcards' (`renderCard`): for Thai → English, the Thai at the
    English's size, then the transliteration, English and note (the spelling line went on 2026-10-09). English → Thai
    leads with the transliteration, then the large Thai.
  - **Turning it:** Show, Enter or a tap turns it to the back (`setReviewFlipped`). After that a
    tap turns it either way.
  - **The next card** is set up on the front without the turn (`instant`), so the next answer
    never shows mid-turn.
  - **Checked in Chromium:** the card is the same size and position as Learn's (366×354 at 390px,
    296×269 at 320px, 900×506 on desktop). The back's text sizes match Learn's, the 30-character
    phrase fits, and there were no JS errors.
- **Show and the grades are Test's answer-button size** (2026-10-08, the user's request).
  - **Sizes:** the grades sit three across, as `.learn-pill` in `.learn-pills`: a 12px gap and
    120px minimum height on desktop, 8px and 72px on the phone. Show is the middle button's size,
    `calc((100% - 2 gaps) / 3)` wide and centred. The card-to-buttons gap matches `.card-wrap`
    (16px, 12px on the phone).
  - **Measured in Chromium:** the same widths and x-positions as Test's buttons (117px at 390,
    93px at 320, 292px on desktop).
  - **Heights:** Test's buttons grow when an answer wraps (up to about 114px on the phone).
    Review's stay at the one-line height.
  - **Easy is outlined green** (`--good`, as it schedules as FSRS Good). It was blue (`--easy`).
- **"Again" is labelled "Very Hard"** (2026-10-08, the user's request). This covers the grade
  button and Settings → Flashcards → "Very Hard: wait (minutes)", whose help now says "a word you
  mark Very Hard".
  - Code and notes still say Again: grade 1, `waitAgainMin`, `.grade-again`.
  - The button wraps to two lines at 320px, inside its 72px.
- **Show moved into the card as a yellow ⟳** (2026-10-08, the user's idea).
  - **The button:** it's the Flashcards card's flip button (`.flip-btn`, bottom right, on both
    faces), the same size as Learn's (72px desktop, 48px phone). On the front it's filled yellow
    (`.reveal`, `--accent`) until the card has been turned, then grey as on Learn.
  - **What turns the card:** ⟳, a tap or Enter turns it to the answer, then either way. Nothing
    sits under the card until the grades appear.
  - **Gone:** the Show button, the "Say it aloud, then tap Show" hint (also removed at the user's
    request), and with it Settings → "Say it aloud" (`sayAloud`), which only chose that hint's
    wording.
  - The "Show Thai script" setting now says "before you turn them over".
- **Short direction labels on the phone:** "TH → EN" / "EN → TH" (`.dir-long` / `.dir-short`).
  Direction and Learn | Test | Review then share one row from 320 to 430px.
  - At 320px the buttons are slightly tighter (`padding: 8px 4px`); otherwise that width is 4px
    short. Measured in Chromium.
  - The 340px rule sits after the general `.seg-btn` rule, which would otherwise override it.
- **Settings:** Review's settings joined Flashcards under a "Review mode" subheading
  (`.setting-subhead`). The sections are now Display, Audio, Topics, Flashcards, App, Reset.
- **Quiet card:** the hidden Flashcards card doesn't speak in Review mode (`renderCard`).
- **Migration:** a saved `prefs.view = 'today'` (the Review tab) opens Flashcards in Review mode.
- **Tested in Chromium:**
  - A 6-word session, then Done gave "All caught up · More words are due in 3 days".
  - English → Thai then started its own 6-card session, with no spelling button on the front.
  - Enter revealed the answer, and 1 graded Again.
  - Learn showed the card again.
  - Switching scope started a 4-card session.
  - Practise again worked, and a topic with no Review words showed the empty message.
  - Test mode was unaffected, and there were no JS errors.

The app opens on a **Home** page: three cards (Wordlists, Flashcards, Review; the top tabs match. Wordlists moved first on 2026-10-07), each with a short
description. Flashcards and Wordlists show the current deck ("Topic: Time of Day"), and Review shows today's due/new counts
(`renderHome`).
Tapping "Learn Thai" (top left) returns there. No tab is selected on Home. It was added on
2026-10-05 at the user's request; before that, the app opened on Review.
The descriptions (2026-10-07) start with a verb and name what each page trains: Wordlists "Browse
words by topic", Flashcards "Flip cards to learn, then test your recognition", and Review
"Practise recalling the words you've added".
The Wordlists card also says "Words you add with the 🔁 button appear in Flashcards and Review"
(`.home-card-note`, the Review icon drawn inline; added 2026-10-07).

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
  - Search matches deck name, category and group, and opens everything that matches.
    Descriptions were matched too until word search came (2026-10-08). Common words like "like"
    then found nine topics, which pushed the word results off a phone screen.
  - **Word search** (2026-10-08) was added because the user kept asking "do we have X?". The
    same box ("Search topics and words…") lists matching words below the topics, in
    `wordSearch`, `wordHitsSection` and `wordHitRow`:
    - A Thai query matches the Thai, ignoring spaces. Any other query matches the English, or a
      loose transliteration: no tone marks, hyphens or doubled letters; ʉ ɔ ɛ ə become u o e e;
      ue and ae are accepted for them. So "nuea", "nua" and nʉ̂a all meet.
    - **Ranking:**
      1. Exact match.
      2. One of several meanings ("time" in "once / time").
      3. A whole English word ("about the same").
      4. An exact transliteration.
      5. A word start.
      6. Contains.
      
      Ties go to the shorter Thai. An English match beats a transliteration match of the same
      kind, so "same" isn't led by เสมอ (sà-mə̌ə), but "nam" still finds น้ำ before "name".
    - There is one row per card key. The best 40 are shown with the total.
    - **Each row has:**
      - ✓ / ⇄ to add to or remove from Flashcards;
      - 🔊 to play it;
      - the row itself, which opens the word's topic on the Topics page (`showWordInTopic`).
        It prefers the current topic if the word is in it. The word is scrolled to the centre
        and highlighted for 2.5 s (`tr.search-hit`).
    - The search is hidden, with the list, when Flashcards is on Everything.
  - `pickerModel()` builds the tree as plain data; the render functions only draw it.
- The **direction** toggle (Thai→English / English→Thai), which sets the language on the front.
- The **mode** toggle, Learn / Test. Internally these are `practice` / `test`; legacy pref values
  are migrated in `init()`. Learn has no scoring and flips freely.

**Wordlists was renamed Topics** (2026-10-07, at the user's request). The change covers:
- the tab, the Home card and the Settings section;
- every line of help or message text that named the page, e.g. "Add some on the Topics page using
  the 🔁 button", "Shared with the Topics page and Flashcards", and the confirm dialog's "Settings →
  Topics";
- the page title, now just "Learn Thai" (it was "Learn Thai — Flashcards", although the app opens
  on Home);
- the install description in `app.webmanifest`.

Code names (`data-view="wordlist"`, `wordlist-*` classes, `wordlistFirst`) are unchanged, and
"wordlists" stays in settings search keywords. Older notes below still say Wordlists.

**Wordlists** shows the topic as a table, in list order, and each row has a 🔊 button. Its
headings sorted it (and Read all followed the sorted order) until 2026-10-12, when the user asked
for that to go. The filter box
above it was removed on 2026-10-07 at the user's request. Which
column comes first, Thai or English, is the Settings → Wordlists "Show first" setting
(`settings.wordlistFirst`). It moved off the page on 2026-10-06; an English choice saved in the
old `prefs.primaryCol` carries over once. "Read all" walks the rows in their sorted order,
highlighting and scrolling to the current one. A view or deck change cancels it.

**A topic's `about`** (optional, in decks.json; added 2026-10-07) is a second paragraph under
Wordlists' heading (`#wordlist-about`), for single topics only. The topic picker doesn't show it.
- **The four consonant-class topics** have memory scenes, at the user's request: Mid (theirs),
  High, Low Paired and Low Sonorants.
- **Each scene happens at its class's height:** high up a mountain, mid on the ground, and both
  lows down by the river.
- **Each names every letter of its class once,** with the app's own keyword, e.g. "a hermit (ษ
  ฤๅษี)". The scratchpad script `decks/mnemonics.py` checked that against `spell.js` before
  writing.
- **Each bracketed pair stays on one line** (a `.nowrap` span). Otherwise a line could break at
  its space, or inside a Thai word: นกฮูก split as นก | ฮูก.

Keyboard: Space flips, `P` plays, ←/→ navigate.

**Flashcards → "Review words only"** (2026-10-07; the user wants Review to be more central).
It's the only behaviour. The history, all on the same day:
- It was a checkbox on the Flashcards page.
- Then a setting, Settings → Flashcards → Review words only (`settings.reviewOnly`, on by
  default).
- Then the user removed the setting.

- **What it does:** Flashcards goes through just the current topic's words that are in Review.
  Wordlists and Test-mode answer choices still use the whole topic: `state.cards` stays the
  topic, and `buildFlashcardQueue()` builds the usual queue, then keeps only the indices of words
  in Review.
- **No note under the card** (removed 2026-10-07). There used to be one reading "Showing only
  words in Review: 3 of 24"; the user found it redundant once this was the only behaviour.
  - The page-filling layout it needed stays, for the empty-topic message below: body is a
    column, the stage grows, and the Flashcards stage is a column.
  - `.round-summary` still needs `width: 100%` in that column: with `margin: 0 auto`, a flex item
    shrinks to its content instead of filling its 640 px maximum.
- **None of the topic in Review** (changed 2026-10-07): no card. A message takes its place,
  centred in the space under the controls (`#review-only-empty`; the stage gets
  `.review-only-none`, which hides `.card-wrap`): "None of this topic's words are in Review yet /
  Add some on the Wordlists page using the 🔁 button and they'll show up here" (the Review icon
  drawn inline, `.inline-icon`; Review's message has the same line). The box is centred, with the
  title centred and the rest left-aligned (the user's call). The text under the title is narrower,
  at 70% of the box (about 80% of the title's width, as asked). Its third line, "Or turn off Review
  words only in Settings → Flashcards…", went with the setting.
  - **Showing nothing, not the whole topic, was the user's call.** At first, the whole topic
    showed in this case.
  - **No sound plays** and the keys do nothing: the queue is empty.
  - **Class-name clash:** the stage's class must not be `review-only-empty`. That's the message's
    class, and the stage briefly picked up its panel styling and 460 px max-width.
- **Always on.** There's no automatic adding any more (removed 2026-10-07), so Review is always
  the words you add.
- **Adding and removing words** (`syncReviewOnly()`, from `setInReview`, Reset Review list,
  Reset settings, and a change of adding mode):
  - **On Flashcards:** since the card's Review button went, this only happens via Settings opened
    over it. If the set changed, the queue is rebuilt at once, around the card on screen if it's
    still in; in a Test round that card moves to the front. If it is still in, the card isn't
    redrawn (`updateStats()` only), so it doesn't flip back or replay.
  - `renderReviewOnly()` runs from `renderCard()`, so the note and the message follow every
    queue change.
  - **Elsewhere** (Wordlists, Review): coming back to Flashcards rebuilds the queue if the set
    changed (`setView` compares `reviewOnlySignature()` with the one the queue was built with).
    The first test of this showed 1 / 1 after adding 3 words from Wordlists.

**Scopes: a topic, a group or a whole category** (2026-10-07; the user wanted to study and review
a category alone, on every page).

- **A scope id** is a topic's id, `group:<category>::<group>`, `cat:<category>`, or (Review and
  Flashcards only) `all`.
  - `resolveScope(id)` gives `{ id, kind, name, label, description, decks, cards, deckOf }`.
    `cards` drops repeats (a word in two topics counts once). `deckOf` maps a card key to the first
    of the scope's decks with it, used for Wordlists' headings and Test answers' deck.
  - Results are cached (`scopeCache`): the decks never change while the app runs.
- **Wordlists and Flashcards share one scope:** `state.currentDeckId` / `prefs.currentDeckId`
  holds a scope id; the name is kept from when it was always a topic. `currentScope()` resolves it.
- **The topic button** shows the scope as "📚 Basics · all 19 topics" (📖 for a single topic).
  On Review it shows what Review covers (`renderDeckButton`).
- **Picking in the topic picker:** each category and group heading has an "All N" pill on its
  right (`pickerHead` → `.scope-all`; N is the word count). Tapping the heading's name still opens
  or closes it.
  - The user chose this over a separate "All Basics" first row, which felt untidy, and over making
    the name pick and only the ▸ expand, since those targets are small on a phone.
  - Counts in headings don't wrap (`white-space: nowrap`); a long name wraps instead.
- **Wordlists for several topics:** a heading row per topic (`tr.wl-topic`), in list order. There
  were no headings while it was sorted by a column. The header reads "Basics — All 19 topics".
- **Flashcards:** works as for a topic. Since it shows only Review words, "All of Food & Drink"
  means your Review words from it. The empty-topic message names the scope.
- **Flashcards: Everything or By topic** (`prefs.flashcardsBy`: `topic` by default, or `all`;
  2026-10-07, the user asked for Review's options on Flashcards too).
  - **The dialog:** opened from Flashcards (`state.pickerFor = 'flashcards'`), it is titled "What
    to study" and has the same switch as Review's. The help reads "Shared with the Topics page and
    Review" or "Every word you've added to Review". The Topics page's dialog has no switch.
  - **Separate switches, one topic:** Review and Flashcards each keep their own Everything / By
    topic. By topic means the one shared topic.
  - **Everything** means every word in Review, from all topics (`flashScope()` →
    `resolveScope('all')`). The topic button and the Home card say "Everything".
  - **Two card lists:** `state.listCards` is the topic's words, for the Topics page.
    `state.cards` is Flashcards' list: the same array By topic, every card on Everything
    (`loadCards`). The queue then keeps the Review words.
  - **Test's wrong answers** on Everything come from your Review words (`distractorPool()`;
    the user's call). All 6,000-odd cards made them easy to rule out. With fewer than 3 words in
    Review, they come from all cards. By topic, they still come from the topic's words.
  - **`state.flashScopeId`** is what Flashcards was built for: the topic's id or `all`.
    `selectDeck` rebuilds Flashcards (`reloadFlashcards`) only if that changes. So picking a
    topic on the Topics page leaves an Everything round where it was.
  - **Empty message:** on Everything with nothing in Review, "No words in Review yet". By topic,
    the message gains Review's "Or switch to Everything…" line (`#review-only-empty-hint`), hidden
    when Review is empty.
    - **Reworded 2026-10-10 (the user's text, then their layout):** under the title, three ways
      out, each a button on the left with what it does on the right (`.review-only-actions`, one
      grid, so the buttons share a width):
      1. **Add all words:** "Add every word from 'Time of Day' to Flashcards". It adds them at
         once, with a toast.
      2. **Choose words:** "Add words from 'Time of Day' individually with the 🔁 button" ("Add
         words in Topics individually…" on Everything). It opens the Topics page.
      3. **View all topics:** "Switch to Everything to see all your added words from all topics"
         (`setFlashcardsBy('all')`). It's hidden when nothing is in Flashcards at all.
      - **History:** first it was sentences with the buttons inside them ("Add all words from
        '…'? [Yes]", "…individually in [Topics]…", "Or switch to [Everything]…"). The user then
        asked for buttons on the left with longer names, and suggested these labels.
    - **On Everything:** there's no topic to add, so row 1 is hidden.
    - **Tested in Chromium:** Yes added Time of Day's 24 words and its first card showed; the link
      opened the topic's Topics page; Everything showed the words added elsewhere.
  - **Tested in Chromium:**
    - All 7 Review words from two topics showed on Everything.
    - Changing the Topics page's topic left the round on the same card.
    - Test mode had 3 answer choices.
    - The empty cases, the Home card and Review's dialog were all as above.
- **Review: Everything or By topic** (`prefs.reviewBy`: `all` by default, or `topic`). It's set in
  Review's topic dialog, "What to review", which has an Everything / By topic switch above the
  topic list (`renderReviewBy`, `state.pickerFor = 'review'`).
  - **By topic** is the topic, group or category Wordlists and Flashcards show; there is only one
    shared scope. Picking in Review's dialog changes it for all three pages.
  - **Everything** hides the search and the list (hidden, not disabled: a greyed-out list of 22
    categories is noise). The dialog then shrinks to fit (`#deck-picker.review-all`): a short
    sheet from the top on a phone.
  - **Taps apply at once.** Everything closes the dialog. By topic shows the list with the shared
    topic highlighted; picking closes it, and closing without picking keeps By topic.
  - **History:** the first version (same day) had Review's own separate choice, with a Settings →
    "What Review covers" option to follow Wordlists/Flashcards instead. The user then chose this
    simpler model, and the setting was removed.
  - **Migration:** an old "Due reviews from: Current topic only" (`settings.reviewScope:
    'current'`) starts on By topic (the `review-by-topic` migration). Migration steps get the
    store as a second argument so they can set prefs.
  - `planReview` and `dueTomorrow` filter to the scope's decks (`reviewScopeDeckIds()`). The Home
    card adds the scope's name after the counts, e.g. "3 due · 2 new · Food & Drink". Putting the
    scope first, on its own line, was tried and reverted at the user's request.
- **Tested in Chromium:**
  - Scopes: All of Basics gave 340 words in 19 topics, and a group worked the same way.
  - Review: a Food & Drink session held exactly its words, and Everything / By topic behaved as
    above.
  - The choices survived a reload, and the migration from `reviewScope: 'current'` worked.

**"Add all to Review" became "Add all to Flashcards"** (2026-10-08, the user's request).
- **What changed:**
  - The Topics page button and its states ("✓ All in Flashcards", "− Remove all").
  - Both dialogs ("Add all to Flashcards?", "Remove all from Flashcards?").
  - Every add and remove toast ("✓ Added 24 words to Flashcards", "Removed สวัสดี from
    Flashcards").
  - The 🔁 button's tooltip and the inline icon's label.
  - The two Settings → Topics confirmations named after the button.
- **Not changed:** other wording still calls the list "Review", e.g. "None of this topic's words
  are in Review yet", "Reset Review list" and the backup text. Code names (`reviewWords`,
  `setInReview`) are unchanged.
- **Phone layout:** the longer label wrapped in its half of the row, so the button now takes the
  room "Read all" doesn't need (`flex: 1 1 auto` against `0 0 auto`) and stays on one line. At
  320px the two buttons' text is 13px: 202px + 86px there, 258px + 100px at 390px.

**The card's back repeats the Thai** (2026-10-08, the user's request), for Learn and Test,
Thai → English only.
- **Order:** the Thai script, then the transliteration, English, note and spelling
  (`#card-back-thai`, filled in `renderCard`).
- **Style:** the same size, colour and weight as the English (class `english` plus
  `back-script`), not the front's large Thai.
- **English → Thai** already leads its back with the Thai, so the extra line is hidden there.
- **Checked in Chromium:** 20px on a 390px phone and 32px on desktop, the same as the English.
  Nothing overflowed, even on a card with a long note.

## Tones (2026-10-11), the word pop-up

**What:** a Tones row under the word pop-up's buttons (now the word dialog, below), tried there
first (the user's choice; the flashcard backs may follow). Closed, it shows "Tones" and a small curve per syllable. Tapped, it
opens to:
- a strip with each syllable's tone, drawn as a pitch curve on a faint three-line staff (the
  user's pick over Chao tone letters, which don't join into one line in phone fonts, and The Five
  Tones' arrows, which draw mid and low alike), with its transliteration and the tone's name;
- the rule for the picked syllable: class (and why: ห or อ in front, a cluster, อักษรนำ), tone
  mark, live or dead and why (only with no mark, which is when it matters), and the tone, with its
  Thai name (เสียงสามัญ…). For an exception it
  shows "Rules give" and "Said", and a note.

Picking a syllable lights its letters in the big word and says it (its school-spelling recording,
`sp`). The panel's open or closed state was remembered (`prefs.popTones`); since 2026-10-14 it's always
open, under a plain "Tones" heading, with no toggle or small curves (the user's call). Each tone has a colour
token (`--tone-mid` …) per theme.

**The word dialog (2026-10-11, experiment, branch `2026-10-11-tones-modal`):** the word pop-up had
too little room, so it became a dialog (`showWordPop` / `hideWordPop`, `#word-modal`; the
`#reader-pop` pop-up is gone). The same dialog opens for a story's word, a Topics row's Thai, and
the Thai on the back of a Flashcards or Recall card.
- **Card backs** (the user's request, same day): a tap on the back's Thai opens the dialog instead
  of saying the tapped letter's name (`tapCardThai` with `back`). The letters can be tapped inside
  the dialog. This covers the English → Thai answer and the smaller Thai on the Thai → English and
  Listen backs. On the front, tapping a letter still says its name, and a tap off the Thai still
  turns the card.
- **Transliteration and English** (the user's request, same day): on the Topics page, a row's
  transliteration or English cell opens the dialog for the row's card. That's the whole phrase for
  a phrase row, whose Thai opens its words one by one. On a card back, a tap on the
  transliteration's or English's text (`tapCardText`) opens it; a tap beside the text still turns
  the card.
- **Layout:** a card sized to its content; a long one scrolls inside. On a phone it's a full-width
  sheet from the top of the screen, its top edge flush (the user's call, 2026-10-12; it had been a
  card with a gap above). Elsewhere it's held near the top, not centred. Centred, picking another syllable changed its height and moved
  the syllable buttons out from under the pointer (the user's report, in Firefox).
  The transliteration and meaning are in its head, with ✕.
- **Body:** the word, large (tap a letter to hear it), the Topics rows' three buttons, and Tones.
- **Tones:** expands in place, and whether it's open is remembered. Open, it shows:
  - the syllable strip;
  - the picked syllable's rule, one fact per row:
    - Class, and why (ห or อ in front, อักษรนำ, ฑ said d);
    - Mark;
    - Vowel: long or short, its name, whether it's unwritten, and whether it's written one length
      but said the other;
    - Final: its sound and letter, or the vowel it's part of (ำ ใ ไ เ-า), and whether it stops
      the sound or can be held;
    - Syllable: live คำเป็น or dead คำตาย;
    - Tone; for an exception, "Rules give" and "Said".
  - An unwritten vowel says why under the Vowel row (`HIDDEN_WHY`, from tones.js `hiddenVowel`),
    added 2026-10-12 after the user asked about กก:
    - short o between two consonants (สระโอะลดรูป: คน, กก);
    - short a before the next syllable (สบาย);
    - ɔɔ in Pali and Sanskrit words (บริษัท);
    - ɔɔ before a final ร said -n (อักษร, ละคร).

    The Vowels Before a Final card คน now names สระโอะลดรูป and gives more examples.
  - Under a tone mark, which decides on its own, the Syllable row says so. Dimming Vowel, Final
    and Syllable for it read as a glitch to the user, so it went.
  - The whole tone table: class against live, dead short, dead long and the four marks. Each cell
    is a tone curve, the rule's cell is picked out, and a key follows.
- **Closing:** the backdrop, ✕ or Escape.
- **Removed:** the old pop-up's placing code (`placeWordPop`), its following a redrawn Topics row
  (`reanchorWordPop`, `data-pop`), and its close-on-outside-tap and close-on-resize handlers.
- `tones.js` gives each syllable's vowel and final as separate facts, and its table column;
  `tableTone()` fills the table.

**Audit check:** `tools/audit_decks.py` runs `tools/tones_check.mjs` (tones.js over every topic
card). It reports any syllable whose transliterated tone isn't the rules' as an error, unless the
syllable is listed in `tools/tone_exceptions.txt`. There are 141 listed, as said form and
transliteration (เตอร์ tə̂ə): loanwords, letter names, เขา, ก็ and a few exclamations and dialect
words. The check found four more typos when it was added: คราด khrâat, เป่ายิ้งฉุบ yíng,
ซาเล้ง saa-léeng and ก็ต่อเมื่อ gɔ̂.

**How:** `tones.js` `toneBreakdown(thai, translit)`, on `spell.js`'s new `syllableReading()` (the
school method's syllable match, with `at` and the said form) and `consonantClass()`.
- The tone said, and the vowel's length, come from the transliteration's marks. The rules give
  their own tone, and the two are compared.
- Where they differ, it tries อักษรนำ next: a lone low sonorant after a high or mid consonant
  with a short open syllable or ำ (ตำรวจ, ประโยค, สนุก). That rule is applied only when the
  transliteration agrees, since ขโมย and สมาชิก don't follow it. It also tries ฑ said d as mid
  class (บัณฑิต).
- What's left is an exception. Of 18,287 syllables, 264 (1.4%) are exceptions, nearly all
  loanwords, plus ก็ and เขา kháo.

**Live & Dead Syllables** (`script-live-dead`, Thai Script → Tones & Reading, between Tone Marks
& Symbols and Tone Rules), added after the user asked what "live" meant:
- 19 cards: คำเป็น and คำตาย; each way to be live (a long vowel; -m, -n, -ng; -i, -o; ไ ใ เ-า ำ)
  and to be dead (a short vowel; -k, -t, -p);
- the trap: ปาก is long but dead;
- one pair per class: ดุ/ดี, ขับ/ขา, มาก/มา.

The Five Tones and Tone Rules descriptions now point to it.

**Data fixes on the way:** 33 cards' transliterations had wrong tone marks, found by comparing them
with the rules:
- sa-baai → sà-baai, a-rɔ̀i → à-rɔ̀i, a-rai → à-rai, khuk → khúk, muk → múk, phǒn-la-máai →
  phǒn-lá-máai, naa-li-gaa → naa-lí-gaa;
- phûu-lîi-phai → phûu-líi-phai, ôong → òong, hân → hàn, met-taa → mêet-taa;
- -paa-raa-khaa → -pà-raa-khaa (eclipses), phǒk-phǎn → phòk-phǎn, sàn-phaa-gɔɔn → sǎn-phaa-gɔɔn;
- sák phák → sàk phák, hàk-hee → hàk-hěe, phǎn-phuan → phǎn-phǔan, gaa-lá-thêe-sà →
  gaa-lá-thee-sà, wí-sǎa-khá- → wí-sǎa-khà-.

## Core Words (2026-10-11), category `Core Words`

**Why:** measured against three Thai corpora in `research/freq/`, the decks had a card for only
56–59% of the commonest 3,000 words, and covered 88.7% of running spoken text, 83.6% of textbook
text and 80.5% of written text. Much of the vocabulary was topic-specific; frequent "glue" words
were missing (หาก, ดังกล่าว, สังคม, พัฒนา, ยอมรับ, ช่วยเหลือ). The corpora are spoken subtitles
(OpenSubtitles), written (TNC) and textbooks (TTC). The user chose option 1: about 700 words, aiming
for about 90%.

- **Choosing the words** (scratchpad `core/candidates.py`):
  - Missing words were ranked by their geometric-mean frequency across the three corpora. That
    favours words common in every kind of Thai and pushes down subtitle-only name fragments.
  - The top 850 were cleaned by hand. Out went foreign-name syllables split by the segmenter (ซี,
    รา, รี่, ลิ…), variant spellings (ปรกติ, เป้น), colours and days already carded in another form,
    and the 34 words just added for the story agents.
  - That left **756 words** in four shares (`core/shares.py`):
    1. linking words, grammar, time and quantity (206)
    2. society, government, history, religion, places and public life (180)
    3. verbs (197)
    4. feelings, people, describing words and things (173)
- **Cards and stories:** four agents, one per share (brief `core/brief_core.md`).
  - Each made themed topics of 8–25 cards (`decks/cards_core_N.py`) and stories using every new
    card (`decks/stories_core_N.py`).
  - `core/check_core.py` validates a draft. It uses `build_reading.py --extra-topics` with
    `--extra`, so drafts are tested without touching decks.json.
  - I read every card and story before `core/integrate_core.py` merged the share. The merge adds
    the topics after Spoken Thai, groups in share order, registers the stories, rebuilds and runs
    the checks. Each share was committed and pushed with its audio.
- **Result:**
  - **43 topics**, in groups Linking & Grammar, Society & Public Life, Actions, People &
    Description. Names start "Core Linking:", "Core Society:", "Core Verbs:", "Core Words:".
  - **756 cards** and **153 stories**, every new card in a story.
  - **Running-text coverage:** spoken 91.8%, textbook 90.8%, written 88.9%.
  - **Commonest 3,000 words with a card:** 73% spoken, 78% textbook, 81% written.
  - **Totals:** 490 topics, 1,299 stories, 8,023 Thai entries.
  - Cards outside Thai Script that appear in a story: 99.7%.
- **On the way:**
  - The audit allows stories up to 90 cards (`STORY_MAX`). Some Core Words stories, eight full
    sentences each, reach about 80.
  - เดือด became "to boil, come to the boil (of a liquid)" so it doesn't share "to boil" with ต้ม in
    a story.
- **Words the agents still found missing** (plainer wording was used instead):
  - เวทมนตร์, มิตรภาพ, ลุกลาม;
  - แต่ as "only", คำ as "mouthful", ตน and องค์ as classifiers;
  - pipe, pump, placenta;
  - โปรด as "favourite", ขน as "to carry".
- **Next step for 95%:** about 2,000 more words, mostly formal and written.

## Leading ห & อ topic (2026-10-13)

The user asked why ห in front of ม makes หมา high class; the answer (ห นำ, อ นำ ย, and a letter
lending its class across syllables, all อักษรนำ) became a topic in Thai Script → Tones & Reading,
after Tone Rules: `script-leading`, 25 cards.
- The two rules as cards (ห นำ, อ นำ ย, with `say` หอ นำ / ออ นำ ยอ so the letters are read by
  name) and the four-word mnemonic อย่าอยู่อย่างอยาก.
- Seven pairs, a low sonorant alone and led by ห: มา/หมา, นา/หนา, มี/หมี, ลาย/หลาย, เงา/เหงา,
  วาน/หวาน, and ไม้/ไหม้ (a marked one: high, then falling). The four อ words, with notes comparing
  ย่า, ย่าง, ยาก. Four two-syllable words where the first letter lends its class: ขนม, สนุก, อร่อย,
  ขยัน.
- All 22 words already had cards in other topics, so they use the same English and
  transliteration (no new Words page entries); only the notes are this topic's.
- A tile board (its `board`): the seven pairs, the four อ words, the four two-syllable words. The
  word dialog's Tones panel already explains each case ("ห in front makes ม high class").
- อย่าอยู่อย่างอยาก moved here from Clusters & Odd Spellings (one card, not two).

**Poetry** (2026-10-14, the user's pick of all four suggestions: rhyme, the forms, poems to read,
poetic synonyms).
- **Rhyme & Alliteration** (Thai Script → Words & Spelling, 25): six rhyming sets as a board, the
  tones mixed (ดาว ข้าว ขาว), two pairs that don't rhyme (กัน/การ on length, เรียน/เรือน on the
  vowel), and three alliterating words. The words are existing cards with this topic's notes.
- **Culture & Values → Language & Literature**, after Literature: Classics & Stories:
  - **Poetry: How Verse Works** (20): the กลอนแปด line names (วรรคสดับ…ส่ง), the rhyme chain and
    preferred end tones in the `about`, สัมผัสนอก/ใน, กาพย์ยานี, โคลงสี่สุภาพ, คำเอก/โท, ครุ/ลหุ,
    ทำนองเสนาะ, ฉันทลักษณ์, กลอนเปล่า, นิราศ.
  - **Poetic Words: Nature** (25) and **People & Things** (23): คำไวพจน์, several words for one
    thing, so each gloss says how it differs (the audit forbids the same English twice in a topic:
    "moon (lit. "hare-bearer")"). จันทร์ "the moon (literary)" is here, and the old story Grandma's
    Lullaby now uses it (it had only the Thai Script spelling example).
  - **Poetry: Words in the Poems** (21): the poems' words no other topic had (every story word
    has a topic card).
- **Four poems on the Reading page**, a line per วรรค, named "Poem: …":
  - **First Rain** (Easy) and **The Morning Market** (Medium): กลอนแปด written for the app, one
    and two stanzas, keeping the rhyme chain and the preferred end tones. Their descriptions point
    out the rhymes.
  - **O Moon, Dear Moon** (Easy): the traditional lullaby จันทร์เจ้าเอ๋ย, its widely sung opening.
    Folk versions vary, and no authoritative text could be fetched (search 2026-10-14), so the
    description says it's one common version.
  - **Two Verses by Sunthorn Phu** (Harder): the ถึงบางพูด stanza from นิราศภูเขาทอง as Thai
    Wikisource has it (from ประชุมนิราศ, 1938: "เป็นศรีศักดิ์"; ThaiPBS quotes "มีศรีศักดิ์"), and
    the couplet รู้สิ่งไรไม่สู้รู้วิชา… from พระอภัยมณี, spelt ไร as ThaiPBS and others have it (old
    Thai for ใด; its stanza wasn't found to check against).
  - The voice reads verse flatly, not in ทำนองเสนาะ.

**What schoolkids learn that the app didn't have: five topics** (2026-10-13). The user asked what
Thai schools teach about script and language that the app lacked; of the gaps found, they picked
these five. Each is in Thai Script, with an `about`:
- **Vowel Symbol Names** (Vowels, 17 cards): the 21 รูปสระ less ฤ ฤๅ ฦ ฦๅ (already in Diphthongs &
  Special Vowels). Cards are the marks on ◌ (◌ะ, เ◌; ◌ั and ◌็ copied from Tone Marks & Symbols),
  `translit` the name, `english` the job, `say` the name. ฝนทอง and ฟันหนู have no character of
  their own, so they are shown as ◌ี and ◌ื. A `letters` board by position: before, after, above
  (two rows of three: six overflowed a phone), below, and อ ย ว.
- **Words & Spelling**, a new group after Tones & Reading:
  - **Reading Compounds** (17): สมาส with the linking sound (รัฐบาล, ภูมิศาสตร์ against ภูมิใจ,
    ผลไม้ and พลเมือง linked anyway), and สนธิ, merged vowels (ธนาคาร, สุโขทัย, นโยบาย).
  - **Homophones & Homographs** (20): six same-sound sets (ค่า ฆ่า ข้า, บาท บาตร, ศาล สาร สาน,
    พัน พันธุ์ ภัณฑ์, จันทร์ จันทน์, โจทย์ โจทก์) as a board; สระ, ตากลม and พยาธิ read two ways;
    ขัน and ตา, one word with several meanings. The audit forbids the same Thai twice in a topic and
    two readings in one `translit`, so each homograph is one card: the main reading as `translit`,
    both in `english` ("pond (sà); also vowel (sà-rà)"), and both in `say` (สะ สะหระ) so the
    audio has the two. สระ is in `SAME_THAI_TRANSLIT_OK`.
  - **Native or Borrowed** (20): a rule deck (`english` names the sign, the meaning starts the
    note): native, Pali and Sanskrit, Khmer, Chinese and English words, by the signs schools teach.
  - **Commonly Misspelt Words** (20): the right spelling, its meaning, and the usual mistake in
    the note. The wrong forms in the notes are tap-to-hear like any Thai there; left as they are.
- อ ย ว are in `SAME_THAI_TRANSLIT_OK`: the letters' names against tua ɔɔ, tua yɔɔ, tua wɔɔ.
- **Bare marks in text:** a combining mark after a space (", add ำ") draws on the space, so 38 in
  notes and `about`s, in these topics and older ones, got a ◌ base (◌ำ, ◌่). The older "–" base
  (เ–็) was already fine and is left.

**Clusters & Odd Spellings, 11 more cards** (2026-10-13, after the user asked for more rules like
ห นำ; now 24), with an `about` for them:
- ฑ read as d (บัณฑิต) or, usually, th (มณฑล).
- ฤ's three readings: rʉ alone or after ค น พ ม ห (ฤดู), ri after ก ต ท ป ศ ส (อังกฤษ), rəə in
  ฤกษ์.
- A final ติ / ตุ not read (ญาติ, เหตุ), and the ติ back in a compound (อุบัติเหตุ).
- Spoken against written tone: ฉัน chán, ไหม mái, เขา kháo, with `say` ชั้น / มั้ย / เค้า so the
  audio has the spoken tone. Everywhere else ฉัน and ไหม keep the spelt chǎn, mǎi (เขา was already
  kháo), so both are in `SAME_THAI_TRANSLIT_OK` (tools/audit_decks.py) and `tone_exceptions.txt`.
- As a rule deck, `english` names the rule in romanisation (no Thai in `english`: tho montho,
  the letter rʉ), and the meaning starts the note.

## Touch targets, pressed state, reduced motion, focus (2026-10-13)

The user asked what other display and button guidelines the app should follow. A check of every
tappable thing on a 390px phone, and of the styles, found four, all fixed:
- **Tap targets at least 44px tall on a phone** (Apple's guideline; WCAG 2.5.5, with 24px the
  WCAG 2.2 floor). They were: the segmented rows 29px, the reader's toggles 27px, the picker's
  "All of" buttons 25px, Spelling's ⓘ 21px, ghost buttons 31–36px, number boxes 32px, ✕ 38px,
  setting headings 40px. mobile.css sets `min-height: 44px` on them; desktop keeps its sizes.
  Left as they are: words in text and story lines (WCAG exempts targets inside a sentence), the
  table's translit and English lines (with the Thai, one 76px target), the switches (their 52px
  row is the target) and the A badge (a 50px `::before`). Cards still fits a phone screen; its
  card is ~30px shorter.
- **The text in them sized to match** (the user's next ask): 15px at least on a phone (the segmented
  rows, the reader's toggles and the picker's "All of" buttons were 13px, its headings 14px), the
  everyday buttons 16px (Add all, Read all, Read, ‹ All letters, the topic button, the settings
  buttons; from 15px). Icons are em-sized and grew with it. Nothing is cut off at 320 or 390px
  (at 320 the reader's toggles take two lines beside Read, as they already did at 13px).
- **A pressed state:** phones have no hover, so a tap showed nothing until its action happened.
  `button:active` (and role=button, summary, setting rows) gets an inset tint (`--press`: white
  10% on the dark themes, black 8% on Light), which moves nothing. iOS shows `:active` only with
  a touchstart listener, so app.js adds an empty one.
- **Reduce Motion** (`prefers-reduced-motion`): only the sound waves honoured it. Now every
  animation and transition is instant (the card flip, the pulsing Next, the accordion, toasts),
  and the JS scrolls jump instead of gliding (`SCROLL_BEHAVIOR`).
- **Keyboard focus:** the flashcard (focusable; Space flips it) hid its focus ring; it now shows
  an accent outline with `:focus-visible`.
- Not done (low priority): about 20 controls explain themselves only in hover tooltips (`title`),
  which phones never show; the important ones say the same on screen.

## From memory: how strict, a setting (2026-10-15)

The user sent a screenshot: a loose ธ passed. Replayed in the app (its yellow line taken from the
screenshot, cut to its centre line, drawn on the pad as ธ): the model was **14% sure** of ธ, its
first pick by a little (อ 10%), and the rule then, first pick or 10%, passed it.
- **Settings → Writing → Check** (settings.writeCheck, WRITE_CHECK): **Lenient** is that rule;
  **Normal** (the default now) the first pick and 60% sure (a part: first among its place's shapes,
  80% of their share, and 10% of the whole belief); **Strict** 85% (a part 90% and 20%), and the
  drawing's shape on the letter's too (writeScore's f1 ≥ 0.6). The help line under it says which.
  Calibrated on Burapha-TH's test writers: right consonants pass 98.8% / 95.6% / ~89% (the model is
  97.9% sure of a right one in the median, over 83% for nine in ten); right parts 98.5% / 97.2% / 95.0%.
- **The feedback says how sure:** "✓ That's ธ! · 97% sure", "Not quite: here's ธ. · 14% sure" (when
  it was the first pick but not sure enough); for a vowel or mark, its least sure part.
- Checked: the screenshot's ธ passes Lenient and fails Normal and Strict; the font letters (88) pass
  Normal and Strict, the wrong ones (10) fail; tone marks 4/4 and vowels 30/30 at Normal, look-alikes
  caught as before. The fonts' letters warped hard still read 100% first: the model sees through a
  shaky line, so it's a loose letter's low confidence, not its wobble, that fails it.

## What lines up: tools/check_layout.py (2026-10-16)

The user asked for a list of everything they'd asked to line up, match or stay put, and for it all
to be checked after each new request. `python3 -u tools/check_layout.py` (the server on :8765) checks
each at 390 × 664, 763, 844 and 430 × 932 (or the sizes given; `--text-size 2` for the largest text),
with real taps through CDP, and exits 1 on a failure; screenshots go to
~/snap/chromium/common/learnthai-shots-out/layout. It measures relationships (as tall as, level
with, where the other is), not pixels, so it holds at any phone size. What it keeps, with when the
user asked:
- **The top row:** the topic or set picker as tall as the page switch, tops level (10-14); the
  Dictionary's Thai | English where the Alphabet's Letters | Cards | Write is (10-14); Settings'
  search where the Dictionary's is, as tall (10-14); the row pinned as Topics, a Dictionary letter
  and Settings scroll, its line only once scrolled (10-14); the word dialog between the top row and
  the tab bar (10-14).
- **Alphabet → Letters:** the hint / letter row pinned (10-15); one height for the hint and a
  letter's line, the grid not moving (10-15); one height on Consonants, Vowels and Tones (10-15); the
  hint 16 px in from each end (10-15); every vowel tile one width (10-15).
- **Write's row:** as the Letters row, part for part (10-15); Trace → From memory moves nothing
  (10-14, 10-15); the speaker at the right end, Details before it (10-16), as on Letters (10-16).
- **Write and Cards:** Trace | From memory level with Browse | Recognition | Recall (10-15); the pad
  where the card is (10-15); ‹ › where Cards' are (10-14), 18 px above and below, clear of the tab bar
  (10-15).
- **Cards:** the card one shape in Browse, Recognition and Recall, the answers and grades where ‹ ›
  are, the card's size held question to question with answers at 12 px or more, Recall's card the
  same arriving from elsewhere (10-16); Type's card and box the same (10-19), and with a phone's
  keyboard up the card and box above it, the box keeping the focus, the page held at its top
  (10-19); a letter or
  short word filling the card's front, long text inside it (10-16); an Alphabet card's back whole,
  the letter twice the words (10-16); Browse's 🔀 in the middle of ‹ ›, level with them (10-21).
- **Tile boards:** the Thai Script topics' rows centred, tiles one width (10-13).
- **A wider screen** (1280 × 800, `web_checks`): each section's switch in one place on all its pages,
  in a row of its own above the topic button, the three centred alike at one height; the topic
  button in one place on every page, scrolling or not; each page's name beside its icon at 16 px;
  the switches 16 px under the top bar (10-18); Cards' 🔀 centred under the card, Browse fitting
  without a scroll (10-21).
- **A field's keyboard up:** the tab bar hidden, and back when it goes (the Dictionary's search,
  10-19).
- **The new-version bar:** one line, Reload 44 tall, the page's width, 12 over the tab bar (10-19).
- **The phone's bar:** Alphabet, Words, Dictionary, Time, More; More's list Home and Settings,
  Settings last (10-22; More had Time and Settings from 10-21, Home on the bar).
- And no script errors, no sideways scroll.
A new request of the kind gets a check here.

## Your lists: what List, Cards and Reading show (2026-10-20, a spike: branch `2026-10-20-spike-custom-topics`)

**Status: an experiment** ("if it is good we will keep it, if it is shit we'll drop it"). The user
found the old split "a bit weird": Cards held only the words added with 🔁, while Reading showed the
topic's stories. Their idea: Cards and Reading show what the picker chose, which is a topic,
Everything, or a list of your own, kept up on the List page. The details below were proposed and
the user said yes to all of them.
- **The picker's tabs:** **Topics | My lists | Everything** (`renderPickerTabs`; data-picker-tab).
  They replace Cards' Everything / By topic. Everything shows only from Cards and Reading. It picks
  at once and closes the dialog, as before. Topics and My lists only switch the pane; a choice is
  made by tapping a row. My lists has a row per list (with its progress, as a topic's) and
  **＋ New list**, which asks for a name in the confirm dialog's new text box (`askListName`;
  `confirmDialog({ input })`). The new list is picked and, since 2026-10-22, its List page shown,
  whichever page the picker was opened on (the user's call: from Cards it stayed on Cards, an empty
  list's; the List page has Add words). Cancel leaves you where you were. Checked (scratch
  `newlist.py`) from Cards, Read and List at 390 × 844 and 1280 × 800: each on List, the new list
  picked; Cancel on Cards; no script errors.
- **One choice for the three pages:** `state.currentDeckId` can now be `list:<id>` (resolveScope's
  `kind: 'list'`, with no decks; deckOf is each word's first topic). Everything (prefs.flashcardsBy
  `'all'`, the old name kept) applies to Cards and Reading (`studyScope()`). The List page keeps
  showing the topic or list underneath, as it did when Everything was Cards' alone.
- **Cards shows every word in its scope** (`buildFlashcardQueue`, `reviewPool`). It used to show only
  the words you'd added. Recall's new words come in the scope's order; a list's order is the order
  you added. Everything is the topics' 8,743 words (stories left out, since they reuse those words).
  Recognition's wrong answers there come from the card's own topic (`distractorPool(card)`), as all
  8,743 would be easy to rule out. A list with no words shows "'…' has no words yet" with **Add
  words** where the card would be. The old three-way message went.
- **Reading:** a list's stories are matched as a topic's are (two or more of its words, `storiesFor`).
  **Everything lists every story** (`renderAllStories`). That reverses the 2026-10-08 call that there
  would be too many; the user agreed to it here. They're shown by level (Little Stories 23, Easy 811,
  Medium 439, Harder 64), each under a heading styled as the picker's categories, one level open at a
  time. Only the open level is drawn.
- **Reading in pages, with a search** (the user's call the same day: a list's stories ran to hundreds,
  216 for all of Food & Drink). Any Reading list shows 10 stories, then **Show 10 more · N left**
  (`pagedStories`, `READING_PAGE`); the open story always shows. **Search stories** (`#reading-search`)
  sits left of Read all, in the row that was empty on a phone, at Read all's height. A Thai query
  matches the stories' Thai (word breaks ignored); anything else matches the title, description and
  English (`storyMatches`). A search's matches come 10 at a time too. Showing every match was
  tried first, because paging them "seems weird", but the user found it looked worse. On Everything,
  a search covers every level at once, with no headings.
- **A list matches fewer stories** (the user's pick from three fixes, with the paged search): a story
  shows if at least a quarter of its words (`READING_LIST_SHARE`, the common ones aside) are in the
  list, those mostly in it first. All of Food & Drink: 45 of the 216 that two words found;
  People & Relationships: 42 of 168. When that leaves fewer than a page, the list keeps the two-word
  rule, in the same order, or a short list finds almost nothing (Greetings: 2 of 13). Topics,
  groups and categories are as they were. A new topic, list or
  level starts again at the first page with the search cleared (`readingFor`).
- **Read all reads the whole list** (the user's request, the same day; it read only the stories
  drawn, so nothing on Everything with every level closed). It takes the list from `readAllStories`,
  pages included, and a story it reaches that isn't drawn redraws the list: past a page, the next 10
  show, as Show more does; on Everything, its level opens, at the first page. On Everything, with a
  level open it reads that level; with all closed, every level in turn (1,337 stories). Checked in
  headless Chromium with the audio stubbed: Little Stories into Easy, a page added every 10, on
  Everything and on all of Food & Drink; Pause and carry on (`readall_probe.py`, `readall_probe2.py`).
- **Change, on the add toast** (the user's request, the same day: a word added to the wrong list).
  "✓ Added กิน to 'My words'" (🔁 anywhere, or Add all's "Added 22 words") has a **Change** button
  and stays 5 s (`TOAST_ACTION_MS`), longer while a finger, the mouse or focus is on it
  (`holdToast`). Only the button takes taps: a tap on the message reaches the row under it. The
  message wraps to two lines rather than cut off a long list name. Change opens **"Put กิน in"**
  (`openMoveWords`, `#move-modal`, the confirm dialog's small card): **Add new words there too**, then
  your lists with their word counts, the one it's in ✓, then ＋ New list. A tap on a list moves the
  words and closes it, saying "✓ Moved … to '…'", with Change again. With the box ticked, that list
  becomes the target as well (and the adding bar's, while adding from a topic). ＋ New list asks a
  name, then moves the words there; it's the target only if ticked (`createList`'s `target`). Of the
  three designs offered, the user was torn between a choose-then-Done dialog and a tap-to-move one
  with a second toast offering "Always add here"; this is the second, with that offer as the tick box
  instead, since a second toast is easily missed.
  - The word dialog's and word search's 🔁 (`reviewButton`) read the target list each time they're
    painted, and `listsChanged` repaints them (`b.paint`), so they're right after a move. They kept
    their own added flag before.
  - Checked in headless Chromium at 390 × 664 (text size 1 and 2) and 1280 × 800 (`move_probe.py`,
    `move_probe2.py`): the 5 s, a move with and without the tick, from the word dialog, ＋ New list,
    Escape, Add all's 22 words, a long name wrapping, taps passing under the message.
- **The List page in pages, with a search** (the user's call, the same day: a list can grow without
  end). As Reading's stories, but 25 rows at a time (`WORD_PAGE`; 10 is too few for words), with
  **Show 25 more · N left** under the table (`#wordlist-more`, `pagedWords`). **Search these words**
  (`#wordlist-search`) sits over the table once there's more than a page. It keeps list order: a
  Thai query matches the Thai (spaces ignored), anything else the English, or the transliteration
  loosely (`wordMatches`, `looseTranslit`). Lists, groups and categories page; a topic shows whole
  (they're 25 at most, but the 44 consonants are one). A new scope starts at the first page with the
  search cleared (`wordsFor`). Read all reads every match, showing the next page as it gets there.
  Add all still adds all the scope's words, not just a search's. Checked in headless Chromium at
  390 × 664 and 1280 × 800 (`words_probe.py`, `words_probe2.py`): all of Food & Drink (273 words),
  Show more, "rice", ข้าว, "khao", no match, Read all past three pages, My words, a topic and the
  consonants whole. The layout check wasn't run (the user's call).
- **Add words' bar pinned** (the user's call, the same day, for the phone: it scrolled away, under
  Add all and Read all). "Adding words to … Done" (`#adding-bar`, now `.adding-pin` round the bar)
  moved out of the List page into the top bar, after the pinned topic row and before Add all and
  Read all. On a phone it's pinned under that row (`top: var(--pinned-h)`), taking the gutters, the
  page's colour with a hairline once scrolled, as the Alphabet's letter line is; `scroll-padding-top`
  grows to 162 while it shows, so Read all's rows stop under it. On desktop it's a full-width row at
  the head of the bar (`order: -1`), over the topic button, and scrolls away. Checked at 390 × 664,
  390 × 844 (text size 2) and 1280 × 800 (`adding_probe.py`): under the row at rest and scrolled
  1200, a row scrolled to stopping at 162, gone on Cards and Reading and after Done.
- **Everything dropped** (the user's call, the same day: not useful). The picker's Everything tab is
  gone, so it's the same dialog from List, Cards and Reading: "Choose a topic or list", Topics | My
  lists (`pickerFor` is 'add' or 'study'; 'flashcards' and "What to study" went). Cards and Reading
  show the List page's topic or list (`flashScope` is `currentScope`; `flashcardsByAll`, `studyScope`
  and `setFlashcardsBy` went, and a saved `prefs.flashcardsBy` is ignored). Reading's levels went with
  it (`renderAllStories`, `storyLevels`, `state.readingLevel`), as did Recognition's own-topic wrong
  answers on Everything and the picker's short sheet for it (`.review-all`). `resolveScope('all')`
  stays: a list of fewer than 3 words takes its wrong answers from every topic. The bullets above
  that describe Everything are history. Checked in headless Chromium at 390 × 664 (`noall_probe.py`):
  the picker from each page, a list picked from Reading reaching Cards, Recognition on a 2-word
  list.
- **A word taken out of the list shown is faded** (the user's call, the same day). On a list's List
  page, a row whose word is no longer in that list (✓ tapped, or moved away by Change) has its text
  at 40% opacity (`tr.row-removed`), fading into whichever theme's panel, its buttons as they are: it
  still opens the word dialog, and 🔁 puts it back, unfading it. It's gone the next time the page
  opens (`freshListCards`). Checked in headless Chromium at 390 × 664 in Dark and Light
  (`faded_probe.py`). Putting one back there (its row's 🔁, or its dialog's over the page) says "✓ Re-added …",
  without Change (the user's call, the same day: it's going back where it was; `toggleInTarget`).
  Adding from anywhere else keeps "Added" and Change (`readd_probe.py`).
- **My lists has a search** (the user's request, the same day), the same box and hairline as Topics'
  ("Search your lists and their words…"): a list shows if its name has the text, or one of its
  words matches it as the List page's search does (`wordMatches`: Thai, English, transliteration).
  ＋ New list stays under them; none found says so. Changing tab clears the search (a topic's and a
  list's are different searches); Enter picks the first. Checked in headless Chromium at 390 × 664
  (`listsearch_probe.py`): "food", "rice" and ข้าว finding Food words, no match, the tabs, Enter.
- **"Wordlist", not "list"** (the user's calls, the same day): the picker's title is "Choose a topic
  or wordlist", its second tab "My Wordlists", its search "Search your wordlists"; ＋ New wordlist
  (and its dialog's Make wordlist), Rename wordlist, Delete wordlist, the empty texts, the Home card,
  Settings' help and confirms, and a backup's summary ("2 wordlists, …") say it too. "List" as the
  page's name (List | Cards | Reading, Settings → List) stays. Then, seeing it, the user found "My Wordlists"
  awful: the tab is **My Words**, its search "Search your words", and the button ＋ New list again
  (its dialog New list, Make list). Everything else went back to "list" too (the user's call, on a table of
  them): "Choose a topic or list", Rename list, Delete list, the empty texts, Home, Settings and the
  backup's summary. So only the tab and its search say "words".
- **No known count on a list's row** (the user's call, the same day: "what is it for?"). The picker's
  rows show how many words are known (the meaning held 10 days or more, `deckProgress`) as
  "known/total", with a bar on desktop. A list's row leaves both out (`pickerDeckRow`'s `progress`),
  since its "N words" says the total, and takes the whole width (`.deck-row.list-row`). Topics keep
  theirs. Checked at 390 × 664 and 1280 × 800.
- **The tabs' taglines went** (the user's call, the same day): "The app's words, by subject" and
  "Words you've chosen, from any topic" under Topics | My Words. The line under the tabs shows only
  when adding words ("Pick a topic, then add its words to '…'"; `renderPickerTabs`). Topics' search
  says just "Search topics" (it was "Search topics and words…"; it still finds words too).
- **No "N words" under a list's name on the List page** (the user's call, the same day); the picker's
  row keeps it. Rename and Delete list sit 12 under the name, as the table sits 12 under them (they
  were pulled up 4 to tuck under the count).
- **No Change while adding words** (the user's call, the same day: "I am conceptually inside the
  list"). With Add words' bar over a topic, its 🔁, its word dialog's and its Add all say "✓ Added …
  to '…'" without Change (`toastAdded`). Elsewhere they keep it. Checked at 390 × 664. A word taken out
  there (its ✓) is faded too, as on the list's own page (`state.takenOut`, kept by `setInTarget` while
  `addingFrom()`), and putting it back says "Re-added". The fades clear with a new topic or when the
  page opens afresh, the topic's rows staying (they're its words). A word put in on this visit and
  taken out again isn't faded (the user's call, 2026-10-21): it's as it was, 🔁, and only a word that
  was in the list before fades (`state.addedHere`, kept by `setInTarget`, cleared with the fades).
  Checked at 390 × 664 (scratch `addedhere_probe.py`): a new word in and out plain, in again
  "Added"; a word from before faded, "Re-added", faded again.
- **The toast's ✓ beside its message** (the user's call, the same day: on a two-line message it sat
  at the start of the first line). A toast with a button splits a leading ✓ into its own `.toast-tick`,
  centred against the message, which wraps beside it (`toast`). Every toast now wraps that way, not
  just those with a button (a long one ran off a phone).
- **Which lists a word is in** (the user's pick of three ideas, the same day; tooltips don't work on
  a phone):
  - **🔁 has three states** (`reviewButton`, now on the List page's and the Dictionary's rows too):
    ✓ in the list 🔁 adds to; 🔁 with a green dot at its top right in another of your lists
    (`.row-review.elsewhere`); plain 🔁 in none. Its title names the others, for desktop.
  - **The add toast says where else:** "✓ Added กิน to 'My words' · also in 'Food words'" (two names,
    or "3 other lists"; `toastAdded`, `listNames`).
  - **The word dialog listed your lists, for a few minutes** (the user's trial): a "Lists" row of
    chips under its buttons, a tap putting the word in a list or taking it out. The user didn't
    like it there and took it out: the dialog stays information about the word, for now.
  - `listsOf(key)` gives a word's lists from a map rebuilt after any save (`listsOfCache`).
  - Checked in headless Chromium at 390 × 664 and 1280 × 800 (`three_probe.py`): the states on
    Greetings, the toast, the dialog's 🔁, the Dictionary.
- **🔁 adds to a list:** the topic rows, the Dictionary, word search and the word dialog all add to
  the **target list** (prefs.targetListId). That's the list last picked, made, or opened with Add
  words, else the first list; if there's no list yet, the first 🔁 makes "My words". Toasts and
  titles name the list. On a topic, Add all says "Add all to My words" (a long name ends in …), or
  "✓ All in …" to take them out (`setInTarget`).
- **The List page for a list:** its name and "N words", **Rename** and **Delete list** under it, and
  **＋ Add words** where Add all is. Its rows show ✓ (they're in it): a tap takes one out but
  leaves the row, showing 🔁, so a second tap puts it back. The rows are refreshed next time the
  page opens (`freshListCards`). Add words opens the picker ("Add words to '…'", Topics | My lists,
  without this list). Picking a topic or list shows it with a bar over it, "Adding words to …" and
  **Done** (`state.addingTo`, `#adding-bar`). Its 🔁 and Add all go into the list, and Done goes back to it.
  **More topics while adding** (the user's report, 2026-10-22: a second topic picked from the topic
  button lost the bar, a plain pick ending adding): while the List page is adding (`addingFrom`), the
  topic button opens the picker as Add words does (its title, without the list), so each topic
  picked keeps the bar; Done ends adding, and the button's picker is plain again. Checked (scratch
  `addmore.py`) at 390 × 844 and 1280 × 800: the bar through three topics, gone after Done and after a
  plain pick; no script errors.
- **Storage:** `store.lists`, `[{ id, name, words: [cardKey…] }]`. `migrateLists` makes "My words" from
  `store.reviewWords` (in the order added) on the first load and **leaves reviewWords as it was**, so
  dropping the spike loses nothing on master. Settings → Reset → Clear Cards went (lists are deleted
  on their page). The texts saying "the words in Cards" now say "your lists" (Reset, Backup, Settings
  → List's confirms, the Home card's 🔁 line). A backup lists its lists, and one from before the
  spike becomes My words when loaded.
- **Checked** in headless Chromium at 390 × 664 and 1280 × 800 (scratch probes `lists_probe.py` and
  `lists_probe2.py` in learnthai-shots-out). Checked: the migration; 🔁 on a topic; the tabs from List
  and from Cards; Cards in Browse, Recognition and Recall on a list and on Everything (1 / 8743);
  Reading on a list and on Everything's levels, a story opened inside one; Add words from a topic and
  from another list, Add all and Done; the Dictionary's 🔁 reaching Cards on that list; New list,
  Rename and Delete. No script errors and no sideways scroll. `check_layout.py` no longer taps Add
  all before Cards, since Cards no longer needs words added. Not yet on the iPhone.
- **A list's name with the keyboard up** (the user's screenshots, 2026-10-21): iOS let the page be
  dragged by as much as the keyboard covers, the dialog off the top, and its buttons sat under the
  keyboard's bar. While the dialog's box has a touch screen's keyboard (`html.dialog-kb`,
  `fitDialogKeyboard`) a drag is stopped and a scroll put back, as for Type's box (`holdStill`,
  `holdTop`, now taking both), and the dialog is centred in what the keyboard leaves (bottom padding
  `--kb-h`, the page's height less the visible one; 0 where a browser shrinks the page instead).
  Checked headless with a faked keyboard (scratch `dialogkb_probe.py`, 390 × 844 and 390 × 664 at
  text size 2): the dialog clear above it, drags stopped but in the box, and as before once it goes.
  No layout check (the user's call). It's held where the page behind it was, not at the top (A field's keyboard: a
  drag closes it).

## Topics: Saying the Date, and How Long & How Long Ago (2026-10-21)

The user's call: of the Time section's ideas, Dates and "How long and when" go in Words as topics,
where they weren't already. The words were (Months & Calendar has the months, วันที่, พ.ศ.; Days of
the Week the days; Time Markers เมื่อ, ก่อน, นาน), but not the phrases, as Telling the Time: Minutes
has them. Two topics in Basics → Time & Date, after the three Telling the Time ones:
- **Saying the Date** (20): what's the date and what day (วันนี้วันที่เท่าไหร่, วันนี้วันอะไร), a
  date the Thai way round (วันที่ยี่สิบเอ็ดตุลาคม; วันอังคารที่ยี่สิบเอ็ดตุลาคม), the year
  (ปีสองพันห้าร้อยหกสิบเก้า, พุทธศักราช, คริสต์ศักราช), the start, middle and end of the month
  (ต้นเดือน, กลางเดือน, ปลายเดือน, สิ้นปี), a birthday and the zodiac year (เกิดปีอะไร, the
  Questions topic's card as it is), every 1st, from the 5th to the 10th, by the 30th, once a month,
  putting off to Friday, a long weekend.
- **How Long & How Long Ago** (22): how long (นานเท่าไหร่, ใช้เวลาประมาณสองชั่วโมง), hours and
  halves (สองชั่วโมง, ครึ่งชั่วโมง, ชั่วโมงครึ่ง), from now (อีกสิบนาที, อีกไม่นาน), ago
  (สามวันก่อน, สองปีที่แล้ว, นานแล้ว, ไม่นานมานี้), all day / night (ทั้งวัน, ทั้งคืน, ตลอดทั้งปี),
  up to now (อยู่ที่นี่มาสองปีแล้ว), within a week, have you waited long (รอนานไหม / ไม่นานเลย).
  Its description puts ชั่วโมง (how long) beside โมง (what time), the mix-up learners make.
- **Phrases** list their `words` (each word's card, the right sense picked: วัน "day", ที่ the
  ordinal, ถึง "until", เลย "at all"); เดือนละครั้ง is เดือน + ละ + ครั้ง (the longest-word split
  found ละคร, "drama"). ต้นเดือน, กลางเดือน, ปลายเดือน and สิ้นปี are words, as ข้าวเหนียว is (no
  ต้น card means "beginning"). Spoken เท่าไหร่ in the questions, with a note that it's เท่าไร in
  writing. Checked against docs/thai-writing.md.
- **The steps:** audit 0 errors (and nothing worth a look on the new cards; the tones as spelt),
  stories.py check and sync (nothing to change), spelling.mjs --write, gen_audio.py.

## Browse: a random card, and ‹ › going round (2026-10-21)

The user's request, from a screenshot of Browse on Hard Vowels: a random button between ‹ and ›,
‹ › going back round at either end, and "? / 17" for a random card.
- **🔀** (`#random-btn`, `goRandom`): between ‹ › on a phone, in the grid's middle column (`1fr auto
  1fr`, so it's centred on the card), 56 px and level with them; on a wider screen under the card,
  centred, 12 px under it as ‹ › are beside it. A crossed-arrows icon (`.shuffle-icon`), plain like
  ‹, since › keeps the accent. **R** draws one from the keyboard. It's Browse's, on Topics' and the
  Alphabet's Cards; Recognition and Type hide it with ‹ › (`.nav-btn`).
- **The draws:** a shuffled bag of the queue's places (`state.randomBag`, kept with the queue it was
  drawn from, so a new queue or scope starts a new one): every card comes once before any comes
  again, never the card on screen. ‹ › go on from the card drawn.
- **"? / 17":** till ‹ › move on from the card drawn (`state.randomAt`, `{ queue, pos }`, which ‹ ›
  clear, as does a rebuilt queue); in a topic's own order the number would give the word away. Come
  round to it again and it has its number (the user's report, the same day: the "?" came back).
- **Going round:** › on the last card is the first, ‹ on the first the last; the buttons are
  disabled only with a single card (› plain then, as it was at the end).
- **A wider screen's foot:** 🔀 put Browse 11 px over 1280 × 800, so Browse's stage there has 24 px
  under it rather than 32 (`@media (min-width: 601px)`); it fits again.
- **Checked** headless (scratch `random_probe.py`) at 390 × 664, 390 × 844 at text size 2 and
  1280 × 800: 🔀 centred between ‹ › and level with them, ‹ from 1 / 25 to 25 / 25 and › back, 24
  draws reaching every other card, "? / 25" then › showing a number, R, none of it in Recognition,
  the Alphabet's Cards the same, no scroll and no script errors. `check_layout.py` checks the place
  (What lines up).

## Time: Explore (2026-10-21, a spike: branch `2026-10-21-spike-time`)

The user's call, after a sketch they liked: a **Time** section, Explore first (Quiz to come), on a
spike branch as they're unsure of it; **More** back on a phone's bar, with Time and Settings in it,
Settings always last.
- **Where:** a phone's bar is Home, Words, Alphabet, Dictionary, **More** (`#tab-more`, kept hidden
  since 10-14, its list and code ready); its list is Time, then Settings. `#tab-settings` and the
  new `.tab-time` are hidden on a phone (mobile.css); More is lit on Time or Settings (`MORE_VIEWS`,
  from the list's `data-view`s). A wider screen has Time in the top switch after Dictionary, and
  ⚙ for Settings as before. The view is `time` (`setView`, `renderTime`); the app still opens on
  Home.
- **Less on the page** (the user's call, 2026-10-21: "too busy"): the time's words as buttons
  (`#time-parts`, each said and explained when tapped) and the caption under them (`#time-caption`,
  the tapped word's meaning, or a note on the time such as "could be 6 am or 6 pm…") went, with
  their code and styles. Explore is the clock and its ‹ ›, the band, and the Thai with its ▶,
  transliteration and English (and "written 14.30 น." for Official). time.js still makes `parts`
  and `note`, unused. It fits without a scroll now at 390 × 664 too. Checked (scratch `time_probe.py`
  without the parts' steps, `timescroll.py`): the hands, the band, ‹ ›, Official; no script errors.
- **Behind a setting** (the user's call, the same day): Settings → App → **Dev features**, off by
  default (`devFeatures`, `applyDevFeatures`, `html.dev`). Off, the bar is as it was on master: Home,
  Words, Alphabet, Dictionary, Settings, no More, and no Time tab on a wider screen (styles.css,
  mobile.css); turned off while Time shows, the page goes Home. On, it's as above. Checked (scratch
  `devprobe.py`) on a phone and 1280 × 800: off by default, on and off from Settings, kept over a
  reload, Settings still opening from the bar; no script errors. check_layout.py checks the bar both
  ways (not run).
  **Out from behind it, 2026-10-22** (the user's call: "Time is no longer in dev mode"; the setting
  kept, as it may be used again): Time's tab, More on a phone's bar (Time and Settings in its list)
  and Home's Time card are always there (the `html:not(.dev)` rules went; on a phone `.tab-settings`
  and `.tab-time` are always hidden). The Dictionary's Home card no longer spans both columns, as
  Time's is beside it. Dev features is still in Settings → App, off by default, and still sets
  `html.dev`, with nothing behind it ("Pages still being tried out. There are none at the moment.");
  turning it off no longer closes More or leaves Time. check_layout.py now checks the bar once: More
  last, Time and Settings in its list, and opens Settings from More (not run). Checked (scratch
  `undev.py`) at 390 × 844 and 1280 × 800, with the setting off and on: the same bar, More's list,
  Home's cards (Dictionary and Time side by side on the wider screen), Time opening from its tab,
  More and its card; no script errors.
- **Home's Time card** (the user's call, the same day), after the Dictionary's, with dev features
  on only: "Telling the time in Thai, everyday and official, with a quiz." (`.home-card-time`,
  `data-go="time"`). Across both columns on a wider screen, as Words' is, not half a row on its own.
  Checked (scratch `homeprobe.py`): absent with dev features off, so Home is as it was; present
  with them on, opening Time with More (a phone) or Time's tab lit; no script errors.
- **The Thai** (`time.js`, no page code): any time said the everyday way or the official one
  (`timePhrase`, `timeParts`), in the Telling the Time topics' forms: …โมงเช้า, เที่ยง, บ่ายโมง,
  บ่ายสอง/สามโมง, สี่–หกโมงเย็น, หนึ่ง–ห้าทุ่ม, เที่ยงคืน, ตีหนึ่ง–ตีห้า; with minutes เช้า and เย็น
  go (แปดโมงครึ่ง, สี่โมงสี่สิบห้านาที), 7 pm is ทุ่ม (ทุ่มครึ่ง), half past is ครึ่ง and other
  minutes the number and นาที. Official: the hour, นาฬิกา, the minutes and นาที (สิบเก้านาฬิกา
  สามสิบนาที), written 19.30 น. A note where one's easy to get wrong: หกโมงครึ่ง is 6:30 am or pm;
  เที่ยง never สิบสองโมง; บ่ายโมง without หนึ่ง; the short forms the topics give (บ่ายสอง,
  แปดโมง, ทุ่ม); an official hour's everyday one.
- **The page** (Explore): Everyday | Official (`prefs.timeStyle`); a clock (SVG, drawn once:
  `drawClock`) with ‹ › either side (5 minutes, round past midnight; ← → on a keyboard); the band;
  the time's Thai with its ▶ (on one line, smaller for a long one: `fitTimeText`), its
  transliteration and English ("2:30 pm"; official "14:30 · written 14.30 น."); its parts as
  chips, a part of the day's word in its colour, each saying itself and what it means underneath
  when tapped; and that line otherwise the time's note. It opens on the time now, to 5 minutes.
- **The clock:** drag the long hand (within the outer 40%) by 5 minutes, carrying the hour on past
  12 or back, or the short one (the inner 60%) by the hour, the nearer of its am and pm hours so a
  drag goes on round; it says the time when let go. The rim is the half of the day it's in, an
  hour's arc each in its part's colour, the hour's lit. Dragging doesn't scroll (`touch-action`).
- **The band:** the 24 hours in two rows, am and pm, each cell its part of the day's colour with the
  count the Thai uses (ตี 1–5, เช้า 6–11, บ่าย 1–3, เย็น 4–6, ทุ่ม 1–5; 12 for midnight and noon),
  the part's name under its hours (a single hour's from its start, running on). A tap sets the hour.
  The cells are 30 px wide on a phone, under the style guide's 44: the hands and ‹ › are the main
  way; the band is the picture.
  **Four rows since 2026-10-21** (the user's call: "a 6 hours split, each on a new line; this is
  how Thais have the split, right?"): the six-hour clock's quarters, each counting one to six and
  ending on the day's markers, as the traditional clock does: 1–6 am (ตี 1–5, then six in the
  morning), 7 am–noon, 1–6 pm (บ่าย, เย็น), 7 pm–midnight (ทุ่ม 1–5, then midnight, once หกทุ่ม,
  the sixth ทุ่ม). Not 12–5, 6–11…: those split the quarters' counts. `TIME_QUARTERS`; under each run
  of a part, its name, and a quarter's last hour's (เช้า, เที่ยง, เที่ยงคืน) centred under it, its end
  at the row's if it's wider (`.end`). The cells are now 59 px wide on a phone (still 32 tall). To
  keep Explore fitting 390 × 664, the phone's clock is 24vh (29 before): 159 px there, 183 at 763,
  200 from 844. Checked (scratch `timescroll.py` and a label check): no scroll at 390 × 664, 763,
  844, 430 × 932 and 390 × 844 at text size 2; no label outside the band; no script errors.
- **Explore fills the screen on a phone** (the user's call, 2026-10-21: the clock, the band and the
  time with room between them, the page's height): `.time-explore` grows to the tab bar and shares
  the room left evenly above, between and below its three parts (`space-evenly`, 10 apart at the
  least): at 390 × 844 about 46 between them, at 664 the 10 it had (nothing to share). So that
  nothing moves as the time changes, the time's lines keep one height: the transliteration on one
  line too, shrunk to fit as the Thai is (`fitTimeSay`, down to 13 px; it wrapped for a long time at
  text size 2, moving the clock and band 6 px), its line height its full size's. Checked (scratch
  `exspace.py`) at 390 × 664, 763, 844, 430 × 932 and 390 × 844 at text size 2: the gaps the same
  for 2 pm and 11:55 am, no scroll, Quiz unchanged; desktop as before.
- **The time in the word dialog** (the user's call, 2026-10-22: "so I can see tones etc. for each
  syllable"; per phrase, their lean): a tap on Explore's Thai, transliteration or English opens the
  word dialog (`showWordPop`) for what they say (`timeCard`): the time's phrase in the style shown
  (บ่ายสองโมงครึ่ง, สิบเก้านาฬิกา, its English as the page's), or a picked name's (ทุ่ม, "a drum's
  beat, 7–11 pm"). It's the whole phrase, as a Topics phrase row's transliteration and English give:
  the big Thai (a letter tapped says its name), spell and play, Tones with a syllable each, and the
  stories' lines that use it. No add to a list (`card.time`): a list holds topics' cards, and of
  the 576 times only the 24 on the hour (Everyday) and a few more are one; the user was happy
  without it. Every time phrase and name reads into syllables (`toneBreakdown`, all 570 and the
  seven, none an exception: scratch `time_tones.mjs`). On a phone the dialog starts under Time's top
  row, as under the other sections' (`showWordModal`, `.time-top`). Checked (scratch `timeword.py`,
  real clicks) at 390 × 844, 390 × 664 and 1280 × 800: each line opens 2:30 pm's (bàai low, sɔ̌ɔng
  rising, moong mid, khrʉ̂ng falling), said once; a picked ทุ่ม's; Official's; Escape closes; no
  script errors.
- **Official's band: the 24 hours, no names** (the user's call, 2026-10-22: "should the time names be
  there?"): official time is the hour 0–23 and นาฬิกา (สิบสามนาฬิกา, ศูนย์นาฬิกา), none of the day's
  names, and Everyday's counts (บ่าย's 1, midnight's 12) said otherwise there. With Official the
  cells are 1–23 and 0 in the same four rows, day and night tinted as before, with no names under
  them (`renderTimeBand`, by `timeStyle()`); a cell's label is "14:00: สิบสี่นาฬิกา". The names
  aren't preloaded then. Checked (scratch `official.py`) at 390 × 664, 844, 844 at text size 2 and
  1280 × 800: Official, Everyday, Official again; 0 says ศูนย์นาฬิกา; no scroll; no script errors.
  **Nothing moves between the two** (the user's call, the same day: the page jumped as they were
  switched): Official keeps the names' line under each row, a hidden placeholder
  (`.time-band-label.blank`), so the band is Everyday's height (it was 146 px to 238); and the
  English line is one line of a set height (16 px × 1.2, Everyday's), as Official's
  "written 14.00 น." took the Thai font's taller line, 4–7 px more. Checked (scratch `stylejump.py`)
  at 390 × 664, 763, 844, 430 × 932, 390 × 844 at text size 2 and 1280 × 800, at 2 pm and 9 pm: the
  clock, band and three lines at the same place and size in both; no scroll; no script errors.
- **The band's names say themselves; the band sets the hour** (the user's calls, 2026-10-21): each
  name under the hours (ตี, เช้า, เที่ยง, บ่าย, เย็น, ทุ่ม, เที่ยงคืน; all recorded) is a button
  that says it (`speakerPress`), lit while it does (`markSpeakers`, as the speaker buttons; a tint
  of its colour), its target wider than the word and down into the gap below, not up over the cells.
  A tap on an hour or a name puts the clock on the hour (an hour's tap kept the minutes before): an
  hour's says the time; a name's says just the name, and keeps the hour if it's one of the name's,
  or else goes to its first (ทุ่ม at 9:35 pm → 9 pm; from 3:35 pm → 7 pm; เที่ยงคืน → midnight).
  Checked (scratch `bandtap.py`, `bandtap2.py`, real clicks) at 390 × 844 and 1280 × 800: each
  name its own clip, lit while it plays, the times as above; a point just under a cell still the
  cell's; no script errors.
  **A name tapped is picked** (the user's call, 2026-10-22): it's highlighted as an hour's cell is
  when it's the time (`.time-band-label.on`, the accent; only the one tapped, as เช้า has two), and
  the time's lines show the name instead: its Thai, transliteration and meaning (`gloss` in
  time.js's PERIODS: "afternoon, 1–3 pm", "struck (a gong), 1–5 am", "a drum's beat, 7–11 pm"…),
  ▶ saying the name. The rim lights the name's hours, and no cell is lit. The clock still goes to
  the hour as above. Any other change of time ends it (`state.timeName`, cleared by `setTime`): an
  hour, ‹ ›, a hand, Official, or a tap on the clock that moves nothing. A name's tap now says it
  from the start even while it's playing (it was a speaker's press, which stopped it: the second
  เช้า tapped while the first played was silent). Checked (scratch `namepick.py`, `namepick2.py`,
  real clicks) at 390 × 664, 390 × 844 at text size 2 and 1280 × 800: each name's lines, its clip,
  it alone lit, its hours on the rim; the page's gaps the same as for a time; each way back to the
  time; no script errors.
- **Its clips preloaded** (the user's call, 2026-10-21: "Download all audio" had them, all 605
  times and the band's names being in the manifest's Thai, but nothing fetched them ahead, so each
  came from the network the first time it played). `preloadTimeAudio`, through the queue a topic's
  preload uses (`queuePageAudio`, held in memory to play at once): on Explore the clock's time and
  those within half an hour of it, nearest first, the band's seven names and the 24 hours on the
  hour, in the style shown (about 45 clips, ~450 KB), again as the clock moves (only what's new is
  fetched: › fetched just the half-hour's new edge); in Quiz the question's and the next one's, the
  next new time picked a question ahead (`quiz.ahead`), so it's loaded before it's asked. Nothing
  with Settings → Audio's browser voice. As with a topic, a time said as it changes is fetched twice
  the first time (the player's waveform and the queue). Checked (scratch `timepre.py`, the fetches
  logged): Explore at 2 pm, ›, Official; Quiz's next question loaded before it came; no script errors.
- **Colours:** from the theme's own tokens, so all five themes have them (`.period-*`, `--period`):
  midnight and ทุ่ม `--tone-high` (purple), ตี `--easy` (blue), เช้า `--good` (green), เที่ยง
  `--accent` (gold), บ่าย a mix of `--accent` and `--again` (orange), เย็น `--again` (red).
  **Day and night since 2026-10-21** (the user's call: the six, in the band's cells and round the
  clock's rim, looked like "Freddy Krueger jumper colours"; of three mock-ups, all one grey, day and
  night, and one gold tint strongest at noon, they took day and night, but its gold day tint came out
  "poo coloured", brown on the dark themes, so the day is grey): the day's hours (เช้า, เที่ยง,
  บ่าย, เย็น) a grey a step up from the panel (`--ink` 14% into `--panel`), their names `--muted`;
  the night's (ตี, ทุ่ม, เที่ยงคืน, the counts for the dark) a blue tint (`--tone-low` 18%), their
  names in it. `--tone-low` as it's the blue in every theme (`--easy` is sage in Night). The time's
  hour, its cell and its arc on the rim, is in `--accent` (`--on-accent` text); the rest of the rim
  is faint, day grey and night blue (`--period-fill`, `--period-name`, `--period-rim`). The names
  still say themselves, lit with a tint of the day's grey or the night's blue. Checked (scratch
  `colreal.py`) in all five themes at 2 pm and 9 pm; Quiz's clocks unchanged; no script errors.
- **Audio:** every time every 5 minutes both ways (576) and their parts, 605 texts
  (`node tools/time_phrases.mjs --write` → data/time-phrases.json, which tools/gen_audio.py now
  records under `th`; a part that's a card's Thai keeps its sample). A change says the time when
  Cards' auto-play (its A) is on. `time.js` is in sw.js's SHELL (v22).
  **Always since 2026-10-22** (the user's report: a tap on an hour was sometimes silent, with
  auto-play off; "clock sound should always be played if clicked"): Explore says the time whenever
  it's set, whatever auto-play: an hour tapped, ‹ ›, a hand let go or the clock tapped, Everyday |
  Official switched (`setTime`'s `say`, `dropHand`). Mute still silences it. Quiz still asks by
  auto-play (`timeSaysOnChange`), as Cards does. Checked (scratch `timesay.py`, real clicks, auto-play
  off) at 390 × 844 and 1280 × 800: each of those said its time, a name its name; with Mute, nothing;
  no script errors.
- **Fits** 390 × 664 for a time on one line (16 px over with the parts' caption line); a long one
  (บ่ายสองโมงสามสิบห้านาที) shrinks to its line; at text size 2 the parts take two rows and the page
  scrolls. `check_layout.py` opens Settings through More now (`#tab-settings` is hidden on a phone)
  and checks More's list.
- **Checked** headless at 390 × 664, 390 × 844 at text size 2 and 1280 × 800 (scratch
  `time_probe.py`): More's list and its lit tab; the band's 2 pm; dragging the long hand 12 → 6
  (2:30) and on round to 3 pm; the short hand to the evening (ทุ่ม); a part's caption; Official
  (ยี่สิบนาฬิกา, written 20.00 น.); › past midnight (เที่ยงคืนสี่สิบนาที); Settings from More; no
  script errors. Not on the iPhone, and the recordings not yet listened to.
- **Everyday only** (the user's call, 2026-10-23: "remove the 'Official' option, keeping only
  Everyday"): the Everyday | Official switch went from the top row, leaving Explore | Quiz at the
  width it had (280 px, centred), and with it what was Official's above, in Explore and Quiz
  alike: the band's 0–23 and its blank names' line (`.time-band-label.blank`), "written 14.30 น.",
  the official clock's Quiz decoys, `prefs.timeStyle` (a saved `official` is now ignored).
  time.js says the time the everyday way only (`timeParts`, `timeEnglish`, `timePhrase` lost their
  `style`, and นาฬิกา its word); git has the rest. The recordings: data/time-phrases.json is 304
  texts (605 before), and the 290 recordings only Official used were deleted, so Download all
  audio doesn't fetch them. Home's card says "the everyday way". The English line keeps its set
  height. Checked (scratch `everyday_only.py`, real clicks, a saved `timeStyle: official`) at 390 ×
  664, 763, 844, 430 × 932, 390 × 844 at text size 2 and 1280 × 800: no Official, the band's names
  under every row, 2:30 pm said บ่ายสองโมงครึ่ง, the word dialog's tones, a name picked, Quiz's
  three directions asked and answered; no scroll; no script errors.
- **No names on the band, and a clock that only shows the time** (the user's call, 2026-10-25: the
  names under the hours "are redundant", and "only the number buttons and arrows should be
  clickable"): the band is its four rows of hours, 12 px apart (the names' line kept them about
  29 apart), and with the names went their picking (`state.timeName`, `timeNamePicked`, the
  periods' `gloss`), their clips' preloading and their styles (`.time-band-label`,
  `--period-name`). The clock's hands aren't dragged or tapped any more (`clockAt`, `moveHand`, the
  pointer handlers, its grab cursor gone); ‹ ›, ← → and the band set the time, and the Thai, its
  transliteration and English still open the word dialog. Checked (scratch `nonames.py`, real
  mouse events) at 390 × 664, 763, 844, 430 × 932, 390 × 844 at text size 2 and 1280 × 800: no
  names, rows 12 apart; a drag of either hand and a tap on the clock change nothing and say
  nothing; ›, ‹ and an hour set and say the time; midnight's rim lit; no scroll; no script errors.
- **Explore | Quiz closes the word dialog** (the user's report, 2026-10-25: Quiz tapped with the
  time's dialog open left it open): on a phone the dialog leaves the pinned row uncovered, and a tap
  on Words', the Alphabet's or the Dictionary's row, or the tab bar, closes it first (pointerdown,
  capture); `.time-top` was missing from that list. On a wider screen the dialog's panel covers the
  switch, as every section's, so it's closed first there as anywhere (Escape, or beside it).
  Checked (scratch `timepop_quiz.py`, real clicks) at 390 × 664 and 844: the Thai's and the
  English's dialog, Quiz: closed, Quiz shown; Explore back; no script errors.

## Time: Quiz (2026-10-21, the same spike)

The user's pick from the subsections suggested (Quiz, Dates, How long): Quiz here; Dates and How
long as topics in Words (on master: Saying the Date, How Long & How Long Ago).
- **Explore | Quiz** (`prefs.timePage`) beside Everyday | Official at the top (which both pages
  use); `renderTimeSection` shows one. Explore's clock code makes Quiz's too (`drawClock(svg)`,
  `setClock`).
- **Directions** as Cards' (`prefs.timeQuizDir`): TH → Time (the Thai, its ▶; said when Cards'
  auto-play is on), Time → TH (a clock and its time in English, four Thai answers), Listen → Time
  (a large ▶; said at once). Four answers in two rows, Recognition's buttons (`.learn-pill`).
- **The wrong answers** (`timeDecoys`) are the likely mistakes, the question's minutes in all four:
  the same number in the day's other parts (ตีสาม: 3 pm, and 9 pm, สามทุ่ม), the hour twelve away,
  and those hours' twins; the official clock's, the hour twelve away and the one ending in the same
  digit (สิบสี่ and สี่), then the hours either side. Four different answers always (300 checked).
- **A question's time:** half on the hour, a quarter half past, the rest any 5 minutes; a time got
  wrong comes back three questions later (`comebacks`).
- **Answering:** right green, wrong red with the right one green, the rest dimmed; the Thai's
  transliteration and English (or, from a clock, the Thai and its transliteration) under the
  question; the clock's hands, blank till then for TH and Listen, so the card keeps its height and
  the answers stay put (they moved down 12–71 px when the clock came in; at text size 2 the answer
  line wrapped). The time's said (unless Listen, which said it), then the next after Settings'
  pauses (Cards → Pause after a right / wrong answer), unless the page was left meanwhile. 1–4 answer
  from a keyboard. The question's Thai keeps to one line (`fitTimeText`, as Explore's).
- **One size in every direction** (the user's call, 2026-10-21: switching TH → Time, Time → TH and
  Listen moved the card and the answers): the card's parts have fixed heights (the clock always
  there, blank till answered; the line with the Thai or ▶ as tall as Listen's ▶, 96 px, 80 on a
  phone; the answer line two lines), and the answers one height (64, 60 on a phone); what's too long
  shrinks (`fitTimeQuiz`, down to 12 px; the question's line spans the card so a long time's Thai
  shrinks inside it). Checked (scratch `timequiz3.py`, `timequiz5.py`): the card and the four answers
  the same in all 24 states (three directions, asked and answered, Everyday and Official, each
  visited twice) at 390 × 664, 390 × 844 at text size 2 and 1280 × 800; nothing overflowing; 60
  questions' Thai inside the card. **To come:** a check in check_layout.py for this, once the
  pages are settled (the user's call: not yet). The answer line's height is in px
  (17 × 1.4 × 2 × text size), not 2.8 em: when `fitTimeQuiz` shrank a long answer line's text, an
  em height shrank with it, 3 px at text size 2.
- **The top row as other sections'** (the user's call, 2026-10-21: Time had no padding over it): on
  a phone Explore | Quiz and Everyday | Official are pinned like the Dictionary's search
  (`.time-top` with `.section-bar` and `.dict-top` in mobile.css): 12 px above, below and at the sides,
  and the page's colour with a hairline once it scrolls. To keep Quiz fitting 390 × 664 with the
  12 px, the gaps inside Explore and Quiz are 10 on a phone, as `.time`'s (they were 14), and the
  page's foot 18, as Cards'. Explore still scrolls a little at 664 (20 px with a two-line note; 30
  before). On a desktop the row was already where the Dictionary's switch is (91 px), with the
  same space on each side: no change. Checked (scratch `pad_probe.py`, `timescroll.py`, `timepin.py`).
- **The switches as Words'** (the user's call, 2026-10-21: Quiz's TH → Time, Time → TH and ▶ → Time
  were shorter than Cards' TH → EN): on a phone both of Time's rows are 44 tall (styles.css's 40 had
  beaten mobile.css's 44 tap targets), with 15px text and 8 × 6 padding, as `.deck-picker-bar
  .seg-btn`; the directions' own flex, gap and 20px ▶ went, so the arrows and ▶ are Cards' too.
  Quiz's clock 142 on a phone (was 150), so it still fits 390 × 664. Explore scrolls 24 at 664. On a
  desktop too (the user's call, the same day): its min-height of 40 went, so both rows are Cards' 26
  (34 with the group's frame). Checked (scratch `dirh.py`, `dirh2.py`): 44 / 15px /
  the same arrow and ▶ sizes as Words' and the Alphabet's; Quiz the same 24 states over (`timequiz3.py`).
- **Quiz fills the screen on a phone** (the user's call, 2026-10-21: a gap under the answers on a
  taller phone): the answers at the foot, 18 over the tab bar as Cards' are, and the card taking the
  height between, its contents in the middle of it. CSS only (mobile.css): the stage a column on
  Time, `.time`, Quiz and the card growing (`flex: 1 0 auto`); the card's still one size in every
  direction, as it's the room left, not its contents. Explore unchanged. Checked (scratch
  `timequiz3.py`, `timescroll.py`) at 390 × 664, 763 and 844, 430 × 932, and 390 × 844 at text
  size 2: the answers 18 over the bar, no scroll, the card and answers the same in all 24 states;
  1280 × 800 as before.
- **Checked** headless at 390 × 664, 390 × 844 at text size 2 and 1280 × 800 (scratch
  `timequiz_probe.py`, `timequiz2.py`): the three directions; a wrong answer marked and the next
  after the pause; Official; 300 questions with four different answers; the answers not moving when
  answered, in all three directions; Quiz fitting 390 × 664; no script errors.

## The word dialog: the word in the stories (2026-10-21)

The user's pick from a list of ideas ("words in context at the bottom of the word popup"): under the
Tones, **In stories**, the story lines that use the word (`contextSection`).
- **A line** is as Read has it: its ▶ (the sentence's recording, the words lit as it plays:
  `lightSpokenWord` now looks in the dialog's lines too), the Thai with the word in the accent, the
  transliteration from the story's own cards, the English, and the story's name with an arrow, which
  opens the story on Read with the word lit (`openReading`, as the Dictionary's story hits do).
  Three to start; **Show 5 more** adds more (the most is ไป's 800-odd). No section for a word in no
  story (18% of them, e.g. ขมับ) or a letter.
- **Which lines** (`storyExamples`, over `allStoryLines`, built once): whole sentences only (not the
  rest of one carried over, whose English starts in lower case or the line's ends in a comma: the
  shortest lines were often those); the Easy stories first, then Little Stories, Medium, Harder,
  shortest first within each, one line a story before a second from any, a sentence once. A
  speaker's label (คนขับ:) doesn't count. The Southern, Isan and Northern stories (those with a word
  only in those topics) only for those topics' own words, so a standard word isn't shown among
  dialect ones (ข้าว's shortest was an Isan line).
- **Matching:** the word as a run of a line's words, whole: ไป not inside ไปรษณีย์, and
  นักวิทยาศาสตร์ where a story splits it นัก|วิทยาศาสตร์; a phrase (หนุ่ม ๆ) the same way.
- **A lone ๆ:** 15 story lines write มาก ๆ with a real space rather than มาก_ๆ, and Read's
  transliteration gave the ๆ its name (mái yá-mók). It now says the word before it again, on Read
  and in the dialog (nùm nùm).
- **Checked** headless at 390 × 664 and 1280 × 800 (scratch `context_probe.py`, `context2.py`):
  ข้าว's three (กินข้าวสิ, หิวข้าวงะ, กินข้าวหรือยัง) and Show 5 more; ไป's; หนุ่ม ๆ and
  นักวิทยาศาสตร์ as runs; the Southern ลูกม่วง's Southern line; none for ขมับ; ▶ playing; the story's
  name opening Eat Up! on Read with ข้าว lit; no script errors. No layout check (inside the dialog's
  scrolling body; its place is unchanged).

## The Topics section is Words (2026-10-21)

The user's call: with your lists in it as well as the topics, the section isn't Topics any more.
It's **Words**: the tab (the phone's bar and the wider screen's top switch), Home's card and the
page switch's `aria-label` ("Words page"). Words beside Alphabet reads as words beside letters; the
Dictionary is where you look one up. The picker's Topics | My Words tabs, and Search topics, stay:
they're the topics. The code keeps `study` (the view, `data-view`, `studyPage`).
- **Settings, reviewed:** none of it names the section. Its headings are the pages (List, Cards,
  Reading, Writing), which stay; Reading and Writing read better as headings than Read and Write.
  The List and Read all settings' search words now include "words" as well as "topics".
- **Checked** headless at 390 × 664 and 1280 × 800: the tab, Home's card and the top switch say
  Words; no script errors.

## Thai Numerals, a topic (2026-10-21)

The user asked if there was one; there wasn't (the digits were one card in Numbers 0–20, and เลขไทย
a word in Reading & Writing). Now **Basics → First Words → Thai Numerals** (`numbers-thai-numerals`),
after Big Numbers & Counting, 24 cards: the ten digits one a card (๑ → "1 — one"), and the all-ten
card as it is; numbers with a lesson (๑๑ and ๒๑: a final one is เอ็ด; ๒๐ is ยี่สิบ; ๑๐,๐๐๐ is
หมื่น), ๕๐, ๑๐๐, ๑,๐๐๐; what you meet: ๒๕๐ บาท, the year ๒๕๖๙ (B.E.), ๑๙.๓๐ น. (said as
สิบเก้านาฬิกาสามสิบนาที, its `say`: the voice reads the written form badly); เลขไทย (the existing
card as it is) and เลขอารบิก. No `words`: they're numbers, not phrases. An Alphabet set for them
was the other choice; a topic for now (the user's call).
- The voice skips Thai digits, so gen_audio reads them as Arabic ones (`THAI_DIGITS`, already
  there); spell-aloud says a number digit by digit (๑๐: หนึ่ง, ศูนย์), as spell.js already did.
- Checked: the audit, stories, spelling and recordings (29 new, none missing); the topic picked in
  the app, its List and Recognition (scratch `numerals.py`). The Dictionary's search finds nothing
  for a digit (๙), as before for the all-ten card: not changed.

## The Alphabet before Words (2026-10-21)

The user's call: the Alphabet before Words in the tabs, on Home and in Settings.
- **The tabs:** a phone's bar is Home, Alphabet, Words, Dictionary, Settings (or More, with dev
  features); a wider screen's switch Alphabet, Words, Dictionary (and Time). Nothing goes by their
  order: the code and check_layout.py find a tab by its `data-view`.
- **Home:** the Alphabet's card, then Words', each across both columns on a wider screen (Words was
  first and across both, the Alphabet and the Dictionary side by side under it; a half-width
  Alphabet first would have stood alone). Then the Dictionary beside Time, or without Time (dev
  features off) across both (`html:not(.dev)` in styles.css). A phone has one column, as before.
- **Settings:** its sections are the pages', not the sections': Writing, the Alphabet's, now comes
  before Words' List, Cards and Reading (Display, Audio, Writing, List, Cards, Reading, App,
  Reset). Cards stays with Words', though the Alphabet has Cards too.
- **Checked** (scratch `order.py`) at 390 × 664 and 1280 × 800, dev features off and on: the tabs,
  Home's cards and their places, Settings' sections, its search; no script errors.

## Your lists' words newest first (2026-10-21)

The user's call: a list's words newest added first, and a setting for it, newest first by default.
Until now they were oldest first (the order they went in).
- **Settings → List → "Your lists' words":** Newest first (default) or Oldest first
  (`settings.listOrder`). A list keeps its words in the order they went in (`list.words`), and
  `resolveListScope` turns that round for newest first, so the List page, Cards (Browse's order;
  Recognition's "List order") and Read all follow it. A word put back goes in again, so it's the
  newest; Add all's words go in the topic's order, so newest first shows them the other way round.
- **Changing it** (`listOrderChanged`): every list's scope again, the List page redrawn behind
  Settings, and Cards' queue rebuilt round the card shown (`syncReviewOnly`), or on coming back.
- **Checked** at 390 × 664 (scratch `listorder_probe.py`): a list saved oldest first shown newest
  first on the List page and in Browse; Oldest first in Settings re-ordering the page behind it and
  Cards; Settings' search finding it by "newest"; a word added from a topic first in the list.
  No layout check (a settings row like the others).

## Topics' third page says Read (2026-10-21)

The user's call: the page switch's Reading is **Read** (its label, `aria-label` and `title`), and so is
Home's Topics card row, so the three are List | Cards | Read. The page is still `reading` in the
code, and Settings' section is still Reading.

## The phone's bar: Time on it, Home in More (2026-10-22)

The user's call: the phone's tab bar is **Alphabet, Words, Dictionary, Time, More**, and More's list
is **Home, Settings** (it was Home, Alphabet, Words, Dictionary, More, with Time and Settings in the
list). `#tab-home` and `#tab-settings` are hidden on a phone (mobile.css), and More's Time row is a
Home row (`data-view="home"`). A wider screen is as it was: Home in the corner, Time a tab, ⚙.

**More lit on Home, but not at launch** (the user's call): More is lit while one of its pages shows
(`markMore`, `MORE_VIEWS`, now Home), but the app opens on Home, and there More stays unlit until
you've been somewhere else (`state.leftHome`, set by `setView` for any other page); coming back to
Home, by More or a Home card's page and More, lights it. Settings opened and closed at launch doesn't
count (it's a sheet, not a page). More's list marks Home as the current page either way.
Checked (scratch `morehome.py`) at 390 × 844 and 1280 × 800: the bar and More's list in that order;
More unlit at launch and after a reload, unlit on Words and Time, lit back on Home, lit with Settings
open; the wider screen's bar unchanged; no script errors. check_layout.py's bar check is now the
exact order and list (not run).

## Write's ‹ › gone with Cards on Recognition or Type (2026-10-22)

The user's report: Write's row had Clear and Check but no ‹ ›. The stage keeps Cards' order
(`data-order`) on every page, and the rule hiding ‹ › in Recognition and Type, Cards' streams, hid
every `.nav-btn`: Write's ‹ › and Time Explore's too, while Words' Cards were on either (Alphabet's
Cards put Words' order back when left, so they didn't). The rule now names Cards' own,
`#prev-btn`, `#next-btn`, `#random-btn`. Checked (scratch `writenav2.py`, `writenav3.py`) at
390 × 844 and 1280 × 800, with Words' Cards on Learn, Recognition and Type: Write's and Time's ‹ ›
shown each time; Cards' ‹ › 🔀 shown in Learn and hidden in the other two; no script errors.

## Slurs split, and names for peoples and foreigners (2026-10-25)

The user asked what แขก, แขกดำ and แขกขาว mean, then what other such names the app was missing.
Slurs (24 of 25 cards) had no room, so it's split along its two halves, the first keeping its id:
**Slurs: Sex & Gender** (`swear-slurs`, 14 cards: women, LGBTQ+ people) and **Slurs: Peoples &
Foreigners** (`swear-slurs-peoples`, after it, 17): its 10 ethnic cards and 7 new, each with the
neutral word in its note where there is one: แขกขาว, ญวน (dated), ไอ้กัน (Yank), เงี้ยว (Shan;
ไทใหญ่), กะเหรี่ยง used as "hillbilly", นิโกร (คนผิวสี), จีนเทา (the 2020s "grey Chinese"). The
friendly names went where they're used: ตี๋, หมวย, อาแปะ and อาซิ้ม (all from Teochew) after เฮีย
and เจ๊ in **Forms of Address: Family Terms** (17); ลูกครึ่ง (half-Thai) in **People** (21).
- Card keys unchanged for the moved cards, so their progress stays; a saved current topic of the old
  id opens Sex & Gender.
- Each half now matches 4 stories (`stories.py coverage`), one under the usual 5; left so, as
  several topics are, rather than new stories built on slurs unasked.
- **Checked:** the audit (0 errors, the tones as spelt; nothing new worth a look), stories.py check
  and sync, spelling.mjs --write, gen_audio (38 new recordings, 0 failed, none dropped); in the app
  (scratch `slursplit.py`, `slursplit2.py`, 390 × 844): both Slurs topics and Family Terms picked
  with their cards, the old id opening the first half; People checked in the data (the probe's
  picker search couldn't single it out); no script errors.

## Where Words Begin and End, a topic (2026-10-25)

The user asked how to read Thai without spaces (which consonants pair up, when ห is silent, a
hidden o or a hidden a, where a word ends), then whether the app had all of it: it had the letter
rules (Leading ห & อ; Clusters & Odd Spellings) but not the reading ones. Now **Thai Script → Tones
& Reading → Where Words Begin and End** (`script-word-breaks`), after Clusters & Odd Spellings, 20
cards, each a spelling example with the point as its English (as the other Thai Script topics), and
an `about` of four paragraphs: syllable starts, word ends, then speech.
- **Syllables:** a hidden o or a (คน, สมุด; ถนน worked from the end), a cluster as one letter (กลม),
  ตล not a cluster (ตลาด), the front-vowel trap (เสมอ) against a cluster's (เพลง), a front vowel
  starting a syllable (รถไฟ), tone marks (พี่น้อง).
- **Words:** ◌์ (สัปดาห์), ๆ (เด็ก ๆ), a space between sentences (ไปไหนมา กินข้าวหรือยัง), one-syllable
  words (แม่ไปตลาด), an unwritten-a syllable leaning on the next (ขนมปัง), Pali and Sanskrit
  spellings (ประวัติศาสตร์), grammar words as signposts (พรุ่งนี้จะไปทะเล, ไปไหนครับ). The three
  sentences list their `words`. ตากลม is in the `about`; its card stays in Homophones & Homographs.
- **Speech:** a cluster's r dropped (ครับ), r said l (รถ), English loans' clusters (ฟรี).
- Every word's transliteration is the one the app's other cards use. Notes give letter pairs in
  Latin (t + l, f + r), not Thai, so the voice isn't asked to read a fragment.
- **Cleanup:** ปลา's note listed 14 true clusters, missing ผล (ผลัก phlàk); it lists the 15 now, and
  ผลไม้'s says its ผล isn't that cluster.
- **Checked:** the audit (0 errors, nothing new worth a look), stories.py check and sync (nothing to
  change; Thai Script topics need no stories), spelling.mjs --write, gen_audio (23 new recordings, 0
  failed, none dropped); the topic found in the picker, its List with the four paragraphs and 20
  rows, Recognition, and ปลา's and ผลไม้'s new notes (scratch `wordbreaks.py`) at 390 × 844 and
  1280 × 800; no script errors.

## Five vowels described better (2026-10-24)

The user's report: some vowels' English was hard to pick in Cards ("short, as in 'about'", "short,
as in 'cat'", "long, 'cat' drawn out"). Worked out with them, each short vowel now pairs with its
long one, in words a British ear hears right:
- **แอะ:** "ɛ — short, 'eh', as in 'bed'" (was 'cat': the user's call, "it is more like 'eh'", and
  'cat' sat a letter from อะ's 'cut' in the choices). **แอ:** "ɛɛ — long, as in 'air'" (no r; Thai's
  แอร์, air-con, has the vowel).
- **เอะ:** "e — short, a clipped 'ay'" (was 'pet', which is แอะ's "eh" now), beside เอ's "like 'play'
  without the glide".
- **เออะ, เออ:** "short; / long; 'eau' with spread lips" (were 'about', two vowels, and "like 'fur'
  without the r"), worded as อึ and อือ are, short or long the only difference (the user's call:
  French 'eau' alone is โอ's pure o; เออ is it unrounded).
14 cards in 7 topics (Short & Long Vowels, and Read's vowel topics). Card keys are `thai::english`,
so their progress starts again. The English recorded again (the voice reads the IPA and 'eau' as
written).
**Two more, 2026-10-25** (the user's report: neither sounded like its word): อะ "a — short, as in
'bat'" (was 'cut', the American textbooks' cue; a British 'bat' is Thai's short a, the user's
pick) and อิ "i — short, a clipped 'ee'" (was 'bit', a looser vowel; the user's 'we' is อี's long
ee, so "clipped", as เอะ's and โอะ's are). 8 cards in 4 topics. อุ's 'put' has bit's problem (a
looser vowel than Thai's short oo) but stays, the user's call.

## The new-version bar, one line and prominent (2026-10-19)

The user's screenshot: "A new version is ready." wrapped to three lines beside a 32 px Reload, in a
pill in the middle of the screen: cramped, not prominent. It was centred with `left: 50%` and a
transform, which leaves a fixed box half the screen to wrap in.
- **Centred by its two edges** (`left` / `right` 16, `width: fit-content`, `margin: 0 auto`); on a
  phone the page's width, in the 12 px gutters, 12 over the tab bar, the words left and Reload right.
- **More prominent:** the words 16 px bold, a 2 px accent border, the card radius (14) rather than a
  pill, and Reload 44 tall (the app's least for a tap) in 16 px bold.
- **A toast shows above it**, 12 clear: on a phone the old 104 px put it over the bar, so it's the
  tab bar + 88 there (the bar's 12 + 64 + 12).
- **Checked:** `check_layout.py` shows the bar on a phone and measures it (one line, the button 44,
  12 in each side, 12 over the tab bar).

## A field's keyboard hides the tab bar (2026-10-19)

The user's screenshot: in the Dictionary, scrolling the results with the search's keyboard still
up, the tab bar showed halfway up the screen, over the words. iOS doesn't shrink the page for the
keyboard, only the part of it that shows, so a `position: fixed` bar stays at the foot of the full
height and comes into view part way up as the page scrolls.
- **While a field has the keyboard** (a text, search or number box, or a textarea, on a touch
  screen: `syncKeyboardUp`, on `focusin` / `focusout`), `html.kb` hides the bar, as an app's goes
  under its keyboard, and sets `--tabbar-h` to 0, so the page's room for it, the toasts and the
  sheets that end above it (Settings, the word dialog) reach the foot. Focus stands for the keyboard
  because on a touch screen no field is focused but by a tap (`TOUCH_SCREEN`).
- **What's sized to the bar keeps its size** while it's hidden (`sizeCards`, `sizeWritePad`), and the
  cards fit again when it's back. Type's own keyboard layout (`html.type-kb`, below) is set too and
  sizes the card to the keyboard as before.
- **Checked:** `check_layout.py` taps the Dictionary's search with a touch screen emulated (the bar
  hidden), then lets it go (the bar back). Not yet on the iPhone.

## A field's keyboard: a drag closes it (2026-10-21)

The user's report, after New list's dialog was held still: Settings' search and the Dictionary's
still let the page be dragged about with the keyboard up. Every text field was looked at:
- **Held still** (as before): Type's box (10-19) and a dialog's, New list and Rename (10-21). The
  dialog's hold had put the page behind it back at its top (`scrollTo(0, 0)`), so a list's page
  scrolled down came back at its top when the dialog closed (the probe); it's now held where it was
  (`heldY`, Type's still 0).
- **A drag closes the keyboard** (the rest): the Dictionary's search, Settings' search and its
  number boxes, the picker's search, Read's and a list's. While one has the keyboard
  (`syncKeyboardUp` adds the listeners, and takes them away with the focus), a drag moves nothing,
  and once it's past 8 px (more than a tap's wobble) it takes the focus away, so the keyboard goes,
  as an app's search does (`dragClosesKeyboard`). The rest of that drag moves nothing either
  (`holdTillLifted` till the finger's lifted: without it the page scrolled the rest of the way);
  the next one scrolls. A drag on the field itself is left alone (it moves the caret), and a tap on
  a result still works.
- **Checked** headless with touch emulation and real touches (scratch `kbdrag_probe.py`,
  `dictscroll.py`, 390 × 664): on each of those fields a drag closed the keyboard with the page or
  sheet where it was, and the next drag scrolled (the Dictionary's results 250 px, Settings' 344);
  a tap on a Dictionary result opened it; New list over a list's page scrolled to 300 left it at
  300; Type's box kept the focus with the page at its top. Not yet on the iPhone, where iOS still
  moves a sheet itself to show a field low in it (a Settings number box), as before.

## Cards: Type, the answer typed in Thai (2026-10-19), `typing.js`

The user's idea: a fourth mode beside Browse, Recognition and Recall, on Topics' and the Alphabet's
Cards, "like Recognition, but it has a text input bar instead of button select", working in all
three directions with the answer in Thai in each (the user's call). (A section of its own for
learning the keys came first, the same day; the user didn't like it, and it's kept on the branch
`2026-10-19-typing`, with the keyboard probe page that found what's below.)
- **What each direction asks:** English → Thai, the Thai from memory; Listen, what you hear;
  Thai → English, the Thai shown copied, which is practice at finding the keys.
- **Progress** (the user's call, after the difference was explained: what Recall schedules, what
  Recognition puts first, Known): English → Thai is graded as a recall, right Easy, wrong Very
  Hard; Listen as Recognition grades it (`mode: 'mc'`, a right answer Hard), as spelling what you hear
  isn't knowing what it means; Thai → English saves nothing, as copying a word says nothing of its
  meaning.
- **A card** goes as Recognition's do (the same stream, `requeueRecognition`, the pauses in
  Settings), with the box (`#type-box`) and one button in the answers' place:
  - right **as soon as the box matches**, with no return needed (`onTypeInput`). Also right: a word
    in scope with the same sound (Listen: ค่า, ข้า and ฆ่า; 57 cards have one in their own topic)
    or the same English (English → Thai, which only Everything can have), and an Alphabet vowel
    without the อ that holds its place (ะ for อะ). Each says so in a note.
  - the button is **Show** with the box empty (a miss, the answer shown), **Check** once something's
    typed, **Next** once answered (on without the pause). The return key is the button.
  - **once answered**, what was typed is drawn over the box (`showTyped`): ✓ and it, or ✗ and it
    with the rest in red from the letter where it went wrong (with its marks: `clusters`), and a
    note under it. The card turns over to the answer, as Recognition's does. A right answer with a
    note waits the wrong answer's pause, so the note can be read.
  - **Latin letters** (the phone's keyboard not on Thai) are said at once, on the card's front
    between its bottom corners: "That's not Thai: switch keyboards with 🌐".
- **The checker** (`typing.js`, no page code) compares after tidying both sides (`tidy`):
  - only Thai and digits count, Thai digits as 0–9: not spaces (ช้า ๆ or ช้าๆ), zero-width spaces,
    a pattern's … (ขอ … หน่อย), full stops (พ.ศ.), or the Latin in ฝุ่น PM2.5 (13 cards have Latin
    or digits, 304 spaces, 310 ๆ);
  - ํ + า as ำ: they look the same but aren't. The user's first น้ำ on the iPhone was ํ (shift)
    then า, as ำ's own key (row 2, third) is easy to take for า;
  - a tone mark typed before a vowel above or below (◌้ั for ◌ั้), or after ำ (นำ้ for น้ำ).

  `tidiedNote` says which ("ำ is one key: row 2, between ไ and พ"). `firstWrong` finds the first
  letter that differs, and its note says where the key wanted is, by its neighbours (`keyHint`:
  "ศ: ⇧, then row 3, between ษ and ซ"), or that ำ is one key.
- **The layout is Kedmanee** (`KEDMANEE`, TIS 820-2538) on computers and, key for key, on the
  iPhone (the user's screenshots of its two layers). The iPhone has ฃ and ฅ at the end of its third
  row, and _ where a computer has -.
- **On a computer** a key is read by where it is (`onTypeKey`, `KeyboardEvent.code`), so an
  English layout types Thai with no Thai set up; a Thai layout, already typing Thai, is left alone,
  as are Ctrl, Alt and ⌘. Arriving on Cards in Type, or choosing it, focuses the box.
- **On the iPhone** its own Thai keyboard, read as text after each change: the probe showed the
  letters arrive as text, not keys. The box's attributes (`autocorrect`, `autocomplete`,
  `autocapitalize` off, `spellcheck` and `writingsuggestions` false, `lang="th"`) kept the
  suggestion bar away in the probe.
  - **The keyboard opens** when Type or a direction is tapped, as the box is focused in the tap's
    own handler (iOS opens it for no other focus); arriving from elsewhere it waits for a tap on the
    box.
  - **It stays up from card to card**: the box is never re-made or hidden, and a press on the card
    or the button doesn't take the focus (`mousedown` → `preventDefault`).
  - **With it up**, 390 × 357 was left of Safari's 664 (the probe). So while the box has it
    (`html.type-kb`), the page is the card and the box: the top row, the switches and the tab bar
    hidden, the page scrolled back to its top, the card down to 12 px over the box, the box 12 px
    over the keyboard (`sizeCards`, on `visualViewport` resizes). The card's corners are 52, not
    72, so a back with a note fits (137 of a 265 card). The sizing waits for the keyboard (the
    visible height under 80% of what it was at the focus), so the card doesn't first grow. The rest
    comes back when the keyboard goes (Done, over it).
  - **The page held at its top** (the user's screenshot, 2026-10-19): with the keyboard up iOS lets
    the page be dragged by as much as the keyboard covers, though it all fits over it, and scrolled
    it 80 px itself after an answer, the card's top under the clock and a gap over the keyboard.
    While it's up a drag is stopped (`touchmove` → `preventDefault`, not in the box or on a back
    long enough to scroll; the listener only then, so it doesn't slow scrolling elsewhere) and a
    scroll put back (`holdTop`, on the window's and `visualViewport`'s scrolls). `sizeCards` measures
    from the page's own top rather than adding `scrollY`, so it holds however iOS has scrolled.
- **Words elsewhere:** Home's Cards line names Type; Settings' "Recognition" list is "Recognition
  and Type" (Type uses its card order and pauses), and the schedule's help says how typed answers
  count.
- **The phone's band:** the box and the button in the answers' 56 px, 18 under the card, so the card
  is Browse's shape (check_layout.py has it). On a wider screen the box is 60 tall under the 16:9
  card, so the page still fits 1280 × 800.
- **Checked** in headless Chromium at 390 × 664 and 763 (a touch screen, the keyboard's room
  simulated) and 1280 × 800, at text sizes 1 and 2: each direction, right, a tidied match, wrong,
  Show, Next, Latin, a sound-alike, an Alphabet consonant and a vowel without its อ, Type →
  Recognition → Type mid-pause, leaving the page (the box lets go), d k on an English layout
  typing กา, the progress saved per direction. Not yet on the iPhone: whether iOS keeps the
  keyboard up through a press on the card or the button, scrolls as expected, and sends
  `visualViewport` resizes as Chromium does.

## The page switches on a wider screen (2026-10-18)

The user: on the web, Topics' List | Cards | Reading, the Alphabet's Letters | Cards | Write and the
Dictionary's Thai | English "look terrible and cause the app to jump around when navigating". They
asked for the switch in a row of its own, each page an icon with larger text beside it, and the
phone left as it was.
- **Why it jumped:** the switch was one item in a wrapping row with the page's other controls (Add
  all and Read all on List, the direction and order switches on Cards), so it landed somewhere else
  on each page: at 1280 wide, x 577, 522 and 479 on List, Cards and Reading, and 994, 455 and 986 on
  the Alphabet's three. And a page tall enough to scroll gained a scrollbar, moving everything
  centred 7 px (the topic button between x 107 and 114).
- **Now, above 600px (styles.css, after the Alphabet switch rules):** the bar (and the Dictionary's
  search row) has a 60px top padding, and the section's switch is placed in it, centred: x 483 on
  every Topics and Alphabet page at 1280, the Dictionary's centred on the same line. Each button is
  its 18px icon with a 16px name beside it, 36px tall, as the tabs above are (a 17px name there); the
  selected page isn't bolder, so the switch keeps its width. `scrollbar-gutter: stable` on `<html>`
  keeps the page from shifting when it scrolls.
- **Less space above it** (the same day: "too much dead space between the top menu divider and the
  new sub menu"): the page's top padding is 16px on every page but Home (it was 32), so the switch
  sits 16px under the top bar, as the bar's own padding.
- **Side effects:** the topic button is 42px tall on the web (it stretched to the old switch's 52);
  the Dictionary's search is its own 49px. The Alphabet's set menu still opens under the topic
  button (it's placed from the button's offsets).
- **The phone is unchanged:** every rule is inside `@media (min-width: 601px)`, and mobile.css (up to
  600px) keeps the switch beside the topic button; `check_layout.py` passes at the phone sizes.
- **Checked:** `check_layout.py` now runs `web_checks` at 1280 × 800 (see What lines up); measured at
  640 and 800 wide too.

## Defaults: Thai at 0.7×, text Larger (2026-10-18)

The user asked for 0.7× to be the default audio speed, and Larger the default text size.
- **Defaults:** `thaiSpeed: 0.7` (it was 1) and `textSize: 1` (it was 0). English still plays at 1×.
- **Saved settings move too:** settings are saved in full, so a browser that saved before holds
  the old defaults. `SETTINGS_MIGRATIONS` gains `thai-speed-0.7` (1 → 0.7) and `text-size-larger`
  (0 → 1), each once per browser, so a size or speed picked afterwards sticks.
- **`migrateSettings()` now runs first in `init()`,** before `applyTextSize()`. It ran after the data
  loaded, so the first load after the update would have kept the old size until the next one.
- **Labels:** Text size's step 0 was "Default"; it's now "Medium", and step 1 is "Larger (default)".
  Thai speed's 0.7× says "(default)".
- **`tools/check_layout.py`** now checks at text size 1 unless told otherwise. Its saved store marks
  `text-size-larger` as run, so `--text-size 0` still checks 0.

## Classifiers: patterns, packs, monks and films (2026-10-18)

The user asked whether the app had enough on classifiers. There were two topics (37 cards) with
rules of thumb, but nothing on how a classifier is used, and many everyday ones had only their noun
card. Of the three gaps offered, the user chose the first two (the third, each noun's classifier on
its card, is still open).
- **Group:** the five classifier topics are now the Grammar group **Classifiers**: People, Animals &
  Objects; Food, Vehicles, Places & Time; then the three new ones.
- **Classifiers: This One, How Many & Each** (`classifiers-patterns`, 21 cards): phrase cards with
  `words`, each note giving the pattern, as in Sentence Patterns. This, that and which
  (หนังสือเล่มนี้, รถคันนั้น, เสื้อตัวไหน); "a cat" against "one cat" (แมวตัวหนึ่ง, แมวหนึ่งตัว); นึง, เดียว,
  อีก; กี่, ทุก (the existing ทุกคน card), แต่ละ, หลาย, บาง, สองสาม, ทั้งสอง; the ordinal ที่; prices
  with ละ and คนละ; the classifier standing for the noun (เอาตัวสีแดง); nouns that count themselves
  (ห้องสองห้อง).
- **Classifiers: Shops, Packs & Bunches** (`classifiers-shops-packs`, 21): ชาม, ถุง, กล่อง, กระป๋อง,
  ห่อ, ซอง, แพ็ก (spelt like แพ็กเกจ; the note gives แพ็ค), ลัง, แผง, โหล, หลอด, หวี, หัว, กำ, เส้น,
  ด้าม, and the existing พวง, ช่อ, แผ่น, ก้อน and แท่ง cards.
- **Classifiers: Monks, Films & More** (`classifiers-monks-films-more`, 16): ท่าน, รูป, the existing
  องค์, นาย, เชือก, เรื่อง, ตอน, เพลง, ข้อ, บท, บาน, ชั้น, วง, เรือน, ข้าง, ขบวน.
- **A classifier card sits beside the noun's** (ถุง "bag" and "(classifier) bags (of)"), as ห้อง and
  แก้ว already did. The audit lists the pairs under "one gloss broader than the other".
- **Eight new Easy stories:** Saturday Market, How Many of You?, The Wedding Shirt, The Talking Cat,
  Morning Alms, The New Condo, Two Films or a Series? and A Quick Shop. A phrase card only matches
  a story that uses it whole, so the first five carry at least two of the patterns each. The other
  two topics have 9 and 37 stories, counted by Thai as `storiesFor` counts.
- **34 older stories now take the classifier card where they used one.** Some showed the wrong
  meaning: ประตูทุกบาน and เช็ดกระจกทุกบาน had บาน "to bloom", ข้อแรก had "joint", ขาข้างหนึ่ง had "side",
  and ทุกท่าน had the pronoun. Others: หนังเรื่องนี้, ถนนเส้นนี้, ชามละสี่สิบ, อีกกล่อง, สองถุง and
  รถไฟ…ขบวนหนึ่ง. Only stories where the word had no other use changed, since a story holds one card
  per word. Left alone: เรื่องนี้ "this matter", ตอนนี้ "now", ชั้น as "floor / storey", and เพลง, which
  counts itself with its noun card.
- **Checked:** audit 0 errors; `stories.py check` 0 problems; coverage has no new topic under 5
  stories (the four Poetry topics were already short).

## Mute (2026-10-17)

The user asked for a mute in Settings, the first Audio setting: for somewhere quiet, or with music
playing on the phone; no sound at all while it's on. **Settings → Audio → Mute** (`settings.muted`,
off by default), a switch, the help line "No sound at all: for somewhere quiet, or with music playing."
- **Where it's kept quiet:** every sound goes through `playSample()` (the recordings) or `ttsAndWait()`
  (the browser's voice). Muted, both resolve at once without touching the player or
  `speechSynthesis`, so nothing in the app can make a sound: speakers, auto-play, the spell buttons,
  Read all, Reading's Read, the Thai speed preview. The player is never started, so it shouldn't stop
  another app's music either.
- **What shows it:** `data-muted` on `<html>` (applyMute; index.html sets it before first paint, as
  it does the theme) swaps every speaker's two waves for a cross (`.mute-x`, the usual muted-speaker
  icon), so a speaker that's pressed and says nothing explains itself. Cards' Listen button shows it too.
- **Read all, Reading's Read and Read all, and the spell buttons** would only light their lines in
  silence, so muted they don't start and the toast says "Muted: Settings → Audio" (mutedNotice).
  Tap-to-hear surfaces with no speaker (letter tiles, a word's syllables) just keep quiet.
- **Turning it on** stops what's playing and any Read or Read all that's running.
- Tested headless (a spy on `play()` and `speechSynthesis.speak()`): muted, a list's speakers, Read
  all, the Alphabet card's appearing, speaker, spell and turn made no call; unmuted, the same made
  sound; a Read all running stopped when it was turned on; it held over a reload.

## Cards: one shape in Browse, Recognition and Recall (2026-10-16)

The user: on Topics → Cards the card should be the same shape in all three modes; Recognition's
buttons (and Recall's) seemed large, better made smaller than Browse's room made bigger. Measured
at 390 × 664: the card 366 wide in all three, but 311 tall in Browse (‹ › 56 tall, 18 above and
below), 287 in Recognition (the answers 92 tall, room for three lines) and 301 in Recall (the grades
72). Now the answers and the grades are in ‹ ›'s band: 56 px tall, 18 under the card (the card's
12 px gap and 6 of margin) and 18 over the tab bar (the stage's padding, now in every mode), so
sizeCards leaves the card Browse's size: 311 at 664, 491 at 844, in all three, Alphabet too.
- **Answers:** two lines of English at 17 px, or three at 12 (the line 1.2, not 1.3, for English;
  Thai keeps 1.3 for its marks). fitPills shrinks a longer one down to 12 px, the style guide's
  least for reading. Measured over every card's English and Thai: 7,094 of 8,508 English answers fit
  at full size, 8,487 at 12 px or more; Thai 8,285 of 8,291. The 27 longer still make the row taller
  and the card shorter for that question, 12 of them in Tone Chants (its card 284–311 there); the
  rest are one each: rule topics' notes and long glosses ("(classifier) machines, devices,
  instruments", "condo management office (juristic person)").
- **fitPills measured the row, not the button:** the row stretches its buttons to the tallest, so
  an answer beside a long one shrank to the floor (10 px) though it fitted at 14. Now the rows are
  `align-items: flex-start` while it measures. (Already so before; three lines' room hid it.)
- **Grades** the same: 56 px, `margin-top: 6px`, fitted by fitPills too (for the larger text sizes).
- **Recall arriving unsized** (the user's report: coming to Cards in Recall from elsewhere, the card's
  foot too low until a switch to another mode and back). setView fits the cards, then starts Recall's
  stream (enterReview), whose presentEntry fits again, but both before renderToday un-hides #review:
  with no stream running (after a reload, or once one had ended) the card kept the stylesheet's
  height (46vh, which iOS Safari takes of the screen without its bars, so too tall). renderToday now
  fits the cards when it shows Recall. Measured at 390 × 664 and 844: 311 / 491 from List, Home,
  Alphabet, a reload and the switch alike. check_layout.py has it (a reload, then the tab).
- **Found by the checks on the way:** ก's back overflowed at 390 × 763 in the full run (310 px of
  content in 235), though it fitted when tried alone. fitBack had laid it out before the picture
  loaded, when the `<img>` had no height, so it fitted stacked; nothing re-fitted when the picture
  came. `.card-pic` is now `aspect-ratio: 1` (every letter's picture is 400 × 400), so it has its
  height from the start.

## Write: a clean pad for another item (2026-10-16)

The user: a vowel traced on Vowels → Trace stayed on the pad after switching to Consonants. Write
keeps one set of strokes (`write.strokes`), and only ‹ ›, Clear and the Trace | From memory switch
emptied it; a set switch re-renders through renderAlphabet → renderWrite without. renderWrite now
remembers the set and item it drew on (`write.shown`, "vowels:อะ") and, when that changes, clears the
strokes and any Check result (the hint line comes back); a set change also empties From memory's ‹
history (`write.back`, places in the old set's list). The same item again (the set re-picked, or
Letters and back) keeps the drawing. Tested: vowels → consonants → tones → vowels, each clean.

## Letters: a speaker on the letter's row, where Write's is (2026-10-16)

The user asked for Write's speaker on the Letters page's row too. pickAlpha (the consonants' and the
vowels' Letters pages; the tones' page has no such row) now ends the row with the same button
(`.row-speak.write-speak`, data-say, speakerPress: lit while it plays) after Details. Measured at
390 × 664 and 844: Letters' and Write's rows identical, the speaker at 334, 80 (44 × 44), Details
and the text where they were; a press plays the item once and opens nothing.

## Alphabet cards: a tap on the back opens the Alphabet's dialog (2026-10-16)

The user asked whether the word dialog's Add to Cards and Spell did anything for a letter card
(tapping the back's letter or its name opened the word dialog, made for Topics' words). They
didn't: the Alphabet's Cards hold every letter whatever is in Cards (reviewOnlyCards), so Add to
Cards only wrote a `abc:ก` key nothing read (and the backup summary counted it as a word in Cards);
and Spell on one consonant said its name again. `showCardDialog(card)` (from tapCardText and
tapCardThai's back) now opens a consonant's **letter dialog** (showLetterPop: its picture, class,
sound, words) and a vowel's **vowel dialog** (showVowelPop); a Tones card's syllable (a real word,
ข้าว) keeps the word dialog with Spell, and showWordPop leaves out Add to Cards for any `card.alpha`.
The word dialog's other callers (the letter dialog's words, word lists, stories) are Topics' words
and keep it.

## Alphabet cards: the back's letter, picture and words in proportion (2026-10-16)

The user sent a screenshot: on an Alphabet card's back, a large picture and a tiny letter, the words
cut off. Measured at 390 × 664: the back has 135 px between the corner buttons' bands and needed
213 (the letter, the 112 px picture, the name, the meaning, the note), so fitBack shrank every line
to 70% (the letter 14 px) and it still overflowed; at 844, 315 px fitted, but the letter was 20.
fitBack, for a back with a picture (the consonants'): the letter **2.5 times** the English's size
(50 px); if the column doesn't fit, the picture goes **beside** the words (`.pic-beside`, a grid);
if it still doesn't, the note goes (`.no-note`: the class and sound are in the letter's dialog);
then the usual shrinking. Measured: 664, beside, no note, everything ~94% (the letter 47); 763,
beside with the note, full size; 844, stacked with the note, full size. Vowels, tones and Topics'
cards have no picture and are as they were.

## Cards: a letter or a short word fills the card (2026-10-16)

The user: on Cards (the Alphabet's most, Topics' too) a single letter or short word looked lost on
the card. The front's text (`.thai`, `clamp(46px, 8vw, 92px)`) was 46 px on a phone, in a card about
366 × 311. fitText now **grows** a front that fits on one line: as large as fits the face's room
(inside its padding, the corner buttons' bands on a phone: 334 × 143 at 390 × 664, 334 × 323 at 844),
still one line, up to CARD_TEXT_MAX 150 px (a binary search); text that doesn't fit shrinks as
before. The fit is measured against the face's room, not the text's own box: a word with nowhere to
break (ขอบคุณ) widened its box past the card. Measured: every consonant and vowel form 122 px at 664
and 149 at 844 (เอียะ the widest, 252 / 307 wide); ไป 122 / 149; สวัสดี 122 / 138; สวัสดีครับ 77,
ขอบคุณ 95, ขอบคุณมาก 62 (as wide as the card); all inside the room.

## Style guide (2026-10-16)

The user asked for a style guide with size and positioning best practice, the standards linked:
**docs/style-guide.md**. Screens and heights to test (390–430 wide; 664, 763, 844, 926 tall), tap
targets (44, Apple HIG and WCAG 2.5.5; WCAG 2.5.8's 24; Material's 48), the phone page's rows and
their y, the rules learnt this session (pages line up, nothing jumps, fill don't float, pinned rows),
type, the colour tokens and **a contrast table measured from the five themes' tokens**: text,
muted, accent, feedback, tones and control borders pass WCAG AA everywhere; **the class colours as
text don't** (high in Dark and Charcoal, low in Charcoal, all three in Light), noted there to fix.
Every link was checked to resolve (2026-10-16).
A project **CLAUDE.md** (the user's call, the same day) points sessions at the notes and the guide,
with the working rules, the data pipeline and where the model and screenshot tools live.

**From memory into the repo (2026-10-18):** the user asked which rules lived only in Claude's
memory, so a fresh session or a clone would miss them. Moved: the checklist for natural Thai (now
**docs/thai-writing.md**, linked from CLAUDE.md), no installs without asking and dev tools in
`tools/` (CLAUDE.md), and the growth of story audio (Backlog). The memories CLAUDE.md and these
notes already covered were deleted.

## Write fits the screen (2026-10-15)

The user, on an iPhone 12 Pro: on Vowels → Write the ‹ Check › row went under the tab bar. Measured
at 390 × 664 (Safari with its bars): the pad was 364 px (the full width), the feedback two lines,
the buttons at 644–700 with the tab bar from 608. Their pick of the two fixes offered:
- **The pad as big as the room left** (sizeWritePad, on render and resize): its width, or less, so
  the feedback and buttons end 12 px above the tab bar (on a phone) or the window's foot, the page at
  its top; at least 200 px. At 664 it's 292 px; at 763 (the installed app) and up, the full 362.
  Strokes are kept 0..1 of the pad, so its size doesn't change a check.
- **The feedback one short line**, always the line's height (no jump), "…" if it must: the start-at-
  the-head and loop-first tips went (loopFirst with them; the green dot still shows where to start),
  and the words: "✓ ธ · 97%", "Not quite · 14%", "Looks more like ฃ than ข", "✓ Well done", "Trace the
  red parts too", "Above: ◌ี, not ◌ิ", "Missing เ in front", "Nothing goes after the อ", "A tone mark
  goes above", "✓ ไม้โท · 100%"; a vowel's or mark's first problem only. The prompts: "Trace it,
  starting at the green dot", "Write this vowel round the faint อ"…
- Checked at 390 × 664, 763, 844 and desktop; consonants 88/88 pass, 10/10 wrong fail; tone marks
  4/4, look-alikes and marks below caught; the user's loose ธ "Not quite · 14%".
- **The feedback on the pad** (the user, after seeing the two side by side): a label on the pad's
  foot (#write-feedback inside .write-pad, absolute, its own ground over the strokes, no pointer
  events, gone while empty), so the pad gets its line: 318 px at 664 (was 292).
- **The pad grows as Cards' card does** (the user, after trying the buttons centred in the room under
  the pad for a day: Cards' way works better): on a phone the pad is the full width and as tall as
  the room down to the buttons, which sit 24 px under it and 12 px above the tab bar, as Cards' card
  and its ‹ ›; on a wider screen it's square. The letter, the strokes and the checks are in its
  drawing square, the largest that fits, in its middle (writeSquare: drawWritePad translates to it,
  the pointer is mapped into it; a stroke beyond it is beyond 0..1, off the letter in Trace, no
  matter From memory, which fits the drawing's own box). Matched Cards at 390 × 664, 763, 844 and 926
  to the pixel (the pad 204–516/615/696/778 against the card's 204–515/615/695/778).
- **The ‹ › row in the middle of the room under the card or pad** (the user: a few pixels higher),
  on Cards and Write: 18 px above and 18 below (it was 24 and 12). Cards: the row 6 px up into its
  gap (margin-top −6) and the stage 6 px more padding under it, so sizeCards leaves the card as tall
  as before; not in Recognition, whose answers have the foot. Write: sizeWritePad and .write-foot
  with 18 and 18. Measured at 390 × 664 and 844: card and pad unchanged, the row 18 / 18 (Cards 18 /
  19).
- **Its sound on arriving, and a speaker** (the user's calls): renderAlphabet, on Write, says the
  item's name or sound, as moving to it does: from a tab, the Letters | Cards | Write switch, or
  another set. Only while the page has the user's tap (`navigator.userActivation.isActive`), so not
  when the app opens on Write (and browsers block sound without one anyway); not when switching
  Trace | From memory. The row has a speaker (`.write-speak`, 44 round, as the word tables'
  `.row-speak`, lit while it plays) at the row's right end, Details before it (the user's call: between
  the text and Details it looked odd From memory, where Details waits hidden). Checked with real taps (CDP mouse
  events) and a count of plays: 0 opening, 1 for each arrival and the speaker, 0 for the switch.
- **A thinner line** (the user: too thick, "something like half"): the pad shows the strokes at
  WRITE_LINE, 7 at WRITE_N (was 14); the checks still take them at WRITE_INK, 14, as they were tuned.
- **Write lines up with Cards** (the user: going between them was jarring): the letter row is 52 px,
  as Cards' direction row (it was 60 × text size), with 12 px gaps as Cards' (they were 10), so
  Trace | From memory sits where Browse | Recognition | Recall does (140–192 at 390 × 664) and the
  pad starts where the card does (204), at any text size: Cards' rows don't grow with it, so neither
  do these. The three lines are 14 px at 1.2 (50 px), the letter 40 px, a picture 48; the Letters
  page's row the same, so it still matches Write. Checked: all 44 consonants' and 30 vowels' lines
  whole at text sizes 0 and 2.

## ยักษ์ said with a syllable too many (2026-10-15)

The user: ย sounded "yaw yak yai". The voice (th-TH-NiwatNeural) sounds out ยักษ์'s silent ษ์ as a
second syllable: 570 ms of speech for ยักษ์ against 190 ms for ยัก (and ปลาหมึกยักษ์ 860 ms
against 500). It reads other ษ์ words right (อนุรักษ์ the same length either way; ฤกษ์ one syllable).
- gen_audio's spoken_text says ยักษ์ as ยัก (only what the voice is given; the Thai shown is the
  same). Sample names hash what's said, so the 17 clips with it were made again: ยอ ยักษ์ (ย's name,
  now 380 ms), ยักษ์, ปลาหมึกยักษ์, notes, and 12 story lines.
- word_timings' placed() finds each word in what was said and now takes its position back to the
  sentence (difflib's matching blocks) when the two differ, or every word after ยักษ์ would light two
  characters early; the 12 lines' timings were made again.
- **ผอ in two pulses** (the user, next: "paw pung" sounded "paw aw pung"): alone, the voice's ผอ
  falls to a fifth of its loudness and rises again (phɔ̌… ɔɔ, its pitch broken between), where ขอ,
  สอ, ถอ, ฝอ, พอ swell once. Respelt for the voice: ผอ as ผ๋อ (one rising syllable, its pitch
  dipping and rising as ขอ's), and the name ผอ ผึ้ง as ผ๋อ, ผึ้ง (run into ผึ้ง, ผ๋อ came out short
  and level; after a comma it keeps the rise, at the cost of a short pause). Exact matches only
  (ผอม is untouched). Three clips again: the name, and the spelling parts ผอ and ผอ ผึ้ง.
- **เณร without its n** (the user, next: "naw nain" sounded "naw ain"): the voice's เณร is its
  เอน, the same loudness and spectrum frame for frame, with no nasal start (in สามเณร too). Said as
  เนน, which sounds as เณร should (neen, mid): the four clips with it (the name, the word, a note, a
  story line, whose timings were made again).
- **The vowels measured** (the user can't check them by ear): each of the 30 recordings' length,
  ending and pitch, and its first two formants (LPC, the vowel's middle; a diphthong's start and
  end). All nine pairs sit where they should on the vowel chart and each pair together (อิ/อี F1
  ~280 Hz, F2 ~2,300–2,450: high front; อุ/อู ~290/700: high back; อะ/อา ~840/1,500: open; เออะ/เออ
  ~420/1,475: mid central…); every short form shorter (110–140 ms against 190–250) and cut off where
  its long one fades; เอีย, เอือ, อัว glide from i, ʉ, u towards a; ไอ/ใอ a → i, เอา a → u, อำ a → m;
  ฤ, ฤๅ (รึ, รือ) ʉ. The one wrong: **อัวะ was อัว**, frame for frame. The voice drops ะ after ัว
  (its ผัวะ is its ผัว too); said as อั่ว (อัวะ's low tone) it's 150 ms, cut off and lower. The card's
  clip and its spelling part again. Real ัวะ words (ผัวะ, ยัวะ) are left: each needs its own tone mark.
- **Checked for others:** each letter's syllable said alone (the spelling parts: all 44, and 136
  other short parts ending in อ), by its loudness: none else in two pulses. (In the names, said
  whole, the two syllables run together too closely for that count.)

## สระ said sà in every vowel's name (2026-10-18)

The user: the vowels' names said "sa ee", not "sara ee", all of them. สระ is two words, sà ("pond",
"to wash (hair)") and sà-rà ("vowel"), and the voice reads sà every time: its สระ was its สะ frame
for frame (347 ms), its สระอี its สะอี (590 ms against 554), where สะหระอี is three syllables (738).
The same in every line about vowels: all 20 tried (names, notes, rule cards, story lines).
- gen_audio's spoken_text says สระ as สะหระ (the สระ homograph card's say already did), except in
  อิสระ, which the voice reads right (ìt-sà-rà, three syllables), and where it's the pool or the
  hair: before ผม, ว่ายน้ำ, น้ำ, บัว or ไดร์ and after ลง (`SARA`). A new line with the pool any
  other way (ในสระ) needs adding there.
- **The bare spelling part สระ** was both: the word sà-rà (ครูสอนสระ, the two rule cards) and the
  syllable sà (สระผม, ยาสระผม, สระว่ายน้ำ). It's now the word; spell.js's syllable sà still shows
  สระ but says สะ (its `said` too, for the tones popup), as a hidden vowel's syllable is written out.
- **The swim story's สระ** (ลงสระ, into the pool) held the "vowel" card, sà-rà, the only สระ card
  but the homograph's, which says both. A pool card (สระ, sà, "pool / pond", say สะ) went into Gym:
  Exercises & Equipment, after ว่ายน้ำ, and the story picks it.
- **สระอัวะ was สระอัว** frame for frame, as อัวะ alone was (2026-10-15), and so was สะหระอัวะ: the
  name is said สระอั่ว, as the card is.
- **สระเออะ was สระเอะ**, the same clip before and after: run on in the name, เออะ is said เอะ (the
  vowel's F2 2,040 Hz, front, against 1,510 alone). Said สะหระ เออะ, with a space, it's ə (1,525)
  after a short pause. Every name was measured so (F1 and F2 of its last vowel, run on, after a
  space and alone): the others are the same run on as after a space, and where they should be.
- Recordings again (58): 28 spelling parts (สระ and the 27 vowel names), 29 Thai (the สระ cards,
  notes, rule cards, 11 story lines) and the pool card's English. The 11 lines' word timings were
  made again. Then pruned (the user's call): 387 clips nothing used, 4.7 MB, these and earlier
  fixes' (`gen_audio.py --prune`).

## From memory checked by a handwriting model (2026-10-15)

The user: From memory was still too strict (Trace was fine), so the neural-network route offered
earlier: a small network trained on real Thai handwriting, run in the app in plain JavaScript.
- **The data:** Burapha-TH (Onuean et al., "Burapha-TH: A Multi-Purpose Character, Digit, and
  Syllable Handwriting Dataset", Applied Sciences 12(8):4083, 2022), its character set: 68 classes
  by 1,072 writers, scanned; the 44 consonants are 41,565 training and 8,800 test images (about
  900 and 200 a letter), the test writers apart. No license file anywhere; the only stated terms (a
  model card quoting the team) grant research and education use, not commercial, citing the paper.
  The app is personal and non-commercial, ships only the weights, and credits it (Settings → About
  → Handwriting). The data is outside the repo (~/Development/datasets/burapha-th, 217 MB of zips
  from services.informatics.buu.ac.th/datasets/Burapha-TH/character/).
- **tools/train_writing.py** (PyTorch, already installed): `prep` (each scan: ink from the paper's
  brightness, specks under 3% of the ink dropped, cropped, fitted into 48 × 48 with 40 on the long
  side, the strokes' cores to full ink), `train` (24 epochs, ~100 s each on the CPU; augmented:
  ±12° turn, size, slant, shift, strokes thicker or thinner, half made crisp like a finger's line),
  `synth`, `tune`, `eval`, `export`. The network: two 3×3 convolutions of 24, pool, two of 48,
  pool, one of 96, pool, 1×1 to 32, 128, 44 (BatchNorm folded in at export); 235k weights, float16,
  **data/write-model.bin, 459 KB** (a JSON header, then the weights).
- **The app's font:** the first model read 97.5% of the test writers right but 8 of Noto Looped's 44
  letters wrong (ป→บ, ฟ→พ, ข→บ, ฑ→ท…): its telling parts are short where handwriting draws them
  tall, and learners copy the app's letters. `synth` makes 6,160 letters from seven installed fonts
  (Noto Looped and Noto Serif Thai, regular and bold; FreeSerif, bold, italic), each warped twenty
  ways and redrawn as its centre line at 2–4.2 px; `tune` trained on 8 epochs more with them (three
  times over) beside Burapha-TH. After: **97.3% of the test writers' letters first pick, 99.4% in
  the top three**; all 44 letters right in Noto Looped, Noto Serif Thai and FreeSerif (drawn as
  centre lines, as the app draws a learner's). Hardest: บ/ข, ย/ผ, ข/ช, ด/ถ. The first model is kept
  as write-model-v1.pt beside the data.
- **In the app** (app.js "From memory's handwriting model"): writeModel fetches and decodes the file
  (cached offline: sw.js SHELL, v20; fetched as soon as From memory opens); writeImage redraws the
  learner's strokes from their points, not the pad's pixels, fitted as `prep` fits a scan, at
  WRITE_MODEL_LINE 2.8 px (the handwriting's median stroke in the 48 box; the pad still shows the
  thick line); runWriteModel is the forward pass, ~80 lines (JS and PyTorch agree on 300 test
  images: the same first pick for all, probabilities within 0.0006; ~120 ms a drawing in Node).
- **The check** (MODEL_PASS): it passes if the letter asked for is the first pick or at least 10%
  likely; another letter is named ("looks more like ป than บ") only at 60% or more; the scribble
  guard (ink over twice the letter's) and the head and loop tips stay. Calibrated on the test split:
  the right letter passes 98.9% (99.2% at 5%, 98.6% at 15%); another letter wrongly passes 0.2%, a
  look-alike 3.6% (worst pair 21%). In the app (headless Chromium, the 44 letters' centre lines in
  Noto Looped and FreeSerif at random sizes and places, and ten wrong letters): 88/88 passed, 10/10
  named the letter drawn; a scribble "Not quite". Without the model (offline before it's cached,
  or the file fails), the shape matching above checks as before.
- Next (the user's call): Trace for vowels and tone marks (below), then retraining with
  Burapha-TH's 22 vowel and mark classes for From memory.

## Write: vowels and tone marks to trace (2026-10-15)

The user asked how to practise writing vowels and tone marks; of the steps offered (Trace for both,
retrain with the symbols, From memory for marks, then vowels), Trace first, after the model.
- **Write follows the set** (writeItems): Consonants as before; **Vowels**, the 30 forms (อะ…ฤๅ);
  **Tones**, the four tone marks from Tone Marks' cards (◌่ ◌้ ◌๊ ◌๋, named ไม้เอก…, said by their
  `say`), each as อ่ อ้ อ๊ อ๋. Each set keeps its place (prefs writeIndex, writeVowelIndex,
  writeToneIndex). The "Writing practice is for the consonants" note went.
- **The carrier:** a vowel or mark is written round a placeholder อ (WRITE_CARRIER), shown at a
  tenth of the ink, and the part to trace at the usual 0.3. eraseCarrier rubs the อ out of a drawing
  of the whole form (destination-out, its fill and a 3 px hair), at the form's origin plus the
  advance of what comes before it (เอือ: after เ), so the shape (target) is the vowel's own strokes;
  the band (where a line may be) keeps the อ, so tracing it as well is no fault, but it doesn't
  count towards coverage. ฤ ฤๅ have no carrier. The start dot is the consonants' only.
- **The prompt:** a vowel's form and sound (เอือ ʉa); a mark on its อ, its Thai name and
  transliteration (อ้ ไม้โท mái thoo). "Trace the vowel. The faint อ holds the consonant's place."
- **From memory** stays the consonants' (its model knows them): the Trace | From memory switch is
  hidden for the other sets, and writeMemory() is false there.
- Checked in the app (each form's own part drawn as dots, as the app places it): 30/30 vowels and
  4/4 marks pass; with the อ traced too, 28/28 and 4/4; the อ alone, 0/28 and 0/4.

## Write: vowels and tone marks from memory; the model's 68 shapes (2026-10-15)

The user: "commit then do the next steps" (retrain with the symbols, From memory for marks, then
vowels).
- **The model, second version:** Burapha-TH's other 24 characters added (SYMBOLS: ฤ ฦ ฯ, ะ ั า ำ
  ิ ี ึ ื ุ ู เ แ โ ใ ไ ็, ่ ้ ๊ ๋, ์): `extend` gave the consonants' model 68 outputs (its weights
  kept; the consonants-only model kept as write-model-v2.pt), `synth` drew all 68 from the fonts
  (symbols at 400 px, alone: Pillow here has no shaping, so no placeholder circle), `tune` 10 epochs
  at 2e-3 (~205 s each) on 63,327 + 3 × 9,520. Asked as the app asks (among the consonants for a
  consonant, the symbols for a symbol): consonants 97.3% first pick (as before), symbols 97.8%; all
  44 consonants right in the three fonts. data/write-model.bin is 466 KB. The consonant check now
  weighs only the consonants (renormalised): the right letter passes 98.8%, another 0.2%, as before.
- **From memory for a vowel or mark** (checkParts): the pad shows only the faint อ; the prompt is
  the line's rows (a vowel's sound and what it is; a mark's name, transliteration, "tone mark 2").
  The strokes that touch are joined into parts (joinTouching: a point within 1.5% of the pad), each
  part placed against the อ's box (partSlot: middle left of it, before; all of it over its top,
  above, wherever across, as a tone mark sits over its right edge; all of it under its foot, below;
  middle right of it, after; else the อ itself, set aside); ำ's circle, with nothing wanted above,
  goes with the ำ after. A place's strokes are split into its parts at the widest gaps (splitParts:
  เอือะ's อ and ะ), each read by the model: it passes at 10% of the model's whole belief (PART_PASS;
  among a place's few shapes a scribble would score ~25%), or first among the place's shapes at a
  quarter of that; another shape is named at 60% among the place's shapes. Feedback per part: "The
  part above should be ◌ี; that looks like ◌ิ", "Missing: the เ in front", "A tone mark goes above
  the consonant". ฤ ฤๅ (no carrier): ฤ read among the consonants and ฤ ฦ; ๅ, unknown to the
  model, only has to be there. Calibrated on the test split, per place at 10%: the right part
  passes 98.2% (below) to 99.8% (after, tone marks), a look-alike there 0–0.7%.
- **Checked in the app** (each form's parts drawn as lines, nearest point next, at 4× the pad's
  resolution, as the app places them): tone marks 4/4 right, 4/4 look-alikes named, 4/4 drawn
  under the อ told "A tone mark goes above the consonant"; vowels 30/30 right, 18/19 look-alikes
  caught (the one, แอะ for เอะ, a test artefact: แอะ's own layout put แ's second stroke on เอะ's อ).
  The first runs, with each pixel a stroke and placed by its middle, failed on placement, not on
  reading: why parts are joined first and placed as wholes.
- **Write's top is the Letters page's line** (the user's call): alphaLineText and fillAlphaText
  (shared with pickAlpha) give the rows; the letter, vowel or mark on the left at 42 px; From memory,
  a consonant's picture (52 px) in its place, a vowel's or mark's an empty dashed box. 60 px × text
  size, the same in every set and mode, so the pad doesn't move. The letter sits in `.write-slot`,
  at least the picture's width, and stays there hidden From memory with the picture or box laid over
  its middle, so the rows don't jump right when switching (the user's report). The Letters page's line puts its
  letter in the same slot (pickAlpha), so going from Letters to Write keeps the row, the letter and
  the text where they were (measured: the same to the pixel for ท and เอือ, the text's width too
  now that Write has Details).
- **Details on Write** (the user's call): the row (#write-name, a div now, not a button) ends in
  Details ›, which opens the item's dialog: showLetterPop, showVowelPop, or for a tone mark
  showMarkPop with the mark's own card (the Write item keeps it as `card`). The letter's slot is the
  button that says it. From memory, Details would give the answer away: it keeps its room but is
  hidden until the drawing is checked (drawWritePad), and again when the pad is cleared.
- **Home** (the user's wording): Topics' rows shortened ("Every word in a topic. Tap ⟲ to add one to
  Cards.", "Browse, Recognition and Recall", "Short stories that use the topic's words"), and the
  Dictionary's "Browse or search in Thai, English or transliteration".

## The Alphabet's vowels in three sections (2026-10-15)

The user: the Vowels page was a wall of tiles; split it by group. Their call, after the options: keep
the order Thai schools teach (อะ อา, อิ อี … เออะ เออ, the diphthongs, อำ ใอ ไอ เอา, ฤ ฤๅ), which reads
straight through the sections, rather than a 3×3 chart by the mouth (offered; it would move อะ อา to
the middle).
- **VOWEL_SECTIONS** (app.js): The nine vowels · short and long (nine pairs, three to a row, a CSS
  grid), Diphthongs · two vowels in one (three pairs), Extra vowels (สระเกิน) · four with a final
  built in, and two from Sanskrit (อำ ใอ ไอ เอา and ฤ ฤๅ, a row). VOWEL_GROUPS (the vowel dialog's
  partner) is their groups. Headings as the word dialog's "The tone table".
- **One tile width** for all 30 (sizeVowelTiles, in place of sizeTiles here): the widest's, no wider
  than lets three pairs fit; then less side padding (.tight); then, if เอือะ still doesn't fit, every
  tile's text a little smaller (.shrunk, `--tile-fs`): at 390px tiles are 52px with 25px text, at
  430px 59px and 27px; desktop is unchanged (81px, 30px). mobile.css's 64px min-width is lifted for them.
- **A tap hears it** (the user, next: usually they just want the sound; their pick of the options,
  with long press): a tile says its vowel (speakerPress, lit while it plays) and is marked
  (aria-pressed), and the line above the grid (#alpha-hint, `.vowel-hint`, 52px for the hint or the
  line, so the grid doesn't move) becomes the vowel, its sound (the card's English) and **Details ›**,
  which opens the dialog. Considered and not used: tap again for details (no replaying), a Hear |
  Details switch (modes get forgotten).
- **Long press** (onLongPress, by speakerPress; LONG_PRESS_MS 450): held without moving 10px, it
  opens the dialog at once; the click its release makes is swallowed wherever it lands (the dialog is
  under the finger by then), through a document-level capture listener while `longPressHeld` and for
  400ms after. Right-click and Android's long-press menu (`contextmenu`) open it too. Tiles have no
  text selection or iOS callout. Tested: tap (sound, line, no dialog), Details, hold (dialog stays
  open after the release), a press that slides (nothing).
- **The consonants too** (the user, next: "do the same for consonants"): pickVowel became
  pickAlpha(grid, tile, card, text, open), shared; a consonant tile says its name (its card's `say`,
  กอ ไก่) and the line is the letter, "gɔɔ gài · g — chicken" and Details › (showLetterPop); a long
  press opens it. Its picture was in the line for a day, 36px, and went (the user's call: too small
  to see clearly there; the dialog has it). The tiles are `.letter-tile` now
  (lit while playing), and the line and its pinning are `.line-hint` / `.line-top`, set for both
  sets (not Tones). Hint: "Tap a letter to hear its name. Hold it for its details."
  Then (the user's requests) the line gives its class too, as the dialog does (● Mid class, in the
  class's colour), on a second line of its own, and the transliteration in the accent yellow and
  italic (`.alpha-line-tr`, as `.pop-tr`), and then (the user's calls) a line each: "gɔɔ gài",
  "g — chicken", "mid class" (no ●, lower case; the colour says it). The row is three lines tall now, 60px ×
  text size (it was 52px), for the hint and the vowels too. A line too long for the width goes
  without the English's bracket (pickAlpha takes the text as a function of `short`), then ends in
  "…" (CSS). The letter is 42px × text size (it was 26px). A vowel's line likewise (the user's
  call): its sound in yellow ("ʉa"), then what it is ("short (almost unused)"), the card's English
  split at its dash; that may take two lines.
- **The Tones page's hint too** (the user: the pages should look the same when switching): its row
  gets `.line-hint` and `.line-top` as the others', one height (60 px × text size) and pinned on a
  phone, so the content starts at the same place on all three (157 px at 390 px, 260 on desktop).
  Its hint lost " The cards: read a syllable's tone." (the user's call).
  The hint's text is in a `.alpha-hint-text` box with 16 px either side, so it sits in from the
  edges (the user's call); a letter's line, which replaces it, keeps its place (Write's matches it).
- **The line pinned** (the user, next: it should stay as the vowels scroll, like the top menu, and be
  one height for the hint and a vowel). On a phone `.alpha-top.vowel-top` (renderAlphabet sets it
  for the Vowels set) is sticky at `--pinned-h` (76px, the section row's height, now a variable),
  taking the gutters; once the page scrolls it has the page's colour and the hairline, and the
  section row above drops its own (`:has`), so the two read as one band. The line is a fixed height
  now (52px × text size; it was a minimum), the hint shortened to "Tap a vowel to hear it. Hold it
  for its details." so it fits two lines at any size. Checked at 390×664 (Safari with its bars):
  the hint and a vowel's line the same height at text sizes 1–3, the band in place when scrolled,
  a tap there updating the line (no dialog). At 390×844 the page fits without scrolling.

## English Loan Endings topic (2026-10-15)

The user asked how English loans' endings map onto Thai's (s → t, f → p…), then asked for it as a
topic: Thai Script → Tones & Reading, after Final Sound Families: `script-loan-endings`, 23 cards.
- **The map in the `about`:** a line per row (-p -b -f -v → -p; -t -d -s -z -sh -ch -j -th → -t;
  -k -g → -k; -l → -n, often -w; -r not said; -m -n -ng kept; extra consonants silenced with ์),
  the Royal Institute's transcription rules (หลักเกณฑ์การทับศัพท์ภาษาอังกฤษ) named, and the two
  habits the rules don't cover: newer loans keeping a real f or s, and the high tone on -p/-t/-k loans.
- **The cards** are all words the app had (แอป, กราฟ, เสิร์ฟ, กอล์ฟ, ลิฟต์, เน็ต, การ์ด, เทนนิส,
  แก๊ส, โค้ช, บลูทูธ, เค้ก, บล็อก, บิล, อีเมล, ไฟล์, ไลน์, เบอร์, คอมพิวเตอร์, เกม, แบรนด์, ฟิล์ม,
  เฟซบุ๊ก), with their English and transliteration, so no new Words entries; the notes give each
  ending's rule. The existing transliterations refined the answer given in chat: ลิฟต์ is líf (a
  real f kept) and อีเมล ii-meeo (-l as -w), so the notes say both.
- **A tile board** in eight groups of two or three, by the ending Thai gives. Groups of five or six
  made the tiles (all the widest one's width, no wider than the biggest group allows) too narrow for
  บลูทูธ or คอมพิวเตอร์; คอมพิวเตอร์ and เกม are left off it.
- 8 new recordings: Thai in the notes and `about` (คลับ, บุ๊ก, ร์, ล์, ด์, น์, ก ค, the rules' name).

## Borrowed from Further Afield topic (2026-10-15)

The user asked which other languages Thai borrows from, then for a companion to Native or Borrowed
(which covers Pali, Sanskrit, Khmer, Chinese, English): `script-loanwords-more`, Thai Script →
Words & Spelling, after it, 24 cards in language order: Malay 7 (ทุเรียน มังคุด มะละกอ กุญแจ ราคา
โจรสลัด ภูเก็ต), Persian 3 (องุ่น กุหลาบ ฝรั่ง), Arabic 2 (มัสยิด มุสลิม), Portuguese 4 (สบู่ ขนมปัง
บาทหลวง เหรียญ), French 3 (กาแฟ ฝรั่งเศส บุฟเฟต์), Tamil 2 (แกงกะหรี่ เนย), Japanese 2 (สุกี้
คาราโอเกะ), Lao 1 (กระติบ). Each note gives the source word.
- **Checked against Wiktionary** (its "Thai terms borrowed from X" categories and each entry's
  etymology), since Wikipedia's list of Thai loanwords is flagged unsourced. Two examples given in
  chat couldn't be confirmed there and aren't used: เลหลัง from Portuguese, and แซ่บ from Lao/Isan
  (not in either list). The `about` names Wiktionary.
- 16 words had cards (same English and transliteration); 8 are new: โจรสลัด, องุ่น, มัสยิด, บาทหลวง,
  บุฟเฟต์, แกงกะหรี่, เนย, กระติบ (pronunciations from Wiktionary). The curry is แกงกะหรี่, not
  กะหรี่: the app's กะหรี่ card is the offensive slang (another source, Hindi chokrī), which the note
  says. บุฟเฟต์ búp-fêe is in tools/tone_exceptions.txt (rules give low and mid).

## One card per meaning across topics (2026-10-13)

The user asked why ยังไง was listed twice on the Words page: Question Words had it as "how
(casual)" and Contractions: Questions as "how", and a card is its Thai and English, so they were
two cards. 380 words were listed more than once (same Thai, same pronunciation). Of the two fixes
offered (one Words row per word, or tidy the data), the user chose the data.
- **210 merges** (431 glosses): each word's cards with the same meaning now share one gloss, so
  they're one card everywhere (topics, stories, Cards, progress), keeping each topic's own note.
  Usually the fuller or clearer gloss, sometimes a combination (เรา "we / us / I (casual)", พี่
  "older sibling; you, I (to or from someone older)"). เค้า is "he / she / they (casual spelling)",
  as เขา's "he / she / they" is in the same topic.
- **Kept apart (196 words):** different meanings (ผม I / hair, หมา dog / the insult), a
  classifier beside the noun (ห้อง room / rooms), adjective beside verb (เปิด open / to open), and
  the Spoken Top-500 cards that gloss several meanings at once (ชั้น "I / floor, level"), which
  a merge would lose.
- 3,998 cards changed (most in stories), and 1,248 `words`/`partners` references. The Words page
  went from 7,085 entries to 6,864. 42 new glosses got English recordings.
- **Saved data:** `migrateCardRenames` (app.js, once per browser) moves Cards words and progress
  from the 264 old keys (`CARD_RENAMES`) to the new ones; where both have something, the earlier
  added date and the progress with more reviews stay.
- audit_decks now lists ณ beside เขา as Thai said two ways on purpose (the letter, and "at").
- **The colours (the user's next find, สีเหลือง and เหลือง):** the Colors topic's 14 สี- compounds
  (สีแดง, สีขาว…) are now phrases, สี + the colour word (`words`), as a Thai dictionary has them,
  so the Words page lists just เหลือง. They're glossed "red (the colour)" and so on, beside the bare
  words' "red": a story holds both the phrase and its words, and a topic can't hold one English
  twice. New bare cards in Adjectives: Senses & Qualities (now 25): ขาว, ดำ, ชมพู, ม่วง, เทา,
  น้ำเงิน. สีส้ม, สีทอง, สีเงิน and สีน้ำตาล use ส้ม "orange", ทอง "gold", เงิน "money / silver" and
  น้ำตาล "sugar" (brown is "sugar colour"). เรือใบสีฟ้า (Man City) is เรือใบ + สี + ฟ้า. Eight stories
  were added again so their lines split the colours and keep the phrase cards (15 lines).
  `CARD_RENAMES` moves saved progress on the old colour keys too.

## Tiles to tap and hear on Thai Script topics (2026-10-12)

The user asked for something to tap on Alphabet in Order, between its text and the word list, then
the same on the two vowel topics, then on every topic where hearing things side by side helps. 19
topics have them, under a line of help:
- **Alphabet in Order:** the 44 letters, square, as on the Words page, each saying its name.
- **Mid, High, Low — Paired, Low — Sonorants:** the class's letters, those with the same sound
  together (ข ฃ, ศ ษ ส, ค ฅ ฆ…). **Look-alike Letters:** the look-alikes together (บ ป, ด ต, ข ช ซ…).
- **Short & Long Vowels, Diphthongs & Special Vowels:** short/long pairs; อำ ใอ ไอ เอา, which have
  no pairs, as a group of four. The vowel's sound, not a name.
- **Tone Chants:** each chant a row, tapped through a syllable at a time (กา ก่า ก้า ก๊า ก๋า…).
- **Final Sound Families:** กา (no final), then กก กด กบ, then กง กน กม เกย เกอว.
- **Sound Pairs (3) and Tone Pairs (6):** each pair or set together, in the topic's card order
  (ไก่ | ไข่; คา ข่า ค่า ค้า ขา…).

How it works:
- **A topic's `board` in decks.json:** `hint`, then `tiles` (square tiles in a grid) or `groups`
  (a list of lists, a group kept on one line, the groups flowing on); `letters: true` makes grouped
  tiles square with a large letter. `renderLetterBoard` (app.js) draws it once per topic.
- **A tile plays its Thai's sound:** a card's own (a letter's `say`, so ก says กอ ไก่), else a
  recording gen_audio makes for the tile (the board's strings are keyed like a card's Thai; the
  chant syllables were mostly there already, 4 were new). It's lit while it plays
  (`.letter-tile.playing`, `markSpeakers`), so Read all lights the tiles in turn.
- **Layout:** `.letter-groups` is a flex wrap of `.letter-group`s, 4px between tiles and 20px
  between groups on a phone, the rows centred, and every tile the widest one's width
  (`sizeLetterTiles`, `--tile-w`; 2026-10-13, the user's call: they sat to the left, and เออะ's
  wider tiles put the columns out of line). Tiles are 64px (54px at 320px, so a set of five fits) and grow for a
  long word. Checked on all 19 at 320, 390 and 1280px: no group split across lines, nothing cut.
- Alphabet in Order is now the first Consonants topic (it was fifth).

**A card's sound is filed under its `say` too (`cardSay`).** The ณ "at" card added the same day
has the same Thai as the letter ณ, and the recordings were keyed by Thai only, so the letter had
been saying ná instead of นอ เณร (the user heard it on the tiles).
- gen_audio keys a card with a `say` under that text as well, and the app plays any card as
  `cardSay(card)` (its `say`, else its Thai): the row and card speakers, Listen mode, Recall, Read
  all, the word dialog, preloading, and the tiles.
- When cards share a Thai, its key goes to a plain reading, else to a letter's name, else to the
  first; a plain card taking a letter's key gets a warning. A lone letter in a note or topic text
  means the letter, and the word ณ never stands alone in text (ณ วันที่, งูใหญ่นอนอยู่ ณ ริมวัด
  are read whole), so: ณ "at" has `say: นะ` (its dictionary reading) and 'ณ' is the letter again.
- A letter and its name word in text ("ณ เณร", "ฎ ชฎา", all 44) is read as the letter's name
  (`LETTER_NAMES` in gen_audio, from the letter cards' `say`): read verbatim, the voice can take
  the letter for a word. They reuse the letter cards' recordings.
- **เขา:** "he / she / they" (kháo, on 152 cards counting story copies) has `say: เค้า`, the
  informal spelling of how it's said; "hill" and "horn" keep the plain เขา, khǎo. They shared one
  recording before. A check over every card found no other Thai with two readings.
- 62 recordings are no longer used; `gen_audio.py --prune` would delete them.

## Flashcards fit a phone screen (2026-10-12, branch `2026-10-12-card-fit`)

The user asked whether Flashcards still fit one iPhone screen at larger text sizes. They didn't,
before the tab bar either. Measured in Chromium at iPhone sizes: in Safari with its toolbars showing
(390×664), the buttons under the card went 31–65px under the tab bar at Larger and 87–131px at
Largest. An iPhone SE in Safari (375×548) was over even at Default. The cause: the card's height was
a share of the screen (46vh, plus 50vh per step of `--fs`), mostly empty space between its corner
buttons.
- **`sizeCards()`** (app.js), on a phone: the card takes the height the page leaves it, from under
  the controls down to the tab bar, less what's under it (Recognition's answers, the ‹ › buttons,
  Recall's grades). The last buttons end 12px above the bar. It runs first in `fitCardText()`, so
  at every moment that already fits the text (a new card, a mode, coming to Flashcards, a resize
  such as Safari's toolbars hiding, a Text size change, fonts arriving), and the text then fits
  the new size. Below `CARD_MIN_H` (240px: the corner buttons and a line between) the page scrolls.
  Desktop is untouched (it clears the inline height).
- **The card keeps one height within a mode:**
  - Recall's grades keep their room before the card's turned (`visibility: hidden`).
  - Recognition's answers have room for three lines of English at any text size, and a longer one
    shrinks to fit (`fitPills`, down to 70%). Answers of one to four lines moved the card by up to
    60px.
  - Recognition has no ‹ › row, so no empty grid row and gap under the answers.
- **`fitBack`** shrinks all the back's lines together (it shrank only the answer): on a shorter
  card at Largest, the Thai, transliteration and answer were over by a line.
- **The page is `100dvh` on phones** (html, body min-height), not Safari's `100vh` (the height with
  its toolbars hidden), so a page that fits doesn't scroll.
- **Result:** everything fits at all text sizes on a 390px iPhone, in Safari and as a Home Screen
  app, and on an SE as a Home Screen app. The SE in Safari with its toolbars showing still scrolls
  10–30px in Recognition (the card at its minimum): one row of controls above the card instead of
  two would fix that.

## Write: tracing the consonants (2026-10-14)

The user asked how writing could be checked, then said "try it" to the first step proposed: tracing.
A third Alphabet page, **Letters | Cards | Write** (a pen icon; prefs.alphaPage `write`, the view
still `alphabet`: renderAlphabet shows `#alpha-write` in place of the grid). Consonants only: on the
Vowels or Tones set it says so, with a button to switch.
- **The pad** (`#write-canvas`, square, `touch-action: none` so a finger draws rather than scrolls):
  the letter faint in the looped font ("Learn Thai Looped"), as large as fits in 80% of the pad
  (placeGlyph, its ink centred); your line in the accent colour. ‹ › step through the 44
  (prefs.writeIndex), saying each name; the name above says it again when tapped.
- **Check** (checkWrite) works at WRITE_N = 240 on masks drawn from the font, no samples or model:
  - on the letter: the share of your line inside a band WRITE_BAND (10) either side of the
    letter (the glyph drawn with strokeText's line as the band);
  - covered: the share of the letter within WRITE_REACH (6) of your line;
  - passes at 75% on and 85% covered (WRITE_PASS). Short of it, what wasn't covered shows red,
    with "Trace the red parts too" and/or "Keep your line on the letter".
  Simulated in headless Chromium: the whole letter painted passes, half of it or a scribble fails.
- **The head:** a letter's head is found as its one loop-sized enclosed hole (100–150 px² at 62% of
  the pad, scaled with the letter's size); a green dot marks it, and a pass that started more than
  12% of the pad away gets "Next time, start at the head". Two head-sized loops (ฆ ฉ ฌ ญ ฐ ฒ ณ น ม
  ษ ห): no dot, as which is the head couldn't be told from the shape; ก ธ have none. Checked on a
  sheet of all 44 pads. A writing chart from the user could add the two-loop letters' heads.
- **From memory** (the next step, the same day, "add next steps"): a Trace | From memory toggle
  (prefs.writeMode). The pad is blank; the prompt is the letter's picture, transliteration and
  meaning, and its name is said, not the letter shown. (‹ › moved to the foot, either side of Clear and Check, as
  Cards has its arrows: the user's call.) The top row is one height in both modes (64px × text size;
  the prompt at most two lines, the picture sized before it loads), so switching doesn't shift the
  pad (the user's request). › goes to a random letter (‹ back through
  them). Check fits the drawing, keeping its shape, onto each consonant's ink box (fitTo) and
  scores it against all 44 (writeScore: on, covered, their f1; ink, its area against the letter's):
  - pass: the letter asked for scores 0.80 or more and is within 0.05 of the best;
  - "That looks more like X than Y": another letter wins by more, at 0.85 or more;
  - "Not quite: here's Y" otherwise, or when the drawing is mostly fill (ink over 2× the letter's).
  Calibrated on every consonant drawn in FreeSerif and Noto Serif Thai as stand-ins for other hands:
  all 88 pass; ป or ก drawn for บ lose by about 0.14; 2 of 22 dense random scribbles still pass
  (scribbling isn't what a learner does; real fingers on the phone may want the numbers moved).
  After Check the right letter shows faintly behind the drawing. Look-alike groups are in
  WRITE_LOOKALIKES (the board's and ข/ฃ, ถ/ภ, ฎ/ฏ, ท/ฑ, ม/ฆ, น/ม, ห/ฬ…), kept for messages to come;
  the check itself uses all 44. The scores are in the feedback's data-score, for tuning.
- **Loosened** (the user, trying it: "checking is too strict"). A finger wobbles more than the
  simulated tracing: a letter's line is about 19px wide at WRITE_N, and the old reach covered it
  only from a line within about 4px of its middle. Now WRITE_BAND 16 (was 10), WRITE_REACH 12
  (was 6); Trace passes at 60% on and 70% covered (was 75%, 85%); From memory passes at f1 0.65
  (MEMORY_PASS; was 0.80). But at the loose tolerances look-alikes merge (ป drawn for บ passed), so
  From memory tells letters apart at the old, tight ones (TELL_APART: band 10, reach 6; a separate
  `bandTight` per letter): the letter asked for must be within 0.05 of the best match there, and a
  rival scoring 0.8 that beats it by more is named. Recalibrated: all 88 other-font drawings pass,
  ป and ก for บ are still named, 3 of 22 random scribbles pass. Numbers to move again from real use.
- **The head first** (stroke direction, the same day): in both modes, when the first stroke starts
  at the head (single-loop letters) but leaves it within a fifth of the pad's length of line
  (loopFirst: the line goes more than 13% of the pad from the head), a pass adds "Next time, draw
  the little loop first, then the rest". Thai letters start with the head's loop. Tested with a
  stroke straight down from ข's head (the tip) and one circling it first (none).

## The Dictionary in English too (2026-10-14)

The user's design: Thai as before, or English, chosen by an icon switch where the Alphabet's
Letters | Cards is.
- **The switch:** `.dict-switch` (Thai | English: ก and A over their names, as the other switches)
  beside the search box, in `.dict-top`; both 52px tall. The search's placeholder is now "Search
  Thai or English" (it still finds transliterations). prefs.dictLang keeps the choice.
- **English:** an A–Z grid (`LATIN_LETTERS`), and a letter's words listed English first, then Thai and
  the transliteration (the word rows take any column order). `buildEnglishIndex` files each word
  under each of its meanings' headwords: the English split at " / " and "; ", a leading "(…)",
  quote or "…" dropped, "to", "a", "an", "the" skipped, and "1,000 — thousand" under its word.
  So "to have / there is" is under H and T, "to eat" under E; once a letter per word. Sorted by
  headword. About 9,000 filings for the 6,864 words; every letter has some (X 3, Z 6).
- Searching lists English first too in English. The letter dialog's "All N in the Dictionary"
  switches to Thai.

## The Topics section: List, Cards and Reading as one (2026-10-14)

**Settings, to match** (the user's go-ahead, the same day): the Topics category is **List** (the
switch's name and table icon; data-cat stays `wordlists`), and the three are ordered List, Cards,
Reading, as the switch has them. Cards has a line, "These apply to the Alphabet's cards too"
(`.setting-cat-note`: the same engine), and Show first's help says it sets the Dictionary's Thai lists
too. The confirm dialog's "turn this back on" points to Settings → List. No Alphabet or Dictionary
category: their only choices (Classes, Thai | English) are on their pages.

**The home page links to the three sections** (the user's call, the same day: it was linking to the
pages inside them): Topics (across both columns; its rows List, Cards and Reading, List keeping the ⇄
hint), Alphabet and Dictionary, as the tab bar has them. Each opens its section where you last were
(goTo: Topics' last page, the Alphabet's Letters or Cards). The Cards and Reading cards went.

**Words is the Dictionary again** (the user's call, the same day, with Topics named): the tab and
the home card say Dictionary, and the letter dialog's link "All N in the Dictionary ›". (It was
"Words" from 2026-10-12; "Search words" and the like stay, being about words, not the page.)

**Named Topics** (the user's pick from Topics, Learn, Lessons, Practise and Vocab, the same day; it
was "Study" at first): the tab says Topics, with the list icon the topic picker has, and the switch
says **List | Cards | Reading**, List with a small table icon. In the code it's still `study`
(data-view, `.study-switch`, `STUDY_VIEWS`, prefs.studyPage); below, "Study" means this section.


The user's call, after the Alphabet's picker-and-switch: the three pages already share the topic
picker, so they're one section, **Study**, with the same shape. The switch went through three forms
the same day, all the user's calls: labelled buttons in a row of their own under the topic button
(they'd turned down bare icons: "it isn't explicit"); then, to compare, icons beside the topic button
as a Settings choice; then icons with their names under them at the tab bar's 12.5px, which became
the only form (the setting went). It saves a row: the Cards page's card is 499px tall, not 447px, on
a 390px phone.
- **Tabs:** the phone's bar is Home · Study · Alphabet · Words · More; wider screens' tabs are Study ·
  Alphabet · Words. More's list now holds only Settings (and pages to come); Alphabet and Words left
  it for the bar.
- **The switch:** `.study-switch` (Topics | Cards | Reading) beside the topic button, shown on the three
  pages but not on the Alphabet's Cards page; the Alphabet's `.alpha-switch` (Letters | Cards) is
  the same. Each `.seg-btn` holds a `.seg-icon` and a `.seg-label` (the old tab icons; Letters is a
  2 × 2 grid). On a phone the topic button takes what's left (`flex: 1 1 0`, about 187px with
  Study's three), and the switch rules are scoped to `.deck-picker-bar`, or its `.segmented` flex
  rule stretches them. Reading again with a story open closes it (it was the Reading tab's job).
- **Code:** the views are still `wordlist`, `flashcards` and `reading`. The tab is `data-view="study"`;
  `pageNow()` calls the three `study`, so its tab lights; `goTo('study')` opens the one you were last
  on (prefs.studyPage, saved by setView); the home cards go to their pages as before.
- **Wider screens:** the topic button keeps at least 220px and the controls' row wraps, or the switch
  squeezed the topic's name to "C…".

## Alphabet (2026-10-14)

A section of its own, the user's design: the consonants in a grid that opens a letter dialog (with
the pictures), and its own Browse, Recognition and Recall. The user's calls: no "known" marks on
the grid, letter progress apart from word progress, consonants only for now, the loopless font
later (it's already in `fonts/`, NotoSansThai).
- **Where:** More's first row on a phone, a top tab on wider screens (data-view `alphabet`, a line
  ก for its icon). It opens on whichever of its pages you were last on (prefs.alphaPage).
- **Letters | Cards:** a switch beside the topic button (`.alpha-switch`), on both pages: icons with
  their names, as Study's (see Study).
- **Letters** (`#alphabet-section`, renderAlphabet): the 44 letters in `.dict-grid` tiles, ฃ ฅ
  dimmed. Classes (prefs.alphaClasses, colouring them by class with a legend) was removed on
  2026-10-15 (the user's call); the letter dialog still gives each one's class. Since the same day
  a tap says the letter's name and a long press opens its dialog: see the vowels' section below.
- **The letter dialog** (showLetterPop) uses the word dialog's frame (#word-modal: close, Escape,
  backdrop): the letter large (tap: its name), its picture, play; Name, Class, Sound (start and
  final, from the card's note: "Final: -k", "Never a final", "No longer used"), Same sound (other
  letters with the sound, by class colour) and Looks like (the Look-alike Letters board's groups),
  each opening that letter; the note; five words starting with it (the most topics first), each
  opening the word dialog; All N in Words.
- **The cards** are Alphabet in Order's (`script-consonants-all`) with `alpha: true` and `pic`:
  - **Their own progress:** cardKey is `abc:ก`, so their items are apart from the Thai Script
    topics' letter cards; the backup summary counts them as letters.
  - **The Cards engine, swapped:** the Alphabet's Cards page is the Cards page (view
    `flashcards`) with `state.section = 'alphabet'` (stage `data-section`). `useSection` keeps
    each section's engine state (`ENGINE_STATE`: cards, queue, position, mode, direction,
    Recognition's and Recall's streams) while the other's is in, so each keeps its place.
    setView swaps the words' back for anything but the Alphabet's Cards page; answerSeq stays
    global. Mode and direction save as prefs.alphaOrderMode / alphaDirection.
    - **What's the stage's, not the engine's, is redrawn on the swap** (2026-10-20, the user's
      report): the "none of this topic's words are in Cards" message is drawn by renderCard, which
      Recall doesn't use, so it stayed the other section's. The Alphabet on Recall came back from
      Letters with the Topics message over it, and Topics on Recall with nothing in Cards came back
      from the Alphabet blank. `useSection` now calls `renderReviewOnly` whatever the mode. A round
      trip of every mode pair (Alphabet Cards → Letters → Cards, → Topics' Cards → back, and
      Topics' Cards → Letters → back; nothing in Cards and a topic added) found only these two.
  - Every letter is in (no adding to Cards): `reviewOnlyCards` and Recall's `reviewPool` take
    them all, in alphabet order. `ALPHA_SCOPE` is a full scope (decks, cards, deckOf) for
    flashScope; the letters are in `state.cardIndex` under the deck id `alphabet`.
  - **The picture** shows on the card's back (`#card-pic`, Recall's `#review-pic`; showPic).
- **Pictures** (`images/letters/*.svg`, LETTER_PICS): all 44 (ก ข ค ง จ ช ป first, the other 37 the
  same day, at the user's request), drawn by hand as SVG (the user liked the style): viewBox 0 0 400 400, a cream square (#fffaf2), outlines #2b2b2b at
  stroke-width 7 with round caps and joins, flat fills (white, greys, red #e0443a, yellow #f2b632,
  green #86c98a, blue #b9e0ee). Checked by rendering in headless Chromium. Transparent since
  2026-10-14 (the cream square went: the user's pick of four versions tried on the Black, Dark and
  Light panels); on the dark themes a CSS edge in the theme's ink (four zero-blur drop-shadows,
  2px; 1.5px on Write's small prompt) makes each a die-cut sticker so its dark lines show; none on
  Light. Lines in the theme's colour were tried and lost white-filled shapes' edges and the eyes. The buffalo is a head
  from the front: side on, it read as a goat. Others that needed a second go: ฉ's cymbals (a split
  ball, then headphones, before two bowls on a cord), ฐ's pedestal (with a lotus bud it was a
  birthday cake; then a stone plinth, which the user found un-Thai; now a gold Thai lotus base,
  ฐานบัว: slabs, downward and upward lotus-petal bands, a jewelled waist. No Buddha image on it), ฏ's ox goad (a
  spear with a tassel at first; now a long wooden stick with a thin iron spike, bound at the tip,
  and a cord loop: the user picked it over the goad shown prodding a buffalo), and ศ's pavilion (redone at the
  user's request as a Thai sala: an orange-and-green tiled gable with a lower eave tier, a gold
  gable face, gold barge boards with ใบระกา blades, a ช่อฟ้า at the peak and หางหงส์ at the ends, white
  pillars on a raised platform). The people (ฅ ญ ด ท ฒ ณ ษ ย ฑ) are head-and-shoulders
  portraits on one template (the neck runs from inside the head into the shirt, drawn behind both:
  at first it stopped short and the heads floated, the user's report), told apart by what they wear: the soldier's helmet, the novice's
  robe, the hermit's tiger-skin hat, the giant's green face and crown, Montho's crown. The files
  are the source: edit them directly. A new one goes in LETTER_PICS and sw.js's SHELL (now v19),
  so it's offline.
- **Home card** (the user's request, the same day; later the home page became the three sections' cards,
  see The Topics section): the fifth, across both columns on wider screens;
  it opens the Alphabet's last page, as More's row does. No pictures on it (the user's call: it had
  the first five letters' for a moment).
- **Vowels and tones** (the same day; the user's calls: one choice for both pages, at the top as the
  topic picker is elsewhere; tone cards drill reading a syllable's tone; Vowel Symbol Names stays in
  Topics):
  - **Sets** (`ALPHA_SETS`: Consonants, Vowels, Tones; prefs.alphaSet): on the Alphabet's pages the
    topic button shows the set and opens `#alpha-set-menu` under it (toggleAlphaSets; an outside
    tap or Escape closes it). A new set redraws Letters and starts its cards afresh, as a new topic
    does on Cards. Each set is a scope (`alphabet:<set>`) built from Thai Script topics; progress is
    its own: `abc:ก`, `abc:vowels:อา`, `abc:tones:ข้าว`.
  - **Vowels:** Short & Long Vowels and Diphthongs & Special Vowels' 30 cards, in groups
    (`VOWEL_GROUPS`: short/long pairs, then อำ ใอ ไอ เอา, then ฤ ฤๅ), as the boards' tiles
    (sizeTiles, now shared with the boards). The dialog (showVowelPop): sound and length, the
    short or long partner (ใอ/ไอ: same sound), the marks it's written with (`VOWEL_PART_NAMES`,
    each a chip with its glyph that says its name; แ is ไม้หน้า ×2; ◌ึ lists only พินทุ์อิ, as what
    its curl is called couldn't be confirmed), live or dead, and its note.
  - **Tones page** (renderTonesPage): the five tones (toneCurve, the Thai name), the four marks
    (Tone Marks & Symbols' cards), and the tone chart, the word dialog's tone table's way round (the
    user's call): a row per class; columns live, dead short, dead long, then the four marks; each
    cell a Tone Chants syllable and its tone's curve, the tone from tones.js `tableTone`, so it
    can't disagree with the rules. (At first the classes were columns.) A tone's dialog: its curve, The Five Tones'
    description and example, what makes it (the chart's cells), and Read the Tone's words with it.
    A mark's dialog: the tone it gives each class, with the chart's syllable.
  - **Read the Tone** (Thai Script → Tones & Reading, 25 cards, five per tone, across classes,
    marks, live and dead, and leading ห/อ): the Tones set's cards. `english` is "falling tone —
    rice"; the tone checker vouches for each. In Recognition their answers are tones (`answerText`,
    `TONE_ANSWERS`: the right one and two others), the tone read from the transliteration's mark.
  - **The Tones set's cards are many more** (the user's call, the same day: 25 was far too few):
    Read the Tone's 25 first, then every one-syllable word in the topics whose tone follows the
    rules (`addToneDrill`), the most used (topics and stories holding it) first, about 1,860 in
    all. A word only in Thai Script's topics is left out, and so is any whose toneBreakdown is an
    exception (the loanwords and the like in tone_exceptions.txt), which would teach a wrong rule.
    Each card: "falling tone — rice", and a note made from the breakdown (`toneReason`: "High
    class + ไม้โท: falling."). The words have their Thai audio already; the "… tone — …" English has
    none (only an English → Thai card would want it). Built the first time the set is used
    (alphaScope), about 0.1 s in Chromium, not at startup. A tone's dialog lists only its first
    eight.
  - minmax(0, 1fr) columns keep the five tone tiles inside 320px; the chart is at most 640px wide.

## Phone tab bar (2026-10-12, experiment, branch `2026-10-12-bottom-tabs`)

With Dictionary, the four tabs, Home and ⚙ no longer fit across a phone. On a phone (mobile.css)
the tabs are now a bar along the bottom, as in an iPhone app: Home, Topics, Flashcards, Reading and
Dictionary, each a line icon over its name, the current one in the accent colour.
- **Markup:** one set of tabs. The icons (`.tab-svg`) and the Home tab (`.tab-home`) are hidden on
  wider screens, so desktop is unchanged.
- **No top bar on a phone** (the user's call, the same day). For a while it showed Learn Thai and
  ⚙ on Home only; then **Settings was the bar's sixth item** (until More, 2026-10-14) (`#tab-settings`, a gear), opening the
  settings as ⚙ does rather than a page. It's a `.tab` without `data-view`, so `els.tabs` leaves it
  out. Six items get 61–70px each on 375–430px phones.
- **More is hidden again, Settings back on the bar** (2026-10-14, later the same day, the user's
  call: "we don't need More right now", keeping the parts for when it's needed). The bar is Home ·
  Topics · Alphabet · Dictionary · Settings; `#tab-settings` opens the settings and is lit while
  they're open. `#tab-more` has `hidden` (mobile.css `.tab-more[hidden]`), and its list, styles and
  code are as below. To bring it back: take away `hidden`, and put Settings back in its list in
  place of `#tab-settings` (or leave both).
- **More** (2026-10-14, the user's call, so new pages fit; this replaced Words and Settings in
  the bar). The bar is Home, Topics, Cards, Reading and More, the first four always there. More
  (`#tab-more`, a circle with three dots) opens `#more-menu`, a list just above the bar of the pages
  without a tab: Words, then Settings.
  - **Adding a page:** another `.more-item` in index.html, with `data-view` (a page, as the tabs
    have) or `data-action` (Settings, which is the settings dialog). `MORE_VIEWS` comes from the
    markup, so More lights for a new page with no code change.
  - **Lit:** More is in the accent colour while its list is open (the page's tab dims then, as it
    does under Settings: `html.more-open`), or one of its pages is showing (`.current`, or
    `html.settings-open`). The list marks the page you're on (`aria-current`).
  - **Closing:** tapping the dim, More again, another tab or a row, or Escape. Arrow keys move
    between rows. It closes too if the window widens past the phone layout.
  - **Layering:** the list is outside the header, at z-index 105, so it opens over the Settings
    page (a modal, 100); it stops at the bar, as Settings does, so the bar stays in reach.
  - Words' tab is still in the markup, hidden in mobile.css: wider screens keep Words as a tab and
    ⚙ for Settings, and More is hidden there. Five tabs give 62px each at 320px and 76px at 390px,
    so the 320px font-size step went.
- **The tabs say Cards and Words** for the Flashcards and Dictionary pages (the user's call, the
  same day; the home cards too, and the Topics card's "practise it in Cards"; then everything the
  user sees, the same day: toasts, ⇄ tooltips, Add all to Cards, the confirm dialogs, the empty
  Cards page, the topic picker, Settings' Cards category and help, Clear Cards, the backup summary
  and the screen-reader labels, "Search words" among them). The code's names (`flashcards`,
  `dictionary`, `reviewWords`) and saved data are unchanged. Their text went up a little: 11px to
  12.5px on a phone (11.5px at 320px, where Settings, now the longest at 45px, has 52px), 16px to
  17px on wider screens. The top bar is emptied rather than hidden, since the tab bar is inside it,
  and the body pads its top by the status bar's safe area.
- **Settings is a page on a phone** (the user's request, the same day), a dialog on wider screens.
  It's still the settings modal, styled in mobile.css: it stops at the tab bar instead of covering
  it, Settings is lit there in place of the page's tab (`html.settings-open`), and there's no ✕
  and no Settings heading (the search is at the top). Its search box matches the Dictionary's
  in place, size and shape, so it doesn't shift going between the two (the user's report).
- **Each settings category has a line icon** in the label's colour (the user's request, the same
  day; phone and desktop): Display a T, Audio the speaker, Topics, Reading and Flashcards the
  pages' icons, App a phone, Reset an undo arrow.
- **Settings as a list** (Display and Reading first, then the rest the same day: the user found
  the opened categories messy, with a bordered box a setting, long help and mixed layouts).
  `.setting-list` wraps a category's groups in one rounded panel, a row a setting (each
  `.setting-group` holds one, so search hides a row at a time) with thin lines between, as in the
  iPhone's Settings:
  - A dropdown's row is the dropdown (`appearance: none`), the whole width, its value on the right
    with a ⌄, the setting's name laid over its left with `pointer-events: none`, so a tap anywhere
    on the row opens it.
  - An on/off is a switch (a checkbox, `appearance: none`, its knob a radial-gradient background
    that slides), the row its label. The checkbox's own repeat of the name went.
  - Help is one short line under the row, or none (Theme's options say it). Reading's "Read all"
    subhead went (Say the title and Loop are for Read too).
  - A number is a small box on the right of its row.
  - An action is a button under its row's help, side by side with the others (`.setting-action`,
    red if it deletes): Download all audio, Install app, Export and Load. They were rows at first,
    which didn't look like buttons (the user's call). The three Resets are red rows
    (`.setting-button`) with their help under them. The ids are unchanged.
  - Where a category has more than one list, a small heading sits over each
    (`.setting-list-head`: Topics' Read all; Flashcards' Recognition and Scheduling; App's About).
    Search hides a list with no matches, and its heading (`filterSettings`).
  - Spelling's explanation is behind a tap (`.setting-more`: "ⓘ How each spells เรียน"). Its
    choices are now Vowels whole, As written and School method, and Voice's Recorded and Browser,
    so the values fit on a 320px phone.
  - The recording counts (they were Voice's help) and Launch time are in App → About
    (`recordingsText`, `launchTimingText`).
  - Category headings are in normal capitals now, all of them.
  - The old box layout's CSS went (`.setting-subhead`, `.setting-group.danger`, `.danger-btn`,
    `.setting-actions`' flex row).
  Any tab leaves it (`closeSettings` in the tabs' click handler), for that tab's page, or the page
  under it if that's the one tapped.
- **Fixed inside the top bar:** the bar is `position: fixed` but still inside `.topbar`. On phones
  the top bar is opaque with no `backdrop-filter`, because a backdrop-filter would make the top bar
  the bar's containing block and pin it there.
- **Safe areas:** the viewport has `viewport-fit=cover`, so the bar can pad itself clear of the
  home indicator (`env(safe-area-inset-bottom)`). The body pads its sides by the side insets so an
  iPhone on its side keeps the page clear of the notch.
- **Room:** the body pads its bottom by the bar (`--tabbar-h`, 56px), and toasts and the update
  bar sit above it. Modals (the word dialog's sheet) cover it.
- **The icons are the pages' icons everywhere** (the user's request, the same day): the home
  cards' titles (were 📋 📖 📰 📕) and the topic button (was 📖, or 📚 for a category or
  Everything) use the same line icons, in the accent colour. The topic button shows Topics' list
  for a topic and a folder for a category or Everything. One stroke style, `.page-icon`; the paths
  are inline in index.html and in `PAGE_ICONS` (app.js) for the topic button.
- **Wider screens too** (the user's request, the same day): the top bar's Home is the Home icon
  (it was the word), in the accent colour, and each tab has its icon, small (18px), left of its
  name. Under 700px wide the tab icons go, or ⚙ was pushed off the screen at 601–670px.
- Checked at 390, 320 and 1280px wide in Chromium; not yet on an iPhone.

## The top row pinned on a phone (2026-10-14)

The user: on a phone the top menu should stay in place as the page scrolls, like the tab bar, on
Topics, the Alphabet and the Dictionary, as Settings' search already does. mobile.css only;
desktop measured identical before and after (1280px: every control's box the same).
- **Markup:** the topic button, the Alphabet's set menu and the page switches are in `.section-bar`,
  the page's other controls (Cards' direction and mode, List's Add all and Read all, Reading's Read
  all) in `.bar-rest`, both inside `.deck-picker-bar`. Elsewhere both are `display: contents`, so the
  bar is the one flex row it was. A sticky box stays only while its parent is on screen, so on a
  phone `.deck-picker-bar` is `display: contents` too and `.section-bar`'s parent is the stage.
- **Pinned:** `.section-bar` and the Dictionary's `.dict-top` are `position: sticky; top: 0`. They
  take the stage's 12px top padding and its gutters (negative margins), so the button and search
  sit at 12–64px as before (the search where Settings' is). `.bar-rest` scrolls away; its rows get
  12px below each (none when all are hidden). The second row is 12px under the first (was 8px).
- **Background:** clear at rest, so the page's top glow shows no edge; once the page scrolls,
  `html.scrolled` (a passive scroll listener in app.js) gives them `--bg` and a hairline, as the tab
  bar has at the foot. The glow is `background-attachment: fixed`, which iOS Safari ignores, so a
  gradient on the bar couldn't be matched.
- **Scrolling to things:** `html { scroll-padding }` keeps rows the browser scrolls to (Reading's
  read-along, `block: 'nearest'`) out from under the pinned row (88px) and the tab bar.
  scrollToReading counts `.section-bar`'s height with `.topbar`'s (each 0 where the other is used).
- **Settings' search as tall as the Dictionary's** (the user, the same day): the Dictionary's
  stretches to its Thai | English switch (52px); Settings' was 48px (50px at text size 2). Now
  `min-height: 52px` on a phone, so going between the two pages doesn't shift it.
  And no line under it (the user's call): `.modal-search`'s border is off for the Settings page on
  a phone, as the Dictionary's search has none; the dialog on wider screens keeps it. Then (the
  user's call) the line comes back once the list scrolls under it, as on the other pages: Settings
  scrolls in its own box (`.modal-body`), so markSettingsScrolled sets `#settings-modal.scrolled`
  from its scroll, and openSettings (which scrolls it to the top) clears it.
- **The word and letter dialog between the bars** (the user, the same day: it shouldn't cover the
  top and bottom menus). On a phone `#word-modal` runs from the pinned row's foot to the tab bar:
  showWordModal (its three openers) sets `--modal-top` from the visible `.section-bar` / `.dict-top`
  (76px; 0 with none), mobile.css its `top` and `bottom`; the backdrop dims only the page between.
  A tap on either bar closes it, then does what it does (a pointerdown listener, captured, so a
  tapped search box keeps the focus hideWordPop would give back). `html.modal-open body` is
  `overflow: clip` on a phone, not `hidden`: `hidden` made body a scroll box, the pinned row stuck
  to it, and on a scrolled page it was gone from above the dialog. html's `hidden` still locks the
  page. The deck picker and Settings still cover the page as before.
  Then a page, not a sheet (the user's calls: not a fan of the yellow curved edge, then no grey
  line either, the page's background): it fills the room between the bars in `--bg`, with no
  border, as Settings does. Desktop's dialog keeps its accent border.
- Checked at 390px on List, Cards, Reading, Letters, Write, the Dictionary's grid and a letter's
  list, at rest and scrolled, at text sizes 1 and 2 (the row is 76px at both); the Alphabet's set
  menu opens under it while scrolled; Cards and Write still fit without scrolling.

## Dictionary (2026-10-12, experiment, branch `2026-10-12-dictionary`)

The user wanted a dictionary as a top-level feature: a Dictionary tab (fitting the tabs on a phone
is for later).
- **Home** has a Dictionary card too. With four cards they make a 2 × 2 grid: Reading no longer
  spans both columns, and `.home-card-wide` went. Phones still show one column.
- **The way in:** a search box over a grid of the 44 letters, ก to ฮ, square tiles with just the
  letter (its name word and word count went the same day, the user's call; they're in the tooltip),
  44px (34px at first; the user asked for larger), no larger at Larger text so ฐ's tail stays in.
  Letters with no words (ฃ ฅ ฏ ฑ ษ ฬ) are greyed out.
- **A letter** lists its words. **The search** (the topic picker's `wordSearch`, now with a limit and
  a filter) lists up to 200 matches: Thai, English or rough transliteration. ‹ All letters and
  ✕ Clear search go back.
- **The table is the Topics page's**, rows and all. Its row builder became `wordRow(c, cols, added)`
  and its columns `wordlistColumns()`; both pages use them. So the rows have the word dialog from
  the Thai, transliteration and English, the note, and the add / spell / play buttons.
- **The words:** every word card in the topics, one row per card key, leaving out Thai Script's
  spelling examples and the stories' copies. Phrases are left out too (the user's call, the same
  day; `isPhrase`): cards listing their `words`, or written with a space (a doubled word like
  จริง ๆ stays). Compounds such as ข้าวเหนียว have no `words`, so they stay. That's about 7,100. They're in Thai dictionary order
  (`Intl.Collator('th')`, which files เ แ โ ใ ไ words under their consonant: เกิด under ก). ฤ and ฦ
  words file under ร and ล.

## Reading list as an accordion (2026-10-12, experiment, branch `2026-10-12-reading-accordion`)

The user wanted to see stories open in place on the Reading page, not on a page of their own with a
Back to Stories button.
- **The list:** each story is a row (`.reading-entry`) with its title button, which has
  `aria-expanded` and a › that turns when it's open.
- **Opening one:** `openReading` → `placeReader` moves the single `#reader` (the toggles and lines)
  under that title, joined to it with the accent border, and closes the story open before.
  - Tapped in the list, the page doesn't move: the title stays where it was on screen, even when a
    story open above it closes (the user's call, the same day; at first it scrolled the title to
    the top).
  - From a search result, the title is brought to the top under the sticky bar (`scrollToReading`).
    Read / Read all only scroll as much as keeps the title, then each line, on screen (`nearest`).
    At first they brought each story's title to the top, which the user didn't want.
- **Closing:** the open title again (`closeReading`), or the Reading tab, closes it.
- **From a search result:** a story that isn't one of the topic's is put first in the list, open,
  with the word lit as before.
- **Removed:** the separate passage page (`#reading-passage`, its heading and description) and
  `#reading-back`.
- **Read** (the user's request, same day) reads just the open story, the same way. It sits in the
  open story's title row, left of the › (`placeReader` moves it there; the row is a `.reading-head`
  around the title button, since a button can't hold another). It was beside Read all at first,
  greyed out with no story open. Both are `readStories(button)`; the other button stops a
  run and starts its own.
- **Read all** (`readStories`, the user's request, same day): a button where Topics has its
  Read all, in the same style (`.read-aloud`); on a phone it sits right-aligned under the topic
  button.
  - It opens each story in the list in turn, from the open one (or the first). It says the story's
    English title (its row lit; the titles are recorded with the English voice, gen_audio, keyed
    under `en`; Settings → Reading → Say the title, `readStoryTitles`, on by default, turns it off),
    then its lines one by one: the sentence recordings, 0.6 s apart, with 1.5 s
    between stories.
  - The line being read is lit (`.reader-line.now-playing`) and kept in view.
  - **Loop** (Settings → Reading, `readStoriesLoop`, on by default; the user's request, same day):
    when a run finishes it starts again. Read plays the same story, and Read all goes back to the
    first story.
  - **Pausing it** (the user's requests, same day): pressing the running button (❚❚ Pause), or
    opening a word's dialog, pauses the run (`pauseReadStories`). The button shows ▶ Paused (dashed
    accent border), the line or title stays lit, and pressing it carries on from that line
    (`readStories(btn, from)`, with the place kept in `storyReading.at`). The other button ends the
    pause and starts its own. (The running button showed ■ Stop and stopped, at first.)
  - **Stopping it:** leaving the page; changing topic; opening or closing a story by hand
    (the Reading tab too); or pressing a line's speaker. Each of these ends a pause too. The speaker matters on a
    phone, where the button scrolls out of view.
- **The toggles** (Transliteration, English, Word gaps) stay at the top of the open story. Moving
  them into the controls bar, between the topic button and Read, was tried the same day and taken
  back: it looked poor, and on a phone it took a third row of controls.
- **The word being said lights up** (the user's request, same day) as a sentence plays, from its
  own speaker, Read or Read all (`lightSpokenWord`, called from `tickPlayback` each frame).
  - **Timings:** they're the voice's own word boundaries. `tools/word_timings.py` asks edge-tts for
    each sentence again with `boundary='WordBoundary'` and writes `data/audio/timings.json`
    (`{sentence: [c, start ms, end ms, …]}`; c is the word's place in the sentence as said).
    - The new clip matches the stored one in length but not byte for byte (the same speech,
      encoded a little differently). So the stored clip is kept unless its length differs; then
      the new one replaces it, and the timings fit it exactly.
    - Re-runs do only the sentences without timings, so run it after adding stories.
  - **Lighting:** the voice's words are finer than the passage's (ผู้ก่อการร้าย comes as
    ผู้ ก่อ การ ร้าย). Each one lights the passage word it falls in (`renderReader` puts each word's
    place in the sentence on its span as `data-c0`/`c1`), from its start until the next word's.
    The light is `.rw.speaking`.
  - **Loading:** `loadWordTimings` fetches the file with the Reading page; it's in the service
    worker's shell. A sentence without timings plays unlit.
- **Rows, the same day:** the ✓ and the level went from the rows (the user's call), so a row is
  the title, the description and the ›. Nothing records opened stories any more (`readingDone`).

## Story tools (2026-10-11), `tools/stories.py`

**Why:** until 2026-10-11 the stories were built by `build_reading.py` and its source modules
(`stories_*.py`, `review_fixes.py`, `phrase_splits.json`, `split_senses.py`) in a session scratchpad,
which was lost. The scratchpad tools named in the sections below are gone. `decks.json` already held
every story in full, so the replacement works on it alone, and lives in the repo.

**Data:**
- A story is a topic with a `passage` (category Reading; group Little Stories, Easy, Medium or
  Harder). A line's `th` splits its words with `|`; spaces separate runs; `word:` is a speaker
  label; `_` is a space inside a word.
- Every Thai word is a card in the story's `cards`, a copy of a topic card without `partners`.
  Digits and symbols need none. One card per word in a story, since the reader looks them up by
  their Thai.
- A phrase card (with `words`) is split into its words in the passage, and the story keeps the
  phrase card and each word's card.
- A word's sense in a story is just the card the story holds.

**Commands** (`python3 -u tools/stories.py …`):
- **`check`**: every Thai word has a card, every card is in the passage (a phrase through its
  words), every card matches its topic card, and sizes and groups are right.
- **`sync`**: story copies are refreshed from topic cards after topic edits. A card whose
  English changed is matched by its Thai when that's unambiguous.
- **`add FILE`**: adds or replaces stories from a JSON list (`id`, `group`, `name`,
  `description`, `lines: [[th, en]…]`, `picks: {thai: english}`).
  - A word with several cards takes its pick, else the one it already has in this story, else the
    sense other stories use most. It says which, so you can pin another. Thai Script spelling
    examples are used only when there's nothing else.
  - A word with no card is an error: add it to a topic first.
  - New stories go at the end of their group.
- **`export ID…`**: stories as `add` source, phrases joined up again and every word pinned. To
  edit a story, export it, change the lines, and add it back. All 1,307 stories round-trip
  through export and add unchanged.
- **`coverage [--list N]`**: the share of topic cards (outside Thai Script) in a story (99.68%),
  and topics with fewer than 5 stories by the app's rule (`storiesFor`; 0).
- **`show ID`**: a story's lines and its cards.

`tools/decks_io.py` writes decks.json in the hand-written layout, byte for byte, so small changes
leave small diffs. Run the audit, then `node tools/spelling.mjs --write` and
`python3 -u tools/gen_audio.py` after adding stories (each line gets a recording).

## Tone Chants (2026-10-11), `script-tone-chants`

The user asked whether there's a canonical way to memorise the tone table. There is: Thai schools'
ผันวรรณยุกต์, which runs one syllable through every tone mark, class by class, as a chant. The new
topic Tone Chants (Thai Script → Tones & Reading, after Tone Rules) has 15 cards, each a whole chant or line
with its recording. The tone check in the audit and the Tones panel both read them syllable by
syllable.
- **Live chants:** กา ก่า ก้า ก๊า ก๋า; ปา ป่า ป้า ป๊า ป๋า (five real words); ขา ข่า ข้า; คา ค่า ค้า.
- **What schools teach with the chants** (the user asked how children learn live, dead, short and
  long; added the same day):
  - the line อักษรกลางผันได้ห้าเสียง อักษรสูงและอักษรต่ำผันได้สามเสียง;
  - พื้นเสียง, the base tone, with one line per class: อักษรกลาง คำเป็นเสียงสามัญ คำตายเสียงเอก, and so on;
  - the recited definitions of คำเป็น and คำตาย, by vowel length and the final-consonant families
    (แม่ ก กา; แม่กง กม เกย เกอว กน; แม่กก กด กบ).
  - `spell.js` learned เ-อ before a final ว (เกอว, as in แม่เกอว) so these read syllable by syllable.
    Three more cards now have a school spelling, and none lost one.
- **Dead, with marks:** จะ จ้ะ จ๊ะ.
- **Down the columns** (the user's request, same day): one sound with a mid, a high and a low
  letter. กา ขา คา is live, กัด ขัด คัด dead and short, ตาก ถาก ทาก dead and long; all are real
  words. They replaced the dead examples ขับ ผัก สุด and นก นาก.
- **Topic `about`:** the four rules learners add on top of the chants (mid class is the
  reference; high class rises unmarked; low class is one step higher; dead and unmarked is low,
  except low class), and that ข and ค fill each other's gaps.

Tone Rules' description points to the new topic.

## Film & TV Talk (2026-10-11), Spoken Thai

**Why:** the user met กังวลใจ in a film and found it missing ("it doesn't seem like complicated
vocab"). Core Words had ranked missing words by frequency across subtitle, written and textbook
Thai at once, which ranked words common mainly in speech low. Ranked by the film-subtitle list
alone (`research/freq/subs_words.tsv`, OpenSubtitles), the 600 commonest missing words were mostly
foreign-name fragments, plus about 120 everyday words.

**Added:**
- กังวลใจ, in ใจ Words: Feelings.
- 119 cards in five new topics, group Film & TV Talk (category Spoken Thai):
  - **Everyday Lines:** สุดยอด, อรุณสวัสดิ์, ยินดีต้อนรับ, เอาเลย, ไม่เชิง, เข้าท่า, ชะมัด, เถอะน่า…
  - **Feelings & Trust:** เชื่อใจ, เปลี่ยนใจ, ให้อภัย, ความหวัง, โดดเดี่ยว, เหลือเชื่อ…
  - **Crime & Danger:** แก้แค้น, หักหลัง, ข่าวลือ, สายลับ, เบาะแส, รอดชีวิต…
  - **Magic, Heroes & Legends:** แม่มด, คาถา, อัศวิน, นางฟ้า, โชคชะตา, หุ่นยนต์…
  - **People, Work & Life:** คู่หู, ขับรถ, งานแต่ง, ผู้เชี่ยวชาญ, หม่อมฉัน, เพคะ…
- Six more in Core topics: แม้กระทั่ง, ตราบใด, เยอะแยะ, อย่างเช่น, ย้อนกลับ, มุ่งหน้า.

**Stories:** 17 new ones, written with `tools/stories.py add`, so every new card is in a story. They
include a spy thriller, a hostage siege, a fairy tale, a movie night, a first day at work, a
reunion, a palace drama, a driving lesson and a vampire in the village. The two topics that fell
short of 5 stories got one more each that uses both. Coverage stayed at 99.68%, and every topic
has at least 5 stories.

**Left out:**
- foreign names and their fragments (ซา, จอห์น…);
- misspellings (มั๊ย, เป้น, งัย);
- words already carded in a longer phrase, which deserve their own cards later: ยินดีต้อนรับ,
  ขอตัว and ลองดู were added, but more remain;
- place names.

The next 300 or so missing subtitle words, down to rank about 6,000, are still to check.

## Missing cards and card fixes (2026-10-11)

The user asked for the cards the Core Words agents had found missing, and the card issues the
2026-10-09 story review had left open (the user's memory note).

**Added** (each used in a story, eight new ones written with `stories.py add`):
- เวทมนตร์ "magic, sorcery", ความเชื่อ "belief; superstition", มิตรภาพ, ลุกลาม;
- แต่ "nothing but, only", คำ as the classifier for mouthfuls, ตน for giants, ghosts and holy beings;
- ท่อ "pipe", ปั๊มน้ำ, สูบ "to pump", รก "placenta", ของโปรด, พวงกุญแจ, ขน "to carry, haul";
- ตอบโต้, สวน "to counter (a punch)", คู่ต่อสู้, พลเรือเอก (phon-lá-rʉa-èek), พริกน้ำส้ม, นะคะ;
- ล้ม "to fall over" in Everyday Actions: Moving About. Before, it was only a Tone Pairs card, in
  Thai Script.

The new stories are The Burst Pipe, Ten Years Later, The Giant's Spell, Grandma's Noodles, The
Keyring Stall, The Placenta Tree, Fire at the Navy Building and The Counter-Punch.

**Fixed:**
- **Glosses:**
  - เมื่อ is now "when, at the time (past or future)" and "when (past or future)".
  - จ๊ะ is now "soft, sweet particle (women; anyone to a child)".
  - จ่าย has a note for งดจ่ายน้ำ.
- **ฉัน phrase cards** now note what a man says (ผมต้องการติดต่อสถานทูต…). The Tourist Robbed's
  tourist, who said them with ครับ, is now a woman.
- **ตรงไหนเจ็บ** became เจ็บตรงไหน, the usual order, in its two stories as well.
- **Story lines:**
  - Bargaining at the Market: shirts are หลายตัว, not หลายอัน.
  - The New Neighbour: no longer asks a stranger สบายดีไหม.
  - I'm Not Angry: the line is now hers, so the woman says ไม่ใช่ของฉัน.
- **Already fixed by earlier work:** ใจง่าย's and ร่าน's notes, เจาะยาง's literal sense, ขวา
  "right", ประจำ, สำรอง.

## Reading practice (2026-10-08)

**Status:** kept and committed ("we'll keep reading although we will need to reshape and clean
it up"). The page's layout and shape are still to be reworked. It began as an uncommitted
experiment, since the user wanted to see it before deciding ("I am not sure of this").
- **First version:** passages were topics shown on the Topics page.
- **The user's verdict:** they liked the features but not the place ("too different from the other
  wordlists").
- **Now:** a **Reading page** of its own, reached from a third Home card (option A).
- **Then a tab too,** at the user's request: Topics | Flashcards | Reading. To make room, the top
  bar's title, which is the Home button, now says **Home** instead of "Learn Thai" (the user's
  suggestion; the page title is still Learn Thai). Tapping Reading's tab with a passage open goes
  back to the list.

In decks.json the passages are still topics, in a **Reading** category after Grammar, with groups
Little Stories, Easy, Medium and Harder, so their words work in Flashcards and search like any
card.

**Little Stories** (8, added after the user asked for "cat sat on the mat style" stories) are made
up for a first read. Each is 6 short lines that repeat and build, using words the app already has
plus 6 new ones (แดง, เหลือง, ออกไข่, ตะกร้า, ว่าย, หอม "smells good"):
- The Cat on the Mat
- The Tiger in a Shirt (เสือ / เสื้อ / เสื่อ)
- The Dog and the Horse (หมา / ม้า / มา)
- The Hen and the Egg
- Grandma Goes to Market
- It's Raining
- The Little Fish
- Dad's Fried Rice

**15 more Little Stories** came the same day, at the same level but with new vocabulary (the user:
"don't worry about how the page looks for now"). That's 23 in all.
- **The stories:**
  - My Family
  - The Big Elephant
  - Off to School (the morning routine)
  - I'm Not Well
  - At the Beach
  - Songkran
  - Where's the Cat? (under, on, in)
  - Which Shirt? (colours, and ตัว for clothes)
  - Five Little Ducks (counting)
  - The Bus
  - A Birthday
  - The Mango Tree
  - At the Temple
  - Grandma on the Phone
  - Night Time
- **16 new words:** กล่อง, ก๊าบ, ไข้, ครัว, ชุดนักเรียน, ดีกว่า, ปืนฉีดน้ำ, ฟ้า, ราตรีสวัสดิ์,
  วาดรูป, สว่าง, สุก, สุขสันต์, พร "blessing", มืด "dark", ดัง "to ring (a phone)".
- **Watch for spelling-example cards.** พร and มืด only had Thai Script example glosses ("a lone
  r after a consonant reads ɔɔn"), which the builder had picked as the only card. Check
  `build_reading.py`'s choices for that when adding passages.
- ตัว uses the classifier gloss where it counts things (shirts, ducks, a hen), and "body" for
  ตัวเล็ก / ตัวใหญ่.

**Sources for more**, noted for later at the user's request:
- **[StoryWeaver](https://storyweaver.org.in/en/stories?language=Thai)** (Pratham Books): about 255 Thai children's stories, all CC BY 4.0, levels 1–4.
- **[Bloom Library](https://bloomlibrary.org/language:th)** (SIL): about 347 Thai books, mostly Creative Commons, licence per book.

The catches:
- each story needs an attribution line (author, illustrator, translator, licence, link);
- they're picture books, so the text can lean on the pictures;
- translation quality varies;
- each needs word breaks marked, and cards for new words.

The plan was to try a few StoryWeaver Level 1 stories once the format proved itself.

The other ten passages:
- Easy: Signs Around Town, A Café Menu, A Text from a Friend.
- Medium: At the Market, Asking the Way, Today's Weather.
- Harder: My Morning, A Trip to Chiang Mai, Notice: Water Cut, Homework Piles Up (which ends on
  the idiom ดินพอกหางหมู).

- **Data:** a topic's `passage` is lines of `{ th, en }`. In `th`, `|` marks a word break and a
  space is a real space; a trailing `:` makes a speaker's label (ลูกค้า:). The topic's cards are
  its words in reading order: 220 in all. 192 of them reused existing cards, with the meaning picked for the
  passage (เย็น is "cool / cold" on the café menu but "evening" in the text message), and 28 are
  new (ละ "per / each" for กิโลละ, สะดวก, ประกาศ, …).
  - Built by scratchpad `decks/reading_topics.py` + `decks/build_reading.py` (backup
    `decks.backup31.json`).
  - `tools/audit_decks.py` checks passages: the line shape, word-break glitches, and that every
    Thai word is a card in its topic.
- **Audio:** `gen_audio.py` records each sentence whole. It's keyed by `sentence_text()`: the word
  breaks joined and the speaker's label dropped. In app.js that's `sentenceText()`; keep the two
  in step.
- **The Reading page** (view `'reading'`, `#reading-section`, `renderReading`):
  - **The list is per topic** (2026-10-08, the user's design). The page has the topic button, as
    on Topics and Flashcards, sharing the same choice (`state.currentDeckId`). It lists the
    stories that use that topic's words (`storiesFor`; a group or category pools its topics'
    words).
    - **Matching** is automatic: a story qualifies if it uses at least `READING_MIN_MATCH` (2) of
      the words. Very common words (`READING_COMMON`: particles, pronouns, ไป มา มี เป็น ของ ไม่ …)
      don't count, or "Spoken 1–20" would match every story.
    - **Order:** most matched words first, then alphabetical by title (since 2026-10-08, the user's
      call; it was the easier level).
    - **Each story** shows its title and description. On the right there were a ✓ once opened
      (prefs `readingDone`) and its level; both went on 2026-10-12 (the user's call). The matched words were shown as chips at first; the user had them removed.
      The list's "Reading" heading and intro line went too.
    - **There's never a list of every story**, as there will be too many (the user's call). A
      topic with none says "No stories for … yet" and offers "Try all of <category>".
    - **On 2026-10-08:** Food & Eating found 6, Numbers 0–20 found 2, and Farm Animals found 1.
      Greetings & Politeness found none: its stories share just one greeting each once ครับ/ค่ะ
      don't count. That's the case manual picks could fix if needed.
  - **Changing topic** on the Reading page returns to the list (`selectDeck`).
  - **A passage** has "Back to Stories" (a line ← icon, drawn like the other button icons; it was
    "‹ Stories"), its title and description, and the reader.
    - **Back to Stories sits in the controls bar** (`.reading-only`, hidden unless a story is
      open). On desktop it's at the right end, where Topics has Read all: same top and height
      (31px), and the same right edge once you allow for Topics' scrollbar. On the phone the bar
      wraps, so it's on its own row under the topic button. It had a "Words in
    this passage (N)" list (add each to Flashcards, play) and Add all to Flashcards; the user had
    both removed, since the Topics page does that.
  - It remembers the open passage while the app's open (`state.readingId`). The app still starts
    on Home.
  - **Where passages don't appear:**
    - the topic picker (`pickerModel` skips them), so they're not on the Topics page;
    - the start-up topic (`isPassage`).
  - **A search hit** for a word found only in a passage says "Reading: <passage>" and opens it,
    lighting the word (`openReading(id, word)`, `.rw.found`).
  - **Keys:** Flashcards' and Topics' shortcuts (Space, P, arrows) do nothing on the page.
- **The reader** (`renderReader`, `#reader`, on the passage page):
  - a line per sentence, with a play button (a `.row-speak`, so it lights while playing and stops
    when pressed again);
  - each word is a tap target (`.rw`). It plays the word, lights it, and shows a pop-up
    (`#reader-pop`) with its transliteration and meaning, centred under it and kept inside the
    box. A tap elsewhere, a resize, or a toggle closes it.
    - **On the Topics page too** (2026-10-09, the user's request): tapping a row's Thai (`td.col-thai`,
      focusable, Enter/Space too) opens the same pop-up under it.
      - **One shared pop-up:** `#reader-pop` moves into its host, `#reader` or `#wordlist-section`
        (now `position: relative`). It's placed and clamped there (`showWordPop`, `placeWordPop`,
        `hideWordPop`, formerly `showReaderWord` and friends).
      - **Table redraws:** adding the word to Flashcards from the pop-up redraws the table
        (`setInReview` → `renderWordlist`). `reanchorWordPop` then moves the pop-up to the word's
        new row, or closes it if the row has gone.
      - **Tested** at phone and desktop sizes: it opens under the row, tapping parts names them,
        adding works and it stays open, tapping another row's Thai switches it, tapping outside
        closes it, and the reader's pop-up still works.
    - **Buttons** (2026-10-09, the user's request): under the big word, centred, the Topics rows' three
      buttons (`.pop-actions`): add to or remove from Flashcards (✓ once added), spell aloud, play.
      The spell button used to sit beside the meaning.
      - **Bug fixed on the way:** the add button redraws itself (its icon becomes ✓). By the time
        the click reached the document's "tap elsewhere closes the pop-up" listener, its target
        had left the page, so `closest('.reader-pop')` found nothing and the pop-up closed. The
        listener now checks the click's `composedPath()`.
    - **Spelling** (2026-10-09, the user's request): the pop-up has the cards' กข spell-aloud
      button (`.pop-spell`, `speakSpelling`). It reads the word's spelling in the chosen style.
      Pressing it again stops it. Words with no spelling, such as a lone letter, get no button.
      - **No written spelling:** at first the button also wrote the spelling out under the
        meaning. The user found hearing it enough, so that went the same day.
      - **Highlighting instead:** each part of the big word lights up as it's read
        (`lightParts`, `.pop-reading`, lit from behind the text).
        - **Letter names:** the letter, the tone mark or the vowel being named.
        - **School method:** the syllable being built, just the tone mark for its step, then
          the whole word.
        - **How:** each spelling step carries `at`, the indexes of its characters (spell.js),
          and `speakSpelling` calls `onStep` as it reads each one.
        - **Tested** on ข้าว in both styles: ข, ้, า, ว; then the syllable, ้, the word. The
          highlight clears at the end.
        - **Tapping a card's large Thai** (2026-10-09, the user's request) names the tapped part and
          lights it, as in the pop-up (`tapCardThai`), instead of turning the card.
          - **Where:** the Thai → English front and the English → Thai back, on Flashcards and
            Recall (`cardLargeThai`, `recallLargeThai`).
          - **Turning still works:** a tap counts only on or within 8 px of a part
            (`CARD_TAP_REACH`). Anywhere else on the card turns it as before, or on Recall reveals
            the answer.
          - **Tested** on ดินพอกหางหมู: all 12 parts on each of the three sides were named and lit,
            with one sound each, and the card didn't turn. A tap below the word still turned it.
        - **On Flashcards and Recall too** (2026-10-09, the user's request): the card's กข button
          lights each part of the card's Thai as it's read (`lightOnCard`). The highlight goes on the
          card face, behind the text, which is `z-index: 1`.
          - **Where the Thai is** (`cardThaiShown`, `recallThaiShown`): Thai → English, the front word
            and the back's repeat; English → Thai and Listen, the back only. A side with no Thai
            text gets no highlight.
          - **Wrapped phrases:** `partBoxes` works on any element whose only child is the word's text
            node. It finds the baseline from a temporary empty inline-block at the end, applied per
            line (every line box is the same height), so phrases that wrap on a card work.
          - **Turning the card stops it** (2026-10-09, the user's request). Before, only a turn that
            spoke the word stopped it. `setFlipped` and `setReviewFlipped` now call `stopAudio` when a
            spelling is running and the side changes (`stopSpellingOnTurn`). Tested with ⟳ and with a
            tap on Flashcards, and with reveal and turn on Recall: the button is released, the
            highlight goes, and nothing more plays.
          - **Tested** on ดินพอกหางหมู in five cases: Browse Thai → English front and back, Browse
            English → Thai back, Recall Thai → English front, and Recall English → Thai after reveal.
            Each lit 12 parts in turn, all inside the text, then cleared.
    - **The word, large** (2026-10-09, the user's request): under the meaning, the pop-up shows the
      word big (`.pop-word`, 56 px; smaller if it would overflow, `fitPopWord`). Tapping any part of
      it says that part's name, the same clip as the spelling uses, e.g. ค gives คอ ควาย and ่
      gives ไม้เอก (`letterStep`, spell.js), and the part lights up briefly (`flashPart`). The name
      was also written underneath in yellow at first (`.pop-part`); the user found hearing it and
      the highlight enough, so that went the same day. Taps and the spelling highlight share one layout
      of the word's parts (`partBoxes`).
      - **Why one piece of text:** a vowel or tone mark in an element of its own isn't drawn on
        its letter in every browser (Safari), so the word is a single text node. `partAt` finds
        the part from its geometry.
      - **How `partAt` works:**
        - The letter cluster under the tap: a base character with the marks above and below it,
          plus ำ. It comes from a Range.
        - The baseline: an empty inline-block at the word's end (`.pop-baseline`) sits on it.
        - The letter's own top: canvas `measureText` in the same font.
        - Below the baseline is a vowel below (ุ ู). Above the letter's top is a mark above;
          with two (ที่), the higher one is the tone mark, split at the top of the lower one.
          Anything else is the letter itself. The right part of a cluster with ำ is ำ.
      - **Width:** the pop-up's width is held once it's laid out. A changing caption line made it
        narrower and re-centred the word, so the next tap missed. The headless test caught this.
      - **Tested:** headless Chromium at 390 px, tapping every part of ที่, ปู่, น้ำ, เป็น and
        ข้าว. All 17 parts were named right, each with one play. It's untested on a real iPhone.
  - **Show:** Transliteration and English toggles add those lines under each sentence.
  - **Word gaps** (2026-10-08, the user's request) puts a space between the Thai words, as
    written ones have none.
    - It is a separate chip at the row's right end (`.reader-spaces`), not one of the "Show"
      options, because it changes the Thai line rather than adding one.
    - The label was "Spaces between words" until 2026-10-09. At the Larger text size on an
      iPhone it wrapped onto a line of its own. A Thai label, ภาษา ไทย, was tried and found
      confusing. "Word gaps" is the label now; the tooltip and accessible name still say
      "Spaces between words".
    - On phones the "Show" label is hidden (mobile.css), so all three chips fit one row at
      Larger and Largest text on a 390 px screen. Only a 320 px screen at Largest wraps.
  - All three start off (the point is to read the script as written) and are remembered (prefs
    `readerTranslit`, `readerEnglish`, `readerSpaces`).
    - **How the spaces work:** `renderReader` puts a hidden `.rw-gap` space between the
      `|`-joined words of a run, and `.reader.show-spaces` shows them. A real space in the text is
      always there, and a word's own space (`_`, as in จริง ๆ) stays inside the word. An idiom
      card stays one block.
- **The words** are cards like any others, studied in Flashcards (on Everything) in any
  direction. The passage page no longer adds them (the user's call): that's done from Topics.
- **Tested:** all ten passages render at 320 px with no overflow, every sentence has its
  recording, and the tap, pop-up, toggles, play and press-to-stop all work, with no errors.

## Stories for every topic (2026-10-08)

(The scratchpad tools this section names are gone; see Story tools for their replacement.)

The user asked for two or three stories for every topic ("don't hold back with the slang topics… we
want real use"; letter topics creatively, e.g. the letter names). Written by me in batches of about
10% of the topics, stopping after each batch so the user can check resource use.

- **Source files** (scratchpad `decks/`):
  - `stories_more.py` gathers the batch modules (`stories_basics.py`, `stories_conv.py`,
    `stories_script.py`, `stories_b2_*.py`, `stories_b3_*.py`, `stories_b4_*.py`).
  - Each story is `(id, level, name, description, lines, extra)`. Ids are `rs-…`; level is Easy or
    Medium.
  - Each batch has a `NEW` dict of words the app lacks. New words are shared across batches, but
    a story's `pick` beats a shared new word: ละ is "per" at the market and the particle at the
    temple fair. A new sense of an existing word (หก "to spill") goes in that story's own `new`,
    or it would take over every story (หก "six").
- **`extra` keys:**
  - `for`: the topics the story is written for. The builder errors if the story uses fewer than 2
    of a target topic's words, counted as the app counts them, so the common words don't count.
  - `pick`: a word's meaning.
  - `new`: new words for this story only.
  - `topic_first`: keep the target topic's own cards, as the vowel stories want อะ / อา / อี as
    vowels.
- **`build_reading.py` chooses meanings automatically** when a word has several:
  1. **The target topic's card.** Exception: if the topic is in Thai Script and the word has a
     real meaning elsewhere, the spelling-example card is skipped. ลิง gets "monkey", not
     "final sound -ng".
  2. **Otherwise, the meaning used in the most topics,** leaving out spelling examples, dialect
     and slang unless the story is written for those.
  3. **`--picks` lists every automatic choice** for review. Wrong ones so far: กะ "with" for a
     work shift, คัน "itchy" for a car, ชั้น "I" for a floor, ล้ม "kill" for a falling tree,
     บาง "thin" for "some", พอ "enough" for "as soon as". Each was fixed with a `pick`.
  4. **When the app has only a slang or wrong sense, add a shared new card.** แกง had only the slang
     "to set someone up", เส้น only "connections", and ดวง only "fate". "Curry", "noodle" and the
     classifier for lights and the moon were added as shared new words. That also fixed earlier
     stories that had been getting the wrong sense (Grandma's Southern Kitchen; Loy Krathong).
     A word with a different sense in just one story gets that story's own `new` (แฟนมวย "boxing
     fan", not boyfriend).
     - Later fixes of the same kind: ยก had only the boxing "round", so "lift, carry" became a
       shared card, and Fight Night keeps "round" with a pick. พัน "to wrap" (not "thousand") is
       in one story's `new`.
     - **A shared new word beats the target topic's own card.** A story that needs the topic's
       sense back needs a `pick`.
  5. **Check story names and ids are unique** across every batch module before writing. Batch 4
     reused The Interview (and its id) and The Rainbow; the audit catches it too.
  - It also sorts the Reading topics by level, since the audit wants each group contiguous.
- **`coverage.py <category…>`** lists each topic's story count (as `storiesFor` counts) and the
  topics still short of 2.
- **Passage format addition:** `_` is a space inside a word (จริง_ๆ, แม่_ก_กา,
  งูใหญ่นอนอยู่_ณ_ริมวัด_โมฬีโลก). Cards with spaces can then be words in a passage. Handled
  by app.js (`renderReader`, `sentenceText`), gen_audio's `sentence_text` and the audit.
- **Letter topics:** stories use the letter names as words (ก ไก่ จ จาน…), so the letter cards
  match, plus the class rhymes. Vowel topics use the recited vowels (อะ อา อิ อี…). Tone Marks
  uses ๆ, ฯ and ฯลฯ in real text.
- **Progress:**
  - **Batch 1:** Basics, Conversation, Talking About Language, and 12 Thai Script topics. 42
    topics, 68 stories.
  - **Batch 2:** the rest of Thai Script, Grammar and Spoken Thai. 43 topics, 62 stories.
  - **Every topic in those six categories has at least 2 stories.**
  - **Batch 3:** 241 stories (now 404 in all) for 141 topics:
    - Slang & Swearing: real use, such as before a fight, road rage, the drunk at the bar.
    - Southern, Isan and Northern Thai: dialect words in simple frames. Their stories set `for`,
      since dialect cards are left out of the automatic meaning choice.
    - People & Relationships, Culture & Values, Food & Drink, Home, Shopping & Errands and Getting
      Around.
    - The two orphan stories now match a topic. The Mango Tree gets banana and coconut, so it
      matches Fruit. A Text from a Friend uses the Plans & Invitations phrases (ว่างไหม,
      ไปกินข้าวกันไหม, เจอกันที่ไหน…).
  - **Batch 4:** 310 stories (now 714 in all) for the last 157 topics:
    - Work & Education, Health & Medicine, Nature & Animals, Sport & Leisure, Music and News &
      Politics.
    - Crime & Law: real use, such as The Dealer, The Godfather, Gang War, The Hit, The Street
      Gang and Nabbed (the crime slang).
    - Mathematics and Science: classroom-style stories, one target topic each. That way the topic's
      own sense wins for words like จุด, ส่วน, นิ้ว, หัว, ราก, งาน and แก๊ส.
  - **Every one of the 438 topics now has at least 2 stories** (`coverage.py`: 0 short).
  - **Batch 5: to 5 stories a topic** (the user's call, 2026-10-08). The new stories should use
    words no story had yet.
    - **Each story serves 2–5 related topics**, with at least 2 words from each, so 902 topic slots
      take about 300 stories, not 900. Examples: Hospital + Costs + Medicine labels; letters from
      all four consonant classes in one story; all four idiom topics in one.
    - **Tools** (scratchpad `decks/`):
      - `plan5.py [--decks PATH] <category…>`: each topic under 5, with its words no story uses
        (NEW) and, if those run short, the used ones.
      - `build_reading.py --out trial.json`: a trial build, so coverage can be checked without
        touching decks.json (which a running browser test reads).
      - `dupcheck.py <module…>`: new story names and ids that clash with decks.json. Batch 5
        reused eight names (The Night Shift, Gossip, The Speech…) before this was added.
    - **Half 1** (2026-10-08): 159 stories (873 in all), for every category from Basics to
      Getting Around; every topic there has at least 5.
    - **Half 2** (2026-10-08): 132 stories (1,005 in all), for Work & Education, Health, Nature &
      Animals, Sport & Leisure, Music, News & Politics, Crime & Law, Mathematics and Science
      (418 slots). `plan5.py` now reports 0 slots short: **every topic has at least 5 stories.**
      - The automatic meanings needed picks again: ต่อย 'to punch' (not 'to sting'),
        หนัง 'film', รอบ 'round', ลูก as the classifier for dice, and ฝรั่ง 'Westerner'.
      - Audio: 24,597 samples (+713).
  - **Thai naturalness review** (2026-10-09). The user asked for every story to read as a Thai
    person would write or say it, so the learner doesn't pick up bad habits. All 1,005 stories
    were written by the AI, none by native speakers.
    - **How:** 8 parallel review agents each took about 125 stories, working from a brief and a
      validator (scratchpad `review/`: `BRIEF.md`, `validate.py`, `check.py`, `apply_review.py`).
      Each proposal was read before it was applied.
    - **What changed:** 614 stories; 1,132 Thai lines rewritten or added, plus 13 English-only
      fixes.
    - **Problems fixed:**
      - Missing links: ก็, เลย, จน, พอ…ก็, or a missing space before "so" เลย.
      - Speech particles missing in dialogue, or wrong for the speaker.
      - English calques: หัวปวด, ไปทำงานด้วยรถเมล์, มีน้ำตา.
      - Wrong collocations: ดูกระจก → ส่องกระจก, เล่นซอ → สีซอ.
      - Classifier order.
      - Royal and news register.
      - Crammed vocabulary-list lines.
      - Nonsense slang lines.
      - About 40 wrong facts, among them:
        - women may never touch monks (not "in some places");
        - a first driving licence is a 2-year temporary one;
        - ranks that skipped a level;
        - sums that didn't add up;
        - ASEAN now has 11 members.
    - **Rules kept:**
      - Every story keeps at least 2 words from each of its topics. That held every topic at 5+.
        Errands › Massage dipped to 4 when a story that only matched by accident was fixed, and
        rs-traditional-clinic was given two real massage words.
      - Phrase cards are kept verbatim even where they're unnatural, and flagged instead.
      - Slang stays strong.
      - Teaching devices (tone pairs, pronoun registers) stay.
    - **`review_fixes.py`** (scratchpad `decks/`):
      - `NEW` holds shared words the rewrites needed: ทราบ, เรียกร้อง, ที่ดิน, ขวา 'right'…
      - `STORY_NEW` holds new senses of words that already have cards, scoped to one story: เกาะ
        'to perch', เหรียญ 'medal', ordinal ที่, and เมื่อ 'when' outside the past. A shared NEW
        would override the card meaning in every story; for example, every island would become
        "to perch".
      - `PICKS` holds the reviewers' meaning picks.
    - **Typography:** a space now follows ๆ (ค่อย ๆ เดิน, not ค่อย ๆเดิน), as in standard Thai.
  - **Every story word is in a topic** (2026-10-09, the user's request).
    - **Before:** 321 words, and 23 senses of words that were in topics, existed only as story
      cards. Among them were basics such as แดง, ฟ้า, ครัว, แกง, ตะโกน, ทันที and เพื่อนบ้าน. You
      could study them in Flashcards, but they weren't on the Topics page.
    - **What `decks/story_words.py` did:** it put all of them into themed topics with room (about
      100 topics), staying under the 25-card limit. Words that would duplicate an English answer
      within a topic went elsewhere: แดง, already there as สีแดง 'red', went to Adjectives, not
      Colors.
    - **New topics:**
      - Adverbs: When, How & How Often (Grammar);
      - Adjectives: Senses & Qualities (Basics);
      - Everyday Actions: Handling Things, and Moving About (Grammar › Verbs);
      - Letter-Name Words: ก–ณ and ด–ฮ (Thai Script › Consonants), the 44 words that name the
        consonants. 18 of the story-only words were name words (ระฆัง, ฐาน, ปฏัก, มณโฑ, ฤๅษี…).
    - **Coverage:** five new stories (`decks/stories_b6_storywords.py`, 1,010 in all) bring the
      new topics to 5 stories each. They use only words that already had cards.
    - **The rule from now on:** a story uses only words that have a topic card. A new word gets a
      topic card as well (`plan5.py` and a story-only check, as in `story_words.py`).
  - **The Five Tones** (2026-10-11, the user's request): Thai Script › Tones & Reading had tone names,
    rules, marks and minimal pairs, but nothing on what each tone sounds like. The new topic
    `script-five-tones` comes first in that group.
    - **Format:** as in Tone Rules, the front is an everyday word in the tone, so its audio
      demonstrates it, and the English is the tone with its pitch shape. The note has the Thai
      name, a description with an English comparison, a shape (→ ↘ ↗ ↘↗), the word's meaning and
      three more examples.
    - **The five words:** ปลา mid, ไก่ low, ข้าว falling, ม้า high, หมา rising.
    - **Three extra cards:**
      - Two five-tone sets in the standard order (mid, low, falling, high, rising): คา ข่า ค่า ค้า ขา,
        and ไมล์ ใหม่ ไม่ ไม้ ไหม (mile, new, not, wood, silk), added the same day at the user's request.
        Each is one recording; with spaces in them, they stay whole.
      - The tongue-twister ไม้ใหม่ไม่ไหม้ไหม, split into words like any phrase. Its note says it isn't
        in tone order: high, low, falling, falling, rising, with no mid.
    - **Checked:** no story's meanings changed. A Thai Script card loses to a word's everyday
      meaning in stories, as with Tone Rules. The topic already has 5+ stories, and the audit is
      clean.
  - **Common words the story agents found missing** (2026-10-11, the user's request; a background agent,
    scratchpad `newcards/add_cards.py`): 34 cards.
    - **24 new words:** ดำเนินการ, หมัก, ลำบาก, เดือดร้อน, ต่อแถว, เซ, ดัน, เล็ก ๆ, ไถ่โทษ, ล้น, ลูกแกะ,
      ขึ้นเครื่อง, คดเคี้ยว, แข็งค่า, รวดเดียว, หนุ่ม ๆ, คั่ว, ครั้งแรก, ดีขึ้น, ได้ไหม, ดิบ, ขมับ, ใช้หนี้, แปลว่า.
    - **10 new senses:** สุก cooked, แข็ง hard, ฟัน to slash, ร้อง to cry out / sing, ทรง shape, ชม to view,
      แถว around, ค้าง to stay overnight, เลย past, ปั๊ม petrol station. Each went into a fitting topic
      with room.
    - **Stories:** rebuilt, and 31 meaning changes reviewed. แถว, ชม, ค้าง, แข็ง and the human ร้อง
      were fixes. Ten animal stories (ร้อง "to call, cry (any animal)") and two royal ones (ทรง, the
      verb prefix) are pinned back in `review_fixes.PICKS`. ดีขึ้น, ได้ไหม and แปลว่า were split into
      words like any phrase.
  - **Batch 7: stories for words no story used** (2026-10-10, the user's request: at least 98% of
    cards outside Thai Script in some story, by card, i.e. word and meaning).
    - **Before:** 92.67% (6,968 of 7,519), with 551 cards in 168 topics in no story. Most were
      Spoken Top-500 second glosses, Shopping, TV, Economy, Medical Staff and Beach words.
    - **How:** four agents, one share of categories each, wrote 136 stories (1,010 → 1,146) in
      `decks/stories_b7_1.py` to `_4.py`.
      - Each had a brief with the natural-Thai checklist (scratchpad `b7/brief.md`) and a target
        list (`b7/targets_N.md`, from `targets.py`).
      - `b7/check_batch.py` builds a trial with a draft (`build_reading.py --extra`) and shows
        errors, name clashes and the target cards covered.
      - I read every share as Thai before it went in. `b7/integrate.py` registers a share, rebuilds,
        and checks plan5, the audit and coverage.
      - Each share was committed and pushed with its audio.
    - **After: 99.97%** (7,517 of 7,519). Still in no story:
      - **555 "hahaha":** no Thai letters, so the builder can't read it as a word.
      - **หวาน "lying (Gen-Z)":** left out as a doubtful slang sense.
    - **Fixes on the way:** Southern จังหู้ became "very, really (Southern)" so it doesn't share an
      answer with มาก in a story. A space was added after ๆ in seven lines.
    - **Worth a native check:**
      - the Southern stories (Grandma's Orchard, The Deckhand and the Storm, Showing Off in the
        Village) and the Isan one (Koi with Grandma);
      - lines that quote a pattern card with its "…" (ขอ … หน่อย, ถ้า…ก็, ที่อื่นขาย…บาท).
    - **Cards worth adding someday:** the agents met common words with no card, which forced
      plainer wording: ครั้งแรก, ดีขึ้น, เล็ก ๆ, ดิบ, คั่ว, หมัก, ดำเนินการ, ลูกแกะ.
  - **Phrases in stories are split into their words** (2026-10-10, the user's report and call).
    - **The bug:** a phrase card such as คุณชื่ออะไร was one token in a story line. It was tapped as
      one "word", and Word gaps put no gaps inside it. This happened in 627 of the 1,010 stories:
      1,248 phrases, from questions to idioms and compounds such as พนักงานเสิร์ฟ.
    - **The rule:** a phrase splits at its card's transliteration spaces, one piece per
      transliterated word. For example, khun chʉ̂ʉ a-rai gives คุณ|ชื่อ|อะไร, and a hyphenated word
      such as mʉang-thai stays whole. Splitting applies to every phrase, compounds included (the
      user chose "everything" over "sentences only"). A piece that is itself a phrase card splits
      in turn (ออกเสียง).
    - **How (the builder, scratchpad `decks/build_reading.py`):**
      - `phrase_splits.json` lists the pieces for each phrase. It was made by scratchpad
        `split/align.mjs`: a piece is a card whose transliteration matches, or a new word whose
        syllables match (spell.js's reading). Five loanword phrases were split by hand.
      - `split_line` rewrites the passage's tokens.
      - **The phrase's own card stays in the story's word list.** It still links the story to its
        topic (`storiesFor`, the 5-stories check), and it can be learnt whole.
      - **Which meaning a piece takes:** a card pronounced as in the phrase, then the usual picks.
        `split_senses.py` overrides this: `GLOBAL` for words such as ที่, ของ, ผล, ใบ and ค่า, and
        `BY_PHRASE` for 38 phrases. All 936 pieces with more than one card were reviewed by hand.
        Examples: หนัง in ตัวอย่างหนัง is film, not leather; สี in สีซอ is to bow (a fiddle).
    - **New cards:**
      - **445 words** that had no card, glossed by hand (scratchpad `split/glosses.py`). Each went
        into its phrase's topic, or the nearest topic with room when that one was full.
      - **Three new topics:** Parcels: Shipping & Tracking, Documents: Certificates & Registration,
        and Traffic Offences: Checks & Insurance. The parcels and traffic topics also got copies of
        พัสดุ, ส่ง, ตำรวจ and ค่าปรับ, which bring them to 5 stories each.
      - **20 new senses** where a piece meant something its cards didn't. For example, ข้าวสาร in
        ผีฝากถุงข้าวสาร is uncooked rice, not Khao San Road; Northern ส้ม is sour and กา a
        question particle; ปะ in หนีเสือปะจระเข้ is to run into.
      - **Dialect and old words:** several dialect and idiom glosses are best guesses. These
        include Southern แข็บ and ด็อง, and ควัด.
    - **Clashes fixed:** nine cards were re-glossed where a phrase and its piece shared an English
      answer within a story. For example, มือถือ and โทรศัพท์มือถือ were both "mobile phone"; the
      latter is now "mobile phone (full name)".
    - **Story size:** a story's word list can now pass 50 (up to 67), with each idiom's card plus
      its words. The audit allows stories up to 70 (`STORY_MAX`); word topics keep 25.
    - **Checked:**
      - Every Thai token in every story has a card, and no phrase is left whole.
      - The audit has 0 errors, and `plan5.py` needs no slots.
      - In Chromium, The Nosy Auntie reads ป้า: คุณ ชื่อ อะไร with gaps, and tapping ชื่อ shows
        "name / to be called".
    - **The Topics page splits phrases too** (same day, the user's request).
      - **Data:** each phrase card has `words`, the card keys of its words, written by the builder.
        A phrase a story uses takes that story's (reviewed) card for each word; any other takes the
        builder's usual choice for its topic. The audit checks that the keys exist and spell the
        phrase.
      - **Covers every phrase:** 1,401 topic phrase cards (all but tone-mark names like ◌่). This
        needed 86 more splits for phrases no story uses (scratchpad `split/align_topics.mjs`) and
        16 more cards, such as สองพัน, Isan จั่ง/ได๋/ซี่ and ตกต่ำ.
      - **App:** `phraseWords` reads `words`. A phrase row's Thai cell is one `.tw` span per word,
        and each opens its own pop-up; the row's buttons still add, spell and play the whole phrase.
        Gaps between the words: Settings → Topics → "Word gaps in phrases" (`topicWordGaps`,
        `.wordtable.show-spaces`), off by default; the user asked for its own setting the same day.
        At first the gaps followed the reader's Word gaps button.
        `reanchorWordPop` finds the pop-up's word again by `data-pop` (row key | word index) after
        the table redraws.
      - **Checked in Chromium:** Small Talk: Questions shows คุณ ชื่อ อะไร as three words. Tapping
        ชื่อ opens its pop-up, and adding it from the pop-up keeps the pop-up on ชื่อ.
  - **Slang & Swearing card check** (2026-10-09). The deck's 286 cards plus the two crime-slang
    topics were read in full.
    - **Method:** about 50 doubtful cards were checked against Thai sources: the Longdo dict blog
      and Wongnai kathoey-slang lists, Wiktionary (หมาต๋า, from Hokkien), iLaw (พิซซ่า = Article
      112 cases), and the Supreme Court insult rulings.
    - **Almost all were real.** That includes the whole LGBTQ+ "Moods, Drama & Sayings" topic,
      which looked the most invented.
    - **Removed:** กะโหลก "dumb" and ราหู as a slur, which no source supports.
    - **Re-glossed:**
      - เม็ดเยอะ: full of tricks / too clever, not "cagey".
      - บ้ง: a fail.
      - เจาะยาง: a dead-leg kick, not shooting someone's legs.
      - ประเทือง: aimed at trans women.
      - Crime-slang แกง: to set up. ล้ม: to topple. Neither means "kill".
    - **Notes:** the "ruled unlawful" note was dropped from ดอกทอง; หมาต๋า, เก้ง, มือที่สาม and
      บุย gained notes.
    - The edits are in scratchpad `decks/slang_fix.py`, and decks.json is the source for
      non-Reading cards. rs-fired-up and rs-busted were adjusted to match.
    - Audit: 0 errors. All 404 batch 1–3 stories opened from a matching topic in the browser
      test, each sentence with its sample.

## Speaker icon (2026-10-08)

**Plain icons 50% larger** (2026-10-09, the user's request).
- **Which icons:** the ones with no circle round them: Topics rows and search results (add to
  Flashcards, spell, play), the reader's sentence speakers, and the word pop-up's three buttons.
- **Sizes:** icons went from 18–21 px to 27–31 px, and the ก spell icon from 17 to 26 px. Their
  buttons went from 34 to 50 px (48 px for the reader's speakers, 54 px in the pop-up).
- **Unchanged:** the card's circled buttons (speaker, ⟳, ก), which were already large.
- **Checked:** at 390 px a Topics row's Thai keeps 172 px beside the three icons, and nothing
  overflows.
- **The card's circled buttons, 50% larger as well** (same day): 72 → 108 px on desktop and 48 → 72 px
  on the phone. The A badge moved to sit on the new speaker's edge.
  - **Phone room:** the face's padding went from 56 to 84 px, and the card from 42vh to 46vh
    (240–380 px to 270–420 px), so the word keeps clear of the buttons.
  - **Checked:** 216 faces each on phone and desktop (idioms, doctor phrases and dishes, both
    directions, front and back), testing text lines against the buttons' boxes. The first run was
    void: no words were in Flashcards, so no card showed. The rerun found two phone overlaps, where
    a long idiom's transliteration met the badge, so the badge moved up 4 px.
- **The A badge moved beside the speaker** (2026-10-11, the user's request: the overlap was too fiddly
  on a phone). It now sits to the speaker's left, level with its middle, 12 px clear of it, so even
  its invisible 10 px tap margin stays off the speaker. Desktop: top 54, right 138. Phone: top 31,
  right 94. Checked on Flashcards and Recall, phone and desktop: the centres line up, the speaker's
  edge taps the speaker, and none of 432 faces has text under the badge.
- **No more 6 px scroll on long backs** (2026-10-10, the user's request): with the bigger buttons,
  two English → Thai idiom backs on a 390 px phone ran 6 px past the back, which then scrolled.
  `fitBack` shrinks the back's main line (`#card-english`, the Thai answer in English → Thai) a
  step at a time, down to 70%, until the back fits, as `fitText` already does for the front.
  - **Checked:** 108 phone backs. Only those two shrank (one step, about 6%), and none scrolls.
- **The smaller Thai on a Thai → English or Listen back is tappable too** (same day): letters name
  themselves, as on the large Thai (`tapCardThai` with `cardThaiShown` and `recallThaiShown`).

The 🔊 emoji came in each device's own colours (blue on some), while every other icon is a line in
the text colour. The user asked for it to match. It's now `speakerIcon()` (via `lineIcon`, class
`.speaker-icon`), and the same SVG is inline in index.html. It appears on:
- the card corners (Flashcards and Recall, front and back);
- the Topics list rows and search results;
- Read all, including after Stop;
- the Listen direction's phone label.

It's sized in `em` from the button's font size, as the emoji was.

**It animates while its word plays** (also at the user's request). The two sound waves are separate
paths (`.wave1`, `.wave2`) that pulse in turn, and the button takes the accent colour, like the
spell button's waves.
- **How it tracks the word:** `speakAndWait` records the Thai being said in `speakingText`, with a
  sequence number so only the latest call clears it. `markSpeakers()` lights every speaker for that
  word:
  - the Flashcards card's corners when it's the current card's word;
  - Recall's when it's the Recall card's;
  - Topics rows and search results by their `data-say`.
  
  So it lights for a tap, a card appearing, a turn to the script, and Read all as it reaches each
  row (not during the English).
- **Re-rendered rows** start lit if their word is still playing.
- **It stops when the voice stops,** not at the end of the file (the user saw it stay lit about a
  second after สวัสดีครับ). Every card clip ends in about a second of silence (edge-tts padding;
  the files are about 1.9 s, the voice about 0.7–0.9 s).
  - `waveformOf` gives each clip a `tail`: the last sample above 1% of its peak, plus
    `TAIL_MARGIN` (0.12 s). Every clip that plays is decoded for this, once, then cached in
    `waveInfo`.
  - From the tail, `tickPlayback` sets `speechOver`. The speakers rest (`sayingNow`) and the
    waveform goes dark.
  - The audio still runs to its end, so Read all's pacing is unchanged. A press on the speaker in
    that silent second plays the word again.
  - Measured on Greetings, from press to dark: 0.9–1.0 s, against about 1.9 s before. The first
    word after loading takes about 0.3 s longer to start.
- **Reduced motion** turns the pulse off.

**Pressing a lit speaker stops it** (the user's request, matching the spell button). `speakerPress`
backs the card corners, Recall, Topics rows and search results. If the button's word is playing
(it's lit), the press stops the audio. During Read all it stops the reading (`stopReadAloud`).
Otherwise it plays the word. The Listen waveform still replays on a tap.

**The small speaker lost its outline** (the user's request). On Topics rows and search results it
had a rounded border, while the add-to-Flashcards and spell icons beside it don't. Now all three
are plain icons in the same 34 px round button. On hover each turns the accent colour and gets a
faint round background. The card's big corner speaker keeps its circle.

## Listen → English, a third direction (2026-10-08)

The user asked for a listening option done cleanly. Listening is a third direction next to Thai →
English and English → Thai: `state.direction = 'listen'`, saved in prefs like the others. On the
phone the row reads TH→EN | EN→TH | 🔊→EN. It works the same in all three modes:

- **The card:** the front is the word's **waveform** (`listenButton`, `.listen-wave`; the user
  asked for it in place of a big 🔊).
  - **Drawing it:** `waveformOf(url)` fetches the clip, from the in-memory blob if there is one,
    and decodes it with an `OfflineAudioContext`. That needs no user gesture, so it works before
    the first tap on iOS. It trims the silence edge-tts pads every clip with (a threshold of 4%
    of the peak). The result is 30 bars of RMS loudness, scaled ^0.7, plus where the speech starts
    and ends in seconds. Each clip is cached in `waveforms`.
  - **Before it's ready:** until the clip is decoded, or if a word has no recording, the bars
    show a soft generic arch (`WAVE_PLACEHOLDER`). Heights ease into the real shape.
  - **Playback:** `playSample` records `playingUrl`. While the clip plays, `tickWaves` (an rAF
    loop started by the audio's `playing` event) lights the bars up to where the voice has got
    to, using `currentTime` against the trimmed start and end. The bars stay lit through the
    clip's trailing silence and go dark when it ends.
  - **Taps:** a tap on the waveform plays the word again and never flips the card. The word also
    plays by itself when the card appears, like Thai → English.
  - **The shape is a hint:** it shows the word's length and syllable rhythm (three humps for
    ไม่เผ็ดเลย), but not its tone.
  - **The back** is Thai → English's: the Thai, transliteration, English, note and spelling.
  - The front keeps Thai → English's corner buttons: 🔊 top right and spell-it-aloud bottom
    left. At first the corner 🔊 was hidden as a second play button; the user asked for both.
- **Recognition** offers English answers, as Thai → English does. On Tone Pairs and Sound Pairs
  the partners are the wrong answers, which makes a real ear test. It never offers a word that
  sounds the same (`audible()` in `buildLearnTrial`: the same transliteration, ignoring spaces
  and hyphens). So ย่า isn't asked against หญ้า, or ไม่ against ไหม้. A test of all 146 pair
  cards found 0.
- **Recall** shows the waveform on the front too. The old setting's "Show Thai" eye button
  (`#review-script`, `showReviewScript`) was there at first, then removed at the user's request:
  Browse and Recognition have no such peek, and spell-it-aloud is the hint. A card turned back to
  its front still shows the waveform, as on Browse.
- **Turning a card to the side that speaks says the word** (the user's request; `speakingSide`, called
  `thaiScriptSide` until 2026-10-09). The speaking sides are Thai → English's front, English → Thai's
  back and Listen → English's front. It applies on Flashcards (⟳ or a tap, `flipCard`) and on Recall
  (the reveal, `revealAnswer`, then `turnReviewCard`). Before this only English → Thai's reveal spoke.
  - **2026-10-09, the user's bug report:** Listen's speaking side was its script-bearing back.
    That meant the sound played on turning to the answer, and not on turning back to the sound side.
    It is now the front (the sound) only, and the back's speaker plays on demand.
  - **Tested:** every direction × Browse/Recall, counting plays on show, each turn and each turn
    back. Browse expected (and got) Thai → English 1/0/1, English → Thai 0/1/0, Listen 1/0/1.
    Recall's show/reveal/back/again expected (and got) 1/0/1/0, 0/1/0/1 and 1/0/1/0.
  - **Test-harness trap:** once a card has turned, click the visible face's ⟳. The hidden face's
    position can land on the other face's spell button.
  - **Bug found on the way:** `els.flipButtons` was `.flip-btn` everywhere, which included
    Recall's ⟳ (`.flip-btn.review-flip`). So every Recall turn also flipped the hidden Flashcards
    card, and in English → Thai it said the word twice. It's now `#card .flip-btn`.
- **Progress:** Listening has its own items (`key##listen`). Reading a word and catching it by
  ear are different skills, so Recall brings back the ones you miss by ear.
- **What went:** Settings → Recall → Show Thai script (`reviewScript`) and its settings group.
  The pair topics' tip now says "switch Flashcards to Listen → English".
- **Layout:**
  - On desktop the switches keep their labels on one line (they wrapped to two with three
    directions). The topic button gives way, its name ending in "…", and below 1000 px the row
    wraps.
  - Fixed at the same time: on the phone a long topic name pushed the topic button past the
    screen edge. `.deck-button { min-width: 0 }` makes it end in "…".

## Test mode

**No hover on phones for the answers and grades (2026-10-10, the user's report from the iPhone).**
- **The bug:** after an answer, the next question's answer in the same place showed grey, as if
  already chosen. A phone keeps `:hover` on the spot last tapped, and the new button drawn there
  took `.learn-pill:hover`.
- **The fix:** that rule, and Recall's `.grade:hover` (the same problem from card to card), now
  apply only under `@media (hover: hover)`, i.e. with a mouse.
- **Checked:** in Chromium emulating a touch screen, the answer under the pointer on the next
  question was grey (#eeece6) with the old styles and white like the others with the new.

**Recognition (Test mode's new name) is a continuous stream (2026-10-08, the user's request).**
- **Removed:** the round with a score, the end-of-round summary (`showRoundSummary`, `#round-summary`,
  `fillMissedList`), the "3 / 24" badge, ‹ ›, and the arrow keys. Answering is the only way on.
  Browse keeps ‹ › and the badge.
- **Moving on:** after an answer the card moves on by itself.
  - The wait is Settings → Flashcards → "Pause after a right answer" (`learnPauseMs`, 1.5 s) or
    "Pause after a wrong answer" (`wrongPauseMs`, 4 s; 3 s for its first hour), both shown in seconds.
  - At first a wrong answer waited twice the one pause. The user wanted it longer and separate
    (2026-10-08).
  - The new key needs no migration: it isn't in saved settings, so the default applies.
  - Checked in Chromium: 1.51 s and 3.01 s, and 4.52 s after setting 4.5.
  - "Move on after an answer" (`learnAutoProgress`, with its migration) and the pending rating
    that waited for › (`pendingLearnRating`) are gone.
  - The rating is saved as soon as you answer (`saveDeckRating`).
  - The move is a timer guarded by `state.answerSeq`. Changing mode, direction or topic
    (`resetRecognition`) cancels it, and nothing is lost.
- **Order:** passes through the words in Settings → Card order. Each pass is rebuilt by
  `buildFlashcardQueue` (reshuffled if Random) and never starts with the card just seen.
- **Relearning a miss** (`requeueRecognition`, `state.relearn`; expanding retrieval practice, as in
  Recall):
  - wrong → the card is spliced back 2–4 cards later (step 1);
  - right at step 1 → once more 6–9 cards later (step 2);
  - right at step 2, or first time → back to the normal passes;
  - wrong at any step starts again from step 1.
- **Comebacks past the end of a pass** go into the next pass at the same distance
  (`state.carry`), replacing that card's turn there. At first they were appended to the end of
  the pass, which could bring a card straight back. Those cards are taken out of the new pass
  before any is put back, so one can't shift another.
- **Checked in Chromium** (6 words, five runs, missing w1 once and w3 twice):
  - First comebacks came 2–4 cards later, and confirmations 6–9 later.
  - Nothing came back to back, and there was no summary.
  - A direction change during the pause cancelled the move.
  - When misses cluster, one comeback can slip a card later (5 instead of 2–4).
- The older Test-mode notes below describe the round version.

**Random order puts new words first** (2026-10-07, the user's request: newly added Review words
should come up first). In random order, `buildQueue` moves cards never answered in this direction
(`dueAt === 0`) to the front. They stay shuffled among themselves, and the rest follow in their
usual order (due first with Smart order, then box-weighted). List order and Learn mode are
unchanged.

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

**FSRS.** Uses FSRS-5 with the default `FSRS_W` parameters (`scheduleItem`, which is pure; the
grade buttons used to preview each interval with it, until 2026-10-07).
- **Two update rules:** a review on the same study day (`dayKey`, 4 am rollover) as the last one
  uses the same-day stability rule; later reviews use the forgetting curve.
- **Again:** due in `settings.waitAgainMin` minutes (default 10), and requeued in-session.
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

- **The waits are settings** (Settings → Review, 2026-10-07): Again (minutes), and Hard and Easy
  first waits (days). The defaults are 10 min, 1 day and 3 days.
  - **The user's choice:** the first waits, then growth, rather than fixed waits every time,
    which would bring known words back forever.
  - **How it works:** a new item rated Hard or Easy (FSRS Good) starts at the stability whose
    interval is that many days (`days / fsrsInterval(1, retention)`), so the first wait is exact
    at any retention. FSRS grows it from there, and Hard keeps its 1.2× cap. A correct
    multiple-choice answer (Flashcards Test) counts as Hard, so it uses the Hard first wait.
  - **A word missed first,** then got right the same day, keeps FSRS's own small stability, so
    it's back the next day.
  - **Checked:** with 5 / 2 / 4, new words got 5 min, 2 days and 4 days, and a known word (last
    gap 6 days) rated Easy got 21 days.
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

**What Review holds: only the words you add** (`store.reviewWords`, `{ cardKey: addedAt }`).
This was the "Only words I add" choice of Settings → Review → "Adding to Review"
(`settings.newSource`, 2026-10-06). Since 2026-10-07 it's the only behaviour, at the user's
request; the setting and "New cards per day" (`newPerDay`) are gone.
- **The words:**
  - **Review starts empty,** with a note on how to add words; the Home card says "Nothing added
    yet". The `review-manual` settings migration moved both automatic values to manual, and the
    user chose to start from an empty set.
  - **Ways to add:**
    - **Removed: "Add to Review…" on a deck Test round's score screen.** It opened a dialog of
      that round's words, none ticked, with All / Missed only / None. On 2026-10-07 it was first
      hidden while Review words only was on. When that became the only behaviour it could never
      show, since every word in a round is already in Review, so it was deleted along with
      `#add-modal`.
    - **Wordlists: a Review button on each row, left of the speaker** (`.row-review`): the Review
      icon, or a green ✓ once added. Tapping it toggles and shows a toast naming the word.
      - It's a plain icon with no border, so it reads as less important than the speaker.
      - History: a bordered + button there first looked as important as the speaker. On
        2026-10-06 it was replaced by press-and-hold (click with a mouse) opening a strip under
        the row. That was removed the same day, at the user's request, in favour of this button.
      - "Add all to Review" is in the toolbar.
    - **Not on Flashcards cards** (removed 2026-10-07, at the user's request: Review is changed
      in Wordlists, not while studying). There used to be a 🔁 / ✓ button in a card's top-right.
      Since then, on Flashcards the Review set only changes through Settings (Reset).
  - **There's no daily limit:** every added word that hasn't started yet shows up as new straight
    away, in the order added.
  - **Words already answered** in deck Test mode keep that progress: a miss is due within about
    10 minutes, a correct answer the next day (multiple choice counts as Hard; see "Changes to
    plain FSRS").
  - **Taking words out** is done in Wordlists (`setInReview(keys, false)`). It keeps their
    progress, so re-adding carries on. The Review page's ✕ buttons went with its category table
    (2026-10-07).
- **Automatic adding** (`started` / `current`, the earlier behaviour) was removed on 2026-10-07.
  It covered every word with progress, with new words drawn from started topics or the current one
  within "New cards per day".
  - Removed with it: `newCardDecks`, `NEW_PER_DECK`'s round-robin, and the per-topic and per-word
    exclusions (`reviewExcluded` / `reviewExcludedCards`). Reset all progress deletes any saved
    exclusions.
- **`reviewFilter()`** (the words, and `has(key)`) is used by `planReview` and `dueTomorrow`.

**Today** (`planReview` → `startReview`):
- **The Review screen** shows the topic button (what Review covers), the due and new counts, and
  Start.
  - Until 2026-10-07 a table under the card broke the session down by category, with ✕ buttons
    to remove a category or single words. The user removed it to make the page simpler, now that
    Review can be narrowed with Everything / By topic.
  - A Tomorrow / next 7 days forecast line was removed on 2026-10-05 as noise.
- **Practise again** (2026-10-07; gone 2026-10-08, when Review became a continuous stream with no
  end, see "Views"). The user finished their 6 words and wanted to keep going.
  - **Where:** the button shows on the Review screen when nothing's due, with "Nothing's due.
    Practising doesn't change when words come back." It also shows next to Done on the end
    screen, when nothing's left to review. Enter starts it from the Review screen.
  - **What:** `planPractice()` takes every started item (`store.items`) for words Review covers,
    in random order, in the directions Review would use (`reviewDeckId`).
  - **No schedule changes:** a practice session (`state.review.practice`) skips `gradeItem()` and
    the daily count.
    - Same-day repeats barely move FSRS anyway. An Again would push a well-known word back over a
      slip in extra practice.
    - Again still brings the card back later in the round.
  - **Labels:** cards carry a "Practice" badge, and the end screen says "Practice complete · N
    cards practised · X% right".
  - **The end screen's buttons** (Practise again, Done) sit under the card, not inside it, for
    Review and Practice alike (the user's call, 2026-10-07). `#review-summary` is a wrapper
    around the card (`.round-summary`) and the buttons (`.review-summary-actions`).
  - **Tested in Chromium:** a 6-word review, then practice. The store's `items` and `daily` were
    identical before and after the practice round, an Again requeued, and the buttons showed in
    each place.
- **By topic with none of its words in Review** (manual adding): instead of "0 due · 0 new", the
  same message box as Flashcards' (`#today-topic-empty`, sharing `.review-only-empty`), centred
  in the space under the topic button (`.today-topic-none` on the stage).
  - The third line differs: "Or switch to Everything with the button above to review all your
    words". It's the only way out there.
  - For a group or category, the heading names it.
  - **Nothing in Review at all** (2026-10-07): the same box, titled "No words in Review yet" on
    Everything. It replaced a plain "Review is empty. Add words from the Topics page." line, which
    the user pointed out didn't match the other messages or mention the 🔁 button.
    - **The "switch to Everything" line is hidden** whenever Review is empty, since Everything
      would be empty too (`#today-topic-empty-hint`).
- **Due items** are everything due by the end of the study day (days roll over at 4 am), weakest
  (lowest retrievability) first, capped by `maxReviews` minus today's `rv`. *(Superseded
  2026-10-08: Review is a continuous stream; see "Views". Due now, not by the end of the day, and
  no cap.)*
  - **They come from what Review covers** (see "Scopes" below): Everything by default, or a
    topic, group or category. `reviewDeckId(…, scopeIds)` skips items with no deck in scope;
    "due tomorrow" uses the same filter.
  - **The heading says which,** e.g. "55 due across all topics / in Food & Drink". The user was
    confused, back when "New cards from: Current deck only" existed, that due words from other
    decks still showed.
  - The old "Due reviews from: Current deck only" (`reviewScope`) is gone. The `review-by-topic`
    migration starts anyone who had it on Review → By topic.
- **New items have no daily limit:**
  - First, English → Thai items for unlocked words, oldest unlock first.
  - Then the words you've added that haven't started, in the order added.
  - Both are kept to what Review covers.
  - **Review always shows the topic button,** in the same place as on Flashcards, to pick what
    Review covers. Since 2026-10-07 that includes during a session, at the user's request.
    - Changing the choice mid-session ends the session (`leaveReviewSession`; answers are saved
      as you go) and shows the start screen for the new choice.
    - Re-picking the same choice carries on.
- **New items** are spread evenly through the reviews.

**A card in the session:**
- **Same size as the Flashcards card** (2026-10-07, at the user's request), with contents centred.
  It grows if a revealed answer needs more room.
  - **Desktop:** 16:9 and up to 900px; `.today` is now 900px, and the start screen keeps 720px.
  - **Phone:** the Flashcards height, `clamp(240px, 42vh…, 380px)`, and the face's padding.
  - **Corner pieces:** 🔊 is a `.speak` button (72px desktop, 48px phone, top right), and the
    New/Again badge matches the "1 / 24" badge.
  - **Measured equal:** 366×354 on the phone and 900×506 on desktop.
- **The session header** ("12 left · topic · End review", `#review-top`) lives in the topic bar, hidden
  outside a session. That puts it level with Flashcards' direction and Learn/Test controls, at the
  user's request. "End review" was a bare ✕ until 2026-10-07; the user found it unclear.
  - **Desktop:** it shares the topic button's row.
  - **Phone:** it's the second row, 37px tall like the controls.
  - **Result:** both cards start at the same height (165px on the phone, 160px on desktop; it was
    43px lower on desktop).
  - **Order** (user's request): the card's topic in the middle, then "12 left" and End review on
    the right. `.review-top` is a `1fr auto 1fr` grid, so the topic stays centred while it fits.
    - **Desktop:** during a session (`.review-session` on the stage) the whole bar is that grid,
      with the header's box `display: contents`. The topic sits at the screen's centre (measured
      640 of 1280).
    - **Phone:** the row is 366px and "12 left · End review" takes about 150px, so only a very
      short topic can be exactly centred. A longer one sits as close to the middle as it can (10px
      from "12 left"), then shortens with "…".
  - **Sizes match the other pages** (measured): the topic and "12 left" are the size of
    Flashcards' Thai → English (16px desktop, 13px phone). The topic is in the main text colour
    (`--ink`), so it stands out; "12 left" stays muted. End review is a `.ghost` button with a
    line "exit" icon, the same size, padding and border as Wordlists' Read all and Add all to
    Review (15px; 32px tall on desktop, 35px on the phone).
- **Mode: every item is recall,** new ones too (2026-10-07, the user's call: recognition is what
  Flashcards is for). Until then, a new item started with multiple choice, with a second go if
  the first was wrong, then switched to recall (`reviewMode`, `renderReviewPills`,
  `pickReviewPill`, the Continue button). All of that was removed.
- **Recall:** the front says "Say it aloud, then tap Show" (setting). The hint hides once the
  answer is showing (2026-10-07). Show reveals the answer and the grade buttons. The buttons
  showed each grade's next interval until 2026-10-07, when the user found it unnecessary and the
  waits became settings.
- **Three grades** (since 2026-10-07, at the user's request): **Again** (FSRS 1), **Hard** (2) and
  **Easy**, which schedules as FSRS **Good** (3).
  - It isn't FSRS Easy (4) because that would put a brand-new word about 16 days out (Good: 3
    days), and the user had already found long gaps too long.
  - FSRS Easy is no longer offered on Review.
- **Show Thai script** (Settings → Review, `settings.reviewScript`; added 2026-10-07, removed
  2026-10-08). Off made Thai → English cards audio only. Listen → English (below) replaced it.
- **Audio:** th-en plays the Thai on the front. en-th plays nothing until the answer is shown,
  which fixed the old English-first giveaway.
- **Requeue:** Again brings the item back 5–8 cards later, until it's right once
  (`recordGrade`).
- **End screen:** cards reviewed, % right, new count, due tomorrow, and the missed list.
- **Keys:** Enter/Space show the answer (then Easy, i.e. FSRS Good), and 1–3 grade (Again, Hard, Easy).

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
keywords. Since 2026-10-07 its sections are Display, Audio, Topics (was Wordlists), Flashcards
(was "Deck mode"), Review (was "Daily review"), App and Reset, at the user's request. App moved
from first to just above Reset later the same day.
- **Flashcards' settings reviewed** (2026-10-08, at the user's request). There are now three
  parts:
  - **Test:** "Card order" (was "Test card order"), "Move on after an answer" (was "Auto-progress
    after multiple choice"; options Off / After a right answer / After every answer), and "Pause
    before moving on", now in seconds. It's still saved as `learnPauseMs`, so no migration was
    needed.
  - **Review:** Show Thai script.
  - **Scheduling (Test and Review):** the three waits and Desired retention. They were under
    "Review mode", but Test answers use the same schedule: a wrong one counts as Very Hard, a
    right one as Hard. The help says so.
  - **Smart order is gone** (prefs `srsOn`, with `isDue`, `boxForStability`, `BOX_WEIGHTS` and
    `boxWeightedQueue`). It put due cards first in Test, and spacing is now Review's job. Test is
    every word once per round: random with never-answered words first, or list order.
    - Checked in Chromium: 3 new and 5 answered words gave NNNooooo.
- **Read all's settings moved to Topics** (2026-10-08, at the user's request, after a review of
  what belongs where). Repeats, Pause between words and Speak English too only affect the Topics
  page's Read all, so they sit at the end of Topics under a "Read all" subheading. "Read-aloud
  repeats" became plain "Repeats".
  - **Repeats now defaults to 2** (was 1). Settings are saved in full, so the `read-repeats-2`
    migration moves a saved 1 to 2. A value the user picks afterwards sticks.
  - **The rest stayed:** Voice, Thai speed, Spelling and Offline audio affect cards and the
    Topics page alike, so they stay in Audio.
- **What moved:** Spelling went from Display to Audio. The Confirmations section's two settings
  joined Wordlists, beside the buttons they confirm: "Confirm “Add all to Review”" / "Ask before
  adding every word in the list", and the same for Remove.

Search doesn't look at section names, so each Flashcards group has
"flashcards" in its `data-search`.
- **Accordion** (since 2026-10-05): the sections start closed, and opening one closes the others.
- **Searching** opens every section with a match, and clearing the search closes those again
  (`data-search-opened`).

**Theme** (Display, added 2026-10-06): `theme` is one of `dark` (the default, the original
look), `charcoal`, `light`, `night` or `black`. Dim, Sepia and Match device (`system`) were added at first and removed
on 2026-10-07 at the user's request. A saved removed value shows as Dark, both in `applyTheme()`
and in the inline script.

- **Charcoal** (2026-10-13, the user's request: a best-practice dark theme beside Black). What the
  guidelines say, and how it follows them:
  - **WCAG 2 contrast:** text at least 4.5:1 (7:1 for AAA), large text 3:1, and the boundaries of
    controls (borders, outlines) 3:1 (1.4.11 Non-text Contrast). Charcoal: ink 11–14:1, secondary
    text 5.9–7.6:1, button text 9.5:1, borders 3.0–3.4:1, round-button outlines 4:1.
  - **Material Design's dark theme:** a dark grey page (#121212-ish), not black, which smears on
    OLED screens when scrolling and makes bright text glow (halation, worst for people with
    astigmatism); off-white text, not white (87% and 60% white for primary and secondary);
    surfaces lighter the higher they sit; desaturated colours, as saturated ones vibrate on dark.
    Charcoal: page #1b1c1f, panels #24262a and #2e3035, text #e8eaed, Google's softer
    green / yellow / red / blue for the ratings and tones, a paler orange accent. Its greys lean
    slightly blue, as Google's do (the user found neutral greys brownish on the iPhone).
  - **Apple's HIG** allows a true black base (Black follows that) but asks for 4.5:1, ideally 7:1.
  - A check (`contrast.py` in the session, ratios as above) also found Dark's borders at 1.2–1.3:1
    and its round-button outlines at 2.3:1, under the 3:1 rule. Raised the same day (the user's
    call): borders #5a6681 (3.0:1 on the panels, from #262b36), outlines #67738c (3.6:1), hover
    #76829c.
- **Control outlines (`--control-border`) apart from container borders** (2026-10-13, the user's
  call, for Light and then Night): buttons, inputs, the segmented rows, the topic button, ⚙, the
  answer and grade buttons, letter tiles, the reader's toggles, the settings' action buttons and
  switches (their "off" track) and the auto-play badge's ring are outlined at 3:1 on every
  background (page, panel and raised panel) in every theme; cards, panels, tables, rows and
  dividers keep `--border`, which may be fainter (Light and Night keep their soft ones, with the
  cards' shadows). Light: outlines #8a8782 (3.0–3.6:1), round buttons the same, the accent #9e5a00
  (4.5:1 on the raised grey, from #a35d00). Night: #79664e (3.0–3.5:1), round buttons #816c53.
  Dark #606d8a and Charcoal #727982 (their borders were 2.6–2.7:1 against the raised panel).
  `--border-strong` (hover, the switches' track was its old user) is a step stronger than the
  outline in every theme.
- **The list is darkest to lightest** (the user's call): Black, Night, Dark, Charcoal, Light, by
  page luminance (Night's page is a hair darker than Dark's).
- **Black** (2026-10-13, the user's request, after the Grok app): white text on a pure black page
  (`--bg` #000, no glow), panels just off black (#0a0a0a, #151515; #111 and #1c1c1c at first, darker
  at the user's request), borders #666 to set them apart (#262626, #333 and #444 were all too dark
  on the user's iPhone; now #626875), all the greys a little blue (the user found the theme
  slightly brown, likely the iPhone's True Tone warming neutral greys), secondary
  text a light grey, and the plain buttons' text lighter still (`--button-ink` #d6d6d6: the tabs,
  the segmented rows, ghost buttons; it's `--muted` in the other themes). A card's back is as dark as its
  front (`--card-back`; a shade lighter in the other themes), at the user's request
  (#b4b4b4, about 10:1 on black), the accent and rating colours a touch brighter. The status bar
  goes black too. On a phone the Settings page now has the page's background (it had the panel
  colour, from when it was a sheet), so its lists show as panels in every theme.
- **Palettes:** each theme is a set of CSS variables in `styles.css`. Dark is plain `:root`; the
  others are `:root[data-theme="…"]`. Every colour in the styles comes from a variable, including
  hovers, the top bar, the modal backdrop, the danger tints, `--on-accent` (text on accent
  buttons) and `--bg-glow` (the page gradient). A new theme is just a new block. Light themes
  also set `color-scheme: light`, so native controls (selects, checkboxes, scrollbars) match.
- **Applying it:** `applyTheme()` in `app.js` sets `data-theme` on `<html>`, or removes it for
  dark. It also sets `<meta name="theme-color">` (the iPhone status bar) to the theme's `--bg`. An
  inline script in `index.html`'s `<head>` applies the saved theme before first paint, so a light
  theme never flashes dark on load.
- **Contrast:** text is at least 5:1 against its panel in every theme (checked: ink 10–16:1;
  muted, accent and the rating colours 5–10:1).
- **Round icon buttons** (2026-10-10, the user's report from the iPhone): in Dark and Night the card's
  speaker, ⟳ and ก buttons and the ‹ › arrows were hard to see. They were `--panel-2` or `--panel`
  on the card with a `--border` outline, all within a shade of the card. They now use their own
  tokens: `--control` (fill, a step lighter than the card), `--control-line` (a visible outline)
  and `--control-ink` (brighter icons than `--muted`). Light keeps its old values. The arrows' hover
  now matches the card buttons (accent icon and outline).
- **Next (›) is filled with the accent** in every theme, like Recall's ⟳ before the answer, so it's
  clear what to press. It's plain again when disabled at the end of the list.
- **Rationale given to the user:**
  - No colour scheme is shown to improve memory directly.
  - Dark text on a light page reads more accurately (positive-polarity studies, e.g. Piepenbrock
    et al. 2013).
  - Softer contrast avoids halation, i.e. bright text blooming on black, worse with astigmatism.
  - Night is warm, dim and low in blue light for studying in bed, since sleep consolidates
    memories (cf. Chang et al. 2014 on evening screens).
  - "Hard-to-read fonts aid recall" (the disfluency effect) didn't replicate, so it isn't used.

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
  - The card's height grew with `--fs`, so the longest card (เหี้ย, about 175 characters) still
    cleared the corner buttons at the largest size. Since 2026-10-12 a phone's card is sized to the
    screen instead (sizeCards; see "Flashcards fit a phone screen"), and the text shrinks to fit it.
- **Default:** step 1, Larger (1.15), since 2026-10-18 (the user's call; see "Defaults: Thai at
  0.7×, text Larger"). Step 0, now called Medium, was the default from 2026-10-03, after notes and
  descriptions went from 12–13px to 14–16px.

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
  2. Add a checkbox with `data-confirm-setting="<name>"` to Settings, in the section of the page
     that asks (the Wordlists ones are in Wordlists).
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
- **Screen readers** read it as "to" (`role="img" aria-label="to"`). The one in the confirm
  dialog's "Settings → Wordlists" pointer is `aria-hidden`.
- **The one exception** is the "Next (→)" tooltip, since a `title` can't hold markup.

---

## Spelling (2026-10-06), `spell.js`

Every word and phrase card has a spell-aloud button (ก with sound waves, `spellIcon()`) that reads its
spelling aloud, lighting each part of the Thai as it's read. The spelling was also written out on the
card back (`#card-spelling`, `#review-spelling`) until 2026-10-09; the user found hearing it enough, so
that line went.
- **On the card:** bottom left (since 2026-10-07, at the user's request; it was bottom centre).
  🔊 moved to the top right, ⟳ stays bottom right, and the "1 / 24" badge is top left.
  - It's always on the back.
  - It's on the front only in Thai → English mode, where the front shows the Thai (added
    2026-10-06 at the user's request). In English → Thai mode the front is English, and spelling
    the Thai there would give the answer away.
- **In Wordlists:** on each row, between the Review button and the speaker.
- **Every card has a spelling** (2026-10-07, the user's call: "every word / letter has the icon").
  `isSpellable` is now simply "`letterSpelling` names something", which is true of all 5,787
  cards.
  - **Lone letters, marks and numbers:** a lone letter spells as its name (ก → ก ไก่), a mark on ◌
    as the mark's name (◌่ → ไม้เอก), and digits as names (555 → 5 ห้า · 5 ห้า · 5 ห้า; digits now
    show their name, like letters).
  - **The old rule was a bug:** it needed two or more consonants, meant to skip lone letters. That
    also skipped 235 one-consonant words, including ค่ะ, ไม่, ได้, ดี, ไป, แม่, น้ำ and นะ.
  - The school method covers 98.1% of cards; the rest use letter names.
- **Three styles** (Settings → Audio → Spelling since 2026-10-07, was Display; `settings.spellingStyle`):
  - **School method (`school`):** สะกดคำ. Each syllable is built up: consonant sound +
    vowel name (+ final sound) → syllable, then the tone mark's name and the toned syllable.
    Words of several syllables end with the whole word; a phrase spells word by word and ends with
    the whole phrase.
    - บ้าน: บอ – อา – นอ – บาน – ไม้โท – บ้าน
    - สบาย: สอ – อะ – สะ · บอ – อา – ยอ – บาย · สบาย
  - **Letter names, as written (`letters`; the default from 2026-10-06 to 2026-10-09, when the
    `spelling-letters` migration moved saves off the school method):** dictation. Every symbol in
    written (typing) order by its name, so leading vowels come first.
    ข้าว: ข ไข่ · ไม้โท · สระอา · ว แหวน.
  - **Letter names, vowels whole (`vowels`, `vowelSpelling`; added and made the default on
    2026-10-09, the user's request; the `spelling-vowels` migration moves saves on `letters`):**
    - **Why:** as written, a vowel in several parts was named piece by piece. เรียน was
      สระเอ · ร เรือ · สระอี · ย ยักษ์ · น หนู, which hides that เ-ีย is one vowel, and the ย ยักษ์
      sounds like a consonant.
    - **Each syllable:** its consonant(s), its vowel named once (all its parts light up together),
      the final and any silent letters in written order, then the tone mark, with a syllable pause
      between syllables. เรียน: ร เรือ · สระเอีย · น หนู. เพื่อน: พ พาน · สระเอือ · น หนู · ไม้เอก.
    - **Which vowels are named whole:** `WHOLE_VOWELS`, the vowels written in several parts: เ-ะ,
      แ-ะ, โ-ะ, เ-าะ, เ-า, เ-อะ, เ-อ, เ-ียะ, เ-ีย, เ-ือะ, เ-ือ, -ัวะ, -ัว and -ือ. It also covers
      the short forms before a final: เ-็ (เป็น, สระเอะ), แ-็ (แข็ง, สระแอะ) and เ-ิ (เดิน, สระเออ).
      เลย is ล ลิง · สระเออ · ย ยักษ์, because เ-ย is เออ with ย as its final.
    - **Named part by part, as before:** a one-part vowel (สระอา, ไม้หันอากาศ, and อ อ่าง in ก่อน
      or ว แหวน in สวน, as Thais name them), ็อ (ล็อก), รร and ไ-ย.
    - **How:** it uses the school method's reading of the word (`reading()`, split out of
      `schoolSpelling`). Each syllable records where its onset (`onAt`) and its vowel's part of
      the word (`vAt`) are. So it covers the same 98.1% of cards and falls back to as-written for
      the rest. A hidden vowel (คน, สบาย's สะ) has nothing written, so nothing is named for it. A
      reused letter (ผลไม้'s ล) is named once. ๆ is named where it's written.
    - **Audio:** 13 new parts (the whole-vowel names, such as สระเอีย), so 4446 became 4459.
    - **Lighting:** a step whose characters aren't all neighbours (a vowel written round its
      consonant) gets a box on each part (`lightParts`), so the consonant between them stays
      unlit. One box round ีย would have covered the ร under the ี.
    - **Checked** in the reader's pop-up on โรงเรียน and เพื่อนบ้าน, in headless Chromium. With no
      saved setting it used the new style, and a saved school-method setting was kept.
      Flashcards and Recall still light each step.
    - **Tapping a part of a whole vowel** (2026-10-10, the user's request): it says the whole
      vowel and lights all its parts. In เช้า, tapping เ or า says สระเอา; ช and the tone mark are
      named as before. This works in the pop-up and on Flashcards and Recall (`tappedPart`). Whole
      steps are marked `vowel: true` in spell.js. With spelling set to "Letter names, as written",
      a tap still names just the part it hit.
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
  - **Pace** (2026-10-06, the user found it slow): `SPELL_STEP_PAUSE` (180 ms) between parts and
    `SPELL_SYLLABLE_PAUSE` (450 ms) between syllables and words. That's all the gap there is,
    because the part recordings are trimmed (below). Before, every part was a 1.87 s clip with
    about 0.4 s of speech, so there was 1.4 s or more of silence after each letter.
  - **Parts are fetched up front** (`fetchSpellingParts`, 2026-10-07). Pressing the button fetches
    all of the word's parts at once, in parallel, as blob URLs, and each plays as the one before
    ends. Before, each part was loaded only when its turn came, by the `<audio>` element through
    the service worker, so every letter waited on a request.
    - **Test:** 400 ms of network latency, nothing saved, สวัสดี (6 parts). Old: 8.0–8.3 s, with
      1.4–1.5 s between letters. New: 6.1–6.3 s, with about 1.0 s between letters; with no
      latency it takes 5.6 s.
    - A part that fails to fetch falls back to `speakAndWait`. The blob URLs are revoked when the
      spelling ends.
  - **Stopping:** while a spelling plays, its buttons get `.playing` (accent colour, pulsing
    waves, `aria-pressed`). Pressing a spell button for the word being spelled stops it. Any
    other audio stops it too, and so does moving to another card, even in English → Thai, where
    the move itself is silent.
- **Recordings are per part, never per word** (the user's call):
  - `node tools/spelling.mjs --write` lists every distinct spoken step across all cards and both
    styles (letter names like กอ ไก่, sounds, vowel and tone-mark names, syllables, the words of
    phrases): 4060 parts, then 4113 once every card had a spelling. The 53 added were mostly
    one-consonant syllables, plus the letter names ฃ ขวด, ฅ คน and ฌ เฌอ.
  - `tools/gen_audio.py` records them under `sp`, so a part never clashes with a card's text. For
    example, the vowel step อา isn't the Thai Script card อา, whose recording says สระอา.
  - Recordings are named by what's said, so a part that's also a card word reuses that file.
    Only 2465 were new.
  - **Trimmed** (2026-10-06): edge-tts pads every clip with about 0.2 s of silence before and
    1.2–1.5 s after.
    - `gen_audio.py` cuts parts to 0.03 s before and 0.1 s after the speech. It uses ffmpeg
      `silenceremove` at −50 dB peak, once forwards and once on the reversed clip, then re-encodes
      at edge-tts's own 24 kHz mono 48 kbit/s. Clips went from 1.87 s to about 0.4–0.9 s, and
      checks with `silencedetect` showed no speech lost.
    - A trimmed part has its own name (`trimmed_name`, `trim` in the hash). That way a card's
      recording of the same text stays untrimmed, and phones that cached the old part fetch the
      new one.
    - It's made from the untrimmed recording when one exists, else from a throwaway recording.
    - Card recordings stay untrimmed: their trailing silence is the gap between words in Read
      all.
- **Card back layout:**
  - The back's text sits in `.face-body`: centred when it fits, scrolling when it doesn't, with
    the corner buttons fixed.
  - Spacer pseudo-elements do the centring, because `justify-content: center` would cut off the
    top of overflowing content.
  - The longest spelling (about 280 characters, an idiom) fits a 390px phone without scrolling.
- **Check coverage after content changes:** `node tools/spelling.mjs --failed 60` lists words
  that fall back; `--samples --random` prints spellings to eyeball.

## Audio / TTS (2026-10-02)

**Auto-play on/off** (2026-10-09, the user's request). Normally a card says its Thai by itself
when it shows it. The user wanted that off when learning to recognise letters, because the sound
gives the answer away: ก ไก่ says "chicken".
- **The control:** a small **A** badge on the edge of each card's speaker (`.auto-badge`, on
  Flashcards' card and Recall's, front and back). Filled means on; grey with a slash means off.
  Tapping it toggles pref `autoPlay` (default on) and shows a toast. The speaker itself still plays
  on demand.
- **What it gates:** `autoPlayOn()` covers every auto-play call. On Flashcards' card that is
  showing a card, flipping it, and answering in Recognition. On Recall it is presenting a card,
  revealing the answer, and turning the card.
- **Listen:** auto-play is always on, because the sound is the question, and its A is hidden.
- **Hiding:** an A also hides with its speaker, as on Recall's English → Thai front
  (`renderAutoBadges`).
- **Keys:** the card's keydown now ignores keys aimed at buttons on it. Before this, Enter on the
  speaker or the ⟳ also flipped the card.
- **Tested:** headless Chromium at phone and desktop sizes. The test uses real clicks, because
  auto-play needs a user gesture and scripted `.click()` doesn't count as one. It counted plays
  in each mode and direction.

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
  - **It did break once** (2026-10-14): every request got HTTP 403 at the websocket handshake,
    even a single one. The clock was right; the client's Edge version string was what Microsoft
    now refused. `pip install -U edge-tts` (7.2.8 → 7.3.1, with the user's OK) fixed it. A 403 on
    everything means: upgrade first.

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

- **Tap-to-play Thai in notes and topic paragraphs** (2026-10-08, the user's pick from "what
  else"). 576 notes had an example like ยิ่งเร็วยิ่งดี = the sooner the better that could be read but
  not heard.
  - **What plays:** each run of Thai words in a card's `note` or a topic's `about` is a tap target
    (`.say`, dotted underline, accent while playing). This works on the Topics list, the Browse
    and Recognition card back, the Recall card back and the paragraphs. The tap stops propagation,
    so it never flips a card.
  - **What doesn't:** a run is playable if it has a consonant, doesn't start with a vowel or tone
    mark (a spelling note's –ือ), and isn't a list of one- or two-letter items (ด ต ถ ท ธ …).
  - **The rule lives twice,** in `THAI_RUN` / `playableThai()` in app.js and `THAI_RUN` /
    `playable_thai()` in gen_audio.py. Keep them in step. On 2026-10-08 both picked the same
    1441 runs, checked by a script.
  - **Recording:** gen_audio records each run under manifest `th`, like a card's Thai, so
    `speakAndWait(run, 'th')` finds it. A run that is a card's Thai keeps that card's sample,
    so a lone letter says its name. About 700 new clips, roughly 8 MB. The offline download takes
    every manifest clip, so it includes them.

- **Setting:** `settings.audioSource`, either `'samples'` (default) or `'browser'`. It's under
  Settings → Audio → **Voice**. The help text shows per-language coverage (e.g. "Thai 975 of 975"),
  which is a quick way to tell whether the generator needs re-running.
- **Loading:** `loadAudioManifest()` is fetched alongside `decks.json` in `init()`. A missing or
  broken manifest gives empty maps, so everything falls back to TTS and nothing breaks.
- **Playback:** `speakAndWait(text, lang)` plays the sample when the setting is `samples` and the
  manifest has the text. If there's no sample, or the file fails to load, it falls back to
  `ttsAndWait()` (browser TTS).
- **Mute** (Settings → Audio, 2026-10-17): `playSample()` and `ttsAndWait()` resolve at once and
  play nothing; see "Mute (2026-10-17)".
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
- **Thai speed:** `settings.thaiSpeed` is a multiplier from 0.5 to 1 (default 0.7 since 2026-10-18; 1 before), set under
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

## Thai font (2026-10-07), `fonts/`

The user found Thai "stylised" in Firefox on Linux. The font list ended with "Noto Sans Thai", the
modern **loopless** style, and Linux browsers picked it. iPhones use Thonburi, which is looped.
Now a looped face is embedded, as a file in the app rather than from a CDN (the user's wish), so
it's the same everywhere and works offline.

- **Two fonts, Settings → Display → Thai font** (`settings.thaiFont`): **Looped** (Noto Looped
  Thai, the default) or **Loopless** (Noto Sans Thai, the modern style, added at the user's
  request).
  - Each comes in Regular and Bold, under the SIL Open Font License 1.1 (`fonts/OFL.txt`, which
    holds both copyright lines and the licence text; Noto has no reserved name).
  - `data-thai-font="loopless"` on `<html>` switches `--thai-font`, which leads body's
    `font-family`. It's set by `applyThaiFont()`, and before first paint by the inline script in
    `index.html`, which also sets the theme. Reset settings goes back to Looped.
  - Only the looped Regular is preloaded.
  - Taken from the system's fonts-noto package and cut down with fontTools (`fontTools.subset
    --unicodes=U+0E00-0E7F,U+25CC --layout-features='*' --no-hinting --flavor=woff2`).
  - The result is about 10 KB per weight for looped and 8 KB for loopless, against 65–70 KB for
    the full fonts.
- **`@font-face` "Learn Thai Looped" and "Learn Thai Loopless"** in `styles.css`: Regular
  covers weights 100–500 and Bold 600–900. The `unicode-range` covers the Thai block and ◌, so only Thai characters use it and
  everything else stays in the system font.
  - It comes first in body's `font-family`, and "Noto Sans Thai" was removed.
  - `button, input, select, textarea { font-family: inherit }`, because buttons don't inherit by
    default and Thai shows up in them (Test answers, search boxes).
- **Loading:** `<link rel="preload" … crossorigin>` for the looped Regular. All four files are in
  `sw.js`'s SHELL, with the cache bumped to v5.
- **Checked in Chromium** with `CSS.getPlatformFontsForNode`: card Thai renders in Noto Looped
  Thai Bold (the embedded file), Test answers and Wordlists in Regular, and English text in the
  system font. Switching to Loopless gave Noto Sans Thai (the embedded file), applied before first
  paint after a reload. All four files were in the offline cache.
- **Looped font replaced, 2026-10-08:** it dropped tone marks.
  - **What I saw:** writing the Little Stories, เสือ เสื้อ เสื่อ showed as three "tigers".
  - **The bug:** Noto Looped Thai **1.00** (Debian's fonts-noto-core 20201225, the source of the
    files) positions a tone mark over an upper vowel (ิ ี ึ ื) 283 units *down*, onto the vowel,
    in its GPOS. So ่ vanished (นี่ → นี, ที่ → ที, ชื่อ → ชือ, เสื่อ → เสือ) and ้ collided with
    the vowel.
  - **Where:** this was in the font itself, not the trimming (HarfBuzz `hb-shape` / `hb-view` on
    the full .ttf did the same). It showed on every page since the font came in on 2026-10-07,
    on iPhone too.
  - **The fix:** the current release, **Noto Sans Thai Looped 2.000** (renamed upstream; from
    Google Fonts, `fonts.gstatic.com/s/notosansthailooped/v16`), places them correctly, ไม้ตรี
    and ไม้จัตวา included. It's trimmed the same way and saved under the old file names, so
    `styles.css`, the preload and `sw.js`'s SHELL list are unchanged.
  - **Other changes:** `SHELL_CACHE` went to v7 so installed copies fetch the new files, and
    `fonts/OFL.txt` has the 2022 Noto Project Authors copyright.
  - **Loopless** (Noto Sans Thai 2.000) was always fine.

## Phone layout (2026-10-03), `mobile.css`

`mobile.css` is loaded with `media="(max-width: 600px)"` after `styles.css`, so desktop is
untouched. It fixes what made the app cramped on iPhone:

- **Top tabs larger** (2026-10-08, the user's request). Topics | Flashcards were 13px everywhere
  (12px at ≤340px). They're now 16px on desktop, 15px on phones and 14px at ≤340px, with a little
  more padding. There's room since Review stopped being a third tab. The top bar's spare width,
  measured in Chromium, is 49px at 320, 55 at 360, 70 at 375 and 77 at 390. That's still above
  the ~30px kept for iOS's wider font from 375px up.
- **A third tab, Reading** (2026-10-08). The title became "Home" (was
  "Learn Thai") to make room. Spare width is now 15px at 320, 18 at 360, 33 at 375, 36 at 390
  and 76 at 430. That keeps the ~30px margin on iPhones (375 and up) but is tight on 320–360px
  screens.

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
  The header row stays as a compact bar of column names.
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

- **Card Thai is about 15% larger** (2026-10-07, at the user's request), on Flashcards and Review:

  | Text | Desktop | Phone |
  |---|---|---|
  | `.thai` (card front, Review prompt) | `clamp(46px, 8vw, 92px)` | `clamp(36px, 36px + (100vw − 320px) × 0.18, 64px)` |
  | English → Thai answer (`.english.back-th`) | up to 69px | about 40px |
  | Test answer buttons (`.thai-pill`) | 32px | 27px |

  - **The phone size rises with screen width:** 36px at 320 (unchanged, since long phrases only
    just fit there), 49px at 390, 56px at 430.
  - **`fitCardText()`** shrinks the front's text a step at a time (to 70% at most) while it
    overflows the fixed-size card: a long phrase on a small screen, or a large Text size.
    - It runs after `renderCard`, on coming to Flashcards, on resize and Text size changes, and
      when fonts finish loading (`document.fonts` `loadingdone`). The embedded Thai font can
      arrive after the first fit, and it's larger than the fallback.
    - **Checked** against all 5,787 Thai strings: everything fits at full size at 390px and on
      desktop. On a 375×667 iPhone SE, การเปลี่ยนแปลงสภาพภูมิอากาศ shrinks to 43px.

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
  - **Audio** is served from the saved-clip store when it's there, else fetched and saved. Clip
    names are content hashes, so a saved clip never goes stale.
  - **Byte ranges:** Safari's `<audio>` requests byte ranges and won't play a plain 200, so
    `rangeResponse()` answers a `Range` header with a 206 sliced from the saved file.
  - **The saved-clip store is IndexedDB, not Cache Storage** (2026-10-07). `audio-store.js`
    defines `self.ClipStore` (`get`, `put`, `keys`, `delete`, `clear`) over database
    `learnthai-clips`, store `clips`, file name → the MP3's bytes (ArrayBuffer). `sw.js` loads it
    with `importScripts`, and the page with a classic `<script>` before `app.js`. It's in SHELL.
    - **Why:** every iPhone launch took 14 s once all 16,036 clips were saved: Settings → App →
      Launch time showed 14 s already at "from saved copy", before any of the app's code ran.
      With the downloaded audio deleted it was 0.04 s. Safari seems to read through a site's
      whole Cache Storage when the worker first opens it. IndexedDB looks a clip up by key.
    - **Moving over:** nothing is copied, so the user downloads again. The worker deletes the
      old `learnthai-audio` cache when it activates (shell cache bumped to v6). The old worker's
      last fetches can recreate it (seen in Chromium), so `syncOfflineAudio()` also deletes it
      once (`prefs.oldAudioCacheGone`).
    - **Tested in Chromium:**
      - Upgrading from the live version (served from a scratch copy, then replaced with the new
        files) deletes the old cache, and the new worker saves clips into IndexedDB.
      - With the server's audio taken away, a saved clip plays: a 200 of the right size, and a
        206 for `Range: bytes=0-1`. An unsaved clip gives a 404.
      - "Download all audio" saves all 16,036 clips (161 MB). Launch at CPU ×4 is unchanged
        (ready at 0.3 s).
      - The launch sync deletes a clip no card uses, and Delete empties the store.
      - Headless Chromium never showed the slow launch, so the real check is the iPhone.
- **Offline audio** (Settings → Audio, the last setting; it was under App until 2026-10-07, when
  the user asked to move it). The count is read when the section holding it opens, found with
  `closest('details')`, so moving it needed no code change.
  - Every clip that passes through the worker is cached, and `preloadDeckAudio()` fetches a whole
    deck, so opening a deck saves its audio.
  - **Spelling parts too** (since 2026-10-06): the parts a topic's cards use in the current
    style. These go only into the worker's audio cache, not the in-memory one, so they never evict
    the topic's own clips. The order is now Thai, parts, English (see the audio queue below).
  - **One audio queue** (2026-10-07, the user's request: the page's clips should come first).
    `audioQueue` fetches clips with `AUDIO_JOBS` (6) workers. It starts only once `launched` has
    resolved.
    - **Front:** what's on screen. `preloadDeckAudio()` queues a topic, or a Review session's
      cards: Thai words, then their spelling parts in the current style, then English, via
      `queuePageAudio()`. Thai and English are also kept in memory (`keep` → `sampleCache`).
    - **Skipped when already loaded:** in memory for `keep` items; in `offline.have` (when known)
      for the rest.
    - **A new page replaces the last page's unfetched items,** unless "Download all" also wants
      them.
    - **Back:** "Download all audio" queues every unsaved clip (`queueBulkAudio()`, `bulk` items).
      So opening a topic mid-download jumps its clips ahead.
    - **Checked in Chromium:** switching topic during Download all gave the next fetches as the
      topic's 21 Thai, 6 letters and 20 English, then the bulk resumed.
    - **Capped at `PRELOAD_MAX` (80) words** (2026-10-07). The user reported a 10s load on the
      phone, and a whole-category scope preloaded every word: 1,216 clip fetches at launch for a
      593-word category, busy for about 4s even on a desktop.
      - **Big scopes** now take their Review words (what Flashcards shows) first, then the top of
        the Topics page; the rest play on demand.
      - **Result:** 203 fetches, done by 1.5s at CPU ×4. A single topic is unaffected.
  - **"Download all audio"** goes through that queue, with a progress bar, and calls
    `navigator.storage.persist()`.
    - **Resumable:** cached clips are skipped.
    - **Stop** clears `settings.offlineAudio` and drops the queued bulk items
      (`stopDownloadAll`). A run ends (`finishDownloadAll`) when the queue's last worker finds it
      empty.
    - **Delete downloaded audio** clears the store (`ClipStore.clear()`).
  - **The Settings text always leads with "X of Y clips saved"** (2026-10-07). The user saw a
    blank section, just the two buttons, after reopening the app.
    - **Cause:** `renderOffline()` re-read the cache's keys on every render. On an iPhone with
      thousands of clips that takes seconds, and the startup prune and topic preloads read them
      too. Until a read finished, the HTML's blank starting state showed.
    - **Now `offline.have`** (the cached file names) is read once per visit: `readSavedAudio()`,
      shared by every caller while under way. Downloads, the topic preload and deletes keep it up
      to date.
    - **`renderOffline()` is synchronous.** Until this visit's read finishes it shows the last
      count, kept in `prefs.offlineSaved`, as "…, checking…". The HTML starts as "Checking saved
      audio…".
    - **The read happens only when its Settings section is open** (its `toggle` event), or when a sync
      or download needs it. It never happens at launch.
    - **"Download all audio"** switches to Stop and "Checking which of the N clips are already
      saved…" at once.
    - **The MB figure** (`navigator.storage.estimate()`) fills in when it arrives. It's hidden
      while downloading, since it isn't refreshed then, and when nothing is saved, since it lags
      behind a delete.
    - **Size estimate:** `AVG_CLIP_KB` is 9.8 (156 MB for 16k clips after the spelling parts were
      trimmed).
    - **Clips the worker saves during plain playback** count from the next visit's read.
- **Keeping the cache in step** (`syncOfflineAudio()`, 3 s after launch):
  - It deletes saved clips that the manifest no longer lists, in one transaction.
  - **Skipped when nothing changed** (2026-10-07). `audioListSignature()` is an FNV-1a hash of the
    manifest's file list. `prefs.audioPruned` holds the signature last pruned for, and
    `prefs.audioComplete` the one last fully downloaded for (cleared by Delete). A launch reads
    the cache only if the list changed, or if a "Download all" is unfinished.
  - If `offlineAudio` is set, it downloads any missing clips, so new cards' audio arrives
    automatically.
- **Launch** (2026-10-07; the user saw about 4 s of blank screen on iPhone):
  - **Not reproducible in Chromium.** First paint was about 0.1 s even at CPU ×4. The static
    HTML already shows the home screen, and nothing in `<head>` blocks.
  - **Launch work moved off the critical path,** because the iPhone's storage is slow with
    thousands of cached clips:
    - The cache key reads moved out of launch: the startup sync is deferred and usually skipped
      (see above), and the topic preload no longer checks the saved list first.
    - The audio queue (topic preloads, Download all) waits for `launched`, which resolves 1 s
      after the load event.
  - **Result at CPU ×4:** no long tasks (was up to 454 ms), with the home screen ready at about
    0.22 s.
  - **Settings → App → Launch time** reports this launch, from the Navigation Timing entry: when
    the page arrived from the worker's saved copy or the network, the first frame
    (`window.firstFrameAt`, from a `requestAnimationFrame` in `<head>`), and `app-ready` (a
    `performance.mark` at the end of `init()`).
    - Times count from the start of navigation. If they're far below what the user sees, the rest
      is iOS starting the app's processes, before any of our code runs.
  - **The real cause was the saved audio** (2026-10-07). Every launch took 10–14 s on the
    iPhone, with "from saved copy" already at 14 s, and 0.04 s once the downloaded audio was
    deleted. The clips moved from Cache Storage to IndexedDB (see the service worker section).
- **Backup** (Settings → App, 2026-10-07): **Export** and **Load**.
  - **Export** writes the whole store (settings, prefs, items, daily, reviewWords,
    settingsMigrations) as `learnthai-backup-YYYY-MM-DD.json`:
    `{ format: 'learnthai-backup', version: 1, exported, data }`.
    - On iPhone it uses the share sheet (`navigator.share({ files })`, "Save to Files"), since a
      download link in a Home Screen app may just preview the file. Elsewhere it's an `<a
      download>`.
  - **Load** (a hidden file input) checks the format and that the main parts are objects, then
    asks before replacing.
    - The `danger` confirm shows the backup's date and "N words in Review, progress on M", for the
      backup and for this device.
    - It replaces the store (no merging: predictable when moving devices) and reloads the app. A
      `sessionStorage` note shows "Backup loaded" after the reload.
    - A wrong or unreadable file gets "That file isn't a Learn Thai backup".
  - **Not included:** downloaded audio (the cache), since it can be downloaded again.
  - **Tested in Chromium:** export, wipe, load, cancel, a wrong file and a corrupt file. The
    iPhone share-sheet path hasn't been tried.
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
- **Each noun's classifier on its card** ("counted with เล่ม"), as Thai dictionaries give it: offered
  on 2026-10-18 with the classifier topics, not chosen yet. A field on noun cards and a line on the
  card, common nouns first.
- **Story audio keeps growing.** Every story sentence is its own recording, on top of each card's,
  so each new story adds about six. data/audio was 273 MB on 2026-10-08 and 412 MB (about 32K
  files) on 2026-10-18. The user (2026-10-08): "we need to do something about the story samples.
  We may need to trim and reuse words — not yet though." Don't change the scheme until they pick
  it up. Options to raise then: play a sentence by chaining its word clips, trim the silence,
  drop clips for short sentences, prune stories that add no new words.
