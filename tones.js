// Tones (2026-10-11, the user's request): each syllable's tone, and the spelling rule that gives it.
// The word pop-up shows them (app.js, toneSection).
//
// Three things decide a syllable's tone (docs/implementation-notes.md → Tones):
// - its first consonant's class, high, mid or low. ห in front of a low consonant with no high
//   partner makes it high (หมา, หนู), อ in front of ย makes it mid (อยาก); a cluster (กร, ปล)
//   takes its first letter's class.
// - live or dead: a syllable ending in a long vowel or in -m, -n, -ng, -i or -o (and ำ ใ ไ เ-า) is
//   live; one ending in a short vowel or in -k, -t or -p is dead.
// - its tone mark, which, when there is one, decides on its own:
//            no mark                                  ่         ้         ๊      ๋
//   mid      live: mid, dead: low                     low       falling   high   rising
//   high     live: rising, dead: low                  low       falling
//   low      live: mid, dead: short high, long falling  falling   high
//
// The tone actually said comes from the card's transliteration (à low, â falling, á high, ǎ rising,
// unmarked mid), which spell.js matches to the Thai syllable by syllable, and so does the vowel's
// length (เพชร is written long but said short: phét). Where the rules give another tone, two more
// readings are tried before calling it an exception:
// - อักษรนำ: a low consonant with no high partner (ง ญ ณ น ม ย ร ล ว ฬ), after a high or mid
//   consonant whose syllable is a short vowel with no final (or ำ), can take that one's class: ตำรวจ tam-rùat, ประโยค
//   prà-yòok, สนุก sà-nùk. Not always (ขโมย khà-mooi, สมาชิก sà-maa-chík), so only when the
//   transliteration says so.
// - ฑ said d (บัณฑิต ban-dìt) counts as mid class, like ด.
// What's left is an exception: mostly loanwords (คอมพิวเตอร์ khɔm-phíu-tə̂ə), and เขา kháo.
// Of 18,270 syllables in the decks on 2026-10-11, all but about 330 follow the rules this way.

import { syllableReading, consonantClass } from './spell.js';

export const TONE_THAI = { mid: 'เสียงสามัญ', low: 'เสียงเอก', falling: 'เสียงโท', high: 'เสียงตรี', rising: 'เสียงจัตวา' };
export const CLASS_NAMES = { H: 'high', M: 'mid', L: 'low' };
export const MARK_NAMES = { '่': 'ไม้เอก', '้': 'ไม้โท', '๊': 'ไม้ตรี', '๋': 'ไม้จัตวา' };
// spell.js's short vowels (its V codes), for "written long, said short".
const SHORT_VOWELS = new Set(['a', 'i', 'v', 'u', 'e', 'ae', 'o', 'aw', 'er', 'iaS', 'vaS', 'uaS']);
// Vowels with a final sound in them, always live, and short as written: ำ -m, ใ ไ -i, เ-า -o.
const LIVE_VOWELS = { am: ['m', 'ำ'], aiM: ['i', 'ใ'], aiL: ['i', 'ไ'], ao: ['o', 'เ-า'] };
const SONORANTS = 'งญณนมยรลวฬ';
// Words said otherwise than spelt, and why.
const SPOKEN = { เขา: 'Everyday speech says เขา with a high tone. Careful speech keeps the rising tone of its spelling.' };

const plain = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const TL_TONES = { '̀': 'low', '̂': 'falling', '́': 'high', '̌': 'rising' };
const saidTone = (tl) => TL_TONES[tl.normalize('NFD').match(/[̀́̂̌]/)?.[0]] || 'mid';
// The transliteration writes a long vowel double (aa); ia, ʉa and ua are long unless spelt with ะ.
const DIPHTHONGS = new Set(['ia', 'iaS', 'va', 'vaS', 'ua', 'uaS']);
const saidLong = (s) => (DIPHTHONGS.has(s.vowel) ? !s.vowel.endsWith('S') : /aa|ii|uu|ee|oo|ɔɔ|əə|ɛɛ|ʉʉ/.test(plain(s.tl)));

// The tone table's columns, and the tone in each cell (null: no such spelling; ๊ and ๋ go on mid
// class only).
export const TABLE_COLUMNS = ['live', 'deadShort', 'deadLong', '่', '้', '๊', '๋'];
export function tableTone(cls, column) {
  if ('๊๋'.includes(column) && cls !== 'M') return null;
  return ruleTone(cls, column === 'live', column === 'deadLong', TABLE_COLUMNS.indexOf(column) > 2 ? column : '');
}

function ruleTone(cls, live, long, mark) {
  if (mark === '่') return cls === 'L' ? 'falling' : 'low';
  if (mark === '้') return cls === 'L' ? 'high' : 'falling';
  if (mark === '๊') return 'high';
  if (mark === '๋') return 'rising';
  if (live) return cls === 'H' ? 'rising' : 'mid';
  return cls === 'L' ? (long ? 'falling' : 'high') : 'low';
}

// The final sound: { sound (as the transliteration has it: -y and -w as -i, -o or -u, หิว hǐu),
// letter, part (the vowel it's part of: ำ, ใ, ไ, เ-า), stop (-k, -t, -p: the syllable is dead) },
// or null for none.
function finalOf(s) {
  if (s.final) {
    const sound = 'yw'.includes(s.final.sound) ? plain(s.tl).slice(-1) : s.final.sound;
    return { sound, letter: s.final.letter, part: '', stop: 'ktp'.includes(s.final.sound) };
  }
  const v = LIVE_VOWELS[s.vowel];
  return v ? { sound: v[0], letter: '', part: v[1], stop: false } : null;
}

// The class of the syllable's first consonant: { cls, letter (the letter or letters it's about), why }.
function ownClass(s) {
  const L = s.onset.letters;
  if (L.length === 2 && L[0] === 'ห') return { cls: 'H', letter: L, why: `ห in front makes ${L[1]} high class` };
  if (L === 'อย') return { cls: 'M', letter: L, why: 'อ in front makes ย mid class' };
  if (L[0] === 'ฑ' && plain(s.tl).startsWith('d')) return { cls: 'M', letter: 'ฑ', why: 'ฑ is said d here, so it counts as mid, like ด' };
  const cluster = L.length > 1 && /^[ก-ฮ]+$/.test(L);
  return { cls: consonantClass(L[0]), letter: cluster ? L : L[0], why: '' };
}

// อักษรนำ: the class the syllable before lends this one, or null.
function leadClass(s, prev) {
  const L = s.onset.letters;
  if (!prev || prev.word !== s.word || prev.final || !(SHORT_VOWELS.has(prev.vowel) || prev.vowel === 'am')) return null;
  if (L.length !== 1 || !SONORANTS.includes(L)) return null;
  const { cls } = ownClass(prev);
  return cls === 'L' ? null : { cls, letter: L, why: `${prev.onset.letters[0]} in the syllable before lends ${L} its class (อักษรนำ)` };
}

// Each syllable of `thai`: { said, tl, word, at, tone (as said), cls, clsLetter, clsWhy, mark,
// long (the vowel as said), vowelName, vowelHidden, writtenLong, final (finalOf), live, column (its
// column in the tone table: TABLE_COLUMNS), rule (the rules' tone), exception (they differ), note },
// or null when the Thai can't be matched to its transliteration.
export function toneBreakdown(thai, translit) {
  const syls = syllableReading(thai, translit);
  if (!syls) return null;
  return syls.map((s, n) => {
    const tone = saidTone(s.tl);
    const long = saidLong(s);
    const final = finalOf(s);
    const live = final ? !final.stop : long;
    let cls = ownClass(s);
    let rule = ruleTone(cls.cls, live, long, s.tone);
    if (rule !== tone) {
      const lead = leadClass(s, syls[n - 1]);
      if (lead && ruleTone(lead.cls, live, long, s.tone) === tone) [cls, rule] = [lead, tone];
    }
    const writtenLong = !SHORT_VOWELS.has(s.vowel) && !LIVE_VOWELS[s.vowel];
    let note = '';
    if (s.special) note = 'ก็ is a spelling of its own: always said gɔ̂, with a falling tone.';
    else if (rule !== tone) note = SPOKEN[s.text] || 'An exception: said differently from the rules. Loanwords and a few common words do this.';
    else if (!live && !s.tone && cls.cls === 'L' && long !== writtenLong) {
      note = `The vowel is written ${long ? 'short' : 'long'} but said ${long ? 'long' : 'short'}, which decides the tone here.`;
    }
    return { said: s.said, tl: s.tl, word: s.word, at: s.at, tone, cls: cls.cls, clsLetter: cls.letter, clsWhy: cls.why,
      mark: s.tone, long, vowelName: s.vowelName, vowelHidden: !!(s.hiddenA || s.hiddenAw || s.hidden), writtenLong, final, live,
      column: s.tone || (live ? 'live' : long ? 'deadLong' : 'deadShort'), rule, exception: rule !== tone || !!s.special, note };
  });
}
