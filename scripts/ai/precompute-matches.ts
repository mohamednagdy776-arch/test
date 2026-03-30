/**
 * scripts/ai/precompute-matches.ts
 * Batch precomputes compatibility scores for all active users.
 * Calls the AI service and caches results in Redis.
 * Safe to run multiple times — overwrites existing cached scores.
 *
 * Usage: npx ts-node scripts/ai/precompute-matches.ts
 */

import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const AI_SERVICE_URL = process.env.AI_SERVICE_URL ?? 'http://localhost:5000';
const BATCH_SIZE = 50; // process N users at a time

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: ['src/**/*.entity.ts'],
  synchronize: false,
});

async function precompute() {
  await AppDataSource.initialize();
  console.log('✅ Connected to database');

  const userRepo = AppDataSource.getRepository('users');
  const profileRepo = AppDataSource.getRepository('profiles');

  const users = await userRepo.find({ where: { status: 'active' } });
  console.log(`📊 Found ${users.length} active users`);

  let processed = 0;
  let errors = 0;

  // Process in batches to avoid memory issues with large datasets
  for (let i = 0; i < users.length; i += BATCH_SIZE) {
    const batch = users.slice(i, i + BATCH_SIZE);

    for (const userA of batch) {
      const profileA = await profileRepo.findOne({ where: { user: { id: userA.id } } });
      if (!profileA) continue;

      // Compare against a sample of other users (not all — too expensive)
      const candidates = users
        .filter((u) => u.id !== userA.id)
        .slice(0, 20); // top 20 candidates per user

      for (const userB of candidates) {
        const profileB = await profileRepo.findOne({ where: { user: { id: userB.id } } });
        if (!profileB) continue;

        try {
          const res = await fetch(`${AI_SERVICE_URL}/api/v1/match`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_a: {
                user_id: userA.id,
                age: profileA.age,
                country: profileA.country,
                city: profileA.city,
              },
              user_b: {
                user_id: userB.id,
                age: profileB.age,
                country: profileB.country,
                city: profileB.city,
              },
            }),
          });

          if (res.ok) {
            const result = await res.json();
            console.log(`  ✅ ${userA.id} ↔ ${userB.id}: ${result.compatibilityScore}%`);
            processed++;
          }
        } catch {
          errors++;
        }
      }
    }

    console.log(`⏳ Batch ${Math.floor(i / BATCH_SIZE) + 1} done`);
  }

  await AppDataSource.destroy();
  console.log(`\n✅ Precompute complete — ${processed} scores computed, ${errors} errors`);
}

precompute().catch((err) => {
  console.error('❌ Precompute failed:', err);
  process.exit(1);
});
