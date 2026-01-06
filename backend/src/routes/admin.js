import express from "express";
import { prisma } from "../libs/prisma.js";
import auth from "../middleware/auth.js";
import { blockUser, unblockUser, isBlocked } from "../libs/blockedUsers.js";

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
    const { search } = req.query;
    const where = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    } : {};

    const users = await prisma.user.findMany({
      where,
      include: { doctor: true },
      orderBy: { createdAt: "desc" }
    });

    // annotate blocked status from in-memory store
    const annotated = users.map(u => ({ ...u, blocked: isBlocked(u.id) }));
    res.json(annotated);
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

// Block a user (in-memory)
router.put('/users/:id/block', auth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    blockUser(id);
    res.json({ message: 'User blocked' });
  } catch (err) {
    console.error('Block user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Unblock a user (in-memory)
router.put('/users/:id/unblock', auth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    unblockUser(id);
    res.json({ message: 'User unblocked' });
  } catch (err) {
    console.error('Unblock user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all appointments
router.get("/appointments", auth, requireAdmin, async (req, res) => {
  try {
    const { doctorId, date, status } = req.query;
    const where = {};

    if (doctorId) {
      where.doctorId = parseInt(doctorId);
    }

    if (status) {
      // allow comma-separated statuses
      const s = status.split(',').map(x => x.trim().toUpperCase());
      where.status = { in: s };
    }

    if (date) {
      // expect YYYY-MM-DD
      const start = new Date(date + 'T00:00:00.000Z');
      const end = new Date(date + 'T23:59:59.999Z');
      where.AND = [
        { appointmentDate: { gte: start } },
        { appointmentDate: { lte: end } }
      ];
    }

    const appointments = await prisma.appointment.findMany({
      where,
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

// Admin cancel appointment
router.put('/appointments/:id/cancel', auth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await prisma.appointment.update({
      where: { id: parseInt(id) },
      data: { status: 'CANCELLED' },
      include: {
        patient: { select: { name: true, email: true } },
        doctor: { include: { user: { select: { name: true } } } }
      }
    });

    res.json(appointment);
  } catch (err) {
    console.error('Admin cancel appointment error:', err);
    res.status(500).json({ message: 'Server error' });
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

// Edit doctor details
router.put('/doctors/:id', auth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { specialty, experience, fee, bio, approved, available } = req.body;

    const updated = await prisma.doctor.update({
      where: { id: parseInt(id) },
      data: {
        specialty: specialty !== undefined ? specialty : undefined,
        experience: experience !== undefined ? parseInt(experience) : undefined,
        fee: fee !== undefined ? parseFloat(fee) : undefined,
        // if schema doesn't have bio, this will be ignored by prisma at runtime
        ...(bio !== undefined ? { bio } : {}),
        ...(approved !== undefined ? { approved: !!approved } : {}),
        ...(available !== undefined ? { available: !!available } : {})
      },
      include: { user: { select: { name: true, email: true } } }
    });

    res.json(updated);
  } catch (err) {
    console.error('Edit doctor error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle doctor availability (admin)
router.put('/doctors/:id/availability', auth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { available } = req.body;
    const updated = await prisma.doctor.update({
      where: { id: parseInt(id) },
      data: { available: !!available },
      include: { user: { select: { name: true, email: true } } }
    });
    res.json(updated);
  } catch (err) {
    console.error('Toggle doctor availability error:', err);
    res.status(500).json({ message: 'Server error' });
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

// Delete doctor
router.delete("/doctors/:id", auth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const doctorId = parseInt(id);

    // Delete appointments for this doctor
    await prisma.appointment.deleteMany({ where: { doctorId } });

    // Delete the doctor record
    await prisma.doctor.delete({ where: { id: doctorId } });

    res.json({ message: "Doctor deleted successfully" });
  } catch (err) {
    console.error("Delete doctor error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete user
router.delete("/users/:id", auth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);

    // Find any doctor records for this user to get their doctor ids
    const doctors = await prisma.doctor.findMany({ where: { userId }, select: { id: true } });
    const doctorIds = doctors.map(d => d.id);

    // Delete appointments where this user is the patient OR where the appointment references one of this user's doctor ids
    const appointmentWhere = doctorIds.length > 0
      ? { OR: [{ patientId: userId }, { doctorId: { in: doctorIds } }] }
      : { patientId: userId };

    await prisma.appointment.deleteMany({ where: appointmentWhere });

    // Delete doctor profile(s) if exist
    if (doctorIds.length > 0) {
      await prisma.doctor.deleteMany({ where: { id: { in: doctorIds } } });
    }

    // Finally delete the user
    await prisma.user.delete({ where: { id: userId } });

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;