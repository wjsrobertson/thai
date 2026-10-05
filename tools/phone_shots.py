"""Screenshot the app at phone sizes via headless Chromium + a minimal stdlib WebSocket CDP client.

    python3 -u tools/phone_shots.py <out_dir> <label>   # needs the server on :8765 and snap chromium
Takes Today, a review card, Decks (learn + test), wordlist, deck picker and settings at iPhone 14 and iPhone SE sizes.
"""
import base64, json, os, shutil, socket, struct, subprocess, sys, time, urllib.request

PORT = 9333
URL = 'http://localhost:8765/'
PROFILE = os.path.expanduser('~/snap/chromium/common/learnthai-shots-profile')  # throwaway, snap-accessible
DEVICES = {'iphone14': (390, 844), 'iphoneSE': (375, 667)}


class WS:
    def __init__(self, url):
        host, path = url.split('//', 1)[1].split('/', 1)
        h, p = host.split(':')
        self.s = socket.create_connection((h, int(p)))
        key = base64.b64encode(os.urandom(16)).decode()
        self.s.sendall((f'GET /{path} HTTP/1.1\r\nHost: {host}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\n'
                        f'Sec-WebSocket-Key: {key}\r\nSec-WebSocket-Version: 13\r\n\r\n').encode())
        resp = b''
        while b'\r\n\r\n' not in resp:
            resp += self.s.recv(4096)
        assert b' 101 ' in resp.split(b'\r\n')[0], resp
        self.buf = resp.split(b'\r\n\r\n', 1)[1]
        self.i = 0

    def _read(self, n):
        while len(self.buf) < n:
            self.buf += self.s.recv(1 << 16)
        out, self.buf = self.buf[:n], self.buf[n:]
        return out

    def send(self, obj):
        data = json.dumps(obj).encode()
        hdr = bytearray([0x81])
        n = len(data)
        if n < 126: hdr.append(0x80 | n)
        elif n < 1 << 16: hdr += bytes([0x80 | 126]) + struct.pack('>H', n)
        else: hdr += bytes([0x80 | 127]) + struct.pack('>Q', n)
        mask = os.urandom(4)
        self.s.sendall(bytes(hdr) + mask + bytes(b ^ mask[i % 4] for i, b in enumerate(data)))

    def recv(self):
        payload = b''
        while True:
            b1, b2 = self._read(2)
            n = b2 & 0x7f
            if n == 126: n = struct.unpack('>H', self._read(2))[0]
            elif n == 127: n = struct.unpack('>Q', self._read(8))[0]
            payload += self._read(n)
            if b1 & 0x80: return json.loads(payload)

    def call(self, method, **params):
        self.i += 1
        self.send({'id': self.i, 'method': method, 'params': params})
        while True:
            msg = self.recv()
            if msg.get('id') == self.i:
                if 'error' in msg: raise RuntimeError(msg['error'])
                return msg.get('result', {})


def js(ws, expr):
    return ws.call('Runtime.evaluate', expression=expr, awaitPromise=True, returnByValue=True).get('result', {}).get('value')


def shot(ws, path):
    data = ws.call('Page.captureScreenshot', format='png')['data']
    open(path, 'wb').write(base64.b64decode(data))


def main():
    out, label = sys.argv[1], sys.argv[2]
    os.makedirs(out, exist_ok=True)
    shutil.rmtree(PROFILE, ignore_errors=True)
    proc = subprocess.Popen(['chromium', '--headless=new', f'--remote-debugging-port={PORT}', f'--user-data-dir={PROFILE}',
                             '--no-first-run', '--autoplay-policy=no-user-gesture-required', '--mute-audio', 'about:blank'],
                            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        for _ in range(50):
            try:
                targets = json.load(urllib.request.urlopen(f'http://127.0.0.1:{PORT}/json/list')); break
            except Exception: time.sleep(0.3)
        page = next(t for t in targets if t['type'] == 'page')
        ws = WS(page['webSocketDebuggerUrl'])
        for dev, (w, h) in DEVICES.items():
            ws.call('Emulation.setDeviceMetricsOverride', width=w, height=h, deviceScaleFactor=2, mobile=True)
            ws.call('Emulation.setTouchEmulationEnabled', enabled=True)
            ws.call('Page.navigate', url=URL)
            for _ in range(50):
                time.sleep(0.2)
                if js(ws, "!!document.querySelector('#card-thai') && !!document.querySelector('#card-thai').textContent"): break
            else:
                raise SystemExit(f'{dev}: app did not load (is the server running?)')
            css = js(ws, "[...document.styleSheets].map(s => (s.href || '').split('/').pop() + (s.media.mediaText ? ' [' + s.media.mediaText + ']' : ''))")
            print(f'{dev}: stylesheets {css}')
            time.sleep(0.5)
            p = lambda name: os.path.join(out, f'{label}-{dev}-{name}.png')
            shot(ws, p('0-today'))
            js(ws, "document.querySelector('#today-start')?.click()"); time.sleep(0.5)
            shot(ws, p('0b-review'))
            js(ws, "document.querySelector('#review-quit')?.click()")
            js(ws, "document.querySelector('.tab[data-view=flashcards]').click()"); time.sleep(0.4)
            shot(ws, p('1-learn'))
            js(ws, "document.querySelector('#next-btn').click()"); time.sleep(0.4)   # card 2 has a note
            js(ws, "document.querySelector('.front .flip-btn').click()"); time.sleep(0.8)
            shot(ws, p('1b-back'))
            js(ws, "document.querySelector('.back .flip-btn').click()"); time.sleep(0.3)
            js(ws, "document.querySelector('[data-order=test]').click()"); time.sleep(0.6)
            shot(ws, p('2-test'))
            js(ws, "document.querySelector('[data-order=practice]').click()")
            js(ws, "document.querySelector('.tab[data-view=wordlist]').click()"); time.sleep(0.5)
            shot(ws, p('3-wordlist'))
            js(ws, "document.querySelector('.tab[data-view=flashcards]').click()")
            js(ws, "document.querySelector('#deck-button').click()"); time.sleep(0.5)
            shot(ws, p('4-picker'))
            js(ws, "document.querySelector('#deck-picker .modal-close').click()")
            js(ws, "document.querySelector('#settings-button').click()"); time.sleep(0.5)
            shot(ws, p('5-settings'))
            js(ws, "document.querySelector('#settings-modal .modal-close').click()")
            # Horizontal overflow is the usual mobile bug: report anything wider than the viewport.
            wide = js(ws, """(() => { const W = innerWidth; return [...document.querySelectorAll('body *')]
                .filter(e => e.offsetParent && e.getBoundingClientRect().right > W + 1)
                .slice(0, 8).map(e => e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + '.' + [...e.classList].join('.')
                + ' right=' + Math.round(e.getBoundingClientRect().right)); })()""")
            print(f'{dev} {w}x{h}: scrollWidth={js(ws, "document.documentElement.scrollWidth")} overflowing={wide}')
    finally:
        proc.terminate(); proc.wait(timeout=10)
        shutil.rmtree(PROFILE, ignore_errors=True)


main()
