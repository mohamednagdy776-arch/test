# 04 — Backend (NestJS)

## Bootstrap

`backend/src/main.ts`:

```typescript
const app = await NestFactory.create<NestExpressApplication>(AppModule);
app.useWebSocketAdapter(new IoAdapter(app));          // Socket.IO
app.useStaticAssets(join(__dirname, '..', 'uploads'), { prefix: '/uploads/' });
app.setGlobalPrefix('api/v1');                         // all routes under /api/v1
app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
app.enableCors({ origin: true, credentials: true });
await app.listen(process.env.API_PORT || 3000);
// Swagger at /api/docs in non-production
```

Key global behaviors:
- **Global prefix** `api/v1`.
- **ValidationPipe** with `whitelist: true` (strips unknown properties) and `transform: true`.
- **CORS** reflects the request origin with credentials.
- **Static uploads** served at `/uploads/`.
- **Swagger** docs only when `NODE_ENV !== 'production'`.

---

## Root Module

`AppModule` wires:
- `ConfigModule.forRoot({ isGlobal: true })`
- `TypeOrmModule.forRoot({ type: 'postgres', url: DATABASE_URL, autoLoadEntities: true, synchronize: NODE_ENV !== 'production' || TYPEORM_SYNCHRONIZE === 'true' })`
- `ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }])` — 100 req/min
- All 25 feature modules.

> **Schema sync**: `synchronize` auto-creates tables. In production it is enabled only when `TYPEORM_SYNCHRONIZE=true` (used for the initial deploy). For ongoing changes, prefer migrations.

---

## Feature Modules

| Module | Responsibility |
|--------|----------------|
| `AuthModule` | Registration, login, JWT, refresh, 2FA, sessions, OAuth |
| `UsersModule` | Profile CRUD, avatar upload, `/users/me`, public profiles |
| `MatchingModule` | Match generation, accept/reject, AI score proxy |
| `ChatModule` | Conversations, messages, reactions, group chats (Socket.IO) |
| `FriendsModule` | Requests, suggestions, lists, blocking, restrictions |
| `PostsModule` | Posts, feed, stories, saving, sharing, scheduling |
| `CommentsModule` | Comments + threaded replies |
| `ReactionsModule` | Emoji reactions on posts |
| `GroupsModule` | Community groups + membership |
| `PagesModule` | Brand/topic pages + followers/likes |
| `EventsModule` | Events + RSVP |
| `VideosModule` | Video feed |
| `MemoriesModule` | Saved items + collections + memories |
| `NotificationsModule` | Notifications |
| `SearchModule` | Cross-entity search + autocomplete |
| `SettingsModule` | Privacy, notification, appearance, newsletter, blocks |
| `SubscriptionsModule` | Subscription tiers |
| `PaymentsModule` | Transactions |
| `AffiliatesModule` | Affiliate program |
| `ReportsModule` | User/content reports |
| `HealthModule` | `/health` endpoint |
| `SeedModule` | Database seeding |
| `ConfigModule` | App config |

---

## Authentication

`AuthModule` registers `JwtModule` with `secret: process.env.JWT_SECRET`.

**Token strategy** (`auth.service.ts` → `signTokens`):
- **Access token**: `expiresIn: process.env.JWT_EXPIRES_IN || '7d'`.
- **Refresh token**: `expiresIn: '7d'` (or `30d` with "remember me"), `type: 'refresh'`.

**Login flow**:
1. Look up user by email.
2. Check `lockedUntil` (account lock after 5 failed attempts → 15-minute lock).
3. Check `isDeactivated`.
4. `bcrypt.compare(password, passwordHash)`.
5. If 2FA enabled → return `requiresTwoFactor`.
6. Create a `sessions` row, send "new device" email, return tokens.

**Guards**: routes use `@UseGuards(AuthGuard('jwt'))` with `JwtStrategy` (Passport).

**Password hashing**: `bcryptjs`, cost factor 12 (produces `$2a$12$...` hashes).

---

## Standard Response Shape

Controllers use helpers (`ok`, `paginated`) producing:

```json
{ "success": true, "message": "Request successful", "data": { ... } }
```

Paginated endpoints wrap data with pagination metadata.

---

## Real-Time (Socket.IO)

The chat gateway handles:
- `joinConversation`, `sendMessage`, `typing`, `messageSeen`, `addReaction`.
- Broadcasts `newMessage`, typing indicators, and read receipts to conversation participants.

Message content is encrypted at rest (`content_encrypted` column).

---

## AI Integration

`MatchingService` calls the ai-service over the internal network:

```typescript
const aiResponse = await this.httpService.axiosRef.post(
  'http://ai-service:5000/api/v1/match',
  { user_a: profileA, user_b: profileB },
);
```

Profile fields are transformed from the TypeORM entity shape to the AI service schema (e.g., `prayerLevel: 'always'` → `prayer_level: 5`). On failure, scoring gracefully falls back.

---

## Rate Limiting

`ThrottlerModule` applies a global limit of **100 requests per 60 seconds** per client.

---

## Health Check

`GET /api/v1/health` (public, no auth):
```json
{ "status": "ok", "service": "backend", "timestamp": "..." }
```
Used by the Docker `HEALTHCHECK` directive and nginx upstream checks.
