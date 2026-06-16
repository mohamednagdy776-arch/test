# Delaunay-triangulation face morphing with 256-point grid landmarks.
# Zero disk I/O. Eliminates ghost/overlay artefact from simple blending.
from __future__ import annotations
import base64, math
import cv2
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter


def _decode(b64: str) -> np.ndarray:
    if "," in b64:
        b64 = b64.split(",", 1)[1]
    arr = np.frombuffer(base64.b64decode(b64), dtype=np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Cannot decode image")
    return img


def _crop(img: np.ndarray) -> np.ndarray:
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    cas = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
    faces = cas.detectMultiScale(gray, 1.1, 5, minSize=(60, 60))
    h, w = img.shape[:2]
    if len(faces):
        x, y, fw, fh = max(faces, key=lambda fc: fc[2] * fc[3])
        p = int(max(fw, fh) * 0.55)
        return img[max(0, y - p):min(h, y + fh + p), max(0, x - p):min(w, x + fw + p)]
    s = min(h, w)
    cy, cx = h // 2, w // 2
    hs = s // 2
    return img[max(0, cy - hs):cy + hs, max(0, cx - hs):cx + hs]


def _get_lm(bgr: np.ndarray) -> np.ndarray:
    """Return 256 landmark points (16x16 grid) within the detected face region."""
    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    cas = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
    faces = cas.detectMultiScale(gray, 1.1, 5, minSize=(60, 60))
    h, w = bgr.shape[:2]
    if len(faces):
        x, y, fw, fh = max(faces, key=lambda fc: fc[2] * fc[3])
    else:
        x, y, fw, fh = int(w * .1), int(h * .1), int(w * .8), int(h * .8)
    pts = []
    for gy in np.linspace(y, y + fh, 16):
        for gx in np.linspace(x, x + fw, 16):
            pts.append([gx, gy])
    return np.array(pts, dtype=np.float32)


def _warp_tri(src: np.ndarray, ts: np.ndarray, td: np.ndarray, out: np.ndarray) -> None:
    ts = np.float32(ts).reshape(3, 2)
    td = np.float32(td).reshape(3, 2)
    rs = cv2.boundingRect(ts)
    rd = cv2.boundingRect(td)
    sx1, sy1, sw, sh = rs
    dx1, dy1, dw, dh = rd
    if sw <= 0 or sh <= 0 or dw <= 0 or dh <= 0:
        return
    sx2 = min(src.shape[1], sx1 + sw)
    sy2 = min(src.shape[0], sy1 + sh)
    sx1 = max(0, sx1)
    sy1 = max(0, sy1)
    if sx2 <= sx1 or sy2 <= sy1:
        return
    cs = (ts - np.float32([rs[0], rs[1]])).reshape(3, 2)
    cd = (td - np.float32([rd[0], rd[1]])).reshape(3, 2)
    try:
        M = cv2.getAffineTransform(cs, cd)
    except cv2.error:
        return
    patch = cv2.warpAffine(
        src[sy1:sy2, sx1:sx1 + sw], M, (dw, dh),
        flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT_101
    )
    mask = np.zeros((dh, dw), dtype=np.uint8)
    cv2.fillConvexPoly(mask, np.int32(cd), 255)
    dx2 = min(out.shape[1], dx1 + dw)
    dy2 = min(out.shape[0], dy1 + dh)
    dx1 = max(0, dx1)
    dy1 = max(0, dy1)
    if dx2 <= dx1 or dy2 <= dy1:
        return
    hc = dy2 - dy1
    wc = dx2 - dx1
    m = mask[:hc, :wc]
    roi = out[dy1:dy2, dx1:dx2]
    roi[m > 0] = patch[:hc, :wc][m > 0]


def _morph(img1: np.ndarray, img2: np.ndarray, size: int = 512) -> np.ndarray:
    img1 = cv2.resize(img1, (size, size), interpolation=cv2.INTER_LANCZOS4)
    img2 = cv2.resize(img2, (size, size), interpolation=cv2.INTER_LANCZOS4)
    pts1 = _get_lm(img1)
    pts2 = _get_lm(img2)
    edge = np.array([
        [0, 0], [size // 2, 0], [size - 1, 0],
        [0, size // 2], [size - 1, size // 2],
        [0, size - 1], [size // 2, size - 1], [size - 1, size - 1]
    ], dtype=np.float32)
    pts1 = np.vstack([pts1, edge])
    pts2 = np.vstack([pts2, edge])
    pm = (pts1 + pts2) * 0.5
    # Build lookup from rounded midpoint to index
    idx_map: dict = {}
    for i, p in enumerate(pm):
        k = (int(round(p[0])), int(round(p[1])))
        idx_map[k] = i
    subdiv = cv2.Subdiv2D((0, 0, size, size))
    for p in pm:
        px, py = float(p[0]), float(p[1])
        if 0 <= px < size and 0 <= py < size:
            try:
                subdiv.insert((px, py))
            except cv2.error:
                pass
    w1 = np.zeros_like(img1)
    w2 = np.zeros_like(img2)
    for t in subdiv.getTriangleList().astype(np.float32):
        vs = [(t[0], t[1]), (t[2], t[3]), (t[4], t[5])]
        if not all(0 <= v[0] < size and 0 <= v[1] < size for v in vs):
            continue
        idxs = []
        ok = True
        for v in vs:
            found = False
            for dx in range(-3, 4):
                for dy in range(-3, 4):
                    k = (int(round(v[0])) + dx, int(round(v[1])) + dy)
                    if k in idx_map:
                        idxs.append(idx_map[k])
                        found = True
                        break
                if found:
                    break
            if not found:
                ok = False
                break
        if not ok or len(idxs) != 3:
            continue
        _warp_tri(img1, np.float32([pts1[i] for i in idxs]),
                  np.float32([pm[i] for i in idxs]), w1)
        _warp_tri(img2, np.float32([pts2[i] for i in idxs]),
                  np.float32([pm[i] for i in idxs]), w2)
    return cv2.addWeighted(w1, 0.5, w2, 0.5, 0)


def _childify(bgr: np.ndarray) -> np.ndarray:
    sl = cv2.bilateralFilter(bgr, d=11, sigmaColor=90, sigmaSpace=90)
    pil = Image.fromarray(cv2.cvtColor(sl, cv2.COLOR_BGR2RGB))
    pil = ImageEnhance.Brightness(pil).enhance(1.10)
    pil = ImageEnhance.Color(pil).enhance(1.18)
    pil = ImageEnhance.Contrast(pil).enhance(1.06)
    rc, gc, bc = pil.split()
    pil = Image.merge("RGB", (rc.point(lambda v: min(255, int(v * 1.05))), gc, bc))
    pil = Image.blend(pil, pil.filter(ImageFilter.GaussianBlur(1.8)), 0.25)
    w, h = pil.size
    Y, X = np.ogrid[:h, :w]
    dist = np.hypot(X - w / 2, Y - h / 2)
    fac = np.clip(1.0 - 0.30 * (dist / math.hypot(w / 2, h / 2)) ** 1.6, 0.70, 1.0)
    vig = Image.fromarray((fac * 255).astype(np.uint8), "L")
    res = Image.composite(pil, Image.new("RGB", (w, h), (245, 228, 210)), vig)
    return cv2.cvtColor(np.array(res), cv2.COLOR_RGB2BGR)


def predict_child(p1_b64: str, p2_b64: str) -> str:
    """Blend two parent images via Delaunay face morphing. Zero disk writes."""
    img1 = _crop(_decode(p1_b64))
    img2 = _crop(_decode(p2_b64))
    morphed = _morph(img1, img2, size=512)
    result = _childify(morphed)
    ok, buf = cv2.imencode(".jpg", result, [cv2.IMWRITE_JPEG_QUALITY, 92])
    if not ok:
        raise RuntimeError("JPEG encoding failed")
    return base64.b64encode(buf).decode()
