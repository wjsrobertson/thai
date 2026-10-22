import { letterSpelling, letterStep, schoolSpelling, vowelSpelling, isSpellable, consonantClass } from './spell.js';
import { toneBreakdown, tableTone, TABLE_COLUMNS, TONE_THAI, CLASS_NAMES, MARK_NAMES } from './tones.js';
import { KEDMANEE, sameThai, tidy, tidiedNote, firstWrong, clusters } from './typing.js';
import { PERIODS, periodOf, timePhrase, timeEnglish } from './time.js';

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
  typeBar: document.getElementById('type-bar'), // Type mode's box, in the answers' place
  typeField: document.getElementById('type-field'),
  typeBox: document.getElementById('type-box'),
  typeResult: document.getElementById('type-result'),
  typeCheck: document.getElementById('type-check'),
  typeHint: document.getElementById('type-hint'),
  prevBtn: document.getElementById('prev-btn'),
  nextBtn: document.getElementById('next-btn'),
  randomBtn: document.getElementById('random-btn'),
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
  dictLangButtons: document.querySelectorAll('[data-dict-lang]'),
  alphaSection: document.getElementById('alphabet-section'),
  alphaHint: document.getElementById('alpha-hint'),
  alphaVowels: document.getElementById('alpha-vowels'),
  alphaTones: document.getElementById('alpha-tones'),
  alphaSetMenu: document.getElementById('alpha-set-menu'),
  alphaTop: document.querySelector('.alpha-top'),
  alphaWrite: document.getElementById('alpha-write'),
  writeModeSwitch: document.getElementById('write-mode'),
  writeActions: document.querySelector('.write-actions'),
  writeCanvas: document.getElementById('write-canvas'),
  writeName: document.getElementById('write-name'),
  writeFeedback: document.getElementById('write-feedback'),
  alphaSetItems: document.querySelectorAll('[data-alpha-set]'),
  alphaGrid: document.getElementById('alpha-grid'),
  alphaPageButtons: document.querySelectorAll('[data-alpha-page]'),
  studyPageButtons: document.querySelectorAll('[data-study-page]'),
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
  tabSettings: document.getElementById('tab-settings'), // a phone's, in the tab bar (back from More's list, 2026-10-14)
  tabMore: document.getElementById('tab-more'), // a phone's, hidden for now (index.html)
  moreMenu: document.getElementById('more-menu'), // its list
  moreItems: document.querySelectorAll('.more-item'),
  timeSection: document.getElementById('time-section'),
  timeStyleButtons: document.querySelectorAll('[data-time-style]'),
  timeClock: document.getElementById('time-clock'),
  timePrev: document.getElementById('time-prev'),
  timeNext: document.getElementById('time-next'),
  timeBand: document.getElementById('time-band'),
  timeTh: document.getElementById('time-th'),
  timeTr: document.getElementById('time-tr'),
  timeEn: document.getElementById('time-en'),
  timePlay: document.getElementById('time-play'),
  timePageButtons: document.querySelectorAll('[data-time-page]'),
  timeExplore: document.getElementById('time-explore'),
  timeQuiz: document.getElementById('time-quiz'),
  timeDirButtons: document.querySelectorAll('[data-time-dir]'),
  timeQClock: document.getElementById('time-q-clock'),
  timeQPrompt: document.getElementById('time-q-prompt'),
  timeQPlay: document.getElementById('time-q-play'),
  timeQReveal: document.getElementById('time-q-reveal'),
  timeAnswers: document.getElementById('time-answers'),
  setWaitAgain: document.getElementById('setting-wait-again'),
  setWaitHard: document.getElementById('setting-wait-hard'),
  setWaitEasy: document.getElementById('setting-wait-easy'),
  setRetention: document.getElementById('setting-retention'),
  pickerTabs: document.querySelectorAll('[data-picker-tab]'), // the picker's Topics | My lists | Everything
  reviewByHelp: document.getElementById('review-by-help'),
  reviewOnlyAdd: document.getElementById('review-only-add'), // an empty list's Add words, on Cards
  addingBar: document.getElementById('adding-bar'), // the List page while adding words to a list
  addingName: document.getElementById('adding-name'),
  addingDone: document.getElementById('adding-done'),
  listActions: document.getElementById('list-actions'), // a list's Rename and Delete, on the List page
  listRename: document.getElementById('list-rename'),
  listDelete: document.getElementById('list-delete'),
  confirmInput: document.getElementById('confirm-input'),
  wordlistAddAll: document.getElementById('wordlist-add-all'),
  confirmModal: document.getElementById('confirm-modal'),
  wordModal: document.getElementById('word-modal'),
  moveModal: document.getElementById('move-modal'),
  moveTitle: document.getElementById('move-title'),
  moveDefault: document.getElementById('move-default'),
  moveLists: document.getElementById('move-lists'),
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
  setMuted: document.getElementById('setting-muted'),
  setAudioSource: document.getElementById('setting-audio-source'),
  setWriteCheck: document.getElementById('setting-write-check'),
  writeCheckHelp: document.getElementById('setting-write-check-help'),
  audioSourceHelp: document.getElementById('setting-audio-source-help'),
  aboutRecordings: document.getElementById('about-recordings'),
  setThaiSpeed: document.getElementById('setting-thai-speed'),
  setSpelling: document.getElementById('setting-spelling'),
  setTheme: document.getElementById('setting-theme'),
  setThaiFont: document.getElementById('setting-thai-font'),
  themeColorMeta: document.querySelector('meta[name="theme-color"]'),
  setTextSize: document.getElementById('setting-text-size'),
  setWordlistFirst: document.getElementById('setting-wordlist-first'),
  setListOrder: document.getElementById('setting-list-order'),
  setTopicWordGaps: document.getElementById('setting-topic-word-gaps'),
  setDevFeatures: document.getElementById('setting-dev-features'),
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
  readingSearch: document.getElementById('reading-search'),
  wordlistSearch: document.getElementById('wordlist-search'),
  wordlistMore: document.getElementById('wordlist-more'),
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
  confirmAddAll: true,            // Topics page "Add all to Flashcards" asks first (Settings → List)
  confirmRemoveAll: true,         // Topics page "✓ All in Flashcards" (remove all) asks first
  muted: false,                   // Settings → Audio → Mute: no sound at all (isMuted)
  audioSource: 'samples',         // 'samples' (data/audio MP3s, TTS fallback) | 'browser' (always TTS); Thai and English
  thaiSpeed: 0.7,                 // playback speed multiplier for Thai audio (samples and TTS), 0.5–1 (1 until 2026-10-18)
  theme: 'dark',                  // Settings → Display → Theme: dark | charcoal | light | night | black
  thaiFont: 'looped',             // Settings → Display → Thai font: 'looped' (Noto Looped Thai) | 'loopless' (Noto Sans Thai)
  spellingStyle: 'vowels',        // the spell-aloud buttons: 'vowels' (names, vowels whole) | 'letters' (names, as written) | 'school' (sounds)
  textSize: 1,                    // -2..2 steps (see TEXT_SCALES); Larger by default (0 until 2026-10-18)
  offlineAudio: false,            // user chose "Download all audio": keep every clip cached
  readRepeats: 2,                 // times Read all says each word (Settings → List; 1 until 2026-10-08)
  readPauseSec: 1.5,              // seconds of silence between words
  readSpeakEnglish: true,         // whether to speak English after Thai
  learnPauseMs: 1500,             // Recognition: pause after a right answer before the next card
  wrongPauseMs: 4000,             // Recognition: pause after a wrong one (its own setting since 2026-10-08; 3 s at first)
  testOrder: 'random',            // Test-mode card order: 'random' | 'deck' (the deck's own order)
  wordlistFirst: 'thai',          // the Topics page's first column: 'thai' | 'english' (Settings → List)
  listOrder: 'newest',            // your lists' words: 'newest' | 'oldest' added first (Settings → List; resolveListScope)
  topicWordGaps: false,           // the Topics page: spaces between a phrase's words (Settings → List)
  devFeatures: false,             // pages still being tried out, now Time (Settings → App; applyDevFeatures)
  readStoryTitles: true,          // Reading's Read all says each story's English title first (Settings → Reading)
  readStoriesLoop: true,          // Reading's Read / Read all start again when they finish (Settings → Reading)
  writeCheck: 'normal',           // Write → From memory: how sure the model must be, 'lenient' | 'normal' | 'strict' (WRITE_CHECK)
};

const state = {
  decks: [],
  currentDeckId: null,       // the topic the Topics page shows (and Flashcards and Review By topic): a scope id (resolveScope)
  pickerFor: 'study',        // the topic picker was opened from 'study' (the Topics page), 'flashcards' or 'review'
  listCards: [],      // the topic's cards (with progress merged): the Topics page
  cards: [],          // Flashcards' cards: the same list By topic, every card on Everything (loadCards)
  flashScopeId: null, // the scope `cards` was built for: the topic's or list's id (or the Alphabet's)
  queue: [],          // ordered indices into `cards`
  pos: 0,             // index into queue
  randomAt: null,     // { queue, pos }: the card 🔀 drew, shown as "? / n" till ‹ › move on (goRandom)
  randomBag: null,    // { queue, left }: the places 🔀 hasn't drawn yet
  timeQuiz: null,     // Time's Quiz: { q, options, picked, dir, style, comebacks, seq, ahead: the next new time } (nextTimeQuestion)
  time: (() => { const d = new Date(); const at = Math.round((d.getHours() * 60 + d.getMinutes()) / 5) * 5 % 1440; return { h: Math.floor(at / 60), m: at % 60 }; })(), // Time's clock (renderTime): now, to the 5 minutes
  timeName: null,           // Explore's band name tapped, { id, from: its run's first hour }, shown until the time changes (setTime)
  showingBack: false,
  section: 'words',  // whose cards the Cards engine holds: 'words', or 'alphabet' on the Alphabet's Cards page (useSection)
  view: 'home',       // 'home' | 'flashcards' (the Flashcards tab) | 'wordlist' (the Topics tab, once Wordlists). The Review tab ('today') became Flashcards' Review mode on 2026-10-08.
  dictLetter: null,   // the Dictionary's letter (ก…ฮ, or A…Z in English), or null for the grid (renderDictionary)
  dictLang: 'th',     // the Dictionary's way in: 'th' (ก–ฮ, Thai first) or 'en' (A–Z, English first); prefs.dictLang
  dictQuery: '',      // and its search box
  wordQuery: '',      // the List page's search (renderWordlist)
  wordShown: 25,      // and how many of its rows show (WORD_PAGE, Show more)
  wordFor: null,      // the scope those are for: another starts afresh (wordsFor)
  takenOut: new Set(), // words taken out of the list being added to, while adding (faded: renderWordlist)
  addedHere: new Set(), // words put in it on this visit, which aren't faded when taken out (setInTarget)
  readingId: null,    // the Reading page's open passage (renderReading), or null for the list. 'reading' is a view too, reached from Home.
  readingQuery: '',   // Reading's search box (storyMatches)
  readingShown: 10,   // how many of the list's stories show (READING_PAGE more with each Show more)
  readingFor: null,   // the scope (and level) those were for: a new one starts them afresh
  orderMode: 'practice', // Flashcards' mode: 'practice' (Learn) | 'test' | 'review' | 'type' (Recognition, typed: 2026-10-19)
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
  modeSnap: { practice: null, test: null, type: null }, // Browse's, Recognition's and Type's places while in another mode (snapMode)
  answerSeq: 0,             // Recognition and Type: bumped to cancel a pending move to the next card
  learnAnswers: new Map(),  // cardKey -> { pickedText, isCorrect, seedSeen }, or Type's { typed, right, note, at }, for this session
  cardIndex: new Map(),     // cardKey -> { card, deckIds } across all decks (see buildCardIndex)
  review: null,             // Review mode's stream while it runs (see enterReview)
  confirm: null,            // the open confirm dialog: { resolve, setting, lastFocus }
  moving: null,             // the open Change dialog (openMoveWords): { lastFocus }
  pickerTab: 'topics',      // the picker's tab: 'topics' | 'lists' | 'all' (renderPickerTabs)
  addTo: null,              // the list the picker is choosing words for (Add words), or null
  addingTo: null,           // the list the List page's 🔁 are adding to from another topic or list (renderWordlist)
};

// ---------- storage ----------

// The parsed store is cached: progress is read on every card, and re-parsing thousands of items
// each time would add up. Another tab writing the store drops the cache (the storage event).
let storeCache = null;
let listsOfCache = null; // listsOf: each word's lists, rebuilt after any save
window.addEventListener('storage', (e) => { if (e.key === STORAGE_KEY) storeCache = listsOfCache = null; });

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
  listsOfCache = null;
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
  // 2026-10-18: Thai plays at 0.7× and text is a step larger (Larger) by default (the user's call).
  ['thai-speed-0.7', (s) => (s.thaiSpeed === 1 ? { thaiSpeed: 0.7 } : null)],
  ['text-size-larger', (s) => (s.textSize === 0 ? { textSize: 1 } : null)],
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

// ---------- what Cards goes through: every word in its scope ----------
// Since 2026-10-20 (the lists spike), every word of the topic, list or Everything. From 2026-10-07
// it was only the words you'd added with 🔁, with a message to add some when there were none.

// Which words those are, as a string, to tell when they've changed: only a list's can.
function reviewOnlySignature() {
  const scope = flashScope();
  return scope?.kind === 'list' ? `${scope.id}\n${scope.cards.map(cardKey).join('\n')}` : scope?.id || '';
}

// The Cards queue: indices into state.cards, the scope's words (Recognition's answer choices come
// from them too).
function buildFlashcardQueue() {
  state.reviewOnlySig = reviewOnlySignature();
  return buildQueue(state.cards);
}

// An empty list: a message in place of the card (the stage's .review-only-none hides it), with Add
// words. Called from renderCard, so it follows every queue change.
function renderReviewOnly() {
  const empty = !!state.flashScopeId && state.queue.length === 0;
  els.reviewOnlyEmpty.hidden = !empty;
  els.stage.classList.toggle('review-only-none', empty);
  if (empty) els.reviewOnlyEmptyTitle.textContent = `'${flashScope()?.name || 'This list'}' has no words yet`;
}

// After a list changes. Away from Cards there's nothing to do: coming back rebuilds the queue if the
// list it shows changed (setView). On Cards (the word dialog opened over it) the queue is rebuilt at
// once, around the card on screen if it's still in.
function syncReviewOnly() {
  if (!state.flashScopeId || state.view !== 'flashcards' || reviewOnlySignature() === state.reviewOnlySig) {
    renderReviewOnly();
    return;
  }
  const c = currentCard();
  loadCards();
  const queue = buildFlashcardQueue();
  let at = c ? queue.findIndex((i) => state.cards[i].key === c.key) : -1;
  if (at > 0 && answeringMode()) {
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
const CARD_MIN_H_TYPING = 200; // Type, a phone's keyboard up: the corners close in on the word
let typingFrom = 0; // the visible height when Type's box took the focus, before the keyboard came
function sizeCards() {
  // Type with a phone's keyboard up (html.type-kb): down to the keyboard, the tab bar hidden.
  const keyboard = document.documentElement.classList.contains('type-kb');
  // Another field's keyboard (html.kb, syncKeyboardUp), the tab bar hidden: as it was till then.
  const otherKeyboard = !keyboard && document.documentElement.classList.contains('kb');
  const room = window.visualViewport?.height ?? window.innerHeight;
  for (const card of [els.card, els.reviewCard]) {
    if (otherKeyboard) continue;
    if (keyboard && room > 0.8 * typingFrom) continue; // the keyboard's still coming: as it was till then
    card.style.height = '';
    if (!PHONE_LAYOUT.matches || state.view !== 'flashcards' || !card.offsetParent) continue;
    const floor = keyboard ? room : document.querySelector('.tabs').getBoundingClientRect().top;
    // The lowest of the stage's parts, and the stage's padding under it, in page coordinates: from
    // the page's own top, which holds however iOS has scrolled it with the keyboard up.
    const bottom = Math.max(...[...els.stage.children].filter((e) => e.getClientRects().length)
      .map((e) => e.getBoundingClientRect().bottom)) - document.documentElement.getBoundingClientRect().top;
    const spare = floor - parseFloat(getComputedStyle(els.stage).paddingBottom) - bottom;
    card.style.height = `${Math.max(keyboard ? CARD_MIN_H_TYPING : CARD_MIN_H, Math.floor(card.offsetHeight + spare))}px`;
  }
}

// Recognition's answers and Recall's grades keep to the band a phone gives them, ‹ ›'s 56 px (two
// lines of an answer; mobile.css): a longer one shrinks, down to 12 px, the style guide's least for
// reading (2026-10-16; it was 70% of three lines' room), so the card (sizeCards) keeps Browse's height
// for it. The few longer still (27 of the 16,800 answers) make the row taller, the card shorter.
function fitPills() {
  const rows = [els.learnPills, els.reviewGrades];
  const pills = rows.flatMap((row) => [...row.children]);
  pills.forEach((pill) => { pill.style.fontSize = ''; });
  if (!PHONE_LAYOUT.matches) return;
  // Each its own height while measured: a row stretches its buttons to the tallest, so an answer
  // shrank, to the floor, until the longest one beside it fitted (2026-10-16).
  rows.forEach((row) => { row.style.alignItems = 'flex-start'; });
  for (const pill of pills) {
    if (!pill.offsetParent) continue;
    const room = parseFloat(getComputedStyle(pill).minHeight);
    const base = parseFloat(getComputedStyle(pill).fontSize);
    for (let k = 0.96; base * k >= 12 && pill.getBoundingClientRect().height > room + 0.5; k -= 0.04) pill.style.fontSize = `${base * k}px`;
  }
  rows.forEach((row) => { row.style.alignItems = ''; });
}

// The back scrolls when there's too much on it, but on a phone the longest idioms went just over
// (6 px, 2026-10-10, once the corner buttons grew): shrink the back the same way, down to 70%, until
// it fits. Backs that fit are untouched. All its lines shrink together (the Thai again, the
// transliteration, the answer, the note) since 2026-10-12: the card sized to fit the screen
// (sizeCards) is shorter at Largest text, and shrinking the answer alone left them over.
// A letter's back (the Alphabet's cards, with its picture: 2026-10-16, the user's report: a large
// picture and a tiny letter, the words cut off): the letter 2.5 times the English's size; when the letter,
// the picture and the words don't fit one above another (an iPhone in Safari: 135 px of room), the
// picture beside the words (.pic-beside), then without the note (.no-note); then, as for any back,
// the words smaller until they fit.
function fitBack(el) {
  const body = el.closest('.face-body');
  const lines = [...body.children];
  for (const line of lines) line.style.fontSize = '';
  body.classList.remove('pic-beside', 'no-note');
  if (!body.offsetParent || !el.textContent) return;
  const pic = body.querySelector('.card-pic:not([hidden])');
  const letter = pic && body.querySelector('.back-script:not([hidden])');
  if (letter) letter.style.fontSize = `${parseFloat(getComputedStyle(letter).fontSize) * 2.5}px`;
  if (pic && body.scrollHeight > body.clientHeight + 1) body.classList.add('pic-beside');
  // Still too tall beside it: the letter's note goes (its class and sound are in its dialog), rather
  // than everything shrinking.
  if (pic && body.scrollHeight > body.clientHeight + 1) body.classList.add('no-note');
  const bases = lines.map((line) => parseFloat(getComputedStyle(line).fontSize));
  for (let k = 0.94; k > 0.69 && body.scrollHeight > body.clientHeight + 1; k -= 0.06) {
    lines.forEach((line, i) => { line.style.fontSize = `${bases[i] * k}px`; });
  }
}

// The card's front, sized to the card: a letter or a short word grows to fill it (2026-10-16, the
// user's call: a single letter looked lost on the card), as large as fits between the corner
// buttons' bands (the face's padding) on one line, up to CARD_TEXT_MAX; long text shrinks, as before.
const CARD_TEXT_MAX = 150;
function fitText(el) {
  el.style.fontSize = '';
  const face = el.closest('.face');
  if (!face?.offsetParent || !el.textContent) return;
  const cs = getComputedStyle(face);
  const room = face.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
  const base = parseFloat(getComputedStyle(el).fontSize);
  const width = face.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  const lineAt = (px) => (parseFloat(getComputedStyle(el).lineHeight) || px * 1.15);
  // Against the face's room: a word with nowhere to break (ขอบคุณ) widens its own box past the card.
  const fits = () => el.scrollWidth <= width + 1 && el.offsetWidth <= width + 1 && el.offsetHeight <= room + 1;
  const oneLine = (px) => el.offsetHeight <= lineAt(px) * 1.5;
  if (fits() && oneLine(base)) {
    let lo = base, hi = Math.min(CARD_TEXT_MAX, room / 1.15);
    for (let i = 0; i < 9 && hi - lo > 1; i++) {
      const mid = (lo + hi) / 2;
      el.style.fontSize = `${mid}px`;
      if (fits() && oneLine(mid)) lo = mid;
      else hi = mid;
    }
    el.style.fontSize = lo > base + 1 ? `${Math.floor(lo)}px` : '';
    return;
  }
  for (let k = 0.94; k > 0.69 && !fits(); k -= 0.06) {
    el.style.fontSize = `${base * k}px`;
  }
}
let fitTimer = null;
window.addEventListener('resize', () => {
  clearTimeout(fitTimer);
  fitTimer = setTimeout(() => { fitCardText(); sizeLetterTiles(); fitTimeSay(); fitTimeQuiz(); }, 150);
});
// The embedded Thai font can arrive after the first fit (font-display: swap), and it's wider than
// the fallback: fit again once it's in.
document.fonts?.addEventListener?.('loadingdone', () => { fitCardText(); sizeLetterTiles(); fitTimeSay(); });

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
    renderTypeBar();
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
  renderTypeBar();
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

// Browse's "3 / 24" and ‹ 🔀 ›. Recognition hides them: it's a stream, and you move on by answering.
// A random card's place is "? / 24" (goRandom). With ‹ › going round, only a single card stops them.
function updateStats() {
  const random = state.randomAt?.queue === state.queue && state.randomAt.pos === state.pos;
  const posText = state.queue.length
    ? `${random ? '?' : state.pos + 1} / ${state.queue.length}`
    : '—';
  els.posBadges.forEach((p) => { p.textContent = posText; });
  els.prevBtn.disabled = els.nextBtn.disabled = els.randomBtn.disabled = state.queue.length < 2;
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
  // In Recognition and Type the card only flips by answering — unless the user has already
  // answered it, in which case they can freely flip to review.
  if (answeringMode() && !state.learnAnswers.has(c.key)) return;
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

// Flashcards' modes (prefs.orderMode, alphaOrderMode). Recognition and Type are streams you move
// through by answering, with no ‹ ›: Type is Recognition with the answer typed in Thai (2026-10-19).
const ORDER_MODES = ['practice', 'test', 'review', 'type'];
function answeringMode() {
  return state.orderMode === 'test' || state.orderMode === 'type';
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

// Browse's ‹ ›, going round: past the last card is the first again, and back from the first the
// last (2026-10-21, the user's request; they stopped at the ends).
// Moving on from a random card forgets it was one: come round to it again and it has its number
// (2026-10-21, the user's report: the "?" came back).
function goPrev() {
  if (answeringMode() || state.queue.length < 2) return;
  state.pos = (state.pos - 1 + state.queue.length) % state.queue.length;
  state.randomAt = null;
  renderCard();
}

function goNext() {
  if (answeringMode() || state.queue.length < 2) return;
  state.pos = (state.pos + 1) % state.queue.length;
  state.randomAt = null;
  renderCard();
}

// Browse's 🔀 (2026-10-21, the user's request): a card from anywhere in the topic, its place shown
// as "? / 24", since in a topic's own order the number gives the word away. The draws go through
// every card before one comes again (a shuffled bag, kept with the queue it's drawn from, so a new
// queue starts a new one), and ‹ › go on from the card drawn.
function goRandom() {
  if (answeringMode() || state.queue.length < 2) return;
  let bag = state.randomBag;
  if (bag?.queue !== state.queue || !bag.left.some((p) => p !== state.pos)) {
    bag = state.randomBag = { queue: state.queue, left: shuffled(state.queue.map((_, p) => p).filter((p) => p !== state.pos)) };
  }
  let pos = bag.left.pop();
  if (pos === state.pos) pos = bag.left.pop(); // reached with ‹ › since: the next one instead
  state.pos = pos;
  state.randomAt = { queue: state.queue, pos };
  renderCard();
}

// ---------- scopes: a topic, a group of topics, a whole category, or a list ----------
// List, Cards and Reading show a scope (state.currentDeckId, prefs.currentDeckId). A scope id is a
// topic's id, `group:<category>::<group>`, `cat:<category>`, `list:<id>` (your lists), or 'all'
// (every topic: Recognition's wrong answers for a short list). resolveScope() gives { id, kind, name, label,
// description, decks, cards, deckOf }: cards are the decks' cards with repeats dropped (a word in
// two topics counts once), and deckOf maps a card key to the first of the scope's decks with it.
// A list has no decks: its cards are its words, and deckOf each word's first topic.
const scopeCache = new Map();
function resolveScope(id) {
  if (!id) return null;
  if (scopeCache.has(id)) return scopeCache.get(id);
  if (id.startsWith('list:')) {
    const scope = resolveListScope(id);
    if (scope) scopeCache.set(id, scope);
    return scope;
  }
  const catOf = (d) => d.category || 'Uncategorized';
  let kind = 'topic';
  let name = '';
  let decks = [];
  if (id === 'all') { // every topic's words (distractorPool); Cards and Reading had it as Everything until 2026-10-20
    [kind, name, decks] = ['all', 'Everything', state.decks.filter((d) => !d.passage)];
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

let deckById = null;
const deckOfId = (id) => (deckById ||= new Map(state.decks.map((d) => [d.id, d]))).get(id);

function resolveListScope(id) {
  const list = listById(id.slice(5));
  if (!list) return null;
  const cards = [];
  const deckOf = new Map();
  // Newest added first, or oldest (Settings → List, the user's call, 2026-10-21: it was oldest).
  // list.words keeps the order they went in; a word put back goes in again, as the newest.
  const keys = getSettings().listOrder === 'oldest' ? list.words : [...list.words].reverse();
  for (const key of keys) {
    const entry = state.cardIndex.get(key);
    if (!entry) continue; // its card was edited or removed
    cards.push(entry.card);
    deckOf.set(key, deckOfId(entry.deckIds.find((d) => !deckOfId(d)?.passage) || entry.deckIds[0]));
  }
  const n = cards.length;
  return { id, kind: 'list', name: list.name, decks: [], cards, deckOf, description: `${n} word${n === 1 ? '' : 's'}`, label: list.name };
}

// What Cards and Reading show: the topic or list the List page shows, the picker's one choice. Cards
// had Everything as well from 2026-10-07 (prefs.flashcardsBy; every word you'd added), and Reading
// with it in the lists spike (every story, by level); the user dropped it on 2026-10-20 as not useful,
// so the picker is the same on all three pages.
function flashScope() {
  if (state.section === 'alphabet') return alphaScope();
  return currentScope();
}

// The topic's cards for the Topics page, and Flashcards': the same list By topic; on Everything
// every topic's cards. Both keep resolveScope's order, so a queue's indices stay valid across a reload.
function loadCards() {
  if (state.section === 'alphabet') { // the letters, every one (nothing to add first)
    state.cards = mergeProgressIntoCards(alphaScope().cards);
    return;
  }
  const topic = currentScope();
  state.listCards = topic ? mergeProgressIntoCards(topic.cards) : [];
  state.cards = state.listCards;
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
  const scope = state.view === 'flashcards' || state.view === 'reading' ? flashScope() : currentScope();
  els.deckButtonLabel.textContent = scope?.label || 'Choose a topic';
  const icon = !scope || scope.kind === 'topic' ? 'topics' : scope.kind === 'list' ? 'mylist' : 'group';
  els.deckButtonIcon.replaceChildren(lineIcon('page-icon', '0 0 24 24', PAGE_ICONS[icon]));
}

function selectDeck(deckId) {
  const deck = resolveScope(deckId);
  if (!deck || deck.kind === 'all') return;
  if (state.reading.active) stopReadAloud();
  if (storyRunOn()) stopReadStories();
  state.currentDeckId = deckId;
  setPreferences({ currentDeckId: deckId });
  if (deckId !== state.flashScopeId) reloadFlashcards(); // a new topic starts Cards afresh
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

// The picker picks the topic or list that List, Cards and Reading share.
function pickerSelectedId() {
  return state.currentDeckId;
}

function pickScope(id) {
  // Add words (pickerFor 'add'): the List page shows where they come from, its 🔁 adding to the
  // list (state.addingTo). Picked plainly, a list becomes where 🔁 adds.
  state.addingTo = state.pickerFor === 'add' ? state.addTo : null;
  if (state.pickerFor !== 'add' && id.startsWith('list:')) setTarget(id.slice(5));
  if (id === state.currentDeckId) { // the same choice again: carry on
    closeDeckPicker();
    freshListCards();
    renderWordlist();
    return;
  }
  selectDeck(id); // rebuilds Flashcards (and a Review session) if its scope changed
  renderDeckButton();
  closeDeckPicker();
}

// The picker's tabs (the lists spike, 2026-10-20; until then Cards' dialog had Everything | By
// topic): Topics (the tree and search) and My lists, on every page. Everything, a third from Cards
// and Reading, went the same day (flashScope).
function renderPickerTabs() {
  const tab = state.pickerTab;
  const adding = state.pickerFor === 'add';
  els.pickerTabs.forEach((b) => b.setAttribute('aria-checked', String(b.dataset.pickerTab === tab)));
  // A line under the tabs only when adding words (the tabs' own taglines went: the user's call, 2026-10-20).
  const into = adding ? `'${listById(state.addTo)?.name || ''}'` : '';
  els.reviewByHelp.hidden = !adding;
  els.reviewByHelp.textContent = !adding ? '' : tab === 'lists' ? `Pick a list, then add its words to ${into}` : `Pick a topic, then add its words to ${into}`;
  // Both tabs search (My lists since 2026-10-20, the user's request): topics and words, or your lists.
  els.deckPickerSearch.placeholder = tab === 'lists' ? 'Search your words' : 'Search topics';
}

function pickPickerTab(tab) {
  if (tab !== state.pickerTab) { // a new tab, a new search
    state.pickerFilter = '';
    els.deckPickerSearch.value = '';
  }
  state.pickerTab = tab;
  renderPickerTabs();
  renderDeckPicker();
  els.deckPickerTree.scrollTop = 0;
}

// My lists: a row for each (as a topic's, with its progress), then New list. Add words leaves out
// the list being added to. A search finds a list by its name or by a word in it (wordMatches).
function renderListsPane() {
  const q = state.pickerFilter.trim();
  const lists = getLists().filter((l) => (state.pickerFor !== 'add' || l.id !== state.addTo)
    && (!q || l.name.toLowerCase().includes(q.toLowerCase()) || resolveScope(listScopeId(l.id)).cards.some((c) => wordMatches(c, q))));
  const rows = lists.map((l) => {
    const id = listScopeId(l.id);
    const scope = resolveScope(id);
    const row = pickerDeckRow({ id, name: l.name, description: scope.description, cards: scope.cards }, { progress: false });
    row.classList.add('list-row');
    return row;
  });
  if (!lists.length) {
    const empty = document.createElement('div');
    empty.className = 'modal-empty';
    empty.textContent = q ? `No list matches "${q}".` : state.pickerFor === 'add' ? 'No other lists yet.' : 'No lists yet. Make one, then add words to it from any topic.';
    rows.push(empty);
  }
  if (state.pickerFor !== 'add') {
    const add = document.createElement('button');
    add.type = 'button';
    add.className = 'ghost new-list';
    add.textContent = '＋ New list';
    add.addEventListener('click', async () => {
      const name = await askListName('New list', '', 'Make list');
      if (!name) return;
      const list = createList(name);
      pickScope(listScopeId(list.id));
      // On its List page, to add words to it, from Cards, Read or Home too (the user's call, 2026-10-22).
      if (state.view !== 'wordlist') setView('wordlist');
    });
    rows.push(add);
  }
  els.deckPickerTree.replaceChildren(...rows);
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

// A topic's row: its name and description, and how many of its words are known (deckProgress) as a
// bar and "known/total". A list's leaves those out (`progress` false; the user's call, 2026-10-20):
// its description already says "N words", and the count read as a puzzle.
function pickerDeckRow(d, { progress = true } = {}) {
  const { known, total: cards } = deckProgress(d.id, d);
  const pct = cards === 0 ? 0 : Math.round((known / cards) * 100);
  const row = document.createElement('button');
  row.type = 'button';
  row.className = 'deck-row' + (d.id === pickerSelectedId() ? ' current' : '');
  row.innerHTML = `
    <span class="deck-row-main">
      <span class="deck-row-name"></span>
      <span class="deck-row-desc"></span>
    </span>` + (progress ? `
    <span class="deck-row-bar"><span class="deck-row-bar-fill" style="width:${pct}%"></span></span>
    <span class="deck-row-count">${known}/${cards}</span>` : '');
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
  if (state.pickerTab === 'lists') {
    renderListsPane();
    return;
  }
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
  const inList = targetWords();
  for (const h of hits) section.appendChild(wordHitRow(h, inList));
  if (total > hits.length) {
    const more = document.createElement('p');
    more.className = 'word-hits-more';
    more.textContent = `Showing the best ${hits.length}. Type more to narrow it down.`;
    section.appendChild(more);
  }
  return section;
}

// A result: tap it to see the word in its topic (the current topic if it's there); 🔁 adds it to
// the target list and 🔊 plays it, as on the Topics page.
function wordHitRow(h, inList) {
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
  const rv = reviewButton(h.key, h.card.thai, inList);
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
  if (state.pickerOpen) state.addingTo = state.pickerFor === 'add' ? state.addTo : null; // as pickScope
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

// With none focused but by a tap, a touch screen's field has the keyboard just while it has the
// focus, and while it does the phone's tab bar goes, as an app's does under its keyboard (html.kb, mobile.css). iOS keeps the bar
// at the foot of the page's full height, which the keyboard doesn't shrink, so the Dictionary's
// results scrolled with the keyboard up showed it halfway up the screen (the user's screenshot,
// 2026-10-19). What's sized to the bar (sizeCards, sizeWritePad) keeps its size meanwhile, and
// the cards fit again when it's back.
const KEYBOARD_FIELDS = 'input[type=text], input[type=search], input[type=number], textarea';
function syncKeyboardUp(field) {
  const up = TOUCH_SCREEN && !!field?.matches?.(KEYBOARD_FIELDS);
  // Type's box and a dialog's are held still instead (holdStill).
  const closes = up && field !== els.typeBox && field !== els.confirmInput;
  document[closes ? 'addEventListener' : 'removeEventListener']('touchstart', dragStart, { passive: true });
  document[closes ? 'addEventListener' : 'removeEventListener']('touchmove', dragClosesKeyboard, { passive: false });
  if (up === document.documentElement.classList.contains('kb')) return;
  document.documentElement.classList.toggle('kb', up);
  if (!up) fitCardText();
}

// With any other field's keyboard up (the Dictionary's search, Settings' and the picker's, Read's
// and a list's, Settings' numbers), iOS let the page, or the sheet over it, be dragged about under
// the keyboard (the user's report, 2026-10-21). So a drag moves nothing, and once it's more than a
// tap's wobble it closes the keyboard, as an app's search does; the next drag scrolls. One on the
// field itself is left alone (it moves the caret). The listeners are there only while it's up
// (syncKeyboardUp), so they don't slow scrolling otherwise.
let dragFrom = null;
function dragStart(e) {
  const t = e.touches[0];
  dragFrom = t ? { x: t.clientX, y: t.clientY } : null;
}
function dragClosesKeyboard(e) {
  const field = document.activeElement;
  const t = e.touches[0];
  if (!t || e.target === field) return;
  if (e.cancelable) e.preventDefault();
  if (!dragFrom || Math.hypot(t.clientX - dragFrom.x, t.clientY - dragFrom.y) < 8) return;
  // The rest of this drag moves nothing either (these listeners go with the focus; without that it
  // scrolled the rest of the way, the probe).
  document.addEventListener('touchmove', holdTillLifted, { passive: false });
  document.addEventListener('touchend', lifted);
  document.addEventListener('touchcancel', lifted);
  field.blur();
}
function holdTillLifted(e) {
  if (e.cancelable) e.preventDefault();
}
function lifted(e) {
  if (e.touches.length) return;
  document.removeEventListener('touchmove', holdTillLifted, { passive: false });
  document.removeEventListener('touchend', lifted);
  document.removeEventListener('touchcancel', lifted);
}

// While a modal is open the page behind it is locked (html.modal-open), so scrolls stay in the sheet.
function setModalOpen(open) {
  document.documentElement.classList.toggle('modal-open', open);
}

// `addTo`: a list's id, for its Add words (openAddWords).
function openDeckPicker({ addTo = null } = {}) {
  state.pickerOpen = true;
  state.lastFocus = document.activeElement;
  els.deckPicker.hidden = false;
  setModalOpen(true);
  els.deckButton.setAttribute('aria-expanded', 'true');
  state.pickerFilter = '';
  els.deckPickerSearch.value = '';
  state.addTo = addTo;
  state.pickerFor = addTo ? 'add' : 'study';
  els.deckPickerTitle.textContent = addTo ? `Add words to '${listById(addTo)?.name || ''}'` : 'Choose a topic or list';
  state.pickerTab = !addTo && state.currentDeckId?.startsWith('list:') ? 'lists' : 'topics';
  renderPickerTabs();
  // Every open starts from the current choice: its category and group open, the rest closed.
  const current = resolveScope(pickerSelectedId());
  state.expandedCategories.clear();
  state.expandedGroups.clear();
  if (current?.decks[0]) {
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

// On a phone Settings is a page (mobile.css), opened from the tab bar's Settings: it stops at the bar,
// whose Settings is lit (html.settings-open), and another tab leaves it (bindEvents). A dialog on
// wider screens. (For a day it was in More's list, which is kept, hidden.)
function openSettings() {
  state.settingsOpen = true;
  document.documentElement.classList.add('settings-open');
  state.lastFocus = document.activeElement;
  els.settingsModal.hidden = false;
  setModalOpen(true);
  els.settingsSection.scrollTop = 0;
  markSettingsScrolled();
  for (const b of [els.settingsButton, els.tabSettings]) b.setAttribute('aria-expanded', 'true');
  markMore();
  renderSettings();
  if (!TOUCH_SCREEN) setTimeout(() => els.settingsSearch.focus(), 0);
}

// The hairline under Settings' search once its list scrolls under it (mobile.css), as the other
// pages' pinned rows have.
function markSettingsScrolled() {
  els.settingsModal.classList.toggle('scrolled', els.settingsSection.scrollTop > 0);
}

function closeSettings() {
  state.settingsOpen = false;
  document.documentElement.classList.remove('settings-open');
  els.settingsModal.hidden = true;
  setModalOpen(false);
  for (const b of [els.settingsButton, els.tabSettings]) b.setAttribute('aria-expanded', 'false');
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
  consonants: { label: 'Consonants', topics: ['script-consonants-all'], hint: 'Tap a letter to hear its name. Hold it for its details.' },
  vowels: { label: 'Vowels', topics: ['script-vowels', 'script-diphthongs'], hint: 'Tap a vowel to hear it. Hold it for its details.' },
  tones: { label: 'Tones', topics: ['script-read-tone'], hint: 'Tap a tone or a mark to learn it, or a syllable in the chart to hear it.' },
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
const alphaScope = () => {
  const set = alphaSetNow();
  if (set === 'tones') addToneDrill();
  return alphaSets[set];
};
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

// The Tones set's cards: Read the Tone's 25, then every one-syllable word in the topics whose tone
// follows the rules (tones.js; not the loanwords and the like in tone_exceptions.txt, which would
// teach the wrong rule), the most used first: about 1,700 (the user's call, 2026-10-14: 25 was far
// too few). Built the first time the set is used, not at startup: a toneBreakdown each.
let toneDrillAdded = false;
function addToneDrill() {
  if (toneDrillAdded || !alphaSets.tones) return;
  toneDrillAdded = true;
  const scope = alphaSets.tones;
  const have = new Set(scope.cards.map((c) => c.thai));
  const scriptIds = new Set(state.decks.filter((d) => d.category === 'Thai Script').map((d) => d.id));
  const best = new Map(); // thai -> its most used card
  for (const { card, deckIds } of state.cardIndex.values()) {
    if (card.alpha || have.has(card.thai) || !/^[\u0E00-\u0E7F]+$/.test(card.thai) || /[\s-]/.test(card.translit || '')) continue;
    if (deckIds.every((id) => scriptIds.has(id))) continue; // Thai Script's spelling examples
    if ((best.get(card.thai)?.n || 0) >= deckIds.length) continue;
    best.set(card.thai, { card, n: deckIds.length });
  }
  const deck = scope.decks[0];
  for (const { card } of [...best.values()].sort((x, y) => y.n - x.n)) {
    const syl = toneBreakdown(card.thai, card.translit);
    if (syl?.length !== 1 || syl[0].exception) continue;
    const c = { thai: card.thai, translit: card.translit, english: `${syl[0].tone} tone — ${card.english}`, note: toneReason(syl[0]),
      ...(card.say ? { say: card.say } : {}), alpha: true, alphaSet: 'tones', pic: null };
    scope.cards.push(c); // also the deck's (the same array)
    scope.deckOf.set(cardKey(c), deck);
    state.cardIndex.set(cardKey(c), { card: c, deckIds: [scope.id] });
  }
}

// Why a syllable has its tone, from toneBreakdown's reading of it: "High class + ไม้โท: falling."
function toneReason(s) {
  const cls = `${cap(CLASS_NAMES[s.cls])} class` + (s.clsWhy ? ` (${s.clsWhy})` : '');
  const how = s.mark ? ` + ${MARK_NAMES[s.mark]}` : s.column === 'live' ? ', live, no mark' : `, dead (${s.column === 'deadShort' ? 'short' : 'long'}), no mark`;
  return `${cls}${how}: ${s.tone}.`;
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
  const writing = getPreferences().alphaPage === 'write';
  els.alphaWrite.hidden = !writing;
  els.alphaTop.hidden = writing;
  if (writing) {
    for (const el of [els.alphaGrid, els.alphaVowels, els.alphaTones]) el.hidden = true;
    renderWrite();
    // Arriving (a tab, the page switch, another set): its name or sound, as moving to it does (the
    // user's call, 2026-10-15). Only straight after a tap: not when the app opens on Write.
    if (navigator.userActivation?.isActive ?? true) speak(cardSay(writeCard()));
    return;
  }
  els.alphaHint.replaceChildren(Object.assign(document.createElement('span'), { className: 'alpha-hint-text', textContent: ALPHA_SETS[set].hint }));
  // One height for the hint or a letter's line (the consonants and vowels: pickAlpha), and the Tones
  // page's hint too, so the pages line up when switching (the user's call); pinned on a phone.
  els.alphaHint.classList.add('line-hint');
  els.alphaTop.classList.add('line-top');
  els.alphaGrid.hidden = set !== 'consonants';
  els.alphaVowels.hidden = set !== 'vowels';
  els.alphaTones.hidden = set !== 'tones';
  if (set === 'vowels') {
    if (!els.alphaVowels.childElementCount) renderVowelGrid();
    sizeVowelTiles();
  }
  if (set === 'tones' && !els.alphaTones.childElementCount) renderTonesPage();
  if (set !== 'consonants' || els.alphaGrid.childElementCount) return; // drawn once
  els.alphaGrid.replaceChildren(...alphaCards.map((c) => {
    const f = letterFacts(c);
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'dict-letter letter-tile' + (f.obsolete ? ' obsolete' : '');
    b.lang = 'th';
    b.textContent = c.thai;
    b.title = `${c.thai} ${c.say?.split(' ')[1] || ''}: ${c.english}`;
    b.dataset.say = cardSay(c); // lit while it plays (markSpeakers)
    b.setAttribute('aria-pressed', 'false');
    // The line: its name in the transliteration's yellow, its sound and picture word, and its class
    // in the class's colour, as the dialog has it (2026-10-15, the user's request).
    b.addEventListener('click', () => pickAlpha(els.alphaGrid, b, c, 'consonants', () => showLetterPop(b, c)));
    onLongPress(b, () => showLetterPop(b, c));
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
  showWordModal();
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

// ---------- the Alphabet: Write ----------

// Tracing (2026-10-14, the user's go-ahead after the plan): the consonant shows faintly on a square
// pad, in the app's looped font, as large as fits; you trace it with a finger and press Check. Scored against the font's
// own shape at WRITE_N × WRITE_N: how much of your line is on the letter (within a band either side)
// and how much of the letter your line covers. What it missed shows red. Where a letter has one head
// loop (found in the glyph as its one loop-sized hole), a green dot marks where to start, and starting
// elsewhere gets a tip; letters with two such loops (ฆ ฉ ฌ ญ ฎ ฏ ฐ ฒ ณ น ม ษ ห) have no dot, which loop
// is the head being unsure, and ก ธ have no head.
const WRITE_N = 240;
const WRITE_INK = 14;        // the line's width as the checks take it, at WRITE_N
const WRITE_LINE = 7;        // the line as the pad shows it: half that (2026-10-15, the user's call: too thick)
// Loosened 2026-10-14 after the user found the check too strict: a finger wobbles more than the
// simulated tracing did (it was band 10, reach 6, passing at 75% on and 85% covered).
const WRITE_BAND = 16;       // how far off the letter a line may stray
const WRITE_REACH = 12;      // how near a line must pass to cover the letter
const WRITE_PASS = { onLetter: 0.6, covered: 0.7 };
const MEMORY_PASS = { f1: 0.65 }; // From memory without the model: its score at the tolerances above, to pass
const MODEL_PASS = { rival: 0.6 }; // From memory with it: another letter named at this; to pass, WRITE_CHECK
// How strict From memory is (Settings → Writing, 2026-10-15, the user's call: Lenient, the first rule,
// passed a loose ธ). A consonant: the model's first pick (among the consonants) at `own`, or Lenient's
// first pick or 10%; Strict, the drawing's shape on the letter's (writeScore's f1) too. A vowel's or
// mark's part: first among its place's shapes at `place` of them, and `whole` of the model's belief.
// Calibrated on Burapha-TH's test writers: right consonants pass 98.8% / 95.6% / ~89%, another
// letter 0.2% / 0.03% / 0.01%; right parts 98.5% / 97.2% / 95.0%.
const WRITE_CHECK = {
  lenient: { own: 0.1, either: true, part: { whole: 0.1, either: true },
    help: 'Your letter passes if the model thinks it at all likely: a loose drawing can pass.' },
  normal: { own: 0.6, part: { place: 0.8, whole: 0.1 },
    help: 'It must be the model\'s first choice, and fairly sure of it.' },
  strict: { own: 0.85, shape: 0.6, part: { place: 0.9, whole: 0.2 },
    help: 'First choice and very sure, and its shape must match the letter\'s.' },
};
const writeCheck = () => WRITE_CHECK[getSettings().writeCheck] || WRITE_CHECK.normal;
const surePct = (p) => ` · ${Math.round(p * 100)}%`;
// From memory tells letters apart at the first, tighter tolerances, or a look-alike's small part
// (ป's tail) would vanish in the loose band: the letter asked for must be within `behind` of the best
// match there, and a rival is named if it wins by more and scores `rival`.
const TELL_APART = { band: 10, reach: 6, behind: 0.05, rival: 0.8 };
const writeFont = (px) => `${px}px "Learn Thai Looped"`;
const write = { strokes: [], drawing: false, result: null, back: [], shown: null }; // back: From memory's letters so far, for ‹; shown: the set and item drawn on (renderWrite)
const writeMemory = () => getPreferences().writeMode === 'memory';
// Letters a learner mixes up when writing: the Look-alike Letters board's groups and a few more pairs.
// From memory checks a drawing against the letter asked for and these.
const WRITE_LOOKALIKES = [['บ', 'ป', 'ษ'], ['ผ', 'ฝ'], ['พ', 'ฟ'], ['ค', 'ศ', 'ฅ'], ['ร', 'ธ'], ['ด', 'ต', 'ค'], ['ข', 'ช', 'ซ', 'ฃ'],
  ['ล', 'ส'], ['อ', 'ฮ'], ['ถ', 'ภ'], ['ฎ', 'ฏ'], ['ท', 'ฑ'], ['ม', 'ฆ'], ['น', 'ม'], ['ห', 'ฬ'], ['ผ', 'พ'], ['ฝ', 'ฟ']];
const lookalikesOf = (ch) => [...new Set(WRITE_LOOKALIKES.filter((g) => g.includes(ch)).flat())].filter((x) => x !== ch);
const writeShapes = new Map(); // letter -> { target, band, count, head }

// What Write practises, by the Alphabet's set (2026-10-15, the user's call): the consonants; the
// vowels, written round a faint อ that holds the consonant's place; the four tone marks, on a faint
// อ. Each set keeps its place (prefs).
const WRITE_CARRIER = 'อ';
let writeToneItems = null;
function writeItems() {
  const set = alphaSetNow();
  if (set === 'vowels') return alphaSets.vowels.cards;
  if (set === 'tones') {
    return writeToneItems ||= (state.decks.find((d) => d.id === 'script-marks')?.cards || [])
      .filter((c) => /^◌[่้๊๋]$/.test(c.thai)).map((c) => ({ ...c, thai: c.thai.replace('◌', WRITE_CARRIER), card: c })); // card: for its dialog
  }
  return alphaCards;
}
const WRITE_INDEX_PREF = { consonants: 'writeIndex', vowels: 'writeVowelIndex', tones: 'writeToneIndex' };
const writeIndexPref = () => WRITE_INDEX_PREF[alphaSetNow()] || 'writeIndex';
const writeIndex = () => Math.min(Math.max(getPreferences()[writeIndexPref()] | 0, 0), writeItems().length - 1);
const writeCard = () => writeItems()[writeIndex()];
// Where a vowel's or mark's carrier อ is in its form (เอือ: 1), or -1 (the consonants; ฤ ฤๅ).
const writeCarrierAt = (ch) => (alphaSetNow() !== 'consonants' && ch.length > 1 ? ch.indexOf(WRITE_CARRIER) : -1);
// The carrier rubbed out of a drawing of the whole form (its fill and a hair round it), so only
// the vowel's or mark's own strokes are left: at the form's origin plus the advance of what's before it.
function eraseCarrier(x, ch, at, p) {
  if (at < 0) return;
  x.save();
  x.globalCompositeOperation = 'destination-out';
  x.lineWidth = 3;
  x.lineJoin = 'round';
  const dx = x.measureText(ch.slice(0, at)).width;
  x.fillText(WRITE_CARRIER, p.x + dx, p.y);
  x.strokeText(WRITE_CARRIER, p.x + dx, p.y);
  x.restore();
}

// Where the letter sits on a pad `size` across: as large as fits in 80% of it, its ink centred. `scale`
// is its font size against 62% of the pad, the size the head-loop limits were measured at.
function placeGlyph(x, ch, size) {
  x.textAlign = 'left';
  x.textBaseline = 'alphabetic';
  x.font = writeFont(100);
  let m = x.measureText(ch);
  const px = Math.min(size * 0.8 * 100 / (m.actualBoundingBoxAscent + m.actualBoundingBoxDescent),
    size * 0.8 * 100 / (m.actualBoundingBoxLeft + m.actualBoundingBoxRight), size * 0.95);
  x.font = writeFont(px);
  m = x.measureText(ch);
  return {
    x: size / 2 - (m.actualBoundingBoxRight - m.actualBoundingBoxLeft) / 2,
    y: size / 2 + (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2,
    scale: px / (size * 0.62),
  };
}

function writeMask(draw) {
  const c = document.createElement('canvas');
  c.width = c.height = WRITE_N;
  const x = c.getContext('2d', { willReadFrequently: true });
  draw(x);
  const d = x.getImageData(0, 0, WRITE_N, WRITE_N).data;
  const m = new Uint8Array(WRITE_N * WRITE_N);
  for (let i = 0; i < m.length; i++) m[i] = d[i * 4 + 3] > 100 ? 1 : 0;
  return m;
}

// The letter's shape, the band around it, and its head: the one loop-sized enclosed hole, or none.
function writeShape(ch) {
  const at = writeCarrierAt(ch);
  const key = `${ch}|${at}`;
  if (writeShapes.has(key)) return writeShapes.get(key);
  const target = writeMask((x) => { const p = placeGlyph(x, ch, WRITE_N); x.fillText(ch, p.x, p.y); eraseCarrier(x, ch, at, p); });
  const bandOf = (w) => writeMask((x) => {
    const p = placeGlyph(x, ch, WRITE_N);
    x.lineWidth = w * 2;
    x.lineJoin = 'round';
    x.strokeText(ch, p.x, p.y);
    x.fillText(ch, p.x, p.y); // the carrier's place too: tracing the faint อ as well is no fault
  });
  const band = bandOf(WRITE_BAND);
  const bandTight = bandOf(TELL_APART.band);
  const N = WRITE_N;
  const k = placeGlyph(document.createElement('canvas').getContext('2d'), ch, N).scale ** 2; // the loop limits, at this size
  const seen = new Uint8Array(N * N);
  const loops = [];
  for (let s = 0; s < N * N; s++) {
    if (target[s] || seen[s]) continue;
    let area = 0, sx = 0, sy = 0, edge = false;
    const stack = [s];
    seen[s] = 1;
    while (stack.length) {
      const p = stack.pop();
      const px = p % N, py = (p / N) | 0;
      area++; sx += px; sy += py;
      if (!px || !py || px === N - 1 || py === N - 1) edge = true;
      for (const [q, ok] of [[p - 1, px > 0], [p + 1, px < N - 1], [p - N, py > 0], [p + N, py < N - 1]]) {
        if (ok && !target[q] && !seen[q]) { seen[q] = 1; stack.push(q); }
      }
    }
    if (!edge && area >= 100 * k && area <= 150 * k) loops.push([sx / area, sy / area]); // a head-sized loop
  }
  let x0 = N, y0 = N, x1 = 0, y1 = 0;
  target.forEach((v, i) => { if (v) { const x = i % N, y = (i / N) | 0; x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); } });
  const head = alphaSetNow() === 'consonants' && loops.length === 1 ? loops[0] : null; // where to start: consonants' heads
  // The carrier's box, 0..1 (From memory sorts a vowel's strokes by where they are against it).
  let carrierBox = null;
  if (at >= 0) {
    const cm = writeMask((x) => { const p = placeGlyph(x, ch, WRITE_N); x.fillText(WRITE_CARRIER, p.x + x.measureText(ch.slice(0, at)).width, p.y); });
    let cx0 = N, cy0 = N, cx1 = 0, cy1 = 0;
    cm.forEach((v, i) => { if (v) { const x = i % N, y = (i / N) | 0; cx0 = Math.min(cx0, x); cx1 = Math.max(cx1, x); cy0 = Math.min(cy0, y); cy1 = Math.max(cy1, y); } });
    carrierBox = [cx0 / N, cy0 / N, cx1 / N, cy1 / N];
  }
  const shape = { target, band, bandTight, count: target.reduce((n, v) => n + v, 0), head, box: [x0, y0, x1, y1], carrierBox };
  writeShapes.set(key, shape);
  return shape;
}

// The strokes, drawn `width` wide on a pad `size` across; `fit` maps a point first (From memory's
// drawing, scaled onto a letter's box).
function drawStrokes(x, size, width, fit = (p) => p) {
  x.lineWidth = width;
  x.lineCap = 'round';
  x.lineJoin = 'round';
  for (const s of write.strokes) {
    x.beginPath();
    s.map(fit).forEach(([u, v], i) => (i ? x.lineTo(u * size, v * size) : x.moveTo(u * size, v * size)));
    if (s.length === 1) { const [u, v] = fit(s[0]); x.lineTo(u * size + 0.01, v * size); }
    x.stroke();
  }
}

// ---------- From memory's handwriting model (tools/train_writing.py, 2026-10-15) ----------
// A small network trained on Burapha-TH, real handwriting of the 44 consonants by over a thousand
// Thai writers (the user's call, when the shape matching proved too strict): it says which letter a
// drawing is, as a probability for each. data/write-model.bin: a header (the layers, their weights'
// places) and float16 weights; run here in plain JavaScript (a few tens of milliseconds).
const WRITE_MODEL_LINE = 2.8; // the lines' width in its 48 box: the handwriting's median (train_writing.py prep)
let writeModelLoad = null;
function writeModel() {
  writeModelLoad ||= fetch('data/write-model.bin').then((r) => {
    if (!r.ok) throw new Error(`write model: ${r.status}`);
    return r.arrayBuffer();
  }).then((buf) => {
    const len = new DataView(buf).getUint32(0, true);
    const head = JSON.parse(new TextDecoder().decode(new Uint8Array(buf, 4, len)));
    const half = new Uint16Array(buf, 4 + len);
    const f16 = (h) => {
      const e = (h >> 10) & 31, f = h & 1023, s = h & 0x8000 ? -1 : 1;
      return e === 0 ? s * f * 2 ** -24 : e === 31 ? (f ? NaN : s * Infinity) : s * (1 + f / 1024) * 2 ** (e - 15);
    };
    const take = ({ offset, shape }) => Float32Array.from(half.subarray(offset, offset + shape.reduce((a, b) => a * b, 1)), f16);
    head.layers = head.layers.map((l) => (l.w ? { ...l, shape: l.w.shape, w: take(l.w), b: take(l.b) } : l));
    return head;
  });
  writeModelLoad.catch(() => { writeModelLoad = null; }); // try again next time
  return writeModelLoad;
}

// The model on one image (size × size, 0..1): a probability per letter (model.letters' order).
function runWriteModel(m, input) {
  let x = input;
  let c = 1;
  let h = m.size;
  let w = m.size;
  for (const l of m.layers) {
    if (l.type === 'conv') {
      const [co, ci, k] = l.shape;
      const r = (k - 1) / 2;
      const out = new Float32Array(co * h * w);
      for (let o = 0; o < co; o++) {
        const ob = o * h * w;
        out.fill(l.b[o], ob, ob + h * w);
        for (let i = 0; i < ci; i++) {
          const ib = i * h * w;
          for (let ky = 0; ky < k; ky++) {
            for (let kx = 0; kx < k; kx++) {
              const wt = l.w[((o * ci + i) * k + ky) * k + kx];
              if (!wt) continue;
              const dy = ky - r, dx = kx - r;
              const y0 = Math.max(0, -dy), y1 = Math.min(h, h - dy), x0 = Math.max(0, -dx), x1 = Math.min(w, w - dx);
              for (let y = y0; y < y1; y++) {
                const orow = ob + y * w, irow = ib + (y + dy) * w + dx;
                for (let xx = x0; xx < x1; xx++) out[orow + xx] += wt * x[irow + xx];
              }
            }
          }
        }
      }
      x = out;
      c = co;
    } else if (l.type === 'relu') {
      for (let i = 0; i < x.length; i++) if (x[i] < 0) x[i] = 0;
    } else if (l.type === 'pool') {
      const h2 = h >> 1, w2 = w >> 1;
      const out = new Float32Array(c * h2 * w2);
      for (let i = 0; i < c; i++) {
        for (let y = 0; y < h2; y++) {
          for (let xx = 0; xx < w2; xx++) {
            const a = i * h * w + 2 * y * w + 2 * xx;
            out[(i * h2 + y) * w2 + xx] = Math.max(x[a], x[a + 1], x[a + w], x[a + w + 1]);
          }
        }
      }
      x = out;
      h = h2;
      w = w2;
    } else if (l.type === 'dense') {
      const [no, ni] = l.shape;
      const out = new Float32Array(no);
      for (let o = 0; o < no; o++) {
        let s = l.b[o];
        for (let i = 0; i < ni; i++) s += l.w[o * ni + i] * x[i];
        out[o] = s;
      }
      x = out;
      c = no;
      h = w = 1;
    }
  }
  const top = Math.max(...x);
  const e = Array.from(x, (v) => Math.exp(v - top));
  const sum = e.reduce((a, b) => a + b, 0);
  return e.map((v) => v / sum);
}

// The drawing as the model sees it (train_writing.py normalize): cropped to its ink, fitted into the
// model's box with `inner` on the long side, centred, shape kept, its lines WRITE_MODEL_LINE wide.
function writeImage(m, strokes = write.strokes) {
  const pts = strokes.flat();
  const ux0 = Math.min(...pts.map((p) => p[0])), ux1 = Math.max(...pts.map((p) => p[0]));
  const uy0 = Math.min(...pts.map((p) => p[1])), uy1 = Math.max(...pts.map((p) => p[1]));
  const k = (m.inner - WRITE_MODEL_LINE) / Math.max(ux1 - ux0, uy1 - uy0, 1e-3);
  const cx = (ux0 + ux1) / 2, cy = (uy0 + uy1) / 2;
  const canvas = Object.assign(document.createElement('canvas'), { width: m.size, height: m.size });
  const x = canvas.getContext('2d');
  x.strokeStyle = '#000';
  x.lineWidth = WRITE_MODEL_LINE;
  x.lineCap = 'round';
  x.lineJoin = 'round';
  const at = ([u, v]) => [(u - cx) * k + m.size / 2, (v - cy) * k + m.size / 2];
  for (const s of strokes) {
    x.beginPath();
    s.map(at).forEach(([u, v], i) => (i ? x.lineTo(u, v) : x.moveTo(u, v)));
    if (s.length === 1) { const [u, v] = at(s[0]); x.lineTo(u + 0.01, v); }
    x.stroke();
  }
  const d = x.getImageData(0, 0, m.size, m.size).data;
  return Float32Array.from({ length: m.size * m.size }, (_, i) => d[i * 4 + 3] / 255);
}

// The model's probabilities for some strokes, as a map from character to probability (all of its
// classes: the consonants' model has 44, the second 68).
function modelProbs(model, strokes) {
  const p = runWriteModel(model, writeImage(model, strokes));
  return new Map([...model.letters].map((ch, i) => [ch, p[i]]));
}

// ---------- From memory: vowels and tone marks (2026-10-15) ----------
// Written round the faint อ: the strokes sorted by where they are against it (before, above, below,
// after; on it, the carrier itself, set aside), each place's strokes read by the model, and the
// parts compared with the form's. A part passes if the model gives it PART_PASS of its whole
// belief (all 68 shapes: among a place's few, a scribble would score); another shape is named only
// when the model is sure of it among those that go there.
const PART_SLOT = (ch) => ('เแโใไ'.includes(ch) ? 'before' : 'ัิีึื็่้๊๋์'.includes(ch) ? 'above' : 'ุู'.includes(ch) ? 'below' : 'after');
const SLOT_SHAPES = { before: 'เแโใไ', above: 'ัิีึื็่้๊๋์', below: 'ุู', after: 'ะาำอยว' };
const SLOT_WORDS = { before: 'in front', above: 'above', below: 'below', after: 'after the อ' };
const SLOT_HEADS = { before: 'In front', above: 'Above', below: 'Below', after: 'After' };
const TONE_MARKS = '่้๊๋';
const PART_PASS = { rival: 0.6 }; // another shape named at this, among its place's; to pass, WRITE_CHECK's `part`
const partName = (ch) => ('ัิีึื็่้๊๋์ุู'.includes(ch) ? `◌${ch}` : ch);
const writeParts = (form) => {
  const at = form.indexOf(WRITE_CARRIER);
  return [...form].filter((_, i) => i !== at).map((ch) => ({ ch, slot: PART_SLOT(ch) }));
};
const strokeBox = (s) => [Math.min(...s.map((p) => p[0])), Math.min(...s.map((p) => p[1])), Math.max(...s.map((p) => p[0])), Math.max(...s.map((p) => p[1]))];

// Strokes that touch (a point of one within `gap` of the other's) are one part, however many pieces
// it was drawn in, and its place is the whole part's.
function joinTouching(strokes, gap = 0.015) {
  const parent = strokes.map((_, i) => i);
  const find = (i) => (parent[i] === i ? i : (parent[i] = find(parent[i])));
  const near = (a, b) => a.some((p) => b.some((q) => Math.abs(p[0] - q[0]) < gap && Math.abs(p[1] - q[1]) < gap));
  for (let i = 0; i < strokes.length; i++) {
    for (let j = i + 1; j < strokes.length; j++) if (find(i) !== find(j) && near(strokes[i], strokes[j])) parent[find(i)] = find(j);
  }
  const parts = new Map();
  strokes.forEach((s, i) => parts.set(find(i), [...(parts.get(find(i)) || []), s]));
  return [...parts.values()];
}

// A part's place against the carrier's box: its middle left of it is before (เ แ โ ใ ไ, tall,
// beside the อ); all of it over the อ's top is above, wherever across (a tone mark sits over the
// อ's right edge); all of it under the อ's foot is below; its middle right of it is after; the rest
// is the carrier itself (a learner who writes the อ too).
function partSlot(strokes, b) {
  const [x0, y0, x1, y1] = strokeBox(strokes.flat());
  const cx = (x0 + x1) / 2;
  const w = b[2] - b[0], h = b[3] - b[1];
  if (cx < b[0]) return 'before';
  if (y1 < b[1] + h * 0.15) return 'above';
  if (y0 > b[3] - h * 0.15) return 'below';
  if (cx > b[2] - w * 0.15) return 'after';
  return 'carrier';
}

// Strokes in a place, split into `n` parts at the widest gaps between them, left to right.
function splitParts(strokes, n) {
  if (n <= 1 || strokes.length <= 1) return [strokes];
  const sorted = [...strokes].sort((a, b) => strokeBox(a)[0] - strokeBox(b)[0]);
  let right = strokeBox(sorted[0])[2];
  const gaps = [];
  for (let i = 1; i < sorted.length; i++) {
    const [x0, , x1] = strokeBox(sorted[i]);
    gaps.push({ i, gap: x0 - right });
    right = Math.max(right, x1);
  }
  const cuts = gaps.sort((a, b) => b.gap - a.gap).slice(0, n - 1).map((g) => g.i).sort((a, b) => a - b);
  const bounds = [0, ...cuts, sorted.length];
  return bounds.slice(0, -1).map((from, k) => sorted.slice(from, bounds[k + 1]));
}

// { pass, text, detail } for a vowel's or tone mark's drawing (the set's form c.thai, its shape).
function checkParts(c, shape, model) {
  const tones = alphaSetNow() === 'tones';
  const parts = writeParts(c.thai);
  const read = (strokes, shapes) => {
    const probs = modelProbs(model, strokes);
    const among = [...shapes].map((ch) => ({ ch, p: probs.get(ch) || 0 }));
    const sum = among.reduce((a, x) => a + x.p, 0) || 1;
    return { probs, best: among.sort((a, b) => b.p - a.p)[0], sure: among[0].p / sum, share: (ch) => (probs.get(ch) || 0) / sum };
  };
  const rule = writeCheck().part;
  let least = 1; // the least sure part, for the feedback
  // ฤ and ฤๅ have no carrier: the first part read among the consonants and ฤ ฦ; ๅ, which the model
  // doesn't know, only has to be there.
  if (!shape.carrierBox) {
    const groups = splitParts(write.strokes, parts.length);
    const r = read(groups[0], [...model.letters].filter((ch) => alphaCards.some((a) => a.thai === ch) || 'ฤฦ'.includes(ch)).join(''));
    const own = r.probs.get(parts[0].ch) || 0;
    const first = r.best.ch === parts[0].ch;
    const ok = rule.either ? first || own >= rule.whole : first && r.share(parts[0].ch) >= rule.place && own >= rule.whole;
    if (!ok) return { pass: false, text: 'Not quite', detail: { own } };
    if (groups.length < parts.length) return { pass: false, text: `Missing ${parts[1].ch} after`, detail: { own } };
    return { pass: true, text: `✓ ${c.thai}${surePct(r.share(parts[0].ch))}`, detail: { own } };
  }
  const bySlot = { before: [], above: [], below: [], after: [] };
  for (const part of joinTouching(write.strokes)) {
    const slot = partSlot(part, shape.carrierBox);
    if (slot !== 'carrier') bySlot[slot].push(...part);
  }
  const want = (slot) => parts.filter((p) => p.slot === slot);
  // ำ's circle sits over the อ's right edge: with nothing wanted above, it's part of ำ.
  if (!want('above').length && want('after').some((p) => p.ch === 'ำ')) bySlot.after.push(...bySlot.above.splice(0));
  const problems = [];
  const detail = {};
  for (const slot of ['before', 'above', 'below', 'after']) {
    const wanted = want(slot);
    const strokes = bySlot[slot];
    if (!wanted.length) {
      if (strokes.length) problems.push(tones ? 'A tone mark goes above' : `Nothing goes ${SLOT_WORDS[slot]}`);
      continue;
    }
    if (!strokes.length) {
      problems.push(tones ? 'Write the mark above the อ' : `Missing ${wanted.map((p) => partName(p.ch)).join(' ')} ${SLOT_WORDS[slot]}`);
      continue;
    }
    const groups = splitParts(strokes, wanted.length);
    wanted.forEach((p, k) => {
      if (!groups[k]) { problems.push(`Missing ${partName(p.ch)} ${SLOT_WORDS[slot]}`); return; }
      const r = read(groups[k], tones ? TONE_MARKS : SLOT_SHAPES[slot]);
      const own = r.probs.get(p.ch) || 0;
      const share = r.share(p.ch);
      least = Math.min(least, share);
      detail[p.ch] = { own: +own.toFixed(3), share: +share.toFixed(3), best: r.best.ch, sure: +r.sure.toFixed(2) };
      const first = r.best.ch === p.ch;
      if (rule.either ? own >= rule.whole || first && own >= rule.whole / 4 : first && share >= rule.place && own >= rule.whole) return;
      problems.push(r.best.ch !== p.ch && r.sure >= PART_PASS.rival
        ? `${SLOT_HEADS[slot]}: ${partName(p.ch)}, not ${partName(r.best.ch)}`
        : `${SLOT_HEADS[slot]}: should be ${partName(p.ch)}`);
    });
  }
  const pass = !problems.length;
  return { pass, text: pass ? `✓ ${tones ? c.say : c.thai}${surePct(least)}` : problems[0], detail }; // the first problem: one line
}

// From memory: the drawing, wherever and however big, scaled (keeping its shape) and centred onto a
// letter's box on the pad, so it can be laid over the letter.
function fitTo(shape) {
  const pts = write.strokes.flat();
  const ux0 = Math.min(...pts.map((p) => p[0])), ux1 = Math.max(...pts.map((p) => p[0]));
  const uy0 = Math.min(...pts.map((p) => p[1])), uy1 = Math.max(...pts.map((p) => p[1]));
  const [gx0, gy0, gx1, gy1] = shape.box.map((v) => v / WRITE_N);
  const k = Math.min((gx1 - gx0) / Math.max(ux1 - ux0, 1e-3), (gy1 - gy0) / Math.max(uy1 - uy0, 1e-3));
  const ucx = (ux0 + ux1) / 2, ucy = (uy0 + uy1) / 2, gcx = (gx0 + gx1) / 2, gcy = (gy0 + gy1) / 2;
  return ([u, v]) => [gcx + (u - ucx) * k, gcy + (v - ucy) * k];
}

// How well the drawing (through `fit`) matches a letter: on (the line's share on it), covered (its
// share under the line), and the two together (f1).
function writeScore(shape, fit, tight = false) {
  const ink = writeMask((x) => drawStrokes(x, WRITE_N, WRITE_INK, fit));
  const reach = writeMask((x) => drawStrokes(x, WRITE_N, WRITE_INK + (tight ? TELL_APART.reach : WRITE_REACH) * 2, fit));
  const band = tight ? shape.bandTight : shape.band;
  let inked = 0, onLetter = 0, covered = 0;
  const missed = new Uint8Array(ink.length);
  for (let i = 0; i < ink.length; i++) {
    if (ink[i]) { inked++; if (band[i]) onLetter++; }
    if (shape.target[i]) { if (reach[i]) covered++; else missed[i] = 1; }
  }
  const on = inked ? onLetter / inked : 0;
  const cov = covered / shape.count;
  return { on, cov, f1: on + cov ? (2 * on * cov) / (on + cov) : 0, ink: inked / shape.count, missed }; // ink: the line's area against the letter's
}

function renderWrite() {
  const c = writeCard();
  if (!c) return;
  const set = alphaSetNow();
  // Another item (another set, or any way but ‹ ›, which clear it themselves): a clean pad (2026-10-16,
  // the user's report: a vowel traced stayed on the pad over the consonant after switching sets).
  // From memory's ‹ history is the set's places, so it goes with the set.
  const shown = `${set}:${c.thai}`;
  if (write.shown !== shown) {
    if (write.shown?.split(':')[0] !== set) write.back = [];
    write.strokes = [];
    write.result = null;
    write.drawing = false;
    write.shown = shown;
  }
  document.querySelectorAll('[data-write-mode]').forEach((b) => b.setAttribute('aria-checked', b.dataset.writeMode === (writeMemory() ? 'memory' : 'trace') ? 'true' : 'false'));
  if (writeMemory()) writeModel().catch(() => {}); // ready by the first Check
  // The Letters page's line (alphaLineText), the user's call (2026-10-15): the letter, then its rows.
  // From memory names it without showing it: a consonant's picture in the letter's place; a vowel or
  // mark, which have none, an empty box. The letter keeps its room either way (hidden From memory,
  // its slot at least the picture's width), so the rows don't move between Trace and From memory.
  const slot = Object.assign(document.createElement('button'), { type: 'button', className: 'write-slot', title: 'Hear it' });
  slot.addEventListener('click', () => speak(cardSay(c)));
  const glyph = Object.assign(document.createElement('span'), { className: 'alpha-line-glyph', lang: 'th', textContent: c.thai });
  slot.append(glyph);
  if (writeMemory()) {
    glyph.style.visibility = 'hidden';
    slot.append(c.pic ? Object.assign(document.createElement('img'), { className: 'alpha-line-pic write-cover', src: picSrc(c.pic), alt: '', width: 52, height: 52 })
      : Object.assign(document.createElement('span'), { className: 'write-blank write-cover' }));
  }
  const words = Object.assign(document.createElement('span'), { className: 'alpha-line-text' });
  // Details, as on the Letters page (the user's call): its dialog. From memory it would give the
  // answer away, so it's there (taking its room) only once the drawing is checked (drawWritePad).
  // A speaker (the user's call, 2026-10-15): the name or sound again; lit while it plays (markSpeakers).
  // At the row's right end, so it stays put From memory, where Details waits hidden before it.
  const say = Object.assign(document.createElement('button'), { type: 'button', className: 'row-speak write-speak', title: 'Hear it' });
  say.setAttribute('aria-label', 'Hear it');
  say.dataset.say = cardSay(c);
  say.append(speakerIcon());
  say.addEventListener('click', () => speakerPress(say, cardSay(c)));
  const details = Object.assign(document.createElement('button'), { type: 'button', className: 'ghost alpha-line-more', textContent: 'Details ›' });
  details.addEventListener('click', () => (set === 'vowels' ? showVowelPop(details, c) : set === 'tones' ? showMarkPop(details, c.card) : showLetterPop(details, c)));
  els.writeName.replaceChildren(slot, words, details, say); // the speaker at the right, Details before it (the user's call)
  fillAlphaText(words, c, set);
  sizeWritePad();
  document.fonts.load(writeFont(100), c.thai).then(drawWritePad);
  drawWritePad();
}

// The pad as big as the screen leaves (2026-10-15, the user's reports: on an iPhone 12 Pro in Safari
// the ‹ Check › row sat under the tab bar; then, as Cards' card does): on a phone the width it has and
// the height down to the buttons, which sit 12 px above the tab bar (taller than wide on a tall screen,
// shorter on a short one; the buttons 18 px under it and 18 above the tab bar, as Cards'); on a wider screen, square. Its drawing square, the largest that fits, is
// in its middle (writeSquare): the letter, the strokes and the checks are in that square's terms.
function sizeWritePad() {
  const pad = els.writeCanvas.parentElement;
  if (els.alphaWrite.hidden || !pad.offsetParent) return;
  if (document.documentElement.classList.contains('kb')) return; // a field's keyboard up, the tab bar hidden: as it was
  pad.style.height = '';
  const full = pad.clientWidth;
  if (!PHONE_LAYOUT.matches) { pad.style.height = `${full}px`; return; }
  const floor = document.querySelector('.tabs').getBoundingClientRect().top;
  const top = pad.getBoundingClientRect().top + window.scrollY; // where it sits with the page at its top
  pad.style.height = `${Math.max(200, Math.floor(floor - top - 18 - els.writeActions.offsetHeight - 18))}px`; // the buttons in the middle of 36 px, as Cards'
}

// The pad's drawing square: its side and where it starts in the pad (CSS pixels).
function writeSquare(w, h) {
  const S = Math.min(w, h);
  return { S, ox: (w - S) / 2, oy: (h - S) / 2 };
}

function drawWritePad() {
  const canvas = els.writeCanvas;
  const PW = canvas.clientWidth, PH = canvas.clientHeight;
  if (!PW || !PH) return;
  const dpr = window.devicePixelRatio || 1;
  if (canvas.width !== Math.round(PW * dpr) || canvas.height !== Math.round(PH * dpr)) {
    canvas.width = Math.round(PW * dpr);
    canvas.height = Math.round(PH * dpr);
  }
  const x = canvas.getContext('2d');
  x.setTransform(dpr, 0, 0, dpr, 0, 0);
  x.clearRect(0, 0, PW, PH);
  // Everything from here in the drawing square, W across (writeSquare).
  const { S: W, ox, oy } = writeSquare(PW, PH);
  const toSquare = () => x.setTransform(dpr, 0, 0, dpr, ox * dpr, oy * dpr);
  toSquare();
  const css = getComputedStyle(document.documentElement);
  const ch = writeCard().thai;
  const shape = writeShape(ch);
  const memory = writeMemory();
  // The letter to trace, faint; From memory shows it only once checked, to compare. A vowel's or a
  // mark's carrier อ fainter still: it only holds the place (eraseCarrier: the rest drawn on its own).
  const ink = css.getPropertyValue('--ink').trim() || '#ccc';
  const at = writeCarrierAt(ch);
  const details = els.writeName.querySelector('.alpha-line-more');
  if (details) details.style.visibility = memory && !write.result ? 'hidden' : ''; // From memory: once checked
  x.fillStyle = ink;
  const p = placeGlyph(x, ch, W);
  if (at < 0) {
    x.globalAlpha = memory ? (write.result ? 0.35 : 0) : 0.3;
    x.fillText(ch, p.x, p.y);
  } else if (!memory || write.result) { // From memory: the อ alone until checked
    x.globalAlpha = 0.1;
    x.fillText(ch, p.x, p.y);
    const part = document.createElement('canvas');
    part.width = part.height = Math.round(W * dpr);
    const px = part.getContext('2d');
    px.setTransform(dpr, 0, 0, dpr, 0, 0);
    px.fillStyle = ink;
    const q = placeGlyph(px, ch, W);
    px.fillText(ch, q.x, q.y);
    eraseCarrier(px, ch, at, q);
    x.setTransform(1, 0, 0, 1, 0, 0);
    x.globalAlpha = 0.3;
    x.drawImage(part, Math.round(ox * dpr), Math.round(oy * dpr));
    toSquare();
  } else {
    x.globalAlpha = 0.1;
    x.fillText(WRITE_CARRIER, p.x + x.measureText(ch.slice(0, at)).width, p.y);
  }
  x.globalAlpha = 1;
  // After a Check that fell short: what the line missed, red (tracing).
  if (write.result && !write.result.pass && !memory) {
    const m = document.createElement('canvas');
    m.width = m.height = WRITE_N;
    const mx = m.getContext('2d');
    const img = mx.createImageData(WRITE_N, WRITE_N);
    write.result.missed.forEach((v, i) => { if (v) img.data.set([224, 68, 58, 230], i * 4); });
    mx.putImageData(img, 0, 0);
    x.drawImage(m, 0, 0, W, W);
  }
  canvas.dataset.head = shape.head ? shape.head.map(Math.round).join(',') : ''; // where the head is, at WRITE_N (for tests)
  // Where to start (tracing).
  if (shape.head && !memory) {
    x.fillStyle = '#3c9d61';
    x.beginPath();
    x.arc(shape.head[0] * W / WRITE_N, shape.head[1] * W / WRITE_N, Math.max(6, W * 0.022), 0, Math.PI * 2);
    x.fill();
  }
  // Your line.
  x.strokeStyle = css.getPropertyValue('--accent').trim() || '#f7b733';
  drawStrokes(x, W, WRITE_LINE * W / WRITE_N);
  if (!write.result) {
    els.writeFeedback.className = 'write-feedback';
    // One short line (2026-10-15, the user's call: the feedback pushed the buttons under the tab bar).
    els.writeFeedback.textContent = write.strokes.length ? ''
      : memory && alphaSetNow() === 'vowels' ? (at >= 0 ? 'Write this vowel round the faint อ' : 'Write this vowel')
      : memory && alphaSetNow() === 'tones' ? 'Write this tone mark on the faint อ'
      : memory ? 'Write the letter for this picture'
      : shape.head ? 'Trace it, starting at the green dot'
      : alphaSetNow() === 'tones' ? 'Trace the tone mark'
      : at >= 0 ? 'Trace the vowel round the faint อ'
      : alphaSetNow() === 'vowels' ? 'Trace the vowel' : 'Trace the letter';
  }
}

async function checkWrite() {
  if (!write.strokes.length) return;
  const c = writeCard();
  const memory = writeMemory();
  const model = memory ? await writeModel().catch(() => null) : null; // without it (offline, first time), the shapes
  if (!write.strokes.length || writeCard() !== c) return; // cleared, or moved on, meanwhile
  const shape = writeShape(c.thai);
  if (memory && alphaSetNow() !== 'consonants') { // a vowel or tone mark (checkParts)
    const r = model && model.letters.length > alphaCards.length ? checkParts(c, shape, model)
      : { pass: false, text: 'Needs the handwriting model: try online' };
    els.writeFeedback.dataset.score = JSON.stringify(r.detail || {}); // for tuning
    write.result = { pass: r.pass, missed: new Uint8Array(WRITE_N * WRITE_N) };
    els.writeFeedback.className = 'write-feedback ' + (r.pass ? 'good' : 'bad');
    els.writeFeedback.textContent = r.text;
    drawWritePad();
    return;
  }
  const fit = memory ? fitTo(shape) : undefined;
  const score = writeScore(shape, fit);
  // The head and loop-first tips went with the long feedback (2026-10-15, the user's call); the green
  // dot still shows where to start.
  let pass;
  let text;
  if (model) {
    // The handwriting model: the letter asked for passes if it's the model's first pick or likely
    // enough (MODEL_PASS); another letter is named only when the model is sure of it. A drawing
    // that's mostly fill (more ink than twice the letter's) isn't a try.
    // Among the consonants only (the second model knows vowels and marks too).
    const probs = modelProbs(model, write.strokes);
    const cons = alphaCards.map((a) => a.thai).filter((ch) => probs.has(ch));
    const sum = cons.reduce((a, ch) => a + probs.get(ch), 0) || 1;
    const ranked = cons.map((ch) => ({ ch, p: probs.get(ch) / sum })).sort((a, b) => b.p - a.p);
    const own = (probs.get(c.thai) || 0) / sum;
    const fair = score.ink <= 2;
    els.writeFeedback.dataset.score = JSON.stringify({ model: 1, own: +own.toFixed(3), best: ranked[0].ch, bestP: +ranked[0].p.toFixed(3), next: ranked[1].ch, nextP: +ranked[1].p.toFixed(3), ink: +score.ink.toFixed(2) }); // for tuning
    const level = writeCheck();
    const first = ranked[0].ch === c.thai;
    pass = fair && (level.either ? first || own >= level.own : first && own >= level.own && (!level.shape || score.f1 >= level.shape));
    text = pass ? `✓ ${c.thai}${surePct(own)}`
      : fair && ranked[0].ch !== c.thai && ranked[0].p >= MODEL_PASS.rival ? `Looks more like ${ranked[0].ch} than ${c.thai}`
      : `Not quite${first ? surePct(own) : ''}`;
  } else if (memory) {
    // Which letter it looks like: against every consonant, each with the drawing fitted to its box,
    // at the tighter tolerances.
    const own = writeScore(shape, fit, true).f1;
    const rivals = alphaCards.filter((o) => o.thai !== c.thai).map((o) => ({ ch: o.thai, f1: writeScore(writeShape(o.thai), fitTo(writeShape(o.thai)), true).f1 }));
    const best = rivals.reduce((b, x) => (x.f1 > b.f1 ? x : b), { ch: c.thai, f1: own });
    els.writeFeedback.dataset.score = JSON.stringify({ f1: +score.f1.toFixed(3), own: +own.toFixed(3), best: best.ch, bestF1: +best.f1.toFixed(3), ink: +score.ink.toFixed(2) }); // for tuning
    // Calibrated 2026-10-14 on every consonant drawn in two other looped fonts (FreeSerif, Noto Serif
    // Thai) as stand-ins for other hands, then loosened (MEMORY_PASS) when the user found it strict.
    // A drawing that's mostly fill (more ink than twice the letter's) isn't a try.
    const fair = score.ink <= 2;
    pass = fair && score.f1 >= MEMORY_PASS.f1 && best.f1 <= own + TELL_APART.behind;
    text = pass ? `✓ ${c.thai}`
      : fair && best.ch !== c.thai && best.f1 >= TELL_APART.rival ? `Looks more like ${best.ch} than ${c.thai}`
      : 'Not quite';
  } else {
    pass = score.on >= WRITE_PASS.onLetter && score.cov >= WRITE_PASS.covered;
    const missed = score.cov < WRITE_PASS.covered, off = score.on < WRITE_PASS.onLetter;
    text = pass ? '✓ Well done' : missed && off ? 'Trace the red parts; keep to the letter' : missed ? 'Trace the red parts too' : 'Keep your line on the letter';
  }
  write.result = { pass, missed: score.missed, on: score.on, cov: score.cov, f1: score.f1 };
  els.writeFeedback.className = 'write-feedback ' + (pass ? 'good' : 'bad');
  els.writeFeedback.textContent = text;
  drawWritePad();
}

function clearWrite() {
  write.strokes = [];
  write.result = null;
  drawWritePad();
}

function moveWrite(step) {
  const n = writeItems().length;
  let to = (writeIndex() + step + n) % n;
  if (writeMemory()) { // at random, so the next letter can't be guessed; ‹ goes back through them
    if (step > 0) {
      write.back.push(writeIndex());
      do to = Math.floor(Math.random() * n); while (to === writeIndex() && n > 1);
    } else if (write.back.length) to = write.back.pop();
  }
  setPreferences({ [writeIndexPref()]: to });
  clearWrite();
  renderWrite();
  speak(cardSay(writeCard()));
}

function bindWritePad() {
  const canvas = els.writeCanvas;
  const at = (e) => { // in the drawing square's terms, 0..1 (writeSquare); outside it, beyond them
    const r = canvas.getBoundingClientRect();
    const { S, ox, oy } = writeSquare(r.width, r.height);
    return [(e.clientX - r.left - ox) / S, (e.clientY - r.top - oy) / S];
  };
  canvas.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    try { canvas.setPointerCapture(e.pointerId); } catch { /* a pointer that can't be captured still draws */ }
    if (write.result) { write.strokes = []; write.result = null; } // a new try after a Check
    write.drawing = true;
    write.strokes.push([at(e)]);
    drawWritePad();
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!write.drawing) return;
    write.strokes[write.strokes.length - 1].push(at(e));
    drawWritePad();
  });
  const end = () => { write.drawing = false; };
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);
  document.getElementById('write-clear').addEventListener('click', clearWrite);
  document.getElementById('write-check').addEventListener('click', checkWrite);
  document.getElementById('write-prev').addEventListener('click', () => moveWrite(-1));
  document.getElementById('write-next').addEventListener('click', () => moveWrite(1));
  document.querySelectorAll('[data-write-mode]').forEach((b) => b.addEventListener('click', () => {
    setPreferences({ writeMode: b.dataset.writeMode === 'memory' ? 'memory' : 'trace' });
    write.back = [];
    clearWrite();
    renderWrite();
  }));
  window.addEventListener('resize', () => { if (!els.alphaWrite.hidden) { sizeWritePad(); drawWritePad(); } });
}

// ---------- the Alphabet's vowels ----------

// The grid's sections (2026-10-15, the user's call: split by kind, in the order Thai schools teach,
// which reads straight through them): the nine short and long pairs, three to a row; the diphthongs;
// the extra vowels, the four with a final built in and ฤ ฤๅ.
const VOWEL_SECTIONS = [
  { title: 'The nine vowels', note: 'short and long',
    groups: [['อะ', 'อา'], ['อิ', 'อี'], ['อึ', 'อือ'], ['อุ', 'อู'], ['เอะ', 'เอ'], ['แอะ', 'แอ'], ['โอะ', 'โอ'], ['เอาะ', 'ออ'], ['เออะ', 'เออ']] },
  { title: 'Diphthongs', note: 'two vowels in one', groups: [['เอียะ', 'เอีย'], ['เอือะ', 'เอือ'], ['อัวะ', 'อัว']] },
  { title: 'Extra vowels (สระเกิน)', note: 'four with a final built in, and two from Sanskrit',
    groups: [['อำ', 'ใอ', 'ไอ', 'เอา'], ['ฤ', 'ฤๅ']], cls: 'vowel-extras' },
];
const VOWEL_GROUPS = VOWEL_SECTIONS.flatMap((s) => s.groups);
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
  const rest = alphaSets.vowels.cards.map((c) => c.thai).filter((v) => !placed.has(v)); // any the sections miss
  const sections = [...VOWEL_SECTIONS, ...(rest.length ? [{ title: 'Others', groups: [rest] }] : [])];
  const el = (tag, className, textContent = '') => Object.assign(document.createElement(tag), { className, textContent });
  els.alphaVowels.replaceChildren(...sections.map((s) => {
    const section = el('section', 'vowel-section');
    const head = el('h3', 'vowel-head', s.title);
    if (s.note) head.append(el('span', 'vowel-head-note', ` · ${s.note}`));
    const rows = el('div', `letter-groups vowel-rows ${s.cls || ''}`.trim());
    rows.append(...s.groups.map((group) => {
      const g = el('div', 'letter-group');
      for (const v of group) {
        const c = byThai.get(v);
        if (!c) continue;
        const b = el('button', 'dict-letter letter-tile', v);
        b.type = 'button';
        b.lang = 'th';
        b.title = `${c.translit}: ${c.english}`;
        b.dataset.say = cardSay(c); // lit while it plays (markSpeakers)
        b.setAttribute('aria-pressed', 'false');
        b.addEventListener('click', () => pickAlpha(els.alphaVowels, b, c, 'vowels', () => showVowelPop(b, c)));
        onLongPress(b, () => showVowelPop(b, c));
        g.append(b);
      }
      return g;
    }));
    section.append(head, rows);
    return section;
  }));
}

// The line a consonant, vowel or tone mark gets, on the Letters page (pickAlpha) and atop Write
// (renderWrite), as rows (the user's calls, 2026-10-15): a consonant's transliteration (yellow, as
// everywhere), its sound and picture word, its class in its colour ("mid class", no ●); a vowel's
// sound (yellow), then what it is (the card's English split at its dash: "ʉa — short (almost
// unused)"); a mark's Thai name, transliteration, what it is. `short`: without the English's bracket.
function alphaLineText(c, set, short) {
  const span = (className, ...kids) => { const el = Object.assign(document.createElement('span'), { className }); el.append(...kids); return el; };
  const trim = (t) => (short ? t.replace(/ \(.*\)$/, '') : t);
  if (set === 'vowels') {
    const [sound, ...rest] = c.english.split(' — ');
    const what = rest.join(' — ');
    return what ? [span('alpha-line-row alpha-line-tr', sound), span('alpha-line-desc', trim(what))] : [c.english];
  }
  if (set === 'tones') return [span('alpha-line-row', c.say || ''), span('alpha-line-row alpha-line-tr', c.translit), span('alpha-line-row', c.english)];
  const name = CLASS_NAMES[letterFacts(c).cls];
  return [span('alpha-line-row alpha-line-tr', c.translit), span('alpha-line-row', trim(c.english)), ...(name ? [span(`alpha-line-row cls-${name}`, `${name} class`)] : [])];
}

// Fills a line's text box (in the page already, to be measured): the full text, or, if it doesn't
// fit (ฑ's "(Ramakien queen)" at the larger text sizes), without the bracket; then "…" (CSS).
function fillAlphaText(words, c, set) {
  const fill = (short) => words.replaceChildren(...alphaLineText(c, set, short));
  fill(false);
  const over = () => words.scrollHeight > words.clientHeight + 1 || [...words.querySelectorAll('.alpha-line-row')].some((r) => r.scrollWidth > r.clientWidth + 1)
    || [...words.querySelectorAll('.alpha-line-desc')].some((r) => r.scrollHeight > r.clientHeight + 1);
  if (over()) fill(true);
}

// A vowel or consonant tapped (2026-10-15, the user's calls: usually just to hear it; the vowels,
// then the consonants): it's said (a letter's name) and its tile marked, and the line above the grid
// becomes it (alphaLineText), with Details, which calls `open` (its dialog), and a speaker. A long press opens the
// dialog straight away (onLongPress). No picture for a consonant: too small to see there (the user's
// call); the dialog has it.
function pickAlpha(grid, b, c, set, open) {
  speakerPress(b, cardSay(c));
  grid.querySelectorAll('.letter-tile[aria-pressed="true"]').forEach((t) => t.setAttribute('aria-pressed', 'false'));
  b.setAttribute('aria-pressed', 'true');
  const el = (tag, className, textContent = '') => Object.assign(document.createElement(tag), { className, textContent });
  const glyph = el('span', 'alpha-line-glyph', c.thai);
  glyph.lang = 'th';
  const slot = el('span', 'write-slot'); // the room Write gives it, so going there doesn't shift the line
  slot.append(glyph);
  const details = el('button', 'ghost alpha-line-more', 'Details ›');
  details.type = 'button';
  details.addEventListener('click', open);
  // A speaker at the right end, where Write's is (2026-10-16, the user's call): the name or sound
  // again without hunting for the tile; lit while it plays (markSpeakers).
  const say = el('button', 'row-speak write-speak');
  say.type = 'button';
  say.title = 'Hear it';
  say.setAttribute('aria-label', 'Hear it');
  say.dataset.say = cardSay(c);
  say.append(speakerIcon());
  say.addEventListener('click', () => speakerPress(say, cardSay(c)));
  const words = el('span', 'alpha-line-text');
  els.alphaHint.replaceChildren(slot, words, details, say);
  fillAlphaText(words, c, set);
}

// Every vowel tile one width, the widest one's (so the columns line up from section to section), no
// wider than lets a row of three pairs fit; then their side padding shrinks (.tight), and if the
// widest (เอือะ) still doesn't fit, every tile's text a little smaller (.shrunk; on a phone).
function sizeVowelTiles() {
  const box = els.alphaVowels;
  if (box.hidden || !box.offsetParent) return;
  box.style.removeProperty('--tile-w');
  box.style.removeProperty('--tile-fs');
  box.classList.remove('tight', 'shrunk');
  const widest = Math.ceil(Math.max(...[...box.querySelectorAll('.letter-tile')].map((t) => t.getBoundingClientRect().width)));
  const rows = box.querySelector('.vowel-rows');
  if (!(widest > 0) || !rows) return;
  const groupGap = parseFloat(getComputedStyle(rows).columnGap) || 0;
  const pairGap = parseFloat(getComputedStyle(rows.firstElementChild).columnGap) || 0;
  const room = Math.floor((rows.clientWidth - 2 * groupGap - 3 * pairGap) / 6);
  box.style.setProperty('--tile-w', `${Math.min(widest, room)}px`);
  box.classList.toggle('tight', room < widest);
  const tiles = [...box.querySelectorAll('.letter-tile')];
  const over = Math.max(...tiles.map((t) => t.scrollWidth / t.clientWidth));
  if (over > 1) {
    box.style.setProperty('--tile-fs', `${Math.floor(parseFloat(getComputedStyle(tiles[0]).fontSize) / over) - 1}px`);
    box.classList.add('shrunk');
  }
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
// The tone chart's syllables, by column (none, a mark, dead) and class (tableTone gives the tone).
// They're Tone Chants'; ๊ and ๋ go on mid class only. Drawn a row a class (renderTonesPage).
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
  b.setAttribute('aria-label', `${syl}, ${tone} tone`);
  const curve = toneCurve(tone, { staff: false });
  curve.classList.add(`tone-${tone}`);
  b.append(Object.assign(document.createElement('span'), { className: 'cell-th', lang: 'th', textContent: syl }), curve);
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
  // The tone chart as the word dialog's tone table has it (the user's call: the same way round): a row
  // a class; columns live, dead short, dead long, then the four marks.
  const sylAt = (cls, column) => TONE_CHART.find(([c]) => c === column)?.[2][CHART_CLASSES.indexOf(cls)] || null;
  const table = document.createElement('table');
  table.className = 'tone-chart';
  const th = (text, attrs = {}) => Object.assign(document.createElement('th'), { textContent: text, ...attrs });
  const head1 = document.createElement('tr');
  head1.append(th(''), th('no mark', { colSpan: 3 }), th('tone mark', { colSpan: 4 }));
  const head2 = document.createElement('tr');
  head2.append(th(''), ...TABLE_COLUMNS.map((c) => (TABLE_HEADS[c] ? th(TABLE_HEADS[c]) : th(`◌${c}`, { lang: 'th' }))));
  const thead = document.createElement('thead');
  thead.append(head1, head2);
  const tbody = document.createElement('tbody');
  for (const cls of CHART_CLASSES) {
    const tr = document.createElement('tr');
    tr.append(th(cap(CLASS_NAMES[cls]), { scope: 'row', className: `cls-${CLASS_NAMES[cls]}` }));
    tr.append(...TABLE_COLUMNS.map((column) => chartCell(sylAt(cls, column), cls, column)));
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
  const words = alphaSets.tones.cards.filter((c) => toneOfTranslit(c.translit) === tone).slice(0, 8); // Read the Tone's first
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
    all.textContent = `All ${words.length} in the Dictionary ›`;
    all.addEventListener('click', () => {
      hideWordPop();
      state.dictLang = 'th';
      setPreferences({ dictLang: 'th' });
      state.dictLetter = c.thai;
      state.dictQuery = '';
      setView('dictionary');
      window.scrollTo(0, 0);
    });
    parts.push(all);
  }
  els.wordModalBody.replaceChildren(...parts);
  if (!wordPop) wordPop = { lastFocus: document.activeElement };
  showWordModal();
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
      orderMode: ORDER_MODES.includes(p.alphaOrderMode) ? p.alphaOrderMode : 'practice',
      direction: ['th-en', 'en-th', 'listen'].includes(p.alphaDirection) ? p.alphaDirection : 'th-en',
      cards: [], queue: [], pos: 0, showingBack: false, flashScopeId: null, relearn: new Map(), carry: [],
      modeSnap: { practice: null, test: null, type: null }, learnAnswers: new Map(), review: null, reviewOnlySig: '',
    });
  }
  els.stage.dataset.order = state.orderMode;
  els.orderButtons.forEach((b) => b.setAttribute('aria-checked', b.dataset.order === state.orderMode ? 'true' : 'false'));
  els.directionButtons.forEach((b) => b.setAttribute('aria-checked', b.dataset.direction === state.direction ? 'true' : 'false'));
  if (saved) {
    // The "none in Cards" message is the stage's, so it's redrawn for this section even in Recall,
    // which has no renderCard: it was the other's, the Topics message over the Alphabet's Recall
    // and none on Topics' empty one (the user's report, 2026-10-20).
    renderReviewOnly();
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

// The Topics section (2026-10-14, the user's calls; "Study" for a day, still its internal name): the
// topic's List, Cards and Reading as one section, its pages picked by the .study-switch.
const STUDY_VIEWS = new Set(['wordlist', 'flashcards', 'reading']);

// The page a tab, a home card or More's row names: Topics (study) and the Alphabet open on whichever of their
// pages you were last on.
function goTo(view) {
  const p = getPreferences();
  if (view === 'study') setView(STUDY_VIEWS.has(p.studyPage) ? p.studyPage : 'wordlist');
  else if (view === 'alphabet' && p.alphaPage === 'cards') setView('flashcards', { section: 'alphabet' });
  else setView(view);
}

// Which tab's page is showing: Study's three are Study's; the Alphabet's Cards page is the Alphabet's.
const pageNow = () => (state.section === 'alphabet' ? 'alphabet' : STUDY_VIEWS.has(state.view) ? 'study' : state.view);

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
    if (document.activeElement === els.typeBox) els.typeBox.blur(); // and a phone's keyboard goes
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
  els.studyPageButtons.forEach((b) => b.setAttribute('aria-checked', b.dataset.studyPage === view ? 'true' : 'false'));
  const alphaPage = view === 'alphabet' ? (getPreferences().alphaPage === 'write' ? 'write' : 'letters') : 'cards';
  els.alphaPageButtons.forEach((b) => b.setAttribute('aria-checked', b.dataset.alphaPage === alphaPage ? 'true' : 'false'));
  els.wordlistSection.hidden = view !== 'wordlist';
  if (view === 'wordlist' && leaving !== 'wordlist') { // a list's words may have changed meanwhile
    freshListCards();
    state.takenOut.clear();
    state.addedHere.clear();
    renderWordlist();
  }
  if (view === 'wordlist') sizeLetterTiles(); // a board drawn while Topics was hidden had nothing to measure
  els.readingSection.hidden = view !== 'reading';
  els.dictSection.hidden = view !== 'dictionary';
  if (view === 'dictionary') renderDictionary();
  els.timeSection.hidden = view !== 'time';
  if (view === 'time') renderTimeSection();
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
    if (answeringMode()) {
      const c = currentCard();
      if (c && state.learnAnswers.has(c.key)) advance(); // answered (and saved) just before leaving
    }
    if (state.orderMode === 'type' && !TOUCH_SCREEN) els.typeBox.focus({ preventScroll: true }); // a phone's keyboard waits for a tap
  }
  setPreferences({ view, section, ...(STUDY_VIEWS.has(view) && section === 'words' ? { studyPage: view } : {}) });
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

// Mute (Settings → Audio, 2026-10-17, the user's request: somewhere quiet, or music playing on the
// phone): no sound at all. playSample and ttsAndWait, which every sound goes through, keep quiet;
// data-muted on <html> crosses out every speaker (styles.css). index.html applies it before first paint.
const isMuted = () => getSettings().muted === true;
function applyMute() {
  document.documentElement.toggleAttribute('data-muted', isMuted());
}

// Read, Read all and the spell buttons would only light their lines in silence: muted, they say
// so instead. True if muted.
function mutedNotice() {
  if (!isMuted()) return false;
  toast('Muted: Settings → Audio');
  return true;
}

// The Thai font: data-thai-font on <html> switches --thai-font in styles.css (looped is the default,
// with no attribute). index.html applies the saved one before first paint.
// Dev features (Settings → App, off by default; the user's call, 2026-10-21): pages still being tried
// out, now Time. On, Time has a tab, and on a phone More takes Settings' place on the bar, with Time
// and Settings in its list; off, the bar is as it was (html.dev: styles.css, mobile.css).
function applyDevFeatures() {
  const on = !!getSettings().devFeatures;
  document.documentElement.classList.toggle('dev', on);
  if (on) return;
  closeMore();
  if (state.view === 'time') goTo('home');
}

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

  els.setMuted.checked = s.muted === true;
  els.setAudioSource.value = s.audioSource;
  els.setWriteCheck.value = WRITE_CHECK[s.writeCheck] ? s.writeCheck : 'normal';
  els.writeCheckHelp.textContent = WRITE_CHECK[els.setWriteCheck.value].help;
  els.audioSourceHelp.textContent = audioSourceHelpText(s.audioSource);
  els.aboutRecordings.textContent = recordingsText();
  els.setThaiSpeed.value = String(s.thaiSpeed);
  els.setSpelling.value = s.spellingStyle;
  els.setTheme.value = THEMES.includes(s.theme) ? s.theme : 'dark';
  els.setThaiFont.value = s.thaiFont === 'loopless' ? 'loopless' : 'looped';
  els.setTextSize.value = String(s.textSize);
  els.setWordlistFirst.value = s.wordlistFirst;
  els.setListOrder.value = s.listOrder === 'oldest' ? 'oldest' : 'newest';
  els.setTopicWordGaps.checked = !!s.topicWordGaps;
  els.setDevFeatures.checked = !!s.devFeatures;
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

  els.setWriteCheck.addEventListener('change', () => {
    setSettings({ writeCheck: els.setWriteCheck.value });
    els.writeCheckHelp.textContent = WRITE_CHECK[els.setWriteCheck.value].help;
  });
  // Muting stops what's playing, and a Read or Read all, which would only light their lines in silence.
  els.setMuted.addEventListener('change', () => {
    setSettings({ muted: els.setMuted.checked });
    applyMute();
    if (!els.setMuted.checked) return;
    if (state.reading.active) stopReadAloud();
    if (storyRunOn()) stopReadStories();
    stopAudio();
  });
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
  els.setDevFeatures.addEventListener('change', () => {
    setSettings({ devFeatures: els.setDevFeatures.checked });
    applyDevFeatures();
  });
  els.setWordlistFirst.addEventListener('change', () => {
    setSettings({ wordlistFirst: els.setWordlistFirst.value === 'english' ? 'english' : 'thai' });
    renderWordlist();
  });
  els.setListOrder.addEventListener('change', () => {
    setSettings({ listOrder: els.setListOrder.value === 'oldest' ? 'oldest' : 'newest' });
    listOrderChanged();
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
    if (answeringMode()) rebuildCurrentQueue();
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
  if (reviewOnlySignature() !== state.reviewOnlySig) loadCards(); // the list shown changed meanwhile
  // A rebuilt queue is a new round, and a fresh Recognition stream (answers are saved as given).
  resetRecognition();
  state.learnAnswers = new Map();
  state.queue = buildFlashcardQueue();
  state.pos = 0;
  renderCard();
}

function setOrderMode(mode) {
  if (!ORDER_MODES.includes(mode) || mode === state.orderMode) return;
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
  if (mode === 'type') els.typeBox.focus({ preventScroll: true }); // in the tap, so a phone's keyboard opens
}

// Each mode keeps its own place (the user's call, 2026-10-08, after trying one shared word): Browse
// its position, Recognition its stream (words waiting to come back included), Recall its stream
// (state.review). Changing direction or topic, or leaving Flashcards, starts them all afresh
// (discardModes).
function snapMode() {
  const c = currentCard();
  return {
    queue: state.queue, pos: state.pos, relearn: state.relearn, carry: state.carry, sig: state.reviewOnlySig,
    answered: !!(c && state.learnAnswers.has(c.key)), // Recognition or Type left mid-pause
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
  if ((mode === 'test' || mode === 'type') && snap.answered) advance();
  else renderCard();
}

function discardModes() {
  state.modeSnap = { practice: null, test: null, type: null };
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
  if (state.orderMode === 'type') els.typeBox.focus({ preventScroll: true }); // in the tap, so a phone's keyboard opens
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
  if (els.alphaVowels) sizeVowelTiles();
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

// The word tables' columns (the Topics page, the Dictionary): the chosen first (Settings → List →
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
  // A list's "N words" isn't shown here (the user's call, 2026-10-20); the picker's row has it.
  const desc = deck.description && deck.kind !== 'list' ? [textWithArrows(Object.assign(document.createElement('span'), { className: 'wordlist-desc' }), deck.description)] : [];
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
  const words = targetWords();
  const target = targetList();
  const isList = deck.kind === 'list';
  const own = isList && deck.id === listScopeId(target?.id); // the list 🔁 adds to
  // Adding words to a list from another topic or list (Add words): a bar over the page says where
  // they go, with Done to go back to it.
  const adding = state.addingTo && deck.id !== listScopeId(state.addingTo) ? listById(state.addingTo) : null;
  els.addingBar.hidden = !adding;
  if (adding) els.addingName.textContent = adding.name;
  els.listActions.hidden = !isList;

  // In list order (the headings sorted the table until 2026-10-12), a search's matches, a page at a time.
  wordsFor(deck.id);
  const q = state.wordQuery.trim();
  const paged = deck.kind !== 'topic'; // a topic shows whole (the 44 consonants are one)
  els.wordlistSearch.hidden = !paged || (state.listCards.length <= WORD_PAGE && !q);
  const rows = paged ? pagedWords(listedWords()) : state.listCards;
  if (!paged) els.wordlistMore.hidden = true;

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
    tr.innerHTML = '<td class="empty" colspan="4"></td>';
    tr.firstChild.textContent = q ? `No words match "${q}".` : isList ? 'No words yet. Add words chooses some from a topic or another list.' : 'No matches.';
    els.wordtableBody.appendChild(tr);
  } else {
    // A list's words taken out of it since the page opened: faded, but still usable, 🔁 putting one
    // back (the user's call, 2026-10-20: a sign it won't be there next time).
    // So is a word taken out of the list being added to, from Add words' topic (the same day).
    const inList = isList ? new Set(listById(deck.id.slice(5))?.words || []) : null;
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
      const tr = wordRow(c, cols, words);
      if ((inList && !inList.has(c.key)) || (adding && state.takenOut.has(c.key) && !words.has(c.key))) tr.classList.add('row-removed');
      frag.appendChild(tr);
    }
    els.wordtableBody.appendChild(frag);
  }

  // The list 🔁 adds to: Add words. Anything else: Add all to it, or with the whole lot in, "✓ All
  // in …", which takes them all out.
  const name = (text) => Object.assign(document.createElement('span'), { className: 'add-all-name', textContent: text });
  const allIn = !own && state.listCards.length > 0 && state.listCards.every((c) => words.has(c.key));
  els.wordlistAddAll.classList.toggle('all-in', allIn);
  if (own) {
    els.wordlistAddAll.replaceChildren('＋ Add words');
  } else if (allIn) {
    // Both labels share one grid cell, so hovering ("− Remove all") doesn't change the width.
    const idle = Object.assign(document.createElement('span'), { className: 'label-idle' });
    idle.append('✓ All in ', name(targetName()));
    const hover = Object.assign(document.createElement('span'), { className: 'label-hover', textContent: '− Remove all' });
    els.wordlistAddAll.replaceChildren(idle, hover);
  } else {
    els.wordlistAddAll.replaceChildren(reviewIcon(), 'Add all to ', name(targetName())); // "…to Cards" until 2026-10-20
  }
  els.wordlistAddAll.title = own ? `Add words to '${targetName()}'` : allIn ? `Remove all from '${targetName()}'` : `Add all to '${targetName()}'`;
}

// A long list in pages (the user's call, 2026-10-20: your lists can grow without end), as Reading's
// stories are, 25 at a time rather than 10, with a search when there's more than a page. Groups and
// categories too; a topic shows whole. Read all reads every match, showing the next page as it
// reaches it.
const WORD_PAGE = 25;
function listedWords() {
  const q = state.wordQuery.trim();
  return q ? state.listCards.filter((c) => wordMatches(c, q)) : state.listCards;
}

function pagedWords(rows) {
  const at = state.reading.currentKey ? rows.findIndex((c) => c.key === state.reading.currentKey) : -1;
  if (at >= state.wordShown) state.wordShown = (Math.floor(at / WORD_PAGE) + 1) * WORD_PAGE;
  const left = rows.length - state.wordShown;
  els.wordlistMore.hidden = left <= 0;
  if (left > 0) els.wordlistMore.textContent = `Show ${Math.min(left, WORD_PAGE)} more · ${left} left`;
  return rows.slice(0, state.wordShown);
}

// A new topic or list starts at the top: the first page, and no search.
function wordsFor(key) {
  if (key === state.wordFor) return;
  state.wordFor = key;
  state.takenOut.clear();
  state.addedHere.clear();
  state.wordShown = WORD_PAGE;
  state.wordQuery = '';
  els.wordlistSearch.value = '';
}

// The List page's search, kept in list order: a Thai query finds the Thai (spaces ignored), anything
// else the English, or the transliteration loosely (looseTranslit).
function wordMatches(c, q) {
  if (/[\u0E00-\u0E7F]/.test(q)) return c.thai.replace(/\s/g, '').includes(q.replace(/\s/g, ''));
  if (c.english.toLowerCase().includes(q.toLowerCase())) return true;
  const qt = looseTranslit(q);
  return qt.length >= 2 && looseTranslit(c.translit || '').includes(qt);
}

// The List page's rows for a list, afresh (they're kept while it's open: listsChanged).
function freshListCards() {
  if (currentScope()?.kind === 'list') state.listCards = mergeProgressIntoCards(currentScope().cards);
}

// A word's row, as on the Topics page and in the Dictionary: its Thai (opening the word dialog; a
// phrase's words each open their own), transliteration and English (opening it too), the note under
// the English, and the add to a list (🔁), spell and play buttons. `cols` is the column order
// (wordlistColumns); `words`, the target list's (a Set).
function wordRow(c, cols, words) {
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
  // Add to / remove from the target list, left of the speaker (reviewButton).
  const rv = reviewButton(c.key, c.thai, words);
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

// The English way in (2026-10-14, the user's design): A–Z, each letter's words English first. A word
// files under each of its meanings' headwords: "to have / there is" under H (have) and T (there is),
// "(classifier) leaves…" under L; "1,000 — thousand" under T.
let dictEnglish = null; // 'A'…'Z' -> [{ e: entry, head }], by headword
function englishHeads(english) {
  return english.split(/\s+\/\s+|;\s+/).map((alt) => {
    let h = alt.replace(/^\s*(\([^)]*\)\s*)+/, '').replace(/^[\s"'“‘…]+/, '');
    if (/^[\d,.]+\s+—\s+/.test(h)) h = h.replace(/^[\d,.]+\s+—\s+/, '');
    return h.replace(/^(to|a|an|the)\s+/i, '').trim();
  }).filter((h) => /^[a-z]/i.test(h.normalize('NFD')));
}
function buildEnglishIndex() {
  if (dictEnglish) return;
  buildDictionary();
  dictEnglish = new Map();
  for (const e of dictEntries) {
    const filed = new Set();
    for (const head of englishHeads(e.english)) {
      const letter = head.normalize('NFD')[0].toUpperCase();
      if (filed.has(letter)) continue; // once a letter, under its first meaning there
      filed.add(letter);
      if (!dictEnglish.has(letter)) dictEnglish.set(letter, []);
      dictEnglish.get(letter).push({ e, head });
    }
  }
  const order = new Intl.Collator('en', { sensitivity: 'base' });
  for (const list of dictEnglish.values()) list.sort((a, b) => order.compare(a.head, b.head) || order.compare(a.e.english, b.e.english));
}
const LATIN_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function renderDictionary() {
  buildDictionary();
  els.dictLangButtons.forEach((b) => b.setAttribute('aria-checked', b.dataset.dictLang === state.dictLang ? 'true' : 'false'));
  const q = state.dictQuery.trim();
  let rows = null;
  let heading = '';
  if (q) {
    const { hits, total } = wordSearch(q, { limit: DICT_SHOWN, keep: (w) => dictKeys.has(w.key) });
    const byKey = new Map(dictEntries.map((e) => [e.key, e]));
    rows = hits.map((h) => byKey.get(h.key));
    heading = total > hits.length ? `The first ${hits.length} of ${total} matches` : `${total} match${total === 1 ? '' : 'es'}`;
    els.dictBack.textContent = '✕ Clear search';
  } else if (state.dictLetter && state.dictLang === 'en') {
    buildEnglishIndex();
    rows = (dictEnglish.get(state.dictLetter) || []).map((x) => x.e);
    heading = `${state.dictLetter} · ${rows.length} word${rows.length === 1 ? '' : 's'}`;
    els.dictBack.textContent = '‹ All letters';
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
  const cols = state.dictLang === 'en' ? ['english', 'thai', 'translit'] : wordlistColumns(); // English first, then Thai
  const head = document.createElement('tr');
  for (const key of cols) head.append(Object.assign(document.createElement('th'), { textContent: COL_META[key].label }));
  const audioTh = document.createElement('th');
  audioTh.setAttribute('aria-label', 'Audio');
  head.append(audioTh);
  els.dictTableHead.replaceChildren(head);
  const words = targetWords();
  const frag = document.createDocumentFragment();
  for (const c of rows) frag.append(wordRow(c, cols, words));
  els.dictTableBody.replaceChildren(frag);
}

// The 44 letters, just the letter on each (its name word and count went on 2026-10-12, the user's
// call; they're in its tooltip). A letter with no words is greyed out.
function renderDictGrid() {
  if (els.dictGrid.childElementCount && els.dictGrid.dataset.lang === state.dictLang) return; // drawn once a language: the words don't change while the app's open
  els.dictGrid.dataset.lang = state.dictLang;
  els.dictGrid.classList.toggle('latin', state.dictLang === 'en');
  if (state.dictLang === 'en') {
    buildEnglishIndex();
    els.dictGrid.replaceChildren(...[...LATIN_LETTERS].map((ch) => {
      const n = dictEnglish.get(ch)?.length || 0;
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'dict-letter';
      b.disabled = !n;
      b.textContent = ch;
      b.title = `${ch}: ${n} word${n === 1 ? '' : 's'}`;
      b.addEventListener('click', () => {
        state.dictLetter = ch;
        renderDictionary();
        window.scrollTo(0, 0);
      });
      return b;
    }));
    return;
  }
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

// The Dictionary's Thai | English: its own grid and order, starting from the grid.
function setDictLang(lang) {
  if (lang === state.dictLang || !['th', 'en'].includes(lang)) return;
  state.dictLang = lang;
  state.dictLetter = null;
  setPreferences({ dictLang: lang });
  renderDictionary();
  window.scrollTo(0, 0);
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
// Where Recognition's wrong answers come from: the scope's words; a list of fewer than 3 words,
// every topic's.
function distractorPool(card) {
  if (state.section === 'alphabet') return state.cards;
  return state.cards.length >= 3 ? state.cards : mergeProgressIntoCards(resolveScope('all').cards);
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
  const trial = buildLearnTrial(c, distractorPool(c), prior?.seedSeen);

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
    const trial = buildLearnTrial(c, distractorPool(c));
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

// ---------- Type: Recognition with the answer typed (2026-10-19) ----------
// The user's idea: a fourth mode, Recognition with a box in place of its three answers, and the
// answer typed in Thai in every direction (the user's call): English → Thai from memory, Listen →
// what you hear, Thai → English by copying the Thai shown, which is practice at finding the keys.
// The checker is typing.js. Each card:
// - right as soon as the box matches, once tidied (ํ + า for ำ, spaces and the like; a note says
//   when it's worth knowing); so is a word in scope that sounds the same (Listen) or means the same
//   (English → Thai), and a vowel without the อ that holds its place;
// - Check (or the return key) marks it wrong, from the first letter that differs; Show, with the
//   box empty, is a miss; Next, once answered, moves on without the pause;
// - then on as Recognition goes: its pauses (a right answer with a note gets the longer one, to
//   read it), and a miss back a few cards later (requeueRecognition).
// Progress (the user's call): English → Thai is a recall (right is Easy, wrong Very Hard), Listen
// as Recognition counts it (right is Hard: spelling what you hear isn't knowing its meaning),
// Thai → English nothing, since copying a word says nothing of what it means.
const TYPE_PLACEHOLDER = { 'th-en': 'Type the Thai', 'en-th': 'Type it in Thai', listen: 'Type what you hear' };

function renderTypeBar() {
  const c = currentCard();
  const on = state.orderMode === 'type' && !!c;
  els.typeBar.hidden = !on;
  els.typeHint.hidden = true;
  if (!on) {
    if (document.activeElement === els.typeBox) els.typeBox.blur();
    return;
  }
  els.typeBox.placeholder = TYPE_PLACEHOLDER[state.direction];
  const prior = state.learnAnswers.get(c.key);
  els.typeCheck.textContent = prior ? 'Next' : 'Show';
  if (prior) {
    els.typeBox.value = prior.typed;
    showTyped(prior);
    els.card.classList.add('answered');
    setFlipped(true);
  } else {
    els.typeBox.value = '';
    els.typeField.classList.remove('answered', 'right', 'wrong');
    els.typeResult.hidden = true;
  }
}

// What a typed answer counts as: right (with a note, when there's something to say) or not, and
// then where it goes wrong.
function typedAnswer(c, typed) {
  if (sameThai(typed, c.thai)) return { right: true, note: tidiedNote(typed) };
  if (c.alpha && c.alphaSet === 'vowels' && sameThai(typed, c.thai.replace('อ', ''))) return { right: true, note: '' };
  const sound = (x) => (x.translit || '').toLowerCase().replace(/[\s-]/g, '');
  const meaning = (x) => x.english.trim().toLowerCase();
  const twin = state.direction === 'listen' ? (x) => sound(x) !== '' && sound(x) === sound(c)
    : state.direction === 'en-th' ? (x) => meaning(x) === meaning(c) : null;
  const other = twin && distractorPool(c).find((x) => x.key !== c.key && twin(x) && sameThai(typed, x.thai));
  if (other) return { right: true, note: `${state.direction === 'listen' ? 'Same sound' : `Also “${c.english}”`}: this card is ${c.thai}` };
  return { right: false, ...firstWrong(typed, c.thai) };
}

function answerTyped(typed, a = null) {
  const c = currentCard();
  if (!c || state.learnAnswers.has(c.key)) return;
  const empty = tidy(typed) === '';
  a ||= empty ? { right: false, note: '', at: 0 } : typedAnswer(c, typed);
  const answer = { typed, empty, ...a };
  // As Recognition's: a re-render (Settings opened over it, say) shows the card still answered.
  state.learnAnswers.set(c.key, answer);
  showTyped(answer);
  els.typeCheck.textContent = 'Next';
  els.typeHint.hidden = true;
  els.card.classList.add('answered');
  setFlipped(true);
  if (state.direction === 'en-th' && autoPlayOn()) speak(cardSay(c));
  saveTypedAnswer(c, a.right);
  requeueRecognition(c, a.right);
  if (state.pickerOpen) renderDeckPicker();
  const s = getSettings();
  const seq = ++state.answerSeq;
  setTimeout(() => {
    if (seq === state.answerSeq && state.orderMode === 'type' && state.view === 'flashcards') advance();
  }, a.right && !a.note ? s.learnPauseMs : s.wrongPauseMs);
}

function saveTypedAnswer(c, right) {
  if (state.direction === 'th-en') return;
  const deckId = flashScope()?.deckOf.get(c.key)?.id || state.currentDeckId; // the card's own topic
  const it = gradeItem(c.key, state.direction, right ? 3 : 1, { mode: state.direction === 'listen' ? 'mc' : 'recall', deckId });
  c.dueAt = it.due;
  c.seen = it.reps;
}

// The box once answered, over what was typed: ✓ and the answer, or ✗ and it with the rest in red
// from the letter (and its marks) where it went wrong; a note under it.
function showTyped(a) {
  els.typeField.classList.add('answered');
  els.typeField.classList.toggle('right', a.right);
  els.typeField.classList.toggle('wrong', !a.right);
  const said = document.createElement('span');
  said.className = 'type-said';
  if (a.empty) {
    said.classList.add('type-shown');
    said.textContent = 'Shown: it comes back in a few cards';
  } else if (a.right) {
    said.lang = 'th';
    said.textContent = `✓ ${a.typed.trim()}`;
  } else {
    const parts = clusters(tidy(a.typed));
    let k = 0;
    for (let n = 0; k < parts.length && n + [...parts[k]].length <= a.at; k++) n += [...parts[k]].length;
    const from = Math.max(0, k - 8); // a long answer: from a little before the slip
    const bad = document.createElement('span');
    bad.className = 'type-bad';
    bad.textContent = k < parts.length ? parts.slice(k).join('') : '…'; // right as far as it went
    said.lang = 'th';
    said.append(`✗ ${from ? '…' : ''}${parts.slice(from, k).join('')}`, bad);
  }
  const note = document.createElement('span');
  note.className = 'type-note';
  note.textContent = a.note || '';
  els.typeResult.replaceChildren(said, ...(a.note ? [note] : []));
  els.typeResult.hidden = false;
}

// After every change: right, it's answered; the wrong keyboard (Latin letters), said at once.
function onTypeInput() {
  const c = currentCard();
  if (!c || state.orderMode !== 'type') return;
  const prior = state.learnAnswers.get(c.key);
  if (prior) {
    els.typeBox.value = prior.typed; // typed in the pause: the answer stands
    return;
  }
  const typed = els.typeBox.value;
  els.typeCheck.textContent = typed.trim() ? 'Check' : 'Show';
  const latin = /[A-Za-z]/.test(typed) && !/[A-Za-z]/.test(c.thai);
  els.typeHint.textContent = latin ? 'That’s not Thai: switch keyboards with 🌐' : '';
  els.typeHint.hidden = !latin;
  if (!tidy(typed)) return;
  const a = typedAnswer(c, typed);
  if (a.right) answerTyped(typed, a);
}

// Check, Show or Next: the button or the return key.
function onTypeSubmit(e) {
  e.preventDefault();
  const c = currentCard();
  if (c && state.learnAnswers.has(c.key)) {
    state.answerSeq += 1; // the pause's move, now
    advance();
  } else {
    answerTyped(els.typeBox.value);
  }
  els.typeBox.focus({ preventScroll: true }); // a phone's keyboard stays up
}

// A computer's keys typed as Thai by where they are (Kedmanee), whatever its layout, so one without
// Thai set up types it too. A Thai layout, already typing Thai, is left alone, as are Ctrl, Alt and
// ⌘. Not on a phone, whose keyboard is its own.
function onTypeKey(e) {
  if (TOUCH_SCREEN || e.ctrlKey || e.metaKey || e.altKey || e.isComposing) return;
  const pair = KEDMANEE[e.code];
  if (!pair || e.key.length !== 1 || /[\u0E00-\u0E7F]/.test(e.key)) return;
  e.preventDefault();
  const box = els.typeBox;
  box.setRangeText(pair[e.shiftKey ? 1 : 0], box.selectionStart, box.selectionEnd, 'end');
  onTypeInput();
}

// A phone's keyboard covers the page's foot (it left 390 × 357 of Safari's 664: the keyboard probe,
// 2026-10-19), so while it's up for the box the page is the card and the box alone, the card down
// to the keyboard (html.type-kb, sizeCards). The top row, the switches and the tab bar come back
// when it goes (Done, over the keyboard). The page is scrolled back to its top, where iOS scrolled
// it to show the box.
const typingOnPhone = () => TOUCH_SCREEN && PHONE_LAYOUT.matches;
function fitTypeKeyboard() {
  window.scrollTo(0, 0);
  fitCardText();
}

// With the keyboard up iOS lets the page be dragged, by as much as the keyboard covers though it
// all fits over it, and scrolls it itself, after an answer too (the user's screenshot, 2026-10-19:
// the card's top under the clock, a gap over the keyboard). So it's held at its top: a drag is
// stopped (not in the box, or on a back long enough to scroll), and a scroll put back.
// The same for a dialog's box (html.dialog-kb, fitDialogKeyboard), but held where the page behind
// it was (heldY): held at the top, a list's page scrolled down came back at its top when the dialog
// closed (2026-10-21).
let heldY = 0;
function holdStill(e) {
  if (e.target === els.typeBox || e.target === els.confirmInput) return;
  const back = e.target.closest?.('.face-body');
  if (back && back.scrollHeight > back.clientHeight) return;
  e.preventDefault();
}
function holdTop() {
  const html = document.documentElement.classList;
  if (!html.contains('type-kb') && !html.contains('dialog-kb')) return;
  if (Math.abs(window.scrollY - heldY) > 1 || window.visualViewport?.offsetTop) window.scrollTo(0, heldY);
}

// A dialog's text box (a list's name) with a touch screen's keyboard up: iOS let the page be dragged
// by as much as the keyboard covers, the dialog off the top, and its buttons were under the
// keyboard's bar (the user's screenshots, 2026-10-21). So the page is held still, as Type's is, and
// the dialog sits in what the keyboard leaves: --kb-h, what it covers of the page. iOS keeps the
// page's height with the keyboard up; a browser that shrinks the page instead gets 0, as it needs.
function fitDialogKeyboard() {
  const vv = window.visualViewport;
  const kb = vv ? Math.max(0, document.documentElement.clientHeight - vv.height) : 0;
  document.documentElement.style.setProperty('--kb-h', `${Math.round(kb)}px`);
  holdTop();
}

// ---------- Review mode: a continuous stream ----------
// Since 2026-10-08 (the user's request) Review has no start or end: a stream of cards from the
// words in Cards' scope (until 2026-10-20 the ones you'd added), in its direction, ordered to help recall. Every card is
// recall and self-grading (multiple choice is Test mode's). Every grade goes to FSRS, which decides
// what's due on later visits. Within a visit (pickReviewEntry):
// 1. A card you missed (Again) comes back REVIEW_RETURN[1] cards later, a Hard one REVIEW_RETURN[2]
//    later, until you mark it Easy. An Easy card drops out of the rotation.
// 2. Due cards, weakest (lowest recall probability) first, with a new word every NEW_EVERY cards.
// 3. New words, in the scope's order (a list's: the order you added them). They aren't labelled as new.
// 4. When nothing's due, the cards you're most likely to have forgotten, so the stream never runs
//    dry. (FSRS's same-day rule, tweaked so repeats never lengthen a gap, keeps a long sitting
//    from pushing words out.)
// A card isn't shown again within RECENT cards (fewer in a small pool). See docs/review-design.md.

const REVIEW_RETURN = { 1: [2, 4], 2: [6, 9] }; // cards later: Again, Hard
const NEW_EVERY = 4;
const RECENT = 5;

// Recall's words: every word in Cards' scope, in its order (a list's: the order you added them),
// with its progress in one direction (it: null for a word not started in it). Until the lists spike
// (2026-10-20) it was the words you'd added with 🔁, in that scope.
function reviewPool(dir = state.direction) {
  const items = loadStore().items || {};
  // The Alphabet's Recall: every card of its set, in order.
  if (state.section === 'alphabet') {
    const { id, cards } = alphaScope();
    return cards.map((c) => ({ key: cardKey(c), dir, deckId: id, it: items[itemKeyOf(cardKey(c), dir)] || null }));
  }
  const scope = flashScope();
  if (!scope) return [];
  return scope.cards.map((c) => {
    const key = cardKey(c);
    return { key, dir, deckId: scope.deckOf.get(key)?.id || null, it: items[itemKeyOf(key, dir)] || null };
  });
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

// ---------- your lists (2026-10-20, a spike: branch 2026-10-20-spike-custom-topics) ----------
// The user's idea: List, Cards and Reading show a topic, Everything (Cards and Reading only), or a
// list of your own, picked in the topic picker's My lists tab. Until then Cards held only the words
// you'd added with 🔁 (store.reviewWords) and Reading the topic's stories, which they found "a bit
// weird". A list is words you choose, in the order added: store.lists, [{ id, name, words: [cardKey…] }].
// The old 🔁 words became the list "My words" (migrateLists). store.reviewWords is left as it was,
// so master still has it if the spike is dropped.
// 🔁 (a topic's rows, the Dictionary, word search, the word dialog) adds to one list, the target
// (prefs.targetListId): the list last picked, made, or opened with Add words.

const listScopeId = (id) => `list:${id}`;
const getLists = () => loadStore().lists || [];
const listById = (id) => getLists().find((l) => l.id === id) || null;
const newListId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

function migrateLists() {
  const store = loadStore();
  if (store.lists) return;
  const old = store.reviewWords || {};
  const words = Object.keys(old).sort((a, b) => old[a] - old[b]);
  store.lists = words.length ? [{ id: newListId(), name: 'My words', words }] : [];
  saveStore(store);
}

// Where 🔁 adds: the target list, or the first list; null with none yet (the first 🔁 makes My words).
function targetList() {
  const lists = getLists();
  return lists.find((l) => l.id === getPreferences().targetListId) || lists[0] || null;
}
const targetName = () => targetList()?.name || 'My words';
const targetWords = () => new Set(targetList()?.words || []);
const setTarget = (id) => setPreferences({ targetListId: id });

// After a list changes: its scope is rebuilt, and whatever shows it is redrawn. The List page keeps
// its rows (state.listCards) until it's opened afresh, so a word taken out of the list it shows stays
// on screen with 🔁, to put back with a tap.
function listsChanged(id) {
  scopeCache.delete(listScopeId(id));
  if (state.view === 'wordlist') renderWordlist();
  if (state.view === 'dictionary') renderDictionary();
  renderDeckButton();
  syncReviewOnly();
  document.querySelectorAll('.row-review').forEach((b) => b.paint?.()); // the word dialog's, word search's
}

// Settings' order for your lists: every list's words again, and the page and Cards in the new order
// (syncReviewOnly rebuilds Cards' queue around the card shown; away from Cards, coming back does).
function listOrderChanged() {
  for (const id of scopeCache.keys()) if (id.startsWith('list:')) scopeCache.delete(id);
  if (currentScope()?.kind !== 'list') return;
  freshListCards();
  if (state.view === 'wordlist') renderWordlist();
  syncReviewOnly();
}

function changeList(id, change) {
  const store = loadStore();
  const list = (store.lists ||= []).find((l) => l.id === id);
  if (!list) return null;
  change(list);
  saveStore(store);
  listsChanged(id);
  return list;
}

function createList(name, { target = true } = {}) {
  const store = loadStore();
  const list = { id: newListId(), name, words: [] };
  (store.lists ||= []).push(list);
  saveStore(store);
  if (target) setTarget(list.id);
  return list;
}

// Adds words to (on) or takes them out of the target list, making My words if there's no list yet.
// Taking out keeps their progress. Returns the list's name, for the toast.
function setInTarget(keys, on) {
  const list = targetList() || createList('My words');
  // Adding words from a topic, a word taken out of the list is faded (renderWordlist), but not one
  // put in on this visit: in and out again, it's as it was (the user's call, 2026-10-21).
  if (addingFrom()) {
    const have = new Set(list.words);
    keys.forEach((k) => {
      if (on && !have.has(k) && !state.takenOut.has(k)) state.addedHere.add(k);
      if (!on && have.has(k) && !state.addedHere.has(k)) state.takenOut.add(k);
    });
  }
  changeList(list.id, (l) => {
    const have = new Set(l.words);
    if (on) l.words.push(...keys.filter((k) => !have.has(k)));
    else {
      const out = new Set(keys);
      l.words = l.words.filter((k) => !out.has(k));
    }
  });
  return list.name;
}

// 🔁 pressed: in or out of the target list, and the toast saying so.
// A word put back on its own list's page (its faded row, or its dialog over the page) says
// "Re-added", without Change (the user's call, 2026-10-20): it's going back where it was.
function toggleInTarget(key, thai, on) {
  const back = on && state.view === 'wordlist' && ((currentScope()?.id === listScopeId(targetList()?.id)
    && state.listCards.some((c) => c.key === key)) || (addingFrom() && state.takenOut.has(key)));
  const name = setInTarget([key], on);
  if (back) toast(`✓ Re-added ${thai} to '${name}'`, { tone: 'good' });
  else if (on) toastAdded([key], thai);
  else toast(`Removed ${thai} from '${name}'`);
}

// A word's 🔁 (its rows, word search, the word dialog), in three states (the user's pick, 2026-10-20):
// ✓ in the target list; 🔁 with a dot in another of your lists; 🔁 in none. Its look comes from the
// lists each time it's painted, and listsChanged repaints those their page doesn't redraw (b.paint),
// so it's right after Change moves the word.
function reviewButton(key, thai, words = null) {
  const rv = document.createElement('button');
  rv.type = 'button';
  rv.paint = (inList = targetWords()) => {
    const added = inList.has(key);
    const others = added ? [] : listsOf(key);
    rv.className = 'row-review' + (added ? ' added' : others.length ? ' elsewhere' : '');
    rv.replaceChildren(added ? '✓' : reviewIcon());
    rv.title = added ? `Remove ${thai} from '${targetName()}'`
      : `Add ${thai} to '${targetName()}'` + (others.length ? ` (it's in ${listNames(others)})` : '');
    rv.setAttribute('aria-label', rv.title);
  };
  rv.paint(words || undefined);
  rv.addEventListener('click', () => toggleInTarget(key, thai, !targetWords().has(key)));
  return rv;
}

// The toast after an add (🔁 or Add all), with Change (the user's request, 2026-10-20): it stays
// longer, and Change puts the words in another list instead (openMoveWords).
// While adding words to a list (Add words: its bar over a topic), they're going where you chose, so
// no Change (the user's call, 2026-10-20).
function toastAdded(keys, what) {
  const list = targetList();
  // A word already in other lists says so (the same day), as its 🔁's dot did.
  const also = keys.length === 1 ? listsOf(keys[0]).filter((l) => l.id !== list.id) : [];
  toast(`✓ Added ${what} to '${list.name}'` + (also.length ? ` · also in ${listNames(also)}` : ''), { tone: 'good', action: addingFrom() ? null : { label: 'Change', fn: () => openMoveWords(keys, what, list.id) } });
}

// Whether the List page shows a topic (or list) that words are being added from (Add words).
const addingFrom = () => !!state.addingTo && state.view === 'wordlist' && state.currentDeckId !== listScopeId(state.addingTo);

// The lists a word is in, in the order made.
function listsOf(key) {
  if (!listsOfCache) {
    listsOfCache = new Map();
    for (const l of getLists()) {
      for (const k of l.words) {
        if (!listsOfCache.has(k)) listsOfCache.set(k, []);
        listsOfCache.get(k).push(l);
      }
    }
  }
  return listsOfCache.get(key) || [];
}

// 'Food words', 'Food words' and 'Verbs', or "3 other lists".
function listNames(lists) {
  const q = lists.map((l) => `'${l.name}'`);
  return q.length <= 2 ? q.join(' and ') : `${q.length} other lists`;
}

// Change's dialog, "Put กิน in": your lists, the one they're in ticked, then ＋ New list. A tap on a
// list moves them and closes it (the user's pick, 2026-10-20: one tap for the usual one-off, rather
// than choosing then Done). "Add new words there too", above, makes that list the target too.
function openMoveWords(keys, what, fromId) {
  state.moving = { lastFocus: document.activeElement };
  els.moveTitle.textContent = `Put ${what} in`;
  els.moveDefault.checked = false;
  const rows = getLists().map((l) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'move-row';
    b.innerHTML = '<span class="move-name"></span><span class="move-tick" aria-hidden="true"></span><span class="move-count"></span>';
    b.querySelector('.move-name').textContent = l.name;
    if (l.id === fromId) {
      b.querySelector('.move-tick').textContent = '✓';
      b.setAttribute('aria-current', 'true');
    }
    b.querySelector('.move-count').textContent = `${l.words.length} word${l.words.length === 1 ? '' : 's'}`;
    b.addEventListener('click', () => moveWordsTo(keys, what, fromId, l.id));
    return b;
  });
  const add = document.createElement('button');
  add.type = 'button';
  add.className = 'move-row move-new';
  add.textContent = '＋ New list';
  add.addEventListener('click', async () => {
    const always = els.moveDefault.checked;
    closeMoveWords();
    const name = await askListName('New list', '', 'Make list');
    if (!name) return;
    els.moveDefault.checked = always;
    moveWordsTo(keys, what, fromId, createList(name, { target: false }).id);
  });
  els.moveLists.replaceChildren(...rows, add);
  els.moveModal.hidden = false;
  setModalOpen(true);
  (els.moveLists.querySelector('[aria-current]') || els.moveLists.firstChild).focus();
}

function closeMoveWords() {
  const m = state.moving;
  if (!m) return;
  state.moving = null;
  els.moveModal.hidden = true;
  setModalOpen(!!document.querySelector('.modal:not([hidden])')); // the word dialog or picker may be under it
  m.lastFocus?.focus?.();
}

function moveWordsTo(keys, what, fromId, toId) {
  const always = els.moveDefault.checked;
  closeMoveWords();
  if (always) {
    setTarget(toId);
    if (state.addingTo) state.addingTo = toId; // adding from a topic: its bar names the new list
  }
  if (toId === fromId) {
    if (always) listsChanged(toId);
    return;
  }
  const out = new Set(keys);
  changeList(fromId, (l) => { l.words = l.words.filter((k) => !out.has(k)); });
  const to = changeList(toId, (l) => {
    const have = new Set(l.words);
    l.words.push(...keys.filter((k) => !have.has(k)));
  });
  toast(`✓ Moved ${what} to '${to.name}'`, { tone: 'good', action: { label: 'Change', fn: () => openMoveWords(keys, what, toId) } });
}

// A list's name, asked in the confirm dialog's text box. Resolves the trimmed name, or null.
async function askListName(title, value = '', confirmLabel = 'Save') {
  const ok = await confirmDialog({ title, confirmLabel, input: { value, placeholder: 'Name, e.g. Food words' } });
  const name = els.confirmInput.value.trim();
  return ok && name ? name.slice(0, 60) : null;
}

async function renameList(id) {
  const list = listById(id);
  if (!list) return;
  const name = await askListName('Rename list', list.name);
  if (!name || name === list.name) return;
  changeList(id, (l) => { l.name = name; });
}

async function deleteList(id) {
  const list = listById(id);
  if (!list) return;
  const n = list.words.length;
  const ok = await confirmDialog({
    title: `Delete '${list.name}'?`,
    message: `${n ? `Its ${n} word${n === 1 ? '' : 's'} stay in their topics, and your progress on them is kept.` : 'It has no words.'}`,
    confirmLabel: 'Delete',
    danger: true,
  });
  if (!ok) return;
  const store = loadStore();
  store.lists = (store.lists || []).filter((l) => l.id !== id);
  saveStore(store);
  scopeCache.delete(listScopeId(id));
  if (getPreferences().targetListId === id) setTarget(store.lists[0]?.id || null);
  if (state.addingTo === id) state.addingTo = null;
  // Showing it: the next list, or the first topic.
  if (state.currentDeckId === listScopeId(id)) {
    selectDeck(store.lists[0] ? listScopeId(store.lists[0].id) : state.decks.find((d) => !d.passage).id);
  }
  toast(`Deleted '${list.name}'`);
}

// The List page's Add words: the picker, to choose a topic or another list to add from. Its words'
// 🔁 then add to this list, and a bar over the page says so, with Done to come back (renderWordlist).
function openAddWords(id) {
  setTarget(id);
  if (state.view !== 'wordlist') setView('wordlist');
  openDeckPicker({ addTo: id });
}

function doneAdding() {
  const id = state.addingTo;
  state.addingTo = null;
  if (id && listById(id)) selectDeck(listScopeId(id));
  else renderWordlist();
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
// are separate paths, so they can pulse while the word plays (markSpeakers); a cross takes their
// place when muted (applyMute). index.html has the same SVG inline.
const SPEAKER_PATHS = ['M11 5 6 9H3v6h3l5 4z', 'M15.5 8.5a5 5 0 0 1 0 7', 'M18.5 5.5a9.5 9.5 0 0 1 0 13', 'M16 9l6 6M22 9l-6 6'];

function speakerIcon() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'speaker-icon');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');
  SPEAKER_PATHS.forEach((d, i) => {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    if (i) path.setAttribute('class', i < 3 ? `wave wave${i}` : 'mute-x');
    svg.append(path);
  });
  return svg;
}
// The pages' line icons: the phone's tab bar, the home cards and the topic button (a topic: Topics'
// list; a category or Everything: a folder; one of your lists: a bookmark). index.html has the same paths inline.
const PAGE_ICONS = {
  home: 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  topics: 'M9 6h12M9 12h12M9 18h12M4 6h.01M4 12h.01M4 18h.01',
  flashcards: 'M5 7h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2zM7 3h12a2 2 0 0 1 2 2v12',
  reading: 'M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2zM22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z',
  dictionary: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z',
  group: 'M3 6.5A1.5 1.5 0 0 1 4.5 5H9l2 2.5h8.5A1.5 1.5 0 0 1 21 9v9.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.5z',
  alphabet: 'M7 20V10a5 5 0 0 1 10 0v10M7 11.5c-1.4-.2-2.3-1.2-2-2.6',
  mylist: 'M6 3h12v18l-6-4.5L6 21z', // a bookmark: one of your lists (2026-10-20)
};
const reviewIcon = () => lineIcon('review-icon', '0 0 24 24', 'M16 1l4 4-4 4M4 11V9a4 4 0 0 1 4-4h12M8 23l-4-4 4-4M20 13v2a4 4 0 0 1-4 4H4');

// A toast: a short message at the bottom of the screen that fades out after `ms`. A new one
// replaces any still showing.
let toastTimer = null;
// With `action` ({ label, fn }), a button at its end (Change, 2026-10-20): it then stays at least
// TOAST_ACTION_MS, and while a finger, the mouse or focus is on it.
const TOAST_ACTION_MS = 5000;
let toastMs = 0;
function toast(message, { ms = 2000, tone = '', action = null } = {}) {
  const el = els.toast;
  // A leading ✓ stands apart, centred beside the message, which can wrap to two lines (the user's
  // call, 2026-10-20: it sat at the start of the first line).
  const [, tick, text] = message.match(/^(✓\s+)?([\s\S]*)$/);
  const parts = [Object.assign(document.createElement('span'), { className: 'toast-msg', textContent: text })];
  if (tick) parts.unshift(Object.assign(document.createElement('span'), { className: 'toast-tick', textContent: '✓' }));
  if (action) {
    const btn = Object.assign(document.createElement('button'), { type: 'button', className: 'toast-action', textContent: action.label });
    btn.addEventListener('click', () => {
      hideToast();
      action.fn();
    });
    parts.push(btn);
  }
  el.replaceChildren(...parts);
  el.className = 'toast' + (tone ? ` ${tone}` : '') + (action ? ' has-action' : '');
  el.hidden = false;
  void el.offsetWidth; // restart the fade-in
  el.classList.add('show');
  toastMs = action ? Math.max(ms, TOAST_ACTION_MS) : ms;
  timeToast();
}

function timeToast() {
  clearTimeout(toastTimer);
  toastTimer = setTimeout(hideToast, toastMs);
}

function hideToast() {
  clearTimeout(toastTimer);
  els.toast.classList.remove('show');
  toastTimer = setTimeout(() => { els.toast.hidden = true; }, 250); // after the fade-out
}

// Held: a toast with a button waits while it's touched, hovered or focused, then has its time again.
function holdToast(held) {
  if (!els.toast.classList.contains('has-action') || !els.toast.classList.contains('show')) return;
  if (held) clearTimeout(toastTimer);
  else timeToast();
}

// A confirm dialog. Resolves true for the confirm button, false for Cancel, the backdrop or
// Escape. `message` can hold \n line breaks. `danger` (for what can't be undone) makes the
// confirm button red and starts focus on Cancel, so Enter doesn't confirm. With `setting` (a boolean setting, true = ask; listed under Settings →
// Wordlists, beside the buttons they confirm), it offers "Don't ask again", which turns the setting off when confirming; while
// it's off, it resolves true straight away without showing anything.
// With `input` ({ value, placeholder }), a text box under the message (a list's name, 2026-10-20),
// focused, Enter confirming; the caller reads els.confirmInput.
function confirmDialog({ title, message = '', confirmLabel = 'OK', cancelLabel = 'Cancel', setting = null, danger = false, input = null }) {
  if (setting && getSettings()[setting] === false) return Promise.resolve(true);
  if (state.confirm) closeConfirm(false);
  els.confirmInput.hidden = !input;
  els.confirmInput.value = input?.value || '';
  els.confirmInput.placeholder = input?.placeholder || '';
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
    (input ? els.confirmInput : danger ? els.confirmCancel : els.confirmOk).focus();
    if (input) els.confirmInput.select();
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
  const was = els.review.hidden;
  els.review.hidden = !state.review;
  // Shown only now (a stream started on coming to Cards in Recall: enterReview's presentEntry fitted
  // it while hidden): sized now (2026-10-16, the user's report: after a reload, or once a stream had
  // ended, the card kept the stylesheet's height, its foot too low, until a mode switch).
  if (was && !els.review.hidden && state.view === 'flashcards') fitCardText();
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
      // Read's lines, or the word dialog's (contextSection).
      const row = [...els.readerLines.children, ...els.wordModalBody.querySelectorAll('.ctx-line')].find((r) => r.dataset.say === speakingText);
      span = row ? [...row.querySelectorAll('[data-c0]')].find((x) => +x.dataset.c0 <= c && c < +x.dataset.c1) ?? null : null;
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

// The list: the stories that use the words of the topic or list (the topic picker's choice, shared
// with the List page), best matches first. There's no list of every story, as there'd be too many
// (the user's call, 2026-10-08; Everything had one, a level at a time, for a day in the lists spike).
function renderReadingList() {
  const scope = currentScope();
  readingFor(scope?.id);
  const q = state.readingQuery.trim();
  const found = listedStories(scope, q);
  if (!found.length) {
    const empty = document.createElement('div');
    empty.className = 'reading-empty';
    empty.append(q ? `No stories match "${q}".` : !scope ? '' : scope.kind === 'list' ? `No stories use two or more of the words in '${scope.name}' yet.` : `No stories for ${scope.name} yet.`);
    // A narrower choice can try its whole category, whose words are pooled.
    const cat = !q && scope && scope.kind !== 'category' ? scope.decks[0]?.category : null;
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
  els.readingList.replaceChildren(...pagedStories(found));
}

// The list's stories in order, past the page shown: a topic's or list's, or a search's.
function listedStories(scope, q) {
  let found = scope ? storiesFor(scope).map(({ d }) => d) : [];
  if (q) found = found.filter((d) => storyMatches(d, q));
  // A story opened from elsewhere (a search result) that isn't one of this topic's goes first.
  const open = found.length && state.readingId && state.decks.find((d) => d.id === state.readingId && d.passage);
  if (open && !found.includes(open)) found.unshift(open);
  return found;
}

// What Read all reads: the whole list, not just the page shown (the user's request, 2026-10-20).
function readAllStories() {
  return listedStories(currentScope(), state.readingQuery.trim());
}

// A long list in pages (the user's call, 2026-10-20: a list's or Everything's stories ran to hundreds):
// the first READING_PAGE, then Show more for the next, a search's matches too (showing them all
// looked worse: the user, the same day). The open story is always among them, the pages shown
// running on to it, as Read all's does on reaching the end of a page (the user's request, same day).
const READING_PAGE = 10;
function pagedStories(stories) {
  const at = stories.findIndex((d) => d.id === state.readingId);
  if (at >= state.readingShown) state.readingShown = (Math.floor(at / READING_PAGE) + 1) * READING_PAGE;
  const shown = stories.slice(0, state.readingShown).map(storyEntry);
  const left = stories.length - state.readingShown;
  if (left > 0) {
    const more = document.createElement('button');
    more.type = 'button';
    more.className = 'ghost reading-more';
    more.textContent = `Show ${Math.min(left, READING_PAGE)} more · ${left} left`;
    more.addEventListener('click', () => {
      state.readingShown += READING_PAGE;
      renderReadingList();
      placeReader();
    });
    shown.push(more);
  }
  return shown;
}

// A new topic or list starts at the top: the first page, and no search.
function readingFor(key) {
  if (key === state.readingFor) return;
  state.readingFor = key;
  state.readingShown = READING_PAGE;
  state.readingQuery = '';
  els.readingSearch.value = '';
}

// Reading's search: a Thai query finds the stories' Thai (word breaks ignored), anything else their
// titles, descriptions and English.
let storyText = null;
function storyMatches(d, q) {
  storyText ||= new Map();
  if (!storyText.has(d.id)) {
    storyText.set(d.id, {
      th: d.passage.map((l) => l.th).join(' ').replace(/[|\s]/g, ''),
      en: [d.name, d.description || '', ...d.passage.map((l) => l.en)].join('\n').toLowerCase(),
    });
  }
  const t = storyText.get(d.id);
  return /[\u0E00-\u0E7F]/.test(q) ? t.th.includes(q.replace(/\s/g, '')) : t.en.includes(q.toLowerCase());
}

// A story's row: its title button opens and closes it; the open one's row also holds Read.
function storyEntry(d) {
  const entry = document.createElement('div');
  entry.className = 'reading-entry';
  entry.dataset.id = d.id;
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

// The open story's title at the top of the window, under the sticky top bar (on a phone, the
// pinned section row; .section-bar has no box elsewhere, as the phone's .topbar has no height).
function scrollToReading() {
  const item = els.readingList.querySelector('.reading-entry.open .reading-item');
  if (!item) return;
  const bar = (document.querySelector('.topbar')?.offsetHeight || 0) + (document.querySelector('.section-bar')?.offsetHeight || 0);
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

// One of your lists is stricter (the user's call, 2026-10-20: all of Food & Drink in a list found 216
// stories): a story at least READING_LIST_SHARE of whose words are in the list (Food & Drink: 45),
// the most of it first. When that leaves less than a page, as a short list's does (Greetings: 2),
// every story with two of its words, ordered the same way.
const READING_LIST_SHARE = 0.25;

function storiesFor(scope) {
  const words = new Set(scope.cards.map((c) => c.thai).filter((w) => !READING_COMMON.has(w)));
  const found = [];
  for (const d of state.decks) {
    if (!d.passage) continue;
    const own = [...new Set(d.cards.map((c) => c.thai))].filter((w) => !READING_COMMON.has(w));
    const hits = own.filter((w) => words.has(w));
    if (hits.length >= READING_MIN_MATCH) found.push({ d, hits, share: hits.length / own.length });
  }
  if (scope.kind !== 'list') return found.sort((a, b) => b.hits.length - a.hits.length || a.d.name.localeCompare(b.d.name));
  found.sort((a, b) => b.share - a.share || b.hits.length - a.hits.length || a.d.name.localeCompare(b.d.name));
  const close = found.filter((f) => f.share >= READING_LIST_SHARE);
  return close.length >= READING_PAGE ? close : found;
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
          // A ๆ on its own (มาก ๆ, in 15 lines; most write มาก_ๆ, one word) says the word before it
          // again, not its own name (mái yá-mók) (2026-10-21).
          tr.push((w === 'ๆ' && tr.length ? tr[tr.length - 1] : card.translit) + (label ? ':' : ''));
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
  if (mutedNotice()) return;
  const all = btn === els.readingReadAll;
  const ids = from?.ids ?? (all ? readAllStories().map((d) => d.id) : state.readingId ? [state.readingId] : []);
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
          // Not drawn: past the page shown (the next page shows).
          if (!els.readingList.querySelector(`.reading-entry[data-id="${CSS.escape(id)}"]`)) renderReadingList();
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
  const rv = reviewButton(key, card.thai);
  if (!card.alpha && !card.time) actions.append(rv); // the Alphabet's Cards hold every letter, and a time (Time's) isn't a card: nothing to add
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
  // Under them, the word's tones (tones.js), closed to a row until tapped; then the word in the
  // stories (contextSection).
  const tones = toneSection(card, big);
  const context = contextSection(card);
  els.wordModalBody.replaceChildren(wordBox, actions, ...(tones ? [tones.el] : []), ...(context ? [context] : []));
  if (!wordPop) wordPop = { lastFocus: document.activeElement };
  showWordModal();
  els.wordModalBody.scrollTop = 0;
  fitPopWord(big);
  tones?.shown();
  els.wordModalClose.focus({ preventScroll: true });
}

// On a phone the word (and letter) dialog sits between the pinned top row and the tab bar (mobile.css),
// leaving both in sight and in reach (the user's call, 2026-10-14): it starts where the row ends.
function showWordModal() {
  const rows = PHONE_LAYOUT.matches ? [...document.querySelectorAll('.section-bar, .dict-top, .time-top')].map((e) => e.getBoundingClientRect()).filter((r) => r.height) : [];
  els.wordModal.style.setProperty('--modal-top', `${Math.round(Math.max(0, ...rows.map((r) => r.bottom)))}px`);
  els.wordModal.hidden = false;
  setModalOpen(true);
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

// ---------- the word in the stories (contextSection) ----------
// At the foot of the word dialog, the lines of the stories that use it (2026-10-21, the user's pick
// from a list of ideas: a word sticks better in a sentence). Each is the story's line as Read shows
// it, the word picked out, with its ▶ (the words lit as it plays, as on Read) and the story's name,
// which opens it there with the word lit (openReading). Three to start, five more a press.
// Which lines: whole sentences (not the end of one carried over from the line before, whose English
// starts in lower case or the line's ends in a comma), easiest stories first, then shortest, one a
// story before a second from any. Not a speaker's label ("คนขับ:"). The Southern, Isan and Northern
// stories only for their own words, so a standard word isn't shown among dialect ones.
// A phrase (พูดช้า ๆ ได้ไหม) is a run of a line's words; a word is a whole one (ไป, not in ไปรษณีย์).
const CONTEXT_FIRST = 3;
const CONTEXT_MORE = 5;
const DIALECT_CATEGORIES = new Set(['Southern Thai', 'Isan Thai', 'Northern Thai']);
const STORY_GROUP_RANK = { Easy: 0, 'Little Stories': 1, Medium: 2, Harder: 3 };

// A line's words in order: `space` before one a real space, `label` a speaker's.
function lineWords(th) {
  const words = [];
  th.split(' ').forEach((chunk, i) => chunk.split('|').forEach((tok, j) => {
    const label = tok.endsWith(':');
    words.push({ w: (label ? tok.slice(0, -1) : tok).replace(/_/g, ' '), label, space: i > 0 && j === 0 });
  }));
  return words;
}

// A word only in the Southern, Isan or Northern topics.
function dialectOnly(card) {
  const topics = (state.cardIndex.get(cardKey(card))?.deckIds || []).map(deckOfId).filter((d) => d && !d.passage);
  return topics.length > 0 && topics.every((d) => DIALECT_CATEGORIES.has(d.category));
}

// Every whole-sentence line of the stories, once, when first wanted.
let storyLines = null;
function allStoryLines() {
  if (storyLines) return storyLines;
  storyLines = [];
  for (const d of state.decks) {
    if (!d.passage) continue;
    const dialect = d.cards.some(dialectOnly);
    const rank = STORY_GROUP_RANK[d.group] ?? 4;
    for (const line of d.passage) {
      const en = line.en.trim();
      if (/^[a-z]/.test(en) || /[,;]$/.test(en)) continue;
      const say = sentenceText(line.th);
      storyLines.push({ d, line, say, dialect, rank, words: lineWords(line.th) });
    }
  }
  return storyLines;
}

// The lines with the word (or phrase), in the order to show them, each with where it is in the line.
function storyExamples(card) {
  const target = card.thai.replace(/ /g, '');
  const dialectOk = dialectOnly(card);
  const found = [];
  const seen = new Set();
  for (const l of allStoryLines()) {
    if ((l.dialect && !dialectOk) || seen.has(l.say) || !l.say.replace(/ /g, '').includes(target)) continue;
    const hits = new Set();
    l.words.forEach((x, i) => {
      if (x.label) return;
      let run = '';
      for (let j = i; j < l.words.length && !l.words[j].label && run.length < target.length; j++) {
        run += l.words[j].w.replace(/ /g, '');
        if (run === target) for (let k = i; k <= j; k++) hits.add(k);
      }
    });
    if (!hits.size) continue;
    seen.add(l.say);
    found.push({ ...l, hits });
  }
  found.sort((a, b) => a.rank - b.rank || a.say.length - b.say.length);
  const first = new Set();
  const lead = found.filter((x) => !first.has(x.d.id) && first.add(x.d.id));
  return [...lead, ...found.filter((x) => !lead.includes(x))];
}

function contextSection(card) {
  if (card.alpha) return null; // a letter (the Alphabet's)
  const found = storyExamples(card);
  if (!found.length) return null;
  loadWordTimings();
  const box = document.createElement('div');
  box.className = 'pop-context';
  const lines = document.createElement('div');
  const more = document.createElement('button');
  more.type = 'button';
  more.className = 'ghost ctx-more';
  let shown = 0;
  const show = (n) => {
    lines.append(...found.slice(shown, shown + n).map((x) => contextLine(x, card)));
    shown = Math.min(found.length, shown + n);
    more.hidden = shown >= found.length;
    more.textContent = `Show ${Math.min(CONTEXT_MORE, found.length - shown)} more`;
  };
  more.addEventListener('click', () => show(CONTEXT_MORE));
  show(CONTEXT_FIRST);
  box.append(Object.assign(document.createElement('div'), { className: 'tones-head', textContent: 'In stories' }), lines, more);
  return box;
}

function contextLine(x, card) {
  const row = document.createElement('div');
  row.className = 'ctx-line';
  row.dataset.say = x.say; // lightSpokenWord finds the line by it
  const play = document.createElement('button');
  play.type = 'button';
  play.className = 'row-speak reader-play';
  play.dataset.say = x.say;
  play.title = 'Play the sentence';
  play.setAttribute('aria-label', play.title);
  play.append(speakerIcon());
  play.addEventListener('click', () => speakerPress(play, x.say));
  // The Thai, the transliteration from the story's own cards, as Read builds them (renderReader).
  const own = new Map(x.d.cards.map((c) => [c.thai, c]));
  const th = Object.assign(document.createElement('p'), { className: 'ctx-th', lang: 'th' });
  const tr = [];
  let at = 0;
  x.words.forEach((word, i) => {
    if (word.space) th.append(' ');
    const c = word.label ? -1 : x.say.indexOf(word.w, at);
    if (c >= 0) at = c + word.w.length;
    const span = Object.assign(document.createElement('span'), { className: 'ctx-w' + (x.hits.has(i) ? ' hit' : ''), textContent: word.w });
    if (c >= 0) Object.assign(span.dataset, { c0: c, c1: c + word.w.length });
    th.append(span);
    if (word.label) th.append(':');
    const tl = word.w === 'ๆ' && tr.length ? tr[tr.length - 1] : own.get(word.w)?.translit; // as Read's (renderReader)
    if (tl || word.w) tr.push((tl || word.w) + (word.label ? ':' : ''));
  });
  const from = document.createElement('button');
  from.type = 'button';
  from.className = 'ctx-from';
  from.append(x.d.name, lineIcon('arrow-icon', '0 0 16 16', 'M2.5 8h10.5M9 4l4 4-4 4'));
  from.title = `Open "${x.d.name}" on Read`;
  from.addEventListener('click', () => openReading(x.d.id, card.thai));
  const body = document.createElement('div');
  body.className = 'ctx-body';
  body.append(th,
    Object.assign(document.createElement('p'), { className: 'ctx-tr', textContent: tr.join(' ') }),
    Object.assign(document.createElement('p'), { className: 'ctx-en', textContent: x.line.en }),
    from);
  row.append(play, body);
  return row;
}

// ---------- tones (tones.js) ----------

// The word dialog's Tones (2026-10-11, the user's request): a strip with each syllable's tone drawn,
// its transliteration and the tone's name; the rule for the syllable picked (the first, to start),
// row by row (toneRule); and its cell in the tone table (toneTable). Picking a syllable lights its
// letters in the big word and says it. Always open since 2026-10-14 (the user's call); it was a
// row of small curves that opened, open or closed remembered in prefs.popTones.
// { el, shown } (call shown() once the dialog is showing, to light the picked syllable), or null for
// a word whose Thai can't be matched to its transliteration.
function toneSection(card, big) {
  const syls = toneBreakdown(card.thai, card.translit);
  if (!syls?.length) return null;
  const el = (tag, className, textContent = '') => Object.assign(document.createElement(tag), { className, textContent });
  const newWord = (n) => n > 0 && syls[n].word !== syls[n - 1].word;
  const box = el('div', 'pop-tones');

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

  box.append(el('div', 'tones-head', 'Tones'), panel);
  return { el: box, shown: () => pick(picked) };
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
function toneCurve(tone, { staff = true } = {}) {
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', `tone-curve tone-${tone}`);
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
  if (on) showCardDialog(card);
  return on;
}

// A card back's dialog: the word dialog, or for the Alphabet's cards their own (2026-10-16, the
// user's call: the word dialog's Add to Cards did nothing for them, as the Alphabet's Cards hold
// every letter, and Spell only said a letter's name again): a consonant's letter dialog, a vowel's
// vowel dialog; a Tones card's syllable keeps the word dialog, without Add to Cards (showWordPop).
function showCardDialog(card) {
  if (card.alpha && card.alphaSet === 'consonants') return showLetterPop(null, alphaCards.find((a) => a.thai === card.thai) || card);
  if (card.alpha && card.alphaSet === 'vowels') return showVowelPop(null, alphaSets.vowels.cards.find((v) => v.thai === card.thai) || card);
  return showWordPop(null, card);
}

function tapCardThai(el, e, card, { back = false } = {}) {
  if (!el || !el.contains(e.target)) return false;
  const hit = tappedPart(el, card, e.clientX, e.clientY, CARD_TAP_REACH);
  if (!hit) return false;
  if (back && card) {
    showCardDialog(card);
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
  if (state.reading.active || mutedNotice()) return;
  const rows = listedWords(); // a search's matches, every page (pagedWords shows the next as it gets there)
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

// Settings → Reset → Clear Cards went with the lists spike (2026-10-20): a list is deleted from
// its List page.

// Every setting back to its default (getSettings merges DEFAULT_SETTINGS over what's saved).
// Progress and the Review list aren't settings, and nor is "Download all audio" being on: the
// audio stays downloaded and kept up to date.
async function resetSettings() {
  const ok = await confirmDialog({
    title: 'Reset all settings?',
    message: 'Every setting goes back to its default. Your progress and your lists are kept.',
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
  applyMute();
  applyDevFeatures();
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
// it's the words likely to play soon, the top of the list (Cards goes through it in order since the
// lists spike, 2026-10-20; before, the words in Cards came first). Anything else is fetched when it's played.
const PRELOAD_MAX = 80;
function preloadDeckAudio(deck) {
  if (getSettings().audioSource !== 'samples') {
    queuePageAudio([]);
    return;
  }
  const cards = deck.cards.slice(0, PRELOAD_MAX);
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
  if (!groups || mutedNotice()) return;
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

// Resolves true once the sample has played (or been stopped), false if it couldn't load. Muted, at
// once, without touching the player.
function playSample(url, speed) {
  if (isMuted()) return Promise.resolve(true);
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
// A press held LONG_PRESS_MS without moving calls fn, and the click its release would make is
// swallowed wherever it lands (the dialog fn opens may be under the finger by then). Right-click,
// and Android's long-press menu, call it too.
const LONG_PRESS_MS = 450;
let longPressHeld = false;   // fired, the finger not yet up
let swallowClickUntil = 0;
document.addEventListener('click', (e) => {
  if (longPressHeld || performance.now() < swallowClickUntil) {
    e.preventDefault();
    e.stopPropagation();
  }
}, true);
for (const type of ['pointerup', 'pointercancel']) {
  document.addEventListener(type, () => {
    if (!longPressHeld) return;
    longPressHeld = false;
    swallowClickUntil = performance.now() + 400;
  }, true);
}
function onLongPress(el, fn) {
  let timer = null;
  let start = null;
  const stop = () => { clearTimeout(timer); timer = null; };
  el.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    start = [e.clientX, e.clientY];
    timer = setTimeout(() => { timer = null; longPressHeld = true; fn(); }, LONG_PRESS_MS);
  });
  el.addEventListener('pointermove', (e) => {
    if (timer && Math.hypot(e.clientX - start[0], e.clientY - start[1]) > 10) stop();
  });
  el.addEventListener('pointerup', stop);
  el.addEventListener('pointercancel', stop);
  el.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    if (!longPressHeld && !timer) fn();
  });
}

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
  document.querySelectorAll('.row-speak, .letter-tile, .time-band-label').forEach((b) => b.classList.toggle('playing', on(b.dataset.say)));
}

function ttsAndWait(text, lang) {
  return new Promise((resolve) => {
    if (isMuted() || !('speechSynthesis' in window)) { resolve(); return; }
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

// ---------- Time (time.js; a spike, 2026-10-21: branch 2026-10-21-spike-time) ----------
// Explore: a clock to set, by dragging its hands (the long one by 5 minutes, carrying the hour round;
// the short one by the hour), by ‹ › (5 minutes) or by the band, and the Thai for its time under it,
// the everyday way or the official one (prefs.timeStyle). The band is the day's 24 hours in the
// six-hour clock's four quarters, the day's hours grey and the night's blue, with the count its Thai
// uses (บ่าย 1–3, เย็น 4–6, ทุ่ม 1–5), its name under its hours saying itself when tapped; the clock's
// rim shows day and night for the half of the day it's in. A change says the time, whatever Cards'
// auto-play (its A): the user set it, so wants to hear it (the user's call, 2026-10-22; a tap on an
// hour was silent with auto-play off). Mute still silences it. It opens on the time now, to the 5
// minutes.
const SVG_NS = 'http://www.w3.org/2000/svg';
const svgEl = (tag, attrs = {}) => {
  const e = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  return e;
};
const timeStyle = () => (getPreferences().timeStyle === 'official' ? 'official' : 'everyday');
const timeSaysOnChange = () => getPreferences().autoPlay !== false; // Quiz's questions; Explore always says its time
let clockParts = null; // Explore's clock's hands and rim, once drawn (drawClock)
let clockDrag = null;  // 'hour' or 'minute' while a hand is dragged

// A point on the clock: `deg` clockwise from 12, `r` from the middle (the face is 0 0 200 200).
const clockPoint = (deg, r) => [100 + r * Math.sin((deg * Math.PI) / 180), 100 - r * Math.cos((deg * Math.PI) / 180)];

// A clock in `svg` (Explore's, or a Quiz question's): its hands and rim, to set (setClock).
function drawClock(svg) {
  svg.replaceChildren(svgEl('circle', { class: 'clock-face', cx: 100, cy: 100, r: 91 }));
  // The rim: an hour's arc each, coloured as day or night, the time's hour lit (setClock).
  const rim = [];
  for (let k = 0; k < 12; k++) {
    const [x0, y0] = clockPoint(k * 30 + 1, 96);
    const [x1, y1] = clockPoint(k * 30 + 29, 96);
    const arc = svgEl('path', { class: 'clock-rim', d: `M${x0.toFixed(2)} ${y0.toFixed(2)}A96 96 0 0 1 ${x1.toFixed(2)} ${y1.toFixed(2)}` });
    rim.push(arc);
    svg.append(arc);
  }
  for (let i = 0; i < 60; i++) {
    const five = i % 5 === 0;
    const [x0, y0] = clockPoint(i * 6, five ? 80 : 84);
    const [x1, y1] = clockPoint(i * 6, 88);
    svg.append(svgEl('line', { class: five ? 'clock-tick five' : 'clock-tick', x1: x0, y1: y0, x2: x1, y2: y1 }));
  }
  for (let n = 1; n <= 12; n++) {
    const [x, y] = clockPoint(n * 30, 67);
    const t = svgEl('text', { class: 'clock-num', x, y, 'text-anchor': 'middle', 'dominant-baseline': 'central' });
    t.textContent = n;
    svg.append(t);
  }
  const hour = svgEl('line', { class: 'clock-hand hour', x1: 100, y1: 100, x2: 100, y2: 52 });
  const minute = svgEl('line', { class: 'clock-hand minute', x1: 100, y1: 100, x2: 100, y2: 26 });
  svg.append(hour, minute, svgEl('circle', { class: 'clock-pin', cx: 100, cy: 100, r: 5 }));
  return { hour, minute, rim };
}

// The hands at h:m, and the rim the half of the day it's in, the hour's arc lit (or `lit`'s: a name's).
function setClock(parts, h, m, lit = [h]) {
  parts.hour.setAttribute('transform', `rotate(${(h % 12) * 30 + m / 2} 100 100)`);
  parts.minute.setAttribute('transform', `rotate(${m * 6} 100 100)`);
  const half = h < 12 ? 0 : 12;
  parts.rim.forEach((arc, k) => arc.setAttribute('class', `clock-rim period-${periodOf(half + k).id}` + (lit.includes(half + k) ? ' on' : '')));
}

// `name`: a band's name tapped, shown until the time's set some other way.
function setTime(h, m, { say = false, name = null } = {}) {
  state.time = { h: ((h % 24) + 24) % 24, m: ((m % 60) + 60) % 60 };
  state.timeName = name;
  renderTime();
  if (say) speak(timePhrase(state.time.h, state.time.m, timeStyle()).th);
}

function stepTime(minutes) {
  const at = (state.time.h * 60 + state.time.m + minutes + 1440) % 1440;
  setTime(Math.floor(at / 60), at % 60, { say: true });
}

function renderTime() {
  if (!clockParts) clockParts = drawClock(els.timeClock);
  const { h, m } = state.time;
  const style = timeStyle();
  els.timeStyleButtons.forEach((b) => b.setAttribute('aria-checked', String(b.dataset.timeStyle === style)));
  const name = timeNamePicked();
  setClock(clockParts, h, m, name ? name.hours : [h]);
  renderTimeBand();
  const said = timeCard();
  els.timeTh.textContent = said.thai;
  els.timeTr.textContent = said.translit;
  fitTimeSay();
  els.timeEn.textContent = said.english;
  els.timeClock.setAttribute('aria-label', `Clock at ${timeEnglish(h, m)}: drag its hands`);
  els.timePlay.dataset.say = said.thai;
  els.timePlay.classList.toggle('playing', sayingNow(said.thai));
  // The time's words as buttons, and a caption with what one meant or a note on the time ("could be
  // 6 am or 6 pm…"), went 2026-10-21 (the user's call: too busy). time.js still has them (parts, note).
  preloadTimeAudio(); // the times around this one
}

// A name tapped on the band (Everyday's): the name's Thai, transliteration and meaning in place of
// the time's, its hours lit on the rim, until the time changes (the user's call, 2026-10-22).
const timeNamePicked = () => (timeStyle() === 'everyday' && state.timeName ? PERIODS.find((x) => x.id === state.timeName.id) : null);

// What Explore's three lines say, as a card: the time's phrase, or a name's. A tap on any of them
// opens it in the word dialog (showWordPop), the whole phrase with each syllable's tone, as a Topics
// phrase row's transliteration and English do (the user's call, 2026-10-22). `time`: not a topic's
// card, so no adding it to a list.
function timeCard() {
  const name = timeNamePicked();
  if (name) return { thai: name.th, translit: name.tl, english: name.gloss, time: true };
  const p = timePhrase(state.time.h, state.time.m, timeStyle());
  return { thai: p.th, translit: p.tl, english: p.en + (p.written ? ` · written ${p.written}` : ''), time: true };
}

// The time's Thai on one line beside its ▶, smaller for a long one (บ่ายสองโมงสามสิบห้านาที wrapped
// mid-phrase on a phone), as Cards' text fits its card; at the least 18 px, past that it wraps.
// Quiz's question too (fitTimeText(els.timeQPrompt, els.timeQPlay)), so its card keeps its height.
function fitTimeText(el = els.timeTh, play = els.timePlay, min = 18) {
  el.style.fontSize = '';
  el.classList.remove('wraps');
  if (els.timeSection.hidden || !el.offsetParent) return;
  const room = el.parentElement.clientWidth - (play && !play.hidden ? play.offsetWidth : 0) - 4;
  if (el.scrollWidth <= room) return;
  const px = Math.floor((parseFloat(getComputedStyle(el).fontSize) * room) / el.scrollWidth);
  el.style.fontSize = `${Math.max(min, px)}px`;
  if (px < min) el.classList.add('wraps');
}

// Explore's Thai and its transliteration, each on one line: the time's lines keep one height, so with
// the page's room shared out around them (mobile.css) the clock and band don't move as it changes
// (a long transliteration wrapped at text size 2, 2026-10-21).
function fitTimeSay() {
  fitTimeText();
  fitTimeText(els.timeTr, null, 13);
}

// The band: the six-hour clock's four quarters, a row each (2026-10-21, the user's call; am and pm
// rows of twelve before), each counting one to six and ending on the day's markers: 1–6 am (ตี, then
// six in the morning), 7 am–noon, 1–6 pm (บ่าย, เย็น), 7 pm–midnight (ทุ่ม one to five, then
// midnight, once หกทุ่ม). Under each run of a part of the day, its name: centred, or a single hour's
// (the quarter's last) to the row's end. Official time has none of the names and counts 0–23
// (สิบสามนาฬิกา, ศูนย์นาฬิกา), so there the cells are the 24 hours' numbers and the names go (the
// user's call, 2026-10-22).
const TIME_QUARTERS = [[1, 2, 3, 4, 5, 6], [7, 8, 9, 10, 11, 12], [13, 14, 15, 16, 17, 18], [19, 20, 21, 22, 23, 0]];
function renderTimeBand() {
  const style = timeStyle();
  const rows = TIME_QUARTERS.map((hours) => {
    const row = document.createElement('div');
    row.className = 'time-band-row';
    for (const h of hours) {
      const period = periodOf(h);
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = `time-cell period-${period.id}` + (h === state.time.h && !state.timeName ? ' on' : '');
      cell.textContent = style === 'official' ? h : period.count(h);
      cell.setAttribute('aria-label', `${timeEnglish(h, 0, style)}: ${timePhrase(h, 0, style).th}`);
      cell.addEventListener('click', () => setTime(h, 0, { say: true })); // on the hour (the user's call, 2026-10-21; it kept the minutes)
      row.append(cell);
    }
    // Official has no names: a blank line in their place, so the band is Everyday's height and the
    // page doesn't jump as the two are switched (the user's call, 2026-10-22).
    if (style === 'official') {
      const blank = Object.assign(document.createElement('span'), { className: 'time-band-label blank', lang: 'th', textContent: 'ตี' });
      blank.setAttribute('aria-hidden', 'true');
      row.append(blank);
      return row;
    }
    for (let i = 0; i < hours.length;) {
      const period = periodOf(hours[i]);
      let n = 1;
      while (i + n < hours.length && periodOf(hours[i + n]) === period) n++;
      // The name says itself when tapped, lit while it does (markSpeakers), and sets the clock on the
      // hour: this hour if it's one of the name's, or else its first (the user's calls, 2026-10-21);
      // it's then picked, the time's lines its own (renderTime, 2026-10-22).
      const run = hours.slice(i, i + n);
      const label = document.createElement('button');
      label.type = 'button';
      label.className = `time-band-label period-${period.id}` + (n === 1 && i + n === hours.length ? ' end' : '')
        + (state.timeName?.from === run[0] ? ' on' : ''); // the one tapped (เช้า has two)
      label.lang = 'th';
      label.textContent = period.th;
      label.dataset.say = period.th;
      label.title = `Play ${period.th}`;
      label.classList.toggle('playing', sayingNow(period.th));
      label.addEventListener('click', () => {
        speak(period.th); // from the start, even while it's playing: a pick, not a speaker's stop (the other เช้า)
        setTime(run.includes(state.time.h) ? state.time.h : run[0], 0, { name: { id: period.id, from: run[0] } });
      });
      label.style.gridColumn = `${i + 1} / span ${n}`;
      row.append(label);
      i += n;
    }
    return row;
  });
  els.timeBand.replaceChildren(...rows);
}

// ---------- Time's Quiz (2026-10-21, the same spike) ----------
// Recognition for times: a time in Thai (or heard) and four in English to pick from, or a clock and
// four in Thai. The wrong answers are the mistakes learners make: the same number in the day's other
// parts (บ่ายสองโมง's are ตีสอง and สองทุ่ม, 2 am and 8 pm), and the hour twelve away (2 am); in
// the official clock, the hour twelve away and the one ending in the same digit (สิบสี่ and สี่).
// The minutes are the question's in all four. Half are on the hour, a quarter half past, the rest
// any 5 minutes. As in Recognition: right is green, wrong red and the right one green, then the
// next after Settings' pauses (Cards → Pause after a right / wrong answer), and a time got wrong
// comes back three questions later. Explore's Everyday | Official applies here too.
const TIME_DIRS = ['th', 'time', 'listen'];
const timePage = () => (getPreferences().timePage === 'quiz' ? 'quiz' : 'explore');
const timeQuizDir = () => (TIME_DIRS.includes(getPreferences().timeQuizDir) ? getPreferences().timeQuizDir : 'th');
let qClockParts = null; // the question's clock, once drawn

// Explore or Quiz, by the page switch.
function renderTimeSection() {
  const page = timePage();
  els.timePageButtons.forEach((b) => b.setAttribute('aria-checked', String(b.dataset.timePage === page)));
  els.timeExplore.hidden = page !== 'explore';
  els.timeQuiz.hidden = page !== 'quiz';
  if (page === 'explore') renderTime();
  else if (!state.timeQuiz?.q || state.timeQuiz.picked !== null) nextTimeQuestion(); // an answered one left behind: the next
  else {
    renderTimeQuiz();
    preloadTimeAudio();
  }
}

// Time's clips, fetched ahead of playback as a topic's are (preloadDeckAudio; the user's call,
// 2026-10-21: each was fetched the first time it played, unless Download all audio had them).
// Explore: the clock's time and those within half an hour of it, nearest first, then the band's
// names and the 24 hours on the hour, in the style shown (about 45 clips, ~450 KB), again as the
// clock moves (those loaded are skipped). Quiz: the question's and the next one's (nextTimeQuestion
// picks it a question ahead). Held in memory, as a topic's Thai is, so they play at once.
function preloadTimeAudio() {
  if (getSettings().audioSource !== 'samples') {
    queuePageAudio([]);
    return;
  }
  const style = timeStyle();
  const say = new Set();
  const at = (h, m) => say.add(timePhrase(h, m, style).th);
  if (timePage() === 'quiz') {
    const { q, ahead } = state.timeQuiz || {};
    if (q) at(q.h, q.m);
    if (ahead) at(ahead.h, ahead.m);
  } else {
    const now = state.time.h * 60 + state.time.m;
    for (let d = 0; d <= 30; d += 5) {
      for (const t of [now + d, now - d]) {
        const x = (t + 1440) % 1440;
        at(Math.floor(x / 60), x % 60);
      }
    }
    if (style === 'everyday') for (const h of TIME_QUARTERS.flat()) say.add(periodOf(h).th); // the band's names
    for (let h = 0; h < 24; h++) at(h, 0);
  }
  queuePageAudio([...say].map((th) => ({ url: sampleUrl(th, 'th'), keep: true })).filter((e) => e.url));
}

function quizTime() {
  const r = Math.random();
  const others = [5, 10, 15, 20, 25, 35, 40, 45, 50, 55];
  return { h: Math.floor(Math.random() * 24), m: r < 0.5 ? 0 : r < 0.75 ? 30 : others[Math.floor(Math.random() * others.length)] };
}

// The hours to offer beside h, likeliest mistakes first.
function timeDecoys(h, style) {
  const hours = [...Array(24).keys()].filter((x) => x !== h);
  if (style === 'official') {
    return [(h + 12) % 24, ...shuffled(hours.filter((x) => x % 10 === h % 10)), ...shuffled([(h + 1) % 24, (h + 23) % 24]), ...shuffled(hours)];
  }
  const count = periodOf(h).count(h);
  const same = shuffled(hours.filter((x) => periodOf(x).count(x) === count));
  return [...same, (h + 12) % 24, ...shuffled(same.map((x) => (x + 12) % 24)), ...shuffled(hours)];
}

// What an answer says: the time in English, or (asked from a clock) its Thai.
const timeAnswerText = (t, dir, style) => (dir === 'time' ? timePhrase(t.h, t.m, style).th : timeEnglish(t.h, t.m, style));

function nextTimeQuestion() {
  const quiz = (state.timeQuiz ||= { comebacks: [], seq: 0 });
  quiz.seq += 1;
  quiz.comebacks.forEach((c) => { c.in -= 1; });
  const due = quiz.comebacks.findIndex((c) => c.in <= 0);
  // A new time is the one picked a question ago (quiz.ahead), its clip loading since (preloadTimeAudio).
  const q = due >= 0 ? quiz.comebacks.splice(due, 1)[0] : quiz.ahead || quizTime();
  if (due < 0) quiz.ahead = null;
  const dir = timeQuizDir();
  const style = timeStyle();
  const options = [{ h: q.h, m: q.m }];
  const seen = new Set([timeAnswerText(q, dir, style)]);
  for (const h of timeDecoys(q.h, style)) {
    const t = { h, m: q.m };
    const text = timeAnswerText(t, dir, style);
    if (seen.has(text) || h === q.h) continue;
    seen.add(text);
    options.push(t);
    if (options.length === 4) break;
  }
  Object.assign(quiz, { q: { h: q.h, m: q.m }, options: shuffled(options), picked: null, dir, style });
  quiz.ahead ||= quizTime();
  renderTimeQuiz();
  const th = timePhrase(q.h, q.m, style).th;
  if (dir === 'listen' || (dir === 'th' && timeSaysOnChange())) speak(th);
  preloadTimeAudio();
}

function renderTimeQuiz() {
  const quiz = state.timeQuiz;
  const { q, options, picked, dir, style } = quiz;
  els.timeDirButtons.forEach((b) => b.setAttribute('aria-checked', String(b.dataset.timeDir === timeQuizDir())));
  const answered = picked !== null;
  const p = timePhrase(q.h, q.m, style);
  if (!qClockParts) qClockParts = drawClock(els.timeQClock);
  setClock(qClockParts, q.h, q.m);
  // The clock is the question asked from a clock; for the others it's blank, no hands, till answered
  // (so nothing moves when they come: the card keeps its height).
  els.timeQClock.classList.toggle('blank', dir !== 'time' && !answered);
  els.timeQPrompt.lang = dir === 'th' || (answered && dir === 'listen') ? 'th' : 'en';
  els.timeQPrompt.className = 'time-q-prompt' + (els.timeQPrompt.lang === 'th' ? ' th' : '');
  els.timeQPrompt.textContent = dir === 'time' ? timeEnglish(q.h, q.m, style) : dir === 'th' || answered ? p.th : '';
  // The speaker: Thai and Listen have it from the start; from a clock, once answered (it'd say it).
  els.timeQPlay.hidden = dir === 'time' && !answered;
  els.timeQPlay.dataset.say = p.th;
  els.timeQPlay.classList.toggle('big', dir === 'listen'); // Listen's question, and still once answered
  els.timeQReveal.textContent = !answered ? (dir === 'listen' ? 'What time do you hear?' : '')
    : dir === 'time' ? `${p.th} · ${p.tl}` : `${p.tl} · ${p.en}${p.written ? ` · ${p.written}` : ''}`;
  els.timeQReveal.classList.toggle('hint', !answered);
  els.timeAnswers.classList.toggle('locked', answered);
  els.timeAnswers.replaceChildren(...options.map((t, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'learn-pill' + (dir === 'time' ? ' thai-pill' : '');
    if (dir === 'time') b.lang = 'th';
    b.textContent = timeAnswerText(t, dir, style);
    const right = t.h === q.h;
    if (answered) b.classList.add(right ? 'correct' : i === picked ? 'wrong' : 'dimmed');
    b.addEventListener('click', () => answerTime(i));
    return b;
  }));
  fitTimeQuiz();
}

// Quiz's parts keep their heights (styles.css, .time-q-say): the question's Thai shrinks to its line,
// and the answer line and the answers to their boxes, down to 12 px, the style guide's least.
function fitTimeQuiz() {
  if (els.timeQuiz.hidden || els.timeSection.hidden) return;
  fitTimeText(els.timeQPrompt, els.timeQPlay);
  for (const el of [els.timeQReveal, ...els.timeAnswers.children]) {
    el.style.fontSize = '';
    let px = parseFloat(getComputedStyle(el).fontSize);
    while (px > 12 && (el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1)) {
      px -= 1;
      el.style.fontSize = `${px}px`;
    }
  }
}

function answerTime(i) {
  const quiz = state.timeQuiz;
  if (!quiz || quiz.picked !== null) return;
  quiz.picked = i;
  const right = quiz.options[i].h === quiz.q.h;
  if (!right && !quiz.comebacks.some((c) => c.h === quiz.q.h && c.m === quiz.q.m)) quiz.comebacks.push({ ...quiz.q, in: 3 });
  renderTimeQuiz();
  if (quiz.dir !== 'listen' && timeSaysOnChange()) speak(timePhrase(quiz.q.h, quiz.q.m, quiz.style).th);
  const seq = quiz.seq;
  const s = getSettings();
  setTimeout(() => {
    if (state.timeQuiz?.seq !== seq || state.view !== 'time' || timePage() !== 'quiz') return; // moved on meanwhile
    nextTimeQuestion();
  }, (right ? s.learnPauseMs : s.wrongPauseMs) + (quiz.dir === 'listen' || timeSaysOnChange() ? 600 : 0));
}

// Dragging a hand: within 60% of the middle the hour's, else the minutes'.
function clockAt(e) {
  const r = els.timeClock.getBoundingClientRect();
  const x = e.clientX - (r.left + r.width / 2);
  const y = e.clientY - (r.top + r.height / 2);
  return { deg: ((Math.atan2(x, -y) * 180) / Math.PI + 360) % 360, d: Math.hypot(x, y) / (r.width / 2) };
}
function moveHand(deg) {
  const { h, m } = state.time;
  if (clockDrag === 'minute') {
    const mm = (Math.round(deg / 30) * 5) % 60;
    if (mm === m) return;
    // Past 12 the hour goes on (or back), as a real clock's does.
    const hh = m >= 45 && mm <= 15 ? h + 1 : m <= 15 && mm >= 45 ? h - 1 : h;
    setTime(hh, mm);
  } else {
    const h12 = Math.round((((deg - m / 2) % 360) + 360) % 360 / 30) % 12;
    // Of the two hours it could be, am or pm, the one nearer the hour it was: so a drag goes on round.
    const near = [h12, h12 + 12].sort((a, b) => Math.min(Math.abs(a - h), 24 - Math.abs(a - h)) - Math.min(Math.abs(b - h), 24 - Math.abs(b - h)))[0];
    if (near !== h) setTime(near, m);
  }
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
      if (t.dataset.view === pageNow()) return; // already there
      goTo(t.dataset.view);
    });
  });
  // Study's Topics | Cards | Reading.
  els.studyPageButtons.forEach((b) => b.addEventListener('click', () => {
    const page = b.dataset.studyPage;
    closeMore();
    if (state.settingsOpen) closeSettings();
    // Reading again, with a story open: it closes, back to the top of the list.
    if (page === 'reading' && state.view === 'reading' && state.readingId) {
      closeReading();
      window.scrollTo(0, 0);
      return;
    }
    if (page !== state.view || state.section !== 'words') setView(page);
  }));

  document.getElementById('read-aloud').addEventListener('click', toggleReadAloud);
  let dictTyping = null;
  els.dictSearch.addEventListener('input', () => {
    clearTimeout(dictTyping);
    dictTyping = setTimeout(() => {
      state.dictQuery = els.dictSearch.value;
      renderDictionary();
    }, 150);
  });
  els.dictLangButtons.forEach((b) => b.addEventListener('click', () => setDictLang(b.dataset.dictLang)));
  let wordTyping = null;
  els.wordlistSearch.addEventListener('input', () => {
    clearTimeout(wordTyping);
    wordTyping = setTimeout(() => {
      if (state.reading.active) stopReadAloud();
      state.wordQuery = els.wordlistSearch.value;
      state.wordShown = WORD_PAGE;
      renderWordlist();
    }, 150);
  });
  els.wordlistMore.addEventListener('click', () => {
    state.wordShown += WORD_PAGE;
    renderWordlist();
  });
  let readingTyping = null;
  els.readingSearch.addEventListener('input', () => {
    clearTimeout(readingTyping);
    readingTyping = setTimeout(() => {
      if (storyRunOn()) stopReadStories();
      hideWordPop();
      state.readingQuery = els.readingSearch.value;
      state.readingShown = READING_PAGE;
      state.readingId = null;
      renderReading();
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
  // While adding words to a list (Add words), the topic button picks the next place to add from, so
  // the adding bar stays: a plain pick ended adding (the user's report, 2026-10-22). Done ends it.
  els.deckButton.addEventListener('click', () => (onAlphabet() ? toggleAlphaSets() : openDeckPicker({ addTo: addingFrom() ? state.addingTo : null })));
  els.alphaSetItems.forEach((b) => b.addEventListener('click', () => setAlphaSet(b.dataset.alphaSet)));
  document.addEventListener('click', (e) => {
    if (!els.alphaSetMenu.hidden && !e.target.closest('#alpha-set-menu, #deck-button')) toggleAlphaSets(false);
  });
  els.pickerTabs.forEach((b) => b.addEventListener('click', () => pickPickerTab(b.dataset.pickerTab)));
  els.addingDone.addEventListener('click', doneAdding);
  els.listRename.addEventListener('click', () => renameList(currentScope()?.id.slice(5)));
  els.listDelete.addEventListener('click', () => deleteList(currentScope()?.id.slice(5)));
  els.deckPicker.addEventListener('click', (e) => {
    if (e.target.dataset.close !== undefined) closeDeckPicker();
  });

  // Settings modal
  els.settingsButton.addEventListener('click', openSettings);
  els.tabSettings.addEventListener('click', () => {
    closeMore();
    if (!state.settingsOpen) openSettings();
  });
  // The phone's More: its tab opens and closes the list; a row picks its page.
  els.tabMore.addEventListener('click', () => (state.moreOpen ? closeMore() : openMore()));
  els.moreItems.forEach((b) => b.addEventListener('click', () => pickMore(b)));
  els.moreMenu.addEventListener('click', (e) => {
    if (e.target.dataset.close !== undefined) closeMore();
  });
  PHONE_LAYOUT.addEventListener('change', () => closeMore());
  // On a phone the pinned top rows take the page's colour once it scrolls under them (mobile.css);
  // Settings scrolls in its own box, under its search.
  const markScrolled = () => document.documentElement.classList.toggle('scrolled', window.scrollY > 0);
  window.addEventListener('scroll', markScrolled, { passive: true });
  markScrolled();
  els.settingsSection.addEventListener('scroll', markSettingsScrolled, { passive: true });
  // A tap on the tab bar or the pinned row, left uncovered by the word dialog on a phone, closes it and
  // then does what it does (on pointerdown, before a tapped search box takes the focus).
  for (const bar of document.querySelectorAll('.tabs, .section-bar, .dict-top')) {
    bar.addEventListener('pointerdown', () => { if (wordPop) hideWordPop(); }, { capture: true });
  }

  bindWritePad();
  // The Alphabet: Letters | Cards | Write, and the grid's class colours.
  els.alphaPageButtons.forEach((b) => b.addEventListener('click', () => {
    const page = b.dataset.alphaPage;
    setPreferences({ alphaPage: page });
    if (page === 'cards') setView('flashcards', { section: 'alphabet' });
    else setView('alphabet'); // Letters or Write (renderAlphabet)
  }));
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

  // Time's clock (renderTime).
  els.timePrev.addEventListener('click', () => stepTime(-5));
  els.timeNext.addEventListener('click', () => stepTime(5));
  els.timeStyleButtons.forEach((b) => b.addEventListener('click', () => {
    if (b.dataset.timeStyle === timeStyle()) return;
    setPreferences({ timeStyle: b.dataset.timeStyle });
    els.timeStyleButtons.forEach((x) => x.setAttribute('aria-checked', String(x === b)));
    if (timePage() === 'quiz') nextTimeQuestion(); // a new question, said the other way
    else setTime(state.time.h, state.time.m, { say: true });
  }));
  els.timePageButtons.forEach((b) => b.addEventListener('click', () => {
    if (b.dataset.timePage === timePage()) return;
    setPreferences({ timePage: b.dataset.timePage });
    renderTimeSection();
  }));
  els.timeDirButtons.forEach((b) => b.addEventListener('click', () => {
    if (b.dataset.timeDir === timeQuizDir()) return;
    setPreferences({ timeQuizDir: b.dataset.timeDir });
    nextTimeQuestion();
  }));
  els.timeQPlay.append(speakerIcon());
  els.timeQPlay.addEventListener('click', () => speakerPress(els.timeQPlay, els.timeQPlay.dataset.say));
  [els.timeTh, els.timeTr, els.timeEn].forEach((el) => el.addEventListener('click', () => showWordPop(null, timeCard())));
  els.timePlay.append(speakerIcon());
  els.timePlay.addEventListener('click', () => speakerPress(els.timePlay, els.timePlay.dataset.say));
  els.timeClock.addEventListener('pointerdown', (e) => {
    const { deg, d } = clockAt(e);
    if (d > 1.05) return;
    clockDrag = d < 0.6 ? 'hour' : 'minute';
    els.timeClock.setPointerCapture(e.pointerId);
    els.timeClock.classList.add('dragging');
    moveHand(deg);
  });
  els.timeClock.addEventListener('pointermove', (e) => { if (clockDrag) moveHand(clockAt(e).deg); });
  const dropHand = () => {
    if (!clockDrag) return;
    clockDrag = null;
    els.timeClock.classList.remove('dragging');
    if (state.timeName) setTime(state.time.h, state.time.m); // a tap that didn't move a hand: the time again
    speak(timePhrase(state.time.h, state.time.m, timeStyle()).th); // said once it's let go
  };
  els.timeClock.addEventListener('pointerup', dropHand);
  els.timeClock.addEventListener('pointercancel', dropHand);
  els.prevBtn.addEventListener('click', goPrev);
  els.nextBtn.addEventListener('click', goNext);
  els.randomBtn.addEventListener('click', goRandom);

  els.orderButtons.forEach((btn) => {
    btn.addEventListener('click', () => setOrderMode(btn.dataset.order));
  });

  // Type's box. A press on the card or the button doesn't take the focus from it, so a phone's
  // keyboard stays up (the card's taps still work).
  els.typeBar.addEventListener('submit', onTypeSubmit);
  els.typeBox.addEventListener('input', onTypeInput);
  els.typeBox.addEventListener('keydown', onTypeKey);
  els.typeCheck.addEventListener('mousedown', (e) => e.preventDefault());
  els.card.addEventListener('mousedown', (e) => {
    if (document.activeElement === els.typeBox) e.preventDefault();
  });
  els.typeBox.addEventListener('focus', () => {
    if (!typingOnPhone()) return;
    // The page's height without the keyboard: iOS keeps the layout viewport's when it opens.
    typingFrom = Math.max(window.visualViewport?.height ?? 0, document.documentElement.clientHeight);
    heldY = 0;
    document.documentElement.classList.add('type-kb');
    document.addEventListener('touchmove', holdStill, { passive: false }); // only while it's up
    fitTypeKeyboard();
  });
  els.typeBox.addEventListener('blur', () => {
    if (!document.documentElement.classList.contains('type-kb')) return;
    document.documentElement.classList.remove('type-kb');
    document.removeEventListener('touchmove', holdStill, { passive: false });
    fitCardText();
  });
  // A dialog's box (fitDialogKeyboard): held while it has the keyboard.
  els.confirmInput.addEventListener('focus', () => {
    if (!TOUCH_SCREEN) return;
    heldY = window.scrollY;
    document.documentElement.classList.add('dialog-kb');
    document.addEventListener('touchmove', holdStill, { passive: false });
    fitDialogKeyboard();
  });
  els.confirmInput.addEventListener('blur', () => {
    if (!document.documentElement.classList.contains('dialog-kb')) return;
    document.documentElement.classList.remove('dialog-kb');
    document.removeEventListener('touchmove', holdStill, { passive: false });
  });
  window.visualViewport?.addEventListener('resize', () => {
    if (document.documentElement.classList.contains('type-kb')) fitTypeKeyboard();
    if (document.documentElement.classList.contains('dialog-kb')) fitDialogKeyboard();
  });
  window.addEventListener('scroll', holdTop);
  window.visualViewport?.addEventListener('scroll', holdTop);
  // Any field's keyboard: the tab bar hidden while it's up (syncKeyboardUp).
  document.addEventListener('focusin', (e) => syncKeyboardUp(e.target));
  document.addEventListener('focusout', (e) => syncKeyboardUp(e.relatedTarget));

  els.directionButtons.forEach((btn) => {
    btn.addEventListener('click', () => setDirection(btn.dataset.direction));
  });


  els.homeLink.addEventListener('click', () => setView('home'));
  els.homeCards.forEach((card) => card.addEventListener('click', () => goTo(card.dataset.go))); // the Alphabet: its last page

  // The List page's Add all: every word shown into the target list, or, with all of them in, out of
  // it. On the target list's own page it's Add words instead (renderWordlist).
  els.wordlistAddAll.addEventListener('click', async () => {
    const deck = currentScope();
    const target = targetList();
    if (target && deck?.id === listScopeId(target.id)) {
      openAddWords(target.id);
      return;
    }
    const name = targetName();
    const words = targetWords();
    const keys = state.listCards.map((c) => c.key).filter((key) => !words.has(key));
    if (!keys.length) {
      // All in the list: take them all out (their progress is kept).
      const n = state.listCards.length;
      const ok = await confirmDialog({
        title: `Remove all from '${name}'?`,
        message: `Remove all ${n} words in ${deck.name} from '${name}'? Your progress on them is kept.`,
        confirmLabel: `Remove ${n}`,
        setting: 'confirmRemoveAll',
      });
      if (ok) {
        setInTarget(state.listCards.map((c) => c.key), false);
        toast(`Removed ${n} words from '${name}'`);
      }
      return;
    }
    const n = keys.length;
    const ok = await confirmDialog({
      title: `Add all to '${name}'?`,
      message: n === state.listCards.length
        ? `Add all ${n} words in ${deck.name} to '${name}'?`
        : `Add the ${n} words in ${deck.name} that aren't in '${name}' yet?`,
      confirmLabel: `Add ${n}`,
      setting: 'confirmAddAll',
    });
    if (ok) {
      setInTarget(keys, true);
      toastAdded(keys, `${n} ${n === 1 ? 'word' : 'words'}`);
    }
  });
  // Cards on an empty list: its Add words, on the List page.
  els.reviewOnlyAdd.addEventListener('click', () => {
    const id = currentScope()?.kind === 'list' ? currentScope().id.slice(5) : null;
    if (id) openAddWords(id);
  });
  els.confirmOk.addEventListener('click', () => closeConfirm(true));
  els.confirmCancel.addEventListener('click', () => closeConfirm(false));
  els.confirmInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      closeConfirm(true);
    }
  });
  els.confirmModal.querySelector('[data-close]').addEventListener('click', () => closeConfirm(false));
  els.moveModal.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', closeMoveWords));
  els.toast.addEventListener('pointerenter', () => holdToast(true));
  els.toast.addEventListener('pointerleave', () => holdToast(false));
  els.toast.addEventListener('focusin', () => holdToast(true));
  els.toast.addEventListener('focusout', () => holdToast(false));
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
    if (state.moving) {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeMoveWords();
      }
      return;
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
    if (state.view === 'time') { // ← → move Explore's clock 5 minutes; 1–4 answer Quiz's question
      if (timePage() === 'quiz') {
        if (/^[1-4]$/.test(e.key)) answerTime(+e.key - 1);
        return;
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        stepTime(e.key === 'ArrowLeft' ? -5 : 5);
      }
      return;
    }
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
    } else if (e.key === 'r' || e.key === 'R') {
      goRandom();
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
// The whole store (settings, progress, your lists, page choices) as a JSON file, and loading one
// back. Loading replaces the store, then reloads the app so everything starts from it.
const BACKUP_FORMAT = 'learnthai-backup';

function backupSummary(store) {
  const keys = new Set(Object.keys(store.items || {}).map((k) => splitItemKey(k)[0]));
  const alpha = [...keys].filter((k) => k.startsWith('abc:')).length;
  const studied = keys.size - alpha;
  const progress = `progress on ${studied}` + (alpha ? ` and ${alpha} from the Alphabet` : '');
  // A backup from before the lists (2026-10-20) has the words in Cards, which become My words.
  if (!store.lists) {
    const words = Object.keys(store.reviewWords || {}).length;
    return `${words} word${words === 1 ? '' : 's'} in Cards, ${progress}`;
  }
  const n = store.lists.length;
  return `${n} list${n === 1 ? '' : 's'}, ${progress}`;
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
      !['settings', 'prefs', 'items', 'daily', 'reviewWords'].every((k) => plain(data[k])) ||
      !(data.lists == null || Array.isArray(data.lists))) {
    toast("That file isn't a Learn Thai backup");
    return;
  }
  const when = backup.exported ? new Date(backup.exported).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : 'an unknown date';
  const ok = await confirmDialog({
    title: 'Load this backup?',
    message: `From ${when}: ${backupSummary(data)}.\nIt replaces the settings, progress and lists on this device (${backupSummary(loadStore())}).`,
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
  migrateSettings(); // first, so a moved default (the text size, 2026-10-18) shows on this load
  applyTextSize(); // before anything renders, so the text never jumps size
  applyTheme();
  applyThaiFont();
  applyMute();
  applyDevFeatures();
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

  migrateLeitnerToItems();
  migrateCardRenames();
  migrateLists(); // after the renames, which fix the old words in Cards it's made from

  const prefs = getPreferences();
  // 2026-10-06: Wordlists' "Show first" moved from the page (prefs.primaryCol) to Settings.
  if (prefs.primaryCol === 'english' && !('wordlistFirst' in (loadStore().settings || {}))) {
    setSettings({ wordlistFirst: 'english' });
  }
  // Migrate legacy values: 'list' → 'practice', 'shuffle' → 'practice', 'learn' → 'test'.
  const legacy = { list: 'practice', shuffle: 'practice', learn: 'test' };
  const incoming = legacy[prefs.orderMode] || prefs.orderMode;
  if (ORDER_MODES.includes(incoming)) {
    state.orderMode = incoming;
  }
  els.orderButtons.forEach((b) => {
    b.setAttribute('aria-checked', b.dataset.order === state.orderMode ? 'true' : 'false');
  });
  els.stage.dataset.order = state.orderMode;
  if (['en-th', 'th-en', 'listen'].includes(prefs.direction)) {
    state.direction = prefs.direction;
  }
  if (prefs.dictLang === 'en') state.dictLang = 'en';
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
