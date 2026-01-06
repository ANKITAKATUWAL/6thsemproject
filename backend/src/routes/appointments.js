import express from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../libs/prisma.js";
import auth from "../middleware/auth.js";

const router = express.Router();
// In-memory availability store for doctors (doctorId -> availability object)
const availabilityStore = new Map();

// Book appointment (for patients)
router.post("/book", auth, async (req, res) => {
  try {
    const { doctorId, appointmentDate, time, reason } = req.body;
    const patientId = req.user.id;

    // Check if doctor exists, if not create a dummy doctor
    let doctor = await prisma.doctor.findUnique({
      where: { id: parseInt(doctorId) }
    });

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    if (!doctor.available) {
        return res.status(400).json({ message: "Doctor not available" });
    }

      // Check doctor's availability store for disabled dates or off flag
      const avail = availabilityStore.get(doctor.userId || doctor.id);
      if (avail) {
        if (avail.enabled === false) return res.status(400).json({ message: 'Doctor availability turned off' });
        // check disabledDates (array of ISO date strings)
        if (Array.isArray(avail.disabledDates) && avail.disabledDates.length > 0) {
          const reqDate = new Date(appointmentDate).toISOString().split('T')[0];
          if (avail.disabledDates.includes(reqDate)) return res.status(400).json({ message: 'Doctor not available on this date' });
        }
        // check workingDays if specified
        if (Array.isArray(avail.workingDays) && avail.workingDays.length > 0) {
          const d = new Date(appointmentDate);
          const weekday = d.getDay(); // 0 Sun - 6 Sat
          if (!avail.workingDays.includes(weekday)) return res.status(400).json({ message: 'Doctor not available on this day' });
        }
      }

      // Prevent double booking: existing appointment for same doctor at same date+time
      const reqDateISO = new Date(appointmentDate).toISOString().split('T')[0];
      const existing = await prisma.appointment.findFirst({
        where: {
          doctorId: doctor.id,
          time,
          AND: [
            {
              appointmentDate: {
                gte: new Date(reqDateISO + 'T00:00:00.000Z')
              }
            },
            {
              appointmentDate: {
                lte: new Date(reqDateISO + 'T23:59:59.999Z')
              }
            }
          ],
          NOT: { status: 'CANCELLED' }
        }
      });
      if (existing) return res.status(400).json({ message: 'Time slot already booked' });

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        patientId,
        doctorId: doctor.id,
        appointmentDate: new Date(appointmentDate),
        time,
        reason: reason || ""
      },
      include: {
        patient: { select: { name: true, email: true } },
        doctor: { include: { user: { select: { name: true } } } }
      }
    });

    res.status(201).json(appointment);
  } catch (err) {
    console.error("Book appointment error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get appointments for doctor
router.get("/doctor", auth, async (req, res) => {
  try {
    // Require an existing doctor profile (do not auto-create placeholders)
    if (req.user.role !== 'DOCTOR' && !req.user.doctor) {
      return res.status(403).json({ message: "Access denied. Doctor only." });
    }

    if (!req.user.doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    // allow doctor or admin to fetch a patient's details by query param ?patientId=...
    const patientIdQuery = req.query.patientId;
    if (patientIdQuery) {
      const pid = parseInt(patientIdQuery);
      const patient = await prisma.user.findUnique({
        where: { id: pid },
        include: {
          appointments: {
            where: { patientId: pid },
            include: { doctor: { include: { user: true } } },
            orderBy: { appointmentDate: 'asc' }
          }
        }
      });
      return res.json({ patient });
    }

    const appointments = await prisma.appointment.findMany({
      where: { doctorId: req.user.doctor.id },
      include: {
        patient: { select: { name: true, email: true } }
      },
      orderBy: { appointmentDate: "asc" }
    });

    res.json(appointments);
  } catch (err) {
    console.error("Get doctor appointments error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get doctor's profile without auto-creating it
router.get('/doctor/profile', auth, async (req, res) => {
  try {
    const doctor = await prisma.doctor.findUnique({
      where: { userId: req.user.id },
      include: { user: true }
    });

    if (!doctor) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.json(doctor);
  } catch (err) {
    console.error('Get doctor profile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get doctor's availability
router.get('/doctor/availability', auth, async (req, res) => {
  try {
    // only doctors
    if (!(req.user.role === 'DOCTOR' || req.user.doctor)) return res.status(403).json({ message: 'Access denied' });
    const key = req.user.id;
    const avail = availabilityStore.get(key) || { enabled: true, workingDays: [1,2,3,4,5], disabledDates: [], timeSlots: ['09:00','10:00','14:00','15:00'] };
    res.json(avail);
  } catch (err) {
    console.error('Get availability error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update doctor's availability
router.put('/doctor/availability', auth, async (req, res) => {
  try {
    if (req.user.role !== 'DOCTOR' && !req.user.doctor) return res.status(403).json({ message: 'Access denied' });
    const key = req.user.id;
    const payload = req.body || {};
    const existing = availabilityStore.get(key) || { enabled: true, workingDays: [1,2,3,4,5], disabledDates: [], timeSlots: [] };
    const updated = { ...existing, ...payload };
    availabilityStore.set(key, updated);
    res.json(updated);
  } catch (err) {
    console.error('Update availability error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get appointments for patient
router.get("/patient", auth, async (req, res) => {
  try {
    const appointments = await prisma.appointment.findMany({
      where: { patientId: req.user.id },
      include: {
        doctor: { include: { user: { select: { name: true } } } }
      },
      orderBy: { appointmentDate: "asc" }
    });

    res.json(appointments);
  } catch (err) {
    console.error("Get patient appointments error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get a specific patient's appointments (doctor/admin access)
router.get('/patient/:id', auth, async (req, res) => {
  try {
    const pid = parseInt(req.params.id);
    // Only allow doctors or admins to fetch other patients
    if (!(req.user.role === 'DOCTOR' || req.user.role === 'ADMIN')) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const patient = await prisma.user.findUnique({
      where: { id: pid },
      select: { id: true, name: true, email: true }
    });

    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    const appointments = await prisma.appointment.findMany({
      where: { patientId: pid },
      include: { doctor: { include: { user: true } } },
      orderBy: { appointmentDate: 'asc' }
    });

    res.json({ patient, appointments });
  } catch (err) {
    console.error('Get patient by id error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update appointment status (accept/reject) - for doctors
router.put("/:id/status", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    // Ensure doctor profile exists for role DOCTOR
    if (!req.user.doctor) {
      if (req.user.role === 'DOCTOR') {
        console.log('Auto-creating doctor profile for user (status update):', req.user.email);
        const created = await prisma.doctor.create({
          data: {
            userId: req.user.id,
            specialty: 'General physician',
            experience: 3,
            fee: 50.0,
            approved: true
          }
        });
        req.user.doctor = created;
      } else {
        return res.status(403).json({ message: "Access denied. Doctor only." });
      }
    }

    // Check if appointment belongs to this doctor
    const appointment = await prisma.appointment.findUnique({
      where: { id: parseInt(id) }
    });

    if (!appointment || appointment.doctorId !== req.user.doctor.id) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Update status
    const updatedAppointment = await prisma.appointment.update({
      where: { id: parseInt(id) },
      data: { status },
      include: {
        patient: { select: { name: true, email: true } },
        doctor: { include: { user: { select: { name: true } } } }
      }
    });

    res.json(updatedAppointment);
  } catch (err) {
    console.error("Update appointment status error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Cancel appointment (for patients)
router.put("/:id/cancel", auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if appointment belongs to this patient
    const appointment = await prisma.appointment.findUnique({
      where: { id: parseInt(id) }
    });

    if (!appointment || appointment.patientId !== req.user.id) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (appointment.status !== 'PENDING') {
      return res.status(400).json({ message: "Can only cancel pending appointments" });
    }

    // Update status to cancelled
    const updatedAppointment = await prisma.appointment.update({
      where: { id: parseInt(id) },
      data: { status: 'CANCELLED' },
      include: {
        doctor: { include: { user: { select: { name: true } } } }
      }
    });

    res.json(updatedAppointment);
  } catch (err) {
    console.error("Cancel appointment error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update doctor profile
router.put("/doctor/profile", auth, async (req, res) => {
  try {
    const { specialty, experience, fee, bio } = req.body;

    // If doctor profile does not exist, allow the doctor user to create it using provided data
    if (!req.user.doctor) {
      if (req.user.role === 'DOCTOR') {
        if (!specialty) return res.status(400).json({ message: 'Specialty is required to create a profile' });
        const created = await prisma.doctor.create({
          data: {
            userId: req.user.id,
            specialty,
            ...(experience !== undefined ? { experience: parseInt(experience) } : { experience: 0 }),
            ...(fee !== undefined ? { fee: parseFloat(fee) } : { fee: 0 }),
            ...(bio !== undefined ? { bio } : {})
          },
          include: { user: { select: { name: true, email: true } } }
        });
        return res.status(201).json(created);
      }
      return res.status(403).json({ message: "Access denied. Doctor only." });
    }

    const updatedDoctor = await prisma.doctor.update({
      where: { id: req.user.doctor.id },
      data: {
        ...(specialty !== undefined ? { specialty } : {}),
        ...(experience !== undefined ? { experience: parseInt(experience) } : {}),
        ...(fee !== undefined ? { fee: parseFloat(fee) } : {}),
        ...(bio !== undefined ? { bio } : {})
      },
      include: { user: { select: { name: true, email: true } } }
    });

    res.json(updatedDoctor);
  } catch (err) {
    console.error("Update doctor profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;