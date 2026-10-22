// The Time section's Thai (2026-10-21, a spike: branch 2026-10-21-spike-time): any time of day said
// the everyday way (the six-hour clock: ตี, …โมงเช้า, เที่ยง, บ่าย…, …โมงเย็น, …ทุ่ม) or the
// official 24-hour way (…นาฬิกา…นาที), as parts that each mean something. No page code, so
// tools/time_phrases.mjs can list every phrase for gen_audio.py to record.
//
// The forms are the Telling the Time topics' (data/decks.json: time-telling-day, -night, -minutes):
// เช้า and เย็น go once minutes are said (แปดโมงครึ่ง, 8:30 am), 7 pm with minutes is ทุ่ม
// (ทุ่มครึ่ง), half past is ครึ่ง, other minutes are the number and นาที (สิบโมงสิบห้านาที).

const UNITS = [
  null,
  { th: 'หนึ่ง', tl: 'nʉ̀ng' }, { th: 'สอง', tl: 'sɔ̌ɔng' }, { th: 'สาม', tl: 'sǎam' },
  { th: 'สี่', tl: 'sìi' }, { th: 'ห้า', tl: 'hâa' }, { th: 'หก', tl: 'hòk' },
  { th: 'เจ็ด', tl: 'jèt' }, { th: 'แปด', tl: 'pɛ̀ɛt' }, { th: 'เก้า', tl: 'gâao' },
];

// A number, 0–59, as one part: สิบห้า, ยี่สิบเอ็ด, สามสิบ (a one after a ten is เอ็ด).
export function thaiNumber(n) {
  if (n === 0) return { th: 'ศูนย์', tl: 'sǔun', en: '0' };
  const tens = Math.floor(n / 10);
  const unit = n % 10;
  const th = [];
  const tl = [];
  if (tens) {
    if (tens === 2) { th.push('ยี่'); tl.push('yîi'); } else if (tens > 1) { th.push(UNITS[tens].th); tl.push(UNITS[tens].tl); }
    th.push('สิบ');
    tl.push('sìp');
  }
  if (unit === 1 && tens) { th.push('เอ็ด'); tl.push('èt'); } else if (unit) { th.push(UNITS[unit].th); tl.push(UNITS[unit].tl); }
  return { th: th.join(''), tl: tl.join('-'), en: String(n) };
}

const WORDS = {
  midnight: { th: 'เที่ยงคืน', tl: 'thîang-khʉʉn', en: 'midnight' },
  noon: { th: 'เที่ยง', tl: 'thîang', en: 'noon' },
  tii: { th: 'ตี', tl: 'tii', en: 'o\'clock, 1–5 am (to strike: the gong struck in the night)' },
  moong: { th: 'โมง', tl: 'moong', en: 'o\'clock, in the day (the gong once struck for the daytime hours)' },
  chaao: { th: 'เช้า', tl: 'cháao', en: 'morning' },
  baai: { th: 'บ่าย', tl: 'bàai', en: 'afternoon, 1–3 pm' },
  yen: { th: 'เย็น', tl: 'yen', en: 'evening, 4–6 pm' },
  thum: { th: 'ทุ่ม', tl: 'thûm', en: 'o\'clock, 7–11 pm (the drum once beaten for the evening hours)' },
  half: { th: 'ครึ่ง', tl: 'khrʉ̂ng', en: 'half past' },
  minutes: { th: 'นาที', tl: 'naa-thii', en: 'minutes' },
  naalikaa: { th: 'นาฬิกา', tl: 'naa-lí-gaa', en: 'o\'clock, on the 24-hour clock' },
};

// The day's parts, as the band shows them: the hours each covers, and what the band's cell says for
// an hour (the count the Thai uses: บ่าย 1–3, เย็น 4–6, ทุ่ม 1–5), 12 for midnight and noon as on
// the clock face. Each is day or night in colour (styles.css, .period-<id>). `gloss`: what the name
// means and when, shown in place of the time when the name's tapped (renderTime; one short line).
export const PERIODS = [
  { id: 'midnight', ...WORDS.midnight, gloss: 'midnight', hours: [0], count: () => 12 },
  { id: 'tii', th: 'ตี', tl: 'tii', en: '1–5 am', gloss: 'struck (a gong), 1–5 am', hours: [1, 2, 3, 4, 5], count: (h) => h },
  { id: 'chaao', th: 'เช้า', tl: 'cháao', en: '6–11 am', gloss: 'morning, 6–11 am', hours: [6, 7, 8, 9, 10, 11], count: (h) => h },
  { id: 'noon', ...WORDS.noon, gloss: 'noon', hours: [12], count: () => 12 },
  { id: 'baai', th: 'บ่าย', tl: 'bàai', en: '1–3 pm', gloss: 'afternoon, 1–3 pm', hours: [13, 14, 15], count: (h) => h - 12 },
  { id: 'yen', th: 'เย็น', tl: 'yen', en: '4–6 pm', gloss: 'evening, 4–6 pm', hours: [16, 17, 18], count: (h) => h - 12 },
  { id: 'thum', th: 'ทุ่ม', tl: 'thûm', en: '7–11 pm', gloss: 'a drum\'s beat, 7–11 pm', hours: [19, 20, 21, 22, 23], count: (h) => h - 18 },
];
export const periodOf = (h) => PERIODS.find((p) => p.hours.includes(h));

// The hour's parts, the everyday way. With minutes said after it, เช้า and เย็น go, and 7 pm is ทุ่ม.
function everydayHour(h, withMinutes) {
  if (h === 0) return [WORDS.midnight];
  if (h <= 5) return [WORDS.tii, thaiNumber(h)];
  if (h <= 11) return [thaiNumber(h), WORDS.moong, ...(withMinutes ? [] : [WORDS.chaao])];
  if (h === 12) return [WORDS.noon];
  if (h === 13) return [WORDS.baai, WORDS.moong]; // บ่ายโมง: the หนึ่ง is left out
  if (h <= 15) return [WORDS.baai, thaiNumber(h - 12), WORDS.moong];
  if (h <= 18) return [thaiNumber(h - 12), WORDS.moong, ...(withMinutes ? [] : [WORDS.yen])];
  if (h === 19) return withMinutes ? [WORDS.thum] : [thaiNumber(1), WORDS.thum];
  return [thaiNumber(h - 18), WORDS.thum];
}

const minuteParts = (m, half) => (m === 0 ? [] : m === 30 && half ? [WORDS.half] : [thaiNumber(m), WORDS.minutes]);

// `style`: 'everyday' or 'official'. h 0–23, m 0–59.
export function timeParts(h, m, style = 'everyday') {
  if (style === 'official') return [thaiNumber(h), WORDS.naalikaa, ...minuteParts(m, false)];
  return [...everydayHour(h, m > 0), ...minuteParts(m, true)];
}

const pad = (n) => String(n).padStart(2, '0');

// The time in English, as the topics' cards give it: "6 am", "2:30 pm", noon, midnight; 24-hour "14:30".
export function timeEnglish(h, m, style = 'everyday') {
  if (style === 'official') return `${pad(h)}:${pad(m)}`;
  if (m === 0 && h === 0) return 'midnight';
  if (m === 0 && h === 12) return 'noon';
  return `${h % 12 || 12}${m ? `:${pad(m)}` : ''} ${h < 12 ? 'am' : 'pm'}`;
}

// { th, tl, en, parts, written, note }: `written` is how the official time is written (14.30 น.);
// `note`, a word on what's easy to get wrong at that time.
export function timePhrase(h, m, style = 'everyday') {
  const parts = timeParts(h, m, style);
  const out = {
    th: parts.map((p) => p.th).join(''),
    tl: parts.map((p) => p.tl).join(' '),
    en: timeEnglish(h, m, style),
    parts,
    written: style === 'official' ? `${pad(h)}.${pad(m)} น.` : '',
    note: '',
  };
  if (style === 'everyday') {
    if ((h === 6 || h === 18) && m === 0) out.note = `Keep the ${h === 6 ? 'เช้า' : 'เย็น'}: หกโมง alone could be either.`;
    else if ((h === 6 || h === 18) && m > 0) out.note = `${out.th} could be 6 am or 6 pm: add ตอนเช้า (in the morning) or ตอนเย็น (in the evening) if it isn't clear.`;
    else if (h === 12 && m === 0) out.note = 'Never สิบสองโมง.';
    else if (h === 13 && m === 0) out.note = 'The หนึ่ง (one) is left out: not บ่ายหนึ่งโมง.';
    else if (h === 19 && m === 0) out.note = 'Often just ทุ่ม.';
    else if ((h === 14 || h === 15) && m === 0) out.note = `Often just ${out.th.replace('โมง', '')}.`;
    else if (h >= 7 && h <= 11 && m === 0) out.note = `Often just ${out.th.replace('เช้า', '')}.`;
  } else if (m === 0) {
    out.note = `In speech: ${timePhrase(h, 0).th}.`;
  }
  return out;
}

// Every phrase the page can show (both styles, every 5 minutes) and every part, for recording.
export function allTimeTexts() {
  const texts = new Set();
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 5) {
      for (const style of ['everyday', 'official']) {
        const p = timePhrase(h, m, style);
        texts.add(p.th);
        p.parts.forEach((x) => texts.add(x.th));
      }
    }
  }
  return [...texts].sort();
}
