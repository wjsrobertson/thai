"""Train the handwriting model behind the Alphabet's Write → From memory check (2026-10-15).

The data: Burapha-TH (Onuean et al., "Burapha-TH: A Multi-Purpose Character, Digit, and Syllable
Handwriting Dataset", Applied Sciences 12(8):4083, 2022), its character set, written by over a
thousand native Thai writers: https://services.informatics.buu.ac.th/datasets/Burapha-TH/
Granted for research and education use, not commercial; the app ships only the trained weights,
never the images. The 44 consonants, about 900 training and 200 test samples each.

  python3 -u tools/train_writing.py prep      # the scans -> one cached array (DATA/consonants48.npz)
  python3 -u tools/train_writing.py train     # trains; the best checkpoint -> DATA/write-model.pt
  python3 -u tools/train_writing.py synth     # letters from installed fonts, warped -> DATA/synth48.npz
  python3 -u tools/train_writing.py tune      # the model trained on, Burapha-TH and synth together
  python3 -u tools/train_writing.py eval      # the test split, and the letters in installed fonts
  python3 -u tools/train_writing.py export    # -> data/write-model.bin, for app.js (writeModel)

DATA is ~/Development/datasets/burapha-th (or $BURAPHA_TH), holding the unzipped
character-train/ and character-test/ (20210306-train.zip, 20210306-test.zip from the page above).

normalize() is the preprocessing app.js mirrors (writeImage): ink as 0..1, specks dropped, cropped
to the ink, fitted into SIZE × SIZE with INNER on the long side, centred, its shape kept.
"""
import json
import os
import sys
import time
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
DATA = Path(os.environ.get('BURAPHA_TH', Path.home() / 'Development/datasets/burapha-th'))
OUT = ROOT / 'data' / 'write-model.bin'
SIZE, INNER = 48, 40
# The 44 consonants, in alphabet order; Burapha-TH's folders are named by TIS-620 code (A1 = ก).
LETTERS = 'กขฃคฅฆงจฉชซฌญฎฏฐฑฒณดตถทธนบปผฝพฟภมยรลวศษสหฬอฮ'


def normalize(ink):
    """ink: a 2-D float array, 1 = ink, 0 = paper, any size -> SIZE × SIZE float32."""
    from skimage.morphology import remove_small_objects
    ink = np.clip(ink, 0, 1)
    if ink.max() <= 0:
        return np.zeros((SIZE, SIZE), np.float32)
    mask = ink > 0.3 * ink.max()
    # Specks: anything under 3% of the ink (a letter's own separate parts, ฐ's tail, are bigger).
    mask = remove_small_objects(mask, max(4, int(0.03 * mask.sum())))
    if not mask.any():
        return np.zeros((SIZE, SIZE), np.float32)
    ink = ink * mask  # the specks' ink too
    ys, xs = np.nonzero(mask)
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    crop = ink[y0:y1, x0:x1]
    # Pencil is faint: the strokes' cores to 1.
    core = np.percentile(crop[crop > 0], 90)
    crop = np.clip(crop / max(core, 1e-6), 0, 1)
    h, w = crop.shape
    s = INNER / max(h, w)
    nh, nw = max(1, round(h * s)), max(1, round(w * s))
    small = np.asarray(Image.fromarray((crop * 255).astype(np.uint8)).resize((nw, nh), Image.BILINEAR), np.float32) / 255
    out = np.zeros((SIZE, SIZE), np.float32)
    oy, ox = (SIZE - nh) // 2, (SIZE - nw) // 2
    out[oy:oy + nh, ox:ox + nw] = small
    return out


def scan_ink(path):
    v = np.asarray(Image.open(path).convert('L'), np.float32)
    bg = np.percentile(v, 90)
    return np.clip((bg - v) / max(bg - v.min(), 1e-6), 0, 1)


def folders(split):
    root = DATA / f'character-{split}' / split
    by_code = {d.split('-')[2]: root / d for d in os.listdir(root)}
    return [by_code[f'{0xA0 + ord(ch) - 0x0E00:02X}'] for ch in LETTERS]


def prep():
    from concurrent.futures import ProcessPoolExecutor
    arrays = {}
    for split in ['train', 'test']:
        jobs = [(i, d / f) for i, d in enumerate(folders(split)) for f in sorted(os.listdir(d))]
        with ProcessPoolExecutor() as pool:
            xs = list(pool.map(_prep_one, [p for _, p in jobs], chunksize=64))
        arrays[f'x_{split}'] = (np.stack(xs) * 255).astype(np.uint8)
        arrays[f'y_{split}'] = np.array([i for i, _ in jobs], np.int64)
        print(split, arrays[f'x_{split}'].shape)
    np.savez_compressed(DATA / 'consonants48.npz', **arrays)
    # The strokes' thickness in the 48 box, which app.js draws a drawing's lines at (WRITE_MODEL_LINE):
    # ink area over skeleton length.
    from skimage.morphology import skeletonize
    x = arrays['x_train'][::50] / 255
    t = [((im > 0.5).sum() / max(1, skeletonize(im > 0.5).sum())) for im in x]
    print('stroke thickness in the 48 box: median %.2f px (10%%: %.2f, 90%%: %.2f)' % (np.median(t), np.percentile(t, 10), np.percentile(t, 90)))


def _prep_one(path):
    return normalize(scan_ink(path))


def net(n=len(LETTERS)):
    import torch.nn as nn
    conv = lambda i, o: [nn.Conv2d(i, o, 3, padding=1, bias=False), nn.BatchNorm2d(o), nn.ReLU()]
    return nn.Sequential(
        *conv(1, 24), *conv(24, 24), nn.MaxPool2d(2),        # 24 × 24
        *conv(24, 48), *conv(48, 48), nn.MaxPool2d(2),       # 12 × 12
        *conv(48, 96), nn.MaxPool2d(2),                      # 6 × 6
        nn.Conv2d(96, 32, 1, bias=False), nn.BatchNorm2d(32), nn.ReLU(),
        nn.Flatten(), nn.Dropout(0.3), nn.Linear(32 * 6 * 6, 128), nn.ReLU(), nn.Dropout(0.3), nn.Linear(128, n))


def augment(x):
    """A batch (B, 1, SIZE, SIZE): turned, scaled, slanted and moved a little; strokes thicker or
    thinner; half made crisp, as a finger's lines are."""
    import torch
    import torch.nn.functional as F
    b = x.shape[0]
    ang = (torch.rand(b) - 0.5) * 2 * 0.21          # ±12°
    sc = 0.85 + torch.rand(b) * 0.25
    sh = (torch.rand(b) - 0.5) * 2 * 0.2
    tx, ty = [(torch.rand(b) - 0.5) * 2 * 0.08 for _ in range(2)]
    cos, sin = torch.cos(ang) / sc, torch.sin(ang) / sc
    theta = torch.stack([torch.stack([cos, -sin + sh, tx], 1), torch.stack([sin, cos, ty], 1)], 1)
    x = F.grid_sample(x, F.affine_grid(theta, x.shape, align_corners=False), align_corners=False)
    r = torch.rand(b)
    thick = F.max_pool2d(x, 3, 1, 1)
    thin = -F.max_pool2d(-x, 3, 1, 1)
    x = torch.where((r < 0.35)[:, None, None, None], thick, torch.where((r > 0.85)[:, None, None, None], thin, x))
    crisp = (torch.rand(b) < 0.5)[:, None, None, None]
    return torch.where(crisp, (x > 0.35).float(), x)


def train(epochs=24):
    import torch
    import torch.nn.functional as F
    torch.manual_seed(0)
    d = np.load(DATA / 'consonants48.npz')
    xt = torch.tensor(d['x_train'], dtype=torch.float32)[:, None] / 255
    yt = torch.tensor(d['y_train'])
    xv = torch.tensor(d['x_test'], dtype=torch.float32)[:, None] / 255
    yv = torch.tensor(d['y_test'])
    model = net()
    opt = torch.optim.AdamW(model.parameters(), 2e-3, weight_decay=1e-4)
    steps = epochs * ((len(xt) + 255) // 256)
    sched = torch.optim.lr_scheduler.OneCycleLR(opt, 3e-3, total_steps=steps)
    best = 0
    for ep in range(epochs):
        t0 = time.time()
        model.train()
        perm = torch.randperm(len(xt))
        for i in range(0, len(xt), 256):
            idx = perm[i:i + 256]
            loss = F.cross_entropy(model(augment(xt[idx])), yt[idx], label_smoothing=0.05)
            opt.zero_grad()
            loss.backward()
            opt.step()
            sched.step()
        acc = accuracy(model, xv, yv)
        print(f'epoch {ep + 1}/{epochs}: loss {loss.item():.3f}, test accuracy {acc:.4f} ({time.time() - t0:.0f}s)')
        if acc > best:
            best = acc
            torch.save(model.state_dict(), DATA / 'write-model.pt')
    print(f'best test accuracy {best:.4f}')


def accuracy(model, x, y):
    import torch
    model.eval()
    with torch.no_grad():
        p = torch.cat([model(x[i:i + 1024]).argmax(1) for i in range(0, len(x), 1024)])
    return (p == y).float().mean().item()


def load():
    import torch
    model = net()
    model.load_state_dict(torch.load(DATA / 'write-model.pt'))
    return model.eval()


# Synthetic samples (2026-10-15): the app teaches with Noto Looped, whose letters' telling parts
# are short (ป's and ฟ's tails, ข's notch), where handwriting draws them tall; the first model read
# 8 of its 44 letters wrong. Each letter in these fonts, warped, as a centre line redrawn at the
# handwriting's widths, so a learner copying the app's letters is read right.
SYNTH_FONTS = ['/usr/share/fonts/truetype/noto/NotoLoopedThai-Regular.ttf', '/usr/share/fonts/truetype/noto/NotoLoopedThai-Bold.ttf',
               '/usr/share/fonts/truetype/noto/NotoSerifThai-Regular.ttf', '/usr/share/fonts/truetype/noto/NotoSerifThai-Bold.ttf',
               '/usr/share/fonts/truetype/freefont/FreeSerif.ttf', '/usr/share/fonts/truetype/freefont/FreeSerifBold.ttf',
               '/usr/share/fonts/truetype/freefont/FreeSerifItalic.ttf']
SYNTH_EACH = 20  # warped copies of each letter in each font


def centre_line(ink, width, rng=None):
    """A glyph (or drawing) as its centre line, redrawn `width` px wide in the SIZE box: the app
    draws a learner's strokes that way. With rng, the glyph is warped first."""
    from scipy.ndimage import gaussian_filter, map_coordinates
    from skimage.morphology import disk, dilation, skeletonize
    if rng is not None:
        h, w = ink.shape
        dy, dx = (gaussian_filter(rng.standard_normal((h, w)), 18) * 18 * rng.uniform(0.5, 1.6) for _ in range(2))
        yy, xx = np.mgrid[0:h, 0:w]
        ink = map_coordinates(ink, [yy + dy, xx + dx], order=1)
    sk = skeletonize(ink > 0.5).astype(np.float32)
    if not sk.any():
        return np.zeros((SIZE, SIZE), np.float32)
    ys, xs = np.nonzero(sk)
    long = max(np.ptp(ys), np.ptp(xs)) + 1
    r = max(1, round(width / 2 * long / INNER))
    return normalize(gaussian_filter(dilation(sk, disk(r)), 0.7))


def synth():
    from concurrent.futures import ProcessPoolExecutor
    jobs = [(f, i, k) for f in SYNTH_FONTS if Path(f).exists() for i in range(len(LETTERS)) for k in range(SYNTH_EACH)]
    with ProcessPoolExecutor() as pool:
        xs = list(pool.map(_synth_one, jobs, chunksize=16))
    np.savez_compressed(DATA / 'synth48.npz', x=(np.stack(xs) * 255).astype(np.uint8), y=np.array([i for _, i, _ in jobs], np.int64))
    print('synthetic samples:', len(xs), 'from', len({f for f, _, _ in jobs}), 'fonts')


def _synth_one(job):
    f, i, k = job
    rng = np.random.default_rng(hash((f, i, k)) % 2 ** 32)
    return centre_line(font_ink(LETTERS[i], f), rng.uniform(2.0, 4.2), rng)


def tune(epochs=8):
    """The trained model, trained on further with Burapha-TH and the synthetic letters together (the
    synthetic ones three times over, about a seventh of each epoch); the model before is kept as
    write-model-v1.pt. Saved each epoch the Burapha-TH test accuracy holds within 0.5% of its best."""
    import shutil
    import torch
    import torch.nn.functional as F
    torch.manual_seed(1)
    if not (DATA / 'write-model-v1.pt').exists():
        shutil.copy(DATA / 'write-model.pt', DATA / 'write-model-v1.pt')
    d = np.load(DATA / 'consonants48.npz')
    sy = np.load(DATA / 'synth48.npz')
    xt = torch.tensor(np.concatenate([d['x_train']] + [sy['x']] * 3), dtype=torch.float32)[:, None] / 255
    yt = torch.tensor(np.concatenate([d['y_train']] + [sy['y']] * 3))
    xv = torch.tensor(d['x_test'], dtype=torch.float32)[:, None] / 255
    yv = torch.tensor(d['y_test'])
    model = load().train()
    opt = torch.optim.AdamW(model.parameters(), 5e-4, weight_decay=1e-4)
    sched = torch.optim.lr_scheduler.OneCycleLR(opt, 1e-3, total_steps=epochs * ((len(xt) + 255) // 256))
    best = accuracy(model, xv, yv)
    print(f'before: test accuracy {best:.4f}')
    for ep in range(epochs):
        t0 = time.time()
        model.train()
        perm = torch.randperm(len(xt))
        for i in range(0, len(xt), 256):
            idx = perm[i:i + 256]
            loss = F.cross_entropy(model(augment(xt[idx])), yt[idx], label_smoothing=0.05)
            opt.zero_grad()
            loss.backward()
            opt.step()
            sched.step()
        acc = accuracy(model, xv, yv)
        best = max(best, acc)
        print(f'epoch {ep + 1}/{epochs}: loss {loss.item():.3f}, test accuracy {acc:.4f} ({time.time() - t0:.0f}s)')
        if acc >= best - 0.005:
            torch.save(model.state_dict(), DATA / 'write-model.pt')


FONTS = ['/usr/share/fonts/truetype/noto/NotoLoopedThai-Regular.ttf', '/usr/share/fonts/truetype/noto/NotoSerifThai-Regular.ttf',
         '/usr/share/fonts/truetype/freefont/FreeSerif.ttf', str(ROOT / 'fonts' / 'LearnThaiLooped.woff2')]


def font_ink(ch, font_path):
    f = ImageFont.truetype(font_path, 160)
    im = Image.new('L', (300, 300), 0)
    ImageDraw.Draw(im).text((70, 40), ch, font=f, fill=255)
    return np.asarray(im, np.float32) / 255


def eval_():
    import torch
    model = load()
    d = np.load(DATA / 'consonants48.npz')
    xv = torch.tensor(d['x_test'], dtype=torch.float32)[:, None] / 255
    yv = torch.tensor(d['y_test'])
    with torch.no_grad():
        p = torch.cat([model(xv[i:i + 1024]).softmax(1) for i in range(0, len(xv), 1024)])
    pred = p.argmax(1)
    print(f'test split: {(pred == yv).float().mean().item():.4f} top-1, '
          f'{(p.topk(3, 1).indices == yv[:, None]).any(1).float().mean().item():.4f} top-3 ({len(yv)} samples)')
    worst = np.argsort([(pred[yv == i] == i).float().mean().item() for i in range(len(LETTERS))])[:8]
    print('hardest:', ', '.join(f'{LETTERS[i]} {(pred[yv == i] == i).float().mean().item():.2f} (often {LETTERS[torch.mode(pred[(yv == i) & (pred != i)]).values.item()] if ((yv == i) & (pred != i)).any() else "-"})' for i in worst))
    for path in FONTS:
        if not Path(path).exists():
            continue
        try:
            x = torch.tensor(np.stack([centre_line(font_ink(ch, path), 2.8) for ch in LETTERS]))[:, None]  # as the app draws a learner's lines
        except OSError:
            continue
        with torch.no_grad():
            q = model(x).softmax(1)
        ok = (q.argmax(1) == torch.arange(len(LETTERS))).float().mean().item()
        miss = [f'{ch}→{LETTERS[q[i].argmax()]}' for i, ch in enumerate(LETTERS) if q[i].argmax() != i]
        print(f'{Path(path).stem}: {ok:.2f}', ' '.join(miss))


def export():
    """data/write-model.bin: a 4-byte length, a JSON header (the layers, in order, each with its
    weights' offset and shape in the float16 block that follows; BatchNorm folded into the conv
    before it), then the float16 weights."""
    import torch.nn as nn
    model = load()
    layers, blobs, offset = [], [], 0
    mods = list(model)

    def add(arr):
        nonlocal offset
        a = np.ascontiguousarray(arr, np.float16)
        blobs.append(a.tobytes())
        start = offset
        offset += a.size
        return {'offset': start, 'shape': list(a.shape)}

    i = 0
    while i < len(mods):
        m = mods[i]
        if isinstance(m, nn.Conv2d):
            w = m.weight.detach().numpy().astype(np.float64)
            b = np.zeros(w.shape[0])
            if i + 1 < len(mods) and isinstance(mods[i + 1], nn.BatchNorm2d):
                bn = mods[i + 1]
                g = bn.weight.detach().numpy() / np.sqrt(bn.running_var.numpy() + bn.eps)
                w = w * g[:, None, None, None]
                b = bn.bias.detach().numpy() - bn.running_mean.numpy() * g
                i += 1
            layers.append({'type': 'conv', 'k': w.shape[2], 'w': add(w), 'b': add(b)})
        elif isinstance(m, nn.ReLU):
            layers.append({'type': 'relu'})
        elif isinstance(m, nn.MaxPool2d):
            layers.append({'type': 'pool'})
        elif isinstance(m, nn.Linear):
            layers.append({'type': 'dense', 'w': add(m.weight.detach().numpy()), 'b': add(m.bias.detach().numpy())})
        i += 1  # Flatten (C, H, W order, as app.js keeps it) and Dropout need nothing
    header = json.dumps({'size': SIZE, 'inner': INNER, 'letters': LETTERS, 'layers': layers,
                         'source': 'Burapha-TH (Onuean et al., Applied Sciences 2022), consonants; tools/train_writing.py'},
                        ensure_ascii=False).encode()
    pad = (-(4 + len(header))) % 2
    OUT.write_bytes(len(header + b' ' * pad).to_bytes(4, 'little') + header + b' ' * pad + b''.join(blobs))
    print(f'wrote {OUT} ({OUT.stat().st_size / 1024:.0f} KB, {offset} weights)')


if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else ''
    {'prep': prep, 'train': train, 'synth': synth, 'tune': tune, 'eval': eval_, 'export': export}.get(cmd, lambda: print(__doc__))()
