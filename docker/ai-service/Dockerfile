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
#
# Use snapshot_download() (not from_pretrained()) to fetch: it downloads
# every file in the repo and raises if the local cache ends up incomplete.
# from_pretrained() was tried first here previously and silently produced a
# PARTIAL cache (build succeeded, but 17 files including the actual weights
# were missing) because constructing the pipeline object doesn't require
# every file to be present up front -- it only surfaces missing files when
# something actually reads them, which is exactly what made this so hard to
# catch. Immediately re-load with local_files_only=True afterward as a hard
# verification gate: this is the exact call the live app makes, so if the
# build succeeds, the runtime path is guaranteed to work too.
RUN rm -rf /app/model-cache && python -c "\
from huggingface_hub import snapshot_download; \
snapshot_download('SimianLuo/LCM_Dreamshaper_v7', cache_dir='/app/model-cache'); \
from diffusers import AutoPipelineForImage2Image; \
import torch; \
AutoPipelineForImage2Image.from_pretrained('SimianLuo/LCM_Dreamshaper_v7', cache_dir='/app/model-cache', torch_dtype=torch.float32, safety_checker=None, requires_safety_checker=False, local_files_only=True); \
print('model cache verified complete')"

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
