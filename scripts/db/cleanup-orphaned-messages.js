/**
 * cleanup-orphaned-messages.js
 * Finds and removes messages with NULL or empty conversation_id.
 * Runs inside the backend Docker container.
 * Usage: docker compose cp scripts/db/cleanup-orphaned-messages.js backend:/app/cleanup-orphaned-messages.js
 *        docker compose exec backend node /app/cleanup-orphaned-messages.js
 */
const { DataSource } = require('typeorm');

const ds = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: ['dist/**/*.entity.js'],
  synchronize: false,
});

async function cleanup() {
  await ds.initialize();
  console.log('✅ Connected to database');

  const messageRepo = ds.getRepository('messages');

  // Find orphaned messages (NULL or empty conversation_id)
  const orphaned = await messageRepo
    .createQueryBuilder('message')
    .where('message.conversation_id IS NULL')
    .orWhere('message.conversation_id = :emptyId', { emptyId: '' })
    .getMany();

  console.log(`Found ${orphaned.length} orphaned messages`);

  if (orphaned.length > 0) {
    // Show info about orphaned messages
    console.log('\n📋 Orphaned messages:');
    for (const msg of orphaned) {
      console.log(`  - ID: ${msg.id}, Sender: ${msg.sender?.id}, Content: ${msg.contentEncrypted?.substring(0, 50)}...`);
    }

    // Delete orphaned messages
    const result = await messageRepo.remove(orphaned);
    console.log(`\n🗑️  Deleted ${result.length} orphaned messages`);
  } else {
    console.log('✅ No orphaned messages found');
  }

  await ds.destroy();
  console.log('\n✅ Cleanup complete!');
}

cleanup().catch((e) => {
  console.error('❌ Cleanup failed:', e.message);
  process.exit(1);
});