#!/usr/bin/env node
// The syllables whose tone, as the card's transliteration marks it, isn't the one the spelling rules
// give (tones.js), as JSON: [{ thai, translit, topic, said, tl, rule, tone }], once per card's Thai
// and transliteration. tools/audit_decks.py runs it and reports those not listed in
// tools/tone_exceptions.txt (loanwords and the like) as errors: usually a missing or wrong tone mark
// in the transliteration (sa-baai for sà-baai, khuk for khúk).
//
//   node tools/tones_check.mjs
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
// spell.js and tones.js are ES modules without a package.json "type", so load them from source,
// pointing tones.js's import of spell.js at the loaded copy.
const dataUrl = (src) => 'data:text/javascript;base64,' + Buffer.from(src).toString('base64');
const spellUrl = dataUrl(readFileSync(join(ROOT, 'spell.js'), 'utf8'));
const tonesSrc = readFileSync(join(ROOT, 'tones.js'), 'utf8').replace("from './spell.js'", `from '${spellUrl}'`);
const { toneBreakdown } = await import(dataUrl(tonesSrc));

const decks = JSON.parse(readFileSync(join(ROOT, 'data', 'decks.json'), 'utf8')).decks;
const seen = new Set();
const out = [];
for (const d of decks) {
  if (d.passage) continue;
  for (const c of d.cards) {
    const k = `${c.thai}\t${c.translit}`;
    if (seen.has(k)) continue;
    seen.add(k);
    for (const s of toneBreakdown(c.thai, c.translit) || []) {
      if (s.exception) out.push({ thai: c.thai, translit: c.translit, topic: d.name, said: s.said, tl: s.tl, rule: s.rule, tone: s.tone });
    }
  }
}
console.log(JSON.stringify(out));
