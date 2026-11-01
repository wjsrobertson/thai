// Runs searches through app.js's own word search (wordSearch, wordMatches and their helpers, lifted
// from the file as they are) over every card in data/decks.json, and prints what each finds: its
// top hits with their scores, and how many are near misses (score 3.7 or more). For measuring a
// search change against all the cards before trying it in the browser (2026-11-01, popular
// romanisation and near misses). The alphabet's letter cards aren't in it; story cards are, as in
// the app.
//
//   node tools/search_check.mjs "peng yai bang" "sawadee krap" water     # top 5 each
//   node tools/search_check.mjs --top 12 aharn
//   node tools/search_check.mjs --list kopkun ขอบคุณ                       # wordMatches on each card
//   git show HEAD:app.js > /tmp/old.js; node tools/search_check.mjs --app /tmp/old.js water  # before
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const appAt = process.argv.indexOf('--app');
const app = fs.readFileSync(appAt > 0 ? process.argv.splice(appAt, 2)[1] : path.join(root, 'app.js'), 'utf8');

// A top-level declaration's source: a function runs to the } alone on a line that ends it, a const
// to the first line ending in ; (counting brackets would trip on the regexes' own).
function lift(name) {
  const m = app.match(new RegExp(`^(?:function ${name}\\(|const ${name} = )`, 'm'));
  if (!m) throw new Error(`no ${name} in app.js`);
  const end = app.indexOf(m[0].startsWith('function') ? '\n}\n' : ';\n', m.index);
  return app.slice(m.index, end + (m[0].startsWith('function') ? 2 : 1));
}

// Those an older app.js lacks are left out, so --app can run one from before them.
const names = ['THAI_SOUND_ALIKE', 'looseThai', 'looseTranslit', 'soundTranslit', 'popularTranslit', 'translitKeys',
  'startDistance', 'wordSearch', 'wordMatches'].filter((n) => new RegExp(`^(?:function ${n}\\(|const ${n} = )`, 'm').test(app));
const decks = JSON.parse(fs.readFileSync(path.join(root, 'data', 'decks.json'), 'utf8')).decks;
const cardKey = (c) => `${c.thai}::${c.english}`;
const state = { cardIndex: new Map() };
for (const d of decks) for (const c of d.cards) {
  const key = cardKey(c);
  if (!state.cardIndex.has(key)) state.cardIndex.set(key, { card: c, deckIds: [] });
  state.cardIndex.get(key).deckIds.push(d.id);
}
const { wordSearch, wordMatches } = new Function('state', 'WORD_HITS_SHOWN',
  `let searchIndex = null;\n${names.map(lift).join('\n')}\nreturn { wordSearch, wordMatches };`)(state, 40);

const args = process.argv.slice(2);
let top = 5, list = false;
const queries = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--top') top = Number(args[++i]);
  else if (args[i] === '--list') list = true;
  else queries.push(args[i]);
}
const cards = [...state.cardIndex.values()].map((e) => e.card);
for (const q of queries) {
  if (list) {
    let found = cards.filter((c) => wordMatches(c, q));
    const near = !found.length;
    if (near) found = cards.filter((c) => wordMatches(c, q, true));
    console.log(`${q}: ${found.length}${near ? ' near misses' : ''}  ${found.slice(0, top).map((c) => `${c.thai} ${c.translit}`).join(', ')}`);
    continue;
  }
  const t = Date.now();
  const { hits, total } = wordSearch(q, { limit: 100000 });
  const near = hits.filter((h) => h.score >= 3.7).length;
  console.log(`${q}: ${total} (${near} near misses, ${Date.now() - t} ms)`);
  for (const h of hits.slice(0, top)) console.log(`  ${h.score.toFixed(2)}  ${h.card.thai}  ${h.card.translit}  ${h.card.english}`);
  if (near && hits[top]?.score < 3.7) {
    console.log('  … near misses:');
    for (const h of hits.filter((x) => x.score >= 3.7).slice(0, 3)) console.log(`  ${h.score.toFixed(2)}  ${h.card.thai}  ${h.card.translit}  ${h.card.english}`);
  }
}
