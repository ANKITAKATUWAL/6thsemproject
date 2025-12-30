import { doctors } from '../assets/assets/assets_frontend/assets.js';

export const doctorsData = doctors.map((doc, index) => ({
  id: `doc${index + 1}`, // Use doc1, doc2, etc. to match database IDs
  name: doc.name,
  specialty: doc.speciality,
  experience: parseInt(doc.experience.split(' ')[0]), // Extract number from "4 Years"
  fee: doc.fees,
  photo: doc.image
}));
