/**
 * seed-social.js
 * Seeds groups, posts, comments, and reactions.
 * Runs inside the backend Docker container.
 * Usage: docker compose cp scripts/db/seed-social.js backend:/app/seed-social.js
 *        docker compose exec backend node /app/seed-social.js
 */
const { DataSource } = require('typeorm');

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
  const groupRepo = ds.getRepository('groups');
  const postRepo = ds.getRepository('posts');
  const commentRepo = ds.getRepository('comments');
  const reactionRepo = ds.getRepository('reactions');

  // Get existing users
  const users = await userRepo.find();
  if (users.length === 0) {
    console.log('❌ No users found. Run seed-docker.js first.');
    await ds.destroy();
    return;
  }
  console.log(`📋 Found ${users.length} users`);

  // Map users by email for easy reference
  const userMap = {};
  for (const u of users) {
    const profile = await ds.getRepository('profiles').findOne({ where: { user: { id: u.id } } });
    userMap[u.email] = { ...u, profileName: profile?.fullName || u.email };
  }

  const admin = userMap['admin@tayyibt.com'] || users[0];
  const user1 = userMap['user1@tayyibt.com'] || users[1];
  const user2 = userMap['user2@tayyibt.com'] || users[2];
  const user3 = userMap['user3@tayyibt.com'] || users[3];
  const user4 = userMap['user4@tayyibt.com'] || users[4];
  const user5 = userMap['user5@tayyibt.com'] || users[5];
  const user6 = userMap['user6@tayyibt.com'] || users[6];
  const user7 = userMap['user7@tayyibt.com'] || users[7];
  const user8 = userMap['user8@tayyibt.com'] || users[8];

  // ── Groups ─────────────────────────────────────────────────────
  const groupsData = [
    { name: 'نصائح الزواج', description: 'مجموعة لتبادل نصائح الزواج وبناء الأسرة', privacy: 'public', creator: admin },
    { name: 'قصص نجاح', description: 'شاركنا قصص نجاح التوفيق والزواج', privacy: 'public', creator: user1 },
    { name: 'أسئلة دينية', description: '讨论 الأسئلة الدينية المتعلقة بالزواج', privacy: 'public', creator: user5 },
    { name: 'التواصل الاجتماعي', description: 'مجموعة للتعارف والتواصل بين الأعضاء', privacy: 'public', creator: user3 },
    { name: 'الأسرة والمجتمع', description: '讨论 الأسرة والمجتمع والقيم', privacy: 'private', creator: user7 },
  ];

  const savedGroups = [];
  for (const g of groupsData) {
    let group = await groupRepo.findOne({ where: { name: g.name } });
    if (!group) {
      group = await groupRepo.save(groupRepo.create({
        name: g.name,
        description: g.description,
        privacy: g.privacy,
        createdBy: { id: g.creator.id },
      }));
      console.log(`✅ Group: ${g.name} (by ${g.creator.profileName})`);
    } else {
      console.log(`⏭  Group exists: ${g.name}`);
    }
    savedGroups.push(group);
  }

  // ── Posts ───────────────────────────────────────────────────────
  const postsData = [
    // Group 0: نصائح الزواج
    { group: savedGroups[0], user: user1, content: 'السلام عليكم، ما هي أهم الصفات التي يجب البحث عنها في الزوج/الزوجة؟ أود سماع آرائكم.' },
    { group: savedGroups[0], user: user2, content: 'أعتقد أن التوافق في القيم الدينية هو最重要的 شيء. المال والجمال يزولان لكن الدين يبقى.' },
    { group: savedGroups[0], user: user4, content: 'من تجربتي، التواصل الجيد هو أساس كل زواج ناجح. تعلموا كيف تتحدثون قبل أن تتزوجوا.' },
    { group: savedGroups[0], user: user6, content: 'لا تنسوا أهمية موافقة الأهل. الدعم العائلي يساعد كثيراً في بداية الحياة الزوجية.' },
    { group: savedGroups[0], user: user8, content: 'أضيفوا أن الاحترام المتبادل مهم جداً. بدون احترام لا يمكن أن يبنى أي relationship.' },

    // Group 1: قصص نجاح
    { group: savedGroups[1], user: user1, content: 'الحمد لله، وجدت شريكة حياتي من خلال هذه المنصة. نصيحتي: كونوا صادقين في ملفكم الشخصي.' },
    { group: savedGroups[1], user: user5, content: 'بارك الله لكما وبارك عليكما وجمع بينكما في خير 🎉' },
    { group: savedGroups[1], user: user4, content: 'كم أنا سعيدة לשמוע هذا! أتمنى أن يوفقني الله أيضاً في إيجاد الشخص المناسب.' },
    { group: savedGroups[1], user: user3, content: 'التوكل على الله والدعاء هما السر. لا تستعجلوا النتائج.' },

    // Group 2: أسئلة دينية
    { group: savedGroups[2], user: user5, content: 'ما هو حكم الخطبة عبر الإنترنت في الإسلام؟ وهل تعتبر معروفة شرعاً؟' },
    { group: savedGroups[2], user: user2, content: 'العلماء المعاصرون أجازوا ذلك بشرط وجود ولي الأمر أو محرم في التواصل.' },
    { group: savedGroups[2], user: admin, content: 'من المهم أيضاً أن يكون التواصل بحدود شرعية ولا يكون هناك خلوة.' },
    { group: savedGroups[2], user: user8, content: 'هل يجوز أن أرى صورة الشخص قبل الخطبة الرسمية؟' },
    { group: savedGroups[2], user: user5, content: 'نعم يجوز ذلك بقصد الجدية في الزواج، كما جاء في السنة النبوية.' },

    // Group 3: التواصل الاجتماعي
    { group: savedGroups[3], user: user3, content: 'مرحباً بالجميع! أنا عمر من الرياض، أعمل طبيباً وأبحث عن شريكة حياة.' },
    { group: savedGroups[3], user: user7, content: 'أهلاً عمر! أنا خالد من جدة. بالتوفيق إن شاء الله.' },
    { group: savedGroups[3], user: user8, content: 'مرحباً! أنا هانا من القاهرة. سعيدة بالانضمام لهذه المجموعة.' },
    { group: savedGroups[3], user: user1, content: 'أهلاً وسهلاً بالجميع! هذه مجموعة رائعة للتعارف.' },

    // Group 4: الأسرة والمجتمع
    { group: savedGroups[4], user: user7, content: 'ما رأيكم في تحديات الحياة الزوجية في العصر الحديث؟ وكيف نوازن بين العمل والأسرة؟' },
    { group: savedGroups[4], user: user6, content: 'التخطيط المسبق مهم جداً. حددوا أدوار كل طرف قبل الزواج.' },
    { group: savedGroups[4], user: user2, content: 'الدعم المتبادل هو المفتاح. ساعدوا بعضكم البعض في كل شيء.' },
  ];

  const savedPosts = [];
  for (const p of postsData) {
    const post = await postRepo.save(postRepo.create({
      group: { id: p.group.id },
      user: { id: p.user.id },
      content: p.content,
    }));
    savedPosts.push(post);
    console.log(`✅ Post by ${p.user.profileName} in "${p.group.name}"`);
  }

  // ── Comments ────────────────────────────────────────────────────
  const commentsData = [
    // Comments on post 0 (صفات الزوج)
    { post: savedPosts[0], user: user3, content: 'أوافقك الرأي، الإيمان هو الأساس.' },
    { post: savedPosts[0], user: user5, content: 'أضيف أنحسن الخلق والرفق في المعاملة.' },
    { post: savedPosts[0], user: user7, content: 'التوافق الفكري مهم أيضاً، أن تتفقوا على الأهداف.' },
    { post: savedPosts[0], user: user2, content: 'لا تنسوا أهمية التعليم والثقافة.' },

    // Comments on post 1 (التوافق الديني)
    { post: savedPosts[1], user: user1, content: 'كلام صحيح، الدين يجمع القلوب.' },
    { post: savedPosts[1], user: user6, content: 'لكن التوافق في الطباع مهم أيضاً.' },

    // Comments on post 5 (قصة نجاح)
    { post: savedPosts[5], user: user2, content: 'ما شاء الله! بارك الله لكما.' },
    { post: savedPosts[5], user: user4, content: 'هذه قصة ملهمة جداً. بالتوفيق للجميع.' },
    { post: savedPosts[5], user: user8, content: 'الحمد لله على نعمه. أتمنى أن يوفقني الله أيضاً.' },
    { post: savedPosts[5], user: user6, content: 'من أين بدأت المحادثة الأولى؟ هل من خلال التطبيق؟' },
    { post: savedPosts[5], user: user1, content: 'نعم، بدأنا بالدردشة هنا ثم توافقنا والحمد لله.' },

    // Comments on post 9 (حكم الخطبة)
    { post: savedPosts[9], user: user2, content: 'هذا مهم جداً، جزاك الله خيراً.' },
    { post: savedPosts[9], user: user3, content: 'هل هناك فرق بين الخطبة والتعرف؟' },

    // Comments on post 15 (عمر من الرياض)
    { post: savedPosts[15], user: user4, content: 'أهلاً عمر! أنا سارة من دبي.' },
    { post: savedPosts[15], user: user6, content: 'مرحباً! بالتوفيق في بحثك.' },
    { post: savedPosts[15], user: user8, content: 'أهلاً وسهلاً! الطبيب زوج مستقبلي 😊' },

    // Comments on post 20 (تحديات الحياة الزوجية)
    { post: savedPosts[20], user: user1, content: 'التخطيط والتفاهم هما الحل.' },
    { post: savedPosts[20], user: user5, content: 'الاستعانة بالله ثم بالأهل مهم جداً.' },
  ];

  for (const c of commentsData) {
    await commentRepo.save(commentRepo.create({
      post: { id: c.post.id },
      user: { id: c.user.id },
      content: c.content,
    }));
    console.log(`💬 Comment by ${c.user.profileName}`);
  }

  // ── Reactions ───────────────────────────────────────────────────
  const reactionTypes = ['like', 'love', 'support'];
  const reactors = [user1, user2, user3, user4, user5, user6, user7, user8];

  // Add reactions to posts (each user reacts to random posts)
  let reactionCount = 0;
  for (const post of savedPosts) {
    // Each post gets 3-6 reactions from random users
    const numReactors = 3 + Math.floor(Math.random() * 4);
    const shuffled = [...reactors].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, numReactors);

    for (const reactor of selected) {
      if (!reactor) continue;
      const type = reactionTypes[Math.floor(Math.random() * reactionTypes.length)];
      
      const existing = await reactionRepo.findOne({
        where: { post: { id: post.id }, user: { id: reactor.id } },
      });

      if (!existing) {
        await reactionRepo.save(reactionRepo.create({
          post: { id: post.id },
          user: { id: reactor.id },
          type,
        }));
        reactionCount++;
      }
    }
  }
  console.log(`✅ ${reactionCount} reactions added`);

  // ── Summary ─────────────────────────────────────────────────────
  const totalGroups = await groupRepo.count();
  const totalPosts = await postRepo.count();
  const totalComments = await commentRepo.count();
  const totalReactions = await reactionRepo.count();

  console.log('\n📊 Social data summary:');
  console.log(`   Groups:    ${totalGroups}`);
  console.log(`   Posts:     ${totalPosts}`);
  console.log(`   Comments:  ${totalComments}`);
  console.log(`   Reactions: ${totalReactions}`);
  console.log('\n✅ Social seeding complete!');

  await ds.destroy();
}

seed().catch((e) => { console.error('❌ Seed failed:', e.message); process.exit(1); });
