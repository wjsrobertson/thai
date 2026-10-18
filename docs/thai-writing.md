# Writing Thai

Check every Thai line you write or approve against this list: story lines, card glosses, phrases
and examples. The learner copies what the app shows, and AI-written Thai drifts towards English
structure. Ask of each line: "would a Thai say this, here, to these people?" A natural sentence
with fewer target words beats one crammed with them.

The list comes from the 2026-10-09 review of all 1,005 Reading stories, which rewrote 1,132 lines
in 614 of them (docs/implementation-notes.md, "Stories for every topic" → Thai naturalness review).
These are the mistakes it kept finding.

## Linking clauses

- Missing links: ก็, เลย, จน, พอ…ก็, เวลา…ก็, ส่วน (as for), แถม…อีก (on top of that), ถ้า…ก็,
  สุดท้าย…ก็.
- A "so" เลย needs a space before it: ไม่ดี เลยต้อง…. Without the space, ไม่ดีเลย reads as "not
  good at all".
- Two clauses run together with no space between them.
- Stiff chains of และ in casual speech. Use แล้วก็ or กับ there, or nothing. A line that starts
  with และ is a calque.

## Speech

- Dialogue needs the particles real speakers use: ครับ/ค่ะ/คะ/นะ/จ้ะ/สิ/หรอก/เหรอ/ล่ะ. They must
  suit the speaker's gender and the relationship (customer, doctor, child to parent, police,
  friends). Narration needs none.
- Sentence-final particles (ล่ะสิ, ชิมิ, อะ, โว้ย) never open a line.

## Calques

- English word order: หัวปวด → ปวดหัว; กล้ามเนื้อปวด → ปวดกล้ามเนื้อ.
- "By" or "with" + a thing is rarely ด้วย: ไปทำงานด้วยรถเมล์ → นั่งรถเมล์ไปทำงาน. Use
  นั่ง/ใช้…/เอา…มา…/ทาง/โดย.
- Others that came up:
  - มีน้ำตา → น้ำตาไหล
  - ร้องไห้ด้วยความสุข → ดีใจจนร้องไห้
  - ของฉัน where it's obvious
  - "X is important" → เรื่องนี้สำคัญ
  - "in CC" → สำเนาถึง
  - X มี Y for "X has Y" about places
- Too many pronouns. Thai drops subjects and objects that are clear from context.

## Grammar and word pairings

- Noun + number + classifier (โน้ตแปดตัว, คนเมาสองคน), with the right classifier.
- After มี or เป็น, an activity takes การ: มีการปะทะ, เป็นการหลอกลงทุน.
- Aspect words: จะ for the future, แล้ว for a change of state, มา…แล้ว for duration, กำลัง…อยู่.
- Direction words: ไป, มา, ขึ้น, เข้า.
- Verb–noun pairs: ส่องกระจก; สีซอ, ตีกลอง, เป่าขลุ่ย; แต่งกลอน; เหยียบคันเร่ง; ยิงประตูได้;
  ออกใบสั่ง; ขว้างระเบิด; เมาหนัก.
- Set phrases: จับผิดคน (จับคนผิด means "arrest the guilty one"); ไม่ต้อง means "no need", not
  "not allowed" (that's ห้าม); ร้องเพลงไม่เป็น.

## Register

- News: เกิดเหตุ…, ผู้เสียชีวิต … ราย, ทราบ, คาดว่า, พบศพ.
- Courts and formal letters use formal verbs.
- Royal vocabulary: ทรง + verb, but never ทรง before a verb that's already royal (ทอดพระเนตร);
  ขบวนเสด็จ; ทำบุญถวาย. A king ทรงช้าง, never ขี่.

## Content

- No lines that string vocabulary together. Build a real sentence, or split it into two lines.
- Slang is used the way Thais really use it; don't string slang terms together.
- Check facts, numbers and logic: sums, ranks, units, plot order, Thai customs. Don't present
  outdated facts as current. The review fixed about 40 wrong facts.

## Cards

- **Check slang against sources before removing a card.** The 2026-10-09 review doubted about 50
  slang cards; checked against Thai sources, nearly all were real, and only two were removed
  (docs/implementation-notes.md, "Missing cards and card fixes").
- **Phrase cards:** keep a line a card is anchored to verbatim, but say when it's unnatural.
- **A new sense of a word that has a card** is a new card in a fitting topic, which the story then
  `pick`s. When a word has several cards, `tools/stories.py add` says which sense it took; check it.
- **Re-run `python3 -u tools/stories.py coverage` after editing a story.** A fix can drop a topic
  below 5 stories when the story only matched it by accident.

## Large batches

A parallel review worked well for the 2026-10-09 review: agents each took a share of the stories,
from a written brief and a validator, and every proposal was read before it was applied. Keep the
brief and validator in `tools/`, not a scratchpad.
