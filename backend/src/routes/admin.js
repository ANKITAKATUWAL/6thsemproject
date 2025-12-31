import express from "express";
import { prisma } from "../libs/prisma.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: "Access denied. Admin only." });
  }
  next();
};

// Get all users
router.get("/users", auth, requireAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        doctor: true
      },
      orderBy: { createdAt: "desc" }
    });
    res.json(users);
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update user role
router.put("/users/:id/role", auth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { role },
      include: { doctor: true }
    });

    res.json(user);
  } catch (err) {
    console.error("Update user role error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all appointments
router.get("/appointments", auth, requireAdmin, async (req, res) => {
  try {
    const appointments = await prisma.appointment.findMany({
      include: {
        patient: { select: { name: true, email: true } },
        doctor: { include: { user: { select: { name: true } } } }
      },
      orderBy: { createdAt: "desc" }
    });
    res.json(appointments);
  } catch (err) {
    console.error("Get appointments error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update appointment status (admin can manage any)
router.put("/appointments/:id/status", auth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const appointment = await prisma.appointment.update({
      where: { id: parseInt(id) },
      data: { status },
      include: {
        patient: { select: { name: true, email: true } },
        doctor: { include: { user: { select: { name: true } } } }
      }
    });

    res.json(appointment);
  } catch (err) {
    console.error("Update appointment status error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get system statistics
router.get("/stats", auth, requireAdmin, async (req, res) => {
  try {
    const [userCount, doctorCount, appointmentCount, pendingAppointments] = await Promise.all([
      prisma.user.count(),
      prisma.doctor.count(),
      prisma.appointment.count(),
      prisma.appointment.count({ where: { status: 'PENDING' } })
    ]);

    res.json({
      totalUsers: userCount,
      totalDoctors: doctorCount,
      totalAppointments: appointmentCount,
      pendingAppointments
    });
  } catch (err) {
    console.error("Get stats error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Create doctor (admin can create doctors for users)
router.post("/create-doctor/:userId", auth, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { specialty, experience, fee } = req.body;

    // Check if user already has a doctor profile
    const existingDoctor = await prisma.doctor.findUnique({
      where: { userId: parseInt(userId) }
    });

    if (existingDoctor) {
      return res.status(400).json({ message: "User already has a doctor profile" });
    }

    const doctor = await prisma.doctor.create({
      data: {
        userId: parseInt(userId),
        specialty,
        experience: parseInt(experience),
        fee: parseFloat(fee)
      },
      include: { user: { select: { name: true, email: true } } }
    });

    res.status(201).json(doctor);
  } catch (err) {
    console.error("Create doctor error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all doctors
router.get("/doctors", auth, requireAdmin, async (req, res) => {
  try {
    const doctors = await prisma.doctor.findMany({
      include: {
        user: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: "desc" }
    });
    res.json(doctors);
  } catch (err) {
    console.error("Get doctors error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Approve doctor
router.put("/doctors/:id/approve", auth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await prisma.doctor.update({
      where: { id: parseInt(id) },
      data: { approved: true },
      include: { user: { select: { name: true, email: true } } }
    });

    res.json(doctor);
  } catch (err) {
    console.error("Approve doctor error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Reject doctor
router.put("/doctors/:id/reject", auth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await prisma.doctor.update({
      where: { id: parseInt(id) },
      data: { approved: false },
      include: { user: { select: { name: true, email: true } } }
    });

    res.json(doctor);
  } catch (err) {
    console.error("Reject doctor error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete user
router.delete("/users/:id", auth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // First delete related appointments
    await prisma.appointment.deleteMany({
      where: { OR: [{ patientId: parseInt(id) }, { doctorId: parseInt(id) }] }
    });

    // Delete doctor profile if exists
    await prisma.doctor.deleteMany({
      where: { userId: parseInt(id) }
    });

    // Delete user
    await prisma.user.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;