import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create ticket categories
  const categories = [
    {
      name: 'Technical Support',
      description: 'Technical issues and support requests',
      color: '#0ea5e9' // sky-500
    },
    {
      name: 'Billing',
      description: 'Billing and payment related issues',
      color: '#22c55e' // green-500
    },
    {
      name: 'Account',
      description: 'Account management and access issues',
      color: '#f59e0b' // amber-500
    },
    {
      name: 'Feature Request',
      description: 'New feature suggestions and requests',
      color: '#8b5cf6' // violet-500
    },
    {
      name: 'Bug Report',
      description: 'Report software bugs and issues',
      color: '#ef4444' // red-500
    }
  ];

  for (const category of categories) {
    await prisma.ticketCategory.upsert({
      where: { name: category.name },
      update: {},
      create: category
    });
  }

  // Create ticket tags
  const tags = [
    { name: 'Urgent', color: '#ef4444' }, // red-500
    { name: 'Bug', color: '#f97316' }, // orange-500
    { name: 'Enhancement', color: '#8b5cf6' }, // violet-500
    { name: 'Documentation', color: '#0ea5e9' }, // sky-500
    { name: 'Question', color: '#22c55e' }, // green-500
    { name: 'Security', color: '#dc2626' }, // red-600
    { name: 'Performance', color: '#f59e0b' } // amber-500
  ];

  for (const tag of tags) {
    await prisma.ticketTag.upsert({
      where: { name: tag.name },
      update: {},
      create: tag
    });
  }

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error('Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
