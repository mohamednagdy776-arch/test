/**
 * scripts/db/reset.ts
 * Drops and recreates all database tables. DEV ONLY.
 * Requires explicit confirmation — will NOT run without it.
 *
 * Usage: npx ts-node scripts/db/reset.ts --confirm
 */

import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

// Safety guard — must pass --confirm flag
if (!process.argv.includes('--confirm')) {
  console.error('❌ This will DESTROY all data. Run with --confirm to proceed.');
  process.exit(1);
}

if (process.env.NODE_ENV === 'production') {
  console.error('❌ reset.ts must NEVER run in production.');
  process.exit(1);
}

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: ['src/**/*.entity.ts'],
  synchronize: false,
});

async function reset() {
  await AppDataSource.initialize();
  console.log('✅ Connected to database');

  console.log('⚠️  Dropping all tables...');
  await AppDataSource.dropDatabase();
  console.log('✅ Database dropped');

  console.log('⏳ Recreating schema...');
  await AppDataSource.synchronize();
  console.log('✅ Schema recreated');

  await AppDataSource.destroy();
  console.log('✅ Reset complete. Run seed.ts to populate test data.');
}

reset().catch((err) => {
  console.error('❌ Reset failed:', err);
  process.exit(1);
});
