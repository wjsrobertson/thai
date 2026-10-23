#!/usr/bin/env node
// The Time section's phrases (see time.js), for recording.
//
//   node tools/time_phrases.mjs            # a sample of the phrases, and how many there are
//   node tools/time_phrases.mjs --write    # also write data/time-phrases.json for tools/gen_audio.py
//
// Every time every 5 minutes, said the everyday way (the only way since 2026-10-23), and each of its parts.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
// time.js is an ES module without a package.json "type", so load it from source (as spelling.mjs does).
const src = readFileSync(join(ROOT, 'time.js'), 'utf8');
const { timePhrase, allTimeTexts } = await import('data:text/javascript;base64,' + Buffer.from(src).toString('base64'));

for (const [h, m] of [[0, 0], [0, 30], [3, 15], [6, 0], [6, 30], [8, 30], [12, 0], [12, 30], [13, 0], [14, 30], [16, 45], [18, 0], [19, 0], [19, 30], [21, 10], [23, 55]]) {
  const e = timePhrase(h, m);
  console.log(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}  ${e.th} (${e.tl}, ${e.en})`);
}
const texts = allTimeTexts();
console.log(`${texts.length} texts to record`);
if (process.argv.includes('--write')) {
  writeFileSync(join(ROOT, 'data', 'time-phrases.json'), JSON.stringify(texts, null, 0) + '\n');
  console.log('wrote data/time-phrases.json');
}
