/**
 * scripts/db/migrate.ts
 * Runs all pending TypeORM migrations.
 * Safe to run multiple times — skips already-applied migrations.
 *
 * Usage: npx ts-node scripts/db/migrate.ts
 */

import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
});

async function migrate() {
  await AppDataSource.initialize();
  console.log('✅ Connected to database');

  const pending = await AppDataSource.showMigrations();
  if (!pending) {
    console.log('✅ No pending migrations');
    await AppDataSource.destroy();
    return;
  }

  console.log('⏳ Running pending migrations...');
  await AppDataSource.runMigrations({ transaction: 'all' });
  console.log('✅ Migrations complete');

  await AppDataSource.destroy();
}

migrate().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
