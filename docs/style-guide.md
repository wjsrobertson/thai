# Style guide: sizes, positions, colours (2026-10-16)

How learnthai looks and is laid out, the rules behind it, and where they come from. Read it before
adding or moving anything on screen; `docs/implementation-notes.md` has the history of each choice.
Numbers are CSS pixels unless they say otherwise (an iPhone's points are CSS pixels in Safari).

The standards it leans on:

- **Apple Human Interface Guidelines** (HIG): the app is used mostly on an iPhone, as a home-screen
  web app or in Safari.
- **WCAG 2.2** (W3C Web Content Accessibility Guidelines): AA is the bar; AAA where it costs little.
- **Material Design** where Apple says nothing.

## 1. Screens

- **Phones first, at 390–430 wide** (iPhone 12–16, Pro and Pro Max). The 320 and 375 widths (iPhone
  SE) aren't supported (the user's call, 2026-10-14): don't test or fix for them. WCAG's
  [Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) asks for 320; this app chooses not to.
- **Heights to check** (an iPhone 12 Pro, 390 wide): **664** in Safari with its bars showing (the
  tightest case), **763** as the installed app (844 less the status bar and home indicator), **844**
  the full screen; and **926** (a Pro Max) for a tall one. Everything on a page that fits a screen
  (Cards, Write) must fit at 664.
- **The phone layout** is `mobile.css`, loaded at 600 wide and under (`<link media>`); `app.js`'s
  `PHONE_LAYOUT` matches it. Desktop is `styles.css` alone, its content at most 1000 wide (the
  Alphabet's Write 440).
- **Safe areas:** the page draws under the notch and home indicator (`viewport-fit=cover`) and keeps
  clear with `env(safe-area-inset-*)`: the body's sides and top, the tab bar's foot. Anything fixed
  to the screen's foot sits on `calc(var(--tabbar-h) + env(safe-area-inset-bottom))`.
  ([Apple: Layout](https://developer.apple.com/design/human-interface-guidelines/layout),
  [WebKit: designing for the notch](https://webkit.org/blog/7929/designing-websites-for-iphone-x/),
  [MDN: env()](https://developer.mozilla.org/en-US/docs/Web/CSS/env))
- **Viewport height:** `100dvh`, not `100vh` (Safari's `vh` is the height with its bars hidden).
  Sizes that depend on the room left are measured, not guessed: `sizeCards`, `sizeWritePad`.

## 2. Things to tap

| Rule | Size | Source |
|---|---|---|
| **The app's minimum** | **44 × 44** | Apple HIG; WCAG 2.5.5 (AAA) |
| WCAG's AA minimum | 24 × 24, or 24 apart | [WCAG 2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) |
| Material's | 48 × 48 dp | [Material: structure](https://m3.material.io/foundations/designing/structure) |

[Apple: Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility)
("at least 44x44 pt"), [Apple: Buttons](https://developer.apple.com/design/human-interface-guidelines/buttons),
[WCAG 2.5.5 Target Size (Enhanced)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html),
[web.dev: accessible tap targets](https://web.dev/articles/accessible-tap-targets).

In the app (mobile.css "Tap targets at least 44px tall", 2026-10-13):

- Segmented switches, ghost buttons, the topic button, settings rows and toggles: `min-height: 44px`
  (a switch row is 52 with its border and padding). The dialogs' ✕: 44 × 44.
- **‹ ›:** 56 round. **The tab bar:** 56 tall (`--tabbar-h`) plus the home indicator, five tabs of 78.
- Letter tiles: the consonants' 64 wide or more (`minmax(64px, 1fr)`); the vowels' 52 at 390 wide
  (shrunk to fit three pairs to a row, `sizeVowelTiles`).
- Text in a tap target is 15 px at least, everyday buttons 16 (the same day, the user's call).
- `touch-action: manipulation` on buttons: no double-tap zoom and no 300 ms delay
  ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action)). The drawing pad is
  `touch-action: none`, so a finger draws rather than scrolls.

**Known small targets:** words in a story's lines and the Thai in notes (inline text, which WCAG
exempts) and the topic picker's "All of" rows (44 tall, narrower than 44 when short).

**Gestures:** every action is a tap. The long press on a letter tile opens what Details › opens, so
the hold is a shortcut, never the only way. It fires on hold and swallows the release, so a slip
doesn't trigger anything else. ([WCAG 2.5.1 Pointer Gestures](https://www.w3.org/WAI/WCAG22/Understanding/pointer-gestures.html),
[2.5.2 Pointer Cancellation](https://www.w3.org/WAI/WCAG22/Understanding/pointer-cancellation.html))

## 3. Layout and positions (phone)

The phone page, top to bottom, at 390 × 664:

| Row | y | Height | Rule |
|---|---|---|---|
| Pinned section row (topic button, page switch; the Dictionary's search) | 0–76 | 12 + 52 + 12 | sticky (`--pinned-h`) |
| Letter row (Alphabet: Letters, Write) | 76–128 | 52 | as Cards' direction row |
| Second switch (Cards' mode; Write's Trace / From memory) | 140–192 | 52 | 12 gaps |
| The card or the pad | 204–515 | the room left | grows (`sizeCards`, `sizeWritePad`) |
| ‹ ›; Recognition's answers; Recall's grades | 533–589 | 56 | in the middle of the room under the card: 18 above, 18 below, so the card is one shape in every mode |
| Tab bar | 608–664 | 56 + safe area | fixed |

- **Gutters 12** (the stage's padding), gaps between rows **12**. A pinned row takes the gutters too
  (negative margins), so its background spans the screen.
- **Pages a user moves between line up** (the user's calls, repeatedly): Letters, Write and Cards put
  their rows, the switch, the card or pad and ‹ › at the same y, to the pixel (measured); Settings'
  search sits where the Dictionary's does. Check with a measurement, not by eye.
- **Nothing jumps.** A row whose content changes (a letter's line or the hint; Write's feedback; the
  Write header in Trace and From memory) has a fixed height; a letter keeps its room (`.write-slot`);
  Details is hidden but still in place (visibility, not display) when it mustn't be used; the
  vowels' line, Write's header and the hint are one height on every set.
- **Fill, don't float:** on a phone the card and pad grow into the height there is, and the buttons
  stay at the foot, as Cards does; on a short screen they shrink first. No empty bands.
- **Pinned rows** (`position: sticky`): clear at rest, then the page's colour and a 1 px hairline
  once the page scrolls (`html.scrolled`), as the tab bar is at the foot. Two pinned rows read as one
  band (one hairline under both). `scroll-padding` keeps a row scrolled to from under them
  ([MDN: position](https://developer.mozilla.org/en-US/docs/Web/CSS/position),
  [MDN: overscroll-behavior](https://developer.mozilla.org/en-US/docs/Web/CSS/overscroll-behavior)).
- **Dialogs on a phone** are pages between the pinned row and the tab bar (both still in reach), in
  the page's colour, no border; Settings is a page too. On desktop they're centred dialogs.
- **Consistent navigation:** the tab bar is always Home · Topics · Alphabet · Dictionary · Settings;
  each section remembers its last page. ([WCAG 3.2.3](https://www.w3.org/WAI/WCAG22/Understanding/consistent-navigation.html))

## 4. Type

- **Fonts:** one stack for the page: the Thai font first, **Learn Thai Looped** (Noto Looped Thai,
  bundled) or Learn Thai Loopless (Noto Sans Thai), as Settings → Display → Thai font says, then the
  system UI font (`-apple-system`, …) for what it lacks. Write always uses the looped font (learners
  copy it).
- **Sizes:** body 16, the base for everything; muted help 13–15; headings by weight before size.
  Apple's smallest is 11 pt ([Apple: Typography](https://developer.apple.com/design/human-interface-guidelines/typography));
  reading text here is 12 or more. The 10–11 px in styles.css are the ▾ carets and chevrons, glyphs
  used as icons.
- **Text size setting:** `--fs` = 0.8, 0.9, 1, 1.15 or 1.3 (`TEXT_SCALES`), and most sizes are
  `calc(Npx * var(--fs))`. **Exceptions, on purpose:** rows that must line up across pages (the
  letter row's three lines at 14 px, Cards' and Write's switches) keep their size, so the pages stay
  aligned; check they still fit at 1.3. ([WCAG 1.4.4 Resize Text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html):
  the browser's zoom still scales everything.)
- **Recognition's answers** (56 tall): two lines of English at 17, or three at 12 (line 1.2; Thai
  keeps 1.3 for its marks); a longer one shrinks to fit (`fitPills`), never under 12.
- **Inputs at 16 or more** on a phone: iOS Safari zooms the page into a focused input under 16.
- **Transliteration** is the accent colour in italic everywhere (`.pop-tr`, `.alpha-line-tr`); a
  long line drops its English bracket before it clips, then ends in "…".

## 5. Colour and themes

Five themes (Settings → Display → Theme): **Dark** (the default), **Charcoal**, **Light**, **Night**
(warm) and **Black** (OLED). Colours are tokens on `:root`, redefined per theme; never hard-code one
in a rule. ([Apple: Dark Mode](https://developer.apple.com/design/human-interface-guidelines/dark-mode))

| Token | For |
|---|---|
| `--bg`, `--panel`, `--panel-2` | the page; cards and lists; a raised or selected control |
| `--ink`, `--muted` | text; help and secondary text |
| `--accent`, `--on-accent` | the current and the primary (Check, the lit tab, transliteration); text on it |
| `--border`, `--control-border` | hairlines; a control's outline |
| `--good`, `--again`, `--hard`, `--easy` | right / wrong; the ratings |
| `--cls-mid`, `--cls-high`, `--cls-low` | consonant classes |
| `--tone-mid` … `--tone-rising` | the five tones |

**Contrast, measured** (2026-10-16, the tokens in styles.css, on the panel unless it says so):

| Pair (needs) | Dark | Charcoal | Light | Night | Black |
|---|---|---|---|---|---|
| ink / bg (4.5) | 15.9 | 14.1 | 14.4 | 12.6 | 21.0 |
| muted / bg (4.5) | 7.1 | 7.6 | 5.4 | 5.7 | 10.2 |
| accent / bg (4.5) | 10.6 | 10.5 | 4.9 | 7.2 | 13.0 |
| on-accent / accent (4.5) | 10.6 | 10.5 | 5.4 | 6.9 | 13.0 |
| good (4.5) | 10.0 | 7.7 | 5.5 | 8.2 | 11.4 |
| again (4.5) | 6.3 | 6.3 | 5.4 | 5.7 | 7.8 |
| tones, ratings, control text (4.5) | ≥ 6.3 | ≥ 6.3 | ≥ 5.1 | ≥ 6.1 | ≥ 7.8 |
| **cls-mid (4.5)** | 5.2 | 4.50 | **3.4 ✗** | 5.3 | 5.9 |
| **cls-high (4.5)** | **4.4 ✗** | **3.8 ✗** | **4.0 ✗** | 4.5 | 5.0 |
| **cls-low (4.5)** | 5.1 | **4.47 ✗** | **3.4 ✗** | 5.3 | 5.8 |
| control-border / panel (3) | 3.4 | 3.4 | 3.6 | 3.2 | 3.5 |
| border / panel (decorative) | 3.0 | 3.0 | 1.4 | 1.2 | 3.5 |

- **Text: 4.5:1** ([WCAG 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html));
  3:1 for large text (24 px, or 18.7 bold); 7:1 is AAA ([1.4.6](https://www.w3.org/WAI/WCAG22/Understanding/contrast-enhanced.html)).
  The body text clears 7:1 in every theme.
- **A control's outline and icons: 3:1** ([WCAG 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)).
  Dividers between list rows (`--border`) are decorative and exempt; the Light and Night themes'
  are faint by design.
- **To fix:** the class colours as text ("mid class", the dialog's "Low") fall short of 4.5 in
  Dark (high), Charcoal (high, low) and Light (all three). Darken them in Light, lighten them in Dark
  and Charcoal, keeping them told apart; recheck with this table's script (compute WCAG relative
  luminance from the tokens).
- **Colour is never the only cue** ([WCAG 1.4.1](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html)):
  a class is written ("low class"); a tone is named; right and wrong are ✓ and words; the lit tab is
  also the page shown.
- **Pictures on dark themes** (the transparent letter pictures): a thin sticker edge in `--ink`
  (drop-shadows), so dark outlines show; none on Light.

## 6. Motion, feedback, focus

- **Reduced motion is honoured** ([WCAG 2.3.3](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html),
  [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)): the speaker
  waves and the More panel stop, and scrolling jumps instead of gliding (`SCROLL_BEHAVIOR`). New
  animation needs the same.
- **Feedback is short and in place:** one line (Write's is a label on its pad), a symbol and words
  ("✓ ธ · 97%", "Above: ◌ี, not ◌ิ"), the colour third. Messages that appear are `role="status"`
  (the toast is `aria-live="polite"`) so a screen reader hears them
  ([WCAG 4.1.3](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)).
- **Focus:** keyboard focus shows ([WCAG 2.4.7](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html)):
  settings' selects and checkboxes and the card have an accent outline; most buttons keep the
  browser's own ring. Don't remove an outline without giving one back.
- Icon-only buttons have an `aria-label` (57 in index.html); a tile's title gives its full name.

## 7. Before shipping something on screen

1. Tap targets 44 × 44 at least; 8 between neighbours where it's tight.
2. Measured at 390 × 664, 763 and 844 (and desktop): nothing under the tab bar or the pinned row,
   no sideways scroll (`scrollWidth` = the width).
3. Moving to and from the pages around it, nothing shifts: the same rows at the same y. Run
   `python3 -u tools/check_layout.py`, and add a check for anything new that must line up.
4. Every theme: text 4.5:1, controls 3:1 (the table's script); the Light theme especially.
5. Text sizes 0.8 and 1.3: nothing clipped (a long line drops its bracket, then "…").
6. Reduced motion; a screen reader hears the feedback; focus shows with a keyboard.
7. The notes (`docs/implementation-notes.md`) say what changed and why.
