import { letterSpelling, letterStep, schoolSpelling, vowelSpelling, isSpellable } from './spell.js';

// Learn Thai — flashcard app
// Plain JS module, no build step. Loads decks from data/decks.json, schedules reviews with FSRS
// (see docs/review-design.md) and persists progress in localStorage.

const els = {
  stage: document.querySelector('.stage'),
  tabs: document.querySelectorAll('.tab'),
  deckButton: document.getElementById('deck-button'),
  deckButtonLabel: document.getElementById('deck-button-label'),
  deckButtonIcon: document.querySelector('#deck-button .deck-button-icon'),
  deckPickerTitle: document.getElementById('deck-picker-title'),
  deckPicker: document.getElementById('deck-picker'),
  deckPickerSearch: document.getElementById('deck-picker-search'),
  deckPickerTree: document.getElementById('deck-picker-tree'),
  reviewOnlyEmpty: document.getElementById('review-only-empty'),
  reviewOnlyEmptyTitle: document.querySelector('#review-only-empty .review-only-empty-title'),
  card: document.getElementById('card'),
  thai: document.getElementById('card-thai'),
  translit: document.getElementById('card-translit'),
  backThai: document.getElementById('card-back-thai'),
  english: document.getElementById('card-english'),
  note: document.getElementById('card-note'),
  cardSpell: document.getElementById('card-spell'),
  cardSpellFront: document.getElementById('card-spell-front'), // Thai → English only: the front is Thai
  speakButtons: document.querySelectorAll('.speak-btn'),
  autoBadges: document.querySelectorAll('.auto-badge'),
  flipButtons: document.querySelectorAll('#card .flip-btn'), // not Recall's, which share the look (.review-flip)
  posBadges: document.querySelectorAll('.stat-pos'),
  learnPills: document.getElementById('learn-pills'),
  prevBtn: document.getElementById('prev-btn'),
  nextBtn: document.getElementById('next-btn'),
  orderButtons: document.querySelectorAll('.seg-btn[data-order]'),
  directionButtons: document.querySelectorAll('.seg-btn[data-direction]'),
  wordlistSection: document.getElementById('wordlist-section'),
  wordlistDeckName: document.getElementById('wordlist-deck-name'),
  wordtable: document.getElementById('wordtable'),
  wordtableHead: document.getElementById('wordtable-head'),
  wordtableBody: document.getElementById('wordtable-body'),
  settingsSection: document.getElementById('settings-section'),
  settingsModal: document.getElementById('settings-modal'),
  settingsButton: document.getElementById('settings-button'),
  setWaitAgain: document.getElementById('setting-wait-again'),
  setWaitHard: document.getElementById('setting-wait-hard'),
  setWaitEasy: document.getElementById('setting-wait-easy'),
  setRetention: document.getElementById('setting-retention'),
  reviewBy: document.getElementById('review-by'),
  reviewByButtons: document.querySelectorAll('[data-review-by]'),
  reviewByHelp: document.getElementById('review-by-help'),
  reviewBySwitch: document.querySelector('#review-by .segmented'),
  reviewOnlyEmptyHint: document.getElementById('review-only-empty-hint'),
  reviewOnlyAddAll: document.getElementById('review-only-add-all'),
  reviewOnlyAddName: document.getElementById('review-only-add-name'),
  reviewOnlyYes: document.getElementById('review-only-yes'),
  reviewOnlyIndividually: document.getElementById('review-only-individually'),
  reviewOnlyTopics: document.getElementById('review-only-topics'),
  reviewOnlyEverything: document.getElementById('review-only-everything'),
  deckPickerSearchRow: document.querySelector('#deck-picker .modal-search'),
  wordlistAddAll: document.getElementById('wordlist-add-all'),
  confirmModal: document.getElementById('confirm-modal'),
  confirmTitle: document.getElementById('confirm-title'),
  confirmMessage: document.getElementById('confirm-message'),
  confirmDontAskRow: document.getElementById('confirm-dont-ask-row'),
  confirmDontAsk: document.getElementById('confirm-dont-ask'),
  confirmOk: document.getElementById('confirm-ok'),
  confirmCancel: document.getElementById('confirm-cancel'),
  confirmSettings: document.querySelectorAll('[data-confirm-setting]'),
  updateBar: document.getElementById('update-bar'),
  toast: document.getElementById('toast'),
  updateReload: document.getElementById('update-reload'),
  homeLink: document.getElementById('home-link'),
  homeCards: document.querySelectorAll('.home-card'),
  review: document.getElementById('review'),
  reviewCard: document.getElementById('review-card'),
  reviewSpell: document.getElementById('review-spell'),
  reviewSpellBack: document.getElementById('review-spell-back'),
  reviewBackThai: document.getElementById('review-back-thai'),
  reviewPrompt: document.getElementById('review-prompt'),
  reviewSpeak: document.getElementById('review-speak'),
  reviewFlip: document.getElementById('review-flip'),
  reviewMain: document.getElementById('review-main'),
  reviewTranslit: document.getElementById('review-translit'),
  reviewNote: document.getElementById('review-note'),
  reviewGrades: document.getElementById('review-grades'),
  resetAll: document.getElementById('reset-all'),
  resetSettings: document.getElementById('reset-settings'),
  resetReview: document.getElementById('reset-review'),
  setAudioSource: document.getElementById('setting-audio-source'),
  audioSourceHelp: document.getElementById('setting-audio-source-help'),
  setThaiSpeed: document.getElementById('setting-thai-speed'),
  setSpelling: document.getElementById('setting-spelling'),
  setTheme: document.getElementById('setting-theme'),
  setThaiFont: document.getElementById('setting-thai-font'),
  themeColorMeta: document.querySelector('meta[name="theme-color"]'),
  setTextSize: document.getElementById('setting-text-size'),
  setWordlistFirst: document.getElementById('setting-wordlist-first'),
  installHelp: document.getElementById('install-help'),
  installActions: document.getElementById('install-actions'),
  installBtn: document.getElementById('install-btn'),
  offlineHelp: document.getElementById('offline-help'),
  launchHelp: document.getElementById('launch-help'),
  wordlistAbout: document.getElementById('wordlist-about'),
  readingSection: document.getElementById('reading-section'),
  readingLibrary: document.getElementById('reading-library'),
  readingList: document.getElementById('reading-list'),
  readingPassage: document.getElementById('reading-passage'),
  readingBack: document.getElementById('reading-back'),
  readingName: document.getElementById('reading-name'),
  readingDesc: document.getElementById('reading-desc'),
  reader: document.getElementById('reader'),
  readerLines: document.getElementById('reader-lines'),
  readerPop: document.getElementById('reader-pop'),
  readerTranslit: document.getElementById('reader-translit'),
  readerEnglish: document.getElementById('reader-english'),
  readerSpaces: document.getElementById('reader-spaces'),
  backupExport: document.getElementById('backup-export'),
  backupLoad: document.getElementById('backup-load'),
  backupFile: document.getElementById('backup-file'),
  offlineProgress: document.getElementById('offline-progress'),
  offlineDownload: document.getElementById('offline-download'),
  offlineDelete: document.getElementById('offline-delete'),
  setReadRepeats: document.getElementById('setting-read-repeats'),
  setReadPause: document.getElementById('setting-read-pause'),
  setReadEnglish: document.getElementById('setting-read-english'),
  setLearnPause: document.getElementById('setting-learn-pause'),
  setWrongPause: document.getElementById('setting-wrong-pause'),
  setTestOrder: document.getElementById('setting-test-order'),
  settingsSearch: document.getElementById('settings-search'),
  settingsEmpty: document.getElementById('settings-empty'),
};

const STORAGE_KEY = 'learnthai:v1';

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const DEFAULT_SETTINGS = {
  waitAgainMin: 10,               // Again: back after this many minutes (scheduleItem)
  waitHardDays: 1,                // Hard: a new word's first wait; later waits grow from it
  waitEasyDays: 3,                // Easy (FSRS Good): a new word's first wait; later waits grow from it
  retention: 0.9,                 // FSRS desired retention
  confirmAddAll: true,            // Topics page "Add all to Flashcards" asks first (Settings → Topics)
  confirmRemoveAll: true,         // Topics page "✓ All in Flashcards" (remove all) asks first
  audioSource: 'samples',         // 'samples' (data/audio MP3s, TTS fallback) | 'browser' (always TTS); Thai and English
  thaiSpeed: 1,                   // playback speed multiplier for Thai audio (samples and TTS), 0.5–1
  theme: 'dark',                  // Settings → Display → Theme: dark | light | night
  thaiFont: 'looped',             // Settings → Display → Thai font: 'looped' (Noto Looped Thai) | 'loopless' (Noto Sans Thai)
  spellingStyle: 'vowels',        // the spell-aloud buttons: 'vowels' (names, vowels whole) | 'letters' (names, as written) | 'school' (sounds)
  textSize: 0,                    // -2..2 steps around the default text size (see TEXT_SCALES)
  offlineAudio: false,            // user chose "Download all audio": keep every clip cached
  readRepeats: 2,                 // times Read all says each word (Settings → Topics; 1 until 2026-10-08)
  readPauseSec: 1.5,              // seconds of silence between words
  readSpeakEnglish: true,         // whether to speak English after Thai
  learnPauseMs: 1500,             // Recognition: pause after a right answer before the next card
  wrongPauseMs: 4000,             // Recognition: pause after a wrong one (its own setting since 2026-10-08; 3 s at first)
  testOrder: 'random',            // Test-mode card order: 'random' | 'deck' (the deck's own order)
  wordlistFirst: 'thai',          // the Topics page's first column: 'thai' | 'english' (Settings → Topics)
};

const state = {
  decks: [],
  currentDeckId: null,       // the topic the Topics page shows (and Flashcards and Review By topic): a scope id (resolveScope)
  pickerFor: 'study',        // the topic picker was opened from 'study' (the Topics page), 'flashcards' or 'review'
  listCards: [],      // the topic's cards (with progress merged): the Topics page
  cards: [],          // Flashcards' cards: the same list By topic, every card on Everything (loadCards)
  flashScopeId: null, // the scope `cards` was built for: the topic's id, or 'all'
  queue: [],          // ordered indices into `cards`
  pos: 0,             // index into queue
  showingBack: false,
  view: 'home',       // 'home' | 'flashcards' (the Flashcards tab) | 'wordlist' (the Topics tab, once Wordlists). The Review tab ('today') became Flashcards' Review mode on 2026-10-08.
  readingId: null,    // the Reading page's open passage (renderReading), or null for the list. 'reading' is a view too, reached from Home.
  sort: { key: null, dir: 'asc' },
  orderMode: 'practice', // Flashcards' mode: 'practice' (Learn) | 'test' | 'review'
  direction: 'th-en', // 'th-en' (Thai on front, English on back) | 'en-th' (English on front, Thai on back) | 'listen' (the Thai's sound on front, as th-en behind)
  pickerOpen: false,
  pickerFilter: '',
  settingsOpen: false,
  expandedCategories: new Set(), // open picker categories; reset to the current deck's on each open (openDeckPicker)
  expandedGroups: new Set(),     // same for deck groups, keyed `${category}::${group}`
  lastFocus: null,
  reading: { active: false, token: 0, currentKey: null },
  relearn: new Map(),       // Recognition: card key -> relearning step (requeueRecognition)
  carry: [],                // Recognition: comebacks past the end of the pass, for the next one
  modeSnap: { practice: null, test: null }, // Browse's and Recognition's places while in another mode (snapMode)
  answerSeq: 0,             // Recognition: bumped to cancel a pending move to the next card
  learnAnswers: new Map(),  // cardKey -> { pickedText, isCorrect, seedSeen } for this session
  cardIndex: new Map(),     // cardKey -> { card, deckIds } across all decks (see buildCardIndex)
  review: null,             // Review mode's stream while it runs (see enterReview)
  confirm: null,            // the open confirm dialog: { resolve, setting, lastFocus }
};

// ---------- storage ----------

// The parsed store is cached: progress is read on every card, and re-parsing thousands of items
// each time would add up. Another tab writing the store drops the cache (the storage event).
let storeCache = null;
window.addEventListener('storage', (e) => { if (e.key === STORAGE_KEY) storeCache = null; });

function loadStore() {
  if (!storeCache) {
    try {
      storeCache = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch {
      storeCache = {};
    }
  }
  return storeCache;
}

function saveStore(store) {
  storeCache = store;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function getPreferences() {
  const store = loadStore();
  return store.prefs || { currentDeckId: null };
}

function setPreferences(prefs) {
  const store = loadStore();
  store.prefs = { ...(store.prefs || {}), ...prefs };
  saveStore(store);
}

function getSettings() {
  const store = loadStore();
  return { ...DEFAULT_SETTINGS, ...(store.settings || {}) };
}

// One-off moves of saved settings onto a new default. Settings are saved in full, so a save made
// before a default changed still holds the old one. Each step runs once per browser (recorded in
// store.settingsMigrations), so a value the user picks afterwards sticks.
const SETTINGS_MIGRATIONS = [
  // 2026-10-03: Test-mode pause default 3000 -> 1000 ms.
  ['pause-1000', (s) => (s.learnPauseMs === 3000 ? { learnPauseMs: 1000 } : null)],
  // 2026-10-05: Test-mode pause default 1000 -> 1500 ms. Runs after pause-1000, so 3000 ends at 1500.
  ['pause-1500', (s) => (s.learnPauseMs === 1000 ? { learnPauseMs: 1500 } : null)],
  // 2026-10-06: Review became manual by default (words you add); both automatic sources move to it.
  ['review-manual', (s) => (['started', 'current'].includes(s.newSource) ? { newSource: 'manual' } : null)],
  // 2026-10-06: the default spelling style became letter names (it was the school method).
  ['spelling-letters', (s) => (s.spellingStyle === 'school' ? { spellingStyle: 'letters' } : null)],
  // 2026-10-09: the default became letter names with whole vowels (เรียน: ร เรือ · สระเอีย · น หนู).
  ['spelling-vowels', (s) => (s.spellingStyle === 'letters' ? { spellingStyle: 'vowels' } : null)],
  // 2026-10-07: "Due reviews from: Current topic only" became Review → "By topic" (prefs.reviewBy),
  // which follows Wordlists and Flashcards' topic, group or category, and narrows new words too.
  ['review-by-topic', (s, store) => {
    if (s.reviewScope === 'current') store.prefs = { ...(store.prefs || {}), reviewBy: 'topic' };
    return null;
  }],
  // 2026-10-08: Read all says each word twice by default (it was once).
  ['read-repeats-2', (s) => (s.readRepeats === 1 ? { readRepeats: 2 } : null)],
];

function migrateSettings() {
  const store = loadStore();
  const done = new Set(store.settingsMigrations || []);
  for (const [id, step] of SETTINGS_MIGRATIONS) {
    if (done.has(id)) continue;
    const patch = store.settings && step(store.settings, store); // a step may also set store.prefs
    if (patch) store.settings = { ...store.settings, ...patch };
    done.add(id);
  }
  store.settingsMigrations = [...done];
  saveStore(store);
}

function setSettings(patch) {
  const store = loadStore();
  store.settings = { ...DEFAULT_SETTINGS, ...(store.settings || {}), ...patch };
  saveStore(store);
}

// ---------- review items & FSRS ----------
// Progress is kept per item: one card (by cardKey) in one direction, 'th-en' (see the Thai,
// recall the meaning) or 'en-th' (see the English, produce the Thai). Items live in store.items,
// global across decks, so a word that appears in several decks is learned once.
// Item fields: s stability (days), d difficulty (1–10), due, last (ms), reps, lapses,
// mc / mcOk (multiple-choice answers / was the last one right), rc (recall answers),
// u (th-en only: the en-th item is unlocked).
// Scheduling is FSRS-5 with its default parameters (see docs/review-design.md), plus three
// changes made 2026-10-06 because the defaults felt far too long for a beginner (scheduleItem,
// gradeItem):
//  - Hard means "only just": the next gap is at most 1.2× the last one, and at least a day longer.
//  - A correct multiple-choice answer counts as Hard: recognition is weaker evidence than recall.
//  - Answers repeated on the same study day don't lengthen the gap; only the first one each day
//    does. Misses on the same day still shorten it.

const FSRS_W = [0.40255, 1.18385, 3.173, 15.69105, 7.1949, 0.5345, 1.4604, 0.0046, 1.54575, 0.1192,
  1.01925, 1.9395, 0.11, 0.29605, 2.2698, 0.2315, 2.9898, 0.51655, 0.6621];
const FSRS_DECAY = -0.5;
const FSRS_FACTOR = 19 / 81;             // with DECAY, makes retrievability 90% after S days
const DAY_ROLLOVER_HOURS = 4;            // a study day runs 4 am to 4 am, so late-night reviews count for that day

const itemKeyOf = (key, dir) => `${key}##${dir}`;
const splitItemKey = (itemKey) => itemKey.split('##');

function getItem(itemKey) {
  return loadStore().items?.[itemKey] || null;
}

const fsrsR = (days, s) => Math.pow(1 + FSRS_FACTOR * days / s, FSRS_DECAY);   // retrievability
const fsrsInterval = (s, retention) => (s / FSRS_FACTOR) * (Math.pow(retention, 1 / FSRS_DECAY) - 1);
const fsrsClampD = (d) => Math.min(10, Math.max(1, d));
const fsrsInitD = (g) => fsrsClampD(FSRS_W[4] - Math.exp(FSRS_W[5] * (g - 1)) + 1);

function fsrsNextD(d, g) {
  const damped = d - FSRS_W[6] * (g - 3) * (10 - d) / 9;
  return fsrsClampD(FSRS_W[7] * fsrsInitD(4) + (1 - FSRS_W[7]) * damped);   // mean reversion
}

function fsrsRecallS(d, s, r, g) {
  const hard = g === 2 ? FSRS_W[15] : 1;
  const easy = g === 4 ? FSRS_W[16] : 1;
  return s * (Math.exp(FSRS_W[8]) * (11 - d) * Math.pow(s, -FSRS_W[9]) * (Math.exp(FSRS_W[10] * (1 - r)) - 1) * hard * easy + 1);
}

function fsrsForgetS(d, s, r) {
  return Math.min(s, FSRS_W[11] * Math.pow(d, -FSRS_W[12]) * (Math.pow(s + 1, FSRS_W[13]) - 1) * Math.exp(FSRS_W[14] * (1 - r)));
}

// The item after grading it g (1 Again, 2 Hard, 3 Good, 4 Easy) at `now`. Pure: doesn't save.
// `mc`: a multiple-choice answer. A correct one is scheduled as Hard (picking from three is
// recognition, weaker evidence than recall), and on the same day leaves the item as it was.
function scheduleItem(prev, grade, now, { mc = false } = {}) {
  const it = { ...(prev || {}) };
  const retention = getSettings().retention;
  const g = mc && grade > 2 ? 2 : grade;
  if (it.s == null) {
    // A new item: Hard and Easy (FSRS Good) start from Settings → Review's first waits, as the
    // stability whose interval is that many days; FSRS grows it from there. Others: FSRS's own.
    const first = { 2: getSettings().waitHardDays, 3: getSettings().waitEasyDays }[g];
    it.s = first ? first / fsrsInterval(1, retention) : FSRS_W[g - 1];
    it.d = fsrsInitD(g);
  } else {
    const days = Math.max(0, (now - it.last) / DAY);
    const sameDay = dayKey(now) === dayKey(it.last);
    if (sameDay && mc && grade > 1) {
      it.reps = (it.reps || 0) + 1; // a correct multiple-choice repeat on the same day: no change
      return it;
    }
    const d = it.d;
    it.d = fsrsNextD(d, g);
    if (sameDay) {
      // Same study day: FSRS's short-term update, but never upwards, so repeating a word (another
      // Test round, a requeue) doesn't push it further out. Misses and Hard still shorten it.
      it.s *= Math.min(1, Math.exp(FSRS_W[17] * (g - 3 + FSRS_W[18])));
    } else if (g === 1) {
      it.s = fsrsForgetS(d, it.s, fsrsR(days, it.s));
      it.lapses = (it.lapses || 0) + 1;
    } else {
      it.s = fsrsRecallS(d, it.s, fsrsR(days, it.s), g);
    }
    if (g === 2) {
      // Hard: at most 1.2× the last gap, and at least a day more than it. The last gap is the one
      // the item was given, or the time since its last review if that's longer (reviewed late).
      const gap = Math.max(days, (prev.due - prev.last) / DAY || 0);
      const cap = Math.max(Math.round(gap) + 1, Math.round(gap * 1.2));
      it.s = Math.min(it.s, cap / fsrsInterval(1, retention)); // the stability whose interval is `cap`
    }
  }
  it.s = Math.max(0.01, Math.round(it.s * 1000) / 1000);
  it.d = Math.round(it.d * 1000) / 1000;
  const interval = Math.max(1, Math.round(fsrsInterval(it.s, retention)));
  it.due = g === 1 ? now + getSettings().waitAgainMin * MINUTE : now + interval * DAY; // Again: Settings → Review
  it.last = now;
  it.reps = (it.reps || 0) + 1;
  return it;
}

// Grade an item and save it. mode: 'mc' (multiple choice) or 'recall'. deckId: where the card was
// met, for the per-deck new-card count.
function gradeItem(key, dir, g, { mode = 'recall', deckId = null, now = Date.now() } = {}) {
  const itemKey = itemKeyOf(key, dir);
  const prev = getItem(itemKey);
  const it = scheduleItem(prev, g, now, { mc: mode === 'mc' });
  if (mode === 'mc') {
    it.mc = (it.mc || 0) + 1;
    it.mcOk = g > 1;
  } else {
    it.rc = (it.rc || 0) + 1;
  }
  // A word's en-th item unlocks once its meaning has been recalled after a gap of a day or more.
  if (dir === 'th-en' && g > 1 && prev?.last && now - prev.last >= 0.9 * DAY) it.u = 1;
  const store = loadStore();
  (store.items ||= {})[itemKey] = it;
  const day = dayLog(store, now);
  day.g = (day.g || 0) + 1;
  if (g > 1) day.ok = (day.ok || 0) + 1;
  if (!prev) {
    day.n = (day.n || 0) + 1;
    if (deckId) (day.nd ||= {})[deckId] = (day.nd?.[deckId] || 0) + 1;
  }
  saveStore(store);
  return it;
}

// Study days: 4 am to 4 am local time.
function dayKey(ts = Date.now()) {
  const d = new Date(ts - DAY_ROLLOVER_HOURS * HOUR);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function endOfStudyDay(ts = Date.now()) {
  const d = new Date(ts - DAY_ROLLOVER_HOURS * HOUR);
  d.setHours(0, 0, 0, 0);
  return d.getTime() + DAY + DAY_ROLLOVER_HOURS * HOUR;
}

// Today's counters in store.daily (g gradings, ok correct, n new items, nd new per deck; rv, due
// reviews done, until Review's daily maximum went on 2026-10-08). Keeps the last 60 days.
function dayLog(store, now = Date.now()) {
  store.daily ||= {};
  const key = dayKey(now);
  if (!store.daily[key]) {
    store.daily[key] = {};
    const keys = Object.keys(store.daily);
    for (const old of keys.slice(0, Math.max(0, keys.length - 60))) delete store.daily[old];
  }
  return store.daily[key];
}

// One-off (2026-10-05): per-deck Leitner progress becomes th-en items. Box → rough stability; due
// dates are kept. Cards already reviewed skip multiple choice (rc: 1); box 2+ unlocks en-th.
function migrateLeitnerToItems() {
  const store = loadStore();
  const done = new Set(store.settingsMigrations || []);
  if (done.has('fsrs-items')) return;
  const items = store.items || {};
  const stabilityForBox = [0, 1, 3, 7, 14, 30];
  const now = Date.now();
  for (const prog of Object.values(store.decks || {})) {
    for (const [key, p] of Object.entries(prog?.cards || {})) {
      if (!p || !(p.seen > 0)) continue;
      const itemKey = itemKeyOf(key, 'th-en');
      const s = stabilityForBox[clamp(p.box || 1, 1, 5)];
      if (items[itemKey] && items[itemKey].s >= s) continue; // the same card may be further on in another deck
      items[itemKey] = { s, d: 5, due: p.dueAt || now, last: p.lastSeen || now, reps: p.seen, lapses: 0, rc: 1, ...(p.box >= 2 ? { u: 1 } : {}) };
    }
  }
  store.items = items;
  delete store.decks;
  done.add('fsrs-items');
  store.settingsMigrations = [...done];
  saveStore(store);
}

// ---------- data loading ----------

async function loadDecks() {
  const res = await fetch('data/decks.json');
  if (!res.ok) throw new Error(`Failed to load decks: ${res.status}`);
  const data = await res.json();
  return data.decks;
}

// Built by tools/gen_audio.py. If it's missing, everything just uses browser TTS.
async function loadAudioManifest() {
  const files = { th: {}, en: {}, sp: {} };   // sp: spelling parts (tools/spelling.mjs)
  try {
    const res = await fetch('data/audio/manifest.json');
    if (!res.ok) return files;
    const m = await res.json();
    for (const lang of Object.keys(files)) files[lang] = m[lang]?.files || {};
  } catch {
    // fall through with empty maps
  }
  return files;
}

function cardKey(card) {
  // Stable id per card; thai+english is unique enough for hand-curated decks.
  return `${card.thai}::${card.english}`;
}

// Deck mode's view of progress: each card with its item in the current direction.
function mergeProgressIntoCards(deckCards) {
  const items = loadStore().items || {};
  return deckCards.map((c) => {
    const key = cardKey(c);
    const it = items[itemKeyOf(key, state.direction)];
    // dueAt 0 = never answered (always eligible).
    return { ...c, key, seen: it?.reps || 0, dueAt: it ? it.due : 0 };
  });
}

// cardKey -> { card, deckIds }: Today's review works across all decks.
function buildCardIndex() {
  state.cardIndex = new Map();
  for (const d of state.decks) {
    for (const c of d.cards) {
      const key = cardKey(c);
      if (!state.cardIndex.has(key)) state.cardIndex.set(key, { card: c, deckIds: [] });
      state.cardIndex.get(key).deckIds.push(d.id);
    }
  }
}

// ---------- queue building ----------

function buildQueue(cards) {
  const all = cards.map((_, i) => i);
  // Learn: list order.
  if (state.orderMode === 'practice') return all;
  // Test: every card once per round, in Settings → Flashcards → Card order: list order, or random
  // with new words (never answered in this direction, e.g. just added to Review) first, shuffled
  // among themselves (the user's request, 2026-10-07). Smart order, which put due cards first and
  // weighted the rest by stability, went on 2026-10-08: spacing is Review mode's job.
  if (getSettings().testOrder === 'deck') return all;
  const isNew = (i) => cards[i].dueAt === 0;
  const queue = shuffled(all);
  return [...queue.filter(isNew), ...queue.filter((i) => !isNew(i))];
}

// ---------- "Review words only": Flashcards shows the topic's words that are in Review ----------
// The only behaviour since 2026-10-07 (it was a setting, on by default). A note under the card says
// so; with none in Review there's no card, just a message to add some from Wordlists.

// The topic's words in Review (maybe none): what Flashcards goes through.
function reviewOnlyCards() {
  const words = reviewWords();
  return state.cards.filter((c) => c.key in words);
}

// Which words those are, as a string, to tell when that's changed.
const reviewOnlySignature = () => reviewOnlyCards().map((c) => c.key).join('\n');

// The Flashcards queue: indices into state.cards, which stays the whole topic, or every card on
// Everything (Test-mode answer choices come from it too).
function buildFlashcardQueue() {
  const queue = buildQueue(state.cards);
  const keep = reviewOnlyCards();
  state.reviewOnlySig = keep.map((c) => c.key).join('\n');
  const keys = new Set(keep.map((c) => c.key));
  return queue.filter((i) => keys.has(state.cards[i].key));
}

// With nothing in Review, the message in place of the card (the stage's .review-only-none hides
// it). Called from renderCard, so it follows every queue change. (Until 2026-10-07 a note under the
// card also said "Showing only words in Review: 2 of 286"; the user found it redundant once this was
// the only behaviour.)
function renderReviewOnly() {
  const empty = !!state.flashScopeId && state.queue.length === 0;
  els.reviewOnlyEmpty.hidden = !empty;
  els.stage.classList.toggle('review-only-none', empty);
  if (empty) {
    const scope = flashScope();
    els.reviewOnlyEmptyTitle.textContent = scope?.kind === 'all' ? 'No words in Flashcards yet'
      : !scope || scope.kind === 'topic' ? "None of this topic's words are in Flashcards yet" : `None of the words in ${scope.name} are in Flashcards yet`;
    // Three ways out (2026-10-10, the user's wording): add the whole topic (or group) here; add words
    // one by one in Topics; or switch to Everything, when that would show something. Each
    // has a button in its line. On Everything there's no topic to add, so the second line stands alone.
    const all = scope?.kind === 'all';
    els.reviewOnlyAddAll.hidden = all || !state.cards.length;
    els.reviewOnlyAddName.textContent = `'${scope?.name || 'this topic'}'`;
    els.reviewOnlyIndividually.textContent = els.reviewOnlyAddAll.hidden ? 'Add words' : 'Or add words individually';
    els.reviewOnlyEmptyHint.hidden = all || !Object.keys(reviewWords()).length;
  }
}

// After words go into or out of Review, or a setting changes. Away from Flashcards there's nothing
// to do: coming back rebuilds the queue if the set changed (setView). On Flashcards (since the
// card's Review button went, that's Settings opened over it) the queue is rebuilt at once, around
// the card on screen if it's still in.
function syncReviewOnly() {
  if (!state.flashScopeId || state.view !== 'flashcards' || reviewOnlySignature() === state.reviewOnlySig) {
    renderReviewOnly();
    return;
  }
  const c = currentCard();
  const queue = buildFlashcardQueue();
  let at = c ? queue.indexOf(state.cards.indexOf(c)) : -1;
  if (at > 0 && state.orderMode === 'test') {
    queue.unshift(...queue.splice(at, 1)); // a shuffled round: start it with this card
    at = 0;
  }
  state.queue = queue;
  state.pos = Math.max(at, 0);
  if (at >= 0) {
    updateStats(); // same card: just the "n / total"
    renderReviewOnly();
  } else {
    renderCard();
  }
}

function shuffled(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---------- rendering ----------

function currentCard() {
  if (state.queue.length === 0) return null;
  const idx = state.queue[state.pos];
  return state.cards[idx];
}

// The card's front text on a fixed-size card: a long Thai phrase on a small screen (or a large Text
// size) can overflow it, so shrink it a step at a time, down to 70%, until it fits. Ordinary words
// keep the full size. Runs after renderCard, on coming to Flashcards, on resize and on a Text size
// change. (The back scrolls, and Review's card grows, so they don't need it.)
// The front's big text on Flashcards' card and Review's.
function fitCardText() {
  fitText(els.thai);
  if (els.reviewPrompt) fitText(els.reviewPrompt);
}

function fitText(el) {
  el.style.fontSize = '';
  const face = el.closest('.face');
  if (!face?.offsetParent || !el.textContent) return;
  const cs = getComputedStyle(face);
  const room = face.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
  const base = parseFloat(getComputedStyle(el).fontSize);
  for (let k = 0.94; k > 0.69 && (el.scrollWidth > el.clientWidth + 1 || el.offsetHeight > room + 1); k -= 0.06) {
    el.style.fontSize = `${base * k}px`;
  }
}
let fitTimer = null;
window.addEventListener('resize', () => {
  clearTimeout(fitTimer);
  fitTimer = setTimeout(fitCardText, 150);
});
// The embedded Thai font can arrive after the first fit (font-display: swap), and it's wider than
// the fallback: fit again once it's in.
document.fonts?.addEventListener?.('loadingdone', () => fitCardText());

function renderCard() {
  renderReviewOnly();
  // Showing the back? Jump to the front before the new card's text goes in. Flipping back with
  // the animation would show the new card's answer for the first half of the turn.
  if (state.showingBack) setFlipped(false, { instant: true });
  const c = currentCard();
  if (!c) {
    els.learnPills.hidden = true;
    els.thai.textContent = '✓';
    els.backThai.hidden = true;
    els.translit.textContent = '';
    const dueLater = state.cards.find((card) => card.dueAt > Date.now());
    if (state.cards.length === 0) {
      els.english.textContent = 'No cards in this topic.';
      els.note.textContent = '';
    } else if (dueLater) {
      els.english.textContent = 'All caught up for now!';
      els.note.textContent = `Next card due ${formatRelative(dueLater.dueAt)}.`;
    } else {
      els.english.textContent = 'No cards available.';
      els.note.textContent = '';
    }
    els.cardSpell.hidden = true;
    els.cardSpellFront.hidden = true;
    setFlipped(false);
    updateStats();
    return;
  }
  // The .thai element acts as the front face; .english/.translit/.note are the back.
  // Direction decides which language sits where.
  // Thai → English's back also repeats the Thai, styled as the English (the user's request,
  // 2026-10-08). English → Thai's back already leads with it.
  // Listen → English (2026-10-08) is Thai → English with the front's Thai replaced by its sound: a
  // big 🔊 that plays it again (listenButton).
  const thaiSide = state.direction !== 'en-th';
  els.backThai.textContent = thaiSide ? c.thai : '';
  els.backThai.hidden = !thaiSide;
  if (thaiSide) {
    if (state.direction === 'listen') els.thai.replaceChildren(listenButton(c.thai));
    else els.thai.textContent = c.thai;
    els.thai.classList.remove('front-en');
    els.translit.textContent = c.translit;
    els.english.textContent = c.english;
    els.english.classList.remove('back-th');
  } else {
    els.thai.textContent = c.english;
    els.thai.classList.add('front-en');
    els.translit.textContent = c.translit;
    els.english.textContent = c.thai;
    els.english.classList.add('back-th');
  }
  noteText(els.note, c.note || '');
  renderSpelling();
  setFlipped(false);
  updateStats();
  renderLearnPills();
  // Auto-play Thai audio on navigation, only while the card is on screen (picking a deck or
  // changing a setting from the wordlist re-renders the hidden card too), and only if the Thai is
  // showing: English → Thai keeps quiet until the card is flipped (flipCard, handleLearnPick), or the
  // sound would give the answer away. An answered Test card opens on its Thai back.
  fitCardText();
  renderAutoBadges();
  if (state.view === 'flashcards' && state.orderMode !== 'review' && !state.reading.active) { // Review mode hides this card
    if ((state.direction !== 'en-th' || state.showingBack) && autoPlayOn()) speak(c.thai);
    else stopAudio(); // nothing to say yet, but don't carry on with the last card's word or spelling
  }
}

function formatRelative(ts) {
  const diff = ts - Date.now();
  if (diff <= 0) return 'now';
  const min = Math.round(diff / MINUTE);
  if (min < 60) return `in ${min} min${min === 1 ? '' : 's'}`;
  const hr = Math.round(diff / HOUR);
  if (hr < 24) return `in ${hr} hour${hr === 1 ? '' : 's'}`;
  const days = Math.round(diff / DAY);
  return `in ${days} day${days === 1 ? '' : 's'}`;
}

// Browse's "3 / 24" and ‹ ›. Recognition hides them: it's a stream, and you move on by answering.
function updateStats() {
  const posText = state.queue.length
    ? `${state.pos + 1} / ${state.queue.length}`
    : '—';
  els.posBadges.forEach((p) => { p.textContent = posText; });
  els.prevBtn.disabled = state.pos <= 0;
  els.nextBtn.disabled = state.pos >= state.queue.length - 1;
}

// `instant` skips the flip animation (.no-anim).
// Turning a card stops a spelling being read out (2026-10-09, the user's request): it's lighting the
// side being turned away. (While one is read, any sound playing is the spelling's own.)
function stopSpellingOnTurn(turning) {
  if (turning && spelling) stopAudio();
}

function setFlipped(flipped, { instant = false } = {}) {
  stopSpellingOnTurn(state.showingBack !== flipped);
  state.showingBack = flipped;
  if (instant) els.card.classList.add('no-anim');
  els.card.classList.toggle('flipped', flipped);
  if (instant) {
    void els.card.offsetWidth; // apply the new side before the transition comes back
    els.card.classList.remove('no-anim');
  }
}

// ---------- actions ----------

function flipCard() {
  const c = currentCard();
  if (!c) return;
  // In Test mode the card only flips via answer pill — unless the user has already
  // answered it, in which case they can freely flip to review.
  if (state.orderMode === 'test' && !state.learnAnswers.has(c.key)) return;
  setFlipped(!state.showingBack);
  // Turning to the side that speaks says the word (speakingSide).
  if (speakingSide(state.direction, state.showingBack) && autoPlayOn()) speak(c.thai);
}

// The side of a card that says its Thai when turned to (or shown): Thai → English's front (the
// script) and English → Thai's back (the answer), since 2026-10-08 (the user's request). Listen →
// English's front, the sound side, since 2026-10-09: it was the script-bearing back until then, so
// the sound played on turning to the answer and not on turning back to the question (the user's
// bug report). Each side's speaker plays on demand.
function speakingSide(dir, back) {
  return dir === 'en-th' ? back : !back;
}

// Auto-play (2026-10-09, the user's request): the card says its Thai by itself when it shows it,
// unless turned off with the A on the speaker (pref autoPlay). Off, it keeps quiet until the
// speaker is pressed: learning to recognise letters, the sound would give the answer away. Listen
// always plays, as there the sound is the question (and its A is hidden).
function autoPlayOn() {
  return state.direction === 'listen' || getPreferences().autoPlay !== false;
}

function renderAutoBadges() {
  const on = getPreferences().autoPlay !== false;
  els.autoBadges.forEach((b) => {
    b.hidden = state.direction === 'listen' || !!b.previousElementSibling?.hidden; // with its speaker
    b.setAttribute('aria-pressed', String(on));
    b.title = on ? 'Auto-play is on: tap to turn it off' : 'Auto-play is off: tap to turn it on';
  });
}

// Recognition answers ('good' or 'again') update the same items as Recall: right counts as Hard,
// wrong as Very Hard (gradeItem, mode 'mc').
function saveDeckRating(c, rating) {
  const deckId = flashScope()?.deckOf.get(c.key)?.id || state.currentDeckId; // the card's own topic
  const it = gradeItem(c.key, state.direction, rating === 'again' ? 1 : 3, { mode: 'mc', deckId });
  c.dueAt = it.due;
  c.seen = it.reps;
}

function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n));
}

// ---------- Recognition: a continuous stream ----------
// Since 2026-10-08 (the user's request) Recognition (was Test) isn't a round with a score: it's a
// stream with no ‹ ›, where answering moves you on. Words come round in passes, in Settings →
// Card order (each pass rebuilt, reshuffled if Random, never starting with the card just seen).
// A miss is relearnt, expanding retrieval practice (Landauer & Bjork) as in Recall:
// - wrong: back RELEARN_GAPS[1] cards later (step 1);
// - right at step 1: once more RELEARN_GAPS[2] cards later (step 2), to make sure it's stuck;
// - right at step 2, or first time: back to the normal rotation.
// A wrong answer at any step starts again from step 1.
const RELEARN_GAPS = { 1: [2, 4], 2: [6, 9] };

// A fresh stream: no words being relearnt, and no pending move to the next card.
function resetRecognition() {
  state.relearn = new Map();
  state.carry = [];
  state.answerSeq += 1;
}

function requeueRecognition(c, isCorrect) {
  const step = isCorrect ? (state.relearn.get(c.key) === 1 ? 2 : 0) : 1;
  if (!step) {
    state.relearn.delete(c.key);
    return;
  }
  state.relearn.set(c.key, step);
  const [lo, hi] = RELEARN_GAPS[step];
  const at = state.pos + 1 + lo + Math.floor(Math.random() * (hi - lo + 1));
  // Past the end of this pass: into the next one, the same distance on (appending it here could
  // bring it straight back).
  if (at > state.queue.length) state.carry.push({ idx: state.queue[state.pos], at: at - state.queue.length });
  else state.queue.splice(at, 0, state.queue[state.pos]);
}

// Recognition's next card: on through the pass, then straight into the next one.
function advance() {
  state.learnAnswers = new Map(); // a card that comes round again starts unanswered
  state.pos += 1;
  if (state.pos >= state.queue.length) {
    const last = state.queue[state.queue.length - 1];
    // Comebacks carried over take the place of that card's turn in the new pass: take those cards
    // out first, then put each in at its distance (in order, so one can't shift another).
    const carried = new Map(state.carry.map((c) => [c.idx, c.at])); // a card's latest comeback wins
    const queue = buildFlashcardQueue().filter((i) => !carried.has(i));
    if (queue.length > 1 && queue[0] === last) [queue[0], queue[1]] = [queue[1], queue[0]];
    for (const [idx, at] of [...carried].sort((x, y) => x[1] - y[1])) queue.splice(Math.min(queue.length, at), 0, idx);
    state.carry = [];
    state.queue = queue;
    state.pos = 0;
  }
  renderCard();
}

// Browse's ‹ ›.
function goPrev() {
  if (state.orderMode === 'test' || state.pos <= 0) return;
  state.pos -= 1;
  renderCard();
}

function goNext() {
  if (state.orderMode === 'test' || state.pos >= state.queue.length - 1) return;
  state.pos += 1;
  renderCard();
}

// ---------- scopes: a topic, a group of topics, or a whole category ----------
// The Topics page and Flashcards show a scope (state.currentDeckId, prefs.currentDeckId);
// Flashcards can also be on Everything (flashScope()). A scope id is a topic's id,
// `group:<category>::<group>`, `cat:<category>`, or (Flashcards only) 'all'. resolveScope() gives { id, kind, name, label,
// description, decks, cards, deckOf }: cards are the decks' cards with repeats dropped (a word in
// two topics counts once), and deckOf maps a card key to the first of the scope's decks with it.
const scopeCache = new Map();
function resolveScope(id) {
  if (!id) return null;
  if (scopeCache.has(id)) return scopeCache.get(id);
  const catOf = (d) => d.category || 'Uncategorized';
  let kind = 'topic';
  let name = '';
  let decks = [];
  if (id === 'all') {
    [kind, name, decks] = ['all', 'Everything', state.decks];
  } else if (id.startsWith('cat:')) {
    [kind, name] = ['category', id.slice(4)];
    decks = state.decks.filter((d) => catOf(d) === name);
  } else if (id.startsWith('group:')) {
    const [cat, group] = id.slice(6).split('::');
    [kind, name] = ['group', group];
    decks = state.decks.filter((d) => catOf(d) === cat && d.group === group);
  } else {
    const d = state.decks.find((x) => x.id === id);
    if (d) [name, decks] = [d.name, [d]];
  }
  if (!decks.length) return null;
  const deckOf = new Map();
  const cards = [];
  for (const d of decks) {
    for (const c of d.cards) {
      const key = cardKey(c);
      if (deckOf.has(key)) continue;
      deckOf.set(key, d);
      cards.push(c);
    }
  }
  const n = decks.length;
  const many = kind === 'group' || kind === 'category';
  const scope = {
    id, kind, name, decks, cards, deckOf,
    description: many ? `All ${n} topics` : kind === 'all' ? 'Every topic' : decks[0].description || '',
    label: many ? `${name} · all ${n} topics` : name,
  };
  scopeCache.set(id, scope);
  return scope;
}
const currentScope = () => resolveScope(state.currentDeckId);
const groupScopeId = (cat, group) => `group:${cat}::${group}`;

// What Flashcards shows, in every mode: Everything (every word in Review), or "By topic"
// (prefs.flashcardsBy, the default), the topic the Topics page shows. Set in Flashcards' topic
// dialog (the user's request, 2026-10-07). Review mode follows it since Review moved into
// Flashcards (2026-10-08); Review's own switch (prefs.reviewBy) went with the Review tab.
const flashcardsByAll = () => getPreferences().flashcardsBy === 'all';
function flashScope() {
  return flashcardsByAll() ? resolveScope('all') : currentScope();
}

function setFlashcardsBy(by) {
  if (getPreferences().flashcardsBy === by || (by === 'topic' && !flashcardsByAll())) return;
  setPreferences({ flashcardsBy: by });
  reloadFlashcards();
  renderDeckButton();
  if (state.flashScopeId) preloadDeckAudio(flashScope());
}

// The topic's cards for the Topics page, and Flashcards': the same list By topic; on Everything
// every card (its queue keeps the words in Review, and Test mode draws answer choices from all).
// Both keep resolveScope's order, so a queue's indices stay valid across a reload.
function loadCards() {
  const topic = currentScope();
  state.listCards = topic ? mergeProgressIntoCards(topic.cards) : [];
  state.cards = flashcardsByAll() ? mergeProgressIntoCards(resolveScope('all').cards) : state.listCards;
}

// A new Flashcards round for its current scope. In Review mode, a new session for it.
function reloadFlashcards() {
  if (state.review) stopAudio();
  discardModes();
  resetRecognition();
  state.learnAnswers = new Map();
  loadCards();
  state.flashScopeId = flashScope()?.id || null;
  state.queue = buildFlashcardQueue();
  state.pos = 0;
  renderReviewOnly();
  renderCard();
  enterReview();
}

// Changing what Review covers (the topic, the direction, the mode) starts the stream afresh.
// Grades are saved as you go.
function leaveReviewSession() {
  if (!state.review) return;
  stopAudio();
  state.review = null;
  renderToday();
}

// Recall's stream starts when you choose the mode, a direction or a topic, or come to Flashcards in
// Recall with none running. It's kept while you're in another mode or on another page.
function enterReview() {
  if (state.orderMode !== 'review') return;
  // Back in Recall: carry on with its stream, the same card from its front.
  if (state.review && state.view === 'flashcards') presentEntry();
  if (!state.review && state.view === 'flashcards' && state.cardIndex.size) {
    const pool = reviewPool();
    if (pool.length) {
      state.review = {
        count: 0,             // cards shown so far
        shownAt: new Map(),   // itemKey -> count when last shown
        returnAt: new Map(),  // itemKey -> count from which a missed or hard card comes back
        sinceNew: 0,          // cards since the last new word
        lastKey: null,
        current: null,
        revealed: false,
        answered: false,
      };
      preloadDeckAudio({ cards: pool.map((e) => state.cardIndex.get(e.key).card) });
      nextEntry();
    }
  }
  renderToday();
}

// The topic button: what the page shows (Flashcards can be on Everything).
function renderDeckButton() {
  const scope = state.view === 'flashcards' ? flashScope() : currentScope();
  els.deckButtonLabel.textContent = scope?.label || 'Choose a topic';
  els.deckButtonIcon.textContent = !scope || scope.kind === 'topic' ? '📖' : '📚';
}

function selectDeck(deckId) {
  const deck = resolveScope(deckId);
  if (!deck || deck.kind === 'all') return;
  if (state.reading.active) stopReadAloud();
  state.currentDeckId = deckId;
  setPreferences({ currentDeckId: deckId });
  // Flashcards on Everything carries on; otherwise it starts the new topic.
  if ((flashcardsByAll() ? 'all' : deckId) !== state.flashScopeId) reloadFlashcards();
  else state.listCards = mergeProgressIntoCards(deck.cards);
  renderDeckButton();
  if (state.orderMode !== 'review' || state.view !== 'flashcards') preloadDeckAudio(deck); // a session preloads its own
  renderWordlist();
  if (state.view === 'reading') { // Reading lists the new topic's stories
    state.readingId = null;
    renderReading();
  }
}

// ---------- deck picker modal ----------

// "Known" = the meaning (th-en) is held for 10 days or more.
function deckProgress(deckId, deck) {
  const items = loadStore().items || {};
  let known = 0;
  for (const c of deck.cards) {
    if ((items[itemKeyOf(cardKey(c), 'th-en')]?.s || 0) >= 10) known += 1;
  }
  return { known, total: deck.cards.length };
}

// The picker tree: category -> items, where an item is a deck or a group of decks (a deck's
// optional `group` field). Order follows decks.json. With a search query, only matching decks
// are kept and everything is open; otherwise what's open is state.expandedCategories / Groups.
// openDeckPicker resets those to the current deck's category and group.
function pickerModel(q) {
  const cats = new Map();
  for (const d of state.decks) {
    if (d.passage) continue; // Reading's passages have their own page
    const cat = d.category || 'Uncategorized';
    // Names only: descriptions matched too until word search (2026-10-08), whose results they
    // pushed off a phone screen ("like" found nine topics).
    if (q && ![d.name, cat, d.group || ''].some((s) => s.toLowerCase().includes(q))) continue;
    if (!cats.has(cat)) {
      cats.set(cat, {
        name: cat,
        open: !!q || state.expandedCategories.has(cat),
        deckCount: 0,
        items: [],
        groups: new Map(),
      });
    }
    const c = cats.get(cat);
    c.deckCount += 1;
    if (!d.group) {
      c.items.push({ deck: d });
      continue;
    }
    if (!c.groups.has(d.group)) {
      const key = `${cat}::${d.group}`;
      const g = {
        name: d.group,
        key,
        open: !!q || state.expandedGroups.has(key),
        decks: [],
      };
      c.groups.set(d.group, g);
      c.items.push({ group: g });
    }
    c.groups.get(d.group).decks.push(d);
  }
  return [...cats.values()];
}

// The picker always picks the shared topic. Opened from Flashcards, it also has Everything / By
// topic at the top (renderReviewBy), and picking a topic means By topic there.
function pickerSelectedId() {
  return state.currentDeckId;
}

// Whether the page the picker was opened from is By topic (the Topics page always is).
function pickerByTopic() {
  return state.pickerFor !== 'flashcards' || !flashcardsByAll();
}

function pickScope(id) {
  if (pickerByTopic() && id === state.currentDeckId) { // the same choice again: carry on
    closeDeckPicker();
    return;
  }
  if (state.pickerFor === 'flashcards') setPreferences({ flashcardsBy: 'topic' });
  selectDeck(id); // rebuilds Flashcards (and a Review session) if its scope changed
  renderDeckButton();
  closeDeckPicker();
}

// Flashcards' dialog: Everything hides the topic list (there's nothing to pick); By topic shows
// it. The Topics page's dialog is just the list.
function renderReviewBy() {
  const has = state.pickerFor === 'flashcards';
  const topic = pickerByTopic();
  els.reviewBy.hidden = !has;
  els.reviewByButtons.forEach((b) => b.setAttribute('aria-checked', String((b.dataset.reviewBy === 'topic') === topic)));
  els.reviewByHelp.textContent = topic ? 'Shared with the Topics page' : "Every word you've added to Flashcards";
  const list = !has || topic;
  els.deckPickerSearchRow.hidden = !list;
  els.deckPickerTree.hidden = !list;
  els.deckPicker.classList.toggle('review-all', !list); // just the switch: the dialog shrinks to fit
}

// A category or group heading: the collapsible header and, on its right, "All N" to pick all of it.
function pickerHead(prefix, name, countText, container, q, openSet, key, scopeId) {
  const row = document.createElement('div');
  row.className = `${prefix}-head`;
  const all = document.createElement('button');
  all.type = 'button';
  all.className = 'scope-all' + (scopeId === pickerSelectedId() ? ' current' : '');
  const words = resolveScope(scopeId)?.cards.length || 0;
  all.textContent = `All ${words}`;
  all.title = `All of ${name}: ${words} words`;
  all.setAttribute('aria-label', all.title);
  all.addEventListener('click', () => pickScope(scopeId));
  row.append(pickerHeader(prefix, name, countText, container, q, openSet, key), all);
  return row;
}

// Collapsible header for a category ('cat') or group ('sub'); toggling records the choice in openSet.
// It's an accordion: opening one closes its open siblings (other categories, or other groups in
// the same category).
function pickerHeader(prefix, name, countText, container, q, openSet, key) {
  container.dataset.key = key;
  const header = document.createElement('button');
  header.type = 'button';
  header.className = `${prefix}-header`;
  header.innerHTML = `<span class="${prefix}-caret">▾</span><span class="${prefix}-name"></span><span class="${prefix}-count"></span>`;
  header.querySelector(`.${prefix}-name`).textContent = name;
  header.querySelector(`.${prefix}-count`).textContent = countText;
  header.addEventListener('click', () => {
    if (q) return; // collapsing while searching would be confusing
    const nowOpen = container.classList.toggle('collapsed') === false;
    if (!nowOpen) {
      openSet.delete(key);
      return;
    }
    openSet.add(key);
    for (const sib of container.parentElement.querySelectorAll(`:scope > .${prefix}-group`)) {
      if (sib === container || sib.classList.contains('collapsed')) continue;
      sib.classList.add('collapsed');
      openSet.delete(sib.dataset.key);
    }
    // A section closing above can move this one off screen.
    header.scrollIntoView({ block: 'nearest' });
  });
  return header;
}

function pickerDeckRow(d) {
  const { known, total: cards } = deckProgress(d.id, d);
  const pct = cards === 0 ? 0 : Math.round((known / cards) * 100);
  const row = document.createElement('button');
  row.type = 'button';
  row.className = 'deck-row' + (d.id === pickerSelectedId() ? ' current' : '');
  row.innerHTML = `
    <span class="deck-row-main">
      <span class="deck-row-name"></span>
      <span class="deck-row-desc"></span>
    </span>
    <span class="deck-row-bar"><span class="deck-row-bar-fill" style="width:${pct}%"></span></span>
    <span class="deck-row-count">${known}/${cards}</span>
  `;
  row.querySelector('.deck-row-name').textContent = d.name;
  textWithArrows(row.querySelector('.deck-row-desc'), d.description || '');
  row.addEventListener('click', () => pickScope(d.id));
  return row;
}

function pickerGroup(g, q, cat) {
  const wrap = document.createElement('div');
  wrap.className = 'sub-group' + (g.open ? '' : ' collapsed');
  let known = 0;
  let cards = 0;
  for (const d of g.decks) {
    const p = deckProgress(d.id, d);
    known += p.known;
    cards += p.total;
  }
  const count = `${g.decks.length} topic${g.decks.length === 1 ? '' : 's'} · ${known}/${cards}`;
  wrap.appendChild(pickerHead('sub', g.name, count, wrap, q, state.expandedGroups, g.key, groupScopeId(cat, g.name)));
  const list = document.createElement('div');
  list.className = 'sub-decks';
  for (const d of g.decks) list.appendChild(pickerDeckRow(d));
  wrap.appendChild(list);
  return wrap;
}

function renderDeckPicker() {
  const q = state.pickerFilter.trim().toLowerCase();
  const cats = pickerModel(q);
  els.deckPickerTree.innerHTML = '';

  for (const c of cats) {
    const group = document.createElement('div');
    group.className = 'cat-group' + (c.open ? '' : ' collapsed');
    const count = `${c.deckCount} topic${c.deckCount === 1 ? '' : 's'}`;
    group.appendChild(pickerHead('cat', c.name, count, group, q, state.expandedCategories, c.name, `cat:${c.name}`));
    const list = document.createElement('div');
    list.className = 'cat-decks';
    for (const item of c.items) {
      list.appendChild(item.deck ? pickerDeckRow(item.deck) : pickerGroup(item.group, q, c.name));
    }
    group.appendChild(list);
    els.deckPickerTree.appendChild(group);
  }

  const words = q ? wordSearch(q) : null;
  if (words?.total) els.deckPickerTree.appendChild(wordHitsSection(words));
  if (cats.length === 0 && !words?.total) {
    const empty = document.createElement('div');
    empty.className = 'modal-empty';
    empty.textContent = `Nothing matches "${state.pickerFilter.trim()}".`;
    els.deckPickerTree.appendChild(empty);
  }
}

// ---------- word search (the picker's search box, below the topics) ----------

// Added 2026-10-08: the user kept asking "do we have X?". A Thai query matches the Thai; any other
// matches the English or the transliteration. Ranked: the whole thing exactly, then one meaning of
// several ("time" in "once / time"), then starts-with (a word start, for English), then contains;
// one row per card key, however many topics share it.
const WORD_HITS_SHOWN = 40;
let searchIndex = null;

// Transliteration, loosely: no tone marks, hyphens or spaces, ʉ ɔ ɛ ə as u o e e (ue and ae typed
// for them too), and doubled letters single, so "nuea", "nua" and "nʉ̂a" all meet.
function looseTranslit(s) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/ʉ/g, 'u').replace(/ɔ/g, 'o').replace(/[ɛə]/g, 'e').replace(/ue/g, 'u').replace(/ae/g, 'e')
    .replace(/[^a-z]/g, '').replace(/(.)\1+/g, '$1');
}

function wordSearch(query) {
  if (!searchIndex) {
    searchIndex = [...state.cardIndex].map(([key, { card, deckIds }]) => ({
      key, card, deckIds,
      thai: card.thai.replace(/\s/g, ''),
      english: card.english.toLowerCase(),
      parts: card.english.toLowerCase().replace(/\([^)]*\)/g, '').split(/[/,;]/).map((s) => s.trim()),
      translit: looseTranslit(card.translit || ''),
    }));
  }
  const thai = /[฀-๿]/.test(query);
  const q = thai ? query.replace(/\s/g, '') : query.toLowerCase();
  if (!thai && q.length < 2) return { hits: [], total: 0 };
  const qt = thai ? '' : looseTranslit(q);
  const esc = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const wholeWord = new RegExp(`(^|[^a-z])${esc}($|[^a-z])`);
  const wordStart = new RegExp(`(^|[^a-z])${esc}`);
  const hits = [];
  for (const w of searchIndex) {
    let score = 4;
    if (thai) {
      if (w.thai === q) score = 0;
      else if (w.thai.startsWith(q)) score = 2;
      else if (w.thai.includes(q)) score = 3;
    } else {
      if (w.english === q) score = 0;
      else if (w.parts.includes(q)) score = 1;
      else if (wholeWord.test(w.english)) score = 1.5;
      else if (wordStart.test(w.english)) score = 2;
      else if (w.english.includes(q)) score = 3;
      // Just behind an English match of the same kind, so "same" finds "about the same" before
      // เสมอ (sà-mə̌ə, loosely "same"), but "nam" finds น้ำ before "name".
      if (qt.length >= 2 && score > 0) {
        if (w.translit === qt) score = Math.min(score, 1.75);
        else if (qt.length >= 3 && w.translit.startsWith(qt)) score = Math.min(score, 2.5);
        else if (qt.length >= 3 && w.translit.includes(qt)) score = Math.min(score, 3.5);
      }
    }
    if (score < 4) hits.push({ ...w, score });
  }
  hits.sort((a, b) => a.score - b.score || a.thai.length - b.thai.length);
  return { hits: hits.slice(0, WORD_HITS_SHOWN), total: hits.length };
}

function wordHitsSection({ hits, total }) {
  const section = document.createElement('div');
  section.className = 'word-hits';
  const head = document.createElement('div');
  head.className = 'word-hits-head';
  head.textContent = `${total} word${total === 1 ? '' : 's'}`;
  section.appendChild(head);
  const inFlashcards = reviewWords();
  for (const h of hits) section.appendChild(wordHitRow(h, h.key in inFlashcards));
  if (total > hits.length) {
    const more = document.createElement('p');
    more.className = 'word-hits-more';
    more.textContent = `Showing the best ${hits.length}. Type more to narrow it down.`;
    section.appendChild(more);
  }
  return section;
}

// A result: tap it to see the word in its topic (the current topic if it's there); ✓ adds it to
// Flashcards and 🔊 plays it, as on the Topics page.
function wordHitRow(h, added) {
  const row = document.createElement('div');
  row.className = 'word-hit';
  const main = document.createElement('button');
  main.type = 'button';
  main.className = 'word-hit-main';
  main.innerHTML = '<span class="word-hit-thai"></span><span class="word-hit-translit"></span><span class="word-hit-english"></span><span class="word-hit-topic"></span>';
  main.querySelector('.word-hit-thai').textContent = h.card.thai;
  main.querySelector('.word-hit-translit').textContent = h.card.translit || '';
  main.querySelector('.word-hit-english').textContent = h.card.english;
  // Its topic: the current one if it's there. A word found only in Reading's passages opens the
  // passage instead (they aren't topics on the Topics page).
  const topicIds = h.deckIds.filter((id) => !isPassage(id));
  const deckId = topicIds.includes(state.currentDeckId) ? state.currentDeckId : topicIds[0];
  if (deckId) {
    const others = topicIds.length - 1;
    main.querySelector('.word-hit-topic').textContent = (resolveScope(deckId)?.name || '') + (others ? ` +${others} more` : '');
    main.title = `Show ${h.card.thai} in its topic`;
    main.addEventListener('click', () => showWordInTopic(h.key, deckId));
  } else {
    const passageId = h.deckIds[0];
    main.querySelector('.word-hit-topic').textContent = `Reading: ${resolveScope(passageId)?.name || ''}`;
    main.title = `Show ${h.card.thai} in its passage`;
    main.addEventListener('click', () => {
      closeDeckPicker();
      openReading(passageId, h.card.thai);
    });
  }
  const rv = document.createElement('button');
  rv.type = 'button';
  const paint = () => {
    rv.className = 'row-review' + (added ? ' added' : '');
    rv.replaceChildren(added ? '✓' : reviewIcon());
    rv.title = added ? `Remove ${h.card.thai} from Flashcards` : `Add ${h.card.thai} to Flashcards`;
    rv.setAttribute('aria-label', rv.title);
  };
  paint();
  rv.addEventListener('click', () => {
    added = !added;
    setInReview([h.key], added);
    toast(added ? `✓ Added ${h.card.thai} to Flashcards` : `Removed ${h.card.thai} from Flashcards`, { tone: added ? 'good' : '' });
    paint();
  });
  const sp = document.createElement('button');
  sp.type = 'button';
  sp.className = 'row-speak' + (sayingNow(h.card.thai) ? ' playing' : '');
  sp.dataset.say = h.card.thai;
  sp.setAttribute('aria-label', `Play ${h.card.thai}`);
  sp.append(speakerIcon());
  sp.addEventListener('click', () => speakerPress(sp, h.card.thai));
  row.append(main, rv, sp);
  return row;
}

// Opens the word's topic on the Topics page, scrolled to the word and briefly highlighted.
function showWordInTopic(key, deckId) {
  closeDeckPicker();
  if (state.view !== 'wordlist') setView('wordlist');
  if (deckId !== state.currentDeckId) selectDeck(deckId);
  else renderWordlist();
  const row = els.wordtableBody.querySelector(`tr[data-key="${CSS.escape(key)}"]`);
  if (!row) return;
  row.scrollIntoView({ block: 'center' });
  row.classList.add('search-hit');
  setTimeout(() => row.classList.remove('search-hit'), 2500);
}

// On touch screens, don't auto-focus a modal's search box: on iOS, focusing an input inside a
// fixed-position sheet shifts the page underneath, after which the sheet can stop scrolling.
const TOUCH_SCREEN = window.matchMedia('(pointer: coarse)').matches;

// While a modal is open the page behind it is locked (html.modal-open), so scrolls stay in the sheet.
function setModalOpen(open) {
  document.documentElement.classList.toggle('modal-open', open);
}

function openDeckPicker() {
  state.pickerOpen = true;
  state.lastFocus = document.activeElement;
  els.deckPicker.hidden = false;
  setModalOpen(true);
  els.deckButton.setAttribute('aria-expanded', 'true');
  state.pickerFilter = '';
  els.deckPickerSearch.value = '';
  state.pickerFor = state.view === 'flashcards' ? 'flashcards' : 'study';
  els.deckPickerTitle.textContent = state.pickerFor === 'flashcards' ? 'What to study' : 'Choose a topic';
  renderReviewBy();
  // Every open starts from the current choice: its category and group open, the rest closed.
  const current = resolveScope(pickerSelectedId());
  state.expandedCategories.clear();
  state.expandedGroups.clear();
  if (current) {
    const d = current.decks[0];
    state.expandedCategories.add(d.category || 'Uncategorized');
    if (d.group && current.kind !== 'category') state.expandedGroups.add(`${d.category || 'Uncategorized'}::${d.group}`);
  }
  renderDeckPicker();
  els.deckPickerTree.querySelector('.deck-row.current, .scope-all.current')?.scrollIntoView({ block: 'center' });
  // Focus search after the modal becomes visible.
  if (!TOUCH_SCREEN) setTimeout(() => els.deckPickerSearch.focus(), 0);
}

function closeDeckPicker() {
  state.pickerOpen = false;
  els.deckPicker.hidden = true;
  setModalOpen(false);
  els.deckButton.setAttribute('aria-expanded', 'false');
  if (state.lastFocus && typeof state.lastFocus.focus === 'function') {
    state.lastFocus.focus();
  }
}

// ---------- settings modal ----------

function openSettings() {
  state.settingsOpen = true;
  state.lastFocus = document.activeElement;
  els.settingsModal.hidden = false;
  setModalOpen(true);
  els.settingsSection.scrollTop = 0;
  els.settingsButton.setAttribute('aria-expanded', 'true');
  renderSettings();
  if (!TOUCH_SCREEN) setTimeout(() => els.settingsSearch.focus(), 0);
}

function closeSettings() {
  state.settingsOpen = false;
  els.settingsModal.hidden = true;
  setModalOpen(false);
  els.settingsButton.setAttribute('aria-expanded', 'false');
  if (state.lastFocus && typeof state.lastFocus.focus === 'function') {
    state.lastFocus.focus();
  }
}

// ---------- view switching ----------

function setView(view) {
  const leaving = state.view;
  state.view = view;
  els.stage.dataset.view = view;
  els.tabs.forEach((t) => {
    t.setAttribute('aria-selected', t.dataset.view === view ? 'true' : 'false');
  });
  els.wordlistSection.hidden = view !== 'wordlist';
  els.readingSection.hidden = view !== 'reading';
  if (view === 'reading') renderReading();
  else hideWordPop();
  if (view !== 'wordlist' && state.reading.active) stopReadAloud();
  // Leaving Flashcards: Recall's audio stops, and a Recognition card's pending move waits for the
  // return (below).
  if (view !== 'flashcards' && leaving === 'flashcards') {
    if (state.review) stopAudio();
    state.answerSeq += 1;
  }
  renderDeckButton(); // Flashcards' button can say Everything
  if (view === 'flashcards') fitCardText(); // laid out only now if the card was hidden
  // Words added to or taken out of Review elsewhere (Wordlists, Review) apply on coming back.
  if (view === 'flashcards' && leaving !== 'flashcards' && state.flashScopeId && reviewOnlySignature() !== state.reviewOnlySig) {
    rebuildCurrentQueue();
    renderReviewOnly();
  }
  // Flashcards reopens in the mode you left, where you left it (the user's request, 2026-10-08;
  // that morning it always opened on Browse and leaving ended the streams). Direction is kept too
  // (prefs, like the mode).
  if (view === 'flashcards' && leaving !== 'flashcards') {
    if (state.orderMode === 'review') enterReview(); // Recall's stream: its card, or a new stream
    if (state.orderMode === 'test') {
      const c = currentCard();
      if (c && state.learnAnswers.has(c.key)) advance(); // answered (and saved) just before leaving
    }
  }
  setPreferences({ view });
}

// ---------- settings UI ----------

// Text size steps -> multiplier for the --fs CSS variable, which scales content text
// (cards, wordlist, deck picker, settings) but not the app chrome.
const TEXT_SCALES = { '-2': 0.8, '-1': 0.9, 0: 1, 1: 1.15, 2: 1.3 };

function applyTextSize() {
  document.documentElement.style.setProperty('--fs', TEXT_SCALES[getSettings().textSize] ?? 1);
  if (els.thai) fitCardText();
}

// The colour theme: data-theme on <html> picks a palette in styles.css (dark is the default, with
// no attribute). The status-bar colour (meta theme-color) follows the page. index.html applies the
// saved theme before first paint. Anything else saved (Dim, Sepia and "Match device" were removed)
// shows as Dark.
const THEMES = ['dark', 'light', 'night'];
function applyTheme() {
  let theme = getSettings().theme;
  if (!THEMES.includes(theme)) theme = 'dark';
  if (theme === 'dark') delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = theme;
  els.themeColorMeta?.setAttribute('content', getComputedStyle(document.documentElement).getPropertyValue('--bg').trim());
}

// The Thai font: data-thai-font on <html> switches --thai-font in styles.css (looped is the default,
// with no attribute). index.html applies the saved one before first paint.
function applyThaiFont() {
  if (getSettings().thaiFont === 'loopless') document.documentElement.dataset.thaiFont = 'loopless';
  else delete document.documentElement.dataset.thaiFont;
}

function renderSettings() {
  const s = getSettings();
  els.setWaitAgain.value = s.waitAgainMin;
  els.setWaitHard.value = s.waitHardDays;
  els.setWaitEasy.value = s.waitEasyDays;
  els.setRetention.value = String(s.retention);
  for (const box of els.confirmSettings) box.checked = s[box.dataset.confirmSetting] !== false;

  els.setAudioSource.value = s.audioSource;
  els.audioSourceHelp.textContent = audioSourceHelpText(s.audioSource);
  els.setThaiSpeed.value = String(s.thaiSpeed);
  els.setSpelling.value = s.spellingStyle;
  els.setTheme.value = THEMES.includes(s.theme) ? s.theme : 'dark';
  els.setThaiFont.value = s.thaiFont === 'loopless' ? 'loopless' : 'looped';
  els.setTextSize.value = String(s.textSize);
  els.setWordlistFirst.value = s.wordlistFirst;
  renderInstall();
  renderOffline();
  els.launchHelp.textContent = launchTimingText();
  els.setReadRepeats.value = s.readRepeats;
  els.setReadPause.value = s.readPauseSec;
  els.setReadEnglish.checked = s.readSpeakEnglish;
  els.setLearnPause.value = s.learnPauseMs / 1000; // shown in seconds, saved in ms
  els.setWrongPause.value = s.wrongPauseMs / 1000;
  els.setTestOrder.value = s.testOrder;

}

function bindSettings() {
  // The Again / Hard / Easy waits: whole numbers in range, or the box goes back to the saved value.
  for (const [input, key, lo, hi] of [[els.setWaitAgain, 'waitAgainMin', 1, 1440], [els.setWaitHard, 'waitHardDays', 1, 60], [els.setWaitEasy, 'waitEasyDays', 1, 60]]) {
    input.addEventListener('change', () => {
      const n = parseInt(input.value, 10);
      if (n >= lo && n <= hi) setSettings({ [key]: n });
      input.value = getSettings()[key];
    });
  }
  els.setRetention.addEventListener('change', () => {
    const r = parseFloat(els.setRetention.value);
    if (r >= 0.7 && r <= 0.97) setSettings({ retention: r });
  });
  els.confirmSettings.forEach((box) => box.addEventListener('change', () => {
    setSettings({ [box.dataset.confirmSetting]: box.checked });
  }));

  els.setAudioSource.addEventListener('change', () => {
    setSettings({ audioSource: els.setAudioSource.value });
    const deck = currentScope();
    if (deck) preloadDeckAudio(deck); // starts (samples) or cancels (browser) preloading
    renderSettings();
  });
  els.installBtn.addEventListener('click', async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    installPrompt = null;
    renderInstall();
  });
  // Opening Settings → Audio reads the saved clips for the count (renderOffline).
  els.offlineHelp.closest('details').addEventListener('toggle', (e) => {
    if (e.target.open) renderOffline();
  });
  els.backupExport.addEventListener('click', exportBackup);
  els.backupLoad.addEventListener('click', () => els.backupFile.click());
  els.backupFile.addEventListener('change', () => {
    const file = els.backupFile.files?.[0];
    els.backupFile.value = ''; // so picking the same file again still fires
    if (file) loadBackup(file);
  });
  els.offlineDownload.addEventListener('click', () => {
    if (offline.running) {
      setSettings({ offlineAudio: false }); // an explicit Stop also stops auto-download on load
      stopDownloadAll();
      return;
    }
    setSettings({ offlineAudio: true });
    navigator.storage?.persist?.(); // ask the browser not to evict the clips under storage pressure
    downloadAllAudio();
  });
  els.offlineDelete.addEventListener('click', async () => {
    const ok = await confirmDialog({
      title: 'Delete downloaded audio?',
      message: 'Clips will download again as you play them.',
      confirmLabel: 'Delete',
    });
    if (!ok) return;
    setSettings({ offlineAudio: false });
    setPreferences({ audioComplete: null });
    await offline.reading; // so a read under way can't bring the old names back
    await ClipStore.clear();
    offline.have = new Set();
    offline.used = null;
    rememberSavedCount();
    renderOffline();
    toast('Downloaded audio deleted');
  });
  els.setWordlistFirst.addEventListener('change', () => {
    setSettings({ wordlistFirst: els.setWordlistFirst.value === 'english' ? 'english' : 'thai' });
    renderWordlist();
  });
  els.setTextSize.addEventListener('change', () => {
    setSettings({ textSize: parseInt(els.setTextSize.value, 10) || 0 });
    applyTextSize();
  });
  els.setThaiFont.addEventListener('change', () => {
    setSettings({ thaiFont: els.setThaiFont.value });
    applyThaiFont();
  });
  els.setTheme.addEventListener('change', () => {
    setSettings({ theme: els.setTheme.value });
    applyTheme();
  });
  els.setSpelling.addEventListener('change', () => {
    setSettings({ spellingStyle: ['school', 'letters'].includes(els.setSpelling.value) ? els.setSpelling.value : 'vowels' });
    renderSpelling();
  });
  els.setThaiSpeed.addEventListener('change', () => {
    const n = parseFloat(els.setThaiSpeed.value);
    if (n >= 0.5 && n <= 1) setSettings({ thaiSpeed: n });
    // Preview the new speed on the current card.
    const c = currentCard();
    if (c) speak(c.thai);
  });
  els.setReadRepeats.addEventListener('change', () => {
    const n = parseInt(els.setReadRepeats.value, 10);
    if (n >= 1 && n <= 10) setSettings({ readRepeats: n });
  });
  els.setReadPause.addEventListener('change', () => {
    const n = parseFloat(els.setReadPause.value);
    if (n >= 0 && n <= 20) setSettings({ readPauseSec: n });
  });
  els.setReadEnglish.addEventListener('change', () => {
    setSettings({ readSpeakEnglish: els.setReadEnglish.checked });
  });
  els.setLearnPause.addEventListener('change', () => {
    const sec = parseFloat(els.setLearnPause.value);
    if (sec >= 0 && sec <= 5) setSettings({ learnPauseMs: Math.round(sec * 1000) });
  });
  els.setWrongPause.addEventListener('change', () => {
    const sec = parseFloat(els.setWrongPause.value);
    if (sec >= 0 && sec <= 10) setSettings({ wrongPauseMs: Math.round(sec * 1000) });
  });
  els.setTestOrder.addEventListener('change', () => {
    setSettings({ testOrder: els.setTestOrder.value });
    if (state.orderMode === 'test') rebuildCurrentQueue();
  });

  els.settingsSearch.addEventListener('input', (e) => filterSettings(e.target.value));

  // Sections start closed and work as an accordion: opening one closes the rest (not while
  // searching, when every section with a match is open).
  const cats = els.settingsSection.querySelectorAll('.settings-cat');
  for (const cat of cats) {
    cat.addEventListener('toggle', () => {
      if (!cat.open || els.settingsSearch.value.trim()) return;
      for (const other of cats) if (other !== cat) other.open = false;
    });
  }
}

function filterSettings(q) {
  const query = q.trim().toLowerCase();
  const groups = els.settingsSection.querySelectorAll('.setting-group[data-search]');
  const cats = els.settingsSection.querySelectorAll('.settings-cat');
  let anyVisible = false;

  for (const g of groups) {
    const haystack = (g.dataset.search + ' ' + g.textContent).toLowerCase();
    const match = !query || haystack.includes(query);
    g.classList.toggle('search-hidden', !match);
    if (match) anyVisible = true;
  }

  // Hide categories whose groups are all filtered out; open any with matches while searching,
  // and close those again when the search is cleared.
  for (const cat of cats) {
    const visibleGroups = cat.querySelectorAll('.setting-group:not(.search-hidden)');
    const hide = visibleGroups.length === 0;
    cat.classList.toggle('search-hidden', hide);
    if (query && !hide && !cat.open) {
      cat.open = true;
      cat.dataset.searchOpened = '1';
    } else if (!query && cat.dataset.searchOpened) {
      cat.open = false;
      delete cat.dataset.searchOpened;
    }
  }

  els.settingsEmpty.hidden = anyVisible;
}

function rebuildCurrentQueue() {
  if (!state.flashScopeId) return;
  // A rebuilt queue is a new round, and a fresh Recognition stream (answers are saved as given).
  resetRecognition();
  state.learnAnswers = new Map();
  state.queue = buildFlashcardQueue();
  state.pos = 0;
  renderCard();
}

function setOrderMode(mode) {
  if (!['practice', 'test', 'review'].includes(mode) || mode === state.orderMode) return;
  const leaving = state.orderMode;
  if (leaving !== 'review') state.modeSnap[leaving] = snapMode();
  state.orderMode = mode;
  els.stage.dataset.order = mode;
  els.orderButtons.forEach((b) => {
    b.setAttribute('aria-checked', b.dataset.order === mode ? 'true' : 'false');
  });
  state.answerSeq += 1; // cancels a pending move to the next card
  setPreferences({ orderMode: mode });
  if (leaving === 'review') stopAudio(); // Recall's stream itself stays in state.review
  if (mode === 'review') {
    enterReview();
  } else {
    if (leaving === 'review') loadCards(); // Recall's grades, for the cards' progress
    restoreMode(mode);
  }
}

// Each mode keeps its own place (the user's call, 2026-10-08, after trying one shared word): Browse
// its position, Recognition its stream (words waiting to come back included), Recall its stream
// (state.review). Changing direction or topic, or leaving Flashcards, starts them all afresh
// (discardModes).
function snapMode() {
  const c = currentCard();
  return {
    queue: state.queue, pos: state.pos, relearn: state.relearn, carry: state.carry, sig: state.reviewOnlySig,
    answered: !!(c && state.learnAnswers.has(c.key)), // Recognition left mid-pause
  };
}

function restoreMode(mode) {
  const snap = state.modeSnap[mode];
  state.modeSnap[mode] = null;
  // Never been here, or words have gone into or out of Flashcards since: start afresh.
  if (!snap || snap.sig !== reviewOnlySignature()) {
    rebuildCurrentQueue();
    return;
  }
  state.learnAnswers = new Map();
  Object.assign(state, { queue: snap.queue, pos: snap.pos, relearn: snap.relearn, carry: snap.carry, reviewOnlySig: snap.sig });
  // An answered Recognition card was saved when answered: carry on to the next one.
  if (mode === 'test' && snap.answered) advance();
  else renderCard();
}

function discardModes() {
  state.modeSnap = { practice: null, test: null };
  if (state.review) {
    state.review = null;
    renderToday();
  }
}

function setDirection(direction) {
  if (!['en-th', 'th-en', 'listen'].includes(direction)) return;
  state.direction = direction;
  els.directionButtons.forEach((b) => {
    b.setAttribute('aria-checked', b.dataset.direction === direction ? 'true' : 'false');
  });
  setPreferences({ direction });
  // Each direction has its own progress, so re-read it; every mode starts afresh.
  loadCards();
  if (state.review) stopAudio();
  discardModes();
  rebuildCurrentQueue();
  enterReview();
}

// ---------- wordlist ----------

function visibleWordlistRows() {
  let rows = state.listCards;
  if (state.sort.key) {
    const k = state.sort.key;
    const dir = state.sort.dir === 'asc' ? 1 : -1;
    rows = rows.slice().sort((a, b) => {
      const av = a[k] ?? '';
      const bv = b[k] ?? '';
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
      return String(av).localeCompare(String(bv), 'th') * dir;
    });
  }
  return rows;
}

function renderWordlist() {
  if (!state.currentDeckId) return;
  const deck = currentScope();
  if (!deck) return;
  // Several topics, in list order: a heading row before each topic's words.
  const topicHeadings = deck.decks.length > 1 && !state.sort.key;
  let lastTopic = null;

  // The name in bold, the description under it in normal weight (until 2026-10-08 both were one
  // bold line, "Name — description", five bold lines for some topics on a phone).
  const title = Object.assign(document.createElement('span'), { className: 'wordlist-title', textContent: deck.name });
  const desc = deck.description ? [textWithArrows(Object.assign(document.createElement('span'), { className: 'wordlist-desc' }), deck.description)] : [];
  els.wordlistDeckName.replaceChildren(title, ...desc);
  // A topic's optional `about` (decks.json), e.g. the consonant classes' memory scenes: text under
  // the heading. A blank line (\n\n) starts a new paragraph, so what Thai schools teach stands
  // apart from our own tricks (the user's request, 2026-10-08).
  const about = deck.kind === 'topic' ? deck.decks[0].about || '' : '';
  els.wordlistAbout.hidden = !about;
  // Keep each bracketed pair, e.g. "(ฮ นกฮูก)", on one line: a line can otherwise break at the space,
  // or inside a Thai word (นก|ฮูก).
  els.wordlistAbout.replaceChildren(...about.split(/\n\n+/).map((para) => {
    const el = document.createElement('p');
    for (const part of para.split(/(\([^()]*\))/)) {
      if (!part.startsWith('(')) appendNoteText(el, part);
      else {
        const span = document.createElement('span');
        span.className = 'nowrap';
        appendNoteText(span, part);
        el.append(span);
      }
    }
    return el;
  }));
  const words = reviewWords();

  const rows = visibleWordlistRows();

  // Build column order: chosen primary first, then the other two in fixed order.
  const COL_META = {
    thai:     { label: 'Thai',           cls: 'col-thai' },
    translit: { label: 'Transliteration', cls: 'col-translit' },
    english:  { label: 'English',        cls: 'col-english' },
  };
  const fixedOrder = ['thai', 'translit', 'english'];
  const first = getSettings().wordlistFirst === 'english' ? 'english' : 'thai';
  const cols = [first, ...fixedOrder.filter((k) => k !== first)];

  // Render header
  els.wordtableHead.innerHTML = '';
  const headRow = document.createElement('tr');
  for (const key of cols) {
    const th = document.createElement('th');
    th.dataset.sort = key;
    th.textContent = COL_META[key].label;
    if (state.sort.key === key) {
      th.classList.add(state.sort.dir === 'asc' ? 'sort-asc' : 'sort-desc');
    }
    th.addEventListener('click', () => {
      if (state.sort.key === key) {
        state.sort.dir = state.sort.dir === 'asc' ? 'desc' : 'asc';
      } else {
        state.sort.key = key;
        state.sort.dir = 'asc';
      }
      renderWordlist();
    });
    headRow.appendChild(th);
  }
  const audioTh = document.createElement('th');
  audioTh.setAttribute('aria-label', 'Audio');
  headRow.appendChild(audioTh);
  els.wordtableHead.appendChild(headRow);

  // Render rows
  els.wordtableBody.innerHTML = '';
  if (rows.length === 0) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td class="empty" colspan="4">No matches.</td>`;
    els.wordtableBody.appendChild(tr);
  } else {
    const frag = document.createDocumentFragment();
    for (const c of rows) {
      const topic = topicHeadings && deck.deckOf.get(c.key);
      if (topic && topic !== lastTopic) {
        lastTopic = topic;
        const th = document.createElement('tr');
        th.className = 'wl-topic';
        th.innerHTML = '<td colspan="4"></td>';
        th.firstChild.textContent = topic.name;
        frag.appendChild(th);
      }
      const tr = document.createElement('tr');
      tr.dataset.key = c.key;
      if (state.reading.active && state.reading.currentKey === c.key) {
        tr.classList.add('now-playing');
      }
      const added = c.key in words;
      for (const key of cols) {
        const td = document.createElement('td');
        td.className = COL_META[key].cls;
        td.textContent = c[key];
        // The Thai opens the word pop-up, as a word in the reader does (2026-10-09, the user's request).
        if (key === 'thai') {
          td.tabIndex = 0;
          td.setAttribute('role', 'button');
          td.title = 'Show the word';
          const open = (e) => {
            e.preventDefault();
            showWordPop(td, c, els.wordlistSection);
          };
          td.addEventListener('click', open);
          td.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') open(e); });
        }
        // English column gets the note appended below.
        if (key === 'english' && c.note) {
          const span = document.createElement('span');
          span.className = 'col-note';
          td.appendChild(noteText(span, c.note));
        }
        tr.appendChild(td);
      }
      const audioTd = document.createElement('td');
      audioTd.className = 'col-audio';
      // Add to / remove from Review, left of the speaker: the Review icon, or ✓ once added.
      const rv = document.createElement('button');
      rv.type = 'button';
      rv.className = 'row-review' + (added ? ' added' : '');
      rv.replaceChildren(added ? '✓' : reviewIcon());
      rv.title = added ? `Remove ${c.thai} from Flashcards` : `Add ${c.thai} to Flashcards`;
      rv.setAttribute('aria-label', rv.title);
      rv.addEventListener('click', () => {
        setInReview([c.key], !added);
        toast(added ? `Removed ${c.thai} from Flashcards` : `✓ Added ${c.thai} to Flashcards`, { tone: added ? '' : 'good' });
      });
      audioTd.append(rv);
      if (isSpellable(c.thai)) {
        const sp = document.createElement('button');
        sp.type = 'button';
        sp.className = 'row-spell';
        sp.append(spellIcon());
        sp.title = `Spell ${c.thai} aloud`;
        sp.setAttribute('aria-label', sp.title);
        sp.addEventListener('click', () => speakSpelling(c, [sp]));
        audioTd.append(sp);
      }
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'row-speak' + (sayingNow(c.thai) ? ' playing' : '');
      btn.dataset.say = c.thai;
      btn.setAttribute('aria-label', 'Play audio');
      btn.append(speakerIcon());
      btn.addEventListener('click', () => speakerPress(btn, c.thai));
      audioTd.appendChild(btn);
      tr.appendChild(audioTd);
      frag.appendChild(tr);
    }
    els.wordtableBody.appendChild(frag);
  }
  reanchorWordPop();

  const allIn = state.listCards.every((c) => c.key in words);
  // With the whole deck in Review, the button reads "✓ All in Review" and removes them all.
  els.wordlistAddAll.classList.toggle('all-in', allIn);
  if (allIn) {
    // Both labels share one grid cell, so hovering ("− Remove all") doesn't change the width.
    const label = (cls, text) => Object.assign(document.createElement('span'), { className: cls, textContent: text });
    els.wordlistAddAll.replaceChildren(label('label-idle', '✓ All in Flashcards'), label('label-hover', '− Remove all'));
  } else {
    els.wordlistAddAll.replaceChildren(reviewIcon(), 'Add all to Flashcards'); // "…to Review" until 2026-10-08
  }
  els.wordlistAddAll.title = allIn ? 'Remove all from Flashcards' : '';
}

// ---------- Learn mode ----------

// Deterministic 32-bit hash (FNV-1a variant).
function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Mulberry32 — seeded PRNG.
function makeRng(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// For card c in the current deck, deterministically pick:
//  - which side to test ('en' = English shown on pills, 'th' = Thai shown on pills)
//  - two distractors from the same deck (different from c)
//  - the order of the three pills
// Result is stable per (card.key, deck.id, seen-count).
// On odd `seen` counts, flip the side so each card is shown both ways.
// Where Test's wrong answers come from: the topic's words, or on Everything your Review words. All
// 6,000-odd cards made them easy to rule out (the user's call, 2026-10-07). With fewer than 3
// words in Review, all cards.
function distractorPool() {
  if (!flashcardsByAll()) return state.cards;
  const pool = reviewOnlyCards();
  return pool.length >= 3 ? pool : state.cards;
}

// Tone and Sound Pairs words list their partners (decks.json `partners`: card keys of the same set,
// in that topic). Recognition offers them as the wrong answers (the user's request, 2026-10-08).
// The card's own topic in scope comes first; on Everything or a category, where the card may come
// from another topic, every pair topic's partners for it.
let partnerIndex = null;
function partnersOf(card) {
  const deck = flashScope()?.deckOf.get(card.key);
  const own = deck?.cards.find((c) => c.partners && cardKey(c) === card.key)?.partners;
  if (own) return own;
  if (!partnerIndex) {
    partnerIndex = new Map();
    for (const d of state.decks) {
      for (const c of d.cards) {
        if (!c.partners) continue;
        const k = cardKey(c);
        partnerIndex.set(k, [...new Set([...(partnerIndex.get(k) || []), ...c.partners])]);
      }
    }
  }
  return partnerIndex.get(card.key) || [];
}

function buildLearnTrial(card, deckCards, seenOverride) {
  const seen = seenOverride != null ? seenOverride : (card.seen || 0);
  const seed = hashStr(`${state.flashScopeId}::${card.key}::${seen}::${state.direction}`);
  const rng = makeRng(seed);

  // Side = which language appears on the answer pills.
  // en-th: question is English (front), pills are Thai answers.
  // th-en: question is Thai (front), pills are English answers.
  const side = state.direction === 'en-th' ? 'th' : 'en';

  // Pick 2 distinct distractors deterministically: a Tone or Sound Pairs word's partners first (the
  // near-identical words are the point), then any others from the pool.
  const pick = (from, count) => {
    const pool = from.slice();
    // Fisher-Yates with seeded rng, take the last `count`.
    for (let i = pool.length - 1; i > 0 && i > pool.length - 1 - count; i--) {
      const j = Math.floor(rng() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(-count);
  };
  // Listening: never a word that sounds the same (ย่า and หญ้า, ไม่ and ไหม้), which no ear could tell
  // apart. The same transliteration means the same sound.
  const sound = (c) => (c.translit || '').toLowerCase().replace(/[\s-]/g, '');
  const audible = (c) => state.direction !== 'listen' || sound(c) !== sound(card);
  const partners = partnersOf(card).map((key) => state.cardIndex.get(key)?.card).filter(Boolean)
    .map((c) => ({ ...c, key: cardKey(c) })).filter(audible);
  const distractors = partners.length ? pick(partners, Math.min(2, partners.length)) : [];
  if (distractors.length < 2) {
    const others = deckCards.filter((d) => d.key !== card.key && audible(d) && !distractors.some((x) => x.key === d.key));
    distractors.push(...pick(others, 2 - distractors.length));
  }

  // Compose 3 options and shuffle deterministically.
  const opts = [card, ...distractors].map((c) => ({
    text: side === 'en' ? c.english : c.thai,
    isCorrect: c.key === card.key,
  }));
  for (let i = opts.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [opts[i], opts[j]] = [opts[j], opts[i]];
  }

  return { side, options: opts };
}

function renderLearnPills() {
  els.learnPills.innerHTML = '';
  els.learnPills.classList.remove('locked');
  els.card.classList.remove('answered');
  const c = currentCard();
  if (state.orderMode !== 'test' || !c) {
    els.learnPills.hidden = true;
    return;
  }
  els.learnPills.hidden = false;

  // If we've already answered this card in this session, reproduce that exact trial.
  const prior = state.learnAnswers.get(c.key);
  const trial = buildLearnTrial(c, distractorPool(), prior?.seedSeen);

  // renderCard already set the front face based on state.direction.
  for (const opt of trial.options) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'learn-pill' + (trial.side === 'th' ? ' thai-pill' : '');
    btn.textContent = opt.text;
    btn.addEventListener('click', () => handleLearnPick(btn, opt.isCorrect));
    els.learnPills.appendChild(btn);
  }

  if (prior) {
    // Card was answered earlier — lock pills into the answered state.
    els.learnPills.classList.add('locked');
    els.card.classList.add('answered');
    setFlipped(true); // show the back face (English/translit/note)
    const correctText = trial.side === 'th' ? c.thai : c.english;
    for (const p of els.learnPills.querySelectorAll('.learn-pill')) {
      if (p.textContent === correctText) {
        p.classList.add('correct');
      } else if (p.textContent === prior.pickedText && !prior.isCorrect) {
        p.classList.add('wrong');
      } else if (!prior.isCorrect) {
        p.classList.add('dimmed');
      }
    }
  }
}

function handleLearnPick(btn, isCorrect) {
  if (els.learnPills.classList.contains('locked')) return;
  els.learnPills.classList.add('locked');

  const c = currentCard();

  // Highlight pills: clicked one as correct/wrong; if wrong, also reveal which was right.
  if (isCorrect) {
    btn.classList.add('correct');
  } else {
    btn.classList.add('wrong');
    for (const p of els.learnPills.querySelectorAll('.learn-pill')) {
      if (p !== btn) p.classList.add('dimmed');
    }
    // Mark the correct pill green.
    const trial = buildLearnTrial(c, distractorPool());
    const correctText = trial.side === 'th' ? c.thai : c.english;
    for (const p of els.learnPills.querySelectorAll('.learn-pill')) {
      if (p.textContent === correctText) {
        p.classList.remove('dimmed');
        p.classList.add('correct');
      }
    }
  }

  // The answer, so a re-render (Settings opened over it, say) shows the card still answered.
  state.learnAnswers.set(c.key, {
    pickedText: btn.textContent,
    isCorrect,
    seedSeen: c.seen || 0, // remember the seen-count used to build this trial
  });
  els.card.classList.add('answered');

  // Flip the card to reveal the back face; in English → Thai that's the Thai, so say it now.
  setFlipped(true);
  if (state.direction === 'en-th' && autoPlayOn()) speak(c.thai);

  // Saved now, so leaving during the pause loses nothing; then on to the next card, after Settings →
  // Flashcards' pause for a right answer, or the longer one for a wrong answer (to take in the right
  // one). Changing mode, direction or topic cancels it.
  saveDeckRating(c, isCorrect ? 'good' : 'again');
  requeueRecognition(c, isCorrect);
  if (state.pickerOpen) renderDeckPicker();
  const s = getSettings();
  const seq = ++state.answerSeq;
  setTimeout(() => {
    if (seq === state.answerSeq && state.orderMode === 'test' && state.view === 'flashcards') advance();
  }, isCorrect ? s.learnPauseMs : s.wrongPauseMs);
}

// ---------- Review mode: a continuous stream ----------
// Since 2026-10-08 (the user's request) Review has no start or end: a stream of cards from the
// words you've added, in Flashcards' scope and direction, ordered to help recall. Every card is
// recall and self-grading (multiple choice is Test mode's). Every grade goes to FSRS, which decides
// what's due on later visits. Within a visit (pickReviewEntry):
// 1. A card you missed (Again) comes back REVIEW_RETURN[1] cards later, a Hard one REVIEW_RETURN[2]
//    later, until you mark it Easy. An Easy card drops out of the rotation.
// 2. Due cards, weakest (lowest recall probability) first, with a new word every NEW_EVERY cards.
// 3. New words, in the order you added them. They aren't labelled as new.
// 4. When nothing's due, the cards you're most likely to have forgotten, so the stream never runs
//    dry. (FSRS's same-day rule, tweaked so repeats never lengthen a gap, keeps a long sitting
//    from pushing words out.)
// A card isn't shown again within RECENT cards (fewer in a small pool). See docs/review-design.md.

const REVIEW_RETURN = { 1: [2, 4], 2: [6, 9] }; // cards later: Again, Hard
const NEW_EVERY = 4;
const RECENT = 5;

// The decks Review is narrowed to, or null for Everything.
function reviewScopeDeckIds() {
  const scope = flashScope();
  return !scope || scope.kind === 'all' ? null : new Set(scope.decks.map((d) => d.id));
}

// Review mode's words: every word you've added in Flashcards' scope, in the order you added them,
// with its progress in one direction (it: null for a word not started in it).
function reviewPool(dir = state.direction) {
  const items = loadStore().items || {};
  const f = reviewFilter();
  const scopeIds = reviewScopeDeckIds();
  const pool = [];
  for (const key of Object.keys(f.words).sort((x, y) => f.words[x] - f.words[y])) {
    const deckId = reviewDeckId(key, scopeIds);
    if (deckId) pool.push({ key, dir, deckId, it: items[itemKeyOf(key, dir)] || null });
  }
  return pool;
}

// The next card in the stream (see the top of this section), or null with no words to review.
function pickReviewEntry(r, now = Date.now()) {
  const pool = reviewPool();
  if (!pool.length) return null;
  const ik = (e) => itemKeyOf(e.key, e.dir);
  const gap = Math.min(RECENT, pool.length - 1);
  const recent = (e) => r.shownAt.has(ik(e)) && r.count - r.shownAt.get(ik(e)) < gap;
  const R = (e) => fsrsR(Math.max(0, (now - e.it.last) / DAY), e.it.s);
  // 1. Missed and hard cards whose turn has come, the longest waiting first.
  const back = pool.filter((e) => r.returnAt.has(ik(e)) && r.returnAt.get(ik(e)) <= r.count && ik(e) !== r.lastKey)
    .sort((x, y) => r.returnAt.get(ik(x)) - r.returnAt.get(ik(y)));
  if (back.length) return back[0];
  const free = pool.filter((e) => !recent(e) && !r.returnAt.has(ik(e)));
  const due = free.filter((e) => e.it && e.it.due <= now).sort((x, y) => R(x) - R(y));
  const news = free.filter((e) => !e.it);
  // 2 and 3. Due cards, with a new word every NEW_EVERY cards; new words when nothing's due.
  if (news.length && (!due.length || r.sinceNew >= NEW_EVERY)) return news[0];
  if (due.length) return due[0];
  // 4. Nothing due: the cards most likely forgotten.
  const ahead = free.filter((e) => e.it).sort((x, y) => R(x) - R(y));
  if (ahead.length) return ahead[0];
  // A small pool, everything recent or waiting to come back: the card shown longest ago.
  const rest = pool.filter((e) => ik(e) !== r.lastKey);
  return (rest.length ? rest : pool).sort((x, y) => (r.shownAt.get(ik(x)) ?? -1) - (r.shownAt.get(ik(y)) ?? -1))[0];
}

// The deck a word is reviewed under, or null if Review skips it: its card was edited or removed,
// or none of its decks is in what Flashcards covers (scopeIds, null for Everything).
function reviewDeckId(key, scopeIds = null) {
  const entry = state.cardIndex.get(key);
  if (!entry) return null;
  return entry.deckIds.find((id) => !scopeIds || scopeIds.has(id)) || null;
}

// What Review holds: the words you've added, store.reviewWords ({ cardKey: addedAt }). Since
// 2026-10-07 that's the only way (automatic adding, from started or current topics, is gone).
function reviewFilter() {
  const words = reviewWords();
  return { words, has: (key) => key in words };
}

function reviewWords() {
  return loadStore().reviewWords || {};
}

// Add words to (on) or take them out of Review. Taking out keeps their progress, so adding them
// again carries on where they left off.
function setInReview(keys, on) {
  const store = loadStore();
  store.reviewWords ||= {};
  let t = Date.now();
  for (const key of keys) {
    if (on && !(key in store.reviewWords)) store.reviewWords[key] = t++; // keeps the order added
    if (!on) delete store.reviewWords[key];
  }
  saveStore(store);
  renderToday();
  if (state.view === 'wordlist') renderWordlist();
  syncReviewOnly();
}

// Sets el's text, drawing each → as the SVG arrow (.arrow-icon), since the → glyph sits low in
// some fonts. `caps` centres the arrow on capitals (EN→TH) rather than lowercase letters.
function textWithArrows(el, text, { caps = false } = {}) {
  el.replaceChildren();
  appendWithArrows(el, text, caps);
  return el;
}

function appendWithArrows(el, text, caps = false) {
  text.split(/\s*→\s*/).forEach((part, i) => {
    if (i) el.append(lineIcon('arrow-icon' + (caps ? ' caps' : ''), '0 0 16 16', 'M2.5 8h10.5M9 4l4 4-4 4', 'to'));
    el.append(part);
  });
}

// Thai in notes and topic paragraphs is tap-to-play (2026-10-08): the 576 notes with an example
// like ยิ่งเร็วยิ่งดี = the sooner the better could be read but not heard. A run of Thai words is
// playable if it has a consonant, doesn't start with a vowel or tone mark (a spelling note's –ือ),
// and isn't a list of letters (ด ต ถ ท ธ …). tools/gen_audio.py records the same runs, keyed
// under 'th' like a card's Thai; keep playableThai() and its playable_thai() in step.
const THAI_RUN = /([\u0E01-\u0E5B]+(?:[ \u00A0]+[\u0E01-\u0E5B]+)*)/;

function playableThai(run) {
  if (!/[\u0E01-\u0E2E]/.test(run) || /^[\u0E30-\u0E3A\u0E45-\u0E4E]/.test(run)) return false;
  const words = run.split(/[ \u00A0]+/);
  return !(words.length >= 3 && words.every((w) => w.length <= 2));
}

// Fills el with text whose playable Thai runs are tap targets (.say); → is drawn as the arrow.
function noteText(el, text) {
  el.replaceChildren();
  appendNoteText(el, text);
  return el;
}

function appendNoteText(el, text) {
  text.split(THAI_RUN).forEach((part, i) => {
    if (!part) return;
    if (i % 2 === 0 || !playableThai(part)) {
      appendWithArrows(el, part);
      return;
    }
    const say = document.createElement('span');
    say.className = 'say';
    say.textContent = part;
    say.tabIndex = 0;
    say.setAttribute('role', 'button');
    say.title = `Play ${part}`;
    const play = (e) => {
      e.stopPropagation(); // not a card flip
      e.preventDefault();
      stopAudio();
      say.classList.add('playing');
      speakAndWait(part, 'th').finally(() => say.classList.remove('playing'));
    };
    say.addEventListener('click', play);
    say.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') play(e); });
    el.append(say);
  });
}

// A line icon: an SVG path stroked in the text colour (styled by `cls`). With a `label` screen
// readers read it; without, they skip it.
function lineIcon(cls, viewBox, d, label = '') {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', cls);
  svg.setAttribute('viewBox', viewBox);
  if (label) {
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', label);
  } else {
    svg.setAttribute('aria-hidden', 'true');
  }
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', d);
  svg.append(path);
  return svg;
}

// The "spell it aloud" icon: ก with sound waves (the card back has the same markup in index.html).
function spellIcon() {
  const icon = document.createElement('span');
  icon.className = 'spell-icon';
  icon.setAttribute('aria-hidden', 'true');
  icon.append('ก', lineIcon('spell-waves', '0 0 10 24', 'M2 9.5a3.5 3.5 0 0 1 0 5M5 6.5a7.5 7.5 0 0 1 0 11'));
  return icon;
}

// The "add to Review" icon: Home's 🔁 as a line icon, so it matches the muted controls around it.
// The play-sound icon: a speaker in the text colour, like the app's other line icons (the 🔊 emoji
// it replaced, 2026-10-08, came in each device's own colours: blue on some). Its two sound waves
// are separate paths, so they can pulse while the word plays (markSpeakers). index.html has the
// same SVG inline.
const SPEAKER_PATHS = ['M11 5 6 9H3v6h3l5 4z', 'M15.5 8.5a5 5 0 0 1 0 7', 'M18.5 5.5a9.5 9.5 0 0 1 0 13'];

function speakerIcon() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'speaker-icon');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');
  SPEAKER_PATHS.forEach((d, i) => {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    if (i) path.setAttribute('class', `wave wave${i}`);
    svg.append(path);
  });
  return svg;
}
const reviewIcon = () => lineIcon('review-icon', '0 0 24 24', 'M16 1l4 4-4 4M4 11V9a4 4 0 0 1 4-4h12M8 23l-4-4 4-4M20 13v2a4 4 0 0 1-4 4H4');

// A toast: a short message at the bottom of the screen that fades out after `ms`. A new one
// replaces any still showing.
let toastTimer = null;
function toast(message, { ms = 2000, tone = '' } = {}) {
  const el = els.toast;
  el.textContent = message;
  el.className = 'toast' + (tone ? ` ${tone}` : '');
  el.hidden = false;
  void el.offsetWidth; // restart the fade-in
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.classList.remove('show');
    toastTimer = setTimeout(() => { el.hidden = true; }, 250); // after the fade-out
  }, ms);
}

// A confirm dialog. Resolves true for the confirm button, false for Cancel, the backdrop or
// Escape. `message` can hold \n line breaks. `danger` (for what can't be undone) makes the
// confirm button red and starts focus on Cancel, so Enter doesn't confirm. With `setting` (a boolean setting, true = ask; listed under Settings →
// Wordlists, beside the buttons they confirm), it offers "Don't ask again", which turns the setting off when confirming; while
// it's off, it resolves true straight away without showing anything.
function confirmDialog({ title, message, confirmLabel = 'OK', cancelLabel = 'Cancel', setting = null, danger = false }) {
  if (setting && getSettings()[setting] === false) return Promise.resolve(true);
  if (state.confirm) closeConfirm(false);
  els.confirmTitle.textContent = title;
  els.confirmMessage.textContent = message;
  els.confirmMessage.hidden = !message;
  els.confirmOk.textContent = confirmLabel;
  els.confirmOk.classList.toggle('danger', danger);
  els.confirmCancel.textContent = cancelLabel;
  els.confirmDontAskRow.hidden = !setting;
  els.confirmDontAsk.checked = false;
  els.confirmModal.hidden = false;
  setModalOpen(true);
  return new Promise((resolve) => {
    state.confirm = { resolve, setting, lastFocus: document.activeElement };
    (danger ? els.confirmCancel : els.confirmOk).focus();
  });
}

function closeConfirm(ok) {
  const c = state.confirm;
  if (!c) return;
  state.confirm = null;
  if (ok && c.setting && els.confirmDontAsk.checked) {
    setSettings({ [c.setting]: false });
    renderSettings();
  }
  els.confirmModal.hidden = true;
  setModalOpen(!!document.querySelector('.modal:not([hidden])')); // another dialog may be under it
  c.lastFocus?.focus?.();
  c.resolve(ok);
}


// Review mode (Flashcards → Review, since 2026-10-08; it was the Review tab): the card, while the
// stream runs. With none of the scope's words in Review, Flashcards' empty message shows instead
// (renderReviewOnly).
function renderToday() {
  if (!state.cardIndex.size) return; // decks not loaded yet
  els.review.hidden = !state.review;
}

// The next card in the stream. With no words left (all taken out of Review), the stream stops and
// Flashcards' empty message shows.
function nextEntry() {
  const r = state.review;
  const e = r && pickReviewEntry(r);
  if (!e) {
    leaveReviewSession();
    renderToday();
    return;
  }
  const key = itemKeyOf(e.key, e.dir);
  r.count += 1;
  r.shownAt.set(key, r.count);
  r.lastKey = key;
  r.sinceNew = e.it ? r.sinceNew + 1 : 0;
  r.current = e;
  presentEntry();
}

function presentEntry() {
  const r = state.review;
  const e = r.current;
  const { card } = state.cardIndex.get(e.key);
  const thaiFirst = e.dir !== 'en-th'; // Thai → English, or Listen → English
  const listen = e.dir === 'listen';
  r.revealed = false;
  r.answered = false;
  // Back to the front before the new card's text goes in, without the turn (it would show the new
  // answer for half of it).
  setReviewFlipped(false, { instant: true });

  // Listen → English: the sound only, the word's waveform, as on Flashcards' card. (Until
  // 2026-10-08 Settings → Recall → Show Thai script made Thai → English audio only, with an eye
  // button to show the script; Listen replaced both.)
  if (listen) els.reviewPrompt.replaceChildren(listenButton(card.thai));
  else els.reviewPrompt.textContent = thaiFirst ? card.thai : card.english;
  els.reviewPrompt.className = 'review-prompt thai' + (thaiFirst ? '' : ' front-en');
  // The back, as Flashcards' (renderCard): Thai → English repeats the Thai at the English's size,
  // then the transliteration, the answer, the note and the spelling.
  els.reviewBackThai.textContent = thaiFirst ? card.thai : '';
  els.reviewBackThai.hidden = !thaiFirst;
  els.reviewMain.textContent = thaiFirst ? card.english : card.thai;
  els.reviewMain.className = 'english' + (thaiFirst ? '' : ' back-th');
  els.reviewTranslit.textContent = card.translit;
  noteText(els.reviewNote, card.note || '');
  // The spelling is only spoken (its written line on the back went on 2026-10-09, the user's call).
  const groups = spellingFor(card);
  // Spell it aloud: on the front only when it shows the Thai (as on Flashcards' card).
  els.reviewSpell.hidden = !thaiFirst || !groups;
  els.reviewSpellBack.hidden = !groups;
  els.reviewGrades.hidden = true;
  // Every item is recall, new ones too (the user's call, 2026-10-07): recognition is Flashcards' job.
  // The ⟳ is yellow until the card's turned: the next thing to do (Show's job until 2026-10-08).
  els.reviewFlip.classList.add('reveal');
  // English → Thai: no audio until the answer is shown, or it would give the answer away.
  els.reviewSpeak.hidden = !thaiFirst;
  renderAutoBadges();
  fitText(els.reviewPrompt);
  if (thaiFirst && autoPlayOn()) speak(card.thai);
}

// Review's card turns like Flashcards' (.card.flipped). Before Show it only turns to the answer
// (revealAnswer); after, a tap turns it either way.
function setReviewFlipped(flipped, { instant = false } = {}) {
  const r = state.review;
  stopSpellingOnTurn(!!r && r.flipped !== flipped);
  if (r) r.flipped = flipped;
  if (instant) els.reviewCard.classList.add('no-anim');
  els.reviewCard.classList.toggle('flipped', flipped);
  if (instant) {
    void els.reviewCard.offsetWidth; // apply the new side before the transition comes back
    els.reviewCard.classList.remove('no-anim');
  }
}

// Listen → English's front: the word's waveform, drawn from its recording (the user's idea,
// 2026-10-08; a big 🔊 before). It lights up as the word plays, and a tap plays it again (it plays
// by itself as the card appears). It's a button, so a tap on it never turns the card. Until the
// clip is decoded, or for a word with no recording, it shows a soft generic shape.
const WAVE_BARS = 30;
const WAVE_PLACEHOLDER = Array.from({ length: WAVE_BARS }, (_, i) => 0.18 + 0.22 * Math.sin((Math.PI * (i + 0.5)) / WAVE_BARS));

function listenButton(thai) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'listen-btn listen-wave';
  b.title = 'Play it again';
  b.setAttribute('aria-label', b.title);
  for (const h of WAVE_PLACEHOLDER) {
    const bar = document.createElement('i');
    bar.style.setProperty('--h', h.toFixed(3));
    b.append(bar);
  }
  const url = sampleUrl(thai, 'th');
  if (url) {
    b.dataset.url = url;
    waveformOf(url).then((wave) => {
      if (!wave) return;
      b.wave = wave;
      wave.peaks.forEach((h, i) => b.children[i].style.setProperty('--h', h.toFixed(3)));
    });
  }
  b.addEventListener('click', (e) => {
    e.stopPropagation();
    speak(thai);
  });
  return b;
}

// A clip's shape: WAVE_BARS loudness levels (0–1) across the speech, with the silence edge-tts pads
// every clip with trimmed off, and where the speech starts and ends (seconds), so the bars light up
// in step. `tail` is when the voice has really stopped (a gentler threshold, so a soft ending counts,
// plus a little): the clip's last second or so is silence, and from `tail` it no longer looks like
// it's playing (tickPlayback). Cached per clip (waveInfo once decoded); null if it can't be fetched
// or decoded.
const waveforms = new Map();
const waveInfo = new Map();
const TAIL_MARGIN = 0.12;

function waveformOf(url) {
  if (!waveforms.has(url)) {
    waveforms.set(url, (async () => {
      const res = await fetch(sampleCache.get(url) || url);
      if (!res.ok) return null;
      const buf = await res.arrayBuffer();
      const Ctx = window.OfflineAudioContext || window.webkitOfflineAudioContext;
      const audio = await new Promise((resolve, reject) => new Ctx(1, 1, 44100).decodeAudioData(buf, resolve, reject));
      const data = audio.getChannelData(0);
      let max = 0;
      for (let i = 0; i < data.length; i++) max = Math.max(max, Math.abs(data[i]));
      if (!max) return null;
      const quiet = max * 0.04;
      let a = 0;
      let z = data.length - 1;
      while (a < z && Math.abs(data[a]) < quiet) a++;
      while (z > a && Math.abs(data[z]) < quiet) z--;
      let y = data.length - 1;
      while (y > z && Math.abs(data[y]) < max * 0.01) y--;
      const levels = [];
      const step = (z - a + 1) / WAVE_BARS;
      for (let k = 0; k < WAVE_BARS; k++) {
        let sum = 0;
        let n = 0;
        for (let i = Math.floor(a + k * step); i < Math.floor(a + (k + 1) * step); i++, n++) sum += data[i] * data[i];
        levels.push(Math.sqrt(sum / Math.max(1, n)));
      }
      const top = Math.max(...levels) || 1;
      return {
        peaks: levels.map((v) => 0.08 + 0.92 * (v / top) ** 0.7),
        start: a / audio.sampleRate,
        end: (z + 1) / audio.sampleRate,
        tail: (y + 1) / audio.sampleRate + TAIL_MARGIN,
      };
    })().catch(() => null).then((wave) => {
      waveInfo.set(url, wave);
      return wave;
    }));
  }
  return waveforms.get(url);
}

// While a clip plays, any waveform of it on screen lights up to where the voice has got to. Once
// the voice has stopped (its `tail`), the rest of the clip is silence, so the speakers and waveform
// go back to rest as if it had ended (2026-10-08: the user saw them stay lit about a second after
// สวัสดีครับ). The audio itself still runs to the end, so Read all's pacing is unchanged.
let playingUrl = null;
let speechOver = false;

function tickPlayback() {
  const playing = !!playingUrl && !sampleAudio.paused;
  const t = sampleAudio.currentTime;
  const over = playing && t >= (waveInfo.get(playingUrl)?.tail ?? Infinity);
  if (over && speakingText !== null && !speechOver) {
    speechOver = true;
    markSpeakers();
  }
  for (const w of document.querySelectorAll('.listen-wave')) {
    let lit = 0;
    if (playing && !over && w.dataset.url === playingUrl) {
      const { start = 0, end = sampleAudio.duration || 1 } = w.wave || {};
      lit = Math.round(clamp((t - start) / Math.max(0.05, end - start), 0, 1) * WAVE_BARS);
    }
    [...w.children].forEach((bar, i) => bar.classList.toggle('on', i < lit));
  }
  if (playing && !over) requestAnimationFrame(tickPlayback);
}

function revealAnswer() {
  const r = state.review;
  if (!r || r.revealed) return;
  const e = r.current;
  r.revealed = true;
  setReviewFlipped(true);
  els.reviewFlip.classList.remove('reveal');
  els.reviewSpeak.hidden = false;
  els.reviewSpell.hidden = !spellingFor(state.cardIndex.get(e.key).card);
  renderAutoBadges(); // the front's speaker (and its A) shows now
  if (speakingSide(e.dir, true) && autoPlayOn()) speak(state.cardIndex.get(e.key).card.thai);
  els.reviewGrades.hidden = false;
}

// After the answer's been shown, ⟳ or a tap turns the card either way, saying the Thai when it
// turns to the side that speaks (speakingSide), as Flashcards' card does.
function turnReviewCard() {
  const r = state.review;
  setReviewFlipped(!r.flipped);
  if (speakingSide(r.current.dir, r.flipped) && autoPlayOn()) speak(state.cardIndex.get(r.current.key).card.thai);
}

// Save the grade, and set when the card comes back in this visit: Again and Hard a few cards later
// (REVIEW_RETURN), Easy not until its turn comes round again.
function recordGrade(g) {
  const r = state.review;
  const e = r.current;
  const key = itemKeyOf(e.key, e.dir);
  gradeItem(e.key, e.dir, g, { mode: 'recall', deckId: e.deckId });
  const back = REVIEW_RETURN[g];
  if (back) r.returnAt.set(key, r.count + back[0] + Math.floor(Math.random() * (back[1] - back[0] + 1)));
  else r.returnAt.delete(key);
}

function gradeCurrent(g) {
  const r = state.review;
  if (!r || !r.revealed || r.answered) return;
  r.answered = true;
  recordGrade(g);
  nextEntry();
}

function handleReviewKey(e) {
  const r = state.review;
  const enter = e.key === 'Enter' || e.key === ' ';
  if (!r) return;
  if (!r.revealed) {
    if (enter) {
      e.preventDefault();
      revealAnswer();
    }
  } else if (['1', '2', '3'].includes(e.key)) { // Again, Hard, Easy
    gradeCurrent(Number(e.key));
  } else if (enter) {
    e.preventDefault();
    gradeCurrent(3); // Easy (FSRS Good)
  }
}

// ---------- reading practice ----------
// Added 2026-10-08 (kept; to be reshaped and tidied): passages as topics in a Reading
// category. A topic's `passage` is lines of { th, en }. In th, | marks a word break, a space is a
// real space, _ is a space inside a word (จริง_ๆ), and "ลูกค้า: " is a speaker's label. Every Thai word is a card in the topic (the audit
// checks), which gives the tap look-up its transliteration and meaning, and the word list under the
// passage its words. Each sentence is recorded whole too (gen_audio's sentence_text).

// A passage line as it's said: the word breaks joined up, a speaker's label left off. Keep in step
// with sentence_text() in tools/gen_audio.py.
function sentenceText(th) {
  return th.replace(/^[^ ]+: /, '').replace(/\|/g, '').replace(/_/g, ' ');
}

// The Reading page: the current topic's stories (renderReadingList), or one open in the reader. Adding
// its words to Flashcards is left to the Topics page (the user's call, 2026-10-08). A story you've opened gets a ✓ (prefs readingDone). The page remembers the open
// story while the app's open (state.readingId); it opens on the list.
const isPassage = (id) => !!state.decks.find((d) => d.id === id)?.passage;

function renderReading() {
  hideWordPop();
  const topic = state.readingId ? state.decks.find((d) => d.id === state.readingId && d.passage) : null;
  els.readingLibrary.hidden = !!topic;
  els.readingPassage.hidden = !topic;
  els.readingBack.hidden = !topic;
  if (!topic) {
    renderReadingList();
    return;
  }
  els.readingName.textContent = topic.name;
  els.readingDesc.textContent = topic.description;
  renderReader(topic);
}

// The list: the stories that use the current topic's words (the topic picker's choice, shared with
// the Topics page), best matches first. There's no list of every story: there will be too many (the
// user's call, 2026-10-08).
function renderReadingList() {
  const scope = currentScope();
  const done = new Set(getPreferences().readingDone || []);
  const found = scope ? storiesFor(scope) : [];
  if (!found.length) {
    const empty = document.createElement('div');
    empty.className = 'reading-empty';
    empty.append(scope ? `No stories for ${scope.name} yet.` : '');
    // A narrower choice can try its whole category, whose words are pooled.
    const cat = scope && scope.kind !== 'category' ? scope.decks[0]?.category : null;
    if (cat) {
      const wider = document.createElement('button');
      wider.type = 'button';
      wider.className = 'ghost';
      wider.textContent = `Try all of ${cat}`;
      wider.addEventListener('click', () => selectDeck(`cat:${cat}`));
      empty.append(wider);
    }
    els.readingList.replaceChildren(empty);
    return;
  }
  els.readingList.replaceChildren(...found.map(({ d }) => {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'reading-item' + (done.has(d.id) ? ' done' : '');
    item.innerHTML = '<span class="reading-item-main"><span class="reading-item-name"><span class="reading-item-title"></span></span><span class="reading-item-desc"></span></span><span class="reading-item-tick" aria-hidden="true"></span><span class="reading-item-level"></span>';
    item.querySelector('.reading-item-title').textContent = d.name;
    item.querySelector('.reading-item-level').textContent = d.group || '';
    item.querySelector('.reading-item-desc').textContent = d.description;
    item.querySelector('.reading-item-tick').textContent = done.has(d.id) ? '✓' : '';
    if (done.has(d.id)) item.setAttribute('aria-label', `${d.name}, read`);
    item.addEventListener('click', () => openReading(d.id));
    return item;
  }));
}

// Which stories go with a topic (or a group or category, their words pooled): those using at least
// READING_MIN_MATCH of its words, not counting very common ones, which would tie every story to
// every topic (READING_COMMON). Most matched words first, then by title (the user's call, 2026-10-08;
// it was the easier level). Automatic for now;
// stories could be tagged by hand later if this picks oddly.
const READING_MIN_MATCH = 2;
const READING_COMMON = new Set(('ไป มา มี เป็น อยู่ ได้ ให้ ทำ ของ ที่ ไม่ ใน กับ และ แต่ แล้ว จะ ก็ นะ ครับ ค่ะ คะ จ้ะ '
  + 'ฉัน ผม เรา เขา คุณ นี่ นี้ คือ ว่า มาก ดี ไหม เลย ยัง ด้วย กัน ตอน').split(' '));

function storiesFor(scope) {
  const words = new Set(scope.cards.map((c) => c.thai).filter((w) => !READING_COMMON.has(w)));
  const found = [];
  for (const d of state.decks) {
    if (!d.passage) continue;
    const hits = [...new Set(d.cards.map((c) => c.thai))].filter((w) => words.has(w));
    if (hits.length >= READING_MIN_MATCH) found.push({ d, hits });
  }
  return found.sort((a, b) => b.hits.length - a.hits.length || a.d.name.localeCompare(b.d.name));
}

// Opens a passage (from the list, or a search result, which also lights the word it found).
function openReading(id, word = null) {
  state.readingId = id;
  const done = new Set(getPreferences().readingDone || []);
  done.add(id);
  setPreferences({ readingDone: [...done] });
  if (state.view !== 'reading') setView('reading');
  else renderReading();
  window.scrollTo(0, 0);
  if (word) {
    const spans = [...els.readerLines.querySelectorAll('.rw')].filter((w) => w.textContent === word);
    spans[0]?.scrollIntoView({ block: 'center' });
    spans.forEach((w) => w.classList.add('found'));
    setTimeout(() => spans.forEach((w) => w.classList.remove('found')), 2500);
  }
}

function renderReader(topic) {
  hideWordPop();
  const own = new Map(topic.cards.map((c) => [c.thai, c]));
  els.readerLines.replaceChildren(...topic.passage.map((line) => {
    const row = document.createElement('div');
    row.className = 'reader-line';
    // ▶ the whole sentence: a speaker like the rows' (lit while it plays; pressed again, it stops).
    const sentence = sentenceText(line.th);
    const play = document.createElement('button');
    play.type = 'button';
    play.className = 'row-speak reader-play';
    play.dataset.say = sentence;
    play.title = 'Play the sentence';
    play.setAttribute('aria-label', play.title);
    play.append(speakerIcon());
    play.addEventListener('click', () => speakerPress(play, sentence));
    const th = document.createElement('p');
    th.className = 'reader-th';
    const tr = [];
    line.th.split(' ').forEach((chunk, i) => {
      if (i) th.append(' ');
      chunk.split('|').forEach((tok, j) => {
        // Between the words of a run (Thai writes none): a space that "Spaces between words" shows.
        if (j) th.append(Object.assign(document.createElement('span'), { className: 'rw-gap', textContent: ' ' }));
        const label = tok.endsWith(':');
        const w = (label ? tok.slice(0, -1) : tok).replace(/_/g, ' '); // _ is a space inside a word (จริง_ๆ)
        const card = own.get(w);
        if (card) {
          const span = document.createElement('span');
          span.className = 'rw' + (label ? ' rw-label' : '');
          span.textContent = w;
          span.tabIndex = 0;
          span.setAttribute('role', 'button');
          const pick = (e) => {
            e.stopPropagation();
            e.preventDefault();
            showWordPop(span, card);
          };
          span.addEventListener('click', pick);
          span.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') pick(e); });
          th.append(span);
          tr.push(card.translit + (label ? ':' : ''));
        } else {
          th.append(w);
          if (w) tr.push(w + (label ? ':' : ''));
        }
        if (label) th.append(':');
      });
    });
    const body = document.createElement('div');
    body.className = 'reader-body';
    const trEl = Object.assign(document.createElement('p'), { className: 'reader-tr', textContent: tr.join(' ') });
    const enEl = Object.assign(document.createElement('p'), { className: 'reader-en', textContent: line.en });
    body.append(th, trEl, enEl);
    row.append(play, body);
    return row;
  }));
  applyReaderToggles();
}

// Transliteration and English under each line, and spaces between the Thai words: off to start (the
// point is to read the script as written), and remembered (prefs).
function applyReaderToggles() {
  const prefs = getPreferences();
  const tr = !!prefs.readerTranslit;
  const en = !!prefs.readerEnglish;
  const sp = !!prefs.readerSpaces;
  els.reader.classList.toggle('show-tr', tr);
  els.reader.classList.toggle('show-en', en);
  els.reader.classList.toggle('show-spaces', sp);
  els.readerTranslit.setAttribute('aria-pressed', String(tr));
  els.readerEnglish.setAttribute('aria-pressed', String(en));
  els.readerSpaces.setAttribute('aria-pressed', String(sp));
}

// A tapped word: say it, light it, and show its transliteration and meaning in a pop-up under it.
// One pop-up (#reader-pop) serves the reader's words and, since 2026-10-09 (the user's request), the
// Thai of a Topics row: it moves into `host` (#reader, or the Topics section), which it's placed in
// and kept inside.
let popAnchor = null; // the word or cell it's under (lit: .on)
let popHost = null;
let popKey = null;    // its card's key, to find its row again after the Topics table is redrawn

function showWordPop(anchor, card, host = els.reader) {
  speak(card.thai);
  if (popAnchor !== anchor) {
    popAnchor?.classList.remove('on');
    popAnchor = anchor;
    anchor.classList.add('on');
  }
  const pop = els.readerPop;
  if (pop.parentElement !== host) host.append(pop);
  popHost = host;
  popKey = cardKey(card);
  const text = document.createElement('div');
  text.className = 'pop-text';
  text.append(
    Object.assign(document.createElement('span'), { className: 'pop-tr', textContent: card.translit }),
    Object.assign(document.createElement('span'), { className: 'pop-en', textContent: card.english }),
  );
  const row = document.createElement('div');
  row.className = 'pop-row';
  row.append(text);
  // The word again, large: tapping a part of it (a letter, a vowel, a tone mark) says that part's
  // name, as in the spelling (ค → คอ ควาย), and lights it briefly (partAt, 2026-10-09). Spelling it
  // aloud lights up each part as it's read (lightParts).
  const big = document.createElement('div');
  big.className = 'pop-word';
  big.lang = 'th';
  big.textContent = card.thai;
  big.addEventListener('click', (e) => {
    const hit = tappedPart(big, card, e.clientX, e.clientY);
    if (!hit) return;
    big.closest('.reader-pop').querySelectorAll('.pop-reading').forEach((x) => x.remove()); // speaking stops any spelling
    speak(hit.say, 'sp');
    flashPart(pop, hit.boxes);
  });
  // Under the big word, the Topics rows' three buttons (2026-10-09, the user's request): add to or
  // remove from Flashcards, spell it aloud (lighting each part as it's read), and play it.
  const actions = document.createElement('div');
  actions.className = 'pop-actions';
  const key = cardKey(card);
  let added = key in reviewWords();
  const rv = document.createElement('button');
  rv.type = 'button';
  const paintReview = () => {
    rv.className = 'row-review' + (added ? ' added' : '');
    rv.replaceChildren(added ? '✓' : reviewIcon());
    rv.title = added ? `Remove ${card.thai} from Flashcards` : `Add ${card.thai} to Flashcards`;
    rv.setAttribute('aria-label', rv.title);
  };
  paintReview();
  rv.addEventListener('click', () => {
    added = !added;
    setInReview([key], added);
    toast(added ? `✓ Added ${card.thai} to Flashcards` : `Removed ${card.thai} from Flashcards`, { tone: added ? 'good' : '' });
    paintReview();
  });
  actions.append(rv);
  if (spellingFor(card)) {
    const sp = document.createElement('button');
    sp.type = 'button';
    sp.className = 'pop-spell';
    sp.append(spellIcon());
    sp.title = `Spell ${card.thai} aloud`;
    sp.setAttribute('aria-label', sp.title);
    sp.addEventListener('click', () => speakSpelling(card, [sp], { onStep: (step) => lightParts(big, step?.at) }));
    actions.append(sp);
  }
  const play = document.createElement('button');
  play.type = 'button';
  play.className = 'row-speak' + (sayingNow(card.thai) ? ' playing' : ''); // lit while it plays (markSpeakers)
  play.dataset.say = card.thai;
  play.title = `Play ${card.thai}`;
  play.setAttribute('aria-label', play.title);
  play.append(speakerIcon());
  play.addEventListener('click', () => speakerPress(play, card.thai));
  actions.append(play);
  pop.style.width = ''; // sized afresh for each word, then held (below)
  pop.replaceChildren(row, big, actions);
  pop.hidden = false;
  fitPopWord(big);
  // Hold the width: a narrower pop-up (a button redrawn, say) would re-centre the word, moving it
  // out from under the next tap and its highlights.
  pop.style.width = getComputedStyle(pop).width;
  placeWordPop(anchor);
}

// The big word fits the pop-up: a long word or phrase gets smaller rather than overflowing.
function fitPopWord(el) {
  el.style.fontSize = '';
  let size = parseFloat(getComputedStyle(el).fontSize);
  while (el.scrollWidth > el.clientWidth + 1 && size > 22) {
    size -= 4;
    el.style.fontSize = `${size}px`;
  }
}

// The parts of the big word and where each is: [{ i (its index in the word), step (letterStep's
// { show, say }), box }]. Thai stacks vowels and tone marks above and below a letter, and a mark in an
// element of its own isn't drawn on its letter in every browser, so the word stays one piece of text
// and this works from its geometry. Each letter cluster (a letter with the marks above and below
// it) is measured with a Range; then heights split it: under the baseline, a vowel below (ุ ู); above
// the letter's own top, a mark above (with two, ที่, the tone mark on top of the vowel); the letter in
// between. ำ is half beside its letter, so it takes the cluster's right part.
const MARK_ABOVE = /[ัิีึื็่้๊๋์ํ]/;
const MARK_BELOW = /[ฺุู]/;
let glyphCanvas = null;

function partBoxes(el) {
  const node = el.firstChild;
  if (node?.nodeType !== Node.TEXT_NODE) return []; // e.g. Listen's sound button in place of the Thai
  const text = node.data;
  const clusters = [];
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const joins = MARK_ABOVE.test(ch) || MARK_BELOW.test(ch) || ch === 'ำ';
    if (joins && clusters.length) clusters[clusters.length - 1].push(i);
    else clusters.push([i]);
  }
  const range = document.createRange();
  const rects = clusters.map((c) => {
    range.setStart(node, c[0]);
    range.setEnd(node, c[c.length - 1] + 1);
    return range.getBoundingClientRect();
  });
  if (!rects.length) return [];
  // The baseline: an empty inline-block put after the text sits on it (on the last line). Every line's
  // box is the same height, so each cluster's baseline is the same distance below its line's top: a
  // phrase that wraps on a card works too.
  const marker = Object.assign(document.createElement('span'), { style: 'display:inline-block;width:0;height:0' });
  el.append(marker);
  const below0 = marker.getBoundingClientRect().bottom - rects[rects.length - 1].top;
  marker.remove();
  const ascent = (t) => measureGlyphs(el, t).actualBoundingBoxAscent;
  const parts = [];
  clusters.forEach((c, n) => {
    const r = rects[n];
    const baseline = r.top + below0;
    const [base, ...marks] = c;
    const above = marks.filter((i) => MARK_ABOVE.test(text[i]));
    const below = marks.filter((i) => MARK_BELOW.test(text[i]));
    const am = marks.find((i) => text[i] === 'ำ');
    const top = baseline - ascent(text[base]); // the top of the letter itself
    const right = am === undefined ? r.right : r.left + r.width * 0.55;
    const add = (i, top, bottom, left = r.left, rgt = right) => {
      const step = letterStep(text[i]);
      if (step) parts.push({ i, step, box: { left, right: rgt, top, bottom } });
    };
    add(base, above.length ? top : r.top, below.length ? baseline : r.bottom);
    if (above.length === 1) add(above[0], r.top, top);
    if (above.length > 1) {
      const split = baseline - ascent(text[base] + text[above[0]]); // the top of the lower mark
      add(above[0], split, top);
      add(above[above.length - 1], r.top, split);
    }
    if (below.length) add(below[0], baseline, r.bottom);
    if (am !== undefined) add(am, r.top, r.bottom, right, r.right);
  });
  return parts;
}

// The part of the big word at (x, y), or the nearest within `reach` of it; null if none. (On a card,
// where a tap anywhere else turns it, the reach is short.)
// The part of `card`'s Thai, shown as the text of `el`, at (x, y): { say, boxes }, or null. A tap on
// any part of a vowel written in several parts (เ-ีย, เ-า) says the whole vowel and lights all its
// parts, as its spelling does (2026-10-10, the user's request), unless spelling is set to letter names
// as written; elsewhere, the part's own name.
function tappedPart(el, card, x, y, reach) {
  const hit = partAt(el, x, y, reach);
  if (!hit) return null;
  const vowel = getSettings().spellingStyle !== 'letters' && card && el.firstChild?.data === card.thai
    && vowelSpelling(card.thai, card.translit)?.[0].find((step) => step.vowel && step.at.includes(hit.i));
  if (!vowel) return { say: hit.step.say, boxes: [hit.box] };
  return { say: vowel.say, boxes: partBoxes(el).filter((p) => vowel.at.includes(p.i)).map((p) => p.box) };
}

function partAt(el, x, y, reach = 30) {
  let best = null;
  let bestDist = Infinity;
  for (const p of partBoxes(el)) {
    const b = p.box;
    const dx = x < b.left ? b.left - x : x > b.right ? x - b.right : 0;
    const dy = y < b.top ? b.top - y : y > b.bottom ? y - b.bottom : 0;
    if (dx * 3 + dy < bestDist) {
      bestDist = dx * 3 + dy;
      best = p;
    }
  }
  return bestDist <= reach ? best : null;
}

// A tap on a card's Thai (2026-10-09, the user's request): a letter, vowel or tone mark says its name
// and lights up, as in the word pop-up, instead of turning the card. `el` is the Thai showing: the
// large Thai (the Thai → English front, the English → Thai back) or, since the same day, the smaller
// Thai repeated on the Thai → English and Listen backs (cardThaiShown, recallThaiShown); or null.
// `card` is the card it belongs to (for its whole vowels). True if a part was hit.
const CARD_TAP_REACH = 8;
function tapCardThai(el, e, card) {
  if (!el || !el.contains(e.target)) return false;
  const hit = tappedPart(el, card, e.clientX, e.clientY, CARD_TAP_REACH);
  if (!hit) return false;
  speak(hit.say, 'sp');
  flashPart(el.closest('.face'), hit.boxes);
  return true;
}


// While the word is spelt aloud, the part being read stays lit (a letter name: its letter; a whole
// vowel: each of its parts; the school method: its syllable, or its tone mark; at the end, the whole
// word). `at` lists the characters' indexes (the spelling steps' `at`); none clears it. `el` holds the
// word: the pop-up's big word, or the Thai on a Flashcards or Recall card (the light goes on the
// card's face). A run of characters (a syllable, the word) gets one box round it all. A vowel written
// round its consonant (เ-ีย in เรียน) gets a box on each of its parts, so the consonant between them
// isn't lit: ี sits above ร, and one box round ีย would cover ร too.
function lightParts(el, at) {
  const pop = el.closest('.reader-pop, .face');
  pop?.querySelectorAll('.pop-reading').forEach((x) => x.remove());
  if (!pop || !at?.length || !el.isConnected) return;
  const parts = partBoxes(el);
  const sorted = [...at].sort((a, b) => a - b);
  const together = sorted.every((i, n) => !n || i === sorted[n - 1] + 1);
  for (const run of together ? [sorted] : sorted.map((i) => [i])) {
    const boxes = parts.filter((p) => run.includes(p.i)).map((p) => p.box);
    if (!boxes.length) continue;
    const b = {
      left: Math.min(...boxes.map((x) => x.left)), right: Math.max(...boxes.map((x) => x.right)),
      top: Math.min(...boxes.map((x) => x.top)), bottom: Math.max(...boxes.map((x) => x.bottom)),
    };
    pop.append(partHighlight(pop, b, 'pop-reading'));
  }
}

// The element showing the card's Thai as text right now, for lighting it up as it's spelt (null when
// that side has none: English → Thai's front, Listen's sound button). Flashcards and Recall alike:
// Thai → English shows it on the front and again on the back; the other two on the back only.
function cardThaiShown() {
  if (!state.showingBack) return state.direction === 'th-en' ? els.thai : null;
  return state.direction === 'en-th' ? els.english : els.backThai;
}
function recallThaiShown() {
  const r = state.review;
  if (!r?.current) return null;
  if (!r.flipped) return r.current.dir === 'th-en' ? els.reviewPrompt : null;
  return r.current.dir === 'en-th' ? els.reviewMain : els.reviewBackThai;
}
// speakSpelling's onStep for a card: light each part on the side showing when the spelling began.
function lightOnCard(el) {
  return el ? (step) => lightParts(el, step?.at) : undefined;
}

// Text metrics in the big word's own font (canvas), for the height of a letter or a letter + mark.
function measureGlyphs(el, text) {
  glyphCanvas ||= document.createElement('canvas').getContext('2d');
  const cs = getComputedStyle(el);
  glyphCanvas.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
  return glyphCanvas.measureText(text);
}

// A brief highlight over the part that was tapped (boxes: each of a whole vowel's parts), so it's
// clear what the tap found.
function flashPart(pop, boxes) {
  pop.querySelectorAll('.pop-hit').forEach((x) => x.remove());
  for (const b of boxes) {
    const hl = partHighlight(pop, b, 'pop-hit');
    pop.append(hl);
    setTimeout(() => hl.remove(), 900);
  }
}

// A highlight over box b (page coordinates), placed in the pop-up.
function partHighlight(pop, b, className) {
  const p = pop.getBoundingClientRect();
  const hl = Object.assign(document.createElement('span'), { className });
  Object.assign(hl.style, { left: `${b.left - p.left - pop.clientLeft}px`, top: `${b.top - p.top - pop.clientTop}px`, width: `${b.right - b.left}px`, height: `${b.bottom - b.top}px` });
  return hl;
}

// The pop-up under its word, kept inside its host.
function placeWordPop(anchor) {
  const pop = els.readerPop;
  const box = popHost.getBoundingClientRect();
  const r = anchor.getBoundingClientRect();
  const left = clamp(r.left - box.left + r.width / 2 - pop.offsetWidth / 2, 8, box.width - pop.offsetWidth - 8);
  pop.style.left = `${left}px`;
  pop.style.top = `${r.bottom - box.top + 6}px`;
}

function hideWordPop() {
  els.readerPop.hidden = true;
  popAnchor?.classList.remove('on');
  popAnchor = null;
  popKey = null;
}

// The Topics table was redrawn (adding the word to Flashcards from the pop-up does that): the pop-up
// follows its word's new row, or closes if the row has gone.
function reanchorWordPop() {
  if (!popAnchor || popHost !== els.wordlistSection || popAnchor.isConnected) return;
  const cell = [...els.wordtableBody.querySelectorAll('tr')].find((tr) => tr.dataset.key === popKey)?.querySelector('.col-thai');
  if (!cell) { hideWordPop(); return; }
  popAnchor = cell;
  cell.classList.add('on');
  placeWordPop(cell);
}

// ---------- wordlist read-aloud ----------

async function startReadAloud() {
  if (state.reading.active) return;
  const rows = visibleWordlistRows();
  if (rows.length === 0) return;

  state.reading.active = true;
  const token = ++state.reading.token; // invalidates earlier runs
  const btn = document.getElementById('read-aloud');
  if (btn) {
    btn.classList.add('playing');
    btn.innerHTML = '■ Stop';
  }

  try {
    for (const card of rows) {
      if (token !== state.reading.token) return;
      state.reading.currentKey = card.key;
      renderWordlist();
      // Scroll the row into view if needed.
      const rowEl = els.wordtableBody.querySelector('tr.now-playing');
      if (rowEl) rowEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });

      const s = getSettings();
      for (let i = 0; i < s.readRepeats; i++) {
        if (token !== state.reading.token) return;
        await speakAndWait(card.thai, 'th');
        if (token !== state.reading.token) return;
        if (s.readSpeakEnglish) {
          await speakAndWait(card.english, 'en');
          if (token !== state.reading.token) return;
        }
        // Short gap between repeats of the same word (half of inter-word pause).
        if (i < s.readRepeats - 1) {
          await wait((s.readPauseSec * 1000) / 2);
        }
      }

      // Inter-word pause.
      if (token !== state.reading.token) return;
      await wait(s.readPauseSec * 1000);
    }
  } finally {
    stopReadAloud();
  }
}

function stopReadAloud() {
  state.reading.active = false;
  state.reading.token++; // any awaiting iteration will bail
  state.reading.currentKey = null;
  stopAudio();
  const btn = document.getElementById('read-aloud');
  if (btn) {
    btn.classList.remove('playing');
    btn.replaceChildren(speakerIcon(), 'Read all');
  }
  renderWordlist();
}

function toggleReadAloud() {
  if (state.reading.active) stopReadAloud();
  else startReadAloud();
}

async function resetAllProgress() {
  const ok = await confirmDialog({
    title: 'Reset all progress?',
    message: `This wipes your study history on all ${state.decks.length} topics. Your settings are kept.\nThis can't be undone.`,
    confirmLabel: 'Reset all progress',
    danger: true,
  });
  if (!ok) return;
  const store = loadStore();
  store.items = {};
  store.daily = {};
  delete store.reviewExcluded;      // from automatic adding, gone since 2026-10-07
  delete store.reviewExcludedCards;
  saveStore(store);
  if (state.currentDeckId) {
    reloadFlashcards();
    renderWordlist();
  }
  renderToday();
  toast('All progress reset');
}

// Settings → Reset → Clear Flashcards: every word you've added out of it (store.reviewWords; it was
// "Reset Review list" until 2026-10-08). Progress is kept, so re-adding carries on.
async function resetReviewList() {
  const n = Object.keys(reviewWords()).length;
  if (!n) {
    toast('Flashcards has no words in it');
    return;
  }
  const ok = await confirmDialog({
    title: 'Clear Flashcards?',
    message: `This takes all ${n} word${n === 1 ? '' : 's'} you've added out of Flashcards. Their progress is kept, so adding them again carries on.`,
    confirmLabel: 'Clear Flashcards',
    danger: true,
  });
  if (!ok) return;
  const store = loadStore();
  store.reviewWords = {};
  saveStore(store);
  renderToday();
  renderWordlist();
  syncReviewOnly();
  toast('Flashcards cleared');
}

// Every setting back to its default (getSettings merges DEFAULT_SETTINGS over what's saved).
// Progress and the Review list aren't settings, and nor is "Download all audio" being on: the
// audio stays downloaded and kept up to date.
async function resetSettings() {
  const ok = await confirmDialog({
    title: 'Reset all settings?',
    message: 'Every setting goes back to its default. Your progress and the words in Flashcards are kept.',
    confirmLabel: 'Reset settings',
    danger: true,
  });
  if (!ok) return;
  const store = loadStore();
  store.settings = store.settings?.offlineAudio ? { offlineAudio: true } : {};
  saveStore(store);
  applyTextSize();
  applyTheme();
  applyThaiFont();
  renderSettings();
  renderSpelling();
  syncReviewOnly();
  renderToday();
  renderWordlist();
  toast('Settings reset to defaults');
}

// ---------- TTS ----------

let thaiVoice = null;
let englishVoice = null;
let sampleFiles = { th: {}, en: {}, sp: {} };  // lang -> text -> MP3 in data/audio/ (see loadAudioManifest)
let sayText = new Map();  // card thai -> what to say instead, from the optional `say` field (e.g. ก -> กอ ไก่)
const sampleAudio = new Audio();
// Waveforms on screen light up as it plays, and speakers rest once the voice stops (tickPlayback).
sampleAudio.addEventListener('playing', () => requestAnimationFrame(tickPlayback));
let finishSample = null;    // settles the in-flight playSample() promise

// The current deck's clips are fetched in the background when it's selected and held as blob
// URLs, so playback never waits on the network. LRU-capped so browsing decks doesn't grow
// memory without bound (a 50-card deck is ~100 clips, ~1.2 MB).
const SAMPLE_CACHE_MAX = 600;
const sampleCache = new Map();  // clip URL -> blob URL; Map order doubles as LRU order

// Blob URL for a cached clip (marking it recently used), else the network URL.
function cachedSampleUrl(url) {
  const blobUrl = sampleCache.get(url);
  if (!blobUrl) return url;
  sampleCache.delete(url);
  sampleCache.set(url, blobUrl);
  return blobUrl;
}

function cacheSample(url, blobUrl) {
  sampleCache.set(url, blobUrl);
  for (const [oldUrl, oldBlobUrl] of sampleCache) {
    if (sampleCache.size <= SAMPLE_CACHE_MAX) break;
    if (oldBlobUrl === sampleAudio.src) continue; // never pull a clip out from under the player
    sampleCache.delete(oldUrl);
    URL.revokeObjectURL(oldBlobUrl);
  }
}

// The clips for what's on screen (a topic, or a Review session) go to the front of the audio
// queue: its Thai words, the parts their spellings are read with (in the current style), then the
// English. The Thai and English are kept in memory too, for instant playback. A newer call
// replaces the last one's clips that haven't been fetched yet.
// At most PRELOAD_MAX words: a group or category can hold hundreds, and fetching all of them at
// launch kept a phone busy for seconds (2026-10-07: 1,216 clips for a 593-word category). Then
// it's the words likely to play soon: those in Review (what Flashcards shows), then the top of the
// Topics page. Anything else is fetched when it's played.
const PRELOAD_MAX = 80;
function preloadDeckAudio(deck) {
  if (getSettings().audioSource !== 'samples') {
    queuePageAudio([]);
    return;
  }
  let cards = deck.cards;
  if (cards.length > PRELOAD_MAX) {
    const words = reviewWords();
    const inReview = cards.filter((c) => cardKey(c) in words);
    cards = [...new Set([...inReview, ...cards])].slice(0, PRELOAD_MAX);
  }
  const entries = [];
  const add = (url, keep) => url && entries.push({ url, keep });
  for (const c of cards) add(sampleUrl(c.thai, 'th'), true);
  for (const c of cards) {
    for (const step of (spellingFor(c) || []).flat()) if (!step.gap && !step.word) add(sampleUrl(step.say, 'sp'), false);
  }
  for (const c of cards) add(sampleUrl(c.english, 'en'), true);
  queuePageAudio(entries);
}

// ---------- the audio queue ----------
// One queue fetches clips ahead of playback, AUDIO_JOBS at a time: the page's clips at the front
// (preloadDeckAudio), "Download all audio" behind them. A clip that's already loaded isn't queued.
// Items: { file, url, keep, page, bulk }. keep = hold it in memory (sampleCache) too; page = for
// what's on screen; bulk = for "Download all audio". `items` holds the ones not taken yet, by file;
// `order` is the fetch order (an item no longer in `items` is skipped).
const AUDIO_JOBS = 6;
const audioQueue = { order: [], items: new Map(), workers: 0 };

function queuePageAudio(entries) {
  // The last page's clips not fetched yet are dropped, unless "Download all audio" wants them.
  for (const item of audioQueue.items.values()) {
    if (!item.page) continue;
    item.page = false;
    item.keep = false;
    if (!item.bulk) audioQueue.items.delete(item.file);
  }
  const front = [];
  for (const { url, keep } of entries) {
    const file = url.split('/').pop();
    if (keep ? sampleCache.has(url) : offline.have?.has(file)) continue; // already loaded
    let item = audioQueue.items.get(file);
    if (item?.page) continue; // listed twice
    if (!item) {
      item = { file, url, keep: false, page: false, bulk: false };
      audioQueue.items.set(file, item);
    }
    item.page = true;
    item.keep = keep;
    front.push(item);
  }
  const first = new Set(front);
  audioQueue.order = front.concat(audioQueue.order.filter((i) => !first.has(i) && audioQueue.items.get(i.file) === i));
  pumpAudio();
}

function queueBulkAudio(files) {
  for (const file of files) {
    const item = audioQueue.items.get(file);
    if (item) {
      item.bulk = true;
      continue;
    }
    const added = { file, url: `data/audio/${file}`, keep: false, page: false, bulk: true };
    audioQueue.items.set(file, added);
    audioQueue.order.push(added);
  }
  pumpAudio();
}

function dropBulkAudio() {
  for (const item of audioQueue.items.values()) {
    if (!item.bulk) continue;
    item.bulk = false;
    if (!item.page) audioQueue.items.delete(item.file);
  }
}

// Start workers, once the app has finished opening. When the last one finds the queue empty, a
// "Download all audio" run is over.
function pumpAudio() {
  launched.then(() => {
    while (audioQueue.workers < AUDIO_JOBS && audioQueue.order.length) {
      audioQueue.workers += 1;
      audioWorker().finally(() => {
        audioQueue.workers -= 1;
        if (!audioQueue.workers && offline.running && offline.done != null) finishDownloadAll();
      });
    }
  });
}

async function audioWorker() {
  while (audioQueue.order.length) {
    const item = audioQueue.order.shift();
    if (audioQueue.items.get(item.file) !== item) continue; // dropped, or fetched already
    audioQueue.items.delete(item.file);
    await fetchQueuedAudio(item);
  }
}

let offlineRenderedAt = 0;
async function fetchQueuedAudio(item) {
  const { file, url } = item;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    // With the service worker in control it saves each clip on the way through. Before it takes
    // control (the very first visit), "Download all audio" saves them here.
    let saved = !!navigator.serviceWorker?.controller;
    if (!saved && item.bulk) {
      await ClipStore.put(file, await res.clone().arrayBuffer());
      saved = true;
    }
    const blob = await res.blob();
    if (saved) offline.have?.add(file);
    if (item.keep) cacheSample(url, URL.createObjectURL(blob));
    if (item.bulk) offline.done += 1;
  } catch {
    // Offline, say: playback fetches the clip when it's needed.
    if (item.bulk) offline.failed += 1;
  }
  if (item.bulk && offline.running && performance.now() - offlineRenderedAt > 300) {
    offlineRenderedAt = performance.now();
    renderOffline();
  }
}

function pickVoices() {
  const voices = window.speechSynthesis?.getVoices() || [];
  thaiVoice =
    voices.find((v) => v.lang === 'th-TH') ||
    voices.find((v) => v.lang?.startsWith('th')) ||
    voices.find((v) => /thai/i.test(v.name)) ||
    null;
  englishVoice =
    voices.find((v) => v.lang === 'en-GB') ||
    voices.find((v) => v.lang === 'en-US') ||
    voices.find((v) => v.lang?.startsWith('en')) ||
    null;
}

function sampleUrl(text, lang) {
  if (getSettings().audioSource !== 'samples') return null;
  const file = sampleFiles[lang]?.[text];
  return file ? `data/audio/${file}` : null;
}

function audioSourceHelpText(source) {
  if (source === 'browser') return "Your browser's built-in voices. Quality varies by browser and OS; Thai is usually poor.";
  const coverage = (lang, field) => {
    const texts = new Set(state.decks.flatMap((d) => d.cards.map((c) => c[field])));
    const have = [...texts].filter((t) => sampleFiles[lang][t]).length;
    return `${have} of ${texts.size}`;
  };
  return `Neural-voice recordings from data/audio/ (Thai ${coverage('th', 'thai')}, English ${coverage('en', 'english')}). Anything missing uses the browser voice.`;
}

// Stop whatever is playing, sample or TTS. Pending speakAndWait() calls resolve.
function stopAudio() {
  spellRun += 1; // ends a spelling being read out
  if (spelling) {
    markSpelling(spelling.buttons, false);
    spelling = null;
  }
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  sampleAudio.pause();
  if (finishSample) finishSample(true);
}

// ---------- spelling (spell.js) ----------

// A card's spelling in the chosen style. The school method and whole vowels both need the word's
// syllables worked out, and fall back to letter names as written where they can't be. null for text
// with nothing to name.
function spellingFor(card) {
  if (!card || !isSpellable(card.thai)) return null;
  const style = getSettings().spellingStyle;
  const read = style === 'school' ? schoolSpelling(card.thai, card.translit)
    : style === 'vowels' ? vowelSpelling(card.thai, card.translit) : null;
  return read || letterSpelling(card.thai);
}

// The current card's spell-aloud buttons. The spelling is only spoken, lighting each part of the Thai
// as it's read; its written line on the back went on 2026-10-09 (the user's call).
function renderSpelling() {
  const groups = spellingFor(currentCard());
  els.cardSpell.hidden = !groups;
  // On the front only when it shows the Thai: in English → Thai it would give the answer away.
  els.cardSpellFront.hidden = !groups || state.direction === 'en-th'; // Thai → English and Listen
}

// Read a spelling aloud step by step: each part's recording (manifest section sp), the card's own
// recording for the whole word, and a short pause between syllables. Any other audio stops it.
let spellRun = 0;
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let spelling = null; // the spelling being read out: { key, run, buttons }
// The pace of a spelling. The parts are recorded with their silence trimmed off
// (tools/gen_audio.py), so these pauses alone set it: a beat between letters (or sounds), a
// longer one between syllables.
const SPELL_STEP_PAUSE = 180;
const SPELL_SYLLABLE_PAUSE = 450;

// The buttons of the spelling being read out light up (and their waves pulse): pressing one
// again stops it.
function markSpelling(buttons, on) {
  for (const b of buttons) {
    b.classList.toggle('playing', on);
    b.setAttribute('aria-pressed', String(on));
  }
}

// Read a card's spelling out, lighting up `buttons` meanwhile. Pressing a button for the word
// already being spelled stops it instead. Any other sound (stopAudio) stops it too.
async function speakSpelling(card, buttons = [], { onStep } = {}) {
  if (!card) return;
  const key = cardKey(card);
  if (spelling?.key === key) {
    stopAudio();
    return;
  }
  const groups = spellingFor(card);
  if (!groups) return;
  stopAudio();
  const run = spellRun;
  spelling = { key, run, buttons };
  markSpelling(buttons, true);
  const parts = fetchSpellingParts(groups);
  try {
    let wait = 0; // the pause before the next spoken part
    for (const steps of groups) {
      for (const step of steps) {
        if (step.gap) {
          wait = SPELL_SYLLABLE_PAUSE;
          continue;
        }
        if (wait) await pause(wait);
        const part = step.word ? null : await parts.get(sampleUrl(step.say, 'sp'));
        if (run !== spellRun) return;
        onStep?.(step); // e.g. the reader's pop-up lights up the part being read
        if (step.word) await speakAndWait(card.thai, 'th');
        else if (!part || !(await playSample(part, speedFor('sp')))) await speakAndWait(step.say, 'sp');
        wait = SPELL_STEP_PAUSE;
      }
      wait = SPELL_SYLLABLE_PAUSE; // groups are syllables (school method) or words
    }
  } finally {
    onStep?.(null);
    if (spelling?.run === run) {
      markSpelling(buttons, false);
      spelling = null;
    }
    // The player has stopped or moved on by now, so the parts can go.
    for (const blobUrl of parts.values()) blobUrl.then((u) => u && URL.revokeObjectURL(u));
  }
}

// Fetch every part of a spelling at once, in parallel, into memory: each then plays the moment
// the one before ends, rather than waiting its turn for the service worker (or the network).
// url -> Promise of a blob URL, or null if it couldn't be fetched (speakAndWait then tries).
function fetchSpellingParts(groups) {
  const parts = new Map();
  for (const step of groups.flat()) {
    const url = !step.gap && !step.word && sampleUrl(step.say, 'sp');
    if (!url || parts.has(url)) continue;
    parts.set(url, fetch(url)
      .then((res) => (res.ok ? res.blob() : null))
      .then((blob) => blob && URL.createObjectURL(blob))
      .catch(() => null));
  }
  return parts;
}

function speak(text, lang = 'th') {
  stopAudio();
  speakAndWait(text, lang);
}

function speedFor(lang) {
  return lang === 'en' ? 1 : getSettings().thaiSpeed; // th, and sp (Thai spelling parts)
}

// Resolves true once the sample has played (or been stopped), false if it couldn't load.
function playSample(url, speed) {
  if (finishSample) finishSample(true);
  return new Promise((resolve) => {
    const finish = (ok) => {
      if (finishSample !== finish) return;
      finishSample = null;
      playingUrl = null;
      requestAnimationFrame(tickPlayback); // a waveform goes dark again
      resolve(ok);
    };
    finishSample = finish;
    playingUrl = url;
    waveformOf(url); // for where the voice stops (tickPlayback); decoded once, then cached
    sampleAudio.onended = () => finish(true);
    sampleAudio.onerror = () => finish(false);
    // Loading a new src resets playbackRate to defaultPlaybackRate, so set both.
    // Browsers preserve pitch by default when the rate changes.
    sampleAudio.defaultPlaybackRate = speed;
    sampleAudio.src = cachedSampleUrl(url);
    sampleAudio.playbackRate = speed;
    // NotAllowedError = autoplay blocked before any user gesture; TTS would be blocked too.
    sampleAudio.play().catch((e) => finish(e.name === 'NotAllowedError'));
  });
}

function makeUtterance(text, lang) {
  const u = new SpeechSynthesisUtterance(text);
  if (lang === 'en') {
    u.lang = 'en-GB';
    if (englishVoice) u.voice = englishVoice;
    u.rate = 1.0;
  } else {
    u.lang = 'th-TH';
    if (thaiVoice) u.voice = thaiVoice;
    u.rate = 0.9 * speedFor('th'); // browser Thai voices are fast; 0.9 is the "normal" baseline
  }
  return u;
}

// Speak text and wait for it to finish (or fail, or be stopped).
async function speakAndWait(text, lang) {
  // While a word's Thai is being said, its speaker buttons animate (markSpeakers). A newer call
  // takes over; only the latest clears it when it finishes.
  const seq = ++speakSeq;
  speakingText = lang === 'th' ? text : null;
  speechOver = false;
  markSpeakers();
  try {
    const url = sampleUrl(text, lang);
    if (url && await playSample(url, speedFor(lang))) return;
    // No sample for this text, or it failed to load: fall back to browser TTS.
    if (lang === 'sp') return await ttsAndWait(text, 'th');
    return await ttsAndWait(lang === 'th' ? sayText.get(text) ?? text : text, lang);
  } finally {
    if (seq === speakSeq) {
      speakingText = null;
      markSpeakers();
    }
  }
}

// A speaker button plays its word, or, pressed while that word is playing (the button's lit), stops
// it, as the spell button does (the user's request, 2026-10-08). Pressed during Read all, the lit
// row's speaker stops the reading.
function speakerPress(btn, thai) {
  if (!btn.classList.contains('playing')) {
    speak(thai);
    return;
  }
  if (state.reading.active) stopReadAloud();
  else stopAudio();
}

// The Thai being said now (speakAndWait), or null.
let speakingText = null;
let speakSeq = 0;

// Whether this Thai is being said: its clip is playing and the voice hasn't stopped yet (tickPlayback).
const sayingNow = (thai) => speakingText !== null && !speechOver && thai === speakingText;

// Every speaker button for the word being said lights up and its waves pulse (2026-10-08, the
// user's request): the Flashcards and Recall cards' corners when it's their word (a tap, the card
// appearing, a turn to the script), and the Topics list's and search results' rows (a tap, or Read
// all reaching the row).
function markSpeakers() {
  const on = sayingNow;
  const flash = currentCard()?.thai;
  const recall = state.review?.current && state.cardIndex.get(state.review.current.key)?.card.thai;
  els.speakButtons.forEach((b) => b.classList.toggle('playing', on(flash)));
  document.querySelectorAll('.review-speak').forEach((b) => b.classList.toggle('playing', on(recall)));
  document.querySelectorAll('.row-speak').forEach((b) => b.classList.toggle('playing', on(b.dataset.say)));
}

function ttsAndWait(text, lang) {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) { resolve(); return; }
    try {
      const u = makeUtterance(text, lang);
      u.onend = () => resolve();
      u.onerror = () => resolve();
      window.speechSynthesis.speak(u);
    } catch (e) {
      console.warn('TTS failed:', e);
      resolve();
    }
  });
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------- wiring ----------

function bindEvents() {
  els.tabs.forEach((t) => {
    t.addEventListener('click', () => {
      // Reading's tab again, with a passage open: back to the list.
      if (t.dataset.view === 'reading' && state.view === 'reading' && state.readingId) {
        state.readingId = null;
        renderReading();
        window.scrollTo(0, 0);
        return;
      }
      setView(t.dataset.view);
    });
  });

  document.getElementById('read-aloud').addEventListener('click', toggleReadAloud);

  // Deck picker
  els.deckButton.addEventListener('click', openDeckPicker);
  els.reviewByButtons.forEach((b) => b.addEventListener('click', () => {
    setFlashcardsBy(b.dataset.reviewBy);
    if (b.dataset.reviewBy === 'all') closeDeckPicker(); // nothing more to pick
    else renderReviewBy();
  }));
  els.deckPicker.addEventListener('click', (e) => {
    if (e.target.dataset.close !== undefined) closeDeckPicker();
  });

  // Settings modal
  els.settingsButton.addEventListener('click', openSettings);
  els.settingsModal.addEventListener('click', (e) => {
    if (e.target.dataset.close !== undefined) closeSettings();
  });
  els.readingBack.addEventListener('click', () => {
    state.readingId = null;
    renderReading();
    window.scrollTo(0, 0);
  });
  [[els.readerTranslit, 'readerTranslit'], [els.readerEnglish, 'readerEnglish'], [els.readerSpaces, 'readerSpaces']].forEach(([btn, key]) => {
    btn.addEventListener('click', () => {
      setPreferences({ [key]: !getPreferences()[key] });
      hideWordPop(); // the lines move
      applyReaderToggles();
    });
  });
  // A tap anywhere else closes a word's pop-up.
  // (By the path the click took: a button that redraws itself when pressed, like the pop-up's add to
  // Flashcards, has left the page by now, so e.target.closest would find no pop-up and close it.)
  document.addEventListener('click', (e) => {
    if (popAnchor && !e.composedPath().some((n) => n === els.readerPop || n === popAnchor || n.classList?.contains('rw'))) hideWordPop();
  });
  window.addEventListener('resize', () => { if (popAnchor) hideWordPop(); });

  els.deckPickerSearch.addEventListener('input', (e) => {
    state.pickerFilter = e.target.value;
    renderDeckPicker();
  });
  els.deckPickerSearch.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      // Pick the first visible deck row.
      const first = els.deckPickerTree.querySelector('.deck-row');
      if (first) first.click();
    }
  });

  els.resetAll.addEventListener('click', resetAllProgress);
  els.resetSettings.addEventListener('click', resetSettings);
  els.resetReview.addEventListener('click', resetReviewList);

  [els.cardSpell, els.cardSpellFront].forEach((btn) => btn.addEventListener('click', (e) => {
    e.stopPropagation(); // not a flip
    speakSpelling(currentCard(), [els.cardSpell, els.cardSpellFront], { onStep: lightOnCard(cardThaiShown()) });
  }));
  els.card.addEventListener('click', (e) => {
    // Don't flip if clicking the speak or flip button (flip-btn calls flipCard itself).
    if (e.target.closest('.speak-btn')) return;
    if (e.target.closest('.auto-badge')) return;
    if (e.target.closest('.spell-btn')) return;
    if (e.target.closest('.flip-btn')) return;
    if (e.target.closest('.listen-btn')) return;
    if (tapCardThai(cardThaiShown(), e, currentCard())) return; // a letter of the Thai: named, not a turn
    flipCard();
  });

  els.flipButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      flipCard();
    });
  });

  els.card.addEventListener('keydown', (e) => {
    if (e.target !== els.card) return; // a button on the card (speaker, A, flip) does its own thing
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      flipCard();
    }
  });

  els.speakButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const c = currentCard();
      if (c) speakerPress(btn, c.thai);
    });
  });
  els.autoBadges.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation(); // not a flip
      const on = getPreferences().autoPlay === false;
      setPreferences({ autoPlay: on });
      renderAutoBadges();
      toast(on ? 'Auto-play on' : 'Auto-play off: press the speaker to hear a word');
    });
  });

  els.prevBtn.addEventListener('click', goPrev);
  els.nextBtn.addEventListener('click', goNext);

  els.orderButtons.forEach((btn) => {
    btn.addEventListener('click', () => setOrderMode(btn.dataset.order));
  });

  els.directionButtons.forEach((btn) => {
    btn.addEventListener('click', () => setDirection(btn.dataset.direction));
  });


  els.homeLink.addEventListener('click', () => setView('home'));
  els.homeCards.forEach((card) => card.addEventListener('click', () => setView(card.dataset.go)));

  // Adding to Review by hand
  els.wordlistAddAll.addEventListener('click', async () => {
    const words = reviewWords();
    const deck = currentScope();
    const keys = state.listCards.map((c) => c.key).filter((key) => !(key in words));
    if (!keys.length) {
      // All in Review: remove them all (their progress is kept).
      const n = state.listCards.length;
      const ok = await confirmDialog({
        title: 'Remove all from Flashcards?',
        message: `Remove all ${n} words in ${deck.name} from Flashcards? Your progress on them is kept.`,
        confirmLabel: `Remove ${n}`,
        setting: 'confirmRemoveAll',
      });
      if (ok) {
        setInReview(state.listCards.map((c) => c.key), false);
        toast(`Removed ${n} words from Flashcards`);
      }
      return;
    }
    const n = keys.length;
    const ok = await confirmDialog({
      title: 'Add all to Flashcards?',
      message: n === state.listCards.length
        ? `Add all ${n} words in ${deck.name} to Flashcards?`
        : `Add the ${n} words in ${deck.name} that aren't in Flashcards yet?`,
      confirmLabel: `Add ${n}`,
      setting: 'confirmAddAll',
    });
    if (ok) {
      setInReview(keys, true);
      toast(`✓ Added ${n} ${n === 1 ? 'word' : 'words'} to Flashcards`, { tone: 'good' });
    }
  });
  // Flashcards with none of the topic's words in yet: "Add all words from '…'? Yes" (the question is
  // the confirmation), or the Topics page to pick them.
  els.reviewOnlyYes.addEventListener('click', () => {
    const words = reviewWords();
    const keys = state.cards.map((c) => c.key).filter((key) => !(key in words));
    if (!keys.length) return;
    setInReview(keys, true);
    toast(`✓ Added ${keys.length} ${keys.length === 1 ? 'word' : 'words'} to Flashcards`, { tone: 'good' });
  });
  els.reviewOnlyTopics.addEventListener('click', () => setView('wordlist'));
  els.reviewOnlyEverything.addEventListener('click', () => setFlashcardsBy('all'));
  els.confirmOk.addEventListener('click', () => closeConfirm(true));
  els.confirmCancel.addEventListener('click', () => closeConfirm(false));
  els.confirmModal.querySelector('[data-close]').addEventListener('click', () => closeConfirm(false));

  // ⟳ turns the card: to the answer first, then either way (as a tap on the card does).
  els.reviewCard.querySelectorAll('.review-flip').forEach((btn) => btn.addEventListener('click', () => {
    const r = state.review;
    if (!r) return;
    if (!r.revealed) revealAnswer();
    else turnReviewCard();
  }));
  els.reviewGrades.addEventListener('click', (e) => {
    const btn = e.target.closest('.grade');
    if (btn) gradeCurrent(Number(btn.dataset.grade));
  });
  els.reviewCard.querySelectorAll('.review-speak').forEach((btn) => btn.addEventListener('click', () => {
    const entry = state.review?.current;
    if (entry) speakerPress(btn, state.cardIndex.get(entry.key).card.thai);
  }));
  [els.reviewSpell, els.reviewSpellBack].forEach((btn) => btn.addEventListener('click', (e) => {
    e.stopPropagation(); // not a tap on the card
    const entry = state.review?.current;
    if (entry) speakSpelling(state.cardIndex.get(entry.key).card, [els.reviewSpell, els.reviewSpellBack], { onStep: lightOnCard(recallThaiShown()) });
  }));
  // Tapping the card turns it, as on Flashcards: to the answer first (as Show does), then either way.
  els.reviewCard.addEventListener('click', (e) => {
    const r = state.review;
    if (!r || e.target.closest('button')) return;
    if (tapCardThai(recallThaiShown(), e, state.cardIndex.get(r.current?.key)?.card)) return; // a letter of the Thai: named, not a turn
    if (!r.revealed) revealAnswer();
    else turnReviewCard();
  });

  document.addEventListener('keydown', (e) => {
    if (state.confirm) {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeConfirm(false);
      }
      return; // Enter / Space act on the focused button
    }
    if (state.pickerOpen) {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeDeckPicker();
      }
      return;
    }
    if (state.settingsOpen) {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeSettings();
      }
      return;
    }
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
    if (state.view === 'home' || state.view === 'reading') return; // Flashcards' and Topics' keys
    if (state.view === 'flashcards' && state.orderMode === 'review') {
      handleReviewKey(e);
      return;
    }
    if (e.key === ' ') {
      e.preventDefault();
      flipCard();
    } else if (e.key === 'p' || e.key === 'P') {
      const c = currentCard();
      if (c) speak(c.thai);
    } else if (e.key === 'ArrowRight') {
      goNext();
    } else if (e.key === 'ArrowLeft') {
      goPrev();
    }
  });

  if ('speechSynthesis' in window) {
    pickVoices();
    window.speechSynthesis.onvoiceschanged = pickVoices;
  }

  bindSettings();
}

// ---------- install & offline ----------
// sw.js caches the app files, and saves each audio clip as it's fetched (audio-store.js,
// IndexedDB). Here: Settings → App (install, launch time), Settings → Audio → Offline audio
// ("Download all audio"), and keeping the saved clips in step with the manifest.

const PUBLIC_URL = 'https://wjsrobertson.github.io/thai/';
const AVG_CLIP_KB = 9.8;               // for the size estimate; 156 MB / 16k clips on 2026-10-07
const IS_IOS = /iPhone|iPad|iPod/.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); // iPadOS reports as a Mac
let installPrompt = null; // Chrome/Android's deferred install prompt; Safari has none

// Resolves a second after the page's load event: work that can wait (the audio queue) stays out
// of the way while the app opens.
const launched = new Promise((resolve) => {
  const go = () => setTimeout(resolve, 1000);
  if (document.readyState === 'complete') go();
  else window.addEventListener('load', go, { once: true });
});

// Settings → App → Launch time, for this launch: when the page arrived (from the service
// worker's saved copy or the network), when the first frame was drawn and when the home screen
// was filled in. All from when the browser started loading the page, so time the phone spent
// starting the app before that isn't included.
function launchTimingText() {
  const nav = performance.getEntriesByType?.('navigation')?.[0];
  const ready = performance.getEntriesByName?.('app-ready')?.[0]?.startTime;
  if (!nav || ready == null) return 'Not measured in this browser.';
  const s = (ms) => `${(ms / 1000).toFixed(2)} s`;
  const from = navigator.serviceWorker?.controller ? 'the saved copy' : 'the network';
  const drawn = window.firstFrameAt != null ? `, drawn at ${s(window.firstFrameAt)}` : '';
  return `This launch: page loaded from ${from} at ${s(nav.responseEnd)}${drawn}, ready at ${s(ready)}. ` +
    'Times count from when the page started loading. Any wait before that is the phone opening the app.';
}

// Offline audio. `have` is the saved clips' file names (ClipStore.keys()). They're read only when
// needed (Settings → Audio open, a sync after the clip list changed, "Download all audio") and then
// kept up to date as clips are saved and deleted here; `reading` is that read while it's under way.
// (That mattered more when the clips were in Cache Storage, where reading the names took seconds on
// an iPhone.) done/total/failed count a "Download all audio" run.
const offline = { running: false, done: 0, total: 0, failed: 0, have: null, reading: null, used: null, error: false };

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  installPrompt = e;
  renderInstall();
});
window.addEventListener('appinstalled', () => {
  installPrompt = null;
  renderInstall();
});

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return; // also absent over plain http on a LAN address
  // The app opens from the saved copy; sw.js checks for a new version in the background and
  // says so when it has stored one, and a reload then shows it.
  navigator.serviceWorker.addEventListener('message', (e) => {
    if (e.data?.type === 'update-ready') els.updateBar.hidden = false;
  });
  els.updateReload.addEventListener('click', () => location.reload());
  navigator.serviceWorker.register('sw.js').catch((e) => console.warn('Service worker failed:', e));
}

function isInstalled() {
  return window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
}

function renderInstall() {
  els.installActions.hidden = !installPrompt || IS_IOS;
  els.installHelp.textContent =
    isInstalled() ? 'Installed: running as an app.' :
    !window.isSecureContext ? `Installing needs HTTPS. Open ${PUBLIC_URL} instead.` :
    IS_IOS ? 'Tap Share (□↑), then "Add to Home Screen". It then opens full-screen, like an app.' :
    installPrompt ? 'Adds Learn Thai to your home screen or app list.' :
    "Use your browser's menu to install it, if your browser supports that.";
}

function allAudioFiles() {
  return [...new Set([...Object.values(sampleFiles.th), ...Object.values(sampleFiles.en), ...Object.values(sampleFiles.sp)])];
}

// Read the saved clips' file names afresh (one read at a time; callers share it), then redraw
// Settings → Offline audio and remember the count for next time.
function readSavedAudio() {
  offline.reading ??= (async () => {
    try {
      offline.have = new Set(await ClipStore.keys());
      offline.error = false;
    } catch (e) {
      console.warn('Reading the saved audio failed:', e);
      offline.error = true;
      offline.have ??= new Set();
    } finally {
      offline.reading = null;
    }
    rememberSavedCount();
    renderOffline();
    return offline.have;
  })();
  return offline.reading;
}

// The saved file names: as last read and kept up to date, or the read under way.
const savedAudio = () => offline.reading || (offline.have ? Promise.resolve(offline.have) : readSavedAudio());

const savedCount = () => allAudioFiles().filter((f) => offline.have.has(f)).length;

// The count is kept in prefs too, so after a restart Settings shows it straight away (marked
// "checking") instead of waiting for the read.
function rememberSavedCount() {
  if (!offline.have || offline.reading || !allAudioFiles().length) return;
  const n = savedCount();
  if (getPreferences().offlineSaved !== n) setPreferences({ offlineSaved: n });
}

const mb = (bytes) => Math.round(bytes / 1e6).toLocaleString();

// Settings → Audio → Offline audio. Draws at once from what's known, so it's never blank: "X of Y
// clips saved" leads in every state. Until this visit's read finishes, X is the last count,
// marked "checking".
function renderOffline() {
  if (!('serviceWorker' in navigator)) {
    els.offlineHelp.textContent = `Offline audio needs HTTPS. Open ${PUBLIC_URL} instead.`;
    els.offlineProgress.hidden = true;
    els.offlineDownload.parentElement.hidden = true;
    return;
  }
  // The count needs a read of the saved clips: only while it's on screen.
  if (!offline.have && !offline.reading && state.settingsOpen && els.offlineHelp.closest('details')?.open) readSavedAudio();
  const n = (x) => x.toLocaleString();
  const total = offline.running ? offline.total : allAudioFiles().length;
  const known = offline.running ? offline.done != null : offline.have && !offline.reading;
  const done = offline.running ? offline.done : known ? savedCount() : getPreferences().offlineSaved ?? null;
  const complete = total > 0 && done === total; // the buttons trust the remembered count too
  // The browser's storage figure is only asked for between downloads, and lags behind a delete.
  const used = done && !offline.running ? offline.used : null;
  if (!offline.running) {
    // The storage figure fills in when the browser answers.
    navigator.storage?.estimate?.().then((e) => {
      if (e?.usage && e.usage !== offline.used) {
        offline.used = e.usage;
        renderOffline();
      }
    }).catch(() => {});
  }

  let text;
  if (!total) text = 'Loading…';
  else if (done == null) text = offline.running ? `Checking which of the ${n(total)} clips are already saved…` : `Checking which of the ${n(total)} clips are saved…`;
  else {
    text = `${n(done)} of ${n(total)} clips saved${used ? ` (${mb(used)} MB)` : ''}${known ? '.' : ', checking…'}`;
    if (offline.running) text += ' Downloading: keep the app open until it finishes.';
    else if (known && complete) text += ` Everything is saved for offline use.${getSettings().offlineAudio ? ' Clips for new cards download automatically.' : ''}`;
    else if (known) text += ` Everything is about ${mb(total * AVG_CLIP_KB * 1000)} MB, best on Wi-Fi. Each topic's audio is saved anyway when you open it.`;
    if (offline.failed && !offline.running) text += ` ${n(offline.failed)} failed: check your connection and try again.`;
  }
  if (offline.error && !offline.running) text += " Couldn't read the saved audio.";
  els.offlineHelp.textContent = text;
  els.offlineProgress.hidden = !offline.running;
  els.offlineProgress.value = total && done ? done / total : 0;
  els.offlineDownload.hidden = complete && !offline.running;
  els.offlineDownload.textContent = offline.running ? 'Stop' : done ? 'Download the rest' : 'Download all audio';
  els.offlineDelete.hidden = offline.running || !done;
}

// Queue every clip that isn't saved yet, behind the page's (see the audio queue). Resumable: saved
// clips are skipped, so a stopped or interrupted run picks up where it left off.
async function downloadAllAudio() {
  if (offline.running || !('serviceWorker' in navigator)) return;
  const files = allAudioFiles();
  // Show it's started straight away: finding what's already saved can take a few seconds.
  Object.assign(offline, { running: true, done: null, total: files.length, failed: 0 });
  renderOffline();
  const have = await savedAudio();
  if (!offline.running) return; // stopped while checking
  const todo = files.filter((f) => !have.has(f));
  offline.done = files.length - todo.length;
  renderOffline();
  if (todo.length) queueBulkAudio(todo);
  else finishDownloadAll();
}

function stopDownloadAll() {
  dropBulkAudio();
  offline.running = false;
  rememberSavedCount();
  renderOffline();
}

function finishDownloadAll() {
  offline.running = false;
  // Everything saved: later launches can skip checking, until the clip list changes.
  const files = allAudioFiles();
  if (offline.done === files.length) setPreferences({ audioComplete: audioListSignature(files) });
  rememberSavedCount();
  renderOffline();
}

// A fingerprint of the manifest's clip list (FNV-1a), so a launch can tell nothing has changed.
function audioListSignature(files) {
  let h = 0x811c9dc5;
  for (const f of files) for (let i = 0; i < f.length; i++) h = Math.imul(h ^ f.charCodeAt(i), 16777619);
  return `${files.length}:${(h >>> 0).toString(36)}`;
}

// A few seconds after launch: drop saved clips that no card uses any more (edited or removed
// cards), then, if the user chose to download everything, fetch clips for new cards. Both need a
// read of the saved clips, so they're skipped when the clip list hasn't changed since they last ran
// (prefs.audioPruned / audioComplete hold its signature).
async function syncOfflineAudio() {
  if (!('serviceWorker' in navigator)) return;
  // Clips used to be kept in Cache Storage. sw.js deletes that cache when it updates, but the old
  // service worker's last fetches can recreate it (seen in Chromium), so it's deleted here once.
  if (!getPreferences().oldAudioCacheGone && 'caches' in window) {
    try {
      await caches.delete('learnthai-audio');
      setPreferences({ oldAudioCacheGone: true });
    } catch (e) {
      console.warn('Deleting the old audio cache failed:', e);
    }
  }
  const files = allAudioFiles();
  if (!files.length) return; // the manifest didn't load: don't prune everything
  const sig = audioListSignature(files);
  const prefs = getPreferences();
  const download = getSettings().offlineAudio && prefs.audioComplete !== sig;
  if (prefs.audioPruned === sig && !download) return;
  const wanted = new Set(files);
  const have = await savedAudio();
  const stale = [...have].filter((f) => !wanted.has(f));
  if (stale.length) {
    await ClipStore.delete(stale); // one transaction
    for (const f of stale) have.delete(f);
  }
  setPreferences({ audioPruned: sig });
  rememberSavedCount();
  renderOffline();
  if (download) downloadAllAudio();
}

// ---------- backup (Settings → App → Backup) ----------
// The whole store (settings, progress, Review list, page choices) as a JSON file, and loading one
// back. Loading replaces the store, then reloads the app so everything starts from it.
const BACKUP_FORMAT = 'learnthai-backup';

function backupSummary(store) {
  const words = Object.keys(store.reviewWords || {}).length;
  const studied = new Set(Object.keys(store.items || {}).map((k) => splitItemKey(k)[0])).size;
  return `${words} word${words === 1 ? '' : 's'} in Flashcards, progress on ${studied}`;
}

async function exportBackup() {
  const now = new Date();
  const backup = { format: BACKUP_FORMAT, version: 1, exported: now.toISOString(), data: loadStore() };
  const name = `learnthai-backup-${now.toISOString().slice(0, 10)}.json`;
  const file = new File([JSON.stringify(backup, null, 1)], name, { type: 'application/json' });
  // iPhone: the share sheet ("Save to Files"); a download link can just open the file there.
  if (IS_IOS && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'Learn Thai backup' });
    } catch (e) {
      if (e.name !== 'AbortError') toast("Couldn't share the backup");
    }
    return;
  }
  const url = URL.createObjectURL(file);
  const a = Object.assign(document.createElement('a'), { href: url, download: name });
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
  toast(`Saved ${name}`);
}

async function loadBackup(file) {
  let backup;
  try {
    backup = JSON.parse(await file.text());
  } catch {
    toast("That file isn't a Learn Thai backup");
    return;
  }
  const data = backup?.data;
  const plain = (x) => x == null || (typeof x === 'object' && !Array.isArray(x));
  if (backup?.format !== BACKUP_FORMAT || !data || typeof data !== 'object' ||
      !['settings', 'prefs', 'items', 'daily', 'reviewWords'].every((k) => plain(data[k]))) {
    toast("That file isn't a Learn Thai backup");
    return;
  }
  const when = backup.exported ? new Date(backup.exported).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : 'an unknown date';
  const ok = await confirmDialog({
    title: 'Load this backup?',
    message: `From ${when}: ${backupSummary(data)}.\nIt replaces the settings, progress and words in Flashcards on this device (${backupSummary(loadStore())}).`,
    confirmLabel: 'Load backup',
    danger: true,
  });
  if (!ok) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  try { sessionStorage.setItem('learnthai:toast', 'Backup loaded'); } catch { /* no toast then */ }
  location.reload();
}

// ---------- boot ----------

async function init() {
  applyTextSize(); // before anything renders, so the text never jumps size
  applyTheme();
  applyThaiFont();
  try {
    [state.decks, sampleFiles] = await Promise.all([loadDecks(), loadAudioManifest()]);
    sayText = new Map(state.decks.flatMap((d) => d.cards.filter((c) => c.say).map((c) => [c.thai, c.say])));
    buildCardIndex();
  } catch (e) {
    els.thai.textContent = '⚠';
    els.english.textContent = 'Could not load the topics (data/decks.json). Are you serving over http://?';
    console.error(e);
    return;
  }

  bindEvents();

  migrateSettings();
  migrateLeitnerToItems();

  const prefs = getPreferences();
  // 2026-10-06: Wordlists' "Show first" moved from the page (prefs.primaryCol) to Settings.
  if (prefs.primaryCol === 'english' && !('wordlistFirst' in (loadStore().settings || {}))) {
    setSettings({ wordlistFirst: 'english' });
  }
  // Migrate legacy values: 'list' → 'practice', 'shuffle' → 'practice', 'learn' → 'test'.
  const legacy = { list: 'practice', shuffle: 'practice', learn: 'test' };
  const incoming = legacy[prefs.orderMode] || prefs.orderMode;
  if (['practice', 'test', 'review'].includes(incoming)) {
    state.orderMode = incoming;
  }
  els.orderButtons.forEach((b) => {
    b.setAttribute('aria-checked', b.dataset.order === state.orderMode ? 'true' : 'false');
  });
  els.stage.dataset.order = state.orderMode;
  if (['en-th', 'th-en', 'listen'].includes(prefs.direction)) {
    state.direction = prefs.direction;
  }
  els.directionButtons.forEach((b) => {
    b.setAttribute('aria-checked', b.dataset.direction === state.direction ? 'true' : 'false');
  });

  // The app opens on the home page. View first, so selectDeck's renderCard() knows the card isn't on screen.
  setView('home');

  // A topic that was split or regrouped lists its old ids in `formerIds` (decks.json), so a saved
  // current topic still resolves.
  const start =
    (!isPassage(prefs.currentDeckId) && resolveScope(prefs.currentDeckId)?.id) ||
    state.decks.find((d) => d.formerIds?.includes(prefs.currentDeckId))?.id ||
    state.decks[0]?.id;
  if (start) {
    selectDeck(start);
  }
  renderToday(); // again, now the current deck is known
  performance.mark('app-ready');

  registerServiceWorker();
  // A message carried over a reload (loading a backup reloads the app).
  try {
    const msg = sessionStorage.getItem('learnthai:toast');
    if (msg) {
      sessionStorage.removeItem('learnthai:toast');
      toast(msg, { tone: 'good' });
    }
  } catch { /* storage blocked */ }
  // Audio housekeeping waits until the app has opened (the topic's preload waits for `launched`).
  setTimeout(syncOfflineAudio, 3000);
}

init();
