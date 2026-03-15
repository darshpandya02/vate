import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const salt = await bcrypt.genSalt(12);
  const adminHash = await bcrypt.hash('Admin123!', salt);
  const userHash = await bcrypt.hash('User123!', salt);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@vate.app' },
    update: {},
    create: {
      email: 'admin@vate.app',
      passwordHash: adminHash,
      name: 'Admin',
      role: 'ADMIN',
      emailVerified: true,
    },
  });

  const user1 = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      email: 'alice@example.com',
      passwordHash: userHash,
      name: 'Alice',
      role: 'USER',
      emailVerified: true,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: {
      email: 'bob@example.com',
      passwordHash: userHash,
      name: 'Bob',
      role: 'USER',
      emailVerified: true,
    },
  });

  await prisma.userProfile.upsert({
    where: { userId: user1.id },
    update: {},
    create: {
      userId: user1.id,
      latitude: 40.7128,
      longitude: -74.006,
      searchRadiusKm: 5,
      priceRangeMin: 1,
      priceRangeMax: 3,
      dietaryPreferences: ['VEGETARIAN'],
      cuisinePreferences: ['Italian', 'Japanese'],
    },
  });

  const restaurants = [
    { name: 'Pizza Paradise', address: '123 Main St', latitude: 40.71, longitude: -74.01, cuisineTypes: ['Italian'], priceLevel: 2, rating: 4.5 },
    { name: 'Sushi Haven', address: '456 Oak Ave', latitude: 40.72, longitude: -74.02, cuisineTypes: ['Japanese'], priceLevel: 3, rating: 4.8 },
    { name: 'Taco Fiesta', address: '789 Elm St', latitude: 40.73, longitude: -74.00, cuisineTypes: ['Mexican'], priceLevel: 1, rating: 4.2 },
    { name: 'Burger Barn', address: '321 Pine Rd', latitude: 40.714, longitude: -74.005, cuisineTypes: ['American'], priceLevel: 2, rating: 4.0 },
    { name: 'Curry House', address: '654 Spice Ln', latitude: 40.715, longitude: -74.015, cuisineTypes: ['Indian'], priceLevel: 2, rating: 4.6 },
  ];

  for (const r of restaurants) {
    const existing = await prisma.restaurant.findFirst({ where: { name: r.name, deletedAt: null } });
    if (!existing) {
      await prisma.restaurant.create({
        data: {
          name: r.name,
          address: r.address,
          latitude: r.latitude,
          longitude: r.longitude,
          cuisineTypes: r.cuisineTypes,
          priceLevel: r.priceLevel,
          rating: r.rating,
        },
      });
    }
  }
  const group = await prisma.group.upsert({
    where: { inviteCode: 'DEMO1234' },
    update: {},
    create: {
      name: 'Demo Group',
      inviteCode: 'DEMO1234',
      adminId: user1.id,
      matchThreshold: 100,
    },
  });

  await prisma.groupMember.upsert({
    where: { groupId_userId: { groupId: group.id, userId: user1.id } },
    update: {},
    create: { groupId: group.id, userId: user1.id },
  });
  await prisma.groupMember.upsert({
    where: { groupId_userId: { groupId: group.id, userId: user2.id } },
    update: {},
    create: { groupId: group.id, userId: user2.id },
  });

  console.log('Seed completed:', { admin: admin.email, users: [user1.email, user2.email], group: group.name });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
