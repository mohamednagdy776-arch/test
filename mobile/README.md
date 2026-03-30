# Mobile App

Flutter mobile application for Android and iOS.

## Stack

- Framework: Flutter
- Language: Dart
- State: Riverpod or Bloc
- HTTP: Dio
- Storage: FlutterSecureStorage (tokens), SharedPreferences (settings)

## Folder Structure

```
mobile/
├── lib/
│   ├── core/               # App-wide utilities
│   │   ├── api/            # Dio client, interceptors
│   │   ├── constants/      # App constants, routes, theme
│   │   ├── errors/         # Failure classes, error handling
│   │   └── utils/          # Helpers and extensions
│   ├── features/           # Feature modules (Clean Architecture)
│   │   ├── auth/
│   │   ├── profile/
│   │   ├── matching/
│   │   ├── chat/
│   │   ├── groups/
│   │   ├── posts/
│   │   └── notifications/
│   └── main.dart           # App entry point
├── test/                   # Unit and widget tests
├── assets/                 # Images, fonts, icons
├── pubspec.yaml
└── README.md
```

## Feature Folder Structure (Clean Architecture)

Each feature must follow 3 layers:

```
feature/
├── data/
│   ├── models/             # JSON serialization
│   ├── repositories/       # Implements domain contracts
│   └── data_sources/       # Remote (API) and local (cache)
├── domain/
│   ├── entities/           # Pure business objects
│   ├── repositories/       # Abstract contracts
│   └── use_cases/          # Single-responsibility business actions
└── presentation/
    ├── screens/            # Full page widgets
    ├── widgets/            # Reusable UI pieces
    └── state/              # Riverpod providers or Bloc
```

## Standards

- Never mix UI with business logic
- Use Dio interceptors for auth token injection and refresh
- Store tokens in FlutterSecureStorage only
- Follow `coding-standards.md`
