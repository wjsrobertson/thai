// Typed answers (2026-10-19, the user's idea): Cards' Type mode, where the answer is typed in Thai.
// The keyboard's layout, and the checker that compares what was typed with the card's Thai. No page
// code here. (A section of its own for learning the keys was tried the same day and set aside:
// branch 2026-10-19-typing.)

// Kedmanee (TIS 820-2538): every computer's Thai layout and, key for key, the iPhone's Thai
// keyboard (the user's screenshots, 2026-10-19). Each physical key, by KeyboardEvent.code:
// [without shift, with shift].
export const KEDMANEE = {
  Backquote: ['_', '%'], Digit1: ['ๅ', '+'], Digit2: ['/', '๑'], Digit3: ['-', '๒'], Digit4: ['ภ', '๓'],
  Digit5: ['ถ', '๔'], Digit6: ['ุ', 'ู'], Digit7: ['ึ', '฿'], Digit8: ['ค', '๕'], Digit9: ['ต', '๖'],
  Digit0: ['จ', '๗'], Minus: ['ข', '๘'], Equal: ['ช', '๙'],
  KeyQ: ['ๆ', '๐'], KeyW: ['ไ', '"'], KeyE: ['ำ', 'ฎ'], KeyR: ['พ', 'ฑ'], KeyT: ['ะ', 'ธ'], KeyY: ['ั', 'ํ'],
  KeyU: ['ี', '๊'], KeyI: ['ร', 'ณ'], KeyO: ['น', 'ฯ'], KeyP: ['ย', 'ญ'], BracketLeft: ['บ', 'ฐ'],
  BracketRight: ['ล', ','], Backslash: ['ฃ', 'ฅ'],
  KeyA: ['ฟ', 'ฤ'], KeyS: ['ห', 'ฆ'], KeyD: ['ก', 'ฏ'], KeyF: ['ด', 'โ'], KeyG: ['เ', 'ฌ'], KeyH: ['้', '็'],
  KeyJ: ['่', '๋'], KeyK: ['า', 'ษ'], KeyL: ['ส', 'ศ'], Semicolon: ['ว', 'ซ'], Quote: ['ง', '.'],
  KeyZ: ['ผ', '('], KeyX: ['ป', ')'], KeyC: ['แ', 'ฉ'], KeyV: ['อ', 'ฮ'], KeyB: ['ิ', 'ฺ'], KeyN: ['ื', '์'],
  KeyM: ['ท', '?'], Comma: ['ม', 'ฒ'], Period: ['ใ', 'ฬ'], Slash: ['ฝ', 'ฦ'],
};

// A computer's rows of character keys, left to right. The iPhone has the same four rows without
// the first key (Backquote), and puts ฃ (Backslash) at the end of row 3.
const ROWS = [
  ['Backquote', 'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0', 'Minus', 'Equal'],
  ['KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT', 'KeyY', 'KeyU', 'KeyI', 'KeyO', 'KeyP', 'BracketLeft', 'BracketRight', 'Backslash'],
  ['KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyH', 'KeyJ', 'KeyK', 'KeyL', 'Semicolon', 'Quote'],
  ['KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB', 'KeyN', 'KeyM', 'Comma', 'Period', 'Slash'],
];

// The marks that sit on a letter (vowels above and below, tone marks and the rest), and the tone
// marks alone (with the silent mark ◌์, which is typed in the same place).
const MARK = /[ัิ-ฺ็-๎]/;
const ABOVE_BELOW = '[ัิ-ฺ]';
const TONE = '[่-์]';
const onCircle = (ch) => (MARK.test(ch) ? '◌' + ch : ch);

// Where a character's key is: its code, whether it needs shift, and its row (1–4, the iPhone's).
const PLACE = new Map();
for (const [r, codes] of ROWS.entries()) {
  for (const code of codes) {
    KEDMANEE[code].forEach((ch, shift) => {
      if (!PLACE.has(ch)) PLACE.set(ch, { code, shift: shift === 1, row: code === 'Backslash' ? 3 : r + 1 });
    });
  }
}

// How to find a key, in words, by its neighbours on the iPhone (whose keys are too many to count):
// "row 3, between ห and ด", "⇧, then row 2, between ธ and ◌๊". The iPhone shows _ on Digit3 (a
// computer has -). Its row 1 has no Backquote, and ฃ ends its row 3 rather than row 2; neither is
// ever named as a neighbour here, so "right of ว" holds on both.
export function keyHint(ch) {
  const p = PLACE.get(ch);
  if (!p) return '';
  const label = (code) => onCircle(code === 'Digit3' && !p.shift ? '_' : KEDMANEE[code][p.shift ? 1 : 0]);
  const row = ROWS[p.row - 1].filter((c) => c !== 'Backquote' && c !== 'Backslash');
  const i = p.code === 'Backslash' ? row.length : row.indexOf(p.code); // ฃ: after the row's last
  const left = i > 0 ? label(row[i - 1]) : null;
  const right = i >= 0 && i < row.length - 1 ? label(row[i + 1]) : null;
  const where = left && right ? `, between ${left} and ${right}` : left ? `, right of ${left}` : right ? `, left of ${right}` : '';
  return `${p.shift ? '⇧, then ' : ''}row ${p.row}${where}`;
}

// What can look right but be stored differently, put the usual way, so it counts:
// - only the Thai and the digits count, Thai digits as 0–9: not spaces (ช้า ๆ or ช้าๆ), zero-width
//   spaces, the … of a pattern (ขอ … หน่อย), full stops (พ.ศ.), or the Latin in ฝุ่น PM2.5;
// - ํ + า for ำ (the user's first น้ำ, 2026-10-19);
// - a tone mark typed before a vowel above or below it (◌้ั for ◌ั้), or after ำ (นำ้ for น้ำ).
const TIDY = [
  [/[๐-๙]/g, (d) => String(d.charCodeAt(0) - 0x0E50)],
  [/[^ก-๏0-9]/g, ''],
  [new RegExp(`ํ(${TONE}?)า`, 'g'), '$1ำ'],
  [new RegExp(`(${TONE})(${ABOVE_BELOW})`, 'g'), '$2$1'],
  [new RegExp(`ำ(${TONE})`, 'g'), '$1ำ'],
];
export const tidy = (s) => TIDY.reduce((t, [re, to]) => t.replace(re, to), s);

// Whether what was typed is the Thai, once tidied.
export const sameThai = (typed, thai) => tidy(typed) !== '' && tidy(typed) === tidy(thai);

// Why a right answer only matched once tidied, when it's worth saying ('' when it isn't).
export function tidiedNote(typed) {
  if (/ํ/.test(typed)) return `ำ is one key: ${keyHint('ำ')}`;
  if (new RegExp(`${TONE}${ABOVE_BELOW}`).test(typed)) return 'The vowel first, then the tone mark';
  if (new RegExp(`ำ${TONE}`).test(typed)) return 'The tone mark first, then ำ';
  return '';
}

// Where a wrong answer first goes wrong, both tidied: `at`, the code point in tidy(typed) (its
// length if all of it was right, as far as it went), and a note: the usual slips, or where the
// wanted key is.
export function firstWrong(typed, thai) {
  const a = [...tidy(typed)], b = [...tidy(thai)];
  let at = 0;
  while (at < a.length && a[at] === b[at]) at++;
  const got = a[at] ?? '', want = b[at] ?? '';
  let note = '';
  if (/[A-Za-z]/.test(typed) && !/[A-Za-z]/.test(thai)) note = 'That’s not Thai: switch keyboards with 🌐';
  else if (got === 'า' && want === 'ำ') note = `ำ is one key: ${keyHint('ำ')}`;
  else if (want && PLACE.has(want)) note = `${onCircle(want)}: ${keyHint(want)}`;
  return { at, note };
}

// A word in clusters, each a letter with the marks on it, for marking where an answer went wrong
// without splitting a mark from its letter.
export function clusters(s) {
  const out = [];
  for (const ch of s) {
    if (out.length && (MARK.test(ch) || ch === 'ำ')) out[out.length - 1] += ch;
    else out.push(ch);
  }
  return out;
}
