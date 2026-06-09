# Tech Stack

The Tayyibt project utilizes a modern, robust, and scalable technology stack across its various services.

## Backend (API & Real-time)
- **Framework:** [NestJS](https://nestjs.com/) (TypeScript)
- **Database:** [PostgreSQL](https://www.postgresql.org/) with [TypeORM](https://typeorm.io/)
- **Caching & Queuing:** [Redis](https://redis.io/)
- **Real-time Communication:** [Socket.IO](https://socket.io/) (WebSockets)
- **Authentication:** [Passport.js](https://www.passportjs.org/) with JWT (Access & Refresh Tokens)
- **Documentation:** Swagger (OpenAPI)

## Frontend (Web & Admin)
- **Framework:** [Next.js 14](https://nextjs.org/) (React)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **State Management:** [React Query](https://tanstack.com/query/latest) (Server state) & [Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction) (Client state)
- **UI Components:** Custom components + Headless UI
- **Internationalization:** RTL support for Arabic and other languages.

## Mobile (iOS & Android)
- **Framework:** [Flutter](https://flutter.dev/) (Dart)
- **State Management:** [Riverpod](https://riverpod.dev/)
- **HTTP Client:** [Dio](https://pub.dev/packages/dio)
- **Storage:** Flutter Secure Storage (for sensitive data like tokens)
- **Architecture:** Clean Architecture (Data, Domain, Presentation layers)

## AI Service
- **Framework:** [FastAPI](https://fastapi.tiangolo.com/) (Python)
- **Machine Learning/Math:** [scikit-learn](https://scikit-learn.org/), [NumPy](https://numpy.org/)
- **API Communication:** JSON-based REST endpoints
- **Task:** Weighted compatibility scoring and feature extraction.

## Infrastructure & DevOps
- **Containerization:** [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)
- **Reverse Proxy:** [Nginx](https://www.nginx.com/) (Production)
- **CI/CD:** [GitHub Actions](https://github.com/features/actions)
- **Cloud/Hosting:** Designed for VPS deployment or cloud providers (AWS, GCP, etc.)
