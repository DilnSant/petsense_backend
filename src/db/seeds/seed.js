import { PrismaClient, Role, ProviderType } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  // Clean up
  await prisma.review.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.service.deleteMany();
  await prisma.provider.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  // Create Admin
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@petsense.com',
      password: adminPassword,
      role: Role.ADMIN,
      profile: {
        create: {
          name: 'Admin User',
        },
      },
    },
  });
  console.log(`Created admin: ${admin.email}`);

  // Create Provider (PetShop)
  const providerPassword = await bcrypt.hash('provider123', 10);
  const providerUser = await prisma.user.create({
    data: {
      email: 'shop@petsense.com',
      password: providerPassword,
      role: Role.PROVIDER,
      profile: {
        create: {
          name: 'Happy Pet Shop',
          phone: '11999999999',
        },
      },
    },
  });

  // Create Provider Details with Location
  // Location: São Paulo, Av. Paulista roughly
  const lat = -23.561684;
  const lng = -46.655981;

  const provider = await prisma.provider.create({
    data: {
      userId: providerUser.id,
      type: ProviderType.PETSHOP,
      name: 'Happy Pet Shop',
      description: 'Best pet shop in town',
      phone: '11999999999',
      latitude: lat,
      longitude: lng,
      isVerified: true,
    },
  });

  // Update location with PostGIS
  await prisma.$executeRaw`
    UPDATE "Provider"
    SET location = ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)
    WHERE id = ${provider.id}
  `;

  console.log(`Created provider: ${provider.name}`);

  // Create Service
  await prisma.service.create({
    data: {
      providerId: provider.id,
      name: 'Bath & Grooming',
      description: 'Full service bath and grooming',
      price: 50.00,
      durationMin: 60,
    },
  });

  // Create Normal User
  const userPassword = await bcrypt.hash('user123', 10);
  const user = await prisma.user.create({
    data: {
      email: 'user@petsense.com',
      password: userPassword,
      role: Role.USER,
      profile: {
        create: {
          name: 'John Doe',
          phone: '11888888888',
        },
      },
    },
  });
  console.log(`Created user: ${user.email}`);

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
