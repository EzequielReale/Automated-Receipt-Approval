import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Hash the passwords
  const employeePassword = await bcrypt.hash('password123', 10);
  const reviewerPassword = await bcrypt.hash('password123', 10);

  // Create Employee
  const employee = await prisma.user.upsert({
    where: { email: 'employee@demo.com' },
    update: {
      password_hash: employeePassword,
      name: 'Alice Employee',
      role: Role.EMPLOYEE,
    },
    create: {
      email: 'employee@demo.com',
      password_hash: employeePassword,
      name: 'Alice Employee',
      role: Role.EMPLOYEE,
    },
  });

  // Create Reviewer
  const reviewer = await prisma.user.upsert({
    where: { email: 'reviewer@demo.com' },
    update: {
      password_hash: reviewerPassword,
      name: 'Bob Reviewer',
      role: Role.REVIEWER,
    },
    create: {
      email: 'reviewer@demo.com',
      password_hash: reviewerPassword,
      name: 'Bob Reviewer',
      role: Role.REVIEWER,
    },
  });

  console.log('Users seeded successfully:');
  console.log(`- Employee: ${employee.email} / password123`);
  console.log(`- Reviewer: ${reviewer.email} / password123`);
}

main()
  .catch((e) => {
    console.error('Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
