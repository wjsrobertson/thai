// Learn Thai — flashcard app
// Plain JS module, no build step. Loads decks from data/decks.json,
// presents Leitner-box style spaced repetition, persists progress in localStorage.

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
  prevBtn: document.getElementById('prev-btn'),
  nextBtn: document.getElementById('next-btn'),
  orderButtons: document.querySelectorAll('.seg-btn[data-order]'),
  directionButtons: document.querySelectorAll('.seg-btn[data-direction]'),
  wordlistSection: document.getElementById('wordlist-section'),
  wordlistDeckName: document.getElementById('wordlist-deck-name'),
  wordlistFilter: document.getElementById('wordlist-filter'),
  wordlistCount: document.getElementById('wordlist-count'),
  wordtable: document.getElementById('wordtable'),
  wordtableHead: document.getElementById('wordtable-head'),
  wordtableBody: document.getElementById('wordtable-body'),
  wordlistPrimaryButtons: document.querySelectorAll('.seg-btn[data-primary]'),
  settingsSection: document.getElementById('settings-section'),
  settingsModal: document.getElementById('settings-modal'),
  settingsButton: document.getElementById('settings-button'),
  setQueueMode: document.getElementById('setting-queue-mode'),
  setIntervalPreset: document.getElementById('setting-interval-preset'),
  customIntervals: document.getElementById('custom-intervals'),
  ci1: document.getElementById('ci-1'),
  ci2: document.getElementById('ci-2'),
  ci3: document.getElementById('ci-3'),
  ci4: document.getElementById('ci-4'),
  ci5: document.getElementById('ci-5'),
  setAgainMode: document.getElementById('setting-again-mode'),
  setAgainDelay: document.getElementById('setting-again-delay'),
  againDelayRow: document.getElementById('again-delay-row'),
  setMigrationPolicy: document.getElementById('setting-migration-policy'),
  rerunMigration: document.getElementById('rerun-migration'),
  resetDeckHelp: document.getElementById('reset-deck-help'),
  resetAll: document.getElementById('reset-all'),
  setAudioSource: document.getElementById('setting-audio-source'),
  audioSourceHelp: document.getElementById('setting-audio-source-help'),
  setThaiSpeed: document.getElementById('setting-thai-speed'),
  setTextSize: document.getElementById('setting-text-size'),
  setReadRepeats: document.getElementById('setting-read-repeats'),
  setReadPause: document.getElementById('setting-read-pause'),
  setReadEnglish: document.getElementById('setting-read-english'),
  setLearnPause: document.getElementById('setting-learn-pause'),
  setLearnAuto: document.getElementById('setting-learn-auto'),
  learnPauseRow: document.getElementById('learn-pause-row'),
  settingsSearch: document.getElementById('settings-search'),
  settingsEmpty: document.getElementById('settings-empty'),
};

const STORAGE_KEY = 'learnthai:v1';

// Leitner: 5 boxes. Box 1 = brand new / failed, Box 5 = mastered.
// Lower box → more frequent in the queue.
const BOX_WEIGHTS = [0, 8, 4, 2, 1, 0.5]; // index = box number

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

// Interval presets — minutes per box, index = box number, index 0 unused.
const INTERVAL_PRESETS = {
  standard: { label: 'Standard Leitner (1d, 3d, 7d, 14d, 30d)',
              minutes: [0, 1 * DAY / MINUTE, 3 * DAY / MINUTE, 7 * DAY / MINUTE, 14 * DAY / MINUTE, 30 * DAY / MINUTE] },
  aggressive: { label: 'Aggressive (4h, 1d, 3d, 7d, 21d)',
                minutes: [0, 4 * HOUR / MINUTE, 1 * DAY / MINUTE, 3 * DAY / MINUTE, 7 * DAY / MINUTE, 21 * DAY / MINUTE] },
  exponential: { label: 'Exponential (1d, 2d, 5d, 12d, 30d)',
                 minutes: [0, 1 * DAY / MINUTE, 2 * DAY / MINUTE, 5 * DAY / MINUTE, 12 * DAY / MINUTE, 30 * DAY / MINUTE] },
};

const DEFAULT_SETTINGS = {
  queueMode: 'due-then-fallback', // 'due-only' | 'due-then-fallback' | 'mixed'
  intervalPreset: 'standard',     // key of INTERVAL_PRESETS, or 'custom'
  customIntervalsMin: null,       // array [0, b1, b2, b3, b4, b5] when intervalPreset === 'custom'
  againMode: 'session',           // 'session' (10 min) | 'tomorrow' (1 day) | 'demote-only'
  againDelayMin: 10,              // minutes (for 'session' mode)
  migrationDone: false,           // set true after first-run migration
  migrationPolicy: 'all-due-now', // 'all-due-now' | 'reset' | 'spread'
  audioSource: 'samples',         // 'samples' (data/audio MP3s, TTS fallback) | 'browser' (always TTS); Thai and English
  thaiSpeed: 1,                   // playback speed multiplier for Thai audio (samples and TTS), 0.5–1
  textSize: 0,                    // -2..2 steps around the default text size (see TEXT_SCALES)
  readRepeats: 1,                 // times to repeat each word during read-aloud
  readPauseSec: 1.5,              // seconds of silence between words
  readSpeakEnglish: true,         // whether to speak English after Thai
  learnPauseMs: 1000,             // pause after answering before auto-advancing (Test mode)
  learnAutoProgress: 'off',       // 'off' (wait for Next) | 'always' | 'correct' (only on a right answer); older saves hold true/false
};

const state = {
  decks: [],
  currentDeckId: null,
  cards: [],          // current deck's cards (with progress merged)
  queue: [],          // ordered indices into `cards`
  pos: 0,             // index into queue
  showingBack: false,
  view: 'flashcards', // 'flashcards' | 'wordlist'
  sort: { key: null, dir: 'asc' },
  filter: '',
  primaryCol: 'thai', // 'thai' | 'translit' | 'english' — first column on wordlist
  orderMode: 'practice', // 'practice' | 'test' — card sequencing in flashcards
  direction: 'th-en', // 'th-en' (Thai on front, English on back) | 'en-th' (English on front, Thai on back)
  pickerOpen: false,
  pickerFilter: '',
  settingsOpen: false,
  expandedCategories: new Set(), // user-toggled-open categories (in addition to the one containing the current deck)
  expandedGroups: new Set(),     // same for deck groups, keyed `${category}::${group}`
  lastFocus: null,
  reading: { active: false, token: 0, currentKey: null },
  pendingLearnRating: null, // 'good' | 'again' | null — set when user answered but hasn't committed
  learnAnswers: new Map(),  // cardKey -> { pickedText, isCorrect, seedSeen } for this session
};

// ---------- storage ----------

function loadStore() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveStore(store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function getProgress(deckId) {
  const store = loadStore();
  return (store.decks && store.decks[deckId]) || { cards: {} };
}

function setProgress(deckId, progress) {
  const store = loadStore();
  store.decks = store.decks || {};
  store.decks[deckId] = progress;
  saveStore(store);
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

function setSettings(patch) {
  const store = loadStore();
  store.settings = { ...DEFAULT_SETTINGS, ...(store.settings || {}), ...patch };
  saveStore(store);
}

function currentIntervalsMin() {
  const s = getSettings();
  if (s.intervalPreset === 'custom' && Array.isArray(s.customIntervalsMin)) {
    return s.customIntervalsMin;
  }
  return (INTERVAL_PRESETS[s.intervalPreset] || INTERVAL_PRESETS.standard).minutes;
}

function intervalForBox(box) {
  const intervals = currentIntervalsMin();
  return (intervals[clamp(box, 1, intervals.length - 1)] || 0) * MINUTE;
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

function mergeProgressIntoCards(deckCards, progress) {
  return deckCards.map((c) => {
    const key = cardKey(c);
    const p = progress.cards[key] || { box: 1, seen: 0, lastSeen: 0, dueAt: 0 };
    return {
      ...c,
      key,
      box: p.box,
      seen: p.seen,
      lastSeen: p.lastSeen,
      // dueAt = 0 means brand new (always eligible).
      dueAt: p.dueAt ?? 0,
    };
  });
}

function migrateProgressIfNeeded() {
  const s = getSettings();
  if (s.migrationDone) return;
  const store = loadStore();
  if (!store.decks) {
    setSettings({ migrationDone: true });
    return;
  }
  const now = Date.now();
  for (const deckId of Object.keys(store.decks)) {
    const prog = store.decks[deckId];
    if (!prog?.cards) continue;
    for (const key of Object.keys(prog.cards)) {
      const card = prog.cards[key];
      if (card.dueAt != null) continue; // already migrated
      if (s.migrationPolicy === 'reset') {
        prog.cards[key] = { box: 1, seen: 0, lastSeen: 0, dueAt: 0 };
      } else if (s.migrationPolicy === 'spread') {
        // Higher box → due further out (small offset so they're not all overdue immediately)
        const offsetDays = (card.box - 1) * 0.5; // 0, 0.5, 1, 1.5, 2 days
        card.dueAt = now + offsetDays * DAY;
      } else {
        // 'all-due-now' (default): existing cards become immediately due
        card.dueAt = now;
      }
    }
  }
  saveStore(store);
  setSettings({ migrationDone: true });
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
  // 'test' mode falls through to SRS scheduling.
  if (!srsOn) {
    return shuffled(cards.map((_, i) => i));
  }
  const now = Date.now();
  const settings = getSettings();

  const dueIndices = [];
  const notDueIndices = [];
  cards.forEach((c, i) => {
    if (isDue(c, now)) dueIndices.push(i);
    else notDueIndices.push(i);
  });

  // Order due cards by how overdue they are (most overdue first),
  // with brand-new cards interleaved.
  const dueSorted = dueIndices.slice().sort((a, b) => {
    const aDue = cards[a].dueAt || now; // brand-new = now
    const bDue = cards[b].dueAt || now;
    return aDue - bDue;
  });

  if (settings.queueMode === 'due-only') {
    return dueSorted;
  }

  if (settings.queueMode === 'due-then-fallback') {
    // After due cards, fall back to box-weighted not-due cards
    // so the user can keep studying ahead of schedule.
    return [...dueSorted, ...boxWeightedQueue(notDueIndices, cards)];
  }

  // 'mixed' — interleave due cards (priority) with the rest, box-weighted.
  return interleave(dueSorted, boxWeightedQueue(notDueIndices, cards));
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

function interleave(a, b) {
  // Round-robin merge with a slightly weighted toward priority.
  const out = [];
  let i = 0, j = 0;
  while (i < a.length || j < b.length) {
    if (i < a.length) out.push(a[i++]);
    if (i < a.length) out.push(a[i++]); // 2:1 ratio favoring priority
    if (j < b.length) out.push(b[j++]);
  }
  return out;
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
  const c = currentCard();
  if (!c) {
    els.learnPills.hidden = true;
    els.thai.textContent = '✓';
    els.translit.textContent = '';
    const dueLater = state.cards.find((card) => card.dueAt > Date.now());
    if (state.cards.length === 0) {
      els.english.textContent = 'No cards in this deck.';
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
  els.note.textContent = c.note || '';
  setFlipped(false);
  updateStats();
  renderLearnPills();
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

function setFlipped(flipped) {
  state.showingBack = flipped;
  els.card.classList.toggle('flipped', flipped);
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

function rateCard(rating) {
  const c = currentCard();
  if (!c) return;

  const settings = getSettings();
  const now = Date.now();

  // Box transitions
  if (rating === 'again') {
    // Apply againMode policy
    if (settings.againMode === 'demote-only') {
      c.box = clamp(c.box - 2, 1, 5);
      c.dueAt = now + intervalForBox(c.box);
    } else if (settings.againMode === 'tomorrow') {
      c.box = 1;
      c.dueAt = now + 1 * DAY;
    } else {
      // 'session' (default) — show again in N minutes
      c.box = 1;
      c.dueAt = now + (settings.againDelayMin || 10) * MINUTE;
    }
  } else {
    const delta = { hard: 0, good: 1, easy: 2 }[rating] ?? 0;
    c.box = clamp(c.box + delta, 1, 5);
    c.dueAt = now + intervalForBox(c.box);
  }

  c.seen = (c.seen || 0) + 1;
  c.lastSeen = now;

  // Persist
  const progress = getProgress(state.currentDeckId);
  progress.cards[c.key] = {
    box: c.box,
    seen: c.seen,
    lastSeen: c.lastSeen,
    dueAt: c.dueAt,
  };
  setProgress(state.currentDeckId, progress);

  showRatingFeedback(rating, c.dueAt);
  if (state.view === 'wordlist') renderWordlist();
  if (state.pickerOpen) renderDeckPicker();
}

function showRatingFeedback(rating, dueAt) {
  advance();
}

function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n));
}

function advance() {
  state.pos += 1;
  if (state.pos >= state.queue.length) {
    // Rebuild queue at end of pass so newly-due cards come up sooner.
    state.queue = buildQueue(state.cards, els.srsToggle.checked);
    state.pos = 0;
  }
  renderCard();
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
  // Like rateCard but doesn't trigger animation/advance — used when leaving a pending card
  // via Prev so the SRS gets updated but navigation isn't hijacked.
  const r = state.pendingLearnRating;
  state.pendingLearnRating = null;
  const c = currentCard();
  if (!c || !r) return;
  const settings = getSettings();
  const now = Date.now();
  if (r === 'again') {
    if (settings.againMode === 'demote-only') {
      c.box = clamp(c.box - 2, 1, 5);
    } else {
      c.box = 1;
    }
    c.dueAt = settings.againMode === 'tomorrow' ? now + DAY :
              settings.againMode === 'demote-only' ? now + intervalForBox(c.box) :
              now + (settings.againDelayMin || 10) * MINUTE;
  } else {
    const delta = { hard: 0, good: 1, easy: 2 }[r] ?? 0;
    c.box = clamp(c.box + delta, 1, 5);
    c.dueAt = now + intervalForBox(c.box);
  }
  c.seen = (c.seen || 0) + 1;
  c.lastSeen = now;
  const progress = getProgress(state.currentDeckId);
  progress.cards[c.key] = { box: c.box, seen: c.seen, lastSeen: c.lastSeen, dueAt: c.dueAt };
  setProgress(state.currentDeckId, progress);
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
  // When changing decks, clear user-expanded categories so the new current category's group
  // is the only one open by default next time the picker is opened.
  state.expandedCategories.clear();
  state.expandedGroups.clear();
  state.currentDeckId = deckId;
  const progress = getProgress(deckId);
  state.cards = mergeProgressIntoCards(deck.cards, progress);
  state.queue = buildQueue(state.cards, els.srsToggle.checked);
  state.pos = 0;
  setPreferences({ currentDeckId: deckId });
  els.deckButtonLabel.textContent = deck.name;
  preloadDeckAudio(deck);
  renderCard();
  renderWordlist();
}

// ---------- deck picker modal ----------

function deckProgress(deckId, deck) {
  const progress = getProgress(deckId);
  let known = 0;
  for (const c of deck.cards) {
    const p = progress.cards[`${c.thai}::${c.english}`];
    if (p && p.box >= 4) known += 1;
  }
  return { known, total: deck.cards.length };
}

// The picker tree: category -> items, where an item is a deck or a group of decks (a deck's
// optional `group` field). Order follows decks.json. With a search query, only matching decks
// are kept and everything is open; otherwise a category or group is open if it holds the
// current deck or the user expanded it.
function pickerModel(q) {
  const current = state.decks.find((d) => d.id === state.currentDeckId);
  const cats = new Map();
  for (const d of state.decks) {
    const cat = d.category || 'Uncategorized';
    if (q && ![d.name, d.description || '', cat, d.group || ''].some((s) => s.toLowerCase().includes(q))) continue;
    if (!cats.has(cat)) {
      cats.set(cat, {
        name: cat,
        open: !!q || cat === current?.category || state.expandedCategories.has(cat),
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
        open: !!q || (cat === current?.category && d.group === current?.group) || state.expandedGroups.has(key),
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
function pickerHeader(prefix, name, countText, container, q, openSet, key) {
  const header = document.createElement('button');
  header.type = 'button';
  header.className = `${prefix}-header`;
  header.innerHTML = `<span class="${prefix}-caret">▾</span><span class="${prefix}-name"></span><span class="${prefix}-count"></span>`;
  header.querySelector(`.${prefix}-name`).textContent = name;
  header.querySelector(`.${prefix}-count`).textContent = countText;
  header.addEventListener('click', () => {
    if (q) return; // collapsing while searching would be confusing
    const nowOpen = container.classList.toggle('collapsed') === false;
    if (nowOpen) openSet.add(key);
    else openSet.delete(key);
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
  row.querySelector('.deck-row-desc').textContent = d.description || '';
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
  const count = `${g.decks.length} deck${g.decks.length === 1 ? '' : 's'} · ${known}/${cards}`;
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
    const count = `${c.deckCount} deck${c.deckCount === 1 ? '' : 's'}`;
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
    empty.textContent = `No decks match "${state.pickerFilter}".`;
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
  renderDeckPicker();
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
  state.view = view;
  els.stage.dataset.view = view;
  els.tabs.forEach((t) => {
    t.setAttribute('aria-selected', t.dataset.view === view ? 'true' : 'false');
  });
  els.wordlistSection.hidden = view !== 'wordlist';
  if (view !== 'wordlist' && state.reading.active) stopReadAloud();
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
  els.setQueueMode.value = s.queueMode;
  els.setIntervalPreset.value = s.intervalPreset;
  els.setAgainMode.value = s.againMode;
  els.setAgainDelay.value = s.againDelayMin;
  els.setMigrationPolicy.value = s.migrationPolicy;

  // Custom intervals visibility + values
  const showCustom = s.intervalPreset === 'custom';
  els.customIntervals.hidden = !showCustom;
  const mins = currentIntervalsMin();
  // Convert minutes to days for display.
  els.ci1.value = +(mins[1] / 1440).toFixed(2);
  els.ci2.value = +(mins[2] / 1440).toFixed(2);
  els.ci3.value = +(mins[3] / 1440).toFixed(2);
  els.ci4.value = +(mins[4] / 1440).toFixed(2);
  els.ci5.value = +(mins[5] / 1440).toFixed(2);

  // Again delay row only relevant for 'session' mode
  els.againDelayRow.style.display = s.againMode === 'session' ? '' : 'none';

  els.setAudioSource.value = s.audioSource;
  els.audioSourceHelp.textContent = audioSourceHelpText(s.audioSource);
  els.setThaiSpeed.value = String(s.thaiSpeed);
  els.setTextSize.value = String(s.textSize);
  els.setReadRepeats.value = s.readRepeats;
  els.setReadPause.value = s.readPauseSec;
  els.setReadEnglish.checked = s.readSpeakEnglish;
  els.setLearnPause.value = s.learnPauseMs;
  els.setLearnAuto.value = autoProgressMode(s);
  els.learnPauseRow.style.display = autoProgressMode(s) === 'off' ? 'none' : '';

  // Reset help shows the current deck name.
  const deck = state.decks.find((d) => d.id === state.currentDeckId);
  if (deck) {
    els.resetDeckHelp.textContent = `"Reset current deck" wipes only "${deck.name}". "Reset everything" wipes all ${state.decks.length} decks.`;
  } else {
    els.resetDeckHelp.textContent = 'Wipe study progress. Choose scope.';
  }
}

function bindSettings() {
  els.setQueueMode.addEventListener('change', () => {
    setSettings({ queueMode: els.setQueueMode.value });
    rebuildCurrentQueue();
  });

  els.setIntervalPreset.addEventListener('change', () => {
    setSettings({ intervalPreset: els.setIntervalPreset.value });
    renderSettings();
  });

  // Custom interval fields write back when edited (only relevant when preset === 'custom')
  for (const [idx, el] of [[1, els.ci1], [2, els.ci2], [3, els.ci3], [4, els.ci4], [5, els.ci5]]) {
    el.addEventListener('change', () => {
      const days = parseFloat(el.value) || 0;
      const mins = currentIntervalsMin().slice();
      mins[idx] = days * 1440;
      setSettings({ intervalPreset: 'custom', customIntervalsMin: mins });
      els.setIntervalPreset.value = 'custom';
    });
  }

  els.setAgainMode.addEventListener('change', () => {
    setSettings({ againMode: els.setAgainMode.value });
    renderSettings();
  });

  els.setAgainDelay.addEventListener('change', () => {
    const n = parseInt(els.setAgainDelay.value, 10);
    if (n >= 1 && n <= 60) setSettings({ againDelayMin: n });
  });

  els.setMigrationPolicy.addEventListener('change', () => {
    setSettings({ migrationPolicy: els.setMigrationPolicy.value });
  });

  els.setAudioSource.addEventListener('change', () => {
    setSettings({ audioSource: els.setAudioSource.value });
    const deck = state.decks.find((d) => d.id === state.currentDeckId);
    if (deck) preloadDeckAudio(deck); // starts (samples) or cancels (browser) preloading
    renderSettings();
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
  els.setLearnAuto.addEventListener('change', () => {
    setSettings({ learnAutoProgress: els.setLearnAuto.value });
    renderSettings();
  });

  els.rerunMigration.addEventListener('click', () => {
    const s = getSettings();
    const msg = {
      'all-due-now': 'Re-mark all existing cards as due now?',
      'spread': 'Stagger existing cards over a few days based on box?',
      'reset': 'Reset ALL progress on every deck? This cannot be undone.',
    }[s.migrationPolicy];
    if (!confirm(msg)) return;
    setSettings({ migrationDone: false });
    migrateProgressIfNeeded();
    // Reload current deck so changes show immediately.
    if (state.currentDeckId) selectDeck(state.currentDeckId);
    alert('Migration complete.');
  });

  els.settingsSearch.addEventListener('input', (e) => filterSettings(e.target.value));
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

  // Hide categories whose groups are all filtered out; expand any with matches when searching.
  for (const cat of cats) {
    const visibleGroups = cat.querySelectorAll('.setting-group:not(.search-hidden)');
    const hide = visibleGroups.length === 0;
    cat.classList.toggle('search-hidden', hide);
    if (query && !hide) cat.open = true;
  }

  els.settingsEmpty.hidden = anyVisible;
}

function rebuildCurrentQueue() {
  if (!state.currentDeckId) return;
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
  // Changing direction invalidates Learn answers (different pills shown).
  state.learnAnswers = new Map();
  state.pendingLearnRating = null;
  renderCard();
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

  els.wordlistDeckName.textContent = `${deck.name} — ${deck.description}`;

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
      if (state.reading.active && state.reading.currentKey === c.key) {
        tr.classList.add('now-playing');
      }
      for (const key of cols) {
        const td = document.createElement('td');
        td.className = COL_META[key].cls;
        td.textContent = c[key];
        // English column gets the note appended below.
        if (key === 'english' && c.note) {
          const span = document.createElement('span');
          span.className = 'col-note';
          span.textContent = c.note;
          td.appendChild(span);
        }
        tr.appendChild(td);
      }
      const audioTd = document.createElement('td');
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

  const total = state.cards.length;
  els.wordlistCount.textContent =
    rows.length === total ? `${total} entries` : `${rows.length} of ${total}`;
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
    setTimeout(() => rateCard(isCorrect ? 'good' : 'again'), settings.learnPauseMs ?? 1000);
  } else {
    // Stash pending rating; applied when user advances.
    state.pendingLearnRating = isCorrect ? 'good' : 'again';
    updateStats();
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

function resetDeckProgress() {
  if (!state.currentDeckId) return;
  const deck = state.decks.find((d) => d.id === state.currentDeckId);
  if (!confirm(`Reset progress for "${deck?.name ?? 'this deck'}"?\n\nThis cannot be undone.`)) return;
  setProgress(state.currentDeckId, { cards: {} });
  selectDeck(state.currentDeckId);
}

function resetAllProgress() {
  if (!confirm(`Reset ALL progress across every deck?\n\nThis wipes study history on ${state.decks.length} decks and cannot be undone. Your settings will be kept.`)) return;
  const store = loadStore();
  store.decks = {};
  saveStore(store);
  if (state.currentDeckId) selectDeck(state.currentDeckId);
  alert('All deck progress reset.');
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
    state.queue = buildQueue(state.cards, els.srsToggle.checked);
    state.pos = 0;
    renderCard();
  });

  els.resetBtn.addEventListener('click', resetDeckProgress);
  els.resetAll.addEventListener('click', resetAllProgress);

  els.card.addEventListener('click', (e) => {
    // Don't flip if clicking the speak or flip button (flip-btn calls flipCard itself).
    if (e.target.closest('.speak-btn')) return;
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

  document.addEventListener('keydown', (e) => {
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
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
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

// ---------- boot ----------

async function init() {
  applyTextSize(); // before anything renders, so the text never jumps size
  try {
    [state.decks, sampleFiles] = await Promise.all([loadDecks(), loadAudioManifest()]);
    sayText = new Map(state.decks.flatMap((d) => d.cards.filter((c) => c.say).map((c) => [c.thai, c.say])));
  } catch (e) {
    els.thai.textContent = '⚠';
    els.english.textContent = 'Could not load decks.json. Are you serving over http://?';
    console.error(e);
    return;
  }

  bindEvents();

  // Migrate any pre-existing progress to the new scheduled-due format.
  migrateProgressIfNeeded();

  // The Test-mode pause default went from 3000 to 1000 ms (2026-10-03). Settings are saved in
  // full, so saves still holding the old default move with it; a value the user chose is kept.
  if (loadStore().settings?.learnPauseMs === 3000) setSettings({ learnPauseMs: 1000 });

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

  // View first, so selectDeck's renderCard() knows whether the card is on screen.
  const validViews = ['flashcards', 'wordlist'];
  setView(validViews.includes(prefs.view) ? prefs.view : 'flashcards');

  const start =
    state.decks.find((d) => d.id === prefs.currentDeckId)?.id ||
    state.decks[0]?.id;
  if (start) {
    selectDeck(start);
  }
}

init();
