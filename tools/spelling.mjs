#!/usr/bin/env node
// Spelling report and recording list (see spell.js).
//
//   node tools/spelling.mjs            # coverage + the words the school method can't spell
//   node tools/spelling.mjs --write    # also write data/spelling-parts.json for tools/gen_audio.py
//
// The parts are every distinct spoken step of every card's spelling, both methods. Whole words
// are left out: they use the card's own recording.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
// spell.js is an ES module without a package.json "type", so load it from source.
const src = readFileSync(join(ROOT, 'spell.js'), 'utf8');
const { letterSpelling, schoolSpelling, spellingText, spellingSteps, isSpellable } = await import(
  'data:text/javascript;base64,' + Buffer.from(src).toString('base64'));

const decks = JSON.parse(readFileSync(join(ROOT, 'data', 'decks.json'), 'utf8')).decks;
const cards = new Map();
for (const d of decks) for (const c of d.cards) if (!cards.has(c.thai) && isSpellable(c.thai)) cards.set(c.thai, { ...c, topic: d.name });

const parts = new Set();
let school = 0;
const failed = [];
for (const c of cards.values()) {
  const s = schoolSpelling(c.thai, c.translit);
  const l = letterSpelling(c.thai);
  if (s) school += 1; else failed.push(c);
  for (const g of [s, l]) {
    if (!g) continue;
    for (const step of spellingSteps(g)) if (!step.word) parts.add(step.say);
  }
}
const pct = (n) => `${((100 * n) / cards.size).toFixed(1)}%`;
console.log(`${cards.size} Thai words and phrases worth spelling; school method spells ${school} (${pct(school)}), letter names the rest`);
console.log(`${parts.size} distinct spoken parts`);
if (process.argv.includes('--samples')) {
  const extra = process.argv.includes('--random') ? [...cards.keys()].sort(() => Math.random() - 0.5).slice(0, 25) : [];
  for (const w of ['ข้าว', 'บ้าน', 'สบาย', 'ผลไม้', 'คน', 'วิทยาศาสตร์', 'หนังสือ', 'ประเทศ', 'เพราะ', 'ด้วย', 'ภรรยา', 'พฤษภาคม', 'ภาษาไทย', 'อักษร', 'บุตร', 'ญาติ', 'เบอร์', 'ไม่เป็นไร', ...extra]) {
    const c = cards.get(w);
    if (c) console.log(`  ${w} (${c.translit}): ${(() => { const g = schoolSpelling(c.thai, c.translit); return g ? spellingText(g) : '—'; })()}`);
  }
}
if (process.argv.includes('--failed')) {
  const n = Number(process.argv[process.argv.indexOf('--failed') + 1]) || 60;
  for (const c of failed.slice(0, n)) console.log(`  ✗ ${c.thai} (${c.translit}) — ${c.topic}`);
}
if (process.argv.includes('--write')) {
  writeFileSync(join(ROOT, 'data', 'spelling-parts.json'), JSON.stringify([...parts].sort(), null, 0) + '\n');
  console.log('wrote data/spelling-parts.json');
}
