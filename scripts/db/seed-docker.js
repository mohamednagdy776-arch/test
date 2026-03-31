/**
 * seed-docker.js
 * Runs inside the backend Docker container.
 * Usage: docker compose cp scripts/db/seed-docker.js backend:/app/seed-docker.js
 *        docker compose exec backend node /app/seed-docker.js
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
  const profileRepo = ds.getRepository('profiles');
  const matchRepo = ds.getRepository('matches');

  // ── Users ──────────────────────────────────────────────────────
  const usersData = [
    { email: 'admin@tayyibt.com',  phone: '+201000000000', role: 'admin',   name: 'Admin',         age: 35, gender: 'male',   country: 'EG', city: 'Cairo',        education: 'master',   job: 'Platform Admin',      lifestyle: 'moderate',    sect: 'sunni', prayer: 'always' },
    { email: 'user1@tayyibt.com',  phone: '+201000000001', role: 'user',    name: 'Ahmed Ali',     age: 28, gender: 'male',   country: 'EG', city: 'Cairo',        education: 'bachelor', job: 'Software Engineer',   lifestyle: 'moderate',    sect: 'sunni', prayer: 'always' },
    { email: 'user2@tayyibt.com',  phone: '+201000000002', role: 'user',    name: 'Fatima Hassan', age: 25, gender: 'female', country: 'EG', city: 'Alexandria',   education: 'bachelor', job: 'Teacher',             lifestyle: 'conservative',sect: 'sunni', prayer: 'always' },
    { email: 'user3@tayyibt.com',  phone: '+966500000001', role: 'user',    name: 'Omar Khalid',   age: 30, gender: 'male',   country: 'SA', city: 'Riyadh',       education: 'master',   job: 'Doctor',              lifestyle: 'moderate',    sect: 'sunni', prayer: 'mostly' },
    { email: 'user4@tayyibt.com',  phone: '+971500000001', role: 'user',    name: 'Sara Ahmed',    age: 24, gender: 'female', country: 'AE', city: 'Dubai',        education: 'bachelor', job: 'Accountant',          lifestyle: 'moderate',    sect: 'sunni', prayer: 'always' },
    { email: 'user5@tayyibt.com',  phone: '+201000000005', role: 'user',    name: 'Youssef Nour',  age: 32, gender: 'male',   country: 'EG', city: 'Giza',         education: 'phd',      job: 'University Professor', lifestyle: 'conservative',sect: 'sunni', prayer: 'always' },
    { email: 'user6@tayyibt.com',  phone: '+201000000006', role: 'user',    name: 'Nour Ibrahim',  age: 26, gender: 'female', country: 'EG', city: 'Cairo',        education: 'master',   job: 'Pharmacist',          lifestyle: 'moderate',    sect: 'sunni', prayer: 'mostly' },
    { email: 'user7@tayyibt.com',  phone: '+966500000002', role: 'user',    name: 'Khalid Mansour',age: 29, gender: 'male',   country: 'SA', city: 'Jeddah',       education: 'bachelor', job: 'Business Analyst',    lifestyle: 'open',        sect: 'sunni', prayer: 'sometimes' },
    { email: 'user8@tayyibt.com',  phone: '+201000000008', role: 'user',    name: 'Mariam Saad',   age: 23, gender: 'female', country: 'EG', city: 'Mansoura',     education: 'bachelor', job: 'Nurse',               lifestyle: 'conservative',sect: 'sunni', prayer: 'always' },
    { email: 'user9@tayyibt.com',  phone: '+971500000002', role: 'user',    name: 'Tariq Hassan',  age: 31, gender: 'male',   country: 'AE', city: 'Abu Dhabi',    education: 'master',   job: 'Engineer',            lifestyle: 'moderate',    sect: 'sunni', prayer: 'always' },
    { email: 'user10@tayyibt.com', phone: '+201000000010', role: 'user',    name: 'Hana Mostafa',  age: 27, gender: 'female', country: 'EG', city: 'Cairo',        education: 'bachelor', job: 'Graphic Designer',    lifestyle: 'moderate',    sect: 'sunni', prayer: 'mostly' },
  ];

  const savedUsers = {};
  for (const u of usersData) {
    let user = await userRepo.findOne({ where: { email: u.email } });
    if (!user) {
      const hash = await bcrypt.hash(u.role === 'admin' ? 'Admin1234' : 'Test1234', 12);
      user = await userRepo.save(userRepo.create({
        email: u.email, phone: u.phone, passwordHash: hash,
        accountType: u.role, status: 'active',
      }));
      console.log(`✅ User: ${u.email}`);
    } else {
      console.log(`⏭  Exists: ${u.email}`);
    }
    savedUsers[u.email] = user;

    // Create/update profile
    let profile = await profileRepo.findOne({ where: { user: { id: user.id } } });
    if (!profile) {
      profile = profileRepo.create({
        user, fullName: u.name, age: u.age, gender: u.gender,
        country: u.country, city: u.city, socialStatus: 'single', childrenCount: 0,
        education: u.education, jobTitle: u.job, lifestyle: u.lifestyle,
        sect: u.sect, prayerLevel: u.prayer, religiousCommitment: 'committed',
        financialLevel: 'medium', culturalLevel: 'high',
        minAge: u.gender === 'male' ? 20 : 25,
        maxAge: u.gender === 'male' ? 35 : 40,
        wantsChildren: true, relocateWilling: true,
        bio: `مرحباً، أنا ${u.name}. أبحث عن شريك حياة مناسب.`,
      });
      await profileRepo.save(profile);
      console.log(`  ✅ Profile: ${u.name}`);
    }
  }

  // ── Matches ────────────────────────────────────────────────────
  // Create matches between male user1 and female users
  const matchPairs = [
    { u1: 'user1@tayyibt.com', u2: 'user2@tayyibt.com', score: 92, status: 'pending' },
    { u1: 'user1@tayyibt.com', u2: 'user4@tayyibt.com', score: 85, status: 'accepted' },
    { u1: 'user1@tayyibt.com', u2: 'user6@tayyibt.com', score: 78, status: 'pending' },
    { u1: 'user1@tayyibt.com', u2: 'user8@tayyibt.com', score: 71, status: 'rejected' },
    { u1: 'user1@tayyibt.com', u2: 'user10@tayyibt.com',score: 88, status: 'pending' },
    { u1: 'user3@tayyibt.com', u2: 'user2@tayyibt.com', score: 76, status: 'pending' },
    { u1: 'user5@tayyibt.com', u2: 'user6@tayyibt.com', score: 94, status: 'accepted' },
    { u1: 'user7@tayyibt.com', u2: 'user10@tayyibt.com',score: 65, status: 'pending' },
    { u1: 'user9@tayyibt.com', u2: 'user4@tayyibt.com', score: 83, status: 'pending' },
  ];

  for (const p of matchPairs) {
    const u1 = savedUsers[p.u1];
    const u2 = savedUsers[p.u2];
    if (!u1 || !u2) continue;

    const exists = await matchRepo.findOne({
      where: [
        { user1: { id: u1.id }, user2: { id: u2.id } },
        { user1: { id: u2.id }, user2: { id: u1.id } },
      ],
    });

    if (!exists) {
      await matchRepo.save(matchRepo.create({
        user1: u1, user2: u2, score: p.score, status: p.status,
      }));
      console.log(`✅ Match: ${p.u1.split('@')[0]} ↔ ${p.u2.split('@')[0]} (${p.score}%) [${p.status}]`);
    } else {
      console.log(`⏭  Match exists: ${p.u1.split('@')[0]} ↔ ${p.u2.split('@')[0]}`);
    }
  }

  await ds.destroy();
  console.log('\n✅ Seeding complete!');
  console.log('\n📋 Test accounts:');
  console.log('   admin@tayyibt.com  / Admin1234  (admin)');
  console.log('   user1@tayyibt.com  / Test1234   (has 5 matches)');
  console.log('   user2@tayyibt.com  / Test1234   (female)');
  console.log('   user4@tayyibt.com  / Test1234   (accepted match with user1)');
}

seed().catch((e) => { console.error('❌ Seed failed:', e.message); process.exit(1); });
