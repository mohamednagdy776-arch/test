/**
 * scripts/db/seed.ts
 * Seeds the database with test data for development.
 * Safe to run multiple times — checks for existing records before inserting.
 *
 * Usage: npx ts-node scripts/db/seed.ts
 */

import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: ['src/**/*.entity.ts'],
  synchronize: false,
});

async function seed() {
  await AppDataSource.initialize();
  console.log('✅ Connected to database');

  const userRepo = AppDataSource.getRepository('users');
  const profileRepo = AppDataSource.getRepository('profiles');
  const groupRepo = AppDataSource.getRepository('groups');

  // --- Seed admin user ---
  const existingAdmin = await userRepo.findOne({ where: { email: 'admin@tayyibt.com' } });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash('Admin1234', 12);
    const admin = userRepo.create({
      email: 'admin@tayyibt.com',
      phone: '+201000000000',
      passwordHash,
      accountType: 'admin',
      status: 'active',
    });
    await userRepo.save(admin);
    console.log('✅ Admin user created');
  } else {
    console.log('⏭  Admin user already exists');
  }

  // --- Seed test users ---
  const testUsers = [
    { email: 'user1@tayyibt.com', phone: '+201000000001', name: 'Ahmed Ali', age: 28, gender: 'male', country: 'EG', city: 'Cairo' },
    { email: 'user2@tayyibt.com', phone: '+201000000002', name: 'Fatima Hassan', age: 25, gender: 'female', country: 'EG', city: 'Alexandria' },
    { email: 'user3@tayyibt.com', phone: '+966500000001', name: 'Omar Khalid', age: 30, gender: 'male', country: 'SA', city: 'Riyadh' },
  ];

  for (const u of testUsers) {
    const exists = await userRepo.findOne({ where: { email: u.email } });
    if (!exists) {
      const passwordHash = await bcrypt.hash('Test1234', 12);
      const user = await userRepo.save(
        userRepo.create({ email: u.email, phone: u.phone, passwordHash, accountType: 'user', status: 'active' })
      );
      await profileRepo.save(
        profileRepo.create({ user, fullName: u.name, age: u.age, gender: u.gender, country: u.country, city: u.city })
      );
      console.log(`✅ User created: ${u.email}`);
    } else {
      console.log(`⏭  User already exists: ${u.email}`);
    }
  }

  // --- Seed test group ---
  const existingGroup = await groupRepo.findOne({ where: { name: 'General Community' } });
  if (!existingGroup) {
    const admin = await userRepo.findOne({ where: { email: 'admin@tayyibt.com' } });
    await groupRepo.save(
      groupRepo.create({ name: 'General Community', description: 'Default community group', privacy: 'public', createdBy: admin })
    );
    console.log('✅ Default group created');
  } else {
    console.log('⏭  Default group already exists');
  }

  await AppDataSource.destroy();
  console.log('✅ Seeding complete');
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
