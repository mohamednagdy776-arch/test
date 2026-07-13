# ── Stage 1: Build ──────────────────────────────────────────────
FROM python:3.11 AS builder

WORKDIR /app/ai-service

RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY ai-service/requirements.txt ./
# CPU-only torch first (saves ~1.5 GB vs full wheel)
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu
RUN pip install --no-cache-dir -r requirements.txt

# ── Stage 2: Production image ────────────────────────────────────
FROM python:3.11 AS runner

WORKDIR /app/ai-service

ENV PATH="/opt/venv/bin:$PATH"
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV HF_HOME=/app/model-cache

COPY --from=builder /opt/venv /opt/venv
COPY ai-service/ .

# Bake the diffusion weights into the image at build time (network access
# available here) instead of relying on a runtime-populated named volume --
# a named volume only seeds from image content the very first time it's
# created, so once it exists on the host, redeploys with an updated image
# never actually refresh what's inside it. That mismatch (#387) previously
# left this model missing at runtime while the app assumed it was cached.
RUN python -c "from diffusers import AutoPipelineForImage2Image; import torch; AutoPipelineForImage2Image.from_pretrained('SimianLuo/LCM_Dreamshaper_v7', cache_dir='/app/model-cache', torch_dtype=torch.float32, safety_checker=None, requires_safety_checker=False)"

# Model weights are now baked into this image layer; from_pretrained()
# otherwise tries to reach huggingface.co on every call to check for a newer
# revision even with a populated cache, hanging/erroring after several
# minutes if that egress is slow or blocked at runtime (#387). Force
# local-cache-only so it never touches the network for this at request time.
ENV HF_HUB_OFFLINE=1

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:5000/health')" || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "5000"]
