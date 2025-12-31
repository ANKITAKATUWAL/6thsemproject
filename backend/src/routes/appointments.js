import express from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../libs/prisma.js";
import auth from "../middleware/auth.js";

const router = express.Router();

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
      // Create a dummy user for the doctor
      const doctorUser = await prisma.user.create({
        data: {
          name: `Doctor ${doctorId}`,
          email: `doctor${doctorId}@medicare.com`,
          password: await bcrypt.hash('doctor123', 10),
          role: 'DOCTOR'
        }
      });

      // Create the doctor
      doctor = await prisma.doctor.create({
        data: {
          userId: doctorUser.id,
          specialty: 'General Physician',
          experience: 5,
          fee: 50.0,
          available: true
        }
      });
    }

    if (!doctor.available) {
      return res.status(400).json({ message: "Doctor not available" });
    }

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
    if (!req.user.doctor) {
      return res.status(403).json({ message: "Access denied. Doctor only." });
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

// Update appointment status (accept/reject) - for doctors
router.put("/:id/status", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!req.user.doctor) {
      return res.status(403).json({ message: "Access denied. Doctor only." });
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
    if (!req.user.doctor) {
      return res.status(403).json({ message: "Access denied. Doctor only." });
    }

    const { specialty, experience, fee } = req.body;

    const updatedDoctor = await prisma.doctor.update({
      where: { id: req.user.doctor.id },
      data: {
        specialty,
        experience: experience ? parseInt(experience) : undefined,
        fee: fee ? parseFloat(fee) : undefined
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