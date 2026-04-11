-- Seed script for Tayyibt database
-- Run with: docker exec -i tayyibt-kilocode-postgres-1 psql -U postgres -d tayyibt < seed.sql

-- Disable triggers temporarily for seeding
ALTER TABLE profiles DISABLE TRIGGER ALL;
ALTER TABLE users DISABLE TRIGGER ALL;

-- Insert sample users (password: password123 hashed with bcrypt cost 12)
INSERT INTO users (id, email, phone, password_hash, account_type, status, created_at) VALUES
  (gen_random_uuid(), 'ahmed.hassan@test.com', '+201001000001', '$2b$12$PgdVH.7CmqaAflur2IeVxeKIiTaerwF7i8TiV4.ZHd9y6GieFH2EG', 'user', 'active', NOW()),
  (gen_random_uuid(), 'fatima.ali@test.com', '+201001000002', '$2b$12$PgdVH.7CmqaAflur2IeVxeKIiTaerwF7i8TiV4.ZHd9y6GieFH2EG', 'user', 'active', NOW()),
  (gen_random_uuid(), 'omar.khalid@test.com', '+201001000003', '$2b$12$PgdVH.7CmqaAflur2IeVxeKIiTaerwF7i8TiV4.ZHd9y6GieFH2EG', 'user', 'active', NOW()),
  (gen_random_uuid(), 'aisha.mohammed@test.com', '+201001000004', '$2b$12$PgdVH.7CmqaAflur2IeVxeKIiTaerwF7i8TiV4.ZHd9y6GieFH2EG', 'user', 'active', NOW()),
  (gen_random_uuid(), 'youssef.ibrahim@test.com', '+201001000005', '$2b$12$PgdVH.7CmqaAflur2IeVxeKIiTaerwF7i8TiV4.ZHd9y6GieFH2EG', 'user', 'active', NOW()),
  (gen_random_uuid(), 'mariam.saad@test.com', '+201001000006', '$2b$12$PgdVH.7CmqaAflur2IeVxeKIiTaerwF7i8TiV4.ZHd9y6GieFH2EG', 'user', 'active', NOW()),
  (gen_random_uuid(), 'karim.nasser@test.com', '+201001000007', '$2b$12$PgdVH.7CmqaAflur2IeVxeKIiTaerwF7i8TiV4.ZHd9y6GieFH2EG', 'user', 'active', NOW()),
  (gen_random_uuid(), 'layla.ahmad@test.com', '+201001000008', '$2b$12$PgdVH.7CmqaAflur2IeVxeKIiTaerwF7i8TiV4.ZHd9y6GieFH2EG', 'user', 'active', NOW()),
  (gen_random_uuid(), 'tariq.mahmoud@test.com', '+201001000009', '$2b$12$PgdVH.7CmqaAflur2IeVxeKIiTaerwF7i8TiV4.ZHd9y6GieFH2EG', 'user', 'active', NOW()),
  (gen_random_uuid(), 'nour.hussein@test.com', '+201001000010', '$2b$12$PgdVH.7CmqaAflur2IeVxeKIiTaerwF7i8TiV4.ZHd9y6GieFH2EG', 'user', 'active', NOW()),
  (gen_random_uuid(), 'hassan.ali@test.com', '+201001000011', '$2b$12$PgdVH.7CmqaAflur2IeVxeKIiTaerwF7i8TiV4.ZHd9y6GieFH2EG', 'user', 'active', NOW()),
  (gen_random_uuid(), 'sara.khalid@test.com', '+201001000012', '$2b$12$PgdVH.7CmqaAflur2IeVxeKIiTaerwF7i8TiV4.ZHd9y6GieFH2EG', 'user', 'active', NOW()),
  (gen_random_uuid(), 'mohamed.rashid@test.com', '+201001000013', '$2b$12$PgdVH.7CmqaAflur2IeVxeKIiTaerwF7i8TiV4.ZHd9y6GieFH2EG', 'user', 'active', NOW()),
  (gen_random_uuid(), 'huda.saleh@test.com', '+201001000014', '$2b$12$PgdVH.7CmqaAflur2IeVxeKIiTaerwF7i8TiV4.ZHd9y6GieFH2EG', 'user', 'active', NOW()),
  (gen_random_uuid(), 'ali.hassan@test.com', '+201001000015', '$2b$12$PgdVH.7CmqaAflur2IeVxeKIiTaerwF7i8TiV4.ZHd9y6GieFH2EG', 'user', 'active', NOW())
ON CONFLICT (email) DO NOTHING;

-- Insert profiles for each user
DO $$
DECLARE
  u RECORD;
  profile_data RECORD;
BEGIN
  -- Clear existing seed profiles first
  DELETE FROM profiles WHERE user_id IN (
    SELECT id FROM users WHERE email LIKE '%@test.com'
  );
  
  -- Create profile data array
  FOR u IN SELECT id, email FROM users WHERE email LIKE '%@test.com' AND status = 'active'
  LOOP
    -- Map users to their profile data
    IF u.email = 'ahmed.hassan@test.com' THEN
      INSERT INTO profiles (user_id, full_name, age, gender, country, city, sect, education, job_title, financial_level, cultural_level, lifestyle, prayer_level, religious_commitment, bio, social_status, min_age, max_age, preferred_country, relocate_willing, wants_children, created_at)
      VALUES (u.id, 'Ahmed Hassan', 28, 'male', 'Egypt', 'Cairo', 'Sunni', 'Bachelor''s', 'Software Engineer', 'middle', 'moderate', 'moderate', 'regular', 'moderate', 'Looking for a sincere partner who shares my values.', 'single', 22, 30, 'Egypt', true, true, NOW());
    ELSIF u.email = 'fatima.ali@test.com' THEN
      INSERT INTO profiles (user_id, full_name, age, gender, country, city, sect, education, job_title, financial_level, cultural_level, lifestyle, prayer_level, religious_commitment, bio, social_status, min_age, max_age, preferred_country, relocate_willing, wants_children, created_at)
      VALUES (u.id, 'Fatima Ali', 25, 'female', 'Egypt', 'Alexandria', 'Sunni', 'Master''s', 'Teacher', 'middle', 'high', 'conservative', 'always', 'high', 'A practicing Muslim seeking a respectful and kind partner.', 'single', 25, 35, 'Egypt', false, true, NOW());
    ELSIF u.email = 'omar.khalid@test.com' THEN
      INSERT INTO profiles (user_id, full_name, age, gender, country, city, sect, education, job_title, financial_level, cultural_level, lifestyle, prayer_level, religious_commitment, bio, social_status, min_age, max_age, preferred_country, relocate_willing, wants_children, created_at)
      VALUES (u.id, 'Omar Khalid', 32, 'male', 'Saudi Arabia', 'Riyadh', 'Sunni', 'Bachelor''s', 'Business Owner', 'high', 'moderate', 'moderate', 'regular', 'moderate', 'Entrepreneur looking for an educated and family-oriented partner.', 'single', 24, 32, 'Saudi Arabia', true, true, NOW());
    ELSIF u.email = 'aisha.mohammed@test.com' THEN
      INSERT INTO profiles (user_id, full_name, age, gender, country, city, sect, education, job_title, financial_level, cultural_level, lifestyle, prayer_level, religious_commitment, bio, social_status, min_age, max_age, preferred_country, relocate_willing, wants_children, created_at)
      VALUES (u.id, 'Aisha Mohammed', 24, 'female', 'UAE', 'Dubai', 'Sunni', 'Bachelor''s', 'Marketing Manager', 'middle', 'high', 'moderate', 'always', 'high', 'Modern Muslim woman seeking a balanced life with someone compatible.', 'single', 26, 36, 'UAE', false, true, NOW());
    ELSIF u.email = 'youssef.ibrahim@test.com' THEN
      INSERT INTO profiles (user_id, full_name, age, gender, country, city, sect, education, job_title, financial_level, cultural_level, lifestyle, prayer_level, religious_commitment, bio, social_status, min_age, max_age, preferred_country, relocate_willing, wants_children, created_at)
      VALUES (u.id, 'Youssef Ibrahim', 30, 'male', 'Egypt', 'Giza', 'Sunni', 'PhD', 'University Professor', 'middle', 'high', 'liberal', 'regular', 'moderate', 'Academic seeking an intelligent and open-minded partner.', 'single', 24, 32, 'Egypt', true, true, NOW());
    ELSIF u.email = 'mariam.saad@test.com' THEN
      INSERT INTO profiles (user_id, full_name, age, gender, country, city, sect, education, job_title, financial_level, cultural_level, lifestyle, prayer_level, religious_commitment, bio, social_status, min_age, max_age, preferred_country, relocate_willing, wants_children, created_at)
      VALUES (u.id, 'Mariam Saad', 27, 'female', 'Jordan', 'Amman', 'Sunni', 'Bachelor''s', 'Doctor', 'middle', 'high', 'moderate', 'regular', 'moderate', 'Working in healthcare, looking for a caring and responsible partner.', 'single', 27, 38, 'Jordan', false, true, NOW());
    ELSIF u.email = 'karim.nasser@test.com' THEN
      INSERT INTO profiles (user_id, full_name, age, gender, country, city, sect, education, job_title, financial_level, cultural_level, lifestyle, prayer_level, religious_commitment, bio, social_status, min_age, max_age, preferred_country, relocate_willing, wants_children, created_at)
      VALUES (u.id, 'Karim Nasser', 29, 'male', 'Lebanon', 'Beirut', 'Sunni', 'Master''s', 'Finance Analyst', 'middle', 'high', 'liberal', 'sometimes', 'low', 'Looking for someone who appreciates modern values with traditional roots.', 'single', 23, 30, 'Lebanon', true, false, NOW());
    ELSIF u.email = 'layla.ahmad@test.com' THEN
      INSERT INTO profiles (user_id, full_name, age, gender, country, city, sect, education, job_title, financial_level, cultural_level, lifestyle, prayer_level, religious_commitment, bio, social_status, min_age, max_age, preferred_country, relocate_willing, wants_children, created_at)
      VALUES (u.id, 'Layla Ahmad', 26, 'female', 'Morocco', 'Casablanca', 'Sunni', 'Bachelor''s', 'Pharmacist', 'middle', 'moderate', 'conservative', 'always', 'high', 'Devout Muslim seeking a practicing husband for a halal relationship.', 'single', 28, 38, 'Morocco', false, true, NOW());
    ELSIF u.email = 'tariq.mahmoud@test.com' THEN
      INSERT INTO profiles (user_id, full_name, age, gender, country, city, sect, education, job_title, financial_level, cultural_level, lifestyle, prayer_level, religious_commitment, bio, social_status, min_age, max_age, preferred_country, relocate_willing, wants_children, created_at)
      VALUES (u.id, 'Tariq Mahmoud', 31, 'male', 'Egypt', 'Cairo', 'Sunni', 'Bachelor''s', 'Architect', 'middle', 'moderate', 'moderate', 'regular', 'moderate', 'Creative professional looking for a genuine connection.', 'single', 23, 29, 'Egypt', true, true, NOW());
    ELSIF u.email = 'nour.hussein@test.com' THEN
      INSERT INTO profiles (user_id, full_name, age, gender, country, city, sect, education, job_title, financial_level, cultural_level, lifestyle, prayer_level, religious_commitment, bio, social_status, min_age, max_age, preferred_country, relocate_willing, wants_children, created_at)
      VALUES (u.id, 'Nour Hussein', 23, 'female', 'Saudi Arabia', 'Jeddah', 'Sunni', 'Master''s', 'Law Student', 'middle', 'high', 'conservative', 'always', 'high', 'Ambitious and faithful, seeking a supportive partner for life.', 'single', 25, 32, 'Saudi Arabia', false, true, NOW());
    ELSIF u.email = 'hassan.ali@test.com' THEN
      INSERT INTO profiles (user_id, full_name, age, gender, country, city, sect, education, job_title, financial_level, cultural_level, lifestyle, prayer_level, religious_commitment, bio, social_status, min_age, max_age, preferred_country, relocate_willing, wants_children, created_at)
      VALUES (u.id, 'Hassan Ali', 27, 'male', 'Egypt', 'Cairo', 'Sunni', 'Bachelor''s', 'Engineer', 'middle', 'moderate', 'conservative', 'always', 'high', 'Religious and family-oriented man seeking a pious wife.', 'single', 20, 26, 'Egypt', true, true, NOW());
    ELSIF u.email = 'sara.khalid@test.com' THEN
      INSERT INTO profiles (user_id, full_name, age, gender, country, city, sect, education, job_title, financial_level, cultural_level, lifestyle, prayer_level, religious_commitment, bio, social_status, min_age, max_age, preferred_country, relocate_willing, wants_children, created_at)
      VALUES (u.id, 'Sara Khalid', 29, 'female', 'UAE', 'Abu Dhabi', 'Sunni', 'Master''s', 'HR Manager', 'high', 'high', 'moderate', 'regular', 'moderate', 'Professional woman looking for a well-educated and kind-hearted partner.', 'single', 28, 38, 'UAE', false, true, NOW());
    ELSIF u.email = 'mohamed.rashid@test.com' THEN
      INSERT INTO profiles (user_id, full_name, age, gender, country, city, sect, education, job_title, financial_level, cultural_level, lifestyle, prayer_level, religious_commitment, bio, social_status, min_age, max_age, preferred_country, relocate_willing, wants_children, created_at)
      VALUES (u.id, 'Mohamed Rashid', 33, 'male', 'Qatar', 'Doha', 'Sunni', 'PhD', 'Researcher', 'high', 'high', 'moderate', 'always', 'high', 'Well-educated professional seeking a compatible life partner.', 'single', 24, 32, 'Qatar', true, true, NOW());
    ELSIF u.email = 'huda.saleh@test.com' THEN
      INSERT INTO profiles (user_id, full_name, age, gender, country, city, sect, education, job_title, financial_level, cultural_level, lifestyle, prayer_level, religious_commitment, bio, social_status, min_age, max_age, preferred_country, relocate_willing, wants_children, created_at)
      VALUES (u.id, 'Huda Saleh', 25, 'female', 'Kuwait', 'Kuwait City', 'Sunni', 'Bachelor''s', 'Graphic Designer', 'middle', 'moderate', 'moderate', 'regular', 'moderate', 'Creative and caring, looking for someone with similar values.', 'single', 25, 33, 'Kuwait', true, true, NOW());
    ELSIF u.email = 'ali.hassan@test.com' THEN
      INSERT INTO profiles (user_id, full_name, age, gender, country, city, sect, education, job_title, financial_level, cultural_level, lifestyle, prayer_level, religious_commitment, bio, social_status, min_age, max_age, preferred_country, relocate_willing, wants_children, created_at)
      VALUES (u.id, 'Ali Hassan', 30, 'male', 'Egypt', 'Alexandria', 'Sunni', 'Bachelor''s', 'Dentist', 'high', 'moderate', 'moderate', 'regular', 'moderate', 'Healthcare professional seeking a loving and supportive partner.', 'single', 22, 28, 'Egypt', true, true, NOW());
    END IF;
  END LOOP;
END $$;

-- Re-enable triggers
ALTER TABLE profiles ENABLE TRIGGER ALL;
ALTER TABLE users ENABLE TRIGGER ALL;

-- Show seed results
SELECT 'Users seeded:' as info, COUNT(*) as count FROM users WHERE email LIKE '%@test.com';
SELECT 'Profiles seeded:' as info, COUNT(*) as count FROM profiles p JOIN users u ON p.user_id = u.id WHERE u.email LIKE '%@test.com';
