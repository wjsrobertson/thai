import { letterSpelling, schoolSpelling, spellingText, isSpellable } from './spell.js';

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
  srsToggle: document.getElementById('srs-toggle'),
  reviewOnlyEmpty: document.getElementById('review-only-empty'),
  todayTopicEmpty: document.getElementById('today-topic-empty'),
  todayTopicEmptyTitle: document.getElementById('today-topic-empty-title'),
  reviewOnlyEmptyTitle: document.querySelector('#review-only-empty .review-only-empty-title'),
  card: document.getElementById('card'),
  thai: document.getElementById('card-thai'),
  translit: document.getElementById('card-translit'),
  english: document.getElementById('card-english'),
  note: document.getElementById('card-note'),
  cardSpelling: document.getElementById('card-spelling'),
  cardSpell: document.getElementById('card-spell'),
  cardSpellFront: document.getElementById('card-spell-front'), // Thai → English only: the front is Thai
  speakButtons: document.querySelectorAll('.speak-btn'),
  flipButtons: document.querySelectorAll('.flip-btn'),
  posBadges: document.querySelectorAll('.stat-pos'),
  learnPills: document.getElementById('learn-pills'),
  roundSummary: document.getElementById('round-summary'),
  roundScore: document.getElementById('round-score'),
  roundSub: document.getElementById('round-sub'),
  roundMissedTitle: document.getElementById('round-missed-title'),
  roundMissed: document.getElementById('round-missed'),
  roundAgain: document.getElementById('round-again'),
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
  setMaxReviews: document.getElementById('setting-max-reviews'),
  setWaitAgain: document.getElementById('setting-wait-again'),
  setWaitHard: document.getElementById('setting-wait-hard'),
  setWaitEasy: document.getElementById('setting-wait-easy'),
  setRetention: document.getElementById('setting-retention'),
  setBothDirections: document.getElementById('setting-both-directions'),
  setSayAloud: document.getElementById('setting-say-aloud'),
  reviewBy: document.getElementById('review-by'),
  reviewByButtons: document.querySelectorAll('[data-review-by]'),
  reviewByHelp: document.getElementById('review-by-help'),
  deckPickerSearchRow: document.querySelector('#deck-picker .modal-search'),
  todayDueFrom: document.getElementById('today-due-from'),
  todayNewFrom: document.getElementById('today-new-from'),
  todayCounts: document.getElementById('today-counts'),
  todayEmpty: document.getElementById('today-empty'),
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
  homeDeckStat: document.getElementById('home-deck-stat'),
  homeWordlistStat: document.getElementById('home-wordlist-stat'),
  homeReviewStat: document.getElementById('home-review-stat'),
  todayHome: document.getElementById('today-home'),
  todayDue: document.getElementById('today-due'),
  todayNew: document.getElementById('today-new'),
  todayStart: document.getElementById('today-start'),
  review: document.getElementById('review'),
  reviewTop: document.getElementById('review-top'),
  reviewLeft: document.getElementById('review-left'),
  reviewDeck: document.getElementById('review-deck'),
  reviewQuit: document.getElementById('review-quit'),
  reviewBadge: document.getElementById('review-badge'),
  reviewPrompt: document.getElementById('review-prompt'),
  reviewSpeak: document.getElementById('review-speak'),
  reviewScript: document.getElementById('review-script'),
  setReviewScript: document.getElementById('setting-review-script'),
  reviewHint: document.getElementById('review-hint'),
  reviewAnswer: document.getElementById('review-answer'),
  reviewMain: document.getElementById('review-main'),
  reviewTranslit: document.getElementById('review-translit'),
  reviewNote: document.getElementById('review-note'),
  reviewShow: document.getElementById('review-show'),
  reviewGrades: document.getElementById('review-grades'),
  reviewSummary: document.getElementById('review-summary'),
  reviewScore: document.getElementById('review-score'),
  reviewSub: document.getElementById('review-sub'),
  reviewMissedTitle: document.getElementById('review-missed-title'),
  reviewMissed: document.getElementById('review-missed'),
  reviewDone: document.getElementById('review-done'),
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
  setLearnAuto: document.getElementById('setting-learn-auto'),
  setTestOrder: document.getElementById('setting-test-order'),
  learnPauseRow: document.getElementById('learn-pause-row'),
  settingsSearch: document.getElementById('settings-search'),
  settingsEmpty: document.getElementById('settings-empty'),
};

const STORAGE_KEY = 'learnthai:v1';

// Deck Test mode's study-ahead weighting, by a box derived from FSRS stability (boxForStability).
// Lower box → weaker card → tends to come earlier.
const BOX_WEIGHTS = [0, 8, 4, 2, 1, 0.5]; // index = box number

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const DEFAULT_SETTINGS = {
  maxReviews: 200,                // due reviews per study day
  waitAgainMin: 10,               // Again: back after this many minutes (scheduleItem)
  waitHardDays: 1,                // Hard: a new word's first wait; later waits grow from it
  waitEasyDays: 3,                // Easy (FSRS Good): a new word's first wait; later waits grow from it
  retention: 0.9,                 // FSRS desired retention
  bothDirections: true,           // also schedule English → Thai items (unlocked per word; see gradeItem)
  sayAloud: true,                 // recall prompt says "Say it aloud…"
  reviewScript: true,             // Review: show the Thai on Thai → English cards before Show (off: audio only)
  confirmAddAll: true,            // Topics page "Add all to Review" asks first (Settings → Topics)
  confirmRemoveAll: true,         // Wordlist "✓ All in Review" (remove all) asks first
  audioSource: 'samples',         // 'samples' (data/audio MP3s, TTS fallback) | 'browser' (always TTS); Thai and English
  thaiSpeed: 1,                   // playback speed multiplier for Thai audio (samples and TTS), 0.5–1
  theme: 'dark',                  // Settings → Display → Theme: dark | light | night
  thaiFont: 'looped',             // Settings → Display → Thai font: 'looped' (Noto Looped Thai) | 'loopless' (Noto Sans Thai)
  spellingStyle: 'letters',       // card-back spelling and the spell-aloud buttons: 'letters' (names) | 'school' (sounds)
  textSize: 0,                    // -2..2 steps around the default text size (see TEXT_SCALES)
  offlineAudio: false,            // user chose "Download all audio": keep every clip cached
  readRepeats: 1,                 // times to repeat each word during read-aloud
  readPauseSec: 1.5,              // seconds of silence between words
  readSpeakEnglish: true,         // whether to speak English after Thai
  learnPauseMs: 1500,             // pause after answering before auto-advancing (Test mode)
  testOrder: 'random',            // Test-mode card order: 'random' | 'deck' (the deck's own order)
  wordlistFirst: 'thai',          // the Topics page's first column: 'thai' | 'english' (Settings → Topics)
  learnAutoProgress: 'correct',   // 'off' (wait for Next) | 'always' | 'correct' (only on a right answer); older saves hold true/false
};

const state = {
  decks: [],
  currentDeckId: null,       // what Wordlists and Flashcards show: a scope id (resolveScope)
  pickerFor: 'study',        // the topic picker was opened from 'study' (Wordlists/Flashcards) or 'review'
  cards: [],          // current deck's cards (with progress merged)
  queue: [],          // ordered indices into `cards`
  pos: 0,             // index into queue
  showingBack: false,
  view: 'home',       // 'home' | 'flashcards' (the Flashcards tab) | 'wordlist' (the Topics tab, once Wordlists) | 'today' (the Review tab)
  sort: { key: null, dir: 'asc' },
  orderMode: 'practice', // 'practice' | 'test' — card sequencing in flashcards
  direction: 'th-en', // 'th-en' (Thai on front, English on back) | 'en-th' (English on front, Thai on back)
  pickerOpen: false,
  pickerFilter: '',
  settingsOpen: false,
  expandedCategories: new Set(), // open picker categories; reset to the current deck's on each open (openDeckPicker)
  expandedGroups: new Set(),     // same for deck groups, keyed `${category}::${group}`
  lastFocus: null,
  reading: { active: false, token: 0, currentKey: null },
  pendingLearnRating: null, // 'good' | 'again' | null — set when user answered but hasn't committed
  roundOver: false,         // the end-of-round score is showing (Test mode)
  learnAnswers: new Map(),  // cardKey -> { pickedText, isCorrect, seedSeen } for this session
  cardIndex: new Map(),     // cardKey -> { card, deckIds } across all decks (see buildCardIndex)
  review: null,             // Today's review session while it runs (see startReview)
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
  return store.prefs || { currentDeckId: null, srsOn: true };
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
  // 2026-10-05: Test card auto-progress default 'off' -> 'correct' (older saves hold false).
  ['auto-progress-correct', (s) => ([false, 'off'].includes(s.learnAutoProgress) ? { learnAutoProgress: 'correct' } : null)],
  // 2026-10-05: Test-mode pause default 1000 -> 1500 ms. Runs after pause-1000, so 3000 ends at 1500.
  ['pause-1500', (s) => (s.learnPauseMs === 1000 ? { learnPauseMs: 1500 } : null)],
  // 2026-10-06: Review became manual by default (words you add); both automatic sources move to it.
  ['review-manual', (s) => (['started', 'current'].includes(s.newSource) ? { newSource: 'manual' } : null)],
  // 2026-10-06: the default spelling style became letter names (it was the school method).
  ['spelling-letters', (s) => (s.spellingStyle === 'school' ? { spellingStyle: 'letters' } : null)],
  // 2026-10-07: "Due reviews from: Current topic only" became Review → "By topic" (prefs.reviewBy),
  // which follows Wordlists and Flashcards' topic, group or category, and narrows new words too.
  ['review-by-topic', (s, store) => {
    if (s.reviewScope === 'current') store.prefs = { ...(store.prefs || {}), reviewBy: 'topic' };
    return null;
  }],
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

// Today's counters in store.daily (g gradings, ok correct, n new items, nd new per deck,
// rv due reviews done). Keeps the last 60 days.
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

function todayLog() {
  return loadStore().daily?.[dayKey()] || {};
}

// Deck Test mode orders study-ahead cards by box (boxWeightedQueue); derive one from stability.
function boxForStability(s) {
  if (s == null || s < 2) return 1;
  if (s < 5) return 2;
  if (s < 12) return 3;
  return s < 30 ? 4 : 5;
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
    return { ...c, key, seen: it?.reps || 0, dueAt: it ? it.due : 0, box: boxForStability(it?.s) };
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

function isDue(card, now) {
  // dueAt 0 means brand new — always eligible.
  return card.dueAt === 0 || card.dueAt <= now;
}

function buildQueue(cards, srsOn) {
  // Practice = plain list order, no SRS.
  if (state.orderMode === 'practice') {
    return cards.map((_, i) => i);
  }
  // Test mode. Settings → "Test card order" picks random or deck order (as Learn mode and the
  // wordlist show them). With Smart order on, it orders cards within each tier: due first, then
  // study-ahead. Random order puts new words (never answered in this direction, e.g. just added to
  // Review) first, still shuffled among themselves (the user's request, 2026-10-07).
  const settings = getSettings();
  const deckOrder = settings.testOrder === 'deck';
  const newFirst = (queue) => {
    const isNew = (i) => cards[i].dueAt === 0;
    return [...queue.filter(isNew), ...queue.filter((i) => !isNew(i))];
  };
  if (!srsOn) {
    const all = cards.map((_, i) => i);
    return deckOrder ? all : newFirst(shuffled(all));
  }
  const now = Date.now();

  const dueIndices = [];
  const notDueIndices = [];
  cards.forEach((c, i) => {
    if (isDue(c, now)) dueIndices.push(i);
    else notDueIndices.push(i);
  });

  // Each round covers every due card, so they're ordered for variety, not urgency. (Until
  // 2026-10-05 they were sorted most-overdue first, which put a new deck, all due "now", in deck
  // order.) Not-due cards: deck order, or box-weighted random so weaker cards tend to come first.
  const due = deckOrder ? dueIndices : shuffled(dueIndices);
  const ahead = deckOrder ? notDueIndices : boxWeightedQueue(notDueIndices, cards);

  // After due cards, the rest, so you can keep studying ahead of schedule.
  return deckOrder ? [...due, ...ahead] : newFirst([...due, ...ahead]);
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

// The Flashcards queue: indices into state.cards, which stays the whole topic (Wordlists and
// Test-mode answer choices use it too).
function buildFlashcardQueue() {
  const queue = buildQueue(state.cards, els.srsToggle.checked);
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
  const empty = !!state.currentDeckId && state.queue.length === 0;
  els.reviewOnlyEmpty.hidden = !empty;
  els.stage.classList.toggle('review-only-none', empty);
  if (empty) {
    const scope = currentScope();
    const one = !scope || scope.kind === 'topic';
    els.reviewOnlyEmptyTitle.textContent = one ? "None of this topic's words are in Review yet" : `None of the words in ${scope.name} are in Review yet`;
  }
}

// After words go into or out of Review, or a setting changes. Away from Flashcards there's nothing
// to do: coming back rebuilds the queue if the set changed (setView). On Flashcards (since the
// card's Review button went, that's Settings opened over it) the queue is rebuilt at once, around
// the card on screen if it's still in.
function syncReviewOnly() {
  if (!state.currentDeckId || state.view !== 'flashcards' || reviewOnlySignature() === state.reviewOnlySig) {
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

function boxWeightedQueue(indices, cards) {
  // Each card once, in a weighted random order: weaker (lower-box) cards tend to come first.
  // Sorting by u^(1/w) is a weighted shuffle (Efraimidis–Spirakis), so the queue stays the deck's
  // size and the "n / total" counter is meaningful.
  return indices
    .map((i) => [i, Math.random() ** (1 / Math.max(BOX_WEIGHTS[cards[i].box] ?? 1, 0.1))])
    .sort((a, b) => b[1] - a[1])
    .map(([i]) => i);
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
function fitCardText() {
  const el = els.thai;
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
  hideRoundSummary(); // the next round was set up when the summary opened
  renderReviewOnly();
  // Showing the back? Jump to the front before the new card's text goes in. Flipping back with
  // the animation would show the new card's answer for the first half of the turn.
  if (state.showingBack) setFlipped(false, { instant: true });
  const c = currentCard();
  if (!c) {
    els.learnPills.hidden = true;
    els.thai.textContent = '✓';
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
    els.cardSpelling.hidden = true;
    els.cardSpell.hidden = true;
    els.cardSpellFront.hidden = true;
    setFlipped(false);
    updateStats();
    return;
  }
  // The .thai element acts as the front face; .english/.translit/.note are the back.
  // Direction decides which language sits where.
  if (state.direction === 'th-en') {
    els.thai.textContent = c.thai;
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
  textWithArrows(els.note, c.note || '');
  renderSpelling();
  setFlipped(false);
  updateStats();
  renderLearnPills();
  // Auto-play Thai audio on navigation, only while the card is on screen (picking a deck or
  // changing a setting from the wordlist re-renders the hidden card too), and only if the Thai is
  // showing: English → Thai keeps quiet until the card is flipped (flipCard, handleLearnPick), or the
  // sound would give the answer away. An answered Test card opens on its Thai back.
  fitCardText();
  if (state.view === 'flashcards' && !state.reading.active) {
    if (state.direction === 'th-en' || state.showingBack) speak(c.thai);
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

function updateStats() {
  const posText = state.queue.length
    ? `${state.pos + 1} / ${state.queue.length}`
    : '—';
  els.posBadges.forEach((p) => { p.textContent = posText; });
  els.prevBtn.disabled = state.pos <= 0;

  const atEnd = state.pos >= state.queue.length - 1;
  let nextDisabled = atEnd && !state.pendingLearnRating;
  // In Learn mode, block Next until the current card has been answered.
  if (state.orderMode === 'test' && !state.pendingLearnRating) {
    const c = currentCard();
    if (c && !state.learnAnswers.has(c.key)) nextDisabled = true;
  }
  els.nextBtn.disabled = nextDisabled;
  els.nextBtn.classList.toggle('pulse', !!state.pendingLearnRating);
}

// `instant` skips the flip animation (.no-anim).
function setFlipped(flipped, { instant = false } = {}) {
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
  // English → Thai: the Thai is said when it's revealed (navigating there stays quiet).
  if (state.showingBack && state.direction === 'en-th') speak(c.thai);
}

// Deck Test mode answers ('good' or 'again') update the same items as Today's review.
function saveDeckRating(c, rating) {
  const store = loadStore();
  const deckId = currentScope()?.deckOf.get(c.key)?.id || state.currentDeckId; // the card's own topic
  const it = gradeItem(c.key, state.direction, rating === 'again' ? 1 : 3, { mode: 'mc', deckId });
  c.dueAt = it.due;
  c.seen = it.reps;
  c.box = boxForStability(it.s);
}

function rateCard(rating) {
  const c = currentCard();
  if (!c) return;
  saveDeckRating(c, rating);
  advance();
  if (state.pickerOpen) renderDeckPicker();
}

function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n));
}

function advance() {
  state.pos += 1;
  if (state.pos >= state.queue.length) {
    if (state.orderMode === 'test' && state.learnAnswers.size) {
      showRoundSummary();
      return;
    }
    // Rebuild queue at end of pass so newly-due cards come up sooner.
    state.queue = buildFlashcardQueue();
    state.pos = 0;
  }
  renderCard();
}

// ---------- end of a Test round ----------

// At the end of a Test-mode pass: show the score and the missed cards. The next round is set up
// underneath straight away (answers cleared, queue rebuilt), so whatever re-renders the card next
// (Start again, or changing deck, direction or mode) starts it fresh.
function showRoundSummary() {
  const answers = [...state.learnAnswers.entries()];
  const total = answers.length;
  const correct = answers.filter(([, a]) => a.isCorrect).length;
  const missed = answers.filter(([, a]) => !a.isCorrect)
    .map(([key]) => state.cards.find((c) => c.key === key))
    .filter(Boolean);

  state.learnAnswers = new Map();
  state.pendingLearnRating = null;
  // Rebuild at the end of a pass so newly-due cards come up sooner.
  state.queue = buildFlashcardQueue();
  state.pos = 0;

  const pct = Math.round((correct / total) * 100);
  els.roundScore.textContent = `${correct} / ${total}`;
  els.roundSub.textContent = `${pct}% correct · ` + (
    pct === 100 ? 'Perfect round!' : pct >= 80 ? 'Great work.' : pct >= 50 ? 'Getting there.' : 'Keep at it.');
  fillMissedList(els.roundMissed, els.roundMissedTitle, missed);

  stopAudio();
  state.roundOver = true;
  els.stage.classList.add('round-over');
  els.roundSummary.hidden = false;
  els.roundAgain.focus({ preventScroll: true });
  window.scrollTo({ top: 0 });
}

// The "Missed (n)" list on an end-of-round screen: each card with its translit, meaning and 🔊.
function fillMissedList(list, title, cards) {
  title.textContent = cards.length ? `Missed (${cards.length})` : '';
  title.hidden = !cards.length;
  list.hidden = !cards.length;
  list.replaceChildren(...cards.map((c) => {
    const li = document.createElement('li');
    for (const [cls, text] of [['rm-thai', c.thai], ['rm-translit', c.translit], ['rm-english', c.english]]) {
      const span = document.createElement('span');
      span.className = cls;
      span.textContent = text;
      li.appendChild(span);
    }
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'rm-speak';
    btn.setAttribute('aria-label', 'Play audio');
    btn.textContent = '🔊';
    btn.addEventListener('click', () => speak(c.thai));
    li.appendChild(btn);
    return li;
  }));
}

function hideRoundSummary() {
  if (!state.roundOver) return;
  state.roundOver = false;
  els.stage.classList.remove('round-over');
  els.roundSummary.hidden = true;
}

function goPrev() {
  if (state.pos <= 0) return;
  // Commit any pending rating before leaving — keeps SRS in sync with the visible locked state.
  if (state.pendingLearnRating) {
    commitPendingRatingWithoutAdvance();
  }
  state.pos -= 1;
  renderCard();
}

function commitPendingRatingWithoutAdvance() {
  // Like rateCard but without advancing: used when leaving a pending card via Prev, so the
  // answer is saved but navigation isn't hijacked.
  const r = state.pendingLearnRating;
  state.pendingLearnRating = null;
  const c = currentCard();
  if (!c || !r) return;
  saveDeckRating(c, r);
}

function goNext() {
  // In Learn mode without auto-progress, Next first commits the answer's rating
  // (which calls advance() through the rating pipeline).
  if (state.pendingLearnRating) {
    const r = state.pendingLearnRating;
    state.pendingLearnRating = null;
    rateCard(r);
    return;
  }
  // In Learn mode, require an answer on the current card before advancing.
  if (state.orderMode === 'test') {
    const c = currentCard();
    if (c && !state.learnAnswers.has(c.key)) return;
  }
  if (state.pos >= state.queue.length - 1) return;
  state.pos += 1;
  renderCard();
}

// ---------- scopes: a topic, a group of topics, or a whole category ----------
// Wordlists and Flashcards show a scope (state.currentDeckId, prefs.currentDeckId); Review covers
// its own or the same one (reviewScope()). A scope id is a topic's id, `group:<category>::<group>`,
// `cat:<category>`, or (Review only) 'all'. resolveScope() gives { id, kind, name, label,
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

// What Review covers: Everything, or "By topic" (prefs.reviewBy), the topic, group or category
// Wordlists and Flashcards show. Both are set in Review's topic dialog.
const reviewByTopic = () => getPreferences().reviewBy === 'topic';
function reviewScope() {
  return (reviewByTopic() && currentScope()) || resolveScope('all');
}

function setReviewBy(by) {
  if (getPreferences().reviewBy === by || (by === 'all' && !reviewByTopic())) return;
  leaveReviewSession();
  setPreferences({ reviewBy: by });
  renderDeckButton();
  renderToday();
}

// Changing what Review covers mid-session ends the session (answers are saved as you go), so the
// start screen's counts match the new choice. The topic button stays on screen throughout.
function leaveReviewSession() {
  if (!state.review) return;
  stopAudio();
  state.review = null;
}

// The topic button: on Review, what Review covers; elsewhere, what Wordlists and Flashcards show.
function renderDeckButton() {
  const scope = state.view === 'today' ? reviewScope() : currentScope();
  els.deckButtonLabel.textContent = scope?.label || 'Choose a topic';
  els.deckButtonIcon.textContent = !scope || scope.kind === 'topic' ? '📖' : '📚';
}

function selectDeck(deckId) {
  const deck = resolveScope(deckId);
  if (!deck || deck.kind === 'all') return;
  if (state.reading.active) stopReadAloud();
  state.pendingLearnRating = null;
  state.learnAnswers = new Map();
  state.currentDeckId = deckId;
  state.cards = mergeProgressIntoCards(deck.cards);
  state.queue = buildFlashcardQueue();
  state.pos = 0;
  setPreferences({ currentDeckId: deckId });
  renderDeckButton();
  renderReviewOnly();
  preloadDeckAudio(deck);
  renderCard();
  renderWordlist();
  if (state.view === 'today') renderToday();
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
    const cat = d.category || 'Uncategorized';
    if (q && ![d.name, d.description || '', cat, d.group || ''].some((s) => s.toLowerCase().includes(q))) continue;
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

// The picker always picks Wordlists and Flashcards' scope. Opened from Review ('review'), it also
// has Everything / By topic at the top (renderReviewBy), and picking a topic means By topic.
function pickerSelectedId() {
  return state.currentDeckId;
}

function pickScope(id) {
  if (state.pickerFor === 'review') {
    if (reviewByTopic() && id === state.currentDeckId) { // the same choice again: carry on
      closeDeckPicker();
      return;
    }
    leaveReviewSession();
    setPreferences({ reviewBy: 'topic' });
  }
  selectDeck(id); // redraws Review too
  renderDeckButton();
  closeDeckPicker();
}

// Review's dialog: Everything hides the topic list (there's nothing to pick); By topic shows it.
function renderReviewBy() {
  const review = state.pickerFor === 'review';
  const topic = reviewByTopic();
  els.reviewBy.hidden = !review;
  els.reviewByButtons.forEach((b) => b.setAttribute('aria-checked', String((b.dataset.reviewBy === 'topic') === topic)));
  els.reviewByHelp.textContent = topic ? 'Shared with the Topics page and Flashcards' : 'Review words from every topic';
  const list = !review || topic;
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

  if (cats.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'modal-empty';
    empty.textContent = `No topics match "${state.pickerFilter}".`;
    els.deckPickerTree.appendChild(empty);
  }
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
  state.pickerFor = state.view === 'today' ? 'review' : 'study';
  els.deckPickerTitle.textContent = state.pickerFor === 'review' ? 'What to review' : 'Choose a topic';
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
  if (view !== 'wordlist' && state.reading.active) stopReadAloud();
  if (view !== 'today' && leaving === 'today') stopAudio();
  if (view === 'today') renderToday();
  if (view === 'home') renderHome();
  // Back to Decks after reviewing: refresh the cards' progress (the queue order stays).
  if (view === 'flashcards' && leaving === 'today') {
    const deck = currentScope();
    if (deck) state.cards = mergeProgressIntoCards(deck.cards);
  }
  renderDeckButton(); // Review's button shows what Review covers
  if (view === 'flashcards') fitCardText(); // laid out only now if the card was hidden
  // Words added to or taken out of Review elsewhere (Wordlists, Review) apply on coming back.
  if (view === 'flashcards' && leaving !== 'flashcards' && state.currentDeckId && reviewOnlySignature() !== state.reviewOnlySig) {
    rebuildCurrentQueue();
    renderReviewOnly();
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
  els.setMaxReviews.value = s.maxReviews;
  els.setWaitAgain.value = s.waitAgainMin;
  els.setWaitHard.value = s.waitHardDays;
  els.setWaitEasy.value = s.waitEasyDays;
  els.setRetention.value = String(s.retention);
  els.setBothDirections.checked = s.bothDirections;
  els.setSayAloud.checked = s.sayAloud;
  els.setReviewScript.checked = s.reviewScript !== false;
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
  els.setLearnPause.value = s.learnPauseMs;
  els.setTestOrder.value = s.testOrder;
  els.setLearnAuto.value = autoProgressMode(s);
  els.learnPauseRow.style.display = autoProgressMode(s) === 'off' ? 'none' : '';

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
  els.setMaxReviews.addEventListener('change', () => {
    const n = parseInt(els.setMaxReviews.value, 10);
    if (n >= 10 && n <= 1000) setSettings({ maxReviews: n });
    renderToday();
  });
  els.setRetention.addEventListener('change', () => {
    const r = parseFloat(els.setRetention.value);
    if (r >= 0.7 && r <= 0.97) setSettings({ retention: r });
  });
  els.setBothDirections.addEventListener('change', () => {
    setSettings({ bothDirections: els.setBothDirections.checked });
    renderToday();
  });
  els.setSayAloud.addEventListener('change', () => {
    setSettings({ sayAloud: els.setSayAloud.checked });
  });
  els.setReviewScript.addEventListener('change', () => {
    setSettings({ reviewScript: els.setReviewScript.checked });
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
  // Opening Settings → App reads the saved clips for the count (renderOffline).
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
    setSettings({ spellingStyle: els.setSpelling.value === 'school' ? 'school' : 'letters' });
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
    const n = parseInt(els.setLearnPause.value, 10);
    if (n >= 0 && n <= 5000) setSettings({ learnPauseMs: n });
  });
  els.setTestOrder.addEventListener('change', () => {
    setSettings({ testOrder: els.setTestOrder.value });
    if (state.orderMode === 'test') rebuildCurrentQueue();
  });
  els.setLearnAuto.addEventListener('change', () => {
    setSettings({ learnAutoProgress: els.setLearnAuto.value });
    renderSettings();
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
  if (!state.currentDeckId) return;
  // A rebuilt queue is a new round: clear Test answers so cards don't come back pre-answered.
  // An answer still waiting for Next is saved to the SRS first.
  if (state.pendingLearnRating) commitPendingRatingWithoutAdvance();
  state.learnAnswers = new Map();
  state.queue = buildFlashcardQueue();
  state.pos = 0;
  renderCard();
}

function setOrderMode(mode) {
  if (!['practice', 'test'].includes(mode)) return;
  state.orderMode = mode;
  els.stage.dataset.order = mode;
  els.orderButtons.forEach((b) => {
    b.setAttribute('aria-checked', b.dataset.order === mode ? 'true' : 'false');
  });
  // Leaving Test: drop any pending answer and the Next pulse.
  if (mode !== 'test') {
    state.pendingLearnRating = null;
  }
  setPreferences({ orderMode: mode });
  rebuildCurrentQueue();
}

function setDirection(direction) {
  if (!['en-th', 'th-en'].includes(direction)) return;
  state.direction = direction;
  els.directionButtons.forEach((b) => {
    b.setAttribute('aria-checked', b.dataset.direction === direction ? 'true' : 'false');
  });
  setPreferences({ direction });
  // Each direction has its own progress, so re-read it; a new round starts.
  const deck = currentScope();
  if (deck) state.cards = mergeProgressIntoCards(deck.cards);
  rebuildCurrentQueue();
}

// ---------- wordlist ----------

function visibleWordlistRows() {
  let rows = state.cards;
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

  textWithArrows(els.wordlistDeckName, `${deck.name} — ${deck.description}`);
  // A topic's optional `about` (decks.json), e.g. the consonant classes' memory scenes: a second
  // paragraph under the heading.
  const about = deck.kind === 'topic' ? deck.decks[0].about || '' : '';
  els.wordlistAbout.hidden = !about;
  // Keep each bracketed pair, e.g. "(ฮ นกฮูก)", on one line: a line can otherwise break at the space,
  // or inside a Thai word (นก|ฮูก).
  els.wordlistAbout.replaceChildren(...about.split(/(\([^()]*\))/).map((part) => (
    part.startsWith('(') ? Object.assign(document.createElement('span'), { className: 'nowrap', textContent: part }) : part)));
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
        // English column gets the note appended below.
        if (key === 'english' && c.note) {
          const span = document.createElement('span');
          span.className = 'col-note';
          td.appendChild(textWithArrows(span, c.note));
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
      rv.title = added ? `Remove ${c.thai} from Review` : `Add ${c.thai} to Review`;
      rv.setAttribute('aria-label', rv.title);
      rv.addEventListener('click', () => {
        setInReview([c.key], !added);
        toast(added ? `Removed ${c.thai} from Review` : `✓ Added ${c.thai} to Review`, { tone: added ? '' : 'good' });
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
      btn.className = 'row-speak';
      btn.setAttribute('aria-label', 'Play audio');
      btn.textContent = '🔊';
      btn.addEventListener('click', () => speak(c.thai));
      audioTd.appendChild(btn);
      tr.appendChild(audioTd);
      frag.appendChild(tr);
    }
    els.wordtableBody.appendChild(frag);
  }

  const allIn = state.cards.every((c) => c.key in words);
  // With the whole deck in Review, the button reads "✓ All in Review" and removes them all.
  els.wordlistAddAll.classList.toggle('all-in', allIn);
  if (allIn) {
    // Both labels share one grid cell, so hovering ("− Remove all") doesn't change the width.
    const label = (cls, text) => Object.assign(document.createElement('span'), { className: cls, textContent: text });
    els.wordlistAddAll.replaceChildren(label('label-idle', '✓ All in Review'), label('label-hover', '− Remove all'));
  } else {
    els.wordlistAddAll.replaceChildren(reviewIcon(), 'Add all to Review');
  }
  els.wordlistAddAll.title = allIn ? 'Remove all from Review' : '';
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
function buildLearnTrial(card, deckCards, seenOverride) {
  const seen = seenOverride != null ? seenOverride : (card.seen || 0);
  const seed = hashStr(`${state.currentDeckId}::${card.key}::${seen}::${state.direction}`);
  const rng = makeRng(seed);

  // Side = which language appears on the answer pills.
  // en-th: question is English (front), pills are Thai answers.
  // th-en: question is Thai (front), pills are English answers.
  const side = state.direction === 'en-th' ? 'th' : 'en';

  // Pick 2 distinct distractors deterministically.
  const others = deckCards.filter((d) => d.key !== card.key);
  const pool = others.slice();
  // Fisher-Yates with seeded rng, take first 2.
  for (let i = pool.length - 1; i > 0 && i > pool.length - 4; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const distractors = pool.slice(-2);

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
  const trial = buildLearnTrial(c, state.cards, prior?.seedSeen);

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

// Test-mode auto-progress. Older saves stored a boolean, where true meant "always".
function autoProgressMode(s) {
  const v = s.learnAutoProgress;
  if (v === true) return 'always';
  return v === 'always' || v === 'correct' ? v : 'off';
}

function shouldAutoAdvance(mode, isCorrect) {
  return mode === 'always' || (mode === 'correct' && isCorrect);
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
    const trial = buildLearnTrial(c, state.cards);
    const correctText = trial.side === 'th' ? c.thai : c.english;
    for (const p of els.learnPills.querySelectorAll('.learn-pill')) {
      if (p.textContent === correctText) {
        p.classList.remove('dimmed');
        p.classList.add('correct');
      }
    }
  }

  // Record the answer so it persists across prev/next navigation.
  state.learnAnswers.set(c.key, {
    pickedText: btn.textContent,
    isCorrect,
    seedSeen: c.seen || 0, // remember the seen-count used to build this trial
  });
  els.card.classList.add('answered');

  // Flip the card to reveal the back face; in English → Thai that's the Thai, so say it now.
  setFlipped(true);
  if (state.direction === 'en-th') speak(c.thai);

  const settings = getSettings();
  if (shouldAutoAdvance(autoProgressMode(settings), isCorrect)) {
    setTimeout(() => rateCard(isCorrect ? 'good' : 'again'), settings.learnPauseMs ?? 1500);
  } else {
    // Stash pending rating; applied when user advances.
    state.pendingLearnRating = isCorrect ? 'good' : 'again';
    updateStats();
  }
}

// ---------- Today: daily review ----------
// One session across all decks: due items first (weakest first), with new cards mixed in. Every
// item is recall and self-grading, new ones too (multiple choice is Flashcards' Test mode). Missed
// items come back a few cards later in the same session (successive relearning).
// See docs/review-design.md.

const REQUEUE_GAP = [5, 8];    // a missed or just-introduced item comes back this many cards later

// The decks Review is narrowed to, or null for Everything.
function reviewScopeDeckIds() {
  const scope = reviewScope();
  return scope.kind === 'all' ? null : new Set(scope.decks.map((d) => d.id));
}

// Today's plan: due and new entries, and the session queue mixing them. An entry is
// { key, dir, deckId, kind: 'due' | 'new' }.
function planReview(now = Date.now()) {
  const s = getSettings();
  const items = loadStore().items || {};
  const log = todayLog();
  const end = endOfStudyDay(now);

  const f = reviewFilter();
  const scopeIds = reviewScopeDeckIds();
  const due = [];
  for (const [itemKey, it] of Object.entries(items)) {
    if (it.due > end) continue;
    const [key, dir] = splitItemKey(itemKey);
    if (!f.has(key)) continue;
    const deckId = reviewDeckId(key, dir, s, scopeIds);
    if (deckId) due.push({ key, dir, deckId, kind: 'due', r: fsrsR(Math.max(0, (now - it.last) / DAY), it.s) });
  }
  due.sort((a, b) => a.r - b.r);
  due.splice(Math.max(0, s.maxReviews - (log.rv || 0)));

  // Words you add all show up straight away: no daily allowance.
  const news = [];
  // English → Thai for words whose meaning is known, oldest unlock first.
  if (s.bothDirections) {
    const unlocked = Object.entries(items)
      .filter(([k, it]) => it.u && k.endsWith('##th-en'))
      .map(([k, it]) => ({ key: splitItemKey(k)[0], last: it.last }))
      .filter((u) => !items[itemKeyOf(u.key, 'en-th')] && state.cardIndex.has(u.key) && f.has(u.key))
      .map((u) => ({ ...u, deckId: reviewDeckId(u.key, 'en-th', s, scopeIds) }))
      .filter((u) => u.deckId)
      .sort((a, b) => a.last - b.last);
    for (const u of unlocked) news.push({ key: u.key, dir: 'en-th', deckId: u.deckId, kind: 'new' });
  }
  // Words you've added that haven't started yet, in the order you added them.
  for (const key of Object.keys(f.words).sort((a, b) => f.words[a] - f.words[b])) {
    if (items[itemKeyOf(key, 'th-en')]) continue;
    const deckId = reviewDeckId(key, 'th-en', s, scopeIds);
    if (deckId) news.push({ key, dir: 'th-en', deckId, kind: 'new' });
  }

  // Spread the new cards evenly through the reviews.
  const queue = [];
  const every = news.length ? Math.max(1, Math.floor(due.length / news.length)) : 0;
  let ni = 0;
  due.forEach((e, i) => {
    queue.push(e);
    if (every && (i + 1) % every === 0 && ni < news.length) queue.push(news[ni++]);
  });
  queue.push(...news.slice(ni));
  return { due, news, queue };
}

// The deck an item is reviewed under, or null if Review skips it: its card was edited or removed,
// its direction is off, or none of its decks is in what Review covers (scopeIds, null for
// Everything). It's the first of the card's decks in scope that hasn't been removed from Review.
function reviewDeckId(key, dir, s, scopeIds = null) {
  const entry = state.cardIndex.get(key);
  if (!entry || (dir === 'en-th' && !s.bothDirections)) return null;
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
  if (state.view === 'home') renderHome();
  if (state.view === 'wordlist') renderWordlist();
  syncReviewOnly();
}

// Sets el's text, drawing each → as the SVG arrow (.arrow-icon), since the → glyph sits low in
// some fonts. `caps` centres the arrow on capitals (EN→TH) rather than lowercase letters.
function textWithArrows(el, text, { caps = false } = {}) {
  el.replaceChildren();
  text.split(/\s*→\s*/).forEach((part, i) => {
    if (i) el.append(lineIcon('arrow-icon' + (caps ? ' caps' : ''), '0 0 16 16', 'M2.5 8h10.5M9 4l4 4-4 4', 'to'));
    el.append(part);
  });
  return el;
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


// For the end-of-session screen.
function dueTomorrow(now = Date.now()) {
  const s = getSettings();
  const end = endOfStudyDay(now);
  let n = 0;
  const f = reviewFilter();
  const scopeIds = reviewScopeDeckIds();
  for (const [itemKey, it] of Object.entries(loadStore().items || {})) {
    if (it.due <= end || it.due > end + DAY) continue;
    const [key, dir] = splitItemKey(itemKey);
    if (f.has(key) && reviewDeckId(key, dir, s, scopeIds)) n += 1;
  }
  return n;
}

function renderToday() {
  if (!state.cardIndex.size) return; // decks not loaded yet
  const r = state.review;
  // By topic with none of its words added: the same message as Flashcards', instead of 0 / 0.
  const scope = reviewScope();
  const words = reviewWords();
  const topicEmpty = !r && scope.kind !== 'all' && ![...scope.deckOf.keys()].some((key) => key in words);
  els.todayTopicEmpty.hidden = !topicEmpty;
  els.stage.classList.toggle('today-topic-none', topicEmpty);
  if (topicEmpty) {
    els.todayTopicEmptyTitle.textContent = scope.kind === 'topic' ? "None of this topic's words are in Review yet" : `None of the words in ${scope.name} are in Review yet`;
  }
  els.todayHome.hidden = !!r;
  els.review.hidden = !r || r.finished;
  els.reviewTop.hidden = !r || r.finished;
  els.stage.classList.toggle('review-session', !!r && !r.finished); // the bar's three-column layout
  els.reviewSummary.hidden = !r?.finished;
  if (r) return;
  const plan = planReview();
  const where = scope.kind === 'all' ? '' : ` in ${scope.name}`;
  els.todayDue.textContent = plan.due.length;
  els.todayDueFrom.textContent = scope.kind === 'all' ? 'across all topics' : `in ${scope.name}`;
  els.todayNew.textContent = plan.news.length;
  els.todayNewFrom.textContent = `you've added${where}`;
  // Nothing added yet: say how to add words instead of 0 / 0.
  const empty = Object.keys(words).length === 0;
  els.todayEmpty.hidden = !empty;
  els.todayCounts.hidden = empty;
  els.todayStart.hidden = empty || plan.queue.length === 0;
}

// The landing page: a card per view. Decks and Wordlist show the current deck, Review today's counts.
function renderHome() {
  if (!state.cardIndex.size) return; // decks not loaded yet
  const plan = planReview();
  const deck = currentScope();
  els.homeDeckStat.textContent = els.homeWordlistStat.textContent = !deck ? '' : deck.kind === 'topic' ? `Topic: ${deck.name}` : deck.label;
  const empty = Object.keys(reviewWords()).length === 0;
  const scope = reviewScope();
  els.homeReviewStat.textContent = empty ? 'Nothing added yet'
    : `${plan.due.length} due · ${plan.news.length} new${scope.kind === 'all' ? '' : ` · ${scope.name}`}`;
}

function startReview() {
  const plan = planReview();
  if (!plan.queue.length) return;
  state.review = {
    queue: plan.queue, pos: 0, mode: null, revealed: false, answered: false, finished: false,
    graded: 0, ok: 0, seen: new Set(), newItems: new Set(), missed: new Map(),
  };
  preloadDeckAudio({ cards: plan.queue.map((e) => state.cardIndex.get(e.key).card) });
  renderToday();
  presentEntry();
}

function endReview() {
  stopAudio();
  state.review = null;
  renderToday();
}

function presentEntry() {
  const r = state.review;
  const e = r.queue[r.pos];
  if (!e) {
    finishReview();
    return;
  }
  const { card } = state.cardIndex.get(e.key);
  const it = getItem(itemKeyOf(e.key, e.dir));
  const thaiFirst = e.dir === 'th-en';
  r.revealed = false;
  r.answered = false;

  els.reviewPrompt.textContent = thaiFirst ? card.thai : card.english;
  els.reviewPrompt.className = 'review-prompt thai' + (thaiFirst ? '' : ' front-en');
  // Settings → Review → Show Thai script off: Thai → English starts audio only, with an eye
  // button to show the script early. Show (revealAnswer) shows it too.
  const audioOnly = thaiFirst && !getSettings().reviewScript;
  els.reviewPrompt.hidden = audioOnly;
  els.reviewScript.hidden = !audioOnly;
  els.reviewMain.textContent = thaiFirst ? card.english : card.thai;
  els.reviewMain.className = 'review-main english' + (thaiFirst ? '' : ' back-th');
  els.reviewTranslit.textContent = card.translit;
  textWithArrows(els.reviewNote, card.note || '');
  els.reviewAnswer.hidden = true;
  const badge = [e.again && 'Again', !it && 'New', !thaiFirst && 'English → Thai'].filter(Boolean).join(' · ');
  textWithArrows(els.reviewBadge, badge);
  els.reviewBadge.hidden = !badge;
  els.reviewDeck.textContent = state.decks.find((d) => d.id === e.deckId)?.name || '';
  els.reviewLeft.textContent = `${r.queue.length - r.pos} left`;
  els.reviewGrades.hidden = true;
  // Every item is recall, new ones too (the user's call, 2026-10-07): recognition is Flashcards' job.
  els.reviewHint.textContent = getSettings().sayAloud ? 'Say it aloud, then tap Show' : 'Recall it, then tap Show';
  els.reviewHint.hidden = false;
  els.reviewShow.hidden = false;
  // English → Thai: no audio until the answer is shown, or it would give the answer away.
  els.reviewSpeak.hidden = !thaiFirst;
  if (thaiFirst) speak(card.thai);
}

// The Thai on an audio-only card (Show Thai script off): the eye button, or Show.
function showReviewScript() {
  els.reviewPrompt.hidden = false;
  els.reviewScript.hidden = true;
}

function revealAnswer() {
  const r = state.review;
  if (!r || r.revealed) return;
  const e = r.queue[r.pos];
  r.revealed = true;
  showReviewScript();
  els.reviewHint.hidden = true; // "…then tap Show": done
  els.reviewAnswer.hidden = false;
  els.reviewShow.hidden = true;
  els.reviewSpeak.hidden = false;
  if (e.dir === 'en-th') speak(state.cardIndex.get(e.key).card.thai);
  els.reviewGrades.hidden = false;
}

// Save the grade, keep session stats, and requeue: a miss comes back later in the session until
// it's right.
function recordGrade(g) {
  const r = state.review;
  const e = r.queue[r.pos];
  const itemKey = itemKeyOf(e.key, e.dir);
  gradeItem(e.key, e.dir, g, { mode: 'recall', deckId: e.deckId });
  r.graded += 1;
  if (g > 1) r.ok += 1;
  r.seen.add(itemKey);
  if (e.kind === 'new') r.newItems.add(itemKey);
  if (g === 1) r.missed.set(itemKey, e);
  if (e.kind === 'due' && !e.again && !e.requeued) {
    const store = loadStore();
    const day = dayLog(store);
    day.rv = (day.rv || 0) + 1;
    saveStore(store);
  }
  if (g === 1) {
    const [lo, hi] = REQUEUE_GAP;
    const at = Math.min(r.queue.length, r.pos + 1 + lo + Math.floor(Math.random() * (hi - lo + 1)));
    r.queue.splice(at, 0, { ...e, again: g === 1, requeued: true });
  }
}

function gradeCurrent(g) {
  const r = state.review;
  if (!r || !r.revealed || r.answered) return;
  r.answered = true;
  recordGrade(g);
  nextEntry();
}

function nextEntry() {
  state.review.pos += 1;
  presentEntry();
}

function finishReview() {
  const r = state.review;
  r.finished = true;
  stopAudio();
  const reviewed = r.seen.size;
  const pct = r.graded ? Math.round((r.ok / r.graded) * 100) : 0;
  els.reviewScore.textContent = String(reviewed);
  els.reviewSub.textContent = `${reviewed === 1 ? 'card' : 'cards'} reviewed · ${pct}% right · ` +
    `${r.newItems.size} new · ${dueTomorrow()} due tomorrow`;
  fillMissedList(els.reviewMissed, els.reviewMissedTitle, [...r.missed.values()].map((e) => state.cardIndex.get(e.key).card));
  renderToday();
  els.reviewDone.focus({ preventScroll: true });
  window.scrollTo({ top: 0 });
}

function handleReviewKey(e) {
  const r = state.review;
  const enter = e.key === 'Enter' || e.key === ' ';
  if (!r) {
    if (enter && !els.todayStart.hidden) {
      e.preventDefault();
      startReview();
    }
    return;
  }
  if (r.finished) {
    if (enter) {
      e.preventDefault();
      endReview();
    }
    return;
  }
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
    btn.innerHTML = '🔊 Read all';
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
  if (state.currentDeckId) selectDeck(state.currentDeckId);
  renderToday();
  toast('All progress reset');
}

// Every word out of Review (the "Only words I add" list). Progress is kept, so re-adding carries on.
async function resetReviewList() {
  const n = Object.keys(reviewWords()).length;
  if (!n) {
    toast('Review is already empty');
    return;
  }
  const ok = await confirmDialog({
    title: 'Reset the Review list?',
    message: `This takes all ${n} word${n === 1 ? '' : 's'} you've added out of Review. Their progress is kept, so adding them again carries on.`,
    confirmLabel: 'Reset Review list',
    danger: true,
  });
  if (!ok) return;
  const store = loadStore();
  store.reviewWords = {};
  saveStore(store);
  renderToday();
  renderWordlist();
  syncReviewOnly();
  if (state.view === 'home') renderHome();
  toast('Review list reset');
}

// Every setting back to its default (getSettings merges DEFAULT_SETTINGS over what's saved).
// Progress and the Review list aren't settings, and nor is "Download all audio" being on: the
// audio stays downloaded and kept up to date.
async function resetSettings() {
  const ok = await confirmDialog({
    title: 'Reset all settings?',
    message: 'Every setting goes back to its default. Your progress and Review list are kept.',
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
  if (state.view === 'home') renderHome();
  toast('Settings reset to defaults');
}

// ---------- TTS ----------

let thaiVoice = null;
let englishVoice = null;
let sampleFiles = { th: {}, en: {}, sp: {} };  // lang -> text -> MP3 in data/audio/ (see loadAudioManifest)
let sayText = new Map();  // card thai -> what to say instead, from the optional `say` field (e.g. ก -> กอ ไก่)
const sampleAudio = new Audio();
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

// A card's spelling in the chosen style; the school method falls back to letter names where it
// can't be worked out. null for a lone letter or symbol.
function spellingFor(card) {
  if (!card || !isSpellable(card.thai)) return null;
  const school = getSettings().spellingStyle === 'school' && schoolSpelling(card.thai, card.translit);
  return school || letterSpelling(card.thai);
}

// The spelling line on the current card's back.
function renderSpelling() {
  const groups = spellingFor(currentCard());
  els.cardSpelling.textContent = groups ? spellingText(groups) : '';
  els.cardSpelling.hidden = !groups;
  els.cardSpell.hidden = !groups;
  // On the front only when it shows the Thai: in English → Thai it would give the answer away.
  els.cardSpellFront.hidden = !groups || state.direction !== 'th-en';
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
async function speakSpelling(card, buttons = []) {
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
        if (step.word) await speakAndWait(card.thai, 'th');
        else if (!part || !(await playSample(part, speedFor('sp')))) await speakAndWait(step.say, 'sp');
        wait = SPELL_STEP_PAUSE;
      }
      wait = SPELL_SYLLABLE_PAUSE; // groups are syllables (school method) or words
    }
  } finally {
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
      resolve(ok);
    };
    finishSample = finish;
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
  const url = sampleUrl(text, lang);
  if (url && await playSample(url, speedFor(lang))) return;
  // No sample for this text, or it failed to load: fall back to browser TTS.
  if (lang === 'sp') return ttsAndWait(text, 'th');
  return ttsAndWait(lang === 'th' ? sayText.get(text) ?? text : text, lang);
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
    t.addEventListener('click', () => setView(t.dataset.view));
  });

  document.getElementById('read-aloud').addEventListener('click', toggleReadAloud);

  // Deck picker
  els.deckButton.addEventListener('click', openDeckPicker);
  els.reviewByButtons.forEach((b) => b.addEventListener('click', () => {
    setReviewBy(b.dataset.reviewBy);
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

  els.srsToggle.addEventListener('change', () => {
    setPreferences({ srsOn: els.srsToggle.checked });
    rebuildCurrentQueue();
  });

  els.resetAll.addEventListener('click', resetAllProgress);
  els.resetSettings.addEventListener('click', resetSettings);
  els.resetReview.addEventListener('click', resetReviewList);

  [els.cardSpell, els.cardSpellFront].forEach((btn) => btn.addEventListener('click', (e) => {
    e.stopPropagation(); // not a flip
    speakSpelling(currentCard(), [els.cardSpell, els.cardSpellFront]);
  }));
  els.card.addEventListener('click', (e) => {
    // Don't flip if clicking the speak or flip button (flip-btn calls flipCard itself).
    if (e.target.closest('.speak-btn')) return;
    if (e.target.closest('.spell-btn')) return;
    if (e.target.closest('.flip-btn')) return;
    flipCard();
  });

  els.flipButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      flipCard();
    });
  });

  els.card.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      flipCard();
    }
  });

  els.speakButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const c = currentCard();
      if (c) speak(c.thai);
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

  els.roundAgain.addEventListener('click', () => renderCard());

  els.homeLink.addEventListener('click', () => setView('home'));
  els.homeCards.forEach((card) => card.addEventListener('click', () => setView(card.dataset.go)));

  // Adding to Review by hand
  els.wordlistAddAll.addEventListener('click', async () => {
    const words = reviewWords();
    const deck = currentScope();
    const keys = state.cards.map((c) => c.key).filter((key) => !(key in words));
    if (!keys.length) {
      // All in Review: remove them all (their progress is kept).
      const n = state.cards.length;
      const ok = await confirmDialog({
        title: 'Remove all from Review?',
        message: `Remove all ${n} words in ${deck.name} from Review? Your progress on them is kept.`,
        confirmLabel: `Remove ${n}`,
        setting: 'confirmRemoveAll',
      });
      if (ok) {
        setInReview(state.cards.map((c) => c.key), false);
        toast(`Removed ${n} words from Review`);
      }
      return;
    }
    const n = keys.length;
    const ok = await confirmDialog({
      title: 'Add all to Review?',
      message: n === state.cards.length
        ? `Add all ${n} words in ${deck.name} to Review?`
        : `Add the ${n} words in ${deck.name} that aren't in Review yet?`,
      confirmLabel: `Add ${n}`,
      setting: 'confirmAddAll',
    });
    if (ok) {
      setInReview(keys, true);
      toast(`✓ Added ${n} ${n === 1 ? 'word' : 'words'} to Review`, { tone: 'good' });
    }
  });
  els.confirmOk.addEventListener('click', () => closeConfirm(true));
  els.confirmCancel.addEventListener('click', () => closeConfirm(false));
  els.confirmModal.querySelector('[data-close]').addEventListener('click', () => closeConfirm(false));

  els.todayStart.addEventListener('click', startReview);
  els.reviewShow.addEventListener('click', revealAnswer);
  els.reviewGrades.addEventListener('click', (e) => {
    const btn = e.target.closest('.grade');
    if (btn) gradeCurrent(Number(btn.dataset.grade));
  });
  els.reviewScript.addEventListener('click', showReviewScript);
  els.reviewSpeak.addEventListener('click', () => {
    const entry = state.review?.queue[state.review.pos];
    if (entry) speak(state.cardIndex.get(entry.key).card.thai);
  });
  els.reviewQuit.addEventListener('click', endReview);
  els.reviewDone.addEventListener('click', endReview);

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
    if (state.view === 'home') return;
    if (state.view === 'today') {
      handleReviewKey(e);
      return;
    }
    if (state.roundOver) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') {
        e.preventDefault();
        renderCard();
      }
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
// IndexedDB). Here: the Settings → App section, "Download all audio", and keeping the saved clips
// in step with the manifest.

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
// needed (Settings → App open, a sync after the clip list changed, "Download all audio") and then
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

// Settings → App → Offline audio. Draws at once from what's known, so it's never blank: "X of Y
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
  return `${words} word${words === 1 ? '' : 's'} in Review, progress on ${studied}`;
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
    message: `From ${when}: ${backupSummary(data)}.\nIt replaces the settings, progress and Review list on this device (${backupSummary(loadStore())}).`,
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
  els.srsToggle.checked = prefs.srsOn !== false;
  // 2026-10-06: Wordlists' "Show first" moved from the page (prefs.primaryCol) to Settings.
  if (prefs.primaryCol === 'english' && !('wordlistFirst' in (loadStore().settings || {}))) {
    setSettings({ wordlistFirst: 'english' });
  }
  // Migrate legacy values: 'list' → 'practice', 'shuffle' → 'practice', 'learn' → 'test'.
  const legacy = { list: 'practice', shuffle: 'practice', learn: 'test' };
  const incoming = legacy[prefs.orderMode] || prefs.orderMode;
  if (['practice', 'test'].includes(incoming)) {
    state.orderMode = incoming;
  }
  els.orderButtons.forEach((b) => {
    b.setAttribute('aria-checked', b.dataset.order === state.orderMode ? 'true' : 'false');
  });
  els.stage.dataset.order = state.orderMode;
  if (['en-th', 'th-en'].includes(prefs.direction)) {
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
    resolveScope(prefs.currentDeckId)?.id ||
    state.decks.find((d) => d.formerIds?.includes(prefs.currentDeckId))?.id ||
    state.decks[0]?.id;
  if (start) {
    selectDeck(start);
  }
  renderToday(); // again, now the current deck (a source of new cards) is known
  renderHome();
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
