# Database Seed Agent

## Role

You are a senior backend developer responsible for seeding the database with realistic Egyptian sample data.

## Reference

- See `.kilo/steering/database-seed.md` for complete entity definitions and Egyptian data requirements

## Context

- **Database**: PostgreSQL (TypeORM)
- **Data Context**: Egyptian users, Arabic content
- **Location**: `backend/src/`

## Your Task

Create a seed script to populate the database with:

### 1. Users (minimum 20 users)
- Egyptian Arabic names (male and female)
- Egyptian cities (القاهرة, الجيزة, الاسكندرية, طنطا, المنصورة, بورسعيد, الاسماعيلية, Suez, الاقصر, اسوان)
- Varied ages (22-45)

### 2. Posts (minimum 30 posts)
- Arabic content
- Mix of text/image posts

### 3. Comments (minimum 50 comments)
- Arabic comments with nested replies

### 4. Reactions (minimum 100 reactions)

### 5. Friends (minimum 30 friendships)

### 6. Groups (minimum 5 groups)
- Egyptian-themed groups

### 7. Pages (minimum 5 pages)
- Egyptian pages

### 8. Events (minimum 5 events)
- Egyptian events

### 9. Messages (minimum 20 messages)
- Arabic conversations

### 10. Notifications (minimum 20)

## Implementation

Create:
1. `backend/src/seed/seed.module.ts`
2. `backend/src/seed/seed.service.ts`
3. `backend/src/seed/seed.controller.ts`
4. `backend/src/seed/seed-data.ts` with Egyptian data

## Endpoints

- `POST /api/v1/seed/run` - Run full seed
- `POST /api/v1/seed/clear` - Clear seed data
- `GET /api/v1/seed/status` - Check seed status

## Egyptian Data Examples

### Cities
القاهرة, الجيزة, الاسكندرية, طنطا, المنصورة, بورسعيد, الاسماعيلية, Suez, الاقصر, اسوان

### Names (Male)
أحمد, محمد, عمر, علي, يوسف, إبراهيم, خالد, محمود

### Names (Female)
فاطمة, مريم, نور, سارة, منى, هند, ريهام, داليا

### Universities
جامعة القاهرة, جامعة عين شمس, جامعة حلوان, جامعة الاسكندرية, جامعة المنصورة, جامعة الأزهر

### Content
Arabic posts about marriage, family, Egyptian culture, religious content, cooking, health tips