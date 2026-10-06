// Spelling a Thai word aloud, two ways (see docs/implementation-notes.md → Spelling):
//
// - letterSpelling: dictation. Every symbol in written (typing) order by its name:
//   ข้าว → ข ไข่ · ไม้โท · สระอา · ว แหวน.
// - schoolSpelling: the school method (สะกดคำ). Each syllable is built up from its sounds, then
//   the tone mark and the toned syllable: ข้าว → ขอ – อา – วอ – ขาว – ไม้โท – ข้าว. A word of several
//   syllables ends with the whole word.
//
// Thai writing doesn't mark syllable boundaries or every vowel (คน = kh-o-n, สบาย = สะ-บาย, ผลไม้
// reuses its ล), so schoolSpelling tries every reading the spelling allows and keeps the one whose
// sounds match the card's transliteration. If none matches it returns null, and callers use the
// letter names instead: a wrong school spelling is worse than none.
//
// Each step is { show, say }: `show` is displayed, `say` is spoken and keys the step's recording
// (manifest section `sp`, made by tools/spelling.mjs + tools/gen_audio.py).

// Consonant: [class, initial sound, final sound, name word]. Sounds follow the app's transliteration.
const CONSONANTS = {
  ก: ['M', 'g', 'k', 'ไก่'], ข: ['H', 'kh', 'k', 'ไข่'], ฃ: ['H', 'kh', 'k', 'ขวด'], ค: ['L', 'kh', 'k', 'ควาย'],
  ฅ: ['L', 'kh', 'k', 'คน'], ฆ: ['L', 'kh', 'k', 'ระฆัง'], ง: ['L', 'ng', 'ng', 'งู'], จ: ['M', 'j', 't', 'จาน'],
  ฉ: ['H', 'ch', 't', 'ฉิ่ง'], ช: ['L', 'ch', 't', 'ช้าง'], ซ: ['L', 's', 't', 'โซ่'], ฌ: ['L', 'ch', 't', 'เฌอ'],
  ญ: ['L', 'y', 'n', 'หญิง'], ฎ: ['M', 'd', 't', 'ชฎา'], ฏ: ['M', 't', 't', 'ปฏัก'], ฐ: ['H', 'th', 't', 'ฐาน'],
  ฑ: ['L', 'th|d', 't', 'มณโฑ'], ฒ: ['L', 'th', 't', 'ผู้เฒ่า'], ณ: ['L', 'n', 'n', 'เณร'], ด: ['M', 'd', 't', 'เด็ก'],
  ต: ['M', 't', 't', 'เต่า'], ถ: ['H', 'th', 't', 'ถุง'], ท: ['L', 'th', 't', 'ทหาร'], ธ: ['L', 'th', 't', 'ธง'],
  น: ['L', 'n', 'n', 'หนู'], บ: ['M', 'b', 'p', 'ใบไม้'], ป: ['M', 'p', 'p', 'ปลา'], ผ: ['H', 'ph', null, 'ผึ้ง'],
  ฝ: ['H', 'f', null, 'ฝา'], พ: ['L', 'ph', 'p', 'พาน'], ฟ: ['L', 'f', 'p', 'ฟัน'], ภ: ['L', 'ph', 'p', 'สำเภา'],
  ม: ['L', 'm', 'm', 'ม้า'], ย: ['L', 'y', 'y', 'ยักษ์'], ร: ['L', 'r', 'n', 'เรือ'], ล: ['L', 'l', 'n', 'ลิง'],
  ว: ['L', 'w', 'w', 'แหวน'], ศ: ['H', 's', 't', 'ศาลา'], ษ: ['H', 's', 't', 'ฤๅษี'], ส: ['H', 's', 't', 'เสือ'],
  ห: ['H', 'h', null, 'หีบ'], ฬ: ['L', 'l', 'n', 'จุฬา'], อ: ['M', '', null, 'อ่าง'], ฮ: ['L', 'h', null, 'นกฮูก'],
};

// Every other symbol's name, for letter spelling.
const SYMBOL_NAMES = {
  ะ: 'สระอะ', 'ั': 'ไม้หันอากาศ', า: 'สระอา', ำ: 'สระอำ', 'ิ': 'สระอิ', 'ี': 'สระอี', 'ึ': 'สระอึ', 'ื': 'สระอือ',
  'ุ': 'สระอุ', 'ู': 'สระอู', เ: 'สระเอ', แ: 'สระแอ', โ: 'สระโอ', ใ: 'สระใอ ไม้ม้วน', ไ: 'สระไอ ไม้มลาย',
  ๅ: 'ลากข้าง', '็': 'ไม้ไต่คู้', '่': 'ไม้เอก', '้': 'ไม้โท', '๊': 'ไม้ตรี', '๋': 'ไม้จัตวา', '์': 'การันต์',
  ๆ: 'ไม้ยมก', ฯ: 'ไปยาลน้อย', 'ฺ': 'พินทุ', 'ํ': 'นิคหิต', ฤ: 'ฤ', ฦ: 'ฦ',
};
const SYMBOL_SAY = { ฤ: 'รึ', ฦ: 'ลึ' };
const DIGIT_NAMES = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
const TONE_MARKS = { '่': 'ไม้เอก', '้': 'ไม้โท', '๊': 'ไม้ตรี', '๋': 'ไม้จัตวา' };

const isConsonant = (ch) => ch in CONSONANTS;
// Silent letters marked with ์: one or two letters (ต์, ร์, ย์; ทร์, ษณ์, ษฎร์) or ริย์ (กษัตริย์).
const SILENT = /^(?:[ก-ฮ]{1,2}|ษฎร|ริย)[ิุ]?์/;
const consonantSound = (ch) => `${ch}อ`; // ก → กอ, the name used when sounding out

// A spelling is shown for words and phrases, not for a lone letter or symbol (Thai Script cards).
export function isSpellable(thai) {
  return !/◌/.test(thai) && [...thai].filter(isConsonant).length >= 2;
}

// ---------------------------------------------------------------- letter names (dictation)

export function letterSpelling(thai) {
  const steps = [];
  for (const ch of thai) {
    if (isConsonant(ch)) steps.push({ show: `${ch} ${CONSONANTS[ch][3]}`, say: `${ch}อ ${CONSONANTS[ch][3]}` });
    else if (ch in SYMBOL_NAMES) steps.push({ show: SYMBOL_NAMES[ch], say: SYMBOL_SAY[ch] || SYMBOL_NAMES[ch] });
    else if (/[๐-๙]/.test(ch)) steps.push({ show: ch, say: DIGIT_NAMES[ch.charCodeAt(0) - 0x0e50] });
    else if (/[0-9]/.test(ch)) steps.push({ show: ch, say: DIGIT_NAMES[Number(ch)] });
    else if (/\s/.test(ch)) { if (steps.length && !steps[steps.length - 1].gap) steps.push({ gap: true }); }
    // Latin letters and punctuation are left out.
  }
  if (steps.length && steps[steps.length - 1].gap) steps.pop();
  return steps.length ? [steps] : null;
}

// ---------------------------------------------------------------- school method

// Vowel: [sound, name said when sounding out]
const V = {
  a: ['a', 'อะ'], aa: ['aa', 'อา'], am: ['am', 'อำ'], i: ['i', 'อิ'], ii: ['ii', 'อี'], v: ['ʉ', 'อึ'], vv: ['ʉʉ', 'อือ'],
  u: ['u', 'อุ'], uu: ['uu', 'อู'], e: ['e', 'เอะ'], ee: ['ee', 'เอ'], ae: ['ɛ', 'แอะ'], aeae: ['ɛɛ', 'แอ'],
  o: ['o', 'โอะ'], oo: ['oo', 'โอ'], aw: ['ɔ', 'เอาะ'], awaw: ['ɔɔ', 'ออ'], er: ['ə', 'เออะ'], erer: ['əə', 'เออ'],
  ia: ['ia', 'เอีย'], iaS: ['ia', 'เอียะ'], va: ['ʉa', 'เอือ'], vaS: ['ʉa', 'เอือะ'], ua: ['ua', 'อัว'], uaS: ['ua', 'อัวะ'],
  aiM: ['ai', 'ใอ'], aiL: ['ai', 'ไอ'], ao: ['ao', 'เอา'],
};

const T = '([่้๊๋]?)'; // optional tone mark
// Vowel templates, tried at the position after the onset. `F` = the template needs a final, `F?` =
// it may have one. Templates for a leading vowel (เ แ โ ใ ไ) are keyed by it.
const TEMPLATES = {
  '': [
    { re: /^รร/, v: 'a', final: 'F?', rr: true },             // กรรม, ภรรยา: รร = อะ (+ น)
    { re: /^(?=ร)/, v: 'awaw', final: 'R', hidden: true },    // อักษร, ละคร: hidden ออ + ร (น)
    { re: new RegExp(`^${T}ะ`), v: 'a' },
    { re: new RegExp(`^ั${T}วะ`), v: 'uaS' },
    { re: new RegExp(`^ั${T}ว`), v: 'ua' },
    { re: new RegExp(`^ั${T}`), v: 'a', final: 'F' },
    { re: new RegExp(`^${T}า`), v: 'aa', final: 'F?' },
    { re: new RegExp(`^${T}ำ`), v: 'am' },
    { re: new RegExp(`^ิ${T}`), v: 'i', final: 'F?' },
    { re: new RegExp(`^ี${T}`), v: 'ii', final: 'F?' },
    { re: new RegExp(`^ึ${T}`), v: 'v', final: 'F?' },
    { re: new RegExp(`^ื${T}อ`), v: 'vv' },
    { re: new RegExp(`^ื${T}`), v: 'vv', final: 'F' },
    { re: new RegExp(`^ุ${T}`), v: 'u', final: 'F?' },
    { re: new RegExp(`^ู${T}`), v: 'uu', final: 'F?' },
    { re: new RegExp(`^็${T}อ`), v: 'aw', final: 'F' },
    { re: new RegExp(`^${T}อ`), v: 'awaw', final: 'F?' },
    { re: new RegExp(`^${T}ว`), v: 'ua', final: 'F' },      // สวน, ด้วย: -ว- is อัว before a final
    { re: new RegExp(`^${T}`), v: 'o', final: 'F', hidden: true }, // คน: hidden โอะ
  ],
  เ: [
    { re: new RegExp(`^${T}ะ`), v: 'e' },
    { re: new RegExp(`^็${T}`), v: 'e', final: 'F' },
    { re: new RegExp(`^${T}าะ`), v: 'aw' },
    { re: new RegExp(`^${T}า`), v: 'ao' },
    { re: new RegExp(`^${T}อะ`), v: 'er' },
    { re: new RegExp(`^${T}อ`), v: 'erer' },
    { re: new RegExp(`^ิ${T}`), v: 'erer', final: 'F' },    // เดิน
    { re: new RegExp(`^ี${T}ยะ`), v: 'iaS' },
    { re: new RegExp(`^ี${T}ย`), v: 'ia', final: 'F?' },
    { re: new RegExp(`^ื${T}อะ`), v: 'vaS' },
    { re: new RegExp(`^ื${T}อ`), v: 'va', final: 'F?' },
    { re: new RegExp(`^${T}ย`), v: 'erer', finalY: true },   // เลย: เออ + ย
    { re: new RegExp(`^${T}`), v: 'ee', final: 'F?' },
  ],
  แ: [
    { re: new RegExp(`^${T}ะ`), v: 'ae' },
    { re: new RegExp(`^็${T}`), v: 'ae', final: 'F' },
    { re: new RegExp(`^${T}`), v: 'aeae', final: 'F?' },
  ],
  โ: [
    { re: new RegExp(`^${T}ะ`), v: 'o' },
    { re: new RegExp(`^${T}`), v: 'oo', final: 'F?' },
  ],
  ใ: [{ re: new RegExp(`^${T}`), v: 'aiM' }],
  ไ: [
    { re: new RegExp(`^${T}ย`), v: 'aiL' },                  // ไทย: silent ย
    { re: new RegExp(`^${T}`), v: 'aiL' },
  ],
};

const CLUSTER_SECOND = new Set(['ร', 'ล', 'ว']);
// Loanwords keep some English finals (ลิฟต์ líf, ไมโครเวฟ, แก๊ส); only grouping is checked, so allow both.
const FINAL_SOUNDS = { ฟ: ['p', 'f'], ส: ['t', 's'], ซ: ['t', 's'], ล: ['n', 'l'] };
const SILENT_R_ONSET = { ท: 's', ส: 's', ศ: 's', จ: 'j', ซ: 's' }; // ทราย, สร้าง, จริง: ร silent
const HO_LEAD = new Set(['ง', 'ญ', 'น', 'ม', 'ย', 'ร', 'ล', 'ว']);       // หมา, หนู: silent ห

function soundsOf(ch) { return CONSONANTS[ch][1].split('|'); }

// The ways an onset can start at text[i]: { len, sounds: [...], parts: [said], letters }.
function onsets(text, i) {
  const c1 = text[i];
  if (!isConsonant(c1)) return [];
  const out = [{ len: 1, sounds: soundsOf(c1), parts: [consonantSound(c1)], letters: c1 }];
  const c2 = text[i + 1];
  if (c2 && isConsonant(c2)) {
    if (c1 === 'ห' && HO_LEAD.has(c2)) out.push({ len: 2, sounds: soundsOf(c2), parts: ['หอ', consonantSound(c2)], letters: c1 + c2 });
    if (c1 === 'อ' && c2 === 'ย') out.push({ len: 2, sounds: ['y'], parts: ['ออ', 'ยอ'], letters: c1 + c2 });
    if (CLUSTER_SECOND.has(c2) && c1 !== 'ห' && c1 !== 'อ' && c1 !== c2) {
      const second = CONSONANTS[c2][1];
      const sounds = soundsOf(c1).flatMap((s) => [s + second, s]); // clusters are often softened in speech
      if (c2 === 'ร' && SILENT_R_ONSET[c1]) sounds.push(SILENT_R_ONSET[c1]);
      out.push({ len: 2, sounds, parts: [consonantSound(c1), consonantSound(c2)], letters: c1 + c2 });
    }
  }
  return out;
}

// A final consonant at text[i], optionally followed by silent letters ending in ์ (จันทร์, ศาสตร์).
function finals(text, i, { allowNone, onlyR }) {
  const out = [];
  if (allowNone) out.push({ len: 0, sound: '', letter: null });
  // Loanwords: a silent letter between the vowel and the final (พอร์ต, ฟอร์ม, ฟิล์ม, ชาร์จ).
  if (isConsonant(text[i]) && text[i + 1] === '์' && isConsonant(text[i + 2]) && !onlyR) {
    for (const f of finals(text, i + 2, { allowNone: false })) out.push({ ...f, len: f.len + 2 });
  }
  const f = text[i];
  if (!f || !isConsonant(f) || !CONSONANTS[f][2] || text[i + 1] === 'ะ' || text[i + 1] === '์') return out;
  if (onlyR && f !== 'ร') return out;
  const after = text.slice(i + 1);
  const sounds = FINAL_SOUNDS[f] || [CONSONANTS[f][2]];
  const add = (len) => sounds.forEach((sound) => out.push({ len, sound, letter: f }));
  add(1);
  const silent = SILENT.exec(after);                              // จันทร์, ศาสตร์, มนต์
  if (silent) add(1 + silent[0].length);
  // Pali/Sanskrit spellings: a silent vowel or ร after the final (ญาติ, เหตุ; บุตร, เพชร, โคตร).
  if (/^[ิุ](?![ก-ฮ]?[ะาำ])/.test(after)) add(2);
  if (after[0] === 'ร' && !/^ร[ะ-ฺ็-๎]/.test(after)) add(2);
  if ('ทต'.includes(f) && 'ธถ'.includes(after[0]) && !/^.[ะ-ฺ็-๎]/.test(after)) add(2); // พุทธ
  return out;
}

// Ways a syllable can be read at text[i]. `link` = a previous final that may also start this
// syllable with a hidden อะ (ผลไม้: ล ends ผล and starts ละ).
function syllables(text, i, link) {
  // A reused final (ผลไม้, วิทยา, จักรยาน, อัตรา) starts this syllable without being written again:
  // read the syllable as if it were, then don't count it.
  if (link) return syllables(link + text.slice(i), 0, null).map((s) => ({ ...s, len: s.len - 1 })).filter((s) => s.len >= 0);
  const out = [];
  if (text[i] === 'ก' && text[i + 1] === '็' && (i + 2 === text.length || !/[ะ-ฺ็-๎]/.test(text[i + 2] || ''))) {
    out.push({ len: 2, onset: { sounds: ['g'], parts: ['กอ'], letters: 'ก' }, vowel: 'awaw', text: 'ก็', tone: '', final: null, special: true });
  }
  if (text[i] === 'ฤ') {
    for (const f of finals(text, i + 1, { allowNone: true })) {
      out.push({ len: 1 + f.len, onset: { sounds: ['r'], parts: [], letters: 'ฤ' }, vowel: 'v', ruu: true, text: text.slice(i, i + 1 + f.len), tone: '', final: f.letter ? f : null });
    }
  }
  // Consonant + ฤ: a ร cluster with the vowel อึ (or อิ): พฤษภาคม, อังกฤษ.
  if (isConsonant(text[i]) && text[i + 1] === 'ฤ') {
    const on = { sounds: soundsOf(text[i]).map((x) => x + 'r'), parts: [consonantSound(text[i]), 'รอ'], letters: text[i] + 'ฤ' };
    for (const f of finals(text, i + 2, { allowNone: true })) {
      out.push({ len: 2 + f.len, onset: on, vowel: 'v', ri: true, text: text.slice(i, i + 2 + f.len), tone: '', final: f.letter ? f : null });
    }
  }
  const lead = 'เแโใไ'.includes(text[i]) ? text[i] : '';
  const start = i + (lead ? 1 : 0);
  for (const on of onsets(text, start)) {
    const j = start + on.len;
    const rest = text.slice(j);
    for (const t of TEMPLATES[lead]) {
      const m = t.re.exec(rest);
      if (!m) continue;
      const k = j + m[0].length;
      const tone = m[1] || '';
      let finalOpts = t.finalY ? [{ len: 0, sound: 'y', letter: 'ย', inVowel: true }]
        : t.final === 'F' ? finals(text, k, { allowNone: false })
          : t.final === 'F?' ? finals(text, k, { allowNone: true })
            : t.final === 'R' ? finals(text, k, { allowNone: false, onlyR: true })
              : [{ len: 0, sound: '', letter: null }];
      // รร with no final after it: the second ร is the final (น), and may start the next syllable.
      if (t.rr) finalOpts = finalOpts.map((f) => (f.letter ? f : { len: 0, sound: 'n', letter: 'ร' }));
      for (const f of finalOpts) {
        const len = k - i + f.len;
        out.push({ len, onset: on, vowel: t.v, lead, text: text.slice(i, i + len), tone, final: f.letter ? f : null, hidden: t.hidden, rr: t.rr });
      }
    }
    // Hidden อะ (สบาย → สะ) or ออ (บริษัท → บอ) on a bare onset.
    if (!lead) {
      out.push({ len: j - i, onset: on, vowel: 'a', hiddenA: true, text: text.slice(i, j), tone: '', final: null });
      out.push({ len: j - i, onset: on, vowel: 'awaw', hiddenAw: true, text: text.slice(i, j), tone: '', final: null });
    }
  }
  // A silent letter (or two) with ์ may follow any syllable: เบอร์, สัปดาห์, เสาร์.
  for (const syl of [...out]) {
    const silent = SILENT.exec(text.slice(i + syl.len));
    if (silent && syl.len > 0) out.push({ ...syl, len: syl.len + silent[0].length, text: text.slice(i, i + syl.len + silent[0].length) });
  }
  return out;
}

// --- matching against the transliteration

const plain = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const short = (s) => s.replace(/(aa|ii|uu|ee|oo|ɔɔ|əə|ɛɛ|ʉʉ)/g, (m) => m[0])
  // Transliterations vary in aspiration (ครับ: kráp) and the letters are fixed anyway: only how
  // they group into syllables is being checked.
  .replace(/kh|g/g, 'k').replace(/ph|b/g, 'p').replace(/th|d/g, 't').replace(/ch|j/g, 'c');

function predicted(syl) {
  const vowel = V[syl.vowel][0];
  let finals = [''];
  if (syl.vowel === 'am') finals = [''];
  else if (syl.final) {
    const s = syl.final.sound;
    finals = s === 'y' ? ['i', 'y'] : s === 'w' ? ['o', 'u', 'w'] : [s];
  }
  const out = new Set();
  for (const on of syl.onset.sounds) {
    for (const f of finals) {
      out.add(short(on + vowel + f));
      if (syl.ruu) { out.add(short(on + 'i' + f)); out.add(short(on + 'əə' + f)); }
      if (syl.ri) out.add(short(on + 'i' + f));
    }
  }
  return out;
}

function matches(syl, translitSyllable) {
  return predicted(syl).has(short(plain(translitSyllable)));
}

// All readings of `text` whose syllables match `tl` (translit syllables) one for one.
function readings(text, tl) {
  const results = [];
  const walk = (i, k, link, acc) => {
    if (results.length > 1) return;
    if (i === text.length && !link) {
      if (k === tl.length) results.push(acc);
      return;
    }
    if (k >= tl.length) return;
    for (const syl of syllables(text, i, link)) {
      if (!matches(syl, tl[k])) continue;
      // A closed syllable's single final may also start the next one (ผลไม้, วิทยา).
      const next = syl.final && !syl.final.inVowel && (syl.final.len === 1 || syl.rr) ? syl.final.letter : null;
      const placed = { ...syl, start: i };
      walk(i + syl.len, k + 1, null, [...acc, placed]);
      if (next) walk(i + syl.len, k + 1, next, [...acc, placed]);
    }
  };
  walk(0, 0, null, []);
  return results;
}

function stripTone(s) { return s.replace(/[่้๊๋]/g, ''); }

// The steps for one syllable.
function syllableSteps(syl) {
  const steps = [];
  const say = (s) => steps.push({ show: s, say: s });
  if (syl.ruu) {
    say('รอ'); say('อึ');
    if (syl.final) say(consonantSound(syl.final.letter));
    say(syl.text);
    return { steps, said: syl.text };
  }
  syl.onset.parts.forEach(say);
  const vowelName = syl.hiddenA ? 'อะ' : syl.hiddenAw ? 'ออ' : syl.hidden ? 'โอะ' : V[syl.vowel][1];
  say(vowelName);
  if (syl.final) say(consonantSound(syl.final.letter));
  // The syllable as said: hidden vowels are written out (สะ, บอ, ละ); otherwise as written.
  let base;
  if (syl.hiddenA) base = syl.onset.letters + 'ะ';
  else if (syl.hiddenAw) base = syl.onset.letters + 'อ';
  else base = stripTone(syl.text);
  say(base);
  if (syl.tone) {
    say(TONE_MARKS[syl.tone]);
    say(syl.text);
  }
  return { steps, said: syl.tone ? syl.text : base };
}

// School-method spelling of `thai`, guided by `translit`; null when no reading fits.
// Returns a list of groups (one per word in a phrase), each a list of syllables' steps, plus the
// whole word for words of several syllables.
export function schoolSpelling(thai, translit) {
  if (!translit) return null;
  // Thai doesn't space the words of a phrase but the transliteration does, so match the syllables
  // as one run. ๆ repeats the word before it, so drop it and its repeated transliteration.
  let tlWords = translit.replace(/\.\.\.|…/g, ' ').trim().split(/\s+/).filter(Boolean);
  if (/ๆ/.test(thai)) {
    tlWords = tlWords.filter((w, n) => n === 0 || w !== tlWords[n - 1]).map((w) => {
      const syls = w.split('-');
      for (let size = 1; size <= 3; size++) {                    // ข้างๆ khâang-khâang, ใจเย็นๆ jai-yen-yen
        for (let at = 0; at + 2 * size <= syls.length; at++) {
          const a = syls.slice(at, at + size).join('-');
          if (a === syls.slice(at + size, at + 2 * size).join('-')) return [...syls.slice(0, at + size), ...syls.slice(at + 2 * size)].join('-');
        }
      }
      return w;
    });
  }
  const text = thai.replace(/ๆ/g, '').replace(/\.\.\.|…/g, '').replace(/\s+/g, '');
  if (!/^[ก-๎]+$/.test(text) || /ฯ/.test(text)) return null;
  const tl = [];
  tlWords.forEach((w, n) => w.split('-').filter(Boolean).forEach((syl) => tl.push({ syl, word: n })));
  let found = readings(text, tl.map((t) => t.syl));
  // A leading vowel can belong to the second of two consonants, the first taking a hidden อะ:
  // เสมอ = สะ-เมอ, แสดง = สะ-แดง. Try moving it after the first consonant.
  for (let p = 0; found.length === 0 && p < text.length - 2; p++) {
    if ('เแโใไ'.includes(text[p]) && isConsonant(text[p + 1]) && isConsonant(text[p + 2])) {
      found = readings(text.slice(0, p) + text[p + 1] + text[p] + text.slice(p + 2), tl.map((t) => t.syl));
    }
  }
  if (found.length === 0) return null;
  // One group per transliterated word: its syllables, then the word itself if it has several.
  const groups = [];
  found[0].forEach((syl, n) => {
    const w = tl[n].word;
    (groups[w] ||= []).push(syl);
  });
  const out = groups.map((syls) => {
    const parts = syls.map(syllableSteps);
    const steps = parts.flatMap((p, n) => (n ? [{ gap: true }, ...p.steps] : p.steps));
    // The word as written (a reused final belongs to both syllables, so slice, don't join).
    const last = syls[syls.length - 1];
    const word = text.slice(syls[0].start, last.start + last.len);
    if (syls.length > 1) steps.push({ gap: true }, { show: word, say: word });
    return steps;
  });
  // The whole card last, spoken with its own recording: a phrase, a word of several syllables, or
  // anything with ๆ (ใจเย็นๆ ends with ใจเย็นๆ, not ใจเย็น).
  const lastSteps = out[out.length - 1];
  if (out.length > 1 || /ๆ/.test(thai)) {
    if (out.length === 1 && found[0].length > 1) {                    // replace the bare word
      lastSteps.pop();
      if (lastSteps[lastSteps.length - 1]?.gap) lastSteps.pop();
    }
    out.push([{ show: thai, say: thai, word: true }]);
  } else if (found[0].length > 1) {
    lastSteps[lastSteps.length - 1].word = true;
  }
  return out;
}

// What a spelling shows: steps joined with " – ", syllables with " · ", words with " / ".
export function spellingText(groups) {
  return groups.map((steps) => steps.map((s) => (s.gap ? '·' : s.show)).join(' – ').replace(/ – · – /g, ' · ')).join('  /  ');
}

// The spoken parts, in order (a whole word is marked so callers can use its own recording).
export function spellingSteps(groups) {
  return groups.flatMap((steps) => steps.filter((s) => !s.gap));
}
