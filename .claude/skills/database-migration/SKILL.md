---
name: database-migration
description: Safe PostgreSQL schema changes for Tayyibt production — TypeORM entity updates, raw ALTER TABLE migrations, zero-downtime patterns. Use when adding columns, changing types, adding indexes, or modifying any database schema while TypeORM synchronize is off.
---

# Database Migration — Tayyibt Production

## CRITICAL RULE
`synchronize: false` is set in production TypeORM config.  
**The ORM will never auto-apply schema changes.** Every change requires an explicit `ALTER TABLE` run on the VPS.

## Workflow for every schema change

### 1. Update the TypeORM entity
Edit the entity file in `backend/src/**/*.entity.ts` with the new column/relation.

### 2. Write the raw SQL migration
Never rely on ORM to generate production SQL. Write it yourself:

```sql
-- Adding a nullable column (safe, zero-downtime)
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "profile_score" DECIMAL(5,2);

-- Adding a NOT NULL column with a default (safe)
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_verified" BOOLEAN NOT NULL DEFAULT false;

-- Adding an index concurrently (zero-downtime, no table lock)
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_users_referral_code" ON "users"("referral_code");

-- Renaming a column (use 2 deploys: add new → backfill → drop old)
ALTER TABLE "users" ADD COLUMN "full_name" VARCHAR(255);
UPDATE "users" SET "full_name" = CONCAT("first_name", ' ', "last_name");
-- (deploy) then in next migration:
-- ALTER TABLE "users" DROP COLUMN "first_name", DROP COLUMN "last_name";
```

### 3. Run on VPS
```bash
ssh -i ~/.ssh/id_tayyibt root@145.14.158.100 \
  "docker exec tayyibt-db psql -U postgres -d tayyibt -c \"<SQL HERE>\""
```

For multi-statement migrations, pipe a file:
```bash
scp -i ~/.ssh/id_tayyibt migration.sql root@145.14.158.100:/tmp/
ssh -i ~/.ssh/id_tayyibt root@145.14.158.100 \
  "docker exec -i tayyibt-db psql -U postgres -d tayyibt < /tmp/migration.sql"
```

### 4. Verify
```bash
ssh -i ~/.ssh/id_tayyibt root@145.14.158.100 \
  "docker exec tayyibt-db psql -U postgres -d tayyibt -c \"\d <table_name>\""
```

## Zero-downtime patterns

| Change | Safe approach |
|--------|--------------|
| Add nullable column | `ADD COLUMN` directly |
| Add NOT NULL column | Add nullable → backfill → add constraint |
| Drop column | Mark unused in code first, drop on next deploy |
| Rename column | Add new → backfill → swap code → drop old |
| Change column type | New column → backfill → swap → drop old |
| Add index | `CREATE INDEX CONCURRENTLY` |
| Add unique constraint | `CREATE UNIQUE INDEX CONCURRENTLY` then `ADD CONSTRAINT USING INDEX` |

## TypeORM column decorators → SQL types
| TypeORM | PostgreSQL |
|---------|-----------|
| `@Column()` string | `VARCHAR(255)` |
| `@Column('text')` | `TEXT` |
| `@Column('int')` | `INTEGER` |
| `@Column('decimal', {precision:10, scale:2})` | `DECIMAL(10,2)` |
| `@Column('boolean')` | `BOOLEAN` |
| `@Column('timestamp')` | `TIMESTAMP WITH TIME ZONE` |
| `@Column('jsonb')` | `JSONB` |
| `@CreateDateColumn()` | `TIMESTAMP WITH TIME ZONE DEFAULT NOW()` |
| `@ManyToOne` FK | `INTEGER` + `FOREIGN KEY REFERENCES` |

## After migration
1. Restart the backend container: `docker compose ... restart backend`
2. Check logs for TypeORM connection errors: `docker compose ... logs --tail=50 backend`
3. Hit the affected API endpoint to confirm the column is live
