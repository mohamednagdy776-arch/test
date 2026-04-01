const { DataSource } = require('typeorm');

const ds = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: ['dist/**/*.entity.js'],
  synchronize: false,
});

async function seed() {
  await ds.initialize();
  console.log('connected');

  const users = await ds.getRepository('users').find();
  const groups = await ds.getRepository('groups').find();
  const mr = ds.getRepository('group_members');

  let c = 0;
  for (const u of users) {
    const n = 2 + Math.floor(Math.random() * 3);
    const s = [...groups].sort(() => Math.random() - 0.5).slice(0, n);
    for (const g of s) {
      const e = await mr.findOne({
        where: { group: { id: g.id }, user: { id: u.id } },
      });
      if (!e) {
        await mr.save(mr.create({ group: { id: g.id }, user: { id: u.id } }));
        c++;
      }
    }
  }
  console.log(c + ' memberships created');
  await ds.destroy();
}

seed().catch((e) => { console.error(e.message); process.exit(1); });
