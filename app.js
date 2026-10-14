import { letterSpelling, letterStep, schoolSpelling, vowelSpelling, isSpellable, consonantClass } from './spell.js';
import { toneBreakdown, tableTone, TABLE_COLUMNS, TONE_THAI, CLASS_NAMES, MARK_NAMES } from './tones.js';

// Learn Thai — flashcard app
// Plain JS module, no build step. Loads decks from data/decks.json, schedules reviews with FSRS
// (see docs/review-design.md) and persists progress in localStorage.

const els = {
  stage: document.querySelector('.stage'),
  tabs: document.querySelectorAll('.tab[data-view]'), // not the phone's More (tabMore)
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
  dictSection: document.getElementById('dictionary-section'),
  dictSearch: document.getElementById('dict-search'),
  dictHead: document.getElementById('dict-head'),
  dictBack: document.getElementById('dict-back'),
  dictHeading: document.getElementById('dict-heading'),
  dictGrid: document.getElementById('dict-grid'),
  alphaSection: document.getElementById('alphabet-section'),
  alphaHint: document.getElementById('alpha-hint'),
  alphaVowels: document.getElementById('alpha-vowels'),
  alphaTones: document.getElementById('alpha-tones'),
  alphaSetMenu: document.getElementById('alpha-set-menu'),
  alphaSetItems: document.querySelectorAll('[data-alpha-set]'),
  alphaGrid: document.getElementById('alpha-grid'),
  alphaLegend: document.getElementById('alpha-legend'),
  alphaClasses: document.getElementById('alpha-classes'),
  alphaPageButtons: document.querySelectorAll('[data-alpha-page]'),
  cardPic: document.getElementById('card-pic'),
  reviewPic: document.getElementById('review-pic'),
  dictEmpty: document.getElementById('dict-empty'),
  dictTable: document.getElementById('dict-table'),
  dictTableHead: document.getElementById('dict-table-head'),
  dictTableBody: document.getElementById('dict-table-body'),
  wordtableHead: document.getElementById('wordtable-head'),
  wordtableBody: document.getElementById('wordtable-body'),
  settingsSection: document.getElementById('settings-section'),
  settingsModal: document.getElementById('settings-modal'),
  settingsButton: document.getElementById('settings-button'),
  tabMore: document.getElementById('tab-more'), // a phone's, in the tab bar
  moreMenu: document.getElementById('more-menu'), // its list
  moreItems: document.querySelectorAll('.more-item'),
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
  reviewOnlyPickFrom: document.getElementById('review-only-pick-from'),
  reviewOnlyYes: document.getElementById('review-only-yes'),
  reviewOnlyTopics: document.getElementById('review-only-topics'),
  reviewOnlyEverything: document.getElementById('review-only-everything'),
  deckPickerSearchRow: document.querySelector('#deck-picker .modal-search'),
  wordlistAddAll: document.getElementById('wordlist-add-all'),
  confirmModal: document.getElementById('confirm-modal'),
  wordModal: document.getElementById('word-modal'),
  wordModalTr: document.getElementById('word-modal-tr'),
  wordModalEn: document.getElementById('word-modal-en'),
  wordModalBody: document.getElementById('word-modal-body'),
  wordModalClose: document.getElementById('word-modal-close'),
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
  aboutRecordings: document.getElementById('about-recordings'),
  setThaiSpeed: document.getElementById('setting-thai-speed'),
  setSpelling: document.getElementById('setting-spelling'),
  setTheme: document.getElementById('setting-theme'),
  setThaiFont: document.getElementById('setting-thai-font'),
  themeColorMeta: document.querySelector('meta[name="theme-color"]'),
  setTextSize: document.getElementById('setting-text-size'),
  setWordlistFirst: document.getElementById('setting-wordlist-first'),
  setTopicWordGaps: document.getElementById('setting-topic-word-gaps'),
  setReadStoryTitles: document.getElementById('setting-read-story-titles'),
  setReadStoriesLoop: document.getElementById('setting-read-stories-loop'),
  installHelp: document.getElementById('install-help'),
  installActions: document.getElementById('install-actions'),
  installBtn: document.getElementById('install-btn'),
  offlineHelp: document.getElementById('offline-help'),
  launchHelp: document.getElementById('launch-help'),
  wordlistAbout: document.getElementById('wordlist-about'),
  wordlistLetters: document.getElementById('wordlist-letters'),
  wordlistLetterGrid: document.getElementById('wordlist-letter-grid'),
  wordlistLettersHint: document.getElementById('wordlist-letters-hint'),
  readingSection: document.getElementById('reading-section'),
  readingLibrary: document.getElementById('reading-library'),
  readingList: document.getElementById('reading-list'),
  readingRead: document.getElementById('reading-read'),
  readingReadAll: document.getElementById('reading-read-all'),
  reader: document.getElementById('reader'),
  readerLines: document.getElementById('reader-lines'),
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
  theme: 'dark',                  // Settings → Display → Theme: dark | charcoal | light | night | black
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
  topicWordGaps: false,           // the Topics page: spaces between a phrase's words (Settings → Topics)
  readStoryTitles: true,          // Reading's Read all says each story's English title first (Settings → Reading)
  readStoriesLoop: true,          // Reading's Read / Read all start again when they finish (Settings → Reading)
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
  section: 'words',  // whose cards the Cards engine holds: 'words', or 'alphabet' on the Alphabet's Cards page (useSection)
  view: 'home',       // 'home' | 'flashcards' (the Flashcards tab) | 'wordlist' (the Topics tab, once Wordlists). The Review tab ('today') became Flashcards' Review mode on 2026-10-08.
  dictLetter: null,   // the Dictionary's letter (ก…ฮ), or null for the grid (renderDictionary)
  dictQuery: '',      // and its search box
  readingId: null,    // the Reading page's open passage (renderReading), or null for the list. 'reading' is a view too, reached from Home.
  orderMode: 'practice', // Flashcards' mode: 'practice' (Learn) | 'test' | 'review'
  direction: 'th-en', // 'th-en' (Thai on front, English on back) | 'en-th' (English on front, Thai on back) | 'listen' (the Thai's sound on front, as th-en behind)
  pickerOpen: false,
  pickerFilter: '',
  settingsOpen: false,
  moreOpen: false, // the phone's More list
  expandedCategories: new Set(), // open picker categories; reset to the current deck's on each open (openDeckPicker)
  expandedGroups: new Set(),     // same for deck groups, keyed `${category}::${group}`
  lastFocus: null,
  reading: { active: false, token: 0, currentKey: null },
  // Reading's Read / Read all (readStories): running (active), the button it was started from (btn),
  // where it's got to (at: { ids, idx, line }), and, while a word's dialog has it paused, where to
  // carry on (paused: { btn, ids, idx, line }).
  storyReading: { active: false, token: 0, btn: null, at: null, paused: null },
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

// One-off (2026-10-13): cards merged across topics. A word glossed in different words in different
// topics (ยังไง "how" and "how (casual)") was two cards, and listed twice on the Words page; the
// user had them merged into one, keyed by one gloss; and the Colors topic's สีแดง, now a phrase,
// is "red (the colour)" beside แดง "red". Saved Cards words and progress move to the new keys.
// Where the old and the new key both have something, the earlier added date and the progress with
// more reviews stay.
const CARD_RENAMES = {
  // The Colors topic's สี- compounds, now phrases (สี + แดง): "red" became "red (the colour)".
  "สีขาว::white": "white (the colour)",
  "สีชมพู::pink": "pink (the colour)",
  "สีดำ::black": "black (the colour)",
  "สีทอง::gold": "gold (the colour)",
  "สีน้ำตาล::brown": "brown (the colour)",
  "สีน้ำเงิน::dark blue / navy": "dark blue / navy (the colour)",
  "สีฟ้า::light blue / sky blue": "light blue / sky blue (the colour)",
  "สีม่วง::purple": "purple (the colour)",
  "สีส้ม::orange": "orange (the colour)",
  "สีเขียว::green": "green (the colour)",
  "สีเงิน::silver": "silver (the colour)",
  "สีเทา::grey": "grey (the colour)",
  "สีเหลือง::yellow": "yellow (the colour)",
  "สีแดง::red": "red (the colour)",
  "กลัว::afraid / scared": "to be afraid / scared",
  "กลัว::to be afraid": "to be afraid / scared",
  "กะ::with": "with / and",
  "กับ::with": "with / and",
  "กำลัง::(in the middle of) …ing": "currently / -ing (before verb)",
  "กิ๊ก::side partner, fling": "fling / side piece",
  "กี่::how many": "how many (with counter)",
  "กุญแจ::key": "key / lock",
  "กุ้ง::shrimp": "shrimp / prawn",
  "ก็::then / also / (also softener)": "then / also / well…",
  "ก่อน::before": "before / first",
  "ขนาด::size": "size / so (much)",
  "ขยะ::garbage / trash": "rubbish / garbage / trash",
  "ขยะ::rubbish": "rubbish / garbage / trash",
  "ขอบใจ::grateful / thankful (heart)": "thanks (to a junior / friend)",
  "ข้าง::beside / next to": "side / beside / next to",
  "ข้าง::side / beside": "side / beside / next to",
  "ข้างหลัง::behind": "behind / at the back",
  "คณิตศาสตร์::maths": "mathematics",
  "คดี::case": "(legal) case",
  "คน::person": "person / people",
  "ครับ::(polite particle, male speaker)": "polite particle (male)",
  "ครั้ง::time (occurrence)": "(classifier) times / occurrences",
  "ครึ่ง::half (as in half-past)": "half",
  "ครู::teacher": "teacher / coach",
  "คะแนน::score / points": "score / points / marks",
  "คะแนน::score, marks": "score / points / marks",
  "ค่ะ::(polite particle, female speaker)": "polite particle (female, statement)",
  "ค่าธรรมเนียม::fee": "fee / charge",
  "ค่าปรับ::fine (the money)": "fine (penalty)",
  "งั้น::like that / in that case": "like that / then / in that case",
  "งั้น::then / in that case": "like that / then / in that case",
  "ง้อ::to win someone back, make up": "to coax back, make up",
  "จบ::to graduate": "to end / finish / graduate",
  "จริง::true": "true / real",
  "จะ::will (future)": "will / going to",
  "จับ::to catch / arrest": "to catch / hold / arrest",
  "จ๊ะ::(sweet question particle)": "soft, sweet particle (women; anyone to a child)",
  "ฉัน::I / me": "I / me (female, informal)",
  "ชุด::outfit / set": "outfit / dress / set",
  "ซะ::(do it) completely / already": "(just) do it! / completely",
  "ซะ::(just) do it! (bossy push)": "(just) do it! / completely",
  "ซัก::just (one) / about": "just (one) / about (as spoken)",
  "ซักผ้า::to do laundry": "to do the laundry",
  "ซิ::go on!": "go on! (urging)",
  "ดอกเบี้ย::interest": "interest (on money)",
  "ดัง::loud": "loud / to ring (a phone)",
  "ดังนั้น::therefore": "therefore / so (formal)",
  "ดังนั้น::therefore / so": "therefore / so (formal)",
  "ดึง::to pull": "to pull, stretch",
  "ดู::to look / watch": "to look / to watch",
  "ด้วย::also / too / with": "too / also / with / please",
  "ด้วย::too / with / please": "too / also / with / please",
  "ด้าน::side": "side / aspect",
  "ตก::to fall": "to fall / drop / fail",
  "ตกลง::OK / to agree": "to agree; OK, deal",
  "ตกลง::agreed / deal": "to agree; OK, deal",
  "ตรงข้าม::opposite": "opposite / across from",
  "ตลอด::always / throughout": "always / throughout / all the time",
  "ตลอด::throughout / all the time": "always / throughout / all the time",
  "ตัว::classifier for animals": "(classifier) animals, clothing, furniture",
  "ตั้งแต่::since / from": "since / from (a time)",
  "ตำรวจ::police": "police / police officer",
  "ตำรวจ::police officer": "police / police officer",
  "ติ่ง::superfan, stan": "superfan / stan (lit. a dangly bit)",
  "ถึง::to arrive / until": "to arrive / reach / until",
  "ทัวร์ลง::pile-on": "getting piled on online (lit. the tour arrives)",
  "ทั้งหมด::all / everything": "all / everything / the whole lot",
  "ทั้งหมด::all / the whole lot": "all / everything / the whole lot",
  "ทาง::way / path / route": "way / path / direction",
  "ทางด่วน::expressway": "expressway / toll road",
  "ทำ::to do / make": "to do / to make",
  "ทิ้ง::to dump, leave": "to throw away / leave behind",
  "ที่สุด::the most": "the most … (superlative)",
  "ที่อยู่::address": "address / where one lives",
  "ท่าน::you (very respectful)": "you / he / she (very respectful)",
  "ท่าน::you / he (respectful)": "you / he / she (very respectful)",
  "ท้องเสีย::diarrhea": "diarrhoea",
  "นะ::(softening particle)": "softener / \"you know?\"",
  "นัด::appointment / to book one": "appointment / to set a time",
  "นาน::long (time)": "for a long time",
  "นาฬิกา::clock / o'clock": "clock / watch / o'clock",
  "นาฬิกา::watch / clock": "clock / watch / o'clock",
  "นิติบุคคล::condo management office": "condo management office (juristic person)",
  "นึง::one (after a classifier)": "one (as spoken, after a classifier)",
  "นึง::one (as spoken)": "one (as spoken, after a classifier)",
  "น่ะ::(particle: you see / as for)": "you see / as for… (explaining)",
  "น่ารัก::cute": "cute / lovely",
  "น้อง::younger sibling": "younger sibling; you (to someone younger)",
  "น้า::aunt or uncle (younger than your parents)": "aunt / uncle (mother's younger sibling)",
  "น้ำขึ้น::high tide": "rising water; high tide",
  "บน::on / above": "on / on top of / above",
  "บน::on / on top of": "on / on top of / above",
  "ปลาทู::mackerel": "short mackerel",
  "ปลูก::to plant": "to plant, grow",
  "ฝัน::dream": "to dream / a dream",
  "ฝึก::to train": "to train / practise",
  "พวกเขา::they": "they / them",
  "พอ::enough": "enough / as soon as",
  "พัก::to rest": "to rest / stay",
  "พี่::older sibling": "older sibling; you, I (to or from someone older)",
  "พี่::older sibling / you, I (to or from someone older)": "older sibling; you, I (to or from someone older)",
  "พี่::older sibling; you (to someone older)": "older sibling; you, I (to or from someone older)",
  "พูด::to speak": "to speak / say",
  "มหาลัย::uni": "uni (casual)",
  "มัน::he / she (contemptuous \"it\")": "it / (rude) he, she",
  "มั้ย::(yes/no question)": "…? (yes/no question, as spoken)",
  "มี::have": "to have / there is",
  "มี::to have": "to have / there is",
  "มุม::angle / corner": "corner / angle",
  "มุม::corner": "corner / angle",
  "ยัง::still / not yet": "still / yet / not yet",
  "ยังไง::how": "how (casual)",
  "ยาดม::menthol inhaler stick": "menthol nasal inhaler",
  "ยาหม่อง::balm (like Tiger Balm)": "herbal balm (like Tiger Balm)",
  "ยิ้ม::smile": "to smile",
  "รถเข็น::wheelchair": "cart; wheelchair",
  "รอบ::around": "round / around",
  "ระหว่าง::between": "between / during",
  "ระเบิด::bomb / explosion": "bomb / to explode / explosion",
  "ระเบิด::bomb / to explode": "bomb / to explode / explosion",
  "ราก::root": "root (of a plant / an equation)",
  "ราก::root (of an equation / plant)": "root (of a plant / an equation)",
  "ราชการ::civil service / officialdom": "government service / civil service",
  "ราชการ::government service": "government service / civil service",
  "รึ::or?": "or? (question tag)",
  "รู้::to know (a fact)": "to know (information)",
  "ร้าน::shop": "shop / store",
  "ลาก่อน::goodbye": "goodbye (for good)",
  "ลูก::child (one's own)": "child / kid (one's own)",
  "ล่ะ::then? / what about…?": "\"so?\" / \"and what about?\"",
  "วะ::(rude question particle)": "(rude question particle, among mates)",
  "ว่ะ::(rude statement particle)": "(rude statement particle, among mates)",
  "ว่า::that (introducing a clause)": "that (reporting) / to say",
  "ศพ::corpse": "corpse / dead body",
  "ศพ::dead body": "corpse / dead body",
  "สนใจ::interested": "to be interested / care",
  "สมุนไพร::herb": "herbs / herbal",
  "สระผม::to wash hair": "to wash one's hair",
  "สวย::beautiful": "beautiful / pretty",
  "สวัสดี::hello / hi": "hello / goodbye",
  "สอง::two": "2 — two",
  "สัญญา::promise": "to promise / a promise / contract",
  "สัญญา::to promise / contract": "to promise / a promise / contract",
  "สาม::three": "3 — three",
  "สิ::(urging particle) go on…!": "emphatic / \"do it\"",
  "สินะ::(I) guess… / huh?": "(I) guess… / so that's it (wry)",
  "สินะ::huh… / so that's it (wry)": "(I) guess… / so that's it (wry)",
  "สี::color": "colour",
  "สูตร::formula": "recipe / formula",
  "หนึ่ง::one": "1 — one",
  "หน่วย::unit (of electricity)": "unit",
  "หน่อย::a bit / please (softener)": "a little / please (softener for requests)",
  "หมด::out / used up": "all gone / used up",
  "หมอนวด::massage therapist": "masseur, masseuse",
  "หมายถึง::to mean": "to mean / refer to",
  "หรอก::(softens a \"no\")": "particle softening denials",
  "หรือ::or": "or / (question tag)",
  "หอพัก::dormitory": "dormitory / student flats",
  "หัวหน้า::boss / chief": "head / chief / boss",
  "หูฟัง::headphones": "headphones / earphones",
  "องศา::degree (angle)": "degree (temperature, angle)",
  "องศา::degree (temperature)": "degree (temperature, angle)",
  "อยู่::to be (location) / to stay": "to be at / stay / live",
  "ออก::to go out / exit": "to go out / exit / leave",
  "ออก::to leave / exit": "to go out / exit / leave",
  "อัน::thing / one (classifier)": "(classifier) small things, generic",
  "อาทิตย์::week (colloquial) / Sunday": "week / sun / Sunday",
  "อาเจียน::to vomit": "to vomit (formal)",
  "อำเภอ::district": "district / district office",
  "อำเภอ::district office (provinces)": "district / district office",
  "อ่า::ah…": "ah… / uh",
  "ฮะ::(casual polite particle) / huh?": "casual polite particle (male) / huh?",
  "ฮะ::casual male yes / soft polite": "casual polite particle (male) / huh?",
  "เก่ง::clever, good at things": "good at / clever",
  "เคย::to have ever / used to": "have ever / used to (do)",
  "เค้า::he / she": "he / she / they (casual spelling)",
  "เค้า::he / she / they": "he / she / they (casual spelling)",
  "เงิน::money": "money / silver",
  "เงียบ::quiet": "quiet / silent",
  "เจ็บ::to hurt": "to hurt / be in pain",
  "เจ้าหน้าที่::officer / staff": "officer / staff member",
  "เจ้าหน้าที่::official, staff member": "officer / staff member",
  "เดี๋ยวนี้::right now (current era / nowadays)": "right now / nowadays",
  "เถอะ::let's / just (do it)": "let's / go ahead and (suggestion)",
  "เท่ากับ::equals": "equal to / equals",
  "เท่าไหร่::how much?": "how much / how many",
  "เธอ::you (in songs)": "you (intimate) / she",
  "เนี่ย::(this here — emphasis)": "this here (emphatic)",
  "เบอร์::number (phone)": "number (phone, size, ticket)",
  "เพราะว่า::because": "because (longer)",
  "เพลง::song": "song / music",
  "เพิ่ง::just (now)": "just (recently)",
  "เพื่อ::for the sake of / to": "in order to / for (the sake of)",
  "เพื่อ::in order to / for": "in order to / for (the sake of)",
  "เพื่อ::in order to / for the sake of": "in order to / for (the sake of)",
  "เมื่อ::when (past or future)": "when / at the time (past or future)",
  "เมื่อ::when / whenever": "when / at the time (past or future)",
  "เมื่อ::when, at the time (past or future)": "when / at the time (past or future)",
  "เยอะ::a lot / lots": "a lot / lots (casual)",
  "เย็น::cool": "cool / cold (refreshing)",
  "เรา::we / I (casual)": "we / us / I (casual)",
  "เรา::we / us (also casual \"I\")": "we / us / I (casual)",
  "เริ่ม::to begin": "to start / begin",
  "เริ่ม::to start": "to start / begin",
  "เรือ::boat": "boat, ship",
  "เร็ว::fast": "fast / quick",
  "เวที::stage": "ring / stage",
  "เวลา::time": "time / when",
  "เว้ย::(rude emphatic particle)": "(rude emphatic particle) man!",
  "เสีย::broken, not working": "broken / spoiled / to lose",
  "เสียใจ::sad": "sorry / sad",
  "เหมือน::like / as": "like / as / similar",
  "เหมือน::like / similar": "like / as / similar",
  "เหยื่อ::prey": "victim / prey / bait",
  "เหยื่อ::prey; bait": "victim / prey / bait",
  "เหยื่อ::victim": "victim / prey / bait",
  "เหยื่อ::victim / prey": "victim / prey / bait",
  "เหรอ::really? (question tag)": "really? / is that so?",
  "เหรอ::really? / is it?": "really? / is that so?",
  "เอง::-self / just": "self / just / only",
  "เอา::I'll take it / I want": "I'll take it / I want it",
  "เฮ้::hey (calling someone)": "hey!",
  "แก::you (rough / casual)": "you (very casual / rude)",
  "แกง::to prank / set up (lit. curry)": "to prank / set up / stitch up (lit. curry)",
  "แกง::to set up / stitch up (lit. curry)": "to prank / set up / stitch up (lit. curry)",
  "แก่::old (person)": "old (people)",
  "แดด::sunlight": "sunlight / sun",
  "แต่ว่า::but (then)": "but (longer form)",
  "แน่ใจ::certain": "sure (certain)",
  "แพทย์::physician": "physician (formal)",
  "แพ้::to lose": "to lose / be defeated",
  "แฟน::boyfriend / girlfriend": "boyfriend / girlfriend / partner",
  "แม่บ้าน::housekeeper / maid": "housewife; maid / housekeeper",
  "แม่บ้าน::housewife; maid": "housewife; maid / housekeeper",
  "แล้ว::already (perfective)": "already / and then",
  "แว่นตา::eyeglasses": "glasses / eyeglasses",
  "แว่นตา::glasses": "glasses / eyeglasses",
  "โกง::to cheat": "to cheat / swindle",
  "โกนหนวด::to shave": "to shave (beard)",
  "โดย::by": "by (agent / means)",
  "โทรศัพท์::phone": "telephone / phone",
  "โทรศัพท์::telephone": "telephone / phone",
  "โทษ::penalty": "to blame / punishment / penalty",
  "โทษ::to blame / punishment": "to blame / punishment / penalty",
  "โลก::the Earth / the world": "world / earth",
  "โว้ย::(rude emphatic) — shouting": "(rude emphatic, shouted)",
  "ใจดี::kind": "kind / kind-hearted",
  "ใจร้อน::impatient, hot-headed": "impatient / hot-tempered",
  "ใจร้าย::heartless, cruel": "mean / cruel-hearted",
  "ใจร้าย::mean, cruel": "mean / cruel-hearted",
  "ใบแจ้งหนี้::invoice": "invoice / bill",
  "ใส่::to put in / wear": "to put in / wear / put on",
  "ใส่::to wear / put on": "to put in / wear / put on",
  "ใหม่::new": "new / again",
  "ไกล::far": "far (from)",
  "ไข้หวัด::cold / flu": "cold / flu (formal)",
  "ไข้หวัด::common cold (formal)": "cold / flu (formal)",
  "ไง::\"how / right?\" / casual emphasis": "how / so? / you know / hey",
  "ไง::how / so? / hey": "how / so? / you know / hey",
  "ไง::how / you know / hey": "how / so? / you know / hey",
  "ไม่ค่อย::not really / not often": "not really / not often / hardly",
  "ไม่ค่อย::not very / hardly": "not really / not often / hardly",
  "ไอ้::(rude prefix for a man)": "(rude prefix for a man) you…",
};
function migrateCardRenames() {
  const store = loadStore();
  const done = new Set(store.settingsMigrations || []);
  if (done.has('card-renames-2026-10-13')) return;
  const renamed = (key) => {
    const english = CARD_RENAMES[key];
    return english ? `${key.split('::')[0]}::${english}` : null;
  };
  const words = store.reviewWords || {};
  for (const [key, at] of Object.entries(words)) {
    const to = renamed(key);
    if (!to) continue;
    words[to] = Math.min(at, words[to] ?? at);
    delete words[key];
  }
  const items = store.items || {};
  for (const [itemKey, it] of Object.entries(items)) {
    const [key, dir] = splitItemKey(itemKey);
    const to = renamed(key);
    if (!to) continue;
    const toItem = itemKeyOf(to, dir);
    if (!items[toItem] || (it.reps || 0) > (items[toItem].reps || 0)) items[toItem] = it;
    delete items[itemKey];
  }
  if (store.reviewWords) store.reviewWords = words;
  if (store.items) store.items = items;
  done.add('card-renames-2026-10-13');
  store.settingsMigrations = [...done];
  saveStore(store);
}

// Smooth scrolling, unless the device asks for reduced motion (2026-10-13).
const REDUCED_MOTION = matchMedia('(prefers-reduced-motion: reduce)');
const SCROLL_BEHAVIOR = () => (REDUCED_MOTION.matches ? 'auto' : 'smooth');

// iOS Safari applies :active (the pressed tint, styles.css) only on pages with a touchstart listener.
document.addEventListener('touchstart', () => {}, { passive: true });

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

// What a card's Thai sound is filed under: its `say` when it has one (a letter, read by its name: ก
// is กอ ไก่), else its Thai. gen_audio keys both, so a plain card with the same Thai (ณ "at") keeps
// its own reading (2026-10-12).
const cardSay = (card) => card.say || card.thai;

function cardKey(card) {
  // The Alphabet's letters have their own progress (the user's call, 2026-10-14), apart from the
  // same letters' cards in Thai Script's topics: abc:ก.
  if (card.alpha) return card.alphaSet === 'consonants' ? `abc:${card.thai}` : `abc:${card.alphaSet}:${card.thai}`;
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
  for (const scope of Object.values(alphaSets)) for (const c of scope.cards) state.cardIndex.set(cardKey(c), { card: c, deckIds: [scope.id] });
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
  if (state.section === 'alphabet') return state.cards;
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
    els.reviewOnlyEmptyTitle.textContent = scope?.kind === 'all' ? 'No words in Cards yet'
      : !scope || scope.kind === 'topic' ? "None of this topic's words are in Cards yet" : `None of the words in ${scope.name} are in Cards yet`;
    // Three ways out (2026-10-10, the user's wording and layout), each a button with what it does
    // beside it: add the whole topic (or group); choose words in Topics; or switch to Everything, when
    // that would show something. On Everything there's no topic to add.
    const all = scope?.kind === 'all';
    els.reviewOnlyAddAll.hidden = all || !state.cards.length;
    els.reviewOnlyAddName.textContent = `'${scope?.name || 'this topic'}'`;
    // "Add words from '…' individually", or on Everything (no topic) "Add words in Topics…".
    els.reviewOnlyPickFrom.textContent = all ? 'in Topics' : `from ${els.reviewOnlyAddName.textContent}`;
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
// change. (Review's card grows, so it doesn't need it.)
// The front's big text on Flashcards' card and Review's, and Flashcards' back.
function fitCardText() {
  fitPills();
  sizeCards();
  fitText(els.thai);
  if (els.reviewPrompt) fitText(els.reviewPrompt);
  fitBack(els.english);
  fitBack(els.reviewMain);
}

// On a phone the card takes the height the page leaves it: from under the controls down to the tab
// bar, less what's under the card (Recognition's answers, the ‹ › buttons, Recall's grades), so the
// whole page fits the screen at any text size (2026-10-12, the user's choice). It was a share of
// the screen's height, growing with the text size: at Larger and Largest the buttons went under the
// tab bar, and on an iPhone SE in Safari even at Default. The text then fits the card (fitText,
// fitBack). Below CARD_MIN_H the page scrolls instead.
const PHONE_LAYOUT = matchMedia('(max-width: 600px)'); // as mobile.css's <link media>
const CARD_MIN_H = 240; // the 72px corner buttons, top and bottom, and a line of text between
function sizeCards() {
  for (const card of [els.card, els.reviewCard]) {
    card.style.height = '';
    if (!PHONE_LAYOUT.matches || state.view !== 'flashcards' || !card.offsetParent) continue;
    const bar = document.querySelector('.tabs').getBoundingClientRect();
    // The lowest of the stage's parts, and the stage's padding under it, in page coordinates.
    const bottom = Math.max(...[...els.stage.children].filter((e) => e.getClientRects().length)
      .map((e) => e.getBoundingClientRect().bottom)) + window.scrollY;
    const spare = bar.top - parseFloat(getComputedStyle(els.stage).paddingBottom) - bottom;
    card.style.height = `${Math.max(CARD_MIN_H, Math.floor(card.offsetHeight + spare))}px`;
  }
}

// Recognition's answers keep to the three lines a phone gives them room for (mobile.css): a longer
// one shrinks, down to 70%, so the card (sizeCards) keeps its height for it.
function fitPills() {
  for (const pill of els.learnPills.children) {
    pill.style.fontSize = '';
    if (!PHONE_LAYOUT.matches || !pill.offsetParent) continue;
    const room = parseFloat(getComputedStyle(pill).minHeight);
    const base = parseFloat(getComputedStyle(pill).fontSize);
    for (let k = 0.94; k > 0.69 && pill.getBoundingClientRect().height > room + 0.5; k -= 0.06) pill.style.fontSize = `${base * k}px`;
  }
}

// The back scrolls when there's too much on it, but on a phone the longest idioms went just over
// (6 px, 2026-10-10, once the corner buttons grew): shrink the back the same way, down to 70%, until
// it fits. Backs that fit are untouched. All its lines shrink together (the Thai again, the
// transliteration, the answer, the note) since 2026-10-12: the card sized to fit the screen
// (sizeCards) is shorter at Largest text, and shrinking the answer alone left them over.
function fitBack(el) {
  const body = el.closest('.face-body');
  const lines = [...body.children];
  for (const line of lines) line.style.fontSize = '';
  if (!body.offsetParent || !el.textContent) return;
  const bases = lines.map((line) => parseFloat(getComputedStyle(line).fontSize));
  for (let k = 0.94; k > 0.69 && body.scrollHeight > body.clientHeight + 1; k -= 0.06) {
    lines.forEach((line, i) => { line.style.fontSize = `${bases[i] * k}px`; });
  }
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
  fitTimer = setTimeout(() => { fitCardText(); sizeLetterTiles(); }, 150);
});
// The embedded Thai font can arrive after the first fit (font-display: swap), and it's wider than
// the fallback: fit again once it's in.
document.fonts?.addEventListener?.('loadingdone', () => { fitCardText(); sizeLetterTiles(); });

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
    showPic(els.cardPic, null);
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
    if (state.direction === 'listen') els.thai.replaceChildren(listenButton(cardSay(c)));
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
  showPic(els.cardPic, c);
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
    if ((state.direction !== 'en-th' || state.showingBack) && autoPlayOn()) speak(cardSay(c));
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
  if (speakingSide(state.direction, state.showingBack) && autoPlayOn()) speak(cardSay(c));
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
  if (state.section === 'alphabet') return alphaScope();
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
  if (state.section === 'alphabet') { // the letters, every one (nothing to add first)
    state.cards = mergeProgressIntoCards(alphaScope().cards);
    return;
  }
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
  if (onAlphabet()) { // the Alphabet's set (toggleAlphaSets)
    els.deckButtonLabel.textContent = ALPHA_SETS[alphaSetNow()].label;
    els.deckButtonIcon.replaceChildren(lineIcon('page-icon', '0 0 24 24', PAGE_ICONS.alphabet));
    return;
  }
  const scope = state.view === 'flashcards' ? flashScope() : currentScope();
  els.deckButtonLabel.textContent = scope?.label || 'Choose a topic';
  els.deckButtonIcon.replaceChildren(lineIcon('page-icon', '0 0 24 24', PAGE_ICONS[!scope || scope.kind === 'topic' ? 'topics' : 'group']));
}

function selectDeck(deckId) {
  const deck = resolveScope(deckId);
  if (!deck || deck.kind === 'all') return;
  if (state.reading.active) stopReadAloud();
  if (storyRunOn()) stopReadStories();
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
  els.reviewByHelp.textContent = topic ? 'Shared with the Topics page' : "Every word you've added to Cards";
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

function wordSearch(query, { limit = WORD_HITS_SHOWN, keep = null } = {}) {
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
    if (score < 4 && (!keep || keep(w))) hits.push({ ...w, score });
  }
  hits.sort((a, b) => a.score - b.score || a.thai.length - b.thai.length);
  return { hits: hits.slice(0, limit), total: hits.length };
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
    rv.title = added ? `Remove ${h.card.thai} from Cards` : `Add ${h.card.thai} to Cards`;
    rv.setAttribute('aria-label', rv.title);
  };
  paint();
  rv.addEventListener('click', () => {
    added = !added;
    setInReview([h.key], added);
    toast(added ? `✓ Added ${h.card.thai} to Cards` : `Removed ${h.card.thai} from Cards`, { tone: added ? 'good' : '' });
    paint();
  });
  const sp = document.createElement('button');
  sp.type = 'button';
  sp.className = 'row-speak' + (sayingNow(cardSay(h.card)) ? ' playing' : '');
  sp.dataset.say = cardSay(h.card);
  sp.setAttribute('aria-label', `Play ${h.card.thai}`);
  sp.append(speakerIcon());
  sp.addEventListener('click', () => speakerPress(sp, cardSay(h.card)));
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

// On a phone Settings is a page (mobile.css), opened from More's list: it stops at the tab bar,
// whose More is lit (html.settings-open), and another tab leaves it (bindEvents). A dialog on wider
// screens.
function openSettings() {
  state.settingsOpen = true;
  document.documentElement.classList.add('settings-open');
  state.lastFocus = document.activeElement;
  els.settingsModal.hidden = false;
  setModalOpen(true);
  els.settingsSection.scrollTop = 0;
  els.settingsButton.setAttribute('aria-expanded', 'true');
  markMore();
  renderSettings();
  if (!TOUCH_SCREEN) setTimeout(() => els.settingsSearch.focus(), 0);
}

function closeSettings() {
  state.settingsOpen = false;
  document.documentElement.classList.remove('settings-open');
  els.settingsModal.hidden = true;
  setModalOpen(false);
  els.settingsButton.setAttribute('aria-expanded', 'false');
  markMore();
  if (state.lastFocus && typeof state.lastFocus.focus === 'function') {
    state.lastFocus.focus();
  }
}

// ---------- the Alphabet ----------

// The Alphabet (2026-10-14, the user's design): the 44 consonants in a grid like the Words page's,
// each opening a dialog (showLetterPop) with its picture, name, class and sound; and its own Browse,
// Recognition and Recall (its Cards page). The letters are Alphabet in Order's cards, with their
// own progress (cardKey: abc:ก) and their own place, mode and direction (useSection).
// The Alphabet's sets (2026-10-14, the user's call): the topic button picks one for both its pages.
// Each set's cards come from Thai Script topics, with their own progress (cardKey).
const ALPHA_SETS = {
  consonants: { label: 'Consonants', topics: ['script-consonants-all'], hint: 'Tap a letter for its name, picture, class and sound.' },
  vowels: { label: 'Vowels', topics: ['script-vowels', 'script-diphthongs'], hint: 'Tap a vowel for its sound, its partner and the marks it\'s written with.' },
  tones: { label: 'Tones', topics: ['script-read-tone'], hint: 'Tap a tone or a mark to learn it, or a syllable in the chart to hear it. The cards: read a syllable\'s tone.' },
};
// Every letter's picture (images/letters/, SVG; all 44 since 2026-10-14). A letter without one would show none.
const LETTER_PICS = {
  ก: 'chicken', ข: 'egg', ฃ: 'bottle', ค: 'buffalo', ฅ: 'person', ฆ: 'bell', ง: 'snake',
  จ: 'plate', ฉ: 'cymbals', ช: 'elephant', ซ: 'chain', ฌ: 'tree', ญ: 'woman', ฎ: 'headdress',
  ฏ: 'ox-goad', ฐ: 'pedestal', ฑ: 'montho', ฒ: 'old-man', ณ: 'novice-monk', ด: 'child',
  ต: 'turtle', ถ: 'bag', ท: 'soldier', ธ: 'flag', น: 'mouse', บ: 'leaf', ป: 'fish', ผ: 'bee',
  ฝ: 'lid', พ: 'tray', ฟ: 'tooth', ภ: 'junk', ม: 'horse', ย: 'giant', ร: 'boat', ล: 'monkey',
  ว: 'ring', ศ: 'pavilion', ษ: 'hermit', ส: 'tiger', ห: 'chest', ฬ: 'kite', อ: 'basin', ฮ: 'owl'
};
const alphaSets = {}; // set -> a scope as resolveScope makes them, for the Cards engine (flashScope)
let alphaCards = [];  // the consonants: their grid, and their dialog's same-sound and look-alike letters
const alphaSetNow = () => (ALPHA_SETS[getPreferences().alphaSet] ? getPreferences().alphaSet : 'consonants');
const alphaScope = () => alphaSets[alphaSetNow()];
const onAlphabet = () => state.view === 'alphabet' || state.section === 'alphabet';

function buildAlphabet() {
  for (const [set, def] of Object.entries(ALPHA_SETS)) {
    const cards = def.topics.flatMap((id) => state.decks.find((d) => d.id === id)?.cards || [])
      .map((c) => ({ ...c, alpha: true, alphaSet: set, pic: set === 'consonants' ? LETTER_PICS[c.thai] || null : null }));
    const id = `alphabet:${set}`;
    const deck = { id, name: def.label, cards };
    alphaSets[set] = { id, kind: 'alphabet', name: def.label, label: def.label, description: '', decks: [deck], cards, deckOf: new Map(cards.map((c) => [cardKey(c), deck])) };
  }
  alphaCards = alphaSets.consonants.cards;
}

// The set menu, under the topic button on the Alphabet's pages.
function toggleAlphaSets(open = els.alphaSetMenu.hidden) {
  if (!open && els.alphaSetMenu.hidden) return;
  els.alphaSetMenu.hidden = !open;
  els.deckButton.setAttribute('aria-expanded', open ? 'true' : 'false');
  if (!open) return;
  const set = alphaSetNow();
  els.alphaSetItems.forEach((b) => b.setAttribute('aria-checked', b.dataset.alphaSet === set ? 'true' : 'false'));
  const b = els.deckButton;
  Object.assign(els.alphaSetMenu.style, { top: `${b.offsetTop + b.offsetHeight + 6}px`, left: `${b.offsetLeft}px`, width: `${Math.max(b.offsetWidth, 300)}px` });
  if (!TOUCH_SCREEN) [...els.alphaSetItems].find((x) => x.dataset.alphaSet === set)?.focus();
}

// A new set: both pages show it; its cards start afresh (as a new topic does on Cards).
function setAlphaSet(set) {
  toggleAlphaSets(false);
  if (set === alphaSetNow() || !ALPHA_SETS[set]) return;
  setPreferences({ alphaSet: set });
  delete sectionEngines.alphabet;
  if (state.section === 'alphabet') {
    reloadFlashcards();
    fitCardText();
  }
  renderDeckButton();
  if (state.view === 'alphabet') renderAlphabet();
}

const picSrc = (pic) => `images/letters/${pic}.svg`;

// A card's picture on its back (renderCard, presentEntry): only the Alphabet's have one.
function showPic(img, card) {
  img.hidden = !card?.pic;
  if (!card?.pic) return;
  img.src = picSrc(card.pic);
  img.alt = (card.english.split(' — ')[1] || '').replace(/ \(.*\)$/, '');
}

// A letter's facts, from its card: the sound it starts a syllable with and ends one with (its note
// says "Final: -k", "Never a final", or "No longer used"), its class, and whether it's obsolete.
function letterFacts(c) {
  const [sound, word] = c.english.split(' — ');
  const final = c.note?.match(/Final: (-[a-zʔ]+)/)?.[1] || null;
  const obsolete = /No longer used/.test(c.note || '');
  const cls = consonantClass(c.thai);
  return { sound, word: word?.replace(/ \(obsolete\)$/, ''), final, obsolete, cls };
}

function renderAlphabet() {
  const set = alphaSetNow();
  const byClass = !!getPreferences().alphaClasses;
  els.alphaHint.textContent = ALPHA_SETS[set].hint;
  els.alphaClasses.hidden = set !== 'consonants';
  els.alphaClasses.setAttribute('aria-pressed', byClass ? 'true' : 'false');
  els.alphaLegend.hidden = set !== 'consonants' || !byClass;
  els.alphaGrid.hidden = set !== 'consonants';
  els.alphaVowels.hidden = set !== 'vowels';
  els.alphaTones.hidden = set !== 'tones';
  els.alphaGrid.classList.toggle('by-class', byClass);
  if (set === 'vowels') {
    if (!els.alphaVowels.childElementCount) renderVowelGrid();
    sizeTiles(els.alphaVowels);
  }
  if (set === 'tones' && !els.alphaTones.childElementCount) renderTonesPage();
  if (set !== 'consonants' || els.alphaGrid.childElementCount) return; // drawn once
  els.alphaGrid.replaceChildren(...alphaCards.map((c) => {
    const f = letterFacts(c);
    const b = document.createElement('button');
    b.type = 'button';
    b.className = `dict-letter cls-${CLASS_NAMES[f.cls] || 'mid'}` + (f.obsolete ? ' obsolete' : '');
    b.lang = 'th';
    b.textContent = c.thai;
    b.title = `${c.thai} ${c.say?.split(' ')[1] || ''}: ${c.english}`;
    b.addEventListener('click', () => showLetterPop(b, c));
    return b;
  }));
}

// Small tappable chips in a dialog's facts (other letters, a vowel's partner): each opens its own.
function chipRow(items, label, onPick, cls = () => '') {
  const box = document.createElement('div');
  box.className = 'letter-chips';
  for (const item of items) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = `letter-chip ${cls(item)}`;
    b.lang = 'th';
    b.textContent = item.thai;
    b.title = label(item);
    b.addEventListener('click', () => onPick(item));
    box.append(b);
  }
  return box;
}

// Opens the word dialog's frame on these contents (the letter, vowel, tone and mark dialogs).
function openPop(anchor, tr, en, parts) {
  if (state.storyReading.active) pauseReadStories();
  popAnchor?.classList.remove('on');
  popAnchor = anchor;
  anchor?.classList.add('on');
  els.wordModalTr.textContent = tr;
  els.wordModalEn.textContent = en;
  els.wordModalBody.replaceChildren(...parts);
  if (!wordPop) wordPop = { lastFocus: document.activeElement };
  els.wordModal.hidden = false;
  setModalOpen(true);
  els.wordModalBody.scrollTop = 0;
  els.wordModalClose.focus({ preventScroll: true });
}

function factList() {
  const dl = document.createElement('dl');
  dl.className = 'letter-facts';
  dl.add = (label, ...value) => {
    const dd = document.createElement('dd');
    dd.append(...value);
    dl.append(Object.assign(document.createElement('dt'), { textContent: label }), dd);
  };
  return dl;
}

function playButton(say, title) {
  const actions = document.createElement('div');
  actions.className = 'pop-actions';
  const play = document.createElement('button');
  play.type = 'button';
  play.className = 'row-speak' + (sayingNow(say) ? ' playing' : '');
  play.dataset.say = say;
  play.title = title;
  play.setAttribute('aria-label', title);
  play.append(speakerIcon());
  play.addEventListener('click', () => speakerPress(play, say));
  actions.append(play);
  return actions;
}

// ---------- the Alphabet's vowels ----------

// The grid's groups: short and long pairs, then the four with a final built in, and ฤ ฤๅ.
const VOWEL_GROUPS = [['อะ', 'อา'], ['อิ', 'อี'], ['อึ', 'อือ'], ['อุ', 'อู'], ['เอะ', 'เอ'], ['แอะ', 'แอ'], ['โอะ', 'โอ'],
  ['เอาะ', 'ออ'], ['เออะ', 'เออ'], ['เอียะ', 'เอีย'], ['เอือะ', 'เอือ'], ['อัวะ', 'อัว'], ['อำ', 'ใอ', 'ไอ', 'เอา'], ['ฤ', 'ฤๅ']];
const VOWEL_LIVE_SHORT = new Set(['อำ', 'ใอ', 'ไอ', 'เอา']); // short, but ending in -m, -i, -o: live
const vowelShort = (v) => v.endsWith('ะ') || ['อิ', 'อึ', 'อุ', 'ฤ'].includes(v) || VOWEL_LIVE_SHORT.has(v);
// The marks a vowel is written with (Vowel Symbol Names' names). ◌ึ: only the part that's sure.
const VOWEL_PART_NAMES = {
  'ะ': ['วิสรรชนีย์'], 'ั': ['ไม้หันอากาศ'], '็': ['ไม้ไต่คู้'], 'า': ['ลากข้าง'], 'ำ': ['หยาดน้ำค้าง', 'ลากข้าง'],
  'ิ': ['พินทุ์อิ'], 'ี': ['พินทุ์อิ', 'ฝนทอง'], 'ึ': ['พินทุ์อิ'], 'ื': ['พินทุ์อิ', 'ฟันหนู'], 'ุ': ['ตีนเหยียด'], 'ู': ['ตีนคู้'],
  'เ': ['ไม้หน้า'], 'แ': ['ไม้หน้า', 'ไม้หน้า'], 'ใ': ['ไม้ม้วน'], 'ไ': ['ไม้มลาย'], 'โ': ['ไม้โอ'],
  'อ': ['ตัวออ'], 'ย': ['ตัวยอ'], 'ว': ['ตัววอ'],
};
function vowelParts(v) {
  if (v === 'ฤ') return ['ตัวรึ'];
  if (v === 'ฤๅ') return ['ตัวรือ'];
  return [...v.replace('อ', '')].flatMap((ch) => VOWEL_PART_NAMES[ch] || []); // the first อ only holds the place
}
// A mark's name -> how it's drawn (Vowel Symbol Names' cards: ◌า for ลากข้าง).
let markGlyphs = null;
const markGlyph = (name) => {
  markGlyphs ||= new Map((state.decks.find((d) => d.id === 'script-vowel-names')?.cards || []).map((c) => [c.say, c.thai]));
  return markGlyphs.get(name) || { ตัวรึ: 'ฤ', ตัวรือ: 'ฤๅ' }[name] || '';
};

function renderVowelGrid() {
  const byThai = new Map(alphaSets.vowels.cards.map((c) => [c.thai, c]));
  const placed = new Set(VOWEL_GROUPS.flat());
  const groups = [...VOWEL_GROUPS, alphaSets.vowels.cards.map((c) => c.thai).filter((v) => !placed.has(v))].filter((g) => g.length);
  els.alphaVowels.replaceChildren(...groups.map((group) => {
    const g = document.createElement('div');
    g.className = 'letter-group';
    for (const v of group) {
      const c = byThai.get(v);
      if (!c) continue;
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'dict-letter letter-tile';
      b.lang = 'th';
      b.textContent = v;
      b.title = `${c.translit}: ${c.english}`;
      b.addEventListener('click', () => showVowelPop(b, c));
      g.append(b);
    }
    return g;
  }));
}

// A vowel's dialog: the vowel large (tap: its sound), its sound and length, its partner, the marks
// it's written with (each says its name), live or dead, and its note.
function showVowelPop(anchor, c) {
  speak(cardSay(c));
  const short = vowelShort(c.thai);
  const big = document.createElement('button');
  big.type = 'button';
  big.className = 'letter-big' + ([...c.thai].length > 2 ? ' wide' : '');
  big.lang = 'th';
  big.textContent = c.thai;
  big.title = `Say ${c.thai}`;
  big.addEventListener('click', () => speak(cardSay(c)));
  const hero = Object.assign(document.createElement('div'), { className: 'letter-hero' });
  hero.append(big);
  const facts = factList();
  facts.add('Sound', `${c.english.split(' — ')[0]}, ${short ? 'short' : 'long'}`);
  const group = VOWEL_GROUPS.find((g) => g.includes(c.thai)) || [];
  const mates = alphaSets.vowels.cards.filter((o) => o !== c && group.includes(o.thai));
  const sameSound = mates.filter((o) => ['ใอ', 'ไอ'].includes(o.thai) && ['ใอ', 'ไอ'].includes(c.thai));
  const partner = group.length === 2 ? mates : [];
  if (partner.length) facts.add(short ? 'Long partner' : 'Short partner', chipRow(partner, (o) => `${o.thai}: ${o.english}`, (o) => showVowelPop(null, o)));
  if (sameSound.length) facts.add('Same sound', chipRow(sameSound, (o) => `${o.thai}: ${o.english}`, (o) => showVowelPop(null, o)));
  const parts = vowelParts(c.thai);
  if (parts.length) {
    const box = Object.assign(document.createElement('div'), { className: 'letter-chips' });
    for (let i = 0; i < parts.length; i++) {
      const name = parts[i];
      const twice = parts[i + 1] === name;
      if (twice) i += 1;
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'mark-chip';
      b.append(Object.assign(document.createElement('span'), { className: 'mark-glyph', lang: 'th', textContent: markGlyph(name) }),
        Object.assign(document.createElement('span'), { lang: 'th', textContent: name + (twice ? ' ×2' : '') }));
      b.title = `Say ${name}`;
      b.addEventListener('click', () => speak(name));
      box.append(b);
    }
    facts.add('Written with', box);
  }
  facts.add('Syllable', short && !VOWEL_LIVE_SHORT.has(c.thai) ? 'Dead when nothing follows (a short vowel)' : 'Live');
  const items = [hero, playButton(cardSay(c), `Play ${c.thai}`), facts];
  if (c.note) items.push(noteText(Object.assign(document.createElement('p'), { className: 'letter-note' }), c.note));
  openPop(anchor, c.translit, c.english, items);
}

// ---------- the Alphabet's tones ----------

const TONE_ORDER = ['mid', 'low', 'falling', 'high', 'rising'];
const cap = (s) => s[0].toUpperCase() + s.slice(1);
// The tone chart: a row a mark (or none, or a dead syllable), a column a class (tableTone gives the
// tone). The syllables are Tone Chants'; ๊ and ๋ go on mid class only.
const TONE_CHART = [
  ['live', 'No mark', ['กา', 'ขา', 'คา']],
  ['่', 'ไม้เอก', ['ก่า', 'ข่า', 'ค่า']],
  ['้', 'ไม้โท', ['ก้า', 'ข้า', 'ค้า']],
  ['๊', 'ไม้ตรี', ['ก๊า', null, null]],
  ['๋', 'ไม้จัตวา', ['ก๋า', null, null]],
  ['deadShort', 'Dead, short', ['กัด', 'ขัด', 'คัด']],
  ['deadLong', 'Dead, long', ['ตาก', 'ถาก', 'ทาก']],
];
const CHART_CLASSES = ['M', 'H', 'L'];
const fiveTones = () => state.decks.find((d) => d.id === 'script-five-tones')?.cards || [];
const toneMarkCards = () => (state.decks.find((d) => d.id === 'script-marks')?.cards || []).filter((c) => '่้๊๋'.includes(c.thai.replace('◌', '')) && c.thai.length === 2);
// The Five Tones' card for a tone: its example word and description.
const toneCard = (tone) => fiveTones().find((c) => c.english.startsWith(`${tone} tone`));

function chartCell(syl, cls, column) {
  if (!syl) return Object.assign(document.createElement('td'), { className: 'tone-none', textContent: '—' });
  const tone = tableTone(cls, column);
  const td = document.createElement('td');
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'tone-cell' + (sayingNow(syl) ? ' playing' : '');
  b.dataset.say = syl;
  b.title = `${syl}: ${tone} tone`;
  b.append(Object.assign(document.createElement('span'), { className: 'cell-th', lang: 'th', textContent: syl }),
    Object.assign(document.createElement('span'), { className: `cell-tone tone-${tone}`, textContent: tone }));
  b.addEventListener('click', () => speakerPress(b, syl));
  td.append(b);
  return td;
}

function renderTonesPage() {
  const head = (text) => Object.assign(document.createElement('p'), { className: 'alpha-tones-head', textContent: text });
  const tones = Object.assign(document.createElement('div'), { className: 'tone-tiles' });
  for (const tone of TONE_ORDER) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'tone-tile';
    b.append(toneCurve(tone), Object.assign(document.createElement('b'), { className: `tone-${tone}`, textContent: cap(tone) }),
      Object.assign(document.createElement('span'), { lang: 'th', textContent: TONE_THAI[tone].replace('เสียง', '') }));
    b.addEventListener('click', () => showTonePop(b, tone));
    tones.append(b);
  }
  const marks = Object.assign(document.createElement('div'), { className: 'mark-tiles' });
  for (const c of toneMarkCards()) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'mark-tile';
    b.append(Object.assign(document.createElement('span'), { className: 'mark-glyph', lang: 'th', textContent: c.thai }),
      Object.assign(document.createElement('b'), { lang: 'th', textContent: c.say || '' }));
    b.addEventListener('click', () => showMarkPop(b, c));
    marks.append(b);
  }
  const table = document.createElement('table');
  table.className = 'tone-chart';
  const thead = document.createElement('thead');
  const hr = document.createElement('tr');
  hr.append(document.createElement('th'), ...CHART_CLASSES.map((cls) => Object.assign(document.createElement('th'), { className: `cls-${CLASS_NAMES[cls]}`, textContent: cap(CLASS_NAMES[cls]) })));
  thead.append(hr);
  const tbody = document.createElement('tbody');
  for (const [column, label, syls] of TONE_CHART) {
    const tr = document.createElement('tr');
    const th = document.createElement('th');
    th.scope = 'row';
    const glyph = column.length === 1 ? `◌${column}` : '';
    if (glyph) th.append(Object.assign(document.createElement('span'), { className: 'mark-glyph', lang: 'th', textContent: glyph }), ' ');
    th.append(Object.assign(document.createElement('span'), { lang: glyph ? 'th' : undefined, textContent: label }));
    tr.append(th, ...syls.map((syl, i) => chartCell(syl, CHART_CLASSES[i], column)));
    tbody.append(tr);
  }
  table.append(thead, tbody);
  const note = Object.assign(document.createElement('p'), { className: 'alpha-tones-note' });
  note.textContent = 'A syllable is dead when its vowel is short with no final, or it ends in -k, -t or -p; otherwise it is live. ไม้ตรี and ไม้จัตวา go on mid-class letters only.';
  els.alphaTones.replaceChildren(head('The five tones'), tones, head('The tone marks'), marks, head('The tone chart: class and mark'), table, note);
}

// A tone's dialog: its curve, its Thai name, how it sounds (The Five Tones), what gives it in the
// chart, and the Read the Tone syllables with it.
function showTonePop(anchor, tone) {
  const card = toneCard(tone);
  if (card) speak(cardSay(card));
  const curve = toneCurve(tone);
  curve.classList.add('tone-big');
  const items = [curve];
  if (card) items.push(playButton(cardSay(card), `Play ${card.thai}`));
  const facts = factList();
  if (card) facts.add('Example', Object.assign(document.createElement('span'), { lang: 'th', textContent: card.thai }), ` ${card.translit}`);
  const how = Object.assign(document.createElement('div'), { className: 'letter-chips' });
  for (const [column, label, syls] of TONE_CHART) {
    syls.forEach((syl, i) => {
      if (!syl || tableTone(CHART_CLASSES[i], column) !== tone) return;
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'mark-chip';
      b.title = `${cap(CLASS_NAMES[CHART_CLASSES[i]])} class, ${label}`;
      // "mid + ไม้โท", or "low, dead, long"
      const how1 = document.createElement('span');
      how1.append(`${CLASS_NAMES[CHART_CLASSES[i]]}${column.length === 1 ? ' + ' : `, ${label.toLowerCase()}`}`);
      if (column.length === 1) how1.append(Object.assign(document.createElement('span'), { lang: 'th', textContent: label }));
      b.append(Object.assign(document.createElement('span'), { className: 'mark-glyph', lang: 'th', textContent: syl }), how1);
      b.addEventListener('click', () => speak(syl));
      how.append(b);
    });
  }
  facts.add('Made by', how);
  const words = alphaSets.tones.cards.filter((c) => toneOfTranslit(c.translit) === tone);
  if (words.length) facts.add('Words', chipRow(words, (w) => `${w.thai}: ${w.english}`, (w) => speak(cardSay(w))));
  items.push(facts);
  if (card?.note) items.push(noteText(Object.assign(document.createElement('p'), { className: 'letter-note' }), card.note));
  openPop(anchor, TONE_THAI[tone], card ? card.english : `${tone} tone`, items);
}

// A tone mark's dialog: the mark large (tap: its name), and the tone it gives each class.
function showMarkPop(anchor, c) {
  speak(cardSay(c));
  const mark = c.thai.replace('◌', '');
  const big = document.createElement('button');
  big.type = 'button';
  big.className = 'letter-big';
  big.lang = 'th';
  big.textContent = c.thai;
  big.title = `Say ${c.say || ''}`;
  big.addEventListener('click', () => speak(cardSay(c)));
  const hero = Object.assign(document.createElement('div'), { className: 'letter-hero' });
  hero.append(big);
  const facts = factList();
  const row = TONE_CHART.find(([column]) => column === mark);
  CHART_CLASSES.forEach((cls, i) => {
    const tone = tableTone(cls, mark);
    const syl = row?.[2][i];
    const value = document.createElement('span');
    if (!tone) value.textContent = 'not used';
    else {
      value.append(Object.assign(document.createElement('span'), { className: `tone-${tone}`, textContent: `${tone} tone` }));
      if (syl) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'mark-chip';
        b.style.marginLeft = '10px';
        b.append(Object.assign(document.createElement('span'), { className: 'mark-glyph', lang: 'th', textContent: syl }));
        b.title = `Say ${syl}`;
        b.addEventListener('click', () => speak(syl));
        value.append(b);
      }
    }
    facts.add(`${cap(CLASS_NAMES[cls])} class`, value);
  });
  const items = [hero, playButton(cardSay(c), `Play ${c.say || c.thai}`), facts];
  if (c.note) items.push(noteText(Object.assign(document.createElement('p'), { className: 'letter-note' }), c.note));
  openPop(anchor, c.translit, c.english, items);
}

// The letter's dialog, in the word dialog's frame (so closing, Escape and the backdrop are its):
// the letter, large (tap: its name), its picture, its class, sound, letters with the same sound
// and letters it looks like (each opens that letter's), its note, and a few words that start with it.
function showLetterPop(anchor, c) {
  if (state.storyReading.active) pauseReadStories();
  speak(cardSay(c));
  popAnchor?.classList.remove('on');
  popAnchor = anchor;
  anchor?.classList.add('on');
  const f = letterFacts(c);
  els.wordModalTr.textContent = c.translit;
  els.wordModalEn.textContent = c.english;
  const hero = document.createElement('div');
  hero.className = 'letter-hero';
  const big = document.createElement('button');
  big.type = 'button';
  big.className = 'letter-big';
  big.lang = 'th';
  big.textContent = c.thai;
  big.title = `Say ${c.say || c.thai}`;
  big.addEventListener('click', () => speak(cardSay(c)));
  hero.append(big);
  if (c.pic) {
    const img = document.createElement('img');
    img.className = 'letter-pic';
    img.src = picSrc(c.pic);
    img.alt = f.word || '';
    hero.append(img);
  }
  const actions = document.createElement('div');
  actions.className = 'pop-actions';
  const play = document.createElement('button');
  play.type = 'button';
  play.className = 'row-speak' + (sayingNow(cardSay(c)) ? ' playing' : '');
  play.dataset.say = cardSay(c);
  play.title = `Play ${c.say || c.thai}`;
  play.setAttribute('aria-label', play.title);
  play.append(speakerIcon());
  play.addEventListener('click', () => speakerPress(play, cardSay(c)));
  actions.append(play);

  const facts = document.createElement('dl');
  facts.className = 'letter-facts';
  const fact = (label, ...value) => {
    const dd = document.createElement('dd');
    dd.append(...value);
    facts.append(Object.assign(document.createElement('dt'), { textContent: label }), dd);
  };
  const chips = (letters) => {
    const box = document.createElement('div');
    box.className = 'letter-chips';
    for (const other of letters) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = `letter-chip cls-${CLASS_NAMES[consonantClass(other.thai)] || 'mid'}`;
      b.lang = 'th';
      b.textContent = other.thai;
      b.title = `${other.thai}: ${other.english}`;
      b.addEventListener('click', () => showLetterPop(null, other));
      box.append(b);
    }
    return box;
  };
  fact('Name', Object.assign(document.createElement('span'), { lang: 'th', textContent: c.say || c.thai }), ` ${c.translit}`);
  const clsName = CLASS_NAMES[f.cls];
  if (clsName) fact('Class', Object.assign(document.createElement('span'), { className: `cls-${clsName}`, textContent: `● ${clsName[0].toUpperCase()}${clsName.slice(1)}` }));
  fact('Sound', f.obsolete ? 'No longer used' : /silent/.test(f.sound) ? 'Silent: it carries a vowel'
    : `${f.sound} at the start; ${f.final ? `${f.final} at the end` : 'never at the end'}`);
  const same = alphaCards.filter((o) => o !== c && !/silent/.test(f.sound) && o.english.split(' — ')[0] === f.sound);
  if (same.length) fact('Same sound', chips(same));
  const looks = state.decks.find((d) => d.id === 'script-lookalikes')?.board?.groups?.find((g) => g.includes(c.thai)) || [];
  const alike = alphaCards.filter((o) => o !== c && looks.includes(o.thai));
  if (alike.length) fact('Looks like', chips(alike));

  const parts = [hero, actions, facts];
  if (c.note) parts.push(noteText(Object.assign(document.createElement('p'), { className: 'letter-note' }), c.note));
  // A few words that start with it, the most widely used first (by how many topics have them).
  buildDictionary();
  const words = dictEntries.filter((e) => e.first === c.thai);
  if (words.length) {
    const reach = (e) => state.cardIndex.get(e.key)?.deckIds.length || 0;
    const top = [...words].sort((x, y) => reach(y) - reach(x) || x.thai.length - y.thai.length).slice(0, 5);
    parts.push(Object.assign(document.createElement('p'), { className: 'letter-words-head', textContent: `Words that start with ${c.thai}` }));
    for (const w of top) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'letter-word';
      b.append(Object.assign(document.createElement('span'), { className: 'letter-word-th', lang: 'th', textContent: w.thai }),
        Object.assign(document.createElement('span'), { className: 'letter-word-en', textContent: w.english }));
      b.addEventListener('click', () => showWordPop(null, w));
      parts.push(b);
    }
    const all = document.createElement('button');
    all.type = 'button';
    all.className = 'ghost letter-all';
    all.textContent = `All ${words.length} in Words ›`;
    all.addEventListener('click', () => {
      hideWordPop();
      state.dictLetter = c.thai;
      state.dictQuery = '';
      setView('dictionary');
      window.scrollTo(0, 0);
    });
    parts.push(all);
  }
  els.wordModalBody.replaceChildren(...parts);
  if (!wordPop) wordPop = { lastFocus: document.activeElement };
  els.wordModal.hidden = false;
  setModalOpen(true);
  els.wordModalBody.scrollTop = 0;
  els.wordModalClose.focus({ preventScroll: true });
}

// Whose cards the Cards engine holds. The words' and the Alphabet's each keep theirs (place, mode,
// direction, Recall stream) while the other's are in; the Alphabet's start afresh on its first
// visit, in its own saved mode and direction (prefs.alphaOrderMode, alphaDirection).
const ENGINE_STATE = ['cards', 'flashScopeId', 'queue', 'pos', 'showingBack', 'orderMode', 'direction', 'relearn', 'carry', 'modeSnap', 'learnAnswers', 'review', 'reviewOnlySig'];
const sectionEngines = {};
function useSection(section) {
  if (state.section === section) return;
  sectionEngines[state.section] = Object.fromEntries(ENGINE_STATE.map((k) => [k, state[k]]));
  state.section = section;
  els.stage.dataset.section = section;
  const saved = sectionEngines[section];
  if (saved) {
    Object.assign(state, saved);
  } else {
    const p = getPreferences();
    Object.assign(state, {
      orderMode: ['practice', 'test', 'review'].includes(p.alphaOrderMode) ? p.alphaOrderMode : 'practice',
      direction: ['th-en', 'en-th', 'listen'].includes(p.alphaDirection) ? p.alphaDirection : 'th-en',
      cards: [], queue: [], pos: 0, showingBack: false, flashScopeId: null, relearn: new Map(), carry: [],
      modeSnap: { practice: null, test: null }, learnAnswers: new Map(), review: null, reviewOnlySig: '',
    });
  }
  els.stage.dataset.order = state.orderMode;
  els.orderButtons.forEach((b) => b.setAttribute('aria-checked', b.dataset.order === state.orderMode ? 'true' : 'false'));
  els.directionButtons.forEach((b) => b.setAttribute('aria-checked', b.dataset.direction === state.direction ? 'true' : 'false'));
  if (saved) {
    if (state.orderMode !== 'review') renderCard();
  } else {
    reloadFlashcards();
  }
  renderToday();
}

// ---------- the phone's More list ----------

// More, the phone's last tab, lists the pages without a tab of their own (Words, Settings; the
// user's call, 2026-10-14, so new pages fit). Its tab is lit while one of them shows (markMore).
const MORE_VIEWS = new Set([...document.querySelectorAll('.more-item[data-view]')].map((b) => b.dataset.view));

function openMore() {
  state.moreOpen = true;
  els.moreMenu.hidden = false;
  document.documentElement.classList.add('more-open');
  els.tabMore.setAttribute('aria-expanded', 'true');
  markMore();
  if (!TOUCH_SCREEN) els.moreItems[0].focus();
}

function closeMore(refocus = false) {
  if (!state.moreOpen) return;
  state.moreOpen = false;
  els.moreMenu.hidden = true;
  document.documentElement.classList.remove('more-open');
  els.tabMore.setAttribute('aria-expanded', 'false');
  if (refocus) els.tabMore.focus();
}

function markMore() {
  const here = state.settingsOpen ? 'settings' : pageNow();
  els.tabMore.classList.toggle('current', MORE_VIEWS.has(pageNow()));
  for (const b of els.moreItems) {
    if ((b.dataset.view || b.dataset.action) === here) b.setAttribute('aria-current', 'page');
    else b.removeAttribute('aria-current');
  }
}

function pickMore(b) {
  closeMore();
  if (b.dataset.action === 'settings') {
    if (state.settingsOpen) return;
    els.tabMore.focus({ preventScroll: true }); // where focus returns when Settings closes
    openSettings();
    return;
  }
  if (state.settingsOpen) closeSettings();
  goTo(b.dataset.view);
}

// The page a tab or More's row names: the Alphabet opens on whichever of its pages you were last on.
function goTo(view) {
  if (view === 'alphabet' && getPreferences().alphaPage === 'cards') setView('flashcards', { section: 'alphabet' });
  else setView(view);
}

// Which tab's page is showing: the Alphabet's Cards page is the Alphabet's.
const pageNow = () => (state.section === 'alphabet' ? 'alphabet' : state.view);

// ---------- view switching ----------

// `section`: on Cards, whose cards: the words', or the Alphabet's (its Cards page). Anywhere else the
// engine holds the words' (useSection).
function setView(view, { section = 'words' } = {}) {
  const leaving = state.view;
  const leavingSection = state.section;
  if (view !== 'flashcards') section = 'words';
  const wasCards = leaving === 'flashcards';
  // Leaving a Cards page (Flashcards, or the Alphabet's): Recall's audio stops, and a Recognition
  // card's pending move waits for the return (below).
  if (wasCards && (view !== 'flashcards' || section !== leavingSection)) {
    if (state.review) stopAudio();
    state.answerSeq += 1;
  }
  useSection(section);
  toggleAlphaSets(false);
  const entering = view === 'flashcards' && (!wasCards || section !== leavingSection);
  state.view = view;
  els.stage.dataset.view = view;
  const page = pageNow();
  els.tabs.forEach((t) => {
    t.setAttribute('aria-selected', t.dataset.view === page ? 'true' : 'false');
  });
  markMore();
  els.alphaSection.hidden = view !== 'alphabet';
  if (view === 'alphabet') renderAlphabet();
  els.alphaPageButtons.forEach((b) => b.setAttribute('aria-checked', b.dataset.alphaPage === (view === 'alphabet' ? 'letters' : 'cards') ? 'true' : 'false'));
  els.wordlistSection.hidden = view !== 'wordlist';
  if (view === 'wordlist') sizeLetterTiles(); // a board drawn while Topics was hidden had nothing to measure
  els.readingSection.hidden = view !== 'reading';
  els.dictSection.hidden = view !== 'dictionary';
  if (view === 'dictionary') renderDictionary();
  if (view === 'reading') renderReading();
  else hideWordPop();
  if (view !== 'wordlist' && state.reading.active) stopReadAloud();
  if (view !== 'reading' && storyRunOn()) stopReadStories();
  renderDeckButton(); // Flashcards' button can say Everything
  if (view === 'flashcards') fitCardText(); // laid out only now if the card was hidden
  // Words added to or taken out of Review elsewhere (Wordlists, Review) apply on coming back.
  if (entering && state.flashScopeId && reviewOnlySignature() !== state.reviewOnlySig) {
    rebuildCurrentQueue();
    renderReviewOnly();
  }
  // Flashcards reopens in the mode you left, where you left it (the user's request, 2026-10-08;
  // that morning it always opened on Browse and leaving ended the streams). Direction is kept too
  // (prefs, like the mode).
  if (entering) {
    if (state.orderMode === 'review') enterReview(); // Recall's stream: its card, or a new stream
    if (state.orderMode === 'test') {
      const c = currentCard();
      if (c && state.learnAnswers.has(c.key)) advance(); // answered (and saved) just before leaving
    }
  }
  setPreferences({ view, section });
}

// ---------- settings UI ----------

// Text size steps -> multiplier for the --fs CSS variable, which scales content text
// (cards, wordlist, deck picker, settings) but not the app chrome.
const TEXT_SCALES = { '-2': 0.8, '-1': 0.9, 0: 1, 1: 1.15, 2: 1.3 };

function applyTextSize() {
  document.documentElement.style.setProperty('--fs', TEXT_SCALES[getSettings().textSize] ?? 1);
  if (els.thai) fitCardText();
  if (els.wordlistLetterGrid) sizeLetterTiles();
}

// The colour theme: data-theme on <html> picks a palette in styles.css (dark is the default, with
// no attribute). The status-bar colour (meta theme-color) follows the page. index.html applies the
// saved theme before first paint. Anything else saved (Dim, Sepia and "Match device" were removed)
// shows as Dark.
const THEMES = ['dark', 'charcoal', 'light', 'night', 'black'];
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
  els.aboutRecordings.textContent = recordingsText();
  els.setThaiSpeed.value = String(s.thaiSpeed);
  els.setSpelling.value = s.spellingStyle;
  els.setTheme.value = THEMES.includes(s.theme) ? s.theme : 'dark';
  els.setThaiFont.value = s.thaiFont === 'loopless' ? 'loopless' : 'looped';
  els.setTextSize.value = String(s.textSize);
  els.setWordlistFirst.value = s.wordlistFirst;
  els.setTopicWordGaps.checked = !!s.topicWordGaps;
  els.setReadStoryTitles.checked = s.readStoryTitles !== false;
  els.setReadStoriesLoop.checked = s.readStoriesLoop !== false;
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
  els.setReadStoryTitles.addEventListener('change', () => setSettings({ readStoryTitles: els.setReadStoryTitles.checked }));
  els.setReadStoriesLoop.addEventListener('change', () => setSettings({ readStoriesLoop: els.setReadStoriesLoop.checked }));
  els.setTopicWordGaps.addEventListener('change', () => {
    setSettings({ topicWordGaps: els.setTopicWordGaps.checked });
    els.wordtable.classList.toggle('show-spaces', els.setTopicWordGaps.checked);
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
    if (c) speak(cardSay(c));
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

  // A list with none left goes, and its heading.
  for (const list of els.settingsSection.querySelectorAll('.setting-list')) {
    const empty = !list.querySelector('.setting-group:not(.search-hidden)');
    list.classList.toggle('search-hidden', empty);
    const head = list.previousElementSibling;
    if (head?.classList.contains('setting-list-head')) head.classList.toggle('search-hidden', empty);
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
  setPreferences({ [state.section === 'alphabet' ? 'alphaOrderMode' : 'orderMode']: mode });
  if (leaving === 'review') stopAudio(); // Recall's stream itself stays in state.review
  if (mode === 'review') {
    enterReview();
  } else {
    if (leaving === 'review') loadCards(); // Recall's grades, for the cards' progress
    restoreMode(mode);
  }
  fitCardText(); // the card's height: each mode has its own buttons under it
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
  setPreferences({ [state.section === 'alphabet' ? 'alphaDirection' : 'direction']: direction });
  // Each direction has its own progress, so re-read it; every mode starts afresh.
  loadCards();
  if (state.review) stopAudio();
  discardModes();
  rebuildCurrentQueue();
  enterReview();
}

// ---------- wordlist ----------

// A topic's tiles to tap and hear, under its text (2026-10-12, the user's requests): its `board` in
// decks.json, with a `hint` line over them and either
// - `tiles`: square tiles in a grid, as on the Words page (Alphabet in Order), or
// - `groups`: tiles in groups, a group kept on one line: short/long vowel pairs, sound and tone
//   pairs, tone chants, letters that sound or look alike. `letters`: the tiles are single letters,
//   square and large.
// A tile plays its Thai's sound (gen_audio records any that isn't a card's): a letter says its name,
// as its card does (ก: กอ ไก่). It's lit while it plays (markSpeakers), so Read all lights them too.
function renderLetterBoard(deck) {
  const topic = deck.kind === 'topic' && deck.decks[0].board ? deck.decks[0] : null;
  els.wordlistLetters.hidden = !topic;
  if (topic && els.wordlistLetterGrid.dataset.topic === topic.id) sizeLetterTiles();
  if (!topic || els.wordlistLetterGrid.dataset.topic === topic.id) return;
  const { hint, tiles, groups, letters } = topic.board;
  els.wordlistLetterGrid.dataset.topic = topic.id;
  els.wordlistLettersHint.textContent = hint || '';
  els.wordlistLetterGrid.className = groups ? 'letter-groups' + (letters ? ' letters' : '') : 'dict-grid';
  const tile = (thai) => {
    const card = topic.cards.find((c) => c.thai === thai);
    const say = card ? cardSay(card) : thai;
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'dict-letter letter-tile' + (sayingNow(say) ? ' playing' : '');
    b.lang = 'th';
    b.textContent = thai;
    b.dataset.say = say;
    if (card) b.title = `${card.translit}: ${card.english}`;
    b.setAttribute('aria-label', card ? `${thai}, ${card.translit}` : thai);
    b.addEventListener('click', () => speakerPress(b, say));
    return b;
  };
  els.wordlistLetterGrid.replaceChildren(...(groups
    ? groups.map((group) => {
      const g = document.createElement('div');
      g.className = 'letter-group';
      g.append(...group.map(tile));
      return g;
    })
    : tiles.map(tile)));
  sizeLetterTiles();
}

// Grouped tiles all take the widest one's width (เออะ is wider than อะ), so the columns line up
// when the rows are centred (2026-10-13, the user's call). Measured with the tiles at their own
// width, again when the fonts arrive, the window resizes or the text size changes.
function sizeLetterTiles() {
  sizeTiles(els.wordlistLetterGrid);
  if (els.alphaVowels) sizeTiles(els.alphaVowels);
}

function sizeTiles(grid) {
  if (!grid.classList.contains('letter-groups') || grid.classList.contains('letters') || !grid.offsetParent) return;
  grid.style.removeProperty('--tile-w');
  grid.classList.remove('tight');
  const widest = Math.ceil(Math.max(...[...grid.querySelectorAll('.letter-tile')].map((t) => t.getBoundingClientRect().width)));
  if (!(widest > 0)) return;
  // No wider than lets the biggest group fit the width (Final Sound Families' five, with เกอว, on a
  // phone); then the tiles' side padding shrinks (.tight) so the widest word still fits.
  const most = Math.max(...[...grid.children].map((g) => g.childElementCount));
  const gap = parseFloat(getComputedStyle(grid.firstElementChild).columnGap) || 0;
  const room = Math.floor((grid.clientWidth - (most - 1) * gap) / most);
  grid.style.setProperty('--tile-w', `${Math.min(widest, room)}px`);
  grid.classList.toggle('tight', room < widest);
}

// The word tables' columns (the Topics page, the Dictionary): the chosen first (Settings → Topics →
// Show first), then the other two in fixed order.
const COL_META = {
  thai:     { label: 'Thai',           cls: 'col-thai' },
  translit: { label: 'Transliteration', cls: 'col-translit' },
  english:  { label: 'English',        cls: 'col-english' },
};
function wordlistColumns() {
  const first = getSettings().wordlistFirst === 'english' ? 'english' : 'thai';
  return [first, ...['thai', 'translit', 'english'].filter((k) => k !== first)];
}

function renderWordlist() {
  if (!state.currentDeckId) return;
  const deck = currentScope();
  if (!deck) return;
  // A phrase's words get gaps if Settings → Topics → "Word gaps in phrases" is on (off by default,
  // since Thai is written without them; the user's call, 2026-10-10). The reader has its own button.
  els.wordtable.classList.toggle('show-spaces', !!getSettings().topicWordGaps);
  // Several topics, in list order: a heading row before each topic's words.
  const topicHeadings = deck.decks.length > 1;
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
  renderLetterBoard(deck);
  const words = reviewWords();

  const rows = state.listCards; // in list order (the headings sorted the table until 2026-10-12)

  const cols = wordlistColumns();

  // Render header
  els.wordtableHead.innerHTML = '';
  const headRow = document.createElement('tr');
  for (const key of cols) {
    const th = document.createElement('th');
    th.textContent = COL_META[key].label;
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
      frag.appendChild(wordRow(c, cols, c.key in words));
    }
    els.wordtableBody.appendChild(frag);
  }

  const allIn = state.listCards.every((c) => c.key in words);
  // With the whole deck in Review, the button reads "✓ All in Review" and removes them all.
  els.wordlistAddAll.classList.toggle('all-in', allIn);
  if (allIn) {
    // Both labels share one grid cell, so hovering ("− Remove all") doesn't change the width.
    const label = (cls, text) => Object.assign(document.createElement('span'), { className: cls, textContent: text });
    els.wordlistAddAll.replaceChildren(label('label-idle', '✓ All in Cards'), label('label-hover', '− Remove all'));
  } else {
    els.wordlistAddAll.replaceChildren(reviewIcon(), 'Add all to Cards'); // "…to Review" until 2026-10-08
  }
  els.wordlistAddAll.title = allIn ? 'Remove all from Cards' : '';
}

// A word's row, as on the Topics page and in the Dictionary: its Thai (opening the word dialog; a
// phrase's words each open their own), transliteration and English (opening it too), the note under
// the English, and the add to Flashcards, spell and play buttons. `cols` is the column order
// (wordlistColumns); `added`, whether it's in Flashcards.
function wordRow(c, cols, added) {
  const tr = document.createElement('tr');
  tr.dataset.key = c.key;
  if (state.reading.active && state.reading.currentKey === c.key) {
    tr.classList.add('now-playing');
  }
  for (const key of cols) {
    const td = document.createElement('td');
    td.className = COL_META[key].cls;
    td.textContent = c[key];
    // The Thai opens the word pop-up, as a word in the reader does (2026-10-09, the user's request).
    // A phrase is split into its words, each opening its own pop-up (2026-10-10, the user's
    // request; phraseWords); the row's buttons still add, spell and play the whole phrase.
    const parts = key === 'thai' && phraseWords(c);
    if (parts) {
      td.textContent = '';
      td.classList.add('col-phrase');
      parts.forEach((w, i) => {
        // Between words (Thai writes none): a space that Settings → Topics → Word gaps shows.
        if (i) td.append(Object.assign(document.createElement('span'), { className: 'tw-gap', textContent: ' ' }));
        const span = Object.assign(document.createElement('span'), { className: 'tw', textContent: w.thai });
        span.tabIndex = 0;
        span.setAttribute('role', 'button');
        span.title = `Show ${w.thai}`;
        const open = (e) => {
          e.preventDefault();
          showWordPop(span, w);
        };
        span.addEventListener('click', open);
        span.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') open(e); });
        td.append(span);
      });
    } else if (key === 'thai') {
      td.tabIndex = 0;
      td.setAttribute('role', 'button');
      td.title = 'Show the word';
      const open = (e) => {
        e.preventDefault();
        showWordPop(td, c);
      };
      td.addEventListener('click', open);
      td.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') open(e); });
    }
    // The transliteration and English open the word dialog too, for the whole card (a phrase's
    // too; 2026-10-11, the user's request). Not tab stops: the Thai is the row's.
    if (key === 'translit' || key === 'english') {
      td.classList.add('opens-word');
      td.addEventListener('click', () => showWordPop(td, c));
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
  rv.title = added ? `Remove ${c.thai} from Cards` : `Add ${c.thai} to Cards`;
  rv.setAttribute('aria-label', rv.title);
  rv.addEventListener('click', () => {
    setInReview([c.key], !added);
    toast(added ? `Removed ${c.thai} from Cards` : `✓ Added ${c.thai} to Cards`, { tone: added ? '' : 'good' });
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
  btn.className = 'row-speak' + (sayingNow(cardSay(c)) ? ' playing' : '');
  btn.dataset.say = cardSay(c);
  btn.setAttribute('aria-label', 'Play audio');
  btn.append(speakerIcon());
  btn.addEventListener('click', () => speakerPress(btn, cardSay(c)));
  audioTd.appendChild(btn);
  tr.appendChild(audioTd);
  return tr;
}

// ---------- Dictionary (2026-10-12, the user's idea; an experiment) ----------

// Every word in the topics (not phrases, Thai Script's spelling examples, or the stories' copies), one row
// per card key, in Thai dictionary order (Intl.Collator 'th' files เ แ โ ใ ไ words under their
// consonant: เกิด under ก). The way in is a ก–ฮ grid with a search box above: a letter lists its
// words, and the search (wordSearch, as the topic picker's) lists its matches, both in a table like
// the Topics page's (wordRow), with its word dialog and buttons.
const DICT_LETTERS = 'กขฃคฅฆงจฉชซฌญฎฏฐฑฒณดตถทธนบปผฝพฟภมยรลวศษสหฬอฮ';
const DICT_SHOWN = 200; // search matches listed
let dictEntries = null;  // [card + { key, first }], sorted
let dictKeys = null;     // their keys, for wordSearch's filter

// The letter a word files under: its first consonant, past a leading vowel; ฤ and ฦ under ร and ล.
function dictLetterOf(thai) {
  const ch = thai.replace(/^[เแโใไ]/, '')[0];
  return ch === 'ฤ' ? 'ร' : ch === 'ฦ' ? 'ล' : ch;
}

// Words only, no phrases (the user's call, 2026-10-12): a phrase card lists its words (`words`, from
// the story builder), or is written with a space (ขอ … หน่อย, เร็ว ๆ นี้); a doubled word (จริง ๆ) stays.
// Compounds (ข้าวเหนียว, ห้องน้ำ) have no `words`, so they're words.
function isPhrase(c) {
  return c.words?.length > 1 || /\s/.test(c.thai.replace(/\s+ๆ/g, 'ๆ'));
}

function buildDictionary() {
  if (dictEntries) return;
  const seen = new Map();
  for (const d of state.decks) {
    if (d.passage || d.category === 'Thai Script') continue;
    for (const c of d.cards) {
      const key = cardKey(c);
      if (!seen.has(key) && /^[ก-ฮเ-ไฤฦ]/.test(c.thai) && !isPhrase(c)) seen.set(key, { ...c, key, first: dictLetterOf(c.thai) });
    }
  }
  const thaiOrder = new Intl.Collator('th');
  dictEntries = [...seen.values()].sort((a, b) => thaiOrder.compare(a.thai, b.thai) || a.english.localeCompare(b.english));
  dictKeys = new Set(seen.keys());
}

function renderDictionary() {
  buildDictionary();
  const q = state.dictQuery.trim();
  let rows = null;
  let heading = '';
  if (q) {
    const { hits, total } = wordSearch(q, { limit: DICT_SHOWN, keep: (w) => dictKeys.has(w.key) });
    const byKey = new Map(dictEntries.map((e) => [e.key, e]));
    rows = hits.map((h) => byKey.get(h.key));
    heading = total > hits.length ? `The first ${hits.length} of ${total} matches` : `${total} match${total === 1 ? '' : 'es'}`;
    els.dictBack.textContent = '✕ Clear search';
  } else if (state.dictLetter) {
    rows = dictEntries.filter((e) => e.first === state.dictLetter);
    const name = letterStep(state.dictLetter)?.show || state.dictLetter;
    heading = `${name} · ${rows.length} word${rows.length === 1 ? '' : 's'}`;
    els.dictBack.textContent = '‹ All letters';
  }
  els.dictGrid.hidden = !!rows;
  els.dictHead.hidden = !rows;
  els.dictHeading.textContent = heading;
  els.dictEmpty.hidden = !(rows && !rows.length);
  els.dictEmpty.textContent = q ? `Nothing matches "${q}".` : 'No words yet.';
  els.dictTable.hidden = !rows?.length;
  if (!rows) {
    renderDictGrid();
    return;
  }
  els.dictTable.classList.toggle('show-spaces', !!getSettings().topicWordGaps);
  const cols = wordlistColumns();
  const head = document.createElement('tr');
  for (const key of cols) head.append(Object.assign(document.createElement('th'), { textContent: COL_META[key].label }));
  const audioTh = document.createElement('th');
  audioTh.setAttribute('aria-label', 'Audio');
  head.append(audioTh);
  els.dictTableHead.replaceChildren(head);
  const words = reviewWords();
  const frag = document.createDocumentFragment();
  for (const c of rows) frag.append(wordRow(c, cols, c.key in words));
  els.dictTableBody.replaceChildren(frag);
}

// The 44 letters, just the letter on each (its name word and count went on 2026-10-12, the user's
// call; they're in its tooltip). A letter with no words is greyed out.
function renderDictGrid() {
  if (els.dictGrid.childElementCount) return; // drawn once: the words don't change while the app's open
  const counts = new Map();
  for (const e of dictEntries) counts.set(e.first, (counts.get(e.first) || 0) + 1);
  els.dictGrid.replaceChildren(...[...DICT_LETTERS].map((ch) => {
    const n = counts.get(ch) || 0;
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'dict-letter';
    b.disabled = !n;
    const name = (letterStep(ch)?.show || '').split(' ')[1] || '';
    b.lang = 'th';
    b.textContent = ch;
    b.title = n ? `${ch} ${name}: ${n} word${n === 1 ? '' : 's'}` : `${ch} ${name}: no words (obsolete)`;
    b.addEventListener('click', () => {
      state.dictLetter = ch;
      renderDictionary();
      window.scrollTo(0, 0);
    });
    return b;
  }));
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

// What a Recognition answer says: the Thai, or the English; a Read the Tone syllable's, its tone.
const TONE_ANSWERS = { mid: 'mid tone', low: 'low tone', falling: 'falling tone', high: 'high tone', rising: 'rising tone' };
const TONE_MARKS_TL = { '\u0300': 'low', '\u0302': 'falling', '\u0301': 'high', '\u030c': 'rising' };
const toneOfTranslit = (tl) => TONE_MARKS_TL[(tl || '').normalize('NFD').match(/[\u0300\u0302\u0301\u030c]/)?.[0]] || 'mid';
const answerText = (c, side) => (side === 'th' ? c.thai : c.alphaSet === 'tones' ? TONE_ANSWERS[toneOfTranslit(c.translit)] : c.english);

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

  // Compose 3 options and shuffle deterministically. The Alphabet's Tones (Read the Tone's
  // syllables) answer with a tone: the right one and two others.
  const opts = side === 'en' && card.alphaSet === 'tones'
    ? [answerText(card, side), ...pick(Object.values(TONE_ANSWERS).filter((t) => t !== answerText(card, side)), 2)]
      .map((text, i) => ({ text, isCorrect: i === 0 }))
    : [card, ...distractors].map((c) => ({
      text: answerText(c, side),
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
    const correctText = answerText(c, trial.side);
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
    const correctText = answerText(c, trial.side);
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
  if (state.direction === 'en-th' && autoPlayOn()) speak(cardSay(c));

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
  // The Alphabet's Recall: every card of its set, in order.
  if (state.section === 'alphabet') {
    const { id, cards } = alphaScope();
    return cards.map((c) => ({ key: cardKey(c), dir, deckId: id, it: items[itemKeyOf(cardKey(c), dir)] || null }));
  }
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
  if (state.view === 'dictionary') renderDictionary();
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
// The pages' line icons: the phone's tab bar, the home cards and the topic button (a topic: Topics'
// list; a category or Everything: a folder). index.html has the same paths inline.
const PAGE_ICONS = {
  home: 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  topics: 'M9 6h12M9 12h12M9 18h12M4 6h.01M4 12h.01M4 18h.01',
  flashcards: 'M5 7h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2zM7 3h12a2 2 0 0 1 2 2v12',
  reading: 'M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2zM22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z',
  dictionary: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z',
  group: 'M3 6.5A1.5 1.5 0 0 1 4.5 5H9l2 2.5h8.5A1.5 1.5 0 0 1 21 9v9.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.5z',
  alphabet: 'M7 20V10a5 5 0 0 1 10 0v10M7 11.5c-1.4-.2-2.3-1.2-2-2.6',
};
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
  if (listen) els.reviewPrompt.replaceChildren(listenButton(cardSay(card)));
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
  showPic(els.reviewPic, card);
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
  fitCardText(); // sizes the card too
  if (thaiFirst && autoPlayOn()) speak(cardSay(card));
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
  lightSpokenWord(playing && !over, t);
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

// Reading: the word being said lights up in its line as a sentence plays, from its own speaker,
// Read or Read all (2026-10-12, the user's request). The timings are the voice's own
// (data/audio/timings.json, made by tools/word_timings.py): its words are finer than the passage's
// (ผู้ก่อการร้าย comes as ผู้ ก่อ การ ร้าย), and each lights the passage word it falls in, from the
// moment it starts until the next one does. A sentence without timings plays unlit.
let wordTimings = null;  // sentence -> [c, start ms, end ms, …], once loaded (loadWordTimings)
let litWord = null;

async function loadWordTimings() {
  if (wordTimings) return;
  wordTimings = {};
  try {
    const res = await fetch('data/audio/timings.json');
    if (res.ok) wordTimings = (await res.json()).words || {};
  } catch {
    // offline and never cached: sentences play unlit
  }
}

function lightSpokenWord(playing, t) {
  let span = null;
  const times = playing && speakingText !== null && wordTimings?.[speakingText];
  if (times?.length) {
    const ms = t * 1000;
    let c = -1;
    for (let i = 0; i < times.length && times[i + 1] <= ms; i += 3) c = times[i];
    if (c >= 0) {
      const row = [...els.readerLines.children].find((r) => r.dataset.say === speakingText);
      span = row ? [...row.querySelectorAll('.rw[data-c0]')].find((x) => +x.dataset.c0 <= c && c < +x.dataset.c1) ?? null : null;
    }
  }
  if (span === litWord) return;
  litWord?.classList.remove('speaking');
  span?.classList.add('speaking');
  litWord = span;
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
  if (speakingSide(e.dir, true) && autoPlayOn()) speak(cardSay(state.cardIndex.get(e.key).card));
  els.reviewGrades.hidden = false;
}

// After the answer's been shown, ⟳ or a tap turns the card either way, saying the Thai when it
// turns to the side that speaks (speakingSide), as Flashcards' card does.
function turnReviewCard() {
  const r = state.review;
  setReviewFlipped(!r.flipped);
  if (speakingSide(r.current.dir, r.flipped) && autoPlayOn()) speak(cardSay(state.cardIndex.get(r.current.key).card));
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

// The Reading page: the current topic's stories (renderReadingList), an accordion. A story opens in
// place under its title (placeReader), closing the one open before; its title again closes it.
// Until 2026-10-12 a story opened on a page of its own, with a Back to Stories button (the user
// wanted to try it in place). Adding its words to Flashcards is left to the Topics page (the user's
// call, 2026-10-08). A row is the story's title and description: its level and a ✓ once read went on
// 2026-10-12 (the user's call). The page remembers the open story while the app's open
// (state.readingId).
const isPassage = (id) => !!state.decks.find((d) => d.id === id)?.passage;

function renderReading() {
  hideWordPop();
  loadWordTimings();
  renderReadingList();
  placeReader();
}

// The list: the stories that use the current topic's words (the topic picker's choice, shared with
// the Topics page), best matches first. There's no list of every story: there will be too many (the
// user's call, 2026-10-08).
function renderReadingList() {
  const scope = currentScope();
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
  // A story opened from elsewhere (a search result) that isn't one of this topic's goes first.
  const open = state.readingId && state.decks.find((d) => d.id === state.readingId && d.passage);
  if (open && !found.some(({ d }) => d === open)) found.unshift({ d: open });
  els.readingList.replaceChildren(...found.map(({ d }) => {
    const entry = document.createElement('div');
    entry.className = 'reading-entry';
    entry.dataset.id = d.id;
    // The title row: its button opens and closes the story; the open one's row also holds Read.
    const head = document.createElement('div');
    head.className = 'reading-head';
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'reading-item';
    item.setAttribute('aria-expanded', 'false');
    item.setAttribute('aria-controls', 'reader');
    item.innerHTML = '<span class="reading-item-main"><span class="reading-item-name"><span class="reading-item-title"></span></span><span class="reading-item-desc"></span></span><span class="reading-item-chevron" aria-hidden="true">›</span>';
    item.querySelector('.reading-item-title').textContent = d.name;
    item.querySelector('.reading-item-desc').textContent = d.description;
    item.addEventListener('click', () => {
      if (storyRunOn()) stopReadStories(); // a story picked by hand ends Read all
      if (state.readingId === d.id) closeReading();
      else openReading(d.id);
    });
    head.append(item);
    entry.append(head);
    return entry;
  }));
}

// Puts the reader under the open story's title (or hides it, with none open), and opens that one.
// Read goes in the open story's title row (the user's call, 2026-10-12; it was in the top bar,
// greyed out with no story open).
function placeReader() {
  const id = state.readingId;
  const entries = [...els.readingList.querySelectorAll('.reading-entry')];
  entries.forEach((e) => {
    const open = e.dataset.id === id;
    e.classList.toggle('open', open);
    e.querySelector('.reading-item').setAttribute('aria-expanded', String(open));
  });
  const entry = id && entries.find((e) => e.dataset.id === id);
  const topic = entry && state.decks.find((d) => d.id === id);
  if (!topic) {
    els.reader.hidden = true;
    els.readingRead.hidden = true;
    els.readingLibrary.append(els.reader, els.readingRead); // parked, out of the list
    return;
  }
  entry.querySelector('.reading-head').append(els.readingRead);
  els.readingRead.hidden = false;
  entry.append(els.reader);
  els.reader.hidden = false;
  renderReader(topic);
}

function closeReading() {
  if (storyRunOn()) stopReadStories();
  hideWordPop();
  state.readingId = null;
  placeReader();
}

// The open story's title at the top of the window, under the sticky top bar.
function scrollToReading() {
  const item = els.readingList.querySelector('.reading-entry.open .reading-item');
  if (!item) return;
  const bar = document.querySelector('.topbar')?.offsetHeight || 0;
  window.scrollTo({ top: item.getBoundingClientRect().top + window.scrollY - bar - 8 });
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

// Opens a passage under its title (from the list, or a search result, which also lights the word
// it found).
function openReading(id, word = null) {
  hideWordPop();
  state.readingId = id;
  // Tapped in the list, the page doesn't move: the story opens under its title, which stays where it
  // is on screen even when an open story above it closes (the user's call, 2026-10-12; it scrolled
  // the title to the top). From elsewhere (a search result), it's brought into view.
  const item = state.view === 'reading' && els.readingList.querySelector(`.reading-entry[data-id="${CSS.escape(id)}"] .reading-item`);
  const before = item ? item.getBoundingClientRect().top : null;
  if (state.view !== 'reading') setView('reading');
  else if (!item) renderReading();
  else placeReader();
  if (before !== null && !word) window.scrollBy(0, item.getBoundingClientRect().top - before);
  else scrollToReading();
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
    play.addEventListener('click', () => {
      if (state.storyReading.active) { // a line's speaker during Read all stops it
        stopReadStories();
        return;
      }
      speakerPress(play, sentence);
    });
    const th = document.createElement('p');
    th.className = 'reader-th';
    row.dataset.say = sentence;
    const tr = [];
    let at = 0; // how far through the sentence as said: each word's place in it (c0–c1, lightSpokenWord)
    line.th.split(' ').forEach((chunk, i) => {
      if (i) th.append(' ');
      chunk.split('|').forEach((tok, j) => {
        // Between the words of a run (Thai writes none): a space that "Spaces between words" shows.
        if (j) th.append(Object.assign(document.createElement('span'), { className: 'rw-gap', textContent: ' ' }));
        const label = tok.endsWith(':');
        const w = (label ? tok.slice(0, -1) : tok).replace(/_/g, ' '); // _ is a space inside a word (จริง_ๆ)
        const card = own.get(w);
        const c = label ? -1 : sentence.indexOf(w, at);
        if (c >= 0) at = c + w.length;
        if (card) {
          const span = document.createElement('span');
          span.className = 'rw' + (label ? ' rw-label' : '');
          span.textContent = w;
          if (c >= 0) Object.assign(span.dataset, { c0: c, c1: c + w.length });
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

// Reading's Read all (2026-10-12, the user's request; like Topics' Read all, in the same place):
// each story in the list in turn, from the open one (or the first), opened in place, its English
// title said, then read line by line, the line being read lit and kept in view. Read, beside it
// (the same day), reads just the open story, in its title row. The button pressed shows ❚❚ Pause;
// pressed again, or when a word's dialog opens, it pauses (the user's requests, same day): it shows
// ▶ Paused, the line stays lit, and pressing it carries on from that line (or the title). Leaving the
// page, changing topic, opening or closing a story by hand, or pressing a line's speaker stops it;
// the other button stops it and starts its own.
const STORY_LINE_PAUSE = 600;  // ms between lines
const STORY_PAUSE = 1500;      // and between stories

const storyRunOn = () => state.storyReading.active || !!state.storyReading.paused;

// Starts a run from `btn`, or carries on a paused one (`from`: { ids, idx, line }; line -1 is the title).
async function readStories(btn, from = null) {
  const all = btn === els.readingReadAll;
  const ids = from?.ids ?? (all ? [...els.readingList.querySelectorAll('.reading-entry')].map((e) => e.dataset.id)
    : state.readingId ? [state.readingId] : []);
  if (!ids.length) return;
  const run = state.storyReading;
  run.paused = null;
  run.active = true;
  run.btn = btn;
  const token = ++run.token;
  markStoryButtons();
  try {
    let idx = from ? from.idx : Math.max(0, ids.indexOf(state.readingId));
    let line = from ? from.line : -1;
    for (;;) {
      for (; idx < ids.length; idx++, line = -1) {
        if (token !== run.token) return;
        const id = ids[idx];
        if (state.readingId !== id) {
          hideWordPop();
          state.readingId = id;
          placeReader();
        }
        // Its title into view only if it's off screen: no jump to the top (the user's call, 2026-10-12).
        if (line < 0) els.readingList.querySelector('.reading-entry.open .reading-item')?.scrollIntoView({ block: 'nearest', behavior: SCROLL_BEHAVIOR() });
        // Its title first, in English (the user's request, 2026-10-12), the title row lit meanwhile.
        // Settings → Reading → Say the title turns it off.
        if (line < 0 && getSettings().readStoryTitles !== false) {
          run.at = { ids, idx, line: -1 };
          const title = els.readingList.querySelector('.reading-entry.open .reading-item');
          title?.classList.add('now-playing');
          await speakAndWait(state.decks.find((d) => d.id === id).name, 'en');
          if (token !== run.token) return; // paused, it stays lit
          title?.classList.remove('now-playing');
          await wait(STORY_LINE_PAUSE);
        }
        const rows = [...els.readerLines.querySelectorAll('.reader-line')];
        for (let i = Math.max(0, line); i < rows.length; i++) {
          if (token !== run.token) return;
          run.at = { ids, idx, line: i };
          els.readingList.querySelectorAll('.now-playing').forEach((r) => r.classList.remove('now-playing'));
          rows[i].classList.add('now-playing');
          rows[i].scrollIntoView({ block: 'nearest', behavior: SCROLL_BEHAVIOR() });
          await speakAndWait(rows[i].querySelector('.reader-play').dataset.say, 'th');
          if (token !== run.token) return;
          await wait(STORY_LINE_PAUSE);
        }
        if (token !== run.token) return;
        if (all) await wait(STORY_PAUSE);
      }
      // Settings → Reading → Loop (the user's request, 2026-10-12): from the start again, Read the
      // same story, Read all the first story in the list.
      if (token !== run.token || getSettings().readStoriesLoop === false) break;
      if (!all) await wait(STORY_PAUSE);
      idx = 0;
      line = -1;
    }
  } finally {
    if (token === run.token) stopReadStories();
  }
}

// Pausing (its button, or a word's dialog): the run stops where it is, its line (or title) stays lit,
// and its button carries on from there.
function pauseReadStories() {
  const run = state.storyReading;
  if (!run.active) return;
  run.paused = { btn: run.btn, ...run.at };
  run.active = false;
  run.token++; // the run waiting on the sentence bails out
  stopAudio();
  markStoryButtons();
}

function stopReadStories() {
  const run = state.storyReading;
  run.active = false;
  run.paused = null;
  run.token++; // a run still waiting bails out
  stopAudio();
  els.readingList.querySelectorAll('.now-playing').forEach((r) => r.classList.remove('now-playing'));
  run.btn = null;
  markStoryButtons();
}

// Read and Read all: ❚❚ Pause on the one running, ▶ Paused on the one paused, else as they are.
function markStoryButtons() {
  const run = state.storyReading;
  for (const [b, label] of [[els.readingRead, 'Read'], [els.readingReadAll, 'Read all']]) {
    const playing = run.active && run.btn === b;
    const paused = run.paused?.btn === b;
    b.classList.toggle('playing', playing);
    b.classList.toggle('paused', paused);
    if (playing) b.textContent = '❚❚ Pause';
    else if (paused) b.textContent = '▶ Paused';
    else b.replaceChildren(speakerIcon(), label);
    b.title = paused ? 'Paused: press to carry on' : playing ? 'Pause' : b === els.readingRead ? 'Play the open story, line by line' : 'Play every story in the list, line by line';
  }
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

// A tapped word (a story's, a Topics row's Thai, or a card back's Thai): say it, light it (`anchor`:
// the story's word or the row's cell; none for a card), and show it in a dialog
// (#word-modal): its transliteration and meaning, the word large, the Topics rows' buttons, and its
// tones. Until 2026-10-11 it was a pop-up under the word; the user wanted more room, for the tones
// above all. Tapping outside it, ✕ or Escape closes it.
let popAnchor = null; // the word or cell it's for (lit: .on)
let wordPop = null;   // while it's open: { lastFocus }

function showWordPop(anchor, card) {
  if (state.storyReading.active) pauseReadStories(); // its word takes over the sound, until Read carries on
  speak(cardSay(card));
  popAnchor?.classList.remove('on');
  popAnchor = anchor;
  anchor?.classList.add('on');
  els.wordModalTr.textContent = card.translit;
  els.wordModalEn.textContent = card.english;
  // The word again, large: tapping a part of it (a letter, a vowel, a tone mark) says that part's
  // name, as in the spelling (ค → คอ ควาย), and lights it briefly (partAt, 2026-10-09). Spelling it
  // aloud lights up each part as it's read (lightParts).
  const wordBox = document.createElement('div');
  wordBox.className = 'word-box'; // holds the highlights (lightParts, flashPart)
  const big = document.createElement('div');
  big.className = 'pop-word';
  big.lang = 'th';
  big.textContent = card.thai;
  wordBox.append(big);
  big.addEventListener('click', (e) => {
    const hit = tappedPart(big, card, e.clientX, e.clientY);
    if (!hit) return;
    wordBox.querySelectorAll('.pop-reading').forEach((x) => x.remove()); // speaking stops any spelling
    speak(hit.say, 'sp');
    flashPart(wordBox, hit.boxes);
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
    rv.title = added ? `Remove ${card.thai} from Cards` : `Add ${card.thai} to Cards`;
    rv.setAttribute('aria-label', rv.title);
  };
  paintReview();
  rv.addEventListener('click', () => {
    added = !added;
    setInReview([key], added);
    toast(added ? `✓ Added ${card.thai} to Cards` : `Removed ${card.thai} from Cards`, { tone: added ? 'good' : '' });
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
  play.className = 'row-speak' + (sayingNow(cardSay(card)) ? ' playing' : ''); // lit while it plays (markSpeakers)
  play.dataset.say = cardSay(card);
  play.title = `Play ${card.thai}`;
  play.setAttribute('aria-label', play.title);
  play.append(speakerIcon());
  play.addEventListener('click', () => speakerPress(play, cardSay(card)));
  actions.append(play);
  // Under them, the word's tones (tones.js), closed to a row until tapped.
  const tones = toneSection(card, big);
  els.wordModalBody.replaceChildren(wordBox, actions, ...(tones ? [tones.el] : []));
  if (!wordPop) wordPop = { lastFocus: document.activeElement };
  els.wordModal.hidden = false;
  setModalOpen(true);
  els.wordModalBody.scrollTop = 0;
  fitPopWord(big);
  tones?.shown();
  els.wordModalClose.focus({ preventScroll: true });
}

function hideWordPop() {
  popAnchor?.classList.remove('on');
  popAnchor = null;
  if (!wordPop) return;
  const { lastFocus } = wordPop;
  wordPop = null;
  els.wordModal.hidden = true;
  setModalOpen(!!document.querySelector('.modal:not([hidden])'));
  if (lastFocus?.isConnected) lastFocus.focus({ preventScroll: true });
}

// ---------- tones (tones.js) ----------

// The word dialog's Tones (2026-10-11, the user's request). Closed, it's "Tones" and a small curve
// per syllable; open (the small curves hidden): a strip with each syllable's tone drawn, its
// transliteration and the tone's name; the rule for the syllable picked (the first, to start), row
// by row (toneRule); and its cell in the tone table (toneTable). Picking a syllable lights its
// letters in the big word and says it. Open or closed is remembered (prefs.popTones).
// { el, shown } (call shown() once the dialog is showing, to light the picked syllable), or null for
// a word whose Thai can't be matched to its transliteration.
function toneSection(card, big) {
  const syls = toneBreakdown(card.thai, card.translit);
  if (!syls?.length) return null;
  const el = (tag, className, textContent = '') => Object.assign(document.createElement(tag), { className, textContent });
  const newWord = (n) => n > 0 && syls[n].word !== syls[n - 1].word;
  const box = el('div', 'pop-tones');
  const toggle = el('button', 'tones-toggle');
  toggle.type = 'button';
  const minis = el('span', 'tones-minis');
  syls.forEach((s, n) => minis.append(toneCurve(s.tone, { staff: false, gap: newWord(n) })));
  toggle.append(el('span', 'tones-label', 'Tones'), minis, el('span', 'tones-chevron', '›'));

  const panel = el('div', 'tones-panel');
  const strip = el('div', 'tones-strip');
  const detail = el('div', 'tones-detail');
  const table = el('div', 'tones-table-box');
  let picked = 0;
  const pick = (n, { say = false } = {}) => {
    picked = n;
    const syl = syls[n];
    strip.querySelectorAll('.tone-syl').forEach((b, k) => b.setAttribute('aria-pressed', String(k === n)));
    detail.replaceChildren(...toneRule(syl));
    table.replaceChildren(...toneTable(syl));
    if (say) speak(syl.said, sampleUrl(syl.said, 'sp') ? 'sp' : 'th');
    lightParts(big, syl.at);
  };
  syls.forEach((syl, n) => {
    const b = el('button', `tone-syl tone-${syl.tone}` + (syl.exception ? ' exception' : '') + (newWord(n) ? ' word-start' : ''));
    b.type = 'button';
    b.append(toneCurve(syl.tone), el('span', 'tone-tl', syl.tl), el('span', 'tone-name', syl.tone));
    b.title = `${syl.said} ${syl.tl}: ${syl.tone} tone`;
    b.addEventListener('click', () => pick(n, { say: true }));
    strip.append(b);
  });
  panel.append(strip, ...(syls.length > 1 ? [el('p', 'tones-hint', 'Tap a syllable to see its rule.')] : []), detail, table);

  const setOpen = (open) => {
    box.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    panel.hidden = !open;
  };
  setOpen(!!getPreferences().popTones);
  toggle.addEventListener('click', () => {
    const open = panel.hidden;
    setOpen(open);
    setPreferences({ popTones: open });
    if (open) pick(picked);
    else lightParts(big, null);
  });
  box.append(toggle, panel);
  return { el: box, shown: () => { if (!panel.hidden) pick(picked); } };
}

// Why a vowel isn't written (tones.js hiddenVowel), under the Vowel row (2026-10-12, the user's
// question about กก).
const HIDDEN_WHY = {
  o: 'Two consonants with no vowel between them are read with a short o (สระโอะลดรูป: โ-ะ drops its form before a final), as in คน, นก, รถ.',
  a: 'A consonant with no vowel of its own, before the next syllable, is read with a short a, as in สบาย (สะ-บาย).',
  aw: 'Read with ɔɔ, as in บริษัท (บอ-ริ-สัด): mostly in words from Pali and Sanskrit.',
  awR: 'A final ร, said -n, with ɔɔ before it, as in อักษร and ละคร.',
};

// One syllable's rule, as rows: the consonant's class, the tone mark, then what makes the syllable
// live or dead (its vowel's length and its final) and which it is, and the tone. With a tone mark,
// the mark decides on its own, which the Syllable row says (the middle three rows were dimmed for
// it at first, which read as a glitch). For an exception: the rules' tone and the one said. Then any
// note.
function toneRule(s) {
  const rows = document.createElement('dl');
  rows.className = 'tone-rows';
  const row = (label, ...content) => {
    const dt = Object.assign(document.createElement('dt'), { textContent: label });
    const dd = document.createElement('dd');
    dd.append(...content);
    rows.append(dt, dd);
    return [dt, dd];
  };
  const thai = (text) => Object.assign(document.createElement('span'), { className: 'tone-th', textContent: text, lang: 'th' });
  const why = (text) => Object.assign(document.createElement('span'), { className: 'tone-why', textContent: text });
  const toneName = (tone) => {
    const out = Object.assign(document.createElement('span'), { className: `tone-${tone}`, textContent: `${tone} · ` });
    out.append(thai(TONE_THAI[tone]));
    return out;
  };
  row('Class', thai(s.clsLetter), ` ${CLASS_NAMES[s.cls]}`, ...(s.clsWhy ? [why(s.clsWhy)] : []));
  row('Mark', s.mark ? thai(`◌${s.mark} ${MARK_NAMES[s.mark]}`) : 'none');
  const vowelNote = s.writtenLong !== s.long ? [why(`written ${s.writtenLong ? 'long' : 'short'}, said ${s.long ? 'long' : 'short'}`)] : [];
  const f = s.final;
  row('Vowel', `${s.long ? 'long' : 'short'} `, thai(s.vowelName), ...(s.vowelHidden ? [' unwritten', why(HIDDEN_WHY[s.vowelHidden])] : []), ...vowelNote);
  row('Final', ...(f ? [`-${f.sound} `, ...(f.letter ? [thai(f.letter)] : [' in ', thai(f.part)]), why(f.stop ? 'stops the sound' : 'can be held')] : ['none']));
  // Why, unless the final row has said it.
  row('Syllable', `${s.live ? 'live' : 'dead'} `, thai(s.live ? 'คำเป็น' : 'คำตาย'),
    ...(s.mark ? [why("With a tone mark this doesn't matter: the mark decides.")]
      : f ? [] : [why(s.long ? 'a long vowel can be held' : 'a short vowel stops short')]));
  if (s.exception) {
    row('Rules give', toneName(s.rule));
    row('Said', toneName(s.tone))[1].classList.add('tone-said');
  } else {
    row('Tone', toneName(s.tone))[1].classList.add('tone-said');
  }
  const out = [rows];
  if (s.note) out.push(Object.assign(document.createElement('p'), { className: 'tone-note', textContent: s.note }));
  return out;
}

// The whole tone table, every class against live, dead and the four marks, each cell a tone's curve,
// with the cell the syllable's rule uses picked out (for an exception, the tone the rules give).
// Then the five tones as a key.
const TABLE_HEADS = { live: 'live', deadShort: 'dead, short', deadLong: 'dead, long' };
function toneTable(s) {
  const table = document.createElement('table');
  table.className = 'tone-table';
  const th = (text, attrs = {}) => Object.assign(document.createElement('th'), { textContent: text, ...attrs });
  const head1 = document.createElement('tr');
  head1.append(th(''), th('no mark', { colSpan: 3 }), th('tone mark', { colSpan: 4 }));
  const head2 = document.createElement('tr');
  head2.append(th(''), ...TABLE_COLUMNS.map((c) => {
    const cell = th(TABLE_HEADS[c] || `◌${c}`);
    if (!TABLE_HEADS[c]) cell.lang = 'th';
    return cell;
  }));
  const thead = document.createElement('thead');
  thead.append(head1, head2);
  const tbody = document.createElement('tbody');
  for (const cls of ['M', 'H', 'L']) {
    const tr = document.createElement('tr');
    tr.append(th(CLASS_NAMES[cls], { scope: 'row' }));
    for (const col of TABLE_COLUMNS) {
      const td = document.createElement('td');
      const tone = tableTone(cls, col);
      if (tone) {
        td.className = `tone-${tone}`;
        td.title = tone;
        td.append(toneCurve(tone, { staff: false }));
        if (cls === s.cls && col === s.column) td.classList.add('on');
      }
      tr.append(td);
    }
    tbody.append(tr);
  }
  table.append(thead, tbody);
  const key = document.createElement('div');
  key.className = 'tone-key';
  for (const tone of ['mid', 'low', 'falling', 'high', 'rising']) {
    const k = Object.assign(document.createElement('span'), { className: `tone-${tone}` });
    k.append(toneCurve(tone, { staff: false }), tone);
    key.append(k);
  }
  return [Object.assign(document.createElement('h3'), { className: 'tones-table-title', textContent: 'The tone table' }), table, key];
}

// A tone's pitch, drawn: a curve on a faint three-line staff (the top, middle and bottom of the
// voice), in the tone's colour (--tone-*). Without the staff, small, for the closed Tones row.
const TONE_PATHS = {
  mid: 'M3 10.5H33',
  low: 'M3 14.5C13 15 23 16.5 33 17.5',
  falling: 'M3 6.5C12 3 20 5 33 17.5',
  high: 'M3 7C14 7 24 6 33 2.5',
  rising: 'M3 13C11 18 21 18 33 4',
};
function toneCurve(tone, { staff = true, gap = false } = {}) {
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', `tone-curve tone-${tone}` + (gap ? ' word-start' : ''));
  svg.setAttribute('viewBox', '0 0 36 20');
  svg.setAttribute('aria-hidden', 'true');
  if (staff) {
    for (const y of [2.5, 10.5, 18]) {
      const line = document.createElementNS(NS, 'path');
      line.setAttribute('d', `M1 ${y}H35`);
      line.setAttribute('class', 'tone-staff');
      svg.append(line);
    }
  }
  const path = document.createElementNS(NS, 'path');
  path.setAttribute('d', TONE_PATHS[tone]);
  path.setAttribute('class', 'tone-line');
  svg.append(path);
  return svg;
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

// A tap on a card's Thai (2026-10-09, the user's request), instead of turning the card. `el` is the
// Thai showing (cardThaiShown, recallThaiShown): the large Thai of the Thai → English front, or on
// the back (`back`) the English → Thai answer or the smaller Thai repeated on the Thai → English and
// Listen backs; or null. `card` is the card it belongs to. On the front, a letter, vowel or tone mark
// says its name and lights up, as in the word dialog. On the back, the Thai opens the word dialog
// (showWordPop; 2026-10-11, the user's request), where its letters can be tapped too. True if the tap
// was on the Thai.
const CARD_TAP_REACH = 8;

// A tap on a card back's transliteration or English (`els`; on an English → Thai back, its Thai
// answer) opens the word dialog for `card` (2026-10-11, the user's request). Only on the text itself:
// the lines run the card's width, and a tap beside them still turns the card. True if it opened.
function tapCardText(els, e, card) {
  if (!card) return false;
  const on = els.some((el) => {
    if (!el || el.hidden || !el.textContent || !el.contains(e.target)) return false;
    const range = document.createRange();
    range.selectNodeContents(el);
    const r = CARD_TAP_REACH;
    return [...range.getClientRects()].some((b) => e.clientX >= b.left - r && e.clientX <= b.right + r && e.clientY >= b.top - r && e.clientY <= b.bottom + r);
  });
  if (on) showWordPop(null, card);
  return on;
}

function tapCardThai(el, e, card, { back = false } = {}) {
  if (!el || !el.contains(e.target)) return false;
  const hit = tappedPart(el, card, e.clientX, e.clientY, CARD_TAP_REACH);
  if (!hit) return false;
  if (back && card) {
    showWordPop(null, card);
    return true;
  }
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
  const pop = el.closest('.word-box, .face');
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

// A phrase card's words (its `words`: card keys, from the story builder), or null for a single word.
function phraseWords(card) {
  if (!(card.words?.length > 1)) return null;
  const words = card.words.map((k) => state.cardIndex.get(k)?.card);
  return words.every(Boolean) ? words : null;
}

// ---------- wordlist read-aloud ----------

async function startReadAloud() {
  if (state.reading.active) return;
  const rows = state.listCards; // in list order (the headings sorted the table until 2026-10-12)
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
      if (rowEl) rowEl.scrollIntoView({ block: 'nearest', behavior: SCROLL_BEHAVIOR() });

      const s = getSettings();
      for (let i = 0; i < s.readRepeats; i++) {
        if (token !== state.reading.token) return;
        await speakAndWait(cardSay(card), 'th');
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
    toast('There are no words in Cards');
    return;
  }
  const ok = await confirmDialog({
    title: 'Clear Cards?',
    message: `This takes all ${n} word${n === 1 ? '' : 's'} you've added out of Cards. Their progress is kept, so adding them again carries on.`,
    confirmLabel: 'Clear Cards',
    danger: true,
  });
  if (!ok) return;
  const store = loadStore();
  store.reviewWords = {};
  saveStore(store);
  renderToday();
  renderWordlist();
  syncReviewOnly();
  toast('Cards cleared');
}

// Every setting back to its default (getSettings merges DEFAULT_SETTINGS over what's saved).
// Progress and the Review list aren't settings, and nor is "Download all audio" being on: the
// audio stays downloaded and kept up to date.
async function resetSettings() {
  const ok = await confirmDialog({
    title: 'Reset all settings?',
    message: 'Every setting goes back to its default. Your progress and the words in Cards are kept.',
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
  for (const c of cards) add(sampleUrl(cardSay(c), 'th'), true);
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
  if (source === 'browser') return "Your browser's own voices. Thai is usually poor.";
  return "Neural voices, recorded. Anything missing uses the browser's voice.";
}

// Settings → App → About: how many of the cards' Thai and English have a recording (it was under
// Voice until the settings became a list, 2026-10-12).
function recordingsText() {
  const coverage = (lang, field) => {
    const texts = new Set(state.decks.flatMap((d) => d.cards.map((c) => c[field])));
    const have = [...texts].filter((t) => sampleFiles[lang][t]).length;
    return `${have.toLocaleString()} of ${texts.size.toLocaleString()}`;
  };
  return `Thai ${coverage('th', 'thai')}, English ${coverage('en', 'english')}.`;
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
        if (step.word) await speakAndWait(cardSay(card), 'th');
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
  const flash = currentCard() && cardSay(currentCard());
  const recall = state.review?.current && cardSay(state.cardIndex.get(state.review.current.key).card);
  els.speakButtons.forEach((b) => b.classList.toggle('playing', on(flash)));
  document.querySelectorAll('.review-speak').forEach((b) => b.classList.toggle('playing', on(recall)));
  document.querySelectorAll('.row-speak, .letter-tile').forEach((b) => b.classList.toggle('playing', on(b.dataset.say)));
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
      closeMore();
      // From the phone's Settings page: leave it, for the page the tab is, the one under it or not.
      if (state.settingsOpen) {
        closeSettings();
        if (t.dataset.view === pageNow()) return;
      }
      // Reading's tab again, with a story open: it closes, back to the top of the list.
      if (t.dataset.view === 'reading' && state.view === 'reading' && state.readingId) {
        closeReading();
        window.scrollTo(0, 0);
        return;
      }
      if (t.dataset.view === pageNow()) return; // already there
      goTo(t.dataset.view);
    });
  });

  document.getElementById('read-aloud').addEventListener('click', toggleReadAloud);
  let dictTyping = null;
  els.dictSearch.addEventListener('input', () => {
    clearTimeout(dictTyping);
    dictTyping = setTimeout(() => {
      state.dictQuery = els.dictSearch.value;
      renderDictionary();
    }, 150);
  });
  els.dictBack.addEventListener('click', () => {
    if (state.dictQuery.trim()) {
      state.dictQuery = '';
      els.dictSearch.value = '';
    } else {
      state.dictLetter = null;
    }
    renderDictionary();
    window.scrollTo(0, 0);
  });
  [els.readingRead, els.readingReadAll].forEach((b) => b.addEventListener('click', () => {
    const run = state.storyReading;
    if (run.paused?.btn === b) { // carry on from where it was paused
      readStories(b, run.paused);
      return;
    }
    if (run.active && run.btn === b) { // running: pause it (the user's call, 2026-10-12; it stopped)
      pauseReadStories();
      return;
    }
    if (storyRunOn()) stopReadStories(); // the other button's run ends
    readStories(b);
  }));

  // Deck picker
  els.deckButton.addEventListener('click', () => (onAlphabet() ? toggleAlphaSets() : openDeckPicker()));
  els.alphaSetItems.forEach((b) => b.addEventListener('click', () => setAlphaSet(b.dataset.alphaSet)));
  document.addEventListener('click', (e) => {
    if (!els.alphaSetMenu.hidden && !e.target.closest('#alpha-set-menu, #deck-button')) toggleAlphaSets(false);
  });
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
  // The phone's More: its tab opens and closes the list; a row picks its page.
  els.tabMore.addEventListener('click', () => (state.moreOpen ? closeMore() : openMore()));
  els.moreItems.forEach((b) => b.addEventListener('click', () => pickMore(b)));
  els.moreMenu.addEventListener('click', (e) => {
    if (e.target.dataset.close !== undefined) closeMore();
  });
  PHONE_LAYOUT.addEventListener('change', () => closeMore());

  // The Alphabet: Letters | Cards, and the grid's class colours.
  els.alphaPageButtons.forEach((b) => b.addEventListener('click', () => {
    const page = b.dataset.alphaPage;
    setPreferences({ alphaPage: page });
    if (page === 'cards') setView('flashcards', { section: 'alphabet' });
    else setView('alphabet');
  }));
  els.alphaClasses.addEventListener('click', () => {
    setPreferences({ alphaClasses: !getPreferences().alphaClasses });
    renderAlphabet();
  });
  els.settingsModal.addEventListener('click', (e) => {
    if (e.target.dataset.close !== undefined) closeSettings();
  });
  [[els.readerTranslit, 'readerTranslit'], [els.readerEnglish, 'readerEnglish'], [els.readerSpaces, 'readerSpaces']].forEach(([btn, key]) => {
    btn.addEventListener('click', () => {
      setPreferences({ [key]: !getPreferences()[key] });
      hideWordPop(); // the lines move
      applyReaderToggles();
    });
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
    if (state.showingBack && tapCardText([els.translit, els.english], e, currentCard())) return; // the word dialog: not a turn
    if (tapCardThai(cardThaiShown(), e, currentCard(), { back: state.showingBack })) return; // the Thai: not a turn
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
      if (c) speakerPress(btn, cardSay(c));
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
  els.homeCards.forEach((card) => card.addEventListener('click', () => goTo(card.dataset.go))); // the Alphabet: its last page

  // Adding to Review by hand
  els.wordlistAddAll.addEventListener('click', async () => {
    const words = reviewWords();
    const deck = currentScope();
    const keys = state.listCards.map((c) => c.key).filter((key) => !(key in words));
    if (!keys.length) {
      // All in Review: remove them all (their progress is kept).
      const n = state.listCards.length;
      const ok = await confirmDialog({
        title: 'Remove all from Cards?',
        message: `Remove all ${n} words in ${deck.name} from Cards? Your progress on them is kept.`,
        confirmLabel: `Remove ${n}`,
        setting: 'confirmRemoveAll',
      });
      if (ok) {
        setInReview(state.listCards.map((c) => c.key), false);
        toast(`Removed ${n} words from Cards`);
      }
      return;
    }
    const n = keys.length;
    const ok = await confirmDialog({
      title: 'Add all to Cards?',
      message: n === state.listCards.length
        ? `Add all ${n} words in ${deck.name} to Cards?`
        : `Add the ${n} words in ${deck.name} that aren't in Cards yet?`,
      confirmLabel: `Add ${n}`,
      setting: 'confirmAddAll',
    });
    if (ok) {
      setInReview(keys, true);
      toast(`✓ Added ${n} ${n === 1 ? 'word' : 'words'} to Cards`, { tone: 'good' });
    }
  });
  // Flashcards with none of the topic's words in yet: "Add all words from '…'? Yes" (the question is
  // the confirmation), or the Topics page to pick them.
  els.reviewOnlyYes.addEventListener('click', () => {
    const words = reviewWords();
    const keys = state.cards.map((c) => c.key).filter((key) => !(key in words));
    if (!keys.length) return;
    setInReview(keys, true);
    toast(`✓ Added ${keys.length} ${keys.length === 1 ? 'word' : 'words'} to Cards`, { tone: 'good' });
  });
  els.reviewOnlyTopics.addEventListener('click', () => setView('wordlist'));
  els.reviewOnlyEverything.addEventListener('click', () => setFlashcardsBy('all'));
  els.confirmOk.addEventListener('click', () => closeConfirm(true));
  els.confirmCancel.addEventListener('click', () => closeConfirm(false));
  els.confirmModal.querySelector('[data-close]').addEventListener('click', () => closeConfirm(false));
  els.wordModal.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', hideWordPop));

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
    if (entry) speakerPress(btn, cardSay(state.cardIndex.get(entry.key).card));
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
    if (r.flipped && tapCardText([els.reviewTranslit, els.reviewMain], e, state.cardIndex.get(r.current?.key)?.card)) return; // the word dialog
    if (tapCardThai(recallThaiShown(), e, state.cardIndex.get(r.current?.key)?.card, { back: r.flipped })) return; // the Thai: not a turn
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
    if (!els.alphaSetMenu.hidden) {
      if (e.key === 'Escape') {
        e.preventDefault();
        toggleAlphaSets(false);
        els.deckButton.focus();
      }
      return;
    }
    if (state.moreOpen) { // before Settings: the list can be open over it
      const items = [...els.moreItems];
      const i = items.indexOf(document.activeElement);
      if (e.key === 'Escape') {
        e.preventDefault();
        closeMore(true);
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const step = e.key === 'ArrowDown' ? 1 : -1;
        items[(i + step + items.length) % items.length].focus();
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
    if (wordPop) {
      if (e.key === 'Escape') {
        e.preventDefault();
        hideWordPop();
      }
      return;
    }
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
    if (state.view === 'home' || state.view === 'reading' || state.view === 'dictionary' || state.view === 'alphabet') return; // Flashcards' and Topics' keys
    if (state.view === 'flashcards' && state.orderMode === 'review') {
      handleReviewKey(e);
      return;
    }
    if (e.key === ' ') {
      e.preventDefault();
      flipCard();
    } else if (e.key === 'p' || e.key === 'P') {
      const c = currentCard();
      if (c) speak(cardSay(c));
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
  return `This time: ready at ${s(ready)}, loaded from ${from} at ${s(nav.responseEnd)}${drawn}. ` +
    'From when the page started loading.';
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
  const keys = new Set(Object.keys(store.items || {}).map((k) => splitItemKey(k)[0]));
  const alpha = [...keys].filter((k) => k.startsWith('abc:')).length;
  const studied = keys.size - alpha;
  return `${words} word${words === 1 ? '' : 's'} in Cards, progress on ${studied}` + (alpha ? ` and ${alpha} from the Alphabet` : '');
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
    message: `From ${when}: ${backupSummary(data)}.\nIt replaces the settings, progress and words in Cards on this device (${backupSummary(loadStore())}).`,
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
    buildAlphabet();
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
  migrateCardRenames();

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
