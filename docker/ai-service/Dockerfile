# ── Stage 1: Build ──────────────────────────────────────────────
FROM python:3.11-slim AS builder

WORKDIR /app

# Install deps into a virtual env to keep the final image clean
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# ── Stage 2: Production image ────────────────────────────────────
FROM python:3.11-slim AS runner

WORKDIR /app

ENV PATH="/opt/venv/bin:$PATH"
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

COPY --from=builder /opt/venv /opt/venv
COPY . .

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:5000/health')" || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "5000"]
