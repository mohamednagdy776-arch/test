const { DataSource } = require('typeorm');
const bcrypt = require('bcrypt');

const dataSource = new DataSource({
  type: 'postgres',
  host: 'postgres',
  port: 5432,
  username: 'user',
  password: 'password',
  database: 'tayyibt',
  synchronize: false,
});

async function seed() {
  console.log('🌱 Starting seed...');
  
  await dataSource.initialize();
  
  try {
    const password = await bcrypt.hash('Test1234', 12);
    
    const users = [
      { email: 'user1@tayyibt.com', firstName: 'User', lastName: 'One', username: 'user1', phone: '+201000000000', gender: 'male' },
      { email: 'admin@tayyibt.com', firstName: 'Admin', lastName: 'User', username: 'admin', phone: '+201000000001', gender: 'male' },
      { email: 'ahmed@tayyibt.com', firstName: 'Ahmed', lastName: 'Mohamed', username: 'ahmed', phone: '+201000000002', gender: 'male' },
      { email: 'fatima@tayyibt.com', firstName: 'Fatima', lastName: 'Ali', username: 'fatima', phone: '+201000000003', gender: 'female' },
      { email: 'omar@tayyibt.com', firstName: 'Omar', lastName: 'Hassan', username: 'omar', phone: '+201000000004', gender: 'male' },
      { email: 'sara@tayyibt.com', firstName: 'Sara', lastName: 'Ahmed', username: 'sara', phone: '+201000000005', gender: 'female' },
    ];

    for (const userData of users) {
      try {
        await dataSource.query(
          `INSERT INTO users (email, phone, password_hash, first_name, last_name, username, gender, status, is_verified)
           VALUES ($1, $2, $3, $4, $5, $6, $7, 'active', true)
           ON CONFLICT (email) DO NOTHING`,
          [userData.email, userData.phone, password, userData.firstName, userData.lastName, userData.username, userData.gender]
        );
        console.log(`✅ Created user: ${userData.email}`);
      } catch (e) {
        console.log(`⚠️ User ${userData.email}: ${e.message}`);
      }
    }

    const usersResult = await dataSource.query('SELECT id, email FROM users');
    console.log(`📊 Found ${usersResult.length} users`);

    if (usersResult.length > 0) {
      const userId = usersResult[0].id;
      try {
        await dataSource.query(
          `INSERT INTO posts (user_id, content, post_type)
           VALUES ($1, $2, 'text'::post_type_enum)
           ON CONFLICT DO NOTHING`,
          [userId, 'مرحباً بكم في تطبيق Tayyibt - منصة الزواج الإسلامي الذكي!']
        );
        
        await dataSource.query(
          `INSERT INTO posts (user_id, content, post_type)
           VALUES ($1, $2, 'text'::post_type_enum)
           ON CONFLICT DO NOTHING`,
          [userId, 'بحث عن شريك حياة في Egypt. مهندس, 28 سنة, يحب القراءة والعمل الخيري.']
        );
        
        await dataSource.query(
          `INSERT INTO posts (user_id, content, post_type)
           VALUES ($1, $2, 'text'::post_type_enum)
           ON CONFLICT DO NOTHING`,
          [userId, 'السلام عليكم ورحمة الله وبركاته، أبحث عن زوجه صالحه للتوحيد الله تعالي.']
        );
        
        console.log('✅ Created sample posts');
      } catch (e) {
        console.log(`⚠️ Posts: ${e.message}`);
      }
    }

    if (usersResult.length >= 2) {
      const userId = usersResult[0].id;
      try {
        await dataSource.query(
          `INSERT INTO notifications (user_id, type, title, message, is_read)
           VALUES ($1, 'friend_request', 'New Friend Request', 'Ahmed Mohamed sent you a friend request', false)`,
          [userId]
        );
        
        await dataSource.query(
          `INSERT INTO notifications (user_id, type, title, message, is_read)
           VALUES ($1, 'match', 'New Match!', 'You have a new match compatibility!', false)`,
          [userId]
        );
        
        console.log('✅ Created notifications');
      } catch (e) {
        console.log(`⚠️ Notifications: ${e.message}`);
      }
    }

    console.log('\n🎉 Seed completed!');
    console.log('\n📝 Test Credentials:');
    console.log('   admin@tayyibt.com / Test1234');
    console.log('   ahmed@tayyibt.com / Test1234');
    console.log('   fatima@tayyibt.com / Test1234');
    
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
  } finally {
    await dataSource.destroy();
  }
}

seed();