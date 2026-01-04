import "dotenv/config";
import bcrypt from 'bcryptjs';
import prismaPkg from '../generated/prisma/index.js';

const { PrismaClient } = prismaPkg;
const prisma = new PrismaClient();

async function main() {
  // You can override these with environment variables ADMIN_EMAIL and ADMIN_PASSWORD
  const email = process.env.ADMIN_EMAIL || 'admin@medicare.test';
  const plainPassword = process.env.ADMIN_PASSWORD || 'Admin@12345';
  const name = 'Admin';

  const hashed = await bcrypt.hash(plainPassword, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: { name, password: hashed, role: 'ADMIN' },
    create: { name, email, password: hashed, role: 'ADMIN' },
  });

  console.log('Admin user created or updated successfully.');
  console.log('Login credentials:');
  console.log(`Email: ${email}`);
  console.log(`Password: ${plainPassword}`);
  console.log('\nUse POST http://localhost:5000/api/auth/login with JSON {"email":"...","password":"..."} to login.');
}

main()
  .catch((e) => { console.error('Error creating admin:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
