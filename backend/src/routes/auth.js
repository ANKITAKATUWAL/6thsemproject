import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../libs/prisma.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
  try {
    console.log("Register attempt for email:", req.body.email);
    let { name, email, password } = req.body;

    // Normalize email for storage
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : email;

    // Check if user exists (case-insensitive)
    const existingUser = await prisma.user.findFirst({ where: { email: { equals: normalizedEmail, mode: 'insensitive' } } });
    if (existingUser) {
      console.log("User already exists:", normalizedEmail);
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save user with normalized email
    const newUser = await prisma.user.create({
      data: { name, email: normalizedEmail, password: hashedPassword }
    });

    // Create JWT token
    const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    console.log("User registered successfully:", email);

    // Set token in cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // set to true in production with HTTPS
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    res.status(201).json({ token, user: { id: newUser.id, name: newUser.name, email: newUser.email } });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    console.log("Login attempt for email:", req.body.email, "password length:", req.body.password?.length);
    let { email, password } = req.body;

    // Normalize email to lowercase and trim, then look up directly
    if (typeof email === 'string') email = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email },
      include: { doctor: true }
    });
    
    let finalUser = user;
    
    // If user doesn't exist, create them (for testing)
    if (!user) {
      console.log("Creating test user:", email);
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Check if this should be a doctor user
      const isDoctorUser = email.toLowerCase().includes('dr.') || email.toLowerCase().includes('doctor') || 
                          email.split('@')[0].toLowerCase().includes('dr.') || 
                          email.split('@')[0].toLowerCase().includes('richard') || 
                          email.split('@')[0].toLowerCase().includes('emily') ||
                          email.split('@')[0].toLowerCase().includes('sarah');
      
      const userRole = isDoctorUser ? 'DOCTOR' : 'PATIENT';
      
      const normalizedEmail = typeof email === 'string' ? email.toLowerCase() : email;

      finalUser = await prisma.user.create({
        data: { 
          name: email.split('@')[0], // Use part before @ as name
          email: normalizedEmail, 
          password: hashedPassword,
          role: userRole
        },
        include: { doctor: true }
      });
      
      // If this is a doctor, create the doctor profile
      if (isDoctorUser) {
        // Map common doctor names to their specialties
        const doctorSpecialties = {
          'richard': 'General physician',
          'emily': 'Gynecologist', 
          'sarah': 'Dermatologist'
        };
        
        const namePart = email.split('@')[0].toLowerCase();
        let specialty = 'General physician'; // default
        let experience = 4;
        let fee = 50;
        
        for (const [key, spec] of Object.entries(doctorSpecialties)) {
          if (namePart.includes(key)) {
            specialty = spec;
            break;
          }
        }
        
        await prisma.doctor.create({
          data: {
            userId: finalUser.id,
            specialty,
            experience,
            fee: fee.toString(),
            approved: true // Auto-approve for testing
          }
        });
        
        // Refetch user with doctor data
        finalUser = await prisma.user.findUnique({
          where: { id: finalUser.id },
          include: { doctor: true }
        });
        
        console.log("Doctor profile created for:", finalUser.email);
      }
      
      console.log("User created successfully:", finalUser.email, "Role:", userRole);
    }
    
    if (!finalUser) {
      console.log("User not found for email:", email);
      return res.status(400).json({ message: "Invalid credentials" });
    }

      // Compare password. Support legacy plaintext passwords by migrating them to hashed.
      let isMatch = false;
      if (finalUser.password) {
        try {
          isMatch = await bcrypt.compare(password, finalUser.password);
        } catch (e) {
          isMatch = false;
        }
        // If bcrypt failed and stored password equals provided password (legacy plaintext), migrate it
        if (!isMatch && finalUser.password === password) {
          try {
            const newHashed = await bcrypt.hash(password, 10);
            await prisma.user.update({ where: { id: finalUser.id }, data: { password: newHashed } });
            isMatch = true;
            console.log(`Migrated plaintext password to hashed for user: ${email}`);
          } catch (e) {
            console.error('Password migration error:', e);
          }
        }
      }

      if (!isMatch) {
        console.log("Password mismatch for user:", email);
        return res.status(400).json({ message: "Invalid credentials" });
      }

    // Create JWT token
    const token = jwt.sign({ id: finalUser.id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    console.log("Login successful for user:", email);

    // Set token in cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // set to true in production with HTTPS
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    res.json({ token, user: { id: finalUser.id, name: finalUser.name, email: finalUser.email, role: finalUser.role, doctor: finalUser.doctor } });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// LOGOUT
router.post("/logout", (req, res) => {
  console.log("Logout request");
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
});

// GET CURRENT USER
router.get("/me", auth, async (req, res) => {
  try {
    res.json({ user: req.user });
  } catch (err) {
    console.error("Get me error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// CREATE DOCTOR (for testing)
router.post("/create-doctor", auth, async (req, res) => {
  try {
    const { specialty, experience, fee } = req.body;
    const doctor = await prisma.doctor.create({
      data: {
        userId: req.user.id,
        specialty,
        experience: parseInt(experience),
        fee: parseFloat(fee)
      }
    });
    res.status(201).json(doctor);
  } catch (err) {
    console.error("Create doctor error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// CREATE ADMIN (for testing - in production, this should be restricted)
router.post("/create-admin", auth, async (req, res) => {
  try {
    // For testing purposes, allow any logged-in user to become admin
    // In production, this should only be allowed by existing admins
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { role: 'ADMIN' }
    });
    res.json({ message: "User role updated to ADMIN", user });
  } catch (err) {
    console.error("Create admin error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
