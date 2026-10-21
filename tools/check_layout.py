"""Checks that what the user asked to line up, match or stay put still does, at phone sizes and on a
wider screen.

    python3 -u tools/check_layout.py [WxH ...] [--text-size N] [--shots DIR]

Needs the server on :8765. Default sizes 390x664 (Safari with its bars), 390x763 (installed),
390x844 and 430x932, at the app's default text size (1, Larger), then 1280x800 (a wider screen,
which has its own checks: web_checks). Prints a line per check and exits 1 if any fails;
screenshots go to --shots (default ~/snap/chromium/common/learnthai-shots-out/layout). Each check
names the request it keeps (the user's, 2026-10-13 to 10-18; the user asked on 2026-10-16 for them
all to be checked after each new request): see docs/implementation-notes.md, "What lines up".
"""
import json, os, sys, time

HERE = os.path.dirname(os.path.abspath(__file__))
exec(open(os.path.join(HERE, 'phone_shots.py')).read().split('def main():')[0])  # WS, js, shot, URL
PORT = 9555
PROFILE = os.path.expanduser('~/snap/chromium/common/learnthai-layout-profile')  # throwaway, snap-accessible
CHROME = '/snap/chromium/current/usr/lib/chromium-browser/chrome'  # the snap's binary: works when `chromium` won't start

args = sys.argv[1:]
TEXT_SIZE = int(args[args.index('--text-size') + 1]) if '--text-size' in args else 1  # the app's default (Larger) since 2026-10-18
SHOTS = args[args.index('--shots') + 1] if '--shots' in args else os.path.expanduser('~/snap/chromium/common/learnthai-shots-out/layout')
SIZES = [tuple(map(int, a.split('x'))) for a in args if 'x' in a and a[0].isdigit()] or [(390, 664), (390, 763), (390, 844), (430, 932), (1280, 800)]

RECT = ("(s) => { const e = typeof s === 'string' ? document.querySelector(s) : s; if (!e || !e.getClientRects().length) return null;"
        " const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, w: r.width, h: r.height, r: r.right, b: r.bottom }; }")
results = []


def R(ws, sel):
    return json.loads(js(ws, f"JSON.stringify(({RECT})({json.dumps(sel)}))"))


def near(a, b, tol=1.0):
    return a is not None and b is not None and abs(a - b) <= tol


def same(a, b, keys='ltwh', tol=1.0):
    return bool(a and b) and all(near(a[k], b[k], tol) for k in keys)


def fmt(r):
    return 'missing' if not r else f"{r['l']:.0f},{r['t']:.0f} {r['w']:.0f}×{r['h']:.0f}"


def check(size, name, ok, detail=''):
    results.append((size, name, bool(ok), detail))
    print(f"  {'ok  ' if ok else 'FAIL'}  {name}" + (f"  ({detail})" if detail else ''))


def tap(ws, sel, n=0, wait=0.6):
    r = json.loads(js(ws, "JSON.stringify((() => { const e = document.querySelectorAll(%s)[%d]; if (!e) return null; e.scrollIntoView({ block: 'nearest' });"
                          " const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2, r.width > 0]; })())" % (json.dumps(sel), n)))
    if not (r and r[2]):
        return False
    for t in ('mousePressed', 'mouseReleased'):
        ws.call('Input.dispatchMouseEvent', type=t, x=r[0], y=r[1], button='left', clickCount=1)
    time.sleep(wait)
    return True


def open_page(ws, tab, **prefs):
    # The migration that moves a saved size of 0 to 1 counts as run, so --text-size 0 tests 0.
    store = {'prefs': {'currentDeckId': 'verbs', **prefs}, 'settings': {'confirmAddAll': False, 'textSize': TEXT_SIZE},
             'settingsMigrations': ['text-size-larger']}
    js(ws, f"localStorage.setItem('learnthai:v1', {json.dumps(json.dumps(store))}); location.reload()")
    time.sleep(1.6)
    tap(ws, f'.tab[data-view={tab}]', wait=1.2)
    js(ws, 'window.scrollTo(0, 0)')
    time.sleep(0.3)


def scrolled_by(ws, box=None, by=300):
    """Scrolls the page (or `box`) down; how far it went."""
    if box:
        return js(ws, f"(() => {{ const b = document.querySelector({json.dumps(box)}); b.scrollTop = {by}; return b.scrollTop; }})()")
    return js(ws, f"(() => {{ window.scrollTo(0, {by}); return window.scrollY; }})()")


def web_checks(ws, size):
    """A wider screen (2026-10-18, the user's request): each section's page switch in a row of its own,
    centred, in one place on every page; the topic button in one place too; each page's name beside
    its icon."""
    W, H = size
    C = lambda name, ok, detail='': check(size, name, ok, detail)
    centre = lambda r: r and r['l'] + r['w'] / 2

    def pages(tab, switch, attr, names, **prefs):
        open_page(ws, tab, **prefs)
        out = []
        for name in names:
            tap(ws, f'[{attr}={name}]', wait=1.0)
            js(ws, 'window.scrollTo(0, 0)'); time.sleep(0.3)
            out.append((name, R(ws, switch), R(ws, '#deck-button')))
        shot(ws, os.path.join(SHOTS, f'{W}x{H}-{tab}.png'))
        return out

    topics = pages('study', '.study-switch', 'data-study-page', ('wordlist', 'flashcards', 'reading'), studyPage='wordlist')
    alpha = pages('alphabet', '.alpha-switch', 'data-alpha-page', ('letters', 'cards', 'write'), alphaPage='letters')
    for label, seen in (("Topics' List | Cards | Read", topics), ("The Alphabet's Letters | Cards | Write", alpha)):
        sw0 = seen[0][1]
        C(f'Web: {label} in one place on all three pages, in a row of its own above the topic button',
          all(same(sw, sw0) and sw['b'] <= pk['t'] for _, sw, pk in seen), ' / '.join(f'{n} {fmt(sw)}' for n, sw, _ in seen))
    pk0 = topics[0][2]
    C('Web: the topic button in one place on every page that has it (no sideways shift when a page scrolls)',
      all(same(pk, pk0, 'lt') for _, _, pk in topics + alpha), ' / '.join(f'{n} {fmt(pk)}' for n, _, pk in topics + alpha))
    open_page(ws, 'dictionary')
    d, t0, a0, bar = R(ws, '.dict-switch'), topics[0][1], alpha[0][1], R(ws, '.topbar')
    C("Web: the three sections' switches centred alike, at one height (the Dictionary's Thai | English too)",
      near(centre(t0), centre(a0), 1.5) and near(centre(t0), centre(d), 1.5) and same(t0, a0, 't') and same(t0, d, 't'),
      f'{fmt(t0)} / {fmt(a0)} / {fmt(d)}')
    C('Web: the switches 16 px under the top bar (10-18)', bar and near(d['t'] - bar['b'], 16, 1.5), bar and f"top bar ends {bar['b']:.0f}, switch at {d['t']:.0f}")
    lab = json.loads(js(ws, "JSON.stringify((() => { const b = document.querySelector('.dict-switch .seg-btn'), i = b.querySelector('.seg-icon').getBoundingClientRect(), l = b.querySelector('.seg-label').getBoundingClientRect();"
                            " return { px: parseFloat(getComputedStyle(b.querySelector('.seg-label')).fontSize), beside: i.right <= l.left && i.bottom > l.top && i.top < l.bottom }; })())"))
    open_page(ws, 'study', studyPage='wordlist')
    lab2 = json.loads(js(ws, "JSON.stringify((() => { const b = document.querySelector('.study-switch .seg-btn'), i = b.querySelector('.seg-icon').getBoundingClientRect(), l = b.querySelector('.seg-label').getBoundingClientRect();"
                             " return { px: parseFloat(getComputedStyle(b.querySelector('.seg-label')).fontSize), beside: i.right <= l.left && i.bottom > l.top && i.top < l.bottom }; })())"))
    C("Web: each page's name beside its icon, at 16 px", all(x['beside'] and near(x['px'], 16, 0.1) for x in (lab, lab2)), f'{lab} / {lab2}')
    tap(ws, '[data-study-page=flashcards]', wait=1.5)
    tap(ws, '[data-order=practice]', wait=0.8)
    card, rd = R(ws, '#card'), R(ws, '#random-btn')
    over = js(ws, 'document.documentElement.scrollHeight - innerHeight')
    C("Web: Cards' 🔀 under the card, centred on it, and Browse fits without scrolling (10-21)",
      card and rd and near(centre(rd), centre(card)) and rd['t'] >= card['b'] and over <= 0, f"card {fmt(card)}, 🔀 {fmt(rd)}, {over} px over")
    errs = json.loads(js(ws, 'JSON.stringify(window.__errs || [])'))
    C('No script errors', not errs, '; '.join(errs)[:200])
    C('No sideways scroll', js(ws, 'document.documentElement.scrollWidth') <= W, f"{js(ws, 'document.documentElement.scrollWidth')} wide")


def checks(ws, size):
    W, H = size
    if W > 600:  # the phone's checks are for mobile.css's layout; a wider screen has its own
        return web_checks(ws, size)
    tag = f'{W}x{H}'
    C = lambda name, ok, detail='': check(size, name, ok, detail)
    snap = lambda name: shot(ws, os.path.join(SHOTS, f'{tag}-{name}.png'))

    # ---- The top row (2026-10-14) ----
    open_page(ws, 'study', studyPage='wordlist')
    pk, sw = R(ws, '#deck-button'), R(ws, '.study-switch')
    C('Topics: the topic picker as tall as the List | Cards | Read switch, tops level',
      near(pk and pk['h'], sw and sw['h']) and near(pk and pk['t'], sw and sw['t']), f"{fmt(pk)} / {fmt(sw)}")
    bar = R(ws, '.section-bar')
    went = scrolled_by(ws); time.sleep(0.5)
    bar2 = R(ws, '.section-bar')
    C('Topics: the top row stays put when the list scrolls, its line only once scrolled',
      went > 0 and same(bar, bar2, 't') and js(ws, "document.documentElement.classList.contains('scrolled')"), f"scrolled {went}px, row at {bar and bar['t']:.0f} → {bar2 and bar2['t']:.0f}")
    js(ws, 'window.scrollTo(0, 0)'); time.sleep(0.4)
    C('Topics: no line under the top row at rest', not js(ws, "document.documentElement.classList.contains('scrolled')"))
    tap(ws, '#wordlist-section td.col-thai', wait=1.0)
    m, bar, tabs = R(ws, '#word-modal'), R(ws, '.section-bar'), R(ws, '.tabs')
    C('Topics: the word dialog between the top row and the tab bar, covering neither',
      m and near(m['t'], bar['b'], 1.5) and near(m['b'], tabs['t'], 1.5), f"dialog {m and m['t']:.0f}–{m and m['b']:.0f}, row ends {bar['b']:.0f}, tabs from {tabs['t']:.0f}")
    snap('topics-dialog')
    tap(ws, '#word-modal-close')

    open_page(ws, 'alphabet', alphaPage='letters', alphaSet='consonants')
    pk, asw = R(ws, '#deck-button'), R(ws, '.alpha-switch')
    C('Alphabet: the set picker as tall as the Letters | Cards | Write switch, tops level',
      near(pk and pk['h'], asw and asw['h']) and near(pk and pk['t'], asw and asw['t']), f"{fmt(pk)} / {fmt(asw)}")

    open_page(ws, 'dictionary', dictLang='th')
    se, dsw = R(ws, '#dict-search'), R(ws, '.dict-switch')
    C('Dictionary: the search as tall as the Thai | English switch, tops level',
      near(se and se['h'], dsw and dsw['h']) and near(se and se['t'], dsw and dsw['t']), f"{fmt(se)} / {fmt(dsw)}")
    C("Dictionary: Thai | English where the Alphabet's Letters | Cards | Write is (top, height, right edge)",
      same(dsw, asw, 'thr'), f"{fmt(dsw)} / {fmt(asw)}")
    tap(ws, '#dict-grid .dict-letter', wait=1.0)
    top = R(ws, '.dict-top')
    went = scrolled_by(ws); time.sleep(0.5)
    top2 = R(ws, '.dict-top')
    C("Dictionary: the search row stays put when a letter's words scroll", went > 0 and same(top, top2, 't'),
      f"scrolled {went}px, row at {top and top['t']:.0f} → {top2 and top2['t']:.0f}")
    js(ws, 'window.scrollTo(0, 0)'); time.sleep(0.4)
    tap(ws, '#dict-table td.col-thai', wait=1.0)
    m, bar, tabs = R(ws, '#word-modal'), R(ws, '.dict-top'), R(ws, '.tabs')
    C('Dictionary: the word dialog between the search row and the tab bar',
      m and near(m['t'], bar['b'], 1.5) and near(m['b'], tabs['t'], 1.5), f"dialog {m and m['t']:.0f}–{m and m['b']:.0f}, row ends {bar['b']:.0f}, tabs from {tabs['t']:.0f}")
    tap(ws, '#word-modal-close')

    # More, the bar's last tab (back with the Time spike, 2026-10-21): Time and Settings, Settings last.
    tabs_shown = json.loads(js(ws, "JSON.stringify([...document.querySelectorAll('.tabs .tab')].filter(t => t.getClientRects().length).map(t => t.id || t.dataset.view))"))
    tap(ws, '#tab-more', wait=0.6)
    more = json.loads(js(ws, "JSON.stringify([...document.querySelectorAll('.more-item')].filter(b => b.getClientRects().length).map(b => b.dataset.view || b.dataset.action))"))
    C('The tab bar ends with More; its list has Time and Settings, Settings last (10-21)',
      tabs_shown[-1:] == ['tab-more'] and 'settings' not in tabs_shown and more[-1:] == ['settings'] and 'time' in more, f"bar {tabs_shown}, More {more}")
    tap(ws, '.more-item[data-action=settings]', wait=1.0)
    ss = R(ws, '#settings-search')
    C("Settings: the search where the Dictionary's is, as tall (top, left, height)", same(ss, se, 'tlh'), f"{fmt(ss)} / {fmt(se)}")
    C('Settings: no line under the search at rest', not js(ws, "document.getElementById('settings-modal').classList.contains('scrolled')"))
    went = scrolled_by(ws, '#settings-modal .modal-body'); time.sleep(0.5)
    ss2 = R(ws, '#settings-search')
    if went > 0:
        C('Settings: the search stays put, its line once the list scrolls',
          same(ss, ss2, 't') and js(ws, "document.getElementById('settings-modal').classList.contains('scrolled')"), f"scrolled {went}px")
    else:
        C('Settings: the search stays put when the list scrolls (the list fits, nothing to scroll)', True, 'skipped')
    js(ws, "document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))"); time.sleep(0.6)

    # ---- Alphabet → Letters: the row above the letters (2026-10-15) ----
    hints = {}
    for SET, tiles, idx in [('consonants', '#alpha-grid .letter-tile', 22), ('vowels', '#alpha-vowels .letter-tile', 21), ('tones', None, None)]:
        open_page(ws, 'alphabet', alphaPage='letters', alphaSet=SET, writeIndex=idx or 0, writeVowelIndex=idx or 0, writeMode='trace')
        hint = R(ws, '#alpha-hint')
        hints[SET] = hint
        inset = json.loads(js(ws, """JSON.stringify((() => { const row = document.getElementById('alpha-hint').getBoundingClientRect(), t = document.querySelector('#alpha-hint .alpha-hint-text');
          const g = document.createRange(); g.selectNodeContents(t); const rs = [...g.getClientRects()];
          return rs.length ? [Math.min(...rs.map((r) => r.left)) - row.left, row.right - Math.max(...rs.map((r) => r.right))] : null; })())"""))
        C(f'Letters ({SET}): the hint text at least 16 px in from both ends', inset and min(inset) >= 15.5, f"{inset and [round(x) for x in inset]}")
        if not tiles:
            continue
        first = R(ws, tiles)
        tap(ws, tiles, idx, wait=0.8)
        js(ws, 'window.scrollTo(0, 0)'); time.sleep(0.3)
        line, first2 = R(ws, '#alpha-hint'), R(ws, tiles)
        C(f"Letters ({SET}): the row the same height for the hint and a letter's line; the {'grid doesn' if SET == 'consonants' else 'tiles don'}'t move",
          same(hint, line, 'th') and same(first, first2, 't'), f"hint {fmt(hint)}, line {fmt(line)}")
        parts = {k: R(ws, f'#alpha-hint {s}') for k, s in [('row', ''), ('letter', '.alpha-line-glyph'), ('text', '.alpha-line-text'), ('details', '.alpha-line-more'), ('speaker', '.write-speak')]}
        parts['row'] = line
        snap(f'letters-{SET}')
        went = scrolled_by(ws, by=400); time.sleep(0.5)
        line2 = R(ws, '#alpha-hint')
        if went > 0:
            C(f'Letters ({SET}): the row stays put (pinned) when the page scrolls', same(line, line2, 't'), f"scrolled {went}px, {line['t']:.0f} → {line2 and line2['t']:.0f}")
        else:
            C(f'Letters ({SET}): the row pinned (the page fits, nothing to scroll)', True, 'skipped')
        js(ws, 'window.scrollTo(0, 0)'); time.sleep(0.3)
        tap(ws, '[data-alpha-page=write]', wait=1.2)
        wparts = {k: R(ws, f'#write-name {s}') for k, s in [('letter', '.alpha-line-glyph'), ('text', '.alpha-line-text'), ('details', '.alpha-line-more'), ('speaker', '.write-speak')]}
        wparts['row'] = R(ws, '#write-name')
        off = [k for k in parts if not same(parts[k], wparts[k])]
        C(f"Write ({SET}): the letter's row as on Letters (row, letter, text, Details, speaker in the same places)", not off,
          ', '.join(f"{k} {fmt(parts[k])} / {fmt(wparts[k])}" for k in off))
        sp, de = wparts['speaker'], wparts['details']
        C(f'Write ({SET}): the speaker at the row\'s right end, Details just before it',
          sp and de and js(ws, "document.querySelector('#write-name').lastElementChild.classList.contains('write-speak')") and de['r'] <= sp['l'] + 1, f"Details ends {de and de['r']:.0f}, speaker from {sp and sp['l']:.0f}")
        pad = R(ws, '.write-pad')
        tap(ws, '[data-write-mode=memory]', wait=1.0)
        mparts = {k: R(ws, f'#write-name {s}') for k, s in [('text', '.alpha-line-text'), ('speaker', '.write-speak'), ('slot', '.write-slot')]}
        mrow, mpad = R(ws, '#write-name'), R(ws, '.write-pad')
        tap(ws, '[data-write-mode=trace]', wait=1.0)
        tparts_slot = R(ws, '#write-name .write-slot')
        off = [k for k in ('text', 'speaker') if not same(wparts[k], mparts[k])]
        C(f"Write ({SET}): Trace → From memory moves nothing (the row, its text, the letter's room, the speaker, the pad)",
          not off and same(wparts['row'], mrow) and same(tparts_slot, mparts['slot']) and same(pad, mpad),
          ', '.join(f"{k} {fmt(wparts[k])} / {fmt(mparts[k])}" for k in off) or f"row {fmt(wparts['row'])} / {fmt(mrow)}, slot {fmt(tparts_slot)} / {fmt(mparts['slot'])}, pad {fmt(pad)} / {fmt(mpad)}")
    C('Letters: the row the same on Consonants, Vowels and Tones (top and height)',
      same(hints['consonants'], hints['vowels'], 'th') and same(hints['consonants'], hints['tones'], 'th'), ', '.join(f"{k} {fmt(v)}" for k, v in hints.items()))

    # ---- Write and Cards in the same places (2026-10-14, 10-15) ----
    for SET in ('consonants', 'vowels'):
        open_page(ws, 'alphabet', alphaPage='cards', alphaSet=SET)
        oc, card, pv, nx, tabs = R(ws, '.segmented:has(> [data-order])'), R(ws, '#card'), R(ws, '#prev-btn'), R(ws, '#next-btn'), R(ws, '.tabs')
        snap(f'cards-{SET}')
        tap(ws, '[data-alpha-page=write]', wait=1.2)
        ow, pad, wp, wn = R(ws, '#write-mode'), R(ws, '.write-pad'), R(ws, '#write-prev'), R(ws, '#write-next')
        snap(f'write-{SET}')
        C(f'Write ({SET}): Trace | From memory level with Cards\' Browse | Recognition | Recall', same(ow, oc, 'th'), f"{fmt(ow)} / {fmt(oc)}")
        C(f"Write ({SET}): the pad where Cards' card is (top and bottom)", same(pad, card, 'tb'), f"pad {pad and pad['t']:.0f}–{pad and pad['b']:.0f}, card {card and card['t']:.0f}–{card and card['b']:.0f}")
        C(f"Write ({SET}): ‹ › where Cards' are, at the bottom", same(wp, pv, 'lt') and same(wn, nx, 'lt'), f"‹ {fmt(wp)} / {fmt(pv)}, › {fmt(wn)} / {fmt(nx)}")
        for page, top, nav in [('Cards', card, nx), ('Write', pad, wn)]:
            up, down = nav and top and nav['t'] - top['b'], nav and tabs['t'] - nav['b']
            C(f'{page} ({SET}): ‹ › in the middle of the room under the {"card" if page == "Cards" else "pad"}, clear of the tab bar',
              up is not None and down is not None and down >= 0 and abs(up - down) <= 2, f"{up and round(up)} above, {down and round(down)} below")

    open_page(ws, 'study', studyPage='wordlist', currentDeckId='greetings')
    # (Add all was tapped here until the lists spike, 2026-10-20: Cards held only the words added.)
    tap(ws, '[data-study-page=flashcards]', wait=1.5)
    card, nx, tabs = R(ws, '#card'), R(ws, '#next-btn'), R(ws, '.tabs')
    up, down = (nx and card and nx['t'] - card['b'], nx and tabs['t'] - nx['b'])
    C("Topics' Cards: ‹ › in the middle of the room under the card, clear of the tab bar",
      up is not None and down is not None and down >= 0 and abs(up - down) <= 2, f"{up and round(up)} above, {down and round(down)} below")
    pv, rd = R(ws, '#prev-btn'), R(ws, '#random-btn')
    C("Topics' Cards: 🔀 in the middle of ‹ ›, level with them (10-21)",
      pv and nx and rd and near(rd['l'] + rd['w'] / 2, (pv['r'] + nx['l']) / 2) and same(rd, nx, 'th'), f"‹ {fmt(pv)}, 🔀 {fmt(rd)}, › {fmt(nx)}")

    # ---- The card one shape in Browse, Recognition and Recall (2026-10-16) ----
    def modes(label, tab):
        tap(ws, '[data-order=practice]', wait=1.0)
        b, nav = R(ws, '#card'), R(ws, '#next-btn')
        tap(ws, '[data-order=test]', wait=1.2)
        t, pills = R(ws, '#card'), R(ws, '#learn-pills')
        hs, fonts = [], []
        for k in range(6):
            q = json.loads(js(ws, "JSON.stringify({ h: document.getElementById('card').getBoundingClientRect().height,"
                                  " f: [...document.querySelectorAll('#learn-pills .learn-pill')].map((p) => parseFloat(getComputedStyle(p).fontSize)) })"))
            hs.append(q['h']); fonts += q['f']
            js(ws, "document.querySelector('#learn-pills .learn-pill').click()"); time.sleep(0.4)
            js(ws, "document.getElementById('next-btn').click()"); time.sleep(0.6)
        tap(ws, '[data-order=type]', wait=1.2)
        ty, box = R(ws, '#card'), R(ws, '#type-bar')
        C(f"{label}: Type's card the same shape, its box where ‹ › are (top and height)", same(b, ty) and same(box, nav, 'th'),
          f"card {fmt(ty)} / {fmt(b)}, box {fmt(box)}, ‹ › {fmt(nav)}")
        tap(ws, '[data-order=review]', wait=1.2)
        rc, grades = R(ws, '#review-card'), R(ws, '#review-grades')
        snap(f"{label.split()[0].lower().strip(':')}-recall")
        C(f'{label}: the card one shape in Browse, Recognition and Recall', same(b, t) and same(b, rc), f"{fmt(b)} / {fmt(t)} / {fmt(rc)}")
        C(f"{label}: Recognition's answers and Recall's grades where ‹ › are (top and height)", same(pills, nav, 'th') and same(grades, nav, 'th'),
          f"‹ › {fmt(nav)}, answers {fmt(pills)}, grades {fmt(grades)}")
        C(f'{label}: in Recognition the card keeps its size question to question, answers 12 px or more',
          max(hs) - min(hs) <= 1 and min(fonts) >= 11.95, f"heights {sorted({round(h) for h in hs})}, text {min(fonts):.1f}–{max(fonts):.1f} px")
        # Coming to Cards in Recall with no stream running (after a reload): sized as through the switch (2026-10-16).
        js(ws, 'location.reload()'); time.sleep(1.8)
        tap(ws, f'.tab[data-view={tab}]', wait=1.5)
        rc2 = R(ws, '#review-card')
        C(f'{label}: Recall\'s card the same arriving from elsewhere (a reload, then the tab)', same(rc2, b), f"{fmt(rc2)} / {fmt(b)}")
        tap(ws, '[data-order=practice]', wait=1.0)
    modes("Topics' Cards", 'study')

    # ---- Type with a phone's keyboard up (2026-10-19) ----
    # A touch screen (TOUCH_SCREEN is read as the page loads), then the visible height the keyboard
    # leaves: 307 px less, as the iPhone in Safari at 664 (the keyboard probe).
    ws.call('Emulation.setTouchEmulationEnabled', enabled=True, maxTouchPoints=5)
    js(ws, 'location.reload()'); time.sleep(1.8)
    tap(ws, '.tab[data-view=study]', wait=1.5)
    tap(ws, '[data-order=type]', wait=1.0)
    ws.call('Emulation.setDeviceMetricsOverride', width=W, height=H - 307, deviceScaleFactor=2, mobile=True)
    time.sleep(0.8)
    card, box = R(ws, '#card'), R(ws, '#type-bar')
    focus = js(ws, 'document.activeElement.id')
    snap('type-keyboard')
    C(f'Type, the keyboard up ({H - 307} px left): the card and the box above it, 12 px under each, the box still focused',
      card and box and near(card['t'], 12) and near(box['t'], card['b'] + 12) and near(box['b'], H - 307 - 12, 1.5) and focus == 'type-box',
      f"card {fmt(card)}, box {fmt(box)}, focus on {focus or 'nothing'}")
    # Held at its top (the user's screenshot, 2026-10-19: iOS scrolled it 80 px after an answer): a
    # drag on the card stopped, a scroll put back. The page is made taller to have room to scroll.
    held = js(ws, """(() => { const e = new TouchEvent('touchmove', { bubbles: true, cancelable: true });
      document.getElementById('card').dispatchEvent(e); return e.defaultPrevented; })()""")
    js(ws, "document.body.style.minHeight = '2000px'; window.scrollTo(0, 80)"); time.sleep(0.3)
    top = js(ws, 'window.scrollY')
    js(ws, "document.body.style.minHeight = ''")
    C('Type, the keyboard up: the page held at its top (a drag on the card stopped, a scroll put back)',
      held is True and top == 0, f'drag stopped: {held}, scrolled to {top}')
    ws.call('Emulation.setDeviceMetricsOverride', width=W, height=H, deviceScaleFactor=2, mobile=True)
    # Any field's keyboard: the tab bar hidden while it's up, and back when it goes (the user's
    # screenshot, 2026-10-19: the Dictionary's results scrolled, iOS showed it halfway up the screen).
    js(ws, 'document.activeElement.blur()'); time.sleep(0.3)  # Type's box, whose keyboard hides the bar too
    tap(ws, '.tab[data-view=dictionary]', wait=1.0)
    tap(ws, '#dict-search', wait=0.5)
    bar_up = js(ws, "getComputedStyle(document.querySelector('.tabs')).display")
    js(ws, 'document.activeElement.blur()'); time.sleep(0.3)
    bar_down = js(ws, "getComputedStyle(document.querySelector('.tabs')).display")
    C("A field's keyboard up (the Dictionary's search): the tab bar hidden, and back when it goes",
      bar_up == 'none' and bar_down not in (None, 'none'), f'up: {bar_up}, gone: {bar_down}')
    ws.call('Emulation.setTouchEmulationEnabled', enabled=False)
    js(ws, 'location.reload()'); time.sleep(1.8)
    tap(ws, '.tab[data-view=study]', wait=1.5)
    tap(ws, '[data-order=practice]', wait=1.0)  # as modes() leaves it, for the checks below

    # ---- Card text in proportion (2026-10-16) ----
    FRONT = """JSON.stringify((() => { const t = document.getElementById('card-thai'), f = t.closest('.face'), cs = getComputedStyle(f), r = t.getBoundingClientRect(), fr = f.getBoundingClientRect();
      const room = { l: fr.left + parseFloat(cs.paddingLeft), r: fr.right - parseFloat(cs.paddingRight), t: fr.top + parseFloat(cs.paddingTop), b: fr.bottom - parseFloat(cs.paddingBottom) };
      return { text: t.textContent, px: parseFloat(getComputedStyle(t).fontSize), inside: r.left >= room.l - 1 && r.right <= room.r + 1 && r.top >= room.t - 1 && r.bottom <= room.b + 1,
        fill: Math.max(r.width / (room.r - room.l), r.height / (room.b - room.t)) }; })())"""
    seen = []
    for k in range(8):
        seen.append(json.loads(js(ws, FRONT)))
        js(ws, "document.getElementById('next-btn').click()"); time.sleep(0.5)
    bad = [s['text'] for s in seen if not s['inside']]
    C("Topics' Cards: every word inside the card's room, long ones shrunk to fit", not bad, f"over: {bad}" if bad else f"{len(seen)} words, {min(s['px'] for s in seen):.0f}–{max(s['px'] for s in seen):.0f} px")
    for SET in ('consonants', 'vowels'):
        open_page(ws, 'alphabet', alphaPage='cards', alphaSet=SET)
        if SET == 'consonants':
            modes('Alphabet Cards', 'alphabet')
        f = json.loads(js(ws, FRONT))
        C(f'Alphabet Cards ({SET}): the front\'s letter grown to fill the card (to the cap or the room), inside it',
          f['inside'] and (f['px'] >= 148 or f['fill'] >= 0.88), f"{f['text']} {f['px']:.0f} px, fills {f['fill']:.0%}")
    open_page(ws, 'alphabet', alphaPage='cards', alphaSet='consonants')
    for k in range(2):
        if k:
            for _ in range(15):
                js(ws, "document.getElementById('next-btn').click()"); time.sleep(0.1)
            time.sleep(0.5)
        js(ws, "document.querySelector('#card .flip-btn').click()"); time.sleep(1.2)
        b = json.loads(js(ws, """JSON.stringify((() => { const b = document.querySelector('#card .face-body'), px = (s) => parseFloat(getComputedStyle(document.querySelector(s)).fontSize);
          return { letter: document.getElementById('card-back-thai').textContent, fits: b.scrollHeight <= b.clientHeight + 1, room: [b.clientHeight, b.scrollHeight], how: b.className, card: Math.round(document.getElementById('card').getBoundingClientRect().height), letterPx: px('#card-back-thai'), enPx: px('#card-english'),
            pic: document.getElementById('card-pic').getBoundingClientRect().width }; })())"""))
        C(f"Alphabet Cards: {b['letter']}'s back whole (nothing cut off), the letter at least twice the words' size, the picture shown",
          b['fits'] and b['letterPx'] >= 2 * b['enPx'] - 0.5 and b['pic'] > 0, f"letter {b['letterPx']:.0f} px, words {b['enPx']:.0f} px, room {b['room'][0]} needs {b['room'][1]}, {b['how']}, card {b['card']}")
        if not k:
            snap('cards-back')
        js(ws, "document.querySelector('#card .flip-btn').click()"); time.sleep(0.8)

    # ---- Tile boards: rows centred, tiles one width (2026-10-13) ----
    for deck in ('script-vowels', 'script-final-families', 'script-tone-pairs-common'):
        open_page(ws, 'study', studyPage='wordlist', currentDeckId=deck)
        t = json.loads(js(ws, """JSON.stringify((() => { const box = document.querySelector('#wordlist-section .letter-groups'); if (!box) return null; const cs = getComputedStyle(box), br = box.getBoundingClientRect();
          const l = br.left + parseFloat(cs.paddingLeft), r = br.right - parseFloat(cs.paddingRight);
          const widths = [...box.querySelectorAll('.letter-tile')].map((e) => Math.round(e.getBoundingClientRect().width));
          const rows = {}; for (const g of box.querySelectorAll('.letter-group')) { const x = g.getBoundingClientRect(); const k = Math.round(x.top); (rows[k] ||= []).push(x); }
          const off = Object.values(rows).map((gs) => Math.round(Math.abs((Math.min(...gs.map((x) => x.left)) - l) - (r - Math.max(...gs.map((x) => x.right))))));
          return { widths: [...new Set(widths)], off: Math.max(0, ...off), rows: off.length }; })())"""))
        C(f'Topics List ({deck}): the tile rows centred, every tile one width',
          t and max(t['widths']) - min(t['widths']) <= 1 and t['off'] <= 2, t and f"widths {t['widths']}, rows {t['rows']}, off-centre by up to {t['off']} px")
    open_page(ws, 'alphabet', alphaPage='letters', alphaSet='vowels')
    w = json.loads(js(ws, "JSON.stringify([...new Set([...document.querySelectorAll('#alpha-vowels .letter-tile')].map((e) => Math.round(e.getBoundingClientRect().width)))])"))
    C('Letters (vowels): every vowel tile one width, so the columns line up section to section', w and max(w) - min(w) <= 1, f"widths {w}")

    # ---- The new-version bar (2026-10-19: three cramped lines, the user's screenshot) ----
    # Shown by hand: one line, the button 44 tall, the page's width in the gutters, 12 over the tab bar.
    u = json.loads(js(ws, """JSON.stringify((() => { const bar = document.getElementById('update-bar'); bar.hidden = false;
      const r = bar.getBoundingClientRect(), t = bar.querySelector('span').getBoundingClientRect(), b = bar.querySelector('button').getBoundingClientRect(),
        tabs = document.querySelector('.tabs').getBoundingClientRect(), line = parseFloat(getComputedStyle(bar).lineHeight) || 22;
      bar.hidden = true;
      return { l: r.left, r: innerWidth - r.right, gap: tabs.top - r.bottom, textH: t.height, line, btnH: b.height }; })())"""))
    C('The new-version bar: one line, its button 44 tall, the page\'s width (12 in), 12 over the tab bar',
      u['textH'] < 1.5 * u['line'] and u['btnH'] >= 44 and near(u['l'], 12) and near(u['r'], 12) and near(u['gap'], 12),
      f"text {u['textH']:.0f} tall, button {u['btnH']:.0f}, {u['l']:.0f} / {u['r']:.0f} in, {u['gap']:.0f} over the bar")

    errs = json.loads(js(ws, 'JSON.stringify(window.__errs || [])'))
    C('No script errors', not errs, '; '.join(errs)[:200])
    C('No sideways scroll', js(ws, 'document.documentElement.scrollWidth') <= W, f"{js(ws, 'document.documentElement.scrollWidth')} wide")


def main():
    os.makedirs(SHOTS, exist_ok=True)
    shutil.rmtree(PROFILE, ignore_errors=True)
    cmd = [CHROME, '--no-sandbox'] if os.path.exists(CHROME) else ['chromium']
    proc = subprocess.Popen(cmd + ['--headless=new', f'--remote-debugging-port={PORT}', f'--user-data-dir={PROFILE}', '--no-first-run',
                                   '--mute-audio', '--autoplay-policy=no-user-gesture-required', 'about:blank'],
                            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        for _ in range(60):
            try:
                targets = json.load(urllib.request.urlopen(f'http://127.0.0.1:{PORT}/json/list'))
                break
            except Exception:
                time.sleep(0.3)
        ws = WS(next(t for t in targets if t['type'] == 'page')['webSocketDebuggerUrl'])
        ws.call('Page.enable')
        ws.call('Page.addScriptToEvaluateOnNewDocument', source="window.__errs=[]; addEventListener('error',e=>__errs.push(e.message)); addEventListener('unhandledrejection',e=>__errs.push(String(e.reason)));")
        for size in SIZES:
            W, H = size
            print(f"== {W}×{H}" + (f", text size {TEXT_SIZE}" if TEXT_SIZE else ''))
            ws.call('Emulation.setDeviceMetricsOverride', width=W, height=H, deviceScaleFactor=2, mobile=W < 700)
            ws.call('Page.navigate', url=URL + '?v=' + str(time.time()))
            time.sleep(1.5)
            checks(ws, size)
    finally:
        proc.terminate()
        proc.wait(timeout=10)
        shutil.rmtree(PROFILE, ignore_errors=True)
    failed = [r for r in results if not r[2]]
    print(f"\n{len(results) - len(failed)} / {len(results)} passed" + (':' if failed else '.'))
    for (W, H), name, _, detail in failed:
        print(f"  FAIL {W}×{H}  {name}" + (f"  ({detail})" if detail else ''))
    print(f"Screenshots: {SHOTS}")
    sys.exit(1 if failed else 0)


main()
