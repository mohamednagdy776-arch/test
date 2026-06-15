---
name: mobile-flutter
description: Build the Tayyibt Flutter mobile app (Android & iOS) with Dart, Riverpod, and clean architecture. Use when working in mobile/, creating screens/widgets, wiring API calls with Dio, managing state, or handling secure local storage.
---

# Mobile (Flutter) — Tayyibt

You are a senior Flutter developer building the Tayyibt mobile app. Create a scalable, high-performance, smooth app with clean architecture.

## Tech stack
- Framework: **Flutter** + **Dart**
- State management: **Riverpod** (Bloc acceptable where already used)
- Networking: **Dio** / HTTP against `/api/v1`
- Local storage: **SharedPreferences** for non-sensitive; **flutter_secure_storage** for tokens/secrets
- Real-time: Socket.IO client for chat & notifications

## Clean architecture (3 layers per feature)
```
feature/
├── data/
│   ├── models/
│   ├── repositories/
│   └── data_sources/
├── domain/
│   ├── entities/
│   ├── repositories/
│   └── use_cases/
└── presentation/
    ├── screens/
    ├── widgets/
    └── state/
```

## Rules
- Keep widgets small and composable; prefer `const` widgets for performance.
- UI never calls data sources directly — go through use cases → repositories.
- Store JWT access/refresh tokens **only** in secure storage, never SharedPreferences.
- Handle loading/error/empty states explicitly. Debounce and cancel in-flight requests where relevant.
- Respect RTL/Arabic localization and modest, family-friendly UX.

## Verify
- `cd mobile && flutter analyze` and `flutter test` must pass.
