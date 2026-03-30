/**
 * seed-docker.js
 * Runs inside the backend Docker container.
 * Usage: docker compose exec backend node /tmp/seed-docker.js
 */
const { DataSource } = require('typeorm');
const bcrypt = require('bcrypt');

const ds = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: ['dist/**/*.entity.js'],
  synchronize: false,
});

async function seed() {
  await ds.initialize();
  console.log('✅ Connected to database');

  const userRepo = ds.getRepository('users');

  // Admin user
  const adminExists = await userRepo.findOne({ where: { email: 'admin@tayyibt.com' } });
  if (!adminExists) {
    const hash = await bcrypt.hash('Admin1234', 12);
    await userRepo.save(userRepo.create({
      email: 'admin@tayyibt.com',
      phone: '+201000000000',
      passwordHash: hash,
      accountType: 'admin',
      status: 'active',
    }));
    console.log('✅ Admin created: admin@tayyibt.com / Admin1234');
  } else {
    console.log('⏭  Admin already exists');
  }

  // Test users
  const testUsers = [
    { email: 'user1@tayyibt.com', phone: '+201000000001' },
    { email: 'user2@tayyibt.com', phone: '+201000000002' },
    { email: 'user3@tayyibt.com', phone: '+966500000001' },
  ];

  for (const u of testUsers) {
    const exists = await userRepo.findOne({ where: { email: u.email } });
    if (!exists) {
      const hash = await bcrypt.hash('Test1234', 12);
      await userRepo.save(userRepo.create({
        ...u,
        passwordHash: hash,
        accountType: 'user',
        status: 'active',
      }));
      console.log('✅ Created: ' + u.email);
    } else {
      console.log('⏭  Exists: ' + u.email);
    }
  }

  await ds.destroy();
  console.log('✅ Seeding complete');
}

seed().catch(e => {
  console.error('❌ Seed failed:', e.message);
  process.exit(1);
});
