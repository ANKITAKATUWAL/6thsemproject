import express from "express";
import { prisma } from "../libs/prisma.js";

const router = express.Router();

// Default placeholder image for doctors without photos
const DEFAULT_DOCTOR_PHOTO = "https://ui-avatars.com/api/?name=Doctor&background=0D8ABC&color=fff&size=150";

// Helper function to get full photo URL
const getPhotoUrl = (req, photo, doctorName) => {
  if (!photo) {
    // Return a generated avatar based on doctor name
    const name = encodeURIComponent(doctorName || 'Doctor');
    return `https://ui-avatars.com/api/?name=${name}&background=0D8ABC&color=fff&size=150`;
  }
  // If photo already has http/https, return as-is
  if (photo.startsWith('http://') || photo.startsWith('https://')) {
    return photo;
  }
  // Otherwise, prepend the base URL
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return `${baseUrl}${photo}`;
};

// Get all approved doctors (public endpoint)
router.get("/", async (req, res) => {
  try {
    const { specialty, available } = req.query;
    
    const where = {
      approved: true // Only show approved doctors
    };
    
    if (specialty) {
      where.specialty = {
        contains: specialty,
        mode: 'insensitive'
      };
    }
    
    if (available !== undefined) {
      where.available = available === 'true';
    }

    const doctors = await prisma.doctor.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    // Format response for frontend with full photo URL
    const formattedDoctors = doctors
      .filter(doc => doc && doc.user && doc.user.name)
      .map(doc => ({
        id: doc.id,
        name: doc.user.name,
        email: doc.user.email,
        specialty: doc.specialty,
        experience: doc.experience,
        fee: doc.fee,
        available: doc.available,
        photo: getPhotoUrl(req, doc.photo, doc.user.name),
        about: doc.about || "Experienced medical professional dedicated to providing quality healthcare."
      }));

    res.json(formattedDoctors);
  } catch (err) {
    console.error("Get doctors error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get single doctor by ID (public endpoint)
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const doctor = await prisma.doctor.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const formattedDoctor = {
      id: doctor.id,
      name: doctor.user.name,
      email: doctor.user.email,
      specialty: doctor.specialty,
      experience: doctor.experience,
      fee: doctor.fee,
      available: doctor.available,
      photo: getPhotoUrl(req, doctor.photo, doctor.user.name),
      about: doctor.about || "Experienced medical professional dedicated to providing quality healthcare."
    };

    res.json(formattedDoctor);
  } catch (err) {
    console.error("Get doctor error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
