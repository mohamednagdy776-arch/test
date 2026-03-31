-- Verify seed results
SELECT '=== Database Verification ===' as info;
SELECT 'Users:' as table_name, COUNT(*) as count FROM users;
SELECT 'Profiles:' as table_name, COUNT(*) as count FROM profiles;

SELECT '=== Sample Users ===' as info;
SELECT u.email, p.full_name, p.gender, p.age, p.country, p.city, p.prayer_level, p.lifestyle
FROM users u
JOIN profiles p ON p.user_id = u.id
WHERE u.email LIKE '%@test.com'
ORDER BY p.age;
