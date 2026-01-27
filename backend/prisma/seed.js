import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Doctor data with photos (using placeholder images - replace with actual URLs in production)
const doctorsData = [
  { _id: 'doc1', name: 'Dr. Richard James', speciality: 'General physician', experience: '4 Years', fees: 50, photo: '/doc1.png', about: 'Dr. Richard James has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.' },
  { _id: 'doc2', name: 'Dr. Emily Larson', speciality: 'Gynecologist', experience: '3 Years', fees: 60, photo: '/doc2.png', about: 'Dr. Emily Larson is a dedicated gynecologist with expertise in women\'s health, reproductive care, and preventive screenings.' },
  { _id: 'doc3', name: 'Dr. Sarah Patel', speciality: 'Dermatologist', experience: '1 Years', fees: 30, photo: '/doc3.png', about: 'Dr. Sarah Patel specializes in skin care and dermatological treatments, helping patients maintain healthy skin.' },
  { _id: 'doc4', name: 'Dr. Christopher Lee', speciality: 'Pediatricians', experience: '2 Years', fees: 40, photo: '/doc4.png', about: 'Dr. Christopher Lee is a caring pediatrician dedicated to the health and well-being of children.' },
  { _id: 'doc5', name: 'Dr. Jennifer Garcia', speciality: 'Neurologist', experience: '4 Years', fees: 50, photo: '/doc5.png', about: 'Dr. Jennifer Garcia is an experienced neurologist specializing in disorders of the nervous system.' },
  { _id: 'doc6', name: 'Dr. Andrew Williams', speciality: 'Neurologist', experience: '4 Years', fees: 50, photo: '/doc6.png', about: 'Dr. Andrew Williams brings extensive experience in neurological care and patient treatment.' },
  { _id: 'doc7', name: 'Dr. Christopher Davis', speciality: 'General physician', experience: '4 Years', fees: 50, photo: '/doc7.png', about: 'Dr. Christopher Davis provides comprehensive general medical care with a focus on patient wellness.' },
  { _id: 'doc8', name: 'Dr. Timothy White', speciality: 'Gynecologist', experience: '3 Years', fees: 60, photo: '/doc8.png', about: 'Dr. Timothy White is a skilled gynecologist committed to women\'s health and preventive care.' },
  { _id: 'doc9', name: 'Dr. Ava Mitchell', speciality: 'Dermatologist', experience: '1 Years', fees: 30, photo: '/doc9.png', about: 'Dr. Ava Mitchell offers expert dermatological care and skin treatments.' },
  { _id: 'doc10', name: 'Dr. Jeffrey King', speciality: 'Pediatricians', experience: '2 Years', fees: 40, photo: '/doc10.png', about: 'Dr. Jeffrey King provides compassionate pediatric care for children of all ages.' },
  { _id: 'doc11', name: 'Dr. Zoe Kelly', speciality: 'Neurologist', experience: '4 Years', fees: 50, photo: '/doc11.png', about: 'Dr. Zoe Kelly specializes in neurological disorders and provides comprehensive patient care.' },
  { _id: 'doc12', name: 'Dr. Patrick Harris', speciality: 'Neurologist', experience: '4 Years', fees: 50, photo: '/doc12.png', about: 'Dr. Patrick Harris is dedicated to treating neurological conditions with the latest medical approaches.' },
  { _id: 'doc13', name: 'Dr. Chloe Evans', speciality: 'General physician', experience: '4 Years', fees: 50, photo: '/doc13.png', about: 'Dr. Chloe Evans provides thorough general medical care with emphasis on preventive health.' },
  { _id: 'doc14', name: 'Dr. Ryan Martinez', speciality: 'Gynecologist', experience: '3 Years', fees: 60, photo: '/doc14.png', about: 'Dr. Ryan Martinez is committed to providing excellent gynecological care and support.' },
  { _id: 'doc15', name: 'Dr. Amelia Hill', speciality: 'Dermatologist', experience: '1 Years', fees: 30, photo: '/doc15.png', about: 'Dr. Amelia Hill offers personalized dermatological treatments and skin care solutions.' },
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
      update: {
        specialty: docData.speciality,
        experience: parseInt(docData.experience.split(' ')[0]),
        fee: parseFloat(docData.fees),
        available: true,
        approved: true,  // Set approved to true so they show up in the frontend
        photo: docData.photo,
        about: docData.about
      },
      create: {
        userId: doctorUser.id,
        specialty: docData.speciality,
        experience: parseInt(docData.experience.split(' ')[0]), // Extract number from "4 Years"
        fee: parseFloat(docData.fees),
        available: true,
        approved: true,  // Set approved to true so they show up in the frontend
        photo: docData.photo,
        about: docData.about
      }
    });

    console.log(`Created doctor: ${doctorUser.name} (${docData._id})`);
  }

  // Create a sample patient named "ankita"
  const ankitaPassword = await bcrypt.hash('ankita123', 10);

  const ankita = await prisma.user.upsert({
    where: { email: 'ankita@medicare.com' },
    update: {},
    create: {
      name: 'Ankita',
      email: 'ankita@medicare.com',
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