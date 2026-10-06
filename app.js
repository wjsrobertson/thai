// Learn Thai — flashcard app
// Plain JS module, no build step. Loads decks from data/decks.json, schedules reviews with FSRS
// (see docs/review-design.md) and persists progress in localStorage.

const els = {
  stage: document.querySelector('.stage'),
  tabs: document.querySelectorAll('.tab'),
  deckButton: document.getElementById('deck-button'),
  deckButtonLabel: document.getElementById('deck-button-label'),
  deckPicker: document.getElementById('deck-picker'),
  deckPickerSearch: document.getElementById('deck-picker-search'),
  deckPickerTree: document.getElementById('deck-picker-tree'),
  srsToggle: document.getElementById('srs-toggle'),
  resetBtn: document.getElementById('reset-progress'),
  card: document.getElementById('card'),
  thai: document.getElementById('card-thai'),
  translit: document.getElementById('card-translit'),
  english: document.getElementById('card-english'),
  note: document.getElementById('card-note'),
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
  wordlistFilter: document.getElementById('wordlist-filter'),
  wordtable: document.getElementById('wordtable'),
  wordtableHead: document.getElementById('wordtable-head'),
  wordtableBody: document.getElementById('wordtable-body'),
  wordlistPrimaryButtons: document.querySelectorAll('.seg-btn[data-primary]'),
  settingsSection: document.getElementById('settings-section'),
  settingsModal: document.getElementById('settings-modal'),
  settingsButton: document.getElementById('settings-button'),
  setNewPerDay: document.getElementById('setting-new-per-day'),
  setMaxReviews: document.getElementById('setting-max-reviews'),
  setRetention: document.getElementById('setting-retention'),
  setBothDirections: document.getElementById('setting-both-directions'),
  setSayAloud: document.getElementById('setting-say-aloud'),
  setNewSource: document.getElementById('setting-new-source'),
  setReviewScope: document.getElementById('setting-review-scope'),
  todayDueFrom: document.getElementById('today-due-from'),
  todayBreakdown: document.getElementById('today-breakdown'),
  todayBreakdownBody: document.getElementById('today-breakdown-body'),
  todayNewFrom: document.getElementById('today-new-from'),
  todayCounts: document.getElementById('today-counts'),
  todayEmpty: document.getElementById('today-empty'),
  wordlistAddAll: document.getElementById('wordlist-add-all'),
  reviewToggles: document.querySelectorAll('.review-toggle'),
  roundAdd: document.getElementById('round-add'),
  confirmModal: document.getElementById('confirm-modal'),
  confirmTitle: document.getElementById('confirm-title'),
  confirmMessage: document.getElementById('confirm-message'),
  confirmDontAskRow: document.getElementById('confirm-dont-ask-row'),
  confirmDontAsk: document.getElementById('confirm-dont-ask'),
  confirmOk: document.getElementById('confirm-ok'),
  confirmCancel: document.getElementById('confirm-cancel'),
  confirmSettings: document.querySelectorAll('[data-confirm-setting]'),
  addModal: document.getElementById('add-modal'),
  addList: document.getElementById('add-list'),
  addConfirm: document.getElementById('add-confirm'),
  addPicks: document.querySelectorAll('[data-pick]'),
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
  reviewLeft: document.getElementById('review-left'),
  reviewDeck: document.getElementById('review-deck'),
  reviewQuit: document.getElementById('review-quit'),
  reviewBadge: document.getElementById('review-badge'),
  reviewPrompt: document.getElementById('review-prompt'),
  reviewSpeak: document.getElementById('review-speak'),
  reviewHint: document.getElementById('review-hint'),
  reviewAnswer: document.getElementById('review-answer'),
  reviewMain: document.getElementById('review-main'),
  reviewTranslit: document.getElementById('review-translit'),
  reviewNote: document.getElementById('review-note'),
  reviewPills: document.getElementById('review-pills'),
  reviewShow: document.getElementById('review-show'),
  reviewContinue: document.getElementById('review-continue'),
  reviewGrades: document.getElementById('review-grades'),
  reviewSummary: document.getElementById('review-summary'),
  reviewScore: document.getElementById('review-score'),
  reviewSub: document.getElementById('review-sub'),
  reviewMissedTitle: document.getElementById('review-missed-title'),
  reviewMissed: document.getElementById('review-missed'),
  reviewDone: document.getElementById('review-done'),
  resetDeckHelp: document.getElementById('reset-deck-help'),
  resetAll: document.getElementById('reset-all'),
  setAudioSource: document.getElementById('setting-audio-source'),
  audioSourceHelp: document.getElementById('setting-audio-source-help'),
  setThaiSpeed: document.getElementById('setting-thai-speed'),
  setTextSize: document.getElementById('setting-text-size'),
  installHelp: document.getElementById('install-help'),
  installActions: document.getElementById('install-actions'),
  installBtn: document.getElementById('install-btn'),
  offlineHelp: document.getElementById('offline-help'),
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
  newPerDay: 15,                  // new items introduced per study day (Today, and first answers in deck Test mode)
  maxReviews: 200,                // due reviews per study day
  retention: 0.9,                 // FSRS desired retention
  bothDirections: true,           // also schedule English → Thai items (unlocked per word; see gradeItem)
  sayAloud: true,                 // recall prompt says "Say it aloud…"
  confirmAddAll: true,            // Wordlist "Add all to Review" asks first (Settings → Confirmations)
  confirmRemoveAll: true,         // Wordlist "✓ All in Review" (remove all) asks first
  newSource: 'manual',            // what Review covers: 'manual' (words you add) | automatic from 'started' decks | the 'current' deck
  reviewScope: 'all',             // which due items Today reviews: 'all' decks | 'current' deck
  audioSource: 'samples',         // 'samples' (data/audio MP3s, TTS fallback) | 'browser' (always TTS); Thai and English
  thaiSpeed: 1,                   // playback speed multiplier for Thai audio (samples and TTS), 0.5–1
  textSize: 0,                    // -2..2 steps around the default text size (see TEXT_SCALES)
  offlineAudio: false,            // user chose "Download all audio": keep every clip cached
  readRepeats: 1,                 // times to repeat each word during read-aloud
  readPauseSec: 1.5,              // seconds of silence between words
  readSpeakEnglish: true,         // whether to speak English after Thai
  learnPauseMs: 1500,             // pause after answering before auto-advancing (Test mode)
  testOrder: 'random',            // Test-mode card order: 'random' | 'deck' (the deck's own order)
  learnAutoProgress: 'correct',   // 'off' (wait for Next) | 'always' | 'correct' (only on a right answer); older saves hold true/false
};

const state = {
  decks: [],
  currentDeckId: null,
  cards: [],          // current deck's cards (with progress merged)
  queue: [],          // ordered indices into `cards`
  pos: 0,             // index into queue
  showingBack: false,
  view: 'home',       // 'home' | 'flashcards' (the Flashcards tab) | 'wordlist' (Wordlists) | 'today' (the Review tab)
  sort: { key: null, dir: 'asc' },
  filter: '',
  primaryCol: 'thai', // 'thai' | 'translit' | 'english' — first column on wordlist
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
  breakdownOpen: null,      // the Review breakdown category showing its words (renderTodayBreakdown)
  lastRound: [],            // the last deck Test round's answers, [{ key, isCorrect }], for "Add to Review…"
  addOpen: false,           // the "Add to Review" dialog is open
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
];

function migrateSettings() {
  const store = loadStore();
  const done = new Set(store.settingsMigrations || []);
  for (const [id, step] of SETTINGS_MIGRATIONS) {
    if (done.has(id)) continue;
    const patch = store.settings && step(store.settings);
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
const AGAIN_DELAY = 10 * MINUTE;         // a missed item is due again shortly (and requeued in-session)
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
    it.s = FSRS_W[g - 1];
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
  it.due = g === 1 ? now + AGAIN_DELAY : now + interval * DAY;
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
  const files = { th: {}, en: {} };
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
  // study-ahead.
  const settings = getSettings();
  const deckOrder = settings.testOrder === 'deck';
  if (!srsOn) {
    const all = cards.map((_, i) => i);
    return deckOrder ? all : shuffled(all);
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
  return [...due, ...ahead];
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

function renderCard() {
  hideRoundSummary(); // the next round was set up when the summary opened
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
  setFlipped(false);
  updateStats();
  renderLearnPills();
  updateReviewToggle();
  // Auto-play Thai audio on navigation, only while the card is on screen: picking a deck or
  // changing a setting from the wordlist re-renders the hidden card too.
  if (state.view === 'flashcards' && !state.reading.active) speak(c.thai);
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
}

// Deck Test mode answers ('good' or 'again') update the same items as Today's review.
function saveDeckRating(c, rating) {
  const store = loadStore();
  // Testing a removed deck, or a removed word, brings it back to Review.
  if (store.reviewExcluded?.includes(state.currentDeckId) || store.reviewExcludedCards?.includes(c.key)) {
    store.reviewExcluded = (store.reviewExcluded || []).filter((id) => id !== state.currentDeckId);
    store.reviewExcludedCards = (store.reviewExcludedCards || []).filter((key) => key !== c.key);
    saveStore(store);
  }
  const it = gradeItem(c.key, state.direction, rating === 'again' ? 1 : 3, { mode: 'mc', deckId: state.currentDeckId });
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
    state.queue = buildQueue(state.cards, els.srsToggle.checked);
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

  state.lastRound = answers.map(([key, a]) => ({ key, isCorrect: a.isCorrect }));
  els.roundAdd.hidden = getSettings().newSource !== 'manual';
  els.roundAdd.textContent = 'Add to Review…';
  state.learnAnswers = new Map();
  state.pendingLearnRating = null;
  // Rebuild at the end of a pass so newly-due cards come up sooner.
  state.queue = buildQueue(state.cards, els.srsToggle.checked);
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

function selectDeck(deckId) {
  const deck = state.decks.find((d) => d.id === deckId);
  if (!deck) return;
  if (state.reading.active) stopReadAloud();
  state.pendingLearnRating = null;
  state.learnAnswers = new Map();
  state.currentDeckId = deckId;
  state.cards = mergeProgressIntoCards(deck.cards);
  state.queue = buildQueue(state.cards, els.srsToggle.checked);
  state.pos = 0;
  setPreferences({ currentDeckId: deckId });
  els.deckButtonLabel.textContent = deck.name;
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
  row.className = 'deck-row' + (d.id === state.currentDeckId ? ' current' : '');
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
  row.addEventListener('click', () => {
    selectDeck(d.id);
    closeDeckPicker();
  });
  return row;
}

function pickerGroup(g, q) {
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
  wrap.appendChild(pickerHeader('sub', g.name, count, wrap, q, state.expandedGroups, g.key));
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
    group.appendChild(pickerHeader('cat', c.name, count, group, q, state.expandedCategories, c.name));
    const list = document.createElement('div');
    list.className = 'cat-decks';
    for (const item of c.items) {
      list.appendChild(item.deck ? pickerDeckRow(item.deck) : pickerGroup(item.group, q));
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
  // Every open starts from the current deck: its category and group open, the rest closed.
  const current = state.decks.find((d) => d.id === state.currentDeckId);
  state.expandedCategories.clear();
  state.expandedGroups.clear();
  if (current) {
    state.expandedCategories.add(current.category || 'Uncategorized');
    if (current.group) state.expandedGroups.add(`${current.category || 'Uncategorized'}::${current.group}`);
  }
  renderDeckPicker();
  els.deckPickerTree.querySelector('.deck-row.current')?.scrollIntoView({ block: 'center' });
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
    const deck = state.decks.find((d) => d.id === state.currentDeckId);
    if (deck) state.cards = mergeProgressIntoCards(deck.cards);
  }
  setPreferences({ view });
}

// ---------- settings UI ----------

// Text size steps -> multiplier for the --fs CSS variable, which scales content text
// (cards, wordlist, deck picker, settings) but not the app chrome.
const TEXT_SCALES = { '-2': 0.8, '-1': 0.9, 0: 1, 1: 1.15, 2: 1.3 };

function applyTextSize() {
  document.documentElement.style.setProperty('--fs', TEXT_SCALES[getSettings().textSize] ?? 1);
}

function renderSettings() {
  const s = getSettings();
  els.setNewPerDay.value = s.newPerDay;
  els.setMaxReviews.value = s.maxReviews;
  els.setRetention.value = String(s.retention);
  els.setBothDirections.checked = s.bothDirections;
  els.setSayAloud.checked = s.sayAloud;
  for (const box of els.confirmSettings) box.checked = s[box.dataset.confirmSetting] !== false;
  els.setNewSource.value = s.newSource;
  els.setReviewScope.value = s.reviewScope;

  els.setAudioSource.value = s.audioSource;
  els.audioSourceHelp.textContent = audioSourceHelpText(s.audioSource);
  els.setThaiSpeed.value = String(s.thaiSpeed);
  els.setTextSize.value = String(s.textSize);
  renderInstall();
  renderOffline();
  els.setReadRepeats.value = s.readRepeats;
  els.setReadPause.value = s.readPauseSec;
  els.setReadEnglish.checked = s.readSpeakEnglish;
  els.setLearnPause.value = s.learnPauseMs;
  els.setTestOrder.value = s.testOrder;
  els.setLearnAuto.value = autoProgressMode(s);
  els.learnPauseRow.style.display = autoProgressMode(s) === 'off' ? 'none' : '';

  // Reset help shows the current deck name.
  const deck = state.decks.find((d) => d.id === state.currentDeckId);
  if (deck) {
    els.resetDeckHelp.textContent = `"Reset current topic" wipes only "${deck.name}". "Reset everything" wipes all ${state.decks.length} topics.`;
  } else {
    els.resetDeckHelp.textContent = 'Wipe study progress. Choose scope.';
  }
}

function bindSettings() {
  els.setNewPerDay.addEventListener('change', () => {
    const n = parseInt(els.setNewPerDay.value, 10);
    if (n >= 0 && n <= 100) setSettings({ newPerDay: n });
    renderToday();
  });
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
  els.confirmSettings.forEach((box) => box.addEventListener('change', () => {
    setSettings({ [box.dataset.confirmSetting]: box.checked });
  }));
  els.setNewSource.addEventListener('change', () => {
    setSettings({ newSource: els.setNewSource.value });
    renderToday();
    renderWordlist();     // the + buttons only show with manual adding
    updateReviewToggle();
  });
  els.setReviewScope.addEventListener('change', () => {
    setSettings({ reviewScope: els.setReviewScope.value });
    renderToday();
  });

  els.setAudioSource.addEventListener('change', () => {
    setSettings({ audioSource: els.setAudioSource.value });
    const deck = state.decks.find((d) => d.id === state.currentDeckId);
    if (deck) preloadDeckAudio(deck); // starts (samples) or cancels (browser) preloading
    renderSettings();
  });
  els.installBtn.addEventListener('click', async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    installPrompt = null;
    renderInstall();
  });
  els.offlineDownload.addEventListener('click', () => {
    if (offline.running) {
      setSettings({ offlineAudio: false }); // an explicit Stop also stops auto-download on load
      offline.abort.abort();
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
    await caches.delete(AUDIO_CACHE);
    renderOffline();
    toast('Downloaded audio deleted');
  });
  els.setTextSize.addEventListener('change', () => {
    setSettings({ textSize: parseInt(els.setTextSize.value, 10) || 0 });
    applyTextSize();
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
  state.queue = buildQueue(state.cards, els.srsToggle.checked);
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

function setPrimaryCol(col) {
  if (!['thai', 'english'].includes(col)) return;
  state.primaryCol = col;
  els.wordlistPrimaryButtons.forEach((b) => {
    b.setAttribute('aria-checked', b.dataset.primary === col ? 'true' : 'false');
  });
  setPreferences({ primaryCol: col });
  renderWordlist();
}

function setDirection(direction) {
  if (!['en-th', 'th-en'].includes(direction)) return;
  state.direction = direction;
  els.directionButtons.forEach((b) => {
    b.setAttribute('aria-checked', b.dataset.direction === direction ? 'true' : 'false');
  });
  setPreferences({ direction });
  // Each direction has its own progress, so re-read it; a new round starts.
  const deck = state.decks.find((d) => d.id === state.currentDeckId);
  if (deck) state.cards = mergeProgressIntoCards(deck.cards);
  rebuildCurrentQueue();
}

// ---------- wordlist ----------

function visibleWordlistRows() {
  const q = state.filter.trim().toLowerCase();
  let rows = state.cards;
  if (q) {
    rows = rows.filter(
      (c) =>
        c.thai.toLowerCase().includes(q) ||
        c.translit.toLowerCase().includes(q) ||
        c.english.toLowerCase().includes(q),
    );
  }
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
  const deck = state.decks.find((d) => d.id === state.currentDeckId);
  if (!deck) return;

  textWithArrows(els.wordlistDeckName, `${deck.name} — ${deck.description}`);
  const manual = getSettings().newSource === 'manual';
  const words = reviewWords();

  const rows = visibleWordlistRows();

  // Build column order: chosen primary first, then the other two in fixed order.
  const COL_META = {
    thai:     { label: 'Thai',           cls: 'col-thai' },
    translit: { label: 'Transliteration', cls: 'col-translit' },
    english:  { label: 'English',        cls: 'col-english' },
  };
  const fixedOrder = ['thai', 'translit', 'english'];
  const cols = [state.primaryCol, ...fixedOrder.filter((k) => k !== state.primaryCol)];

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
      const tr = document.createElement('tr');
      tr.dataset.key = c.key;
      if (state.reading.active && state.reading.currentKey === c.key) {
        tr.classList.add('now-playing');
      }
      const added = manual && c.key in words;
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
      if (manual) {
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
  els.wordlistAddAll.hidden = !manual;
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

  // Flip the card to reveal the back face.
  setFlipped(true);

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
// One session across all decks: due items first (weakest first), with new cards mixed in. New
// items start with multiple choice; after that it's recall and self-grading. New and missed items
// come back a few cards later in the same session (successive relearning).
// See docs/review-design.md.

const NEW_PER_DECK = 5;        // new cards per deck per day, to mix categories (relaxed if the budget would go unfilled)
const REQUEUE_GAP = [5, 8];    // a missed or just-introduced item comes back this many cards later

// Decks new cards come from: the current deck, plus (by default) every deck with a word you've
// started, minus decks removed from Review ("Current deck only" ignores removals: it's explicit).
function newCardDecks(items, source, excluded) {
  const current = state.decks.find((d) => d.id === state.currentDeckId);
  if (source === 'current') return current ? [current] : [];
  const started = new Set();
  for (const itemKey of Object.keys(items)) {
    const entry = state.cardIndex.get(splitItemKey(itemKey)[0]);
    if (entry) entry.deckIds.forEach((id) => started.add(id));
  }
  const others = state.decks.filter((d) => started.has(d.id) && d.id !== current?.id && !excluded.has(d.id));
  return current && !excluded.has(current.id) ? [current, ...others] : others;
}

// Today's plan: due and new entries, and the session queue mixing them. An entry is
// { key, dir, deckId, kind: 'due' | 'new' }.
function planReview(now = Date.now()) {
  const s = getSettings();
  const items = loadStore().items || {};
  const log = todayLog();
  const end = endOfStudyDay(now);

  const f = reviewFilter();
  const due = [];
  for (const [itemKey, it] of Object.entries(items)) {
    if (it.due > end) continue;
    const [key, dir] = splitItemKey(itemKey);
    if (!f.has(key)) continue;
    const deckId = reviewDeckId(key, dir, s, f.excluded);
    if (deckId) due.push({ key, dir, deckId, kind: 'due', r: fsrsR(Math.max(0, (now - it.last) / DAY), it.s) });
  }
  due.sort((a, b) => a.r - b.r);
  due.splice(Math.max(0, s.maxReviews - (log.rv || 0)));

  // Words you add all show up straight away; automatic adding has a daily allowance.
  let budget = f.manual ? Infinity : Math.max(0, s.newPerDay - (log.n || 0));
  const news = [];
  // English → Thai for words whose meaning is known: up to half the budget, oldest unlock first.
  if (s.bothDirections) {
    const unlocked = Object.entries(items)
      .filter(([k, it]) => it.u && k.endsWith('##th-en'))
      .map(([k, it]) => ({ key: splitItemKey(k)[0], last: it.last }))
      .filter((u) => !items[itemKeyOf(u.key, 'en-th')] && state.cardIndex.has(u.key) && f.has(u.key))
      .sort((a, b) => a.last - b.last)
      .slice(0, Math.ceil(budget / 2));
    for (const u of unlocked) news.push({ key: u.key, dir: 'en-th', deckId: state.cardIndex.get(u.key).deckIds[0], kind: 'new' });
    budget -= unlocked.length;
  }
  if (f.manual) {
    // Words you've added that haven't started yet, in the order you added them.
    for (const key of Object.keys(f.words).sort((a, b) => f.words[a] - f.words[b])) {
      if (items[itemKeyOf(key, 'th-en')]) continue;
      const deckId = reviewDeckId(key, 'th-en', s, f.excluded);
      if (deckId) news.push({ key, dir: 'th-en', deckId, kind: 'new' });
    }
  }
  // Automatic: new words in deck order, round-robin across decks: NEW_PER_DECK each first, then
  // whatever fills the budget.
  const taken = new Set();
  const decks = f.manual ? [] : newCardDecks(items, s.newSource, f.excluded).map((d) => ({ deck: d, i: 0, n: log.nd?.[d.id] || 0 }));
  for (const cap of [NEW_PER_DECK, Infinity]) {
    let added = true;
    while (budget > 0 && added) {
      added = false;
      for (const d of decks) {
        if (budget <= 0) break;
        if (d.n >= cap) continue;
        while (d.i < d.deck.cards.length) {
          const key = cardKey(d.deck.cards[d.i++]);
          if (items[itemKeyOf(key, 'th-en')] || taken.has(key) || !f.has(key)) continue;
          taken.add(key);
          news.push({ key, dir: 'th-en', deckId: d.deck.id, kind: 'new' });
          d.n += 1;
          budget -= 1;
          added = true;
          break;
        }
      }
    }
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

// The deck a due item is reviewed under, or null if Today skips it: its card was edited or
// removed, its direction is off, or "Due reviews from: Current deck only" excludes its decks.
// With all decks, it's the first of the card's decks that hasn't been removed from Review.
function reviewDeckId(key, dir, s, excluded) {
  const entry = state.cardIndex.get(key);
  if (!entry || (dir === 'en-th' && !s.bothDirections)) return null;
  if (s.reviewScope === 'current') return entry.deckIds.includes(state.currentDeckId) ? state.currentDeckId : null;
  return entry.deckIds.find((id) => !excluded.has(id)) || null;
}

// Decks removed from Review with the breakdown's ✕. A deck comes back when you answer one of its
// cards in deck Test mode (saveDeckRating).
function excludedDecks() {
  return new Set(loadStore().reviewExcluded || []);
}

// What Review covers. "Only words I add" (manual): the words in store.reviewWords ({ cardKey:
// addedAt }). Automatic: every word with progress, minus removed decks and words.
function reviewFilter() {
  const store = loadStore();
  if (getSettings().newSource === 'manual') {
    const words = store.reviewWords || {};
    return { manual: true, words, has: (key) => key in words, excluded: new Set() };
  }
  const removed = new Set(store.reviewExcludedCards || []);
  return { manual: false, words: null, has: (key) => !removed.has(key), excluded: new Set(store.reviewExcluded || []) };
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
  updateReviewToggle();
}

// The 🔁 icon / ✓ on a Flashcards card, in Learn and Test mode (manual adding only).
function updateReviewToggle() {
  const c = currentCard();
  const show = !!c && getSettings().newSource === 'manual';
  const added = show && c.key in reviewWords();
  for (const btn of els.reviewToggles) {
    btn.hidden = !show;
    btn.replaceChildren(added ? '✓' : reviewIcon());
    btn.classList.toggle('added', added);
    btn.title = added ? 'In Review: tap to remove it' : 'Add to Review';
    btn.setAttribute('aria-label', btn.title);
  }
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
// Confirmations), it offers "Don't ask again", which turns the setting off when confirming; while
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

// "Add to Review…" after a deck Test round: the round's words, none ticked; All / Missed only / None.
function openAddModal() {
  const words = reviewWords();
  els.addList.replaceChildren(...state.lastRound.map(({ key, isCorrect }) => {
    const c = state.cards.find((card) => card.key === key);
    const row = document.createElement('label');
    row.className = 'add-row';
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.dataset.key = key;
    box.dataset.missed = String(!isCorrect);
    box.checked = box.disabled = key in words;
    const span = (cls, text) => Object.assign(document.createElement('span'), { className: cls, textContent: text });
    const detail = span('bw-detail', '');
    detail.append(span('bw-translit', c?.translit || ''), ' ', span('bw-english', c?.english || ''));
    const tag = key in words ? 'in Review' : isCorrect ? '' : 'missed';
    row.append(box, span('bw-thai', c?.thai || key), detail, span('bw-kind' + (tag === 'missed' ? ' missed' : ''), tag));
    return row;
  }));
  updateAddConfirm();
  state.addOpen = true;
  els.addModal.hidden = false;
  setModalOpen(true);
}

function closeAddModal() {
  state.addOpen = false;
  els.addModal.hidden = true;
  setModalOpen(false);
}

function addChoices() {
  return [...els.addList.querySelectorAll('input:not(:disabled)')];
}

function updateAddConfirm() {
  const n = addChoices().filter((b) => b.checked).length;
  els.addConfirm.textContent = n ? `Add ${n} to Review` : 'Add to Review';
  els.addConfirm.disabled = n === 0;
}

// A word removed from Review (the ✕ in a breakdown category's word list): its progress is
// deleted and it isn't offered as a new card. Answering it in deck Test mode brings it back
// (saveDeckRating).
function removeWordFromReview(key) {
  if (getSettings().newSource === 'manual') {
    setInReview([key], false);
    return;
  }
  const store = loadStore();
  for (const dir of ['th-en', 'en-th']) delete store.items?.[itemKeyOf(key, dir)];
  store.reviewExcludedCards = [...new Set([...(store.reviewExcludedCards || []), key])];
  saveStore(store);
  renderToday();
}

function removeCategoryFromReview(cat) {
  const ids = new Set(state.decks.filter((d) => (d.category || 'Uncategorized') === cat).map((d) => d.id));
  if (getSettings().newSource === 'manual') {
    // Take out the added words listed under this category (progress is kept).
    const s = { ...getSettings(), bothDirections: true };
    setInReview(Object.keys(reviewWords()).filter((key) => ids.has(reviewDeckId(key, 'th-en', s, new Set()))), false);
    return;
  }
  const store = loadStore();
  const excluded = new Set(store.reviewExcluded || []);
  // Delete the items reviewed under this category (worked out before excluding it), so words it
  // shares with a category you keep stay with that one.
  const s = { ...getSettings(), bothDirections: true, reviewScope: 'all' };
  for (const itemKey of Object.keys(store.items || {})) {
    const [key, dir] = splitItemKey(itemKey);
    if (ids.has(reviewDeckId(key, dir, s, excluded))) delete store.items[itemKey];
  }
  ids.forEach((id) => excluded.add(id));
  store.reviewExcluded = [...excluded];
  saveStore(store);
  renderToday();
}

// For the end-of-session screen.
function dueTomorrow(now = Date.now()) {
  const s = getSettings();
  const end = endOfStudyDay(now);
  let n = 0;
  const f = reviewFilter();
  for (const [itemKey, it] of Object.entries(loadStore().items || {})) {
    if (it.due <= end || it.due > end + DAY) continue;
    const [key, dir] = splitItemKey(itemKey);
    if (f.has(key) && reviewDeckId(key, dir, s, f.excluded)) n += 1;
  }
  return n;
}

function renderToday() {
  if (!state.cardIndex.size) return; // decks not loaded yet
  const r = state.review;
  // With either "Current deck only" option, show the deck button (same place as on Decks) so the deck can be changed here.
  const s = getSettings();
  els.stage.classList.toggle('today-deck', !r && (s.newSource === 'current' || s.reviewScope === 'current'));
  els.todayHome.hidden = !!r;
  els.todayBreakdown.hidden = true; // shown below when there's something to break down
  els.review.hidden = !r || r.finished;
  els.reviewSummary.hidden = !r?.finished;
  if (r) return;
  const plan = planReview();
  const deckName = state.decks.find((d) => d.id === state.currentDeckId)?.name || 'this topic';
  els.todayDue.textContent = plan.due.length;
  els.todayDueFrom.textContent = s.reviewScope === 'current' ? `in ${deckName}` : 'across all topics';
  els.todayNew.textContent = plan.news.length;
  els.todayNewFrom.textContent = s.newSource === 'manual' ? "you've added"
    : s.newSource === 'current' ? `from ${deckName}` : 'mixed from your topics';
  // "Only words I add" with nothing added yet: say how to add words instead of 0 / 0.
  const empty = s.newSource === 'manual' && Object.keys(reviewWords()).length === 0;
  els.todayEmpty.hidden = !empty;
  els.todayCounts.hidden = empty;
  els.todayStart.hidden = empty || plan.queue.length === 0;
  renderTodayBreakdown(plan);
}

// The landing page: a card per view. Decks and Wordlist show the current deck, Review today's counts.
function renderHome() {
  if (!state.cardIndex.size) return; // decks not loaded yet
  const plan = planReview();
  const deck = state.decks.find((d) => d.id === state.currentDeckId);
  els.homeDeckStat.textContent = els.homeWordlistStat.textContent = deck ? `Topic: ${deck.name}` : '';
  const empty = getSettings().newSource === 'manual' && Object.keys(reviewWords()).length === 0;
  els.homeReviewStat.textContent = empty ? 'Nothing added yet' : `${plan.due.length} due · ${plan.news.length} new`;
}

// Under the card: the session's due and new counts per category, biggest first.
// Tapping a category row shows its words (one category at a time), each with its own ✕.
function renderTodayBreakdown(plan) {
  const byCat = new Map();
  const categoryOf = (deckId) => state.decks.find((d) => d.id === deckId)?.category || 'Uncategorized';
  for (const [list, field] of [[plan.due, 'due'], [plan.news, 'new']]) {
    for (const e of list) {
      const cat = categoryOf(e.deckId);
      if (!byCat.has(cat)) byCat.set(cat, { due: 0, new: 0, words: new Map() });
      const c = byCat.get(cat);
      c[field] += 1;
      // A word can be both due and new (one direction each): list it once.
      if (!c.words.has(e.key)) c.words.set(e.key, { card: state.cardIndex.get(e.key).card, kinds: new Set() });
      c.words.get(e.key).kinds.add(e.dir === 'en-th' ? `${field} EN→TH` : field);
    }
  }
  const rows = [...byCat].sort((a, b) => (b[1].due + b[1].new) - (a[1].due + a[1].new) || a[0].localeCompare(b[0]));
  if (!byCat.has(state.breakdownOpen)) state.breakdownOpen = null;
  els.todayBreakdownBody.replaceChildren(...rows.flatMap(([cat, n]) => {
    const open = state.breakdownOpen === cat;
    const tr = document.createElement('tr');
    tr.className = 'bd-row' + (open ? ' open' : '');
    tr.setAttribute('aria-expanded', String(open));
    for (const text of [cat, n.due || '–', n.new || '–']) {
      const td = document.createElement('td');
      td.textContent = text;
      tr.appendChild(td);
    }
    tr.firstChild.classList.add('bd-cat');
    tr.addEventListener('click', () => {
      state.breakdownOpen = open ? null : cat;
      renderToday();
    });
    const td = document.createElement('td');
    td.appendChild(removeButton(`Remove ${cat} from Review`, () => removeCategoryFromReview(cat)));
    tr.appendChild(td);
    if (!open) return [tr];

    const wordsRow = document.createElement('tr');
    wordsRow.className = 'bd-words';
    const cell = document.createElement('td');
    cell.colSpan = 4;
    const list = document.createElement('ul');
    // One line per word: Thai, then translit and meaning (cut short if long), then due/new and ✕.
    const span = (cls, text) => Object.assign(document.createElement('span'), { className: cls, textContent: text });
    list.replaceChildren(...[...n.words].map(([key, w]) => {
      const li = document.createElement('li');
      const detail = span('bw-detail', '');
      detail.append(span('bw-translit', w.card.translit), ' ', span('bw-english', w.card.english));
      detail.title = `${w.card.translit} · ${w.card.english}`;
      li.append(span('bw-thai', w.card.thai), detail, textWithArrows(span('bw-kind', ''), [...w.kinds].join(' · '), { caps: true }),
        removeButton(`Remove ${w.card.thai} from Review`, () => removeWordFromReview(key)));
      return li;
    }));
    cell.appendChild(list);
    wordsRow.appendChild(cell);
    return [tr, wordsRow];
  }));
  els.todayBreakdown.hidden = rows.length === 0;
}

function removeButton(label, onClick) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'bd-remove';
  btn.textContent = '✕';
  btn.title = label;
  btn.setAttribute('aria-label', label);
  btn.addEventListener('click', (e) => {
    e.stopPropagation(); // don't also toggle the row
    onClick();
  });
  return btn;
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

// New items start with multiple choice; a second multiple-choice go only if the first was wrong.
function reviewMode(it) {
  return !it || (!it.rc && (it.mc || 0) < 2 && !it.mcOk) ? 'mc' : 'recall';
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
  r.mode = reviewMode(it);
  r.revealed = false;
  r.answered = false;

  els.reviewPrompt.textContent = thaiFirst ? card.thai : card.english;
  els.reviewPrompt.className = 'review-prompt thai' + (thaiFirst ? '' : ' front-en');
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
  els.reviewContinue.hidden = true;
  if (r.mode === 'mc') {
    els.reviewHint.textContent = 'Pick the answer';
    els.reviewShow.hidden = true;
    renderReviewPills(e, card);
  } else {
    els.reviewHint.textContent = getSettings().sayAloud ? 'Say it aloud, then tap Show' : 'Recall it, then tap Show';
    els.reviewPills.replaceChildren();
    els.reviewPills.hidden = true;
    els.reviewShow.hidden = false;
  }
  // English → Thai: no audio until the answer is shown, or it would give the answer away.
  els.reviewSpeak.hidden = !thaiFirst;
  if (thaiFirst) speak(card.thai);
}

function renderReviewPills(e, card) {
  const deck = state.decks.find((d) => d.id === e.deckId);
  const field = e.dir === 'th-en' ? 'english' : 'thai';
  const others = shuffled((deck?.cards || []).filter((c) => c[field] !== card[field])).slice(0, 2);
  els.reviewPills.innerHTML = '';
  els.reviewPills.classList.remove('locked');
  for (const c of shuffled([card, ...others])) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'learn-pill' + (field === 'thai' ? ' thai-pill' : '');
    btn.textContent = c[field];
    btn.addEventListener('click', () => pickReviewPill(btn, c === card));
    els.reviewPills.appendChild(btn);
  }
  els.reviewPills.hidden = false;
}

function pickReviewPill(btn, isCorrect) {
  const r = state.review;
  if (!r || r.answered) return;
  r.answered = true;
  els.reviewPills.classList.add('locked');
  const { card } = state.cardIndex.get(r.queue[r.pos].key);
  const answer = r.queue[r.pos].dir === 'th-en' ? card.english : card.thai;
  for (const p of els.reviewPills.querySelectorAll('.learn-pill')) {
    if (p.textContent === answer) p.classList.add('correct');
    else p.classList.add(p === btn ? 'wrong' : 'dimmed');
  }
  recordGrade(isCorrect ? 3 : 1);
  revealAnswer();
  const s = getSettings();
  if (shouldAutoAdvance(autoProgressMode(s), isCorrect)) {
    const at = r.pos;
    setTimeout(() => { if (state.review === r && r.pos === at) nextEntry(); }, s.learnPauseMs ?? 1500);
  } else {
    els.reviewContinue.hidden = false;
  }
}

function revealAnswer() {
  const r = state.review;
  if (!r || r.revealed) return;
  const e = r.queue[r.pos];
  r.revealed = true;
  els.reviewAnswer.hidden = false;
  els.reviewShow.hidden = true;
  els.reviewSpeak.hidden = false;
  if (e.dir === 'en-th') speak(state.cardIndex.get(e.key).card.thai);
  if (r.mode !== 'recall') return;
  // Label each grade with when the card would come back.
  const it = getItem(itemKeyOf(e.key, e.dir));
  const now = Date.now();
  for (const btn of els.reviewGrades.querySelectorAll('.grade')) {
    btn.querySelector('span').textContent = formatInterval(scheduleItem(it, Number(btn.dataset.grade), now).due - now);
  }
  els.reviewGrades.hidden = false;
}

function formatInterval(ms) {
  if (ms < HOUR) return `${Math.max(1, Math.round(ms / MINUTE))}m`;
  if (ms < DAY) return `${Math.round(ms / HOUR)}h`;
  const days = Math.round(ms / DAY);
  if (days < 30) return `${days}d`;
  return days < 365 ? `${Math.round(days / 30)}mo` : `${(days / 365).toFixed(1)}y`;
}

// Save the grade, keep session stats, and requeue: multiple choice always earns a recall go
// later in the session, and a miss comes back until it's right.
function recordGrade(g) {
  const r = state.review;
  const e = r.queue[r.pos];
  const itemKey = itemKeyOf(e.key, e.dir);
  gradeItem(e.key, e.dir, g, { mode: r.mode, deckId: e.deckId });
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
  if (r.mode === 'mc' || g === 1) {
    const [lo, hi] = REQUEUE_GAP;
    const at = Math.min(r.queue.length, r.pos + 1 + lo + Math.floor(Math.random() * (hi - lo + 1)));
    r.queue.splice(at, 0, { ...e, again: g === 1, requeued: true });
  }
}

function gradeCurrent(g) {
  const r = state.review;
  if (!r || !r.revealed || r.mode !== 'recall' || r.answered) return;
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
  if (r.mode === 'mc') {
    if (!r.answered && ['1', '2', '3'].includes(e.key)) {
      els.reviewPills.querySelectorAll('.learn-pill')[Number(e.key) - 1]?.click();
    } else if (r.answered && (enter || e.key === 'ArrowRight')) {
      e.preventDefault();
      nextEntry();
    }
    return;
  }
  if (!r.revealed) {
    if (enter) {
      e.preventDefault();
      revealAnswer();
    }
  } else if (['1', '2', '3', '4'].includes(e.key)) {
    gradeCurrent(Number(e.key));
  } else if (enter) {
    e.preventDefault();
    gradeCurrent(3); // Good
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

async function resetDeckProgress() {
  if (!state.currentDeckId) return;
  const deck = state.decks.find((d) => d.id === state.currentDeckId);
  if (!deck) return;
  const ok = await confirmDialog({
    title: `Reset ${deck.name}?`,
    message: `This wipes your progress on its ${deck.cards.length} words, including where they appear in other topics.\nThis can't be undone.`,
    confirmLabel: 'Reset',
    danger: true,
  });
  if (!ok) return;
  const store = loadStore();
  for (const c of deck.cards) {
    for (const dir of ['th-en', 'en-th']) delete store.items?.[itemKeyOf(cardKey(c), dir)];
  }
  saveStore(store);
  selectDeck(state.currentDeckId);
  renderToday();
  toast(`Progress reset for ${deck.name}`);
}

async function resetAllProgress() {
  const ok = await confirmDialog({
    title: 'Reset all progress?',
    message: `This wipes your study history on all ${state.decks.length} topics. Your settings are kept.\nThis can't be undone.`,
    confirmLabel: 'Reset everything',
    danger: true,
  });
  if (!ok) return;
  const store = loadStore();
  store.items = {};
  store.daily = {};
  store.reviewExcluded = [];
  store.reviewExcludedCards = [];
  saveStore(store);
  if (state.currentDeckId) selectDeck(state.currentDeckId);
  renderToday();
  toast('All progress reset');
}

// ---------- TTS ----------

let thaiVoice = null;
let englishVoice = null;
let sampleFiles = { th: {}, en: {} };  // lang -> card text -> MP3 in data/audio/ (see loadAudioManifest)
let sayText = new Map();  // card thai -> what to say instead, from the optional `say` field (e.g. ก -> กอ ไก่)
const sampleAudio = new Audio();
let finishSample = null;    // settles the in-flight playSample() promise

// The current deck's clips are fetched in the background when it's selected and held as blob
// URLs, so playback never waits on the network. LRU-capped so browsing decks doesn't grow
// memory without bound (a 50-card deck is ~100 clips, ~1.2 MB).
const SAMPLE_CACHE_MAX = 600;
const PRELOAD_JOBS = 4;
const sampleCache = new Map();  // clip URL -> blob URL; Map order doubles as LRU order
let preloadAbort = null;

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

// Fetch every Thai clip in the deck, then every English one. A newer call cancels the old one.
async function preloadDeckAudio(deck) {
  if (preloadAbort) preloadAbort.abort();
  preloadAbort = null;
  if (getSettings().audioSource !== 'samples') return;
  const controller = new AbortController();
  preloadAbort = controller;
  const urls = new Set();
  for (const [lang, field] of [['th', 'thai'], ['en', 'english']]) {
    for (const c of deck.cards) {
      const url = sampleUrl(c[field], lang);
      if (url && !sampleCache.has(url)) urls.add(url);
    }
  }
  const queue = [...urls];
  const worker = async () => {
    while (queue.length && !controller.signal.aborted) {
      const url = queue.shift();
      try {
        const res = await fetch(url, { signal: controller.signal });
        if (res.ok) cacheSample(url, URL.createObjectURL(await res.blob()));
      } catch {
        // Aborted or offline: playback just fetches that clip on demand.
      }
    }
  };
  await Promise.all(Array.from({ length: PRELOAD_JOBS }, worker));
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
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  sampleAudio.pause();
  if (finishSample) finishSample(true);
}

function speak(text, lang = 'th') {
  stopAudio();
  speakAndWait(text, lang);
}

function speedFor(lang) {
  return lang === 'th' ? getSettings().thaiSpeed : 1;
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

  els.wordlistFilter.addEventListener('input', (e) => {
    state.filter = e.target.value;
    renderWordlist();
  });

  els.wordlistPrimaryButtons.forEach((btn) => {
    btn.addEventListener('click', () => setPrimaryCol(btn.dataset.primary));
  });

  document.getElementById('read-aloud').addEventListener('click', toggleReadAloud);

  // Deck picker
  els.deckButton.addEventListener('click', openDeckPicker);
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

  els.resetBtn.addEventListener('click', resetDeckProgress);
  els.resetAll.addEventListener('click', resetAllProgress);

  els.card.addEventListener('click', (e) => {
    // Don't flip if clicking the speak or flip button (flip-btn calls flipCard itself).
    if (e.target.closest('.speak-btn')) return;
    if (e.target.closest('.review-toggle')) return;
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
    const deck = state.decks.find((d) => d.id === state.currentDeckId);
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
  els.reviewToggles.forEach((btn) => btn.addEventListener('click', (e) => {
    e.stopPropagation(); // not a flip
    const c = currentCard();
    if (!c) return;
    const add = !(c.key in reviewWords());
    setInReview([c.key], add);
    // No word in the message: it could give away the side of the card you haven't seen.
    toast(add ? '✓ Added to Review' : 'Removed from Review', { tone: add ? 'good' : '' });
  }));
  els.roundAdd.addEventListener('click', openAddModal);
  els.addModal.addEventListener('click', (e) => {
    if (e.target.dataset.close !== undefined) closeAddModal();
  });
  els.addPicks.forEach((btn) => btn.addEventListener('click', () => {
    for (const box of addChoices()) {
      box.checked = btn.dataset.pick === 'all' || (btn.dataset.pick === 'missed' && box.dataset.missed === 'true');
    }
    updateAddConfirm();
  }));
  els.addList.addEventListener('change', updateAddConfirm);
  els.addConfirm.addEventListener('click', () => {
    const keys = addChoices().filter((b) => b.checked).map((b) => b.dataset.key);
    if (!keys.length) return;
    setInReview(keys, true);
    closeAddModal();
    els.roundAdd.textContent = `✓ Added ${keys.length} to Review`;
  });

  els.todayStart.addEventListener('click', startReview);
  els.reviewShow.addEventListener('click', revealAnswer);
  els.reviewContinue.addEventListener('click', () => { if (state.review?.answered) nextEntry(); });
  els.reviewGrades.addEventListener('click', (e) => {
    const btn = e.target.closest('.grade');
    if (btn) gradeCurrent(Number(btn.dataset.grade));
  });
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
    if (state.addOpen) {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeAddModal();
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
// sw.js caches the app files and each audio clip as it's fetched. Here: the Settings → App
// section, "Download all audio", and keeping the audio cache in step with the manifest.

const PUBLIC_URL = 'https://wjsrobertson.github.io/thai/';
const AUDIO_CACHE = 'learnthai-audio'; // shared with sw.js
const OFFLINE_JOBS = 6;
const AVG_CLIP_KB = 13;                // for the size estimate; ~106 MB / 8.3k clips on 2026-10-04
const IS_IOS = /iPhone|iPad|iPod/.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); // iPadOS reports as a Mac
let installPrompt = null; // Chrome/Android's deferred install prompt; Safari has none
const offline = { running: false, abort: null, done: 0, total: 0, failed: 0 };

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
  return [...new Set([...Object.values(sampleFiles.th), ...Object.values(sampleFiles.en)])];
}

async function cachedAudioFiles(cache) {
  return new Set((await cache.keys()).map((r) => r.url.split('/').pop()));
}

const mb = (bytes) => Math.round(bytes / 1e6).toLocaleString();

async function renderOffline() {
  if (!('caches' in window)) {
    els.offlineHelp.textContent = `Offline audio needs HTTPS. Open ${PUBLIC_URL} instead.`;
    els.offlineProgress.hidden = true;
    els.offlineDownload.parentElement.hidden = true;
    return;
  }
  let { done, total } = offline;
  if (!offline.running) {
    const files = allAudioFiles();
    const have = await cachedAudioFiles(await caches.open(AUDIO_CACHE));
    done = files.filter((f) => have.has(f)).length;
    total = files.length;
  }
  const used = (await navigator.storage?.estimate?.())?.usage;
  const n = (x) => x.toLocaleString();
  const complete = total > 0 && done === total;
  els.offlineProgress.hidden = !offline.running;
  els.offlineProgress.value = total ? done / total : 0;
  els.offlineDownload.hidden = complete && !offline.running;
  els.offlineDownload.textContent = offline.running ? 'Stop' : done ? 'Download the rest' : 'Download all audio';
  els.offlineDelete.hidden = offline.running || done === 0;
  els.offlineHelp.textContent =
    offline.running ? `Downloading… ${n(done)} of ${n(total)} clips. Keep the app open until it finishes.` :
    complete ? `All ${n(total)} clips are saved for offline use${used ? ` (${mb(used)} MB)` : ''}. Clips for new cards download automatically.` :
    `${n(done)} of ${n(total)} clips saved${used ? ` (${mb(used)} MB used)` : ''}. Everything is about ` +
      `${mb(total * AVG_CLIP_KB * 1000)} MB, best on Wi-Fi. Each topic's audio is saved anyway when you open it.` +
      (offline.failed ? ` ${n(offline.failed)} failed: check your connection and try again.` : '');
}

// Fetch every clip that isn't cached yet. Resumable: cached clips are skipped, so a stopped or
// interrupted run picks up where it left off.
async function downloadAllAudio() {
  if (offline.running || !('caches' in window)) return;
  const cache = await caches.open(AUDIO_CACHE);
  const files = allAudioFiles();
  const have = await cachedAudioFiles(cache);
  const todo = files.filter((f) => !have.has(f));
  const abort = new AbortController();
  Object.assign(offline, { running: true, abort, done: files.length - todo.length, total: files.length, failed: 0 });
  renderOffline();
  // With the service worker in control it caches each clip on the way through; before it
  // takes control (the very first visit), store them here.
  const direct = !navigator.serviceWorker?.controller;
  let next = 0;
  let lastRender = 0;
  async function worker() {
    while (next < todo.length && !abort.signal.aborted) {
      const url = `data/audio/${todo[next++]}`;
      try {
        const res = await fetch(url, { signal: abort.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        if (direct) await cache.put(url, res);
        else await res.arrayBuffer();
        offline.done += 1;
      } catch {
        if (abort.signal.aborted) break;
        offline.failed += 1;
      }
      if (performance.now() - lastRender > 300) {
        lastRender = performance.now();
        renderOffline();
      }
    }
  }
  await Promise.all(Array.from({ length: OFFLINE_JOBS }, worker));
  offline.running = false;
  renderOffline();
}

// On load: drop cached clips that no card uses any more (edited or removed cards), then, if the
// user chose to download everything, fetch clips for new cards.
async function syncOfflineAudio() {
  if (!('caches' in window)) return;
  const wanted = new Set(allAudioFiles());
  if (!wanted.size) return; // the manifest didn't load: don't prune everything
  const cache = await caches.open(AUDIO_CACHE);
  for (const req of await cache.keys()) {
    if (!wanted.has(req.url.split('/').pop())) await cache.delete(req);
  }
  if (getSettings().offlineAudio) downloadAllAudio();
}

// ---------- boot ----------

async function init() {
  applyTextSize(); // before anything renders, so the text never jumps size
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
  // Migrate legacy 'translit' to 'thai' since the option no longer exists.
  const incomingPrimary = prefs.primaryCol === 'translit' ? 'thai' : prefs.primaryCol;
  if (['thai', 'english'].includes(incomingPrimary)) {
    state.primaryCol = incomingPrimary;
  }
  els.wordlistPrimaryButtons.forEach((b) => {
    b.setAttribute('aria-checked', b.dataset.primary === state.primaryCol ? 'true' : 'false');
  });
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

  const start =
    state.decks.find((d) => d.id === prefs.currentDeckId)?.id ||
    state.decks[0]?.id;
  if (start) {
    selectDeck(start);
  }
  renderToday(); // again, now the current deck (a source of new cards) is known
  renderHome();

  registerServiceWorker();
  syncOfflineAudio();
}

init();
