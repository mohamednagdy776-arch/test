/**
 * Seed script to populate the database with sample users and profiles
 * Run with: npx ts-node seed-users.ts
 * Or via Docker: docker exec -i tayyibt-kilocode-postgres-1 psql -U postgres -d tayyibt < seed.sql
 */

import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

// Sample users data
const sampleUsers = [
  {
    email: 'ahmed.hassan@test.com',
    phone: '+201001000001',
    password: 'password123',
    fullName: 'Ahmed Hassan',
    age: 28,
    gender: 'male',
    country: 'Egypt',
    city: 'Cairo',
    sect: 'Sunni',
    education: 'Bachelor\'s',
    prayerLevel: 'regular',
    lifestyle: 'moderate',
    jobTitle: 'Software Engineer',
    financialLevel: 'middle',
    culturalLevel: 'moderate',
    religiousCommitment: 'moderate',
    bio: 'Looking for a sincere partner who shares my values.',
    socialStatus: 'single',
    minAge: 22,
    maxAge: 30,
    preferredCountry: 'Egypt',
    relocateWilling: true,
    wantsChildren: true,
  },
  {
    email: 'fatima.ali@test.com',
    phone: '+201001000002',
    password: 'password123',
    fullName: 'Fatima Ali',
    age: 25,
    gender: 'female',
    country: 'Egypt',
    city: 'Alexandria',
    sect: 'Sunni',
    education: 'Master\'s',
    prayerLevel: 'always',
    lifestyle: 'conservative',
    jobTitle: 'Teacher',
    financialLevel: 'middle',
    culturalLevel: 'high',
    religiousCommitment: 'high',
    bio: 'A practicing Muslim seeking a respectful and kind partner.',
    socialStatus: 'single',
    minAge: 25,
    maxAge: 35,
    preferredCountry: 'Egypt',
    relocateWilling: false,
    wantsChildren: true,
  },
  {
    email: 'omar.khalid@test.com',
    phone: '+201001000003',
    password: 'password123',
    fullName: 'Omar Khalid',
    age: 32,
    gender: 'male',
    country: 'Saudi Arabia',
    city: 'Riyadh',
    sect: 'Sunni',
    education: 'Bachelor\'s',
    prayerLevel: 'regular',
    lifestyle: 'moderate',
    jobTitle: 'Business Owner',
    financialLevel: 'high',
    culturalLevel: 'moderate',
    religiousCommitment: 'moderate',
    bio: 'Entrepreneur looking for an educated and family-oriented partner.',
    socialStatus: 'single',
    minAge: 24,
    maxAge: 32,
    preferredCountry: 'Saudi Arabia',
    relocateWilling: true,
    wantsChildren: true,
  },
  {
    email: 'aisha.mohammed@test.com',
    phone: '+201001000004',
    password: 'password123',
    fullName: 'Aisha Mohammed',
    age: 24,
    gender: 'female',
    country: 'UAE',
    city: 'Dubai',
    sect: 'Sunni',
    education: 'Bachelor\'s',
    prayerLevel: 'always',
    lifestyle: 'moderate',
    jobTitle: 'Marketing Manager',
    financialLevel: 'middle',
    culturalLevel: 'high',
    religiousCommitment: 'high',
    bio: 'Modern Muslim woman seeking a balanced life with someone compatible.',
    socialStatus: 'single',
    minAge: 26,
    maxAge: 36,
    preferredCountry: 'UAE',
    relocateWilling: false,
    wantsChildren: true,
  },
  {
    email: 'youssef.ibrahim@test.com',
    phone: '+201001000005',
    password: 'password123',
    fullName: 'Youssef Ibrahim',
    age: 30,
    gender: 'male',
    country: 'Egypt',
    city: 'Giza',
    sect: 'Sunni',
    education: 'PhD',
    prayerLevel: 'regular',
    lifestyle: 'liberal',
    jobTitle: 'University Professor',
    financialLevel: 'middle',
    culturalLevel: 'high',
    religiousCommitment: 'moderate',
    bio: 'Academic seeking an intelligent and open-minded partner.',
    socialStatus: 'single',
    minAge: 24,
    maxAge: 32,
    preferredCountry: 'Egypt',
    relocateWilling: true,
    wantsChildren: true,
  },
  {
    email: 'mariam.saad@test.com',
    phone: '+201001000006',
    password: 'password123',
    fullName: 'Mariam Saad',
    age: 27,
    gender: 'female',
    country: 'Jordan',
    city: 'Amman',
    sect: 'Sunni',
    education: 'Bachelor\'s',
    prayerLevel: 'regular',
    lifestyle: 'moderate',
    jobTitle: 'Doctor',
    financialLevel: 'middle',
    culturalLevel: 'high',
    religiousCommitment: 'moderate',
    bio: 'Working in healthcare, looking for a caring and responsible partner.',
    socialStatus: 'single',
    minAge: 27,
    maxAge: 38,
    preferredCountry: 'Jordan',
    relocateWilling: false,
    wantsChildren: true,
  },
  {
    email: 'karim.nasser@test.com',
    phone: '+201001000007',
    password: 'password123',
    fullName: 'Karim Nasser',
    age: 29,
    gender: 'male',
    country: 'Lebanon',
    city: 'Beirut',
    sect: 'Sunni',
    education: 'Master\'s',
    prayerLevel: 'sometimes',
    lifestyle: 'liberal',
    jobTitle: 'Finance Analyst',
    financialLevel: 'middle',
    culturalLevel: 'high',
    religiousCommitment: 'low',
    bio: 'Looking for someone who appreciates modern values with traditional roots.',
    socialStatus: 'single',
    minAge: 23,
    maxAge: 30,
    preferredCountry: 'Lebanon',
    relocateWilling: true,
    wantsChildren: false,
  },
  {
    email: 'layla.ahmad@test.com',
    phone: '+201001000008',
    password: 'password123',
    fullName: 'Layla Ahmad',
    age: 26,
    gender: 'female',
    country: 'Morocco',
    city: 'Casablanca',
    sect: 'Sunni',
    education: 'Bachelor\'s',
    prayerLevel: 'always',
    lifestyle: 'conservative',
    jobTitle: 'Pharmacist',
    financialLevel: 'middle',
    culturalLevel: 'moderate',
    religiousCommitment: 'high',
    bio: 'Devout Muslim seeking a practicing husband for a halal relationship.',
    socialStatus: 'single',
    minAge: 28,
    maxAge: 38,
    preferredCountry: 'Morocco',
    relocateWilling: false,
    wantsChildren: true,
  },
  {
    email: 'tariq.mahmoud@test.com',
    phone: '+201001000009',
    password: 'password123',
    fullName: 'Tariq Mahmoud',
    age: 31,
    gender: 'male',
    country: 'Egypt',
    city: 'Cairo',
    sect: 'Sunni',
    education: 'Bachelor\'s',
    prayerLevel: 'regular',
    lifestyle: 'moderate',
    jobTitle: 'Architect',
    financialLevel: 'middle',
    culturalLevel: 'moderate',
    religiousCommitment: 'moderate',
    bio: 'Creative professional looking for a genuine connection.',
    socialStatus: 'single',
    minAge: 23,
    maxAge: 29,
    preferredCountry: 'Egypt',
    relocateWilling: true,
    wantsChildren: true,
  },
  {
    email: 'nour.hussein@test.com',
    phone: '+201001000010',
    password: 'password123',
    fullName: 'Nour Hussein',
    age: 23,
    gender: 'female',
    country: 'Saudi Arabia',
    city: 'Jeddah',
    sect: 'Sunni',
    education: 'Master\'s',
    prayerLevel: 'always',
    lifestyle: 'conservative',
    jobTitle: 'Law Student',
    financialLevel: 'middle',
    culturalLevel: 'high',
    religiousCommitment: 'high',
    bio: 'Ambitious and faithful, seeking a supportive partner for life.',
    socialStatus: 'single',
    minAge: 25,
    maxAge: 32,
    preferredCountry: 'Saudi Arabia',
    relocateWilling: false,
    wantsChildren: true,
  },
  {
    email: 'hassan.ali@test.com',
    phone: '+201001000011',
    password: 'password123',
    fullName: 'Hassan Ali',
    age: 27,
    gender: 'male',
    country: 'Egypt',
    city: 'Cairo',
    sect: 'Sunni',
    education: 'Bachelor\'s',
    prayerLevel: 'always',
    lifestyle: 'conservative',
    jobTitle: 'Engineer',
    financialLevel: 'middle',
    culturalLevel: 'moderate',
    religiousCommitment: 'high',
    bio: 'Religious and family-oriented man seeking a pious wife.',
    socialStatus: 'single',
    minAge: 20,
    maxAge: 26,
    preferredCountry: 'Egypt',
    relocateWilling: true,
    wantsChildren: true,
  },
  {
    email: 'sara.khalid@test.com',
    phone: '+201001000012',
    password: 'password123',
    fullName: 'Sara Khalid',
    age: 29,
    gender: 'female',
    country: 'UAE',
    city: 'Abu Dhabi',
    sect: 'Sunni',
    education: 'Master\'s',
    prayerLevel: 'regular',
    lifestyle: 'moderate',
    jobTitle: 'HR Manager',
    financialLevel: 'high',
    culturalLevel: 'high',
    religiousCommitment: 'moderate',
    bio: 'Professional woman looking for a well-educated and kind-hearted partner.',
    socialStatus: 'single',
    minAge: 28,
    maxAge: 38,
    preferredCountry: 'UAE',
    relocateWilling: false,
    wantsChildren: true,
  },
  {
    email: 'mohamed.rashid@test.com',
    phone: '+201001000013',
    password: 'password123',
    fullName: 'Mohamed Rashid',
    age: 33,
    gender: 'male',
    country: 'Qatar',
    city: 'Doha',
    sect: 'Sunni',
    education: 'PhD',
    prayerLevel: 'always',
    lifestyle: 'moderate',
    jobTitle: 'Researcher',
    financialLevel: 'high',
    culturalLevel: 'high',
    religiousCommitment: 'high',
    bio: 'Well-educated professional seeking a compatible life partner.',
    socialStatus: 'single',
    minAge: 24,
    maxAge: 32,
    preferredCountry: 'Qatar',
    relocateWilling: true,
    wantsChildren: true,
  },
  {
    email: 'huda.saleh@test.com',
    phone: '+201001000014',
    password: 'password123',
    fullName: 'Huda Saleh',
    age: 25,
    gender: 'female',
    country: 'Kuwait',
    city: 'Kuwait City',
    sect: 'Sunni',
    education: 'Bachelor\'s',
    prayerLevel: 'regular',
    lifestyle: 'moderate',
    jobTitle: 'Graphic Designer',
    financialLevel: 'middle',
    culturalLevel: 'moderate',
    religiousCommitment: 'moderate',
    bio: 'Creative and caring, looking for someone with similar values.',
    socialStatus: 'single',
    minAge: 25,
    maxAge: 33,
    preferredCountry: 'Kuwait',
    relocateWilling: true,
    wantsChildren: true,
  },
  {
    email: 'ali.hassan@test.com',
    phone: '+201001000015',
    password: 'password123',
    fullName: 'Ali Hassan',
    age: 30,
    gender: 'male',
    country: 'Egypt',
    city: 'Alexandria',
    sect: 'Sunni',
    education: 'Bachelor\'s',
    prayerLevel: 'regular',
    lifestyle: 'moderate',
    jobTitle: 'Dentist',
    financialLevel: 'high',
    culturalLevel: 'moderate',
    religiousCommitment: 'moderate',
    bio: 'Healthcare professional seeking a loving and supportive partner.',
    socialStatus: 'single',
    minAge: 22,
    maxAge: 28,
    preferredCountry: 'Egypt',
    relocateWilling: true,
    wantsChildren: true,
  },
];

async function seedDatabase() {
  console.log('Starting database seed...\n');

  // Create data source using environment variable
  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/tayyibt',
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('✓ Connected to database');

    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();

    let usersCreated = 0;
    let profilesCreated = 0;

    for (const userData of sampleUsers) {
      // Check if user already exists
      const existingUser = await queryRunner.query(
        'SELECT id FROM users WHERE email = $1 OR phone = $2',
        [userData.email, userData.phone]
      );

      if (existingUser.length > 0) {
        console.log(`⚠ User ${userData.email} already exists, skipping...`);
        continue;
      }

      // Hash password
      const passwordHash = await bcrypt.hash(userData.password, 10);

      // Insert user
      const userResult = await queryRunner.query(
        `INSERT INTO users (email, phone, password_hash, account_type, status, created_at)
         VALUES ($1, $2, $3, 'user', 'active', NOW())
         RETURNING id`,
        [userData.email, userData.phone, passwordHash]
      );

      const userId = userResult[0].id;
      usersCreated++;

      // Insert profile
      await queryRunner.query(
        `INSERT INTO profiles (
          user_id, full_name, age, gender, country, city, sect,
          education, job_title, financial_level, cultural_level, lifestyle,
          prayer_level, religious_commitment, bio, social_status,
          min_age, max_age, preferred_country, relocate_willing, wants_children, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, NOW())`,
        [
          userId,
          userData.fullName,
          userData.age,
          userData.gender,
          userData.country,
          userData.city,
          userData.sect,
          userData.education,
          userData.jobTitle,
          userData.financialLevel,
          userData.culturalLevel,
          userData.lifestyle,
          userData.prayerLevel,
          userData.religiousCommitment,
          userData.bio,
          userData.socialStatus,
          userData.minAge,
          userData.maxAge,
          userData.preferredCountry,
          userData.relocateWilling,
          userData.wantsChildren,
        ]
      );

      profilesCreated++;
      console.log(`✓ Created user: ${userData.fullName} (${userData.email})`);
    }

    await queryRunner.release();

    console.log('\n=== Seed Summary ===');
    console.log(`Users created: ${usersCreated}`);
    console.log(`Profiles created: ${profilesCreated}`);
    console.log(`Total users in database: ${sampleUsers.length}`);
    console.log('\n✓ Seed completed successfully!');

  } catch (error) {
    console.error('✗ Error seeding database:', error);
    throw error;
  } finally {
    await dataSource.destroy();
  }
}

seedDatabase().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
