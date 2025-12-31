import "dotenv/config";
import bcrypt from 'bcryptjs';
import { prisma } from '../src/libs/prisma.js';

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--email' || a === '-e') out.email = args[++i];
    else if (a === '--password' || a === '-p') out.password = args[++i];
  }
  return out;
}

function makeRandomPassword(len = 12) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
  let pw = '';
  for (let i = 0; i < len; i++) pw += chars[Math.floor(Math.random() * chars.length)];
  return pw;
}

async function main() {
  const { email, password } = parseArgs();
  if (!email) {
    console.error('Usage: node createAdmin.js --email admin@example.com [--password P@ssw0rd]');
    process.exit(1);
  }

  const plainPassword = password || makeRandomPassword(12);
  const hashed = await bcrypt.hash(plainPassword, 10);

  // Upsert user: create if missing, otherwise update password + role
  const user = await prisma.user.upsert({
    where: { email },
    update: { password: hashed, role: 'ADMIN' },
    create: { name: email.split('@')[0], email, password: hashed, role: 'ADMIN' }
  });

  console.log('Admin user ensured. Credentials:');
  console.log('  Email:', email);
  console.log('  Password:', plainPassword);
  console.log('\nIMPORTANT: The password shown above is the only time it will be printed in plaintext.');
  console.log('This script hashes passwords with bcrypt (salt rounds = 10) before saving to the database.');

  await prisma.$disconnect();
}

main().catch(err => {
  console.error('Error creating admin user:', err);
  prisma.$disconnect().finally(() => process.exit(1));
});
