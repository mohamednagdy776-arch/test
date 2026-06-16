"""In-memory face-blend service — zero disk I/O."""
from __future__ import annotations
import base64, math
import cv2
import numpy as np
from PIL import Image, ImageEnhance


def _decode(b64: str) -> np.ndarray:
    if "," in b64:
        b64 = b64.split(",", 1)[1]
    arr = np.frombuffer(base64.b64decode(b64), dtype=np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Cannot decode image — unsupported format or corrupt data")
    return img


def _crop_face(img: np.ndarray) -> np.ndarray:
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    cascade = cv2.CascadeClassifier(
        cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
    )
    faces = cascade.detectMultiScale(
        gray, scaleFactor=1.1, minNeighbors=5, minSize=(60, 60)
    )
    h, w = img.shape[:2]
    if len(faces):
        x, y, fw, fh = max(faces, key=lambda f: f[2] * f[3])
        p = int(max(fw, fh) * 0.45)
        return img[max(0, y - p):min(h, y + fh + p), max(0, x - p):min(w, x + fw + p)]
    s = min(h, w)
    cy, cx = h // 2, w // 2
    hs = s // 2
    return img[max(0, cy - hs):cy + hs, max(0, cx - hs):cx + hs]


def _childify(bgr: np.ndarray) -> np.ndarray:
    smooth = cv2.bilateralFilter(bgr, 9, 80, 80)
    rgb = cv2.cvtColor(smooth, cv2.COLOR_BGR2RGB)
    pil = Image.fromarray(rgb)
    pil = ImageEnhance.Brightness(pil).enhance(1.08)
    pil = ImageEnhance.Color(pil).enhance(1.12)
    pil = ImageEnhance.Contrast(pil).enhance(1.05)
    r, g, b = pil.split()
    pil = Image.merge("RGB", (r.point(lambda v: min(255, int(v * 1.04))), g, b))
    w, h = pil.size
    cx, cy = w / 2, h / 2
    Y, X = np.ogrid[:h, :w]
    dist = np.hypot(X - cx, Y - cy)
    factor = np.clip(1.0 - 0.30 * (dist / math.hypot(cx, cy)) ** 1.8, 0.70, 1.0)
    vig = Image.fromarray((factor * 255).astype(np.uint8), "L")
    result = Image.composite(pil, Image.new("RGB", (w, h), (240, 225, 210)), vig)
    return cv2.cvtColor(np.array(result), cv2.COLOR_RGB2BGR)


def predict_child(p1_b64: str, p2_b64: str) -> str:
    """Blend two parent images in memory and return a base64 JPEG child likeness."""
    img1, img2 = _decode(p1_b64), _decode(p2_b64)
    f1, f2 = _crop_face(img1), _crop_face(img2)
    sz = 512
    f1r = cv2.resize(f1, (sz, sz), interpolation=cv2.INTER_LANCZOS4)
    f2r = cv2.resize(f2, (sz, sz), interpolation=cv2.INTER_LANCZOS4)
    blended = cv2.addWeighted(f1r, 0.50, f2r, 0.50, 0)
    result = _childify(blended)
    ok, buf = cv2.imencode(".jpg", result, [cv2.IMWRITE_JPEG_QUALITY, 92])
    if not ok:
        raise RuntimeError("JPEG encoding failed")
    return base64.b64encode(buf).decode()