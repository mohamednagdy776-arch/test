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

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:5000/health')" || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "5000"]
