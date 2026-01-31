import express from "express";
import { prisma } from "../libs/prisma.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Khalti configuration
const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY || "live_secret_key_68791341fdd94846a146f0457ff7b455";
const KHALTI_API_URL = "https://a.khalti.com/api/v2";

// Initialize Khalti Payment
router.post("/initiate", auth, async (req, res) => {
  try {
    const { appointmentId, amount, paymentMethod } = req.body;
    const userId = req.user.id;

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

    // Check if payment already exists for this appointment
    const existingPayment = await prisma.payment.findUnique({
      where: { appointmentId: parseInt(appointmentId) }
    });

    if (existingPayment && existingPayment.paymentStatus === 'COMPLETED') {
      return res.status(400).json({ message: "Payment already completed for this appointment" });
    }

    if (paymentMethod === 'CASH') {
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
          paymentMethod: 'CASH',
          paymentStatus: 'PENDING'
        }
      });

      return res.json({
        success: true,
        message: "Cash payment selected. Please pay at the clinic.",
        payment,
        paymentMethod: 'CASH'
      });
    }

    if (paymentMethod === 'KHALTI') {
      // Khalti payment initiation
      const khaltiPayload = {
        return_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/verify`,
        website_url: process.env.FRONTEND_URL || 'http://localhost:5173',
        amount: Math.round(amount * 100), // Khalti expects amount in paisa
        purchase_order_id: `APT-${appointmentId}-${Date.now()}`,
        purchase_order_name: `Appointment with Dr. ${appointment.doctor.user.name}`,
        customer_info: {
          name: appointment.patient.name,
          email: appointment.patient.email
        }
      };

      const khaltiResponse = await fetch(`${KHALTI_API_URL}/epayment/initiate/`, {
        method: 'POST',
        headers: {
          'Authorization': `Key ${KHALTI_SECRET_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(khaltiPayload)
      });

      const khaltiData = await khaltiResponse.json();

      if (!khaltiResponse.ok) {
        console.error("Khalti error:", khaltiData);
        return res.status(400).json({ 
          message: "Failed to initiate payment", 
          error: khaltiData 
        });
      }

      // Create or update payment record
      const payment = await prisma.payment.upsert({
        where: { appointmentId: parseInt(appointmentId) },
        update: {
          amount: parseFloat(amount),
          paymentMethod: 'KHALTI',
          paymentStatus: 'PENDING',
          pidx: khaltiData.pidx
        },
        create: {
          appointmentId: parseInt(appointmentId),
          amount: parseFloat(amount),
          paymentMethod: 'KHALTI',
          paymentStatus: 'PENDING',
          pidx: khaltiData.pidx
        }
      });

      return res.json({
        success: true,
        payment_url: khaltiData.payment_url,
        pidx: khaltiData.pidx,
        payment
      });
    }

    if (paymentMethod === 'ESEWA') {
      // eSewa payment - for future implementation
      // Create payment record with pending status
      const payment = await prisma.payment.upsert({
        where: { appointmentId: parseInt(appointmentId) },
        update: {
          amount: parseFloat(amount),
          paymentMethod: 'ESEWA',
          paymentStatus: 'PENDING'
        },
        create: {
          appointmentId: parseInt(appointmentId),
          amount: parseFloat(amount),
          paymentMethod: 'ESEWA',
          paymentStatus: 'PENDING'
        }
      });

      return res.json({
        success: true,
        message: "eSewa payment coming soon. Please use Khalti or Cash for now.",
        payment,
        paymentMethod: 'ESEWA'
      });
    }

    return res.status(400).json({ message: "Invalid payment method" });

  } catch (err) {
    console.error("Payment initiation error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Verify Khalti Payment
router.post("/verify", auth, async (req, res) => {
  try {
    const { pidx, appointmentId } = req.body;

    if (!pidx) {
      return res.status(400).json({ message: "Payment index (pidx) is required" });
    }

    // Verify with Khalti
    const verifyResponse = await fetch(`${KHALTI_API_URL}/epayment/lookup/`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${KHALTI_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ pidx })
    });

    const verifyData = await verifyResponse.json();

    if (!verifyResponse.ok) {
      console.error("Khalti verification error:", verifyData);
      return res.status(400).json({ 
        message: "Payment verification failed", 
        error: verifyData 
      });
    }

    // Check payment status from Khalti
    if (verifyData.status === 'Completed') {
      // Update payment record
      const payment = await prisma.payment.update({
        where: { pidx: pidx },
        data: {
          paymentStatus: 'COMPLETED',
          transactionId: verifyData.transaction_id
        }
      });

      return res.json({
        success: true,
        message: "Payment verified successfully",
        payment,
        khaltiData: verifyData
      });
    } else if (verifyData.status === 'Pending') {
      return res.json({
        success: false,
        message: "Payment is still pending",
        status: verifyData.status
      });
    } else {
      // Payment failed or expired
      await prisma.payment.update({
        where: { pidx: pidx },
        data: {
          paymentStatus: 'FAILED'
        }
      });

      return res.json({
        success: false,
        message: "Payment failed or expired",
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
