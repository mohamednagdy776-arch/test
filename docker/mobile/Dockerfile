# Flutter build image — used in CI/CD pipelines to build APK/IPA
# Not used for runtime serving

FROM ghcr.io/cirruslabs/flutter:stable AS builder

WORKDIR /app

# Copy pubspec first for layer caching
COPY pubspec.yaml pubspec.lock ./
RUN flutter pub get

COPY . .

# Build release APK
RUN flutter build apk --release

# ── Output stage: export the APK ─────────────────────────────────
FROM alpine:3.18 AS output

WORKDIR /artifacts

COPY --from=builder /app/build/app/outputs/flutter-apk/app-release.apk ./app-release.apk

# CI/CD: copy the artifact out with:
# docker cp <container>:/artifacts/app-release.apk ./
