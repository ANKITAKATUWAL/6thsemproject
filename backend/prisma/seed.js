import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Doctor data (simplified without image imports)
const doctorsData = [
  { _id: 'doc1', name: 'Dr. Richard James', speciality: 'General physician', experience: '4 Years', fees: 50 },
  { _id: 'doc2', name: 'Dr. Emily Larson', speciality: 'Gynecologist', experience: '3 Years', fees: 60 },
  { _id: 'doc3', name: 'Dr. Sarah Patel', speciality: 'Dermatologist', experience: '1 Years', fees: 30 },
  { _id: 'doc4', name: 'Dr. Christopher Lee', speciality: 'Pediatricians', experience: '2 Years', fees: 40 },
  { _id: 'doc5', name: 'Dr. Jennifer Garcia', speciality: 'Neurologist', experience: '4 Years', fees: 50 },
  { _id: 'doc6', name: 'Dr. Andrew Williams', speciality: 'Neurologist', experience: '4 Years', fees: 50 },
  { _id: 'doc7', name: 'Dr. Christopher Davis', speciality: 'General physician', experience: '4 Years', fees: 50 },
  { _id: 'doc8', name: 'Dr. Timothy White', speciality: 'Gynecologist', experience: '3 Years', fees: 60 },
  { _id: 'doc9', name: 'Dr. Ava Mitchell', speciality: 'Dermatologist', experience: '1 Years', fees: 30 },
  { _id: 'doc10', name: 'Dr. Jeffrey King', speciality: 'Pediatricians', experience: '2 Years', fees: 40 },
  { _id: 'doc11', name: 'Dr. Zoe Kelly', speciality: 'Neurologist', experience: '4 Years', fees: 50 },
  { _id: 'doc12', name: 'Dr. Patrick Harris', speciality: 'Neurologist', experience: '4 Years', fees: 50 },
  { _id: 'doc13', name: 'Dr. Chloe Evans', speciality: 'General physician', experience: '4 Years', fees: 50 },
  { _id: 'doc14', name: 'Dr. Ryan Martinez', speciality: 'Gynecologist', experience: '3 Years', fees: 60 },
  { _id: 'doc15', name: 'Dr. Amelia Hill', speciality: 'Dermatologist', experience: '1 Years', fees: 30 },
];

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@medicare.com' },
    update: {},
    create: {
      name: 'System Admin',
      email: 'admin@medicare.com',
      password: adminPassword,
      role: 'ADMIN'
    }
  });

  console.log('Admin user created:', admin.email);

  // Create doctors from data
  console.log('Creating doctors...');
  for (const docData of doctorsData) {
    const doctorEmail = `${docData._id}@medicare.com`; // e.g., doc1@medicare.com
    const doctorPassword = await bcrypt.hash('doctor123', 10);

    const doctorUser = await prisma.user.upsert({
      where: { email: doctorEmail },
      update: {},
      create: {
        name: docData.name,
        email: doctorEmail,
        password: doctorPassword,
        role: 'DOCTOR'
      }
    });

    const doctor = await prisma.doctor.upsert({
      where: { userId: doctorUser.id },
      update: {},
      create: {
        userId: doctorUser.id,
        specialty: docData.speciality,
        experience: parseInt(docData.experience.split(' ')[0]), // Extract number from "4 Years"
        fee: parseFloat(docData.fees),
        available: true
      }
    });

    console.log(`Created doctor: ${doctorUser.name} (${docData._id})`);
  }

  // Create a sample patient named "ankita"
  const ankitaPassword = await bcrypt.hash('ankita123', 10);

  const ankita = await prisma.user.upsert({
    where: { email: 'ankita' },
    update: {},
    create: {
      name: 'Ankita',
      email: 'ankita',
      password: ankitaPassword,
      role: 'PATIENT'
    }
  });

  console.log('Patient user created:', ankita.email);
  console.log('Ankita user created:', ankita.email);
  console.log('Ankita user created:', ankita.email);

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });