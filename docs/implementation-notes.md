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
- **อย่าอยู่อย่างอยาก,** a card in Clusters & Odd Spellings: the four silent-อ words.
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
  - **Tone Pairs: Five Tones & Common Words:** คา ข่า ค่า ค้า ขา, ไม่ ไม้ ใหม่ ไหม ไหม้, มา ม้า หมา,
    ขาว ข้าว ข่าว, ใกล้ ไกล.
  - **Tone Pairs: Body, Family & Animals:** เสือ เสื้อ เสื่อ, ปา ป่า ป้า, นา หน้า น้า หนา, คอ ขอ ข้อ,
    ปู ปู่, เข่า เข้า เขา.
  - **Tone Pairs: Everyday Words:** หา ห้า ฮา, สวย ซวย, ซื้อ สื่อ ซื่อ, น้ำ นำ, ช้า ชา, ยา ย่า หญ้า, ไฟ ไฝ.
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

**Wordlists** shows the topic as a sortable table, and each row has a 🔊 button. The filter box
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
  are no headings while sorted by a column. The header reads "Basics — All 19 topics".
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
    - **Each story** shows its title and description, then on the right a ✓ once opened (prefs
      `readingDone`) and its level, flush right (moved there from beside the title at the user's
      request). The matched words were shown as chips at first; the user had them removed.
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
look), `light` or `night`. Dim, Sepia and Match device (`system`) were added at first and removed
on 2026-10-07 at the user's request. A saved removed value shows as Dark, both in `applyTheme()`
and in the inline script.

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
