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

## Setup

Install script dependencies first (one time):
```bash
cd scripts && npm install
```

## Usage Examples

Seed the database:
```bash
cd scripts && npm run seed
```

Run migrations:
```bash
cd scripts && npm run migrate
```

Reset database (dev only — requires --confirm):
```bash
cd scripts && npm run reset -- --confirm
```

Precompute AI matches:
```bash
cd scripts && npm run precompute
```

Scaffold a new NestJS module:
```bash
bash scripts/utils/generate-module.sh <module-name>
```

Deploy to staging:
```bash
bash scripts/deploy/deploy-staging.sh
```

Deploy to production:
```bash
bash scripts/deploy/deploy-prod.sh
```

## Standards

- Scripts must be idempotent where possible (safe to run multiple times)
- Never hardcode credentials — read from `.env`
- Add a comment at the top of each script explaining what it does
- Destructive scripts (reset, drop) must require explicit confirmation
- Test scripts in staging before running in production
