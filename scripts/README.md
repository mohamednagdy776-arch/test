# Scripts

Utility and automation scripts for the Tayyibt platform.

## Folder Structure

```
scripts/
├── db/
│   ├── seed.ts             # Seed database with test data
│   ├── migrate.ts          # Run pending DB migrations
│   └── reset.ts            # Drop and recreate DB (dev only)
├── deploy/
│   ├── deploy-staging.sh   # Deploy to staging environment
│   └── deploy-prod.sh      # Deploy to production
├── ai/
│   └── precompute-matches.ts  # Batch precompute match scores
└── utils/
    └── generate-module.sh  # Scaffold a new NestJS module
```

## Usage Examples

Seed the database:
```bash
npx ts-node scripts/db/seed.ts
```

Precompute AI matches:
```bash
npx ts-node scripts/ai/precompute-matches.ts
```

Deploy to staging:
```bash
bash scripts/deploy/deploy-staging.sh
```

## Standards

- Scripts must be idempotent where possible (safe to run multiple times)
- Never hardcode credentials — read from `.env`
- Add a comment at the top of each script explaining what it does
- Destructive scripts (reset, drop) must require explicit confirmation
- Test scripts in staging before running in production
