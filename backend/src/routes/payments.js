import express from "express";
import { prisma } from "../libs/prisma.js";
import auth from "../middleware/auth.js";

const router = express.Router();

const getKhaltiConfig = () => ({
  secretKey: process.env.KHALTI_SECRET_KEY,
  apiUrl: process.env.KHALTI_API_URL || "https://dev.khalti.com/api/v2",
  websiteUrl: process.env.WEBSITE_URL || process.env.FRONTEND_URL || "http://localhost:5173"
});

const isSupportedMethod = (paymentMethod) => {
  return paymentMethod === "KHALTI" || paymentMethod === "CASH";
};

const lookupKhaltiPayment = async (pidx, secretKey, apiUrl) => {
  const response = await fetch(`${apiUrl}/epayment/lookup/`, {
    method: "POST",
    headers: {
      Authorization: `Key ${secretKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ pidx })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.detail || "Khalti lookup failed");
  }

  return data;
};

const rollbackAppointmentForFailedKhalti = async (appointmentId, patientId) => {
  if (!appointmentId || !patientId) return;

  await prisma.$transaction([
    prisma.payment.deleteMany({
      where: { appointmentId: parseInt(appointmentId) }
    }),
    prisma.appointment.deleteMany({
      where: {
        id: parseInt(appointmentId),
        patientId: parseInt(patientId),
        status: "PENDING"
      }
    })
  ]);
};

// Initialize Khalti Payment
router.post("/initiate", auth, async (req, res) => {
  try {
    const { secretKey, apiUrl, websiteUrl } = getKhaltiConfig();
    const { appointmentId, paymentMethod, returnUrl } = req.body;
    const userId = req.user.id;

    if (!appointmentId) {
      return res.status(400).json({ message: "appointmentId is required" });
    }

    if (!isSupportedMethod(paymentMethod)) {
      return res.status(400).json({ message: "Payment method must be KHALTI or CASH" });
    }

    // Validate appointment exists and belongs to the user
    const appointment = await prisma.appointment.findFirst({
      where: {
        id: parseInt(appointmentId),
        patientId: userId
      },
      include: {
        doctor: {
          include: {
            user: { select: { name: true } }
          }
        },
        patient: { select: { name: true, email: true } }
      }
    });

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const amount = Number(appointment.doctor?.fee || 0);
    if (amount <= 0) {
      return res.status(400).json({ message: "Invalid doctor fee amount" });
    }

    // Check if payment already exists for this appointment
    const existingPayment = await prisma.payment.findUnique({
      where: { appointmentId: parseInt(appointmentId) }
    });

    if (existingPayment && existingPayment.paymentStatus === 'COMPLETED') {
      return res.status(400).json({ message: "Payment already completed for this appointment" });
    }

    if (paymentMethod === "CASH") {
      // For cash payment, create payment record with pending status
      const payment = await prisma.payment.upsert({
        where: { appointmentId: parseInt(appointmentId) },
        update: {
          amount: parseFloat(amount),
          paymentMethod: 'CASH',
          paymentStatus: 'PENDING'
        },
        create: {
          appointmentId: parseInt(appointmentId),
          amount: parseFloat(amount),
          paymentMethod: "CASH",
          paymentStatus: 'PENDING'
        }
      });

      return res.json({
        success: true,
        message: "Cash payment selected. Please pay at the clinic.",
        data: {
          payment,
          paymentMethod: "CASH"
        }
      });
    }

    if (!secretKey) {
      await rollbackAppointmentForFailedKhalti(appointment.id, userId);
      return res.status(500).json({ message: "KHALTI_SECRET_KEY is missing in backend env" });
    }

    const payment = await prisma.payment.upsert({
      where: { appointmentId: parseInt(appointmentId) },
      update: {
        amount: parseFloat(amount),
        paymentMethod: "KHALTI",
        paymentStatus: "PENDING",
        pidx: null,
        transactionId: null
      },
      create: {
        appointmentId: parseInt(appointmentId),
        amount: parseFloat(amount),
        paymentMethod: "KHALTI",
        paymentStatus: "PENDING"
      }
    });

    const khaltiPayload = {
      return_url: returnUrl || `${websiteUrl}/payment/verify?appointmentId=${appointment.id}`,
      website_url: websiteUrl,
      amount: Math.round(amount * 100),
      purchase_order_id: `APT-${appointment.id}`,
      purchase_order_name: `Appointment with Dr. ${appointment.doctor.user.name}`,
      customer_info: {
        name: appointment.patient.name,
        email: appointment.patient.email,
        phone: "9800000001"
      }
    };

    const khaltiResponse = await fetch(`${apiUrl}/epayment/initiate/`, {
      method: "POST",
      headers: {
        Authorization: `Key ${secretKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(khaltiPayload)
    });

    const khaltiData = await khaltiResponse.json();
    if (!khaltiResponse.ok) {
      console.error("Khalti initiate failed:", khaltiData);
      await rollbackAppointmentForFailedKhalti(appointment.id, userId);
      return res.status(400).json({
        message: "Failed to initiate Khalti payment",
        error: khaltiData
      });
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        pidx: khaltiData.pidx
      }
    });

    return res.json({
      success: true,
      data: {
        paymentUrl: khaltiData.payment_url,
        pidx: khaltiData.pidx
      }
    });

  } catch (err) {
    console.error("Payment initiation error:", err);

    const { appointmentId, paymentMethod } = req.body || {};
    if (paymentMethod === "KHALTI" && appointmentId && req.user?.id) {
      try {
        await rollbackAppointmentForFailedKhalti(appointmentId, req.user.id);
      } catch (rollbackErr) {
        console.error("Rollback after initiate error failed:", rollbackErr);
      }
    }

    res.status(500).json({ message: "Server error" });
  }
});

// Verify Khalti Payment
router.post("/verify", auth, async (req, res) => {
  try {
    const { secretKey, apiUrl } = getKhaltiConfig();
    const { pidx } = req.body;

    if (!pidx) {
      return res.status(400).json({ message: "Payment index (pidx) is required" });
    }

    if (!secretKey) {
      return res.status(500).json({ message: "KHALTI_SECRET_KEY is missing in backend env" });
    }

    const payment = await prisma.payment.findFirst({
      where: { pidx },
      include: {
        appointment: {
          select: {
            id: true,
            status: true,
            patientId: true
          }
        }
      }
    });

    if (!payment || payment.appointment.patientId !== req.user.id) {
      return res.status(404).json({ message: "Payment not found" });
    }

    if (payment.paymentStatus === "COMPLETED") {
      return res.json({
        success: true,
        message: "Payment already verified",
        data: payment
      });
    }

    const verifyData = await lookupKhaltiPayment(pidx, secretKey, apiUrl);

    // Check payment status from Khalti
    if (verifyData.status === 'Completed') {
      // Update payment record
      const updatedPayment = await prisma.payment.update({
        where: { id: payment.id },
        data: {
          paymentStatus: 'COMPLETED',
          transactionId: verifyData.transaction_id
        }
      });

      return res.json({
        success: true,
        message: "Payment verified successfully",
        data: updatedPayment
      });
    } else if (verifyData.status === 'Pending' || verifyData.status === 'Initiated') {
      return res.json({
        success: false,
        message: "Payment is not completed yet",
        status: verifyData.status
      });
    } else {
      // Payment failed or expired
      await prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            paymentStatus: 'FAILED'
          }
        });

        if (payment.appointment.status === 'PENDING') {
          await tx.payment.delete({ where: { id: payment.id } });
          await tx.appointment.delete({ where: { id: payment.appointment.id } });
        }
      });

      return res.json({
        success: false,
        message: "Payment failed, canceled, refunded, or expired. Appointment was not booked.",
        status: verifyData.status
      });
    }

  } catch (err) {
    console.error("Payment verification error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get payment status for an appointment
router.get("/status/:appointmentId", auth, async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const payment = await prisma.payment.findUnique({
      where: { appointmentId: parseInt(appointmentId) }
    });

    if (!payment) {
      return res.json({ 
        exists: false, 
        message: "No payment found for this appointment" 
      });
    }

    res.json({
      exists: true,
      payment
    });

  } catch (err) {
    console.error("Get payment status error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Mark cash payment as completed (Doctor only)
router.post("/cash-complete/:appointmentId", auth, async (req, res) => {
  try {
    if (req.user.role !== 'DOCTOR' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: "Access denied" });
    }

    const { appointmentId } = req.params;

    const payment = await prisma.payment.update({
      where: { appointmentId: parseInt(appointmentId) },
      data: {
        paymentStatus: 'COMPLETED'
      }
    });

    res.json({
      success: true,
      message: "Cash payment marked as completed",
      payment
    });

  } catch (err) {
    console.error("Cash payment completion error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
